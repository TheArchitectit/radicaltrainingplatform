# Sprints 29-30: Cloud API Backend

**Phase:** Enterprise  
**Duration:** Weeks 57-60 (4 weeks)  
**Goal:** Build an ASP.NET Core API backend for user accounts and cross-device synchronization.

---

## Summary

Create a cloud backend that supports user accounts, progress storage, and cross-device sync. The API is the foundation for all Phase 4 cloud features.

## Key Deliverables

| ID | Deliverable | Points |
|---|---|---|
| S29-01 | Create ASP.NET Core API project | 2 |
| S29-02 | Design REST API contract (OpenAPI/Swagger) | 3 |
| S29-03 | Implement user account model and registration | 3 |
| S29-04 | Implement progress sync endpoints (POST/GET) | 3 |
| S29-05 | Add per-profile progress storage (isolated by user) | 3 |
| S29-06 | Implement cross-device sync logic (last-write-wins) | 3 |
| S29-07 | Add API rate limiting and throttling | 2 |
| S29-08 | Add API versioning strategy | 2 |
| S29-09 | Deploy API to cloud (Azure/AWS) or document self-host | 3 |
| S29-10 | Add health check and monitoring endpoints | 2 |

**Total:** ~28 points over 2 sprints

## Key Decisions

- **Stack:** ASP.NET Core 10 API, EF Core, PostgreSQL (cloud) or SQLite (self-host)
- **API contract:** REST with JSON; OpenAPI 3.0 spec published
- **Sync strategy:** Last-write-wins with conflict detection; future: CRDT or operational transform
- **Hosting:** Azure App Service or AWS Elastic Beanstalk for SaaS; Docker for self-host
- **Performance target:** p99 < 100ms for read operations; < 500ms for sync

## Dependencies

- S9-03 (persistence schema informs API data models)
- Phase 3 stable (v1.0)

## Risks

| Risk | Mitigation |
|---|---|
| API scalability with growth | Stateless design; horizontal scaling; caching layer |
| Self-host vs SaaS complexity | Docker container; single binary with SQLite; optional PostgreSQL |
| Data privacy regulations (GDPR) | User data export/delete endpoints; documented in Phase 4 |
