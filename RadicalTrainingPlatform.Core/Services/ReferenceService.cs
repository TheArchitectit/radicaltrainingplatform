using RadicalTrainingPlatform.Core.Models;

namespace RadicalTrainingPlatform.Core;

/// <summary>
/// Backward-compatible static shim for legacy callers (WinForms).
/// New code should use IReferenceService via dependency injection.
/// </summary>
[Obsolete("Use injected IReferenceService via DI. See DESIGN-PLAN.md Phase 1.5")]
public static class ReferenceService
{
    private static readonly HardcodedReferenceService _instance = new();

    public static string GetReferenceForQuestion(Question q) => _instance.GetReferenceForQuestion(q);

    public static List<(string Title, string Url)> GetKBLinksForQuestion(Question q) => _instance.GetKBLinksForQuestion(q);

    public static List<(string Title, string Url)> GetGeneralResources() => _instance.GetGeneralResources();
}
