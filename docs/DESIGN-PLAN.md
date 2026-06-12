# RadicalTrainingPlatform — Engineering Design Plan
## Generated from deep code audit — Validated against actual source, June 2026

---

# PART 1: Architecture Review & Validated Findings

## 1.1 Design Matrix Findings — Validation Report

### Finding 1: Parser Bug — "Correct Answer:" Variant Drops 80 Questions (NCP-CI-Part3)

**Matrix verdict: CONFIRMED**

- **File:** `RadicalTrainingPlatform.Core/Services/QuestionParser.cs`, line 32
- **Current regex:** `^\*\*Answer:\s*([A-F][,\s]*(?:[A-F][,\s]*)*)\*\*`
- **Evidence:**
  - NCP-CI-Part3.md contains 80 instances of `**Correct Answer: X**` (verified via `grep -c "^\*\*Correct Answer:"`)
  - NCP-CI-Part3.md contains 0 instances of `**Answer: X**`
  - Because the answer regex never matches, all 80 questions in this file are silently dropped at ParseFile line 242: `if (q.Options.Count > 0 && q.CorrectAnswers.Count > 0)` fails (CorrectAnswers is empty)
  - No logging, no warning, no ParseResult. The file returns an empty List<Question>.
- **Impact:** 22% of NCP-CI track (80/360 questions) are invisible to the app
- **Fix effort:** Single-line regex change. Risk: zero.

### Finding 2: DeriveExamCode Mis-Classifies GapFill and D-Suffix Files

**Matrix verdict: CONFIRMED with nuance**

- **File:** `RadicalTrainingPlatform.Core/Services/QuestionParser.cs`, lines 39-55
- **Current regex (line 44):** `^(.+?)-?(?:Part\d+|D\d+)$`
- **Input:** `NCA-75-Part3-GapFill.md`
  - The regex ADDITIVE (backtracking lazily): `(NCA-75-Part3)-GapFill` is NOT matched by `(?:Part\d+|D\d+)` on the end because the suffix is `-GapFill`. The regex expects the entire end sequence `-(?:Part\d+|D\d+)`.
  - `NCA-75-Part3-GapFill` does NOT match `^(.+?)-?(?:Part\d+|D\d+)$` because `-GapFill` does not match `(?:Part\d+|D\d+)`.
  - Falls through to hyphen-split (line 49): `parts = ["NCA", "75", "Part3", "GapFill"]`. Since `parts.Length >= 2` and `int.TryParse(parts[1], out _)` succeeds (`75`), returns `parts[0]` = `NCA` (not `NCA-75`).
  - Expected: `NCA-75` or `NCA-75` for the exam code. **This IS a bug.**
- **Input:** `NCP-US-Part2-D3.md`
  - Matches `(NCP-US-Part2)-D3` → returns `NCP-US-Part2` (WRONG). Should be `NCP-US`.
  - Test with bash: `echo "NCP-US-Part2-D3" | sed -E 's/^(.*)-(Part[0-9]+|D[0-9]+)$//'` confirms Group 1 captures `NCP-US-Part2`.
- **Impact:** NCP-US-Part2-D3.md and NCP-US-Part2-D4.md are classified under `NCP-US-Part2` instead of `NCP-US`. BlueprintService.GetBlueprint("NCP-US-Part2") returns null. No blueprint objectives shown for these questions.
- **Fix effort:** Two-line regex change. Change pattern to `^(.+?)-(?:Part\d+(?:-.*)?|D\d+(?:-.*)?)$` to strip all known suffixes recursively, or call regex iteratively.

### Finding 3: CI SDK Version Mismatch (8 vs 10)

**Matrix verdict: CONFIRMED**

- **File:** `.github/workflows/build.yml`, line 26-29
  - Uses `dotnet-version: '8.0.x'`
  - Core.csproj targets `net10.0`
  - Legacy WinForms targets `net8.0-windows` (correct for that project)
  - Desktop.csproj targets `net10.0`
- **Evidence:** Build would fail on `dotnet build` of Core/Desktop because .NET 8 SDK cannot build `net10.0` projects
- **Secondary issue:** Artifact paths on lines 88 and 97 reference `net8.0/` but Core/Desktop build to `net10.0/`
- **Secondary issue:** Line 59: `|| true` on test step masks test failures
- **Fix effort:** Update workflow file. Risk: low.

### Finding 4: QuestionParser Unused _fileProvider Field

**Matrix verdict: CONFIRMED**

- **File:** `RadicalTrainingPlatform.Core/Services/QuestionParser.cs`, lines 15, 17, 20
  - `private readonly IFileProvider _fileProvider;` — declared, assigned in constructor, NEVER read or used anywhere in the class
  - Actual file reading is done entirely through `_examRepository.ReadExamFile(path)` which delegates to `IFileProvider`
- **Fix effort:** Delete field, delete constructor parameter, update call sites. Risk: zero.

### Finding 5: ExamSessionViewModel Mutates Question.Id

**Matrix verdict: CONFIRMED**

- **File:** `RadicalTrainingPlatform.Core/ViewModels/ExamSessionViewModel.cs`, lines 38-44
  ```csharp
  for (int i = 0; i < _sessionQuestions.Count; i++)
  {
      var q = _sessionQuestions[i];
      q.Id = i + 1;   // MUTATES shared model
      _sessionQuestions[i] = q;
  }
  ```
- **Impact:** If the original `List<Question>` is ever shared (e.g., cached by QuestionParser, rendered by multiple views, or persisted), the IDs are permanently corrupted for other consumers. When persistence is added (Phase 2), cross-session IDs become unreliable keys.
- **Fix effort:** Replace with `_displayIndex` dictionary. Risk: low (requires updating ExamPdfExporter which uses `q.Id`).

### Finding 6: BlueprintService and ReferenceService are Static

**Matrix verdict: CONFIRMED**

- **Files:**
  - `RadicalTrainingPlatform.Core/Services/BlueprintService.cs` — line 9: `public static class BlueprintService`
  - `RadicalTrainingPlatform.Core/Services/ReferenceService.cs` — line 6: `static class ReferenceService`
- **Impact:** No interfaces, no DI registration, no testable seam. Adding a new exam vendor requires editing source code of both services and recompiling. ReferenceService URLs are in source code, not config.
- **Current line count:** BlueprintService ~632 lines (all hardcoded). ReferenceService ~419 lines (all hardcoded).
- **Required fix:** Extract IBlueprintService and IReferenceService. Migrate data to JSON resource files.

### Finding 7: MainWindow.axaml.cs — OnExportClicked is Empty Stub

**Matrix verdict: CONFIRMED**

- **File:** `RadicalTrainingPlatform.Desktop/MainWindow.axaml.cs`, line 235-238
  ```csharp
  private void OnExportClicked(object? sender, RoutedEventArgs e)
  {
      // TODO: Export dialog
  }
  ```
- **Impact:** Export button is completely inert. ExamPdfExporter.GenerateExamPdf exists in Core and works cross-platform. WinForms project already has full PDF export via ExportService (PdfSharp). This is a pure wiring gap.
- **Fix effort:** Wire to ExamPdfExporter + platform save dialog. Risk: low.

### Finding 8: BlueprintView Never Loads Data

**Matrix verdict: CONFIRMED**

- **File:** `RadicalTrainingPlatform.Desktop/Views/BlueprintView.axaml.cs` — line 10-17
  - Constructor does nothing. `LoadBlueprint` is never called.
- **File:** `RadicalTrainingPlatform.Desktop/MainWindow.axaml.cs`, line 211-216
  ```csharp
  private void OnBlueprintClicked(object? sender, RoutedEventArgs e)
  {
      ReleaseCurrentView();
      _blueprintView ??= new BlueprintView();
      MainContent.Content = _blueprintView;
  }
  ```
  - No call to `LoadBlueprint()` on show. No current exam code passed.
