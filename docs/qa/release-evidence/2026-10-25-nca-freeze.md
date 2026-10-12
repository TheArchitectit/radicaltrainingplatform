# Freeze record — T-36 / S48-06 (NCA 7.5, before California travel)

The freeze evidence pack for the NCA 7.5 current-blueprint track, per REQ-NCA-08
and SPEC-11 11.7: branch, base/head SHA, changed-file list, full gate output with
pass counts (N/N at SHA), test counts per suite, demo sweep, RedEye lane logs and
the seeded-defect self-test record, the usable build, and the known-unverified
list.

## The freeze

| | |
|---|---|
| branch | `feature/rtp-beginner-tracks` |
| base | `0a11c477a4a5df47077b21a31771aec83b59f4ef` (`main`, "docs: add OpenSpec index for RTP packages") |
| **head (frozen)** | `4a399fb5fd6c50d91df5d508141b7b52a0e985d4` |
| commits on branch | 73 |
| files changed | 387 (+40,174 / −959) |
| gates | **43/43 at `4a399fb`** |
| tests | Core 263/263 · Desktop smoke 51/51 |
| coverage | 92.07% (2091/2271 lines, threshold 70%) |
| recorded | 2026-10-11 |

Reproduce the gate total with:

```bash
bash tests/gates/run_freeze_chain.sh --log /tmp/freeze.log \
  --expect-sha 4a399fb5fd6c50d91df5d508141b7b52a0e985d4
```

`run_freeze_chain.sh` runs the same commands, in the same order, as
`.github/workflows/build.yml` and `pwa-deploy.yml`, prints one PASS/FAIL per
gate and an `N/N at <sha>` total, and refuses to report a total measured at a
different commit than the one named. A pasted transcript cannot be re-run; this
can.

**Freeze means no content edits afterward without a new head record.**

## The one criterion this freeze does not meet — read this first

**The departure cutoff is not confirmed from the trip itinerary.** REQ-NCA-08
requires the cutoff to be "confirmed from the trip itinerary before the
execution schedule is committed (ASM-09)". ASM-09 itself records the trip window
as **October 25–28** and the exact departure as **unverified**, and it forecasts
that T-36 adjusts.

No itinerary exists in this repository — `grep -rn "itinerary\|departure"` over
`docs/` returns only the package's own assumption rows and this sprint's own
criteria. I did not invent a cutoff, and I did not declare the freeze final on a
date I could not verify.

So what this record is: **a candidate freeze at a recorded head**, with every
checklist item below produced and reproducible. What it is not: a declaration
that the NCA cut is closed for travel. Until the itinerary is supplied, the
honest statement is *"the head is recorded; whether it is the last head before
departure is unknown."*

The row's second criterion — the SPEC-11 11.7 checklist — is met and is what the
rest of this document evidences. The row therefore stands 🟡, not ✅.

## Changed-file list by type

| type | files | | type | files |
|------|------:|-|------|------:|
| `.json` | 118 | | `.cs` | 48 |
| `.md` | 60 | | `.js` | 45 |
| `.mjs` | 41 | | `.py` | 24 |
| `.sh` | 22 | | `.png` | 12 |

Plus 7 `.csv`, 3 `.yml`, 1 `.xml`, 1 `.plist`, 1 `.html`, 1 `.css`,
1 `.csproj`, 1 `.axaml`, 1 `.gitignore`. The full list is
`git diff --name-only 0a11c47..4a399fb`.

The `.json` count is dominated by `content/provenance/NCA-75/Q1..Q40.json` (40)
and `content/exams/NCA-75/lessons/` wiring; the `.png` files are the S47-12
screenshot backup, unchanged on this branch since.

## Gate chain — 43/43 at `4a399fb`

