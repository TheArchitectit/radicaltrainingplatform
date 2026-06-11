using Avalonia;
using Avalonia.Controls;
using Avalonia.Interactivity;
using Avalonia.Media;
using Avalonia.Threading;

namespace CertForge.Avalonia.Controls;

/// <summary>
/// Custom progress bar with synthwave neon gradient glow.
/// Shows a smooth animated fill with percentage text.
/// </summary>
public partial class SynthwaveProgressBar : UserControl
{
    public static readonly StyledProperty<double> ProgressProperty =
        AvaloniaProperty.Register<SynthwaveProgressBar, double>(
            nameof(Progress),
            defaultValue: 0.0,
            coerce: (_, v) => Math.Clamp(v, 0.0, 100.0));

    public static readonly StyledProperty<bool> ShowPercentTextProperty =
        AvaloniaProperty.Register<SynthwaveProgressBar, bool>(
            nameof(ShowPercentText),
            defaultValue: true);

    public static readonly StyledProperty<bool> AnimateShimmerProperty =
        AvaloniaProperty.Register<SynthwaveProgressBar, bool>(
            nameof(AnimateShimmer),
            defaultValue: true);

    private DispatcherTimer? _shimmerTimer;
    private double _shimmerOffset = -50;

    public double Progress
    {
        get => GetValue(ProgressProperty);
        set => SetValue(ProgressProperty, Math.Clamp(value, 0.0, 100.0));
    }

    public bool ShowPercentText
    {
        get => GetValue(ShowPercentTextProperty);
        set => SetValue(ShowPercentTextProperty, value);
    }

    public bool AnimateShimmer
    {
        get => GetValue(AnimateShimmerProperty);
        set => SetValue(AnimateShimmerProperty, value);
    }

    public SynthwaveProgressBar()
    {
        InitializeComponent();

        ProgressProperty.Changed.AddClassHandler<SynthwaveProgressBar>((s, e) => s.OnProgressChanged());
        SizeChanged += OnSizeChanged;

        // Start shimmer animation
        if (AnimateShimmer)
        {
            StartShimmer();
        }
    }

    protected override void OnUnloaded(RoutedEventArgs e)
    {
        base.OnUnloaded(e);
        StopShimmer();
    }

    private void OnSizeChanged(object? sender, SizeChangedEventArgs e)
    {
        UpdateFill();
    }

    private void OnProgressChanged()
    {
        UpdateFill();
    }

    private void UpdateFill()
    {
        if (ProgressFill == null || GlowFill == null || PercentText == null)
            return;

        var trackWidth = Bounds.Width;
        if (trackWidth <= 0)
            trackWidth = 300; // fallback

        // Account for the percent text column margin
        var percentTextWidth = ShowPercentText ? 40 : 0;
        var fillMaxWidth = Math.Max(0, trackWidth - percentTextWidth);

        var fillWidth = fillMaxWidth * (Progress / 100.0);
        fillWidth = Math.Max(0, fillWidth);

        ProgressFill.Width = fillWidth;
        GlowFill.Width = fillWidth;

        PercentText.IsVisible = ShowPercentText;
        PercentText.Text = $"{Math.Round(Progress)}%";

        // Color shift based on progress
        var percent = Progress / 100.0;
        var startColor = Color.Parse("#FF2D95");
        var endColor = Color.Parse("#00F0FF");

        var r = (byte)(startColor.R + (endColor.R - startColor.R) * percent);
        var g = (byte)(startColor.G + (endColor.G - startColor.G) * percent);
        var b = (byte)(startColor.B + (endColor.B - startColor.B) * percent);

        PercentText.Foreground = new SolidColorBrush(new Color(255, r, g, b));
    }

    private void StartShimmer()
    {
        if (Shimmer == null)
            return;

        Shimmer.IsVisible = true;
        _shimmerTimer = new DispatcherTimer
        {
            Interval = TimeSpan.FromMilliseconds(30)
        };

        _shimmerTimer.Tick += (s, e) =>
        {
            if (Shimmer == null || _shimmerTimer == null)
                return;

            var trackWidth = Bounds.Width > 0 ? Bounds.Width : 300;
            _shimmerOffset += 3;

            if (_shimmerOffset > trackWidth + 50)
                _shimmerOffset = -50;

            // Only show shimmer on filled area
            var fillWidth = (trackWidth - 40) * (Progress / 100.0);
            if (fillWidth > 0 && _shimmerOffset < fillWidth)
            {
                Shimmer.IsVisible = true;
                Shimmer.Margin = new Thickness(_shimmerOffset, 1, 0, 0);
            }
            else
            {
                Shimmer.IsVisible = false;
            }
        };

        _shimmerTimer.Start();
    }

    private void StopShimmer()
    {
        _shimmerTimer?.Stop();
        _shimmerTimer = null;
    }
}
