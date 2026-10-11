#!/usr/bin/env bash
# PKG-01..04 fixtures for the packaging chain (S47-07 / T-25).
#
# Failing fixtures (each must FAIL its gate):
#   A. content edited after the manifest was generated   — --check must reject
#   B. a declared content file deleted                   — --check must reject
#   C. install with a declared file missing              — install must reject
#   D. appimagetool present but failing                  — build must exit non-zero
#   E. a seeded packaging claim regression               — the static checker must
#      reject it (short commit pin, placeholder metadata host, empty <releases>,
#      entitlements plist made unparseable by a pasted command line)
#   I. a release claimed that no tag backs               — must be rejected
#
# Passing fixtures:
#   F. the repository tree as it stands                  — --check and the static
#      checker must both pass, and the manifest must install completely
#   G. appimagetool absent                               — the build must still
#      produce the tarball, and must NOT say "Build complete:"
#   H. appimagetool present and working                  — the build must say it
#   J. no icon asset (AppImage)                          — the icon branch must
#      warn and install no icon, and the build must still succeed
#   K. an icon asset present (AppImage)                  — the icon branch must
#      install it at the hicolor path and stay quiet
#   L. no icon and no create-dmg (macOS)                 — the bundle must warn,
#      produce the .zip fallback, and claim no .dmg
#   M. an icon asset present (macOS)                     — the .icns must land in
#      the bundle's Resources
#
# Fixture G is the PKG-02 regression: pre-repair the script `exit 1`-ed when
# appimagetool was missing, so the advertised tarball fallback was unreachable.
# The build runs against a throwaway copy of the tree with a controlled PATH
# holding a stub `dotnet`, so the repository is never mutated and no real
# compiler is involved.
#
# J/K/L/M were added by S47-09/T-45 under R-24: "behavior fixtures that execute
# the script paths, not syntax checks". Each one runs the real script and
# asserts what it produced and what it said, rather than grepping the script for
# the branch it claims to have. L is the macOS script's first executable
# coverage — it runs under the same controlled PATH with `ditto` stubbed, which
# is what makes its create-dmg-absent fallback and its summary reachable here.
#
# Not covered here: a real flatpak-builder run, and a real macOS build, signing,
# notarization or launch on macOS. Both need hosts this environment does not
# have (see the S47-07 row in docs/sprints/SPRINT-47.md).
set -u
cd "$(dirname "$0")/../.."

fail=0
REPO="$PWD"

# expect_fail <label> <cmd...>
expect_fail() {
    local label="$1"; shift
    if "$@" >/dev/null 2>&1; then
        echo "FAIL: $label passed the gate (the gate cannot detect it)"
        fail=1
    else
        echo "PASS: $label failed the gate as required"
    fi
}

# expect_pass <label> <cmd...>
expect_pass() {
    local label="$1"; shift
    if "$@" >/dev/null 2>&1; then
        echo "PASS: $label passed the gate"
    else
        echo "FAIL: $label failed the gate"
        fail=1
    fi
}

WS="$(mktemp -d)"
trap 'rm -rf "$WS"' EXIT

# ---------------------------------------------------------------------------
# A sandbox: every tracked and untracked-but-not-ignored file, at the same
# relative paths. `git ls-files --others` is what carries the new packaging
# files, which are not committed yet when this runs in CI.
# ---------------------------------------------------------------------------
sandbox() {
    local dir="$1"
    rm -rf "$dir"
    mkdir -p "$dir"
    git -C "$REPO" ls-files --cached --others --exclude-standard \
      | grep -v '^\.playwright-mcp/' \
      | while IFS= read -r f; do
            [ -f "$REPO/$f" ] || continue
            mkdir -p "$dir/$(dirname "$f")"
            cp "$REPO/$f" "$dir/$f"
        done
}

sandbox "$WS/repo"

MANIFEST_CHECK=(python3 scripts/generate-bundle-manifest.py --content content --out content-manifest.json --check)

# ── F. the tree as it stands ────────────────────────────────────────────────
( cd "$WS/repo" && "${MANIFEST_CHECK[@]}" ) >/dev/null 2>&1 \
    && echo "PASS: the committed content manifest matches the content tree (PKG-01)" \
    || { echo "FAIL: content-manifest.json is stale — regenerate it"; fail=1; }

expect_pass "the packaging scripts make the claims they can back (PKG-03/04)" \
    python3 scripts/check-packaging-manifests.py

