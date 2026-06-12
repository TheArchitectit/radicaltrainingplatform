using System;
using System.Collections.Generic;
using System.Linq;
using RadicalTrainingPlatform.Core.Models;
using RadicalTrainingPlatform.Core.ViewModels;
using Shouldly;
using Xunit;

namespace RadicalTrainingPlatform.Core.Tests;

public class ExamSessionViewModelTests
{
    private static Question MakeQuestion(int id, string[] correctAnswers, int optionCount = 4)
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
            SourceFile = "test.md"
        };
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
}
