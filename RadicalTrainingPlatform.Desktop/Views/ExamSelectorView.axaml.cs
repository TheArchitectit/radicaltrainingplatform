using Avalonia.Controls;
using Avalonia.Interactivity;
using Avalonia.Media;
using Avalonia.VisualTree;
using RadicalTrainingPlatform.Core.Models;

namespace RadicalTrainingPlatform.Avalonia.Views;

/// <summary>
/// Dynamic exam selection dashboard. Builds cards from the
/// ExamCatalogItem list passed via SetExams().
/// </summary>
public partial class ExamSelectorView : UserControl
{
    public event Action<string>? StartExamRequested;
    private List<ExamCatalogItem> _exams = new();

    public ExamSelectorView()
    {
        InitializeComponent();
    }

    /// <summary>
    /// Populate the exam selector with discovered exams.
    /// </summary>
    public void SetExams(List<ExamCatalogItem> exams)
    {
        _exams = exams;
        ExamCards.ItemsSource = exams;
    }

    private void OnStartClicked(object? sender, RoutedEventArgs e)
    {
        if (sender is not Button btn) return;

        // The button's DataContext is inherited from the ItemsControl item
        if (btn.DataContext is ExamCatalogItem item)
        {
            StartExamRequested?.Invoke(item.ExamCode);
            return;
        }

        // Walk up via visual tree as fallback
        var current = btn.GetVisualParent();
        while (current != null)
        {
            if (current is Border border && border.DataContext is ExamCatalogItem catalogItem)
            {
                StartExamRequested?.Invoke(catalogItem.ExamCode);
                return;
            }
            current = current.GetVisualParent();
        }
    }
}
