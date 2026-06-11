# RadicalTrainingPlatform — Cross-Platform Roadmap (Linux + macOS)

> **Current:** WinForms .NET 8 + WebView2 (Windows-only)
> **Target:** Native apps on Windows, Linux, macOS with shared engine

## Executive Summary

The current app is a **WinForms .NET 8 desktop app** with:
- Custom GDI+ synthwave UI (`MainForm.cs` — 59K of hand-coded layout + paint)
- Embedded `Microsoft.Web.WebView2` browser for the Lab Simulator
- `PdfSharp` for PDF export
- `Microsoft.Web.WebView2` package for WebView2 runtime

**The problem on Linux:**
- `System.Windows.Forms` → no Linux support
- `WebView2` → no Linux port (Microsoft only ships Windows/macOS)
- `net8.0-windows` TFM → Windows-only

**The Lab Simulator is plain HTML/JS** — the cross-platform issue is ONLY the shell that hosts it.

---

## Strategic Decision: Two Apps

| App | Technology | Platforms | Notes |
|-----|-----------|-----------|-------|
| **RadicalTrainingPlatform-Desktop** | Eto.Forms (fully native) | Windows, Linux, macOS | Shared business logic, native UI per platform |
| **RadicalTrainingPlatform-Web** | Lab Simulator → standalone PWA | All (via browser) | Simulator already works in any browser |

**Why Eto.Forms?** Not Avalonia/MAUI/Uno. Here's why:

| Framework | Linux Native? | macOS Native? | WebView? | GDI+? | Migration Effort | Verdict |
|-----------|--------------|---------------|----------|-------|------------------|---------|
| **Avalonia** | ✅ X11/Wayland | ✅ | WebEngine (CEF) — heavy | Skia — different API | High — rewrite all layout/paint | Complex, heavy deps |
| **MAUI** | ⚠️ Community only (no official) | ✅ | BlazorWebView — Linux issues | Skia — no GDI+ | High — MAUI desktop is weak | Desktop is 2nd-class |
| **Uno Platform** | ✅ via Skia | ✅ | Native webview — patchy | Skia — no GDI+ | Very high | Overkill for this app |
| **Eto.Forms** | ✅ Gtk3/Wayland | ✅ Cocoa | Gtk.WebKit or native | Native draw hooks + fallback | Medium | Best tradeoff |

**Eto.Forms wins because:**
1. Maps to **native toolkits** (Gtk3 on Linux, Cocoa on macOS, WinForms/WPF on Windows)
2. The result looks like a native app on each platform (not foreign-looking Skia canvas)
3. Supports `Gtk.WebKit` on Linux for the simulator (lightweight, no CEF bloat)
4. Has a `Drawable` control that supports custom paint — can port the synthwave theme
5. Smaller dependency footprint than Avalonia+CEF
6. Can share 90%+ of business logic via .NET Standard class library

---

## Architecture — Shared + Native Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     NATIVE UI LAYER (per platform)         │
│  ┌──────────┐  ┌────────────┐  ┌─────────────────────────┐ │
│  │ Windows  │  │ Linux     │  │ macOS                   │ │
│  │ Eto.Wpf  │  │ Eto.Gtk3  │  │ Eto.Mac                 │ │
│  │ or       │  │ WebKit    │  │ WKWebView               │ │
│  │ Eto.WinForms│ │ Gtk.WebKit │ │ Native Cocoa            │ │
│  └──────────┘  └────────────┘  └─────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                     SHARED ENGINE (.NET 8)                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  RadicalTrainingPlatform.Core (class library, net8.0)              │  │
│  │  ├── Models/         Question, AnswerOption           │  │
│  │  ├── Services/       QuestionParser, BlueprintSvc     │  │
│  │  ├── PdfExport/      Remove PdfSharp dependency       │  │
│  │  └── ViewModels/     ReactiveUI or plain INPC        │  │
│  └──────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                     DATA LAYER                             │
│  ├── Markdown questions (portable text files)              │
│  ├── LabSimulator/Web/ (portable HTML/JS/CSS)             │
│  └── Blueprint JSON/metadata                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Sprint Plans

