#!/usr/bin/env bash
# Gateway control fixtures (REQ-AI-06/07).
# Each failing fixture removes one enforcement point from a copy and must fail
# that control's checker; the shipped module must pass every checker. The live
# leg starts the real server and verifies the controls across HTTP.
set -u
cd "$(dirname "$0")/../.."

fail=0
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
controls=services/ai-gateway/controls.mjs
checker=tests/gates/fixtures/gateway-controls/check-controls.mjs

make_mutant() {
    local control="$1"
    local dir="$tmp/$control"
    mkdir -p "$dir"
    cp services/ai-gateway/controls.mjs services/ai-gateway/provider.mjs \
        services/ai-gateway/output.mjs "$dir/"
    python3 - "$control" "$dir/controls.mjs" <<'PY'
import pathlib
import sys

control, filename = sys.argv[1:]
mutations = {
    "rate": (
        "        if (this.#count >= this.#limitPerMinute) {",
        "        if (false) {",
    ),
    "spend": (
        "        if (!charge.ok) {",
        "        if (false) {",
    ),
    "cors": (
        "        return LOOPBACK_HOSTS.has(url.hostname);",
        "        return true;",
    ),
    "audit": (
        "        const line = redact(JSON.stringify({ ...event, at: event.at ?? Date.now() }));",
        "        const line = JSON.stringify({ ...event, at: event.at ?? Date.now() });",
    ),
}
old, new = mutations[control]
path = pathlib.Path(filename)
text = path.read_text(encoding="utf-8")
assert text.count(old) == 1, f"{control}: mutation anchor missing or ambiguous"
path.write_text(text.replace(old, new), encoding="utf-8")
PY
}

for control in rate spend cors audit; do
    make_mutant "$control"
    if node "$checker" "$tmp/$control/controls.mjs" "$control" >/dev/null 2>&1; then
        echo "FAIL: $control enforcement-removal fixture passed its checker"
        fail=1
    else
        echo "PASS: $control enforcement-removal fixture failed its checker as required"
    fi

    if node "$checker" "$controls" "$control" >/dev/null 2>&1; then
        echo "PASS: shipped $control control passed its checker"
    else
        echo "FAIL: shipped $control control failed its checker"
        node "$checker" "$controls" "$control"
        fail=1
    fi
done

if node tests/gates/fixtures/gateway-controls/live-server.mjs; then
    echo "PASS: live gateway wiring fixture passed"
else
    echo "FAIL: live gateway wiring fixture failed"
    fail=1
fi

exit $fail
