#!/usr/bin/env python3
"""Validate content/ manifests for shape, collisions, and source freshness.

Gates (SPEC-02 REQ-MAN-01/05/06):
  - Every content/exams/*/exam.json and content/tracks/*/track.json parses
    and carries all required fields (REQ-MAN-01/06).
  - Track manifests reference only declared exam IDs (REQ-MAN-01).
  - No duplicate exam or track IDs across the content tree (REQ-MAN-05).
  - Missing sourceUrl is a hard failure; a sourceReviewDate older than
    STALE_DAYS produces a loud warning naming the exam ID and the date.

Exit codes:
  0 — valid
  1 — validation errors found
  2 — fixture assertion failed (--self-test)
"""
import argparse
import datetime
import json
import pathlib
import sys
import tempfile

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent
STALE_DAYS = 180

EXAM_REQUIRED = [
    "examId", "vendor", "displayName", "officialVersion", "objectivesDocVersion",
    "sourceUrl", "sourceReviewDate", "sections",
]
TRACK_REQUIRED = ["trackId", "title", "examIds", "previewLabel", "disclaimer"]


def load_json(path):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f), None
    except (json.JSONDecodeError, OSError) as exc:
        return None, str(exc)


def find_content_root(base):
    """Locate a content/ tree under base (base itself or one level down)."""
    direct = base / "content"
    if direct.is_dir():
        return direct
    for child in sorted(base.iterdir()):
        if child.is_dir() and (child / "content").is_dir():
            return child / "content"
    return None


def validate(content_root, warnings):
    errors = []

    exams_dir = content_root / "exams"
    tracks_dir = content_root / "tracks"
    exam_ids = {}
    today = datetime.date.today()

    if exams_dir.is_dir():
        for exam_dir in sorted(exams_dir.iterdir()):
            if not exam_dir.is_dir():
                continue
            manifest_path = exam_dir / "exam.json"
            if not manifest_path.is_file():
                errors.append(f"{exam_dir}: exam pack directory has no exam.json")
                continue
            data, err = load_json(manifest_path)
            if err:
                errors.append(f"{manifest_path}: unparseable JSON ({err})")
                continue
            for field in EXAM_REQUIRED:
                if field not in data or data[field] in (None, "", {} if field == "sections" else None):
                    errors.append(f"{manifest_path}: missing required field '{field}'")
            exam_id = data.get("examId", "")
            if exam_id:
                if exam_id in exam_ids:
                    errors.append(
                        f"REQ-MAN-05: exam ID '{exam_id}' claimed by both "
                        f"'{exam_ids[exam_id]}' and '{manifest_path}'")
                exam_ids[exam_id] = str(manifest_path)

            # Objective ID uniqueness within the exam (REQ-MAN-05).
            seen_obj = set()
            for section in data.get("sections", []):
                for obj in section.get("objectives", []):
                    oid = obj.get("id", "")
                    if not oid:
                        errors.append(f"{manifest_path}: objective in section "
                                      f"'{section.get('number', '?')}' missing id")
                    elif oid in seen_obj:
                        errors.append(f"{manifest_path}: duplicate objective id '{oid}'")
                    seen_obj.add(oid)

            # REQ-MAN-06: source URL mandatory, review date staleness loud.
            if not data.get("sourceUrl"):
                errors.append(f"{manifest_path}: missing sourceUrl (REQ-MAN-06)")
            review_date = data.get("sourceReviewDate", "")
            if review_date:
                try:
                    parsed = datetime.date.fromisoformat(review_date)
                    age = (today - parsed).days
                    if age > STALE_DAYS:
                        warnings.append(
                            f"STALE SOURCE: exam '{exam_id}' sourceReviewDate {review_date} "
                            f"is {age} days old (>{STALE_DAYS}) — review work required")
                except ValueError:
                    errors.append(f"{manifest_path}: sourceReviewDate '{review_date}' is not ISO yyyy-mm-dd")
    else:
        warnings.append("no content/exams/ directory found — nothing validated")

    if tracks_dir.is_dir():
        for track_dir in sorted(tracks_dir.iterdir()):
            if not track_dir.is_dir():
                continue
            manifest_path = track_dir / "track.json"
            if not manifest_path.is_file():
                errors.append(f"{track_dir}: track pack directory has no track.json")
                continue
            data, err = load_json(manifest_path)
            if err:
                errors.append(f"{manifest_path}: unparseable JSON ({err})")
                continue
            for field in TRACK_REQUIRED:
                if field not in data or data[field] in (None, "", []):
                    errors.append(f"{manifest_path}: missing required field '{field}'")
            track_id = data.get("trackId", "")
            if track_id:
                if track_id in TRACK_IDS_SEEN:
                    errors.append(f"REQ-MAN-05: duplicate track ID '{track_id}'")
                TRACK_IDS_SEEN.add(track_id)
            for exam_id in data.get("examIds", []):
                if exam_id not in exam_ids:
                    errors.append(
                        f"{manifest_path}: track '{track_id}' references unknown exam ID '{exam_id}'")

    return errors


