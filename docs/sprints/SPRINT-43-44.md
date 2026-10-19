# Sprints 43-44: Item Hygiene (rescoped from "Psychometric Analysis")

**Phase:** Enterprise  
**Duration:** Weeks 85-88 (4 weeks)  
**Goal (as written in June 2026):** Validate question quality with psychometric analysis, difficulty calibration, and readiness-score certification.  
**Goal (as executed):** Check, offline and deterministically, that every item reaching the PWA can be graded and shuffled — nothing that depends on user performance data or any server.

**Status:** 🟢 Landed at `d747676` — `scripts/check-item-hygiene.py`, `tests/gates/run_item_hygiene_fixtures.sh`, the `OptionShuffle.js` boundary fix, and the freeze-chain/CI wiring. Freeze chain **64/64** at `d747676`, `--expect-sha` matching.

> **This sprint was rescoped by the owner on 2026-10-18.** The instruction was *"Rescope all three"*. The constraints stated the same day were: *"this is supposed to run as a local client on your device not need a hosting solution"* and *"the idea of this is they can just check the project out from github."* The delivery model is a clone and a local run — not a hosted multi-tenant service.
>
> Every June deliverable here assumes a population of users producing response data. The cut register below records each one; the original plan is preserved verbatim underneath it.

---

## Why this sprint does not build psychometrics

IRT, difficulty calibration, confidence intervals, discrimination metrics, and a "certified" badge all take their inputs from *user performance* — answers given by real learners at scale. This platform collects nothing from anyone and sends nothing anywhere (locked decision: no accounts, no sync, no telemetry). REQ-BRAND-02 and `CompletionPanel.FORBIDDEN_CLAIM_STRINGS` additionally forbid "certified"-style claims in the UI. A local client genuinely has no population to measure, and this sprint does not pretend otherwise.

What remains is the part of item review that needs no users at all — defects visible in the item text itself — checked against the banks whose items the compiler actually ships:

* duplicate option text — two choices that cannot be told apart
* "all/none of the above" — position-dependent wording
* letter-referencing stems/options — "which option B" cannot shuffle
* a missing or impossible key — the item is unanswerable or ungradeable
* answer-position concentration — one letter dominating a bank large enough to audit (blocks at ≥20 single-answer keys; below that one key moves the share by 5–20 points, so it is reported, not failed)

Two signals are advisory and never fail: the "longest option is correct" cue (a statistical smell, not a deterministic rule), and the legacy root-level banks (NCP/NCM/NCA Part files), which are in review and not shipped.

The checker mirrors `OptionShuffle.POSITIONAL_PATTERNS` exactly, so the gate that decides whether shuffling is safe and the gate that measures item text use the same definition.

## Cut register

Per SPEC-11 11.1, scope is cut visibly. Nothing here is silently dropped.

| ID | As written | Disposition |
|---|---|---|
| S43-01 | Implement Item Response Theory (IRT) basic model | **Cut** — needs response data from a population this client never collects |
| S43-02 | Calibrate question difficulty from user performance data | **Cut** — no telemetry, no user base, no server to receive answers |
| S43-03 | Implement confidence intervals on readiness scores | **Cut** — a readiness score has no interval without response data |
| S43-04 | Add question discrimination metrics | **Cut** — discrimination needs a population's item-level results |
| S43-05 | Create vendor validation program framework | **Cut** — vendor validation is a server-side product-track question |
| S43-06 | Add "certified" readiness badge | **Cut** — forbidden by REQ-BRAND-02 and `FORBIDDEN_CLAIM_STRINGS` |
| S43-07 | Implement longitudinal tracking for calibration | **Cut** — needs stored per-user history; none exists by design |
| S43-08 | Document psychometric methodology | **Replaced** — `docs/ITEM-HYGIENE.md` documents what this pair actually does |

## What was actually built

### 1. `scripts/check-item-hygiene.py`

A deterministic offline gate over `RELEASED_BANKS` from `scripts/generate-study-content.py`, using the 40% `CONCENTRATION_THRESHOLD` from `scripts/report-key-distribution.py`. Blocking checks: duplicate option text, positional wording (`all/none of the above`, letter references, "letter and letter"), missing key, impossible key. Concentration blocks only at ≥20 single-answer keys; below that, advisory. Legacy root banks measured but never fail. The longest-option-is-correct cue is advisory.

Usage: `python3 scripts/check-item-hygiene.py` | `--root <tree>` | `--self-test`. Exit 0 pass / 1 blocking finding / 2 self-test failure.

### 2. `tests/gates/run_item_hygiene_fixtures.sh`

