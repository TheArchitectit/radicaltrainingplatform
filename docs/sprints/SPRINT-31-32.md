# Sprints 31-32: Authentication & Authorization — CUT (owner-deferred)

**Phase:** Enterprise  
**Duration:** Weeks 61-64 (4 weeks)  
**Goal (as written):** Implement secure authentication (OAuth2/OIDC) and role-based authorization.

**Status:** ⚫ **Not executed — cut by the owner 2026-10-14.** No code was written. This is
a visible cut, not a silent drop, and the original plan is preserved verbatim below.

---

## Why this was cut

This pair is the second half of the same decision that rescoped
[Sprints 29-30](./SPRINT-29-30.md). Its own Dependencies section names it: "S29-01
through S29-10 (API backend must exist)". There is no API backend, because the owner
decided on 2026-10-12 that the platform is **self-host only, no accounts**.

Everything in this sprint is downstream of an account:

| ID | Deliverable | Why it cannot stand without accounts |
|---|---|---|
| S31-01 | OAuth2/OIDC (Google, Microsoft, GitHub) | Every listed provider is a third-party identity service. A self-hosted classroom has no reason to route a student's identity through Google, and the app is forbidden to collect identity at all (REQ-UI-08, quoted in `DemoMode.js`: "no identity collection anywhere"). |
| S31-02 | JWT issuance and validation | A token is a claim about *who*. With no accounts there is nobody to claim to be. |
| S31-03 | Refresh token flow | Same. |
| S31-04 | Role-based access control | RBAC distinguishes Learner / Admin / ContentCurator / EnterpriseAdmin. All four roles are account roles. |
| S31-05 | Per-profile storage isolation | The one genuinely useful-sounding item — but D7 already fixes progress as local-first per browser profile, and `docs/SELF-HOST.md` §7 documents the shared-machine limitation and its no-account fixes. Isolation by *user* requires users. |
| S31-06 | Desktop client auth (browser redirect) | Requires an identity provider to redirect to. |
| S31-07 | PWA auth (OAuth2 PKCE) | Same. |
| S31-08 | JWT middleware on API endpoints | There are no API endpoints. |
| S31-09 | Passwordless / magic link | Magic links need an email address, i.e. identity collection. |

### The fences this would cross

- SPEC-01 line 99: "**No sync, no accounts** … **no public deployment**."
- SPEC-15 line 46: "account/sync features … remain an owner decision; this package takes
  none of them."
- ASM-16: "**NO STUDENT ACCOUNTS AUTHORIZED**".
- REQ-DEMO-04: "No account, no required persistence, no network for any simulator
  content."

Its own risk table also names the cost: token storage on desktop wants the OS keychain
(DPAPI / Keychain / Secret Service), and "Session hijacking" is mitigated by "HTTPS
only". Both are obligations that only exist once there are tokens to protect. Not issuing
tokens discharges them completely.

### Deferred, not rejected

If the owner ever wants cross-device sync or cohort visibility, this sprint is the shape
of that work and this document is where it starts. It is not scheduled, and nothing in
the current plan depends on it — [SPRINT-35-36.md](./SPRINT-35-36.md) (accessibility) is
the next pair and needs none of it.

---

## Original plan (preserved verbatim, not executed)

### Summary

Add enterprise-grade auth to both the cloud API and desktop clients, with support for
multiple identity providers.

### Key Deliverables

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

### Key Decisions

- **Auth providers:** Google, Microsoft Entra ID (enterprise), GitHub; extensible for more
- **Token strategy:** Short-lived JWT (15 min) + long-lived refresh token (30 days)
- **RBAC roles:** Learner (default), Admin, ContentCurator, EnterpriseAdmin
- **Desktop auth:** System browser OAuth redirect; PKCE for security
- **PWA auth:** OAuth2 PKCE flow; tokens stored in secure storage

### Dependencies

- S29-01 through S29-10 (API backend must exist)
- S20-06 (PWA manifest exists)

### Risks

| Risk | Mitigation |
|---|---|
| OAuth redirect handling on desktop is complex | Use native browser; deep-link or loopback redirect URI |
| Token storage security on desktop | Use OS keychain (Windows DPAPI, macOS Keychain, Linux Secret Service) |
| Session hijacking | HTTPS only; secure cookie flags; short token lifetime |
