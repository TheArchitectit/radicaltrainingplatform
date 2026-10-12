#!/usr/bin/env bash
# Fixtures for tests/e2e/nca-lab-web.mjs (T-35 / S48-05, SPEC-07 07.5, REQ-SC-02).
#
# Failing fixture: one NCA objective made constant-true — the exact R-02 /
# REQ-SC-01 defect class this repository has already shipped once (27 of 78
# predicates were literal `() => true`). With obj-1 of nca-maint-01 always
# met, the lab reports a completed objective on a fresh seed, and the browser
# gate must fail on its REQ-SC-02 leg.
#
# The sed is verified to have actually applied before the case is judged: a
# fixture whose injection silently no-ops would report "the gate caught it"
# about a gate that was never shown the defect. If the target line ever moves,
# this fails loudly rather than passing vacuously.
#
# Passing fixture: the same artifact unmodified must PASS. Live: the
# repository's Web tree must PASS.
#
# Both cases run against a throwaway copy of RadicalTrainingPlatform.Web/, so
# the repository tree is never mutated. If no browser is present the gate
# fails closed, which fails the passing fixture too — the environment is
# reported, never silently skipped.
set -u
cd "$(dirname "$0")/../.."

fail=0
GATE="tests/e2e/nca-lab-web.mjs"

WS="$(mktemp -d)"
trap 'rm -rf "$WS"' EXIT

cp -r RadicalTrainingPlatform.Web "$WS/bad"
cp -r RadicalTrainingPlatform.Web "$WS/good"

# R-02 shape: a validator that cannot fail.
TARGET="if (!got.length) return unmet('no maintenance sequence has been built yet');"
BROKEN="$WS/bad/js/views/scenarios.js"
sed -i "0,/$TARGET/s//if (true) return met();/" "$BROKEN"

if grep -q "if (true) return met();" "$BROKEN"; then
    echo "PASS: the constant-true injection applied"
else
    echo "FAIL: the constant-true injection did not apply — the fixture proved nothing"
    fail=1
fi

if NCA_LAB_WEB_ROOT="$WS/bad" node "$GATE" >/dev/null 2>&1; then
    echo "FAIL: an always-met objective passed the lab gate (the gate cannot see REQ-SC-02)"
    fail=1
else
    echo "PASS: an always-met objective failed the lab gate as required"
fi

if NCA_LAB_WEB_ROOT="$WS/good" node "$GATE" >/dev/null 2>&1; then
    echo "PASS: unmodified artifact passed the lab gate"
else
    echo "FAIL: unmodified artifact failed the lab gate (no browser, or the artifact is broken)"
    fail=1
fi

if node "$GATE" >/dev/null 2>&1; then
    echo "PASS: repository Web artifact drives all three NCA labs end to end (T-35)"
else
    echo "FAIL: repository Web artifact failed the lab gate"
    fail=1
fi

exit $fail
