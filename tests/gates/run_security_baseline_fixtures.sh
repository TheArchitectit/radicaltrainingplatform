#!/usr/bin/env bash
# Security baseline fixtures for scripts/check-security-baseline.py (S41-42).
#
# Failing fixtures — each seeds one way the baseline can be false, and each
# must FAIL *and name the defect*:
#   A. the CSP meta tag is gone                          — nothing is enforced
#   B. script-src admits 'unsafe-inline'                 — the policy is decorative
#   C. connect-src admits a remote host                  — a local client, but not local
#   D. a view ships an inline event handler              — a control that does nothing
#   E. the shell carries an inline <script> block        — blocked at runtime
#   F. a dependency is added without regenerating the SBOM — drift
#   G. the SBOM names a component the tree lacks         — the reverse lie
#   H. a workflow uploads a Pages artifact               — public distribution
#   I. the CodeQL workflow is deleted                    — no hosted analysis
#   J. CodeQL stops analysing a language that ships here — a blind spot
#
# Passing fixtures:
#   K. the repository tree as it stands
#   L. a clean sandbox copy
#
# The sandbox is the web tree, the SBOM, every csproj (the SBOM check reads
# them) and the workflows directory. Mutations are seeded into throwaway copies,
# so the repository is never touched.
set -u
cd "$(dirname "$0")/../.."

fail=0
REPO="$PWD"
GATE=(python3 scripts/check-security-baseline.py)

WS="$(mktemp -d)"
trap 'rm -rf "$WS"' EXIT