TRACK_IDS_SEEN = set()


def _run_validate(base_dir):
    """Validate a temp tree, returning (errors, warnings)."""
    global TRACK_IDS_SEEN
    TRACK_IDS_SEEN = set()
    warnings = []
    content = find_content_root(base_dir)
    if content is None:
        return ["no content/ tree found"], []
    return validate(content, warnings), warnings


def self_test():
    """SPEC-16 rule: every gate ships failing AND passing fixtures."""
    failures = []

    good = {
        "content/exams/EX-1/exam.json": {
            "examId": "EX-1", "vendor": "Test", "displayName": "Test Exam",
            "officialVersion": "v1", "objectivesDocVersion": "1.0",
            "sourceUrl": "https://example.com/obj", "sourceReviewDate":
            datetime.date.today().isoformat(),
            "sections": [{"number": "1", "title": "S1",
                          "objectives": [{"id": "1.1", "title": "Obj", "lessonIds": []}]}],
        },
        "content/tracks/track-t/track.json": {
            "trackId": "track-t", "title": "T", "examIds": ["EX-1"],
            "audience": "beginners", "previewLabel": "beginner preview",
            "disclaimer": "d", "order": 1,
        },
    }

    def run_tree(files, expect_errors, expect_warning_substr=None):
        with tempfile.TemporaryDirectory() as tmp:
            base = pathlib.Path(tmp)
            for relpath, payload in files.items():
                p = base / relpath
                p.parent.mkdir(parents=True, exist_ok=True)
                p.write_text(json.dumps(payload), encoding="utf-8")
            errors, warnings = _run_validate(base)
        if expect_errors and not errors:
            failures.append(f"expected errors, got none ({describe(files)})")
        if not expect_errors and errors:
            failures.append(f"expected clean, got: {errors} ({describe(files)})")
        if expect_warning_substr and not any(expect_warning_substr in w for w in warnings):
            failures.append(f"expected warning containing '{expect_warning_substr}', "
                            f"got: {warnings}")

    def describe(files):
        return ", ".join(sorted(files))

    # Passing fixture: well-formed exam + track referencing it.
    run_tree(good, expect_errors=False)

    # Failing fixtures, one defect each.
    missing_field = json.loads(json.dumps(good["content/exams/EX-1/exam.json"]))
    del missing_field["sourceUrl"]
    run_tree({"content/exams/EX-1/exam.json": missing_field}, expect_errors=True)

    dup = json.loads(json.dumps(good["content/exams/EX-1/exam.json"]))
    run_tree({
        "content/exams/EX-1/exam.json": dup,
        "content/exams/EX-2/exam.json": {**dup, "displayName": "Other"},
    }, expect_errors=True)

    stale = json.loads(json.dumps(good["content/exams/EX-1/exam.json"]))
    stale["sourceReviewDate"] = "2025-01-01"
    run_tree({"content/exams/EX-1/exam.json": stale},
             expect_errors=False, expect_warning_substr="STALE SOURCE")

    unknown_ref = json.loads(json.dumps(good["content/tracks/track-t/track.json"]))
    unknown_ref["examIds"] = ["EX-NOPE"]
    run_tree({**good, "content/tracks/track-t/track.json": unknown_ref}, expect_errors=True)

    if failures:
        for f in failures:
            print(f"SELF-TEST FAILURE: {f}", file=sys.stderr)
        return 2
    print("validate-manifests self-test: all fixtures behaved as expected")
    return 0


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--self-test", action="store_true",
                        help="run failing+passing fixtures and exit")
    args = parser.parse_args()

    if args.self_test:
        sys.exit(self_test())

    content = find_content_root(REPO_ROOT)
    if content is None:
        # Not an error until content/ exists (T-07 lands the real tree);
        # the CI step stays green on manifest-less states.
        print("no content/ tree found — nothing to validate", file=sys.stderr)
        sys.exit(0)

    warnings = []
    errors = validate(content, warnings)
    for w in warnings:
        print(f"WARNING: {w}", file=sys.stderr)
    for e in errors:
        print(f"ERROR: {e}", file=sys.stderr)
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
