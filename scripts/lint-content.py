#!/usr/bin/env python3
"""Validate exam markdown for consistent answer formatting and, for the
content/exams tree, manifest-aware provenance (C-02).

Checks (legacy root banks):
1. Question count matches answer count per file
2. All answers use the full canonical grammar the parser accepts
3. No empty or malformed answer lines
4. New content under content/exams/ uses only canonical answer separators
   (SPEC-09 R-07 forbids the "A and B" form in new content; commit-time here
   so the rule is enforced, not just documented).

Scope (SPEC-01 D4, SPEC-10): repo-root *.md (legacy Nutanix banks, untouched)
PLUS content/exams/**/*.md (new tracks). The new-content grammar rule applies
only under content/, so the legacy root bank NCP-AI-Part4.md keeps its
historical "and" items until S45-03 repairs them; new packs cannot.

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

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))

from review_record import review_record_errors  # noqa: E402

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
# SPEC-09 R-07: the "B and D" / "B or D" prose form must not appear in new
# content. Canonical multi-select is "**Correct Answer: B, D**".
NONCANONICAL_ANSWER = re.compile(
    r"^\*\*(?:Correct )?Answer:\s*[A-F]\s+(?:and|or)\s+[A-F]",
    re.MULTILINE,
)

# New-track content root (SPEC-01 D4). The extended rules below apply only
# here; root-level legacy banks stay under the original checks.
CONTENT_EXAMS = REPO_ROOT / "content" / "exams"

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
        errors.extend(review_record_errors(f"Q{qn}", prov))
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


def _legacy_fixtures(base: pathlib.Path, failures: list[str]) -> None:
    """A non-canonical separator fails; the comma form passes."""
    bad_root = base / "legacy-bad"
    bad_root.mkdir()
    (bad_root / "bad-bank.md").write_text(
        "### Q1\nPick two.\n- A) x\n- B) y\n- C) z\n**Answer: B and D**\nexpl\n---\n"
        "### Q2\nPick one.\n- A) x\n- B) y\n**Answer: B**\nexpl\n---\n",
        encoding="utf-8",
    )
    if _run_lint(bad_root)[0] == 0:
        failures.append("legacy non-canonical separator file must fail lint")

    good_root = base / "legacy-good"
    good_root.mkdir()
    (good_root / "good-bank.md").write_text(
        "### Q1\nPick two.\n- A) x\n- B) y\n- C) z\n**Answer: B, D**\nexpl\n---\n"
        "### Q2\nPick one.\n- A) x\n- B) y\n**Answer: B**\nexpl\n---\n",
        encoding="utf-8",
    )
    if _run_lint(good_root)[0] != 0:
        failures.append("legacy canonical file must pass lint")


def _manifest_fixtures(base: pathlib.Path, failures: list[str]) -> None:
    """Title/domain headers, C-02 provenance presence, objective ids, role skips."""
    clean = ("# Fixture Bank\n\n## Domain 2: Networking\n\n---\n\n"
             "### Q1\nPick one.\n- A) x\n- B) y\n**Answer: B**\nexpl\n---\n")

    def expect(root, should_pass, message):
        rc, out = _run_lint(root)
        if (rc == 0) != should_pass:
            failures.append(message)
            print(out, file=sys.stderr)

    r = base / "prov-missing"; r.mkdir()
    write_pack(r, "EX-1", clean, provenance={})
    expect(r, False, "content/exams question without provenance must fail (C-02)")

    r = base / "prov-incomplete"; r.mkdir()
    rec = c02_record("EX-1", 1)
    del rec["reviewer"]
    write_pack(r, "EX-1", clean, provenance={1: rec})
    expect(r, False, "provenance missing a C-02 required field must fail")

    r = base / "prov-orphan-objective"; r.mkdir()
    write_pack(r, "EX-1", clean,
               provenance={1: c02_record("EX-1", 1, objective_id="9.9")})
    expect(r, False, "provenance objectiveId outside exam.json must fail")

    r = base / "no-domain"; r.mkdir()
    write_pack(r, "EX-1", "# Fixture Bank\n\n---\n\n### Q1\nPick.\n- A) x\n- B) y\n"
               "**Answer: B**\nexpl\n", provenance={1: c02_record("EX-1", 1)})
    expect(r, False, "content/exams file without a domain header must fail")

    r = base / "clean"; r.mkdir()
    write_pack(r, "EX-1", clean, provenance={1: c02_record("EX-1", 1)})
    expect(r, True, "complete content/exams pack must pass lint")

    r = base / "lesson-skip"; r.mkdir()
    write_pack(r, "EX-1", clean, provenance={1: c02_record("EX-1", 1)})
    lessons = r / "content" / "exams" / "EX-1" / "lessons"
    lessons.mkdir()
    (lessons / "CHEATSHEET.md").write_text(
        "# Cheatsheet\n\nSome prose. **Answer: B**\n", encoding="utf-8")
    expect(r, True, "lessons/ prose must be skipped by role, not linted as a bank")

    r = base / "role-over-name"; r.mkdir()
    write_pack(r, "EX-1", clean, provenance={1: c02_record("EX-1", 1)})
    qdir = r / "content" / "exams" / "EX-1" / "questions"
    (qdir / "CHEATSHEET.md").write_text(
        "# Sneaky Bank\n\n## Domain 2: Networking\n\n### Q1\nPick.\n- A) x\n- B) y\n"
        "**Answer: B and D**\nexpl\n", encoding="utf-8")
    expect(r, False, "questions/CHEATSHEET.md must be linted (role wins over name skip)")


def _review_record_fixtures(base: pathlib.Path, failures: list[str]) -> None:
    """SPEC-20 REQ-RV-01..03: a tool in reviewer fails, an honest empty passes."""
    clean = ("# Fixture Bank\n\n## Domain 2: Networking\n\n---\n\n"
             "### Q1\nPick one.\n- A) x\n- B) y\n**Answer: B**\nexpl\n---\n")

    def run(name, **over):
        root = base / name
        rec = c02_record("EX-1", 1)
        rec.update(over)
        write_pack(root, "EX-1", clean, provenance={1: rec})
        return _run_lint(root)[0]

    if run("prov-tool-reviewer", reviewer="redeye-lane") == 0:
        failures.append("reviewer naming a tool must fail (SPEC-20 REQ-RV-01)")
    if run("prov-rv-ok", automatedReview="redeye-lane:2026-10-20") != 0:
        failures.append("empty reviewer + valid automatedReview must pass (SPEC-20)")
    if run("prov-claims-reviewed", status="reviewed") == 0:
        failures.append("status 'reviewed' with an empty reviewer must fail (REQ-RV-03)")
    if run("prov-named-no-date", reviewer="a-human") == 0:
        failures.append("a named reviewer with no date must fail (REQ-RV-03)")
    if run("prov-named-ok", reviewer="a-human", reviewDate="2026-10-15") != 0:
        failures.append("a named reviewer with a date must pass (SPEC-20)")


def run_self_test() -> int:
    """Failing+passing fixture pair for every rule this gate enforces."""
    import tempfile

    failures: list[str] = []
    with tempfile.TemporaryDirectory() as td:
        base = pathlib.Path(td)
        _legacy_fixtures(base, failures)
        _manifest_fixtures(base, failures)
        _review_record_fixtures(base, failures)

    if failures:
        for f in failures:
            print(f"FAIL fixture: {f}", file=sys.stderr)
        return 2

    print("SELF-TEST: PASS (legacy pair + manifest-aware C-02/structure/skip pairs)")
    return 0



def write_pack(root, exam_id, questions_md, provenance=None, objectives=None):
    """A minimal content/exams pack: manifest, bank, optional provenance."""
    exam_dir = root / "content" / "exams" / exam_id
    qdir = exam_dir / "questions"
    qdir.mkdir(parents=True)
    (qdir / "bank.md").write_text(questions_md, encoding="utf-8")
    objectives = objectives or ["2.3"]
    manifest = {
        "examId": exam_id, "vendor": "Test", "displayName": "Test Exam",
        "officialVersion": "v1", "objectivesDocVersion": "1.0",
        "sourceUrl": "https://example.com", "sourceReviewDate": "2026-10-10",
        "sections": [{"number": "1", "title": "Net", "objectives": [
            {"id": oid, "title": f"Objective {oid}", "lessonIds": []}
            for oid in objectives]}],
    }
    (exam_dir / "exam.json").write_text(json.dumps(manifest), encoding="utf-8")
    if provenance:
        pdir = root / "content" / "provenance" / exam_id
        pdir.mkdir(parents=True, exist_ok=True)
        for qn, rec in provenance.items():
            (pdir / f"Q{qn}.json").write_text(json.dumps(rec), encoding="utf-8")


def c02_record(exam_id, qn, objective_id="2.3"):
    """A complete C-02 record with an honest empty reviewer."""
    return {
        "itemId": f"{exam_id}/bank.md/Q{qn}", "examId": exam_id,
        "objectiveId": objective_id, "author": "executor",
        "assistance": "ai-drafted", "rightsBasis": "original work",
        "reviewer": "", "reviewDate": "",
        "originalityCheck": "no-exam-item-proximity", "status": "draft",
    }


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
