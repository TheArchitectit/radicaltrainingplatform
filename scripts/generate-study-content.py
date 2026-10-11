#!/usr/bin/env python3
"""Compile content/ into RadicalTrainingPlatform.Web/js/study-content.js (T-11).

The GitHub Pages artifact is only RadicalTrainingPlatform.Web/, so the PWA
cannot fetch content/ at runtime. This script compiles the manifest world —
track manifests, exam manifests, reviewed lessons, question banks, provenance
records — into one committed JS data module the study views import directly.

What counts as released (REQ-MAN-07 coverage semantics):
  an objective is "covered" when it has >=1 released lesson AND >=1 released
  scored item. Released = status in the bank's release record, which today is
  provenance status "draft" (the October 23 packs are draft pending RedEye
  model-stage integration). Coverage therefore reflects draft packs honestly:
  the UI labels them "beginner preview" and never implies pass readiness.

Output shape (study-content.js):
  export const TRACKS, EXAMS, LESSONS, ITEMS, DISCLAIMER (exact REQ-BRAND-02
  string, stored once here and rendered by reference, REQ-BRAND-02).

Drift gate: --check re-generates and compares against the committed file so
content edits cannot silently desync the PWA view of the content world.
"""
import argparse
import hashlib
import json
import pathlib
import re
import sys

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent
CONTENT = REPO_ROOT / "content"
OUT_PATH = REPO_ROOT / "RadicalTrainingPlatform.Web" / "js" / "study-content.js"

QUESTION_HEADER = re.compile(r"^###\s+(Q\d+)", re.MULTILINE)
ANSWER_LINE = re.compile(
    r"^\*\*(?:Correct )?Answer:\s*([A-F](?:\s*(?:,|and|&)?\s*[A-F])*)\s*\*\*",
    re.MULTILINE,
)

# REQ-AP-02 / REQ-NP-02: the October 23 demo cut. Released lesson IDs per
# exam; everything else renders as "planned". Released scored items are the
# banks listed here; draft provenance status is the honest release state.
RELEASED_LESSONS = {
    "COMPTIA-A-1201": ["a2"],
    "COMPTIA-A-1202": [],
    "COMPTIA-NET-009": ["n5"],
    "NCA-75": [],
}
RELEASED_BANKS = {
    "COMPTIA-A-1201": ["core1-a2-fixtures.md"],
    "COMPTIA-A-1202": [],
    "COMPTIA-NET-009": ["net009-n5-fixtures.md"],
    "NCA-75": [],
}


def parse_bank(path):
    """[(number, stem, options, keys, explanation)] — mirrors QuestionParser."""
    content = path.read_text(encoding="utf-8")
    headers = list(QUESTION_HEADER.finditer(content))
    items = []
    for i, match in enumerate(headers):
        text = content[match.start(): headers[i + 1].start() if i + 1 < len(headers) else len(content)]
        stem = ""
        options = {}
        keys = []
        explanation = ""
        stem_lines, in_explanation = [], False
        for line in text.splitlines()[1:]:
            # Skip the "### Qn" header line itself — it is the ID, not stem text.
            stripped = line.strip()
            if in_explanation:
                # The question separator ends this item's explanation.
                if stripped == '---':
                    in_explanation = False
                    continue
                explanation += line + "\n"
                continue
            if stripped.startswith("- ") or stripped.startswith("* "):
                m = re.match(r"^[-*]\s+([A-F])\)\s*(.+)$", stripped)
                if m:
                    options[m.group(1)] = m.group(2).strip()
                    continue
            m = ANSWER_LINE.search(stripped)
            if m:
                keys = re.findall(r"[A-F]", m.group(1))
                in_explanation = True
                continue
            if stripped and not stem:
                # First non-empty line after the header is the stem.
                stem = stripped
            elif stripped:
                stem += " " + stripped
        items.append({
            "number": match.group(1),
            "stem": stem.strip(),
            "options": options,
            "keys": keys,
            "explanation": explanation.strip(),
        })
    return items


