# Sprints 35-36: WCAG 2.1 AA Accessibility

**Phase:** Enterprise  
**Duration:** Weeks 69-72 (4 weeks)  
**Goal (as written in June 2026):** Achieve WCAG 2.1 AA compliance across all platforms.  
**Goal (as executed):** Measure the Web PWA's accessibility honestly, repair what the
measurement found, and hold it with a gate that can fail.

**Status:** 🟢 Landed — the first accessibility measurement of the Web PWA, 2,020 findings
repaired to zero across 54 routes in both themes, and a gate with 27 fixtures holding it.

> **S35-08 was rescoped before it was written.** The June plan asked for "Document
> accessibility compliance (VPAT)". No VPAT was produced, because no audit was performed
> that could support one. The reasoning is below; the deliverable was replaced with
> [docs/ACCESSIBILITY.md](../ACCESSIBILITY.md).

---

## Why there is no VPAT, and no conformance claim

A VPAT is a conformance statement. Issuing one requires either a third-party audit or a
self-assessment by someone accountable for the claim. Neither happened here:

- **No external auditor was engaged.** The June plan's "External auditor preferred" was
  not actioned.
- **No assistive technology was run.** No screen reader, no switch access, no voice
  control — on any platform.
- **No human has read the pages.** The audit is an engine, not a person.

What *was* done is a programmatic audit of the Web PWA against the subset of WCAG 2.1 AA
that a program can honestly check, and a repair of everything it found. That is real
evidence. It is not conformance, and publishing a VPAT on it would overstate what is
known — which matters more here than elsewhere, because an overstated accessibility claim
is one a disabled user could rely on and be failed by.

So S35-08's deliverable is [docs/ACCESSIBILITY.md](../ACCESSIBILITY.md): measured facts, a
gate that keeps them true, and an explicit list of what is still unmeasured. It states in
its first section that it makes no conformance claim.

### Two more corrections to the June plan

- **"Across all platforms" is not what was delivered.** The audit covers the **Web PWA**,
  because that is what the October demo runs. The Avalonia desktop client and the legacy
  WinForms app have **no automated accessibility coverage at all** — Sprint 25 built
  AutomationPeers and focus indicators for the desktop client, and this work did not
  re-measure them. Claiming three platforms would be false.
- **"Certification-ready compliance" is not a thing that was produced.** There is no
  certification, no certificate, and no readiness assessment.

---

## Deliverable register

Per SPEC-11 11.1, scope is cut **visibly**. Nothing here is silently dropped.

| ID | As written | Disposition |
|---|---|---|
| S35-01 | Commission or perform WCAG 2.1 AA audit | **Performed in-house** — an automated audit of the Web PWA. No third party. |
| S35-02 | Fix all critical findings (screen reader, keyboard) | **Executed** — shell semantics, names, landmarks, heading order, skip link, live regions, focus indicators |
| S35-03 | Fix high findings (colour contrast, focus management) | **Executed** — 2,020 findings to zero; new ink tokens; dialog focus management |
| S35-04 | Add high-contrast light theme | **Executed** — the light theme now meets AA on every route |
| S35-05 | Implement system-theme detection | **Executed** — `prefers-color-scheme`, with an explicit choice winning |
| S35-06 | Add focus trapping in dialogs and modals | **Executed** — Tab trap, Escape, focus restore to the opener |
| S35-07 | Add skip links and landmark regions | **Executed** — skip link, `<main>`, named landmarks, inert closed overlay |
| S35-08 | Document accessibility compliance (VPAT) | **Replaced** — a measured-facts report with no conformance claim. See above. |

---

## What was actually built

### 1. The first measurement

Nothing in the repository had ever measured the PWA's accessibility. Sprint 25 built the
foundation for the **desktop Avalonia client**; the Web PWA — the thing the October demo
actually runs — was never audited at all.

`tests/e2e/a11y-web.mjs` serves the Web PWA over a loopback static server, drives headless
Chrome over the DevTools Protocol, opens **every registered route** in **both themes**,
and audits the live DOM. Zero npm dependencies on purpose: the repo has no
`package.json`, and a gate that needs an install step is a gate that gets skipped.

The route list is read out of `js/app.js`'s `router.register(...)` calls rather than
hand-written, and the gate **fails** if it cannot parse a registration or has no concrete
instance for a parameterized route. A separate tripwire fails the run if fewer routes
rendered than it was given.

