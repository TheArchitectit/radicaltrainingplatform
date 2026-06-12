using RadicalTrainingPlatform.Core.Models;

namespace RadicalTrainingPlatform.Core.Abstractions;

/// <summary>
/// Provides knowledge base references and links for exam questions.
/// Implementations may use keyword scoring, semantic search, or remote APIs.
/// </summary>
public interface IReferenceService
{
    /// <summary>
    /// Get a quick-reference summary for a question based on keyword matching.
    /// </summary>
    /// <param name="q">The question to find references for</param>
    /// <returns>Formatted reference text, or empty string if no match</returns>
    string GetReferenceForQuestion(Question q);

    /// <summary>
    /// Get knowledge base links relevant to a question.
    /// </summary>
    /// <param name="q">The question to find KB links for</param>
    /// <returns>List of (Title, Url) tuples for relevant documentation</returns>
    List<(string Title, string Url)> GetKBLinksForQuestion(Question q);

    /// <summary>
    /// Get general study resources not tied to a specific question.
    /// </summary>
    /// <returns>List of (Title, Url) tuples for general documentation</returns>
    List<(string Title, string Url)> GetGeneralResources();
}
