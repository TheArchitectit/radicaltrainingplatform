using RadicalTrainingPlatform.Core.Abstractions;
using RadicalTrainingPlatform.Core.Models;

namespace RadicalTrainingPlatform.Core.Services;

/// <summary>
/// Blueprint source backed by exam.json manifests (REQ-MAN-04).
/// For manifest-covered exams, this service is authoritative; for legacy
/// exams without manifests it delegates to HardcodedBlueprintService.
/// </summary>
public class ManifestBlueprintService : IBlueprintService
{
    private readonly Dictionary<string, ExamBlueprint> _fromManifests;
    private readonly IBlueprintService _fallback;

    public ManifestBlueprintService(IManifestLoader loader, IBlueprintService fallback)
    {
        _fallback = fallback;
        _fromManifests = new Dictionary<string, ExamBlueprint>(StringComparer.OrdinalIgnoreCase);
        foreach (var (examId, manifest) in loader.LoadExamManifests())
            _fromManifests[examId] = ToBlueprint(manifest);
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
        if (_fromManifests.TryGetValue(examCode, out var bp)) return bp;
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
        if (_fromManifests.ContainsKey(examCode)) return new();
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
