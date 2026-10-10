#!/usr/bin/env python3
"""Seeded-defect self-test for the RedEye lane and ship-gate (T-46, REQ-REV-03).

Builds a temp provenance tree for the seeded fixture banks (in the real
content tree every bank's records live under content/provenance/<examId>/),
runs scripts/redeye-lane.py against each fixture, asserts every seed is
caught, then asserts the ship-gate's fail-closed behaviors.

Exit 0: every seed caught and every fail-closed case loud.
Exit 1: one or more failures (each printed).
"""
import importlib.util
import json
import pathlib
import sys
import tempfile

REPO = pathlib.Path(__file__).resolve().parents[3]
FIXTURES = pathlib.Path(__file__).resolve().parent / "fixtures"

LANE_PATH = REPO / "scripts" / "redeye-lane.py"
GATE_PATH = REPO / "scripts" / "redeye-gate.py"
EXAM_ID = "COMPTIA-A-1201"


def load_module(path, name):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


lane = load_module(LANE_PATH, "redeye_lane")
gate = load_module(GATE_PATH, "redeye_gate")

failures = []


def check(name, condition, detail=""):
    if condition:
        print(f"  PASS {name}")
    else:
        failures.append(name)
        print(f"  FAIL {name} {detail}")


def outcome(checks, name):
    return next((c for c in checks if c["name"] == name), None)


def setup_provenance(prov_dir):
    """C-02 records for the fixture banks; seeds inside."""
    prov_dir.mkdir(parents=True)
    fields = {
        "examId": EXAM_ID, "author": "executor", "assistance": "ai-drafted",
        "rightsBasis": "original work", "reviewer": "redeye-lane",
        "reviewDate": "", "originalityCheck": "no-exam-item-proximity",
        "status": "draft",
    }

    def rec(bank, qnum, **over):
        record = {"itemId": f"{EXAM_ID}/{bank}/{qnum}", "objectiveId": "2.3", **fields}
        record.update(over)
        path = prov_dir / f"{pathlib.Path(bank).stem}-{qnum}.json"
        path.write_text(json.dumps(record), encoding="utf-8")

    # bank-clean: four items, distinct valid objectives.
    for i, obj in enumerate(("2.3", "2.4", "2.1", "2.8"), start=1):
        rec("bank-clean.md", f"Q{i}", objectiveId=obj)
    # bank-wrong-key: valid record — the wrong key is invisible to the
    # deterministic stage on purpose (model stage's job).
    rec("bank-wrong-key.md", "Q1", objectiveId="2.1")
    # bank-biased: seed — Q1 mapped to 9.9, not in the manifest.
    for i in range(1, 11):
        rec("bank-biased.md", f"Q{i}", objectiveId="9.9" if i == 1 else "2.4")
    # bank-duplicate, bank-injection: complete records.
    rec("bank-duplicate.md", "Q1")
    rec("bank-duplicate.md", "Q2")
    rec("bank-injection.md", "Q1")


