RadicalTrainingPlatform
Multi-vendor + AI platform specification | Revision 2 | October 1, 2026
1. Direction and decision boundary
 Build a multi-vendor study platform with Nutanix as the pilot. AI is part of the foundation: a cited tutor, authoring help, adaptive coaching and simulated-lab debriefs. Study, scoring and persistence must work without AI.
Roger confirmed multi-vendor scope, a revised vendor roadmap and AI inclusion. Specific vendors, AI features, thresholds and architecture below are proposals, not individually approved choices. This revision creates documents only. No repository writes or PRs.
The original read-only audit of main at 2b17f51 reported 1,598 Nutanix questions across five exams and a 49-view simulator, no study persistence and no web study mode. This revision inherits that historical basis; it is not a new repository audit. The original audit did not launch Desktop/PWA or run local .NET builds. Question correctness and content rights remain unverified.
Changes from v1: vendor manifests and AI contracts move from later work into Phase 0. A second-vendor slice becomes a foundation gate. Rights review, human question approval, AI evaluation and cost controls become release requirements. Original audit and v1 plan remain unchanged.
Still-open product assumptions: PWA-first with Desktop as an optional shell; local-first progress; markdown authoring compiled to JSON. Accounts, cloud sync, paid plans and live-cloud lab execution are outside the first release.
2. Foundation and architecture
 Proposed boundaries: content/vendors/<vendorId> contains manifests, markdown, errata and rights records. A compiler produces immutable validated JSON. packages/contracts defines schemas; packages/learning owns scoring, scheduling and storage ports; packages/simulator owns one runtime and scenario adapters. apps/web is the PWA; apps/desktop hosts the same learning UI. An optional services/ai-gateway handles retrieval, provider adapters, policy and quotas. This gateway is proposed, not existing.
Retain .NET where native export needs it, but do not duplicate scoring/scheduling. Validate WebView support on each target OS before replacing the desktop host.
F-01 Vendor-neutral IDs and contracts. Acceptance: Nutanix and a synthetic second vendor load through the same schema/UI; identical local question IDs do not collide in progress.
F-02 Versioned manifests. Include vendorId, pack/schema versions, product/exam version, locale, source review date and rights status. Acceptance: missing fields and incompatible schemas fail CI with the affected pack and field.
F-03 One learning engine. Acceptance: identical fixture sessions score and schedule identically in Web and Desktop.
F-04 One simulator source. Acceptance: both shells consume the same built assets; CI detects duplicated authoritative source. Reconcile the existing bridge variants behind an explicit contract.
F-05 Provider-neutral AI gateway. Acceptance: a mock replaces the first provider without UI changes; no service secret appears in browser assets.
F-06 Stable pack migrations. Acceptance: adding a vendor or updating a pack preserves history; deleted/changed questions are marked, never silently reassigned.
Repair first: verify current main, then revisit Avalonia alignment, desktop smoke launch, inert errata, missing LICENSE, generated counts, stale docs and old embedded-browser concerns. Prior audit advises against merging chore/external-audit. Recheck its current diff before cleanup. This spec authorizes no branch deletion or dependency merge.
3. Content rights and exam integrity
 A public source URL is not a redistribution license. A code license does not license vendor manuals or question banks. Nutanix and AWS protect certification exam material [S2-S4]. AI paraphrasing does not cure unauthorized content. RTP is a preparation product, never an exam-time assistant.
C-01 Deterministic content compilation. Acceptance: malformed types, duplicate IDs, invalid keys and missing objectives fail CI; identical source builds identical pack output.
C-02 Per-item provenance. Record author, source URL/locator, retrieval date, exam/product version, objective, reviewer, rights basis and human/AI-assisted origin. Acceptance: missing fields block publication.
C-03 Separate rights gates for viewing, redistribution, embedding/retrieval and model-provider transmission. Acceptance: linking-only sources are absent from bundled text and AI indexes; restrictions remain attached to the source record.
C-04 Exam-integrity quarantine. Flag claims of actual or remembered exam questions, leaked tests and suspicious near-duplicates. Acceptance: flagged fixtures cannot enter public packs, tutor retrieval or generation context; review decisions are logged. Similarity checks aid review, not prove legality.
C-05 Apply errata at compile time with correction ID, evidence and reviewer. Acceptance: known NCA-75-Part1 Q35 = D and Part3 Q3 = A fixtures pass. Precisely identify the audit's third reported correction before adding it; never guess its key.
C-06 Human approval of every scored question's key, explanation, provenance and wording. Acceptance: AI-draft and unreviewed states are excluded from releases. AI cannot mark an item approved.
C-07 Track official objective sources and review dates by exam version. Acceptance: retired-version fixtures warn clearly; blueprint changes create review work rather than silent relabeling.
C-08 Generate documentation counts; distinguish code, original-content and third-party licenses. Acceptance: CI rejects stale counts and missing license/attribution records.
Review the existing 1,598-item bank and two vendor PDFs before a public learning release. The audit did not establish that the bank is a dump; this plan makes no such allegation. Omit uncertain material from new distributable packs and AI corpora until rights are established. Recommend official links instead of bundled PDFs unless redistribution permission exists. Removal from the public repository, history rewriting and license selection require a separate owner decision. Nothing is removed here.
4. Learning and simulated labs
 L-01 Study, practice and timed practice modes. Acceptance: E2E tests cover answering, review, pause/resume and completion; timed practice hides tutor hints until submission.
