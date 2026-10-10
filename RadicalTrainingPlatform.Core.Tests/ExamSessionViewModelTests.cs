using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using NSubstitute;
using RadicalTrainingPlatform.Core.Models;
using RadicalTrainingPlatform.Core.ViewModels;
using Shouldly;
using Xunit;

namespace RadicalTrainingPlatform.Core.Tests;

public class ExamSessionViewModelTests
{
    private static Question MakeQuestion(int id, string[] correctAnswers, int optionCount = 4, string domain = "")
    {
        var options = new List<AnswerOption>();
        var letters = new[] { "A", "B", "C", "D", "E", "F" };
        for (int i = 0; i < optionCount; i++)
            options.Add(new AnswerOption { Letter = letters[i], Text = $"Option {letters[i]}" });

        return new Question
        {
            Id = id,
            Stem = $"Question {id}",
            CorrectAnswers = correctAnswers.ToList(),
            Options = options,
            ExamCode = "TEST",
            Domain = domain,
            SourceFile = "test.md",
            // Mirror the parser's derivation: multiple keys are multi-select
            // (R-03 made Type explicit rather than inferred at the call site).
            Type = correctAnswers.Length > 1 ? QuestionType.MultiSelect : QuestionType.SingleChoice,
        };
    }

    // ─── Streak (audit: MainWindow rendered CorrectCount as "Streak") ──

    [Fact]
    public void Streak_IncrementsOnConsecutiveCorrect()
    {
        var questions = new List<Question> { MakeQuestion(1, ["A"]), MakeQuestion(2, ["A"]) };
        var vm = new ExamSessionViewModel(questions, "TEST");

        vm.SelectAnswer("A"); vm.Submit(); vm.Next();
        vm.Streak.ShouldBe(1); vm.BestStreak.ShouldBe(1);

        vm.SelectAnswer("A"); vm.Submit();
        vm.Streak.ShouldBe(2); vm.BestStreak.ShouldBe(2);
    }

    [Fact]
    public void Streak_ResetsOnWrong_SkipAlsoBreaks()
    {
        var questions = new List<Question> { MakeQuestion(1, ["A"]), MakeQuestion(2, ["A"]), MakeQuestion(3, ["A"]) };
        var vm = new ExamSessionViewModel(questions, "TEST");

        vm.SelectAnswer("A"); vm.Submit(); vm.Next(); // correct, streak 1
        vm.SelectAnswer("B"); vm.Submit();            // wrong
        vm.Streak.ShouldBe(0);
        vm.BestStreak.ShouldBe(1);                    // peak retained

        vm.Next();
        vm.Skip();                                    // skip = miss, breaks streak
        vm.Streak.ShouldBe(0);
    }

    // ─── Domain stats (feeds StatsView breakdown) ──────────────────

    [Fact]
    public void GetDomainStats_CountsPerDomain()
    {
        var questions = new List<Question>
        {
            MakeQuestion(1, ["A"], domain: "Alpha"),
            MakeQuestion(2, ["A"], domain: "Alpha"),
            MakeQuestion(3, ["A"], domain: "Beta"),
        };
        var vm = new ExamSessionViewModel(questions, "TEST");

        vm.SelectAnswer("A"); vm.Submit(); vm.Next();  // Alpha correct
        vm.SelectAnswer("B"); vm.Submit(); vm.Next();  // Alpha wrong
        // Beta untouched

        var stats = vm.GetDomainStats();
        var alpha = stats.Single(s => s.Domain == "Alpha");
        alpha.Correct.ShouldBe(1);
        alpha.Answered.ShouldBe(2);
        alpha.Total.ShouldBe(2);
        var beta = stats.Single(s => s.Domain == "Beta");
        beta.Answered.ShouldBe(0);
        beta.Total.ShouldBe(1);
    }

    [Fact]
    public void GetDomainStats_BlankDomain_GroupedAsGeneral()
    {
        var vm = new ExamSessionViewModel(new List<Question> { MakeQuestion(1, ["A"]) }, "TEST");
        vm.GetDomainStats().Single().Domain.ShouldBe("General");
    }

    // ─── Constructor Tests ────────────────────────────────────────

