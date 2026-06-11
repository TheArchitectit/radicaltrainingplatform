#!/usr/bin/env bash
set -euo pipefail

# build-dmg.sh
# Builds a signed and notarized .dmg for the RadicalTrainingPlatform Avalonia macOS app.

APP_NAME="RadicalTrainingPlatform"
APP_ID="app.radicaltrainingplatform.RadicalTrainingPlatform"
BUNDLE_ID="app.radicaltrainingplatform.RadicalTrainingPlatform"
# macOS universal binary target (Apple Silicon; switch to osx-x64 for Intel)
: "${RADICALTRAININGPLATFORM_RUNTIME:=osx-arm64}"
: "${RADICALTRAININGPLATFORM_BUILD_CONFIG:=Release}"
: "${RADICALTRAININGPLATFORM_SLN:=RadicalTrainingPlatform.Desktop}"

APP_BUNDLE="${APP_NAME}.app"
CONTENTS="${APP_BUNDLE}/Contents"
MACOS="${CONTENTS}/MacOS"
RESOURCES="${CONTENTS}/Resources"
OUT_DIR="dist"

# Developer identity strings (populated via env or defaults to empty)
: "${RADICALTRAININGPLATFORM_CODESIGN_ID:=}"
: "${RADICALTRAININGPLATFORM_NOTARY_KEYCHAIN:=}"
: "${RADICALTRAININGPLATFORM_NOTARY_PROFILE:=}"

echo "==> Step 1: .NET publish (${RADICALTRAININGPLATFORM_BUILD_CONFIG}, ${RADICALTRAININGPLATFORM_RUNTIME})"
dotnet publish "${RADICALTRAININGPLATFORM_SLN}/${RADICALTRAININGPLATFORM_SLN}.csproj" \
  -c "${RADICALTRAININGPLATFORM_BUILD_CONFIG}" \
  -r "${RADICALTRAININGPLATFORM_RUNTIME}" \
  --self-contained true \
  -p:PublishSingleFile=true \
  -p:PublishTrimmed=false \
  -o "${MACOS}"

echo "==> Step 2: Create .app bundle structure"
mkdir -p "${MACOS}"
mkdir -p "${RESOURCES}"
mkdir -p "${OUT_DIR}"

# --- Info.plist --------------------------------------------------------------
cat > "${CONTENTS}/Info.plist" << 'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDevelopmentRegion</key>
  <string>en</string>
  <key>CFBundleExecutable</key>
  <string>RadicalTrainingPlatform</string>
  <key>CFBundleIdentifier</key>
  <string>app.radicaltrainingplatform.RadicalTrainingPlatform</string>
  <key>CFBundleInfoDictionaryVersion</key>
  <string>6.0</string>
  <key>CFBundleName</key>
  <string>RadicalTrainingPlatform</string>
  <key>CFBundlePackageType</key>
  <string>APPL</string>
  <key>CFBundleShortVersionString</key>
  <string>0.3.0</string>
  <key>CFBundleVersion</key>
  <string>0.3.0</string>
  <key>LSMinimumSystemVersion</key>
  <string>12.0</string>
  <key>NSHighResolutionCapable</key>
  <true/>
  <key>LSApplicationCategoryType</key>
  <string>public.app-category.education</string>
</dict>
</plist>
PLIST

