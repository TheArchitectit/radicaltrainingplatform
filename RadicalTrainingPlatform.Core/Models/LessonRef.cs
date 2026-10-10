namespace RadicalTrainingPlatform.Core.Models;

/// <summary>
/// A lesson reference inside an exam manifest objective (SPEC-01 01.03).
/// lessonIds in exam.json name files under content/exams/&lt;examId&gt;/lessons/.
/// </summary>
public class LessonRef
{
    public string LessonId { get; set; } = "";
    public string Title { get; set; } = "";
    public string Path { get; set; } = "";
}
