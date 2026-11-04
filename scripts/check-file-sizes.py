#!/usr/bin/env python3
"""check-file-sizes.py — keep source files reviewable.

The repo states a 500-line ceiling for documents (CLAUDE.md) but nothing
enforced a ceiling for code, and the vendored DevGate size gate never ran
here: its workflow is an uncopied template, it walks only `scripts/`,
its test-file branch is dead code (`endswith("test_*.py")`), and it exits 0
on a hard-limit error. This gate is the project's own, and it is wired into
`tests/gates/run_freeze_chain.sh` and `.github/workflows/build.yml`.

Scope: source files under version control. Markdown, JSON and other data
are out of scope — `check-item-*`, `lint-content.py` and the manifest
generators own those, and a content bank's length is a content decision.

Limits:
    SRC_SOFT  = 300   warning only
    SRC_HARD  = 500   fails the gate
    TEST_HARD = 600   fails the gate (test files carry fixtures inline)

Two exemption classes, both structural rather than a path allowlist:

    generated  — the file's first five lines carry a GENERATED marker. The
                 checked-in artifact is produced by a script; splitting it
                 would be undone by the next regeneration. The gate still
                 checks the marker, so a hand-written file cannot claim it
                 by being added to a list.
    preserved  — trees kept for reference and not built on this platform
                 (see EXEMPT_TREES). Each entry names the reason and the
                 gate fails if an entry matches no file, so an exemption
                 cannot outlive the tree it was written for.

Usage:
    python3 scripts/check-file-sizes.py
    python3 scripts/check-file-sizes.py --self-test
"""

from __future__ import annotations

import argparse
import subprocess
import sys
import tempfile
from pathlib import Path

SRC_SOFT = 300
SRC_HARD = 500
TEST_HARD = 600

SOURCE_SUFFIXES = {
    ".js", ".mjs", ".cjs", ".ts", ".tsx", ".cs", ".py", ".sh", ".css", ".html",
}

# Directories that are dependencies, build output, or vendored tooling.
SKIP_PARTS = {
    ".git", ".devgate", "node_modules", "dist", "build", "out", "bin", "obj",
    "__pycache__", "vendor", ".venv", "venv", "worktrees",
}

# Trees kept for reference: not built on Linux, not part of any shipped
# surface. Exempt by design, each with the reason it is exempt.
EXEMPT_TREES = {
    "RadicalTrainingPlatform.Legacy.WinForms/":
        "Windows-only WinForms reference build; kept for its UI history and "
        "excluded from the Linux build. Slated for deletion when the desktop "
        "app is pointed at RadicalTrainingPlatform.Web.",
}

TEST_MARKERS = ("tests/", "Tests/", "/tests/")
TEST_NAMES = ("test_", "_test.", ".test.")


def is_test_file(rel: str) -> bool:
    if any(m in rel for m in TEST_MARKERS):
        return True
    name = Path(rel).name
    return name.startswith(TEST_NAMES[0]) or TEST_NAMES[1] in name or TEST_NAMES[2] in name


def is_generated(path: Path) -> bool:
    try:
        head = path.read_text(encoding="utf-8", errors="replace").splitlines()[:5]
    except OSError:
        return False
    return any("GENERATED" in line for line in head)


def tracked_files(root: Path) -> list[str]:
    out = subprocess.run(
        ["git", "-C", str(root), "ls-files", "-z"],
        capture_output=True, text=True, check=True,
    ).stdout
    return [f for f in out.split("\0") if f]


def collect(root: Path) -> tuple[list[tuple[int, int, str]], list[dict]]:
    """Return (violations, warnings); exemptions are reported separately."""
    violations: list[tuple[int, int, str]] = []
    warnings: list[dict] = []
    for rel in tracked_files(root):
        p = Path(rel)
        if p.suffix not in SOURCE_SUFFIXES:
            continue
        if SKIP_PARTS & set(p.parts):
            continue
        exempt = next((t for t in EXEMPT_TREES if rel.startswith(t)), None)
        if exempt:
            continue
        path = root / rel
        if not path.is_file():
            continue
        if is_generated(path):
            continue
        lines = len(path.read_text(encoding="utf-8", errors="replace").splitlines())
        limit = TEST_HARD if is_test_file(rel) else SRC_HARD
        soft = SRC_SOFT
        if lines > limit:
            violations.append((lines, limit, rel))
        elif lines > soft:
            warnings.append({"lines": lines, "limit": soft, "path": rel})
    violations.sort(reverse=True)
    warnings.sort(key=lambda w: (-w["lines"], w["path"]))
    return violations, warnings


def stale_exemptions(root: Path) -> list[str]:
    files = tracked_files(root)
    missing = []
    for tree in EXEMPT_TREES:
        if not any(f.startswith(tree) for f in files):
            missing.append(tree)
    return missing


