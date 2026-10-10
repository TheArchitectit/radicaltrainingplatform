# OpenSpec Index — RadicalTrainingPlatform

Last reconciled: 2026-10-10 against main @ 88877b2.

**Note:** `.devgate/openspec/` in the working tree belongs to a different project (the DevGate fleet/gate platform), not RTP. It is untracked and out of scope here — do not modify it during RTP work.

## Open changes (1)

### `rtp-beginner-tracks-2026-10` — Beginner certification tracks (A+ / Network+ / NCA 7.5)

| Field | Value |
|---|---|
| Status | **Active — Phase 5, plan approved; execution sprints written** |
| Source package | [`docs/drive-ingest-2026-10-10/RTP-Beginner-Tracks-Openspec-Change-Package-A-Network-NCA75-v2.md`](drive-ingest-2026-10-10/RTP-Beginner-Tracks-Openspec-Change-Package-A-Network-NCA75-v2.md) (20-file OOXML bundle: `rtp-beginner-tracks-openspec-bundle.zip`) |
| Base head | main @ 904106a (Oct 5, 2026); package dated Oct 10, 2026 |
| Scope | Three tracks / four exam IDs (COMPTIA-A-1201, COMPTIA-A-1202, COMPTIA-NET-009, NCA-75): manifests, study UI, content, scenarios, tutor slice, RedEye review lane, runtime repairs R-01..R-24, CI/packaging gates |
| Deadlines | Oct 23, 2026 student demo (A+/Network+) · Oct 25-28 Nutanix HQ trip (NCA 7.5) |
| Per-spec docs | [`docs/sprints/openspec/`](sprints/openspec/README.md) — SPEC-00..SPEC-17 |
| Execution | [SPRINT-45](sprints/SPRINT-45.md) (Oct 10-12, Sprint A) · [SPRINT-46](sprints/SPRINT-46.md) (Oct 13-16, Sprint B) · [SPRINT-47](sprints/SPRINT-47.md) (Oct 17-22, Sprints C+D) · [SPRINT-48](sprints/SPRINT-48.md) (Sprint E, NCA travel freeze) — tasks T-01..T-46, 97 pts |
| Master index | [docs/sprints/SPRINT-PLAN.md](sprints/SPRINT-PLAN.md), Phase 5 + OpenSpec alignment matrix |

### Companion documents (inputs to the active package)

| Document | Role |
|---|---|
| [`RTP-START-HERE-audit-gaps-openspec-2026-10-10.md`](drive-ingest-2026-10-10/RTP-START-HERE-audit-gaps-openspec-2026-10-10.md) | Entry pointer: audit → gap analysis → OpenSpec |
| [`RTP-Full-Audit-2026-10-10.md`](drive-ingest-2026-10-10/RTP-Full-Audit-2026-10-10.md) | Full audit (findings feed SPEC-14 register) |
| [`Gap-Analysis-Comptia-A-Network-NCA-75-Beginner-Tracks.md`](drive-ingest-2026-10-10/Gap-Analysis-Comptia-A-Network-NCA-75-Beginner-Tracks.md) | Gap analysis (SPEC-00B source) |
| [`RTP-OpenSpec-RedEye-2026-10-10.md`](drive-ingest-2026-10-10/RTP-OpenSpec-RedEye-2026-10-10.md) (+ .pdf) | **Standing rule:** every OpenSpec carries a RedEye review lane — active, applies to future OpenSpecs too |

## Closed / superseded

None yet in this population — `rtp-beginner-tracks-2026-10` is the first RTP OpenSpec package. When its Sprints 45-48 complete and gates report green at a frozen head, archive the execution record under `docs/sprints/` and mark the package row here as closed.

## Rules for future OpenSpecs

1. Every new OpenSpec gets a row here and, when approved, per-spec docs under `docs/sprints/openspec/` plus dated sprint files.
2. The RedEye review lane (owner standing rule, 12:27:33) is required in every OpenSpec.
3. Gates must carry failing + passing fixtures; claims are evidenced at a named head SHA.
4. Owner tripwires (SPEC-15) stop work for one batched decision request; HG-01 is the sole standing code-license gate.
