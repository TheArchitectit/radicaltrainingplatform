namespace RadicalTrainingPlatform.Core.PdfExport;

/// <summary>
/// Identity fields for a PDF export. CanonicalExamId and DisplayName are
/// separate on purpose (R-18): the display label must never be used as the
/// canonical exam code on the PDF path — that was the NET-10 export defect.
/// </summary>
public sealed record ExportMetadata(
    string CanonicalExamId,
    string DisplayName,
    string? TrackTitle = null,
    string? PackVersion = null,
    string? SourceReviewDate = null);