L-02 Local persistent attempts, flags, sessions and scheduling state. Acceptance: restart preserves data; full/denied storage reports a recoverable error rather than a false save.
L-03 Versioned export/import with checksums and a replacement preview. Acceptance: round-trip preserves scores/due dates; malformed or unsupported imports leave existing data untouched.
L-04 Deterministic SM-2-style scheduling and objective-gap selection. Acceptance: seeded tests cover repeated failures, correct answers, timezone changes and clock rollback. AI is not required to compute due dates.
L-05 Explain weak-area recommendations using actual statistics. Acceptance: displayed gaps match fixture attempts; do not infer a probability of passing from practice scores.
L-06 Single/multi-select first, then ordering and lab tasks. Acceptance: explicit scoring rules and incorrect/partial-answer fixtures per type; keyboard operation works.
L-07 Scenarios define initial state, allowed actions, objective IDs and deterministic completion checks. Acceptance: recorded pass/fail action sequences replay consistently; reset restores clean state. Hints cannot mark a task passed.
L-08 Clearly mark simulation. Acceptance: scenario actions send no real infrastructure request.
L-09 Target WCAG 2.2 AA. Acceptance: automated checks plus manual keyboard, screen-reader, focus and contrast checks on critical study/lab views. Automation alone is not a conformance claim.
L-10 Offline installed-pack study, scoring and labs. Acceptance: network-disabled E2E tests pass after download, including failed download and pack update. Uncached AI shows unavailable. A Lighthouse score alone does not prove offline correctness.
Pilot a small rights-cleared Nutanix pack: one objective, one lab and a complete loop from authoring through review, study, persistence, tutor citations and offline fallback. Do not wait for all 1,598 items. Then prove the same loop with a second vendor before declaring multi-vendor support complete.
5. AI features and acceptance
 AI supplies suggestions and explanations, not truth or scoring authority. Provider, model, feature scope and spending limits remain owner choices.
A-01 Cited tutor using eligible version-matched sources. Acceptance: every factual response cites resolvable source IDs; unsupported/conflicting evidence produces explicit abstention.
A-02 Graduated hints in study and explanations after submission. Acceptance: timed-mode restrictions cannot be bypassed by a user prompt.
A-03 Authoring copilot drafts original questions, distractor rationales and tags. Acceptance: schema-valid output stays labeled AI-assisted and unpublished until the C-06 human review gate.
A-04 Review assistant flags contradictions, weak distractors, version drift and coverage gaps. Acceptance: findings name the item and evidence; AI never changes a released key or approves content.
A-05 Adaptive coach translates deterministic weak-area/due data into a short plan. Acceptance: recommendations cite actual statistics and respect session-length limits; AI cannot alter scheduling or claim exam readiness.
A-06 Simulated-lab debrief explains recorded actions. Acceptance: explanation matches trace/state; only deterministic checks decide pass/fail.
A-07 Supplementary generated practice after the reviewed tutor is stable. Acceptance: labeled unscored AI output with sources and error reporting. Scored use requires human approval.
A-08 Cross-vendor comparison after two reviewed packs. Acceptance: approved evidence from both vendors; analogies are distinguished from equivalence and missing evidence is stated.
Recommended sequence: A-01 to A-04 with the first learning slice; A-05/A-06 with the learning engine; A-07/A-08 after two approved packs. No autonomous live-cloud operator, exam-time overlay, unsupervised publishing, automatic public-web ingestion or training on the whole repo. AI-off works from day one. Local-model support can be a later adapter, not an assumed privacy guarantee.
6. AI safety, privacy and cost
 RAG does not fully prevent prompt injection [S5]. Use layered application controls and explicit evaluations informed by NIST's GenAI risk-management profile [S6].
