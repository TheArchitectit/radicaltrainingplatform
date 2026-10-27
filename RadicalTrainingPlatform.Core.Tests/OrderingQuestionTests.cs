using System.Collections.Generic;
using System.Linq;
using RadicalTrainingPlatform.Core.Models;
using RadicalTrainingPlatform.Core.ViewModels;
using Shouldly;
using Xunit;

namespace RadicalTrainingPlatform.Core.Tests;

/// <summary>
/// Sequence ("Ordering") questions — the bank tags them
/// <c>### QN (Ordering)</c> and the key lists the options IN THE REQUIRED ORDER.
/// They were graded as unordered sets, so clicking every option scored as
/// correct: the four real ones in NCA-75-Part3-GapFill.md were free points.
/// </summary>
public class OrderingQuestionTests
{
    private static Question MakeOrdering(int id, string[] orderedKey, int optionCount = 5)
    {
        var letters = new[] { "A", "B", "C", "D", "E", "F" };
        var options = Enumerable.Range(0, optionCount)
            .Select(i => new AnswerOption { Letter = letters[i], Text = $"Step {letters[i]}" })
            .ToList();

        return new Question
        {
            Id = id,
            // Mirrors the real bank: the tag leads the stem on its own line.
            Stem = "(Ordering)\nPlace these steps in order:",
            CorrectAnswers = orderedKey.ToList(),
            Options = options,
            ExamCode = "TEST",
            SourceFile = "test.md"
        };
    }

    [Theory]
    [InlineData("(Ordering)\nPlace these steps in order:", true)]
    [InlineData("(ordering)\nAnything:", true)]
    [InlineData("( ORDERING ) lead:", true)]
    [InlineData("What is the correct order of steps?", false)]  // plain MCQ, not tagged
    [InlineData("A normal recall question.", false)]
    public void IsOrdering_MatchesTheBankTagOnly(string stem, bool expected)
    {
        var q = MakeOrdering(1, ["A", "B", "C", "D", "E"]);
        q.Stem = stem;
        q.IsOrdering.ShouldBe(expected);
    }

    [Fact]
    public void CorrectSequence_IsGradedCorrect()
    {
        var q = MakeOrdering(1, ["B", "C", "D", "A", "E"]);
        var vm = new ExamSessionViewModel(new List<Question> { q }, "TEST");

        foreach (var l in new[] { "B", "C", "D", "A", "E" })
            vm.SelectAnswer(l);
        vm.Submit();

        vm.IsSubmitted.ShouldBeTrue();
        vm.IsCorrect.ShouldBeTrue();
        vm.CorrectCount.ShouldBe(1);
        vm.WrongCount.ShouldBe(0);
    }

    [Fact]
    public void SameMembersWrongOrder_IsIncorrect()
    {
        var q = MakeOrdering(1, ["B", "C", "D", "A", "E"]);
        var vm = new ExamSessionViewModel(new List<Question> { q }, "TEST");

        foreach (var l in new[] { "A", "B", "C", "D", "E" })  // reversed-ish: wrong order
            vm.SelectAnswer(l);
        vm.Submit();

        vm.IsCorrect.ShouldBeFalse("order is the answer; membership alone must not pass");
        vm.WrongCount.ShouldBe(1);
    }

    [Fact]
    public void SelectingEveryOption_InOrder_IsStillCorrect_ButOutOfOrderIsNot()
    {
        var q = MakeOrdering(1, ["B", "C", "D", "A", "E"]);

        // The old bug: picking all five in ANY order passed.
        var allOrders = new[]
        {
            new[] { "A", "B", "C", "D", "E" },
            new[] { "E", "D", "C", "B", "A" },
            new[] { "C", "D", "B", "E", "A" },
        };
        foreach (var order in allOrders)
        {
            var vm = new ExamSessionViewModel(new List<Question> { q }, "TEST");
            foreach (var l in order) vm.SelectAnswer(l);
            vm.Submit();
            vm.IsCorrect.ShouldBeFalse($"order {string.Join(",", order)} is not the key");
        }

        var right = new ExamSessionViewModel(new List<Question> { q }, "TEST");
        foreach (var l in new[] { "B", "C", "D", "A", "E" }) right.SelectAnswer(l);
        right.Submit();
        right.IsCorrect.ShouldBeTrue();
    }

