#!/usr/bin/env bash
# R-24 ShellCheck gate + fixture scripts (S47-09 / T-45).
#
# R-24's fix line: "ShellCheck added to CI for packaging scripts; icon-path
# behavior fixtures that execute the script paths, not syntax checks." This
# runner is the ShellCheck half; the behaviour half lives in
# tests/gates/run_packaging_fixtures.sh (the icon-path and macOS-fallback cases),
# which owns the sandbox and the controlled PATH a packaging script needs.
#
# Why ShellCheck and not `bash -n`: R-24 names the "missing-bracket runtime
# defect class" — a conditional diagnostic that can still exit 0 wrongly. That
# defect parses. `bash -n` passes it. The syntax is not what is wrong; the
# meaning of the exit code is. So this gate asserts all three of:
#
#   1. `bash -n` PASSES the failing fixture  — a syntax check is not the gate
#   2. ShellCheck FAILS it, naming SC2181    — and the code is the real finding
#   3. running it exits 0 having produced nothing — the defect is not theoretical
#
# and, on the passing fixture, that the same warning sentence is allowed to be
# printed (the gate must not become a ban on warnings) while the exit code tells
# the truth.
#
# Scope: the packaging scripts, which is what R-24 asks for. The rest of the
# repository's shell carries pre-existing style findings (SC2164, SC2015,
# SC2329 across the older gate runners); gating those is a separate, larger
# cleanup and is deliberately not smuggled in here.
#
# ShellCheck is not baked into the fleet runner image. The gate fails CLOSED if
# it is missing and says how to supply it, rather than reporting a pass it did
# not earn. (A comment line starting with "# shellcheck" is read as a directive
# and makes the file unparseable — SC1072/SC1073 — which is why this sentence
# does not begin with it.)
set -u
cd "$(dirname "$0")/../.."

fail=0
FIXTURES="tests/gates/fixtures/shellcheck"

# R-24's scope: the scripts that build distributable artifacts.
PACKAGING_SCRIPTS=(
    packaging/linux/build-appimage.sh
    packaging/macos/build-dmg.sh
)

# The ShellCheck version is printed because findings are version-dependent: a
# pass recorded under one version is not a pass under another.
find_shellcheck() {
    if [ -n "${SHELLCHECK:-}" ] && [ -x "${SHELLCHECK}" ]; then
        printf '%s\n' "${SHELLCHECK}"
        return 0
    fi
    if command -v shellcheck >/dev/null 2>&1; then
        command -v shellcheck
        return 0
    fi
    # A workspace-local venv, which is how CI supplies it (see build.yml).
    for candidate in .shellcheck-venv/bin/shellcheck /tmp/scvenv/bin/shellcheck; do
        if [ -x "${candidate}" ]; then
            printf '%s\n' "${candidate}"
            return 0
        fi
    done
    return 1
}

if ! SC="$(find_shellcheck)"; then
    cat >&2 <<'MSG'
FAIL: shellcheck is not installed, so the R-24 gate cannot run.

Install it, then re-run:
    python3 -m venv .shellcheck-venv
    .shellcheck-venv/bin/pip install shellcheck-py
  (or point SHELLCHECK at an existing binary)

This is a failure and not a skip: a gate that reports "pass" when it could not
run is the same class of lie R-24 exists to remove.
MSG
    exit 1
fi

echo "shellcheck: ${SC} ($("${SC}" --version | sed -n 's/^version: //p'))"

# ── 1/2/3. the failing fixture ──────────────────────────────────────────────
BAD="${FIXTURES}/bad/build.sh"
GOOD="${FIXTURES}/good/build.sh"

if bash -n "${BAD}" 2>/dev/null; then
    echo "PASS: 'bash -n' accepts the failing fixture — which is exactly why a"
    echo "      syntax check is not the R-24 gate"
else
    echo "FAIL: 'bash -n' rejects the failing fixture, so it is not the defect"
    echo "      class R-24 describes (a defect that parses but exits 0 wrongly)"
    fail=1
