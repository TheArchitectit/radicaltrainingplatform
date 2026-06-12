# Sprint 24: Content Expansion

**Phase:** Scale  
**Duration:** Week 47 - Week 48  
**Goal:** Expand NCA-75 content to 240+ questions and refactor gap-fill sections.

---

## Summary

Content authoring sprint focused on expanding the Nutanix NCA-75 exam track and improving gap-fill question coverage.

## Sprint Backlog (Summary)

| ID | Story | Points |
|---|---|---|
| S24-01 | Audit NCA-75 coverage gaps against blueprint | 3 |
| S24-02 | Author 80+ new MCQ questions for weak areas | 5 |
| S24-03 | Refactor gap-fill sections for blueprint alignment | 3 |
| S24-04 | Add ordering/sequence questions for procedure steps | 3 |
| S24-05 | Validate all new content parses correctly | 2 |
| S24-06 | Update content linter for new question types | 2 |

**Total:** ~18 points

## Key Decisions

- **Coverage audit:** Use IBlueprintService to identify objectives with < 2 questions
- **New questions:** Focus on under-represented blueprint sections
- **Gap-fill refactoring:** Convert some procedural gap-fill to ordering questions (more interactive)
- **Validation:** All new content must pass linter before merge

## Dependencies

- S15-01 (QuestionType enum must support ordering/fill-in-blank)
- S15-04 (parser must handle new types)
- S23-01 (version headers on new content)

## Risks

| Risk | Mitigation |
|---|---|
| Content authoring is slower than expected | Start early; content work can begin in parallel during S15 |
| New questions introduce fact errors | Peer review; errata.json for post-hoc corrections |
| Authoring capacity limited | Consider community contributions; document contribution guidelines |

## Definition of Done

- [ ] NCA-75 track has >= 240 questions
- [ ] All new content passes linter
- [ ] Coverage gaps documented and filled
- [ ] Version headers present on all modified files
