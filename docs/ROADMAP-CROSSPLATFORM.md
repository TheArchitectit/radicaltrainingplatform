# RadicalTrainingPlatform — Cross-Platform Roadmap (Linux + macOS)

> **Current:** WinForms .NET 10 + WebView2 (Windows-only, legacy) | Avalonia 11.2 + Core (cross-platform, active)
> **Target:** Native apps on Windows, Linux, macOS with shared engine + standalone PWA

## Executive Summary

The project has two codepaths:

1. **Legacy WinForms app** (`RadicalTrainingPlatform.Legacy.WinForms`) — the original, Windows-only, 59K of GDI+ paint code
2. **Avalonia Desktop app** (`RadicalTrainingPlatform.Desktop`) — the cross-platform successor, currently scaffolded with views but not yet wired to real data

Plus a **standalone PWA** (`RadicalTrainingPlatform.Web`) for the Lab Simulator that runs in any browser.

**Decision made: Avalonia** (not Eto.Forms). Here's why:

| Framework | Linux? | macOS? | WebView? | Custom Paint? | Dependency Footprint | Status |
|-----------|--------|--------|----------|---------------|---------------------|--------|
| **Avalonia** | ✅ X11/Wayland | ✅ | CefGlue (or browser launch) | Skia — full paint API | Medium | ✅ **Chosen — already in codebase** |
| Eto.Forms | ✅ Gtk3 | ✅ | Gtk.WebKit | Native draw hooks | Small | Considered — not chosen |
| MAUI | ⚠️ Community | ✅ | BlazorWebView | Skia | Heavy | Desktop is 2nd-class |
| Uno Platform | ✅ Skia | ✅ | Patchy | Skia | Heavy | Overkill |

**Avalonia wins because:**
1. Already scaffolded in the codebase with views, controls, and theme
2. Skia-based rendering handles the synthwave paint code well
3. CefGlue/CefSharp provides WebView for the Lab Simulator on all platforms
4. Strong XAML data binding, mature ecosystem, .NET 10 support
5. One codebase runs on all three platforms (no per-platform UI code)

---

