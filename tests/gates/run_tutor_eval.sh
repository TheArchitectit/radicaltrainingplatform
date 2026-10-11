#!/usr/bin/env bash
# TM-66 / REQ-AI-06: run the tutor evaluation and archive its report.
#
# The harness (tests/gates/tutor-eval.mjs) asserts both directions for every
# gate it covers:
#
#   passing — the shipped recorded examples resolve correctly, cite allowlisted
#             corpus IDs, state a next action, and never claim endorsement;
#             the two demo prompts resolve to the reviewed DNS and gateway
#             lessons; out-of-contract fields are rejected; offline, timeout and
#             rate-limit all report unavailable without inventing content.
#   failing — a provider response that *follows* an injected instruction is
#             caught; an unknown citation is stripped and degrades the answer;
#             a corpus record without transmission rights is excluded and named;
#             a question no reviewed response covers resolves to nothing.
#
# Usage: tests/gates/run_tutor_eval.sh [--out <report.md>]
set -u
cd "$(dirname "$0")/../.."

OUT=""
if [ "${1:-}" = "--out" ] && [ -n "${2:-}" ]; then
    OUT="$2"
fi

# Node ESM warns about the repository's typeless .js modules; the repo
# intentionally has no package.json, so the warning is noise here.
ERR="$(mktemp)"
trap 'rm -f "$ERR"' EXIT

# Stamp the report with the commit the run was made against, so an archived
# report can be read back against a specific head.
STAMP=(--generated "$(date -Iseconds)"
       --head "$(git rev-parse HEAD 2>/dev/null || echo unknown)"
       --branch "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)")

if [ -n "$OUT" ]; then
    node tests/gates/tutor-eval.mjs --out "$OUT" "${STAMP[@]}" 2>"$ERR"
else
    node tests/gates/tutor-eval.mjs "${STAMP[@]}" 2>"$ERR"
fi
status=$?

grep -v -e MODULE_TYPELESS_PACKAGE_JSON -e "Reparsing as ES module" \
        -e "trace-warnings" -e 'add "type": "module"' \
        -e "ExperimentalWarning" -e "localstorage-file" "$ERR" >&2 || true

if [ "$status" -ne 0 ]; then
    echo
    echo "TUTOR EVAL: FAIL — live AI must stay disabled if this does not pass (REQ-AI-06)"
    exit 1
fi

exit 0
