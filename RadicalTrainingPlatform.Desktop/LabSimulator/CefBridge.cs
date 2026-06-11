using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace RadicalTrainingPlatform.Avalonia.LabSimulator;

/// <summary>
/// Bridge between the Lab Simulator JS app (running in CefGlue's
/// ChromiumWebBrowser) and the host C# process.
///
/// Exposed to JS as <c>window.dotnetBridge</c> via CefGlue's
/// <c>RegisterJsObject</c>. The JS side can call into us with a
/// PostMessage-style JSON envelope:
///
///   window.dotnetBridge.call(JSON.stringify({
///       type:   "ping",
///       id:     "abc123",
///       payload:{ ... }
///   }));
///
/// We respond asynchronously by invoking
/// <see cref="CefRuntime.PostMessage"/> or, if the running CefGlue
/// flavour exposes an ExecuteScriptAsync-style helper, by calling it
/// on the parent browser. The exact delivery mechanism depends on
/// the package version in use; <see cref="CefBridge"/> works with
/// both the CefV8Handler-style API and the higher-level wrapper
/// packages that ship a "send" helper.
///
/// Incoming message types (mirror the original WebView2 bridge so
/// BridgeClient.js is source-compatible):
///   ready, ping, log, load_exam_list, get_stats, save_progress,
///   load_progress, submit_answer, get_question, get_session,
///   reset_session, export_results, import_results, get_settings,
///   set_setting
/// </summary>
public sealed class CefBridge : IDisposable
{
    private readonly LabSimulatorView _owner;
    private readonly Dictionary<string, Func<JsonElement?, Task<object?>>> _handlers = new();
    private bool _disposed;

    public CefBridge(LabSimulatorView owner)
    {
        _owner = owner;
        RegisterDefaultHandlers();
    }

    // ─────────────────────────────────────────────────────────────────────
    //  JS → C# :  CefV8Handler-style entry point
    // ─────────────────────────────────────────────────────────────────────

    /// <summary>
    /// Called by CefGlue when JS invokes a function on the
    /// registered "dotnetBridge" object. We expect the JS to call
    /// us with a single string argument that is a JSON envelope.
    /// </summary>
    /// <param name="json">A JSON string of the form
    /// <c>{ "type": "...", "id": "...", "payload": ... }</c>.</param>
    /// <returns>The JSON-serialized result for the JS promise.</returns>
    public object? Call(string json)
    {
        if (_disposed) return null;