# sandbox <dir> — the files the gate reads, at their real relative paths.
sandbox() {
    local dir="$1" rel
    rm -rf "$dir"
    mkdir -p "$dir/docs/security" "$dir/.github/workflows"
    cp -r "$REPO/RadicalTrainingPlatform.Web" "$dir/"
    cp "$REPO/docs/security/sbom.cdx.json" "$dir/docs/security/"
    cp "$REPO"/.github/workflows/*.yml "$dir/.github/workflows/"
    while IFS= read -r file; do
        rel="${file#"$REPO"/}"
        mkdir -p "$dir/$(dirname "$rel")"
        cp "$file" "$dir/$rel"
    done < <(find "$REPO" -name '*.csproj' -not -path '*/bin/*' -not -path '*/obj/*')
}

# seed <file> <old> <new> — apply one literal replacement, in place.
# A stale anchor is a broken fixture, not a passing one.
seed() {
    if ! python3 - "$1" "$2" "$3" <<'PY'
import pathlib, sys
path, old, new = pathlib.Path(sys.argv[1]), sys.argv[2], sys.argv[3]
text = path.read_text(encoding="utf-8")
if old not in text:
    sys.exit(f"anchor not found in {path}: {old!r}")
path.write_text(text.replace(old, new, 1), encoding="utf-8")
PY
    then
        echo "FAIL: a fixture anchor is stale — the fixture proves nothing"
        fail=1
    fi
}

expect_pass() {
    local label="$1" root="$2"
    if "${GATE[@]}" --root "$root" >/dev/null 2>&1; then
        echo "PASS: $label passes the gate"
    else
        echo "FAIL: $label failed the gate"
        "${GATE[@]}" --root "$root" 2>&1 | sed 's/^/      /'
        fail=1
    fi
}

must_fail() {
    local label="$1" needle="$2" root="$3" out
    if out="$("${GATE[@]}" --root "$root" 2>&1)"; then
        echo "FAIL: $label passed the gate (the gate cannot detect it)"
        fail=1
    elif ! printf '%s' "$out" | grep -qF -- "$needle"; then
        echo "FAIL: $label failed, but not for the stated reason"
        echo "      wanted the gate to say: $needle"
        printf '%s\n' "$out" | sed 's/^/      /'
        fail=1
    else
        echo "PASS: $label fails the gate and names the defect"
    fi
}

# ── K. the tree as it stands ────────────────────────────────────────────────
expect_pass "the repository tree holds the baseline" "$REPO"

# ── L. a clean sandbox ──────────────────────────────────────────────────────
sandbox "$WS/clean"
expect_pass "a clean copy of the tree" "$WS/clean"

# ── A. the CSP meta tag is gone ─────────────────────────────────────────────
sandbox "$WS/nocsp"
seed "$WS/nocsp/RadicalTrainingPlatform.Web/index.html" \
    'http-equiv="Content-Security-Policy"' 'http-equiv="X-No-Policy"'
must_fail "the shell has no CSP" \
    "has no Content-Security-Policy meta tag" "$WS/nocsp"

# ── B. script-src admits inline script ──────────────────────────────────────
sandbox "$WS/inline"
seed "$WS/inline/RadicalTrainingPlatform.Web/index.html" \
    "script-src 'self';" "script-src 'self' 'unsafe-inline';"
must_fail "script-src admits a whole inline policy" \
    "script-src allows 'unsafe-inline'" "$WS/inline"

# ── C. connect-src admits a remote host ─────────────────────────────────────
sandbox "$WS/remote"
seed "$WS/remote/RadicalTrainingPlatform.Web/index.html" \
    "connect-src 'self' http://127.0.0.1:* http://localhost:*;" \
    "connect-src 'self' https://api.example.com;"
must_fail "connect-src admits a remote host" \
    "is not a loopback origin" "$WS/remote"

# ── D. a view ships an inline event handler ─────────────────────────────────
sandbox "$WS/handler"
seed "$WS/handler/RadicalTrainingPlatform.Web/js/views/pc-alerts.js" \
    'type="button" data-simulated-alert="SNMP config saved' \
    'type="button" onclick="x()" data-simulated-alert="SNMP config saved'
must_fail "a view ships an inline event handler" \
    "inline event handler" "$WS/handler"

# ── E. the shell carries an inline script block ─────────────────────────────
sandbox "$WS/script"
seed "$WS/script/RadicalTrainingPlatform.Web/index.html" \
    '<script type="module" src="js/app.js"></script>' \
    '<script>alert(1)</script>'
must_fail "the shell carries an inline script block" \
    "inline <script> block" "$WS/script"

# ── F. a dependency arrives without the SBOM ────────────────────────────────
sandbox "$WS/drift"
seed "$WS/drift/RadicalTrainingPlatform.Core/RadicalTrainingPlatform.Core.csproj" \
    "</Project>" \
    '  <ItemGroup><PackageReference Include="Fixture.New" Version="1.0.0" /></ItemGroup>
</Project>'
must_fail "a dependency is added without regenerating the SBOM" \
    "absent from the SBOM" "$WS/drift"

# ── G. the SBOM names a component the tree lacks ────────────────────────────
sandbox "$WS/ghost"
# Retarget a real component's bom-ref rather than inserting a new object: the
# anchor must be inside the top-level components array, not the tool metadata.
seed "$WS/ghost/docs/security/sbom.cdx.json" \
    '"bom-ref": "pkg:nuget/Avalonia.Desktop@12.1.3"' \
    '"bom-ref": "pkg:nuget/Ghost@1.0.0"'
must_fail "the SBOM names a component the tree lacks" \
    "nothing in the tree references it" "$WS/ghost"

# ── H. a workflow uploads a Pages artifact ──────────────────────────────────
sandbox "$WS/publish"
cat > "$WS/publish/.github/workflows/publish.yml" <<'YAML'
name: Publish
on: [push]
jobs:
  ship:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/upload-pages-artifact@v5
YAML
must_fail "a workflow uploads a Pages artifact" \
    "publishes the web tree" "$WS/publish"

# ── I. the CodeQL workflow is deleted ───────────────────────────────────────
sandbox "$WS/nocodeql"
rm "$WS/nocodeql/.github/workflows/codeql.yml"
must_fail "the CodeQL workflow is deleted" \
    "no workflow runs CodeQL" "$WS/nocodeql"

# ── J. CodeQL stops analysing a language that ships here ────────────────────
sandbox "$WS/lang"
seed "$WS/lang/.github/workflows/codeql.yml" \
    "language: [csharp, javascript-typescript]" "language: [csharp]"
must_fail "CodeQL stops analysing JavaScript" \
    "does not analyse 'javascript-typescript'" "$WS/lang"

# ── the checker's own seeded defects ────────────────────────────────────────
if "${GATE[@]}" --self-test >/dev/null 2>&1; then
    echo "PASS: check-security-baseline self-test (14 seeded defects caught)"
else
    echo "FAIL: check-security-baseline self-test"
    "${GATE[@]}" --self-test 2>&1 | sed 's/^/      /'
    fail=1
fi

exit $fail