A failing+passing pair per defect class (duplicate text, all-of-the-above, letter-referencing stem, impossible key, missing key, 20-item all-A concentration, deleted bank, empty tree), plus the repo tree, a clean sandbox copy, and the checker's own self-test (7 seeded defects). Duplicates SPEC-16's "every gate ships with a failing fixture and a passing fixture."

### 3. `RadicalTrainingPlatform.Web/js/core/OptionShuffle.js` — boundary fix

The "letter and letter" positional pattern had no word boundary after its first `[A-F]`, so under `/i` the "f" of "for" and the "c" of "core" matched it: items whose stem says *"for a development team"* were silently refused a shuffle. Fixed to `/\b[A-F]\b\s*(?:,\s*(?:and\s+)?|&|\band\b|\bor\b)\s*[A-F]\b/i`. The Python gate mirrors it exactly.

### 4. `tests/gates/web/option-shuffle.mjs`

Added vectors: prose stems containing "for a …", "core …", "DORA" must shuffle; "A and D", "B or C", "C, and D" must refuse.

### 5. Freeze chain and CI wiring

`tests/gates/run_freeze_chain.sh` (61 → 64 gates) and `.github/workflows/build.yml` now run the checker, its self-test, and its fixture runner.

## Execution record

### Verification

- `python3 scripts/check-item-hygiene.py` — PASS, 10 released banks, 189 items.
- `python3 scripts/check-item-hygiene.py --self-test` — PASS, 7 seeded defects caught.
- `bash tests/gates/run_item_hygiene_fixtures.sh` — PASS, all 11 cases.
- `node tests/gates/web/option-shuffle.mjs` — PASS, including the new prose/refusal vectors.
- Freeze chain **64/64** at `d747676`, `--expect-sha` matching.

### What was not touched

No content file, manifest, or bank was edited. No exam, track, or `study-content.js` changed. No .NET project changed. RedEye posture and `draft-preview` labels unchanged.

### What this work did NOT establish

- **No IRT, no Rasch model, no difficulty calibration, no discrimination metrics, no confidence intervals** — none is measurable offline.
- **No "certified" badge** — explicitly forbidden.
- **No vendor validation program** — server-side product-track work.
- **No telemetry, no accounts, no sync** — all cut by the same owner decision.
- **The legacy banks are measured, not fixed.** 22 root banks over the 40% threshold remain unreleased, exactly as before.

---

## Original June 2026 plan (preserved verbatim, not executed)

### Summary

Validate question quality with psychometric analysis, difficulty calibration, and readiness-score certification. Add question difficulty calibration and vendor validation.

### Key Deliverables

| ID | Deliverable | Points |
|---|---|---|
| S43-01 | Implement Item Response Theory (IRT) basic model | 4 |
| S43-02 | Calibrate question difficulty from user performance data | 3 |
| S43-03 | Implement confidence intervals on readiness scores | 3 |
| S43-04 | Add question discrimination metrics | 3 |
| S43-05 | Create vendor validation program framework | 2 |
| S43-06 | Add "certified" readiness badge (statistically validated) | 2 |
| S43-07 | Implement longitudinal tracking for calibration | 2 |
| S43-08 | Document psychometric methodology | 2 |

**Total:** ~21 points over 2 sprints

### Key Decisions

- **IRT model:** 1-parameter (Rasch) or 2-parameter logistic; start with Rasch for simplicity
- **Difficulty calibration:** Based on % correct across all users; recalculated monthly
- **Readiness certification:** Score >= 85% with confidence interval 95% -> "Certified Ready"
- **Vendor validation:** Framework for exam vendors to certify our question pools match their blueprints
- **Data privacy:** Aggregate statistics only; no individual data shared with vendors

### Dependencies

- S18-04 (readiness score model from Phase 3)
- S9-03 (per-question performance data for calibration)
- Phase 3 stable (large enough user base for meaningful statistics)

### Risks

| Risk | Mitigation |
|---|---|
| Psychometric expertise is specialized | Partner with psychometrician; use established libraries |
| Insufficient user data for reliable calibration | Defer to Phase 4 end; start with heuristic difficulty |
| Vendors unwilling to validate | Offer free data in exchange for endorsement |
| Calibration changes question ordering dramatically | Phase in gradually; A/B test impact on learning |

### Definition of Done (Phase 4)

- [ ] At least 3 non-Nutanix exam vendors loadable via plugin
- [ ] Cloud API supports 1,000+ concurrent users with <100ms p99 latency
- [ ] WCAG 2.1 AA audit passes with zero critical findings
- [ ] Enterprise customers can self-host or use SaaS with LMS integration
- [ ] v2.0 tagged and released

These Phase-4-level deliverables stand on the account/server/cloud product this repo explicitly is not (no accounts by design, no server by design, no hosting requirement). They are carried forward unchanged in the plan table; nothing here delivers them, and nothing here claims to.
