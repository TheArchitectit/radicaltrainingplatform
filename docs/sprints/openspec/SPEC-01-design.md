# OpenSpec SPEC-01 — Design

**Source:** [OpenSpec package rtp-beginner-tracks-2026-10](../../drive-ingest-2026-10-10/RTP-Beginner-Tracks-Openspec-Change-Package-A-Network-NCA75-v2.md), SPEC-01
**Executed in:** [SPRINT-45](../SPRINT-45.md)..[SPRINT-48](../SPRINT-48.md) (design shapes all tasks) · **Depends on:** nothing

## Design principles

1. **Smallest extension, not a rewrite.** The existing runtime (QuestionParser, IExamRepository, Errata, SessionStore, the 47-route PWA shell, the desktop exam-session UI) stays. New capability arrives as a manifest layer, three study views, one scenario renderer and one gateway — not as new engines.
2. **Nothing silently changes meaning.** Content IDs are stable; blueprint remapping attaches new mappings instead of renumbering questions; changed content never reassigns a learner’s history (Plan v2 C-01, F-02).
3. **Deterministic core, optional AI.** Scoring, scheduling, storage, scenario pass/fail and progress are deterministic and work offline. The tutor is an optional, disclosed, removable layer (Plan v2 A-01, G-03).
4. **Gates must be able to fail.** Every gate added or repaired ships with a fixture that proves it fails on bad input. A gate that cannot fail is a finding, not a control.
5. **Honest labeling.** Beginner preview coverage is labeled; simulation is labeled; recorded tutor output is labeled; non-endorsement is stated in the exact owner-approved string.

## Architecture delta

Existing (verified): Core owns parsing, blueprints, errata, session storage; Web is a static Nutanix-simulator PWA; Desktop hosts exam sessions; Legacy.WinForms embeds a second, diverging simulator copy.

Added by this change:

```
content/
  tracks/
    track-aplus/track.json            # track manifest
    track-netplus/track.json
    track-nca/track.json
  exams/
    COMPTIA-A-1201/exam.json          # exam manifest (objective map, weights, versions)
    COMPTIA-A-1201/lessons/*.md       # original lesson text (reviewed)
    COMPTIA-A-1201/questions/*.md     # original scored items, parser-format markdown
    COMPTIA-A-1202/...
    COMPTIA-NET-009/...
    NCA-75/exam.json                  # current 7.5 objective map (manifest overrides hardcoded)
    NCA-75/remap.csv                  # per-item: old domain -> new objective, review state
  provenance/
    <exam-id>/<item-id>.json          # per-item provenance records (C-02)
src additions:
  Core/Services/ManifestExamCatalog.cs        # manifest-first catalog
  Core/Services/ManifestBlueprintService.cs   # versioned manifest blueprints
  Core/Models/TrackManifest.cs, ExamManifest.cs, LessonRef.cs
  Web/js/views/track-picker.js                # new
  Web/js/views/lesson-reader.js               # new
  Web/js/views/practice.js                    # new (study + review)
  Web/js/views/ticket-lab.js                  # shared scenario renderer
  Web/js/core/ProgressStore.js                # wraps StateStore
services/ai-gateway/                          # tutor slice only (SPEC-08); minimal, single-purpose
```

## Locked decisions (each recorded with its assumption ID in [SPEC-15](SPEC-15-assumptions.md))

- **D1 — Manifest-over-filename for exam identity.** New packs resolve identity from exam.json, never from DeriveExamCode. DeriveExamCode remains for legacy Nutanix files, regression-pinned by DeriveExamCodeTests. (ASM-01)
- **D2 — Web PWA is the demo host.** The October 23 demo runs on the installed PWA. Desktop remains a supported shell but is not on the demo critical path. (ASM-02)
- **D3 — One authoritative simulator source, consumed everywhere.** Design response to the owner’s cross-platform directive: the diverging simulator copies (Web vs Legacy.WinForms/LabSimulator) SHALL be collapsed to a single source so they cannot fork again. Web is the surviving source of truth; Legacy.WinForms/LabSimulator either consumes the Web build output verbatim or is removed from the build — the executor picks during implementation and records the choice; CI fails if two authoritative copies are detected (Plan v2 F-04). (ASM-03)
- **D4 — New content lives under content/, not repo root.** lint-content.py is extended to cover it (SPEC-10); root-level Nutanix files are untouched. (ASM-04)
- **D5 — One shared ticket renderer for A+ and Network+ scenarios.** ticket-lab.js renders synthetic help-desk tickets and a configuration panel; it is not a router emulator and makes no real network calls. (ASM-05)
- **D6 — Tutor is a separate minimal gateway, not in-process.** Browser never holds a provider key; the gateway is the only component that can call a provider. (ASM-06)
- **D7 — Progress is local-first in ProgressStore** (IndexedDB via StateStore, localStorage fallback), keyed by stable item IDs. Export/import and sync are out of scope for these deadlines. (ASM-07)
- **D8 — NCA-75 keeps its internal ID; display names come from the manifest.** exam.json for NCA-75 carries displayName “Nutanix Certified Associate 7.5”, official blueprint date June 15, 2026, product versions AOS 7.5 / AHV 11.0 / Prism Central pc.7.5, and a source review date. (ASM-08)

## Data model (normative shapes)

**track.json:** `{ "trackId", "title", "examIds": [], "audience", "previewLabel": "beginner preview", "disclaimer", "order" }`.

**exam.json:** `{ "examId", "vendor", "displayName", "officialVersion", "objectivesDocVersion", "sourceUrl", "sourceReviewDate", "productVersions": {}, "sections": [{ "number", "title", "weightPercent"?, "objectives": [{ "id", "title", "lessonIds": [] }] }], "questionPolicy": { "authorship": "original", "review": "human-required" } }`. weightPercent is optional because the NCA pilot uses equal study allocations, explicitly not official weights.

