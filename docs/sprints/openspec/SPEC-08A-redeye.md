# OpenSpec SPEC-08A — RedEye AI Review Lane (owner-directed)

**Source:** [OpenSpec package rtp-beginner-tracks-2026-10](../../drive-ingest-2026-10-10/RTP-Beginner-Tracks-Openspec-Change-Package-A-Network-NCA75-v2.md), SPEC-08A
**Executed in:** [SPRINT-45](../SPRINT-45.md) (T-46) · **Gates:** TM-20/21 series · **Depends on:** radredeye pipeline (owner’s existing vision pipeline)

## Frame

Roger, October 10, 2026, verbatim: “We nees to build this so the ai does the review with reseye not me.” … “Yes red eye is our vision pipeline” … “Moving forward this is for all openspecs.” The content-quality gate is performed by a RedEye review lane built on his existing **radredeye** pipeline — not a new product and not Roger. Roger may spot-check at his discretion; he is not the reviewer of record and carries no mandatory review load (ASM-18). His 12:27:33 instruction requires RedEye review in **every OpenSpec**, with domain-appropriate checks. Plan v2 C-06’s content-review requirement is satisfied only by a demonstrated passing lane: the gate still exists and blocks unreviewed content. Rights, spend, public-release and other owner decisions remain owner decisions.

## RedEye baseline and integration boundary

RedEye (https://github.com/TheArchitectit/radredeye) is framework-agnostic visual capture for AI agents over stateless MCP. Workspace version 0.6.1 with unreleased control-actuator changes; reviewed from live default-branch reads (head SHA not pinned — **the executor must record the exact head and run the acceptance tests before delivery**).

Existing capability: `radredeye-core` (frames, sink fan-out, bounded replay, named streams); `radredeye-mcp` (base64 PNGs via submit_frame / POST /capture; frame retrieval, descriptions, pixel diffs, health, review_score); `radredeye-review` (CaptureSink → Scorer → review.jsonl with stream_id/seed/score+quality/issues; deterministic MockScorer; optional model-scorer HTTP path); `radredeye-registry` (JSONL + SQLCipher/Postgres backends — not the per-item release-attestation schema); Bevy source uses the Screenshot API (adapter prose alone is not runtime proof).

**Required extension, not existing capability:** build the RTP evidence-review adapter on this render-look-judge pipeline — render the candidate item/lesson/UI with its eligible evidence, use a dedicated RTP stream for visual observations, and pass structured item/source/manifest inputs to a separate blind derivation context. A generic frame-quality score or caption **cannot verify an answer key**. The review extension must implement blind key verification, context separation, source checks, objective mapping, bias/duplicate/originality checks, deterministic arithmetic, provenance completion, seeded-defect self-test and the per-item verdict format, binding each verdict to hashes of item text, manifest, eligible source evidence and reviewer configuration. The current frame seed hashes pixels/dimensions with DefaultHasher — it is not that four-input attestation.

**Boundaries from the baseline review:** CaptureSink errors do not abort capture; review regression logging ignores the subprocess result; the frame-gate aggregator counts only recorded lines, treats absent timing as passing and can report all_ok on zero records — so neither frame retrieval, health, a frame score nor that dashboard is a substitute for the item-level fail-closed ship-gate. Build explicit completion/error accounting and expected-item coverage outside model output. `main.rs` binds 0.0.0.0:8765, not loopback; the admin bearer-token gate is not proof of authentication on the capture/MCP surfaces — restrict the RTP deployment to an isolated local boundary or add reviewed authentication before exposing private evidence. The RTP review adapter must not expose control tools, publishing, merge or repository-write capabilities to its model context.

## Requirements (normative)

| ID | SHALL | Scenario |
|---|---|---|
| REQ-REV-01 | Per scored item, RedEye performs: (a) answer-key verification against the cited source material; (b) objective-mapping check against the exam manifest; (c) answer-position-bias detection (R-09 feeds it); (d) near-exam-content/originality screen (proximity to known published items, brain-dump patterns, remembered-question claims — flagging into the C-04 quarantine); (e) a written per-item review log recording each check’s outcome, the evidence used, the model/prompt version and a pass/return verdict. | Fixture pack of 10 items with one seeded wrong key and one seeded mapping error → both returned with the failing check named; 8 clean items carry passing logs. |
| REQ-REV-02 | Ship-gate: an item enters a released pack only with a passing RedEye log at the current pack version. Content edits invalidate the prior log. The pack compiler refuses items without a current passing log. | Item edited after its log → compiler excludes it; report names it. |
| REQ-REV-03 | Lane accuracy enforced by an automated seeded-defect self-test, independent of any person: before every release, known-defective seeded items (wrong key, mis-mapped objective, biased key position, near-duplicate text) run through the lane; the release ships only if the lane catches every seed. A missed seed blocks the release and triggers lane-config review. Owner spot-checks optional; owner verdicts logged, disagreements feed lane-config review. | Release candidate → every seeded defect caught and recorded in release evidence; owner spot-check verdicts logged with dispositions. |
| REQ-REV-04 | Provenance and originality attestation automated inside the lane: the provenance record (C-02) is generated per item at draft time and completed by the lane’s checks; no manual record-keeping stands between drafting and review. | Newly drafted item → provenance complete after the lane, or not releasable (TM-21). |
| REQ-REV-05 | Fail-closed: if the lane or its provider is unavailable, unreliable or unaudited, items do not ship — SPEC-15 boundary applies (stop, escalate one consolidated decision request). No silent fallback to unreviewed release; the lane never marks its own output exempt from REQ-REV-01 checks. | Lane stubbed to error → compiler releases zero items; failure is loud. |
| REQ-REV-06 | The lane reads only its allowlisted corpus and the item under review (SPEC-08 REQ-AI-02 corpus rules); no publish, merge or repo-write capability. Model output is data; validation happens outside the model (Plan v2 G-01). | Injection fixture inside an item’s explanation → no instruction followed; item flagged. |

## Review workflow (SPEC-11 11.8)

Author drafts (original work; provenance record generated at draft time) → RedEye per-item checks (key vs source material, objective mapping, position bias, originality screen) → written per-item log with pass/return verdict → items with passing current logs enter the released pack at the next compile. Remapped legacy items pass the same lane with remap-aware checks (key re-verification, explanation re-read, mapping check, rights status). Lane logs and the seeded-defect self-test record are part of the release evidence (SPEC-11 11.7). **Fail-closed: no lane, no release.**

## Standing scope

Every OpenSpec carries a RedEye review lane appropriate to its artifact: visual render-look-judge evidence plus domain-specific checks. RTP’s exam-key/objective checks are this integration’s requirements, not a replacement definition for the general pipeline. All review requirements and acceptance scenarios remain build requirements until demonstrated against the pinned implementation.

## Files

**New:** `services/redeye/` (lane runner, check modules, log writer); `content/review-logs/<exam>/<item>.json` (generated, versioned); `scripts/redeye-gate.py` (compiler ship-gate); `tests/fixtures/redeye/*.md+json`.

**Modified:** content compiler (gate wiring), SPEC-11 workflow references.
