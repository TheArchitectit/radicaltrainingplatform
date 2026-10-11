using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using RadicalTrainingPlatform.Core.Models;
using RadicalTrainingPlatform.Core.PdfExport;
using Shouldly;
using Xunit;

namespace RadicalTrainingPlatform.Core.Tests;

/// <summary>
/// PDF export fixtures (R-18 / TM-86). Identity strings are asserted on the
/// ExportText surface (the exact strings the renderer draws) plus a real-bytes
/// smoke. The NET-10 defect — display label used as the canonical exam code —
/// is reproduced as a regression pin below.
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

    private static ExportMetadata NcaMeta() => new(
        CanonicalExamId: "NCA-75",
        DisplayName: "Nutanix Certified Associate 7.5",
        TrackTitle: "Nutanix NCA 7.5",
        PackVersion: "2026-06-15",
        SourceReviewDate: "2026-10-10");

    // ─── Real PDF bytes (existing smoke) ─────────────────────────────

    [Fact]
    public void GenerateExamPdf_ReturnsRealPdfBytes()
    {
        var pdf = ExamPdfExporter.GenerateExamPdf(SampleQuestions(), NcaMeta());

        pdf.ShouldNotBeNull();
        pdf.Length.ShouldBeGreaterThan(500, "a real multi-section PDF is not a stub");
        LooksLikePdf(pdf).ShouldBeTrue();
    }

    [Fact]
    public void GenerateExamPdf_EmptyQuestionList_StillReturnsPdf()
    {
        var pdf = ExamPdfExporter.GenerateExamPdf(new List<Question>(), new ExportMetadata("EMPTY", "Empty Exam"));

        pdf.ShouldNotBeNull();
        LooksLikePdf(pdf).ShouldBeTrue();
    }

    [Fact]
    public void GenerateCheatSheetPdf_ReturnsRealPdfBytes()
    {
        var wrong = SampleQuestions().Where(q => q.Id == 1).ToList();
        var pdf = ExamPdfExporter.GenerateCheatSheetPdf(NcaMeta(), wrong);

        pdf.ShouldNotBeNull();
        pdf.Length.ShouldBeGreaterThan(200);
        LooksLikePdf(pdf).ShouldBeTrue();
    }

    [Fact]
    public void GenerateCheatSheetPdf_NoWrongQuestions_StillReturnsPdf()
    {
        var pdf = ExamPdfExporter.GenerateCheatSheetPdf(NcaMeta(), new List<Question>());

        pdf.ShouldNotBeNull();
        LooksLikePdf(pdf).ShouldBeTrue();
    }

    // ─── R-18: canonical ID vs display label ─────────────────────────

    /// <summary>
    /// Archived NET-10 failure (reproduced then fixed): the export path used
    /// the display label as the canonical exam code. This pin fails if the
    /// code slot ever carries DisplayName again.
    /// </summary>
    [Fact]
    public void OldFailure_DisplayLabelAsCanonicalCode_IsPinnedOut()
    {
        var meta = NcaMeta();
        var displayLabel = meta.DisplayName;

        ExportText.HeaderCode(meta).ShouldBe("NCA-75");
        ExportText.CoverCode(meta).ShouldBe("NCA-75");
        // The display label may appear as a title, never as the official code fact.
        foreach (var s in ExportText.AllIdentityStrings(meta))
        {
            if (s.Contains(displayLabel))
                s.ShouldNotContain("Official exam code:");
        }
        ExportText.FooterLines(meta)
            .Any(l => l.Contains($"Official exam code: {displayLabel}"))
            .ShouldBeFalse("NET-10: display label must never be the canonical code");
    }

    [Fact]
    public void HeaderCode_IsCanonicalId_NotDisplayName()
    {
        var meta = new ExportMetadata("COMPTIA-NET-009", "CompTIA Network+ N10-009");
        ExportText.HeaderCode(meta).ShouldBe("COMPTIA-NET-009");
        ExportText.CoverTitle(meta).ShouldBe("CompTIA Network+ N10-009");
        ExportText.HeaderCode(meta).ShouldNotBe(meta.DisplayName);
    }

    // ─── R-18 / R-12: vendor-neutral footer ──────────────────────────

    [Fact]
    public void Footer_IsVendorNeutral_CarriesDisclaimer()
    {
        var footer = string.Join("\n", ExportText.FooterLines(NcaMeta()));

        footer.ShouldContain(ExportText.Disclaimer);
        footer.ShouldContain(ExportText.UnaffiliatedStatus);
        footer.ShouldContain("Official exam code: NCA-75");
        footer.ShouldContain("Pack: 2026-06-15");
        footer.ShouldContain("Source reviewed: 2026-10-10");
        // No vendor branding (the pre-fix footer said "Nutanix Certification Practice").
        footer.ShouldNotContain("Nutanix Certification Practice");
    }

    [Fact]
    public void Footer_OmitsMissingOptionalFields_RatherThanInventing()
    {
        var meta = new ExportMetadata("COMPTIA-A-1201", "CompTIA A+ Core 1");
        var footer = string.Join("\n", ExportText.FooterLines(meta));

        footer.ShouldContain("Official exam code: COMPTIA-A-1201");
        footer.ShouldNotContain("Pack:");
        footer.ShouldNotContain("Source reviewed:");
    }

    [Fact]
    public void Disclaimer_IsExactNormativeString()
    {
        ExportText.Disclaimer.ShouldBe(
            "This is independent study material. It is not official training and is not endorsed or approved by CompTIA, Nutanix, or any other certification body.");
    }

    // ─── Per-released-pack export fixtures (TM-86) ───────────────────

    public static IEnumerable<object[]> ReleasedPacks()
    {
        yield return ["COMPTIA-A-1201", "CompTIA A+ Core 1"];
        yield return ["COMPTIA-A-1202", "CompTIA A+ Core 2"];
        yield return ["COMPTIA-NET-009", "CompTIA Network+"];
        yield return ["NCA-75", "Nutanix Certified Associate 7.5"];
    }

    [Theory]
    [MemberData(nameof(ReleasedPacks))]
    public void ReleasedPack_ExportIdentity_UsesCanonicalCode(string examId, string displayName)
    {
        var meta = new ExportMetadata(examId, displayName, displayName, "1.0.0", "2026-10-10");

        ExportText.HeaderCode(meta).ShouldBe(examId);
        ExportText.CoverCode(meta).ShouldBe(examId);
        var footer = string.Join("\n", ExportText.FooterLines(meta));
        footer.ShouldContain($"Official exam code: {examId}");
        footer.ShouldNotContain($"Official exam code: {displayName}");

        var pdf = ExamPdfExporter.GenerateExamPdf(SampleQuestions(), meta);
        LooksLikePdf(pdf).ShouldBeTrue();
    }

    /// <summary>
    /// When the real content tree is present, load each pack's exam.json and
    /// assert the export identity matches the manifest (canonical examId,
    /// displayName as title, officialVersion as pack, sourceReviewDate).
    /// Skips (does not fail) when content/ is not on disk.
    /// </summary>
    [Fact]
    public void ReleasedPacks_FromManifests_ExportIdentityMatches()
    {
        var root = FindContentRoot();
        if (root == null) return; // content tree not present in this run

        var examsDir = Path.Combine(root, "content", "exams");
        var manifests = Directory.GetDirectories(examsDir)
            .Select(d => Path.Combine(d, "exam.json"))
            .Where(File.Exists)
            .ToList();
        manifests.Count.ShouldBeGreaterThan(0);

        foreach (var path in manifests)
        {
            using var doc = JsonDocument.Parse(File.ReadAllText(path));
            var m = doc.RootElement;
            var examId = m.GetProperty("examId").GetString()!;
            var displayName = m.GetProperty("displayName").GetString()!;
            var pack = m.TryGetProperty("officialVersion", out var v) ? v.GetString() : null;
            var review = m.TryGetProperty("sourceReviewDate", out var r) ? r.GetString() : null;

            var meta = new ExportMetadata(examId, displayName, displayName, pack, review);
            ExportText.HeaderCode(meta).ShouldBe(examId, $"pack {examId}");
            var footer = string.Join("\n", ExportText.FooterLines(meta));
            footer.ShouldContain($"Official exam code: {examId}");
            if (!string.IsNullOrEmpty(review))
                footer.ShouldContain($"Source reviewed: {review}");
        }
    }

    private static string? FindContentRoot()
    {
        var dir = Directory.GetCurrentDirectory();
        for (var i = 0; i < 8 && dir != null; i++)
        {
            if (Directory.Exists(Path.Combine(dir, "content", "exams"))) return dir;
            dir = Path.GetDirectoryName(dir);
        }
        return null;
    }
}
