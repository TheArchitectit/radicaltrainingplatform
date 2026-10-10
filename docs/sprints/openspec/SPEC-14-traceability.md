# OpenSpec SPEC-14 — Traceability Matrix and Finding Register

**Source:** [OpenSpec package rtp-beginner-tracks-2026-10](../../drive-ingest-2026-10-10/RTP-Beginner-Tracks-Openspec-Change-Package-A-Network-NCA75-v2.md), SPEC-14
**Executed in:** [SPRINT-45](../SPRINT-45.md)..[SPRINT-48](../SPRINT-48.md) · **Test matrix:** [SPEC-12](SPEC-12-test-matrix.md) · **Task IDs:** T-01..T-46 mapped in [SPRINT-45..48](../SPRINT-PLAN.md)

## Register rule (owner directive)

Roger, October 10, 2026, verbatim: “And we have to address it all understand.” Every audit finding has an owner role, an implementing task, a test command and a passing condition. **Zero unowned rows.** A source-proven defect begins with a failing test; an unverified runtime concern begins with a prescribed environment and check; a correction is complete only when evidence shows the original failure no longer occurs. Rights/expert decisions get a concrete workflow and output record — never a “review later” label.

## 14.2 Audit finding register

| Finding | Summary | Owning requirement(s) | Task | Passing condition |
|---|---|---|---|---|
| C-01 | Catalog/runtime answer-syntax disagreement (“B and D” dropped) | R-07 | T-03 | TM-14/15 green; NCP-AI-Part4 full count |
| C-02 | Ordering graded unordered | R-03 | T-04 | TM-17 fixtures green; quarantine or approved conversion recorded |
| C-03 | Answer-position bias | R-09 | T-10, T-24 | TM-29 report + shuffle fixtures |
| C-04 | NCA beta map not current | REQ-NCA-01/05, REQ-MAN-04 | T-09, T-31, T-32 | TM-13/24/25 green |
| C-05 | Keyword coverage != curriculum coverage | R-08 | T-06 (mapping fields), T-31 | TM-28 green |
| C-06 | Corrected content contradicts cheatsheet | REQ-NCA-04 | T-34 | TM-27 scan green; canonical correction record propagates to cheatsheet/reference/tutor/export |
| C-07 | Beta-era logistics stale (waiver code, beta tips) | REQ-NCA-04 | T-34 | TM-29b green |
| C-08 | Content identity too narrow | REQ-MAN-01..06, D1 | T-06, T-07 | TM-12 green; semantic identity + revision in progress keys |
| C-09 | Content/source licensing unresolved | R-10, C-02/C-03 records | T-06 (rights fields), PDF inventory (T-31a) | LICENSE present; PDF inventory with hash/license record; transmission rights gate tutor corpus |
| C-10 | CompTIA AI posture | SPEC-00 00.3, REQ-BRAND, REQ-AI | T-21, T-23 | TM-36/61-67 green; disclaimer on all surfaces + demo script; REQ-BRAND-03 gated claims |
| CI-01 | Vuln gate fail-open | SPEC-10 10.1 | T-02 | TM-71: High fixture fails exit 1 |
| CI-02 | Coverage unenforced | SPEC-10 10.2 | T-18 | TM-72 green |
| CI-03 | Pages deploy without smoke | SPEC-10 10.3 | T-22 | TM-73 green |
| CI-04 | Platform claims untested | SPEC-10 10.4, REQ-XPAT | T-26 | TM-52/58 matrix shipped |
| PKG-01 | Source-tree content assumptions | SPEC-10 10.5 | T-25 | TM-54 green |
| PKG-02 | AppImage fallback dead code | SPEC-10 10.5 | T-25 | TM-55 green |
| PKG-03 | macOS label exceeds output | SPEC-10 10.5 | T-25 | TM-56 green |
| PKG-04 | Flatpak stale pin/wrong exec path | SPEC-10 10.5 | T-25 | TM-57 green |
| R-01 | PWA boot broken (pe-reports import) | SPEC-09 R-01 | T-01 | TM-73 + clean-browser boot |
| R-02 | 16/44 scenarios auto-pass; us-bucket-01 unpassable | SPEC-09 R-02, REQ-SC | T-14 | TM-45 all 50 scenarios |
| R-04 | Retry double-accounting | SPEC-09 R-04 | T-05 | TM-18 green |
| R-05 | Desktop bridge fake effects | SPEC-09 R-05 | T-15 | per-handler effect tests |
| R-06 | Persistence not wired | SPEC-09 R-06, REQ-UI-04/05 | T-12, T-15 | TM-34 green |
| R-10 | LICENSE missing | SPEC-09 R-10 | T-25a | file present; owner confirmation logged (HG-01) |
| R-11 | Simulator duplication | SPEC-09 R-11, D3 | T-15 | TM-53 + duplication gate |
| R-12 | Stale README/docs as current | SPEC-09 R-12 | T-25b | generated counts match; docs index shipped |
| Historical | Oct 1 audit claims superseded (persistence, errata, 49 views) | SPEC-00 00.2 | T-25b | README/index label old docs historical |

