# OpenSpec SPEC-09 — Runtime, Scoring and Simulator Repair

**Source:** [OpenSpec package rtp-beginner-tracks-2026-10](../../drive-ingest-2026-10-10/RTP-Beginner-Tracks-Openspec-Change-Package-A-Network-NCA75-v2.md), SPEC-09
**Executed in:** [SPRINT-45](../SPRINT-45.md) + [SPRINT-46](../SPRINT-46.md) (T-01..T-05, T-37..T-44 distribute by dependency) · **Gates:** per-finding fixtures; TM rows cited inline · **Depends on:** nothing

## Purpose

Own every runtime finding from the October 10 audit with an exact fix and acceptance criteria. Nothing here is deferred: each finding has files, a test and a passing condition. The owner directive “we have to address it all” is the bar.

## Sequencing constraint

R-01 and R-02 are on the demo critical path and land before any demo-pack content is declared done, because content on an unbootable or auto-passing surface is unverifiable. R-03/R-04/R-07 gate content authoring (fixtures depend on scoring truth). R-05/R-06 gate the desktop parity claim. R-08/R-09 gate release of any scored pack. R-10 waits on HG-01 (owner LICENSE confirmation) only for the final file drop; the decision record and README pointer are prepared in advance. R-13 through R-24 inherit the sprint slots in SPEC-11 (T-37..T-45); none is parked.

## Findings (R-01 .. R-24)

Each row: finding, fix, acceptance.

### R-01 — PWA boot failure (critical, runtime-confirmed)
`Web/js/views/pe-reports.js` line 7 imports `../components/ConfirmDialog.js`; the components directory contains `Confirm.js` (export `confirm`), not `ConfirmDialog.js` — module-resolution failure preventing the PWA application graph from booting, in tree since June. Historical reconciliation (ASM-15): an older copy/build worked on Windows; the current PWA source does not boot anywhere.
**Fix:** correct the import to `../components/Confirm.js`; add module-graph import check (`scripts/check-imports.py`, case-sensitive, matching the deploy host’s filesystem semantics) to CI and the Pages predeploy gate (SPEC-10 CI-03).
**Acceptance:** clean-browser boot of the built PWA reaches /pe/dashboard with zero console errors; check-imports.py fails the build on a reintroduced bad import; desktop CefGlue host boots the same assets.

### R-02 — Scenario validator integrity (critical, runtime-confirmed)
27 of 78 objective predicates in `Web/js/views/scenarios.js` are literal `() => true`; 16 of 44 scenarios complete on a fresh seed; us-bucket-01 reads the wrong collection (`state.getAll('buckets')` entries the Objects flow never produces) and cannot pass. Some predicates rely on pre-existing seed counts or exclude entities by hardcoded names.
**Fix:** per-scenario fixture + validator rewrite under the SPEC-07 contract (REQ-SC-01..06): static scan forbids constant-true validators; fresh-seed negativity and solvability walkthroughs for all 44 scenarios; us-bucket-01 repaired to real mutation paths or corrected to supported mutations, choice documented.
**Acceptance:** REQ-SC-01..06 scenarios pass; demo sweep (TM-45) reports all 44 scenarios boot/run/incomplete-then-complete; us-bucket-01 has a passing walkthrough replay.

### R-03 — Ordering questions graded unordered (high, runtime-confirmed)
The Question model stores a list of correct letters with no response type; `IsMultiSelect` is `CorrectAnswers.Count > 1`; the session view model stores selections in a HashSet and sorts both sides before comparing. NCA gap-fill Q16-19 are ordering prompts (e.g., Q17 key “D, C, B, A”) that sorted-set equality grades as correct under any permutation.
**Fix:** explicit ordered-response type in the Question model and parser (front matter `type: ordered`), scored by sequence equality on stable semantic option IDs (never visible letter positions — the UI may shuffle). Until shipped, quarantine ordering items from scored packs OR convert — with reviewer approval — to single-choice items whose options are whole sequences. Conversion changes the exercise; it is not a mechanical parser operation.
**Acceptance:** regression fixtures: two permutations with identical letters (only the intended one passes), missing step, duplicate step, extra token, empty response, reversed order, correct order with display shuffle. Quarantined items excluded from released packs and listed in the pack report.

