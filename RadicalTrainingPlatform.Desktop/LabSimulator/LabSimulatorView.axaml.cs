using System;
using System.Diagnostics;
using System.IO;
using Avalonia.Controls;
using Avalonia.Interactivity;
using Avalonia.Threading;
using Xilium.CefGlue;
using Xilium.CefGlue.Avalonia;
using Xilium.CefGlue.Common.Events;
using RadicalTrainingPlatform.Avalonia.LabSimulator;

namespace RadicalTrainingPlatform.Avalonia.LabSimulator;

/// <summary>
/// Code-behind for the Lab Simulator UserControl.
///
/// Hosts a CefGlue (Xilium.CefGlue / CefGlue.Avalonia) AvaloniaCefBrowser
/// pointed at the bundled Web/index.html. If the native CefGlue binaries
/// cannot be loaded (e.g. running on a dev machine without the runtime
/// bundle), a friendly fallback panel is shown instead.
///
/// Bridge: the CefBridge class is registered into the JS context as
/// "dotnetBridge" so the existing BridgeClient.js can call
/// <c>window.dotnetBridge.call(type, payload)</c>.
///
/// Lifetime: call <see cref="Dispose"/> on window close to ensure
/// CefRuntime.Shutdown is invoked exactly once.
/// </summary>
public partial class LabSimulatorView : UserControl, IDisposable
{
    private AvaloniaCefBrowser? _browser;
    private CefBridge? _bridge;
    private bool _cefInitialized;
    private bool _disposed;

    public LabSimulatorView()
    {
        InitializeComponent();
        Loaded += OnLoaded;
        // NOTE: do NOT subscribe to Unloaded → Dispose. CefRuntime is a
        // process-wide singleton; shutting it down when this control is
        // removed from the visual tree (e.g. tab switch) would prevent
        // the simulator from ever loading again. The browser is closed
        // and recreated inside the same runtime instead.
    }

    // ─────────────────────────────────────────────────────────────────────
    //  Lifecycle
    // ─────────────────────────────────────────────────────────────────────

    private void OnLoaded(object? sender, RoutedEventArgs e)
    {
        if (_cefInitialized || _disposed) return;
        TryStartCef();
    }

    /// <summary>
    /// Tear down the browser control and the bridge but leave the
    /// process-wide CEF runtime alive. Call this only when the entire
    /// application is shutting down.
    /// </summary>
    public void Dispose()
    {
        if (_disposed) return;
        _disposed = true;

        try
        {
            _bridge?.Dispose();
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"[LabSimulator] Bridge dispose error: {ex.Message}");
        }
        _bridge = null;

