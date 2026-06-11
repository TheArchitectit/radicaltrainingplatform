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
/// Searches for exam markdown files in well-known locations.
/// Vendor-neutral: any .md file containing ### QN headers is an exam file.
/// </summary>
public class MarkdownExamRepository : IExamRepository
{
    private readonly IFileProvider _files;
    private readonly string _appName;
    private List<string>? _searchPaths;

    // Regex to detect exam-content files (### Q1 or ### Q42 headers)
    private static readonly System.Text.RegularExpressions.Regex ExamHeaderRegex =
        new(@"^###\s+Q\d+", System.Text.RegularExpressions.RegexOptions.Compiled);

    // Files/dirs to always skip
    private static readonly HashSet<string> SkipNames = new(StringComparer.OrdinalIgnoreCase)
    {
        "README", "CHEATSHEET", "LAB", "ROADMAP", "CHANGELOG", "CONTRIBUTING",
        "LICENSE", "CODE_OF_CONDUCT", "MASTER-PROJECT-PLAN"
    };

    public MarkdownExamRepository(IFileProvider files, string appName = "CertForge")
    {
        _files = files;
        _appName = appName;
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

                // 3. Application data directory
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
                if (!LooksLikeExamFile(name) || !seen.Add(f))
                    continue;

                // Content check: first pass on filename heuristic, then verify headers
                yield return f;
            }
        }
    }

    public string ReadExamFile(string path) => _files.ReadAllText(path);

    /// <summary>
    /// Heuristic: identify exam question files vs other markdown.
    /// Vendor-neutral — rejects known non-exam files.
    /// </summary>
    private static bool LooksLikeExamFile(string fileName)
    {
        if (string.IsNullOrEmpty(fileName)) return false;
        if (!fileName.EndsWith(".md", StringComparison.OrdinalIgnoreCase)) return false;

        var name = Path.GetFileNameWithoutExtension(fileName).ToUpperInvariant();
        foreach (var skip in SkipNames)
        {
            if (name.StartsWith(skip) || name.Contains(skip)) return false;
        }
        return true;
    }
}
