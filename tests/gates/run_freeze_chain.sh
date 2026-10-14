#!/usr/bin/env bash
# Freeze gate chain (T-29 / S47-13).
#
# Runs the gate chain exactly as CI runs it — the same commands, in the same
# order, as .github/workflows/build.yml and pwa-deploy.yml — and reports one
# PASS/FAIL per gate plus an "N/N at <sha>" total. That total is what the
# freeze record quotes (SPEC-16 16.6: "full gate output with pass counts
# (N/N at SHA)").
#
# Why a runner and not a pasted transcript: a pasted transcript cannot be
# re-run, and the freeze record's whole value is that someone else can
# reproduce it at the named SHA. This is the same discipline the other
# tests/gates/run_*_fixtures.sh runners follow.
#
# It does NOT assert greenness beyond exiting non-zero on any failure, and it
# deliberately does not hide a red gate: the freeze record is written from the
# output, red or green.
#
# Usage:
#   bash tests/gates/run_freeze_chain.sh [--log PATH] [--expect-sha SHA]
#
#   --log PATH        also write the full transcript to PATH
#   --expect-sha SHA  fail if HEAD is not SHA, so a record cannot quote a
#                     total measured at a different commit
#
# Exit 0 only when every gate passed AND (if given) HEAD matched --expect-sha.
set -u
cd "$(dirname "$0")/../.."

LOG=""
EXPECT_SHA=""
while [ $# -gt 0 ]; do
    case "$1" in
        --log)        LOG="${2:-}"; shift 2 ;;
        --expect-sha) EXPECT_SHA="${2:-}"; shift 2 ;;
        *) echo "unknown argument: $1" >&2; exit 2 ;;
    esac
done

HEAD_SHA="$(git rev-parse HEAD)"
SHORT_SHA="$(git rev-parse --short HEAD)"

if [ -n "$LOG" ]; then
    # Tee everything to the log while still reporting progress to the caller.
    exec > >(tee "$LOG") 2>&1
fi

echo "FREEZE GATE CHAIN"
echo "head:   $HEAD_SHA"
echo "branch: $(git rev-parse --abbrev-ref HEAD)"
echo "date:   $(date -Iseconds)"
echo

pass=0
total=0
failed_names=""

# One gate. The name is what the freeze record quotes, so it names the command
# a reader would re-run, not a friendly label.
gate() {
    local name="$1"; shift
    total=$((total + 1))
    local out
    if out="$("$@" 2>&1)"; then
        pass=$((pass + 1))
        printf 'PASS  %s\n' "$name"
    else
        failed_names="$failed_names $name"
        printf 'FAIL  %s\n' "$name"
        printf '%s\n' "$out" | sed 's/^/      | /' | tail -20
    fi
}

# ── Content and identity gates (build.yml) ──
gate "python3 scripts/lint-content.py"                  python3 scripts/lint-content.py
gate "python3 scripts/lint-content.py --self-test"      python3 scripts/lint-content.py --self-test
gate "python3 scripts/validate-manifests.py"            python3 scripts/validate-manifests.py
gate "python3 scripts/validate-manifests.py --self-test" python3 scripts/validate-manifests.py --self-test
gate "python3 scripts/check-item-identity.py"           python3 scripts/check-item-identity.py
gate "python3 scripts/check-item-identity.py --self-test" python3 scripts/check-item-identity.py --self-test
gate "python3 scripts/check-item-types.py"              python3 scripts/check-item-types.py
gate "python3 scripts/check-item-types.py --self-test"  python3 scripts/check-item-types.py --self-test
gate "python3 scripts/generate-study-content.py --check" python3 scripts/generate-study-content.py --check
# Added in Sprint 48 (S48-01). The Sprint 47 freeze record's "39/39 at 0d1f565"
# was produced by the 39-gate revision of this script, which is still
# reproducible from git: `git show 0d1f565:tests/gates/run_freeze_chain.sh`.
gate "python3 scripts/check-nca-remap.py"              python3 scripts/check-nca-remap.py
gate "bash tests/gates/run_remap_fixtures.sh"          bash tests/gates/run_remap_fixtures.sh
# Added in Sprint 48 (S48-04): the cheatsheet must not contradict applied errata.
gate "python3 scripts/check-nca-cheatsheet.py"         python3 scripts/check-nca-cheatsheet.py
gate "bash tests/gates/run_cheatsheet_fixtures.sh"     bash tests/gates/run_cheatsheet_fixtures.sh
# Added in Sprint 48 (S47-16, R-12/T-25b): the README's "What ships today"
# numbers must match the generated manifest, badge and release state included.
gate "python3 scripts/check-readme-counts.py"          python3 scripts/check-readme-counts.py
gate "bash tests/gates/run_readme_counts_fixtures.sh"  bash tests/gates/run_readme_counts_fixtures.sh
# Added in Sprint 48 (S48-07, C-09/T-31a): every tracked PDF carries a hash,
# a size and a rights status, and no row may claim a document the tree does
# not contain — the two vendor manuals are pointer text.
gate "python3 scripts/check-source-inventory.py"       python3 scripts/check-source-inventory.py
gate "bash tests/gates/run_source_inventory_fixtures.sh" bash tests/gates/run_source_inventory_fixtures.sh
# Added in Sprint 48 (S48-08, TM-75): the traceability doc gate SPEC-12 named
# but nothing ran. Clause A: every REQ-/R- identifier declared in SPEC-02..10
# maps to a TM row. Clause B: every fixture runner is wired here or declared
# chain-excluded with a reason.
gate "python3 scripts/check-traceability.py"            python3 scripts/check-traceability.py
gate "bash tests/gates/run_traceability_fixtures.sh"    bash tests/gates/run_traceability_fixtures.sh
# Added in Sprints 27-28 (S27-08/S27-09): the vendor plugin contract. Manifest
# schema versions, ID ownership across content roots, and plugin file integrity.
# The built-in tree is validated through the same path a vendor pack is, so
# "existing users unaffected" is checked rather than asserted.
gate "python3 scripts/check-plugin-manifests.py"        python3 scripts/check-plugin-manifests.py
gate "bash tests/gates/run_plugin_fixtures.sh"          bash tests/gates/run_plugin_fixtures.sh

