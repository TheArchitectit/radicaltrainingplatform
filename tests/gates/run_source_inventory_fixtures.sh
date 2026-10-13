#!/usr/bin/env bash
# C-09 / T-31a fixtures for scripts/check-source-inventory.py.
#
# Failing fixtures — each is a way a PDF inventory can lie, and each must FAIL:
#   bad-hash                 the file was replaced and kept its old hash
#   unlisted                 a PDF in the tree with no row
#   placeholder-rights       a "review later" rights cell (SPEC-14 forbids it)
#   pointer-claimed-present  a manual recorded in-repo that is pointer text
# Passing fixture: one row whose hash, size, presence and rights all match.
set -u
cd "$(dirname "$0")/../.."

fail=0
FIXTURES="tests/gates/fixtures/source-inventory"

check() {
    local case="$1" expected="$2" why="$3"
    if python3 scripts/check-source-inventory.py --root "$FIXTURES/$case" >/dev/null 2>&1; then
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

check bad-hash                fail "a stale hash is not a record"
check unlisted                fail "an unlisted PDF is an unrecorded artifact"
check placeholder-rights      fail "TBD is not a rights status"
check pointer-claimed-present fail "pointer text is not a manual in the repository"
check good                    pass "a consistent row passes"

# Real tree: the shipped inventory must match the shipped PDFs.
if python3 scripts/check-source-inventory.py >/dev/null 2>&1; then
    echo "PASS: repo source inventory matches the tree"
else
    echo "FAIL: repo source inventory does not match the tree"
    fail=1
fi

exit $fail
