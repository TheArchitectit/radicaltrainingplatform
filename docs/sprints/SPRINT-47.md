# Sprint 47: OpenSpec Sprints C+D — Demo Packs, Release Truth, Freeze and Rehearsal

**Phase:** 5 — Product-Track Enablement
**Source:** OpenSpec change package `rtp-beginner-tracks-2026-10` (docs/drive-ingest-2026-10-10), SPEC-11 Sprint C (Oct 17–19) + Sprint D (Oct 20–22)
**Duration:** Oct 17 – Oct 22, 2026
**Goal:** Complete the October 23 demo packs, make packaging/deploy claims honest, land the tutor slice (or its labeled fallback), then freeze and rehearse on the actual demo host.

**Reference package:** [OpenSpec package](../drive-ingest-2026-10-10/RTP-Beginner-Tracks-Openspec-Change-Package-A-Network-NCA75-v2.md) — requirements REQ-AP-02, REQ-NP-02, REQ-DEMO-01..06, REQ-AI-01..07, REQ-UI-06..08, CI-03, PKG-01..04, TM-40/TM-45/TM-50.

---

## Sprint Backlog — Part C (Oct 17–19)

| ID | Task | Requirements | Points | Status |
|---|---|---|---|---|
| S47-01 (T-19) | A+ cut complete: 24 reviewed items, 2 complete lessons | REQ-AP-02 | 3 | ✅ |
| S47-02 (T-20) | Network+ cut complete: 25 reviewed items, 2 complete lessons (five per domain) | REQ-NP-02 | 3 | ⚪ |
| S47-03 (T-21) | Demo mode: seed, one-click reset, mode label, ephemeral store | REQ-DEMO-01..06, REQ-UI-07/08 | 3 | ⚪ |
| S47-04 (T-22) | Pages predeploy gate (imports, smoke, bundle check) | CI-03 | 2 | ⚪ |
| S47-05 (T-23) | Tutor slice behind its gates, or recorded-example fallback | REQ-AI-01..07 | 3 | ⚪ |
| S47-06 (T-24) | Option shuffling with stable IDs | R-09 | 1 | ⚪ |
| S47-07 (T-25) | Packaging repairs PKG-01..04 + clean-install tests | SPEC-10 10.5 | 3 | ⚪ |
| S47-08 (T-41) | Installed-bundle content independence; Legacy bridge narrowing; release-link truth | R-19 | 2 | ⚪ |
| S47-09 (T-45) | ShellCheck gate + packaging behavior fixtures | R-24 | 1 | ⚪ |

## Sprint Backlog — Part D (Oct 20–22)

| ID | Task | Requirements | Points | Status |
|---|---|---|---|---|
| S47-10 (T-26) | Rehearsal on actual demo host: installed, offline, keyboard/projector, reset-between-groups | REQ-UI-06, REQ-DEMO-05, TM-40/45/50 | 2 | ⚪ |
| S47-11 (T-27) | Tutor evaluation report and go/no-go; fallback labeling check | REQ-AI-06/07 | 1 | ⚪ |
| S47-12 (T-28) | Screenshots/video backup; non-AI backup path | REQ-AI-07 | 1 | ⚪ |
| S47-13 (T-29) | Freeze: branch, base/head SHA, changed files, gate results, RedEye lane logs + seeded-defect self-test record, usable build | SPEC-11 11.7 | 1 | ⚪ |
| S47-14 (T-30) | Demo script final: 90-second loop (learn, try, ask, verify) + exact disclaimer + no-patient/no-business-system line | REQ-BRAND-02 | 1 | ⚪ |
| S47-15 (R-10) | LICENSE: prepare BSD-3-Clause decision record + README pointer; final file drop waits on owner confirmation (HG-01) | R-10, C-08/C-09 | 1 | ⚪ |

**Total:** 27 points. Sprint D explicitly excludes architecture migration and post-freeze content authoring.

---

## User Stories

