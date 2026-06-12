# Sprint 11: Timed Exam Mode

**Phase:** Growth  
**Duration:** Week 21 - Week 22  
**Goal:** Implement a timed exam mode that simulates the real certification exam day experience.

---

## Sprint Backlog

| ID | Story | Points | Assignee | Status |
|---|---|---|---|---|
| S11-01 | Add IsTimed and TimeLimitSeconds to ExamSessionViewModel | 2 | TBD | To Do |
| S11-02 | Implement countdown timer with Avalonia timer | 3 | TBD | To Do |
| S11-03 | Add timed mode UI — timer display, remaining time indicator | 3 | TBD | To Do |
| S11-04 | Implement strict mode (no backtracking, no changing answers) | 3 | TBD | To Do |
| S11-05 | Comprehensive results summary for timed sessions | 3 | TBD | To Do |

**Total:** 14 points

---

## User Stories

### S11-01: Add Timed Mode Properties to ExamSessionViewModel
**As a** learner, **I want** to choose a timed exam, **so that** I can practice under time pressure.

**Acceptance Criteria:**
- [ ] `IsTimed` boolean property added to `ExamSessionViewModel`
- [ ] `TimeLimitSeconds` int property added (default: 90 minutes = 5400s)
- [ ] `RemainingSeconds` observable property (decrements during exam)
- [ ] Constructor overload accepts `bool isTimed` and `int? timeLimitSeconds`
- [ ] `IsTimed` defaults to false (backward compatible)
- [ ] Unit tests for timed mode initialization

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Add timed properties to VM | `ExamSessionViewModel.cs` | 30 min | IsTimed, TimeLimitSeconds, RemainingSeconds |
| Add constructor overload | `ExamSessionViewModel.cs` | 20 min | Accept isTimed and timeLimit |
| Ensure backward compatibility | `ExamSessionViewModel.cs` | 15 min | Default untimed behavior |
| Update factory / DI registration | `Program.cs` | 10 min | If factory creates session VMs |
| Write timed mode init tests | Test project | 20 min | Verify properties set correctly |
| Verify build and tests | Solution | 10 min | `dotnet build && dotnet test` |

**Dependencies:** None (extends existing VM)

**References:** DESIGN-MATRIX-AND-ROADMAP.md Phase 2 Deliverable 6

---

### S11-02: Implement Countdown Timer
**As a** learner, **I want** a visible countdown during timed exams, **so that** I know how much time I have left.

**Acceptance Criteria:**
- [ ] Timer starts when first question is shown
- [ ] Timer decrements every second
- [ ] `RemainingSeconds` property is observable (UI auto-updates)
- [ ] Timer pauses if app goes to background (optional for v0.5)
- [ ] Timer reaches 0: auto-submit remaining questions
- [ ] Timer uses `DispatcherTimer` or `Avalonia.Threading.Timer` (UI thread safe)
- [ ] Unit tests for timer logic (use fake/test timer)

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Add timer field and start logic | `ExamSessionViewModel.cs` | 30 min | `DispatcherTimer` or custom timer abstraction |
| Implement countdown | `ExamSessionViewModel.cs` | 20 min | Decrement RemainingSeconds |
| Add auto-submit on timeout | `ExamSessionViewModel.cs` | 20 min | Call Submit() for unanswered questions |
| Add timer disposal | `ExamSessionViewModel.cs` | 15 min | Stop timer on session end/dispose |
| Abstract timer for testability | New file or interface | 20 min | `ITimer` interface so tests can fake time |
| Write timer tests | Test project | 30 min | Mock timer, verify countdown and timeout |
| Verify build and tests | Solution | 10 min | `dotnet build && dotnet test` |

**Dependencies:** S11-01 (timed mode properties must exist)

**References:** DESIGN-MATRIX-AND-ROADMAP.md Phase 2 Deliverable 6

---

### S11-03: Add Timed Mode UI
**As a** learner, **I want** to see the timer and time pressure indicators, **so that** I can pace myself.

**Acceptance Criteria:**
- [ ] Timer displayed prominently in QuestionView (top bar)
- [ ] Format: `MM:SS` or `HH:MM:SS`
- [ ] Color changes based on remaining time:
  - Green: > 50% remaining
  - Yellow: 25-50% remaining
  - Red: < 25% remaining
  - Flashing/pulsing: < 5% remaining
- [ ] Progress bar or ring showing elapsed time
- [ ] Timer hidden when not in timed mode
- [ ] Exam selector has "Timed Mode" toggle or option

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Add timer display to QuestionView | `Views/QuestionView.axaml` | 30 min | TextBlock bound to RemainingSeconds |
| Add timer converter for MM:SS | `Converters/TimeSpanConverter.cs` | 20 min | Convert seconds to formatted string |
| Add color trigger logic | `QuestionView.axaml` | 30 min | DataTrigger on remaining percentage |
| Add progress indicator | `QuestionView.axaml` | 20 min | ProgressBar or ProgressRing (custom synthwave style) |
| Add timed mode toggle to selector | `Views/ExamSelectorView.axaml` | 20 min | ToggleSwitch or CheckBox |
| Style per synthwave theme | Various axaml files | 20 min | Consistent timer colors with theme |
| Verify build and run | Solution | 15 min | Visual confirmation of timer UI |

