using Avalonia;
using Avalonia.Controls;
using Avalonia.Input;
using Avalonia.Media;
using System.Globalization;
using RadicalTrainingPlatform.Core.Models;

namespace RadicalTrainingPlatform.Avalonia.Controls;

/// <summary>
/// Custom draw control that renders exam blueprint objectives with
/// coverage bars. Ported from WinForms BlueprintPanel to Avalonia.
/// </summary>
public class BlueprintCanvas : Control
{
    private const int RowHeight = 56;
    private const int HeaderHeight = 44;

    private static readonly Color BgDark    = Color.Parse("#160024");
    private static readonly Color BgCard    = Color.Parse("#200A34");
    private static readonly Color Cyan      = Color.Parse("#00FFFF");
    private static readonly Color Magenta   = Color.Parse("#FF00C8");
    private static readonly Color Purple    = Color.Parse("#9D4EDD");
    private static readonly Color Green     = Color.Parse("#39FF14");
    private static readonly Color Yellow    = Color.Parse("#FFFF00");
    private static readonly Color Red       = Color.Parse("#FF3C3C");
    private static readonly Color TextDim   = Color.Parse("#B4B4C8");
    private static readonly Color TextBright= Color.Parse("#E6E6FF");
    private static readonly Color SectionBg = Color.Parse("#280F41");
    private static readonly Color HoverBg   = Color.Parse("#2D144B");

    private record ObjectiveRow(
        bool IsSection,
        string Id,
        string Title,
        int QuestionCount,
        int TotalKnowledge,
        double CoveragePercent);

    private List<ObjectiveRow> _rows = new();
    private string _examCode = "";
    private string _examTitle = "";
    private int _hoveredRow = -1;
    public Action<string>? OnObjectiveClick;

    public BlueprintCanvas()
    {
        ClipToBounds = true;
        PointerMoved += OnPointerMoved;
        PointerPressed += OnPointerPressed;
        PointerExited += (s, e) =>
        {
            if (_hoveredRow != -1)
            {
                _hoveredRow = -1;
                InvalidateVisual();
            }
        };
    }

    public void LoadBlueprint(ExamBlueprint blueprint, Dictionary<string, int> coverage)
    {
        _examCode = blueprint.ExamCode;
        _examTitle = blueprint.ExamTitle;
        _rows.Clear();

        foreach (var section in blueprint.Sections)
        {
            int sectionTotal = section.Objectives.Sum(o => coverage.GetValueOrDefault(o.Id, 0));
            int sectionKnowledge = section.Objectives.Sum(o => o.Knowledge.Count);
            _rows.Add(new ObjectiveRow(
                true,
                $"S{section.SectionNumber}",
                $"Section {section.SectionNumber}: {section.SectionTitle}",
                sectionTotal,
                sectionKnowledge,
                sectionKnowledge > 0 ? Math.Min(100, sectionTotal * 100.0 / Math.Max(1, section.Objectives.Count * 5)) : 0));

            foreach (var obj in section.Objectives)
            {
                int qCount = coverage.GetValueOrDefault(obj.Id, 0);
                double pct = Math.Min(100, qCount * 100.0 / Math.Max(1, obj.Knowledge.Count * 2));
                _rows.Add(new ObjectiveRow(false, obj.Id, $"{obj.Id} — {obj.Title}", qCount, obj.Knowledge.Count, pct));
            }
        }

        InvalidateMeasure();
        InvalidateVisual();
    }

    protected override Size MeasureOverride(Size availableSize)
    {
        double height = HeaderHeight + _rows.Count * RowHeight + 20;
        double width = Math.Max(400, availableSize.Width);
        return new Size(width, height);
    }

    protected override Size ArrangeOverride(Size finalSize)
    {
        return finalSize;
    }

    public override void Render(DrawingContext context)
    {
        base.Render(context);
        Draw(context);
    }