        try
        {
            // Closing the host before disposing the browser is required
            // by CEF to avoid native crashes. AvaloniaCefBrowser.Dispose
            // handles that internally.
            _browser?.Dispose();
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"[LabSimulator] Browser dispose error: {ex.Message}");
        }
        _browser = null;
    }

    // ─────────────────────────────────────────────────────────────────────
    //  CefGlue availability detection + startup
    // ─────────────────────────────────────────────────────────────────────

    private void TryStartCef()
    {
        try
        {
            // 1) Probe whether the native lib is resolvable. This call throws
            //    CefRuntimeNotFoundException (or a DllNotFoundException) on
            //    dev machines where the runtime bundle is not present.
            CefRuntime.Load();

            // 2) Build the Cef settings. Caches are placed under
            //    %LocalAppData%/RadicalTrainingPlatform/CefCache (or platform equivalent).
            var cacheDir = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "RadicalTrainingPlatform", "CefCache");

            Directory.CreateDirectory(cacheDir);

            var settings = new CefSettings
            {
                CachePath = cacheDir,
                LogFile = Path.Combine(cacheDir, "cef.log"),
                LogSeverity = CefLogSeverity.Warning,
                NoSandbox = true,            // Sandboxes don't play well with bundled apps
                MultiThreadedMessageLoop = true,
                WindowlessRenderingEnabled = false,
                RemoteDebuggingPort = 0,     // 0 = disabled
            };

            // 3) Resolve the local index.html (sibling of the app binary,
            //    under  LabSimulator/Web/index.html  in the source tree,
            //    copied to  LabSimulator/Web/index.html  next to the .exe).
            var htmlPath = ResolveLocalIndexPath();
            if (htmlPath == null || !File.Exists(htmlPath))
            {
                ShowError(
                    "Lab Simulator requires the desktop app bundle. " +
                    "Download from GitHub releases.");
                return;
            }

            // 4) Create the bridge and the browser. The CefBridge
            //    is registered into JS as window.dotnetBridge.
            _bridge = new CefBridge(this);

            _browser = new AvaloniaCefBrowser();
            _browser.Address = new Uri(htmlPath).AbsoluteUri;
            // Register the bridge so JS can call window.dotnetBridge.call(...).
            // MethodCallHandler is a wrapper around the actual JS→C# invocation.
            // It receives a Func<object> (the original call) and returns its result.
            // Using func => func() simply forwards the call without interception.
            _browser.RegisterJavascriptObject(
                _bridge,
                "dotnetBridge",
                new MethodCallHandler(func => func()));
            _browser.TitleChanged += OnBrowserTitleChanged;

            // 5) The AvaloniaCefBrowser is itself an Avalonia Control; add
            //    it directly to the host. If the user's package flavour
            //    returns a raw WinForms control, the wrapper package
            //    provides the integration. We degrade to a placeholder
            //    so the panel still lays out.
            WebViewHost.Content = _browser;
            WebViewHost.IsVisible = true;
            LoadingPanel.IsVisible = false;

            _cefInitialized = true;
        }
        catch (DllNotFoundException ex)
        {
            Debug.WriteLine($"[LabSimulator] CefGlue native lib missing: {ex.Message}");
            ShowError("Lab Simulator requires the desktop app bundle. Download from GitHub releases.");
        }
        catch (FileNotFoundException ex)
        {
            Debug.WriteLine($"[LabSimulator] CefGlue file missing: {ex.Message}");
            ShowError("Lab Simulator requires the desktop app bundle. Download from GitHub releases.");
        }
        catch (CefRuntimeException ex)
        {
            Debug.WriteLine($"[LabSimulator] Cef init failed: {ex.Message}");
            ShowError(
                "Lab Simulator failed to initialize. The Cef runtime reported: " +
                ex.Message);
        }
        catch (Exception ex)
        {
            // Last-ditch catch — never let the simulator page crash the app.
            Debug.WriteLine($"[LabSimulator] Unexpected error: {ex}");
            ShowError(
                "Lab Simulator could not be started. " +
                (ex.Message ?? "Unknown error") +
                ". Download the desktop bundle from GitHub releases.");
        }
    }

    /// <summary>
    /// Locate the bundled LabSimulator/Web/index.html. We try the
    /// installed location first (<c>AppContext.BaseDirectory</c>), and
    /// fall back to the source-tree location during development.
    /// </summary>
    private static string? ResolveLocalIndexPath()
    {
        var candidates = new[]
        {
            // 1) Deployed location (bin output)
            Path.Combine(AppContext.BaseDirectory, "LabSimulator", "Web", "index.html"),
            // 2) Source-tree fallback when running from the repo root
            Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..",
                "RadicalTrainingPlatform", "LabSimulator", "Web", "index.html"),
            // 3) One level up from the app binary (publish layouts)
            Path.Combine(AppContext.BaseDirectory, "..", "LabSimulator", "Web", "index.html"),
        };

        foreach (var p in candidates)
        {
            try
            {
                var full = Path.GetFullPath(p);
                if (File.Exists(full)) return full;
            }
            catch
            {
                // Path.GetFullPath can throw on weird inputs — ignore.
            }
        }
        return null;
    }

    /// <summary>
    /// Create an Avalonia-side visual host for the Cef browser. The
    /// CefGlue.Avalonia package exposes an <c>AvaloniaCefBrowser</c>
    /// which is itself an Avalonia Control and can be added directly.
    /// </summary>
    private static Control CreateAvaloniaHostFor(AvaloniaCefBrowser browser)
    {
        // AvaloniaCefBrowser is itself a Control, so the caller can host
        // it directly. This method is kept for backwards compatibility
        // with earlier code that passed a raw browser reference.
        return browser;
    }

    // ─────────────────────────────────────────────────────────────────────
    //  Bridge helper — allows CefBridge to push JS into the page
    // ─────────────────────────────────────────────────────────────────────

    /// <summary>
    /// Execute a JavaScript snippet in the browser. Delegates to the
    /// CefGlue <c>AvaloniaCefBrowser.ExecuteJavaScript</c> helper
    /// when available; otherwise no-ops so the simulator gracefully
    /// degrades.
    /// </summary>
    public void ExecuteScript(string script)
    {
        if (_disposed || _browser == null) return;
        try
        {
            // AvaloniaCefBrowser exposes an ExecuteJavaScript method
            // which runs a snippet in the browser's main frame.
            _browser.ExecuteJavaScript(script, null, 0);
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"[LabSimulator] ExecuteScript error: {ex.Message}");
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    //  Browser events
    // ─────────────────────────────────────────────────────────────────────

    private void OnBrowserTitleChanged(object? sender, string title)
    {
        // The JS app sets document.title = "Nutanix Lab Simulator" on boot;
        // when we observe that, hide the loading panel.
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
        });
    }

    private void OnDownloadClicked(object? sender, RoutedEventArgs e)
    {
        try
        {
            // Use Avalonia's launcher if available (cross-platform), else
            // fall back to OS shell.
            var url = "https://github.com";
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
