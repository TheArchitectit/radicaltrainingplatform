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
    /// <summary>
    /// Root of the in-memory repository tree.
    ///
    /// Platform-agnostic on purpose (SPEC-22 CI-02). These constants used to be
    /// POSIX literals ("/repo", "/plugins") interpolated with a forward slash,
    /// which produced keys like "/repo/content". Production builds every path
    /// with <see cref="IFileProvider.CombinePath"/> (= Path.Combine), so on
    /// Windows it asks for "\\repo\\content" and never matches — 19 tests failed
    /// on the build-winforms leg while passing on Linux. Rooting at a relative
    /// segment and building with Combine() keeps the tree and the expectations
    /// in the same coordinate system as the code under test, on every platform.
    /// </summary>
    private static readonly string BuiltInRoot = TestPaths.Root("repo");
    private static readonly string PluginsRoot = TestPaths.Root("plugins");

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
        var content = TestPaths.Combine(BuiltInRoot, "content");
        var examDir = TestPaths.Combine(content, "exams", "COMPTIA-A-1201");
        var trackDir = TestPaths.Combine(content, "tracks", "track-aplus");
        var files = new TestFileProvider()
            .Dir(BuiltInRoot)
            .Dir(content)
            .Dir(examDir)
            .File(TestPaths.Combine(examDir, "exam.json"), ExamJson("COMPTIA-A-1201"))
            .Dir(trackDir)
            .File(TestPaths.Combine(trackDir, "track.json"), """{"trackId":"track-aplus"}""");
        return files;
    }

    private static TestFileProvider WithPlugin(TestFileProvider files, string dirName, string examId, string pluginId = "acme")
    {
        var dir = TestPaths.Combine(PluginsRoot, dirName);
        var content = TestPaths.Combine(dir, "content");
        var examDir = TestPaths.Combine(content, "exams", examId);
        var examJson = ExamJson(examId);
        files.Dir(dir)
             .Dir(content)
             .Dir(examDir)
             .File(TestPaths.Combine(examDir, "exam.json"), examJson)
             // plugin.json's internal file list stays forward-slashed: it is a
             // manifest wire format, not a filesystem path. The validator joins
             // it to the content root itself.
             .File(TestPaths.Combine(dir, "plugin.json"), PluginJson(pluginId, "content", ($"exams/{examId}/exam.json", examJson)));
        return files;
    }

    private static PluginDiscovery Discovery(TestFileProvider files, IExamRepository? exams = null)
    {
        var discovery = new PluginDiscovery(files, new PluginValidator(files), exams);
        discovery.RegisterBuiltInContentRoot(TestPaths.Combine(BuiltInRoot, "content"));
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
        discovery.PluginContentSearchRoots.ShouldBe(new[] { TestPaths.Combine(PluginsRoot, "acme", "content") });
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
        files.File(TestPaths.Combine(PluginsRoot, "acme", "content", "exams", "ACME-1", "exam.json"), ExamJson("ACME-1-EDITED"));

        var discovery = Discovery(files);
        discovery.Discover();

        discovery.Plugins.Count.ShouldBe(1);
        discovery.Rejected.ShouldHaveSingleItem()
            .Errors.ShouldContain(e => e.Contains("hash mismatch"));
    }

    [Fact]
    public void DirectoryWithoutPluginJson_IsReportedNotIgnored()
    {
        var files = Repo().Dir(TestPaths.Combine(PluginsRoot, "broken"))
                          .Dir(TestPaths.Combine(PluginsRoot, "broken", "content"));
        var discovery = Discovery(files);
        discovery.Discover();

        discovery.Rejected.ShouldHaveSingleItem()
            .Errors.ShouldContain(e => e.Contains("no plugin.json"));
    }

    [Fact]
    public void MalformedPluginJson_IsReportedNotIgnored()
    {
        var files = Repo()
            .Dir(TestPaths.Combine(PluginsRoot, "broken"))
            .File(TestPaths.Combine(PluginsRoot, "broken", "plugin.json"), "{ this is not json");
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
        builtIn.ContentSearchRoot.ShouldBe(TestPaths.Combine(BuiltInRoot, "content"));
    }
}
