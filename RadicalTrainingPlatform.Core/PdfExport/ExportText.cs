using System.Collections.Generic;

namespace RadicalTrainingPlatform.Core.PdfExport;

/// <summary>
/// Pure text composition for PDF identity strings. The renderer draws
/// exactly these; fixtures assert on this surface so canonical-vs-display
/// separation and the vendor-neutral footer are testable without a PDF
/// text extractor (R-18 / R-12).
/// </summary>
public static class ExportText
{
    /// <summary>REQ-BRAND-02 / SPEC-16 — exact normative disclaimer, byte-for-byte.</summary>
    public const string Disclaimer =
        "This is independent study material. It is not official training and is not endorsed or approved by CompTIA, Nutanix, or any other certification body.";

    /// <summary>Unaffiliated status line for the footer (R-12 doc-truth).</summary>
    public const string UnaffiliatedStatus = "Independent study material — not affiliated with any certification body.";

    /// <summary>The code slot always carries the canonical exam ID, never the display label.</summary>
    public static string HeaderCode(ExportMetadata meta) => meta.CanonicalExamId;

    /// <summary>Cover title is the human display name — deliberately not the code.</summary>
    public static string CoverTitle(ExportMetadata meta) => meta.DisplayName;

    /// <summary>Cover code line is the canonical ID (same as the header code slot).</summary>
    public static string CoverCode(ExportMetadata meta) => meta.CanonicalExamId;

    /// <summary>
    /// Vendor-neutral footer (R-18/R-12): track title, unaffiliated status,
    /// official exam code, pack version, source review date. Missing optional
    /// fields are omitted rather than invented. Never vendor branding.
    /// </summary>
    public static IReadOnlyList<string> FooterLines(ExportMetadata meta)
    {
        var lines = new List<string>();

        if (!string.IsNullOrWhiteSpace(meta.TrackTitle))
            lines.Add($"Track: {meta.TrackTitle}");

        lines.Add(UnaffiliatedStatus);

        var facts = new List<string> { $"Official exam code: {meta.CanonicalExamId}" };
        if (!string.IsNullOrWhiteSpace(meta.PackVersion))
            facts.Add($"Pack: {meta.PackVersion}");
        if (!string.IsNullOrWhiteSpace(meta.SourceReviewDate))
            facts.Add($"Source reviewed: {meta.SourceReviewDate}");
        lines.Add(string.Join("  ·  ", facts));

        lines.Add(Disclaimer);
        return lines;
    }

    /// <summary>
    /// Every identity string that appears on the rendered document. Fixtures
    /// assert against this so the PDF path cannot silently reintroduce the
    /// display-label-as-canonical-code defect (R-18).
    /// </summary>
    public static IReadOnlyList<string> AllIdentityStrings(ExportMetadata meta)
    {
        var list = new List<string>
        {
            HeaderCode(meta),
            CoverTitle(meta),
            CoverCode(meta),
        };
        list.AddRange(FooterLines(meta));
        return list;
    }
}
