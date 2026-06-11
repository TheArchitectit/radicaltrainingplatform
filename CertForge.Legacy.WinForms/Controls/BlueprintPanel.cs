using System.Drawing.Drawing2D;
using CertForge.Core.Models;

namespace CertForge.Controls;

/// <summary>
/// Custom panel that displays exam blueprint objectives with coverage tracking.
/// Uses the synthwave theme consistent with the main app.
/// </summary>
public class BlueprintPanel : Panel
{
    private readonly VScrollBar _scrollBar;
    private readonly List<ObjectiveRow> _rows = new();
    private int _scrollOffset = 0;
    private const int RowHeight = 56;
    private const int HeaderHeight = 44;
    private string _examCode = "";
    private string _examTitle = "";
    private int _hoveredRow = -1;
    private Action<string>? _onObjectiveClick;

    // Synthwave colors
    private static readonly Color BgDark = Color.FromArgb(22, 0, 36);
    private static readonly Color BgCard = Color.FromArgb(32, 10, 52);
    private static readonly Color Cyan = Color.FromArgb(0, 255, 255);
    private static readonly Color Magenta = Color.FromArgb(255, 0, 200);
    private static readonly Color Purple = Color.FromArgb(157, 78, 221);
    private static readonly Color Green = Color.FromArgb(57, 255, 20);
    private static readonly Color Yellow = Color.FromArgb(255, 255, 0);
    private static readonly Color Red = Color.FromArgb(255, 60, 60);
    private static readonly Color TextDim = Color.FromArgb(180, 180, 200);
    private static readonly Color TextBright = Color.FromArgb(230, 230, 255);
    private static readonly Color SectionBg = Color.FromArgb(40, 15, 65);

    private record ObjectiveRow(
        bool IsSection,
        string Id,
        string Title,
        int QuestionCount,
        int TotalKnowledge,
        double CoveragePercent);

    public BlueprintPanel()
    {
        DoubleBuffered = true;
        BackColor = BgDark;

        _scrollBar = new VScrollBar
        {
            Dock = DockStyle.Right,
            Width = 14,
            Minimum = 0,
            Value = 0
        };
        _scrollBar.ValueChanged += (s, e) =>
        {
            _scrollOffset = _scrollBar.Value;
            Invalidate();
        };
        Controls.Add(_scrollBar);

        MouseWheel += (s, e) =>
        {
            int newVal = _scrollBar.Value - (e.Delta / 120 * 40);
            _scrollBar.Value = Math.Clamp(newVal, _scrollBar.Minimum, Math.Max(0, _scrollBar.Maximum - _scrollBar.LargeChange + 1));
        };

        MouseMove += OnMouseMove;
        MouseClick += OnMouseClick;
        MouseLeave += (s, e) => { _hoveredRow = -1; Invalidate(); };
        Resize += (s, e) => UpdateScrollBar();
    }

    public void SetObjectiveClickHandler(Action<string> handler) => _onObjectiveClick = handler;

    public void LoadBlueprint(ExamBlueprint blueprint, Dictionary<string, int> coverage)
    {
        _examCode = blueprint.ExamCode;
        _examTitle = blueprint.ExamTitle;
        _rows.Clear();

        foreach (var section in blueprint.Sections)
        {
            // Section header
            int sectionTotal = section.Objectives.Sum(o => coverage.GetValueOrDefault(o.Id, 0));
            int sectionKnowledge = section.Objectives.Sum(o => o.Knowledge.Count);
            _rows.Add(new ObjectiveRow(
                true,
                $"S{section.SectionNumber}",
                $"Section {section.SectionNumber}: {section.SectionTitle}",
                sectionTotal,
                sectionKnowledge,
                sectionKnowledge > 0 ? Math.Min(100, sectionTotal * 100.0 / Math.Max(1, section.Objectives.Count * 5)) : 0
            ));

            // Objective rows
            foreach (var obj in section.Objectives)
            {
                int qCount = coverage.GetValueOrDefault(obj.Id, 0);
                double pct = Math.Min(100, qCount * 100.0 / Math.Max(1, obj.Knowledge.Count * 2));
                _rows.Add(new ObjectiveRow(
                    false,
                    obj.Id,
                    $"{obj.Id} — {obj.Title}",
                    qCount,
                    obj.Knowledge.Count,
                    pct
                ));
            }
        }

        UpdateScrollBar();
        _scrollOffset = 0;
        _scrollBar.Value = 0;
        Invalidate();
    }

    private void UpdateScrollBar()
    {
        int totalHeight = HeaderHeight + _rows.Count * RowHeight + 60;
        _scrollBar.Maximum = Math.Max(0, totalHeight);
        _scrollBar.LargeChange = Math.Max(1, Height);
        _scrollBar.SmallChange = RowHeight;
    }

    private void OnMouseMove(object? sender, MouseEventArgs e)
    {
        int y = e.Y + _scrollOffset - HeaderHeight;
        int row = y / RowHeight;
        if (row >= 0 && row < _rows.Count && !_rows[row].IsSection)
        {
            if (_hoveredRow != row) { _hoveredRow = row; Invalidate(); }
        }
        else if (_hoveredRow != -1)
        {
            _hoveredRow = -1;
            Invalidate();
        }
    }