def load_exams():
    exams = {}
    for manifest_path in sorted((CONTENT / "exams").glob("*/exam.json")):
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        exam_id = manifest["examId"]
        exams[exam_id] = manifest
    return exams


def compute_coverage(exam_id, released_lessons, released_item_objectives):
    """REQ-MAN-07: objectives with >=1 released lesson AND >=1 released item."""
    exam = load_exams()[exam_id]
    total = 0
    covered = 0
    covered_ids = []
    for section in exam.get("sections", []):
        for objective in section.get("objectives", []):
            total += 1
            has_lesson = any(
                lid in released_lessons for lid in objective.get("lessonIds", []))
            has_item = objective["id"] in released_item_objectives
            if has_lesson and has_item:
                covered += 1
                covered_ids.append(objective["id"])
    return {
        "total": total,
        "covered": covered,
        "percent": round(100 * covered / total) if total else 0,
        "coveredObjectiveIds": covered_ids,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--check", action="store_true",
                        help="verify the committed file matches content/ and exit")
    args = parser.parse_args()

    exams = load_exams()

    # Released scored items + the objective each covers (via provenance).
    items = []
    released_objectives = {eid: set() for eid in exams}
    for exam_id, banks in RELEASED_BANKS.items():
        for bank in banks:
            bank_path = CONTENT / "exams" / exam_id / "questions" / bank
            if not bank_path.is_file():
                sys.exit(f"released bank missing: {bank_path}")
            for item in parse_bank(bank_path):
                item_id = f"{exam_id}/{bank}/{item['number']}"
                prov_path = CONTENT / "provenance" / exam_id / f"{item['number']}.json"
                objective_id = ""
                if prov_path.is_file():
                    record = json.loads(prov_path.read_text(encoding="utf-8"))
                    if record.get("itemId") == item_id:
                        objective_id = record.get("objectiveId", "")
                if not objective_id:
                    sys.exit(f"{item_id}: no matching provenance record — refusing to emit an untracked scored item")
                released_objectives[exam_id].add(objective_id)
                items.append({
                    "id": item_id,
                    "examId": exam_id,
                    "number": item["number"],
                    "stem": item["stem"],
                    "options": item["options"],
                    "keys": item["keys"],
                    "explanation": item["explanation"],
                    "objectiveId": objective_id,
                    "isMultiSelect": len(item["keys"]) > 1,
                    "provenanceStatus": "draft",
                    "textHash": hashlib.sha256(
                        (bank_path.read_text(encoding="utf-8") + item["number"]).encode("utf-8")).hexdigest()[:16],
                    "bank": bank,
                })

    # Lessons: released ones parsed to sections; planned ones as outlines.
    modules = {
        "COMPTIA-A-1201": [
            ("A1", "Mobile devices and accessories", "1"),
            ("A2", "Networking basics", "2"),
            ("A3", "Hardware and peripherals", "3"),
            ("A4", "Virtualization and cloud", "4"),
            ("A5", "Hardware/network troubleshooting", "5"),
        ],
        "COMPTIA-A-1202": [
            ("B1", "Operating systems and configuration", "1"),
            ("B2", "Security and ticketing basics", "2"),
            ("B3", "Software troubleshooting", "3"),
            ("B4", "Operational procedures", "4"),
        ],
        "COMPTIA-NET-009": [
            ("N1", "Networking concepts", "1"),
            ("N2", "Network implementation", "2"),
            ("N3", "Network operations", "3"),
            ("N4", "Network security", "4"),
            ("N5", "Network troubleshooting", "5"),
        ],
    }
    lessons = {}
    for exam_id, mods in modules.items():
        released_ids = RELEASED_LESSONS[exam_id]
        for module_id, title, domain_number in mods:
            if module_id.lower() in (r.lower() for r in released_ids):
                lesson_path = CONTENT / "exams" / exam_id / "lessons" / f"{module_id.lower()}.md"
                if not lesson_path.is_file():
                    sys.exit(f"released lesson missing: {lesson_path}")
                body = lesson_path.read_text(encoding="utf-8")
                # Objective IDs this lesson maps to (from the manifest).
                objective_ids = [
                    o["id"] for section in exams[exam_id]["sections"]
                    for o in section.get("objectives", []) if module_id.lower() in o.get("lessonIds", [])
                ]
                lessons[f"{exam_id}/{module_id}"] = {
                    "lessonId": module_id,
                    "examId": exam_id,
                    "title": title,
                    "domainNumber": domain_number,
                    "status": "released",
                    "markdown": body,
                    "objectiveIds": objective_ids,
                }
            else:
                lessons[f"{exam_id}/{module_id}"] = {
                    "lessonId": module_id,
                    "examId": exam_id,
                    "title": title,
                    "domainNumber": domain_number,
                    "status": "planned",
                    "markdown": "",
                    "objectiveIds": [],
                }

    tracks = {}
    for track_dir in sorted((CONTENT / "tracks").glob("*/track.json")):
        manifest = json.loads(track_dir.read_text(encoding="utf-8"))
        track_id = manifest["trackId"]
        coverage = {"total": 0, "covered": 0, "percent": 0, "coveredObjectiveIds": []}
        total = covered = 0
        for exam_id in manifest["examIds"]:
            if exam_id not in exams:
                sys.exit(f"{track_id}: examId {exam_id} has no manifest")
            cov = compute_coverage(exam_id, RELEASED_LESSONS[exam_id],
                                   released_objectives[exam_id])
            total += cov["total"]
            covered += cov["covered"]
            coverage["examCoverage"] = coverage.get("examCoverage", {})
            coverage["examCoverage"][exam_id] = cov
        coverage["total"] = total
        coverage = {**coverage, "covered": covered,
                    "percent": round(100 * covered / total) if total else 0}
        tracks[track_id] = {
            **manifest,
            "coverage": coverage,
            "lessons": sorted(k for k, v in lessons.items() if v["examId"] in manifest["examIds"]),
        }

    # REQ-BRAND-02: the disclaimer stored once, rendered by reference.
    disclaimer = ""
    for manifest in tracks.values():
        if manifest.get("disclaimer"):
            disclaimer = manifest["disclaimer"]
            break
    if not disclaimer:
        sys.exit("no disclaimer found in any track manifest")

    payload = {"tracks": tracks, "exams": exams, "lessons": lessons, "items": items}
    js = (
        "// GENERATED by scripts/generate-study-content.py — do not edit.\n"
        "// Source of truth: content/ (track/exam manifests, lessons, banks, provenance).\n"
        f"// Compiled: static (no Date.now); drift-gated in CI via --check.\n"
        "export const TRACKS = " + json.dumps(payload["tracks"], indent=2) + ";\n"
        "export const EXAMS = " + json.dumps(payload["exams"], indent=2) + ";\n"
        "export const LESSONS = " + json.dumps(payload["lessons"], indent=2) + ";\n"
        "export const ITEMS = " + json.dumps(payload["items"], indent=2) + ";\n"
        "export const DISCLAIMER = " + json.dumps(disclaimer) + ";\n"
    )

    if args.check:
        if not OUT_PATH.is_file():
            sys.exit(f"drift: {OUT_PATH} missing — run scripts/generate-study-content.py")
        committed = OUT_PATH.read_text(encoding="utf-8")
        if committed != js:
            sys.exit("drift: content/ changed without regenerating study-content.js — "
                     "run scripts/generate-study-content.py")
        print("study-content.js up to date with content/")
        return

    OUT_PATH.write_text(js, encoding="utf-8")
    print(f"wrote {OUT_PATH} ({len(items)} items, {len(lessons)} lesson slots, "
          f"{len(tracks)} tracks)")


if __name__ == "__main__":
    main()
