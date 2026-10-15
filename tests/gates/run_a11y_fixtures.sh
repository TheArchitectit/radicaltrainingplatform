#!/usr/bin/env bash
# Fixtures for tests/e2e/a11y-web.mjs (Sprints 35-36, S35-01..S35-07).
#
# Each failing fixture seeds ONE accessibility defect and must FAIL *and name
# it* — a gate that fails silently is only half a gate. Each rule the gate
# implements has its own fixture, so no rule is carried by another rule's
# failure:
#
#   Page-level rules (against fixtures/a11y/page.html):
#     A. low-contrast text                      — 1.4.3
#     B. no <h1>                                — 1.3.1 / 2.4.6
#     C. a skipped heading level                — 1.3.1
#     D. an icon button with no accessible name — 4.1.2
#     E. an input named only by its placeholder — 4.1.2 / 3.3.2
#     F. no <main> landmark                     — 1.3.1 / 2.4.1
#     G. two unnamed <nav> landmarks            — 1.3.1
#     H. no skip link                           — 2.4.1
#     I. a toast container that is not a live region — 4.1.3
#     J. focus with no visible indicator        — 2.4.7
#     K. an <img> with no alt                   — 1.1.1
#     L. no lang on <html>                      — 3.1.1
#     M. a prose link distinguished by colour alone — 1.4.1
#     U. a table row checkbox with no accessible name — 4.1.2
#     AD. a digit-only text run at low contrast — 1.4.3, and the fix for the
#         emoji filter that used to swallow bare numerals
#
#   App-shell rules (against fixtures/a11y/shell/, which has a #view-container):
#     N. a modal with no dialog semantics       — 4.1.2 / 2.4.3
#     O. a modal with no Tab trap               — 2.4.3
#     P. a theme toggle that ignores the OS     — S35-05
#     Q. a closed overlay that is hidden but not inert — S35-07
#     V. a hamburger whose aria-expanded never changes — 4.1.2
#     W. a theme toggle whose aria-pressed never changes — 4.1.2
#     X. an error toast that is not role="alert"       — 4.1.3
#     Y. a route the sweep cannot render (the gate's own coverage tripwire)
#     Z. routes the gate's own discovery would miss  (both guards)
#
#   Click-reachable rules (against the wizard the shell opens on a click, which
#   the per-route sweep never sees):
#     AA. a wizard step whose marker digits fail contrast — 1.4.3
#     AB. a wizard whose step inputs have no accessible name — 4.1.2 / 3.3.2
#     AC. a wizard with no dialog semantics (role) — 4.1.2 / 2.4.3
#
# Passing fixtures:
#     R. the unmodified page fixture
#     S. the unmodified stub shell
#     T. the repository's Web tree — every real route, in both themes
#
# Every fixture runs against a throwaway copy, so the repository is never
# mutated. The shell fixtures exist because the dialog, overlay and theme checks
# cannot be driven against a plain page: without a stub shell to break, those
# checks would have no way to fail, and a check that cannot fail is not a check
# (SPEC-16 #4). Q is there because the closed-overlay check was itself wrong when
# first written — it called an inert overlay "still reachable" — so it is exactly
# the check that most needs a fixture proving it can fail.
set -u
cd "$(dirname "$0")/../.."

fail=0
REPO="$PWD"
GATE=(node tests/e2e/a11y-web.mjs)
FIXTURES="$REPO/tests/gates/fixtures/a11y"

WS="$(mktemp -d)"
trap 'rm -rf "$WS"' EXIT

# make_case <name> <source-dir> — a throwaway copy of one fixture tree.
make_case() {
    local dir="$WS/$1"
    mkdir -p "$dir"
    cp -r "$2/." "$dir/"
    echo "$dir"
}

