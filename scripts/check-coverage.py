#!/usr/bin/env python3
"""Enforce a minimum line-coverage threshold on Core (CI-02 / ASM-11).

Reads a coverlet cobertura XML (the artifact of
`dotnet test --collect:"XPlat Code Coverage"`) and fails when the
line-rate is below the threshold.

Threshold: 70% line coverage on Core (Plan v2 D-04, recorded as ASM-11).
Override with --threshold for local experiments; CI passes the default.

Excluded from the denominator: coverlet's generated-regex compiler output
(obj/Release/.../RegexGenerator.g.cs) — those lines are compiler-emitted
boilerplate, not authored code.

Exit codes:
  0 — at or above threshold
  1 — below threshold, or the report is missing/unparseable
  2 — fixture assertion failed (--self-test)
"""
import argparse
import glob
import os
import sys
import xml.etree.ElementTree as ET

DEFAULT_THRESHOLD = 0.70

# The gate measures Core, so the report it reads must be the one Core.Tests
# produced. The old `sorted(...)[-1]` picked the lexicographically last path,
# which is Desktop.Tests whenever both projects collected coverage — a gate
# silently measuring the wrong assembly. Prefer the Core.Tests tree; if that
# does not disambiguate, refuse rather than guess.
CORE_TESTS_SEGMENT = "RadicalTrainingPlatform.Core.Tests/"


def select_report(candidates: list[str]) -> str | None:
    """Pick the Core.Tests report, or None when the choice is ambiguous."""
    normalized = [p.replace(os.sep, "/") for p in candidates]
    preferred = [p for p, norm in zip(candidates, normalized)
                 if CORE_TESTS_SEGMENT in norm]
    if len(preferred) == 1:
        return preferred[0]
    if len(preferred) > 1:
        # Repeated runs leave several; the newest is the one just produced.
        return max(preferred, key=lambda p: (os.path.getmtime(p), p))
    if len(candidates) == 1:
        # A caller may have moved the report; an unambiguous single file is fine.
        return candidates[0]
    return None


def find_report(explicit: str | None) -> str:
    if explicit:
        return explicit
    candidates = sorted(glob.glob("**/coverage.cobertura.xml", recursive=True))
    if not candidates:
        print("COVERAGE: no coverage.cobertura.xml found (did --collect run?)", file=sys.stderr)
        sys.exit(1)
    report = select_report(candidates)
    if report is None:
        print(
            "COVERAGE: several coverage reports exist and none is under "
            f"{CORE_TESTS_SEGMENT}; pass the report path explicitly. Found: "
            + ", ".join(candidates),
            file=sys.stderr,
        )
        sys.exit(1)
    return report


def line_rate(path: str) -> tuple[float, int, int]:
    """Return (rate, covered, valid) over authored source only."""
    root = ET.parse(path).getroot()
    covered = valid = 0
    for pkg in root.findall(".//package"):
        for cls in pkg.findall("./classes/class"):
            filename = cls.get("filename") or ""
            name = cls.get("name") or ""
            if filename.startswith("obj/") or "RegexGenerator" in name:
                continue
            for line in cls.findall("./lines/line"):
                valid += 1
                if int(line.get("hits") or 0) > 0:
                    covered += 1
    if valid == 0:
        print(f"COVERAGE: {path} contains no countable lines", file=sys.stderr)
        sys.exit(1)
    return covered / valid, covered, valid


