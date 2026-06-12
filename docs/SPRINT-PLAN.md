# 🏃 RadicalTrainingPlatform — Sprint Plan

> **Last Updated:** 2026-06-11  
> **Current Sprint:** Sprint 1 — Rename Cleanup + Fix Broken Bits  
> **Guardrails:** agent-guardrails-template v2.8.0 (TheArchitectit)

## Sprint Cadence

- **2 weeks per sprint**
- **Status:** 🟢 Done | 🟡 In Progress | ⚪ Planned | 🔴 Blocked

## Guardrails (The Four Laws)

All work follows the [agent-guardrails-template](https://github.com/TheArchitectit/agent-guardrails-template) v2.8.0:

1. **Read Before Editing** — Never modify code without reading it first
2. **Stay in Scope** — Only touch files explicitly authorized
3. **Verify Before Committing** — Build and test all changes
4. **Halt When Uncertain** — Ask for clarification instead of guessing

**Skills installed in `.claude/skills/`:** guardrails-enforcer, commit-validator, env-separator, error-recovery, production-first, scope-validator, three-strikes  
**Hooks installed in `.claude/hooks/`:** pre-execution, post-execution, pre-commit

---

## Sprint 1: Rename Cleanup + Fix Broken Bits

> **Goal:** Eliminate all stale CertForge references, fix broken solution metadata, patch critical NuGet vulnerabilities, and reconcile the Eto.Forms-vs-Avalonia roadmap disconnect. By the end of this sprint the repo builds cleanly, the solution files are correct, and known security issues are mitigated.
>
> **Status:** 🟡 In Progress

| # | Task | Priority | Effort | Status |
|---|------|----------|--------|--------|
| 0 | Install agent-guardrails-template v2.8.0 — skills (guardrails-enforcer, commit-validator, env-separator, error-recovery, production-first, scope-validator, three-strikes), hooks (pre-execution, post-execution, pre-commit), CLAUDE.md, settings.local.json | P0 | S | 🟢 |
| 1 | Fix stale CertForge git URL in Flatpak manifest (`packaging/linux/app.radicaltrainingplatform.RadicalTrainingPlatform.yml` line 61) | P0 | S | ⚪ |
| 2 | Clean rebuild to regenerate `obj/` build artifacts that embed old `/mnt/data/git/certforge/` paths (sourcelink.json, FileListAbsolute.txt — gitignored, auto-fix on rebuild) | P0 | S | ⚪ |
| 3 | Populate or delete empty `RadicalTrainingPlatform.slnx` (currently contains only `<Solution></Solution>`) | P0 | S | ⚪ |
| 4 | Upgrade CefGlue from 120.6099.204 to CEF 130+ (patches critical Chromium CVEs: CVE-2024-0519, WebRTC heap overflow, V8 type confusion) | P0 | M | ⚪ |
| 5 | Upgrade Avalonia from 11.2.3 to latest 11.2.x patch (memory leak + rendering crash fixes) | P1 | S | ⚪ |
| 6 | Upgrade Microsoft.Web.WebView2 from 1.0.2903.40 to latest SDK (data URI handling + cross-origin hardening) | P1 | S | ⚪ |
| 7 | Reconcile `ROADMAP-CROSSPLATFORM.md`: rewrite framework comparison and sprint plan to reflect actual Avalonia implementation (not Eto.Forms) | P1 | M | ⚪ |
| 8 | Update `MASTER-PROJECT-PLAN.md` to reflect actual project state (Core is done, Desktop Avalonia skeleton exists, PWA exists) | P2 | S | ⚪ |
| 9 | Update `README.md` to reflect multi-project Avalonia+Core+PWA architecture | P2 | M | ⚪ |
| 10 | Verify QuestPDF 2025.1.0 license compliance (community license requires attribution for revenue under $1M) | P2 | S | ⚪ |

**Deliverable:** Repo has zero stale CertForge references (in tracked files), solution files are valid, NuGet CVE-class vulnerabilities patched, roadmap matches reality, clean build from scratch succeeds.

---

## Sprint 2: Wire Real Data Through the Desktop App

> **Goal:** Replace every piece of hardcoded mock data in the Avalonia Desktop app with real data flowing from RadicalTrainingPlatform.Core. Make the app genuinely usable for studying on Linux.
>
> **Status:** ⚪ Planned

| # | Task | Priority | Effort | Status |
|---|------|----------|--------|--------|
| 1 | Wire BlueprintView data pipeline: `MainWindow.OnBlueprintClicked()` → `BlueprintCanvas.LoadBlueprint()` with data from `BlueprintService.GetBlueprint()` + `CalculateCoverage()` | P0 | M | ⚪ |
| 2 | Replace StatsView hardcoded mock data with real data from `ExamSessionViewModel` (accuracy, correct/wrong counts, domain breakdown from BlueprintService) | P0 | M | ⚪ |
| 3 | Wire CefBridge to real Core data: replace all 6 mock handlers (`load_exam_list`, `get_stats`, `get_question`, `submit_answer`, `save_progress`, `load_progress`) with calls to QuestionParser, ExamSessionViewModel, and a new JSON session store | P0 | L | ⚪ |
| 4 | Implement `MainWindow.OnExportClicked()` using `ExamPdfExporter` from Core (QuestPDF-based PDF generation) | P1 | M | ⚪ |
| 5 | Fix QuestionView domain badge: `DomainText` element exists in XAML but `RefreshUI()` never updates it — always shows `'GENERAL'` | P1 | S | ⚪ |
| 6 | Fix streak counter: `MainWindow.UpdateStats()` sets `TxtStreak` to `CorrectCount` (total correct, not consecutive streak). Add streak tracking to `ExamSessionViewModel` | P2 | S | ⚪ |
| 7 | Fix `MarkdownExamRepository.SearchPaths`: line 73 uses `System.IO.Directory.GetParent()` directly instead of `IFileProvider`, breaking the platform-abstraction intent | P1 | S | ⚪ |
| 8 | Add `IExamRepository.RegisterSearchPath()` API so users can point the app at a custom exam directory | P2 | S | ⚪ |
| 9 | End-to-end test on Linux: build → launch → load exams → answer questions → view blueprints → check stats → export PDF | P0 | S | ⚪ |

**Deliverable:** Avalonia Desktop app runs on Linux with real exam data: blueprints render with coverage, stats show actual performance, lab simulator communicates with Core, PDF export works, domain badges are correct.

---

## Sprint 3: Vendor-Neutral Core + Test Coverage

> **Goal:** Make BlueprintService and ReferenceService truly vendor-neutral so non-Nutanix exams (AWS, Azure, CKA, CKS, CCNA) are first-class citizens. Add unit tests to lock in the Core logic.
>
> **Status:** ⚪ Planned

| # | Task | Priority | Effort | Status |
|---|------|----------|--------|--------|
| 1 | Refactor `BlueprintService` to data-driven architecture: extract hardcoded Nutanix Init methods into a JSON/blueprint file format, add `IBlueprintProvider` interface, load blueprints from embedded resources or external files | P0 | L | ⚪ |
| 2 | Refactor `ReferenceService` to data-driven: replace hardcoded Nutanix-only `_data` and `_kbLinks` dictionaries with JSON-loaded reference files, add `IReferenceProvider` interface | P0 | L | ⚪ |
| 3 | Create `RadicalTrainingPlatform.Core.Tests` xUnit project: test QuestionParser markdown parsing (all question formats), BlueprintService lookup + coverage calculation, ReferenceService keyword matching, ExamSessionViewModel state machine | P1 | L | ⚪ |
| 4 | Add Core.Tests project to `.sln` (and `.slnx` if kept) | P1 | S | ⚪ |
| 5 | Add "Back to Study" button in review mode (currently no UI path back from review to main session) | P2 | S | ⚪ |
| 6 | Resolve Lab Simulator template system: Simulators/ `_Template` and Nutanix manifest reference `js/core/` and `js/views/` files that only exist in the Web project. Make simulators self-contained | P2 | M | ⚪ |
| 7 | Wire PWA search box to actual view filtering (currently visual-only placeholder) | P2 | S | ⚪ |
| 8 | Fix CLIService async bug: `#alertCmd()` is async but `execute()` returns synchronously | P2 | S | ⚪ |

**Deliverable:** Core services are vendor-neutral (extensible via data files, no code changes needed for new vendors). Unit test project exists with coverage of parser, blueprint, reference, and viewmodel logic. All low-severity UI bugs fixed.

---

## Future Sprints (High-Level)

### Sprint 4: Exam Simulation Mode
- Timed 75-question exam simulation with countdown timer
- Exam review with correct/incorrect highlighting
- Score report generation (PDF + on-screen)
- Difficulty ratings (Easy/Medium/Hard) on questions

### Sprint 5: Persistence & Progress Tracking
- SQLite per-user database for cross-session progress
- Wrong-answer review mode with spaced repetition
- Export formats: Anki deck, CSV, JSON flashcard generation
- Progress sync (local-first, optional cloud later)

### Sprint 6: CI/CD & Packaging
- GitHub Actions matrix: Windows/Linux/macOS builds
- Linux packaging: Flatpak + AppImage + tarball
- macOS packaging: signed `.dmg`
- Windows packaging: self-contained `.exe` + optional installer
- Release automation: tag → build all → attach to GitHub Release

### Sprint 7: Additional Certification Exams
- NCP-DB (Database) exam content — 300+ questions
- NCP-NX (Network Security / Flow) exam content — 300+ questions
- AWS/Azure/GCP certification modules (separate packs)
- NCA 8.0 update questions

### Sprint 8: Web App & Mobile
- Full web app (Blazor WASM or SPA)
- Mobile-responsive layout
- PWA install prompts ("Add to Home Screen")
- Offline question sync

---

## Sprint Velocity

- **1 developer + AI pair:** 3–5 story points per sprint (current mode)
- **Story point scale:** S=1, M=2, L=3

## Architecture Reference

```
┌─────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                     │
│  ┌──────────────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Avalonia Desktop │  │ PWA/Web  │  │ WinForms      │  │
│  │ (Linux/Win/Mac)  │  │ (Any)    │  │ (Legacy Win)  │  │
│  └────────┬─────────┘  └────┬─────┘  └──────┬────────┘  │
├───────────┼──────────────────┼────────────────┼───────────┤
│           │    RadicalTrainingPlatform.Core    │           │
│  ┌────────▼─────────────────▼────────────────▼────────┐  │
│  │  ViewModels    │  Services      │  Infrastructure │  │
│  │  ExamSessionVM │  QuestionParser│  IExamRepo      │  │
│  │                │  BlueprintSvc  │  IFileProvider  │  │
│  │                │  ReferenceSvc  │                  │  │
│  │                │  ExamPdfExport │                  │  │
│  └────────────────┴────────────────┴──────────────────┘  │
├─────────────────────────────────────────────────────────┤
│  DATA: Markdown questions │ Blueprint JSON │ Lab sim HTML│
└─────────────────────────────────────────────────────────┘
```