### 🏃 Sprint 0: Foundation & Audit (Week 1)

**Goal:** Establish shared library, audit all Windows-only code, define abstractions.

**Tasks:**
1. **Create `RadicalTrainingPlatform.Core` class library** (`net8.0` — no platform TFM)
   - Move `Models/`, `Services/`, `BlueprintService.cs`, `ReferenceService.cs`
   - Refactor `QuestionParser.LoadAllExams()` to accept an `IFileProvider` interface (not `Directory.GetFiles`)
   - Extract `IExamRepository` interface for loading/saving exam data

2. **Audit all Windows-only APIs in `MainForm.cs`**
   - `System.Drawing.Drawing2D` → Eto.Drawing (similar API)
   - `System.Windows.Forms` → Eto.Forms (very similar model)
   - `GDI+ OnPaint` → Eto `Drawable.Paint` event
   - `RichTextBox` → Eto `RichTextArea`
   - `MessageBox.Show` → Eto `MessageBox.Show`
   - `Application.Run` → Eto `new Application().Run()`

3. **Remove `PdfSharp` dependency**
   - `PdfSharp` 6.1.1 may work on Linux but is untested
   - Evaluate: `QuestPDF` (cross-platform, Skia) or `iText7` (commercial) or `PuppeteerSharp` (headless browser → PDF)
   - Decision: **QuestPDF** — MIT license, .NET 8, no native deps on Linux, generates identical output

4. **Define `IWebViewProvider` abstraction**
   ```csharp
   interface IWebViewProvider {
       Control CreateWebView(string url);  // returns native webview control
       bool SupportsDevTools { get; }
       void PostMessage(string json);
   }
   ```
   - Windows: WebView2 (keep existing)
   - Linux: Gtk.WebKit (via Eto.Gtk3) or CEF (if needed)
   - macOS: WKWebView (via Eto.Mac)

5. **Define `IThemeRenderer` abstraction**
   ```csharp
   interface IThemeRenderer {
       void PaintBackground(Graphics g, Rect rect);
       void PaintOptionCard(Graphics g, Rect rect, bool selected, bool correct);
       void PaintProgressBar(Graphics g, Rect rect, float pct);
   }
   ```

**Deliverable:** `RadicalTrainingPlatform.Core` builds on `net8.0` with zero Windows references.

---

### 🏃 Sprint 1: Linux Desktop App — Eto.Gtk3 (Weeks 2–4)

**Goal:** Working Linux app with all existing features.

**Tasks:**
1. **Create `RadicalTrainingPlatform.Linux` project**
   - `Eto.Forms` + `Eto.Platform.Gtk` packages
   - Application entry point: `new Application(Eto.Platforms.Gtk).Run(new MainForm())`

2. **Port `MainForm` layout to Eto.Forms**
   - `Panel` → `Panel`
   - `DockStyle` → `Dock` enum (same concept)
   - `FlowLayoutPanel` → `DynamicLayout` or `StackLayout`
   - `SplitContainer` → `Splitter`
   - `Button` → `Button`
   - `Label` → `Label`
   - `RadioButton` → `RadioButton`
   - `CheckBox` → `CheckBox`
   - `RichTextBox` → `RichTextArea`
   - Key mapping: Eto's event model is very close to WinForms

3. **Port synthwave theme to `Eto.Drawing`**
   - `System.Drawing.Color` → `Eto.Drawing.Color`
   - `System.Drawing.Font` → `Eto.Drawing.Font`
   - `System.Drawing.Pen` → `Eto.Drawing.Pen`
   - `System.Drawing.Brush` → `Eto.Drawing.SolidBrush`
   - `LinearGradientBrush` → `Eto.Drawing.LinearGradientBrush`
   - `OnPaint` with `Graphics g` → `Drawable.Paint` with `PaintEventArgs.Graphics`
   - The paint logic in `AnimatedProgressBar` translates almost 1:1

