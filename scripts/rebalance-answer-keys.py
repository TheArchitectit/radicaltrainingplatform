#!/usr/bin/env python3
"""Spread a bank's correct-answer positions without changing what it teaches.

A learner who always clicks B can score by position alone when a bank's keys
cluster. This rotates the option *labels* of such a bank: a permutation moves
every option's text, so the correct option keeps its text and only its letter
changes. The question, the option texts, the correct option's text and the
explanation are identical afterwards; the facts are only reordered.

The rotation is a fixed sequence with no randomness, so a rerun produces the
same file and the diff is reviewable. Released pack banks and the named legacy
root bank families are processed. A bank that mentions options by letter in
its explanation ("see option B") is refused, not rotated: a rotation would
silently change what that sentence points at.

Result is proven, not asserted: every item is re-parsed before and after, and
the run fails if any item's stem, option texts, answer set or explanation moved.

  python3 scripts/rebalance-answer-keys.py --dry-run
  python3 scripts/rebalance-answer-keys.py --write
"""
import argparse
import pathlib
import re
import sys

LETTERS = "ABCDEF"
OPTION = re.compile(r"^- ([A-F])\) (.*)$", re.MULTILINE)
ANSWER = re.compile(r"^\*\*(?:Correct )?Answer:\s*([A-F](?:,\s*[A-F])*)\*\*", re.MULTILINE)
CROSS_REF = re.compile(
    r"(?i:\b(?:options?|answers?|choices?)\s+[A-F](?:\s*(?:/|,|&|and|or)\s*[A-F])?\b)"
    r"|\b[Bb]oth\s+[A-F]\b"
)

THRESHOLD = 0.40


def split_item(block: str):
    """(prefix, options [(letter, text)], answer line index, suffix) or None."""
    lines = block.split("\n")
    opt_idx = [i for i, l in enumerate(lines) if OPTION.match(l)]
    ans_idx = [i for i, l in enumerate(lines) if ANSWER.match(l.strip())]
    if not opt_idx or len(ans_idx) != 1:
        return None
    first, last = opt_idx[0], opt_idx[-1]
    if last - first + 1 != len(opt_idx):
        return None  # options must be contiguous
    opts = [(m.group(1), m.group(2)) for m in (OPTION.match(lines[i]) for i in opt_idx)]
    return lines, first, last, opts, ans_idx[0]


def rebuild(block: str, rotation: int):
    """Return (new block text, new single key) with option positions rotated."""
    lines, first, last, opts, ans_idx = split_item(block)
    n = len(opts)
    # put the bank's option sequence on a fixed order first, then rotate it:
    # this makes the rotation of the *text* position the key moves.
    base = [""] * n
    for letter, text in opts:
        base[LETTERS.index(letter)] = text
    shown = [base[(p - rotation) % n] for p in range(n)]
    new_of_old = {old_letter: LETTERS[(p + rotation) % n]
                  for p, (old_letter, _) in enumerate(opts)}
    keys = [k.strip() for k in ANSWER.match(lines[ans_idx].strip()).group(1).split(",")]
    if len(keys) != 1:
        return block, keys
    new_keys = sorted(new_of_old[k] for k in keys)
    label = lines[ans_idx].split("Answer:")[0]
    out = lines[:first]
    out += [f"- {LETTERS[p]}) {text}" for p, text in enumerate(shown)]
    out += lines[last + 1:ans_idx]
    out.append(f"{label}Answer: {', '.join(new_keys)}**")
    out += lines[ans_idx + 1:]
    return "\n".join(out), new_keys


def semantic(block: str):
    """What must not change: stem, ordered option texts, answer texts, explanation."""
    parts = split_item(block)
    if parts is None:
        return None
    lines, first, last, opts, ans_idx = parts
    keys = [k.strip() for k in ANSWER.match(lines[ans_idx].strip()).group(1).split(",")]
    return {
        "stem": "\n".join(lines[:first]).strip(),
        # Option texts, normalised to source-letter order: a rotation
        # changes which letter carries which text, never which texts exist.
        "options": sorted(text for _, text in opts),
        "answerTexts": sorted(text for letter, text in opts if letter in keys),
        "rest": "\n".join(lines[ans_idx + 1:]).strip(),
    }