fi

if bad_out="$("${SC}" -S style "${BAD}" 2>&1)"; then
    echo "FAIL: ShellCheck accepted the failing fixture (the gate cannot detect it)"
    fail=1
elif ! echo "${bad_out}" | grep -q "SC2181"; then
    echo "FAIL: ShellCheck rejected the failing fixture, but not for SC2181 — the"
    echo "      indirect \$? that lets a failed check exit 0"
    echo "${bad_out}" | sed 's/^/      /'
    fail=1
else
    echo "PASS: ShellCheck fails the fixture on SC2181 — the indirect \$? is the"
    echo "      defect, and it is named rather than merely counted"
fi

# The static finding must correspond to a real run: the fixture, executed with
# the tool it needs absent, reports the missing tool and exits 0 having produced
# nothing. A gate that only reads text can be satisfied by text that lies.
BEHAVIOUR_WS="$(mktemp -d)"
trap 'rm -rf "${BEHAVIOUR_WS}"' EXIT

run_fixture() {
    local which="$1" dir="${BEHAVIOUR_WS}/$1"
    rm -rf "${dir}"; mkdir -p "${dir}"
    cp "${FIXTURES}/${which}/build.sh" "${dir}/"
    # A PATH with no appimagetool on it, which is the condition under test.
    ( cd "${dir}" && env -i PATH=/usr/bin:/bin bash build.sh 2>&1 )
}

if bad_run="$(run_fixture bad)"; then
    bad_status=0
else
    bad_status=$?
fi
if [ "${bad_status}" -ne 0 ]; then
    echo "FAIL: the failing fixture exited ${bad_status} — R-24's defect class is a"
    echo "      diagnostic that exits 0, and this fixture no longer has it"
    fail=1
elif [ -f "${BEHAVIOUR_WS}/bad/dist/RadicalTrainingPlatform-x86_64.AppImage" ]; then
    echo "FAIL: the failing fixture produced an AppImage, so its exit code is honest"
    fail=1
elif ! echo "${bad_run}" | grep -q "appimagetool not found"; then
    echo "FAIL: the failing fixture exited 0 without even reporting the missing tool"
    fail=1
else
    echo "PASS: run with no appimagetool it exits 0 having produced nothing — the"
    echo "      diagnostic fires and the exit code still says success"
fi

# ── the passing fixture ─────────────────────────────────────────────────────
if "${SC}" -S style "${GOOD}" >/dev/null 2>&1; then
    echo "PASS: the honest fixture passes ShellCheck — the gate permits the warning"
    echo "      sentence, it only requires the exit code to match the outcome"
else
    echo "FAIL: the honest fixture failed ShellCheck — the gate is punishing the fix"
    "${SC}" -S style "${GOOD}" 2>&1 | sed 's/^/      /'
    fail=1
fi

if good_run="$(run_fixture good)"; then
    good_status=0
else
    good_status=$?
fi
if [ "${good_status}" -eq 0 ]; then
    echo "FAIL: the honest fixture exited 0 while producing no artifact — it has"
    echo "      been repaired back into the defect"
    fail=1
elif ! echo "${good_run}" | grep -q "appimagetool not found"; then
    echo "FAIL: the honest fixture failed for some other reason than the missing tool"
    echo "${good_run}" | sed 's/^/      /'
    fail=1
else
    echo "PASS: run in the same condition it exits ${good_status} — the same warning,"
    echo "      an exit code the caller can act on"
fi

# ── the shipped packaging scripts ───────────────────────────────────────────
if "${SC}" -S style "${PACKAGING_SCRIPTS[@]}" >/dev/null 2>&1; then
    echo "PASS: both packaging scripts are ShellCheck-clean (PKG-02/03)"
else
    echo "FAIL: a packaging script has a ShellCheck finding"
    "${SC}" -S style "${PACKAGING_SCRIPTS[@]}" 2>&1 | sed 's/^/      /'
    fail=1
fi

exit $fail
