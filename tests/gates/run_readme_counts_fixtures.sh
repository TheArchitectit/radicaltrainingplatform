#!/usr/bin/env bash
# R-12 / T-25b fixtures for scripts/check-readme-counts.py.
#
# Failing fixtures — each is a way the README can disagree with the generated
# counts, and each must FAIL:
#   bad-total     the table's released-item total drifted
#   bad-badge     the table is right and the badge is stale (two places, one number)
#   missing-exam  an exam ships and the README never mentions it
#   bad-state     the README advertises a release state the bundle is not in
# Passing fixture: a README whose every number matches the manifest.
set -u
cd "$(dirname "$0")/../.."

fail=0
FIXTURES="tests/gates/fixtures/readme-counts"

check() {
    local case="$1" expected="$2" why="$3"
    if python3 scripts/check-readme-counts.py --root "$FIXTURES/$case" >/dev/null 2>&1; then
        actual=pass
    else
        actual=fail
    fi
    if [ "$actual" = "$expected" ]; then
        echo "PASS: $case $actual as required ($why)"
    else
        echo "FAIL: $case $actual, expected $expected ($why)"
        fail=1
    fi
}

check bad-total    fail "a drifted total is not a match"
check bad-badge    fail "the badge is the same number in a second place"
check missing-exam fail "an unmentioned exam is an unstated count"
check bad-state    fail "a release state the bundle is not in is a false claim"
check good         pass "a README that matches the manifest passes"

# Real tree: the shipped README must match the generated manifest.
if python3 scripts/check-readme-counts.py >/dev/null 2>&1; then
    echo "PASS: repo README counts match the generated manifest"
else
    echo "FAIL: repo README counts do not match the generated manifest"
    fail=1
fi

exit $fail
