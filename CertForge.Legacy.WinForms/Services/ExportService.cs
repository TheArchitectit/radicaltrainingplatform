using PdfSharp.Drawing;
using PdfSharp.Pdf;
using CertForge.Core.Models;
using System.Text.RegularExpressions;

namespace CertForge.Services;

/// <summary>
/// Exports exam questions to professionally formatted PDF files.
/// </summary>
static class ExportService
{
    // Colors matching synthwave theme
    private static readonly XColor HeaderBg = XColor.FromArgb(11, 11, 26);
    private static readonly XColor AccentCyan = XColor.FromArgb(0, 240, 255);
    private static readonly XColor AccentMagenta = XColor.FromArgb(255, 45, 149);
    private static readonly XColor TextColor = XColor.FromArgb(30, 30, 30);
    private static readonly XColor CorrectGreen = XColor.FromArgb(0, 180, 80);
    private static readonly XColor DimGray = XColor.FromArgb(100, 100, 100);
    private static readonly XColor LightBg = XColor.FromArgb(245, 245, 250);

    private static readonly XFont TitleFont = new("Segoe UI", 24, XFontStyleEx.Bold);
    private static readonly XFont SubtitleFont = new("Segoe UI", 14, XFontStyleEx.Regular);
    private static readonly XFont SectionFont = new("Segoe UI", 16, XFontStyleEx.Bold);
    private static readonly XFont QuestionFont = new("Segoe UI", 10, XFontStyleEx.Bold);
    private static readonly XFont BodyFont = new("Segoe UI", 9.5, XFontStyleEx.Regular);
    private static readonly XFont AnswerFont = new("Segoe UI", 9.5, XFontStyleEx.Regular);
    private static readonly XFont CorrectFont = new("Segoe UI", 9, XFontStyleEx.Bold);
    private static readonly XFont FooterFont = new("Segoe UI", 7.5, XFontStyleEx.Regular);
    private static readonly XFont HeaderBarFont = new("Segoe UI", 8, XFontStyleEx.Bold);

    private const double MarginLeft = 50;
    private const double MarginRight = 50;
    private const double MarginTop = 60;
    private const double MarginBottom = 50;
    private const double FooterY = 820;

    /// <summary>
    /// Export a single exam to PDF.
    /// </summary>
    public static void ExportExam(string examName, List<Question> questions, string outputPath, bool includeAnswers)
    {
        var doc = new PdfDocument();
        doc.Info.Title = $"Nutanix {examName} Practice Questions";
        doc.Info.Author = "Nutanix Certification Study Tool";

        AddTitlePage(doc, examName, questions.Count);

        double y = MarginTop;
        PdfPage page = AddPage(doc);
        XGraphics gfx = XGraphics.FromPdfPage(page);
        double pageWidth = page.Width.Point;
        double contentWidth = pageWidth - MarginLeft - MarginRight;
        int pageNum = 2;

        DrawHeader(gfx, pageWidth, examName, pageNum);

        for (int i = 0; i < questions.Count; i++)
        {
            var q = questions[i];
            double neededHeight = EstimateQuestionHeight(q, contentWidth, includeAnswers);

            if (y + neededHeight > FooterY - 20)
            {
                DrawFooter(gfx, pageWidth, pageNum);
                gfx.Dispose();
                page = AddPage(doc);
                gfx = XGraphics.FromPdfPage(page);
                pageNum++;
                DrawHeader(gfx, pageWidth, examName, pageNum);
                y = MarginTop;
            }

            y = DrawQuestion(gfx, q, i + 1, y, contentWidth, includeAnswers);
            y += 12;
        }

        DrawFooter(gfx, pageWidth, pageNum);
        gfx.Dispose();

        if (includeAnswers)
        {
            AddAnswerKeyPage(doc, examName, questions);
        }

        doc.Save(outputPath);
    }

