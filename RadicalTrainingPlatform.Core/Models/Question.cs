using System.Text.RegularExpressions;

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
    public bool IsMultiSelect => CorrectAnswers.Count > 1;
    public string SourceFile { get; set; } = "";

    /// <summary>
    /// A sequence question, tagged in the bank as <c>### QN (Ordering)</c>.
    /// For these the answer key lists the options IN THE REQUIRED ORDER
    /// (e.g. <c>**Answer: B, C, D, A, E**</c> means B first, then C, …), so
    /// grading must compare position, not membership. Grading them as sets
    /// made "select every option" score as correct.
    /// </summary>
    private static readonly Regex OrderingTag =
        new(@"^\s*\(\s*ordering\s*\)", RegexOptions.IgnoreCase | RegexOptions.Compiled);

    public bool IsOrdering => OrderingTag.IsMatch(Stem);
}
