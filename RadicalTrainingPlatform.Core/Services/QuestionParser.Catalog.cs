using RadicalTrainingPlatform.Core.Abstractions;
using RadicalTrainingPlatform.Core.Models;
using System.Linq;

namespace RadicalTrainingPlatform.Core;

public partial class QuestionParser
{
    /// <summary>
    /// Build a lightweight catalog of all discovered exams without
    /// parsing every question. Counts questions via regex for speed.
    /// When a manifest loader is present, pack banks under
    /// content/exams/&lt;id&gt;/questions/ are also enumerated and gated by
    /// the manifest's releasedBanks list (REQ-MAN-08).
    /// </summary>
    public List<ExamCatalogItem> BuildCatalog()
    {
        var catalog = new Dictionary<string, ExamCatalogItem>(StringComparer.OrdinalIgnoreCase);
        var domainCounter = new Dictionary<string, HashSet<string>>(StringComparer.OrdinalIgnoreCase);
        var manifests = _manifestLoader?.LoadExamManifests();
        var claimedPackFiles = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var (filePath, fileName, examCode, isUnreleased) in EnumerateAllBanks(manifests, claimedPackFiles))
        {
            var content = ReadBankFile(filePath);
            if (content == null) continue;

            // Count questions and domains via regex (fast, no full parse)
            var qCount = QuestionHeaderRx.Matches(content).Count;
            var domainMatches = DomainHeaderRx.Matches(content);

            if (!catalog.TryGetValue(examCode, out var item))
            {
                item = new ExamCatalogItem
                {
                    ExamCode = examCode,
                    DisplayName = DeriveDisplayName(examCode),
                    Vendor = DeriveVendor(examCode),
                    Level = DeriveLevel(examCode),
                    Color = DeriveColor(examCode),
                };
                catalog[examCode] = item;
                domainCounter[examCode] = new HashSet<string>();
            }

            if (isUnreleased)
                item.UnreleasedQuestionCount += qCount;
            else
                item.QuestionCount += qCount;
            foreach (System.Text.RegularExpressions.Match dm in domainMatches)
                domainCounter[examCode].Add(dm.Groups[1].Value);
            item.SourceFiles.Add(fileName);
        }

        // Enrich with manifest metadata where available
        if (manifests != null)
        {
            foreach (var (code, item) in catalog)
            {
                if (manifests.TryGetValue(code, out var m))
                {
                    item.DisplayName = m.DisplayName;
                    item.Vendor = m.Vendor;
                    item.Description = $"{m.Vendor} — {m.OfficialVersion}";
                    item.PackVersion = m.OfficialVersion;
                    item.SourceReviewDate = m.SourceReviewDate;
                }
            }
        }

        foreach (var (code, item) in catalog)
        {
            item.DomainCount = domainCounter.GetValueOrDefault(code)?.Count ?? 0;
            if (string.IsNullOrEmpty(item.Description))
                item.Description = $"{item.Vendor} — {item.Level}";
        }

        return catalog.Values
            .OrderByDescending(c => c.QuestionCount)
            .ToList();
    }

    /// <summary>
    /// Load all exams. No longer restricted by hardcoded prefixes —
    /// any .md file with ### QN headers is an exam. When a manifest loader
    /// is present, unreleased banks are excluded from session pools.
    /// </summary>
    public Dictionary<string, List<Question>> LoadAllExams()
    {
        var exams = new Dictionary<string, List<Question>>(StringComparer.OrdinalIgnoreCase);
        var manifests = _manifestLoader?.LoadExamManifests();
        var claimedPackFiles = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var (filePath, fileName, examCode, isUnreleased) in EnumerateAllBanks(manifests, claimedPackFiles))
        {
            if (isUnreleased) continue;

            var questions = ParseFile(filePath);
            if (questions.Count == 0) continue;

            if (!exams.ContainsKey(examCode))
                exams[examCode] = new List<Question>();
            exams[examCode].AddRange(questions);
        }

        return exams;
    }

    /// <summary>
    /// REQ-MAN-08: enumerate all bank files — manifest-covered pack banks first
    /// (with release status), then legacy root banks not claimed by a manifest.
    /// Yields (filePath, fileName, examCode, isUnreleased).
    /// </summary>
    private IEnumerable<(string FilePath, string FileName, string ExamCode, bool IsUnreleased)>
        EnumerateAllBanks(
            Dictionary<string, ExamManifest>? manifests,
            HashSet<string> claimedPackFiles)
    {
        if (manifests != null && _files != null)
        {
            foreach (var (examId, manifest) in manifests)
            {
                var examDir = Path.GetDirectoryName(manifest.ManifestPath);
                if (examDir == null) continue;
                var questionsDir = _files.CombinePath(examDir, "questions");
                if (!_files.Exists(questionsDir)) continue;

                foreach (var f in _files.GetFiles(questionsDir, "*.md"))
                {
                    var name = Path.GetFileName(f);
                    claimedPackFiles.Add(name);
                    var unreleased = !Services.BankReleasePolicy.IsReleased(manifest, f);
                    yield return (f, name, examId, unreleased);
                }
            }
        }

        // Legacy root files (e.g. NCA-75-Part1.md). Skip any file already
        // claimed by a manifest-covered pack directory above.
        foreach (var f in _examRepository.FindExamFiles())
        {
            var name = Path.GetFileName(f);
            if (claimedPackFiles.Contains(name)) continue;
            var code = DeriveExamCode(name);
            yield return (f, name, code, false);
        }
    }

    private string? ReadBankFile(string path)
    {
        if (_files != null) return _files.ReadAllText(path);
        try { return _examRepository.ReadExamFile(path); }
        catch { return null; }
    }
}
