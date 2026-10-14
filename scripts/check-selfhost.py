#!/usr/bin/env python3
"""Self-host readiness checks for the Web PWA (Sprints 29-30).

The platform is deployed by copying a directory and serving it. There is no
server, no account and no sync; the entire product is a static tree plus a
service worker. That makes two things load-bearing in a way nothing else in the
repo checks:

1. **The precache list is complete.** `sw.js` precaches a fixed list at install
   time. A module the app imports at runtime but that is not on the list is a
   feature that silently dies the first time a student opens the installed PWA
   with no network — and it dies for exactly the audience this path exists for
   (classrooms, lab machines, air-gapped sites).

2. **Every precached path exists.** `cache.addAll()` is all-or-nothing: one
   entry that 404s rejects the whole install, so the service worker never
   activates and there is no offline mode at all. A typo in the list is not a
   degraded install, it is no install.

It also holds the self-host guide to its own commands, and keeps the shell
servable from a subdirectory — which is how it is actually hosted (GitHub Pages
project sites, a folder on a lab file server).

Each check names the defect it exists to catch, so a failure says what broke
rather than which rule fired.

Usage:
  python3 scripts/check-selfhost.py
  python3 scripts/check-selfhost.py --root <tree>
  python3 scripts/check-selfhost.py --self-test

Exit codes:
  0 — the tree can be self-hosted as documented
  1 — at least one check failed
  2 — self-test assertion failed
"""
import argparse
import pathlib
import re
import sys
import tempfile

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent

WEB_DIR = "RadicalTrainingPlatform.Web"
GUIDE = "docs/SELF-HOST.md"
README = "README.md"

SW = f"{WEB_DIR}/sw.js"
INDEX = f"{WEB_DIR}/index.html"
MANIFEST = f"{WEB_DIR}/manifest.json"

# Files a reader is told to serve. The guide's own commands name this directory.
SERVE_COMMAND = re.compile(r"python3\s+-m\s+http\.server\b[^\n]*?"
                           r"(?:-d|--directory)\s+(\S+)")

# index.html's own references: a stylesheet, a module entry point, the manifest.
HTML_LINK = re.compile(r"""<(?:script|link)\b[^>]*?\b(?:src|href)=["']([^"']+)["']""")

# ES module specifiers: static, dynamic, re-export, and the bare side-effect
# form (`import './x.js';`) which carries no `from` clause and is easy to miss.
# The PWA uses no bundler, so what the browser resolves is what is written here.
IMPORT = re.compile(r"""\bfrom\s+['"]([^'"]+)['"]"""
                    r"""|\bimport\(\s*['"]([^'"]+)['"]\s*\)"""
                    r"""|\bimport\s+['"]([^'"]+)['"]"""
                    r"""|\bexport\s+(?:\{[^}]*\}|\*\s+as\s+\w+|\*)\s+from\s+['"]([^'"]+)['"]""")

STATIC_ASSETS = re.compile(r"const\s+STATIC_ASSETS\s*=\s*\[(.*?)\]", re.DOTALL)
QUOTED = re.compile(r"""['"]([^'"]+)['"]""")

# A remote or root-absolute reference in the shell. The app is served from a
# subdirectory on every host it actually runs on, so a leading `/` resolves to
# the host root and a remote host makes the copy depend on the network.
ABSOLUTE_REF = re.compile(r"^(?:https?:)?//|^/(?!/)")


class Missing(Exception):
    """A file a check needs is not there. Reported as a failure, not a crash."""


def _read(root, rel):
    path = pathlib.Path(root) / rel
    if not path.is_file():
        raise Missing(f"{rel}: missing")
    return path.read_text(encoding="utf-8")


def normalise(spec):
    """'./js/a.js' -> 'js/a.js'; '../x' and bare specifiers are returned as-is."""
    spec = spec.strip()
    while spec.startswith("./"):
        spec = spec[2:]
    return spec


def precache_list(root):
    """The literal paths sw.js precaches, normalised and without the './' root."""
    block = STATIC_ASSETS.search(_read(root, SW))
    if not block:
        return None
    out = []
    for raw in QUOTED.findall(block.group(1)):
        norm = normalise(raw)
        if norm in ("", "."):
            continue
        out.append(norm)
    return out


