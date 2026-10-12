# Backup screenshots and the non-AI backup path — T-28 / S47-12

Archived evidence for S47-12, captured by `tests/e2e/capture-demo-shots.mjs`.
T-28 asks for two things: screenshots (or video) captured as backup evidence,
and the **non-AI backup path rehearsed**.

generated: 2026-10-11T19:05-05:00
head: 0eedfa1
branch: feature/rtp-beginner-tracks
browser: /usr/bin/google-chrome-stable (headless=new, CDP)
viewport: 1440x900, deviceScaleFactor 1, fixed
frames: 12 in `2026-10-23-demo-shots/`
**recaptured: 2026-10-12 at head `a7d6cf6`** — the frames below are the
recapture, not the original 0eedfa1 set; see "The DEMO MODE banner" for why.

## What these frames are, and what they are not

They are the demo path as a presenter would see it, taken from the artifact the
demo serves (`RadicalTrainingPlatform.Web/`) — not a rebuild, not a mock. They
walk the seven named critical flows (PKG:141 — boot, track picker, lesson,
practice, scenario, reset, progress persistence) in demo order, then the
recorded-example tutor.

**They are not a measurement of projector readability.** These are headless
renders at a fixed 1440x900 viewport with no projector in the loop. Nothing here
says anything about legibility at distance. That is T-26's manual half and it
remains unverified — see "Not verified" below.

They are a **backup**, and a backup that lives only on one workstation is not a
backup, so the frames are committed with this record rather than left in a
working directory.

## The frames

| # | File | What it shows |
|---|------|---------------|
| 01 | `01-track-picker.png` | boot: the track picker at `#/tracks` |
| 02 | `02-track-aplus.png` | track picker: the A+ track and its released lessons |
| 03 | `03-lesson.png` | lesson: a released lesson carrying the REQ-BRAND-02 disclaimer |
| 04 | `04-practice-question.png` | practice: an unsubmitted question in a scored set |
| 05 | `05-practice-graded.png` | practice: the graded verdict and rationale after submit |
| 06 | `06-scenario-list.png` | scenario: the scenario list |
| 07 | `07-scenario-ticket.png` | scenario: the `aplus-dns-01` ticket lab, unsubmitted |
| 08 | `08-scenario-ticket-controls.png` | scenario: the fixed diagnostic set, resolution note and Submit |
| 09 | `09-scenario-resolved.png` | scenario: the completed ticket and its validation verdict |
| 10 | `10-demo-controls.png` | reset: the demo controls before entering demo mode |
| 11 | `11-demo-reset.png` | reset: the reseed verification report between groups |
| 12 | `12-tutor-recorded.png` | backup path: the recorded-example tutor answering a demo prompt |

Frame 09 is the scenario leg's centrepiece: the verdict reads **"All objectives
met — ticket resolved."**, the evidence panel shows the requested-vs-actual
configuration and the action trace, and the page footer carries the exact
REQ-BRAND-02 disclaimer string. Frame 08 sits below the fold at this viewport
and exists because the ticket's actionable controls — the diagnostic checkboxes,
the resolution note, Submit — are what the demo actually operates; without it
the backup would show the ticket but not the work.

## The non-AI backup path, rehearsed

REQ-AI-07 requires the fallback to show **reviewed prewritten responses labeled
"recorded example"**, with the label visible and **no network call fired**. Frame
12 is that path, exercised end to end rather than assumed:

- The mode pill reads exactly `recorded example` — the capture script **fails**
  if it does not (`if (mode !== 'recorded example') throw`), so the frame cannot
  be produced from a panel in any other mode.
