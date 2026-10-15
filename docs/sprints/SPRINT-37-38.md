# Sprints 37-38: Multi-Format Content

**Phase:** Enterprise  
**Duration:** Weeks 73-76 (4 weeks)  
**Goal:** Add video lectures, flashcard decks, and markdown study notes to supplement quiz content.

---

## Status — rescoped by the owner, 2026-10-14

The plan below was written before the OpenSpec package and before the scope fence
in SPEC-01 line 99. Read as written, it asks for four things this repository is
fenced against or does not have: video streaming, an SM-2 scheduler, SQLite
storage, and two dependencies that were never built. The owner's decision was
**"Rescope to the offline half"**, with a separate ruling that **"Embeds are
fine"** — which reconciles to the same action, because an embed is a third-party
network dependency and no video is built either way.

This pair therefore ships the offline half: a format registry, a flashcard deck
and review queue with **no scheduler**, per-format progress, cross-linking, and
offline search. Every cut is recorded below rather than quietly dropped
(SPEC-11 11.1: scope must be cut *visibly*).

## Cut register

| ID | As written | Disposition |
|---|---|---|
| S37-01 | Design content format abstraction | **Taken** — `js/core/ContentFormats.js` |
| S37-02 | Video lecture player (embedded/local) | **Cut.** SPEC-01 line 99: "no public deployment". A player plus a CDN is distribution, and the sprint's own risk table names licensing and hosting cost as unknown. The owner's "embeds are fine" does not change the action: an embed still needs a third-party host and a network, which REQ-DEMO-04 excludes for simulator content and which the offline PWA is built not to need. **No video is built.** |
| S37-03 | Flashcard deck model and UI | **Taken, half.** The deck, the review queue and the UI ship. The **scheduling half is cut** — SPEC-01 line 99 defers spaced repetition by name ("no spaced repetition (Plan v2 L-04 deferred)"). What ships is a fixed, explainable ordering over recorded outcomes, not a schedule. |
| S37-04 | Markdown study notes with rendering | **Already delivered** — `js/views/lesson-reader.js` has rendered a markdown subset (headings, lists, bold, code, paragraphs, escape-first) since Sprint 46 / T-11. Nothing new was needed, and nothing was rebuilt to make it look like new work. |
| S37-05 | Content linking (video ↔ questions, notes ↔ blueprint) | **Taken, rescoped** — the video half of the cross-linking is gone with S37-02; what links is lesson ↔ item ↔ objective ↔ scenario. |
| S37-06 | Progress tracking per content type | **Taken** — `progress/content/<formatId>/<contentId>` in ProgressStore. |
| S37-07 | Content search across all formats | **Taken, offline only.** "Across all formats" is satisfied by the registry; search must run with no network. |

**Dependencies, both absent:**

- **S9-03 (SQLite persistence)** — no SQLite anywhere in Core or Web. The
  persistence that exists is `StateStore` (IndexedDB with a localStorage
  fallback), and D7 locks progress as local-first there. Storage for this pair
  is **StateStore, not SQLite**.
- **S17-01 (SM-2 scheduler)** — Sprint 17 is a plan, not a build. There is no
  SM-2 code, no ease factor, no interval, and no `nextReview` field in this
  repository. The sprint's "reuse SM-2 from S17" was reuse of something that does
  not exist.

The plan's other two key decisions are also superseded: "videos streamed from a
CDN" by the S37-02 cut, and "flashcards and notes in SQLite" by S9-03's absence
and D7.

## Key Decisions (as executed)

- **Cards are derived, never authored.** A flashcard is an existing practice item
  presented as a prompt/answer pair — front is the stem, back is every correct
  option plus the explanation. Nothing in `content/` changed, so the content,
  lint, provenance and RedEye gates are exactly as they were.
- **A card shares its item's ID, and that is deliberate.** Deriving means the
  deck cannot drift from the bank, and it means no new ID space and no manifest
  edit. The cost is that `formatFor()` classifies identity and cannot name a
  card; callers that need the format say so explicitly.
- **Review progress is keyed separately from scored progress.** "I reviewed this
  card" and "I answered this item correctly" are different facts, and a card flip
  that counted as a correct answer would inflate a score.
- **No scheduler, and the UI says so.** The picker, the run and the results
  screen each state plainly that there is no review schedule, so a learner cannot
  rely on one that does not exist.

## Execution record

| Item | Landed | Evidence |
|---|---|---|
| S37-01 registry | `84180d0` | `tests/gates/web/content-formats.mjs` — 14 tests; classifies all 296 real IDs, not a sample |
| S37-06 per-format progress | `bad9e74` | `tests/gates/web/content-progress.mjs` — 11 tests, including the isolation claim |
| S37-03 deck + review | `6007653` | `tests/gates/web/flashcards.mjs` — 13 tests, driving the click path end to end |
| S37-04 markdown notes | already present | `js/views/lesson-reader.js` since Sprint 46 |
| S37-05 cross-linking | pending | — |
| S37-07 offline search | pending | — |

