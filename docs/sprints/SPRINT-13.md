# Sprint 13: Packaging & Release Automation

**Phase:** Growth  
**Duration:** Week 25 - Week 26  
**Goal:** Automate cross-platform packaging and release artifact generation in CI.

---

## Sprint Backlog

| ID | Story | Points | Assignee | Status |
|---|---|---|---|---|
| S13-01 | Create release.yml workflow triggered on tag push | 3 | TBD | To Do |
| S13-02 | AppImage packaging in CI | 3 | TBD | To Do |
| S13-03 | DMG packaging in CI | 3 | TBD | To Do |
| S13-04 | MSI/Windows installer packaging | 3 | TBD | To Do |
| S13-05 | Version stamping from Directory.Build.props | 2 | TBD | To Do |
| S13-06 | GitHub Releases with artifacts upload | 2 | TBD | To Do |

**Total:** 16 points

---

## User Stories

### S13-01: Create release.yml Workflow
**As a** release engineer, **I want** CI to trigger release packaging on tag push, **so that** releases are automated and reproducible.

**Acceptance Criteria:**
- [ ] `.github/workflows/release.yml` created
- [ ] Triggered on tag push matching `v*` (e.g., `v0.5.0`)
- [ ] Job structure: build -> test -> package (per platform) -> release
- [ ] Release notes auto-generated from git log or RELEASE.md
- [ ] Workflow runs on tag push to main branch only
- [ ] Fails fast if tests fail before packaging

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Create release.yml | `.github/workflows/release.yml` | 1h | Multi-job workflow with matrix |
| Add tag trigger filter | `release.yml` | 10 min | `on: push: tags: - 'v*'` |
| Add build + test job | `release.yml` | 20 min | Reuse build.yml logic |
| Add parallel packaging jobs | `release.yml` | 30 min | One per platform, depends on build |
| Test with dummy tag | Feature branch | 20 min | Push v0.0.0-test tag, verify |
| Document workflow | `docs/RELEASE-PROCESS.md` | 20 min | How to tag and release |

**Dependencies:** S1-03 (CI must be green), S5-08 (cross-platform builds must work)

**References:** DESIGN-MATRIX-AND-ROADMAP.md Phase 2 Deliverable 8

---

### S13-02: AppImage Packaging in CI
**As a** Linux user, **I want** an AppImage download, **so that** I can run the app without installation.

**Acceptance Criteria:**
- [ ] AppImage built in CI on ubuntu-latest runner
- [ ] Uses existing `packaging/linux/build-appimage.sh` script or equivalent
- [ ] Output: `RadicalTrainingPlatform-x.y.z-x86_64.AppImage`
- [ ] AppImage is executable and launches
- [ ] AppImage artifact uploaded to GitHub Release
- [ ] Desktop entry and icon included

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Update build-appimage.sh for CI | `packaging/linux/build-appimage.sh` | 1h | Make CI-friendly (no interactive prompts) |
| Add AppImage job to release.yml | `.github/workflows/release.yml` | 30 min | Ubuntu runner, run script |
| Install appimagetool in CI | `release.yml` | 15 min | Download and extract |
| Verify artifact naming | `release.yml` | 10 min | Include version in filename |
| Test AppImage from CI | Ubuntu VM | 30 min | Download and run |
| Document AppImage usage | `README.md` | 10 min | chmod +x and run |

**Dependencies:** S1-06 (Flatpak manifest should be fixed; AppImage is separate)

**References:** DESIGN-PLAN.md Quick Win 9 (AppImage script mentioned)

---

### S13-03: DMG Packaging in CI
**As a** macOS user, **I want** a DMG download, **so that** I can install the app on macOS.

**Acceptance Criteria:**
- [ ] DMG built in CI on macos-latest runner
- [ ] Includes .app bundle with proper Info.plist
- [ ] Signed (if certificates available) or unsigned with notarization docs
- [ ] Icon included in .app bundle
- [ ] DMG artifact uploaded to GitHub Release
- [ ] DMG opens and app launches on macOS

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Create or update DMG script | `packaging/macos/build-dmg.sh` | 1h | Use create-dmg or hdiutil |
| Add DMG job to release.yml | `.github/workflows/release.yml` | 30 min | macOS runner |
| Configure Info.plist | `packaging/macos/Info.plist` | 20 min | Version from Directory.Build.props |
| Add icon to bundle | `packaging/macos/` | 20 min | .icns file |
| Test DMG from CI | macOS machine | 30 min | Download and install |
| Document macOS install | `README.md` | 10 min | Drag to Applications |

**Dependencies:** S13-01 (release workflow must exist)

**References:** DESIGN-MATRIX-AND-ROADMAP.md Phase 2 Deliverable 8

---

### S13-04: MSI/Windows Installer Packaging
**As a** Windows user, **I want** an installer, **so that** I can install the app easily.

