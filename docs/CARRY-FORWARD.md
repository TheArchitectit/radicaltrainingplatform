# Carry-forward — state at 2026-11-04

**Measured head:** `96f1ae9` on `main` (each closure below records its own SHA
and chain total; this line names the overnight run's last verified commit).
**Freeze chain:** **74/74 at `96f1ae9`**, measured with `--expect-sha` on the full
40-character SHA.
**OpenSpec package:** `rtp-beginner-tracks-2026-10` — every task T-01..T-46 is
landed. Sprint 48: S48-02/05/06/07/08 ✅; S48-01/S48-03 blocked on the RedEye provider; S48-04's
storage-fabric claims need the AHV guide, which is not obtainable.
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
| ~~S48-02~~ | T-32 current blueprint | **Closed 2026-11-23** — the owner attested the guide matches the manifest, after a tool comparison (4/4 sections, 14/14 titles, versions, no weight table, `sha256:d876abc5…`). `sourceReviewDate` is `2026-11-23` | — |
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

### 7. SPEC-22 CI gate repair — closed 2026-11-23

`rtp-ci-gate-repair-2026-11` was the only open spec package. Both defects were
gate defects, not product defects: ShellCheck provisioning assumed
`python3 -m venv` exists on the self-hosted runner (it does not — no
`ensurepip`, no `pip`, no `xz`), and 19 plugin tests built Windows paths with
`/` literals. `scripts/provision-shellcheck.sh` now resolves a static binary
through stdlib `lzma`/`tarfile`, and the tests route every expectation through
the same `Path.Combine` production uses. Both carry fixture suites, both are in
the chain. Measured: chain **77/77 at `00aed23`**, ShellCheck fixtures 6/6,
provisioning fixtures 5/5, plugin tests 19/19 on Linux.

**Not observed here:** the Windows CI job conclusion. Recorded as a limit, not
claimed.

### 8. The three named TM gaps — closed 2026-11-22

`SPEC-12`'s index carried three rows whose evidence was "named gap — no gate":
TM-94 (A+ illustration label), TM-95 (A+ worked examples), TM-102 (Network+
declared gaps). `scripts/check-labelled-content.py` now proves all three, with
nine seeded failures, and `tests/e2e/smoke-web.mjs` asserts in a real browser
that lesson A4 actually renders the required label on its `#/pe/vms` link.

Two things had to exist for that to be true rather than claimed: the lesson
reader gained internal `#/…` link rendering (escape-first, no external hrefs),
and the A+ manifests gained declared gaps plus four labeled worked examples.
The gate deliberately scopes the gap→example rule to the exams that adopted the
convention (Network+, A+); AWS-SAA, AZ-104 and NCA-75 use `gaps` for *authoring*
gaps ("no lesson or item covers it"), which are reported as advisories rather
than papered over with invented examples.

## Next session

1. **Local model for RedEye (S48-01/S48-03)** — the owner asked for a local
   model rather than a paid provider; it needs an endpoint and model name, then
   the lane can verify items with no spend.
2. **AHV 11 admin guide** — S48-04's storage-fabric claims are still unverified;
   the owner approved sourcing it.
3. **AHV 11 / AOS guide** would close the rest of S48-04's claims. It is the
   second pointer-only PDF; the vendor URL is not known to this repository.
4. The bot branch `forge-bot/NEXT-548` is still local-only and the audit digest
   keeps flagging it: land it or delete it (owner call).
5. Re-run `bash tests/gates/run_freeze_chain.sh --expect-sha <full SHA>` after
   any change and record the new total at the new head.