- The frame shows a real recorded answer to a real demo prompt ("The website
  works by IP address but not by name. Give me one hint, not the answer."), with
  the `RECORDED EXAMPLE` pill, the line *"Reviewed in advance — not a live
  model"*, a hint-not-answer response citing *Networking basics*, and the footer
  *"This station runs recorded examples only. No AI service is connected."*
- The no-network-call half of the requirement is asserted elsewhere and is not
  re-asserted here: `tests/gates/web/tutor-panel.mjs` counts every attempt to
  leave the page. This record claims only what the frame shows — the label and
  the reviewed response — plus the mode check above.

This is the segment that plays if the tutor segment fails on the day. See
`2026-10-23-tutor-go-no-go.md` for why live AI is a **no-go** and the fallback is
a **go**.

## The DEMO MODE banner — defect found here, closed, frames recaptured

At the original capture every frame painted a purple **DEMO MODE** strip at the
top, including frames 01–09, which were taken **before** the script enters demo
mode (it enters at frame 10's step). A reader should not have mistaken that for
demo mode being on.

That was the banner defect S47-10 recorded, confirmed here visually rather than
only by measurement: `.demo-banner { display: flex }` (`css/study.css:495`) beat
the UA stylesheet's `[hidden] { display: none }`, so `DemoBanner.js` set
`el.hidden` correctly and the banner painted anyway. Measured on a fresh profile
with `demo.active` false: `hidden=true`, `display="flex"`, `offsetHeight=46`.

**Closed at `a7d6cf6`** by `[hidden] { display: none !important }` in the Reset
block of `css/components.css`, and **all 12 frames were recaptured** at that
head — so the PNGs in this directory now show the corrected shell, not the
defect. Frames 01–09 no longer carry the strip; frames 10–12 still do, because
demo mode is genuinely on by then. The two directions were confirmed by eye, not
only by measurement: the label is absent in learner mode and present in demo
mode, which is the property that makes it mean anything.

The requirement ID used throughout for this defect was **REQ-DEMO-02**, but the
package defines REQ-DEMO-02 as "each scenario declares a fixture seed; entering
demo mode loads that seed exactly" — seeded state, not the banner. The behaviour
was real; the citation was wrong.

## Reproducing

```bash
node tests/e2e/capture-demo-shots.mjs
```

Zero npm dependencies — the repo has no `package.json`, and Node's global
WebSocket (Node >= 22) speaks CDP directly. The script serves the artifact from
a loopback static server, launches headless Chrome on an ephemeral debugging
port, and drives it over CDP. Env: `CHROME_BIN`, `SHOTS_WEB_ROOT`, `SHOTS_OUT`,
`SHOTS_WIDTH`/`SHOTS_HEIGHT`. It fails closed if no browser is present, and it
**throws** rather than capturing a partial set if any expected view is missing —
so a run that reports 12 frames captured every one of them.

It is **not wired into CI**, for the same reason `run_rehearsal_fixtures.sh` is
not: it produces an evidence artifact on demand, not a pass/fail assertion about
the tree. The gates that do assert behaviour are the fixture runners.

One detail worth recording for the next person: the ticket's config field and
diagnostic checkboxes bind on **`change`**, not `input` (`ticket-lab.js`
`afterRender`). Dispatching a synthetic `input` updates the DOM value and commits
nothing, so the validator still reads the original config and the ticket stays
unresolved. The first version of this script did exactly that and produced a
frame showing *"Not resolved: DNS server is still 10.42.100.99"*. The fix is to
dispatch `change`; frame 09 is the proof it took.

## Not verified

- **Projector readability.** Not measured. This host has no projector; these are
  headless renders at a fixed 1440x900 viewport. T-26's manual half.
- **The actual demo host.** PKG:1469 leaves the machine undecided, and this host
  (`cachyos-plasma`) is not the fleet runner. No frame here was taken on a demo
  host.
- **Video.** T-28 allows "screenshots/video". Screenshots only; no capture of the
  demo in motion, so nothing here shows timing, transitions, or the reset
  animation playing.
- **The tutor segment failing on the day.** The backup path is rehearsed and
  framed; the *switch* — presenter abandons a live segment and falls back mid-
  demo — is a rehearsal on the host, not something a capture script can show.
- **Offline behaviour.** The frames come from a loopback static server. The
  service worker's offline path is not exercised; the network was never unplugged.
- **TM-50 entries for PWA-on-ChromeOS and PWA-on-presenter-host.** No ChromeOS
  device and no presenter host were available. No evidence recorded.

## Environment

```
browser: /usr/bin/google-chrome-stable
serving /mnt/data/git/radicaltrainingplatform/RadicalTrainingPlatform.Web
viewport 1440x900 (headless, fixed — NOT a projector measurement)
zero npm dependencies — Node's global WebSocket speaks CDP directly
```

Chrome's stderr carries GCM registration noise (`PHONE_REGISTRATION_ERROR`)
unrelated to the app; it appears in the capture log and is not a failure.
