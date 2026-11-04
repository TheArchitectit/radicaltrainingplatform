#!/usr/bin/env python3
"""Answer-position balance (SPEC-21; R-09, TM-29).

A bank whose correct answers cluster on one letter can be played by position:
click B every time and score. The RedEye lane flags it per item; this gate
fails the tree while any released bank still concentrates above the threshold,
so a new imbalanced bank cannot land and the rotated ones cannot drift back.

The measure is the lane's: within a bank, the share of single-key items whose
key is the most frequent letter across that bank's single-key items, against
REDEYE THRESHOLD (0.40). A single-key bank of five items is therefore allowed
three on one letter and no more — which is exactly the case the demo cut had.

  python3 scripts/check-answer-balance.py
  python3 scripts/check-answer-balance.py --self-test
"""
import argparse
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))

import redeye_analysis as ra  # noqa: E402

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent
THRESHOLD = ra.CONCENTRATION_THRESHOLD


def bank_reports(root: pathlib.Path):
    """[(examId, bank name, dominant letter, share, total, over_threshold)]."""
    reports = []
    exams = root / "content" / "exams"
    for exam_dir in sorted(p for p in exams.iterdir() if p.is_dir()):
        qdir = exam_dir / "questions"
        if not qdir.is_dir():
            continue
        for bank in sorted(qdir.glob("*.md")):
            items = ra.parse_bank(bank)
            _, letter, share, total = ra.bank_position_stats(items)
            if not total:
                continue
            reports.append((exam_dir.name, bank.name, letter, share, total,
                            share > THRESHOLD))
    return reports


def run_self_test() -> int:
    import tempfile

    failures = []

    def bank(root, name, answers):
        qdir = root / "content" / "exams" / "EX-1" / "questions"
        qdir.mkdir(parents=True, exist_ok=True)
        body = "".join(
            f"### Q{i + 1}\nWhich one?\n- A) w\n- B) x\n- C) y\n- D) z\n"
            f"**Answer: {a}**\nBecause {a}.\n---\n"
            for i, a in enumerate(answers))
        (qdir / name).write_text(body, encoding="utf-8")

    with tempfile.TemporaryDirectory() as td:
        root = pathlib.Path(td)
        # Four items, three on B, is the old demo-cut shape and must fail at 75%.
        bank(root, "clustered.md", ["B", "B", "B", "C"])
        reports = bank_reports(root)
        if not reports or not reports[0][5]:
            failures.append("a bank with 3 of 4 keys on B must be flagged (75%)")
        # 2 of 5 = 40% is not ABOVE the threshold — the cut is strict — and a
        # perfectly flat bank is what the rotation aims for.
        bank(root, "at-threshold.md", ["A", "B", "C", "D", "A"])
        bank(root, "flat.md", ["A", "B", "C", "D"])
        reports = {r[1]: r for r in bank_reports(root)}
        if reports["at-threshold.md"][5]:
            failures.append("2 of 5 on one letter (40%) must not be flagged")
        if reports["flat.md"][5]:
            failures.append("a flat bank (25%) must not be flagged")

    with tempfile.TemporaryDirectory() as td:
        root = pathlib.Path(td)
        bank(root, "all-b.md", ["B"] * 4)
        if not all(r[5] for r in bank_reports(root)):
            failures.append("4 of 4 on one letter must be flagged")

    if failures:
        for f in failures:
            print(f"FAIL fixture: {f}", file=sys.stderr)
        return 2
    print("SELF-TEST: PASS (clustered bank fails, balanced bank passes, all-one-letter fails)")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--root", default=str(REPO_ROOT), help="repository root")
    ap.add_argument("--self-test", action="store_true")
    args = ap.parse_args()
    if args.self_test:
        return run_self_test()

    reports = bank_reports(pathlib.Path(args.root))
    over = [r for r in reports if r[5]]
    for exam, bank, letter, share, total, _ in reports:
        flag = "FAIL" if share > THRESHOLD else "ok  "
        print(f"  {flag} {exam}/{bank}: {letter} is {share:.0%} of {total} single keys "
              f"(threshold {THRESHOLD:.0%})")
    if over:
        print(f"ANSWER BALANCE: FAIL — {len(over)} bank(s) concentrate a key above "
              f"{THRESHOLD:.0%}; rotate with scripts/rebalance-answer-keys.py",
              file=sys.stderr)
        return 1
    print(f"ANSWER BALANCE: PASS — {len(reports)} bank(s), none above {THRESHOLD:.0%}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
