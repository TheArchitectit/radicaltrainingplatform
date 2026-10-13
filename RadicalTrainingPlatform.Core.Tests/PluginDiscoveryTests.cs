using System.Linq;
using System.Text;
using System.Text.Json;
using RadicalTrainingPlatform.Core.Abstractions;
using RadicalTrainingPlatform.Core.Models;
using RadicalTrainingPlatform.Core.Services;
using NSubstitute;
using Shouldly;
using Xunit;

namespace RadicalTrainingPlatform.Core.Tests;

/// <summary>
/// S27-08. Discovery is where "a vendor pack cannot damage shipped content"
/// has to be true, so the tests below build real plugin directories in memory
/// and assert what is accepted, what is rejected, and — the part that matters —
/// that a rejected pack contributes nothing.
/// </summary>
public class PluginDiscoveryTests
{
    private const string BuiltInRoot = "/repo";
    private const string PluginsRoot = "/plugins";

    private static string Sha(string content) =>
        PluginValidator.Sha256Hex(Encoding.UTF8.GetBytes(content));

    private static string ExamJson(string examId) =>
        $$"""{"examId":"{{examId}}","vendor":"ACME","displayName":"{{examId}}"}""";

    private static string PluginJson(string pluginId, string contentRoot, params (string Path, string Content)[] files) =>
        JsonSerializer.Serialize(new
        {
            schemaVersion = 1,
            pluginId,
            vendor = "ACME",
            displayName = $"{pluginId} pack",
            contentRoot,
            files = files.Select(f => new { path = f.Path, sha256 = Sha(f.Content) }).ToArray(),
        });

    /// <summary>A repository tree with one built-in exam and one built-in track.</summary>
    private static TestFileProvider Repo()
    {
        var files = new TestFileProvider()
            .Dir(BuiltInRoot)
            .Dir($"{BuiltInRoot}/content")
            .Dir($"{BuiltInRoot}/content/exams/COMPTIA-A-1201")
            .File($"{BuiltInRoot}/content/exams/COMPTIA-A-1201/exam.json", ExamJson("COMPTIA-A-1201"))
            .Dir($"{BuiltInRoot}/content/tracks/track-aplus")
            .File($"{BuiltInRoot}/content/tracks/track-aplus/track.json", """{"trackId":"track-aplus"}""");
        return files;
    }

    private static TestFileProvider WithPlugin(TestFileProvider files, string dirName, string examId, string pluginId = "acme")
    {
        var dir = $"{PluginsRoot}/{dirName}";
        var examJson = ExamJson(examId);
        files.Dir(dir)
             .Dir($"{dir}/content")
             .Dir($"{dir}/content/exams/{examId}")
             .File($"{dir}/content/exams/{examId}/exam.json", examJson)
             .File($"{dir}/plugin.json", PluginJson(pluginId, "content", ($"exams/{examId}/exam.json", examJson)));
        return files;
    }

    private static PluginDiscovery Discovery(TestFileProvider files, IExamRepository? exams = null)
    {
        var discovery = new PluginDiscovery(files, new PluginValidator(files), exams);
        discovery.RegisterBuiltInContentRoot($"{BuiltInRoot}/content");
        discovery.RegisterPluginRoot(PluginsRoot);
        return discovery;
    }

    [Fact]
    public void BuiltInTree_IsRegisteredAsAPlugin()
    {
        var discovery = Discovery(Repo());
        discovery.Discover();

        var builtIn = discovery.Plugins.ShouldHaveSingleItem();
        builtIn.IsBuiltIn.ShouldBeTrue();
        builtIn.PluginId.ShouldBe("builtin");
        discovery.Rejected.ShouldBeEmpty();
    }

    [Fact]
    public void ValidPlugin_IsAcceptedAndContributesItsContentRoot()
    {
        var discovery = Discovery(WithPlugin(Repo(), "acme", "ACME-1"));
        discovery.Discover();

        discovery.Plugins.Count.ShouldBe(2);
        discovery.Plugins.ShouldContain(p => !p.IsBuiltIn && p.PluginId == "acme");
        discovery.PluginContentSearchRoots.ShouldBe(new[] { $"{PluginsRoot}/acme/content" });
        discovery.Rejected.ShouldBeEmpty();
    }

