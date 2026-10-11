using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using RadicalTrainingPlatform.Core;
using RadicalTrainingPlatform.Core.Abstractions;
using RadicalTrainingPlatform.Core.Models;

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
/// Incoming message types (R-05: every registered handler performs a real
/// effect; a handler with no backing implementation is absent from this
/// surface — listing one is a test failure):
///   ready, ping, log, load_exam_list, get_stats, save_progress,
///   load_progress, get_question, get_session, reset_session
///
/// Removed in T-15/S46-05 (acknowledged without effects): submit_answer,
/// export_results, import_results, get_settings, set_setting. Exam progress
/// lives in the JS ProgressStore; there is no Core settings store.
/// </summary>
public sealed class CefBridge : IDisposable
{
    private readonly Action<string> _sendScript;
    private readonly IQuestionParser _parser;
    private readonly ISessionStore _sessionStore;
    private readonly Dictionary<string, Func<JsonElement?, Task<object?>>> _handlers = new();
    private readonly Lazy<Dictionary<string, List<Question>>> _exams;
    private bool _disposed;

    /// <summary>Registered handler type names (R-05 surface contract).</summary>
    public IReadOnlyCollection<string> HandlerTypes => _handlers.Keys.OrderBy(k => k, StringComparer.Ordinal).ToList();

    /// <param name="sendScript">Executes JS in the browser (C# → JS leg).</param>
    /// <param name="parser">Real question/catalog data source.</param>
    /// <param name="sessionStore">Durable progress persistence.</param>
    public CefBridge(Action<string> sendScript, IQuestionParser parser, ISessionStore sessionStore)
    {
        _sendScript = sendScript;
        _parser = parser;
        _sessionStore = sessionStore;
        _exams = new Lazy<Dictionary<string, List<Question>>>(() => _parser.LoadAllExams());
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
            // JsonEncodedText escapes for a DOUBLE-quoted context (" and \ are
            // escaped, ' is NOT) — so the JS literal must use double quotes,
            // or an envelope containing an apostrophe (any question stem with
            // "it's") breaks JS parsing.
            sb.Append("})(JSON.parse(\"").Append(JsonEncodedText.Encode(json).ToString()).Append("\"));}catch(e){console.error(e);}");

            _sendScript(sb.ToString());
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
            // Real catalog via Core (was: 5 hardcoded rows that went stale —
            // e.g. listed NCA 6.5 with counts that never matched the bank).
            var exams = _parser.BuildCatalog()
                .Select(e => new
                {
                    id = e.ExamCode.ToLowerInvariant(),
                    title = e.DisplayName,
                    questions = e.QuestionCount,
                })
                .ToList();
            return Task.FromResult<object?>(exams);
        });

        // ── get_stats : aggregate study statistics from the session store ──
        On("get_stats", _ =>
        {
            int bank = _exams.Value.Values.Sum(qs => qs.Count);
            int answered = 0, correct = 0;
            string? lastSession = null;
            foreach (var id in _sessionStore.List())
            {
                lastSession = id;
                var raw = _sessionStore.Load(id);
                if (string.IsNullOrEmpty(raw)) continue;
                try
                {
                    using var doc = JsonDocument.Parse(raw);
                    if (doc.RootElement.TryGetProperty("answered", out var a) && a.ValueKind == JsonValueKind.Number)
                        answered += a.GetInt32();
                    if (doc.RootElement.TryGetProperty("correct", out var c) && c.ValueKind == JsonValueKind.Number)
                        correct += c.GetInt32();
                }
                catch (JsonException)
                {
                    // Corrupt session file — skip it rather than invent numbers.
                }
            }
            return Task.FromResult<object?>(new
            {
                totalQuestions = bank,
                answered,
                correct,
                streakDays = 0,
                lastSession,
            });
        });

        // ── save_progress / load_progress : session persistence ──
        On("save_progress", payload =>
        {
            var sessionId = payload?.TryGetProperty("sessionId", out var s) == true
                ? s.GetString() : null;
            if (string.IsNullOrEmpty(sessionId))
                return Task.FromResult<object?>(new { saved = false, error = "sessionId required" });

            // Serialize the payload subtree to a JSON string and persist it.
            var json = payload!.Value.TryGetProperty("data", out var d)
                ? d.GetRawText()
                : payload.Value.GetRawText();
            _sessionStore.Save(sessionId, json);
            return Task.FromResult<object?>(new { saved = true });
        });

        On("load_progress", payload =>
        {
            var sessionId = payload?.TryGetProperty("sessionId", out var s) == true
                ? s.GetString() : null;
            if (string.IsNullOrEmpty(sessionId) || !_sessionStore.Has(sessionId))
                return Task.FromResult<object?>(new { hasProgress = false });

            var stored = _sessionStore.Load(sessionId);
            using var doc = JsonDocument.Parse(stored!);
            return Task.FromResult<object?>(new { hasProgress = true, data = doc.RootElement.Clone() });
        });

        // ── get_question : fetch a single question by id ──
        // Contract: id is "EXAMCODE:NUMBER" (e.g. "NCA-75:12"), the display
        // key the sidebar and PDF exporter use. Real bank lookup (was:
        // always { found = false } pointing at a QuestionBank type that
        // never existed).
        On("get_question", payload =>
        {
            string? id = null;
            if (payload.HasValue)
                id = payload.Value.TryGetProperty("id", out var x) ? x.GetString() : null;
            if (string.IsNullOrEmpty(id))
                return Task.FromResult<object?>(new { found = false });

            var parts = id.Split(':', 2);
            var code = parts[0];
            if (!_exams.Value.TryGetValue(code, out var questions)
                || parts.Length < 2 || !int.TryParse(parts[1], out var num))
                return Task.FromResult<object?>(new { id, found = false });

            var q = questions.FirstOrDefault(qq => qq.Id == num);
            if (q == null)
                return Task.FromResult<object?>(new { id, found = false });

            return Task.FromResult<object?>(new
            {
                id,
                found = true,
                stem = q.Stem,
                domain = q.Domain,
                options = q.Options.Select(o => new { letter = o.Letter, text = o.Text }),
            });
        });

        // ── get_session : real session inventory from the store ──
        On("get_session", payload =>
        {
            var sessionId = payload?.TryGetProperty("sessionId", out var s) == true
                ? s.GetString() : null;
            if (!string.IsNullOrEmpty(sessionId))
            {
                var exists = _sessionStore.Has(sessionId);
                return Task.FromResult<object?>(new
                {
                    sessionId,
                    exists,
                    hasProgress = exists,
                    data = exists ? (object?)_sessionStore.Load(sessionId) : null,
                });
            }
            var ids = _sessionStore.List();
            return Task.FromResult<object?>(new
            {
                sessions = ids,
                count = ids.Count,
            });
        });

        // ── reset_session : remove defined session data, confirm the baseline ──
        On("reset_session", payload =>
        {
            var sessionId = payload?.TryGetProperty("sessionId", out var s) == true
                ? s.GetString() : null;
            int removed = 0;
            if (!string.IsNullOrEmpty(sessionId))
            {
                if (_sessionStore.Has(sessionId))
                {
                    _sessionStore.Delete(sessionId);
                    removed = 1;
                }
            }
            else
            {
                foreach (var id in _sessionStore.List())
                {
                    _sessionStore.Delete(id);
                    removed++;
                }
            }
            var remaining = _sessionStore.List().Count;
            return Task.FromResult<object?>(new { reset = true, removed, remainingSessions = remaining });
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