# ── A. content edited after the manifest was generated ──────────────────────
sandbox "$WS/stale"
printf '\n<!-- edited after the manifest was written -->\n' \
    >> "$WS/stale/content/exams/COMPTIA-NET-009/questions/net009-n3-fixtures.md"
expect_fail "content edited after the manifest was generated" \
    bash -c "cd '$WS/stale' && ${MANIFEST_CHECK[*]}"

# ── B. a declared content file deleted ──────────────────────────────────────
sandbox "$WS/missing"
rm "$WS/missing/content/exams/COMPTIA-A-1201/lessons/a2.md"
expect_fail "a declared content file deleted" \
    bash -c "cd '$WS/missing' && ${MANIFEST_CHECK[*]}"

# ── C. install with a declared file missing ─────────────────────────────────
# The manifest is the one that declares every file, and one of them is then
# removed: the install must refuse rather than ship a bundle that is quietly
# incomplete. (Regenerating the manifest here would erase the defect instead of
# seeding it, so the real manifest is copied in first.)
sandbox "$WS/short"
cp content-manifest.json "$WS/short/content-manifest.json"
rm "$WS/short/content/exams/COMPTIA-A-1201/lessons/a2.md"
expect_fail "install with a declared file missing" \
    python3 packaging/install-bundle-content.py \
        --manifest "$WS/short/content-manifest.json" \
        --dest "$WS/short/out" --source-root "$WS/short"

# ── F (cont.) the manifest installs completely ──────────────────────────────
DEST="$WS/installed"
if python3 packaging/install-bundle-content.py \
        --manifest content-manifest.json --dest "$DEST" >/dev/null 2>&1; then
    declared=$(python3 -c "import json,sys;print(len(json.load(open(sys.argv[1]))['files']))" \
        content-manifest.json)
    landed=$(find "$DEST" -type f ! -name content-manifest.json | wc -l)
    if [ "$declared" = "$landed" ] && [ -f "$DEST/content-manifest.json" ]; then
        echo "PASS: every declared content file installs beside its manifest ($landed files)"
    else
        echo "FAIL: manifest declares $declared files, $landed landed"
        fail=1
    fi
else
    echo "FAIL: the repository manifest did not install"
    fail=1
fi

# ── self-tests for the two helpers ──────────────────────────────────────────
expect_pass "generate-bundle-manifest self-test" \
    python3 scripts/generate-bundle-manifest.py --self-test
expect_pass "install-bundle-content self-test" \
    python3 packaging/install-bundle-content.py --self-test
expect_pass "check-packaging-manifests self-test (15 seeded defects caught)" \
    python3 scripts/check-packaging-manifests.py --self-test

# ── a release list requires a release ───────────────────────────────────────
# The metadata declared 0.1.0/0.2.0/0.3.0 with dated feature notes while `git
# tag` was empty and no GitHub release existed — a release list is a claim that
# downloadable builds exist. The check stops applying once a tag is cut.
METADATA="packaging/linux/app.radicaltrainingplatform.RadicalTrainingPlatform.metainfo.xml"
release_claim_gate() {
    [ "$(git -C "$REPO" tag | wc -l)" -eq 0 ] || return 0
    # Markup only: a comment explaining why the block was removed is not a
    # release claim.
    python3 - "$1" <<'PY'
import pathlib, re, sys
markup = re.sub(r"<!--.*?-->", "",
                pathlib.Path(sys.argv[1]).read_text(encoding="utf-8"), flags=re.DOTALL)
sys.exit(1 if "<releases>" in markup else 0)
PY
}
expect_pass "no release claimed that no tag backs" release_claim_gate "$METADATA"

sandbox "$WS/rel"
python3 - "$WS/rel/$METADATA" <<'PY'
import pathlib, sys
p = pathlib.Path(sys.argv[1])
p.write_text(p.read_text(encoding="utf-8").replace(
    "</component>",
    '  <releases>\n    <release version="9.9.9" date="2026-01-01"/>\n'
    '  </releases>\n</component>'), encoding="utf-8")
PY
expect_fail "a release claimed with no tag backing it" \
    release_claim_gate "$WS/rel/$METADATA"

# ── E. a seeded packaging claim regression ──────────────────────────────────
# A short Flatpak commit pin — the exact PKG-04 defect — must be rejected.
python3 - "$WS/repo/packaging/linux/app.radicaltrainingplatform.RadicalTrainingPlatform.yml" <<'PY'
import pathlib, sys
p = pathlib.Path(sys.argv[1])
p.write_text(p.read_text(encoding="utf-8").replace(
    "commit: f3d1d5d955d27ee912db45f48e914ec95c951e43", "commit: 72d5ec8"),
    encoding="utf-8")
