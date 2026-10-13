#!/usr/bin/env python3
"""S27-08 / S27-09 — the vendor plugin manifest gate.

Sprints 27-28 make the platform multi-vendor: a pack is a directory holding
`plugin.json` plus a `content/` tree shaped exactly like the repository's own,
and the built-in tree is registered as a plugin too. That design only holds if
three invariants are true, and until now nothing checked any of them.

  A. Schema. Every `exam.json` / `track.json` under a content root declares a
     `schemaVersion` this build understands. Absent means 1, so the four
     manifests written before versioning existed read unchanged.

  B. Identity. Exam and track IDs are unique across every content root, and a
     track's `examIds` resolve to exams that exist. REQ-MAN-05: a duplicate
     never merges silently, in either direction. This is the check that stops a
     vendor pack from quietly redefining shipped content.

  C. Integrity. A plugin's `files[]` list declares a SHA-256 per file; every
     declared file must exist and hash as declared. Hashes are over raw bytes,
     matching the convention `generate-bundle-manifest.py` already uses.

This runs in CI beside the other content gates, so a pack author finds out
without building .NET. `PluginValidator` in Core enforces the same rules at
runtime for packs discovered on a user's machine — this gate is the
repo-visible half of the same contract, not a second opinion.

Usage:
  python3 scripts/check-plugin-manifests.py [--root PATH] [--plugin-root PATH]...

Exit codes:
  0 — every content root and plugin manifest valid
  1 — one or more violations, each named with its path and reason
  2 — fixture assertion failed (--self-test)
"""
import argparse
import hashlib
import json
import pathlib
import shutil
import sys
import tempfile

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent

# plugin.json schema versions this build understands. Mirrors
# PluginValidator.SupportedSchemaVersions — if one moves, both move.
SUPPORTED_SCHEMA_VERSIONS = {1}
PLUGIN_MANIFEST_NAME = "plugin.json"

# Where a plugin directory is looked for, relative to a repo root. The default
# is the repository's own `plugins/` directory; nothing ships there today, so
# this is where a vendor pack would land to be picked up by the gate.
DEFAULT_PLUGIN_ROOTS = ("plugins",)

FAIL = "PLUGIN FAIL: "


def load_json(path):
    """Parse a JSON file. Returns (data, error_message)."""
    try:
        return json.loads(path.read_text(encoding="utf-8")), None
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        return None, f"{path}: could not be parsed as JSON ({exc})"


