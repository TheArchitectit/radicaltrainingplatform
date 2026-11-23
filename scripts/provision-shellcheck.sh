#!/usr/bin/env bash
# Provision ShellCheck for the R-24 gate without assuming python3-venv exists.
#
# Why this exists (SPEC-22 CI-01): CI provisioned ShellCheck with
# `python3 -m venv` + `pip install shellcheck-py`. The self-hosted `devgate-rtp`
# runner has Python 3.12 but no `ensurepip`, no `pip`, no `xz` and no `wget`, so
# venv creation fails and the R-24 gate never runs. The gate is correct — it
# fails closed — but it could never pass on that host.
#
# Resolution order (first wins, no network unless we reach step 3):
#   1. $SHELLCHECK already points at an executable  — the gate's own contract
#   2. `shellcheck` on PATH
#   3. download the pinned static release and extract with python3 stdlib
#      `lzma` + `tarfile` (the only decompressor present on the runner)
#   4. fail closed, named reason, exit 1 — never report an unearned pass
#
# On success prints the resolved binary path on stdout and a human note on stderr.
# Callers use:  SHELLCHECK="$(bash scripts/provision-shellcheck.sh)" || exit 1
set -u

# Pin lives here, not in the workflow, so there is one place to change it.
SC_VERSION="v0.11.0"
SC_SHA_ARCHIVE=""  # left empty deliberately: the release is fetched over TLS from GitHub

PREFIX="${SHELLCHECK_PREFIX:-/tmp/scvenv}"
BIN_NAME="shellcheck"

say() { printf '%s\n' "$*" >&2; }

have_exec() { [ -n "${1:-}" ] && [ -x "${1:-}" ]; }

# ── 1. explicit override ────────────────────────────────────────────────────
# A set-but-unusable $SHELLCHECK is a configuration error, not a request to go
# find another binary: falling through would silently ignore what the caller
# asked for. (Found by tests/gates/run_shellcheck_provision_fixtures.sh case 5,
# which is why that fixture exists.)
if [ -n "${SHELLCHECK:-}" ]; then
    if have_exec "${SHELLCHECK}"; then
        say "provision-shellcheck: using \$SHELLCHECK=${SHELLCHECK}"
        printf '%s\n' "${SHELLCHECK}"
        exit 0
    fi
    say "provision-shellcheck: FAIL — \$SHELLCHECK is set but is not an executable file: ${SHELLCHECK}"
    say "  unset \$SHELLCHECK to auto-provision, or point it at a real binary"
    exit 1
fi

# ── 2. PATH ─────────────────────────────────────────────────────────────────
if command -v "${BIN_NAME}" >/dev/null 2>&1; then
    p="$(command -v "${BIN_NAME}")"
    say "provision-shellcheck: using PATH ${p}"
    printf '%s\n' "${p}"
    exit 0
fi

# ── 3. pinned static release ────────────────────────────────────────────────
need() { command -v "$1" >/dev/null 2>&1 || { say "provision-shellcheck: FAIL — '${1}' is required and was not found on PATH"; exit 1; }; }
need curl
need python3
need tar

case "$(uname -s)" in
    Linux)  os="linux" ;;
    Darwin) os="darwin" ;;
    *)      say "provision-shellcheck: FAIL — unsupported platform $(uname -s); set \$SHELLCHECK or install shellcheck"; exit 1 ;;
esac
case "$(uname -m)" in
    x86_64|amd64) arch="x86_64" ;;
    aarch64|arm64) arch="aarch64" ;;
    *)             say "provision-shellcheck: FAIL — unsupported arch $(uname -m); set \$SHELLCHECK or install shellcheck"; exit 1 ;;
esac

url="https://github.com/koalaman/shellcheck/releases/download/${SC_VERSION}/shellcheck-${SC_VERSION}.${os}.${arch}.tar.xz"
archive="$(mktemp "${TMPDIR:-/tmp}/shellcheck.XXXXXX.tar.xz")"
trap 'rm -f "${archive}"' EXIT

say "provision-shellcheck: downloading ${url}"
if ! curl -fsSL --retry 3 --connect-timeout 20 -o "${archive}" "${url}"; then
    say "provision-shellcheck: FAIL — could not download ${url}"
    say "  supply a binary instead:  SHELLCHECK=/path/to/shellcheck bash scripts/provision-shellcheck.sh"
    exit 1
fi

if [ -n "${SC_SHA_ARCHIVE}" ]; then
    if command -v sha256sum >/dev/null 2>&1; then
        actual="$(sha256sum "${archive}" | awk '{print $1}')"
    else
        actual="$(python3 - "${archive}" <<'PY'
import hashlib, sys
h = hashlib.sha256()
with open(sys.argv[1], "rb") as f:
    for chunk in iter(lambda: f.read(1 << 20), b""):
        h.update(chunk)
print(h.hexdigest())
PY
)"
    fi
    if [ "${actual}" != "${SC_SHA_ARCHIVE}" ]; then
        say "provision-shellcheck: FAIL — archive hash mismatch (expected ${SC_SHA_ARCHIVE}, got ${actual})"
        exit 1
    fi
fi

# Extract with python3's stdlib: `tar -xJ` needs the `xz` binary, which the
# runner does not have, but python3's lzma module sets the binary up for us.
if ! python3 - "${archive}" "${PREFIX}" <<'PY'
import io, lzma, os, sys, tarfile

archive, prefix = sys.argv[1], sys.argv[2]
os.makedirs(prefix, exist_ok=True)
with lzma.open(archive) as f:
    blob = f.read()
with tarfile.open(fileobj=io.BytesIO(blob)) as tf:
    members = [m for m in tf.getmembers() if m.isfile() and os.path.basename(m.name) == "shellcheck"]
    if not members:
        sys.stderr.write("provision-shellcheck: FAIL — no 'shellcheck' file inside the archive\n")
        sys.exit(1)
    m = members[0]
    m.name = "shellcheck"           # flatten, ignore the version directory
    tf.extract(m, prefix, filter="data")
PY
then
    say "provision-shellcheck: FAIL — could not extract ${archive}"
    exit 1
fi

resolved="${PREFIX}/${BIN_NAME}"
if ! have_exec "${resolved}"; then
    chmod +x "${resolved}" 2>/dev/null || true
fi
if ! have_exec "${resolved}"; then
    say "provision-shellcheck: FAIL — extracted binary is not executable: ${resolved}"
    exit 1
fi

if ! ver="$("${resolved}" --version 2>/dev/null | sed -n 's/^version: //p')"; then
    say "provision-shellcheck: FAIL — ${resolved} does not run"
    exit 1
fi
say "provision-shellcheck: resolved ${resolved} (${ver})"
printf '%s\n' "${resolved}"