### R-04 — Retry double-accounting (high, runtime-confirmed)
Retrying a question double-counts attempts/statistics.
**Fix:** attempt recording idempotent per (itemId, sessionId, attemptId); a retry creates a new attemptId but stats aggregation counts distinct attempts with explicit rules (first-attempt and latest-attempt metrics separated).
**Acceptance:** fixtures prove answering, retrying and re-answering produce exactly the defined attempt counts; progress export shows no inflated totals.

### R-05 — Desktop bridge fake effects (high, runtime-confirmed)
Desktop bridge handlers for stats/reset/settings/submit/import acknowledge without effects. The newer JsonSessionStore works, but nothing calls it end-to-end; the desktop exam-session view model does not consume the simulator session store; the bundled JavaScript does not call the save/load progress handlers.
**Fix:** wire every handler to a real implementation or remove it; every acknowledgement tied to a verified state change — save returns success only after the write succeeds, reset removes defined session data and confirms the new baseline, settings updates persist and re-read.
**Acceptance:** per-handler tests prove effect-then-acknowledge; a handler with no backing implementation is absent from the bridge surface (listing it is a test failure).

### R-06 — Persistence not wired end-to-end (high)
Covered by R-05 fixes plus REQ-UI-04/05. Additional requirement: desktop consumes SessionStore for simulator sessions and ProgressStore-equivalent state for exam sessions; learner resumption works across app restart.
**Acceptance:** E2E (desktop headless + PWA browser) saves progress, restarts the process, asserts restored state; demo mode uses a deterministic ephemeral store and retains nothing between groups.

### R-07 — Parser silently drops valid multi-answer keys (high, source-proven)
`AnswerRegex` (`^\*\*(?:Correct )?Answer:\s*([A-F][,\s]*(?:[A-F][,\s]*)*)\*\*`) does not match “Answer: B and D”. `NCP-AI-Part4.md` Q61-70 use that form (verified) and are silently dropped — the catalog counts headers while parsed items vanish.
**Fix:** extend the answer grammar to accept `,`, `and`, `&` separators, normalizing to letter lists; add a parse-vs-catalog count reconciliation check (every question header yields exactly one parsed question or a loud error); repair NCP-AI-Part4.md keys to canonical form.
**Acceptance:** fixture file with all separator forms parses to identical key sets; reconciliation gate fails CI on any dropped question; NCP-AI-Part4 yields its full item count.

### R-08 — Keyword coverage masquerades as curriculum coverage (high)
`HardcodedBlueprintService.CalculateCoverage`/`GetObjectivesForQuestion` match configured keywords against question text — distractor hits, negations and explanation mentions inflate objective coverage.
**Fix:** released packs carry explicit objective IDs per item (manifest-driven); keyword matching demoted to an authoring recommendation proposing candidate mappings for a reviewer; legacy bank records marked `mappingStatus: inferred` until reviewed; inferred-only items never enter released scored packs.
**Acceptance:** fixtures prove a distractor containing a keyword does not count as objective coverage; coverage reports separate lesson coverage, question coverage and practical-task coverage; CI fails when a released item lacks a reviewed objective ID.

### R-09 — Answer-position bias (medium/high, verified distributions)
NCP-AI-Part1.md 80/80 single-answer keys are A; NCP-AI-Part2.md 79/80 A; NCM-MCI-Part1.md 79/80 A; NCP-CI-Part2.md 79/80 A. A learner can farm apparent accuracy by position.
**Fix:** content pipeline emits an answer-position distribution report (per file/module/pack) as a review aid; runtime shuffles options through stable option IDs where the item’s meaning allows (excluding “all of the above”, letter-referential wording and ordering items); new A+/Network+/NCA-pilot items authored position-balanced. Scores reported as practice completion, never readiness probability (ties to REQ-AP-03).
**Acceptance:** the distribution report fails CI when a new pack exceeds a declared concentration threshold; shuffle fixtures prove identical grading across permutations; report output archived with release evidence.

