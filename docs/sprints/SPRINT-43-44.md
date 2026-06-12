# Sprints 43-44: Psychometric Analysis

**Phase:** Enterprise  
**Duration:** Weeks 85-88 (4 weeks)  
**Goal:** Validate question quality with psychometric analysis, difficulty calibration, and readiness-score certification.

---

## Summary

Transform the readiness score from an estimate into a statistically validated prediction of exam success. Add question difficulty calibration and vendor validation.

## Key Deliverables

| ID | Deliverable | Points |
|---|---|---|
| S43-01 | Implement Item Response Theory (IRT) basic model | 4 |
| S43-02 | Calibrate question difficulty from user performance data | 3 |
| S43-03 | Implement confidence intervals on readiness scores | 3 |
| S43-04 | Add question discrimination metrics | 3 |
| S43-05 | Create vendor validation program framework | 2 |
| S43-06 | Add "certified" readiness badge (statistically validated) | 2 |
| S43-07 | Implement longitudinal tracking for calibration | 2 |
| S43-08 | Document psychometric methodology | 2 |

**Total:** ~21 points over 2 sprints

## Key Decisions

- **IRT model:** 1-parameter (Rasch) or 2-parameter logistic; start with Rasch for simplicity
- **Difficulty calibration:** Based on % correct across all users; recalculated monthly
- **Readiness certification:** Score >= 85% with confidence interval 95% -> "Certified Ready"
- **Vendor validation:** Framework for exam vendors to certify our question pools match their blueprints
- **Data privacy:** Aggregate statistics only; no individual data shared with vendors

## Dependencies

- S18-04 (readiness score model from Phase 3)
- S9-03 (per-question performance data for calibration)
- Phase 3 stable (large enough user base for meaningful statistics)

## Risks

| Risk | Mitigation |
|---|---|
| Psychometric expertise is specialized | Partner with psychometrician; use established libraries |
| Insufficient user data for reliable calibration | Defer to Phase 4 end; start with heuristic difficulty |
| Vendors unwilling to validate | Offer free data in exchange for endorsement |
| Calibration changes question ordering dramatically | Phase in gradually; A/B test impact on learning |

## Definition of Done (Phase 4)

- [ ] At least 3 non-Nutanix exam vendors loadable via plugin
- [ ] Cloud API supports 1,000+ concurrent users with <100ms p99 latency
- [ ] WCAG 2.1 AA audit passes with zero critical findings
- [ ] Enterprise customers can self-host or use SaaS with LMS integration
- [ ] v2.0 tagged and released
