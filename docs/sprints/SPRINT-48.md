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
| S48-01 (T-31) | Complete remap.csv (started T-09) with RedEye lane logs and seeded-defect self-test record | REQ-NCA-01 | 3 | ⚪ |
| S48-02 (T-32) | NCA-75 exam.json current blueprint; InitNca75 retired; blueprint fixtures | REQ-NCA-05 | 2 | ⚪ |
| S48-03 (T-33) | 14 lessons + 40-item pilot (remapped + newly authored gap fills) | REQ-NCA-02/06 | 3 | ⚪ |
| S48-04 (T-34) | Cheatsheet correction + beta logistics cleanup + scheduling-link currency | REQ-NCA-04, C-07 | 1 | ⚪ |
| S48-05 (T-35) | Four NCA scenarios with validators and walkthroughs | REQ-NCA-07, REQ-SC-01..06 | 2 | ⚪ |
| S48-06 (T-36) | Travel freeze per REQ-NCA-08 once itinerary confirms cutoff | REQ-NCA-08 | 1 | ⚪ |

**Total:** 12 points

---

## User Stories

### S48-01 (T-31): Complete the Remap Inventory
**As a** track maintainer, **I want** every one of the 140 NCA-75 items mapped to the current blueprint, **so that** remapping attaches new mappings without renumbering.

**Acceptance Criteria:**
- [ ] `content/exams/NCA-75/remap.csv` complete: exactly 140 rows, every item ID resolves to a parsed question, every row carries review state (columns per SPEC-01 01.3)
- [ ] Existing question IDs never change; remap attaches mapping only
- [ ] Every remapped row passes the RedEye lane with remap-aware checks (key re-verification against current documentation, explanation re-read, mapping check, rights status)
- [ ] Errata fixtures still pass: NCA-75-Part1 Q35 = D; NCA-75-Part3-GapFill Q3 = A (REQ-NCA-03)
- [ ] Lane logs + seeded-defect self-test record archived in release evidence

**Files:** `content/exams/NCA-75/remap.csv`, `content/provenance/`

### S48-02 (T-32): Current Blueprint Manifest
**As a** learner, **I want** the NCA track to present the current official blueprint, **so that** I never study the beta structure by accident.

**Acceptance Criteria:**
- [ ] `content/exams/NCA-75/exam.json` encodes the current four sections / 14 objectives: 1 Solutions and tools (1.1–1.3), 2 Platform administration (2.1–2.4), 3 Cluster configuration and maintenance (3.1–3.3), 4 Health and monitoring (4.1–4.4)
- [ ] Manifest carries displayName “Nutanix Certified Associate 7.5”, officialVersion with June 15 2026 guide date, productVersions AOS 7.5 / AHV 11.0 / pc.7.5, sourceUrl + sourceReviewDate from an actual human source review
- [ ] No weightPercent — equal study allocation, labeled as study choice (ASM-13)
- [ ] `HardcodedBlueprintService.InitNca75` (beta 20/30/25/25 structure) removed or annotated obsolete with a pointer to the manifest
- [ ] `ManifestBlueprintTests.cs` fixtures assert manifest sections/objectives/IDs match the current guide; beta section titles never render

**Files:** `content/exams/NCA-75/exam.json`, `RadicalTrainingPlatform.Core/Services/HardcodedBlueprintService.cs`, `RadicalTrainingPlatform.Core.Tests/ManifestBlueprintTests.cs`, `RadicalTrainingPlatform.Core.Tests/BlueprintServiceTests.cs`

### S48-03 (T-33): 14 Lessons + 40-Item Pilot
**As a** learner traveling to Nutanix HQ, **I want** one short lesson per current objective and a reviewed 40-item pilot, **so that** I can study and demonstrate current-objective content.

**Acceptance Criteria:**
- [ ] 14 lessons (s1_1..s4_4), one per current objective, synopses per SPEC-06 06.4
- [ ] 40-item reviewed pilot: 10 per current section (equal allocation = study choice, not official weight, stated in exam.json)
- [ ] Authoring gaps filled with new original items where the bank cannot supply two reviewed items per objective — expected gaps: solutions/tools (1.x), licensing (2.4), support-case workflow (4.3), performance interpretation (4.4); final gap count from the objective-by-objective review, not the spec estimate
- [ ] New authored items live in `content/exams/NCA-75/questions/nca75-pilot.md`; remapped bank items stay in their original files
- [ ] Every released item: full provenance + RedEye lane log; remaining bank items stay in review status
- [ ] Coverage labeling shows pilot scope

**Files:** `content/exams/NCA-75/lessons/`, `content/exams/NCA-75/questions/nca75-pilot.md`, `content/provenance/`

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
