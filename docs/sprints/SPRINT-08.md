# Sprint 8: Wire Dead Views

**Phase:** Growth  
**Duration:** Week 15 - Week 16  
**Goal:** Connect BlueprintView and StatsView to real data and add navigation to previously unreachable views.

---

## Sprint Backlog

| ID | Story | Points | Assignee | Status |
|---|---|---|---|---|
| S8-01 | Wire BlueprintView — call LoadBlueprint on show, pass exam code | 3 | TBD | To Do |
| S8-02 | Wire BlueprintCanvas to coverage data from IBlueprintService | 3 | TBD | To Do |
| S8-03 | Add sidebar "Stats" button for navigation | 2 | TBD | To Do |
| S8-04 | Wire StatsView to real ExamSessionViewModel data | 3 | TBD | To Do |
| S8-05 | Replace hardcoded StatsView values with domain breakdowns | 2 | TBD | To Do |
| S8-06 | Add sidebar "Reference" navigation | 2 | TBD | To Do |

**Total:** 15 points

---

## User Stories

### S8-01: Wire BlueprintView
**As a** user, **I want** the blueprint view to show real coverage data when I open it, **so that** I can track my study progress against exam objectives.

**Acceptance Criteria:**
- [ ] `BlueprintView` constructor accepts `IBlueprintService` and exam code
- [ ] When BlueprintView is shown, `LoadBlueprint()` is called with the current exam code
- [ ] `MainWindowViewModel` passes current exam code when navigating to BlueprintView
- [ ] BlueprintView handles null/empty exam code gracefully
- [ ] Blueprint data loads within 500ms (no blocking UI)
- [ ] Navigation to BlueprintView works from exam selector and during exam

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Update BlueprintView constructor | `Views/BlueprintView.axaml.cs` | 30 min | Accept `IBlueprintService` and `string examCode` |
| Call LoadBlueprint on show | `BlueprintView.axaml.cs` | 20 min | In constructor or OnAttachedToVisualTree |
| Update MainWindowViewModel navigation | `MainWindowViewModel.cs` | 20 min | Pass exam code when creating BlueprintView |
| Handle null exam code | `BlueprintView.axaml.cs` | 15 min | Show empty state or message |
| Write BlueprintView tests | Test project | 30 min | Mock IBlueprintService, verify LoadBlueprint called |
| Verify build and run | Solution | 15 min | Manual test of BlueprintView |

**Dependencies:** S3-03 (HardcodedBlueprintService exists), S7-02 (navigation stack exists)

**References:** DESIGN-PLAN.md Finding 8 (BlueprintView never loads data)

---

### S8-02: Wire BlueprintCanvas to Coverage Data
**As a** user, **I want** the blueprint canvas to visualize my coverage, **so that** I can see which objectives I've studied.

**Acceptance Criteria:**
- [ ] `BlueprintCanvas.LoadBlueprint()` receives coverage data from `IBlueprintService.CalculateCoverage()`
- [ ] Canvas renders objectives with color-coded coverage levels:
  - High coverage (> 2 questions): Green/synthwave accent
  - Medium coverage (1-2 questions): Yellow/warning
  - No coverage: Dim/gray
- [ ] Canvas is responsive (scales with container)
- [ ] Clicking an objective navigates to filtered questions (if available)
- [ ] Canvas legend visible

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Update LoadBlueprint signature | `Controls/BlueprintCanvas.cs` | 20 min | Accept coverage dictionary |
| Integrate CalculateCoverage | `BlueprintView.axaml.cs` | 30 min | Call IBlueprintService.CalculateCoverage with session questions |
| Implement color coding | `BlueprintCanvas.cs` | 30 min | Convert coverage count to brush/color |
| Add click handler for objectives | `BlueprintCanvas.cs` | 30 min | Raise event or command for navigation |
| Style legend | `BlueprintView.axaml` or canvas | 20 min | Synthwave-themed legend |
| Write canvas rendering tests | Test project | 30 min | Verify color mapping logic |
| Verify build and run | Solution | 15 min | Visual confirmation |

**Dependencies:** S8-01 (BlueprintView must load data first)

**References:** DESIGN-PLAN.md Finding 8, DESIGN-MATRIX-AND-ROADMAP.md Phase 2 Deliverable 2

---

### S8-03: Add Sidebar "Stats" Button for Navigation
**As a** user, **I want** a stats button in the sidebar, **so that** I can access study statistics.

**Acceptance Criteria:**
- [ ] Sidebar contains a "Stats" button with appropriate icon
- [ ] Clicking Stats button navigates to StatsView
- [ ] Button is styled consistently with other sidebar buttons
- [ ] Stats button state reflects whether stats are available (has session history)
- [ ] Keyboard shortcut accessible

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Add Stats button to sidebar | `MainWindow.axaml` | 20 min | Button with icon in sidebar panel |
| Add OnStatsClicked handler | `MainWindow.axaml.cs` or ViewModel | 15 min | Navigate to StatsView |
| Style per theme | `MainWindow.axaml` or theme file | 15 min | Consistent with Exam, Blueprint buttons |
| Wire command in ViewModel | `MainWindowViewModel.cs` | 10 min | ReactiveCommand for stats navigation |
| Add keyboard shortcut | `MainWindow.axaml` | 10 min | KeyGesture binding |
| Verify build and run | Solution | 10 min | Click button, verify navigation |