### S47-01 (T-19): A+ Demo Cut
**As a** student at the October 23 demo, **I want** real A+ content to study, **so that** the learning loop demonstrates value.

**Acceptance Criteria:**
- [x] 24 reviewed items exactly: 16 Core 1 (A2/A5 — DNS purpose/symptom ×4, DHCP lease ×2, gateway role ×2, port recognition ×2, safe-test selection ×4, isolate-and-verify next-step ×2) + 8 Core 2 (B2/B4 — phishing signals ×3, ticket field/resolution-note ×3, change-control/backup ×2)
- [x] Two complete lessons: A2 “Networking basics”, B4 “Operational procedures” (synopses per SPEC-04 04.7)
- [x] Every cut item names lesson, objective ID, reviewer, provenance record; RedEye lane log present
- [x] Practice sets draw only from the 24 reviewed items and say so on screen
- [x] Remaining modules display as planned outlines; track shows “beginner preview”
- [x] ≥50% of pack items are diagnosis/next-action type (REQ-AP-06, CI-counted)

**Files:** `content/exams/COMPTIA-A-1201/`, `content/exams/COMPTIA-A-1202/`, `content/provenance/`

**Shipped (S47-01 notes):**

Cut map (24 items, type in provenance as the per-item front matter; bank markdown slices stay byte-stable so lane hashes hold):

| Bucket | Count | Items (A-1201 `core1-a2-fixtures.md` / A-1202 `core2-b2b4-fixtures.md`) | Type |
|---|---|---|---|
| DNS purpose/symptom | 4 | 1201 Q1, Q2, Q3, Q11 | 3 diagnosis, 1 recall |
| DHCP lease | 2 | 1201 Q5, Q6 | 1 diagnosis, 1 recall |
| Gateway role | 2 | 1201 Q7, Q8 | 1 diagnosis, 1 recall |
| Port recognition | 2 | 1201 Q4, Q12 | 2 recall |
| Safe-test selection | 4 | 1201 Q9, Q13, Q14, Q15 | 4 diagnosis |
| Isolate-and-verify next-step | 2 | 1201 Q10, Q16 | 2 diagnosis |
| Phishing signals (B2) | 3 | 1202 Q1–Q3 | 3 diagnosis |
| Ticket field / resolution note (B4) | 3 | 1202 Q4–Q6 | 2 diagnosis, 1 recall |
| Change-control / backup (B4) | 2 | 1202 Q7, Q8 | 2 diagnosis |

- **Diagnosis share:** 18/24 A+ = 75% (floor 50%). Pooled with the N+ draft bank: 22/29 = 76%. `scripts/check-item-types.py` counts `type: diagnosis` vs `type: recall` from provenance, fail-closed on untyped/unknown (never silently diagnosis).
- **Lessons released:** `a2.md` (Networking basics), `b4.md` (Operational procedures). Other modules stay `planned` outlines in `generate-study-content.py` / track overview. Track `previewLabel` is `beginner preview`.
- **Provenance:** `content/provenance/COMPTIA-A-1201/Q1..Q16.json`, `COMPTIA-A-1202/Q1..Q8.json` — each names `lesson`, `objectiveId`, `reviewer: redeye-lane`, `type`. `reviewDate` stays empty (no human source review has occurred; do not invent one).
- **RedEye lane:** logs under `content/review-logs/` for all 24 A+ items (plus the 5 N+ drafts), hashes bound to current item text + exam manifest + config. Verdicts are `return` / `modelStage: blocked` — the designed fail-closed state until radredeye key-vs-source integration. Ship-gate correctly excludes 100%; these are **draft** packs for the beginner preview, not released items.
- **Practice draw:** `practice.js` already filters `ITEMS` per exam and prints “draws only from reviewed items in this build.” Compiled `study-content.js` now carries 16 + 8 A+ items.
- **Manifest:** `COMPTIA-A-1202` `lessonIds` wire `b4` on 4.1–4.4/4.7 and `b2` on 2.5 (B2 stays a planned/partial module — no B2 lesson ships). `COMPTIA-A-1201` 2.1/2.2 now name `a2` so port/Wi-Fi coverage can compute honestly.
- **New gate:** `scripts/check-item-types.py` (+ `--self-test` failing/passing fixtures) wired in `build.yml` beside `generate-study-content.py --check` (drift gate).

