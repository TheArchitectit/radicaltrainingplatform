#!/usr/bin/env python3
"""Legacy identity collision detector (R-13 / TM-81).

Scans every question bank — legacy root *.md and content/exams/*/questions/*.md —
and asserts that no two items claim the same semantic ID:

    <examId>/<sourceFile>/Q<localId>

Multi-part legacy banks restart numbering per file (every NCA-75-PartN.md
begins at Q1), so the bare "EXAM:number" scheme collides by construction.
That is the defect this detector exists to keep out of the storage keys:
the semantic ID disambiguates by source file. This gate fails when two items
in one exam, one source file, share a local question number (a true
collision), and reports the legacy EXAM:number collisions as an informational
count so the migration stays visible.

Exit codes:
  0 — zero live semantic-ID collisions
  1 — collision found, or a bank is unparseable
  2 — fixture assertion failed (--self-test)
"""
from __future__ import annotations

import argparse
import pathlib
import re
import sys
import tempfile

QUESTION_HEADER = re.compile(r"^###\s+Q(\d+)", re.MULTILINE)
SUFFIX_STRIP = re.compile(
    r"^(.+?)-(?:Part\d+(?:-.*)?|D\d+(?:-.*)?|GapFill(?:-.*)?)$", re.IGNORECASE
)


def derive_exam_code(file_name: str) -> str:
    """Port of QuestionParser.DeriveExamCode for legacy root banks."""
    name = pathlib.Path(file_name).stem
    current = name
    while True:
        m = SUFFIX_STRIP.match(current)
        if not m:
            break
        current = m.group(1)
    parts = current.split("-")
    if len(parts) >= 2:
        return f"{parts[0]}-{parts[1]}"
    return current


def collect_items(root: pathlib.Path) -> list[dict]:
    items: list[dict] = []

    for md in sorted(root.glob("*.md")):
        if md.name in ("CLAUDE.md", "README.md"):
            continue
        exam_id = derive_exam_code(md.name)
        local_ids = [int(n) for n in QUESTION_HEADER.findall(md.read_text(encoding="utf-8"))]
        for n in local_ids:
            items.append({"examId": exam_id, "sourceFile": md.name, "localId": n})

    exams_dir = root / "content" / "exams"
    if exams_dir.is_dir():
        for exam_dir in sorted(p for p in exams_dir.iterdir() if p.is_dir()):
            qdir = exam_dir / "questions"
            if not qdir.is_dir():
                continue
            for md in sorted(qdir.glob("*.md")):
                local_ids = [int(n) for n in QUESTION_HEADER.findall(md.read_text(encoding="utf-8"))]
                for n in local_ids:
                    items.append(
                        {"examId": exam_dir.name, "sourceFile": md.name, "localId": n}
                    )

    return items


def semantic_id(item: dict) -> str:
    return f"{item['examId']}/{item['sourceFile']}/Q{item['localId']}"


def detect(items: list[dict]) -> tuple[list[str], int]:
    """Return (collisions, legacy_ambiguous_count)."""
    by_id: dict[str, list[dict]] = {}
    for it in items:
        by_id.setdefault(semantic_id(it), []).append(it)

    collisions = sorted(
        f"{sid} claimed by {len(group)} items"
        for sid, group in by_id.items()
        if len(group) > 1
    )

    # Legacy EXAM:number collisions: same exam + local id across different
    # source files. Expected for multi-part banks — reported, not a failure.
    by_legacy: dict[tuple[str, int], set[str]] = {}
    for it in items:
        by_legacy.setdefault((it["examId"], it["localId"]), set()).add(it["sourceFile"])
    legacy_ambiguous = sum(1 for files in by_legacy.values() if len(files) > 1)

    return collisions, legacy_ambiguous


