#!/usr/bin/env python3
"""Built-artifact secret scan (T-23, TM-64 / REQ-AI-04).

Failing side this gate names: REQ-AI-04 requires that the browser never holds a
provider key and that the gateway holds provider secrets, not the artifact. The
tutor slice adds the first code in this repository that is *designed* to talk to
a model provider, which means it is also the first place a provider key could
arrive in the published tree — pasted into the tutor client during a debugging
session, written into the gateway's config file as a value instead of a
reference, or committed in a .env the deploy step copies. Nothing in the
pipeline could tell before this gate.

Two things are checked:

  1. CONTENT — no provider secret material appears anywhere in the built Pages
     artifact (RadicalTrainingPlatform.Web/). This is the tree pwa-deploy.yml
     uploads, so it is the tree that decides what the browser receives.

  2. SHAPE  — the gateway's own config carries secret *references*, never
     values. Any config key whose name reads as a secret must hold a reference
     (an environment-variable name, or `env:NAME`), not literal key material.
     The gateway is not published, but its config is committed, and a committed
     provider key is the same leak wherever it sits.

The scan is deliberately literal: it looks for shapes that are unambiguous, and
it does not try to guess whether a high-entropy string is a key. A gate that
guesses is a gate that gets switched off.

Usage:
  python3 scripts/check-artifact-secrets.py [--root DIR]
"""
import argparse
import json
import pathlib
import re
import sys

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent

ARTIFACT_DIR = "RadicalTrainingPlatform.Web"
GATEWAY_CONFIGS = ("services/ai-gateway/config.json", "services/ai-gateway/config.example.json")

# Files we never scan: binary payloads and the fonts/images a PWA ships.
SKIP_SUFFIXES = {
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".svgz",
    ".woff", ".woff2", ".ttf", ".otf", ".eot", ".mp3", ".mp4", ".pdf", ".zip",
}

