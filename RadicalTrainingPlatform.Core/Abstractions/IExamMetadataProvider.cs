using RadicalTrainingPlatform.Core.Models;

namespace RadicalTrainingPlatform.Core.Abstractions;

/// <summary>
/// A source of vendor/exam identity and provenance (S27-01). The manifest tree
/// is one implementation; a plugin content root or a future remote catalog is
/// another. Consumers ask for an exam ID and get back who publishes it and
/// where its claims came from.
/// </summary>
public interface IExamMetadataProvider
{
    /// <summary>Every exam this provider knows, in discovery order.</summary>
    IEnumerable<ExamMetadata> Exams { get; }

    /// <summary>The exam, or null when this provider does not carry it.</summary>
    ExamMetadata? Get(string examId);

    /// <summary>Distinct vendor names this provider covers, sorted.</summary>
    IEnumerable<string> Vendors { get; }
}
