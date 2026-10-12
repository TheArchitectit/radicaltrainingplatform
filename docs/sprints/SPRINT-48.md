# Sprint 48: OpenSpec Sprint E — NCA 7.5 Current-Blueprint Track (California)

**Phase:** 5 — Product-Track Enablement
**Source:** OpenSpec change package `rtp-beginner-tracks-2026-10` (docs/drive-ingest-2026-10-10), SPEC-11 Sprint E (after EPIC, before California travel, Oct 25–28 trip)
**Duration:** Post-EPIC window, before the Oct 25 departure freeze (cutoff confirmed from itinerary per ASM-09)
**Goal:** Transform the NCA track from beta-era content to the current official blueprint (June 15, 2026 guide: AOS 7.5 / AHV 11.0 / Prism Central pc.7.5) — 140-item remap, 40-item reviewed pilot, 14 lessons, four deterministic scenarios, corrected companion surfaces — and freeze before travel.

**Reference package:** [OpenSpec package](../drive-ingest-2026-10-10/RTP-Beginner-Tracks-Openspec-Change-Package-A-Network-NCA75-v2.md) — requirements REQ-NCA-01..08, REQ-SC-01..06, C-05/C-07, test matrix TM rows for NCA.

**Relationship to Sprint 24:** Sprint 24 planned broad NCA-75 bank expansion (240+ questions). This sprint supersedes only the beta-blueprint portions; expansion remains Sprint 24 scope. Review of remapped items starts in parallel during Sprints 46–47 so the post-EPIC window is not the only path.

---

## Sprint Backlog

| ID | Task | Requirements | Points | Status |
|---|---|---|---|---|
| S48-01 (T-31) | Complete remap.csv (started T-09) with RedEye lane logs and seeded-defect self-test record | REQ-NCA-01 | 3 | 🟡 |
| S48-02 (T-32) | NCA-75 exam.json current blueprint; InitNca75 retired; blueprint fixtures | REQ-NCA-05 | 2 | 🟡 |
| S48-03 (T-33) | 14 lessons + 40-item pilot (remapped + newly authored gap fills) | REQ-NCA-02/06 | 3 | 🟡 |
| S48-04 (T-34) | Cheatsheet correction + beta logistics cleanup + scheduling-link currency | REQ-NCA-04, C-07 | 1 | 🟡 |
| S48-05 (T-35) | Four NCA scenarios with validators and walkthroughs | REQ-NCA-07, REQ-SC-01..06 | 2 | 🟡 |
| S48-06 (T-36) | Travel freeze per REQ-NCA-08 once itinerary confirms cutoff | REQ-NCA-08 | 1 | 🟡 |

**Status key:** ✅ shipped and verified on this host · 🟡 shipped and gated, with named verification gaps listed under the row's *Not verified* notes · ⚪ not started.

**Total:** 12 points

---

## User Stories

### S48-01 (T-31): Complete the Remap Inventory
**As a** track maintainer, **I want** every one of the 140 NCA-75 items mapped to the current blueprint, **so that** remapping attaches new mappings without renumbering.

**Acceptance Criteria:**
- [x] `content/exams/NCA-75/remap.csv` complete: exactly 140 rows, every item ID resolves to a parsed question, every row carries review state (columns per SPEC-01 01.3) — enforced by `scripts/check-nca-remap.py`, whose failure mode is a `--self-test` fixture set (7 seeded defects + 1 clean 140-row inventory) and `tests/gates/run_remap_fixtures.sh`
- [x] Existing question IDs never change; remap attaches mapping only — the validator asserts the itemId set **equals** the bank's question set, so a dropped, invented or renumbered ID fails
- [ ] Every remapped row passes the RedEye lane with remap-aware checks (key re-verification against current documentation, explanation re-read, mapping check, rights status) — **the lane runs and every one of the 140 is `return`/excluded**; the key-vs-source stage is blocked (no provider) and `mapping-check` fails on missing provenance records, which the lane reads instead of `remap.csv`
- [x] Errata fixtures still pass: NCA-75-Part1 Q35 = D; NCA-75-Part3-GapFill Q3 = A (REQ-NCA-03)
- [x] Lane logs + seeded-defect self-test record archived in release evidence

