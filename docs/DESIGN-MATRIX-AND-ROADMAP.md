# RadicalTrainingPlatform — Design Matrix & Roadmap

---

## 1. EXECUTIVE SUMMARY

RadicalTrainingPlatform is a pre-alpha Nutanix certification study tool with three codebases (Core .NET 10 library, Avalonia desktop UI, and a static PWA lab simulator) that demonstrates a compelling synthwave-themed quiz experience but suffers from foundational gaps that prevent production readiness. The Core library has workable abstractions (IFileProvider, IExamRepository) but violates SOLID principles via static data-bound services (BlueprintService, ReferenceService), lacks dependency injection, persistence, and logging, and contains a parser bug that silently drops 22% of NCP-CI questions. The Avalonia desktop port is an incomplete feature shell — the export button is unwired, BlueprintView never loads data, StatsView is unreachable, the lab simulator bridge returns stubs, and the CefGlue dependency blocks mobile — while the WinForms legacy version remains the only feature-complete client but is Windows-locked. Infrastructure is at its earliest stage: CI uses the wrong .NET SDK version (8 vs. 10), zero test projects exist, no release pipeline is automated, and no monitoring or vulnerability scanning is in place. **Overall maturity rating: 3/10.**

---

## 2. DESIGN MATRIX

| Domain | Current State | Target State | Gap Severity | Key Actions | Effort |
|---|---|---|---|---|---|
| **Architecture** | Static service classes embed hardcoded data and matching logic; no DI container, no logging, no persistence layer; ViewModel mutates shared model objects | Instance-based services behind interfaces (IBlueprintService, IReferenceService, IQuestionParser); DI container; SQLite persistence; logging throughout; immutable models in view layer | Critical | 1. Extract interfaces from BlueprintService, ReferenceService and register via DI. 2. Add SQLite-backed IProgressRepository for session persistence. 3. Add Microsoft.Extensions.Logging and replace bare catch blocks. | XL |
| **UI/UX** | Avalonia shell with imperative code-behind, no navigation stack, dead views (StatsView, BlueprintView), no accessibility, no responsive design, feature-poor vs. WinForms | MVVM with ReactiveUI, documented navigation flow, all views wired and data-bound, WCAG 2.1 AA compliant, responsive down to 800px, full feature parity with WinForms plus new capabilities | High | 1. Create MainWindowViewModel and adopt ReactiveUI routing. 2. Wire BlueprintView/StatsView to real data and navigation. 3. Add AutomationPeers, focus indicators, and live-region announcements. | L |
| **Content** | 1,598 questions across 5 Nutanix exam tracks; parser silently drops NCP-CI-Part3 (80 questions) due to answer-format mismatch; DeriveExamCode mis-classifies 2 files; 3 confirmed wrong answer keys; no content validation pipeline | All questions parse successfully; content schema enforced by linter in CI; answered-key errata system; stable global question IDs; coverage metrics that are accurate; content versioning | Critical | 1. Fix AnswerRegex to accept "Correct Answer:" variant. 2. Fix DeriveExamCode for GapFill and D-suffix filenames. 3. Correct the 3 wrong answer keys and add errata.json override mechanism. | S |
| **Infra** | CI installs .NET 8 SDK but projects target .NET 10 (builds fail); zero tests; no release automation; Flatpak manifest broken; no monitoring; no dependency scanning | CI uses .NET 10 SDK with passing builds; >70% Core test coverage; automated release pipeline on tag push; working Flatpak/AppImage/DMG/MSIX packaging; Sentry crash reporting; Dependabot + SAST enabled | Critical | 1. Fix CI SDK version to .NET 10 and artifact paths to net10.0. 2. Create Core.Tests project with xUnit and wire into CI (remove `\|\| true`). 3. Add release.yml workflow triggered on tags with cross-platform packaging jobs. | L |
| **Cross-Platform** | WinForms legacy is Windows-only; Avalonia desktop works on Windows/macOS/Linux but CefGlue blocks iOS/Android; web simulator is 100% portable but hosted in isolated CEF container; no shared abstraction for lab simulator | Core library consumed by any host; Avalonia desktop for desktop platforms; PWA as the primary mobile/web frontend; ILabSimulatorHost abstraction allows CefGlue on desktop and native WebView on mobile | Medium | 1. Define ILabSimulatorHost interface in Core with CefGlue and WebView implementations. 2. Make the PWA the primary mobile frontend with standalone offline support. 3. Abstract platform-specific file dialogs behind IFileProvider. | M |
| **Security** | Optional local trufflehog pre-commit hook; no CI-level dependency scanning; no SAST; no SBOM; no crash reporting; pre-commit hook blocks non-AI commits | Dependabot + dotnet vulnerability scan in CI; CodeQL SAST; SBOM in release artifacts; Sentry crash reporting; AI-attribution check moved to advisory CI job | High | 1. Add .github/dependabot.yml for NuGet and GitHub Actions. 2. Add `dotnet list package --vulnerable` step to CI. 3. Integrate Sentry SDK into Desktop apps and browser SDK into PWA. | M |
| **Features** | Quiz engine (single/multi-select MCQ only); PDF export (QuestPDF in Core, unwired in Desktop); lab simulator (CEF, stubs bridge); no progress persistence, no timed exams, no answer randomization, no question flagging, no adaptive learning | Multi-type questions (ordering, fill-in-blank, scenario, lab-integrated); timed exam-day simulator; spaced repetition review; full progress persistence with analytics; question flagging and bookmarking; PDF export wired and tested | High | 1. Wire PDF export button to ExamPdfExporter and add SaveFileDialog. 2. Implement timed exam mode in ExamSessionViewModel with countdown display. 3. Add question Difficulty metadata and SM-2 spaced repetition scheduler. | L |

