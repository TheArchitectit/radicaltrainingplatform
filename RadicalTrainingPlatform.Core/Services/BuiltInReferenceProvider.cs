using RadicalTrainingPlatform.Core.Abstractions;
using RadicalTrainingPlatform.Core.Models;

namespace RadicalTrainingPlatform.Core.Services;

/// <summary>
/// The built-in reference corpus, exposed as a provider (S27-03). It declares
/// the exam codes it actually carries entries for, so the aggregator can route
/// a question without asking a source that has nothing to say about it.
/// </summary>
public class BuiltInReferenceProvider : IReferenceProvider
{
    private readonly IReferenceService _inner;

    public BuiltInReferenceProvider(IReferenceService inner) => _inner = inner;

    public IEnumerable<string> ExamIds => HardcodedReferenceService.ServedExamCodes;

    public string GetReferenceForQuestion(Question q) => _inner.GetReferenceForQuestion(q);

    public List<(string Title, string Url)> GetKBLinksForQuestion(Question q) => _inner.GetKBLinksForQuestion(q);

    public List<(string Title, string Url)> GetGeneralResources() => _inner.GetGeneralResources();
}
