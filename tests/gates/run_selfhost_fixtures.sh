#!/usr/bin/env bash
# Self-host fixtures for scripts/check-selfhost.py (Sprints 29-30).
#
# Failing fixtures — each seeds one way the self-host story can be false, and
# each must FAIL *and name the defect* (a gate that fails silently is only half
# a gate):
#   A. a runtime-loaded module dropped from the precache   — the offline gap
#   B. a precached path that does not exist                — addAll() rejects, no install
#   C. the shell references a script that is not there     — a broken page
#   D. the shell references it by absolute path            — breaks subdirectory hosting
#   E. the guide names a directory that does not exist     — an un-followable instruction
#   F. the README stops linking the guide                  — a guide nobody finds
#   G. the precache list is removed outright               — the contract is gone
#
# Passing fixtures:
#   H. the repository tree as it stands                    — complete and servable
#   I. a clean sandbox copy                                — same, proving H is not luck
#
# The sandbox is the web tree plus the guide and README, which is everything the
# gate reads. Mutations are seeded into throwaway copies, so the repository is
# never touched.
#
# Fixture A is the regression this pair exists for: sw.js precached 74 of the 82
# files the app loads, and the missing ten included modules in app.js's static
# import graph, so an installed copy opened offline for the first time broke.
set -u
cd "$(dirname "$0")/../.."

fail=0
REPO="$PWD"
GATE=(python3 scripts/check-selfhost.py)

WS="$(mktemp -d)"
trap 'rm -rf "$WS"' EXIT

# sandbox <dir> — the files the gate reads, at their real relative paths.
sandbox() {
    local dir="$1"
    rm -rf "$dir"
    mkdir -p "$dir/docs"
    cp -r "$REPO/RadicalTrainingPlatform.Web" "$dir/"
    cp "$REPO/docs/SELF-HOST.md" "$dir/docs/"
    cp "$REPO/README.md" "$dir/"
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
path.write_text(text.replace(old, new), encoding="utf-8")
PY
    then
        echo "FAIL: a fixture anchor is stale — the fixture proves nothing"
        fail=1
    fi
}

# expect_pass <label> <root>
expect_pass() {
    local label="$1" root="$2"
    if "${GATE[@]}" --root "$root" >/dev/null 2>&1; then
        echo "PASS: $label passes the gate"
    else
        echo "FAIL: $label failed the gate"
        "${GATE[@]}" --root "$root" 2>&1 | sed 's/^/      /'
        fail=1
    fi
}

# must_fail <label> <needle> <root>
must_fail() {
    local label="$1" needle="$2" root="$3" out
    if out="$("${GATE[@]}" --root "$root" 2>&1)"; then
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

# ── H. the tree as it stands ────────────────────────────────────────────────
expect_pass "the repository web tree is complete offline" "$REPO"

# ── I. a clean sandbox ──────────────────────────────────────────────────────
sandbox "$WS/clean"
expect_pass "a clean copy of the tree" "$WS/clean"

# ── A. a runtime-loaded module dropped from the precache ────────────────────
sandbox "$WS/drop"
seed "$WS/drop/RadicalTrainingPlatform.Web/sw.js" \
    "  './js/core/TutorClient.js',
" ""
must_fail "a loaded module dropped from the precache" \
    "TutorClient.js' is loaded at runtime but is not precached" "$WS/drop"

# ── B. a precached path that does not exist ─────────────────────────────────
sandbox "$WS/ghost"
seed "$WS/ghost/RadicalTrainingPlatform.Web/sw.js" \
    "  './js/data/tutor-recorded.js'," \
    "  './js/data/tutor-recorded.js',
  './js/data/ghost.js',"
must_fail "a precached path that does not exist" \
    "precaches 'js/data/ghost.js', which does not exist" "$WS/ghost"

# ── C. the shell references a script that is not there ──────────────────────
sandbox "$WS/noscript"
seed "$WS/noscript/RadicalTrainingPlatform.Web/index.html" \
    'src="js/app.js"' 'src="js/nope.js"'
must_fail "the shell references a missing script" \
    "references 'js/nope.js', which does not exist" "$WS/noscript"

# ── D. the shell references it by absolute path ─────────────────────────────
sandbox "$WS/absolute"
seed "$WS/absolute/RadicalTrainingPlatform.Web/index.html" \
    'src="js/app.js"' 'src="/js/app.js"'
must_fail "the shell references its script by absolute path" \
    "by absolute path or remote host" "$WS/absolute"

# ── E. the guide names a directory that does not exist ──────────────────────
sandbox "$WS/badguide"
seed "$WS/badguide/docs/SELF-HOST.md" \
    "-d RadicalTrainingPlatform.Web" "-d RadicalTrainingPlatform.Weeb"
must_fail "the guide serves a directory that does not exist" \
    "which is not a directory in this tree" "$WS/badguide"

# ── F. the README stops linking the guide ───────────────────────────────────
sandbox "$WS/nolink"
seed "$WS/nolink/README.md" "docs/SELF-HOST.md" "somewhere-else.md"
must_fail "the README does not link the guide" \
    "does not link the self-host guide" "$WS/nolink"

# ── G. the precache list is removed outright ────────────────────────────────
sandbox "$WS/nolist"
seed "$WS/nolist/RadicalTrainingPlatform.Web/sw.js" \
    "const STATIC_ASSETS = [" "const ASSETS = ["
must_fail "the precache list is gone" \
    "no STATIC_ASSETS list found" "$WS/nolist"

# ── the checker's own seeded defects ────────────────────────────────────────
if "${GATE[@]}" --self-test >/dev/null 2>&1; then
    echo "PASS: check-selfhost self-test (12 seeded defects caught)"
else
    echo "FAIL: check-selfhost self-test"
    "${GATE[@]}" --self-test 2>&1 | sed 's/^/      /'
    fail=1
fi

exit $fail
