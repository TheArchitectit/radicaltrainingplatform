using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;
using RadicalTrainingPlatform.Core.Abstractions;
using RadicalTrainingPlatform.Core.Models;
using System.Linq;

namespace RadicalTrainingPlatform.Core;

public partial class QuestionParser : IQuestionParser
{
    private static readonly Regex QuestionHeaderRx = QuestionHeaderRegex();
    private static readonly Regex DomainHeaderRx = DomainHeaderRegex();
    private static readonly Regex OptionRx = OptionRegex();
    private static readonly Regex AnswerRx = AnswerRegex();
    private static readonly Regex AnswerLettersRx = AnswerLettersRegex();

    private readonly IExamRepository _examRepository;
    private readonly ILogger<QuestionParser>? _logger;
    private readonly IErrataProvider? _errata;

    public QuestionParser(IExamRepository examRepository, ILogger<QuestionParser>? logger = null)
    {
        _examRepository = examRepository;
        _logger = logger;
    }

    public QuestionParser(IExamRepository examRepository, IErrataProvider errata, ILogger<QuestionParser>? logger = null)
    {
        _examRepository = examRepository;
        _errata = errata;
        _logger = logger;
    }

    // Multiline: BuildCatalog counts matches over whole-file content; the
    // per-line call sites are unaffected by ^ matching line starts.
    [GeneratedRegex(@"^###\s+Q(\d+)[.\s]*(.*)", RegexOptions.Compiled | RegexOptions.Multiline)]
    private static partial Regex QuestionHeaderRegex();

    [GeneratedRegex(@"^##\s+(?:DOMAIN|Domain)\s*(\d+)", RegexOptions.Compiled | RegexOptions.IgnoreCase | RegexOptions.Multiline)]
    private static partial Regex DomainHeaderRegex();

    [GeneratedRegex(@"^-\s+([A-F])\)\s+(.*)", RegexOptions.Compiled)]
    private static partial Regex OptionRegex();

    // Separator grammar per R-07: comma, "and", "&", or bare whitespace between
    // letters. Legacy banks (NCP-AI-Part4 Q61-70) use "B and D"; new content is
    // lint-enforced to the comma form, but the parser must never silently drop
    // a valid key again.
    [GeneratedRegex(@"^\*\*(?:Correct )?Answer:\s*([A-F](?:\s*(?:,|and|&)?\s*[A-F])*)\s*\*\*", RegexOptions.Compiled)]
    private static partial Regex AnswerRegex();

    [GeneratedRegex(@"[A-F]", RegexOptions.Compiled)]
    private static partial Regex AnswerLettersRegex();

    /// <summary>
    /// Derive an exam code from a filename by iteratively stripping known suffixes.
    /// Handles: -PartN, -DN, -GapFill, and combinations like -Part2-D3, -Part3-GapFill.
    /// Examples: "NCP-US-Part2-D3.md" → "NCP-US", "NCA-75-Part3-GapFill.md" → "NCA-75",
    ///           "AWS-SAA-Part1.md" → "AWS-SAA", "CKA.md" → "CKA"
    /// </summary>
    public static string DeriveExamCode(string fileName)
    {
        var name = Path.GetFileNameWithoutExtension(fileName);

        // Iteratively strip suffixes: -PartN, -DN, -GapFill (and anything after them)
        var suffixPattern = @"^(.+?)-(?:Part\d+(?:-.*)?|D\d+(?:-.*)?|GapFill(?:-.*)?)$";
        string current = name;
        while (true)
        {
            var match = Regex.Match(current, suffixPattern, RegexOptions.IgnoreCase);
            if (!match.Success) break;
            current = match.Groups[1].Value;
        }

        // After suffix stripping, current IS the exam code.
        // Special case: if nothing was stripped and the name has a numeric
        // second segment with only 2 parts (e.g. "AZ-104" → "AZ-104"),
        // keep both segments since numeric is part of the exam code.
        // Only truncate to first segment for known prefix-only codes.
        var parts = current.Split('-');
        if (parts.Length >= 3 && int.TryParse(parts[1], out _))
        {
            // e.g., "NCA-75-Something" → after stripping suffixes this shouldn't happen,
            // but as safety: take first two segments when middle is numeric
            return $"{parts[0]}-{parts[1]}";
        }
        if (parts.Length >= 2)
            return $"{parts[0]}-{parts[1]}";
        return current;
    }

