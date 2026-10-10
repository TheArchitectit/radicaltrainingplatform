# OpenSpec SPEC-11 — Delivery Tasks (T-01..T-46)

**Source:** [OpenSpec package rtp-beginner-tracks-2026-10](../../drive-ingest-2026-10-10/RTP-Beginner-Tracks-Openspec-Change-Package-A-Network-NCA75-v2.md), SPEC-11
**Executed in:** the dated sprint files carry the normative content for this spec — this page is the index and governance note.

## Task-to-sprint mapping

| Sprint file | Window | OpenSpec sprint | Tasks carried | Points |
|---|---|---|---|---|
| [SPRINT-45](../SPRINT-45.md) | Oct 10-12 | A | S45-01..S45-12 = T-01..T-10, T-43 (start), T-46 | 27 |
| [SPRINT-46](../SPRINT-46.md) | Oct 13-16 | B | S46-01..S46-15 = T-11..T-18, T-37..T-40, T-42, T-43 (remainder), T-44 | 31 |
| [SPRINT-47](../SPRINT-47.md) | Oct 17-22 (C+D) | C+D | S47-01..S47-15 = T-19..T-30, T-41, T-45, R-10 (HG-01) | 27 |
| [SPRINT-48](../SPRINT-48.md) | Oct 23-24 | E | S48-01..S48-06 = T-31..T-36 | 12 |

All 46 OpenSpec tasks (T-01..T-46) are covered exactly once across SPRINT-45..48; the R-10/HG-01 row and T-42 were added during verification where the original mapping left gaps.

## Cut lines (11.1) — visible scope reduction, never silent quality reduction

If a sprint slips, reduce released counts in this order and record the cut in the release evidence:

1. Reduce the number of released scored items per pack (the cut numbers — A+ 24, N+ 25, NCA 40 — are floors for the demo, not targets; fewer reviewed items are acceptable, unreviewed items are not).
2. Reduce lessons to the demo-critical two per exam and mark remaining modules as planned outlines.
3. Reduce scenarios to the demo-critical set (A+ DNS, Network+ gateway, two NCA) and mark the rest demo-pending.
4. The tutor falls back to the labeled recorded example (REQ-AI-07) — this is a designed fallback, not a cut.

Never silently: ship unreviewed items, drop the disclaimer, skip a gate, or relabel coverage.

## Governance note (11.10)

- Task IDs are stable identifiers; sprint re-sequencing may not renumber them.
- Every task’s acceptance references its TM rows in [SPEC-12](SPEC-12-test-matrix.md) and register rows in [SPEC-14](SPEC-14-traceability.md).
- Per-sprint detail lives in the four sprint files above; the normative source remains the OpenSpec package under `docs/drive-ingest-2026-10-10/`.
- Gate chain order and release conditions: [SPEC-10](SPEC-10-ci-packaging.md) § The gate chain as one sequence.
- RedEye lane standing rule (owner 12:27:33): every OpenSpec carries its lane; for this package it is [SPEC-08A](SPEC-08A-redeye.md), executed in SPRINT-45 (T-46).
