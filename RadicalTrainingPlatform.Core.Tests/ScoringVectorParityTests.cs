using System.Collections.Generic;
using System.Linq;
using RadicalTrainingPlatform.Core.Models;
using RadicalTrainingPlatform.Core.ViewModels;
using Shouldly;
using Xunit;

namespace RadicalTrainingPlatform.Core.Tests;

/// <summary>
/// T-16/L-06/REQ-UI-03 — pins Core's ExamSessionViewModel.Grade against the
/// exact fixture vectors used by tests/gates/web/practice-grading.mjs on the
/// JS side. Same inputs, same pass/fail, same reason strings. A divergence
/// here means the JS port and Core no longer grade identically.
///
/// Vectors (identical to the JS fixture):
///   choice  keys ['B']
///   multi   keys ['A', 'C']
///   ordered keys ['B', 'D', 'A']
/// </summary>
public class ScoringVectorParityTests
{
    private static Question Choice() => new()
    {
        Id = 1,
        Stem = "choice",
        CorrectAnswers = new List<string> { "B" },
        Options = Letters(4),
        ExamCode = "TEST",
        SourceFile = "vectors.md",
        Type = QuestionType.SingleChoice,
    };

    private static Question Multi() => new()
    {
        Id = 2,
        Stem = "multi",
        CorrectAnswers = new List<string> { "A", "C" },
        Options = Letters(4),
        ExamCode = "TEST",
        SourceFile = "vectors.md",
        Type = QuestionType.MultiSelect,
    };

    private static Question Ordered() => new()
    {
        Id = 3,
        Stem = "ordered",
        CorrectAnswers = new List<string> { "B", "D", "A" },
        Options = Letters(4),
        ExamCode = "TEST",
        SourceFile = "vectors.md",
        Type = QuestionType.Ordered,
    };

    private static List<AnswerOption> Letters(int n) =>
        Enumerable.Range(0, n)
            .Select(i => new AnswerOption { Letter = ((char)('A' + i)).ToString(), Text = $"Option {(char)('A' + i)}" })
            .ToList();

    // ─── single-select: keys ['B'] ─────────────────────────────────

    [Fact]
    public void SingleSelect_ExactMatch_Passes()
    {
        var (ok, _) = ExamSessionViewModel.Grade(Choice(), new[] { "B" });
        ok.ShouldBeTrue();
    }

    [Fact]
    public void SingleSelect_WrongLetter_FailsWithSetMismatch()
    {
        var (ok, reason) = ExamSessionViewModel.Grade(Choice(), new[] { "A" });
        ok.ShouldBeFalse();
        reason.ShouldBe("set-mismatch");
    }

    // ─── multi-select: keys ['A', 'C'] ─────────────────────────────

    [Fact]
    public void MultiSelect_OrderInsensitive_ReorderedPasses()
    {
        var (ok, _) = ExamSessionViewModel.Grade(Multi(), new[] { "C", "A" });
        ok.ShouldBeTrue("multi-select is set equality, not sequence equality");
    }

    [Fact]
    public void MultiSelect_Subset_FailsWithSetMismatch()
    {
        var (ok, reason) = ExamSessionViewModel.Grade(Multi(), new[] { "A" });
        ok.ShouldBeFalse("subset is count-sensitive");
        reason.ShouldBe("set-mismatch");
    }

    [Fact]
    public void MultiSelect_Superset_FailsWithSetMismatch()
    {
        var (ok, reason) = ExamSessionViewModel.Grade(Multi(), new[] { "A", "C", "D" });
        ok.ShouldBeFalse();
        reason.ShouldBe("set-mismatch");
    }

    // ─── ordered: keys ['B', 'D', 'A'] ─────────────────────────────

    [Fact]
    public void Ordered_CorrectSequence_Passes()
    {
        var (ok, _) = ExamSessionViewModel.Grade(Ordered(), new[] { "B", "D", "A" });
        ok.ShouldBeTrue();
    }

    [Fact]
    public void Ordered_CorrectSetWrongOrder_FailsWithSequenceMismatch()
    {
        var (ok, reason) = ExamSessionViewModel.Grade(Ordered(), new[] { "A", "B", "D" });
        ok.ShouldBeFalse();
        reason.ShouldBe("sequence-mismatch");
    }

    [Fact]
    public void Ordered_MissingStep_Named()
    {
        var (ok, reason) = ExamSessionViewModel.Grade(Ordered(), new[] { "B", "D" });
        ok.ShouldBeFalse();
        reason.ShouldBe("missing-step");
    }

    [Fact]
    public void Ordered_ExtraToken_Named()
    {
        var (ok, reason) = ExamSessionViewModel.Grade(Ordered(), new[] { "B", "D", "A", "C" });
        ok.ShouldBeFalse();
        reason.ShouldBe("extra-token");
    }

    [Fact]
    public void Ordered_DuplicateStep_Named()
    {
        // Same length as the key (3) but a repeated letter — hits the
        // duplicate branch, not the length branch.
        var (ok, reason) = ExamSessionViewModel.Grade(Ordered(), new[] { "B", "B", "A" });
        ok.ShouldBeFalse();
        reason.ShouldBe("duplicate-step");
    }
}