**Acceptance Criteria:**
- [ ] MSI or EXE installer built in CI on windows-latest runner
- [ ] Uses WiX, Inno Setup, or MSIX packaging
- [ ] Installs to Program Files or user-local
- [ ] Creates Start Menu shortcut
- [ ] Uninstaller included
- [ ] Version from Directory.Build.props
- [ ] Installer artifact uploaded to GitHub Release

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Choose installer tool | `packaging/windows/` | 30 min | WiX v4, Inno Setup, or MSIX |
| Create installer script | `packaging/windows/build-installer.ps1` | 1.5h | Script to build installer |
| Add Windows job to release.yml | `.github/workflows/release.yml` | 30 min | Windows runner |
| Configure app icon | `packaging/windows/` | 20 min | .ico file |
| Test installer from CI | Windows VM | 30 min | Install, launch, uninstall |
| Document Windows install | `README.md` | 10 min | Run installer |

**Dependencies:** S13-01 (release workflow must exist)

**References:** DESIGN-MATRIX-AND-ROADMAP.md Phase 2 Deliverable 8

---

### S13-05: Version Stamping from Directory.Build.props
**As a** release engineer, **I want** version to be automatically propagated to all artifacts, **so that** version drift is impossible.

**Acceptance Criteria:**
- [ ] Version read from `Directory.Build.props` in CI
- [ ] Version embedded in: assembly, AppImage filename, DMG, MSI, .slnx
- [ ] Version displayed in app About dialog
- [ ] Version in GitHub Release title and body
- [ ] No hardcoded versions in packaging scripts

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Extract version in CI | All packaging scripts | 1h | `grep '<Version>' Directory.Build.props` or MSBuild property |
| Propagate to AppImage | `build-appimage.sh` | 15 min | Use extracted version in filename |
| Propagate to DMG | `build-dmg.sh` | 15 min | Version in Info.plist and filename |
| Propagate to MSI | Installer script | 15 min | Version in product code |
| Add About dialog | `Views/AboutView.axaml` | 30 min | Show version from assembly |
| Test version consistency | CI | 15 min | Verify all artifacts have same version |

**Dependencies:** S1-07 (Directory.Build.props must exist), S13-01 through S13-04

**References:** DESIGN-PLAN.md Quick Win 10 (SemVer centralization)

---

### S13-06: GitHub Releases with Artifacts Upload
**As a** user, **I want** downloadable release artifacts on GitHub, **so that** I can get the latest version easily.

**Acceptance Criteria:**
- [ ] release.yml creates GitHub Release automatically
- [ ] Release title: version tag (e.g., "v0.5.0")
- [ ] Release body: auto-generated from CHANGELOG or RELEASE.md
- [ ] All artifacts uploaded to release:
  - AppImage
  - DMG
  - MSI/EXE
  - Portable ZIP (optional)
- [ ] Release marked as pre-release for v0.5 (not v1.0)
- [ ] Release notes include: new features, bug fixes, known issues

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Add create-release step | `.github/workflows/release.yml` | 30 min | Use `gh release create` or `actions/create-release` |
| Generate release notes | `release.yml` | 20 min | From CHANGELOG.md or RELEASE.md |
| Add artifact upload steps | `release.yml` | 30 min | One per artifact type |
| Mark as pre-release | `release.yml` | 10 min | `prerelease: true` for v0.x |
| Test with v0.0.0-test | Feature branch | 20 min | Verify release created, artifacts present |
| Document release process | `docs/RELEASE-PROCESS.md` | 20 min | Step-by-step for maintainers |

**Dependencies:** S13-01 through S13-05

**References:** DESIGN-MATRIX-AND-ROADMAP.md Phase 2 Deliverable 8

---

## Sprint Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Apple developer certificate required for signed DMG | Medium | Medium | Build unsigned DMG for v0.5; document Gatekeeper bypass; plan signing for v1.0 |
| Windows code signing expensive/complex | Medium | Low | Unsigned installer for v0.5; SmartScreen warning documented |
| AppImage requires specific glibc versions | Medium | Medium | Build on oldest supported Ubuntu; test on multiple distros |
| GitHub Actions runner disk space limits | Low | Medium | Clean up intermediate files; use artifacts sparingly |
| Version extraction regex fragile | Low | Low | Use MSBuild to read version: `dotnet msbuild -target:GetVersion` |

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] CI pipeline green
- [ ] Release workflow tested with dummy tag
- [ ] Code reviewed
- [ ] Documentation updated

## Sprint Review Checklist

- [ ] Tag push triggers release workflow
- [ ] AppImage builds and runs on Ubuntu
- [ ] DMG builds and mounts on macOS
- [ ] MSI installs and runs on Windows
- [ ] All artifacts uploaded to GitHub Release
- [ ] Version consistent across all artifacts
- [ ] Release notes accurate and helpful
- [ ] No regressions in existing functionality
- [ ] Technical debt documented (if deferred)
