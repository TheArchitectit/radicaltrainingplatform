# Sprint 19: Analytics — UI

**Phase:** Scale  
**Duration:** Week 37 - Week 38  
**Goal:** Visualize analytics data with heat maps, trend charts, and a readiness dashboard.

---

## Summary

Build the analytics dashboard UI that consumes the data layer from Sprint 18.

## Sprint Backlog (Summary)

| ID | Story | Points |
|---|---|---|
| S19-01 | Create AnalyticsDashboard view | 3 |
| S19-02 | Implement heat map visualization (grid of objectives) | 5 |
| S19-03 | Add trend charts (session over session accuracy) | 5 |
| S19-04 | Add readiness score display with color indicator | 2 |
| S19-05 | Add per-question time distribution chart | 3 |
| S19-06 | Add analytics navigation from sidebar | 1 |

**Total:** ~19 points

## Key Decisions

- **Charts:** Use lightweight charting library (e.g., Avalonia-based OxyPlot or LiveCharts) or custom-rendered Canvas
- **Heat map:** Grid with colored cells; hover for objective name and accuracy %
- **Trend chart:** Line chart showing accuracy % per session over time
- **Readiness display:** Large score (0-100) with color: < 60 red, 60-79 yellow, 80+ green
- **Theme:** All charts use synthwave palette (cyan, magenta, purple gradients)

## Dependencies

- S18-01 through S18-06 (analytics data layer must exist)
- S7-02 (navigation must exist)

## Risks

| Risk | Mitigation |
|---|---|
| Avalonia charting libraries incompatible with .NET 10 | Use custom Canvas rendering as fallback; minimal dependency |
| Complex charts hurt performance | Virtualize; render on-demand; cache bitmap representations |

## Definition of Done

- [ ] Analytics dashboard reachable from sidebar
- [ ] Heat map shows per-objective accuracy
- [ ] Trend chart shows session-over-session improvement
- [ ] Readiness score visible and meaningful
- [ ] All visualizations themed consistently
