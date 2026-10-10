#!/usr/bin/env python3
"""Validate all .md exam files for consistent answer formatting.

Checks:
1. Question count matches answer count per file
2. All answers use the full canonical grammar the parser accepts
3. No empty or malformed answer lines

The answer regex must mirror QuestionParser.AnswerRegex (R-07): a loose lint
pattern (first-letter-only) once passed "Answer: B and D" lines that the C#
parser then silently dropped — 10 questions vanished from NCP-AI-Part4 while
CI stayed green. New content must use the comma form; "and"/"&"/whitespace
forms parse but are reported as non-canonical so they can be repaired.

Exit codes:
  0 — All files valid
  1 — One or more validation errors found
  2 — Fixture assertion failed (--self-test)
"""
import argparse
import re
import sys
import pathlib

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent

# Regex patterns — keep ANSWER_LINE in sync with QuestionParser.AnswerRegex
QUESTION_HEADER = re.compile(r"^###\s+Q\d+", re.MULTILINE)
ANSWER_LINE = re.compile(
    r"^\*\*(?:Correct )?Answer:\s*([A-F](?:\s*(?:,|and|&)?\s*[A-F])*)\s*\*\*",
    re.MULTILINE,
)
# Canonical authoring form: comma-separated only (no "and"/"&"/whitespace).
CANONICAL_ANSWER = re.compile(r"^\*\*(?:Correct )?Answer:\s*[A-F](?:,\s*[A-F])*\s*\*\*", re.MULTILINE)
EMPTY_ANSWER = re.compile(r"^\*\*Answer:\s*\*\*", re.MULTILINE)

# Files to skip
SKIP_PREFIXES = ("README", "CLAUDE", "CHANGELOG", "CONTRIBUTING", "LICENSE", "CODE_OF_CONDUCT", "MASTER-PROJECT-PLAN")
SKIP_CONTAINS = ("CHEATSHEET", "LAB", "ROADMAP", "DESIGN", "SPRINT")


def should_skip(filepath: pathlib.Path) -> bool:
    name = filepath.stem.upper()
    for prefix in SKIP_PREFIXES:
        if name.startswith(prefix):
            return True
    for substr in SKIP_CONTAINS:
        if substr in name:
            return True
    return False


def lint_file(filepath: pathlib.Path) -> list[str]:
    """Validate a single exam markdown file."""
    errors = []
    content = filepath.read_text(encoding="utf-8")

    q_count = len(QUESTION_HEADER.findall(content))
    a_count = len(ANSWER_LINE.findall(content))
    noncanonical = sum(
        1 for m in ANSWER_LINE.finditer(content) if not CANONICAL_ANSWER.match(m.group(0))
    )

    # Skip files with no questions (not exam content)
    if q_count == 0:
        return errors

    # Check question/answer count mismatch
    if a_count != q_count:
        errors.append(
            f"Question/Answer mismatch: {q_count} questions but {a_count} answers"
        )

    # Check for empty answer lines
    empty_count = len(EMPTY_ANSWER.findall(content))
    if empty_count > 0:
        errors.append(f"Found {empty_count} empty answer line(s)")

    if noncanonical > 0:
        errors.append(
            f"{noncanonical} answer line(s) use a non-canonical separator "
            f"(use commas: 'Answer: A, B' not 'A and B'/'A & B'/'A B')"
        )

    return errors


def collect_exam_files(root: pathlib.Path) -> list[pathlib.Path]:
    """Legacy root banks (*.md at root) plus any content/exams tree."""
    files = [p for p in sorted(root.glob("*.md")) if not should_skip(p)]
    content_tree = root / "content" / "exams"
    if content_tree.is_dir():
        files += [p for p in sorted(content_tree.rglob("*.md")) if not should_skip(p)]
    return files


def run_self_test() -> int:
    """TM-15 fixture pair: a file with a dropped-question defect must fail;
    a clean canonical file must pass."""
    import tempfile

    with tempfile.TemporaryDirectory() as td:
        base = pathlib.Path(td)
        bad_root = base / "bad"
        bad_root.mkdir()
        bad = bad_root / "bad-bank.md"
        bad.write_text(
            "### Q1\nPick two.\n- A) x\n- B) y\n- C) z\n**Answer: B and D**\nexpl\n---\n"
            "### Q2\nPick one.\n- A) x\n- B) y\n**Answer: B**\nexpl\n---\n",
            encoding="utf-8",
        )
        rc_bad, out_bad = _run_lint(bad_root)
        if rc_bad == 0:
            print("FAIL fixture(bad): non-canonical separator file must fail lint", file=sys.stderr)
            print(out_bad, file=sys.stderr)
            return 2

        good_root = base / "good"
        good_root.mkdir()
        good = good_root / "good-bank.md"
        good.write_text(
            "### Q1\nPick two.\n- A) x\n- B) y\n- C) z\n**Answer: B, D**\nexpl\n---\n"
            "### Q2\nPick one.\n- A) x\n- B) y\n**Answer: B**\nexpl\n---\n",
            encoding="utf-8",
        )
        rc_good, out_good = _run_lint(good_root)
        if rc_good != 0:
            print("FAIL fixture(good): canonical file must pass lint", file=sys.stderr)
            print(out_good, file=sys.stderr)
            return 2

    print("SELF-TEST: PASS (bad fixture fails, good fixture passes)")
    return 0


def _run_lint(root: pathlib.Path) -> tuple[int, str]:
    import io
    import contextlib

    buf = io.StringIO()
    global REPO_ROOT
    saved = REPO_ROOT
    try:
        REPO_ROOT = root
        with contextlib.redirect_stdout(buf), contextlib.redirect_stderr(buf):
            try:
                main()
                rc = 0
            except SystemExit as e:
                rc = e.code if isinstance(e.code, int) else 1
    finally:
        REPO_ROOT = saved
    return rc, buf.getvalue()


def main():
    all_errors = []
    total_questions = 0
    total_files = 0

    for md_file in collect_exam_files(REPO_ROOT):
        total_files += 1
        q_count = len(QUESTION_HEADER.findall(md_file.read_text(encoding="utf-8")))
        total_questions += q_count

        errors = lint_file(md_file)
        for err in errors:
            all_errors.append(f"  {md_file.name}: {err}")

    if all_errors:
        print("❌ CONTENT LINT ERRORS:", file=sys.stderr)
        for err in all_errors:
            print(err, file=sys.stderr)
        print(f"\n{len(all_errors)} error(s) in {total_files} files", file=sys.stderr)
        sys.exit(1)

    print(f"✅ OK: {total_files} files checked, {total_questions} questions validated.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--self-test", action="store_true",
                        help="run the TM-15 failing/passing fixture pair and exit")
    args = parser.parse_args()
    if args.self_test:
        sys.exit(run_self_test())
    main()
