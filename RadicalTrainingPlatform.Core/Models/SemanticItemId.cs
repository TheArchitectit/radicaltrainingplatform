namespace RadicalTrainingPlatform.Core.Models;

/// <summary>
/// Immutable source-aware item identity (R-13 / TM-81).
///
/// A bare exam-plus-number key ("NCA-75:1") is ambiguous the moment two
/// source files in one exam both contain a Q1 — which every multi-part
/// legacy bank does. The semantic ID adds the source file and keeps the
/// local question number as written:
///
///     <examId>/<sourceFile>/Q&lt;localId&gt;
///     NCA-75/NCA-75-Part1.md/Q1
///     NCA-75/NCA-75-Part2.md/Q1
///
/// Display numbering is a separate concern (ExamSessionViewModel.GetDisplayNumber)
/// and never participates in identity. Revision is carried by the manifest
/// (content revision / provenance), not by mutating the ID.
/// </summary>
public static class SemanticItemId
{
    public const char Separator = '/';

    /// <summary>Canonical form: examId/sourceFile/QlocalId.</summary>
    public static string Compose(string examId, string sourceFile, int localId)
    {
        if (string.IsNullOrWhiteSpace(examId))
            throw new ArgumentException("examId is required for a semantic item id", nameof(examId));
        if (string.IsNullOrWhiteSpace(sourceFile))
            throw new ArgumentException("sourceFile is required for a semantic item id", nameof(sourceFile));
        if (localId <= 0)
            throw new ArgumentOutOfRangeException(nameof(localId), localId, "local question id must be positive");

        // Source file is stored as a bare file name; directories would make
        // the ID path-sensitive across hosts.
        var file = Path.GetFileName(sourceFile.Replace('\\', '/'));
        return $"{examId.Trim()}{Separator}{file}{Separator}Q{localId}";
    }

    /// <summary>
    /// Parse a canonical semantic ID. Returns false for legacy "EXAM:number"
    /// callers and for anything else that is not the three-part form — those
    /// must go through <see cref="ResolveLegacy"/> so ambiguity is explicit
    /// rather than silently resolved.
    /// </summary>
    public static bool TryParse(string? id, out string examId, out string sourceFile, out int localId)
    {
        examId = "";
        sourceFile = "";
        localId = 0;
        if (string.IsNullOrWhiteSpace(id)) return false;

        var parts = id.Split(Separator);
        if (parts.Length != 3) return false;
        if (string.IsNullOrWhiteSpace(parts[0]) || string.IsNullOrWhiteSpace(parts[1])) return false;

        var local = parts[2];
        if (local.Length < 2 || (local[0] != 'Q' && local[0] != 'q')) return false;
        if (!int.TryParse(local[1..], out localId) || localId <= 0) return false;

        examId = parts[0];
        sourceFile = parts[1];
        return true;
    }

    /// <summary>
    /// Explicit ambiguity response for legacy EXAM:number callers (R-13).
    /// Exactly one match → that question. More than one →
    /// <see cref="LegacyLookup.Ambiguous"/> listing every candidate source
    /// file, never a silent pick. Zero → NotFound.
    /// </summary>
    public static LegacyLookup ResolveLegacy(IEnumerable<Question> questions, string examId, int localId)
    {
        var matches = questions
            .Where(q => string.Equals(q.ExamCode, examId, StringComparison.OrdinalIgnoreCase)
                        && q.Id == localId)
            .ToList();

        return matches.Count switch
        {
            0 => LegacyLookup.NotFound(examId, localId),
            1 => LegacyLookup.Found(matches[0]),
            _ => LegacyLookup.Ambiguous(examId, localId, matches),
        };
    }

    /// <summary>
    /// Collision detector (TM-81). Reports every semantic ID that claims more
    /// than one question. The live banks must produce zero collisions; a
    /// seeded duplicate must show up here so the gate can fail.
    /// </summary>
    public static IReadOnlyList<SemanticIdCollision> DetectCollisions(IEnumerable<Question> questions)
    {
        var byId = new Dictionary<string, List<Question>>(StringComparer.Ordinal);
        foreach (var q in questions)
        {
            var id = Compose(q.ExamCode, q.SourceFile, q.Id);
            if (!byId.TryGetValue(id, out var list))
                byId[id] = list = new List<Question>();
            list.Add(q);
        }

        return byId
            .Where(kv => kv.Value.Count > 1)
            .Select(kv => new SemanticIdCollision(kv.Key, kv.Value.Count,
                kv.Value.Select(q => q.SourceFile).Distinct().ToList()))
            .ToList();
    }
}

/// <summary>Result of a legacy EXAM:number lookup. Never silently picks among multiples.</summary>
public sealed class LegacyLookup
{
    public bool IsFound { get; private init; }
    public bool IsAmbiguous { get; private init; }
    public Question? Question { get; private init; }
    public IReadOnlyList<Question> Candidates { get; private init; } = Array.Empty<Question>();
    public string ExamId { get; private init; } = "";
    public int LocalId { get; private init; }

    /// <summary>Human-readable reason when the lookup did not return a single item.</summary>
    public string Reason { get; private init; } = "";

    public static LegacyLookup Found(Question q) => new()
    {
        IsFound = true,
        Question = q,
        ExamId = q.ExamCode,
        LocalId = q.Id,
    };

    public static LegacyLookup NotFound(string examId, int localId) => new()
    {
        ExamId = examId,
        LocalId = localId,
        Reason = "not-found",
    };

    public static LegacyLookup Ambiguous(string examId, int localId, IReadOnlyList<Question> candidates) => new()
    {
        IsAmbiguous = true,
        Candidates = candidates,
        ExamId = examId,
        LocalId = localId,
        Reason = $"ambiguous:{candidates.Count}-candidates:" +
                 string.Join(",", candidates.Select(c => c.SourceFile)),
    };
}

/// <summary>One semantic ID claimed by more than one question.</summary>
public sealed record SemanticIdCollision(string Id, int Count, IReadOnlyList<string> SourceFiles);
