using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using RadicalTrainingPlatform.Core.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace RadicalTrainingPlatform.Core.PdfExport;

/// <summary>
/// Cross-platform PDF export service for exam study guides and cheat sheets.
/// Uses QuestPDF 2025.1.x with the synthwave dark theme.
/// </summary>
public static class ExamPdfExporter
{
    // Synthwave dark theme palette
    private static readonly string BgDark = "#0B0B1A";
    private static readonly string HeadingCyan = "#00F0FF";
    private static readonly string AccentMagenta = "#FF2D95";
    private static readonly string CorrectGreen = "#44FF88";
    private static readonly string TextColor = "#E0E0FF";
    private static readonly string MutedColor = "#8888AA";
    private static readonly string RuleColor = "#2A2A40";

    private static bool _licenseConfigured;

    /// <summary>
    /// Ensures the QuestPDF community license is set (idempotent).
    /// Must be called before any document generation. Safe to call multiple times.
    /// </summary>
    private static void EnsureLicense()
    {
        if (_licenseConfigured) return;
        QuestPDF.Settings.License = LicenseType.Community;
        _licenseConfigured = true;
    }

    /// <summary>
    /// Generates a complete PDF study guide with a cover page, domain-grouped
    /// sections, formatted questions, explanations, and page numbers.
    /// Identity strings come from <see cref="ExportText"/> (R-18).
    /// </summary>
    public static byte[] GenerateExamPdf(List<Question> questions, ExportMetadata meta)
    {
        EnsureLicense();
        ArgumentNullException.ThrowIfNull(meta);

        if (questions == null) questions = new List<Question>();

        var generatedAt = DateTime.Now;
        var domains = questions
            .GroupBy(q => string.IsNullOrWhiteSpace(q.Domain) ? "General" : q.Domain)
            .OrderBy(g => g.Key, StringComparer.OrdinalIgnoreCase)
            .ToList();

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);
                page.PageColor(Color.FromHex(BgDark));
                page.DefaultTextStyle(t => t.FontColor(Color.FromHex(TextColor)).FontSize(11));

