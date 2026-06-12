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
}
