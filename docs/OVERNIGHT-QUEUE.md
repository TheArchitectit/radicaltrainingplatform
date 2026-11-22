# Overnight run — RTP queue (2026-11-21)

Built from a full sweep of `docs/sprints/openspec/` (SPEC-00..SPEC-21) and
`SPRINT-48.md`. Only work that needs no owner decision is queued; blocked rows
are at the foot.

Per wave: implement → gate P (passing) + N (seeded failing fixture) → wire into
`tests/gates/run_freeze_chain.sh` + CI → docs → full chain at the SHA → commit →
merge `--ff-only` to `main` → push both branches. Halt only on a SPEC-15
tripwire or three consecutive failures on one item.

## W1 — TM-94/95, REQ-AP-04/05: A+ illustration and worked-example labels — done
- [x] `lesson-reader.js` renders internal `#/…` links, escape-first, no raw HTML
      and no external hrefs — today it renders no links at all
- [x] Lesson A4 carries the simulator link with the exact label
      **“Nutanix example of a general concept.”**
- [x] A+ manifests get `workedExamples` for the objectives the simulator does
      not support (A3 hardware/peripherals, B1 OS), labeled `worked example`
- [x] Gate P: A4 label on a scenario link; every A+ worked example labeled and
      gap-bearing; N: label removed, worked example missing, external href
      rendered, unlabeled example
- [x] QA → full gates → docs → commit + push

## W2 — TM-102, REQ-NP-04: Net+ gap topics render as labeled worked examples — done
- [x] Content already exists (4 gaps, 4 worked examples); this wave is the
      missing gate — the W1 gate covers it
- [x] Gate P: every declared gap has a labeled worked example; N: a gap with no
      example, a missing label, a worked example claiming interactivity, a
      lesson claiming interactive support for a declared gap
- [x] QA → full gates → docs → commit + push

## W3 — S48-02: attest the blueprint structure honestly — done
- [x] Re-fetch the June 15 2026 blueprint from the `sourceUrl` already in
      `exam.json`; verify 4 sections, 14 objectives, titles, product versions,
      no weight table
- [x] Record as **tool-attested**. Do NOT set `sourceReviewDate` — SPEC-02
      requires a human to have opened the source, and dating a review nobody
      performed is the SPEC-20 defect already fixed once here
- [x] Owner attestation request in `CARRY-FORWARD.md`
- [x] docs → gates → commit + push

## W4 — housekeeping
- [x] Packaging metadata holder + licence corrected (it declared MIT against a
      BSD-3-Clause repository) and gated in `check-packaging-manifests.py`
- [x] `SPRINT-39-40.md` framing — already retitled in an earlier session; one
      stale “classroom kit” label corrected

## End of run
- [ ] Final `run_freeze_chain.sh --expect-sha <SHA>`; record total + head
- [ ] `CARRY-FORWARD.md` next-session section reflects the true state
- [ ] Leave `docs/DIGEST-FOLLOWUPS.md`, `forge-bot/*` and the feature-branch
      `NEXT-548` commit alone — owner territory

## Blocked — not queued
| Row | Needs |
|---|---|
| S48-01, S48-03 | RedEye provider activation (SPEC-15 tripwire) for `modelStage: verified` |
| S48-04 remainder | AHV 11 / AOS guide (pointer-only, not obtainable) — storage-fabric claims stay unverified |
| S48-07 rights column | a human rights review of the six ingest-source PDFs |
