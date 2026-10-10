#!/usr/bin/env python3
"""RedEye ship-gate — no scored item releases without a current passing log.

REQ-REV-02: an item enters a released pack only with a passing RedEye log
bound to the CURRENT item text, manifest and reviewer config. Any bound
input change invalidates the log. This gate refuses every item that has no
log, a stale hash, a "return" verdict or a modelStage that is not
"verified" — and it NAMES every exclusion in the report (fail-closed,
REQ-REV-05: there is no silent fallback to unreviewed release).

Until the radredeye model-stage integration lands, every lane log carries
modelStage "pending" or "blocked", so the gate correctly excludes 100% of
items — that is the designed, honest state, not a bug.

Usage:
  python3 scripts/redeye-gate.py COMPTIA-A-1201
  python3 scripts/redeye-gate.py --all

Exit codes:
  0 — every scored item has a current passing verified log
  1 — one or more items excluded (report names them)
  2 — self-test assertion failed (--self-test)
"""
import argparse
import hashlib
import json
import pathlib
import re
import sys

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent

QUESTION_HEADER = re.compile(r"^###\s+(Q\d+)", re.MULTILINE)
# Must mirror redeye-lane.py — same binding regex, same hashes.
ANSWER_LINE = re.compile(
    r"^\*\*(?:Correct )?Answer:\s*([A-F](?:\s*(?:,|and|&)?\s*[A-F])*)\s*\*\*",
    re.MULTILINE,
)

CONFIG_PATH = REPO_ROOT / "scripts" / "redeye-config.json"
LOG_ROOT = REPO_ROOT / "content" / "review-logs"

# Overridable in tests so fixture exams/logs can live in a temp dir.
_repo_root = REPO_ROOT


