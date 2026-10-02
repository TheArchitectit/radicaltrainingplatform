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
        => Canvas.LoadBlueprint(blueprint, coverage);
}
