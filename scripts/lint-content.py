#!/usr/bin/env python3
"""Validate all .md exam files for consistent answer formatting.

Checks:
1. Question count matches answer count per file
2. All answers use recognized format (**Answer:** or **Correct Answer:**)
3. No empty or malformed answer lines

Exit codes:
  0 — All files valid
  1 — One or more validation errors found
"""
import re
import sys
import pathlib

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent

# Regex patterns
QUESTION_HEADER = re.compile(r"^###\s+Q\d+", re.MULTILINE)
VALID_ANSWER = re.compile(r"^\*\*(?:Correct )?Answer:\s*[A-F]", re.MULTILINE)
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
    a_count = len(VALID_ANSWER.findall(content))

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

    return errors


def main():
    all_errors = []
    total_questions = 0
    total_files = 0

    for md_file in sorted(REPO_ROOT.glob("*.md")):
        if should_skip(md_file):
            continue

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
    main()
