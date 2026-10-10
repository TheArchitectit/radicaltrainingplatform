using Microsoft.Extensions.DependencyInjection;
using RadicalTrainingPlatform.Core.Abstractions;
using RadicalTrainingPlatform.Core.Services;

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
        services.AddSingleton<IErrataProvider, JsonErrataStore>();
        // DI selects the greediest ctor, so the registered IErrataProvider above
        // is injected into QuestionParser (errata corrections get applied).
        services.AddSingleton<IQuestionParser, QuestionParser>();
        services.AddSingleton<IManifestLoader, ManifestLoader>();
        // REQ-MAN-04: manifest blueprints take precedence; the hardcoded service
        // is kept as the fallback for legacy exams without manifests.
        services.AddSingleton<HardcodedBlueprintService>();
        services.AddSingleton<IBlueprintService>(sp =>
            new ManifestBlueprintService(
                sp.GetRequiredService<IManifestLoader>(),
                sp.GetRequiredService<HardcodedBlueprintService>()));
        services.AddSingleton<IReferenceService, HardcodedReferenceService>();
        services.AddSingleton<ISessionStore, JsonSessionStore>();
        return services;
    }
}
