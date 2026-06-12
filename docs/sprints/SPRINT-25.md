# Sprint 25: Accessibility Foundation

**Phase:** Scale  
**Duration:** Week 49 - Week 50  
**Goal:** Establish screen reader, keyboard navigation, and focus management fundamentals.

---

## Summary

Begin WCAG 2.1 AA compliance work with the foundational accessibility features. Full compliance is Phase 4.

## Sprint Backlog (Summary)

| ID | Story | Points |
|---|---|---|
| S25-01 | Add AutomationPeers to all custom controls | 3 |
| S25-02 | Implement keyboard navigation (Tab order, arrow keys) | 3 |
| S25-03 | Add screen reader labels and live regions | 3 |
| S25-04 | Add focus indicators (all interactive elements) | 2 |
| S25-05 | Ensure color is not the only information channel | 2 |
| S25-06 | Add ARIA roles where native semantics insufficient | 2 |

**Total:** ~15 points

## Key Decisions

- **AutomationPeers:** Custom controls (SynthwaveProgressBar, OptionCard, BlueprintCanvas) need peers that expose Name and Value
- **Keyboard nav:** Tab cycles focus; arrow keys move between options; Enter/Space selects; F flags
- **Live regions:** Answer submission result announced; timer warnings announced at 5-minute marks
- **Focus indicators:** Visible focus rectangle on all interactive elements (2px offset, cyan color)
- **Color independence:** Add icons/text to color-coded states (correct/incorrect, coverage levels)

## Dependencies

- S7-01 (MVVM structure helps with accessible naming)
- S8-01 (BlueprintView needs peer for canvas content)

## Risks

| Risk | Mitigation |
|---|---|
| Avalonia accessibility support is limited compared to WPF | Test with actual screen readers (NVDA, VoiceOver); file Avalonia issues |
| Focus management in dynamic views is complex | Use FocusManager; set focus explicitly on view navigation |

## Definition of Done

- [ ] All interactive elements have visible focus indicators
- [ ] Screen reader can navigate through a full exam session
- [ ] Keyboard-only user can complete an exam
- [ ] Color-coded states have non-color indicators
