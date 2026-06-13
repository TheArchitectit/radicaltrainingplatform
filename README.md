# 🎯 Nutanix Certification Study Tool

A WinForms-based exam preparation tool for Nutanix certifications featuring **1,458 validated practice questions** across 4 exams, a synthwave-themed GUI, integrated exam blueprint coverage tracking, and a knowledge base with direct links to Nutanix documentation.

![.NET 8.0](https://img.shields.io/badge/.NET-8.0-blue)
![License](https://img.shields.io/badge/License-BSD%203--Clause-green)
![Questions](https://img.shields.io/badge/Questions-1%2C458-orange)
![Status](https://img.shields.io/badge/Status-Alpha-yellow)

## 📋 Supported Certifications

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

### Option 1: Download Pre-Built Binary (No SDK Required)

1. Download `RadicalTrainingPlatform-v0.2.0-alpha-win-x64.zip` from the [Releases](https://github.com/rogerlundnetcenter/nutanixcertificationtool/releases) page or from the repo root (tracked via Git LFS)
2. Extract the zip
3. Run `RadicalTrainingPlatform.exe`

> **Note:** This is a self-contained Windows x64 build — no .NET runtime installation needed.

### Option 2: Build From Source

**Prerequisites:** [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) (Windows)

```bash
cd RadicalTrainingPlatform
dotnet build
dotnet run
```

To create a self-contained publish:

```bash
cd RadicalTrainingPlatform
dotnet publish -c Release -r win-x64 --self-contained
```

The app will launch with all 4 exam tabs. Select an exam, answer questions, and use the explain panel to study.

## 📁 Project Structure

```
├── RadicalTrainingPlatform/                    # WinForms .NET 8.0 application
│   ├── Program.cs                # Entry point
│   ├── MainForm.cs               # Main GUI (question display, explain panel, navigation)
│   ├── SynthwaveColors.cs        # Neon color scheme
│   ├── Controls/
│   │   ├── AnimatedProgressBar.cs
│   │   └── BlueprintPanel.cs     # Blueprint coverage overlay panel
│   ├── Models/
│   │   ├── Question.cs           # Question data model
│   │   └── BlueprintObjective.cs # Blueprint objective model
│   └── Services/
│       ├── QuestionParser.cs     # Markdown → Question parser
│       ├── ReferenceService.cs   # KB references, doc links, explain content
│       └── BlueprintService.cs   # Exam blueprint objectives & keyword matching
│
├── NCP-US-Part1.md               # Unified Storage questions (Domains 1-2, 160 Q)
├── NCP-US-Part2-D3.md            # Unified Storage questions (Domain 3, 80 Q)
├── NCP-US-Part2-D4.md            # Unified Storage questions (Domain 4, 80 Q)
├── NCP-US-Part3-GapFill.md       # Unified Storage gap-fill questions (80 Q)
├── NCP-CI-Part[1-4].md           # Cloud Integration questions (80 Q each)
├── NCP-CI-Part5-GapFill.md       # Cloud Integration gap-fill questions (43 Q)
├── NCP-AI-Part[1-4].md           # AI Infrastructure questions (80 Q each)
├── NCP-AI-Part5-GapFill.md       # AI Infrastructure gap-fill questions (15 Q)
├── NCM-MCI-Part[1-4].md          # Multicloud Infrastructure questions (80 Q each)
├── NCM-MCI-Part5-GapFill.md      # MCM-MCI gap-fill questions (40 Q)
│
├── designguides/                 # Official exam blueprint PDFs & extracted text
│
├── validation/                   # Validation reports & logs
│   ├── blueprint-*-coverage.md   # Blueprint coverage analysis reports
│   ├── zerogap-*.md              # Zero-gap verification reports
│   ├── gapfill-validate-*.log    # Gap-fill validation logs
│   └── CORRECTIONS_SUMMARY.txt   # All answer corrections applied
│
├── RadicalTrainingPlatform-v0.2.0-alpha-win-x64.zip  # Pre-built binary (Git LFS)
├── .gitattributes                # Git LFS tracking rules
├── LICENSE                       # BSD 3-Clause
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

BSD 3-Clause License — see [LICENSE](LICENSE) for details.

## 📦 Git LFS

This repository uses [Git LFS](https://git-lfs.github.com/) to track large binary files (`.zip`, `.exe`, `.dll`). Make sure Git LFS is installed before cloning:

```bash
git lfs install
git clone https://github.com/rogerlundnetcenter/nutanixcertificationtool.git
```

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- Answer randomization (reduce position bias)
- Timed exam simulation mode
- Question difficulty ratings
- Additional certification exams
- Cross-platform support (Avalonia/MAUI)


## ☁️ Cloud Credits

Power your AI projects with [Ozore.com](https://ozore.com/?ref=cwe4kdx0) — use code **lundrog50** for 50% off your first month.

> `direct-pin` and `custom-router` are available on **Pro** and **Max** plans only.