**Dependencies:** S11-02 (timer logic must exist)

**References:** DESIGN-MATRIX-AND-ROADMAP.md Phase 2 Deliverable 6 (Pearson VUE-style experience)

---

### S11-04: Implement Strict Mode
**As a** learner, **I want** an option to simulate real exam constraints, **so that** I cannot change answers or go back.

**Acceptance Criteria:**
- [ ] `IsStrictMode` boolean property on ExamSessionViewModel (separate from IsTimed)
- [ ] In strict mode: `Previous()` button disabled or hidden
- [ ] In strict mode: once a question is submitted, answers are locked (cannot change)
- [ ] In strict mode: unanswered questions auto-submit when time expires
- [ ] Strict mode can be combined with timed mode or used independently
- [ ] UI clearly indicates strict mode is active

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Add IsStrictMode property | `ExamSessionViewModel.cs` | 15 min | Boolean, observable |
| Disable Previous in strict mode | `ExamSessionViewModel.cs` | 15 min | `CanGoPrevious` property |
| Lock answers after submit | `ExamSessionViewModel.cs` | 20 min | Ignore SelectAnswer after Submit in strict mode |
| Add strict mode toggle to selector | `Views/ExamSelectorView.axaml` | 15 min | CheckBox |
| Add strict mode indicator | `Views/QuestionView.axaml` | 15 min | Badge or icon when strict mode active |
| Write strict mode tests | Test project | 30 min | Verify Previous disabled, answers locked |
| Verify build and run | Solution | 15 min | Test strict + timed combo |

**Dependencies:** S11-01 (timed/strict mode properties)

**References:** DESIGN-MATRIX-AND-ROADMAP.md Phase 2 Deliverable 6

---

### S11-05: Comprehensive Results Summary for Timed Sessions
**As a** learner, **I want** detailed results after a timed exam, **so that** I understand my performance.

**Acceptance Criteria:**
- [ ] Results view shown after timed exam completion
- [ ] Results include:
  - Total score (correct / total)
  - Percentage score
  - Time taken vs time limit
  - Pass/Fail indicator (configurable threshold, default 70%)
  - Per-domain breakdown (accuracy per objective)
  - Questions answered vs unanswered
- [ ] Results saved to persistence layer
- [ ] Option to review wrong answers
- [ ] Option to export results (future: print certificate-style)

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Create ResultsViewModel | `ViewModels/ResultsViewModel.cs` | 1h | Properties for all result data |
| Create ResultsView | `Views/ResultsView.axaml` | 1h | Layout with score, breakdown, buttons |
| Calculate pass/fail | `ResultsViewModel.cs` | 15 min | Threshold check |
| Calculate per-domain accuracy | `ResultsViewModel.cs` | 30 min | Use IBlueprintService + IProgressRepository |
| Wire result persistence | `ResultsViewModel.cs` | 15 min | Save on view creation |
| Add "Review Wrong Answers" button | `ResultsView.axaml` | 15 min | Navigate to review session |
| Style per synthwave theme | `ResultsView.axaml` | 20 min | Big score display, accent colors |
| Write results view tests | Test project | 30 min | Verify calculations |
| Verify build and run | Solution | 15 min | Complete timed exam, verify results |

**Dependencies:** S9-04, S9-05 (persistence must exist to save results), S8-05 (domain breakdown logic)

**References:** DESIGN-MATRIX-AND-ROADMAP.md Phase 2 Deliverable 6 (Pearson VUE-style results)

---

## Sprint Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Timer UI updates cause performance issues | Medium | Medium | Use ReactiveUI throttling; update every second, not every frame |
| Strict mode combined with navigation stack causes confusion | Medium | Medium | Clear visual indicators; disable/hide non-strict UI elements |
| Auto-submit on timeout has timing edge cases | Low | High | Unit test thoroughly; fire event before timer reaches exactly 0 |
| Results calculations differ from actual scoring | Low | High | Use same scoring logic as ExamSessionViewModel; avoid duplicate calculation |

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Unit tests pass (>= 70% coverage on changed files)
- [ ] CI pipeline green
- [ ] Code reviewed
- [ ] Documentation updated

## Sprint Review Checklist

- [ ] Timed exam mode selectable from exam selector
- [ ] Countdown timer visible and accurate during exam
- [ ] Timer color changes at thresholds
- [ ] Strict mode prevents backtracking and answer changes
- [ ] Auto-submit fires on timeout
- [ ] Results view shows comprehensive summary
- [ ] Results persist after app restart
- [ ] No regressions in untimed mode
- [ ] Technical debt documented (if deferred)
