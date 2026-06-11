# 🚀 CertForge — Master Project Plan (Multi-Year Roadmap)

> **Vision:** The definitive cross-platform certification study platform for Nutanix and beyond.

This roadmap is organized into **years**, **quarters**, and **sprints**. Each sprint is 2 weeks. Status: `🟢 Done` | `🟡 In Progress` | `⚪ Planned` | `🔴 Blocked`

---

## YEAR 1: Foundation & Cross-Platform (40 sprints)

### Q1: Core Refactor & PWA (Sprints 1-6)

| Sprint | Goal | Deliverable | Status |
|--------|------|-------------|--------|
| S1 | Extract `CertForge.Core` shared library | `CertForge.Core` builds on `net8.0` | 🟡 |
| S2 | Port all services (Reference, Blueprint, Parser) | All services in `CertForge.Core` | 🟡 |
| S3 | PDF export with QuestPDF | Cross-platform PDF generation | ⚪ |
| S4 | Lab Simulator standalone PWA | `CertForge.PWA` deployable to GitHub Pages | 🟡 |
| S5 | CI/CD matrix setup | GitHub Actions: Windows/Linux/macOS builds | ⚪ |
| S6 | WinForms app refactored to use Core | Zero regression on Windows | ⚪ |

**Milestone Q1:** Core library is platform-agnostic. Windows app works unchanged. PWA is live.

---

### Q2: Avalonia Desktop (Sprints 7-12)

| Sprint | Goal | Deliverable |
|--------|------|-------------|
| S7 | Avalonia project skeleton | `CertForge.Avalonia` builds on all 3 platforms |
| S8 | Synthwave theme in Avalonia | `DrawingContext` paint engine matching WinForms |
| S9 | Main layout (exam list, question display) | Feature parity with WinForms layout |
| S10 | Options cards, answer selection, submit flow | Interactive question answering |
| S11 | Explain panel, blueprint overlay, stats sidebar | All side-panel features |
| S12 | Test mode, timer, exam simulator | Timed 75-question exam simulation |

**Milestone Q2:** Avalonia desktop app runs on Linux, macOS, and Windows with full feature parity.

---

### Q3: Advanced Features (Sprints 13-18)

| Sprint | Goal | Deliverable |
|--------|------|-------------|
| S13 | Lab Simulator embedded in Avalonia | CefGlue WebView hosts PWA in desktop shell |
| S14 | Answer randomization (anti-position-bias) | Shuffled options, tracked per-session |
| S15 | Question difficulty ratings | Easy/Medium/Hard tagging + filtering |
| S16 | Score tracking & persistence | SQLite per-user database,跨session progress |
| S17 | Wrong-answer review mode | Spaced repetition of missed questions |
| S18 | Export formats (Anki, CSV, JSON) | Flashcard deck generation |

**Milestone Q3:** Desktop apps are feature-complete and superior to the original WinForms app.

---

### Q4: Polish & Distribution (Sprints 19-24)

| Sprint | Goal | Deliverable |
|--------|------|-------------|
| S19 | Linux packaging (Flatpak + tarball) | Flathub submission + direct download |
| S20 | macOS packaging (signed .dmg) | Apple notarization, App Store consideration |
| S21 | Windows packaging (self-contained .exe) | Single-file executable, optional installer |
| S22 | Auto-updater integration | Sparkle (macOS), Squirrel (Windows), Flatpak (Linux) |
| S23 | Accessibility audit (WCAG 2.1 AA) | Screen reader support, keyboard navigation |
| S24 | Performance profiling & optimization | Startup <2s, smooth 60fps animations |

**Milestone Q4:** v1.0.0 release. All platforms. Production-ready.

---

## YEAR 2: Platform Expansion (40 sprints)

### Q5: Web App & Mobile (Sprints 25-30)

| Sprint | Goal | Deliverable |
|--------|------|-------------|
| S25 | Full web app (Blazor WASM or SPA) | Browser-based study tool, no install needed |
| S26 | Mobile-responsive layout | Phone/tablet optimized UI |
| S27 | PWA install prompts | "Add to Home Screen" on iOS/Android |
| S28 | Offline question sync | Background sync for study progress |
| S29 | Cloud account & sync | JWT auth, progress syncs across devices |
| S30 | Social features (leaderboards, study groups) | Compete with friends, shared decks |

**Milestone Q5:** Study anywhere (desktop, web, mobile). Progress syncs.

---

### Q6: AI-Powered Study (Sprints 31-36)

| Sprint | Goal | Deliverable |
|--------|------|-------------|
| S31 | LLM integration for explanations | Per-question AI tutor (Claude API) |
| S32 | Weak area identification | ML analysis of answer patterns |
| S33 | Adaptive question selection | Harder questions on weak topics |
| S34 | Generated practice scenarios | AI creates realistic troubleshooting scenarios |
| S35 | Voice Q&A mode | Study while driving/walking |
| S36 | Personalized study plans | AI-generated 2-week cram schedules |

**Milestone Q6:** AI makes studying smarter, not just memorization.

---

### Q7: Exam Expansion (Sprints 37-42)

