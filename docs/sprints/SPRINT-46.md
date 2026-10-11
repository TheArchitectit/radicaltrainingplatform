# Sprint 46: OpenSpec Sprint B — One Learning Loop, End to End

**Phase:** 5 — Product-Track Enablement
**Source:** OpenSpec change package `rtp-beginner-tracks-2026-10` (docs/drive-ingest-2026-10-10), SPEC-11 Sprint B (Oct 13–16)
**Duration:** Oct 13 – Oct 16, 2026
**Goal:** Complete one deterministic learning loop — track picker → lesson → practice → scenario → progress → reset — and repair the scenario validator field so no demo scenario can auto-pass or be unpassable.

**Reference package:** [OpenSpec package](../drive-ingest-2026-10-10/RTP-Beginner-Tracks-Openspec-Change-Package-A-Network-NCA75-v2.md) — requirements REQ-UI-01..08, REQ-BRAND-01/02, REQ-SC-01..06, R-02/R-05/R-06/R-13..R-16, CI-02, test matrix TM-20/TM-40/TM-45.

---

## Sprint Backlog

| ID | Task | Requirements | Points | Status |
|---|---|---|---|---|
| S46-01 (T-11) | Track picker, lesson reader, practice view | REQ-UI-01..03, REQ-BRAND-01/02 | 3 | ✅ |
| S46-02 (T-12) | ProgressStore + wiring + E2E save/reload/failure tests | REQ-UI-04/05, R-06 | 3 | ✅ |
| S46-03 (T-13) | `ticket-lab.js` renderer; aplus-dns-01 + netplus-gw-01 with validators and negative fixtures | REQ-SC-01..06 | 3 | ✅ |
| S46-04 (T-14) | Scenario validator sweep repairs (all 44; us-bucket-01) | R-02, REQ-DEMO-06 | 3 | ✅ |
| S46-05 (T-15) | Bridge handlers: real effects or removal; desktop SessionStore consumption | R-05, R-06 | 2 | ✅ |
| S46-06 (T-16) | Catalog tests, multi-select scoring tests, save/reload/error tests | REQ-MAN-05, L-06 | 2 | ✅ |
| S46-07 (T-17) | Lint extension + manifest validator in CI | SPEC-10 10.6 | 2 | ✅ |
| S46-08 (T-18) | Coverage threshold enforcement | CI-02 | 2 | ✅ |
| S46-09 (T-37) | Semantic item identity for legacy banks + collision detector; retry outcome-set policy | R-13, R-14 | 2 | ✅ |
| S46-10 (T-38) | Study-continuation restore; streak/Skip repairs | R-15, R-17 | 2 | ✅ |
| S46-11 (T-39) | Disposal guards on cached simulator references | R-16 | 1 | ✅ |
| S46-12 (T-40) | PDF export: canonical ID vs display label; vendor-neutral footer; atomic session save + corrupt recovery | R-18, R-20 | 2 | ✅ |
| S46-13 (T-44) | Storage recovery boundary tests (corrupt entry, quota, blocked) | R-23 | 1 | ✅ |
| S46-14 (T-42) | CefGlue NoSandbox scoped hardening review + navigation allowlist decision | R-21 | 1 | ✅ |
| S46-15 (T-43*) | Web runtime batch remainder (if not closed in Sprint 45) | R-22 | 1 | ⚪ |

**Register note (Sprint 45):** T-43's cosmetic bullet (placeholder/breadcrumb labels + snapshot fixtures) slipped to this sprint — the seven functional R-22 bullets landed in Sprint 45 with per-bullet fixtures (commits 5decbaf..0c84562); only the cosmetics remain.

**Total:** 31 points

---

## User Stories

### S46-01 (T-11): Study Views
**As a** learner, **I want** to pick a track, read a lesson, and run scored practice, **so that** the learning loop exists in the PWA.

**Acceptance Criteria:**
- [x] `track-picker.js` at route `/tracks` renders three tracks from manifests only — no hardcoded track strings; shows coverage %, “beginner preview” label, exact REQ-BRAND-02 disclaimer byte-for-byte
- [x] `lesson-reader.js` renders reviewed lesson markdown with objective IDs from the manifest; unreviewed modules render as “planned”, never dead links
- [x] `practice.js` runs scored sets: single/multi-select, immediate review with explanations, scoring identical to Core rules; assessment mode hides hints and tutor until submission
- [x] Ordering-type items render only after the Sprint 45 ordered-response work lands
- [x] Routes registered in `app.js` (47 → 50); `sw.js` precaches new assets
- [x] Brand check `scripts/check-brand.py` fails on forbidden strings (“approved”, “official”, “certified by”, vendor marks)
- [x] Disclaimer snapshot test pins the exact REQ-BRAND-02 string on track picker, exam overview, demo script

**Files:** `Web/js/views/track-picker.js`, `Web/js/views/lesson-reader.js`, `Web/js/views/practice.js`, `Web/js/app.js`, `Web/index.html`, `Web/sw.js`, `Web/css/study.css`, `scripts/check-brand.py`

**Notes (S46-01 close, 2026-10-11):**
- Route count: OpenSpec said "47 → 50" (3 routes) but the loop needs 4 — track-overview (`/tracks/:trackId`) is the exam-overview surface REQ-UI-02's disclaimer requirement lives on. Registering 4 (47 → 51) is the honest reading; the OpenSpec file's "register 4 new routes — 47 to 51" (section 03.3) confirms it.
- Ordered items: none exist in the released banks (all choice), so the ordered-path is exercised by `tests/gates/web/practice-grading.mjs` against the Core-ported `grade()` rather than live bank items. Rendering gate holds anyway — generator would flag a mismatch.
- Demo-script disclaimer: no demo script exists yet (Sprint 47 T-30). `check-brand.py` warns loudly each run naming the pending surface, and the snapshot fixture reports it "pending" instead of silently claiming coverage. Enforcement auto-arms when the script is authored.
- Grading parity: `grade()` in practice.js is a direct port of Core `ExamSessionViewModel.Grade` (set equality for choice, exact sequence for ordered); the fixture pins the JS side — S46-06 pins the Core side with the same vectors.
- Verified in a real browser (Playwright/Chromium): picker → track → released A2/N5 lessons → practice golden path (correct, wrong, multi) → results with per-item marks → restart → NCA empty state; zero console errors. Not verified in CI yet (next push).

### S46-02 (T-12): ProgressStore
**As a** learner, **I want** progress to survive reloads and app restarts, **so that** multi-day study works.

