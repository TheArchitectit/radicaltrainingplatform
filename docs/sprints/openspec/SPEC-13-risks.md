# OpenSpec SPEC-13 — Risk Register

**Source:** [OpenSpec package rtp-beginner-tracks-2026-10](../../drive-ingest-2026-10-10/RTP-Beginner-Tracks-Openspec-Change-Package-A-Network-NCA75-v2.md), SPEC-13
**Executed in:** [SPRINT-45](../SPRINT-45.md)..[SPRINT-48](../SPRINT-48.md) (mitigations distributed by sprint) · **Related:** [SPEC-15 fail-closed boundaries](SPEC-15-assumptions.md)

Severity = impact × likelihood for the two deadlines. Each risk has an owner role, mitigation inside this package, and residual exposure. No risk is “accepted” silently.

| ID | Risk | Sev | Mitigation in this package | Residual |
|---|---|---|---|---|
| RSK-01 | 13 calendar days is not enough for two content tracks plus repairs | High | Cut lines defined per sprint (reduce released counts visibly; planned-module outlines); NCA review parallelized; Sprint D forbids new scope; review throughput resolved by the owner-directed RedEye lane (SPEC-08A) | Low-Medium — authoring and engineering throughput are the remaining unknowns |
| RSK-02 | Demo fails live (boot, offline, projector, reset) | High | R-01 first task; TM-40/50 rehearsal on the actual host; recorded backup; non-AI fallback | Low after T-26 passes |
| RSK-03 | A gate that cannot fail ships fabricated confidence | High | TM-70 series: every gate carries failing+passing fixtures; vuln gate proven against real dotnet shape | Low |
| RSK-04 | CompTIA/Nutanix perception: product reads as endorsed or brain-dump-adjacent | High | REQ-BRAND-01/02 with CI fixtures; originality attestation in provenance; quarantine (C-04); nominative language only | Medium — perception risk never reaches zero; disclaimer is the owner’s chosen posture |
| RSK-05 | Rights review uncovers unusable legacy content (bank or PDFs) | Medium | Isolated packs limit blast radius; remap.csv carries rightsStatus per item; PDF inventory task; no AI ingestion before transmission rights | Medium — owner decision pending (Plan v2) |
| RSK-06 | Remap corrupts learner history | Medium | Stable IDs; remap attaches mappings; changed content marks, never reassigns (F-02); migration fixtures | Low |
| RSK-07 | Tutor leak (keys, secrets, cross-user data) | High | Contract-limited input, no unsubmitted keys, gateway-held secrets, bundle scan, redaction, no transcript storage | Low after TM-60 passes |
| RSK-08 | Tutor cost/spend surprise | Medium | One response per turn, bounded budget, rate limit, kill switch; dollar caps are owner decisions; fallback is free | Low |
| RSK-09 | Self-hosted runner (ucs03) unavailable in the window | Medium | build-winforms leg is hosted; PWA deploy is hosted; record which gates ran where; fallback: run gate scripts locally and archive output | Medium |
| RSK-10 | Ordering-item conversion changes pedagogy late | Low | Quarantine-first default; conversion only with reviewer approval | Low |
| RSK-11 | Simulator single-source cut breaks desktop lab hosting | Medium | Bridge-parity fixtures (TM-53) before cutover; host-adapter boundary keeps CefGlue specifics isolated | Medium until T-15/T-53 pass |
| RSK-12 | Official objectives change again before the trip (NCA version drift) | Low | Manifest carries sourceReviewDate; stale-review CI warning; freeze captures the guide version used | Low |
| RSK-13 | Position-bias repair invalidates old items’ difficulty | Low | Shuffle via stable IDs; grading unaffected; distribution report guides authoring | Low |
| RSK-14 | “Address everything” expands scope past the deadline | Medium | Traceability register owns every finding with a fix path and date; deadline-driven items land first; packaging/Flatpak/macOS items are gated to their own evidence, not to Oct 23 | Low — register keeps it honest |
| RSK-15 | Demo-mode ephemeral policy masks learner-mode breakage | Medium | TM-34/TM-44 test both policies explicitly; demo mode cannot hide a broken learner store | Low |
| RSK-16 | Service-worker staleness on demo day: sw.js precaches the app shell; a fixed build may not reach an installed PWA if update propagation misbehaves | Medium | Treat as a risk requiring a real-browser test, not a proven failure: TM-49 verifies an updated deploy actually reaches an installed PWA (version bump visible after reload cycle); rehearsal includes a cache-busting drill and a known-good fallback (fresh profile/device) | Low after TM-49 |
| RSK-17 | Look-alike UI / trade-dress exposure: the simulator resembles vendor product UIs (Prism PE/PC). No legal prohibition is established and none is assumed | Medium | Unverified risk with a check, not a ban: private demo use proceeds; before any public release, a UI-rights review (trade dress, screenshots, mark usage) runs and its outcome is recorded as a register row | Medium until reviewed |

## Escalation triggers

Any of these conditions halts the affected workstream and escalates to Roger the same day (the only fast path):

1. A discovery that legacy bank items may contain actual exam questions (quarantine first, then escalate).
2. Any request to present the product as vendor-approved.
3. A rights review concluding the vendor PDFs cannot remain in the public repo (owner decision with evidence).
4. A demo-host constraint that breaks the offline or projector requirements (fallback plan activates).
5. Reviewer capacity falling below the cut-line thresholds in SPEC-11 (visible scope reduction proposed, never silent quality reduction).

Everything else resolves through the assumptions ledger ([SPEC-15](SPEC-15-assumptions.md)).
