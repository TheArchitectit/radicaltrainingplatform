#!/usr/bin/env bash
# TM-64 / REQ-AI-04 fixtures for scripts/check-artifact-secrets.py.
#
# Failing fixtures (each must FAIL the gate):
#   A. key in a JS module   — a provider key pasted into the tutor client
#   B. key in a JSON asset  — a key in a data file the PWA fetches
#   C. key in a hidden file — a .env the deploy step would have copied
#   D. config holds a value — the gateway config stores material, not a reference
# Passing fixtures:
#   E. untouched workspace  — must PASS
#   F. the reviewed exemptions — the three allowlisted lines stay allowed
# Live:
#   the repository tree itself must PASS
#
# Each case runs against a throwaway copy of the artifact, so the repository
# tree is never mutated by this script.
set -u
cd "$(dirname "$0")/../.."

fail=0
GATE="scripts/check-artifact-secrets.py"

# build_workspace <dir> — the built artifact + the gateway configs
build_workspace() {
    local dir="$1"
    rm -rf "$dir"
    mkdir -p "$dir/services/ai-gateway"
    cp -r RadicalTrainingPlatform.Web "$dir/RadicalTrainingPlatform.Web"
    cp services/ai-gateway/config.example.json "$dir/services/ai-gateway/" 2>/dev/null || true
    if [ -f services/ai-gateway/config.json ]; then
        cp services/ai-gateway/config.json "$dir/services/ai-gateway/"
    fi
}

# expect_fail <label> <dir> — the gate must reject this workspace
expect_fail() {
    local label="$1" dir="$2"
    if python3 "$GATE" --root "$dir" >/dev/null 2>&1; then
        echo "FAIL: $label passed the gate (the gate cannot detect it)"
        fail=1
    else
        echo "PASS: $label failed the gate as required"
    fi
}

# expect_pass <label> <dir> — the gate must accept this workspace
expect_pass() {
    local label="$1" dir="$2"
    if python3 "$GATE" --root "$dir" >/dev/null 2>&1; then
        echo "PASS: $label passed the gate"
    else
        echo "FAIL: $label failed the gate"
        python3 "$GATE" --root "$dir" 2>&1 | sed 's/^/      /'
        fail=1
    fi
}

WS="$(mktemp -d)"
trap 'rm -rf "$WS"' EXIT

TUTOR="RadicalTrainingPlatform.Web/js/core/TutorClient.js"
CONFIG="services/ai-gateway/config.example.json"

# E. the untouched workspace is the passing fixture
build_workspace "$WS/clean"
expect_pass "untouched artifact" "$WS/clean"

# F. the exemption is exact, not a blanket pass on the file: edit the
#    allowlisted line and the gate must flag it again.
build_workspace "$WS/exempt"
if grep -q "nai-prod-key-001" "$WS/exempt/RadicalTrainingPlatform.Web/js/core/StateEngine.js"; then
    sed -i "s/nai-prod-key-001/nai-prod-key-9f3a1c7e42b8d6/; \
            s/nai-dev-key-002/nai-dev-key-7c1e5a93d4f20b/" \
        "$WS/exempt/RadicalTrainingPlatform.Web/js/core/StateEngine.js"
    expect_fail "exemption is exact (edited allowlisted line)" "$WS/exempt"
else
    echo "FAIL: simulator seed line not present — cannot prove the exemption is exact"
    fail=1
fi

# A. a provider key pasted into a JS module the browser loads
build_workspace "$WS/js"
cat >> "$WS/js/$TUTOR" <<'JS'

// debugging leftover
const KEY = "sk-ant-api03-QWxhZGRpbjpvcGVuIHNlc2FtZQ";
JS
expect_fail "provider key pasted into a shipped JS module" "$WS/js"

# B. a key in a JSON data asset
build_workspace "$WS/json"
python3 - "$WS/json/RadicalTrainingPlatform.Web/content-bundle.json" <<'PY'
import json, pathlib, sys
p = pathlib.Path(sys.argv[1])
d = json.loads(p.read_text())
d["tutor"] = {"providerKey": "sk-live-abcdef0123456789abcdef"}
p.write_text(json.dumps(d, indent=2))
PY
expect_fail "provider key in a shipped JSON asset" "$WS/json"

# C. a key in a dotfile the deploy step would copy
build_workspace "$WS/dotenv"
printf 'TUTOR_PROVIDER_KEY=sk-ant-api03-ZGVhZGJlZWZkZWFkYmVlZg\n' \
    > "$WS/dotenv/RadicalTrainingPlatform.Web/.env"
expect_fail "provider key in a dotfile inside the artifact" "$WS/dotenv"

# D. the gateway config carries material instead of a reference
build_workspace "$WS/config"
python3 - "$WS/config/$CONFIG" <<'PY'
import json, pathlib, sys
p = pathlib.Path(sys.argv[1])
d = json.loads(p.read_text())
d["secretRef"] = "sk-ant-api03-YWJjZGVmZ2hpamtsbW5vcA"
p.write_text(json.dumps(d, indent=2))
PY
expect_fail "gateway config holds a secret value, not a reference" "$WS/config"

# Live: the repository tree must be clean
if python3 "$GATE" >/dev/null 2>&1; then
    echo "PASS: repository artifact carries no provider secret material (TM-64)"
else
    echo "FAIL: repository artifact secret scan failed"
    python3 "$GATE" 2>&1 | sed 's/^/      /'
    fail=1
fi

exit $fail