**Question markdown** stays in the existing parser format (`## DOMAIN <n>`, `### Q<n>`, `- A)` options, `**Answer:**` / `**Correct Answer:**`, explanation). Domain numbers map to manifest section numbers; the manifest, not the heading text, is the authority on section titles.

**Provenance record per scored item** (Plan v2 C-02): `{ "itemId", "examId", "objectiveId", "author", "assistance": "none|ai-drafted", "sourceUrl"?, "sourceLocator"?, "retrievalDate"?, "rightsBasis", "reviewer", "reviewDate", "originalityCheck": "no-exam-item-proximity", "status": "draft|reviewed|released" }`. Missing fields block release (CI, SPEC-10).

**remap.csv columns:** itemId, sourceFile, oldDomain, oldObjectiveId, newSection, newObjectiveId, productVersion, keyReviewed, explanationReviewed, rightsStatus, reviewer, notes. Existing question IDs never change; remap attaches mapping.

**Progress record (ProgressStore):** `{ "itemId", "examId", "attempts", "correct", "lastResult", "lastAt", "flags": [] }` under key `progress/<examId>/<itemId>`; scenario records under `scenario/<scenarioId>`; station reset clears the `progress/` and `scenario/` keyspaces only.

## Demo-mode requirements that shape the design

Rotating student groups share one station. Therefore: reset-between-groups is a first-class, one-tap action (REQ-UI-07); no learner identity is collected (REQ-UI-08); the tutor asks only for a learning question (REQ-AI-04); and every stateful surface must be provably resettable in the test matrix (TM-40 series). The gateway scenario starts from a seeded broken state and its reset restores that exact seed.

## Cross-platform requirement (owner-directed, hard requirement)

Owner direction, October 10, 2026, verbatim: “This was working on windows but we need it cross platform.” Cross-platform is a hard requirement of this package:

- **Primary surface: the Web PWA.** The October 23 audience may be on school Chromebooks; the PWA SHALL be installable and fully functional in current Chrome/Edge/Safari on ChromeOS, Windows, Linux and macOS without any native install. (REQ-XPAT-01)
- **Desktop parity: Avalonia on Windows, Linux and macOS.** Desktop SHALL build and pass its smoke suite on all three OS targets; the WinForms project remains Windows-only legacy and is not a parity target. (REQ-XPAT-02)
- **Per-platform acceptance criteria** live in the test matrix (TM-50 series): each critical flow (boot, track picker, lesson, practice, scenario, reset, progress persistence) is verified per platform, not assumed portable.
- **Historical reconciliation.** Roger reports the simulator worked on Windows. The runtime audit proves the current head’s PWA does not boot (SPEC-09, R-01; broken import in pe-reports.js, in tree since June). Both statements are preserved without inventing a cause: Roger reports it worked on Windows, and which build he used is unknown; the current PWA source at the audited head verifiably does not boot anywhere. This package repairs the head and removes the fork so one source serves every host. (ASM-15)

## Demo mode for all simulator content (owner-directed, named feature)

Owner direction, October 10, 2026, verbatim: “Plus we need the demo mode to work for all content aka simulator”. Demo mode is a named feature, not a demo-day workaround:

- **Coverage:** all 44 scenarios across all 78 simulator objectives — the full existing simulator catalog, plus the new A+/Network+ ticket scenarios and the four NCA beginner scenarios. (REQ-DEMO-01)
- **Seeded deterministic state.** Each scenario declares a fixture seed; entering demo mode loads that seed exactly. (REQ-DEMO-02)
- **One-click station reset** restoring every scenario and all progress to the seed state. (REQ-DEMO-03)
- **No account, no required persistence, no network** for any simulator content. (REQ-DEMO-04)
- **Presentable in a live room:** readable at projector distance, keyboard-operable, no hover-only affordances on the demo path. (REQ-DEMO-05)
- **Dependency:** demo mode is blocked until the boot repair (R-01) and the validator repairs (R-02: 16/44 scenarios auto-pass on a fresh seed; us-bucket-01 unpassable) land, because a demo of an auto-passing or impossible scenario is a live credibility failure. Acceptance requires a scripted pass over all 44+ scenarios proving each boots, runs, and correctly reports both incomplete and complete states in demo mode (TM-45 series). (REQ-DEMO-06)

## What this design deliberately does not do

No sync, no accounts, no spaced repetition (Plan v2 L-04 deferred), no second-vendor work beyond these packs, no PWA-first rewrite, no blind merge of the two divergent simulator copies’ internals (consolidation is single-source with host adapters per D3, not a diff of the two forks), no public deployment. Each exclusion is a scope fence with a reason: the two calendar deadlines bound the work, and Plan v2 already owns the long-term shape.

## Failure modes the design refuses

- A learner finishes the demo believing they are exam-ready. → Refused by coverage labels, exploratory-coverage labels and the no-readiness-claims rule (REQ-AP-03, TM-37).
- A reviewer cannot tell why an item exists. → Refused by mandatory provenance (C-02) and the reviewer workflow (SPEC-11 11.8).
- A demo station carries the previous group’s state. → Refused by seed+reset with verification (REQ-DEMO-03, TM-44).
- A future contributor re-forks the simulator. → Refused by the single-source rule plus the CI duplication gate (D3, R-11).
- A green pipeline that proves nothing. → Refused by fixture-tested gates (TM-70 series).
- A tutor that quietly becomes an exam oracle. → Refused by the input contract, corpus allowlist, citation validation and the rehearsed refusal cases (SPEC-08).
