# Sprints 39-40: Local Classroom Kit (rescoped from "Enterprise Admin Console")

**Phase:** Enterprise  
**Duration:** Weeks 77-80 (4 weeks)  
**Goal (as written in June 2026):** Build an admin console for user management, license provisioning, and LMS integration.  
**Goal (as executed):** Give a learner and a teacher the offline tools an administrator
console was standing in for — progress that can move between machines without an account,
and coverage that says *which* objectives are still missing.

**Status:** 🟢 Landed at `2d3af16` — account-free progress export/import, per-objective
coverage detail, and a fixture holding both. Freeze chain **59/59**.

> **This sprint was rescoped by the owner on 2026-10-18.** The instruction was
> *"Rescope all three"*. The constraints stated the same day were: *"this is supposed to
> run as a local client on your device not need a hosting solution"* and *"the idea of this
> is they can just check the project out from github."* The delivery model is a clone and a
> local run — not a hosted multi-tenant service.
>
> Every June deliverable here assumes a server, an account, or an enterprise buyer. The cut
> register below records each one; the original plan is preserved verbatim underneath it.

---

## Why this sprint does not build an admin console

An admin console is a server-side product. It exists to let someone with authority over
other people's accounts do things to those accounts. This platform has no accounts by
locked decision, no server by design, and — as the owner restated on 2026-10-18 — no
hosting requirement at all. It is a local client: a reader clones the repository and runs
it on their own machine.

An admin console presumes the opposite arrangement — one operator, many accounts, a server
between them. None of that exists here, and none of it is planned.

That makes every deliverable in the June plan downstream of something that does not exist:

| ID | As written | Why it cannot stand without accounts and a host |
|---|---|---|
| S39-01 | Admin console web app (Blazor or React) | A console is a second application served from somewhere. The product is a static client the learner opens. |
| S39-02 | User management (list, invite, deactivate) | There are no users to list, invite or deactivate. |
| S39-03 | License provisioning (seats, expiration) | Seats are a commercial contract enforced by a server. Nothing here enforces or needs one. |
| S39-04 | Role management (admin, curator) | Roles are account roles. |
| S39-05 | Usage analytics dashboard | Requires a telemetry pipeline. A local client collects nothing and sends nothing, by design. |
| S39-06 | SCORM 1.2/2004 integration | SCORM is an LMS runtime serving content to a tracking server. There is no LMS runtime and no tracking server. |
| S39-07 | LTI 1.3 tool provider | LTI registers a tool with an LMS over HTTP. There is no HTTP surface. |
| S39-08 | SSO/SAML integration | SAML routes identity through an external identity provider, i.e. it collects identity, which REQ-UI-08 forbids. |

### The fences this would cross

- SPEC-01 line 99: "**No sync, no accounts** … **no public deployment**."
- SPEC-15 line 46: "account/sync features … remain an owner decision; this package takes
  none of them."
- ASM-16: "**NO STUDENT ACCOUNTS AUTHORIZED**".
- REQ-DEMO-04: "No account, no required persistence, no network for any simulator content."
- REQ-UI-08, quoted in `DemoMode.js`: "no identity collection anywhere".
- Its own Dependencies section names `S29-01 through S29-10 (API backend)` and
  `S31-01 through S31-09 (authentication and roles)` — both cut by the same owner decision.

### The honest counter-argument

An admin console would legitimately buy a teacher three things: a class roster, a view of
who is behind, and a way to hand a student a licensed seat. Each is real. Each is deferred
**by name**, not disproven, and each requires the account system Sprints 29-30 and 31-32
were cut to avoid.

Two of the three, however, have an offline analogue that needs no account, no server and
no network — and those are what this pair delivers:

- **"Who is behind?"** — coverage says which published objectives have no released lesson
  and item yet. That is useful to a teacher *and* to the learner, and the data was already
  compiled into the track bundle.
- **"Hand it to a student."** — progress export/import moves a learner's history between
  browser profiles and machines through a local file. [docs/SELF-HOST.md](../SELF-HOST.md)
  §7 used to say there was no fourth option in this version; it now has one, and it still
  involves no account.

A class roster is not replaced. A local client genuinely cannot know who its user is, and
this sprint does not pretend otherwise.

---

## Cut register

Per SPEC-11 11.1, scope is cut **visibly**. Nothing here is silently dropped.

| ID | As written | Disposition |
|---|---|---|
| S39-01 | Create admin console web app (Blazor or React) | **Cut** — would be a second, hosted application |
| S39-02 | User management (list, invite, deactivate) | **Cut — owner-deferred** (accounts do not exist) |
| S39-03 | License provisioning (seats, expiration) | **Cut — owner-deferred** (no commercial seat model) |
| S39-04 | Role management (assign admin, curator) | **Cut — owner-deferred** |
| S39-05 | Usage analytics dashboard | **Cut** — a local client collects no telemetry |
| S39-06 | SCORM 1.2/2004 basic integration | **Cut** — no LMS runtime, no tracking server |
| S39-07 | LTI 1.3 tool provider | **Cut** — no HTTP surface to register |
| S39-08 | SSO/SAML integration | **Cut — owner-deferred**; identity collection is forbidden |

Deferred is not the same as rejected. If the owner ever wants accounts, a roster or sync,
this document is the shape of that work and it starts from a new owner decision.

---

