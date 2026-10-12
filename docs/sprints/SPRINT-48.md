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
| S48-04 (T-34) | Cheatsheet correction + beta logistics cleanup + scheduling-link currency | REQ-NCA-04, C-07 | 1 | ⚪ |
| S48-05 (T-35) | Four NCA scenarios with validators and walkthroughs | REQ-NCA-07, REQ-SC-01..06 | 2 | ⚪ |
| S48-06 (T-36) | Travel freeze per REQ-NCA-08 once itinerary confirms cutoff | REQ-NCA-08 | 1 | ⚪ |

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
- [ ] `studyguides/CHEATSHEET-NCA-75.md` line 96 corrected: SSH is enabled by default on fresh AOS 7.5 installs (disable plan deferred), referencing errata ID NCA-75-Part3-GapFill-Q3; CI grep fixture asserts the stale string “CVM SSH disabled by default” is absent
- [ ] “Beta” labels removed only from claims individually re-verified against the current guide
- [ ] Waiver-code/beta-exam tips removed or clearly dated
- [ ] Scheduling-link currency checked (C-07 review work, never silent relabeling)

**Files:** `studyguides/CHEATSHEET-NCA-75.md`

### S48-05 (T-35): Four NCA Scenarios
**As a** learner, **I want** beginner NCA scenarios with honest validators, **so that** practice means something.

**Acceptance Criteria:**
- [ ] `nca-tool-01` — identify the right tool (powers lesson 1.3)
- [ ] `nca-vm-01` — create/connect a VM (powers 2.1)
- [ ] `nca-maint-01` — choose a safe maintenance sequence (powers 3.2; ordered-sequence task)
- [ ] `nca-alert-01` — interpret an alert, select a next step (powers 4.2)
- [ ] Each: fresh-seed negativity, recorded walkthrough to 100%, wrong-state negative fixture, zero real infrastructure calls, “simulated environment” label
- [ ] Unsupported licensing/tool features use labeled worked examples, never fake interactive completion

**Files:** `Web/js/views/` scenario registry

### S48-06 (T-36): Travel Freeze
**Acceptance Criteria:**
- [ ] Departure cutoff confirmed from the trip itinerary before schedule commitment (ASM-09)
- [ ] Freeze checklist per SPEC-11 11.7: branch, tag-free head record, gate results with counts, RedEye lane logs + self-test record, usable build, no content edits after freeze

---

## Sprint Acceptance (October 25–28 California-ready definition, SPEC-00 00.5)

The NCA track presents the current official blueprint (sections, objective IDs, AOS 7.5 / AHV 11.0 / pc.7.5), 14 short lessons, 40 reviewed remapped-or-authored items, four tested deterministic scenarios, and a corrected objective map; beta labels survive only where a retained claim was checked. All SPEC-08/10 gates green at the frozen head, including the repaired vulnerability gate proven by its must-fail fixture.
