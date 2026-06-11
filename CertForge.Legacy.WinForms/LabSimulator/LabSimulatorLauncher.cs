using Microsoft.Web.WebView2.Core;

namespace CertForge.LabSimulator;

/// <summary>
/// Checks WebView2 runtime availability and launches the simulator form.
/// </summary>
static class LabSimulatorLauncher
{
    private static LabSimulatorForm? _instance;

    public static bool IsWebView2Available()
    {
        try
        {
            var version = CoreWebView2Environment.GetAvailableBrowserVersionString();
            return !string.IsNullOrEmpty(version);
        }
        catch
        {
            return false;
        }
    }

    public static string? GetWebView2Version()
    {
        try { return CoreWebView2Environment.GetAvailableBrowserVersionString(); }
        catch { return null; }
    }

    public static void Launch(Form owner)
    {
        if (!IsWebView2Available())
        {
            MessageBox.Show(
                "The WebView2 runtime is required for the Lab Simulator.\n\n" +
                "Please install the Evergreen WebView2 Runtime from:\n" +
                "https://developer.microsoft.com/en-us/microsoft-edge/webview2/",
                "WebView2 Runtime Not Found",
                MessageBoxButtons.OK,
                MessageBoxIcon.Warning);
            return;
        }

        // Reuse existing instance if still open
        if (_instance != null && !_instance.IsDisposed)
        {
            _instance.BringToFront();
            _instance.Focus();
            return;
        }

        _instance = new LabSimulatorForm();
        _instance.Show();
    }
}
