#!/usr/bin/env python3
"""Legacy bridge surface truth (R-05 / R-19).

The Legacy WinForms project is `net10.0-windows` and cannot be built or tested
on the Linux CI fleet, so its bridge surface is checked on the source, the way
`check-packaging-manifests.py` checks the packaging claims that cannot be run
here. What the check can still prove is the thing R-05 actually asks for:

  * the surface the bridge documents is the surface it registers — a listing
    that drifts from the registrations is a test failure
  * every type the simulator's JS sends is registered, so no call can hang to
    its 10-second timeout against a host that will never answer
  * a type that is not registered is answered with a failure response, not
    dropped into silence
  * the surface is listable (HandlerTypes) so a test can assert on it
  * no handler from the removed set (submit_answer, export_results,
    import_results, get_settings, set_setting) reappears without an
    implementation — those acknowledged without effect and were removed in
    T-15/S46-05

The desktop Avalonia bridge (CefBridge.cs) is a different, wider surface with
real backing implementations; it is covered by
RadicalTrainingPlatform.Desktop.Tests/CefBridgeHandlerTests.cs, which runs.
This check covers only the Legacy host.

Usage:
  python3 scripts/check-legacy-bridge.py
  python3 scripts/check-legacy-bridge.py --root <tree>
  python3 scripts/check-legacy-bridge.py --self-test

Exit codes:
  0 — the Legacy bridge's surface matches what it documents and what JS calls
  1 — it does not
  2 — self-test assertion failed
"""
import argparse
import pathlib
import re
import shutil
import sys
import tempfile

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent

BRIDGE = "RadicalTrainingPlatform.Legacy.WinForms/LabSimulator/LabSimulatorBridge.cs"
JS_DIR = "RadicalTrainingPlatform.Legacy.WinForms/LabSimulator/Web/js"

# Handlers removed in T-15/S46-05: each acknowledged without an effect. A
# handler with no backing implementation is absent from the surface, and
# listing one is a test failure.
REMOVED = ("submit_answer", "export_results", "import_results",
           "get_settings", "set_setting")

# The comment marker that introduces the documented surface.
SURFACE_MARKER = "deliberately narrow"

REGISTERED = re.compile(r'\bOn\(\s*"(?P<type>[\w]+)"')
LISTED = re.compile(r"^\s*///\s+(?P<list>[a-z_]+(?:,\s*[a-z_]+)+)\s*$", re.MULTILINE)
JS_CALL = re.compile(r"\bbridge\.(?:send|post)\(\s*['\"](?P<type>[\w]+)['\"]")


def read(root, rel):
    path = pathlib.Path(root) / rel
    if not path.is_file():
        raise SystemExit(f"missing bridge file: {rel}")
    return path.read_text(encoding="utf-8")


def registered(text):
    return {m.group("type") for m in REGISTERED.finditer(text)}


def documented(text):
    """The handler list in the doc comment, as a set.

    Anchored to the marker phrase so an unrelated comma list elsewhere in the
    file cannot be mistaken for the surface declaration.
    """
    idx = text.find(SURFACE_MARKER)
    if idx < 0:
        return None
    m = LISTED.search(text, idx)
    if not m:
        return None
    return {t.strip() for t in m.group("list").split(",")}


def js_calls(root):
    base = pathlib.Path(root) / JS_DIR
    calls = {}
    for path in sorted(base.rglob("*.js")):
        for m in JS_CALL.finditer(path.read_text(encoding="utf-8")):
            calls.setdefault(m.group("type"), []).append(
                str(path.relative_to(pathlib.Path(root))))
    return calls


def check(root, fail):
    text = read(root, BRIDGE)
    reg = registered(text)
    doc = documented(text)

    # R-05: the documented surface is the registered surface.
    if doc is None:
        fail(f"{BRIDGE}: no documented handler surface found (looked for a "
             f"comma list after {SURFACE_MARKER!r}) — a surface nobody states is "
             f"a surface nobody can hold to")
    elif doc != reg:
        missing = sorted(doc - reg)
        extra = sorted(reg - doc)
        fail(f"{BRIDGE}: the documented surface {sorted(doc)} does not match the "
             f"registered handlers {sorted(reg)}"
             + (f"; documented but not registered: {missing}" if missing else "")
             + (f"; registered but not documented: {extra}" if extra else ""))

    # R-05: a type with no implementation must not be on the surface.
    for gone in REMOVED:
        if gone in reg:
            fail(f"{BRIDGE}: registers {gone!r}, which has no backing "
                 f"implementation — it acknowledged without an effect and was "
                 f"removed in T-15/S46-05")

    # The JS must not call a type the host will never answer: the promise would
    # hang for its full timeout and then report a dead host.
    for call, where in sorted(js_calls(root).items()):
        if call not in reg:
            fail(f"{where[0]}: calls bridge.{call}() but {BRIDGE} registers no such "
                 f"handler — the call can only time out")

    # The surface must be listable, so a test can assert on it rather than on
    # the prose. Matched as a declaration: a mention in a comment, or a renamed
    # property that still contains the word, is not a surface.
    if not re.search(r"public\s+IReadOnlyCollection<string>\s+HandlerTypes\s*=>", text):
        fail(f"{BRIDGE}: exposes no HandlerTypes surface, so no test can list what "
             f"the bridge answers")

    # An unknown type must be answered, not dropped. Silence costs the caller
    # its timeout and misreports the cause as a dead host.
    if not re.search(r"unknown type", text):
        fail(f"{BRIDGE}: does not answer an unimplemented message type; an unknown "
             f"type is dropped and the caller waits out its timeout")
    if not re.search(r"else\s*\{", text):
        fail(f"{BRIDGE}: has no fallback branch for an unregistered type")

    # Parity with the desktop bridge's log handler: reading "message" with
    # GetProperty throws on a payload that has none, which would answer a bare
    # log line with a KeyNotFoundException.
    if "TryGetProperty(\"message\"" not in text:
        fail(f"{BRIDGE}: its log handler does not tolerate a payload with no "
             f"'message' key — GetProperty throws and the log call fails")