    private void OnMouseClick(object? sender, MouseEventArgs e)
    {
        if (_hoveredRow >= 0 && _hoveredRow < _rows.Count)
        {
            var row = _rows[_hoveredRow];
            if (!row.IsSection)
                _onObjectiveClick?.Invoke(row.Id);
        }
    }

    protected override void OnPaint(PaintEventArgs e)
    {
        base.OnPaint(e);
        var g = e.Graphics;
        g.SmoothingMode = SmoothingMode.AntiAlias;
        g.TextRenderingHint = System.Drawing.Text.TextRenderingHint.ClearTypeGridFit;

        int w = Width - _scrollBar.Width;
        int y = -_scrollOffset;

        // Header
        using var headerFont = new Font("Segoe UI", 13f, FontStyle.Bold);
        using var subFont = new Font("Segoe UI", 9f, FontStyle.Regular);
        using var sectionFont = new Font("Segoe UI", 10.5f, FontStyle.Bold);
        using var objFont = new Font("Segoe UI", 9.5f, FontStyle.Regular);
        using var smallFont = new Font("Segoe UI", 8f, FontStyle.Regular);
        using var cyanBrush = new SolidBrush(Cyan);
        using var magentaBrush = new SolidBrush(Magenta);
        using var textBrush = new SolidBrush(TextBright);
        using var dimBrush = new SolidBrush(TextDim);
        using var greenBrush = new SolidBrush(Green);

        // Draw header
        g.DrawString($"📋 {_examTitle}", headerFont, cyanBrush, 12, y + 6);
        int totalQ = _rows.Where(r => !r.IsSection).Sum(r => r.QuestionCount);
        int totalObj = _rows.Count(r => !r.IsSection);
        int coveredObj = _rows.Count(r => !r.IsSection && r.QuestionCount > 0);
        g.DrawString($"{coveredObj}/{totalObj} objectives covered • {totalQ} questions mapped",
            subFont, dimBrush, 12, y + 28);
        y += HeaderHeight;

        // Draw rows
        for (int i = 0; i < _rows.Count; i++)
        {
            if (y + RowHeight < 0) { y += RowHeight; continue; }
            if (y > Height) break;

            var row = _rows[i];
            var rect = new Rectangle(4, y + 1, w - 8, RowHeight - 2);

            if (row.IsSection)
            {
                // Section header
                using var sectionBg = new SolidBrush(SectionBg);
                g.FillRectangle(sectionBg, rect);
                using var sectionPen = new Pen(Purple, 1f);
                g.DrawRectangle(sectionPen, rect);
                g.DrawString(row.Title, sectionFont, magentaBrush, rect.X + 10, rect.Y + 6);
                g.DrawString($"{row.QuestionCount} questions", smallFont, dimBrush, rect.X + 10, rect.Y + 28);
            }
            else
            {
                // Objective row
                bool hovered = i == _hoveredRow;
                using var cardBg = new SolidBrush(hovered ? Color.FromArgb(45, 20, 75) : BgCard);
                g.FillRectangle(cardBg, rect);

                if (hovered)
                {
                    using var hoverPen = new Pen(Cyan, 1f);
                    g.DrawRectangle(hoverPen, rect);
                }

                // Title
                g.DrawString(row.Title, objFont, textBrush, rect.X + 10, rect.Y + 4);

                // Coverage bar
                int barX = rect.X + 10;
                int barY = rect.Y + 28;
                int barW = Math.Min(200, rect.Width - 130);
                int barH = 12;
                using var barBg = new SolidBrush(Color.FromArgb(20, 5, 35));
                g.FillRectangle(barBg, barX, barY, barW, barH);

                Color barColor = row.CoveragePercent >= 70 ? Green :
                                 row.CoveragePercent >= 40 ? Yellow : Red;
                int fillW = (int)(barW * Math.Min(100, row.CoveragePercent) / 100.0);
                if (fillW > 0)
                {
                    using var fillBrush = new SolidBrush(barColor);
                    g.FillRectangle(fillBrush, barX, barY, fillW, barH);
                }

                // Stats text
                string stats = $"{row.QuestionCount}q / {row.TotalKnowledge}k";
                g.DrawString(stats, smallFont, dimBrush, barX + barW + 8, barY - 1);

                // Coverage percent
                using var pctBrush = new SolidBrush(barColor);
                string pctText = $"{row.CoveragePercent:F0}%";
                var pctSize = g.MeasureString(pctText, smallFont);
                g.DrawString(pctText, smallFont, pctBrush, rect.Right - pctSize.Width - 10, barY - 1);
            }

            y += RowHeight;
        }

        // Bottom summary
        y = Math.Max(y, Height - 50);
        if (y - _scrollOffset < Height)
        {
            using var summaryPen = new Pen(Purple, 0.5f);
            g.DrawLine(summaryPen, 4, y, w - 4, y);
        }
    }
}