    [Fact]
    public void Constructor_NoLimit_UsesAllQuestions()
    {
        var questions = new List<Question>
        {
            MakeQuestion(1, ["A"]),
            MakeQuestion(2, ["B"]),
            MakeQuestion(3, ["C"]),
        };
        var vm = new ExamSessionViewModel(questions, "TEST");

        vm.TotalQuestions.ShouldBe(3);
    }

    [Fact]
    public void Constructor_WithLimit_SubsetsQuestions()
    {
        var questions = new List<Question>
        {
            MakeQuestion(1, ["A"]),
            MakeQuestion(2, ["B"]),
            MakeQuestion(3, ["C"]),
            MakeQuestion(4, ["D"]),
            MakeQuestion(5, ["E"]),
        };
        var vm = new ExamSessionViewModel(questions, "TEST", limit: 3);

        vm.TotalQuestions.ShouldBe(3);
    }

    [Fact]
    public void Constructor_NullQuestions_ThrowsArgumentNullException()
    {
        Should.Throw<ArgumentNullException>(() => new ExamSessionViewModel(null!, "TEST"));
    }

    [Fact]
    public void Constructor_SetsExamCode()
    {
        var questions = new List<Question> { MakeQuestion(1, ["A"]) };
        var vm = new ExamSessionViewModel(questions, "NCP-US");

        vm.ExamCode.ShouldBe("NCP-US");
    }

    // ─── Question.Id Immutability Tests ───────────────────────────

    [Fact]
    public void Constructor_DoesNotMutateOriginalQuestionIds()
    {
        var q = MakeQuestion(42, ["A"]);
        var originalId = q.Id;
        var vm = new ExamSessionViewModel(new List<Question> { q }, "TEST");

        q.Id.ShouldBe(originalId); // Original Id preserved
    }

    [Fact]
    public void GetDisplayNumber_Returns1BasedOrdinal()
    {
        var questions = new List<Question>
        {
            MakeQuestion(100, ["A"]),
            MakeQuestion(200, ["B"]),
            MakeQuestion(300, ["C"]),
        };
        var vm = new ExamSessionViewModel(questions, "TEST");

        vm.GetDisplayNumber(questions[0]).ShouldBe(1);
        vm.GetDisplayNumber(questions[1]).ShouldBe(2);
        vm.GetDisplayNumber(questions[2]).ShouldBe(3);
    }

    [Fact]
    public void CurrentNumber_ReturnsDisplayNumber_NotQuestionId()
    {
        var questions = new List<Question>
        {
            MakeQuestion(99, ["A"]),
        };
        var vm = new ExamSessionViewModel(questions, "TEST");

        vm.CurrentNumber.ShouldBe(1); // display number, not 99
    }

    // ─── Answer Selection Tests ────────────────────────────────────

    [Fact]
    public void SelectAnswer_SingleSelect_ReplacesPrevious()
    {
        var q = MakeQuestion(1, ["A"]);
        q.CorrectAnswers = new List<string> { "A" }; // ensure single-select
        var vm = new ExamSessionViewModel(new List<Question> { q }, "TEST");

        vm.SelectAnswer("B");
        vm.SelectedAnswers.ShouldContain("B");
        vm.SelectedAnswers.Count.ShouldBe(1);

        vm.SelectAnswer("C");
        vm.SelectedAnswers.ShouldContain("C");
        vm.SelectedAnswers.ShouldNotContain("B");
    }

    [Fact]
    public void SelectAnswer_MultiSelect_TogglesSelection()
    {
        var q = MakeQuestion(1, ["A", "B"]);
        var vm = new ExamSessionViewModel(new List<Question> { q }, "TEST");

        vm.SelectAnswer("A");
        vm.SelectAnswer("B");
        vm.SelectedAnswers.Count.ShouldBe(2);
        vm.SelectedAnswers.ShouldContain("A");
        vm.SelectedAnswers.ShouldContain("B");

        // Toggle off
        vm.SelectAnswer("A");
        vm.SelectedAnswers.ShouldNotContain("A");
        vm.SelectedAnswers.ShouldContain("B");
    }

    [Fact]
    public void SelectAnswer_AfterSubmit_IsNoOp()
    {
        var q = MakeQuestion(1, ["A"]);
        var vm = new ExamSessionViewModel(new List<Question> { q }, "TEST");

        vm.SelectAnswer("A");
        vm.Submit();
        vm.SelectAnswer("B"); // Should be ignored after submit

        vm.SelectedAnswers.ShouldContain("A");
        vm.SelectedAnswers.ShouldNotContain("B");
    }

