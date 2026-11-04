# OpenSpec SPEC-20 — Record Who Actually Reviewed an Item

**Home:** `content/provenance/*/Q*.json`, `scripts/redeye-lane.py` · **Supersedes in part:** SPEC-08A
**Executed in:** this change · **Gates:** `scripts/lint-content.py` (extended), TM-110b
**Depends on:** SPEC-08A (RedEye lane), SPEC-15 (tripwires)

## The defect

The C-02 provenance field `reviewer` is meant to name **who** stands behind an item.
It currently says two different and both wrong things:

- **419 items** say `"reviewer": "redeye-lane"`. That is a *tool*, not a person. When
  the deterministic lane ran, it wrote its own name into the reviewer field. Nobody
  read those 419 items.
- **780 items** (the Oct-11 drop) say `"reviewer": ""`. The lane flags them
  `provenance: incomplete`, which is accurate but uninstructive: the reader learns the
  field is blank, not that no human has looked.

So the field is inconsistent *and* it overstates in one direction and under-informs in
the other. The RedEye evidence page already says the honest thing —
*"'Reviewed with RedEye' means the deterministic checks ran and a log exists; it does
not mean cleared"* — but the record a machine reads does not.

This matters more now than it did, because the owner has ruled (2026-11-04) that
`draft-preview` items may be used by students. That ruling does not create a review. It
makes the record's honesty the only thing preventing "a tool ran" from being read as
"a person checked it" — and the record is about to be published.

## The fix

Two fields with two jobs, each stating exactly what happened:

| Field | Values | Means |
|---|---|---|
| `reviewer` | `""` or a human's name | **Who** read the item. Empty means no human. |
| `automatedReview` | `"redeye-lane:<date>"` | Which **tool** ran over it, and when. |

The 419 items move `redeye-lane` from `reviewer` to `automatedReview`, leaving
`reviewer` empty because it always was. The 780 gain nothing they did not earn — they
get `automatedReview` only once the lane has actually run over them, which is what
`scripts/redeye-lane.py` will write from now on.

`reviewer` stays in the C-02 required-field list, now with an explicit definition: it is
**not** required to be non-empty, because an empty reviewer is a true statement about
this pack. The lane's provenance check stops calling an empty `reviewer` a failure and
starts checking the pair is coherent (see REQ-RV-03).

## Requirements (normative)

| ID | SHALL | Scenario |
|---|---|---|
| REQ-RV-01 | `reviewer` names a human or is empty. No automated tool's name may appear in it. | Gate: `reviewer` matching `redeye-lane`, `redeye`, `lane`, `script`, `automation` or `ci` is a failure naming the item. |
| REQ-RV-02 | `automatedReview` carries `<tool>:<YYYY-MM-DD>` and is written only by the tool that ran. Today that is `redeye-lane` alone. | Gate: a non-empty `automatedReview` that does not match the pattern fails; an empty one is allowed. |
| REQ-RV-03 | The provenance check fails only on a *lie*, never on an honest empty: an empty `reviewer` with no `automatedReview` is "no review of any kind", which is reported as an advisory count, not a per-item failure. A non-empty `reviewer` with an empty `reviewDate`, or a `status: reviewed` with an empty `reviewer`, is a failure. | Lane run over the tree reports N items with no review of any kind and exits 0; a fixture claiming `status: reviewed` with no reviewer fails. |
| REQ-RV-04 | The lane writes `automatedReview`, never `reviewer`. Running it over the tree changes no `reviewer` value. | Fixture: after a lane run, every `reviewer` value is byte-identical to before; `automatedReview` is populated. |
| REQ-RV-05 | The 780 Oct-11 items are **not** back-filled with a tool's name. They stay empty until the lane or a human actually runs. The record must not gain confidence from a migration. | Count check: 0 of the 780 has a non-empty `reviewer`; `automatedReview` is populated only where a lane log exists. |

## What this spec does NOT do

- It does not review any item. Every item in the pack still has `reviewer: ""`, and
  `status: draft`. That is the true state, and the owner's ruling accepts it.
- It does not run the model stage. `key-vs-source` is still `pending` with no provider
  (SPEC-15 tripwire #1) — unchanged by this fix.

## Verification

```
python3 scripts/migrate-reviewer-provenance.py --dry-run --date 2026-10-20
    # expected after the migration: migrated=0 already=419
python3 scripts/lint-content.py --self-test      # tool-in-reviewer, no-date, reviewed-without-reviewer fail
python3 scripts/lint-content.py
python3 scripts/check-nca-remap.py --self-test
bash tests/gates/run_remap_fixtures.sh           # tool-reviewer, bad-automated fail
python3 scripts/redeye-lane.py --self-test       # lane stamps automatedReview, leaves reviewer (REQ-RV-04)
python3 tests/gates/redeye/self_test.py
bash tests/gates/run_freeze_chain.sh
```

The rules themselves live in `scripts/review_record.py` so the lint gate, the
remap gate and the RedEye lane cannot disagree; each of their self-tests drives
the shared function with a seeded violation.

## How it was executed (2026-11-04)

- `scripts/migrate-reviewer-provenance.py --write --date 2026-10-20` moved the
  419 tool-attributed records to `automatedReview: "redeye-lane:2026-10-20"`
  and emptied `reviewer`. It is idempotent (a second dry run reports
  `migrated=0 already=419`) and it never touches a record with a human's name.
- `content/exams/NCA-75/remap.csv` had the same defect in its `reviewer`
  column (140 rows). The lane ran over those banks, but **no run date was ever
  recorded** — so those rows carry `automatedReview: "redeye-lane:date-not-recorded"`
  rather than an invented date, and `reviewer` is empty. `check-nca-remap.py`
  accepts exactly that token or a real date.
- `scripts/redeye-lane.py` now stamps `automatedReview` on the record of every
  item it reviews (unless a human is named on it) and never writes `reviewer`.
  The date comes from the run, not the wall clock, so a log and its stamp agree.
  Its self-test seeds a human reviewer and asserts it survives byte-identical
  (REQ-RV-04).
- Freeze chain: **68/68** after the change.

## What was NOT verified

- **The 2026-10-20 date is the one date this session had a basis for** (the
  lane's first run landed with the Oct-20 content work). No review log
  survives in-tree for those 419 items — `content/review-logs/` is gitignored
  and regenerable — so the date is a recorded fact about the pack, not proof
  that a log exists for each item. If the owner knows a different date, that
  is a one-command correction; it has not been made up either way.
- The record still says what it said about every other field. **Nothing was
  reviewed.** No human read any of the 1,199 items. Every item in the pack is
  `status: draft` with an empty `reviewer`, and the UI says so.
- `redeye_analysis.check_provenance` (now delegating to `review_record.py`)
  still reports provenance for the item under review, but an empty `reviewer`
  is no longer a per-item failure. There is **no new dedicated gate** that
  counts "items with no review of any kind" tree-wide: the migration script
  reports it (`already=`, `named-human-left-alone=`), and the lane run is the
  place that count belongs. Stated here so the gap is visible rather than
  assumed covered.
