#!/usr/bin/env python3
"""RedEye lane runner — deterministic per-item review checks (T-46, SPEC-08A).

Every scored item must pass the RedEye lane with a written per-item log
before it can enter a released pack (REQ-REV-01). This runner executes the
deterministic checks and FAILS CLOSED on the model-backed stage: key-vs-source
verification belongs to the radredeye pipeline integration, which is not wired
in this sprint, so every item's verdict is "return" with modelStage=pending
until that integration lands (REQ-REV-05 — no silent fallback, no
self-exemption).

Checks per item:
  mapping-check      objectiveId exists in the exam manifest (deterministic)
  position-bias      per-bank answer-letter concentration (deterministic)
  originality        near-duplicate screen vs sibling items (deterministic)
  provenance         C-02 record present and complete (deterministic)
  injection-screen   instruction patterns in item text (deterministic)
  key-vs-source      MODEL STAGE — blocked: model provider not configured

A log's verdict is "pass" only when the model stage verified the key AND every
check above passed; any failed check, flag or blocked stage makes it "return".

Logs are written to content/review-logs/<examId>/<sanitized-itemId>.json with
hashes binding the item text, exam manifest and reviewer config (REQ-REV-02);
any bound input change invalidates the log and scripts/redeye-gate.py will
exclude the item.

Usage:
  python3 scripts/redeye-lane.py content/exams/COMPTIA-A-1201/questions/core1-demo-cut.md
  python3 scripts/redeye-lane.py --exam COMPTIA-A-1201            # all banks of the exam
  python3 scripts/redeye-lane.py bank.md --allow-model-pending    # self-test aid only

Explicit paths take precedence over --exam, and --exam supplies the examId for
them. That is how the legacy root banks are reviewed: NCA-75's 140 items stay in
NCA-75-Part{1,2,3-GapFill}.md at the repository root (SPEC-06: remapped bank
items stay in their original files), so they are not under
content/exams/<examId>/questions and cannot be inferred:

  python3 scripts/redeye-lane.py --exam NCA-75 NCA-75-Part1.md NCA-75-Part2.md NCA-75-Part3-GapFill.md

An OPT-IN source stage can check the key against supplied PDFs instead of the
model's memory alone (REQ-REV-01a). It is fail-closed: absent the flag it does
not run, and any doubt while it runs blocks the item:

  python3 scripts/redeye-lane.py --exam NCA-75 --config scripts/redeye-config.local.json \
      --source-config scripts/redeye-source.local.json nca75-bank.md

--allow-model-pending exists ONLY so the seeded-defect self-test can exercise
the deterministic checks; it does not make an item releasable — the gate
rejects any log whose modelStage is not "verified".

Exit codes:
  0 — logs written (verdicts may still be "return")
  1 — lane failed (unreadable inputs, parse mismatch, provenance dir missing)
  2 — self-test assertion failed (--self-test)
"""
import argparse
import collections
import json
import pathlib
import re
import sys
from datetime import datetime, timezone

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent

LANE_VERSION = "redeye-lane/0.1.0-deterministic-skeleton"
TOOL = "redeye-lane"
CONFIG_PATH = REPO_ROOT / "scripts" / "redeye-config.json"

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))

from redeye_lane_selftest import self_test  # noqa: E402
from redeye_model_stage import model_stage_config, verify_key_with_model  # noqa: E402
from redeye_source_stage import source_stage_config, verify_key_with_source  # noqa: E402
from redeye_analysis import (  # noqa: E402
    CONCENTRATION_THRESHOLD,
    DUPLICATE_THRESHOLD,
    bank_position_stats,
    check_injection,
    check_provenance,
    collect_exam_banks,
    infer_exam_id,
    item_id_for,
    load_manifest_objective_ids,
    load_provenance,
    ngrams,
    overlap_ratio,
    parse_bank,
    sanitize_item_id,
    sha256,
)




def load_config(path=None):
    path = pathlib.Path(path) if path else CONFIG_PATH
    if not path.is_file():
        sys.exit(f"lane config missing: {path}")
    return path.read_text(encoding="utf-8")


