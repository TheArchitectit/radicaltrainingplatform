#!/usr/bin/env python3
"""Deterministic content bundle manifest for the desktop bundles (PKG-01).

The desktop app used to find its content by searching the working directory,
the assembly directory, the app data directory and up to six parent
directories. That is a development convenience that hides a packaging defect:
run the app from a repository checkout and everything loads; install the bundle
somewhere with no repository above it and the same code finds nothing and
starts anyway, silently empty. Nothing in the app could tell the difference
between "no content shipped" and "content shipped but not found".

The fix is a manifest that names the content explicitly. This generator writes
it into the bundle's artifact directory, before the bundle is packed, so what
the bundle claims to carry and what it carries are produced by the same pass:

  {
    "bundleVersion": 1,
    "contentRoot": "content",
    "errata": {"path": "errata.json", "sha256": "..."},
    "exams": {"<examId>": {"manifest": {...}, "lessons": [...], "banks": [...]}},
    "legacyBanks": [{"bank": "NCP-AI-Part1.md", "path": "...", "sha256": "..."}],
    "tracks": [...],
    "provenance": [...],
    "files": [{"path": "...", "sha256": "...", "bytes": N}, ...]
  }

`files` is the integrity contract: every shipped content file, sorted by path,
with its hash. `exams`/`tracks`/`provenance` are the navigation contract the
app reads to know what exists without walking the filesystem. Both come from
one sorted walk, so the manifest is byte-identical across runs and platforms.

Usage:
  python3 scripts/generate-bundle-manifest.py --content content --out <path>
  python3 scripts/generate-bundle-manifest.py --content content --out <path> --check
  python3 scripts/generate-bundle-manifest.py --self-test

Exit codes:
  0 — manifest written (or, with --check, the existing file matches)
  1 — --check found a stale manifest
  2 — self-test assertion failed
"""
import argparse
import hashlib
import json
import pathlib
import re
import sys
import tempfile

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent

# Directories that live under content/ but are not shipped: the RedEye lane's
# review logs are regenerable (scripts/redeye-lane.py --exam) and gitignored, so
# including them would make the manifest depend on whether a checkout happened to
# have run the lane — the manifest must be a function of the committed content
# alone, or "the bundle matches its manifest" stops meaning anything.
EXCLUDE_DIRS = {"review-logs"}

# Legacy question banks sit at the repository root, not under content/, and the
# app's catalog still reads them from there. They are shipped and hashed like
# everything else; the names mirror MarkdownExamRepository.LooksLikeExamFile so
# the manifest and the repository agree about what counts as a bank.
ROOT_BANK_SKIP = ("README", "CHEATSHEET", "LAB", "ROADMAP", "CHANGELOG",
                  "CONTRIBUTING", "LICENSE", "CODE_OF_CONDUCT",
                  "MASTER-PROJECT-PLAN")
QUESTION_HEADER = re.compile(r"^###\s+Q\d+", re.MULTILINE)

DISCLAIMER = (
    "This is independent study material. It is not official training and is not "
    "endorsed or approved by CompTIA, Nutanix, or any other certification body."
)
RELEASE_STATE = "draft-preview"
RELEASE_NOTE = (
    "Draft packs compiled for the beginner preview. No item carries a human "
    "source review date; the artifact must not read as released study material."
)


def sha256_file(path):
    digest = hashlib.sha256()
    with open(path, "rb") as handle:
        for chunk in iter(lambda: handle.read(65536), b""):
            digest.update(chunk)
    return digest.hexdigest()


def entry(path, rel):
    """One hash-bearing entry, keyed by its bundle-relative path."""
    return {"path": rel, "sha256": sha256_file(path)}


def walk_files(root):
    """Every file under root, as (absolute, bundle-relative) sorted by path.

    Sorted by the POSIX relative path, not by filesystem order, so the manifest
    does not depend on how the tree happened to be laid out on disk.
    """
    rows = []
    for path in root.rglob("*"):
        if not path.is_file():
            continue
        rel = path.relative_to(root.parent)
        if EXCLUDE_DIRS.intersection(rel.parts):
            continue
        rows.append((path, rel.as_posix()))
    rows.sort(key=lambda r: r[1])
    return rows


