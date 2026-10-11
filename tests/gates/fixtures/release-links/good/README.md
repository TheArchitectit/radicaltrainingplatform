# Fixture: a truthful set of download statements

This fixture must PASS `scripts/check-release-links.py`.

Every sentence below names a release, a tag, an artifact or Git LFS, and every
one of them is honest about what exists. The gate exists to catch a dead link,
not to punish the sentence that says the link is dead — so this file is the
regression that keeps the gate from becoming a prohibition on ever mentioning a
download.

**No pre-built binary is published.** This repository has no releases and no
tags, so there is nothing to download. Build from source until a release is cut.

The packaged `RadicalTrainingPlatform-1.0.0-x86_64.AppImage` does not exist in
this repository; the packaging scripts produce it on a build host.

This project is not tracked by Git LFS.

A prior revision of this file linked to https://github.com/rogerlundnetcenter/nutanixcertificationtool/releases, which is no longer referenced (the marker and the link must share a line — see the checker's docstring).
