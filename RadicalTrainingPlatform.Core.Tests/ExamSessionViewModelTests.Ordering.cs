using System.Collections.Generic;
using System.Linq;
using RadicalTrainingPlatform.Core.Models;
using RadicalTrainingPlatform.Core.ViewModels;
using Shouldly;
using Xunit;

namespace RadicalTrainingPlatform.Core.Tests;

public partial class ExamSessionViewModelTests
{
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

    // ─── Retry accounting (R-04/R-14/D9, TM-18) ───────────────────

    // A retry must move the item's key between the correct and wrong sets —
    // the pre-repair code added without removing, so one question could be
    // Correct AND Wrong, inflating both counts past the number of answered items.

    [Fact]
    public void Retry_PassThenFail_FirstAttemptStaysCorrect_LatestBecomesWrong()
    {
        var questions = new List<Question>
        {
            MakeQuestion(1, ["A"]),
            MakeQuestion(2, ["B"]),
        };
        var vm = new ExamSessionViewModel(questions, "TEST");

        // First attempt: correct.
        vm.SelectAnswer("A");
        vm.Submit().ShouldBeTrue();
        vm.CorrectCount.ShouldBe(1);
        vm.FirstAttemptCorrectCount.ShouldBe(1);

        // Retry the same item (JumpTo resets the submission state) and miss it.
        vm.JumpTo(0);
        vm.IsSubmitted.ShouldBeFalse();
        vm.SelectAnswer("B");
        vm.Submit().ShouldBeFalse();

        // Latest outcome = wrong; first-attempt metric is immutable.
        vm.CorrectCount.ShouldBe(0);
        vm.WrongCount.ShouldBe(1);
        vm.FirstAttemptCorrectCount.ShouldBe(1);
    }

    [Fact]
    public void Retry_FailThenPass_FirstAttemptStaysWrong_LatestBecomesCorrect()
    {
        var questions = new List<Question>
        {
            MakeQuestion(1, ["A"]),
            MakeQuestion(2, ["B"]),
        };
        var vm = new ExamSessionViewModel(questions, "TEST");

        // First attempt: wrong.
        vm.SelectAnswer("B");
        vm.Submit().ShouldBeFalse();
        vm.WrongCount.ShouldBe(1);
        vm.FirstAttemptCorrectCount.ShouldBe(0);

        // Retry and get it right.
        vm.JumpTo(0);
        vm.SelectAnswer("A");
        vm.Submit().ShouldBeTrue();

        // Latest outcome = correct; first attempt stays a miss.
        vm.CorrectCount.ShouldBe(1);
        vm.WrongCount.ShouldBe(0);
        vm.FirstAttemptCorrectCount.ShouldBe(0);
    }

    [Fact]
    public void Retry_ItemNeverCountedInBothSets()
    {
        var questions = new List<Question>
        {
            MakeQuestion(1, ["A"]),
            MakeQuestion(2, ["B"]),
            MakeQuestion(3, ["C"]),
        };
        var vm = new ExamSessionViewModel(questions, "TEST");

        // Flip the same item's outcome three times across retries.
        vm.SelectAnswer("A");
        vm.Submit();
        vm.JumpTo(0); vm.SelectAnswer("B"); vm.Submit();
        vm.JumpTo(0); vm.SelectAnswer("C"); vm.Submit();
        vm.JumpTo(0); vm.SelectAnswer("A"); vm.Submit();

        // D9 invariant: unique answered items ≤ total questions, always.
        (vm.CorrectCount + vm.WrongCount).ShouldBeLessThanOrEqualTo(vm.TotalQuestions);
        // Latest outcome after the final flip = correct, exactly one answered item.
        vm.CorrectCount.ShouldBe(1);
        vm.WrongCount.ShouldBe(0);
    }

    [Fact]
    public void Retry_AcrossMultipleItems_NoInflation()
    {
        var questions = new List<Question>
        {
            MakeQuestion(1, ["A"]),
            MakeQuestion(2, ["B"]),
        };
        var vm = new ExamSessionViewModel(questions, "TEST");

        // Q1 passes; Q2 fails then passes on retry.
        vm.SelectAnswer("A"); vm.Submit();
        vm.Next();
        vm.SelectAnswer("C"); vm.Submit();
        vm.JumpTo(1); vm.SelectAnswer("B"); vm.Submit();

        vm.CorrectCount.ShouldBe(2);
        vm.WrongCount.ShouldBe(0);
        vm.FirstAttemptCorrectCount.ShouldBe(1); // only Q1 was a first-attempt win
        vm.GetDomainStats().Sum(d => d.Answered).ShouldBe(2); // 2 items answered, not 3
    }

    [Fact]
    public void Skip_AfterCorrect_FirstAttemptWinsAreRetained()
    {
        var questions = new List<Question>
        {
            MakeQuestion(1, ["A"]),
            MakeQuestion(2, ["B"]),
        };
        var vm = new ExamSessionViewModel(questions, "TEST");

        vm.SelectAnswer("A"); vm.Submit();
        vm.Skip(); // skips Q1's latest outcome into wrong — first attempt stays a win

        vm.FirstAttemptCorrectCount.ShouldBe(1);
        vm.CorrectCount.ShouldBe(0);
        vm.WrongCount.ShouldBe(1);
    }
}
