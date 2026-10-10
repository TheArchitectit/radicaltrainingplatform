#!/usr/bin/env python3
"""Blocking vulnerability gate for dotnet packages.

Scans each project with `dotnet list <proj> package --vulnerable --include-transitive`
and FAILS if any vulnerable package is not covered by an unexpired allowlist entry.

Parses the documented machine-readable shape: a root object with `version`,
`parameters`, `projects[]`, each project `frameworks[]`, each framework
`topLevelPackages[]` and `transitivePackages[]` with lowercase `advisoryurl`.
The previous implementation iterated `data if isinstance(data, list) else []`,
which matched nothing — every project reported clean and the gate printed PASS
even for a High-severity advisory (verified live with Newtonsoft.Json 12.0.1).

Allowlist: .github/vuln-allowlist.csv
Columns: package,resolved_version,expires,justification,approver
- `resolved_version` empty or `*` matches any version.
- `expires` is REQUIRED (ISO date); expired entries are treated as not-allowed.
- `approver` is REQUIRED; invalid dates and malformed rows are GATE-CONFIG errors.
This gate must never be weakened to pass: fix the vulnerable package instead.
"""
import argparse
import csv
import json
import subprocess
import sys
from datetime import date

ALLOWLIST = ".github/vuln-allowlist.csv"
ALLOWLIST_OVERRIDE = None

REQUIRED_ROOT_KEYS = ("version", "projects")


def load_allowlist():
    entries = {}
    path = ALLOWLIST_OVERRIDE or ALLOWLIST
    try:
        with open(path, newline="") as f:
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
        try:
            expiry = date.fromisoformat(exp)
        except ValueError:
            sys.exit(f"GATE-CONFIG ERROR: allowlist entry for {pid} has invalid expiry '{exp}' (ISO date required)")
        if not (e.get("justification") or "").strip():
            sys.exit(f"GATE-CONFIG ERROR: allowlist entry for {pid} has no justification")
        if not (e.get("approver") or "").strip():
            sys.exit(f"GATE-CONFIG ERROR: allowlist entry for {pid} has no approver")
        if expiry >= today:
            return True
    return False


def extract_vulnerable_packages(report):
    """Yield (project_path, framework, package_dict) from a scanner report."""
    if not isinstance(report, dict):
        raise ValueError("report root is not an object")
    for key in REQUIRED_ROOT_KEYS:
        if key not in report:
            raise ValueError(f"report root missing required key '{key}'")
    version = report["version"]
    if version != 1:
        raise ValueError(f"unknown report schema version {version!r} (expected 1)")
    for project in report["projects"]:
        proj_path = project.get("path", "<unknown project>")
        for framework in project.get("frameworks", []):
            fw_name = framework.get("framework", "<unknown framework>")
            for group in ("topLevelPackages", "transitivePackages"):
                for pkg in framework.get(group, []):
                    yield proj_path, fw_name, group, pkg


def scan_project(proj, entries, today, report_override=None):
    """Run the scanner and return (failed, lines).

    report_override: path to a canned scanner report (fixture mode). An empty
    file simulates a scanner non-zero exit.
    """
    if report_override is not None:
        try:
            raw = open(report_override, encoding="utf-8").read()
        except OSError as e:
            return True, [f"FAIL {proj}: cannot read report override ({e})"]
        if raw.strip() == "":
            return True, [f"FAIL {proj}: scanner exited 1 (simulated)"]
        stdout, returncode = raw, 0
    else:
        cp = subprocess.run(
            ["dotnet", "list", proj, "package", "--vulnerable",
             "--include-transitive", "--format", "json"],
            capture_output=True, text=True)
        if cp.returncode != 0:
            return True, [f"FAIL {proj}: scanner exited {cp.returncode}", cp.stderr]
        stdout, returncode = cp.stdout, cp.returncode
    try:
        data = json.loads(stdout)
    except json.JSONDecodeError as e:
        return True, [f"FAIL {proj}: unparseable scanner output ({e})"]
    try:
        found = list(extract_vulnerable_packages(data))
    except ValueError as e:
        return True, [f"FAIL {proj}: unrecognized scanner report shape ({e})"]
    lines = []
    failed = False
    hits = 0
    for proj_path, fw_name, group, pkg in found:
        pid = pkg.get("id") or "<unknown>"
        ver = pkg.get("resolvedVersion") or "<unknown>"
        hits += 1
        if allow_for(entries, pid, ver, today):
            lines.append(f"ALLOWED {proj}: {pid} {ver} ({group}, allowlisted, unexpired)")
        else:
            sevs = [v.get("severity") for v in pkg.get("vulnerabilities", [])]
            urls = [v.get("advisoryurl") for v in pkg.get("vulnerabilities", [])]
            lines.append(f"FAIL {proj}: {pid} {ver} vulnerable ({group}) and NOT allowlisted")
            if sevs:
                lines.append(f"     severity={sevs} advisories={urls}")
            failed = True
    if hits == 0:
        lines.append(f"OK {proj}: no vulnerable packages")
    return failed, lines


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("projects", nargs="*", help="csproj files to scan")
    parser.add_argument(
        "--report",
        action="append",
        default=[],
        help="fixture mode: canned scanner report file(s), one per project, "
             "instead of invoking dotnet (test harness only)",
    )
    parser.add_argument(
        "--allowlist",
        default=ALLOWLIST,
        help="allowlist CSV override (fixture mode)",
    )
    parser.add_argument(
        "--today",
        default=None,
        help="fixture mode: ISO date to evaluate expiries against",
    )
    args = parser.parse_args()
    projects = args.projects
    if not projects:
        parser.error("usage: vuln_gate.py <csproj> [csproj...]")
    if args.report and len(args.report) != len(projects):
        parser.error("--report count must match project count")

    global ALLOWLIST_OVERRIDE
    ALLOWLIST_OVERRIDE = args.allowlist
    entries = load_allowlist()
    today = date.fromisoformat(args.today) if args.today else date.today()
    failed = False
    for i, proj in enumerate(projects):
        override = args.report[i] if args.report else None
        proj_failed, lines = scan_project(proj, entries, today, report_override=override)
        for line in lines:
            print(line)
        failed = failed or proj_failed
    if failed:
        print("VULN GATE: FAIL")
        sys.exit(1)
    print("VULN GATE: PASS")


if __name__ == "__main__":
    main()