    /// <summary>
    /// Build a lightweight catalog of all discovered exams without
    /// parsing every question. Counts questions via regex for speed.
    /// </summary>
    public List<ExamCatalogItem> BuildCatalog()
    {
        var catalog = new Dictionary<string, ExamCatalogItem>(StringComparer.OrdinalIgnoreCase);
        var domainCounter = new Dictionary<string, HashSet<string>>(StringComparer.OrdinalIgnoreCase);

        foreach (var file in _examRepository.FindExamFiles())
        {
            var content = _examRepository.ReadExamFile(file);
            var fileName = Path.GetFileName(file);
            var code = DeriveExamCode(fileName);

            // Count questions and domains via regex (fast, no full parse)
            var qCount = QuestionHeaderRx.Matches(content).Count;
            var domainMatches = DomainHeaderRx.Matches(content);
            var domains = new HashSet<string>();
            foreach (Match dm in domainMatches)
                domains.Add(dm.Groups[1].Value);

            if (!catalog.TryGetValue(code, out var item))
            {
                item = new ExamCatalogItem
                {
                    ExamCode = code,
                    DisplayName = DeriveDisplayName(code),
                    Vendor = DeriveVendor(code),
                    Level = DeriveLevel(code),
                    Color = DeriveColor(code),
                };
                catalog[code] = item;
                domainCounter[code] = new HashSet<string>();
            }

            item.QuestionCount += qCount;
            domainCounter[code].UnionWith(domains);
            item.SourceFiles.Add(fileName);
        }

        foreach (var (code, item) in catalog)
        {
            item.DomainCount = domainCounter.GetValueOrDefault(code)?.Count ?? 0;
            item.Description = $"{item.Vendor} — {item.Level}";
        }

        return catalog.Values
            .OrderByDescending(c => c.QuestionCount)
            .ToList();
    }