    // ─── Submit Tests ──────────────────────────────────────────────

    [Fact]
    public void Submit_CorrectSingleSelect_ReturnsTrue()
    {
        var q = MakeQuestion(1, ["A"]);
        var vm = new ExamSessionViewModel(new List<Question> { q }, "TEST");

        vm.SelectAnswer("A");
        vm.Submit().ShouldBeTrue();
        vm.CorrectCount.ShouldBe(1);
        vm.WrongCount.ShouldBe(0);
    }

    [Fact]
    public void Submit_WrongSingleSelect_ReturnsFalse()
    {
        var q = MakeQuestion(1, ["A"]);
        var vm = new ExamSessionViewModel(new List<Question> { q }, "TEST");

        vm.SelectAnswer("B");
        vm.Submit().ShouldBeFalse();
        vm.CorrectCount.ShouldBe(0);
        vm.WrongCount.ShouldBe(1);
    }

    [Fact]
    public void Submit_CorrectMultiSelect_ReturnsTrue()
    {
        var q = MakeQuestion(1, ["A", "C"]);
        var vm = new ExamSessionViewModel(new List<Question> { q }, "TEST");

        vm.SelectAnswer("A");
        vm.SelectAnswer("C");
        vm.Submit().ShouldBeTrue();
        vm.IsCorrect.ShouldBeTrue();
    }

    [Fact]
    public void Submit_PartialMultiSelect_ReturnsFalse()
    {
        var q = MakeQuestion(1, ["A", "C"]);
        var vm = new ExamSessionViewModel(new List<Question> { q }, "TEST");

        vm.SelectAnswer("A");
        // Only selected one of two correct answers
        vm.Submit().ShouldBeFalse();
        vm.IsCorrect.ShouldBeFalse();
    }

    [Fact]
    public void Submit_NoAnswerSelected_ReturnsFalse()
    {
        var q = MakeQuestion(1, ["A"]);
        var vm = new ExamSessionViewModel(new List<Question> { q }, "TEST");

        vm.Submit().ShouldBeFalse(); // No answer selected
    }

    [Fact]
    public void Submit_DoubleSubmit_SecondIsNoOp()
    {
        var q = MakeQuestion(1, ["A"]);
        var vm = new ExamSessionViewModel(new List<Question> { q }, "TEST");

        vm.SelectAnswer("A");
        vm.Submit().ShouldBeTrue();
        vm.Submit().ShouldBeFalse(); // Already submitted
        vm.CorrectCount.ShouldBe(1); // Not double-counted
    }

    // ─── Navigation Tests ──────────────────────────────────────────

    [Fact]
    public void Next_AdvancesQuestion()
    {
        var questions = new List<Question>
        {
            MakeQuestion(1, ["A"]),
            MakeQuestion(2, ["B"]),
        };
        var vm = new ExamSessionViewModel(questions, "TEST");

        vm.CurrentQuestion.Id.ShouldBe(1);
        vm.Next();
        vm.CurrentQuestion.Id.ShouldBe(2);
    }

    [Fact]
    public void Previous_GoesBack()
    {
        var questions = new List<Question>
        {
            MakeQuestion(1, ["A"]),
            MakeQuestion(2, ["B"]),
        };
        var vm = new ExamSessionViewModel(questions, "TEST");

        vm.Next();
        vm.CurrentQuestion.Id.ShouldBe(2);
        vm.Previous();
        vm.CurrentQuestion.Id.ShouldBe(1);
    }

    [Fact]
    public void Next_AtLastQuestion_IsNoOp()
    {
        var questions = new List<Question>
        {
            MakeQuestion(1, ["A"]),
        };
        var vm = new ExamSessionViewModel(questions, "TEST");

        vm.Next(); // At last → no-op
        vm.CurrentIndex.ShouldBe(0);
    }

    [Fact]
    public void Previous_AtFirstQuestion_IsNoOp()
    {
        var questions = new List<Question>
        {
            MakeQuestion(1, ["A"]),
        };
        var vm = new ExamSessionViewModel(questions, "TEST");

        vm.Previous();
        vm.CurrentIndex.ShouldBe(0);
    }

