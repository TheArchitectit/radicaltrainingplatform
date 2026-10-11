using System.Collections.Generic;
using System.Linq;
using RadicalTrainingPlatform.Core.Models;
using Shouldly;
using Xunit;

namespace RadicalTrainingPlatform.Core.Tests;

/// <summary>
/// R-13 / TM-81: source-aware item identity. The live banks restart
/// numbering per source file (every NCA-75-PartN.md begins at Q1), so
/// "NCA-75:1" is ambiguous — the semantic ID disambiguates and the legacy
/// lookup must say so instead of silently picking one.
/// </summary>
public class SemanticItemIdTests
{
    private static Question Q(string examCode, string sourceFile, int localId) => new()
    {
        ExamCode = examCode,
        SourceFile = sourceFile,
        Id = localId,
        Stem = $"stem {sourceFile} Q{localId}",
        Options = new List<AnswerOption> { new() { Letter = "A", Text = "a" } },
        CorrectAnswers = new List<string> { "A" },
    };

    // ─── Compose / parse ─────────────────────────────────────────

    [Fact]
    public void Compose_ProducesExamSourceQForm()
    {
        SemanticItemId.Compose("NCA-75", "NCA-75-Part1.md", 1)
            .ShouldBe("NCA-75/NCA-75-Part1.md/Q1");
    }

    [Fact]
    public void Compose_StripsDirectoriesFromSourceFile()
    {
        SemanticItemId.Compose("NCA-75", "content/exams/NCA-75/questions/pack.md", 17)
            .ShouldBe("NCA-75/pack.md/Q17");
    }

    [Fact]
    public void TryParse_RoundTripsCompose()
    {
        var id = SemanticItemId.Compose("COMPTIA-A-1201", "core1-a2-fixtures.md", 7);
        SemanticItemId.TryParse(id, out var exam, out var file, out var n).ShouldBeTrue();
        exam.ShouldBe("COMPTIA-A-1201");
        file.ShouldBe("core1-a2-fixtures.md");
        n.ShouldBe(7);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("NCA-75:1")]
    [InlineData("NCA-75/1")]
    [InlineData("NCA-75/Part1.md")]
    [InlineData("NCA-75/Part1.md/1")]      // missing Q prefix
    [InlineData("NCA-75/Part1.md/Q0")]     // zero is not a local id
    [InlineData("NCA-75/Part1.md/QX")]
    public void TryParse_RejectsLegacyAndMalformed(string? id)
    {
        SemanticItemId.TryParse(id, out _, out _, out _).ShouldBeFalse();
    }

    [Fact]
    public void Compose_RejectsMissingParts()
    {
        Should.Throw<System.ArgumentException>(() => SemanticItemId.Compose("", "a.md", 1));
        Should.Throw<System.ArgumentException>(() => SemanticItemId.Compose("NCA-75", "  ", 1));
        Should.Throw<System.ArgumentOutOfRangeException>(() => SemanticItemId.Compose("NCA-75", "a.md", 0));
    }

    // ─── Two Q1 items from two files in one exam (R-13 fixture) ──

    [Fact]
    public void TwoQ1ItemsFromTwoFiles_GetDistinctSemanticIds()
    {
        var q1a = Q("NCA-75", "NCA-75-Part1.md", 1);
        var q1b = Q("NCA-75", "NCA-75-Part2.md", 1);

        SemanticItemId.Compose(q1a.ExamCode, q1a.SourceFile, q1a.Id)
            .ShouldBe("NCA-75/NCA-75-Part1.md/Q1");
        SemanticItemId.Compose(q1b.ExamCode, q1b.SourceFile, q1b.Id)
            .ShouldBe("NCA-75/NCA-75-Part2.md/Q1");
        SemanticItemId.Compose(q1a.ExamCode, q1a.SourceFile, q1a.Id)
            .ShouldNotBe(SemanticItemId.Compose(q1b.ExamCode, q1b.SourceFile, q1b.Id));
    }

