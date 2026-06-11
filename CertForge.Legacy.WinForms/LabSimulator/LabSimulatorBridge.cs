using System.Text.Json;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace CertForge.LabSimulator;

/// <summary>
/// Bidirectional PostMessage JSON bridge between C# and the WebView2 JS app.
/// </summary>
sealed class LabSimulatorBridge : IDisposable
{
    private readonly WebView2 _webView;
    private readonly Dictionary<string, Func<JsonElement?, Task<object?>>> _handlers = new();

    public LabSimulatorBridge(WebView2 webView)
    {
        _webView = webView;
        RegisterDefaultHandlers();
    }

    public void Attach()
    {
        _webView.CoreWebView2.WebMessageReceived += OnWebMessageReceived;
    }

    public void Dispose()
    {
        if (_webView.CoreWebView2 != null)
            _webView.CoreWebView2.WebMessageReceived -= OnWebMessageReceived;
    }

    /// <summary>
    /// Send a message from C# to JS.
    /// </summary>
    public void PostToJs(string type, object? payload = null)
    {
        var msg = JsonSerializer.Serialize(new { type, payload },
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        _webView.CoreWebView2.PostWebMessageAsJson(msg);
    }

    /// <summary>
    /// Register a handler for a message type from JS.
    /// </summary>
    public void On(string type, Func<JsonElement?, Task<object?>> handler)
    {
        _handlers[type] = handler;
    }

    private async void OnWebMessageReceived(object? sender, CoreWebView2WebMessageReceivedEventArgs e)
    {
        try
        {
            var json = e.WebMessageAsJson;
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            var type = root.GetProperty("type").GetString() ?? "";
            var id = root.TryGetProperty("id", out var idProp) ? idProp.GetString() : null;
            var payload = root.TryGetProperty("payload", out var p) ? p.Clone() : (JsonElement?)null;

            if (_handlers.TryGetValue(type, out var handler))
            {
                try
                {
                    var result = await handler(payload);
                    if (id != null)
                        PostToJs("response", new { id, success = true, data = result });
                }
                catch (Exception ex)
                {
                    if (id != null)
                        PostToJs("response", new { id, success = false, error = ex.Message });
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"[Bridge] Error: {ex.Message}");
        }
    }

    private void RegisterDefaultHandlers()
    {
        On("ready", _ =>
        {
            PostToJs("init", new
            {
                appVersion = Application.ProductVersion,
                webView2Version = LabSimulatorLauncher.GetWebView2Version()
            });
            return Task.FromResult<object?>(null);
        });

        On("log", payload =>
        {
            var msg = payload?.GetProperty("message").GetString() ?? "";
            System.Diagnostics.Debug.WriteLine($"[Simulator] {msg}");
            return Task.FromResult<object?>(null);
        });
    }
}
