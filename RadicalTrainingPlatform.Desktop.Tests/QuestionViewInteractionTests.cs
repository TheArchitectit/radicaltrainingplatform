using System.Collections.Generic;
using System.Linq;
using Avalonia;
using Avalonia.Controls;
using Avalonia.Headless;
using Avalonia.Headless.XUnit;
using Avalonia.Input;
using Avalonia.Interactivity;
using Avalonia.Threading;
using Avalonia.VisualTree;
using Microsoft.Extensions.DependencyInjection;
using RadicalTrainingPlatform.Avalonia;
using RadicalTrainingPlatform.Avalonia.Views;
using RadicalTrainingPlatform.Core;
using RadicalTrainingPlatform.Core.Models;
using RadicalTrainingPlatform.Core.ViewModels;
using Shouldly;
using Xunit;

namespace RadicalTrainingPlatform.Desktop.Tests;

/// <summary>
/// Real pointer/keyboard paths through the question UI. The older smoke tests
/// drive the session VM directly, which is why two interaction defects shipped:
/// the option cards were never wired on a session's first question (mouse
/// clicks were silent no-ops), and Enter was swallowed by a focused nav button.
/// These tests exercise the same entry points a user does: real clicks on real
/// cards, real key events through the input pipeline.
/// </summary>
public class QuestionViewInteractionTests
{
    private static (MainWindow Window, QuestionView View, ExamSessionViewModel Vm) OpenSession()
    {
        var services = new ServiceCollection()
            .AddLogging()
            .AddRadicalTrainingPlatformCore()
            .BuildServiceProvider();

        var window = new MainWindow(services);
        window.Show();
        window.Measure(new Size(1400, 900));
        window.Arrange(new Rect(0, 0, 1400, 900));
        Dispatcher.UIThread.RunJobs();

        // Start a session the way a user does: a real sidebar click.
        window.GetVisualDescendants().OfType<Button>()
              .First(b => (b.Content as string)?.Contains("(") == true && b.Tag is string)
              .RaiseEvent(new RoutedEventArgs(Button.ClickEvent!));
        Dispatcher.UIThread.RunJobs();

        var view = ((Control)window.Content!).GetVisualDescendants().OfType<QuestionView>().First();
        var vm = (ExamSessionViewModel)view.DataContext!;
        return (window, view, vm);
    }

    private static void ClickControl(Window window, Control control)
    {
        var point = control.TranslatePoint(new Point(20, 20), window)!.Value;
        window.MouseDown(point, MouseButton.Left);
        window.MouseUp(point, MouseButton.Left);
        Dispatcher.UIThread.RunJobs();
    }

    [AvaloniaFact]
    public void MouseClick_OnFirstQuestion_SelectsAnAnswer()
    {
        var (window, view, vm) = OpenSession();

        // Regression: wiring was posted once at Render priority, before the
        // ItemsControl materialised its children, so the first question's cards
        // never received a click handler and clicking did nothing.
        ClickControl(window, view.GetVisualDescendants().OfType<OptionCard>().First());

        vm.SelectedAnswers.ShouldNotBeEmpty(
            "clicking an option card on the FIRST question of a session must select it");
        window.Close();
    }

    [AvaloniaFact]
    public void MouseClick_AfterNavigating_SelectsAnAnswer()
    {
        var (window, view, vm) = OpenSession();

        // Provenance: keyboard selection is a different path, so this pins the
        // mouse path specifically on a question reached by navigation.
        window.KeyPress(Key.D1, RawInputModifiers.None, PhysicalKey.Digit1, "1");
        Dispatcher.UIThread.RunJobs();
        vm.Submit();
        Dispatcher.UIThread.RunJobs();

        view.GetVisualDescendants().OfType<Button>()
             .First(b => (b.Content as string)?.Contains("NEXT") == true)
             .RaiseEvent(new RoutedEventArgs(Button.ClickEvent!));
        Dispatcher.UIThread.RunJobs();

        vm.CurrentIndex.ShouldBe(1);
        ClickControl(window, view.GetVisualDescendants().OfType<OptionCard>().First());
        vm.SelectedAnswers.ShouldNotBeEmpty();
        window.Close();
    }

