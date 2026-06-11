using Avalonia.Controls;
using Avalonia.Interactivity;
using Avalonia.Markup.Xaml;

namespace CertForge.Avalonia.Views;

/// <summary>
/// Exam selection dashboard. Displays available certifications
/// and raises <see cref="StartExamRequested"/> when the user
/// chooses one.
/// </summary>
public partial class ExamSelectorView : UserControl
{
    public event Action<string>? StartExamRequested;

    public ExamSelectorView()
    {
        InitializeComponent();
    }

    protected override void OnInitialized()
    {
        base.OnInitialized();

        // Wire start buttons after InitializeComponent has created the visual tree
        WireStartButton("BtnStartNCA75", "NCA");
        WireStartButton("BtnStartNCA",   "NCA");
        WireStartButton("BtnStartNCM",   "NCM-MCI");
        WireStartButton("BtnStartNCPCI", "NCP-CI");
        WireStartButton("BtnStartNCPAI", "NCP-AI");
    }

    private void WireStartButton(string name, string examCode)
    {
        if (this.FindControl<Button>(name) is Button btn)
        {
            btn.Click += (s, e) => StartExamRequested?.Invoke(examCode);
        }
    }
}