## Architecture — Shared + Native Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     UI LAYER                                │
│  ┌──────────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Avalonia Desktop  │  │ PWA (Web)   │  │ WinForms     │  │
│  │ (Linux/Win/Mac)  │  │ (Any browser)│  │ (Legacy Win) │  │
│  │ CefGlue WebView   │  │ Standalone  │  │ WebView2     │  │
│  └────────┬──────────┘  └──────┬───────┘  └──────┬───────┘  │
├───────────┼─────────────────────┼─────────────────┼──────────┤
│           │   RadicalTrainingPlatform.Core        │          │
│  ┌────────▼─────────────────────▼─────────────────▼────────┐ │
│  │  Models/    │  Services/       │  Infrastructure/      │ │
│  │  Question   │  QuestionParser  │  IExamRepository      │ │
│  │  AnswerOpt  │  BlueprintSvc    │  IFileProvider        │ │
│  │  Blueprint  │  ReferenceSvc    │                       │ │
│  │  ExamCatalog│  ExamPdfExport   │  ViewModels/          │ │
│  └────────────┴──────────────────┴───────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  DATA: Markdown questions │ Blueprint JSON │ Lab sim HTML   │
└─────────────────────────────────────────────────────────────┘
```

---

## Sprint Plans

> **For detailed task-level sprints with priorities and effort estimates, see [SPRINT-PLAN.md](SPRINT-PLAN.md).**
> The sprints below are the high-level cross-platform roadmap.

### ✅ Sprint 0: Foundation (DONE)

**What was completed (pre-sprint tracking):**
- `RadicalTrainingPlatform.Core` class library extracted — builds on `net10.0` with zero UI dependencies
- Models, Services, ViewModels, Infrastructure interfaces all ported
- `RadicalTrainingPlatform.Desktop` (Avalonia 11.2) scaffolded — views, controls, lab simulator
- `RadicalTrainingPlatform.Web` (PWA) — manifest, service worker, HTML/JS/CSS
- Agent guardrails v2.8.0 installed — skills + hooks + CLAUDE.md
- QuestPDF integrated for cross-platform PDF export

### 🏃 Sprint 1: Rename Cleanup + Fix Broken Bits (NOW)

**Goal:** Eliminate stale CertForge refs, patch CVEs, fix solution files, update docs.

- Fix git URL in Flatpak manifest
- Clean rebuild to regenerate obj/ artifacts
- Populate or delete empty `.slnx`
- Upgrade CefGlue (Chromium CVEs), Avalonia, WebView2
- Reconcile roadmap docs (Eto.Forms → Avalonia)
- Update README for multi-project architecture

### 🏃 Sprint 2: Wire Real Data Through Desktop App

**Goal:** Replace mock data with real Core services. Make Avalonia app usable on Linux.

- Wire BlueprintView → BlueprintService
- Replace StatsView mock data → ExamSessionViewModel
- Wire CefBridge → real Core services (6 mock handlers → real)
- Implement PDF export via ExamPdfExporter
- Fix domain badges, streak counter, IFileProvider violations
- End-to-end test on Linux

### 🏃 Sprint 3: Vendor-Neutral Core + Test Coverage

**Goal:** Make Core extensible for any vendor. Lock in with tests.

- Refactor BlueprintService → data-driven (JSON blueprints)
- Refactor ReferenceService → data-driven (JSON references)
- Create Core.Tests xUnit project
- Fix UI bugs (review mode, lab simulator JS deps, PWA search)

### 🏃 Sprint 4: Exam Simulation Mode

**Goal:** Timed exam simulation with real scoring.

- Countdown timer (75-question / 120-min mode)
- Exam review with correct/incorrect highlighting
- Score report generation (PDF + on-screen)
- Difficulty ratings on questions

### 🏃 Sprint 5: Persistence & Progress Tracking

**Goal:** SQLite-based cross-session progress.

- SQLite per-user database
- Wrong-answer review with spaced repetition
- Export: Anki deck, CSV, JSON flashcard generation
- Progress sync (local-first)

### 🏃 Sprint 6: Packaging & Distribution

**Goal:** Installable on all platforms.

| Platform | Format | Tooling |
|----------|--------|---------|
| Windows | `.exe` (self-contained), `.msi` | `dotnet publish --self-contained` + WiX |
| Linux (Ubuntu/Debian) | `.deb` | `dotnet deb` or `fpm` |
| Linux (Fedora/RHEL) | `.rpm` | `dotnet rpm` or `fpm` |
| Linux (generic) | AppImage | `AppImageBuilder` |
| macOS | `.dmg` (signed + notarized) | `create-dmg` + `xcrun altool` |

- GitHub Actions CI/CD matrix: `windows-latest`, `ubuntu-latest`, `macos-latest`
- Release automation: tag → build all → attach to GitHub Release
- Flatpak manifest (already exists in `packaging/linux/`)

---

## Risk Analysis & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| CefGlue/CefSharp rendering issues on Linux | Medium | High | Test early; fallback to external browser launch |
| Synthwave theme rendering in Avalonia Skia | Low | Medium | Skia handles gradients well; test alpha blending |
| PDF generation looks different with QuestPDF | Medium | Medium | Accept minor visual differences; focus on content accuracy |
| macOS code signing/notarization delays | High (process) | Low | Start Apple Developer account early; test with ad-hoc signing first |
| Linux font rendering differences | Medium | Low | Bundle fonts or use system fonts; test on multiple distros |

---

## Success Criteria

- [ ] `RadicalTrainingPlatform.Desktop` runs on Ubuntu 24.04 with all 4 exams loadable
- [ ] `RadicalTrainingPlatform.Desktop` runs on macOS 14 (Apple Silicon) with all 4 exams loadable
- [ ] Lab Simulator works on both platforms (embedded CefGlue or browser fallback)
- [ ] PDF export works on Linux and macOS
- [ ] All 1,458 questions parse correctly
- [ ] CI builds all platforms on every PR
- [ ] No regression in Legacy WinForms app
- [ ] Core library has zero UI dependencies

---

## Appendix: Avalonia ↔ WinForms API Map

| WinForms | Avalonia | Notes |
|----------|----------|-------|
| `Form` | `Window` | Same concept, different name |
| `Panel` | `Panel` / `Border` | Border provides background/border |
| `Button` | `Button` | Same, XAML-based styling |
| `Label` | `TextBlock` / `Label` | TextBlock for display, Label for access keys |
| `CheckBox` | `CheckBox` | Same |
| `RadioButton` | `RadioButton` | Same |
| `RichTextBox` | `RichTextBox` (Avalonia) | Similar |
| `ComboBox` | `ComboBox` | Same |
| `ProgressBar` | `ProgressBar` | Same, XAML templatable |
| `Timer` | `DispatcherTimer` | WPF-style timer |
| `Graphics` | `DrawingContext` | Skia-based, similar drawing API |
| `Color` | ` Avalonia.Media.Color` | Immutable struct |
| `Font` | `FontFamily` + `FontSize` | Separate properties |
| `Pen` | `IPen` / `Pen` | Avalonia Pen is immutable |
| `Brush` | `IBrush` / `SolidColorBrush` | Immutable, can freeze |
| `Rectangle` | `Rect` | Value type |
| `Point` | `Point` | Value type |
| `Size` | `Size` | Value type |
| `MessageBox.Show()` | `MessageBox.Show()` | Same (from Avalonia.Dialogs) |
| `Application.Run()` | `BuildAvaloniaApp().Start()` | Platform-specific bootstrap |
| `DockStyle` | `DockPanel` | XAML attached property `DockPanel.Dock` |
| `AnchorStyles` | `HorizontalAlignment`/`VerticalAlignment` | Stretch/Center/etc |
| `KeyPreview` | `KeyDown` event on any control | Bubbling/routing events |
| `OnPaint` | `Drawable` control | Custom rendering via `DrawingContext` |

**Estimated refactoring effort:**
- `MainForm.cs` 59K → already ported to Avalonia XAML views in Desktop project
- `AnimatedProgressBar.cs` → `SynthwaveProgressBar.axaml.cs` (already done)
- `BlueprintPanel.cs` → `BlueprintCanvas.cs` (already done)
- Business logic: **zero changes** (lives in `RadicalTrainingPlatform.Core`)
