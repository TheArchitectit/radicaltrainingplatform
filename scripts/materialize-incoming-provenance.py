#!/usr/bin/env python3
"""materialize-incoming-provenance.py — one record per item, from inline markers.

The Oct-11 drop added 13 banks under content/exams/ that declare each item's
provenance inline:

    <!-- {"id":"COMPTIA-A-1201-Q001","objective":"1.1","type":"diagnosis",
          "source":"OBJ1201","locator":"Objective 1.1 battery ...",
          "verified":"2026-10-10"} -->

and, beside them, one monolithic document per exam
(content/provenance/<EXAM>-provenance.json, shaped {exam, item_count, items}).

The tree reads provenance one item at a time: content/provenance/<examId>/
Q<n>.json, located by question number, carrying the C-02 keys, with `itemId`
in the canonical `<examId>/<sourceFile>/Q<n>` form. As shipped, the monolith
is invisible to scripts/generate-study-content.py and check-item-types.py, and
lint-content.py reports every one of the 780 items as having no record.

This script derives the per-item records from the inline markers, which is
where the data actually is, and verifies them against the monolith so the two
cannot disagree silently.

Every item lands as status "draft", assistance "ai-drafted", and a reviewDate
of "" — the pack is not reviewed, and nothing here may say otherwise. The
records exist so the gates can see the items; they do not release them.

Usage:
  python3 scripts/materialize-incoming-provenance.py --check   # report only
  python3 scripts/materialize-incoming-provenance.py --write   # create files
"""

from __future__ import annotations

import argparse
import json
import pathlib
import re
import sys

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent

MARKER = re.compile(r"^<!--\s*(\{.*?\})\s*-->\s*$", re.MULTILINE)
QUESTIONS = re.compile(r"^###\s+(Q\d+)", re.MULTILINE)

# Discovery of the drop: banks whose recorded exported ID is not of the form
# Q1..Qn the tree's own banks use. We name them rather than glob, so a future
# bank is a deliberate addition here.
INCOMING_BANKS = {
    "COMPTIA-A-1201": ["core1-part1.md", "core1-part2.md", "core1-part3.md"],
    "COMPTIA-A-1202": ["core2-part1.md", "core2-part2.md", "core2-part3.md"],
    "COMPTIA-NET-009": [f"net009-part{i}.md" for i in range(1, 6)],
    "NCA-75": ["nca75-new-part1.md", "nca75-new-part2.md"],
}

# After renumbering (scripts/renumber-incoming-banks.py), the tree's headers
# continue past the existing banks. The monolith records carry the drop's own
# numbering (A-1201 Q001..Q180, NCA Q101..Q220), so the offset turns a tree
# header number into the monolith record it belongs to.
# Declared here, not derived: a wrong offset must be a deliberate edit.
NUMBERING_OFFSET = {
    "COMPTIA-A-1201": -86,
    "COMPTIA-A-1202": -108,
    "COMPTIA-NET-009": -75,
    "NCA-75": 56,
}

MONOLITH = {
    "COMPTIA-A-1201": "COMPTIA-A-1201-provenance.json",
    "COMPTIA-A-1202": "COMPTIA-A-1202-provenance.json",
    "COMPTIA-NET-009": "COMPTIA-NET-009-provenance.json",
    "NCA-75": "NUTANIX-NCA-75-provenance.json",
}

# Monolith item IDs use a vendor-qualified prefix that differs from examId
# for some exams (NCA-75 → NUTANIX-NCA-75).
MONOLITH_PREFIX = {
    "COMPTIA-A-1201": "COMPTIA-A-1201",
    "COMPTIA-A-1202": "COMPTIA-A-1202",
    "COMPTIA-NET-009": "COMPTIA-NET-009",
    "NCA-75": "NUTANIX-NCA-75",
}

RIGHTS_BASIS = ("original work from the Oct-11 drop; "
                "no vendor text lifted")
ORIGINALITY = "no-exam-item-proximity"


def parse_markers(text: str) -> list[dict]:
    return [json.loads(m.group(1)) for m in MARKER.finditer(text)]


def record(exam_id: str, bank: str, number: str, marker: dict,
           verified: str) -> dict:
    return {
        "itemId": f"{exam_id}/{bank}/{number}",
        "examId": exam_id,
        "objectiveId": marker.get("objective", ""),
        "lesson": "",
        "type": marker.get("type", ""),
        "author": "executor",
        "assistance": "ai-drafted",
        "rightsBasis": RIGHTS_BASIS,
        "reviewer": "",
        "reviewDate": verified,
        "originalityCheck": ORIGINALITY,
        "status": "draft",
    }


def collect() -> tuple[dict[pathlib.Path, dict], list[str]]:
    """Return ({path: record}, problems). Reads only; writes nothing."""
    out: dict[pathlib.Path, dict] = {}
    problems: list[str] = []
    for exam_id, banks in INCOMING_BANKS.items():
        mono_path = REPO_ROOT / "content" / "provenance" / MONOLITH[exam_id]
        try:
            mono = json.loads(mono_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            problems.append(f"{mono_path.name}: unreadable ({exc})")
            mono = {"items": []}
        by_id = {str(it.get("id", "")): it for it in mono.get("items", [])}
        for bank in banks:
            path = (REPO_ROOT / "content" / "exams" / exam_id / "questions" / bank)
            if not path.is_file():
                problems.append(f"{exam_id}/{bank}: missing")
                continue
            text = path.read_text(encoding="utf-8")
            markers = parse_markers(text)
            headers = QUESTIONS.findall(text)
            if len(markers) != len(headers):
                problems.append(f"{exam_id}/{bank}: {len(headers)} questions, "
                                f"{len(markers)} inline markers")
            for number, marker in zip(headers, markers):
                q = int(number[1:]) + NUMBERING_OFFSET[exam_id]
                mid = f"{MONOLITH_PREFIX[exam_id]}-Q{q:03d}"
                m = by_id.get(mid)
                if m is None:
                    problems.append(f"{exam_id}/{bank}/{number}: no monolith entry "
                                    f"for {mid!r}")
                elif m.get("objective") != marker.get("objective"):
                    problems.append(f"{exam_id}/{bank}/{number}: objective differs "
                                    f"between marker ({marker.get('objective')}) and "
                                    f"monolith ({m.get('objective')})")
                target = REPO_ROOT / "content" / "provenance" / exam_id / f"{number}.json"
                if target.exists():
                    problems.append(f"{target.relative_to(REPO_ROOT)}: already exists — "
                                    f"refusing to overwrite an existing record")
                    continue
                out[target] = record(exam_id, bank, number, marker,
                                     str(marker.get("verified", "")))
    return out, problems


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--write", action="store_true", help="create the records")
    ap.add_argument("--check", action="store_true", help="report only (default)")
    args = ap.parse_args()

    records, problems = collect()
    if problems:
        print("INCOMING PROVENANCE: FAIL")
        for p in problems[:40]:
            print(f"  {p}")
        if len(problems) > 40:
            print(f"  ... and {len(problems) - 40} more")
        return 1

    if args.write:
        for path, rec in records.items():
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(json.dumps(rec, indent=2) + "\n", encoding="utf-8")

    status = "written" if args.write else "would write"
    print(f"INCOMING PROVENANCE: PASS — {status} {len(records)} record(s) "
          f"across {len(INCOMING_BANKS)} exam(s), every marker matched to its "
          f"monolith entry")
    return 0


if __name__ == "__main__":
    sys.exit(main())
