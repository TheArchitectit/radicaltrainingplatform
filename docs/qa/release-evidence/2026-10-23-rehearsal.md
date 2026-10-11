# Keyboard-only demo-loop rehearsal — T-26 / S47-10

Archived evidence for S47-10, captured by `tests/e2e/rehearsal-web.mjs` — the
automated half of T-26. The row's other half is a rehearsal **on the actual
demo host**, which cannot be run from this machine (see "Not verified").

generated: 2026-10-11T18:48-05:00
head: 3dda3b8
branch: feature/rtp-beginner-tracks
browser: /usr/bin/google-chrome-stable (headless=new, CDP)

## Why this half exists and why it is not a merge gate

T-26 is a rehearsal on the demo host. Half of it cannot be done from a CI box:
the host machine is still **undecided in the package** (PKG:1469), and
projector-distance readability and a ChromeOS device are physical facts.
TM-48, though, names its own test type as **"manual + automated a11y"**, and
S47-03 explicitly handed the real-browser keyboard walkthrough forward to this
row ("the legibility and button checks are static, not a rendered
measurement"). This file is that automated half, and it is the evidence for the
keyboard clause of TM-48 and of REQ-DEMO-05 ("keyboard-operable, no hover-only
affordances on the demo path").

It drives the seven named critical flows (PKG:141 — boot, track picker, lesson,
practice, scenario, reset, progress persistence) through a real browser using
**nothing but key events**. It never calls `.click()`, because a programmatic
click succeeds on an element the keyboard cannot reach, so a harness built on
`.click()` would report a passing walkthrough for a page no keyboard user can
operate — the precise defect REQ-DEMO-05 forbids.

It is deliberately **not wired into CI**. Its browser legs belong to the hosted
runner by design (see `.github/workflows/pwa-deploy.yml`), and it is expected to
be **red** until the two gaps below are closed; a knowingly-red gate on main's
deploy path would be worse than no gate. `tests/gates/run_rehearsal_fixtures.sh`
is the gate, and it asserts the discrimination rather than the greenness — see
"Fixture runner" below.

## Result: 28 PASS, 2 FAIL, 3 findings

```
## Flow 1 — boot
  PASS the PWA boots to #/tracks with a rendered view

## Flow 2 — track picker
  PASS A+ track card reached by keyboard in 8 Tab press(es)
  PASS Enter on the track card opens the track

## Flow 3 — lesson
  PASS released lesson link reached by keyboard in 2 Tab press(es)
  PASS Enter on the lesson link opens the reader
  PASS the lesson body renders 5883 characters of prose
  PASS the lesson carries the exact REQ-BRAND-02 disclaimer

## Flow 4 — practice
  PASS practice button reached by keyboard in 2 Tab press(es)
  PASS Enter on the practice button opens a practice set
  PASS the practice set renders 4 answer options
  PASS Space selects the focused option (A)
  PASS Enter on submit grades the answer: "Not quite — correct answer: C (DNS)"

## Flow 5 — progress persistence
  PASS the scored answer is still in storage after a reload (2 item record(s))
  FAIL a cold load does not surface the stored progress (note was null) even though the record is present — the learner opens the app to a blank history
  NOTE REQ-UI-04 gap — … (see below)

## Flow 6 — scenario
  FAIL the scenario view is NOT keyboard-reachable: the only control that leads to /pc/scenarios is a nav item with no href (49 such nav items in the shell), so it is not in the tab order and cannot be activated with Enter or Space
  NOTE REQ-DEMO-05 gap — … (see below)
  PASS scenario Start reached by keyboard in 45 Tab press(es)
  PASS Enter on Start mounts the ticket lab
  PASS the DNS field reached by keyboard in 2 Tab press(es)
  PASS the DNS value was typed by keyboard
  PASS the ping-ip diagnostic reached by keyboard in 1 Tab press(es)
  PASS Space checks the ping-ip diagnostic
  PASS the nslookup diagnostic reached by keyboard in 2 Tab press(es)
  PASS Space checks the nslookup diagnostic
  PASS the resolution note accepts typed input
  PASS the ticket resolves by keyboard: "All objectives met — ticket resolved."

## Flow 7 — reset between groups
  PASS demo controls reached by keyboard in 10 Tab press(es)
  PASS Enter on "Enter demo mode" shows the demo banner
  PASS the station reset renders its reseed verification outcome
  NOTE focus after reset is <BUTTON#demo-reset>; … (see below)
  PASS the reset cleared the stored learner keys (progress/* and scenario/*)
  PASS zero console errors, uncaught exceptions, or failed requests

KEYBOARD REHEARSAL: FAIL — 2 problem(s)
```

## Findings — recorded, not silently fixed

These are exactly what a rehearsal exists to surface. Both are defects on the
**demo path**, so they bear on the October 23 condition; neither is closed here,
because S47-10 is a rehearsal row, not a fix row, and each fix reaches well
beyond the demo path.

1. **REQ-UI-04 gap — a cold load does not surface stored progress.** Measured:
   the scored answer is in storage after a reload (2 item records), yet
   `.practice-prior-note` never renders on a cold load. It is not a missing
   feature and not a race: the same view on a client-side route change renders
   *"Saved progress: 0/1 previously answered in this exam pack."* So
   `PracticeView` reads the store before it can see the records. Repro: reload
   the app on `#/practice/COMPTIA-A-1201` with a stored answer, then navigate
   away and back. Effect for the demo: a presenter who opens the app cold sees a
   learner with no history.

2. **REQ-DEMO-05 gap — the demo loop's scenario leg is mouse-only to enter.**
   `<a class="nav-item" data-route="/pc/scenarios">Guided Scenarios</a>`
   (`index.html:125`) has no `href`, so it is not in the tab order and cannot be
   activated with Enter or Space. 49 nav items share this shape. The ticket lab
   **inside** the scenario is fully keyboard-operable — every step of
   `aplus-dns-01` completes by Tab/Space/Enter, and the ticket resolves — so the
   defect is shell navigation, not the scenario. The harness reaches the lab by
   hash to prove that distinction; a fix means giving the nav items an `href`,
   which changes shell behaviour app-wide and belongs to its own row.

**Observation (not a failure):** focus after reset lands on
`<BUTTON#demo-reset>`; the view is re-rendered via `replaceChild` and nothing
restores focus, so a keyboard user resumes from the top of the tab order. TM-48
asks for "focus predictable after reset" — focus is on a live node (not
stranded/detached, which the harness does fail on), but it is not restored to a
meaningful place. Handed forward as a judgement call for the fix row.

## Fixture runner

`tests/gates/run_rehearsal_fixtures.sh` — the live tree is expected to **fail**,
so "live must pass" cannot be the assertion. What it proves is that the harness
still discriminates:

- **Failing fixture:** a throwaway copy with the practice answer option rendered
  as a non-focusable `<div>` instead of a `<button>` must FAIL, and the failure
  must **name the option row**. That leg passes on the unmodified copy, so this
  proves the Tab-reachability check detects a de-tabbed control rather than
  failing for an unrelated reason.
- **Passing fixture:** the same artifact unmodified, scoped via
  `REHEARSAL_FLOWS=1,2,3,4,7` to the legs that are green today, must PASS.
  Without this, a harness that could only ever observe failure would look like
  proof.
- **Live assertion:** the repository Web tree must FAIL the full run with
  **exactly** the two recorded gaps — both the `REQ-UI-04 gap` and
  `REQ-DEMO-05 gap` markers present, so a third, new regression cannot hide
  behind the two known ones.

All three legs PASS on this host (`bash tests/gates/run_rehearsal_fixtures.sh`
→ exit 0).

## Why this runner is not wired into CI

The sibling browser gate, `run_smoke_fixtures.sh`, runs in `pwa-deploy.yml` on
the hosted runner. This runner deliberately does **not**, and the reason is not
the browser: it is that its live assertion expects the artifact to be *red*.
Wired into the deploy path it would mean a deploy job that asserts the app has
two keyboard defects — and, perversely, that **closing either gap turns the
deploy red** until someone also edits the runner. A gate that penalises the fix
is worse than no gate.

So it ships as a rehearsal and evidence tool: run it before a rehearsal, and
read its findings. It still satisfies the fixture-pair discipline — the failing
and passing fixtures above are the proof that it can tell the difference — and
the two gaps stay visible in the S47-10 record and in this file rather than
being hidden behind a green check.

- **The actual demo host.** PKG:1469 leaves the machine undecided, and this host
  (`cachyos-plasma`) is not the fleet runner. Install → boot → full loop with
  the network unplugged has **not** been run on any demo host.
- **Projector-distance readability.** Not measured. This host has no projector;
  the harness measures reachability, not rendered legibility at distance.
- **Keyboard-only walkthrough on a physical keyboard.** The harness dispatches
  CDP key events through a headless browser. That exercises the real focus and
  activation paths, but it is not a human at a keyboard on the demo machine.
- **Reset-between-groups with reseed verification, in a live room.** The
  mechanism is verified by keyboard here (reseed count + outcome render, learner
  keys cleared); "between groups" — twice in a row, on the demo host, at the
  podium — is not.
- **TM-50 entries for PWA-on-ChromeOS and PWA-on-presenter-host.** No ChromeOS
  device and no presenter host were available. No evidence recorded.
- **Offline behaviour.** The harness serves from a loopback static server; it
  does not unplug the network or exercise the service worker's offline path.

## Environment

```
browser: /usr/bin/google-chrome-stable
serving /mnt/data/git/radicaltrainingplatform/RadicalTrainingPlatform.Web
zero npm dependencies — Node's global WebSocket speaks CDP directly
```

Chrome's stderr carries GCM registration noise
(`PHONE_REGISTRATION_ERROR`) that is unrelated to the app; the harness fails on
app console errors, uncaught exceptions, and failed requests, all of which were
zero.