G-01 Retrieval text is evidence, not instructions. Acceptance: adversarial fixtures cannot cause publishing, secret disclosure, provider changes, external requests or lab actions. Model output has no execution capability and is validated outside the model.
G-02 Filter retrieval by pack/version, rights and eligibility. Acceptance: no cross-user or forbidden-pack data in context; revoked sources disappear from indexes/caches.
G-03 Optional online AI and explicit data consent. Acceptance: AI-off sends no learning data; disclose outgoing context before first request; reject/redact secrets. Provider selection requires retention/training-policy review.
G-04 Redacted logs and configured retention. Acceptance: local reset and server deletion tests remove relevant user data; logs contain neither keys nor full bank text.
G-05 Token limits, per-user quotas, global spend cap, rate limits and kill switch. Acceptance: caps stop new billable calls; bounded retry avoids multiplying requests; no silent paid fallback. Dollar limits require owner selection before paid rollout.
G-06 Versioned pilot evaluation: at least 100 answerable, 30 unsupported/conflicting and 30 injection cases. Proposed gates: at least 95% expert-rated factual correctness; 100% valid source pointers; at least 95% correct abstention; zero unauthorized side effects in that suite. Acceptance: report records model, prompt, pack version and failures. These thresholds are proposals, not existing results or a safety guarantee.
G-07 Rerun evaluation on model/prompt/retrieval/corpus changes. Acceptance: regression blocks rollout; rollback restores the prior approved configuration.
G-08 Provider outage, quota and timeout fallback. Acceptance: saved progress and study remain usable; no invented explanation replaces a failure.
G-09 Public service security. Acceptance: auth, authorization, TLS and secret storage are tested; unauthenticated/cross-user requests fail; built assets contain no provider key.
Measure delayed recall, objective coverage and content-error reports separately from AI fluency. Track citations, abstention and cost per useful session. Latency/spend targets need a small opt-in pilot.
7. Vendor roadmap (recommended, not selected)
 Rank by engine reuse, infrastructure relevance, official objective sources, rights-review effort and ability to prove different scenarios. This is not a market-demand ranking. Each pack needs its own version and rights review.
1. Nutanix pilot. Start small, then expand the existing five tracks after confirming their current official versions [S1]. Treat audit exam IDs as historical, not automatically current. Exit: approved provenance, a complete learning loop, one lab and AI evaluation.
2. Microsoft Azure. Recommended second vendor: an AZ-900-style foundations pack. The official credential covers cloud concepts, Azure architecture/services and management/governance [S7]. It tests another catalog without an immediate large simulator. Use original questions and small identity/network/governance scenarios. More advanced administration labs follow only after current objective research. Exit: no vendor-specific core changes and sufficient reviewer capacity.
3. AWS. Start with Cloud Practitioner concepts, then consider an architecture track after current objective research. CLF-C02's official guide supports the foundational scope [S8]. It enables cross-cloud comparisons after Azure, but is not permission to copy assessment items. AWS protects assessment content and bars unauthorized AI assistance during exam sessions [S3-S4]. Exit: original reviewed material, parity tests and two-sided comparison evidence.
4. Linux + CNCF ecosystem. An ecosystem track, not one vendor. Begin with original Linux/container foundations and a simulated Kubernetes task, then consider CKA-oriented learning. The Linux Foundation publishes a CKA curriculum path [S9]; research current exam objectives before authoring. Exit: deterministic task grading, reset/replay and expert-reviewed scenarios.
Defer Broadcom/VMware, Cisco, Red Hat and security tracks until user demand, reviewer time, current objectives and rights are established. These are backlog candidates, not approved work.
AI curriculum: map AI infrastructure and responsible-AI topics across vendors. Existing NCP-AI material is a Nutanix lead, not a universal credential. Azure/AWS AI-specialist packs require current exam-name/objective research first. Do not build around a credential that may be renamed or retired.
One additional vendor slice at a time. If Roger prefers a different second vendor, swap the pack, not the architecture.
8. Phases and branch-and-push delivery
 Phase 0 - repair and contracts (proposed 2-3 weeks). Recheck current head; repair blockers; specify vendor/AI/storage contracts and rights intake. Gate: F-01/F-02/F-05, errata fixtures, license decision record, desktop smoke and synthetic second-vendor contract test.
