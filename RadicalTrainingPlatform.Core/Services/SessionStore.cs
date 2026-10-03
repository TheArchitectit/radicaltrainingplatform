using System;
using System.IO;
using System.Linq;
using System.Text.Json;
using RadicalTrainingPlatform.Core.Abstractions;

namespace RadicalTrainingPlatform.Core;

/// <summary>
/// Persists lab-simulator session progress as JSON under the app data dir.
/// Replaces the CefBridge TODO handlers that acknowledged saves without
/// writing anything ("saved = true", "hasProgress = false" — always).
/// Thread-safe: the simulator calls from the CEF worker thread.
/// </summary>
public interface ISessionStore
{
    void Save(string sessionId, string json);
    /// <summary>Null when no progress exists for that session.</summary>
    string? Load(string sessionId);
    bool Has(string sessionId);
    void Delete(string sessionId);
    /// <summary>Known session ids (without the .json suffix).</summary>
    IReadOnlyList<string> List();
}

public class JsonSessionStore : ISessionStore
{
    private static readonly JsonSerializerOptions Indented = new() { WriteIndented = true };
    private readonly IFileProvider _files;
    private readonly string _dir;
    private readonly object _lock = new();

    public JsonSessionStore(IFileProvider files, string appName = "RadicalTrainingPlatform")
    {
        _files = files;
        _dir = files.CombinePath(files.GetApplicationDataDirectory(appName), "sessions");
    }

    // Session ids come from the JS side; keep them path-safe (no traversal).
    private string PathFor(string sessionId)
    {
        if (string.IsNullOrWhiteSpace(sessionId)
            || sessionId.IndexOfAny(new[] { '/', '\\', ':', '.' }) >= 0)
            throw new ArgumentException("Invalid session id", nameof(sessionId));
        return _files.CombinePath(_dir, sessionId + ".json");
    }

    public void Save(string sessionId, string json)
    {
        var path = PathFor(sessionId);
        lock (_lock)
        {
            if (!_files.Exists(_dir)) _files.CreateDirectory(_dir);
            // Serialize wraps the raw JSON as a JSON string value (round-trips
            // exactly); the file stays .json-parseable for tooling.
            _files.WriteAllText(path, JsonSerializer.Serialize(json, Indented));
        }
    }

    public string? Load(string sessionId)
    {
        var path = PathFor(sessionId);
        lock (_lock)
        {
            if (!_files.Exists(path)) return null;
            // Save wrapped the raw JSON string as a JSON value; unwrap it back.
            return JsonSerializer.Deserialize<string>(_files.ReadAllText(path));
        }
    }

    public bool Has(string sessionId)
    {
        var path = PathFor(sessionId);
        lock (_lock) return _files.Exists(path);
    }

    public void Delete(string sessionId)
    {
        var path = PathFor(sessionId);
        lock (_lock)
        {
            if (_files.Exists(path)) _files.DeleteFile(path);
        }
    }

    public IReadOnlyList<string> List()
    {
        lock (_lock)
        {
            if (!_files.Exists(_dir)) return Array.Empty<string>();
            return _files.GetFiles(_dir, "*.json")
                .Select(Path.GetFileNameWithoutExtension)
                .Where(n => !string.IsNullOrEmpty(n))
                .Select(n => n!)
                .OrderBy(n => n, StringComparer.OrdinalIgnoreCase)
                .ToList();
        }
    }
}
