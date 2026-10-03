#!/usr/bin/env python3
"""Blocking vulnerability gate for dotnet packages.

Scans each project with `dotnet list <proj> package --vulnerable --include-transitive`
and FAILS if any vulnerable package is not covered by an unexpired allowlist entry.

Allowlist: .github/vuln-allowlist.csv
Columns: package,resolved_version,expires,justification
- `resolved_version` empty or `*` matches any version.
- `expires` is REQUIRED (ISO date); expired entries are treated as not-allowed.
This gate must never be weakened to pass: fix the vulnerable package instead.
"""
import csv
import json
import subprocess
import sys
from datetime import date

ALLOWLIST = ".github/vuln-allowlist.csv"


def load_allowlist():
    entries = {}
    try:
        with open(ALLOWLIST, newline="") as f:
            for row in csv.DictReader(f):
                pid = (row.get("package") or "").strip()
                if not pid or pid.startswith("#"):
                    continue
                entries.setdefault(pid, []).append(row)
    except FileNotFoundError:
        pass  # empty allowlist = no exceptions
    return entries


def allow_for(entries, pid, version, today):
    for e in entries.get(pid, []):
        rv = (e.get("resolved_version") or "").strip()
        if rv not in ("", "*") and rv != version:
            continue
        exp = (e.get("expires") or "").strip()
        if not exp:
            sys.exit(f"GATE-CONFIG ERROR: allowlist entry for {pid} has no expiry date - every exception needs an expiry")
        if date.fromisoformat(exp) >= today:
            return True
    return False


def main():
    projects = sys.argv[1:]
    if not projects:
        sys.exit("usage: vuln_gate.py <csproj> [csproj...]")
    today = date.today()
    entries = load_allowlist()
    failed = False
    for proj in projects:
        cp = subprocess.run(
            ["dotnet", "list", proj, "package", "--vulnerable",
             "--include-transitive", "--format", "json"],
            capture_output=True, text=True)
        if cp.returncode != 0:
            print(f"FAIL {proj}: scanner exited {cp.returncode}\n{cp.stderr}")
            failed = True
            continue
        try:
            data = json.loads(cp.stdout)
        except json.JSONDecodeError as e:
            print(f"FAIL {proj}: unparseable scanner output ({e})")
            failed = True
            continue
        hits = 0
        for item in data if isinstance(data, list) else []:
            for pkg in item.get("packages", []):
                pid = pkg.get("id") or pkg.get("Id") or "<unknown>"
                ver = pkg.get("resolvedVersion") or pkg.get("ResolvedVersion") or "<unknown>"
                hits += 1
                if allow_for(entries, pid, ver, today):
                    print(f"ALLOWED {proj}: {pid} {ver} (allowlisted, unexpired)")
                else:
                    print(f"FAIL {proj}: {pid} {ver} vulnerable and NOT allowlisted")
                    sevs = [v.get("severity") for v in pkg.get("vulnerabilities", [])]
                    urls = [v.get("advisoryUrl") for v in pkg.get("vulnerabilities", [])]
                    if sevs:
                        print(f"     severity={sevs} advisories={urls}")
                    failed = True
        if hits == 0:
            print(f"OK {proj}: no vulnerable packages")
    if failed:
        sys.exit(1)
    print("VULN GATE: PASS")


if __name__ == "__main__":
    main()