---

## 3. CAPABILITY INVENTORY

| Capability | Maturity | Notes |
|---|---|---|
| Exam Engine (MCQ single/multi-select) | **Functional** | Core ExamSessionViewModel handles question navigation, answer selection, submission, and scoring. Works but mutates shared models and lacks timed mode. |
| Question Parsing | **Prototype** | QuestionParser handles standard markdown format but silently drops malformed questions (NCP-CI-Part3 bug). No validation, no warnings. |
| Question Types | **Concept** | Only MCQ supported despite content containing ordering/sequence and gap-fill questions. No drag-drop, fill-in-blank, or lab-based question types. |
| Lab Simulator | **Prototype** | Full Prism UI simulation (~15,100 lines of portable JS), state engine, CLI simulator, 28+ scenarios. But CefBridge returns stub data; not integrated with quiz engine; CefGlue blocks mobile. |
| Progress Tracking | **Concept** | No persistence layer. Session results lost on close. StatsView is unreachable prototype with hardcoded values. CefBridge save/load returns stubs. |
| Analytics / Stats | **Concept** | No longitudinal tracking, no per-domain heat maps, no time-per-question. BlueprintCanvas never loads data. Coverage calculation uses naive keyword matching. |
| PDF Export | **Functional** | QuestPDF ExamPdfExporter in Core is cross-platform and generates synthwave-themed PDFs. Not wired in Avalonia Desktop. WinForms uses separate PdfSharp-based ExportService. |
| Blueprint Coverage | **Prototype** | BlueprintService hardcoded for 5 Nutanix exams. CalculateCoverage uses keyword substring matching with false positives. BlueprintView never calls LoadBlueprint(). |
| Reference / KB Service | **Prototype** | ReferenceService hardcoded keyword scoring. No relevance threshold — low-scoring matches are noise. URLs hardcoded require recompilation to update. |
| Exam Catalog / Discovery | **Functional** | MarkdownExamRepository discovers .md files across multiple search paths. ExamCatalogItem provides display metadata. DeriveExamCode mis-classifies 2 filenames. |
| File System Abstraction | **Functional** | IFileProvider / DefaultFileProvider decouple Core from OS APIs. One breach: Directory.GetParent used directly in MarkdownExamRepository. |
| Theme / Visual Design | **Functional** | Synthwave dark theme is visually polished (13 palette colors, gradients, Inter font). No light theme. No system-theme detection. WCAG borderline contrast on some text. |
| Accessibility | **Concept** | No AutomationPeers, no focus indicators, no screen reader support, no keyboard Tab navigation through options, no ARIA. |
| PWA / Offline Support | **Functional** | Service Worker with cache-first strategy. IndexedDB persistence for lab simulator state. Works standalone in any browser. No backend required. |
| Mobile | **Concept** | CefGlue hard-blocks iOS/Android targets. MinWidth=1200 fixed layout. PWA could serve mobile but has no responsive layout. |
| Multi-User / Auth | **Concept** | No user accounts, no authentication, no profiles. All progress is local and ephemeral. |
| Internationalization | **Concept** | No .resx files, no locale-aware pipelines, all content English-only. Content files have no language identifiers. |
| CI/CD | **Prototype** | Two workflows exist but build.yml uses wrong SDK (would fail). No tests. No release automation. Working PWA deploy on push. |
| Packaging | **Prototype** | AppImage and DMG scripts exist but require manual execution. Flatpak manifest broken (wrong git URL, placeholder SHA). No Windows installer. No CI integration. |

