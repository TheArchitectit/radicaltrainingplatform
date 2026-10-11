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
| S47-04 (T-22) | Pages predeploy gate (imports, smoke, bundle check) | CI-03 | 2 | ✅ |
| S47-05 (T-23) | Tutor slice behind its gates, or recorded-example fallback | REQ-AI-01..07 | 3 | ✅ |
| S47-06 (T-24) | Option shuffling with stable IDs | R-09 | 1 | ✅ |
| S47-07 (T-25) | Packaging repairs PKG-01..04 + clean-install tests | SPEC-10 10.5 | 3 | 🟡 |
| S47-08 (T-41) | Installed-bundle content independence; Legacy bridge narrowing; release-link truth | R-19 | 2 | 🟡 |
| S47-09 (T-45) | ShellCheck gate + packaging behavior fixtures | R-24 | 1 | ⚪ |

**Status key:** ✅ shipped and verified on this host · 🟡 shipped and gated, with named verification gaps
listed under the row's *Not verified* notes in [SPRINT-47-EVIDENCE.md](SPRINT-47-EVIDENCE.md) · ⚪ not started.

**Evidence:** each completed row's shipped notes, findings, gates run and not-verified detail live in
[SPRINT-47-EVIDENCE.md](SPRINT-47-EVIDENCE.md), split out of this file when it passed the 500-line
document limit (CLAUDE.md).

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

**Evidence:** shipped notes, findings, gates run and not-verified detail are in
[SPRINT-47-EVIDENCE.md](SPRINT-47-EVIDENCE.md) § S47-01.

### S47-02 (T-20): Network+ Demo Cut
**Acceptance Criteria:**
- [x] 25 reviewed items, five per domain (N1–N5 cut outline per SPEC-05 05.6), labeled “exploratory coverage” — explicitly not exam-weighted, on screen
- [x] Two complete lessons: N5 troubleshooting, N1 networking concepts (synopses per SPEC-05 05.5)
- [x] Cross-track reuse (A+ DNS/DHCP material) explicitly mapped per REQ-NP-03 — provenance names both exam IDs, no duplicate item IDs
- [x] Declared gaps (subnetting drills, routing protocols, wireless design, packet analysis) render as labeled worked examples
- [x] RedEye lane logs complete

**Files:** `content/exams/COMPTIA-NET-009/`, `content/provenance/`

**Evidence:** shipped notes, findings, gates run and not-verified detail are in
[SPRINT-47-EVIDENCE.md](SPRINT-47-EVIDENCE.md) § S47-02.

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

**Evidence:** shipped notes, findings, gates run and not-verified detail are in
[SPRINT-47-EVIDENCE.md](SPRINT-47-EVIDENCE.md) § S47-03.

### S47-04 (T-22): Pages Predeploy Gate
**Acceptance Criteria:**
- [x] `pwa-deploy.yml` gains predeploy steps in order: `check-imports.py`; headless-browser smoke (open built artifact, wait for known route, zero console errors, one meaningful interaction); content-bundle check (every manifest-referenced asset exists with matching hash; no unreviewed corpus ships)
- [x] Gate proven to fail on a reintroduced bad import and on a missing pack asset
- [x] October 23 build smoke log archived

**Files:** `.github/workflows/pwa-deploy.yml`, `tests/e2e/smoke-web.mjs`, `scripts/check-content-bundle.py`, `RadicalTrainingPlatform.Web/content-bundle.json`, `tests/gates/run_smoke_fixtures.sh`, `tests/gates/run_content_bundle_fixtures.sh`, `docs/qa/release-evidence/2026-10-23-build-smoke.md`

**Evidence:** shipped notes, findings, gates run and not-verified detail are in
[SPRINT-47-EVIDENCE.md](SPRINT-47-EVIDENCE.md) § S47-04.

### S47-05 (T-23): Tutor Slice
**As a** student, **I want** a hint from the tutor inside stated limits, **so that** I get unblocked without an exam oracle.

