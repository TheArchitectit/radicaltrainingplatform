# Sprints 33-34: Social & Study Groups — CUT (owner-deferred)

**Phase:** Enterprise  
**Duration:** Weeks 65-68 (4 weeks)  
**Goal (as written):** Add collaborative study features: shared sessions, leaderboards, and competitive modes.

**Status:** ⚫ **Not executed — cut by the owner 2026-10-14.** No code was written. This is
a visible cut, not a silent drop, and the original plan is preserved verbatim below.

---

## Why this was cut

This pair sits two levels above a decision the owner has already made. Its own
Dependencies section says so: "S29-01 through S29-10 (API backend)" and "S31-01 through
S31-09 (authentication for group membership)". Neither exists — the platform is
**self-host only, no accounts** (owner, 2026-10-12).

Every deliverable here needs a server that knows who is who:

| ID | Deliverable | Why it cannot stand without accounts |
|---|---|---|
| S33-01 | Study group model (name, members, admin) | "Members" is a list of accounts. |
| S33-02 | Group CRUD API endpoints | There is no API. |
| S33-03 | Shared session (real-time quiz) | Needs a server holding the session, and identity to attribute answers to. |
| S33-04 | Leaderboard (per-exam accuracy ranking) | A ranking is a list of *people*, ranked. With no accounts there is nothing to rank but browser profiles — and a shared lab machine's profile belongs to whoever is sitting there. |
| S33-05 | Competitive quiz mode (head-to-head) | Requires knowing who the two heads are, and the sprint's own risk note says "server authorizes all scores". |
| S33-06 | Team progress dashboard | The counterpart of the "no central reporting" boundary stated in `docs/SELF-HOST.md` §10. |
| S33-07 | Group chat / comment threads | Needs accounts, a server, and content moderation for an audience of high school students. |
| S33-08 | Notification system | Needs somewhere to deliver to and someone to address. |

### The fences this would cross

- SPEC-01 line 99: "**No sync, no accounts** … **no public deployment**."
- SPEC-15 line 46: "account/sync features … remain an owner decision."
- ASM-16: "**NO STUDENT ACCOUNTS AUTHORIZED**".
- REQ-DEMO-04 / REQ-UI-08: no identity collection, no account, no required network.

Two rows in its own plan are worth naming as things a self-host deployment would need to
handle *deliberately*, not by accident: S33-07's chat and S33-04's leaderboard are both
surfaces where one student's data becomes visible to others. That is the exact class of
feature the "no accounts" boundary exists to avoid shipping unexamined for a student
audience.

### Deferred, not rejected

The owner chose "cut" over "reshape" on 2026-10-14, so no self-host substitute is
proposed here. If cohort visibility is ever wanted, the honest no-account version is a
teacher collecting students' exported progress files — which needs no server, no
accounts and no chat — and that would be a new owner decision and a new sprint.

---

## Original plan (preserved verbatim, not executed)

### Summary

Enable social learning through shared sessions, leaderboards, team progress tracking, and
competitive quiz modes.

### Key Deliverables

| ID | Deliverable | Points |
|---|---|---|
| S33-01 | Implement study group model (name, members, admin) | 2 |
| S33-02 | Add group CRUD API endpoints | 2 |
| S33-03 | Implement shared session (real-time quiz) | 5 |
| S33-04 | Add leaderboard (per-exam accuracy ranking) | 3 |
| S33-05 | Add competitive quiz mode (timed, head-to-head) | 4 |
| S33-06 | Implement team progress dashboard | 3 |
| S33-07 | Add group chat or comment threads | 2 |
| S33-08 | Add notification system (invites, session starts) | 2 |

**Total:** ~23 points over 2 sprints

### Key Decisions

- **Real-time:** SignalR or WebSockets for shared sessions and competitive mode
- **Leaderboard:** Redis Sorted Sets or PostgreSQL for rankings; cached
- **Competitive mode:** Synchronized start; individual responses; real-time score updates; winner at end
- **Privacy:** Users opt-in to leaderboard; can hide from rankings

### Dependencies

- S29-01 through S29-10 (API backend)
- S31-01 through S31-09 (authentication for group membership)

### Risks

| Risk | Mitigation |
|---|---|
| Real-time sync latency | Regional server deployment; optimistic UI updates |
| Cheating in competitive mode | No client-side scoring validation; server authorizes all scores |
| Group management complexity | Start with simple groups (invite-only); public groups later |
