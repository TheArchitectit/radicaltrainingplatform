#!/usr/bin/env bash
# R-19 docs-truth fixtures for scripts/check-release-links.py (S47-08 / T-41).
#
# R-19's acceptance names this deliverable directly: "a docs-truth fixture
# asserting no link to a nonexistent release". With no tags and no releases in
# this repository, every releases link and every named bundle artifact is a
# promise nothing can keep.
#
# Failing fixture: tests/gates/fixtures/release-links/bad — a foreign releases
#   page, a named artifact that is not in the tree, and a Git LFS claim with no
#   .gitattributes. Must FAIL.
# Passing fixture: tests/gates/fixtures/release-links/good — the same subjects
#   (releases, tags, artifacts, Git LFS) stated honestly. Must PASS, so the gate
#   cannot become a prohibition on ever mentioning a download.
# Live assertion: the repository as it stands. Must PASS.
#
# The tag-dependent half of the gate — a releases link is rejected while no tag
# exists and accepted once one does — needs a throwaway git repository, so it
# lives in the checker's --self-test rather than here.
set -u
cd "$(dirname "$0")/../.."

fail=0
FIXTURES="tests/gates/fixtures/release-links"

# A must-fail fixture can pass for the wrong reason (a usage error, a missing
# path). This one is required to fail AND to say why.
bad_out="$(python3 scripts/check-release-links.py --root "$FIXTURES/bad" 2>&1)"
if [ $? -eq 0 ]; then
    echo "FAIL: the dead-download fixture passed the gate (the gate cannot detect it)"
    fail=1
elif ! echo "$bad_out" | grep -q "rogerlundnetcenter/nutanixcertificationtool"; then
    echo "FAIL: the dead-download fixture failed, but not for the dead link it seeds"
    fail=1
elif ! echo "$bad_out" | grep -q "AppImage"; then
    echo "FAIL: the dead-download fixture failed, but not for the artifact it seeds"
    fail=1
else
    echo "PASS: dead releases link, absent artifact and bare Git LFS claim all failed"
    echo "      the gate, each with the reason it exists to give"
fi

if python3 scripts/check-release-links.py --root "$FIXTURES/good" >/dev/null 2>&1; then
    echo "PASS: the honest fixture passed the gate"
else
    echo "FAIL: the honest fixture failed the gate — it is punishing the fix"
    python3 scripts/check-release-links.py --root "$FIXTURES/good" 2>&1 | sed 's/^/      /'
    fail=1
fi

if python3 scripts/check-release-links.py >/dev/null 2>&1; then
    echo "PASS: the repository tree passed the gate"
else
    echo "FAIL: the repository tree failed the gate"
    python3 scripts/check-release-links.py 2>&1 | sed 's/^/      /'
    fail=1
fi

if python3 scripts/check-release-links.py --self-test >/dev/null 2>&1; then
    echo "PASS: check-release-links self-test (4 seeded defects, 4 honest sentences,"
    echo "      and the gate lifted once a tag existed)"
else
    echo "FAIL: check-release-links self-test"
    python3 scripts/check-release-links.py --self-test 2>&1 | sed 's/^/      /'
    fail=1
fi

exit $fail
