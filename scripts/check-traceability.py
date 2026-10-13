#!/usr/bin/env python3
"""TM-75 — the traceability doc gate (SPEC-12 / SPEC-10).

SPEC-12 names TM-75 as the gate that keeps its own index honest, in two places:

    "Every REQ- and R- identifier in SPEC-02 through SPEC-10 maps to at least
     one TM row ... an unmapped requirement fails the doc gate (TM-75)."

    | TM-75 | Every gate in this package lists its failing+passing fixture in
    |         the release evidence | doc gate | SPEC-10 |

Neither clause had an implementation. A gate named in three documents that no
script runs is the same defect class as a vacuous check: the claim reads as
enforced and nothing enforces it. This is that gate.

It asserts two things.

  A. Requirement index. Every REQ-/R- identifier declared in
     docs/sprints/openspec/SPEC-02..SPEC-10 must appear in some TM row's
     Requirements column in SPEC-12. The table writes ranges and lists in
     shorthand (`REQ-MAN-01/02/05`, `REQ-REV-01..06`), so those are expanded
     before comparing. An identifier with no row is named individually.

  B. Fixture-runner wiring. Every fixture runner under tests/gates/ —
     `run_*_fixtures.sh`, `run_*_fixtures.py`, `run_tutor_eval.sh` — must be
     either invoked by tests/gates/run_freeze_chain.sh or declared there as

         # chain-excluded: <path> — <reason>

     A runner in neither place ships a failing+passing pair that nothing runs,
     which leaves the SPEC-16 rule ("every gate ships failing and passing
     fixtures") unenforced for that gate: it could go vacuous and no chain
     entry would notice. An exclusion must carry a reason, and an exclusion
     naming a runner that no longer exists is a violation too — otherwise the
     register rots into a blanket exemption.

Usage:
  python3 scripts/check-traceability.py [--root PATH]

Exit codes:
  0 — index complete, every runner wired or excluded-with-reason
  1 — one or more violations (each named)
  2 — fixture assertion failed (--self-test)
"""
import argparse
import pathlib
import re
import sys
import tempfile

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent
OPENSPEC = pathlib.Path("docs") / "sprints" / "openspec"
CHAIN = pathlib.Path("tests") / "gates" / "run_freeze_chain.sh"
GATES_DIR = pathlib.Path("tests") / "gates"

# SPEC-02..SPEC-10 declare the requirements; SPEC-12 is the matrix that must
# cover them. SPEC-01 is deliberately outside both: the index's claim is scoped
# to SPEC-02 through SPEC-10.
DECLARING = ("SPEC-02", "SPEC-03", "SPEC-04", "SPEC-05", "SPEC-06",
             "SPEC-07", "SPEC-08", "SPEC-08A", "SPEC-09", "SPEC-10")
MATRIX = "SPEC-12"

# run_freeze_chain.sh is the runner itself, not a gate it runs.
CHAIN_SELF = "run_freeze_chain.sh"
RUNNER_RE = re.compile(r"^run_(?:.*_fixtures\.(?:sh|py)|tutor_eval\.sh)$")
EXCLUDED_RE = re.compile(r"^\s*#\s*chain-excluded:\s*(\S+)\s*(?:—|-{1,2})\s*(\S.*?)\s*$")

# `REQ-MAN-01/02/05` is a list; `REQ-REV-01..06` is an inclusive range; `R-05`
# is a bare finding ID. One cluster is a prefix plus a number plus a tail of
# `/NN` and `..NN` segments.
CLUSTER_RE = re.compile(r"\b((?:REQ-[A-Z]+-)|(?:R-)|(?:TM-))(\d+)((?:[/.]{1,2}\d+)*)")
ID_RE = re.compile(r"\b(?:REQ-[A-Z]+-\d+[a-z]?|R-\d{2})\b")


def expand(text):
    """Every REQ-/R-/TM- identifier in `text`, with list and range shorthand.

    `REQ-MAN-01/02/05` -> REQ-MAN-01, REQ-MAN-02, REQ-MAN-05
    `REQ-REV-01..06`   -> REQ-REV-01 .. REQ-REV-06
    """
    out = set()
    for m in CLUSTER_RE.finditer(text):
        prefix, tail = m.group(1), m.group(3)
        nums = [int(m.group(2))]
        for seg in re.finditer(r"(\.\.|/)(\d+)", tail):
            value = int(seg.group(2))
            if seg.group(1) == "..":
                nums.extend(range(nums[-1] + 1, value + 1))
            else:
                nums.append(value)
        for n in nums:
            out.add(f"{prefix}{n:02d}")
    return out