def run(root: Path) -> int:
    violations, warnings = collect(root)
    missing = stale_exemptions(root)
    exempt_count = sum(1 for f in tracked_files(root) if any(f.startswith(t) for t in EXEMPT_TREES))

    for w in warnings:
        print(f"  warning  {w['path']}  ({w['lines']} lines, soft limit {w['limit']})")
    for lines, limit, rel in violations:
        print(f"  VIOLATION  {rel}  ({lines} lines, limit {limit})")
    for tree in missing:
        print(f"  VIOLATION  exempt tree {tree} matches no tracked file — remove the exemption")

    if violations or missing:
        total = len(violations) + len(missing)
        print(f"\nFILE SIZES: FAIL — {total} violation(s); "
              f"{SRC_HARD} lines for source, {TEST_HARD} for tests")
        return 1
    print(f"\nFILE SIZES: PASS — {len(warnings)} over the {SRC_SOFT}-line soft limit, "
          f"{exempt_count} file(s) under the documented {len(EXEMPT_TREES)} exempt tree(s), "
          f"0 over {SRC_HARD}/{TEST_HARD}")
    return 0


def self_test() -> int:
    """Failing and passing fixtures, built in a temp tree with a git index."""
    failures: list[str] = []
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        (root / "src").mkdir()
        (root / "tests" / "gates").mkdir(parents=True)

        def write(rel: str, text: str) -> None:
            (root / rel).parent.mkdir(parents=True, exist_ok=True)
            (root / rel).write_text(text, encoding="utf-8")

        def git(*args: str) -> None:
            subprocess.run(["git", "-C", str(root), *args], check=True,
                           capture_output=True, text=True)

        git("init", "-q")

        # Passing tree: small source, a 550-line test (under TEST_HARD), a
        # generated file over the limit that declares itself generated, and a
        # small file in the preserved tree so its exemption is not stale.
        write("src/small.js", "export const a = 1;\n")
        write("tests/gates/big-test.mjs", "// t\n" * 550)
        write("src/generated.js", "// GENERATED by a script — do not edit.\n" + "x\n" * 2000)
        write("RadicalTrainingPlatform.Legacy.WinForms/MainForm.cs", "// legacy\n")

        def scan(label: str) -> tuple[int, str]:
            import io
            import contextlib
            buf = io.StringIO()
            with contextlib.redirect_stdout(buf):
                code = run(root)
            return code, buf.getvalue()

        git("add", "-A")
        code, out = scan("passing")
        if code != 0:
            failures.append(f"passing fixture should exit 0, exited {code}: {out.strip()}")
        if "FILE SIZES: PASS" not in out:
            failures.append("passing fixture did not report PASS")

        # Failing tree: a source file one line over the hard limit.
        write("src/oversize.js", "y\n" * (SRC_HARD + 1))
        git("add", "-A")
        code, out = scan("failing")
        if code != 1:
            failures.append(f"oversize source must exit 1, exited {code}")
        if "src/oversize.js" not in out or "VIOLATION" not in out:
            failures.append(f"oversize source not named: {out.strip()}")

        # Failing tree: a test file over TEST_HARD but under any source limit.
        (root / "src" / "oversize.js").unlink()
        write("tests/gates/too-long-test.mjs", "// t\n" * (TEST_HARD + 1))
        git("add", "-A")
        code, out = scan("failing-test")
        if code != 1 or "too-long-test.mjs" not in out:
            failures.append(f"oversize test file must be named and fail: {out.strip()}")

        # Failing tree: an exemption whose tree is gone. The preserved file is
        # removed, so its real exemption is stale too — both must be named.
        (root / "tests" / "gates" / "too-long-test.mjs").unlink()
        (root / "RadicalTrainingPlatform.Legacy.WinForms" / "MainForm.cs").unlink()
        git("add", "-A")
        EXEMPT_TREES["Gone.Tree/"] = "self-test only"
        try:
            code, out = scan("stale-exemption")
        finally:
            del EXEMPT_TREES["Gone.Tree/"]
        if code != 1 or "Gone.Tree/" not in out:
            failures.append(f"stale exemption must fail: {out.strip()}")

        # The real exempt tree must not itself fail the gate, however large.
        write("RadicalTrainingPlatform.Legacy.WinForms/MainForm.cs", "// legacy\n" * 2000)
        git("add", "-A")
        code, out = scan("preserved-tree")
        if code != 0:
            failures.append(f"preserved tree must be exempt: {out.strip()}")

    for f in failures:
        print(f"  FAIL {f}")
    if failures:
        print(f"\nFILE SIZES --self-test: {len(failures)} failure(s)")
        return 1
    print("\nFILE SIZES --self-test: PASS — failing and passing fixtures behave")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="Enforce source file size limits")
    ap.add_argument("--root", default=".", help="repository root (default: cwd)")
    ap.add_argument("--self-test", action="store_true",
                    help="run the failing and passing fixtures")
    args = ap.parse_args()
    if args.self_test:
        return self_test()
    return run(Path(args.root).resolve())


if __name__ == "__main__":
    sys.exit(main())
