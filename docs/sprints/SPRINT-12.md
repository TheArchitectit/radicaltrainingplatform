# Sprint 12: Answer Randomization & Flagging

**Phase:** Growth  
**Duration:** Week 23 - Week 24  
**Goal:** Add answer shuffle and question flagging to enhance exam preparation and review workflows.

---

## Sprint Backlog

| ID | Story | Points | Assignee | Status |
|---|---|---|---|---|
| S12-01 | Add answer shuffle with seeded Random for reproducibility | 3 | TBD | To Do |
| S12-02 | Add IsFlagged property / question flagging state | 2 | TBD | To Do |
| S12-03 | Implement review queue for flagged questions | 3 | TBD | To Do |
| S12-04 | Add flag toggle UI in QuestionView | 2 | TBD | To Do |
| S12-05 | Add "Review Flagged" navigation before submission | 3 | TBD | To Do |

**Total:** 13 points

---

## User Stories

### S12-01: Add Answer Shuffle with Seeded Random
**As a** learner, **I want** answer options to be shuffled, **so that** I do not memorize positions instead of content.

**Acceptance Criteria:**
- [ ] `ShuffleOptions` boolean property on `ExamSessionViewModel`
- [ ] Random seed configurable (default based on date for reproducibility during review)
- [ ] Option order shuffled once per session (not on every view)
- [ ] Original option IDs preserved for submission (A->B shuffle does not change correct answer mapping)
- [ ] Shuffle can be disabled for "study mode" (show answers in original order)
- [ ] Same seed produces same shuffle (reproducible for review)
- [ ] Unit tests verify correct answer mapping after shuffle

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Add shuffle properties to VM | `ExamSessionViewModel.cs` | 20 min | ShuffleOptions, Seed |
| Implement Fisher-Yates shuffle | `ExamSessionViewModel.cs` | 30 min | Or use Random.Shuffle in .NET 10 |
| Preserve answer mapping | `ExamSessionViewModel.cs` | 30 min | Maintain original letter -> content mapping |
| Add shuffle toggle to selector | `Views/ExamSelectorView.axaml` | 15 min | CheckBox |
| Write shuffle tests | Test project | 30 min | Verify correct answer still correct after shuffle |
| Write seed reproducibility tests | Test project | 20 min | Same seed -> same order |
| Verify build and run | Solution | 15 min | Enable shuffle, verify correct answers work |

**Dependencies:** None (extends existing VM)

**References:** DESIGN-MATRIX-AND-ROADMAP.md Phase 2 Deliverable 7

---

### S12-02: Add IsFlagged Property
**As a** learner, **I want** to flag questions for later review, **so that** I can focus on uncertain items.

**Acceptance Criteria:**
- [ ] `IsFlagged` boolean property added to `Question` or session state (not mutating Question — use wrapper or dictionary)
- [ ] Flag state per question persists during session
- [ ] Flag state saved with session results (if IProgressRepository supports it)
- [ ] Flag state queryable: `GetFlaggedQuestions()` method
- [ ] Does not mutate original `Question` object (use session-level dictionary)

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Add flag state dictionary to VM | `ExamSessionViewModel.cs` | 20 min | `Dictionary<Question, bool> _flaggedState` |
| Add ToggleFlag method | `ExamSessionViewModel.cs` | 15 min | Toggle flag for current question |
| Add IsCurrentQuestionFlagged property | `ExamSessionViewModel.cs` | 15 min | Observable, bound to UI |
| Add GetFlaggedQuestions method | `ExamSessionViewModel.cs` | 15 min | Return list of flagged questions |
| Persist flag state | `SqliteProgressRepository.cs` | 20 min | Add flagged column or JSON field to QuestionResult |
| Write flag state tests | Test project | 20 min | Toggle, query, persistence |
| Verify build and run | Solution | 10 min | Test flagging flow |

**Dependencies:** S1-05 (Question must not be mutated), S9-05 (persistence for saving flag state)

**References:** DESIGN-MATRIX-AND-ROADMAP.md Phase 2 Deliverable 6 (question flagging)

---

### S12-03: Implement Review Queue for Flagged Questions
**As a** learner, **I want** to review only my flagged questions, **so that** I can focus on weak areas.

**Acceptance Criteria:**
- [ ] "Review Flagged" session mode: create new ExamSessionViewModel with only flagged questions
- [ ] Review mode clearly labeled in UI
- [ ] Flagged questions can be unflagged during review
- [ ] Review session results saved separately (tagged as "review")
- [ ] Review mode accessible from exam selector and results view
- [ ] If no flagged questions, show informative message

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Add review mode support | `ExamSessionViewModel.cs` | 30 min | Accept "isReview" flag |
| Add ReviewFlagged method to ViewModel | `MainWindowViewModel.cs` | 30 min | Fetch flagged from persistence, create review session |
| Add review mode to IProgressRepository | `IProgressRepository.cs` | 15 min | Query flagged questions method |
| Implement GetFlaggedQuestions in repo | `SqliteProgressRepository.cs` | 30 min | SELECT WHERE flagged or from history |
| Add review UI label | `Views/QuestionView.axaml` | 15 min | "Review Mode" badge |
| Write review queue tests | Test project | 30 min | Verify review session creation |
| Verify build and run | Solution | 15 min | Flag questions, start review, verify |

