# OpenSpec SPEC-22 — CI Gate Repair: ShellCheck Provisioning and Windows Path Portability

**Change package:** `rtp-ci-gate-repair-2026-11`
**Status:** Closed 2026-11-23 — implemented and measured. Freeze chain **77/77 at `00aed23`**.
The Windows job conclusion is the one item this host cannot observe; see *Evidence* below.
**Base head:** `f0d82ca` on `main` (2026-11-23, the commit before this package's work)
**Requirements touched:** R-12 (README truth, unchanged), R-24 (ShellCheck gate), TM-75 (traceability)
**RedEye review lane:** required by SPEC-08A standing rule. This package changes **no** scored
item, no question key and no blueprint claim; the lane records `not-applicable` with that
reason rather than being silently omitted.
**Owner tripwires:** none triggered. HG-01 (code licence) untouched.

---

## Why this package exists

`main` has been red on two CI steps since at least 2026-11-22T19:34Z. Both are **gate
defects, not product defects** — the same failure class R-24 was written to remove, in the
gate rather than the code it guards. A red gate that is red for a reason unrelated to what
it tests trains everyone to ignore it, which is how a hollow gate survives.

Neither failure was introduced by the 2026-11-23 README change (`2914c17`, which touched
`README.md` only). Both reproduce on `f0d82ca`, the head before it.

| Step | Job | Failure |
|---|---|---|
| `ShellCheck gate (R-24)` | `build-linux` | `python3 -m venv` fails: `ensurepip` absent on the self-hosted runner |
| `Run tests` | `build-winforms` | 19 `PluginDiscoveryTests`/`PluginValidationTests` fail on Windows only |

---

## CI-01 — ShellCheck provisioning must not depend on `python3 -m venv`

**Defect (verified live, twice).** `.github/workflows/build.yml` provisions ShellCheck with:

```bash
python3 -m venv .shellcheck-venv
.shellcheck-venv/bin/pip install --quiet --disable-pip-version-check "shellcheck-py==0.11.0.1"
bash tests/gates/run_shellcheck_fixtures.sh
```

The `build-linux` job runs on `runs-on: [self-hosted, devgate-rtp]`. Inspected on the host
(container `devgate-runner-rtp`, Python 3.12.3):

```
$ python3 -c "import ensurepip"
ModuleNotFoundError: No module named 'ensurepip'
$ command -v pip3 pip xz wget
(all missing — curl, tar, python3 present)
```

So `venv` cannot be created, and the gate never reaches its own logic. The gate itself is
**correct**: it fails closed and prints how to supply ShellCheck rather than reporting an
unearned pass. The defect is the provisioning step's assumption that `venv` exists.

**Fix (exact).** Add `scripts/provision-shellcheck.sh`:

- Honours `SHELLCHECK` if already pointing at an executable (the gate's existing contract).
- Honours an existing `shellcheck` on `PATH`.
- Otherwise downloads the pinned upstream **static binary** release and extracts it with
  Python's stdlib `lzma` + `tarfile` — `ensurepip`, `pip`, and the `xz` binary are all
  absent on this runner, and `lzma` is the only decompressor available.
- Fails closed with a named reason and exit 1 if the binary cannot be obtained.
- Prints the resolved path and version, because findings are version-dependent.

`build.yml` calls the script instead of the inline venv block. The pinned version moves
into the script so there is one place to change it.

**Acceptance.** Fixture suite `tests/gates/run_shellcheck_provision_fixtures.sh`:

| Case | Expectation |
|---|---|
| `SHELLCHECK` points at a working binary | exit 0, prints that path, no download attempted |
| a `shellcheck` is already on `PATH` | exit 0, prints the PATH binary |
| neither, and download succeeds | exit 0, binary executes, version printed |
| neither, and download fails (unreachable URL) | exit 1, message names the failure, no false pass |
| resolved binary is not executable / wrong file | exit 1, message names the defect |

Plus the existing `tests/gates/run_shellcheck_fixtures.sh` must still pass **6/6** with the
provisioned binary. Canonical proof: `SHELLCHECK=/tmp/shellcheck-v0.11.0/shellcheck bash
tests/gates/run_shellcheck_fixtures.sh` prints `shellcheck: ... (0.11.0)` and six `PASS`
lines — verified this session on the runner.

**Not in scope.** Adding `python3-venv` to the runner image would also fix this, but the
runner image is deployed from the fleet repo and this repo only *records* it. Changing the
provisioning script is the smaller, testable, in-repo fix. If the image later gains
`python3-venv`, the script still works — it only uses venv never.

---

## CI-02 — Plugin tests must build paths with `Path.Combine`, not `/` literals

**Defect (verified on Linux, reproduced only on Windows).** Nineteen tests across
`PluginDiscoveryTests` and `PluginValidationTests` hardcode POSIX absolute paths:

```csharp
private const string BuiltInRoot = "/repo";      // PluginDiscoveryTests.cs:21
private const string PluginsRoot = "/plugins";   // PluginDiscoveryTests.cs:22
private const string Root = "/plugins/acme";     // PluginValidationTests.cs:18
```

and interpolate them with a forward slash:

```csharp
builtIn.ContentSearchRoot.ShouldBe($"{BuiltInRoot}/content");   // :196
```

Production code builds every path through `IFileProvider.CombinePath`, which is
`Path.Combine`. On Windows that yields `\repo\content`, so the in-memory provider's keys
(`/repo`, `/repo\content`) never match what discovery returns, and every assertion fails.

Verified: the same 19 tests **pass 19/19 on Linux** in the runner
(`dotnet test --filter PluginDiscoveryTests|PluginValidationTests` → `Failed: 0, Passed: 19`).
They fail only in `build-winforms`, on Windows.

**Fix (exact).** Give the tests one path helper and route every expectation through it, so an
expectation can never disagree with the provider that produced the value:

- Add `TestPaths.Root(...)` / a `Combine(params string[])` helper on `TestFileProvider` that
  delegates to `Path.Combine` — the same call production makes.
- Replace the `/`-interpolated expectations with that helper.
- Keep the literal test-tree construction readable by rooting it at a platform-agnostic base
  (`Path.Combine("repo")` style) rather than a leading `/`.

No production code changes. No assertion is weakened: the expectations become *stricter*,
because they now assert the same path the code under test is required to produce.

**Acceptance.** Fixture logic is the existing test suite itself, run on both legs:

| Case | Expectation |
|---|---|
| `dotnet test` on Linux | 19/19 plugin tests pass (baseline, already true) |
| `dotnet test` on Windows | 19/19 plugin tests pass (the repair) |
| A test that expects a POSIX-only literal | must not compile or must not be present — grep gate below |

Add `scripts/check-test-path-portability.py`: fails if any file under
`RadicalTrainingPlatform.Core.Tests/` contains a string literal beginning `/repo`, `/plugins`,
`/app` or `/appdata` used in an assertion. Fixtures: a file with such a literal fails; the
repaired tree passes. Wired into `build.yml` beside the other content/lint gates.

**Why a gate and not just a fix.** The defect is invisible on Linux CI. Without a gate, the
next person writes `/repo/...` again, the Linux leg stays green, and Windows breaks silently
until someone reads a red `build-winforms`. The gate makes the invisible visible on the leg
that runs everywhere.

---

## RedEye review lane record

**Lane:** `not-applicable` — no scored item, answer key, blueprint mapping or study claim is
created or changed by this package. The lane is recorded rather than omitted because the
standing rule (12:27:33) requires every OpenSpec to carry one. Provider remains `blocked` per
CARRY-FORWARD S48-01/S48-03; that blocker is unrelated to this work and is not resolved here.

---

## What this package deliberately does not decide

- Whether the runner image should also gain `python3-venv` and a baked-in ShellCheck. That
  is a fleet image change, recorded in `deploy/devgate-runner-rtp.container`, and belongs to
  the DevGate fleet repo. This package makes the repo-independent of that decision.
- The pre-existing ShellCheck style findings outside the packaging scripts (SC2164, SC2015,
  SC2329 across older gate runners). R-24 scopes the gate to the packaging scripts on
  purpose; widening it is a separate cleanup with its own fixture burden.
- Any change to R-12/README truth. The README-count gate is untouched and must stay green.

---

## Evidence at the landing head

Measured on this host on 2026-11-23 against `00aed23` on `main`:

- **Head:** `00aed23` (base `f0d82ca`). Working tree clean.
- **Freeze chain:** `bash tests/gates/run_freeze_chain.sh --expect-sha <full SHA>` →
  `FREEZE CHAIN: 77/77 at 00aed23`, exit 0. The chain now also runs the two new
  gates and the provisioning fixture suite.
- **ShellCheck fixtures:** `SHELLCHECK="$(bash scripts/provision-shellcheck.sh)"` then
  `bash tests/gates/run_shellcheck_fixtures.sh` → **6 PASS**, `shellcheck ... (0.11.0)`.
  The provisioned path was `/tmp/scvenv/shellcheck`, fetched by the script itself —
  no venv, no pip, no xz binary.
- **Provisioning fixtures:** `bash tests/gates/run_shellcheck_provision_fixtures.sh` →
  **5/5**: `$SHELLCHECK` honoured, PATH binary honoured, real download executed,
  unreachable URL fails closed, non-executable `$SHELLCHECK` rejected.
- **Plugin tests on Linux:** `dotnet test ... --filter PluginDiscoveryTests|PluginValidationTests`
  → `Failed: 0, Passed: 19`.
- **Portability gate:** `python3 scripts/check-test-path-portability.py` → PASS,
  and `--self-test` proves a POSIX-literal file fails it.

**Not observed from this host:** the `build-linux` and `build-winforms` job
conclusions at the landing head. The Linux leg's steps above are the same commands
CI runs; the Windows leg cannot be run here at all. The Windows repair is verified
by construction (every expectation now routes through `Path.Combine`, the same call
production makes) and by the Linux baseline staying 19/19 — not by a Windows run.
That is the honest limit of this evidence and it is recorded rather than implied.
