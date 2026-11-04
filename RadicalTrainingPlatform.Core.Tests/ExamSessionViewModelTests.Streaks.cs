using System.Collections.Generic;
using System.Linq;
using RadicalTrainingPlatform.Core.Models;
using RadicalTrainingPlatform.Core.ViewModels;
using Shouldly;
using Xunit;

namespace RadicalTrainingPlatform.Core.Tests;

public partial class ExamSessionViewModelTests
{
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

    // R-17/TM-85: streak derives from attempt history. A retry of the same
    // item must never inflate it — the old code did _streak++ on every
    // correct submit, so answering Q1 right twice read as a streak of 2.

    [Fact]
    public void Streak_RetryOfSameItemCorrect_DoesNotInflate()
    {
        var questions = new List<Question> { MakeQuestion(1, ["A"]) };
        var vm = new ExamSessionViewModel(questions, "TEST");

        vm.SelectAnswer("A"); vm.Submit();
        vm.Streak.ShouldBe(1);

        vm.JumpTo(0); vm.SelectAnswer("A"); vm.Submit(); // retry, still correct
        vm.Streak.ShouldBe(1, "a retry of one item is still one streak step");
        vm.BestStreak.ShouldBe(1);
    }

    [Fact]
    public void Streak_RetryFlip_CorrectThenWrong_TakesLatestOutcome()
    {
        var questions = new List<Question> { MakeQuestion(1, ["A"]), MakeQuestion(2, ["B"]) };
        var vm = new ExamSessionViewModel(questions, "TEST");

        vm.SelectAnswer("A"); vm.Submit(); vm.Next();  // Q1 correct, streak 1
        vm.SelectAnswer("B"); vm.Submit();             // Q2 correct, streak 2
        vm.Streak.ShouldBe(2);

        vm.JumpTo(0); vm.SelectAnswer("B"); vm.Submit(); // retry Q1 wrong
        vm.Streak.ShouldBe(0, "a miss ends the run even when it is a retry");
        vm.BestStreak.ShouldBe(2, "peak is retained");
    }

    [Fact]
    public void Streak_CountsDistinctItems_SinceLastMiss()
    {
        var questions = new List<Question>
        {
            MakeQuestion(1, ["A"]), MakeQuestion(2, ["B"]), MakeQuestion(3, ["C"]),
        };
        var vm = new ExamSessionViewModel(questions, "TEST");

        vm.SelectAnswer("B"); vm.Submit();             // Q1 wrong
        vm.Streak.ShouldBe(0);
        vm.JumpTo(0); vm.SelectAnswer("A"); vm.Submit(); // Q1 retry correct
        vm.Streak.ShouldBe(1, "one distinct item since the miss");
        vm.Next(); vm.SelectAnswer("B"); vm.Submit();  // Q2 correct
        vm.Streak.ShouldBe(2);
        vm.Next(); vm.SelectAnswer("C"); vm.Submit();  // Q3 correct
        vm.Streak.ShouldBe(3);
        // A later miss ends the run entirely — streak is "since the last miss".
        vm.JumpTo(1); vm.SelectAnswer("A"); vm.Submit(); // Q2 retry wrong
        vm.Streak.ShouldBe(0);
        vm.BestStreak.ShouldBe(3, "peak is retained");
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
}
