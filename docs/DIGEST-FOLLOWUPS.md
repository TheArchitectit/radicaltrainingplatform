# Digest Follow-ups

Items caught by the ArchitectIT daily digest and routed here by the backlog bridge (NEXT ids = Mission Control hit-list). Triage in MC; do not edit ids.

## Open
- [ ] **NEXT-368 —** Push Project N107's local feature burst (study tracks, ticket lab, RedEye gate, demo cuts) so the October 23 demo work is CI-covered.  *(source: digest 2026-10-11)*.  *(digest: 2026-10-12; source: MC hit-list)*
- [ ] **NEXT-360 —** Push or merge Project N107's unpushed feature burst (study tracks, ticket lab, review lane) from the main workstation before anything else touches that machine.  *(source: digest 2026-10-11)*.  *(digest: 2026-10-12; source: MC hit-list)*
*(digest 2026-10-02 "next" item — no NEXT id assigned; addressed 2026-10-03: rebuild
runbook added at deploy/runner-rebuild-runbook.md)*

## Resolved 2026-10-03
- [x] **NEXT-295 —** Decide whether the empty chore/external-audit branch in Project N107 should receive its findings or be deleted.  *(source: digest 2026-10-02)*.  *(digest: 2026-10-02; source: MC hit-list)*
  Decision: the branch was NOT empty — it carried docs/qa/audit-digest/2026-09-27 → 10-02 findings (author TheArchitectit). Those findings were merged into main; the digest finding "branch exists but is empty with no author recorded" is stale. NOTE: the 2026-09-29 digest entry is corrupted word-salad from the feed — retained as-is for provenance; fix upstream.
- [x] **NEXT-291 —** Confirm the widened CI vulnerability gate from the browser-component bump in Project N107 is scheduled to be tightened back or documented with an expiry.  *(source: digest 2026-10-02)*.  *(digest: 2026-10-02; source: MC hit-list)*
  Confirmed: a15d360 made the gate blocking with a REQUIRED-ISO-expiry allowlist (expired entries = not-allowed, missing expiry = gate-config error), and .github/vuln-allowlist.csv is now empty — the a38956f widening is fully tightened back.

## Resolved 2026-10-05
- [x] **2026-10-04 digest —** Encoding corpus extended with UTF-16 BOM provider coverage and embedded/post-concat BOM coverage. `QuestionParser` now removes BOM characters anywhere before line normalization; Core 129/129.
- [x] **2026-10-05 digest —** No action: the reported local-only digest-followups branch was the known branch carrying the original followup commits; its findings were merged and triaged on main.
