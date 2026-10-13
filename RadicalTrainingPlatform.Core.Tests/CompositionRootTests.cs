using Microsoft.Extensions.DependencyInjection;
using RadicalTrainingPlatform.Core;
using RadicalTrainingPlatform.Core.Abstractions;
using RadicalTrainingPlatform.Core.Services;
using Shouldly;
using Xunit;

namespace RadicalTrainingPlatform.Core.Tests;

/// <summary>
/// Exercises the Core composition root. Without this, a typo'd or missing
/// registration (the failure mode that crashed app launch, not CI) would
/// never be caught — the Desktop app builds its container at startup and
/// nothing tested that path.
/// </summary>
public class CompositionRootTests
{
    [Fact]
    public void AddRadicalTrainingPlatformCore_ResolvesEveryService()
    {
        var provider = new ServiceCollection()
            .AddRadicalTrainingPlatformCore()
            .BuildServiceProvider();

        provider.GetRequiredService<IFileProvider>().ShouldBeAssignableTo<DefaultFileProvider>();
        // PKG-01: the bundle is what the app boots against.
        provider.GetRequiredService<IContentBundle>().ShouldBeAssignableTo<ContentBundle>();
        provider.GetRequiredService<ILessonCatalog>().ShouldBeAssignableTo<BundleLessonCatalog>();
        provider.GetRequiredService<IExamRepository>().ShouldBeAssignableTo<MarkdownExamRepository>();
        provider.GetRequiredService<IQuestionParser>().ShouldBeAssignableTo<QuestionParser>();
        provider.GetRequiredService<IManifestLoader>().ShouldBeAssignableTo<ManifestLoader>();
        // REQ-MAN-04: the IBlueprintService surface is the manifest-first service;
        // the hardcoded service remains resolvable as the legacy fallback.
        provider.GetRequiredService<IBlueprintService>().ShouldBeAssignableTo<ManifestBlueprintService>();
        provider.GetRequiredService<HardcodedBlueprintService>().ShouldBeAssignableTo<HardcodedBlueprintService>();
        // S27-03: the reference surface is now the provider catalog; the
        // hardcoded corpus stays resolvable as the built-in provider's inner.
        provider.GetRequiredService<IReferenceService>().ShouldBeAssignableTo<ReferenceProviderCatalog>();
        provider.GetRequiredService<HardcodedReferenceService>().ShouldBeAssignableTo<HardcodedReferenceService>();
        provider.GetRequiredService<ISessionStore>().ShouldBeAssignableTo<JsonSessionStore>();
        provider.GetRequiredService<IErrataProvider>().ShouldBeAssignableTo<JsonErrataStore>();
    }

    [Fact]
    public void PluginLayer_ResolvesAndHasDiscovered()
    {
        // S27-01..09: every new extension point resolves from a bare container.
        // The assertions below hold in any working directory, so this test says
        // "the layer is wired", not "this machine happens to have content" —
        // discovery's own behaviour is pinned in PluginDiscoveryTests.
        var provider = new ServiceCollection()
            .AddRadicalTrainingPlatformCore()
            .BuildServiceProvider();

        provider.GetRequiredService<IBlueprintProvider>().ShouldBeAssignableTo<ManifestBlueprintProvider>();
        provider.GetRequiredService<IExamMetadataProvider>().ShouldBeAssignableTo<ExamMetadataCatalog>();
        provider.GetRequiredService<PluginValidator>().ShouldBeAssignableTo<PluginValidator>();

        var plugins = provider.GetRequiredService<IPluginLoader>();
        // Discovery has run: the loader's own construction depends on the
        // plugin roots, so a lazily-populated list would read as "no plugins".
        Should.NotThrow(() => plugins.Discover());
        foreach (var plugin in plugins.Plugins)
        {
            plugin.PluginId.ShouldNotBeNullOrWhiteSpace();
            plugin.ContentSearchRoot.ShouldNotBeNullOrWhiteSpace();
        }
        foreach (var rejected in plugins.Rejected)
            rejected.Errors.ShouldNotBeEmpty();
    }

    [Fact]
    public void Registrations_AreSingletons()
    {
        var provider = new ServiceCollection()
            .AddRadicalTrainingPlatformCore()
            .BuildServiceProvider();

        provider.GetRequiredService<IBlueprintService>()
            .ShouldBeSameAs(provider.GetRequiredService<IBlueprintService>());
        provider.GetRequiredService<IQuestionParser>()
            .ShouldBeSameAs(provider.GetRequiredService<IQuestionParser>());
    }

    [Fact]
    public void ContainerBuilds_WithoutLoggingConfigured()
    {
        // The ctors take optional ILogger<T>; the container must still resolve
        // them when no logging is registered (Desktop registers it separately,
        // but a bare container must not throw).
        var provider = new ServiceCollection()
            .AddRadicalTrainingPlatformCore()
            .BuildServiceProvider();

        var parser = provider.GetRequiredService<IQuestionParser>();
        Should.NotThrow(() => parser.BuildCatalog());
    }
}
