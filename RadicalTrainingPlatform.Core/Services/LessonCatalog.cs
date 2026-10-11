using Microsoft.Extensions.Logging;

namespace RadicalTrainingPlatform.Core;

/// <summary>
/// One lesson as the learner reads it: the markdown body plus the title taken
/// from the first heading, or the lesson id when the file has no heading.
/// </summary>
public sealed record LessonContent(
    string ExamId,
    string LessonId,
    string Title,
    string Body,
    string Path);

/// <summary>
/// Reads the lesson files a bundle ships.
///
/// Lessons were previously declarative only: exam manifests named lessonIds for
/// objective coverage, and no code ever opened the file. That made "the lesson
/// loads" unprovable — a bundle could ship an exam whose lessons were missing
/// and nothing noticed. This reads through the bundle manifest, so a lesson the
/// manifest does not name is a lesson that does not exist.
/// </summary>
public interface ILessonCatalog
{
    /// <summary>Lesson ids the bundle ships for an exam, in manifest order.</summary>
    IReadOnlyList<string> ListLessons(string examId);

    /// <summary>The lesson, or null when the bundle ships no such lesson.</summary>
    LessonContent? GetLesson(string examId, string lessonId);
}

/// <inheritdoc />
public sealed class BundleLessonCatalog : ILessonCatalog
{
    private readonly IContentBundle _bundle;
    private readonly IFileProvider _files;
    private readonly ILogger<BundleLessonCatalog>? _logger;

    public BundleLessonCatalog(IContentBundle bundle, IFileProvider files,
                               ILogger<BundleLessonCatalog>? logger = null)
    {
        _bundle = bundle;
        _files = files;
        _logger = logger;
    }

    public IReadOnlyList<string> ListLessons(string examId)
    {
        if (!_bundle.IsAvailable || _bundle.Manifest == null) return Array.Empty<string>();
        return _bundle.Manifest.Exams.TryGetValue(examId, out var exam)
            ? exam.Lessons.Select(l => l.LessonId).ToList()
            : Array.Empty<string>();
    }

    public LessonContent? GetLesson(string examId, string lessonId)
    {
        if (!_bundle.IsAvailable || _bundle.Manifest == null)
        {
            _logger?.LogDebug("No content bundle; lesson {Exam}/{Lesson} unavailable", examId, lessonId);
            return null;
        }

        if (!_bundle.Manifest.Exams.TryGetValue(examId, out var exam)) return null;
        var entry = exam.Lessons.FirstOrDefault(
            l => string.Equals(l.LessonId, lessonId, StringComparison.OrdinalIgnoreCase));
        if (entry == null) return null;

        var path = _bundle.Resolve(entry.Path);
        if (!_files.Exists(path))
        {
            _logger?.LogWarning("Lesson {Exam}/{Lesson} is named by the manifest but missing at {Path}",
                                examId, lessonId, path);
            return null;
        }

        var body = _files.ReadAllText(path);
        return new LessonContent(examId, entry.LessonId, TitleOf(body, entry.LessonId), body, path);
    }

    private static string TitleOf(string body, string fallback)
    {
        foreach (var line in body.Split('\n'))
        {
            var trimmed = line.Trim();
            if (trimmed.StartsWith("# ", StringComparison.Ordinal))
            {
                var title = trimmed[2..].Trim();
                if (title.Length > 0) return title;
            }
        }
        return fallback;
    }
}
