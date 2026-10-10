# OpenSpec Capability Specs — rtp-beginner-tracks-2026-10

Full per-spec documents extracted from the [October 10 OpenSpec package](../../drive-ingest-2026-10-10/RTP-Beginner-Tracks-Openspec-Change-Package-A-Network-NCA75-v2.md) (base: main @ 904106a). Each doc cross-links its executing sprint file(s) in [docs/sprints/](../) and its gate/test IDs.

**Deadlines:** October 23, 2026 student demo (A+ / Network+) · October 25-28 Nutanix HQ trip (NCA 7.5).

## Index

| Doc | Capability | Executed in |
|---|---|---|
| [SPEC-00](SPEC-00-proposal.md) | Proposal, verified baseline, scope, success definition, gap analysis (00B) | — (context) |
| [SPEC-01](SPEC-01-design.md) | Design: principles, architecture delta, locked decisions D1-D8, data models, cross-platform, demo mode | shapes all sprints |
| [SPEC-02](SPEC-02-manifests.md) | Track/exam manifests and parser compatibility (REQ-MAN-01..07) | [SPRINT-45](../SPRINT-45.md) |
| [SPEC-03](SPEC-03-study-ui.md) | Beginner study UI, demo mode, branding (REQ-UI, REQ-BRAND, REQ-DEMO) | [SPRINT-46](../SPRINT-46.md)/[47](../SPRINT-47.md) |
| [SPEC-04](SPEC-04-aplus.md) | CompTIA A+ 220-1201/1202 content plan (REQ-AP-01..07) | [SPRINT-45](../SPRINT-45.md)/[46](../SPRINT-46.md)/[47](../SPRINT-47.md) |
| [SPEC-05](SPEC-05-netplus.md) | CompTIA Network+ N10-009 content plan (REQ-NP-01..06) | [SPRINT-46](../SPRINT-46.md)/[47](../SPRINT-47.md) |
| [SPEC-06](SPEC-06-nca.md) | NCA 7.5 current-guide remap (REQ-NCA-01..08) | [SPRINT-45](../SPRINT-45.md)/[48](../SPRINT-48.md) |
| [SPEC-07](SPEC-07-scenarios.md) | Deterministic scenarios (REQ-SC-01..06) | [SPRINT-46](../SPRINT-46.md)/[48](../SPRINT-48.md) |
| [SPEC-08](SPEC-08-tutor.md) | Restricted tutor slice (REQ-AI-01..07) | [SPRINT-47](../SPRINT-47.md) |
| [SPEC-08A](SPEC-08A-redeye.md) | RedEye AI review lane (REQ-REV-01..06, owner standing rule) | [SPRINT-45](../SPRINT-45.md) |
| [SPEC-09](SPEC-09-repairs.md) | Runtime/scoring/simulator repairs R-01..R-24 | [SPRINT-45](../SPRINT-45.md)/[46](../SPRINT-46.md) |
| [SPEC-10](SPEC-10-ci-packaging.md) | CI gates CI-01..04, packaging PKG-01..04, 14-link gate chain | [SPRINT-45](../SPRINT-45.md)/[46](../SPRINT-46.md)/[47](../SPRINT-47.md) |
| [SPEC-11](SPEC-11-tasks.md) | Delivery tasks T-01..T-46, cut lines, governance | [SPRINT-45](../SPRINT-45.md)..[48](../SPRINT-48.md) |
| [SPEC-12](SPEC-12-test-matrix.md) | Test matrix TM-10..TM-93 | all sprints |
| [SPEC-13](SPEC-13-risks.md) | Risk register RSK-01..17 + escalation triggers | — (standing) |
| [SPEC-14](SPEC-14-traceability.md) | Traceability matrix + finding register C/CI/PKG/NET/WEB rows | — (standing) |
| [SPEC-15](SPEC-15-assumptions.md) | Assumptions ASM-01..19, HG-01, fail-closed tripwires | — (standing) |
| [SPEC-16](SPEC-16-executor-brief.md) | Executor brief, boot sequence, evidence packs, presenter runbook | — (handoff) |
| [SPEC-17](SPEC-17-sources.md) | Sources and evidence, uncertainty register | — (reference) |

## Sprint rollups

The dated execution plans live in [docs/sprints/](../): [SPRINT-45](../SPRINT-45.md) (Oct 10-12, Sprint A), [SPRINT-46](../SPRINT-46.md) (Oct 13-16, Sprint B), [SPRINT-47](../SPRINT-47.md) (Oct 17-22, Sprints C+D), [SPRINT-48](../SPRINT-48.md) (NCA Sprint E, travel freeze). Master index: [docs/sprints/SPRINT-PLAN.md](../SPRINT-PLAN.md) (Phase 5).

## Standing rules

- Every gate ships with a failing + passing fixture (TM-70 series).
- No scored item ships without a passing RedEye log ([SPEC-08A](SPEC-08A-redeye.md)); fail-closed.
- Disclaimer string is exact (REQ-BRAND-02); no endorsement language anywhere.
- Never renumber content IDs; remap attaches, history is never reassigned.
- Owner tripwires ([SPEC-15](SPEC-15-assumptions.md)) stop work for one batched decision request; HG-01 is the sole standing code-license gate.
