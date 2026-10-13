namespace RadicalTrainingPlatform.Core.Models;

/// <summary>
/// One entry of a plugin's <c>files[]</c> integrity list (S27-09).
/// </summary>
public class PluginFileEntry
{
    /// <summary>Path relative to the plugin's content root, using forward slashes.</summary>
    public string Path { get; set; } = "";
    /// <summary>Lowercase hex SHA-256, compared case-insensitively.</summary>
    public string Sha256 { get; set; } = "";
}

/// <summary>
/// A vendor content pack declared by <c>plugin.json</c> (S27-08).
/// The built-in content tree is described by the same model, which is what
/// makes "existing users unaffected" a checked fact rather than a claim.
/// </summary>
public class VendorPlugin
{
    /// <summary>Schema version of plugin.json itself. Supported: 1.</summary>
    public int SchemaVersion { get; set; } = 1;
    public string PluginId { get; set; } = "";
    public string Vendor { get; set; } = "";
    public string DisplayName { get; set; } = "";
    /// <summary>Directory containing this plugin's content/ tree, relative to the plugin directory.</summary>
    public string ContentRoot { get; set; } = "content";
    public List<PluginFileEntry> Files { get; set; } = new();

    /// <summary>Set by discovery: the directory holding plugin.json.</summary>
    public string PluginDirectory { get; set; } = "";
    /// <summary>Set by discovery: the path plugin.json was read from.</summary>
    public string ManifestPath { get; set; } = "";
    /// <summary>True for the repository's own content tree.</summary>
    public bool IsBuiltIn { get; set; }
    /// <summary>
    /// Set by discovery: the directory the manifest loader reads exams/ and
    /// tracks/ from — i.e. PluginDirectory combined with ContentRoot. The
    /// loader appends those two names directly, unlike the built-in search
    /// roots where it appends content/ first.
    /// </summary>
    public string ContentSearchRoot { get; set; } = "";
}

/// <summary>
/// Outcome of validating one plugin. A plugin that fails is skipped whole —
/// never half-loaded (S27-09).
/// </summary>
public class PluginValidationResult
{
    public string PluginId { get; set; } = "";
    public string ManifestPath { get; set; } = "";
    public List<string> Errors { get; set; } = new();
    public bool IsValid => Errors.Count == 0;
}
