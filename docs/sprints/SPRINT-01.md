# Sprint 1: Get Green

**Phase:** Foundation  
**Duration:** Week 1 - Week 2  
**Goal:** Fix all blocking defects so the codebase compiles, CI passes, and 100% of questions are recoverable.

---

## Sprint Backlog

| ID | Story | Points | Assignee | Status |
|---|---|---|---|---|
| S1-01 | Fix AnswerRegex parser bug | 2 | Claude | ✅ Done |
| S1-02 | Fix DeriveExamCode mis-classification | 2 | Claude | ✅ Done |
| S1-03 | Fix CI SDK version mismatch | 2 | Claude | ✅ Done |
| S1-04 | Remove dead _fileProvider from QuestionParser | 1 | Claude | ✅ Done |
| S1-05 | Stop Question.Id mutation in ExamSessionViewModel | 3 | Claude | ✅ Done |
| S1-06 | Fix Flatpak manifest | 1 | Claude | ✅ Done |
| S1-07 | Add Directory.Build.props + global.json | 2 | Claude | ✅ Done |
| S1-08 | Correct 3 wrong answer keys in content | 1 | Claude | ✅ Done |

**Total:** 14 points

---

## User Stories

### S1-01: Fix AnswerRegex Parser Bug
**As a** learner, **I want** all questions to be parsed correctly, **so that** no exam content is silently missing.

**Acceptance Criteria:**
- [ ] NCP-CI-Part3.md returns exactly 80 questions (currently returns 0)
- [ ] AnswerRegex matches both `**Answer: X**` and `**Correct Answer: X**` formats
- [ ] No regression on existing `**Answer: X**` format files
- [ ] Parser logs a warning when an answer format variant is encountered (defer to S4 if logging not yet available)

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Update AnswerRegex pattern | `RadicalTrainingPlatform.Core/Services/QuestionParser.cs` | 15 min | Change `^\*\*Answer:` to `^\*\*(?:Correct )?Answer:` (line 32) |
| Verify fix against NCP-CI-Part3.md | `content/` | 15 min | Run parser, assert 80 questions returned |
| Regression test other files | `content/*.md` | 15 min | Verify parse counts unchanged for other 20 files |

**Dependencies:** None

**References:** DESIGN-PLAN.md Quick Win 1 (Finding 1), DESIGN-MATRIX-AND-ROADMAP.md Deliverable 1

---

### S1-02: Fix DeriveExamCode Mis-Classification
**As a** learner, **I want** exam codes to be derived correctly from filenames, **so that** blueprint coverage and stats are accurate.

**Acceptance Criteria:**
- [ ] `DeriveExamCode("NCP-US-Part2-D3.md")` returns `"NCP-US"`
- [ ] `DeriveExamCode("NCP-US-Part2-D4.md")` returns `"NCP-US"`
- [ ] `DeriveExamCode("NCA-75-Part3-GapFill.md")` returns `"NCA-75"`
- [ ] Existing files (e.g., `NCM-MCI-Part1.md`) continue to work correctly
- [ ] All 21 .md files have correct exam codes after the fix

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Rewrite DeriveExamCode with iterative suffix stripping | `RadicalTrainingPlatform.Core/Services/QuestionParser.cs` | 30 min | Lines 39-55; use pattern `^(.+?)-(?:Part\d+(?:-.*)?|D\d+(?:-.*)?|GapFill(?:-.*)?)$` |
| Add parameterized unit tests | To be created in S2 | 30 min | Theory data for all filename variants |
| Validate all 21 files | Repo root | 15 min | Script to print exam code per file |

**Dependencies:** None

**References:** DESIGN-PLAN.md Quick Win 2 (Finding 2)

---

### S1-03: Fix CI SDK Version Mismatch
**As a** developer, **I want** CI builds to pass, **so that** every push has an automated quality gate.

**Acceptance Criteria:**
- [ ] CI workflow uses .NET 10 SDK (was 8.0.x)
- [ ] Core and Desktop artifact paths reference `net10.0/` (was `net8.0/`)
- [ ] Build step passes on Ubuntu (GitHub Actions)
- [ ] `|| true` removed from test step so test failures actually fail the build
- [ ] WinForms artifact path remains `net8.0-windows/` (correct for that project)

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Update setup-dotnet version | `.github/workflows/build.yml` | 5 min | Line 26: change `8.0.x` to `10.0.x` |
| Fix artifact paths | `.github/workflows/build.yml` | 5 min | Lines 73, 88, 97 |
| Remove `\|\| true` masking | `.github/workflows/build.yml` | 5 min | Line 59 |
| Trigger test build | GitHub Actions | 10 min | Push to feature branch, verify green |

