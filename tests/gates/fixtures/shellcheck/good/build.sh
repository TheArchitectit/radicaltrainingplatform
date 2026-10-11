#!/usr/bin/env bash
# The same diagnostic as the failing fixture, done honestly.
#
# The gate must not become a prohibition on printing a warning, so this file
# says the same sentence about the missing tool and passes. What differs is that
# the exit code is tied to the outcome: this script produces no artifact on this
# path, so it exits non-zero and the caller learns the truth from `$?` alone.
#
# This is NOT in tension with packaging/linux/build-appimage.sh, which exits 0
# when appimagetool is absent — there the tarball IS produced, so 0 is the
# honest answer. Absence is only a failure when it leaves nothing behind.
set -u

ICON_SRC="${RADICALTRAININGPLATFORM_SLN:-RadicalTrainingPlatform.Desktop}/Assets/icon.png"
APPIMAGE="dist/RadicalTrainingPlatform-x86_64.AppImage"
mkdir -p dist

if ! command -v appimagetool >/dev/null 2>&1; then
    echo "WARNING: appimagetool not found — no AppImage was produced." >&2
    exit 1
fi

if [ ! -f "${ICON_SRC}" ]; then
    echo "WARNING: no icon found — the bundle ships without one." >&2
fi

appimagetool AppDir "${APPIMAGE}"
echo "Build complete: ${APPIMAGE}"
