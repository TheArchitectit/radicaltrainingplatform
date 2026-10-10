# OpenSpec SPEC-00 — Proposal, Baseline, Scope and Success Definition

**Source:** [OpenSpec package rtp-beginner-tracks-2026-10](../../drive-ingest-2026-10-10/RTP-Beginner-Tracks-Openspec-Change-Package-A-Network-NCA75-v2.md), SPEC-00 / SPEC-00B
**Change ID:** `rtp-beginner-tracks-2026-10` · **Base:** main @ `904106a` (Oct 5, 2026) · **Package date:** Oct 10, 2026 · **Status:** Proposal (repo writes only via the gate chain; no deployments, purchases, releases)

## Why this change exists

Roger needs three beginner certification tracks on RTP:

1. **CompTIA A+** (Core 1 220-1201, Core 2 220-1202) — student demonstration **Friday, October 23, 2026**
2. **CompTIA Network+** (N10-009) — same October 23 demonstration
3. **Nutanix NCA 7.5** (internal exam ID NCA-75) — Nutanix HQ visit, California, **October 25-28, 2026**

The October 23 event demonstrates a complete learning loop to students — not a claim of exam readiness. The California trip needs a corrected, current-objective NCA track without presenting a beta blueprint as current fact. Both deadlines are real calendar constraints; everything is sequenced around them.

## Verified baseline (repo facts, superseding older audit statements)

- **Solution:** five projects — Core (net10.0, no UI deps), Core.Tests (xUnit+Shouldly), Desktop (net10.0, Avalonia 12.1.3, all four Avalonia packages on one version line), Desktop.Tests (xunit.v3 headless smoke, runs as executable not VSTest), Legacy.WinForms (net10.0-windows). Web is a static PWA with no .NET dependency.
- **Content:** 1,598 question headers across five Nutanix banks (NCA-75 140, NCP-US 400, NCP-CI 363, NCP-AI 335, NCM-MCI 360) at repo root. No A+ or Network+ bank exists. Counts are content counts from lint/catalog regex, not verified assessment items.
- **Parser contract:** `## DOMAIN <n>` (case-insensitive), `### Q<n>`, `- A)`..`- F)`, `**Answer: X**` / `**Correct Answer: X, Y**` multi-select, explanations, errata applied after parsing via `IErrataProvider`.
- **Exam-code derivation:** `DeriveExamCode` iteratively strips `-PartN`, `-DN`, `-GapFill`, keeps at most the first two hyphen segments; `COMPTIA-A-1201-Part1.md` would truncate to `COMPTIA-A` — colliding Core 1 with Core 2. Hence manifests (SPEC-02).
- **Blueprint:** `HardcodedBlueprintService.InitNca75` (lines 540-641) is the beta 7.5 structure (20/30/25/25); the official June 15, 2026 guide uses four different sections targeting AOS 7.5 / AHV 11.0 / pc.7.5. Must be replaced or overridden by a versioned manifest.
- **Errata:** `errata.json` v1, two corrections (Part1 Q35→D, Part3-GapFill Q3→A); `JsonErrataStore` loads and applies them. The Oct 1 audit’s “errata.json unused” is stale. But `studyguides/CHEATSHEET-NCA-75.md` line 96 still contradicts the applied errata.
- **Persistence:** `SessionStore.cs` (JsonSessionStore, lab-simulator sessions under app data, thread-safe, traversal-safe); Web StateStore persists in IndexedDB (`RadicalTrainingPlatformLab`) with localStorage fallback. What remains unproven is learner quiz-progress durability — existing stores serve the simulator.
- **Web app:** exactly 47 registered routes, all Nutanix simulator views. The PWA is a Nutanix simulator, not a multi-vendor study UI — no track picker, lesson reader, practice or progress screen. The simulator exists in two diverging copies (Web vs Legacy.WinForms/LabSimulator); one authoritative source must be chosen (D3).
- **Content lint:** `lint-content.py` globs only root `*.md` with name-based skips — new track content anywhere else is silently unlinted.
- **CI:** build-linux (self-hosted fleet runner ucs03, label devgate-rtp) + build-winforms (hosted); pwa-deploy.yml via GitHub Pages.
- **Vulnerability gate defect (release-relevant):** vuln_gate.py iterates `data if isinstance(data, list) else []` but dotnet emits a root object — the loop body never executes, every project reports clean, gate prints PASS. Reproduced live with Newtonsoft.Json 12.0.1: PASS, exit 0. A blocking gate that cannot fail is worse than no gate.
- **Guardrails:** CLAUDE.md + `.guardrails/` + `.devgate` in place; chore/external-audit merged; the Oct 1 “do not merge” warning is historical.
- **Licensing:** no LICENSE file at head (README claims BSD-3); two Nutanix vendor PDFs in docs/ are Plan v2 C-03 rights-review items, unchanged by this package.

## Vendor policy posture and non-endorsement constraint (owner-directed)

CompTIA’s unauthorized-training-materials policy explicitly targets candidates using brain dumps and states CompTIA does not authorize AI/LLM tools generating study questions. Roger’s direction, verbatim: “They can’t legally prevent anyone for making ai generated training content” and “We will clearly state this isn’t official training or endorsed training material.” The package renders no legal verdict; it encodes the owner’s chosen product posture as binding SHALLs:

