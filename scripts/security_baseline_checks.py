#!/usr/bin/env python3
"""What the security baseline checks, and how each check reads the tree.

Split out of `check-security-baseline.py` so neither file carries the whole
gate at once: this module holds the policy and the six checks, the command
holds the fixture corpus that proves each check can fail. Every constant a
caller needs (`REPO_ROOT`, `WEB_DIR`, `INDEX`, `SBOM`, `WORKFLOWS`) lives here
and is re-imported by the command, so there is one definition.

See `check-security-baseline.py` for the docstring that explains the checks.
"""
import importlib.util
import json
import pathlib
import re

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent

WEB_DIR = "RadicalTrainingPlatform.Web"
INDEX = f"{WEB_DIR}/index.html"
SBOM = "docs/security/sbom.cdx.json"
WORKFLOWS = ".github/workflows"

CSP_META = re.compile(
    r"<meta\b[^>]*\bhttp-equiv=[\"']Content-Security-Policy[\"'][^>]*>",
    re.IGNORECASE)
# The content value contains single quotes (`'self'`), so the closing quote must
# match the opening one rather than being "any quote".
CSP_CONTENT = re.compile(r"""\bcontent\s*=\s*(?:"([^"]*)"|'([^']*)')""",
                         re.IGNORECASE)
SCRIPT_BLOCK = re.compile(r"<script\b([^>]*)>(.*?)</script\s*>",
                          re.IGNORECASE | re.DOTALL)

# An attribute-shaped handler: `onclick="..."` after whitespace, `<` or a quote
# (i.e. inside markup or a template literal). A property assignment such as
# `el.onclick = fn` is not matched, because its preceding character is `.`.
INLINE_HANDLER = re.compile(r"""(?:^|[\s<"'])on[a-z]{3,}\s*=\s*["']""",
                            re.IGNORECASE | re.MULTILINE)

REQUIRED_DIRECTIVES = {
    "default-src": "'self'",
    "object-src": "'none'",
    "base-uri": "'none'",
}

# Escapes that make a script policy decorative.
SCRIPT_ESCAPES = ("'unsafe-inline'", "'unsafe-eval'", "*", "data:", "http:", "https:")

LOOPBACK_HOSTS = {"127.0.0.1", "localhost", "::1", "[::1]"}

PAGES_MARKERS = ("upload-pages-artifact", "deploy-pages", "pages: write")

CODEQL_LANGUAGES = ("csharp", "javascript-typescript")


class Missing(Exception):
    """A file a check needs is not there. Reported, not raised to the top."""


def _read(root, rel):
    path = pathlib.Path(root) / rel
    if not path.is_file():
        raise Missing(f"{rel}: missing")
    return path.read_text(encoding="utf-8")


def _workflow_files(root):
    directory = pathlib.Path(root) / WORKFLOWS
    if not directory.is_dir():
        return []
    return sorted(list(directory.glob("*.yml")) + list(directory.glob("*.yaml")))


def _strip_yaml_comment(line):
    """Drop a trailing YAML comment. A comment that mentions a forbidden action
    is documentation, not a deployment."""
    match = re.search(r"(?:^|\s)#", line)
    return line[:match.start()] if match else line


def policy(root):
    """The CSP as {directive: [tokens]}, or None if the shell has no policy."""
    html = _read(root, INDEX)
    meta = CSP_META.search(html)
    if not meta:
        return None
    content = CSP_CONTENT.search(meta.group(0))
    if not content:
        return None
    value = next(g for g in content.groups() if g is not None)
    directives = {}
    for part in value.split(";"):
        tokens = part.split()
        if tokens:
            directives[tokens[0].lower()] = tokens[1:]
    return directives


def check_csp_present(root, fail):
    if policy(root) is None:
        fail(f"{INDEX}: has no Content-Security-Policy meta tag — a local client "
             f"has no server to set security headers, so this is the only policy "
             f"the browser will ever enforce")


def check_csp_directives(root, fail):
    directives = policy(root)
    if directives is None:
        return  # reported by check_csp_present
    for name, expected in REQUIRED_DIRECTIVES.items():
        tokens = directives.get(name)
        if tokens is None:
            fail(f"{INDEX}: the CSP has no {name} directive — {name} {expected} "
                 f"closes a whole class of injection the rest of the policy does "
                 f"not")
        elif expected not in tokens:
            fail(f"{INDEX}: {name} is {' '.join(tokens)!r}, which does not "
                 f"include {expected}")


def check_csp_script_src(root, fail):
    directives = policy(root)
    if directives is None:
        return
    tokens = directives.get("script-src")
    if tokens is None:
        fail(f"{INDEX}: the CSP sets no script-src, so the policy does not "
             f"constrain script at all")
        return
    for escape in SCRIPT_ESCAPES:
        if escape in tokens:
            fail(f"{INDEX}: script-src allows {escape}, which defeats the "
                 f"baseline — an injected script would run as first-party")


