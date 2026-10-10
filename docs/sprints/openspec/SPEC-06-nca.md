# OpenSpec SPEC-06 — Nutanix NCA 7.5 Track (track-nca) — Beta-to-Current Remap

**Source:** [OpenSpec package rtp-beginner-tracks-2026-10](../../drive-ingest-2026-10-10/RTP-Beginner-Tracks-Openspec-Change-Package-A-Network-NCA75-v2.md), SPEC-06
**Executed in:** [SPRINT-45](../SPRINT-45.md) (T-09 inventory start) + [SPRINT-48](../SPRINT-48.md) (T-31..T-34) · **Gates:** TM-10 series NCA rows · **Depends on:** SPEC-02 (manifests), SPEC-08A (RedEye lane)

## Alignment and frame

Current official target: the NCA 7.5 exam leading to NCA 7 certification, per the official blueprint guide dated **June 15, 2026**, covering AOS 7.5, AHV 11.0 and Prism Central pc.7.5. The certification page URL and some training text still mention 6.10; the page body and guide identify 7.5 — **the guide wins**. Internal exam ID stays `NCA-75` (progress history and existing filenames depend on it); all display strings come from the manifest (REQ-MAN-04, D8).

**The verified mismatch:** `HardcodedBlueprintService.InitNca75` (lines 540-641) encodes the beta structure — “Describe Lifecycle Management” (1.1-1.3), “Describe Nutanix Basic Administration” (2.1-2.6), “Maintain Environmental Health” (3.1-3.4), “Describe Cluster Configuration Options” (4.1-4.4) with weights 20/30/25/25. The current guide’s structure:

| Section | Title | Objectives |
|---|---|---|
| 1 | Solutions and tools | 1.1 NCI components/use cases; 1.2 adjacent solutions (storage, database, cloud management, Kubernetes, AI, EUC); 1.3 Move, NGT, Foundation, Witness, SSR, X-Ray, Collector |
| 2 | Platform administration | 2.1 VM tasks; 2.2 virtual networking; 2.3 storage operations; 2.4 licensing |
| 3 | Cluster configuration and maintenance | 3.1 valid cluster options; 3.2 hardware maintenance; 3.3 software maintenance |
| 4 | Health and monitoring | 4.1 health checks; 4.2 alerts/events; 4.3 support functions; 4.4 workload performance |

Remap means **attach new mappings**; it never means renumber questions or relabel beta content as current (Plan v2 C-07).

## Requirements (normative)

| ID | SHALL | Scenario |
|---|---|---|
| REQ-NCA-01 | Full inventory of all 140 NCA-75 items (`NCA-75-Part1.md`, `NCA-75-Part2.md`, `NCA-75-Part3-GapFill.md`) in `content/exams/NCA-75/remap.csv` with the SPEC-01 columns. Every item gets a row; zero unowned. | Validator: exactly 140 rows, every item ID resolves to a parsed question, no row lacks a review state. |
| REQ-NCA-02 | California cut: reviewed 40-item pilot, 10 items per current section, plus 14 short lessons matching the 14 current objectives. Equal allocation is a study choice, not an official weight; exam.json says so. | Release build: exactly 40 reviewed items and 14 lessons released, coverage labeling shows pilot scope, remaining bank items stay in review status. |
| REQ-NCA-03 | Errata applied and verified: NCA-75-Part1 Q35 = D; NCA-75-Part3-GapFill Q3 = A (Plan v2 C-05). Remap review re-verifies corrected fixtures against current documentation. | `dotnet test --filter FullyQualifiedName~Errata` asserts both post-errata keys. |
| REQ-NCA-04 | Stale cheatsheet claim corrected: `studyguides/CHEATSHEET-NCA-75.md` line 96 (“CVM SSH disabled by default on fresh installs”) contradicts the applied errata (SSH enabled by default on fresh AOS 7.5 installs; disable plan deferred). Beta labels removed only from claims individually re-verified; waiver-code/beta-exam tips removed or clearly dated. | CI grep fixture: “CVM SSH disabled by default” absent; correction note references errata ID NCA-75-Part3-GapFill-Q3. |
| REQ-NCA-05 | Hardcoded beta blueprint replaced by the NCA-75 exam.json manifest (REQ-MAN-04). `InitNca75` removed or annotated obsolete with a pointer to the manifest; `BlueprintServiceTests` gain fixtures asserting manifest sections/objectives/IDs match the current guide. | Blueprint view renders NCA-75 from the manifest; beta section titles never render. |
| REQ-NCA-06 | Authoring gaps filled with new original items where the bank cannot supply reviewed coverage — expected gaps: solutions/tools (1.x), licensing (2.4), support-case workflow (4.3), performance interpretation (4.4). Final gap count comes from the objective-by-objective review, not this spec’s estimate. | Completed remap.csv: any objective without two reviewed bank items receives newly authored items with full provenance. |
| REQ-NCA-07 | Four deterministic beginner scenarios ship (SPEC-07): `nca-tool-01`, `nca-vm-01`, `nca-maint-01`, `nca-alert-01`. Unsupported licensing/tool features use labeled worked examples, never false interactive completion. | Each scenario passes the SPEC-07 validation contract. |
| REQ-NCA-08 | Freeze before travel: NCA cut freezes at a recorded head before departure. Departure cutoff confirmed from the trip itinerary before the execution schedule is committed (ASM-09); the freeze is a checklist (branch, tag-free head record, gates green, no content edits after freeze). | Freeze evidence pack complete per SPEC-11 11.7. |