# --- Icon --------------------------------------------------------------------
ICON_SRC=""
for candidate in \
  "${RADICALTRAININGPLATFORM_SLN}/Assets/radicaltrainingplatform.icns" \
  "${RADICALTRAININGPLATFORM_SLN}/Assets/icon.icns"; do
  if [ -f "${candidate}"; then
    ICON_SRC="${candidate}"
    break
  fi
done

if [ -n "${ICON_SRC}" ]; then
  cp "${ICON_SRC}" "${RESOURCES}/${APP_NAME}.icns"
else
  # Create a trivial placeholder .icns from the PNG if available
  for png in \
    "${RADICALTRAININGPLATFORM_SLN}/Assets/radicaltrainingplatform.png" \
    "${RADICALTRAININGPLATFORM_SLN}/Assets/icon.png"; do
    if [ -f "${png}" ]; then
      mkdir -p /tmp/radicaltrainingplatform.iconset
      sips -z 16 16   "${png}" --out /tmp/radicaltrainingplatform.iconset/icon_16x16.png || true
      sips -z 32 32   "${png}" --out /tmp/radicaltrainingplatform.iconset/icon_16x16@2x.png || true
      sips -z 32 32   "${png}" --out /tmp/radicaltrainingplatform.iconset/icon_32x32.png || true
      sips -z 64 64   "${png}" --out /tmp/radicaltrainingplatform.iconset/icon_32x32@2x.png || true
      sips -z 128 128 "${png}" --out /tmp/radicaltrainingplatform.iconset/icon_128x128.png || true
      sips -z 256 256 "${png}" --out /tmp/radicaltrainingplatform.iconset/icon_128x128@2x.png || true
      sips -z 256 256 "${png}" --out /tmp/radicaltrainingplatform.iconset/icon_256x256.png || true
      sips -z 512 512 "${png}" --out /tmp/radicaltrainingplatform.iconset/icon_256x256@2x.png || true
      iconutil -c icns /tmp/radicaltrainingplatform.iconset -o "${RESOURCES}/${APP_NAME}.icns" || true
      rm -rf /tmp/radicaltrainingplatform.iconset
      break
    fi
  done
fi

# Ensure the executable bit is set
chmod +x "${MACOS}/RadicalTrainingPlatform"

echo "==> Step 3: Code signing (optional)"
if [ -n "${RADICALTRAININGPLATFORM_CODESIGN_ID}" ]; then
  echo "--- Signing .app bundle with identity: ${RADICALTRAININGPLATFORM_CODESIGN_ID}"
  codesign --force --deep --options runtime \
    --sign "${RADICALTRAININGPLATFORM_CODESIGN_ID}" \
    --entitlements packaging/macos/entitlements.plist \
    "${APP_BUNDLE}"
else
  echo "--- Skipping code signing (set RADICALTRAININGPLATFORM_CODESIGN_ID to enable)"
fi

echo "==> Step 4: Build .dmg with create-dmg"
DMG_NAME="${OUT_DIR}/${APP_NAME}.dmg"

if command -v create-dmg &>/dev/null; then
  # Remove any previous .dmg mount shadow files
  rm -f "${OUT_DIR}/${APP_NAME}-temp.dmg"

  create-dmg \
    --volname "${APP_NAME} Installer" \
    --window-pos 200 120 \
    --window-size 600 400 \
    --icon-size 100 \
    --app-drop-link 450 185 \
    --icon "${APP_NAME}.app" 150 185 \
    "${DMG_NAME}" \
    "${APP_BUNDLE}"
  echo "==> DMG produced: ${DMG_NAME}"
else
  echo "WARNING: create-dmg not found."
  echo "  Install via: brew install create-dmg"
  echo "  Falling back to a plain .zip of the .app bundle."
  ditto -c -k --keepParent "${APP_BUNDLE}" "${OUT_DIR}/${APP_NAME}-macos.zip"
  echo "==> ZIP fallback produced: ${OUT_DIR}/${APP_NAME}-macos.zip"
  exit 0
fi

echo "==> Step 5: Notarization (optional)"
if [ -n "${RADICALTRAININGPLATFORM_NOTARY_PROFILE}" ]; then
  echo "--- Submitting to Apple notarytool with profile: ${RADICALTRAININGPLATFORM_NOTARY_PROFILE}"
  xcrun notarytool submit "${DMG_NAME}" \
    --keychain-profile "${RADICALTRAININGPLATFORM_NOTARY_PROFILE}" \
    --wait

  echo "--- Stapling notarization ticket"
  xcrun stapler staple "${DMG_NAME}"
else
  echo "--- Skipping notarization (set RADICALTRAININGPLATFORM_NOTARY_PROFILE to enable)"
fi

echo ""
echo "Build complete!"
ls -lh "${OUT_DIR}/"
