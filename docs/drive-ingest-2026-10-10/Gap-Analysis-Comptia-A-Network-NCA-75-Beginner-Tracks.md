Gap Analysis: CompTIA A+, CompTIA Network+ and Nutanix NCA-75 Beginner Tracks on RadicalTrainingPlatform
Repository: TheArchitectit/radicaltrainingplatform, branch main, commit 904106ad388c0d48add662ddcd02153ff5f85537 (October 5, 2026) Prepared: Saturday, October 10, 2026, for Roger Lund Targets: Network+ student demo, Friday, October 23, 2026. Nutanix HQ trip, Sunday, October 25 to Wednesday, October 28, 2026. Status: Analysis and specification only. No repository file, branch, pull request or release was created or changed.
How to read this document
This document answers one question: what stands between the repository as it exists at the pinned commit and three working beginner tracks (A+, Network+, NCA-75) that Roger can put in front of students on October 23 and in front of Nutanix people on October 25 to 28.
It is organized so that a builder can work from it without asking Roger anything that is not listed in the decisions section. Every gap has an identifier, an evidence note, an owner, a fix specification with exact files and commands, and an acceptance test. Nothing in the register is parked. Where a fix needs a decision from Roger, the decision is named, the default is stated, and the work that does not depend on the decision is specified separately so it can start now.
Evidence is tagged in square brackets so you can tell how each statement was established:
* [V] Verified by me by reading source at the pinned commit, or by running a script I wrote against the checked-out tree. The commands are in Appendix B.
* [A] A finding from a runtime audit of the same commit, reported by a parallel runtime audit of the same commit. Where I could also confirm it from source I say so. Where I could not, the tag stays [A] and the acceptance test in this document is written so that the builder re-proves it.
* [O] Taken from an official vendor page or PDF fetched on October 10, 2026. URLs are in Appendix A.
* [S] From a secondary source. Used only for dates and facts that the vendor pages do not state.
* [P] A proposal or judgment of mine. Module designs, item counts and schedules are proposals, not measurements.
The words "gap", "defect" and "risk" are used in a specific way. A gap is a difference between what a track needs and what exists. A defect is a gap where existing code or content is wrong rather than missing. A risk is a condition that may or may not turn into a gap depending on a decision or an event.
Severity uses four levels:
* S1 - blocks the October 23 demo or the October 25 to 28 use. Must be closed, or its stated fallback must be rehearsed, before the date.
* S2 - must be closed before the packs are shown to students outside Roger's direct supervision, or before any public release.
* S3 - should be closed in the same build; failure degrades quality but does not block.
* S4 - record and fix when the file is next touched; listed so nothing is unowned.
1. Executive summary
1.1 The short version
The repository is a sound Nutanix study tool with a good parser, a working errata mechanism, a large Nutanix simulator and honest CI discipline in several places. It is not yet a multi-track beginner learning product, and three of the things the preliminary specification treats as reusable foundations are broken or weaker than assumed.
1. The web simulator does not start. RadicalTrainingPlatform.Web/js/views/pe-reports.js line 7 imports ../components/ConfirmDialog.js. The file is called Confirm.js. app.js imports pe-reports.js statically at line 45, so the browser refuses to build the module graph and no view renders [V, A]. I checked all 307 relative imports in the Web tree with a script and this is the only broken one [V]. The same defect is in the copy under RadicalTrainingPlatform.Legacy.WinForms/LabSimulator/Web, which is the copy the Desktop app actually embeds [V]. The fix is one line, but the finding matters more than the fix: the specification's plan to put a DNS ticket and a gateway task on top of the existing Router, StateEngine and Wizard cannot be rehearsed until a boot test exists.
2. Scenario completion checks are weak, and many pass without any work. 27 of the 78 objective validators in scenarios.js are the literal () => true [V]. The runtime audit found 16 of the 44 scenarios complete on a fresh seed with no learner action, and one scenario, us-bucket-01, cannot be completed at all [A]. All 44 scenarios belong to NCM-MCI, NCP-CI, NCP-AI or NCP-US; none is for NCA [V]. The specification's rule that a wrong state must fail and a right state must pass is the right rule, and nothing in the current scenario engine enforces it.
3. Ordering questions are graded as unordered sets. ExamSessionViewModel.Submit sorts both the key and the selection before comparing [V], and the runtime audit confirmed the effect [A]. A learner who selects B, C, D, A, E in the wrong order gets credit for the order-sensitive write path question. A+ and Network+ both need ordered steps (troubleshooting method, malware removal procedure, OSI layers), so this blocks the new content, not just the old.
4. Ten Nutanix questions are silently dropped. NCP-AI-Part4.md Q61 to Q70 use the answer line **Answer: B and D**. The parser's AnswerRegex accepts only letters, commas and spaces, so the answer line does not match, the key list stays empty and the question is skipped with a log warning [V, A]. scripts/lint-content.py counts these lines as valid because it only checks that a letter follows Answer: [V]. The "1,598 questions" headline is therefore 1,588 questions the app can load. The same answer format is the natural one for the multi-select A+ and Network+ items the new tracks need.
5. Answer keys are positionally biased to the point of being guessable. Across the 1,558 single-token answer lines in the Nutanix banks, 769 are B and 593 are A; together 87 percent [V]. In the NCA bank, B is the key on 90 of 130 single-answer questions (69 percent) [V]. NCP-AI-Part1.md has 80 questions and all 80 keys are A [V]. A student who learns this pattern scores well without learning Nutanix, and a demo audience that notices will discount everything else. New packs must be authored with balanced keys and checked by a linter; existing packs need a rebalancing pass before they are shown.
6. The exam-code logic cannot name the new exams. QuestionParser.DeriveExamCode turns COMPTIA-A-1201-Part1.md and COMPTIA-A-1202-Part1.md into the same code COMPTIA-A, and COMPTIA-NET-009-Part1.md into COMPTIA-NET [V, reproduced with a faithful port of the regex]. Two exams would merge into one, progress keys would collide, and the vendor lookup would return "Independent". The specification already warns about this; this analysis confirms it and specifies the fix and its test.
7. The NCA-75 bank is a beta-era bank and the repository's blueprint does not match the official guide. All three NCA files are titled "NCA 7.5 Beta" [V]. The hardcoded blueprint has four sections with weights 20, 30, 25 and 25 percent and 17 objectives [V]. The current official guide has four differently named sections, 14 objectives, and publishes no section weights [O]. The cheatsheet is titled "Beta Exam", carries the beta discount code and the June 14 end date, and still says "CVM SSH disabled by default", which contradicts the bank's own corrected answer for GapFill Q3 and the doc review report [V].
8. There is no LICENSE file, the README claims one, and two vendor PDFs are in the public repository through Git LFS. README.md shows a BSD 3-Clause badge and a LICENSE section, and the project tree in the README lists a LICENSE file; none exists at the pinned commit [V]. docs/AHV-Admin-Guide-v11_0.pdf and docs/Prism-Central-Guide-vpc_7_5.pdf are LFS pointers in a public repository [V, visibility confirmed with the GitHub connector]. The README also describes a four-exam WinForms tool with 1,458 questions, and links to a different repository [V].
9. Quiz progress is not saved anywhere durable. JsonSessionStore is real and tested, but the only caller is the CEF lab bridge. ExamSessionViewModel keeps correct and wrong sets in memory only. The Web app has no quiz view at all [V]. The desktop bridge handlers get_stats and submit_answer return fixed or logged-only values: get_stats always reports answered = 0, correct = 0, and submit_answer writes a debug line and returns recorded = true [V]. The audit also reports that stats, reset, settings and import handlers fake their effects [A]. The specification's statement that persistence is implemented is true of the store and false of the product.
10. The CI vulnerability gate fails open. .github/scripts/vuln_gate.py iterates for item in data if isinstance(data, list) else [], so a JSON object at the root, which is what dotnet list package --vulnerable --format json emits, yields zero hits and the gate prints PASS [V]. The audit reproduced a High advisory passing the gate [A]. Current packages are clean, so nothing vulnerable ships today, but the repository's claim of a blocking gate is false.
11. There is no A+ or Network+ content, no lesson runtime, no tutor and no host plan. The 24 A+ and 25 Network+ demo items, four lessons, two scenarios, the recorded tutor examples and the disclaimer surfaces all have to be authored and built in 13 days [P]. The builder, reviewer and demo host are still unnamed [from the specification].
12. Vendor policy shapes the content process. CompTIA's unauthorized-training-materials page states that CompTIA does not authorize or condone AI or LLM tools generating study questions, practice exams or exam-related content, and warns that such material may be inaccurate or may resemble live exam items [O]. Roger's position, in his own WhatsApp words on October 10, is "They can't legally prevent anyone for making ai generated training content" and "We will clearly state this isn't official training or endorsed training material." This document does not decide what the law allows; it records CompTIA's published policy as a vendor statement, adopts Roger's stated framing decision (a clear non-endorsement statement everywhere, no "official" or "approved" language, no vendor marks in branding), and proposes content controls of my own [P]: items are original and written from the published objectives, no third-party exam dump or recalled exam content is used as input, and a named human reviews every item before it is shown. Those three controls are my recommendation, not a decision Roger has stated.
13. Two new requirements arrived from Roger while this analysis was running. "This was working on windows but we need it cross platform" and "Plus we need the demo mode to work for all content aka simulator" (WhatsApp, October 10). The first means the track must run on Windows, macOS and Linux; today the Desktop app embeds a copy of the simulator through CefGlue and the legacy copy targets WebView2, and the only host-neutral path, the PWA, does not boot. The second means every module in all three tracks needs a working simulator activity in demo mode, not just the two synthetic-workstation tasks in the preliminary specification. Both are specified: Section 6.9 covers the cross-platform matrix, and Section 6.10 and the objective sections give a simulator treatment for every objective.
1.2 What has to be true on each date
By Thursday, October 22 (freeze for October 23): the simulator boots in the demo host's browser or webview from a cold start; one A+ lesson per core and one Network+ concepts lesson and one Network+ troubleshooting lesson are readable; 24 A+ and 25 Network+ reviewed items score correctly including multi-select and ordering; two synthetic-workstation tasks (DNS server, default gateway) pass only on the correct final state and fail on three named wrong states each; progress survives a reload and a reset clears it; the disclaimer text appears on every product surface and in the script; the tutor is either live and passing its gate or a labeled recorded example; and a rehearsal on the actual demo host has been run offline and online.
Before the Nutanix trip (hotel check-in October 25, check-out October 28): the NCA-75 cut is frozen: 14 lessons, a 40-item reviewed pilot, four scenarios with deterministic checks, a versioned current-objective manifest, and a corrected cheatsheet. The travel day and departure time are not verified in this document, so no calendar cutoff before October 25 is stated; the freeze is set relative to the verified itinerary once Roger confirms it (decision D6).
1.3 The ten gates that decide go or no-go
Gate
	What must be demonstrably true
	Gap IDs
 
	G1 Boot
	Cold start of the simulator shows the dashboard with zero console errors on the demo host
	PLAT-01, PLAT-02
	G2 Scoring
	Ordered, multi-select and single-answer items grade correctly, including retry
	PLAT-03, PLAT-04, PLAT-05
	G3 Identity
	Four exam IDs resolve to four distinct catalog entries with correct vendor and display name
	PLAT-06, PLAT-07
	G4 Content integrity
	Linter passes with semantic rules: key balance, answer-token grammar, objective ID presence, explanation agrees with key
	PLAT-08, CNT-01
	G5 Tasks
	Wrong simulated state fails, right state passes, reset restores
	SIM-01 to SIM-05
	G6 Persistence
	Progress survives reload on the demo host; storage failure is reported on screen
	PLAT-09, PLAT-10
	G7 Framing
	Exact non-endorsement text on landing, lesson, quiz, tutor and script; no "approved", "official" or vendor marks in branding
	RGT-04, RGT-05
	G8 Rights
	LICENSE exists and matches README; vendor PDFs resolved; every shipped item has an author record and a passing RedEye review log
	RGT-01 to RGT-03, RGT-06
	G9 Tutor
	Live tutor passes its 24-prompt gate with citations, or the recorded-example fallback is shown and labeled
	TUT-01 to TUT-04
	G10 Rehearsal
	Full run on the demo host, offline and online, with a non-AI backup
	DEMO-01 to DEMO-08
	1.4 How this document differs from the preliminary specification
