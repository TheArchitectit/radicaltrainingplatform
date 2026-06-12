# Sprint 9: Persistence Layer

**Phase:** Growth  
**Duration:** Week 17 - Week 18  
**Goal:** Implement SQLite-backed session persistence so user progress survives app restarts.

---

## Sprint Backlog

| ID | Story | Points | Assignee | Status |
|---|---|---|---|---|
| S9-01 | Create IProgressRepository interface in Core.Abstractions | 2 | TBD | To Do |
| S9-02 | Create SQLite schema (SessionResults, QuestionResults tables) | 3 | TBD | To Do |
| S9-03 | Implement SqliteProgressRepository | 5 | TBD | To Do |
| S9-04 | Persist session results on exam completion | 3 | TBD | To Do |
| S9-05 | Persist per-question metadata (timestamp, correct/incorrect, time-to-answer) | 3 | TBD | To Do |
| S9-06 | Wire progress repository into DI container | 1 | TBD | To Do |

**Total:** 17 points

---

## User Stories

### S9-01: Create IProgressRepository Interface
**As a** developer, **I want** a persistence interface, **so that** storage can be swapped (SQLite, mock, cloud in Phase 4).

**Acceptance Criteria:**
- [ ] `IProgressRepository.cs` exists in `Core/Abstractions/`
- [ ] Methods:
  - `Task SaveSessionResultAsync(SessionResult result)`
  - `Task<SessionResult?> GetSessionResultAsync(int id)`
  - `Task<List<SessionResult>> GetSessionResultsAsync(string? examCode = null)`
  - `Task SaveQuestionResultAsync(QuestionResult result)`
  - `Task<List<QuestionResult>> GetQuestionResultsAsync(int sessionId)`
  - `Task<List<QuestionResult>> GetQuestionResultsByExamAsync(string examCode)`
- [ ] `SessionResult` and `QuestionResult` model classes created in Core.Models
- [ ] All methods are async (Task-returning)
- [ ] XML documentation on all members

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Create SessionResult model | `RadicalTrainingPlatform.Core/Models/SessionResult.cs` | 15 min | ExamCode, StartedAt, CompletedAt, TotalQuestions, CorrectCount, WrongCount, WasTimed, TimeLimitSeconds |
| Create QuestionResult model | `RadicalTrainingPlatform.Core/Models/QuestionResult.cs` | 15 min | SessionId, QuestionId, ExamCode, SourceFile, WasCorrect, SelectedAnswers (JSON), TimeToAnswerMs, AnsweredAt |
| Create IProgressRepository interface | `RadicalTrainingPlatform.Core/Abstractions/IProgressRepository.cs` | 20 min | See methods above |
| Add XML docs | Interface and models | 10 min | Document all properties |
| Verify build | Core project | 10 min | `dotnet build` |

**Dependencies:** S3-01, S3-02 (Abstractions namespace should exist)

**References:** DESIGN-PLAN.md Section 2.5 (Persistence decision), Section 2.5 Schema

---

### S9-02: Create SQLite Schema
**As a** developer, **I want** a defined database schema, **so that** data integrity is maintained.

**Acceptance Criteria:**
- [ ] Schema creation script or migration created
- [ ] Tables:
  - `SessionResults`: id, exam_code, started_at, completed_at, total_questions, correct_count, wrong_count, was_timed, time_limit_seconds
  - `QuestionResults`: id, session_id, question_id, exam_code, source_file, was_correct, selected_answers (TEXT/JSON), time_to_answer_ms, answered_at