- **File:** `RadicalTrainingPlatform.Desktop/Controls/BlueprintCanvas.cs`, line 61-88
  - `LoadBlueprint()` exists and works. Not called.
- **Impact:** Blueprint coverage visualization is completely non-functional in Avalonia.
- **Fix effort:** Pass current exam code from MainWindow, call LoadBlueprint with coverage data from BlueprintService. Risk: low.

### Finding 9: StatsView is Unreachable in Avalonia

**Matrix verdict: CONFIRMED with nuance**

- **File:** `RadicalTrainingPlatform.Desktop/Views/StatsView.axaml` — all hardcoded values (85%, 102/120, domains with percentages)
- **Evidence:** No sidebar "Stats" button exists. No navigation route to StatsView. The view file is present but never instantiated.
- **Impact:** Study statistics are not available in Avalonia. WinForms shows real stats.
- **Fix effort:** Add sidebar button, wire to session data. Risk: low.

### Finding 10: No Directory.Build.props, No Global.json

**Matrix verdік: CONFIRMED** (Matrix did not explicitly call this out, but it is a gap)
- No `/Directory.Build.props` — version is not centralized
- No `/global.json` — .NET SDK version is not pinned for reproducible builds
- Impact: Version drift across CI, dev machines, and packaging scripts. Build reproducibility compromised.

### Finding 11: IFileProvider Breach — Directory.GetParent Used Directly in Core

**Matrix verdict: CONFIRMED with nuance**

- **File:** `RadicalTrainingPlatform.Core/Infrastructure/IExamRepository.cs`, line 73
  ```csharp
  var parent = Directory.GetParent(current)?.FullName;
  ```
- **Impact:** IFileProvider abstraction is breached. Directory.GetParent is a platform-specific call (works on .NET but ties Core to System.IO.Directory specifically, bypassing the abstraction layer).
- **Fix:** Add `GetParentDirectory(string path)` to IFileProvider interface. Implement in DefaultFileProvider.

### Finding 12: Bare Catch Blocks in Core and Desktop

**Matrix verdict: CONFIRMED**

- **File:** `IExamRepository.cs`, line 66: `try { _searchPaths.Add(...) } catch { }`
- **File:** `IExamRepository.cs`, line 96: `catch { /* ignore inaccessible dirs */ continue; }`
- **Impact:** No diagnostic visibility when file discovery fails. Users never know questions are missing.
- **Fix:** Add ILogger parameter, log at Warning level.

### Finding 13: WinForms MainForm Calls Non-Existent Static Method on QuestionParser

**Matrix verdict: CONFIRMED — CRITICAL COMPATIBILITY BUG**

- **File:** `RadicalTrainingPlatform.Legacy.WinForms/MainForm.cs`, line 479
  ```csharp
  var loaded = QuestionParser.LoadAllExams(dir);
  ```
- **File:** `RadicalTrainingPlatform.Core/Services/QuestionParser.cs`, lines 258-274
  - `LoadAllExams()` is now an INSTANCE method requiring `IExamRepository` and `IFileProvider`.
  - WinForms code calls it as a static method with a `string dir` parameter.
  - **THIS DOES NOT COMPILE.** The WinForms project references Core.csproj but the API has changed.
- **Impact:** WinForms build likely fails (or uses an older, cached DLL). The Core library has been refactored without backward compatibility consideration for the legacy client.
- **Fix:** Either (a) add a static convenience overload, or (b) update WinForms to use DI/container, or (c) accept WinForms breakage and document it.

### Finding 14: QuestionParser.ParseFile Returns All Questions But What "LooksLikeExamFile" Skips

**Matrix verdict: NOT IN MATRIX — NEW FINDING**

- **File:** `IExamRepository.cs`, lines 116-127
  - `LooksLikeExamFile` skips README, CHEATSHEET, LAB, ROADMAP, CHANGELOG, CONTRIBUTING, LICENSE, CODE_OF_CONDUCT, MASTER-PROJECT-PLAN by name prefix/containment.
- **Impact:** Any content file named "NCA-ROADMAP-Part1.md" would be skipped. The list does not include "studyguide" though studyguides/ contains markdown.
- Not a current bug (studyguides are not in the exam search path) but brittle: adding new file types requires recompilation.

### Finding 15: Model Class Properties with set; (Mutable Models Where Immutability is Appropriate)

**Matrix verdict: NOT IN MATRIX — NEW FINDING**

- **File:** `RadicalTrainingPlatform.Core/Models/Question.cs`
  - All properties have public `set;`. Id, ExamCode, Stem, CorrectAnswers are all mutable.
- **File:** `RadicalTrainingPlatform.Core/Models/AnswerOption.cs`
  - Both properties have public `set;`
- **File:** `RadicalTrainingPlatform.Core/Models/BlueprintObjective.cs`
  - Lists (Knowledge, References, Keywords) have public `set;`
- **Impact:** Models are susceptible to accidental mutation. The `ExamSessionViewModel` mutates Question.Id directly (Finding 5). No init-only or record semantics.
- **Fix:** Convert to `init` or `required init` properties, or use `record` types for read-only models.

### Finding 16: No Nullable Reference Type Annotations in Some Places

**Matrix verdict: NOT IN MATRIX — MINOR FINDING**

- **File:** `Question.cs`, line 5: `public int Id { get; set; }` — int, not int?
- The SDK enables `<Nullable>enable</Nullable>` but some properties use mutable reference types with nullable annotations absent. E.g., `Stem` is `string` not `string?` which is correct (never null after parse). Overall NRT compliance is decent.

## 1.2 Maturity Score Accuracy

| Domain | Matrix Rating | Validated Rating | Reasoning |
|---|---|---|---|
| Architecture | 3/10 | **3/10** | Static classes, no DI, no logging, no persistence. Matrix is accurate. |
| UI/UX (Avalonia) | 3/10 | **3/10** | Feature shell — selector works, question view works, everything else is stubs. Matrix accurate. |
| Content | 4/10 | **3/10** | 1,600 questions exist. 80 (5%) silently dropped. 3 wrong keys confirmed. DeriveExamCode misclassifies. Matrix understates DeriveExamCode bug. |
| Infrastructure | 2/10 | **1/10** | CI uses wrong SDK. 0 tests. No release automation. No Directory.Build.props. No global.json. Flatpak manifest has wrong git URL. WinForms references non-existent API. Matrix missed some items. |
| Cross-Platform | 4/10 | **4/10** | Avalonia runs on 3 OSes. CefGlue blocks mobile. PWA works standalone. Matrix accurate. |
| Security | 2/10 | **2/10** | Optional trufflehog only. No Dependabot, no SAST, no Sentry. Matrix accurate. |
| Features | 4/10 | **5/10** (WinForms) / **3/10** (Avalonia) | WinForms is feature-complete. Avalonia is a shell. Matrix averages at 4/10 — fair. |

**Overall validated maturity: 2.5/10** (Matrix said 3/10 — slightly optimistic)

---

# PART 2: Target Architecture

