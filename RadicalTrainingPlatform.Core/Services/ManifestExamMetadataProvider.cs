using RadicalTrainingPlatform.Core.Abstractions;
using RadicalTrainingPlatform.Core.Models;

namespace RadicalTrainingPlatform.Core.Services;

/// <summary>
/// Exam metadata read from exam.json manifests (S27-01). Because the manifest
/// loader reads both the built-in tree and every validated plugin's content
/// root, one provider covers every pack the platform has — which is the point
/// of putting plugins behind the same loader rather than beside it.
/// </summary>
public class ManifestExamMetadataProvider : IExamMetadataProvider
{
    private readonly Dictionary<string, ExamMetadata> _byId;

    public ManifestExamMetadataProvider(IManifestLoader loader)
    {
        _byId = new Dictionary<string, ExamMetadata>(StringComparer.OrdinalIgnoreCase);
        foreach (var (examId, manifest) in loader.LoadExamManifests())
            _byId[examId] = From(examId, manifest);
    }

    /// <summary>Project a manifest onto the vendor-neutral metadata shape.</summary>
    public static ExamMetadata From(string examId, ExamManifest manifest) => new()
    {
        ExamId = examId,
        Vendor = manifest.Vendor,
        DisplayName = manifest.DisplayName,
        OfficialVersion = manifest.OfficialVersion,
        ObjectivesDocVersion = manifest.ObjectivesDocVersion,
        SourceUrl = manifest.SourceUrl,
        SourceReviewDate = manifest.SourceReviewDate,
        ProductVersions = new Dictionary<string, string>(manifest.ProductVersions),
        ObjectiveCount = manifest.Sections.Sum(s => s.Objectives.Count),
        ManifestPath = manifest.ManifestPath,
        PluginId = "builtin",
    };

    public IEnumerable<ExamMetadata> Exams => _byId.Values.OrderBy(m => m.ExamId, StringComparer.Ordinal);

    public ExamMetadata? Get(string examId) =>
        _byId.TryGetValue(examId, out var m) ? m : null;

    public IEnumerable<string> Vendors =>
        _byId.Values.Select(m => m.Vendor).Where(v => !string.IsNullOrWhiteSpace(v)).Distinct().OrderBy(v => v, StringComparer.Ordinal);
}
