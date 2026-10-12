#!/usr/bin/env bash
# T-34/REQ-NCA-04 fixtures for scripts/check-nca-cheatsheet.py.
# Failing fixtures: the stale claim, and a half-fix that deletes the claim
# without stating the correction or citing the errata, must both FAIL.
# Passing fixture: the corrected claim plus the errata ID must PASS.
set -u
cd "$(dirname "$0")/../.."

fail=0

python3 scripts/check-nca-cheatsheet.py --root tests/gates/fixtures/cheatsheet-check/bad >/dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "FAIL: stale-claim fixture passed the gate (gate accepted the contradiction)"
    fail=1
else
    echo "PASS: stale-claim fixture failed the gate as required"
fi

python3 scripts/check-nca-cheatsheet.py --root tests/gates/fixtures/cheatsheet-check/half-fix >/dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "FAIL: half-fix fixture passed the gate (deleting the claim is not correcting it)"
    fail=1
else
    echo "PASS: half-fix fixture failed the gate as required"
fi

python3 scripts/check-nca-cheatsheet.py --root tests/gates/fixtures/cheatsheet-check/good >/dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "PASS: corrected fixture passed the gate"
else
    echo "FAIL: corrected fixture failed the gate"
    fail=1
fi

# Real tree: the shipped cheatsheet must carry the correction.
python3 scripts/check-nca-cheatsheet.py >/dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "PASS: repo cheatsheet passed the gate"
else
    echo "FAIL: repo cheatsheet failed the gate"
    fail=1
fi

exit $fail
