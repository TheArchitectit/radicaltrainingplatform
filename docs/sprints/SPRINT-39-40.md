# Sprints 39-40: Enterprise Admin Console

**Phase:** Enterprise  
**Duration:** Weeks 77-80 (4 weeks)  
**Goal:** Build an admin console for user management, license provisioning, and LMS integration.

---

## Summary

Create a web-based admin console for enterprise customers to manage users, assign licenses, and integrate with existing LMS systems.

## Key Deliverables

| ID | Deliverable | Points |
|---|---|---|
| S39-01 | Create admin console web app (Blazor or React) | 3 |
| S39-02 | Implement user management (list, invite, deactivate) | 3 |
| S39-03 | Implement license provisioning (seats, expiration) | 3 |
| S39-04 | Add role management (assign admin, curator) | 2 |
| S39-05 | Add usage analytics dashboard | 3 |
| S39-06 | Implement SCORM 1.2/2004 basic integration | 4 |
| S39-07 | Implement LTI 1.3 tool provider | 4 |
| S39-08 | Add SSO/SAML integration for enterprise | 3 |

**Total:** ~25 points over 2 sprints

## Key Decisions

- **Admin console tech:** Blazor Server or WASM (leverages existing .NET expertise); or React for ecosystem
- **License model:** Per-seat annual subscription; volume discounts
- **SCORM:** Minimum viable support — launch, track completion, report score
- **LTI 1.3:** Tool Provider role; Deep Linking deferred to v2.1
- **SSO/SAML:** OneLogin/Auth0 integration; standard SAML 2.0 flow

## Dependencies

- S29-01 through S29-10 (API backend)
- S31-01 through S31-09 (authentication and roles)

## Risks

| Risk | Mitigation |
|---|---|
| SCORM/LTI complexity exceeds scope | Start with basic launch + completion tracking; full spec later |
| SAML configuration is customer-specific | Self-service SAML config UI; documentation |
| Admin console security | Separate auth domain; MFA required; audit logging |
