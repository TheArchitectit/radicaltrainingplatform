# Sprints 41-42: Security & Compliance

**Phase:** Enterprise  
**Duration:** Weeks 81-84 (4 weeks)  
**Goal:** Harden security posture with SBOM, SAST, pen-test, and SOC 2 groundwork.

---

## Summary

Enterprise readiness requires demonstrable security. This sprint adds all security artifacts and processes needed for enterprise sales and SOC 2 preparation.

## Key Deliverables

| ID | Deliverable | Points |
|---|---|---|
| S41-01 | Add SBOM generation (CycloneDX) to CI | 2 |
| S41-02 | Integrate CodeQL SAST in CI | 2 |
| S41-03 | Add OWASP dependency check | 2 |
| S41-04 | Conduct internal pen-test (OWASP Top 10) | 3 |
| S41-05 | Remediate pen-test findings | 3 |
| S41-06 | Add security headers and CSP | 2 |
| S41-07 | Implement audit logging (user actions API) | 3 |
| S41-08 | Write SOC 2 Type I policies and procedures | 3 |
| S41-09 | Add data encryption at rest (API database) | 2 |

**Total:** ~22 points over 2 sprints

## Key Decisions

- **SBOM:** CycloneDX JSON format; attached to every release
- **SAST:** GitHub CodeQL for C#; manual review for high-severity findings
- **Pen-test:** Internal red team or hired firm; scope includes API and desktop app
- **SOC 2:** Type I assessment (policies and procedures); Type II (continuous monitoring) in Year 2
- **Encryption:** AES-256 for database at rest; TLS 1.3 for transit

## Dependencies

- S5-01, S5-02 (Dependabot and vulnerability scanning from Phase 1)
- S29-01 through S29-10 (API backend to secure)
- S31-01 through S31-09 (auth system to pen-test)

## Risks

| Risk | Mitigation |
|---|---|
| Pen-test reveals architectural security flaws | Engage pen-test early in window; timebox remediation |
| SOC 2 compliance is expensive and time-consuming | Use vetted tools (Vanta, Drata); focus on Type I first |
| SBOM generation is noisy with false positives | Manual review of high-severity items; automate low-severity |
