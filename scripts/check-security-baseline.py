#!/usr/bin/env python3
"""Security baseline for a local-client delivery model (Sprint 41-42).

The product is checked out from source and served from the student's own
machine, so the usual server-side controls are not available: there is no
host to set security headers, no account system to audit, and no deploy
pipeline to lock down. What *is* available is the browser's own enforcement
and the repository's own history. This gate holds both:

1. **A Content-Security-Policy that actually constrains.** A meta CSP is the
   only header-less mechanism available to a file served from a checkout. It is
   checked for the directives that carry weight and for the escapes that would
   make the rest decorative (`'unsafe-inline'` in `script-src`).
2. **No inline script, in either spelling.** An inline `<script>` block or an
   `onclick=` attribute is silently dead under `script-src 'self'`; the page
   still renders, so the defect is a button that does nothing rather than an
   error anyone notices.
3. **`connect-src` reaches loopback and nothing else.** The tutor gateway runs
   on 127.0.0.1. A policy that admitted a remote host would make the local
   client depend on a server, which is not the product.
4. **The SBOM matches the tree.** `docs/security/sbom.cdx.json` is regenerated
   and compared component-by-component. A dependency added without refreshing
   the SBOM is the drift a bill of materials exists to prevent.
5. **Nothing publishes.** No workflow may upload a Pages artifact or deploy
   one. Delivery is `git clone`; a publishing workflow is a public-distribution
   path the product does not have.
6. **CodeQL runs.** Static analysis is the one free, hosted check a public
   repository gets, and it only runs if the workflow exists.

Each check names the defect it exists to catch.

Usage:
  python3 scripts/check-security-baseline.py
  python3 scripts/check-security-baseline.py --root <tree>
  python3 scripts/check-security-baseline.py --self-test

Exit codes:
  0 — the baseline holds
  1 — at least one check failed
  2 — self-test assertion failed
"""
import argparse
import json
import pathlib
import sys
import tempfile

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))

from security_baseline_checks import (  # noqa: E402
    INDEX,
    REPO_ROOT,
    SBOM,
    WEB_DIR,
    WORKFLOWS,
    _load_generator,
    run_checks,
)



# ── fixtures ────────────────────────────────────────────────────────────────
# A miniature honest tree: a shell with a real policy, one module, one project
# with one package, an SBOM generated from it, a CodeQL workflow and no
# publishing workflow. Every mutation reintroduces one defect.

CSP = ("default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; "
       "img-src 'self' data:; font-src 'self'; connect-src 'self' "
       "http://127.0.0.1:* http://localhost:*; worker-src 'self'; "
       "object-src 'none'; base-uri 'none'; form-action 'none'")

GOOD = {
    INDEX: f"""<!doctype html>
<html lang="en"><head>
<meta http-equiv="Content-Security-Policy" content="{CSP}">
<link rel="stylesheet" href="css/a.css">
</head><body>
<button id="go" type="button">Go</button>
<script type="module" src="js/app.js"></script>
</body></html>
""",
    f"{WEB_DIR}/css/a.css": "body { color: black; }\n",
    f"{WEB_DIR}/js/app.js": ("const b = document.getElementById('go');\n"
                             "b.addEventListener('click', () => b.textContent = 'ok');\n"),
    "Fixture/Fixture.csproj": """<Project Sdk="Microsoft.NET.Sdk">
  <ItemGroup>
    <PackageReference Include="Example.Library" Version="1.2.3" />
  </ItemGroup>
</Project>
""",
    f"{WORKFLOWS}/codeql.yml": """name: CodeQL
on: [push, pull_request]
jobs:
  analyse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with:
          languages: csharp, javascript-typescript
      - uses: github/codeql-action/analyze@v3
""",
}

