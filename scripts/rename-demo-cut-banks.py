#!/usr/bin/env python3
"""rename-demo-cut-banks.py — SPEC-19, executed once.

Renames the seven October 23 demo-cut banks from `*-fixtures.md` to
`*-demo-cut.md` and moves every reference that is a live path or ID:

  content/exams/<exam>/questions/<bank>.md      the file itself
  content/provenance/<exam>/Q<n>.json           itemId + demoCut
  content-manifest.json                         regenerated afterwards
  RELEASED_BANKS in generate-study-content.py
  test item IDs in tests/gates/web/*.mjs and ContentFormats.js examples

It does not touch historical records: `docs/sprints/*EVIDENCE*`,
`docs/qa/release-evidence/*` and the pears in `tests/gates/*fixtures.sh`
that use a bank as a fixture *input* either keep the old name (a fixture that
names a file it does not own) or are handled by hand where they assert a path.

Usage:
  python3 scripts/rename-demo-cut-banks.py --dry-run
  python3 scripts/rename-demo-cut-banks.py --write
"""

from __future__ import annotations

import argparse
import json
import pathlib
import re
import sys

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent

RENAMES = {
    "COMPTIA-A-1201": {
        "core1-a2-fixtures.md": "core1-demo-cut.md",
    },
    "COMPTIA-A-1202": {
        "core2-b2b4-fixtures.md": "core2-demo-cut.md",
    },
    "COMPTIA-NET-009": {
        "net009-n1-fixtures.md": "net009-n1-demo-cut.md",
        "net009-n2-fixtures.md": "net009-n2-demo-cut.md",
        "net009-n3-fixtures.md": "net009-n3-demo-cut.md",
        "net009-n4-fixtures.md": "net009-n4-demo-cut.md",
        "net009-n5-fixtures.md": "net009-n5-demo-cut.md",
    },
}

DEMO_CUT_DATE = "2026-10-23"

# Live sources that name a bank as a path or an item ID. Historical records
# (sprint evidence, QA evidence) are deliberately absent.
LIVE_SOURCES = [
    "scripts/generate-study-content.py",
    "scripts/renumber-incoming-banks.py",
    "scripts/redeye-lane.py",
    "scripts/check-item-hygiene.py",
    "RadicalTrainingPlatform.Web/js/core/ContentFormats.js",
]
LIVE_GLOBS = ["tests/gates/web/*.mjs"]


def all_pairs():
    for exam, mapping in RENAMES.items():
        for old, new in mapping.items():
            yield exam, old, new


def rename_files(write: bool) -> list[str]:
    log = []
    for exam, old, new in all_pairs():
        src = REPO_ROOT / "content" / "exams" / exam / "questions" / old
        dst = src.with_name(new)
        if not src.is_file():
            log.append(f"MISSING  {src.relative_to(REPO_ROOT)}")
            continue
        log.append(f"move     {src.relative_to(REPO_ROOT)} -> {new}")
        if write:
            src.rename(dst)
    return log


def rewrite_provenance(write: bool) -> list[str]:
    log = []
    for exam, old, new in all_pairs():
        prov = REPO_ROOT / "content" / "provenance" / exam
        if not prov.is_dir():
            continue
        touched = 0
        for record in sorted(prov.glob("Q*.json")):
            data = json.loads(record.read_text(encoding="utf-8"))
            item_id = str(data.get("itemId", ""))
            if f"/{old}/" not in item_id:
                continue
            data["itemId"] = item_id.replace(f"/{old}/", f"/{new}/")
            data.setdefault("demoCut", DEMO_CUT_DATE)
            if write:
                record.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
            touched += 1
        log.append(f"prov     {exam}/{old}: {touched} record(s)")
    return log


def rewrite_sources(write: bool) -> list[str]:
    log = []
    targets = [REPO_ROOT / p for p in LIVE_SOURCES]
    for pattern in LIVE_GLOBS:
        targets.extend(sorted(REPO_ROOT.glob(pattern)))
    for path in targets:
        if not path.is_file():
            log.append(f"MISSING  {path.relative_to(REPO_ROOT)}")
            continue
        text = path.read_text(encoding="utf-8")
        original = text
        for _exam, old, new in all_pairs():
            text = text.replace(old, new)
        if text != original:
            n = sum(original.count(old) for _e, old, _n in all_pairs())
            log.append(f"rewrite  {path.relative_to(REPO_ROOT)}: {n} occurrence(s)")
            if write:
                path.write_text(text, encoding="utf-8")
    return log


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--write", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()
    write = args.write and not args.dry_run

    for line in rename_files(write) + rewrite_provenance(write) + rewrite_sources(write):
        print(line)
    print()
    print("applied" if write else "would apply")
    return 0


if __name__ == "__main__":
    sys.exit(main())
