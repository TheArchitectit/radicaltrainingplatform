namespace RadicalTrainingPlatform.Core.Models;

/// <summary>
/// Objective reference inside an exam manifest section (SPEC-01 01.03).
/// </summary>
public class ManifestObjective
{
    public string Id { get; set; } = "";
    public string Title { get; set; } = "";
    public List<string> LessonIds { get; set; } = new();
}

public class ManifestSection
{
    public string Number { get; set; } = "";
    public string Title { get; set; } = "";
    /// <summary>Optional — present only when the official source publishes weights.</summary>
    public int? WeightPercent { get; set; }
    /// <summary>
    /// Study-allocation item count for this section. A product choice, never an
    /// official test model (REQ-AP-01/REQ-NP-01); omitted for NCA equal allocation.
    /// </summary>
    public int? StudyItemAllocation { get; set; }
    public List<ManifestObjective> Objectives { get; set; } = new();
}

public class ManifestQuestionPolicy
{
    public string Authorship { get; set; } = "";
    public string Review { get; set; } = "";
}

/// <summary>
/// A content pack's identity document (content/exams/&lt;examId&gt;/exam.json).
/// Exam identity for new packs resolves from this manifest, never from
/// QuestionParser.DeriveExamCode (REQ-MAN-02, D1).
/// </summary>
public class ExamManifest
{
    public string ExamId { get; set; } = "";
    public string Vendor { get; set; } = "";
    public string DisplayName { get; set; } = "";
    public string OfficialVersion { get; set; } = "";
    public string ObjectivesDocVersion { get; set; } = "";
    public string SourceUrl { get; set; } = "";
    public string SourceReviewDate { get; set; } = "";
    public Dictionary<string, string> ProductVersions { get; set; } = new();
    public List<ManifestSection> Sections { get; set; } = new();
    public ManifestQuestionPolicy? QuestionPolicy { get; set; }
    /// <summary>Declared study gaps — domains not yet covered by lessons/items.</summary>
    public List<string> Gaps { get; set; } = new();
    /// <summary>Set by the loader: the exam.json path this manifest was read from.</summary>
    public string ManifestPath { get; set; } = "";
}

/// <summary>
/// A beginner learning track manifest (content/tracks/&lt;trackId&gt;/track.json).
/// </summary>
public class TrackManifest
{
    public string TrackId { get; set; } = "";
    public string Title { get; set; } = "";
    public List<string> ExamIds { get; set; } = new();
    public string Audience { get; set; } = "";
    public string PreviewLabel { get; set; } = "";
    public string Disclaimer { get; set; } = "";
    public int Order { get; set; }
    public string ManifestPath { get; set; } = "";
}
