#!/usr/bin/env bash
# TM-75 / S48-08 fixtures for scripts/check-traceability.py.
#
# The gate has two clauses, so the fixtures cover each in both directions
# against a real copy of the repository's own openspec documents and chain —
# not only against the synthetic trees in the script's --self-test:
#
#   passing — the shipped tree: every declared requirement maps to a TM row,
#             every fixture runner is wired or excluded with a reason.
#   failing — a copy with a TM row deleted must FAIL naming that requirement.
#             a copy with a gate line deleted must FAIL naming that runner.
#             a copy with the exclusion comment deleted must FAIL naming the
#             rehearsal runner.
#             a copy with an exclusion naming a nonexistent runner must FAIL as
#             a stale exclusion.
#
# Each case runs against a throwaway copy, so the repository tree is never
# mutated by this script.
set -u
cd "$(dirname "$0")/../.."

fail=0
GATE="scripts/check-traceability.py"
CHAIN="tests/gates/run_freeze_chain.sh"

# build_tree <dir> — the openspec documents + the chain, at the paths the gate
# reads them from.
build_tree() {
    local dir="$1"
    rm -rf "$dir"
    mkdir -p "$dir/docs/sprints/openspec" "$dir/tests/gates"
    cp docs/sprints/openspec/SPEC-*.md "$dir/docs/sprints/openspec/"
    cp "$CHAIN" "$dir/tests/gates/"
    # The gate compares the chain against the runners that actually exist, so
    # the copy needs them: without this every exclusion reads as stale.
    find tests/gates -maxdepth 1 -type f \( -name '*.sh' -o -name '*.py' \) \
        -exec cp {} "$dir/tests/gates/" \;
}

# expect_fail <label> <dir> <needle> — the gate must reject this tree, and the
# failure must name the thing the case broke (not fail for an unrelated reason).
expect_fail() {
    local label="$1" dir="$2" needle="$3"
    local log
    log="$(mktemp)"
    if python3 "$GATE" --root "$dir" >"$log" 2>&1; then
        echo "FAIL: $label passed the gate (the gate cannot detect it)"
        fail=1
    elif grep -qF "$needle" "$log"; then
        echo "PASS: $label failed the gate, naming '$needle'"
    else
        echo "FAIL: $label failed, but not for the broken thing — no '$needle'"
        sed -n '1,12p' "$log"
        fail=1
    fi
    rm -f "$log"
}

# expect_pass <label> <dir>
expect_pass() {
    local label="$1" dir="$2"
    if python3 "$GATE" --root "$dir" >/dev/null 2>&1; then
        echo "PASS: $label passed the gate"
    else
        echo "FAIL: $label failed the gate"
        python3 "$GATE" --root "$dir" | head -12
        fail=1
    fi
}

WS="$(mktemp -d)"
trap 'rm -rf "$WS"' EXIT

# A. the unmodified copy is the passing fixture
build_tree "$WS/clean"
expect_pass "unmodified repository documents" "$WS/clean"

# B. a requirement loses its TM row
build_tree "$WS/unmapped"
python3 - "$WS/unmapped/docs/sprints/openspec/SPEC-12-test-matrix.md" <<'PY'
import pathlib, sys
p = pathlib.Path(sys.argv[1])
lines = [l for l in p.read_text().splitlines()
         if not l.startswith("| TM-96 ")]
p.write_text("\n".join(lines) + "\n")
PY
expect_fail "requirement with no TM row" "$WS/unmapped" "REQ-AP-06"

# C. a fixture runner loses its chain entry
build_tree "$WS/unwired"
sed -i '/run_content_bundle_fixtures.sh/d' "$WS/unwired/$CHAIN"
expect_fail "fixture runner absent from the chain" "$WS/unwired" \
    "run_content_bundle_fixtures.sh"

# D. the exclusion comment is removed, so the rehearsal runner is neither wired
#    nor declared
build_tree "$WS/no-exclusion"
sed -i '/chain-excluded: tests\/gates\/run_rehearsal_fixtures.sh/d' \
    "$WS/no-exclusion/$CHAIN"
expect_fail "exclusion removed" "$WS/no-exclusion" \
    "run_rehearsal_fixtures.sh"

# E. an exclusion names a runner that does not exist
build_tree "$WS/stale"
printf '# chain-excluded: tests/gates/run_gone_fixtures.sh — removed long ago\n' \
    >> "$WS/stale/$CHAIN"
expect_fail "stale exclusion" "$WS/stale" "stale exclusion"

# Live: the repository tree itself must be clean
if python3 "$GATE" >/dev/null 2>&1; then
    echo "PASS: repository traceability index and runner register are complete (TM-75)"
else
    echo "FAIL: repository traceability check failed"
    python3 "$GATE" | head -20
    fail=1
fi

exit $fail
