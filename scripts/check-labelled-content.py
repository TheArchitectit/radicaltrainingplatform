#!/usr/bin/env python3
"""Labelled content: an illustration says what it is, and a gap says it is a gap.

Three requirements say the same thing in three places:

  * SPEC-04 REQ-AP-04 — lesson A4 illustrates virtualization with the existing
    Prism Element VM-creation simulator, and the link carries the exact label
    "Nutanix example of a general concept." It is never presented as an A+
    operating-system or hardware lab.
  * SPEC-04 REQ-AP-05 — objectives with no simulation support ship as labeled
    worked examples, never as fake interactive completions.
  * SPEC-05 REQ-NP-04 — every topic declared in an exam's `gaps` list is filled
    by a labeled worked example until an interactive exercise exists.

The failure this gate exists to stop is a *silent* one: a lesson that links a
vendor console as if it were the learner's own lab, or a declared gap that
quietly renders as nothing. Both look fine on screen and lie to the reader.

What counts as proof here is structural, not editorial:

  * AP-04: A4 must contain an in-app markdown link whose visible text carries
    the exact label, and the compiled `study-content.js` must carry it too —
    a label that exists only in the source file is not on a learner's screen.
  * AP-05/NP-04: every `workedExamples` entry carries `label: "worked example"`
    and a title that says it is not a scored item; every declared gap has at
    least one such entry; no entry points at a gap that is not declared.

Usage:
  python3 scripts/check-labelled-content.py
  python3 scripts/check-labelled-content.py --root <tree>
  python3 scripts/check-labelled-content.py --self-test

Exit codes:
  0 — every illustration and gap is labelled
  1 — at least one is not
  2 — self-test assertion failed
"""
import argparse
import json
import pathlib
import re
import shutil
import sys
import tempfile

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent

SIM_LABEL = "Nutanix example of a general concept."
A4 = pathlib.Path("content/exams/COMPTIA-A-1201/lessons/a4.md")
COMPILED = pathlib.Path("RadicalTrainingPlatform.Web/js/study-content.js")
APP_JS = pathlib.Path("RadicalTrainingPlatform.Web/js/app.js")
LESSON_GLOB = "*/lessons/*.md"
EXAMS_DIR = pathlib.Path("content/exams")

LINK = re.compile(r"\[([^\]]+)\]\((#[^)\s]*)\)")
WORKED_LABEL = "worked example"
SCORED_MARKER = "not a scored item"
MIN_BODY = 80


def _manifests(root):
    for path in sorted((root / EXAMS_DIR).glob("*/exam.json")):
        yield path, json.loads(path.read_text(encoding="utf-8"))


def _routes(root):
    """Paths the router registers, from the app's own wiring."""
    app = pathlib.Path(root) / APP_JS
    if not app.is_file():
        return None
    return set(re.findall(r"router\.register\('([^']+)'",
                          app.read_text(encoding="utf-8")))