    [Fact]
    public void HasNext_AtLastFalse()
    {
        var questions = new List<Question>
        {
            MakeQuestion(1, ["A"]),
        };
        var vm = new ExamSessionViewModel(questions, "TEST");

        vm.HasNext.ShouldBeFalse();
    }

    [Fact]
    public void HasPrevious_AtFirstFalse()
    {
        var questions = new List<Question> { MakeQuestion(1, ["A"]) };
        var vm = new ExamSessionViewModel(questions, "TEST");

        vm.HasPrevious.ShouldBeFalse();
    }

    [Fact]
    public void JumpTo_ValidIndex_MovesCorrectly()
    {
        var questions = new List<Question>
        {
            MakeQuestion(1, ["A"]),
            MakeQuestion(2, ["B"]),
            MakeQuestion(3, ["C"]),
        };
        var vm = new ExamSessionViewModel(questions, "TEST");

        vm.JumpTo(2);
        vm.CurrentIndex.ShouldBe(2);
    }

    [Fact]
    public void JumpTo_InvalidIndex_IsNoOp()
    {
        var questions = new List<Question>
        {
            MakeQuestion(1, ["A"]),
            MakeQuestion(2, ["B"]),
        };
        var vm = new ExamSessionViewModel(questions, "TEST");

        vm.JumpTo(-1);
        vm.CurrentIndex.ShouldBe(0);

        vm.JumpTo(99);
        vm.CurrentIndex.ShouldBe(0);
    }

    // ─── Scoring Tests ─────────────────────────────────────────────

    [Fact]
    public void AccuracyPercent_CalculatesCorrectly()
    {
        var questions = new List<Question>
        {
            MakeQuestion(1, ["A"]),
            MakeQuestion(2, ["B"]),
        };
        var vm = new ExamSessionViewModel(questions, "TEST");

        vm.SelectAnswer("A");
        vm.Submit();
        vm.Next();
        vm.SelectAnswer("A"); // Wrong — B is correct
        vm.Submit();

        vm.CorrectCount.ShouldBe(1);
        vm.WrongCount.ShouldBe(1);
        vm.AccuracyPercent.ShouldBe(50.0);
    }

    [Fact]
    public void GetWrongQuestions_ReturnsOnlyIncorrect()
    {
        var questions = new List<Question>
        {
            MakeQuestion(1, ["A"]),
            MakeQuestion(2, ["B"]),
        };
        var vm = new ExamSessionViewModel(questions, "TEST");

        vm.SelectAnswer("A"); // Correct
        vm.Submit();
        vm.Next();
        vm.SelectAnswer("A"); // Wrong — B is correct
        vm.Submit();

        var wrong = vm.GetWrongQuestions();
        wrong.Count.ShouldBe(1);
        wrong[0].Id.ShouldBe(2);
    }

    [Fact]
    public void IsComplete_AllAnswered_IsTrue()
    {
        var questions = new List<Question>
        {
            MakeQuestion(1, ["A"]),
            MakeQuestion(2, ["B"]),
        };
        var vm = new ExamSessionViewModel(questions, "TEST");

        vm.SelectAnswer("A");
        vm.Submit();
        vm.Next();
        vm.SelectAnswer("B");
        vm.Submit();

        vm.IsComplete.ShouldBeTrue();
    }

    [Fact]
    public void IsComplete_NotAllAnswered_IsFalse()
    {
        var questions = new List<Question>
        {
            MakeQuestion(1, ["A"]),
            MakeQuestion(2, ["B"]),
        };
        var vm = new ExamSessionViewModel(questions, "TEST");

        vm.SelectAnswer("A");
        vm.Submit();
        // Q2 not answered

        vm.IsComplete.ShouldBeFalse();
    }

    // ─── Skip Tests ────────────────────────────────────────────────

    [Fact]
    public void Skip_CountsAsWrong()
    {
        var questions = new List<Question>
        {
            MakeQuestion(1, ["A"]),
            MakeQuestion(2, ["B"]),
        };
        var vm = new ExamSessionViewModel(questions, "TEST");

        vm.Skip();

        vm.WrongCount.ShouldBe(1);
        vm.CurrentIndex.ShouldBe(1); // Moved to next
    }

    // ─── Ordered-response (TM-17 / R-03) ──────────────────────────
    // The sorted-set comparison previously graded EVERY permutation of an
    // ordering key as correct (NCA-75-Part3 Q16-19). These fixtures pin
    // sequence scoring: only the intended order passes.

