# OpenSpec SPEC-03 — Beginner Study UI and Demo Mode

**Source:** [OpenSpec package rtp-beginner-tracks-2026-10](../../drive-ingest-2026-10-10/RTP-Beginner-Tracks-Openspec-Change-Package-A-Network-NCA75-v2.md), SPEC-03
**Executed in:** [SPRINT-46](../SPRINT-46.md) (T-11, T-12) + [SPRINT-47](../SPRINT-47.md) (T-21 demo mode) · **Gates:** TM-20 series, TM-40 series · **Depends on:** SPEC-02 manifests

## Purpose

Add the missing learning loop to the Web PWA — pick a track, read a lesson, practice with deterministic scoring, see progress, reset — plus the owner-directed demo mode across all simulator content. This is the surface the October 23 room actually touches.

## Requirements (normative)

| ID | SHALL | Scenario |
|---|---|---|
| REQ-UI-01 | Track-picker view (`/tracks`) lists the three tracks with display names, coverage %, preview label, and the exact REQ-BRAND-02 disclaimer. Start route in demo mode. | Fresh profile → three cards render; NCA card shows “Nutanix Certified Associate 7.5” (not a beta label); disclaimer matches byte-for-byte. |
| REQ-UI-02 | Lesson-reader view renders reviewed original lesson markdown with objective IDs from the manifest. Unreleased modules render as “planned”, never dead links. | A+ Core 1 networking lesson renders with its objective IDs; four planned sibling modules show as planned. |
| REQ-UI-03 | Practice view runs scored sets: single/multi-select, immediate review with explanations, scoring identical to Core rules (R-03/R-04 repairs apply). Study mode offers hints; assessment-style runs hide hints and tutor until submission (Plan v2 L-01). | 5-item multi-select fixture set scores exactly matching Core fixture vectors; review screen shows reviewed explanation per item. |
| REQ-UI-04 | Progress persists locally through ProgressStore (over StateStore’s IndexedDB/localStorage), keyed by stable item IDs. Storage failure (full/denied) surfaces an honest recoverable error, never a false save (Plan v2 L-02). | PWA killed and relaunched → progress intact. IndexedDB disabled + localStorage blocked → UI reports progress cannot be saved. |
| REQ-UI-05 | Progress durability proven end-to-end (closes the “stores exist but nothing calls them” finding): practice view calls ProgressStore on every scored event; E2E answers, reloads, asserts restored state. | E2E restored counts equal pre-reload counts. |
| REQ-UI-06 | Study works fully offline after install: lessons, questions, scoring, progress, scenarios (Plan v2 L-10). Uncached tutor shows an explicit unavailable state. | Installed PWA, radio disabled → lesson + practice + DNS scenario all function; tutor button shows offline state. |
| REQ-UI-07 | One-click station reset clears `progress/` and `scenario/` keyspaces and reseeds every scenario fixture without clearing app code or packs. | Dirty station → reset → track picker shows zero progress; each scenario’s seed state verified via its validator’s negative path. |
| REQ-UI-08 | No identity collection: no name, email, account or student ID anywhere in track, practice, scenario or tutor flows. | Full walkthrough screen inspection → zero identity fields. |
| REQ-BRAND-01 | Naming is nominative only. “Approved”, “official”, “certified by”, CompTIA/Nutanix logos or marks are forbidden in UI, manifests, lesson text, demo script. | Repository grep fixture of forbidden strings/mark assets fails the build on any hit (`scripts/check-brand.py`). |
| REQ-BRAND-02 | The exact disclaimer — “This is independent study material. It is not official training and is not endorsed or approved by CompTIA, Nutanix, or any other certification body.” — appears on the track picker, each exam overview, and in the demo script. Stored once (manifest field), rendered by reference. | Snapshot test pins the exact string on all three surfaces. |
| REQ-DEMO-01..06 | Demo mode per SPEC-01 01.4b: all 44 existing + 6 new scenarios boot/run/report completion correctly from seeded state; one-click reset; no account/persistence/network; projector-readable and keyboard-operable. | Scripted demo-mode sweep (TM-45) → all 50 scenarios pass boot/run/incomplete-then-complete; report names each scenario ID and result. |

## View contracts (detail)

- **track-picker.js** renders from track manifests only — no hardcoded track strings — so a fourth track never requires a view change.
- **lesson-reader.js** renders reviewed lesson markdown with reading-progress indicator, objective chips linked from the manifest, and the lesson’s practice-set entry point; unreviewed lessons never render (the validator’s release set is the only source).
- **practice.js** presents one item per screen; study mode with hints + immediate explanation; review mode after submission with per-item rationale; ordering items excluded until R-03 lands.
- **ticket-lab.js** hosts both CompTIA scenarios (SPEC-07); owns no scoring logic — validators decide; the view displays the evidence panel.

## Demo-mode operating contract (detail)

Demo mode is a distinct mode, not learner mode with sign-in hidden: deterministic seed on entry; visible “demo mode” label on every screen; synthetic data only; zero outbound calls from simulator content; one-click reset confirmed by a reseed verification pass; no retention of any student’s answers after reset. The completion panel tells the truth without pretending to be an exam score — mastery, job qualification and certification-readiness claims are forbidden strings (snapshot-tested). Observation tasks require a recorded interpretation response — visiting-without-responding fails.

## Files

**New:** `Web/js/views/track-picker.js`, `lesson-reader.js`, `practice.js`, `ticket-lab.js` (shared with SPEC-07); `Web/js/core/ProgressStore.js`; `Web/css/study.css`; `tests/e2e/study-loop.spec.js`, `demo-sweep.spec.js`, `offline.spec.js`; `scripts/check-brand.py`.

**Modified:** `Web/js/app.js` (4 new routes — 47 to 50), `Web/index.html` (start route in demo mode), `Web/sw.js` (precache new assets), `.github/workflows/build.yml` (E2E job).

## Acceptance

REQ-UI-01..08, REQ-BRAND-01..02, REQ-DEMO-01..06 scenarios pass at the release head; E2E runs in CI on the Linux leg (headless Chromium) and the same suite passes manually on ChromeOS; coverage label, disclaimer and preview label snapshots pinned.
