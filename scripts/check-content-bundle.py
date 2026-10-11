#!/usr/bin/env python3
"""Content-bundle check for the Pages artifact (T-22, CI-03).

Failing side this gate names: `pwa-deploy.yml` published
RadicalTrainingPlatform.Web/ with no check that the content it carries is the
content the manifests describe. The Pages artifact cannot read content/ at
runtime — generate-study-content.py compiles the manifest world into
js/study-content.js — so a released lesson or question bank could go missing,
or be edited without recompiling, and the deployed PWA would ship a content
world that no manifest agrees with. Nothing would notice.

What this checks, against RadicalTrainingPlatform.Web/content-bundle.json:

  1. EXISTS      — every manifest-referenced asset is present on disk.
  2. HASH        — every asset's sha256 matches the recorded hash, so content
                   cannot change without the bundle being regenerated.
  3. REFERENCED  — every released lesson is actually named by an objective's
                   lessonIds in its exam manifest (a lesson nothing points at
                   is a dangling pack asset), and every released bank is named
                   in the release record.
  4. SHIPPED     — every scored item in the compiled study-content.js comes
                   from a bank the release record names. A bank added to the
                   tree but not released cannot reach the artifact.
  5. HONEST      — every shipped item has a provenance record, and no record
                   claims a review state the release record does not declare.
                   Today every pack is `draft` with an empty reviewDate; the
                   gate fails if a record claims `reviewed` without a date,
                   or if a shipped pack is not declared at all.

The release record is imported from generate-study-content.py rather than
restated, so "what ships" has exactly one definition.

Usage:
  python3 scripts/check-content-bundle.py            # check (default)
  python3 scripts/check-content-bundle.py --write    # regenerate the bundle
"""
import argparse
import hashlib
import importlib.util
import json
import pathlib
import re
import sys

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent
SCRIPTS = REPO_ROOT / "scripts"
CONTENT = REPO_ROOT / "content"

BUNDLE_VERSION = 1
# The honest release state of everything in this bundle. The October 23 packs
# are draft pending RedEye model-stage integration; the UI labels them
# "beginner preview" and never implies pass readiness.
RELEASE_STATE = "draft-preview"