**Acceptance Criteria:**
- [x] Restricted slice behind a backend gateway (browser never holds a provider key); input contract: learning questions only
- [x] Rehearsed evaluation set: demo prompts (“The website works by IP address but not by name. Give me one hint, not the answer.”; “I can reach another device on my subnet, but nothing outside it. What should I check first, and why?”) resolve to the reviewed DNS/gateway lessons without operating the simulation
- [x] Rehearsed refusal cases pass; corpus allowlist + citation validation active
- [x] Fallback: labeled recorded example if go/no-go fails — prewritten output clearly labeled not-live
- [x] Offline shows an explicit unavailable state
- [x] Framed as general IT-skills coaching over original lessons — never vendor-endorsed exam prep

**Files:** `services/ai-gateway/` (`corpus.json`, `contract.mjs`, `corpus.mjs`, `output.mjs`, `provider.mjs`, `pipeline.mjs`, `server.mjs`, `config.example.json`), `RadicalTrainingPlatform.Web/js/views/tutor-panel.js`, `RadicalTrainingPlatform.Web/js/core/TutorClient.js`, `RadicalTrainingPlatform.Web/js/data/tutor-recorded.js`, `RadicalTrainingPlatform.Web/js/app.js`, `RadicalTrainingPlatform.Web/js/views/lesson-reader.js`, `RadicalTrainingPlatform.Web/js/views/practice.js`, `RadicalTrainingPlatform.Web/css/study.css`, `tests/fixtures/tutor/{answerable,unsupported,injection,runtime}.json`, `tests/gates/tutor-eval.mjs`, `tests/gates/run_tutor_eval.sh`, `tests/gates/web/tutor-panel.mjs`, `scripts/check-artifact-secrets.py`, `tests/gates/run_artifact_secrets_fixtures.sh`, `.github/workflows/pwa-deploy.yml`, `docs/qa/release-evidence/2026-10-23-tutor-eval.md`

**Evidence:** shipped notes, findings, gates run and not-verified detail are in
[SPRINT-47-EVIDENCE.md](SPRINT-47-EVIDENCE.md) § S47-05.

### S47-06 (T-24): Option Shuffling
**Acceptance Criteria:**
- [x] Seeded option shuffle with stable item IDs; no scoring regression on multi-select

**Files:** `RadicalTrainingPlatform.Web/js/core/OptionShuffle.js` (new),
`RadicalTrainingPlatform.Web/js/views/practice.js`,
`RadicalTrainingPlatform.Web/js/core/ProgressStore.js`,
`tests/gates/web/option-shuffle.mjs` (new),
`tests/gates/fixtures/option-shuffle/check-shuffle.mjs` (new),
`tests/gates/fixtures/option-shuffle/live-render.mjs` (new),
`tests/gates/run_option_shuffle_fixtures.sh` (new), `.github/workflows/build.yml`

**Evidence:** shipped notes, findings, gates run and not-verified detail are in
[SPRINT-47-EVIDENCE.md](SPRINT-47-EVIDENCE.md) § S47-06.

### S47-07 (T-25): Packaging Repairs
**Acceptance Criteria:**
- [x] PKG-01: content bundle manifest (packs + metadata + hashes); clean-directory test loads known exam, count, question, errata correction, lesson; missing content dir = honest startup error
- [x] PKG-02: AppImage build falls back to tarball when appimagetool absent; failure never prints “Build complete.”
- [x] PKG-03 (recording): macOS script records actual signing/notarization results; universal claim requires a universal runtime
- [ ] PKG-03 (launch): **macOS smoke launches the bundle** — not run; no macOS host here
- [x] PKG-04 (manifest): Flatpak full 40-hex SHA pin, complete sources, launcher path matches the published apphost, permission review
- [ ] PKG-04 (run): **launcher verified in a real `flatpak-builder` run** — not run; `flatpak-builder` and the .NET SDK extension are not available here
- [x] Clean-install test for the Linux bundle (real build under a controlled PATH; tarball inspected)
- [ ] Clean-install test for the macOS and Flatpak bundles — not run; neither host is available
- [x] Release-link text corrected to build-from-source until a release exists
- [ ] ShellCheck gate + packaging fixtures — the fixtures landed here; the ShellCheck gate is S47-09