def sha256_file(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def check_tree(tree, label, claimed, errors):
    """Validate one content root and record the IDs it claims.

    `tree` holds `exams/` and `tracks/`. `claimed` maps ID -> the path that
    claimed it, so a duplicate names both owners rather than just the loser.
    """
    exams_dir = tree / "exams"
    if exams_dir.is_dir():
        for manifest in sorted(exams_dir.glob("*/exam.json")):
            data, err = load_json(manifest)
            if err:
                errors.append(FAIL + err)
                continue
            errors.extend(check_schema(manifest, data))
            exam_id = (data.get("examId") or "").strip()
            if not exam_id:
                errors.append(f"{FAIL}{manifest}: examId is required")
                continue
            if exam_id in claimed["exams"]:
                errors.append(
                    f"{FAIL}{manifest}: exam ID '{exam_id}' is already claimed by "
                    f"{claimed['exams'][exam_id]}")
                continue
            claimed["exams"][exam_id] = manifest

    tracks_dir = tree / "tracks"
    if tracks_dir.is_dir():
        for manifest in sorted(tracks_dir.glob("*/track.json")):
            data, err = load_json(manifest)
            if err:
                errors.append(FAIL + err)
                continue
            errors.extend(check_schema(manifest, data))
            track_id = (data.get("trackId") or "").strip()
            if not track_id:
                errors.append(f"{FAIL}{manifest}: trackId is required")
                continue
            if track_id in claimed["tracks"]:
                errors.append(
                    f"{FAIL}{manifest}: track ID '{track_id}' is already claimed by "
                    f"{claimed['tracks'][track_id]}")
                continue
            claimed["tracks"][track_id] = manifest


def check_schema(path, data):
    """Schema-version rule (A). Absent means 1."""
    errors = []
    version = data.get("schemaVersion", 1)
    if not isinstance(version, int) or isinstance(version, bool):
        errors.append(f"{FAIL}{path}: schemaVersion must be an integer, got {version!r}")
    elif version not in SUPPORTED_SCHEMA_VERSIONS:
        supported = ", ".join(str(v) for v in sorted(SUPPORTED_SCHEMA_VERSIONS))
        errors.append(
            f"{FAIL}{path}: unsupported schemaVersion {version} "
            f"(this build understands {supported})")
    return errors


def check_plugin(plugin_dir, claimed, errors):
    """Validate one plugin directory (A + B + C)."""
    manifest_path = plugin_dir / PLUGIN_MANIFEST_NAME
    if not manifest_path.is_file():
        errors.append(f"{FAIL}{plugin_dir}: no {PLUGIN_MANIFEST_NAME} — "
                      f"a plugin directory must declare one")
        return

    data, err = load_json(manifest_path)
    if err:
        errors.append(FAIL + err)
        return

    version = data.get("schemaVersion", 1)
    if not isinstance(version, int) or isinstance(version, bool):
        errors.append(f"{FAIL}{manifest_path}: schemaVersion must be an integer")
    elif version not in SUPPORTED_SCHEMA_VERSIONS:
        supported = ", ".join(str(v) for v in sorted(SUPPORTED_SCHEMA_VERSIONS))
        errors.append(f"{FAIL}{manifest_path}: unsupported schemaVersion {version} "
                      f"(this build understands {supported})")

    for field in ("pluginId", "vendor", "displayName"):
        if not (data.get(field) or "").strip():
            errors.append(f"{FAIL}{manifest_path}: {field} is required")

    content_root = plugin_dir / (data.get("contentRoot") or "content")
    if not content_root.is_dir():
        errors.append(f"{FAIL}{manifest_path}: content root '{content_root}' does not exist")
        return

    # C — declared files exist and hash as declared.
    for entry in data.get("files") or []:
        rel = (entry or {}).get("path") or ""
        declared = (entry or {}).get("sha256") or ""
        if not rel.strip() or not declared.strip():
            errors.append(f"{FAIL}{manifest_path}: files[] entry has an empty path or sha256")
            continue
        target = content_root / rel
        if not target.is_file():
            errors.append(f"{FAIL}{manifest_path}: declared file '{rel}' is missing")
            continue
        actual = sha256_file(target)
        if actual.lower() != declared.lower():
            errors.append(f"{FAIL}{manifest_path}: hash mismatch: {rel} "
                          f"(manifest {declared[:12]}, actual {actual[:12]})")

    # B — this pack's IDs, against everything claimed before it.
    check_tree(content_root, data.get("pluginId") or str(plugin_dir), claimed, errors)


def check_references(claimed, errors):
    """Every track's examIds must resolve to a declared exam."""
    for track_id, manifest_path in sorted(claimed["tracks"].items()):
        data, err = load_json(manifest_path)
        if err:
            continue  # already reported
        for exam_id in data.get("examIds") or []:
            if exam_id not in claimed["exams"]:
                errors.append(f"{FAIL}{manifest_path}: track '{track_id}' lists exam "
                              f"'{exam_id}', which no exam.json declares")


def find_plugin_dirs(root, plugin_roots):
    dirs = []
    for name in plugin_roots:
        base = root / name
        if not base.is_dir():
            continue
        dirs.extend(sorted(p for p in base.iterdir() if p.is_dir()))
    return dirs


def run(root, plugin_roots):
    """Return the list of violations for a repository root."""
    errors = []
    claimed = {"exams": {}, "tracks": {}}

    content = root / "content"
    if not content.is_dir():
        return [f"{FAIL}{content}: no content tree — nothing to validate"]

    # The built-in tree first: it owns its IDs before any pack is read, so a
    # pack that collides with shipped content is the one reported.
    check_tree(content, "built-in", claimed, errors)

    for plugin_dir in find_plugin_dirs(root, plugin_roots):
        check_plugin(plugin_dir, claimed, errors)

    check_references(claimed, errors)
    return errors


def self_test():
    """Seeded defects: each must be caught, and a clean tree must pass."""
    cases = []

    def tree(base, schema=None, track_exam=None, dup=False):
        """A minimal but complete content root."""
        exams = base / "content" / "exams" / "ACME-1"
        exams.mkdir(parents=True)
        exam = {"examId": "ACME-1", "vendor": "ACME", "displayName": "ACME One"}
        if schema is not None:
            exam["schemaVersion"] = schema
        (exams / "exam.json").write_text(json.dumps(exam), encoding="utf-8")

        tracks = base / "content" / "tracks" / "track-acme"
        tracks.mkdir(parents=True)
        (tracks / "track.json").write_text(json.dumps({
            "trackId": "track-acme",
            "title": "ACME",
            "examIds": [track_exam or "ACME-1"],
        }), encoding="utf-8")

        if dup:
            second = base / "content" / "exams" / "ACME-1-copy"
            second.mkdir(parents=True)
            (second / "exam.json").write_text(json.dumps(exam), encoding="utf-8")
        return base

    def plugin(base, *, schema=1, sha=None, declared_path="exams/ACME-2/exam.json"):
        pdir = base / "plugins" / "acme"
        content = pdir / "content"
        (content / "exams" / "ACME-2").mkdir(parents=True)
        exam_file = content / "exams" / "ACME-2" / "exam.json"
        exam_file.write_text(json.dumps({
            "examId": "ACME-2", "vendor": "ACME", "displayName": "ACME Two",
        }), encoding="utf-8")
        (pdir / PLUGIN_MANIFEST_NAME).write_text(json.dumps({
            "schemaVersion": schema,
            "pluginId": "acme",
            "vendor": "ACME",
            "displayName": "ACME pack",
            "contentRoot": "content",
            "files": [{
                "path": declared_path,
                "sha256": sha if sha is not None else sha256_file(exam_file),
            }],
        }), encoding="utf-8")
        return base

    cases.append(("clean tree", lambda b: tree(b), False, None))
    cases.append(("clean tree with plugin", lambda b: plugin(tree(b)), False, None))
    cases.append(("unsupported schemaVersion", lambda b: tree(b, schema=99),
                  True, "unsupported schemaVersion 99"))
    cases.append(("non-integer schemaVersion", lambda b: tree(b, schema="one"),
                  True, "schemaVersion must be an integer"))
    cases.append(("duplicate exam ID", lambda b: tree(b, dup=True),
                  True, "is already claimed by"))
    cases.append(("track referencing a missing exam", lambda b: tree(b, track_exam="NOPE"),
                  True, "which no exam.json declares"))
    cases.append(("plugin with an unsupported schema", lambda b: plugin(tree(b), schema=7),
                  True, "unsupported schemaVersion 7"))
    cases.append(("plugin whose declared file is missing",
                  lambda b: plugin(tree(b), declared_path="exams/ACME-2/gone.json"),
                  True, "is missing"))
    cases.append(("plugin whose hash does not match",
                  lambda b: plugin(tree(b), sha="0" * 64),
                  True, "hash mismatch"))

    # A plugin claiming an ID the built-in tree owns — the REQ-MAN-05 case.
    def collision(base):
        tree(base)
        pdir = base / "plugins" / "copycat"
        content = pdir / "content"
        (content / "exams" / "ACME-1").mkdir(parents=True)
        exam_file = content / "exams" / "ACME-1" / "exam.json"
        exam_file.write_text(json.dumps({
            "examId": "ACME-1", "vendor": "X", "displayName": "X",
        }), encoding="utf-8")
        (pdir / PLUGIN_MANIFEST_NAME).write_text(json.dumps({
            "schemaVersion": 1, "pluginId": "copycat", "vendor": "X",
            "displayName": "Copycat", "contentRoot": "content", "files": [],
        }), encoding="utf-8")
        return base

    cases.append(("plugin claiming a built-in exam ID", collision,
                  True, "exam ID 'ACME-1' is already claimed by"))

    def no_plugin_json(base):
        tree(base)
        (base / "plugins" / "broken").mkdir(parents=True)
        return base

    cases.append(("plugin directory with no plugin.json", no_plugin_json,
                  True, "no plugin.json"))

    failures = 0
    for name, build, expect_fail, needle in cases:
        tmp = pathlib.Path(tempfile.mkdtemp())
        try:
            errors = run(build(tmp), DEFAULT_PLUGIN_ROOTS)
            if expect_fail:
                if not errors:
                    print(f"SELF-TEST FAIL: '{name}' passed the gate — the gate cannot detect it")
                    failures += 1
                elif needle and not any(needle in e for e in errors):
                    print(f"SELF-TEST FAIL: '{name}' failed, but not for the defect it seeds")
                    for e in errors:
                        print(f"      | {e}")
                    failures += 1
            elif errors:
                print(f"SELF-TEST FAIL: '{name}' failed the gate — it is punishing valid input")
                for e in errors:
                    print(f"      | {e}")
                failures += 1
        finally:
            shutil.rmtree(tmp, ignore_errors=True)

    if failures:
        print(f"self-test: {failures} of {len(cases)} cases failed")
        return 2
    print(f"self-test: {len(cases)} seeded cases behaved as specified")
    return 0


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--root", default=str(REPO_ROOT),
                        help="repository root to validate (default: this repo)")
    parser.add_argument("--plugin-root", action="append", default=None,
                        help="directory holding plugin subdirectories, relative to --root "
                             "(repeatable; default: plugins)")
    parser.add_argument("--self-test", action="store_true",
                        help="assert the gate catches each seeded defect")
    args = parser.parse_args()

    if args.self_test:
        return self_test()

    root = pathlib.Path(args.root).resolve()
    plugin_roots = tuple(args.plugin_root) if args.plugin_root else DEFAULT_PLUGIN_ROOTS

    errors = run(root, plugin_roots)
    if errors:
        for error in errors:
            print(error, file=sys.stderr)
        print(f"\n{len(errors)} violation(s)", file=sys.stderr)
        return 1

    print(f"OK: content tree and plugin manifests valid under {root}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
