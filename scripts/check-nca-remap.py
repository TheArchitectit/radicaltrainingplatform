#!/usr/bin/env python3
"""NCA-75 remap inventory validator (REQ-NCA-01 / TM-82).

The remap is the control document for the California cut: it is what turns 140
beta-mapped items into 140 current-blueprint items without renumbering a single
question. REQ-NCA-01 states the acceptance scenario directly —

    "Given remap.csv, when the validator runs, then it contains exactly 140
     rows, every item ID resolves to a parsed question, and no row lacks a
     review state."

— so this gate is that validator, and it asserts the three things the
requirement names plus the four that keep the control document honest:

  1. exactly 140 rows, header exactly the SPEC-01 01.3 column contract;
  2. every itemId resolves to a parsed question in the file it names;
  3. no row lacks a review state (key/explanation review flags, rights status,
     reviewer);
  4. ID stability — the itemId set equals the bank's question set exactly, so
     nothing was dropped, invented or renumbered (Plan v2 C-01/F-02);
  5. mapping sanity — newSection is a declared section, newObjectiveId is a
     declared objective of that section, productVersion is a known token;
  6. sourceFile agrees with the file named inside itemId;
  7. no duplicate itemId.

Objectives with zero mapped items are REPORTED, not failed: an unmapped
objective is the authoring gap SPEC-06 / REQ-NCA-06 exists to fill with new
original items (the pilot), not a defect in the inventory.

Exit codes:
  0 — inventory complete and consistent
  1 — a violation (report names every row)
  2 — fixture assertion failed (--self-test)
"""
from __future__ import annotations

import argparse
import csv
import json
import pathlib
import re
import sys
import tempfile

# SPEC-01 01.3 — normative column order. Not a set: a reordered or renamed
# column silently changes what the document means, so this is compared exactly.
COLUMNS = [
    "itemId",
    "sourceFile",
    "oldDomain",
    "oldObjectiveId",
    "newSection",
    "newObjectiveId",
    "productVersion",
    "keyReviewed",
    "explanationReviewed",
    "rightsStatus",
    "reviewer",
    "notes",
]

EXPECTED_ROWS = 140
EXAM_ID = "NCA-75"
QUESTION_HEADER = re.compile(r"^###\s+Q(\d+)", re.MULTILINE)
# itemId form is "<sourceFile>:<localQuestionNumber>"
ITEM_ID = re.compile(r"^(?P<file>[^:]+\.md):(?P<num>\d+)$")

# The three beta banks REQ-NCA-01 names by hand.
BANKS = ["NCA-75-Part1.md", "NCA-75-Part2.md", "NCA-75-Part3-GapFill.md"]

# productVersion vocabulary: the three current product versions from the guide,
# plus "multi" (an item spanning more than one) and "general" (not tied to a
# single product version). Anything else is a typo or a beta-era leftover.
PRODUCT_VERSIONS = {
    "AOS 7.5",
    "AHV 11.0",
    "Prism Central pc.7.5",
    "multi",
    "general",
}

BOOL_TOKENS = {"true", "false"}


def bank_questions(path: pathlib.Path) -> set[int]:
    """Local question numbers parsed from one bank."""
    return {int(n) for n in QUESTION_HEADER.findall(path.read_text(encoding="utf-8"))}


def declared_mapping(exam_json: pathlib.Path) -> tuple[set[str], dict[str, str]]:
    """(sections, objectiveId -> sectionNumber) from the manifest."""
    data = json.loads(exam_json.read_text(encoding="utf-8"))
    sections: set[str] = set()
    objectives: dict[str, str] = {}
    for section in data.get("sections", []):
        number = str(section.get("number", ""))
        sections.add(number)
        for obj in section.get("objectives", []):
            objectives[str(obj.get("id", ""))] = number
    return sections, objectives