Phase 1 - one simulator and content pipeline (2-3 weeks). Gate: F-04, C-01 to C-06 and L-07/L-08; one authoritative simulator source.
Phase 2 - complete Nutanix slice and safe AI (3-5 weeks). Study, persistence, offline behavior, tutor and authoring drafts. Gate: L-01/L-02/L-03/L-10, A-01 to A-04 and G-01 to G-09. Public AI waits for service gates.
Phase 3 - second vendor and adaptive learning (2-4 weeks). Recommended Microsoft slice, scheduler, accessibility and lab coaching. Gate: F-03/F-06, L-04 to L-06/L-09 and A-05/A-06; no second-vendor core fork.
Phase 4 - release (1-2 weeks). Supported-platform matrix, packaging, signed artifacts, changelog and rollback. Gate: every selected requirement has evidence at the tested SHA; installed PWA and Desktop smoke pass. Expand AWS/CNCF afterward.
Sequential ranges imply about 10-17 weeks, not a promised delivery date. Capacity, rights review and host compatibility are unmeasured. Revise estimates after the first slice.
D-01 Spec and acceptance fixtures before code. Acceptance: each implementation/evidence record maps to requirement IDs; unresolved decisions are marked rather than silently encoded.
D-02 Named non-main work branch per phase from a recorded base SHA. Acceptance: base/head SHA, changed files and test outputs are reported; no force-push or main changes under this workflow.
D-03 Push only within owner-authorized scope; no PRs. Acceptance: phase report includes the actual branch URL, commits, gates and blockers. No autonomous merge, tag, public deployment or branch deletion follows from this document.
D-04 Proposed minimum 70% line coverage in each shared learning/core package, with direct scoring, persistence, migration, errata and AI-boundary tests. Acceptance: CI fails below threshold; release evidence identifies the exact tested head and separates local tests from remote CI.
Decisions needed before affected work: second vendor; PWA/Desktop role; markdown-to-JSON authoring; AI provider/model and dollar caps; public-content licensing and vendor PDF disposition; hosted versus self-hosted runner. Independent preparation can continue. Paid activation, uncertain-content distribution and destructive cleanup wait for separate approvals.
9. Sources and remaining uncertainty
 Basis: original RTP Architecture Audit and v1 Platform Plan, downloaded from Roger's private Drive folder. Implementation claims are explicitly audit-derived and historical. Sources below were searched and fetched on October 1, 2026. Official sources own exam/program facts; OWASP and NIST supply independent security/risk guidance. No unsupported market ranking is used.
S1. Nutanix certification catalog. Current-version lookup before publication.
https://www.nutanix.com/support-services/training-certification/certifications
S2. Nutanix Certification Program Candidate Agreement (PDF, copyright 2023). Exam confidentiality and distribution restrictions. Broad wording includes blueprints; permitted use of public objectives needs separate review.
https://www.nutanix.com/content/dam/nutanix/resources/education/ed-nutanix-certificate-program-agreement.pdf
S3. AWS Certification Program Agreement (fetched page updated July 17, 2026). Assessment confidentiality and exam-session AI restrictions.
https://aws.amazon.com/certification/certification-agreement/
S4. AWS Training and Certification, Protecting AWS Certification value through security measures. Legitimate study versus unauthorized actual exam items.
https://aws.amazon.com/blogs/training-and-certification/protecting-aws-certification-value-through-security-measures/
S5. OWASP GenAI Security Project, LLM01:2025 Prompt Injection. RAG is not complete injection mitigation.
https://genai.owasp.org/llmrisk/llm01-prompt-injection/
S6. NIST AI RMF: Generative AI Profile, AI 600-1 (July 26, 2024). Risk/evaluation framing, not certification or compliance.
https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence
S7. Microsoft Learn, Azure Fundamentals. Scope supporting proposed second-vendor slice; no redistribution permission inferred.
https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/
S8. AWS Cloud Practitioner CLF-C02 exam guide. Foundation scope supporting proposed roadmap.
https://docs.aws.amazon.com/aws-certification/latest/cloud-practitioner-02/cloud-practitioner-02.html
S9. Linux Foundation CKA Sample Curriculum Path (2024/10 URL). Roadmap lead, not a verified current exam blueprint.
https://training.linuxfoundation.org/wp-content/uploads/2024/10/CKA.pdf
Not done in this revision: live runtime checks, current repo-head audit, item-by-item correctness/legal review, vendor redistribution approval or AI-provider evaluation. Requirements, architecture, thresholds, estimates and vendor order are proposals. Rights review may change what can ship; isolated packs limit that impact. This technical risk plan is not legal advice.