## Verification

- **`tests/gates/web/flashcards.mjs` — 13/13.** Both directions checked per
  SPEC-16 #4: truncating a multi-key card's back to its first key fails the
  fixture, and routing a review through `recordItem` instead of `recordContent`
  fails it. Both breaks were applied, observed failing, and reverted.
  One test was removed rather than added while tightening this file: a
  `reviewedCount` export existed only for a fixture to call, so it was deleted
  and its claim left to `content-progress.mjs`, which asserts it against the
  store method that actually computes the number. Two ways to compute one count
  is how they drift apart.
- **The accessibility sweep now audits the two new routes.** `tests/e2e/a11y-web.mjs`
  reads `router.register(...)` out of `js/app.js`, so a new route is a new audit
  target with no list to update; its coverage check *fails* if a parameterized
  route has no concrete instance, which is what forced `#/flashcards/NCA-75` into
  `PARAMETERIZED_TARGETS`. **56 routes × 2 themes, PASS** — up from the 54 of the
  S35-36 freeze. The archived S35-36 log remains the record of *that* freeze and
  was not regenerated.
- **The web fixture gate** (`run_web_fixtures.sh`) auto-discovers
  `tests/gates/web/*.mjs`, so this fixture joined the existing chain line. The
  chain did not grow: **59/59 at `6007653`**, unchanged.
- `check-imports.py`, `check-brand.py`, `check-traceability.py`,
  `check-content-bundle.py` and `check-artifact-secrets.py` all pass.
- **The helper stubs were extended, not worked around.** `StubElement` had no
  `replaceChild` and no `parentElement`, so the re-render path that five views use
  (`practice.js`, `demo-mode.js`, `nca-lab.js`, `ticket-lab.js`, and now
  `flashcards.js`) had never been exercised by any fixture — the swap silently did
  nothing. Both were added as faithful mirrors of the DOM methods.

### Not verified

- **The keyboard behaviour after a re-render is inherited, not fixed.** The review
  run replaces its root, the same `#swap` the other four views use, so focus is not
  restored and a keyboard user resumes from the top of the tab order. The rehearsal
  already notes this for the demo reset; it is inherited here and recorded rather
  than fixed, because a fix on this one surface would leave the others
  inconsistent and would ship unverified — the sweep audits routes as they load
  and never reaches a click.
- **The contrast of these surfaces after interaction is unmeasured.** The sweep
  audits the route as it renders; the revealed answer, the "missed it" state and
  the results screen are never on screen during it. Their inks were chosen from
  tokens that clear AA on `--bg-page` in both themes and computed by hand, but
  hand-computed is not measured.
- **No card was reviewed by a person.** The RedEye model stage is unconfigured and
  no item has been reviewed, so the cards inherit `draft` provenance exactly as
  the practice sets do.

## Findings recorded rather than fixed

- **`tokens.css` overstates one ratio.** The dark-theme comment says `--success`
  and `--danger` both "clear AA on `--bg-card` (#1e2030)". Measured: `#22c55e` is
  7.07:1 there (correct), but **`#ef4444` is 4.278:1 — below AA**. No rendered
  element pairs them: every `--danger` ink in `study.css` sits on `--bg-page`
  (`#131520`), where it measures 4.828:1 and passes. So this is a comment that is
  wrong about a case nothing renders, not a contrast failure. Left for the next
  accessibility pass rather than edited here, since `tokens.css` is S35-36's
  surface and a change there needs its own measurement.
- **The context chip disagrees with the breadcrumb on study routes.**
  `app.js #onRouteChanged` sets the switcher to `pe` for any path that is not
  `/pc`, so `/tracks`, `/practice/:examId` and now `/flashcards` show a **"Prism
  Element"** chip beside a **"Study Tracks"** breadcrumb. The PE *chrome* on those
  routes is deliberate; only the label is misleading. Pre-existing for the two
  older routes, inherited by the new ones, and recorded rather than changed —
  the right third label is not obvious and changing shipped behaviour is not this
  pair's job.

## Original plan (superseded — kept for the record)

| ID | Deliverable | Points |
|---|---|---|
| S37-01 | Design content format abstraction | 2 |
| S37-02 | Implement video lecture player (embedded/local) | 4 |
| S37-03 | Implement flashcard deck model and UI | 4 |
| S37-04 | Add markdown study notes with rendering | 3 |
| S37-05 | Add content linking (video ↔ questions, notes ↔ blueprint) | 3 |
| S37-06 | Add progress tracking per content type | 2 |
| S37-07 | Add content search across all formats | 3 |

**Total:** ~21 points over 2 sprints
