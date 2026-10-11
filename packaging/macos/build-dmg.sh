#!/usr/bin/env bash
set -euo pipefail

# build-dmg.sh
# Builds a macOS bundle for the RadicalTrainingPlatform Avalonia app.
#
# What comes out depends on what this machine actually has, and the script says
# which it did rather than claiming the best case:
#
#   dist/RadicalTrainingPlatform.dmg           — when create-dmg is present
#   dist/RadicalTrainingPlatform-macos.zip     — otherwise, and said out loud
#
# Signing and notarization run only when their credentials are supplied. Their
# actual outcome is recorded in Contents/Resources/build-manifest.json and in
# dist/build-manifest.json — this header used to claim the .dmg was "signed and
# notarized" while both were optional steps whose results were recorded nowhere.
#
# The .app is built for ONE architecture (RADICALTRAININGPLATFORM_RUNTIME). It is
# a universal binary only when that runtime is a universal one; the old header
# called the default osx-arm64 build a "universal binary target", which it is
# not. The manifest records which architectures were actually built.
#
# Credentials come from the environment or the build host's secure configuration.
# Never put an identity, keychain password or notary profile in this file, in a
# document, or in a log.

APP_NAME="RadicalTrainingPlatform"
APP_ID="app.radicaltrainingplatform.RadicalTrainingPlatform"
BUNDLE_ID="app.radicaltrainingplatform.RadicalTrainingPlatform"

# One architecture per build. A universal build is a different runtime id
# (osx-universal) and is recorded as such — it is not implied by osx-arm64.
: "${RADICALTRAININGPLATFORM_RUNTIME:=osx-arm64}"
: "${RADICALTRAININGPLATFORM_BUILD_CONFIG:=Release}"
: "${RADICALTRAININGPLATFORM_SLN:=RadicalTrainingPlatform.Desktop}"

APP_BUNDLE="${APP_NAME}.app"
CONTENTS="${APP_BUNDLE}/Contents"
MACOS="${CONTENTS}/MacOS"
RESOURCES="${CONTENTS}/Resources"
OUT_DIR="dist"
# The bundle's content lives beside the app's Resources, which is where
# ContentBundle looks for a macOS layout (<MacOS>/../Resources).
CONTENT_DIR="${RESOURCES}/radicaltrainingplatform"
BUILD_MANIFEST="${CONTENT_DIR}/build-manifest.json"

case "${RADICALTRAININGPLATFORM_RUNTIME}" in
  osx-universal|osx-universal2) UNIVERSAL=true ;;
  *) UNIVERSAL=false ;;
esac

# Developer identity strings (populated via env or defaults to empty)
: "${RADICALTRAININGPLATFORM_CODESIGN_ID:=}"
: "${RADICALTRAININGPLATFORM_NOTARY_KEYCHAIN:=}"
: "${RADICALTRAININGPLATFORM_NOTARY_PROFILE:=}"

SIGNING_REQUESTED=false
NOTARIZATION_REQUESTED=false
SIGNED=false
NOTARIZED=false
SIGNING_NOTE="not requested (set RADICALTRAININGPLATFORM_CODESIGN_ID to enable)"
NOTARIZATION_NOTE="not requested (set RADICALTRAININGPLATFORM_NOTARY_PROFILE to enable)"
DMG_PRODUCED=false
FAILED=false

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
mkdir -p "${CONTENT_DIR}"

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
  if [ -f "${candidate}" ]; then
    ICON_SRC="${candidate}"
    break
  fi
done

if [ -n "${ICON_SRC}" ]; then
  cp "${ICON_SRC}" "${RESOURCES}/${APP_NAME}.icns"
else
  echo "WARNING: no .icns found in ${RADICALTRAININGPLATFORM_SLN}/Assets — the bundle ships without an icon."
fi

# Ensure the executable bit is set
chmod +x "${MACOS}/RadicalTrainingPlatform"

# ---------------------------------------------------------------------------
# Step 3: Content (PKG-01)
#
# The bundle carries the content it declares and the manifest that names it,
# generated here rather than assumed. The app reads the manifest to know what it
# shipped; without it the app reports missing content instead of starting empty.
# ---------------------------------------------------------------------------
echo "==> Step 3: Content"
python3 scripts/generate-bundle-manifest.py \
  --content content \
  --out "${CONTENT_DIR}/content-manifest.json"