# ── Packaging and release truth ──
gate "python3 scripts/generate-bundle-manifest.py --check" \
    python3 scripts/generate-bundle-manifest.py --content content --out content-manifest.json --check
gate "python3 scripts/check-packaging-manifests.py"     python3 scripts/check-packaging-manifests.py
gate "python3 scripts/check-packaging-manifests.py --self-test" \
    python3 scripts/check-packaging-manifests.py --self-test
gate "bash tests/gates/run_packaging_fixtures.sh"       bash tests/gates/run_packaging_fixtures.sh
gate "bash tests/gates/run_release_truth_fixtures.sh"   bash tests/gates/run_release_truth_fixtures.sh
gate "bash tests/gates/run_bridge_surface_fixtures.sh"  bash tests/gates/run_bridge_surface_fixtures.sh
gate "bash tests/gates/run_shellcheck_fixtures.sh"      bash tests/gates/run_shellcheck_fixtures.sh

# ── Web artifact gates ──
gate "python3 scripts/check-imports.py"                 python3 scripts/check-imports.py
gate "python3 scripts/check-imports.py --root RadicalTrainingPlatform.Web/js" \
    python3 scripts/check-imports.py --root RadicalTrainingPlatform.Web/js
gate "bash tests/gates/run_import_check_fixtures.sh"    bash tests/gates/run_import_check_fixtures.sh
gate "python3 scripts/check-brand.py"                   python3 scripts/check-brand.py
gate "bash tests/gates/run_brand_fixtures.sh"           bash tests/gates/run_brand_fixtures.sh
gate "bash tests/gates/run_web_fixtures.sh"             bash tests/gates/run_web_fixtures.sh
gate "bash tests/gates/run_option_shuffle_fixtures.sh"  bash tests/gates/run_option_shuffle_fixtures.sh
gate "bash tests/gates/run_validator_scan_fixtures.sh"  bash tests/gates/run_validator_scan_fixtures.sh
gate "bash tests/gates/run_redeye_fixtures.sh"          bash tests/gates/run_redeye_fixtures.sh
gate "python3 scripts/check-content-bundle.py"          python3 scripts/check-content-bundle.py
# Added in Sprint 48 (S48-08, TM-75): the content-bundle gate's fixture pair.
# The checker was in the chain and in pwa-deploy.yml; the runner that proves it
# can fail was in neither, so the gate could have gone vacuous unnoticed.
gate "bash tests/gates/run_content_bundle_fixtures.sh"  bash tests/gates/run_content_bundle_fixtures.sh
# Added in Sprint 48 (S48-08, TM-75): TM-66/REQ-AI-06's evaluation run. Its
# harness asserts both directions and ran nowhere in CI or the chain.
gate "bash tests/gates/run_tutor_eval.sh"               bash tests/gates/run_tutor_eval.sh
gate "python3 scripts/check-artifact-secrets.py"        python3 scripts/check-artifact-secrets.py
gate "bash tests/gates/run_artifact_secrets_fixtures.sh" bash tests/gates/run_artifact_secrets_fixtures.sh