**Files:** `scripts/generate-bundle-manifest.py` (new), `content-manifest.json` (new, 91 entries),
`scripts/check-packaging-manifests.py` (new),
`packaging/install-bundle-content.py` (new), `packaging/macos/entitlements.plist` (new),
`packaging/linux/build-appimage.sh`, `packaging/macos/build-dmg.sh`,
`packaging/linux/app.radicaltrainingplatform.RadicalTrainingPlatform.yml`,
`packaging/linux/app.radicaltrainingplatform.RadicalTrainingPlatform.metainfo.xml`,
`RadicalTrainingPlatform.Core/Infrastructure/ContentBundle.cs` (new),
`RadicalTrainingPlatform.Core/Services/LessonCatalog.cs` (new),
`RadicalTrainingPlatform.Core/Infrastructure/IExamRepository.cs`,
`RadicalTrainingPlatform.Core/Services/Errata.cs`,
`RadicalTrainingPlatform.Core/ServiceCollectionExtensions.cs`,
`RadicalTrainingPlatform.Desktop/MainWindow.axaml.cs`,
`RadicalTrainingPlatform.Core.Tests/ContentBundleTests.cs` (new, 11 tests),
`RadicalTrainingPlatform.Core.Tests/CompositionRootTests.cs`,
`tests/gates/run_packaging_fixtures.sh` (new), `.github/workflows/build.yml`

**Evidence:** shipped notes, findings, gates run and not-verified detail are in
[SPRINT-47-EVIDENCE.md](SPRINT-47-EVIDENCE.md) § S47-07.

### S47-08 (T-41): Bundle Independence and Bridge Narrowing
**Requirement:** R-19 (NET-11, high). Acceptance: TM-54 plus a docs-truth fixture
asserting no link to a nonexistent release.

**Acceptance Criteria:**
- [x] Installed bundle works with no repository parent (content independence) — satisfied by
      S47-07's PKG-01; `ContentBundleTests.CleanDirectory_*` is TM-54, 257/257 Core tests green
- [x] Release links truthful — `scripts/check-release-links.py` + its fixture pair
- [x] Legacy bridge surface narrowed to what is implemented, and its error-response surface
      made honest — `scripts/check-legacy-bridge.py` + its fixture pair
- [ ] **Not verified:** the Legacy bridge's runtime behaviour. Its source compiles
      (`EnableWindowsTargeting=true`, 0 errors) but no Windows/WebView2 host exists on this
      fleet, so the unknown-type response is proven by inspection of the source, not by a run.

**Files:**
- `scripts/check-release-links.py` (new) — R-19 docs truth
- `scripts/check-legacy-bridge.py` (new) — R-05/R-19 bridge surface, static
- `tests/gates/run_release_truth_fixtures.sh`, `tests/gates/run_bridge_surface_fixtures.sh` (new)
- `tests/gates/fixtures/release-links/{good,bad}/README.md` (new)
- `tests/gates/fixtures/legacy-bridge/bad/…` (new, a deliberate miniature — not a copy of the
  real source, which would drift)
- `README.md` — download claims corrected
- `RadicalTrainingPlatform.Legacy.WinForms/LabSimulator/LabSimulatorBridge.cs`
- `.github/workflows/build.yml` — both gates wired into `build-linux`

**Evidence:** shipped notes, findings, gates run and not-verified detail are in
[SPRINT-47-EVIDENCE.md](SPRINT-47-EVIDENCE.md) § S47-08.

**Evidence:** shipped notes, findings, gates run and not-verified detail are in
[SPRINT-47-EVIDENCE.md](SPRINT-47-EVIDENCE.md) § S47-08.

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
