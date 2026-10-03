using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using RadicalTrainingPlatform.Core;
using Shouldly;
using Xunit;

namespace RadicalTrainingPlatform.Core.Tests;

public class SessionStoreTests
{
    /// <summary>
    /// In-memory IFileProvider so the store is tested against real logic
    /// (round-trip, existence, traversal) without touching disk.
    /// </summary>
    private sealed class FakeFiles : IFileProvider
    {
        public readonly Dictionary<string, string> Files = new();
        public readonly HashSet<string> Dirs = new();
        public string CombinePath(params string[] paths) => Path.Combine(paths);
        public bool Exists(string path) => Files.ContainsKey(path) || Dirs.Contains(path);
        public string[] GetFiles(string directory, string searchPattern)
        {
            // Enough glob for this suite: only "*.json" is used.
            var ext = searchPattern.TrimStart('*');
            return Files.Keys
                .Where(f => f.StartsWith(directory + Path.DirectorySeparatorChar)
                            || f.StartsWith(directory + "/"))
                .Where(f => f.EndsWith(ext, StringComparison.OrdinalIgnoreCase))
                .ToArray();
        }
        public string[] GetDirectories(string directory) => Array.Empty<string>();
        public string ReadAllText(string path) => Files[path];
        public void WriteAllText(string path, string content) => Files[path] = content;
        public void DeleteFile(string path) => Files.Remove(path);
        public void CreateDirectory(string path) => Dirs.Add(path);
        public string GetCurrentDirectory() => "/app";
        public string GetExecutingAssemblyDirectory() => "/app/bin";
        public string GetApplicationDataDirectory(string appName) => "/appdata/" + appName;
        public string? GetParentDirectory(string path) => Path.GetDirectoryName(path);
    }

    private readonly FakeFiles _files = new();
    private readonly JsonSessionStore _store;

    public SessionStoreTests() => _store = new JsonSessionStore(_files, "TestApp");

    [Fact]
    public void Save_ThenLoad_RoundTripsExactJson()
    {
        var payload = "{\"score\":42,\"answers\":{\"1\":\"A\",\"2\":\"C\"}}";
        _store.Save("sess1", payload);
        _store.Has("sess1").ShouldBeTrue();
        _store.Load("sess1").ShouldBe(payload);
    }

    [Fact]
    public void Save_CreatesSessionDirectoryOnce()
    {
        _store.Save("s", "{}");
        _files.Dirs.ShouldContain("/appdata/TestApp/sessions");
    }

    [Fact]
    public void Load_UnknownSession_ReturnsNull() => _store.Load("nope").ShouldBeNull();

    [Fact]
    public void Delete_RemovesProgress()
    {
        _store.Save("sess2", "{}");
        _store.Delete("sess2");
        _store.Has("sess2").ShouldBeFalse();
    }

    [Theory]
    [InlineData("../evil")]
    [InlineData("a/b")]
    [InlineData("a\\b")]
    [InlineData("with.dot")]
    [InlineData("")]
    public void PathTraversalIds_AreRejected(string bad)
        => Should.Throw<ArgumentException>(() => _store.Save(bad, "{}"));

    [Fact]
    public void List_ReturnsSavedSessionIds()
    {
        _store.Save("alpha", "{}");
        _store.Save("beta", "{}");
        _store.List().ShouldBe(["alpha", "beta"], ignoreOrder: true);
    }

    [Fact]
    public void List_EmptyWhenNothingSaved() => _store.List().ShouldBeEmpty();

    [Fact]
    public void Save_Overwrites_KeepsLatest()
    {
        _store.Save("sess3", "{\"v\":1}");
        _store.Save("sess3", "{\"v\":2}");
        _store.Load("sess3").ShouldBe("{\"v\":2}");
    }
}