def verdict_for(stage, checks):
    """The log's verdict: 'pass' only when the model verified the key AND every
    deterministic check passed.

    It used to be the model stage's opinion alone, so an item whose mapping and
    provenance checks had failed still carried `verdict: pass` — and the ship
    gate, which reads the verdict, released it. That is the false green this
    lane exists to prevent, found by running the lane over NCA-75's legacy root
    banks, whose items have no provenance records: key-vs-source agreed while
    `mapping-check` and `provenance` failed, and the gate would have accepted
    them. `flag` is not `pass` either: a flagged item needs a recorded
    disposition (a permuted key, corrected text), not a release.
    """
    if stage != "verified":
        return "return"
    return "pass" if all(c.get("outcome") == "pass" for c in checks) else "return"


def write_log(log_dir, exam_id, item_id, checks, model_stage, verdict,
              manifest_hash, config_hash, item_text_hash, run_date,
              source_hash=None):
    out_dir = pathlib.Path(log_dir) / exam_id
    out_dir.mkdir(parents=True, exist_ok=True)
    log = {
        "itemId": item_id,
        "examId": exam_id,
        "laneVersion": LANE_VERSION,
        "reviewedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "modelStage": model_stage,
        "verdict": verdict,
        "checks": checks,
        "boundHashes": {
            "itemText": item_text_hash,
            "manifest": manifest_hash,
            "config": config_hash,
            **({"sourceConfig": source_hash} if source_hash else {}),
        },
    }
    path = out_dir / f"{sanitize_item_id(item_id)}.json"
    path.write_text(json.dumps(log, indent=2) + "\n", encoding="utf-8")
    return path


