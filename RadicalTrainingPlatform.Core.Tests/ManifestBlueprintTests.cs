using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using RadicalTrainingPlatform.Core;
using RadicalTrainingPlatform.Core.Models;
using RadicalTrainingPlatform.Core.Services;
using Shouldly;
using Xunit;

namespace RadicalTrainingPlatform.Core.Tests;

/// <summary>
/// REQ-NCA-05 / TM-13: the NCA-75 blueprint is the manifest, and the beta
/// structure is unreachable.
///
/// These fixtures read the repository's real content/exams/NCA-75/exam.json —
/// the file a learner's session actually loads — rather than a temp copy,
/// because the failure this row guards against is the shipped manifest
/// drifting from the June 15, 2026 guide, and a temp fixture cannot see that.
/// </summary>
public class ManifestBlueprintTests
{
    /// <summary>The June 15, 2026 NCA guide: four sections, 14 objectives, in order.</summary>
    private static readonly (string Number, string Title, string[] ObjectiveIds, string[] ObjectiveTitles)[] Guide =
    [
        ("1", "Recognize Nutanix Solutions and Tools",
            ["1.1", "1.2", "1.3"],
            [
                "Recognize Nutanix solutions, use cases, and features of Nutanix Cloud Infrastructure (NCI) technologies",
                "Recognize Nutanix solutions, use cases, and features of non-Nutanix Cloud Infrastructure (NCI) technologies",
                "Recognize the use cases and features of Nutanix tools",
            ]),
        ("2", "Describe Nutanix Platform Administration",
            ["2.1", "2.2", "2.3", "2.4"],
            [
                "Describe VM tasks",
                "Identify virtual networking tasks",
                "Discuss storage operations",
                "Describe licensing tasks",
            ]),
        ("3", "Describe Cluster Configuration and Maintenance",
            ["3.1", "3.2", "3.3"],
            [
                "Describe valid cluster options",
                "Identify hardware maintenance tasks",
                "Identify software maintenance tasks",
            ]),
        ("4", "Demonstrate and Understand of Platform Health and Monitoring",
            ["4.1", "4.2", "4.3", "4.4"],
            [
                "Perform and interpret a health check",
                "Review and interpret alerts and events",
                "Leverage support functions",
                "Review and interpret workload performance",
            ]),
    ];

    /// <summary>
    /// The section titles the retired beta InitNca75 block carried. None of
    /// these may render anywhere: a learner who sees one is studying a
    /// structure the June 15, 2026 guide replaced.
    /// </summary>
    private static readonly string[] BetaSectionTitles =
    [
        "Describe Lifecycle Management",
        "Describe Nutanix Basic Administration",
        "Maintain Environmental Health",
        "Describe Cluster Configuration Options",
    ];

    // ─── The manifest itself ─────────────────────────────────────────

    [Fact]
    public void Manifest_EncodesTheCurrentGuideSectionsAndObjectives()
    {
        var manifest = LoadNca75Manifest();

        manifest.Sections.Count.ShouldBe(Guide.Length);
        manifest.Sections.Select(s => s.Number).ShouldBe(Guide.Select(g => g.Number));

        for (var i = 0; i < Guide.Length; i++)
        {
            var section = manifest.Sections[i];
            section.Title.ShouldBe(Guide[i].Title);
            section.Objectives.Select(o => o.Id).ShouldBe(Guide[i].ObjectiveIds);
            section.Objectives.Select(o => o.Title).ShouldBe(Guide[i].ObjectiveTitles);
        }

        // 14 objectives, and every one reachable by its id.
        manifest.Sections.SelectMany(s => s.Objectives).Count().ShouldBe(14);
    }

    [Fact]
    public void Manifest_CarriesCurrentGuideIdentity()
    {
        var manifest = LoadNca75Manifest();

        manifest.ExamId.ShouldBe("NCA-75");
        manifest.Vendor.ShouldBe("Nutanix");
        manifest.DisplayName.ShouldBe("Nutanix Certified Associate 7.5");
        // The guide date, not the ingest date.
        manifest.OfficialVersion.ShouldBe("2026-06-15");
        manifest.SourceUrl.ShouldStartWith("https://");
        manifest.SourceReviewDate.ShouldNotBeNullOrWhiteSpace();

        manifest.ProductVersions["AOS"].ShouldBe("7.5");
        manifest.ProductVersions["AHV"].ShouldBe("11.0");
        manifest.ProductVersions["Prism Central"].ShouldBe("pc.7.5");
    }

