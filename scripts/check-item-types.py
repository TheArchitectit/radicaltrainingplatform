#!/usr/bin/env python3
"""REQ-AP-06 — diagnosis/recall mix gate for scored item packs.

At least 50% of scored items must be next-action/diagnosis items. The type
lives in each item's provenance record (the per-item front matter that also
carries objectiveId/reviewer): `"type": "diagnosis"` or `"type": "recall"`.

CI counts diagnosis vs recall across every scored item under content/exams
and fails below 50%, naming the deficit. Items with a missing or unknown
type count against the diagnosis share (fail-closed — an untyped item is not
quietly treated as diagnosis).

Usage:
  python3 scripts/check-item-types.py
  python3 scripts/check-item-types.py --self-test

Exit codes:
  0 — diagnosis share >= 50%
  1 — below threshold, or a scored item has no valid type
  2 — self-test assertion failed (--self-test)
"""
import argparse
import json
import pathlib
import re
import sys
import tempfile

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent
CONTENT = REPO_ROOT / "content"
QUESTION_HEADER = re.compile(r"^###\s+(Q\d+)", re.MULTILINE)
VALID_TYPES = ("diagnosis", "recall")
THRESHOLD = 0.50


def scored_item_numbers(bank_path):
    content = bank_path.read_text(encoding="utf-8")
    return [m.group(1) for m in QUESTION_HEADER.finditer(content)]


def collect_counts(content_root):
    """[(exam_id, item_id, type_or_None)] for every scored item."""
    rows = []
    exams_tree = content_root / "exams"
    if not exams_tree.is_dir():
        return rows
    for exam_dir in sorted(p for p in exams_tree.iterdir() if p.is_dir()):
        questions = exam_dir / "questions"
        if not questions.is_dir():
            continue
        exam_id = exam_dir.name
        for bank in sorted(questions.glob("*.md")):
            for number in scored_item_numbers(bank):
                item_id = f"{exam_id}/{bank.name}/{number}"
                prov_path = content_root / "provenance" / exam_id / f"{number}.json"
                typ = None
                if prov_path.is_file():
                    try:
                        prov = json.loads(prov_path.read_text(encoding="utf-8"))
                    except json.JSONDecodeError:
                        prov = {}
                    if prov.get("itemId") == item_id:
                        raw = prov.get("type")
                        typ = raw if raw in VALID_TYPES else None
                rows.append((exam_id, item_id, typ))
    return rows


def evaluate(rows):
    total = len(rows)
    diagnosis = sum(1 for _, _, t in rows if t == "diagnosis")
    recall = sum(1 for _, _, t in rows if t == "recall")
    untyped = total - diagnosis - recall
    share = (diagnosis / total) if total else 0.0
    return {
        "total": total,
        "diagnosis": diagnosis,
        "recall": recall,
        "untyped": untyped,
        "share": share,
        "ok": total > 0 and untyped == 0 and share >= THRESHOLD,
    }


def report(stats, rows):
    lines = [
        f"item types: {stats['total']} scored — "
        f"{stats['diagnosis']} diagnosis, {stats['recall']} recall, "
        f"{stats['untyped']} untyped "
        f"(diagnosis share {100 * stats['share']:.0f}%, threshold {100 * THRESHOLD:.0f}%)"
    ]
    if stats["untyped"]:
        lines.append("untyped or invalid typed items (fail-closed, not counted as diagnosis):")
        for exam_id, item_id, typ in rows:
            if typ is None:
                lines.append(f"  {item_id} (exam {exam_id}, type={typ!r})")
    if stats["total"] and stats["share"] < THRESHOLD:
        deficit = THRESHOLD * stats["total"] - stats["diagnosis"]
        import math
        lines.append(
            f"deficit: need at least {math.ceil(THRESHOLD * stats['total'])} diagnosis items, "
            f"have {stats['diagnosis']} (short by {math.ceil(deficit)})"
        )
    return "\n".join(lines)


