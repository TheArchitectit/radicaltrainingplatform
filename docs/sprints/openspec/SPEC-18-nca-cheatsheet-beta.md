# OpenSpec SPEC-18 — NCA 7.5 Cheatsheet: Retire the Closed Beta Framing

**Home:** `studyguides/CHEATSHEET-NCA-75.md` · **Supersedes in part:** SPEC-06 REQ-NCA-04
**Executed in:** this change · **Gates:** `scripts/check-nca-cheatsheet.py` (extended), TM-29c
**Depends on:** SPEC-06 (NCA track), `errata.json`

## Alignment and frame

SPEC-06 REQ-NCA-04 required the stale SSH claim be corrected and "waiver-code/beta-exam
tips removed or clearly dated". The claim was corrected and the tips were dated — both
satisfied the letter. What survived is the framing: the sheet's **title** still reads
"NCA 7.5 Beta Exam", and a reader who sees only the H1 concludes the product tracks a
beta. The beta window closed on **June 14, 2026**, the NCA 7.5 exam is live, and the
product's other surfaces (track card, blueprint view, practice header) all say 7.5 with
no beta qualifier. One file contradicting five is a defect, not a historical record.

A second, narrower problem: **the expired waiver code `NCA75BETANEW` is still in the
sheet.** It is marked "expired, do not attempt to use", but it is a credential-shaped
string for a closed window. A reader who scans rather than reads it takes the code. It
has no value as history — the fact *that* there was a beta is kept by the dated note —
so it is removed rather than re-labelled.

This spec does the narrower thing SPEC-06 did not: it removes the beta framing from the
H1 and the code from the body, keeps the dated historical section (which is accurate
history, not a live claim), and makes the gate enforce both so neither can return.

## Requirements (normative)

| ID | SHALL | Scenario |
|---|---|---|
| REQ-CS-01 | The sheet's H1 names the exam without a beta qualifier: `# NCA 7.5 — Quick Reference Cheat Sheet`. "Beta" in a heading is a live claim about the exam; the dated history section is not a heading claim. | Gate: `# NCA 7.5 Beta` absent from any heading line; H1 matches exactly. |
| REQ-CS-02 | The expired waiver code `NCA75BETANEW` is absent from the sheet. The dated historical section keeps saying the window closed and the code is unusable, without reproducing the code. | Gate: the string `NCA75BETANEW` absent from the file. |
| REQ-CS-03 | The dated historical section is **kept**, with its date and the closed-window statement intact. Deleting it would erase the record the open question C-07 asks for; the defect is the live framing, not the history. | Gate: the section marker "beta window has closed" and the date 2026-06-14 remain present. |
| REQ-CS-04 | The SPEC-06 corrections stay in force and the gate keeps checking them: the stale SSH claim absent, the errata ID present, the corrected claim present, and the link inventory printed every run. | `scripts/check-nca-cheatsheet.py` passes; `run_cheatsheet_fixtures.sh` still proves each rule can fail. |
| REQ-CS-05 | `Beta-labelled summary` — the openspecs' residue table (SPEC-14 C-07) records that this row is now closed by behaviour, not by a note. | SPEC-14 C-07 row updated to name SPEC-18 and TM-29c. |

## What this spec does NOT do

- It does not re-verify the sheet's claims against the current guide. That is the
  authoring review SPEC-06 §"what would close this" already describes, and it is
  unchanged by this fix. The sheet's status note still says the claims were not
  individually re-verified, which remains true.
- It does not delete the historical section. Deleting history to stop a reader
  misreading it is the wrong fix; dating it and removing the live title is the right one.

## Verification

```
python3 scripts/check-nca-cheatsheet.py
bash tests/gates/run_cheatsheet_fixtures.sh
grep -n "^#.*[Bb]eta" studyguides/CHEATSHEET-NCA-75.md    # must be empty
grep -n "NCA75BETANEW" studyguides/CHEATSHEET-NCA-75.md    # must be empty
```
