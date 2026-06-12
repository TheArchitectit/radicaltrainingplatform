# Sprint 2: Test Foundation

**Phase:** Foundation  
**Duration:** Week 3 - Week 4  
**Goal:** Establish a comprehensive test suite that provides regression protection for all future refactoring.

---

## Sprint Backlog

| ID | Story | Points | Assignee | Status |
|---|---|---|---|---|
| S2-01 | Create Core.Tests project with xUnit + Shouldly + NSubstitute | 2 | TBD | To Do |
| S2-02 | QuestionParser unit tests (85%+ coverage) | 5 | TBD | To Do |
| S2-03 | ExamSessionViewModel unit tests (80%+ coverage) | 5 | TBD | To Do |
| S2-04 | DeriveExamCode parameterized tests (100% coverage) | 2 | TBD | To Do |
| S2-05 | DefaultFileProvider + MarkdownExamRepository tests | 3 | TBD | To Do |
| S2-06 | Create content format linter script | 2 | TBD | To Do |
| S2-07 | Add linter step to CI pipeline | 1 | TBD | To Do |

**Total:** 20 points

---

## User Stories

### S2-01: Create Core.Tests Project
**As a** developer, **I want** a test project with modern tooling, **so that** I can write fast, readable, maintainable tests.

**Acceptance Criteria:**
- [ ] `RadicalTrainingPlatform.Core.Tests.csproj` exists with correct package references
- [ ] Project targets `net10.0`
- [ ] References: xUnit, Shouldly, NSubstitute, Coverlet, Microsoft.NET.Test.Sdk
- [ ] Project references Core project
- [ ] `dotnet test` runs from repo root with zero errors (no tests yet is OK)
- [ ] Coverlet configured for Cobertura output format

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Create test project file | `RadicalTrainingPlatform.Core.Tests/RadicalTrainingPlatform.Core.Tests.csproj` | 15 min | See DESIGN-PLAN.md Deliverable 4 for template |
| Create test project directory structure | `RadicalTestingPlatform.Core.Tests/` | 10 min | Mirror Core namespace structure |
| Add to solution | `RadicalTrainingPlatform.sln` | 10 min | `dotnet sln add` |
| Verify dotnet test works | Repo root | 10 min | Should pass with 0 tests |

**Dependencies:** S1-03 (CI must be green so tests run), S1-07 (global.json pins SDK)

**References:** DESIGN-PLAN.md Deliverable 4

---

### S2-02: QuestionParser Unit Tests (85%+ Coverage)
**As a** developer, **I want** comprehensive parser tests, **so that** parser changes are regression-protected.

**Acceptance Criteria:**
- [ ] `QuestionParserTests.cs` with >= 85% line coverage of `QuestionParser`
- [ ] Tests for standard `**Answer: X**` format
- [ ] Tests for `**Correct Answer: X**` variant (from S1-01 fix)
- [ ] Tests for multi-select answers (`**Answer: A, C**`)
- [ ] Tests for questions with missing options (should skip with warning)
- [ ] Tests for questions with missing answers (should skip with warning)
- [ ] Tests for empty file handling
- [ ] Tests for malformed markdown handling
- [ ] `ParseFile` tests with mocked `IExamRepository`

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Create QuestionParserTests | `RadicalTrainingPlatform.Core.Tests/QuestionParserTests.cs` | 3h | Use NSubstitute for IExamRepository mocks |
| Write standard format tests | Test file | 30 min | Single-select, multi-select |
| Write edge case tests | Test file | 30 min | Missing options, missing answers, empty file |
| Write malformed content tests | Test file | 30 min | Bad headers, missing separators |
| Run coverage report | Repo root | 15 min | Coverlet output, verify >= 85% |

**Dependencies:** S2-01 (test project must exist), S1-01 (AnswerRegex fix must be in place)

**References:** DESIGN-PLAN.md Deliverable 4 (test skeleton provided)

---

### S2-03: ExamSessionViewModel Unit Tests (80%+ Coverage)
**As a** developer, **I want** ViewModel state machine tests, **so that** exam session logic is regression-protected.

