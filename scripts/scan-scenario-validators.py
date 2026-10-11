#!/usr/bin/env python3
"""Scenario validator scan (REQ-SC-01, T-14/S46-04).

Scans the web scenario registries for constant-true validators — the
`() => true` pattern that made 27 of 78 objectives auto-pass. A constant-true
validator fails the build naming the scenario id, objective id, file and line.

Exit 0: clean. Exit 1: constant-true validators found (scenario + objective listed).
"""
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

REGISTRIES = [
    REPO_ROOT / "RadicalTrainingPlatform.Web" / "js" / "views" / "scenarios.js",
]

# An arrow function whose body is a lone `true` literal, anchored to the
# validate: property key.
CONSTANT_TRUE = re.compile(
    r"validate:\s*\(\)\s*=>\s*true\b|validate:\s*\(\)\s*=>\s*\{\s*return\s+true;?\s*\}"
)

# Context anchors so a hit can name scenario + objective IDs (REQ-SC-01).
SCENARIO_ID = re.compile(r"^\s*id:\s*'([^']+)'")
OBJECTIVE_ID = re.compile(r"^\s*id:\s*'(obj-[^']+)'")


def scan(path: Path) -> list[str]:
    hits: list[str] = []
    text = path.read_text(encoding="utf-8", errors="replace")
    scenario_id = "?"
    objective_id = "?"
    for line_no, line in enumerate(text.splitlines(), start=1):
        m = SCENARIO_ID.search(line)
        if m and not OBJECTIVE_ID.search(line):
            scenario_id = m.group(1)
            objective_id = "?"
        m = OBJECTIVE_ID.search(line)
        if m:
            objective_id = m.group(1)
        if CONSTANT_TRUE.search(line):
            hits.append(
                f"{path}:{line_no}: scenario={scenario_id} objective={objective_id} "
                f"constant-true validator: {line.strip()[:80]}"
            )
    return hits


def main() -> int:
    hits: list[str] = []
    roots = sys.argv[1:]
    if roots:
        # Fixture mode: scan ONLY the given roots (repeatable).
        for root in roots:
            root = Path(root) if Path(root).is_absolute() else REPO_ROOT / root
            if not root.is_dir():
                print(f"VALIDATOR SCAN: FAIL — root not found: {root}", file=sys.stderr)
                return 1
            for path in sorted(root.rglob("*.js")):
                hits.extend(scan(path))
    else:
        # Repo mode: scan the scenario registries. REQ-SC-01 hard-fails
        # naming scenario + objective IDs (T-14/S46-04 armed).
        for reg in REGISTRIES:
            if not reg.is_file():
                print(f"VALIDATOR SCAN: FAIL — registry not found: {reg}", file=sys.stderr)
                return 1
            hits.extend(scan(reg))
    if hits:
        print("VALIDATOR SCAN: FAIL — constant-true validators present (REQ-SC-01)")
        for hit in hits:
            print(f"  {hit}")
        return 1
    print("VALIDATOR SCAN: PASS — no constant-true validators in scenario registries")
    return 0


if __name__ == "__main__":
    sys.exit(main())
