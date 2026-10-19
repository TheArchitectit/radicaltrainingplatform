# Item Hygiene — what the gate checks, and what it cannot say

**Status:** 🟢 Live. Enforced by `scripts/check-item-hygiene.py` (freeze chain,
Sprints 43-44), mirrored in `RadicalTrainingPlatform.Web/js/core/OptionShuffle.js`.

## What this is

Before an item reaches the practice view it must survive a deterministic,
offline check over the banks the compiler actually ships (`RELEASED_BANKS` in
`scripts/generate-study-content.py`). Nothing here needs a user, a server, or a
performance history — a local client has none of those. The checks are the ones
visible in the item text itself:

| Check | Why it matters |
|---|---|
| Duplicate option text | Two choices the learner cannot tell apart |
| "All / none of the above" | Position-dependent wording; shuffling would contradict the item |
| Letter-referencing stem or option | "Which option B?" cannot be shuffled safely |
| Missing answer key | The item cannot be graded |
| Impossible key | The key names no option; the item cannot be graded |
| Answer-position concentration (blocks at ≥20 single-answer keys) | A learner can farm apparent accuracy by always picking one letter |

Duplicate text, positional wording, missing key, and impossible key always fail.
Concentration fails only once a bank has at least 20 single-answer keys — below
that, one key moves the share by 5–20 points, so authored bias and a small
sample cannot be told apart; small banks are reported as advisories.

Two signals are advisory only:

* **Longest-option-is-correct** — a real authoring smell, but statistical;
  deciding whether an item is actually guessable is a content-review judgement,
  not a deterministic rule.
* **Legacy root-level banks** (`NCP-*`, `NCM-MCI-*`, `NCA-75-Part*.md`) — in
  review, not shipped. Measured so the debt is visible, never failed.

## The patterns

`scripts/check-item-hygiene.py` mirrors
`OptionShuffle.POSITIONAL_PATTERNS` exactly — the same definition decides both
whether an item may be shuffled and whether its text is position-dependent:

* `all of the above`, `none of the above`
* `both X` where X is a single letter A–F
* `options/answers/choices X` where X is a single letter A–F
* `<letter> [and/or,&] <letter>` where each side is a single letter

The last pattern once had no word boundary after its first letter, so under
case-insensitive matching the "f" of "for" and the "c" of "core" matched it:
*"for a development team"* was silently refused a shuffle. Both the JS and the
Python gate now require two single letters (`/\b[A-F]\b\s*(?:,|&|and|or)\s*[A-F]\b/i`,
Python mirror identical), so ordinary prose shuffles while genuine letter
references still refuse.

## What this cannot say

* It cannot say whether an item is *good*, only that it can be graded and
  shuffled without contradicting itself.
* It cannot calibrate difficulty or measure discrimination — those need a
  population's response data, which this product collects from no one.
* It cannot certify readiness — "certified"-style claims are forbidden by
  `CompletionPanel.FORBIDDEN_CLAIM_STRINGS` and by REQ-BRAND-02.
* It does not touch the legacy root banks: they stay unreleased and unreviewed.
  The gate measures them as an advisory so the debt is not forgotten.

## Running

```
python3 scripts/check-item-hygiene.py            # the shipped tree
python3 scripts/check-item-hygiene.py --root <tree>
python3 scripts/check-item-hygiene.py --self-test  # prove each check can fail
bash tests/gates/run_item_hygiene_fixtures.sh     # failing+passing pair per defect
```

Exit codes: 0 pass (advisories may still print), 1 at least one blocking
finding, 2 self-test failure.
