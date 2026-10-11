#!/usr/bin/env bash
# T-26 / S47-10 fixtures for tests/e2e/rehearsal-web.mjs.
#
# This gate is a REHEARSAL, not a merge gate, and its live assertion is
# deliberately inverted from the other fixture runners: the repository's Web
# tree is expected to FAIL, because S47-10 records two real keyboard gaps
# rather than silently closing them —
#
#   REQ-UI-04  a cold load does not surface stored progress (the prior-progress
#              note renders on a client-side route change but not on reload)
#   REQ-DEMO-05 the demo loop's scenario leg is mouse-only to enter (the
#              /pc/scenarios nav item has no href, so it is not in the tab
#              order)
#
# So "live must pass" cannot be the assertion here. What this runner proves is
# that the harness still discriminates: a control removed from the tab order
# fails a leg that otherwise passes, and the live tree is red for exactly the
# two recorded reasons and no others.
#
# Failing fixture: a throwaway copy with the practice answer option rendered as
#   a non-focusable <div> instead of a <button> must FAIL, and the failure must
#   name the option row. That leg passes on the unmodified copy, so this proves
#   the Tab-reachability check actually detects a de-tabbed control rather than
#   failing for an unrelated reason.
# Passing fixture: the same artifact unmodified, scoped to the legs that are
#   green today, must PASS. Without this a harness that could only ever observe
#   failure would look like proof.
# Live: the repository Web tree must FAIL with exactly the two recorded gaps.
#
# The copies live in a throwaway directory, so the repository tree is never
# mutated. If no browser is present the harness fails closed, which fails the
# passing fixture too — the environment is reported, never silently skipped.
set -u
cd "$(dirname "$0")/../.."

fail=0
REHEARSAL="tests/e2e/rehearsal-web.mjs"

# The legs that are green on the current artifact. Flow 1 is the boot
# precondition; 5 and 6 are the two legs that carry the recorded gaps.
GREEN_FLOWS="1,2,3,4,7"

WS="$(mktemp -d)"
trap 'rm -rf "$WS"' EXIT

cp -r RadicalTrainingPlatform.Web "$WS/bad"
cp -r RadicalTrainingPlatform.Web "$WS/good"

# REQ-DEMO-05 shape: an interactive control that is not in the tab order. A
# <div> carries the same class and text but is unreachable by Tab.
sed -i 's#<button class="option-row #<div class="option-row #' \
    "$WS/bad/js/views/practice.js"

if REHEARSAL_WEB_ROOT="$WS/bad" REHEARSAL_FLOWS="$GREEN_FLOWS" \
        node "$REHEARSAL" >"$WS/bad.log" 2>&1; then
    echo "FAIL: an artifact with a de-tabbed answer option passed the rehearsal"
    fail=1
else
    if grep -q "no answer option reachable by Tab" "$WS/bad.log"; then
        echo "PASS: de-tabbed answer option failed the rehearsal, naming the option row (REQ-DEMO-05 shape)"
    else
        echo "FAIL: the rehearsal failed, but not for the de-tabbed option — it did not detect the defect"
        sed -n '/^## Flow 4/,/^## Flow/p' "$WS/bad.log" | head -20
        fail=1
    fi
fi

if REHEARSAL_WEB_ROOT="$WS/good" REHEARSAL_FLOWS="$GREEN_FLOWS" \
        node "$REHEARSAL" >"$WS/good.log" 2>&1; then
    echo "PASS: the unmodified artifact passes the rehearsal legs that are green today"
else
    echo "FAIL: the unmodified artifact failed a leg that is green today (no browser, or a real regression)"
    grep -E "^  FAIL" "$WS/good.log" | head -10
    fail=1
fi

if node "$REHEARSAL" >"$WS/live.log" 2>&1; then
    echo "FAIL: the live tree passed the full rehearsal — the two recorded gaps (REQ-UI-04, REQ-DEMO-05) appear to be closed; update this runner and the S47-10 record"
    fail=1
else
    missing=""
    grep -q "REQ-UI-04 gap" "$WS/live.log" || missing="$missing REQ-UI-04"
    grep -q "REQ-DEMO-05 gap" "$WS/live.log" || missing="$missing REQ-DEMO-05"
    if [ -n "$missing" ]; then
        echo "FAIL: the live tree no longer reports:$missing — the recorded gaps were not found"
        fail=1
    else
        echo "PASS: the live tree fails the full rehearsal with exactly the two recorded gaps (REQ-UI-04, REQ-DEMO-05)"
    fi
fi

exit $fail
