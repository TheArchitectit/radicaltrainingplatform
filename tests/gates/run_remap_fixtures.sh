#!/usr/bin/env bash
# REQ-NCA-01 / TM-82 fixtures for scripts/check-nca-remap.py (S48-01 / T-31).
#
# REQ-NCA-01's acceptance scenario is stated as a test: "Given remap.csv, when
# the validator runs, then it contains exactly 140 rows, every item ID resolves
# to a parsed question, and no row lacks a review state." A gate that has only
# ever been green on the real document has not been shown to test anything, so
# every rule it enforces gets a seeded defect here.
#
# The fixture trees are GENERATED, not checked in: the gate demands exactly 140
# rows, so a static fixture would either be 140 items of noise or a lie about
# the count. Generating them means the passing fixture satisfies the real rule
# rather than a relaxed version of it.
#
# Must-fail fixtures (each asserted to fail FOR ITS OWN REASON, since a fixture
# can fail for the wrong one — a bad path, a usage error):
#   dropped    — a parsed question with no remap row (ID stability)
#   blank      — a row with no review state
#   objective  — a newObjectiveId the manifest does not declare
#   duplicate  — two rows claiming one item
#   beta       — a beta-era productVersion
#   header     — the SPEC-01 01.3 column contract broken
# Must-pass fixture: the same generator with no defect seeded.
# Live assertion: the repository's real remap.csv.
set -u
cd "$(dirname "$0")/../.."

fail=0
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# Build a complete, honest fixture tree: 140 questions across the three banks,
# each with a remap row. $2 names the defect to seed ("" for none).
build() {
    python3 - "$1" "$2" <<'PY'
import csv, json, pathlib, sys

root = pathlib.Path(sys.argv[1])
defect = sys.argv[2]

BANKS = {"NCA-75-Part1.md": 40, "NCA-75-Part2.md": 40, "NCA-75-Part3-GapFill.md": 60}
COLUMNS = ["itemId","sourceFile","oldDomain","oldObjectiveId","newSection",
           "newObjectiveId","productVersion","keyReviewed","explanationReviewed",
           "rightsStatus","reviewer","notes"]

exam_dir = root / "content" / "exams" / "NCA-75"
exam_dir.mkdir(parents=True, exist_ok=True)
exam_dir.joinpath("exam.json").write_text(json.dumps({
    "examId": "NCA-75",
    "sections": [
        {"number": "1", "objectives": [{"id": "1.1"}, {"id": "1.2"}, {"id": "1.3"}]},
        {"number": "2", "objectives": [{"id": "2.1"}, {"id": "2.2"}]},
    ],
}), encoding="utf-8")

rows = []
for name, count in BANKS.items():
    body = "".join(
        f"### Q{n}\nQuestion {n}?\n- A) one\n- B) two\n\n**Answer: A**\n\n---\n"
        for n in range(1, count + 1)
    )
    root.joinpath(name).write_text(body, encoding="utf-8")
    for n in range(1, count + 1):
        rows.append({
            "itemId": f"{name}:{n}",
            "sourceFile": name,
            "oldDomain": "Describe Lifecycle Management",
            "oldObjectiveId": "1.1",
            "newSection": "1",
            "newObjectiveId": "1.1",
            "productVersion": "AOS 7.5",
            "keyReviewed": "false",
            "explanationReviewed": "false",
            "rightsStatus": "original-bank",
            "reviewer": "redeye-lane",
            "notes": "fixture",
        })

if defect == "dropped":
    rows.pop(0)                                  # a bank question now has no row
elif defect == "blank":
    rows[3]["keyReviewed"] = ""
elif defect == "objective":
    rows[5]["newObjectiveId"] = "9.9"
    rows[5]["newSection"] = "9"
elif defect == "duplicate":
    rows[1]["itemId"] = rows[0]["itemId"]
    rows[1]["sourceFile"] = rows[0]["sourceFile"]
elif defect == "beta":
    rows[7]["productVersion"] = "AOS 6.5"

with exam_dir.joinpath("remap.csv").open("w", encoding="utf-8", newline="") as fh:
    writer = csv.DictWriter(fh, fieldnames=COLUMNS)
    writer.writeheader()
    for row in rows:
        writer.writerow(row)

if defect == "header":
    text = exam_dir.joinpath("remap.csv").read_text(encoding="utf-8")
    text = text.replace("newObjectiveId", "objectiveId", 1)
    exam_dir.joinpath("remap.csv").write_text(text, encoding="utf-8")
PY
}

# A must-fail fixture is required to fail AND to say why.
must_fail() {
    local name="$1" needle="$2"
    local root="$TMP/$name"
    mkdir -p "$root"
    build "$root" "$name"
    local out
    out="$(python3 scripts/check-nca-remap.py --root "$root" 2>&1)"
    if [ $? -eq 0 ]; then
        echo "FAIL: the '$name' fixture passed the gate (the gate cannot detect it)"
        fail=1
    elif ! printf '%s' "$out" | grep -qF "$needle"; then
        echo "FAIL: the '$name' fixture failed, but not for the defect it seeds"
        printf '%s\n' "$out" | sed 's/^/      /'
        fail=1
    else
        echo "PASS: $name fixture rejected — $(printf '%s' "$out" | grep -c '^REMAP FAIL: ') violation(s), reason reported"
    fi
}

must_fail dropped   "is a parsed question with no remap row"
must_fail blank     "keyReviewed is ''"
must_fail objective "is not an objective declared in exam.json"
must_fail duplicate "duplicate itemId"
must_fail beta      "productVersion 'AOS 6.5'"
must_fail header    "SPEC-01 01.3 contract"

# Passing fixture — the same generator, no defect.
mkdir -p "$TMP/good"
build "$TMP/good" ""
if python3 scripts/check-nca-remap.py --root "$TMP/good" >/dev/null 2>&1; then
    echo "PASS: the clean 140-row fixture passed the gate"
else
    echo "FAIL: the clean fixture failed the gate — it is punishing a valid inventory"
    python3 scripts/check-nca-remap.py --root "$TMP/good" 2>&1 | sed 's/^/      /'
    fail=1
fi

# Live assertion — the repository's real document.
if python3 scripts/check-nca-remap.py >/dev/null 2>&1; then
    echo "PASS: the repository's remap.csv passed the gate"
else
    echo "FAIL: the repository's remap.csv failed the gate"
    python3 scripts/check-nca-remap.py 2>&1 | sed 's/^/      /'
    fail=1
fi

if python3 scripts/check-nca-remap.py --self-test >/dev/null 2>&1; then
    echo "PASS: check-nca-remap self-test (7 seeded defects, 1 clean inventory)"
else
    echo "FAIL: check-nca-remap self-test"
    python3 scripts/check-nca-remap.py --self-test 2>&1 | sed 's/^/      /'
    fail=1
fi

exit $fail
