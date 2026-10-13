using RadicalTrainingPlatform.Core.Models;

namespace RadicalTrainingPlatform.Core.Abstractions;

/// <summary>
/// Discovers and validates vendor content plugins (S27-08/S27-09). The
/// repository's own content tree is registered as the built-in plugin, so
/// built-ins and third-party packs travel the same path and the same checks.
/// </summary>
public interface IPluginLoader
{
    /// <summary>Plugins that validated. Invalid plugins are absent, not partial.</summary>
    IReadOnlyList<VendorPlugin> Plugins { get; }

    /// <summary>
    /// One entry per plugin that was rejected, naming why. Empty when every
    /// plugin present validated. Never silently dropped — a malformed pack is
    /// a reported error, not an invisible absence.
    /// </summary>
    IReadOnlyList<PluginValidationResult> Rejected { get; }

    /// <summary>
    /// Add a directory to search for plugin subdirectories. Call before
    /// <see cref="Discover"/>; the default root is
    /// <c>&lt;appdata&gt;/RadicalTrainingPlatform/plugins</c>.
    /// </summary>
    void RegisterPluginRoot(string path);

    /// <summary>
    /// Scan every registered root, validate what is found, and populate
    /// <see cref="Plugins"/> / <see cref="Rejected"/>. Idempotent.
    /// </summary>
    void Discover();

    /// <summary>
    /// Content roots of validated non-built-in plugins — the trees the manifest
    /// loader must read <em>in addition to</em> the built-in search paths. The
    /// built-in tree is excluded because the loader already reaches it through
    /// <c>IExamRepository.SearchPaths</c>; listing it twice would make every
    /// built-in exam look like a duplicate of itself.
    /// </summary>
    IEnumerable<string> PluginContentSearchRoots { get; }
}