**Dependencies:** S12-02 (flagging must exist), S9-03 (persistence must support querying)

**References:** DESIGN-MATRIX-AND-ROADMAP.md Phase 2 Deliverable 6

---

### S12-04: Add Flag Toggle UI
**As a** learner, **I want** an easy way to flag/unflag questions during an exam, **so that** I can mark items for review.

**Acceptance Criteria:**
- [ ] Flag button/icon in QuestionView (e.g., bookmark/flag icon)
- [ ] Toggle state: unfilled = not flagged, filled = flagged
- [ ] Visual feedback on toggle (animation optional for v0.5)
- [ ] Keyboard shortcut for flagging (e.g., F key or Ctrl+Space)
- [ ] Tooltip: "Flag for review" / "Unflag"
- [ ] Flag state persists when navigating Next/Previous

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Add flag button to QuestionView | `Views/QuestionView.axaml` | 30 min | Icon button in toolbar |
| Bind to IsCurrentQuestionFlagged | `Views/QuestionView.axaml` | 15 min | Two-way or command binding |
| Add toggle command | `QuestionView.axaml.cs` or ViewModel | 15 min | Call ExamSessionViewModel.ToggleFlag |
| Add synthwave-styled flag icon | `Views/QuestionView.axaml` | 20 min | Use PathGeometry or icon font |
| Add keyboard shortcut | `MainWindow.axaml` or ViewModel | 15 min | KeyBinding for flag toggle |
| Add tooltip | `Views/QuestionView.axaml` | 5 min | ToolTip.Tip |
| Verify build and run | Solution | 15 min | Click flag, verify state persists |

**Dependencies:** S12-02 (flagging state must exist)

**References:** DESIGN-MATRIX-AND-ROADMAP.md Phase 2 Deliverable 6

---

### S12-05: Add "Review Flagged" Navigation Before Submission
**As a** learner, **I want** the option to review flagged questions before submitting, **so that** I can double-check uncertain answers.

**Acceptance Criteria:**
- [ ] When user clicks "Submit Exam", if flagged questions exist, show a dialog/prompt
- [ ] Dialog shows count of flagged questions
- [ ] Options: "Submit Now", "Review Flagged First"
- [ ] "Review Flagged First" navigates to first flagged question
- [ ] After reviewing all flagged questions, offer submit again
- [ ] Dialog styled per synthwave theme
- [ ] If no flagged questions, submit immediately (no dialog)

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Create pre-submit dialog | `Views/PreSubmitDialog.axaml` | 30 min | Message + two buttons |
| Add submit interception | `MainWindowViewModel.cs` | 30 min | Check flagged count before completing |
| Add flagged count check | `ExamSessionViewModel.cs` | 15 min | `HasFlaggedQuestions` property |
| Add "review then submit" flow | `MainWindowViewModel.cs` | 30 min | Navigate to flagged, then resume submit flow |
| Style dialog | `PreSubmitDialog.axaml` | 20 min | Synthwave theme |
| Write dialog flow tests | Test project | 30 min | Mock dialog, verify flow choices |
| Verify build and run | Solution | 15 min | Flag questions, submit, verify dialog |

**Dependencies:** S12-02, S12-04 (flagging must be functional)

**References:** DESIGN-MATRIX-AND-ROADMAP.md Phase 2 Deliverable 6

---

## Sprint Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Answer shuffle breaks correct answer validation | Low | Critical | Extensive unit tests for answer mapping; integration test with shuffled session |
| Flag state lost on session navigation | Medium | Medium | Store flags in session dictionary, not question model; test navigation persistence |
| Pre-submit dialog interrupts natural flow | Low | Low | Make optional; user preference to skip |
| Seeded random not cross-platform consistent | Low | Medium | Use deterministic SimpleRandom or document platform differences |

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Unit tests pass (>= 70% coverage on changed files)
- [ ] CI pipeline green
- [ ] Code reviewed
- [ ] Documentation updated

## Sprint Review Checklist

- [ ] Answer shuffle works and correct answers still validate properly
- [ ] Questions can be flagged and unflagged via UI
- [ ] Flag state persists during navigation (Next/Previous)
- [ ] Pre-submit review dialog appears when flagged questions exist
- [ ] Review flagged mode creates session with only flagged questions
- [ ] No regressions in existing functionality
- [ ] Technical debt documented (if deferred)
