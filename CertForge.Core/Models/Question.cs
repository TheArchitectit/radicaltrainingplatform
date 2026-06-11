namespace CertForge.Core.Models;

public class Question
{
    public int Id { get; set; }
    public string ExamCode { get; set; } = "";
    public string Domain { get; set; } = "";
    public string Stem { get; set; } = "";
    public List<AnswerOption> Options { get; set; } = new();
    public List<string> CorrectAnswers { get; set; } = new();
    public string Explanation { get; set; } = "";
    public bool IsMultiSelect => CorrectAnswers.Count > 1;
    public string SourceFile { get; set; } = "";
}
