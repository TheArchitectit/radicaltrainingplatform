using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
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
/// Incoming message types (mirror the original WebView2 bridge so
/// BridgeClient.js is source-compatible):
///   ready, ping, log, load_exam_list, get_stats, save_progress,
///   load_progress, submit_answer, get_question, get_session,
///   reset_session, export_results, import_results, get_settings,
///   set_setting
/// </summary>
public sealed class CefBridge : IDisposable
{
    private readonly Action<string> _sendScript;
    private readonly IQuestionParser _parser;
    private readonly ISessionStore _sessionStore;
    private readonly Dictionary<string, Func<JsonElement?, Task<object?>>> _handlers = new();
    private readonly Lazy<Dictionary<string, List<Question>>> _exams;
    private bool _disposed;

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
                cefVersion = "120.6099.215", // CefGlue package version in the csproj
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

        // ── get_stats : aggregate study statistics ──
        On("get_stats", _ =>
        {
            // Bank size from Core; answered/correct/streak from the answers
            // recorded by submit_answer (were hardcoded zeros).
            int bank = _exams.Value.Values.Sum(qs => qs.Count);
            var answers = LoadAnswers();
            return Task.FromResult<object?>(new
            {
                totalQuestions = bank,
                answered = answers.Count,
                correct = answers.Count(a => a.Correct),
                streakDays = StreakDays(answers.Select(a => a.At), DateTimeOffset.Now),
                lastSession = answers.Count == 0 ? null : answers.Max(a => a.At).ToString("o"),
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

        // ── submit_answer : a learner answered a question ──
        On("submit_answer", payload =>
        {
            if (payload?.ValueKind != JsonValueKind.Object)
                return Task.FromResult<object?>(new { recorded = false, error = "object payload required" });
            var p = payload.Value;
            var questionId = p.TryGetProperty("questionId", out var q) ? q.ToString() : "";
            var answer     = p.TryGetProperty("answer",     out var a) ? a.ToString() : "";
            var correct    = p.TryGetProperty("correct",    out var c) && c.ValueKind == JsonValueKind.True;
            if (string.IsNullOrEmpty(questionId))
                return Task.FromResult<object?>(new { recorded = false, error = "questionId required" });

            // Was logged and acknowledged but never stored.
            lock (_storeLock)
            {
                var answers = LoadAnswers();
                answers.Add(new AnswerRecord(questionId, answer, correct, DateTimeOffset.Now));
                SaveAnswers(answers);
            }
            return Task.FromResult<object?>(new { recorded = true });
        });

        // ── get_question : fetch a single question by id ──
        // Contract: "EXAMCODE:FILE:NUMBER" (e.g. "NCA-75:NCA-75-Part1.md:12")
        // is exact. Question numbers restart in every bank file, so the short
        // "EXAMCODE:NUMBER" is accepted only when exactly one file has that
        // number; otherwise the reply lists the candidates (it used to return
        // whichever file happened to load first).
        On("get_question", payload =>
        {
            string? id = null;
            if (payload?.ValueKind == JsonValueKind.Object
                && payload.Value.TryGetProperty("id", out var x) && x.ValueKind == JsonValueKind.String)
                id = x.GetString();
            if (string.IsNullOrEmpty(id))
                return Task.FromResult<object?>(new { found = false });

            var parts = id.Split(':');
            if (parts.Length is < 2 or > 3
                || !_exams.Value.TryGetValue(parts[0], out var questions)
                || !int.TryParse(parts[^1], out var num))
                return Task.FromResult<object?>(new { id, found = false });

            var matches = questions
                .Where(qq => qq.Id == num
                             && (parts.Length == 2
                                 || string.Equals(qq.SourceFile, parts[1], StringComparison.OrdinalIgnoreCase)))
                .ToList();
            if (matches.Count != 1)
                return Task.FromResult<object?>(new
                {
                    id,
                    found = false,
                    ambiguous = matches.Count > 1,
                    candidates = matches.Select(m => $"{parts[0]}:{m.SourceFile}:{m.Id}").ToList(),
                });

            var q = matches[0];
            return Task.FromResult<object?>(new
            {
                id = $"{parts[0]}:{q.SourceFile}:{q.Id}",
                found = true,
                stem = q.Stem,
                domain = q.Domain,
                options = q.Options.Select(o => new { letter = o.Letter, text = o.Text }),
            });
        });

        // ── get_session / reset_session : the recorded answer history ──
        On("get_session", _ =>
        {
            var count = LoadAnswers().Count;
            return Task.FromResult<object?>(new
            {
                active = count > 0,
                sessionId = count > 0 ? AnswersRecordId : null,
                answered = count,
            });
        });

        On("reset_session", _ =>
        {
            // Was acknowledged ({ reset = true }) without clearing anything.
            lock (_storeLock) _sessionStore.Delete(AnswersRecordId);
            return Task.FromResult<object?>(new { reset = true });
        });

        // ── export_results / import_results : CSV exchange ──
        On("export_results", _ =>
        {
            // Was a TODO returning an empty CSV.
            var answers = LoadAnswers();
            var sb = new StringBuilder(CsvHeader).Append('\n');
            foreach (var a in answers)
                sb.Append(Csv(a.QuestionId)).Append(',')
                  .Append(Csv(a.Answer)).Append(',')
                  .Append(a.Correct ? "true" : "false").Append(',')
                  .Append(a.At.ToString("o")).Append('\n');
            return Task.FromResult<object?>(new { csv = sb.ToString(), rowCount = answers.Count });
        });

        On("import_results", payload =>
        {
            // Was: reported the CSV's line count as "imported" and stored nothing.
            var csv = payload?.ValueKind == JsonValueKind.Object
                      && payload.Value.TryGetProperty("csv", out var c) && c.ValueKind == JsonValueKind.String
                ? c.GetString() : null;
            if (string.IsNullOrWhiteSpace(csv))
                return Task.FromResult<object?>(new { imported = 0, skipped = 0, error = "csv required" });

            var rows = new List<AnswerRecord>();
            int skipped = 0;
            foreach (var line in csv.Split('\n').Select(l => l.TrimEnd('\r')))
            {
                if (string.IsNullOrWhiteSpace(line) || line == CsvHeader) continue;
                var f = ParseCsvLine(line);
                if (f.Count == 4 && f[0].Length > 0 && bool.TryParse(f[2], out var ok)
                    && DateTimeOffset.TryParse(f[3], CultureInfo.InvariantCulture, DateTimeStyles.None, out var at))
                    rows.Add(new AnswerRecord(f[0], f[1], ok, at));
                else
                    skipped++;
            }
            lock (_storeLock)
            {
                var answers = LoadAnswers();
                answers.AddRange(rows);
                SaveAnswers(answers);
            }
            return Task.FromResult<object?>(new { imported = rows.Count, skipped });
        });

        // ── get_settings / set_setting : key/value prefs store ──
        On("get_settings", _ =>
            Task.FromResult<object?>(LoadSettings()));

        On("set_setting", payload =>
        {
            if (payload?.ValueKind != JsonValueKind.Object
                || !payload.Value.TryGetProperty("key", out var k) || k.ValueKind != JsonValueKind.String
                || string.IsNullOrWhiteSpace(k.GetString())
                || !payload.Value.TryGetProperty("value", out var v))
                return Task.FromResult<object?>(new { ok = false, error = "key and value required" });

            // Was logged and acknowledged but never stored.
            lock (_storeLock)
            {
                var settings = LoadSettings();
                settings[k.GetString()!] = v.Clone();
                _sessionStore.Save(SettingsRecordId, JsonSerializer.Serialize(settings));
            }
            return Task.FromResult<object?>(new { ok = true });
        });
    }

    // ─────────────────────────────────────────────────────────────────────
    //  Persistence helpers (records live in the ISessionStore)
    // ─────────────────────────────────────────────────────────────────────

    private const string AnswersRecordId = "bridge-answers";
    private const string SettingsRecordId = "bridge-settings";
    private const string CsvHeader = "questionId,answer,correct,timestamp";
    private readonly object _storeLock = new();

    private sealed record AnswerRecord(string QuestionId, string Answer, bool Correct, DateTimeOffset At);

    private List<AnswerRecord> LoadAnswers()
    {
        lock (_storeLock)
        {
            var json = _sessionStore.Load(AnswersRecordId);
            if (string.IsNullOrEmpty(json)) return new();
            try { return JsonSerializer.Deserialize<List<AnswerRecord>>(json) ?? new(); }
            catch (JsonException ex)
            {
                Debug.WriteLine($"[CefBridge] answer history unreadable, starting fresh: {ex.Message}");
                return new();
            }
        }
    }

    private void SaveAnswers(List<AnswerRecord> answers) =>
        _sessionStore.Save(AnswersRecordId, JsonSerializer.Serialize(answers));

    private Dictionary<string, object?> LoadSettings()
    {
        var settings = new Dictionary<string, object?>
        {
            ["theme"]          = "synthwave",
            ["showTimer"]      = true,
            ["shuffleOptions"] = true,
        };
        lock (_storeLock)
        {
            var json = _sessionStore.Load(SettingsRecordId);
            if (string.IsNullOrEmpty(json)) return settings;
            try
            {
                using var doc = JsonDocument.Parse(json);
                if (doc.RootElement.ValueKind == JsonValueKind.Object)
                    foreach (var prop in doc.RootElement.EnumerateObject())
                        settings[prop.Name] = prop.Value.Clone();
            }
            catch (JsonException ex)
            {
                Debug.WriteLine($"[CefBridge] settings unreadable, using defaults: {ex.Message}");
            }
        }
        return settings;
    }

    /// <summary>Consecutive days, ending today or yesterday, with at least one answer.</summary>
    public static int StreakDays(IEnumerable<DateTimeOffset> answeredAt, DateTimeOffset now)
    {
        var days = answeredAt.Select(t => t.LocalDateTime.Date).ToHashSet();
        var day = now.LocalDateTime.Date;
        if (!days.Contains(day)) day = day.AddDays(-1);
        int streak = 0;
        while (days.Contains(day)) { streak++; day = day.AddDays(-1); }
        return streak;
    }

    private static string Csv(string value) =>
        value.IndexOfAny(new[] { ',', '"', '\n', '\r' }) >= 0
            ? "\"" + value.Replace("\"", "\"\"") + "\""
            : value;

    private static List<string> ParseCsvLine(string line)
    {
        var fields = new List<string>();
        var sb = new StringBuilder();
        bool quoted = false;
        for (int i = 0; i < line.Length; i++)
        {
            var ch = line[i];
            if (quoted)
            {
                if (ch == '"' && i + 1 < line.Length && line[i + 1] == '"') { sb.Append('"'); i++; }
                else if (ch == '"') quoted = false;
                else sb.Append(ch);
            }
            else if (ch == '"') quoted = true;
            else if (ch == ',') { fields.Add(sb.ToString()); sb.Clear(); }
            else sb.Append(ch);
        }
        fields.Add(sb.ToString());
        return fields;
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
