using System;
using System.Diagnostics;
using System.IO;
using Avalonia.Controls;
using Avalonia.Interactivity;
using Microsoft.Extensions.DependencyInjection;
using Avalonia.Threading;
using RadicalTrainingPlatform.Avalonia.LabSimulator;

namespace RadicalTrainingPlatform.Avalonia.LabSimulator;

/// <summary>
/// Code-behind for the Lab Simulator UserControl.
///
/// Hosts Avalonia's native <see cref="NativeWebView"/> (WebKitGTK on Linux,
/// WebKit on macOS, WebView2 on Windows) pointed at the bundled
/// Web/index.html served over a loopback HTTP origin so ES modules
/// and the service worker work correctly. If the native adapter is
/// unavailable the fallback panel is shown.
///
/// Bridge: <see cref="SimulatorBridge"/> is registered into the JS
/// context via the adapter's injected <c>window.chrome.webview</c>
/// shim; <see cref="BridgeClient.js"/> uses that transport and
/// receives C# → JS messages through <c>window.__cefBridgeDispatch</c>.
/// </summary>
public partial class LabSimulatorView : UserControl, IDisposable
{
    private NativeWebView? _browser;
    private SimulatorBridge? _bridge;
    private SimulatorHttpServer? _server;
    private bool _disposed;

    public LabSimulatorView()
    {
        InitializeComponent();
        Loaded += OnLoaded;
    }

    // ─────────────────────────────────────────────────────────────────────
    //  Lifecycle
    // ─────────────────────────────────────────────────────────────────────

    private void OnLoaded(object? sender, RoutedEventArgs e)
    {
        if (_disposed) return;
        TryStartWebView();
    }

    public void Dispose()
    {
        if (_disposed) return;
        _disposed = true;

        try { _bridge?.Dispose(); } catch (Exception ex)
        {
            Debug.WriteLine($"[LabSimulator] Bridge dispose error: {ex.Message}");
        }
        _bridge = null;

        try
        {
            if (_browser != null)
            {
                _browser.WebMessageReceived -= OnWebMessageReceived;
                _browser.Source = null;
                _browser = null;
            }
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"[LabSimulator] Browser dispose error: {ex.Message}");
        }
        _browser = null;

        try { _server?.Dispose(); } catch { }
        _server = null;
    }

    // ─────────────────────────────────────────────────────────────────────
    //  Native WebView startup + loopback server
    // ─────────────────────────────────────────────────────────────────────

    private void TryStartWebView()
    {
        try
        {
            // Resolve the web app root (shipped next to binary under LabSimulator/Web).
            var webRoot = ResolveWebRoot();
            if (string.IsNullOrEmpty(webRoot) || !Directory.Exists(webRoot))
            {
                ShowError(
                    "Lab Simulator requires the desktop app bundle. " +
                    "Download from GitHub releases.");
                return;
            }

            // Serve over loopback so ES modules and the service worker
            // work without file:// CORS restrictions.
            _server = new SimulatorHttpServer(webRoot);
            var url = _server.BaseUrl + "index.html";

            // Create the bridge (host-agnostic; uses Action<string> sendScript).
            var services = ((App)global::Avalonia.Application.Current!).Services;
            _bridge = new SimulatorBridge(
                ExecuteScript,
                services.GetRequiredService<RadicalTrainingPlatform.Core.Abstractions.IQuestionParser>(),
                services.GetRequiredService<RadicalTrainingPlatform.Core.ISessionStore>());

            // Build the NativeWebView. If no adapter is available the
            // constructor / navigation throws — we degrade to the panel.
            _browser = new NativeWebView();
            _browser.Source = new Uri(url);
            _browser.WebMessageReceived += OnWebMessageReceived;
            // The adapter's injected chrome.webview.shim delivers JS→C#;
            // C#→JS is done via InvokeScript calling __cefBridgeDispatch.
            WebViewHost.Content = _browser;
            WebViewHost.IsVisible = true;
            LoadingPanel.IsVisible = false;
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"[LabSimulator] Unexpected error: {ex}");
            ShowError(
                "Lab Simulator could not be started. " +
                (ex.Message ?? "Unknown error") +
                ". Download the desktop bundle from GitHub releases.");
        }
    }

    /// <summary>
    /// Locate the bundled LabSimulator/Web folder. We try the installed
    /// location first (AppContext.BaseDirectory), then the source-tree
    /// fallback, then one level up from the binary (publish layouts).
    /// </summary>
    private static string? ResolveWebRoot()
    {
        var candidates = new[]
        {
            Path.Combine(AppContext.BaseDirectory, "LabSimulator", "Web"),
            Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..",
                "RadicalTrainingPlatform.Web"),
            Path.Combine(AppContext.BaseDirectory, "..", "LabSimulator", "Web"),
        };
        foreach (var p in candidates)
        {
            try
            {
                var full = Path.GetFullPath(p);
                if (Directory.Exists(full)) return full;
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"[LabSimulator] Candidate check failed: {ex.Message}");
            }
        }
        return null;
    }

    // ─────────────────────────────────────────────────────────────────────
    //  Bridge helpers — C# → JS (InvokeScript) and JS → C# (WebMessageReceived)
    // ─────────────────────────────────────────────────────────────────────

    /// <summary>
    /// Execute a JavaScript snippet in the browser via NativeWebView's
    /// <see cref="NativeWebView.InvokeScript"/> (maps to the adapter's
    /// InvokeScript / ExecuteJavaScript helper).
    /// </summary>
    public void ExecuteScript(string script)
    {
        if (_disposed || _browser == null) return;
        try
        {
            // Fire-and-forget; InvokeScript is synchronous and returns a
            // result string that we ignore for the bridge dispatch.
            _ = _browser.InvokeScript(script);
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"[LabSimulator] ExecuteScript error: {ex.Message}");
        }
    }

    private void OnWebMessageReceived(object? sender, WebMessageReceivedEventArgs e)
    {
        // The adapter's injected chrome.webview.postMessage delivers a
        // JSON string in Body. Pass straight to the host-agnostic bridge.
        if (_bridge == null) return;
        try
        {
            _bridge.Call(e.Body ?? "{}");
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"[LabSimulator] WebMessageReceived error: {ex.Message}");
        }
    }

    // Title change = page loaded fully (BridgeClient posts ready).
    private void OnBrowserTitleChanged(object? sender, string title)
    {
        Dispatcher.UIThread.Post(() =>
        {
            if (_disposed) return;
            LoadingPanel.IsVisible = false;
        });
    }

    // ─────────────────────────────────────────────────────────────────────
    //  Fallback panel
    // ─────────────────────────────────────────────────────────────────────

    private void ShowError(string message)
    {
        Dispatcher.UIThread.Post(() =>
        {
            if (_disposed) return;
            ErrorMessageText.Text = message;
            ErrorPanel.IsVisible = true;
            LoadingPanel.IsVisible = false;
            WebViewHost.IsVisible = false;
            if (_browser != null)
            {
                _browser.WebMessageReceived -= OnWebMessageReceived;
                _browser.Source = null;
            }
        });
    }

    private void OnDownloadClicked(object? sender, RoutedEventArgs e)
    {
        try
        {
            var url = "https://github.com/TheArchitectit/radicaltrainingplatform/releases";
#if WINDOWS
            Process.Start(new ProcessStartInfo(url) { UseShellExecute = true });
#elif LINUX
            Process.Start("xdg-open", url);
#elif OSX
            Process.Start("open", url);
#else
            Process.Start(new ProcessStartInfo(url) { UseShellExecute = true });
#endif
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"[LabSimulator] Failed to open browser: {ex.Message}");
        }
    }
}
