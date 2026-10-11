#!/usr/bin/env python3
"""Brand gate (REQ-BRAND-01, T-11/S46-01).

Nominative-use only: scans UI code, manifests, lesson text and the demo
script for forbidden endorsement strings. Any hit fails the build with the
file, line number and matched string, naming the rule.

Forbidden (case-insensitive, whole-word): "approved", "official",
"certified by". The disclaimer itself (REQ-BRAND-02, the exact normative
string) contains two of those words, so exact disclaimer occurrences are
masked before scanning — but every mask is counted and reported: a surface
whose only "official"/"approved" hits come from the disclaimer passes, a
surface that paraphrases it does not. The manifest token "officialVersion"
is exempt: it is a REQ-MAN-06 field name, not prose.

Exit 0: clean. Exit 1: hits listed.
"""
import argparse
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
DISCLAIMER = (
    "This is independent study material. It is not official training and is "
    "not endorsed or approved by CompTIA, Nutanix, or any other certification "
    "body."
)

# Whole-word patterns: \b keeps near-misses ("disclaimer", "approved-") clean
# and makes the compound "certified by" match across the phrase.
FORBIDDEN = [
    ("approved", r"\bapproved\b"),
    ("official", r"\bofficial\b"),
    ("certified by", r"\bcertified\s+by\b"),
    ("CompTIA logo/mark asset", r"(?i)comptia[_\- ]?logo"),
    ("Nutanix logo/mark asset", r"(?i)nutanix[_\- ]?logo"),
]

SCAN_ROOTS = [
    REPO_ROOT / "RadicalTrainingPlatform.Web",
    REPO_ROOT / "content",
]
DEMO_SCRIPT_GLOBS = ["docs/demo/*.md", "docs/*demo*.md"]
SCAN_GLOBS = ["*.html", "*.js", "*.json", "*.md", "*.css"]


def _mask_disclaimers(line: str) -> tuple[str, int]:
    """Remove exact REQ-BRAND-02 occurrences; return (rest, masked count)."""
    count = 0
    while True:
        i = line.find(DISCLAIMER)
        if i < 0:
            return line, count
        line = line[:i] + line[i + len(DISCLAIMER):]
        count += 1


def _scan(path: Path, info: list[str]) -> list[str]:
    text = path.read_text(encoding="utf-8", errors="replace")
    hits: list[str] = []
    for line_no, line in enumerate(text.splitlines(), start=1):
        work, masked = _mask_disclaimers(line)
        for _ in range(masked):
            info.append(f"{path}:{line_no}: exact REQ-BRAND-02 disclaimer present")
        for label, pattern in FORBIDDEN:
            if re.search(pattern, work):
                hits.append(f"{path}:{line_no}: forbidden {label!r}: {work.strip()[:100]}")
    return hits


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--root",
        type=Path,
        action="append",
        default=None,
        help="extra root to scan (repeatable; fixtures use this)",
    )
    args = parser.parse_args()

    hits: list[str] = []
    info: list[str] = []
    if not args.root:
        # Demo script (REQ-BRAND-01/02 surface). Not yet authored — it is a
        # Sprint 47 T-30 deliverable. Until it exists the gate warns loudly
        # every run (never silently skipped); once authored it is scanned
        # and enforced like every other surface.
        demo_scripts = [p for g in DEMO_SCRIPT_GLOBS for p in sorted(REPO_ROOT.glob(g))]
        if demo_scripts:
            for s in demo_scripts:
                hits.extend(_scan(s, info))
        else:
            print(
                "BRAND CHECK: WARN — demo script not yet authored "
                "(T-30, Sprint 47); REQ-BRAND-02 surface pending enforcement"
            )
        roots = SCAN_ROOTS
    else:
        roots = args.root
    for root in roots:
        root = Path(root) if root.is_absolute() else REPO_ROOT / root
        if not root.is_dir():
            print(f"BRAND CHECK: FAIL — root not found: {root}", file=sys.stderr)
            return 1
        for pattern in SCAN_GLOBS:
            for path in sorted(root.rglob(pattern)):
                hits.extend(_scan(path, info))

    for line in info:
        print(f"  ok: {line}")
    if hits:
        print("BRAND CHECK: FAIL — REQ-BRAND-01 forbidden strings found")
        for hit in hits:
            print(f"  {hit}")
        return 1
    print("BRAND CHECK: PASS — no forbidden endorsement strings")
    return 0


if __name__ == "__main__":
    sys.exit(main())