---

## 4. ROADMAP

### Phase 1: Foundation (Months 1–3)

**Theme:** Fix blocking defects, establish architecture, achieve working CI.

| # | Deliverable |
|---|---|
| 1 | Fix parser bugs: AnswerRegex "Correct Answer:" variant, DeriveExamCode for GapFill/D-suffix filenames |
| 2 | Correct 3 wrong answer keys (LCM upgrade order, CVM SSH default, PC max VMs) and add errata.json override mechanism |
| 3 | Fix CI SDK version to .NET 10, fix artifact paths, remove `|| true` from test step |
| 4 | Create RadicalTrainingPlatform.Core.Tests (xUnit) targeting QuestionParser, ExamSessionViewModel, BlueprintService with 70%+ coverage |
| 5 | Extract IBlueprintService and IReferenceService interfaces; convert static classes to instance-based DI-registered services |
| 6 | Add Microsoft.Extensions.Logging.ILogger to MarkdownExamRepository, QuestionParser, ExamPdfExporter; replace bare catch blocks |
| 7 | Add .github/dependabot.yml for NuGet and Actions; add `dotnet list package --vulnerable` CI step |
| 8 | Create content schema linter (markdownlint custom rules) and add to CI to enforce answer-format uniformity |

**Success Criteria:**
- CI pipeline passes on all 3 OSes with correct SDK
- 100% of questions across all 21 markdown files parse without silent drops
- Core test coverage >= 70%
- Zero wrong answer keys in production content (verified by errata system)

**Dependencies:** .NET 10 SDK stable release; QuestPDF 2025.1.0 compatibility with .NET 10 final

---

### Phase 2: Growth (Months 4–7)

**Theme:** Complete Avalonia desktop, add persistence, wire dead views, release v0.5.

| # | Deliverable |
|---|---|
| 1 | Create MainWindowViewModel (ReactiveUI) and implement navigation stack with breadcrumbs and session-discarding confirmation |
| 2 | Wire BlueprintView: call LoadBlueprint on show, bind OnObjectiveClick to navigate to filtered questions |
| 3 | Wire StatsView: add sidebar button, replace hardcoded values with real ExamSessionViewModel data and domain breakdowns |
| 4 | Add SQLite-backed IProgressRepository: persist session results, wrong-answer history, per-question metadata (timestamp, correct/incorrect, time-to-answer) |
| 5 | Wire PDF export button to ExamPdfExporter (QuestPDF) with platform-abstracted save dialog via IFileProvider |
| 6 | Implement timed exam mode: countdown timer in ExamSessionViewModel, strict/no-backtrack option, comprehensive results summary |
| 7 | Add answer randomization (shuffle) to ExamSessionViewModel with seeded Random for reproducibility |
| 8 | Release v0.5: automated release.yml workflow triggered on tag push, cross-platform packaging (AppImage + DMG + MSI) in CI |

**Success Criteria:**
- All Avalonia views wired, data-bound, and navigable
- Session progress persists across app restarts via SQLite
- Timed exam mode produces results comparable to Pearson VUE-style exam day experience
- v0.5 release artifacts downloadable from GitHub Releases

**Dependencies:** SQLite provider for .NET 10; ReactiveUI Avalonia compat with 11.2.x; Phase 1 DI foundation

---

### Phase 3: Scale (Months 8–14)

**Theme:** Multi-question types, adaptive learning, mobile PWA, real analytics.

