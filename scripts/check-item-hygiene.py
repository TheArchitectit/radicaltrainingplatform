#!/usr/bin/env python3
"""Deterministic item hygiene for the banks that ship (Sprints 43-44).

Sprints 43-44 were written as psychometrics: calibrate difficulty from user
performance, measure discrimination, and certify readiness with a confidence
interval. None of that is possible for a local client. Calibration needs
response data from a population; this product collects nothing from anyone and
sends nothing anywhere. A "certified" badge is additionally forbidden by
REQ-BRAND-02 and by `CompletionPanel.FORBIDDEN_CLAIM_STRINGS`.

What *is* possible offline is the part of item review that needs no users at
all: defects visible in the item text itself. This gate checks the banks whose
items actually reach the PWA (the compiler's `RELEASED_BANKS`) for:

  * duplicate option text            — two choices that cannot be told apart
  * "all/none of the above"          — position-dependent wording
  * letter-referencing stems/options — "which option B" cannot shuffle
  * a missing or impossible key      — the item is unanswerable or ungradeable
  * answer-position concentration    — one letter dominating a bank

The first four block. Concentration blocks only for banks with at least
MIN_AUDIT_ITEMS single-answer keys; below that, one key moves the share by
5-20 points, so the threshold cannot tell authored bias from a small sample.
Small banks are reported, not failed.

Two signals are advisory and never fail:

  * the "longest option is correct" cue — a real authoring smell, but a
    statistical one, and deciding whether an item is actually guessable is a
    content-review judgement, not a deterministic rule;
  * the legacy root-level banks (NCP/NCM/NCA Part files), which are in review
    and are not shipped into the PWA. They are measured so the debt is visible
    rather than forgotten.

Usage:
  python3 scripts/check-item-hygiene.py
  python3 scripts/check-item-hygiene.py --root <tree>
  python3 scripts/check-item-hygiene.py --self-test

Exit codes:
  0 — blocking checks pass (advisories may still be reported)
  1 — at least one blocking finding
  2 — self-test assertion failed
"""
import argparse
import collections
import importlib.util
import pathlib
import re
import sys
import tempfile

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent

