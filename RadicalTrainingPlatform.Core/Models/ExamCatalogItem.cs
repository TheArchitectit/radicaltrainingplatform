namespace RadicalTrainingPlatform.Core.Models;

/// <summary>
/// Lightweight catalog entry describing a discovered exam.
/// Used to build dynamic exam selectors without loading full question sets.
/// </summary>
public class ExamCatalogItem
{
    public string ExamCode { get; set; } = "";
    public string DisplayName { get; set; } = "";
    public string Description { get; set; } = "";
    public string Vendor { get; set; } = "";
    public int QuestionCount { get; set; }
    public int DomainCount { get; set; }
    public string Level { get; set; } = "";           // Entry, Associate, Professional, Advanced, Expert
    public string Color { get; set; } = "#00F0FF";    // Neon accent for the card border
    /// <summary>Pack/content version from the exam manifest (R-18 footer).</summary>
    public string PackVersion { get; set; } = "";
    /// <summary>Human source-review date from the manifest. Never invented (SPEC-16).</summary>
    public string SourceReviewDate { get; set; } = "";
    public List<string> SourceFiles { get; set; } = new();
}
