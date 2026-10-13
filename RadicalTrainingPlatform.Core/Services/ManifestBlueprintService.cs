using RadicalTrainingPlatform.Core.Abstractions;
using RadicalTrainingPlatform.Core.Models;

namespace RadicalTrainingPlatform.Core.Services;

/// <summary>
/// Blueprint aggregator (REQ-MAN-04, S27-02).
///
/// Providers are consulted in registration order and the first that covers an
/// exam wins — manifest packs are authoritative for the exams they declare,
/// and a vendor plugin's pack is just another provider. Legacy exams with no
/// manifest fall through to <see cref="HardcodedBlueprintService"/>.
/// </summary>
public class ManifestBlueprintService : IBlueprintService
{
    private readonly IReadOnlyList<IBlueprintProvider> _providers;
    private readonly HashSet<string> _providedExamIds;
    private readonly IBlueprintService _fallback;

    /// <summary>
    /// Aggregating constructor. Use this one in DI so discovered plugins take
    /// part; the manifest-only overload below is kept for callers that build
    /// the service directly.
    /// </summary>
    public ManifestBlueprintService(IEnumerable<IBlueprintProvider> providers, IBlueprintService fallback)
    {
        _fallback = fallback;
        _providers = providers.ToList();
        _providedExamIds = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var provider in _providers)
            foreach (var examId in provider.ExamIds)
                _providedExamIds.Add(examId);
    }

    public ManifestBlueprintService(IManifestLoader loader, IBlueprintService fallback)
        : this(new IBlueprintProvider[] { new ManifestBlueprintProvider(loader) }, fallback)
    {
    }

    public static ExamBlueprint ToBlueprint(ExamManifest manifest)
    {
        var bp = new ExamBlueprint
        {
            ExamCode = manifest.ExamId,
            ExamTitle = manifest.DisplayName,
            Sections = new List<BlueprintSection>(),
        };
        foreach (var s in manifest.Sections)
        {
            var section = new BlueprintSection
            {
                ExamCode = manifest.ExamId,
                SectionNumber = int.TryParse(s.Number, out var n) ? n : 0,
                SectionTitle = s.Title,
                WeightPercent = s.WeightPercent ?? 0,
            };
            foreach (var o in s.Objectives)
                section.Objectives.Add(new BlueprintObjective
                {
                    Id = o.Id,
                    Title = o.Title,
                });
            bp.Sections.Add(section);
        }
        return bp;
    }

    public ExamBlueprint? GetBlueprint(string examCode)
    {
        foreach (var provider in _providers)
        {
            var bp = provider.GetBlueprint(examCode);
            if (bp != null) return bp;
        }
        return _fallback.GetBlueprint(examCode);
    }

    public Dictionary<string, int> CalculateCoverage(string examCode, List<string> questionTexts)
    {
        var bp = GetBlueprint(examCode);
        if (bp == null) return new();

        var coverage = new Dictionary<string, int>();
        foreach (var section in bp.Sections)
            foreach (var obj in section.Objectives)
                coverage[obj.Id] = 0;

        foreach (var text in questionTexts)
        {
            var objectives = MatchObjectives(bp, text);
            foreach (var (objId, _) in objectives)
                coverage[objId]++;
        }
        return coverage;
    }

    public List<(string ObjId, string ObjTitle)> GetObjectivesForQuestion(string examCode, string questionText)
    {
        var bp = GetBlueprint(examCode);
        if (bp == null) return new();
        return MatchObjectives(bp, questionText)
            .Select(m => (m.ObjId, m.ObjTitle))
            .ToList();
    }

    public List<(string Section, string Description)> GetBibleSections(string examCode)
    {
        // Bible sections are a legacy-Nutanix concept; manifest packs have none.
        if (_providedExamIds.Contains(examCode)) return new();
        return _fallback.GetBibleSections(examCode);
    }

    private static List<(string ObjId, string ObjTitle)> MatchObjectives(ExamBlueprint bp, string questionText)
    {
        var matches = new List<(string, string)>();
        foreach (var section in bp.Sections)
            foreach (var obj in section.Objectives)
                if (obj.Title.Split(' ', StringSplitOptions.RemoveEmptyEntries)
                    .Any(w => w.Length > 3 && questionText.Contains(w, StringComparison.OrdinalIgnoreCase)))
                    matches.Add((obj.Id, obj.Title));
        return matches;
    }
}
