#!/usr/bin/env python3
"""Packaging truth checks (PKG-02/03/04).

Some packaging defects are behavioural and are proved by running the script
(tests/gates/run_packaging_fixtures.sh does that for the Linux build). Others are
claims in the files themselves — a header that says "signed and notarized" for a
build whose signing is optional, a Flatpak manifest that execs a directory, a
permission list wider than the app needs. Those are checked here, on the files,
because that is where the defect lives.

The checks are written to tolerate a file that *discusses* a defect in order to
explain why it was removed, and to fire only on a file that still *commits* it.
A permission named in a "removed these" comment is not a permission granted; a
claim quoted in a "this header used to say" sentence is not a claim made.

Each check names the defect it exists to catch, so a failure says what broke
rather than which rule fired.

Usage:
  python3 scripts/check-packaging-manifests.py
  python3 scripts/check-packaging-manifests.py --root <tree>
  python3 scripts/check-packaging-manifests.py --self-test

Exit codes:
  0 — every packaging claim matches what the scripts do
  1 — at least one claim does not
  2 — self-test assertion failed
"""
import argparse
import pathlib
import re
import shutil
import sys
import tempfile
import xml.dom.minidom

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent

APPIMAGE = "packaging/linux/build-appimage.sh"
DMG = "packaging/macos/build-dmg.sh"
FLATPAK = "packaging/linux/app.radicaltrainingplatform.RadicalTrainingPlatform.yml"
ENTITLEMENTS = "packaging/macos/entitlements.plist"
INSTALL_CONTENT = "packaging/install-bundle-content.py"
GENERATOR = "scripts/generate-bundle-manifest.py"
METADATA = ("packaging/linux/"
            "app.radicaltrainingplatform.RadicalTrainingPlatform.metainfo.xml")

# Hosts that appear in a URL that has not been filled in. A placeholder URL is
# a link that 404s for every reader of the metadata.
PLACEHOLDER_HOSTS = ("your-org", "example.com", "example.org", "localhost")

# An AppStream comment explaining what was removed is not a claim; only the
# markup outside comments is.
COMMENT = re.compile(r"<!--.*?-->", re.DOTALL)

FULL_SHA = re.compile(r"^[0-9a-f]{40}$")

# Anything that would put a credential in the repository.
SECRET_MARKERS = ("APPLE_ID", "APPLE_PASSWORD", "--password", "NOTARY_PASSWORD",
                  "-----BEGIN", "ghp_", "AKIA")

# Words that mark a sentence as a description of the past rather than a claim
# about this build.
RETROSPECTIVE = re.compile(r"used to|previously|no longer|removed|optional|"
                           r"not requested|which it is not|was ", re.IGNORECASE)


def read(root, rel):
    path = pathlib.Path(root) / rel
    if not path.is_file():
        raise SystemExit(f"missing packaging file: {rel}")
    return path.read_text(encoding="utf-8")


def parses_as_xml(path):
    # XML comments cannot contain a double hyphen, so a command line pasted into
    # one silently produces a file no XML parser will accept.
    try:
        xml.dom.minidom.parse(str(path))
        return True
    except Exception:  # noqa: BLE001 — any parse failure means codesign would fail
        return False


def check_appimage(root, fail):
    text = read(root, APPIMAGE)
    lines = text.splitlines()

    # PKG-02: the script used to `exit 1` when appimagetool was absent, before
    # the advertised tarball fallback — so the documented path was unreachable
    # and a missing optional tool killed a build whose main artifact was fine.
    for i, line in enumerate(lines, 1):
        if re.match(r"^\s*exit\s+[1-9]", line):
            fail(f"{APPIMAGE}:{i}: a build script must not hard-exit; the appimagetool "
                 f"absence must degrade to the tarball, not kill the build")

    if "APPIMAGE_PRODUCED" not in text:
        fail(f"{APPIMAGE}: the AppImage path is not tracked, so the summary cannot "
             f"distinguish what was produced from what was hoped for")
    if "Build complete (tarball only)" not in text:
        fail(f"{APPIMAGE}: no honest summary for the tarball-only case")
    if INSTALL_CONTENT not in text:
        fail(f"{APPIMAGE}: does not install the content its manifest declares")