## 2.1 Layer Diagram (ASCII)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              UI LAYER                                    │
│  ┌──────────────────┐  ┌─────────────┐  ┌─────────────────────────────┐ │
│  │ Avalonia Desktop │  │  WinForms   │  │  PWA (RadicalTrainingPlatform│ │
│  │   (net10.0)      │  │ (net8.0-win)│  │  .Web — static files)       │ │
│  │                  │  │             │  │                             │ │
│  │ Views/           │  │ Controls/   │  │  index.html + SW + IndexedDB│ │
│  │ Controls/        │  │ MainForm.cs │  │                             │ │
│  │ LabSimulator/    │  │             │  │                             │ │
│  └────────┬─────────┘  └──────┬──────┘  └─────────────────────────────┘ │
│           │                   │                                         │
│           └───────────┬───────┘                                         │
│                       │  (references via DI)                            │
├───────────────────────┼─────────────────────────────────────────────────┤
│  APPLICATION LAYER    │  ViewModels + App Services                       │
│                       │                                                   │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  MainWindowViewModel (ReactiveUI)                               │  │
│  │  ExamSessionViewModel                                           │  │
│  │  NavigationService (ReactiveUI Routing)                         │  │
│  │  ILabSimulatorHost / CefLabSimulatorHost / WebViewLabSimulatorHost│ │
│  └─────────────────────────────────────────────────────────────────┘  │
│           │                                                             │
│           │ (uses)                                                      │
├───────────┼─────────────────────────────────────────────────────────────┤
│  DOMAIN   │  Models, Domain Services                                     │
│  LAYER    │                                                               │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  Question, AnswerOption, ExamBlueprint,                         │  │
│  │  BlueprintSection, BlueprintObjective, ExamCatalogItem          │  │
│  │  IExamRepository, IFileProvider, IBlueprintService,             │  │
│  │  IReferenceService, IQuestionParser, IExamSessionService        │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│           │                                                             │
│           │ (uses)                                                      │
├───────────┼─────────────────────────────────────────────────────────────┤
│  INFRASTRUCTURE LAYER                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐ │
│  │ Persistence      │  │ Content Delivery │  │ Cross-Platform I/O   │ │
│  │ ──────────────── │  │ ──────────────── │  │ ──────────────────── │ │
│  │ SQLite (+ EF     │  │ MarkdownExamRepo │  │ IFileProvider        │ │
│  │ Core)            │  │ (finds .md files)│  │ DefaultFileProvider  │ │
│  │ IProgressRepo    │  │ (reads .md)      │  │                      │ │
│  │ ISessionStore    │  │ errata.json      │  │                      │ │
│  └──────────────────┘  └──────────────────┘  └──────────────────────┘ │
│  ┌──────────────────┐  ┌──────────────────┐                           │
│  │ PDF Export       │  │ Logging          │  (horizontal concerns)    │
│  │ ──────────────── │  │ ──────────────── │                           │
│  │ ExamPdfExporter  │  │ ILogger<T>       │                           │
│  │ (QuestPDF)       │  │ Serilog (opt)    │                           │
│  └──────────────────┘  └──────────────────┘                           │
└─────────────────────────────────────────────────────────────────────────┘
```

## 2.2 Dependency Flow

```
UI Layer ───────references───────> Application Layer
     │                                  │
     │ (DI resolution)                  │ (uses interfaces)
     ▼                                  ▼
Infrastructure Layer <────────────── Domain Layer
    (implements)                          (defines)
```

**Rule:** Dependencies point INWARD only. Domain never depends on Infrastructure or UI.

**Current violation:** `QuestionParser.ParseFile` uses `Path.GetFileName()` (from System.IO) directly instead of `IFileProvider`. This is acceptable as `Path` is a utility library (not platform-specific), but `Directory.GetParent` in `IExamRepository` breaches the abstraction.

## 2.3 Key Interfaces and Their Implementations

| Interface | Implementation | Project | Notes |
|---|---|---|---|
| `IExamRepository` | `MarkdownExamRepository` | Core | Finds and reads .md exam files |
| `IFileProvider` | `DefaultFileProvider` | Core | Abstracts System.IO for testability |
| `IQuestionParser` | `QuestionParser` | Core | Parses markdown to Question objects |
| `IBlueprintService` | `JsonBlueprintService` | Core | Loads blueprint from embedded JSON |
| `IReferenceService` | `JsonReferenceService` | Core | Loads references from embedded JSON |
| `IExamSessionService` | `ExamSessionService` | Core | Creates session VMs, manages lifecycle |
| `IProgressRepository` | `SqliteProgressRepository` | Core | Session persistence via SQLite |
| `ISaveFileDialog` | `AvaloniaSaveDialog` | Desktop | Platform save dialog abstraction |
| `ISaveFileDialog` | `WinFormsSaveDialog` | WinForms | Platform save dialog |
| `ILabSimulatorHost` | `CefLabSimulatorHost` | Desktop | CefGlue bridge for lab sim |
| `ILabSimulatorHost` | `WebViewLabSimulatorHost` | Mobile/PWA | Native WebView bridge |

## 2.4 Data Flow: Take Exam → Review Results

```
1. User launches app
   ├─ MainWindowViewModel created via DI
   ├─ IExamRepository.FindExamFiles() discovers .md files
   ├─ IQuestionParser.BuildCatalog() builds ExamCatalogItem list
   └─ ExamSelectorView shown with catalog items

2. User selects an exam
   └─ MainWindowViewModel.StartSession(examCode, questions)
       ├─ IExamSessionService.CreateSession(examCode, questions, limit)
       │   └─ Returns ExamSessionViewModel (with display indices, NOT mutated IDs)
       └─ QuestionView.DataContext = session VM

3. User answers questions
   └─ ExamSessionViewModel.SelectAnswer("B")
       ├─ Updates _selectedAnswers HashSet
       └─ Fires PropertyChanged -> UI updates OptionCard states

4. User submits
   └─ ExamSessionViewModel.Submit()
       ├─ Checks answers against CorrectAnswers
       ├─ Updates CorrectCount/WrongCount
       ├─ Fires PropertyChanged -> UI shows result indicator + explanation
       └─ Stores result in IProgressRepository (step deferred to Phase 2)

5. User navigates
   └─ ExamSessionViewModel.Next() / Previous()
       ├─ Clears selected answers, resets submitted state
       └─ Fires PropertyChanged -> UI refreshes

6. Review mistakes
   └─ MainWindowViewModel calls GetWrongQuestions()
       ├─ ExamSessionViewModel.GetWrongQuestions() returns wrong-answer subset
       └─ New ExamSessionViewModel created for review
```

## 2.5 Technology Stack Decisions

### DI Container: Microsoft.Extensions.DependencyInjection (MSDI)

**Rationale:**
- Native to .NET ecosystem, zero learning curve for C# developers
- Already used by Avalonia (via ReactiveUI + Splat integration possible, or direct)
- Supports keyed services, scoped lifetimes, factory registrations
- Compatible with both Desktop and Console test projects
- No external dependency (part of `Microsoft.Extensions.*` which is on nuget.org)

**Registration profile:**
```csharp
var services = new ServiceCollection()
    .AddSingleton<IFileProvider, DefaultFileProvider>()
    .AddSingleton<IExamRepository>(sp => new MarkdownExamRepository(sp.GetRequiredService<IFileProvider>()))
    .AddSingleton<IQuestionParser, QuestionParser>()
    .AddScoped<ExamSessionViewModel>()
    // Phase 2: .AddSingleton<IProgressRepository, SqliteProgressRepository>()
    ;
```

### Persistence: SQLite with EF Core 10 (when available) or raw SQLitePCLRaw

**Rationale:**
- SQLite is file-based, zero configuration, cross-platform
- .NET 10 support: Check `Microsoft.EntityFrameworkCore.Sqlite` 10.0.0-preview compatibility
- If EF Core 10 is not ready, use raw `Microsoft.Data.Sqlite` (a wrapper around SQLitePCLRaw)
- Fallback: `System.Data.SQLite.Core` is Windows-only, so avoid.

**Schema (Phase 2):**
```sql
CREATE TABLE SessionResults (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    ExamCode TEXT NOT NULL,
    StartedAt TEXT NOT NULL,
    CompletedAt TEXT,
    TotalQuestions INTEGER NOT NULL,
    CorrectCount INTEGER NOT NULL,
    WrongCount INTEGER NOT NULL,
    WasTimed INTEGER NOT NULL DEFAULT 0,
    TimeLimitSeconds INTEGER
);