def run_self_test() -> int:
    failures: list[str] = []
    with tempfile.TemporaryDirectory() as td:
        root = pathlib.Path(td)

        # Passing fixture: two Q1 items from two files in one exam are clean
        # under the semantic scheme (the R-13 acceptance fixture).
        clean = root / "clean"
        clean.mkdir()
        (clean / "EX-1-Part1.md").write_text(
            "# Bank\n\n### Q1\nA?\n**Answer: A**\n", encoding="utf-8"
        )
        (clean / "EX-1-Part2.md").write_text(
            "# Bank\n\n### Q1\nB?\n**Answer: B**\n\n### Q2\nC?\n**Answer: C**\n",
            encoding="utf-8",
        )
        items = collect_items(clean)
        collisions, legacy = detect(items)
        if collisions:
            failures.append(f"clean fixture must have zero collisions, got {collisions}")
        if legacy != 1:
            failures.append(f"clean fixture should report 1 legacy EXAM:number collision, got {legacy}")
        if len(items) != 3:
            failures.append(f"clean fixture should yield 3 items, got {len(items)}")

        # Failing fixture: a seeded duplicate (same exam + source + local id)
        # must be detected.
        dirty = root / "dirty"
        dirty.mkdir()
        (dirty / "EX-1-Part1.md").write_text(
            "# Bank\n\n### Q1\nA?\n**Answer: A**\n\n### Q1\nDup?\n**Answer: B**\n",
            encoding="utf-8",
        )
        items = collect_items(dirty)
        collisions, _ = detect(items)
        if len(collisions) != 1:
            failures.append(f"seeded-collision fixture must report 1 collision, got {collisions}")
        elif "EX-1/EX-1-Part1.md/Q1" not in collisions[0]:
            failures.append(f"seeded collision not named correctly: {collisions[0]}")

        # Same local id in two exams is legal (REQ-MAN-05) and must not collide.
        multi = root / "multi"
        multi.mkdir()
        (multi / "EX-A-Part1.md").write_text("# B\n\n### Q1\nA?\n**Answer: A**\n", encoding="utf-8")
        (multi / "EX-B-Part1.md").write_text("# B\n\n### Q1\nA?\n**Answer: A**\n", encoding="utf-8")
        items = collect_items(multi)
        collisions, legacy = detect(items)
        if collisions:
            failures.append(f"cross-exam fixture must be clean, got {collisions}")
        if legacy != 0:
            failures.append(f"cross-exam fixture has no legacy collision, got {legacy}")

        # Manifest pack: content/exams/<examId>/questions/*.md uses the
        # directory name as examId, never DeriveExamCode.
        pack = root / "pack"
        (pack / "content" / "exams" / "COMPTIA-A-1201" / "questions").mkdir(parents=True)
        (pack / "content" / "exams" / "COMPTIA-A-1201" / "questions" / "a.md").write_text(
            "# P\n\n### Q1\nA?\n**Answer: A**\n", encoding="utf-8"
        )
        (pack / "content" / "exams" / "COMPTIA-A-1201" / "questions" / "b.md").write_text(
            "# P\n\n### Q1\nB?\n**Answer: B**\n", encoding="utf-8"
        )
        items = collect_items(pack)
        collisions, legacy = detect(items)
        if collisions:
            failures.append(f"manifest-pack two-Q1 fixture must be clean, got {collisions}")
        if legacy != 1:
            failures.append(f"manifest-pack fixture should report 1 legacy collision, got {legacy}")
        ids = {semantic_id(i) for i in items}
        if "COMPTIA-A-1201/a.md/Q1" not in ids or "COMPTIA-A-1201/b.md/Q1" not in ids:
            failures.append(f"manifest-pack semantic IDs wrong: {ids}")

    if failures:
        for f in failures:
            print(f"FAIL fixture: {f}", file=sys.stderr)
        return 2
    print("SELF-TEST: PASS (two-Q1 clean, seeded collision fails, cross-exam clean)")
    return 0


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", default=".", help="repository root (default: cwd)")
    parser.add_argument("--self-test", action="store_true",
                        help="run the failing/passing fixture pair and exit")
    args = parser.parse_args()

    if args.self_test:
        sys.exit(run_self_test())

    root = pathlib.Path(args.root)
    items = collect_items(root)
    if not items:
        print("ITEM IDENTITY: no question banks found", file=sys.stderr)
        sys.exit(1)

    collisions, legacy = detect(items)
    exams = {i["examId"] for i in items}
    print(
        f"ITEM IDENTITY: {len(items)} items across {len(exams)} exams — "
        f"semantic collisions {len(collisions)}, "
        f"legacy EXAM:number collisions {legacy} (informational)"
    )

    if collisions:
        for c in collisions:
            print(f"COLLISION: {c}", file=sys.stderr)
        print(
            "ITEM IDENTITY FAIL: semantic IDs must be unique (R-13 / TM-81)",
            file=sys.stderr,
        )
        sys.exit(1)
    print("ITEM IDENTITY OK: zero live semantic-ID collisions")


if __name__ == "__main__":
    main()
