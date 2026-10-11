using System;
using System.Linq;
using Avalonia.Controls;
using Avalonia.Headless.XUnit;
using Avalonia.Interactivity;
using Avalonia.Threading;
using Avalonia.VisualTree;
using Microsoft.Extensions.DependencyInjection;
using RadicalTrainingPlatform.Avalonia;
using RadicalTrainingPlatform.Avalonia.LabSimulator;
using RadicalTrainingPlatform.Core;
using Shouldly;
using Xunit;

namespace RadicalTrainingPlatform.Desktop.Tests;

/// <summary>
/// TM-84 / R-16 / NET-07 — disposal guards on the cached simulator path.
///
/// The audit defect: MainWindow disposed LabSimulatorView on navigate but
/// left _labView cached; the next Lab Simulator click reused a dead host
/// (OnLoaded silently refused to start → blank screen). Two layers now:
///  1. Ownership — keep-alive across navigation, dispose once on window close.
///  2. Guard — reuse-after-dispose throws ObjectDisposedException loudly
///     rather than acting on a dead host.
///
/// The native second-visit check is prescribed-but-not-yet-executed evidence
/// (no display server in CI); these unit fixtures prove the managed guard.
/// </summary>
public class DisposalGuardTests
{
    // ─── CefBridge: Call / PostToJs must throw after Dispose ─────────

    private static CefBridge MakeBridge()
    {
        var services = new ServiceCollection()
            .AddLogging()
            .AddRadicalTrainingPlatformCore()
            .BuildServiceProvider();
        return new CefBridge(
            _ => { },
            services.GetRequiredService<Core.Abstractions.IQuestionParser>(),
            services.GetRequiredService<ISessionStore>());
    }

    [Fact]
    public void CefBridge_CallAfterDispose_Throws()
    {
        var bridge = MakeBridge();
        bridge.Dispose();
        Should.Throw<ObjectDisposedException>(() =>
            bridge.Call("{\"type\":\"ping\",\"id\":\"x\"}"));
    }

    [Fact]
    public void CefBridge_PostToJsAfterDispose_Throws()
    {
        var bridge = MakeBridge();
        bridge.Dispose();
        Should.Throw<ObjectDisposedException>(() =>
            bridge.PostToJs("ping", new { }));
    }

    [Fact]
    public void CefBridge_Dispose_IsIdempotent()
    {
        var bridge = MakeBridge();
        bridge.Dispose();
        Should.NotThrow(() => bridge.Dispose());
    }

    [Fact]
    public void CefBridge_CallBeforeDispose_Works()
    {
        var bridge = MakeBridge();
        try
        {
            // unknown type posts an error response and returns null — the
            // point is that it does NOT throw while alive.
            Should.NotThrow(() => bridge.Call("{\"type\":\"nosuch\",\"id\":\"x\"}"));
        }
        finally
        {
            bridge.Dispose();
        }
    }

    // ─── LabSimulatorView: public surface must throw after Dispose ──

    [AvaloniaFact]
    public void LabSimulatorView_ExecuteScriptAfterDispose_Throws()
    {
        var view = new LabSimulatorView();
        view.Dispose();
        view.IsDisposed.ShouldBeTrue();
        Should.Throw<ObjectDisposedException>(() => view.ExecuteScript("1+1"));
    }

    [AvaloniaFact]
    public void LabSimulatorView_Dispose_IsIdempotent()
    {
        var view = new LabSimulatorView();
        view.Dispose();
        Should.NotThrow(() => view.Dispose());
        view.IsDisposed.ShouldBeTrue();
    }

    [AvaloniaFact]
    public void LabSimulatorView_ReattachAfterDispose_Throws()
    {
        // NET-07's exact failure mode: a disposed instance is cached and
        // handed back to the visual tree. OnLoaded must fail loudly.
        // Raise Loaded synchronously: Show() schedules it on the dispatcher,
        // which turns the throw into an unobserved task exception the test
        // cannot observe (Avalonia swallows handler faults at that layer).
        var view = new LabSimulatorView();
        view.Dispose();

        Should.Throw<ObjectDisposedException>(() =>
            view.RaiseEvent(new RoutedEventArgs(Control.LoadedEvent!)));
    }