def load_generator():
    """Import generate-study-content.py for its release record.

    The filename has hyphens, so it is not importable by name.
    """
    spec = importlib.util.spec_from_file_location(
        "generate_study_content", SCRIPTS / "generate-study-content.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def rel(path, root):
    """Repo-relative (or fixture-root-relative) path, for stable messages."""
    try:
        return str(path.relative_to(root))
    except ValueError:
        return str(path)


def parse_compiled_items(root):
    """Pull the ITEMS array out of the compiled JS module."""
    compiled = root / "RadicalTrainingPlatform.Web" / "js" / "study-content.js"
    if not compiled.is_file():
        sys.exit(f"compiled content missing: {rel(compiled, root)} — "
                 f"run scripts/generate-study-content.py")
    text = compiled.read_text(encoding="utf-8")
    m = re.search(r"export const ITEMS = (\[.*?\]);\nexport const DISCLAIMER", text, re.S)
    if not m:
        sys.exit(f"could not locate the ITEMS array in {rel(compiled, root)}")
    return json.loads(m.group(1))


def parse_compiled_disclaimer(root):
    compiled = root / "RadicalTrainingPlatform.Web" / "js" / "study-content.js"
    text = compiled.read_text(encoding="utf-8")
    m = re.search(r"export const DISCLAIMER = (\"(?:[^\"\\\\]|\\\\.)*\");", text)
    if not m:
        sys.exit(f"could not locate the DISCLAIMER in {rel(compiled, root)}")
    return json.loads(m.group(1))


def build_bundle(gen, root):
    """Every asset the Pages artifact's content world depends on."""
    content = root / "content"
    exams = {}
    for exam_id, lesson_ids in gen.RELEASED_LESSONS.items():
        manifest_path = content / "exams" / exam_id / "exam.json"
        lessons = []
        for lesson_id in lesson_ids:
            p = content / "exams" / exam_id / "lessons" / f"{lesson_id.lower()}.md"
            lessons.append({"lessonId": lesson_id, "path": rel(p, root), "sha256": sha256(p)})
        banks = []
        for bank in gen.RELEASED_BANKS.get(exam_id, []):
            p = content / "exams" / exam_id / "questions" / bank
            banks.append({"bank": bank, "path": rel(p, root), "sha256": sha256(p)})
        exams[exam_id] = {
            "manifest": {"path": rel(manifest_path, root), "sha256": sha256(manifest_path)},
            "lessons": lessons,
            "banks": banks,
        }

    tracks = []
    for p in sorted((content / "tracks").glob("*/track.json")):
        tracks.append({"path": rel(p, root), "sha256": sha256(p)})

    # Provenance for every shipped item — the review-state record.
    provenance = []
    for item in parse_compiled_items(root):
        exam_id, _bank, number = item["id"].split("/")
        p = content / "provenance" / exam_id / f"{number}.json"
        if not p.is_file():
            sys.exit(f"{item['id']}: no provenance record — refusing to bundle an untracked item")
        record = json.loads(p.read_text(encoding="utf-8"))
        provenance.append({
            "itemId": item["id"],
            "path": rel(p, root),
            "sha256": sha256(p),
            "status": record.get("status", ""),
            "reviewDate": record.get("reviewDate", ""),
        })

    compiled = root / "RadicalTrainingPlatform.Web" / "js" / "study-content.js"
    return {
        "bundleVersion": BUNDLE_VERSION,
        "generatedBy": "scripts/check-content-bundle.py --write",
        "releaseState": RELEASE_STATE,
        "releaseNote": (
            "Draft packs compiled for the beginner preview. No item carries a "
            "human source review date; the artifact must not read as released "
            "study material."
        ),
        "disclaimer": parse_compiled_disclaimer(root),
        "compiled": {"path": rel(compiled, root), "sha256": sha256(compiled)},
        "exams": exams,
        "tracks": tracks,
        "provenance": provenance,
    }


def main():
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--write", action="store_true",
                        help="regenerate content-bundle.json from content/")
    parser.add_argument("--root", default=None,
                        help="tree to check (default: this repository); the fixture "
                             "workspace under tests/gates/fixtures/ uses this")
    args = parser.parse_args()

    root = pathlib.Path(args.root).resolve() if args.root else REPO_ROOT
    out_path = root / "RadicalTrainingPlatform.Web" / "content-bundle.json"

    gen = load_generator()

    if args.write:
        bundle = build_bundle(gen, root)
        out_path.write_text(json.dumps(bundle, indent=2) + "\n", encoding="utf-8")
        print(f"wrote {rel(out_path, root)} "
              f"({len(bundle['exams'])} exams, {len(bundle['provenance'])} provenance records)")
        return

    if not out_path.is_file():
        sys.exit(f"content bundle missing: {rel(out_path, root)} — run with --write")
    bundle = json.loads(out_path.read_text(encoding="utf-8"))

    failures = []

    # ── 1 + 2. Every referenced asset exists with a matching hash ──
    assets = [bundle["compiled"], *bundle["tracks"]]
    for exam in bundle["exams"].values():
        assets.append(exam["manifest"])
        assets.extend(exam["lessons"])
        assets.extend(exam["banks"])
    assets.extend(p for p in bundle["provenance"] if p.get("path"))

    for asset in assets:
        path = root / asset["path"]
        if not path.is_file():
            failures.append(f"missing asset: {asset['path']}")
            continue
        actual = sha256(path)
        if actual != asset["sha256"]:
            failures.append(
                f"hash mismatch: {asset['path']} (bundle {asset['sha256'][:12]}…, "
                f"on disk {actual[:12]}…) — regenerate the bundle")

    # ── 3. Every released lesson is referenced by an objective ──
    for exam_id, exam in bundle["exams"].items():
        manifest = json.loads((root / exam["manifest"]["path"]).read_text(encoding="utf-8"))
        named = {lid for section in manifest.get("sections", [])
                 for o in section.get("objectives", []) for lid in o.get("lessonIds", [])}
        for lesson in exam["lessons"]:
            if lesson["lessonId"].lower() not in {n.lower() for n in named}:
                failures.append(
                    f"dangling pack asset: {exam_id} lesson '{lesson['lessonId']}' "
                    f"is released but no objective names it in {exam['manifest']['path']}")
        declared = set(gen.RELEASED_BANKS.get(exam_id, []))
        for bank in exam["banks"]:
            if bank["bank"] not in declared:
                failures.append(
                    f"undeclared bank in bundle: {exam_id}/{bank['bank']} "
                    f"is not in the release record")

    # ── 4. Every shipped item comes from a released bank ──
    shipped_banks = {(eid, b["bank"]) for eid, e in bundle["exams"].items() for b in e["banks"]}
    for item in parse_compiled_items(root):
        exam_id, bank, _ = item["id"].split("/")
        if (exam_id, bank) not in shipped_banks:
            failures.append(
                f"unreviewed corpus ships: {item['id']} comes from {exam_id}/{bank}, "
                f"which the release record does not name")

    # ── 5. Review-state honesty ──
    for record in bundle["provenance"]:
        status = (record.get("status") or "").strip().lower()
        review_date = (record.get("reviewDate") or "").strip()
        if status == "reviewed" and not review_date:
            failures.append(
                f"review-state dishonesty: {record['itemId']} claims status 'reviewed' "
                f"with an empty reviewDate")
        if status and status != "draft" and status != "reviewed":
            failures.append(
                f"undeclared review state: {record['itemId']} has status '{status}', "
                f"which the bundle's release state '{bundle['releaseState']}' does not cover")

    if failures:
        print("CONTENT BUNDLE: FAIL")
        for f in failures:
            print(f"  {f}")
        sys.exit(1)

    print(f"CONTENT BUNDLE: PASS — {len(assets)} asset(s) present and hash-matched; "
          f"{len(bundle['provenance'])} shipped item(s) all from released packs, "
          f"release state '{bundle['releaseState']}'")


if __name__ == "__main__":
    main()
