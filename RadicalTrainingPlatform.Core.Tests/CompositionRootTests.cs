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
        provider.GetRequiredService<IExamRepository>().ShouldBeAssignableTo<MarkdownExamRepository>();
        provider.GetRequiredService<IQuestionParser>().ShouldBeAssignableTo<QuestionParser>();
        provider.GetRequiredService<IManifestLoader>().ShouldBeAssignableTo<ManifestLoader>();
        // REQ-MAN-04: the IBlueprintService surface is the manifest-first service;
        // the hardcoded service remains resolvable as the legacy fallback.
        provider.GetRequiredService<IBlueprintService>().ShouldBeAssignableTo<ManifestBlueprintService>();
        provider.GetRequiredService<HardcodedBlueprintService>().ShouldBeAssignableTo<HardcodedBlueprintService>();
        provider.GetRequiredService<IReferenceService>().ShouldBeAssignableTo<HardcodedReferenceService>();
        provider.GetRequiredService<ISessionStore>().ShouldBeAssignableTo<JsonSessionStore>();
        provider.GetRequiredService<IErrataProvider>().ShouldBeAssignableTo<JsonErrataStore>();
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