4. **Implement `GtkWebKitProvider`**
   - Use `Eto.WebView` on Linux (Gtk backend uses WebKitGTK)
   - Host `LabSimulator/Web/` via `file://` or small embedded HTTP server
   - Bridge: `window.postMessage` ↔ `WebView.DocumentLoaded` + `ExecuteScript`
   - The existing `BridgeClient.js` only needs the host endpoint URL changed

5. **Port keyboard shortcuts**
   - `KeyPreview` → `Application.KeyDown` event
   - `Keys.D1`–`Keys.D5` → `Key.D1`–`Key.D5`
   - `Enter` → `Key.Enter`

6. **PDF export via QuestPDF**
   - Rewrite `export_to_pdf.py` logic in C# using QuestPDF
   - Generate identical-or-better output
   - Test on Ubuntu 22.04+ with `libfontconfig1`

7. **Build & test on real Linux**
   - Ubuntu 22.04/24.04 (GNOME/Wayland)
   - Fedora 40 (GNOME/Wayland)
   - Test: `dotnet build && dotnet run`
   - Package target: `.deb` (Ubuntu/Debian), `.rpm` (Fedora), tarball (generic)

**Deliverable:** `RadicalTrainingPlatform.Linux` runs natively on Ubuntu with full feature parity.

---

### 🏃 Sprint 2: macOS Desktop App — Eto.Mac (Weeks 4–5)

**Goal:** Working macOS app. Most work is shared from Sprint 1.

**Tasks:**
1. **Create `RadicalTrainingPlatform.Mac` project**
   - `Eto.Platform.Mac64` package
   - Single project produces `.app` bundle

2. **Reuse 95% of UI code from Linux app**
   - Eto.Forms abstracts the platform — same C# code, different native backend
   - Only native-specific: app bundle creation, code signing, notarization

3. **Implement `MacWebViewProvider`**
   - `Eto.WebView` on Mac uses `WKWebView` (WebKit)
   - Same bridge approach as Linux

4. **macOS-specific polish**
   - Menu bar integration (`ApplicationMenu`)
   - Dark mode auto-detection (or hardcode synthwave dark)
   - `.app` bundle packaging with `dotnet msbuild /t:BuildAppBundle`
   - Code signing + notarization for distribution

5. **Test on macOS 13+ (Intel + Apple Silicon)**
   - `dotnet build -r osx-x64` / `dotnet build -r osx-arm64`
   - Universal binary via `lipo` if needed

**Deliverable:** `RadicalTrainingPlatform.Mac.app` runs on macOS with full feature parity.

---

### 🏃 Sprint 3: Windows App — Modernization (Week 5)

**Goal:** Windows app rebuilt on Eto.Forms (optional) OR keep WinForms as-is with shared core.

**Decision point:**
- **Option A:** Keep WinForms app running on `RadicalTrainingPlatform.Core` (minimal effort)
- **Option B:** Replace with Eto.Wpf for consistency and modern WPF rendering

**Recommendation: Option A for v1** — the existing WinForms app works fine. Just:
1. Refactor to use `RadicalTrainingPlatform.Core`
2. Keep WebView2 for the simulator (best experience on Windows)
3. Optionally add `Eto.Wpf` migration later if WinForms becomes a burden

**Deliverable:** Windows app uses `RadicalTrainingPlatform.Core`, no regression.

---

### 🏃 Sprint 4: Standalone Lab Simulator PWA (Week 6)

**Goal:** Decouple simulator from desktop app so it runs anywhere.

**Tasks:**
1. **Convert Lab Simulator to standalone PWA**
   - Add `manifest.json`, service worker
   - Host on GitHub Pages or `radicaltrainingplatform.app`
   - Works in any browser: Chrome, Firefox, Safari, Edge

2. **BridgeClient.js modification**
   - Detect if running in desktop webview or standalone browser
   - In standalone mode: load demo data instead of querying C# backend
   - In desktop mode: keep existing `chrome.webview.postMessage` bridge

3. **Desktop apps can open simulator in external browser**
   - Add "Open in Browser" button that launches default browser to PWA URL
   - Fallback if embedded webview fails

4. **Offline support**
   - Service worker caches all simulator assets
   - Works offline after first load

**Deliverable:** `https://radicaltrainingplatform.app/simulator` runs on any device with a browser.