    [Fact]
    public void DetectCollisions_TwoQ1sFromTwoFiles_IsClean()
    {
        var questions = new List<Question>
        {
            Q("NCA-75", "NCA-75-Part1.md", 1),
            Q("NCA-75", "NCA-75-Part2.md", 1),
            Q("NCA-75", "NCA-75-Part1.md", 2),
        };

        SemanticItemId.DetectCollisions(questions).ShouldBeEmpty();
    }

    // ─── Collision detector (TM-81) ──────────────────────────────

    [Fact]
    public void DetectCollisions_SeededDuplicate_IsReported()
    {
        var questions = new List<Question>
        {
            Q("NCA-75", "NCA-75-Part1.md", 1),
            Q("NCA-75", "NCA-75-Part1.md", 1), // seeded collision: same exam+source+local
            Q("NCA-75", "NCA-75-Part2.md", 1),
        };

        var collisions = SemanticItemId.DetectCollisions(questions);

        collisions.Count.ShouldBe(1);
        collisions[0].Id.ShouldBe("NCA-75/NCA-75-Part1.md/Q1");
        collisions[0].Count.ShouldBe(2);
    }

    [Fact]
    public void DetectCollisions_AcrossExams_IsClean()
    {
        // Same source name and local id in two exams is legal (REQ-MAN-05).
        var questions = new List<Question>
        {
            Q("COMPTIA-A-1201", "shared.md", 1),
            Q("COMPTIA-NET-009", "shared.md", 1),
        };

        SemanticItemId.DetectCollisions(questions).ShouldBeEmpty();
    }

    // ─── Legacy EXAM:number ambiguity (R-13) ─────────────────────

    [Fact]
    public void ResolveLegacy_SingleMatch_ReturnsFound()
    {
        var questions = new List<Question>
        {
            Q("NCA-75", "NCA-75-Part1.md", 1),
            Q("NCA-75", "NCA-75-Part1.md", 2),
        };

        var result = SemanticItemId.ResolveLegacy(questions, "NCA-75", 2);

        result.IsFound.ShouldBeTrue();
        result.Question!.SourceFile.ShouldBe("NCA-75-Part1.md");
    }

    [Fact]
    public void ResolveLegacy_TwoQ1sInOneExam_IsAmbiguous_NeverSilentPick()
    {
        var questions = new List<Question>
        {
            Q("NCA-75", "NCA-75-Part1.md", 1),
            Q("NCA-75", "NCA-75-Part2.md", 1),
        };

        var result = SemanticItemId.ResolveLegacy(questions, "NCA-75", 1);

        result.IsFound.ShouldBeFalse("a bare EXAM:number must not silently pick among sources");
        result.IsAmbiguous.ShouldBeTrue();
        result.Candidates.Count.ShouldBe(2);
        result.Candidates.Select(c => c.SourceFile).ShouldContain("NCA-75-Part1.md");
        result.Candidates.Select(c => c.SourceFile).ShouldContain("NCA-75-Part2.md");
        result.Reason.ShouldStartWith("ambiguous:");
        result.Question.ShouldBeNull();
    }

    [Fact]
    public void ResolveLegacy_NoMatch_IsNotFound()
    {
        var result = SemanticItemId.ResolveLegacy(
            new List<Question> { Q("NCA-75", "NCA-75-Part1.md", 1) }, "NCA-75", 99);

        result.IsFound.ShouldBeFalse();
        result.IsAmbiguous.ShouldBeFalse();
        result.Reason.ShouldBe("not-found");
    }

    [Fact]
    public void ResolveLegacy_IsExamCodeCaseInsensitive()
    {
        var questions = new List<Question> { Q("NCA-75", "a.md", 5) };
        SemanticItemId.ResolveLegacy(questions, "nca-75", 5).IsFound.ShouldBeTrue();
    }
}