**Status 🟡 because:** the inventory is complete and enforced, but the row's own
"every remapped row passes the lane" line is not met and is not claimed to be.
That needs either the radredeye model stage (REQ-REV-05) or provenance records
under `content/provenance/NCA-75/` — neither exists yet. Recorded, not smoothed.

**The finding of the row — a ship gate that could not fail.** Before this work,
`python3 scripts/redeye-gate.py NCA-75` printed **"✅ GATE PASS"** and exited 0
while gating **zero items**: `gate_exam` looked only in
`content/exams/NCA-75/questions/` (empty), and the 140 real items live in root
banks where SPEC-06 requires them to stay. Fixed: `collect_banks` now finds
legacy root banks using the same `derive_exam_code` port `check-item-identity.py`
uses, `parse_items` takes the exam id, and **`gated == 0` is a failure** — so
"nothing gated" and "everything verified" can no longer print the same line. Two
self-test cases pin it. This is the third gate in this package found green while
enforcing nothing (after S47-13 and S47-14).

**Two measured facts the validator reports rather than hides:** 60 gap-fill rows
carry no `oldObjectiveId` (that bank is organised by section, not beta
objective — the blank is the true provenance), and **objective 3.2 has zero
mapped items**, which is narrower than SPEC-06's estimate of the gaps (1.x, 2.4,
4.3, 4.4 all *do* have bank items).

**Files:**
- `scripts/check-nca-remap.py` (new) — the validator
- `tests/gates/run_remap_fixtures.sh` (new) — 7 seeded defects + a clean inventory
- `scripts/redeye-gate.py` — `collect_banks`, `parse_items(exam_id)`, `gated == 0` fails
- `scripts/redeye-lane.py` — explicit paths take precedence; `--exam` supplies the id for root banks
- `tests/gates/redeye/self_test.py` — two new cases (bank-less exam fails; root banks discovered)
- `.github/workflows/build.yml`, `tests/gates/run_freeze_chain.sh` — gate wired in
- `content/exams/NCA-75/remap.csv` — unchanged (already complete); validated, not rewritten

**Not verified:** no key or explanation re-verified against current documentation
(all 140 flags deliberately `false`); the lane's `mapping-check` cannot read
`remap.csv`; `rightsStatus` is an assertion, not a review; the 40-item pilot does
not exist yet, so nothing here names release candidates; objective 3.2's gap is
measured, not filled. Full list in the evidence record.

**Evidence:** [../qa/release-evidence/2026-10-25-nca-remap.md](../qa/release-evidence/2026-10-25-nca-remap.md).

### S48-02 (T-32): Current Blueprint Manifest
**As a** learner, **I want** the NCA track to present the current official blueprint, **so that** I never study the beta structure by accident.

**Acceptance Criteria:**
- [x] `content/exams/NCA-75/exam.json` encodes the current four sections / 14 objectives: 1 Solutions and tools (1.1–1.3), 2 Platform administration (2.1–2.4), 3 Cluster configuration and maintenance (3.1–3.3), 4 Health and monitoring (4.1–4.4) — asserted section-by-section, objective IDs and titles, against the repo's real manifest rather than a temp copy
- [ ] Manifest carries displayName “Nutanix Certified Associate 7.5”, officialVersion with June 15 2026 guide date, productVersions AOS 7.5 / AHV 11.0 / pc.7.5, sourceUrl + sourceReviewDate from an actual human source review — **all of this is in place except the last clause**: `sourceReviewDate` is `2026-10-10`, the ingest date all four manifests share. I did not open the Nutanix guide, so per SPEC-02 the date is not copied from the spec as if reviewed
- [x] No weightPercent — equal study allocation, labeled as study choice (ASM-13)
- [x] `HardcodedBlueprintService.InitNca75` (beta 20/30/25/25 structure) removed or annotated obsolete with a pointer to the manifest
- [x] `ManifestBlueprintTests.cs` fixtures assert manifest sections/objectives/IDs match the current guide; beta section titles never render

