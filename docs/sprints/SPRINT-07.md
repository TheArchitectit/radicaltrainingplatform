# Sprint 7: Navigation & MVVM

**Phase:** Growth  
**Duration:** Week 13 - Week 14  
**Goal:** Implement ReactiveUI-based navigation with a proper ViewModel hierarchy and session-discard confirmation.

---

## Sprint Backlog

| ID | Story | Points | Assignee | Status |
|---|---|---|---|---|
| S7-01 | Create MainWindowViewModel with ReactiveUI | 5 | TBD | To Do |
| S7-02 | Implement ReactiveUI routing / navigation stack | 5 | TBD | To Do |
| S7-03 | Add breadcrumb navigation with session state awareness | 3 | TBD | To Do |
| S7-04 | Session-discard confirmation dialog | 2 | TBD | To Do |

**Total:** 15 points

---

## User Stories

### S7-01: Create MainWindowViewModel with ReactiveUI
**As a** user, **I want** a proper ViewModel driving the main window, **so that** the UI is testable and navigation is state-driven.

**Acceptance Criteria:**
- [ ] `MainWindowViewModel.cs` created in Desktop project
- [ ] Inherits from `ReactiveObject` or `ViewModelBase`
- [ ] Exposes `ObservableCollection<ViewModelBase> NavigationStack` or equivalent
- [ ] Exposes `ViewModelBase CurrentView` that the UI binds to
- [ ] Handles navigation commands: `GoToExamSelector`, `GoToExamSession`, `GoToBlueprint`, `GoToStats`
- [ ] Receives `IServiceProvider` via constructor for service resolution
- [ ] Unit tests for navigation commands
- [ ] MainWindow.axaml DataContext bound to MainWindowViewModel

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Install ReactiveUI packages | Desktop.csproj | 15 min | `ReactiveUI`, `Avalonia.ReactiveUI` |
| Create MainWindowViewModel | `RadicalTrainingPlatform.Desktop/ViewModels/MainWindowViewModel.cs` | 2h | ReactiveObject, navigation commands, service provider |
| Add ViewModel folder to Desktop | `ViewModels/` | 5 min | Namespace organization |
| Bind MainWindow DataContext | `MainWindow.axaml` / `.axaml.cs` | 30 min | Set DataContext in constructor |
| Write VM unit tests | Test project | 1h | Test navigation state transitions |
| Verify build and run | Solution | 15 min | App launches, no crashes |

**Dependencies:** S3-06 (DI container must exist), S6-07 (v0.1 stable base)

**References:** DESIGN-PLAN.md Section 2.1 (Application Layer), DESIGN-MATRIX-AND-ROADMAP.md Phase 2 Deliverable 1

---

### S7-02: Implement ReactiveUI Routing / Navigation Stack
**As a** user, **I want** a navigation stack with back support, **so that** I can move between views naturally.

**Acceptance Criteria:**
- [ ] `NavigationService` class created for routing management
- [ ] Push navigation: add view to stack, show it
- [ ] Pop navigation: remove current view, show previous
- [ ] Replace navigation: replace current view without adding to history
- [ ] Navigation stack observable so UI can show/hide back button
- [ ] CanGoBack property exposed on MainWindowViewModel
- [ ] All existing view transitions (exam -> question -> blueprint -> stats) use new routing
- [ ] Back button functional in UI

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Create NavigationService | `RadicalTrainingPlatform.Desktop/Services/NavigationService.cs` | 1.5h | Push/Pop/Replace with ReactiveUI observables |
| Integrate with MainWindowViewModel | `MainWindowViewModel.cs` | 30 min | Delegate navigation to service |
| Update MainWindow.axaml for routing | `MainWindow.axaml` | 30 min | ContentPresenter bound to CurrentView |
| Add back button UI | `MainWindow.axaml` | 15 min | Visible when CanGoBack |
| Update all navigation call sites | Various Desktop files | 30 min | Replace direct Content= with navigation service |
| Write navigation tests | Test project | 30 min | Push, Pop, Replace, CanGoBack |
| Verify build and run | Solution | 15 min | Full navigation flow |

**Dependencies:** S7-01 (MainWindowViewModel must exist)