def run_self_test() -> int:
    import tempfile
    import pathlib

    def write_cobertura(path: pathlib.Path, rate: float) -> None:
        # One class, 10 lines, `hits` set to hit the requested rate.
        n = 10
        hits = round(rate * n)
        lines = "\n".join(
            f'          <line number="{i}" hits="{1 if i <= hits else 0}"/>'
            for i in range(1, n + 1)
        )
        path.write_text(
            f"""<?xml version="1.0"?>
<coverage line-rate="{rate}" branch-rate="0">
  <packages>
    <package name="RadicalTrainingPlatform.Core" line-rate="{rate}">
      <classes>
        <class name="Foo" filename="Foo.cs">
          <lines>
{lines}
          </lines>
        </class>
      </classes>
    </package>
  </packages>
</coverage>
""",
            encoding="utf-8",
        )

    failures = []
    with tempfile.TemporaryDirectory() as td:
        base = pathlib.Path(td)

        # Below-threshold fixture must fail.
        low = base / "low.xml"
        write_cobertura(low, 0.40)
        rate, _, _ = line_rate(str(low))
        if rate >= DEFAULT_THRESHOLD:
            failures.append(f"below-threshold fixture parsed as {rate:.2%}")

        # Above-threshold fixture must pass.
        high = base / "high.xml"
        write_cobertura(high, 0.90)
        rate, _, _ = line_rate(str(high))
        if rate < DEFAULT_THRESHOLD:
            failures.append(f"above-threshold fixture parsed as {rate:.2%}")

        # Generated-regex output is excluded from the denominator.
        mixed = base / "mixed.xml"
        mixed.write_text(
            """<?xml version="1.0"?>
<coverage line-rate="0.5" branch-rate="0">
  <packages>
    <package name="RadicalTrainingPlatform.Core" line-rate="0.5">
      <classes>
        <class name="System.Text.RegularExpressions.Generated.&lt;RegexGenerator_g&gt;X" filename="obj/Release/net10.0/RegexGenerator.g.cs">
          <lines>
            <line number="1" hits="0"/><line number="2" hits="0"/>
          </lines>
        </class>
        <class name="Real" filename="Services/Real.cs">
          <lines>
            <line number="1" hits="1"/><line number="2" hits="1"/>
            <line number="3" hits="1"/><line number="4" hits="1"/>
            <line number="5" hits="1"/><line number="6" hits="1"/>
            <line number="7" hits="1"/><line number="8" hits="1"/>
            <line number="9" hits="1"/><line number="10" hits="0"/>
          </lines>
        </class>
      </classes>
    </package>
  </packages>
</coverage>
""",
            encoding="utf-8",
        )
        rate, covered, valid = line_rate(str(mixed))
        if valid != 10 or covered != 9 or abs(rate - 0.9) > 1e-9:
            failures.append(
                f"generated-regex lines must be excluded (got {covered}/{valid} = {rate:.2%})"
            )

        # Report selection: two reports exist, and the lexicographically last
        # one (Desktop.Tests) used to win. The Core.Tests report must win now.
        core_dir = base / "RadicalTrainingPlatform.Core.Tests" / "TestResults"
        desk_dir = base / "RadicalTrainingPlatform.Desktop.Tests" / "TestResults"
        core_dir.mkdir(parents=True)
        desk_dir.mkdir(parents=True)
        core_report = core_dir / "coverage.cobertura.xml"
        desk_report = desk_dir / "coverage.cobertura.xml"
        write_cobertura(core_report, 0.90)
        write_cobertura(desk_report, 0.10)
        chosen = select_report([str(desk_report), str(core_report)])
        if chosen != str(core_report):
            failures.append(
                f"the Core.Tests report must win over Desktop.Tests (chose {chosen})"
            )
        if select_report([str(desk_report)]) != str(desk_report):
            failures.append("a single report must be accepted wherever it sits")
        other = base / "SomeOtherProject" / "coverage.cobertura.xml"
        other.parent.mkdir(parents=True)
        write_cobertura(other, 0.50)
        if select_report([str(desk_report), str(other)]) is not None:
            failures.append("ambiguous reports must be refused, not guessed")

    if failures:
        for f in failures:
            print(f"FAIL fixture: {f}", file=sys.stderr)
        return 2
    print("SELF-TEST: PASS (below fails, above passes, generated lines excluded, "
          "Core.Tests report selected)")
    return 0


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("report", nargs="?", help="path to coverage.cobertura.xml")
    parser.add_argument("--threshold", type=float, default=DEFAULT_THRESHOLD,
                        help=f"minimum line-rate (default {DEFAULT_THRESHOLD})")
    parser.add_argument("--self-test", action="store_true",
                        help="run the failing/passing fixture pair and exit")
    args = parser.parse_args()

    if args.self_test:
        sys.exit(run_self_test())

    path = find_report(args.report)
    rate, covered, valid = line_rate(path)

    print(f"COVERAGE: {covered}/{valid} lines = {rate:.2%} (threshold {args.threshold:.0%})")
    if rate < args.threshold:
        print(
            f"COVERAGE FAIL: line-rate {rate:.2%} is below the {args.threshold:.0%} threshold "
            f"(CI-02 / ASM-11)",
            file=sys.stderr,
        )
        sys.exit(1)
    print(f"COVERAGE OK: {rate:.2%} >= {args.threshold:.0%}")


if __name__ == "__main__":
    main()