def check_csp_connect_src(root, fail):
    """The tutor gateway is loopback-only; the policy must agree."""
    directives = policy(root)
    if directives is None:
        return
    tokens = directives.get("connect-src")
    if tokens is None:
        fail(f"{INDEX}: the CSP sets no connect-src, so fetch/XHR is governed "
             f"by default-src 'self' — but an explicit loopback allowance is the "
             f"documented gateway contract, and its absence hides that")
        return
    for token in tokens:
        if token == "'self'":
            continue
        if token in ("*", "data:", "blob:"):
            fail(f"{INDEX}: connect-src allows {token}, so the local client may "
                 f"talk to anything")
            continue
        if "://" not in token:
            fail(f"{INDEX}: connect-src allows {token!r}, which is not 'self' or "
                 f"an explicit loopback origin")
            continue
        scheme, rest = token.split("://", 1)
        host = rest.split(":")[0].split("/")[0].lower()
        if scheme != "http" or host not in LOOPBACK_HOSTS:
            fail(f"{INDEX}: connect-src allows {token}, which is not a loopback "
                 f"origin — the local client must not depend on a remote host")


def _web_sources(root):
    web = pathlib.Path(root) / WEB_DIR
    out = []
    for pattern in ("*.html", "*.js"):
        out.extend(web.rglob(pattern))
    return sorted(p for p in out if p.is_file())


def check_no_inline_handlers(root, fail):
    for path in _web_sources(root):
        try:
            text = path.read_text(encoding="utf-8")
        except OSError:
            continue
        for match in INLINE_HANDLER.finditer(text):
            line = text.count("\n", 0, match.start()) + 1
            end = text.find("\n", match.start())
            snippet = text[match.start():end if end != -1 else len(text)]
            rel = path.relative_to(root).as_posix()
            fail(f"{rel}:{line}: inline event handler {snippet.strip()!r} — "
                 f"script-src 'self' blocks it, so the control renders and does "
                 f"nothing")


def check_no_inline_scripts(root, fail):
    for path in pathlib.Path(root).joinpath(WEB_DIR).rglob("*.html"):
        try:
            text = path.read_text(encoding="utf-8")
        except OSError:
            continue
        for match in SCRIPT_BLOCK.finditer(text):
            attrs, body = match.group(1), match.group(2)
            if "src=" in attrs.lower():
                continue
            if body.strip():
                line = text.count("\n", 0, match.start()) + 1
                rel = path.relative_to(root).as_posix()
                fail(f"{rel}:{line}: inline <script> block — blocked by "
                     f"script-src 'self'; move it to a module")


def _load_generator():
    path = pathlib.Path(__file__).with_name("generate-sbom.py")
    spec = importlib.util.spec_from_file_location("rtp_generate_sbom", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def check_sbom_matches(root, fail):
    """The committed SBOM must describe the tree that ships beside it."""
    try:
        committed = json.loads(_read(root, SBOM))
    except json.JSONDecodeError as exc:
        fail(f"{SBOM}: is not valid JSON ({exc})")
        return

    entries = committed.get("components")
    if not isinstance(entries, list):
        fail(f"{SBOM}: has no components array")
        return

    actual = {}
    for component in entries:
        ref = component.get("bom-ref")
        if not ref:
            fail(f"{SBOM}: a component has no bom-ref, so it cannot be matched")
            continue
        if ref in actual:
            fail(f"{SBOM}: {ref} appears more than once — CycloneDX requires "
                 f"unique bom-refs")
        actual[ref] = component

    expected = {c["bom-ref"]: c for c in _load_generator().components(root)}

    for ref in sorted(set(expected) - set(actual)):
        fail(f"{SBOM}: {ref} is referenced by the tree but absent from the SBOM "
             f"— run scripts/generate-sbom.py --out {SBOM}")
    for ref in sorted(set(actual) - set(expected)):
        fail(f"{SBOM}: {ref} is in the SBOM but nothing in the tree references "
             f"it — run scripts/generate-sbom.py --out {SBOM}")
    for ref in sorted(set(actual) & set(expected)):
        want = expected[ref].get("scope")
        got = actual[ref].get("scope")
        if want != got:
            fail(f"{SBOM}: {ref} is scope {got!r} but the tree makes it "
                 f"{want!r}")


def check_no_publication(root, fail):
    """No workflow may publish the web tree. Delivery is a git checkout."""
    for path in _workflow_files(root):
        rel = path.relative_to(root).as_posix()
        for number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
            code = _strip_yaml_comment(line)
            for marker in PAGES_MARKERS:
                if marker in code:
                    fail(f"{rel}:{number}: '{marker}' publishes the web tree — "
                         f"the product is delivered as a git checkout and run "
                         f"locally; a Pages deployment is a public-distribution "
                         f"path it does not have")


def check_codeql(root, fail):
    """CodeQL only runs where a workflow asks for it. Check that one does."""
    hits = []
    for path in _workflow_files(root):
        text = path.read_text(encoding="utf-8")
        if "github/codeql-action" in text:
            hits.append((path, text))
    if not hits:
        fail(f"{WORKFLOWS}: no workflow runs CodeQL — static analysis is free on "
             f"this public repository and is the one hosted security control a "
             f"local-client product can rely on")
        return
    joined = "\n".join(text for _, text in hits)
    for language in CODEQL_LANGUAGES:
        if language not in joined:
            fail(f"{WORKFLOWS}: the CodeQL workflow does not analyse "
                 f"{language!r} — that language ships in this tree unchecked")


CHECKS = (check_csp_present, check_csp_directives, check_csp_script_src,
          check_csp_connect_src, check_no_inline_handlers, check_no_inline_scripts,
          check_sbom_matches, check_no_publication, check_codeql)


def run_checks(root):
    failures = []
    for check in CHECKS:
        try:
            check(root, failures.append)
        except Missing as exc:
            failures.append(f"{exc} — the security artifact is incomplete")
    return failures
