using RadicalTrainingPlatform.Core.Models;

namespace RadicalTrainingPlatform.Core;

/// <summary>
/// Backward-compatible static shim for legacy callers (WinForms).
/// New code should use IBlueprintService via dependency injection.
/// </summary>
[Obsolete("Use injected IBlueprintService via DI. See DESIGN-PLAN.md Phase 1.5")]
public static class BlueprintService
{
    private static readonly HardcodedBlueprintService _instance = new();

    public static ExamBlueprint? GetBlueprint(string examCode) => _instance.GetBlueprint(examCode);

    public static Dictionary<string, int> CalculateCoverage(string examCode, List<string> questionTexts) => _instance.CalculateCoverage(examCode, questionTexts);

    public static List<(string ObjId, string ObjTitle)> GetObjectivesForQuestion(string examCode, string questionText) => _instance.GetObjectivesForQuestion(examCode, questionText);

    public static List<(string Section, string Description)> GetBibleSections(string examCode) => _instance.GetBibleSections(examCode);
}
