# Sprints 33-34: Social & Study Groups

**Phase:** Enterprise  
**Duration:** Weeks 65-68 (4 weeks)  
**Goal:** Add collaborative study features: shared sessions, leaderboards, and competitive modes.

---

## Summary

Enable social learning through shared sessions, leaderboards, team progress tracking, and competitive quiz modes.

## Key Deliverables

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

## Key Decisions

- **Real-time:** SignalR or WebSockets for shared sessions and competitive mode
- **Leaderboard:** Redis Sorted Sets or PostgreSQL for rankings; cached
- **Competitive mode:** Synchronized start; individual responses; real-time score updates; winner at end
- **Privacy:** Users opt-in to leaderboard; can hide from rankings

## Dependencies

- S29-01 through S29-10 (API backend)
- S31-01 through S31-09 (authentication for group membership)

## Risks

| Risk | Mitigation |
|---|---|
| Real-time sync latency | Regional server deployment; optimistic UI updates |
| Cheating in competitive mode | No client-side scoring validation; server authorizes all scores |
| Group management complexity | Start with simple groups (invite-only); public groups later |
