#!/usr/bin/env python3
"""Release-link truth (R-19, SPEC-10 10.5).

A download link is a promise that something is there. This repository has no
tags and no releases, so every link to a releases page and every named bundle
artifact is a promise it cannot keep: the README pointed readers at
`github.com/rogerlundnetcenter/nutanixcertificationtool/releases` — a different
repository entirely — and at a `...-v0.2.0-alpha-win-x64.zip` "tracked via Git
LFS" that was never committed, in a repository with no `.gitattributes`. Every
one of those links 404s for the reader it was written for.

The honest statement today is that no pre-built binary exists and the reader
should build from source. That is what this checks for.

The scan is line-scoped, which is worth knowing when writing a retraction: the
honest marker and the thing it retracts have to be on the same line. A link
whose "no longer referenced" sits on the next line reads as a live link to this
check, so keep the sentence on one line.

Rules, applied to the user-facing surfaces (README, top-level docs, the Web
PWA, the packaging metadata):

  1. a releases/tags URL pointing at a repository that is not this one
  2. a releases URL pointing at this repository while no tag exists
  3. a named distributable artifact (`.zip`, `.dmg`, `.AppImage`, …) that is
     not in the tree and is not introduced by an honest retraction
  4. a Git LFS claim while there is no `.gitattributes`

Rules 2 and 4 stop applying once the thing they ask for exists — cut a tag and
rule 2 goes quiet, add `.gitattributes` and rule 4 does. They are not a
standing prohibition on ever publishing a download; they are a requirement that
the claim and the repository agree.

Usage:
  python3 scripts/check-release-links.py
  python3 scripts/check-release-links.py --root <tree>
  python3 scripts/check-release-links.py --self-test

Exit codes:
  0 — every download claim is backed by something that exists
  1 — at least one is not
  2 — self-test assertion failed
"""
import argparse
import pathlib
import re
import shutil
import subprocess
import sys
import tempfile

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent

# Where a download claim is a claim to a reader. The Drive-ingest OpenSpec
# archive is deliberately out of scope: it is the specification that *requires*
# truthful links, and its prose about releases is not a claim to anyone.
SURFACES = [
    "README.md",
    "docs/*.md",
    "RadicalTrainingPlatform.Web/*.html",
    "RadicalTrainingPlatform.Web/manifest.json",
    "RadicalTrainingPlatform.Web/sw.js",
    "packaging/linux/*.metainfo.xml",
    "packaging/linux/*.desktop",
]

# One source of truth for "this repository": the Flatpak source URL. If that
# ever moves, both the manifest and this check move with it.
FLATPAK = "packaging/linux/app.radicaltrainingplatform.RadicalTrainingPlatform.yml"
FALLBACK_REPO = "TheArchitectit/radicaltrainingplatform"

RELEASES_URL = re.compile(
    r"https?://(?:www\.)?github\.com/(?P<owner>[\w.-]+)/(?P<repo>[\w.-]+)/"
    r"(?:releases|tags)(?P<rest>[/\w.\-]*)",
    re.IGNORECASE)

ARTIFACT = re.compile(
    r"(?<![\w/.-])(?P<name>[\w][\w.+-]*\.(?:zip|dmg|AppImage|exe|deb|rpm|msi|pkg))"
    r"(?![\w])", re.IGNORECASE)

# A *usage claim*, not a mention. Prose that names Git LFS in order to say
# something else about it ("the fixture names a tag, an artifact or Git LFS")
# is not a claim that this repository tracks anything with it.
LFS_CLAIM = re.compile(
    r"(?:uses|use|using|tracked\s+(?:by|via|with)|requires|install(?:ing|ed)?)\s+"
    r"git[- ]lfs"
    r"|\bgit[- ]lfs\s+(?:install|track|pull|fetch)\b",
    re.IGNORECASE)

# A line that says the artifact does not exist is the honest statement this
# whole check exists to produce. It must not be what trips it.
RETRACTION = re.compile(
    r"no pre-built|not published|does not exist|no releases|no tags|"
    r"build from source|until a release|nothing to download|is empty|"
    r"not tracked|does not use|used to|previously|no longer",
    re.IGNORECASE)

# A narrower tolerance, for the one rule that is about the link itself rather
# than the claim. A foreign releases URL is never the right link — but a line
# that explicitly frames it as the mistake it was ("a prior revision linked
# to …", "no longer referenced") is a record of a fix, not the defect. Without
# this, the check fires on the very sentence that explains why the link is
# gone.
RETROSPECTIVE = re.compile(r"used to|previously|no longer|a prior revision|"
                           r"was ", re.IGNORECASE)