### R-10 — Missing LICENSE (medium)
README claims BSD-3-Clause and links a root LICENSE that does not exist (404 at head).
**Fix (default resolution ASM-10):** add the BSD-3-Clause LICENSE matching the README’s claim — a one-line owner confirmation (HG-01, the package’s sole standing code-license gate, because it names a legal instrument). Adding a code license does not license vendor manuals or question banks (C-09 remains a rights-review workflow).
**Acceptance:** LICENSE present at root; README link resolves; docs/license note distinguishes code, original content and third-party material (Plan v2 C-08).

### R-11 — Simulator source duplication (high, cross-platform directive)
Covered by SPEC-01 D3: one authoritative simulator source in RadicalTrainingPlatform.Web; Legacy.WinForms/LabSimulator consumes built assets or is removed; the unwired Desktop/Simulators manifests (listing routes pointing at absent view files) reconciled — migrated to the current manifest schema or removed explicitly; CI detects any second authoritative copy (Plan v2 F-04).
**Acceptance:** bridge-parity fixtures run identical scenario traces through the PWA (WebView2/postMessage and standalone mock) and the desktop (CefGlue) hosts with identical validator outcomes; the duplication-detection gate fails on a reintroduced copy.

### R-12 — Stale docs as current truth (medium)
README describes a .NET 8 WinForms tool with 1,458 questions and four exams; current main is .NET 10 with 1,598 records across five banks. Sprint plans and design docs under docs/ predate the current architecture.
**Fix:** README corrected to the current stack, counts generated not hand-written (C-08), older audit/plan documents labeled historical with a folder index naming the current set.
**Acceptance:** README facts match CI-generated counts; docs index exists; no stale “current” label remains on superseded documents.

### R-13 — Content identity too narrow (high)
get_question lookup contract keyed on display numbering collides when multiple source files contribute Q1s to one exam.
**Fix:** replace the get_question lookup contract with an immutable source-aware item ID containing exam, source and local question ID, revision handled by the manifest; keep display numbering separate. Specify migration or an explicit ambiguity response for legacy EXAM:number callers; adding a BRIDGE prefix alone does not distinguish multiple source-file Q1 items.
**Acceptance:** fixture with two Q1 items from two files in one exam resolves correctly.

### R-14 — Contradictory outcome sets on retry (NET-03, high)
A retry can leave the item’s recorded outcome contradicting itself (first vs latest attempt stored in different places with different winners).
**Fix (proposed default D9; production policy confirmed by owner):** first-attempt and latest-attempt recorded as separate, explicit metrics; displayed outcome = latest; statistics can report both.
**Acceptance:** fixtures test BOTH retry directions (pass-then-fail and fail-then-pass) and assert the defined outcome set in each; no state where first and latest disagree without both being visible.

### R-15 — Stats/Blueprint study-continuation loss (NET-06, high)
Leaving to Stats or Blueprint and returning loses the study session’s continuation point.
**Fix:** session continuation is part of ProgressStore state; returning restores position, current item and in-progress answers.
**Acceptance:** E2E navigates away mid-session to Stats and Blueprint and asserts exact restoration on return.

### R-16 — Cached disposed simulator reuse (NET-07, medium, source-proven boundary)
A cached simulator reference can be reused after disposal. Native revisit untested; the package keeps that boundary: unit-level lifecycle guards land now, and a prescribed manual native check is scheduled evidence, not claimed proof.
**Fix:** disposal guards on the cached reference path; reuse-after-dispose throws loudly rather than acting on a dead host.
**Acceptance:** unit fixtures prove the guard; the manual native revisit listed as prescribed-but-not-yet-executed evidence in the release record.

### R-17 — Sidebar streak and Skip notifications (NET-09, medium)
The sidebar’s streak display and Skip-related notifications misbehave per runtime evidence.
**Fix:** streak derives from actual attempt history (not a counter that retries inflate — R-14 policy applies); Skip notifications fire only on real skip events.
**Acceptance:** fixtures for streak computation across retries and for notification on skip vs non-skip actions.