It checks 12 of WCAG 2.1's 50 level A and AA success criteria: 1.1.1, 1.3.1, 1.4.1,
1.4.3, 2.4.1, 2.4.3, 2.4.6, 2.4.7, 3.1.1, 3.3.2, 4.1.2, 4.1.3. The other 38 have no check
— most because no automated tool can honestly check them.

### 2. What the measurement found: 2,020 findings

Against the tree as it stood before this work, all 54 routes, both themes.

**The shell had no `<h1>`, no skip link, no `<main>`, two unnamed `<nav>` landmarks,
unnamed icon buttons, a toast container that was not a live region, a modal with no dialog
semantics or focus management, no `prefers-color-scheme` support, and a header painted
dark-on-dark at 1.05:1.**

The header was the worst of it. `.header-bar` and `.pc-sidebar` use `--text-inverse`, a
token the dark theme flips — on backgrounds that stay dark in *both* themes. In the light
theme that token goes near-black on near-black: effectively invisible text. Fixed with
`--text-on-chrome` / `--text-on-chrome-muted` / `--text-on-accent`, tokens that describe
the *chrome* rather than the page.

The contrast failures were not scattered, they were eight values reused as ink. A
saturated status colour is legible as a **fill** and not as **text**, and the codebase had
no way to say which it meant:

| Was | Ratio | Now |
|---|---|---|
| `--status-good` as ink | 2.66:1 | `--status-good-ink` |
| `--status-warning` as ink | 1.90:1 | `--status-warning-ink` |
| `--status-critical` as ink | 3.96:1 | `--status-critical-ink` |
| `--prism-blue` as ink | 2.69:1 | `--text-link` |
| `--text-secondary` | 4.495:1 | nudged past 4.5:1 |
| `#565f89` in `CLITerminal.js` | 2.76:1 | lighter fixed grey |

Two sites resisted a uniform fix. **AWS/Azure/GCP provider badges** carry fixed brand
fills, and white clears AA on Azure's `#0078D4` (4.53:1) but reaches only 2.14:1 on AWS
orange — so the ink is chosen per brand rather than the brand being darkened. And the
**CLI terminal is dark in both themes**, so it gets a fixed grey rather than a theme token.
Fill sites were deliberately left alone: SVG `stroke`s, progress-bar `background`s, and
the `.toast.*` left borders, where the saturated colour is correct.

### 3. Three defects found in the gate itself

