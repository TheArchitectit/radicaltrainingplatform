# Sprint 3: Architecture — Interfaces & DI

**Phase:** Foundation  
**Duration:** Week 5 - Week 6  
**Goal:** Extract interfaces from static services and wire a DI container so the codebase becomes testable and extensible.

---

## Sprint Backlog

| ID | Story | Points | Assignee | Status |
|---|---|---|---|---|
| S3-01 | Create IBlueprintService interface | 2 | TBD | To Do |
| S3-02 | Create IReferenceService interface | 2 | TBD | To Do |
| S3-03 | Rename BlueprintService and implement interface | 3 | TBD | To Do |
| S3-04 | Rename ReferenceService and implement interface | 3 | TBD | To Do |
| S3-05 | Add Microsoft.Extensions.DependencyInjection to Core | 2 | TBD | To Do |
| S3-06 | Wire DI container in Desktop Program.cs | 3 | TBD | To Do |
| S3-07 | Update all call sites to use injected interfaces | 3 | TBD | To Do |
| S3-08 | Mark old static methods [Obsolete] for WinForms compat | 1 | TBD | To Do |

**Total:** 19 points

---

## User Stories

### S3-01: Create IBlueprintService Interface
**As a** developer, **I want** a blueprint service interface, **so that** implementations can be swapped and tested independently.

**Acceptance Criteria:**
- [ ] `IBlueprintService.cs` exists in `RadicalTrainingPlatform.Core/Abstractions/`
- [ ] Interface defines:
  - `ExamBlueprint? GetBlueprint(string examCode)`
  - `Dictionary<string, int> CalculateCoverage(string examCode, List<string> questionTexts)`
  - `List<(string ObjId, string ObjTitle)> GetObjectivesForQuestion(string examCode, string questionText)`
  - `List<(string Section, string Description)> GetBibleSections(string examCode)`
- [ ] All method signatures are async-ready (return types suitable for future async)
- [ ] XML documentation comments on all members

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Create IBlueprintService interface | `RadicalTrainingPlatform.Core/Abstractions/IBlueprintService.cs` | 20 min | See DESIGN-PLAN.md Deliverable 5 |
| Add XML docs | Interface file | 10 min | Describe each method's purpose and parameters |
| Verify namespace | Interface file | 5 min | `RadicalTrainingPlatform.Core.Abstractions` |

**Dependencies:** None

**References:** DESIGN-PLAN.md Deliverable 5

---

### S3-02: Create IReferenceService Interface
**As a** developer, **I want** a reference service interface, **so that** knowledge base lookups can be mocked in tests.

**Acceptance Criteria:**
- [ ] `IReferenceService.cs` exists in `RadicalTrainingPlatform.Core/Abstractions/`
- [ ] Interface defines:
  - `string GetReferenceForQuestion(Question q)`
  - `List<(string Title, string Url)> GetKBLinksForQuestion(Question q)`
  - `List<(string Title, string Url)> GetGeneralResources()`
- [ ] XML documentation comments on all members

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Create IReferenceService interface | `RadicalTrainingPlatform.Core/Abstractions/IReferenceService.cs` | 20 min | See DESIGN-PLAN.md Deliverable 5 |
| Add XML docs | Interface file | 10 min | Document KB link structure |
| Verify namespace | Interface file | 5 min | `RadicalTrainingPlatform.Core.Abstractions` |

**Dependencies:** None

**References:** DESIGN-PLAN.md Deliverable 5

---

### S3-03: Rename BlueprintService and Implement Interface
**As a** developer, **I want** the existing BlueprintService converted to an instance class behind an interface, **so that** it can be injected and tested.

**Acceptance Criteria:**
- [ ] `BlueprintService.cs` renamed to `HardcodedBlueprintService.cs`
- [ ] Class changed from `public static class` to `public class`
- [ ] Class implements `IBlueprintService`
- [ ] All static methods converted to instance methods
- [ ] Default constructor added (no parameters needed — data is embedded)
- [ ] Old static methods retained with `[Obsolete("Use injected IBlueprintService")]` attribute for backward compatibility
- [ ] Build passes with zero warnings (except Obsolete warnings, which are expected)

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Rename file and update class | `RadicalTrainingPlatform.Core/Services/HardcodedBlueprintService.cs` | 1h | Remove `static` modifier, add `: IBlueprintService` |
| Convert static methods to instance | Service file | 30 min | Remove `static` from all method signatures |
| Add backward-compat static wrappers | Service file | 20 min | `[Obsolete]` wrappers calling singleton instance |
| Verify build | Solution | 15 min | `dotnet build` |
| Verify tests still pass | Solution | 15 min | `dotnet test` |