# seed <file> <old> <new> — apply one literal replacement, in place.
# A stale anchor is a broken fixture, not a passing one, so it is reported as a
# failure rather than left to make the fixture look green for the wrong reason.
seed() {
    if ! python3 - "$1" "$2" "$3" <<'PY'
import pathlib, sys
path, old, new = pathlib.Path(sys.argv[1]), sys.argv[2], sys.argv[3]
text = path.read_text(encoding="utf-8")
if old not in text:
    sys.exit(f"anchor not found in {path}: {old!r}")
path.write_text(text.replace(old, new, 1), encoding="utf-8")
PY
    then
        echo "FAIL: a fixture anchor is stale — the fixture proves nothing"
        fail=1
    fi
}

# run <dir> <page> — the gate against one fixture tree.
run() {
    A11Y_WEB_ROOT="$1" A11Y_TARGETS="$2" "${GATE[@]}" 2>&1
}

# expect_pass <label> <dir> <page>
expect_pass() {
    local label="$1" dir="$2" page="$3" out
    if out="$(run "$dir" "$page")"; then
        echo "PASS: $label passes the gate"
    else
        echo "FAIL: $label failed the gate"
        printf '%s\n' "$out" | sed 's/^/      /'
        fail=1
    fi
}

# must_fail <label> <needle> <dir> <page>
must_fail() {
    local label="$1" needle="$2" dir="$3" page="$4" out
    if out="$(run "$dir" "$page")"; then
        echo "FAIL: $label passed the gate (the gate cannot detect it)"
        fail=1
    elif ! printf '%s' "$out" | grep -qF -- "$needle"; then
        echo "FAIL: $label failed, but not for the stated reason"
        echo "      wanted the gate to say: $needle"
        printf '%s\n' "$out" | sed 's/^/      /'
        fail=1
    else
        echo "PASS: $label fails the gate and names the defect"
    fi
}

# ── R and S. the unmodified fixtures ────────────────────────────────────────
CLEAN_PAGE="$(make_case clean-page "$FIXTURES")"
expect_pass "the clean page fixture" "$CLEAN_PAGE" page.html

CLEAN_SHELL="$(make_case clean-shell "$FIXTURES/shell")"
expect_pass "the clean stub shell" "$CLEAN_SHELL" page.html

# ── A. low-contrast text ────────────────────────────────────────────────────
A="$(make_case contrast "$FIXTURES")"
seed "$A/page.html" '    .chip { background: #ffffff; color: #1b1b1b; }' \
                    '    .chip { background: #ffffff; color: #c9c9c9; }'
must_fail "text at 1.6:1" "contrast" "$A" page.html

# ── B. no <h1> ──────────────────────────────────────────────────────────────
B="$(make_case no-h1 "$FIXTURES")"
seed "$B/page.html" '<h1>Accessibility fixture</h1>' '<h2>Accessibility fixture</h2>'
must_fail "a page with no level-one heading" "page-has-heading-one" "$B" page.html

# ── C. a skipped heading level ──────────────────────────────────────────────
C="$(make_case heading-order "$FIXTURES")"
seed "$C/page.html" '<h2>A section</h2>' '<h4>A section</h4>'
must_fail "an <h4> directly under an <h1>" "heading-order" "$C" page.html

# ── D. an icon button with no accessible name ───────────────────────────────
D="$(make_case no-name "$FIXTURES")"
seed "$D/page.html" \
    '<button type="button" aria-label="Close panel">×</button>' \
    '<button type="button"><svg width="16" height="16" viewBox="0 0 16 16"><path d="M1 1l14 14"/></svg></button>'
must_fail "an icon button with no accessible name" "control-name" "$D" page.html

# ── E. an input named only by its placeholder ───────────────────────────────
E="$(make_case placeholder "$FIXTURES")"
seed "$E/page.html" \
    '<label for="q">Search</label> <input id="q" type="text">' \
    '<input id="q" type="text" placeholder="Search">'
must_fail "an input labelled only by its placeholder" "input-placeholder-only" "$E" page.html

# ── F. no <main> landmark ───────────────────────────────────────────────────
F="$(make_case no-main "$FIXTURES")"
seed "$F/page.html" '<main id="main">' '<div id="main">'
seed "$F/page.html" '</main>' '</div>'
must_fail "a page with no main landmark" "landmark-main" "$F" page.html

