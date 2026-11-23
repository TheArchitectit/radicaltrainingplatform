# AIGGP gate suite — what is wired, and what is not

**Reviewed and wired 2026-11-23.** Fleet truth: `TheArchitectit/AIGGP-Agentic-Framework`
(`templates/github-workflows/`, `scripts/secret-scan.sh`). This page records what
this repository adopted, what it deliberately did not, and the two defects that
only appeared on the runner.

## The gate the fleet sweep measures

The daily sweep hashes each repo's vendored `scripts/secret-scan.sh` and
compares it to the framework's canonical copy. This repo reported
`gate_sha256: null` — ungated — because the script was never committed, even
though a `.guardrails/secret-allowlist.json` built against it was.

It is now vendored byte-identically:

```
sha256  dc0a0c947b062a039db301649f9d40f945ab95e4f0f9b3c31088e34bee9a7389
```

Do not edit it. A change makes the next sweep report drift; adopt upstream's
copy wholesale instead.

## Workflows adopted (all on the fleet runner)

| Workflow | Triggers | Runner |
|---|---|---|
| `secret-validation.yml` | push/PR to main, dispatch | `[self-hosted, devgate-rtp]` |
| `guardrails-compliance.yml` | PR to main, dispatch | `[self-hosted, devgate-rtp]` |
| `drift-scan.yml` | nightly 04:23 UTC, dispatch | pinned to the fleet label |

`workflow_dispatch` was added to the guardrails template, which shipped
PR-only; without it the suite could not be run on demand.

**Drift-scan's runner is pinned on purpose.** The template places the scan job
with `${{ needs.resolve-target.outputs.runner }}`. `detect-host-ci.py` reports
the `runs-on:` flow sequence verbatim — the string
`"[self-hosted, devgate-rtp]"` — which is not a label any runner carries, so
the job would queue forever and report nothing. The resolution job stays for its
summary; placement is pinned.

## Deliberately not adopted

| Template | Why not |
|---|---|
| `file-size-check.yml` | `scripts/check-file-sizes.py` already enforces 500/600 lines with checked exemptions and a self-test, inside the freeze chain. The template would be a weaker second rule. |
| `smoke-gate.yml` | The chain already drives the built artifact in a browser (`tests/e2e/smoke-web.mjs`, `rehearsal-web.mjs`) and fails on console errors. |
| `spec-coherence.yml` | It invokes the DevGate hub service and a pinned runtime; this repo does not run that service. |

The repo's own chain is **not** extended with `secret-scan.sh`: the gate needs
`gitleaks`, and adding it to the chain would fail `build-linux` on a runner
without the scanner. The dedicated workflow owns provisioning.

## Two defects the template carried on this runner

1. **Rootless install.** `install -m 0755 gitleaks /usr/local/bin/gitleaks`
   is Permission denied on the fleet runner (the same rootless constraint
   SPEC-22 recorded for `/usr/share/dotnet`). The scanner now installs into
   `$RUNNER_TEMP/bin` and that directory is appended to `$GITHUB_PATH`.
   Measured: run `45211364161` failed at this step, before any scan.
2. **Machine-specific allowlist.** The 2026-09-24 allowlist recorded absolute
   workstation paths (`/mnt/data/git/...`), which the gate only strips against
   its own repo root — so on a CI checkout they matched nothing and eleven
   findings went uncovered. Every entry is now repo-relative. The gate matches
   `(rule, path)`, not lines, so per-line duplicates were merged (39 → 20).

## Findings at adoption

The gate raised 17 findings in the tree; all were false positives and are
dispositioned with a rule, a path and a reason — an IP address in a simulated
ticket message, the artifact-secrets gate's own exemption table, and a fixture
that plants a key on purpose.

The guardrails scanner raised 21 blocking findings. Twelve were inside the local
`.shellcheck-venv` (untracked, absent on a checkout) — excluded via
`.guardrailsignore`. The rest were study content: AWS's published example key,
synthetic lab seed keys, a placeholder in a docs snippet, and two same-origin
GET-only service-worker fetches. Six semantic findings (unhandled promise
chains) were **fixed**, not suppressed.

## Verified on the fleet, one head

All at `5e5b6c2`:

| Workflow | Run | Result |
|---|---|---|
| Build | `45219296517` | build-linux success (`ucs03-rtp`), build-winforms success |
| Secret Validation | `45219296457` | secret scan + .env check success (`ucs03-rtp`) |
| Drift Scan | `45223037875` | resolve + scheduled scan success (`ucs03-rtp`) |
| Guardrails Compliance | `45223044585` | all five jobs success (`ucs03-rtp`) |
