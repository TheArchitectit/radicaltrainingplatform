# NCA-75 RedEye lane with the local model — run record (2026-11-23)

**Head:** `65f6c85` (verdict hardening) · **Config:** `scripts/redeye-config.local.json`(sha256 `959831bd…`) · **Manifest:** `content/exams/NCA-75/exam.json`
(sha256 `e739ef34…`) · **Model:** `qwen3.8-flash-next-uncensored` at the fleet's
local OpenAI-compatible endpoint, blind key derivation (the keyed answer is not
in the prompt).

## Commands

```
python3 scripts/redeye-lane.py --exam NCA-75 --config scripts/redeye-config.local.json \
  NCA-75-Part1.md NCA-75-Part2.md NCA-75-Part3-GapFill.md \
  content/exams/NCA-75/questions/nca75-pilot.md
python3 scripts/redeye-gate.py NCA-75 --config scripts/redeye-config.local.json
```

## Results — 184 items reviewed

| Bank | Items | `modelStage` | `verdict` | Non-pass checks |
|---|---|---|---|---|
| `NCA-75-Part1.md` | 40 | verified 40 | return 40 | `mapping-check` fail 40, `provenance` fail 40 |
| `NCA-75-Part2.md` | 40 | verified 40 | return 40 | `mapping-check` fail 40, `provenance` fail 40 |
| `NCA-75-Part3-GapFill.md` | 60 | verified 60 | return 60 | `mapping-check` fail 60, `provenance` fail 60 |
| `nca75-pilot.md` | 44 | verified 44 | **pass 44** | none |

Every one of the 184 keys was independently derived by the model and agreed with
the keyed answer (184/184 `key-vs-source: pass`). No position-bias, originality
or injection flag was raised.

**Pilot size, measured:** 44 items, distributed 10 / 12 / 10 / 12 across sections
1–4, every objective covered by ≥3 items. The sprint rows say "40 items, 10 per
section"; that is the authored target, not the file. The discrepancy is recorded
rather than smoothed.

**Dates:** the lane stamps are UTC and the run crossed UTC midnight, so the
`automatedReview` values written into the provenance records read
`redeye-lane:2026-11-24` while the local run date is 2026-11-23.

## Ship-gate

`redeye-gate.py NCA-75` gated **304** items (the 184 above plus the two
unreleased pack banks, below) and excluded **260**, exit 1:

- **140** legacy root-bank items — `verdict is 'return'`: `mapping-check` and
  `provenance` fail because the legacy banks carry no C-02 provenance records.
  The lane reads provenance records, not `remap.csv`, so a complete remap
  inventory does not satisfy it.
- **120** items in `content/exams/NCA-75/questions/nca75-new-part{1,2}.md` —
  `no review log`: neither bank is in `RELEASED_BANKS` for NCA-75 (only
  `nca75-pilot.md` is), and this pass did not review them.
- **44** pilot items — `ok`.

## The false green this run found (fixed in `65f6c85`)

On the first sampled bank items, `key-vs-source` passed while `mapping-check`
and `provenance` failed — and the log still carried `verdict: "pass"`, because
the verdict was the model stage's opinion alone. The ship-gate reads the
verdict, so those items would have been released with two failing checks. The
lane's verdict is now `pass` only when every check passes, and the gate re-reads
the log's `checks` instead of trusting the summary. Both self-tests grew;
`tests/gates/run_redeye_fixtures.sh` passes.

## Vision capability test (same endpoint)

The NCA 7.5 blueprint guide (`sourceUrl` in the manifest) was fetched and hashed
to `d876abc5acd9…` — matching the hash S48-02 recorded. Renderings of pages 1–2
were sent to the model as PNGs:

- Page 1: read correctly (title, "7.5", no section headings on the cover).
- Page 2 (table of contents): section headings matched `pdftotext` verbatim,
  4/4. End-of-page resource labels were misread (`5.1…5.4` as `S.1…S.4`).
- Budget: a dense page returned `content: null` at `max_tokens: 900`; 2500
  completed it (`finish_reason: stop`). Same failure mode the lane already
  fails closed on.

This is a capability test, not a review stage: nothing in the lane consumes
page images yet.

## Update 2026-11-24 — legacy rerun with remap-aware mapping

After `mapping-check` learned to read `content/exams/NCA-75/remap.csv`, the
three legacy banks were rerun (model stage only, no source pin):

| Bank | Items | mapping-check | provenance | verdict |
|---|---|---|---|---|
| Part1 / Part2 / Part3-GapFill | 140 | pass 140 (from remap.csv; `keyReviewed=false` → provisional) | fail 140 (no C-02 record) | return 140 |

The keys remain 140/140 model-agreed. Nothing releases: provenance is the
remaining blocker, and `rightsStatus` is still an assertion in the remap rows
rather than a review.

**Gate counts at this state.** With the source pin (`--source-config`):
304 gated — 13 ok (source-verified pilot items), 140 `no source-verified log`,
120 `no review log`, 31 `verdict is 'return'`. Without the pin: 0 ok — the 44
pilot logs bind sources and are excluded as stale, the 140 return, 120 have no
log. The two configurations measure different questions and neither is a pass.

## What this record does not establish

- **No source-grounded review.** `key-vs-source` is the model's blind
  derivation, not a check against the cited Nutanix guide or documentation;
  REQ-REV-01(a)'s "against the source material" is still unmet.
- **No explanation re-read, no rights check.** The lane has no such checks.
- **No human review.** `reviewer` is empty on every record and
  `reviewDate` is empty; `status` is `draft`.
- **Nothing released.** The 140 legacy items remain excluded; the pilot stays
  `draft-preview`.
- **Logs are local.** `content/review-logs/` is gitignored and hash-bound;
  they are regenerable from the commands above, not committed evidence.