**Status 🟡 because:** the one unmet line is the identity criterion's closing clause —
`sourceReviewDate` is not attested as an actual human source review. Everything
else in the row is landed and enforced; this is recorded rather than smoothed.

**Deleted, not annotated — and why that is the stronger reading.** REQ-NCA-05
allows "removed or annotated obsolete". The beta block is **removed**:
`GetBlueprint("NCA-75")` returns `null` from `HardcodedBlueprintService`, and a
fixture pins it. The reason is that "the beta section titles never render" is not
satisfiable by an annotated-but-live block — `BlueprintCanvas` renders
`$"Section {n}: {title}"` straight off `IBlueprintService`, so any code path where
the manifest is not loaded (no `content/` tree, loader failure) would still paint
"Describe Lifecycle Management" onto a learner's blueprint view. Deleting closes
those paths instead of documenting them. Two `BlueprintServiceTests` facts that
depended on the fallback serving NCA-75 are rewritten against blueprints that
remain hardcoded, and one of them was found **vacuous** in the process
(`coverage.Count.ShouldBeGreaterThan(0)` is true for any recognised exam even when
nothing matched; it now asserts a count).

**Study allocation as a choice, not a weight.** The manifest gains a
`studyAllocationLabel` field (`ExamManifest.StudyAllocationLabel`): the June 15,
2026 guide publishes no section percentage table, so no section carries
`weightPercent` and the equal 10-per-section allocation says so in its own words.
A fixture asserts all four sections are `null`-weighted, all allocations equal 10,
and the label contains "not a published exam weight".

**Deliberate deviation — REQ-NCA-02's wording collides with REQ-BRAND-01.** The
label first read "not an **official** exam weight". `check-brand.py` forbids the
word `official` (whole-word, case-insensitive) and failed on both
`exam.json:14` and the generated `study-content.js:841`. The wording is now "not a
**published** exam weight", which carries the same meaning and passes the brand
gate; REQ-NCA-02's own phrasing is the thing that cannot ship. No gate was
weakened and no exemption was added for this string.

**Open finding — beta section titles survive in the bank domain headings.**
`NCA-75-Part1.md:3` (and Part2/Part3) carry headings like
`## Domain 1: Describe Lifecycle Management (~20%)`; `QuestionParser.DomainHeaderRx`
extracts them into `Question.Domain`, which the Desktop `StatsView` renders via
`GetDomainStats`. So the beta names can still reach a learner through practice
stats on an NCA bank item. That is a **content** surface (S48-03/S48-04 scope),
not the blueprint view, and it is recorded here rather than claimed as "never
renders anywhere". `remap.csv`'s required `oldDomain` column keeps the same
strings by design.

**Files:**
- `content/exams/NCA-75/exam.json` — `studyAllocationLabel` added
- `RadicalTrainingPlatform.Core/Models/ExamManifest.cs` — `StudyAllocationLabel`
- `RadicalTrainingPlatform.Core/Services/HardcodedBlueprintService.cs` — `InitNca75` deleted (−129 lines), retired-block pointer left at the foot of the file
- `RadicalTrainingPlatform.Core.Tests/ManifestBlueprintTests.cs` (new, 6 facts) — reads the repo's real manifest; asserts section order, objective IDs/titles, no beta title rendered, fallback null
- `RadicalTrainingPlatform.Core.Tests/BlueprintServiceTests.cs` — two NCA-75-dependent facts rewritten
- `content-manifest.json`, `RadicalTrainingPlatform.Web/content-bundle.json`, `RadicalTrainingPlatform.Web/js/study-content.js` — regenerated (both bundle artifacts pin hashes; one regeneration is not enough)

**Not verified:** the Nutanix guide was not opened — no section title, objective
ID or objective title here was re-read against the PDF at execution time; the
manifest's June 15, 2026 guide date and its four sections/14 objectives are taken
from the S48-01 ingest and the OpenSpec package. `sourceReviewDate` is the ingest
date, not an attested review. `GetBibleSections`'s NCA branch (7 Nutanix Bible
sections, including "AOS 7.5 New Features") is deliberately left intact — it is a
reference concept, not a beta blueprint artifact — so a Bible-style section name
is still reachable through that surface.