CREATE TABLE QuestionResults (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    SessionId INTEGER NOT NULL REFERENCES SessionResults(Id),
    QuestionId INTEGER NOT NULL,
    ExamCode TEXT NOT NULL,
    SourceFile TEXT NOT NULL,
    WasCorrect INTEGER NOT NULL,
    SelectedAnswers TEXT NOT NULL,  -- JSON array ["A","C"]
    TimeToAnswerMs INTEGER,
    AnsweredAt TEXT NOT NULL
);
```

### Logging: Microsoft.Extensions.Logging + Console provider

**Rationale:**
- Standard .NET logging abstraction
- Wire into all Core services (IExamRepository, IQuestionParser, ExamPdfExporter)
- Optional: Serilog with file sink for production (Desktop hosts configure)
- In test projects: XunitLoggerProvider from `Microsoft.Extensions.Logging.Testing`

**Configuration:**
```csharp
services.AddLogging(builder =>
    builder.AddConsole()
           .SetMinimumLevel(LogLevel.Information)
           .AddFilter("RadicalTrainingPlatform", LogLevel.Debug));
```

### Test Framework: xUnit (v3) with Shouldly + NSubstitute

**Rationale:**
- xUnit is the de facto standard for .NET testing
- xUnit v3 supports native AoT compilation (relevant for .NET 10)
- Shouldly for readable assertions (`.ShouldBe()`, `.ShouldContain()`)
- NSubstitute for mocking (lightweight, no proxy restrictions on .NET 10 previews)
- Microsoft.NET.Test.Sdk for `dotnet test` integration
- **Coverage target:** 70% Core library line coverage (measured with Coverlet)

---

# PART 3: Package & Namespace Structure

## 3.1 Target Namespace Hierarchy (Core)

```
RadicalTrainingPlatform.Core
├── Abstractions
│   ├── IExamRepository.cs
│   ├── IFileProvider.cs
│   ├── IBlueprintService.cs
│   ├── IReferenceService.cs
│   ├── IQuestionParser.cs
│   └── IProgressRepository.cs (Phase 2)
├── Models
│   ├── Question.cs
│   ├── AnswerOption.cs
│   ├── ExamBlueprint.cs
│   ├── BlueprintSection.cs
│   ├── BlueprintObjective.cs
│   └── ExamCatalogItem.cs
├── Services
│   ├── QuestionParser.cs
│   ├── BlueprintService.cs
│   ├── ReferenceService.cs
│   └── ExamSessionService.cs (new)
├── ViewModels
│   └── ExamSessionViewModel.cs
├── Infrastructure
│   ├── DefaultFileProvider.cs
│   ├── MarkdownExamRepository.cs
│   └── SqliteProgressRepository.cs (Phase 2)
├── PdfExport
│   └── ExamPdfExporter.cs
├── Data
│   └── Blueprints/          (embedded JSON resources)
│       ├── ncp-ai.json
│       ├── ncp-us.json
│       ├── ncp-ci.json
│       ├── ncm-mci.json
│       └── nca-75.json
└── Validation
    ├── ParseResult.cs (new)
    └── ContentValidator.cs (Phase 1)
```

## 3.2 Project Structure & Dependencies

```
Solution: RadicalTrainingPlatform.sln

RadicalTrainingPlatform.Core (net10.0)
├── References: QuestPDF 2025.1.0
├── References: Microsoft.Extensions.Logging 10.0.x (for DI + logging)
├── References: Microsoft.Extensions.DependencyInjection 10.0.x (Phase 1)
├── References: Microsoft.EntityFrameworkCore.Sqlite 10.0.x (Phase 2, Optional)
└── No UI references, no platform-specific references
    ^
    |  (project reference)
    v
RadicalTrainingPlatform.Core.Tests (net10.0)
├── References: xUnit, Shouldly, NSubstitute, Coverlet
├── References: Core project
├── References: Microsoft.Extensions.Logging.Testing
└── Output: Test artifacts for CI
    ^
    |  (project reference)
    v
RadicalTrainingPlatform.Desktop (net10.0)
├── References: Avalonia 11.2.x, Avalonia.Desktop, Avalonia.ReactiveUI (Phase 2)
├── References: Avalonia.Themes.Simple, Avalonia.Fonts.Inter
├── References: CefGlue.Avalonia 120.x (Phase 1)
├── References: Sentry.AspNetCore or Sentry (Phase 2)
└── References: Core project
    ^
    |  (project reference)
    v
RadicalTrainingPlatform.Legacy.WinForms (net8.0-windows)
├── References: Microsoft.Web.WebView2 1.0.x
├── References: PdfSharp 6.1.1
├── References: Core project
└── Separate build, no shared DI container (static API usage)
```

**Dependency flow enforcement:**
- Core: no project references
- Desktop: references Core only
- WinForms: references Core only
- Tests: references Core only

## 3.3 Naming Conventions

| Category | Convention | Example |
|---|---|---|
| Interfaces | PascalCase with `I` prefix | `IExamRepository` |
| Services | PascalCase, semantic name | `BlueprintService`, `ExamSessionService` |
| Models | PascalCase, immutable where possible | `Question`, `ExamCatalogItem` |
| ViewModels | PascalCase with `ViewModel` suffix | `ExamSessionViewModel` |
| Views (Avalonia) | PascalCase | `QuestionView.axaml`, `MainWindow.axaml` |
| Views (WinForms) | PascalCase | `MainForm.cs` |
| Async methods | Async suffix | `LoadAllAsync()`, `ParseFileAsync()` |
| Private fields | Underscore prefix, camelCase | `_examRepository`, `_selectedAnswers` |
| Constants | PascalCase | `Net10Target` |
| Resource files | kebab-case | `ncp-ai.json`, `errata.json` |

---

# PART 4: Detailed Design for Each Quick Win

## Quick Win 1: Fix AnswerRegex Parser Bug

**File:** `RadicalTrainingPlatform.Core/Services/QuestionParser.cs`
**Line:** 32

### Before
```csharp
[GeneratedRegex(@"^\*\*Answer:\s*([A-F][,\s]*(?:[A-F][,\s]*)*)\*\*", RegexOptions.Compiled)]
private static partial Regex AnswerRegex();
```

### After
```csharp
[GeneratedRegex(@"^\*\*(?:Correct )?Answer:\s*([A-F][,\s]*(?:[A-F][,\s]*)*)\*\*", RegexOptions.Compiled)]
private static partial Regex AnswerRegex();
```

**Test to write:**
```csharp
[Fact]
public void ParseFile_AcceptsCorrectAnswerVariant()
{
    var content = "### Q1\nWhat is 2+2?\n- A) 3\n- B) 4\n**Correct Answer: B**\n---\n";
    var repo = Substitute.For<IExamRepository>();
    repo.ReadExamFile(Arg.Any<string>()).Returns(content);
    var parser = new QuestionParser(repo, Substitute.For<IFileProvider>());

    var questions = parser.ParseFile("test.md");

    questions.ShouldHaveSingleItem();
    questions[0].CorrectAnswers.ShouldContain("B");
}
```

**Validation:** Run parser against NCP-CI-Part3.md, verify 80 questions returned (not 0).

---

## Quick Win 2: Fix DeriveExamCode for GapFill and D-Suffix Files

**File:** `RadicalTrainingPlatform.Core/Services/QuestionParser.cs`
**Lines:** 39-55

### Before
```csharp
public static string DeriveExamCode(string fileName)
{
    var name = Path.GetFileNameWithoutExtension(fileName);

    // Strip trailing -PartN or -DN suffixes
    var partMatch = Regex.Match(name, @"^(.+?)-?(?:Part\d+|D\d+)$", RegexOptions.IgnoreCase);
    if (partMatch.Success)
        return partMatch.Groups[1].Value.TrimEnd('-');

    // Fallback: first two segments if hyphenated
    var parts = name.Split('-');
    if (parts.Length >= 2 && int.TryParse(parts[1], out _))
        return parts[0];
    if (parts.Length >= 2)
        return $"{parts[0]}-{parts[1]}";
    return name;
}
```

### After
```csharp
public static string DeriveExamCode(string fileName)
{
    var name = Path.GetFileNameWithoutExtension(fileName);

    // Iteratively strip suffixes: -PartN, -DN, -GapFill, -PartX-Anything
    // This handles NCP-US-Part2-D3 → NCP-US and NCA-75-Part3-GapFill → NCA-75
    var suffixPattern = @"^(.+?)-(?:Part\d+(?:-.*)?|D\d+(?:-.*)?|GapFill(?:-.*)?)$";
    string current = name;
    while (true)
    {
        var match = Regex.Match(current, suffixPattern, RegexOptions.IgnoreCase);
        if (!match.Success) break;
        current = match.Groups[1].Value;
    }

    // Fallback: first two segments if hyphenated and second is numeric
    var parts = current.Split('-');
    if (parts.Length >= 2 && int.TryParse(parts[1], out _))
        return parts[0];
    if (parts.Length >= 2)
        return $"{parts[0]}-{parts[1]}";
    return current;
}
```

**Tests to write:**
```csharp
[Theory]
[InlineData("NCP-US-Part2-D3.md", "NCP-US")]
[InlineData("NCP-US-Part2-D4.md", "NCP-US")]
[InlineData("NCA-75-Part3-GapFill.md", "NCA-75")]
[InlineData("NCP-CI-Part5-GapFill.md", "NCP-CI")]
[InlineData("NCM-MCI-Part1.md", "NCM-MCI")]
[InlineData("AWS-SAA-Part1.md", "AWS-SAA")]
[InlineData("CKA.md", "CKA")]
public void DeriveExamCode_ReturnsCorrectCode(string fileName, string expected)
{
    QuestionParser.DeriveExamCode(fileName).ShouldBe(expected);
}
```

---

## Quick Win 3: Fix CI SDK Version Mismatch

**File:** `.github/workflows/build.yml`

### Changes Required

**Line 26, change `8.0.x` to `10.0.x`:**
```yaml
      - name: Setup .NET 10
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '10.0.x'
```

**Line 88, change artifact path:**
```yaml
          path: RadicalTrainingPlatform.Core/bin/Release/net10.0/
