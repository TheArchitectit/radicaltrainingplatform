#!/usr/bin/env python3
"""Test path-portability gate (SPEC-22 CI-02, companion to CI-02's test repair).

Why this gate exists
--------------------
The 19 plugin tests failed only on Windows, because they hardcoded POSIX roots
("/repo", "/plugins") and interpolated them with a forward slash. Production code
builds paths with Path.Combine, so on Windows it asks for "\\repo\\content" and the
in-memory provider never matches.

That defect is invisible on the Linux leg, which is the leg that runs on every
push. Without a gate the next author writes "/repo/..." again, Linux stays green,
and Windows breaks silently until someone reads a red build-winforms.

What it rejects
---------------
A string literal rooted at a known test-tree root, using a forward slash to join
path segments. Concretely, in a C# string literal inside the Core.Tests project:

  "/repo"            "/repo/content"      $"{BuiltInRoot}/content"
  "/plugins"         "/plugins/acme"      $"{Root}/plugin.json"
  "/appdata"         "/app/bin"

It does NOT reject:
  - a forward slash inside a manifest/json value (that is wire format, not a path)
  - TestPaths.Combine(...)/TestPaths.Root(...) calls
  - comments and documentation

A gate that cannot fail is itself a defect, so the fixture pair under
tests/gates/fixtures/test-path-portability/ proves both directions:
  bad/  a file with a hardcoded POSIX path literal  -> must FAIL
  good/ a file using TestPaths helpers              -> must PASS

Usage:
  python3 scripts/check-test-path-portability.py [--self-test]
Exit 0 clean, 1 findings, 2 configuration error.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
SCAN_DIR = REPO_ROOT / "RadicalTrainingPlatform.Core.Tests"
FIXTURES = REPO_ROOT / "tests" / "gates" / "fixtures" / "test-path-portability"

# Roots the tests build their trees under. A literal starting with one of these
# and continuing with '/' is the defect.
ROOTED_FORWARD_SLASH = re.compile(
    r'"(\$?")?'                       # an optional string start is handled below
)

# Match: a C# string literal (plain or interpolated) whose value starts with one
# of the POSIX roots and joins further segments with '/'. A literal that is merely
# the FIRST ARGUMENT of Path.Combine is already portable — Path.Combine supplies
# the separator — so those are not findings.
PATTERNS = [
    # A quoted literal that begins with the root and has a '/' before the close.
    re.compile(r'"(/(?:repo|plugins|appdata|app)(?:/[^"]*)?)"'),
    # An interpolated literal that ends a brace expression then continues '/...'
    re.compile(r'\$"[^"]*\}\s*/(?:[^"]*)"'),
]

# `Path.Combine("/appdata", appName)` is correct: the separator comes from
# Path.Combine. Only an INTERPOLATED or CONCATENATED join is the defect.
PORTABLE_COMBINE = re.compile(
    r'Path\.Combine\(\s*"/[^"]*"\s*,'
)

# Names commonly used for the tree roots; an interpolation on one of these
# followed by '/' is the same class of defect even if the literal part is empty.
INTERP_ROOT = re.compile(
    r'\$"[^"]*\{\s*(?:BuiltInRoot|PluginsRoot|Root|AppRoot|BuiltIn)\s*\}\s*/'
)

ALLOW = (
    # Manifest wire-format paths (they are joined by the validator, not Path.Combine).
    "plugin.json",
)


def scan_file(path: Path) -> list[tuple[int, str]]:
    findings: list[tuple[int, str]] = []
    in_block_comment = False
    for lineno, line in enumerate(path.read_text(encoding="utf-8", errors="replace").splitlines(), 1):
        stripped = line.strip()

        # Cheap comment handling: the doc comments legitimately quote the old
        # literals to explain the defect, so skip them.
        if in_block_comment:
            if "*/" in stripped:
                in_block_comment = False
            continue
        if stripped.startswith("/*"):
            if "*/" not in stripped:
                in_block_comment = True
            continue
        if stripped.startswith("//") or stripped.startswith("///"):
            continue

        # Ignore lines that are already using the helper.
        if "TestPaths." in line:
            continue

        # Path.Combine("/appdata", ...) is portable — Path.Combine owns the
        # separator. Skip the first-argument literal form.
        line_for_match = PORTABLE_COMBINE.sub('Path.Combine(', line)

        for pat in PATTERNS:
            for m in pat.finditer(line_for_match):
                text = m.group(0)
                if any(a in text for a in ALLOW):
                    continue
                findings.append((lineno, stripped))
                break
            else:
                continue
            break
        else:
            if INTERP_ROOT.search(line):
                findings.append((lineno, stripped))
    return findings


def run(scan_dir: Path) -> tuple[int, list[str]]:
    if not scan_dir.is_dir():
        return 2, [f"scan directory not found: {scan_dir}"]
    problems: list[str] = []
    files = sorted(scan_dir.rglob("*.cs"))
    if not files:
        return 2, [f"no .cs files under {scan_dir}"]
    for f in files:
        rel = f.relative_to(REPO_ROOT)
        for lineno, text in scan_file(f):
            problems.append(f"{rel}:{lineno}: hardcoded POSIX path literal — {text}")
    return (1 if problems else 0), problems


def self_test() -> int:
    """Prove the gate fails on the bad fixture and passes on the good one."""
    bad, good = FIXTURES / "bad", FIXTURES / "good"
    for d in (bad, good):
        if not d.is_dir():
            print(f"GATE-CONFIG: missing fixture directory {d}", file=sys.stderr)
            return 2

    rc_bad, probs_bad = run(bad)
    rc_good, probs_good = run(good)

    ok = True
    if rc_bad != 1 or not probs_bad:
        print("GATE-CONFIG: the bad fixture did NOT fail the gate — the gate is hollow", file=sys.stderr)
        ok = False
    else:
        print(f"PASS: bad fixture fails as required ({len(probs_bad)} finding(s))")
    if rc_good != 0 or probs_good:
        print(f"GATE-CONFIG: the good fixture did NOT pass — {probs_good}", file=sys.stderr)
        ok = False
    else:
        print("PASS: good fixture passes as required")
    return 0 if ok else 2


def main() -> int:
    if "--self-test" in sys.argv:
        return self_test()
    rc, problems = run(SCAN_DIR)
    if rc == 2:
        for p in problems:
            print(f"GATE-CONFIG: {p}", file=sys.stderr)
        return 2
    if rc == 1:
        print(f"TEST PATH PORTABILITY: FAIL — {len(problems)} hardcoded POSIX path literal(s)", file=sys.stderr)
        for p in problems:
            print(f"  {p}", file=sys.stderr)
        print("\n  Build test paths with TestPaths.Combine(...) / TestPaths.Root(...) so an",
              file=sys.stderr)
        print("  expectation can never disagree with the provider that produced the value.",
              file=sys.stderr)
        return 1
    print("TEST PATH PORTABILITY: PASS — no hardcoded POSIX path literals in Core.Tests")
    return 0


if __name__ == "__main__":
    sys.exit(main())
