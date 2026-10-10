# Sprint 45: OpenSpec Sprint A — Contracts, Blocking Repairs, First Content

**Phase:** 5 — Product-Track Enablement
**Source:** OpenSpec change package `rtp-beginner-tracks-2026-10` (docs/drive-ingest-2026-10-10), SPEC-11 Sprint A (Oct 10–12)
**Duration:** Oct 10 – Oct 12, 2026
**Goal:** Remove the four defects that block everything (PWA boot, vulnerability gate, answer-key grammar, ordering/retry scoring), stand up the track/exam manifest system, ship the RedEye review lane, and produce the first reviewed lesson/question fixtures — so Sprints 46–48 can build on verified ground.

**Reference package:** [OpenSpec package](../drive-ingest-2026-10-10/RTP-Beginner-Tracks-Openspec-Change-Package-A-Network-NCA75-v2.md) — requirements REQ-MAN-01..07, R-01..R-10, CI-01, test matrix TM-10/TM-40/TM-70.

---

## Sprint Backlog

| ID | Task | Requirements | Points | Status |
|---|---|---|---|---|
| S45-01 (T-01) | Repair PWA boot import; add `scripts/check-imports.py` with failing+passing fixtures | R-01, CI-03 | 2 | ⚪ |
| S45-02 (T-02) | Repair vulnerability gate + fixture suite | CI-01 | 3 | ⚪ |
| S45-03 (T-03) | Extend AnswerRegex + parse/catalog reconciliation; repair NCP-AI-Part4 keys | R-07 | 2 | ⚪ |
| S45-04 (T-04) | Ordered-response type + quarantine/convert ordering items | R-03 | 3 | ⚪ |
| S45-05 (T-05) | Retry accounting fix | R-04 | 2 | ⚪ |
| S45-06 (T-06) | Manifest system: models, loader, catalog, blueprint override, validator | REQ-MAN-01..07 | 3 | ⚪ |
| S45-07 (T-07) | Four exam.json + three track.json with sources and review dates | REQ-MAN-06 | 2 | ⚪ |
| S45-08 (T-08) | First reviewed lesson + question fixtures (A+ A2; Network+ N5) | REQ-AP-02, REQ-NP-02 | 2 | ⚪ |
| S45-09 (T-09) | Begin NCA remap inventory (140 rows) | REQ-NCA-01 | 2 | ✅ |
| S45-10 (T-10) | Answer-position distribution report | R-09 | 1 | ✅ |
| S45-11 (T-43*) | Web runtime batch starts immediately after T-01 (same surface) | R-22 | 2 | ✅ |
| S45-12 (T-46) | RedEye lane: checks, logs, ship-gate, seeded-defect self-test | REQ-REV-01..06 | 3 | ⚪ |

**Total:** 27 points (Sprint A runs on a compressed calendar; cut lines, not quality, absorb slippage per SPEC-11 11.9)

---

## User Stories

### S45-01 (T-01): Repair PWA Boot Import
**As a** presenter, **I want** the PWA to boot, **so that** the October 23 demo is possible at all.

**Acceptance Criteria:**
- [ ] `Web/js/views/pe-reports.js` bad import repaired; PWA loads with zero console errors
- [ ] `scripts/check-imports.py` validates the module graph case-sensitively
- [ ] Gate ships with one failing fixture (bad import) and one passing fixture (clean graph)
- [ ] Gate wired into the Linux CI leg

**Files:** `Web/js/views/pe-reports.js`, `scripts/check-imports.py`, `.github/workflows/build.yml`
**Commands:** `python3 scripts/check-imports.py`
**Dependencies:** None (blocks S45-11)

### S45-02 (T-02): Repair Vulnerability Gate
**As a** release manager, **I want** a security gate that can actually fail, **so that** green runs are real evidence.

**Acceptance Criteria:**
- [ ] `vuln_gate.py` walks the real dotnet JSON shape (root object → projects → frameworks → topLevelPackages/transitivePackages, lowercase `advisoryurl`)
- [ ] Fixture suite covers: clean report passes; top-level vulnerable fails; transitive vulnerable fails; multi-project; empty project; malformed JSON fails; unknown root version fails loudly; scanner non-zero exit fails; expired/unexpired/wrong-version/malformed exception cases
- [ ] Canonical proof: a fixture with a High advisory exits 1
- [ ] `python3 tests/gates/test_vuln_gate.py` green