| Sprint | Goal | Deliverable |
|--------|------|-------------|
| S37 | NCP-DB (Database) exam content | 300+ questions for Nutanix database cert |
| S38 | NCP-NX (Network Security) exam | 300+ questions for Flow/FNS cert |
| S39 | NCA 8.0 update | New questions for next AOS release |
| S40 | AWS/Azure/GCP certification modules | Cloud provider questions (separate packs) |
| S41 | Community question submission | User-contributed questions + moderation |
| S42 | Exam blueprint auto-scraper | Pull latest blueprints from vendor sites |

**Milestone Q7:** Not just Nutanix — the best cert prep platform for cloud/infra.

---

### Q8: Enterprise & Monetization (Sprints 43-48)

| Sprint | Goal | Deliverable |
|--------|------|-------------|
| S43 | Team/enterprise licenses | Admin dashboard, user management |
| S44 | LMS integrations (SCORM/xAPI) | Plug into corporate training systems |
| S45 | Analytics for instructors | Per-student progress, class reports |
| S46 | White-label option | Custom branding for training partners |
| S47 | Subscription tiers (Free/Pro/Enterprise) | Stripe billing, feature gates |
| S48 | Content marketplace | Buy/sell question packs (revenue share) |

**Milestone Q8:** Sustainable business model. Self-funding continued development.

---

## YEAR 3: Ecosystem (40 sprints)

### Q9: Platform API & Integrations (Sprints 49-54)

| Sprint | Goal | Deliverable |
|--------|------|-------------|
| S49 | Public REST API | Third-party apps can query questions |
| S50 | VS Code extension | Study inside your editor |
| S51 | Slack/Discord bot | Daily question challenges in channels |
| S52 | Nutanix Partner Portal integration | Direct link from partner training |
| S53 | Certification tracking | Link to actual exam results, verify passes |
| S54 | Job board integration | "You passed NCP-CI — here are relevant jobs" |

---

### Q10: VR/AR & Immersive (Sprints 55-60)

| Sprint | Goal | Deliverable |
|--------|------|-------------|
| S55 | 3D cluster visualization | WebGL/A-Frame 3D cluster topology |
| S56 | VR lab environment | Walk through a virtual datacenter in Quest 3 |
| S57 | AR overlay for real hardware | Point phone at Nutanix node, get info overlay |
| S58 | Multiplayer study rooms | VR study groups with whiteboards |
| S59 | Haptic feedback for wrong answers | Controller buzz on incorrect selection |
| S60 | Voice-command VR interface | "Show me the write path" → 3D animation |

---

### Q11: Globalization (Sprints 61-66)

| Sprint | Goal | Deliverable |
|--------|------|-------------|
| S61 | i18n framework (resx / JSON) | All strings externalized |
| S62 | Spanish translation | Full UI + questions in ES |
| S63 | Portuguese (BR) translation | Full UI + questions in PT-BR |
| S64 | Japanese translation | Full UI + questions in JA |
| S65 | RTL language support | Arabic/Hebrew layout |
| S66 | Community translation platform | Crowdsourced translations |

---

### Q12: Generative Content (Sprints 67-72)

| Sprint | Goal | Deliverable |
|--------|------|-------------|
| S67 | Auto-question generation from docs | Feed Nutanix PDF → generate questions |
| S68 | Video content generation | AI narrates explanations with visuals |
| S69 | Interactive labs from config files | Upload cluster config → simulate it |
| S70 | Cert path optimizer | "You have X skills → here's your fastest cert path" |
| S71 | Mock exam proctoring | Webcam + screen recording for realistic practice |
| S72 | AI proctor feedback | "You spend too long on networking questions" |

---

## YEAR 4+ (200+ weeks): The Long Game

- **CertForge OS:** A dedicated thin Linux distro that boots straight into the study app
- **Hardware partnerships:** Pre-loaded study tablets sold at Nutanix conferences
- **Academic program:** Free access for universities, curriculum integration
- **Annual conference:** CertForgeCon — physical study bootcamps
- **AI certification:** Our own micro-certifications recognized by industry
- **Acquisition target?** Become so integral Nutanix buys it (or we don't care, it's sustainable)

---

## Sprint Velocity Assumptions

- **1 developer (you):** 1-2 story points per sprint
- **1 developer + AI pair:** 3-5 story points per sprint
- **Small team (3 devs):** 8-12 story points per sprint

Current mode: **1 developer + AI pair** = high velocity, parallel workstreams.

---

## Current Status Dashboard

| Quarter | Sprints | Done | In Progress | Blocked |
|---------|---------|------|-------------|---------|
| Q1 | 1-6 | 2 | 3 | 0 |
| Q2 | 7-12 | 0 | 0 | 0 |
| Q3 | 13-18 | 0 | 0 | 0 |
| Q4 | 19-24 | 0 | 0 | 0 |

---

## Immediate Next 5 Sprints (Active Planning)

```
S1 [NOW]  → Core extraction, PWA, models, parser
S2 [NEXT] → Refactor WinForms → Core, port services, PDF export
S3        → Avalonia skeleton, theme engine, main layout
S4        → Question UI, options cards, answer flow
S5        → Explain panel, blueprint, stats, test mode
```

Let's go. 🚀
