using Avalonia;
using Avalonia.Controls;
using Avalonia.Layout;
using Avalonia.Markup.Xaml;
using Avalonia.Media;
using RadicalTrainingPlatform.Core.ViewModels;

namespace RadicalTrainingPlatform.Avalonia.Views;

/// <summary>
/// Study statistics for one session. Previously a static mock-up (85%, four
/// fake domains, "Started Jun 10") that nothing ever instantiated; now fed by
/// ExamSessionViewModel and reachable from the sidebar.
/// </summary>
public partial class StatsView : UserControl
{
    public StatsView()
    {
        InitializeComponent();
    }

    /// <summary>
    /// Render real session data. Shows the empty-state prompt when nothing has
    /// been answered yet rather than inventing numbers.
    /// </summary>
    public void LoadStats(ExamSessionViewModel? session)
    {
        DomainList.Children.Clear();

        if (session == null || session.CorrectCount + session.WrongCount == 0)
        {
            EmptyStateText.IsVisible = true;
            DataPanel.IsVisible = false;
            return;
        }

        EmptyStateText.IsVisible = false;
        DataPanel.IsVisible = true;

        OverallPercentText.Text = $"{session.AccuracyPercent:F0}%";
        CorrectOfTotalText.Text = $"{session.CorrectCount} correct out of {session.TotalQuestions}";
        BestStreakText.Text = $"Best streak: {session.BestStreak}";
        OverallBar.Value = session.AccuracyPercent;

        foreach (var (domain, correct, answered, total) in session.GetDomainStats())
        {
            DomainList.Children.Add(BuildDomainRow(domain, correct, answered, total));
        }
    }

    private static Control BuildDomainRow(string domain, int correct, int answered, int total)
    {
        var pct = answered > 0 ? correct * 100.0 / answered : 0;

        var grid = new Grid
        {
            ColumnDefinitions = new ColumnDefinitions("*,Auto,Auto"),
        };

        var left = new StackPanel { Spacing = 2 };
        left.Children.Add(new TextBlock
        {
            Text = domain,
            FontSize = 13,
            FontWeight = FontWeight.SemiBold,
            Foreground = (IBrush)Application.Current!.FindResource("TextPrimaryBrush")!,
        });
        left.Children.Add(new ProgressBar
        {
            Value = pct,
            Maximum = 100,
            Height = 6,
            Margin = new Thickness(0, 4, 8, 0),
            Background = (IBrush)Application.Current!.FindResource("DarkPanelBrush")!,
            Foreground = (IBrush)Application.Current!.FindResource("NeonCyanBrush")!,
            CornerRadius = new CornerRadius(3),
        });
        Grid.SetColumn(left, 0);

        var pctText = new TextBlock
        {
            Text = answered > 0 ? $"{pct:F0}%" : "--",
            FontSize = 14,
            FontWeight = FontWeight.Bold,
            Foreground = (IBrush)Application.Current!.FindResource("NeonCyanBrush")!,
            VerticalAlignment = VerticalAlignment.Center,
            Margin = new Thickness(8, 0, 8, 0),
        };
        Grid.SetColumn(pctText, 1);

        var countText = new TextBlock
        {
            Text = $"{correct}/{answered} answered of {total}",
            FontSize = 12,
            Foreground = (IBrush)Application.Current!.FindResource("TextDimBrush")!,
            VerticalAlignment = VerticalAlignment.Center,
        };
        Grid.SetColumn(countText, 2);

        grid.Children.Add(left);
        grid.Children.Add(pctText);
        grid.Children.Add(countText);
        return grid;
    }
}