    [Fact]
    public void ClickingASelectedOption_RemovesItFromTheOrder()
    {
        var q = MakeOrdering(1, ["B", "C", "D", "A", "E"]);
        var vm = new ExamSessionViewModel(new List<Question> { q }, "TEST");

        vm.SelectAnswer("B");
        vm.SelectAnswer("C");
        vm.SelectedOrder.ShouldBe(new[] { "B", "C" });

        // A mis-click must be fixable by clicking again.
        vm.SelectAnswer("C");
        vm.SelectedOrder.ShouldBe(new[] { "B" });
        vm.SelectedAnswers.ShouldNotContain("C");

        // Then continue in order — this sequence is the key.
        foreach (var l in new[] { "C", "D", "A", "E" }) vm.SelectAnswer(l);
        vm.Submit();
        vm.IsCorrect.ShouldBeTrue();
    }

    [Fact]
    public void PartialSequence_IsIncorrect()
    {
        var q = MakeOrdering(1, ["B", "C", "D", "A", "E"]);
        var vm = new ExamSessionViewModel(new List<Question> { q }, "TEST");

        vm.SelectAnswer("B");
        vm.SelectAnswer("C");
        vm.Submit();

        vm.IsCorrect.ShouldBeFalse("an incomplete sequence is not the answer");
        vm.WrongCount.ShouldBe(1);
    }

    [Fact]
    public void OrderingQuestions_AreNotShuffled()
    {
        // A shuffle relabels letters and OrderBy on the key would destroy the
        // very order that the answer is.
        var q = MakeOrdering(1, ["B", "C", "D", "A", "E"]);
        var vm = new ExamSessionViewModel(new List<Question> { q }, "TEST",
            shuffleOptions: true, random: new System.Random(42));

        vm.CurrentQuestion.Options.Select(o => o.Letter).ShouldBe(new[] { "A", "B", "C", "D", "E" },
            "the key encodes order, so these must stay in authored order");
        vm.CurrentQuestion.CorrectAnswers.ShouldBe(new[] { "B", "C", "D", "A", "E" });
    }

    [Fact]
    public void NonOrderingMultiSelect_StillIgnoresOrder()
    {
        // Guard the other direction: a regular "Select TWO" must not start
        // requiring a click order.
        var letters = new[] { "A", "B", "C", "D" };
        var q = new Question
        {
            Id = 1,
            Stem = "Select TWO that apply:",
            CorrectAnswers = new List<string> { "C", "A" },
            Options = letters.Select(l => new AnswerOption { Letter = l, Text = $"Opt {l}" }).ToList(),
            ExamCode = "TEST",
            SourceFile = "test.md"
        };
        q.IsOrdering.ShouldBeFalse();

        var vm = new ExamSessionViewModel(new List<Question> { q }, "TEST");
        vm.SelectAnswer("C");
        vm.SelectAnswer("A");
        vm.Submit();

        vm.IsCorrect.ShouldBeTrue("plain multi-select grades by membership, not click order");
    }

    [Fact]
    public void NavigatingAway_ClearsTheSelectionOrder()
    {
        var q1 = MakeOrdering(1, ["B", "C", "D", "A", "E"]);
        var q2 = MakeOrdering(2, ["D", "C", "B", "A"], optionCount: 4);
        var vm = new ExamSessionViewModel(new List<Question> { q1, q2 }, "TEST");

        vm.SelectAnswer("B");
        vm.SelectAnswer("C");
        vm.Next();

        vm.SelectedOrder.ShouldBeEmpty("the previous question's picks must not leak into the next");
        vm.SelectedAnswers.ShouldBeEmpty();

        vm.Previous();
        vm.SelectedOrder.ShouldBeEmpty("navigating back resets the answer too");
    }

    [Fact]
    public void RealBankQuestionStems_AreDetectedAsOrdering()
    {
        // Pin detection to the four real NCA-75-Part3-GapFill.md stems so a
        // bank edit that drops the tag fails loudly instead of silently
        // reverting those questions to free points.
        foreach (var stem in new[]
        {
            "(Ordering)\nPlace the following steps of the Nutanix write I/O path in the correct order:",
            "(Ordering)\nPlace the LCM upgrade operations in the correct sequence:",
            "(Ordering)\nPlace these storage hierarchy components from largest to smallest:",
            "(Ordering)\nArrange these VM snapshot consistency types from least to most application-aware:",
        })
        {
            var q = MakeOrdering(1, ["B", "C"]);
            q.Stem = stem;
            q.IsOrdering.ShouldBeTrue(stem);
        }
    }
}
