# Sprint 22: Lab Simulator Integration

**Phase:** Scale  
**Duration:** Week 43 - Week 44  
**Goal:** Wire the CefBridge lab simulator to the Core quiz engine so lab scenarios count in scoring.

---

## Summary

The lab simulator (15,100+ lines of JS Prism simulation) exists but is disconnected from the quiz engine. This sprint bridges the two.

## Sprint Backlog (Summary)

| ID | Story | Points |
|---|---|---|
| S22-01 | Define ILabSimulatorHost interface in Core | 3 |
| S22-02 | Wire SimulatorBridge handlers (load_exam_list, submit_answer) | 3 |
| S22-03 | Implement get_stats handler for simulation results | 3 |
| S22-04 | Bridge lab simulation scores into ExamSessionViewModel | 3 |
| S22-05 | Add lab-integrated question type to parser | 2 |
| S22-06 | Handle CefGlue platform differences (desktop vs mobile) | 2 |

**Total:** ~16 points

## Key Decisions

- **ILabSimulatorHost:** Interface in Core with methods: `LoadExamList()`, `SubmitAnswer(string scenarioId, string action)`, `GetStats()`, `SaveProgress()`
|- **SimulatorBridge implementation:** Desktop uses Avalonia.Controls.WebView (NativeWebView); mobile PWA uses native WebView |
- **Scoring integration:** Lab simulation outcomes map to QuestionResult records with type="lab"
- **Question type:** New `LabBased` QuestionType with scenarioId reference

## Dependencies

- S15-01 (QuestionType enum must exist)
- S3-06 (DI container for ILabSimulatorHost registration)

## Risks

| Risk | Mitigation |
|---|---|
| CefGlue replaced by Avalonia.Controls.WebView (NativeWebView) | Done 2026-10-28: no CefGlue reference remains in code or csproj; loopback server provides a real origin |
| Lab simulation state is complex to serialize | Simplified state summary for scoring; full state stays in simulator |

## Definition of Done

- [ ] Lab simulator scenarios submit answers that count in quiz scoring
- [ ] ILabSimulatorHost abstraction allows non-CefGlue implementations
- [x] CefBridge no longer returns stub data (handlers read real catalog + ISessionStore; CefBridgeHandlerTests 2026-10-03)
- [x] CefGlue fully replaced by Avalonia.Controls.WebView (NativeWebView); SimulatorBridge contract preserved (F2 complete)
- [ ] Lab questions parse correctly from markdown
