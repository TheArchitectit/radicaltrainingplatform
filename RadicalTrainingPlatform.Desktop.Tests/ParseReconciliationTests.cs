using System.Linq;
using RadicalTrainingPlatform.Core;
using RadicalTrainingPlatform.Core.Abstractions;
using Shouldly;
using Xunit;

namespace RadicalTrainingPlatform.Desktop.Tests;

/// <summary>
/// TM-15 / R-07: every question header in a real bank must yield exactly one
/// parsed question. The old answer grammar silently dropped valid keys
/// ("Answer: B and D" — NCP-AI-Part4 Q61-70 vanished while CI stayed green),
/// because nothing compared parsed counts against header counts.
/// Runs against the real banks via the real DI container (repo-root search
/// path), same discovery the desktop app uses.
/// </summary>
public class ParseReconciliationTests
{
    [Fact]
    public void EveryBank_HeaderCountEqualsParsedCount()
    {
        var parser = new QuestionParser(
            new MarkdownExamRepository(new DefaultFileProvider()));

        var banks = parser.LoadAllExams();

        banks.ShouldNotBeEmpty();

        foreach (var (code, questions) in banks)
        {
            foreach (var group in questions.GroupBy(q => q.SourceFile))
            {
                var content = new DefaultFileProvider()
                    .ReadAllText(FindBankFile(group.Key));
                var headerCount = System.Text.RegularExpressions.Regex
                    .Matches(content, @"^###\s+Q\d+", System.Text.RegularExpressions
                        .RegexOptions.Multiline).Count;
                group.Count().ShouldBe(headerCount,
                    $"exam {code}, file {group.Key}: {headerCount} question headers " +
                    $"but only {group.Count()} parsed — a question was dropped");
            }
        }
    }

    [Fact]
    public void NcpAiPart4_YieldsFullItemCount_AfterSeparatorRepair()
    {
        var parser = new QuestionParser(
            new MarkdownExamRepository(new DefaultFileProvider()));

        var exams = parser.LoadAllExams();
        var part4 = exams.TryGetValue("NCP-AI", out var list)
            ? list.Where(q => q.SourceFile == "NCP-AI-Part4.md").ToList()
            : [];

        part4.ShouldNotBeNull();
        // Q1..Q80 — before the R-07 repair, Q61-70 ("B and D" keys) were
        // silently dropped and this yielded 70.
        part4.Count.ShouldBe(80);
        part4.ShouldContain(q => q.Id == 61 && q.CorrectAnswers.Contains("B"));
        part4.ShouldContain(q => q.Id == 70 && q.CorrectAnswers.Contains("E"));
    }

    private static string FindBankFile(string fileName)
    {
        var probe = new DefaultFileProvider();
        var dir = probe.GetExecutingAssemblyDirectory();
        var current = dir;
        for (var i = 0; i < 8; i++)
        {
            var candidate = probe.CombinePath(current, fileName);
            if (probe.Exists(candidate)) return candidate;
            var parent = probe.GetParentDirectory(current);
            if (parent is null) break;
            current = parent;
        }
        throw new System.IO.FileNotFoundException(
            $"Bank file {fileName} not found walking up from {dir}");
    }
}
