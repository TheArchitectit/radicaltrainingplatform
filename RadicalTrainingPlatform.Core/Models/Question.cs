namespace RadicalTrainingPlatform.Core.Models;

public class Question
{
    public int Id { get; set; }
    public string ExamCode { get; set; } = "";
    public string Domain { get; set; } = "";
    public string Stem { get; set; } = "";
    public List<AnswerOption> Options { get; set; } = new();
    public List<string> CorrectAnswers { get; set; } = new();
    public string Explanation { get; set; } = "";
    /// <summary>Response type; drives selection UI and grading (R-03).</summary>
    public QuestionType Type { get; set; } = QuestionType.SingleChoice;
    /// <summary>True when this item is excluded from scored packs (R-03:
    /// ordering items are quarantined until sequence scoring ships everywhere).</summary>
    public bool Quarantined { get; set; }
    public bool IsMultiSelect => Type == QuestionType.MultiSelect;
    public bool IsOrdered => Type == QuestionType.Ordered;
    public string SourceFile { get; set; } = "";
}