**Measured:** Core tests 263/263 (was 257; +6 new facts). Coverage 92.07%
(2091/2271 lines, threshold 70%) — down from S47's 92.33% because ~100 lines of
covered beta code were deleted, not because coverage regressed. Freeze chain
**41/41 at `a319cda`**, exit 0.

### S48-03 (T-33): 14 Lessons + 40-Item Pilot
**As a** learner traveling to Nutanix HQ, **I want** one short lesson per current objective and a reviewed 40-item pilot, **so that** I can study and demonstrate current-objective content.

**Acceptance Criteria:**
- [x] 14 lessons (s1_1..s4_4), one per current objective, synopses per SPEC-06 06.4 — each wired into its objective's `lessonIds`, so the track reports 14/14 objectives at 100%
- [ ] 40-item reviewed pilot: 10 per current section (equal allocation = study choice, not official weight, stated in exam.json) — the 40 items exist, 10 per section, every objective covered by ≥2 items; **"reviewed" is not satisfied** and is not claimed: no item reached `modelStage: verified`
- [x] Authoring gaps filled with new original items where the bank cannot supply two reviewed items per objective — expected gaps: solutions/tools (1.x), licensing (2.4), support-case workflow (4.3), performance interpretation (4.4); final gap count from the objective-by-objective review, not the spec estimate — **the measured count is 40, not the spec's four gap areas**: S48-01 established that all 140 bank items are excluded, so the bank supplies zero *reviewed* coverage and REQ-NCA-06's "where the bank cannot supply reviewed coverage" applies to the whole cut. Objective 3.2, measured at zero mapped bank items, carries three authored items
- [x] New authored items live in `content/exams/NCA-75/questions/nca75-pilot.md`; remapped bank items stay in their original files — nothing was moved, renumbered or relabelled
- [x] Every released item: full provenance + RedEye lane log; remaining bank items stay in review status — 40 C-02-complete provenance records with resolvable `objectiveId`s; 40 lane logs, each recording the lane's true verdict (`return` / `blocked`); the 140 bank items are absent from `RELEASED_BANKS` and remain in review
- [x] Coverage labeling shows pilot scope — bundle release state `draft-preview`, the bank's own header, and the track's `previewLabel`

**Status 🟡 because:** the row is titled a *reviewed* pilot and no item is
reviewed. Every one of the 40 has a lane log, and every log says `return` with
`modelStage: blocked` — the model stage is not integrated (REQ-REV-05), which is
the same blocker S48-01 recorded. The cut ships at release state `draft-preview`,
matching how the A+/Network+ demo cuts ship, and the honest label is *pilot
scope*, not *verified*.

**The lane earned its keep — it caught a defect in my own items.** The first run
flagged `position-bias`: **key B was the answer for 28 of 40 single-key items
(70%), against a 40% threshold**. That is a real quality defect in authored
content — a learner could score 70% by always picking B. The options were
permuted (correct answer relocated, distractors kept in relative order) so the
distribution is now 10/10/10/10 and the check passes. One explanation referenced
option letters rather than content; the references were remapped with the
permutation so the prose still points at the right distractors.

**Authored, not remapped — and why.** The row could have been read as "release 40
of the remapped bank items". It cannot be: S48-01 recorded that the lane excludes
all 140, so releasing 40 of them would have shipped unreviewed content *and*
claimed a remap that had not been verified. Authoring 40 fresh items against the
current objectives is the reading that keeps "reviewed" honest — and it is still
only 🟡, because the model stage that would make them verified does not exist.

**One gate fixture changed.** `tests/gates/redeye/self_test.py` asserted the
*exact* list of banks discovered for NCA-75. The case exists to prove the legacy
root banks are found, and NCA-75 now legitimately has a pack bank of its own, so
the assertion is narrowed to containment of the three root banks — what the case
means — instead of an exact list that fails on every future pack bank while
testing nothing the case is about. The three other gate self-tests still pass
unchanged, and the case still fails if a root bank stops being discovered.

