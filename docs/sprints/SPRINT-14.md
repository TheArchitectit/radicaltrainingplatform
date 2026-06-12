# Sprint 14: v0.5 Release

**Phase:** Growth  
**Duration:** Week 27 - Week 28  
**Goal:** Validate all Phase 2 work, perform end-to-end testing, and tag the v0.5 Growth release.

---

## Sprint Backlog

| ID | Story | Points | Assignee | Status |
|---|---|---|---|---|
| S14-01 | End-to-end testing on Windows | 3 | TBD | To Do |
| S14-02 | End-to-end testing on macOS | 2 | TBD | To Do |
| S14-03 | End-to-end testing on Linux (AppImage + Flatpak) | 3 | TBD | To Do |
| S14-04 | Migration guide from WinForms to Avalonia | 2 | TBD | To Do |
| S14-05 | Tag v0.5 release | 1 | TBD | To Do |
| S14-06 | Write Phase 3 sprint plan | 2 | TBD | To Do |

**Total:** 13 points

---

## User Stories

### S14-01: End-to-End Testing on Windows
**As a** product owner, **I want** full validation on Windows, **so that** the primary desktop platform works perfectly.

**Acceptance Criteria:**
- [ ] Full test script executed on Windows 10/11:
  - Install via MSI
  - Launch app
  - Select exam, answer questions, submit
  - Test timed mode
  - Test strict mode
  - Test answer shuffle
  - Test flagging and review
  - Test blueprint view
  - Test stats view
  - Test PDF export
  - Test navigation (back, breadcrumbs)
  - Test session persistence (restart, verify stats)
- [ ] All tests pass or documented as known issues
- [ ] WinForms compatibility verified (still compiles if referenced)

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Execute full test script | Windows machine | 2h | Per test procedure in regression-test.md |
| Document Windows-specific issues | `docs/PHASE2-VALIDATION.md` | 30 min | Any platform-specific bugs |
| Verify MSI works | Windows machine | 30 min | Install, launch, uninstall |
| Fix blocking Windows issues | Various | TBD | Timeboxed to 1 day |

**Dependencies:** S13-04 (MSI must exist), S6-04 (regression test script)

**References:** DESIGN-MATRIX-AND-ROADMAP.md Phase 2 Success Criteria

---

### S14-02: End-to-End Testing on macOS
**As a** product owner, **I want** full validation on macOS, **so that** Mac users have a quality experience.

**Acceptance Criteria:**
- [ ] Full test script executed on macOS (Intel and Apple Silicon if available)
- [ ] DMG mounts and app launches
- [ ] All features from Windows E2E tested
- [ ] macOS-specific issues documented
- [ ] Menu bar integration (if applicable) works

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Execute full test script | macOS machine | 1.5h | Same procedure |
| Document macOS-specific issues | `docs/PHASE2-VALIDATION.md` | 20 min | |
| Verify DMG works | macOS machine | 20 min | Mount, install, run |
| Fix blocking macOS issues | Various | TBD | Timeboxed to 0.5 day |

**Dependencies:** S13-03 (DMG must exist)

**References:** DESIGN-MATRIX-AND-ROADMAP.md Phase 2 Success Criteria

---

### S14-03: End-to-End Testing on Linux
**As a** product owner, **I want** full validation on Linux, **so that** the open-source community has a working build.

**Acceptance Criteria:**
- [ ] Full test script executed on Linux (Ubuntu or similar)
- [ ] AppImage launches directly
- [ ] Flatpak builds (if manifest fixed)
- [ ] All features from Windows E2E tested
- [ ] Linux-specific issues documented

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Execute full test script | Linux machine | 1.5h | Same procedure |
| Test AppImage | Linux machine | 20 min | chmod +x, run |
| Test Flatpak build | Linux machine | 30 min | `flatpak-builder` if available |
| Document Linux-specific issues | `docs/PHASE2-VALIDATION.md` | 20 min | |
| Fix blocking Linux issues | Various | TBD | Timeboxed to 0.5 day |

**Dependencies:** S13-02 (AppImage must exist), S1-06 (Flatpak manifest should be fixed)

**References:** DESIGN-MATRIX-AND-ROADMAP.md Phase 2 Success Criteria

---

### S14-04: Migration Guide from WinForms to Avalonia
**As a** WinForms user, **I want** clear migration guidance, **so that** I can switch to the cross-platform version.

