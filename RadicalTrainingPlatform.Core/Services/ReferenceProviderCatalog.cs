using RadicalTrainingPlatform.Core.Abstractions;
using RadicalTrainingPlatform.Core.Models;

namespace RadicalTrainingPlatform.Core.Services;

/// <summary>
/// Resolves references across every registered provider (S27-03).
///
/// Providers are asked in registration order and the first non-empty answer
/// wins; when none of the providers covering the question's exam has anything,
/// the fallback service answers. A provider that does not declare the exam is
/// never consulted, so adding a vendor pack cannot change what an existing
/// exam's questions return.
/// </summary>
public class ReferenceProviderCatalog : IReferenceService
{
    private readonly IReadOnlyList<IReferenceProvider> _providers;
    private readonly IReferenceService _fallback;

    public ReferenceProviderCatalog(IEnumerable<IReferenceProvider> providers, IReferenceService fallback)
    {
        _providers = providers.ToList();
        _fallback = fallback;
    }

    public string GetReferenceForQuestion(Question q)
    {
        foreach (var provider in Covering(q.ExamCode))
        {
            var reference = provider.GetReferenceForQuestion(q);
            if (!string.IsNullOrWhiteSpace(reference)) return reference;
        }
        return _fallback.GetReferenceForQuestion(q);
    }

    public List<(string Title, string Url)> GetKBLinksForQuestion(Question q)
    {
        foreach (var provider in Covering(q.ExamCode))
        {
            var links = provider.GetKBLinksForQuestion(q);
            if (links.Count > 0) return links;
        }
        return _fallback.GetKBLinksForQuestion(q);
    }

    /// <summary>
    /// General resources are not exam-scoped, so every provider is asked and
    /// the answers are concatenated — the fallback's list alone would hide a
    /// vendor pack's own study links.
    /// </summary>
    public List<(string Title, string Url)> GetGeneralResources()
    {
        var combined = new List<(string Title, string Url)>();
        var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var provider in _providers)
            foreach (var link in provider.GetGeneralResources())
                if (seen.Add(link.Url)) combined.Add(link);
        foreach (var link in _fallback.GetGeneralResources())
            if (seen.Add(link.Url)) combined.Add(link);
        return combined;
    }

    private IEnumerable<IReferenceProvider> Covering(string examCode) =>
        _providers.Where(p => p.ExamIds.Contains(examCode, StringComparer.OrdinalIgnoreCase));
}