    [AvaloniaFact]
    public void Enter_WithNavButtonFocused_SubmitsInsteadOfAdvancing()
    {
        var (window, view, vm) = OpenSession();

        window.KeyPress(Key.D1, RawInputModifiers.None, PhysicalKey.Digit1, "1");
        Dispatcher.UIThread.RunJobs();
        vm.Submit();
        Dispatcher.UIThread.RunJobs();

        // A mouse click on NEXT leaves focus on that button. The next question
        // is unanswered, so Enter must submit it — not silently advance again
        // by activating a nav button that happens to hold focus.
        view.GetVisualDescendants().OfType<Button>()
             .First(b => (b.Content as string)?.Contains("NEXT") == true)
             .RaiseEvent(new RoutedEventArgs(Button.ClickEvent!));
        Dispatcher.UIThread.RunJobs();

        var indexBefore = vm.CurrentIndex;
        vm.CurrentIndex.ShouldBe(1);
        vm.IsSubmitted.ShouldBeFalse("next question should start unanswered");

        window.KeyPress(Key.D1, RawInputModifiers.None, PhysicalKey.Digit1, "1");
        Dispatcher.UIThread.RunJobs();
        vm.SelectedAnswers.ShouldNotBeEmpty();

        window.KeyPress(Key.Enter, RawInputModifiers.None, PhysicalKey.Enter, "\r");
        Dispatcher.UIThread.RunJobs();

        vm.IsSubmitted.ShouldBeTrue("Enter must submit the current question");
        vm.CurrentIndex.ShouldBe(indexBefore, "Enter must not advance the question");
        window.Close();
    }

    [AvaloniaFact]
    public void Enter_WithNextButtonFocused_DoesNotAdvanceTheQuestion()
    {
        var (window, view, vm) = OpenSession();

        window.KeyPress(Key.D1, RawInputModifiers.None, PhysicalKey.Digit1, "1");
        Dispatcher.UIThread.RunJobs();
        vm.Submit();
        Dispatcher.UIThread.RunJobs();

        // Put focus directly on NEXT, as it would be after a pointer click.
        view.GetVisualDescendants().OfType<Button>()
             .First(b => (b.Content as string)?.Contains("NEXT") == true)
             .Focus();
        Dispatcher.UIThread.RunJobs();

        var indexBefore = vm.CurrentIndex;
        window.KeyPress(Key.Enter, RawInputModifiers.None, PhysicalKey.Enter, "\r");
        Dispatcher.UIThread.RunJobs();

        vm.CurrentIndex.ShouldBe(indexBefore,
            "Enter must not be eaten by the focused NEXT button and advance the question");
        window.Close();
    }

    [AvaloniaFact]
    public void ReviewThenSameExamClick_ResumesTheStudySession()
    {
        var (window, _, vm) = OpenSession();

        var q = vm.CurrentQuestion;
        vm.SelectAnswer(q.Options.Select(o => o.Letter).First(l => !q.CorrectAnswers.Contains(l)));
        vm.Submit();
        Dispatcher.UIThread.RunJobs();
        vm.AnsweredCount.ShouldBe(1);

        window.GetVisualDescendants().OfType<Button>()
              .First(b => (b.Content as string) == "Review")
              .RaiseEvent(new RoutedEventArgs(Button.ClickEvent!));
        Dispatcher.UIThread.RunJobs();

        var reviewVm = (ExamSessionViewModel)((Control)window.Content!).GetVisualDescendants()
            .OfType<QuestionView>().First().DataContext!;
        reviewVm.ExamCode.ShouldNotBe(vm.ExamCode, "the review VM is a distinct throwaway session");

        // Click the studied exam in Quick Launch while still reviewing.
        var studyCode = vm.ExamCode;
        window.GetVisualDescendants().OfType<Button>()
              .First(b => (b.Tag as string) == studyCode)
              .RaiseEvent(new RoutedEventArgs(Button.ClickEvent!));
        Dispatcher.UIThread.RunJobs();

        // Regression: this used to build a FRESH session, silently discarding
        // the score, streak, and answered questions.
        var after = (ExamSessionViewModel)((Control)window.Content!).GetVisualDescendants()
            .OfType<QuestionView>().First().DataContext!;
        after.AnsweredCount.ShouldBe(1,
            "clicking the studied exam from review must resume it, not restart it");
        window.Close();
    }

