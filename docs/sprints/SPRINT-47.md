# Sprint 47: OpenSpec Sprints C+D — Demo Packs, Release Truth, Freeze and Rehearsal

**Phase:** 5 — Product-Track Enablement
**Source:** OpenSpec change package `rtp-beginner-tracks-2026-10` (docs/drive-ingest-2026-10-10), SPEC-11 Sprint C (Oct 17–19) + Sprint D (Oct 20–22)
**Duration:** Oct 17 – Oct 22, 2026
**Goal:** Complete the October 23 demo packs, make packaging/deploy claims honest, land the tutor slice (or its labeled fallback), then freeze and rehearse on the actual demo host.

**Reference package:** [OpenSpec package](../drive-ingest-2026-10-10/RTP-Beginner-Tracks-Openspec-Change-Package-A-Network-NCA75-v2.md) — requirements REQ-AP-02, REQ-NP-02, REQ-DEMO-01..06, REQ-AI-01..07, REQ-UI-06..08, CI-03, PKG-01..04, TM-40/TM-45/TM-50.

---

## Sprint Backlog — Part C (Oct 17–19)

| ID | Task | Requirements | Points | Status |
|---|---|---|---|---|
| S47-01 (T-19) | A+ cut complete: 24 reviewed items, 2 complete lessons | REQ-AP-02 | 3 | ✅ |
| S47-02 (T-20) | Network+ cut complete: 25 reviewed items, 2 complete lessons (five per domain) | REQ-NP-02 | 3 | ✅ |
| S47-03 (T-21) | Demo mode: seed, one-click reset, mode label, ephemeral store | REQ-DEMO-01..06, REQ-UI-07/08 | 3 | ✅ |
| S47-04 (T-22) | Pages predeploy gate (imports, smoke, bundle check) | CI-03 | 2 | ⚪ |
| S47-05 (T-23) | Tutor slice behind its gates, or recorded-example fallback | REQ-AI-01..07 | 3 | ⚪ |
| S47-06 (T-24) | Option shuffling with stable IDs | R-09 | 1 | ⚪ |
| S47-07 (T-25) | Packaging repairs PKG-01..04 + clean-install tests | SPEC-10 10.5 | 3 | ⚪ |
| S47-08 (T-41) | Installed-bundle content independence; Legacy bridge narrowing; release-link truth | R-19 | 2 | ⚪ |
| S47-09 (T-45) | ShellCheck gate + packaging behavior fixtures | R-24 | 1 | ⚪ |

## Sprint Backlog — Part D (Oct 20–22)

| ID | Task | Requirements | Points | Status |
|---|---|---|---|---|
| S47-10 (T-26) | Rehearsal on actual demo host: installed, offline, keyboard/projector, reset-between-groups | REQ-UI-06, REQ-DEMO-05, TM-40/45/50 | 2 | ⚪ |
| S47-11 (T-27) | Tutor evaluation report and go/no-go; fallback labeling check | REQ-AI-06/07 | 1 | ⚪ |
| S47-12 (T-28) | Screenshots/video backup; non-AI backup path | REQ-AI-07 | 1 | ⚪ |
| S47-13 (T-29) | Freeze: branch, base/head SHA, changed files, gate results, RedEye lane logs + seeded-defect self-test record, usable build | SPEC-11 11.7 | 1 | ⚪ |
| S47-14 (T-30) | Demo script final: 90-second loop (learn, try, ask, verify) + exact disclaimer + no-patient/no-business-system line | REQ-BRAND-02 | 1 | ⚪ |
| S47-15 (R-10) | LICENSE: prepare BSD-3-Clause decision record + README pointer; final file drop waits on owner confirmation (HG-01) | R-10, C-08/C-09 | 1 | ⚪ |

**Total:** 27 points. Sprint D explicitly excludes architecture migration and post-freeze content authoring.

---

## User Stories

### S47-01 (T-19): A+ Demo Cut
**As a** student at the October 23 demo, **I want** real A+ content to study, **so that** the learning loop demonstrates value.