**Acceptance Criteria:**
- [x] `ProgressStore.js` wraps StateStore (IndexedDB `RadicalTrainingPlatformLab`, localStorage `lab_` fallback), keyed `progress/<examId>/<itemId>` and `scenario/<scenarioId>`
- [x] Practice view calls ProgressStore on every scored event (closes the “persistence exists but nothing calls it” finding)
- [x] Reload/restart/relaunch restores attempts, flags, per-item results
- [x] Storage failure (full/denied) surfaces an honest recoverable error, never a false save
- [x] E2E: answer items → reload → assert restored counts equal pre-reload counts

**Files:** `Web/js/core/ProgressStore.js`, `tests/e2e/study-loop.spec.js`

**Notes (S46-02 close, 2026-10-11):**
- `tests/e2e/study-loop.spec.js` not authored — repo has no Playwright e2e runner wired in CI; the E2E criterion was verified in a real browser (Chromium via Playwright MCP) instead: answer Q1 (correct) + Q2 (wrong) → IndexedDB holds both `progress/COMPTIA-A-1201/…` records + summary {attempted:2, correct:1} → reload → prior-note renders exactly "Saved progress: 1/2 previously answered in this exam pack." Node-level persistence is pinned by `tests/gates/web/progress-store.mjs` (5 tests: save/restore, attempts accumulate, summary, storage-failure `saved:false`, scenario record).
- Storage-failure UI path (`.practice-save-warning`) verified at the unit level via the failure fixture; not exercised in the browser (forcing quota errors in a live Chromium session was not attempted — noted, not silently claimed).
- REQ-UI-05 scored-event wiring: every submit calls `progress.recordItem` fire-and-forget with `.then/.catch` surfacing `saved:false` via the warning; the run's own scoring (`#results`) is never gated on persistence succeeding.
- Restart clears the in-run state but intentionally keeps the durable records (restart ≠ reset); per-exam deletion would go through `clearExam` when a reset surface exists (Sprint 47 T-21 demo reset).

### S46-03 (T-13): Ticket Renderer + CompTIA Scenarios
**As a** learner, **I want** realistic help-desk ticket tasks, **so that** diagnosis skills are practiced, not just recalled.

**Acceptance Criteria:**
- [x] `ticket-lab.js`: ticket pane, configuration panel, fixed test set, resolution-note field; owns no scoring logic (validators decide); evidence panel shows requested vs actual state and action trace
- [x] `aplus-dns-01`: wrong-DNS ticket; completion = correct DNS fix + resolution note; negative fixture: wrong-but-plausible DNS server fails
- [x] `netplus-gw-01`: wrong default gateway ticket; same contract
- [x] Every new objective validates against simulated state only; fresh-seed negativity proven (all objectives false before any action); recorded walkthrough reaches 100%; zero real network calls (E2E spy asserts)
- [x] “Simulated environment” label visible

**Files:** `Web/js/views/ticket-lab.js`, `Web/js/views/scenarios.js`, `Web/js/core/StateEngine.js`, `Web/js/app.js`, `Web/sw.js`, `tests/gates/web/ticket-scenarios.mjs`, `scripts/scan-scenario-validators.py`, `tests/gates/fixtures/validator-scan/`, `tests/gates/run_validator_scan_fixtures.sh`, `.github/workflows/build.yml`

**Notes (S46-03 close, 2026-10-11):**
- Registry choice: ticket entries appended to the existing `SCENARIOS` registry in `scenarios.js` (COMPTIA-A-1201 / COMPTIA-NET-009), with pure validators beside them (`validateAplusDns01`, `validateNetplusGw01`) exported via `TICKET_VALIDATORS` — UI, node fixtures, and the CI scan share one evaluation entry point (REQ-SC-01). `SCENARIOS` itself is now exported so fixtures can assert the wiring.
- Browser verification (Playwright/Chromium) covered both golden paths end to end (seeded wrong → tests → fix → note → submit → success toast + evidence ✓ + action trace + `progress.recordScenario` persisted), fresh-seed negativity (nslookup FAIL on seeded 10.42.100.99), wrong-but-plausible negatives (8.8.4.4 DNS, 10.42.100.1 gateway — each names the unmet condition in toast + verdict), empty-note rejection, and `#ticket-reset` reseeding the wrong values. A page-level network spy over a full walkthrough recorded zero non-localhost requests (REQ-SC-05).
- Three product bugs found only by browser verification and fixed in this batch: (1) `ScenariosView.render` hardcoded the exam list, making both COMPTIA scenarios invisible — exam groups are now derived from the registry itself; (2) `StateEngine.init()` loaded persisted profiles wholesale, so pre-existing profiles missing `ticket_workstations` crashed the lab — `init()` now backfills missing seed collections from the seed (user-modified collections untouched); (3) ticket entries never wired `.validate`, so submit threw `s.validate is not a function` — wired to `TICKET_VALIDATORS` and regression-locked by a fixture asserting the entry carries the shared validator. A fourth integration gap surfaced from the same run: `ProgressStore` was only initialized inside the practice view, so scenario recording threw `used before init()` — `progress.init()` now runs at app boot (`app.js`).
- REQ-SC-01 gate chain landed alongside: `scripts/scan-scenario-validators.py` (constant-true detector, fixture-only mode is hard-fail, repo mode warns loudly naming the 27 pending T-14 repairs and flips to hard FAIL when the sweep lands) + failing/passing fixtures + `run_validator_scan_fixtures.sh` wired into `build.yml` after the web runtime fixtures.
- Not verified / deferred: the E2E study-loop spec (`tests/e2e/study-loop.spec.js`) still does not exist in CI — scenario verification here is browser-verified plus node fixtures (`ticket-scenarios.mjs`, 6 tests), same posture as S46-02. The negative browser spot-check for netplus-gw-01 used the same wrong-but-plausible gateway the fixture pins (10.42.100.1); not re-spied at the network layer for that second ticket (the spy ran over aplus-dns-01). Demo-sweep walkthroughs per scenario (TM-45) are T-14's job, not T-13's.

### S46-04 (T-14): Scenario Validator Sweep
**As a** presenter, **I want** every existing scenario to be honestly passable, **so that** demo mode has no credibility failures.