**Files:** `.github/scripts/vuln_gate.py`, `tests/gates/test_vuln_gate.py`
**Dependencies:** None

### S45-03 (T-03): Answer Grammar Repair
**As a** content maintainer, **I want** all supported answer-key forms to parse, **so that** zero questions silently drop.

**Acceptance Criteria:**
- [ ] `**Correct Answer: B, D**` form supported; the unsupported “B and D” form repaired in NCP-AI-Part4.md
- [ ] Parse/catalog reconciliation proves zero drops across all banks (TM-15 gate)
- [ ] New content lint forbids the “B and D” form

**Files:** `RadicalTrainingPlatform.Core/Services/QuestionParser.cs`, `NCP-AI-Part4.md`, `RadicalTrainingPlatform.Core.Tests/QuestionParserTests.cs`

### S45-04 (T-04): Ordered-Response Type
**As a** learner, **I want** ordering items to be scored as sequences, **so that** ordering content stops corrupting scoring truth.

**Acceptance Criteria:**
- [ ] Ordered-response question model + scoring in Core
- [ ] Existing ordering items quarantined or converted; never scored as single-select
- [ ] Unit tests pin sequence scoring behavior

**Files:** `RadicalTrainingPlatform.Core/Models/Question.cs`, `RadicalTrainingPlatform.Core/ViewModels/ExamSessionViewModel.cs`, `RadicalTrainingPlatform.Core.Tests`

### S45-05 (T-05): Retry Accounting Fix
**As a** learner, **I want** retries counted honestly, **so that** my accuracy stats are true.

**Acceptance Criteria:**
- [ ] Retry outcomes use the agreed outcome-set policy (with S45/T-37 identity work)
- [ ] Unit tests cover retry → attempt-history interactions

**Files:** `RadicalTrainingPlatform.Core/ViewModels/ExamSessionViewModel.cs`, `RadicalTrainingPlatform.Core.Tests`

### S45-06 (T-06): Manifest System
**As a** platform engineer, **I want** manifest-over-filename exam identity, **so that** `COMPTIA-A-1201` never truncates to `COMPTIA-A`.

**Acceptance Criteria:**
- [ ] `TrackManifest.cs`, `ExamManifest.cs`, `LessonRef.cs` models
- [ ] `ManifestExamCatalog.cs` reads manifests first, legacy `DeriveExamCode` fallback logs truncation warning
- [ ] `ManifestBlueprintService.cs` overrides `HardcodedBlueprintService` for manifest-covered exams
- [ ] `IManifestLoader.cs` abstraction; `scripts/validate-manifests.py` checks shape + ID collisions (both directions)
- [ ] `DeriveExamCodeTests.cs` legacy 16 cases pass unmodified + new truncation-documentation cases
- [ ] `CompositionRootTests.cs` registers new services

**Files:** `RadicalTrainingPlatform.Core/Models/`, `RadicalTrainingPlatform.Core/Services/ManifestExamCatalog.cs`, `RadicalTrainingPlatform.Core/Services/ManifestBlueprintService.cs`, `RadicalTrainingPlatform.Core/Abstractions/IManifestLoader.cs`, `scripts/validate-manifests.py`
**Commands:** `python3 scripts/validate-manifests.py`; `dotnet test RadicalTrainingPlatform.Core.Tests --filter "FullyQualifiedName~Manifest"`; `dotnet test RadicalTrainingPlatform.Core.Tests --filter "FullyQualifiedName~DeriveExamCode"`

### S45-07 (T-07): Track and Exam Manifests
**As a** track author, **I want** versioned manifests for the four exams, **so that** identity and objective maps are explicit.

