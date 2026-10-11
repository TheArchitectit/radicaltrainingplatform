#!/usr/bin/env bash
# REQ-SC-01 fixture chain: the bad fixture (constant-true validator) must
# FAIL the scan, the good fixture (state-based validators) must PASS, and
# the live repo tree must PASS.
set -u
cd "$(dirname "$0")/../.."

fail=0

python3 scripts/scan-scenario-validators.py tests/gates/fixtures/validator-scan/bad >/dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "FAIL: constant-true fixture passed the scan (scanner cannot detect the defect)"
    fail=1
else
    echo "PASS: constant-true fixture failed the scan as required"
fi

python3 scripts/scan-scenario-validators.py tests/gates/fixtures/validator-scan/good >/dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "PASS: state-based fixture passed the scan"
else
    echo "FAIL: state-based fixture failed the scan"
    fail=1
fi

python3 scripts/scan-scenario-validators.py >/dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "PASS: repo scenario registries clean (REQ-SC-01 armed, T-14/S46-04)"
else
    echo "FAIL: repo scenario registries failed the scan (REQ-SC-01)"
    fail=1
fi

exit $fail