def reachable_assets(root):
    """Every file the browser loads, following the graph from index.html.

    Entry points are what index.html itself names; from there, every relative
    ES module specifier is followed transitively. Returns (assets, broken),
    where `broken` lists specifiers that resolve to nothing — a broken import is
    its own defect and is reported rather than skipped.
    """
    web = pathlib.Path(root) / WEB_DIR
    assets = set()
    broken = []

    queue = []
    for ref in HTML_LINK.findall(_read(root, INDEX)):
        if ref.startswith("data:") or ref.startswith("#"):
            continue
        if ABSOLUTE_REF.match(ref):
            # Reported by check_servable_from_subdirectory; not followed here.
            continue
        queue.append(normalise(ref))

    while queue:
        rel = queue.pop()
        if rel in assets:
            continue
        path = web / rel
        if not path.is_file():
            broken.append(rel)
            continue
        assets.add(rel)
        if path.suffix != ".js":
            continue
        for groups in IMPORT.finditer(path.read_text(encoding="utf-8")):
            spec = next((g for g in groups.groups() if g), None)
            if spec is None or not spec.startswith("."):
                continue
            base = (path.parent / spec).resolve()
            for candidate in ([base] if base.suffix else
                              [base.with_suffix(".js"), base.with_suffix(".mjs"), base]):
                if candidate.is_file():
                    queue.append(candidate.relative_to(web.resolve()).as_posix())
                    break
            else:
                broken.append(f"{rel} -> {spec}")
    return assets, broken


def check_precache_complete(root, fail):
    """A reachable asset that is not precached dies on a first-load offline open."""
    precached = precache_list(root)
    if precached is None:
        fail(f"{SW}: no STATIC_ASSETS list found; the precache contract is gone")
        return
    known = set(precached)
    assets, _ = reachable_assets(root)
    for rel in sorted(assets - known):
        fail(f"{SW}: '{rel}' is loaded at runtime but is not precached — it will "
             f"fail to load offline the first time the installed app is opened "
             f"without a network")


def check_precache_intact(root, fail):
    """One dead entry rejects cache.addAll(), so the service worker never installs."""
    precached = precache_list(root)
    if precached is None:
        return  # already reported
    web = pathlib.Path(root) / WEB_DIR
    for rel in sorted(set(precached)):
        if not (web / rel).is_file():
            fail(f"{SW}: precaches '{rel}', which does not exist — cache.addAll() "
                 f"is all-or-nothing, so this rejects the whole install and the "
                 f"app has no offline mode at all")


def check_entry_points(root, fail):
    """Everything the shell names must exist, and the worker must be registered."""
    html = _read(root, INDEX)
    web = pathlib.Path(root) / WEB_DIR
    for ref in HTML_LINK.findall(html):
        if ref.startswith("data:") or ref.startswith("#") or ABSOLUTE_REF.match(ref):
            continue
        if not (web / normalise(ref)).is_file():
            fail(f"{INDEX}: references '{ref}', which does not exist — the page "
                 f"loads without it")
    if "serviceWorker.register" not in html:
        fail(f"{INDEX}: does not register a service worker, so the documented "
             f"offline behaviour is not reachable from the shell")

    _, broken = reachable_assets(root)
    for item in broken:
        fail(f"{WEB_DIR}: import '{item}' does not resolve")


def check_servable_from_subdirectory(root, fail):
    """A root-absolute or remote reference breaks every real hosting layout."""
    html = _read(root, INDEX)
    for ref in HTML_LINK.findall(html):
        if ref.startswith("data:") or ref.startswith("#"):
            continue
        if ABSOLUTE_REF.match(ref):
            fail(f"{INDEX}: references '{ref}' by absolute path or remote host — "
                 f"the app is served from a subdirectory, where that resolves "
                 f"outside the copy")


def check_guide(root, fail):
    """The guide's commands are claims about this tree; hold them to it."""
    guide = pathlib.Path(root) / GUIDE
    if not guide.is_file():
        fail(f"{GUIDE}: the self-host guide does not exist")
        return
    text = guide.read_text(encoding="utf-8")

    commands = SERVE_COMMAND.findall(text)
    if not commands:
        fail(f"{GUIDE}: documents no way to serve the app")
    for target in commands:
        if not (pathlib.Path(root) / normalise(target)).is_dir():
            fail(f"{GUIDE}: tells the reader to serve '{target}', which is not a "
                 f"directory in this tree")

    readme = pathlib.Path(root) / README
    if not readme.is_file() or "SELF-HOST.md" not in readme.read_text(encoding="utf-8"):
        fail(f"{README}: does not link the self-host guide, so a reader who starts "
             f"at the front door never finds it")


CHECKS = (check_precache_complete, check_precache_intact, check_entry_points,
          check_servable_from_subdirectory, check_guide)


def run_checks(root):
    """Run every check. A missing file fails the checks that need it and no
    others, so one absent artifact does not hide the rest of the report."""
    failures = []
    for check in CHECKS:
        try:
            check(root, failures.append)
        except Missing as exc:
            failures.append(f"{exc} — the self-host artifact is incomplete")
    return failures


# ── fixtures ────────────────────────────────────────────────────────────────
# A miniature but structurally honest copy of the shipped layout: one entry
# point, one transitive import, a stylesheet, a manifest and a worker whose
# precache list is exactly right. Every mutation below reintroduces one defect.

