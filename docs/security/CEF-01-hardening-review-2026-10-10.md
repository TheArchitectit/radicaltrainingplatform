# CEF-01 Hardening Review — Embedded Browser (NoSandbox)

**Record:** CEF-01 / R-21 / T-42
**Date:** 2026-10-10
**Scope:** Desktop Lab Simulator's embedded CefGlue browser (`LabSimulatorView` + `CefBridge`)
**Constraint (SPEC-09 R-21):** hardening review only — **no exploit is asserted**.

---

## Decision

**KEEP** the embedded browser in the desktop demo/lab path, under a recorded
compensating control set. The lab simulator needs an HTML/JS host; the
alternatives (external browser + separate process bridge, or a custom JS
engine) are larger surfaces than the controls below.

The decision is valid for the Sprint 47 rehearsal choice of the desktop demo
path. Re-open it if any of the following changes: the bridge grows a handler
that executes host code chosen by JS, the bundle starts loading remote
content, or CEF is upgraded across a major version without a re-read of this
record.

---

## 1. NoSandbox = true

| Fact | Value |
|---|---|
| Setting | `CefSettings.NoSandbox = true` (`LabSimulatorView.TryStartCef`) |
| Stated reason | "Sandboxes don't play well with bundled apps" |
| Residual risk | A renderer compromise is a process compromise. Not asserted exploitable; accepted as a known cost of the bundled-app CEF posture. |
| Compensating controls | Navigation allowlist (below), local-bundle-only content, minimal bridge surface, remote debugging disabled (`RemoteDebuggingPort = 0`), no auto-update channel |

**Outcome:** keep `NoSandbox = true` for the demo path, with the controls in
this record. Do not advertise the desktop app as a general-purpose browser.

---

## 2. Navigation allowlist

**Policy:** `RadicalTrainingPlatform.Desktop/LabSimulator/NavigationPolicy.cs`
(pure decision surface — no CEF dependency).

**Allowed (and only these):**
- `about:blank`, `about:srcdoc` (CEF internals)
- `file://` URIs whose full path is inside the resolved lab-bundle root
  (the directory that holds the bundled `index.html`)

**Denied:**
- `http:`, `https:` — out-of-app destinations open in the **OS shell**
  (`OnDownloadClicked` → `xdg-open` / `ShellExecute`), never in-process
- `javascript:`, `data:`, `blob:`, `chrome:`, `chrome-extension:`,
  `devtools:`, `view-source:`
- `file://` outside the bundle tree (including sibling-prefix tricks)
- empty / relative / unparseable targets
- any `file://` when the bundle root is unknown (**fail closed**)

**Enforcement:** `LabSimulatorView.OnBrowserAddressChanged` evaluates every
address against the policy and bounces disallowed targets back to the bundle
bootstrap (`LoadUrl(bootstrap)`), with a `Debug.WriteLine` of the denied URL
and reason.

**Fixture (TM-89):** `RadicalTrainingPlatform.Desktop.Tests/NavigationPolicyTests.cs`
— allow/deny table, sibling-prefix confusion, fail-closed on unknown root,
bounce-back helper, and the `OldFailure_OpenNavigation_IsPinnedOut` regression
pin. Failing side of CEF-01: with no policy, any URL the page pointed at was a
live navigation in a NoSandbox browser.

**Residual:** popups (`window.open` / `target=_blank`) are not intercepted at
the LifeSpanHandler layer — replacing CefGlue's internal handler was judged
riskier than the gap for a local-bundle page. If the lab bundle ever gains a
link that can open a popup to remote content, that gap must be closed before
the demo. Not verified: a live CEF popup attempt (no display server in this
environment).

---

## 3. Bridge surface minimization (R-05 / R-19)

`window.dotnetBridge.call(json)` is the only JS→host entry point. The surface
is the ten registered handlers in `CefBridge.RegisterDefaultHandlers`:

