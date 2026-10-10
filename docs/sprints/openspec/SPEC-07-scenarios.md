# OpenSpec SPEC-07 — Deterministic Scenarios and the Shared Ticket Renderer

**Source:** [OpenSpec package rtp-beginner-tracks-2026-10](../../drive-ingest-2026-10-10/RTP-Beginner-Tracks-Openspec-Change-Package-A-Network-NCA75-v2.md), SPEC-07
**Executed in:** [SPRINT-46](../SPRINT-46.md) (T-13, T-14) + [SPRINT-48](../SPRINT-48.md) (T-35) · **Gates:** TM-45 series · **Depends on:** nothing for repairs (R-02 lands in Sprint 46 alongside); new scenarios depend on the ticket renderer

## Purpose

Make “scenario complete” mean something. Today 27 of 78 simulator objectives validate with `() => true` (verified at the audited head); the runtime audit measured 16 of 44 scenarios auto-passing from a fresh seed, and `us-bucket-01` unpassable. This spec sets the validation contract every scenario — existing and new — must meet, and adds the two CompTIA ticket scenarios and four NCA beginner scenarios.

## Validation contract (normative)

| ID | SHALL | Scenario |
|---|---|---|
| REQ-SC-01 | Every scenario objective validates against simulated configuration/action state only. `validate: () => true` and any seed-state-satisfying validator are forbidden; CI statically scans `Web/js/views/scenarios.js` (and any scenario registry) for constant-true validators and fails on a hit. | Fixture scenario containing `validate: () => true` fails the CI scan naming the scenario and objective IDs. |
| REQ-SC-02 | Fresh-seed negativity: from the deterministic seed, every objective of every scenario evaluates false before any learner action. The demo sweep (TM-45) asserts this per scenario. | Sweep evaluates all 78+ objectives with zero actions → zero objectives report complete. |
| REQ-SC-03 | Solvability: every scenario has a recorded action-script walkthrough reaching 100% completion; the sweep replays it and asserts pass. `us-bucket-01` is the named repair: its objective (bucket “lab-backups” with versioning and lifecycle policy) must become achievable through real UI mutation paths, or the scenario is corrected to what the simulator can actually mutate — the executor documents which. | us-bucket-01 walkthrough replayed against the release build → completes; replay log archived as evidence. |
| REQ-SC-04 | Wrong-state negativity: for each new scenario, at least one negative fixture proves an incorrect final state fails — e.g., DNS set to a wrong-but-plausible server fails `aplus-dns-01`. | No incorrect state passes; each failure message names the unmet objective. |
| REQ-SC-05 | No real infrastructure calls. Scenario actions mutate only the simulated StateEngine store; a network spy in E2E asserts zero outbound requests during scenario runs; simulation is labeled in the UI. | Scenario run under the spy: outbound request count is zero; “simulated environment” label visible. |
| REQ-SC-06 | Reset restores the exact seed. After any dirty run, one reset returns every validated value to seed (REQ-DEMO-03), proven per scenario in the sweep. | Sweep: dirty run → reset → validators re-evaluate exactly as on fresh seed. |

## Validator implementation guidance (normative)

A validator is a **pure function over the simulated store plus the recorded action trace**: `(state, trace) -> { passed, unmetConditions[] }`. It reads only declared collections (per scenario fixture), never wall-clock time, never random sources, never network. The action trace records semantic actions (field-set, route-entered, test-run, note-submitted) with stable IDs — which is what makes walkthrough replay and the evidence panel possible. When a view lacks a mutation the scenario needs (the us-bucket-01 class), the fix is in the view or the scenario — chosen explicitly and recorded — **never in the validator**. Validators live beside the scenario registry with their fixtures; the CI scan (REQ-SC-01) and the sweep (TM-45) run the same evaluation entry point the UI uses, so a divergent “test-only” validator is impossible.

## New scenario: aplus-dns-01 (help desk ticket, wrong DNS)

Renderer: `Web/js/views/ticket-lab.js` — synthetic ticket pane plus a workstation configuration panel (IP, gateway, DNS fields) over the shared StateEngine. Flow: learner reads a synthetic ticket (“website works by IP, not by name”), compares configuration, chooses a safe test from a fixed set (ping IP, ping name, nslookup), changes only the simulated DNS value, writes a short resolution note. The validator checks the **final DNS value AND the recorded diagnosis step AND the resolution note’s non-emptiness** — not a clicked button. Acceptance: seeded wrong-DNS state fails; correct DNS + recorded test + note passes; wrong DNS variant fails (REQ-SC-04); reset reseeds.

## New scenario: netplus-gw-01 (wrong default gateway)

Same renderer, different task: learner identifies a wrong default gateway on the synthetic workstation, applies the fix, then verifies restored connectivity via the simulated test set. Includes a compact topology panel (two subnets, one router icon — an illustration, not a router emulator). Validator confirms the correct gateway value, an appropriate verification test, and the completed verification step. Reset supports rotating student groups (REQ-DEMO-03).

## New NCA scenarios (beginner set)

- **nca-tool-01:** given a task description, pick the right tool (Move, NGT, Foundation, Witness, SSR, X-Ray, Collector) from the simulator’s tool list; validator checks the selection against the manifest’s tool/objective mapping.
- **nca-vm-01:** create and connect a VM in the PE simulator. The existing create-VM scenario validates some resource details only through the VM-name test (verified: mci-01 checks name, disk image, NIC subnet, power state as separate objectives, but scenario-level completion is name-anchored); the strengthened validator checks requested vCPU count, memory, NIC network and final power state as required objective state.
- **nca-maint-01:** order a safe maintenance sequence (e.g., host eviction checks before LCM upgrade) from shuffled steps; validator checks exact order.
- **nca-alert-01:** interpret a seeded alert and select the next step; validator checks the selection and requires the learner to open the alert detail first (state-recorded), so “click the right answer without reading” fails.

## Files

**New:** `Web/js/views/ticket-lab.js`; scenario entries appended to `Web/js/views/scenarios.js` or a new `scenarios-beginner.js` registry (executor picks, records choice); `tests/e2e/demo-sweep.spec.js`; `scripts/scan-scenario-validators.py`; fixtures under `tests/fixtures/scenarios/`.

**Modified:** `Web/js/views/scenarios.js` (repairs per R-02), `Web/js/app.js` (route registration if a new registry is added), `StateEngine.js` only if seed/reset support is missing (executor documents the delta).