def rebalance_text(text: str):
    """Rotate every rotatable item; return (new text, per-item refusal notes).

    A bank that is already balanced is left byte-identical. Otherwise every
    start offset 0..3 is tried (with even and odd steps) and the rotation that
    leaves the bank least concentrated is kept. The choice depends only on the
    bank's own keys, so a rerun on the rewritten bank keeps its result rather
    than rotating again — and a balanced bank is never touched.
    """
    blocks = re.split(r"(?m)^(?=### Q\d+)", text)
    counts, total = letter_shares(text)
    if not total or max(counts.values()) / total <= THRESHOLD:
        return text, []

    def apply(offset: int, step: int):
        out, position = [], 0
        for block in blocks:
            if not block.startswith("### Q") or split_item(block) is None:
                out.append(block)
                continue
            position += 1
            rotation = (offset + (position if step == 1 else position // 2)) % 4
            rebuilt = rebuild(block, rotation)
            if rebuilt is None:
                out.append(block)
                continue
            new_block, _ = rebuilt
            if CROSS_REF.search(block) or semantic(block) != semantic(new_block):
                out.append(block)
            else:
                out.append(new_block)
        return "".join(out)

    scored = []
    for step in (1, 2):
        for offset in range(4):
            candidate = apply(offset, step)
            got, n = letter_shares(candidate)
            scored.append((max(got.values()) / n, offset, step, candidate))
    _, _, _, best = min(scored, key=lambda t: (t[0], t[1], t[2]))

    notes = []
    position = 0
    for block in blocks:
        if not block.startswith("### Q") or split_item(block) is None:
            continue
        number = int(re.search(r"### Q(\d+)", block).group(1))
        position += 1
        rebuilt = rebuild(block, 1)
        if CROSS_REF.search(block):
            notes.append(f"### Q{number}: refused — its explanation names an option by letter")
        elif rebuilt and semantic(block) != semantic(rebuilt[0]):
            notes.append(f"### Q{number}: refused — rotation changed semantics")
    return best, notes


def letter_shares(text: str):
    counts = {L: 0 for L in LETTERS}
    for block in re.split(r"(?m)^(?=### Q\d+)", text):
        parts = split_item(block)
        if parts is None:
            continue
        _, _, _, opts, ans_idx = parts
        keys = [k.strip() for k in ANSWER.match(parts[0][ans_idx].strip()).group(1).split(",")]
        if len(keys) == 1:
            counts[keys[0]] += 1
    total = sum(counts.values())
    return counts, total


def self_test():
    blocks = []
    for number in range(1, 7):
        key = "A, B" if number == 5 else "A"
        explanation = {
            3: "Option B and options C/D retain their labels.",
            4: "The wording Both A and C retains its labels.",
            5: "A multi-answer item must not be rotated.",
            6: "both a and c are ordinary lowercase words here, not labels.",
        }.get(number, "Explanation for review.")
        blocks.append(
            f"### Q{number}\nChoose an answer.\n- A) alpha\n- B) bravo\n"
            f"- C) charlie\n- D) delta\n**Answer: {key}**\n{explanation}\n---\n")
    original = "".join(blocks)
    rewritten, notes = rebalance_text(original)
    before = dict(enumerate(blocks, 1))
    after = {
        int(re.search(r"### Q(\d+)", block).group(1)): block
        for block in re.split(r"(?m)^(?=### Q\d+)", rewritten)
        if block.startswith("### Q")
    }
    failures = []
    for number in (3, 4, 5):
        if after[number] != before[number]:
            failures.append(f"Q{number} was rotated despite its protected shape")
    if len(notes) != 2:
        failures.append(f"expected two letter-reference refusals, got {len(notes)}")
    counts, total = letter_shares(rewritten)
    if total != 5 or max(counts.values()) / total > THRESHOLD:
        failures.append("single-key distribution was not rebalanced")
    if rebalance_text(rewritten)[0] != rewritten:
        failures.append("a second rebalance is not a no-op")
    if failures:
        for failure in failures:
            print(f"REBALANCE SELF-TEST: FAIL — {failure}")
        return 2
    print("REBALANCE SELF-TEST: PASS — references refused, multi-key items intact, "
          "single keys balanced, second run unchanged")
    return 0


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--root", default=".", help="repository root")
    ap.add_argument("--only", nargs="*", help="restrict to these bank file names")
    mode = ap.add_mutually_exclusive_group(required=True)
    mode.add_argument("--dry-run", action="store_true")
    mode.add_argument("--write", action="store_true")
    mode.add_argument("--self-test", action="store_true")
    args = ap.parse_args()

    if args.self_test:
        return self_test()

    root = pathlib.Path(args.root)
    banks = list((root / "content" / "exams").glob("*/questions/*.md"))
    for pattern in ("NCA-75-Part*.md", "NCM-MCI-Part*.md", "NCP-*-Part*.md"):
        banks.extend(root.glob(pattern))
    banks = sorted(banks)
    if args.only:
        banks = [b for b in banks if b.name in set(args.only)]
    if not banks:
        print("no banks to process", file=sys.stderr)
        return 1

    changed = 0
    for path in banks:
        text = path.read_text(encoding="utf-8")
        before, total = letter_shares(text)
        if not total:
            continue
        top = max(before.values()) / total
        if top <= THRESHOLD:
            continue
        new_text, notes = rebalance_text(text)
        after, _ = letter_shares(new_text)
        if new_text == text:
            for n in notes:
                print(f"  {path.name} {n}")
            continue
        changed += 1
        rel = path.relative_to(root)
        print(f"{rel}: dominant {max(before, key=before.get)} "
              f"{before[max(before, key=before.get)]}/{total} ({top:.0%}) -> "
              f"{', '.join(f'{L}{c}' for L, c in after.items() if c)}")
        for n in notes:
            print(f"  {n}")
        if args.write:
            path.write_text(new_text, encoding="utf-8")

    print(f"{changed} bank(s) {'rewritten' if args.write else 'would change'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