| Type | Effect (real) |
|---|---|
| `ready` | host → JS init handshake (app version + live CEF binding version) |
| `ping` | health check, echo |
| `log` | host debug log |
| `load_exam_list` | real Core catalog |
| `get_stats` | aggregates from `ISessionStore` |
| `get_question` | real bank lookup |
| `save_progress` | `ISessionStore.Save` (atomic, R-20) |
| `load_progress` | `ISessionStore.Load` (quarantine-aware) |
| `get_session` | session inventory / single load |
| `reset_session` | session delete |

**Absent by design (removed in T-15 / S46-05):** `submit_answer`, `export_results`,
`import_results`, `get_settings`, `set_setting` — they acknowledged without
effects. Pinned by `HandlerSurface_ListsOnlyHandlersWithRealEffects`.

**Not on the surface:** no arbitrary script execution from JS, no filesystem
paths chosen by JS (session ids go through `JsonSessionStore.PathFor` rejection
rules, R-20), no process spawn, no settings mutation.

**Outcome:** surface stays minimal. Any new handler requires a real Core
effect plus a fixture, or it does not ship (R-05).

---

## 4. Update-channel review

| Channel | Status |
|---|---|
| CEF binary distribution | NuGet packages `CefGlue.Avalonia` / `CefGlue.Common` **120.6099.215** (pinned in `RadicalTrainingPlatform.Desktop.csproj`) |
| Auto-update (Omaha / CEF updater) | **None.** No updater is bundled or invoked. |
| Host-app release channel | GitHub Releases link in the fallback panel; until a release exists, docs point at build-from-source (R-19 / SPEC-10 10.5) |
| Version reported to JS | Now read from the live binding assembly (`typeof(CefRuntime).Assembly`) |

**Finding (closed in this change):** `CefBridge` previously reported a
hardcoded `cefVersion = "120.6099.204"` while the project pins **120.6099.215**
— the handshake string had already drifted from the actual update channel. It
now reports the binding assembly version.

**Outcome:** update channel is *deliberate version bumps only*. A CEF major
upgrade re-opens this review. Residual: the native CEF binaries that NuGet
wraps are not separately attested here; supply-chain review of the NuGet
package itself is out of scope for T-42 (recorded, not claimed).

---

## 5. Related settings (observed, not changed)

| Setting | Value | Note |
|---|---|---|
| `CachePath` | `%LocalAppData%/RadicalTrainingPlatform/CefCache` | per-user cache |
| `LogSeverity` | Warning | |
| `RemoteDebuggingPort` | 0 | disabled |
| `MultiThreadedMessageLoop` | true | |
| `WindowlessRenderingEnabled` | false | |
| Linux headless guard | `DISPLAY`/`WAYLAND_DISPLAY` check before `CefRuntime.Load` | CEF `exit()`s uncatchably without a display (R-16 / S46-11) |

---

## Not verified (prescribed, not executed)

- Live navigation to `https://…` from inside a running CEF host and the
  bounce-back (no display server here). The policy and the address-changed
  hook are fixture-tested at the decision layer; the native leg is
  **prescribed-but-not-yet-executed** evidence for the release record.
- Popup / `window.open` behavior against the current CefGlue LifeSpanHandler.
- Renderer-crash recovery.
- Windows/macOS CEF startup (fixtures run on Linux).
- NuGet package provenance beyond the declared pin.

---

## Evidence map

| Control | Code | Fixture |
|---|---|---|
| Navigation allowlist | `NavigationPolicy.cs` | `NavigationPolicyTests.cs` (TM-89) |
| Enforcement bounce-back | `LabSimulatorView.OnBrowserAddressChanged` | `BlockedRedirect_*` in the same suite |
| Bridge surface | `CefBridge.RegisterDefaultHandlers` | `HandlerSurface_ListsOnlyHandlersWithRealEffects` |
| Session-id path safety | `JsonSessionStore.PathFor` | `PathUnsafeIds_AreRejected_WindowsLinuxMac` (R-20) |
| Update-channel truth | `CefBridge` ready handshake | (review record; version now assembly-derived) |
