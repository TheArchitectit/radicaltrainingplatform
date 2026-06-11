using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace CertForge.LabSimulator;

/// <summary>
/// Popup form hosting the Nutanix Lab Simulator via WebView2.
/// </summary>
sealed class LabSimulatorForm : Form
{
    private WebView2? _webView;
    private LabSimulatorBridge? _bridge;
    private Panel? _loadingPanel;

    public LabSimulatorForm()
    {
        Text = "Nutanix Lab Simulator — CertForge";
        Size = new Size(1280, 800);
        MinimumSize = new Size(1024, 600);
        StartPosition = FormStartPosition.CenterScreen;
        ShowInTaskbar = true;
        Icon = null;
        BackColor = Color.White;

        BuildLoadingPanel();
        InitWebView();
    }

    private void BuildLoadingPanel()
    {
        _loadingPanel = new Panel
        {
            Dock = DockStyle.Fill,
            BackColor = Color.FromArgb(245, 246, 250),
        };

        var label = new Label
        {
            Text = "Loading Nutanix Lab Simulator...",
            AutoSize = false,
            Dock = DockStyle.Fill,
            TextAlign = ContentAlignment.MiddleCenter,
            Font = new Font("Segoe UI", 14f),
            ForeColor = Color.FromArgb(80, 90, 110),
        };

        _loadingPanel.Controls.Add(label);
        Controls.Add(_loadingPanel);
    }

    private async void InitWebView()
    {
        try
        {
            _webView = new WebView2 { Dock = DockStyle.Fill };
            Controls.Add(_webView);
            _webView.Visible = false;

            var userDataFolder = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "CertForge", "WebView2Data");
            Directory.CreateDirectory(userDataFolder);

            var env = await CoreWebView2Environment.CreateAsync(
                userDataFolder: userDataFolder);

            await _webView.EnsureCoreWebView2Async(env);

            // Map virtual host to Web content folder
            var webRoot = Path.Combine(AppContext.BaseDirectory, "LabSimulator", "Web");
            _webView.CoreWebView2.SetVirtualHostNameToFolderMapping(
                "certstudy.local", webRoot,
                CoreWebView2HostResourceAccessKind.Allow);

            // Security: disable dev tools in release, enable in debug
#if DEBUG
            _webView.CoreWebView2.Settings.AreDevToolsEnabled = true;
#else
            _webView.CoreWebView2.Settings.AreDevToolsEnabled = false;
#endif
            _webView.CoreWebView2.Settings.IsStatusBarEnabled = false;
            _webView.CoreWebView2.Settings.AreDefaultContextMenusEnabled = false;

            // Set up bridge
            _bridge = new LabSimulatorBridge(_webView);
            _bridge.Attach();

            // Navigate to simulator
            _webView.CoreWebView2.Navigate("https://certstudy.local/index.html");

            _webView.NavigationCompleted += (_, args) =>
            {
                if (args.IsSuccess && _loadingPanel != null)
                {
                    _loadingPanel.Visible = false;
                    _webView.Visible = true;
                    _webView.BringToFront();
                }
            };
        }
        catch (Exception ex)
        {
            MessageBox.Show(
                $"Failed to initialize the Lab Simulator:\n\n{ex.Message}",
                "Lab Simulator Error",
                MessageBoxButtons.OK,
                MessageBoxIcon.Error);
            Close();
        }
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            _bridge?.Dispose();
            _webView?.Dispose();
        }
        base.Dispose(disposing);
    }
}