## Lesson synopses (14 lessons, one per current objective)

**Section 1 — Solutions and tools**
- **1.1 NCI components and use cases.** Node/block/cluster; AOS, AHV and Prism in one mental picture; where NCI fits versus legacy three-tier. Worked example: match three small business cases to the NCI pitch.
- **1.2 Adjacent solutions.** Storage products, database service, cloud management, Kubernetes, AI, EUC — recognition level. Worked example: “which product family solves this problem” sorting exercise.
- **1.3 Tooling.** Move (migration), NGT (guest tools), Foundation (imaging), Witness (Metro/two-node arbitration), SSR (self-service restore), X-Ray (testing), Collector (inventory). **Powers nca-tool-01.**

**Section 2 — Platform administration**
- **2.1 VM tasks.** Create, modify, clone, delete, migrate; console access; snapshots vs backups at concept level. **Powers nca-vm-01** with its strengthened validator.
- **2.2 Virtual networking.** VLANs on AHV, IPAM, managed vs unmanaged networks; what changes for a VM when a network setting changes.
- **2.3 Storage operations.** Containers, capacity, RF at concept level; data efficiency one paragraph each (compression, dedup, EC-X) with “when would you” framing.
- **2.4 Licensing.** Tiers at recognition level, where licensing lives in Prism, what happens when capacity is exceeded. Worked example only where the simulator lacks licensing mutations (REQ-NCA-07 honesty rule).

**Section 3 — Cluster configuration and maintenance**
- **3.1 Valid cluster options.** RF2 vs RF3 decision framing; node/block awareness; what a “valid” expansion choice means.
- **3.2 Hardware maintenance.** Disk and node failure workflows at operator level; evacuation before service. **Powers nca-maint-01**’s ordered-sequence task.
- **3.3 Software maintenance.** LCM concepts: inventory, compatibility, pre-checks, one-click upgrade, dark-site awareness.

**Section 4 — Health and monitoring**
- **4.1 Health checks.** NCC: what it checks, how to run it, how to read results without panic.
- **4.2 Alerts and events.** Severity, acknowledgment, event vs alert; where to look first. **Powers nca-alert-01.**
- **4.3 Support functions.** Pulse, log collection, opening a support case with the right bundle attached — the support-case workflow gap this lesson fills.
- **4.4 Workload performance.** Reading dashboards and charts; noisy-neighbor symptoms vs capacity ceilings — the performance-interpretation gap this lesson fills.

## Files

**New:** `content/exams/NCA-75/exam.json`, `remap.csv`, `lessons/{s1_1..s4_4}.md` (14), `questions/nca75-pilot.md` (new authored items only — remapped bank items stay in their original files); `Core.Tests/ManifestBlueprintTests.cs` fixtures.

**Modified:** `Core/Services/HardcodedBlueprintService.cs` (InitNca75 removal/obsolete), `studyguides/CHEATSHEET-NCA-75.md`, `Core.Tests/BlueprintServiceTests.cs`, `Core.Tests/ErrataTests.cs`.
