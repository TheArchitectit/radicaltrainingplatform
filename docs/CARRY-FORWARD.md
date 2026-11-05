# Carry-forward — state at 2026-10-18

**Measured head:** `da77118` on `feature/rtp-beginner-tracks` (the docs-only
commit that adds this page follows it; `git log -- docs/CARRY-FORWARD.md`
names it).
**Freeze chain:** **64/64 at `da77118`**, measured with `--expect-sha` on the full
40-character SHA.
**OpenSpec package:** `rtp-beginner-tracks-2026-10` — every task T-01..T-46 is
landed; the six 🟡 rows in Sprint 48 are blocked on inputs listed below.
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

All six are Sprint 48. None is blocked on code; each needs an input the
repository does not contain.

| Row | Task | Blocker | What unblocks it |
|---|---|---|---|
| S48-01 | T-31 remap inventory | RedEye model stage is `blocked` (no provider); `mapping-check` reads provenance records the lane does not have | Provider activation — a SPEC-15 tripwire — plus provenance records |
| S48-02 | T-32 current blueprint | The current NCA 7.5 guide is not in the tree; the identity criterion's closing clause needs it | The guide, read by a human |
| S48-03 | T-33 40-item pilot | Same model-stage blocker; all 40 ship `draft-preview` with no item verified | Provider activation; the cut is recorded, not hidden |
| S48-04 | T-34 companion surfaces | The guide was not opened, so no remaining sheet claim was re-checked | The guide, read by a human |
| S48-06 | T-36 travel freeze | The itinerary cutoff date is not supplied | The owner's date |
| S48-07 | T-31a source inventory | HG-01 needs the copyright-holder line; `rightsStatus` has a gap | The owner's LICENSE line (SPEC-15 tripwire) |

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

## Next session

1. Supply whichever blocked inputs are available (the LICENSE line and the
   travel cutoff are owner-only; the guide needs a human read).
2. Supply the owner-only inputs above; no coding workaround can close those rows.
3. Re-run `bash tests/gates/run_freeze_chain.sh --expect-sha <full SHA>` after
   any change and record the new total at the new head.
