using System.Linq;
using Avalonia.Controls;
using Avalonia.Headless.XUnit;
using Avalonia.Interactivity;
using Avalonia.VisualTree;
using Microsoft.Extensions.DependencyInjection;
using RadicalTrainingPlatform.Avalonia;
using RadicalTrainingPlatform.Avalonia.Views;
using RadicalTrainingPlatform.Core;
using RadicalTrainingPlatform.Core.ViewModels;
using Shouldly;
using Xunit;

namespace RadicalTrainingPlatform.Desktop.Tests;

/// <summary>
/// Boots the REAL App + MainWindow headless (no display) and drives the paths
/// that were crashing or dead: XAML load under aligned Avalonia 12.1.3, DI at
/// startup, and the Review-button flow that used to NullReferenceException on
/// every reachable click (ReleaseCurrentView nulled _session, then the handler
/// dereferenced _session.ExamCode).
///
/// Sessions start by clicking a real sidebar button (real routed event → real
/// OnSidebarExamClicked → real StartSession). Answer submission goes through
/// the session VM directly — the same public calls OptionCard clicks make —
/// because pointer-input simulation adds no coverage of OUR code.
/// </summary>
public class MainWindowSmokeTests
{
    private static (MainWindow Window, ExamSessionViewModel Vm) OpenMainWindowWithSession()
    {
        var services = new ServiceCollection()
            .AddLogging()
            .AddRadicalTrainingPlatformCore()
            .BuildServiceProvider();

        var window = new MainWindow(services);
        window.Show();
        // Headless: Loaded fires during the first layout pass — force one.
        window.Measure(new global::Avalonia.Size(1400, 900));
        window.Arrange(new global::Avalonia.Rect(0, 0, 1400, 900));
        global::Avalonia.Threading.Dispatcher.UIThread.RunJobs();

        var sidebar = window.GetVisualDescendants()
                            .OfType<ItemsControl>().FirstOrDefault();
        var examButton = window.GetVisualDescendants().OfType<Button>()
                               .FirstOrDefault(b => (b.Content as string)?.Contains("(") == true
                                                 && b.Tag is string);
        examButton.ShouldNotBeNull(
            "MainWindow.Loaded did not populate sidebar exam buttons — real .md discovery failed");
        examButton.RaiseEvent(new RoutedEventArgs(Button.ClickEvent!));

        var vm = (window.Content as Control)!.GetVisualDescendants()
                   .OfType<QuestionView>().FirstOrDefault()
                   ?.DataContext as ExamSessionViewModel;
        vm.ShouldNotBeNull("sidebar click did not start a session with a QuestionView");
        return (window, vm);
    }

    private static Button FindButton(Window window, string content) =>
        window.GetVisualDescendants().OfType<Button>()
              .FirstOrDefault(b => (b.Content as string)?.Contains(content) == true)!;

    private static void SubmitWrongAnswer(ExamSessionViewModel vm)
    {
        var q = vm.CurrentQuestion;
        var wrongLetter = q.Options.Select(o => o.Letter)
                                   .First(l => !q.CorrectAnswers.Contains(l));
        vm.SelectAnswer(wrongLetter);
        // NB Submit() returns whether the answer was CORRECT (a wrong answer
        // returns false) — assert state, not the return value.
        vm.Submit();
        vm.IsSubmitted.ShouldBeTrue();
        vm.WrongCount.ShouldBe(1);
    }

    [AvaloniaFact]
    public void AppAndMainWindow_Load_XamlAndDiIntact()
    {
        var (window, vm) = OpenMainWindowWithSession();
        window.IsLoaded.ShouldBeTrue();
        // Synthwave resources resolved from the real App.axaml — guards the
        // Avalonia package-version skew that builds fine but dies at load.
        window.FindResource("NeonPurpleBrush").ShouldNotBeNull();
        vm.TotalQuestions.ShouldBeGreaterThan(0);
        window.Close();
    }

    [AvaloniaFact]
    public void Review_WithWrongAnswer_DoesNotCrash_AndOffersBackToStudy()
    {
        var (window, vm) = OpenMainWindowWithSession();
        SubmitWrongAnswer(vm);

        var review = FindButton(window, "Review");
        review.ShouldNotBeNull();
        // The old code threw an unhandled NRE here. Must not throw.
        Should.NotThrow(() => review.RaiseEvent(new RoutedEventArgs(Button.ClickEvent!)));

        // Review mode engaged: button flipped to the Back-to-Study affordance
        // (finding: no UI path out of review existed at all).
        FindButton(window, "Back to Study").ShouldNotBeNull();
        window.Close();
    }

    [AvaloniaFact]
    public void BackToStudy_FromReview_ResumesOriginalSession()
    {
        var (window, vm) = OpenMainWindowWithSession();
        SubmitWrongAnswer(vm);

        FindButton(window, "Review").RaiseEvent(new RoutedEventArgs(Button.ClickEvent!));
        var inReview = window.GetVisualDescendants().OfType<QuestionView>().First().DataContext as ExamSessionViewModel;
        inReview!.ExamCode.ShouldBe(vm.ExamCode + " (Review)");

        FindButton(window, "Back to Study").RaiseEvent(new RoutedEventArgs(Button.ClickEvent!));

        FindButton(window, "Review").ShouldNotBeNull(); // label restored
        var resumed = window.GetVisualDescendants().OfType<QuestionView>().First().DataContext as ExamSessionViewModel;
        resumed!.ExamCode.ShouldBe(vm.ExamCode);        // original session, not the review VM
        resumed.WrongCount.ShouldBe(1);                 // its state survived the detour
        window.Close();
    }
}
