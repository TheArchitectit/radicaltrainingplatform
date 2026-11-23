#!/usr/bin/env bash
# Fixtures for scripts/provision-shellcheck.sh (SPEC-22 CI-01).
#
# R-24's own rule, applied to the provisioning step: a gate that cannot fail is
# itself a defect. Each case below asserts a DIFFERENT outcome — resolution by
# override, resolution by PATH, a successful download, and two failures that must
# exit non-zero rather than reporting an unearned pass.
#
# Usage: bash tests/gates/run_shellcheck_provision_fixtures.sh
set -u
cd "$(dirname "$0")/../.." || exit 1

PROV="scripts/provision-shellcheck.sh"
fail=0

pass() { printf 'PASS: %s\n' "$1"; }
bad()  { printf 'FAIL: %s\n' "$1" >&2; fail=1; }

[ -f "${PROV}" ] || { printf 'FAIL: %s not found\n' "${PROV}" >&2; exit 1; }

NULLBIN="$(mktemp -d)"
trap 'rm -rf "${NULLBIN}" "${FAKEBIN:-/nonexistent}" 2>/dev/null' EXIT

# ── 1. $SHELLCHECK override wins, no download ──────────────────────────────
# A fake executable that answers --version the way the real one does.
FAKEBIN="$(mktemp -d)"
cat > "${FAKEBIN}/fakeshellcheck" <<'EOF'
#!/usr/bin/env bash
if [ "${1:-}" = "--version" ]; then
  printf 'version: 9.9.9\n'
  exit 0
fi
exit 0
EOF
chmod +x "${FAKEBIN}/fakeshellcheck"

out="$(SHELLCHECK="${FAKEBIN}/fakeshellcheck" SHELLCHECK_PREFIX="${NULLBIN}" bash "${PROV}" 2>/dev/null)"
rc=$?
if [ "${rc}" -eq 0 ] && [ "${out}" = "${FAKEBIN}/fakeshellcheck" ]; then
    pass "SHELLCHECK override is used without a download"
else
    bad "SHELLCHECK override: rc=${rc} out=${out}"
fi

# ── 2. a shellcheck on PATH is used ────────────────────────────────────────
# Put the fake binary on PATH under the real name.
cp "${FAKEBIN}/fakeshellcheck" "${FAKEBIN}/shellcheck"
out="$(PATH="${FAKEBIN}:${PATH}" SHELLCHECK_PREFIX="${NULLBIN}" bash "${PROV}" 2>/dev/null)"
rc=$?
if [ "${rc}" -eq 0 ] && [ "${out}" = "${FAKEBIN}/shellcheck" ]; then
    pass "a shellcheck on PATH is used"
else
    bad "PATH resolution: rc=${rc} out=${out}"
fi

# ── 3. no override, no PATH → downloads the pinned release ─────────────────
DL="$(mktemp -d)"
# Minimal PATH with curl/python3/tar but NOT shellcheck.
CLEANPATH="/usr/local/bin:/usr/bin:/bin"
out="$(PATH="${CLEANPATH}" SHELLCHECK= SHELLCHECK_PREFIX="${DL}" bash "${PROV}" 2>"${DL}.err")"
rc=$?
if [ "${rc}" -eq 0 ] && [ -x "${out}" ]; then
    ver="$("${out}" --version 2>/dev/null | sed -n 's/^version: //p')"
    if [ -n "${ver}" ]; then
        pass "downloads and runs a real shellcheck (${ver})"
    else
        bad "downloaded binary does not report a version"
    fi
else
    bad "download path: rc=${rc} out=${out} err=$(tail -2 "${DL}.err" 2>/dev/null)"
fi
rm -rf "${DL}" "${DL}.err"

# ── 4. download failure must exit non-zero, never false-pass ───────────────
# Force a bad URL through a pinned version that cannot exist.
out="$(PATH="${CLEANPATH}" SHELLCHECK= SHELLCHECK_PREFIX="${NULLBIN}" \
       bash -c "sed 's|^SC_VERSION=.*|SC_VERSION=\"v0.0.0-does-not-exist\"|' '${PROV}' > ${NULLBIN}/badprov.sh; bash ${NULLBIN}/badprov.sh" 2>/dev/null)"
rc=$?
if [ "${rc}" -ne 0 ]; then
    pass "unreachable release fails closed (exit ${rc})"
else
    bad "unreachable release returned 0 and printed '${out}' — a false pass"
fi

# ── 5. a non-executable result must fail, not be reported as resolved ──────
# Point the prefix at a directory where the extracted name is a plain file.
NOTEXEC="$(mktemp -d)"
mkdir -p "${NOTEXEC}"
: > "${NOTEXEC}/shellcheck"
chmod 644 "${NOTEXEC}/shellcheck"
out="$(SHELLCHECK="${NOTEXEC}/shellcheck" bash "${PROV}" 2>/dev/null)"
rc=$?
if [ "${rc}" -ne 0 ]; then
    pass "non-executable \$SHELLCHECK is rejected (exit ${rc})"
else
    bad "non-executable \$SHELLCHECK was accepted as '${out}'"
fi
rm -rf "${NOTEXEC}"

echo
if [ "${fail}" -ne 0 ]; then
    printf 'SHELLCHECK PROVISION: FAIL\n' >&2
    exit 1
fi
printf 'SHELLCHECK PROVISION: PASS — 5/5 fixtures\n'
