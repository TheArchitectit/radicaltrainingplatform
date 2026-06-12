using RadicalTrainingPlatform.Core.Models;

namespace RadicalTrainingPlatform.Core.Abstractions;

/// <summary>
/// Provides exam blueprint data, question-to-objective mapping, and reference sections.
/// Implementations may load data from hardcoded sources, JSON files, or remote APIs.
/// </summary>
public interface IBlueprintService
{
    /// <summary>
    /// Get the full exam blueprint for a given exam code.
    /// </summary>
    /// <param name="examCode">Exam code (e.g. "NCP-US", "NCA-75")</param>
    /// <returns>The blueprint, or null if the exam code is not recognized.</returns>
    ExamBlueprint? GetBlueprint(string examCode);

    /// <summary>
    /// Calculate how many questions map to each blueprint objective using keyword matching.
    /// </summary>
    /// <param name="examCode">Exam code</param>
    /// <param name="questionTexts">Collection of question stem text to match against objective keywords</param>
    /// <returns>Dictionary mapping objective IDs to question counts</returns>
    Dictionary<string, int> CalculateCoverage(string examCode, List<string> questionTexts);

    /// <summary>
    /// Find which blueprint objectives a question's text maps to.
    /// </summary>
    /// <param name="examCode">Exam code</param>
    /// <param name="questionText">The question stem text</param>
    /// <returns>List of matching objective IDs and titles</returns>
    List<(string ObjId, string ObjTitle)> GetObjectivesForQuestion(string examCode, string questionText);

    /// <summary>
    /// Get the reference "Bible sections" for a given exam — the canonical study references.
    /// </summary>
    /// <param name="examCode">Exam code</param>
    /// <returns>List of (Section, Description) tuples</returns>
    List<(string Section, string Description)> GetBibleSections(string examCode);
}
