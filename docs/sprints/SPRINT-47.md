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
| S47-01 (T-19) | A+ cut complete: 24 items, 2 lessons — no passing lane log | REQ-AP-02 | 3 | 🟡 |
| S47-02 (T-20) | Network+ cut complete: 25 items, 2 lessons — no passing lane log | REQ-NP-02 | 3 | 🟡 |
| S47-03 (T-21) | Demo mode: seed, one-click reset, mode label, ephemeral store | REQ-DEMO-01..06, REQ-UI-07/08 | 3 | ✅ |
| S47-04 (T-22) | Pages predeploy gate (imports, smoke, bundle check) | CI-03 | 2 | ✅ |
| S47-05 (T-23) | Tutor slice behind its gates, or recorded-example fallback | REQ-AI-01..07 | 3 | ✅ |
| S47-06 (T-24) | Option shuffling with stable IDs | R-09 | 1 | ✅ |
| S47-07 (T-25) | Packaging repairs PKG-01..04 + clean-install tests | SPEC-10 10.5 | 3 | 🟡 |
| S47-08 (T-41) | Installed-bundle content independence; Legacy bridge narrowing; release-link truth | R-19 | 2 | 🟡 |
| S47-09 (T-45) | ShellCheck gate + packaging behavior fixtures | R-24 | 1 | 🟡 |

**Status key:** ✅ shipped and verified on this host · 🟡 shipped and gated, with named verification gaps
listed under the row's *Not verified* notes in [SPRINT-47-EVIDENCE.md](SPRINT-47-EVIDENCE.md) · ⚪ not started.

**Evidence:** each completed row's shipped notes, findings, gates run and not-verified detail live in
[SPRINT-47-EVIDENCE.md](SPRINT-47-EVIDENCE.md) — except S47-10, whose rehearsal log is archived in
[../qa/release-evidence/2026-10-23-rehearsal.md](../qa/release-evidence/2026-10-23-rehearsal.md). Both
companions were split out of this file when it passed the 500-line document limit (CLAUDE.md).

## Sprint Backlog — Part D (Oct 20–22)

| ID | Task | Requirements | Points | Status |
|---|---|---|---|---|
| S47-10 (T-26) | Rehearsal on actual demo host: installed, offline, keyboard/projector, reset-between-groups | REQ-UI-06, REQ-DEMO-05, TM-40/45/50 | 2 | 🟡 |
| S47-11 (T-27) | Tutor evaluation report and go/no-go; fallback labeling check | REQ-AI-06/07 | 1 | ✅ |
| S47-12 (T-28) | Screenshots/video backup; non-AI backup path | REQ-AI-07 | 1 | ✅ |
| S47-13 (T-29) | Freeze: branch, base/head SHA, changed files, gate results, RedEye lane logs + seeded-defect self-test record, usable build | SPEC-11 11.7 | 1 | ✅ |
| S47-14 (T-30) | Demo script final: 90-second loop (learn, try, ask, verify) + exact disclaimer + no-patient/no-business-system line | REQ-BRAND-02 | 1 | ✅ |
| S47-15 (R-10) | LICENSE: prepare BSD-3-Clause decision record + README pointer; final file drop waits on owner confirmation (HG-01) | R-10, C-08/C-09 | 1 | 🟡 |
| S47-16 (T-25b) | README/docs truth: README facts match CI-generated counts, **now gated** by `scripts/check-readme-counts.py`; docs index; historical labels | R-12 | 2 | ✅ |

**Total:** 29 points. Sprint D explicitly excludes architecture migration and post-freeze content authoring. S47-16 was opened after the sprint, from a coverage audit: T-25b has no row in SPEC-11's tables, so R-12 had no owner. See [SPRINT-47-RETROSPECTIVE.md](SPRINT-47-RETROSPECTIVE.md).

---

## User Stories

### S47-01 (T-19): A+ Demo Cut
**As a** student at the October 23 demo, **I want** real A+ content to study, **so that** the learning loop demonstrates value.

