using Microsoft.Extensions.DependencyInjection;
using RadicalTrainingPlatform.Core.Abstractions;

namespace RadicalTrainingPlatform.Core;

/// <summary>
/// Composition root for the Core services. UI projects (Desktop, WinForms)
/// call this instead of duplicating registrations; Core.Tests exercises it
/// so a broken/missing registration fails CI, not app launch.
/// </summary>
public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddRadicalTrainingPlatformCore(this IServiceCollection services)
    {
        services.AddSingleton<IFileProvider, DefaultFileProvider>();
        services.AddSingleton<IExamRepository, MarkdownExamRepository>();
        services.AddSingleton<IQuestionParser, QuestionParser>();
        services.AddSingleton<IBlueprintService, HardcodedBlueprintService>();
        services.AddSingleton<IReferenceService, HardcodedReferenceService>();
        services.AddSingleton<ISessionStore, JsonSessionStore>();
        return services;
    }
}