**Not verified this row:** live Chromium walkthrough of the 24-item practice loop (S47-10 rehearsal owns demo-host evidence); human source review / `reviewDate`; radredeye model-stage verification (still blocked by design).

### S47-02 (T-20): Network+ Demo Cut
**Acceptance Criteria:**
- [ ] 25 reviewed items, five per domain (N1–N5 cut outline per SPEC-05 05.6), labeled “exploratory coverage” — explicitly not exam-weighted, on screen
- [ ] Two complete lessons: N5 troubleshooting, N1 networking concepts (synopses per SPEC-05 05.5)
- [ ] Cross-track reuse (A+ DNS/DHCP material) explicitly mapped per REQ-NP-03 — provenance names both exam IDs, no duplicate item IDs
- [ ] Declared gaps (subnetting drills, routing protocols, wireless design, packet analysis) render as labeled worked examples
- [ ] RedEye lane logs complete

**Files:** `content/exams/COMPTIA-NET-009/`, `content/provenance/`

### S47-03 (T-21): Demo Mode
**As a** presenter rotating student groups, **I want** seeded deterministic scenarios with one-tap reset, **so that** every group starts clean.

**Acceptance Criteria:**
- [ ] Each scenario declares a fixture seed; entering demo mode loads that seed exactly
- [ ] All 44 existing + 6 new scenarios boot, run, and correctly report incomplete-then-complete in demo mode (TM-45 sweep report names each scenario ID and result)
- [ ] One-click station reset clears `progress/` and `scenario/` keyspaces, reseeds all fixtures, verified by each validator’s negative path; confirmed via reseed verification pass
- [ ] “Demo mode” label on every screen; synthetic data only; zero outbound calls from simulator content; no identity collection anywhere
- [ ] Projector-readable, keyboard-operable, no hover-only affordances on the demo path
- [ ] Completion panel tells the truth: conditions met/unmet, requested vs actual, action trace; mastery/qualification/readiness claims are forbidden strings (snapshot-tested)
- [ ] Observation tasks require a recorded interpretation response — visiting without responding fails

**Files:** `Web/js/views/` (demo mode), `tests/e2e/demo-sweep.spec.js`

### S47-04 (T-22): Pages Predeploy Gate
**Acceptance Criteria:**
- [ ] `pwa-deploy.yml` gains predeploy steps in order: `check-imports.py`; headless-browser smoke (open built artifact, wait for known route, zero console errors, one meaningful interaction); content-bundle check (every manifest-referenced asset exists with matching hash; no unreviewed corpus ships)
- [ ] Gate proven to fail on a reintroduced bad import and on a missing pack asset
- [ ] October 23 build smoke log archived

**Files:** `.github/workflows/pwa-deploy.yml`, `scripts/check-imports.py`, content-bundle checker

### S47-05 (T-23): Tutor Slice
**As a** student, **I want** a hint from the tutor inside stated limits, **so that** I get unblocked without an exam oracle.

**Acceptance Criteria:**
- [ ] Restricted slice behind a backend gateway (browser never holds a provider key); input contract: learning questions only
- [ ] Rehearsed evaluation set: demo prompts (“The website works by IP address but not by name. Give me one hint, not the answer.”; “I can reach another device on my subnet, but nothing outside it. What should I check first, and why?”) resolve to the reviewed DNS/gateway lessons without operating the simulation
- [ ] Rehearsed refusal cases pass; corpus allowlist + citation validation active
- [ ] Fallback: labeled recorded example if go/no-go fails — prewritten output clearly labeled not-live
- [ ] Offline shows an explicit unavailable state
- [ ] Framed as general IT-skills coaching over original lessons — never vendor-endorsed exam prep

