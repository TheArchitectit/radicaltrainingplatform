#!/usr/bin/env bash
# T-34/REQ-NCA-04 + SPEC-18 fixtures for scripts/check-nca-cheatsheet.py.
#
# Failing fixtures:
#   bad        — the stale claim, and a half-fix that deletes the claim without
#                stating the correction or citing the errata.
#   beta-frame — the SPEC-18 defect: a corrected sheet whose heading still
#                labels the exam beta, and which reproduces the expired code.
#   bare-history — deleting the dated history section along with the framing.
#
# Passing fixture: the corrected claim, the errata ID, no beta heading, no
# expired code, and the dated history kept.
set -u
cd "$(dirname "$0")/../.."

fail=0
ROOT="tests/gates/fixtures/cheatsheet-check"

expect_fail() {
    local name="$1"
    python3 scripts/check-nca-cheatsheet.py --root "$ROOT/$name" >/dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "FAIL: $name fixture passed the gate"
        fail=1
    else
        echo "PASS: $name fixture failed the gate as required"
    fi
}

expect_fail bad
expect_fail half-fix
expect_fail beta-frame
expect_fail bare-history

if python3 scripts/check-nca-cheatsheet.py --root "$ROOT/good" >/dev/null 2>&1; then
    echo "PASS: corrected fixture passed the gate"
else
    echo "FAIL: corrected fixture failed the gate"
    fail=1
fi

# Real tree: the shipped cheatsheet must carry the correction.
if python3 scripts/check-nca-cheatsheet.py >/dev/null 2>&1; then
    echo "PASS: repo cheatsheet passed the gate"
else
    echo "FAIL: repo cheatsheet failed the gate"
    fail=1
fi

exit $fail
