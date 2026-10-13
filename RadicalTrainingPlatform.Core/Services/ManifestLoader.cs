using System.Text.Json;
using Microsoft.Extensions.Logging;
using RadicalTrainingPlatform.Core.Abstractions;
using RadicalTrainingPlatform.Core.Models;

namespace RadicalTrainingPlatform.Core.Services;

/// <summary>
/// Reads track/exam manifests from content/ using the exam repository's
/// search paths (so the same root that finds legacy banks finds content/),
/// plus the content roots of every validated vendor plugin (S27-08).
///
/// The two root sets behave differently on purpose. Primary roots are
/// priority-ordered and the first with a content/ tree wins, so a test fixture
/// tree is not shadowed by the repository's own. Plugin roots are additive —
/// a vendor pack extends the catalog rather than replacing it — and a plugin
/// that declares an ID the built-in tree already owns collides loudly here as
/// well as in plugin validation (REQ-MAN-05).
/// </summary>
public class ManifestLoader : IManifestLoader
{
    private readonly IExamRepository _exams;
    private readonly IFileProvider _files;
    private readonly IPluginLoader? _plugins;
    private readonly ILogger<ManifestLoader>? _logger;

    public ManifestLoader(
        IExamRepository exams,
        IFileProvider files,
        ILogger<ManifestLoader>? logger = null,
        IPluginLoader? plugins = null)
    {
        _exams = exams;
        _files = files;
        _logger = logger;
        _plugins = plugins;
    }

    public IEnumerable<string> SearchRoots => _exams.SearchPaths;

    /// <summary>
    /// Content roots contributed by validated plugins. Empty until the plugin
    /// loader has run its discovery pass.
    /// </summary>
    private IEnumerable<string> PluginRoots => _plugins?.PluginContentSearchRoots ?? Array.Empty<string>();

    public Dictionary<string, ExamManifest> LoadExamManifests()
    {
        var result = new Dictionary<string, ExamManifest>(StringComparer.OrdinalIgnoreCase);

        foreach (var root in SearchRoots)
        {
            var examsDir = _files.CombinePath(root, "content", "exams");
            if (!_files.Exists(examsDir)) continue;
            LoadExamsFrom(examsDir, result);
            if (result.Count > 0) break;
        }

        // Plugin roots are content roots already: the loader appends exams/
        // directly rather than content/exams/.
        foreach (var root in PluginRoots)
            LoadExamsFrom(_files.CombinePath(root, "exams"), result);

        return result;
    }

    public Dictionary<string, TrackManifest> LoadTrackManifests()
    {
        var result = new Dictionary<string, TrackManifest>(StringComparer.OrdinalIgnoreCase);

        foreach (var root in SearchRoots)
        {
            var tracksDir = _files.CombinePath(root, "content", "tracks");
            if (!_files.Exists(tracksDir)) continue;
            LoadTracksFrom(tracksDir, result);
            if (result.Count > 0) break;
        }

        foreach (var root in PluginRoots)
            LoadTracksFrom(_files.CombinePath(root, "tracks"), result);

        return result;
    }

    private void LoadExamsFrom(string examsDir, Dictionary<string, ExamManifest> result)
    {
        if (!_files.Exists(examsDir)) return;
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
            if (result.TryGetValue(manifest.ExamId, out var existing))
                throw new InvalidOperationException(
                    $"Duplicate exam ID '{manifest.ExamId}' claimed by both '{existing.ManifestPath}' and '{manifestPath}'");
            result[manifest.ExamId] = manifest;
        }
    }

    private void LoadTracksFrom(string tracksDir, Dictionary<string, TrackManifest> result)
    {
        if (!_files.Exists(tracksDir)) return;
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
