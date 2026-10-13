# Sprint 48 — Retrospective and Acceptance (SPEC-11 11.10)

**Sprint head SHA:** `e95ccc6` (S48-08/TM-75). **Frozen head:** `0e12fcd`, the head
the NCA freeze record names.

**Gate pass count at the sprint head: 53/53 at `e95ccc6`** — measured, not carried
over, by the committed runner:

```bash
bash tests/gates/run_freeze_chain.sh --log /tmp/freeze.log \
  --expect-sha e95ccc67f1a8deafead908c703216dc529546088
# FREEZE CHAIN: 53/53 at e95ccc6  (exit 0)
```

The frozen head measured 45/45; the total is higher here because **the chain grew,
not because anything changed** — S48-07 added the source-inventory gate and its
runner (45 → 47), S47-16/R-12 added the README count gate and its runner (47 → 49),
and S48-08 added four: the traceability gate and its runner, and the two orphaned
runners it found (49 → 53). No gate regressed, and no file under `content/` changed
(`git diff --name-only 0e12fcd..e95ccc6 -- content/` is empty), so SPEC-16 16.6's
"no content edits after freeze" is not engaged.

---

## S48-08 (TM-75) — the traceability doc gate

SPEC-12 named TM-75 as a gate in three places: its own header (`**Doc gate:** TM-75`),
its TM-70 series table, and the sentence closing the requirement index — *"an unmapped
requirement fails the doc gate (TM-75)."* No script implemented it, and no sprint file
owned it. A gate named in three documents that nothing runs is the same defect class as
the vacuous checks Sprint 47 found: the claim reads as enforced, and nothing enforces it.

**What running it found.** Two defects, both real and both mechanical.

*The index was false.* Sixteen identifiers declared in SPEC-02..SPEC-10 had no TM row:
`R-05`, `R-06`, `R-10`, `R-12`, `REQ-AP-04..07`, `REQ-MAN-06`, `REQ-NCA-06..08`,
`REQ-NP-04..06`, `REQ-SC-06`. Several had evidence that simply was not recorded —
`check-item-types.py` is REQ-AP-06's gate, `validate-manifests.py` is REQ-MAN-06's,
`check-legacy-bridge.py` is R-05's — so the index understated coverage rather than
overstating it. Others are genuine gaps and are now recorded as such: REQ-AP-04's label
string is absent from the shipped artifact and lesson A4 is not in the October cut;
REQ-NP-04 has no gate; REQ-NCA-08's departure cutoff is still unconfirmed (ASM-09);
R-10 stays open on HG-01. SPEC-12 gained a **TM-94 series** naming each, with a named
gap written as a named gap rather than as a covered requirement.

*Three fixture runners ran nowhere.* `run_content_bundle_fixtures.sh`,
`run_tutor_eval.sh` and `run_rehearsal_fixtures.sh` each ship a failing+passing pair,
and each was absent from both CI and the freeze chain. The content-bundle case is the
sharpest: `check-content-bundle.py` runs in `pwa-deploy.yml` and in the chain, but the
runner proving it can detect a missing pack asset, a stale bundle, a review-state lie
or an unnamed bank ran in neither — so that gate could have gone vacuous and nothing
would have said so. The tutor evaluation (TM-66/REQ-AI-06) is the same shape, 206
checks with both directions asserted and no pipeline entry. The rehearsal runner is
deliberately different: it is a rehearsal tool, not a merge gate, so it is now declared
`# chain-excluded:` **with its reason** rather than wired in.

**What landed.** `scripts/check-traceability.py` (two clauses, `--self-test` with six
cases), `tests/gates/run_traceability_fixtures.sh` (five tree-level cases against a
throwaway copy of the repository's own documents, each asserting the failure names the
broken thing), both wired into the chain and `build.yml`, the two orphaned runners wired
into the chain and CI, and SPEC-12's index corrected. The chain grew 49 → 53.

**What is not claimed.** The gate proves the index is *complete*, not that each row's
evidence is *adequate* — a row naming a manual check with no gate passes clause A, which
is why the named gaps above are written as gaps. Clause B proves every runner is run or
explicitly excluded; it does not prove a wired runner actually discriminates, which is
what each runner's own fixture pair is for.

**The same sweep found one more.** Running the command paths referenced anywhere under
`docs/sprints/` against the tree turned up `tests/gates/test_vuln_gate.py`, named in
SPEC-10 and in an S45-02 acceptance box ticked as green — while the file on disk, in CI
and in the chain is `tests/gates/run_vuln_gate_fixtures.py`. A ticked box citing a
command that does not exist is the same defect as an unrun gate. Both references are
corrected. The two remaining unresolved paths are Sprint 06 *plan* entries
(`scripts/validate-parse-rate.py`, `scripts/validate-exam-codes.py`) — deliverables that
were planned, not files claimed to exist — so they are left as the historical record.

**The register behind it holds up.** SPEC-14's 14.2b asserted that its final-audit
runtime findings were "zero unowned rows" and nothing had checked that against the
tree, so the same method was turned on it: every row's passing condition was resolved
to the file implementing it and the runner executing it. All twelve resolve, and each
runner is a link in the green chain, so the gates are executed rather than merely
present. Two rows keep their named boundary — NET-07's native second-visit check is
prescribed-but-not-yet-executed, and CEF-01's evidence is a review record rather than
a test. The sweep also resolved all 21 path-like tokens named in SPEC-12 to real
files, so no gate path in the matrix dangles. Recorded in SPEC-14 14.2b.

This is a companion file rather than a section of `SPRINT-48.md` because that file
reached the 500-line document limit when S48-07 was opened, the same reason
[Sprint 47's retrospective](SPRINT-47-RETROSPECTIVE.md) is a companion file.
SPEC-11 11.10 asks for the retrospective, not for where it lives.

---

## Sprint Acceptance (October 25–28 California-ready definition, SPEC-00 00.5)

The NCA track presents the current official blueprint (sections, objective IDs, AOS 7.5 / AHV 11.0 / pc.7.5), 14 short lessons, 40 reviewed remapped-or-authored items, four tested deterministic scenarios, and a corrected objective map; beta labels survive only where a retained claim was checked. All SPEC-08/10 gates green at the frozen head, including the repaired vulnerability gate proven by its must-fail fixture.

**Where the sprint actually stands against that target.** Every structural piece
is in place and gated — the blueprint, the 14 lessons, the 40-item pilot, the four
scenarios, the remap inventory, the corrected companion surfaces, and 45/45 gates
green at `0e12fcd`. Three words in the paragraph above are not yet true, and no
row claims them:

- **"reviewed"** — all 180 NCA items are excluded by the RedEye gate; no item has
  a passing log. The pilot ships at `draft-preview`.
- **"beta labels survive only where a retained claim was checked"** — no claim was
  checked against the current guide, so the surviving beta labels are the
  *unexamined* ones, which is the honest state and not the finished one.
- **"frozen head"** — the head is recorded and reproducible, but the departure
  cutoff is unconfirmed (ASM-09), so the freeze is a candidate, not a closure.

Six sprint rows stand 🟡 on named gaps rather than ✅ on a target that has not
been met. S48-05 is ✅: its criteria are met, its gap is closed by a real browser
gate, and what that gate does not cover is named rather than implied. S48-07 and
S48-08 joined late — neither is an NCA row. C-09's licensing record had no other
home and the California trip is a place a licensing question gets asked; TM-75 was
a gate the package named three times and never implemented, and a gate that does
not run is the one defect a gate chain cannot report on itself.
