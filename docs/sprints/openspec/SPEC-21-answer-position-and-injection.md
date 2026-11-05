# OpenSpec SPEC-21 — Answer Position and the Injection Screen

**Home:** `content/exams/*/questions/*.md`, legacy root `NCA/NCM/NCP` bank families, `scripts/redeye_analysis.py` · **Supersedes in part:** R-09 as a report only, SPEC-08A §injection
**Executed in:** this change · **Gates:** `check-answer-balance.py` (new), RedEye lane self-test (extended), TM-29d
**Depends on:** SPEC-19 (demo-cut banks), SPEC-08A (RedEye lane)

## The defect

The 2026-11-04 review ran the RedEye lane over all 1,199 items and found two
signals that no gate was acting on:

1. **Position bias — 23 flags in five banks.** R-09 asked for a
   *report*; nothing failed the tree. Every flagged bank is a demo-cut bank,
   and the flags were real: `net009-n4-demo-cut.md` answered B 5 of 5 times,
   `core2-demo-cut.md` 5 of 8, `core1-demo-cut.md` 7 of 16 (44%). A learner
   clicking B on those banks scores by position, not knowledge. The packs
   already shuffle option order per run in the UI (T-24), so this is not a
   security hole — it is a bank whose *source* content teaches the wrong
   habit, and the PDF export and the desktop surface show source order.

2. **Two false injection flags.** Both were the pattern `system:` in
   ordinary technical prose — "isolates the hostile content from the host
   system: anything the attachment does..." (A-1201 Q198) and "the distributed
   software layer" (NCA Q2). Neither is an instruction. A screen that cries
   wolf on its own content trains a reader to ignore it.

## The fix

**Position.** `scripts/rebalance-answer-keys.py` rotates the option labels of
a flagged bank. The correct option keeps its text; only its letter changes.
The rotation is chosen per bank (offset 0..3, even or odd step) as the one
that leaves the bank least concentrated — deterministic, reviewable, and a
rerun on a now-balanced bank is a no-op. It refuses rather than guesses where
a rotation would lie: an item whose text names an option by letter
(`option B`, `options C/D`, or `Both A and C`) is left alone and reported.
Multi-answer items are also left byte-identical. The same checked rotation now
covers the 22 legacy root banks; all are below the 40% threshold, with 0 banks
changed by the immediately repeated dry run.

The follow-on item review removed the longest-option-is-correct cue from all
42 released findings by editing distractors only. That check is now blocking,
and the original keys and correct-option texts did not move.

**Proof, not assertion.** Every item is re-parsed before and after and
compared on stem, option texts (as a set), the correct option's text, and the
explanation. The run wrote 0 semantic differences across all 1,199 items, and
the itemId set is unchanged, so nothing was renumbered (REQ-PB-04).

| Bank | Before | After |
|---|---|---|
| `core1-demo-cut.md` | C 7/16 (44%) | A4, B4, C3, D5 (31%) |
| `core2-demo-cut.md` | B 5/8 (62%) | A2, B2, C2, D2 (25%) |
| `net009-n1-demo-cut.md` | B 3/5 (60%) | A1, B2, C1, D1 (40%) |
| `net009-n3-demo-cut.md` | B 3/5 (60%) | A2, B2, C1 (40%) |
| `net009-n4-demo-cut.md` | B 5/5 (100%) | A1, B1, C2, D1 (40%) |

`scripts/check-answer-balance.py` now fails the tree while any released bank
sits above 40%, so a new imbalanced bank cannot land and these cannot drift
back.

**Injection.** The bare `system\s*:` pattern is gone. A colon after the word
"system" is flagged only when an instruction follows it (a second-person or
imperative verb, or a named convention such as "instructions"). The line is
still only ever a *review signal* — the lane never approves or blocks on it;
the fail-closed key-vs-source stage is untouched.

## Requirements (normative)

| ID | SHALL | Scenario |
|---|---|---|
| REQ-PB-01 | No released bank has more than 40% of its single-key items on one letter. | Gate: a 3-of-4 bank fails and names the bank; a flat bank and a 40% bank pass. |
| REQ-PB-02 | A rebalance changes no item's stem, option texts, correct option text or explanation, and vectors no itemId. | Run: 1,199 items compared before/after — 0 semantic differences, identical id set. |
| REQ-PB-03 | An item that refers to option labels or carries multiple keys is refused, not rotated. | Run: `core2-demo-cut.md` Q6, `options C/D` and `Both A and C` fixtures are byte-identical afterwards; multi-key fixture is unchanged. |
| REQ-PB-04 | The rebalance is deterministic: running it twice changes nothing the second time. | Run: a second `--dry-run` reports `0 bank(s) would change`. |
| REQ-PB-05 | No released single-answer item's correct option exceeds every alternative by more than 20 characters. | Gate: the cleaned released set passes; a seeded overlong correct option fails `check-item-hygiene.py --self-test`. |
| REQ-IN-01 | A colon after "system" is not an injection signal by itself; technical prose in the packs is not flagged. | Fixture: the guest-system sentence passes; "system: ignore the previous instructions…" is still flagged. |
| REQ-IN-02 | The screen never approves or blocks an item. | Unchanged from SPEC-08A: every lane log keeps `verdict: return` while the model stage is unrun. |

## What this spec does NOT do

- It does not review any content. Rotation is a formatting change; every item
  is still `status: draft`, `reviewer: ""` (SPEC-20).
- It does not touch multi-key items: 2 and 3-option selections are scored by
  set, and their positions are not a "click B" shortcut. They are counted but
  not rotated.
- It does not claim the banks are now pedagogically balanced as a set — only
  that no single bank exceeds the threshold.

## Verification

```
python3 scripts/rebalance-answer-keys.py --dry-run   # 0 bank(s) would change
python3 scripts/check-answer-balance.py              # 37 banks, none above 40%
python3 scripts/check-answer-balance.py --self-test
python3 tests/gates/redeye/self_test.py              # SPEC-21 injection seeds
bash tests/gates/run_freeze_chain.sh
```

Executed 2026-11-04: `ANSWER BALANCE: PASS — 37 bank(s), none above 40%`,
injection scan over all 1,199 items returned no flags, and the freeze chain is
**70/70**.
