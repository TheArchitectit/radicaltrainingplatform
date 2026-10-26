#!/usr/bin/env bash
set -euo pipefail

# build-appimage.sh
# Builds a self-contained AppImage for the RadicalTrainingPlatform Avalonia app on Linux x64.

APP_NAME="RadicalTrainingPlatform"
APP_ID="app.radicaltrainingplatform.RadicalTrainingPlatform"
APP_DIR="AppDir"
OUT_DIR="dist"
PKG_NAME="${APP_NAME}-x86_64.AppImage"
TARBALL="${OUT_DIR}/${APP_NAME}-linux-x64.tar.gz"

# ---------------------------------------------------------------------------
# Configuration flags from dotenv or env
# ---------------------------------------------------------------------------
: "${RADICALTRAININGPLATFORM_BUILD_CONFIG:=Release}"
: "${RADICALTRAININGPLATFORM_RUNTIME:=linux-x64}"
: "${RADICALTRAININGPLATFORM_SLN:=RadicalTrainingPlatform.Desktop}"

echo "==> Step 1: .NET publish (${RADICALTRAININGPLATFORM_BUILD_CONFIG}, ${RADICALTRAININGPLATFORM_RUNTIME})"
# Not single-file: CefGlue needs libcef and its browser subprocess as real
# files next to the binary, and the exam banks ship as loose content files.
rm -rf "${APP_DIR}"
dotnet publish "${RADICALTRAININGPLATFORM_SLN}/${RADICALTRAININGPLATFORM_SLN}.csproj" \
  -c "${RADICALTRAININGPLATFORM_BUILD_CONFIG}" \
  -r "${RADICALTRAININGPLATFORM_RUNTIME}" \
  --self-contained true \
  -p:PublishSingleFile=false \
  -p:PublishTrimmed=false \
  -o "${APP_DIR}/usr/bin"

echo "==> Step 2: Create AppDir structure"
mkdir -p "${APP_DIR}/usr/share/applications"
mkdir -p "${APP_DIR}/usr/share/icons/hicolor/256x256/apps"
mkdir -p "${APP_DIR}/usr/share/metainfo"
mkdir -p "${OUT_DIR}"

# desktop entry
cp "packaging/linux/${APP_ID}.desktop" \
  "${APP_DIR}/usr/share/applications/"

# icon (the old test was missing its closing "]", so it never found one)
ICON_SRC=""
for candidate in \
  "${RADICALTRAININGPLATFORM_SLN}/Assets/radicaltrainingplatform.png" \
  "${RADICALTRAININGPLATFORM_SLN}/Assets/icon.png"; do
  if [ -f "${candidate}" ]; then
    ICON_SRC="${candidate}"
    break
  fi
done
if [ -z "${ICON_SRC}" ]; then
  echo "ERROR: No icon found in ${RADICALTRAININGPLATFORM_SLN}/Assets — appimagetool requires one." >&2
  exit 1
fi
cp "${ICON_SRC}" "${APP_DIR}/usr/share/icons/hicolor/256x256/apps/${APP_ID}.png"

# AppStream metadata
cp "packaging/linux/${APP_ID}.metainfo.xml" \
  "${APP_DIR}/usr/share/metainfo/"

# Ensure the launcher inside the AppDir is the published binary
chmod +x "${APP_DIR}/usr/bin/RadicalTrainingPlatform"

# appimagetool requires, at the AppDir ROOT: AppRun, one .desktop file and
# the icon it names (plus .DirIcon). None of these were created before.
cat > "${APP_DIR}/AppRun" << 'APPRUN'
#!/bin/sh
HERE="$(dirname "$(readlink -f "$0")")"
exec "${HERE}/usr/bin/RadicalTrainingPlatform" "$@"
APPRUN
chmod +x "${APP_DIR}/AppRun"
cp "packaging/linux/${APP_ID}.desktop" "${APP_DIR}/${APP_ID}.desktop"
cp "${ICON_SRC}" "${APP_DIR}/${APP_ID}.png"
ln -sf "${APP_ID}.png" "${APP_DIR}/.DirIcon"

echo "==> Step 3: Build AppImage via appimagetool"
if command -v appimagetool &>/dev/null; then
  ARCH=x86_64 appimagetool \
    "${APP_DIR}" \
    "${OUT_DIR}/${PKG_NAME}"
  echo "==> AppImage produced: ${OUT_DIR}/${PKG_NAME}"
else
  echo "ERROR: appimagetool not found."
  echo "  Install it with:"
  echo "    wget https://github.com/AppImage/AppImageKit/releases/download/continuous/appimagetool-x86_64.AppImage -O /tmp/appimagetool"
  echo "    chmod +x /tmp/appimagetool && sudo mv /tmp/appimagetool /usr/local/bin/appimagetool"
  exit 1
fi

# ---------------------------------------------------------------------------
# Step 4: tarball fallback (works even without appimagetool)
# ---------------------------------------------------------------------------
echo "==> Step 4: Create tarball fallback"
tar -czf "${TARBALL}" -C "${APP_DIR}/usr" .
echo "==> Tarball produced: ${TARBALL}"

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
echo ""
echo "Build complete!"
ls -lh "${OUT_DIR}/"
