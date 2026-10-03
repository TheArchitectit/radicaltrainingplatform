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
            if (!doc.RootElement.TryGetProperty("errata", out var arr)
                || arr.ValueKind != JsonValueKind.Array)
            {
                _logger?.LogWarning("errata.json at {Path} has no 'errata' array", path);
                return result;
            }

            foreach (var item in arr.EnumerateArray())
            {
                var id = item.TryGetProperty("id", out var i) ? i.GetString() ?? "" : "";
                var file = item.TryGetProperty("file", out var f) ? f.GetString() : null;
                if (string.IsNullOrEmpty(file)
                    || !item.TryGetProperty("questionId", out var qid)
                    || qid.ValueKind != JsonValueKind.Number)
                {
                    _logger?.LogWarning("Skipping errata entry {Id}: missing file/questionId", id);
                    continue;
                }

                // Only answerKey corrections are applied today; other types
                // (stem, option text) would need parser support first.
                var type = item.TryGetProperty("correctionType", out var t)
                    ? t.GetString() : "answerKey";
                if (!string.Equals(type, "answerKey", StringComparison.OrdinalIgnoreCase))
                {
                    _logger?.LogWarning("Skipping errata entry {Id}: unsupported correctionType '{Type}'", id, type);
                    continue;
                }

                if (!item.TryGetProperty("correctAnswer", out var ca)) continue;
                var answers = ca.ValueKind == JsonValueKind.Array
                    ? ca.EnumerateArray().Select(a => a.GetString() ?? "").Where(a => a != "").ToList()
                    : new List<string> { ca.GetString() ?? "" };
                if (answers.Count == 0 || answers.Any(string.IsNullOrEmpty))
                {
                    _logger?.LogWarning("Skipping errata entry {Id}: empty correctAnswer", id);
                    continue;
                }

                var rationale = item.TryGetProperty("rationale", out var r) ? r.GetString() ?? "" : "";
                var entryId = qid.GetInt32();
                var key = (file!.ToUpperInvariant(), entryId);
                if (result.ContainsKey(key))
                {
                    _logger?.LogWarning("Duplicate errata for {File} Q{Id}; keeping first ({ErrataId})", file, entryId, id);
                    continue;
                }
                result[key] = new ErrataEntry(id, file, entryId, answers, rationale);
            }
            _logger?.LogInformation("Loaded {Count} errata corrections from {Path}", result.Count, path);
        }
        catch (JsonException ex)
        {
            _logger?.LogWarning(ex, "errata.json at {Path} is malformed; running without corrections", path);
            result.Clear();
        }
        return result;
    }

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
