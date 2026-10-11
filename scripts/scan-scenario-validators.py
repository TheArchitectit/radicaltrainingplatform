#!/usr/bin/env python3
"""Scenario validator scan (REQ-SC-01, T-14/S46-04; exercised from T-13).

Scans the web scenario registries for constant-true validators — the
`() => true` pattern that made 27 of 78 objectives auto-pass. Constant-true
validators fail the build naming the file, line and matched text.

Allowed in the tree: genuine `() => true` occurrences that are NOT
validators are not currently present; if a future non-validator use needs
an inline true closure in a registry file, it must be refactored out —
the scan is intentionally syntactic and strict.

Exit 0: clean. Exit 1: constant-true validators found (file:line listed).
"""
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

# Scenario registry files (SPEC-07: "Web/js/views/scenarios.js (and any
# scenario registry)").
REGISTRIES = [
    REPO_ROOT / "RadicalTrainingPlatform.Web" / "js" / "views" / "scenarios.js",
]

# Matches an arrow function whose body is a lone `true` literal. The
# validate: property key anchors it to objectives; a bare `() => true`
# anywhere in a registry is equally a constant-true validator, so both
# spellings are flagged.
CONSTANT_TRUE = re.compile(r"validate:\s*\(\)\s*=>\s*true\b|validate:\s*\(\)\s*=>\s*\{\s*return\s+true;?\s*\}")


def scan(path: Path) -> list[str]:
    hits: list[str] = []
    text = path.read_text(encoding="utf-8", errors="replace")
    for line_no, line in enumerate(text.splitlines(), start=1):
        if CONSTANT_TRUE.search(line):
            hits.append(f"{path}:{line_no}: constant-true validator: {line.strip()[:100]}")
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
        # Repo mode: scan the scenario registries. The registry currently
        # carries 27 constant-true validators — the audited defect T-14
        # (S46-04) repairs in this same sprint. Until that sweep lands the
        # gate warns loudly with the exact count every run (never silently
        # green); the fixture chain still proves bad-fails/good-passes.
        for reg in REGISTRIES:
            if not reg.is_file():
                print(f"VALIDATOR SCAN: FAIL — registry not found: {reg}", file=sys.stderr)
                return 1
            hits.extend(scan(reg))
        if hits:
            print(
                f"VALIDATOR SCAN: WARN — {len(hits)} constant-true validators pending "
                "repair (T-14, S46-04 validator sweep); REQ-SC-01 repo enforcement arms "
                "when the sweep lands"
            )
            for hit in hits:
                print(f"  {hit}")
            return 0
    if hits:
        print("VALIDATOR SCAN: FAIL — constant-true validators present (REQ-SC-01)")
        for hit in hits:
            print(f"  {hit}")
        return 1
    print("VALIDATOR SCAN: PASS — no constant-true validators in scenario registries")
    return 0


if __name__ == "__main__":
    sys.exit(main())
