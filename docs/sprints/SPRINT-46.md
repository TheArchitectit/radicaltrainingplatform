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
| S46-03 (T-13) | `ticket-lab.js` renderer; aplus-dns-01 + netplus-gw-01 with validators and negative fixtures | REQ-SC-01..06 | 3 | ⚪ |
| S46-04 (T-14) | Scenario validator sweep repairs (all 44; us-bucket-01) | R-02, REQ-DEMO-06 | 3 | ⚪ |
| S46-05 (T-15) | Bridge handlers: real effects or removal; desktop SessionStore consumption | R-05, R-06 | 2 | ⚪ |
| S46-06 (T-16) | Catalog tests, multi-select scoring tests, save/reload/error tests | REQ-MAN-05, L-06 | 2 | ⚪ |
| S46-07 (T-17) | Lint extension + manifest validator in CI | SPEC-10 10.6 | 2 | ⚪ |
| S46-08 (T-18) | Coverage threshold enforcement | CI-02 | 2 | ⚪ |
| S46-09 (T-37) | Semantic item identity for legacy banks + collision detector; retry outcome-set policy | R-13, R-14 | 2 | ⚪ |
| S46-10 (T-38) | Study-continuation restore; streak/Skip repairs | R-15, R-17 | 2 | ⚪ |
| S46-11 (T-39) | Disposal guards on cached simulator references | R-16 | 1 | ⚪ |
| S46-12 (T-40) | PDF export: canonical ID vs display label; vendor-neutral footer; atomic session save + corrupt recovery | R-18, R-20 | 2 | ⚪ |
| S46-13 (T-44) | Storage recovery boundary tests (corrupt entry, quota, blocked) | R-23 | 1 | ⚪ |
| S46-14 (T-42) | CefGlue NoSandbox scoped hardening review + navigation allowlist decision | R-21 | 1 | ⚪ |
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
- [ ] `ticket-lab.js`: ticket pane, configuration panel, fixed test set, resolution-note field; owns no scoring logic (validators decide); evidence panel shows requested vs actual state and action trace
- [ ] `aplus-dns-01`: wrong-DNS ticket; completion = correct DNS fix + resolution note; negative fixture: wrong-but-plausible DNS server fails
- [ ] `netplus-gw-01`: wrong default gateway ticket; same contract
- [ ] Every new objective validates against simulated state only; fresh-seed negativity proven (all objectives false before any action); recorded walkthrough reaches 100%; zero real network calls (E2E spy asserts)
- [ ] “Simulated environment” label visible

**Files:** `Web/js/views/ticket-lab.js`, `Web/js/views/` scenario registry

### S46-04 (T-14): Scenario Validator Sweep
**As a** presenter, **I want** every existing scenario to be honestly passable, **so that** demo mode has no credibility failures.

**Acceptance Criteria:**
- [ ] All 44 scenarios repaired: 27 literal-true predicates replaced with state-based checks; 16 seed-auto-pass scenarios fixed; us-bucket-01 made achievable through real UI mutation paths (or corrected to what the simulator can mutate — choice documented)
- [ ] `scripts/scan-scenario-validators.py` CI gate: constant-true validators fail the build, naming scenario + objective IDs
- [ ] Wrong-state negativity fixtures for repaired scenarios
- [ ] Sweep (TM-45) asserts fresh-seed negativity + walkthrough solvability per scenario

**Files:** `Web/js/views/scenarios.js` (and scenario registry), `scripts/scan-scenario-validators.py`

### S46-05 (T-15): Bridge Handlers + SessionStore
**As a** learner, **I want** desktop bridge actions to have real effects, **so that** no UI control lies.

**Acceptance Criteria:**
- [ ] Every bridge handler either performs its real effect or is removed
- [ ] Desktop consumes `JsonSessionStore` end-to-end for sessions

**Files:** Desktop bridge handlers, `RadicalTrainingPlatform.Core/Services/SessionStore.cs` consumers

### S46-06 (T-16): Catalog and Scoring Tests
**As a** platform engineer, **I want** catalog merge and multi-select scoring pinned by tests, **so that** legacy + manifest worlds coexist safely.