def declared_ids(root):
    """Requirement identifiers declared by SPEC-02..SPEC-10, by file."""
    found = {}
    for stem in DECLARING:
        matches = sorted(root.joinpath(OPENSPEC).glob(f"{stem}-*.md"))
        if not matches:
            continue
        text = "".join(p.read_text(encoding="utf-8") for p in matches)
        ids = {i for i in ID_RE.findall(text) if not i.startswith("TM-")}
        found[stem] = ids
    return found


def covered_ids(root):
    """Requirement identifiers named in SPEC-12's TM table Requirements cells."""
    matches = sorted(root.joinpath(OPENSPEC).glob(f"{MATRIX}-*.md"))
    covered = set()
    for path in matches:
        for line in path.read_text(encoding="utf-8").splitlines():
            if not line.startswith("| TM-"):
                continue
            cells = [c.strip() for c in line.strip().strip("|").split("|")]
            if len(cells) < 4:
                continue
            covered |= {x for x in expand(cells[3]) if not x.startswith("TM-")}
    return covered


def runners(root):
    """Fixture runners shipped under tests/gates/ (top level only)."""
    gates = root / GATES_DIR
    if not gates.is_dir():
        return {}
    found = {}
    for path in sorted(gates.iterdir()):
        if not path.is_file() or not RUNNER_RE.match(path.name):
            continue
        if path.name == CHAIN_SELF:
            continue
        found[path.name] = f"tests/gates/{path.name}"
    return found


def chain_state(root):
    """(wired paths, exclusions, exclusions lacking a reason) from the chain."""
    chain = root / CHAIN
    if not chain.is_file():
        return None
    text = chain.read_text(encoding="utf-8")
    wired = set()
    for line in text.splitlines():
        if line.lstrip().startswith("#"):
            continue
        for m in re.finditer(r"tests/gates/(run_[A-Za-z0-9_]+\.(?:sh|py))", line):
            wired.add(m.group(1))
    exclusions = {}
    reasonless = []
    for line in text.splitlines():
        m = EXCLUDED_RE.match(line)
        if not m:
            # A chain-excluded line that carries no reason at all.
            bare = re.match(r"^\s*#\s*chain-excluded:\s*(\S+)\s*$", line)
            if bare:
                reasonless.append(bare.group(1))
            continue
        exclusions[pathlib.PurePath(m.group(1)).name] = m.group(2)
    return wired, exclusions, reasonless


def check(root):
    """Return a list of violation strings; empty means clean."""
    problems = []

    declared = declared_ids(root)
    if not declared:
        problems.append(
            f"no declaring documents found under {OPENSPEC}/SPEC-02..SPEC-10 "
            f"(run with --root pointing at a repository tree)")
    covered = covered_ids(root)
    all_declared = set().union(*declared.values()) if declared else set()
    for req in sorted(all_declared - covered):
        problems.append(
            f"unmapped requirement: {req} is declared in "
            f"{OPENSPEC}/SPEC-02..SPEC-10 but no TM row in {MATRIX} names it")

    state = chain_state(root)
    if state is None:
        problems.append(f"missing {CHAIN} — the runner register cannot be read")
        return problems
    wired, exclusions, reasonless = state

    for name in reasonless:
        problems.append(
            f"exclusion without a reason: '{name}' is declared chain-excluded "
            f"with no explanation")

    for name in sorted(runners(root)):
        if name in wired:
            continue
        if name in exclusions:
            continue
        problems.append(
            f"unwired fixture runner: tests/gates/{name} ships a "
            f"failing+passing pair that {CHAIN} never runs and never "
            f"declares as chain-excluded")

    known = set(runners(root))
    for name in sorted(exclusions):
        if name not in known:
            problems.append(
                f"stale exclusion: {CHAIN} declares '{name}' chain-excluded, "
                f"but no such runner exists under tests/gates/")

    return problems


def main():
    ap = argparse.ArgumentParser(description="TM-75 traceability doc gate")
    ap.add_argument("--root", default=str(REPO_ROOT),
                    help="tree to check (fixtures pass a fixture tree)")
    ap.add_argument("--self-test", action="store_true",
                    help="assert the gate discriminates; exit 2 on failure")
    args = ap.parse_args()

    root = pathlib.Path(args.root).resolve()

    if args.self_test:
        sys.exit(self_test())

    problems = check(root)
    if problems:
        print(f"TRACEABILITY: FAIL — {len(problems)} problem(s)")
        for p in problems:
            print(f"  - {p}")
        return 1

    declared = declared_ids(root)
    total = len(set().union(*declared.values())) if declared else 0
    print(f"TRACEABILITY: PASS — {total} requirement identifier(s) across "
          f"{len(declared)} declaring spec(s) all map to a TM row; every "
          f"fixture runner is wired into the chain or excluded with a reason")
    return 0


