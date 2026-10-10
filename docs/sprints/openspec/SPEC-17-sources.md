# OpenSpec SPEC-17 — Sources and Evidence

**Source:** [OpenSpec package rtp-beginner-tracks-2026-10](../../drive-ingest-2026-10-10/RTP-Beginner-Tracks-Openspec-Change-Package-A-Network-NCA75-v2.md), SPEC-17
**Executed in:** [SPRINT-45](../SPRINT-45.md) (T-01 baseline verification re-runs these reads at the working head)

## Repository evidence (verified October 10, 2026, at 904106ad388c0d48add662ddcd02153ff5f85537)

Direct file reads: Core/Services/QuestionParser.cs (regex anchors, DeriveExamCode truncation); Core/Services/SessionStore.cs (JsonSessionStore); Core/Services/Errata.cs (JsonErrataStore, answerKey-only); Core/Services/HardcodedBlueprintService.cs (InitNca75 beta blueprint, lines 540-641); Core.Tests/DeriveExamCodeTests.cs (16 pinned cases); Web/js/app.js (47 router.register calls); Web/js/core/StateStore.js (IndexedDB RadicalTrainingPlatformLab + localStorage fallback); Web/js/views/scenarios.js (44 scenarios, 78 objectives, 27 literal-true validators, us-bucket-01 collection mismatch); Web/js/views/pe-reports.js line 7 (broken ConfirmDialog.js import vs existing components/Confirm.js); Web/js/components/Confirm.js (actual export); NCP-AI-Part4.md Q61-70 (“B and D” key form); errata.json (two corrections); studyguides/CHEATSHEET-NCA-75.md line 96 (stale SSH claim), lines 1 and 135-140 (beta labels, waiver code); scripts/lint-content.py (root-only glob, name-based skips); .github/workflows/build.yml (two-leg CI); .github/scripts/vuln_gate.py (fail-open loop, lines 74-75); packaging/linux/build-appimage.sh, packaging/linux/app.radicaltrainingplatform.RadicalTrainingPlatform.yml, packaging/macos/ (script claims); Core/PdfExport/ExamPdfExporter.cs (“Nutanix Certification Practice” footer); LICENSE absent (404); CLAUDE.md (guardrails, stack).

## Companion documents

- Track-structure specification, October 10, 2026 (preliminary; working material).
- RTP Platform Plan v2, revision 2, October 1, 2026 — requirement IDs F/C/L/A/G/D inherited per [SPEC-14](SPEC-14-traceability.md) 14.3. https://docs.google.com/document/d/1XuTe8rfKrr-OsFPlyD1qtOEYEQgKVh0Jorc6vEgnLbA
- RTP audit and change reconciliation, October 10, 2026 (companion audit; findings C-01..C-10, CI-01..04, PKG-01..04, runtime evidence register).

## Vendor and policy sources (fetched October 10, 2026)

- CompTIA A+ Core 1 V15 page: https://www.comptia.org/en-us/certifications/a/core-1-v15/
- A+ Core 1 objectives v3.0 (PDF): https://assets.ctfassets.net/82ripq7fjls2/1oSdlyujpaX3GrM0rir6Ge/91afb2be72785281e8fb4c0d9a70c6f4/CompTIA-A-220-1201-Exam-Objectives-3.0.pdf
- A+ Core 2 objectives v3.0 (PDF): https://assets.ctfassets.net/82ripq7fjls2/6I8WL66IBa1AUovioDGrnM/f74a7eca336fd4e4c8e723a1f893086d/CompTIA-A-220-1202-Exam-Objectives-3.0.pdf
- CompTIA Network+ page: https://www.comptia.org/en/certifications/network/
- Network+ N10-009 objectives v4.0 (PDF): https://comptiacdn.azureedge.net/webcontent/docs/default-source/exam-objectives/comptia-network-n10-009-exam-objectives-%284-0%29-%281%29.pdf
- CompTIA unauthorized training materials policy: https://www.comptia.org/en-us/resources/test-policies/unauthorized-training-materials/ (interpretation in SPEC-00 00.3 is Instinct’s analysis, not legal advice; owner’s product posture is the binding constraint)
- Nutanix NCA certification page: https://www.nutanix.com/support-services/training-certification/certifications/certification-details-nutanix-certified-associate-v6-10 (URL legacy; body identifies 7.5)
- Nutanix NCA 7.5 blueprint guide, June 15, 2026: https://www.nutanix.com/content/dam/nutanix/en/resources/datasheets/ds-ebg-nca.pdf
- Microsoft dotnet list package machine-readable output contract: https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-package-list and the NuGet machine-readable output spec (GitHub NuGet/Home wiki).
- Nutanix Certification Program Candidate Agreement (rights boundary, Plan v2 S2): https://www.nutanix.com/content/dam/nutanix/resources/education/ed-nutanix-certificate-program-agreement.pdf
- OWASP LLM01:2025 Prompt Injection and NIST AI 600-1 (Plan v2 S5/S6) govern tutor control design.

## Honest uncertainty register

Runtime behaviors cited from the companion audit are marked **runtime-confirmed** (audited head executed) or **source-proven** (read, not executed) in their finding rows; PKG-04’s launcher-path concern is source-proven and its fix task includes the confirming build. Recommended-experience statements (A+ 12 months, Network+ 9-12 months, NCA 3-6 months) are vendor recommendations, not eligibility rules. Question counts are content counts. This package is a technical plan, not legal advice.

## Evidence status by finding class

- **Runtime-confirmed** (audit executed against the running app at the audited head): PWA boot failure; 16/44 seed auto-pass; us-bucket-01 unpassable; ordering graded unordered; retry double-accounting; bridge fake effects; persistence not called end-to-end; vuln gate fail-open reproduced live.
- **Source-proven** (read at the audited head, not executed): 27 literal-true validators; NCP-AI-Part4 dropped keys; AppImage control-flow defect; macOS script label mismatch; Flatpak pin/launcher concern (build confirmation included in its fix task); lint glob limits; README/LICENSE drift; PDF footer string.
- **Owner-verbalized, reconciled in this package:** “worked on Windows” history; cross-platform requirement; demo-mode-for-all-content requirement; non-endorsement posture; address-everything directive.
- **Final audit chapters:** the Web-runtime and .NET evidence chapters of the companion audit are integrated; SPEC-14’s register (section 14.2b) closes each finding as a distinct row.