GOOD = {
    f"{WEB_DIR}/index.html": """<!doctype html>
<html><head>
<link rel="manifest" href="manifest.json">
<link rel="stylesheet" href="css/a.css">
</head><body>
<script type="module" src="js/app.js"></script>
<script>navigator.serviceWorker.register('sw.js');</script>
</body></html>
""",
    f"{WEB_DIR}/manifest.json": '{"name":"t","start_url":".","scope":"."}\n',
    f"{WEB_DIR}/css/a.css": "body { color: black; }\n",
    f"{WEB_DIR}/js/app.js": "import './b.js';\n",
    f"{WEB_DIR}/js/b.js": "export const b = 1;\n",
    f"{WEB_DIR}/sw.js": """const CACHE_NAME = 't-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/a.css',
  './js/app.js',
  './js/b.js'
];
""",
    GUIDE: """# Self-host

```bash
python3 -m http.server -d RadicalTrainingPlatform.Web 8080
```
""",
    README: "See [the self-host guide](docs/SELF-HOST.md).\n",
}

# (path, anchor, replacement, the defect this reintroduces)
MUTATIONS = [
    (f"{WEB_DIR}/sw.js", "  './js/b.js'", "  './js/not-imported.js'",
     "a runtime-loaded module is dropped from the precache"),
    (f"{WEB_DIR}/sw.js", "  './js/b.js'", "  './js/b.js',\n  './js/ghost.js'",
     "the precache names a file that does not exist"),
    (f"{WEB_DIR}/index.html", 'src="js/app.js"', 'src="js/missing.js"',
     "the shell references a script that does not exist"),
    (f"{WEB_DIR}/index.html", 'src="js/app.js"', 'src="/js/app.js"',
     "the shell references its script by absolute path"),
    (f"{WEB_DIR}/index.html", 'href="css/a.css"', 'href="https://cdn.example.com/a.css"',
     "the shell loads a stylesheet from a remote host"),
    (f"{WEB_DIR}/index.html", "navigator.serviceWorker.register('sw.js');", "",
     "the shell never registers the service worker"),
    (f"{WEB_DIR}/js/app.js", "import './b.js';", "import './gone.js';",
     "a module import does not resolve"),
    (GUIDE, "-d RadicalTrainingPlatform.Web", "-d RadicalTrainingPlatform.Weeb",
     "the guide tells the reader to serve a directory that does not exist"),
    (GUIDE, "python3 -m http.server -d RadicalTrainingPlatform.Web 8080\n", "",
     "the guide documents no way to serve the app"),
    (README, "docs/SELF-HOST.md", "somewhere-else.md",
     "the README does not link the guide"),
    (f"{WEB_DIR}/sw.js", "const STATIC_ASSETS = [", "const ASSETS = [",
     "the precache list is gone entirely"),
]


def _write_tree(dest):
    for rel, text in GOOD.items():
        path = pathlib.Path(dest) / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8")


def self_test():
    failures = []

    # The shipped tree must pass. A checker that fails the tree it lives in is a
    # checker nobody will run.
    for f in run_checks(REPO_ROOT):
        failures.append(f"the shipped tree does not pass its own checks: {f}")

    with tempfile.TemporaryDirectory() as td:
        _write_tree(td)
        for f in run_checks(td):
            failures.append(f"the clean fixture does not pass: {f}")

    for rel, needle, replacement, description in MUTATIONS:
        with tempfile.TemporaryDirectory() as td:
            _write_tree(td)
            target = pathlib.Path(td) / rel
            text = target.read_text(encoding="utf-8")
            if needle not in text:
                failures.append(f"fixture anchor not found in {rel}: {needle!r} "
                                f"({description})")
                continue
            target.write_text(text.replace(needle, replacement), encoding="utf-8")
            if not run_checks(td):
                failures.append(f"the checker passed a mutated {rel} ({description})")

    # Prove the harness itself can report a failure, so a green run means the
    # checks ran rather than that nothing was asserted.
    with tempfile.TemporaryDirectory() as td:
        if not run_checks(td):
            failures.append("the checker passed an empty tree")

    if failures:
        print("SELFHOST SELF-TEST: FAIL")
        for f in failures:
            print(f"  {f}")
        return 2
    print(f"SELFHOST SELF-TEST: PASS — shipped tree + clean fixture + "
          f"{len(MUTATIONS)} seeded defects, each caught")
    return 0


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=pathlib.Path, default=None,
                        help="tree to check (default: the repository)")
    parser.add_argument("--self-test", action="store_true",
                        help="prove each check can fail")
    args = parser.parse_args()

    if args.self_test:
        return self_test()

    root = args.root if args.root is not None else REPO_ROOT
    if not (pathlib.Path(root) / WEB_DIR).is_dir():
        print(f"SELFHOST CHECK: FAIL — no web tree under {root}", file=sys.stderr)
        return 1

    failures = run_checks(root)
    if failures:
        print("SELFHOST CHECK: FAIL")
        for f in failures:
            print(f"  {f}")
        return 1
    print("SELFHOST CHECK: PASS — the tree is complete offline and servable "
          "from a subdirectory as documented")
    return 0


if __name__ == "__main__":
    sys.exit(main())
