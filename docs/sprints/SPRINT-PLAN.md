# RadicalTrainingPlatform — Master Sprint Plan

**Version:** 1.0.0  
**Date:** 2026-06-12  
**Project Status:** Pre-alpha (maturity 2.5/10)  
**Methodology:** Scrum with 2-week sprints  

---

## 1. Sprint Methodology

### Sprint Cadence
- **Duration:** 2 weeks (10 working days)
- **Sprint Planning:** Monday AM, Week 1
- **Daily Standup:** 15 minutes, async via task board
- **Sprint Review:** Friday PM, Week 2
- **Sprint Retrospective:** Friday PM, Week 2 (after review)

### Definition of Done
All stories must satisfy the following before being marked complete:

- [ ] All acceptance criteria met and verified
- [ ] Unit tests pass with >= 70% coverage on changed files
- [ ] CI pipeline green on all target platforms
- [ ] Code reviewed and approved (at least 1 reviewer)
- [ ] Documentation updated (inline XML docs, external docs if user-facing)
- [ ] No regressions in existing functionality
- [ ] Technical debt documented (if any was consciously deferred)

### Velocity Assumptions
- **Team size:** 2-3 developers (or 1 senior developer)
- **Sprint capacity:** 15-20 story points per sprint (Phase 1-2)
- **Point scale:**
  - 1 pt = Trivial (typo, config change, single-line fix)
  - 2-3 pts = Small (well-understood change, limited scope)
  - 5 pts = Medium (new feature, cross-file change, requires tests)
  - 8 pts = Large (architecture change, affects multiple layers)
  - 13+ pts = Epic (must be split across sprints)
- **Velocity buffer:** Reserve 10% capacity for unplanned bugs and support

---

## 2. Phase Overview

| Phase | Sprints | Timeline | Theme | Key Outcomes |
|---|---|---|---|---|
| **Phase 1: Foundation** | S1-S6 | Weeks 1-12 | Fix defects, establish architecture, achieve CI | 100% parse rate, DI container, 70%+ test coverage, v0.1 |
| **Phase 2: Growth** | S7-S14 | Weeks 13-28 | Complete UI, add persistence, release v0.5 | All views wired, SQLite persistence, timed exams, cross-platform release |
| **Phase 3: Scale** | S15-S26 | Weeks 29-52 | Multi-question types, adaptive learning, mobile | 3+ question types, SM-2 scheduler, mobile PWA, analytics |
| **Phase 4: Enterprise** | S27-S44 | Weeks 53-88 | Multi-vendor, cloud, social, enterprise readiness | 3+ vendors, OAuth2 backend, WCAG AA, SOC2 groundwork |

---

## 3. Release Milestones

| Release | Phase | Sprints | Target Date | Description |
|---|---|---|---|---|
| **v0.1** | Phase 1 | S1-S6 | ~Week 12 | Foundation complete. All bugs fixed, tests passing, DI wired, CI green across 3 OSes |
| **v0.5** | Phase 2 | S7-S14 | ~Week 28 | Feature-complete Avalonia desktop. All views wired, persistence layer, timed exams, release automation |
| **v1.0** | Phase 3 | S15-S26 | ~Week 53 | Production-ready study platform. Multi-question types, spaced repetition, mobile PWA, analytics |
| **v2.0** | Phase 4 | S27-S44 | ~Week 88 | Enterprise platform. Multi-vendor support, cloud backend, study groups, LMS integration |

---

## 4. Sprint Dependency Map