def run_self_test() -> int:
    failures = []

    def check(name, cond, detail=""):
        if not cond:
            failures.append(f"{name}: {detail}")

    with tempfile.TemporaryDirectory() as td:
        base = pathlib.Path(td)

        def reset():
            exams = base / "exams"
            prov = base / "provenance"
            for d in (exams, prov):
                if d.exists():
                    import shutil
                    shutil.rmtree(d)

        def write(exam, bank, items):
            qdir = base / "exams" / exam / "questions"
            pdir = base / "provenance" / exam
            qdir.mkdir(parents=True, exist_ok=True)
            pdir.mkdir(parents=True, exist_ok=True)
            body = f"# {exam} bank\n\n## Domain 1: Test\n\n"
            for num, typ in items:
                body += f"### Q{num}\nstem {num}\n- A) x\n- B) y\n**Answer: A**\nexpl\n\n---\n\n"
                (pdir / f"Q{num}.json").write_text(json.dumps({
                    "itemId": f"{exam}/{bank}/Q{num}",
                    "examId": exam,
                    "objectiveId": "1.1",
                    "type": typ,
                }), encoding="utf-8")
            (qdir / bank).write_text(body, encoding="utf-8")

        # Passing side: 30 diagnosis / 30 recall — share 50%, must pass.
        reset()
        write("PASS", "bank.md", [(i, "diagnosis") for i in range(1, 31)]
              + [(i, "recall") for i in range(31, 61)])
        stats = evaluate(collect_counts(base))
        check("30/30 split passes", stats["ok"], report(stats, []))
        check("30/30 share is 50%", abs(stats["share"] - 0.5) < 1e-9, str(stats))

        # Failing side: 29 diagnosis / 31 recall — 29 diagnosis must fail
        # naming the deficit (REQ-AP-06 scenario).
        reset()
        write("FAIL", "bank.md", [(i, "diagnosis") for i in range(1, 30)]
              + [(i, "recall") for i in range(30, 61)])
        rows = collect_counts(base)
        stats = evaluate(rows)
        check("29 diagnosis fails", not stats["ok"], report(stats, rows))
        check("deficit is named", "deficit" in report(stats, rows), report(stats, rows))
        check("fail share below 50%", stats["share"] < 0.5, str(stats))

        # Failing side: untyped item is fail-closed, not silently diagnosis.
        reset()
        write("UNTYPE", "bank.md", [(1, "diagnosis"), (2, None), (3, "recall")])
        # overwrite Q2 with a record that has no type
        (base / "provenance" / "UNTYPE" / "Q2.json").write_text(json.dumps({
            "itemId": "UNTYPE/bank.md/Q2", "examId": "UNTYPE",
            "objectiveId": "1.1",
        }), encoding="utf-8")
        rows = collect_counts(base)
        stats = evaluate(rows)
        check("untyped fails", not stats["ok"], report(stats, rows))
        check("untyped is not diagnosis", stats["diagnosis"] == 1, str(stats))
        check("untyped is named", "untyped" in report(stats, rows).lower(), report(stats, rows))

        # Failing side: unknown type string is not counted as diagnosis.
        reset()
        write("BADTYPE", "bank.md", [(1, "diagnosis"), (2, "maybe"), (3, "recall")])
        rows = collect_counts(base)
        stats = evaluate(rows)
        check("unknown type fails", not stats["ok"], report(stats, rows))
        check("unknown type not diagnosis", stats["diagnosis"] == 1, str(stats))

    if failures:
        print("SELF-TEST FAILURES:")
        for f in failures:
            print(" -", f)
        return 2
    print("self-test ok: threshold pass (30/30), deficit fail (29/31), "
          "untyped fail-closed, unknown-type fail-closed")
    return 0


def main():
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--self-test", action="store_true",
                        help="run failing+passing fixtures and exit")
    parser.add_argument("--root", default=None,
                        help="override content root (tests only)")
    args = parser.parse_args()

    if args.self_test:
        sys.exit(run_self_test())

    root = pathlib.Path(args.root) if args.root else CONTENT
    rows = collect_counts(root)
    stats = evaluate(rows)
    print(report(stats, rows))
    sys.exit(0 if stats["ok"] else 1)


if __name__ == "__main__":
    main()