# Everything the manifest declares, copied next to it, so the manifest's
# bundle-relative paths resolve inside the .app.
python3 packaging/install-bundle-content.py \
  --manifest "${CONTENT_DIR}/content-manifest.json" \
  --dest "${CONTENT_DIR}"

# ---------------------------------------------------------------------------
# Step 4: Code signing — only when an identity is supplied, and recorded
# ---------------------------------------------------------------------------
echo "==> Step 4: Code signing"
if [ -n "${RADICALTRAININGPLATFORM_CODESIGN_ID}" ]; then
  SIGNING_REQUESTED=true
  echo "--- Signing .app bundle with identity: ${RADICALTRAININGPLATFORM_CODESIGN_ID}"
  if codesign --force --deep --options runtime \
      --sign "${RADICALTRAININGPLATFORM_CODESIGN_ID}" \
      --entitlements packaging/macos/entitlements.plist \
      "${APP_BUNDLE}"; then
    SIGNED=true
    SIGNING_NOTE="signed with ${RADICALTRAININGPLATFORM_CODESIGN_ID}"
  else
    SIGNING_NOTE="codesign FAILED — the bundle is not signed"
    FAILED=true
  fi
else
  echo "--- No signing identity supplied; the bundle will not be signed."
  echo "    Set RADICALTRAININGPLATFORM_CODESIGN_ID from the build host's secure config."
fi

# ---------------------------------------------------------------------------
# Step 5: .dmg when create-dmg is present, an explicit .zip when it is not
# ---------------------------------------------------------------------------
echo "==> Step 5: Disk image"
DMG_NAME="${OUT_DIR}/${APP_NAME}.dmg"
ZIP_NAME="${OUT_DIR}/${APP_NAME}-macos.zip"

if command -v create-dmg &>/dev/null; then
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
  DMG_PRODUCED=true
  echo "    ${DMG_NAME}"
else
  echo "    create-dmg not found — no .dmg will be produced."
  echo "      Install it with: brew install create-dmg"
  echo "      Falling back to a .zip of the .app bundle, which is the complete bundle."
fi

# The .zip is produced on the fallback path only. It is never presented as a
# .dmg, and the summary below names what actually exists.
if [ "${DMG_PRODUCED}" = false ]; then
  ditto -c -k --keepParent "${APP_BUNDLE}" "${ZIP_NAME}"
  echo "    ${ZIP_NAME}"
fi

# ---------------------------------------------------------------------------
# Step 6: Notarization — needs a .dmg, only when a profile is supplied, recorded
# ---------------------------------------------------------------------------
echo "==> Step 6: Notarization"
if [ -n "${RADICALTRAININGPLATFORM_NOTARY_PROFILE}" ]; then
  NOTARIZATION_REQUESTED=true
  if [ "${DMG_PRODUCED}" = false ]; then
    NOTARIZATION_NOTE="requested but no .dmg was produced, so nothing was submitted"
    FAILED=true
  else
    echo "--- Submitting to Apple notarytool with profile: ${RADICALTRAININGPLATFORM_NOTARY_PROFILE}"
    if xcrun notarytool submit "${DMG_NAME}" \
        --keychain-profile "${RADICALTRAININGPLATFORM_NOTARY_PROFILE}" \
        --wait \
        && xcrun stapler staple "${DMG_NAME}"; then
      NOTARIZED=true
      NOTARIZATION_NOTE="notarized and stapled via profile ${RADICALTRAININGPLATFORM_NOTARY_PROFILE}"
    else
      NOTARIZATION_NOTE="notarytool/stapler FAILED — the .dmg is not notarized"
      FAILED=true
    fi
  fi
else
  echo "--- No notary profile supplied; the bundle will not be notarized."
fi

# ---------------------------------------------------------------------------
# Step 7: Record what happened, in the bundle and beside the artifacts
# ---------------------------------------------------------------------------
echo "==> Step 7: Build manifest"
GIT_SHA="$(git rev-parse HEAD 2>/dev/null || echo unknown)"

