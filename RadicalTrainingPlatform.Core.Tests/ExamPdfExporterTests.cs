using System.Collections.Generic;
using System.Linq;
using RadicalTrainingPlatform.Core.Models;
using RadicalTrainingPlatform.Core.PdfExport;
using Shouldly;
using Xunit;

namespace RadicalTrainingPlatform.Core.Tests;

/// <summary>
/// Smoke tests for the QuestPDF exporter (critical surface: export must
/// produce real PDF bytes, not throw). Deep visual layout is out of scope —
/// these pin the generate-and-return contract so a regression in the
/// document builder fails here rather than at the desktop click.
/// </summary>
public class ExamPdfExporterTests
{
    private static List<Question> SampleQuestions() => new()
    {
        new Question
        {
            Id = 1,
            Stem = "Which service resolves names to addresses?",
            CorrectAnswers = new List<string> { "B" },
            Options = new List<AnswerOption>
            {
                new() { Letter = "A", Text = "DHCP" },
                new() { Letter = "B", Text = "DNS" },
                new() { Letter = "C", Text = "Gateway" },
            },
            ExamCode = "NCA-75",
            Domain = "Networking",
            SourceFile = "sample.md",
        },
        new Question
        {
            Id = 2,
            Stem = "Pick two storage types.",
            CorrectAnswers = new List<string> { "A", "C" },
            Options = new List<AnswerOption>
            {
                new() { Letter = "A", Text = "Block" },
                new() { Letter = "B", Text = "Fax" },
                new() { Letter = "C", Text = "Object" },
            },
            ExamCode = "NCA-75",
            Domain = "Storage",
            SourceFile = "sample.md",
        },
    };

    private static bool LooksLikePdf(byte[] bytes) =>
        bytes.Length > 4 && bytes[0] == (byte)'%' && bytes[1] == (byte)'P' && bytes[2] == (byte)'D' && bytes[3] == (byte)'F';

    [Fact]
    public void GenerateExamPdf_ReturnsRealPdfBytes()
    {
        var pdf = ExamPdfExporter.GenerateExamPdf(SampleQuestions(), "NCA 7.5", "NCA-75");

        pdf.ShouldNotBeNull();
        pdf.Length.ShouldBeGreaterThan(500, "a real multi-section PDF is not a stub");
        LooksLikePdf(pdf).ShouldBeTrue();
    }

    [Fact]
    public void GenerateExamPdf_EmptyQuestionList_StillReturnsPdf()
    {
        var pdf = ExamPdfExporter.GenerateExamPdf(new List<Question>(), "Empty Exam", "EMPTY");

        pdf.ShouldNotBeNull();
        LooksLikePdf(pdf).ShouldBeTrue();
    }

    [Fact]
    public void GenerateCheatSheetPdf_ReturnsRealPdfBytes()
    {
        var wrong = SampleQuestions().Where(q => q.Id == 1).ToList();
        var pdf = ExamPdfExporter.GenerateCheatSheetPdf("NCA-75", wrong);

        pdf.ShouldNotBeNull();
        pdf.Length.ShouldBeGreaterThan(200);
        LooksLikePdf(pdf).ShouldBeTrue();
    }

    [Fact]
    public void GenerateCheatSheetPdf_NoWrongQuestions_StillReturnsPdf()
    {
        var pdf = ExamPdfExporter.GenerateCheatSheetPdf("NCA-75", new List<Question>());

        pdf.ShouldNotBeNull();
        LooksLikePdf(pdf).ShouldBeTrue();
    }
}