    public List<Question> ParseFile(string filePath)
    {
        var content = _examRepository.ReadExamFile(filePath);
        // A UTF-8 BOM survives string-level transport (it is stripped by
        // File.ReadAllText, but not by content arriving via other seams) and
        // would defeat the ^### header anchor on line 1.
        content = content.Replace("\uFEFF", "");
        // Normalise line endings before splitting: Split('\r','\n') turns every
        // CRLF into a phantom empty line, which aborted option parsing (and thus
        // dropped whole questions) on CRLF exam files.
        var lines = content.Replace("\r\n", "\n").Replace('\r', '\n').Split('\n');
        var examCode = DeriveExamCode(Path.GetFileName(filePath));
        var questions = new List<Question>();
        var currentDomain = "";

        int i = 0;
        while (i < lines.Length)
        {
            var line = lines[i].TrimEnd();

            // Domain header
            var dm = DomainHeaderRx.Match(line);
            if (dm.Success)
            {
                currentDomain = $"Domain {dm.Groups[1].Value}";
                int colon = line.IndexOf(':');
                if (colon >= 0)
                {
                    int paren = line.IndexOf('(', colon);
                    var desc = paren > colon
                        ? line[(colon + 1)..paren].Trim()
                        : line[(colon + 1)..].Trim();
                    if (!string.IsNullOrEmpty(desc))
                        currentDomain += $": {desc}";
                }
                else
                {
                    int dash = line.IndexOf('—');
                    if (dash < 0) dash = line.IndexOf('-', line.IndexOf(dm.Groups[1].Value));
                    if (dash > 0)
                    {
                        int paren = line.IndexOf('(', dash);
                        var desc = paren > dash
                            ? line[(dash + 1)..paren].Trim()
                            : line[(dash + 1)..].Trim();
                        if (!string.IsNullOrEmpty(desc))
                            currentDomain += $": {desc}";
                    }
                }
                i++;
                continue;
            }

            // Question header
            var qm = QuestionHeaderRx.Match(line);
            if (qm.Success)
            {
                var q = new Question
                {
                    Id = int.Parse(qm.Groups[1].Value),
                    ExamCode = examCode,
                    Domain = string.IsNullOrEmpty(currentDomain) ? examCode : currentDomain,
                    SourceFile = Path.GetFileName(filePath)
                };

                var inlineStem = qm.Groups[2].Value.Trim();
                var stemLines = new List<string>();
                if (!string.IsNullOrEmpty(inlineStem))
                    stemLines.Add(inlineStem);

                i++;
                while (i < lines.Length)
                {
                    line = lines[i].TrimEnd();
                    if (OptionRx.IsMatch(line)) break;
                    if (QuestionHeaderRx.IsMatch(line)) break;
                    if (AnswerRx.IsMatch(line)) break;
                    stemLines.Add(line);
                    i++;
                }
                q.Stem = string.Join("\n", stemLines).Trim();

                while (i < lines.Length)
                {
                    line = lines[i].TrimEnd();
                    var om = OptionRx.Match(line);
                    if (om.Success)
                    {
                        var optText = om.Groups[2].Value.Trim();
                        i++;
                        while (i < lines.Length)
                        {
                            var next = lines[i].TrimEnd();
                            if (string.IsNullOrWhiteSpace(next)) break;
                            if (OptionRx.IsMatch(next)) break;
                            if (AnswerRx.IsMatch(next)) break;
                            if (QuestionHeaderRx.IsMatch(next)) break;
                            if (next.StartsWith("---")) break;
                            optText += " " + next.Trim();
                            i++;
                        }
                        q.Options.Add(new AnswerOption
                        {
                            Letter = om.Groups[1].Value,
                            Text = optText
                        });
                        continue;
                    }
                    break;
                }

                while (i < lines.Length && string.IsNullOrWhiteSpace(lines[i]))
                    i++;

                if (i < lines.Length)
                {
                    line = lines[i].TrimEnd();
                    var am = AnswerRx.Match(line);
                    if (am.Success)
                    {
                        // Keep A-F letters only: separators are ",", "and", "&",
                        // whitespace — the letters in "and" must not become keys.
                        q.CorrectAnswers = AnswerLettersRx.Matches(am.Groups[1].Value)
                            .Select(m => m.Value)
                            .Distinct(StringComparer.OrdinalIgnoreCase)
                            .Select(l => l.ToUpperInvariant())
                            .ToList();
                        i++;
                    }
                }

                var explLines = new List<string>();
                while (i < lines.Length)
                {
                    line = lines[i].TrimEnd();
                    if (line.StartsWith("---")) { i++; break; }
                    if (QuestionHeaderRx.IsMatch(line)) break;
                    if (DomainHeaderRx.IsMatch(line)) break;
                    explLines.Add(line);
                    i++;
                }
                q.Explanation = string.Join("\n", explLines).Trim();

                if (q.Options.Count > 0 && q.CorrectAnswers.Count > 0)
                {
                    // Errata overrides the parsed key without touching the .md.
                    if (_errata != null
                        && _errata.TryGetCorrection(q.SourceFile, q.Id, out var corrected))
                    {
                        _logger?.LogInformation(
                            "Errata applied to {File} Q{Id}: {Old} -> {New}",
                            q.SourceFile, q.Id,
                            string.Join(",", q.CorrectAnswers), string.Join(",", corrected));
                        q.CorrectAnswers = corrected.ToList();
                    }
                    questions.Add(q);
                }
                else
                    _logger?.LogWarning("Skipped Q{QuestionId} in {File}: Options={OptCount}, Answers={AnsCount}",
                        q.Id, Path.GetFileName(filePath), q.Options.Count, q.CorrectAnswers.Count);

                continue;
            }

            i++;
        }

        _logger?.LogInformation("Parsed {File}: {Count} questions extracted", Path.GetFileName(filePath), questions.Count);

        return questions;
    }

