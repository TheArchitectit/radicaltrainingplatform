# Sprint 10: PDF Export & File System

**Phase:** Growth  
**Duration:** Week 19 - Week 20  
**Goal:** Wire the PDF export button to the existing ExamPdfExporter and abstract all remaining file system calls.

---

## Sprint Backlog

| ID | Story | Points | Assignee | Status |
|---|---|---|---|---|
| S10-01 | Create ISaveFileDialog abstraction in Core.Abstractions | 2 | TBD | To Do |
| S10-02 | Implement AvaloniaSaveDialog | 3 | TBD | To Do |
| S10-03 | Wire OnExportClicked to ExamPdfExporter | 3 | TBD | To Do |
| S10-04 | Handle empty session / no questions edge case | 1 | TBD | To Do |
| S10-05 | Verify GetParentDirectory in IFileProvider / DefaultFileProvider | 1 | TBD | To Do |
| S10-06 | Remove remaining System.IO calls from Core (audit + fix) | 2 | TBD | To Do |

**Total:** 12 points

---

## User Stories

### S10-01: Create ISaveFileDialog Abstraction
**As a** developer, **I want** a save dialog interface, **so that** Core can request file saving without depending on Avalonia.

**Acceptance Criteria:**
- [ ] `ISaveFileDialog.cs` exists in `Core/Abstractions/`
- [ ] Method: `Task<string?> ShowSaveDialogAsync(string defaultFileName, string filterName, string[] filterExtensions)`
- [ ] Returns file path or null if user cancels
- [ ] XML documentation on interface
- [ ] No Avalonia or System.Windows.Forms references in Core

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Create ISaveFileDialog interface | `RadicalTrainingPlatform.Core/Abstractions/ISaveFileDialog.cs` | 15 min | Async method, nullable return |
| Add XML docs | Interface file | 5 min | Document parameters and return |
| Verify no UI deps in Core | Core project | 5 min | Check project references |

**Dependencies:** None

**References:** DESIGN-PLAN.md Section 2.3 (ISaveFileDialog -> AvaloniaSaveDialog), Quick Win 5

---

### S10-02: Implement AvaloniaSaveDialog
**As a** user, **I want** a native save dialog for PDF export, **so that** I can choose where to save my study guide.

