#!/usr/bin/env bash
# T-24 / R-09 fixtures for the seeded option shuffle.
#
# Failing fixture: the pre-T-24 bug, reintroduced by mutating one line of a
# copy — display position treated as identity. Grading then scores the wrong
# option on every shuffled item, and the checker must say so.
# Passing fixture: the shipped module must pass the same checker.
# Live repo: the shipped practice view must render a shuffled order and still
# score the correct choice Correct.
set -u
cd "$(dirname "$0")/../.."

fail=0
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

# 1. Failing fixture — position mistaken for identity.
cp RadicalTrainingPlatform.Web/js/core/OptionShuffle.js "$tmp/OptionShuffle.js"
python3 - "$tmp/OptionShuffle.js" <<'PY'
import pathlib, sys
path = pathlib.Path(sys.argv[1])
text = path.read_text(encoding="utf-8")
needle = "    const map = displayMap(item, seed);\n"
assert needle in text, "mutation anchor not found — this fixture no longer proves anything"
# The regression: the display letter is treated as the source letter, so a
# shuffled option resolves to whatever identity happens to sit in that slot.
path.write_text(text.replace(
    needle,
    "    const map = {};\n"
    "    for (const l of Object.keys(item.options || {})) map[l] = optionId(item, l);\n",
    ), encoding="utf-8")
PY

if node tests/gates/fixtures/option-shuffle/check-shuffle.mjs "$tmp/OptionShuffle.js" >/dev/null 2>&1; then
    echo "FAIL: identity-as-position fixture passed the checker (the check cannot detect a scoring regression)"
    fail=1
else
    echo "PASS: identity-as-position fixture failed the checker as required"
fi

# 2. Passing fixture — the module as shipped.
if node tests/gates/fixtures/option-shuffle/check-shuffle.mjs \
        RadicalTrainingPlatform.Web/js/core/OptionShuffle.js >/dev/null 2>&1; then
    echo "PASS: shipped shuffle module passed the checker"
else
    echo "FAIL: shipped shuffle module failed the checker"
    fail=1
fi

# 3. Live repo — the view, on the compiled bank, through the real click path.
if node tests/gates/fixtures/option-shuffle/live-render.mjs >/dev/null 2>&1; then
    echo "PASS: live practice view rendered a shuffled order and scored the correct choice"
else
    echo "FAIL: live practice view did not shuffle, or scored the correct choice wrong"
    node tests/gates/fixtures/option-shuffle/live-render.mjs 2>&1 | grep -v "^\[StateStore\]\|^    at \|MODULE_TYPELESS\|Reparsing\|To eliminate\|trace-warnings" | tail -5
    fail=1
fi

exit $fail
