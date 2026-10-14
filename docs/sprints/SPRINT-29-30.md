# Sprints 29-30: Self-Host Enablement (rescoped from "Cloud API Backend")

**Phase:** Enterprise  
**Duration:** Weeks 57-60 (4 weeks)  
**Goal (as written in June 2026):** Build an ASP.NET Core API backend for user accounts and cross-device synchronization.  
**Goal (as executed):** Make the platform deployable by the people who use it — end users,
students, teachers — with no account, no server and no cloud.

**Status:** 🟢 Landed — self-host guide, an offline cache that is now actually complete,
and a gate holding both. Freeze chain **57/57**.

> **This sprint was rescoped by the owner on 2026-10-12, before any code was written.**
> The accounts-and-sync half was cut as an owner-deferred decision, not deleted, and the
> "or document self-host" clause of S29-09 — a throwaway alternative in the June plan —
> became the whole deliverable. The reasoning is in
> [Why this sprint does not build a cloud backend](#why-this-sprint-does-not-build-a-cloud-backend)
> and the cut register below. The original plan is preserved verbatim underneath it.

---

## Why this sprint does not build a cloud backend

The pair was picked up as written. Reading the governing documents first — SPEC-01's
locked decisions and scope fence, SPEC-15's assumptions and tripwires, SPEC-16, and
REQ-DEMO-04 — showed that the accounts-and-sync half is *named* as an owner decision the
October OpenSpec package explicitly declined to take. That was put to the owner as one
batched decision request rather than guessed at, and the owner's answer reframed the work.

**Owner decisions (2026-10-12):**

1. **Self-host only, no accounts.** The goal is that end users and students can deploy
   this themselves.
2. **The premise was challenged** — why does a study platform need cloud deployment when
   it is built for people to run locally or in a lab?

The second question deserves an answer with evidence, not a defence of the plan.

### A cloud API would have exactly three jobs here, and the product needs none of them

Accounts, cross-device sync, and per-user storage. Everything else in the June plan
(rate limiting, API versioning, health checks) is scaffolding around those three.

The study loop requires none of them, and this is not an opinion — it is what the repo
does today:

| Claim | Evidence |
|---|---|
| The app is static | `RadicalTrainingPlatform.Web/` is HTML/JS/CSS with no .NET and no npm dependency. It is not in `RadicalTrainingPlatform.sln`. |
| Progress is local-first by locked decision | D7: "Progress is local-first in ProgressStore (IndexedDB via StateStore, localStorage fallback), keyed by stable item IDs." |
| Storage failure degrades honestly | `StateStore` reports `storage-blocked` and the app keeps running rather than losing the session. |
| It already works offline | `sw.js` is cache-first with runtime caching and an `index.html` navigation fallback. |
| Practice needs no server | `practice.js` filters by `examId` and reads `ProgressStore`; nothing consults a remote source. |
| There is no server to extend | No ASP.NET, no controllers, no auth, no database, no `Microsoft.AspNetCore.*` reference in any csproj. |

The only HTTP service in the repository is `services/ai-gateway/server.mjs` — Node, bound
to `127.0.0.1` only, inference-only, and it persists nothing about a learner.

### The cost side

Beyond being unnecessary, the cloud half is fenced by decisions already taken:

- SPEC-01 line 99: "**No sync, no accounts** … **no public deployment**."
- SPEC-15 line 46: "account/sync features … remain an owner decision; this package takes
  none of them."
- ASM-16: "NO STUDENT ACCOUNTS AUTHORIZED". REQ-DEMO-04: "No account, no required
  persistence, no network for any simulator content."
- `DESIGN-MATRIX-AND-ROADMAP.md` names "**Cloud infrastructure budget**" as an ungranted
  dependency; Plan v2: "Paid activation … wait for separate approvals."
- This document's own risk table named GDPR — and the demo audience is high school
  students. A public API holding minors' study data is the shape the fence exists for.

### The honest counter-argument

A backend would legitimately buy three things: progress that follows a student between
their phone and their laptop; a teacher seeing a class's results; and progress on shared
lab machines. Each is real. Each is deferred **by name**, not disproven. And the third is
the one that actually bites: on a shared machine, one browser profile is one progress
store, so students overwrite each other.

But an account system is not the fix for that. Per-student browser profiles, a folder per
student, or a machine each all work, cost nothing, and need no server, no subscription and
no GDPR posture. The limitation is documented plainly in
[docs/SELF-HOST.md](../SELF-HOST.md) §7 rather than engineered away.

**Conclusion: S29-09's cloud branch is not executed. The self-host branch is.**

---

## Cut register

Per SPEC-11 11.1, scope is cut **visibly**. Nothing here is silently dropped.

| ID | As written | Disposition |
|---|---|---|
| S29-01 | Create ASP.NET Core API project | **Cut** — no server is needed and none exists |
| S29-02 | REST API contract (OpenAPI/Swagger) | **Replaced** — `content-manifest.json` + `ContentBundle.Verify()` is the existing content contract |
| S29-03 | User account model and registration | **Cut — owner-deferred** (SPEC-15 line 46; ASM-16) |
| S29-04 | Progress sync endpoints (POST/GET) | **Cut — owner-deferred** |
| S29-05 | Per-profile storage isolated by user | **Cut — owner-deferred**; D7 keeps progress local-first |
| S29-06 | Cross-device sync (last-write-wins) | **Cut — owner-deferred** |
| S29-07 | API rate limiting and throttling | **Cut** — there is no API to limit |
| S29-08 | API versioning strategy | **Already satisfied** — `schemaVersion` / `bundleVersion` (S27-09) |
| S29-09 | Deploy API to cloud **or** document self-host | **Second branch taken, and taken seriously** — this became the pair's content |
| S29-10 | Health check and monitoring endpoints | **Replaced** — a self-host verification surface: bundle integrity plus a clean-copy check |

Deferred is not the same as rejected. If the owner later wants cross-device sync, that is
a new owner decision and a new sprint; this document leaves the door open.

---

## What was actually built

### 1. A self-host guide for the people who will use it

[docs/SELF-HOST.md](../SELF-HOST.md) — local static server, a static host or GitHub
Pages, a folder on a lab file server, and a USB stick with no internet. It states what the
app needs (a static file server and a browser), what it does not (account, backend,
network, configuration), how to install it as an offline app, how to verify a copy is
intact, and the shared-machine limitation in plain language. The README links it.

### 2. The offline cache, completed — this was a real defect

`sw.js` precached **74 of the 82 files the app loads**. The ten missing included modules
in `app.js`'s **static import graph**:

```
js/components/DemoBanner.js    js/core/CompletionPanel.js   js/core/DemoMode.js
js/core/OptionShuffle.js       js/core/RouteLabels.js       js/core/TutorClient.js
js/data/tutor-recorded.js      js/views/demo-mode.js        js/views/nca-lab.js
js/views/tutor-panel.js
```

`sw.js` last changed in Sprint 46; nothing from Sprint 47 or the NCA lab reached the
list. The consequence is specific and bad: an installed copy opened **for the first time
with no network** would fail to load those modules — which is precisely the classroom,
lab-machine and air-gapped case the self-host path exists for. Nothing checked the
precache list against the tree, so it went unnoticed.

Fixed by adding the ten entries and bumping `CACHE_NAME` to `labsim-v2`, because the
bytes of `sw.js` are what make a browser install the new worker.

### 3. A gate that holds it, with both fixtures (SPEC-16 #4)

`scripts/check-selfhost.py` (+ `--self-test`) and `tests/gates/run_selfhost_fixtures.sh`.
Five checks, each naming the defect it exists to catch:

| Check | The defect it catches |
|---|---|
| Precache completeness | A module loaded at runtime but not cached dies on a first-load offline open |
| Precache integrity | `cache.addAll()` is all-or-nothing: one path that 404s rejects the whole install, so there is no offline mode at all |
| Entry-point integrity | The shell names a script or stylesheet that is not there, or never registers the worker |
| Subdirectory servability | A root-absolute or remote reference breaks every host the app actually runs on |
| Guide integrity | The guide tells a reader to serve a directory that does not exist, or the README stops linking it |

The fixture runner seeds seven defects (one per check plus the precache list removed
outright), each of which must fail **and name the defect**, plus two passing fixtures —
the repository tree and a clean copy — and the checker's own eleven seeded defects.

---

## Execution record (added 2026-10-12)

### Verification

- Freeze chain **57/57** at the head SHA (55 → 57: the self-host gate and its fixture
  runner). Chain growth is stated as growth, not regression.
- `python3 scripts/check-selfhost.py` — PASS on the repository tree.
- `python3 scripts/check-selfhost.py --self-test` — PASS, 11 seeded defects each caught.
- `bash tests/gates/run_selfhost_fixtures.sh` — 10/10 lines PASS.
- The new runner is discovered by `check-traceability.py` (clause B) and is wired into
  both `run_freeze_chain.sh` and `.github/workflows/build.yml`, so it is not a gate whose
  failing fixture goes unrun.

### What was not touched

No content file, manifest, provenance record, lesson or item. No `exam.json`,
`track.json`, `content-manifest.json` or `study-content.js`. The RedEye posture and the
`draft-preview` labels from Sprints 27-28 are unchanged by this work. No project was added
to `RadicalTrainingPlatform.sln` / `.slnx`; `packaging/` is untouched.

### Findings recorded rather than fixed

- **`js/views/PlaceholderView.js` is dead code.** It is precached but nothing imports it,
  and there are no dynamic imports in the tree, so it cannot be instantiated. Harmless to
  precache; recorded because a dead module in a hand-maintained list is how such lists
  drift.
- **`RadicalTrainingPlatform.Web/content-bundle.json` is not in the precache list** and
  should not be: nothing in the PWA fetches it. It is a build/verification artifact.
  (A peer exploration listed it as a gap; the import graph says otherwise, and the gate
  follows the graph.)
- **`REQ-UI-06`'s `tests/e2e/offline.spec.js` was specified in SPEC-03 and never
  authored.** The new gate checks the precache *list* statically; it does not drive a
  browser offline. That remains unverified and is named in the ledger below.

### What this work did NOT establish

- **A gate is not a deployment.** `check-selfhost.py` proves the documented path is real
  and the copy is complete. It does not prove a stranger can follow the guide — that
  needs a human who is not the author.
- **No browser was driven offline.** The precache defect was found and fixed statically.
  No test opened an installed copy with the network down.
- **The shared-machine limitation stands.** One browser profile is one progress store.
  The guide says so; nothing here fixes it.
- **Desktop artifacts are unverified on this host.** The Linux/macOS/Flatpak builds were
  not produced here; whatever was not built is reported as not built.
- **No accounts, no sync, no cloud.** The cloud half is recorded as an owner-deferred cut
  and no tripwire was touched: no paid provider activation, no public distribution, no
  vendor-PDF change, no rights-review conclusion, no LICENSE text.

---

## Original June 2026 plan (preserved verbatim, not executed)

### Summary

Create a cloud backend that supports user accounts, progress storage, and cross-device
sync. The API is the foundation for all Phase 4 cloud features.

### Key Deliverables

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

### Key Decisions

- **Stack:** ASP.NET Core 10 API, EF Core, PostgreSQL (cloud) or SQLite (self-host)
- **API contract:** REST with JSON; OpenAPI 3.0 spec published
- **Sync strategy:** Last-write-wins with conflict detection; future: CRDT or operational transform
- **Hosting:** Azure App Service or AWS Elastic Beanstalk for SaaS; Docker for self-host
- **Performance target:** p99 < 100ms for read operations; < 500ms for sync

### Dependencies

- S9-03 (persistence schema informs API data models)
- Phase 3 stable (v1.0)

### Risks

| Risk | Mitigation |
|---|---|
| API scalability with growth | Stateless design; horizontal scaling; caching layer |
| Self-host vs SaaS complexity | Docker container; single binary with SQLite; optional PostgreSQL |
| Data privacy regulations (GDPR) | User data export/delete endpoints; documented in Phase 4 |

**Note on the risks table:** the third row is the one that decided this sprint. A user
account model for an audience of high school students carries data-privacy obligations
that the mitigation ("export/delete endpoints, documented in Phase 4") does not discharge.
Not building the account model discharges it completely.