def build_manifest(content_root, repo_root):
    content_root = pathlib.Path(content_root)
    if not content_root.is_dir():
        raise SystemExit(f"content root not found: {content_root}")

    exams = {}
    exams_dir = content_root / "exams"
    if exams_dir.is_dir():
        for exam_dir in sorted(p for p in exams_dir.iterdir() if p.is_dir()):
            manifest_path = exam_dir / "exam.json"
            if not manifest_path.is_file():
                continue
            exam = {
                "manifest": entry(manifest_path, manifest_path.relative_to(repo_root).as_posix()),
                "lessons": [],
                "banks": [],
            }
            lessons_dir = exam_dir / "lessons"
            if lessons_dir.is_dir():
                for lesson in sorted(lessons_dir.glob("*.md")):
                    exam["lessons"].append({
                        "lessonId": lesson.stem,
                        **entry(lesson, lesson.relative_to(repo_root).as_posix()),
                    })
            banks_dir = exam_dir / "questions"
            if banks_dir.is_dir():
                for bank in sorted(banks_dir.glob("*.md")):
                    exam["banks"].append({
                        "bank": bank.name,
                        **entry(bank, bank.relative_to(repo_root).as_posix()),
                    })
            exams[exam_dir.name] = exam

    tracks = []
    tracks_dir = content_root / "tracks"
    if tracks_dir.is_dir():
        for track in sorted(tracks_dir.glob("*/track.json")):
            tracks.append(entry(track, track.relative_to(repo_root).as_posix()))

    provenance = []
    provenance_dir = content_root / "provenance"
    if provenance_dir.is_dir():
        for record in sorted(provenance_dir.glob("*/*.json")):
            provenance.append(entry(record, record.relative_to(repo_root).as_posix()))

    errata_path = pathlib.Path(repo_root) / "errata.json"
    errata = entry(errata_path, "errata.json") if errata_path.is_file() else None

    legacy_banks = []
    for bank in sorted(pathlib.Path(repo_root).glob("*.md")):
        name = bank.stem.upper()
        if any(skip in name for skip in ROOT_BANK_SKIP):
            continue
        try:
            text = bank.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError):
            continue
        if not QUESTION_HEADER.search(text):
            continue
        legacy_banks.append({"bank": bank.name, **entry(bank, bank.name)})

    files = [{"path": rel, "sha256": sha256_file(path), "bytes": path.stat().st_size}
             for path, rel in walk_files(content_root)]
    for extra in ([errata_path] if errata_path.is_file() else []) + \
                 [pathlib.Path(repo_root) / b["bank"] for b in legacy_banks]:
        files.append({
            "path": extra.name,
            "sha256": sha256_file(extra),
            "bytes": extra.stat().st_size,
        })
    files.sort(key=lambda f: f["path"])

    return {
        "bundleVersion": 1,
        "generatedBy": "scripts/generate-bundle-manifest.py",
        "releaseState": RELEASE_STATE,
        "releaseNote": RELEASE_NOTE,
        "disclaimer": DISCLAIMER,
        "contentRoot": content_root.relative_to(repo_root).as_posix(),
        "errata": errata,
        "exams": exams,
        "legacyBanks": legacy_banks,
        "tracks": tracks,
        "provenance": provenance,
        "files": files,
    }


def render(manifest):
    return json.dumps(manifest, indent=2, sort_keys=False, ensure_ascii=False) + "\n"


