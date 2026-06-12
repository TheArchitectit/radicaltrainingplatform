# Sprints 31-32: Authentication & Authorization

**Phase:** Enterprise  
**Duration:** Weeks 61-64 (4 weeks)  
**Goal:** Implement secure authentication (OAuth2/OIDC) and role-based authorization.

---

## Summary

Add enterprise-grade auth to both the cloud API and desktop clients, with support for multiple identity providers.

## Key Deliverables

| ID | Deliverable | Points |
|---|---|---|
| S31-01 | Integrate OAuth2/OIDC (Google, Microsoft, GitHub) | 4 |
| S31-02 | Implement JWT token issuance and validation | 3 |
| S31-03 | Add refresh token flow | 3 |
| S31-04 | Implement role-based access control (RBAC) | 3 |
| S31-05 | Add per-profile storage isolation | 2 |
| S31-06 | Implement desktop client auth (browser redirect) | 3 |
| S31-07 | Add PWA auth (OAuth2 PKCE) | 3 |
| S31-08 | Secure API endpoints with JWT middleware | 2 |
| S31-09 | Add passwordless/magic link option | 2 |

**Total:** ~25 points over 2 sprints

## Key Decisions

- **Auth providers:** Google, Microsoft Entra ID (enterprise), GitHub; extensible for more
- **Token strategy:** Short-lived JWT (15 min) + long-lived refresh token (30 days)
- **RBAC roles:** Learner (default), Admin, ContentCurator, EnterpriseAdmin
- **Desktop auth:** System browser OAuth redirect; PKCE for security
- **PWA auth:** OAuth2 PKCE flow; tokens stored in secure storage

## Dependencies

- S29-01 through S29-10 (API backend must exist)
- S20-06 (PWA manifest exists)

## Risks

| Risk | Mitigation |
|---|---|
| OAuth redirect handling on desktop is complex | Use native browser; deep-link or loopback redirect URI |
| Token storage security on desktop | Use OS keychain (Windows DPAPI, macOS Keychain, Linux Secret Service) |
| Session hijacking | HTTPS only; secure cookie flags; short token lifetime |
