using System.Collections.Generic;
using RadicalTrainingPlatform.Core;
using RadicalTrainingPlatform.Core.Abstractions;
using RadicalTrainingPlatform.Core.Models;
using Shouldly;
using Xunit;

namespace RadicalTrainingPlatform.Core.Tests;

public class HardcodedBlueprintServiceTests
{
    private readonly IBlueprintService _service = new HardcodedBlueprintService();

    [Fact]
    public void GetBlueprint_NCA75_ReturnsBlueprint()
    {
        var bp = _service.GetBlueprint("NCA-75");
        bp.ShouldNotBeNull();
        bp!.Sections.ShouldNotBeEmpty();
    }

    [Fact]
    public void GetBlueprint_NCPUS_ReturnsBlueprint()
    {
        var bp = _service.GetBlueprint("NCP-US");
        bp.ShouldNotBeNull();
    }

    [Fact]
    public void GetBlueprint_NCMCI_ReturnsBlueprint()
    {
        var bp = _service.GetBlueprint("NCM-MCI");
        bp.ShouldNotBeNull();
    }

    [Fact]
    public void GetBibleSections_NCA75_ReturnsSections()
    {
        var sections = _service.GetBibleSections("NCA-75");
        sections.ShouldNotBeEmpty();
    }

    [Fact]
    public void GetBibleSections_UnknownCode_ReturnsEmpty()
    {
        var sections = _service.GetBibleSections("UNKNOWN-EXAM");
        sections.ShouldBeEmpty();
    }

    [Fact]
    public void CalculateCoverage_WithMatchingText_ReturnsNonZero()
    {
        var coverage = _service.CalculateCoverage("NCA-75", new List<string>
        {
            "LCM lifecycle management firmware upgrade Nutanix cluster"
        });
        coverage.Count.ShouldBeGreaterThan(0);
    }

    [Fact]
    public void GetBlueprint_NCPUS_ContainsObjectives()
    {
        var bp = _service.GetBlueprint("NCP-US");
        bp.ShouldNotBeNull();
        foreach (var section in bp!.Sections)
        {
            section.Objectives.ShouldNotBeEmpty();
        }
    }
}
