using System.Collections.Generic;
using System.Linq;
using RadicalTrainingPlatform.Core;
using RadicalTrainingPlatform.Core.Models;
using RadicalTrainingPlatform.Core.Services;
using Shouldly;
using Xunit;

namespace RadicalTrainingPlatform.Core.Tests;

/// <summary>
/// Direct behavior tests for the reference/KB surface (critical surface
/// per CI-02: "content parsing, security-gate boundaries" adjacent — the
/// reference tables feed the study explanations).
/// </summary>
public class ReferenceServiceTests
{
    private static Question Q(string examCode, string stem, params string[] optionTexts) => new()
    {
        ExamCode = examCode,
        Stem = stem,
        Options = optionTexts
            .Select((t, i) => new AnswerOption { Letter = ((char)('A' + i)).ToString(), Text = t })
            .ToList(),
        CorrectAnswers = new List<string> { "A" },
    };

    [Fact]
    public void GetReferenceForQuestion_NCA75_MatchesKeywords()
    {
        var svc = new HardcodedReferenceService();
        var q = Q("NCA-75", "LCM lifecycle upgrade firmware", "Start the upgrade", "Skip it");

        var text = svc.GetReferenceForQuestion(q);

        text.ShouldNotBeNullOrWhiteSpace("LCM/firmware keywords must hit the NCA-75 table");
    }

    [Fact]
    public void GetReferenceForQuestion_UnknownExam_ReturnsEmpty_NotThrow()
    {
        var svc = new HardcodedReferenceService();
        var q = Q("NOPE-99", "something about widgets", "A", "B");

        svc.GetReferenceForQuestion(q).ShouldBe("");
    }

    [Fact]
    public void GetKBLinksForQuestion_NCM_MCI_ReturnsLinks()
    {
        // _kbLinks covers the Nutanix banks (NCP-US/CI/AI, NCM-MCI); NCA-75
        // has reference text but no KB-link table yet.
        var svc = new HardcodedReferenceService();
        var q = Q("NCM-MCI", "How do I configure AHV bridge bonding with LACP?", "A", "B");

        var links = svc.GetKBLinksForQuestion(q);

        links.ShouldNotBeEmpty();
        links.ShouldAllBe(l => !string.IsNullOrWhiteSpace(l.Title) && l.Url.StartsWith("http"));
    }

    [Fact]
    public void GetKBLinksForQuestion_UnknownExam_ReturnsEmpty()
    {
        var svc = new HardcodedReferenceService();
        svc.GetKBLinksForQuestion(Q("NOPE-99", "anything", "A", "B")).ShouldBeEmpty();
    }

    [Fact]
    public void GetGeneralResources_NonEmpty_WithUrls()
    {
        var svc = new HardcodedReferenceService();
        var resources = svc.GetGeneralResources();

        resources.ShouldNotBeEmpty();
        resources.ShouldAllBe(r => r.Url.StartsWith("http"));
    }

    [Fact]
    public void StaticShim_ReferenceService_DelegatesToInstance()
    {
        // The Legacy WinForms static shim must reach the same tables.
        var q = Q("NCA-75", "LCM lifecycle upgrade firmware", "A", "B");
#pragma warning disable CS0618 // intentionally exercising the Legacy WinForms shim
        ReferenceService.GetReferenceForQuestion(q).ShouldNotBeNull();
        ReferenceService.GetGeneralResources().ShouldNotBeEmpty();
        ReferenceService.GetKBLinksForQuestion(q).ShouldNotBeNull();
#pragma warning restore CS0618
    }

    [Fact]
    public void StaticShim_BlueprintService_KnownExam()
    {
#pragma warning disable CS0618 // intentionally exercising the Legacy WinForms shim
        var bp = BlueprintService.GetBlueprint("NCP-US");
        bp.ShouldNotBeNull();
        BlueprintService.GetBibleSections("NCP-US").ShouldNotBeEmpty();
#pragma warning restore CS0618
    }
}