```

**Line 97, change WinForms artifact path (it stays net8.0-windows):**
```yaml
          # CORRECT — WinForms still targets net8.0-windows
          path: RadicalTrainingPlatform.Legacy.WinForms/bin/Release/net8.0-windows/
```

**Line 59, REMOVE `|| true`:**
```yaml
      # BEFORE (WRONG — masks failures):
      - name: Run tests
        run: |
          if ls *.sln 1> /dev/null 2>&1; then
            dotnet test --configuration Release --no-build || true
          fi

      # AFTER (CORRECT — fails on test failure):
      - name: Run tests
        run: |
          if ls *.sln 1> /dev/null 2>&1; then
            dotnet test --configuration Release --no-build
          fi
```

**Line 73, change DLL check path:**
```yaml
          NET10_DLL="RadicalTrainingPlatform.Core/bin/Release/net10.0/RadicalTrainingPlatform.Core.dll"
          if [ -f "$NET10_DLL" ]; then
```

**Line 74, change strings check:**
```yaml
            if strings "$NET10_DLL" | grep -qi "Windows.Forms"; then
```

---

## Quick Win 4: Correct 3 Wrong Answer Keys

**Per `docs/DOC-REVIEW-REPORT.md`, the following files need content edits:**

### Documented corrections:

| # | File | Question | Current Key | Correct Key |
|---|---|---|---|---|
| 1 | NCA-75-Part1.md | Q3 | Firmware → Hypervisor → AOS | **AOS → Hypervisor → Firmware** |
| 2 | NCA-75-Part3-GapFill.md | Q3 | SSH disabled by default | **SSH enabled by default** |
| 3 | NCP-US-PartX.md (PC max VMs) | varies | 10,000 | **25,000** (scale-out) |

**Validation:** Load app, navigate to corrected questions, verify correct answer matches DOC-REVIEW-REPORT.

---

## Quick Win 5: Wire PDF Export Button

**File:** `RadicalTrainingPlatform.Desktop/MainWindow.axaml.cs`, lines 235-238

### After
```csharp
private async void OnExportClicked(object? sender, RoutedEventArgs e)
{
    if (_session == null) return;

    var dialogs = new AvaloniaSaveFileDialog();
    var filePath = await dialogs.ShowAsync(
        this,
        $"{_session.ExamCode}-StudyGuide.pdf",
        new[] { new FileDialogFilter { Name = "PDF", Extensions = new List<string> { "pdf" } } });

    if (string.IsNullOrEmpty(filePath)) return;

    try
    {
        var pdf = ExamPdfExporter.GenerateExamPdf(
            _session.GetWrongQuestions().Count > 0
                ? _session.GetWrongQuestions()
                : _exams[_session.ExamCode],
            $"{_session.ExamCode} Study Guide",
            _session.ExamCode);

        await File.WriteAllBytesAsync(filePath, pdf);
    }
    catch (Exception ex)
    {
        // Show error dialog (Phase 2: use ILogger)
        Debug.WriteLine($"Export failed: {ex.Message}");
    }
}
```

**New file to create:** `RadicalTrainingPlatform.Desktop/Services/AvaloniaSaveDialog.cs`
```csharp
using Avalonia.Controls;
using Avalonia.Platform.Storage;

namespace RadicalTrainingPlatform.Avalonia.Services;

public class AvaloniaSaveDialog
{
    public async Task<string?> ShowAsync(Window parent, string defaultFileName, FilePickerFileType filter)
    {
        var file = await parent.StorageProvider.SaveFilePickerAsync(new FilePickerSaveOptions
        {
            Title = "Export to PDF",
            SuggestedFileName = defaultFileName,
            FileTypeChoices = new[] { filter }
        });
        return file?.TryGetLocalPath();
    }
}
```

---

## Quick Win 6: Add Content Format Linter to CI

**New file:** `scripts/lint-content.py` (or `.sh`)

```python
#!/usr/bin/env python3
"""Validate all .md exam files for consistent answer formatting."""
import re, sys, pathlib, json

REPO_ROOT = pathlib.Path(__file__).parent.parent
EXAM_FILES = list(REPO_ROOT.glob("*.md"))
ERRORS = []

answer_rx = re.compile(r'^\*\*(?:Correct )?Answer:\s*([A-F][,\s]*(?:[A-F][,\s]*)*)\*\*$')
q_header_rx = re.compile(r'^###\s+Q(\d+)')

for f in EXAM_FILES:
    if f.name.startswith('README') or f.name.startswith('CLAUDE'):
        continue
    content = f.read_text()
    q_count = len(q_header_rx.findall(content))
    a_count = len(answer_rx.findall(content))
    if q_count > 0 and a_count != q_count:
        ERRORS.append(f"{f.name}: {q_count} questions but {a_count} answers found")
    # Check for unsupported formats
    if re.search(r'^\*\*Answer:\s*$', content, re.MULTILINE):
        ERRORS.append(f"{f.name}: empty answer line found")

