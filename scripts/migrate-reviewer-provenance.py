#!/usr/bin/env python3
"""SPEC-20: move a tool's name out of `reviewer` and into `automatedReview`.

The RedEye lane used to write `"reviewer": "redeye-lane"` into every record it
touched. That reads as "a person reviewed this" and no person did. This moves
the value to `automatedReview` (`redeye-lane:<date>`) and leaves `reviewer`
empty — the true statement.

Only records whose `reviewer` is exactly the tool name are touched. A record
with a human's name is left byte-identical (REQ-RV-05: a migration must not
invent confidence).

The lane ran without recording a date. The date written is therefore the day
the lane first ran over the pack, passed with --date; every migrated record
shares it and the run says so.

  python3 scripts/migrate-reviewer-provenance.py --dry-run
  python3 scripts/migrate-reviewer-provenance.py --write --date 2026-10-20
"""
import argparse
import json
import pathlib
import re
import sys

TOOL = "redeye-lane"
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def migrate_record(record: dict, date: str) -> bool:
    """Mutate one record in place. True if it was a tool-attributed record."""
    reviewer = str(record.get("reviewer", "")).strip()
    if reviewer != TOOL:
        return False
    record["reviewer"] = ""
    record.setdefault("reviewDate", "")
    record["automatedReview"] = f"{TOOL}:{date}"
    return True


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", default=None, help="repo root (default: this repo)")
    parser.add_argument("--date", required=True, help="lane run date, YYYY-MM-DD")
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--dry-run", action="store_true")
    mode.add_argument("--write", action="store_true")
    args = parser.parse_args()

    if not DATE_RE.match(args.date):
        print(f"--date must be YYYY-MM-DD, got {args.date!r}", file=sys.stderr)
        return 1

    root = pathlib.Path(args.root) if args.root else \
        pathlib.Path(__file__).resolve().parent.parent
    prov_root = root / "content" / "provenance"
    if not prov_root.is_dir():
        print(f"no provenance tree at {prov_root}", file=sys.stderr)
        return 1

    migrated = already = other_reviewer = unreadable_shape = 0
    per_exam: dict[str, int] = {}
    for path in sorted(prov_root.glob("*/*.json")):
        try:
            record = json.loads(path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError) as exc:
            print(f"{path}: unreadable ({exc})", file=sys.stderr)
            unreadable_shape += 1
            continue
        before = json.dumps(record, sort_keys=True)
        if migrate_record(record, args.date):
            migrated += 1
            per_exam[path.parent.name] = per_exam.get(path.parent.name, 0) + 1
            if args.write and json.dumps(record, sort_keys=True) != before:
                path.write_text(json.dumps(record, indent=2) + "\n", encoding="utf-8")
        elif str(record.get("reviewer", "")).strip():
            other_reviewer += 1
        elif record.get("automatedReview"):
            already += 1

    for exam, count in sorted(per_exam.items()):
        print(f"  {exam}: {count}")
    print(f"migrated={migrated} already={already} named-human-left-alone={other_reviewer}"
          f" unreadable={unreadable_shape}")
    print("DRY RUN — nothing written" if args.dry_run else "WRITTEN")
    return 1 if unreadable_shape else 0


if __name__ == "__main__":
    sys.exit(main())
