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
mkdir -p "${OUT_DIR}"

# desktop entry
cp "packaging/linux/${APP_ID}.desktop" \
  "${APP_DIR}/usr/share/applications/"

# icon — try the asset store, else fall back to generating a placeholder
ICON_SRC=""
for candidate in \
  "${RADICALTRAININGPLATFORM_SLN}/Assets/radicaltrainingplatform.png" \
  "${RADICALTRAININGPLATFORM_SLN}/Assets/icon.png"; do
  if [ -f "${candidate}"; then
    ICON_SRC="${candidate}"
    break
  fi
done

if [ -n "${ICON_SRC}" ]; then
  cp "${ICON_SRC}" \
    "${APP_DIR}/usr/share/icons/hicolor/256x256/apps/${APP_ID}.png"
else
  echo "WARNING: No icon found in ${RADICALTRAININGPLATFORM_SLN}/Assets — add a 256x256 PNG icon."
  # Optional: generate a --size 16 solid block placeholder via ImageMagick
fi

# AppStream metadata
cp "packaging/linux/${APP_ID}.metainfo.xml" \
  "${APP_DIR}/usr/share/metainfo/"

# Ensure the launcher inside the AppDir is the published binary
chmod +x "${APP_DIR}/usr/bin/RadicalTrainingPlatform"

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