**Acceptance Criteria:**
- [x] 24 items exactly: 16 Core 1 (A2/A5 — DNS purpose/symptom ×4, DHCP lease ×2, gateway role ×2, port recognition ×2, safe-test selection ×4, isolate-and-verify next-step ×2) + 8 Core 2 (B2/B4 — phishing signals ×3, ticket field/resolution-note ×3, change-control/backup ×2) — **the word "reviewed" was struck here**: these carry provenance and lane logs, but no passing log (see S47-13)
- [x] Two complete lessons: A2 “Networking basics”, B4 “Operational procedures” (synopses per SPEC-04 04.7)
- [x] Every cut item names lesson, objective ID, reviewer, provenance record; RedEye lane log present
- [x] Practice sets draw only from the 24 items above and say so on screen
- [x] Remaining modules display as planned outlines; track shows “beginner preview”
- [x] ≥50% of pack items are diagnosis/next-action type (REQ-AP-06, CI-counted)

**Files:** `content/exams/COMPTIA-A-1201/`, `content/exams/COMPTIA-A-1202/`, `content/provenance/`

**Evidence:** shipped notes, findings, gates run and not-verified detail are in
[SPRINT-47-EVIDENCE.md](SPRINT-47-EVIDENCE.md) § S47-01.

### S47-02 (T-20): Network+ Demo Cut
**Acceptance Criteria:**
- [x] 25 items, five per domain (N1–N5 cut outline per SPEC-05 05.6), labeled “exploratory coverage” — explicitly not exam-weighted, on screen; **"reviewed" struck here too**, same reason as S47-01
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
- [x] ShellCheck gate + packaging fixtures — the ShellCheck gate and the icon-path/macOS behaviour
      fixtures landed in S47-09 (T-45), which is also where this row's macOS Step 7 defect was found

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

### S47-09 (T-45): ShellCheck + Packaging Fixtures
**Requirement:** R-24 (PKG, medium). "ShellCheck added to CI for packaging scripts; icon-path
behavior fixtures that execute the script paths, not syntax checks." Acceptance: "ShellCheck gate
with failing+passing fixture scripts; behavior fixtures run the AppImage/macOS scripts' diagnostic
branches and assert exit codes."

**Acceptance Criteria:**
- [x] ShellCheck gate over the packaging scripts (R-24's scope, not the whole repository's shell),
      wired into `build-linux`; it fails closed when shellcheck is absent rather than reporting a
      pass it did not earn
- [x] Failing + passing fixture scripts. The failing one is *accepted* by `bash -n`, *rejected* by
      ShellCheck on SC2181, and when run it exits 0 having produced nothing — R-24's defect class
      ("a conditional diagnostic can still exit 0 wrongly") is proven behaviourally, not just read
      off the text. The passing one prints the same warning sentence and exits non-zero
- [x] AppImage icon-path behaviour fixtures: the real script runs with and without an icon asset and
      each case asserts what landed in the AppDir and what was printed (cases J/K)
- [x] macOS behaviour fixtures: the real script runs under a controlled PATH with `ditto` stubbed
      and `create-dmg` absent, asserting the `.zip` fallback, the summary line, the absence of a
      `.dmg` claim and the recorded manifest (cases L/M) — the first executable coverage
      `build-dmg.sh` has ever had
- [ ] **Not verified:** the CI step's `pip install shellcheck-py` on the fleet runner (PyPI
      reachability from `ucs03-rtp` is untested here), and the macOS signing/notarization branches,
      which need credentials and a macOS host.

**Files:**
- `tests/gates/run_shellcheck_fixtures.sh` (new) — the gate and its fixture pair
- `tests/gates/fixtures/shellcheck/{bad,good}/build.sh` (new)
- `tests/gates/run_packaging_fixtures.sh` — cases J/K/L/M added
- `packaging/macos/build-dmg.sh` — Step 7 repaired; see the finding below
- `scripts/check-packaging-manifests.py` — two self-test anchors re-pointed at the repaired lines
- `.github/workflows/build.yml` — "ShellCheck gate (R-24)"; `.gitignore` — the CI venv

