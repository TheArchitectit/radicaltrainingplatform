# Sprints 35-36: WCAG 2.1 AA Accessibility

**Phase:** Enterprise  
**Duration:** Weeks 69-72 (4 weeks)  
**Goal:** Achieve WCAG 2.1 AA compliance across all platforms.

---

## Summary

Complete the accessibility work started in Sprint 25. Full audit, remediation, and certification-ready compliance.

## Key Deliverables

| ID | Deliverable | Points |
|---|---|---|
| S35-01 | Commission or perform WCAG 2.1 AA audit | 3 |
| S35-02 | Fix all critical findings (screen reader, keyboard) | 4 |
| S35-03 | Fix high findings (color contrast, focus management) | 3 |
| S35-04 | Add high-contrast light theme | 3 |
| S35-05 | Implement system-theme detection | 2 |
| S35-06 | Add focus trapping in dialogs and modals | 2 |
| S35-07 | Add skip links and landmark regions | 1 |
| S35-08 | Document accessibility compliance (VPAT) | 2 |

**Total:** ~20 points over 2 sprints

## Key Decisions

- **Audit approach:** External auditor preferred; internal automated tools (Axe, Lighthouse) as supplement
- **Light theme:** High-contrast compliant; uses system accent colors
- **System-theme detection:** Follows OS dark/light mode preference; manual override available
- **Focus trapping:** Keyboard users cannot tab out of modals without explicit dismiss
- **VPAT:** Voluntary Product Accessibility Template documenting compliance level

## Dependencies

- S25-01 through S25-06 (accessibility foundation from Phase 3)
- Phase 3 stable (all UI features must exist before audit)

## Risks

| Risk | Mitigation |
|---|---|
| Avalonia accessibility gaps vs WPF | Contribute fixes upstream; document workarounds |
| Audit reveals structural issues requiring major rework | Start audit early in the 2-sprint window; buffer time for remediation |
| Light theme breaks synthwave brand identity | Design light theme that maintains brand while meeting contrast ratios |
