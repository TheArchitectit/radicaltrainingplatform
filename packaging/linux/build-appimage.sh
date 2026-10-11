#!/usr/bin/env bash
set -euo pipefail

# build-appimage.sh
# Builds a Linux x64 bundle for the RadicalTrainingPlatform Avalonia app.
#
# Two artifacts come out of one AppDir:
#
#   dist/RadicalTrainingPlatform-x86_64.AppImage   — when appimagetool is present
#   dist/RadicalTrainingPlatform-linux-x64.tar.gz  — always
#
# The tarball is not a consolation prize bolted on the end. It is the artifact
# that always exists, and it is the one a fixture can prove: same AppDir, same
# content manifest, same executable launcher. The AppImage is the nicer wrapper
# around that AppDir and is produced only when the tool is available.
#
# Pre-repair this script did the opposite: `exit 1` on a missing appimagetool
# fired *before* the advertised fallback, so the documented tarball path was
# unreachable and the only outcome of a missing tool was a dead build. The exit
# code and the success line are now both tied to what was actually produced —
# "Build complete!" is printed only when the AppImage named in it exists.

APP_NAME="RadicalTrainingPlatform"
APP_ID="app.radicaltrainingplatform.RadicalTrainingPlatform"
APP_DIR="AppDir"
OUT_DIR="dist"
PKG_NAME="${APP_NAME}-x86_64.AppImage"
APPIMAGE="${OUT_DIR}/${PKG_NAME}"
TARBALL="${OUT_DIR}/${APP_NAME}-linux-x64.tar.gz"
MANIFEST_REL="share/radicaltrainingplatform/content-manifest.json"
MANIFEST="${APP_DIR}/usr/${MANIFEST_REL}"

# ---------------------------------------------------------------------------
# Configuration flags from dotenv or env
# ---------------------------------------------------------------------------
: "${RADICALTRAININGPLATFORM_BUILD_CONFIG:=Release}"
: "${RADICALTRAININGPLATFORM_RUNTIME:=linux-x64}"
: "${RADICALTRAININGPLATFORM_SLN:=RadicalTrainingPlatform.Desktop}"

echo "==> Step 1: .NET publish (${RADICALTRAININGPLATFORM_BUILD_CONFIG}, ${RADICALTRAININGPLATFORM_RUNTIME})"
dotnet publish "${RADICALTRAININGPLATFORM_SLN}/${RADICALTRAININGPLATFORM_SLN}.csproj" \
  -c "${RADICALTRAININGPLATFORM_BUILD_CONFIG}" \
  -r "${RADICALTRAININGPLATFORM_RUNTIME}" \
  --self-contained true \
  -p:PublishSingleFile=true \
  -p:PublishTrimmed=false \
  -o "${APP_DIR}/usr/bin"

echo "==> Step 2: Create AppDir structure"
mkdir -p "${APP_DIR}/usr/bin"
mkdir -p "${APP_DIR}/usr/share/applications"
mkdir -p "${APP_DIR}/usr/share/icons/hicolor/256x256/apps"
mkdir -p "${APP_DIR}/usr/share/metainfo"
mkdir -p "${APP_DIR}/usr/share/radicaltrainingplatform"
mkdir -p "${OUT_DIR}"

# desktop entry
cp "packaging/linux/${APP_ID}.desktop" \
  "${APP_DIR}/usr/share/applications/"

# icon — try the asset store, else fall back to generating a placeholder
ICON_SRC=""
for candidate in \
  "${RADICALTRAININGPLATFORM_SLN}/Assets/radicaltrainingplatform.png" \
  "${RADICALTRAININGPLATFORM_SLN}/Assets/icon.png"; do
  if [ -f "${candidate}" ]; then
    ICON_SRC="${candidate}"
    break
  fi
done

if [ -n "${ICON_SRC}" ]; then
  cp "${ICON_SRC}" \
    "${APP_DIR}/usr/share/icons/hicolor/256x256/apps/${APP_ID}.png"
else
  echo "WARNING: No icon found in ${RADICALTRAININGPLATFORM_SLN}/Assets — add a 256x256 PNG icon."
fi

# AppStream metadata
cp "packaging/linux/${APP_ID}.metainfo.xml" \
  "${APP_DIR}/usr/share/metainfo/"

# Ensure the launcher inside the AppDir is the published binary
chmod +x "${APP_DIR}/usr/bin/RadicalTrainingPlatform"

# ---------------------------------------------------------------------------
# Step 3: Content manifest (PKG-01)
#
# The bundle carries a deterministic record of the content it ships: which
# packs, their hashes, and the release state. It is generated into the AppDir
# *before* either artifact is packed, so the AppImage and the tarball carry the
# byte-identical manifest and neither can quietly ship different content from
# the other.
# ---------------------------------------------------------------------------
echo "==> Step 3: Content"
python3 scripts/generate-bundle-manifest.py \
  --content content \
  --out "${MANIFEST}"
# The manifest names the files; this installs exactly those next to it, so the
# AppImage and the tarball carry the same content the manifest describes.
python3 packaging/install-bundle-content.py \
  --manifest "${MANIFEST}" \
  --dest "${APP_DIR}/usr/share/radicaltrainingplatform"

# ---------------------------------------------------------------------------
# Step 4: AppImage — produced when appimagetool is available
#
# Absence degrades to the tarball (that is the documented fallback). A tool
# that is present but fails is a real error and is not swallowed: it means the
# environment is broken, not that the tool is missing.
# ---------------------------------------------------------------------------
APPIMAGE_PRODUCED=0
echo "==> Step 4: AppImage"
if command -v appimagetool &>/dev/null; then
  ARCH=x86_64 appimagetool "${APP_DIR}" "${APPIMAGE}"
  APPIMAGE_PRODUCED=1
  echo "    ${APPIMAGE}"
else
  echo "    appimagetool not found — skipping the AppImage, not the build."
  echo "      Install it with:"
  echo "        wget https://github.com/AppImage/AppImageKit/releases/download/continuous/appimagetool-x86_64.AppImage -O /tmp/appimagetool"
  echo "        chmod +x /tmp/appimagetool && sudo mv /tmp/appimagetool /usr/local/bin/appimagetool"
  echo "      The tarball below is the complete, runnable bundle."
fi

# ---------------------------------------------------------------------------
# Step 5: Tarball — always produced
# ---------------------------------------------------------------------------
echo "==> Step 5: Tarball"
tar -czf "${TARBALL}" -C "${APP_DIR}/usr" .
echo "    ${TARBALL}"

# ---------------------------------------------------------------------------
# Step 6: Summary — what was actually produced, not what was hoped for
# ---------------------------------------------------------------------------
echo ""
ls -lh "${OUT_DIR}/"
if [ "${APPIMAGE_PRODUCED}" -eq 1 ] && [ -f "${APPIMAGE}" ]; then
  echo "Build complete: ${APPIMAGE} and ${TARBALL}"
else
  echo "Build complete (tarball only): ${TARBALL}"
  echo "No AppImage was produced — appimagetool was not available."
fi
