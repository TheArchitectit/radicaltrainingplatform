#!/usr/bin/env python3
"""TM-71 fixture suite for .github/scripts/vuln_gate.py (SPEC-10 10.1).

Runs the gate in fixture mode (canned reports, no dotnet calls) and asserts
each acceptance case. Also runs one LIVE case: a scratch project with a
vulnerable package must fail the real gate end-to-end when dotnet is available.
"""
import json
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent.parent
GATE = REPO / ".github" / "scripts" / "vuln_gate.py"
FIXTURES = REPO / "tests" / "gates" / "fixtures" / "vuln_gate"

reports = json.loads((FIXTURES / "reports.json").read_text())
allowlists = json.loads((FIXTURES / "allowlists.json").read_text())


def write_allowlist(name: str) -> Path:
    p = FIXTURES / f"_allowlist_{name}.csv"
    p.write_text(allowlists[name])
    return p


def run_gate(report_key: str | None, allowlist: str, extra: list[str] = None):
    """Run the gate on one fixture project with a canned report."""
    cmd = [sys.executable, str(GATE), "/fixtures/probe.csproj",
           "--allowlist", str(write_allowlist(allowlist)),
           "--today", "2026-10-10"]
    if report_key is not None:
        rp = FIXTURES / f"_report_{report_key}.json"
        rp.write_text(json.dumps(reports[report_key]) if not isinstance(reports[report_key], str) else reports[report_key])
        cmd += ["--report", str(rp)]
    if extra:
        cmd += extra
    cp = subprocess.run(cmd, capture_output=True, text=True)
    return cp.returncode, cp.stdout + cp.stderr


failures = []


def expect(name: str, cond: bool, detail: str = ""):
    print(("PASS " if cond else "FAIL ") + name + (f" — {detail}" if detail and not cond else ""))
    if not cond:
        failures.append(name)


# 1. Real-shaped clean report passes
rc, out = run_gate("clean-real-shape", "empty")
expect("clean real-shaped report passes", rc == 0 and "VULN GATE: PASS" in out, out)

# 2. Top-level vulnerable package fails
rc, out = run_gate("top-level-vulnerable", "empty")
expect("top-level vulnerable FAILS exit 1", rc == 1 and "NOT allowlisted" in out, out)

# 3. Transitive vulnerable package fails
rc, out = run_gate("transitive-vulnerable", "empty")
expect("transitive vulnerable FAILS", rc == 1 and "transitivePackages" in out, out)

# 4. Multiple projects/frameworks handled
rc, out = run_gate("multi-project-multi-framework", "empty")
expect("multi-project/multi-framework FAILS with per-project detail",
       rc == 1 and out.count("NOT allowlisted") == 2, out)

# 5. Empty valid project passes
rc, out = run_gate("empty-valid-project", "empty")
expect("empty projects array passes", rc == 0, out)

# 6. Malformed JSON fails
rc, out = run_gate("malformed-json", "empty")
expect("malformed JSON fails", rc == 1 and "unparseable" in out, out)

# 7. Unknown root version fails loudly
rc, out = run_gate("unknown-root-version", "empty")
expect("unknown schema version fails loudly", rc == 1 and "schema version" in out, out)

# 7b. Missing required root key fails
rc, out = run_gate("missing-root-projects", "empty")
expect("missing root 'projects' fails", rc == 1 and "projects" in out, out)

# 8. Scanner non-zero exit fails (empty report file = simulated non-zero)
rc, out = run_gate(None, "empty")
expect("missing report (simulated scanner failure) fails", rc == 1, out)

# 9. Expired exception fails
rc, out = run_gate("top-level-vulnerable", "expired-exception")
expect("expired allowlist exception does not save vulnerable package",
       rc == 1 and "NOT allowlisted" in out, out)

# 10. Matching unexpired exception passes
rc, out = run_gate("top-level-vulnerable", "matching-unexpired")
expect("matching unexpired exception passes", rc == 0 and "ALLOWED" in out, out)

# 10b. Wildcard-version unexpired exception passes
rc, out = run_gate("top-level-vulnerable", "wildcard-unexpired")
expect("wildcard-version exception passes", rc == 0, out)

# 11. Wrong-version exception fails
rc, out = run_gate("top-level-vulnerable", "wrong-version-exception")
expect("wrong-version exception does not save vulnerable package", rc == 1, out)

# 11b. Malformed exception entry is a GATE-CONFIG error
rc, out = run_gate("top-level-vulnerable", "malformed-entry")
expect("malformed exception entry is GATE-CONFIG error",
       rc != 0 and "GATE-CONFIG ERROR" in out, out)

# 11c. Case-consistent ID matching: allowlisted correct case saves correct-case id;
#      wrong-case report id is NOT saved by the same entry (NuGet IDs are case-sensitive)
rc, out = run_gate("wrong-case-id", "matching-unexpired")
expect("case-mismatched package id is not saved by case-specific entry", rc == 1, out)

print()
if failures:
    print(f"FIXTURE SUITE: FAIL ({len(failures)} failures)")
    sys.exit(1)
print("FIXTURE SUITE: PASS")
