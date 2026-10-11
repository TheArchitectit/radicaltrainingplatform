#!/usr/bin/env bash
# R-24 defect class, seeded deliberately: a conditional diagnostic that exits 0
# wrongly.
#
# `bash -n` passes this file. The syntax is valid; every bracket is closed. What
# is wrong is the control flow — when the tool it needs is missing the script
# says so and then exits 0 anyway, so the caller cannot tell "nothing was
# produced" from "the build succeeded". That is the class ShellCheck sees and a
# syntax check cannot: R-24's "missing-bracket runtime defect class", where the
# failure is in what the exit code means rather than in whether the file parses.
#
# The gate asserts three things about this file:
#   1. `bash -n` passes it          — proving a syntax check is not the gate
#   2. ShellCheck fails it          — naming SC2181, the indirect `$?`
#   3. running it exits 0 while producing nothing — proving the defect is real
set -u

ICON_SRC="${RADICALTRAININGPLATFORM_SLN:-RadicalTrainingPlatform.Desktop}/Assets/icon.png"
APPIMAGE="dist/RadicalTrainingPlatform-x86_64.AppImage"
mkdir -p dist

command -v appimagetool >/dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "WARNING: appimagetool not found — no AppImage was produced."
    exit 0
fi

if [ ! -f "${ICON_SRC}" ]; then
    echo "WARNING: no icon found — the bundle ships without one."
fi

appimagetool AppDir "${APPIMAGE}"
echo "Build complete: ${APPIMAGE}"
