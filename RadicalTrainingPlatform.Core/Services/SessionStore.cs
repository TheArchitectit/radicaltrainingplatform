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
    /// <summary>
    /// Null when no progress exists for that session — including after a
    /// corrupt file has been quarantined (clean start). The quarantine is
    /// never silent: <see cref="ISessionStore.CorruptQuarantined"/> fires.
    /// </summary>
    string? Load(string sessionId);
    bool Has(string sessionId);
    void Delete(string sessionId);
    /// <summary>Known session ids (without the .json suffix).</summary>
    IReadOnlyList<string> List();

    /// <summary>
    /// Raised when a corrupt session file is quarantined (R-20). Loud by
    /// design: callers treat a null Load as first-run, so recovery must leave
    /// a trace and preserve the damaged bytes.
    /// </summary>
    event Action<SessionQuarantineNotice>? CorruptQuarantined;
}

/// <summary>Details of a quarantined corrupt session file (R-20).</summary>
public sealed record SessionQuarantineNotice(string SessionId, string QuarantinePath, string Reason);

public class JsonSessionStore : ISessionStore
{
    private static readonly JsonSerializerOptions Indented = new() { WriteIndented = true };
    // Windows-invalid filename characters plus POSIX separators and the
    // extension dot. One rejection set so ids are path-safe on all three
    // platforms (R-20).
    private static readonly char[] PathSeparators =
        { '/', '\\', ':', '.', '\0', '<', '>', '"', '|', '?', '*' };

    private readonly IFileProvider _files;
    private readonly string _dir;
    private readonly object _lock = new();

    public event Action<SessionQuarantineNotice>? CorruptQuarantined;

    public JsonSessionStore(IFileProvider files, string appName = "RadicalTrainingPlatform")
    {
        _files = files;
        _dir = files.CombinePath(files.GetApplicationDataDirectory(appName), "sessions");
    }

    // Session ids come from the JS side; keep them path-safe across
    // Windows/Linux/macOS (R-20). No traversal, no separators, no extension
    // dots, no Windows reserved device names, no control characters.
    private string PathFor(string sessionId)
    {
        if (string.IsNullOrWhiteSpace(sessionId))
            throw new ArgumentException("Invalid session id", nameof(sessionId));
        if (sessionId.IndexOfAny(PathSeparators) >= 0)
            throw new ArgumentException("Invalid session id", nameof(sessionId));
        if (sessionId.Any(char.IsControl))
            throw new ArgumentException("Invalid session id", nameof(sessionId));
        if (sessionId != sessionId.Trim())
            throw new ArgumentException("Invalid session id", nameof(sessionId));
        if (IsWindowsReservedName(sessionId))
            throw new ArgumentException("Invalid session id", nameof(sessionId));
        return _files.CombinePath(_dir, sessionId + ".json");
    }

    private static bool IsWindowsReservedName(string id)
    {
        // CON, PRN, AUX, NUL, COM1-9, LPT1-9 (and COM0/LPT0 on newer Windows).
        var name = id.ToUpperInvariant();
        if (name is "CON" or "PRN" or "AUX" or "NUL") return true;
        if (name.Length == 4 && (name.StartsWith("COM") || name.StartsWith("LPT")))
            return name[3] is >= '0' and <= '9';
        return false;
    }

    public void Save(string sessionId, string json)
    {
        var path = PathFor(sessionId);
        var tmp = path + ".tmp";
        lock (_lock)
        {
            if (!_files.Exists(_dir)) _files.CreateDirectory(_dir);
            // R-20 atomic save: write-temp-then-rename. A crash mid-write
            // leaves the previous file intact — the live path is only ever
            // replaced by MoveFile, never truncated by WriteAllText.
            try
            {
                _files.WriteAllText(tmp, JsonSerializer.Serialize(json, Indented));
                _files.MoveFile(tmp, path);
            }
            catch
            {
                // Never leave a .tmp behind as if it were a session.
                try { if (_files.Exists(tmp)) _files.DeleteFile(tmp); }
                catch { /* best-effort cleanup; the original error is the one that matters */ }
                throw;
            }
        }
    }

    public string? Load(string sessionId)
    {
        var path = PathFor(sessionId);
        lock (_lock)
        {
            if (!_files.Exists(path)) return null;

            string raw;
            try
            {
                raw = _files.ReadAllText(path);
                return JsonSerializer.Deserialize<string>(raw);
            }
            catch (JsonException ex)
            {
                Quarantine(sessionId, path, ex.Message);
                return null; // clean start after a loud, evidenced quarantine
            }
            catch (IOException ex)
            {
                // Unreadable is not the same as corrupt-JSON; still quarantine
                // so a damaged file cannot block every future load.
                Quarantine(sessionId, path, ex.Message);
                return null;
            }
        }
    }

    private void Quarantine(string sessionId, string path, string reason)
    {
        var quarantinePath = path + ".corrupt";
        try
        {
            if (_files.Exists(quarantinePath)) _files.DeleteFile(quarantinePath);
            _files.MoveFile(path, quarantinePath);
        }
        catch (IOException)
        {
            // Quarantine itself failed — still report; the caller gets null
            // (clean start) but the original file may remain. The notice is
            // what keeps this from being silent.
        }
        CorruptQuarantined?.Invoke(new SessionQuarantineNotice(sessionId, quarantinePath, reason));
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
            var tmp = path + ".tmp";
            if (_files.Exists(tmp)) _files.DeleteFile(tmp);
        }
    }

    public IReadOnlyList<string> List()
    {
        lock (_lock)
        {
            if (!_files.Exists(_dir)) return Array.Empty<string>();
            // "*.json" excludes both .tmp staging and .json.corrupt quarantine
            // artifacts — neither ends in ".json".
            return _files.GetFiles(_dir, "*.json")
                .Select(Path.GetFileNameWithoutExtension)
                .Where(n => !string.IsNullOrEmpty(n))
                .Select(n => n!)
                .OrderBy(n => n, StringComparer.OrdinalIgnoreCase)
                .ToList();
        }
    }
}