# One source of truth with the compiler and the existing R-09 report: the
# released-bank list, the parser and the 40% threshold all come from them.
def _load(module_name, filename):
    path = pathlib.Path(__file__).with_name(filename)
    spec = importlib.util.spec_from_file_location(module_name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


COMPILER = _load("rtp_study_content", "generate-study-content.py")
KEY_REPORT = _load("rtp_key_report", "report-key-distribution.py")

CONCENTRATION_THRESHOLD = KEY_REPORT.CONCENTRATION_THRESHOLD
MIN_AUDIT_ITEMS = 20

# Mirrors OptionShuffle.POSITIONAL_PATTERNS — wording whose meaning depends on
# where an option sits or which letter it was authored under.
POSITIONAL_PATTERNS = [
    (re.compile(r"\ball of the above\b", re.I), "all of the above"),
    (re.compile(r"\bnone of the above\b", re.I), "none of the above"),
    (re.compile(r"\bboth\s+[A-F]\b", re.I), "both <letter>"),
    (re.compile(r"\b(?:options?|answers?|choices?)\s+[A-F]\b", re.I),
     "options/answers/choices <letter>"),
    # Both letters must be single letters: without the trailing boundary the
    # first `[A-F]` matched the "f" of "for" and the "c" of "core" under re.I,
    # flagging "for a development team" as a letter reference.
    (re.compile(r"\b[A-F]\b\s*(?:,\s*(?:and\s+)?|&|\band\b|\bor\b)\s*[A-F]\b", re.I),
     "<letter> and <letter>"),
]

LONGEST_MARGIN = 20  # characters


def _normalise(text):
    return re.sub(r"\s+", " ", text.lower()).strip(" .")


def analyse_item(rel, item, failures, advisories):
    """Structural checks for one item. Appends blocking findings; returns the
    longest-option cue (True/False) for the caller to summarise."""
    number = item.get("number", "?")
    options = item.get("options") or {}
    keys = item.get("keys") or []
    where = f"{rel}/{number}"

    if len(options) < 2:
        failures.append(f"{where}: has {len(options)} option(s) — an item with "
                        f"fewer than two options is not a choice")
    if not keys:
        failures.append(f"{where}: has no answer key — the item cannot be "
                        f"graded")
    for letter in keys:
        if letter not in options:
            failures.append(f"{where}: answer key {letter!r} names no option — "
                            f"the item cannot be graded")

    seen = {}
    for letter, text in options.items():
        norm = _normalise(text)
        if norm in seen:
            failures.append(f"{where}: options {seen[norm]} and {letter} have "
                            f"the same text {text.strip()!r} — the learner "
                            f"cannot tell the choices apart")
        else:
            seen[norm] = letter

    haystacks = [("stem", item.get("stem", ""))]
    haystacks += [(f"option {letter}", text) for letter, text in options.items()]
    for where_text, text in haystacks:
        for pattern, label in POSITIONAL_PATTERNS:
            if pattern.search(text):
                failures.append(f"{where}: {where_text} uses position-dependent "
                                f"wording ({label}) — the options are shuffled at "
                                f"presentation, so this item would contradict "
                                f"itself")
                break

    if len(keys) == 1 and keys[0] in options:
        correct = options[keys[0]].strip()
        others = [v.strip() for k, v in options.items() if k != keys[0]]
        if others and len(correct) > max(len(o) for o in others) + LONGEST_MARGIN:
            return True
    return False


def audit_released(root):
    """Blocking checks over the banks the compiler ships, plus advisories."""
    failures = []
    advisories = []
    banks = 0
    items = 0
    longest = 0

    for exam, bank_names in sorted(COMPILER.RELEASED_BANKS.items()):
        for bank in bank_names:
            path = pathlib.Path(root) / "content" / "exams" / exam / "questions" / bank
            rel = path.relative_to(root).as_posix()
            if not path.is_file():
                failures.append(f"{rel}: a released bank does not exist under "
                                f"content/exams/ — the compiler will refuse to "
                                f"build, but this gate names which bank")
                continue
            banks += 1
            parsed = COMPILER.parse_bank(path)
            if not parsed:
                failures.append(f"{rel}: contains no '### Qn' items")
                continue
            items += len(parsed)
            for item in parsed:
                if analyse_item(rel, item, failures, advisories):
                    longest += 1

            single = [i["keys"][0] for i in parsed if len(i["keys"]) == 1]
            counts = collections.Counter(single)
            if len(single) >= MIN_AUDIT_ITEMS:
                letter, count = max(counts.items(), key=lambda kv: kv[1])
                share = count / len(single)
                if share > CONCENTRATION_THRESHOLD:
                    failures.append(
                        f"{rel}: {count}/{len(single)} single-answer keys "
                        f"({share:.1%}) are {letter!r}, over the "
                        f"{CONCENTRATION_THRESHOLD:.0%} threshold — a learner "
                        f"can farm apparent accuracy by position")
            elif single:
                letter, count = max(counts.items(), key=lambda kv: kv[1])
                share = count / len(single)
                advisories.append(
                    f"{rel}: {len(single)} single-answer key(s) is below the "
                    f"{MIN_AUDIT_ITEMS}-item audit size; dominant {letter!r} at "
                    f"{share:.0%} is reported, not failed")

    return failures, advisories, banks, items, longest


def audit_legacy(root):
    """Advisory-only measurement of the root-level banks in review."""
    files = [p for p in sorted(pathlib.Path(root).glob("*.md"))
             if not KEY_REPORT.should_skip(p)]
    banks = 0
    items = 0
    over = 0
    for path in files:
        parsed = COMPILER.parse_bank(path)
        if not parsed:
            continue
        banks += 1
        items += len(parsed)
        single = [i["keys"][0] for i in parsed if len(i["keys"]) == 1]
        if not single:
            continue
        counts = collections.Counter(single)
        share = max(counts.values()) / len(single)
        if share > CONCENTRATION_THRESHOLD:
            over += 1
    return banks, items, over


def run_checks(root):
    failures, advisories, banks, items, longest = audit_released(root)
    legacy_banks, legacy_items, legacy_over = audit_legacy(root)
    return {
        "failures": failures,
        "advisories": advisories,
        "banks": banks,
        "items": items,
        "longest": longest,
        "legacy": (legacy_banks, legacy_items, legacy_over),
    }


# ── fixtures ────────────────────────────────────────────────────────────────
# Every released bank must exist in the fixture tree, because the gate audits
# the compiler's list. The banks are small and balanced, except one 24-item bank
# that exercises the concentration audit in its passing direction. The legacy
# root bank is deliberately 100% A, proving advisory findings do not block.

OPTIONS = ("alpha", "bravo", "delta", "gamma")
STEMS = ("Identify the best answer.", "Choose the correct statement.")


def _item(number, key, options=OPTIONS, stem=None):
    stem = stem or STEMS[number % len(STEMS)]
    lines = [f"### Q{number}", stem]
    lines += [f"- {letter}) {text}" for letter, text in zip("ABCD", options)]
    lines.append(f"**Answer: {key}**")
    lines.append("Explanation for review.")
    lines.append("---")
    return "\n".join(lines) + "\n"


def _bank(count, key_cycle="ABCD"):
    return "".join(_item(i + 1, key_cycle[i % len(key_cycle)])
                   for i in range(count))


def _fixture_banks():
    banks = {}
    for exam, names in COMPILER.RELEASED_BANKS.items():
        for name in names:
            banks[f"content/exams/{exam}/questions/{name}"] = _bank(8)
    # One bank at audit size, balanced 25% per letter.
    banks["content/exams/AZ-104/questions/az104-beginner.md"] = _bank(24)
    # A legacy bank over threshold: advisory, never a failure.
    banks["legacy-bank.md"] = _bank(6, key_cycle="A")
    return banks


def _write_tree(dest):
    for rel, text in _fixture_banks().items():
        path = pathlib.Path(dest) / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8")


RELEASED_A = "content/exams/COMPTIA-A-1201/questions/core1-a2-fixtures.md"
AZ_BANK = "content/exams/AZ-104/questions/az104-beginner.md"

# (path, anchor, replacement, the defect this reintroduces)
MUTATIONS = [
    (RELEASED_A, "- B) bravo", "- B) alpha",
     "two options carry the same text"),
    (RELEASED_A, "- D) gamma", "- D) All of the above",
     "an option is 'all of the above'"),
    (RELEASED_A, "Identify the best answer.", "Which option B is correct?",
     "the stem refers to an option letter"),
    (RELEASED_A, "**Answer: A**", "**Answer: E**",
     "the answer key names an option that does not exist"),
    (RELEASED_A, "**Answer: A**", "",
     "the item has no answer key at all"),
    (AZ_BANK, "__OVERWRITE__", _bank(20, key_cycle="A"),
     "a 20-item bank puts every key on A"),
]

DELETE_MUTATION = (
    "content/exams/NCA-75/questions/nca75-pilot.md",
    "a released bank is deleted",
)


def self_test():
    failures = []

    for finding in run_checks(REPO_ROOT)["failures"]:
        failures.append(f"the shipped tree does not pass its own checks: {finding}")

    with tempfile.TemporaryDirectory() as td:
        _write_tree(td)
        result = run_checks(td)
        for finding in result["failures"]:
            failures.append(f"the clean fixture does not pass: {finding}")
        # The 6-item all-A legacy bank is over threshold and must be measured
        # there — and, being unshipped, must not have blocked.
        if result["legacy"] != (1, 6, 1):
            failures.append(f"the legacy advisory bank was not measured: got "
                            f"(banks, items, over) = {result['legacy']}, "
                            f"expected (1, 6, 1)")

    for rel, needle, replacement, description in MUTATIONS:
        with tempfile.TemporaryDirectory() as td:
            _write_tree(td)
            target = pathlib.Path(td) / rel
            text = target.read_text(encoding="utf-8")
            if needle == "__OVERWRITE__":
                target.write_text(replacement, encoding="utf-8")
            elif needle not in text:
                failures.append(f"fixture anchor not found in {rel}: {needle!r} "
                                f"({description})")
                continue
            else:
                target.write_text(text.replace(needle, replacement, 1),
                                  encoding="utf-8")
            if not run_checks(td)["failures"]:
                failures.append(f"the checker passed a mutated {rel} ({description})")

    with tempfile.TemporaryDirectory() as td:
        _write_tree(td)
        (pathlib.Path(td) / DELETE_MUTATION[0]).unlink()
        if not run_checks(td)["failures"]:
            failures.append(f"the checker passed a tree where {DELETE_MUTATION[1]}")

    with tempfile.TemporaryDirectory() as td:
        if not run_checks(td)["failures"]:
            failures.append("the checker passed an empty tree")

    if failures:
        print("ITEM HYGIENE SELF-TEST: FAIL")
        for finding in failures:
            print(f"  {finding}")
        return 2
    print(f"ITEM HYGIENE SELF-TEST: PASS — shipped tree + clean fixture + "
          f"{len(MUTATIONS) + 1} seeded defects, each caught")
    return 0


def main():
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--root", type=pathlib.Path, default=None,
                        help="tree to check (default: the repository)")
    parser.add_argument("--self-test", action="store_true",
                        help="prove each check can fail")
    args = parser.parse_args()

    if args.self_test:
        return self_test()

    root = args.root if args.root is not None else REPO_ROOT
    if not (pathlib.Path(root) / "content" / "exams").is_dir():
        print(f"ITEM HYGIENE CHECK: FAIL — no content/exams under {root}",
              file=sys.stderr)
        return 1

    result = run_checks(root)
    legacy_banks, legacy_items, legacy_over = result["legacy"]

    if result["failures"]:
        print("ITEM HYGIENE CHECK: FAIL")
        for finding in result["failures"]:
            print(f"  {finding}")
        return 1

    print(f"ITEM HYGIENE CHECK: PASS — {result['banks']} released bank(s), "
          f"{result['items']} item(s); no duplicate options, no position-"
          f"dependent wording, no ungradeable keys, answer positions within "
          f"the {CONCENTRATION_THRESHOLD:.0%} threshold wherever the bank is "
          f"large enough to audit")
    for advisory in result["advisories"]:
        print(f"  advisory: {advisory}")
    if legacy_banks:
        print(f"  advisory: {legacy_banks} legacy bank(s) ({legacy_items} item(s)) "
              f"in review; {legacy_over} over the "
              f"{CONCENTRATION_THRESHOLD:.0%} threshold and not shipped — "
              f"see scripts/report-key-distribution.py")
    if result["longest"]:
        print(f"  advisory: longest-option-is-correct cue on "
              f"{result['longest']} of {result['items']} released item(s) — "
              f"a review signal, not a grading rule")
    return 0


if __name__ == "__main__":
    sys.exit(main())