def canonical_repo(root):
    path = pathlib.Path(root) / FLATPAK
    if path.is_file():
        m = re.search(r"github\.com/([\w.-]+/[\w.-]+?)(?:\.git)?\s*$",
                      path.read_text(encoding="utf-8"), re.MULTILINE)
        if m:
            return m.group(1)
    return FALLBACK_REPO


def tag_count(root):
    try:
        out = subprocess.run(["git", "-C", str(root), "tag"],
                             capture_output=True, text=True, timeout=30)
    except (OSError, subprocess.SubprocessError):
        return None
    if out.returncode != 0:
        return None
    return len([t for t in out.stdout.splitlines() if t.strip()])


def tracked(root):
    """Files in the tree, as repository-relative paths."""
    base = pathlib.Path(root)
    return {str(p.relative_to(base)) for p in base.rglob("*") if p.is_file()}


def surfaces(root):
    base = pathlib.Path(root)
    seen = []
    for pattern in SURFACES:
        for path in sorted(base.glob(pattern)):
            if path.is_file() and path not in seen:
                seen.append(path)
    return seen


def check_file(path, root, repo, tags, present, fail):
    rel = str(pathlib.Path(path).relative_to(pathlib.Path(root)))
    for i, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        honest = bool(RETRACTION.search(line))

        for m in RELEASES_URL.finditer(line):
            slug = f"{m.group('owner')}/{m.group('repo')}"
            if slug.lower() != repo.lower():
                if not RETROSPECTIVE.search(line):
                    fail(f"{rel}:{i}: links to releases at {slug!r}, which is not this "
                         f"repository ({repo}) — the page it names is not this "
                         f"project's")
            elif tags == 0 and not honest:
                fail(f"{rel}:{i}: links to {repo}'s releases page, but this repository "
                     f"has no tags and no releases — nothing is behind that link. Point "
                     f"at build-from-source until a bundle exists.")

        for m in ARTIFACT.finditer(line):
            name = m.group("name")
            if honest:
                continue
            # A bare filename is a claim it can be obtained. Accept it only if
            # the tree actually carries it.
            if not any(p.endswith(name) for p in present):
                fail(f"{rel}:{i}: names the downloadable artifact {name!r}, which is "
                     f"not in the tree — no reader can obtain it")

        if LFS_CLAIM.search(line) and not honest:
            if not (pathlib.Path(root) / ".gitattributes").is_file():
                fail(f"{rel}:{i}: claims Git LFS, but this repository has no "
                     f".gitattributes, so nothing is tracked by LFS")


def run_checks(root):
    root = pathlib.Path(root)
    failures = []
    repo = canonical_repo(root)
    tags = tag_count(root)
    if tags is None:
        # Fail closed: without the tag list this check cannot tell a real
        # release link from a dead one, and silently dropping rule 2 would
        # leave the exact defect it exists to catch unreported.
        return [f"could not read the tag list under {root} (is this a git "
                f"checkout?) — cannot certify that no release is claimed"]
    present = tracked(root)
    files = surfaces(root)
    if not files:
        return [f"no user-facing surfaces found under {root} — the check would "
                f"pass vacuously"]
    for path in files:
        check_file(path, root, repo, tags, present, failures.append)
    return failures


# ── fixtures ────────────────────────────────────────────────────────────────
# Each mutation reintroduces one defect the checker exists to catch.

README = "README.md"
DOC = "docs/DESIGN-MATRIX-AND-ROADMAP.md"

MUTATIONS = [
    (README,
     "**No pre-built binary is published.**",
     "1. Download `RadicalTrainingPlatform-v0.2.0-alpha-win-x64.zip` from the "
     "[Releases](https://github.com/rogerlundnetcenter/nutanixcertificationtool/releases) page",
     "the README's original foreign-repository download link"),
    # The seeded line stands alone. Seeding it onto a line that also carries
    # the honest sentence would leave the retraction text in place, and the
    # mutation would be masked rather than caught.
    (README,
     "## 🚀 Quick Start",
     "## 🚀 Quick Start\n\nGet the latest build from "
     "https://github.com/TheArchitectit/radicaltrainingplatform/releases/latest",
     "a link to this repository's releases page with no release behind it"),
    (README,
     "## 🚀 Quick Start",
     "## 🚀 Quick Start\n\nGrab `RadicalTrainingPlatform-1.0.0-x86_64.AppImage` and run it.",
     "a named artifact that is not in the tree"),
    (README,
     "## 🤝 Contributing",
     "## 📦 Git LFS\n\nThis repository uses Git LFS.\n\n## 🤝 Contributing",
     "a Git LFS claim with no .gitattributes"),
]

