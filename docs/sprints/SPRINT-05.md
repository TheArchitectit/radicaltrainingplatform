# Sprint 5: DevOps & Security

**Phase:** Foundation  
**Duration:** Week 9 - Week 10  
**Goal:** Harden CI/CD pipeline, add dependency scanning, and ensure builds pass on all target platforms.

---

## Sprint Backlog

| ID | Story | Points | Assignee | Status |
|---|---|---|---|---|
| S5-01 | Add .github/dependabot.yml for NuGet + Actions | 1 | TBD | To Do |
| S5-02 | Add dotnet list package --vulnerable to CI | 1 | TBD | To Do |
| S5-03 | Create global.json to pin SDK version | 1 | TBD | To Do |
| S5-04 | Add coverage report upload to CI | 2 | TBD | To Do |
| S5-05 | Fix WinForms compatibility — update static API calls | 3 | TBD | To Do |
| S5-06 | Create RadicalTrainingPlatform.sln with correct project references | 2 | TBD | To Do |
| S5-07 | Add .slnx with proper project list | 1 | TBD | To Do |
| S5-08 | Validate builds pass on Windows, macOS, Linux in CI | 3 | TBD | To Do |

**Total:** 14 points

---

## User Stories

### S5-01: Add Dependabot Configuration
**As a** security engineer, **I want** Dependabot to monitor dependencies, **so that** vulnerable or outdated packages are automatically flagged.

**Acceptance Criteria:**
- [ ] `.github/dependabot.yml` exists at repo root
- [ ] NuGet ecosystem configured with `directory: "/"` and `interval: "weekly"`
- [ ] GitHub Actions ecosystem configured with `directory: "/"` and `interval: "weekly"`
- [ ] `open-pull-requests-limit: 10` for both ecosystems
- [ ] Dependabot checks appear in repo Security tab (may take 24h to activate)

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Create dependabot.yml | `.github/dependabot.yml` | 10 min | See DESIGN-PLAN.md Deliverable 7 |
| Validate YAML syntax | Repo root | 5 min | `yamllint` or online validator |
| Verify in GitHub UI | GitHub.com | 5 min | Settings > Security & analysis > Dependabot |

**Dependencies:** None

**References:** DESIGN-PLAN.md Deliverable 7

---

### S5-02: Add Vulnerability Scan to CI
**As a** security engineer, **I want** CI to scan for vulnerable packages, **so that** CVEs are caught before merge.

**Acceptance Criteria:**
- [ ] CI workflow has a "Check for vulnerable packages" step
- [ ] Step runs `dotnet list package --vulnerable --include-transitive`
- [ ] Step runs after build (needs restore first)
- [ ] Step does NOT fail the build if vulnerabilities are found (informational only until addressed)
- [ ] Output is visible in CI logs
- [ ] Step documents any found vulnerabilities (creates paper trail)

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Add vulnerability scan step | `.github/workflows/build.yml` | 10 min | After build step |
| Configure as informational | `build.yml` | 5 min | `|| true` intentionally (informational until clean) |
| Verify output in CI | Feature branch | 10 min | Push, check Actions logs |
| Document found vulnerabilities | `docs/SECURITY-AUDIT.md` | 15 min | List any found CVEs with remediation plan |

**Dependencies:** S1-03 (CI must be green first)

**References:** DESIGN-PLAN.md Deliverable 7

---

### S5-03: Create global.json to Pin SDK Version
**As a** developer, **I want** the .NET SDK version pinned, **so that** builds are reproducible across dev machines and CI.

**Acceptance Criteria:**
- [ ] `global.json` exists at repo root
- [ ] Pins SDK to specific version (e.g., `10.0.100-preview.x` or `10.0.100` when stable)
- [ ] Includes `rollForward` policy (e.g., `latestPatch`)
- [ ] CI uses this pinned version (verify `dotnet --version` in CI matches)
- [ ] Build passes with pinned SDK

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Create global.json | `global.json` (repo root) | 10 min | `"sdk": { "version": "10.0.100", "rollForward": "latestPatch" }` |
| Verify CI picks up global.json | Feature branch | 10 min | Add `dotnet --version` to CI output |
| Verify local build with global.json | Dev machine | 10 min | `dotnet --version` should match or rollForward |
| Document SDK upgrade process | `docs/DEVELOPER-SETUP.md` | 10 min | Update global.json when upgrading SDK |

