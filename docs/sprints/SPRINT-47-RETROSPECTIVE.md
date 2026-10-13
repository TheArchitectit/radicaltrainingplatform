# Sprint 47 — Mini-retrospective (SPEC-11 11.10)

**Sprint head SHA:** `7a21f6b` (branch `feature/rtp-beginner-tracks`; sprint opened at
the Sprint 46 close `755d6ed`). **Freeze head:** `0d1f565` (S47-13), the commit the
October 23 demo condition is frozen against.

This is a companion file rather than a section of `SPRINT-47.md` because that file
reached the 500-line document limit with the acceptance blocks alone. SPEC-11 11.10
asks for the retrospective, not for where it lives; `SPRINT-47.md` links here.

---

## Gate pass count at the sprint head SHA: 39/39 at `7a21f6b`

Measured, not carried over — `bash tests/gates/run_freeze_chain.sh` re-run at the
sprint head after the last row landed:

```
FREEZE CHAIN: 39/39 at 7a21f6b
```

The chain is committed (`tests/gates/run_freeze_chain.sh`) and takes `--expect-sha`,
so a record cannot quote a total measured at a different commit. It is the same 39
gates that produced the freeze record's **39/39 at `0d1f565`**; nothing regressed
between the freeze and the close.

| Group | Gates | What it covers |
|---|---|---|
| Content / identity | 9 | lint-content, manifests, item identity, item types, study-content + bundle-manifest drift, each with its self-test |
| Packaging / release truth | 6 | packaging manifests, packaging fixtures, release-link truth, bridge surface, shellcheck |
| Web artifact | 12 | imports, brand (+fixtures), web runtime fixtures, option-shuffle fixtures, validator scan, RedEye fixtures, content bundle, artifact secrets (+fixtures) |
| .NET | 8 | build Core/Desktop/Desktop.Tests, Core.Tests, Desktop.Tests, coverage (+self-test), vuln gate (+fixtures) |
| Browser legs | 2 | `smoke-web.mjs`, smoke fixtures |

**Test counts at the sprint head:** Core 257/257 green (`dotnet test`, Release);
Desktop 51/51 green (`dotnet run`, MTP-native runner); coverage **92.33%**
(2191/2373 lines, threshold 70%). `dotnet build` Core 0 warnings. Legacy WinForms is
not built on Linux (per CLAUDE.md).

---

## Planned vs landed

All 15 backlog rows landed, and S47-16 was opened after the fact for a gap the
package left without an owner. S47-03..06 and S47-11..14 ✅; **seven rows 🟡** —
S47-01, S47-02, S47-07, S47-08, S47-09, S47-10 and S47-15 — in two families.

| Row | Yellow because |
|---|---|
| S47-01, S47-02 (T-19/T-20) | The cuts are complete and every item carries a lane log, but the RedEye model stage is unconfigured, so **no log passes** — the word *reviewed* was struck from both rows rather than left standing |
| S47-07 (T-25) | Clean-install tests need a real install target (PKG:1469); the repairs themselves landed and are gated |
| S47-08 (T-41) | Bundle independence verified from the artifact; the *installed* bundle is the same missing target |
| S47-09 (T-45) | ShellCheck gate + fixtures landed; the packaging *behaviour* fixtures that need an install are the residue |
| S47-10 (T-26) | The demo host does not exist yet — rehearsal is recorded as not-run, never as passed |
| S47-15 (R-10) | HG-01 is an owner gate; the file drop is deferred **by design**, not by blockage |

No row is yellow for a defect left standing. That distinction is the whole point of
the status column: a 🟡 that means "awaiting a human or a host" is honest, and a 🟡
that means "unfinished work I could have done" would not be.

S47-01 and S47-02 were marked ✅ in the first draft of this retrospective, and that
was the exact error the Sprint 45 retrospective predicted: *"every content-release
acceptance box in Sprints 46–47 must be written to distinguish 'lane log exists'
from 'item passed the lane' — otherwise green ticks will hide the unrun model
stage."* The acceptance boxes were written that way; the **status column** was not.
A reader scanning the backlog saw "24 reviewed items ✅" and would have concluded
the items were reviewed. Fixed in `SPRINT-47.md`.

---

## What went well

- **The freeze became reproducible rather than quoted.** S47-13 could have pasted a
  gate transcript into a record; instead the chain is a committed script with
  `--expect-sha`, so the record's "39/39" is checkable by anyone at that commit. The
  same script produced this retrospective's number, which is why they agree.
- **Two vacuous checks were found and made real.** `brand-disclaimer-snapshot.mjs`
  hardcoded `docs/demo/DEMO-SCRIPT.md` — a filename nothing matched — so it logged
  *pending* on every run and enforced nothing; it now uses `check-brand.py`'s glob
  and was **proven to discriminate** (strip the disclaimer → red naming the file;
  restore → green). The packaging manifest generator was also being invoked with the
  wrong argument shape, which had hidden a real drift check.
- **The gates caught my own work three times, and each time the gate was right.**
  The brand gate rejected two endorsement phrases in the first demo-script draft;
  the release-truth gate rejected a description of the vendor manuals that claimed
  Git LFS in a repository with no `.gitattributes`. In the last case the *finding*
  was real and larger than the wording: the manuals are not in the repository at all.
- **The demo script was written against behaviour, not intent.** It tells the
  presenter to reach the scenario with the mouse (REQ-DEMO-05), warns that the purple
  banner is always painted (REQ-DEMO-02), and says plainly that the tutor is the
  recorded example — so the whole loop runs with the network unplugged and nobody
  discovers a recorded gap live.
- **RedEye was recorded honestly red.** `redeye-gate --all` exits 1 with 49/49 items
  excluded, and the freeze record says so rather than smoothing it. That is a real
  tension with the sprint's own acceptance wording ("a scored practice set of
  reviewed original items") and it is named, not buried.

