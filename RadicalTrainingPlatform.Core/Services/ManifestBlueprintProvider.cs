using RadicalTrainingPlatform.Core.Abstractions;
using RadicalTrainingPlatform.Core.Models;

namespace RadicalTrainingPlatform.Core.Services;

/// <summary>
/// Blueprints built from exam.json manifests (S27-02). A provider rather than
/// the service itself, so the service can aggregate several sources and still
/// keep its fallback behaviour for legacy exams.
/// </summary>
public class ManifestBlueprintProvider : IBlueprintProvider
{
    private readonly Dictionary<string, ExamBlueprint> _byId;

    public ManifestBlueprintProvider(IManifestLoader loader)
    {
        _byId = new Dictionary<string, ExamBlueprint>(StringComparer.OrdinalIgnoreCase);
        foreach (var (examId, manifest) in loader.LoadExamManifests())
            _byId[examId] = ManifestBlueprintService.ToBlueprint(manifest);
    }

    public IEnumerable<string> ExamIds => _byId.Keys;

    public ExamBlueprint? GetBlueprint(string examId) =>
        _byId.TryGetValue(examId, out var bp) ? bp : null;
}