- [ ] Foreign key constraint: `QuestionResults.session_id` -> `SessionResults.id`
- [ ] Indexes on: `SessionResults.exam_code`, `QuestionResults.session_id`, `QuestionResults.exam_code`
- [ ] Schema is idempotent (can be run multiple times safely)
- [ ] Database file stored in application data directory (cross-platform)

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Add SQLite package to Core | Core.csproj | 10 min | `Microsoft.Data.Sqlite` or `Microsoft.EntityFrameworkCore.Sqlite` |
| Create schema creation script | `RadicalTrainingPlatform.Core/Infrastructure/Schema.sql` | 20 min | CREATE TABLE with IF NOT EXISTS |
| Create DB initialization code | `SqliteProgressRepository.cs` (partial) | 30 min | Execute schema on first use |
| Add index definitions | Schema.sql or init code | 10 min | CREATE INDEX statements |
| Verify schema creates correctly | Test project | 20 min | Initialize DB, verify tables exist |
| Verify database location | Desktop app | 10 min | Check app data directory |

**Dependencies:** S9-01 (IProgressRepository must be defined)

**References:** DESIGN-PLAN.md Section 2.5 (schema provided)

---

### S9-03: Implement SqliteProgressRepository
**As a** user, **I want** my progress saved to SQLite, **so that** it persists across sessions.

**Acceptance Criteria:**
- [ ] `SqliteProgressRepository` implements `IProgressRepository`
- [ ] Constructor accepts `IFileProvider` (for DB file path) and optionally `ILogger`
- [ ] All CRUD methods implemented with raw SQL (or EF Core if available)
- [ ] Proper connection management (using statements, connection pooling)
- [ ] JSON serialization for `SelectedAnswers` list stored as TEXT
- [ ] DateTime stored as ISO 8601 strings
- [ ] Async/await used throughout for I/O operations
- [ ] Comprehensive unit tests with in-memory SQLite

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Create SqliteProgressRepository class | `RadicalTrainingPlatform.Core/Infrastructure/SqliteProgressRepository.cs` | 2h | Implement all IProgressRepository methods |
| Implement SaveSessionResultAsync | Repository file | 30 min | INSERT or REPLACE |
| Implement GetSessionResultsAsync | Repository file | 30 min | SELECT with optional exam_code filter |
| Implement SaveQuestionResultAsync | Repository file | 30 min | INSERT with JSON serialization |
| Implement GetQuestionResultsAsync | Repository file | 30 min | SELECT by session_id |
| Add JSON helper for SelectedAnswers | Repository file | 15 min | `System.Text.Json` |
| Write repository tests | Test project | 1h | Use in-memory SQLite, test all CRUD |
| Verify build and tests | Solution | 15 min | `dotnet build && dotnet test` |

**Dependencies:** S9-01, S9-02 (interface and schema must exist)

**References:** DESIGN-PLAN.md Section 2.3 (IProgressRepository -> SqliteProgressRepository)

---

### S9-04: Persist Session Results on Exam Completion
**As a** user, **I want** my exam results saved automatically when I finish, **so that** I can review them later.

**Acceptance Criteria:**
- [ ] When user submits final question, session results are saved to `IProgressRepository`
- [ ] `ExamSessionViewModel.SubmitFinal()` or `CompleteSession()` triggers save
- [ ] Save includes: exam code, total questions, correct count, wrong count
- [ ] Save is async and does not block UI
- [ ] Success/failure logged (not surfaced to user unless error)
- [ ] Results visible in StatsView after app restart

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Add completion detection | `ExamSessionViewModel.cs` | 20 min | Detect when last question submitted |
| Add IProgressRepository dependency | `ExamSessionViewModel.cs` | 15 min | Injected via constructor or factory |
| Add SaveSessionResult call | `ExamSessionViewModel.cs` | 30 min | Build SessionResult, call SaveSessionResultAsync |
| Wire into DI | `Program.cs` | 10 min | Register IProgressRepository -> SqliteProgressRepository |
| Handle save errors gracefully | `ExamSessionViewModel.cs` | 15 min | Log error, allow UI to continue |
| Write completion tests | Test project | 30 min | Mock IProgressRepository, verify SaveSessionResultAsync called |
| Verify persistence across restarts | Desktop app | 20 min | Complete exam, restart, check StatsView |

