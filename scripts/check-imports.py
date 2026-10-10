#!/usr/bin/env python3
"""Case-sensitive ES module import graph checker for RadicalTrainingPlatform.Web.

Every relative import specifier in the PWA must resolve to an existing file
with the exact case as written — matching a case-sensitive deploy host
(GitHub Pages / Linux). A case-insensitive dev machine hides mismatches that
break production; this gate reproduces the deploy filesystem's semantics.

Exit 0: all imports resolve. Exit 1: list of broken imports printed.
"""
import argparse
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_WEB_ROOT = REPO_ROOT / "RadicalTrainingPlatform.Web"

IMPORT_RE = re.compile(r"""\bfrom\s+['"]([^'"]+)['"]""")
EXPORT_FROM_RE = re.compile(r"""\bexport\s+(?:\{[^}]*\}|\*\s+as\s+\w+|\*)\s+from\s+['"]([^'"]+)['"]""")
DYNAMIC_IMPORT_RE = re.compile(r"""\bimport\(\s*['"]([^'"]+)['"]\s*\)""")

VALID_EXTENSIONS = (".js", ".mjs")


def resolve_specifier(specifier: str, importer: Path) -> Path | None:
    """Resolve a relative import specifier against the importing file's dir."""
    if not specifier.startswith("."):
        return None  # bare specifier (none expected in this PWA); not checked
    base = (importer.parent / specifier).resolve()
    if base.is_file():
        return base
    # exact path plus known extension
    for ext in VALID_EXTENSIONS:
        candidate = Path(str(base) + ext)
        if candidate.is_file():
            return candidate
    # directory-index style not used in this codebase; treat as unresolved
    return None


def check_file(path: Path) -> list[str]:
    try:
        text = path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError) as exc:
        return [f"{path}: unreadable ({exc})"]
    errors: list[str] = []
    specifiers = IMPORT_RE.findall(text)
    specifiers += EXPORT_FROM_RE.findall(text)
    specifiers += DYNAMIC_IMPORT_RE.findall(text)
    for spec in specifiers:
        if not spec.startswith("."):
            continue
        target = resolve_specifier(spec, path)
        if target is None:
            errors.append(f"{path}: import '{spec}' does not resolve")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--root",
        type=Path,
        default=None,
        help="js root to scan (default: RadicalTrainingPlatform.Web/js)",
    )
    args = parser.parse_args()
    js_root = args.root if args.root is not None else DEFAULT_WEB_ROOT / "js"
    if not js_root.is_dir():
        print(f"IMPORT CHECK: FAIL — js root not found: {js_root}", file=sys.stderr)
        return 1
    errors: list[str] = []
    for path in sorted(js_root.rglob("*.js")):
        errors.extend(check_file(path))
    if errors:
        print("IMPORT CHECK: FAIL")
        for err in errors:
            print(f"  {err}")
        return 1
    print("IMPORT CHECK: PASS — all relative imports resolve case-sensitively")
    return 0


if __name__ == "__main__":
    sys.exit(main())