**Dependencies:** S7-02 (navigation must exist)

**References:** DESIGN-PLAN.md Finding 9 (StatsView unreachable)

---

### S8-04: Wire StatsView to Real ExamSessionViewModel Data
**As a** user, **I want** the stats view to show real data from my sessions, **so that** I can track my actual progress.

**Acceptance Criteria:**
- [ ] `StatsView` accepts `ExamSessionViewModel` or session results data
- [ ] All hardcoded values replaced with real bindings
- [ ] Stats shown:
  - Total questions answered
  - Correct count / percentage
  - Wrong count / percentage
  - Session duration (if available)
  - Exam code
- [ ] Stats update when session data changes
- [ ] Empty state shown when no sessions completed

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Audit StatsView hardcoded values | `Views/StatsView.axaml` | 15 min | Identify all hardcoded numbers |
| Replace with bindings | `StatsView.axaml` / `.axaml.cs` | 1h | `{Binding CorrectCount}`, `{Binding CorrectPercentage}`, etc. |
| Create view model for stats | `ViewModels/StatsViewModel.cs` | 30 min | If needed for aggregation |
| Add DataContext wiring | `StatsView.axaml.cs` | 15 min | Accept and bind to data |
| Add empty state | `StatsView.axaml` | 15 min | Message when no sessions |
| Write stats binding tests | Test project | 30 min | Verify bindings update with data changes |
| Verify build and run | Solution | 15 min | Complete exam, verify stats |

**Dependencies:** S8-03 (Stats button must be navigable), S7-01 (MVVM structure)

**References:** DESIGN-PLAN.md Finding 9, DESIGN-MATRIX-AND-ROADMAP.md Phase 2 Deliverable 3

---

### S8-05: Replace Hardcoded StatsView Values with Domain Breakdowns
**As a** user, **I want** per-domain statistics, **so that** I know which knowledge areas need more study.

**Acceptance Criteria:**
- [ ] StatsView shows per-blueprint-objective breakdown
- [ ] Each objective displays: name, questions answered, accuracy percentage
- [ ] Objectives sorted by accuracy (weakest first)
- [ ] Visual indicator (color) for weak areas (< 60% accuracy)
- [ ] Domain breakdown sourced from `IBlueprintService.GetObjectivesForQuestion()`

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Add domain breakdown calculation | `StatsViewModel.cs` or service | 1h | Aggregate per-objective from session data |
| Create objective stats UI | `StatsView.axaml` | 30 min | List or grid with columns |
| Implement sorting | ViewModel | 20 min | OrderBy accuracy ascending |
| Add color indicators | `StatsView.axaml` | 20 min | Red/orange for < 60%, green for >= 80% |
| Write domain breakdown tests | Test project | 30 min | Verify aggregation logic |
| Verify build and run | Solution | 15 min | Complete exam, inspect domain breakdown |

**Dependencies:** S8-04 (StatsView must show real data first)

**References:** DESIGN-MATRIX-AND-ROADMAP.md Phase 2 Deliverable 3

---

### S8-06: Add Sidebar "Reference" Navigation
**As a** user, **I want** a reference button in the sidebar, **so that** I can access knowledge base links and general resources.

**Acceptance Criteria:**
- [ ] Sidebar contains a "Reference" button with appropriate icon
- [ ] Clicking opens a reference panel or view
- [ ] Panel shows general resources (links to Nutanix docs, etc.)
- [ ] Panel shows exam-specific references when in an exam
- [ ] Panel styled per synthwave theme
- [ ] Resources open in browser or display as text

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Add Reference button to sidebar | `MainWindow.axaml` | 15 min | Next to Stats button |
| Create ReferencePanel or view | `Views/ReferencePanel.axaml` | 30 min | List of links/resources |
| Integrate IReferenceService | `ReferencePanel.axaml.cs` | 20 min | Call GetGeneralResources, GetReferenceForQuestion |
| Add hyperlink opening | `ReferencePanel.axaml.cs` | 15 min | `Process.Start` or Avalonia launcher |
| Style per theme | `ReferencePanel.axaml` | 15 min | Synthwave link colors |
| Verify build and run | Solution | 10 min | Click reference, verify links show |

**Dependencies:** S3-04 (IReferenceService / HardcodedReferenceService), S7-02 (navigation)

**References:** DESIGN-MATRIX-AND-ROADMAP.md Phase 2 (reference service usage)

---

## Sprint Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| BlueprintCanvas rendering is slow or buggy | Medium | Medium | Profile rendering; consider virtualization for many objectives |
| StatsView data binding causes UI freezes | Low | Medium | Use async loading; ReactiveUI bindings handle this well |
| Domain breakdown calculation is expensive | Low | Medium | Cache results; calculate only when stats view is shown |
| Reference links require OS-specific handling | Medium | Low | Use `Process.Start` with cross-platform URL handling |

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Unit tests pass (>= 70% coverage on changed files)
- [ ] CI pipeline green
- [ ] Code reviewed
- [ ] Documentation updated

## Sprint Review Checklist

- [ ] BlueprintView shows real coverage data with color coding
- [ ] Stats button navigates to StatsView with real session data
- [ ] Domain breakdown shows per-objective accuracy
- [ ] Reference panel shows exam-appropriate resources
- [ ] All previously dead views are reachable and functional
- [ ] No regressions in existing functionality
- [ ] Technical debt documented (if deferred)