def self_test():
    """Build throwaway trees and assert the gate discriminates on each."""
    def write_tree(base, declaring_text, matrix_rows, chain_text, runner_names):
        spec = base / OPENSPEC
        spec.mkdir(parents=True)
        (spec / "SPEC-04-aplus.md").write_text(declaring_text, encoding="utf-8")
        (spec / "SPEC-12-test-matrix.md").write_text(matrix_rows, encoding="utf-8")
        gates = base / GATES_DIR
        gates.mkdir(parents=True)
        for name in runner_names:
            (gates / name).write_text("#!/usr/bin/env bash\nexit 0\n",
                                      encoding="utf-8")
        (gates / CHAIN_SELF).write_text("#!/usr/bin/env bash\nexit 0\n",
                                        encoding="utf-8")
        (base / CHAIN).write_text(chain_text, encoding="utf-8")

    declaring = ("| REQ-AP-01 | a requirement |\n"
                 "| REQ-AP-02 | another |\n")
    rows_ok = ("| TM-22 | allocations | gate | REQ-AP-01/02 |\n")
    rows_missing = ("| TM-22 | allocations | gate | REQ-AP-01 |\n")

    runner = "run_example_fixtures.sh"
    chain_ok = f"gate \"x\" bash tests/gates/{runner}\n"
    chain_none = "gate \"x\" bash tests/gates/run_other_fixtures.sh\n"
    chain_excluded = (f"# chain-excluded: tests/gates/{runner} — a rehearsal "
                      f"tool, not a merge gate\n")
    chain_reasonless = f"# chain-excluded: tests/gates/{runner}\n"
    chain_stale = ("# chain-excluded: tests/gates/run_gone_fixtures.sh — "
                   "removed long ago\n")

    cases = []

    with tempfile.TemporaryDirectory() as tmp:
        base = pathlib.Path(tmp) / "good"
        write_tree(base, declaring, rows_ok, chain_ok, [runner])
        cases.append(("good", check(base), []))

    with tempfile.TemporaryDirectory() as tmp:
        base = pathlib.Path(tmp) / "unmapped"
        write_tree(base, declaring, rows_missing, chain_ok, [runner])
        got = check(base)
        cases.append(("unmapped-requirement", got,
                      ["unmapped requirement: REQ-AP-02"]))

    with tempfile.TemporaryDirectory() as tmp:
        base = pathlib.Path(tmp) / "unwired"
        write_tree(base, declaring, rows_ok, chain_none, [runner])
        got = check(base)
        cases.append(("unwired-runner", got, ["unwired fixture runner"]))

    with tempfile.TemporaryDirectory() as tmp:
        base = pathlib.Path(tmp) / "excluded"
        write_tree(base, declaring, rows_ok, chain_excluded, [runner])
        cases.append(("excluded-runner-passes", check(base), []))

    with tempfile.TemporaryDirectory() as tmp:
        base = pathlib.Path(tmp) / "reasonless"
        write_tree(base, declaring, rows_ok, chain_reasonless, [runner])
        got = check(base)
        cases.append(("exclusion-without-reason", got,
                      ["exclusion without a reason"]))

    with tempfile.TemporaryDirectory() as tmp:
        base = pathlib.Path(tmp) / "stale"
        write_tree(base, declaring, rows_ok, chain_ok + chain_stale, [runner])
        got = check(base)
        cases.append(("stale-exclusion", got, ["stale exclusion"]))

    failed = 0
    for label, problems, expected in cases:
        joined = "\n".join(problems)
        for want in expected:
            if want not in joined:
                print(f"SELF-TEST FAIL: {label}: expected '{want}' in:\n{joined}")
                failed = 1
        if not expected and problems:
            print(f"SELF-TEST FAIL: {label}: expected clean, got:\n{joined}")
            failed = 1
        if expected and not problems:
            print(f"SELF-TEST FAIL: {label}: expected a violation, got clean")
            failed = 1
    if failed:
        print("TRACEABILITY SELF-TEST: FAIL")
        return 2
    print(f"TRACEABILITY SELF-TEST: PASS — {len(cases)} case(s), "
          f"failing and passing directions both asserted")
    return 0


if __name__ == "__main__":
    sys.exit(main())