| # | Deliverable |
|---|---|
| 1 | Extend Question model with QuestionType enum (StandardMCQ, MultiSelect, Ordering, FillInTheBlank, ScenarioBased) and implement type-aware rendering in Avalonia |
| 2 | Implement SM-2 spaced repetition scheduler using per-question correctness history from IProgressRepository; add "Review Weak Areas" session mode |
| 3 | Build analytics dashboard: per-domain heat map, per-question time analysis, readiness score predicting pass probability, longitudinal trend charts |
| 4 | Make PWA the primary mobile frontend: responsive layout, touch-optimized option cards, bottom-tab navigation, offline-first with IndexedDB |
| 5 | Integrate lab simulator with quiz engine: wire CefBridge handlers (load_exam_list, submit_answer, get_stats, save_progress) to Core services |
| 6 | Implement question flagging / bookmarking with a review queue accessible before session submission |
| 7 | Add content versioning: version header in each .md file, content manifest with file checksums, migration framework for progress data across versions |
| 8 | Expand NCA-75 content to 240+ questions; refactor all GapFill sections to target under-covered blueprint objectives |

**Success Criteria:**
- At least 3 question types functional (MCQ, ordering, fill-in-blank)
- Spaced repetition scheduler surfaces weak-area questions with measured improvement in repeat-session accuracy
- PWA works fully on mobile browsers with responsive layout
- Lab simulator scenarios submit answers that count in quiz scoring

**Dependencies:** Content authoring capacity for new question types and NCA-80 expansion; Phase 2 persistence layer; PWA hosting infrastructure

---

### Phase 4: Enterprise (Months 15–24)

**Theme:** Multi-vendor, cloud backend, social features, enterprise readiness.

| # | Deliverable |
|---|---|
| 1 | Implement multi-vendor plugin architecture: IExamMetadataProvider, IBlueprintProvider, IReferenceProvider loaded from JSON manifests; add AWS-SAA, AZ-104 exam tracks |
| 2 | Build cloud API backend (ASP.NET Core) with user accounts, authentication (OAuth2/OIDC), per-profile progress storage, and cross-device sync |
| 3 | Add study-group features: shared sessions, leaderboards, competitive quiz modes, team progress dashboards |
| 4 | Implement comprehensive accessibility: WCAG 2.1 AA compliance, full screen reader support, keyboard-only navigation, high-contrast light theme |
| 5 | Add multi-format learning content: video lectures, flashcard decks, study notes with markdown editor |
| 6 | Build enterprise admin console: user management, license provisioning, SCORM/LTI integration for LMS embedding |
| 7 | Add SBOM generation (CycloneDX), CodeQL SAST in CI, pen-test hardening, SOC 2 Type I compliance groundwork |
| 8 | Vendor-validated question pools with psychometric analysis, difficulty calibration, and readiness-score certification |

**Success Criteria:**
- At least 3 non-Nutanix exam vendors loadable via plugin
- Cloud API supports 1,000+ concurrent users with <100ms p99 latency
- WCAG 2.1 AA audit passes with zero critical findings
- Enterprise customers can self-host or use SaaS with LMS integration

**Dependencies:** Cloud infrastructure budget; enterprise customer validation; psychometric expertise; Phase 3 mobile and content foundations

---

## 5. QUICK WINS

Actions achievable in under 1 week each, ordered by impact:

1. **Fix the AnswerRegex parser bug.** Change the source-generated regex from `^\*\*Answer:` to `^\*\*(?:Correct )?Answer:`. This immediately recovers 80 silently dropped NCP-CI questions (22% of the track). Single-line code change, zero risk.

2. **Fix DeriveExamCode for GapFill and D-suffix files.** Add `GapFill` and `D\d+` to the suffix-stripping regex. Recovers proper exam code classification for NCA-75-Part3-GapFill and NCP-US-Part2-D3/D4. Two-line regex change.

3. **Fix CI SDK version mismatch.** Change `actions/setup-dotnet` from `dotnet-version: 8.0.x` to `10.0.x` (or appropriate preview version). Update artifact paths from `net8.0` to `net10.0`. Without this, CI builds fail entirely.

4. **Correct the 3 wrong answer keys.** Edit NCA-75-Part1.md Q3 (upgrade order), NCA-75-Part3-GapFill Q3 (SSH default), and the PC max VMs question to reflect validated answers per DOC-REVIEW-REPORT.md. Direct content fix.

5. **Wire the PDF Export button.** Replace the empty `BtnExport_Click` handler in MainWindow.axaml.cs with a call to `ExamPdfExporter.GenerateExamPdf()` using the current session's questions. The QuestPDF implementation already exists in Core.

6. **Add content format linter to CI.** Write a 20-line Python or shell script that validates all .md files use `**Answer:**` format (not `**Correct Answer:**`) and that question counts match regex-based expectations. Add as a CI step.

