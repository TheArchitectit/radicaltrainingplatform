using RadicalTrainingPlatform.Core.Models;

namespace RadicalTrainingPlatform.Core.Abstractions;

/// <summary>
/// Loads track and exam manifests from the content/ tree (SPEC-02).
/// </summary>
public interface IManifestLoader
{
    /// <summary>
    /// All exam manifests found under content/exams/*/exam.json, keyed by ExamId.
    /// </summary>
    Dictionary<string, ExamManifest> LoadExamManifests();

    /// <summary>
    /// All track manifests found under content/tracks/*/track.json, keyed by TrackId.
    /// </summary>
    Dictionary<string, TrackManifest> LoadTrackManifests();

    /// <summary>
    /// Directories that were searched (for validators and diagnostics).
    /// </summary>
    IEnumerable<string> SearchRoots { get; }
}