def validate(root: pathlib.Path) -> tuple[list[str], list[str], dict]:
    """Return (violations, notes, stats)."""
    violations: list[str] = []
    notes: list[str] = []

    exam_dir = root / "content" / "exams" / EXAM_ID
    remap = exam_dir / "remap.csv"
    exam_json = exam_dir / "exam.json"

    if not remap.is_file():
        return [f"{remap} is missing — REQ-NCA-01 requires the inventory"], [], {}
    if not exam_json.is_file():
        return [f"{exam_json} is missing — the mapping cannot be checked"], [], {}

    with remap.open(encoding="utf-8", newline="") as fh:
        reader = csv.DictReader(fh)
        header = reader.fieldnames or []
        rows = list(reader)

    if header != COLUMNS:
        violations.append(
            f"header does not match the SPEC-01 01.3 contract\n"
            f"    expected: {','.join(COLUMNS)}\n"
            f"    found:    {','.join(header)}"
        )
        # Without the contract there is nothing meaningful left to check.
        return violations, notes, {}

    if len(rows) != EXPECTED_ROWS:
        violations.append(
            f"expected exactly {EXPECTED_ROWS} rows, found {len(rows)} "
            f"(REQ-NCA-01: every one of the 140 items gets a row)"
        )

    sections, objectives = declared_mapping(exam_json)

    # The bank's full question set — the ID-stability reference.
    bank_items: dict[str, set[int]] = {}
    for name in BANKS:
        path = root / name
        if not path.is_file():
            violations.append(f"bank {name} is missing — cannot verify ID stability")
            continue
        bank_items[name] = bank_questions(path)
    all_bank = {(name, num) for name, nums in bank_items.items() for num in nums}

    seen: dict[str, int] = {}
    claimed: set[tuple[str, int]] = set()
    key_reviewed = 0
    explanation_reviewed = 0
    by_objective: dict[str, int] = {}
    no_old_objective: list[tuple[str, str]] = []

    for i, row in enumerate(rows, start=2):  # line 1 is the header
        item_id = (row.get("itemId") or "").strip()
        where = f"remap.csv:{i}"

        if not item_id:
            violations.append(f"{where} has a blank itemId")
            continue

        seen[item_id] = seen.get(item_id, 0) + 1
        if seen[item_id] > 1:
            violations.append(f"{where} duplicate itemId {item_id}")

        m = ITEM_ID.match(item_id)
        if not m:
            violations.append(
                f"{where} itemId {item_id!r} is not of the form <sourceFile>:<questionNumber>"
            )
            continue

        file_name, number = m.group("file"), int(m.group("num"))

        # 2. resolves to a parsed question
        if file_name not in bank_items:
            violations.append(
                f"{where} itemId {item_id} names {file_name}, which is not one of the "
                f"three NCA-75 banks"
            )
        elif number not in bank_items[file_name]:
            violations.append(f"{where} itemId {item_id} resolves to no parsed question")
        else:
            claimed.add((file_name, number))

        # 6. sourceFile agrees with itemId
        source_file = (row.get("sourceFile") or "").strip()
        if source_file != file_name:
            violations.append(
                f"{where} sourceFile {source_file!r} disagrees with itemId {item_id!r}"
            )

        # 3. review state present
        for column in ("keyReviewed", "explanationReviewed"):
            value = (row.get(column) or "").strip().lower()
            if value not in BOOL_TOKENS:
                violations.append(
                    f"{where} {column} is {value!r} — a row may not lack a review state"
                )
        if (row.get("keyReviewed") or "").strip().lower() == "true":
            key_reviewed += 1
        if (row.get("explanationReviewed") or "").strip().lower() == "true":
            explanation_reviewed += 1
        # Review state and provenance must be present. `oldObjectiveId` is
        # deliberately NOT in this list: the gap-fill bank was organised by
        # section, not by beta objective, so 60 items have no old objective to
        # record. Demanding a value there would force an invented ID — the
        # blank is the true provenance. It is counted and reported below.
        for column in ("rightsStatus", "reviewer", "oldDomain"):
            if not (row.get(column) or "").strip():
                violations.append(f"{where} {column} is blank")
        if not (row.get("oldObjectiveId") or "").strip():
            no_old_objective.append((item_id, (row.get("oldDomain") or "").strip()))

        # 5. mapping sanity
        section = (row.get("newSection") or "").strip()
        objective = (row.get("newObjectiveId") or "").strip()
        if sections and section not in sections:
            violations.append(
                f"{where} newSection {section!r} is not a section declared in exam.json"
            )
        if objectives and objective not in objectives:
            violations.append(
                f"{where} newObjectiveId {objective!r} is not an objective declared in exam.json"
            )
        elif objectives and objectives[objective] != section:
            violations.append(
                f"{where} newObjectiveId {objective} belongs to section "
                f"{objectives[objective]}, not {section}"
            )
        by_objective[objective] = by_objective.get(objective, 0) + 1

        version = (row.get("productVersion") or "").strip()
        if version not in PRODUCT_VERSIONS:
            violations.append(
                f"{where} productVersion {version!r} is not one of "
                f"{sorted(PRODUCT_VERSIONS)}"
            )

    # 4. ID stability — nothing dropped, nothing invented
    missing = all_bank - claimed
    invented = claimed - all_bank
    for name, num in sorted(missing):
        violations.append(
            f"ID STABILITY: {name}:{num} is a parsed question with no remap row"
        )
    for name, num in sorted(invented):
        violations.append(f"ID STABILITY: remap claims {name}:{num}, which is not a question")

    # Informational: gap-fill items with no old objective ID. Reported so the
    # blank is a stated fact rather than a silent hole in the control document.
    if no_old_objective:
        domains = sorted({d for _, d in no_old_objective})
        notes.append(
            f"{len(no_old_objective)} row(s) carry no oldObjectiveId — the gap-fill bank "
            f"was organised by section, not by beta objective (old domain(s): "
            f"{'; '.join(domains)}); provenance is recorded at section granularity"
        )

    # Informational: objectives with no mapped item (the authoring gap).
    for objective in sorted(objectives):
        if by_objective.get(objective, 0) == 0:
            notes.append(
                f"objective {objective} has zero mapped bank items — an authoring gap "
                f"for the pilot (REQ-NCA-06), not an inventory defect"
            )

    stats = {
        "rows": len(rows),
        "bankItems": len(all_bank),
        "claimed": len(claimed),
        "keyReviewed": key_reviewed,
        "explanationReviewed": explanation_reviewed,
        "objectives": len(objectives),
        "objectivesCovered": len(by_objective),
    }
    return violations, notes, stats


