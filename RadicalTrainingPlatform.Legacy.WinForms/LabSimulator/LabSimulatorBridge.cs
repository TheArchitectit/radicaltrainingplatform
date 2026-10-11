using System.Text.Json;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace RadicalTrainingPlatform.LabSimulator;

/// <summary>
/// Bidirectional PostMessage JSON bridge between C# and the WebView2 JS app.
///
/// R-05 surface contract: every registered handler performs a real effect, and
/// a handler with no backing implementation is absent from this surface —
/// listing one is a test failure. The surface here is deliberately narrow:
///
///   ready, log
///
/// The simulator's JS (<c>Web/js/</c>) calls <c>bridge.post('ready')</c> and
/// nothing else; it keeps its state in <c>StateEngine</c>, not in the host. So
/// there is nothing to wire for stats, reset, settings, submit or import — the
/// desktop Avalonia host implements those (see
/// <c>RadicalTrainingPlatform.Desktop/LabSimulator/CefBridge.cs</c>) against a
/// real session store, and this bridge does not pretend to.
///
/// What this bridge does owe a caller is an honest answer for a type it does
/// not implement. It used to drop those on the floor: the JS <c>send()</c>
/// promise then hung for its full 10-second timeout and failed with "Bridge
/// timeout", which reads as a broken host rather than an unimplemented type.
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

    /// <summary>Registered handler type names (R-05 surface contract).</summary>
    public IReadOnlyCollection<string> HandlerTypes =>
        _handlers.Keys.OrderBy(k => k, StringComparer.Ordinal).ToList();

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
            else
            {
                // R-05 / R-19: an unimplemented type is answered, not ignored.
                // Silence costs the caller its full timeout and misreports the
                // cause as a dead host.
                System.Diagnostics.Debug.WriteLine($"[Bridge] No handler for type '{type}'");
                if (id != null)
                    PostToJs("response", new { id, success = false, error = $"unknown type '{type}'" });
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
            // Tolerate a payload with no "message" — GetProperty throws on a
            // missing key, which would answer a bare log line with a failure
            // response and a KeyNotFoundException for its error text. The
            // desktop bridge's log handler has always read it this way.
            var msg = payload is { ValueKind: JsonValueKind.Object } p &&
                      p.TryGetProperty("message", out var m)
                ? m.GetString()
                : payload?.ToString();
            System.Diagnostics.Debug.WriteLine($"[Simulator] {msg}");
            return Task.FromResult<object?>(null);
        });
    }
}
