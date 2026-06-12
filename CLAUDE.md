# RadicalTrainingPlatform — Project Guidelines

## Project Overview

Cross-platform certification study platform for Nutanix (and future vendors). 1,458 validated practice questions across 4 exams, synthwave-themed UI, blueprint coverage tracking, and a lab simulator.

**Stack:** .NET 10 / C# 13 / Avalonia 11.2 / QuestPDF / HTML+JS PWA

## Architecture

```
RadicalTrainingPlatform.Core (net10.0 — no UI deps)
  ├── Models/          Question, AnswerOption, BlueprintObjective, ExamCatalogItem
  ├── Services/        QuestionParser, BlueprintService, ReferenceService
  ├── ViewModels/      ExamSessionViewModel
  ├── Infrastructure/  IExamRepository, IFileProvider
  └── PdfExport/       ExamPdfExporter (QuestPDF)

RadicalTrainingPlatform.Desktop (net10.0 — Avalonia 11.2)
  ├── Views/           ExamSelectorView, QuestionView, OptionCard, BlueprintView, StatsView
  ├── Controls/        SynthwaveProgressBar, BlueprintCanvas
  ├── LabSimulator/    CefBridge, LabSimulatorView
  └── Simulators/      Lab simulator templates

RadicalTrainingPlatform.Web (static PWA)
  ├── index.html, manifest.json, sw.js
  ├── js/              app.js, core/, views/
  └── css/

RadicalTrainingPlatform.Legacy.WinForms (net8.0-windows)
  └── MainForm.cs (59K GDI+ synthwave UI — preserved for reference)
```

### Dependency Rule

**UI depends on Core. Core NEVER depends on UI.**

- Core: `net10.0` — zero UI framework references
- Desktop: references Core, uses Avalonia
- Web: standalone HTML/JS/CSS, no .NET dependency
- Legacy: references Core, uses WinForms (Windows-only)

## Guardrails (from agent-guardrails-template v2.8.0)

### The Four Laws

1. **Read Before Editing** — Never modify code without reading it first
2. **Stay in Scope** — Only touch files explicitly authorized
3. **Verify Before Committing** — Build and test all changes
4. **Halt When Uncertain** — Ask for clarification instead of guessing

### Three Strikes Rule

If an operation fails 3 times: HALT and escalate to the user.

### Pre-Edit Checklist

- [ ] Read the target file(s) completely
- [ ] Verify operation is within authorized scope
- [ ] Confirm which project layer you're modifying
- [ ] Check for cross-layer dependency violations (Core must not reference UI)

### Forbidden Actions

- Adding `System.Windows.Forms` or `Avalonia` references to Core
- Using `System.IO.Directory` directly in Core (use `IFileProvider`)
- Force pushing to main
- Committing secrets or `.env` files
- Modifying unread code

## Working Conventions

### Build & Test

```bash
# Build everything (Core + Desktop — Legacy WinForms won't build on Linux)
dotnet build RadicalTrainingPlatform.sln

# Build individual projects
dotnet build RadicalTrainingPlatform.Core
dotnet build RadicalTrainingPlatform.Desktop

# Run desktop app
dotnet run --project RadicalTrainingPlatform.Desktop
```

### Commit Format

```
<type>: <description>

Co-Authored-By: Claude <noreply@anthropic.com>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `rename`

### File Modifications

- Prefer small, single-file edits
- Commit after each logical change
- Core changes must build on `net10.0` with zero warnings
- Desktop changes must build on `net10.0` with Avalonia 11.2

## Key Files

| File | Purpose |
|------|---------|
| `docs/SPRINT-PLAN.md` | Current sprint tasks and priorities |
| `docs/MASTER-PROJECT-PLAN.md` | Multi-year roadmap |
| `docs/ROADMAP-CROSSPLATFORM.md` | Cross-platform architecture decisions |
| `RadicalTrainingPlatform.sln` | Solution file (Windows + cross-platform projects) |
| `RadicalTrainingPlatform.slnx` | XML solution file (needs population — Sprint 1) |

## Documentation Standards

- **500-Line Max**: No document over 500 lines. Split if needed.
- **Update SPRINT-PLAN.md** when completing or adding sprint tasks.