    /// <summary>
    /// Export all exams to a single combined PDF.
    /// </summary>
    public static void ExportAll(Dictionary<string, List<Question>> exams, string outputPath, bool includeAnswers)
    {
        var doc = new PdfDocument();
        doc.Info.Title = "Nutanix Certification Study Guide — Complete";
        doc.Info.Author = "Nutanix Certification Study Tool";

        int totalQ = 0;
        foreach (var kv in exams) totalQ += kv.Value.Count;

        // Grand title page
        var titlePage = AddPage(doc);
        var gfx = XGraphics.FromPdfPage(titlePage);
        double pw = titlePage.Width.Point;

        gfx.DrawRectangle(new XSolidBrush(HeaderBg), 0, 0, pw, titlePage.Height.Point);

        var bigTitle = new XFont("Segoe UI", 32, XFontStyleEx.Bold);
        gfx.DrawString("NUTANIX", bigTitle, new XSolidBrush(AccentCyan),
            new XRect(0, 200, pw, 50), XStringFormats.Center);
        gfx.DrawString("Certification Study Guide", new XFont("Segoe UI", 20, XFontStyleEx.Regular),
            new XSolidBrush(XColors.White), new XRect(0, 250, pw, 40), XStringFormats.Center);

        var infoFont = new XFont("Segoe UI", 12, XFontStyleEx.Regular);
        string[] examNames = { "NCP-AI 6.10 — AI Infrastructure",
                               "NCP-US 6.10 — Unified Storage",
                               "NCP-CI 6.10 — Cloud Integration",
                               "NCM-MCI 6.10 — Multicloud Infrastructure (Master)" };
        double ey = 340;
        foreach (var name in examNames)
        {
            gfx.DrawString($"• {name}", infoFont, new XSolidBrush(AccentMagenta),
                new XRect(pw / 2 - 200, ey, 400, 24), XStringFormats.CenterLeft);
            ey += 28;
        }

        gfx.DrawString($"{totalQ} Practice Questions — Fully Validated",
            new XFont("Segoe UI", 14, XFontStyleEx.Bold),
            new XSolidBrush(AccentCyan), new XRect(0, ey + 30, pw, 30), XStringFormats.Center);
        gfx.Dispose();

        // Each exam
        foreach (var kv in exams)
        {
            string examName = kv.Key;
            var questions = kv.Value;

            AddTitlePage(doc, examName, questions.Count);

            double y = MarginTop;
            var page = AddPage(doc);
            gfx = XGraphics.FromPdfPage(page);
            int pageNum = 1;
            DrawHeader(gfx, pw, examName, pageNum);

            for (int i = 0; i < questions.Count; i++)
            {
                var q = questions[i];
                double needed = EstimateQuestionHeight(q, pw - MarginLeft - MarginRight, includeAnswers);

                if (y + needed > FooterY - 20)
                {
                    DrawFooter(gfx, pw, pageNum);
                    gfx.Dispose();
                    page = AddPage(doc);
                    gfx = XGraphics.FromPdfPage(page);
                    pageNum++;
                    DrawHeader(gfx, pw, examName, pageNum);
                    y = MarginTop;
                }

                y = DrawQuestion(gfx, q, i + 1, y, pw - MarginLeft - MarginRight, includeAnswers);
                y += 12;
            }

            DrawFooter(gfx, pw, pageNum);
            gfx.Dispose();

            if (includeAnswers)
                AddAnswerKeyPage(doc, examName, questions);
        }

        doc.Save(outputPath);
    }

    private static PdfPage AddPage(PdfDocument doc)
    {
        var page = doc.AddPage();
        page.Size = PdfSharp.PageSize.Letter;
        return page;
    }

    private static void AddTitlePage(PdfDocument doc, string examName, int questionCount)
    {
        var page = AddPage(doc);
        var gfx = XGraphics.FromPdfPage(page);
        double pw = page.Width.Point;
        double ph = page.Height.Point;

        // Dark header band
        gfx.DrawRectangle(new XSolidBrush(HeaderBg), 0, 0, pw, 120);
        gfx.DrawString("NUTANIX EXAM PREP", new XFont("Segoe UI", 20, XFontStyleEx.Bold),
            new XSolidBrush(AccentCyan), new XRect(0, 30, pw, 40), XStringFormats.Center);
        gfx.DrawString(examName, new XFont("Segoe UI", 14, XFontStyleEx.Regular),
            new XSolidBrush(XColors.White), new XRect(0, 70, pw, 30), XStringFormats.Center);

        // Accent line
        gfx.DrawRectangle(new XSolidBrush(AccentMagenta), 0, 120, pw, 3);

        // Info
        gfx.DrawString($"{questionCount} Practice Questions", new XFont("Segoe UI", 18, XFontStyleEx.Bold),
            new XSolidBrush(TextColor), new XRect(0, 200, pw, 40), XStringFormats.Center);

        var info = GetExamInfo(examName);
        gfx.DrawString(info, SubtitleFont, new XSolidBrush(DimGray),
            new XRect(0, 250, pw, 30), XStringFormats.Center);

        gfx.DrawString("Generated by Nutanix Certification Study Tool",
            FooterFont, new XSolidBrush(DimGray),
            new XRect(0, ph - 40, pw, 20), XStringFormats.Center);
        gfx.Dispose();
    }

    private static string GetExamInfo(string examName)
    {
        return examName switch
        {
            var n when n.Contains("NCP-AI") => "75 MCQ | 120 minutes | AI Infrastructure",
            var n when n.Contains("NCP-US") => "75 MCQ | 120 minutes | Unified Storage",
            var n when n.Contains("NCP-CI") => "75 MCQ | 120 minutes | Cloud Integration",
            var n when n.Contains("NCM-MCI") => "16-20 Live Lab | 180 minutes | Multicloud Infrastructure (Master)",
            _ => ""
        };
    }

    private static void DrawHeader(XGraphics gfx, double pageWidth, string examName, int pageNum)
    {
        gfx.DrawRectangle(new XSolidBrush(HeaderBg), 0, 0, pageWidth, 28);
        gfx.DrawString($"  {examName}", HeaderBarFont, new XSolidBrush(AccentCyan),
            new XRect(10, 6, 300, 16), XStringFormats.CenterLeft);
        gfx.DrawRectangle(new XSolidBrush(AccentMagenta), 0, 28, pageWidth, 1.5);
    }