def run_self_test() -> int:
    failures: list[str] = []
    scratch: list[tempfile.TemporaryDirectory] = []

    def new_root() -> pathlib.Path:
        td = tempfile.TemporaryDirectory()
        scratch.append(td)
        return pathlib.Path(td.name)

    def fixture(root: pathlib.Path, rows: list[dict], banks: dict[str, int]) -> pathlib.Path:
        exam_dir = root / "content" / "exams" / EXAM_ID
        exam_dir.mkdir(parents=True, exist_ok=True)
        exam_dir.joinpath("exam.json").write_text(
            json.dumps(
                {
                    "examId": EXAM_ID,
                    "sections": [
                        {
                            "number": "1",
                            "objectives": [{"id": "1.1", "title": "t"}],
                        },
                        {
                            "number": "2",
                            "objectives": [{"id": "2.1", "title": "t"}],
                        },
                    ],
                }
            ),
            encoding="utf-8",
        )
        with exam_dir.joinpath("remap.csv").open("w", encoding="utf-8", newline="") as fh:
            writer = csv.DictWriter(fh, fieldnames=COLUMNS)
            writer.writeheader()
            for row in rows:
                writer.writerow(row)
        for name, count in banks.items():
            body = "".join(
                f"### Q{n}\nA?\n- A) x\n\n**Answer: A**\n\n---\n" for n in range(1, count + 1)
            )
            root.joinpath(name).write_text(body, encoding="utf-8")
        return root

    def row(item_id: str, objective: str = "1.1", section: str = "1", **over: str) -> dict:
        base = {
            "itemId": item_id,
            "sourceFile": item_id.split(":")[0],
            "oldDomain": "Beta Domain",
            "oldObjectiveId": "1.1",
            "newSection": section,
            "newObjectiveId": objective,
            "productVersion": "AOS 7.5",
            "keyReviewed": "false",
            "explanationReviewed": "false",
            "rightsStatus": "original-bank",
            "reviewer": "redeye-lane",
            "notes": "",
        }
        base.update(over)
        return base

    # ── passing fixture ────────────────────────────────────────────────
    with tempfile.TemporaryDirectory() as td:
        root = fixture(
            pathlib.Path(td),
            [row(f"{b}:{n}") for b, c in
             [("NCA-75-Part1.md", 1), ("NCA-75-Part2.md", 1), ("NCA-75-Part3-GapFill.md", 1)]
             for n in range(1, c + 1)],
            {"NCA-75-Part1.md": 1, "NCA-75-Part2.md": 1, "NCA-75-Part3-GapFill.md": 1},
        )
        violations, notes, stats = validate(root)
        # 3 rows, not 140 — so the row-count rule is the ONE expected violation.
        unexpected = [v for v in violations if "expected exactly" not in v]
        if unexpected:
            failures.append(f"clean fixture must be otherwise clean, got {unexpected}")
        if len(violations) != 1:
            failures.append(f"clean fixture must report only the row count, got {violations}")
        if stats.get("claimed") != 3:
            failures.append(f"clean fixture should claim 3 items, got {stats.get('claimed')}")
        if not any("2.1" in n for n in notes):
            failures.append(f"clean fixture should report objective 2.1 as an authoring gap, got {notes}")

    # ── failing fixtures ───────────────────────────────────────────────
    cases = [
        (
            "unresolvable itemId",
            lambda: fixture(
                new_root(),
                [row("NCA-75-Part1.md:1"), row("NCA-75-Part1.md:99")],
                {"NCA-75-Part1.md": 1, "NCA-75-Part2.md": 0, "NCA-75-Part3-GapFill.md": 0},
            ),
            "resolves to no parsed question",
        ),
        (
            "blank review state",
            lambda: fixture(
                new_root(),
                [row("NCA-75-Part1.md:1", keyReviewed="")],
                {"NCA-75-Part1.md": 1, "NCA-75-Part2.md": 0, "NCA-75-Part3-GapFill.md": 0},
            ),
            "keyReviewed is ''",
        ),
        (
            "objective not declared",
            lambda: fixture(
                new_root(),
                [row("NCA-75-Part1.md:1", objective="9.9", section="9")],
                {"NCA-75-Part1.md": 1, "NCA-75-Part2.md": 0, "NCA-75-Part3-GapFill.md": 0},
            ),
            "is not an objective declared in exam.json",
        ),
        (
            "dropped item (ID stability)",
            lambda: fixture(
                new_root(),
                [row("NCA-75-Part1.md:1")],
                {"NCA-75-Part1.md": 2, "NCA-75-Part2.md": 0, "NCA-75-Part3-GapFill.md": 0},
            ),
            "ID STABILITY: NCA-75-Part1.md:2 is a parsed question with no remap row",
        ),
        (
            "duplicate itemId",
            lambda: fixture(
                new_root(),
                [row("NCA-75-Part1.md:1"), row("NCA-75-Part1.md:1")],
                {"NCA-75-Part1.md": 1, "NCA-75-Part2.md": 0, "NCA-75-Part3-GapFill.md": 0},
            ),
            "duplicate itemId",
        ),
        (
            "beta-era product version",
            lambda: fixture(
                new_root(),
                [row("NCA-75-Part1.md:1", productVersion="AOS 6.5")],
                {"NCA-75-Part1.md": 1, "NCA-75-Part2.md": 0, "NCA-75-Part3-GapFill.md": 0},
            ),
            "productVersion 'AOS 6.5'",
        ),
    ]

    for name, build, needle in cases:
        root = build()
        violations, _, _ = validate(root)
        if not any(needle in v for v in violations):
            failures.append(f"failing fixture {name!r} not detected (got {violations})")

    # ── header contract fixture ────────────────────────────────────────
    with tempfile.TemporaryDirectory() as td:
        root = pathlib.Path(td)
        exam_dir = root / "content" / "exams" / EXAM_ID
        exam_dir.mkdir(parents=True)
        exam_dir.joinpath("exam.json").write_text('{"sections": []}', encoding="utf-8")
        exam_dir.joinpath("remap.csv").write_text("itemId,sourceFile\nx,y\n", encoding="utf-8")
        violations, _, _ = validate(root)
        if not any("SPEC-01 01.3 contract" in v for v in violations):
            failures.append(f"header fixture not detected (got {violations})")

    for td in scratch:
        td.cleanup()

    if failures:
        for f in failures:
            print(f"FAIL fixture: {f}", file=sys.stderr)
        return 2
    print(
        "SELF-TEST: PASS (clean passes; unresolvable ID, blank review state, "
        "undeclared objective, dropped item, duplicate ID, beta version and "
        "header drift all fail)"
    )
    return 0


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--root", default=".", help="repository root (default: cwd)")
    parser.add_argument("--self-test", action="store_true",
                        help="run the failing/passing fixture set and exit")
    args = parser.parse_args()

    if args.self_test:
        sys.exit(run_self_test())

    root = pathlib.Path(args.root)
    violations, notes, stats = validate(root)

    if not stats:
        for v in violations:
            print(f"REMAP FAIL: {v}", file=sys.stderr)
        sys.exit(1)

    print(
        f"NCA-75 REMAP: {stats['rows']} rows, {stats['claimed']}/{stats['bankItems']} bank "
        f"items mapped, {stats['objectivesCovered']}/{stats['objectives']} objectives covered, "
        f"keyReviewed {stats['keyReviewed']}, explanationReviewed {stats['explanationReviewed']}"
    )
    for n in notes:
        print(f"  note: {n}")

    if violations:
        for v in violations:
            print(f"REMAP FAIL: {v}", file=sys.stderr)
        print(
            f"NCA-75 REMAP FAIL: {len(violations)} violation(s) — REQ-NCA-01 / TM-82",
            file=sys.stderr,
        )
        sys.exit(1)

    print("NCA-75 REMAP OK: 140 rows, every ID resolves, no row lacks a review state")


if __name__ == "__main__":
    main()
