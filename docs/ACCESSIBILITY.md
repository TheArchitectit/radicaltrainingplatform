# Accessibility

**What this platform measures about its own accessibility, what it fixed, and what it
still does not know.**

Last measured: **2026-10-14**, against the Web PWA at the commit this document ships
with.

---

## Read this first: there is no conformance claim here

This document does **not** say the platform conforms to WCAG 2.1 level AA. It says
something narrower and checkable: *a specific set of automated checks passes on every
route of the Web PWA, in both themes, and here is exactly which checks those are.*

The sprint this work came from (Sprints 35-36) asked for "Document accessibility
compliance (VPAT)". That deliverable was **not** produced, deliberately. A VPAT is a
conformance statement — it tells a reader, usually a procurement office, what a product
conforms to. Issuing one requires either a third-party audit or a self-assessment by
someone accountable for the claim. Neither happened:

- **No third-party audit.** No external auditor was engaged.
- **No assistive technology was run.** No screen reader (NVDA, JAWS, VoiceOver, Orca),
  no switch access, no voice control. The gate reads the DOM and the computed styles a
  screen reader reads *from*; it does not run one.
- **No human has read the pages.** The audit is an engine, not a person.

An automated sweep is evidence, not conformance. Publishing a VPAT on this evidence
would overstate what is known, and an overstated accessibility claim is worse than no
claim — it is one a disabled user could rely on and be failed by.

So the deliverable was replaced with this: a report of measured facts, a gate that keeps
them true, and an explicit list of the gaps.

---

## What is measured

`tests/e2e/a11y-web.mjs` — a zero-dependency Node script that serves the Web PWA over a
loopback static server, drives headless Chrome over the DevTools Protocol, opens every
registered route, and audits the live DOM.

**Coverage:** 54 routes × 2 themes = **108 audits per run**. The route list is read out of
`js/app.js`'s `router.register(...)` calls rather than hand-written, and the gate **fails**
if it cannot parse a registration or has no concrete instance for a parameterized route.
A separate tripwire fails the run if fewer routes rendered than it was given — this exists
because a sweep that silently audited 20 of 54 routes once reported itself as complete.

### The checks, and the criterion each one stands for

| Check | WCAG 2.1 | What it catches |
|---|---|---|
| `html-lang` | 3.1.1 | `<html>` with no `lang` |
| `contrast` | 1.4.3 | Text below 4.5:1 (3:1 for large text) |
| `control-name` | 4.1.2 | A button or link with no accessible name |
| `input-placeholder-only` | 3.3.2 | An input named only by its placeholder |
| `link-in-text-block` | 1.4.1 | A prose link distinguished by colour alone |
| `img-alt` | 1.1.1 | An `<img>` with no `alt` |
| `landmark-main`, `landmark-named` | 1.3.1, 2.4.1 | No `<main>`, or repeated landmarks with no name |
| `page-has-heading-one`, `heading-order` | 1.3.1, 2.4.6 | No `<h1>`, or a skipped heading level |
| `skip-link` | 2.4.1 | No bypass mechanism |
| `live-region` | 4.1.3 | A status container that is not announced |
| `focus-visible` | 2.4.7 | A control with no visible focus indicator |
| Dialog semantics, focus move, Tab trap, Escape, focus restore | 2.4.3, 4.1.2 | A modal keyboard users cannot operate or escape |
| `aria-expanded` / `aria-pressed` tracking | 4.1.2 | A control that never reports its own state |
| Error toast is `role="alert"` | 4.1.3 | A failure announced no differently from a success |

**That is 12 of WCAG 2.1's 50 level A and AA success criteria.** The other 38 have no
check here — most of them because no automated tool can honestly check them.

### The checks that exist because the gate was wrong once

Some of the above are not features, they are repairs, and they are the reason the gate
has fixtures for itself:

- **The closed-overlay check called an inert overlay "still reachable".** The check was
  wrong when first written; fixture Q exists to keep it honest.
- **The sweep silently audited a fraction of its route list.** `/pc/api` intermittently
  timed out mid-sweep, the throw escaped the per-route loop, and the summary still read
  as a completed sweep. Fixed with a per-route retry, a render check, and the coverage
  tripwire.