**Dependencies:** None

**References:** DESIGN-PLAN.md Quick Win 3 (Finding 3)

---

### S1-04: Remove Dead _fileProvider from QuestionParser
**As a** developer, **I want** clean constructor signatures, **so that** code is not confusing and DI is straightforward.

**Acceptance Criteria:**
- [ ] `_fileProvider` private field removed from QuestionParser
- [ ] Constructor takes only `IExamRepository` (no `IFileProvider`)
- [ ] Call site in MainWindow.axaml.cs updated to pass only 1 argument
- [ ] Build passes with zero warnings

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Delete _fileProvider field and constructor parameter | `RadicalTrainingPlatform.Core/Services/QuestionParser.cs` | 10 min | Lines 15, 17, 20 |
| Update call site | `RadicalTrainingPlatform.Desktop/MainWindow.axaml.cs` | 5 min | Line 48: `new QuestionParser(repo)` |
| Verify build | Solution | 5 min | `dotnet build` passes |

**Dependencies:** None

**References:** DESIGN-PLAN.md Quick Win 7 (Finding 4)

---

### S1-05: Stop Question.Id Mutation in ExamSessionViewModel
**As a** developer, **I want** shared model objects to be immutable, **so that** cross-session data corruption cannot occur.

**Acceptance Criteria:**
- [ ] `Question.Id` is never mutated after construction
- [ ] `ExamSessionViewModel` uses a `_displayIndex` dictionary for display ordinals
- [ ] `CurrentNumber` property returns display index, not `Question.Id`
- [ ] `ExamPdfExporter` still generates correct PDFs (verifies non-mutation works downstream)
- [ ] `GetDisplayNumber(Question)` helper is unit-testable

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Add _displayIndex Dictionary field | `RadicalTrainingPlatform.Core/ViewModels/ExamSessionViewModel.cs` | 15 min | `private readonly Dictionary<Question, int> _displayIndex = new();` |
| Replace mutation loop with index build | `RadicalTrainingPlatform.Core/ViewModels/ExamSessionViewModel.cs` | 15 min | Lines 38-44 |
| Add GetDisplayNumber helper | `RadicalTrainingPlatform.Core/ViewModels/ExamSessionViewModel.cs` | 10 min | `public int GetDisplayNumber(Question q)` |
| Update CurrentNumber property | `RadicalTrainingPlatform.Core/ViewModels/ExamSessionViewModel.cs` | 10 min | Line 52 |
| Verify ExamPdfExporter | `RadicalTrainingPlatform.Core/PdfExport/ExamPdfExporter.cs` | 15 min | Check it does not depend on mutated IDs |
| Verify build and run | Solution | 10 min | Full app run, verify question numbering |

**Dependencies:** None

**References:** DESIGN-PLAN.md Quick Win 8 (Finding 5)

---

### S1-06: Fix Flatpak Manifest
**As a** packager, **I want** the Flatpak manifest to reference the correct repository, **so that** Linux builds succeed.

**Acceptance Criteria:**
- [ ] Git URL changed from `TheArchitectit/certforge.git` to `TheArchitectit/radicaltrainingplatform.git`
- [ ] Placeholder commit SHA replaced with actual latest commit hash
- [ ] SDK extension updated to .NET 10 (or appropriate preview extension)
- [ ] AppImage script directory-creation ordering reviewed (no actual bug found per DESIGN-PLAN)

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Fix git URL | `packaging/linux/app.radicaltrainingplatform.RadicalTrainingPlatform.yml` | 5 min | Line 61 |
| Replace commit SHA | `packaging/linux/app.radicaltrainingplatform.RadicalTrainingPlatform.yml` | 5 min | Line 64 |
| Update SDK extension | `packaging/linux/app.radicaltrainingplatform.RadicalTrainingPlatform.yml` | 5 min | Line 6 |
| Review AppImage script | `packaging/linux/build-appimage.sh` | 10 min | Verify directory creation order |