# (path, anchor, replacement, the defect this reintroduces)
MUTATIONS = [
    (INDEX, f'<meta http-equiv="Content-Security-Policy" content="{CSP}">', "",
     "the shell has no Content-Security-Policy at all"),
    (INDEX, "script-src 'self';", "script-src 'self' 'unsafe-inline';",
     "script-src admits inline script"),
    (INDEX, "script-src 'self';", "script-src 'self' 'unsafe-eval';",
     "script-src admits eval"),
    (INDEX, "default-src 'self';", "default-src *;",
     "default-src does not restrict origins"),
    (INDEX, "object-src 'none'; ", "",
     "the policy does not block plugin content"),
    (INDEX, "connect-src 'self' http://127.0.0.1:* http://localhost:*;",
     "connect-src 'self' https://api.example.com;",
     "connect-src admits a remote host"),
    (INDEX, '<button id="go" type="button">Go</button>',
     '<button id="go" type="button" onclick="alert(1)">Go</button>',
     "the shell carries an inline event handler"),
    (INDEX, '<script type="module" src="js/app.js"></script>',
     '<script>alert(1)</script>',
     "the shell carries an inline script block"),
    (f"{WEB_DIR}/js/app.js", "const b = document.getElementById('go');",
     "const b = document.getElementById('go');\ndocument.body.innerHTML = "
     "'<a href=\"#\" onclick=\"go()\">x</a>';",
     "a module builds markup with an inline event handler"),
    ("Fixture/Fixture.csproj",
     '    <PackageReference Include="Example.Library" Version="1.2.3" />',
     '    <PackageReference Include="Example.Library" Version="1.2.3" />\n'
     '    <PackageReference Include="Example.New" Version="9.9.9" />',
     "a dependency was added without regenerating the SBOM"),
    (SBOM, '"bom-ref": "pkg:nuget/Example.Library@1.2.3"',
     '"bom-ref": "pkg:nuget/Example.Gone@0.0.1"',
     "the SBOM names a component the tree does not reference"),
    (f"{WORKFLOWS}/publish.yml", "__CREATE__",
     "name: Publish\non: [push]\njobs:\n  ship:\n    runs-on: ubuntu-latest\n"
     "    steps:\n      - uses: actions/upload-pages-artifact@v5\n",
     "a workflow uploads a Pages artifact"),
    (f"{WORKFLOWS}/codeql.yml", "languages: csharp, javascript-typescript",
     "languages: csharp",
     "the CodeQL workflow drops a language that ships here"),
]

DELETE_MUTATION = (f"{WORKFLOWS}/codeql.yml", "the CodeQL workflow is deleted")


def _write_tree(dest):
    for rel, text in GOOD.items():
        path = pathlib.Path(dest) / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8")
    # The SBOM is generated from the fixture's own csproj, so the clean tree
    # proves the match check has a real green direction.
    sbom = _load_generator().build(dest)
    target = pathlib.Path(dest) / SBOM
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(sbom, indent=2) + "\n", encoding="utf-8")


def self_test():
    failures = []

    # The shipped tree must pass its own baseline.
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
            if needle == "__CREATE__":
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_text(replacement, encoding="utf-8")
            else:
                text = target.read_text(encoding="utf-8")
                if needle not in text:
                    failures.append(f"fixture anchor not found in {rel}: {needle!r} "
                                    f"({description})")
                    continue
                target.write_text(text.replace(needle, replacement),
                                  encoding="utf-8")
            if not run_checks(td):
                failures.append(f"the checker passed a mutated {rel} ({description})")

    with tempfile.TemporaryDirectory() as td:
        _write_tree(td)
        (pathlib.Path(td) / DELETE_MUTATION[0]).unlink()
        if not run_checks(td):
            failures.append(f"the checker passed a tree where {DELETE_MUTATION[1]}")

    # Prove the harness reports an empty tree, so green means the checks ran.
    with tempfile.TemporaryDirectory() as td:
        if not run_checks(td):
            failures.append("the checker passed an empty tree")

    if failures:
        print("SECURITY BASELINE SELF-TEST: FAIL")
        for f in failures:
            print(f"  {f}")
        return 2
    print(f"SECURITY BASELINE SELF-TEST: PASS — shipped tree + clean fixture + "
          f"{len(MUTATIONS) + 1} seeded defects, each caught")
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
        print(f"SECURITY BASELINE CHECK: FAIL — no web tree under {root}",
              file=sys.stderr)
        return 1

    failures = run_checks(root)
    if failures:
        print("SECURITY BASELINE CHECK: FAIL")
        for f in failures:
            print(f"  {f}")
        return 1
    print("SECURITY BASELINE CHECK: PASS — restrictive CSP, no inline script, "
          "loopback-only network, SBOM matches the tree, no publication path, "
          "CodeQL configured")
    return 0


if __name__ == "__main__":
    sys.exit(main())
