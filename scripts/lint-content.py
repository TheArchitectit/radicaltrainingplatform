#!/usr/bin/env python3
"""Validate all .md exam files for consistent answer formatting.

Checks:
1. Question count matches answer count per file
2. All answers use recognized format (**Answer:** or **Correct Answer:**)
3. No empty or malformed answer lines
4. New content under content/exams/ uses only canonical answer separators
   (SPEC-09 R-07 forbids the "A and B" form in new content; commit-time here
   so the rule is enforced, not just documented).

Scope (SPEC-01 D4, SPEC-10): repo-root *.md (legacy Nutanix banks, untouched)
PLUS content/exams/**/*.md (new tracks). The new-content grammar rule applies
only under content/, so the legacy root bank NCP-AI-Part4.md keeps its
historical "and" items until S45-03 repairs them; new packs cannot.

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
# SPEC-09 R-07: the "B and D" / "B or D" prose form must not appear in new
# content. Canonical multi-select is "**Correct Answer: B, D**".
NONCANONICAL_ANSWER = re.compile(
    r"^\*\*(?:Correct )?Answer:\s*[A-F]\s+(?:and|or)\s+[A-F]",
    re.MULTILINE,
)

# New-track content root (SPEC-01 D4). The extended rules below apply only
# here; root-level legacy banks stay under the original checks.
CONTENT_EXAMS = REPO_ROOT / "content" / "exams"

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


def lint_file(filepath: pathlib.Path, new_content: bool = False) -> list[str]:
    """Validate a single exam markdown file.

    `new_content` enables the SPEC-09 R-07 grammar rule for files under
    content/exams/. Root legacy banks pass `new_content=False`.
    """
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

    # SPEC-09 R-07: new content must not use the prose "and"/"or" form.
    if new_content:
        bad = NONCANONICAL_ANSWER.findall(content)
        if bad:
            errors.append(
                f"Found {len(bad)} non-canonical answer separator(s) "
                f"(use '**Correct Answer: B, D**', not 'B and D') — SPEC-09 R-07"
            )

    return errors


def discover_files() -> list[tuple[pathlib.Path, bool]]:
    """Return (file, is_new_content) pairs to lint.

    Root *.md is the legacy scope; content/exams/**/*.md is the new-track
    scope with the extended grammar rule.
    """
    files: list[tuple[pathlib.Path, bool]] = []
    for md_file in sorted(REPO_ROOT.glob("*.md")):
        if should_skip(md_file):
            continue
        files.append((md_file, False))
    if CONTENT_EXAMS.is_dir():
        for md_file in sorted(CONTENT_EXAMS.rglob("*.md")):
            files.append((md_file, True))
    return files


def main():
    all_errors = []
    total_questions = 0
    total_files = 0

    for md_file, is_new in discover_files():
        total_files += 1
        q_count = len(QUESTION_HEADER.findall(md_file.read_text(encoding="utf-8")))
        total_questions += q_count

        errors = lint_file(md_file, new_content=is_new)
        for err in errors:
            rel = md_file.relative_to(REPO_ROOT)
            all_errors.append(f"  {rel}: {err}")

    if all_errors:
        print("❌ CONTENT LINT ERRORS:", file=sys.stderr)
        for err in all_errors:
            print(err, file=sys.stderr)
        print(f"\n{len(all_errors)} error(s) in {total_files} files", file=sys.stderr)
        sys.exit(1)

    print(f"✅ OK: {total_files} files checked, {total_questions} questions validated.")


if __name__ == "__main__":
    main()
