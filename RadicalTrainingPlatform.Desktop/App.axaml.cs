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

        if (ApplicationLifetime is IClassicDesktopStyleApplicationLifetime desktop)
        {
            desktop.MainWindow = new MainWindow(Services);
        }

        base.OnFrameworkInitializationCompleted();
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

        // Infrastructure
        services.AddSingleton<IFileProvider, DefaultFileProvider>();

        // Repositories
        services.AddSingleton<IExamRepository>(sp =>
            new MarkdownExamRepository(
                sp.GetRequiredService<IFileProvider>(),
                logger: sp.GetRequiredService<ILogger<MarkdownExamRepository>>()));

        // Parsers
        services.AddSingleton<IQuestionParser>(sp =>
            new QuestionParser(
                sp.GetRequiredService<IExamRepository>(),
                logger: sp.GetRequiredService<ILogger<QuestionParser>>()));

        // Services
        services.AddSingleton<IBlueprintService, HardcodedBlueprintService>();
        services.AddSingleton<IReferenceService, HardcodedReferenceService>();

        return services.BuildServiceProvider();
    }
}