**Dependencies:** S9-03 (repository must be implemented), S3-06 (DI container)

**References:** DESIGN-MATRIX-AND-ROADMAP.md Phase 2 Deliverable 4

---

### S9-05: Persist Per-Question Metadata
**As a** user, **I want** per-question history saved, **so that** analytics and spaced repetition can work in future sprints.

**Acceptance Criteria:**
- [ ] Each question submission saves a `QuestionResult` record
- [ ] Metadata includes: question ID, exam code, was correct, selected answers, time-to-answer in ms, timestamp
- [ ] Time-to-answer measured from question display to submission
- [ ] Selected answers stored as JSON array (e.g., `["A","C"]`)
- [ ] Records retrievable by exam code for analytics
- [ ] Records retrievable by session ID for session review

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Add time tracking to ExamSessionViewModel | `ExamSessionViewModel.cs` | 20 min | Stopwatch per question |
| Add QuestionResult save on each submit | `ExamSessionViewModel.cs` | 30 min | Call SaveQuestionResultAsync |
| Implement GetQuestionResultsByExamAsync | `SqliteProgressRepository.cs` | 20 min | SELECT WHERE exam_code = ? |
| Verify JSON serialization | Test project | 20 min | SelectedAnswers round-trips correctly |
| Write per-question save tests | Test project | 30 min | Verify QuestionResult saved with correct metadata |
| Verify retrieval by exam code | Test project | 20 min | GetQuestionResultsByExamAsync |
| Verify build and run | Solution | 15 min | Manual test: complete exam, query DB |

**Dependencies:** S9-04 (session save must exist)

**References:** DESIGN-MATRIX-AND-ROADMAP.md Phase 2 Deliverable 4 (per-question metadata)

---

### S9-06: Wire Progress Repository into DI Container
**As a** developer, **I want** the progress repository registered in DI, **so that** it's available throughout the application.

**Acceptance Criteria:**
- [ ] `IProgressRepository` registered as Singleton in DI container
- [ ] Implementation: `SqliteProgressRepository`
- [ ] Constructor receives `IFileProvider` from DI
- [ ] No direct `new SqliteProgressRepository()` calls outside DI registration
- [ ] All existing tests still pass

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Add DI registration | `Program.cs` | 10 min | `services.AddSingleton<IProgressRepository, SqliteProgressRepository>()` |
| Verify resolution | Desktop app | 10 min | Start app, verify no DI errors |
| Verify IFileProvider injection | DI configuration | 5 min | Ensure IFileProvider registered before IProgressRepository |
| Run all tests | Solution | 15 min | `dotnet test` |

**Dependencies:** S9-03 (repository must be implemented), S3-06 (DI container)

**References:** DESIGN-PLAN.md Section 2.5 (Registration profile)

---

## Sprint Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Microsoft.Data.Sqlite incompatible with .NET 10 | Low | High | Use raw `SQLitePCLRaw` if needed; test compatibility in S6 |
| Database file location issues on macOS/Linux | Medium | Medium | Use IFileProvider.GetApplicationDataDirectory for cross-platform path |
| Async SQLite operations cause UI thread issues | Low | Medium | Use ConfigureAwait(false) in repository; UI VM uses async commands |
| JSON serialization changes break data format | Low | Medium | Version the schema; document breaking changes |
| Performance: many small INSERTs are slow | Low | Medium | Use transactions for batch inserts |

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Unit tests pass (>= 70% coverage on changed files)
- [ ] CI pipeline green
- [ ] Code reviewed
- [ ] Documentation updated

## Sprint Review Checklist

- [ ] Complete an exam, verify results appear in StatsView
- [ ] Restart app, verify previous session results persist
- [ ] Per-question metadata queryable from repository
- [ ] Database file exists in correct cross-platform location
- [ ] No UI blocking during save operations
- [ ] No regressions in existing functionality
- [ ] Technical debt documented (if deferred)