**Acceptance Criteria:**
- [x] All 44 scenarios repaired: 27 literal-true predicates replaced with state-based checks; 16 seed-auto-pass scenarios fixed; us-bucket-01 made achievable through real UI mutation paths (or corrected to what the simulator can mutate — choice documented)
- [x] `scripts/scan-scenario-validators.py` CI gate: constant-true validators fail the build, naming scenario + objective IDs
- [x] Wrong-state negativity fixtures for repaired scenarios
- [x] Sweep (TM-45) asserts fresh-seed negativity + walkthrough solvability per scenario

**Files:** `Web/js/views/scenarios.js`, `Web/js/core/StateEngine.js`, `Web/js/core/CLIService.js`, `Web/js/app.js`, `Web/js/views/ci-console.js`, `Web/js/views/ai-tools.js`, `Web/js/views/pc-lcm.js`, `scripts/scan-scenario-validators.py`, `tests/gates/web/scenario-sweep.mjs`, `tests/gates/run_validator_scan_fixtures.sh`

**Notes (S46-04 close, 2026-10-10):**
- **Universal validator shape (SPEC-07).** Every objective validator is now `(state, trace) -> {passed, unmetConditions[]}`. The ticket validators already complied; the store-based ones were zero-arg boolean closures over module-level `state` and are converted. The runner (`#evalObjective`) calls `obj.validate(state, state.getAll('action_trace'))` with per-objective try/catch, so `scenario-validator-isolation.mjs` stays green (validators take `s` as a parameter, so the `getAll('categories')` poison still fires).
- **Durable action trace.** Observation objectives ("open the CLI", "view the audit log") cannot be proven from configuration state. Added a `action_trace` StateEngine seed collection (cleared by `reset()`, REQ-SC-06) recorded by: App route handler (`route-entered`), CLIService (`cli-command`), ci-console hibernate/resume (`nc2-hibernate`/`nc2-resume`), ai-tools (`api-request`, `vram-calculate`), pc-lcm (`lcm-scan`), and the scenario "Go to View" button. Validators read it as their `trace` argument.
- **27 constant-true replaced** with trace/state checks: CLI observations → `ranCli(trace, pattern)`; page observations → `visited(trace, route)`; tool/API → `ranAction`. The scan now hard-fails naming scenario + objective IDs (REQ-SC-01 armed).
- **Seed-auto-pass fixed (REQ-SC-02).** Empirically 16 scenarios completed on a fresh seed. Repairs: us-01 obj-1 now counts only non-seed FSVMs (excludes `fsvm-001..003`); us-05/mci-insights-01/ai-monitor-01 obj-2/ai-gpu-01 obj-1 require a visit in addition to the seed condition; us-repl-01 obj-2 requires the named share plus a visit; ci-03 obj-2 requires `nc2-hibernate` in the trace first (obj-1/obj-2 are mutually exclusive in state alone).
- **us-bucket-01 — choice: "corrected to real UI mutation paths" (documented per R-02).** The old predicate read `state.getAll('buckets')` — a collection that does not exist (the store is `object_buckets`). The Objects wizard already writes `name`, `versioning`, and `lifecycle: {days, action}`, so the objective is achievable through the real UI path once the collection is fixed and the objective matches the description's full contract (versioning + lifecycle). Objective text updated accordingly.
- **Field-shape mismatches (the us-bucket-01 class) found and fixed:** mci-01 obj-2 checked `image === 'CentOS-8'` but the UI writes `image: 'CentOS-8-GenericCloud'` — now resolves the disk image against the real image library so a fabricated name cannot pass; mci-01 obj-3 checked `n.subnet === 'VM-100'` but the UI writes `nics: [{network_uuid}]` and the network is named `VM-Network-100` — now resolves `network_uuid` → network name, and the objective text names the real network; mci-02 obj-3 checked `schedule === 'hourly'` (a string) but the wizard writes `schedule: {interval, retention_*}` — now checks `schedule?.interval === 'hourly'`. `scenario-attempt-history.mjs` was written against the old mci-02 shape and is updated to the real UI mutation shape.
- **Sweep (TM-45)** lives at `tests/gates/web/scenario-sweep.mjs` (auto-picked up by `run_web_fixtures.sh`): fresh-seed negativity (every objective of every store-based scenario fails after `state.reset()` with empty trace), walkthrough solvability (42 node-level walkthroughs replayed through the same `(state, trace)` entry point the UI uses, asserting 100%), and wrong-state negatives for the repaired scenarios (us-bucket-01 without versioning/lifecycle; us-bucket-01 written to the wrong collection; mci-01 without power-on; ci-03 without resume; mci-01 with the old image/network shapes).
- **Not verified:** the walkthroughs are node-level state+trace mutations, not full browser UI paths — the "real UI mutation path" evidence for us-bucket-01 is the field map above (the Objects wizard writes exactly the validated shape) plus the sweep's walkthrough. A browser spot-check of the Objects wizard was not re-run in this batch. Ticket scenarios (`aplus-dns-01`, `netplus-gw-01`) are excluded from the store-based sweep (covered by `ticket-scenarios.mjs`). No CI e2e spec exists yet (same posture as S46-02/03).


### S46-05 (T-15): Bridge Handlers + SessionStore
**As a** learner, **I want** desktop bridge actions to have real effects, **so that** no UI control lies.

**Acceptance Criteria:**
- [x] Every bridge handler either performs its real effect or is removed
- [x] Desktop consumes `JsonSessionStore` end-to-end for sessions

**Files:** `Desktop/LabSimulator/CefBridge.cs`, `Web/js/core/BridgeClient.js`, `Desktop.Tests/CefBridgeHandlerTests.cs`

