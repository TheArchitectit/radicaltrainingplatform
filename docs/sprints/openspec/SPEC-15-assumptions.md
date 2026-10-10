# OpenSpec SPEC-15 — Assumptions Ledger and Fail-Closed Boundaries

**Source:** [OpenSpec package rtp-beginner-tracks-2026-10](../../drive-ingest-2026-10-10/RTP-Beginner-Tracks-Openspec-Change-Package-A-Network-NCA75-v2.md), SPEC-15
**Executed in:** [SPRINT-45](../SPRINT-45.md)..[SPRINT-48](../SPRINT-48.md) (assumptions applied as defaults; HG-01 gates R-10/S47-15) · **Related:** [SPEC-13 escalation](SPEC-13-risks.md)

Owner standing rule: open questions resolve to a sensible default recorded here; only 100%-blocking questions escalate. The fail-closed boundaries below reserve owner decisions; **HG-01 is the sole standing code-license gate**.

## Assumptions

| ID | Assumption | Basis | Flip cost |
|---|---|---|---|
| ASM-01 | Manifest-over-filename identity for all new packs | DeriveExamCode truncation proven (SPEC-00) | Low — legacy path pinned by tests |
| ASM-02 | Web PWA is the Oct 23 demo host | Cross-platform directive; Chromebooks; desktop not on critical path | Medium — desktop demo would need T-15 early |
| ASM-03 | Web is the surviving simulator source; legacy copy consumes or is removed | Owner single-source directive | Medium — desktop hosting rework |
| ASM-04 | New content under content/, lint extended | Root-only glob verified in lint-content.py | Low |
| ASM-05 | One shared ticket renderer for both CompTIA scenarios | Preliminary spec; depth differences kept explicit | Low |
| ASM-06 | Tutor gateway is separate and minimal | G-01/G-09; no browser keys | Low |
| ASM-07 | Local-first progress; no export/import this window | Deadlines; L-03 deferred | Low |
| ASM-08 | NCA-75 keeps internal ID; display names from manifest | Stability of files/progress | Low |
| ASM-09 | California freeze cutoff set from itinerary when confirmed | Trip Oct 25-28; exact departure unverified | Low — T-36 adjusts |
| ASM-10 | LICENSE = BSD-3-Clause matching README claim | README already asserts it; adding the file is the smallest truthful fix | Low — one-line owner confirm (HG-01) |
| ASM-11 | Coverage threshold 70% line on Core | Plan v2 D-04 proposal adopted | Low — tunable |
| ASM-12 | Self-hosted runner ucs03 available for the Linux leg | CI comments; fleet convention | Low — hosted fallback exists |
| ASM-13 | Equal 10/section NCA pilot allocation (not official weights) | Guide publishes no percentage table | Low — labeled as study allocation |
| ASM-14 | Expert-authorship constraints applied to Nutanix items too (conservative) | Nutanix candidate agreement restrictions; uniformity | Low |
| ASM-15 | Roger’s Windows report is preserved without an asserted cause; which build he used is unknown; the audited head’s PWA is verifiably broken | R-01 evidence vs owner report | None — both preserved |
| ASM-16 | Demo audience = high school students at the October 23 EPIC event; synthetic data only | Owner context; no student accounts authorized | Low |
| ASM-17 | Ordering items quarantined (not converted) for the demo window | Conversion needs reviewer approval; quarantine is safer | Low — conversion can land later |
| ASM-18 | The RedEye lane satisfies the review gate; owner spot-check is optional and discretionary | Roger’s verbatim 12:25:59 directive plus his 12:27:33 extension of the rule to all OpenSpecs (SPEC-08A) | Medium — reinstating human review slows content |
| ASM-19 | The seeded-defect self-test catches every seeded wrong-key, mis-mapping, bias and near-duplicate item before release | Lane design default; seed set extensible; a missed seed blocks the release (fail-closed) | Low |

**HG-01 (sole standing code-license gate):** owner confirmation of the BSD-3-Clause LICENSE text, because it names a legal instrument. The other reserved owner decisions are the fail-closed tripwires below, not defaults.

## Fail-closed execution boundaries

The following are not assumed grants and not new standing review gates. They are tripwires: the executor stops, escalates one consolidated decision request to the owner, and does not proceed until the owner answers.

1. Any paid AI provider activation or dollar-spend commitment (tutor or RedEye).
2. Any public distribution or release of content.
3. Any change to vendor-PDF disposition in the repo.
4. Any rights-review conclusion that would block a planned pack.
5. The LICENSE text drop (HG-01).

Escalation is one batched decision request, not per-item pings.

Also deferred-with-owner and non-blocking: second-vendor roadmap beyond these tracks; spaced repetition (L-04); account/sync features. Each remains an owner decision; this package takes none of them.
