# Sprint 6: Phase 1 Hardening & Validation

**Phase:** Foundation  
**Duration:** Week 11 - Week 12  
**Goal:** Validate all Phase 1 work, ensure production readiness, and tag the v0.1 Foundation release.

---

## Sprint Backlog

| ID | Story | Points | Assignee | Status |
|---|---|---|---|---|
| S6-01 | Validate 100% question parse rate across all 21 .md files | 2 | TBD | To Do |
| S6-02 | Validate DeriveExamCode for every filename | 1 | TBD | To Do |
| S6-03 | Validate 70%+ Core test coverage | 2 | TBD | To Do |
| S6-04 | Full regression test — all features working on all OSes | 3 | TBD | To Do |
| S6-05 | Update README.md with current architecture and build instructions | 2 | TBD | To Do |
| S6-06 | Update CLAUDE.md with Phase 2 architecture notes | 1 | TBD | To Do |
| S6-07 | Tag v0.1 release — Foundation complete | 1 | TBD | To Do |
| S6-08 | Write Phase 2 sprint plan based on learnings | 2 | TBD | To Do |

**Total:** 14 points

---

## User Stories

### S6-01: Validate 100% Question Parse Rate
**As a** product owner, **I want** every question in every file to be parsed, **so that** no content is silently missing.

**Acceptance Criteria:**
- [ ] Script or tool counts questions per .md file and compares to expected counts
- [ ] All 21 .md files parse with zero dropped questions
- [ ] Total parsed question count >= 1,598 (current expected)
- [ ] NCP-CI-Part3 specifically: exactly 80 questions (post-S1-01 fix)
- [ ] Any new silent drops are documented as bugs and fixed in-sprint
- [ ] Parse rate documented in validation report

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Create validation script | `scripts/validate-parse-rate.py` | 1h | Count headers per file, compare to parser output |
| Run against all 21 files | Repo root | 15 min | Execute script, capture output |
| Fix any remaining drops | Various | TBD | If issues found, fix and re-run |
| Document results | `docs/PHASE1-VALIDATION.md` | 15 min | Per-file question counts, total |
| Add parse rate to CI | `.github/workflows/build.yml` | 15 min | Run validation script as CI step |

**Dependencies:** S1-01 (parser fix), S1-02 (DeriveExamCode fix), S2-06 (linter), S4-07 (errata)

**References:** DESIGN-MATRIX-AND-ROADMAP.md Success Criteria (100% parse rate)

---

### S6-02: Validate DeriveExamCode for Every Filename
**As a** product owner, **I want** every filename to derive the correct exam code, **so that** blueprint coverage is accurate.

**Acceptance Criteria:**
- [ ] Script or test validates DeriveExamCode for all 21 .md filenames
- [ ] Each derived code maps to an existing blueprint in BlueprintService
- [ ] No exam codes return null from `GetBlueprint()`
- [ ] Known problematic files (NCA-75-Part3-GapFill, NCP-US-Part2-D3/D4) verified correct
- [ ] Results documented

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Create validation script | `scripts/validate-exam-codes.py` | 30 min | List .md files, call DeriveExamCode, check blueprint exists |
| Run validation | Repo root | 10 min | Execute, review output |
| Fix any misclassifications | Parser | TBD | If issues found |
| Document results | `docs/PHASE1-VALIDATION.md` | 10 min | Per-file derivation results |

**Dependencies:** S1-02 (DeriveExamCode fix), S3-03 (HardcodedBlueprintService)

**References:** DESIGN-PLAN.md Finding 2 (DeriveExamCode)

---

### S6-03: Validate 70%+ Core Test Coverage
**As a** product owner, **I want** >= 70% line coverage in Core, **so that** future refactoring is protected.

**Acceptance Criteria:**
- [ ] Coverlet report shows >= 70% line coverage for Core assembly
- [ ] Coverage broken down by namespace (Services, ViewModels, Infrastructure, Models)
- [ ] Any gaps >= 100 lines uncovered are documented with justification
- [ ] Coverage enforcement step in CI is active (fails build if < 70%)
- [ ] Coverage badge in README

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Generate coverage report | Solution | 15 min | `dotnet test --collect:"XPlat Code Coverage"` |
| Analyze coverage gaps | Coverlet output | 30 min | Review uncovered lines per file |
| Add tests for critical gaps | Test project | 1h | Focus on high-risk uncovered code |
| Enable CI enforcement | `.github/workflows/build.yml` | 10 min | Fail if Core coverage < 70% |
| Add coverage badge | `README.md` | 10 min | shields.io or codecov badge |
| Document gap rationale | `docs/PHASE1-VALIDATION.md` | 15 min | Justify any intentionally uncovered code |

