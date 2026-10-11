#!/usr/bin/env bash
# R-05/R-19 Legacy bridge surface fixtures for scripts/check-legacy-bridge.py
# (S47-08 / T-41).
#
# The Legacy WinForms project is net10.0-windows and cannot be built or tested
# on this fleet, so its bridge surface is gated on the source. The desktop
# Avalonia bridge is covered by the tests that do run
# (Desktop.Tests/CefBridgeHandlerTests.cs).
#
# Failing fixture: tests/gates/fixtures/legacy-bridge/bad — a bridge that
#   registers a removed no-effect handler, drops unknown types in silence, keeps
#   no listable surface, and reads "message" with GetProperty; and a JS bundle
#   that calls a type the host never answers. Must FAIL, on each defect.
# Live assertion: the real bridge. Must PASS.
#
# The authoritative fixtures are the checker's own --self-test, which seeds each
# defect onto the real source file rather than onto a copy that can drift.
set -u
cd "$(dirname "$0")/../.."

fail=0
BAD="tests/gates/fixtures/legacy-bridge/bad"

bad_out="$(python3 scripts/check-legacy-bridge.py --root "$BAD" 2>&1)"
if [ $? -eq 0 ]; then
    echo "FAIL: the broken-bridge fixture passed the gate (the gate cannot detect it)"
    fail=1
else
    # Every defect class must be reported, not just the first one hit. A gate
    # that stops at the first finding is a gate that reports one defect per run.
    missing=""
    for want in "does not match the registered handlers" "get_settings" \
                "can only time out" "HandlerTypes" "fallback branch" \
                "does not tolerate a payload"; do
        echo "$bad_out" | grep -q "$want" || missing="$missing; $want"
    done
    if [ -n "$missing" ]; then
        echo "FAIL: the broken-bridge fixture failed, but not on:$missing"
        echo "$bad_out" | sed 's/^/      /'
        fail=1
    else
        echo "PASS: surface drift, a no-effect handler, an unanswerable JS call, an"
        echo "      unlistable surface, a silent unknown type and a throwing log"
        echo "      handler were each reported"
    fi
fi

if python3 scripts/check-legacy-bridge.py >/dev/null 2>&1; then
    echo "PASS: the repository's Legacy bridge passed the gate"
else
    echo "FAIL: the repository's Legacy bridge failed the gate"
    python3 scripts/check-legacy-bridge.py 2>&1 | sed 's/^/      /'
    fail=1
fi

if python3 scripts/check-legacy-bridge.py --self-test >/dev/null 2>&1; then
    echo "PASS: check-legacy-bridge self-test (6 seeded defects caught on the real"
    echo "      source, and the clean bridge passed)"
else
    echo "FAIL: check-legacy-bridge self-test"
    python3 scripts/check-legacy-bridge.py --self-test 2>&1 | sed 's/^/      /'
    fail=1
fi

exit $fail
