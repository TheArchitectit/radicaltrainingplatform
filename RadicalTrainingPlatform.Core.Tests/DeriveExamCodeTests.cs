using RadicalTrainingPlatform.Core;
using Shouldly;
using Xunit;

namespace RadicalTrainingPlatform.Core.Tests;

public class DeriveExamCodeTests
{
    [Theory]
    [InlineData("NCP-US-Part2-D3.md", "NCP-US")]
    [InlineData("NCP-US-Part2-D4.md", "NCP-US")]
    [InlineData("NCA-75-Part3-GapFill.md", "NCA-75")]
    [InlineData("NCP-CI-Part5-GapFill.md", "NCP-CI")]
    [InlineData("NCM-MCI-Part1.md", "NCM-MCI")]
    [InlineData("NCM-MCI-Part2.md", "NCM-MCI")]
    [InlineData("NCP-AI-Part1.md", "NCP-AI")]
    [InlineData("NCP-CI-Part1.md", "NCP-CI")]
    [InlineData("NCP-US-Part1.md", "NCP-US")]
    [InlineData("NCA-75-Part1.md", "NCA-75")]
    [InlineData("NCA-75-Part2.md", "NCA-75")]
    [InlineData("AWS-SAA-Part1.md", "AWS-SAA")]
    [InlineData("AZ-104-Part1.md", "AZ-104")]
    [InlineData("CKA.md", "CKA")]
    [InlineData("CKS-Part1.md", "CKS")]
    [InlineData("CCNA-Part1.md", "CCNA")]
    public void DeriveExamCode_ReturnsCorrectCode(string fileName, string expected)
    {
        QuestionParser.DeriveExamCode(fileName).ShouldBe(expected);
    }

    [Fact]
    public void DeriveExamCode_FileWithoutExtension_StillWorks()
    {
        QuestionParser.DeriveExamCode("NCP-US-Part1").ShouldBe("NCP-US");
    }

    [Fact]
    public void DeriveExamCode_SimpleCode_NoSuffix_ReturnsAsIs()
    {
        QuestionParser.DeriveExamCode("CKA").ShouldBe("CKA");
    }

    [Fact]
    public void DeriveExamCode_NumericSecondSegment_KeepsBothSegments()
    {
        // NCA-75 → strip -Part1 → NCA-75 → two segments, keep both → "NCA-75"
        QuestionParser.DeriveExamCode("NCA-75-Part1.md").ShouldBe("NCA-75");
    }

    [Fact]
    public void DeriveExamCode_NonNumericSecondSegment_ReturnsBoth()
    {
        // NCM-MCI-Part1 → strip -Part1 → NCM-MCI → parts = ["NCM","MCI"] → not numeric → return "NCM-MCI"
        QuestionParser.DeriveExamCode("NCM-MCI-Part1.md").ShouldBe("NCM-MCI");
    }

    [Fact]
    public void DeriveExamCode_MultipleSuffixes_StrippedIteratively()
    {
        // NCP-US-Part2-D3 → strip -D3 → NCP-US-Part2 → strip -Part2 → NCP-US
        QuestionParser.DeriveExamCode("NCP-US-Part2-D3.md").ShouldBe("NCP-US");
    }

    [Fact]
    public void DeriveExamCode_GapFillSuffix_StrippedCorrectly()
    {
        QuestionParser.DeriveExamCode("NCA-75-Part3-GapFill.md").ShouldBe("NCA-75");
        QuestionParser.DeriveExamCode("NCP-CI-Part5-GapFill.md").ShouldBe("NCP-CI");
        QuestionParser.DeriveExamCode("NCM-MCI-Part5-GapFill.md").ShouldBe("NCM-MCI");
    }

    [Fact]
    public void DeriveExamCode_UnknownVendor_ReturnsCorrectCode()
    {
        QuestionParser.DeriveExamCode("GCP-PCA-Part1.md").ShouldBe("GCP-PCA");
    }

    // ─── REQ-MAN-03: truncation-documentation cases ─────────────────
    // These pin the exact failure that makes filename-derived identity
    // unusable for new CompTIA packs: the derivation keeps only the first
    // two segments, so COMPTIA-A-1201 silently becomes COMPTIA-A. New packs
    // therefore resolve identity from exam.json (REQ-MAN-02/D1) — these
    // cases exist to prove WHY, and to fail loudly if the legacy behavior
    // ever changes shape.

    [Fact]
    public void DeriveExamCode_ComptiaA1201_TruncatesToComptiaA()
    {
        QuestionParser.DeriveExamCode("COMPTIA-A-1201-Part1.md").ShouldBe("COMPTIA-A");
    }

    [Fact]
    public void DeriveExamCode_ComptiaA1202_TruncatesToComptiaA()
    {
        QuestionParser.DeriveExamCode("COMPTIA-A-1202-Part1.md").ShouldBe("COMPTIA-A");
    }

    [Fact]
    public void DeriveExamCode_ComptiaNet009_TruncatesToComptiaNet()
    {
        QuestionParser.DeriveExamCode("COMPTIA-NET-009-Part1.md").ShouldBe("COMPTIA-NET");
    }

    [Fact]
    public void DeriveExamCode_TruncationCollides_TwoCompTiaExamsDeriveIdentically()
    {
        // The reason manifests are mandatory: both Cores derive to the SAME
        // code, so filename identity cannot distinguish them.
        QuestionParser.DeriveExamCode("COMPTIA-A-1201-Part1.md")
            .ShouldBe(QuestionParser.DeriveExamCode("COMPTIA-A-1202-Part1.md"));
    }
}
