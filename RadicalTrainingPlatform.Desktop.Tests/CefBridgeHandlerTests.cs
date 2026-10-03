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
/// Drives the REAL CefBridge handlers through the same entry point CefGlue
/// uses — Call(json) → handler → response envelope pumped back into JS.
/// Every handler used to be a mock: load_exam_list returned 5 hardcoded rows,
/// get_stats a literal 475, save/load_progress acknowledged without persisting.
/// These pin them to real Core data.
///
/// No CEF runtime required: the bridge takes an Action&lt;string&gt; for the
/// send side, so we capture the dispatch script and unwrap the envelope.
/// </summary>
public class CefBridgeHandlerTests
{
    private static readonly object Gate = new();

    /// <summary>Bridge under test + the captured JS dispatch sink.</summary>
    private sealed class Harness : IDisposable
    {
        public CefBridge Bridge { get; }
        public List<string> Sent { get; } = new();
        public ManualResetEventSlim Got { get; } = new(false);

        public Harness()
        {
            var services = new ServiceCollection()
                .AddLogging()
                .AddRadicalTrainingPlatformCore()
                .BuildServiceProvider();

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
            Bridge = new CefBridge(
                send,
                services.GetRequiredService<IQuestionParser>(),
                services.GetRequiredService<ISessionStore>());
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

    [Fact]
    public void GetQuestion_Found_ReturnsStemAndOptions()
    {
        using var h = new Harness();
        var data = InvokeAndWait(h, Req("get_question", "{\"id\":\"NCA-75:1\"}"));
        data!.Value.GetProperty("found").GetBoolean().ShouldBeTrue();
        data.Value.GetProperty("stem").GetString().ShouldNotBeNullOrWhiteSpace();
        data.Value.GetProperty("options").GetArrayLength().ShouldBeGreaterThan(1);
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
