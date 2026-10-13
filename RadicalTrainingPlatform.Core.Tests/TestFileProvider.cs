using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using RadicalTrainingPlatform.Core;

namespace RadicalTrainingPlatform.Core.Tests;

/// <summary>
/// In-memory <see cref="IFileProvider"/> for tests that need a content tree
/// without touching disk. Directories are tracked explicitly, so a test can
/// create an empty plugin directory or a directory with no plugin.json —
/// both of which are things discovery has to report rather than ignore.
/// </summary>
internal sealed class TestFileProvider : IFileProvider
{
    private readonly Dictionary<string, string> _files = new(StringComparer.Ordinal);
    private readonly HashSet<string> _dirs = new(StringComparer.Ordinal);

    /// <summary>Write a file, creating no parent directories implicitly.</summary>
    public TestFileProvider File(string path, string content)
    {
        _files[path] = content;
        return this;
    }

    /// <summary>Create a directory entry (and every ancestor, as a real FS would).</summary>
    public TestFileProvider Dir(string path)
    {
        var current = path;
        while (!string.IsNullOrEmpty(current) && _dirs.Add(current))
            current = Path.GetDirectoryName(current) ?? "";
        return this;
    }

    public string CombinePath(params string[] paths) => Path.Combine(paths);

    public bool Exists(string path) => _files.ContainsKey(path) || _dirs.Contains(path);

    public string[] GetFiles(string directory, string searchPattern)
    {
        var ext = searchPattern.TrimStart('*');
        return _files.Keys
            .Where(f => Path.GetDirectoryName(f) == directory)
            .Where(f => f.EndsWith(ext, StringComparison.OrdinalIgnoreCase))
            .ToArray();
    }

    public string[] GetDirectories(string directory) =>
        _dirs.Where(d => Path.GetDirectoryName(d) == directory).ToArray();

    public string ReadAllText(string path) => _files[path];

    public byte[] ReadAllBytes(string path) => System.Text.Encoding.UTF8.GetBytes(_files[path]);

    public void WriteAllText(string path, string content) => _files[path] = content;

    public void MoveFile(string source, string dest)
    {
        _files[dest] = _files[source];
        _files.Remove(source);
    }

    public void DeleteFile(string path) => _files.Remove(path);

    public void CreateDirectory(string path) => Dir(path);

    public string GetCurrentDirectory() => "/app";

    public string GetExecutingAssemblyDirectory() => "/app/bin";

    public string GetApplicationDataDirectory(string appName) => "/appdata/" + appName;

    public string? GetParentDirectory(string path) => Path.GetDirectoryName(path);
}
