using System.Text.RegularExpressions;
using CertForge.Core.Models;
using System.Linq;

namespace CertForge.Core;

public partial class QuestionParser
{
    private static readonly Regex QuestionHeaderRx = QuestionHeaderRegex();
    private static readonly Regex DomainHeaderRx = DomainHeaderRegex();
    private static readonly Regex OptionRx = OptionRegex();
    private static readonly Regex AnswerRx = AnswerRegex();

    private readonly IExamRepository _examRepository;
    private readonly IFileProvider _fileProvider;

    private static readonly string[] ExamPatterns = new[]
    {
        "NCP-US-*.md",
        "NCP-CI-*.md",
        "NCP-AI-*.md",
        "NCM-MCI-*.md",
        "NCA-*.md"
    };

    public QuestionParser(IExamRepository examRepository, IFileProvider fileProvider)
    {
        _examRepository = examRepository;
        _fileProvider = fileProvider;
    }

    [GeneratedRegex(@"^###\s+Q(\d+)[.\s]*(.*)", RegexOptions.Compiled)]
    private static partial Regex QuestionHeaderRegex();

    [GeneratedRegex(@"^##\s+(?:DOMAIN|Domain)\s*(\d+)", RegexOptions.Compiled | RegexOptions.IgnoreCase)]
    private static partial Regex DomainHeaderRegex();

    [GeneratedRegex(@"^-\s+([A-F])\)\s+(.*)", RegexOptions.Compiled)]
    private static partial Regex OptionRegex();

    [GeneratedRegex(@"^\*\*Answer:\s*([A-F][,\s]*(?:[A-F][,\s]*)*)\*\*", RegexOptions.Compiled)]
    private static partial Regex AnswerRegex();

    public static string DeriveExamCode(string fileName)
    {
        // NCP-US-Part1.md -> NCP-US, NCM-MCI-Part2.md -> NCM-MCI, NCA-75-Part1.md -> NCA
        var name = Path.GetFileNameWithoutExtension(fileName);
        var parts = name.Split('-');

        // If the second segment is a number (e.g. "75" in NCA-75), skip it — the exam code is the first segment alone
        if (parts.Length >= 2 && int.TryParse(parts[1], out _))
            return parts[0];

        if (parts.Length >= 2)
            return $"{parts[0]}-{parts[1]}";
        return name;
    }

    public List<Question> ParseFile(string filePath)
    {
        var content = _examRepository.ReadExamFile(filePath);
        var lines = content.Split(['\r', '\n'], StringSplitOptions.None);
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
                // grab description after the colon if present
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
                    // try dash separator: ## Domain 1 — Deploy NAI Environment
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

                // Capture inline stem text (e.g. "### Q1. Which tool..." or "### Q1 Which tool...")
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

                // Collect options
                while (i < lines.Length)
                {
                    line = lines[i].TrimEnd();
                    var om = OptionRx.Match(line);
                    if (om.Success)
                    {
                        var optText = om.Groups[2].Value.Trim();
                        i++;
                        // multi-line option: continuation lines that don't start a new option/answer/question
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

                // Skip blank lines before answer
                while (i < lines.Length && string.IsNullOrWhiteSpace(lines[i]))
                    i++;

                // Answer line
                if (i < lines.Length)
                {
                    line = lines[i].TrimEnd();
                    var am = AnswerRx.Match(line);
                    if (am.Success)
                    {
                        var raw = am.Groups[1].Value
                            .Replace(",", "")
                            .Replace(" ", "");
                        q.CorrectAnswers = raw.Select(c => c.ToString()).ToList();
                        i++;
                    }
                }

                // Collect explanation
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
                    questions.Add(q);

                continue;
            }

            i++;
        }

        return questions;
    }

    public Dictionary<string, List<Question>> LoadAllExams()
    {
        var exams = new Dictionary<string, List<Question>>(StringComparer.OrdinalIgnoreCase);

        foreach (var file in _examRepository.FindExamFiles())
        {
            var fileName = Path.GetFileName(file);
            if (!ExamPatterns.Any(p => MatchesPattern(fileName, p)))
                continue;

            var questions = ParseFile(file);
            var code = DeriveExamCode(fileName);
            if (!exams.ContainsKey(code))
                exams[code] = new List<Question>();
            exams[code].AddRange(questions);
        }

        return exams;
    }

    private static bool MatchesPattern(string fileName, string pattern)
    {
        // Simple glob matching for patterns like NCP-US-*.md and NCA-*.md
        if (pattern.EndsWith("*.md"))
        {
            var prefix = pattern[..^4]; // Remove "*.md"
            return fileName.EndsWith(".md", StringComparison.OrdinalIgnoreCase)
                   && fileName.StartsWith(prefix, StringComparison.OrdinalIgnoreCase);
        }
        return false;
    }
}
