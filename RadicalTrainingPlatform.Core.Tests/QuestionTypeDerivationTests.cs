using System;
using System.IO;
using System.Linq;
using NSubstitute;
using RadicalTrainingPlatform.Core.Models;
using Shouldly;
using Xunit;

namespace RadicalTrainingPlatform.Core.Tests;

// ─── Parser type derivation (R-03) — lives with the parser test helpers ──

public class QuestionTypeDerivationTests
{
    private static IExamRepository CreateRepo(string content)
    {
        var repo = Substitute.For<IExamRepository>();
        repo.ReadExamFile(Arg.Any<string>()).Returns(content);
        repo.FindExamFiles().Returns(new[] { "test-exam.md" });
        return repo;
    }

    [Fact]
    public void Parser_OrderingHeader_SetsOrderedTypeAndQuarantine()
    {
        var content = """
            ### Q1 (Ordering)
            Place the steps in order.
            - A) first
            - B) second
            - C) third
            **Answer: B, C, A**
            Sequence explanation.
            ---
            """;
        var questions = new QuestionParser(CreateRepo(content)).ParseFile("test-exam.md");

        questions.ShouldHaveSingleItem();
        questions[0].Type.ShouldBe(QuestionType.Ordered);
        questions[0].Quarantined.ShouldBeTrue();
        questions[0].CorrectAnswers.ShouldBe(new[] { "B", "C", "A" });
    }

    [Fact]
    public void Parser_MultiKeyQuestion_IsMultiSelect_NotOrdered()
    {
        var content = """
            ### Q1
            Pick two.
            - A) x
            - B) y
            - C) z
            **Answer: A, C**
            Both.
            ---
            """;
        var questions = new QuestionParser(CreateRepo(content)).ParseFile("test-exam.md");

        questions.ShouldHaveSingleItem();
        questions[0].Type.ShouldBe(QuestionType.MultiSelect);
        questions[0].Quarantined.ShouldBeFalse();
    }

    [Fact]
    public void Parser_SingleKeyQuestion_IsSingleChoice()
    {
        var content = """
            ### Q1
            Pick one.
            - A) x
            - B) y
            **Answer: B**
            It is B.
            ---
            """;
        var questions = new QuestionParser(CreateRepo(content)).ParseFile("test-exam.md");

        questions.ShouldHaveSingleItem();
        questions[0].Type.ShouldBe(QuestionType.SingleChoice);
        questions[0].Quarantined.ShouldBeFalse();
    }

    [Fact]
    public void LoadAllExams_NcaGapFill_QuarantinesTheFourOrderingItems()
    {
        // The real bank: NCA-75-Part3-GapFill Q16-19 are "(Ordering)" items.
        // They must be flagged, not silently graded as set-equality.
        var repo = new MarkdownExamRepository(new DefaultFileProvider());
        var parser = new QuestionParser(repo);
        var part3 = Path.Combine(FindRepoRoot(), "NCA-75-Part3-GapFill.md");

        var questions = parser.ParseFile(part3);

        var ordered = questions.Where(q => q.IsOrdered).ToList();
        ordered.Select(q => q.Id).ShouldBe(new[] { 16, 17, 18, 19 });
        ordered.ShouldAllBe(q => q.Quarantined);
    }

    private static string FindRepoRoot()
    {
        var dir = AppContext.BaseDirectory;
        for (var i = 0; i < 8; i++)
        {
            if (File.Exists(Path.Combine(dir, "NCA-75-Part3-GapFill.md")))
                return dir;
            dir = Path.GetDirectoryName(dir)!;
        }
        throw new FileNotFoundException("NCA-75-Part3-GapFill.md not found above test assembly");
    }
}