**Acceptance Criteria:**
- [ ] Catalog tests cover manifest + legacy merge (TM-12)
- [ ] Multi-select scoring tests match Core fixture vectors exactly
- [ ] Save/reload/error-path tests pass

### S46-07 (T-17): Lint Extension + Manifest Validator in CI
**As a** release manager, **I want** the new content tree linted, **so that** nothing ships unlinted.

**Acceptance Criteria:**
- [ ] `lint-content.py` covers `content/exams/**/*.md` with manifest-aware rules (canonical answer separators, required front matter, provenance presence per C-02)
- [ ] Skip logic moves from name substrings to manifest declarations
- [ ] `validate-manifests.py` runs in the Linux leg

**Files:** `scripts/lint-content.py`, `.github/workflows/build.yml`

### S46-08 (T-18): Coverage Threshold Enforcement
**As a** release manager, **I want** coverage enforced, **so that** collection without enforcement stops.

**Acceptance Criteria:**
- [ ] Threshold declared (default 70% line on Core, ASM-11); enforcement step added; below-threshold fixture build fails CI
- [ ] Critical surfaces (scoring, identity migration, storage failure, content parsing, security-gate boundaries) have direct behavior tests regardless of percentage

### S46-09 (T-37): Semantic Item Identity
**As a** content maintainer, **I want** stable semantic IDs for legacy bank items, **so that** progress history survives content edits.

**Acceptance Criteria:**
- [ ] Semantic identity scheme + collision detector for legacy banks
- [ ] Retry outcome-set policy finalized with S45-05

### S46-10 (T-38): Study Continuation and Streak/Skip
**As a** learner, **I want** to resume where I stopped, **so that** sessions are not lost mid-study.

**Acceptance Criteria:**
- [ ] Study-continuation restore works across sessions
- [ ] Streak and Skip repairs per R-15/R-17

### S46-11 (T-39): Disposal Guards
**As a** platform engineer, **I want** cached simulator references disposed safely, **so that** no resource leak degrades the demo host.

**Files:** Desktop/CefGlue simulator reference caches (per R-16)

### S46-12 (T-40): PDF Export Truth
**As a** learner, **I want** exports that tell the truth, **so that** printed output matches the app.

**Acceptance Criteria:**
- [ ] Canonical item ID vs display label resolved correctly in exports
- [ ] Vendor-neutral footer
- [ ] Atomic session save + corrupt-recovery behavior tested

### S46-13 (T-44): Storage Recovery Boundary Tests
**As a** platform engineer, **I want** corrupt/quota/blocked storage handled, **so that** broken state never silently pretends to be saved.

**Acceptance Criteria:**
- [ ] Corrupt entry, quota exceeded, storage blocked — each surfaces the honest recoverable error path

### S46-14 (T-42): CefGlue NoSandbox Hardening Review
**As an** owner, **I want** a scoped hardening review of the embedded browser, **so that** the desktop demo path carries a recorded security decision, not an unexamined default.

**Acceptance Criteria:**
- [ ] Review record covers: navigation allowlist for the embedded browser, bridge surface minimization (with S46-05/R-19), update-channel review — with a recorded outcome
- [ ] If the embedded browser stays in the demo path: navigation outside the allowlist is blocked by fixture test
- [ ] Review concludes before the desktop demo path is chosen (Sprint 47 rehearsal)

### S46-15 (T-43* remainder): Web Runtime Batch Close-out
- Remaining R-22 cosmetics from Sprint 45; register note if slipped

---

## Sprint Acceptance

- Fresh profile → track → lesson → practice → scenario → reset completes on the demo host class of device (headless Chromium in CI; manual ChromeOS verification in Sprint 47/48 rehearsal)
- Scenario false-positive count is zero: sweep proves 0 objectives complete from fresh seed across the catalog; us-bucket-01 walkthrough replay passes
- `dotnet test RadicalTrainingPlatform.Core.Tests` green; E2E study-loop green in CI Linux leg
- Mini-retrospective per SPEC-11 11.10 with gate pass count at sprint head SHA
