# OpenSpec SPEC-16 — Executor Brief and Handoff

**Source:** [OpenSpec package rtp-beginner-tracks-2026-10](../../drive-ingest-2026-10-10/RTP-Beginner-Tracks-Openspec-Change-Package-A-Network-NCA75-v2.md), SPEC-16
**Executed in:** [SPRINT-45](../SPRINT-45.md)..[SPRINT-48](../SPRINT-48.md) · **Gates:** [SPEC-10](SPEC-10-ci-packaging.md) · **Assumptions:** [SPEC-15](SPEC-15-assumptions.md)

## Who this is for

An LLM or human executor implementing this change. Everything needed is in the package: exact files, commands, fixtures, acceptance criteria and the order of operations. When this package and the repository disagree, the repository at the named base head is fact and this package is intent — halt and escalate per CLAUDE.md’s three-strikes rule rather than guessing.

## Non-negotiables (read first)

1. Read before editing; stay in the scope of your task ID; verify before committing (CLAUDE.md Four Laws).
2. Core never references UI; Core uses IFileProvider, never System.IO.Directory.
3. No force-push to main; no PRs; merge direct only with the full gate chain green.
4. Every gate you add or touch ships with a failing fixture and a passing fixture. A gate that cannot fail is itself a defect.
5. Never renumber or silently remap existing content IDs. Mark and attach; never reassign history.
6. No AI-generated scored item ships without a passing RedEye lane log (SPEC-08A ship-gate, REQ-REV-01/02). No “approved/official” language anywhere. The disclaimer string is exact (REQ-BRAND-02).
7. Simulation never calls real infrastructure. A scenario pass comes only from validated state.
8. Report what you did NOT verify, plainly, in the implementation report.

## Boot sequence for the executor

```bash
git checkout main && git pull
git checkout -b feature/rtp-beginner-tracks   # base: 904106ad (record actual SHA)
dotnet build RadicalTrainingPlatform.Core/RadicalTrainingPlatform.Core.csproj --configuration Release
dotnet test RadicalTrainingPlatform.Core.Tests/RadicalTrainingPlatform.Core.Tests.csproj --configuration Release
python3 scripts/lint-content.py
python3 .github/scripts/vuln_gate.py RadicalTrainingPlatform.Core/RadicalTrainingPlatform.Core.csproj RadicalTrainingPlatform.Core.Tests/RadicalTrainingPlatform.Core.Tests.csproj RadicalTrainingPlatform.Desktop/RadicalTrainingPlatform.Desktop.csproj
```

Baseline expectation: build green, tests green, lint green — and the vuln gate prints PASS for the wrong reason until T-02 lands (run the T-02 fixture suite to watch it fail correctly). If the baseline is not green, stop and reconcile before writing any new code; record the discrepancy.

## Order of operations (rationale)

T-01 first because nothing else can be verified in the PWA until it boots. T-02 second because every later green CI run is meaningless while the security gate is hollow. T-03/T-04/T-05 next because content fixtures depend on scoring truth. T-06/T-07 unblock all content authoring. T-08 proves the content pipeline early with two real lessons. T-09 starts the long NCA inventory in parallel. Sprints B and C build the loop and the packs; Sprint D freezes and rehearses; Sprint E ships the NCA cut. If any sprint slips, cut released scope per SPEC-11 11.1 — visibly — and record the cut in the release evidence.

## Definition of done per task

Code or content at the named files; unit/gate fixtures added and passing; no legacy test modified to pass; the requirement IDs touched are listed in the commit message; the traceability register row ([SPEC-14](SPEC-14-traceability.md)) moves from “owned” to “evidenced” with the command output archived. **A task is not done when its happy path works; it is done when its negative fixtures fail correctly and its evidence is archived.**

## Evidence pack at each freeze

Branch, base/head SHA, changed-file list, full gate output with pass counts (N/N at SHA), test counts per suite, demo sweep report (per-scenario rows), tutor evaluation report or fallback label check, rehearsal notes (host, offline, projector, reset), screenshots/video backup, and the known-unverified list. Freeze means no content edits afterward without a new head record.

## Handoff notes for the October 23 presenter

Open /tracks; the room sees three tracks with the disclaimer. Run the 90-second loop: open the A+ DNS lesson and ask the room for a diagnosis; a student answers in practice; ask the tutor for a hint (it cites the lesson, scoped as skills coaching, or the recorded-example label shows); the student fixes the synthetic workstation; the deterministic checker awards completion with the evidence panel (requested state, actual state, action trace); reset the station in one click for the next group. Say plainly: this trains support and network skills on simulated systems; no patient or business system is involved; this is independent material, not official or endorsed training; coverage is a beginner preview, not exam readiness.

## Presenter runbook detail (October 23)

**Station setup (30 minutes before doors):** build from the frozen head; install PWA on the demo host; run the demo sweep once on the actual machine; run TM-47 offline check with the venue network disabled, then re-enable for the tutor segment only if REQ-AI-06 passed; load demo mode; verify the seed state on the DNS and gateway scenarios; tape the reset shortcut location to the podium card.

**Failure drills the presenter rehearses once:** projector at unexpected resolution (layout holds per TM-48); venue Wi-Fi drops mid-tutor (tutor reports unavailable, lesson continues, no invented output); a student completes a scenario early (reset between groups, REQ-DEMO-03); a student asks whether this is official CompTIA training (answer from the script: independent material, not endorsed, original questions, and why that matters).

**Backup artifacts:** screen recording of the full loop from the frozen build, labeled as a recording; printed one-page lesson handouts for the two complete lessons per track; the evidence panel screenshot for the DNS scenario showing requested vs actual state.

## What this package deliberately did not decide

Host machine for the presentation (ASM-02 default stands); builder/reviewer capacity; AI provider/model and dollar caps; public distribution; vendor PDF disposition; LICENSE text confirmation (HG-01). Each gates its corresponding implementation step; none blocks this specification.