**References:** DESIGN-MATRIX-AND-ROADMAP.md Phase 2 Deliverable 1

---

### S7-03: Add Breadcrumb Navigation with Session State Awareness
**As a** user, **I want** breadcrumbs showing my current location, **so that** I understand where I am in the app.

**Acceptance Criteria:**
- [ ] Breadcrumb control or representation added to MainWindow
- [ ] Breadcrumbs show path: e.g., "Home > NCA-75 > Question 5 of 60"
- [ ] Breadcrumb updates as navigation stack changes
- [ ] Breadcrumb is session-aware: shows exam code when in exam
- [ ] Breadcrumb items are clickable where navigation makes sense
- [ ] Breadcrumb hidden when not in a nested view

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Add BreadcrumbItems to MainWindowViewModel | `MainWindowViewModel.cs` | 30 min | Observable collection of breadcrumb entries |
| Create breadcrumb UI element | `MainWindow.axaml` | 30 min | Horizontal ItemsControl or custom control |
| Bind breadcrumbs to navigation | `MainWindowViewModel.cs` | 30 min | Derive from navigation stack + session state |
| Style breadcrumbs per theme | `MainWindow.axaml` or Styles | 20 min | Synthwave colors, separators |
| Write breadcrumb tests | Test project | 20 min | Navigation changes -> breadcrumb updates |
| Verify build and run | Solution | 15 min | Visual confirmation |

**Dependencies:** S7-01, S7-02 (ViewModel and navigation must exist)

**References:** DESIGN-MATRIX-AND-ROADMAP.md Phase 2 Deliverable 1

---

### S7-04: Session-Discard Confirmation Dialog
**As a** user, **I want** a confirmation before abandoning an active exam session, **so that** I do not accidentally lose progress.

**Acceptance Criteria:**
- [ ] When navigating away from an active exam session, a confirmation dialog appears
- [ ] Dialog asks: "You have an active exam session. Discard progress?"
- [ ] Options: "Continue Session" (cancel navigation), "Discard" (proceed)
- [ ] Dialog uses Avalonia's `Window.ShowDialog` or `IMessageBox` approach
- [ ] No confirmation if session is already submitted/completed
- [ ] Dialog styled to match synthwave theme
- [ ] Behavior tested: cancel preserves session, discard allows navigation

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Create confirmation dialog | `RadicalTrainingPlatform.Desktop/Views/ConfirmDialog.axaml` | 30 min | Simple dialog with two buttons |
| Add session state check to navigation | `NavigationService.cs` or `MainWindowViewModel.cs` | 30 min | Before Pop/Replace, check if active session |
| Integrate dialog in navigation flow | `MainWindowViewModel.cs` | 30 min | Show dialog, await result, then navigate |
| Style dialog per theme | `ConfirmDialog.axaml` | 20 min | Synthwave colors, Inter font |
| Write discard tests | Test project | 20 min | Mock dialog result, verify navigation behavior |
| Verify build and run | Solution | 15 min | Manual test of discard flow |

**Dependencies:** S7-01, S7-02 (navigation must exist to intercept)

**References:** DESIGN-MATRIX-AND-ROADMAP.md Phase 2 Deliverable 1

---

## Sprint Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| ReactiveUI learning curve causes delays | Medium | High | Spike in S6 if needed; reference Avalonia.ReactiveUI samples |
| Avalonia.ReactiveUI incompatible with .NET 10 | Low | High | Test compatibility in S6 before committing; have manual routing fallback |
| Navigation state becomes inconsistent | Medium | Medium | Comprehensive unit tests for state transitions; use typed navigation commands |
| Dialog styling looks out of place | Low | Low | Reuse existing theme resources; consistent palette |

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Unit tests pass (>= 70% coverage on changed files)
- [ ] CI pipeline green
- [ ] Code reviewed
- [ ] Documentation updated

## Sprint Review Checklist

- [ ] App launches with MainWindowViewModel driving UI
- [ ] Navigation between all views works (exam selector, questions, blueprint, stats)
- [ ] Back button appears and works when navigation stack has history
- [ ] Breadcrumbs update with navigation
- [ ] Session discard dialog appears when leaving active exam
- [ ] No regressions in existing functionality
- [ ] Technical debt documented (if deferred)