    [AvaloniaFact]
    public void LabSimulatorView_FreshInstance_IsNotDisposed()
    {
        var view = new LabSimulatorView();
        view.IsDisposed.ShouldBeFalse();
        Should.NotThrow(() => view.ExecuteScript("1+1")); // no browser yet — no-op
    }

    // ─── MainWindow ownership: keep-alive across navigation ──────────

    private static MainWindow OpenWindow()
    {
        var services = new ServiceCollection()
            .AddLogging()
            .AddRadicalTrainingPlatformCore()
            .BuildServiceProvider();
        var window = new MainWindow(services);
        window.Show();
        window.Measure(new global::Avalonia.Size(1400, 900));
        window.Arrange(new global::Avalonia.Rect(0, 0, 1400, 900));
        Dispatcher.UIThread.RunJobs();
        return window;
    }

    private static Button FindButton(MainWindow window, string content) =>
        window.GetVisualDescendants().OfType<Button>()
              .FirstOrDefault(b => (b.Content as string)?.Contains(content) == true)!;

    [AvaloniaFact]
    public void MainWindow_LabView_SurvivesNavigation_NotDisposed()
    {
        var window = OpenWindow();

        var labBtn = FindButton(window, "Lab Simulator");
        labBtn.ShouldNotBeNull("Lab Simulator button missing from sidebar");
        labBtn.RaiseEvent(new RoutedEventArgs(Button.ClickEvent!));

        var lab1 = window.GetVisualDescendants().OfType<LabSimulatorView>().FirstOrDefault();
        lab1.ShouldNotBeNull("Lab Simulator click did not show the view");
        lab1!.IsDisposed.ShouldBeFalse();

        // Navigate away (exam sidebar) then back.
        var examBtn = window.GetVisualDescendants().OfType<Button>()
                            .FirstOrDefault(b => (b.Content as string)?.Contains("(") == true
                                              && b.Tag is string);
        examBtn.ShouldNotBeNull();
        examBtn!.RaiseEvent(new RoutedEventArgs(Button.ClickEvent!));

        labBtn.RaiseEvent(new RoutedEventArgs(Button.ClickEvent!));
        var lab2 = window.GetVisualDescendants().OfType<LabSimulatorView>().FirstOrDefault();
        lab2.ShouldNotBeNull("returning to Lab Simulator must show a live view");
        lab2!.IsDisposed.ShouldBeFalse(
            "NET-07: the cached lab view must not be a disposed instance");
        ReferenceEquals(lab1, lab2).ShouldBeTrue(
            "keep-alive policy: the same live instance is reused across navigation");
    }

    [AvaloniaFact]
    public void MainWindow_LabCache_NeverHandsOutDisposedInstance()
    {
        var window = OpenWindow();
        var labBtn = FindButton(window, "Lab Simulator");
        labBtn.RaiseEvent(new RoutedEventArgs(Button.ClickEvent!));

        var lab = window.GetVisualDescendants().OfType<LabSimulatorView>().First();
        // Simulate an out-of-band dispose (the pre-fix ReleaseCurrentView did
        // exactly this while leaving the cache populated).
        lab.Dispose();

        labBtn.RaiseEvent(new RoutedEventArgs(Button.ClickEvent!));
        var again = window.GetVisualDescendants().OfType<LabSimulatorView>().First();
        again.IsDisposed.ShouldBeFalse(
            "a disposed cached instance must be replaced, never re-shown");
        ReferenceEquals(lab, again).ShouldBeFalse(
            "the dead instance must be dropped from the cache");
    }

    [AvaloniaFact]
    public void MainWindow_WindowClose_DisposesLabView()
    {
        var window = OpenWindow();
        var labBtn = FindButton(window, "Lab Simulator");
        labBtn.RaiseEvent(new RoutedEventArgs(Button.ClickEvent!));
        var lab = window.GetVisualDescendants().OfType<LabSimulatorView>().First();

        window.Close();
        Dispatcher.UIThread.RunJobs();

        lab.IsDisposed.ShouldBeTrue("window close is the single dispose point");
    }
}