```
FREEZE GATE CHAIN
head:   4a399fb5fd6c50d91df5d508141b7b52a0e985d4
branch: feature/rtp-beginner-tracks
date:   2026-10-11T20:02:25-05:00

PASS  python3 scripts/lint-content.py
PASS  python3 scripts/lint-content.py --self-test
PASS  python3 scripts/validate-manifests.py
PASS  python3 scripts/validate-manifests.py --self-test
PASS  python3 scripts/check-item-identity.py
PASS  python3 scripts/check-item-identity.py --self-test
PASS  python3 scripts/check-item-types.py
PASS  python3 scripts/check-item-types.py --self-test
PASS  python3 scripts/generate-study-content.py --check
PASS  python3 scripts/check-nca-remap.py
PASS  bash tests/gates/run_remap_fixtures.sh
PASS  python3 scripts/check-nca-cheatsheet.py
PASS  bash tests/gates/run_cheatsheet_fixtures.sh
PASS  python3 scripts/generate-bundle-manifest.py --check
PASS  python3 scripts/check-packaging-manifests.py
PASS  python3 scripts/check-packaging-manifests.py --self-test
PASS  bash tests/gates/run_packaging_fixtures.sh
PASS  bash tests/gates/run_release_truth_fixtures.sh
PASS  bash tests/gates/run_bridge_surface_fixtures.sh
PASS  bash tests/gates/run_shellcheck_fixtures.sh
PASS  python3 scripts/check-imports.py
PASS  python3 scripts/check-imports.py --root RadicalTrainingPlatform.Web/js
PASS  bash tests/gates/run_import_check_fixtures.sh
PASS  python3 scripts/check-brand.py
PASS  bash tests/gates/run_brand_fixtures.sh
PASS  bash tests/gates/run_web_fixtures.sh
PASS  bash tests/gates/run_option_shuffle_fixtures.sh
PASS  bash tests/gates/run_validator_scan_fixtures.sh
PASS  bash tests/gates/run_redeye_fixtures.sh
PASS  python3 scripts/check-content-bundle.py
PASS  python3 scripts/check-artifact-secrets.py
PASS  bash tests/gates/run_artifact_secrets_fixtures.sh
PASS  dotnet build Core (Release)
PASS  dotnet build Desktop (Release)
PASS  dotnet build Desktop.Tests (Release)
PASS  dotnet test Core.Tests (Release)
PASS  dotnet run Desktop.Tests (MTP runner)
PASS  python3 scripts/check-coverage.py
PASS  python3 scripts/check-coverage.py --self-test
PASS  python3 .github/scripts/vuln_gate.py
PASS  python3 tests/gates/run_vuln_gate_fixtures.py
PASS  node tests/e2e/smoke-web.mjs
PASS  bash tests/gates/run_smoke_fixtures.sh

FREEZE CHAIN: 43/43 at 4a399fb
```

Four gates are new since the S47-13 freeze (39 → 43): the remap inventory and
its fixtures (S48-01), and the cheatsheet errata gate and its fixtures (S48-04).
Each ships a failing fixture beside its passing one, which is the SPEC-16
discipline — a gate that has never been seen red is not a gate.

## Test counts per suite

| suite | command | result |
|---|---|---|
| Core (xUnit) | `dotnet test RadicalTrainingPlatform.Core.Tests/...` | **263/263**, 0 failed, 286 ms |
| Desktop smoke (MTP) | `./RadicalTrainingPlatform.Desktop.Tests/bin/Release/net10.0/RadicalTrainingPlatform.Desktop.Tests` | **51/51**, 0 errors, 0 failed, 1.633 s |
| Web fixtures | `bash tests/gates/run_web_fixtures.sh` | **26 fixtures PASS** + the must-fail self-test |
| NCA scenarios | `node tests/gates/web/nca-scenarios.mjs` | **13/13** |
| Scenario sweep | `node tests/gates/web/scenario-sweep.mjs` | all store scenarios PASS |
| Demo sweep | `node tests/gates/web/demo-sweep-report.mjs` | **50 scenarios**, all incomplete → complete |

## RedEye lane logs and the seeded-defect self-test record

T-46's fixture suite, run at the frozen head:

