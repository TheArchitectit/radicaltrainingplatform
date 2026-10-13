using System.Text.Json;
using Microsoft.Extensions.Logging;
using RadicalTrainingPlatform.Core.Abstractions;
using RadicalTrainingPlatform.Core.Models;

namespace RadicalTrainingPlatform.Core.Services;

/// <summary>
/// Finds vendor content plugins on disk and hands the valid ones to the rest
/// of the platform (S27-08).
///
/// The repository's own content tree is registered as the built-in plugin and
/// travels the same validation path as a third-party pack. That is what makes
/// "existing users are unaffected" a checked statement: the built-in plugin is
/// validated first, owns its exam and track IDs before any plugin is read, and
/// a plugin that tries to claim one of them is rejected by name.
///
/// All file access goes through <see cref="IFileProvider"/> — Core never calls
/// System.IO directly (CLAUDE.md).
/// </summary>
public class PluginDiscovery : IPluginLoader
{
    private const string AppName = "RadicalTrainingPlatform";
    private const string PluginManifestName = "plugin.json";

    private readonly IFileProvider _files;
    private readonly IExamRepository? _exams;
    private readonly PluginValidator _validator;
    private readonly ILogger<PluginDiscovery>? _logger;
    private readonly List<string> _roots = new();
    private VendorPlugin? _builtIn;

    public PluginDiscovery(
        IFileProvider files,
        PluginValidator validator,
        IExamRepository? exams = null,
        ILogger<PluginDiscovery>? logger = null)
    {
        _files = files;
        _validator = validator;
        _exams = exams;
        _logger = logger;
    }

    public IReadOnlyList<VendorPlugin> Plugins { get; private set; } = Array.Empty<VendorPlugin>();
    public IReadOnlyList<PluginValidationResult> Rejected { get; private set; } = Array.Empty<PluginValidationResult>();
    public IEnumerable<string> PluginContentSearchRoots =>
        Plugins.Where(p => !p.IsBuiltIn).Select(p => p.ContentSearchRoot);

    public void RegisterPluginRoot(string path)
    {
        if (!string.IsNullOrWhiteSpace(path) && !_roots.Contains(path))
            _roots.Add(path);
    }

    /// <summary>
    /// Register the built-in content tree explicitly. The default root is
    /// derived from the exam repository's search paths when one was injected.
    /// </summary>
    public void RegisterBuiltInContentRoot(string contentRoot)
    {
        _builtIn = new VendorPlugin
        {
            SchemaVersion = PluginValidator.SupportedSchemaVersions[0],
            PluginId = "builtin",
            Vendor = "built-in",
            DisplayName = "Built-in content",
            ContentRoot = "content",
            ContentSearchRoot = contentRoot,
            IsBuiltIn = true,
            ManifestPath = contentRoot,
        };
    }

    public void Discover()
    {
        var accepted = new List<VendorPlugin>();
        var rejected = new List<PluginValidationResult>();
        var claimedExams = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var claimedTracks = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        // Built-in first: it owns its IDs before any plugin is considered, so a
        // pack that collides with shipped content is the one that gets rejected.
        var builtIn = _builtIn ?? BuiltInFromSearchPaths();
        if (builtIn != null)
        {
            // Built-ins declare no files[] list: their integrity is carried by
            // the content bundle manifest (PKG-01), not by a per-plugin list.
            var result = _validator.Validate(builtIn, claimedExams, claimedTracks);
            if (result.IsValid)
            {
                accepted.Add(builtIn);
                CollectIds(builtIn, claimedExams, claimedTracks);
            }
            else
            {
                // A broken built-in tree is a packaging defect, not a user error.
                rejected.Add(result);
                _logger?.LogError("Built-in content failed plugin validation: {Errors}",
                    string.Join("; ", result.Errors));
            }
        }

        var roots = new List<string>(_roots);
        var defaultRoot = _files.CombinePath(_files.GetApplicationDataDirectory(AppName), "plugins");
        if (!roots.Contains(defaultRoot)) roots.Add(defaultRoot);

        foreach (var root in roots)
        {
            if (!_files.Exists(root)) continue;
            foreach (var dir in _files.GetDirectories(root).OrderBy(d => d, StringComparer.Ordinal))
            {
                var manifestPath = _files.CombinePath(dir, PluginManifestName);
                if (!_files.Exists(manifestPath))
                {
                    // A directory in the plugins root with no plugin.json is a
                    // malformed plugin, and says so rather than vanishing.
                    rejected.Add(new PluginValidationResult
                    {
                        PluginId = "",
                        ManifestPath = manifestPath,
                        Errors = { $"{dir}: no {PluginManifestName} — a plugin directory must declare one" },
                    });
                    continue;
                }

                var plugin = ReadPlugin(dir, manifestPath);
                if (plugin == null)
                {
                    rejected.Add(new PluginValidationResult
                    {
                        PluginId = "",
                        ManifestPath = manifestPath,
                        Errors = { $"{manifestPath}: could not be parsed as a plugin manifest" },
                    });
                    continue;
                }

                var result = _validator.Validate(plugin, claimedExams, claimedTracks);
                if (!result.IsValid)
                {
                    rejected.Add(result);
                    _logger?.LogWarning("Plugin {Plugin} rejected: {Errors}",
                        result.PluginId, string.Join("; ", result.Errors));
                    continue;
                }

                accepted.Add(plugin);
                CollectIds(plugin, claimedExams, claimedTracks);
            }
        }

        Plugins = accepted;
        Rejected = rejected;
    }

    private VendorPlugin? BuiltInFromSearchPaths()
    {
        if (_exams == null) return null;
        foreach (var root in _exams.SearchPaths)
        {
            var content = _files.CombinePath(root, "content");
            if (_files.Exists(_files.CombinePath(content, "exams")))
            {
                RegisterBuiltInContentRoot(content);
                return _builtIn;
            }
        }
        return null;
    }

    private VendorPlugin? ReadPlugin(string dir, string manifestPath)
    {
        try
        {
            var plugin = JsonSerializer.Deserialize<VendorPlugin>(_files.ReadAllText(manifestPath),
                new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                    ReadCommentHandling = JsonCommentHandling.Skip,
                    AllowTrailingCommas = true,
                });
            if (plugin == null) return null;
            plugin.PluginDirectory = dir;
            plugin.ManifestPath = manifestPath;
            plugin.IsBuiltIn = false;
            plugin.ContentSearchRoot = _files.CombinePath(dir,
                string.IsNullOrWhiteSpace(plugin.ContentRoot) ? "content" : plugin.ContentRoot);
            return plugin;
        }
        catch (JsonException ex)
        {
            _logger?.LogError(ex, "Malformed plugin manifest {Path}", manifestPath);
            return null;
        }
    }

    private void CollectIds(VendorPlugin plugin, HashSet<string> exams, HashSet<string> tracks)
    {
        var (examIds, trackIds) = _validator.DeclaredIds(plugin);
        foreach (var id in examIds) exams.Add(id);
        foreach (var id in trackIds) tracks.Add(id);
    }
}
