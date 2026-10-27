using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using Microsoft.Extensions.DependencyInjection;
using RadicalTrainingPlatform.Avalonia.LabSimulator;
using RadicalTrainingPlatform.Core;
using RadicalTrainingPlatform.Core.Abstractions;
using Shouldly;
using Xunit;

namespace RadicalTrainingPlatform.Desktop.Tests;

/// <summary>
/// Drives the REAL SimulatorBridge handlers through the same entry point Avalonia WebView adapter
/// uses — Call(json) → handler → response envelope pumped back into JS.
/// Every handler used to be a mock: load_exam_list returned 5 hardcoded rows,
/// get_stats a literal 475, save/load_progress acknowledged without persisting.
/// These pin them to real Core data.
///
/// No CEF runtime required: the bridge takes an Action&lt;string&gt; for the
/// send side, so we capture the dispatch script and unwrap the envelope.
/// </summary>
public class SimulatorBridgeHandlerTests
{
    private static readonly object Gate = new();

    /// <summary>Bridge under test + the captured JS dispatch sink.</summary>
    private sealed class Harness : IDisposable
    {
        public SimulatorBridge Bridge { get; }
        public List<string> Sent { get; } = new();
        public ManualResetEventSlim Got { get; } = new(false);

        public Harness(ISessionStore? store = null)
        {
            var services = new ServiceCollection()
                .AddLogging()
                .AddRadicalTrainingPlatformCore()
                .BuildServiceProvider();
            store ??= services.GetRequiredService<ISessionStore>();

            Action<string> send = script =>
            {
                lock (Gate)
                {
                    Sent.Add(script);
                    // JsonEncodedText escapes every " as ", so sniff for
                    // the JSON.parse call site rather than "response" text.
                    if (script.Contains("JSON.parse(", StringComparison.Ordinal)) Got.Set();
                }
            };
            Bridge = new SimulatorBridge(
                send,
                services.GetRequiredService<IQuestionParser>(),
                store);
        }

        public void Dispose() => Bridge.Dispose();
    }

    /// <summary>
    /// Unwrap the double-encoded dispatch script back to the response envelope
    /// JS would receive: script =
    ///   try{(function(msg){...})(JSON.parse("&lt;literal&gt;"));}catch...
    /// &lt;literal&gt; is a JS string literal with inner quotes escaped — parse it
    /// as a quoted JSON string to peel one layer; the inside is the envelope.
    /// </summary>
    private static JsonElement DecodeEnvelope(string script)
    {
        var start = script.IndexOf("JSON.parse(\"", StringComparison.Ordinal) + "JSON.parse(\"".Length;
        var end = script.LastIndexOf("\"))", StringComparison.Ordinal);
        var literal = script.Substring(start, end - start);
        using var unescaped = JsonDocument.Parse("\"" + literal + "\"");
        return JsonDocument.Parse(unescaped.RootElement.GetString()!).RootElement.Clone();
    }

    private static JsonElement? InvokeAndWait(Harness h, string requestJson)
    {
        h.Got.Reset();
        h.Bridge.Call(requestJson);
        h.Got.Wait(TimeSpan.FromSeconds(10), TestContext.Current.CancellationToken)
             .ShouldBeTrue("no response envelope was dispatched to JS");
        string script;
        lock (Gate) script = h.Sent.Last();
        var envelope = DecodeEnvelope(script);
        envelope.GetProperty("type").GetString().ShouldBe("response");
        return envelope.GetProperty("payload").GetProperty("data").Clone();
    }

