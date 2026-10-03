# Digest Follow-ups

Items caught by the ArchitectIT daily digest and routed here by the backlog bridge (NEXT ids = Mission Control hit-list). Triage in MC; do not edit ids.

## Open
*(digest 2026-10-02 "next" item — no NEXT id assigned; addressed 2026-10-03: rebuild
runbook added at deploy/runner-rebuild-runbook.md)*

## Resolved 2026-10-03
- [x] **NEXT-295 —** Decide whether the empty chore/external-audit branch in Project N107 should receive its findings or be deleted.  *(source: digest 2026-10-02)*.  *(digest: 2026-10-02; source: MC hit-list)*
  Decision: the branch was NOT empty — it carried docs/qa/audit-digest/2026-09-27 → 10-02 findings (author TheArchitectit). Those findings were merged into main; the digest finding "branch exists but is empty with no author recorded" is stale. NOTE: the 2026-09-29 digest entry is corrupted word-salad from the feed — retained as-is for provenance; fix upstream.
- [x] **NEXT-291 —** Confirm the widened CI vulnerability gate from the browser-component bump in Project N107 is scheduled to be tightened back or documented with an expiry.  *(source: digest 2026-10-02)*.  *(digest: 2026-10-02; source: MC hit-list)*
  Confirmed: a15d360 made the gate blocking with a REQUIRED-ISO-expiry allowlist (expired entries = not-allowed, missing expiry = gate-config error), and .github/vuln-allowlist.csv is now empty — the a38956f widening is fully tightened back.
