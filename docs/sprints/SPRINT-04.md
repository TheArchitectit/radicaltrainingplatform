# Sprint 4: Architecture — Logging & Quality

**Phase:** Foundation  
**Duration:** Week 7 - Week 8  
**Goal:** Add structured logging throughout Core, fix abstraction breaches, and implement the errata system.

---

## Sprint Backlog

| ID | Story | Points | Assignee | Status |
|---|---|---|---|---|
| S4-01 | Add Microsoft.Extensions.Logging to Core.csproj | 1 | Claude | ✅ Done |
| S4-02 | Add ILogger to MarkdownExamRepository, replace bare catch blocks | 3 | Claude | ✅ Done |
| S4-03 | Add ILogger to QuestionParser, log skipped questions | 3 | Claude | ✅ Done |
| S4-04 | Add ILogger to ExamPdfExporter | 2 | Claude | ⏳ Deferred (minimal impact, no catches to replace) |
| S4-05 | Fix IFileProvider breach — add GetParentDirectory method | 2 | Claude | ✅ Done |
| S4-06 | Implement GetParentDirectory in DefaultFileProvider | 1 | Claude | ✅ Done |
| S4-07 | Create errata.json mechanism + parser integration | 3 | Claude | ✅ Done |
| S4-08 | Wire Core.Tests into CI with coverage reporting | 2 | Claude | ✅ Done |

**Total:** 17 points

---

## User Stories

### S4-01: Add Microsoft.Extensions.Logging to Core.csproj
**As a** developer, **I want** logging abstractions available in Core, **so that** services can log without coupling to a specific provider.

**Acceptance Criteria:**
- [ ] `Microsoft.Extensions.Logging` added to Core.csproj
- [ ] `Microsoft.Extensions.Logging.Abstractions` preferred (lighter weight)
- [ ] Version compatible with .NET 10
- [ ] Build passes with logging package
- [ ] Console logging provider configured in Desktop Program.cs (not Core — respects dependency rule)

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Add logging package | `RadicalTrainingPlatform.Core/RadicalTrainingPlatform.Core.csproj` | 5 min | Use `Abstractions` package if available |
| Configure Console provider in Desktop | `RadicalTrainingPlatform.Desktop/Program.cs` | 10 min | `services.AddLogging(builder => builder.AddConsole())` |
| Set minimum log level | `Program.cs` | 5 min | `LogLevel.Information` default, `LogLevel.Debug` for RTP namespace |
| Verify build | Solution | 10 min | `dotnet build` |

**Dependencies:** S3-05 (DI must exist to inject ILogger<T>)

**References:** DESIGN-PLAN.md Section 2.5 (Logging decision)

---

### S4-02: Add ILogger to MarkdownExamRepository, Replace Bare Catch Blocks
**As an** operator, **I want** file discovery failures to be logged, **so that** I can diagnose why questions are missing.

**Acceptance Criteria:**
- [ ] `ILogger<MarkdownExamRepository>` injected via constructor
- [ ] Bare `try { } catch { }` in SearchPaths getter logs `LogLevel.Warning` with exception details
- [ ] Bare `catch { /* ignore inaccessible dirs */ }` in `FindExamFiles` logs `LogLevel.Warning` with path and exception
- [ ] All catch blocks now log; no silent suppression remains in MarkdownExamRepository
- [ ] Tests verify logging behavior (can use `Microsoft.Extensions.Logging.Testing`)
- [ ] Logger parameter is optional (nullable) for backward compatibility with call sites not yet updated

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Add ILogger constructor parameter | `RadicalTrainingPlatform.Core/Infrastructure/IExamRepository.cs` | 15 min | `ILogger<MarkdownExamRepository>? logger = null` |
| Replace silent catch in SearchPaths | `IExamRepository.cs` | 10 min | Line 66; log warning with exception |
| Replace silent catch in FindExamFiles | `IExamRepository.cs` | 10 min | Line 96; log warning with path and exception |
| Audit entire file for bare catches | `IExamRepository.cs` | 10 min | `grep -n "catch { }"` |
| Add logging tests | Test project | 30 min | Verify logger receives expected calls |
| Update DI registration | `Program.cs` | 10 min | Logger is auto-injected by DI |
| Verify build and tests | Solution | 15 min | `dotnet build && dotnet test` |

**Dependencies:** S4-01 (logging package must exist), S3-06 (DI container for injection)

**References:** DESIGN-PLAN.md Finding 12 (bare catch blocks)

---

### S4-03: Add ILogger to QuestionParser, Log Skipped Questions
**As an** operator, **I want** parser skips to be visible in logs, **so that** content format issues are discoverable.