**Dependencies:** None

**References:** DESIGN-PLAN.md Quick Win 9 (Finding 10-adjacent)

---

### S1-07: Add Directory.Build.props + global.json
**As a** developer, **I want** centralized version and SDK management, **so that** builds are reproducible across machines and CI.

**Acceptance Criteria:**
- [ ] `Directory.Build.props` exists at repo root with `<Version>`, `<AssemblyVersion>`, `<FileVersion>`, `<Company>`, `<Product>`, `<Copyright>`
- [ ] `global.json` exists at repo root pinning SDK to exact .NET 10 version
- [ ] All projects inherit version from Directory.Build.props (no hardcoded versions in .csproj files)
- [ ] Packaging scripts can read version from assembly (documented approach)
- [ ] Build passes with pinned SDK

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Create Directory.Build.props | `Directory.Build.props` (new) | 10 min | Version 0.1.0, company info, copyright |
| Create global.json | `global.json` (new) | 10 min | Pin `"sdk": { "version": "10.0.x" }` |
| Audit .csproj files for hardcoded versions | `*.csproj` files | 15 min | Remove any `<Version>` elements from individual projects |
| Update packaging scripts | `packaging/` scripts | 15 min | Read version from assembly instead of hardcoded |
| Update Flatpak metainfo | `packaging/linux/*.metainfo.xml` | 10 min | Use `@VERSION@` placeholder for CI replacement |
| Verify build | Solution | 10 min | `dotnet build` with pinned SDK |

**Dependencies:** S1-03 (CI must support .NET 10 SDK)

**References:** DESIGN-PLAN.md Quick Win 10

---

### S1-08: Correct 3 Wrong Answer Keys in Content
**As a** learner, **I want** correct answer keys, **so that** I am not penalized for correct knowledge.

**Acceptance Criteria:**
- [ ] NCA-75-Part1.md Q3: upgrade order corrected to AOS -> Hypervisor -> Firmware
- [ ] NCA-75-Part3-GapFill.md Q3: SSH answer corrected to "enabled by default"
- [ ] PC max VMs question (NCP-US-PartX): corrected to 25,000 (scale-out)
- [ ] Corrections match DOC-REVIEW-REPORT.md exactly
- [ ] No other questions in those files accidentally modified

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Fix NCA-75-Part1.md Q3 | `content/NCA-75-Part1.md` | 10 min | Per DOC-REVIEW-REPORT.md |
| Fix NCA-75-Part3-GapFill.md Q3 | `content/NCA-75-Part3-GapFill.md` | 10 min | Per DOC-REVIEW-REPORT.md |
| Fix PC max VMs question | `content/NCP-US-Part*.md` | 10 min | Identify correct file, apply fix |
| Verify with parser | `scripts/` | 10 min | Load corrected questions, verify answer fields |

**Dependencies:** S1-01 (parser must work to verify fixes)

**References:** DESIGN-PLAN.md Quick Win 4, DESIGN-MATRIX-AND-ROADMAP.md Deliverable 2

---

## Sprint Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| .NET 10 SDK not available on all GitHub Actions runners | Medium | High | Use `actions/setup-dotnet@v4` with explicit 10.0.x; if unavailable, use container with .NET 10 preview |
| Question.Id change breaks downstream consumers | Medium | Medium | Audit all usages of `q.Id` in Core and Desktop; add helper `GetDisplayNumber` before removing mutation |
| Content file edits accidentally corrupt unrelated questions | Low | Medium | Review diff carefully; run parser count verification before/after each edit |
| Flatpak .NET 10 SDK extension does not exist yet | Medium | Medium | Document .NET 10 extension name and skip Flatpak CI if extension unavailable; fall back to AppImage |

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Unit tests pass (>= 70% coverage on changed files — defer formal coverage to S2)
- [ ] CI pipeline green
- [ ] Code reviewed
- [ ] Documentation updated

## Sprint Review Checklist

- [ ] All 21 .md files parse (manual verification)
- [ ] CI build passes on Ubuntu
- [ ] App launches locally without crashes
- [ ] NCP-CI-Part3 shows 80 questions (was 0)
- [ ] Technical debt documented (if deferred)
