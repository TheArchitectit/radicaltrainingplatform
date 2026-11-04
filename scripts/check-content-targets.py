#!/usr/bin/env python3
"""check-content-targets.py — ratchet gate for per-objective content floors.

Gap analysis §5.4: the tree does not yet meet the full content targets
(R1: every objective has ≥1 lesson; R2: every objective has ≥3 items), so
this gate ships as a ratchet. It reads a committed baseline of per-objective
counts and fails when any objective's item or lesson count *decreases*. It
prints the remaining gap to the target so the floor is visible every run.

When the baseline reaches the targets, flip TARGETS_ENFORCED to True and
the gate becomes a hard floor.

Usage:
  python3 scripts/check-content-targets.py
  python3 scripts/check-content-targets.py --self-test
  python3 scripts/check-content-targets.py --write-baseline
"""

from __future__ import annotations

import argparse
import json
import pathlib
import sys
import tempfile

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent

BASELINE_PATH = REPO_ROOT / "content-targets-baseline.json"

# R1: ≥1 lesson per objective. R2: ≥3 items per objective.
TARGET_ITEMS = 3
TARGET_LESSONS = 1

# Flip to True when the baseline meets the targets; the gate then fails on
# any objective below the floor instead of only on regressions.
TARGETS_ENFORCED = False


def load_baseline(root: pathlib.Path) -> dict:
    path = root / "content-targets-baseline.json"
    if path.is_file():
        return json.loads(path.read_text(encoding="utf-8"))
    return {}