**Finding:** the macOS behaviour fixture executed Step 7 of `build-dmg.sh` for the first time, and it
could never have run. The manifest generator interpolated the script's own bash booleans into Python
source (`"signed": false`), so every build died on a `NameError` before writing the manifest — the
recorded outcome PKG-03 exists to produce was never written at all. Fixed by passing values through
the environment; full detail in the evidence file.

**Evidence:** shipped notes, findings, gates run and not-verified detail are in
[SPRINT-47-EVIDENCE.md](SPRINT-47-EVIDENCE.md) § S47-09.

### S47-10 (T-26): Demo Host Rehearsal
**Acceptance Criteria:**
- [ ] On the actual demo host: install → boot → full loop (pick track, read lesson, practice, complete scenario, reset) with network unplugged except optional tutor call
- [x] **Keyboard-only walkthrough passes** — the automated half of TM-48 ("manual + automated a11y"), which S47-03 handed forward to this row. `tests/e2e/rehearsal-web.mjs` drives all seven named critical flows (PKG:141) through a real browser using only key events, never `.click()`. **33 PASS / 0 FAIL / 1 NOTE** — every flow green; the note is the focus-after-reset observation below, not a defect. **Projector-distance readability is NOT verified** — no projector on this host; the harness measures reachability, not rendered legibility at distance.
- [ ] **Partly verified:** reset-between-groups — the mechanism passes by keyboard (reseed count + outcome render, learner keys cleared); **"between groups" on the demo host, at the podium, is not verified**
- [ ] Critical flow matrix (TM-50) entries for PWA-on-ChromeOS and PWA-on-presenter-host verified with recorded evidence — **no ChromeOS device or presenter host available; no evidence recorded**

**Files:**
- `tests/e2e/rehearsal-web.mjs` (new) — keyboard-only rehearsal of the seven critical flows; zero npm deps; not wired into CI (its browser legs belong to the hosted runner by design)
- `tests/gates/run_rehearsal_fixtures.sh` (new) — the fixture pair; widened at `a7d6cf6` to assert flows 6 and 7, and inverted to assert greenness at `6b327db` once the last gap turned out to be a harness defect
- `docs/qa/release-evidence/2026-10-23-rehearsal.md` (new) — the archived log, findings and not-verified list

**Findings — two demo-path defects, both closed at `a7d6cf6`; one harness defect, closed at `6b327db`.**
- **REQ-DEMO-05 — CLOSED** (`a7d6cf6`). The demo loop's scenario leg was mouse-only to enter: all 49
  nav items were `<a class="nav-item" data-route="…">` with no `href`, so none was focusable. All 49
  now carry `href="#<route>"`. That exposed a second defect the fix had to answer for: the closed
  `.hamburger-overlay` is hidden by `transform`, which moves it off-screen but leaves it in the tab
  order, so ~50 off-screen links preceded visible content (WCAG 2.4.3; TM-48). The closed overlay is
  now `inert`. Measured: 0 nav items in 25 tab stops closed, 14 open. The ticket lab **inside** the
  scenario was always fully keyboard-operable.
- **REQ-DEMO-02's banner defect — CLOSED** (`a7d6cf6`). A learner in normal mode was shown "DEMO
  MODE": `DemoBanner.js` set `el.hidden` correctly, but `.demo-banner { display: flex }`
  (`css/study.css:495`) outranks the UA `[hidden]` rule, so the attribute read as if it worked while
  the banner painted. `css/components.css` now restates `[hidden] { display: none !important }`.
  **Citation note:** the package defines REQ-DEMO-02 as seeded scenario state, not the banner — the
  behaviour was real, the requirement ID was wrong.