# Unambiguous secret shapes. Each entry is (name, compiled pattern).
PATTERNS = [
    ("anthropic-style key", re.compile(r"\bsk-ant-[A-Za-z0-9_\-]{10,}")),
    ("openai-style key", re.compile(r"\bsk-[A-Za-z0-9_\-]{16,}")),
    ("aws access key id", re.compile(r"\bAKIA[0-9A-Z]{16}\b")),
    ("google api key", re.compile(r"\bAIza[0-9A-Za-z_\-]{35}\b")),
    ("github token", re.compile(r"\bgh[pousr]_[A-Za-z0-9]{20,}")),
    ("slack token", re.compile(r"\bxox[baprs]-[A-Za-z0-9\-]{10,}")),
    ("private key block", re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----")),
    ("json web token", re.compile(r"\beyJ[A-Za-z0-9_\-]{10,}\.eyJ[A-Za-z0-9_\-]{10,}\.")),
    ("secret assignment",
     re.compile(r"""(?i)\b(?:api[_-]?key|secret|token|password|passwd|bearer)\b\s*[:=]\s*"""
                r"""["'][A-Za-z0-9_\-\.]{16,}["']""")),
]

# Config keys whose value must be a reference rather than material.
SECRET_KEY = re.compile(r"(?i)(secret|key|token|password|credential)")
# A reference: an env-var name, or env:NAME. Not a quoted literal.
REFERENCE = re.compile(r"^(?:env:)?[A-Z][A-Z0-9_]{2,}$")

# Lines that carry a secret-shaped string on purpose, each with the reason it is
# not a leak. Matching is exact — path plus a distinctive fragment of the line —
# so editing the line makes the gate fail again. Loosening a pattern until it
# stops seeing a finding is how a gate becomes decorative; naming the finding
# and its reason keeps the exemption reviewable.
ALLOWED = [
    ("RadicalTrainingPlatform.Web/js/core/StateEngine.js",
     "api_key: 'nai-prod-key-001'",
     "synthetic lab-simulator seed state; the simulator never calls real infrastructure"),
    ("RadicalTrainingPlatform.Web/js/views/ai-tools.js",
     'api_key="nai-api-key-here"',
     "placeholder inside a documentation snippet in the NAI study material"),
    ("RadicalTrainingPlatform.Web/js/views/us-objects.js",
     "AKIAIOSFODNN7EXAMPLE",
     "AWS's own published example credentials, shown as study content about S3 access keys"),
]


def rel(path, root):
    try:
        return str(path.relative_to(root))
    except ValueError:
        return str(path)


def allowance(relpath, line):
    for path, fragment, reason in ALLOWED:
        if relpath == path and fragment in line:
            return reason
    return None


def scan_text(path, text):
    """Return a list of (line_number, pattern_name, excerpt) findings."""
    findings = []
    for n, line in enumerate(text.splitlines(), 1):
        for name, pattern in PATTERNS:
            m = pattern.search(line)
            if m:
                findings.append((n, name, m.group(0)[:60]))
    return findings


def scan_artifact(root, failures):
    artifact = root / ARTIFACT_DIR
    if not artifact.is_dir():
        failures.append(f"built artifact missing: {ARTIFACT_DIR}/ — nothing to scan")
        return 0, 0
    scanned = 0
    exempt = 0
    for path in sorted(artifact.rglob("*")):
        if not path.is_file() or path.suffix.lower() in SKIP_SUFFIXES:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        scanned += 1
        relpath = rel(path, root)
        lines = text.splitlines()
        for n, name, excerpt in scan_text(path, text):
            if allowance(relpath, lines[n - 1]):
                exempt += 1
                continue
            failures.append(
                f"secret in built artifact: {relpath}:{n} looks like a {name} "
                f"('{excerpt}') — the browser must never receive provider key material")
    return scanned, exempt


def scan_gateway_config(root, failures):
    checked = 0
    for relpath in GATEWAY_CONFIGS:
        path = root / relpath
        if not path.is_file():
            continue
        checked += 1
        try:
            config = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            failures.append(f"unreadable gateway config: {relpath} ({exc})")
            continue
        for key, value in walk(config):
            leaf = key.rsplit(".", 1)[-1]
            if not isinstance(value, str) or not value:
                continue
            if SECRET_KEY.search(leaf) and not REFERENCE.match(value):
                failures.append(
                    f"secret value in gateway config: {relpath} key '{key}' holds a literal "
                    f"('{value[:24]}…') — a config carries a reference, never material")
            for _n, name, excerpt in scan_text(path, f"{key}: {value}"):
                failures.append(
                    f"secret material in gateway config: {relpath} key '{key}' "
                    f"looks like a {name} ('{excerpt}')")
    return checked


def walk(obj, prefix=""):
    """Yield (dotted-key, value) for every leaf in a nested JSON object."""
    if isinstance(obj, dict):
        for key, value in obj.items():
            yield from walk(value, f"{prefix}.{key}" if prefix else key)
    elif isinstance(obj, list):
        for i, value in enumerate(obj):
            yield from walk(value, f"{prefix}[{i}]")
    else:
        yield prefix, obj


def main():
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--root", default=None,
                        help="tree to scan (default: this repository)")
    args = parser.parse_args()

    root = pathlib.Path(args.root).resolve() if args.root else REPO_ROOT
    failures = []

    scanned, exempt = scan_artifact(root, failures)
    configs = scan_gateway_config(root, failures)

    if failures:
        print("ARTIFACT SECRETS: FAIL")
        for f in failures:
            print(f"  {f}")
        sys.exit(1)

    print(f"ARTIFACT SECRETS: PASS — {scanned} file(s) in {ARTIFACT_DIR}/ carry no "
          f"provider secret material ({exempt} reviewed exemption(s)); "
          f"{configs} gateway config(s) hold references only")


if __name__ == "__main__":
    main()
