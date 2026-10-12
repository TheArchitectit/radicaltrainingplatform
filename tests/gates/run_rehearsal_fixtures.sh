#!/usr/bin/env bash
# T-26 / S47-10 fixtures for tests/e2e/rehearsal-web.mjs.
#
# This gate is a REHEARSAL, not a merge gate, and its live assertion is
# deliberately inverted from the other fixture runners: the repository's Web
# tree is expected to FAIL, because one real gap is still open and recorded
# rather than silently closed —
#
#   REQ-UI-04  a cold load does not surface stored progress (the prior-progress
#              note renders on a client-side route change but not on reload)
#
# Two gaps this runner was written around have since been closed, and their
# legs moved from "live must fail" into GREEN_FLOWS below:
#
#   REQ-DEMO-05 closed at a7d6cf6 — all 49 nav items now carry an href, so the
#              demo path is keyboard-operable; the closed hamburger overlay is
#              `inert` so its links are not an off-screen tab-order run
#   REQ-DEMO-02 closed at a7d6cf6 — `[hidden] { display: none !important }` in
#              css/components.css, so the demo banner no longer paints in
#              learner mode (the package defines REQ-DEMO-02 as seeded scenario
#              state; the banner was mis-cited under it)
#
# So "live must pass" cannot be the assertion here. What this runner proves is
# that the harness still discriminates: a control removed from the tab order
# fails a leg that otherwise passes, and the live tree is red for exactly the
# recorded reason and no others.
#
# Failing fixture: a throwaway copy with the practice answer option rendered as
#   a non-focusable <div> instead of a <button> must FAIL, and the failure must
#   name the option row. That leg passes on the unmodified copy, so this proves
#   the Tab-reachability check actually detects a de-tabbed control rather than
#   failing for an unrelated reason.
# Passing fixture: the same artifact unmodified, scoped to the legs that are
#   green today, must PASS. Without this a harness that could only ever observe
#   failure would look like proof.
# Live: the repository Web tree must FAIL with exactly the one recorded gap.
#
# The copies live in a throwaway directory, so the repository tree is never
# mutated. If no browser is present the harness fails closed, which fails the
# passing fixture too — the environment is reported, never silently skipped.
set -u
cd "$(dirname "$0")/../.."

fail=0
REHEARSAL="tests/e2e/rehearsal-web.mjs"

# The legs that are green on the current artifact. Flow 1 is the boot
# precondition. Flow 5 carries REQ-UI-04 and is the only leg still out of
# scope; 6 (REQ-DEMO-05) and 7 (the demo banner) went green at a7d6cf6 and are
# asserted here, so a regression in either now fails this runner's passing
# fixture rather than being tolerated as a known gap.
GREEN_FLOWS="1,2,3,4,6,7"

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
    echo "FAIL: the live tree passed the full rehearsal — the recorded gap (REQ-UI-04) appears to be closed; update this runner and the S47-10 record"
    fail=1
else
    missing=""
    grep -q "REQ-UI-04 gap" "$WS/live.log" || missing="$missing REQ-UI-04"
    if [ -n "$missing" ]; then
        echo "FAIL: the live tree no longer reports:$missing — the recorded gap was not found"
        fail=1
    elif ! grep -q "KEYBOARD REHEARSAL: FAIL — 1 problem" "$WS/live.log"; then
        echo "FAIL: the live tree reports more than the one recorded gap — a new regression is hiding behind REQ-UI-04"
        grep -E "^  FAIL" "$WS/live.log" | head -10
        fail=1
    else
        echo "PASS: the live tree fails the full rehearsal with exactly the one recorded gap (REQ-UI-04)"
    fi
fi

exit $fail