    private static (Window Window, QuestionView View, ExamSessionViewModel Vm) HostOrderingQuestion()
    {
        // Standalone host: an ordering question needs the card to show the
        // learner their pick order, which no session-derived test can reach.
        var question = new Question
        {
            Id = 1,
            ExamCode = "TEST",
            Stem = "(Ordering)\nPlace these steps in order:",
            CorrectAnswers = new List<string> { "B", "C", "A" },
            Options = new List<AnswerOption>
            {
                new() { Letter = "A", Text = "Third" },
                new() { Letter = "B", Text = "First" },
                new() { Letter = "C", Text = "Second" },
            },
        };

        var vm = new ExamSessionViewModel(new List<Question> { question }, "TEST");
        var view = new QuestionView { DataContext = vm };

        var window = new Window { Content = view, Width = 900, Height = 700 };
        window.Show();
        window.Measure(new Size(900, 700));
        window.Arrange(new Rect(0, 0, 900, 700));
        Dispatcher.UIThread.RunJobs();
        return (window, view, vm);
    }

    [AvaloniaFact]
    public void OrderingQuestion_ShowsPickOrderOnTheCards()
    {
        var (window, view, vm) = HostOrderingQuestion();
        var cards = view.GetVisualDescendants().OfType<OptionCard>()
                        .ToDictionary(c => c.Letter, c => c);

        // The hint must tell the learner the click order is the answer.
        var hint = view.GetVisualDescendants().OfType<TextBlock>()
                       .First(t => t.Name == "MultiSelectHint");
        hint.IsVisible.ShouldBeTrue("sequence questions are still multi-select");
        hint.Text!.Contains("order").ShouldBeTrue(
            "the learner must be told clicks define order");

        // Click in the required order: B then C then A.
        foreach (var letter in new[] { "B", "C", "A" })
            ClickControl(window, cards[letter]);

        vm.SelectedOrder.ShouldBe(new[] { "B", "C", "A" });
        cards["B"].SelectionIndex.ShouldBe(1);
        cards["C"].SelectionIndex.ShouldBe(2);
        cards["A"].SelectionIndex.ShouldBe(3);
        cards["B"].LetterDisplay.ShouldBe("1", "the letter circle must show the pick position");
        cards["A"].LetterDisplay.ShouldBe("3");

        // The key is B,C,A, so clicking them in that order must grade correct.
        vm.Submit();
        vm.IsCorrect.ShouldBeTrue();
        window.Close();
    }

    [AvaloniaFact]
    public void OrderingQuestion_UndonePickClearsItsPosition()
    {
        var (window, view, vm) = HostOrderingQuestion();
        var cards = view.GetVisualDescendants().OfType<OptionCard>()
                        .ToDictionary(c => c.Letter, c => c);

        void Click(string letter) => ClickControl(window, cards[letter]);

        Click("B");
        Click("C");
        vm.SelectedOrder.ShouldBe(new[] { "B", "C" });

        // Clicking a picked option removes it; the rest shift up so the
        // displayed positions stay contiguous.
        Click("C");
        vm.SelectedOrder.ShouldBe(new[] { "B" });
        cards["C"].SelectionIndex.ShouldBe(0);
        cards["C"].LetterDisplay.ShouldBe("C", "an unpicked card falls back to its letter");

        Click("C");
        vm.SelectedOrder.ShouldBe(new[] { "B", "C" });
        cards["C"].SelectionIndex.ShouldBe(2);

        // A partial sequence must not grade as correct.
        vm.Submit();
        vm.IsCorrect.ShouldBeFalse();
        window.Close();
    }
}
