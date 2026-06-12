using RadicalTrainingPlatform.Core.Models;

namespace RadicalTrainingPlatform.Core.Abstractions;

/// <summary>
/// Parses exam markdown files and builds exam catalogs.
/// </summary>
public interface IQuestionParser
{
    /// <summary>
    /// Build a lightweight catalog of all discovered exams without parsing every question.
    /// </summary>
    List<ExamCatalogItem> BuildCatalog();

    /// <summary>
    /// Parse a single exam file into Question objects.
    /// </summary>
    List<Question> ParseFile(string filePath);

    /// <summary>
    /// Load all exams from discovered files, keyed by exam code.
    /// </summary>
    Dictionary<string, List<Question>> LoadAllExams();
}
