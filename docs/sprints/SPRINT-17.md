# Sprint 17: Spaced Repetition Engine

**Phase:** Scale  
**Duration:** Week 33 - Week 34  
**Goal:** Implement an SM-2 spaced repetition scheduler to surface weak-area questions for review.

---

## Summary

Build the algorithm and infrastructure for spaced repetition review. The scheduler uses per-question correctness history to determine optimal review intervals.

## Sprint Backlog (Summary)

| ID | Story | Points |
|---|---|---|
| S17-01 | Implement SM-2 algorithm service | 5 |
| S17-02 | Add per-question repetition state to persistence | 3 |
| S17-03 | Create "Review Weak Areas" session mode | 3 |
| S17-04 | Add question difficulty metadata | 2 |
| S17-05 | Add scheduler to DI container | 1 |
| S17-06 | Write SM-2 algorithm tests | 3 |

**Total:** ~17 points

## Key Decisions

- **SM-2 algorithm:** Standard SuperMemo-2: interval = interval * ease_factor; ease_factor adjusted by quality of response (0-5)
- **Quality mapping:** Correct on first try = 5; Correct on retry = 4; Incorrect = 0-2
- **Repetition state per question:** ease_factor, interval_days, repetitions_count, next_review_date, last_review_date
- **"Review Weak Areas":** Filters questions where next_review_date <= today OR questions with < 60% accuracy
- **Difficulty metadata:** Per-question field (Easy/Medium/Hard) from content; influences initial ease_factor

## Dependencies

- S9-03 (persistence must store per-question results for scheduling)
- S15-01 (Question model may need difficulty field)
- S12-03 (review queue pattern reusable)

## Risks

| Risk | Mitigation |
|---|---|
| SM-2 parameters need tuning for exam context | Start with standard parameters; add telemetry for tuning in Phase 4 |
| Scheduler performance degrades with many questions | Pre-compute next_review_date; index the column |
| "Weak Areas" mode overwhelms user with too many questions | Cap at 30 questions; sort by urgency |

## Definition of Done

- [ ] SM-2 algorithm implemented and tested
- [ ] Per-question repetition state persisted
- [ ] "Review Weak Areas" mode creates appropriate session
- [ ] Scheduler integrated with DI
- [ ] Unit tests verify interval and ease factor calculations