- **REQ-UI-04 — NOT A PRODUCT DEFECT** (`6b327db`). Flow 5's "reload" was `Page.navigate` to a URL
  whose hash had not changed — a same-document no-op in Chrome that does not reload the document. The
  leg read the DOM Flow 4 left behind, the graded verdict, which carries no prior-progress note by
  design, and reported a missing cold-load affordance from a page that was never cold. With a genuine
  `Page.reload`: `mode` idb, `get()` hits every key `keys()` returns, `restore()` returns `attempted: 1`,
  and the note renders. Nothing in the store or the view needed changing.
- **Observation:** focus after reset lands on `<BUTTON#demo-reset>`; the view is re-rendered via
  `replaceChild` and nothing restores focus — TM-48's "focus predictable after reset" is partly met.

**Three false results in this harness, found and fixed** — one failure mode, an assertion that could
not distinguish the thing it claimed to measure. (1) Flow 7 read `!.hidden` — the *attribute* — so it
passed for a banner on screen the whole time, and reached `#/demo` via that banner's link, which only
existed because of the bug. (2) Flow 6's Start walk began wherever focus happened to be; focus survives
a hash change while it sits on a *shell* element (nav items live outside `#view-container`), so the walk
started mid-list and its "45 Tab presses" described a route that skipped the whole shell — it would
have passed with nothing in the shell reachable. It now blurs first and walks from the top: **84
presses**. (3) The REQ-UI-04 false failure above. Each leg now asserts what makes it meaningful: the
banner the transition, the reload a marker that must not survive, the walk a defined start.

**Result at `6b327db`: 33 PASS / 0 FAIL / 1 NOTE.** The note is the focus-after-reset observation.

**Gate:** `run_rehearsal_fixtures.sh` PASS (exit 0). The live assertion is no longer inverted — every
flow is green, so the live tree must **PASS** the full run. The pair is unchanged: the de-tabbed-option
copy must FAIL and name the option row (proving the check detects a control removed from the tab
order), and the unmodified copy must PASS all seven flows. The runner is still not wired into CI — now
for the ordinary reason, that its browser legs belong to the hosted runner by design.

**Evidence:** full log, findings and not-verified detail are in [../qa/release-evidence/2026-10-23-rehearsal.md](../qa/release-evidence/2026-10-23-rehearsal.md).

### S47-11 (T-27): Tutor Go/No-Go
- [x] **Evaluation report from the rehearsed set** — `2026-10-23-tutor-eval.md`, regenerated and
  restamped at head `5a2a22e`. REQ-AI-06's set is complete: 12 answerable (incl. both demo prompts),
  6 unsupported/version-conflict, 6 injection/secret-extraction (+1 retrieval-text case), 3 runtime
  (offline/timeout/rate-limit). 206/206 checks; report records model, prompt version, pack version,
  per-case results and the decision.
- [x] **Explicit go/no-go** — **NO-GO on live AI; GO on the recorded-example fallback.** Not because
  the evaluation fails, but because REQ-AI-07's three preconditions are all unresolved: no provider or
  model chosen, no transmission right for the vendor-objective packs (the corpus index excludes all
  three for exactly that reason), and no cost posture (G-05 owner decision).
- [x] **Fallback labeling verified** — the label reads exactly `recorded example` on the mode pill and
  on every response, and answering makes **zero** network calls: asserted by
  `tests/gates/web/tutor-panel.mjs` (counts every attempt to leave the page) and by
  `tutor-eval.mjs`'s `tm67-recorded-mode`; `req-ai-05` covers the gateway-unreachable state.

**Files:**
- `docs/qa/release-evidence/2026-10-23-tutor-go-no-go.md` (new) — the decision record
- `docs/qa/release-evidence/2026-10-23-tutor-eval.md` — regenerated at head `5a2a22e`