---

### 🏃 Sprint 5: Packaging & Distribution (Week 7)

**Goal:** Users can install easily on all platforms.

| Platform | Format | Tooling |
|----------|--------|---------|
| Windows | `.exe` (self-contained), `.msi` | `dotnet publish --self-contained` + WiX |
| Linux (Ubuntu/Debian) | `.deb` | `dotnet deb` or `fpm` |
| Linux (Fedora/RHEL) | `.rpm` | `dotnet rpm` or `fpm` |
| Linux (generic) | AppImage | `AppImageBuilder` |
| macOS | `.dmg` (signed + notarized) | `create-dmg` + `xcrun altool` |

**Tasks:**
1. GitHub Actions CI/CD matrix: `windows-latest`, `ubuntu-latest`, `macos-latest`
2. Release automation: tag → build all 3 → attach to GitHub Release
3. Update README with per-platform install instructions

---

## Risk Analysis & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Eto.Gtk3 WebKit rendering issues | Medium | High | Test early in Sprint 1; fallback to external browser |
| Synthwave GDI+ theme doesn't translate to Eto.Drawing | Low | Medium | Eto.Drawing is capable; test gradients + alpha blending |
| PDF generation looks different with QuestPDF | Medium | Medium | Accept minor visual differences; focus on content accuracy |
| macOS code signing/notarization delays | High (process) | Low | Start Apple Developer account early; test with ad-hoc signing first |
| Linux font rendering differences | Medium | Low | Bundle fonts or use system fonts; test on multiple distros |

---

## Success Criteria

- [ ] `RadicalTrainingPlatform.Linux` runs on Ubuntu 24.04 with all 5 exams loadable
- [ ] `RadicalTrainingPlatform.Mac` runs on macOS 14 (Apple Silicon) with all 5 exams loadable
- [ ] Lab Simulator works on both platforms (embedded or browser)
- [ ] PDF export works on both platforms
- [ ] All 1,458 questions (now + NCA 7.5) parse correctly
- [ ] CI builds all 3 platforms on every PR
- [ ] No regression in Windows app

---

## Appendix: Eto.Forms ↔ WinForms API Map

| WinForms | Eto.Forms | Notes |
|----------|-----------|-------|
| `Form` | `Form` | Same |
| `Panel` | `Panel` | Same |
| `Button` | `Button` | Same |
| `Label` | `Label` | Same |
| `CheckBox` | `CheckBox` | Same |
| `RadioButton` | `RadioButton` | Same |
| `RichTextBox` | `RichTextArea` | RichTextArea is more capable |
| `ComboBox` | `DropDown` / `ComboBox` | ComboBox in Eto |
| `ProgressBar` | `ProgressBar` | Same |
| `Timer` | `UITimer` | Better cross-platform |
| `Graphics` | `Graphics` | Very similar API, namespace `Eto.Drawing` |
| `Color` | `Color` | Same names |
| `Font` | `Font` | Same constructor |
| `Pen` | `Pen` | Same |
| `Brush` | `SolidBrush` / `LinearGradientBrush` | Same |
| `Rectangle` | `Rectangle` / `Rect` | `Rect` is struct, `Rectangle` is class |
| `Point` | `Point` | Same |
| `Size` | `Size` | Same |
| `MessageBox.Show()` | `MessageBox.Show()` | Same |
| `Application.Run()` | `new Application().Run()` | Platform-specific |
| `DockStyle` | `Dock` | Enum values: Fill, Left, Right, Top, Bottom |
| `AnchorStyles` | `Anchor` | Same concept |
| `KeyPreview` | `Application.KeyDown` | Global key events |
| `Cursor` | `Cursor` | Same |

**Estimated refactoring effort:**
- `MainForm.cs` 59K lines → ~15K Eto.Forms lines (most of the bulk is inline layout construction which translates 1:1)
- `AnimatedProgressBar.cs` → ~80 lines Eto `Drawable` (paint logic unchanged)
- `BlueprintPanel.cs` → similar paint port
- Business logic: **zero changes** (moves to `RadicalTrainingPlatform.Core`)