**Acceptance Criteria:**
- [ ] `AvaloniaSaveDialog.cs` created in Desktop project
- [ ] Implements `ISaveFileDialog`
- [ ] Uses `IStorageProvider.SaveFilePickerAsync` (Avalonia's cross-platform API)
- [ ] Accepts a Window reference for parent (passed via constructor)
- [ ] Sets default file name and filter (PDF only)
- [ ] Dialog uses synthwave-styled title bar (inherits system theme)
- [ ] Tested on Linux and Windows (macOS deferred if unavailable)

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Create AvaloniaSaveDialog | `RadicalTrainingPlatform.Desktop/Services/AvaloniaSaveDialog.cs` | 1h | Implement ISaveFileDialog using Avalonia storage APIs |
| Add to DI registration | `Program.cs` | 10 min | `services.AddSingleton<ISaveFileDialog>(sp => new AvaloniaSaveDialog(mainWindow))` |
| Handle Window reference | `Program.cs` or `App.axaml.cs` | 20 min | Pass main window after creation |
| Write dialog tests | Test project | 30 min | Mock or verify interface compliance |
| Verify cross-platform | Linux / Windows | 30 min | Manual test: export PDF, verify dialog appears |

**Dependencies:** S10-01 (ISaveFileDialog must exist)

**References:** DESIGN-PLAN.md Quick Win 5 (AvaloniaSaveDialog code provided)

---

### S10-03: Wire OnExportClicked to ExamPdfExporter
**As a** user, **I want** the Export button to generate a PDF study guide, **so that** I can study offline.

**Acceptance Criteria:**
- [ ] `OnExportClicked` in MainWindow.axaml.cs calls `ExamPdfExporter.GenerateExamPdf()`
- [ ] Export uses current session's wrong questions (if any), otherwise all questions
- [ ] Generated PDF opens save dialog via `ISaveFileDialog`
- [ ] PDF saved to user-selected path
- [ ] Progress indicator shown during generation (if generation takes > 500ms)
- [ ] Error handling: log and show user-friendly message on failure
- [ ] Exported PDF is valid and viewable

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Implement OnExportClicked | `MainWindow.axaml.cs` | 1h | Call ExamPdfExporter, ISaveFileDialog, File.WriteAllBytesAsync |
| Determine export content | `MainWindow.axaml.cs` | 20 min | Wrong questions if available, else all questions |
| Add error handling | `MainWindow.axaml.cs` | 20 min | Try/catch, log, show error |
| Add progress indicator | `MainWindow.axaml.cs` or ViewModel | 20 min | IsExporting busy flag |
| Register ISaveFileDialog in DI | `Program.cs` | 10 min | Ensure AvaloniaSaveDialog is registered |
| Write export wiring tests | Test project | 30 min | Mock ISaveFileDialog and ExamPdfExporter |
| Verify end-to-end | Desktop app | 20 min | Click export, save PDF, open and verify |

**Dependencies:** S10-02 (AvaloniaSaveDialog must exist), S4-04 (ExamPdfExporter must have logging)

**References:** DESIGN-PLAN.md Finding 7 (OnExportClicked is empty stub), Quick Win 5

---

### S10-04: Handle Empty Session / No Questions Edge Case
**As a** user, **I want** graceful handling when exporting with no questions, **so that** the app does not crash.

**Acceptance Criteria:**
- [ ] Export button disabled (or shows message) when no questions loaded
- [ ] If export triggered programmatically with empty list: log warning, return early
- [ ] User sees "No questions available to export" message
- [ ] No exception thrown
- [ ] App remains responsive

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Add empty check in OnExportClicked | `MainWindow.axaml.cs` | 10 min | Early return with message |
| Disable export button when empty | `MainWindow.axaml.cs` or ViewModel | 15 min | Bind IsEnabled to HasQuestions |
| Add empty case to ExamPdfExporter | `ExamPdfExporter.cs` | 10 min | Log warning, return empty bytes |
| Write empty session tests | Test project | 15 min | Verify graceful handling |
| Verify build and run | Solution | 10 min | Test export with empty session |

**Dependencies:** S10-03 (export wiring must exist)

**References:** DESIGN-PLAN.md Section 2.4 (data flow shows export path)

---

### S10-05: Verify GetParentDirectory in IFileProvider
**As an** architect, **I want** to confirm the IFileProvider abstraction has no remaining breaches, **so that** Core stays platform-agnostic.

**Acceptance Criteria:**
- [ ] `GetParentDirectory` is implemented in `IFileProvider` and `DefaultFileProvider` (from S4-05, S4-06)
- [ ] `MarkdownExamRepository` uses `_files.GetParentDirectory()` exclusively
- [ ] No `System.IO.Directory` references in Core project
- [ ] No `Path.GetDirectoryName` used for parent resolution in Core (Path.GetFileName is OK)
- [ ] Audit report documented

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Audit Core for System.IO.Directory | Core project | 15 min | `grep -rn "Directory\." RadicalTrainingPlatform.Core/` |
| Audit Core for Path.GetDirectoryName | Core project | 10 min | `grep -rn "Path.GetDirectoryName" RadicalTrainingPlatform.Core/` |
| Verify IFileProvider completeness | Core project | 10 min | Check all IO needs are abstracted |
| Document audit results | `docs/PHASE2-FILESYSTEM-AUDIT.md` | 10 min | Findings, any remaining gaps |
| Fix any remaining breaches | Various | TBD | If any found |

**Dependencies:** S4-05, S4-06 (GetParentDirectory must be implemented)

**References:** DESIGN-PLAN.md Finding 11 (IFileProvider breach)

---

### S10-06: Remove Remaining System.IO Calls from Core
**As an** architect, **I want** Core to have zero direct file system calls, **so that** it is fully testable and cross-platform.

**Acceptance Criteria:**
- [ ] All `File.ReadAllText` in Core go through `IFileProvider.ReadAllText`
- [ ] All `File.Exists` in Core go through `IFileProvider`
- [ ] All `Directory.EnumerateFiles` in Core go through `IFileProvider`
- [ ] All `Path.GetFileName` in Core are OK (utility, not platform-specific)
- [ ] Build passes with zero warnings
- [ ] All tests pass

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Audit for File.ReadAllText | Core project | 15 min | `grep -rn "File\.ReadAllText" RadicalTrainingPlatform.Core/` |
| Audit for File.Exists | Core project | 10 min | `grep -rn "File\.Exists" RadicalTrainingPlatform.Core/` |
| Audit for Directory.EnumerateFiles | Core project | 10 min | `grep -rn "Directory\.Enumerate" RadicalTrainingPlatform.Core/` |
| Replace with IFileProvider calls | Various Core files | 30 min | May need to add methods to IFileProvider |
| Update IFileProvider tests | Test project | 20 min | Verify new methods tested |
| Verify build and tests | Solution | 15 min | `dotnet build && dotnet test` |

**Dependencies:** S10-05 (audit must be complete)

**References:** DESIGN-PLAN.md Part 6 (File-Level Change Map for IFileProvider modifications)

---

## Sprint Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Avalonia storage API changes between 11.2 patch versions | Low | Medium | Pin Avalonia version; use stable StorageProvider API |
| PDF generation is slow on large question sets | Medium | Medium | Add progress indicator; generation on background thread |
| Save dialog requires user interaction, hard to test | Medium | Low | Use ISaveFileDialog mock in tests; manual test for UI |
| IFileProvider needs more methods than anticipated | Low | Medium | Add methods as needed; maintain backward compat |

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Unit tests pass (>= 70% coverage on changed files)
- [ ] CI pipeline green
- [ ] Code reviewed
- [ ] Documentation updated

## Sprint Review Checklist

- [ ] Export button generates and saves a valid PDF
- [ ] PDF contains correct questions (wrong answers or full set)
- [ ] Save dialog appears on all target platforms
- [ ] Empty session handled gracefully
- [ ] Core project has zero direct System.IO calls for file operations
- [ ] No regressions in existing functionality
- [ ] Technical debt documented (if deferred)