**Files:** `services/ai-gateway/`, Web tutor panel, evaluation harness

### S47-06 (T-24): Option Shuffling
**Acceptance Criteria:**
- [ ] Seeded option shuffle with stable item IDs; no scoring regression on multi-select

### S47-07 (T-25): Packaging Repairs
**Acceptance Criteria:**
- [ ] PKG-01: content bundle manifest (packs + metadata + hashes); clean-directory test loads known exam, count, question, errata correction, lesson; missing content dir = honest startup error
- [ ] PKG-02: AppImage build falls back to tarball when appimagetool absent; failure never prints “Build complete.”
- [ ] PKG-03: macOS script records actual signing/notarization results; universal claim requires universal2 build; macOS smoke launches the bundle
- [ ] PKG-04: Flatpak full SHA pin, complete sources, launcher path verified in a real flatpak-builder run, permission review
- [ ] Clean-install test per bundle; release-link text corrected to build-from-source until a release exists
- [ ] ShellCheck gate + packaging fixtures (S47-09)

**Files:** `packaging/linux/`, `packaging/macos/`, packaging scripts, `tests/`

### S47-08 (T-41): Bundle Independence and Bridge Narrowing
**Acceptance Criteria:**
- [ ] Installed bundle works with no repository parent (content independence)
- [ ] Legacy bridge surface narrowed; release links truthful

### S47-09 (T-45): ShellCheck + Packaging Fixtures
- ShellCheck gate in CI; packaging behavior fixtures for PKG-02/03 fallbacks

### S47-10 (T-26): Demo Host Rehearsal
**Acceptance Criteria:**
- [ ] On the actual demo host: install → boot → full loop (pick track, read lesson, practice, complete scenario, reset) with network unplugged except optional tutor call
- [ ] Keyboard-only walkthrough passes; projector-distance readability verified
- [ ] Reset-between-groups verified with reseed verification
- [ ] Critical flow matrix (TM-50) entries for PWA-on-ChromeOS and PWA-on-presenter-host verified with recorded evidence

### S47-11 (T-27): Tutor Go/No-Go
- Evaluation report from the rehearsed set; explicit go/no-go; fallback labeling verified if no-go

### S47-12 (T-28): Backup Evidence
- Screenshots/video captured; non-AI backup path rehearsed

### S47-13 (T-29): Freeze
**Acceptance Criteria:**
- [ ] Branch, base/head SHA, changed files, gate results with counts (“N/N at SHA”), RedEye lane logs + seeded-defect self-test record, usable build — all recorded
- [ ] No content edits after freeze; no architecture migration in Sprint D

### S47-14 (T-30): Demo Script
- 90-second loop script (learn, try, ask, verify) with the exact REQ-BRAND-02 disclaimer and the “no patient or business system is involved” line

### S47-15 (R-10): LICENSE Decision Record
**As an** owner, **I want** the missing LICENSE resolved honestly, **so that** README claims match reality.

**Acceptance Criteria:**
- [ ] Decision record + README pointer prepared in advance of the owner confirmation (HG-01 — the package's sole standing code-license gate)
- [ ] Final LICENSE file drop happens only after one-line owner confirmation of the BSD-3-Clause text
- [ ] Docs note distinguishes code license, original content, and third-party material (Plan v2 C-08); adding it does not license vendor manuals or question banks (C-09)

---

## Sprint Acceptance (October 23 demo-ready definition, SPEC-00 00.5)

A presenter can open the PWA on the demo host, pick track-aplus or track-netplus, read one complete lesson per exam, run a scored practice set of reviewed original items, complete a deterministic simulated help-desk task, ask the tutor for a hint inside its stated limits (or play the labeled recorded example), reset the station for the next group — all with the network cable unplugged except the optional tutor call. Coverage labeled “beginner preview”; no pass-prediction claim anywhere; every SPEC-08/10 gate green at the tested head including the vulnerability gate proven by a must-fail fixture. Release evidence records gate counts at the frozen head.
