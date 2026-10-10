using System;
using System.IO;
using System.Linq;
using Microsoft.Extensions.DependencyInjection;
using RadicalTrainingPlatform.Core;
using RadicalTrainingPlatform.Core.Abstractions;
using RadicalTrainingPlatform.Core.Services;
using Shouldly;
using Xunit;

namespace RadicalTrainingPlatform.Core.Tests;

/// <summary>
/// TM-12/TM-13: manifest catalog and blueprint precedence (SPEC-02,
/// REQ-MAN-01/02/04/05). Fixtures build temp content/ trees so the loader,
/// catalog and blueprint service are exercised against real files.
/// </summary>
public class ManifestCatalogTests : IDisposable
{
    private readonly string _root;

    public ManifestCatalogTests()
    {
        _root = Path.Combine(Path.GetTempPath(), "rtp-manifest-tests-" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(_root);
    }

    public void Dispose()
    {
        try { Directory.Delete(_root, recursive: true); }
        catch (IOException) { /* best effort cleanup */ }
    }

    private void WriteFile(string relativePath, string content)
    {
        var path = Path.Combine(_root, relativePath);
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);
        File.WriteAllText(path, content);
    }

    private const string MinimalExamJson = """"
        {
          "examId": "TEST-EX",
          "vendor": "TestVendor",
          "displayName": "Test Exam Display",
          "officialVersion": "v15",
          "objectivesDocVersion": "1.0",
          "sourceUrl": "https://example.com/objectives",
          "sourceReviewDate": "2026-10-10",
          "sections": [
            { "number": "1", "title": "Networking", "weightPercent": 30,
              "objectives": [ { "id": "1.1", "title": "Cables", "lessonIds": ["l1"] },
                              { "id": "1.2", "title": "Routing", "lessonIds": [] } ] },
            { "number": "2", "title": "Storage",
              "objectives": [ { "id": "2.1", "title": "Disks", "lessonIds": [] } ] }
          ]
        }
        """";

    private IExamRepository MakeRepo()
    {
        var files = new DefaultFileProvider();
        var repo = new MarkdownExamRepository(files);
        repo.RegisterSearchPath(_root);
        return repo;
    }

    private ManifestExamCatalog MakeCatalog()
    {
        var files = new DefaultFileProvider();
        var repo = MakeRepo();
        var loader = new ManifestLoader(repo, files);
        return new ManifestExamCatalog(repo, files, loader, new QuestionParser(repo));
    }

    // ─── Loader ──────────────────────────────────────────────────────

    [Fact]
    public void Loader_ReadsExamManifest()
    {
        WriteFile("content/exams/TEST-EX/exam.json", MinimalExamJson);
        var loader = new ManifestLoader(MakeRepo(), new DefaultFileProvider());

        var manifests = loader.LoadExamManifests();

        manifests.Count.ShouldBe(1);
        var m = manifests["TEST-EX"];
        m.DisplayName.ShouldBe("Test Exam Display");
        m.SourceUrl.ShouldBe("https://example.com/objectives");
        m.Sections.Count.ShouldBe(2);
        m.Sections[0].Objectives.Count.ShouldBe(2);
        m.Sections[0].WeightPercent.ShouldBe(30);
        m.Sections[1].WeightPercent.ShouldBeNull(); // weightPercent is optional
        m.ManifestPath.ShouldNotBeEmpty();
    }

    [Fact]
    public void Loader_DuplicateExamId_Throws()
    {
        WriteFile("content/exams/TEST-EX/exam.json", MinimalExamJson);
        WriteFile("content/exams/OTHER/exam.json", MinimalExamJson); // same examId
        var loader = new ManifestLoader(MakeRepo(), new DefaultFileProvider());

        Should.Throw<InvalidOperationException>(() => loader.LoadExamManifests())
            .Message.ShouldContain("TEST-EX");
    }

    [Fact]
    public void Loader_MalformedManifest_IsSkippedNotFatal()
    {
        WriteFile("content/exams/TEST-EX/exam.json", "{ not json ");
        var loader = new ManifestLoader(MakeRepo(), new DefaultFileProvider());

        loader.LoadExamManifests().Count.ShouldBe(0);
    }

    // ─── Catalog (TM-12) ─────────────────────────────────────────────

