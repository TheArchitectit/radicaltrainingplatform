#!/usr/bin/env bash
# S27-08 / S27-09 fixtures for scripts/check-plugin-manifests.py.
#
# The plugin gate is what lets a vendor pack ship without being able to damage
# shipped content, so every rule it enforces gets a fixture that breaks it and
# is asserted to fail FOR ITS OWN REASON. A fixture can fail for the wrong one
# — a bad path, a usage error — and a gate that only ever ran green on the
# repository has not been shown to test anything.
#
# The fixture trees are built on disk (not checked in) because the gate reads
# real paths and real file bytes: the integrity rule hashes the file, so a
# fixture that fakes the bytes would not exercise the rule it names.
#
# Must-fail fixtures (each asserted to fail with its own reason named):
#   schema      — an exam.json with an unsupported schemaVersion
#   schematype  — a schemaVersion that is not an integer
#   duplicate   — two exam.json files claiming one examId
#   reference   — a track listing an exam no manifest declares
#   pluginver   — a plugin.json with an unsupported schemaVersion
#   pluginmiss  — a plugin declaring a file that is not there
#   pluginhash  — a plugin whose declared hash does not match the file
#   collision   — a plugin claiming an exam ID the built-in tree owns
#   noplugin    — a directory in the plugin root with no plugin.json
# Must-pass fixture: the same generator with no defect seeded.
# Live assertion: the repository's own content tree.
set -u
cd "$(dirname "$0")/../.."

fail=0
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# Build a complete, valid tree, then seed the named defect ("" for none).
build() {
    python3 - "$1" "$2" <<'PY'
import hashlib, json, pathlib, sys

root = pathlib.Path(sys.argv[1])
defect = sys.argv[2]

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

exams = root / "content" / "exams" / "ACME-1"
exams.mkdir(parents=True)
exam = {"examId": "ACME-1", "vendor": "ACME", "displayName": "ACME One"}
(exams / "exam.json").write_text(json.dumps(exam), encoding="utf-8")

tracks = root / "content" / "tracks" / "track-acme"
tracks.mkdir(parents=True)
track = {"trackId": "track-acme", "title": "ACME", "examIds": ["ACME-1"]}
(tracks / "track.json").write_text(json.dumps(track), encoding="utf-8")

def write_plugin(dirname, plugin_id, exam_id, schema=1,
                 declared_path=None, sha_override=None, with_manifest=True):
    pdir = root / "plugins" / dirname
    content = pdir / "content"
    (content / "exams" / exam_id).mkdir(parents=True)
    exam_file = content / "exams" / exam_id / "exam.json"
    exam_file.write_text(json.dumps({
        "examId": exam_id, "vendor": "ACME", "displayName": exam_id,
    }), encoding="utf-8")
    if not with_manifest:
        return
    (pdir / "plugin.json").write_text(json.dumps({
        "schemaVersion": schema,
        "pluginId": plugin_id,
        "vendor": "ACME",
        "displayName": f"{plugin_id} pack",
        "contentRoot": "content",
        "files": [{
            "path": declared_path or f"exams/{exam_id}/exam.json",
            "sha256": sha_override if sha_override is not None else sha(exam_file),
        }],
    }), encoding="utf-8")

if defect == "schema":
    exam["schemaVersion"] = 99
    (exams / "exam.json").write_text(json.dumps(exam), encoding="utf-8")
elif defect == "schematype":
    exam["schemaVersion"] = "one"
    (exams / "exam.json").write_text(json.dumps(exam), encoding="utf-8")
elif defect == "duplicate":
    copy = root / "content" / "exams" / "ACME-1-copy"
    copy.mkdir(parents=True)
    (copy / "exam.json").write_text(json.dumps(exam), encoding="utf-8")
elif defect == "reference":
    track["examIds"] = ["ACME-NOPE"]
    (tracks / "track.json").write_text(json.dumps(track), encoding="utf-8")
elif defect == "pluginver":
    write_plugin("acme", "acme", "ACME-2", schema=7)
elif defect == "pluginmiss":
    write_plugin("acme", "acme", "ACME-2", declared_path="exams/ACME-2/gone.json")
elif defect == "pluginhash":
    write_plugin("acme", "acme", "ACME-2", sha_override="0" * 64)
elif defect == "collision":
    write_plugin("copycat", "copycat", "ACME-1")
elif defect == "noplugin":
    write_plugin("broken", "broken", "ACME-3", with_manifest=False)
elif defect == "good":
    write_plugin("acme", "acme", "ACME-2")
PY
}

# A must-fail fixture is required to fail AND to say why.
must_fail() {
    local name="$1" needle="$2"
    local root="$TMP/$name"
    mkdir -p "$root"
    build "$root" "$name"
    local out rc
    out="$(python3 scripts/check-plugin-manifests.py --root "$root" 2>&1)"
    rc=$?
    if [ $rc -eq 0 ]; then
        echo "FAIL: the '$name' fixture passed the gate (the gate cannot detect it)"
        fail=1
    elif ! printf '%s' "$out" | grep -qF "$needle"; then
        echo "FAIL: the '$name' fixture failed, but not for the defect it seeds"
        printf '%s\n' "$out" | sed 's/^/      /'
        fail=1
    else
        echo "PASS: $name fixture rejected — reason reported"
    fi
}

must_fail schema      "unsupported schemaVersion 99"
must_fail schematype  "schemaVersion must be an integer"
must_fail duplicate   "exam ID 'ACME-1' is already claimed by"
must_fail reference   "which no exam.json declares"
must_fail pluginver   "unsupported schemaVersion 7"
must_fail pluginmiss  "declared file 'exams/ACME-2/gone.json' is missing"
must_fail pluginhash  "hash mismatch: exams/ACME-2/exam.json"
must_fail collision   "exam ID 'ACME-1' is already claimed by"
must_fail noplugin    "no plugin.json"

# Passing fixture — the same generator with a valid plugin present, so the
# accept path is exercised rather than only the reject path.
mkdir -p "$TMP/good"
build "$TMP/good" "good"
if python3 scripts/check-plugin-manifests.py --root "$TMP/good" >/dev/null 2>&1; then
    echo "PASS: the clean fixture (built-in tree + valid plugin) passed the gate"
else
    echo "FAIL: the clean fixture failed the gate — it is punishing a valid pack"
    python3 scripts/check-plugin-manifests.py --root "$TMP/good" 2>&1 | sed 's/^/      /'
    fail=1
fi

# Live assertion — the repository's real content tree.
if python3 scripts/check-plugin-manifests.py >/dev/null 2>&1; then
    echo "PASS: the repository's content tree passed the gate"
else
    echo "FAIL: the repository's content tree failed the gate"
    python3 scripts/check-plugin-manifests.py 2>&1 | sed 's/^/      /'
    fail=1
fi

if python3 scripts/check-plugin-manifests.py --self-test >/dev/null 2>&1; then
    echo "PASS: check-plugin-manifests self-test (11 cases: 9 seeded defects, 2 clean trees)"
else
    echo "FAIL: check-plugin-manifests self-test"
    python3 scripts/check-plugin-manifests.py --self-test 2>&1 | sed 's/^/      /'
    fail=1
fi

exit $fail