    private static string Req(string type, string? payloadJson = null, string id = "t1") =>
        $"{{\"type\":\"{type}\",\"id\":\"{id}\"{(payloadJson == null ? "" : ",\"payload\":" + payloadJson)}}}";

    [Fact]
    public void LoadExamList_ReturnsRealCatalog_NotHardcodedRows()
    {
        using var h = new Harness();
        var data = InvokeAndWait(h, Req("load_exam_list"));

        var exams = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(
            data!.Value.GetRawText())!;
        exams.ShouldNotBeEmpty();
        exams.ShouldAllBe(e => e["questions"].GetInt32() > 0);
        var codes = exams.Select(e => e["id"].GetString()!.ToUpperInvariant()).ToList();
        codes.ShouldContain("NCA-75");   // the four real banks, not five fakes
    }

    [Fact]
    public void GetStats_ReportsRealBankSize()
    {
        using var h = new Harness();
        var data = InvokeAndWait(h, Req("get_stats"));
        // Was the hardcoded literal 475; the bank has 1,458+ across 4 exams.
        data!.Value.GetProperty("totalQuestions").GetInt32().ShouldBeGreaterThan(1000);
    }

    /// <summary>In-memory store: persistence tests must not touch app data.</summary>
    private sealed class MemoryStore : ISessionStore
    {
        private readonly Dictionary<string, string> _d = new();
        public void Save(string id, string json) { lock (_d) _d[id] = json; }
        public string? Load(string id) { lock (_d) return _d.GetValueOrDefault(id); }
        public bool Has(string id) { lock (_d) return _d.ContainsKey(id); }
        public void Delete(string id) { lock (_d) _d.Remove(id); }
        public IReadOnlyList<string> List() { lock (_d) return _d.Keys.ToList(); }
    }

    [Fact]
    public void GetQuestion_ExactId_ReturnsStemAndOptions()
    {
        using var h = new Harness();
        var data = InvokeAndWait(h, Req("get_question", "{\"id\":\"NCA-75:NCA-75-Part1.md:1\"}"));
        data!.Value.GetProperty("found").GetBoolean().ShouldBeTrue();
        data.Value.GetProperty("id").GetString().ShouldBe("NCA-75:NCA-75-Part1.md:1");
        data.Value.GetProperty("stem").GetString().ShouldNotBeNullOrWhiteSpace();
        data.Value.GetProperty("options").GetArrayLength().ShouldBeGreaterThan(1);
    }

    [Fact]
    public void GetQuestion_ShortIdInSeveralFiles_IsAmbiguous_NotFirstMatch()
    {
        // Q numbers restart per bank file; "NCA-75:1" used to silently return
        // whichever file loaded first.
        using var h = new Harness();
        var data = InvokeAndWait(h, Req("get_question", "{\"id\":\"NCA-75:1\"}"));
        data!.Value.GetProperty("found").GetBoolean().ShouldBeFalse();
        data.Value.GetProperty("ambiguous").GetBoolean().ShouldBeTrue();
        data.Value.GetProperty("candidates").GetArrayLength().ShouldBeGreaterThan(1);
    }

    [Fact]
    public void SubmitAnswers_DriveStatsExportResetAndImport()
    {
        using var h = new Harness(new MemoryStore());
        InvokeAndWait(h, Req("submit_answer", "{\"questionId\":\"NCA-75:NCA-75-Part1.md:1\",\"answer\":\"A\",\"correct\":true}"))!
            .Value.GetProperty("recorded").GetBoolean().ShouldBeTrue();
        InvokeAndWait(h, Req("submit_answer", "{\"questionId\":\"NCA-75:NCA-75-Part1.md:2\",\"answer\":\"B, C\",\"correct\":false}", "t2"));

        var stats = InvokeAndWait(h, Req("get_stats", null, "t3"))!.Value;
        stats.GetProperty("answered").GetInt32().ShouldBe(2);   // were hardcoded 0
        stats.GetProperty("correct").GetInt32().ShouldBe(1);
        stats.GetProperty("streakDays").GetInt32().ShouldBe(1);

        var export = InvokeAndWait(h, Req("export_results", null, "t4"))!.Value;
        export.GetProperty("rowCount").GetInt32().ShouldBe(2);  // was an empty TODO
        var csv = export.GetProperty("csv").GetString()!;
        csv.ShouldContain("\"B, C\"");                          // CSV-quoted

        InvokeAndWait(h, Req("reset_session", null, "t5"));
        InvokeAndWait(h, Req("get_session", null, "t6"))!.Value
            .GetProperty("active").GetBoolean().ShouldBeFalse();

        var import = InvokeAndWait(h, Req("import_results",
            JsonSerializer.Serialize(new { csv = csv + "garbage,row\n" }), "t7"))!.Value;
        import.GetProperty("imported").GetInt32().ShouldBe(2);  // was the raw line count
        import.GetProperty("skipped").GetInt32().ShouldBe(1);
        InvokeAndWait(h, Req("get_stats", null, "t8"))!.Value
            .GetProperty("answered").GetInt32().ShouldBe(2);
    }

    [Fact]
    public void SetSetting_PersistsAndOverridesDefault()
    {
        var store = new MemoryStore();
        using (var h = new Harness(store))
            InvokeAndWait(h, Req("set_setting", "{\"key\":\"theme\",\"value\":\"light\"}"))!
                .Value.GetProperty("ok").GetBoolean().ShouldBeTrue();

        using var fresh = new Harness(store);                   // survives a new bridge
        var settings = InvokeAndWait(fresh, Req("get_settings"))!.Value;
        settings.GetProperty("theme").GetString().ShouldBe("light");
        settings.GetProperty("shuffleOptions").GetBoolean().ShouldBeTrue();
    }

    [Theory]
    [InlineData(0, 0)]   // answered today only
    [InlineData(1, 1)]   // yesterday + today
    public void StreakDays_CountsConsecutiveDays(int daysBack, int extra)
    {
        var now = new DateTimeOffset(2026, 10, 26, 12, 0, 0, TimeSpan.Zero);
        var times = Enumerable.Range(0, daysBack + 1).Select(d => now.AddDays(-d)).ToList();
        SimulatorBridge.StreakDays(times, now).ShouldBe(1 + extra);
        SimulatorBridge.StreakDays(new[] { now.AddDays(-3) }, now).ShouldBe(0); // broken streak
    }

    [Fact]
    public void GetQuestion_UnknownId_NotFound()
    {
        using var h = new Harness();
        var a = InvokeAndWait(h, Req("get_question", "{\"id\":\"NCA-75:999999\"}"));
        a!.Value.GetProperty("found").GetBoolean().ShouldBeFalse();
        var b = InvokeAndWait(h, Req("get_question", "{\"id\":\"NOPE-99:1\"}"));
        b!.Value.GetProperty("found").GetBoolean().ShouldBeFalse();
    }

    [Fact]
    public void SaveThenLoadProgress_RoundTripsThroughStore()
    {
        // Guid keeps the id unique so a parallel run can't collide. The bridge
        // itself is the assertion path — no touching the app-data dir.
        var sessionId = "cetest" + Guid.NewGuid().ToString("N");
        using var h = new Harness();

        var save = InvokeAndWait(h,
            Req("save_progress", $"{{\"sessionId\":\"{sessionId}\",\"data\":{{\"answered\":7}}}}"));
        save!.Value.GetProperty("saved").GetBoolean().ShouldBeTrue();

        var load = InvokeAndWait(h, Req("load_progress", $"{{\"sessionId\":\"{sessionId}\"}}", "t2"));
        load!.Value.GetProperty("hasProgress").GetBoolean().ShouldBeTrue();
        load.Value.GetProperty("data").GetProperty("answered").GetInt32().ShouldBe(7);
    }

    [Fact]
    public void LoadProgress_UnknownSession_HonestNoData()
    {
        using var h = new Harness();
        var data = InvokeAndWait(h, Req("load_progress", "{\"sessionId\":\"cetestdoesnotexist\"}"));
        data!.Value.GetProperty("hasProgress").GetBoolean().ShouldBeFalse();
    }

    [Fact]
    public void UnknownType_GetsErrorResponse_NotSilence()
    {
        using var h = new Harness();
        h.Bridge.Call(Req("nosuchhandler", null, "err1"));
        h.Got.Wait(TimeSpan.FromSeconds(10), TestContext.Current.CancellationToken).ShouldBeTrue();
        string script;
        lock (Gate) script = h.Sent.Last();
        var payload = DecodeEnvelope(script).GetProperty("payload");
        payload.GetProperty("id").GetString().ShouldBe("err1");
        payload.GetProperty("success").GetBoolean().ShouldBeFalse();
        payload.GetProperty("error").GetString().ShouldNotBeNull()
               .ShouldContain("nosuchhandler");
    }
}
