#!/usr/bin/env python3
"""README count-truth gate (R-12, T-25b / S47-16).

R-12's passing condition is "generated counts match". The README states four
numbers about what ships — exam manifests, tracks, released items (with a
per-exam breakdown) and release state — and, until this gate, nothing compared
them to anything. They were right by hand, which is not the same as right.

The counts are read from `content-manifest.json`, which
`scripts/generate-bundle-manifest.py` generates from `content/` and which CI
re-checks with `--check`; the compiled `study-content.js` bundle is drift-checked
against the same tree by `generate-study-content.py --check`. So this gate ties
the README to the artifact the README names, through the generator that already
owns the truth.

Failures:
  1. the exam-manifest, track or released-item count does not match the manifest;
  2. the per-exam breakdown does not match the manifest's per-exam counts;
  3. an exam in the manifest is missing from the README breakdown, or the README
     names a label this gate does not know (a new exam must be added here, not
     silently ignored);
  4. the badge number disagrees with the table (the badge is what a reader sees
     first, and it is a second place the same number can go stale);
  5. the release state in the README is not the manifest's `releaseState`.

Exit 0: clean. Exit 1: failures listed.
"""
import argparse
import json
import re
import sys
from collections import Counter
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

# README display label → manifest exam id. An unknown label is a failure, not a
# skip: adding an exam to the manifest without teaching this map about it must
# not pass quietly.
LABELS = {
    "A+ Core 1": "COMPTIA-A-1201",
    "A+ Core 2": "COMPTIA-A-1202",
    "Network+": "COMPTIA-NET-009",
    "NCA 7.5": "NCA-75",
    "Azure AZ-104": "AZ-104",
}

EXAMS_RE = re.compile(r"\|\s*Exam manifests\s*\|\s*\*\*(\d+)\*\*")
TRACKS_RE = re.compile(r"\|\s*Tracks\s*\|\s*\*\*(\d+)\*\*")
ITEMS_RE = re.compile(r"\|\s*Released items\s*\|\s*\*\*(\d+)\*\*\s*—\s*([^|]+)")
STATE_RE = re.compile(r"\|\s*Release state\s*\|\s*`([^`]+)`")
BADGE_RE = re.compile(r"Released%20items-(\d+)-")
BREAKDOWN_RE = re.compile(r"([^·:]+):\s*(\d+)")
TRACK_ID_RE = re.compile(r"`(track-[a-z]+)`")


def per_exam_counts(manifest: dict) -> Counter:
    """Provenance entries are `content/provenance/<examId>/<item>.json`."""
    counts: Counter = Counter()
    for record in manifest.get("provenance", []):
        parts = Path(record["path"]).parts
        if len(parts) >= 3:
            counts[parts[2]] += 1
    return counts


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--root",
        type=Path,
        default=REPO_ROOT,
        help="tree to check (fixtures use this); default: the repo root",
    )
    args = parser.parse_args()

    root = args.root if args.root.is_absolute() else REPO_ROOT / args.root
    readme_path = root / "README.md"
    manifest_path = root / "content-manifest.json"
    for path in (readme_path, manifest_path):
        if not path.is_file():
            print(f"README COUNTS: FAIL — not found: {path}", file=sys.stderr)
            return 1

    readme = readme_path.read_text(encoding="utf-8")
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))

    exam_ids = sorted(manifest.get("exams", {}))
    track_ids = sorted(Path(t["path"]).parts[2] for t in manifest.get("tracks", []))
    items = manifest.get("provenance", [])
    by_exam = per_exam_counts(manifest)

    failures: list[str] = []

    def compare(label: str, pattern: re.Pattern, actual: int) -> re.Match | None:
        match = pattern.search(readme)
        if not match:
            failures.append(f"README: no '{label}' row found (R-12 needs it stated)")
            return None
        if int(match.group(1)) != actual:
            failures.append(
                f"README: '{label}' says {match.group(1)}, generated manifest has {actual}"
            )
        return match

    compare("Exam manifests", EXAMS_RE, len(exam_ids))
    compare("Tracks", TRACKS_RE, len(track_ids))
    items_match = compare("Released items", ITEMS_RE, len(items))

    badge = BADGE_RE.search(readme)
    if not badge:
        failures.append("README: no 'Released items' badge found")
    elif int(badge.group(1)) != len(items):
        failures.append(
            f"README badge: says {badge.group(1)} released items, manifest has {len(items)}"
        )

    if items_match:
        breakdown = items_match.group(2)
        seen: set[str] = set()
        for raw_label, raw_count in BREAKDOWN_RE.findall(breakdown):
            label = raw_label.strip()
            exam_id = LABELS.get(label)
            if exam_id is None:
                failures.append(
                    f"README breakdown: unknown exam label {label!r} — add it to "
                    "LABELS in scripts/check-readme-counts.py so it is checked"
                )
                continue
            seen.add(exam_id)
            if int(raw_count) != by_exam.get(exam_id, 0):
                failures.append(
                    f"README breakdown: {label} says {raw_count}, manifest has "
                    f"{by_exam.get(exam_id, 0)}"
                )
        for exam_id in exam_ids:
            if exam_id not in seen:
                failures.append(
                    f"README breakdown: manifest exam {exam_id} has no count in "
                    "the README (a reader cannot see what ships for it)"
                )

    state = STATE_RE.search(readme)
    actual_state = manifest.get("releaseState")
    if not state:
        failures.append("README: no 'Release state' row found")
    elif state.group(1) != actual_state:
        failures.append(
            f"README: release state {state.group(1)!r}, manifest has {actual_state!r}"
        )

    named_tracks = set(TRACK_ID_RE.findall(readme))
    for track_id in track_ids:
        if track_id not in named_tracks:
            failures.append(f"README: manifest track {track_id} is not named in the README")

    if failures:
        print(f"README COUNTS: FAIL — {len(failures)} problem(s)", file=sys.stderr)
        for failure in failures:
            print(f"  {failure}", file=sys.stderr)
        return 1

    print(
        f"README COUNTS: PASS — {len(exam_ids)} exams, {len(track_ids)} tracks, "
        f"{len(items)} items ({', '.join(f'{e}={by_exam.get(e, 0)}' for e in exam_ids)}), "
        f"state {actual_state!r} — all match the generated manifest"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