def sha256(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def sanitize_item_id(item_id):
    return re.sub(r"[^A-Za-z0-9._-]+", "_", item_id)


def parse_items(bank_path):
    """[(item_id, item_text)] — mirrors redeye-lane.parse_bank's slicing."""
    content = bank_path.read_text(encoding="utf-8")
    headers = list(QUESTION_HEADER.finditer(content))
    exam_id = bank_path.parent.parent.name
    items = []
    for i, match in enumerate(headers):
        start = match.start()
        end = headers[i + 1].start() if i + 1 < len(headers) else len(content)
        text = content[start:end]
        items.append((f"{exam_id}/{bank_path.name}/{match.group(1)}", text))
    return items


def load_log(item_id):
    """Logs live at content/review-logs/<examId>/<sanitized-full-itemId>.json."""
    exam_id = item_id.split("/")[0]
    path = LOG_ROOT / exam_id / f"{sanitize_item_id(item_id)}.json"
    if not path.is_file():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return "corrupt"


def gate_exam(exam_id):
    """Return (report_lines, excluded_count) for one exam's scored packs."""
    questions_dir = _repo_root / "content" / "exams" / exam_id / "questions"
    report = [f"== {exam_id} =="]
    excluded = 0
    if not questions_dir.is_dir():
        return report + ["  (no questions dir — nothing gated)"], 0

    manifest_path = _repo_root / "content" / "exams" / exam_id / "exam.json"
    manifest_hash = sha256(manifest_path.read_text(encoding="utf-8")) \
        if manifest_path.is_file() else None
    config_hash = sha256(CONFIG_PATH.read_text(encoding="utf-8")) \
        if CONFIG_PATH.is_file() else None

    for bank in sorted(questions_dir.glob("*.md")):
        for item_id, text in parse_items(bank):
            log = load_log(item_id)
            item_hash = sha256(text)
            if log is None:
                report.append(f"  EXCLUDED {item_id}: no review log")
                excluded += 1
                continue
            if log == "corrupt":
                report.append(f"  EXCLUDED {item_id}: corrupt review log")
                excluded += 1
                continue
            bound = log.get("boundHashes", {})
            if bound.get("itemText") != item_hash:
                report.append(f"  EXCLUDED {item_id}: stale log (item text changed since review)")
                excluded += 1
                continue
            if manifest_hash is not None and bound.get("manifest") != manifest_hash:
                report.append(f"  EXCLUDED {item_id}: stale log (manifest changed since review)")
                excluded += 1
                continue
            if config_hash is not None and bound.get("config") != config_hash:
                report.append(f"  EXCLUDED {item_id}: stale log (reviewer config changed since review)")
                excluded += 1
                continue
            if log.get("verdict") != "pass":
                report.append(f"  EXCLUDED {item_id}: verdict is {log.get('verdict')!r}")
                excluded += 1
                continue
            if log.get("modelStage") != "verified":
                report.append(f"  EXCLUDED {item_id}: modelStage is "
                              f"{log.get('modelStage')!r} (key-vs-source not verified)")
                excluded += 1
                continue
            report.append(f"  ok       {item_id}")
    return report, excluded


def main():
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("exams", nargs="*", help="exam IDs (content/exams/<id>/)")
    parser.add_argument("--all", action="store_true", help="gate every exam under content/exams/")
    parser.add_argument("--log-root", help="override review-log root (tests)")
    parser.add_argument("--repo-root", help="override repo root (tests)")
    parser.add_argument("--self-test", action="store_true",
                        help="run fail-closed fixture assertions and exit")
    args = parser.parse_args()

    if args.self_test:
        sys.exit(self_test())

    global LOG_ROOT
    if args.log_root:
        LOG_ROOT = pathlib.Path(args.log_root)
    if args.repo_root:
        globals()["_repo_root"] = pathlib.Path(args.repo_root)

    exam_ids = args.exams
    if args.all:
        exam_ids = sorted(p.name for p in (REPO_ROOT / "content" / "exams").iterdir()
                          if p.is_dir())
    if not exam_ids:
        parser.error("give exam IDs or --all")
        return

    total_excluded = 0
    for exam_id in exam_ids:
        report, excluded = gate_exam(exam_id)
        for line in report:
            print(line)
        total_excluded += excluded

    if total_excluded:
        print(f"\n❌ GATE FAILURE: {total_excluded} item(s) excluded — nothing releases "
              f"without a current passing verified log (REQ-REV-02/05)", file=sys.stderr)
        sys.exit(1)

    print(f"\n✅ GATE PASS: every scored item carries a current passing verified log.")


def self_test():
    """Fail-closed fixtures (REQ-REV-05): missing logs, pending stage, stale
    hash, corrupt log each exclude the item; the gate names it and exits 1.
    A fully-verified current log set passes."""
    import tempfile

    failures = []
    with tempfile.TemporaryDirectory() as td:
        base = pathlib.Path(td)

        def write_exam(exam_id, banks):
            qdir = base / "content" / "exams" / exam_id / "questions"
            qdir.mkdir(parents=True)
            (base / "content" / "exams" / exam_id / "exam.json").write_text(
                json.dumps({"examId": exam_id, "sections": []}), encoding="utf-8")
            for name, body in banks.items():
                (qdir / name).write_text(body, encoding="utf-8")

        bank_body = (
            "### Q1\nWhich port is HTTPS?\n- A) 80\n- B) 443\n- C) 53\n- D) 21\n"
            "**Answer: B**\nHTTPS uses TCP port 443.\n---\n"
            "### Q2\nWhich service resolves names?\n- A) DNS\n- B) DHCP\n- C) ARP\n- D) SNMP\n"
            "**Answer: A**\nDNS resolves names.\n---\n")
        write_exam("EXAM-TEST", {"bank.md": bank_body})

        real_items = dict(parse_items(
            base / "content" / "exams" / "EXAM-TEST" / "questions" / "bank.md"))
        real_manifest = sha256((base / "content" / "exams" / "EXAM-TEST" / "exam.json")
                               .read_text(encoding="utf-8"))

        def log_for(item_id, verdict="pass", model_stage="verified",
                    item_hash=None, manifest_hash=None, config_hash=None):
            # Defaults bind to the CURRENT fixture inputs so each case isolates
            # exactly one defect.
            return {
                "itemId": item_id, "examId": "EXAM-TEST",
                "verdict": verdict, "modelStage": model_stage,
                "boundHashes": {
                    "itemText": item_hash or sha256(real_items[item_id]),
                    "manifest": manifest_hash or real_manifest,
                    "config": config_hash or sha256(
                        sys.modules[__name__].CONFIG_PATH.read_text(encoding="utf-8")),
                },
            }

        def run_gate(log_root):
            import contextlib, io
            buf_out, buf_err = io.StringIO(), io.StringIO()
            mod = sys.modules[__name__]
            saved_log, saved_repo = mod.LOG_ROOT, mod._repo_root
            mod.LOG_ROOT = pathlib.Path(log_root)
            mod._repo_root = base
            try:
                with contextlib.redirect_stdout(buf_out), contextlib.redirect_stderr(buf_err):
                    try:
                        rc = gate_and_exit("EXAM-TEST")
                    except SystemExit as e:
                        rc = e.code if isinstance(e.code, int) else 1
            finally:
                mod.LOG_ROOT, mod._repo_root = saved_log, saved_repo
            return rc, buf_out.getvalue() + buf_err.getvalue()

        def gate_and_exit(exam_id):
            report, excluded = gate_exam(exam_id)
            for line in report:
                print(line)
            if excluded:
                print(f"\n❌ GATE FAILURE: {excluded} item(s) excluded — nothing releases "
                      f"without a current passing verified log (REQ-REV-02/05)",
                      file=sys.stderr)
                return 1
            print("\n✅ GATE PASS: every scored item carries a current passing verified log.")
            return 0

        # Case 1: no log dir at all — everything excluded, loud exit.
        rc, out = run_gate(base / "logs-absent")
        if rc != 1 or "EXCLUDED EXAM-TEST/bank.md/Q1: no review log" not in out \
                or "EXCLUDED EXAM-TEST/bank.md/Q2" not in out:
            failures.append(f"case missing-logs: rc={rc} output did not name both items")

        # Case 2: logs exist with modelStage=pending — excluded.
        lr = base / "logs-pending" / "EXAM-TEST"
        lr.mkdir(parents=True)
        (lr / f"{sanitize_item_id('EXAM-TEST/bank.md/Q1')}.json").write_text(
            json.dumps(log_for("EXAM-TEST/bank.md/Q1", model_stage="pending")))
        rc, out = run_gate(base / "logs-pending")
        if rc != 1 or "modelStage" not in out:
            failures.append(f"case pending-stage: rc={rc} output={out[:200]}")

        # Case 3: stale item hash — excluded and named.
        lr = base / "logs-stale" / "EXAM-TEST"
        lr.mkdir(parents=True)
        (lr / f"{sanitize_item_id('EXAM-TEST/bank.md/Q1')}.json").write_text(
            json.dumps(log_for("EXAM-TEST/bank.md/Q1", item_hash="oldhash")))
        rc, out = run_gate(base / "logs-stale")
        if rc != 1 or "stale log (item text changed" not in out:
            failures.append(f"case stale-hash: rc={rc} output={out[:200]}")

        # Case 4: corrupt log — excluded.
        lr = base / "logs-corrupt" / "EXAM-TEST"
        lr.mkdir(parents=True)
        (lr / f"{sanitize_item_id('EXAM-TEST/bank.md/Q1')}.json").write_text("{not json")
        rc, out = run_gate(base / "logs-corrupt")
        if rc != 1 or "corrupt review log" not in out:
            failures.append(f"case corrupt-log: rc={rc} output={out[:200]}")

        # Case 5: verdict=return — excluded.
        lr = base / "logs-return" / "EXAM-TEST"
        lr.mkdir(parents=True)
        (lr / f"{sanitize_item_id('EXAM-TEST/bank.md/Q1')}.json").write_text(
            json.dumps(log_for("EXAM-TEST/bank.md/Q1", verdict="return")))
        rc, out = run_gate(base / "logs-return")
        if rc != 1 or "verdict is 'return'" not in out:
            failures.append(f"case return-verdict: rc={rc} output={out[:200]}")

        # Case 6: fully verified current logs for BOTH items — pass, exit 0.
        lr = base / "logs-good" / "EXAM-TEST"
        lr.mkdir(parents=True)
        for iid in real_items:
            (lr / f"{sanitize_item_id(iid)}.json").write_text(json.dumps(log_for(iid)))
        rc, out = run_gate(base / "logs-good")
        if rc != 0 or "GATE PASS" not in out:
            failures.append(f"case all-verified: rc={rc} output={out[:300]}")

    if failures:
        for f in failures:
            print(f"SELF-TEST FAILURE: {f}", file=sys.stderr)
        return 2
    print("redeye-gate self-test: fail-closed on missing/pending/stale/corrupt/return; "
          "verified-current logs pass")
    return 0


if __name__ == "__main__":
    main()