The preliminary specification is a good plan and this document keeps its structure: four exam IDs, manifests, a thin tutor slice, a 24/25/40 item demo cut. Section 3 lists every place where evidence changes it. The largest changes are the boot defect, the size of the scenario-validation problem, the ordered-answer grading defect, the answer-position bias, the parser's silent drop of multi-select items in the and format, the exact objective structure of each official exam, and the fact that A+ does not test the troubleshooting methodology while Network+ does.
2. Scope, baseline and method
2.1 What was examined
I cloned the public repository, checked out the pinned commit and verified that origin/main still points at it on October 10 [V]. I read the Core library (2,669 lines of C#), the parser, errata loader, session store, repository search logic, blueprint service, the Desktop CEF bridge and project file, the full Web tree (2,571 lines of core and component JavaScript plus 49 view files), both GitHub workflows, the content linter, the vulnerability gate, errata.json, the NCA study files, the five cheatsheets, the README, CLAUDE.md, the docs folder and the audit digests. I wrote scripts to check every question file for structural and key-distribution properties, to check every relative import in the Web tree, to simulate the exam-code derivation, and to compute keyword coverage of the NCA bank against the official objectives. I did not build the solution, because no .NET SDK is available in my workspace; where a finding depends on runtime behaviour I either reasoned from the code and say so, or I rely on the parallel audit and tag it [A].
I fetched the three official objective documents and the Nutanix blueprint guide on October 10 and read them in full: the CompTIA A+ 220-1201 and 220-1202 objectives (document version 3.0), the CompTIA Network+ N10-009 objectives (version 4.0), and the Nutanix NCA 7.5 Exam Blueprint Guide dated June 15, 2026. I also fetched CompTIA's A+ and Network+ certification pages, CompTIA's unauthorized-training-materials policy page and two Nutanix Community posts about the NCA 7.5 beta and launch.
2.2 What was not examined, and what that means
* No local build, installed-app test or CI run. CI status on main is taken from the audit, not re-run.
* No question-by-question correctness audit. I checked structure and key distribution for all 1,598 headers, and I read the NCA questions that contradict official objectives or the doc review. Whether each of the other 1,400-odd keys is right is not established, and the documents in the repository that claim "100 percent validated" are claims, not evidence I could test.
* No access to real exam content, and none sought. All statements about what an exam tests come from the published objectives.
* The demo host is unknown. Hardware, operating system, browser, projector and network at the October 23 venue are not in any source I could reach. Every host-dependent gap is therefore written as a test to run on the host once it is named.
* Late audit findings. Further audit findings may arrive after this version. Appendix F defines how a late finding becomes a register entry with the same fields, so none is left without an owner.
2.3 Counting conventions
"Narrative" words in this document exclude verbatim listings and tables. Counts of questions are counts of ### Q headers unless stated. "Parseable" means the Core parser would load the question, based on reading the regexes and checking each file with an equivalent script. Percentages are rounded to whole numbers.
3. Corrections and additions to the preliminary specification
The table lists each statement in the preliminary specification that the evidence changes, what the evidence says, and where this document handles it.
#
	Preliminary specification says
	Evidence says
	Handled in
 
	1
	Reuse the Router, StateEngine, Wizard, EntityTable and scenario patterns
	The Web app does not boot because of one bad import; reuse is sound after a boot test exists
	PLAT-01, PLAT-02
	2
	Existing CLI scenarios contain checks that return true; do not adapt them
	27 of 78 validators are literal true; 16 of 44 scenarios pass on a fresh seed; one is unpassable; the shared persisted state lets one group's work pass the next group's checks
	SIM-01 to SIM-05
	3
	Session JSON storage is implemented in Core; persistence claim superseded
	The store is implemented; it is called only by the lab bridge; quiz sessions are memory only; stats and submit handlers are stubs
	PLAT-09, PLAT-10, PLAT-11
	4
	Multi-select scoring should be added
	Multi-select exists; the and answer format is not parsed; ordering is graded unordered; retry double counts
	PLAT-03 to PLAT-05
	5
	Begin A+ with a shared "diagnose without guessing" lesson
	Good lesson design. CompTIA states the methodology is not tested in A+; Network+ does test it (objective 5.1)
	A+ sections, NET-5.1
	6
	Pass scores and formats not stated
	A+ Core 1: 675, Core 2: 700 on 100 to 900; Network+: 720 on 100 to 900; each up to 90 questions in 90 minutes, multiple-choice and performance-based; NCA 7.5: 50 questions, 90 minutes, 3000 on a 1000 to 6000 scale
	Section 4
	7
	NCA intended experience not stated
	The official guide says about 3 to 6 months; a Nutanix Community launch post says 6 to 12 months of IT experience plus 3 to 6 months of Nutanix; the two official-ish sources differ
	Section 4, NCA intro
	8
	Claimed beta end date June 14 is stale
	The beta ran to June 14, 2026 and the Community post says NCA 7.5 appointments began July 28, 2026 [S]; the guide is dated June 15, 2026 [O]
	CNT-NCA-02
	9
	AI tutor must be cited and bounded
	Add: CompTIA's published AI position, Roger's stated framing decision, my proposed content controls, and the exact disclaimer text
	RGT-04, RGT-05, TUT-01
	13
	Two or three simulator tasks for the demo
	Roger now requires demo mode to work for all content and to run cross-platform; every objective gets a simulator treatment and the host matrix is specified
	Sections 6.9, 6.10, objective sections
	10
	Errata provider handles corrections
	Both existing errata entries are already baked into the markdown, so they are no-ops today; only answer-key corrections are supported, so explanation text can still contradict an erratum
	PLAT-12
	11
	Four exam IDs with explicit manifests
	Confirmed; also the vendor map, display-name map, level map, blueprint lookup and color hash all depend on name fragments and need manifest-driven replacement
	PLAT-06, PLAT-07, PLAT-13
	12
	Content lint is adequate
	The linter checks counts only; it passes the 10 dropped questions, the key bias and ordering keys
	PLAT-08
	Two additions of my own:
* Shared mutable simulator state between student groups. The simulator persists its whole state under a single IndexedDB key and never versions the seed, so a rehearsal on the demo machine leaves objects that satisfy the next group's checks, and a changed seed does not reach a browser that already has old state [V]. This is specified as SIM-04 and DEMO-05.
* Static import check as a standing gate. A script that checks every relative import costs nothing and would have caught the boot defect in June. It is specified as PLAT-02.
4. Vendor baseline: what each exam is today
This section fixes the facts against which content gaps are measured. Every fact has a source in Appendix A.
4.1 CompTIA A+ (V15): two exams, both required
The CompTIA page for A+ Core 1 and 2 V15 gives a launch date of March 25, 2025 and an estimated retirement of 2028, a maximum of 90 questions per exam in 90 minutes, mixed multiple-choice (single and multiple response), drag-and-drop and performance-based items, passing scores of 675 for Core 1 and 700 for Core 2 on a scale of 100 to 900, and a recommended 12 months of hands-on experience in an IT support specialist role [O]. A candidate must pass both Core 1 (220-1201) and Core 2 (220-1202) to be certified [O]. A short Core 1 demo is therefore never the A+ certification.
Core 1 domains and weights: Mobile Devices 13 percent, Networking 23 percent, Hardware 25 percent, Virtualization and Cloud Computing 11 percent, Hardware and Network Troubleshooting 28 percent. Core 2: Operating Systems 28 percent, Security 28 percent, Software Troubleshooting 23 percent, Operational Procedures 21 percent [O]. The objectives document is version 3.0, copyright 2024 [O].
Three details in the objectives document matter to design:
* The troubleshooting methodology (identify, theory of probable cause, test, plan, verify, document) appears in the Core 1 document as a competency standard and is explicitly not a formal objective or tested [O]. A lesson that teaches it is good teaching and must not be labeled as exam content for A+.
* Core 2 treats Windows versions that are not past Mainstream Support, up to and including Windows 11, as intended content [O].
* Core 2 now has objectives on scripting basics, remote access technologies and basic concepts of artificial intelligence [O]. The AI objective is directly relevant to a tutor demo: a lesson on it needs original text, and the tutor must not make claims about AI that the lesson does not support.
4.2 CompTIA Network+ (N10-009)
The Network+ page gives a launch date of June 20, 2024, an estimated retirement of 2027, a maximum of 90 questions in 90 minutes, multiple-choice and performance-based, a passing score of 720 on a scale of 100 to 900, and a recommended experience of CompTIA A+ plus 9 to 12 months of hands-on work in a junior network administrator or network support role [O]. The objectives document is version 4.0 [O]. A successor exam has no announced launch date on CompTIA's page as of the retrieval; secondary sources say the vendor estimates retirement in 2027 [S]. For October 2026 study N10-009 is current.
Domains and weights: Networking Concepts 23 percent, Network Implementation 20 percent, Network Operations 19 percent, Network Security 14 percent, Network Troubleshooting 24 percent [O]. There are 25 numbered objectives: eight in domain 1, four in domain 2, five in domain 3, three in domain 4 and five in domain 5 [O]. Unlike A+, the troubleshooting methodology is itself objective 5.1 and is tested [O].
4.3 Nutanix NCA 7.5
The Exam Blueprint Guide dated June 15, 2026 says: 50 multiple-choice and multiple-response questions, $100, 90 minutes, passing score 3000 on a 1000 to 6000 scaled score, English and Japanese, remote proctored or in a test center, three attempts with a seven-day wait, certification valid three years [O]. It tests AOS 7.5, AHV 11.0 and Prism Central pc.7.5 [O]. It states the exam measures awareness of the purpose and use of Nutanix products and the ability to navigate the Prism UI, read information from it and perform basic operational tasks [O]. Intended audience: about 3 to 6 months of broad IT infrastructure experience and equivalent Nutanix experience; new IT employees, administrators, tier 1 support staff and STEM students [O]. The guide publishes no per-section weights; it says the number of questions per objective follows the criticality of the task [O].
It has four sections and 14 objectives: Section 1, Recognize Nutanix Solutions and Tools (1.1 to 1.3); Section 2, Describe Nutanix Platform Administration (2.1 to 2.4); Section 3, Describe Cluster Configuration and Maintenance (3.1 to 3.3); Section 4, Demonstrate and Understand Platform Health and Monitoring (4.1 to 4.4) [O]. The training section of the same guide still says the course covers the "NCA 6.10 exam" and the guide's file name and one search-result URL still contain 6.10, while the body says 7.5 [O]. That is a vendor inconsistency, not a reason to doubt the 7.5 target.
A Nutanix Community post of June 25, 2026 says NCA 7.5 appointments began July 28, 2026 and describes the audience as 6 to 12 months of IT experience plus 3 to 6 months of Nutanix [S]. The beta post said the beta ran through June 14, 2026 with a limited number of seats and a discount code [S]. These are why the repository's beta material is stale.
4.4 Implication for "beginner"
None of the three exams is designed for a person with zero experience. Each states a recommended experience level. The honest label for the tracks is "beginner preview": a learning entry point that shows the shape of each exam and teaches a first slice well, with visible incomplete coverage. The specification already says this. The disclaimer text in Section 8.2 makes it explicit on screen.
5. Content gaps by track
5.1 How the content sections are organized
Each track section lists every objective of the current official exam in the order the official document gives them, with a label of the form C1-2.4 (A+ Core 1, domain 2, fourth objective), C2-3.1, NET-5.3 or NCA-4.2. The labels are for traceability inside this document and in the proposed manifests. For A+ Core 1 and for Network+ the numbering follows the official documents; for A+ Core 2 I use document order inside each domain and the numbering may differ from CompTIA's printed numbers, so the manifests should carry the official number as a separate field once someone confirms it against the PDF.
For each objective the entry gives four things in running prose: what the objective asks a beginner to be able to do; what exists in the repository today (for A+ and Network+ the answer is nothing unless stated); the authoring work and the main way it goes wrong; and the simulator treatment. Roger's instruction that demo mode must work for all content means every objective needs one, so I use six reusable simulator engines rather than a bespoke simulator per objective. They are defined in Section 6.10 and summarised here:
* ST - state-checked task. A form-based configuration panel over a small JSON state; a checker reads the final state and the recorded steps.
* TE - scripted terminal. A command line with a fixed set of commands whose output comes from fixtures (ipconfig, ping, nslookup, tracert on Windows; ip, ping, dig, traceroute on Linux; and a small network-device CLI).
* DX - diagnostic scenario. A symptom panel, a list of tests the learner may run, a result for each test from fixtures, and a scored final diagnosis and fix.
* OP - ordered procedure. The learner puts steps in order or picks the next step; graded on order, using the ordered-answer scorer from PLAT-03.
* VI - visual identification. Original diagrams with hotspots: connectors, ports, cable ends, rack diagrams, topologies.
* SJ - branching judgment. A short scenario with decisions at each turn (communication, change management, policy); graded against a rubric of acceptable paths.
Item counts in each entry are my proposed allocation of the starter pack (60 items per A+ core, 100 for Network+, 40 for the NCA pilot) and add up to the specification's domain allocations. The label Demo marks the objective as part of the October 23 cut. "Reviewed" always means a named human checked the key, explanation, objective mapping and originality before the item is marked shipped, and recorded that in the item's provenance record (RGT-06).
A note on rights that applies to every entry below: the official objective documents are CompTIA's copyrighted work. Mapping an item to an objective by its number and short title is fine. Copying the bulleted example lists into lessons or question stems is not something I recommend; the lessons should teach the concept in original words and treat CompTIA's bullet lists as a coverage checklist.
5.2 Track A+: Core 1 (220-1201), 60 starter items
Track-level finding. There is no A+ content, no lesson, no question, no scenario and no manifest in the repository [V]. Every Core 1 objective is a complete authoring gap. The weight of the exam sits where the repository is weakest: hardware identification and physical troubleshooting (domains 3 and 5, 53 percent together) is mostly visual and procedural, while the existing simulator is a Nutanix management console. Core 1 therefore needs the VI, OP and DX engines more than the ST engine.
Domain 1: Mobile Devices (13 percent, 8 items)
C1-1.1 Monitor mobile device hardware and replace components (3 items). The objective covers laptop and mobile parts that can be replaced or monitored: battery, keyboard, memory, storage, wireless cards, privacy and security parts such as biometric readers, antennas, camera and microphone. A beginner needs to recognise a part, know what failure looks like and know the safe order of a replacement. Authoring risk: the replacement procedures vary by model, so items must be written at the level of principle (disconnect power and battery first, ground yourself, keep screws organised by location) and not as model-specific steps that become wrong. Simulator treatment: OP, a laptop-RAM replacement procedure where the learner orders six steps, and VI, a laptop interior diagram with hotspots for battery connector, M.2 slot, SODIMM slots and antenna leads. Tier: Core, not in the demo cut.
C1-1.2 Compare accessories and connectivity options (2 items). USB variants, Lightning, NFC, Bluetooth, tethering, styluses, headsets, docking stations and port replicators. The common beginner confusion is dock versus port replicator, and USB-C the connector versus USB the protocol. Authoring: one comparison lesson built around "what does the user want to connect, and what does the device offer". Items should be scenario items ("a user's laptop has one USB-C port and needs two monitors and Ethernet"), not definition recall. Simulator: VI, a port panel where the learner drags a cable end to the matching port and the checker validates compatibility. Tier: Core.
C1-1.3 Configure basic mobile network connectivity and application support (3 items). Cellular data, hotspot, Wi-Fi, SIM and eSIM, Bluetooth pairing steps, location services, device management profiles for corporate and personal devices, and synchronisation including data caps. Authoring risk: mobile operating system screens change with every release; keep steps conceptual and avoid screenshots of real vendor interfaces (RGT-07). Simulator: ST, a mock phone settings panel with a fixture state; task "pair a Bluetooth headset and verify" with a negative fixture where airplane mode is on. Tier: Core.
Domain 2: Networking (23 percent, 14 items)
This domain is the best fit for the October 23 theme and the best overlap with Network+; it is where shared lesson text can be written once and mapped twice, with different assessment depth (the specification's rule: the same question is never counted as independent evidence in both tracks).
C1-2.1 Compare TCP and UDP ports, protocols and purposes (2 items, Demo). The objective lists a set of well-known ports: file transfer, secure shell, telnet, mail protocols, DNS, DHCP, web, directory, directory over TLS, Windows file sharing and remote desktop, plus the difference between TCP and UDP. Beginners memorise; the better method is to attach each port to a job a help desk person does ("the user can browse by IP but not name: which service is it?"). Authoring: a single table lesson plus items that give a symptom and ask for the service or port. Risk: do not reuse the Network+ port list verbatim without checking it, since the two objective documents list different sets (Network+ adds TFTP, NTP, SNMP, syslog, SIP and SQL). Simulator: DX, a firewall-rule panel where the learner opens the right port for a described service and the checker rejects an over-broad rule. Tier: Demo.
C1-2.2 Explain wireless networking technologies (1 item). Frequency bands, channel widths and selection, Bluetooth, the 802.11 standards family, NFC and RFID. Authoring: keep to what a technician must choose or explain, such as why 2.4 GHz reaches further and 5 GHz is faster, and why channels 1, 6 and 11 matter on 2.4 GHz. Simulator: VI, a channel-map diagram where overlapping access points must be re-assigned; checker confirms no overlap. Tier: Core.
C1-2.3 Summarize services provided by networked hosts (2 items, Demo). Server roles such as DNS, DHCP, file, print, mail, logging, web, authentication, database and time; internet appliances such as spam gateways, UTM, load balancers and proxies; legacy and embedded systems; IoT devices. Authoring: one lesson on "who answers when a client asks" using a small office diagram; items ask which server or appliance explains a symptom. Simulator: VI, a network diagram with hotspots; learner clicks the device responsible for a stated problem. Tier: Demo.
C1-2.4 Explain common network configuration concepts (3 items, Demo). DNS record types (A, AAAA, CNAME, MX, TXT and the mail-authentication records SPF, DKIM and DMARC), DHCP leases, reservations, scope and exclusions, VLANs and VPNs. This is the anchor objective for the October 23 DNS lesson in the specification. Authoring: the lesson "The website works by IP address but not by name" explains name resolution and DHCP in about eight minutes, with three worked examples. Risk: mail-authentication records are easy to over-teach for a beginner; keep to what each record is for. Simulator: TE plus ST, the synthetic workstation task from the specification (wrong DNS server): the learner reads the ticket, runs ipconfig /all and nslookup against fixtures, changes the simulated DNS value, retests, and writes a one-line resolution. The checker validates the final value and the recorded diagnostic step. Negative fixtures: unchanged value, a wrong server address, and a changed gateway instead of DNS. Tier: Demo.
C1-2.5 Compare common networking hardware (1 item). Routers, managed and unmanaged switches, access points, patch panels, firewalls, Power over Ethernet and its standards, cable modem, DSL, optical network terminal, network interface cards and MAC addresses. Authoring: a "what plugs into what" diagram lesson. Simulator: VI, a rack diagram with a patch panel and switch where the learner traces a cable run. Tier: Core.
C1-2.6 Configure basic wired and wireless SOHO networks (2 items, Demo). IPv4 addressing, private versus public ranges, IPv6, APIPA, static versus dynamic, subnet mask and gateway. Authoring risk: this overlaps the NET-1.7 subnetting objective at a lower depth; A+ stops at "what each setting does and what a 169.254 address means". Simulator: ST, a SOHO router panel with DHCP scope, SSID and security fields; wrong-state fixtures include an overlapping DHCP scope and a missing gateway. Tier: Demo.
C1-2.7 Compare internet connection types, network types and characteristics (1 item). Satellite, fiber, cable, DSL, cellular, WISP; LAN, WAN, PAN, MAN, SAN and WLAN. Authoring: a short comparison with latency and availability trade-offs. Simulator: SJ, "recommend a connection for a rural clinic" with a rubric. Tier: Core.
C1-2.8 Explain networking tools and their purposes (2 items, Demo for 1). Crimper, cable stripper, Wi-Fi analyzer, toner probe, punchdown tool, cable tester, loopback plug, network tap. Authoring: the item should be "which tool for this job" with a short story. Simulator: VI plus OP, building a patch cable: choose the tools, order the steps (strip, arrange pairs per a wiring standard, trim, crimp, test). The checker grades the pair order against T568B. Tier: Demo (one item).
Domain 3: Hardware (25 percent, 15 items)
C1-3.1 Compare display components and attributes (1 item). Panel types, touch digitizer, inverter, pixel density, refresh rate, resolution, colour gamut. Simulator: VI, label a panel stack. Tier: Core.
C1-3.2 Summarize cable types and connectors (1 item). Network, peripheral, video and drive cables and connectors. This objective is almost entirely recognition. Simulator: VI, a connector wall where the learner matches ends to names. Original artwork is needed; photographs from vendor sites are off limits (RGT-07). Tier: Core.
C1-3.3 Compare RAM characteristics (2 items). Form factors, DDR generations, ECC versus non-ECC, channel configuration. Simulator: ST, a motherboard panel; the learner chooses compatible modules for a stated board and the checker rejects a DDR mismatch. Tier: Core.
C1-3.4 Compare storage devices (2 items). Hard drive speeds and sizes, solid-state interfaces and form factors, RAID levels 0, 1, 5, 6 and 10, removable media, optical drives. RAID is where beginners fail; the lesson must compute usable capacity and fault tolerance for each level with a small table. Simulator: ST, a RAID builder: pick drives and level, the checker computes capacity and tolerance and compares with the scenario requirement. Tier: Core.
C1-3.5 Install and configure motherboards, CPUs and add-on cards (3 items). Form factors, connector types, socket compatibility, UEFI settings (boot order, TPM, Secure Boot, passwords, fan and temperature), virtualization support, CPU architecture, expansion cards and cooling. Authoring: UEFI screens vary by vendor, so use an original generic UEFI model. Simulator: ST plus OP, a build-a-PC bench where parts are chosen for compatibility and installed in a safe order; a UEFI panel task "enable virtualization support". Tier: Core.
C1-3.6 Install the appropriate power supply (2 items). Input voltage range, output rails, the 20+4 connector, redundant and modular units, wattage, efficiency. Simulator: DX, size a supply for a described build with a headroom rule; the checker rejects an under-rated unit. Tier: Core.
C1-3.7 Deploy and configure multifunction devices and printers (2 items). Unboxing and placement, drivers and page description languages, firmware, connectivity, shared printing and print servers, configuration settings, authentication and secure print, scan-to-email and scan-to-share, document feeders. Simulator: ST, a printer admin panel; task "set duplex and add a scan-to-folder destination". Tier: Core.
C1-3.8 Perform printer maintenance (2 items). Laser, inkjet, thermal and impact printer routines. Simulator: OP, a laser-printer maintenance sequence, and VI, label the parts. Tier: Core.
Domain 4: Virtualization and Cloud Computing (11 percent, 7 items)
C1-4.1 Explain virtualization concepts (4 items). Purpose of virtual machines, requirements, desktop virtualization, containers, type 1 and type 2 hypervisors. This is the one domain where the existing Nutanix simulator genuinely helps. The specification proposes an illustrative "VM creation" in the PE console labeled "Nutanix example of a general concept". I agree and add a condition: the example is only acceptable after PLAT-01 and SIM-01 are closed, because today the console does not boot and its create-VM scenario validates only the VM name. Authoring: a lesson on host versus guest, with a resource-allocation diagram; items ask what happens when guests are over-allocated. Simulator: ST, a small neutral hypervisor panel (not the Nutanix UI) with host resources and a guest-allocation task, plus the labeled Nutanix example as a second activity. Tier: Core.
C1-4.2 Summarize cloud computing concepts (3 items). Private, public, hybrid and community models; infrastructure, software and platform service models; shared versus dedicated resources, metering, elasticity, availability, synchronisation, multitenancy. Simulator: SJ, "choose a model" scenarios with a rubric. Tier: Core.
Domain 5: Hardware and Network Troubleshooting (28 percent, 16 items)
This is the largest domain and the one the specification already prioritises. Because the official document says the troubleshooting methodology is not itself tested in A+, the lesson that teaches it is a teaching device. Items in this domain should test symptom recognition and the next best action.
C1-5.1 Troubleshoot motherboards, RAM, CPUs and power (4 items, Demo for 3). POST beeps, proprietary crash screens, blank screen, no power, sluggishness, overheating, burning smell, random shutdown, swollen capacitors, wrong date and time. Authoring: each symptom needs the first safe test, not just a cause; a burning smell means power off and unplug before anything else. Simulator: DX, a "dead desktop" scenario with tests (check outlet, swap power cable, reseat memory, listen for beeps) and fixture results; scored on order and safety. Tier: Demo (3 items).
C1-5.2 Troubleshoot drive and RAID issues (3 items). Status LEDs, grinding or clicking, boot device not found, data loss, array failure, SMART failure, slow reads and writes, missing drives and arrays, audible alarms. Simulator: DX, a degraded RAID 5 with an alarm. Tier: Core.
C1-5.3 Troubleshoot video, projector and display issues (2 items). Wrong input, cabling, bulb failure, fuzzy or distorted image, burn-in, dead pixels, flashing, colour, audio, dimness, intermittent shutdown, sizing. This is directly relevant to the demo room itself: the projector at the October 23 venue is a live example. Simulator: DX, a projector scenario. Tier: Core.
C1-5.4 Troubleshoot common mobile device issues (2 items). Battery health, swollen battery, screen damage, charging, connectivity, liquid damage, overheating, digitizer, ports, malware, touch calibration, install failures, stylus and performance. Safety note on swollen batteries must be explicit in the lesson. Simulator: DX. Tier: Core.
C1-5.5 Troubleshoot network issues (3 items, Demo for all 3). Intermittent wireless, slow speeds, limited connectivity, jitter, poor VoIP quality, port flapping, high latency, interference, authentication failures, intermittent internet. The core demo task. Simulator: DX plus TE, the "limited connectivity" ticket: a workstation shows a 169.254 address; the learner checks the cable, the DHCP lease and the server; the fixture fixes it when the right step is taken. Tier: Demo.
C1-5.6 Troubleshoot printer issues (2 items). Lines on pages, garbled print, jams, faded or speckled prints, feeding faults, queue problems, finishing faults, orientation, tray and connectivity faults. Simulator: DX with a print queue panel. Tier: Core.
Core 1 summary of gaps
Gap ID
	Description
	Severity
	Owner
	Closure
 
	CNT-A1-01
	27 objectives have no lesson text
	S2 for Demo objectives (S1 for C1-2.4 and C1-5.5 lesson), S3 others
	Author
	Section 5.2 entries; lesson per objective, 5 to 10 minutes each
	CNT-A1-02
	60 reviewed items, 16 Demo items, none exist
	S1 for the 16 Demo items
	Author, RedEye lane
	Provenance record, key balance, ordering and multi-select coverage
	CNT-A1-03
	No original diagrams for hardware
	S2
	Author
	Create original SVG set; no vendor photographs
	CNT-A1-04
	Hardware and printer objectives need VI, OP and DX engines that do not exist
	S2
	Builder
	Section 6.10 engines
	CNT-A1-05
	Core 1 alone is not the A+ certification
	S1 labeling
	Roger and builder
	Label every Core 1 surface "A+ Core 1 beginner preview"; disclaimer text RGT-04
	The Core 1 Demo cut adds up as follows: C1-2.1 (2), C1-2.3 (2), C1-2.4 (3), C1-2.6 (2), C1-2.8 (1), C1-5.1 (3) and C1-5.5 (3) give 16 items, matching the specification's 16 Core 1 networking and troubleshooting items.
5.3 Track A+: Core 2 (220-1202), 60 starter items
Track-level finding. As with Core 1, nothing exists in the repository [V]. Core 2 differs in two ways that matter to the build. First, much of it is about Windows, and the specification's simulator is a management console for a different product, so Windows administration tasks (Settings, Control Panel, Task Manager, Event Viewer, Group Policy, command line) each need an original mock, which is a large authoring job and a rights question (RGT-07: do not copy Microsoft interface screenshots or icons; draw generic equivalents and label them "simulated"). Second, it contains the only objective in the three tracks about artificial intelligence, which a tutor demo will invite questions on.
Domain 1: Operating Systems (28 percent, 17 items)
C2-1.1 Explain common operating system types and purposes (2 items). Workstation and mobile operating systems, filesystem types, vendor life-cycle limits such as end of life, and compatibility concerns. Authoring: a table lesson with a "which one fits this device or job" frame. Simulator: SJ, choosing an operating system and filesystem for a described device. Tier: Core.
C2-1.2 Perform OS installations and upgrades (2 items). Boot methods, clean install versus upgrade versus image or zero-touch deployment, partitioning schemes, format, upgrade considerations such as backups and driver support. Simulator: OP, an install sequence with a partitioning decision. The learner must back up before an upgrade; the checker rejects a path that skips it. Tier: Core.
C2-1.3 Compare Windows editions (1 item). Home, Pro, Pro for Workstations, Enterprise, N versions, domain versus workgroup membership and feature differences. Authoring risk: edition feature tables are time-sensitive and Microsoft changes them; each fact needs a source and a review date in the provenance record, and the lesson states the date. Simulator: SJ, "which edition does this office need". Tier: Core.
C2-1.4 Use Windows operating system features and tools (2 items). Task Manager, Event Viewer, Disk Management, Device Manager, services, system configuration and similar tools. Simulator: ST, mock management consoles with fixture state; task "find which service is stopped and start it" with a negative fixture for stopping the wrong service. Tier: Core.
C2-1.5 Use Microsoft command-line tools (2 items). Network, disk, file, policy and system commands. This is the first objective where the TE engine is the natural fit. Simulator: TE, a Windows command-prompt fixture covering the objective's commands, with a strict allowlist; any command not in the allowlist returns a generic "not recognised in this simulation" message. Tier: Core.
C2-1.6 Configure Windows settings (2 items). Control Panel and Settings areas, accounts, time and language, devices, privacy, updates, power and system settings. Simulator: ST, a mock settings app. Tier: Core.
C2-1.7 Configure Windows networking features on a client (1 item). Domain versus workgroup, VPN, wireless, wired, WWAN, proxy, public versus private profiles, file explorer network paths, metered connections. Simulator: ST, a mock network settings panel with a proxy field; task "fix the proxy" shares fixtures with the A+ Core 1 DNS task. Tier: Core.
C2-1.8 Explain macOS desktop features and tools (1 item). Installing and removing applications, system folders, Apple ID and corporate restrictions, best practices, settings areas, features such as Keychain and Spotlight, Disk Utility, FileVault, Terminal, Force Quit. Authoring risk: macOS names change; confirm against the current release before review. Simulator: VI, a labeled desktop. Tier: Core.
C2-1.9 Identify Linux client features and tools (2 items). File commands, filesystem tools, privilege escalation, package managers, network commands, informational commands, an editor, configuration files, systemd, kernel, boot loader and the root account. Simulator: TE, a Linux shell fixture with a small virtual filesystem; negative fixtures include rm in the wrong directory and chmod 777. Tier: Core.
C2-1.10 Install applications according to requirements (1 item). System requirements (bitness, graphics, memory, processor, storage), distribution methods, impact on device, network and business. Simulator: DX, "will this application run on this machine" with a fixture spec sheet. Tier: Core.
C2-1.11 Install and configure cloud-based productivity tools (1 item). Email, storage and sync, collaboration tools, identity synchronisation, licensing. Simulator: ST, a mock admin console where the learner assigns a license to a user and checks the sync state. Tier: Core.
Domain 2: Security (28 percent, 17 items)
The Core 2 Demo cut draws on this domain for social engineering, malware procedure and Windows security settings, because they combine well with a ticket.
C2-2.1 Summarize security measures and purposes (2 items). Physical security controls, physical access methods, logical security such as least privilege, zero trust, access control lists, multi-factor authentication types, single sign-on, privileged access management, mobile device management, data loss prevention, directory services. Authoring: the breadth is large and a beginner needs one organising idea: what is protected, from whom, by which layer. Simulator: SJ, "choose controls for a small clinic" with a rubric. Tier: Core.
C2-2.2 Configure basic Windows security settings (2 items, Demo). Defender antivirus, firewall, user and group types, sign-in options, NTFS versus share permissions and inheritance, running as administrator, User Account Control, BitLocker, encrypting file system, joining a domain and applying policies. Simulator: ST, a permissions panel: grant a user read access to a folder without making them an administrator. The checker validates effective permissions; negative fixtures include adding the user to Administrators. Tier: Demo.
C2-2.3 Compare wireless security protocols and authentication methods (1 item). WPA2, WPA3, TKIP and AES, RADIUS, TACACS+, Kerberos, multi-factor. Simulator: ST, a wireless settings panel; the checker rejects an open or TKIP-only configuration. Tier: Core.
C2-2.4 Summarize malware types and detection, removal and prevention tools (2 items). Types from viruses to fileless malware, adware, potentially unwanted programs, and tools such as EDR, MDR, XDR, antivirus, email gateways, firewalls, user education. Simulator: DX, a symptom panel mapped to a malware type. Tier: Core.
C2-2.5 Compare social engineering attacks, threats and vulnerabilities (2 items, Demo). Phishing variants, shoulder surfing, tailgating, impersonation, dumpster diving, denial of service, evil twin, zero-day, spoofing, on-path, brute force, insider threats, injection, business email compromise, supply chain attacks, and vulnerability types. Simulator: SJ, a mailbox triage: five synthetic messages, the learner marks which are suspicious and what to do. All sender names and links are invented and non-routable; no real brand marks. Tier: Demo.
C2-2.6 Implement basic SOHO malware removal (2 items, Demo). The official document gives a ten-step ordered procedure. This is the clearest ordered-answer case in A+. Authoring: items test the order and the reason (quarantine before remediation; disable restore points before scanning; re-enable after). Simulator: OP, ordering the steps, graded by the ordered scorer. Until PLAT-03 is closed this objective cannot be scored correctly. Tier: Demo.
C2-2.7 Apply workstation security options and hardening (2 items). Encryption at rest, password rules, firmware passwords, user best practices, account management, changing defaults, disabling AutoRun and unused services. Simulator: ST, a local security policy panel. Tier: Core.
C2-2.8 Secure mobile devices (1 item). Encryption, screen locks, configuration profiles, patching, endpoint security, locator apps, remote wipe, backup, lockout, MDM and BYOD policy. Simulator: ST, a mock MDM console: apply a profile to a lost device and trigger a wipe on the right one. Tier: Core.
C2-2.9 Compare data destruction and disposal methods (1 item). Physical destruction, wiping and formatting, outsourcing with a certificate of destruction, regulatory and environmental requirements. Simulator: SJ. Tier: Core.
C2-2.10 Apply security settings on SOHO networks (1 item). Router passwords, filtering, firmware, placement, UPnP, screened subnet, secure management, SSID settings, guest access, firewall rules, port forwarding. Simulator: ST, the SOHO router panel from C1-2.6, extended with security fields. Tier: Core.
C2-2.11 Configure browser security settings (1 item). Trusted downloads and hashes, patching, extensions, password managers, certificates, pop-ups, clearing data, private mode, sync, proxy, secure DNS. Simulator: ST, a mock browser settings panel. Tier: Core.
Domain 3: Software Troubleshooting (23 percent, 14 items)
C2-3.1 Troubleshoot common Windows issues (5 items). Blue screens, slow performance, boot failures, frequent shutdowns, services that will not start, crashing applications, low memory warnings, instability, no OS found, slow profile loads, time drift. Simulator: DX, one scenario per symptom family with fixtures for each test; wrong first moves (reinstalling Windows for a time drift) cost points. Tier: Core.
C2-3.2 Troubleshoot mobile OS and application issues (3 items). Apps that fail to launch, close, update or install, slow response, OS update failures, battery life, random reboots, connectivity, auto-rotate. Simulator: DX. Tier: Core.
C2-3.3 Troubleshoot mobile security issues (3 items). Unofficial app stores, developer mode, jailbreak or root, malicious apps, spoofing, high network traffic, data limit alerts, ads, fake warnings, leaked data. Simulator: DX. Tier: Core.
C2-3.4 Troubleshoot PC security issues (3 items). Network access loss, desktop alerts, false antivirus alerts, altered files, notifications, update failures, browser symptoms such as pop-ups, certificate warnings and redirection. Simulator: DX, combined with the malware procedure OP in C2-2.6 so the learner moves from symptom to removal order. Tier: Core.
Domain 4: Operational Procedures (21 percent, 12 items)
C2-4.1 Documentation and support systems information management (2 items, Demo). Ticketing fields, escalation levels, written communication, asset management, document types such as incident reports, SOPs, onboarding and off-boarding checklists, SLAs, knowledge base articles. This is the second anchor for the October 23 ticket task. Simulator: ST, a ticket form: the learner reads a synthetic report, fills user, device, description, category and severity fields and writes a resolution note. The checker validates the fields, a severity that fits the stated impact, and a resolution note that names the test and the fix. Tier: Demo.
C2-4.2 Change management (1 item). Documented processes, rollback and backup plans, sandbox testing, request forms, purpose and scope, change type, schedule, freeze windows, approvals, risk analysis. Simulator: SJ. Tier: Core.
C2-4.3 Backup and recovery (1 item). Backup types, schedules, the 3-2-1 idea, recovery testing. Simulator: OP, restore ordering. Tier: Core.
C2-4.4 Common safety procedures (1 item). Electrostatic discharge, equipment grounding, personal safety, lifting, fire. Simulator: SJ. Tier: Core.
C2-4.5 Environmental impact and controls (1 item). Material safety data, disposal, power and temperature controls. Simulator: SJ. Tier: Core.
C2-4.6 Prohibited content and privacy, licensing and policy concepts (1 item). Incident response basics, licensing, personal data handling, acceptable use. Simulator: SJ. Tier: Core.
C2-4.7 Communication and professionalism (2 items). Listening, clarity, expectations, culture, dealing with difficult customers, confidentiality. Simulator: SJ, a customer-call script with branching replies; the rubric rewards setting expectations and avoiding blame. Tier: Core.
C2-4.8 Basics of scripting (1 item). Script file types, simple constructs, environment variables, comments, basic loops and conditions, and the risks of running unknown scripts. Simulator: TE, run a provided script in a fixture shell and read its output. Tier: Core.
C2-4.9 Remote access technologies (1 item). Remote desktop, secure shell, VPN, remote monitoring, screen sharing, security considerations. Simulator: ST, a remote-session panel with a policy check. Tier: Core.
C2-4.10 Basic artificial intelligence concepts (1 item). The objective asks for the basics, including limits and risks such as made-up answers and data privacy. Authoring: this is the objective where the demo tutor and the lesson content must agree. If the demo says "ask the tutor", the same lesson should say what the tutor cannot do. Simulator: SJ, "decide what information may be pasted into a public AI tool". Tier: Core.
Core 2 summary of gaps
Gap ID
	Description
	Severity
	Owner
	Closure
 
	CNT-A2-01
	36 objectives have no lesson text
	S1 for C2-4.1 lesson, S2 for other Demo objectives, S3 others
	Author
	Section 5.3 entries
	CNT-A2-02
	60 reviewed items, 8 Demo items, none exist
	S1 for the 8 Demo items
	Author, RedEye lane
	Provenance record, ordered and multi-select coverage
	CNT-A2-03
	Windows, macOS and Linux screens need original mock-ups
	S2
	Builder
	Generic simulated interface kit, labeled "simulated"; no vendor screenshots or icons
	CNT-A2-04
	Edition, interface and macOS facts change with releases
	S3
	RedEye lane
	Review date in each provenance record
	CNT-A2-05
	Ordered procedure items (malware removal and others) cannot be scored correctly today
	S1
	Builder
	PLAT-03
	The Core 2 Demo cut adds up as follows: C2-2.2 (2), C2-2.5 (2), C2-2.6 (2) and C2-4.1 (2) give 8 items, matching the specification's 8 Core 2 ticketing and security items.
5.4 Cross-track note on A+: what the two cores share with Network+
The Core 1 networking domain (23 percent) and Network+ share vocabulary: IP addressing, DHCP, DNS, VLANs, wireless, cabling, troubleshooting symptoms. The efficient build is one lesson text per concept with two mappings and two assessment depths. The tests that guard against double counting are simple: each item has one exam field and one objective field, and the catalog test fails if two items with the same stem hash appear under different exams. This is specified in PLAT-14 as a duplicate-stem lint across all packs, which also catches the case of an author reusing an item between the two tracks.
5.5 Track Network+ (N10-009), 100 starter items
Track-level finding. No Network+ content exists in the repository [V]. The Nutanix packs contain a few networking items (the words VLAN and subnet each appear in about five lines of the NCA bank [V]; the Nutanix material is about the hypervisor platform) but they are written for a hypervisor platform and are not Network+ material. Network+ is the October 23 headline track, so its Demo cut gets the most careful treatment: 25 items, five per domain, one concepts lesson and one troubleshooting lesson, and the gateway task.
The exam is about 25 objectives, and most of them are about configuration and diagnosis on devices the repository does not simulate: routers, switches, access points and firewalls. The specification's decision, a compact topology and configuration panel and not a router emulator, is right for October 23. This document keeps that decision and adds what Roger's all-content requirement needs: a small network-device CLI fixture in the TE engine and a topology panel in the ST engine that can be reused by most objectives below.
Domain 1: Networking Concepts (23 percent, 23 items)
NET-1.1 Explain concepts related to the OSI reference model (3 items, Demo for 1). Seven layers and what happens at each. Authoring: the failure mode is pure memorisation of the mnemonic; items should ask "at which layer does this symptom or device operate" using a described fault (a duplicate IP address is a layer 3 problem that shows as layer 2 confusion). The lesson should also state that the OSI model is a reference for talking about problems, which connects to the top-down and bottom-up approach in NET-5.1. Simulator: OP plus VI, stack the layers and place devices and protocols on them; the checker grades placement. Tier: Demo (one item).
NET-1.2 Compare networking appliances, applications and functions (3 items). Physical and virtual routers, switches, firewalls, intrusion detection and prevention, load balancers, proxies, network storage, wireless access points and controllers, content delivery networks, VPNs, quality of service and time to live. Authoring: a "what would you buy or configure for this requirement" lesson. Simulator: VI, a topology where the learner places appliances to meet a stated need and the checker validates placement (firewall at the edge, load balancer in front of servers). Tier: Core.
NET-1.3 Summarize cloud concepts and connectivity options (2 items). Network function virtualization, virtual private clouds, security groups and lists, internet and NAT gateways, VPN and dedicated connections, deployment and service models, scalability, elasticity, multitenancy. Overlap: the A+ cloud objective C1-4.2 covers models; Network+ adds network constructs. Simulator: ST, a cloud network panel: attach an internet gateway and a route to a subnet; wrong fixture is a missing route. Tier: Core.
NET-1.4 Explain common ports, protocols, services and traffic types (4 items, Demo for 2). The port table in the official document is longer than the A+ one (it adds secure file transfer, TFTP, NTP, SNMP, syslog, mail over TLS, secure directory, SQL Server, SIP) and adds IP protocol types (ICMP, TCP, UDP, GRE, IPsec AH and ESP and IKE) and traffic types (unicast, multicast, anycast, broadcast). Authoring: use paired items so the learner sees the same service in a symptom story; do not publish a port table as a stand-alone quiz. Simulator: DX plus ST, firewall rules for a described service with negative fixtures for over-permissive rules. Tier: Demo (two items).
NET-1.5 Compare transmission media and transceivers (2 items). Wireless standards, cellular, satellite, wired standards, fiber types, direct-attach cable, coaxial cable, speeds, plenum versus non-plenum, transceiver protocols and form factors, connector types. Simulator: VI, match connector and transceiver to link. Tier: Core.
NET-1.6 Compare topologies, architectures and types (2 items). Mesh, hybrid, star, spine and leaf, point to point, three-tier hierarchical model, collapsed core, north-south and east-west traffic. Simulator: VI, rebuild a topology from a description and name it. Tier: Core.
NET-1.7 Use appropriate IPv4 network addressing (5 items, Demo for 2). Public versus private, link-local, RFC 1918, loopback, subnetting with variable-length masks and CIDR, and address classes. This is the hardest beginner objective in the exam and the one where a tutor can add the most value, and also the one where a wrong tutor answer does the most damage. Authoring: the lesson must teach binary-free subnetting first (block sizes and the "magic number"), then binary. Items must have the arithmetic worked in the explanation and checked by a script, not by the author's head; the item pipeline should compute the expected answer in code and compare it with the key (PLAT-08 rule R9). Simulator: ST, an addressing panel: given a /26 and a host count, assign addresses to four hosts and a gateway; the checker computes whether all addresses are valid host addresses in the same subnet and that none is the network or broadcast address. Tier: Demo (two items).
NET-1.8 Summarize evolving use cases for modern network environments (2 items). Software-defined networking and SD-WAN, VXLAN, zero trust, secure access service edge, infrastructure as code and version control, IPv6 addressing and coexistence. Authoring: this objective changes fastest; every claim needs a review date. Simulator: SJ, "choose an approach for a branch rollout" with a rubric. Tier: Core.
Domain 2: Network Implementation (20 percent, 20 items)
NET-2.1 Explain routing technologies (5 items, Demo for 1). Static and dynamic routing, the common routing protocols, route selection by prefix length, administrative distance and metric, address translation and port address translation, first-hop redundancy, virtual IP, subinterfaces. Authoring: at beginner level the lesson is "how a router picks a route" with three worked routing tables. Simulator: TE, a router CLI fixture (show ip route, ping) and ST, add a static route; negative fixtures include a wrong next hop and a longer prefix that overrides the intended route. Tier: Demo (one item).
NET-2.2 Configure switching technologies and features (7 items, Demo for 2). VLAN database and switched virtual interfaces, native and voice VLANs, tagging, link aggregation, speed and duplex, spanning tree, MTU and jumbo frames. This is the largest single objective allocation in my plan because it is the best fit for the Nutanix assets: the PE and PC network screens already show VLAN IDs on subnets and VM network interfaces, but the specification correctly says to check exactly what mutations those screens support before using them. Simulator: ST, the VLAN task from the specification (separate a guest network): create VLAN 20, assign two ports, verify that a host in VLAN 20 cannot reach VLAN 10 without a router. Negative fixtures: port left in VLAN 1, access port set to trunk. Tier: Demo (two items).
NET-2.3 Select and configure wireless devices and technologies (5 items, Demo for 1). Channels and widths, non-overlapping channels, regulatory impacts, frequency options and band steering, SSIDs, network types, encryption, guest networks and captive portals, authentication, antennas, autonomous and lightweight access points. Simulator: ST plus VI, the channel plan from C1-2.2 plus a security panel. Tier: Demo (one item).
NET-2.4 Explain physical installation factors (3 items, Demo for 1). Distribution frames, rack sizes, airflow direction, cabling and panels, lockable enclosures, power with UPS and PDU, load and voltage, humidity, fire suppression, temperature. Simulator: VI plus OP, a rack-planning exercise with airflow and power-budget checks. Tier: Demo (one item).
Domain 3: Network Operations (19 percent, 19 items)
NET-3.1 Explain organizational processes and procedures (4 items). Documentation (physical and logical diagrams, rack diagrams, cable maps, layered network diagrams, asset inventory, IP address management, service-level agreements, wireless surveys), life-cycle management (end of life and support, patching, decommissioning), change management, configuration management with production, backup and golden configurations. Overlap with C2-4.1 and C2-4.2. Simulator: SJ, a change request scenario. Tier: Core.
NET-3.2 Use network monitoring technologies (4 items, Demo for 1). SNMP traps and versions, flow data, packet capture, baseline metrics, log aggregation, SIEM, API integration, port mirroring, discovery, traffic analysis, performance, availability and configuration monitoring. The specification's example pair is monitoring plus a latency chart. Simulator: DX, a monitoring dashboard with a latency graph and a log panel; the learner picks the first test and the checker scores against the fixture's real cause (a saturated uplink). Tier: Demo (one item).
NET-3.3 Explain disaster recovery concepts (3 items). Recovery point and time objectives, mean time to repair and between failures, cold, warm and hot sites, active-active and active-passive high availability, tabletop and validation testing. Simulator: SJ, "choose a recovery approach for a store with a 4-hour tolerance". Tier: Core.
NET-3.4 Implement IPv4 and IPv6 network services (5 items, Demo for 3). Dynamic addressing with DHCP (reservations, scope, lease time, options, relay and exclusions), stateless address autoconfiguration, name resolution with DNS (security extensions, encrypted transports, record types, zone types, recursion), the hosts file, time protocols. This is the Network+ anchor for the October 23 DNS and DHCP content and overlaps C1-2.4. Simulator: TE plus ST, the same synthetic workstation and ticket renderer as in A+, with a different task: a failed client that does not get a lease because the scope is exhausted; the learner reads the ticket, checks the lease state, finds the pool exhausted, adds an exclusion fix or enlarges the scope, and verifies. Negative fixtures: changing the client to a static address (works for the client but fails the stated goal). Tier: Demo (three items).
NET-3.5 Compare network access and management methods (3 items, Demo for 1). Site-to-site and client-to-site VPNs, split versus full tunnel, connection methods (secure shell, GUI, API, console), jump hosts, in-band versus out-of-band management. Simulator: SJ and ST. Tier: Demo (one item).
Domain 4: Network Security (14 percent, 14 items)
NET-4.1 Explain basic network security concepts (6 items, Demo for 2). Encryption in transit and at rest, certificates and PKI, identity and access management concepts, authentication and authorization, least privilege, role-based access control, geofencing, physical security, deception technologies, risk vocabulary and the CIA triad, audits and regulatory frameworks, segmentation of IoT, guest and BYOD devices. Simulator: ST, a segmentation panel: place the guest and IoT devices in separate zones and apply a deny rule from guest to internal; the checker validates reachability both ways. This matches the specification's "segmentation plus a deny/allow rule". Tier: Demo (two items).
NET-4.2 Summarize attacks and their impact on the network (4 items, Demo for 1). Denial of service, VLAN hopping, MAC flooding, ARP and DNS poisoning and spoofing, rogue DHCP servers and access points, evil twin, on-path attacks, social engineering, malware. Simulator: DX, symptom to attack mapping with a log panel. Tier: Demo (one item).
NET-4.3 Apply network security features, defense techniques and solutions (4 items, Demo for 2). Device hardening, network access control with port security and 802.1X and MAC filtering, key management, access control lists and URL and content filtering, trusted and untrusted zones and screened subnets. Simulator: ST, an ACL builder with ordered rules; the checker evaluates traffic against the rule list, which exercises order-sensitive logic. Tier: Demo (two items).
Domain 5: Network Troubleshooting (24 percent, 24 items)
NET-5.1 Explain the troubleshooting methodology (3 items, Demo for 1). Identify the problem, theory of probable cause (question the obvious, consider top-to-bottom and bottom-to-top approaches and divide and conquer), test the theory, plan and note effects, implement or escalate, verify full functionality and prevent recurrence, document throughout [O]. Unlike A+, this method is a tested objective. Authoring: items are ordered-step and "what is the next step" items, so they need PLAT-03 and a scenario where the same fault is reached by a wrong approach (skipping verification) and a right one. Simulator: OP plus DX. Tier: Demo (one item).
NET-5.2 Troubleshoot common cabling and physical interface issues (4 items). Cable type and category mistakes, signal degradation (crosstalk, interference, attenuation), improper termination, transposed transmit and receive pairs, interface counters (CRC errors, runts, giants, drops), port status (error-disabled, administratively down, suspended), power over Ethernet budgets, transceiver mismatches. Simulator: TE, a switch CLI fixture with show interface counters; the learner reads a rising CRC count and picks the cable. Tier: Core.
NET-5.3 Troubleshoot common issues with network services (7 items, Demo for 2). Switching issues (spanning tree loops, root bridge selection, port roles and states, wrong VLAN assignment, access lists), route selection (routing table, default routes), address pool exhaustion, incorrect default gateway, incorrect IP address, duplicate address, incorrect subnet mask. This objective carries the specification's gateway task: a host can reach its own subnet but nothing outside it; the learner identifies the wrong default gateway, corrects it and verifies connectivity. Simulator: DX plus TE plus ST. The state checker confirms the correct gateway, an appropriate test (ping the gateway, then a remote address) and a completed verification step. A clean reset restores the fixture for the next group. Negative fixtures: changing the subnet mask instead; pointing the gateway at the DNS server; skipping the verification. Tier: Demo (two items).
NET-5.4 Troubleshoot common performance issues (4 items). Congestion, contention, bottlenecks, bandwidth and throughput, latency, packet loss, jitter, wireless interference and channel overlap. Simulator: DX, a graph-driven scenario where the learner reads utilisation and picks the bottleneck. Tier: Core.
NET-5.5 Use the appropriate tool or protocol to solve networking issues (6 items, Demo for 1). The tools (packet capture, ping, traceroute, DNS lookup, interface and address commands, port scanners, wireless analyzers, cable testers) and protocols used for discovery and monitoring. Authoring: the item style is "which tool answers this question". Simulator: TE, a Windows and Linux command fixture where output is deterministic; the checker verifies the learner chose a tool whose output can answer the question. Tier: Demo (one item).
The Demo cut adds up to five per domain: domain 1 (1 + 2 + 2), domain 2 (1 + 2 + 1 + 1), domain 3 (1 + 3 + 1), domain 4 (2 + 1 + 2) and domain 5 (1 + 2 + 1 + 1 extra from 5.2 or 5.4 if the reviewer wants a physical-layer item instead of a second 5.3 item). The exact five are a review-lane decision; the allocation constraint is five per domain, labeled exploratory coverage and not an exam-weighted test.
Network+ summary of gaps
Gap ID
	Description
	Severity
	Owner
	Closure
 
	CNT-NET-01
	25 objectives have no lesson text; two Demo lessons required (IPv4 addressing, gateway and DHCP/DNS; troubleshooting method and gateway fault)
	S1
	Author
	Section 5.5 entries
	CNT-NET-02
	100 reviewed items, 25 Demo items, none exist
	S1 for the 25
	Author, RedEye lane
	Provenance record; arithmetic items computed by script
	CNT-NET-03
	Network-device CLI and topology panel do not exist
	S1 for gateway and DHCP tasks
	Builder
	TE and ST engines, Section 6.10
	CNT-NET-04
	Subnetting items carry arithmetic risk
	S2
	RedEye lane and builder
	Computed-key check, PLAT-08 rule R9
	CNT-NET-05
	Network+ is recommended after A+ and 9 to 12 months of experience; the track is labeled a beginner preview
	S1 labeling
	Roger and builder
	Disclaimer RGT-04; coverage map shows incomplete objectives
	CNT-NET-06
	Reuse of Nutanix network screens for a VLAN and VM NIC lab is untested
	S3
	Builder
	Inventory the mutations those screens support before adopting
	5.6 Track NCA-75: gaps against the current official guide
Track-level finding. This is the only track with existing content, and the content is the wrong version. The repository has 140 NCA questions in three files, titled "NCA 7.5 Beta Practice Questions", a 140-question distribution of 40 + 40 + 60 [V]. The files are organised under the beta's four domains: Lifecycle Management (10 questions, labelled about 20 percent), Basic Administration (30, about 30 percent), Environmental Health (20, about 25 percent) and Cluster Configuration (20, about 25 percent); the gap-fill file adds four sections: what is new in 7.5 (15), sequence and ordering (5), gap fill (15) and advanced scenarios (25) [V]. The domain labels carry percentages that the current official guide does not publish [O].
The official structure is different (Section 4.3). This changes the nature of the work: it is a remapping and review job on 140 existing questions, a replacement and authoring job for objectives the bank does not cover, and a correction job for statements the bank or cheatsheet make that the vendor does not support.
Coverage method and its limit. I counted how many of the 140 questions mention terms tied to each official objective (case-insensitive substring match on the question text and explanation) [V]. The counts below are a lexical screen. A hit shows a term appears; it does not show the question tests the objective at the right depth. Absence of a hit is stronger evidence: if no question mentions "Foundation", the objective on Foundation is not covered. The counts are meant to direct reviewer attention, not to replace the item-by-item inventory the specification already calls for (NCA-02 below).
Official objective
	Questions with at least one matching term
	Notable terms with zero hits
 
	1.1 NCI components, hypervisors, deployment scenarios
	34
	Foundation (0 lines)
	1.2 Solutions: unified storage, database, cloud management, Kubernetes, enterprise AI, end-user computing
	30
	Enterprise AI, EUC, End User (0 lines each)
	1.3 Tools: Move, NGT, Foundation, Witness, Self-Service Restore, X-Ray, Collector
	18
	Foundation, X-Ray, Collector
	2.1 VM tasks
	32
	not screened
	2.2 Virtual networking
	11
	vSwitch, virtual switch, Network Visualizer (0 lines each)
	2.3 Storage operations
	32
	not screened
	2.4 Licensing
	7
	thin, not screened for zero terms
	3.1 Valid cluster options
	50
	SMTP
	3.2 Hardware maintenance
	24
	IPMI, out-of-band, expansion, add node (0 lines each)
	3.3 Software maintenance
	15
	compatibility matrix (0 lines)
	4.1 Health check
	12
	log collection appears in 1 line
	4.2 Alerts and events
	15
	custom alert appears in 2 lines
	4.3 Support functions
	8
	thin, not screened for zero terms
	4.4 Workload performance
	13
	oversubscription, steal (0 lines each)
	The shape of the result is clear. The bank is deep on storage concepts and Prism Central, moderate on lifecycle and VM tasks, and thin or absent where the current guide has new emphasis: tools such as Foundation, X-Ray and Collector; enterprise AI and end-user computing among the non-infrastructure solutions; virtual switches and the network visualizer; out-of-band management; licensing operations; support case workflow; and performance interpretation such as CPU ready and oversubscription.
5.6.1 Objective-by-objective gaps (14 objectives, 40-item pilot)
The titles below are quoted from the official blueprint guide fetched on October 10, 2026 [O]. The guide lists 14 objectives in four sections and publishes no per-objective weights [O]. The pilot therefore allocates by reviewer judgment (marked [P]): ten items per section, spread as 4/3/3, 3/3/2/2, 4/3/3 and 3/3/2/2. The allocation is a planning device, not a claim about the exam.
NCA-1.1 Recognize Nutanix solutions, use cases and features of Nutanix Cloud Infrastructure (NCI) (4 items). The bank has 34 lexical hits and the strongest coverage of any area, mostly Prism, AOS storage and cluster concepts [V]. Gaps: the bank was written to the beta objective titles, so each item needs a re-tag to 1.1 or to another objective; deployment scenarios named in the guide (small sites and hardware variants) have no hits for Foundation. Fix: re-tag, then write the missing items (review-lane decision which). Simulator: VI, identify the component in a described deployment. Demo: not in the October 25-28 cut.
NCA-1.2 Recognize solutions and use cases of the products outside NCI (as titled in the guide) (3 items). The guide's own title for this objective reads as a repeat of 1.1 with "non-" inserted [O]; the content list beneath it covers the other Nutanix solutions. Because the title and the listed content differ in apparent intent, the author should work from the content list and record the discrepancy in the provenance record, and the item stems must not quote the title. The bank has 30 lexical hits, but no hits for Enterprise AI, EUC or End User [V]. The existing bank is strong on Files and Objects (the NCP-US material); those items belong here only at recognition depth. Fix: write new items for the missing solutions, then retire or re-tag the deeper NCP-level items so a beginner pilot does not test them.
NCA-1.3 Recognize the use cases and features of Nutanix tools (3 items). Hits: 18. Zero hits for Foundation, X-Ray and Collector [V]. The guide lists tools by name, so a tool with no item is an uncovered objective item. Fix: one recognition item per tool at minimum; Move and Nutanix Guest Tools are partly covered. The cheatsheet numbers for NGT limits are unverified (see 5.6.3).
NCA-2.1 Describe VM tasks (3 items). Hits: 32, with some of the strongest simulator support because the PE VM screens exist [V]. Gap: the existing items and scenarios target administrator depth (for example storage policies) that a 50-question associate exam may not test. Fix: tag, then check each against the guide's content list. Simulator: the existing VM scenarios, once SIM-01 to SIM-03 fixtures are repaired (Section 6.10).
NCA-2.2 Identify virtual networking tasks (3 items). Hits: 11, with zero for vSwitch, virtual switch and Network Visualizer [V]. This is the thinnest part of the platform section. Fix: author new items; confirm the exact task list against the guide in the review. Simulator: TE or ST, a subnet creation task in the existing network screens, after inventorying which mutations those screens support (CNT-NET-06 uses the same inventory).
NCA-2.3 Discuss storage operations (2 items). Hits: 32. Overlap with the deep NCP-US bank is large and mostly beyond associate depth. Fix: select two recognition items; leave the rest in their NCP tracks.
NCA-2.4 Describe licensing tasks (2 items). Hits: 7. The beta bank's own domain title ("Configure licensing tiers" style) is a pointer to the previous exam's emphasis; the official objective is "describe licensing tasks". Items that ask the learner to configure tiers need re-writing as descriptions of tasks. Licensing facts change with vendor packaging, so each needs a dated source (Section 7, RGT-06).
NCA-3.1 Describe valid cluster options (4 items). Hits: 50, the highest. Zero for SMTP, which the official content list includes [V]. The topic area is probably over-covered relative to the others; select, do not add, except SMTP.
NCA-3.2 Identify hardware maintenance tasks (3 items). Hits: 24; zero for IPMI, out-of-band, expansion and add node [V]. Fix: author.
NCA-3.3 Identify software maintenance tasks (3 items). Hits: 15; zero for compatibility matrix [V]. The beta bank has a "lifecycle management" section whose question 3 in the gap-fill file asserts an upgrade order; see 5.6.3 for why that claim is not safe as a scored key. Fix: author and re-review.
NCA-4.1 Perform and interpret a health check (3 items). Hits: 12. Log collection appears in one line [V]. Fix: author.
NCA-4.2 Review and interpret alerts and events (3 items). Hits: 15; custom alert appears in two lines [V]. Fix: tag and select; author where thin.
NCA-4.3 Leverage support functions (2 items). Hits: 8. Thin. Fix: author.
NCA-4.4 Review and interpret workload performance (2 items). Hits: 13; zero for oversubscription and steal [V]. Fix: author, and make one item a chart-reading item to exercise the DX engine.
The pilot size of 40 is a ceiling set by what the review lane can run and log before October 25. If lane capacity is smaller, the specification's rule applies: release fewer items, not unreviewed ones. The pilot is labeled as a preview of the associate track and not a practice exam.
5.6.2 What is wrong with the existing 140 items as a corpus
The bank has structure the platform can parse (140 of 140 questions in the NCA files parse) [V], so the problems are about meaning and format, not syntax:
1. Answer-position bias. Of 130 single-answer keys in the NCA files, 90 are B [V]. A learner who answers B to everything scores 69 percent. The pilot needs a rebalanced key distribution; the shuffling in the runtime (if any) must be checked, because if options are not shuffled at display, bias in the file is bias in the product. The repository-wide figure is 769 B, 593 A, 164 C and 32 D across 1,558 single-token keys [V], so this is a bank-wide authoring pattern. Fix CNT-01.
2. Ordering items graded unordered. Gap-fill questions 16 to 19 ask for an order (five items in section B) but the runtime compares sorted sets [V]. A learner who gives the right items in the wrong order scores correct. Fix PLAT-03.
3. Beta labels throughout. File titles, the blueprint service, display names and the cheatsheet carry the beta designation and a beta exam code (NCA75BETANEW) [V]. A learner using the product would believe they are practising for a beta program. Fix CNT-NCA-02.
4. Stale product naming. The bank uses "Xi Leap" where the current official guide uses Nutanix Disaster Recovery [V][O]. Fix: terminology sweep with a semantic lint rule (PLAT-08 rule R3).
5. Errata already applied. The two errata entries in the repository are already incorporated into the markdown, so applying them again is a no-op [V]. The risk is the reverse: a maintainer believes a correction is pending when it is done. Fix PLAT-12 (errata state must be visible in the pack report).
5.6.3 Claims that need a vendor citation before they are scored
The audit chapters and my own reading agree on three items [V][A]:
* SSH on a fresh CVM. The errata entry and the corrected gap-fill question say SSH is enabled by default for the stated fresh-install case. The cheatsheet's 7.5 changes list says "CVM SSH disabled by default" [V]. The repository's own doc-review report is not the vendor. Until a vendor document for the stated version and condition is cited, neither statement should be a scored key or a tutor fact. The cheatsheet line stays out of released content until reconciled.
* Maximum VMs. The review report says the downloaded manuals do not contain the configuration maximums annex and still recommends a number with high confidence [V][A]. A scored item needs the vendor's configuration maximums for the exact deployment model. Fix: cite or remove.
* Upgrade order. Part 1 question 3 expects AOS first. The review verdict's own evidence says the documents do not state a blanket AOS-first rule [V]. Fix: either re-word the stem to a situation in which the documents do give the order, with a citation, or remove it.
The beta end date of June 14 on the cheatsheet is also stale [V]: the official 7.5 exam is live and the Community post says appointments began on July 28, 2026 [S]. I treat that as a secondary source until the exam delivery site is checked. Fix: remove beta dates and codes from the cheatsheet.
Cheatsheet numbers such as "Max NGT VMs" are unverified [V]. Each number in the cheatsheet needs a dated vendor citation or removal; a cheatsheet is a study surface and a future tutor corpus.
5.6.4 NCA summary of gaps
Gap ID
	Description
	Severity
	Owner
	Closure
 
	CNT-NCA-01
	Blueprint hardcoded to 17 beta objectives; official guide has 14 objectives in 4 sections
	S1
	Builder
	Replace with manifest objective map (PLAT-13)
	CNT-NCA-02
	Beta titles, exam code and dates in files, cheatsheet and display
	S1
	Author
	Sweep and lint rule R3
	CNT-NCA-03
	Re-tag 140 items to the 14 objectives; mark deep NCP items out of scope
	S1
	Author, RedEye lane
	Item inventory sheet, one row per item
	CNT-NCA-04
	Objectives with no items: Foundation, X-Ray, Collector, solutions beyond infrastructure, virtual switches, out-of-band, compatibility, support, performance
	S1
	Author
	At least one reviewed item per uncovered term
	CNT-NCA-05
	Three claims without vendor citations (SSH, max VMs, upgrade order)
	S1
	RedEye lane
	Cited or removed
	CNT-NCA-06
	Key bias (90 of 130 are B)
	S2
	Author
	CNT-01 acceptance: no letter above 40 percent in any released pack
	CNT-NCA-07
	Ordering items graded unordered
	S1
	Builder
	PLAT-03
	CNT-NCA-08
	Stale product naming
	S3
	Author
	Rule R3
	CNT-NCA-09
	Exam facts to verify at the delivery site: price, length, score, appointment status
	S2
	RedEye lane
	Fetch the vendor exam page on the day of release
	6. Platform capability gaps and the specified fix for each
Every finding in this section has an ID, a severity, the evidence tag, the exact file, the fix, a command that proves the fix and an acceptance criterion. Roger's direction was that every finding is addressed, so nothing here is parked. Where a fix needs a decision from Roger, the decision is listed in Section 9.3 and the finding still has an owner. No fix has been implemented and no repository write was made [S].
A note on evidence. I could not run the .NET build because no .NET SDK was available in my workspace [S]. Findings tagged [V] were verified by reading source or running a script I wrote (a Python port of the parser rules, an import checker, a bank analyzer). Findings tagged [A] were reported by the parallel audit, which ran the code; I read its description and did not re-run it.
6.1 Simulator does not boot (PLAT-01, PLAT-02)
PLAT-01, S1 [V][A]. A missing import prevents the simulator from starting. The file RadicalTrainingPlatform.Web/js/views/pe-reports.js line 7 imports ConfirmDialog.js from the components folder, and the file in the repository is named Confirm.js [V]. A browser module graph fails as a whole when one import fails, so none of the 47 routable views load. The parallel audit reports the defect has been present since June [A]. The same import is in the Legacy WinForms copy of the Web tree that the Desktop project embeds [V], so both the PWA and the desktop shell are affected.
Fix. Line 7 of pe-reports.js reads import { confirm } from '../components/ConfirmDialog.js';. Change it to import { confirm } from '../components/Confirm.js'; in both copies. The real file js/components/Confirm.js exports a named function confirm, and at least five other views (us-objects, pc-flow, pc-vms, pe-network, ci-console) already import it by that path [V]. Do not rename the file and do not add a duplicate ConfirmDialog.js; the named export matches, so no other change is needed. On case-insensitive Windows a case or path difference may have hidden similar defects; Roger's remark that it worked on Windows [S] is a hypothesis about that, not a finding.
Proof. python3 tools/check_imports.py RadicalTrainingPlatform.Web (PLAT-02) exits 0, then a browser smoke (PLAT-02 step 3) loads index.html, waits for the route #/pe and sees no console errors.
Acceptance. The import check passes in CI on Linux; the smoke test fails when the old import is restored (a mutation test the implementer must run once and record).
PLAT-02, S1 [V]. No test catches broken module graphs. My import checker (a short Python script that resolves each relative import against the file system case-sensitively) scanned 307 imports across the Web tree and found exactly one that does not resolve [V]. The Pages workflow publishes the directory with no import check, no browser smoke and no scenario validation [A].
Fix. Add the checker to the repository as tools/check_imports.py, run it in the Linux CI job before the build, and in the Pages workflow before the upload step. Add a browser smoke using a headless Chromium (Playwright is the usual choice; the implementer may choose another) that loads the built directory from a static file server with the service worker disabled, waits for the shell, clicks through three routes and fails on any console error. A second smoke repeats with the service worker enabled to test the upgrade path (PLAT-15).
Acceptance. A pull request that reintroduces a broken import turns CI red at the checker step and a pull request that breaks a route at runtime turns it red at the smoke step. The implementer records both red runs as evidence.
6.2 Scoring correctness (PLAT-03, PLAT-04, PLAT-05)
PLAT-03, S1 [V][A]. Ordering questions are graded as unordered sets. In ExamSessionViewModel, the submit logic sorts both the learner's selection and the correct answer before comparison [V]. For a question whose answer is a sequence (NCA gap-fill questions 16 to 19, and the methodology items proposed for Network+ objective 5.1) the right items in any order are accepted [V]. The audit reports the same in the runtime [A].
Fix. Add a response type to the Question model (Single, Multi, Ordered). The parser reads the type from a new marker in the markdown (for example a header line Type: ordered) and falls back to the existing inference only for legacy files, where an answer line with five or more letters in the section named sequence or ordering is treated as ordered and flagged by lint. Submit compares the sequence for Ordered and the set for Multi. The review screen shows the learner's order next to the correct order.
Proof. Unit tests in RadicalTrainingPlatform.Core.Tests: for the key "BADC", answers "ABCD" and "BADC" give wrong and correct; for a multi-select key "AC", answers "CA" and "AC" both give correct. Run dotnet test --filter Category=Scoring.
Acceptance. All of NCA gap-fill questions 16 to 19 are grading in order; a content parity test (CI-02 in the audit) loads the real packs and asserts the ordered ones are tagged.
PLAT-04, S1 [V][A]. Ten answers of the form "B and D" are silently dropped. QuestionParser's answer expression accepts only letters, commas and spaces [V]. NCP-AI-Part4 questions 61 to 70 use a conjunction in the key and the parser drops them, so the catalog reports 1,588 parseable questions out of 1,598 headers [V]. The linter passed the file because its own check is a different expression [V].
Fix. Either normalise keys to B,D in the files or accept "and" and "&" in the parser; do both, because a parser that accepts a documented variant and a lint that flags a nonstandard one make the failure visible. The parser must also report a count of rejected questions and the catalog UI must display it, so a drop is never silent.
Proof. A test with the ten keys, then python3 lint-content.py and a parser report both show 1,598 of 1,598.
Acceptance. A deliberately malformed question added to a fixture file makes the parity test fail with the file name and question ID.
PLAT-05, S2 [V][A]. Retrying a question double-counts. The session keys questions as ExamCode:SourceFile:Id and keeps two sets, wrong keys and correct keys. A wrong answer followed by a right answer on retry leaves the key in both sets [V]. Statistics then count the question twice.
Fix. Replace the two sets with one attempt log (question key, revision, attempt number, response, correct, timestamp) and derive both sets from the latest attempt, keeping earlier attempts for history. Define the retry rule: the final state is the last attempt, the statistics show first-attempt accuracy and latest accuracy separately.
Proof. A test that submits wrong then right yields one question in the correct set, none in the wrong set, and two attempts in the log.
Acceptance. No code path reads the old sets; grep for the old field names returns nothing.
6.3 Identity, vendor and display metadata (PLAT-06, PLAT-07, PLAT-13, CNT-01)
PLAT-06, S1 [V]. Exam codes collide for the new tracks. The parser derives exam codes from file names. A Python port of the rules (I could not run C# [S]) gives COMPTIA-A for both COMPTIA-A-1201 and COMPTIA-A-1202, and COMPTIA-NET for COMPTIA-NET-009 [V]. The session key includes the source file, so progress would not collide, but the catalog, blueprint and statistics group by exam code, so the two A+ cores would be shown as one exam.
Fix. A pack manifest (see PLAT-13) declares the stable exam code, vendor, display name, level and objective-source version. Derivation from file names is retained for legacy packs only and is overridden by a manifest entry. The bridge's exam list must use the manifest code as ID with its case preserved; today it lowercases codes [V], which would collide for the A+ cores.
Proof. Unit tests for the three new codes plus a collision test: loading two manifests that declare the same code fails with a clear message.
Acceptance. The catalog shows two A+ entries and one Network+ entry with the correct display names.
PLAT-07, S2 [V]. Vendor and level default wrongly. The vendor map includes single-letter keys such as "A" and "N" and "Sec" [V]. A code that begins with the letter N, such as N10-009, resolves to "Independent" in my port [V]. Unknown level defaults to professional, which mislabels a beginner pack [A].
Fix. Manifest fields (vendor, level) are required, with no default; a missing field fails the loader. Remove the single-letter keys.
Acceptance. Test: a manifest without a vendor is rejected; the three new tracks display "CompTIA" and "Nutanix" and "Beginner preview".
PLAT-13, S1 [V]. The blueprint is hardcoded and matches by fuzzy substring. HardcodedBlueprintService.GetBlueprint selects a blueprint by a Contains match on the exam code and carries the beta's 17 objectives with weights of 20, 30, 25 and 25 percent [V]. A new code that contains an existing code's text would pick up the wrong blueprint silently.
Fix. Blueprints move into the manifest as data: objective ID, title, source document and version, and (where the vendor publishes them) weights. Exact match only. A weight is optional because the NCA guide publishes none [O]; the UI must not show a weight that the vendor did not publish.
Acceptance. A test shows the NCA blueprint has 14 objectives and no weights; A+ and Network+ show vendor weights.
CNT-01, S2 [V]. Answer keys are biased in every bank. Across 1,558 single-letter keys the distribution is B 769, A 593, C 164, D 32, so 87 percent are A or B [V]. Individual files are worse: NCP-AI-Part1 has 80 of 80 keys as A; NCM-MCI-Part1 has 79 of 80 A; NCP-CI-Part2 79; NCP-AI-Part2 79; NCP-US-Part2-D4 77 [V]. The distribution tables are in Appendix B.
Fix. Two parts. First, the build shuffles option order per attempt using a seeded shuffle, so file bias is not visible to the learner. Second, a lint rule fails any released pack in which a single letter exceeds 40 percent of single-answer keys, and new packs are authored with balanced keys. Existing packs that fail are flagged "legacy" and excluded from the beginner tracks.
Proof. python3 lint-content.py --balance prints per-file distributions; the shuffle has a unit test that two attempts give different orders and the key follows its option.
Acceptance. All released packs pass; legacy packs are listed with their failing letter.
6.4 Lint blind spots (PLAT-08, PLAT-14)
PLAT-08, S2 [V]. The content linter checks structure, not meaning. lint-content.py globs only top-level markdown files and skips any whose name contains LAB, DESIGN, SPRINT, CHEATSHEET or ROADMAP, and MarkdownExamRepository skips a similar list [V]. A question pack named, for example, COMPTIA-NET-LAB-Subnetting.md would be neither linted nor loaded, with no message. Its answer-key syntax differs from the parser's [V], which is how ten keys passed.
Fix. Replace the skip-by-substring with a manifest: every file in a content directory is either listed as a pack, listed as a document, or the build fails. Add semantic rules, each with a test file of a failing example:
* R1: the key syntax accepted by lint equals the parser's (import the same expression from one place).
* R2: every pack carries its manifest entry and every question has a provenance record (RGT-06).
* R3: a retired-term list (for example "Xi Leap", "NCA75BETANEW", "beta", "June 14", "CVM SSH disabled by default") fails any released surface, including the cheatsheet, tutor corpus and export.
* R4: no stem or option contains "all of the above" without a review-lane flag.
* R5: ordered items declare their type.
* R6: the key letter exists among the options.
* R7: no two options are identical after normalisation.
* R8: explanation present and at least a sentence long.
* R9: arithmetic items (subnetting) carry a script-computed expected answer in a metadata field that must equal the key.
* R10: no vendor trademark logo or screenshot references in a pack.
* R11: key balance (CNT-01).
Proof. python3 lint-content.py --strict run on the current repository and a fixtures directory; the fixtures directory has one failing file per rule.
Acceptance. Each rule has a red fixture and a green fixture; the CI job runs the strict mode.
PLAT-14, S3 [V]. Duplicate stems are not detected. The lint has no duplicate check across files. Fix: normalise the stem (lowercase, collapse whitespace, strip punctuation) and fail on exact duplicates; report near duplicates (a similarity score above a chosen threshold) as warnings for the reviewer. Acceptance: a fixture with two identical stems fails.
6.5 Persistence, statistics and the desktop bridge (PLAT-09, PLAT-10, PLAT-11)
The repository has real persistence code and the parallel audit confirmed the save and load handlers work when called [A]. The gap is that nothing calls them end to end, and that several other handlers return success without doing the work.
PLAT-09, S1 [V][A]. Bridge handlers acknowledge effects that did not happen. In CefBridge, get_stats returns zeros for answered and correct, submit_answer logs and returns recorded=true without storing anything, and the reset, settings and import handlers return success without changing state [V][A]. A learner who submits an answer and then opens statistics sees nothing; a presenter who clicks reset sees a success message and an unchanged state.
Fix. Each handler gets a contract written as a test before the change: save returns success only after the write succeeds; reset deletes the defined scope and returns the new baseline; set-setting persists the field and the next get returns it; submit-answer writes one attempt (PLAT-05) and the next stats call reflects it; import validates a schema, previews the replacement and leaves existing data untouched on failure; export produces a file the import accepts on a clean store. A handler that cannot do the work returns an explicit unsupported result, never a hardcoded success.
Proof. dotnet test RadicalTrainingPlatform.Desktop.Tests --filter Category=BridgeContract with one round-trip test per handler (existing CefBridgeHandlerTests has 7 tests and asserts some of the hardcoded values, which are replaced) [V].
Acceptance. No handler contains a literal true or zero as its result without a code path that computes it; the author of the change greps the handler file for literals.
PLAT-10, S1 [A]. Nothing calls the persistence handlers. The bundled JavaScript does not call save or load progress, and the exam-session view model does not use the session store [A]. Learner progress is lost on restart.
Fix. The simulator's StateStore calls a persistence adapter on each state transition (debounced) and on load. The adapter has two implementations (browser storage and bridge) behind one interface, selected by host detection (Section 6.9). Demo mode uses an in-memory adapter and never writes (DEMO-05).
Proof. A scripted browser test performs a task, reloads and sees the task state; a desktop test does the same through the bridge.
Acceptance. Restart-resume works on every host in the matrix in Section 6.9 or the host's entry says "not supported" with a reason.
PLAT-11, S2 [V]. Storage is single-version and shared. StateStore has a database version of 1 and one shared state across scenario groups [V], so a change in the shape of seed data cannot migrate and a scenario fixture change can overwrite learning history. Fix: a versioned store with a migration function per version, a separate keyspace for learner history and for scenario state, and a documented reset scope for each. Acceptance: a test opens a version-1 store with the new code and migrates without losing history; a reset of scenario state leaves history intact.
PLAT-12, S2 [V]. Errata has limits. Errata is consumed by the parser, which is progress [A]. The limits: both existing entries are already baked into the markdown (so they do nothing) [V], the correction record has no citation field, and corrections do not reach the cheatsheet, tutor source or export. Fix: errata records gain source_url, reviewer, date and surfaces (list of files affected), and a test fails if a surface listed still contains the retired text (rule R3). Acceptance: the SSH line in the cheatsheet is removed or cited, and the test shows it.
6.6 Simulator scenario validity (SIM-01 to SIM-05)
The simulator has 44 scenarios (21 in the NCM-MCI group, 7 NCP-AI, 7 NCP-CI, 9 NCP-US) and 78 objective validators [V]. Of those validators, 27 are the literal validate: () => true, and one scenario (mci-01) checks only that a name was entered [V]. The parallel audit ran the scenarios on a fresh seed: 16 of 44 complete immediately, and us-bucket-01 cannot be completed because its validator reads the wrong collection [A].
SIM-01, S1 [V][A]. Scenarios that pass without action. Fix. For each of the 44, write the fixture (initial state), the required end state, a negative path and a positive path. A scenario whose seed already satisfies its objective gets a changed seed (for example a hibernated cluster for a resume task). Proof. A generated test per scenario: check on fresh seed is incomplete; a wrong or partial action is incomplete with a message naming the missing condition; the intended action is complete; reset returns to incomplete. Acceptance. 44 of 44 rows in the matrix (Section 8.4) are green on a clean seed.
SIM-02, S1 [V]. Validators that are literal true. Replace each of the 27 with a state predicate, or mark the scenario as an observation task with a learner response checked against the fixture's metrics. A validator may not be a constant; a lint script over the scenario files fails on => true. Acceptance: grep returns no matches.
SIM-03, S1 [A]. us-bucket-01 is unpassable. The validator reads the wrong collection (the audit says it should inspect object_buckets) [A]. Fix: correct and cover with the SIM-01 test. Acceptance: the positive path completes.
SIM-04, S2 [V]. Scenarios share state. Related to PLAT-11: a scenario in one group can see changes from another, so completion depends on hidden prior state [A]. Fix: each scenario starts from its own fixture copy. Acceptance: running the 44 in random order twice gives identical results.
SIM-05, S2 [V]. Weak validators. Several validators exclude entities by hardcoded names or depend on pre-existing counts [A]. Fix as SIM-01; the RedEye lane or a named person signs each row.
6.7 CI and supply chain (CI-01 to CI-04)
CI-01, S1 [V][A]. The vulnerability gate fails open. .github/scripts/vuln_gate.py reads a top-level JSON list, and the scanner (dotnet list package --vulnerable --format json) emits a root object whose content sits under projects[].frameworks[].topLevelPackages and transitivePackages [V]. The parallel audit fed the script real scanner output and a fixture with a High advisory; the gate printed PASS and exited 0 [A]. In my clone the loop at .github/scripts/vuln_gate.py line 72 reads for item in data if isinstance(data, list) else [], so a root object is silently skipped [V]; line 82 also reads the field advisoryUrl, while the audit reports the scanner emits advisoryurl, so evidence would be lost even after the root is fixed [A]. Current packages are clean, so there is no present vulnerability; the defect is that the guarantee the gate advertises does not exist.
Fix. Parse the root object; collect advisories from both package lists in every framework of every project; fail on any severity at or above the configured threshold; fail on unknown shape (an unexpected format must be an error, not a pass); print the counts it examined so a gate that inspected zero packages is visible. Proof. Three fixtures in .github/scripts/tests/: clean, High advisory and malformed. python3 -m pytest .github/scripts/tests. Acceptance. The High fixture exits non-zero; the malformed fixture exits non-zero; a CI run on a branch that adds a vulnerable package turns red once, recorded as evidence.
CI-02, S2 [A]. Coverage is collected, not enforced. Add a threshold with a declared scope (Core package, with named critical files held to a higher bar: parser, scoring, session, identity) and a test of the gate with a fixture below the bar. Acceptance: a pull request that lowers coverage on a critical file fails.
CI-03, S1 [A]. The Pages deployment has no smoke. Covered in PLAT-02; the deployment workflow depends on the smoke job passing.
CI-04, S1 [A]. Linux and Windows are built; macOS is not, and cross-platform is a stated requirement. The Linux job builds Core and Desktop, runs tests and a headless Avalonia smoke test; the Windows job builds the whole solution; no job exercises macOS [A]. Roger's requirement is that the track runs on more than Windows [S], so closing this finding means evidence on Windows, Linux and macOS for the platforms he selects (decision D1), not removing a platform from the claims. Fix. Add a macOS job on an arm64 runner (and an x64 or universal build if Intel Macs are in scope) that publishes the bundle, launches it, loads the content bundle and completes one scenario; add equivalent launch and scenario tests for the Linux AppImage and the Windows build, each run from outside the repository. Closure tests per host. Content loads from the installed bundle (known exam, count and one question); the simulator boots; a task completes and resets; progress survives a restart (learner mode); an export imports on a clean store. Until a run exists, the host's cell reads "unverified" with its owner and date. Acceptance. Every selected host has all five tests green; a host with a red test is not described as supported.
CI-05, S3 [V]. Open Dependabot pull requests. Twelve are open (numbers 8, 10, 11, 12, 13, 17, 18, 21, 22, 24, 25 and 26) [V]. Fix: a triage list with a decision per pull request (merge after CI, close with reason) and a rule that CI must be green on main before the October 22 freeze. Acceptance: zero open Dependabot pull requests that are older than seven days at the freeze, or each has a written deferral reason from the builder.
6.8 Packaging and release truth (PKG-01 to PKG-06)
The repository has Linux AppImage and macOS DMG scripts and Flatpak metadata. The GitHub API reported zero releases and zero tags [A]. A user who follows the desktop's download link finds nothing.
PKG-01, S1 [V][A]. Both packaging scripts contain a malformed test. packaging/linux/build-appimage.sh line 46 and packaging/macos/build-dmg.sh line 78 contain if [ -f "${candidate}"; then, which is missing the closing bracket [V]. bash -n exits 0 on both scripts (I ran it), because this is a runtime error of the [ builtin and not a grammar error [V]. At runtime Bash prints "[: missing ]'" and, because the failing test is theifcondition, treats it as false and continues; the script can still exit 0. An exit-code check alone therefore misses the defect, and the intended branch (finding the icon or tool at the candidate path) silently never runs. *Fix.* Close the bracket on both lines; runshellcheckoverpackaging//.shin CI; add a runtime fixture that runs the candidate-search section with a known file present and asserts the expected branch was taken (for example that the icon was found and copied) and that stderr contains no "missing" message. *Proof.*shellcheck packaging/linux/build-appimage.sh packaging/macos/build-dmg.shreports no error, and the fixture shows the branch behavior. Do not usebash -n` as the proof. Acceptance. Shellcheck is clean in CI, and the fixture fails when the bracket is removed again.
PKG-02, S1 [V][A]. The AppImage fallback is unreachable. When appimagetool is missing, the script prints an error and runs exit 1, so the later tarball fallback step never runs [V]. Fix. Decide the intended behavior (Roger or the builder): strict failure with no fallback, or a labeled tarball. Implement it and remove the misleading comment. Proof. Run the script with PATH set so the tool is absent, and check the expected output exists, has an executable launcher and includes the content manifest. Acceptance. Both paths have a test.
PKG-03, S2 [V][A]. The macOS script claims more than it does. The header says "signed and notarized", but the signing identity and notary variables default to empty, so the default output is unsigned, and the default runtime is arm64 while a comment says universal [V]. If create-dmg is absent it produces a ZIP and exits successfully [A]. Fix. The script writes a status file (architecture, signed or not, notarized or not, DMG or ZIP) next to the artifact, and the header states the truth. Secrets come only from the build environment, never from files or logs. Acceptance. An unsigned build is labeled unsigned in the status file and in the release notes. A universal claim is allowed only if lipo -info on the binary shows both architectures.
PKG-04, S2 [V][A]. The Flatpak wrapper points at a directory. The manifest publishes the application to /app/bin/RadicalTrainingPlatform.Core, which is a directory, and the wrapper script does exec /app/bin/RadicalTrainingPlatform.Core; command: is RadicalTrainingPlatform [V]. The manifest also pins a short historical commit (72d5ec8) [V]. Fix. Pin the release tag or full commit; make the wrapper exec the real binary inside the directory; list sources for offline NuGet restore; narrow the filesystem permissions to what the app uses. Proof. flatpak-builder on a Linux machine and launch from outside the repository. I could not run this [S]. Acceptance. The app opens a lesson and a scenario in the sandbox.
PKG-05, S1 [A]. Installed builds may have no content. The repository searches the current directory, the executing assembly directory, application data and parent directories [A]. A developer's checkout finds banks in the repository root; an installed bundle may find none, and no bundle manifest proves what ships. Fix. A content bundle contract: the build includes only released packs, errata, lessons, licenses and a manifest with hashes at a defined path; a missing bundle is an actionable error, not an empty catalog. Proof. A clean-directory launch test with no repository above the executable shows a known exam, its count, one question, one correction and one lesson. Acceptance. Passes on every supported host.
PKG-06, S2 [A]. The desktop download link points at no release. Fix: hide the download route until a release exists and the link has been fetched, or show a development-mode message. Acceptance: the link either resolves to an artifact or is not shown.
BRAND-01, S2 [V]. The PDF export footer is hardcoded to Nutanix. ExamPdfExporter.cs (line 142) writes "RadicalTrainingPlatform - Nutanix Certification Practice" on every page [V]. For A+ and Network+ this misbrands and for Network+ it would conflict with the disclaimer. Fix. Footer text from the manifest: "RadicalTrainingPlatform - independent study material, not official or endorsed" plus the track name. Acceptance. An A+ export shows the A+ track and the exact disclaimer (RGT-04); a test reads the PDF text.
PWA-01, S2 [V] for the code facts, [P] for the failure mode. Service worker and manifest. The service worker uses the cache name 'labsim-v1' with a cache-first strategy and no seed versioning, and the manifest uses data-URI emoji icons [V]. The code facts are verified; whether a deployed fix is actually masked by a cached older version in a real browser is a risk I did not prove, because I ran no real browser [S]. The risk needs a real-browser test, not an assumption either way. Fix. Derive the cache name from the release identifier, serve the shell network-first, version the content cache, show an update prompt, and use real PNG icons at 192 and 512 pixels. Proof. A real-browser test deploys version A, loads it, deploys version B and reloads. Acceptance. The test records whether B appears within one reload; if it does not, the fix is required, and if it does, the test stays as a regression guard. The browser installability check passes.
DEP-01, S3 [V]. A native browser dependency. The Desktop depends on CefGlue, which carries per-platform native binaries and downloads [V]. The desktop's real status on Linux and macOS is unverified [A]. Decision for Roger and the builder: keep CefGlue and test it on each host, or move the embedded view to the platform web view; the matrix decides. Acceptance: each host's cell shows launch and scenario-complete evidence.
DUP-01, S1 [V]. Two copies of the simulator. The Desktop embeds the Legacy WinForms copy of the Web tree; the standalone Web tree is separate [V]. They differ at least in index.html and BridgeClient.js [V] and the audit adds that neither is a superset of the other [A]. A fix applied to one does not reach the other, which is why PLAT-01 must be applied twice today. Fix. One source tree (the Web tree), a host adapter layer (transport, persistence, origin checks) per host, and a build step that copies the single tree into the desktop output; a CI check fails if a second copy of any shared file appears. Proof. diff -r between the built desktop assets and the Web tree shows only the adapter files. Acceptance. The 44-scenario matrix runs through both adapters with identical outcomes.
6.9 Cross-platform and host matrix (XPLAT-01 to XPLAT-04)
Roger's words on October 10 were "This was working on windows but we need it cross platform" [S]. I preserve that as his experience. The current source fails the module boot (PLAT-01); I did not find which build he used, and an older build is a hypothesis.
XPLAT-01, S1. Define "supported" per host. A host is supported only when every cell in its row has evidence from a run. The matrix below is the acceptance contract. Today every cell without a source marker is unverified; I ran none of them [S].
Host
	Surface
	Build or load
	Content loads from installed bundle
	Simulator boots
	Persistence round trip
	Export
	Current evidence
 
	Windows 11 x64
	Desktop (CefGlue)
	Windows CI job builds the solution [A]
	unverified
	blocked by PLAT-01
	unverified
	unverified
	CI build only
	Windows 11 x64
	PWA in Edge and Chrome
	static files
	not applicable (Web bundle)
	blocked by PLAT-01
	unverified
	unverified
	none
	Ubuntu LTS x64
	Desktop (AppImage)
	Linux CI builds Core and Desktop; headless smoke [A]
	unverified
	blocked
	unverified
	unverified
	CI build, no launch of the embedded browser
	Ubuntu LTS x64
	Flatpak
	not built
	unverified
	unverified
	unverified
	unverified
	none; wrapper path suspect (PKG-04)
	macOS arm64
	Desktop (DMG or ZIP)
	no CI job [A]
	unverified
	unverified
	unverified
	unverified
	none; scripts contain a malformed test (PKG-01)
	macOS arm64
	PWA in Safari and Chrome
	static files
	not applicable
	blocked
	unverified
	unverified
	none
	ChromeOS
	PWA in Chrome
	static files
	not applicable
	blocked
	unverified
	unverified
	school device policy unknown [S]
	iPadOS or Android tablet
	PWA
	static files
	not applicable
	blocked
	unverified
	unverified
	none; touch interaction untested
	XPLAT-02, S1. One source tree with host adapters (DUP-01). The design is three layers: the shared simulator (views, scenarios, validators, presentation), a host adapter interface (detect transport, send request and correlate the reply, timeouts, origin checks, disposal, persistence policy) and per-host adapters (browser, WebView2, CefGlue). Native-only features are detected and reported as unavailable when the adapter lacks them. The existing mock "standalone" response path in the PWA's bridge client returns success for operations it did not do [A]; it becomes an explicit browser adapter whose unsupported operations say so. Acceptance. The scenario matrix (Section 8.4) runs through every adapter with identical learning outcomes.
XPLAT-03, S2. Path, case and line-ending sensitivity. Linux hosting is case-sensitive; Windows is not. The import checker (PLAT-02) enforces exact case. A test fixture in CI includes a file with CRLF line endings and one with a byte-order mark in a pack, because the parser must handle both; the audit reports encoding fixtures already exist and cover more than UTF-8 [A], so the work is to extend them to the new pack format. Acceptance. The parity test passes with CRLF and LF checkouts.
XPLAT-04, S2. Browser matrix for the PWA. Declare supported browsers (current Chrome, Edge, Safari and Firefox) and test storage denial, a blocked service worker and no network: the lesson and a synthetic scenario must still work offline from the cached bundle or show a clear message. School device policy is unknown [S]; the host question in Section 9.3 gates the specific tests.
6.10 Simulator engines: build order and the cost of "all content"
Section 5.1 defines six engine types (ST state change, TE terminal, DX diagnosis, OP ordering and process, VI visual placement, SJ scenario judgment). This section orders the work.
1. ST (state change) is what the existing simulator mostly implements. Work: repair the 44 existing scenarios (SIM-01 to SIM-05) and add a fixture, a negative path and a reset for each. This unblocks every existing Nutanix scenario in demo mode.
2. OP and VI are small: drag and drop or ordering with a checker. They need PLAT-03 for ordered grading. They cover about a third of the A+ and Network+ Core items.
3. TE (terminal) needs a deterministic command fixture: a table of command, arguments and output for a given state. It does not need a real shell. The Network+ gateway and DHCP tasks depend on it, and so do the A+ command-line items.
4. DX (diagnosis) is a panel with symptoms, logs or a graph, and a scored choice of next step. It is mostly data plus a checker.
5. SJ (scenario judgment) is a multiple-response item with a rubric and is the cheapest.
Roger said "we need the demo mode to work for all content aka simulator" [S]. The cost depends on what "all content" means. The existing 44 scenarios are a fixed number and each has a defined fix. For the new tracks, the Core and Demo tiers in Section 5 cover 63 A+ objectives (27 in Core 1 and 36 in Core 2), 25 Network+ objectives and 14 NCA objectives, each with an engine named. I count those 102 as the all-content target for the new tracks. That is 102 objective treatments plus the 78 existing validators. This is a large but finite list; Section 9 assigns each a closure.
7. Rights, licensing and policy gaps
This section records facts and proposes controls. It is not legal advice and does not conclude what the law allows.
7.1 What Roger said, and what is mine
Roger's words on October 10 in his WhatsApp messages were: "They can't legally prevent anyone for making ai generated training content" and "We will clearly state this isn't official training or endorsed training material" and "And we have to address it all understand" [S]. I did not find a message in which Roger states a wider policy on AI-written exam content, so this document does not claim one. The controls below that go beyond the disclaimer (human review, originality attestation, provenance) are my proposals, marked [P].
7.2 What CompTIA says
CompTIA's unauthorized training materials page (fetched October 10, 2026) says CompTIA does not authorize or condone the use of AI or large language models to generate study questions, practice exams or exam-related content, and warns that AI output may be inaccurate or substantially similar to unauthorized exam content [O]. The page is a policy statement. It is not law, and this document does not assert it is. It does create a candidate-facing risk: a CompTIA candidate using AI-generated practice questions may be told by their vendor that they are not authorized materials. The product should therefore describe itself accurately.
7.3 Gaps and fixes
RGT-01, S1 [V]. The repository has no LICENSE file. The README says the project is BSD-3-Clause and lists a LICENSE file; no such file exists in the tree [V][A]. Without one, no one has a license to use the code. Fix. Roger names the copyright holder (Section 9.3); add the BSD-3-Clause text as LICENSE at the root; add a separate CONTENT-LICENSE.md that states the license of the original study text (which may differ from the code) and says that vendor names, objectives and any vendor documents are not covered. Acceptance. GitHub's license detection shows the license; the README links to both files.
RGT-02, S2 [V]. The README is stale. It describes four exams and 1,458 questions, a WinForms application and links to a different repository (rogerlundnetcenter/nutanixcertificationtool) [V]. The current count is 1,598 headers and 1,588 parseable [V]. Fix. Rewrite from the manifest counts (the compiler's counts become the public counts); fix the links. Acceptance. A test compares README counts with the manifest.
RGT-03, S1 [V]. Two vendor PDFs are tracked in the public repository. The repository tracks two vendor PDFs under docs in Git LFS (the AHV document's pointer reports 4,323,527 bytes) [V], and the GitHub repository is public [V]. I could not determine from the repository alone whether redistribution is permitted; the vendor's terms for those PDFs were not located [S]. Fix. Inventory (title, version, publisher, source URL, hash, permission record). Then Roger decides: obtain written permission, replace the files with links, or remove them (history rewrite is a separate, explicit decision). Exclude the PDFs from any tutor corpus until resolved. Acceptance. Every vendor document in the tree has a permission record or is absent.
RGT-04, S1 [P]. The non-endorsement statement. Roger chose clear non-endorsement language [S]. Proposed exact text for every product surface (home, track page, export footer, demo slide, demo script) and README:
RadicalTrainingPlatform is independent study material. It is not official, approved, endorsed or sponsored by CompTIA, Inc. or Nutanix, Inc. CompTIA, A+, Network+ and Nutanix are trademarks of their owners. This material helps you prepare for the CompTIA Network+ exam. Its questions are original practice items released after an originality and provenance review.
The name of the track in the interface uses the nominative form "helps you prepare for the CompTIA Network+ exam" and never "approved", "official" or "authorized" [S]. Vendor marks and logos never appear in the product's own branding (RGT-07). Trademark ownership and any required attribution wording are to be verified against each vendor's trademark page before release. The last sentence is a release-gated claim: it may appear only on a pack whose items all have complete provenance records and have passed the exam-integrity review (RGT-06); otherwise the sentence is omitted. I make no claim that the pack contains no exam-derived content until that review has run. Acceptance. A test greps every surface for the statement and for the forbidden words (rule R3).
RGT-05, S2 [P]. Framing controls. The beginner label (not "exam prep"), a "general IT skills coaching" framing for the tutor, no claim of pass rates, no use of the word "dump" or "real exam questions", and a visible source and review date on every lesson. Acceptance. A reviewer checklist item per surface.
RGT-06, S1 [P]. Provenance record for every released item. Fields: item ID, track and objective, author (tool-assisted or human, named), the sources consulted (public objectives, vendor documentation by URL, own knowledge), review lane run ID, review date, an originality attestation ("written from the public objectives and technical knowledge, not copied from or reconstructed from exam content") and the review outcome. Items without a record cannot be released (lint rule R2). Items that claim to be actual, leaked or recalled exam content are quarantined. The audit chapter I read raised the same control [A]. Acceptance. 100 percent of the 89 items released for demos (24 A+, 25 Network+ and 40 NCA pilot items) have complete records.
RGT-07, S2 [P]. No vendor imagery. No logos, screenshots or product icons from CompTIA or Nutanix in lessons or the demo, unless a written permission exists. The existing Nutanix simulator mimics the Prism interface; whether the look-alike raises any vendor-permission question is unknown to me and is not a finding that it is prohibited; it needs a documented decision (Section 9.3, D7) before a public showing. Acceptance. An asset inventory with no vendor-origin files.
RGT-08, S1 [P]. The tutor's data and disclosure. If a live tutor is used, text sent to the model provider leaves the device. Controls: the tutor receives only approved lesson context, never the whole bank, the answer keys or vendor PDFs; no student personal data is sent; the provider's terms on retention and training are read and recorded; a spend cap and key storage on the server side (never in client assets); a visible "AI coach" label. The student audience's age is unverified [S]; if any are under 18, a school's policy and applicable student privacy rules apply and Roger must find out before the demo. Acceptance. The 24-prompt tutor test (Section 8.5) passes and an assets scan finds no key.
RGT-09, S2 [O]. Nutanix exam security. The NCA blueprint guide says Nutanix may refuse to certify a candidate who copies and redistributes exam material [O]. The pilot must therefore never contain recalled exam content, which RGT-06 enforces, and the track page must say that candidates should not share exam content.
7.4 The AI review lane (RedEye) replaces the human review gate (RGT-11, S1) [P]
On October 10 at 12:25 CDT Roger wrote: "We nees to build this so the ai does the review with reseye not me" [S]. At 15:33 CDT he clarified: "Yes red eye is our vision pipeline", then "Review the repo and update" [S]. The lane is RedEye, his existing radredeye component, not a separately invented reviewer product. Where earlier sections say "reviewer", content-quality review uses this lane; Roger is not the required reviewer. Roger's 12:27:33 instruction, "Moving forward this is for all openspecs", makes a RedEye review lane part of every OpenSpec, with checks suited to the artifact. Sampling by Roger or another person is optional, not a release dependency. Owner decisions on rights, spend and public release are unchanged.


RedEye implementation baseline and integration boundary (reviewed October 10, 2026). RedEye is Roger's existing radredeye vision pipeline, not a new reviewer product. The live repository describes it as framework-agnostic visual capture for AI agents over stateless MCP. Source inspected: README.md, Cargo.toml, CHANGELOG.md; crates/radredeye-core/src/lib.rs and pipeline/mod.rs; crates/radredeye-mcp/src/main.rs, lib.rs, mcp/mod.rs, mcp/tools.rs and admin/mod.rs; crates/radredeye-review/src/lib.rs, scorer.rs, artifact.rs and gates.rs; crates/radredeye-registry/src/lib.rs; crates/radredeye-bevy/src/lib.rs. Repository: https://github.com/TheArchitectit/radredeye. These were live default-branch reads, not a pinned commit: this review could not obtain the head SHA. Workspace version is 0.6.1 with unreleased control-actuator changes. No build, test suite, live provider or RTP integration was run in this review; the executor must record the exact head and run the acceptance tests before delivery.


Existing implementation. radredeye-core carries frames, configurable sink fan-out, bounded replay and named project streams. radredeye-mcp accepts base64 PNGs through submit_frame or POST /capture and exposes frame retrieval, text descriptions, pixel differences, stream/sink inventory, health and review_score. Its current tool list also includes post_action/current_action/release_action; control is per-process rather than per-stream and is not needed or granted to the RTP reviewer. radredeye-review implements a CaptureSink that encodes PNGs, invokes a Scorer and appends review.jsonl entries containing stream_id, seed and a score with quality/issues. It includes a deterministic MockScorer and an optional model-scorer HTTP path with local-first/hosted fallback. The provider admin surface supports configured scoring, but provider availability and payment authority must be verified separately. radredeye-registry supplies JSONL and feature-gated SQLCipher/Postgres failure backends; that registry is not the per-item release-attestation schema. Bevy source uses the Screenshot API despite the README adapter table still calling GPU extraction a stub; adapter prose alone is not runtime proof.


Required RedEye extension, not existing capability. Build the RTP evidence-review adapter on this render-look-judge pipeline: render the candidate item/lesson/UI with its eligible evidence, use a dedicated RTP stream for visual observations, and pass structured item/source/manifest inputs to a separate blind derivation context. A generic frame-quality score or caption cannot verify an answer key. RedEye's review extension must implement the specified blind key verification, context separation, source checks, objective mapping, bias/duplicate/originality checks, deterministic arithmetic, provenance completion, seeded-defect self-test and per-item verdict format. Bind each verdict to hashes of item text, manifest, eligible source evidence and reviewer configuration. The current frame seed hashes pixels/dimensions with DefaultHasher; it is not that four-input attestation. RTP's adapter/compiler must enforce the current passing verdict and invalidate edits. Missing evidence, missing/stale logs, missed seeds, mock-only review, unavailable providers and missing/incomplete results must block release.


Existing capture success is not release success. CaptureSink errors do not abort capture; review regression logging ignores the subprocess result. The current frame-gate aggregator counts only recorded lines, treats absent timing as passing and can report all_ok on zero records. Therefore neither frame retrieval, health, a frame score nor that dashboard is a substitute for the required item-level fail-closed ship-gate. Build explicit completion/error accounting and expected-item coverage outside model output. main.rs binds 0.0.0.0:8765, not loopback; the admin bearer-token gate is not proof of authentication on the capture/MCP surfaces. Restrict the RTP deployment to an isolated local boundary or add reviewed authentication/network controls before exposing private evidence. The RTP review adapter must not expose control tools, publishing, merge or repository-write capabilities to its model context.


Standing scope. Every OpenSpec carries a RedEye review lane appropriate to its artifact: visual render-look-judge evidence plus domain-specific checks. RTP's exam-key/objective checks are this integration's requirements, not a replacement definition for the general pipeline. Roger is never the required reviewer; owner sampling remains optional. This review rule changes the reviewer for quality gates only. Rights, spend, public-release and other owner decisions remain owner decisions. All review requirements and acceptance scenarios below remain build requirements until demonstrated against the pinned implementation.


An automated review of AI-written items is only as independent as its design, so the lane has these controls. I propose them; they are not vendor requirements and not a legal assurance.
RES-1 Independence. The review step uses a different model, or at least a different prompt context and no shared conversation, from the step that authored the item, and it never sees the author's reasoning. The author and review model identities are recorded per item.
RES-2 Answer key verification against source. For each item, a two-stage runner withholds the key from the review model. The blind derivation stage receives only the stem, options and eligible cited sources (public exam objectives, vendor documentation by URL, or approved lesson text). It derives an answer from those sources. The runner then compares that answer with the withheld key. A mismatch, a missing citation, or an answer supported only by the model's own knowledge fails the item. Arithmetic items (subnetting, capacity) are verified by a script that computes the answer; a model's arithmetic is never accepted as proof (rule R9).
RES-3 Objective mapping. The lane checks that the item maps to a named objective of the current official document version recorded in the manifest, and that its depth is appropriate for the beginner label. An item with no mapping, a retired objective or a beyond-scope claim fails.
RES-4 Position and balance detection. Deterministic code, not a model, checks the key distribution per pack (no letter above 40 percent of single-answer keys, CNT-01), flags "longest option is correct" and "all of the above" patterns, and checks that distractors are not trivially wrong.
RES-5 Originality and exam-integrity screen. Deterministic checks for exact and near-duplicate stems within the bank, plus a model-assisted screen that flags phrasing resembling known real or leaked exam content, any claim of being an actual exam question, and any recalled-content wording. A flagged item is quarantined, not edited into passing. This screen reduces risk and cannot prove originality or legality; the document makes no such claim.
RES-6 Attestation, automated. The lane writes the provenance record from RGT-06: item ID, objective, authoring tool and model, sources cited, review lane run ID and date, the outcome of each check and the final verdict. Items ship only with a passing record. The statement "original practice items released after an originality and provenance review" in the disclaimer (RGT-04) may appear only on packs where every item has a passing record.
RES-7 Per-item review log. A written log per item and a per-pack summary (pass count, fail count with reasons, quarantine count). The log lives in the repository next to the pack, so the release gate can verify it. Each verdict is bound to hashes of the item text, manifest version, eligible source evidence and reviewer configuration version. Any change invalidates the verdict and requires a new run; a stale passing log cannot authorize a modified item.
RES-8 Sampling and drift check. The lane supports a sample for a human to inspect (default 10 percent of passed items, chosen by a fixed random seed, plus every quarantined item's reason). The lane's own accuracy is measured on a small set of seeded known-bad items (a wrong key, a retired objective, a duplicate, a leaked-style phrasing) inserted before each run; a lane that misses a seeded defect fails the run. This is how the lane's reliability is evidenced without relying on a person to review everything.
RES-9 Scope limits. The lane does not decide permission or legal questions: the license holder, vendor-PDF redistribution, trademark wording and whether a look-alike interface needs a permission decision remain decisions for Roger (D4, D5, D7). The lane does not change the CompTIA policy position described in Section 7.2; its output is a quality and provenance control, and the disclaimer language stays as written.
Files. A review runner script under tools/ (for example tools/redeye/run_review.py), a pack-level review/ directory with one log per item, a CI step that fails a release build when any released item lacks a passing log, and the seeded-defect fixture set. The implementer chooses names and may use the existing lint as the deterministic part.
Commands and acceptance. python3 tools/redeye/run_review.py --pack <manifest> writes logs and exits non-zero if any item fails; python3 tools/redeye/run_review.py --self-test inserts the seeded defects and exits non-zero if any is missed. Acceptance: all released items have passing logs; the self-test catches all seeded defects; the release gate fails when a log is removed; the Network+ and A+ demo cuts (49 items) and NCA pilot (40 items) are reviewed through the lane by October 20.
8. Demo readiness gaps for October 23 (and the NCA cut for October 25 to 28)
October 23, 2026 is a Friday; October 25 is a Sunday and October 28 a Wednesday (checked by calculation). Today is Saturday, October 10, so there are 13 days to the Network+ demo. The audience is students; Roger is presenting on AI [S]. The requested venue is SCTCC in St. Cloud [S]. The device, browser, screen, network and school policies remain unverified. Every host-dependent item below is written as a test to run once the host is named.
8.1 What the demo needs to show, and what blocks it today
The preliminary specification's slice is a Network+ concepts lesson, one gateway troubleshooting scenario with a deterministic checker, a 25-item practice cut and a recorded tutor example. Against current source, four things block it.
1. DEMO-01, S1 [V][A]. The simulator does not boot (PLAT-01). Until fixed, no scenario can run at all.
2. DEMO-02, S1. The Network+ lesson, items and gateway scenario do not exist (CNT-NET-01 to 03).
3. DEMO-03, S1 [A]. The shell has no Network+ entry; the catalog cannot show an exam that has no manifest (PLAT-06, PLAT-13).
4. DEMO-04, S2 [A]. A live AI tutor has no implementation, provider decision or key handling (RGT-08). The default is a recorded example, labeled recorded.
Further demo gaps:
DEMO-05, S1. Demo mode is a separate contract. The demo runs with a deterministic seed, a visible "Demo" label, synthetic data, no network calls to real infrastructure, an in-memory store that never writes learner history, and a one-click reset that restores the first state without clearing browser storage by hand. A presenter must be able to repeat the scenario for the next class group. Fix. A mode=demo switch that selects the in-memory persistence adapter and the reset control; a test that runs the scenario, resets and runs again with identical results. Acceptance. Ten consecutive run-and-reset cycles pass without residue.
DEMO-06, S2. A visible release identifier and a freeze. The build shows its commit and date on screen so the presenter knows which build is open; a freeze on October 22 means only fixes tagged "demo blocker" merge afterwards. Acceptance. The identifier on the demo machine matches the tagged commit.
DEMO-07, S1. Offline and failure fallbacks. The demo must still work with no network (cached bundle, recorded tutor) and the presenter has a recorded video of the full run as the last resort. Fix. Record the video from the frozen build on the real host. Acceptance. The presenter has done a full offline rehearsal on the demo host.
DEMO-08, S2. Projector readability and accessibility. Instructions readable at the back of a room, status of each task visible, a visible reset, keyboard operation and sensible focus after dialogs. A count of views that render without a script error (43 of 47 in the audit's jsdom run [A]) is not a visual claim. Acceptance. Screenshots or a recording of the decisive views on the demo screen size; reviewed by a person, not only by a test.
8.2 Day-by-day plan to the freeze
All dates are 2026. The plan assumes one builder, who is not yet named (Section 9.3); content review is performed by the RedEye lane (Section 7.4). Roger's plan covers A+ and Network+ for October 23 and the NCA track for the Nutanix trip; this plan keeps both October 23 tracks. It is a plan, not a commitment, and every day's exit has an acceptance test.
Date
	Day
	Work
	Exit test
 
	Oct 10
	Sat
	This analysis; Roger names host and builder
	Decisions logged
	Oct 11
	Sun
	PLAT-01 and PLAT-02 (import fix, checker, smoke); CI-01 gate fix
	Simulator boots in CI; High fixture fails the gate
	Oct 12
	Mon
	PLAT-03 to PLAT-05 (scoring); PLAT-04 parser
	1,598 of 1,598 questions parse; ordered tests pass
	Oct 13
	Tue
	PLAT-06, 07, 13 (manifests); BRAND-01
	Three new tracks appear in the catalog
	Oct 14
	Wed
	DUP-01 host adapters begin; SIM-01 fixtures for 10 scenarios
	Matrix rows for 10 scenarios green
	Oct 15
	Thu
	RGT-01, 02, 04 (license, README, disclaimer); Network+ and A+ lesson drafts
	Disclaimer test passes
	Oct 16
	Fri
	TE engine with gateway fixture; Network+ items 1 to 13 and A+ items 1 to 12 written
	Gateway scenario passes the three sequences
	Oct 17
	Sat
	Network+ items 14 to 25 and A+ items 13 to 24 written; computed-key check for subnetting
	All 49 items have provenance records
	Oct 18
	Sun
	RedEye lane run on 49 items and the four lessons (one per A+ core, two Network+); self-test; sample inspection by whoever Roger designates
	Review outcomes recorded
	Oct 19
	Mon
	Demo mode (DEMO-05); persistence PLAT-09, 10
	Ten run-and-reset cycles pass
	Oct 20
	Tue
	Packaging for the named host (PKG) and clean-install test
	Launch from outside the repository
	Oct 21
	Wed
	Tutor gate (8.5) with recorded example; video recording
	24-prompt test and recording done
	Oct 22
	Thu
	Freeze; full rehearsal on the demo host; fallback rehearsal
	Rehearsal log signed by Roger
	Oct 23
	Fri
	Demo day; verify release identifier and offline state in the morning
	Checklist in Appendix C
	After the demo, the NCA pilot (40 items, 14 objectives) is finished for Roger's trip to Nutanix headquarters on October 25 to 28 [S]. Roger's own words were that the Nutanix option is for when he goes to California [S]. The NCA freeze date depends on the travel day and departure time, which are not verified here. The hotel stay is October 25 to 28, so travel is no later than October 25, and the freeze is set relative to the verified itinerary (decision D6). Because the freeze may fall close to the Network+ demo, the NCA content work has to run in parallel with the Network+ work and not after it, and building and running the review lane is the constraint. This is the largest schedule risk in the document.
8.3 Capacity: what is measured and what is not
Both A+ and Network+ are in scope for October 23, and the NCA pilot follows for the trip. The October 23 work is 24 A+ items, 25 Network+ items, four lessons, the gateway scenario, the terminal engine, the platform fixes in the plan and the 44-scenario matrix; the NCA work is 40 items and a corrected bank. I have not measured the team's capacity, because the builder and reviewer are not named (D2) and no velocity data exists. I therefore do not say the work fits or does not fit. The honest statement is an uncertainty range to be replaced by a measurement: the builder times PLAT-01, PLAT-02 and CI-01 on October 11 and PLAT-03 to PLAT-05 on October 12 and reports hours per fix, and the builder times the first RedEye run on ten items. From those numbers the plan is re-forecast on October 13. Only Roger changes scope or priority; if the forecast shows a gap, the gap is reported to him with the options, and nothing is dropped by default. Until then the sequencing rule is dependency order, not priority: boot fix, scoring, manifests, then content and engines.
8.4 Scenario coverage matrix (all-content demo mode)
Every one of the 44 existing scenarios and each new scenario gets one row, generated from the scenario manifest so it cannot drift from the code: scenario ID, track and objective, initial fixture, start route, supported actions, validators, expected negative result, expected positive result, reset behavior and supported hosts. Each row runs three sequences: clean seed (must be incomplete), wrong or partial (must be incomplete with the missing condition named), intended sequence (must complete). After reset the row is incomplete again. A route whose render function throws is reported as broken even if its scenario passes on seed state. An asynchronous command handler must return text, not a promise object. The matrix is the acceptance test for SIM-01 to SIM-05 and for every new scenario. Acceptance. The generated report shows 44 of 44 and the new rows green, run separately for the browser and the desktop host.
8.5 Tutor gate (24 prompts plus failure cases)
A recorded tutor example is the default for October 23. A live tutor is allowed only if every item below passes on the demo host. The gate uses 24 prompts: 12 answerable from approved lesson text (the answer must come from that text and cite the lesson), 6 unsupported or version-conflict questions (the tutor must say it does not know or point to the vendor source), and 6 injection or secret-extraction attempts (asking for the answer key, the system prompt, the bank or the API key; the tutor must refuse and must not reveal any). Failure cases: offline (clear message and recorded fallback), provider timeout (message within a stated limit), rate limit or spend cap reached (message, not a crash). The tutor never marks a task complete (the deterministic checker does) and never reveals a key during an assessment. Acceptance. 24 of 24 behave as stated; a failure disables the live tutor for the demo.
9. Gap register, risks and decisions
9.1 Register
Owner roles: Roger (decision), Builder, Author, RedEye lane (content review). Names are not yet assigned. "Oct 22" marks demo-critical items.
ID
	Finding
	Sev
	Owner
	Due
	Closure evidence
 
	PLAT-01
	Simulator import broken
	S1
	Builder
	Oct 11
	Smoke boots
	PLAT-02
	No import check or smoke
	S1
	Builder
	Oct 11
	Red-then-green CI
	PLAT-03
	Ordering graded unordered
	S1
	Builder
	Oct 12
	Scoring tests
	PLAT-04
	Ten "B and D" keys dropped
	S1
	Builder
	Oct 12
	1,598 of 1,598
	PLAT-05
	Retry double-counts
	S2
	Builder
	Oct 12
	Attempt log tests
	PLAT-06
	Exam code collision
	S1
	Builder
	Oct 13
	Manifest tests
	PLAT-07
	Vendor and level defaults
	S2
	Builder
	Oct 13
	Manifest tests
	PLAT-08
	Lint semantic blind spots
	S2
	Builder, RedEye lane
	Oct 17
	Rule fixtures
	PLAT-09
	Handlers fake effects
	S1
	Builder
	Oct 19
	Bridge contract tests
	PLAT-10
	Persistence never called
	S1
	Builder
	Oct 19
	Resume test
	PLAT-11
	Single-version shared store
	S2
	Builder
	Oct 19
	Migration test
	PLAT-12
	Errata limits
	S2
	Builder, RedEye lane
	Oct 17
	R3 test
	PLAT-13
	Hardcoded blueprint
	S1
	Builder
	Oct 13
	14-objective NCA blueprint
	PLAT-14
	Duplicate stems
	S3
	Builder
	Oct 24
	Fixture
	PLAT-15
	Service worker update risk
	S2
	Builder
	Oct 20
	Real-browser test (PWA-01)
	CNT-01
	Answer-key bias
	S2
	Author
	Oct 17
	No letter over 40 percent
	CNT-NCA-01 to 09
	NCA gaps (5.6.4)
	S1 to S3
	Author, RedEye lane
	Oct 23
	Item inventory, citations
	CNT-NET-01 to 06
	Network+ gaps (5.5)
	S1 to S3
	Author, RedEye lane
	Oct 18
	Provenance records
	CNT-A+ (Core 1 and 2)
	A+ Core 1 and 2 gap tables (5.2, 5.3)
	S1 to S3
	Author, RedEye lane
	Oct 22 for the 24-item cut and lessons; remaining objectives scheduled after the Oct 13 re-forecast
	Provenance records
	SIM-06 to SIM-09
	Broken views and CLI/state defects (Appendix F)
	S1 to S2
	Builder
	Oct 12
	Per-view render test
	NET-01 to NET-12
	.NET audit findings (Appendix F)
	S1 to S3
	Builder
	per Appendix F
	Per-finding test
	SIM-01 to SIM-05
	Scenario validity
	S1 to S2
	Builder
	Oct 22
	44 of 44 matrix
	CI-01
	Vuln gate fails open
	S1
	Builder
	Oct 11
	Fixture exits non-zero
	CI-02
	Coverage not enforced
	S2
	Builder
	Oct 24
	Threshold test
	CI-03
	Pages has no smoke
	S1
	Builder
	Oct 11
	PLAT-02
	CI-04
	Windows, Linux and macOS host tests
	S1
	Builder
	Oct 22 for the selected hosts
	Matrix cells
	CI-05
	Twelve Dependabot PRs
	S3
	Builder
	Oct 22
	Triage list
	PKG-01 to 06
	Packaging findings
	S1 to S2
	Builder
	Oct 20
	Clean-install test
	BRAND-01
	Footer hardcoded to Nutanix
	S2
	Builder
	Oct 13
	PDF text test
	PWA-01
	Service worker, icons
	S2
	Builder
	Oct 20
	Browser test
	DEP-01
	CefGlue per-host status
	S3
	Builder, Roger
	Oct 22
	Matrix cells
	DUP-01
	Two simulator copies
	S1
	Builder
	Oct 19
	diff check
	XPLAT-01 to 04
	Host matrix, adapters, browsers
	S1 to S2
	Builder
	Oct 22
	Matrix
	RGT-01 to 09, RGT-11
	Rights and policy
	S1 to S3
	Roger, Author
	Oct 15
	Per finding
	DEMO-01 to 08
	Demo readiness
	S1 to S2
	Builder, Roger
	Oct 22
	Rehearsal log
	Zero findings are unowned. If an owner does not exist yet (the builder), that is decision D2 below, and it is the first thing that blocks the register.
9.2 Top risks
1. Review lane reliability. 89 items need passing review logs. Roger's direction removes the human-reviewer bottleneck, which shifts the risk to the lane's accuracy and to building it in time. Mitigation: the seeded-defect self-test (RES-8) and release only items with passing logs.
2. NCA date compression (Section 8.2). Mitigation: parallel start, confirm the travel day and time.
3. Unknown demo host. Every host test is waiting. Mitigation: decision D1.
4. Rights decisions (PDFs, license holder, look-alike UI). Mitigation: D4, D5 and D7, and the demo uses only original content.
5. A live tutor in front of students. Mitigation: recorded default and the 24-prompt gate.
6. Late audit findings. Mitigation: Appendix F intake rule.
9.3 Decisions needed from Roger
These gate implementation, not this analysis. D1: the demo host (device, operating system, browser, screen, network). D2: who is the builder, and whether anyone other than the RedEye lane inspects a sample of its results. D3: the AI provider and a spend cap, or a recorded tutor only. D4: the copyright holder name for the LICENSE. D5: whether the two vendor PDFs stay in the public repository. D6: the travel day and departure time for the Nutanix trip (hotel is October 25 to 28), which sets the NCA freeze. D7: whether the Prism-style look-alike simulator needs a documented vendor-permission decision before a public showing (RGT-07).
Appendix A. Sources
Official and vendor sources, fetched October 10, 2026:
* Nutanix NCA exam blueprint: https://www.nutanix.com/content/dam/nutanix/en/resources/datasheets/ds-ebg-nca.pdf
* CompTIA A+ 220-1201 objectives: https://assets.ctfassets.net/82ripq7fjls2/1oSdlyujpaX3GrM0rir6Ge/91afb2be72785281e8fb4c0d9a70c6f4/CompTIA-A-220-1201-Exam-Objectives-3.0.pdf
* CompTIA A+ 220-1202 objectives: https://assets.ctfassets.net/82ripq7fjls2/6I8WL66IBa1AUovioDGrnM/f74a7eca336fd4e4c8e723a1f893086d/CompTIA-A-220-1202-Exam-Objectives-3.0.pdf
* CompTIA Network+ N10-009 objectives: https://comptiacdn.azureedge.net/webcontent/docs/default-source/exam-objectives/comptia-network-n10-009-exam-objectives-%284-0%29-%281%29.pdf
* CompTIA A+ page: https://www.comptia.org/en-us/certifications/a/core-1-and-2-v15/
* CompTIA Network+ page: https://www.comptia.org/en-us/certifications/network/
* CompTIA unauthorized training materials policy: https://www.comptia.org/en-us/resources/test-policies/unauthorized-training-materials/
* Nutanix Community, NCA 7.5 and NCP-MCI 7.5 announcement [S]: https://next.nutanix.com/education-blog-153/level-up-with-the-new-nca-7-5-and-ncp-mci-7-5-exams-45673?postid=79175
* Nutanix Community, NCA 7.5 beta program [S]: https://next.nutanix.com/education-blog-153/join-the-nca-7-5-beta-exam-program-45611?tid=45611
Repository: https://github.com/TheArchitectit/radicaltrainingplatform at commit 904106ad388c0d48add662ddcd02153ff5f85537. Roger's messages: WhatsApp, October 10, 2026, 12:04 to 12:14 CDT (recovered from the message record). Runtime audit evidence [A]: findings from an audit of the same commit on October 10, 2026; tested by that audit and not re-run by me.
Appendix B. Commands and statistics
Key distribution over 1,558 single-token answer lines: B 769, A 593, C 164, D 32. NCA files: 90 of 130 single keys are B. Files where one letter dominates: NCP-AI-Part1 80 of 80 A, NCM-MCI-Part1 79 A, NCP-CI-Part2 79 A, NCP-AI-Part2 79 A, NCP-US-Part2-D4 77 A. Question headers 1,598; parseable 1,588; dropped 10 (NCP-AI-Part4 questions 61 to 70). Web imports scanned: 307, unresolved: 1. Scenarios: 44 (21 NCM-MCI, 7 NCP-AI, 7 NCP-CI, 9 NCP-US); validators 78; literal true 27. Open Dependabot pull requests: 8, 10, 11, 12, 13, 17, 18, 21, 22, 24, 25, 26.
Commands to reproduce, from a clone at the pinned commit: git rev-parse HEAD (expect 904106a), grep -n "ConfirmDialog" RadicalTrainingPlatform.Web/js/views/pe-reports.js, sed -n 46p packaging/linux/build-appimage.sh, sed -n 78p packaging/macos/build-dmg.sh, shellcheck packaging/*/*.sh, grep -n "exit 1" packaging/linux/build-appimage.sh, grep -n "Nutanix Certification" -r RadicalTrainingPlatform.*/ExamPdfExporter.cs, ls LICENSE (expect no such file).
Appendix C. Acceptance checklist for the morning of October 23
Build identifier matches the tag; the demo host launches the bundle from outside the repository; offline mode loads the lesson; the gateway scenario completes and resets; the disclaimer is visible on the track page and in the script; the recorded tutor example plays; the fallback video is on the device; no key or vendor image is in the bundle; Roger has read the 25 Demo items and lesson.
Appendix F. Findings from the .NET and web-runtime audits, and the intake rule for later findings
This appendix folds in the .NET evidence section (findings NET-01 to NET-12) and the web simulator runtime findings. Each entry has the evidence tag, the files, the fix and the acceptance criterion. Where a finding repeats one already specified, the entry points to it and states only what is new. The audit tested by running code (a jsdom harness on Node 22 for the Web tree, scratch probes for the .NET code, and the real scanner for the vulnerability gate) and by reading source; it ran no real browser and no native embedded-browser session [A]. I did not re-run these.
F.1 Corrections to numbers elsewhere in this document
The Web tree has 49 view files, of which two are infrastructure (BaseView.js and PlaceholderView.js, the latter imported nowhere), so there are 47 routable views and 47 registered routes. In the audit's jsdom run, 43 of 47 render and run their post-render step; four do not: pe-reports.js (the missing import, PLAT-01), pc-insights.js, pe-capacity.js and ci-networking.js [A]. The vulnerability gate lines are 72 and 73 for the loop and 82 for the advisory field in my clone [V]; earlier text citing other line numbers is superseded. Ten NCP-AI-Part4 keys, 16 of 44 auto-completing scenarios, 27 of 78 literal-true validators and the other counts match the audit.
F.2 .NET findings
NET-01, High [V][A]. Vulnerability gate fails open. Same as CI-01. New detail: the audit reproduced the failure with the real scanner on an isolated project that referenced a package with a known High advisory outside the repository; the gate printed PASS and exited 0 [A]. Also covered: field-name mismatch (advisoryurl versus advisoryUrl), and the gate list omits Desktop.Tests and the Legacy WinForms project. Fix: as CI-01, plus add the omitted projects after the parser is correct; add saved clean and malformed scanner reports as fixtures so a future SDK format change is caught without network access. Acceptance: the High fixture, a transitive-only fixture, a multi-framework fixture, a malformed fixture and a scanner-failure fixture each give the expected exit code.
NET-02, High [V][A]. Ordering graded as unordered. Same as PLAT-03. New detail: NCA gap-fill Q17 asks for an LCM sequence with key D,C,B,A, and Q16, Q18 and Q19 also require order; Models/Question.cs line 12 treats every multi-letter key as multi-select, ExamSessionViewModel.cs line 16 stores answers in a HashSet, and lines 63, 64 and 104 sort both sides [A]. The audit's probe showed the reverse sequence for Q17 grades correct. Acceptance: a test that the reverse of the Q17 key is wrong.
NET-03, Medium [A]. A retried question can be in both outcome sets. Same as PLAT-05. New detail: the audit's probe (answer correctly, jump back, answer incorrectly) gave CorrectCount 1, WrongCount 1 and Total 1; the code paths are ExamSessionViewModel.cs lines 99 to 126, 129 to 147 and 182 to 194 [A]. The policy must be chosen first: first attempt, latest attempt or all attempts. My recommendation is a first-attempt immutable result plus a latest-attempt state, with the attempt log from PLAT-05. This is a product decision recorded for Roger as D8 below. Acceptance: tests for both retry directions, skips, revisits without submission, and the invariant that unique answered items never exceed the total.
NET-04, Medium [A]. Bridge effect replies report success without the effect. Same as PLAT-09, with the audit's evidence: in CefBridge.cs, submit_answer logs and returns recorded=true (lines 289 to 299), get-stats always reports an inactive session (334 to 336), reset_session returns reset=true without deleting (338 to 342), export returns an empty CSV (345 to 349), import counts newline splits as imported rows (351 to 356), and set_setting logs and returns ok=true while get_settings returns defaults (369 to 376) [A]. The comment at lines 247 to 249 says stats come from persisted sessions, but lines 254 to 257 hardcode the learner fields. The existing test only checks that the total question count exceeds 1,000, so it passes with fake history. Fix and acceptance: as PLAT-09; unsupported operations return an explicit unsupported result.
NET-05, Medium [A]. Storage engine exists; desktop study resumption does not. Same as PLAT-10. New detail: ExamSessionViewModel has no store, snapshot or restore path, and MainWindow never saves it [A]. Track two tickets: the storage engine (done and tested) and desktop resumption (open). Acceptance: close and reopen restores identity, answers, counts and current question; also test switching modes, moving through Stats and Blueprint, version changes, and missing or corrupt files.
NET-06, Medium [A]. Sidebar navigation to Stats or Blueprint discards the study session. MainWindow.ReleaseCurrentView clears _session at line 129; returning to the exam creates a new view model (lines 140 to 155). This is a deterministic source path, not separately demonstrated in a UI run [A]. Fix: keep study state independent of the visible content and clear it only on an explicit reset or new session; unsubscribe the session change handler on release as ShowReviewSession does. Acceptance: answer a question, open Stats and Blueprint, return, and compare identity, answers, counts and current question.
NET-07, Medium [A]. A disposed simulator control is cached and reused. MainWindow.axaml.cs lines 127 and 128 dispose the lab control without clearing _labView; line 364 reuses it; LabSimulatorView.OnLoaded line 54 refuses to start when disposed [A]. The native second-visit blank screen was not observed because no display server was available [A]. Fix: choose one ownership policy (keep alive, or dispose and clear the cache) and add a window-close hook; do not call native runtime shutdown or initialize without checking the wrapper's ownership. Acceptance: on each desktop host, open the simulator, leave, return and complete a scenario; this is a closure test for the host matrix (XPLAT-01).
NET-08, Medium [A]. EXAM:number identifiers collide. The bridge's question lookup (CefBridge.cs lines 302 to 320) returns the first numeric match, while QuestionParser.cs lines 193 to 198 keeps each file's own numbering and LoadAllExams (lines 309 to 321) does not renumber. Numeric collisions per exam: NCA-75 40 of 140 repeated, NCM-MCI 80 of 360, NCP-US 80 of 400, NCP-AI 80 of 325, NCP-CI 80 of 363 [A]. This is the same hazard as C-08 and PLAT-06. Fix: an immutable source-aware ID (exam, source file, local number, revision) in the manifest; display ordinals separate; compatibility handling if anything stored EXAM:number. Acceptance: two Q1 items from two files of one exam return distinct stems.
NET-09, Low [A]. The sidebar streak shows the correct count. MainWindow.axaml.cs line 179 formats CorrectCount while VM.Streak exists; the audit's headless probe saw 1 in the text block when the view-model streak was 0 [A]. Fix: use Streak and raise its change notification, including on skip. Acceptance: a test that inspects the actual text block after a miss.
NET-10, Low to Medium [A]. Review mode breaks PDF export. Review sets the exam code to a decorated label ("CODE (Review)"), and the study guide export looks that up in the bank dictionary and returns null [A]. This is the same hazard as BRAND-01 and PLAT-06 on the export path. Fix: separate canonical exam identity from the mode label. Acceptance: export works from review mode, or review shows an explicit supported alternative.
NET-11, Medium [A]. The build output is not a tested end-user bundle. The Desktop output has 65 files under the simulator web folder and no exam markdown or errata.json; tests find banks through the checkout [A]. The GitHub releases list was empty at audit time [A]. The legacy WinForms bridge registers only ready and log handlers, and unknown messages get no error [A]. The CEF host sets NoSandbox=true (LabSimulatorView.cs line 118); the audit records it without claiming an exploit and recommends reviewing allowed navigation, external links and exposed bridge capabilities before release [A]. This is the same as PKG-05 and PKG-06, with these additions: content-copy declarations in Desktop.csproj; unknown bridge messages return an explicit error; a sandbox and navigation review item, SEC-01 (S2), owned by the builder with acceptance "the review is written and each exposed bridge capability is listed and justified". Acceptance: clean-directory launch from a neutral working directory finds banks and errata.
NET-12, Hardening [A]. Session saves are not atomic. SessionStore.cs lines 48 to 67 write directly to the destination and there is no temporary-file replacement, checksum, backup or corrupt-file handling; IDs are checked against a denylist, not an allowed format. This is a source risk, not a reproduced loss [A]. Fix: write to a temporary file then replace; add a version envelope and checksum; recover from a backup; use opaque generated IDs. Acceptance: kill-during-write and truncated-file tests recover the previous valid save.
F.3 Web runtime findings added by the audit
SIM-06, High [A]. Two views throw after render. pc-insights.js (line 84) and pe-capacity.js (lines 100, 109, 164) use this.root, which nothing assigns and BaseView does not define; every visit throws after render and the tabs never wire up. They back scenarios mci-insights-01 and mci-capacity-01, which are among the 16 that auto-complete, so the failure hides behind a green result [A]. Fix: define the root in BaseView or use the element the router passes; add a per-view render and post-render test. Acceptance: 47 of 47 views pass the jsdom harness and the real-browser smoke from PLAT-02.
SIM-07, High [A]. ci-networking.js calls a method that does not exist. Line 169 calls state.get('nc2_clusters', uuid), but StateEngine has no get; the accessor is getById(collection, id) [A]. Fix: use getById. Acceptance: the NC2 networking panel renders for a seeded cluster in the harness.
SIM-08, Medium [A]. The CLI alert command returns a Promise. CLIService.#alertCmd is async (line 665) while execute() returns its value synchronously; CLITerminal.js line 97 does not await, so the source path would render "[object Promise]" for alert list and alert resolve, which breaks the cli-03 hint [A]. Fix: await in the terminal, or make the command synchronous. Acceptance: a real-browser terminal test that alert list and alert resolve finish with expected rendered text and never display a Promise object; separately verify the service return contract. This is the "async CLI handler should resolve to text" row in Section 8.4.
SIM-09, Medium to Low [A]. Audit-log persistence lags by one write; router and render robustness. StateEngine persists before it logs the audit entry and the entry is not persisted until the next write, so the last action before closing the tab is lost and ops-01 is affected [A]. The router has no guard against overlapping asynchronous renders (code reading only) and scenarios do not reset state on start. Fix: log before persist; guard the render with a token; reset scenario state on start (this is the SIM-04 fixture rule). Acceptance: a test that the persisted copy contains the audit entry immediately after a create; a test that two quick route changes show one view.
Additional low-severity closure tasks. The builder shall replace whole-list initial scenario-validator error handling with per-objective diagnostics, so one throwing predicate cannot suppress all remaining checks. Acceptance: a fixture with one throwing predicate still displays every other objective and marks the failed predicate as an error, never complete. The unused PlaceholderView shall either be removed with its references or given a documented intended route; a dead-code/import check confirms the choice. Breadcrumb labels shall come from a route-label registry instead of naive capitalization; a route smoke test checks readable labels for NC2 and all selected routes. These tasks are in the same simulator repair sequence and are not parked for an unrelated future change.
Service worker. The audit notes sw.js precaches 62 explicit asset paths under the fixed cache name labsim-v1 and that its update behavior needs a real-browser test; I treat it as a risk, not a proven failure (PWA-01). The audit did not check whether the live Pages site is serving a broken build [A], so I make no claim about it; the first step of the Oct 11 work is to fetch the deployed site and record what it serves.
F.4 Decision added
D8: the grading policy for retried questions (first attempt, latest attempt or all attempts). The planning default proposed here is an immutable first-attempt result plus a separate latest-attempt state and full attempt log. This is a proposal, not an approved change to production grading. Resolve the product choice before committing the NET-03/PLAT-05 behavior; independent test and schema preparation can proceed.
F.5 Intake rule for any later finding
When anyone sends a new finding, it gets an ID, a severity, an evidence tag, a file, a fix, an acceptance criterion and an owner in Section 9.1 within one working day, or it is recorded as a decision for Roger. A finding that contradicts this document replaces the conflicting text and is listed in Section 3. A finding is never closed by the text alone; it closes on its acceptance evidence.