**Files:**
- `content/exams/NCA-75/lessons/s1_1.md` … `s4_4.md` (new, 14)
- `content/exams/NCA-75/questions/nca75-pilot.md` (new, 40 items, 4 current-section domain headers — no beta title appears)
- `content/provenance/NCA-75/Q1.json` … `Q40.json` (new, 40)
- `content/exams/NCA-75/exam.json` — `lessonIds` wired for all 14 objectives
- `scripts/generate-study-content.py` — NCA-75 added to `modules`, `RELEASED_LESSONS`, `RELEASED_BANKS`
- `tests/gates/redeye/self_test.py` — bank-discovery assertion narrowed to its meaning
- `content-manifest.json`, `RadicalTrainingPlatform.Web/content-bundle.json`, `RadicalTrainingPlatform.Web/js/study-content.js` — regenerated

**Not verified:** no item is verified — the model stage is blocked, so nothing
here has been re-read against the Nutanix guide or against current documentation;
the 14 lessons are authored prose that no human has reviewed; the guide was not
opened at execution time, so the objective titles the lessons are written against
come from the S48-01 ingest. `reviewDate` is empty on all 40 records and `status`
is `draft`, which is the truth rather than a placeholder.

**Measured:** NCA track coverage **14/14 objectives, 100%** (was 0). Compiled
bundle: 89 scored items (63 diagnosis, 71% — threshold 50%), 28 lesson slots,
3 tracks. Core tests 263/263; coverage 92.07%. Freeze chain **41/41 at
`9add142`**, exit 0.

### S48-04 (T-34): Companion Surface Corrections
**As a** content consumer, **I want** the cheatsheet and logistics pages to match the applied errata, **so that** no surface contradicts the bank.

**Acceptance Criteria:**
- [x] `studyguides/CHEATSHEET-NCA-75.md` corrected: SSH is enabled by default on fresh AOS 7.5 installs (disable plan deferred), referencing errata ID NCA-75-Part3-GapFill-Q3; CI grep fixture asserts the stale string “CVM SSH disabled by default” is absent — enforced by `scripts/check-nca-cheatsheet.py` with three fixtures (`bad`, `half-fix`, `good`) and `tests/gates/run_cheatsheet_fixtures.sh`
- [x] “Beta” labels removed only from claims individually re-verified against the current guide — **none were re-verified**, so none were removed: the guide was not opened. The sheet instead carries a dated status note saying so, and the one claim that *was* corrected is marked inline
- [x] Waiver-code/beta-exam tips clearly dated — the “Beta Exam Tips” section is dated 2026-10-11 and states the beta window closed June 14, 2026; the waiver code is marked expired rather than deleted (no current-guide replacement was verified, so deleting it would have been a silent relabel)
- [x] Scheduling-link currency checked (C-07 review work, never silent relabeling) — the sheet contains **no links at all** (`insights.nutanix.com:443` is a host:port table entry, not a URL), so there was nothing to relabel; the gate prints the link inventory on every run so the check recurs rather than being a one-time claim

**The gate pins three things, not one.** The row asks for a grep that the stale
string is absent. Absence alone is satisfiable by deleting the line — which would
leave a learner with no statement about the SSH default at all, and would pass a
gate that only greps. So `check-nca-cheatsheet.py` fails on (1) the stale claim
present, (2) the correction not citing errata `NCA-75-Part3-GapFill-Q3`, and
(3) the corrected claim absent. The `half-fix` fixture is the second failure mode
made executable: it deletes the stale line and states nothing, and must fail.

**Where the file was edited (line numbers moved as the note was added).** The
stale claim was at line 93 of the 141-line sheet; it now reads *“CVM SSH enabled
by default on fresh installs — the plan to disable it was deferred (corrected per
errata NCA-75-Part3-GapFill-Q3; the earlier "disabled by default" claim was
wrong)”*. A dated status note was added under the title, and the beta-tips
section was dated and its closed window stated.