    [Fact]
    public void PluginClaimingABuiltInExamId_IsRejectedByName()
    {
        // The built-in tree is validated first and owns COMPTIA-A-1201, so the
        // pack that collides is the one that loses — not the shipped content.
        var discovery = Discovery(WithPlugin(Repo(), "copycat", "COMPTIA-A-1201"));
        discovery.Discover();

        discovery.Plugins.Count.ShouldBe(1);
        discovery.Plugins.ShouldNotContain(p => !p.IsBuiltIn);

        var rejected = discovery.Rejected.ShouldHaveSingleItem();
        rejected.Errors.ShouldContain(e => e.Contains("exam ID 'COMPTIA-A-1201' is already claimed"));
        // The rejected pack must contribute nothing at all.
        discovery.PluginContentSearchRoots.ShouldBeEmpty();
    }

    [Fact]
    public void TwoPluginsClaimingOneExamId_SecondIsRejected()
    {
        var files = WithPlugin(Repo(), "first", "ACME-1", pluginId: "first");
        WithPlugin(files, "second", "ACME-1", pluginId: "second");

        var discovery = Discovery(files);
        discovery.Discover();

        discovery.Plugins.Count.ShouldBe(2); // built-in + first
        discovery.Plugins.ShouldContain(p => p.PluginId == "first");
        discovery.Plugins.ShouldNotContain(p => p.PluginId == "second");
        discovery.Rejected.ShouldHaveSingleItem()
            .Errors.ShouldContain(e => e.Contains("exam ID 'ACME-1' is already claimed"));
    }

    [Fact]
    public void TamperedPlugin_IsRejectedWithTheHashMismatch()
    {
        var files = WithPlugin(Repo(), "acme", "ACME-1");
        files.File($"{PluginsRoot}/acme/content/exams/ACME-1/exam.json", ExamJson("ACME-1-EDITED"));

        var discovery = Discovery(files);
        discovery.Discover();

        discovery.Plugins.Count.ShouldBe(1);
        discovery.Rejected.ShouldHaveSingleItem()
            .Errors.ShouldContain(e => e.Contains("hash mismatch"));
    }

    [Fact]
    public void DirectoryWithoutPluginJson_IsReportedNotIgnored()
    {
        var files = Repo().Dir($"{PluginsRoot}/broken").Dir($"{PluginsRoot}/broken/content");
        var discovery = Discovery(files);
        discovery.Discover();

        discovery.Rejected.ShouldHaveSingleItem()
            .Errors.ShouldContain(e => e.Contains("no plugin.json"));
    }

    [Fact]
    public void MalformedPluginJson_IsReportedNotIgnored()
    {
        var files = Repo()
            .Dir($"{PluginsRoot}/broken")
            .File($"{PluginsRoot}/broken/plugin.json", "{ this is not json");
        var discovery = Discovery(files);
        discovery.Discover();

        discovery.Rejected.ShouldHaveSingleItem()
            .Errors.ShouldContain(e => e.Contains("could not be parsed as a plugin manifest"));
    }

    [Fact]
    public void Discover_IsIdempotent()
    {
        var discovery = Discovery(WithPlugin(Repo(), "acme", "ACME-1"));
        discovery.Discover();
        discovery.Discover();

        discovery.Plugins.Count.ShouldBe(2);
        discovery.Rejected.ShouldBeEmpty();
    }

    [Fact]
    public void BuiltInRoot_IsDerivedFromTheRepositorySearchPaths()
    {
        // No explicit RegisterBuiltInContentRoot: discovery finds the tree the
        // same way the manifest loader does, so a host that configures its
        // repository does not also have to tell discovery where content is.
        var files = Repo();
        var exams = Substitute.For<IExamRepository>();
        exams.SearchPaths.Returns(new[] { BuiltInRoot });

        var discovery = new PluginDiscovery(files, new PluginValidator(files), exams);
        discovery.RegisterPluginRoot(PluginsRoot);
        discovery.Discover();

        var builtIn = discovery.Plugins.ShouldHaveSingleItem();
        builtIn.IsBuiltIn.ShouldBeTrue();
        builtIn.ContentSearchRoot.ShouldBe($"{BuiltInRoot}/content");
    }
}