if ERRORS:
    print("CONTENT LINT ERRORS:", file=sys.stderr)
    for e in ERRORS:
        print(f"  {e}", file=sys.stderr)
    sys.exit(1)

print(f"OK: {len(EXAM_FILES)} files checked, {(sum(len(q_header_rx.findall(f.read_text())) for f in EXAM_FILES))} questions validated.")
```

**CI step to add:**
```yaml
      - name: Lint exam content
        run: python3 scripts/lint-content.py
```

---

## Quick Win 7: Remove Dead _fileProvider Dependency from QuestionParser

**File:** `RadicalTrainingPlatform.Core/Services/QuestionParser.cs`

### Delete lines 15 and 20
Line 15: `private readonly IFileProvider _fileProvider;`
Line 20: `_fileProvider = fileProvider;`

### Update constructor (line 17-21)
```csharp
public QuestionParser(IExamRepository examRepository)
{
    _examRepository = examRepository;
}
```

### Update call sites in MainWindow.axaml.cs (line 48)
```csharp
var parser = new QuestionParser(repo);  // was: new QuestionParser(repo, provider)
```

---

## Quick Win 8: Stop Mutating Question.Id in ExamSessionViewModel

**File:** `RadicalTrainingPlatform.Core/ViewModels/ExamSessionViewModel.cs`

### Before (lines 38-44)
```csharp
// Reset IDs to sequential for the session
for (int i = 0; i < _sessionQuestions.Count; i++)
{
    var q = _sessionQuestions[i];
    q.Id = i + 1;
    _sessionQuestions[i] = q;
}
```

### After
1. Add new field: `private readonly Dictionary<Question, int> _displayIndex = new();`
2. Replace the loop with:
```csharp
// Build display index mapping without mutating shared models
for (int i = 0; i < _sessionQuestions.Count; i++)
    _displayIndex[_sessionQuestions[i]] = i + 1;
```
3. Add helper method:
```csharp
public int GetDisplayNumber(Question q) => _displayIndex.TryGetValue(q, out var idx) ? idx : q.Id;
```
4. Update `CurrentNumber` property (line 52):
```csharp
public int CurrentNumber => GetDisplayNumber(CurrentQuestion);
```
5. Update ExamPdfExporter to use display number (or the original Question.Id — since PDF is for full exam, original ID is fine. The PDF needs its own numbering anyway.)

---

## Quick Win 9: Fix Flatpak Manifest

**File:** `packaging/linux/app.radicaltrainingplatform.RadicalTrainingPlatform.yml`

### Line 61: Change git URL
```yaml
# BEFORE:
        url: https://github.com/TheArchitectit/certforge.git
# AFTER:
        url: https://github.com/TheArchitectit/radicaltrainingplatform.git
```

### Line 64: Replace placeholder commit
```yaml
# BEFORE:
        commit: REPLACE_WITH_COMMIT_SHA
# AFTER:
        commit: <LATEST_COMMIT_SHA_HERE>  # Update via CI automation
```

### Line 6: Update SDK extension
```yaml
# BEFORE:
  - org.freedesktop.Sdk.Extension.dotnet8
# AFTER:
  - org.freedesktop.Sdk.Extension.dotnet10  # Or appropriate .NET 10 extension
```

### AppImage script fix (packaging/linux/build-appimage.sh)
**Issue:** Line 21 (`dotnet publish`) runs before `mkdir -p` on line 31, but the publish outputs to `${APP_DIR}/usr/bin`. This works because `dotnet publish -o` creates the directory. **No actual fix needed** — the directory creation on line 31-35 is defensive, not reactive.

---

## Quick Win 10: Add SemVer to Directory.Build.props

**New file:** `Directory.Build.props`
```xml
<Project>
  <PropertyGroup>
    <Version>0.1.0</Version>
    <AssemblyVersion>0.1.0.0</AssemblyVersion>
    <FileVersion>0.1.0.0</FileVersion>
    <Company>RadicalTrainingPlatform</Company>
    <Product>RadicalTrainingPlatform — Certification Study Engine</Product>
    <Copyright>Copyright (c) 2026</Copyright>
  </PropertyGroup>
</Project>
```

**Update packaging scripts** to read version from assembly:
```bash
# In build-appimage.sh, after dotnet publish:
APP_VERSION=$(strings "${APP_DIR}/usr/bin/RadicalTrainingPlatform.dll" | grep -E '^[0-9]+\.[0-9]+\.[0-9]+$' | head -1)
# Or use: dotnet "${APP_DIR}/usr/bin/RadicalTrainingPlatform.dll" --version (if CLI supports it)
```

**Update Flatpak .metainfo.xml** to use `<release version="@VERSION@">` and replace during CI.

---

# PART 5: Detailed Design for Phase 1 Deliverables

## Deliverable 1: Fix Parser Bugs (AnswerRegex + DeriveExamCode)

**Status:** Quick Wins 1 and 2 cover this. No new files needed.

**Migration path:** Already a no-breaking-change fix.
**Test strategy:** xUnit tests as shown in Quick Win sections. Verify file counts match expected.
**Acceptance criteria:**
- NCP-CI-Part3.md returns exactly 80 questions
- DeriveExamCode("NCP-US-Part2-D3.md") returns "NCP-US"
- DeriveExamCode("NCA-75-Part3-GapFill.md") returns "NCA-75"

---

## Deliverable 2: Correct 3 Wrong Answer Keys + Errata.json

**New file to create:** `errata.json` (at repo root)
```json
{
  "errata": [
    {
      "id": "NCA-75-Part1-Q3",
      "file": "NCA-75-Part1.md",
      "questionId": 3,
      "correctionType": "answerKey",
      "correctAnswer": ["A", "B", "C"],
      "rationale": "DOC-REVIEW-REPORT.md: upgrade order is AOS → Hypervisor → Firmware",
      "dateAdded": "2026-06-12"
    },
    {
      "id": "NCA-75-Part3-GapFill-Q3",
      "file": "NCA-75-Part3-GapFill.md",
      "questionId": 3,
      "correctionType": "answerKey",
      "correctAnswer": ["A"],
      "rationale": "DOC-REVIEW-REPORT.md: SSH enabled by default on fresh AOS 7.5 installs",
      "dateAdded": "2026-06-12"
    },
    {
      "id": "PC-MaxVMs",
      "file": "NCP-*",
      "questionId": null,
      "correctionType": "answerKey",
      "correctAnswer": ["A"],
      "rationale": "DOC-REVIEW-REPORT.md: Prism Central scale-out 3-VM deployment supports 25,000 VMs",
      "dateAdded": "2026-06-12"
    }
  ]
}
```

**File to modify:** `RadicalTrainingPlatform.Core/Services/QuestionParser.cs`

**Add errata application:**
```csharp
private static readonly Dictionary<string, ErrataEntry> _errata = LoadErrata();

private static Dictionary<string, ErrataEntry> LoadErrata()
{
    var result = new Dictionary<string, ErrataEntry>();
    try
    {
        var path = Path.Combine(AppContext.BaseDirectory, "errata.json");
        if (!File.Exists(path))
            path = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "errata.json");
        if (File.Exists(path))
        {
            var json = File.ReadAllText(path);
            var doc = JsonDocument.Parse(json);
            foreach (var item in doc.RootElement.GetProperty("errata").EnumerateArray())
            {
                var id = item.GetProperty("id").GetString() ?? "";
                result[id] = new ErrataEntry(id, ...);
            }
        }
    }
    catch { /* errata is optional */ }
    return result;
}