**Files:**
- `studyguides/CHEATSHEET-NCA-75.md` — claim corrected; dated status note; beta tips dated and closed
- `scripts/check-nca-cheatsheet.py` (new) — the gate
- `tests/gates/fixtures/cheatsheet-check/{bad,half-fix,good}/studyguides/CHEATSHEET-NCA-75.md` (new, 3)
- `tests/gates/run_cheatsheet_fixtures.sh` (new) — 2 must-fail fixtures + 1 must-pass + the real tree
- `.github/workflows/build.yml`, `tests/gates/run_freeze_chain.sh` — gate wired in

**Not verified:** the Nutanix guide was not opened, so **no other claim on this
sheet was re-checked** — the numbers table, the acronyms, the write path, the
licensing tiers and the product-name table are all carried forward from the beta
sheet unexamined. Every remaining “beta” label is therefore retained, which is
the honest state and not a finished one. The waiver code is dated expired, not
confirmed expired against Nutanix's own notice; the June 14, 2026 date is taken
from the sheet's own text.

**Measured:** freeze chain **43/43 at `ce51fc5`** (was 41/41; +2 gates), exit 0.

### S48-05 (T-35): Four NCA Scenarios
**As a** learner, **I want** beginner NCA scenarios with honest validators, **so that** practice means something.

**Acceptance Criteria:**
- [x] `nca-tool-01` — identify the right tool (powers lesson 1.3): seven-tool list, three jobs, validator checks each selection against the manifest's task→tool mapping
- [x] `nca-vm-01` — create/connect a VM (powers 2.1): runs on the real PE VM wizard, not a bespoke renderer — 4 vCPUs, 8 GB, NIC on `Production-200` resolved through the network list, powered on
- [x] `nca-maint-01` — choose a safe maintenance sequence (powers 3.2; ordered-sequence task): four steps presented in a fixed shuffled order, validator checks completeness and exact order
- [x] `nca-alert-01` — interpret an alert, select a next step (powers 4.2): seeded `alert-001`, validator requires the detail to have been opened **and** the matching next step
- [x] Each: fresh-seed negativity, recorded walkthrough to 100%, wrong-state negative fixture, zero real infrastructure calls, “simulated environment” label — all five in `tests/gates/web/nca-scenarios.mjs` (13 cases) plus the walkthroughs in `lib/scenario-walkthroughs.mjs`; zero outbound calls asserted by `demo-independence.mjs`, which walks the whole catalogue including these four
- [x] Unsupported licensing/tool features use labeled worked examples, never fake interactive completion — no licensing scenario exists in this set, because the simulator cannot record a licence mutation; `s2_4`'s lesson says so in its own words (“the lab simulator for this track does not simulate licence mutations”), and every one of the four scenarios here is a decision the simulator genuinely records

**Status 🟡 because:** the criteria are met and gated, but the lab UI's
interactivity has never been exercised in a real browser. The fixture drives the
validators through the stub DOM; `rehearsal-web.mjs` drives the *ticket* lab in
Chrome but not these three. Recorded, not smoothed.

**One renderer for three decision tasks, and why the fourth has none.** SPEC-07
07.5 asks for a tool pick, an ordered sequence and an alert triage — three
surfaces the PE/PC simulator does not have. SPEC-07 07.7 is explicit about the
choice: “When a view lacks a mutation the scenario needs … the fix is in the view
or the scenario — chosen explicitly and recorded, never in the validator.” The
choice here is **the view**: one `NcaLabView` with three modes, registered as
`renderer: 'nca-lab'` beside the existing `'ticket'` dispatch. `nca-vm-01` needs
no renderer at all — the PE VM wizard already writes every field its objectives
read — so it stays an ordinary store-based scenario and is the one of the four
the demo sweep drives through the real UI path.

**Registry appended, not forked.** SPEC-07 07.6 allows a new
`scenarios-beginner.js`. The four entries went into the existing
`scenarios.js` instead: `scripts/scan-scenario-validators.py` holds a
`REGISTRIES` list of files it scans for constant-true validators, so a second
registry would have been a new file the REQ-SC-01 scan does not read unless the
list was extended — a silent hole in a gate for the sake of a tidier filename.

**Last-record-wins, so changing your mind is judged on the final answer.** Every
answer appends a new trace record and each validator reads the **last** matching
record. A learner who clicks a wrong tool and then corrects it is not
permanently failed, and one who lands on the right answer by accident after a
wrong one is judged on the wrong one they ended on. Pinned by its own case.