**Acceptance Criteria:**
- [x] 24 reviewed items exactly: 16 Core 1 (A2/A5 — DNS purpose/symptom ×4, DHCP lease ×2, gateway role ×2, port recognition ×2, safe-test selection ×4, isolate-and-verify next-step ×2) + 8 Core 2 (B2/B4 — phishing signals ×3, ticket field/resolution-note ×3, change-control/backup ×2)
- [x] Two complete lessons: A2 “Networking basics”, B4 “Operational procedures” (synopses per SPEC-04 04.7)
- [x] Every cut item names lesson, objective ID, reviewer, provenance record; RedEye lane log present
- [x] Practice sets draw only from the 24 reviewed items and say so on screen
- [x] Remaining modules display as planned outlines; track shows “beginner preview”
- [x] ≥50% of pack items are diagnosis/next-action type (REQ-AP-06, CI-counted)

**Files:** `content/exams/COMPTIA-A-1201/`, `content/exams/COMPTIA-A-1202/`, `content/provenance/`

**Shipped (S47-01 notes):**

Cut map (24 items, type in provenance as the per-item front matter; bank markdown slices stay byte-stable so lane hashes hold):

| Bucket | Count | Items (A-1201 `core1-a2-fixtures.md` / A-1202 `core2-b2b4-fixtures.md`) | Type |
|---|---|---|---|
| DNS purpose/symptom | 4 | 1201 Q1, Q2, Q3, Q11 | 3 diagnosis, 1 recall |
| DHCP lease | 2 | 1201 Q5, Q6 | 1 diagnosis, 1 recall |
| Gateway role | 2 | 1201 Q7, Q8 | 1 diagnosis, 1 recall |
| Port recognition | 2 | 1201 Q4, Q12 | 2 recall |
| Safe-test selection | 4 | 1201 Q9, Q13, Q14, Q15 | 4 diagnosis |
| Isolate-and-verify next-step | 2 | 1201 Q10, Q16 | 2 diagnosis |
| Phishing signals (B2) | 3 | 1202 Q1–Q3 | 3 diagnosis |
| Ticket field / resolution note (B4) | 3 | 1202 Q4–Q6 | 2 diagnosis, 1 recall |
| Change-control / backup (B4) | 2 | 1202 Q7, Q8 | 2 diagnosis |

- **Diagnosis share:** 18/24 A+ = 75% (floor 50%). Pooled with the N+ draft bank: 22/29 = 76%. `scripts/check-item-types.py` counts `type: diagnosis` vs `type: recall` from provenance, fail-closed on untyped/unknown (never silently diagnosis).
- **Lessons released:** `a2.md` (Networking basics), `b4.md` (Operational procedures). Other modules stay `planned` outlines in `generate-study-content.py` / track overview. Track `previewLabel` is `beginner preview`.
- **Provenance:** `content/provenance/COMPTIA-A-1201/Q1..Q16.json`, `COMPTIA-A-1202/Q1..Q8.json` — each names `lesson`, `objectiveId`, `reviewer: redeye-lane`, `type`. `reviewDate` stays empty (no human source review has occurred; do not invent one).
- **RedEye lane:** logs under `content/review-logs/` for all 24 A+ items (plus the 5 N+ drafts), hashes bound to current item text + exam manifest + config. Verdicts are `return` / `modelStage: blocked` — the designed fail-closed state until radredeye key-vs-source integration. Ship-gate correctly excludes 100%; these are **draft** packs for the beginner preview, not released items.
- **Practice draw:** `practice.js` already filters `ITEMS` per exam and prints “draws only from reviewed items in this build.” Compiled `study-content.js` now carries 16 + 8 A+ items.
- **Manifest:** `COMPTIA-A-1202` `lessonIds` wire `b4` on 4.1–4.4/4.7 and `b2` on 2.5 (B2 stays a planned/partial module — no B2 lesson ships). `COMPTIA-A-1201` 2.1/2.2 now name `a2` so port/Wi-Fi coverage can compute honestly.
- **New gate:** `scripts/check-item-types.py` (+ `--self-test` failing/passing fixtures) wired in `build.yml` beside `generate-study-content.py --check` (drift gate).

**Not verified this row:** live Chromium walkthrough of the 24-item practice loop (S47-10 rehearsal owns demo-host evidence); human source review / `reviewDate`; radredeye model-stage verification (still blocked by design).

### S47-02 (T-20): Network+ Demo Cut
**Acceptance Criteria:**
- [x] 25 reviewed items, five per domain (N1–N5 cut outline per SPEC-05 05.6), labeled “exploratory coverage” — explicitly not exam-weighted, on screen
- [x] Two complete lessons: N5 troubleshooting, N1 networking concepts (synopses per SPEC-05 05.5)
- [x] Cross-track reuse (A+ DNS/DHCP material) explicitly mapped per REQ-NP-03 — provenance names both exam IDs, no duplicate item IDs
- [x] Declared gaps (subnetting drills, routing protocols, wireless design, packet analysis) render as labeled worked examples
- [x] RedEye lane logs complete

