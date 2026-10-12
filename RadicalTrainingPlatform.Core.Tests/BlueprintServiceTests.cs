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
    public void GetBlueprint_Nca75_IsRetiredFromHardcodedData()
    {
        // S48-02 (T-32, REQ-NCA-05): the beta NCA-75 blueprint was deleted, not
        // merely superseded — an annotated-but-live block still renders beta
        // section titles wherever the manifest is not loaded. NCA-75 now comes
        // from content/exams/NCA-75/exam.json via ManifestBlueprintService;
        // ManifestBlueprintTests asserts the rendered sections, objective IDs
        // and the absence of every beta section title.
        _service.GetBlueprint("NCA-75").ShouldBeNull();
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

    [Theory]
    [InlineData("NCM-MCI", "NCM-MCI")]
    [InlineData("NCP-CI", "NCP-CI")]
    [InlineData("ncpmci", "NCM-MCI")]
    public void GetBlueprint_SubstringRouting_DoesNotConfuseMciWithCi(string input, string expected)
    {
        // Regression: substring order once sent "NCM-MCI" (contains "CI") to
        // the NCP-CI blueprint. The old test asserted only non-null and missed
        // it — assert the ACTUAL blueprint, not just existence.
        var bp = _service.GetBlueprint(input);
        bp.ShouldNotBeNull();
        bp!.ExamCode.ShouldBe(expected);
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
        // NCA-75 moved to its manifest in S48-02 (T-32), so this exercises a
        // blueprint that is still hardcoded. The old assertion only checked the
        // dictionary was non-empty, which is true for any recognised exam even
        // when nothing matched — assert a count, not a key set.
        var coverage = _service.CalculateCoverage("NCP-US", new List<string>
        {
            "FSVM share access SMB NFS"
        });
        coverage.Values.ShouldContain(count => count > 0);
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
