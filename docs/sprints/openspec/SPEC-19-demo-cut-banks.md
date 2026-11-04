# OpenSpec SPEC-19 — Rename the Demo-Cut Banks and Label Their Origin

**Home:** `content/exams/*/questions/` · **Promise kept:** SPEC-04 REQ-AP-02, SPEC-05, SPEC-07
**Executed in:** this change · **Gates:** `scripts/check-content-bundle.py` (extended), TM-110a
**Depends on:** SPEC-02 (manifests), SPEC-04/05 (item counts), SPEC-08A (RedEye lane)

## The defect

Seven banks are named `*-fixtures.md` and are the October 23 demo cut: `core1-a2-fixtures.md`
(16 items), `core2-b2b4-fixtures.md` (8), `net009-n1..n5-fixtures.md` (5 each), 49 items in
all. All seven are in `RELEASED_BANKS` and ship inside the PWA as ordinary practice items.

Three problems, in order of severity:

1. **The name says "fixture", which in this repository means a test input.** `tests/gates/`
   is full of files called fixtures; those are adversarial inputs a gate must fail on. A
   learner's item is the opposite of that. A reader browsing `content/` — or a reviewer
   deciding what may be published — cannot tell which 49 of 419 items are "test data"
   by the filename alone, and would reasonably conclude 49 items are not meant for students.
2. **The demo cut's origin is recorded nowhere.** SPEC-04 REQ-AP-02 says "the practice set
   draws only from the 24 reviewed items and says so on screen." That was the cut's
   contract. When the beginner banks landed on 2026-10-26 the items were folded into the
   released set and the promise stopped being stated: today a practice header names the
   track, not that 16 of its Core 1 items are the demo cut.
3. **The banks cannot simply be deleted.** Checked objective by objective: six objectives
   (`A-1201` 2.3, 2.4, 5.5; `A-1202` 2.5, 4.1; `NET-009` 1.7, 3.2) have no non-fixture
   bank and would fall below R2's three-item floor. The items are real, original
   exam-style items; only their name and their unrecorded origin are wrong.

## The fix

Rename, keep the content, record the origin. A rename is the honest fix because the
defect is in what the name and the records say, not in the items.

| Old name | New name | Why |
|---|---|---|
| `core1-a2-fixtures.md` | `core1-demo-cut.md` | A2/A5 demo cut, 16 items |
| `core2-b2b4-fixtures.md` | `core2-demo-cut.md` | B2/B4 demo cut, 8 items |
| `net009-n1-fixtures.md` … `n5-fixtures.md` | `net009-n1-demo-cut.md` … `n5-demo-cut.md` | N1–N5 demo cut, 5 each |

The **item IDs move with the bank** (`<examId>/<bank>/<Qn>`). This is a deliberate,
recorded one-time rename, not the renumbering SPEC-16 forbids: question numbers are
unchanged, only the path segment moves. Learner progress is keyed by the full
`<examId>/<bank>/<Qn>` string (`ContentFormats.js`), so progress recorded against the
old path does not follow the rename. The product is `draft-preview`, has never shipped a
public release, and the rename lands before the first npm package — so there is no
released state to migrate. This is stated in the spec rather than assumed.

## Requirements (normative)

| ID | SHALL | Scenario |
|---|---|---|
| REQ-DC-01 | No released question bank's filename contains the word `fixture`. The seven files are renamed as above, and `RELEASED_BANKS`, the provenance records, `content-manifest.json`, `content-bundle.json` and `study-content.js` all carry the new names. | Gate: every bank in `RELEASED_BANKS` whose name matches `-fixtures?\.md$` is a failure naming the file. |
| REQ-DC-02 | Each renamed bank's provenance record carries `demoCut: "<YYYY-MM-DD>"` — the date of the cut it came from (`2026-10-23`). The field is additive; the C-02 fields are unchanged. | Gate: every item in a `*-demo-cut.md` bank has a `demoCut` value parseable as an ISO date. |
| REQ-DC-03 | The practice header states the pack's demo-cut share when it has one: "N of its items are the October 23 demo cut". Derived from the published items, never a hand-maintained list. | Fixture: a pack with demo-cut items renders the sentence with the right count; a pack without omits it. |
| REQ-DC-04 | Items are not reordered, not renumbered, and none is dropped. The rename changes paths only; every item count per exam is unchanged. | Check: per-exam released counts before and after are equal (86/108/75/44/51/55). |
| REQ-DC-05 | This is the last rename of these banks. The gate fails if a *new* name drifts back to `fixture`; it does not prevent future additive banks. | Gate REQ-DC-01 is the standing rule. |

## Migration note (stated, not moved past)

Progress keys recorded against `*-fixtures.md` do not resolve after the rename. The
paths are only ever written to `localStorage`/IndexedDB by a learner's browser, and no
public release has been made, so the only affected profiles are developers' and demo
machines'. The alternative — an alias layer that maps old→new keys — was rejected: it
would keep the forbidden word in the shipped bundle forever to serve a handful of
pre-release profiles. REQ-DC-04 checks the thing that would matter if this were wrong:
that no item was lost.

## Verification

```
python3 scripts/check-content-bundle.py
python3 scripts/generate-bundle-manifest.py --content content --out content-manifest.json --check
python3 scripts/generate-study-content.py --check
python3 scripts/check-item-identity.py          # zero live semantic-ID collisions
bash tests/gates/run_freeze_chain.sh
```