```
S1 (Get Green)
  |
  v
S2 (Test Foundation) <-- S1 (needs green CI to run tests)
  |
  v
S3 (Architecture - DI) <-- S2 (tests protect refactoring)
  |
  v
S4 (Architecture - Logging) <-- S3 (DI needed to inject ILogger)
  |
  v
S5 (DevOps & Security) <-- S1, S2, S4 (needs passing builds, test project, logging)
  |
  v
S6 (Phase 1 Hardening) <-- S1-S5 (validates all prior work)
  |
  v
S7 (Navigation & MVVM) <-- S3, S6 (needs DI, stable foundation)
  |
  v
S8 (Wire Dead Views) <-- S7, S3 (needs navigation, IBlueprintService)
  |
  v
S9 (Persistence Layer) <-- S3 (needs DI container)
  |
  v
S10 (PDF Export) <-- S9, S3 (needs DI, persistence optional)
  |
  v
S11 (Timed Exam Mode) <-- S9 (needs session persistence)
  |
  v
S12 (Flagging & Shuffle) <-- S7, S9 (needs VM structure, persistence)
  |
  v
S13 (Packaging & Release) <-- S5, S10-S12 (needs CI fixes, all features)
  |
  v
S14 (v0.5 Release) <-- S13 (needs packaging)
  |
  v
S15-S26 (Phase 3) <-- S14 (needs stable v0.5 base)
  |
  v
S27-S44 (Phase 4) <-- S15-S26 (needs content foundation, auth)
```

### Critical Path
S1 (CI green) -> S2 (tests) -> S3 (DI) -> S6 (v0.1) -> S7 (MVVM) -> S9 (persistence) -> S14 (v0.5)

---

## 5. Risk-Adjusted Timeline

### Base Timeline vs Risk-Adjusted

| Phase | Base Duration | Risk Buffer | Adjusted Duration | Risk Factor |
|---|---|---|---|---|
| Phase 1 (Foundation) | 12 weeks | +2 weeks | **14 weeks** | High (broken CI, no tests) |
| Phase 2 (Growth) | 16 weeks | +3 weeks | **19 weeks** | Medium (ReactiveUI learning curve) |
| Phase 3 (Scale) | 24 weeks | +6 weeks | **30 weeks** | High (multi-question types, PWA) |
| Phase 4 (Enterprise) | 36 weeks | +10 weeks | **46 weeks** | Very High (cloud backend, enterprise) |
| **Total** | 88 weeks | +21 weeks | **109 weeks (~2.1 years)** | — |

### Top Schedule Risks

| Risk | Impact on Timeline | Mitigation |
|---|---|---|
| .NET 10 preview breaking changes | +2-4 weeks | Pin SDK in global.json; maintain net8.0 fallback target |
| CefGlue incompatibility with Avalonia updates | +2-3 weeks | Define ILabSimulatorHost abstraction early (S3); PWA fallback |
| Content authoring bottleneck (new questions) | +4-8 weeks | Start content work in parallel with development |
| SQLite/EF Core 10 not ready | +1-2 weeks | Use raw `Microsoft.Data.Sqlite` as fallback |
| ReactiveUI learning curve | +1-2 weeks | Spike in S6; pair programming |

---

## 6. Sprint Documents

### Phase 1: Foundation (Sprints 1-6)

| Sprint | Name | Duration | Points | Link |
|---|---|---|---|---|
| Sprint 1 | Get Green | Weeks 1-2 | ~14 pts | [SPRINT-01.md](./SPRINT-01.md) |
| Sprint 2 | Test Foundation | Weeks 3-4 | ~20 pts | [SPRINT-02.md](./SPRINT-02.md) |
| Sprint 3 | Architecture — Interfaces & DI | Weeks 5-6 | ~19 pts | [SPRINT-03.md](./SPRINT-03.md) |
| Sprint 4 | Architecture — Logging & Quality | Weeks 7-8 | ~17 pts | [SPRINT-04.md](./SPRINT-04.md) |
| Sprint 5 | DevOps & Security | Weeks 9-10 | ~14 pts | [SPRINT-05.md](./SPRINT-05.md) |
| Sprint 6 | Phase 1 Hardening & Validation | Weeks 11-12 | ~14 pts | [SPRINT-06.md](./SPRINT-06.md) |

### Phase 2: Growth (Sprints 7-14)