- **The contrast check over-reported**, counting pictographic-only runs and text over
  gradients as measurable. Narrowed to elements that directly own a text node.
- **The headline under-reported.** It counted findings printed, not findings found, and
  the two differ by however many sit behind the per-rule cap — 925 of them on the
  pre-change tree. See [What was found and fixed](#what-was-found-and-fixed).

---

## What was found and fixed

The first widened sweep — all 54 routes, both themes, against the tree as it stood
before this work — found **2,020 findings**. The final sweep reports **none**.

That first number is worth a sentence, because getting it took fixing the gate. The run
printed 1,095, and 1,095 was also the headline it summarised with, because the summary
counted *printed* findings — capped at 6 per rule per route so one broken token cannot
bury the output under 400 identical lines. The other 925 were behind `+N more not shown`.
A gate that under-reports its own findings reads as a gate that found less than it did,
which is the same defect as the sweep that once covered 20 routes and called itself
complete. The true total is now counted separately from the printed total, and both are
reported.

Highlights of what was found:

### Shell semantics

- No `<h1>` anywhere, and a skipped heading level in the NCA and ticket labs (which
  render *inside* the scenarios view, so their titles were demoted to `<h2>`/`<h3>`
  rather than promoted).
- No skip link, no `<main>` landmark, two unnamed `<nav>` landmarks.
- Unnamed icon controls: the hamburger, context switcher, search, theme toggle, and
  every toast dismiss button.
- `#toast-container` was not a live region; error toasts were announced exactly like
  successes.
- The header search box and the CLI terminal input both suppressed the global
  `:focus-visible` ring — the only two controls in the app with no visible focus.

### The dark-on-dark header

`.header-bar` and `.pc-sidebar` painted `--text-inverse` on backgrounds that stay dark in
both themes. In the light theme that token flips to near-black, giving **1.05:1** —
effectively invisible text. Fixed with `--text-on-chrome` / `--text-on-chrome-muted` /
`--text-on-accent`, tokens that describe the *chrome* rather than the page.

### Contrast tokens

The failures were not scattered: they were six values reused as ink, over and over. A
saturated status colour is legible as a **fill** and not as **text**, and the codebase had
no way to say which it meant. The fix adds an explicit ink variant for each
(`--status-good-ink`, `--status-warning-ink`, `--status-critical-ink`) and keeps the bright
original for fills:

| Was | Ratio | Now |
|---|---|---|
| `--status-good` as ink | 2.66:1 | `--status-good-ink` |
| `--status-warning` as ink | 1.90:1 | `--status-warning-ink` |
| `--status-critical` as ink | 3.96:1 | `--status-critical-ink` |
| `--prism-blue` as ink | 2.69:1 | `--text-link` |
| `--text-secondary` | 4.495:1 | nudged to 4.5:1+ |
| `#565f89` in `CLITerminal.js` | 2.76:1 | lighter fixed grey |

Two sites resisted a uniform fix. **AWS/Azure/GCP provider badges** in
`ci-monitoring.js` carry fixed brand fills, and white clears AA on Azure's `#0078D4`
(4.53:1) but reaches only 2.14:1 on AWS orange — so the ink is chosen per brand rather
than the brand being darkened. And the **CLI terminal is dark in both themes**, so it
gets a fixed grey, not a theme token.

Fill sites were deliberately left alone: SVG `stroke`s, progress-bar `background`s, and
the `.toast.success/.warning/.error` left borders, where the saturated colour is correct.

### Theme handling

`ThemeToggle.js` had no `prefers-color-scheme` support at all. It now follows the OS when
no explicit choice is stored — and importantly does **not** write the OS preference into
storage on first load, which would freeze a one-time OS state into a permanent explicit
choice. It also reports `aria-pressed`.

---

## The gate can fail, and that is tested

Per SPEC-16 #4, a gate that cannot fail is itself a defect. `tests/gates/run_a11y_fixtures.sh`
runs **27 fixture cases producing 28 verdicts**: every failing fixture seeds exactly one
defect and must fail **and name it**, so no rule rests on another rule's failure. Three
passing fixtures cover the clean page, the clean shell, and the real repository tree.

The fixtures are not decoration — the dialog, overlay, theme and toast checks cannot be
driven against a plain HTML page, so without a stub shell to break they would have had no
way to fail at all.

---

## What is NOT measured — read this before citing the green run

- **Nothing outside the Web PWA.** The **Avalonia desktop client** and the **legacy
  WinForms** app have no automated accessibility coverage at all. Sprint 25 built
  AutomationPeers and focus indicators for the desktop client; nothing in this work
  re-measured them.
- **No screen reader, ever.** Every "name" here is computed from the accessibility tree.
  Whether a real screen reader announces it usefully is unverified.
- **Non-text contrast (1.4.11)** is not measured — component boundaries, focus rings
  against their surroundings, and graphical objects are unclassified.
- **Contrast over gradients, images and `backdrop-filter`** is approximated against the
  nearest solid ancestor colour. The app currently uses solid fills; a future gradient
  would need this check revisited.
- **Rendered type size and layout.** The gate reads computed colour and the accessibility
  tree. It does not read font metrics or geometry — so a change that breaks *presentation*
  while improving *semantics* passes it cleanly. This is not hypothetical: the heading
  promotions in this work raised several `<h3>`/`<h4>` to `<h2>` for heading order, and
  two of the rules that styled them were element-scoped (`.lesson-objectives h3`,
  `.explanation h4`). The promotion orphaned both rules and the headings silently fell
  back to browser defaults, reported by the audit as a clean pass. A third
  (`.page-title h1`) had never matched the bare `<h1 class="page-title">` form at all,
  leaving 7 of 33 page titles at the UA default — 26px where their siblings are 20px.
  All three were found by reading the CSS, not by the gate. All three are fixed.
- **Anything behind a click.** The sweep audits each route as it loads. A component that
  only exists after an interaction is never measured — and that is not a corner case: the
  shared `Wizard` component is reachable from ~25 views and the audit has never opened it.
  It was found to fail AA (white step-number digits at 2.66–2.70:1) only by reading the
  CSS. Fixed, but **not verified by the gate**, because the gate cannot reach it.
- **Keyboard operability of the NCA labs is unmeasured.** The gate drives the dialog, the
  hamburger overlay and the theme toggle by keyboard. It does not drive the lab
  simulators, the PE VM wizard flow, or the drag-based interactions.
- **No reflow, zoom, text-spacing, timing, motion, caption or target-size checks.**
  Criteria 1.2.x, 1.4.4, 1.4.10, 1.4.12, 2.2.x, 2.3.x, 2.5.5 and 2.5.8 have no check.
- **A green run is not a user experience.** Nothing here establishes that a disabled user
  can complete a study session. That needs people, not a script.

### Known residual defects

- **`Confirm.js` uses a fixed `id` for its dialog title.** Two confirmations open at once
  would produce duplicate ids and an ambiguous `aria-labelledby`. In practice the app only
  ever opens one; recorded rather than fixed.
- **The EntityTable `⋯` action button is fixed but unmeasured.** It was named `"⋯"`, which
  is a name to the accessibility-tree computation, so no automated check can catch it. It
  is now `aria-label="Actions for <row>"`. **This is fixed but NOT verified by the gate.**
- **`js/views/PlaceholderView.js` is dead code.** Not an accessibility defect; recorded
  because a dead module in a precached list is how such lists drift.

---

## Reproducing this

```bash
# the full audit — every route, both themes. Needs Chrome.
node tests/e2e/a11y-web.mjs

# the same, with the per-route log archived (the S35-01 evidence artifact)
A11Y_LOG_OUT=docs/qa/release-evidence/2026-10-14-a11y-audit.md node tests/e2e/a11y-web.mjs

# the gate proving it can fail, plus the real tree
bash tests/gates/run_a11y_fixtures.sh
```

Both legs run in CI: `tests/e2e/a11y-web.mjs` and `tests/gates/run_a11y_fixtures.sh` are
in `tests/gates/run_freeze_chain.sh`, and the browser legs run in `pwa-deploy.yml` (the
`build-linux` job runs on a fleet runner with no browser).

---

## If you need a conformance claim

Then this work is the *input* to it, not the output. What a VPAT would additionally
require: a human auditor, at least one real assistive technology pass per platform, and a
decision about which platforms are in scope (Web only, or Desktop and Legacy too). None
of that has been done, and this document deliberately does not pretend otherwise.