        try
        {
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            var type = root.TryGetProperty("type", out var t) ? t.GetString() ?? "" : "";
            var id = root.TryGetProperty("id", out var idProp) && idProp.ValueKind == JsonValueKind.String
                ? idProp.GetString()
                : null;
            var payload = root.TryGetProperty("payload", out var p) ? p.Clone() : (JsonElement?)null;

            if (_handlers.TryGetValue(type, out var handler))
            {
                // Fire-and-await the handler on a background task so we
                // never block the CEF IO thread.
                _ = Task.Run(async () =>
                {
                    try
                    {
                        var result = await handler(payload);
                        if (id != null)
                            PostResponse(id, success: true, data: result);
                    }
                    catch (Exception ex)
                    {
                        if (id != null)
                            PostResponse(id, success: false, error: ex.Message);
                    }
                });
                return null; // async — JS will receive the response via the message pump
            }
            else
            {
                Debug.WriteLine($"[CefBridge] No handler for type '{type}'");
                if (id != null)
                    PostResponse(id, success: false, error: $"unknown type '{type}'");
            }
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"[CefBridge] Call() parse error: {ex.Message}");
        }
        return null;
    }

    // ─────────────────────────────────────────────────────────────────────
    //  C# → JS :  PostToJs
    // ─────────────────────────────────────────────────────────────────────

    /// <summary>
    /// Send a message to the JS app. Mirrors the old WebView2
    /// bridge's <c>PostToJs</c> method. The JS BridgeClient listens
    /// on the chromium message event and dispatches by <c>type</c>.
    /// </summary>
    public void PostToJs(string type, object? payload = null)
    {
        if (_disposed) return;
        var msg = JsonSerializer.Serialize(new { type, payload });
        ExecuteScriptAsync(msg);
    }

    private void PostResponse(string id, bool success, object? data = null, string? error = null)
    {
        if (success)
            PostToJs("response", new { id, success, data });
        else
            PostToJs("response", new { id, success, error });
    }

    /// <summary>
    /// Wrap a JSON envelope in the JS-callable helper
    /// <c>window.__cefBridgeOnMessage(...)</c> and execute it. This
    /// is the lowest-common-denominator approach that works with
    /// every CefGlue flavour.
    /// </summary>
    private void ExecuteScriptAsync(string json)
    {
        try
        {
            // Build a JS snippet that:
            //   1) parses the envelope
            //   2) dispatches it to the existing BridgeClient dispatcher
            //      by faking the chrome.webview message event
            var sb = new StringBuilder();
            sb.Append("try{(function(msg){");
            sb.Append("  if(window.__cefBridgeDispatch){window.__cefBridgeDispatch(msg);}");
            sb.Append("  else if(window.__cefBridgeQueue){window.__cefBridgeQueue.push(msg);}");
            sb.Append("})(JSON.parse('").Append(JsonEncodedText.Encode(json).ToString()).Append("'));}catch(e){console.error(e);}");

            _owner.ExecuteScript(sb.ToString());
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"[CefBridge] ExecuteScriptAsync error: {ex.Message}");
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    //  Handler registration
    // ─────────────────────────────────────────────────────────────────────

    /// <summary>
    /// Register a handler for a given message type. Handlers are
    /// called on a background thread; they may freely await
    /// async work.
    /// </summary>
    public void On(string type, Func<JsonElement?, Task<object?>> handler)
    {
        _handlers[type] = handler;
    }

    private void RegisterDefaultHandlers()
    {
        // ── ready : JS announces it has booted ──
        On("ready", _ =>
        {
            PostToJs("init", new
            {
                appVersion = typeof(CefBridge).Assembly.GetName().Version?.ToString() ?? "0.0.0",
                cefVersion = "120.6099.204",
            });
            return Task.FromResult<object?>(null);
        });

        // ── ping : health check; JS awaits a 'pong' response ──
        On("ping", payload =>
        {
            var p = payload;
            var echo = p.HasValue && p.Value.ValueKind == JsonValueKind.String
                ? p.Value.GetString()
                : null;
            return Task.FromResult<object?>(new { pong = true, echo });
        });

        // ── log : JS wants a line written to the host debug log ──
        On("log", payload =>
        {
            var msg = payload?.ValueKind == JsonValueKind.Object &&
                      payload.Value.TryGetProperty("message", out var m)
                ? m.GetString() : payload?.ToString();
            Debug.WriteLine($"[Simulator] {msg}");
            return Task.FromResult<object?>(null);
        });

        // ── load_exam_list : deliver the list of available exams ──
        On("load_exam_list", _ =>
        {
            // TODO: pull from RadicalTrainingPlatform.Core.ExamCatalog in production
            var exams = new[]
            {
                new { id = "nca-65",   title = "NCA 6.5",  questions = 75  },
                new { id = "ncp-us",   title = "NCP-US",   questions = 100 },
                new { id = "ncp-ci",   title = "NCP-CI",   questions = 100 },
                new { id = "ncp-ai",   title = "NCP-AI",   questions = 100 },
                new { id = "ncm-mci",  title = "NCM-MCI",  questions = 100 },
            };
            return Task.FromResult<object?>(exams);
        });

        // ── get_stats : aggregate study statistics ──
        On("get_stats", _ =>
        {
            return Task.FromResult<object?>(new
            {
                totalQuestions = 475,
                answered = 0,
                correct = 0,
                streakDays = 0,
                lastSession = (string?)null,
            });
        });

        // ── save_progress / load_progress : session persistence ──
        On("save_progress", payload =>
        {
            // TODO: persist via RadicalTrainingPlatform.Core.SessionStore
            var sessionId = payload?.TryGetProperty("sessionId", out var s) == true
                ? s.GetString() : null;
            Debug.WriteLine($"[CefBridge] save_progress {sessionId}");
            return Task.FromResult<object?>(new { saved = true });
        });

        On("load_progress", payload =>
        {
            // TODO: read from RadicalTrainingPlatform.Core.SessionStore
            return Task.FromResult<object?>(new { hasProgress = false });
        });

        // ── submit_answer : a learner answered a question ──
        On("submit_answer", payload =>
        {
            if (payload == null) return Task.FromResult<object?>(null);
            var p = payload.Value;
            var questionId = p.TryGetProperty("questionId", out var q) ? q.GetString() : null;
            var answer     = p.TryGetProperty("answer",     out var a) ? a.ToString() : null;
            var correct    = p.TryGetProperty("correct",    out var c) ? c.GetBoolean() : false;
            Debug.WriteLine($"[CefBridge] submit_answer q={questionId} ans={answer} correct={correct}");
            return Task.FromResult<object?>(new { recorded = true });
        });

        // ── get_question : fetch a single question by id ──
        On("get_question", payload =>
        {
            string? id = null;
            if (payload.HasValue)
            {
                id = payload.Value.TryGetProperty("id", out var x) ? x.GetString() : null;
            }
            // TODO: load from RadicalTrainingPlatform.Core.QuestionBank
            return Task.FromResult<object?>(new { id, found = false });
        });

        // ── get_session / reset_session ──
        On("get_session", _ =>
            Task.FromResult<object?>(new { active = false, sessionId = (string?)null }));

        On("reset_session", _ =>
        {
            Debug.WriteLine("[CefBridge] reset_session");
            return Task.FromResult<object?>(new { reset = true });
        });

        // ── export_results / import_results : CSV exchange ──
        On("export_results", _ =>
        {
            // TODO: build CSV from session history
            return Task.FromResult<object?>(new { csv = "", rowCount = 0 });
        });

        On("import_results", payload =>
        {
            var csv = payload?.TryGetProperty("csv", out var c) == true ? c.GetString() : null;
            var rows = csv?.Split('\n').Length ?? 0;
            return Task.FromResult<object?>(new { imported = rows });
        });

        // ── get_settings / set_setting : key/value prefs store ──
        On("get_settings", _ =>
        {
            return Task.FromResult<object?>(new Dictionary<string, object?>
            {
                ["theme"]         = "synthwave",
                ["showTimer"]     = true,
                ["shuffleOptions"]= true,
            });
        });

        On("set_setting", payload =>
        {
            if (payload == null) return Task.FromResult<object?>(null);
            var p = payload.Value;
            var key = p.TryGetProperty("key", out var k) ? k.GetString() : null;
            var val = p.TryGetProperty("value", out var v) ? v.ToString() : null;
            Debug.WriteLine($"[CefBridge] set_setting {key}={val}");
            return Task.FromResult<object?>(new { ok = true });
        });
    }

    // ─────────────────────────────────────────────────────────────────────
    //  IDisposable
    // ─────────────────────────────────────────────────────────────────────

    public void Dispose()
    {
        if (_disposed) return;
        _disposed = true;
        _handlers.Clear();
    }
}