    private void Draw(DrawingContext g)
    {
        int w = (int)Bounds.Width;
        int h = (int)Bounds.Height;
        if (w <= 0 || h <= 0) return;

        double y = 0;

        // Typefaces
        var headerTypeface   = new Typeface("Inter", FontStyle.Normal, FontWeight.Bold);
        var subTypeface      = new Typeface("Inter", FontStyle.Normal, FontWeight.Normal);
        var sectionTypeface  = new Typeface("Inter", FontStyle.Normal, FontWeight.Bold);
        var objTypeface      = new Typeface("Inter", FontStyle.Normal, FontWeight.Normal);
        var smallTypeface    = new Typeface("Inter", FontStyle.Normal, FontWeight.Normal);

        // Brushes
        var cyanBrush    = new SolidColorBrush(Cyan);
        var magentaBrush = new SolidColorBrush(Magenta);
        var textBrush    = new SolidColorBrush(TextBright);
        var dimBrush     = new SolidColorBrush(TextDim);
        var bgBrush      = new SolidColorBrush(BgDark);
        var cardBrush    = new SolidColorBrush(BgCard);
        var sectionBgBrush = new SolidColorBrush(SectionBg);
        var hoverBgBrush = new SolidColorBrush(HoverBg);
        var purplePen    = new Pen(new SolidColorBrush(Purple), 1.0);
        var hoverPen     = new Pen(new SolidColorBrush(Cyan), 1.0);
        var barBgBrush   = new SolidColorBrush(Color.Parse("#140523"));

        // Background
        g.DrawRectangle(bgBrush, null, new Rect(0, 0, w, h));

        // Header
        var headerFt = new FormattedText(
            $"📋 {_examTitle}",
            CultureInfo.CurrentCulture,
            FlowDirection.LeftToRight,
            headerTypeface,
            13,
            cyanBrush);
        g.DrawText(headerFt, new Point(12, y + 6));

        int totalQ = _rows.Where(r => !r.IsSection).Sum(r => r.QuestionCount);
        int totalObj = _rows.Count(r => !r.IsSection);
        int coveredObj = _rows.Count(r => !r.IsSection && r.QuestionCount > 0);
        var subFt = new FormattedText(
            $"{coveredObj}/{totalObj} objectives covered • {totalQ} questions mapped",
            CultureInfo.CurrentCulture,
            FlowDirection.LeftToRight,
            subTypeface,
            9,
            dimBrush);
        g.DrawText(subFt, new Point(12, y + 30));

        y += HeaderHeight;

        // Rows
        for (int i = 0; i < _rows.Count; i++)
        {
            var row = _rows[i];
            var rect = new Rect(4, y + 1, w - 8, RowHeight - 2);

            if (row.IsSection)
            {
                g.DrawRectangle(sectionBgBrush, purplePen, rect, 4, 4);

                var sectionFt = new FormattedText(
                    row.Title,
                    CultureInfo.CurrentCulture,
                    FlowDirection.LeftToRight,
                    sectionTypeface,
                    10.5,
                    magentaBrush);
                g.DrawText(sectionFt, new Point(rect.X + 10, rect.Y + 6));

                var countFt = new FormattedText(
                    $"{row.QuestionCount} questions",
                    CultureInfo.CurrentCulture,
                    FlowDirection.LeftToRight,
                    smallTypeface,
                    8,
                    dimBrush);
                g.DrawText(countFt, new Point(rect.X + 10, rect.Y + 28));
            }
            else
            {
                bool hovered = i == _hoveredRow;
                var bg = hovered ? hoverBgBrush : cardBrush;
                g.DrawRectangle(bg, hovered ? hoverPen : null, rect, 4, 4);

                var objFt = new FormattedText(
                    row.Title,
                    CultureInfo.CurrentCulture,
                    FlowDirection.LeftToRight,
                    objTypeface,
                    9.5,
                    textBrush);
                g.DrawText(objFt, new Point(rect.X + 10, rect.Y + 4));

                // Coverage bar
                int barX = (int)rect.X + 10;
                int barY = (int)rect.Y + 28;
                int barW = Math.Min(200, (int)rect.Width - 130);
                int barH = 12;

                g.DrawRectangle(barBgBrush, null, new Rect(barX, barY, barW, barH), 2, 2);

                Color barColor = row.CoveragePercent >= 70 ? Green :
                                 row.CoveragePercent >= 40 ? Yellow : Red;
                int fillW = (int)(barW * Math.Min(100, row.CoveragePercent) / 100.0);
                if (fillW > 0)
                {
                    var fillBrush = new SolidColorBrush(barColor);
                    g.DrawRectangle(fillBrush, null, new Rect(barX, barY, fillW, barH), 2, 2);
                }

                var statsFt = new FormattedText(
                    $"{row.QuestionCount}q / {row.TotalKnowledge}k",
                    CultureInfo.CurrentCulture,
                    FlowDirection.LeftToRight,
                    smallTypeface,
                    8,
                    dimBrush);
                g.DrawText(statsFt, new Point(barX + barW + 8, barY - 1));

                var pctBrush = new SolidColorBrush(barColor);
                var pctFt = new FormattedText(
                    $"{row.CoveragePercent:F0}%",
                    CultureInfo.CurrentCulture,
                    FlowDirection.LeftToRight,
                    smallTypeface,
                    8,
                    pctBrush);
                var pctWidth = pctFt.WidthIncludingTrailingWhitespace;
                g.DrawText(pctFt, new Point(rect.Right - pctWidth - 10, barY - 1));
            }

            y += RowHeight;
        }
    }

    private void OnPointerMoved(object? sender, PointerEventArgs e)
    {
        var pos = e.GetPosition(this);
        double y = pos.Y - HeaderHeight;
        int row = (int)(y / RowHeight);
        if (row >= 0 && row < _rows.Count && !_rows[row].IsSection)
        {
            if (_hoveredRow != row) { _hoveredRow = row; InvalidateVisual(); }
        }
        else if (_hoveredRow != -1)
        {
            _hoveredRow = -1;
            InvalidateVisual();
        }
    }

    private void OnPointerPressed(object? sender, PointerPressedEventArgs e)
    {
        if (_hoveredRow >= 0 && _hoveredRow < _rows.Count)
        {
            var row = _rows[_hoveredRow];
            if (!row.IsSection)
                OnObjectiveClick?.Invoke(row.Id);
        }
    }
}