**Acceptance Criteria:**
- [ ] `ILogger<QuestionParser>` injected via constructor
- [ ] Log `LogLevel.Warning` when a question is skipped due to missing options
- [ ] Log `LogLevel.Warning` when a question is skipped due to missing answers
- [ ] Log `LogLevel.Information` when a file is parsed, with question count
- [ ] Log `LogLevel.Warning` when answer format variant is encountered (e.g., `**Correct Answer:**`)
- [ ] Logger parameter is optional for backward compatibility

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Add ILogger constructor parameter | `RadicalTrainingPlatform.Core/Services/QuestionParser.cs` | 10 min | After S1-04 simplification |
| Add skip logging in ParseFile | `QuestionParser.cs` | 20 min | Lines around 242 where questions are filtered out |
| Add file completion logging | `QuestionParser.cs` | 10 min | After parsing loop completes |
| Add answer variant detection log | `QuestionParser.cs` | 15 min | Detect and log when `Correct Answer:` found |
| Add parser logging tests | Test project | 30 min | Mock `ILogger<QuestionParser>`, verify calls |
| Update DI registration | `Program.cs` | 5 min | Logger auto-injected |
| Verify build and tests | Solution | 15 min | `dotnet build && dotnet test` |

**Dependencies:** S4-01 (logging package), S1-04 (QuestionParser constructor simplified), S1-01 (parser fix must be in place)

**References:** DESIGN-PLAN.md Deliverable 6

---

### S4-04: Add ILogger to ExamPdfExporter
**As an** operator, **I want** PDF export operations to be logged, **so that** export failures are diagnosable.

**Acceptance Criteria:**
- [ ] `ILogger<ExamPdfExporter>` injected via constructor
- [ ] Log `LogLevel.Information` on generation start (exam code, question count)
- [ ] Log `LogLevel.Information` on generation complete
- [ ] Log `LogLevel.Warning` when empty question list is passed
- [ ] Log `LogLevel.Error` on QuestPDF exception with exception details

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Add ILogger constructor parameter | `RadicalTrainingPlatform.Core/PdfExport/ExamPdfExporter.cs` | 10 min | Optional parameter |
| Add generation start log | `ExamPdfExporter.cs` | 10 min | Log exam code and count |
| Add generation complete log | `ExamPdfExporter.cs` | 5 min | Log success |
| Add empty list warning | `ExamPdfExporter.cs` | 5 min | Early return with warning |
| Add exception logging | `ExamPdfExporter.cs` | 5 min | Wrap generation in try/catch |
| Add exporter logging tests | Test project | 20 min | Verify logger calls |
| Verify build and tests | Solution | 15 min | `dotnet build && dotnet test` |

**Dependencies:** S4-01 (logging package)

**References:** DESIGN-PLAN.md Deliverable 6

---

### S4-05: Fix IFileProvider Breach — Add GetParentDirectory Method
**As an** architect, **I want** no direct System.IO calls in Core, **so that** the file system abstraction is complete.

**Acceptance Criteria:**
- [ ] `GetParentDirectory(string path)` added to `IFileProvider` interface
- [ ] Method returns `string?` (null if no parent)
- [ ] XML documentation on the interface method
- [ ] Design matches existing IFileProvider pattern (cross-platform, testable)

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Add GetParentDirectory to interface | `RadicalTrainingPlatform.Core/Infrastructure/IFileProvider.cs` | 15 min | `string? GetParentDirectory(string path);` |
| Add XML docs | Interface file | 5 min | Describe behavior for edge cases |
| Verify no breaking changes | Interface file | 5 min | Other members untouched |

**Dependencies:** None

**References:** DESIGN-PLAN.md Finding 11 (IFileProvider breach)

---

### S4-06: Implement GetParentDirectory in DefaultFileProvider
**As a** developer, **I want** the default file provider to support parent directory resolution, **so that** MarkdownExamRepository can use it.

**Acceptance Criteria:**
- [ ] `GetParentDirectory` implemented in `DefaultFileProvider`
- [ ] Implementation delegates to `Path.GetDirectoryName` or `Directory.GetParent`
- [ ] Returns `null` for root paths or invalid inputs (not throws)
- [ ] `MarkdownExamRepository` updated to use `_files.GetParentDirectory()` instead of `Directory.GetParent`
- [ ] No `System.IO.Directory` references remain in Core project (verify via `grep`)

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Implement GetParentDirectory | `RadicalTrainingPlatform.Core/Infrastructure/DefaultFileProvider.cs` | 15 min | Delegate to Directory.GetParent or Path.GetDirectoryName |
| Update MarkdownExamRepository | `IExamRepository.cs` | 10 min | Line 73: replace `Directory.GetParent` with `_files.GetParentDirectory` |
| Audit Core for System.IO.Directory | Core project | 10 min | `grep -rn "Directory\." RadicalTrainingPlatform.Core/` |
| Update IFileProvider tests | Test project | 20 min | Test GetParentDirectory behavior |
| Verify build and tests | Solution | 15 min | `dotnet build && dotnet test` |

