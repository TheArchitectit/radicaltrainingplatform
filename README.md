# 🎯 RadicalTrainingPlatform — Certification Study Platform

A local-first, cross-platform certification study platform. One shared `net10.0` Core
library with no UI dependencies, two shells over it — a **.NET 10 / Avalonia desktop app**
and a **static HTML+JS PWA** — plus a legacy WinForms client kept for reference.

It started as a Nutanix certification tool and now covers a beginner track across CompTIA
A+/Network+, Microsoft Azure Administrator (AZ-104) and AWS Solutions Architect – Associate
(SAA-C03), alongside the Nutanix exams. Synthwave-themed UI, exam blueprint coverage
tracking, and a lab simulator.

![.NET 10.0](https://img.shields.io/badge/.NET-10.0-blue)
![License](https://img.shields.io/badge/License-BSD%203--Clause-green)
![Released items](https://img.shields.io/badge/Released%20items-1199-orange)
![Status](https://img.shields.io/badge/Status-Draft%20preview-yellow)
[![Sponsor](https://img.shields.io/badge/Sponsor-TheArchitectit-FF69B4?style=flat&logo=github-sponsors)](https://github.com/sponsors/TheArchitectit)

## 📦 What ships today

The PWA compiles its content from `content/` into a bundle at
`RadicalTrainingPlatform.Web/js/study-content.js`. Those are the CI-generated counts, and
they are the numbers this README is accountable to:

| | |
|---|---|
| Exam manifests | **6** — CompTIA A+ Core 1 (220-1201), A+ Core 2 (220-1202), Network+ (N10-009), Nutanix Certified Associate 7.5, Microsoft Azure Administrator (AZ-104), AWS Certified Solutions Architect - Associate (SAA-C03) |
| Tracks | **5** — `track-aplus`, `track-netplus`, `track-nca`, `track-azure`, `track-aws` |
| Released items | **1199** — A+ Core 1: 266 · A+ Core 2: 288 · Network+: 375 · NCA 7.5: 164 · Azure AZ-104: 51 · AWS SAA-C03: 55 |
| Release state | `draft-preview` — draft packs for the beginner preview |

**These are draft packs, not verified study material.** No item carries a human source
review date, and the scored-item gate fails closed: every released item's review log
records `verdict: return` because the key-vs-source review stage has no provider
configured. Read the counts as *what compiles*, not as *what is verified*. Practising
with them is a decision the owner made on 2026-11-04 — the items are usable as practice
material, and the app says so in those words rather than implying a review that did not
happen.

The **legacy question banks** at the repository root (`NCP-US-*.md`, `NCP-CI-*.md`,
`NCP-AI-*.md`, `NCM-MCI-*.md`, `NCA-75-Part*.md`) are a separate, larger corpus that the
Desktop and Legacy apps parse directly. They are **not** part of the PWA bundle.

## 📋 Supported Certifications

The legacy banks cover the Nutanix exam set below. The PWA additionally ships the
beginner CompTIA A+/Network+ track and the AZ-104 and SAA-C03 tracks above. The AZ-104
and SAA-C03 packs are independent study material and are not affiliated with Microsoft or
Amazon Web Services; each pack's objective structure was derived from that vendor's
public study guide by a tool, and no human source review has been performed on either —
see [VENDOR-PACK-RIGHTS-AZ-104.md](docs/VENDOR-PACK-RIGHTS-AZ-104.md) and
[VENDOR-PACK-RIGHTS-AWS-SAA.md](docs/VENDOR-PACK-RIGHTS-AWS-SAA.md).

| Exam | Questions | Format | Duration |
|------|-----------|--------|----------|
| **NCP-US 6.10** — Unified Storage | 400 | 75 MCQ, pass 3000/6000 | 120 min |
| **NCP-CI 6.10** — Cloud Integration | 363 | 75 MCQ | 120 min |
| **NCP-AI 6.10** — AI Infrastructure | 335 | 75 MCQ | 120 min |
| **NCM-MCI 6.10** — Multicloud Infrastructure (Master) | 360 | 16-20 live lab scenarios | 180 min |

## ✨ Features

- **1,458 legacy Nutanix questions** (NCP-US, NCP-CI, NCP-AI, NCM-MCI) — parsed by the
  desktop and legacy apps, not part of the PWA bundle — plus **1,199 PWA items** across
  A+/Network+/NCA/AZ-104/SAA-C03, all `draft-preview`
- **Blueprint coverage panel** — toggle with `B` to see which exam objectives each question covers
- **Mixed question formats** — Standard MCQ, multi-select ("Select TWO"), and ordering/sequence questions
- **Synthwave-themed GUI** — Dark neon aesthetic with animated progress bars
- **Explain This Question** panel — Every question has contextual explanations with:
  - Detailed reasoning for the correct answer
  - Links to relevant Nutanix KB articles
  - General documentation resources
  - Scrollable reference content
- **Keyboard shortcuts** — `1-5` select answers, `Enter` submit, `N`/`P` navigate, `E` toggle explain, `B` toggle blueprint
- **Score tracking** — Real-time accuracy stats per exam
- **Reviewed content** — the legacy Nutanix banks carry the validation history described in [Validation](#validation); the 1199 PWA items are `draft-preview` with no human review date

## 🚀 Quick Start

### Build From Source

**No pre-built binary is published.** This repository has no releases and no tags, and no packaged
build is committed here, so there is nothing to download yet. Build from source until a release is cut.

**Prerequisites:** [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
(Linux, macOS, or Windows). The Avalonia desktop app is cross-platform; the Legacy
WinForms project is Windows-only, so on Linux and macOS the solution needs one extra
flag (below) — the desktop app itself never does.

```bash
# The desktop app, on every platform:
dotnet build RadicalTrainingPlatform.Desktop
dotnet run --project RadicalTrainingPlatform.Desktop

# The whole solution (Core + Desktop + both test projects + Legacy) — Linux/macOS:
dotnet build RadicalTrainingPlatform.sln -p:EnableWindowsTargeting=true
# …and on Windows, without the flag:
dotnet build RadicalTrainingPlatform.sln
```

The Linux flag is needed only because `Legacy.WinForms` targets `net10.0-windows`; without
it the restore stops with `error NETSDK1100`. CI does the same thing differently — the
Linux job builds the four non-Windows projects one at a time, because it has no
Windows-targeting support at all.

The Web PWA is standalone — no .NET dependency, no npm dependency. Serve the directory
with any static server and open it in a browser:

```bash
python3 -m http.server -d RadicalTrainingPlatform.Web 8080     # Linux/macOS
python  -m http.server -d RadicalTrainingPlatform.Web 8080     # Windows, if installed
```

Then open <http://localhost:8080>. Two things to know, because both cost time when
discovered by accident: Python is a prerequisite for *this* path (any static server
works, and so does the desktop app instead), and opening `index.html` straight from the
file system does not work — ES modules and the service worker need an `http://` origin.

**Deploying it yourself?** The whole platform is a folder of files: no account, no
backend, no database, no network at runtime. [docs/SELF-HOST.md](docs/SELF-HOST.md) is
the deployment guide — shared machines, a file server, a USB stick with no
internet, and the one limitation worth knowing (progress belongs to a browser profile,
not a person).

To create a self-contained desktop publish (substitute `linux-x64` or `osx-arm64`):

```bash
dotnet publish RadicalTrainingPlatform.Desktop -c Release -r linux-x64 --self-contained
```

Select a track, answer questions, and use the explain panel to study.

## 📁 Project Structure

```
├── RadicalTrainingPlatform.Core/               # net10.0 — no UI dependencies
│   ├── Models/                   # Question, AnswerOption, BlueprintObjective, ExamManifest
│   ├── Services/                 # QuestionParser, blueprint & reference services, ManifestLoader
│   ├── Infrastructure/           # IExamRepository, IFileProvider
│   ├── PdfExport/                # ExamPdfExporter (QuestPDF)
│   └── Abstractions/             # IQuestionParser, IBlueprintService, IReferenceService
│
├── RadicalTrainingPlatform.Desktop/            # Avalonia 12.0 — Linux/macOS/Windows
│   ├── Views/                    # ExamSelectorView, QuestionView, OptionCard, BlueprintView, StatsView
│   ├── Controls/                 # SynthwaveProgressBar, BlueprintCanvas
│   ├── LabSimulator/             # CefBridge, LabSimulatorView
│   └── Simulators/               # Lab simulator templates
│
├── RadicalTrainingPlatform.Web/                # static PWA — no .NET, no npm
│   ├── index.html, manifest.json, sw.js
│   ├── js/                       # app.js, core/, views/
│   └── css/
│
├── RadicalTrainingPlatform.Legacy.WinForms/    # net10.0-windows — preserved for reference
│   └── MainForm.cs               # the original 59K GDI+ synthwave UI
│
├── content/                      # manifests, lessons, question banks, provenance
├── NCP-US-Part1.md               # Unified Storage questions (Domains 1-2, 160 Q)
├── NCP-US-Part2-D3.md            # Unified Storage questions (Domain 3, 80 Q)
├── NCP-US-Part2-D4.md            # Unified Storage questions (Domain 4, 80 Q)
├── NCP-US-Part3-GapFill.md       # Unified Storage gap-fill questions (80 Q)
├── NCP-CI-Part[1-4].md           # Cloud Integration questions (80 Q each)
├── NCP-CI-Part5-GapFill.md       # Cloud Integration gap-fill questions (43 Q)
├── NCP-AI-Part[1-4].md           # AI Infrastructure questions (80 Q each)
├── NCP-AI-Part5-GapFill.md       # AI Infrastructure gap-fill questions (15 Q)
├── NCM-MCI-Part[1-4].md          # Multicloud Infrastructure questions (80 Q each)
├── NCM-MCI-Part5-GapFill.md      # Multicloud Infrastructure gap-fill questions (40 Q)
│
├── docs/                         # sprint plans, design records, release evidence
├── scripts/                      # content generators and gate scripts
├── tests/                        # e2e harnesses and gate fixtures
├── packaging/                    # Flatpak manifest and packaging manifests
└── README.md
```

## 📝 Question Format

Questions are stored in Markdown files with this structure:

```markdown
### Q1
What is the minimum number of FSVMs required for a Nutanix Files deployment?

A. 1
B. 2
C. 3
D. 4

**Answer: C**

Nutanix Files requires a minimum of 3 File Server VMs (FSVMs) for high availability...
```

Multi-select and ordering questions are also supported:

```markdown
### Q61 (Select TWO)
Which two components are required before deploying NC2 on AWS?

A. IAM roles
B. VPN gateway
C. Subnet configuration
D. On-premises Prism Central

**Answer: A, C**
```

## 🔍 Validation

The claims below describe the **legacy Nutanix banks** (1,458 items: NCP-US, NCP-CI,
NCP-AI and NCM-MCI — the four exams in the table above). They say nothing about the
1199 PWA items, which carry draft provenance and no human review date.

1. **LLM Answer Validation** — 8 independent agents answered every question; disagreements researched and resolved
2. **Blueprint Gap Analysis** — vendor exam blueprints analyzed; 178 gap-fill questions generated to close the coverage gaps that produced them
3. **Direct First-Pass Validation** — every question read and verified; 7 corrections applied (GGUF→GPTQ/AWQ, port fixes, answer key fixes)
4. **Solo Second-Pass Validation** — all 1,458 questions re-validated through web research and knowledge verification

These passes are **asserted history, not a gate**: no machine-checkable log backs them,
and the `validation/` directory this section used to point at has never been committed.
The evidence that does exist in-tree is narrower — [docs/DOC-REVIEW-REPORT.md](docs/DOC-REVIEW-REPORT.md)
reviews the disputed questions against the Nutanix guides, and [`errata.json`](errata.json)
records the 2 answer-key corrections that survived that review. Treat "validated" as
"reviewed once by the author", not "verified against a current vendor key" — and note
that no gate measures per-objective coverage either, so "zero coverage gaps" was true of
the blueprints as they were read in 2026-06 and is not maintained.

### Corrections Applied
| File | Question | Fix |
|------|----------|-----|
| NCP-AI-Part1 | Q69 | GGUF → GPTQ/AWQ (NAI supported formats) |
| NCP-AI-Part4 | Q26 | GGUF → GPTQ/AWQ |
| NCP-AI-Part4 | Q57 | TFLOPS value corrected |
| NCP-CI-Part5 | Q37 | NLB → NAT Gateway (outbound internet for NC2 guests) |
| NCP-CI-Part5 | Q37-Q42 | Answer key realigned after Q37 fix |
| NCM-MCI-Part2 | Q11 | A → D (SNMP trap = "Add Trap Receiver") |
| NCM-MCI-Part2 | Q40 | B → D (cluster stop is cluster-wide command) |

The 7 rows above are the in-file corrections. The 2 in [`errata.json`](errata.json) are
answer-key corrections applied at read time rather than in the bank text, so both places
have to be read to know the current key.

## 🎨 Screenshots

The app features a synthwave/cyberpunk aesthetic with:
- Deep space background (#0B0B1A)
- Neon magenta accents (#FF2D95)
- Neon cyan highlights (#00F0FF)
- Animated progress bars with glow effects

## ⚠️ Disclaimer

This tool is for **study purposes only**. Questions are generated based on publicly available exam blueprints, Nutanix documentation, and community resources. This is not affiliated with or endorsed by Nutanix, Inc. Actual certification exam questions will differ.

## 📄 License

BSD 3-Clause License — see [`LICENSE`](LICENSE) for the full text. It applies
to the code and to the original content written for this project. The decision
record in [docs/LICENSE-DECISION.md](docs/LICENSE-DECISION.md) explains what it
covers and, just as importantly, what it does not.

Note that a code license covers the **code**. It does not cover the vendor
manuals under `docs/` or any third-party material — those are separate rights
questions, and the decision record says so explicitly.

## 🗺️ Where this is going

This section is the roadmap, not a wish list. Every item below is tracked in-repo —
[`docs/GAP-ANALYSIS-2026-10-20.md`](docs/GAP-ANALYSIS-2026-10-20.md) holds the content
plan with per-objective targets, [`docs/CARRY-FORWARD.md`](docs/CARRY-FORWARD.md) holds
what is blocked and why, and [`docs/OPENSPEC-INDEX.md`](docs/OPENSPEC-INDEX.md) indexes
the change packages. Where a claim is a proposal rather than built work, it says so.

### The product definition the roadmap is measured against

Stated by the owner 2026-10-20 and enforced in code, not just intended:

- **Local-first.** A client on the student's own device. No server, no accounts, no sync,
  no telemetry, no hosting. `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource` and
  remote dynamic imports are statically banned from the PWA, and a runtime network spy
  asserts zero outbound calls during a full scenario walkthrough.
- **Linux and Windows.** macOS if it comes for free (it does, via Avalonia); not a target.
- **No identity collection.** A gate asserts no identity-collecting form field exists.
- **Out of scope:** teacher/class/cohort features, LMS/SCORM/LTI integration, cloud
  accounts, public distribution of content.

### Content: from draft packs to a drilled curriculum

The honest status today is `draft-preview` — 1,199 PWA items compile, but none carries a
human source review date. The roadmap replaces per-exam totals with **per-objective**
floors, because per-exam totals are what once let a 16-item pack claim 27 objectives.

| Target | What it means | State |
|---|---|---|
| **R1** | Every objective resolves to 1 released lesson (131/131) | **Met** — 63/131 → 131/131 on 2026-10-26; dangling lesson refs 13 → 0 |
| **R2** | Every objective has ≥3 released items (≥393 total) | **Met** — all 131 objectives cleared the floor; the bundle has since grown to 1,199 items |
| **R3** | ≥20 scenarios (one per section for CompTIA/NCA, one per vendor exam) | **Partial** — 51 shipped; 13 planned remain (see below) |
| **R4** | Non-empty `reviewDate` and non-`return` verdict per item | **Ruled out** — the owner decided 2026-11-04 that `draft-preview` items are usable by students, so "reviewed" is no longer a release condition. Labels that implied a completed review were corrected instead. |
| **R5** | No target met by duplicating an item | **Enforced** — identity and hygiene gates fail on duplicate IDs and constant-true validators |

**The 13 remaining scenarios are blocked on renderers, not on content.** The Ticket Lab
renderer's only knobs are `ip` / `gateway` / `dns` against a fixed five-test set, so it can
express network-addressing faults and nothing else — which cannot cover the OS, security
and procedures objectives that make up most of A+ Core 2. AZ-104 and AWS-SAA have no
route and no store collection to run on at all. Those gaps are recorded rather than
papered over with near-clones.

### Verification: what still blocks a "reviewed" label

The scored-item review gate fails closed by design — every released item's review log
records `verdict: return` because the key-vs-source review stage has no provider
configured. Three OpenSpec rows in [`docs/CARRY-FORWARD.md`](docs/CARRY-FORWARD.md) stay
blocked on that, and one on a human read:

- **S48-01 / S48-03** — RedEye model stage `blocked` (no provider configured). Unblocks
  with provider activation, which is an owner tripwire.
- **S48-02** — blueprint structure verified by tool 2026-11-22 against the manifest's
  `sourceUrl` (4/4 sections, 14/14 objective titles, versions match). Only the human
  attestation clause remains: SPEC-02 requires a person to have opened the source.
- **S48-04** — the companion guide was never opened, so no remaining sheet claim was
  re-checked. Needs a readable guide or the owner's sign-off.

### Platform and distribution

- **Avalonia desktop** — Windows, Linux, macOS from one codebase. CefGlue supplies the
  lab-simulator WebView on desktop; it is also what blocks mobile.
- **PWA** — the portable surface, and the intended path for mobile via a native WebView
  behind an `ILabSimulatorHost` abstraction. Today the simulator runs in an isolated CEF
  container.
- **Packaging** — Flatpak and AppImage manifests exist for Linux, a DMG script for macOS;
  clean-install verification is still open. Windows MSIX is not built.
- **Distribution stays a git checkout.** An npm package was evaluated and deliberately
  not taken: publishing a package whose every item is `draft` with no review date is a
  public distribution of unreviewed study material, which is what the labelling exists to
  prevent. The npm path can be revisited once the content targets and a review standard
  are settled — publishing is an owner decision, not an engineering one.

### Features proposed but not built

Recorded so they are not mistaken for shipped work: timed exam simulation, question
difficulty ratings and spaced repetition (SM-2), question flagging and bookmarking,
progress persistence beyond the session, and a responsive/accessibility pass to WCAG 2.1
AA down to 800px. The design record for each is in
[`docs/DESIGN-MATRIX-AND-ROADMAP.md`](docs/DESIGN-MATRIX-AND-ROADMAP.md); several of its
gaps (DI, logging, tests, .NET 10 CI) have since closed and the doc carries its own date.

### How the roadmap is kept honest

Every target above is backed by a gate with failing and passing fixtures, wired into
`tests/gates/run_freeze_chain.sh` and CI. `scripts/check-readme-counts.py` is why the
counts in this README cannot drift from the generated manifest — if the numbers here stop
matching the artifact, the build fails. That is deliberate: a README that overstates
what the code does is the failure mode this repository is built to prevent.

---

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- Timed exam simulation mode
- Question difficulty ratings
- Additional certification exams
- Getting the released packs past the scored-item review gate (see "What ships today")
- Packaging: clean-install verification for the AppImage, macOS DMG, and Flatpak builds

---

## ☕ Support This Project

If this project helps you, consider [sponsoring on GitHub](https://github.com/sponsors/TheArchitectit). Every donation goes straight back into the work — GPU hardware and cloud compute for AI development, API credits for the agents that build and test these projects, and keeping everything free and open source. As a solo architect shipping on nights and weekends, even a small monthly sponsor makes a real difference.

Help keep this project going — use a referral link below and both of us get credits!

| Service | Your Bonus | Details | Referral Code |
| --------- | ----------- | --------- | --------------- |
| [**Neuralwatt**](https://portal.neuralwatt.com/auth/register?ref=NW-ROGER-ET3Y) | $5 in credits | Refer a friend — when they use $25 in compute, you both earn $5 in credits | `NW-ROGER-ET3Y` |
| [**Synthetic**](https://synthetic.new/?referral=UAWqkKQQLFkzMkY) | $10 in credits | Subscribe → both get $10 credit | `UAWqkKQQLFkzMkY` |
| [**Ozore**](https://ozore.com/?ref=cwe4kdx0) | 50% off first month | AI-ready cloud — code **lundrog50** | `lundrog50` |

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-TheArchitectit-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/TheArchitectit)