def main():
    with tempfile.TemporaryDirectory() as td:
        base = pathlib.Path(td)
        log_dir = base / "logs"
        prov_dir = base / "provenance"
        setup_provenance(prov_dir)

        def run(bank_name):
            results, errors = lane.review_bank(
                FIXTURES / bank_name, EXAM_ID, log_dir,
                provenance_dir=prov_dir, allow_model_pending=True)
            return {r["itemId"]: r["checks"] for r in results}, errors

        print("lane checks (seeded defects):")

        # Clean bank: every deterministic check passes.
        clean_results, clean_errors = run("bank-clean.md")
        check("clean bank parses without errors", not clean_errors, str(clean_errors))
        deterministic = ("mapping-check", "position-bias", "originality",
                         "provenance", "injection-screen")
        bad = [(iid, c["name"], c["outcome"]) for iid, checks in clean_results.items()
               for c in checks if c["name"] in deterministic and c["outcome"] != "pass"]
        check("clean bank: all deterministic checks pass", not bad, str(bad))

        # Seed: wrong key — deterministic stage cannot clear it; item returned.
        wrong_results, _ = run("bank-wrong-key.md")
        model = outcome(wrong_results[f"{EXAM_ID}/bank-wrong-key.md/Q1"], "key-vs-source")
        check("seeded wrong key: returned via blocked/pending model stage",
              model and model["outcome"] in ("blocked", "pending"),
              str(model))

        # Seed: mis-mapped objective.
        biased_results, _ = run("bank-biased.md")
        mapping = outcome(biased_results[f"{EXAM_ID}/bank-biased.md/Q1"], "mapping-check")
        check("seeded mis-mapped objective (9.9) caught",
              mapping and mapping["outcome"] == "fail", str(mapping))

        # Seed: biased key position — 8/10 A keys, all A items flagged.
        flagged = [iid for iid, checks in biased_results.items()
                   if outcome(checks, "position-bias")
                   and outcome(checks, "position-bias")["outcome"] == "flag"]
        check("seeded position bias: all 8 A-key items flagged", len(flagged) == 8,
              f"flagged {len(flagged)}")

        # Seed: near-duplicate pair.
        dup_results, _ = run("bank-duplicate.md")
        orig = outcome(dup_results[f"{EXAM_ID}/bank-duplicate.md/Q2"], "originality")
        check("seeded near-duplicate caught", orig and orig["outcome"] == "flag", str(orig))

        # Seed: injection payload.
        inj_results, _ = run("bank-injection.md")
        inj = outcome(inj_results[f"{EXAM_ID}/bank-injection.md/Q1"], "injection-screen")
        check("seeded injection caught", inj and inj["outcome"] == "flag", str(inj))

        # Seed: incomplete provenance.
        (prov_dir / "bank-clean-Q2.json").write_text(
            json.dumps({"itemId": f"{EXAM_ID}/bank-clean.md/Q2", "examId": EXAM_ID,
                        "objectiveId": "2.4", "author": "executor", "assistance": "ai-drafted",
                        "rightsBasis": "", "reviewer": "redeye-lane", "reviewDate": "",
                        "originalityCheck": "no-exam-item-proximity", "status": "draft"}),
            encoding="utf-8")
        prov_results, _ = run("bank-clean.md")
        prov = outcome(prov_results[f"{EXAM_ID}/bank-clean.md/Q2"], "provenance")
        check("seeded incomplete provenance caught",
              prov and prov["outcome"] == "fail", str(prov))

        # Fail-closed: every log written carries verdict 'return' — gate rejects.
        logs = list((log_dir / EXAM_ID).glob("*.json"))
        verdicts = {json.loads(p.read_text())["verdict"] for p in logs}
        stages = {json.loads(p.read_text())["modelStage"] for p in logs}
        check("all logs verdict=return (fail-closed)", verdicts == {"return"}, str(verdicts))
        check("no log claims modelStage=verified", "verified" not in stages, str(stages))

        print("ship-gate (fail-closed):")
        # Gate against the fresh logs: everything excluded, named, exit 1.
        mod = gate
        saved = (mod.LOG_ROOT, mod._repo_root)
        mod.LOG_ROOT = log_dir
        mod._repo_root = REPO
        try:
            report, excluded = mod.gate_exam(EXAM_ID)
        finally:
            (mod.LOG_ROOT, mod._repo_root) = saved
        named = [line for line in report if "EXCLUDED" in line]
        check("gate excludes items with no verified log (loud)",
              excluded > 0 and len(named) == excluded,
              f"excluded={excluded} named={len(named)}")
        check("gate names excluded items",
              any("EXCLUDED COMPTIA-A-1201/" in line for line in named),
              str(named[:2]))

        # Stale-hash rejection: edit an item's text, re-run gate with a log
        # bound to the old text.
        with tempfile.TemporaryDirectory() as td2:
            b2 = pathlib.Path(td2)
            qdir = b2 / "content" / "exams" / "EX" / "questions"
            qdir.mkdir(parents=True)
            (b2 / "content" / "exams" / "EX" / "exam.json").write_text(
                json.dumps({"examId": "EX", "sections": []}))
            (qdir / "b.md").write_text("### Q1\nPick.\n- A) x\n- B) y\n**Answer: A**\ne\n---\n")
            logs2 = b2 / "logs" / "EX"
            logs2.mkdir(parents=True)
            text1 = "### Q1\nPick.\n- A) x\n- B) y\n**Answer: A**\ne\n---\n"
            (logs2 / f"{gate.sanitize_item_id('EX/b.md/Q1')}.json").write_text(json.dumps({
                "itemId": "EX/b.md/Q1", "verdict": "pass", "modelStage": "verified",
                "boundHashes": {"itemText": gate.sha256(text1),
                                "manifest": gate.sha256("{}"),
                                "config": gate.sha256("{}")}}))
            saved = (mod.LOG_ROOT, mod._repo_root)
            mod.LOG_ROOT, mod._repo_root = b2 / "logs", b2
            try:
                report, excluded = mod.gate_exam("EX")
            finally:
                (mod.LOG_ROOT, mod._repo_root) = saved
            check("stale item hash excluded and named",
                  excluded == 1 and any("stale log" in line for line in report),
                  str(report))

    print()
    if failures:
        print(f"SELF-TEST: FAIL — {len(failures)} case(s): {', '.join(failures)}",
              file=sys.stderr)
        sys.exit(1)
    print("SELF-TEST: PASS — every seed caught; ship-gate fail-closed and loud")


if __name__ == "__main__":
    main()