// Apply errata after parsing:
if (_errata.TryGetValue($"{q.ExamCode}-{q.SourceFile}-Q{q.Id}", out var correction))
{
    q.CorrectAnswers = correction.CorrectAnswers.ToList();
}
```

**Test:** Parse NCA-75-Part1.md Q3, verify correct answer matches errata override even if .md file is unchanged.

---

## Deliverable 3: Fix CI SDK Version

**Status:** Quick Win 3 covers this.

---

## Deliverable 4: Create Core.Tests with 70%+ Coverage

**New project:** `RadicalTrainingPlatform.Core.Tests/RadicalTrainingPlatform.Core.Tests.csproj`

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <IsPackable>false</IsPackable>
    <CollectCoverage>true</CollectCoverage>
    <CoverletOutputFormat>cobertura</CoverletOutputFormat>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.15.0" />
    <PackageReference Include="xunit" Version="2.9.0" />
    <PackageReference Include="xunit.runner.visualstudio" Version="2.8.0" />
    <PackageReference Include="coverlet.collector" Version="6.0.0" />
    <PackageReference Include="Shouldly" Version="4.3.0" />
    <PackageReference Include="NSubstitute" Version="5.3.0" />
    <PackageReference Include="Microsoft.Extensions.Logging.Testing" Version="9.0.0" />
  </ItemGroup>
  <ItemGroup>
    <ProjectReference Include="../RadicalTrainingPlatform.Core/RadicalTrainingPlatform.Core.csproj" />
  </ItemGroup>
</Project>
```

**New test files to create:**

| Test Class | Target Class | Coverage Target |
|---|---|---|
| `QuestionParserTests` | `QuestionParser` | 85%+ |
| `DeriveExamCodeTests` | `QuestionParser.DeriveExamCode` | 100% |
| `ExamSessionViewModelTests` | `ExamSessionViewModel` | 80%+ |
| `BlueprintServiceTests` | `BlueprintService` | 70%+ |
| `IFileProviderTests` | `DefaultFileProvider` | 60%+ |
| `ExamPdfExporterTests` | `ExamPdfExporter` | 60%+ |
| `MarkdownExamRepositoryTests` | `MarkdownExamRepository` | 70%+ |

**Sample test skeleton:**
```csharp
namespace RadicalTrainingPlatform.Core.Tests;

public class ExamSessionViewModelTests
{
    [Fact]
    public void Constructor_LimitNotSpecified_UsesAllQuestions()
    {
        var questions = new List<Question>
        {
            new() { Id = 1, Stem = "Q1", CorrectAnswers = new() { "A" }, Options = new() { new("A","A1"), new("B","B1") } },
            new() { Id = 2, Stem = "Q2", CorrectAnswers = new() { "B" }, Options = new() { new("A","A2"), new("B","B2") } },
        };
        var vm = new ExamSessionViewModel(questions, "TEST");

        vm.TotalQuestions.ShouldBe(2);
        vm.CurrentQuestion.Stem.ShouldBe("Q1");
    }

    [Fact]
    public void Submit_CorrectAnswer_UpdatesCorrectCount()
    {
        var q = new Question { Id = 1, Stem = "Q1", CorrectAnswers = new() { "A" },
            Options = new() { new("A","A1"), new("B","B1") } };
        var vm = new ExamSessionViewModel(new List<Question> { q }, "TEST");

        vm.SelectAnswer("A");
        vm.Submit().ShouldBeTrue();
        vm.CorrectCount.ShouldBe(1);
        vm.WrongCount.ShouldBe(0);
    }

    [Fact]
    public void Submit_WrongAnswer_UpdatesWrongCount()
    {
        var q = new Question { Id = 1, Stem = "Q1", CorrectAnswers = new() { "A" },
            Options = new() { new("A","A1"), new("B","B1") } };
        var vm = new ExamSessionViewModel(new List<Question> { q }, "TEST");

        vm.SelectAnswer("B");
        vm.Submit().ShouldBeFalse();
        vm.CorrectCount.ShouldBe(0);
        vm.WrongCount.ShouldBe(1);
    }

    [Fact]
    public void GetDisplayNumber_DoesNotMutateOriginalId()
    {
        var q = new Question { Id = 42, Stem = "Q1", CorrectAnswers = new() { "A" },
            Options = new() { new("A","A1") } };
        var vm = new ExamSessionViewModel(new List<Question> { q }, "TEST");

        vm.CurrentNumber.ShouldBe(1);  // display number
        q.Id.ShouldBe(42);             // original ID preserved
    }
}
```

**Acceptance criteria:**
- `dotnet test` runs all tests in <30 seconds
- Coverlet report shows >=70% line coverage for Core assembly
- CI workflow runs tests and fails build on test failure

---

## Deliverable 5: Extract IBlueprintService and IReferenceService

**New file:** `RadicalTrainingPlatform.Core/Abstractions/IBlueprintService.cs`
```csharp
namespace RadicalTrainingPlatform.Core.Abstractions;

public interface IBlueprintService
{
    ExamBlueprint? GetBlueprint(string examCode);
    Dictionary<string, int> CalculateCoverage(string examCode, List<string> questionTexts);
    List<(string ObjId, string ObjTitle)> GetObjectivesForQuestion(string examCode, string questionText);
    List<(string Section, string Description)> GetBibleSections(string examCode);
}
```

**New file:** `RadicalTrainingPlatform.Core/Abstractions/IReferenceService.cs`
```csharp
namespace RadicalTrainingPlatform.Core.Abstractions;

public interface IReferenceService
{
    string GetReferenceForQuestion(Question q);
    List<(string Title, string Url)> GetKBLinksForQuestion(Question q);
    List<(string Title, string Url)> GetGeneralResources();
}
```

**Migration path (order matters):**
1. Create interfaces
2. Rename existing classes to `HardcodedBlueprintService` and `HardcodedReferenceService`
3. Make them implement the interfaces
4. Add `services.AddSingleton<IBlueprintService, HardcodedBlueprintService>()` in DI
5. Update all call sites to inject `IBlueprintService` instead of accessing static class
6. Keep static methods marked `[Obsolete]` for WinForms compatibility
7. Migrate data to JSON in Phase 2

---

## Deliverable 6: Add Microsoft.Extensions.Logging to Core

**Files to modify:** `IExamRepository.cs`, `QuestionParser.cs`, `ExamPdfExporter.cs`

### IExamRepository.cs
```csharp
public class MarkdownExamRepository : IExamRepository
{
    private readonly ILogger<MarkdownExamRepository>? _logger;

    public MarkdownExamRepository(IFileProvider files, ILogger<MarkdownExamRepository>? logger = null, string appName = "RadicalTrainingPlatform")
    {
        _files = files;
        _logger = logger;
        _appName = appName;
    }

    // In SearchPaths getter, replace `try { } catch { }` with:
    try { _searchPaths.Add(_files.GetApplicationDataDirectory(_appName)); }
    catch (Exception ex) { _logger?.LogWarning(ex, "Could not access application data directory"); }

    // In FindExamFiles, replace `catch { }` with:
    catch (Exception ex) { _logger?.LogWarning(ex, "Could not enumerate files in {SearchPath}", path); continue; }
}
```

### QuestionParser.cs
Add `ILogger<QuestionParser>? logger = null` optional parameter. Log warnings when questions are skipped (missing answers, missing options).

### ExamPdfExporter.cs
Add `ILogger<ExamPdfExporter>? logger = null`. Log Info on generation start/complete, Warning on empty question list.

---

## Deliverable 7: Add Dependabot + Vulnerability Scan

**New file:** `.github/dependabot.yml`
```yaml
version: 2
updates:
  - package-ecosystem: "nuget"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
```

**Add to build.yml** (after build step):
```yaml
      - name: Check for vulnerable packages
        run: |
          dotnet list package --vulnerable --include-transitive 2>/dev/null || true
```

---

## Deliverable 8: Content Schema Linter in CI

**Status:** Quick Win 6 covers this. Add as CI step.

---

