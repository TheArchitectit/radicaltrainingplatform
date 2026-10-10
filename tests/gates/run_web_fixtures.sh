#!/usr/bin/env bash
# R-22 fixtures for the web runtime (RadicalTrainingPlatform.Web/js).
# Each fixture under tests/gates/web/ must PASS against the current code.
# Self-test fixture (_selftest-fails.mjs) MUST fail, so a runner that
# cannot detect failures cannot report green.
set -u
cd "$(dirname "$0")/../.."

fail=0

node tests/gates/web/_selftest-fails.mjs >/dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "FAIL: self-test fixture passed the runner (harness cannot detect failures)"
    fail=1
else
    echo "PASS: self-test fixture failed the runner as required"
fi

for fixture in tests/gates/web/*.mjs; do
    name="$(basename "$fixture")"
    case "$name" in
        helpers.mjs|_selftest-fails.mjs) continue ;;
    esac
    if node "$fixture" >/dev/null 2>&1; then
        echo "PASS: $name"
    else
        echo "FAIL: $name"
        fail=1
    fi
done

exit $fail