## What was actually built

### 1. Progress that can move without an account

`ProgressStore.exportProgress()` and `importProgress()` (S39, local classroom kit), with
controls on the Study Tracks page.

The export is a versioned envelope over the **learner** keyspaces only —
`progress/` and `scenario/`. Simulator fixtures (`clusterState`, `pc_settings`, …) are
deliberately excluded: they belong to `StateEngine`, they are not a learner's history, and
a progress file must never be able to rewrite a lab environment.

The import treats the file as untrusted input and validates it **before writing anything**:

- unknown `schema` → refused;
- unsupported `schemaVersion` → refused, rather than guessed at;
- a key outside `progress/` / `scenario/` → refused as a whole, so a hostile file cannot
  smuggle valid-looking records alongside one invalid key;
- a non-object record → refused.

Import is additive over the same keys by default and leaves unrelated learner keys alone;
`{ replace: true }` clears the learner keyspaces first. Storage failure is reported, never
presented as a successful import — the same honest-failure rule as `recordItem`.

This is the first export path for **study progress**. Export/import already existed for
*simulator state* in `pc-settings.js`; the two are different stores and remain separate.

### 2. Coverage that names the gap

The track overview showed `covered / total (percent)` and nothing else. The compiler
already emitted `coveredObjectiveIds`, but no view read it. The overview now derives the
uncovered objectives from the exam's own `sections[].objectives[]` and lists them under a
`<details>` disclosure, e.g. *"21 of 27 published objectives have no released lesson and
item yet"*, with each objective id and title.

The list is derived rather than hand-maintained, and it is checked against the compiler's
own totals: the objective count in `EXAMS` equals `coverage.total` for every exam today
(14, 15, 27, 36, 25, 14), and `coveredObjectiveIds.length` equals `covered`.

### 3. A fixture that proves the trust boundary

`tests/gates/web/progress-portability.mjs` — nine cases, discovered automatically by
`run_web_fixtures.sh` (so the chain does not grow for a web-only fixture). It asserts:

- the export carries learner keyspaces and **excludes** simulator state;
- a round trip restores records, `firstCorrect`, and scenario completion;
- JSON text (what a real file supplies) works;
- malformed JSON, unknown schema, future version, an outside key, and a non-record value
  are each refused **and write nothing**;
- additive vs `replace` semantics, including that `replace` never touches simulator state.

The "writes nothing" assertion is the point. A validating importer that half-writes before
failing would be worse than one that trusts the file.

---

## Execution record

### Verification

- `node tests/gates/web/progress-portability.mjs` — 9/9 PASS.
- `bash tests/gates/run_web_fixtures.sh` — PASS, including the new fixture.
- `node tests/e2e/a11y-web.mjs` — PASS, every route, both themes, including the new
  controls and the coverage disclosure.
- `python3 scripts/check-selfhost.py` — PASS; no new module was added, so the precache
  list is unchanged.
- `python3 scripts/check-brand.py`, `python3 scripts/check-imports.py` — PASS.
- Freeze chain **59/59** at `2d3af16`, `--expect-sha` matching. The chain did not grow:
  a web-only fixture is discovered by `run_web_fixtures.sh`, which is already a chain line.

### What was not touched

No content file, manifest, provenance record, lesson or item. No exam, track or
`study-content.js`. No .NET project. The RedEye posture and the `draft-preview` labels from
Sprints 27-28 are unchanged.

### What this work did NOT establish

- **No accounts, no roster, no sync.** The admin half is an owner-deferred cut. Export/
  import moves a file; it does not merge two histories or resolve conflicts between them.
- **No telemetry.** Nothing here reports usage anywhere.
- **No calendar or deadline feature.** A classroom kit could carry one; this pair did not
  build one.
- **A fixture is not a classroom.** The export/import path is proven in a headless store.
  Whether a teacher finds the control, or whether a shared lab's browser policy permits a
  download, is unverified.
- **Coverage is objective-level only.** It does not say whether the released items for a
  covered objective are *good* — that is the item-hygiene work, and it remains separate
  from coverage.

---

## Original June 2026 plan (preserved verbatim, not executed)

### Summary

Create a web-based admin console for enterprise customers to manage users, assign
licenses, and integrate with existing LMS systems.

### Key Deliverables

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

### Key Decisions

- **Admin console tech:** Blazor Server or WASM (leverages existing .NET expertise); or React for ecosystem
- **License model:** Per-seat annual subscription; volume discounts
- **SCORM:** Minimum viable support — launch, track completion, report score
- **LTI 1.3:** Tool Provider role; Deep Linking deferred to v2.1
- **SSO/SAML:** OneLogin/Auth0 integration; standard SAML 2.0 flow

### Dependencies

- S29-01 through S29-10 (API backend)
- S31-01 through S31-09 (authentication and roles)

### Risks

| Risk | Mitigation |
|---|---|
| SCORM/LTI complexity exceeds scope | Start with basic launch + completion tracking; full spec later |
| SAML configuration is customer-specific | Self-service SAML config UI; documentation |
| Admin console security | Separate auth domain; MFA required; audit logging |

**Note on the risks table:** every row mitigates a risk that belongs to a hosted,
multi-tenant product. None of them applies once the deliverable is a local client, because
there is no LTI endpoint to configure, no SAML tenant to splinter, and no admin console
session to protect.