**Acceptance Criteria:**
- [ ] `ExamSessionViewModelTests.cs` with >= 80% line coverage
- [ ] Constructor tests (limit not specified uses all questions)
- [ ] `SelectAnswer` / `DeselectAnswer` tests
- [ ] `Submit` with correct answer updates `CorrectCount`
- [ ] `Submit` with wrong answer updates `WrongCount`
- [ ] `Next` / `Previous` navigation tests
- [ ] `GetDisplayNumber` does not mutate original `Question.Id`
- [ ] Session with limit less than total questions
- [ ] `GetWrongQuestions` returns only incorrect answers

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Create ExamSessionViewModelTests | `RadicalTrainingPlatform.Core.Tests/ExamSessionViewModelTests.cs` | 3h | See DESIGN-PLAN.md for test skeleton |
| Write constructor tests | Test file | 30 min | Default limit, explicit limit, empty list |
| Write answer selection tests | Test file | 30 min | Single, multi, toggle, clear |
| Write submit/scoring tests | Test file | 30 min | Correct, incorrect, partial |
| Write navigation tests | Test file | 30 min | Next, Previous, bounds checking |
| Write immutability test | Test file | 15 min | Verify Question.Id unchanged after VM creation |
| Run coverage report | Repo root | 15 min | Verify >= 80% |

**Dependencies:** S2-01 (test project), S1-05 (Question.Id mutation must be fixed first)

**References:** DESIGN-PLAN.md Deliverable 4

---

### S2-04: DeriveExamCode Parameterized Tests (100% Coverage)
**As a** developer, **I want** exhaustive filename tests, **so that** exam code derivation never regresses.

**Acceptance Criteria:**
- [ ] `DeriveExamCodeTests.cs` with 100% line coverage of `DeriveExamCode`
- [ ] Theory data covers all known filename patterns:
  - `NCP-US-Part2-D3.md` -> `"NCP-US"`
  - `NCP-US-Part2-D4.md` -> `"NCP-US"`
  - `NCA-75-Part3-GapFill.md` -> `"NCA-75"`
  - `NCP-CI-Part5-GapFill.md` -> `"NCP-CI"`
  - `NCM-MCI-Part1.md` -> `"NCM-MCI"`
  - `AWS-SAA-Part1.md` -> `"AWS-SAA"`
  - `CKA.md` -> `"CKA"`
- [ ] Edge cases: no extension, no hyphens, multiple suffixes

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Create DeriveExamCodeTests | `RadicalTrainingPlatform.Core.Tests/DeriveExamCodeTests.cs` | 45 min | Theory with InlineData for each case |
| Add edge case tests | Test file | 15 min | Null, empty, no extension, no hyphens |
| Verify 100% coverage | Repo root | 10 min | `dotnet test --collect:"XPlat Code Coverage"` |

**Dependencies:** S2-01 (test project), S1-02 (DeriveExamCode fix must be in place)

**References:** DESIGN-PLAN.md Quick Win 2 (test cases provided)

---

### S2-05: DefaultFileProvider + MarkdownExamRepository Tests
**As a** developer, **I want** infrastructure tests, **so that** file system abstractions are verified.

**Acceptance Criteria:**
- [ ] `DefaultFileProviderTests.cs` with >= 60% coverage
- [ ] `MarkdownExamRepositoryTests.cs` with >= 70% coverage
- [ ] IFileProvider tests use temporary directories (not real file system where possible)
- [ ] ExamRepository tests verify file discovery, path resolution, and content reading
- [ ] Mock IFileProvider used for repository tests (isolate layers)

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Create DefaultFileProviderTests | `RadicalTrainingPlatform.Core.Tests/DefaultFileProviderTests.cs` | 1h | Test GetApplicationDataDirectory, ReadAllText, etc. |
| Create MarkdownExamRepositoryTests | `RadicalTrainingPlatform.Core.Tests/MarkdownExamRepositoryTests.cs` | 1h | Mock IFileProvider, test FindExamFiles, ReadExamFile |
| Write file discovery tests | Test file | 30 min | Verify .md files found, non-.md skipped, README skipped |
| Write path resolution tests | Test file | 30 min | Working directory, app data directory |
| Run coverage | Repo root | 10 min | Verify thresholds |

