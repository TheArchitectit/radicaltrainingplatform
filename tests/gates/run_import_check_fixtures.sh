#!/usr/bin/env bash
# TM-73 fixtures for scripts/check-imports.py.
# Failing fixture: a case-mismatched import (Confirmdialog.js vs Confirm.js) must FAIL.
# Passing fixture: the same graph with the correct case must PASS.
set -u
cd "$(dirname "$0")/../.."

fail=0

python3 scripts/check-imports.py --root tests/gates/fixtures/import-check-bad >/dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "FAIL: bad-case fixture passed the gate (gate accepted a broken import)"
    fail=1
else
    echo "PASS: bad-case fixture failed the gate as required"
fi

python3 scripts/check-imports.py --root tests/gates/fixtures/import-check-good >/dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "PASS: good fixture passed the gate"
else
    echo "FAIL: good fixture failed the gate"
    fail=1
fi

exit $fail