**Notes (S46-05 close, 2026-10-10):**
- **R-05 surface contract enforced.** Five handlers that acknowledged without effects are removed from the bridge surface: `submit_answer` (only wrote a debug line), `export_results` (empty CSV TODO), `import_results` (counted rows, imported nothing), `get_settings` (returned a hardcoded dict — no Core settings store exists), `set_setting` (only wrote a debug line). R-05 acceptance: "a handler with no backing implementation is absent from the bridge surface (listing it is a test failure)" — `HandlerSurface_ListsOnlyHandlersWithRealEffects` pins the present set and asserts the removed five are absent.
- **Completed the half-real handlers.** `get_stats` now aggregates `answered`/`correct` from the JsonSessionStore session files (was hardcoded 0s after a bank-size fix) and reports `lastSession` from `List()`; `get_session` returns real inventory (`exists`/`hasProgress`/`data` for an id, or `sessions`/`count`) instead of a constant `{active:false}`; `reset_session` actually deletes the named session (or all) and confirms the new baseline (`removed` + `remainingSessions`) instead of acknowledging without touching data.
- **Effect-then-acknowledge tests** (`CefBridgeHandlerTests`): `GetStats_AggregatesFromSessionStore_NotHardcodedZeros`, `GetSession_WithId_ReportsRealExistence`, `ResetSession_RemovesData_AndConfirmsBaseline`, `SaveProgress_FailsHonestly_WhenSessionIdMissing`. Plus the pre-existing `SaveThenLoadProgress_RoundTripsThroughStore` proving Desktop consumes `JsonSessionStore` end-to-end (R-06's store half).
- **BridgeClient.js CEF wiring (the R-06 "nothing calls it end-to-end" gap).** `CefBridge` is registered as `window.dotnetBridge`, but BridgeClient only knew WebView2/postMessage — so in the Desktop CefGlue host the JS fell through to standalone mode and never reached `save_progress`/`load_progress`. BridgeClient now detects `window.dotnetBridge.call`, dispatches responses via `window.__cefBridgeDispatch`, and drains `window.__cefBridgeQueue`.
- **Not verified:** the CEF `window.dotnetBridge` round-trip is pinned at the C# level (`CefBridge.Call` → captured dispatch script) and at the JS level (the mode branch is in BridgeClient); a live CefGlue browser round-trip was not exercised in this session (no CEF runtime in the test environment — same posture as the existing Desktop smoke suite). `streakDays` in `get_stats` remains a constant 0 — there is no streak store in Core yet (R-15/S46-10 covers streak repairs); the field is honest (0) rather than fabricated. Exam-session progress remains in the JS ProgressStore (S46-02); the bridge store is for simulator sessions.


### S46-06 (T-16): Catalog and Scoring Tests
**As a** platform engineer, **I want** catalog merge and multi-select scoring pinned by tests, **so that** legacy + manifest worlds coexist safely.

**Acceptance Criteria:**
- [x] Catalog tests cover manifest + legacy merge (TM-12)
- [x] Multi-select scoring tests match Core fixture vectors exactly
- [x] Save/reload/error-path tests pass

**Notes (S46-06 close, 2026-10-10):**
- **Grading parity pinned on both sides.** `tests/gates/web/practice-grading.mjs` (S46-01) pins the JS `grade()` port; `ScoringVectorParityTests.cs` now pins Core `ExamSessionViewModel.Grade` against the *exact same* vectors — choice `['B']`, multi `['A','C']`, ordered `['B','D','A']` — with the same reason strings (`set-mismatch`, `sequence-mismatch`, `missing-step`, `extra-token`, `duplicate-step`). `InternalsVisibleTo` added to Core so the test can call the `internal` Grade directly; no public API change.
- **Catalog merge (TM-12)** was already covered by `ManifestCatalogTests` (10 tests: manifest identity wins over filename, legacy `DeriveExamCode` fallback, duplicate exam ID throws, duplicate question ID within exam throws, objective coverage from manifest, blueprint manifest-override + legacy fallback, composition-root registration). Added `Catalog_SameQuestionIdInDifferentExams_DoesNotThrow` to pin REQ-MAN-05's namespacing: the same numeric question ID in two packs is legal because progress keys carry `examId`.
- **Save/reload/error-path.** `SessionStoreTests` gained write-failure honesty (`Save_WriteFailure_Propagates_NeverClaimsSuccess` — a failed write leaves no readable session), corrupt-entry and empty-file load paths (`Load_CorruptFile_Throws_NotSilentNull`, `Load_EmptyFile_Throws_NotSilentNull` — corrupt is *not* papered over as "no progress"), and non-object payload round-trip. `progress-store.mjs` gained the REQ-MAN-05 collision test: same `itemId` in two exams produces two independent records.
- **Not verified:** no browser E2E of multi-select grading (node-level vectors only, same posture as the JS fixture); `FailingWriteFiles` is a stub `IFileProvider`, not a real disk-full condition; corrupt-load behavior is pinned as *throwing* — callers (CefBridge) catch and surface an error response, but no UI toast path for a corrupt session file was exercised.

### S46-07 (T-17): Lint Extension + Manifest Validator in CI
**As a** release manager, **I want** the new content tree linted, **so that** nothing ships unlinted.

**Acceptance Criteria:**
- [x] `lint-content.py` covers `content/exams/**/*.md` with manifest-aware rules (canonical answer separators, required front matter, provenance presence per C-02)
- [x] Skip logic moves from name substrings to manifest declarations
- [x] `validate-manifests.py` runs in the Linux leg

**Files:** `scripts/lint-content.py`, `.github/workflows/build.yml`

**Notes (S46-07 close, 2026-10-10):**
- **Manifest-aware lint (SPEC-10 10.6).** `content/exams/<examId>/questions/*.md` is now linted with three rule groups: (1) canonical answer separators + question/answer count parity (same R-07 rule as legacy); (2) required file structure — a `# title` and at least one `## DOMAIN N` header, which the parser needs to assign domains; (3) provenance presence per C-02 — every `### QN` must have `content/provenance/<examId>/QN.json` carrying the ten required C-02 keys, and the record's `objectiveId` must exist in that exam's `exam.json`.
- **Skip logic is now structural inside the manifest tree.** Under `content/exams/`, role comes from the directory: `questions/` is scored bank content (linted even if the file is named `CHEATSHEET.md`), `lessons/` is prose (skipped). Name-substring skips (`CHEATSHEET`/`LAB`/`ROADMAP`/…) apply only to legacy root files, which have no manifest. Self-test pins both directions: a `lessons/CHEATSHEET.md` is not linted as a bank; a `questions/CHEATSHEET.md` with a non-canonical answer *does* fail.
- **`validate-manifests.py` was already wired** into the Linux leg (Sprint 45, T-06); confirmed still green with its self-test. No workflow edit needed for this row.
- **Self-test fixtures (SPEC-16: every gate ships failing+passing).** Eight pairs: legacy non-canonical (fail) / legacy canonical (pass); missing provenance (fail); incomplete C-02 fields (fail); orphan `objectiveId` (fail); missing domain header (fail); complete pack (pass); lesson-role skip (pass despite name); role-over-name bank (fail).
- **Not verified:** provenance `reviewDate` is allowed empty for `status: "draft"` records (matches the existing draft inventory) — release-time field completeness is a RedEye lane concern (SPEC-08A), not this lint; no per-question YAML front matter is enforced (the current authoring format carries identity in the provenance record and the parser has no front-matter reader — adding YAML would be a parser change out of T-17 scope); objectiveId-orphan check only fires when `exam.json` parses and declares objectives.

### S46-08 (T-18): Coverage Threshold Enforcement
**As a** release manager, **I want** coverage enforced, **so that** collection without enforcement stops.

**Acceptance Criteria:**
- [x] Threshold declared (default 70% line on Core, ASM-11); enforcement step added; below-threshold fixture build fails CI
- [x] Critical surfaces (scoring, identity migration, storage failure, content parsing, security-gate boundaries) have direct behavior tests regardless of percentage

**Notes (S46-08 close, 2026-10-10):**
- **Threshold declared and enforced (CI-02 / ASM-11).** `scripts/check-coverage.py` reads the coverlet cobertura XML and fails below 70% line coverage on authored Core source. Denominator excludes coverlet's generated-regex compiler output (`obj/.../RegexGenerator.g.cs`) — boilerplate, not authored code. Wired into the Linux leg immediately after the test step.
- **Gate fixtures (SPEC-16).** `--self-test` pins three cases: a 40% fixture fails the threshold, a 90% fixture passes, and generated-regex lines are excluded from the denominator (a mixed report with 9/10 real lines covered must read as 90%, not 60%).
- **Coverage before this row was 68.58% — below the declared threshold.** Two critical surfaces had almost no direct tests: `HardcodedReferenceService` (708 lines of reference/KB tables, previously reached only through an empty stub) and `ExamPdfExporter` (436 lines, zero tests). Added `ReferenceServiceTests` (keyword match, unknown-exam empty, KB links, general resources, Legacy static shims) and `ExamPdfExporterTests` (generate-and-return PDF bytes for exam + cheatsheet, empty-list paths). Result: **92.62% authored-source line coverage** (1833/1979).
- **Critical surfaces now have direct behavior tests:** scoring (`ScoringVectorParityTests`, `ExamSessionViewModelTests`), identity migration (`DeriveExamCodeTests`, `ManifestCatalogTests`), storage failure (`SessionStoreTests` write-failure/corrupt-load), content parsing (`QuestionParserTests`, `lint-content.py` fixtures), security-gate boundaries (`vuln_gate` fixture matrix, `check-brand` fixtures).
- **Not verified:** branch coverage is collected but not thresholded (ASM-11 is line-only); the PDF tests assert `%PDF` magic bytes and non-trivial length, not rendered layout; `ReferenceService`/`BlueprintService` static shims are exercised under `#pragma warning disable CS0618` because they are intentionally obsolete for the DI path.

### S46-09 (T-37): Semantic Item Identity
**As a** content maintainer, **I want** stable semantic IDs for legacy bank items, **so that** progress history survives content edits.

**Acceptance Criteria:**
- [x] Semantic identity scheme + collision detector for legacy banks
- [x] Retry outcome-set policy finalized with S45-05

**Notes (S46-09 close, 2026-10-10):**
- **Semantic identity (R-13 / TM-81).** `SemanticItemId` (Core/Models) defines the immutable source-aware form `<examId>/<sourceFile>/Q<localId>` — e.g. `NCA-75/NCA-75-Part1.md/Q1` vs `NCA-75/NCA-75-Part2.md/Q1`. Display numbering stays separate (`ExamSessionViewModel.GetDisplayNumber`); revision is carried by the manifest, never by mutating the ID. This matches the form `scripts/generate-study-content.py` already emits.
- **Two-Q1 fixture (R-13 acceptance).** `SemanticItemIdTests.TwoQ1ItemsFromTwoFiles_GetDistinctSemanticIds` and `tests/gates/web/item-identity.mjs` both pin two Q1 items from two files in one exam as distinct records. Cross-exam same-local-id stays legal (REQ-MAN-05).
- **Collision detector (TM-81).** `SemanticItemId.DetectCollisions` (unit) and `scripts/check-item-identity.py` (gate, wired in CI) scan every bank. Live result: **1613 items / 7 exams / 0 semantic collisions**. Seeded-duplicate fixture must fail; clean two-Q1 fixture must pass (`--self-test`). Legacy `EXAM:number` collisions (360 across multi-part banks) are reported as informational — that is the defect the source-aware ID exists to prevent in storage keys.
- **Legacy ambiguity, never a silent pick.** `SemanticItemId.ResolveLegacy(exam, n)` returns Found / Ambiguous(listing every source file) / NotFound. A bare `NCA-75:1` with two Q1s is Ambiguous.
- **Retry outcome-set policy (R-14 / D9, finalized with S45-05).** first-attempt and latest-attempt are separate explicit metrics; displayed outcome = latest; statistics report both. `ProgressStore.recordItem` now stores `firstCorrect` (immutable) and `latestCorrect` (alias of `isCorrect`); when they disagree, BOTH are on the record. Summary counts unique items (not scored events) and exposes both `correct` (latest) and `firstCorrect`. Both retry directions are pinned in `tests/gates/web/retry-outcome-sets.mjs` (TM-82) alongside the Core `ExamSessionViewModelTests` retry suite from S45-05.
- **Not verified:** no storage-key migration ran against an existing learner profile (the new fields are additive; legacy records without `firstCorrect` treat a single recorded outcome as the first, and multi-attempt legacy records honestly store `firstCorrect: null` rather than guessing); display numbering is not re-checked on the desktop UI path; the 360 legacy `EXAM:number` collisions are reported but no caller still uses that form as a storage key — that claim is from the code search in this session, not a runtime assertion.

### S46-10 (T-38): Study Continuation and Streak/Skip
**As a** learner, **I want** to resume where I stopped, **so that** sessions are not lost mid-study.

**Acceptance Criteria:**
- [x] Study-continuation restore works across sessions
- [x] Streak and Skip repairs per R-15/R-17

**Notes (S46-10 close, 2026-10-10):**
- **Streak from attempt history (R-17, Core).** `ExamSessionViewModel` no longer does `_streak++` on every correct submit (the bug: answering one item right twice read as streak 2). New model: a chronological `(key, correct)` attempt log; streak = trailing run of correct events since the last miss, counting each distinct item at most once so a correct retry cannot add a phantom step. Any miss — wrong answer or Skip — ends the run. `BestStreak` retains the peak. Pinned by three new tests beside the existing streak suite (`Streak_RetryOfSameItemCorrect_DoesNotInflate`, `Streak_RetryFlip_CorrectThenWrong_TakesLatestOutcome`, `Streak_CountsDistinctItems_SinceLastMiss`). The first draft walked first-answer order instead of the attempt log; a flip-to-wrong on an earlier item left later correct items in the streak, which the flip test caught — corrected to the chronological model before commit.
- **Desktop streak display (R-17).** `TxtStreak` showed `CorrectCount` (score-as-flame, also retry-inflated). Now binds `_session.Streak`, and `OnSessionPropertyChanged` refreshes on `Streak`/`BestStreak` as well as the score fields.
- **Study continuation (R-15, Desktop).** Stats and Blueprint used to `ReleaseCurrentView()` which nulls `_session` — the only way back was `StartSession`, i.e. a brand-new session at question 1. Both handlers now pause the live view-model in `_pausedSession` (same pattern as `_reviewReturnSession`) before releasing; re-selecting that exam in the sidebar resumes it via `ShowStudySession` with position, current item, and in-progress answers intact. Reset and mode-change still start fresh (they call `StartSession`, which clears any pause).
- **Study continuation (R-15, Web).** `ProgressStore` gains `saveContinuation` / `loadContinuation` / `clearContinuation` under `progress/<examId>/continuation` (`{ index, selection, results, total, savedAt }`). `practice.js` writes it on every selection and index change, restores index + in-progress selection + results-so-far on render (with a "Resumed at question N" note), and clears it on complete and on restart. `clearExam` also drops the continuation so a reset never leaves a ghost pointer.
- **Skip (R-17, Web).** Practice view gains a Skip button. `ProgressStore.skipItem` records the item as a miss (`reason: 'skipped'`) and is the **only** emitter of `progress:skipped` — submit/retry never fire it. A skip that fails to persist emits nothing (never a false event).
- **Fixtures (SPEC-16: failing + passing).** `tests/gates/web/study-continuation.mjs` (7 tests: persist/restore exact position+selection+results, overwrite, clear-on-complete, clearExam, malformed-index coercion) and `tests/gates/web/streak-skip.mjs` (8 tests: streak increments, retry does not inflate, miss resets run + peak retained, fail-then-pass counts one step, `recordItem` never notifies skip, `skipItem` notifies once and records a miss, skip breaks streak, failed skip save notifies nothing). Both fail against the pre-fix behavior (always-start-at-0 / streak++ / skip-on-every-miss). Auto-discovered by `tests/gates/run_web_fixtures.sh`.
- **Not verified:** practice.js restore-on-render is wired but not driven through a headless view fixture (the stub DOM in `helpers.mjs` is enough for ProgressStore and `grade()`, not for a full PracticeView lifecycle — the round-trip is pinned at the storage API level). Desktop pause/resume is covered by the existing headless Avalonia smoke suite only insofar as those 20 tests still pass; no new smoke test drives Stats → sidebar-resume and asserts the current index. Streak semantics on a multi-day calendar (does the streak roll over at midnight?) are out of scope — `progress/meta.lastStudyDate` is recorded but nothing gates on it yet. Cross-exam streak (meta is global) is implemented as one run across exams; whether product wants per-exam streak is unconfirmed.

### S46-11 (T-39): Disposal Guards
**As a** platform engineer, **I want** cached simulator references disposed safely, **so that** no resource leak degrades the demo host.

**Acceptance Criteria:**
- [x] Unit fixtures prove the reuse-after-dispose guard (R-16 / TM-84)
- [x] Manual native revisit listed as prescribed-but-not-yet-executed evidence
- [x] Ownership policy recorded: keep-alive across navigation, dispose once on window close

**Notes (S46-11 close, 2026-10-10):**
- **Root cause (NET-07).** `MainWindow.ReleaseCurrentView` disposed `LabSimulatorView` on every navigate while leaving `_labView` cached; the next Lab Simulator click reused a dead host (`OnLoaded` silently returned). The two classes' lifetime decisions disagreed — `LabSimulatorView`'s own comment forbids dispose-on-detach (CefRuntime is process-wide), MainWindow did exactly that.
- **Ownership policy.** Keep-alive across navigation; dispose exactly once on window close (`Closed += OnWindowClosed`). `ReleaseCurrentView` no longer touches the lab view. `OnLabSimulatorClicked` drops a disposed cache entry before `??=`, so an out-of-band dispose cannot be re-shown.
- **Guards (defense-in-depth).** `CefBridge.Call`/`PostToJs` throw `ObjectDisposedException` (`ThrowIf`) instead of acting on a dead host. `CefBridge.PostResponse` catches that exception as a shutdown race (in-flight handler after dispose) and drops the response rather than faulting the fire-and-forget task. `LabSimulatorView` exposes `IsDisposed`; `ExecuteScript` and `OnLoaded` throw on a disposed instance (both previously silent-returned).
- **Display guard.** CEF's Linux backend aborts the process (`exit()`, uncatchable) when no X/Wayland display exists. `TryStartCef` now detects that before touching native code and shows the fallback panel — required for the ownership fixtures to run on the headless fleet runner, and a real robustness fix for headless SSH sessions.
- **Fixtures (`DisposalGuardTests.cs`, 11 tests).** CefBridge: Call/PostToJs after Dispose throw; Dispose is idempotent; Call before Dispose works. LabSimulatorView: ExecuteScript after Dispose throws; Dispose is idempotent; re-attach (synchronous `Loaded` raise) throws; fresh instance is not disposed. MainWindow: lab survives navigation (same live instance, `IsDisposed` false); a disposed cache entry is replaced, never re-shown; window close disposes the lab view. Full Desktop suite green: 31/31 (20 prior smoke + prior CefBridgeHandlerTests + these 11).
- **Not verified:** the manual native second-visit check (real CefGlue browser, navigate away, come back, confirm the page reloads) is **prescribed-but-not-yet-executed** evidence — no display server in this environment. It belongs in the release record as unexecuted-until-run, not as claimed proof (R-16's explicit boundary). The re-attach fixture raises `Loaded` synchronously because Avalonia schedules the real `Loaded` on the dispatcher, where a handler throw becomes an unobserved task exception rather than a test-visible fault; the production throw still fires on the real attach path (observed in the run log). CEF `CefRuntime.Shutdown`-exactly-once on process exit is not asserted (no live CEF in tests).

### S46-12 (T-40): PDF Export Truth
**As a** learner, **I want** exports that tell the truth, **so that** printed output matches the app.

**Acceptance Criteria:**
- [x] Canonical item ID vs display label resolved correctly in exports
- [x] Vendor-neutral footer
- [x] Atomic session save + corrupt-recovery behavior tested

**Notes (S46-12 close, 2026-10-10):**
- **R-18 identity split.** New `ExportMetadata` record keeps `CanonicalExamId` and `DisplayName` as separate fields — the NET-10 defect was the display label used as the canonical exam code on the PDF path. `ExportText` is the single source of identity strings (`HeaderCode`, `CoverTitle`, `CoverCode`, `FooterLines`, `AllIdentityStrings`); the QuestPDF composer draws exactly those. `MainWindow.GenerateStudyGuidePdf` now builds metadata from the catalog (`ExamCatalogItem` gained `PackVersion` / `SourceReviewDate`, populated from the exam manifest). `GenerateExamPdf` / `GenerateCheatSheetPdf` take `ExportMetadata` — the old `(title, examCode)` pair is gone, so the conflation cannot be reintroduced by a careless caller.
- **Vendor-neutral footer (R-12/R-18).** The old footer said "RadicalTrainingPlatform - Nutanix Certification Practice" (vendor branding on a CompTIA pack). New footer lines: track title, unaffiliated status, `Official exam code: <canonicalId>  ·  Pack: <version>  ·  Source reviewed: <date>`, then the exact SPEC-16 disclaimer. Missing optional fields are omitted, never invented. The cover no longer claims "fully validated" and carries the disclaimer as well.
- **Old failure reproduced + archived (R-18 acceptance).** `OldFailure_DisplayLabelAsCanonicalCode_IsPinnedOut` is the regression pin: it fails if the code slot ever carries the display label again. The pre-fix shape (DisplayName passed where the code belonged, Nutanix-branded footer) is described here as the archived reproduction; the pin is the living evidence.
- **Per-pack export fixtures (TM-86).** Theory over the four released packs (`COMPTIA-A-1201`, `COMPTIA-A-1202`, `COMPTIA-NET-009`, `NCA-75`) asserts the canonical code in the header/cover/footer and generates real PDF bytes. When `content/exams/*/exam.json` is on disk, `ReleasedPacks_FromManifests_ExportIdentityMatches` loads each manifest and asserts identity matches (examId, displayName, officialVersion as pack, sourceReviewDate).
- **R-20 atomic save.** `JsonSessionStore.Save` writes `<id>.json.tmp` then `MoveFile` over the live path — the live file is never truncated by `WriteAllText`. A failed write deletes the staging file and rethrows; the prior file stays byte-identical. `IFileProvider` gained `MoveFile` (DefaultFileProvider uses `File.Move(..., overwrite: true)`).
- **R-20 corrupt quarantine.** `Load` on a corrupt/unreadable file moves it to `<id>.json.corrupt` (evidence preserved), fires `ISessionStore.CorruptQuarantined` (`SessionQuarantineNotice`), and returns null — a clean start that is never silent. The previous contract (Load throws `JsonException`) is replaced: throwing bricked the store; quarantine + loud notice is the honest recoverable path (R-20 / Plan v2 L-02). Quarantined sessions drop out of `List()`/`Has()`.
- **R-20 ID path safety.** Session IDs are rejected if they contain POSIX separators, Windows-invalid filename chars (`< > : " | ? *`), extension dots, control chars, leading/trailing whitespace, or Windows reserved device names (`CON`, `PRN`, `AUX`, `NUL`, `COM0-9`, `LPT0-9`). Fixtures cover each class.
- **Fixtures.** Session store: temp-then-rename proof, kill-after-temp-write leaves prior file intact + no `.tmp` ghost, write-failure never claims success, corrupt/empty quarantine + notice + clean start, expanded ID rejection. PDF: identity pins, vendor-neutral footer, exact disclaimer, per-pack theory, manifest-driven pack scan. Core 246/246; Desktop 31/31.
- **Not verified:** full PDF *text extraction* from the rendered bytes (no PDF parser in the test stack) — identity is pinned on `ExportText`, the exact strings the composer draws, plus a `%PDF` real-bytes smoke. QuestPDF stream compression makes raw-byte string search unreliable, so the "renders" claim is at the composed-strings layer. Atomic rename is asserted against `IFileProvider.MoveFile` (fake + real `File.Move`); a true SIGKILL mid-write on ext4/NTFS was not executed. Cross-platform ID fixtures run the *rules* on Linux; they are not executed on Windows/macOS hosts in this session. Web `ProgressStore` (the other persistence surface) is untouched — R-20 is the Desktop `JsonSessionStore` path.

### S46-13 (T-44): Storage Recovery Boundary Tests
**As a** platform engineer, **I want** corrupt/quota/blocked storage handled, **so that** broken state never silently pretends to be saved.

**Acceptance Criteria:**
- [x] Corrupt entry, quota exceeded, storage blocked — each surfaces the honest recoverable error path

**Notes (S46-13 close, 2026-10-10):**
- **Findings (R-23 acceptance: a finding only if a test fails).** Two of the three boundaries were defective before this row; one was already honest and is now pinned.
  1. **Corrupt entry — FAILING before the fix (finding).** `StateStore.get` (localStorage fallback) did a bare `JSON.parse(raw)`. A damaged value threw `SyntaxError` out of every read (`getItem`, `restore`, continuation load) — the store bricked on one bad key. Now: damaged bytes are quarantined to `lab_<key>.corrupt` (evidence preserved), `store:corruptEntry` fires, and `get` returns null (clean start). Recoverable: the key is writable again immediately (attempts restart at 1).
  2. **Quota exceeded — PARTIAL before the fix (finding, narrowed).** A write failure already returned `{ saved: false, reason: 'storage-write-failed' }` (S46-02 / L-02), so it was never a false save. But the single reason code hid *which* recovery path the learner was on. Now `ProgressStore.#classifyWriteFailure` maps `DOMException`/`err.name` `QuotaExceededError` (and `NS_ERROR_DOM_QUOTA_REACHED`) to `storage-quota-exceeded`, and `StorageBlockedError` to `storage-blocked`, leaving everything else as `storage-write-failed`. Classification is name-based so a message that merely mentions quota is not misread (pinned by fixture).
  3. **Storage blocked — FAILING before the fix (finding).** If `localStorage` access itself throws (cookies/storage denied), `init()` fell into the fallback and then every `get`/`set` threw `SecurityError` at the caller. Now `init()` probes localStorage and marks the store `blocked` when both backends are down; `store:storageBlocked` fires at first access or at init; reads return null; writes throw `StorageBlockedError` so the caller reports `saved: false, reason: 'storage-blocked'`. The app keeps running — persistence is honestly reported unavailable, not pretended.
- **Fixtures (`tests/gates/web/storage-recovery.mjs`, auto-discovered; TM-34 extended).** Nine tests covering: corrupt `get` (quarantine + event + evidence + live-key removal); `ProgressStore.getItem` clean-start on corrupt; `restore()` over mixed good+corrupt; re-write after quarantine. Quota on `recordItem` / `recordScenario` / `saveContinuation` (`storage-quota-exceeded` + `progress:saveFailed` with reason); generic write failure stays `storage-write-failed`. Mid-session block (`SecurityError` on access) and init-time block (both IDB and localStorage down). Failing side named in the fixture header: bare `JSON.parse` throw, single undifferentiated reason, and no blocked mode.
- **Surface.** Web `StateStore` / `ProgressStore` (the demo-host learner store) — not Desktop `JsonSessionStore` (R-20 shipped in S46-12). New events: `store:corruptEntry`, `store:storageBlocked`; `progress:saveFailed` now carries `reason`.
- **Results recorded either way (R-23).** Corrupt-entry and quota paths are now green; they were the failing findings. Blocked storage is green and was likewise a finding (uncaught `SecurityError`). No other failure surfaced in the three boundaries.
- **Not verified:** real browser quota pressure (actual `QuotaExceededError` from a full localStorage/IndexedDB quota) is simulated by a throwing stub with the standard `DOMException.name`, not by filling a real origin quota. IndexedDB write-quota and transaction-abort paths are not separately stubbed (the fixtures force the localStorage fallback, which is the demo-host path when IDB is unavailable). Real cookie-blocked privacy modes are simulated via `SecurityError` from the localStorage accessor, not by launching a browser with storage denied. Corrupt-entry recovery is asserted for the fallback path; the IndexedDB value-shape corruption path is not exercised (IDB stores a structured `{key, value}` wrapper and is left to the browser). Cross-browser `NS_ERROR_DOM_QUOTA_REACHED` is classified but only the `QuotaExceededError` name is fixture-proven.

### S46-14 (T-42): CefGlue NoSandbox Hardening Review
**As an** owner, **I want** a scoped hardening review of the embedded browser, **so that** the desktop demo path carries a recorded security decision, not an unexamined default.

**Acceptance Criteria:**
- [x] Review record covers: navigation allowlist for the embedded browser, bridge surface minimization (with S46-05/R-19), update-channel review — with a recorded outcome
- [x] If the embedded browser stays in the demo path: navigation outside the allowlist is blocked by fixture test
- [x] Review concludes before the desktop demo path is chosen (Sprint 47 rehearsal)

**Notes (S46-14 close, 2026-10-10):**
- **Review record.** [`docs/security/CEF-01-hardening-review-2026-10-10.md`](../security/CEF-01-hardening-review-2026-10-10.md) — decision **KEEP** the embedded browser in the desktop demo/lab path under a recorded compensating control set (navigation allowlist, local-bundle-only content, minimal bridge, remote debugging off, no auto-update). No exploit asserted (SPEC-09 R-21 constraint). Re-open triggers named in the record.
- **Navigation allowlist (CEF-01 / TM-89).** New pure policy `LabSimulator/NavigationPolicy.cs` (testable without a CEF runtime, same pattern as `ExportText`). Allowed: `about:blank`/`about:srcdoc` and `file://` inside the resolved lab-bundle root. Denied: `http(s)` (those destinations open in the OS shell), `javascript:`/`data:`/`blob:`/`chrome:`/`devtools:`/`view-source:`, `file://` outside the bundle (including sibling-prefix tricks), empty/relative targets — and **fail closed** when the bundle root is unknown. Enforcement: `LabSimulatorView.OnBrowserAddressChanged` evaluates every address and bounces disallowed targets back to the bundle bootstrap via `Address =`.
- **Fixtures (`NavigationPolicyTests.cs`, 20 tests).** Allow table, deny table (http/https + dangerous schemes), outside-bundle file URIs, sibling-prefix confusion, fail-closed, bounce-back helper, and `OldFailure_OpenNavigation_IsPinnedOut` (regression pin: the pre-review state navigated anywhere). Failing side of CEF-01: with no policy, any URL the page pointed at was a live navigation in a NoSandbox browser.
- **Bridge surface (R-05 / R-19).** Re-confirmed the ten-handler surface from S46-05; absent handlers stay absent (`HandlerSurface_ListsOnlyHandlersWithRealEffects`). No JS-chosen filesystem paths (R-20 `PathFor` rejects), no process spawn, no settings mutation.
- **Update-channel review (finding, closed).** CEF binaries are pinned NuGet packages (`CefGlue.Avalonia`/`CefGlue.Common` 120.6099.215); no auto-update channel. The ready handshake previously reported a **hardcoded `cefVersion = "120.6099.204"` that had already drifted from the pin** — it now reads the live binding assembly version. Supply-chain attestation of the NuGet package itself is out of scope (recorded, not claimed).
- **Related.** Display guard from S46-11 (CEF `exit()`s without X/Wayland) stands as a robustness control on the same path. `RemoteDebuggingPort = 0`.
- **Not verified (prescribed-but-not-yet-executed):** live bounce-back of a real `https://` navigation in a running CEF host (no display server here — policy + address hook are fixture-tested at the decision layer; the native leg is release-record evidence, not claimed proof); popup/`window.open` against CefGlue's internal LifeSpanHandler (not replaced — judged riskier than the gap for a local-bundle page); renderer-crash recovery; Windows/macOS CEF startup. Full list in the review record.

### S46-15 (T-43* remainder): Web Runtime Batch Close-out
- Remaining R-22 cosmetics from Sprint 45; register note if slipped

---

## Sprint Acceptance

- Fresh profile → track → lesson → practice → scenario → reset completes on the demo host class of device (headless Chromium in CI; manual ChromeOS verification in Sprint 47/48 rehearsal)
- Scenario false-positive count is zero: sweep proves 0 objectives complete from fresh seed across the catalog; us-bucket-01 walkthrough replay passes
- `dotnet test RadicalTrainingPlatform.Core.Tests` green; E2E study-loop green in CI Linux leg
- Mini-retrospective per SPEC-11 11.10 with gate pass count at sprint head SHA
