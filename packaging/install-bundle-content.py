#!/usr/bin/env python3
"""Copy a bundle's declared content next to its manifest (PKG-01).

Every packaging script has to answer the same question: which files does this
bundle ship, and where do they go? The manifest already answers the first half.
This answers the second, in one place, so the Linux AppImage, the macOS .app and
the Flatpak cannot drift into shipping different sets of files.

It copies exactly the files the manifest declares — no more, and it fails if one
is missing rather than shipping a bundle that is quietly incomplete.

Usage:
  packaging/install-bundle-content.py --manifest <manifest.json> --dest <dir>
  packaging/install-bundle-content.py --manifest <m> --dest <d> --source-root <repo>
  packaging/install-bundle-content.py --self-test

Exit codes:
  0 — every declared file copied
  1 — a declared file is missing, or the manifest could not be read
  2 — self-test assertion failed
"""
import argparse
import json
import os
import pathlib
import shutil
import sys
import tempfile


def load_manifest(path):
    with open(path, encoding="utf-8") as handle:
        manifest = json.load(handle)
    files = manifest.get("files")
    if not isinstance(files, list) or not files:
        raise SystemExit(f"manifest {path} declares no files")
    return manifest


def install(manifest_path, dest, source_root):
    manifest = load_manifest(manifest_path)
    dest = pathlib.Path(dest)
    source_root = pathlib.Path(source_root)

    copied = 0
    for entry in manifest["files"]:
        rel = entry["path"]
        src = source_root / rel
        if not src.is_file():
            raise SystemExit(f"manifest declares {rel}, which is not under {source_root}")
        out = dest / rel
        out.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, out)
        copied += 1

    # The manifest goes with the content it describes: a bundle whose manifest
    # and content were generated separately is a bundle that can disagree with
    # itself.
    #
    # Every packaging script generates the manifest *into* the destination it
    # then passes here, so usually it is already in place and copying it would
    # be copying a file onto itself — which is an error, not a no-op.
    dest.mkdir(parents=True, exist_ok=True)
    target = dest / pathlib.Path(manifest_path).name
    if not (target.exists() and os.path.samefile(manifest_path, target)):
        shutil.copy2(manifest_path, target)
    return copied


def self_test():
    failures = []
    with tempfile.TemporaryDirectory() as td:
        root = pathlib.Path(td) / "src"
        (root / "content" / "exams").mkdir(parents=True)
        (root / "content" / "exams" / "a.md").write_text("### Q1\n", encoding="utf-8")
        (root / "errata.json").write_text("{}", encoding="utf-8")
        manifest = pathlib.Path(td) / "content-manifest.json"
        manifest.write_text(json.dumps({
            "bundleVersion": 1,
            "files": [
                {"path": "content/exams/a.md", "sha256": "x", "bytes": 8},
                {"path": "errata.json", "sha256": "y", "bytes": 2},
            ],
        }), encoding="utf-8")

        dest = pathlib.Path(td) / "out"
        copied = install(manifest, dest, root)
        if copied != 2:
            failures.append(f"expected 2 files copied, got {copied}")
        if not (dest / "content" / "exams" / "a.md").is_file():
            failures.append("nested content file must land at the same relative path")
        if not (dest / "errata.json").is_file():
            failures.append("top-level content file must be copied")
        if not (dest / "content-manifest.json").is_file():
            failures.append("the manifest must be copied with the content it describes")

        # A declared file that is not in the source tree must fail, not be skipped.
        (root / "errata.json").unlink()
        try:
            install(manifest, pathlib.Path(td) / "out2", root)
            failures.append("a missing declared file must fail the install")
        except SystemExit:
            pass

        # Every packaging script generates the manifest into the destination it
        # then installs into, so the manifest is already beside its content.
        # Copying it onto itself is an error, not a no-op — and it was one.
        (root / "errata.json").write_text("{}", encoding="utf-8")
        inplace = pathlib.Path(td) / "inplace"
        inplace.mkdir(parents=True, exist_ok=True)
        shutil.copy2(manifest, inplace / "content-manifest.json")
        try:
            install(inplace / "content-manifest.json", inplace, root)
        except Exception as exc:  # noqa: BLE001 — the point is that nothing raises
            failures.append(f"installing with the manifest already in place raised "
                            f"{type(exc).__name__}: {exc}")

    if failures:
        for f in failures:
            print(f"SELF-TEST FAILURE: {f}", file=sys.stderr)
        return 2
    print("install-bundle-content self-test: all fixtures behaved as expected")
    return 0


def main():
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--manifest", help="path to content-manifest.json")
    parser.add_argument("--dest", help="directory the content is installed into")
    parser.add_argument("--source-root", default=".",
                        help="tree the manifest's paths are relative to (default: .)")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()

    if args.self_test:
        sys.exit(self_test())

    if not args.manifest or not args.dest:
        parser.error("--manifest and --dest are required (or use --self-test)")

    copied = install(args.manifest, args.dest, args.source_root)
    print(f"    {copied} content file(s) -> {args.dest}")


if __name__ == "__main__":
    main()
