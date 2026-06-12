# Sprint 15: Multi-Question Types — Models

**Phase:** Scale  
**Duration:** Week 29 - Week 30  
**Goal:** Extend the Question model to support multiple question types beyond MCQ.

---

## Summary

This sprint focuses on domain model changes to support richer question types. Only the data models and parsing infrastructure change — the UI remains MCQ-only until Sprint 16.

## Sprint Backlog (Summary)

| ID | Story | Points |
|---|---|---|
| S15-01 | Add QuestionType enum | 3 |
| S15-02 | Add OrderingQuestion model | 3 |
| S15-03 | Add FillInTheBlankQuestion model | 3 |
| S15-04 | Extend QuestionParser for type detection | 5 |
| S15-05 | Add type-aware validation in content linter | 2 |

**Total:** ~16 points

## Key Decisions

- **QuestionType enum:** `StandardMCQ`, `MultiSelect`, `Ordering`, `FillInTheBlank`, `ScenarioBased`
- **OrderingQuestion:** Holds `List<string>` items and correct order (e.g., `["A","C","B","D"]`)
- **FillInTheBlankQuestion:** Holds `List<(string BlankId, string CorrectAnswer)>` with inline markers
- **Parser type detection:** Pattern matching in markdown (e.g., `**Order:**` header, `[___]` blanks)
- **Backward compatibility:** All existing MCQ content parses as `StandardMCQ` or `MultiSelect`

## Dependencies

- S1-01, S1-02 (parser must be stable)
- S2-02 (parser tests protect changes)

## Risks

| Risk | Mitigation |
|---|---|
| Type detection regexes are fragile | Extensive test coverage; content linter enforces format |
| Model polymorphism complicates serialization | Use discriminator field (string Type) in JSON; avoid true polymorphism in DB |

## Definition of Done

- [ ] All new question types parse correctly from markdown
- [ ] Existing MCQ tests still pass (no regression)
- [ ] Content linter validates type markers
- [ ] Models are immutable (init-only properties)
