#!/usr/bin/env bash
# CI-03 / T-22 fixtures for scripts/check-content-bundle.py.
#
# Failing fixtures (each must FAIL the gate):
#   A. missing pack asset      — a released bank is absent from the tree
#   B. stale bundle            — a released asset changed without regenerating
#   C. review-state dishonesty — provenance claims 'reviewed' with no reviewDate
#   D. unreviewed corpus ships — the bundle drops a bank its items still come from
# Passing fixture:
#   E. untouched workspace     — must PASS
# Live:
#   the repository tree itself must PASS
#
# Each case runs against a throwaway copy of content/ + the compiled module, so
# the repository tree is never mutated by this script.
set -u
cd "$(dirname "$0")/../.."

fail=0
GATE="scripts/check-content-bundle.py"

# build_workspace <dir> — content/ + the compiled module + the bundle manifest
build_workspace() {
    local dir="$1"
    rm -rf "$dir"
    mkdir -p "$dir/RadicalTrainingPlatform.Web/js"
    cp -r content "$dir/content"
    cp RadicalTrainingPlatform.Web/js/study-content.js "$dir/RadicalTrainingPlatform.Web/js/"
    cp RadicalTrainingPlatform.Web/content-bundle.json "$dir/RadicalTrainingPlatform.Web/"
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
        fail=1
    fi
}

WS="$(mktemp -d)"
trap 'rm -rf "$WS"' EXIT

BANK="content/exams/COMPTIA-NET-009/questions/net009-n3-fixtures.md"
PROV="content/provenance/COMPTIA-A-1201/Q1.json"

# E. the untouched workspace is the passing fixture
build_workspace "$WS/clean"
expect_pass "untouched fixture workspace" "$WS/clean"

# A. a released pack asset is missing
build_workspace "$WS/missing"
rm "$WS/missing/$BANK"
expect_fail "missing pack asset" "$WS/missing"

# B. a released asset changed without the bundle being regenerated
build_workspace "$WS/stale"
printf '\n<!-- edited after the bundle was written -->\n' >> "$WS/stale/$BANK"
expect_fail "stale bundle (asset changed, hash no longer matches)" "$WS/stale"

# C. provenance claims a review state the bundle cannot back
build_workspace "$WS/dishonest"
python3 - "$WS/dishonest/$PROV" <<'PY'
import json, pathlib, sys
p = pathlib.Path(sys.argv[1])
d = json.loads(p.read_text())
d["status"] = "reviewed"
p.write_text(json.dumps(d, indent=2))
PY
# Regenerate in the workspace so the hashes agree and only the review state is wrong.
python3 "$GATE" --root "$WS/dishonest" --write >/dev/null 2>&1
expect_fail "review-state dishonesty (reviewed with no reviewDate)" "$WS/dishonest"

# D. the bundle stops naming a bank whose items still ship
build_workspace "$WS/unreviewed"
python3 - "$WS/unreviewed/RadicalTrainingPlatform.Web/content-bundle.json" <<'PY'
import json, pathlib, sys
p = pathlib.Path(sys.argv[1])
b = json.loads(p.read_text())
b["exams"]["COMPTIA-NET-009"]["banks"] = [
    x for x in b["exams"]["COMPTIA-NET-009"]["banks"]
    if x["bank"] != "net009-n3-fixtures.md"
]
p.write_text(json.dumps(b, indent=2))
PY
expect_fail "unreviewed corpus ships (items from an unnamed bank)" "$WS/unreviewed"

# Live: the repository tree must be clean
if python3 "$GATE" >/dev/null 2>&1; then
    echo "PASS: repository content bundle is present and hash-matched (CI-03)"
else
    echo "FAIL: repository content bundle check failed"
    fail=1
fi

exit $fail
