# Sprint 16: Multi-Question Types — UI

**Phase:** Scale  
**Duration:** Week 31 - Week 32  
**Goal:** Implement type-aware rendering in Avalonia for Ordering and FillInTheBlank questions.

---

## Summary

This sprint wires the new question type models into the Avalonia UI with dedicated controls for each type.

## Sprint Backlog (Summary)

| ID | Story | Points |
|---|---|---|
| S16-01 | Create OrderingCard control with drag-drop | 5 |
| S16-02 | Create FillInTheBlank control with text input | 3 |
| S16-03 | Add type-aware rendering in QuestionView | 3 |
| S16-04 | Implement scoring for Ordering questions | 3 |
| S16-05 | Implement scoring for FillInTheBlank questions | 3 |
| S16-06 | Add keyboard accessibility for Ordering control | 2 |

**Total:** ~19 points

## Key Decisions

- **Ordering UI:** Draggable cards using Avalonia's built-in drag-drop; fallback to up/down buttons for accessibility
- **FillInTheBlank UI:** TextBox per blank with validation feedback (green/red border)
- **Scoring:** Ordering = exact sequence match; FillInTheBlank = case-insensitive substring match with configurable strictness
- **QuestionView:** Uses DataTemplateSelector or dynamic ContentControl based on QuestionType

## Dependencies

- S15-01 through S15-05 (models must exist)
- S7-01, S7-02 (MVVM and navigation must exist)

## Risks

| Risk | Mitigation |
|---|---|
| Avalonia drag-drop API changes or is limited | Fallback to button-based reordering; degrade gracefully |
| Fill-in-blank validation is ambiguous | Document validation rules; allow partial credit in future sprint |

## Definition of Done

- [ ] Ordering questions render with draggable items
- [ ] FillInTheBlank questions render with input fields
- [ ] All question types are scorable
- [ ] Keyboard navigation works for all question types
- [ ] No regressions in MCQ rendering
