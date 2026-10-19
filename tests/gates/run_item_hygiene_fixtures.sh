#!/usr/bin/env bash
# Item-hygiene fixtures for scripts/check-item-hygiene.py (Sprints 43-44).
#
# Failing fixtures — each seeds one defect a reader can see in the item text,
# and each must FAIL *and name the defect*:
#   A. two options carry the same text              — no distinguishable choice
#   B. an option is "all of the above"              — position-dependent wording
#   C. the stem refers to "option B"                — cannot be shuffled
#   D. the answer key names an option that does not exist — ungradeable
#   E. the item has no answer key at all            — ungradeable
#   F. a 20-item bank puts every key on A           — farmable by position
#   G. a released bank is deleted                   — the compiler cannot build
#   H. the tree has no content/exams at all         — nothing was audited
#
# Passing fixtures:
#   I. the repository tree as it stands
#   J. a clean sandbox copy
#
# J also carries the repo's legacy root-level banks, which are all over the
# concentration threshold and are not shipped: the run must stay green, because
# those findings are advisory by design. F should be the only concentration
# failure in this file.
set -u
cd "$(dirname "$0")/../.."

fail=0
REPO="$PWD"
GATE=(python3 scripts/check-item-hygiene.py)
BANK=content/exams/COMPTIA-A-1201/questions/core1-a2-fixtures.md

WS="$(mktemp -d)"
trap 'rm -rf "$WS"' EXIT

# sandbox <dir> — the two roots the gate reads: the shipped exam tree and the
# legacy root-level banks (glob, non-recursive).
sandbox() {
    local dir="$1"
    rm -rf "$dir"
    mkdir -p "$dir/content"
    cp -r "$REPO/content/exams" "$dir/content/"
    cp "$REPO"/*.md "$dir/"
}

# seed <file> <old> <new> — one literal replacement, in place. A stale anchor is
# a broken fixture, not a passing one.
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

# ── I. the tree as it stands ────────────────────────────────────────────────
expect_pass "the repository's released banks are clean" "$REPO"

# ── J. a clean sandbox, legacy advisory included ────────────────────────────
sandbox "$WS/clean"
expect_pass "a clean copy of the tree (legacy banks advisory only)" "$WS/clean"

# ── A. duplicate option text ────────────────────────────────────────────────
sandbox "$WS/duplicate"
seed "$WS/duplicate/$BANK" "- B) DNS" "- B) DHCP"
must_fail "two options carry the same text" \
    "have the same text" "$WS/duplicate"

# ── B. "all of the above" ───────────────────────────────────────────────────
sandbox "$WS/above"
seed "$WS/above/$BANK" "- D) The subnet mask" "- D) All of the above"
must_fail "an option is 'all of the above'" \
    "position-dependent wording (all of the above)" "$WS/above"

# ── C. the stem refers to an option letter ──────────────────────────────────
sandbox "$WS/letter"
seed "$WS/letter/$BANK" \
    "Which service should you check first?" \
    "Which option B should you check first?"
must_fail "the stem refers to an option letter" \
    "position-dependent wording (options/answers/choices <letter>)" "$WS/letter"

# ── D. the answer key names no option ───────────────────────────────────────
sandbox "$WS/virtual"
seed "$WS/virtual/$BANK" "**Answer: B**" "**Answer: E**"
must_fail "the answer key names an option that does not exist" \
    "names no option" "$WS/virtual"

# ── E. the item has no answer key ───────────────────────────────────────────
sandbox "$WS/nokey"
seed "$WS/nokey/$BANK" "**Answer: B**" ""
must_fail "the item has no answer key" \
    "has no answer key" "$WS/nokey"

# ── F. a bank at audit size with every key on A ─────────────────────────────
sandbox "$WS/concentration"
python3 - "$WS/concentration/$BANK" <<'PY'
import pathlib, sys
lines = []
for i in range(20):
    lines += [f"### Q{i + 1}", "Pick one.",
              "- A) alpha", "- B) bravo", "- C) delta", "- D) gamma",
              "**Answer: A**", "Explanation.", "---"]
pathlib.Path(sys.argv[1]).write_text("\n".join(lines) + "\n", encoding="utf-8")
PY
must_fail "a 20-item bank puts every key on A" \
    "over the 40% threshold" "$WS/concentration"

# ── G. a released bank is deleted ───────────────────────────────────────────
sandbox "$WS/deleted"
rm "$WS/deleted/$BANK"
must_fail "a released bank is deleted" \
    "a released bank does not exist" "$WS/deleted"

# ── H. nothing was audited ──────────────────────────────────────────────────
mkdir -p "$WS/empty"
must_fail "the tree has no content/exams at all" \
    "no content/exams under" "$WS/empty"

# ── the checker's own seeded defects ────────────────────────────────────────
if "${GATE[@]}" --self-test >/dev/null 2>&1; then
    echo "PASS: check-item-hygiene self-test (7 seeded defects caught)"
else
    echo "FAIL: check-item-hygiene self-test"
    "${GATE[@]}" --self-test 2>&1 | sed 's/^/      /'
    fail=1
fi

exit $fail
