# Carry-forward — state at 2026-11-04

**Measured head:** see the latest freeze-record commit at the foot of this file;
each per-item closure records its own SHA and chain total.
**Freeze chain:** **72/72 at `ac5a5b7`**, measured with `--expect-sha` on the full
40-character SHA.
**OpenSpec package:** `rtp-beginner-tracks-2026-10` — every task T-01..T-46 is
landed; two of the six Sprint 48 rows closed on 2026-11-04, four remain blocked
on inputs listed below.
**Phase 4 (Sprints 27-44):** complete — 27-28, 35-36, 29-30, 37-38, 39-40,
41-42 and 43-44 landed (several rescoped by the owner for a local client);
31-32 and 33-34 cut owner-deferred.

This page exists so the next session starts from the repository, not from a
chat transcript. It records what is blocked, what is deferred, and what was
checked and dismissed. Per-row "Not verified" notes in the sprint files remain
the source of truth; this page does not restate them.

## Landed this session

| Commit | What |
|---|---|
| `f13b852` | Sprints 43-44: item-hygiene gate, fixtures, `OptionShuffle` boundary fix, chain/CI wiring |
| `60cf90c` | Corrected the landing SHA in `SPRINT-43-44.md`; filled the three missing Phase 4 Status cells in `SPRINT-PLAN.md` |
| `cd337bd` | `RadicalTrainingPlatform.slnx` now includes `Desktop.Tests`, matching `.sln` |
| `da77118` | `check-coverage.py` selects the Core.Tests report instead of the lexicographically last one; self-test covers wrong-project, single-report and ambiguous cases |

## Blocked OpenSpec rows

Four are still blocked, none on code. Two closed on 2026-11-04 (see below).

| Row | Task | Blocker | What unblocks it |
|---|---|---|---|
| S48-01 | T-31 remap inventory | RedEye model stage is `blocked` (no provider); `mapping-check` reads provenance records the lane does not have | Provider activation — a SPEC-15 tripwire — plus provenance records |
| S48-02 | T-32 current blueprint | All structural criteria pass; the one remaining clause is a human-attested `sourceReviewDate`. The ingested guide PDF is a bare LFS pointer (132 bytes), so nothing in the tree can be opened and reviewed | A readable copy of the June 15, 2026 NCA 7.5 guide, or the owner's attestation that the manifest structure matches it |
| S48-03 | T-33 40-item pilot | Same model-stage blocker; all 40 ship `draft-preview` with no item verified | Provider activation; the cut is recorded, not hidden |
| S48-04 | T-34 companion surfaces | The guide was not opened, so no remaining sheet claim was re-checked (same 132-byte pointer problem) | A readable guide, or the owner's sign-off on the sheet's remaining claims |
| ~~S48-06~~ | T-36 travel freeze | **Closed 2026-11-04** — the trip has happened; the owner is back and no pre-departure freeze is still ahead. The candidate freeze record stands as the documented head; TM-101 is no longer a named gap | — |
| ~~S48-07~~ | T-31a source inventory | **Closed 2026-11-04** — the owner confirmed BSD-3-Clause; `LICENSE` is at the root and C-09's three clauses are satisfied. The `rightsStatus` column still records that no rights review has been performed, which is the column's honest value, not a gap in this row | — |

**S48-02 / S48-04 and the web.** The owner asked whether the guide could be
fetched. The Nutanix certification page and the official blueprint guide PDF
are not linkable from this session (the MCP servers it would use failed to
connect), and the guide text has no canonical open-access HTML mirror. The
repository's own record of it — `docs/drive-ingest-2026-10-10/` and the
132-byte `docs/Prism-Central-Guide-vpc_7_5.pdf` pointer — is already what the
manifest was built against, so re-fetching the same bytes would not produce
the missing human review. The blocker is the human read, not the download.

## Deferred decisions

### 1. Gateway controls — closed 2026-11-04

The formerly decorative controls are now enforced by `controls.mjs` and wired
into the real server: a fixed-window limiter returns 429 with `retry-after`,
a loopback-only CORS policy answers `OPTIONS`, the provider wrapper enforces
a sticky process-lifetime spend kill switch, and logged events are appended
to a redacted JSONL sink. The default limit is 60/minute so RedEye is not
throttled. `tests/gates/run_gateway_controls_fixtures.sh` supplies a failing
and passing fixture for each control and exercises CORS, rate limiting and
auditing against the live HTTP server.

Provider activation and `spendKillSwitch` remain unset owner decisions (G-05).
The shipped default is still `activation: false`; no provider was enabled and
no paid call was made.

### 2. `PlaceholderView` reachability — closed 2026-11-04

`app.js` now registers `PlaceholderView` as the router fallback. Unknown
non-root paths keep their URL and render the existing “Not in this build”
copy with the correct route context; `/` still redirects to `/pe/dashboard`.
`tests/gates/web/router-fallback.mjs` covers both routing directions, and the
real-browser smoke checks that an unknown route renders without redirecting.

### 3. `content-bundle.json` — checked, not a defect

The PWA runtime does not load it; study content ships compiled in
`js/study-content.js`. The bundle file is consumed by
`scripts/check-content-bundle.py` and `tests/gates/tutor-eval.mjs`. It is not
an offline-cache gap, and no action is warranted.

### 4. Item-hygiene advisories — closed 2026-11-04

The 42 released items with a longest-option-is-correct cue were edited at the
distractor level only; item IDs, stems, keys, correct-option text, explanations
and provenance attribution are unchanged. The cue is now a blocking gate, with
a seeded failure in the hygiene self-test, so this set cannot regress silently.
The three content groups were reviewed in their combined diff; one distractor
that had accidentally become a second valid DHCP answer was corrected.

All 22 legacy root banks (1,598 items) were rebalanced through the verified
rotation tool. No stem, option text, correct-option text, explanation or item ID
changed, and multi-answer items stayed byte-identical. Items referring to
options by letter (`option B`, `options C/D`, `Both A and C`) were refused and
left intact. Every legacy bank is now below the 40% dominant-letter threshold;
a second dry run is a no-op. The rebalancer's self-test covers those refusal,
multi-key, balance and idempotence properties.

Small released banks still print their below-audit-size distributions as
advisories by design; the two deferred signals above are no longer present.

### 5. LICENSE confirmed — closed 2026-11-04

The owner confirmed BSD-3-Clause, so the root `LICENSE` is now present with
holder `The RadicalTrainingPlatform Authors`, year 2026. The README's badge,
section and link are accurate, and [SOURCE-INVENTORY.md](SOURCE-INVENTORY.md)
records the third clause of C-09 as satisfied. The vendor manuals are unchanged
by it — a code license is not a rights clearance (C-09), and their disposition
remains an owner decision.

### 6. Travel freeze — closed 2026-11-04

The trip the freeze was preparing for has happened. The owner is back, so
REQ-NCA-08's pre-departure cutoff has no future date to confirm; the candidate
freeze record already archived at this head is the documented state, and
SPRINT-48 S48-06 is struck rather than left waiting on an input that can no
longer arrive. TM-101 stops being a named gap.

## Next session

1. The four remaining blocked rows need the same two inputs, or the owner's
   attestation in their place: a readable June 15, 2026 NCA 7.5 guide (or the
   owner says the manifest structure matches it), and a provider decision
   (SPEC-15 tripwire) for the RedEye model stage.
2. Re-run `bash tests/gates/run_freeze_chain.sh --expect-sha <full SHA>` after
   any change and record the new total at the new head.
