#!/usr/bin/env bash
# T-46 fixture suite for scripts/redeye-lane.py + scripts/redeye-gate.py.
# The seeded-defect self-test must catch every seed (REQ-REV-03) and the
# ship-gate must fail closed with named exclusions (REQ-REV-02/05).
set -u
cd "$(dirname "$0")/../.."

fail=0

python3 tests/gates/redeye/self_test.py >/dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "PASS: seeded-defect self-test caught every seed; gate fail-closed"
else
    echo "FAIL: seeded-defect self-test — run: python3 tests/gates/redeye/self_test.py"
    fail=1
fi

python3 scripts/redeye-lane.py --self-test >/dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "PASS: lane self-test (in-module fixtures)"
else
    echo "FAIL: lane self-test"
    fail=1
fi

python3 scripts/redeye-gate.py --self-test >/dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "PASS: gate self-test (fail-closed fixture matrix)"
else
    echo "FAIL: gate self-test"
    fail=1
fi

exit $fail