**Acceptance Criteria:**
- [ ] `docs/WINFORMS-MIGRATION.md` created
- [ ] Documents: feature parity (what works in Avalonia vs WinForms)
- [ ] Documents: known differences in UI/UX
- [ ] Documents: data migration (if any progress data exists in WinForms format)
- [ ] Documents: install instructions per platform
- [ ] Links to v0.5 release artifacts
- [ ] Deprecation timeline for WinForms (maintenance mode)

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Draft migration guide | `docs/WINFORMS-MIGRATION.md` | 1h | Compare features, document differences |
| Verify feature parity | Code audit | 30 min | Check what's in WinForms vs Avalonia |
| Document install per platform | Migration guide | 20 min | MSI, DMG, AppImage instructions |
| Document deprecation plan | Migration guide | 15 min | WinForms maintenance mode timeline |

**Dependencies:** None (documentation)

**References:** DESIGN-PLAN.md Finding 13 (WinForms compatibility issues)

---

### S14-05: Tag v0.5 Release
**As a** release engineer, **I want** the Growth milestone tagged, **so that** the Phase 2 work is preserved.

**Acceptance Criteria:**
- [ ] Git tag `v0.5.0` created on main
- [ ] Version in Directory.Build.props is `0.5.0`
- [ ] Release notes document all Phase 2 features
- [ ] CI release workflow triggers and produces artifacts
- [ ] GitHub Release page created with all artifacts
- [ ] Release marked as pre-release

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Update Directory.Build.props | `Directory.Build.props` | 5 min | Version 0.5.0 |
| Write release notes | `docs/RELEASE-v0.5.md` | 30 min | All Phase 2 features |
| Create annotated tag | Git | 5 min | `git tag -a v0.5.0` |
| Push tag | Git | 5 min | `git push origin v0.5.0` |
| Verify release workflow | GitHub Actions | 20 min | All jobs green |
| Verify artifacts on release page | GitHub.com | 10 min | Download links work |
| Update README with v0.5 info | `README.md` | 10 min | Latest release badge |

**Dependencies:** S14-01 through S14-04 (all validation must pass before tagging)

**References:** DESIGN-MATRIX-AND-ROADMAP.md Release Milestones

---

### S14-06: Write Phase 3 Sprint Plan
**As a** product owner, **I want** Phase 3 sprints planned based on Phase 2 learnings, **so that** the next phase starts smoothly.

**Acceptance Criteria:**
- [ ] Phase 3 sprint documents created (SPRINT-15.md through SPRINT-26.md)
- [ ] Each sprint has realistic estimates incorporating Phase 2 velocity data
- [ ] Dependencies from Phase 2 clearly noted
- [ ] Phase 3 plan reviewed

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Document Phase 2 learnings | `docs/PHASE2-RETROSPECTIVE.md` | 30 min | Velocity, blockers, surprises |
| Update SPRINT-PLAN.md Phase 3 | `docs/sprints/SPRINT-PLAN.md` | 20 min | Adjust timeline if needed |
| Create S15-S26 documents | `docs/sprints/` | 2h | Summary format (not full detail) |
| Review sprint plans | Team | 30 min | Consistency check |

**Dependencies:** S14-05 (all Phase 2 work complete)

**References:** DESIGN-MATRIX-AND-ROADMAP.md Phase 3 Roadmap

---

## Sprint Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| End-to-end testing reveals late-breaking blocking issues | Medium | High | Timebox fixes to 2 days; defer non-blocking to v0.5.1 |
| macOS Apple Silicon build issues | Medium | Medium | Build on Intel if Apple Silicon CI unavailable; universal binary for v1.0 |
| Flatpak still broken despite S1-06 fix | Low | Medium | Skip Flatpak for v0.5 if needed; AppImage covers Linux |
| Release workflow fails on first real tag | Medium | High | Test with dummy tag first (S13); monitor closely |

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All E2E tests pass on all platforms
- [ ] CI pipeline green
- [ ] Code reviewed
- [ ] Documentation updated

## Sprint Review Checklist

- [ ] AppImage tested and working on Linux
- [ ] DMG tested and working on macOS
- [ ] MSI tested and working on Windows
- [ ] All Phase 2 features function correctly
- [ ] v0.5.0 tag pushed and CI release workflow successful
- [ ] GitHub Release page has all artifacts
- [ ] WinForms migration guide published
- [ ] Phase 3 sprint plans drafted
- [ ] No blocking regressions in existing functionality
- [ ] Technical debt documented (if deferred)
