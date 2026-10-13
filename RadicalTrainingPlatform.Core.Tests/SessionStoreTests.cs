using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
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
    private class FakeFiles : IFileProvider
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
        public byte[] ReadAllBytes(string path) => System.Text.Encoding.UTF8.GetBytes(Files[path]);
        public virtual void WriteAllText(string path, string content) => Files[path] = content;
        public virtual void MoveFile(string source, string dest)
        {
            Files[dest] = Files[source];
            Files.Remove(source);
        }
        public void DeleteFile(string path) => Files.Remove(path);
        public void CreateDirectory(string path) => Dirs.Add(path);
        public string GetCurrentDirectory() => "/app";
        public string GetExecutingAssemblyDirectory() => "/app/bin";
        public string GetApplicationDataDirectory(string appName) => Path.Combine("/appdata", appName);
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
        // The store builds this via fake CombinePath (real Path.Combine), so
        // expect the same separator-dependent spelling.
        _files.Dirs.ShouldContain(Path.Combine("/appdata", "TestApp", "sessions"));
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

    // ─── Error paths (T-16 save/reload/error) ──────────────────────

    /// <summary>File provider whose writes fail (disk full / denied).</summary>
    private sealed class FailingWriteFiles : FakeFiles
    {
        public override void WriteAllText(string path, string content)
            => throw new IOException("disk full");
    }

    [Fact]
    public void Save_WriteFailure_Propagates_NeverClaimsSuccess()
    {
        var files = new FailingWriteFiles();
        var store = new JsonSessionStore(files, "ErrApp");

        Should.Throw<IOException>(() => store.Save("s1", "{}"));
        store.Has("s1").ShouldBeFalse("a failed write must not leave a readable session");
    }

    // ─── R-20: atomic save + corrupt quarantine ──────────────────────

    [Fact]
    public void Save_WritesTempThenRenames_NeverTruncatesLiveFile()
    {
        var files = new RecordingFiles();
        var store = new JsonSessionStore(files, "AtomicApp");
        store.Save("s1", "{\"v\":1}");

        files.Writes.Count.ShouldBe(1, "Save must touch only the staging file");
        // Live path is replaced by MoveFile, never truncated by WriteAllText.
        files.Writes[0].ShouldEndWith(".tmp");
        files.Moved.Count.ShouldBe(1, "the live path is only replaced by rename");
    }

    /// <summary>
    /// Kill-during-write fixture (R-20): if the process dies after the temp
    /// write but before the rename, the previously saved file is intact and
    /// no staging file is left behind as a ghost session.
    /// </summary>
    [Fact]
    public void Save_KilledAfterTempWrite_LeavesPriorFileIntact()
    {
        var files = new FailingMoveFiles();
        var store = new JsonSessionStore(files, "CrashApp");
        var dir = Path.Combine("/appdata", "CrashApp", "sessions");
        files.Dirs.Add(dir);
        var live = Path.Combine(dir, "s2.json");
        files.Files[live] = "\"{\\\"v\\\":1}\""; // prior good save (wrapped form)

        Should.Throw<IOException>(() => store.Save("s2", "{\"v\":2}"));

        files.Files[live].ShouldBe("\"{\\\"v\\\":1}\"", "prior file must be byte-identical after a killed write");
        files.Files.Keys.ShouldNotContain(k => k.EndsWith(".tmp"), "no staging ghost");
        store.List().ShouldBe(["s2"]);
    }

    [Fact]
    public void Load_CorruptFile_Quarantines_AndCleanStarts_Loudly()
    {
        // R-20: corrupt ≠ "no progress" silently. The damaged bytes are
        // preserved under .corrupt, a notice fires, and Load returns null
        // so the learner gets a clean start rather than a bricked store.
        SessionQuarantineNotice? notice = null;
        _store.CorruptQuarantined += n => notice = n;

        _store.Save("corrupt", "{}");
        var path = Path.Combine("/appdata", "TestApp", "sessions", "corrupt.json");
        _files.Files[path] = "{ not json ";

        _store.Load("corrupt").ShouldBeNull("clean start after quarantine");

        var quarantine = path + ".corrupt";
        _files.Files.ShouldContainKey(quarantine);
        _files.Files[quarantine].ShouldBe("{ not json ", "damaged bytes are preserved as evidence");
        _files.Files.ShouldNotContainKey(path);

        notice.ShouldNotBeNull("quarantine must never be silent");
        notice!.SessionId.ShouldBe("corrupt");
        notice.QuarantinePath.ShouldBe(quarantine);
    }

    [Fact]
    public void Load_EmptyFile_Quarantines_AndCleanStarts()
    {
        SessionQuarantineNotice? notice = null;
        _store.CorruptQuarantined += n => notice = n;

        _store.Save("empty", "{}");
        var path = Path.Combine("/appdata", "TestApp", "sessions", "empty.json");
        _files.Files[path] = "";

        _store.Load("empty").ShouldBeNull();
        notice.ShouldNotBeNull();
    }

    [Fact]
    public void Load_QuarantinedSession_IsGoneFromList()
    {
        _store.Save("ghost", "{ not json ");
        var path = Path.Combine("/appdata", "TestApp", "sessions", "ghost.json");
        _files.Files[path] = "{ not json ";

        _store.Load("ghost").ShouldBeNull();
        _store.List().ShouldNotContain("ghost");
        _store.Has("ghost").ShouldBeFalse();
    }

    // ─── R-20: session-id path safety across platforms ──────────────

    [Theory]
    [InlineData("CON")]
    [InlineData("prn")]
    [InlineData("AUX")]
    [InlineData("nul")]
    [InlineData("COM1")]
    [InlineData("lpt9")]
    [InlineData("has space at end ")]
    [InlineData(" leading")]
    [InlineData("bad\ttab")]
    [InlineData("star*")]
    [InlineData("quote\"")]
    [InlineData("pipe|")]
    [InlineData("quest?n")]
    public void PathUnsafeIds_AreRejected_WindowsLinuxMac(string bad)
        => Should.Throw<ArgumentException>(() => _store.Save(bad, "{}"));

    [Fact]
    public void SaveThenLoad_UnsignedJson_RoundTrips()
    {
        // Non-object payloads (arrays, strings) must survive the wrap/unwrap.
        _store.Save("arr", "[1,2,3]");
        _store.Load("arr").ShouldBe("[1,2,3]");
    }

    /// <summary>Records write targets so tests can prove Save never touches the live path.</summary>
    private sealed class RecordingFiles : FakeFiles
    {
        public readonly List<string> Writes = new();
        public readonly Dictionary<string, string> Moved = new();
        public override void WriteAllText(string path, string content)
        {
            Writes.Add(path);
            base.WriteAllText(path, content);
        }
        public override void MoveFile(string source, string dest)
        {
            Moved[source] = dest;
            base.MoveFile(source, dest);
        }
    }

    /// <summary>MoveFile fails — models a crash/kill between temp write and rename.</summary>
    private sealed class FailingMoveFiles : FakeFiles
    {
        public override void MoveFile(string source, string dest)
            => throw new IOException("killed before rename");
    }
}