**Not verified:** live model behaviour (nothing exercises a real provider — the gates are proven to
*fail* against misbehaving responders, which is not the same as a model passing them); human source
review (packs are `draft`, no `sourceReviewDate`); the panel on the actual demo host (same PKG:1469
block as S47-10).

**Evidence:** [../qa/release-evidence/2026-10-23-tutor-go-no-go.md](../qa/release-evidence/2026-10-23-tutor-go-no-go.md).

### S47-12 (T-28): Backup Evidence
**Acceptance Criteria:**
- [x] **Screenshots captured** — 12 frames (1.3 MB) in
  `docs/qa/release-evidence/2026-10-23-demo-shots/`,
  walking the seven named critical flows (PKG:141) in demo order, then the
  recorded-example tutor. Taken from the artifact the demo serves, not a
  rebuild. **Screenshots only, no video.**
- [x] **Committed with the record** — a backup that lives only on one
  workstation is not a backup.
- [x] **Non-AI backup path rehearsed** (REQ-AI-07) — frame 12 is the recorded-
  example tutor answering a real demo prompt, with the `recorded example` mode
  pill, the *"Reviewed in advance — not a live model"* line, and *"No AI service
  is connected."* The capture script **throws** if the panel is in any other
  mode, so the frame cannot be produced from a live panel. The no-network-call
  half is asserted by `tests/gates/web/tutor-panel.mjs`, not re-asserted here.