**Dependencies:** S2-02, S2-03, S2-04, S2-05 (all test stories), S5-04 (coverage upload)

**References:** DESIGN-MATRIX-AND-ROADMAP.md Success Criteria (70%+ coverage), DESIGN-PLAN.md Deliverable 4

---

### S6-04: Full Regression Test on All OSes
**As a** product owner, **I want** all features to work on every supported OS, **so that** users have a consistent experience.

**Acceptance Criteria:**
- [ ] Manual test script executed on each platform:
  - Launch app
  - Select an exam (NCA-75)
  - Answer questions (correct and incorrect)
  - Submit and verify score
  - Navigate through questions (Next/Previous)
  - Load blueprint view (if wired)
  - Export PDF (if wired)
- [ ] Test results documented per OS
- [ ] No blocking bugs on any platform
- [ ] Minor issues documented with severity and planned fix sprint

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Create regression test script | `scripts/regression-test.md` | 30 min | Step-by-step manual test procedure |
| Execute on Linux | Linux dev machine | 1h | Full manual test |
| Execute on Windows | Windows dev machine | 1h | Full manual test |
| Execute on macOS | macOS dev machine | 1h | Full manual test |
| Document results | `docs/PHASE1-VALIDATION.md` | 30 min | Pass/fail per test, per OS |
| Fix blocking issues | Various | TBD | Timeboxed to 1 day |

**Dependencies:** S5-08 (CI must validate builds on all 3 OSes), S3-07 (all views wired to DI)

**References:** DESIGN-MATRIX-AND-ROADMAP.md Success Criteria (CI passes on all 3 OSes)

---

### S6-05: Update README.md
**As a** new contributor, **I want** clear documentation, **so that** I can build and contribute to the project.

**Acceptance Criteria:**
- [ ] README includes: project description, current architecture diagram, build instructions
- [ ] Build instructions cover: prerequisites (.NET 10 SDK), build command, run command, test command
- [ ] Contributing guide section with: commit format, PR process, coding standards
- [ ] Platform support matrix (Linux, macOS, Windows)
- [ ] Badges: build status, coverage, latest release
- [ ] Links to: CLAUDE.md, DESIGN-PLAN.md, DESIGN-MATRIX-AND-ROADMAP.md
- [ ] Screenshot or ASCII art of app (optional)

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Draft README content | `README.md` | 1h | Update existing or rewrite |
| Add architecture section | `README.md` | 20 min | ASCII diagram or reference to DESIGN-PLAN.md |
| Add build instructions | `README.md` | 15 min | Prerequisites, commands |
| Add contributing guide | `README.md` | 20 min | Commit format, PR process, style |
| Add badges | `README.md` | 10 min | Build, coverage, release |
| Add documentation links | `README.md` | 5 min | Cross-reference docs |
| Review and refine | `README.md` | 15 min | Peer review |

**Dependencies:** None (content development)

**References:** CLAUDE.md (project structure)

---

### S6-06: Update CLAUDE.md with Phase 2 Architecture Notes
**As a** AI assistant, **I want** project guidelines to reflect the next phase, **so that** future work stays on track.

**Acceptance Criteria:**
- [ ] CLAUDE.md updated with Phase 2 architecture additions:
  - IProgressRepository mention
  - ReactiveUI / navigation expectations
  - SQLite persistence notes
  - Timed exam mode notes
- [ ] File modification guidelines updated (phase-appropriate forbidden actions)
- [ ] Key files table updated with new Phase 2 files
- [ ] Build instructions updated if new packages are expected

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Review current CLAUDE.md | `CLAUDE.md` | 10 min | Understand current state |
| Add Phase 2 architecture notes | `CLAUDE.md` | 20 min | Persistence, ReactiveUI, timed exams |
| Update key files table | `CLAUDE.md` | 10 min | Add Phase 2 files |
| Update build instructions | `CLAUDE.md` | 10 min | Mention SQLite dependency |
| Review and refine | `CLAUDE.md` | 10 min | Ensure consistency |

**Dependencies:** None (documentation)

**References:** DESIGN-PLAN.md Sections 2.1-2.5 (target architecture)

---