**Dependencies:** S2-01 (test project)

**References:** DESIGN-PLAN.md Deliverable 4 (coverage targets)

---

### S2-06: Create Content Format Linter Script
**As a** content author, **I want** automated content validation, **so that** formatting errors are caught before merge.

**Acceptance Criteria:**
- [ ] `scripts/lint-content.py` exists and is executable
- [ ] Script counts questions (`### Qn`) and answers per file
- [ ] Script reports mismatch (questions != answers) as error with filename
- [ ] Script detects unsupported formats (empty answers, missing `---` separators)
- [ ] Script exits with code 0 on success, code 1 on errors
- [ ] Script outputs summary: files checked, total questions validated
- [ ] README/CLAUDE/CHEATSHEET/LAB/ROADMAP/CHANGELOG/CONTRIBUTING/LICENSE/CODE_OF_CONDUCT files are skipped

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Create linter script | `scripts/lint-content.py` | 1h | Python 3, regex-based validation |
| Add question count validation | Script | 15 min | Count `### Q\d+` headers |
| Add answer format validation | Script | 15 min | Match `^\*\*(?:Correct )?Answer:` |
| Add mismatch detection | Script | 15 min | Compare question count to answer count per file |
| Add skip list | Script | 10 min | Skip non-exam markdown files |
| Test against all 21 files | Repo root | 15 min | Run script, verify no false positives |

**Dependencies:** S1-01 (parser fix must be in so counts are reliable)

**References:** DESIGN-PLAN.md Quick Win 6 (script template provided)

---

### S2-07: Add Linter Step to CI Pipeline
**As a** developer, **I want** content linting in CI, **so that** bad content never reaches main.

**Acceptance Criteria:**
- [ ] CI workflow has a "Lint exam content" step
- [ ] Step runs `python3 scripts/lint-content.py`
- [ ] Step runs before build (fail fast)
- [ ] CI fails if linter finds errors
- [ ] Linter step is present on all OS jobs (or a separate job)

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Add linter step to build.yml | `.github/workflows/build.yml` | 15 min | Before `dotnet build`; ensure python3 available |
| Verify python3 availability | GitHub Actions | 10 min | `python3 --version` in CI |
| Test failure mode | Feature branch | 10 min | Introduce bad content, verify CI fails |
| Test success mode | Feature branch | 10 min | Valid content, verify CI passes |

**Dependencies:** S2-06 (linter script must exist), S1-03 (CI must be green)

**References:** DESIGN-PLAN.md Quick Win 6

---

## Sprint Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| .NET 10 test SDK incompatibility with xUnit | Medium | High | Pin to known-compatible versions; have net8.0 fallback ready |
| NSubstitute fails on .NET 10 preview | Low | High | Use Moq as fallback; or write manual fakes |
| QuestionParser is complex to mock (IExamRepository) | Medium | Medium | NSubstitute handles interface mocking well; have fallback manual mock |
| ExamSessionViewModel has hidden UI dependencies | Medium | Medium | If so, extract pure logic into testable service; document the need |
| Content linter produces false positives | Medium | Medium | Tune regex carefully; test against all 21 files before enabling in CI |

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Unit tests pass (>= 70% coverage on changed files)
- [ ] CI pipeline green
- [ ] Code reviewed
- [ ] Documentation updated

## Sprint Review Checklist

- [ ] `dotnet test` runs from repo root and passes in < 30 seconds
- [ ] Coverlet report shows >= 70% line coverage for Core assembly
- [ ] CI workflow runs tests and fails build on test failure
- [ ] Content linter runs in CI and catches bad content
- [ ] No regressions in existing functionality
- [ ] Technical debt documented (if deferred)