```
tests/gates/redeye/self_test.py — SELF-TEST: PASS — every seed caught; ship-gate fail-closed and loud
  lane checks (seeded defects):
    PASS clean bank parses without errors
    PASS clean bank: all deterministic checks pass
    PASS seeded wrong key: returned via blocked/pending model stage
    PASS seeded mis-mapped objective (9.9) caught
    PASS seeded position bias: all 8 A-key items flagged
    PASS seeded near-duplicate caught
    PASS seeded injection caught
    PASS seeded incomplete provenance caught
    PASS all logs verdict=return (fail-closed)
    PASS no log claims modelStage=verified
  ship-gate (fail-closed):
    PASS gate excludes items with no verified log (loud)
    PASS gate names excluded items
    PASS stale item hash excluded and named
    PASS bank-less exam fails instead of passing vacuously
    PASS legacy root banks are discovered for their exam

scripts/redeye-lane.py --self-test — every seeded defect caught; fail-closed verdicts hold
```

The last two ship-gate cases are new in S48-01. The bank-less case exists because
the NCA gate had been printing **"✅ GATE PASS"** while gating **zero items** —
`gate_exam` looked only in `content/exams/NCA-75/questions/`, which was empty
while all 140 real items sat in root banks. A gate that passes on an empty
selection is not a gate, and the case makes that failure mode executable.

### The ship-gate excludes everything — the designed state, and load-bearing

```
python3 scripts/redeye-gate.py NCA-75    →  exit 1
❌ GATE FAILURE: 180 item(s) excluded — nothing releases without a current
   passing verified log (REQ-REV-02/05)

python3 scripts/redeye-gate.py --all     →  exit 1
❌ GATE FAILURE: 229 item(s) excluded
```

All **180 NCA-75 items** (140 remapped bank items + 40 authored pilot items) are
excluded, each named. Lane logs exist for all of them under
`content/review-logs/NCA-75/` — **gitignored, so not committed** — with hashes
bound to the current item text, exam manifest and reviewer config. The
key-vs-source stage is **model-backed**, no model provider is configured, so the
lane fails closed and writes `return` / `modelStage: blocked`.

A second, distinct exclusion reason appears in the NCA run: **`stale log
(manifest changed since review)`**. S48-02 replaced `exam.json` with the current
blueprint, which invalidates logs bound to the old manifest hash. That is the
gate working — a manifest change is exactly what should re-open a review — and
it is recorded here rather than worked around.

Across all exams, **229 scored items** are excluded (180 NCA + 49 CompTIA). By
the gate's definition **nothing in this repository is released**, which is what
the S47-01/02 and S48-01/03 rows already say in their own words. The demo can
run the packs; the gate will not call them released. That gap is not closable
without the radredeye model-stage integration (REQ-REV-05).

## The usable build

`tests/e2e/smoke-web.mjs` against the served `RadicalTrainingPlatform.Web/`
directory — the exact tree the deploy job hands to
`actions/upload-pages-artifact`, not a rebuild:

```
browser: /usr/bin/google-chrome-stable
serving .../RadicalTrainingPlatform.Web at http://127.0.0.1:39297
  PASS boots to /pe/dashboard with a rendered view
  PASS the rendered view has content
  PASS entering demo mode shows the demo-mode label
  PASS station reset renders its reseed verification outcome
  PASS leaving demo mode clears the label
  PASS zero console errors, uncaught exceptions, or failed requests

WEB SMOKE: PASS — the built artifact boots, renders, and completes a demo
interaction with a clean console
```

Bundle state at the freeze head:

```
CONTENT BUNDLE: PASS — 123 asset(s) present and hash-matched; 89 shipped
item(s) all from released packs, release state 'draft-preview'
COVERAGE: 2091/2271 lines = 92.07% (threshold 70%)
```

## The rest of the evidence pack