# PART 6: Concrete File-Level Change Map

| File Path | Change Type | Phase | Description |
|---|---|---|---|
| `RadicalTrainingPlatform.Core/Services/QuestionParser.cs` | Modify | Quick Win 1,2 | Fix AnswerRegex, fix DeriveExamCode |
| `RadicalTrainingPlatform.Core/Services/QuestionParser.cs` | Modify | Quick Win 7 | Remove _fileProvider field and constructor param |
| `RadicalTrainingPlatform.Core/ViewModels/ExamSessionViewModel.cs` | Modify | Quick Win 8 | Replace Question.Id mutation with _displayIndex |
| `RadicalTrainingPlatform.Desktop/MainWindow.axaml.cs` | Modify | Quick Win 5 | Wire OnExportClicked to ExamPdfExporter + save dialog |
| `RadicalTrainingPlatform.Desktop/MainWindow.axaml.cs` | Modify | Quick Win 7 | Remove provider arg from QuestionParser constructor call |
| `RadicalTrainingPlatform.Desktop/Services/AvaloniaSaveDialog.cs` | Create | Quick Win 5 | Cross-platform save file dialog wrapper |
| `.github/workflows/build.yml` | Modify | Quick Win 3, Phase 1.3 | Update SDK to 10.0.x, fix artifact paths, remove `\|\| true` |
| `packaging/linux/app.radicaltrainingplatform.RadicalTrainingPlatform.yml` | Modify | Quick Win 9 | Fix git URL, commit SHA, SDK extension |
| `Directory.Build.props` | Create | Quick Win 10 | Centralized SemVer, assembly info |
| `errata.json` | Create | Phase 1.2 | Override mechanism for wrong answer keys |
| `scripts/lint-content.py` | Create | Quick Win 6, Phase 1.8 | Content format validation script |
| `.github/dependabot.yml` | Create | Phase 1.7 | Automated dependency updates |
| `RadicalTrainingPlatform.Core.Tests/RadicalTrainingPlatform.Core.Tests.csproj` | Create | Phase 1.4 | xUnit test project |
| `RadicalTrainingPlatform.Core.Tests/QuestionParserTests.cs` | Create | Phase 1.4 | Parser coverage tests |
| `RadicalTrainingPlatform.Core.Tests/DeriveExamCodeTests.cs` | Create | Phase 1.4 | Exam code derivation tests |
| `RadicalTrainingPlatform.Core.Tests/ExamSessionViewModelTests.cs` | Create | Phase 1.4 | ViewModel state machine tests |
| `RadicalTrainingPlatform.Core.Tests/BlueprintServiceTests.cs` | Create | Phase 1.4 | BlueprintService static class tests |
| `RadicalTrainingPlatform.Core.Tests/MarkdownExamRepositoryTests.cs` | Create | Phase 1.4 | Exam repository tests |
| `RadicalTrainingPlatform.Core.Tests/ExamPdfExporterTests.cs` | Create | Phase 1.4 | PDF generation validation tests |
| `RadicalTrainingPlatform.Core/Abstractions/IBlueprintService.cs` | Create | Phase 1.5 | Blueprint service interface |
| `RadicalTrainingPlatform.Core/Abstractions/IReferenceService.cs` | Create | Phase 1.5 | Reference service interface |
| `RadicalTrainingPlatform.Core/Services/BlueprintService.cs` | Modify | Phase 1.5 | Implement IBlueprintService, obsolete static members |
| `RadicalTrainingPlatform.Core/Services/ReferenceService.cs` | Modify | Phase 1.5 | Implement IReferenceService, obsolete static members |
| `RadicalTrainingPlatform.Core/Infrastructure/IExamRepository.cs` | Modify | Phase 1.6 | Add logging, fix Directory.GetParent breach |
| `RadicalTrainingPlatform.Core/PdfExport/ExamPdfExporter.cs` | Modify | Phase 1.6 | Add logging for export operations |
| `RadicalTrainingPlatform.Core/Infrastructure/IFileProvider.cs` | Modify | Phase 1.6 | Add GetParentDirectory method |
| `RadicalTrainingPlatform.Core/Infrastructure/DefaultFileProvider.cs` | Modify | Phase 1.6 | Implement GetParentDirectory |
| `RadicalTrainingPlatform.Desktop/Program.cs` | Modify | Phase 1.5 | Wire up DI container on startup |
| `RadicalTrainingPlatform.Desktop/Views/BlueprintView.axaml.cs` | Modify | Phase 1.5 | Call LoadBlueprint on show |
| `RadicalTrainingPlatform.Desktop/MainWindow.axaml.cs` | Modify | Phase 1.5 | Inject IBlueprintService, pass to BlueprintView |
| `RadicalTrainingPlatform.Legacy.WinForms/MainForm.cs` | Modify | Phase 1.5 | Update to use instance methods (compatibility) |
| `RadicalTrainingPlatform.Core/ViewModels/ExamSessionViewModel.cs` | Modify | Phase 1.5 | Update factory registration in DI |
| `.github/workflows/build.yml` | Modify | Phase 1.4 | Add test project to solution build |
| `.github/workflows/build.yml` | Modify | Phase 1.4 | Generate and upload coverage report |
| `RadicalTrainingPlatform.sln` | Modify | Phase 1.4 | Add Core.Tests project to solution |
| `RadicalTrainingPlatform.Core/Models/Question.cs` | Modify | Phase 2 | Convert to init-only or record (deferred) |
| `RadicalTrainingPlatform.Core/Abstractions/IProgressRepository.cs` | Create | Phase 2 | SQLite persistence interface |
| `RadicalTrainingPlatform.Core/Infrastructure/SqliteProgressRepository.cs` | Create | Phase 2 | SQLite-backed persistence |
| `RadicalTrainingPlatform.Desktop/Views/StatsView.axaml` | Modify | Phase 2 | Bind to real data |
| `RadicalTrainingPlatform.Desktop/Views/StatsView.axaml.cs` | Modify | Phase 2 | Consume IProgressRepository data |
| `global.json` | Create | Phase 1 | Pin .NET SDK version for reproducible builds |
| `NCA-75-Part1.md` | Modify | Quick Win 4 | Fix Q3 answer key |
| `NCA-75-Part3-GapFill.md` | Modify | Quick Win 4 | Fix Q3 answer key |
| `NCP-US-Part1.md` (or appropriate) | Modify | Quick Win 4 | Fix PC max VMs question |

---

## Execution Order (Recommended)

### Week 1 (Quick Wins)
1. Quick Win 1: Fix AnswerRegex
2. Quick Win 2: Fix DeriveExamCode
3. Quick Win 3: Fix CI SDK version
4. Quick Win 4: Correct answer keys
5. Quick Win 7: Remove dead _fileProvider
6. Quick Win 8: Stop mutating Question.Id
7. Quick Win 9: Fix Flatpak manifest
8. Quick Win 10: Add Directory.Build.props + global.json

### Week 2 (Phase 1 Foundation)
9. Phase 1.4: Create Core.Tests, write tests
10. Quick Win 6: Add content linter + CI step

### Week 3 (Phase 1 Architecture)
11. Phase 1.5: Extract interfaces (IBlueprintService, IReferenceService)
12. Phase 1.6: Add logging
13. Phase 1.7: Add Dependabot + vulnerability scan
14. Phase 1.2: Add errata.json + application in parser

### Week 4 (Phase 1 Integration & Validation)
15. Run full test suite, ensure 70%+ coverage
16. Validate CI passes on all 3 OSes
17. Validate 100% question parse rate across all 21 files
18. Code review and merge

---

*Plan generated from complete source audit covering 40+ files, 5,000+ lines of code.*
*Last validated against source at commit-level analysis — June 2026.*
