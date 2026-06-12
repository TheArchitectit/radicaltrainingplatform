# Sprint 18: Analytics — Data Layer

**Phase:** Scale  
**Duration:** Week 35 - Week 36  
**Goal:** Build the data infrastructure for analytics: per-domain heat maps, time-per-question metrics, and readiness scoring.

---

## Summary

This sprint establishes the analytics data layer without touching UI. All metrics computed from existing IProgressRepository data plus new aggregations.

## Sprint Backlog (Summary)

| ID | Story | Points |
|---|---|---|
| S18-01 | Create AnalyticsRepository for computed metrics | 3 |
| S18-02 | Implement per-domain heat map data | 3 |
| S18-03 | Implement time-per-question analysis | 3 |
| S18-04 | Implement readiness score model | 5 |
| S18-05 | Add longitudinal trend calculation | 3 |
| S18-06 | Cache analytics results for performance | 2 |

**Total:** ~19 points

## Key Decisions

- **AnalyticsRepository:** New repository in Infrastructure layer; computes from SessionResults + QuestionResults + IBlueprintService
- **Heat map data:** Per-objective accuracy % over last N sessions; color-coded (red/yellow/green)
- **Time-per-question:** Median time per question; flag questions where user is consistently slow
- **Readiness score:** Weighted formula combining: overall accuracy (60%), domain coverage (20%), recency (10%), time consistency (10%)
- **Caching:** In-memory with 5-minute TTL; invalidated on new session save

## Dependencies

- S9-03 (persistence must have data to analyze)
- S3-03 (IBlueprintService needed for domain mapping)
- S8-05 (domain breakdown logic reusable)

## Risks

| Risk | Mitigation |
|---|---|
| Readiness score formula needs validation | Start simple; refine based on actual exam pass/fail data in Phase 4 |
| Analytics computations are slow on large histories | Pagination (last 50 sessions); caching; background computation |

## Definition of Done

- [ ] All analytics metrics computable from repository
- [ ] Caching prevents repeated expensive calculations
- [ ] Unit tests for readiness score formula
- [ ] Performance: analytics compute in < 1s for 1000+ question results
