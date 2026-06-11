namespace CertForge.Core;

/// <summary>
/// Provides access to exam markdown files regardless of platform.
/// </summary>
public interface IExamRepository
{
    /// <summary>
    /// Find all exam markdown files in the search directories.
    /// </summary>
    IEnumerable<string> FindExamFiles();

    /// <summary>
    /// Read the raw markdown content of an exam file.
    /// </summary>
    string ReadExamFile(string path);

    /// <summary>
    /// Get paths where exam files are searched.
    /// </summary>
    IEnumerable<string> SearchPaths { get; }
}

/// <summary>
/// Searches for exam markdown files (.md) in well-known locations.
/// </summary>
public class MarkdownExamRepository : IExamRepository
{
    private readonly IFileProvider _files;
    private readonly string _appName;
    private readonly string[] _examPatterns;
    private List<string>? _searchPaths;

    public MarkdownExamRepository(IFileProvider files, string appName = "CertForge")
    {
        _files = files;
        _appName = appName;
        _examPatterns = new[] { "*.md" };
    }

    public IEnumerable<string> SearchPaths
    {
        get
        {
            if (_searchPaths == null)
            {
                _searchPaths = new List<string>();

                // 1. Current working directory
                _searchPaths.Add(_files.GetCurrentDirectory());

                // 2. Assembly directory
                _searchPaths.Add(_files.GetExecutingAssemblyDirectory());

                // 3. Application data directory (for user-installed content)
                try { _searchPaths.Add(_files.GetApplicationDataDirectory(_appName)); } catch { }

                // 4. Walk up from assembly looking for repo root
                var asmDir = _files.GetExecutingAssemblyDirectory();
                var current = asmDir;
                for (int i = 0; i < 6; i++)
                {
                    var parent = Directory.GetParent(current)?.FullName;
                    if (string.IsNullOrEmpty(parent)) break;
                    _searchPaths.Add(parent);
                    current = parent;
                }

                // Deduplicate
                _searchPaths = _searchPaths.Distinct().Where(p => _files.Exists(p)).ToList();
            }
            return _searchPaths;
        }
    }

    public IEnumerable<string> FindExamFiles()
    {
        var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var path in SearchPaths)
        {
            string[] candidates = Array.Empty<string>();
            try
            {
                candidates = _files.GetFiles(path, "*.md");
            }
            catch { /* ignore inaccessible dirs */ continue; }

            foreach (var f in candidates)
            {
                var name = Path.GetFileName(f);
                if (LooksLikeExamFile(name) && seen.Add(f))
                    yield return f;
            }
        }
    }

    public string ReadExamFile(string path) => _files.ReadAllText(path);

    /// <summary>
    /// Heuristic to identify exam question files vs other markdown.
    /// </summary>
    private static bool LooksLikeExamFile(string fileName)
    {
        if (string.IsNullOrEmpty(fileName)) return false;
        var name = fileName.ToUpperInvariant();
        if (!name.StartsWith("NCP-") && !name.StartsWith("NCM-") && !name.StartsWith("NCA-")) return false;
        if (name.Contains("README")) return false;
        if (name.Contains("CHEATSHEET")) return false;
        if (name.Contains("LAB")) return false;
        return true;
    }
}
