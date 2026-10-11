#!/usr/bin/env bash
# T-11/REQ-BRAND-01 fixtures for scripts/check-brand.py.
# Failing fixture: endorsement phrasing ("official", "certified by", mark
# asset) must FAIL. Passing fixture: nominative phrasing plus the exact
# REQ-BRAND-02 disclaimer must PASS (disclaimer masking works, and the
# exempt manifest token officialVersion does not trip the gate).
set -u
cd "$(dirname "$0")/../.."

fail=0

python3 scripts/check-brand.py --root tests/gates/fixtures/brand-check/bad >/dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "FAIL: endorsement fixture passed the gate (gate accepted forbidden strings)"
    fail=1
else
    echo "PASS: endorsement fixture failed the gate as required"
fi

python3 scripts/check-brand.py --root tests/gates/fixtures/brand-check/good >/dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "PASS: nominative fixture passed the gate"
else
    echo "FAIL: nominative fixture failed the gate"
    fail=1
fi

# Real tree: the gate must pass on the current repo (disclaimers present and
# masked, no paraphrased endorsement prose).
python3 scripts/check-brand.py >/dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "PASS: repo tree passed the gate"
else
    echo "FAIL: repo tree failed the gate"
    fail=1
fi

exit $fail