**Dependencies:** S3-01 (IBlueprintService must exist)

**References:** DESIGN-PLAN.md Deliverable 5

---

### S3-04: Rename ReferenceService and Implement Interface
**As a** developer, **I want** the existing ReferenceService converted to an instance class behind an interface, **so that** it can be injected and tested.

**Acceptance Criteria:**
- [ ] `ReferenceService.cs` renamed to `HardcodedReferenceService.cs`
- [ ] Class changed from `static class` to `public class`
- [ ] Class implements `IReferenceService`
- [ ] All static methods converted to instance methods
- [ ] Old static methods retained with `[Obsolete]` attribute
- [ ] Build passes

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Rename file and update class | `RadicalTrainingPlatform.Core/Services/HardcodedReferenceService.cs` | 1h | Similar to BlueprintService |
| Convert static methods to instance | Service file | 30 min | Remove `static` |
| Add backward-compat static wrappers | Service file | 20 min | `[Obsolete]` wrappers |
| Verify build | Solution | 15 min | `dotnet build` |
| Verify tests still pass | Solution | 15 min | `dotnet test` |

**Dependencies:** S3-02 (IReferenceService must exist)

**References:** DESIGN-PLAN.md Deliverable 5

---

### S3-05: Add Microsoft.Extensions.DependencyInjection to Core
**As a** developer, **I want** the DI package referenced in Core, **so that** services can be registered and resolved.

**Acceptance Criteria:**
- [ ] `Microsoft.Extensions.DependencyInjection` added to Core.csproj
- [ ] Version compatible with .NET 10 (8.0.x or 10.0.x preview)
- [ ] Build passes with the new package
- [ ] No other package changes required

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Add package reference | `RadicalTrainingPlatform.Core/RadicalTrainingPlatform.Core.csproj` | 5 min | `<PackageReference Include="Microsoft.Extensions.DependencyInjection" Version="8.0.0" />` |
| Verify build | Solution | 10 min | `dotnet build` |
| Verify no warnings | Solution | 5 min | Check for package downgrades |

**Dependencies:** None

**References:** DESIGN-PLAN.md Section 2.5 (DI Container decision)

---

### S3-06: Wire DI Container in Desktop Program.cs
**As a** developer, **I want** the Avalonia app to use a DI container, **so that** services are resolved, not instantiated directly.

**Acceptance Criteria:**
- [ ] `ServiceCollection` configured in Desktop `Program.cs` or `App.axaml.cs`
- [ ] Registrations:
  - `IFileProvider` -> `DefaultFileProvider` (Singleton)
  - `IExamRepository` -> `MarkdownExamRepository` (Singleton, factory)
  - `IQuestionParser` -> `QuestionParser` (Singleton)
  - `IBlueprintService` -> `HardcodedBlueprintService` (Singleton)
  - `IReferenceService` -> `HardcodedReferenceService` (Singleton)
  - `ExamSessionViewModel` -> Scoped (new instance per session)
- [ ] `ServiceProvider` built and accessible from `App`
- [ ] MainWindow receives `IServiceProvider` via constructor or property
- [ ] No `new` calls for services in MainWindow (except VM creation via DI)

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Configure ServiceCollection | `RadicalTrainingPlatform.Desktop/Program.cs` | 1h | See DESIGN-PLAN.md registration profile |
| Build ServiceProvider at startup | `Program.cs` | 15 min | Store on `App` class for access |
| Pass IServiceProvider to MainWindow | `Program.cs` / `App.axaml.cs` | 20 min | Avalonia service provider pattern |
| Remove direct `new` instantiations | `MainWindow.axaml.cs` | 30 min | Use `provider.GetRequiredService<T>()` |
| Verify build and run | Solution | 20 min | App launches, services resolve |

**Dependencies:** S3-03, S3-04 (implementations must exist), S3-05 (DI package must be referenced), S1-04 (QuestionParser constructor simplified)

