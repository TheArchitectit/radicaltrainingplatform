using System.Drawing.Drawing2D;

namespace RadicalTrainingPlatform.Controls;

class AnimatedProgressBar : Control
{
    private int _value;
    private int _maximum = 100;
    private float _glowPhase;
    private readonly System.Windows.Forms.Timer _animTimer;

    public int Value
    {
        get => _value;
        set { _value = Math.Clamp(value, 0, _maximum); Invalidate(); }
    }

    public int Maximum
    {
        get => _maximum;
        set { _maximum = Math.Max(1, value); Invalidate(); }
    }

    public AnimatedProgressBar()
    {
        SetStyle(
            ControlStyles.OptimizedDoubleBuffer |
            ControlStyles.AllPaintingInWmPaint |
            ControlStyles.UserPaint, true);
        Height = 8;
        BackColor = SynthwaveColors.DeepSpace;

        _animTimer = new System.Windows.Forms.Timer { Interval = 33 };
        _animTimer.Tick += (_, _) => { _glowPhase += 0.1f; Invalidate(); };
    }

    public void StartAnimation() => _animTimer.Start();
    public void StopAnimation() => _animTimer.Stop();

    protected override void OnPaint(PaintEventArgs e)
    {
        var g = e.Graphics;
        g.SmoothingMode = SmoothingMode.AntiAlias;

        using var trackBrush = new SolidBrush(SynthwaveColors.CardBg);
        g.FillRectangle(trackBrush, 0, 0, Width, Height);

        if (_value <= 0 || _maximum <= 0) return;

        float pct = (float)_value / _maximum;
        int fillWidth = (int)(Width * pct);
        if (fillWidth < 1) return;

        float glowAlpha = 40 + 20 * (float)Math.Sin(_glowPhase);
        using var glowBrush = new SolidBrush(Color.FromArgb((int)glowAlpha, SynthwaveColors.NeonMagenta));
        g.FillRectangle(glowBrush, 0, 0, Math.Min(fillWidth + 4, Width), Height);

        using var gradBrush = new LinearGradientBrush(
            new Rectangle(0, 0, Math.Max(fillWidth, 1), Height),
            SynthwaveColors.NeonMagenta, SynthwaveColors.NeonCyan,
            LinearGradientMode.Horizontal);
        g.FillRectangle(gradBrush, 0, 0, fillWidth, Height);

        int flareX = Math.Max(0, fillWidth - 3);
        using var flareBrush = new SolidBrush(Color.FromArgb(180, Color.White));
        g.FillRectangle(flareBrush, flareX, 0, 3, Height);

        for (int y = 0; y < Height; y += 2)
        {
            using var scanBrush = new SolidBrush(Color.FromArgb(30, Color.Black));
            g.FillRectangle(scanBrush, 0, y, fillWidth, 1);
        }
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing) { _animTimer.Stop(); _animTimer.Dispose(); }
        base.Dispose(disposing);
    }
}