def count_items(root: pathlib.Path) -> dict[str, int]:
    """{examId/objectiveId: item_count} from per-item provenance records."""
    counts: dict[str, int] = {}
    prov_dir = root / "content" / "provenance"
    for record in sorted(prov_dir.rglob("Q*.json")):
        try:
            data = json.loads(record.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        exam = data.get("examId", "?")
        obj = data.get("objectiveId", "?")
        key = f"{exam}/{obj}"
        counts[key] = counts.get(key, 0) + 1
    return counts


def count_lessons(root: pathlib.Path) -> dict[str, int]:
    """{examId/objectiveId: lesson_count} from exam manifests."""
    counts: dict[str, int] = {}
    for exam_dir in sorted((root / "content" / "exams").iterdir()):
        manifest = exam_dir / "exam.json"
        if not manifest.is_file():
            continue
        try:
            data = json.loads(manifest.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        exam_id = data.get("examId", exam_dir.name)
        for section in data.get("sections", []):
            for obj in section.get("objectives", []):
                key = f"{exam_id}/{obj['id']}"
                counts[key] = len(obj.get("lessonIds", []))
    return counts


def build_snapshot(root: pathlib.Path) -> dict:
    return {
        "items": count_items(root),
        "lessons": count_lessons(root),
    }


def check(root: pathlib.Path, fail) -> None:
    snapshot = build_snapshot(root)
    baseline = load_baseline(root)

    items_now = snapshot["items"]
    lessons_now = snapshot["lessons"]
    items_base = baseline.get("items", {})
    lessons_base = baseline.get("lessons", {})

    regressions = 0

    # Ratchet: any objective that had N items or lessons in the baseline
    # must still have at least N. New objectives are welcome.
    for key, base_count in sorted(items_base.items()):
        now = items_now.get(key, 0)
        if now < base_count:
            fail(f"items regressed for {key}: baseline {base_count}, now {now} — "
                 f"a ratchet only moves forward")
            regressions += 1

    for key, base_count in sorted(lessons_base.items()):
        now = lessons_now.get(key, 0)
        if now < base_count:
            fail(f"lessons regressed for {key}: baseline {base_count}, now {now} — "
                 f"a ratchet only moves forward")
            regressions += 1

    # Gap to target (informational until TARGETS_ENFORCED).
    below_items = [(k, v) for k, v in sorted(items_now.items()) if v < TARGET_ITEMS]
    below_lessons = [(k, v) for k, v in sorted(lessons_now.items()) if v < TARGET_LESSONS]

    if TARGETS_ENFORCED:
        for key, count in below_items:
            fail(f"{key} has {count} items, target is {TARGET_ITEMS}")
        for key, count in below_lessons:
            fail(f"{key} has {count} lessons, target is {TARGET_LESSONS}")

    total_items = sum(items_now.values())
    total_objectives = len(items_now)
    print(f"CONTENT TARGETS: items {total_items} across {total_objectives} objectives "
          f"(floor {TARGET_ITEMS}/objective)")
    if below_items:
        print(f"  gap: {len(below_items)} objective(s) below {TARGET_ITEMS} items")
        for key, count in below_items[:10]:
            print(f"    {key}: {count}")
    else:
        print(f"  every objective meets the {TARGET_ITEMS}-item floor")
    if below_lessons:
        print(f"  gap: {len(below_lessons)} objective(s) with no lesson")
    else:
        print(f"  every objective has at least {TARGET_LESSONS} lesson")
    print(f"  ratchet baseline: {len(items_base)} objectives tracked, "
          f"{regressions} regression(s)")


def write_baseline(root: pathlib.Path) -> int:
    snapshot = build_snapshot(root)
    path = root / "content-targets-baseline.json"
    path.write_text(
        json.dumps(snapshot, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(f"wrote {path.name}: {len(snapshot['items'])} objectives")
    return 0


# ── self-test ───────────────────────────────────────────────────────────────


def self_test() -> int:
    failures: list[str] = []

    def run_check(root: pathlib.Path) -> tuple[int, str]:
        import io
        import contextlib
        buf = io.StringIO()
        with contextlib.redirect_stdout(buf):
            fails: list[str] = []
            check(root, fails.append)
            code = 1 if fails else 0
        return code, buf.getvalue() + "\n".join(fails)

    with tempfile.TemporaryDirectory() as tmp:
        root = pathlib.Path(tmp)

        def write(rel: str, text: str) -> None:
            p = root / rel
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_text(text, encoding="utf-8")

        # Passing tree: one objective with 3 items and 1 lesson.
        write("content/exams/E1/exam.json", json.dumps({
            "examId": "E1",
            "sections": [{"objectives": [{"id": "1.1", "lessonIds": ["l1"]}]}],
        }))
        for n in range(1, 4):
            write(f"content/provenance/E1/Q{n}.json", json.dumps({
                "examId": "E1", "objectiveId": "1.1", "itemId": f"E1/b.md/Q{n}",
            }))
        write("content-targets-baseline.json", json.dumps({
            "items": {"E1/1.1": 3},
            "lessons": {"E1/1.1": 1},
        }))

        code, out = run_check(root)
        if code != 0:
            failures.append(f"passing fixture should exit 0, got {code}: {out}")

        # Failing fixture: an objective drops below its baseline item count.
        (root / "content/provenance/E1/Q3.json").unlink()
        code, out = run_check(root)
        if code != 1:
            failures.append(f"item regression must exit 1, got {code}")
        if "items regressed" not in out:
            failures.append(f"item regression not named: {out}")

        # Failing fixture: an objective loses its lesson.
        write("content/exams/E1/exam.json", json.dumps({
            "examId": "E1",
            "sections": [{"objectives": [{"id": "1.1", "lessonIds": []}]}],
        }))
        write("content/provenance/E1/Q3.json", json.dumps({
            "examId": "E1", "objectiveId": "1.1", "itemId": "E1/b.md/Q3",
        }))
        code, out = run_check(root)
        if code != 1:
            failures.append(f"lesson regression must exit 1, got {code}")
        if "lessons regressed" not in out:
            failures.append(f"lesson regression not named: {out}")

    for f in failures:
        print(f"  FAIL {f}")
    if failures:
        print(f"\nCONTENT TARGETS --self-test: {len(failures)} failure(s)")
        return 1
    print("\nCONTENT TARGETS --self-test: PASS — failing and passing fixtures behave")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--root", default=".", help="repository root")
    ap.add_argument("--self-test", action="store_true")
    ap.add_argument("--write-baseline", action="store_true",
                    help="snapshot current counts as the new baseline")
    args = ap.parse_args()

    root = pathlib.Path(args.root).resolve()
    if args.self_test:
        return self_test()
    if args.write_baseline:
        return write_baseline(root)

    fails: list[str] = []
    check(root, fails.append)
    if fails:
        print(f"\nCONTENT TARGETS: FAIL — {len(fails)} regression(s)")
        return 1
    print("CONTENT TARGETS: PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
