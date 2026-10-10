# OpenSpec SPEC-12 — Test Matrix

**Source:** [OpenSpec package rtp-beginner-tracks-2026-10](../../drive-ingest-2026-10-10/RTP-Beginner-Tracks-Openspec-Change-Package-A-Network-NCA75-v2.md), SPEC-12
**Executed in:** [SPRINT-45](../SPRINT-45.md)..[SPRINT-48](../SPRINT-48.md) (rows distribute by task) · **Doc gate:** TM-75

## How to read this matrix

Every row names its requirement IDs, the test type (unit / integration / E2E / gate-fixture / manual), and the exact evidence archived at release. Gates ship with one failing and one passing fixture each. “Proposed command” labels mark test paths a task creates before the command appears in a gate — no gate references a command that does not yet run.

## TM-10 series — parser, catalog, manifests

| ID | Test | Type | Requirements |
|---|---|---|---|
| TM-11 | DeriveExamCode legacy 16 cases + truncation-documentation cases | unit | REQ-MAN-03 |
| TM-12 | Manifest catalog: IDs, precedence over filename, collision failure | unit | REQ-MAN-01/02/05 |
| TM-13 | Manifest blueprint overrides hardcoded; NCA current sections render | unit | REQ-MAN-04, REQ-NCA-05 |
| TM-14 | Answer grammar: comma / “and” / “&” separators normalize identically | unit | R-07 |
| TM-15 | Parse-vs-catalog count reconciliation fails on a dropped question | gate fixture | R-07 |
| TM-16 | Multi-select scoring fixtures incl. partial/incorrect selections | unit | L-06, REQ-UI-03 |
| TM-17 | Ordered-response fixtures: permutations, missing/duplicate/extra/empty/reversed/shuffled | unit | R-03 |
| TM-18 | Retry fixtures: first-attempt vs latest-attempt metrics, no inflation | unit | R-04 |

## TM-20 series — content and provenance

| ID | Test | Type | Requirements |
|---|---|---|---|
| TM-21 | Provenance completeness blocks release on missing fields | gate fixture | C-02, REQ-AP-01 |
| TM-22 | A+ allocations 8/14/15/7/16 and 17/17/14/12; cut = 24 items | gate | REQ-AP-01/02 |
| TM-23 | Network+ allocations 23/20/19/14/24; cut = 25 items, 5/domain | gate | REQ-NP-01/02 |
| TM-24 | remap.csv: exactly 140 rows, all IDs resolve, zero blank review states | gate | REQ-NCA-01 |
| TM-25 | NCA pilot = 40 reviewed items, 10/section, allocation labeled | gate | REQ-NCA-02 |
| TM-26 | Errata fixtures: Part1 Q35 = D, Part3 Q3 = A | unit | REQ-NCA-03, C-05 |
| TM-27 | Retired-phrase scan: “CVM SSH disabled by default” absent from released surfaces | gate | REQ-NCA-04, C-06 |
| TM-28 | Keyword-in-distractor does not count as objective coverage; inferred mappings excluded from release | unit + gate | R-08 |
| TM-29 | Answer-position distribution report; new packs under concentration threshold | gate | R-09 |
| TM-29a | Cross-track reuse record names both exam IDs; duplicate item IDs fail | gate | REQ-NP-03 |
| TM-29b | Beta logistics: no waiver code / beta scheduling call-to-action in current pack; vendor scheduling link + review date present | gate | C-07, REQ-NCA-04 |

## TM-30 series — study UI, persistence, branding

| ID | Test | Type | Requirements |
|---|---|---|---|
| TM-31 | Track picker: three cards, coverage labels, preview label, disclaimer snapshot | E2E | REQ-UI-01, REQ-BRAND-02, REQ-MAN-07 |
| TM-32 | Lesson reader renders objective IDs; planned modules labeled | E2E | REQ-UI-02 |
| TM-33 | Practice: study vs assessment hint/tutor visibility | E2E | REQ-UI-03, L-01 |
| TM-34 | Progress save/reload/restart; storage-denied honest error; corrupt-entry and quota fixtures | E2E | REQ-UI-04/05, L-02, R-23 |
| TM-35 | No identity fields anywhere in learner flows | E2E sweep | REQ-UI-08 |
| TM-36 | Brand check: forbidden strings/marks fail CI; disclaimer exact-string snapshot | gate | REQ-BRAND-01/02 |
| TM-37 | No pass-prediction strings on any score surface | snapshot | REQ-AP-03, R-09 |

## TM-40 series — demo mode and reset

| ID | Test | Type | Requirements |
|---|---|---|---|
| TM-41 | Demo seed: all 78+ objectives false on fresh seed | E2E sweep | REQ-SC-02, REQ-DEMO-02 |
| TM-42 | Wrong/partial sequence fails with named unmet condition | E2E | REQ-SC-04 |
| TM-43 | Intended sequence completes; replay log archived | E2E | REQ-SC-03 |
| TM-44 | One-click reset restores exact seed; dirty station to group-start | E2E | REQ-DEMO-03, REQ-UI-07 |
| TM-45 | Demo sweep: all 44 existing + 6 new scenarios boot/run/incomplete-then-complete; per-scenario report | E2E | REQ-DEMO-01/06, R-02 |
| TM-46 | Zero outbound requests during scenario runs; simulation label visible | E2E | REQ-SC-05, L-08 |
| TM-47 | Offline: installed PWA full loop with radio disabled; tutor unavailable state | E2E | REQ-UI-06, REQ-AI-05 |
| TM-49 | Service-worker update propagation: install PWA at build N, deploy build N+1, verify update reaches the installed client after reload cycle; stale-cache drill documented | real-browser E2E | RSK-16, REQ-UI-06 |
| TM-48 | Projector readability + keyboard-only pass on demo path; focus predictable after reset | manual + automated a11y | REQ-DEMO-05, L-09 |