# ── Self-host readiness (Sprints 29-30) ──
# The platform is deployed by copying a directory and serving it, so the offline
# cache being complete and the shell being servable from a subdirectory are
# load-bearing. Neither was checked anywhere before this pair.
gate "python3 scripts/check-selfhost.py"                python3 scripts/check-selfhost.py
gate "bash tests/gates/run_selfhost_fixtures.sh"        bash tests/gates/run_selfhost_fixtures.sh

# ── .NET ──
gate "dotnet build Core (Release)" \
    dotnet build RadicalTrainingPlatform.Core/RadicalTrainingPlatform.Core.csproj --configuration Release
gate "dotnet build Desktop (Release)" \
    dotnet build RadicalTrainingPlatform.Desktop/RadicalTrainingPlatform.Desktop.csproj --configuration Release
gate "dotnet build Desktop.Tests (Release)" \
    dotnet build RadicalTrainingPlatform.Desktop.Tests/RadicalTrainingPlatform.Desktop.Tests.csproj --configuration Release
gate "dotnet test Core.Tests (Release)" \
    dotnet test RadicalTrainingPlatform.Core.Tests/RadicalTrainingPlatform.Core.Tests.csproj \
        --configuration Release --collect:"XPlat Code Coverage"
# Desktop.Tests is built but not executed by CI, and `dotnet test` cannot run it
# on the .NET 10 SDK (Microsoft.Testing.Platform refuses the VSTest target). The
# MTP-native runner is `dotnet run`; it is run here so the freeze record carries
# a real count rather than "built, never executed".
gate "dotnet run Desktop.Tests (MTP runner)" \
    dotnet run --project RadicalTrainingPlatform.Desktop.Tests/RadicalTrainingPlatform.Desktop.Tests.csproj \
        --configuration Release
gate "python3 scripts/check-coverage.py"                python3 scripts/check-coverage.py
gate "python3 scripts/check-coverage.py --self-test"    python3 scripts/check-coverage.py --self-test
gate "python3 .github/scripts/vuln_gate.py" \
    python3 .github/scripts/vuln_gate.py \
        RadicalTrainingPlatform.Core/RadicalTrainingPlatform.Core.csproj \
        RadicalTrainingPlatform.Core.Tests/RadicalTrainingPlatform.Core.Tests.csproj \
        RadicalTrainingPlatform.Desktop/RadicalTrainingPlatform.Desktop.csproj
gate "python3 tests/gates/run_vuln_gate_fixtures.py"    python3 tests/gates/run_vuln_gate_fixtures.py

# ── Browser legs (pwa-deploy.yml — hosted runner) ──
gate "node tests/e2e/smoke-web.mjs"                     node tests/e2e/smoke-web.mjs
gate "bash tests/gates/run_smoke_fixtures.sh"           bash tests/gates/run_smoke_fixtures.sh
gate "node tests/e2e/nca-lab-web.mjs"                   node tests/e2e/nca-lab-web.mjs
gate "bash tests/gates/run_nca_lab_fixtures.sh"         bash tests/gates/run_nca_lab_fixtures.sh

# ── Chain exclusions (read by scripts/check-traceability.py, TM-75) ──
#
# A fixture runner that is neither wired above nor declared here ships a
# failing+passing pair nothing runs — the SPEC-16 rule left unenforced. Each
# exclusion must carry a reason, and naming a runner that no longer exists is
# itself a violation, so this register cannot rot into a blanket exemption.
#
# chain-excluded: tests/gates/run_rehearsal_fixtures.sh — a rehearsal tool, not a merge gate (T-26/S47-10): it walks the full demo path in a real browser and its live leg is the demo-host rehearsal, which has no host yet (PKG:1469). Its failing and passing fixtures are documented in the file's own header.

echo
echo "FREEZE CHAIN: $pass/$total at $SHORT_SHA"
if [ -n "$failed_names" ]; then
    echo "FAILED:$failed_names"
fi

rc=0
[ "$pass" -eq "$total" ] || rc=1

if [ -n "$EXPECT_SHA" ] && [ "$HEAD_SHA" != "$EXPECT_SHA" ]; then
    echo "FAIL: HEAD is $HEAD_SHA, expected $EXPECT_SHA — this total is from another commit" >&2
    rc=1
fi

exit $rc
