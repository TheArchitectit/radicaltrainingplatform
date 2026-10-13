using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
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
        // PKG-01: the bundle is what tells the app which content it shipped.
        // Registered before the services that consume it so DI's greediest-ctor
        // selection injects it into the repository and the errata store.
        services.AddSingleton<IContentBundle, ContentBundle>();
        services.AddSingleton<IExamRepository, MarkdownExamRepository>();
        services.AddSingleton<IErrataProvider, JsonErrataStore>();
        services.AddSingleton<ILessonCatalog, BundleLessonCatalog>();
        // DI selects the greediest ctor, so the registered IErrataProvider above
        // is injected into QuestionParser (errata corrections get applied).
        services.AddSingleton<IQuestionParser, QuestionParser>();

        // S27-08: plugins are discovered once, at startup, before anything that
        // reads manifests. Discovery validates each pack and the built-in tree
        // together, so a pack that collides with shipped content is rejected by
        // name instead of surfacing later as a duplicate-ID exception.
        services.AddSingleton<PluginValidator>();
        services.AddSingleton<IPluginLoader>(sp =>
        {
            var discovery = new PluginDiscovery(
                sp.GetRequiredService<IFileProvider>(),
                sp.GetRequiredService<PluginValidator>(),
                sp.GetRequiredService<IExamRepository>(),
                sp.GetService<ILogger<PluginDiscovery>>());
            discovery.Discover();
            return discovery;
        });

        services.AddSingleton<IManifestLoader, ManifestLoader>();

        // REQ-MAN-04: manifest blueprints take precedence; the hardcoded service
        // is kept as the fallback for legacy exams without manifests. S27-02
        // turns the manifest source into one provider among several, so a vendor
        // pack plugs in here without the service learning about plugins.
        services.AddSingleton<HardcodedBlueprintService>();
        services.AddSingleton<IBlueprintProvider, ManifestBlueprintProvider>();
        services.AddSingleton<IBlueprintService>(sp =>
            new ManifestBlueprintService(
                sp.GetServices<IBlueprintProvider>(),
                sp.GetRequiredService<HardcodedBlueprintService>()));

        // S27-03: the built-in corpus is one provider; the catalog routes a
        // question to the providers that claim its exam, then falls back.
        services.AddSingleton<HardcodedReferenceService>();
        services.AddSingleton<IReferenceProvider>(sp =>
            new BuiltInReferenceProvider(sp.GetRequiredService<HardcodedReferenceService>()));
        services.AddSingleton<IReferenceService>(sp =>
            new ReferenceProviderCatalog(
                sp.GetServices<IReferenceProvider>(),
                sp.GetRequiredService<HardcodedReferenceService>()));

        // S27-01: the catalog is what consumers resolve; leaf providers are
        // listed explicitly so the catalog never enumerates itself.
        services.AddSingleton<ManifestExamMetadataProvider>();
        services.AddSingleton<IExamMetadataProvider>(sp =>
            new ExamMetadataCatalog(new IExamMetadataProvider[]
            {
                sp.GetRequiredService<ManifestExamMetadataProvider>(),
            }));

        services.AddSingleton<ISessionStore, JsonSessionStore>();
        return services;
    }
}