7. **Remove the dead `_fileProvider` dependency from QuestionParser.** Delete the field, the constructor parameter, and any DI registration. It is unused and adds confusion. Zero functional impact.

8. **Stop mutating Question.Id in ExamSessionViewModel.** Replace the loop that reassigns `questions[i].Id = i + 1` with a `_displayIndex` dictionary mapping original IDs to display ordinals. Prevents cross-session model corruption.

9. **Fix the Flatpak manifest.** Replace `TheArchitectit/certforge.git` with `TheArchitectit/radicaltrainingplatform.git` and replace `REPLACE_WITH_COMMIT_SHA` with the latest commit hash. Also fix the AppImage script directory-creation ordering.

10. **Add SemVer to Directory.Build.props.** Centralize version from hardcoded AppStream/Info.plist values into a single `<Version>` property. Update packaging scripts to read from the assembly. Eliminates version drift across artifacts.

---

## 6. RISK REGISTER

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| 1 | **Parser silently drops questions on content format drift.** Any new .md file using "Correct Answer:" or a novel format variant will have all questions silently discarded with zero error reporting. | High | Critical | Add AnswerRegex variant matching (quick win) and content linter in CI (quick win). Add ParseResult with Warnings/SkippedQuestions. Surface parse health in UI. |
| 2 | **CI builds are broken.** .NET 8 SDK does not support net10.0 TFM. Every push/PR to main fails CI, meaning there is no automated quality gate. | Certain | Critical | Fix SDK version (quick win #3). This is a prerequisite for all other CI-dependent work. |
| 3 | **No test coverage means refactoring is high-risk.** The architectural changes required (DI extraction, persistence layer, ViewModel cleanup) cannot be done safely without regression protection. | High | High | Create Core.Tests project immediately (Phase 1, deliverable 4). Achieve 70%+ coverage before any major refactoring. |
| 4 | **ExamSessionViewModel mutates shared model objects.** If Question lists are ever shared across sessions or UI components, the ID reassignment corrupts data for other consumers. This will become a production bug when session persistence is added. | High | High | Stop mutating Question.Id (quick win #8). Introduce SessionQuestion wrapper with display-only ordinals. |
| 5 | **CefGlue dependency blocks mobile and may break on Avalonia updates.** CefGlue.Avalonia has no iOS/Android backend and is a niche package with limited maintenance. An Avalonia 12+ update could break it. | Medium | High | Define ILabSimulatorHost abstraction in Core. Desktop uses CefGlue; mobile uses native WebView. Long-term: consider the PWA as the primary experience and the Avalonia app as a desktop companion. |
| 6 | **Static service classes resist testing and extension.** BlueprintService and ReferenceService are 600+ line static registries with no interfaces. Adding a new exam vendor requires source modification of 3 files. This blocks multi-vendor expansion. | High | High | Extract interfaces in Phase 1. Migrate blueprint/reference data to JSON files loaded at runtime. This is a prerequisite for Phase 4. |
| 7 | **Wrong answer keys erode learner trust.** Three confirmed incorrect keys (upgrade order, SSH default, PC max VMs) means learners are penalized for correct knowledge. This is reputationally damaging for a study platform. | Certain | High | Correct the keys (quick win #4). Add errata.json override mechanism. Surface disputed-question warnings in the UI. |
| 8 | **No crash reporting in production.** Once the app reaches users, failures will be completely invisible. The CefGlue initialization, file discovery, PDF generation, and CefBridge all have unguarded failure modes. | High | Medium | Integrate Sentry SDK into Desktop apps and browser SDK into PWA. Add structured logging to Core. |
| 9 | **Content pipeline has no validation feedback loop.** Content authors have no way to discover that their .md files have formatting errors, wrong question counts, or misclassified exam codes until users report missing questions. | Medium | Medium | Build a content health dashboard (CLI tool or UI panel) showing per-file expected vs. parsed counts, format violations, and coverage gaps. Run in CI. |
| 10 | **.NET 10 is a preview/release-candidate framework.** net10.0 may have breaking changes between previews, and some NuGet packages (CefGlue, QuestPDF) may not be compatible at GA. | Medium | Medium | Pin exact SDK versions in CI and global.json. Maintain a net8.0 fallback target for Core if net10.0 issues arise. Test compatibility with each .NET 10 preview. |

---

*Generated by 11-agent workflow analysis — June 2026*