# The honest sentence itself, in every shape a maintainer might write it, must
# pass. If the retraction vocabulary is what trips the check, the check is
# punishing the fix.
HONEST = [
    "There are no releases yet; build from source.",
    "No pre-built binary is published — see the build steps below.",
    "The packaged `.zip` does not exist in this repository.",
    "This project is not tracked by Git LFS.",
]


def _copy_surfaces(root, dest):
    """The surfaces, plus any artifact they name.

    A fixture that copies only the prose would fail on an artifact the real
    tree does carry — the fixture would be reporting its own missing file, not
    a defect. The referenced files come along so the check sees what the tree
    sees.
    """
    root = pathlib.Path(root)
    copied = []
    for pattern in SURFACES:
        for path in root.glob(pattern):
            if path.is_file():
                out = pathlib.Path(dest) / path.relative_to(root)
                out.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(path, out)
                copied.append(out)

    for path in copied:
        for m in ARTIFACT.finditer(path.read_text(encoding="utf-8")):
            name = m.group("name")
            for real in root.rglob(name):
                if real.is_file():
                    out = pathlib.Path(dest) / real.relative_to(root)
                    out.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(real, out)


def _init_git(root):
    """A throwaway checkout so tag_count() has something real to read.

    Every fixture tree needs this. Without it run_checks fails closed on the
    missing tag list, so a seeded defect would look caught when nothing about
    the defect was examined — the fixture would be reporting its own shape.
    """
    for cmd in (["init", "-q"], ["add", "-A"],
                ["-c", "user.email=t@example.invalid", "-c", "user.name=t",
                 "commit", "-q", "-m", "t"]):
        subprocess.run(["git", "-C", str(root)] + cmd, capture_output=True, check=True)


def _fixture_tree(root, td):
    _copy_surfaces(root, td)
    _init_git(td)
    return pathlib.Path(td)


def self_test():
    root = REPO_ROOT
    failures = []

    for f in run_checks(root):
        failures.append(f"the shipped tree does not pass its own check: {f}")

    # A copy of the tree with no seeded defect must pass — otherwise every
    # "must fail" fixture below would be failing on the copy, not the defect.
    with tempfile.TemporaryDirectory() as td:
        if run_checks(_fixture_tree(root, td)):
            failures.append("a pristine copy of the tree failed the check, so the "
                            "must-fail fixtures prove nothing")

    for rel, needle, replacement, description in MUTATIONS:
        with tempfile.TemporaryDirectory() as td:
            _fixture_tree(root, td)
            target = pathlib.Path(td) / rel
            text = target.read_text(encoding="utf-8")
            if needle not in text:
                failures.append(f"fixture anchor not found in {rel}: {needle!r} "
                                f"({description})")
                continue
            target.write_text(text.replace(needle, replacement, 1), encoding="utf-8")
            if not run_checks(td):
                failures.append(f"the checker passed a mutated {rel} ({description})")

    # The honest sentences must pass. The retraction is the fix, not the defect.
    for i, sentence in enumerate(HONEST):
        with tempfile.TemporaryDirectory() as td:
            _fixture_tree(root, td)
            target = pathlib.Path(td) / README
            target.write_text(target.read_text(encoding="utf-8") + "\n\n" + sentence + "\n",
                              encoding="utf-8")
            if run_checks(td):
                failures.append(f"honest sentence {i + 1} was rejected as a download "
                                f"claim: {sentence!r}")

    # A tag makes the releases link legitimate. The gate must lift, or it is a
    # prohibition on publishing rather than a truth check.
    with tempfile.TemporaryDirectory() as td:
        _fixture_tree(root, td)
        target = pathlib.Path(td) / README
        target.write_text(target.read_text(encoding="utf-8") +
                          "\n\nDownload the latest build from "
                          "https://github.com/TheArchitectit/radicaltrainingplatform/releases/latest\n",
                          encoding="utf-8")
        if not run_checks(td):
            failures.append("a releases link was accepted before any tag existed")
        subprocess.run(["git", "-C", td, "tag", "v0.1.0"], capture_output=True, check=True)
        if run_checks(td):
            failures.append("a releases link was rejected after a tag existed — the "
                            "check must lift once a release is real")

    if failures:
        for f in failures:
            print(f"SELF-TEST FAILURE: {f}", file=sys.stderr)
        return 2
    print(f"check-release-links self-test: all {len(MUTATIONS)} seeded defects were "
          f"caught, {len(HONEST)} honest sentences passed, and the check lifted once "
          f"a tag existed")
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
            print(f"RELEASE LINK CHECK: FAIL — {f}", file=sys.stderr)
        sys.exit(1)
    print("RELEASE LINK CHECK: PASS — every download claim is backed by something "
          "that exists")
    return 0


if __name__ == "__main__":
    sys.exit(main())