**Dependencies:** S1-07 (Directory.Build.props must exist), S1-03 (CI must support .NET 10)

**References:** DESIGN-PLAN.md Part 6 (global.json creation)

---

### S5-04: Add Coverage Report Upload to CI
**As a** developer, **I want** coverage reports uploaded from CI, **so that** PR reviewers can see coverage impact.

**Acceptance Criteria:**
- [ ] CI generates coverage report in Cobertura format (from S4-08)
- [ ] Coverage report uploaded as artifact named `coverage-report`
- [ ] Report includes line-level coverage for Core assembly
- [ ] Coverage threshold check step added (informational — does not block merge yet)
- [ ] Coverage badge or summary visible in PR checks

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Configure Coverlet output | `.github/workflows/build.yml` | 15 min | `/p:CollectCoverage=true /p:CoverletOutputFormat=cobertura` |
| Upload coverage artifact | `.github/workflows/build.yml` | 10 min | `actions/upload-artifact@v4` |
| Add threshold check (info) | `.github/workflows/build.yml` | 10 min | Fail build if Core coverage < 70% (enforcement) |
| Verify artifact contents | GitHub Actions | 10 min | Download, inspect XML |
| Document coverage target | `docs/CONTRIBUTING.md` | 10 min | 70% Core coverage target |

**Dependencies:** S4-08 (coverage must already be generating), S2-01 (test project)

**References:** DESIGN-PLAN.md Deliverable 4

---

### S5-05: Fix WinForms Compatibility
**As a** legacy maintainer, **I want** the WinForms project to compile and run, **so that** Windows users have a fallback.

**Acceptance Criteria:**
- [ ] WinForms project compiles with zero errors
- [ ] `QuestionParser.LoadAllExams(dir)` call in MainForm.cs works (static or through DI wrapper)
- [ ] `HardcodedBlueprintService` and `HardcodedReferenceService` static `[Obsolete]` wrappers are usable
- [ ] No missing method or type reference errors
- [ ] WinForms app launches and loads questions (manual verification on Windows)

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Audit WinForms compilation errors | WinForms project | 30 min | `dotnet build` on Windows or with Windows target |
| Fix QuestionParser call site | `MainForm.cs` line 479 | 20 min | Either update to instance + DI, or use static wrapper |
| Fix BlueprintService static calls | `MainForm.cs` | 20 min | Use `[Obsolete]` wrappers or update to instance |
| Fix ReferenceService static calls | `MainForm.cs` | 20 min | Same pattern |
| Verify build on Windows | Windows machine | 15 min | Full build with WinForms target |
| Document remaining WinForms gaps | `docs/WINFORMS-MIGRATION.md` | 15 min | Known issues, planned migration to DI |

**Dependencies:** S3-08 (static wrappers must exist with [Obsolete])

**References:** DESIGN-PLAN.md Finding 13 (WinForms static method issue)

---

### S5-06: Create Solution File with Correct Project References
**As a** developer, **I want** a working solution file, **so that** all projects build together.

**Acceptance Criteria:**
- [ ] `RadicalTrainingPlatform.sln` exists with correct project order
- [ ] Projects included:
  - RadicalTrainingPlatform.Core
  - RadicalTrainingPlatform.Core.Tests
  - RadicalTrainingPlatform.Desktop
  - RadicalTrainingPlatform.Legacy.WinForms (Windows-only, may skip on Linux)
- [ ] Solution configurations: Debug, Release
- [ ] Solution platforms: Any CPU
- [ ] `dotnet build RadicalTrainingPlatform.sln` passes on Linux (WinForms excluded or conditional)
- [ ] CI builds solution file (not individual projects)

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Create/update solution file | `RadicalTrainingPlatform.sln` | 20 min | `dotnet new sln` or edit existing |
| Add Core project | Solution | 5 min | `dotnet sln add` |
| Add Core.Tests project | Solution | 5 min | `dotnet sln add` |
| Add Desktop project | Solution | 5 min | `dotnet sln add` |
| Add WinForms project | Solution | 5 min | Conditional; may not build on Linux |
| Update CI to build solution | `.github/workflows/build.yml` | 10 min | `dotnet build RadicalTrainingPlatform.sln` |
| Verify Linux build | Linux dev machine | 10 min | Should build Core + Desktop + Tests |

