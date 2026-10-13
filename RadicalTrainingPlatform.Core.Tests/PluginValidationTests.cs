using System.IO;
using System.Text;
using System.Text.Json;
using RadicalTrainingPlatform.Core.Models;
using RadicalTrainingPlatform.Core.Services;
using Shouldly;
using Xunit;

namespace RadicalTrainingPlatform.Core.Tests;

/// <summary>
/// S27-09. A validator that has only ever accepted well-formed packs has not
/// been shown to reject anything, so each rule gets a pack that breaks it and
/// is asserted to fail for its own reason.
/// </summary>
public class PluginValidationTests
{
    private const string Root = "/plugins/acme";

    private static string Sha(string content) =>
        PluginValidator.Sha256Hex(Encoding.UTF8.GetBytes(content));

    private static TestFileProvider Tree(string examJson, string? pluginJson = null)
    {
        var files = new TestFileProvider()
            .Dir(Root)
            .Dir($"{Root}/content")
            .Dir($"{Root}/content/exams/ACME-1")
            .File($"{Root}/content/exams/ACME-1/exam.json", examJson)
            .File($"{Root}/plugin.json", pluginJson ?? WellFormed(examJson));
        return files;
    }

    private static string WellFormed(string examJson) => JsonSerializer.Serialize(new
    {
        schemaVersion = 1,
        pluginId = "acme",
        vendor = "ACME",
        displayName = "ACME pack",
        contentRoot = "content",
        files = new[]
        {
            new { path = "exams/ACME-1/exam.json", sha256 = Sha(examJson) },
        },
    });

    private const string ExamJson = """{"examId":"ACME-1","vendor":"ACME","displayName":"ACME One"}""";

    /// <summary>
    /// Parse plugin.json and fill in the fields discovery would have set, so
    /// the validator is exercised the way it is actually called.
    /// </summary>
    private static VendorPlugin Plugin(string? pluginJson = null)
    {
        var plugin = JsonSerializer.Deserialize<VendorPlugin>(
            pluginJson ?? WellFormed(ExamJson),
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true })!;
        plugin.PluginDirectory = Root;
        plugin.ManifestPath = $"{Root}/plugin.json";
        // Derived from contentRoot exactly as discovery derives it, so a test
        // that edits contentRoot actually exercises the content-root check.
        plugin.ContentSearchRoot = Path.Combine(Root, plugin.ContentRoot);
        return plugin;
    }

    private static PluginValidationResult Validate(string? pluginJson = null, TestFileProvider? files = null)
    {
        files ??= Tree(ExamJson, pluginJson);
        return new PluginValidator(files).Validate(Plugin(pluginJson));
    }

    [Fact]
    public void WellFormedPlugin_Passes()
    {
        var result = Validate();
        result.IsValid.ShouldBeTrue(string.Join("; ", result.Errors));
    }

    [Fact]
    public void UnsupportedSchemaVersion_Fails()
    {
        var json = WellFormed(ExamJson).Replace("\"schemaVersion\":1", "\"schemaVersion\":99");
        var result = Validate(json);
        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.Contains("unsupported schemaVersion 99"));
    }

    [Fact]
    public void MissingIdentity_Fails()
    {
        var json = WellFormed(ExamJson).Replace("\"pluginId\":\"acme\"", "\"pluginId\":\"\"");
        var result = Validate(json);
        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.Contains("pluginId is required"));
    }

    [Fact]
    public void MissingContentRoot_Fails()
    {
        var files = new TestFileProvider()
            .Dir(Root)
            .Dir($"{Root}/content")
            .File($"{Root}/content/exams/ACME-1/exam.json", ExamJson)
            .File($"{Root}/plugin.json", WellFormed(ExamJson).Replace("\"contentRoot\":\"content\"", "\"contentRoot\":\"absent\""));

        var plugin = Plugin(WellFormed(ExamJson).Replace("\"contentRoot\":\"content\"", "\"contentRoot\":\"absent\""));
        var result = new PluginValidator(files).Validate(plugin);
        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.Contains("content root") && e.Contains("does not exist"));
    }

    [Fact]
    public void TamperedFile_FailsWithBothHashesNamed()
    {
        // The declared hash is for the original bytes; the file on disk differs.
        var files = Tree("""{"examId":"ACME-1","tampered":true}""", WellFormed(ExamJson));
        var result = new PluginValidator(files).Validate(Plugin());
        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.Contains("hash mismatch: exams/ACME-1/exam.json")
                                         && e.Contains("manifest ")
                                         && e.Contains("actual "));
    }

    [Fact]
    public void DeclaredFileMissing_Fails()
    {
        var json = WellFormed(ExamJson).Replace("exams/ACME-1/exam.json", "exams/ACME-1/gone.json");
        var files = Tree(ExamJson, json);
        var result = new PluginValidator(files).Validate(Plugin(json));
        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.Contains("declared file 'exams/ACME-1/gone.json' is missing"));
    }

    [Fact]
    public void HashComparison_IsCaseInsensitive()
    {
        // The repo's convention is lowercase hex, but an uppercase declaration
        // is the same hash and must not be reported as tampering.
        var json = WellFormed(ExamJson).Replace(Sha(ExamJson), Sha(ExamJson).ToUpperInvariant());
        Validate(json).IsValid.ShouldBeTrue();
    }

    [Fact]
    public void ExamIdAlreadyClaimed_Fails()
    {
        var result = new PluginValidator(Tree(ExamJson))
            .Validate(Plugin(), claimedExamIds: new[] { "ACME-1" });
        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.Contains("exam ID 'ACME-1' is already claimed"));
    }

    [Fact]
    public void TrackIdAlreadyClaimed_Fails()
    {
        var trackJson = """{"trackId":"track-acme","title":"ACME"}""";
        var files = new TestFileProvider()
            .Dir(Root)
            .Dir($"{Root}/content")
            .Dir($"{Root}/content/tracks/track-acme")
            .File($"{Root}/content/tracks/track-acme/track.json", trackJson)
            .File($"{Root}/plugin.json", WellFormed(ExamJson));

        var result = new PluginValidator(files)
            .Validate(Plugin(), claimedTrackIds: new[] { "TRACK-ACME" });
        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.Contains("track ID 'track-acme' is already claimed"));
    }

    [Fact]
    public void DeclaredIds_ReportsWhatThePackOwns()
    {
        var (examIds, trackIds) = new PluginValidator(Tree(ExamJson)).DeclaredIds(Plugin());
        examIds.ShouldBe(new[] { "ACME-1" });
        trackIds.ShouldBeEmpty();
    }
}
