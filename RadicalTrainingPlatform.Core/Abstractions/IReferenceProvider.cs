using RadicalTrainingPlatform.Core.Models;

namespace RadicalTrainingPlatform.Core.Abstractions;

/// <summary>
/// A source of study references and KB links (S27-03). Providers declare the
/// exam IDs they cover; an aggregator asks only the providers that claim the
/// question's exam, then falls back to the built-in corpus.
/// </summary>
public interface IReferenceProvider
{
    /// <summary>Exam IDs this provider can answer for.</summary>
    IEnumerable<string> ExamIds { get; }

    /// <summary>Formatted reference text, or empty string when this provider has nothing.</summary>
    string GetReferenceForQuestion(Question q);

    /// <summary>KB links for a question; empty when this provider has nothing.</summary>
    List<(string Title, string Url)> GetKBLinksForQuestion(Question q);

    /// <summary>General study resources not tied to a question.</summary>
    List<(string Title, string Url)> GetGeneralResources();
}