### S6-07: Tag v0.1 Release
**As a** release engineer, **I want** a Foundation release tagged, **so that** the Phase 1 milestone is preserved.

**Acceptance Criteria:**
- [ ] Git tag `v0.1.0` created on main branch
- [ ] Tag annotation includes: release notes summary, list of major fixes and features
- [ ] Version in Directory.Build.props matches `0.1.0`
- [ ] CI pipeline passes on the tagged commit
- [ ] Release notes document created

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Ensure Directory.Build.props version is 0.1.0 | `Directory.Build.props` | 5 min | Verify or update |
| Create annotated tag | Git | 10 min | `git tag -a v0.1.0 -m "Foundation release..."` |
| Write release notes | `docs/RELEASE-v0.1.md` | 30 min | Summary of all Phase 1 work |
| Push tag to origin | Git | 5 min | `git push origin v0.1.0` |
| Verify CI on tag | GitHub Actions | 10 min | Actions tab, verify build triggered |

**Dependencies:** S6-01 through S6-04 (all validation must pass before tagging)

**References:** DESIGN-MATRIX-AND-ROADMAP.md Release Milestones (v0.1)

---

### S6-08: Write Phase 2 Sprint Plan Based on Learnings
**As a** product owner, **I want** the next phase's sprints informed by Phase 1 learnings, **so that** estimates are realistic.

**Acceptance Criteria:**
- [ ] Phase 2 sprint plan documents created (SPRINT-07.md through SPRINT-14.md)
- [ ] Each sprint document includes: goal, backlog, point estimates, risks
- [ ] Learnings from Phase 1 incorporated into estimates (buffer for uncertainty)
- [ ] Dependencies from S1-S6 clearly noted as prerequisites
- [ ] Phase 2 plan reviewed and approved by team

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Document Phase 1 learnings | `docs/PHASE1-RETROSPECTIVE.md` | 30 min | What went well, what was hard, velocity data |
| Update SPRINT-PLAN.md Phase 2 section | `docs/sprints/SPRINT-PLAN.md` | 20 min | Adjust timeline if needed |
| Create SPRINT-07.md | `docs/sprints/SPRINT-07.md` | 30 min | Navigation & MVVM |
| Create SPRINT-08.md | `docs/sprints/SPRINT-08.md` | 20 min | Wire Dead Views |
| Create SPRINT-09.md | `docs/sprints/SPRINT-09.md` | 30 min | Persistence Layer |
| Create SPRINT-10.md | `docs/sprints/SPRINT-10.md` | 15 min | PDF Export |
| Create SPRINT-11.md | `docs/sprints/SPRINT-11.md` | 20 min | Timed Exam Mode |
| Create SPRINT-12.md | `docs/sprints/SPRINT-12.md` | 20 min | Flagging & Shuffle |
| Create SPRINT-13.md | `docs/sprints/SPRINT-13.md` | 20 min | Packaging & Release |
| Create SPRINT-14.md | `docs/sprints/SPRINT-14.md` | 15 min | v0.5 Release |
| Review all sprint docs | Team | 30 min | Consistency check |

**Dependencies:** S6-01 through S6-07 (all Phase 1 work informs Phase 2 planning)

**References:** DESIGN-MATRIX-AND-ROADMAP.md Phase 2 Roadmap

---

## Sprint Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Manual regression testing reveals blocking bugs late in sprint | Medium | High | Timebox bug fixes to 1 day; defer non-blocking to Phase 2 if needed |
| Test coverage falls short of 70% | Medium | Medium | Focus on high-risk uncovered code; document gaps; some boilerplate may be intentionally uncovered |
| Cross-platform build issues on tag push | Low | High | Verify builds on all OSes BEFORE tagging; use dry-run release |
| README documentation becomes quickly outdated | Low | Low | Commit to updating README at each release milestone |

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Unit tests pass (>= 70% coverage on changed files)
- [ ] CI pipeline green
- [ ] Code reviewed
- [ ] Documentation updated

## Sprint Review Checklist

- [ ] All 21 .md files parse at 100% rate
- [ ] All exam codes derive correctly
- [ ] Core test coverage >= 70% (verified by Coverlet)
- [ ] Regression tests pass on Linux, Windows, macOS
- [ ] README.md is accurate and helpful
- [ ] v0.1.0 tag pushed and CI passes
- [ ] Phase 2 sprint plans are drafted and approved
- [ ] No regressions in existing functionality
- [ ] Technical debt documented (if deferred)