def check_tree(root):
    """Return the list of blocking findings for a tree."""
    root = pathlib.Path(root)
    failures = []

    a4 = root / A4
    if not a4.is_file():
        failures.append(f"{A4.as_posix()}: shipped lesson A4 is missing, so the "
                        f"REQ-AP-04 illustration cannot be on a learner's screen")
    else:
        linked = False
        for line in a4.read_text(encoding="utf-8").splitlines():
            for match in LINK.finditer(line):
                if SIM_LABEL in match.group(1):
                    linked = True
        if not linked:
            failures.append(
                f"{A4.as_posix()}: no in-app link carries the exact label "
                f"{SIM_LABEL!r} — REQ-AP-04 requires the label on the simulator "
                f"link itself, not near it")

    compiled = root / COMPILED
    if compiled.is_file() and SIM_LABEL not in compiled.read_text(encoding="utf-8"):
        failures.append(
            f"{COMPILED.as_posix()}: the compiled artifact does not carry "
            f"{SIM_LABEL!r} — the label is in the lesson source but not in what "
            f"ships; regenerate study-content.js")

    # A lesson link that names a route the router does not register is a dead
    # promise: the reader taps it and lands on the unknown-route placeholder.
    # Only in-app targets are checked; the renderer refuses external hrefs.
    routes = _routes(root)
    if routes is not None:
        for lesson in sorted((root / EXAMS_DIR).glob(LESSON_GLOB)):
            rel = lesson.relative_to(root).as_posix()
            for number, line in enumerate(lesson.read_text(encoding="utf-8").splitlines(), 1):
                for match in LINK.finditer(line):
                    target = match.group(2).lstrip("#")
                    if ":" in target:      # a parameterised route, e.g. /tracks/:id
                        continue
                    if target not in routes:
                        failures.append(
                            f"{rel}:{number}: links to {match.group(2)!r}, which "
                            f"the router does not register — the reader lands on "
                            f"the unknown-route placeholder")

    for path, manifest in _manifests(root):
        rel = path.relative_to(root).as_posix()
        exam = manifest.get("examId", "?")
        gaps = manifest.get("gaps") or []
        examples = manifest.get("workedExamples") or []

        # REQ-AP-05 and REQ-NP-04 are the two exams with a simulation gap and a
        # decided convention for it. The other manifests use `gaps` for an
        # *authoring* gap ("no lesson or item covers it"), which is a different
        # claim and must not be satisfied by inventing an example.
        must_ship = exam.upper().startswith("COMPTIA-A") or exam == "COMPTIA-NET-009"
        if must_ship and not examples:
            failures.append(
                f"{rel}: declares no worked examples — REQ-AP-05/REQ-NP-04 require "
                f"the objectives and topics without simulation support to ship as "
                f"labeled worked examples")

        for example in examples:
            where = f"{rel}: worked example {example.get('id', '?')!r}"
            if example.get("label") != WORKED_LABEL:
                failures.append(
                    f"{where}: label is {example.get('label')!r}, not "
                    f"{WORKED_LABEL!r} — an unlabeled example reads as scored "
                    f"content")
            title = example.get("title") or ""
            if SCORED_MARKER not in title:
                failures.append(
                    f"{where}: title does not say {SCORED_MARKER!r} — a reader "
                    f"cannot tell the example from a scored item")
            body = example.get("body") or ""
            if len(body.strip()) < MIN_BODY:
                failures.append(
                    f"{where}: body is {len(body.strip())} characters — too short "
                    f"to be a worked example")
            if example.get("interactive") is True:
                failures.append(
                    f"{where}: claims to be interactive — no interactive exercise "
                    f"exists for this gap, so that is a fake completion")
            if example.get("gap") not in gaps:
                failures.append(
                    f"{where}: points at gap {example.get('gap')!r}, which the "
                    f"manifest does not declare")

        # Completeness applies to the exam that opted into the convention: its
        # gap list is the promise that each topic renders as an example.
        if examples:
            for gap in gaps:
                if not any(example.get("gap") == gap for example in examples):
                    failures.append(
                        f"{rel}: declared gap {gap!r} has no labeled worked "
                        f"example — the manifest ships examples but not for this "
                        f"gap, so the topic renders as nothing")

    return failures


def unpaired_gaps(root):
    """Declared gaps in manifests that ship no worked examples at all.

    Reported, never failed: those manifests use `gaps` for an authoring gap
    ("no lesson or item covers it"), which REQ-AP-05/REQ-NP-04 do not govern.
    """
    advisories = []
    for path, manifest in _manifests(root):
        gaps = manifest.get("gaps") or []
        if gaps and not (manifest.get("workedExamples") or []):
            rel = path.relative_to(pathlib.Path(root)).as_posix()
            advisories.append(f"{rel}: {len(gaps)} authoring gap(s) declared, no "
                              f"worked examples — out of scope for REQ-AP-05/REQ-NP-04")
    return advisories


# ── fixtures ────────────────────────────────────────────────────────────────
def _copy_tree(dest):
    dest = pathlib.Path(dest)
    for path, _ in _manifests(REPO_ROOT):
        target = dest / path.relative_to(REPO_ROOT)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, target)
    for rel in (A4, COMPILED, APP_JS):
        target = dest / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(REPO_ROOT / rel, target)


def _mutate(dest, rel, kind, **kwargs):
    path = pathlib.Path(dest) / rel
    if kind == "json":
        data = json.loads(path.read_text(encoding="utf-8"))
        kwargs["fn"](data)
        path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n",
                        encoding="utf-8")
    else:
        text = path.read_text(encoding="utf-8")
        path.write_text(kwargs["fn"](text), encoding="utf-8")