    [Fact]
    public void Catalog_ManifestIdentity_WinsOverFilename()
    {
        WriteFile("content/exams/TEST-EX/exam.json", MinimalExamJson);
        WriteFile("content/exams/TEST-EX/questions/part1.md",
            "## DOMAIN 1 — Networking\n\n### Q1. Which cable?\n\n- A) copper\n- B) fiber\n\n**Answer: A**\n\nBecause.\n");

        var catalog = MakeCatalog();
        var items = catalog.Build();

        // If DeriveExamCode ran on "part1.md" the code would be "" or garbage;
        // manifest identity must win (REQ-MAN-02).
        var entry = items.Single(i => i.ExamCode == "TEST-EX");
        entry.DisplayName.ShouldBe("Test Exam Display");
        entry.Vendor.ShouldBe("TestVendor");
        entry.QuestionCount.ShouldBe(1);
        entry.SourceFiles.ShouldContain("part1.md");
    }

    [Fact]
    public void Catalog_LegacyRootFile_StillCatalogedViaDeriveExamCode()
    {
        WriteFile("content/exams/TEST-EX/exam.json", MinimalExamJson);
        WriteFile("legacy-bank.md",
            "### Q1. Legacy?\n\n- A) yes\n- B) no\n\n**Answer: A**\n\nBecause.\n");

        var catalog = MakeCatalog();
        var items = catalog.Build();

        // The temp root is priority-registered, but the repository's parent-walk
        // also reaches the real repo banks — assert on our entries, not total count.
        items.ShouldContain(i => i.ExamCode == "TEST-EX");
        var legacy = items.Single(i => i.ExamCode == "legacy-bank");
        legacy.QuestionCount.ShouldBe(1);
    }

    [Fact]
    public void Catalog_DuplicateQuestionIdWithinExam_Throws()
    {
        WriteFile("content/exams/TEST-EX/exam.json", MinimalExamJson);
        WriteFile("content/exams/TEST-EX/questions/part1.md",
            "### Q1. One?\n\n- A) a\n- B) b\n\n**Answer: A**\n\nBecause.\n\n" +
            "### Q1. Two?\n\n- A) a\n- B) b\n\n**Answer: B**\n\nBecause.\n");

        var catalog = MakeCatalog();

        Should.Throw<InvalidOperationException>(() => catalog.Build())
            .Message.ShouldContain("Duplicate question ID 1");
    }

    [Fact]
    public void Catalog_ObjectiveCoverage_ComputesFromManifest()
    {
        WriteFile("content/exams/TEST-EX/exam.json", MinimalExamJson);
        var catalog = MakeCatalog();
        catalog.Build(); // populates the manifest cache

        var (covered, total) = catalog.ComputeObjectiveCoverage("TEST-EX");

        total.ShouldBe(3);
        covered.ShouldBe(1); // only 1.1 declares a lesson ID
    }

    // ─── Blueprint precedence (TM-13) ────────────────────────────────

    [Fact]
    public void Blueprint_ManifestOverridesHardcoded()
    {
        WriteFile("content/exams/TEST-EX/exam.json", MinimalExamJson);
        var files = new DefaultFileProvider();
        var repo = MakeRepo();
        var loader = new ManifestLoader(repo, files);
        var service = new ManifestBlueprintService(loader, new HardcodedBlueprintService());

        var bp = service.GetBlueprint("TEST-EX");
        bp.ShouldNotBeNull();
        bp.ExamTitle.ShouldBe("Test Exam Display");
        bp.Sections.Count.ShouldBe(2);
        bp.Sections[0].SectionTitle.ShouldBe("Networking");
        bp.Sections[0].Objectives.Select(o => o.Id).ShouldBe(["1.1", "1.2"]);
    }

    [Fact]
    public void Blueprint_LegacyExam_FallsBackToHardcoded()
    {
        WriteFile("content/exams/TEST-EX/exam.json", MinimalExamJson);
        var files = new DefaultFileProvider();
        var repo = MakeRepo();
        var loader = new ManifestLoader(repo, files);
        var hardcoded = new HardcodedBlueprintService();
        var service = new ManifestBlueprintService(loader, hardcoded);

        var fromService = service.GetBlueprint("NCP-US");
        var fromHardcoded = hardcoded.GetBlueprint("NCP-US");
        fromService.ShouldNotBeNull();
        fromService.ExamTitle.ShouldBe(fromHardcoded!.ExamTitle);
    }

    [Fact]
    public void CompositionRoot_RegistersManifestServices()
    {
        var provider = new ServiceCollection()
            .AddRadicalTrainingPlatformCore()
            .BuildServiceProvider();

        provider.GetRequiredService<IManifestLoader>().ShouldBeAssignableTo<ManifestLoader>();
        provider.GetRequiredService<IBlueprintService>().ShouldBeAssignableTo<ManifestBlueprintService>();
    }
}