**Dependencies:** S2-01 (test project must exist)

**References:** CLAUDE.md (Key Files section mentions solution file)

---

### S5-07: Add .slnx with Proper Project List
**As a** developer, **I want** an XML solution file for better tooling support, **so that** modern editors handle the solution correctly.

**Acceptance Criteria:**
- [ ] `RadicalTrainingPlatform.slnx` exists at repo root
- [ ] Contains all projects from .sln
- [ ] Valid XML syntax
- [ ] Generated from or kept in sync with .sln
- [ ] Documented when to use .sln vs .slnx

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Create .slnx file | `RadicalTrainingPlatform.slnx` | 15 min | XML format with Project elements |
| Verify XML validity | Repo root | 5 min | `xmllint` or IDE validation |
| Document format | `docs/CONTRIBUTING.md` | 10 min | Mention .slnx for modern tooling |

**Dependencies:** S5-06 (solution file must be correct first)

**References:** CLAUDE.md (Key Files section mentions .slnx needs population)

---

### S5-08: Validate Cross-Platform Builds in CI
**As a** release engineer, **I want** CI to build on all target platforms, **so that** cross-platform regressions are caught early.

**Acceptance Criteria:**
- [ ] CI matrix strategy builds on: ubuntu-latest, windows-latest, macos-latest
- [ ] Ubuntu build compiles Core + Desktop + Tests (no WinForms)
- [ ] Windows build compiles all projects including WinForms
- [ ] macOS build compiles Core + Desktop + Tests
- [ ] All matrix jobs produce artifacts
- [ ] Build badge in README reflects all platforms

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Add matrix strategy | `.github/workflows/build.yml` | 30 min | `os: [ubuntu-latest, windows-latest, macos-latest]` |
| Configure OS-specific steps | `build.yml` | 20 min | WinForms only on Windows; different artifact paths |
| Verify Ubuntu job | GitHub Actions | 15 min | Push, verify green |
| Verify Windows job | GitHub Actions | 15 min | Verify WinForms builds |
| Verify macOS job | GitHub Actions | 15 min | Verify Avalonia builds |
| Add build badge to README | `README.md` | 10 min | Markdown badge linking to Actions |
| Document platform support | `docs/CROSS-PLATFORM.md` | 15 min | OS matrix, known issues |

**Dependencies:** S1-03 (CI must be green), S5-05 (WinForms must compile), S5-06 (solution must work)

**References:** DESIGN-MATRIX-AND-ROADMAP.md Deliverable 3 (CI on all 3 OSes)

---

## Sprint Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| WinForms build requires Windows SDK not available on Linux CI | High | Medium | Only build WinForms on Windows job; Core/Desktop/Tests on all 3 |
| macOS runner lacks .NET 10 SDK | Medium | High | Use setup-dotnet action explicitly; cache SDK |
| Coverage threshold enforcement blocks green builds | Medium | Medium | Make threshold informational first; enforce after S6 validation |
| Dependabot does not support .NET 10 preview packages | Medium | Low | Dependabot will still scan; may produce PRs for stable packages only |
| Solution file gets out of sync with .slnx | Low | Low | Document that .sln is source of truth; update both on project changes |

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Unit tests pass (>= 70% coverage on changed files)
- [ ] CI pipeline green on all 3 OSes
- [ ] Code reviewed
- [ ] Documentation updated

## Sprint Review Checklist

- [ ] CI matrix shows green on ubuntu, windows, macos
- [ ] Dependabot is active in repo settings
- [ ] Coverage artifact is downloadable from CI
- [ ] WinForms compiles on Windows (with deprecation warnings)
- [ ] `dotnet build RadicalTrainingPlatform.sln` passes on Linux
- [ ] No regressions in existing functionality
- [ ] Technical debt documented (if deferred)