- **Originality with exam-item distance** — every scored question is original, with no proximity to actual exam items; resembling a remembered/leaked question enters the C-04 quarantine.
- **RedEye review before publish** — every scored item passes the RedEye lane (SPEC-08A); Roger is not the reviewer of record.
- **No endorsement implication** — no “approved/official/certified by” language or vendor marks; nominative fair use only.
- **Exact disclaimer (REQ-BRAND-02)** on every track surface and in the demo script: “This is independent study material. It is not official training and is not endorsed or approved by CompTIA, Nutanix, or any other certification body.”
- **Tutor framing** — general IT-skills coaching over original lessons, never vendor-endorsed exam prep.

## Scope

**In scope:** three tracks / four exam IDs / one shared runtime extension — manifests (SPEC-02), beginner study screens (SPEC-03), A+ content (SPEC-04), Network+ content (SPEC-05), NCA-75 remap (SPEC-06), deterministic scenarios (SPEC-07), restricted tutor slice (SPEC-08), RedEye lane (SPEC-08A), runtime repair (SPEC-09), gates/packaging (SPEC-10), delivery plan (SPEC-11..14), assumptions/executor brief (SPEC-15..16).

**Out of scope (explicit non-goals):** no full PWA-first rewrite; no account system/cloud sync/spaced repetition for these deadlines; no three new simulators; no public release or deployment; no unreviewed AI-drafted content in any scored item (AI drafting allowed under the 00.3 constraints); no live AI in assessment mode; no real-infrastructure calls from scenarios; no modification of existing Nutanix banks or vendor PDFs; no license selection (owner decision).

## Success definition

**October 23 demo-ready:** a presenter opens the PWA on the demo host, picks track-aplus or track-netplus, reads one complete lesson per exam, runs a scored practice set of reviewed original items, completes a deterministic simulated help-desk task, asks the tutor for a hint inside its stated limits (or plays the labeled recorded example), resets the station for the next group — all with the network cable unplugged except the optional tutor call. Incomplete objective coverage visibly labeled “beginner preview”. No pass-prediction claim anywhere.

**October 25-28 California-ready:** the NCA track presents the current official blueprint (sections, objective IDs, AOS 7.5 / AHV 11.0 / pc.7.5), 14 short lessons, 40 reviewed remapped-or-new items, four tested deterministic scenarios, a corrected objective map; beta labels survive only where a retained claim was checked.

**Shared release condition:** every gate in SPEC-10 green at the tested head, including the repaired vulnerability gate proven against a fixture that must fail it.

## Gap analysis (SPEC-00B summary)

| Capability | Current | Target | Closing mechanism |
|---|---|---|---|
| Content: CompTIA | zero items/lessons/manifests | 220 reviewed original items (120 A+, 100 N+), 9+10 module lessons, 2 scenarios, objective maps | SPEC-02 contracts, SPEC-04/05 content plans, RedEye lane |
| Content: NCA | 140 items on beta map, stale cheatsheet, hardcoded blueprint | current 4-section/14-objective manifest, 40-item pilot, 14 lessons, corrected surfaces | SPEC-06 with remap.csv as control document |
| Learning loop | desktop exam sessions only; PWA has no study UI; scoring defects corrupt truth | track→lesson→practice→scenario→progress, offline, deterministic | SPEC-03 + SPEC-09 R-03..R-07 |
| Simulator | 44 scenarios, 78 objectives; boot broken since June; 27 literal-true predicates; 16 seed-auto-pass; 1 unpassable; 2 diverging copies | single source, every scenario demoable, 6 new scenarios, sweep evidence | SPEC-07 + SPEC-09 R-01/R-02/R-11 |
| Tutor | nothing exists | restricted gateway slice or labeled recorded fallback | SPEC-08 with go/no-go gate |
| Release machinery | fail-open security gate, unenforced coverage, deploy without smoke, packaging defects, no LICENSE, stale README, zero releases | gates that provably fail, enforced coverage, predeploy smoke, honest packaging, truthful docs | SPEC-10, SPEC-09 R-10/R-12 |
| Cross-platform truth | Windows-only historical operation; macOS untested; Chromebooks unknown | PWA primary on Chrome/Edge/Safari incl. ChromeOS; Avalonia parity Win/Linux/macOS; honest host matrix | REQ-XPAT series, TM-50 series |

**Non-gaps (do not re-fix):** parser format handles required question shapes (post R-07); errata infrastructure works and is loaded; session/state stores work as components; CI runner topology is sound; the five Nutanix banks lint clean (count-based); guardrail documents exist.

## Glossary

**Pack** — released content for one exam manifest. **Cut** — the reviewed subset released for a deadline. **Seed** — a scenario’s deterministic initial fixture. **Sweep** — the scripted all-scenario boot/run/complete pass (TM-45). **Remap** — attaching current-objective mappings to existing items without renumbering. **Quarantine** — excluded-from-release status with a recorded reason. **Gate fixture** — input crafted to prove a gate fails correctly. **Beginner preview** — the visible label for partial objective coverage. **Recorded example** — prewritten tutor output labeled as not live. **Finding register** — SPEC-14’s zero-unowned-rows table.
