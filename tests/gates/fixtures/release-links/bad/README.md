# Fixture: the download claims this gate exists to catch

This fixture must FAIL `scripts/check-release-links.py`. Each paragraph below
is a separate defect; the gate reports all three.

1. Download `RadicalTrainingPlatform-v0.2.0-alpha-win-x64.zip` from the
   [Releases](https://github.com/rogerlundnetcenter/nutanixcertificationtool/releases)
   page or from the repo root (tracked via Git LFS)

Grab `RadicalTrainingPlatform-1.0.0-x86_64.AppImage` and run it — no install
step required.

This repository uses Git LFS to track large binary files.