**Dependencies:** S4-05 (interface method must exist)

**References:** DESIGN-PLAN.md Finding 11

---

### S4-07: Create errata.json Mechanism + Parser Integration
**As a** content maintainer, **I want** wrong answer keys to be overridable without modifying source markdown, **so that** errata can be applied and tracked independently.

**Acceptance Criteria:**
- [ ] `errata.json` file exists at repo root with documented schema
- [ ] Schema includes: `id`, `file`, `questionId`, `correctionType`, `correctAnswer`, `rationale`, `dateAdded`
- [ ] QuestionParser loads errata.json on initialization (optional — app works without it)
- [ ] After parsing, errata corrections are applied to matching questions
- [ ] Errata corrections override parsed `CorrectAnswers` but do NOT modify the .md file
- [ ] 3 known wrong keys are documented in errata.json
- [ ] Tests verify errata application:
  - Parse NCA-75-Part1.md Q3, verify errata override applied even if .md unchanged
  - Parse with no errata.json, verify normal behavior

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Create errata.json | `errata.json` (repo root) | 30 min | See DESIGN-PLAN.md Deliverable 2 for entries |
| Add errata loading in QuestionParser | `QuestionParser.cs` | 1h | Load from AppContext.BaseDirectory, fallback paths |
| Add errata application in ParseFile | `QuestionParser.cs` | 30 min | Apply after parsing, before return |
| Log errata application | `QuestionParser.cs` | 10 min | Info level when errata applied |
| Add errata tests | Test project | 30 min | Verify override works, missing errata doesn't crash |
| Document schema | Inline or `docs/ERRATA-SCHEMA.md` | 15 min | JSON schema description |
| Verify build and tests | Solution | 15 min | `dotnet build && dotnet test` |

**Dependencies:** S4-02, S4-03 (logging needed for errata application visibility)

**References:** DESIGN-PLAN.md Deliverable 2 (errata.json template and application code)

---

### S4-08: Wire Core.Tests into CI with Coverage Reporting
**As a** developer, **I want** test coverage visible in CI, **so that** coverage regressions are caught automatically.

**Acceptance Criteria:**
- [ ] CI workflow runs `dotnet test` with Coverlet collector
- [ ] Coverage report generated in Cobertura format
- [ ] Coverage artifacts uploaded as CI artifacts
- [ ] CI fails if tests fail (no `|| true` masking)
- [ ] Coverage threshold not yet enforced (informational only for now)
- [ ] Coverage report visible per-PR via GitHub artifact

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Add test step to build.yml | `.github/workflows/build.yml` | 15 min | `dotnet test --configuration Release --collect:"XPlat Code Coverage"` |
| Upload coverage artifact | `.github/workflows/build.yml` | 10 min | `actions/upload-artifact` for coverage results |
| Verify test execution in CI | Feature branch | 15 min | Push, check Actions tab |
| Verify coverage artifact | GitHub Actions | 10 min | Download and inspect XML |
| Remove any remaining `\|\| true` | `.github/workflows/build.yml` | 5 min | Audit for masking |

**Dependencies:** S2-01 (test project must exist), S1-03 (CI must be green), S2-07 (linter must be in CI already)

**References:** DESIGN-PLAN.md Deliverable 4, Part 6 (build.yml modifications)

---

## Sprint Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Microsoft.Extensions.Logging.Testing not compatible with .NET 10 | Low | Medium | Use custom `ListLogger` test double; or use `Serilog` with `InMemorySink` |
| Errata.json loading fails silently on different platforms | Medium | Medium | Multiple fallback paths (AppContext.BaseDirectory, working dir, parent dirs); log all attempts |
| GetParentDirectory semantics differ across OS paths | Low | Medium | Normalize path separators; use .NET's Path/Directory abstractions |
| Adding ILogger parameters breaks existing constructor call sites | Medium | High | Make logger parameter optional with default `null`; update DI registration |
| Coverage artifact format not readable by GitHub | Low | Low | Use Cobertura (widely supported); add step description in CI |

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Unit tests pass (>= 70% coverage on changed files)
- [ ] CI pipeline green
- [ ] Code reviewed
- [ ] Documentation updated

## Sprint Review Checklist

- [ ] All bare catch blocks in Core are now logging (no silent suppression)
- [ ] Parsing NCP-CI-Part3 logs a warning about answer format variant
- [ ] Errata.json overrides are applied correctly in tests
- [ ] IFileProvider has no remaining breaches (verify with grep)
- [ ] CI test step runs and generates coverage artifacts
- [ ] No regressions in existing functionality
- [ ] Technical debt documented (if deferred)
