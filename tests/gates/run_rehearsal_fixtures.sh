#!/usr/bin/env bash
# T-26 / S47-10 fixtures for tests/e2e/rehearsal-web.mjs.
#
# This runner is a REHEARSAL tool, not a merge gate, but its live assertion is
# no longer inverted: every flow the rehearsal walks is green on the repository
# tree, so the live artifact must PASS the full run.
#
# It was inverted until 2026-10-12, because REQ-UI-04 was believed open ("a cold
# load does not surface stored progress"). That belief was wrong, and the way it
# was wrong is the reason this file now asserts greenness rather than red:
#
#   REQ-UI-04 was a HARNESS defect, not a product defect. Flow 5's "reload" was
#   `Page.navigate` to a URL whose hash had not changed — a same-document no-op
#   in Chrome that does not reload the document. The leg therefore read the DOM
#   the previous flow left behind (the graded verdict, which carries no
#   prior-progress note by design) and reported the missing note as a cold-load
#   failure. Measured with a genuine `Page.reload`: the note renders. The app
#   was right the whole time; the reload never happened.
#
# Two other false results were found in this harness on the way:
#
#   - Flow 7 once asserted the demo banner via the `hidden` ATTRIBUTE, which
#     passed on a banner that was painted the whole time (a false PASS).
#   - Flow 6's Start-button walk began from whatever held focus. Focus survives
#     a hash change while it sits on a shell element, so the walk started
#     mid-list and reported "45 Tab presses" for a route that had skipped the
#     shell entirely. It now blurs first and walks from the top (84 presses).
#
# All three were the same failure mode: an assertion that could not distinguish
# the thing it claimed to measure. The legs now assert the transition
# (absent-before/present-after), the reload (a marker that must not survive), and
# the full walk from a defined start.
#
# What this runner proves, per the fixture-pair discipline:
# Failing fixture: a throwaway copy with the practice answer option rendered as
#   a non-focusable <div> instead of a <button> must FAIL, and the failure must
#   name the option row. That leg passes on the unmodified copy, so this proves
#   the Tab-reachability check actually detects a de-tabbed control rather than
#   failing for an unrelated reason.
# Passing fixture: the same artifact unmodified must PASS the full rehearsal.
#   Without this a harness that could only ever observe failure would look like
#   proof.
# Live: the repository Web tree must PASS the full rehearsal.
#
# The copies live in a throwaway directory, so the repository tree is never
# mutated. If no browser is present the harness fails closed, which fails the
# passing fixture too — the environment is reported, never silently skipped.
set -u
cd "$(dirname "$0")/../.."

fail=0
REHEARSAL="tests/e2e/rehearsal-web.mjs"

# Every flow is green on the current artifact, so the full set is the scope.
# This is now just the default; it is named so a future regression can be
# scoped down deliberately and visibly rather than by editing a literal in
# three places.
GREEN_FLOWS="1,2,3,4,5,6,7"

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
    echo "PASS: the unmodified artifact passes the full rehearsal"
else
    echo "FAIL: the unmodified artifact failed a leg that is green today (no browser, or a real regression)"
    grep -E "^  FAIL" "$WS/good.log" | head -10
    fail=1
fi

if node "$REHEARSAL" >"$WS/live.log" 2>&1; then
    echo "PASS: the live tree passes the full rehearsal"
else
    echo "FAIL: the live tree no longer passes the full rehearsal — a demo-path regression is open"
    grep -E "^  FAIL" "$WS/live.log" | head -10
    fail=1
fi

exit $fail
