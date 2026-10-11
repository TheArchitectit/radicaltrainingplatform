#!/usr/bin/env python3
"""Validate exam markdown for consistent answer formatting and, for the
content/exams tree, manifest-aware provenance (C-02).

Checks (legacy root banks):
1. Question count matches answer count per file
2. All answers use the full canonical grammar the parser accepts
3. No empty or malformed answer lines

Checks (content/exams/<examId>/questions/*.md — manifest-aware, SPEC-10 10.6):
4. Canonical answer separators (same rule as legacy)
5. File structure: a title header and at least one domain header
6. Provenance presence per C-02: every question has
   content/provenance/<examId>/QN.json carrying the required C-02 keys
7. The provenance objectiveId exists in the exam's exam.json

Skip logic (SPEC-10 10.6: "from name substrings to manifest declarations"):
- content/exams/**: role comes from the directory the file lives in —
  questions/ is scored bank content (linted), lessons/ is prose (skipped).
  Name substrings are NOT consulted inside the manifest tree.
- Legacy root *.md: name-substring skips remain (those files have no manifest).

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
import json
import re
import sys
import pathlib

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent

# Regex patterns — keep ANSWER_LINE in sync with QuestionParser.AnswerRegex
QUESTION_HEADER = re.compile(r"^###\s+Q(\d+)", re.MULTILINE)
ANSWER_LINE = re.compile(
    r"^\*\*(?:Correct )?Answer:\s*([A-F](?:\s*(?:,|and|&)?\s*[A-F])*)\s*\*\*",
    re.MULTILINE,
)
# Canonical authoring form: comma-separated only (no "and"/"&"/whitespace).
CANONICAL_ANSWER = re.compile(r"^\*\*(?:Correct )?Answer:\s*[A-F](?:,\s*[A-F])*\s*\*\*", re.MULTILINE)
EMPTY_ANSWER = re.compile(r"^\*\*Answer:\s*\*\*", re.MULTILINE)
TITLE_HEADER = re.compile(r"^#\s+\S", re.MULTILINE)
DOMAIN_HEADER = re.compile(r"^##\s+(?:DOMAIN|Domain)\s*\d+", re.MULTILINE)

# C-02 required provenance keys (optional ones are sourceUrl, sourceLocator,
# retrievalDate — marked '?' in the spec record shape).
C02_REQUIRED = (
    "itemId", "examId", "objectiveId", "author", "assistance",
    "rightsBasis", "reviewer", "reviewDate", "originalityCheck", "status",
)

# Legacy-root skips (no manifest governs those files).
SKIP_PREFIXES = ("README", "CLAUDE", "CHANGELOG", "CONTRIBUTING", "LICENSE", "CODE_OF_CONDUCT", "MASTER-PROJECT-PLAN")
SKIP_CONTAINS = ("CHEATSHEET", "LAB", "ROADMAP", "DESIGN", "SPRINT")


def should_skip_legacy(filepath: pathlib.Path) -> bool:
    name = filepath.stem.upper()
    for prefix in SKIP_PREFIXES:
        if name.startswith(prefix):
            return True
    for substr in SKIP_CONTAINS:
        if substr in name:
            return True
    return False


def load_exam_objectives(exam_dir: pathlib.Path) -> set[str]:
    """Objective IDs declared in exam.json (manifest-aware)."""
    manifest = exam_dir / "exam.json"
    if not manifest.is_file():
        return set()
    try:
        data = json.loads(manifest.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return set()
    ids: set[str] = set()
    for section in data.get("sections", []):
        for obj in section.get("objectives", []):
            oid = obj.get("id")
            if oid:
                ids.add(str(oid))
    return ids


def lint_legacy_file(filepath: pathlib.Path) -> list[str]:
    """Validate a single legacy root exam markdown file."""
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

    if a_count != q_count:
        errors.append(
            f"Question/Answer mismatch: {q_count} questions but {a_count} answers"
        )

    empty_count = len(EMPTY_ANSWER.findall(content))
    if empty_count > 0:
        errors.append(f"Found {empty_count} empty answer line(s)")

    if noncanonical > 0:
        errors.append(
            f"{noncanonical} answer line(s) use a non-canonical separator "
            f"(use commas: 'Answer: A, B' not 'A and B'/'A & B'/'A B')"
        )

    return errors


def lint_manifest_file(filepath: pathlib.Path, exam_dir: pathlib.Path) -> list[str]:
    """Manifest-aware lint for content/exams/<examId>/questions/*.md."""
    errors = []
    content = filepath.read_text(encoding="utf-8")

    q_ids = QUESTION_HEADER.findall(content)
    q_count = len(q_ids)
    if q_count == 0:
        return errors

    # 1. Canonical separators + count parity (same as legacy).
    a_count = len(ANSWER_LINE.findall(content))
    noncanonical = sum(
        1 for m in ANSWER_LINE.finditer(content) if not CANONICAL_ANSWER.match(m.group(0))
    )
    if a_count != q_count:
        errors.append(
            f"Question/Answer mismatch: {q_count} questions but {a_count} answers"
        )
    if EMPTY_ANSWER.search(content):
        errors.append(f"Found {len(EMPTY_ANSWER.findall(content))} empty answer line(s)")
    if noncanonical > 0:
        errors.append(
            f"{noncanonical} answer line(s) use a non-canonical separator "
            f"(use commas: 'Answer: A, B' not 'A and B'/'A & B'/'A B')"
        )

    # 2. Required file structure (parser needs a title + domain header).
    if not TITLE_HEADER.search(content):
        errors.append("missing file title header ('# ...')")
    if not DOMAIN_HEADER.search(content):
        errors.append("missing domain header ('## DOMAIN N ...')")

    # 3. Provenance presence per C-02.
    exam_id = exam_dir.name
    prov_dir = exam_dir.parent.parent / "provenance" / exam_id
    objectives = load_exam_objectives(exam_dir)

    for qn in q_ids:
        prov_path = prov_dir / f"Q{qn}.json"
        if not prov_path.is_file():
            errors.append(f"Q{qn}: missing provenance record (C-02) at {prov_path}")
            continue
        try:
            prov = json.loads(prov_path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError) as exc:
            errors.append(f"Q{qn}: unparseable provenance record ({exc})")
            continue
        missing = [k for k in C02_REQUIRED if k not in prov]
        if missing:
            errors.append(f"Q{qn}: provenance missing required field(s): {', '.join(missing)}")
        if objectives:
            oid = str(prov.get("objectiveId", ""))
            if oid and oid not in objectives:
                errors.append(
                    f"Q{qn}: provenance objectiveId '{oid}' not in exam.json objectives"
                )

    return errors


def collect_legacy_files(root: pathlib.Path) -> list[pathlib.Path]:
    return [p for p in sorted(root.glob("*.md")) if not should_skip_legacy(p)]


def collect_manifest_files(root: pathlib.Path) -> list[tuple[pathlib.Path, pathlib.Path]]:
    """(question_file, exam_dir) pairs from content/exams/*/questions/*.md.

    Role comes from the directory (manifest declaration), not the filename:
    only questions/ is scored bank content. lessons/ and anything else are
    out of scope for this lint.
    """
    pairs = []
    exams_tree = root / "content" / "exams"
    if not exams_tree.is_dir():
        return pairs
    for exam_dir in sorted(p for p in exams_tree.iterdir() if p.is_dir()):
        questions_dir = exam_dir / "questions"
        if not questions_dir.is_dir():
            continue
        for md in sorted(questions_dir.rglob("*.md")):
            pairs.append((md, exam_dir))
    return pairs


def run_self_test() -> int:
    """Failing+passing fixture pair for every rule this gate enforces."""
    import tempfile

    failures = []

    with tempfile.TemporaryDirectory() as td:
        base = pathlib.Path(td)

        # ── legacy root: non-canonical separator must fail ──
        bad_root = base / "legacy-bad"
        bad_root.mkdir()
        (bad_root / "bad-bank.md").write_text(
            "### Q1\nPick two.\n- A) x\n- B) y\n- C) z\n**Answer: B and D**\nexpl\n---\n"
            "### Q2\nPick one.\n- A) x\n- B) y\n**Answer: B**\nexpl\n---\n",
            encoding="utf-8",
        )
        rc, out = _run_lint(bad_root)
        if rc == 0:
            failures.append("legacy non-canonical separator file must fail lint")
            print(out, file=sys.stderr)

        # ── legacy root: canonical file must pass ──
        good_root = base / "legacy-good"
        good_root.mkdir()
        (good_root / "good-bank.md").write_text(
            "### Q1\nPick two.\n- A) x\n- B) y\n- C) z\n**Answer: B, D**\nexpl\n---\n"
            "### Q2\nPick one.\n- A) x\n- B) y\n**Answer: B**\nexpl\n---\n",
            encoding="utf-8",
        )
        rc, out = _run_lint(good_root)
        if rc != 0:
            failures.append("legacy canonical file must pass lint")
            print(out, file=sys.stderr)

        # ── content/exams: question without provenance must fail (C-02) ──
        def write_pack(root, exam_id, questions_md, provenance=None, objectives=None):
            exam_dir = root / "content" / "exams" / exam_id
            qdir = exam_dir / "questions"
            qdir.mkdir(parents=True)
            (qdir / "bank.md").write_text(questions_md, encoding="utf-8")
            if objectives is None:
                objectives = ["2.3"]
            manifest = {
                "examId": exam_id,
                "vendor": "Test",
                "displayName": "Test Exam",
                "officialVersion": "v1",
                "objectivesDocVersion": "1.0",
                "sourceUrl": "https://example.com",
                "sourceReviewDate": "2026-10-10",
                "sections": [
                    {"number": "1", "title": "Net", "objectives": [
                        {"id": oid, "title": o, "lessonIds": []} for oid, o in
                        ((o, f"Objective {o}") for o in objectives)
                    ]}
                ],
            }
            (exam_dir / "exam.json").write_text(json.dumps(manifest), encoding="utf-8")
            if provenance:
                pdir = root / "content" / "provenance" / exam_id
                pdir.mkdir(parents=True, exist_ok=True)
                for qn, rec in provenance.items():
                    (pdir / f"Q{qn}.json").write_text(json.dumps(rec), encoding="utf-8")

        def c02_record(exam_id, qn, objective_id="2.3"):
            return {
                "itemId": f"{exam_id}/bank.md/Q{qn}",
                "examId": exam_id,
                "objectiveId": objective_id,
                "author": "executor",
                "assistance": "ai-drafted",
                "rightsBasis": "original work",
                "reviewer": "redeye-lane",
                "reviewDate": "",
                "originalityCheck": "no-exam-item-proximity",
                "status": "draft",
            }

        clean_questions = (
            "# Fixture Bank\n\n## Domain 2: Networking\n\n---\n\n"
            "### Q1\nPick one.\n- A) x\n- B) y\n**Answer: B**\nexpl\n---\n"
        )

        # missing provenance
        r = base / "prov-missing"
        r.mkdir()
        write_pack(r, "EX-1", clean_questions, provenance={})
        rc, out = _run_lint(r)
        if rc == 0:
            failures.append("content/exams question without provenance must fail (C-02)")
            print(out, file=sys.stderr)

        # incomplete provenance (missing reviewer)
        r = base / "prov-incomplete"
        r.mkdir()
        rec = c02_record("EX-1", 1)
        del rec["reviewer"]
        write_pack(r, "EX-1", clean_questions, provenance={1: rec})
        rc, out = _run_lint(r)
        if rc == 0:
            failures.append("provenance missing a C-02 required field must fail")
            print(out, file=sys.stderr)

        # objectiveId not in manifest
        r = base / "prov-orphan-objective"
        r.mkdir()
        write_pack(r, "EX-1", clean_questions,
                   provenance={1: c02_record("EX-1", 1, objective_id="9.9")},
                   objectives=["2.3"])
        rc, out = _run_lint(r)
        if rc == 0:
            failures.append("provenance objectiveId outside exam.json must fail")
            print(out, file=sys.stderr)

        # missing domain header
        r = base / "no-domain"
        r.mkdir()
        write_pack(r, "EX-1",
                   "# Fixture Bank\n\n---\n\n### Q1\nPick one.\n- A) x\n- B) y\n**Answer: B**\nexpl\n",
                   provenance={1: c02_record("EX-1", 1)})
        rc, out = _run_lint(r)
        if rc == 0:
            failures.append("content/exams file without a domain header must fail")
            print(out, file=sys.stderr)

        # clean pack must pass
        r = base / "clean"
        r.mkdir()
        write_pack(r, "EX-1", clean_questions, provenance={1: c02_record("EX-1", 1)})
        rc, out = _run_lint(r)
        if rc != 0:
            failures.append("complete content/exams pack must pass lint")
            print(out, file=sys.stderr)

        # skip logic: a lesson named CHEATSHEET is prose, not a bank — even
        # though the legacy name-substring skip would have hidden it. Role
        # comes from the directory, so a lessons/ file with no questions is
        # simply not scored content and must not fail the gate.
        r = base / "lesson-skip"
        r.mkdir()
        write_pack(r, "EX-1", clean_questions, provenance={1: c02_record("EX-1", 1)})
        lessons = r / "content" / "exams" / "EX-1" / "lessons"
        lessons.mkdir()
        (lessons / "CHEATSHEET.md").write_text(
            "# Cheatsheet\n\nSome prose. **Answer: B**\n", encoding="utf-8"
        )
        rc, out = _run_lint(r)
        if rc != 0:
            failures.append("lessons/ prose must be skipped by role, not linted as a bank")
            print(out, file=sys.stderr)

        # skip logic: a bank file named CHEATSHEET inside questions/ IS linted
        # (role wins over the legacy name-substring skip).
        r = base / "role-over-name"
        r.mkdir()
        write_pack(r, "EX-1", clean_questions, provenance={1: c02_record("EX-1", 1)})
        qdir = r / "content" / "exams" / "EX-1" / "questions"
        (qdir / "CHEATSHEET.md").write_text(
            "# Sneaky Bank\n\n## Domain 2: Networking\n\n### Q1\nPick.\n- A) x\n- B) y\n**Answer: B and D**\nexpl\n",
            encoding="utf-8",
        )
        rc, out = _run_lint(r)
        if rc == 0:
            failures.append("questions/CHEATSHEET.md must be linted (role wins over name skip)")
            print(out, file=sys.stderr)

    if failures:
        for f in failures:
            print(f"FAIL fixture: {f}", file=sys.stderr)
        return 2

    print("SELF-TEST: PASS (legacy pair + manifest-aware C-02/structure/skip pairs)")
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

    for md_file in collect_legacy_files(REPO_ROOT):
        total_files += 1
        q_count = len(QUESTION_HEADER.findall(md_file.read_text(encoding="utf-8")))
        total_questions += q_count

        for err in lint_legacy_file(md_file):
            all_errors.append(f"  {md_file.name}: {err}")

    for md_file, exam_dir in collect_manifest_files(REPO_ROOT):
        total_files += 1
        q_count = len(QUESTION_HEADER.findall(md_file.read_text(encoding="utf-8")))
        total_questions += q_count

        for err in lint_manifest_file(md_file, exam_dir):
            rel = md_file.relative_to(REPO_ROOT) if md_file.is_relative_to(REPO_ROOT) else md_file
            all_errors.append(f"  {rel}: {err}")

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
                        help="run the failing/passing fixture pairs and exit")
    args = parser.parse_args()
    if args.self_test:
        sys.exit(run_self_test())
    main()