PY
expect_fail "a short Flatpak commit pin (PKG-04)" \
    python3 scripts/check-packaging-manifests.py --root "$WS/repo"

# ---------------------------------------------------------------------------
# G/H/D. The Linux build under a controlled PATH.
#
# A stub `dotnet` stands in for the compiler: it honours -o and drops a fake
# apphost. Everything else is the real toolchain, so the script's control flow,
# its content installation and its summary line are the real ones.
# ---------------------------------------------------------------------------
BIN="$WS/bin"
mkdir -p "$BIN"
# `git` is needed by the macOS script's build manifest (it records the source
# commit, tolerating a tree that is not a checkout).
for tool in bash sh python3 tar gzip ls cp mkdir chmod rm cat find wc git dirname; do
    real="$(command -v "$tool")" && ln -sf "$real" "$BIN/$tool"
done

# `ditto` is macOS-only. The macOS script's fallback path shells out to it for
# the .zip, so without a stub that path cannot run here at all and the fixture
# would prove nothing about it. The stub writes the artifact it is asked for,
# which is all the assertions below read.
cat > "$BIN/ditto" <<'STUB'
#!/usr/bin/env bash
# Stub ditto: `ditto -c -k --keepParent <src> <dst>` — the destination is last.
for last; do :; done
[ -n "${last:-}" ] || exit 1
mkdir -p "$(dirname "$last")"
: > "$last"
STUB
chmod +x "$BIN/ditto"

cat > "$BIN/dotnet" <<'STUB'
#!/usr/bin/env bash
# Stub publish: honour -o and drop a fake apphost there.
out=""
while [ $# -gt 0 ]; do
    case "$1" in
        -o) out="$2"; shift 2 ;;
        *) shift ;;
    esac
done
[ -n "$out" ] || exit 1
mkdir -p "$out"
printf '#!/bin/sh\necho RadicalTrainingPlatform\n' > "$out/RadicalTrainingPlatform"
chmod +x "$out/RadicalTrainingPlatform"
STUB
chmod +x "$BIN/dotnet"

# run_build <sandbox> [appimagetool-stub] — run the AppImage build as it stands;
# echo its output. Does not sandbox, so a caller can seed a file first.
run_build() {
    local dir="$1"
    if [ -n "${2:-}" ]; then
        cp "$2" "$BIN/appimagetool"
        chmod +x "$BIN/appimagetool"
    else
        rm -f "$BIN/appimagetool"
    fi
    ( cd "$dir" && env -i PATH="$BIN" HOME="$HOME" \
        bash packaging/linux/build-appimage.sh 2>&1 )
}

# build <sandbox> [appimagetool-stub] — sandbox, then run the AppImage build
build() {
    sandbox "$1"
    run_build "$@"
}

# run_macos_build <sandbox> — run the macOS build as it stands; echo its output.
# create-dmg is deliberately absent from $BIN, so the fallback path is the one
# exercised. No signing identity or notary profile is supplied either, so the
# script takes its "not requested" branches and exits 0.
run_macos_build() {
    ( cd "$1" && env -i PATH="$BIN" HOME="$HOME" \
        bash packaging/macos/build-dmg.sh 2>&1 )
}

# The icon the packaging scripts look for, and where each one installs it.
ICON_ASSET="RadicalTrainingPlatform.Desktop/Assets/radicaltrainingplatform.png"
ICNS_ASSET="RadicalTrainingPlatform.Desktop/Assets/radicaltrainingplatform.icns"
APP_ID="app.radicaltrainingplatform.RadicalTrainingPlatform"

# seed_icon <sandbox> <asset-path> — drop a file where the script looks for one.
seed_icon() {
    mkdir -p "$(dirname "$1/$2")"
    printf 'not a real image, but a real file\n' > "$1/$2"
}

# ── G. appimagetool absent — the tarball is the artifact ────────────────────
OUT="$(build "$WS/none")"
STATUS=$?
TARBALL="$WS/none/dist/RadicalTrainingPlatform-linux-x64.tar.gz"
if [ "$STATUS" -ne 0 ]; then
    echo "FAIL: the build failed without appimagetool (PKG-02 regression)"
    fail=1
elif [ ! -f "$TARBALL" ]; then
    echo "FAIL: no tarball was produced without appimagetool"
    fail=1
elif echo "$OUT" | grep -q "Build complete:"; then
    echo "FAIL: the build claimed 'Build complete:' with no AppImage produced"
    fail=1