# ── G. two unnamed <nav> landmarks ──────────────────────────────────────────
G="$(make_case unnamed-nav "$FIXTURES")"
seed "$G/page.html" \
    '<nav aria-label="Primary">
    <a href="#main">Home</a>
</nav>' \
    '<nav>
    <a href="#main">Home</a>
</nav>
<nav>
    <a href="#main">Other</a>
</nav>'
must_fail "two navigation landmarks with no names" "landmark-named" "$G" page.html

# ── H. no skip link ─────────────────────────────────────────────────────────
H="$(make_case no-skip "$FIXTURES")"
seed "$H/page.html" '<a class="skip" href="#main">Skip to main content</a>
' ''
must_fail "a page with no skip link" "skip-link" "$H" page.html

# ── I. a toast container that is not a live region ──────────────────────────
I="$(make_case no-live "$FIXTURES")"
seed "$I/page.html" \
    '<div id="toast-container" role="status" aria-live="polite"></div>' \
    '<div id="toast-container"></div>'
must_fail "a status container that is not a live region" "live-region" "$I" page.html

# ── J. focus with no visible indicator ──────────────────────────────────────
J="$(make_case no-focus "$FIXTURES")"
seed "$J/page.html" \
    '    :focus-visible { outline: 3px solid var(--link); outline-offset: 2px; }' \
    '    :focus-visible { outline: none; }'
must_fail "focus with no visible indicator" "focus-visible" "$J" page.html

# ── K. an <img> with no alt ─────────────────────────────────────────────────
K="$(make_case no-alt "$FIXTURES")"
seed "$K/page.html" ' alt="A one-pixel image">' '>'
must_fail "an image with no alt attribute" "img-alt" "$K" page.html

# ── L. no lang on <html> ────────────────────────────────────────────────────
L="$(make_case no-lang "$FIXTURES")"
seed "$L/page.html" '<html lang="en">' '<html>'
must_fail "a document with no lang attribute" "html-lang" "$L" page.html

# ── M. a prose link distinguished by colour alone ───────────────────────────
M="$(make_case colour-only-link "$FIXTURES")"
seed "$M/page.html" '</style>' '    a { text-decoration: none; }
</style>'
must_fail "a prose link distinguished by colour alone" "link-in-text-block" "$M" page.html

# ── U. a table row checkbox with no accessible name ─────────────────────────
# Found by widening the gate's route list to the two routes whose EntityTable is
# selectable. The shell is where the unnamed controls were not, so this rule
# needs a fixture of its own or the widened coverage would rest on the routes
# alone. (The sibling defect — the `⋯` action button, named "⋯" rather than after
# its row — is NOT detectable by this gate: a text run is a name as far as the
# accname computation goes. It is fixed in EntityTable.js and reported as
# unmeasured, not claimed as verified.)
U="$(make_case no-row-name "$FIXTURES")"
seed "$U/page.html" \
    '<input type="checkbox" class="row-select" aria-label="Select vm-01">' \
    '<input type="checkbox" class="row-select">'
must_fail "a table row checkbox with no accessible name" \
    'row-select has no accessible name' "$U" page.html

# ── AD. a digit-only text run at low contrast ───────────────────────────────
# Not a duplicate of A: A's run is words, which were always measured. This one is
# a bare numeral, and bare numerals were NOT measured until the emoji filter was
# fixed — Unicode classes `0-9` as `Emoji_Component`, so the old character class
# matched "4" and skipped it as if it were an emoji. The needle names the run so
# this cannot pass by some other element's contrast failing.
AD="$(make_case digit-contrast "$FIXTURES")"
seed "$AD/page.html" '    .badge { background: #ffffff; color: #1b1b1b; }' \
                     '    .badge { background: #ffffff; color: #c9c9c9; }'
must_fail "a digit-only text run at low contrast" '(text "4")' "$AD" page.html

