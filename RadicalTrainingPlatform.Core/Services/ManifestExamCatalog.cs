using Microsoft.Extensions.Logging;
using RadicalTrainingPlatform.Core.Abstractions;
using RadicalTrainingPlatform.Core.Models;

namespace RadicalTrainingPlatform.Core.Services;

/// <summary>
/// Catalog entry describing one question pack file discovered under a
/// manifest-covered exam (content/exams/&lt;examId&gt;/questions/*.md).
/// </summary>
public class ManifestPackFile
{
    public string ExamId { get; set; } = "";
    public string FilePath { get; set; } = "";
    public string FileName { get; set; } = "";
}

/// <summary>
/// Manifest-first exam catalog (REQ-MAN-02): identity for new packs comes
/// from exam.json; DeriveExamCode runs only for manifest-less legacy root
/// files, and that fallback is logged as a warning.
/// </summary>
public class ManifestExamCatalog
{
    private readonly IExamRepository _exams;
    private readonly IFileProvider _files;
    private readonly IManifestLoader _loader;
    private readonly QuestionParser _parser;
    private readonly ILogger<ManifestExamCatalog>? _logger;

    public ManifestExamCatalog(
        IExamRepository exams, IFileProvider files, IManifestLoader loader,
        QuestionParser parser, ILogger<ManifestExamCatalog>? logger = null)
    {
        _exams = exams;
        _files = files;
        _loader = loader;
        _parser = parser;
        _logger = logger;
    }

    /// <summary>Manifests found on the last Build() (empty when none exist).</summary>
    public IReadOnlyDictionary<string, ExamManifest> Manifests => _manifests;
    private Dictionary<string, ExamManifest> _manifests = new(StringComparer.OrdinalIgnoreCase);

    /// <summary>
    /// Build the merged catalog: manifest-covered packs first, then legacy
    /// root banks that are not already claimed by a manifest.
    /// </summary>
    public List<ExamCatalogItem> Build()
    {
        _manifests = _loader.LoadExamManifests();
        var catalog = new Dictionary<string, ExamCatalogItem>(StringComparer.OrdinalIgnoreCase);
        var claimedLegacyFiles = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var (examId, manifest) in _manifests)
        {
            var item = new ExamCatalogItem
            {
                ExamCode = examId,
                DisplayName = manifest.DisplayName,
                Vendor = manifest.Vendor,
                Level = DeriveLevel(examId, manifest),
                Color = DeriveColor(examId),
                Description = $"{manifest.Vendor} — {manifest.OfficialVersion}",
            };

            var examDir = Path.GetDirectoryName(manifest.ManifestPath);
            if (examDir != null && _files.Exists(_files.CombinePath(examDir, "questions")))
            {
                foreach (var f in _files.GetFiles(_files.CombinePath(examDir, "questions"), "*.md"))
                {
                    claimedLegacyFiles.Add(Path.GetFileName(f));
                    var parsed = _parser.ParseFile(f);
                    // REQ-MAN-05: a question ID repeating within an exam fails the build.
                    var dup = parsed.GroupBy(q => q.Id).FirstOrDefault(g => g.Count() > 1);
                    if (dup != null)
                        throw new InvalidOperationException(
                            $"Duplicate question ID {dup.Key} in {Path.GetFileName(f)} (exam {examId})");
                    item.QuestionCount += parsed.Count;
                    item.SourceFiles.Add(Path.GetFileName(f));
                }
            }
            catalog[examId] = item;
        }

        // Legacy root files: DeriveExamCode fallback (REQ-MAN-02), logged.
        foreach (var f in _exams.FindExamFiles())
        {
            var fileName = Path.GetFileName(f);
            if (claimedLegacyFiles.Contains(fileName)) continue;

            var code = QuestionParser.DeriveExamCode(fileName);
            if (_manifests.ContainsKey(code))
            {
                _logger?.LogWarning(
                    "Legacy file {File} derives to manifest-covered exam {Code}; merged into the manifest entry",
                    fileName, code);
            }
            else
            {
                _logger?.LogWarning(
                    "Exam identity for {File} derived from filename as {Code} (no manifest) — " +
                    "new packs must ship exam.json (REQ-MAN-02)", fileName, code);
            }

            if (!catalog.TryGetValue(code, out var item))
            {
                item = new ExamCatalogItem
                {
                    ExamCode = code,
                    DisplayName = QuestionParser.DeriveDisplayName(code),
                    Vendor = QuestionParser.DeriveVendor(code),
                    Level = QuestionParser.DeriveLevel(code),
                    Color = DeriveColor(code),
                };
                catalog[code] = item;
            }
            var questions = _parser.ParseFile(f);
            item.QuestionCount += questions.Count;
            item.SourceFiles.Add(fileName);
        }

        return catalog.Values.OrderByDescending(c => c.QuestionCount).ToList();
    }

    /// <summary>
    /// REQ-MAN-07: coverage = objectives with at least one lesson ID declared
    /// in the manifest (released-lesson gating lands with the study UI in
    /// Sprint 46 — today the manifest-declared set is the honest denominator).
    /// </summary>
    public (int Covered, int Total) ComputeObjectiveCoverage(string examId)
    {
        if (!_manifests.TryGetValue(examId, out var manifest))
            return (0, 0);
        var total = manifest.Sections.SelectMany(s => s.Objectives).Count();
        var covered = manifest.Sections
            .SelectMany(s => s.Objectives)
            .Count(o => o.LessonIds.Count > 0);
        return (covered, total);
    }

    // Vendor-neutral derivations shared with the legacy path (kept instance
    // methods here so the catalog owns one palette).

    internal static string DeriveLevel(string examId, ExamManifest manifest) =>
        QuestionParser.DeriveLevel(examId);

    private static readonly string[] NeonPalette =
    {
        "#00F0FF", "#FF2D95", "#BD00FF", "#39FF14", "#FFFF00",
        "#FF6600", "#00FF88", "#FF3366", "#66FFFF", "#CC00FF"
    };

    private static string DeriveColor(string code)
    {
        var hash = code.GetHashCode();
        var idx = Math.Abs(hash) % NeonPalette.Length;
        return NeonPalette[idx];
    }
}
