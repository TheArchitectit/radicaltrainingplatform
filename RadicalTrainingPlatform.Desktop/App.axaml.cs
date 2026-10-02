using Avalonia;
using Avalonia.Controls.ApplicationLifetimes;
using Avalonia.Markup.Xaml;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using RadicalTrainingPlatform.Core;
using RadicalTrainingPlatform.Core.Abstractions;

namespace RadicalTrainingPlatform.Avalonia;

public partial class App : Application
{
    /// <summary>
    /// Global service provider for the application.
    /// Access via <c>((App)Application.Current).Services</c> or inject via DI.
    /// </summary>
    public IServiceProvider Services { get; private set; } = null!; // Set in OnFrameworkInitializationCompleted

    public override void Initialize()
    {
        AvaloniaXamlLoader.Load(this);
    }

    public override void OnFrameworkInitializationCompleted()
    {
        Services = ConfigureServices();
        InstallGlobalExceptionHandlers();

        if (ApplicationLifetime is IClassicDesktopStyleApplicationLifetime desktop)
        {
            desktop.MainWindow = new MainWindow(Services);
        }

        base.OnFrameworkInitializationCompleted();
    }

    /// <summary>
    /// Last-resort handlers: an unhandled UI-thread exception used to tear the
    /// process down with no trace (e.g. the Review-button NRE). Log loudly and
    /// keep the window alive where possible.
    /// </summary>
    private void InstallGlobalExceptionHandlers()
    {
        var log = Services.GetRequiredService<ILoggerFactory>()
                               .CreateLogger("RadicalTrainingPlatform.Unhandled");

        global::Avalonia.Threading.Dispatcher.UIThread.UnhandledException += (_, e) =>
        {
            log.LogError(e.Exception, "Unhandled exception on UI thread");
            e.Handled = true; // keep the app alive; the operation itself is lost
        };
        AppDomain.CurrentDomain.UnhandledException += (_, e) =>
            log.LogError(e.ExceptionObject as Exception, "Unhandled exception on background thread");
        System.Threading.Tasks.TaskScheduler.UnobservedTaskException += (_, e) =>
        {
            log.LogError(e.Exception, "Unobserved task exception");
            e.SetObserved();
        };
    }

    private static IServiceProvider ConfigureServices()
    {
        var services = new ServiceCollection();

        // Logging
        services.AddLogging(builder =>
        {
            builder.AddConsole();
            builder.SetMinimumLevel(LogLevel.Information);
            builder.AddFilter("RadicalTrainingPlatform", LogLevel.Debug);
        });

        // Core composition root (shared with WinForms and Core.Tests)
        services.AddRadicalTrainingPlatformCore();

        return services.BuildServiceProvider();
    }
}