# ── N. a modal with no dialog semantics ─────────────────────────────────────
N="$(make_case bad-dialog "$FIXTURES/shell")"
seed "$N/js/components/Confirm.js" \
    '            <div class="modal" role="dialog" aria-modal="true" aria-labelledby="fixture-dialog-title">
                <h2 id="fixture-dialog-title">${title}</h2>' \
    '            <div class="modal">
                <h2>${title}</h2>'
must_fail "a modal with no role, no aria-modal and no name" \
    'the modal has no role="dialog"' "$N" page.html

# ── O. a modal with no Tab trap ─────────────────────────────────────────────
# The Escape branch is left in place, so the only thing this fixture breaks is
# the trap: a dialog that closes correctly but leaks Tab to the page behind it.
O="$(make_case no-trap "$FIXTURES/shell")"
seed "$O/js/components/Confirm.js" \
    "            if (event.key !== 'Tab') return;
            const stops = [...overlay.querySelectorAll('button')];
            if (!stops.length) return;
            const first = stops[0];
            const last = stops[stops.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
" ''
must_fail "a modal that leaks Tab to the page behind it" \
    'Tab from the last control in the modal moved focus outside it' "$O" page.html

# ── P. a theme toggle that ignores the OS ───────────────────────────────────
P="$(make_case bad-theme "$FIXTURES/shell")"
seed "$P/js/components/ThemeToggle.js" \
    "    return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';" \
    "    return 'dark';"
must_fail "a theme toggle that ignores prefers-color-scheme" \
    'with no stored choice and prefers-color-scheme: light' "$P" page.html

# ── Q. a closed overlay that is hidden but not inert ────────────────────────
# The toggle opens correctly but never puts `inert` back, so the closed overlay
# stays in the tab order — the S35-07 failure mode.
Q="$(make_case not-inert "$FIXTURES/shell")"
seed "$Q/page.html" \
    "        if (overlay.hasAttribute('inert')) overlay.removeAttribute('inert');
        else overlay.setAttribute('inert', '');" \
    "        if (overlay.hasAttribute('inert')) overlay.removeAttribute('inert');"
must_fail "a closed overlay that is still in the tab order" \
    'the closed hamburger overlay is still reachable' "$Q" page.html

# ── V. a hamburger whose aria-expanded never changes ────────────────────────
# The overlay still opens and closes correctly and still goes inert, so the
# overlay checks pass — the only thing broken is the control's report of its own
# state, which is exactly what nothing else measures.
V="$(make_case stale-expanded "$FIXTURES/shell")"
seed "$V/page.html" \
    "        button.setAttribute('aria-expanded', String(!overlay.hasAttribute('inert')));
" ''
must_fail "a hamburger button that never reports its own state" \
    'the hamburger button does not track the overlay' "$V" page.html

# ── W. a theme toggle whose aria-pressed never changes ──────────────────────
W="$(make_case stale-pressed "$FIXTURES/shell")"
seed "$W/js/components/ThemeToggle.js" \
    "    if (btn) btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
" ''
must_fail "a theme toggle that never reports its own state" \
    'the theme toggle does not track the theme' "$W" page.html

# ── X. an error toast announced like any other ──────────────────────────────
# The toast still lands in the live region with a named dismiss control, so the
# polite path works — but a failure is announced no differently from a success.
X="$(make_case flat-toast "$FIXTURES/shell")"
seed "$X/js/components/Toast.js" \
    "        if (type === 'error') toast.setAttribute('role', 'alert');
" ''
must_fail "an error toast announced like any other" \
    'an error toast is not role="alert"' "$X" page.html

# ── Y. a route the sweep cannot render ──────────────────────────────────────
# The shell exists (so the gate takes the app-shell path) but nothing ever
# renders into it, which is what `/pc/api` did: `navigate` timed out, the throw
# escaped the per-route loop into the outer catch, and 34 of 54 routes were
# never audited while the summary still read as a completed sweep. This fixture
# asserts both halves of the repair — the route is reported as not rendering,
# AND the coverage tripwire notices that the sweep fell short of its own list.
Y="$(make_case unrendered "$FIXTURES/shell")"
seed "$Y/page.html" \
    '<main id="view-container">
    <h1>Shell fixture</h1>
    <p>Fixture content.</p>
    <button id="create-vm-btn" type="button">Create VM</button>
</main>' \
    '<main id="view-container"></main>'
must_fail "a route that never renders" \
    'did not render' "$Y" page.html
must_fail "a sweep that covered fewer routes than it was given" \
    'were never audited' "$Y" page.html

# ── Z. routes the gate's own discovery would miss ───────────────────────────
# The gate reads the route list out of `js/app.js` instead of carrying a
# hand-written one, so discovery is now a thing that can be wrong. Both ways it
# can drop a view are proved here: a registration it cannot parse, and a
# parameterized route with no concrete instance to audit.
Z="$(make_case lost-routes "$FIXTURES/shell")"
mkdir -p "$Z/js"
cat > "$Z/js/app.js" <<'JS'
// Fixture router table. `/ghost/:id` has no concrete instance in the gate's
// PARAMETERIZED_TARGETS, and GHOST_ROUTE is built from a variable so the gate's
// path regex cannot see it — one fixture, both discovery guards.
const GHOST_ROUTE = '/ghost-static';
router.register('/tracks', TrackPickerView);
router.register('/ghost/:id', GhostView);
router.register(GHOST_ROUTE, GhostStaticView);
JS
must_fail "a registered route with no concrete instance to audit" \
    'they would never be audited' "$Z" page.html
must_fail "a registration the gate's route parser cannot read" \
    'could not be parsed' "$Z" page.html

# ── AA. a wizard whose step-marker digits fail contrast ─────────────────────
# The defect this whole section exists for: the real `Wizard` shipped white step
# digits on `--prism-blue` (2.69:1) and it was found by reading the CSS, not by
# any audit, because the wizard only exists after a click. The stub carries the
# fixed form (`--text-on-accent` on the same fill, ~6.8:1); this seeds it back.
AA="$(make_case wizard-contrast "$FIXTURES/shell")"
seed "$AA/page.html" \
    '.wizard-step.active .step-number { border-color: #22a5f7; background: #22a5f7; color: #131520; }' \
    '.wizard-step.active .step-number { border-color: #22a5f7; background: #22a5f7; color: #ffffff; }'
must_fail "a wizard step marker whose digits fail contrast" \
    'contrast @ open wizard' "$AA" page.html

# ── AB. a wizard whose step inputs have no accessible name ──────────────────
# Found the moment the gate learned to open a wizard: every view builds its step
# markup as `<label>…</label><input>` with no `for`/`id`, so the control had no
# name at all — in all ~25 views. The component now associates them; this removes
# the association from the stub to prove the check can fail.
AB="$(make_case wizard-unnamed-field "$FIXTURES/shell")"
seed "$AB/js/components/Wizard.js" \
    '                    <label for="fixture-wizard-field">Name</label>
                    <input id="fixture-wizard-field" type="text">' \
    '                    <label>Name</label>
                    <input type="text">'
must_fail "a wizard step input with no accessible name" \
    'control-name @ open wizard' "$AB" page.html

# ── AC. a wizard with no dialog semantics ───────────────────────────────────
# A second component carries the same contract as the confirm dialog, so a
# regression in either is caught: the wizard opens, traps and closes correctly,
# but announces itself as a plain div.
AC="$(make_case wizard-no-role "$FIXTURES/shell")"
seed "$AC/js/components/Wizard.js" \
    '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="fixture-wizard-title">' \
    '<div class="modal" aria-modal="true" aria-labelledby="fixture-wizard-title">'
must_fail "a wizard that does not announce itself as a dialog" \
    'the wizard has no role="dialog"' "$AC" page.html

# ── T. the repository tree, every route, both themes ────────────────────────
if "${GATE[@]}" >/dev/null 2>&1; then
    echo "PASS: the repository Web tree passes the accessibility gate"
else
    echo "FAIL: the repository Web tree failed the accessibility gate"
    "${GATE[@]}" 2>&1 | sed 's/^/      /'
    fail=1
fi

exit $fail