def self_test():
    failures = []
    with tempfile.TemporaryDirectory() as td:
        root = pathlib.Path(td)
        content = root / "content"
        (content / "exams" / "EXAM-1" / "lessons").mkdir(parents=True)
        (content / "exams" / "EXAM-1" / "questions").mkdir(parents=True)
        (content / "exams" / "EXAM-1" / "exam.json").write_text('{"examId":"EXAM-1"}', encoding="utf-8")
        (content / "exams" / "EXAM-1" / "lessons" / "L1.md").write_text("# Lesson", encoding="utf-8")
        (content / "exams" / "EXAM-1" / "questions" / "b.md").write_text("### Q1\nx\n", encoding="utf-8")
        (root / "errata.json").write_text('{"version":1,"errata":[]}', encoding="utf-8")
        (root / "NCP-AI-Part1.md").write_text("### Q1\nx\n", encoding="utf-8")
        (root / "README.md").write_text("### Q1\nnot a bank\n", encoding="utf-8")

        first = render(build_manifest(content, root))
        second = render(build_manifest(content, root))
        if first != second:
            failures.append("manifest is not deterministic across runs")

        parsed = json.loads(first)
        if parsed["exams"]["EXAM-1"]["lessons"][0]["lessonId"] != "L1":
            failures.append("lesson id must come from the file stem")
        if parsed["exams"]["EXAM-1"]["banks"][0]["bank"] != "b.md":
            failures.append("bank must be named by its file name")
        if parsed["errata"] is None or parsed["errata"]["path"] != "errata.json":
            failures.append("errata.json must be recorded")
        paths = [f["path"] for f in parsed["files"]]
        if paths != sorted(paths):
            failures.append("files must be sorted by path")
        if "content/exams/EXAM-1/exam.json" not in paths:
            failures.append("files must cover the whole content tree")
        if "errata.json" not in paths:
            failures.append("files must include errata.json")
        if [b["bank"] for b in parsed["legacyBanks"]] != ["NCP-AI-Part1.md"]:
            failures.append(f"root banks must be declared and README excluded, "
                            f"got {[b['bank'] for b in parsed['legacyBanks']]}")
        if "NCP-AI-Part1.md" not in paths:
            failures.append("files must include the legacy root banks")

        # A changed byte must change the hash — that is the whole point.
        (content / "exams" / "EXAM-1" / "lessons" / "L1.md").write_text("# Lesson!", encoding="utf-8")
        third = json.loads(render(build_manifest(content, root)))
        before = next(f for f in parsed["files"] if f["path"].endswith("L1.md"))
        after = next(f for f in third["files"] if f["path"].endswith("L1.md"))
        if before["sha256"] == after["sha256"]:
            failures.append("a changed lesson must change its hash")

    if failures:
        for f in failures:
            print(f"SELF-TEST FAILURE: {f}", file=sys.stderr)
        return 2
    print("generate-bundle-manifest self-test: all fixtures behaved as expected")
    return 0


def main():
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--content", default="content", help="content root (default: content)")
    parser.add_argument("--out", help="manifest path to write")
    parser.add_argument("--repo-root", default=None, help="repo root (default: script's repo)")
    parser.add_argument("--check", action="store_true",
                        help="verify --out matches the content tree; do not write")
    parser.add_argument("--self-test", action="store_true", help="run fixture assertions and exit")
    args = parser.parse_args()

    if args.self_test:
        sys.exit(self_test())

    repo_root = pathlib.Path(args.repo_root).resolve() if args.repo_root else REPO_ROOT
    content = pathlib.Path(args.content)
    if not content.is_absolute():
        content = repo_root / content

    manifest = build_manifest(content, repo_root)
    text = render(manifest)

    if args.check:
        if not args.out:
            parser.error("--check requires --out")
        out = pathlib.Path(args.out)
        if not out.is_file():
            print(f"BUNDLE MANIFEST: FAIL — {out} does not exist", file=sys.stderr)
            sys.exit(1)
        if out.read_text(encoding="utf-8") != text:
            print(f"BUNDLE MANIFEST: FAIL — {out} is stale against {content}", file=sys.stderr)
            sys.exit(1)
        print(f"BUNDLE MANIFEST: PASS — {out} matches {content}")
        sys.exit(0)

    if not args.out:
        parser.error("--out is required (or use --check)")
    out = pathlib.Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(text, encoding="utf-8")
    print(f"bundle manifest: {len(manifest['files'])} file(s), "
          f"{len(manifest['exams'])} exam(s) -> {out}")


if __name__ == "__main__":
    main()
