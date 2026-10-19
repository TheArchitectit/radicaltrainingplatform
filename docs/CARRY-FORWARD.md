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

## Deferred decisions — not started

### 1. Gateway controls

`services/ai-gateway/` is a loopback-only, zero-dependency service
(`server.mjs:118` binds `127.0.0.1`). Three controls are advertised or implied
but not in force:

* `rateLimitPerMinute: 10` — `provider.mjs:42`, `config.example.json:11`.
  Nothing reads it; there is no 429 path.
* `spendKillSwitch: null` — `provider.mjs:44`, `config.example.json:15`.
  Nothing reads it either.
* No CORS or `OPTIONS` handling. A PWA served from `:8080` calling the
  gateway on `:8787` is cross-origin, so live mode would be blocked by the
  browser. This does not break today's behaviour: the default mode is
  `recorded`, and live is opt-in.
* No audit-log sink. `result.logged` is written to the console through
  `redact()` (`server.mjs:103`).

**Options.** Implement them (429 + loopback-origin CORS + a sink, each with a
failing and a passing fixture), or retire the dead keys and document the
gateway as loopback-only with no limiter. **Trade-off:** a 10/minute default
may throttle RedEye, which the owner stated uses the gateway with the same
API key.

### 2. `PlaceholderView` reachability

`RadicalTrainingPlatform.Web/js/views/PlaceholderView.js` is precached
(`sw.js:48`) and tested (`tests/gates/web/route-labels-snapshot.mjs:117`), but
imported by no application code. Unmatched routes redirect to `/pe/dashboard`
instead (`js/core/Router.js:61-65`). Options: wire it as the router's fallback
(the view's documented intent), or remove the view and its direct test. This
is a product/UX choice, not a defect with one safe answer.

### 3. `content-bundle.json` — checked, not a defect

The PWA runtime does not load it; study content ships compiled in
`js/study-content.js`. The bundle file is consumed by
`scripts/check-content-bundle.py` and `tests/gates/tutor-eval.mjs`. It is not
an offline-cache gap, and no action is warranted.

## Next session

1. Supply whichever blocked inputs are available (the LICENSE line and the
   travel cutoff are owner-only; the guide needs a human read).
2. Choose a direction for the gateway controls — implement or retire.
3. Re-run `bash tests/gates/run_freeze_chain.sh --expect-sha <full SHA>` after
   any change and record the new total at the new head.
