using System.Text.Json;
using Microsoft.Extensions.Logging;
using RadicalTrainingPlatform.Core.Abstractions;
using RadicalTrainingPlatform.Core.Models;

namespace RadicalTrainingPlatform.Core.Services;

/// <summary>
/// Reads track/exam manifests from content/ using the exam repository's
/// search paths (so the same root that finds legacy banks finds content/).
/// </summary>
public class ManifestLoader : IManifestLoader
{
    private readonly IExamRepository _exams;
    private readonly IFileProvider _files;
    private readonly ILogger<ManifestLoader>? _logger;

    public ManifestLoader(IExamRepository exams, IFileProvider files, ILogger<ManifestLoader>? logger = null)
    {
        _exams = exams;
        _files = files;
        _logger = logger;
    }

    public IEnumerable<string> SearchRoots => _exams.SearchPaths;

    public Dictionary<string, ExamManifest> LoadExamManifests()
    {
        var result = new Dictionary<string, ExamManifest>(StringComparer.OrdinalIgnoreCase);
        foreach (var root in SearchRoots)
        {
            var examsDir = _files.CombinePath(root, "content", "exams");
            if (!_files.Exists(examsDir)) continue;

            foreach (var dir in _files.GetDirectories(examsDir))
            {
                var manifestPath = _files.CombinePath(dir, "exam.json");
                if (!_files.Exists(manifestPath)) continue;

                var manifest = Deserialize<ExamManifest>(_files.ReadAllText(manifestPath), manifestPath);
                if (manifest == null) continue;
                manifest.ManifestPath = manifestPath;

                if (string.IsNullOrWhiteSpace(manifest.ExamId))
                {
                    _logger?.LogWarning("Exam manifest {Path} has no examId — skipped", manifestPath);
                    continue;
                }
                // REQ-MAN-05: duplicate exam IDs never merge silently.
                if (result.TryGetValue(manifest.ExamId, out var existing))
                    throw new InvalidOperationException(
                        $"Duplicate exam ID '{manifest.ExamId}' claimed by both '{existing.ManifestPath}' and '{manifestPath}'");
                result[manifest.ExamId] = manifest;
            }
            // Search roots are priority-ordered; the first root with a content/
            // tree wins so fixture trees in tests are not shadowed by repo roots.
            if (result.Count > 0) break;
        }
        return result;
    }

    public Dictionary<string, TrackManifest> LoadTrackManifests()
    {
        var result = new Dictionary<string, TrackManifest>(StringComparer.OrdinalIgnoreCase);
        foreach (var root in SearchRoots)
        {
            var tracksDir = _files.CombinePath(root, "content", "tracks");
            if (!_files.Exists(tracksDir)) continue;

            foreach (var dir in _files.GetDirectories(tracksDir))
            {
                var manifestPath = _files.CombinePath(dir, "track.json");
                if (!_files.Exists(manifestPath)) continue;

                var manifest = Deserialize<TrackManifest>(_files.ReadAllText(manifestPath), manifestPath);
                if (manifest == null) continue;
                manifest.ManifestPath = manifestPath;

                if (string.IsNullOrWhiteSpace(manifest.TrackId))
                {
                    _logger?.LogWarning("Track manifest {Path} has no trackId — skipped", manifestPath);
                    continue;
                }
                if (result.TryGetValue(manifest.TrackId, out var existing))
                    throw new InvalidOperationException(
                        $"Duplicate track ID '{manifest.TrackId}' claimed by both '{existing.ManifestPath}' and '{manifestPath}'");
                result[manifest.TrackId] = manifest;
            }
            if (result.Count > 0) break;
        }
        return result;
    }

    private T? Deserialize<T>(string json, string path) where T : class
    {
        try
        {
            return JsonSerializer.Deserialize<T>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                ReadCommentHandling = JsonCommentHandling.Skip,
                AllowTrailingCommas = true,
            });
        }
        catch (JsonException ex)
        {
            _logger?.LogError(ex, "Malformed manifest {Path}", path);
            return null;
        }
    }
}