def _drop_label(text):
    return text.replace(f"[{SIM_LABEL}](#/pe/vms)", "[See a real console](#/pe/vms)")


def _external_link(text):
    return text.replace(f"[{SIM_LABEL}](#/pe/vms)",
                        f"[{SIM_LABEL}](https://example.com/console)")


CORE1 = pathlib.Path("content/exams/COMPTIA-A-1201/exam.json")
NETPLUS = pathlib.Path("content/exams/COMPTIA-NET-009/exam.json")


def _no_examples(data):
    data["workedExamples"] = []


def _extra_gap(data):
    data.setdefault("gaps", []).append("wireless site survey")


def _blank_label(data):
    data["workedExamples"][0]["label"] = ""


def _scored_title(data):
    data["workedExamples"][0]["title"] = "Packet analysis reading"


def _interactive(data):
    data["workedExamples"][0]["interactive"] = True


def _short_body(data):
    data["workedExamples"][0]["body"] = "Too short."


def self_test():
    failures = []

    for finding in check_tree(REPO_ROOT):
        failures.append(f"the shipped tree does not pass its own check: {finding}")

    with tempfile.TemporaryDirectory() as td:
        _copy_tree(td)
        for finding in check_tree(td):
            failures.append(f"the clean copy does not pass: {finding}")

    mutations = [
        (A4, "text", {"fn": _drop_label}, "the A4 label is removed from its link"),
        (A4, "text", {"fn": _external_link}, "the A4 link points outside the app"),
        (CORE1, "json", {"fn": _no_examples}, "an A+ exam ships no worked examples"),
        (NETPLUS, "json", {"fn": _extra_gap}, "a declared gap has no worked example"),
        (NETPLUS, "json", {"fn": _blank_label}, "a worked example has no label"),
        (NETPLUS, "json", {"fn": _scored_title}, "a worked example claims a scored title"),
        (NETPLUS, "json", {"fn": _interactive}, "a worked example claims interactivity"),
        (NETPLUS, "json", {"fn": _short_body}, "a worked example has no body"),
        (COMPILED, "text", {"fn": lambda t: t.replace(SIM_LABEL, "")},
         "the compiled artifact drops the label"),
        (A4, "text", {"fn": lambda t: t.replace("(#/pe/vms)", "(#/pe/does-not-exist)")},
         "a lesson links to a route the router does not register"),
    ]
    for rel, kind, kwargs, description in mutations:
        with tempfile.TemporaryDirectory() as td:
            _copy_tree(td)
            _mutate(td, rel, kind, **kwargs)
            if not check_tree(td):
                failures.append(f"the check passed a tree where {description}")

    if failures:
        print("LABELLED CONTENT SELF-TEST: FAIL")
        for finding in failures:
            print(f"  {finding}")
        return 2
    print(f"LABELLED CONTENT SELF-TEST: PASS — shipped tree + clean copy + "
          f"{len(mutations)} seeded defects, each caught")
    return 0


def main():
    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--root", type=pathlib.Path, default=None,
                        help="tree to check (default: the repository)")
    parser.add_argument("--self-test", action="store_true",
                        help="prove each check can fail")
    args = parser.parse_args()

    if args.self_test:
        return self_test()

    root = args.root if args.root is not None else REPO_ROOT
    if not (pathlib.Path(root) / EXAMS_DIR).is_dir():
        print(f"LABELLED CONTENT CHECK: FAIL — no {EXAMS_DIR.as_posix()} under {root}",
              file=sys.stderr)
        return 1

    failures = check_tree(root)
    if failures:
        print("LABELLED CONTENT CHECK: FAIL")
        for finding in failures:
            print(f"  {finding}")
        return 1

    manifests = list(_manifests(root))
    gaps = sum(len(m.get("gaps") or []) for _, m in manifests)
    examples = sum(len(m.get("workedExamples") or []) for _, m in manifests)
    print(f"LABELLED CONTENT CHECK: PASS — lesson A4 links the Prism Element "
          f"console under {SIM_LABEL!r} in source and in the shipped artifact; "
          f"{gaps} declared gap(s) across {len(manifests)} exam(s) carry "
          f"{examples} labeled worked example(s), none claiming interactivity")
    for advisory in unpaired_gaps(root):
        print(f"  advisory: {advisory}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