Each is now a fixture, because a gate that cannot fail is not a gate (SPEC-16 #4):

- **The closed-overlay check called an inert overlay "still reachable".** The check was
  wrong when first written. Fixture Q exists to keep it honest.
- **The sweep silently audited a fraction of its route list.** `/pc/api` intermittently
  timed out mid-sweep, the throw escaped the per-route loop into the outer catch, and the
  summary still read as a completed sweep — 34 of 54 routes went unmeasured. Fixed with a
  per-route retry, a render check, and the coverage tripwire.
- **The headline under-reported its own findings.** It counted findings *printed* (capped
  at 6 per rule per route so one broken token cannot bury the output) rather than findings
  *found* — reporting 1,095 for a tree that had 2,020. A gate that under-reports its own
  findings reads as a gate that found less than it did, which is the same defect as the
  sweep that covered 20 routes and called itself complete. Both totals are now reported.

### 4. A gate that can fail, and is tested

`tests/gates/run_a11y_fixtures.sh` — **27 cases, 28 verdicts**. Every failing fixture seeds
exactly one defect and must fail **and name it**, so no rule rests on another rule's
failure. Three passing fixtures cover the clean page, the clean shell, and the real
repository tree.

The fixtures are load-bearing, not decoration: the dialog, overlay, theme and toast checks
cannot be driven against a plain HTML page, so without a stub shell to break they would
have had no way to fail at all.

---

## Execution record

### Verification

- **Freeze chain 59/59 at `ab200dc`**, `--expect-sha` matching. The chain grew 57 → 59:
  the accessibility gate and its fixture runner. Chain growth is stated as growth, not
  regression.
- `node tests/e2e/a11y-web.mjs` — **PASS**, 54 routes × 2 themes = 108 audits, zero
  findings, zero console errors. The per-route log is archived at
  [docs/qa/release-evidence/2026-10-14-a11y-audit.md](../qa/release-evidence/2026-10-14-a11y-audit.md).
- `bash tests/gates/run_a11y_fixtures.sh` — **28/28 verdicts PASS**, including the real
  repository tree.
- The pre-change baseline was measured by running the fixed gate against `HEAD`'s Web tree
  out of `git archive`: **2,020 findings**, now zero.
- The gate is wired into `tests/gates/run_freeze_chain.sh` and, for the browser legs,
  `pwa-deploy.yml` — the `build-linux` job runs on a fleet runner with no browser.

### What was not touched

No content file, manifest, provenance record, lesson, item, exam or track. The RedEye
posture and the `draft-preview` labels from Sprints 27-28 are unchanged. No project was
added to `RadicalTrainingPlatform.sln` / `.slnx`. No `.NET` code was modified — every
change is in `RadicalTrainingPlatform.Web/` and `tests/`.

### What this work did NOT establish

- **No conformance claim.** See the first section. 12 of 50 criteria are checked; the
  other 38 are not, and no assistive technology was run.
- **Nothing outside the Web PWA.** The Avalonia desktop client and the legacy WinForms app
  have no automated accessibility coverage.
- **No screen reader, ever.** Every "name" here is computed from the accessibility tree.
  Whether a screen reader announces it usefully is unverified.
- **Keyboard operability of the labs is unmeasured.** The gate drives the dialog, the
  hamburger overlay and the theme toggle by keyboard. It does not drive the lab
  simulators, the PE VM wizard flow, or any drag-based interaction.
- **No reflow, zoom, text-spacing, timing, motion, caption or target-size checks.**
  Criteria 1.2.x, 1.4.4, 1.4.10, 1.4.12, 2.2.x, 2.3.x, 2.5.5 and 2.5.8 have no check.
- **A green run is not a user experience.** Nothing here establishes that a disabled user
  can complete a study session.

### Findings recorded rather than fixed

- **`Confirm.js` uses a fixed `id` for its dialog title.** Two confirmations open at once
  would produce duplicate ids and an ambiguous `aria-labelledby`. The app only ever opens
  one; recorded rather than fixed.
- **The EntityTable `⋯` action button is fixed but unmeasured.** It was named `"⋯"`, which
  *is* a name to the accessibility-tree computation, so no automated check can catch it.
  It is now `aria-label="Actions for <row>"`. **Fixed, but NOT verified by the gate** —
  reported as unmeasured rather than claimed as done.

---

## Original June 2026 plan (preserved verbatim, not executed)

### Summary

Complete the accessibility work started in Sprint 25. Full audit, remediation, and
certification-ready compliance.

### Key Deliverables

| ID | Deliverable | Points |
|---|---|---|
| S35-01 | Commission or perform WCAG 2.1 AA audit | 3 |
| S35-02 | Fix all critical findings (screen reader, keyboard) | 4 |
| S35-03 | Fix high findings (color contrast, focus management) | 3 |
| S35-04 | Add high-contrast light theme | 3 |
| S35-05 | Implement system-theme detection | 2 |
| S35-06 | Add focus trapping in dialogs and modals | 2 |
| S35-07 | Add skip links and landmark regions | 1 |
| S35-08 | Document accessibility compliance (VPAT) | 2 |

**Total:** ~20 points over 2 sprints

### Key Decisions

- **Audit approach:** External auditor preferred; internal automated tools (Axe,
  Lighthouse) as supplement
- **Light theme:** High-contrast compliant; uses system accent colors
- **System-theme detection:** Follows OS dark/light mode preference; manual override
  available
- **Focus trapping:** Keyboard users cannot tab out of modals without explicit dismiss
- **VPAT:** Voluntary Product Accessibility Template documenting compliance level

### Dependencies

- S25-01 through S25-06 (accessibility foundation from Phase 3)
- Phase 3 stable (all UI features must exist before audit)

### Risks

| Risk | Mitigation |
|---|---|
| Avalonia accessibility gaps vs WPF | Contribute fixes upstream; document workarounds |
| Audit reveals structural issues requiring major rework | Start audit early in the 2-sprint window; buffer time for remediation |
| Light theme breaks synthwave brand identity | Design light theme that maintains brand while meeting contrast ratios |

**Note on the risks table:** the second row is the one that did not apply, and the third
is the one that did. No structural rework was needed — the defects were token-level and
semantic, not architectural. The light theme kept the synthwave palette and met AA by
introducing ink variants rather than by desaturating the brand.

**Note on the audit row:** "External auditor preferred" was not actioned, and the
substitute is named plainly rather than described as an audit. This is why the deliverable
is a measured-facts report and not a VPAT.