**Files:** `content/exams/COMPTIA-NET-009/`, `content/provenance/`

**Shipped (S47-02 notes):**

Cut map (25 items, type/lesson/cross-exam live in provenance; bank slices stay hash-stable). Numbers are unique per exam — provenance filenames are `Q{n}.json` with no bank qualifier, so the N5 bank keeps Q1–Q5 and the four new banks continue Q6–Q25 (never renumbered).

| Domain | Bank | Items | Bucket (count) | Type |
|---|---|---|---|---|
| N1 | `net009-n1-fixtures.md` | Q6–Q10 | address/mask/gateway/DNS roles (Q6–Q7), protocol-port pairing (Q8), OSI layer (Q9), subnet purpose (Q10) | 3 diagnosis, 2 recall |
| N2 | `net009-n2-fixtures.md` | Q11–Q15 | VLAN purpose (Q11–Q12), switching vs routing (Q13), wireless security mode (Q14), physical install (Q15) | 4 diagnosis, 1 recall |
| N3 | `net009-n3-fixtures.md` | Q16–Q20 | baseline vs incident (Q16–Q17), diagram/inventory (Q18), change-management sequence (Q19), recovery/RPO (Q20) | 3 diagnosis, 2 recall |
| N4 | `net009-n4-fixtures.md` | Q21–Q25 | segmentation purpose (Q21–Q22), auth factor (Q23), threat recognition (Q24), hardening judgment (Q25) | 4 diagnosis, 1 recall |
| N5 | `net009-n5-fixtures.md` | Q1–Q5 (pre-existing) | method step (Q1–Q2), tool-to-symptom (Q3–Q4), performance vs fault (Q5) | 4 diagnosis, 1 recall |

- **Diagnosis share (N+ pack):** 18/25 = 72%. Pooled with A+: 36/49 = 73% (`scripts/check-item-types.py`).
- **Lessons released:** `n1.md` (Networking concepts — mailing-analogy layers, ports, IPv4/subnetting purpose, DNS resolution path + DHCP lease lifecycle at N+ depth, media, cloud at concept level, failed-client scenario walkthrough) and `n5.md` (already shipped). N2–N4 stay `planned` outlines. Scenario lessons N1s–N5s are out of this row’s acceptance (two complete lessons only).
- **Cross-track reuse (REQ-NP-03):** Q6 and Q7 carry `crossExamIds: ["COMPTIA-A-1201", "COMPTIA-NET-009"]` plus a `crossExamReuse` note (A+ A2 DNS/DHCP concept at Network+ path/lifecycle depth). Distinct item IDs; never counted as independent evidence in both tracks. Q1–Q10 stems of the A+ bank were not copied.
- **Exploratory coverage label:** `track-netplus/track.json` gains `coverageLabel: "exploratory coverage — not exam-weighted"`; `track-overview.js` and `practice.js` render it. Track `previewLabel` stays `beginner preview`.
- **Declared gaps (REQ-NP-04):** the four `exam.json` gaps render as labeled worked examples (`workedExamples` on the manifest — subnetting drill /26, routing-protocol recognition, wireless design walk-through, packet-capture reading). `track-overview.js` shows the gap tag list plus each `worked example` card. No fake interactivity.
- **Provenance:** `content/provenance/COMPTIA-NET-009/Q1..Q25.json` — each names `lesson`, `objectiveId`, `reviewer: redeye-lane`, `type`. `reviewDate` stays empty (no human source review; do not invent one).
- **RedEye lane:** logs under `content/review-logs/COMPTIA-NET-009/` for all 25 items (A+ logs refreshed too). Verdicts `return` / `modelStage: blocked` — designed fail-closed state. Ship-gate (`redeye-gate.py --all`) excludes 100%; draft packs for the beginner preview, not released items.
- **Manifest `lessonIds`:** N1 objectives 1.1/1.3–1.8 name `n1`; N2 2.1–2.4 name `n2`; N3 3.1–3.5 name `n3`; N4 4.1–4.3 name `n4`; N5 unchanged (5.1/5.4/5.5 → `n5`). Only N1/N5 objectives with released items count as covered (REQ-MAN-07).
- **Gates run:** lint 29 files/1647 questions; item identity 0 semantic collisions; item types 36 diagnosis / 13 recall / 0 untyped (73%); brand pass; import graph pass; study-content drift clean; web runtime fixtures 15/15; brand fixtures pass; redeye-gate self-test pass. Brand gate caught a literal “approved” inside the Q19 change-control stem (endorsement-string adjacency) — reworded to “signed off” / “scheduled window” and re-passed.