elif ! echo "$OUT" | grep -q "Build complete (tarball only)"; then
    echo "FAIL: the build did not say what it actually produced"
    fail=1
elif ! tar -tzf "$TARBALL" | grep -q "share/radicaltrainingplatform/content-manifest.json"; then
    echo "FAIL: the tarball does not carry the content manifest"
    fail=1
elif [ ! -x "$WS/none/AppDir/usr/bin/RadicalTrainingPlatform" ]; then
    echo "FAIL: the AppDir launcher is not executable"
    fail=1
else
    echo "PASS: appimagetool absent -> tarball produced, launcher executable,"
    echo "      manifest inside, and no false 'Build complete:' (PKG-02)"
fi

# ── H. appimagetool present and working ─────────────────────────────────────
cat > "$WS/good-appimagetool" <<'STUB'
#!/usr/bin/env bash
# Stub appimagetool: writes the artifact it is asked for.
[ -n "${2:-}" ] || exit 1
: > "$2"
STUB
OUT="$(build "$WS/good" "$WS/good-appimagetool")"
STATUS=$?
if [ "$STATUS" -ne 0 ]; then
    echo "FAIL: the build failed with a working appimagetool"
    fail=1
elif ! echo "$OUT" | grep -q "Build complete:"; then
    echo "FAIL: the build did not report the AppImage it produced"
    fail=1
elif [ ! -f "$WS/good/dist/RadicalTrainingPlatform-x86_64.AppImage" ]; then
    echo "FAIL: 'Build complete:' was printed without an AppImage"
    fail=1
else
    echo "PASS: a working appimagetool produces the AppImage and says so"
fi

# ── D. appimagetool present but failing ─────────────────────────────────────
cat > "$WS/bad-appimagetool" <<'STUB'
#!/usr/bin/env bash
# Stub appimagetool that fails: a present-but-broken tool is a real error, not
# an absence, and must not be reported as success.
echo "appimagetool: cannot pack" >&2
exit 1
STUB
OUT="$(build "$WS/bad" "$WS/bad-appimagetool")"
STATUS=$?
if [ "$STATUS" -eq 0 ]; then
    echo "FAIL: a failing appimagetool was reported as a successful build"
    fail=1
elif echo "$OUT" | grep -q "Build complete"; then
    echo "FAIL: a failing appimagetool still printed a completion line"
    fail=1
else
    echo "PASS: a failing appimagetool fails the build and prints no completion line"
fi

# ---------------------------------------------------------------------------
# J/K. The AppImage script's icon branch (S47-09/T-45, R-24).
#
# R-24 asks for behavior fixtures that execute the script paths rather than
# checking their syntax. These run the real build with and without an icon asset
# and assert on what landed on disk and what was printed — the branch is proven
# by its effect, not by the presence of the string in the file.
# ---------------------------------------------------------------------------

# ── J. no icon asset ────────────────────────────────────────────────────────
sandbox "$WS/noicon"
OUT="$(run_build "$WS/noicon")"
STATUS=$?
ICON_DEST="$WS/noicon/AppDir/usr/share/icons/hicolor/256x256/apps"
if [ "$STATUS" -ne 0 ]; then
    echo "FAIL: the build failed with no icon asset present"
    echo "$OUT" | tail -20 | sed 's/^/      /'
    fail=1
elif ! echo "$OUT" | grep -q "No icon found in"; then
    echo "FAIL: the icon branch did not warn that no icon was found"
    fail=1
elif ! echo "$OUT" | grep -q "add a 256x256 PNG icon"; then
    echo "FAIL: the icon warning does not say what to do about it"
    fail=1
elif [ -n "$(find "$ICON_DEST" -name '*.png' 2>/dev/null)" ]; then
    echo "FAIL: an icon was installed although no icon asset exists"
    fail=1
elif [ ! -f "$WS/noicon/dist/RadicalTrainingPlatform-linux-x64.tar.gz" ]; then
    echo "FAIL: a missing icon took the build down with it"
    fail=1
else
    echo "PASS: no icon asset -> the branch warns, names the fix, installs nothing,"
    echo "      and the build still produces its tarball"
fi

# ── K. an icon asset present ────────────────────────────────────────────────
sandbox "$WS/icon"
seed_icon "$WS/icon" "$ICON_ASSET"
OUT="$(run_build "$WS/icon")"
STATUS=$?
INSTALLED="$WS/icon/AppDir/usr/share/icons/hicolor/256x256/apps/${APP_ID}.png"
if [ "$STATUS" -ne 0 ]; then
    echo "FAIL: the build failed with an icon asset present"
    echo "$OUT" | tail -20 | sed 's/^/      /'
    fail=1
