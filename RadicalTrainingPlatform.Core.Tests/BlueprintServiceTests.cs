using System.Collections.Generic;
using RadicalTrainingPlatform.Core;
using RadicalTrainingPlatform.Core.Models;
using Shouldly;
using Xunit;

namespace RadicalTrainingPlatform.Core.Tests;

public class BlueprintServiceTests
{
    [Fact]
    public void GetBlueprint_NCA75_ReturnsBlueprint()
    {
        var bp = BlueprintService.GetBlueprint("NCA-75");
        bp.ShouldNotBeNull();
        bp.Sections.ShouldNotBeEmpty();
    }

    [Fact]
    public void GetBlueprint_NCPUS_ReturnsBlueprint()
    {
        var bp = BlueprintService.GetBlueprint("NCP-US");
        bp.ShouldNotBeNull();
    }

    [Fact]
    public void GetBlueprint_NCMCI_ReturnsBlueprint()
    {
        var bp = BlueprintService.GetBlueprint("NCM-MCI");
        bp.ShouldNotBeNull();
    }

    [Fact]
    public void GetBibleSections_NCA75_ReturnsSections()
    {
        var sections = BlueprintService.GetBibleSections("NCA-75");
        sections.ShouldNotBeEmpty();
    }

    [Fact]
    public void GetBibleSections_UnknownCode_ReturnsEmpty()
    {
        var sections = BlueprintService.GetBibleSections("UNKNOWN-EXAM");
        sections.ShouldBeEmpty();
    }

    [Fact]
    public void CalculateCoverage_WithMatchingText_ReturnsNonZero()
    {
        var coverage = BlueprintService.CalculateCoverage("NCA-75", new List<string>
        {
            "LCM lifecycle management firmware upgrade Nutanix cluster"
        });
        coverage.Count.ShouldBeGreaterThan(0);
    }

    [Fact]
    public void GetBibleSections_ContainsObjectives()
    {
        var bp = BlueprintService.GetBlueprint("NCP-US");
        bp.ShouldNotBeNull();
        foreach (var section in bp!.Sections)
        {
            section.Objectives.ShouldNotBeEmpty();
        }
    }
}
