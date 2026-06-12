# Sprint 20: Mobile PWA — Responsive Layout

**Phase:** Scale  
**Duration:** Week 39 - Week 40  
**Goal:** Make the PWA responsive for mobile browsers with touch-optimized UI.

---

## Summary

Transform the static PWA from desktop-oriented to mobile-first responsive design.

## Sprint Backlog (Summary)

| ID | Story | Points |
|---|---|---|
| S20-01 | Add responsive CSS breakpoints (320px, 480px, 768px, 1024px) | 3 |
| S20-02 | Redesign question cards for touch (larger tap targets) | 3 |
| S20-03 | Implement bottom-tab navigation for mobile | 3 |
| S20-04 | Add swipe gestures for next/previous question | 2 |
| S20-05 | Optimize font sizes and spacing for mobile | 2 |
| S20-06 | Test on iOS Safari and Android Chrome | 2 |

**Total:** ~15 points

## Key Decisions

- **Breakpoints:** Mobile <= 480px (bottom nav, full-width cards), Tablet 481-768px (hybrid), Desktop > 768px (current layout)
- **Touch targets:** Minimum 44x44 CSS pixels per Apple HIG / WCAG 2.5.5
- **Bottom nav:** Home, Exams, Stats, Settings — hides on desktop
- **Swipe:** Hammer.js or native touch events for next/previous
- **Viewport:** Proper meta viewport tag with scale control

## Dependencies

- S9-03 (persistence API mirrors needed for PWA — may use IndexedDB wrapper)

## Risks

| Risk | Mitigation |
|---|---|
| Synthwave theme colors have contrast issues on bright phone screens | Test outdoors; adjust brightness; add contrast-enhanced mobile variant if needed |
| Safari has CSS/JS quirks | Test early on real iOS device; use progressive enhancement |

## Definition of Done

- [ ] PWA usable on 320px wide screens
- [ ] Bottom navigation works on mobile
- [ ] Touch targets meet 44x44px minimum
- [ ] Swipe navigation functional
- [ ] No horizontal scroll on any screen size