**Not verified this row:** live Chromium walkthrough of the Network+ practice loop (S47-10 owns demo-host evidence); human source review / `reviewDate`; radredeye model-stage verification (still blocked by design); N1s–N5s scenario lessons and `netplus-gw-01` gateway task (S47-03 / SPEC-07 surface).

### S47-03 (T-21): Demo Mode
**As a** presenter rotating student groups, **I want** seeded deterministic scenarios with one-tap reset, **so that** every group starts clean.

**Acceptance Criteria:**
- [x] Each scenario declares a fixture seed; entering demo mode loads that seed exactly
- [x] All 44 existing + 6 new scenarios boot, run, and correctly report incomplete-then-complete in demo mode (TM-45 sweep report names each scenario ID and result)
- [x] One-click station reset clears `progress/` and `scenario/` keyspaces, reseeds all fixtures, verified by each validator’s negative path; confirmed via reseed verification pass
- [x] “Demo mode” label on every screen; synthetic data only; zero outbound calls from simulator content; no identity collection anywhere
- [x] Projector-readable, keyboard-operable, no hover-only affordances on the demo path
- [x] Completion panel tells the truth: conditions met/unmet, requested vs actual, action trace; mastery/qualification/readiness claims are forbidden strings (snapshot-tested)
- [x] Observation tasks require a recorded interpretation response — visiting without responding fails

**Files:** `Web/js/core/DemoMode.js`, `Web/js/core/CompletionPanel.js`, `Web/js/components/DemoBanner.js`, `Web/js/views/demo-mode.js`, `Web/js/views/scenarios.js`, `Web/js/core/StateStore.js`, `Web/js/core/ProgressStore.js`, `Web/index.html`, `Web/css/study.css`, `tests/gates/web/{demo-mode,demo-independence,demo-sweep-report,completion-panel-snapshot}.mjs`, `tests/gates/web/lib/scenario-walkthroughs.mjs`, `docs/qa/release-evidence/2026-10-11-demo-sweep.md`

**Shipped (S47-03 notes):**

Demo mode is its own module (`core/DemoMode.js`), not learner mode with the sign-in hidden. It takes the scenario registry as an argument rather than importing it, so "which scenarios exist" stays in one place and `core/` keeps no view-layer dependency.

- **Seeds (REQ-DEMO-01).** Every scenario in the catalog declares `fixtureSeed` — an FNV-1a hash of its id, so it is deterministic, distinct, and reproducible without a table to maintain. `demo.enter()` calls `declaredSeeds()` (which *refuses* a scenario that declares none rather than defaulting), then loads each seed exactly, then persists the mode flag so a mid-demo reload stays in demo mode with the same station. `rngFor(id)` refuses an unknown scenario rather than inventing a seed; `makeRng` is mulberry32.
- **One-click reset (REQ-DEMO-05).** `demo.resetStation()` → `progress.clearStation()` (clears the `progress/` and `scenario/` keyspaces only — simulator fixtures are untouched) → `state.reset()` (reseeds fixtures) → `verifyReseed()` → emits `demo:stationReset`. `verifyReseed` is a real check, not an assertion: for each scenario it compares the loaded seed to the declared one *and* drives the validator's negative path on the fresh station; a validator that throws is reported as **failed**, never as clean.
- **Mode label (REQ-DEMO-02).** `#demo-banner` lives in the app shell in `index.html`, outside `#view-container`, so the router cannot swap it out — that structural fact is what makes "on every screen" true, and `demo-independence.mjs` asserts it. `body.demo-mode` raises the base font size to 18px for projector legibility; the demo controls are real `<button>` elements.
- **Completion panel (REQ-DEMO-06).** `core/CompletionPanel.js` is a pure string builder (no DOM, no clock, no storage), so the forbidden-string snapshot is deterministic. It reports conditions met/remaining, `Requested:` vs `Actual:` per condition, the action trace, and whether the run was recorded. `FORBIDDEN_CLAIM_STRINGS` (mastery / job-qualified / certification-ready families) is exported so the fixture reads the same list the module enforces.
- **Observation tasks.** 22 objectives across 14 scenarios became `observation: true` — completion needs the route *and* a recorded `{action:'interpretation', scenarioId, objectiveId, response}` trace entry. `lcm-01/obj-1` was deliberately **not** converted: it requires a real `ranAction(t,'lcm-scan')`, and calling that an observation would have been false. A blank or cross-scenario interpretation does not complete an objective (fixture-tested).
- **TM-45 report.** `docs/qa/release-evidence/2026-10-11-demo-sweep.md` names all 46 scenarios with their fresh-station result (incomplete) and post-walkthrough result (complete). Generated by `demo-sweep-report.mjs`; `DEMO_SWEEP_OUT` writes it to disk.
- **Independence.** `demo-independence.mjs` scans `Web/js/**` for outbound primitives (zero found), treats `sw.js` separately and narrowly (its cache-revalidation `fetch` must bail on cross-origin before touching the network), stubs fetch/XHR/WebSocket/EventSource/sendBeacon and drives a full walkthrough (zero calls recorded), and asserts no learner-identity surface. The header's simulated `admin` label was relabelled `admin (simulated)` — it is Prism chrome, not an account.

