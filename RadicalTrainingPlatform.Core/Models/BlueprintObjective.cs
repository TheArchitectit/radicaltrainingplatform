namespace RadicalTrainingPlatform.Core.Models;

public class BlueprintSection
{
    public string ExamCode { get; set; } = "";
    public int SectionNumber { get; set; }
    public string SectionTitle { get; set; } = "";
    public int WeightPercent { get; set; }
    public List<BlueprintObjective> Objectives { get; set; } = new();
}

public class BlueprintObjective
{
    public string Id { get; set; } = "";       // e.g., "1.1", "2.3"
    public string Title { get; set; } = "";
    public List<string> Knowledge { get; set; } = new();
    public List<string> References { get; set; } = new();
    public List<string> Keywords { get; set; } = new();  // For question mapping
}

public class ExamBlueprint
{
    public string ExamCode { get; set; } = "";
    public string ExamTitle { get; set; } = "";
    public int QuestionCount { get; set; }
    public int TimeLimitMinutes { get; set; }
    public string PassingScore { get; set; } = "";
    public List<BlueprintSection> Sections { get; set; } = new();
}
