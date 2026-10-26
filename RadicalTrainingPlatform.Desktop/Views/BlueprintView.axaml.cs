using System.Collections.Generic;
using Avalonia.Controls;
using Avalonia.Interactivity;
using Avalonia.Markup.Xaml;
using RadicalTrainingPlatform.Core.Models;

namespace RadicalTrainingPlatform.Avalonia.Views;

/// <summary>
/// Blueprint coverage visualization. Wraps <see cref="Controls.BlueprintCanvas"/>.
/// </summary>
public partial class BlueprintView : UserControl
{
    public BlueprintView()
    {
        InitializeComponent();
    }

    /// <summary>
    /// Feed real blueprint + coverage data to the canvas (was never called —
    /// the screen rendered an empty canvas).
    /// </summary>
    public void LoadBlueprintData(ExamBlueprint blueprint, Dictionary<string, int> coverage)
    {
        EmptyStateText.IsVisible = false;
        Canvas.IsVisible = true;
        Canvas.LoadBlueprint(blueprint, coverage);
    }

    /// <summary>Honest empty state for an exam with no blueprint defined.</summary>
    public void ShowNoBlueprint(string examCode)
    {
        Canvas.IsVisible = false;
        EmptyStateText.Text = $"No exam blueprint is available for {examCode} yet.";
        EmptyStateText.IsVisible = true;
    }
}
