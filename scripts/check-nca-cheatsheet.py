#!/usr/bin/env python3
"""NCA-75 cheatsheet errata gate (REQ-NCA-04, C-07, T-34/S48-04).

The cheatsheet is a companion surface: a learner reads it alongside the bank,
so a claim it makes that the applied errata contradicts is a defect, not a
stale doc. This gate pins the one such contradiction that was found.

Failures:
  1. the stale claim "CVM SSH disabled by default" is present;
  2. the correction does not name errata ID NCA-75-Part3-GapFill-Q3, so a
     reader cannot trace the change back to the review that made it;
  3. the corrected claim ("SSH enabled by default") is absent — a sheet that
     only deleted the wrong line would pass (1) and (2) while saying nothing.

Advisory (never fails): the sheet's link inventory is printed on every run.
C-07 requires scheduling-link currency to be *checked*, and the honest form of
"checked" is an inventory the reviewer sees, not a one-time claim in a sprint
note that no later run re-examines. The check found no scheduling links when
this gate was written; if one is ever added it appears here.

Exit 0: clean. Exit 1: failures listed.
"""
import argparse
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
RELATIVE = Path("studyguides") / "CHEATSHEET-NCA-75.md"

STALE = "CVM SSH disabled by default"
CORRECTED = "SSH enabled by default"
ERRATA_ID = "NCA-75-Part3-GapFill-Q3"

LINK_RE = re.compile(r"https?://\S+")


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
    path = root / RELATIVE
    if not path.is_file():
        print(f"CHEATSHEET CHECK: FAIL — not found: {path}", file=sys.stderr)
        return 1

    text = path.read_text(encoding="utf-8", errors="replace")
    lowered = text.lower()
    failures: list[str] = []

    if STALE.lower() in lowered:
        line_no = next(
            (n for n, line in enumerate(text.splitlines(), 1) if STALE.lower() in line.lower()),
            0,
        )
        failures.append(f"{path}:{line_no}: stale claim present: {STALE!r}")

    if ERRATA_ID not in text:
        failures.append(
            f"{path}: correction does not reference errata ID {ERRATA_ID} "
            "(REQ-NCA-04 requires the reader be able to trace it)"
        )

    if CORRECTED.lower() not in lowered:
        failures.append(
            f"{path}: corrected claim absent: expected {CORRECTED!r}"
        )

    links = sorted(set(LINK_RE.findall(text)))
    if links:
        print(f"  advisory: {len(links)} link(s) to re-check for currency (C-07):")
        for link in links:
            print(f"    {link}")
    else:
        print("  advisory: no links in the sheet — nothing to re-check (C-07)")

    if failures:
        print("CHEATSHEET CHECK: FAIL — REQ-NCA-04 errata correction not in place")
        for failure in failures:
            print(f"  {failure}")
        return 1

    print(f"CHEATSHEET CHECK: PASS — {RELATIVE} matches errata {ERRATA_ID}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