**The label that was missing for the other 46 scenarios.** REQ-SC-05 says the
simulation is labelled in the UI. The ticket and NCA labs each render the line,
but `nca-vm-01` has no lab page of its own, and neither did any of the 46
store-based scenarios before it — so `ScenariosView` now states it once for
every scenario it lists. That is a REQ-SC-05 gap closed for the whole catalogue,
not just for this row.

**No `StateEngine` change was needed.** All four validators read only
`action_trace` (which `state.reset()` clears, satisfying REQ-SC-06) plus the
existing seed collections `alerts`, `networks` and `vms`. So
`demo-independence.mjs`'s store-key allowlist and the fresh-seed negativity test
both hold without a new collection or a new seed field.

**The demo-sweep count moved 46 → 50, and the frozen record was left alone.**
SPEC-16 16.6: “Freeze means no content edits afterward without a new head
record.” The S47-13 freeze record indexes `2026-10-11-demo-sweep.md` as
measuring 46 scenarios at `0d1f565`; that measurement was true and is not
rewritten. The post-freeze sweep is a new artifact,
`2026-10-25-demo-sweep.md`, at head `efe5e31`, and
`demo-sweep-report.mjs`'s count pin moved with it (the pin is the point: a
silently different catalogue goes red).

**Files:**
- `RadicalTrainingPlatform.Web/js/views/nca-lab.js` (new) — `NcaLabView`, three modes, evidence panel, reset
- `RadicalTrainingPlatform.Web/js/views/scenarios.js` — four entries; `NCA_TOOL_LAB` / `NCA_MAINT_SEQUENCE` / `NCA_ALERT_LAB` manifests; `lastRecord`/`lastToolFor`/`lastSequence`/`lastTriage`/`alertOpened` helpers; the `nca-lab` dispatch branch; the catalogue-wide simulated-environment label
- `tests/gates/web/nca-scenarios.mjs` (new) — 13 cases: fresh-seed negativity, four wrong-state negatives, last-record-wins, walkthrough-to-100%, reset, label, registry wiring
- `tests/gates/web/lib/scenario-walkthroughs.mjs` — four recorded walkthroughs
- `tests/gates/web/demo-sweep-report.mjs` — count pin 46 → 50; deferral prose replaced with the present-catalogue statement
- `docs/qa/release-evidence/2026-10-25-demo-sweep.md` (new) — the post-freeze sweep at `efe5e31`

**Not verified:** the lab UI was not driven in a real browser — no click, no
ordering interaction, no alert-detail toggle was exercised outside the stub DOM,
so “the buttons work” is inferred from the fixture's DOM and not observed. The
`nca-vm-01` path through the PE VM wizard is covered by the demo sweep's
store-level walkthrough, not by a browser session. Nothing here was re-read
against the Nutanix guide; the tool/objective mapping in `NCA_TOOL_LAB` is an
authored teaching choice, not a citation. `rehearsal-web.mjs` does not yet cover
these scenarios (it is not in the freeze chain either — it needs a browser).

**Measured:** freeze chain **43/43 at `efe5e31`**, exit 0. `nca-scenarios.mjs`
13/13. Demo sweep: **50 scenarios**, every one `incomplete (0 of N met)` on a
fresh station → `complete (N of N met)` after its walkthrough.

### S48-06 (T-36): Travel Freeze
**As a** track owner, **I want** the NCA cut frozen at a recorded head before departure, **so that** what I demonstrate in California is a known, reproducible build.

**Acceptance Criteria:**
- [ ] Departure cutoff confirmed from the trip itinerary before schedule commitment (ASM-09) — **not met, and not met by choice.** No itinerary exists in this repository, and ASM-09 itself records the exact departure as unverified. I did not invent a cutoff. What exists instead is a *candidate* freeze at a recorded head; whether that head is the last one before departure is unknown
- [x] Freeze checklist per SPEC-11 11.7: branch, tag-free head record, gate results with counts, RedEye lane logs + self-test record, usable build, no content edits after freeze — head `4a399fb`, **43/43 gates**, Core 263/263, Desktop 51/51, coverage 92.07%, PWA smoke clean, bundle hash-matched; lane logs and the seeded-defect self-test record reproduced at the head

