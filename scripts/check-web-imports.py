#!/usr/bin/env python3
"""Fail if any relative ES-module import in the web app does not resolve.

One missing file breaks the whole module graph: pe-reports.js imported
../components/ConfirmDialog.js (the file is Confirm.js), so neither the PWA
nor the desktop Lab Simulator rendered anything, and no build step noticed.

Exit codes:
  0 — every relative import resolves
  1 — one or more broken imports
"""
import pathlib
import re
import sys

WEB_ROOT = pathlib.Path(__file__).resolve().parent.parent / "RadicalTrainingPlatform.Web"

# import ... from './x.js' | export ... from './x.js' | import './x.js' | import('./x.js')
IMPORT_RX = re.compile(
    r"""(?:\bfrom\s*|\bimport\s*\(?\s*)(['"])(\.{1,2}/[^'"]+)\1""",
)


def main() -> int:
    broken = []
    count = 0
    for js in sorted(WEB_ROOT.rglob("*.js")):
        text = js.read_text(encoding="utf-8")
        for match in IMPORT_RX.finditer(text):
            count += 1
            target = (js.parent / match.group(2)).resolve()
            if not target.is_file():
                line = text.count("\n", 0, match.start()) + 1
                broken.append(f"{js.relative_to(WEB_ROOT)}:{line}: {match.group(2)}")

    if broken:
        print(f"ERROR: {len(broken)} unresolved import(s) in {WEB_ROOT.name}:")
        for b in broken:
            print(f"  {b}")
        return 1
    print(f"OK: {count} relative imports resolve in {WEB_ROOT.name}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