def check_dmg(root, fail):
    text = read(root, DMG)
    header = text.splitlines()[:25]

    # PKG-03: the header claimed a signed and notarized .dmg while both steps
    # were optional and their results were recorded nowhere. A header line that
    # describes the old claim is fine; a header line that makes it is not.
    for i, line in enumerate(header, 1):
        if re.search(r"signed and notarized", line, re.IGNORECASE) and \
                not RETROSPECTIVE.search(line):
            fail(f"{DMG}:{i}: the header claims a signed and notarized build; signing "
                 f"and notarization are optional here and must be described as such")
        if re.search(r"universal binary", line, re.IGNORECASE) and \
                not RETROSPECTIVE.search(line) and "UNIVERSAL" not in text:
            fail(f"{DMG}:{i}: claims a universal binary without checking the runtime")

    # The actual outcome has to be recorded, not asserted. A literal `true` in
    # the manifest is a claim; only the variable is a result.
    for var in ("SIGNING_REQUESTED", "SIGNED", "NOTARIZATION_REQUESTED",
                "NOTARIZED", "DMG_PRODUCED", "UNIVERSAL"):
        if f"${{{var}}}" not in text:
            fail(f"{DMG}: the build manifest does not record the actual {var} result, "
                 f"so the record is a claim about the build rather than its outcome")
    for key in ("signingNote", "notarizationNote", "architectures", "sourceCommit",
                "build-manifest.json"):
        if key not in text:
            fail(f"{DMG}: does not record {key!r} in its build manifest")

    # A missing create-dmg used to reach `exit 0` without saying no .dmg exists.
    if "create-dmg not found" not in text:
        fail(f"{DMG}: a missing create-dmg is not reported")
    if re.search(r"^\s*exit 0", text, re.MULTILINE):
        fail(f"{DMG}: exits 0 mid-script, so the summary can be skipped while the "
             f"build looks successful")

    # The entitlements file the signing step passes must exist — it did not, so
    # codesign could never have succeeded — and must be parseable, or codesign
    # rejects it at the point where the bundle is about to be signed.
    m = re.search(r"--entitlements\s+(\S+)", text)
    if not m:
        fail(f"{DMG}: signs without an entitlements file")
    else:
        entitlements = pathlib.Path(root) / m.group(1)
        if not entitlements.is_file():
            fail(f"{DMG}: signs with --entitlements {m.group(1)}, which does not exist")
        elif not parses_as_xml(entitlements):
            fail(f"{DMG}: signs with --entitlements {m.group(1)}, which is not valid "
                 f"XML — codesign would reject it and the bundle would ship unsigned")

    if INSTALL_CONTENT not in text:
        fail(f"{DMG}: does not install the content its manifest declares")


