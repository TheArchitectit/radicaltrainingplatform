#!/usr/bin/env python3
"""Answer-position distribution report (R-09).

Reports the distribution of answer-letter keys per exam bank, as a review
aid for answer-position bias: banks where a single letter dominates let a
learner farm apparent accuracy by position alone (verified pre-repair:
NCP-AI-Part1.md had 80/80 single-answer keys on A).

For each bank the report prints per-letter counts, single-answer-key share,
and a concentration verdict against CONCENTRATION_THRESHOLD — the largest
single-letter share among single-answer keys. The report is also a gate:
--gate fails when any bank exceeds the threshold (R-09 acceptance; new
A+/Network+/NCA-pilot packs must be authored position-balanced).

Position bias feeds the RedEye lane's per-item check (REQ-REV-01c); report
output is archived with release evidence (SPEC-11 11.7).

Exit codes:
  0 — report produced (and, with --gate, no bank over threshold)
  1 — banks exceed the concentration threshold (--gate)
  2 — fixture assertion failed (--self-test)
"""
import argparse
import collections
import pathlib
import re
import sys

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent

QUESTION_HEADER = re.compile(r"^###\s+Q\d+", re.MULTILINE)
# Mirrors QuestionParser.AnswerRegex — keep in sync (see lint-content.py note).
ANSWER_LINE = re.compile(
    r"^\*\*(?:Correct )?Answer:\s*([A-F](?:\s*(?:,|and|&)?\s*[A-F])*)\s*\*\*",
    re.MULTILINE,
)

# Max share of single-answer keys any single letter may hold in a bank.
CONCENTRATION_THRESHOLD = 0.40


def parse_banks(paths):
    """Yield (path, [answer letters per question]) for each bank file."""
    for path in paths:
        content = path.read_text(encoding="utf-8")
        letters = []
        for match in ANSWER_LINE.finditer(content):
            keys = re.findall(r"[A-F]", match.group(1))
            letters.append(keys)
        yield path, letters


def bank_report(path, letters):
    single = [k[0] for k in letters if len(k) == 1]
    multi = [k for k in letters if len(k) > 1]
    counts = collections.Counter(single)
    total_single = len(single)
    share = {letter: counts.get(letter, 0) / total_single
             for letter in "ABCDEF"} if total_single else {}
    dominant = max(share.items(), key=lambda kv: kv[1]) if share else ("-", 0.0)
    return {
        "path": path,
        "questions": len(letters),
        "single": total_single,
        "multi": len(multi),
        "counts": {letter: counts.get(letter, 0) for letter in "ABCDEF"},
        "share": share,
        "dominant": dominant,
        "over": total_single > 0 and dominant[1] > CONCENTRATION_THRESHOLD,
    }


def print_report(reports):
    print(f"Answer-position distribution (R-09) — threshold "
          f"{CONCENTRATION_THRESHOLD:.0%} per single-answer key\n")
    for r in reports:
        rel = r["path"].relative_to(REPO_ROOT) if r["path"].is_relative_to(REPO_ROOT) else r["path"]
        print(f"{rel}: {r['questions']} questions "
              f"({r['single']} single-answer, {r['multi']} multi-answer)")
        counts = "  ".join(f"{L}:{r['counts'][L]:>3}" for L in "ABCDEF")
        shares = "  ".join(f"{L}:{r['share'][L]:>5.1%}" for L in "ABCDEF")
        print(f"  counts: {counts}")
        print(f"  share:  {shares}")
        verdict = "OVER THRESHOLD" if r["over"] else "ok"
        print(f"  dominant: {r['dominant'][0]} at {r['dominant'][1]:.1%} — {verdict}")
        print()


def collect_banks(explicit):
    if explicit:
        return [pathlib.Path(p) for p in explicit]
    files = [p for p in sorted(REPO_ROOT.glob("*.md"))
             if not should_skip(p)]
    content_tree = REPO_ROOT / "content" / "exams"
    if content_tree.is_dir():
        files += [p for p in sorted(content_tree.rglob("*.md"))
                  if not should_skip(p)]
    return files


def should_skip(filepath):
    name = filepath.stem.upper()
    for prefix in ("README", "CLAUDE", "CHANGELOG", "CONTRIBUTING", "LICENSE",
                   "CODE_OF_CONDUCT", "MASTER-PROJECT-PLAN"):
        if name.startswith(prefix):
            return True
    for substr in ("CHEATSHEET", "LAB", "ROADMAP", "DESIGN", "SPRINT"):
        if substr in name:
            return True
    return False


def self_test():
    import tempfile
    failures = []
    with tempfile.TemporaryDirectory() as td:
        base = pathlib.Path(td)

        balanced = base / "balanced-bank.md"
        balanced.write_text(
            "".join(
                f"### Q{i + 1}\nPick one.\n- A) x\n- B) y\n- C) z\n"
                f"**Answer: {letter}**\nexpl\n---\n"
                for i, letter in enumerate("ABCABCABCA")
            ),
            encoding="utf-8",
        )
        biased = base / "biased-bank.md"
        biased.write_text(
            "".join(
                f"### Q{i + 1}\nPick one.\n- A) x\n- B) y\n- C) z\n"
                f"**Answer: A**\nexpl\n---\n"
                for i in range(10)
            ),
            encoding="utf-8",
        )
        multi = base / "multi-bank.md"
        multi.write_text(
            "### Q1\nPick two.\n- A) x\n- B) y\n- C) z\n- D) w\n"
            "**Answer: A, B**\nexpl\n---\n",
            encoding="utf-8",
        )

        reports = [bank_report(p, [k for _, ks in parse_banks([p]) for k in ks])
                   for p in (balanced, biased, multi)]
        by_name = {r["path"].name: r for r in reports}

        if abs(by_name["balanced-bank.md"]["share"]["A"] - 0.4) > 0.001:
            failures.append(f"balanced bank A share should be 40%, "
                            f"got {by_name['balanced-bank.md']['share']['A']:.1%}")
        if by_name["biased-bank.md"]["over"] is not True:
            failures.append("biased bank (100% A) must be flagged over threshold")
        if by_name["multi-bank.md"]["single"] != 0:
            failures.append("multi-only bank must contribute zero single-answer keys")
        if by_name["multi-bank.md"]["multi"] != 1:
            failures.append("multi-only bank must count its multi-answer item")

    if failures:
        for f in failures:
            print(f"SELF-TEST FAILURE: {f}", file=sys.stderr)
        return 2
    print("report-key-distribution self-test: all fixtures behaved as expected")
    return 0


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("paths", nargs="*", help="specific bank files to report")
    parser.add_argument("--gate", action="store_true",
                        help="exit 1 when any bank exceeds the concentration threshold")
    parser.add_argument("--self-test", action="store_true",
                        help="run fixture assertions and exit")
    args = parser.parse_args()

    if args.self_test:
        sys.exit(self_test())

    paths = collect_banks(args.paths)
    if not paths:
        print("no bank files found — nothing to report", file=sys.stderr)
        sys.exit(0)

    reports = []
    for path, letters in parse_banks(paths):
        if letters:
            reports.append(bank_report(path, letters))
    if not reports:
        print("no questions found in the given banks", file=sys.stderr)
        sys.exit(0)

    print_report(reports)

    if args.gate:
        over = [r for r in reports if r["over"]]
        if over:
            names = ", ".join(str(r["path"].name) for r in over)
            print(f"GATE FAILURE: {len(over)} bank(s) exceed the "
                  f"{CONCENTRATION_THRESHOLD:.0%} concentration threshold: {names}",
                  file=sys.stderr)
            sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    main()
