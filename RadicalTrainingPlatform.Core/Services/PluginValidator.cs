using System.Security.Cryptography;
using RadicalTrainingPlatform.Core.Models;

namespace RadicalTrainingPlatform.Core.Services;

/// <summary>
/// Validates one vendor plugin before any of its content is loaded (S27-09).
///
/// A plugin that fails any check is skipped whole — a half-loaded pack would
/// put exams in the catalog whose manifests failed integrity, which is the
/// failure mode this exists to prevent. Every rejection names the file and the
/// reason so a pack author can fix it without reading Core source.
/// </summary>
public class PluginValidator
{
    /// <summary>plugin.json schema versions this build understands.</summary>
    public static readonly int[] SupportedSchemaVersions = { 1 };

    private readonly IFileProvider _files;

    public PluginValidator(IFileProvider files) => _files = files;

    /// <summary>
    /// Validate shape, integrity and ID ownership. <paramref name="claimedExamIds"/>
    /// and <paramref name="claimedTrackIds"/> are the IDs already owned by
    /// built-ins and earlier plugins — REQ-MAN-05: a duplicate never merges
    /// silently, in either direction.
    /// </summary>
    public PluginValidationResult Validate(
        VendorPlugin plugin,
        IEnumerable<string>? claimedExamIds = null,
        IEnumerable<string>? claimedTrackIds = null)
    {
        var errors = new List<string>();
        var path = string.IsNullOrEmpty(plugin.ManifestPath) ? plugin.PluginDirectory : plugin.ManifestPath;

        if (!SupportedSchemaVersions.Contains(plugin.SchemaVersion))
            errors.Add($"{path}: unsupported schemaVersion {plugin.SchemaVersion} " +
                       $"(this build understands {string.Join(", ", SupportedSchemaVersions)})");

        if (string.IsNullOrWhiteSpace(plugin.PluginId))
            errors.Add($"{path}: pluginId is required");
        if (string.IsNullOrWhiteSpace(plugin.Vendor))
            errors.Add($"{path}: vendor is required");
        if (string.IsNullOrWhiteSpace(plugin.DisplayName))
            errors.Add($"{path}: displayName is required");

        // Stop here when identity itself is broken — the remaining checks would
        // report noise against a plugin we cannot name.
        if (errors.Count > 0) return Result(plugin, errors);

        var contentRoot = string.IsNullOrEmpty(plugin.ContentSearchRoot)
            ? _files.CombinePath(plugin.PluginDirectory, plugin.ContentRoot)
            : plugin.ContentSearchRoot;

        if (!_files.Exists(contentRoot))
            errors.Add($"{path}: content root '{contentRoot}' does not exist");

        // Integrity: every declared file must be present and hash as declared.
        foreach (var entry in plugin.Files)
        {
            if (string.IsNullOrWhiteSpace(entry.Path) || string.IsNullOrWhiteSpace(entry.Sha256))
            {
                errors.Add($"{path}: files[] entry has an empty path or sha256");
                continue;
            }
            var full = _files.CombinePath(contentRoot, entry.Path.Replace('/', PathSeparator));
            if (!_files.Exists(full))
            {
                errors.Add($"{path}: declared file '{entry.Path}' is missing");
                continue;
            }
            var actual = Sha256Hex(_files.ReadAllBytes(full));
            if (!string.Equals(actual, entry.Sha256, StringComparison.OrdinalIgnoreCase))
                errors.Add($"{path}: hash mismatch: {entry.Path} " +
                           $"(manifest {Short(entry.Sha256)}, actual {Short(actual)})");
        }

        // ID ownership, both directions.
        var claimedExams = new HashSet<string>(claimedExamIds ?? Array.Empty<string>(), StringComparer.OrdinalIgnoreCase);
        var claimedTracks = new HashSet<string>(claimedTrackIds ?? Array.Empty<string>(), StringComparer.OrdinalIgnoreCase);
        foreach (var examId in ContentIdScan.ReadIds(_files, _files.CombinePath(contentRoot, "exams"), "exam.json", "examId"))
        {
            if (!claimedExams.Add(examId))
                errors.Add($"{path}: exam ID '{examId}' is already claimed by an earlier plugin or the built-in content tree");
        }
        foreach (var trackId in ContentIdScan.ReadIds(_files, _files.CombinePath(contentRoot, "tracks"), "track.json", "trackId"))
        {
            if (!claimedTracks.Add(trackId))
                errors.Add($"{path}: track ID '{trackId}' is already claimed by an earlier plugin or the built-in content tree");
        }

        return Result(plugin, errors);
    }

    /// <summary>
    /// The exam and track IDs a plugin's content tree declares. Callers use this
    /// to accumulate ownership after a plugin is accepted, so the same scan that
    /// rejected it is the one that records what it owns.
    /// </summary>
    public (List<string> ExamIds, List<string> TrackIds) DeclaredIds(VendorPlugin plugin)
    {
        var root = string.IsNullOrEmpty(plugin.ContentSearchRoot)
            ? _files.CombinePath(plugin.PluginDirectory, plugin.ContentRoot)
            : plugin.ContentSearchRoot;
        return (
            ContentIdScan.ReadIds(_files, _files.CombinePath(root, "exams"), "exam.json", "examId"),
            ContentIdScan.ReadIds(_files, _files.CombinePath(root, "tracks"), "track.json", "trackId"));
    }

    private static PluginValidationResult Result(VendorPlugin plugin, List<string> errors) => new()
    {
        PluginId = plugin.PluginId,
        ManifestPath = string.IsNullOrEmpty(plugin.ManifestPath) ? plugin.PluginDirectory : plugin.ManifestPath,
        Errors = errors,
    };

    /// <summary>Lowercase hex SHA-256 — the convention the bundle manifest already uses.</summary>
    public static string Sha256Hex(byte[] bytes) => Convert.ToHexString(SHA256.HashData(bytes)).ToLowerInvariant();

    private static string Short(string hex) =>
        string.IsNullOrEmpty(hex) ? "(none)" : hex[..Math.Min(12, hex.Length)];

    private static char PathSeparator => Path.DirectorySeparatorChar;
}