**References:** DESIGN-PLAN.md Section 2.5 (Registration profile)

---

### S3-07: Update All Call Sites to Use Injected Interfaces
**As a** developer, **I want** all code to use injected services, **so that** the codebase is fully DI-compliant and testable.

**Acceptance Criteria:**
- [ ] MainWindow.axaml.cs uses `IBlueprintService` instead of `BlueprintService` static calls
- [ ] MainWindow.axaml.cs uses `IReferenceService` instead of `ReferenceService` static calls
- [ ] BlueprintView receives `IBlueprintService` via constructor
- [ ] StatsView (if reachable) uses injected services
- [ ] No remaining direct `new ServiceClass()` calls for DI-registered services
- [ ] All tests still pass
- [ ] WinForms project compiles (may still use static methods)

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Update MainWindow for IBlueprintService | `MainWindow.axaml.cs` | 30 min | Change static calls to instance calls on injected service |
| Update MainWindow for IReferenceService | `MainWindow.axaml.cs` | 30 min | Same pattern |
| Update BlueprintView constructor | `Views/BlueprintView.axaml.cs` | 20 min | Accept `IBlueprintService` parameter |
| Audit all call sites | Solution | 30 min | `grep -rn "BlueprintService\."` and `"ReferenceService\."` |
| Verify tests pass | Solution | 15 min | `dotnet test` |
| Verify WinForms compiles | Solution | 15 min | May use `[Obsolete]` wrappers |

**Dependencies:** S3-06 (DI container must be wired)

**References:** DESIGN-PLAN.md Part 6 (File-Level Change Map)

---

### S3-08: Mark Old Static Methods [Obsolete] for WinForms Compatibility
**As a** legacy maintainer, **I want** WinForms to continue compiling while deprecation warnings guide future migration.

**Acceptance Criteria:**
- [ ] Old static methods in BlueprintService have `[Obsolete]` attribute (if not renamed)
- [ ] Old static methods in ReferenceService have `[Obsolete]` attribute (if not renamed)
- [ ] Obsolete messages direct developers to use DI/injected interfaces
- [ ] WinForms project builds with warnings (not errors)
- [ ] No functional changes to WinForms behavior

**Technical Tasks:**
| Task | File | Estimate | Notes |
|---|---|---|---|
| Add [Obsolete] to static wrappers | `HardcodedBlueprintService.cs` | 15 min | Message: "Use injected IBlueprintService. See DESIGN-PLAN.md Phase 1.5" |
| Add [Obsolete] to static wrappers | `HardcodedReferenceService.cs` | 15 min | Same pattern |
| Verify WinForms builds | Legacy project | 15 min | `dotnet build` on WinForms |
| Document migration path | `docs/WINFORMS-MIGRATION.md` (optional) | 20 min | Brief guide on updating WinForms to use DI |

**Dependencies:** S3-03, S3-04 (services must be renamed and have static wrappers)

**References:** DESIGN-PLAN.md Finding 13 (WinForms static method issue)

---

## Sprint Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Converting 600+ line static class introduces subtle bugs | Medium | High | Comprehensive test coverage from S2; refactor in small steps; use IDE rename refactor |
| Avalonia DI integration is non-trivial | Medium | Medium | Use Splat + ReactiveUI integration, or simple `App.Services` property |
| WinForms breaks completely due to API changes | Medium | High | Retain `[Obsolete]` static wrappers; test WinForms build after each change |
| Circular dependency in service graph | Low | High | IExamRepository depends on IFileProvider only; no cycles expected |
| DependencyInjection package not compatible with .NET 10 | Low | High | Use 8.0.x version; it's compatible with net10.0 |

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Unit tests pass (>= 70% coverage on changed files)
- [ ] CI pipeline green
- [ ] Code reviewed
- [ ] Documentation updated

## Sprint Review Checklist

- [ ] Desktop app launches and all existing features work
- [ ] Services resolve through DI container (no direct `new` calls)
- [ ] BlueprintView can be instantiated with injected IBlueprintService
- [ ] WinForms project still compiles (with deprecation warnings)
- [ ] All tests pass
- [ ] No regressions in existing functionality
- [ ] Technical debt documented (if deferred)