    [Fact]
    public void Manifest_HasNoWeightPercent_AndLabelsEqualAllocationAsAStudyChoice()
    {
        // ASM-13: the guide publishes no percentage table, so a weight would be
        // an invented exam fact. The allocation is equal and labelled a choice.
        var manifest = LoadNca75Manifest();

        manifest.Sections.ShouldAllBe(s => s.WeightPercent == null);
        manifest.Sections.Select(s => s.StudyItemAllocation).Distinct()
            .ShouldBe(new int?[] { 10 });
        manifest.StudyAllocationLabel.ShouldNotBeNullOrWhiteSpace();
        manifest.StudyAllocationLabel.ShouldContain("not a published exam weight");
    }

    // ─── The rendered blueprint (TM-13) ──────────────────────────────

    [Fact]
    public void Blueprint_ManifestServesNca75_WithTheGuidesSectionOrderAndIds()
    {
        var bp = new Service().GetBlueprint("NCA-75");

        bp.ShouldNotBeNull();
        bp!.ExamCode.ShouldBe("NCA-75");
        bp.ExamTitle.ShouldBe("Nutanix Certified Associate 7.5");

        bp.Sections.Select(s => s.SectionNumber).ShouldBe([1, 2, 3, 4]);
        bp.Sections.Select(s => s.SectionTitle).ShouldBe(Guide.Select(g => g.Title));
        bp.Sections.SelectMany(s => s.Objectives).Select(o => o.Id)
            .ShouldBe(Guide.SelectMany(g => g.ObjectiveIds));
    }

    [Fact]
    public void Blueprint_NoBetaSectionTitleRenders()
    {
        var bp = new Service().GetBlueprint("NCA-75")!;

        var rendered = bp.Sections.Select(s => s.SectionTitle)
            .Concat(bp.Sections.SelectMany(s => s.Objectives).Select(o => o.Title))
            .ToList();

        foreach (var beta in BetaSectionTitles)
            rendered.ShouldNotContain(t => t.Contains(beta, StringComparison.OrdinalIgnoreCase));

        // …and no section invents a weight the guide does not publish.
        bp.Sections.ShouldAllBe(s => s.WeightPercent == 0);
    }

    [Fact]
    public void Blueprint_FallbackCannotServeNca75_BecauseTheBetaBlockIsDeleted()
    {
        // REQ-NCA-05 says the beta block is removed or annotated obsolete. It is
        // removed: an annotated-but-live block still renders beta section titles
        // wherever the manifest is not loaded. If this goes non-null, the beta
        // structure is reachable again on a machine with no content/ tree.
        new HardcodedBlueprintService().GetBlueprint("NCA-75").ShouldBeNull();
    }

    // ─── Helpers ─────────────────────────────────────────────────────

    private sealed class Service
    {
        private readonly ManifestBlueprintService _service;

        public Service()
        {
            var files = new DefaultFileProvider();
            var repo = new MarkdownExamRepository(files);
            repo.RegisterSearchPath(FindRepoRoot());
            _service = new ManifestBlueprintService(
                new ManifestLoader(repo, files), new HardcodedBlueprintService());
        }

        public ExamBlueprint? GetBlueprint(string examCode) => _service.GetBlueprint(examCode);
    }

    private static ExamManifest LoadNca75Manifest()
    {
        var files = new DefaultFileProvider();
        var repo = new MarkdownExamRepository(files);
        repo.RegisterSearchPath(FindRepoRoot());

        var manifests = new ManifestLoader(repo, files).LoadExamManifests();
        manifests.ShouldContainKey("NCA-75");
        return manifests["NCA-75"];
    }

    private static string FindRepoRoot()
    {
        var dir = AppContext.BaseDirectory;
        for (var i = 0; i < 8; i++)
        {
            if (File.Exists(Path.Combine(dir, "content", "exams", "NCA-75", "exam.json")))
                return dir;
            dir = Path.GetDirectoryName(dir)!;
        }
        throw new FileNotFoundException(
            "content/exams/NCA-75/exam.json not found above the test assembly");
    }
}