**Acceptance Criteria:**
- [ ] `content/exams/{COMPTIA-A-1201,COMPTIA-A-1202,COMPTIA-NET-009,NCA-75}/exam.json`
- [ ] `content/tracks/{track-aplus,track-netplus,track-nca}/track.json`
- [ ] Each manifest carries `sourceUrl`, `sourceReviewDate` (set by an actual human source review), `officialVersion`, `objectivesDocVersion`; NCA-75 carries displayName “Nutanix Certified Associate 7.5”, blueprint date June 15 2026, product versions AOS 7.5 / AHV 11.0 / pc.7.5
- [ ] CompTIA manifests carry official weights as study allocations; NCA manifest omits weights (equal study allocation, ASM-13)

**Files:** `content/exams/*/exam.json`, `content/tracks/*/track.json`

### S45-08 (T-08): First Reviewed Content Fixtures
**As a** learner, **I want** one real lesson and practice set per CompTIA core direction, **so that** the learning loop has real content to prove itself.

**Acceptance Criteria:**
- [ ] A+ A2 “Networking basics” lesson + question fixture set (parser-format markdown)
- [ ] Network+ N5 “Troubleshooting” lesson + question fixture set
- [ ] Every item has a provenance record (C-02) and has passed the RedEye lane (S45-12)
- [ ] Multi-select uses `Correct Answer: B, D` form only

**Files:** `content/exams/COMPTIA-A-1201/lessons/a2.md`, `content/exams/COMPTIA-NET-009/lessons/n5.md`, `content/exams/*/questions/`, `content/provenance/`

### S45-09 (T-09): Begin NCA Remap Inventory
**As a** track maintainer, **I want** all 140 NCA-75 items inventoried against the current guide, **so that** the California cut is transformation, not guesswork.

**Acceptance Criteria:**
- [x] `content/exams/NCA-75/remap.csv` started with SPEC-01 columns (itemId, sourceFile, oldDomain, oldObjectiveId, newSection, newObjectiveId, productVersion, keyReviewed, explanationReviewed, rightsStatus, reviewer, notes)
- [x] Every one of the 140 items gets a row before Sprint 48 (T-31 completes it)
- [x] Existing question IDs never change

**Files:** `content/exams/NCA-75/remap.csv`

### S45-10 (T-10): Key-Distribution Report
**As a** content reviewer, **I want** answer-position distribution visible, **so that** position bias is caught before RedEye review.

**Acceptance Criteria:**
- [x] `scripts/report-key-distribution.py` reports per-bank answer-letter distribution
- [x] Report output archived with release evidence

### S45-11 (T-43*, partial): Web Runtime Batch (started)
**As a** platform engineer, **I want** the web runtime defects fixed on the same surface as T-01, **so that** we do not reopen the boot area twice.

**Acceptance Criteria:**
- [x] `this.root` lifecycle, `ci-networking` accessor, CLI async, audit-log ordering, router serialization, per-item validator isolation, scenario attempt/history fixes begin immediately after S45-01 lands
- [x] Remaining cosmetics may slip to Sprint 46 with register note

**Files:** `Web/js/` (per R-22 finding list)

### S45-12 (T-46): RedEye Review Lane
**As an** owner, **I want** every scored item to pass the RedEye lane before release, **so that** no unreviewed item ever ships and Roger carries no mandatory review load.

**Acceptance Criteria:**
- [ ] Per-item checks: key vs source, objective mapping, position bias, originality screen
- [ ] Written per-item log with pass/return verdict
- [ ] Automated seeded-defect self-test proves lane accuracy
- [ ] Fail-closed: no lane log, no release (REQ-REV-05)
- [ ] Remap-aware checks for legacy items (key re-verification, explanation re-read, mapping check, rights status)

**Dependencies:** Blocks all content release tasks in Sprints 45–48.

---

## Sprint Acceptance

- All repaired gates have failing and passing fixtures; the gate chain order from SPEC-10 10.8 starts at this sprint for T-01/T-02
- `dotnet build` Core + Desktop with zero warnings; `dotnet test RadicalTrainingPlatform.Core.Tests` green including legacy `DeriveExamCode` cases
- A2/N5 lessons reviewable; remap inventory started; RedEye lane operational
- Mini-retrospective recorded per SPEC-11 11.10 with gate pass count at sprint head SHA
