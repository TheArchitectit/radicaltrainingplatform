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
     only deleted the wrong line would pass (1) and (2) while saying nothing;
  4. a heading carries a beta qualifier (SPEC-18 REQ-CS-01) — the beta window
     closed 2026-06-14 and every other surface names the live exam;
  5. the expired waiver code "NCA75BETANEW" is present (REQ-CS-02) — it is a
     credential-shaped string for a closed window, with no value as history;
  6. the dated historical section was deleted along with the framing (REQ-CS-03)
     — the record is kept, only the live title goes.

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

# SPEC-18: the beta framing and the expired code must not survive.
BETA_HEADING = re.compile(r"^#+.*\bbeta\b", re.IGNORECASE | re.MULTILINE)
WAIVER_CODE = "NCA75BETANEW"
HISTORY_MARKER = "the beta window below closed on June 14, 2026"
HISTORY_DATE = "June 14, 2026"

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

    # SPEC-18 REQ-CS-01: no heading may carry a beta qualifier.
    for match in BETA_HEADING.finditer(text):
        line_no = text.count("\n", 0, match.start()) + 1
        failures.append(
            f"{path}:{line_no}: heading still labels the exam as beta: "
            f"{match.group(0).strip()!r} — the window closed {HISTORY_DATE} "
            f"(SPEC-18 REQ-CS-01)"
        )

    # SPEC-18 REQ-CS-02: the expired code must not be reproduced.
    if WAIVER_CODE in text:
        line_no = next(
            (n for n, line in enumerate(text.splitlines(), 1) if WAIVER_CODE in line), 0)
        failures.append(
            f"{path}:{line_no}: expired waiver code {WAIVER_CODE!r} is still in "
            f"the sheet — a credential-shaped string for a closed window "
            f"(SPEC-18 REQ-CS-02)"
        )

    # SPEC-18 REQ-CS-03: the dated history stays. Removing the framing must not
    # become removing the record. Matched against the markdown-stripped text so
    # emphasis markers inside the sentence do not defeat the check.
    plain = re.sub(r"[*_`]", "", lowered)
    if HISTORY_MARKER.lower() not in plain or HISTORY_DATE.lower() not in plain:
        failures.append(
            f"{path}: the dated closed-beta history section is gone — it must be "
            f"kept with {HISTORY_MARKER!r} and {HISTORY_DATE!r} (SPEC-18 REQ-CS-03)"
        )

    links = sorted(set(LINK_RE.findall(text)))
    if links:
        print(f"  advisory: {len(links)} link(s) to re-check for currency (C-07):")
        for link in links:
            print(f"    {link}")
    else:
        print("  advisory: no links in the sheet — nothing to re-check (C-07)")

    if failures:
        print("CHEATSHEET CHECK: FAIL — REQ-NCA-04 / SPEC-18 requirements not in place")
        for failure in failures:
            print(f"  {failure}")
        return 1

    print(f"CHEATSHEET CHECK: PASS — {RELATIVE} matches errata {ERRATA_ID}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