def review_bank(bank_path, exam_id, log_dir, provenance_dir=None, allow_model_pending=False,
                run_date=None, config_path=None, limit=None,
                source=None, source_hash=None):
    """Run all checks over one bank. Returns (per-item results, fatal errors).

    `run_date` (YYYY-MM-DD) is what the lane records on the provenance record
    it stamps (SPEC-20). It is passed in, never the wall clock, so a log and
    its provenance stamp always agree.
    """
    run_date = run_date or datetime.now(timezone.utc).date().isoformat()
    manifest_path, objective_ids = load_manifest_objective_ids(exam_id)
    manifest_hash = sha256(manifest_path.read_text(encoding="utf-8"))
    config_text = load_config(config_path)
    config_hash = sha256(config_text)
    model = model_stage_config(config_text)

    items = parse_bank(bank_path)
    if limit:
        items = items[:limit]
    errors = []
    if not items:
        errors.append(f"{bank_path.name}: no questions parsed")
        return [], errors
    for item in items:
        if not item["keys"]:
            errors.append(f"{bank_path.name}:{item['number']}: no parsable answer line")

    shares, dominant_letter, dominant_share, single_total = bank_position_stats(items)

    # Precompute n-grams for the duplicate screen: the bank under review plus
    # every sibling bank of the same exam (resolved by examId, not by path, so
    # fixtures outside the repo tree still compare against themselves).
    sibling_ngrams = collections.defaultdict(list)  # item_id -> [ngram sets]
    siblings = [bank_path] + [p for p in collect_exam_banks(exam_id)
                              if p.resolve() != bank_path.resolve()]
    for other in siblings:
        for item in parse_bank(other):
            sibling_ngrams[item_id_for(exam_id, other, item["number"])].append(
                ngrams(item["text"]))

    results = []
    for item in items:
        item_id = item_id_for(exam_id, bank_path, item["number"])
        checks = []

        # mapping-check (deterministic, REQ-REV-01b)
        record, prov_path = load_provenance(exam_id, item_id, provenance_dir)
        objective_id = (record or {}).get("objectiveId", "")
        if not objective_id:
            checks.append({"name": "mapping-check", "outcome": "fail",
                           "detail": "no objectiveId (missing/empty provenance)"})
        elif objective_id not in objective_ids:
            checks.append({"name": "mapping-check", "outcome": "fail",
                           "detail": f"objectiveId {objective_id!r} not in exam manifest"})
        else:
            checks.append({"name": "mapping-check", "outcome": "pass",
                           "detail": f"objectiveId {objective_id} in manifest"})

        # position-bias (deterministic, REQ-REV-01c; feeds R-09)
        if single_total and len(item["keys"]) == 1 and item["keys"][0] == dominant_letter \
                and dominant_share > CONCENTRATION_THRESHOLD:
            checks.append({"name": "position-bias", "outcome": "flag",
                           "detail": f"key {dominant_letter} is the dominant letter at "
                                     f"{dominant_share:.0%} of {single_total} single keys "
                                     f"(threshold {CONCENTRATION_THRESHOLD:.0%})"})
        else:
            checks.append({"name": "position-bias", "outcome": "pass",
                           "detail": f"bank dominant {dominant_letter} at "
                                     f"{dominant_share:.0%} of {single_total} single keys"})

        # originality screen (deterministic, REQ-REV-01d)
        own = ngrams(item["text"])
        worst_id, worst_ratio = None, 0.0
        for other_id, gram_list in sibling_ngrams.items():
            if other_id == item_id:
                continue
            for grams in gram_list:
                ratio = overlap_ratio(own, grams)
                if ratio > worst_ratio:
                    worst_id, worst_ratio = other_id, ratio
        if worst_ratio > DUPLICATE_THRESHOLD:
            checks.append({"name": "originality", "outcome": "flag",
                           "detail": f"near-duplicate of {worst_id} "
                                     f"({worst_ratio:.0%} 5-gram overlap, threshold "
                                     f"{DUPLICATE_THRESHOLD:.0%})"})
        else:
            checks.append({"name": "originality", "outcome": "pass",
                           "detail": f"max sibling overlap {worst_ratio:.0%}"})

        # provenance completeness (deterministic, REQ-REV-04)
        prov_fail = check_provenance(record, item_id)
        if prov_fail:
            checks.append({"name": "provenance", "outcome": "fail", "detail": prov_fail})
        else:
            checks.append({"name": "provenance", "outcome": "pass",
                           "detail": "complete record"})
        # SPEC-20: the lane stamps what it ran on, and nothing about who read it.
        if record is not None and prov_path is not None \
                and str(record.get("reviewer", "")).strip() != TOOL:
            record["automatedReview"] = f"{TOOL}:{run_date}"
            prov_path.write_text(json.dumps(record, indent=2) + "\n", encoding="utf-8")

        # injection screen (deterministic, REQ-REV-06)
        hits = check_injection(item["text"])
        if hits:
            checks.append({"name": "injection-screen", "outcome": "flag",
                           "detail": f"instruction-shaped text: {hits[0]}"})
        else:
            checks.append({"name": "injection-screen", "outcome": "pass", "detail": "no hits"})

        # key-vs-source (MODEL STAGE, REQ-REV-01a — fail-closed, REQ-REV-05)
        stage, verdict = "blocked", "return"
        if allow_model_pending:
            model_outcome, model_detail = "pending", (
                "model stage skipped by --allow-model-pending (self-test aid only); "
                "log is NOT a release pass")
            stage = "pending"
        elif model:
            try:
                agree, reason = verify_key_with_model(item, model)
            except Exception as exc:  # noqa: BLE001 — any doubt is a blocked stage
                model_outcome, model_detail = "blocked", f"model stage failed: {exc}"
            else:
                stage = "verified"
                if agree:
                    model_outcome = "pass"
                else:
                    model_outcome = "fail"
                model_detail = reason or ("model agreed" if agree else "model disagreed")
        else:
            model_outcome, model_detail = "blocked", "model provider not configured"
        checks.append({"name": "key-vs-source", "outcome": model_outcome, "detail": model_detail})

        # source-support (OPT-IN, REQ-REV-01a): the keyed answer checked against
        # rendered pages of a supplied document. Absent unless --source-config
        # names one; any doubt blocks the stage rather than passing it.
        if source and model:
            try:
                s_agree, s_reason = verify_key_with_source(item, model, source)
            except Exception as exc:  # noqa: BLE001 — any doubt is a blocked stage
                checks.append({"name": "source-support", "outcome": "blocked",
                               "detail": f"source stage failed: {exc}"})
            else:
                checks.append({"name": "source-support",
                               "outcome": "pass" if s_agree else "fail",
                               "detail": s_reason or ("source agreed" if s_agree
                                                      else "source disagreed")})
        elif source:
            checks.append({"name": "source-support", "outcome": "blocked",
                           "detail": "source documents configured but no model endpoint"})

        # The verdict is the whole log's opinion, not the model stage's alone:
        # a failed deterministic check must not release on a verified key.
        verdict = verdict_for(stage, checks)

        write_log(log_dir, exam_id, item_id, checks, stage, verdict,
                  manifest_hash, config_hash, sha256(item["text"]), run_date,
                  source_hash)
        results.append({"itemId": item_id, "checks": checks})

    return results, errors