## TM-50 series — cross-platform and packaging

| ID | Test | Type | Requirements |
|---|---|---|---|
| TM-51 | PWA boot + full loop on Chrome/Edge/Safari; ChromeOS device pass | E2E + manual | REQ-XPAT-01 |
| TM-52 | Desktop build + smoke on Windows, Linux, macOS | CI + manual | REQ-XPAT-02, CI-04 |
| TM-53 | Bridge parity: identical scenario traces, identical validator outcomes, PWA mock vs CefGlue | integration | R-11 |
| TM-54 | Clean-directory install test: known exam/count/question/errata/lesson load; missing content = honest error | integration | PKG-01 |
| TM-55 | AppImage: controlled-PATH regression (no appimagetool) produces working tarball; success path produces AppImage | script test | PKG-02 |
| TM-56 | macOS: output manifest records actual signing/notarization; bundle smoke on selected arch | manual/script | PKG-03 |
| TM-57 | Flatpak: real flatpak-builder run; launcher path verified; permissions reviewed | manual/script | PKG-04 |
| TM-58 | Supported-host matrix in release record; every “supported” cell cites evidence | doc gate | CI-04 |

## TM-60 series — tutor and AI safety

| ID | Test | Type | Requirements |
|---|---|---|---|
| TM-61 | Contract validation: out-of-contract fields rejected; no unsubmitted keys in context | unit | REQ-AI-01 |
| TM-62 | Corpus rights filtering: linking-only source excluded and named | unit | REQ-AI-02 |
| TM-63 | Citation validation: unknown cited ID degrades to insufficient-evidence | unit | REQ-AI-03 |
| TM-64 | Built artifact secret scan: no provider key | gate | REQ-AI-04 |
| TM-65 | Injection fixtures (6): retrieval text never executes as instruction | eval | REQ-AI-04/06, G-01 |
| TM-66 | Evaluation run: 12 answerable + 6 unsupported + 6 injection + offline/timeout/rate-limit; report archived | eval | REQ-AI-06 |
| TM-67 | Fallback: recorded-example label visible; zero network calls | E2E | REQ-AI-07 |

## TM-80 series — final-audit runtime findings

| ID | Test | Type | Requirements |
|---|---|---|---|
| TM-81 | Legacy identity collision detector: zero live collisions; seeded-collision fixture fails | gate | R-13 |
| TM-82 | Retry outcome sets: pass-then-fail and fail-then-pass both assert the defined outcome set | unit | R-14 |
| TM-83 | Study continuation across Stats/Blueprint navigation | E2E | R-15 |
| TM-84 | Reuse-after-dispose throws; manual native revisit prescribed and recorded | unit + manual | R-16 |
| TM-85 | Streak from attempt history under retries; Skip notifications on real skips only | unit | R-17 |
| TM-86 | PDF export per pack: canonical code, vendor-neutral footer, correct review date | integration | R-18 |
| TM-87 | Clean-install content independence incl. errata; no links to nonexistent releases | integration + doc gate | R-19 |
| TM-88 | Kill-during-write atomicity; corrupt-file quarantine + clean start; ID safety per platform | unit | R-20 |
| TM-89 | Navigation allowlist fixture (if embedded browser stays in demo path); review record exists | fixture + doc | R-21 |
| TM-90 | Web batch fixtures: this.root render, getById accessor, CLI resolved text, audit-log ordering, router serialization, poisoned-item isolation, scenario attempt/history, cosmetic snapshots | unit + E2E | R-22 |
| TM-91 | Storage recovery: corrupt entry, quota pressure, blocked storage — honest outcomes recorded | E2E | R-23 |
| TM-92 | ShellCheck gate + packaging script behavior fixtures (diagnostic-branch exit codes, icon paths) | gate | R-24 |
| TM-93 | RedEye lane: seeded wrong key + mapping error returned; edited item loses release; injection fixture flagged; lane-down = zero release | gate | REQ-REV-01..06 |

## TM-70 series — gates about gates

| ID | Test | Type | Requirements |
|---|---|---|---|
| TM-71 | vuln gate: High-advisory fixture FAILS exit 1; full fixture matrix from SPEC-10 10.1 | gate | CI-01 |
| TM-72 | Coverage threshold: below-threshold fixture fails | gate | CI-02 |
| TM-73 | Import check: reintroduced bad import fails; Pages predeploy smoke green on release build | gate | CI-03, R-01 |
| TM-74 | Scenario validator scan: constant-true fixture fails | gate | REQ-SC-01 |
| TM-75 | Every gate in this package lists its failing+passing fixture in the release evidence | doc gate | SPEC-10 |

## Requirement-to-test index

Every REQ- and R- identifier in SPEC-02 through SPEC-10 maps to at least one TM row: MAN→TM-11..13; UI→TM-31..37,44,47; BRAND→TM-31/36/37; DEMO→TM-41..48; AP→TM-22/37; NP→TM-23/29a; NCA→TM-24..27,29b; SC→TM-41..46,74; AI→TM-61..67; XPAT→TM-51..53; R-01→TM-73; R-02→TM-45; R-03→TM-17; R-04→TM-18; R-07→TM-14/15; R-08→TM-28; R-09→TM-29/37; CI/PKG→TM-54..58,71..73. The release record cites this index; an unmapped requirement fails the doc gate (TM-75).