    private static Question MakeOrderedQuestion(int id, string[] sequence, int optionCount = 4)
    {
        var q = MakeQuestion(id, sequence, optionCount);
        q.Type = QuestionType.Ordered;
        q.Quarantined = true; // the parser always sets these together (R-03)
        return q;
    }

    private static ExamSessionViewModel MakeOrderedVm(Question q)
    {
        var vm = new ExamSessionViewModel([q], "TEST", includeQuarantined: true);
        return vm;
    }

    [Fact]
    public void Ordered_CorrectSequence_Passes()
    {
        var q = MakeOrderedQuestion(1, ["B", "C", "D", "A"]);
        var vm = MakeOrderedVm(q);
        foreach (var letter in new[] { "B", "C", "D", "A" }) vm.SelectAnswer(letter);

        vm.Submit().ShouldBeTrue();
    }

    [Fact]
    public void Ordered_ReversedSequence_Fails()
    {
        var q = MakeOrderedQuestion(1, ["B", "C", "D", "A"]);
        var vm = MakeOrderedVm(q);
        foreach (var letter in new[] { "A", "D", "C", "B" }) vm.SelectAnswer(letter);

        vm.Submit().ShouldBeFalse();
    }

    [Fact]
    public void Ordered_SameLettersDifferentPermutation_Fails()
    {
        // The old defect in its purest form: identical letter set, wrong order.
        var q = MakeOrderedQuestion(1, ["B", "C", "D", "A"]);
        var vm = MakeOrderedVm(q);
        foreach (var letter in new[] { "C", "B", "D", "A" }) vm.SelectAnswer(letter);

        vm.Submit().ShouldBeFalse();
    }

    [Fact]
    public void Ordered_MissingStep_Fails()
    {
        var q = MakeOrderedQuestion(1, ["B", "C", "D", "A"]);
        var vm = MakeOrderedVm(q);
        foreach (var letter in new[] { "B", "C", "D" }) vm.SelectAnswer(letter);

        vm.Submit().ShouldBeFalse();
    }

    [Fact]
    public void Ordered_DuplicateStep_Fails()
    {
        var q = MakeOrderedQuestion(1, ["B", "C", "D", "A"]);
        var vm = MakeOrderedVm(q);
        foreach (var letter in new[] { "B", "B", "D", "A" }) vm.SelectAnswer(letter);

        vm.Submit().ShouldBeFalse();
    }

    [Fact]
    public void Ordered_ExtraToken_Fails()
    {
        var q = MakeOrderedQuestion(1, ["B", "C", "D", "A"]);
        var vm = MakeOrderedVm(q);
        foreach (var letter in new[] { "B", "C", "D", "A", "B" }) vm.SelectAnswer(letter);

        vm.Submit().ShouldBeFalse();
    }

    [Fact]
    public void Ordered_EmptyResponse_SubmitReturnsFalse()
    {
        var q = MakeOrderedQuestion(1, ["B", "C", "D", "A"]);
        var vm = MakeOrderedVm(q);

        vm.Submit().ShouldBeFalse();
        vm.IsSubmitted.ShouldBeFalse();
    }

    [Fact]
    public void Ordered_ClickPickedStepAgain_RemovesIt()
    {
        var q = MakeOrderedQuestion(1, ["B", "C", "D", "A"]);
        var vm = MakeOrderedVm(q);
        vm.SelectAnswer("B");
        vm.SelectAnswer("C");
        vm.SelectAnswer("B"); // remove the first pick

        vm.OrderedSelection.ShouldBe(["C"]);
    }

    [Fact]
    public void Ordered_QuarantinedItem_ExcludedFromScoredSessionByDefault()
    {
        var questions = new List<Question>
        {
            MakeQuestion(1, ["A"]),
            MakeOrderedQuestion(2, ["B", "C", "D", "A"]),
            MakeQuestion(3, ["C"]),
        };
        var vm = new ExamSessionViewModel(questions, "TEST");

        vm.TotalQuestions.ShouldBe(2); // Q2 quarantined out

        var inclusive = new ExamSessionViewModel(questions, "TEST", includeQuarantined: true);
        inclusive.TotalQuestions.ShouldBe(3); // review/triage can opt in
    }

}

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