## 14.2b Final-audit runtime evidence register (Web and .NET chapters) — closed, not pending

| Finding | Summary | Owning requirement(s) | Task | Passing condition |
|---|---|---|---|---|
| NET-03 | Contradictory outcome sets on retry (not generic double-counting) | R-14 (policy: first/latest explicit, display latest) | T-37 | TM-82 both retry directions |
| NET-06 | Stats/Blueprint study-continuation loss | R-15 | T-38 | TM-83 |
| NET-07 | Cached disposed simulator reuse (source-proven; native revisit untested — boundary kept) | R-16 | T-39 | TM-84 + prescribed manual native check recorded as unexecuted-until-run |
| NET-08 | Current EXAM:number collisions in live identity scheme | R-13 | T-37 | TM-81 zero collisions + failing fixture |
| NET-09 | Sidebar streak / Skip notifications | R-17 | T-38 | TM-85 |
| NET-10 | Review PDF fails: display label used as canonical code | R-18 | T-40 | TM-86 per-pack export |
| NET-11 | Installed banks+errata source-independence; narrower Legacy bridge parity/error surface; truthful release-download availability | R-19 | T-41 | TM-87 |
| NET-12 | Atomic save / corrupt recovery / platform-safe IDs | R-20 | T-40 | TM-88 |
| CEF-01 | CefGlue NoSandbox=true hardening review (no exploit asserted) | R-21 | T-42 | TM-89 review record + allowlist fixture |
| WEB-01 | pc-insights and pe-capacity leave this.root unset | R-22 | T-43 | TM-90 render fixtures |
| WEB-02 | ci-networking calls nonexistent state.get (accessor is getById) | R-22 | T-43 | TM-90 accessor fixture |
| WEB-03 | CLI alert async Promise mismatch (resolves Promise, not text) | R-22 | T-43 | TM-90 resolved-text fixture |
| WEB-04 | Audit log persisted one write late | R-22 | T-43 | TM-90 ordering fixture |
| WEB-05 | Router overlapping-render source risk | R-22 | T-43 | TM-90 serialization fixture |
| WEB-06 | Whole-list initial-validator catch (one poisoned item blanks the list) | R-22 | T-43 | TM-90 isolation fixture |
| WEB-07 | Service-worker update lifecycle unverified (risk, not proven failure) | RSK-16 | T-26 | TM-49 real-browser update test |
| WEB-08 | Scenario attempt/reset/history gap | R-22 | T-43 | TM-90 + TM-44 |
| WEB-09 | Placeholder/breadcrumb cosmetics | R-22 | T-43 | TM-90 snapshots |
| WEB-10 | localStorage/IndexedDB recovery behavior (acceptance boundary, not a finding) | R-23 | T-44 | TM-91 recorded either way |
| PKG-05 | Missing-bracket runtime defect class: bash -n passes; conditional diagnostic may exit 0 | R-24 | T-45 | TM-92 ShellCheck + behavior fixtures |

**Zero unowned rows stands:** every finding above has requirement, task, test and passing condition. Any later audit addendum enters through the same five columns.

## 14.3 Plan v2 requirement inheritance

| Plan v2 ID | Inherited into |
|---|---|
| F-01 vendor-neutral IDs/contracts | SPEC-02 manifests; COMPTIA packs as the second-vendor proof |
| F-02 versioned manifests | REQ-MAN-01..07, D8 |
| F-03 one learning engine | REQ-UI-03 (Core-identical scoring), TM-16 |
| F-04 one simulator source | D3, R-11, TM-53 |
| F-05 provider-neutral AI gateway | SPEC-08 gateway shape |
| C-01..C-08 content gates | REQ-MAN-06, REQ-AP-01, R-08/R-09/R-10, SPEC-10 10.6; C-06’s human approval is superseded by the RedEye lane per the 12:25 directive and 12:27 standing-rule extension to all OpenSpecs (ASM-18) |
| L-01..L-10 learning requirements | REQ-UI-03/04/06, REQ-SC-05, TM-33/34/46/47/48 |
| A-01..A-08 AI features | SPEC-08 scope-limited slice; A-03/A-05..A-08 stay deferred per Plan v2 sequence |
| G-01..G-09 AI safety/cost | REQ-AI-01..07; full G-06 pilot scale (100/30/30) remains the public-release bar, not the demo bar |
| D-01..D-04 delivery rules | SPEC-11 rules, CI-02, release evidence |

## 14.4 Requirement-to-test index

See [SPEC-12](SPEC-12-test-matrix.md) § Requirement-to-test index. The release record cites that index; an unmapped requirement fails the doc gate (TM-75).