elif [ ! -f "$INSTALLED" ]; then
    echo "FAIL: the icon asset was not installed into the AppDir"
    fail=1
elif ! cmp -s "$WS/icon/$ICON_ASSET" "$INSTALLED"; then
    echo "FAIL: the installed icon is not the asset it was copied from"
    fail=1
elif echo "$OUT" | grep -q "No icon found"; then
    echo "FAIL: the icon branch warned although it found and installed the icon"
    fail=1
else
    echo "PASS: an icon asset is installed at the hicolor path and the branch stays"
    echo "      quiet"
fi

# ---------------------------------------------------------------------------
# L/M. The macOS script's diagnostic branches (S47-09/T-45, R-24).
#
# This is the first fixture that executes packaging/macos/build-dmg.sh at all.
# It runs under the same controlled PATH as the AppImage build, with `ditto`
# stubbed (macOS-only) and create-dmg deliberately absent, so the script's
# fallback, its summary line and its recorded manifest are all exercised. What
# it still cannot prove is that the bundle runs on macOS — see the S47-07 row.
# ---------------------------------------------------------------------------

# ── L. no icon, no create-dmg — the .zip fallback ───────────────────────────
sandbox "$WS/macos-noicon"
OUT="$(run_macos_build "$WS/macos-noicon")"
STATUS=$?
MACOS_ZIP="$WS/macos-noicon/dist/RadicalTrainingPlatform-macos.zip"
if [ "$STATUS" -ne 0 ]; then
    echo "FAIL: the macOS build failed on its create-dmg-absent fallback path"
    echo "$OUT" | tail -20 | sed 's/^/      /'
    fail=1
elif ! echo "$OUT" | grep -q "no .icns found"; then
    echo "FAIL: the macOS icon branch did not warn that no icon was found"
    fail=1
elif [ -f "$WS/macos-noicon/dist/RadicalTrainingPlatform.dmg" ]; then
    echo "FAIL: a .dmg exists although create-dmg is not available"
    fail=1
elif ! echo "$OUT" | grep -q "Build complete (zip only)"; then
    echo "FAIL: the macOS build did not say what it actually produced"
    fail=1
elif echo "$OUT" | grep -q "Build complete: "; then
    echo "FAIL: the macOS build claimed a .dmg it did not produce"
    fail=1
elif [ ! -f "$MACOS_ZIP" ]; then
    echo "FAIL: no .zip fallback was produced"
    fail=1
elif ! python3 -c '
import json, sys
d = json.load(open(sys.argv[1]))
sys.exit(0 if d["dmgProduced"] is False and d["artifacts"][0].endswith(".zip") else 1)
' "$WS/macos-noicon/dist/build-manifest.json"; then
    echo "FAIL: the recorded build manifest does not match what was produced"
    fail=1
else
    echo "PASS: no create-dmg -> the .zip fallback is produced, the summary says"
    echo "      'zip only', no .dmg is claimed, and the recorded manifest agrees"
    echo "      (PKG-03)"
fi

# ── M. an icon asset present ────────────────────────────────────────────────
sandbox "$WS/macos-icon"
seed_icon "$WS/macos-icon" "$ICNS_ASSET"
OUT="$(run_macos_build "$WS/macos-icon")"
STATUS=$?
ICNS_INSTALLED="$WS/macos-icon/RadicalTrainingPlatform.app/Contents/Resources/RadicalTrainingPlatform.icns"
if [ "$STATUS" -ne 0 ]; then
    echo "FAIL: the macOS build failed with an icon asset present"
    echo "$OUT" | tail -20 | sed 's/^/      /'
    fail=1
elif [ ! -f "$ICNS_INSTALLED" ]; then
    echo "FAIL: the .icns was not installed into the bundle's Resources"
    fail=1
elif ! cmp -s "$WS/macos-icon/$ICNS_ASSET" "$ICNS_INSTALLED"; then
    echo "FAIL: the installed .icns is not the asset it was copied from"
    fail=1
elif echo "$OUT" | grep -q "no .icns found"; then
    echo "FAIL: the macOS icon branch warned although it installed the icon"
    fail=1
else
    echo "PASS: an .icns asset lands in the bundle's Resources and the branch stays"
    echo "      quiet"
fi

exit $fail
