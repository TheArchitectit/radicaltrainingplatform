namespace RadicalTrainingPlatform.Core.Models;

/// <summary>
/// Vendor-neutral exam identity and provenance, as reported by any metadata
/// source (S27-01). This is the shape a plugin author writes against, so it
/// carries no manifest-file concepts — only what identifies a pack and where
/// its claims came from.
/// </summary>
public class ExamMetadata
{
    public string ExamId { get; set; } = "";
    public string Vendor { get; set; } = "";
    public string DisplayName { get; set; } = "";
    public string OfficialVersion { get; set; } = "";
    public string ObjectivesDocVersion { get; set; } = "";
    public string SourceUrl { get; set; } = "";
    /// <summary>
    /// The date a human opened the official source and checked this pack against
    /// it. A pack whose source has never been read carries an authoring date here
    /// and says so in its rights record — see docs/vendor-packs/.
    /// </summary>
    public string SourceReviewDate { get; set; } = "";
    public Dictionary<string, string> ProductVersions { get; set; } = new();
    /// <summary>Objective count across all sections — cheap coverage signal.</summary>
    public int ObjectiveCount { get; set; }
    /// <summary>
    /// Which plugin supplied this exam. Built-ins report "builtin"; a discovered
    /// plugin reports its pluginId. Used for diagnostics and duplicate detection.
    /// </summary>
    public string PluginId { get; set; } = "";
    /// <summary>Manifest path this metadata was read from, for error messages.</summary>
    public string ManifestPath { get; set; } = "";
}