**Not a projector measurement.** Fixed 1440x900 headless viewport, no projector in the loop; nothing
here speaks to legibility at distance (T-26's manual half, unverified).

**Every frame paints the DEMO MODE banner** — including frames 01–09, captured
*before* the script enters demo mode. This was the S47-10 banner defect,
confirmed visually here: `.demo-banner { display: flex }` beat the UA `[hidden]`
rule, so `el.hidden` was set and the banner painted anyway. **The 12 PNGs are
now stale** — they still show the defect. Closed at `a7d6cf6`; recapture owed.

**Files:**
- `tests/e2e/capture-demo-shots.mjs` (new) — zero-dep CDP capture; fails closed
  without a browser, throws rather than writing a partial set
- `docs/qa/release-evidence/2026-10-23-demo-shots.md` (new) — the record
- `docs/qa/release-evidence/2026-10-23-demo-shots/` (new) — the 12 PNGs

**Not verified:** projector readability; the actual demo host (PKG:1469);
video; the *switch* from a failed live segment to the fallback mid-demo;
offline behaviour; TM-50 ChromeOS / presenter-host entries.

**Evidence:** [../qa/release-evidence/2026-10-23-demo-shots.md](../qa/release-evidence/2026-10-23-demo-shots.md).

### S47-13 (T-29): Freeze
**Acceptance Criteria:**
- [x] **Branch, base/head SHA, changed files recorded** — `feature/rtp-beginner-tracks`,
  base `0a11c47` (`main`), **head `0d1f565`**; 61 commits, 310 files (+32,609 / −788)
- [x] **Gate results with counts (“N/N at SHA”)** — **39/39 at `0d1f565`**, reproducible
  via `bash tests/gates/run_freeze_chain.sh --expect-sha 0d1f565…`, which runs the same
  commands in the same order as CI and refuses to quote a total measured elsewhere
- [x] **Test counts per suite** — `Core.Tests` 257/257; `Desktop.Tests` 51/51;
  coverage 2191/2373 = 92.33% (threshold 70%); vuln gate PASS over 3 projects
- [x] **RedEye lane logs + seeded-defect self-test record** — 13/13 seeds caught
  (wrong key, mis-mapped objective, 8-item position bias, near-duplicate, injection,
  incomplete provenance), lane and gate self-tests pass
- [x] **Usable build** — Core/Desktop/Desktop.Tests build in Release; Core 0 warnings
- [x] **No content edits after freeze; no architecture migration in Sprint D** —
  S47-14 and S47-15 are documentation-only

**The ship-gate is honestly red.** `redeye-gate.py --all` → **exit 1, 49/49 scored
items excluded** (`verdict: return`, modelStage blocked — no provider configured). That
is REQ-REV-05 failing closed by design, and it means the A+/Network+ packs are **draft
packs for the beginner preview, not released items**. Recorded plainly because the
sprint acceptance criterion says “a scored practice set of reviewed original items” and
by the gate's definition none of the 49 is releasable.

**Two corrections made here** rather than left standing: `SPRINT-47-EVIDENCE.md`
§ S47-03 claimed `redeye-gate --all` exit 0, which the tool cannot produce while every
verdict is `return` (the packs already held 49 items at that commit); and
`Desktop.Tests` had no recorded run anywhere — CI builds it and executes nothing, and
`dotnet test` refuses it on .NET 10, so it was run via the MTP-native runner for the
first time here.

**Files:**
- `tests/gates/run_freeze_chain.sh` (new) — the reproducible chain
- `docs/qa/release-evidence/2026-10-23-freeze.md` (new) — the record
- `docs/sprints/SPRINT-47-EVIDENCE.md` — § S47-03's `redeye-gate` line corrected

**Not verified:** the actual demo host (PKG:1469); projector readability; TM-50
ChromeOS/presenter-host entries; human source review; RedEye model-stage verification;
reset-between-groups in a live room; offline; the mid-demo fallback switch; video;
deployed-Pages behaviour; live AI behaviour. Full list in the record.

**Evidence:** [../qa/release-evidence/2026-10-23-freeze.md](../qa/release-evidence/2026-10-23-freeze.md).

### S47-14 (T-30): Demo Script
**Acceptance Criteria:**
- [x] **90-second loop, four beats** — learn (0:00–0:15), try (0:15–0:35), ask
  (0:35–0:55), verify (0:55–1:20), reset (1:20–1:30), each with the spoken line
- [x] **Exact REQ-BRAND-02 disclaimer** — present verbatim and now **enforced**:
  authoring the script is what arms the brand gate on this surface
- [x] **“No patient or business system is involved”** — the first of the three
  sentences to say plainly
- [x] **Written against actual behaviour, not intent** — the script routes around
  the recorded gaps rather than being discovered live: it tells the presenter to
  reach the scenario **with the mouse** (REQ-DEMO-05) and warns that the purple
  banner is always painted (REQ-DEMO-02). It also says plainly that the tutor is
  the **recorded example** (the S47-11 no-go), so the whole loop runs with the
  network unplugged

**The brand gate earned its keep immediately.** It rejected the first draft on two
hits — `"Is this the official CompTIA training?"` and `"vendor-approved"` — which is
exactly the endorsement surface REQ-BRAND-01 exists to catch. Both reworded; the
gate now reports the script's disclaimer as an exact occurrence and passes.

**A vacuous check, found and made real.** `brand-disclaimer-snapshot.mjs` asserted
the demo script carried the disclaimer by looking for `docs/demo/DEMO-SCRIPT.md` —
a filename nothing ever matched — so it logged *"pending"* on every run and
enforced nothing. It now uses the same glob as `check-brand.py` (`docs/demo/*.md`),
so the two gates cannot disagree about where the script lives. Proven to
discriminate: stripping the disclaimer from the script turns it **red** naming the
file; restoring it turns it green. That check was previously green either way.

**Files:**
- `docs/demo/2026-10-23-demo-script.md` (new) — the script
- `tests/gates/web/brand-disclaimer-snapshot.mjs` — candidate list replaced with the
  brand gate's glob

**Not verified:** the script has not been **read aloud on the demo host** at
podium pace — the timings are budgeted, not measured, and PKG:1469 still blocks
the host. Nothing here was rehearsed in a live room.

**Evidence:** the script itself is the deliverable; see
[../../demo/2026-10-23-demo-script.md](../../demo/2026-10-23-demo-script.md).

### S47-15 (R-10): LICENSE Decision Record
**As an** owner, **I want** the missing LICENSE resolved honestly, **so that** README claims match reality.

**Acceptance Criteria:**
- [x] **Decision record prepared in advance** — `docs/LICENSE-DECISION.md`: the
  finding, the SPDX BSD-3-Clause text ready to drop, and the HG-01 confirmation
  stated as one line
- [x] **README pointer prepared, and the unbacked claim withdrawn** — the
  `## 📄 License` section no longer asserts a license the repository cannot
  produce; it says *proposed, not yet in effect*, links the record, and states
  that the file lands on confirmation. The three surfaces that claim it (badge,
  tree line, section) are named so the drop sweeps all of them
- [x] **Code / original content / third-party distinguished (C-08)** — the record
  separates what the license would cover (code; and original content, which the
  owner is asked to confirm explicitly) from what it cannot
- [x] **Does not license vendor manuals or question banks (C-09)** — stated
  plainly, with the two `docs/` manual files named
- [x] **File drop waits on HG-01** — **no `LICENSE` file is dropped**, and the
  copyright holder line is left blank rather than invented

**Two things found while writing it, both recorded rather than fixed:**

1. **The two vendor manuals are not in the repository.** `docs/AHV-Admin-Guide-v11_0.pdf`
   and `docs/Prism-Central-Guide-vpc_7_5.pdf` are 132 and 133 bytes — large-object
   pointer text naming objects of 4,323,527 and 19,424,163 bytes — and there is **no
   `.gitattributes`**, so no filter is configured and nothing is tracked that way
   (`git check-attr filter` → `unspecified`). A clone gets pointer text where a manual
   is claimed. Found by the **release-truth gate** (S47-08) rejecting the first draft
   of this section — the gate caught a claim the repository cannot keep, in the row
   about claims the repository cannot keep.
2. **The README's own disclaimer is a paraphrase** — *"not affiliated with or endorsed
   by Nutanix, Inc."* — not the exact REQ-BRAND-02 string, and it is ungated:
   `check-brand.py` scans `Web/`, `content/` and the demo-script glob, not the repo
   root. Worth closing when the README is rewritten.

**Files:**
- `docs/LICENSE-DECISION.md` (new) — the decision record
- `README.md` — `## 📄 License` section rewritten

**Not verified:** the owner's confirmation (HG-01) has not been given, so the license
is **not in effect** and no file is dropped. The `<YEAR>`/`<COPYRIGHT HOLDER>` line is
the owner's to supply — the project was renamed from a fork (`2e4f008`), so the earliest
commit here does not settle first-publication authorship.

**Evidence:** [../../LICENSE-DECISION.md](../../LICENSE-DECISION.md).

---

## Sprint Acceptance (October 23 demo-ready definition, SPEC-00 00.5)

A presenter can open the PWA on the demo host, pick track-aplus or track-netplus, read one complete lesson per exam, run a scored practice set of draft original items (draft-preview — no item carries a passing lane log), complete a deterministic simulated help-desk task, ask the tutor for a hint inside its stated limits (or play the labeled recorded example), reset the station for the next group — all with the network cable unplugged except the optional tutor call. Coverage labeled “beginner preview”; no pass-prediction claim anywhere; every SPEC-08/10 gate green at the tested head including the vulnerability gate proven by a must-fail fixture. Release evidence records gate counts at the frozen head.

## Mini-retrospective (SPEC-11 11.10)

**Sprint head `7a21f6b`; 39/39 gates at that SHA** (re-run), Core 257/257, Desktop
51/51, coverage 92.33%. Full retrospective, including why seven rows are 🟡 and what
was not verified: [SPRINT-47-RETROSPECTIVE.md](./SPRINT-47-RETROSPECTIVE.md) — a
companion file, split out because this one reached the 500-line limit. S47-16, opened
after the sprint, closed later: R-12's counts check is now `scripts/check-readme-counts.py`.
