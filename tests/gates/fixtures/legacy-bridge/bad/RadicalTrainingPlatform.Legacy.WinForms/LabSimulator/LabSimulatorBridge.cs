// Fixture: the Legacy bridge defects R-05/R-19 exist to catch.
//
// This must FAIL scripts/check-legacy-bridge.py. It is a deliberate miniature
// of the real bridge rather than a copy of it — a copied source drifts from the
// real one and would stop testing the checker's anchors. The authoritative
// fixture is the checker's own --self-test, which seeds each defect onto the
// real file; this one is the human-readable example.
//
// Defects present here:
//   1. the documented surface names ready, log — and the code registers a
//      removed no-effect handler on top of that
//   2. an unregistered message type is dropped in silence
//   3. the surface is not listable
//   4. the log handler reads "message" with GetProperty
using System.Text.Json;

namespace RadicalTrainingPlatform.LabSimulator;

sealed class LabSimulatorBridge
{
    private readonly Dictionary<string, Func<JsonElement?, Task<object?>>> _handlers = new();

    public LabSimulatorBridge()
    {
        RegisterDefaultHandlers();
    }

    // R-05 surface contract. The surface here is deliberately narrow:
    //
    ///   ready, log
    //
    private void OnWebMessageReceived(string json)
    {
        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;
        var type = root.GetProperty("type").GetString() ?? "";
        var id = root.TryGetProperty("id", out var idProp) ? idProp.GetString() : null;
        var payload = root.TryGetProperty("payload", out var p) ? p.Clone() : (JsonElement?)null;

        if (_handlers.TryGetValue(type, out var handler))
        {
            var result = handler(payload).GetAwaiter().GetResult();
            PostToJs("response", new { id, success = true, data = result });
        }
        // no fallback: an unknown type is dropped
    }

    private void RegisterDefaultHandlers()
    {
        On("ready", _ =>
        {
            PostToJs("init", new { appVersion = "0.0.0" });
            return Task.FromResult<object?>(null);
        });

        On("get_settings", _ => Task.FromResult<object?>(null));

        On("log", payload =>
        {
            var msg = payload?.GetProperty("message").GetString() ?? "";
            System.Diagnostics.Debug.WriteLine($"[Simulator] {msg}");
            return Task.FromResult<object?>(null);
        });
    }

    private void On(string type, Func<JsonElement?, Task<object?>> handler)
    {
        _handlers[type] = handler;
    }

    private void PostToJs(string type, object? payload = null) { }
}
