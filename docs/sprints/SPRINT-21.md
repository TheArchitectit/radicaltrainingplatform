# Sprint 21: Mobile PWA — Offline & Sync

**Phase:** Scale  
**Duration:** Week 41 - Week 42  
**Goal:** Add IndexedDB persistence and offline quiz capability to the PWA.

---

## Summary

Make the PWA fully functional offline with local data persistence and background sync when reconnected.

## Sprint Backlog (Summary)

| ID | Story | Points |
|---|---|---|
| S21-01 | Implement IndexedDB schema (questions, sessions, results) | 3 |
| S21-02 | Add Service Worker strategy for offline quiz | 3 |
| S21-03 | Sync session results when online (background sync API) | 3 |
| S21-04 | Add offline indicator UI | 1 |
| S21-05 | Implement app shell architecture | 2 |
| S21-06 | Add manifest updates for install prompts | 1 |

**Total:** ~13 points

## Key Decisions

- **IndexedDB wrapper:** Dexie.js or idb-keyval for simpler API
- **Offline strategy:** Cache-first for static assets; IndexedDB for dynamic data
- **Background sync:** Use Background Sync API (with fallback: retry on next page load)
- **Data sync:** If cloud API exists (Phase 4), queue sync requests; for now, local-only is fine
- **App shell:** Skeleton UI shown while content loads

## Dependencies

- S20-01 through S20-06 (responsive layout must exist)

## Risks

| Risk | Mitigation |
|---|---|
| IndexedDB quota exceeded on mobile | Compress question data; purge old sessions; warn user |
| Background Sync API not supported on all browsers | Fallback: check for queued sync on app startup |
| Service Worker update races | Implement skipWaiting + clients.claim pattern |

## Definition of Done

- [ ] PWA works offline after first visit
- [ ] Quiz sessions persist in IndexedDB
- [ ] Background sync attempts when reconnected
- [ ] Offline indicator visible when disconnected
- [ ] Install prompt works on Chrome and Safari
