# OpenSpec SPEC-02 — Track/Exam Manifests and Parser Compatibility

**Source:** [OpenSpec package rtp-beginner-tracks-2026-10](../../drive-ingest-2026-10-10/RTP-Beginner-Tracks-Openspec-Change-Package-A-Network-NCA75-v2.md), SPEC-02
**Executed in:** [SPRINT-45](../SPRINT-45.md) (T-06, T-07) · **Gates:** TM-11, TM-12, TM-13 · **Depends on:** nothing (first capability to land)

## Purpose

Give RTP explicit, versioned identity for three tracks and four exams without breaking the five existing Nutanix banks, and close the exam-code truncation gap before any new pack is named.

**The gap that matters most:** `QuestionParser.DeriveExamCode` keeps at most the first two hyphen-separated segments. `NCA-75-Part1.md` → `NCA-75` only because the second segment is numeric. A file named `COMPTIA-A-1201-Part1.md` would derive `COMPTIA-A` — truncating the exam number and colliding Core 1 with Core 2. New tracks therefore resolve identity from manifests, never from filenames.

## Requirements (normative)

| ID | SHALL | Scenario |
|---|---|---|
| REQ-MAN-01 | Every track ships `track.json`, every exam ships `exam.json` per SPEC-01 01.03. Exam IDs exactly: `COMPTIA-A-1201`, `COMPTIA-A-1202`, `COMPTIA-NET-009`, `NCA-75`. Track IDs exactly: `track-aplus`, `track-netplus`, `track-nca`. | Manifest validator in CI: all four exam manifests parse, required fields present, three track manifests reference only those four exam IDs. |
| REQ-MAN-02 | Exam identity for new packs resolves from `exam.json`, never from `DeriveExamCode`. `ManifestExamCatalog` reads manifests first; legacy fallback logs truncation as a warning. | Given `content/exams/COMPTIA-A-1201/questions/core1-part1.md`, catalog builds exam ID `COMPTIA-A-1201` with manifest display name. Same file with no manifest → legacy path + truncation warning. |
| REQ-MAN-03 | `DeriveExamCode` behavior for existing files is unchanged and pinned: legacy 16 cases pass unmodified, plus new cases documenting the `COMPTIA-A-1201-Part1.md` → `COMPTIA-A` truncation. | `dotnet test --filter FullyQualifiedName~DeriveExamCode` green with no legacy test modified. |
| REQ-MAN-04 | Blueprints are manifest-overridable: `ManifestBlueprintService` implements `IBlueprintService`, takes precedence over `HardcodedBlueprintService` for manifest-covered exams. | Given NCA-75 `exam.json` with current sections, blueprint view renders manifest sections/objectives/weights; `InitNca75` output is not consulted. |
| REQ-MAN-05 | Cross-exam ID collision is impossible: validator fails CI on duplicate exam IDs, repeated question IDs within an exam, or progress-key collisions (`progress/<examId>/<itemId>` namespacing). | Fixture tree with duplicated exam ID fails CI naming both files. |
| REQ-MAN-06 | Every manifest carries `sourceUrl`, `sourceReviewDate`, `officialVersion`, `objectivesDocVersion`. Stale review date (>180 days) → loud CI warning with exam ID and date; missing `sourceUrl` → CI fails. | Both branches proven by fixtures. |
| REQ-MAN-07 | Incomplete objective coverage is visible: coverage = (objectives with ≥1 released lesson AND ≥1 released scored item) / manifest objectives, shown with the “beginner preview” label. No screen computes or implies pass readiness. | October 23 A+ pack renders covered subset + preview label. |

## Data model (normative shapes)

- `track.json`: `{ trackId, title, examIds[], audience, previewLabel: "beginner preview", disclaimer, order }`
- `exam.json`: `{ examId, vendor, displayName, officialVersion, objectivesDocVersion, sourceUrl, sourceReviewDate, productVersions{}, sections[{ number, title, weightPercent?, objectives[{ id, title, lessonIds[] }] }], questionPolicy: { authorship: "original", review: "human-required" } }` — `weightPercent` only when the official source publishes weights (CompTIA); NCA manifest omits it (equal study allocation, ASM-13).
- Question markdown stays in the existing parser format (`## DOMAIN <n>`, `### Q<n>`, `- A)` options, `**Answer:**`/`**Correct Answer:**`); the manifest, not the heading text, is the authority on section titles.

## Files

**New:** `content/tracks/*/track.json`; `content/exams/{COMPTIA-A-1201,COMPTIA-A-1202,COMPTIA-NET-009,NCA-75}/exam.json`; `RadicalTrainingPlatform.Core/Models/TrackManifest.cs`; `Core/Models/ExamManifest.cs`; `Core/Models/LessonRef.cs`; `Core/Services/ManifestExamCatalog.cs`; `Core/Services/ManifestBlueprintService.cs`; `Core/Abstractions/IManifestLoader.cs`; `scripts/validate-manifests.py`; `Core.Tests/ManifestCatalogTests.cs`; `Core.Tests/ManifestBlueprintTests.cs`; additions to `Core.Tests/DeriveExamCodeTests.cs`.

**Modified:** `Core/Services/QuestionParser.cs` (only the R-07 AnswerRegex repair; no derivation changes); `Core.Tests/CompositionRootTests.cs`; `scripts/lint-content.py` (SPEC-10); `.github/workflows/build.yml` (run validator).

## Commands

```bash
python3 scripts/validate-manifests.py
dotnet test RadicalTrainingPlatform.Core.Tests --filter "FullyQualifiedName~Manifest"
dotnet test RadicalTrainingPlatform.Core.Tests --filter "FullyQualifiedName~DeriveExamCode"
```

## Authoring rules

- `examId` is forever — corrections arrive as new pack versions with revision fields, never renames.
- Objective IDs in question front matter must exist in the manifest; orphan checks run in both directions (released objective with zero released items is allowed but reported).
- `sourceReviewDate` is set when a human actually opens the official source — never copied from the spec.
- Legacy root banks keep filename-derived identity until their own manifests exist; the catalog merges both worlds (TM-12).

## Acceptance

All REQ-MAN-01..07 scenarios pass at the release head on the Linux leg; catalog shows seven exams (five Nutanix legacy + four new, NCA-75 shared) with correct display names; coverage labels render; no legacy test modified to pass.