def main():
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("paths", nargs="*", help="question bank .md files")
    parser.add_argument("--exam", help="review every bank under content/exams/<examId>/questions")
    parser.add_argument("--provenance-dir", help="override provenance directory")
    parser.add_argument("--log-dir", default=str(REPO_ROOT / "content" / "review-logs"),
                        help="review log output directory")
    parser.add_argument("--allow-model-pending", action="store_true",
                        help="SELF-TEST AID ONLY: mark the model stage pending instead of "
                             "blocked; the item still is not releasable")
    parser.add_argument("--config", help="lane config path (default: scripts/redeye-config.json)")
    parser.add_argument("--source-config",
                        help="opt-in source-stage config (documents + pinned hashes); "
                             "absent means no source check runs")
    parser.add_argument("--limit", type=int, help="review only the first N items of each bank")
    parser.add_argument("--self-test", action="store_true",
                        help="run seeded-defect fixture assertions and exit")
    args = parser.parse_args()

    if args.self_test:
        sys.exit(self_test(review_bank, verdict_for))

    # Explicit paths win; --exam then only supplies the examId for them (legacy
    # root banks have no manifest above them to infer from).
    if args.paths:
        bank_paths = [pathlib.Path(p) for p in args.paths]
    elif args.exam:
        bank_paths = collect_exam_banks(args.exam)
    else:
        parser.error("give bank paths or --exam")
        return

    fatal = []
    source, source_hash = None, None
    if args.source_config:
        # Asked for, so it must work: an unusable source config is a lane
        # failure, never a run that quietly reviews without it.
        try:
            source_text = load_config(args.source_config)
        except SystemExit:
            print(f"❌ source config missing: {args.source_config}", file=sys.stderr)
            sys.exit(1)
        source = source_stage_config(source_text)
        if not source:
            print(f"❌ source config names no usable documents: {args.source_config}",
                  file=sys.stderr)
            sys.exit(1)
        source_hash = sha256(source_text)
        print(f"source stage: {len(source['documents'])} document(s)")

    for bank in bank_paths:
        exam_id = args.exam or infer_exam_id(bank)
        if not exam_id:
            fatal.append(f"{bank}: cannot infer examId (pass --exam)")
            continue
        _, errors = review_bank(bank, exam_id, args.log_dir,
                                provenance_dir=args.provenance_dir,
                                allow_model_pending=args.allow_model_pending,
                                config_path=args.config, limit=args.limit,
                                source=source, source_hash=source_hash)
        fatal.extend(errors)

    written = sum(1 for p in pathlib.Path(args.log_dir).rglob("*.json"))
    if fatal:
        print("❌ LANE ERRORS:", file=sys.stderr)
        for e in fatal:
            print(f"  {e}", file=sys.stderr)
        sys.exit(1)

    verified = 0
    for path in pathlib.Path(args.log_dir).rglob("*.json"):
        try:
            if json.loads(path.read_text(encoding="utf-8")).get("modelStage") == "verified":
                verified += 1
        except Exception:
            continue
    print(f"✅ lane run complete: {len(bank_paths)} bank(s), {written} log(s) written "
          f"to {args.log_dir}")
    if verified:
        print(f"   {verified} item(s) verified by the model stage; the rest stay "
              f"fail-closed (REQ-REV-05)")
    else:
        print("   every verdict is 'return' — the model stage is not integrated "
              "(fail-closed, REQ-REV-05)")






if __name__ == "__main__":
    main()
