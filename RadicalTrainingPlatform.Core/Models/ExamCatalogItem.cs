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
    public List<string> SourceFiles { get; set; } = new();
}