                page.Header().Element(h => ComposeHeader(h, meta));
                page.Content().Element(c => ComposeContent(c, meta, questions.Count, generatedAt, domains));
                page.Footer().Element(f => ComposeFooter(f, meta));
            });
        }).GeneratePdf();
    }

    /// <summary>
    /// Generates a "missed questions only" review PDF using the same theme
    /// and question layout as the full study guide.
    /// </summary>
    public static byte[] GenerateCheatSheetPdf(ExportMetadata meta, List<Question> wrongQuestions)
    {
        EnsureLicense();
        ArgumentNullException.ThrowIfNull(meta);

        if (wrongQuestions == null) wrongQuestions = new List<Question>();

        var generatedAt = DateTime.Now;
        var domains = wrongQuestions
            .GroupBy(q => string.IsNullOrWhiteSpace(q.Domain) ? "General" : q.Domain)
            .OrderBy(g => g.Key, StringComparer.OrdinalIgnoreCase)
            .ToList();

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);
                page.PageColor(Color.FromHex(BgDark));
                page.DefaultTextStyle(t => t.FontColor(Color.FromHex(TextColor)).FontSize(11));

                page.Header().Element(h => ComposeHeader(h, meta));
                page.Content().Element(c => ComposeContent(c, meta, wrongQuestions.Count, generatedAt, domains, isCheatSheet: true));
                page.Footer().Element(f => ComposeFooter(f, meta));
            });
        }).GeneratePdf();
    }

    // ---------------------------------------------------------------------
    // Page composition helpers — identity strings always via ExportText
    // ---------------------------------------------------------------------

    private static void ComposeHeader(IContainer container, ExportMetadata meta)
    {
        container.PaddingBottom(8).Column(col =>
        {
            col.Item().Row(row =>
            {
                row.RelativeItem().Text(ExportText.HeaderCode(meta))
                    .FontSize(10).Bold()
                    .FontColor(Color.FromHex(HeadingCyan));

                row.ConstantItem(180).AlignRight().Text(ExportText.CoverTitle(meta))
                    .FontSize(9)
                    .FontColor(Color.FromHex(MutedColor));
            });

            col.Item().PaddingTop(4).LineHorizontal(1.2f).LineColor(Color.FromHex(AccentMagenta));
        });
    }

    private static void ComposeFooter(IContainer container, ExportMetadata meta)
    {
        container.PaddingTop(8).Column(col =>
        {
            foreach (var line in ExportText.FooterLines(meta))
            {
                col.Item().Text(line)
                    .FontSize(7)
                    .FontColor(Color.FromHex(MutedColor));
            }

            col.Item().PaddingTop(2).AlignRight().Text(t =>
            {
                t.DefaultTextStyle(s => s.FontSize(8).FontColor(Color.FromHex(MutedColor)));
                t.Span("Page ");
                t.CurrentPageNumber();
                t.Span(" / ");
                t.TotalPages();
            });
        });
    }

    private static void ComposeContent(
        IContainer container,
        ExportMetadata meta,
        int totalQuestions,
        DateTime generatedAt,
        List<IGrouping<string, Question>> domains,
        bool isCheatSheet = false)
    {
        container.Column(col =>
        {
            col.Item().PaddingVertical(20).Element(c => ComposeCover(
                c, meta, totalQuestions, generatedAt, isCheatSheet));

            foreach (var group in domains)
            {
                col.Item().PageBreak();
                col.Item().Element(c => ComposeDomainSection(c, group.Key, group.ToList()));
            }
        });
    }

    private static void ComposeCover(
        IContainer container,
        ExportMetadata meta,
        int totalQuestions,
        DateTime generatedAt,
        bool isCheatSheet)
    {
        container.AlignCenter().Column(col =>
        {
            col.Item().PaddingTop(40).Text("RadicalTrainingPlatform")
                .FontSize(14).Bold()
                .FontColor(Color.FromHex(AccentMagenta))
                .LetterSpacing(0.3f);

            col.Item().PaddingTop(40).Text(ExportText.CoverTitle(meta)
                    + (isCheatSheet ? " — Cheat Sheet (Missed Questions)" : ""))
                .FontSize(28).Bold()
                .FontColor(Color.FromHex(HeadingCyan))
                .AlignCenter();

            col.Item().PaddingTop(8).Text(ExportText.CoverCode(meta))
                .FontSize(16)
                .FontColor(Color.FromHex(TextColor))
                .AlignCenter();

            col.Item().PaddingTop(40).LineHorizontal(1.5f).LineColor(Color.FromHex(AccentMagenta));

            col.Item().PaddingTop(20).Text($"{totalQuestions} Practice Questions")
                .FontSize(20).Bold()
                .FontColor(Color.FromHex(TextColor))
                .AlignCenter();

            col.Item().PaddingTop(8).Text($"Generated {generatedAt.ToString("MMMM d, yyyy 'at' HH:mm", CultureInfo.InvariantCulture)}")
                .FontSize(11)
                .FontColor(Color.FromHex(MutedColor))
                .AlignCenter();

            col.Item().PaddingTop(60).Text(
                    "This study guide contains multiple-choice and multi-select "
                    + "questions with correct answers and explanations. Use it to review key "
                    + "concepts and identify weak areas before your exam.")
                .FontSize(11)
                .FontColor(Color.FromHex(MutedColor))
                .AlignCenter()
                .LineHeight(1.4f);

            col.Item().PaddingTop(24).Text(ExportText.Disclaimer)
                .FontSize(9)
                .FontColor(Color.FromHex(MutedColor))
                .AlignCenter()
                .LineHeight(1.4f);

            col.Item().PaddingTop(80).Text("- RadicalTrainingPlatform -")
                .FontSize(10)
                .FontColor(Color.FromHex(AccentMagenta))
                .AlignCenter();
        });
    }

    private static void ComposeDomainSection(IContainer container, string domainName, List<Question> questions)
    {
        container.Column(col =>
        {
            col.Item().PaddingBottom(8).Text(domainName)
                .FontSize(18).Bold()
                .FontColor(Color.FromHex(HeadingCyan));

            col.Item().PaddingBottom(12).LineHorizontal(1f).LineColor(Color.FromHex(RuleColor));

            for (int i = 0; i < questions.Count; i++)
            {
                col.Item().Element(c => ComposeQuestion(c, questions[i]));
                if (i < questions.Count - 1)
                {
                    col.Item().PaddingVertical(6).LineHorizontal(0.5f).LineColor(Color.FromHex(RuleColor));
                }
            }
        });
    }

    private static void ComposeQuestion(IContainer container, Question q)
    {
        container.Column(col =>
        {
            // Header: Q{id}. [MULTI-SELECT: Choose {n}] {stem}
            col.Item().Text(t =>
            {
                t.DefaultTextStyle(s => s.FontColor(Color.FromHex(TextColor)).FontSize(11));

                t.Span($"Q{q.Id}. ").Bold().FontColor(Color.FromHex(AccentMagenta));

                if (q.IsMultiSelect)
                {
                    t.Span($"[MULTI-SELECT: Choose {q.CorrectAnswers.Count}] ")
                        .Bold()
                        .FontColor(Color.FromHex(HeadingCyan));
                }

                t.Span(q.Stem ?? string.Empty);
            });

            // Options
            foreach (var opt in q.Options ?? new List<AnswerOption>())
            {
                col.Item().PaddingLeft(16).PaddingTop(3).Text(t =>
                {
                    t.DefaultTextStyle(s => s.FontColor(Color.FromHex(TextColor)).FontSize(10.5f));
                    t.Span($"{(opt.Letter ?? string.Empty).ToUpperInvariant()}) ").Bold();
                    t.Span(opt.Text ?? string.Empty);
                });
            }

            // Answer line
            if (q.CorrectAnswers != null && q.CorrectAnswers.Count > 0)
            {
                col.Item().PaddingLeft(16).PaddingTop(6).Text(t =>
                {
                    t.DefaultTextStyle(s => s.FontColor(Color.FromHex(CorrectGreen)).FontSize(10.5f));
                    t.Span("✓ Answer: ").Bold();
                    t.Span(string.Join(", ", q.CorrectAnswers.Select(a => (a ?? string.Empty).ToUpperInvariant())));
                });
            }

            // Explanation
            if (!string.IsNullOrWhiteSpace(q.Explanation))
            {
                col.Item().PaddingLeft(16).PaddingTop(4).Text(t =>
                {
                    t.DefaultTextStyle(s => s.FontColor(Color.FromHex(MutedColor)).FontSize(10).Italic());
                    t.Span("Explanation: ").Bold().FontColor(Color.FromHex(MutedColor));
                    t.Span(q.Explanation);
                });
            }
        });
    }
}
