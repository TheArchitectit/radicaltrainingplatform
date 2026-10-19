#!/usr/bin/env python3
"""Generate a CycloneDX SBOM for the checked-out tree (S41-01).

The delivery model is `git clone` and run locally, so the SBOM describes what
a clone actually needs to build: the .NET PackageReference graph. There is no
npm manifest and no bundled web dependency — `RadicalTrainingPlatform.Web/` is
plain HTML/JS/CSS with no package.json — and the generator records that as a
metadata property rather than inventing components for it.

Determinism matters: `scripts/check-security-baseline.py` regenerates this and
compares the component set against the committed file, so a dependency added
without regenerating the SBOM fails the freeze chain. For that to work the
output must be byte-stable, so it carries no timestamp — the commit is the
date.

Usage:
    python3 scripts/generate-sbom.py                 # stdout
    python3 scripts/generate-sbom.py --out docs/security/sbom.cdx.json
"""
import argparse
import json
import pathlib
import sys
import xml.etree.ElementTree as ET

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent
WEB = "RadicalTrainingPlatform.Web"


def _local(tag):
    return tag.rsplit("}", 1)[-1]


def _project_files(root):
    return sorted(p for p in pathlib.Path(root).rglob("*.csproj")
                  if "bin" not in p.parts and "obj" not in p.parts)


def components(root):
    """Every project and the NuGet packages it references, sorted and unique.

    A package referenced by two projects appears once. CycloneDX requires unique
    `bom-ref`s, and the interesting fact is "the clone needs this", not "how
    many csproj files mention it". Scope escalates: if any non-test project needs
    the package it is `required`, even when a test project also lists it.
    """
    found = {}
    for csproj in _project_files(root):
        rel = csproj.relative_to(root).as_posix()
        name = csproj.stem
        is_test = name.endswith(".Tests")
        key = f"project:{rel}"
        found[key] = {
            "type": "application",
            "bom-ref": key,
            "name": name,
            "version": "0.0.0",
            "scope": "excluded" if is_test else "required",
            "properties": [{"name": "rtp:project-path", "value": rel}],
        }
        tree = ET.parse(csproj)
        for el in tree.iter():
            if _local(el.tag) != "PackageReference":
                continue
            pkg = el.get("Include")
            version = el.get("Version") or ""
            if not pkg:
                continue
            if not version:
                child = next((c for c in el if _local(c.tag) == "Version"), None)
                version = (child.text or "").strip() if child is not None else ""
            key = f"pkg:nuget/{pkg}@{version}"
            scope = "excluded" if is_test else "required"
            if key in found:
                if scope == "required":
                    found[key]["scope"] = "required"
                continue
            found[key] = {
                "type": "library",
                "bom-ref": key,
                "name": pkg,
                "version": version or "unspecified",
                "purl": key,
                "scope": scope,
            }
    return [found[k] for k in sorted(found)]


def build(root):
    return {
        "bomFormat": "CycloneDX",
        "specVersion": "1.5",
        "version": 1,
        "metadata": {
            "tools": {"components": [{
                "type": "application",
                "name": "rtp-generate-sbom",
                "version": "1",
            }]},
            "properties": [
                {"name": "rtp:delivery-model",
                 "value": "git clone and run locally; no hosted service"},
                {"name": "rtp:web-runtime-dependencies",
                 "value": f"none — {WEB}/ has no package.json and imports only its own tree"},
            ],
        },
        "components": components(root),
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=pathlib.Path, default=REPO_ROOT)
    parser.add_argument("--out", type=pathlib.Path, default=None)
    args = parser.parse_args()

    sbom = build(args.root)
    text = json.dumps(sbom, indent=2) + "\n"
    if args.out:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(text, encoding="utf-8")
        print(f"SBOM: wrote {len(sbom['components'])} components to {args.out}")
    else:
        sys.stdout.write(text)
    return 0


if __name__ == "__main__":
    sys.exit(main())