| Sprint | Name | Duration | Points | Link |
|---|---|---|---|---|
| Sprint 7 | Navigation & MVVM | Weeks 13-14 | ~15 pts | [SPRINT-07.md](./SPRINT-07.md) |
| Sprint 8 | Wire Dead Views | Weeks 15-16 | ~15 pts | [SPRINT-08.md](./SPRINT-08.md) |
| Sprint 9 | Persistence Layer | Weeks 17-18 | ~17 pts | [SPRINT-09.md](./SPRINT-09.md) |
| Sprint 10 | PDF Export & File System | Weeks 19-20 | ~12 pts | [SPRINT-10.md](./SPRINT-10.md) |
| Sprint 11 | Timed Exam Mode | Weeks 21-22 | ~14 pts | [SPRINT-11.md](./SPRINT-11.md) |
| Sprint 12 | Answer Randomization & Flagging | Weeks 23-24 | ~13 pts | [SPRINT-12.md](./SPRINT-12.md) |
| Sprint 13 | Packaging & Release Automation | Weeks 25-26 | ~16 pts | [SPRINT-13.md](./SPRINT-13.md) |
| Sprint 14 | v0.5 Release | Weeks 27-28 | ~13 pts | [SPRINT-14.md](./SPRINT-14.md) |

### Phase 3: Scale (Sprints 15-26)

| Sprint | Name | Duration | Link |
|---|---|---|---|
| Sprint 15 | Multi-Question Types — Models | Weeks 29-30 | [SPRINT-15.md](./SPRINT-15.md) |
| Sprint 16 | Multi-Question Types — UI | Weeks 31-32 | [SPRINT-16.md](./SPRINT-16.md) |
| Sprint 17 | Spaced Repetition Engine | Weeks 33-34 | [SPRINT-17.md](./SPRINT-17.md) |
| Sprint 18 | Analytics — Data Layer | Weeks 35-36 | [SPRINT-18.md](./SPRINT-18.md) |
| Sprint 19 | Analytics — UI | Weeks 37-38 | [SPRINT-19.md](./SPRINT-19.md) |
| Sprint 20 | Mobile PWA — Responsive Layout | Weeks 39-40 | [SPRINT-20.md](./SPRINT-20.md) |
| Sprint 21 | Mobile PWA — Offline & Sync | Weeks 41-42 | [SPRINT-21.md](./SPRINT-21.md) |
| Sprint 22 | Lab Simulator Integration | Weeks 43-44 | [SPRINT-22.md](./SPRINT-22.md) |
| Sprint 23 | Content Versioning | Weeks 45-46 | [SPRINT-23.md](./SPRINT-23.md) |
| Sprint 24 | Content Expansion | Weeks 47-48 | [SPRINT-24.md](./SPRINT-24.md) |
| Sprint 25 | Accessibility Foundation | Weeks 49-50 | [SPRINT-25.md](./SPRINT-25.md) |
| Sprint 26 | Phase 3 Validation | Weeks 51-52 | [SPRINT-26.md](./SPRINT-26.md) |

### Phase 4: Enterprise (Sprints 27-44)

| Sprint | Name | Duration | Link |
|---|---|---|---|
| Sprint 27-28 | Multi-Vendor Plugin Architecture | Weeks 53-56 | [SPRINT-27-28.md](./SPRINT-27-28.md) |
| Sprint 29-30 | Cloud API Backend | Weeks 57-60 | [SPRINT-29-30.md](./SPRINT-29-30.md) |
| Sprint 31-32 | Authentication & Authorization | Weeks 61-64 | [SPRINT-31-32.md](./SPRINT-31-32.md) |
| Sprint 33-34 | Social & Study Groups | Weeks 65-68 | [SPRINT-33-34.md](./SPRINT-33-34.md) |
| Sprint 35-36 | WCAG 2.1 AA Accessibility | Weeks 69-72 | [SPRINT-35-36.md](./SPRINT-35-36.md) |
| Sprint 37-38 | Multi-Format Content | Weeks 73-76 | [SPRINT-37-38.md](./SPRINT-37-38.md) |
| Sprint 39-40 | Enterprise Admin Console | Weeks 77-80 | [SPRINT-39-40.md](./SPRINT-39-40.md) |
| Sprint 41-42 | Security & Compliance | Weeks 81-84 | [SPRINT-41-42.md](./SPRINT-41-42.md) |
| Sprint 43-44 | Psychometric Analysis | Weeks 85-88 | [SPRINT-43-44.md](./SPRINT-43-44.md) |

---

## 7. References

- [Design Matrix & Roadmap](../DESIGN-MATRIX-AND-ROADMAP.md)
- [Engineering Design Plan](../DESIGN-PLAN.md)
- [Project Guidelines (CLAUDE.md)](../../CLAUDE.md)
