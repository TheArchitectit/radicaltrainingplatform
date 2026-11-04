#!/usr/bin/env python3
"""renumber-incoming-banks.py — shift the Oct-11 drop's Q headers past existing IDs.

The Oct-11 drop added 13 banks under content/exams/ whose `### Qn` headers
restart at Q1 in every exam. Question IDs in this repo are
`<examId>/<sourceFile>/Q<n>`, and the existing banks in each exam already own
Q1..Q<max>:

  COMPTIA-A-1201  Q1..Q86   (core1-a2-fixtures Q1-Q16 + 5 domain banks)
  COMPTIA-A-1202  Q1..Q108  (core2-b2b4-fixtures Q1-Q8 + 4 domain banks)
  COMPTIA-NET-009 Q1..Q75   (5 fixture banks + 5 domain banks)
  NCA-75          Q1..Q44   (nca75-pilot)

The drop's headers must continue after the existing ones so no two items share
an ID. This script shifts each `### Qn` header by the exam's offset and
rewrites the inline provenance marker to match.

Usage:
  python3 scripts/renumber-incoming-banks.py --dry-run
  python3 scripts/renumber-incoming-banks.py --write
"""

from __future__ import annotations

import argparse
import json
import pathlib
import re
import sys

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent

BANKS = {
    "COMPTIA-A-1201": ["core1-part1.md", "core1-part2.md", "core1-part3.md"],
    "COMPTIA-A-1202": ["core2-part1.md", "core2-part2.md", "core2-part3.md"],
    "COMPTIA-NET-009": [f"net009-part{i}.md" for i in range(1, 6)],
    "NCA-75": ["nca75-new-part1.md", "nca75-new-part2.md"],
}

# Highest existing Qn per exam (verified against the bank files).
OFFSET = {
    "COMPTIA-A-1201": 86,
    "COMPTIA-A-1202": 108,
    "COMPTIA-NET-009": 75,
    "NCA-75": 44,
}

HEADER_RE = re.compile(r"^###\s+Q(\d+)", re.MULTILINE)
MARKER_RE = re.compile(r"(<!--\s*\{[^}]+\}[^>]*-->)")
JSON_IN_MARKER = re.compile(r"\{.*\}")


def renumber_file(path: pathlib.Path, offset: int) -> tuple[int, list[str]]:
    """Shift Q headers and marker IDs in one bank file.

    Returns (changes_made, list of new_header_numbers).
    """
    text = path.read_text(encoding="utf-8")
    changes = []
    new_numbers = []

    def shift_header(m: re.Match) -> str:
        old_n = int(m.group(1))
        new_n = old_n + offset
        new_numbers.append(new_n)
        changes.append(f"  header Q{old_n} → Q{new_n}")
        return f"### Q{new_n}"

    text = HEADER_RE.sub(shift_header, text)

    # Update inline marker `id` fields to match the new numbering.
    # Markers appear in order after each question's text.
    marker_order = list(MARKER_RE.finditer(text))
    header_order = HEADER_RE.findall(text)
    assert len(marker_order) == len(header_order), (
        f"{path.name}: {len(header_order)} headers but {len(marker_order)} markers"
    )

    result = text
    for marker_m, header_str in zip(marker_order, header_order):
        new_n = int(header_str)
        old_marker = marker_m.group(1)
        json_m = JSON_IN_MARKER.search(old_marker)
        if not json_m:
            continue
        try:
            data = json.loads(json_m.group(0))
        except json.JSONDecodeError:
            continue
        old_id = data.get("id", "")
        # Replace the trailing Q number in the marker id.
        new_id = re.sub(r"Q\d+$", f"Q{new_n}", old_id)
        if new_id != old_id:
            new_marker = old_marker.replace(f'"{old_id}"', f'"{new_id}"')
            result = result.replace(old_marker, new_marker, 1)
            changes.append(f"  marker id {old_id} → {new_id}")

    if result != text:
        path.write_text(result, encoding="utf-8")

    return len(changes), new_numbers


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--dry-run", action="store_true", help="report only")
    ap.add_argument("--write", action="store_true", help="apply changes")
    args = ap.parse_args()
    write = args.write and not args.dry_run

    total_changes = 0
    for exam_id, banks in BANKS.items():
        offset = OFFSET[exam_id]
        print(f"\n{exam_id} (offset +{offset}):")
        for bank in banks:
            path = REPO_ROOT / "content" / "exams" / exam_id / "questions" / bank
            if not path.is_file():
                print(f"  {bank}: MISSING")
                continue
            if write:
                n_changes, numbers = renumber_file(path, offset)
                print(f"  {bank}: {n_changes} changes, Q{numbers[0]}-Q{numbers[-1]}")
            else:
                headers = [int(x) for x in HEADER_RE.findall(path.read_text())]
                print(f"  {bank}: would shift Q{headers[0]}-Q{headers[-1]} "
                      f"→ Q{headers[0]+offset}-Q{headers[-1]+offset}")
            total_changes += 1

    mode = "applied" if write else "would apply"
    print(f"\n{mode} to {total_changes} bank files.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
