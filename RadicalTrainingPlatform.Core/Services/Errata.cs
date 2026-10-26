using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using RadicalTrainingPlatform.Core.Abstractions;

namespace RadicalTrainingPlatform.Core;

/// <summary>
/// One answer-key correction from errata.json. Applied after parsing so a
/// wrong key in the markdown can be fixed without touching the source file.
/// </summary>
public sealed record ErrataEntry(
    string Id,
    string File,
    int QuestionId,
    IReadOnlyList<string> CorrectAnswers,
    string Rationale);

/// <summary>
/// Lookup of errata corrections keyed by (source file name, question id).
/// Question ids restart per file, so the file name is part of the key.
/// </summary>
public interface IErrataProvider
{
    bool TryGetCorrection(string sourceFileName, int questionId,
                          out IReadOnlyList<string> correctAnswers);
}

/// <summary>
/// Loads errata.json from the repo root / installed directory. Missing or
/// malformed errata is non-fatal — the app runs with no corrections.
/// Searched like MarkdownExamRepository: assembly dir, then walking up to
/// the repo root (dev layout runs from bin/Release/net10.0).
/// </summary>
public sealed class JsonErrataStore : IErrataProvider
{
    private readonly IFileProvider _files;
    private readonly ILogger<JsonErrataStore>? _logger;
    private readonly Lazy<Dictionary<(string File, int Id), ErrataEntry>> _entries;

    public JsonErrataStore(IFileProvider files, ILogger<JsonErrataStore>? logger = null)
    {
        _files = files;
        _logger = logger;
        _entries = new Lazy<Dictionary<(string, int), ErrataEntry>>(Load);
    }

    public bool TryGetCorrection(string sourceFileName, int questionId,
                                 out IReadOnlyList<string> correctAnswers)
    {
        if (_entries.Value.TryGetValue(
                (sourceFileName.ToUpperInvariant(), questionId), out var entry))
        {
            correctAnswers = entry.CorrectAnswers;
            return true;
        }
        correctAnswers = Array.Empty<string>();
        return false;
    }

    private Dictionary<(string, int), ErrataEntry> Load()
    {
        var result = new Dictionary<(string, int), ErrataEntry>();
        var path = FindErrataFile();
        if (path == null)
        {
            _logger?.LogDebug("No errata.json found; running without corrections");
            return result;
        }

        try
        {
            using var doc = JsonDocument.Parse(_files.ReadAllText(path));
            if (doc.RootElement.ValueKind != JsonValueKind.Object
                || !doc.RootElement.TryGetProperty("errata", out var arr)
                || arr.ValueKind != JsonValueKind.Array)
            {
                _logger?.LogWarning("errata.json at {Path} has no 'errata' array", path);
                return result;
            }

            foreach (var item in arr.EnumerateArray())
            {
                // Per-entry guard: a wrong-typed field ("questionId": 3.5,
                // "file": 7) threw InvalidOperationException/FormatException
                // past the JsonException catch and broke every lookup.
                var entry = TryReadEntry(item);
                if (entry == null) continue;
                var key = (entry.File.ToUpperInvariant(), entry.QuestionId);
                if (result.ContainsKey(key))
                {
                    _logger?.LogWarning("Duplicate errata for {File} Q{Id}; keeping first ({ErrataId})", entry.File, entry.QuestionId, entry.Id);
                    continue;
                }
                result[key] = entry;
            }
            _logger?.LogInformation("Loaded {Count} errata corrections from {Path}", result.Count, path);
        }
        catch (Exception ex) when (ex is JsonException or IOException or UnauthorizedAccessException)
        {
            _logger?.LogWarning(ex, "errata.json at {Path} is unreadable or malformed; running without corrections", path);
            result.Clear();
        }
        return result;
    }

    private ErrataEntry? TryReadEntry(JsonElement item)
    {
        if (item.ValueKind != JsonValueKind.Object)
        {
            _logger?.LogWarning("Skipping errata entry: not an object");
            return null;
        }

        var id = String(item, "id") ?? "";
        var file = String(item, "file");
        if (string.IsNullOrEmpty(file)
            || !item.TryGetProperty("questionId", out var qid)
            || qid.ValueKind != JsonValueKind.Number
            || !qid.TryGetInt32(out var questionId))
        {
            _logger?.LogWarning("Skipping errata entry {Id}: missing or invalid file/questionId", id);
            return null;
        }

        // Only answerKey corrections are applied today; other types
        // (stem, option text) would need parser support first.
        var type = item.TryGetProperty("correctionType", out _) ? String(item, "correctionType") : "answerKey";
        if (!string.Equals(type, "answerKey", StringComparison.OrdinalIgnoreCase))
        {
            _logger?.LogWarning("Skipping errata entry {Id}: unsupported correctionType '{Type}'", id, type);
            return null;
        }

        if (!item.TryGetProperty("correctAnswer", out var ca)) return null;
        var answers = ca.ValueKind switch
        {
            JsonValueKind.Array => ca.EnumerateArray()
                .Select(a => a.ValueKind == JsonValueKind.String ? a.GetString() ?? "" : "")
                .ToList(),
            JsonValueKind.String => new List<string> { ca.GetString() ?? "" },
            _ => new List<string>(),
        };
        if (answers.Count == 0 || answers.Any(a => a.Length != 1 || a[0] is < 'A' or > 'F'))
        {
            _logger?.LogWarning("Skipping errata entry {Id}: correctAnswer must be letters A-F", id);
            return null;
        }

        return new ErrataEntry(id, file, questionId, answers, String(item, "rationale") ?? "");
    }

    private static string? String(JsonElement obj, string name) =>
        obj.TryGetProperty(name, out var v) && v.ValueKind == JsonValueKind.String ? v.GetString() : null;

    private string? FindErrataFile()
    {
        var dir = _files.GetExecutingAssemblyDirectory();
        for (var depth = 0; depth <= 6 && !string.IsNullOrEmpty(dir); depth++)
        {
            var candidate = _files.CombinePath(dir, "errata.json");
            if (_files.Exists(candidate)) return candidate;
            dir = _files.GetParentDirectory(dir);
        }
        return null;
    }
}