| Pack item (SPEC-16 16.6) | Artifact | Result |
|---|---|---|
| Remap inventory, lane logs, self-test record | `2026-10-25-nca-remap.md` | 140 rows validated; every one excluded by the lane; the gate that could not fail, found and fixed |
| Demo sweep report (per-scenario rows) | `2026-10-25-demo-sweep.md` | **50 scenarios** at head `4a399fb`, every one `incomplete (0 of N met)` on a fresh station → `complete (N of N met)` after its recorded walkthrough |
| Prior demo freeze (October 23 pack) | `2026-10-23-freeze.md` | **39/39 at `0d1f565`** — the earlier freeze, left unedited per SPEC-16 16.6 |
| Prior demo sweep (October 23 pack) | `2026-10-11-demo-sweep.md` | 46 scenarios at `0d1f565` — the pre-NCA catalogue, left unedited |
| Tutor evaluation / go-no-go | `2026-10-23-tutor-eval.md`, `2026-10-23-tutor-go-no-go.md` | 206/206 checks; **NO-GO on live AI, GO on the recorded-example fallback** |
| Rehearsal notes | `2026-10-23-rehearsal.md` | Automated keyboard half: 27 PASS / 3 FAIL / 4 findings |
| Screenshots backup | `2026-10-23-demo-shots.md` + 12 PNGs | Seven critical flows + the recorded-example tutor |
| Build smoke log | `2026-10-23-build-smoke.md` | Pages predeploy gate |

## The known-unverified list

Everything above is a claim about what was measured. This is what was not.

**Blocked by the package, not by effort:**

1. **The departure cutoff.** No itinerary in the repository; ASM-09 records the
   exact departure as unverified. See the section at the top — this is the one
   criterion the freeze does not meet.
2. **No item is reviewed.** All 180 NCA items are excluded by the lane; the
   model stage that would verify a key against its source is not configured
   (REQ-REV-05). The 40-item pilot ships at `draft-preview`, which is a pilot
   scope label, not a verification.
3. **The Nutanix guide was never opened.** Not at S48-01, not at S48-02, not at
   S48-03, not at S48-04. The blueprint's sections and objective titles, the 14
   lessons' subject matter, the cheatsheet's surviving claims, and the
   tool/objective mapping in `NCA_TOOL_LAB` are all authored or ingested
   material that no human re-read against the June 15, 2026 PDF at execution
   time. `sourceReviewDate` on all four manifests is the ingest date, not an
   attested review.
4. **`mapping-check` cannot read `remap.csv`.** The lane reads provenance files;
   the remap document carries the mapping. Reconciling them is undone.
5. **`rightsStatus` is an assertion, not a review** — on every provenance record.

**Not attempted:**

6. **The lab UI was never driven in a browser.** The NCA lab's three modes are
   exercised through the stub DOM by `nca-scenarios.mjs` and through the store
   by the demo sweep; no real click, ordering interaction or alert-detail toggle
   was performed. `rehearsal-web.mjs` covers the ticket lab in Chrome, not these.
7. **The GitHub runner's browser.** This capture used the workstation's
   `google-chrome-stable`. No run on the fleet runner has been observed from
   here; the step fails closed if no browser is found.
8. **Deployed Pages behaviour.** The smoke uses a loopback static server, not
   `github.io`: service-worker scope, caching and the Pages base path are not
   exercised.
9. **The two vendor PDFs** the audit references are absent from the repository.
10. **Beta section titles survive in the bank domain headings** (`NCA-75-Part1.md:3`
    and its siblings) and in `remap.csv`'s required `oldDomain` column. They can
    still reach a learner through Desktop `StatsView`'s domain stats on an NCA
    bank item. Recorded, not fixed.
11. **`Desktop.Tests` has no CI signal.** It is built by CI and executed by
    nothing there; the 51/51 above is a local run.

## What the freeze does not claim

It does not claim the NCA cut is travel-ready. It claims that at head
`4a399fb`, on this host, the full gate chain is green with 43 of 43 gates
passing, the Core and Desktop suites are green with 263 and 51 tests, the PWA
boots and completes a demo interaction with a clean console, the catalogue's 50
scenarios all fail from a fresh seed and all complete after their recorded
walkthrough — and that the RedEye gate excludes every scored item in the
repository, which is the designed fail-closed state and not an oversight.

The cut is a **draft preview**: 14 lessons no human has reviewed, 40 pilot items
and 140 remapped items no lane has verified, four scenarios whose lab UI no
browser has driven, and a companion sheet whose remaining claims were carried
forward unexamined. That is the honest state of the NCA track on the day the
head was recorded.