### R-18 — Review PDF export broken (NET-10, high for demo handouts)
Export fails because the display label is used as the canonical exam code on the PDF path.
**Fix:** canonical exam ID and display label separate fields everywhere (SPEC-02 model already separates them); `Core/PdfExport/ExamPdfExporter.cs` takes the manifest’s canonical ID; footer becomes vendor-neutral per R-12: track title, unaffiliated status, official exam code, pack version, review date.
**Acceptance:** export fixture per released pack renders with correct canonical code and vendor-neutral footer; the old failure reproduced first and archived.

### R-19 — Installed content independence and Legacy bridge truth (NET-11, high)
Three parts: installed bundles load banks+errata independent of the source tree (PKG-01’s clean-directory test is the acceptance); the Legacy WinForms bridge’s parity and error-response surface narrowed to what is actually implemented (R-05); release-download availability truthful — with zero releases/tags today, docs point to build-from-source until a bundle exists (SPEC-10 10.5).
**Acceptance:** TM-54 plus a docs-truth fixture asserting no link to a nonexistent release.

### R-20 — Session-store durability (NET-12, medium — hardening risk; no reproduced loss)
JsonSessionStore writes are not atomic; a crash mid-write could leave a truncated or corrupt session file; recovery behavior undefined. Session-ID rules exist but lack platform-difference tests.
**Fix:** write-temp-then-rename atomic save; corrupt-file recovery that quarantines the bad file and starts clean with a loud notice; ID safety tests across Windows/Linux/macOS path rules.
**Acceptance:** kill-during-write fixtures never yield a half-written file; corrupted fixture file → quarantine + clean start; ID fixtures pass on all three platforms’ path constraints.

### R-21 — CefGlue NoSandbox=true (medium, hardening review — no exploit assertion)
The desktop embedded browser runs with NoSandbox=true. No exploit asserted; a scoped hardening review is scheduled.
**Fix:** navigation allowlist for the embedded browser, bridge surface minimization (R-05/R-19), update-channel review, recorded outcome.
**Acceptance:** the review record exists with its decision; navigation outside the allowlist blocked by fixture test if the review keeps the embedded browser in the demo path.

### R-22 — Web runtime batch (mixed severity, each with its own fix and fixture)
- pc-insights and pe-capacity leave `this.root` unset (view lifecycle repair + render fixtures)
- ci-networking calls nonexistent `state.get` — the accessor is `getById` (repair + fixture proving the real accessor is exercised)
- CLI alert path has an async Promise mismatch (handlers resolve to text, never a Promise object — fixture asserts resolved text)
- audit log persists one write late (write ordering fix + ordering fixture)
- router has an overlapping-render source risk (render serialization + fixture)
- initial validator wraps the whole list in one catch (per-item isolation so one bad item cannot blank the list — fixture with one poisoned item)
- scenario attempt/reset/history gap (attempt recording and history on scenario runs, wired to REQ-DEMO/TM-44)
- placeholder/breadcrumb cosmetics (fixed labels; snapshot fixtures)

**Acceptance:** one fixture per bullet, each reproduced before and passing after; no bundled “web fixes” commit without per-fixture evidence.

### R-23 — Storage recovery acceptance boundary (unverified, prescribed test)
localStorage/IndexedDB recovery behavior (quota pressure, corrupt entry, blocked storage) is an unverified boundary, not a confirmed defect.
**Fix:** prescribe the tests; implement honest outcomes (Plan v2 L-02 pattern).
**Acceptance:** TM-34 extended with corrupt-entry and quota fixtures; results recorded either way — a finding only if a test fails.

### R-24 — Packaging script correctness (PKG, medium)
The missing-bracket runtime defect class: `bash -n` passes while a conditional diagnostic can still exit 0 wrongly.
**Fix:** ShellCheck added to CI for packaging scripts; icon-path behavior fixtures that execute the script paths, not syntax checks.
**Acceptance:** ShellCheck gate with failing+passing fixture scripts; behavior fixtures run the AppImage/macOS scripts’ diagnostic branches and assert exit codes.