def run_checks(root):
    failures = []
    check(root, failures.append)
    return failures


# ── fixtures ────────────────────────────────────────────────────────────────
# Each mutation reintroduces one defect the checker exists to catch. The bridge
# cannot be compiled here, so these are seeded on a copy of the source.

def _copy_tree(root, dest):
    for rel in (BRIDGE,):
        out = pathlib.Path(dest) / rel
        out.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(pathlib.Path(root) / rel, out)
    base = pathlib.Path(root) / JS_DIR
    for path in base.rglob("*.js"):
        out = pathlib.Path(dest) / path.relative_to(root)
        out.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, out)


MUTATIONS = [
    (BRIDGE,
     "            else\n            {\n                // R-05 / R-19:",
     "            else if (false)\n            {\n                // R-05 / R-19:",
     "an unknown type is dropped instead of answered"),
    (BRIDGE,
     '        On("log", payload =>',
     '        On("get_settings", _ => Task.FromResult<object?>(null));\n'
     '        On("log", payload =>',
     "a removed no-effect handler is back on the surface"),
    (BRIDGE,
     "///   ready, log",
     "///   ready, log, get_stats",
     "the documented surface drifts from the registrations"),
    (BRIDGE,
     '            var msg = payload is { ValueKind: JsonValueKind.Object } p &&\n'
     '                      p.TryGetProperty("message", out var m)',
     '            var msg = payload?.GetProperty("message").GetString()',
     "the log handler throws on a payload with no message"),
    (BRIDGE,
     "    public IReadOnlyCollection<string> HandlerTypes =>",
     "    private IReadOnlyCollection<string> HandlerTypesUnused =>",
     "the surface is no longer listable"),
]

# A JS call to a type the host does not implement: the call can only time out.
JS_MUTATION = (JS_DIR + "/app.js", "bridge.post('ready');",
               "bridge.post('ready');\n        bridge.send('get_stats');",
               "the JS calls a type the Legacy host does not implement")


def self_test():
    root = REPO_ROOT
    failures = []

    for f in run_checks(root):
        failures.append(f"the shipped bridge does not pass its own check: {f}")

    # A pristine copy must pass, or the must-fail fixtures prove nothing.
    with tempfile.TemporaryDirectory() as td:
        _copy_tree(root, td)
        if run_checks(td):
            failures.append("a pristine copy of the bridge failed the check, so the "
                            "must-fail fixtures prove nothing")

    for rel, needle, replacement, description in MUTATIONS + [JS_MUTATION]:
        with tempfile.TemporaryDirectory() as td:
            _copy_tree(root, td)
            target = pathlib.Path(td) / rel
            text = target.read_text(encoding="utf-8")
            if needle not in text:
                failures.append(f"fixture anchor not found in {rel}: {needle!r} "
                                f"({description})")
                continue
            target.write_text(text.replace(needle, replacement, 1), encoding="utf-8")
            if not run_checks(td):
                failures.append(f"the checker passed a mutated {rel} ({description})")

    if failures:
        for f in failures:
            print(f"SELF-TEST FAILURE: {f}", file=sys.stderr)
        return 2
    print(f"check-legacy-bridge self-test: all {len(MUTATIONS) + 1} seeded defects "
          f"were caught, and the clean bridge passed")
    return 0


def main():
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--root", default=str(REPO_ROOT), help="tree to check")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()

    if args.self_test:
        sys.exit(self_test())

    failures = run_checks(args.root)
    if failures:
        for f in failures:
            print(f"LEGACY BRIDGE CHECK: FAIL — {f}", file=sys.stderr)
        sys.exit(1)
    print("LEGACY BRIDGE CHECK: PASS — the Legacy bridge answers exactly what it "
          "documents, and answers everything else honestly")
    return 0


if __name__ == "__main__":
    sys.exit(main())