def check_flatpak(root, fail):
    text = read(root, FLATPAK)

    # PKG-04: the manifest pinned a short commit, which flatpak-builder cannot
    # resolve unambiguously.
    m = re.search(r"^\s*commit:\s*(\S+)\s*$", text, re.MULTILINE)
    if not m:
        fail(f"{FLATPAK}: no source commit is pinned")
    elif not FULL_SHA.match(m.group(1)):
        fail(f"{FLATPAK}: commit {m.group(1)!r} is not a full 40-character SHA")

    # The launcher must exec the binary the publish step actually produces, not
    # the publish *directory* (the old manifest exec'd /app/bin/…Core, a dir).
    out = re.search(r"--output\s+(\S+)", text)
    ex = re.search(r"exec\s+(\S+)\s+\"\$@\"", text)
    if not out:
        fail(f"{FLATPAK}: the publish step declares no --output")
    if not ex:
        fail(f"{FLATPAK}: no launcher exec line")
    if out and ex:
        expected = f"{out.group(1).rstrip('/')}/RadicalTrainingPlatform"
        if ex.group(1) != expected:
            fail(f"{FLATPAK}: the launcher execs {ex.group(1)!r}, but the publish "
                 f"step produces {expected!r}")

    # The launcher on PATH is what `command:` resolves to.
    cmd = re.search(r"^command:\s*(\S+)\s*$", text, re.MULTILINE)
    if not cmd:
        fail(f"{FLATPAK}: no command: entry")
    elif f"/app/bin/{cmd.group(1)}" not in text:
        fail(f"{FLATPAK}: command {cmd.group(1)!r} is not installed to /app/bin")

    # Permission review — read the granted list, not the prose around it. A flag
    # named in the "these were removed" comment is not granted.
    granted = re.search(r"^finish-args:\n((?:[ \t]+.*\n|\n)*)", text, re.MULTILINE)
    args = granted.group(1) if granted else ""
    if "--filesystem=home" in args:
        fail(f"{FLATPAK}: grants home-wide filesystem access; the app reads only its "
             f"own bundle and writes only its own data directory")
    if "--share=network" in args:
        fail(f"{FLATPAK}: shares the network; nothing in the app opens a socket")

    # Offline dependency inventory must be stated, not implied.
    if "nuget-sources.json" not in text:
        fail(f"{FLATPAK}: does not state how offline dependency sources are provided")
    if "OFFLINE" not in text.upper():
        fail(f"{FLATPAK}: does not say whether this manifest builds offline")

    if INSTALL_CONTENT not in text or GENERATOR not in text:
        fail(f"{FLATPAK}: does not generate and install its content manifest")


def check_metadata(root, fail):
    markup = COMMENT.sub("", read(root, METADATA))

    # PKG-05: the metadata pointed its URLs and screenshots at an organisation
    # that does not exist, so every link in it was dead.
    for host in PLACEHOLDER_HOSTS:
        if host in markup:
            fail(f"{METADATA}: still points at the placeholder host {host!r}; the "
                 f"link is dead for every reader of the metadata")

    # An empty <releases> block is invalid AppStream — and a release list is a
    # claim that downloadable builds exist, which only a tag can support.
    if "<releases>" in markup and "<release " not in markup:
        fail(f"{METADATA}: declares <releases> with no <release> inside it")


def check_no_secrets(root, fail):
    for rel in (APPIMAGE, DMG, FLATPAK, METADATA):
        text = read(root, rel)
        for marker in SECRET_MARKERS:
            if marker in text:
                fail(f"{rel}: contains {marker!r}; credentials belong in the build "
                     f"host's secure configuration, never in the repository")


def run_checks(root):
    failures = []
    check_appimage(root, failures.append)
    check_dmg(root, failures.append)
    check_flatpak(root, failures.append)
    check_metadata(root, failures.append)
    check_no_secrets(root, failures.append)
    return failures


# ── fixtures ────────────────────────────────────────────────────────────────
# Each mutation reintroduces one defect the checker exists to catch. The checker
# is only worth running if every one of these makes it fail.

def _copy_tree(root, dest):
    for rel in (APPIMAGE, DMG, FLATPAK, METADATA, ENTITLEMENTS,
                INSTALL_CONTENT, GENERATOR):
        out = pathlib.Path(dest) / rel
        out.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(pathlib.Path(root) / rel, out)


