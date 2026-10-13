using RadicalTrainingPlatform.Core.Models;

namespace RadicalTrainingPlatform.Core.Abstractions;

/// <summary>
/// A source of exam blueprints (S27-02). Providers declare which exam IDs they
/// cover so an aggregator can route a request without trying every one.
/// </summary>
public interface IBlueprintProvider
{
    /// <summary>Exam IDs this provider can answer for.</summary>
    IEnumerable<string> ExamIds { get; }

    /// <summary>The blueprint, or null if this provider does not cover the exam.</summary>
    ExamBlueprint? GetBlueprint(string examId);
}