**Findings recorded this row:**

- **`us-04`/`us-05` mis-attribution.** The observation conversion script guessed the owning scenario from surrounding context and attributed the Files-view objectives to `us-04` instead of `us-05`. `scenario-sweep.mjs` caught it (`us-05/obj-1: unmet after walkthrough — the Files view was opened but no interpretation response was recorded`). A genuine bug the fixture found, not a fixture artefact.
- **`Object.keys(localStorage)` is not a Storage API.** `StateStore.keys()` originally enumerated with it and returned nothing — under the fixture stub and in some embedders it yields method names, not stored keys. Replaced with the DOM-standard `length` + `key(i)` walk (`#localKeys()`). `clear()` had the same latent bug, and additionally skipped entries by removing during an index walk; it now snapshots keys first.
- **`ProgressStore.clearExam` left item records behind.** It deleted only the summary and continuation, so a reset looked clean and was not. It now enumerates by prefix.
- **Scenario count is 46, not 50.** The plan's "44 existing + 6 new" counts 4 NCA scenarios that land in Sprint 48 (T-35); they are not in this build. The sweep report and the fixtures say so plainly instead of padding the count.

**Gates run:** web runtime fixtures 23/23 (+ self-test correctly failing); `check-imports` pass; `check-brand` pass (warn: demo script not yet authored — T-30); `check-item-types` 49 scored, 0 untyped (73% diagnosis); `check-item-identity` 0 semantic collisions; `validate-manifests` pass; `generate-study-content --check` no drift; `redeye-gate --self-test` pass; `redeye-gate --all` exit 0; `lint-content` 29 files/1647 questions; `scan-scenario-validators` pass; `check-coverage` 92.62% ≥ 70%; `dotnet build Core` 0 warnings/0 errors; `dotnet test Core.Tests` 246/246.

**Not verified this row:** live Chromium walkthrough of demo mode on the demo host (S47-10 owns demo-host evidence); real-browser keyboard/projector behaviour — the legibility and button checks are static, not a rendered measurement; human source review / `reviewDate`; RedEye model-stage verification (still blocked by design); the 4 NCA scenarios (Sprint 48 / T-35).

### S47-04 (T-22): Pages Predeploy Gate
**Acceptance Criteria:**
- [ ] `pwa-deploy.yml` gains predeploy steps in order: `check-imports.py`; headless-browser smoke (open built artifact, wait for known route, zero console errors, one meaningful interaction); content-bundle check (every manifest-referenced asset exists with matching hash; no unreviewed corpus ships)
- [ ] Gate proven to fail on a reintroduced bad import and on a missing pack asset
- [ ] October 23 build smoke log archived

**Files:** `.github/workflows/pwa-deploy.yml`, `scripts/check-imports.py`, content-bundle checker

### S47-05 (T-23): Tutor Slice
**As a** student, **I want** a hint from the tutor inside stated limits, **so that** I get unblocked without an exam oracle.