# (file, anchor, replacement, the defect this reintroduces)
MUTATIONS = [
    (APPIMAGE, 'echo "    appimagetool not found — skipping the AppImage, not the build."',
     'echo "    appimagetool not found"\n  exit 1',
     "a missing appimagetool hard-exits before the tarball"),
    (APPIMAGE, "APPIMAGE_PRODUCED", "PRODUCED_FLAG", "AppImage production is untracked"),
    (DMG, "# build-dmg.sh", "# build-dmg.sh\n# Builds a signed and notarized .dmg",
     "the header claims signing and notarization"),
    (DMG, 'RTP_SIGNED="${SIGNED}"', 'RTP_SIGNED="true"',
     "the signing result is asserted rather than recorded"),
    (DMG, 'RTP_NOTARIZED="${NOTARIZED}"', 'RTP_NOTARIZED="true"',
     "the notarization result is asserted rather than recorded"),
    (DMG, "create-dmg not found", "create-dmg absent", "a missing create-dmg is unreported"),
    (FLATPAK, "commit: f3d1d5d955d27ee912db45f48e914ec95c951e43", "commit: 72d5ec8",
     "a short SHA pin"),
    (FLATPAK, "        commit: ", "        # no commit pinned\n        url2: ",
     "no commit pinned at all"),
    (FLATPAK, "exec /app/lib/radicaltrainingplatform/RadicalTrainingPlatform \"$@\"",
     "exec /app/lib/radicaltrainingplatform \"$@\"", "the launcher execs a directory"),
    (FLATPAK, "  - --share=ipc", "  - --share=ipc\n  - --filesystem=home",
     "home-wide filesystem access"),
    (FLATPAK, "  - --share=ipc", "  - --share=ipc\n  - --share=network",
     "network sharing for an offline app"),
    (FLATPAK, "nuget-sources.json", "a-file-that-does-not-exist.json",
     "the offline dependency inventory is unstated"),
    (METADATA, '<component type="desktop-application">',
     '<component type="desktop-application">\n  '
     '<url type="homepage">https://github.com/your-org/thing</url>',
     "a placeholder host in the metadata URLs"),
    (METADATA, "<keywords>", "<releases>\n  </releases>\n  <keywords>",
     "a <releases> block with nothing released in it"),
    (ENTITLEMENTS, "  build-dmg.sh passed", "  build-dmg.sh passed --options runtime",
     "a command line pasted into an XML comment, making the plist unparseable"),
]


def self_test():
    root = REPO_ROOT
    failures = []

    # The shipped files must pass. A checker that fails the tree it lives in is
    # a checker nobody will run.
    for f in run_checks(root):
        failures.append(f"the shipped packaging files do not pass their own checks: {f}")

    for rel, needle, replacement, description in MUTATIONS:
        with tempfile.TemporaryDirectory() as td:
            _copy_tree(root, td)
            target = pathlib.Path(td) / rel
            text = target.read_text(encoding="utf-8")
            if needle not in text:
                failures.append(f"fixture anchor not found in {rel}: {needle!r} "
                                f"({description})")
                continue
            # Every occurrence, so the seeded defect is really reintroduced
            # rather than left standing in a second mention of the same name.
            target.write_text(text.replace(needle, replacement), encoding="utf-8")

            if not run_checks(td):
                failures.append(f"the checker passed a mutated {rel} ({description})")

    # A checker that never fails is not a checker: prove the harness itself can
    # report a failure by mutating something no rule looks at, and requiring the
    # rules to stay quiet about it.
    with tempfile.TemporaryDirectory() as td:
        _copy_tree(root, td)
        target = pathlib.Path(td) / DMG
        target.write_text(target.read_text(encoding="utf-8") + "\n# unrelated\n",
                          encoding="utf-8")
        if run_checks(td):
            failures.append("a harmless comment made the checker fail — the checks "
                            "are matching prose rather than packaging facts")

    if failures:
        for f in failures:
            print(f"SELF-TEST FAILURE: {f}", file=sys.stderr)
        return 2
    print(f"check-packaging-manifests self-test: all {len(MUTATIONS)} seeded defects "
          f"were caught, and the clean tree passed")
    return 0


def main():
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--root", default=str(REPO_ROOT), help="tree to check")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()

    if args.self_test:
        sys.exit(self_test())

    failures = run_checks(args.root)
    if failures:
        for f in failures:
            print(f"PACKAGING CHECK: FAIL — {f}", file=sys.stderr)
        sys.exit(1)
    print("PACKAGING CHECK: PASS — packaging scripts match the claims they make")


if __name__ == "__main__":
    main()
