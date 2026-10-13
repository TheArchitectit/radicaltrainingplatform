# 🎯 Nutanix Certification Study Tool

A cross-platform certification study platform: a **.NET 10 / Avalonia desktop app**, a
**static HTML+JS PWA**, and a shared `net10.0` Core library with no UI dependencies. It
covers Nutanix certification exams plus a beginner track spanning CompTIA A+/Network+,
Microsoft Azure Administrator (AZ-104), and AWS Certified Solutions Architect -
Associate (SAA-C03), with a synthwave-themed UI, exam blueprint
coverage tracking, and a lab simulator.

![.NET 10.0](https://img.shields.io/badge/.NET-10.0-blue)
![License](https://img.shields.io/badge/License-BSD%203--Clause-green)
![Released items](https://img.shields.io/badge/Released%20items-189-orange)
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
| Released items | **189** — A+ Core 1: 16 · A+ Core 2: 8 · Network+: 25 · NCA 7.5: 40 · Azure AZ-104: 50 · AWS SAA-C03: 50 |
| Release state | `draft-preview` — draft packs for the beginner preview |

**These are draft packs, not released study material.** No item carries a human source
review date, and the scored-item gate fails closed: every released item's review log
records `verdict: return` because the key-vs-source review stage has no provider
configured. Read the counts as *what compiles*, not as *what is verified*.

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

- **1,458 practice questions** — comprehensive coverage across all blueprint domains
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
- **100% validated** — Every answer verified through 2 independent validation passes (LLM reasoning + solo web/knowledge review)

## 🚀 Quick Start

### Build From Source

**No pre-built binary is published.** This repository has no releases and no tags, and no packaged
build is committed here, so there is nothing to download yet. Build from source until a release is cut.

**Prerequisites:** [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
(Linux, macOS, or Windows). The Avalonia desktop app is cross-platform; the Legacy
WinForms project is Windows-only and is excluded from the Linux build.

```bash
dotnet build RadicalTrainingPlatform.sln          # Core + Desktop + Desktop.Tests
dotnet run --project RadicalTrainingPlatform.Desktop
```

The Web PWA is standalone — no .NET dependency, no npm dependency. Serve the directory
with any static server and open `index.html`:

```bash
python3 -m http.server -d RadicalTrainingPlatform.Web 8080
```

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

All 1,458 questions have been through **multiple validation passes**:

1. **LLM Answer Validation** — 8 independent agents answered every question; disagreements researched and resolved
2. **Blueprint Gap Analysis** — Official exam blueprints analyzed; 178 gap-fill questions generated to achieve zero coverage gaps
3. **Direct First-Pass Validation** — Every question read and verified; 7 corrections applied (GGUF→GPTQ/AWQ, port fixes, answer key fixes)
4. **Solo Second-Pass Validation** — All 1,458 questions re-validated through web research and knowledge verification; zero additional issues found

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

Validation logs are in the `validation/` directory.

## 🎨 Screenshots

The app features a synthwave/cyberpunk aesthetic with:
- Deep space background (#0B0B1A)
- Neon magenta accents (#FF2D95)
- Neon cyan highlights (#00F0FF)
- Animated progress bars with glow effects

## ⚠️ Disclaimer

This tool is for **study purposes only**. Questions are generated based on publicly available exam blueprints, Nutanix documentation, and community resources. This is not affiliated with or endorsed by Nutanix, Inc. Actual certification exam questions will differ.

## 📄 License

**Proposed: BSD 3-Clause — not yet in effect.** There is no `LICENSE` file at
the repository root yet, so nothing here is licensed by it today.

The text is prepared and waiting on one owner confirmation, because a license
names a legal instrument. See [docs/LICENSE-DECISION.md](docs/LICENSE-DECISION.md)
for the proposed text, what it would and would not cover, and what is left to
confirm. The file lands at the root when that confirmation is given.

Note that a code license covers the **code**. It does not cover the vendor
manuals under `docs/` or any third-party material — those are separate rights
questions, and the decision record says so explicitly.

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
