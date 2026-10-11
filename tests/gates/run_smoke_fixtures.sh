#!/usr/bin/env bash
# CI-03 / T-22 fixtures for tests/e2e/smoke-web.mjs.
#
# Failing fixture: a reintroduced R-01-shaped bad import (pe-reports.js
# importing ../components/ConfirmDialog.js) must FAIL the smoke — the module
# graph breaks, the router never renders, and the shell stays silent.
# Passing fixture: the same artifact unmodified must PASS.
# Live: the repository's Web tree must PASS.
#
# Both cases run against a throwaway copy of RadicalTrainingPlatform.Web/, so
# the repository tree is never mutated. If no browser is present the smoke
# fails closed, which fails the passing fixture too — the environment is
# reported, never silently skipped.
set -u
cd "$(dirname "$0")/../.."

fail=0
SMOKE="tests/e2e/smoke-web.mjs"

WS="$(mktemp -d)"
trap 'rm -rf "$WS"' EXIT

cp -r RadicalTrainingPlatform.Web "$WS/bad"
cp -r RadicalTrainingPlatform.Web "$WS/good"

# R-01 shape: the import names a module that does not exist.
sed -i "s#from '../components/Confirm.js'#from '../components/ConfirmDialog.js'#" \
    "$WS/bad/js/views/pe-reports.js"

if SMOKE_WEB_ROOT="$WS/bad" node "$SMOKE" >/dev/null 2>&1; then
    echo "FAIL: broken-import artifact passed the smoke (the smoke cannot detect a dead boot)"
    fail=1
else
    echo "PASS: broken-import artifact failed the smoke as required"
fi

if SMOKE_WEB_ROOT="$WS/good" node "$SMOKE" >/dev/null 2>&1; then
    echo "PASS: unmodified artifact passed the smoke"
else
    echo "FAIL: unmodified artifact failed the smoke (no browser, or the artifact is broken)"
    fail=1
fi

if node "$SMOKE" >/dev/null 2>&1; then
    echo "PASS: repository Web artifact boots and completes the demo interaction (CI-03)"
else
    echo "FAIL: repository Web artifact failed the smoke"
    fail=1
fi

exit $fail