# Every value reaches Python through the environment, not by interpolation into
# the program text. Interpolating this script's own booleans wrote `false` where
# Python needs `False`, so the manifest step raised NameError and the build
# failed on EVERY run — the recorded manifest that Step 7 exists to produce was
# never written. Interpolating the signing note would have broken the same way
# on any identity string containing a quote. The fixture pair in
# tests/gates/run_packaging_fixtures.sh is what executes this branch.
RTP_APP_ID="${APP_ID}" \
RTP_BUNDLE_ID="${BUNDLE_ID}" \
RTP_RUNTIME="${RADICALTRAININGPLATFORM_RUNTIME}" \
RTP_CONFIGURATION="${RADICALTRAININGPLATFORM_BUILD_CONFIG}" \
RTP_SOURCE_COMMIT="${GIT_SHA}" \
RTP_UNIVERSAL="${UNIVERSAL}" \
RTP_SIGNING_REQUESTED="${SIGNING_REQUESTED}" \
RTP_SIGNED="${SIGNED}" \
RTP_SIGNING_NOTE="${SIGNING_NOTE}" \
RTP_NOTARIZATION_REQUESTED="${NOTARIZATION_REQUESTED}" \
RTP_NOTARIZED="${NOTARIZED}" \
RTP_NOTARIZATION_NOTE="${NOTARIZATION_NOTE}" \
RTP_DMG_PRODUCED="${DMG_PRODUCED}" \
RTP_DMG_NAME="${DMG_NAME}" \
RTP_ZIP_NAME="${ZIP_NAME}" \
python3 - "${BUILD_MANIFEST}" "${OUT_DIR}/build-manifest.json" << 'PY'
import json, os, pathlib, sys

def flag(name):
    """The shell's booleans arrive as the strings 'true' and 'false'."""
    return os.environ.get(name, "false") == "true"

payload = {
    "appId": os.environ["RTP_APP_ID"],
    "bundleId": os.environ["RTP_BUNDLE_ID"],
    "runtime": os.environ["RTP_RUNTIME"],
    "universal": flag("RTP_UNIVERSAL"),
    "architectures": [os.environ["RTP_RUNTIME"]],
    "configuration": os.environ["RTP_CONFIGURATION"],
    "sourceCommit": os.environ["RTP_SOURCE_COMMIT"],
    "signingRequested": flag("RTP_SIGNING_REQUESTED"),
    "signed": flag("RTP_SIGNED"),
    "signingNote": os.environ["RTP_SIGNING_NOTE"],
    "notarizationRequested": flag("RTP_NOTARIZATION_REQUESTED"),
    "notarized": flag("RTP_NOTARIZED"),
    "notarizationNote": os.environ["RTP_NOTARIZATION_NOTE"],
    "dmgProduced": flag("RTP_DMG_PRODUCED"),
    "artifacts": ([os.environ["RTP_DMG_NAME"]] if flag("RTP_DMG_PRODUCED")
                  else [os.environ["RTP_ZIP_NAME"]]),
}
text = json.dumps(payload, indent=2) + "\n"
for target in sys.argv[1:]:
    path = pathlib.Path(target)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")
    print(f"    {target}")
PY

# ---------------------------------------------------------------------------
# Step 8: Summary — what exists, and whether anything that was asked for failed
# ---------------------------------------------------------------------------
echo ""
ls -lh "${OUT_DIR}/"
if [ "${DMG_PRODUCED}" = true ]; then
  echo "Build complete: ${DMG_NAME}"
else
  echo "Build complete (zip only): ${ZIP_NAME}"
  echo "No .dmg was produced — create-dmg was not available."
fi
echo "Signing: ${SIGNING_NOTE}"
echo "Notarization: ${NOTARIZATION_NOTE}"
echo "Architectures: ${RADICALTRAININGPLATFORM_RUNTIME} (universal: ${UNIVERSAL})"

if [ "${FAILED}" = true ]; then
  echo "BUILD FAILED: a requested signing or notarization step did not succeed." >&2
  exit 1
fi
