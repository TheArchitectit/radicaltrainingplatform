using RadicalTrainingPlatform.Core.Abstractions;
using RadicalTrainingPlatform.Core.Models;

namespace RadicalTrainingPlatform.Core.Services;

/// <summary>
/// Resolves exam metadata across every registered provider (S27-01). Providers
/// are consulted in registration order and the first that carries an exam wins,
/// so a vendor pack installed later can add exams but cannot silently redefine
/// one that already ships.
/// </summary>
public class ExamMetadataCatalog : IExamMetadataProvider
{
    private readonly IReadOnlyList<IExamMetadataProvider> _providers;

    public ExamMetadataCatalog(IEnumerable<IExamMetadataProvider> providers) =>
        _providers = providers.ToList();

    public IEnumerable<ExamMetadata> Exams
    {
        get
        {
            var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            foreach (var provider in _providers)
                foreach (var exam in provider.Exams)
                    if (seen.Add(exam.ExamId)) yield return exam;
        }
    }

    public ExamMetadata? Get(string examId)
    {
        foreach (var provider in _providers)
        {
            var found = provider.Get(examId);
            if (found != null) return found;
        }
        return null;
    }

    public IEnumerable<string> Vendors =>
        Exams.Select(e => e.Vendor)
             .Where(v => !string.IsNullOrWhiteSpace(v))
             .Distinct()
             .OrderBy(v => v, StringComparer.Ordinal);
}