    private static void DrawFooter(XGraphics gfx, double pageWidth, int pageNum)
    {
        gfx.DrawString($"Page {pageNum}", FooterFont, new XSolidBrush(DimGray),
            new XRect(0, FooterY, pageWidth, 20), XStringFormats.Center);
        gfx.DrawString("nutanixcertificationtool — github.com/rogerlundnetcenter", FooterFont,
            new XSolidBrush(DimGray), new XRect(MarginLeft, FooterY, 400, 20), XStringFormats.CenterLeft);
    }

    private static double EstimateQuestionHeight(Question q, double contentWidth, bool includeAnswers)
    {
        // Rough estimate: question stem + options + answer line
        int stemLines = (int)Math.Ceiling(q.Stem.Length / 80.0);
        double h = 20 + stemLines * 14; // Q# header + stem
        h += q.Options.Count * 14;      // options
        if (includeAnswers) h += 16;     // answer line
        h += 8;                          // spacing
        return Math.Max(h, 60);
    }

    private static double DrawQuestion(XGraphics gfx, Question q, int num, double y, double contentWidth, bool includeAnswers)
    {
        // Light background card
        double cardHeight = EstimateQuestionHeight(q, contentWidth, includeAnswers);
        gfx.DrawRectangle(new XSolidBrush(LightBg),
            MarginLeft - 8, y - 4, contentWidth + 16, cardHeight);

        // Question number
        string qLabel = $"Q{num}.";
        gfx.DrawString(qLabel, QuestionFont, new XSolidBrush(AccentMagenta),
            new XPoint(MarginLeft, y + 12));

        // Stem text (wrap long lines)
        var stemRect = new XRect(MarginLeft + 30, y, contentWidth - 30, 200);
        var tf = new PdfSharp.Drawing.Layout.XTextFormatter(gfx);
        tf.DrawString(q.Stem, BodyFont, new XSolidBrush(TextColor), stemRect);
        int stemLines = (int)Math.Ceiling(q.Stem.Length / 85.0);
        y += Math.Max(stemLines * 13, 14) + 6;

        // Options
        foreach (var opt in q.Options)
        {
            string prefix = opt.Letter.ToUpper();
            bool isCorrect = includeAnswers && q.CorrectAnswers.Contains(opt.Letter);
            var brush = isCorrect ? new XSolidBrush(CorrectGreen) : new XSolidBrush(TextColor);
            var font = isCorrect ? CorrectFont : AnswerFont;
            string marker = isCorrect ? "✓" : " ";

            string optText = $"  {marker} {prefix}) {opt.Text}";
            // Truncate very long options
            if (optText.Length > 120) optText = optText[..117] + "...";

            gfx.DrawString(optText, font, brush, new XPoint(MarginLeft + 20, y + 11));
            y += 13;
        }

        // Correct answer line
        if (includeAnswers)
        {
            y += 3;
            string answers = string.Join(", ", q.CorrectAnswers.Select(a => a.ToUpper()));
            gfx.DrawString($"Answer: {answers}", CorrectFont, new XSolidBrush(CorrectGreen),
                new XPoint(MarginLeft + 20, y + 11));
            y += 14;
        }

        return y;
    }

    private static void AddAnswerKeyPage(PdfDocument doc, string examName, List<Question> questions)
    {
        var page = AddPage(doc);
        var gfx = XGraphics.FromPdfPage(page);
        double pw = page.Width.Point;
        double cw = pw - MarginLeft - MarginRight;

        gfx.DrawString($"{examName} — Answer Key", SectionFont, new XSolidBrush(TextColor),
            new XRect(MarginLeft, 40, cw, 30), XStringFormats.CenterLeft);
        gfx.DrawRectangle(new XSolidBrush(AccentMagenta), MarginLeft, 68, cw, 1.5);

        double y = 85;
        int col = 0;
        double colWidth = cw / 4;
        var keyFont = new XFont("Consolas", 9, XFontStyleEx.Regular);
        int pageNum = 1;

        for (int i = 0; i < questions.Count; i++)
        {
            string answers = string.Join(",", questions[i].CorrectAnswers.Select(a => a.ToUpper()));
            string line = $"Q{i + 1,3}: {answers}";

            double x = MarginLeft + col * colWidth;
            gfx.DrawString(line, keyFont, new XSolidBrush(TextColor), new XPoint(x, y + 10));
            y += 13;

            if (y > FooterY - 30)
            {
                y = 85;
                col++;
                if (col >= 4)
                {
                    col = 0;
                    DrawFooter(gfx, pw, pageNum);
                    gfx.Dispose();
                    page = AddPage(doc);
                    gfx = XGraphics.FromPdfPage(page);
                    pageNum++;
                    gfx.DrawString($"{examName} — Answer Key (cont.)", SectionFont,
                        new XSolidBrush(TextColor), new XRect(MarginLeft, 40, cw, 30), XStringFormats.CenterLeft);
                    gfx.DrawRectangle(new XSolidBrush(AccentMagenta), MarginLeft, 68, cw, 1.5);
                }
            }
        }

        DrawFooter(gfx, pw, pageNum);
        gfx.Dispose();
    }
}