**Status 🟡 because:** the first criterion is unmet. Everything else in the row is
produced and reproducible, but a freeze whose cutoff is unconfirmed is a freeze
waiting on one input from the owner — and saying so is the whole point of
REQ-NCA-08's "confirmed from the trip itinerary" clause.

**What was deliberately not done.** No cutoff date was guessed from the Oct 25–28
window. The window is not the departure time, and a freeze record that names a
date it cannot source is worse than one that says it does not know: a reader
would treat it as confirmed. The record instead states, in its own second
section, exactly which criterion it fails and why.

**A second exclusion reason appeared, and it is the gate working.** Running the
NCA lane at this head shows two distinct reasons: `verdict is 'return'` (the
model stage is not configured) and — new since S48-02 — **`stale log (manifest
changed since review)`**. Replacing `exam.json` with the current blueprint
invalidates every log bound to the old manifest hash. That is a manifest change
correctly re-opening a review, not a regression, and it is recorded rather than
worked around. All **180** NCA items are excluded (140 bank + 40 pilot); across
all exams, **229**.

**The two prior freeze artifacts were left alone.** SPEC-16 16.6: "Freeze means
no content edits afterward without a new head record." The S47-13 record
(`2026-10-23-freeze.md`) and its demo sweep (`2026-10-11-demo-sweep.md`) measure
39/39 at `0d1f565` and 46 scenarios respectively. Both were true; neither is
rewritten. This freeze produces its own sweep artifact at its own head.

**Files:**
- `docs/qa/release-evidence/2026-10-25-nca-freeze.md` (new) — the freeze record
- `docs/qa/release-evidence/2026-10-25-demo-sweep.md` — regenerated at the freeze head `4a399fb` (was generated at `efe5e31`)

**Not verified:** the departure cutoff (see above). Nothing in this row was
independently verified by a second party — the gate chain, test counts, coverage
figure, smoke run and lane self-test are all single-run measurements on this host
at this head. The full list of what the freeze does *not* establish is in the
record's own known-unverified section: no item is reviewed, the Nutanix guide was
never opened, the lab UI was never driven in a browser, `Desktop.Tests` has no CI
signal, and the two vendor PDFs are absent.

**Measured:** freeze chain **43/43 at `4a399fb`**, exit 0, with `--expect-sha`
matching. Core 263/263 · Desktop 51/51 · coverage 92.07% · web fixtures 26/26 +
the must-fail self-test · NCA scenarios 13/13 · demo sweep 50 scenarios, all
incomplete → complete.

---

## Sprint Acceptance (October 25–28 California-ready definition, SPEC-00 00.5)

The NCA track presents the current official blueprint (sections, objective IDs, AOS 7.5 / AHV 11.0 / pc.7.5), 14 short lessons, 40 reviewed remapped-or-authored items, four tested deterministic scenarios, and a corrected objective map; beta labels survive only where a retained claim was checked. All SPEC-08/10 gates green at the frozen head, including the repaired vulnerability gate proven by its must-fail fixture.

**Where the sprint actually stands against that target.** Every structural piece
is in place and gated — the blueprint, the 14 lessons, the 40-item pilot, the four
scenarios, the remap inventory, the corrected companion surfaces, and 43/43 gates
green at `4a399fb`. Three words in the paragraph above are not yet true, and no
row claims them:

- **"reviewed"** — all 180 NCA items are excluded by the RedEye gate; no item has
  a passing log. The pilot ships at `draft-preview`.
- **"beta labels survive only where a retained claim was checked"** — no claim was
  checked against the current guide, so the surviving beta labels are the
  *unexamined* ones, which is the honest state and not the finished one.
- **"frozen head"** — the head is recorded and reproducible, but the departure
  cutoff is unconfirmed (ASM-09), so the freeze is a candidate, not a closure.

All six sprint rows stand 🟡 on those named gaps rather than ✅ on a target that
has not been met.