**Acceptance Criteria:**
- [ ] Restricted slice behind a backend gateway (browser never holds a provider key); input contract: learning questions only
- [ ] Rehearsed evaluation set: demo prompts (“The website works by IP address but not by name. Give me one hint, not the answer.”; “I can reach another device on my subnet, but nothing outside it. What should I check first, and why?”) resolve to the reviewed DNS/gateway lessons without operating the simulation
- [ ] Rehearsed refusal cases pass; corpus allowlist + citation validation active
- [ ] Fallback: labeled recorded example if go/no-go fails — prewritten output clearly labeled not-live
- [ ] Offline shows an explicit unavailable state
- [ ] Framed as general IT-skills coaching over original lessons — never vendor-endorsed exam prep

**Files:** `services/ai-gateway/`, Web tutor panel, evaluation harness

### S47-06 (T-24): Option Shuffling
**Acceptance Criteria:**
- [ ] Seeded option shuffle with stable item IDs; no scoring regression on multi-select

### S47-07 (T-25): Packaging Repairs
**Acceptance Criteria:**
- [ ] PKG-01: content bundle manifest (packs + metadata + hashes); clean-directory test loads known exam, count, question, errata correction, lesson; missing content dir = honest startup error
- [ ] PKG-02: AppImage build falls back to tarball when appimagetool absent; failure never prints “Build complete.”
- [ ] PKG-03: macOS script records actual signing/notarization results; universal claim requires universal2 build; macOS smoke launches the bundle
- [ ] PKG-04: Flatpak full SHA pin, complete sources, launcher path verified in a real flatpak-builder run, permission review
- [ ] Clean-install test per bundle; release-link text corrected to build-from-source until a release exists
- [ ] ShellCheck gate + packaging fixtures (S47-09)

**Files:** `packaging/linux/`, `packaging/macos/`, packaging scripts, `tests/`

### S47-08 (T-41): Bundle Independence and Bridge Narrowing
**Acceptance Criteria:**
- [ ] Installed bundle works with no repository parent (content independence)
- [ ] Legacy bridge surface narrowed; release links truthful

### S47-09 (T-45): ShellCheck + Packaging Fixtures
- ShellCheck gate in CI; packaging behavior fixtures for PKG-02/03 fallbacks

### S47-10 (T-26): Demo Host Rehearsal
**Acceptance Criteria:**
- [ ] On the actual demo host: install → boot → full loop (pick track, read lesson, practice, complete scenario, reset) with network unplugged except optional tutor call
- [ ] Keyboard-only walkthrough passes; projector-distance readability verified
- [ ] Reset-between-groups verified with reseed verification
- [ ] Critical flow matrix (TM-50) entries for PWA-on-ChromeOS and PWA-on-presenter-host verified with recorded evidence

### S47-11 (T-27): Tutor Go/No-Go
- Evaluation report from the rehearsed set; explicit go/no-go; fallback labeling verified if no-go

### S47-12 (T-28): Backup Evidence
- Screenshots/video captured; non-AI backup path rehearsed

### S47-13 (T-29): Freeze
**Acceptance Criteria:**
- [ ] Branch, base/head SHA, changed files, gate results with counts (“N/N at SHA”), RedEye lane logs + seeded-defect self-test record, usable build — all recorded
- [ ] No content edits after freeze; no architecture migration in Sprint D

### S47-14 (T-30): Demo Script
- 90-second loop script (learn, try, ask, verify) with the exact REQ-BRAND-02 disclaimer and the “no patient or business system is involved” line

### S47-15 (R-10): LICENSE Decision Record
**As an** owner, **I want** the missing LICENSE resolved honestly, **so that** README claims match reality.

**Acceptance Criteria:**
- [ ] Decision record + README pointer prepared in advance of the owner confirmation (HG-01 — the package's sole standing code-license gate)
- [ ] Final LICENSE file drop happens only after one-line owner confirmation of the BSD-3-Clause text
- [ ] Docs note distinguishes code license, original content, and third-party material (Plan v2 C-08); adding it does not license vendor manuals or question banks (C-09)

---

## Sprint Acceptance (October 23 demo-ready definition, SPEC-00 00.5)

A presenter can open the PWA on the demo host, pick track-aplus or track-netplus, read one complete lesson per exam, run a scored practice set of reviewed original items, complete a deterministic simulated help-desk task, ask the tutor for a hint inside its stated limits (or play the labeled recorded example), reset the station for the next group — all with the network cable unplugged except the optional tutor call. Coverage labeled “beginner preview”; no pass-prediction claim anywhere; every SPEC-08/10 gate green at the tested head including the vulnerability gate proven by a must-fail fixture. Release evidence records gate counts at the frozen head.