    /// <summary>
    /// Load all exams. No longer restricted by hardcoded prefixes —
    /// any .md file with ### QN headers is an exam.
    /// </summary>
    public Dictionary<string, List<Question>> LoadAllExams()
    {
        var exams = new Dictionary<string, List<Question>>(StringComparer.OrdinalIgnoreCase);

        foreach (var file in _examRepository.FindExamFiles())
        {
            var questions = ParseFile(file);
            if (questions.Count == 0) continue;

            var code = DeriveExamCode(Path.GetFileName(file));
            if (!exams.ContainsKey(code))
                exams[code] = new List<Question>();
            exams[code].AddRange(questions);
        }

        return exams;
    }

    // ─── Vendor-neutral metadata derivations ────────────────────────

    private static readonly Dictionary<string, string> VendorMap = new(StringComparer.OrdinalIgnoreCase)
    {
        ["NCA"] = "Nutanix", ["NCM"] = "Nutanix", ["NCP"] = "Nutanix",
        ["AWS"] = "Amazon Web Services",
        ["AZ"]  = "Microsoft Azure",
        ["GCP"] = "Google Cloud",
        ["CKA"] = "Cloud Native Computing Foundation",
        ["CKS"] = "Cloud Native Computing Foundation",
        ["CKAD"]= "Cloud Native Computing Foundation",
        ["CCNA"]= "Cisco",
        ["CCNP"]= "Cisco",
        ["Sec"] = "CompTIA",
        ["A"]   = "CompTIA",
        ["N"]   = "CompTIA",
    };

    private static string DeriveVendor(string code)
    {
        var prefix = code.Split('-', '_')[0].ToUpperInvariant();
        return VendorMap.GetValueOrDefault(prefix) ?? "Independent";
    }

    private static string DeriveLevel(string code) => code switch
    {
        var c when c.StartsWith("NCA", StringComparison.OrdinalIgnoreCase) => "Associate",
        var c when c.StartsWith("NCM", StringComparison.OrdinalIgnoreCase) => "Expert",
        var c when c.StartsWith("NCP", StringComparison.OrdinalIgnoreCase) => "Professional",
        var c when c.StartsWith("CKA", StringComparison.OrdinalIgnoreCase) => "Associate",
        var c when c.StartsWith("CKS", StringComparison.OrdinalIgnoreCase) => "Professional",
        var c when c.StartsWith("CKAD", StringComparison.OrdinalIgnoreCase) => "Associate",
        var c when c.Contains("-SAA", StringComparison.OrdinalIgnoreCase) => "Associate",
        var c when c.Contains("-SAP", StringComparison.OrdinalIgnoreCase) => "Professional",
        var c when c.Contains("-DA", StringComparison.OrdinalIgnoreCase) => "Associate",
        var c when c.Contains("-DP", StringComparison.OrdinalIgnoreCase) => "Professional",
        var c when c.Contains("-104", StringComparison.OrdinalIgnoreCase) => "Associate",
        var c when c.Contains("-305", StringComparison.OrdinalIgnoreCase) => "Professional",
        _ => "Professional"
    };

    private static string DeriveDisplayName(string code)
    {
        // Known exam codes get full names; unknown ones get a formatted version of the code
        return code.ToUpperInvariant() switch
        {
            "NCA"    => "NCA — Nutanix Certified Associate",
            "NCM-MCI"=> "NCM — Multicloud Infrastructure",
            "NCP-CI" => "NCP — Cloud Infrastructure",
            "NCP-AI" => "NCP — AI/ML Infrastructure",
            "NCP-US" => "NCP — Unified Storage",
            "AWS-SAA"=> "AWS — Solutions Architect Associate",
            "AWS-SAP"=> "AWS — Solutions Architect Professional",
            "AWS-DA" => "AWS — Data Analytics",
            "AZ-104" => "Azure — Administrator",
            "AZ-305" => "Azure — Solutions Architect",
            "CKA"    => "CKA — Kubernetes Administrator",
            "CKS"    => "CKS — Kubernetes Security",
            "CKAD"   => "CKAD — Kubernetes Developer",
            "CCNA"   => "CCNA — Cisco Certified",
            _        => code
        };
    }

    /// <summary>
    /// Assign a neon accent color per vendor/exam based on a rotating palette.
    /// </summary>
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