## What slipped / register notes

- **The vendor manuals are absent.** `docs/AHV-Admin-Guide-v11_0.pdf` and
  `docs/Prism-Central-Guide-vpc_7_5.pdf` are 132/133-byte large-object pointer text
  naming objects of 4,323,527 and 19,424,163 bytes, and there is no `.gitattributes`,
  so no filter is configured (`git check-attr filter` → `unspecified`). A clone gets
  pointer text where a manual is claimed. **Recorded as an open finding; not fixed** —
  it is a rights/asset question (C-03), not a Sprint 47 code defect.
- **`SPRINT-47-EVIDENCE.md` § S47-03 was wrong and is now corrected.** It claimed
  `redeye-gate --all` exit 0, which the tool cannot produce while every verdict is
  `return` (the packs already held 49 items at that commit). Corrected in place with
  the correction noted.
- **`Desktop.Tests` had no run signal anywhere.** CI builds it and executes nothing,
  and `dotnet test` refuses it on the .NET 10 SDK (Microsoft.Testing.Platform
  rejects the VSTest target). Its 51 tests were run for the first time here, via the
  MTP-native `dotnet run`. **This is a CI gap, not just a local one** — 51 tests
  still have no signal on the build host.
- **Sprint 47 is the first Phase 5 sprint to exceed the 500-line document limit**,
  which is why this retrospective is a companion file.

## S47-16 (T-25b) — README truth, opened late

T-25b has no row in SPEC-11's tables: SPEC-14 assigns it to R-12, and R-12's
"README facts match CI-generated counts" had no owner in any sprint file. It was
found by a coverage audit, not by the plan.

**What was wrong.** `README.md` was the pre-refactor WinForms document. It described
a "WinForms-based" tool on ".NET 8.0" with a ".NET 8.0 SDK (Windows)" prerequisite,
gave `RadicalTrainingPlatform/` as the project root (the repo has four projects), and
printed a tree containing `designguides/` and `validation/` — neither of which exists
— plus a `LICENSE` entry contradicting its own License section two screens later.

**What landed.** Stack claims corrected (.NET 10 / Avalonia + PWA + Core; the WinForms
project named as legacy and Windows-only); prerequisites corrected to the .NET 10 SDK,
cross-platform; build and publish commands replaced with the ones CLAUDE.md documents;
the project tree replaced with the real one; and a **"What ships today"** section
carrying the CI-generated counts — 4 exam manifests, 3 tracks, 89 released items
(16 + 8 + 25 + 40), `releaseState: draft-preview` — which also states plainly that no
item carries a passing review log.

**What did not land.** R-12's acceptance is that README facts *match* the CI-generated
counts. Nothing enforces it: there is no gate comparing README prose to
`content-bundle.json`, so the numbers are right by hand today, not by check. That is
the residue, and it is why this row is 🟡 rather than ✅.

**Also unowned, found by the same audit, and since resolved:** **T-31a** (PDF
inventory with hash/license record, C-09) and **T-SC-03** (the written record of
which `us-bucket-01` repair choice was made). Neither appears in SPEC-11's task
tables, so the plan's "every task has exactly one sprint home" rule never reached
them.

- **T-SC-03 was already done** — `SPRINT-46.md` § S46-04 records the choice
  ("corrected to real UI mutation paths") and the old predicate it replaced. The
  audit's finding was wrong; nothing was written to "fix" it.
- **T-31a was genuinely missing** and is now [S48-07](SPRINT-48.md):
  [docs/SOURCE-INVENTORY.md](../SOURCE-INVENTORY.md) records all eight tracked PDFs
  with sha256, size, class, presence and rights status, and
  `scripts/check-source-inventory.py` fails when the record and the tree disagree —
  including when a row claims `in-repo` for the two vendor manuals, which are
  pointer text.

## Not verified / deferred by design

Reported as not-verified rather than implied green. Full list in
`docs/qa/release-evidence/2026-10-23-freeze.md`; the load-bearing ones:

- The **actual demo host** (PKG:1469) — no rehearsal, no clean install, no offline
  boot on the machine that will run the demo.
- **Projector readability** and TM-50 ChromeOS/presenter-host entries.
- **Human source review** of any item, and the **RedEye model stage** (no provider
  configured; the lane fails closed rather than self-exempting).
- Reset-between-groups in a live room; the mid-demo fallback switch; video backup;
  deployed-Pages behaviour; live AI behaviour.
- The demo script has **not been read aloud at podium pace** — its timings are
  budgeted, not measured.

## Lessons for Sprint 48 (NCA 7.5, Sprint E)

- **Keep the yellow honest.** Five rows here are yellow for one reason — a missing
  host or a pending human — and the sprint is complete because that is stated, not
  because it is hidden. Sprint 48 has the same shape (travel freeze, HG-01 pending)
  and should read the same way.
- **A gate that cannot fail is worse than no gate.** Both vacuous checks found here
  had been green for sprints. Any new NCA gate should be shown discriminating
  (failing fixture first) before it is trusted — that is already the SPEC-16 rule;
  the lesson is that *existing* checks need the same treatment occasionally.
- **Measure the count at the commit you name.** The `--expect-sha` flag exists
  because a transcript pasted from an earlier head is indistinguishable from a
  fabricated one. Carry the pattern into the Sprint 48 travel freeze.
- **Fix the CI signal before adding 40 pilot items.** `Desktop.Tests` running nowhere
  is a standing gap; adding NCA content on top of an unreported test suite compounds
  it.
- **The 500-line limit is real and reached.** Sprint 48's acceptance blocks should be
  planned as companion files from the start rather than split under pressure.
