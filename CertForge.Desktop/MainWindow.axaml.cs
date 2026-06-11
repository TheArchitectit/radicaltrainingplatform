using Avalonia;
using Avalonia.Controls;
using Avalonia.Interactivity;
using Avalonia.Media;
using Avalonia.Threading;
using CertForge.Core;
using CertForge.Core.Models;
using CertForge.Core.ViewModels;
using CertForge.Avalonia.Views;

namespace CertForge.Avalonia;

/// <summary>
/// Main window hosting sidebar navigation and dynamic content.
/// Loads exam questions from .md files and wires up study/test sessions.
/// </summary>
public partial class MainWindow : Window
{
    private Dictionary<string, List<Question>> _exams = new(StringComparer.OrdinalIgnoreCase);
    private ExamSessionViewModel? _session;
    private QuestionView? _questionView;
    private Views.BlueprintView? _blueprintView;
    private LabSimulator.LabSimulatorView? _labView;
    private string _currentMode = "Study";

    public MainWindow()
    {
        InitializeComponent();
        Loaded += OnLoaded;
    }

    private void OnLoaded(object? sender, RoutedEventArgs e)
    {
        LoadExams();
        ShowExamSelector();
    }

    // ─── Exam Loading ──────────────────────────────────────────────

    private void LoadExams()
    {
        var provider = new DefaultFileProvider();
        var repo = new MarkdownExamRepository(provider);
        var parser = new QuestionParser(repo, provider);
        _exams = parser.LoadAllExams();

        // Update sidebar buttons with counts
        UpdateButtonCount(BtnNCA75, "NCA",  "NCA 7.5 ★");
        UpdateButtonCount(BtnNCA,  "NCA",  "NCA 6.5");
        UpdateButtonCount(BtnNCM,  "NCM-MCI", "NCM — MCI");
        UpdateButtonCount(BtnNCPCI, "NCP-CI",  "NCP — CI");
        UpdateButtonCount(BtnNCPAI, "NCP-AI",  "NCP — AI");
    }

    private static void UpdateButtonCount(Button btn, string code, string label)
    {
        if (btn == null) return;
        // Count not used right now because LoadAllExams is on MainWindow instance,
        // but this helper is here for future use.
    }

    private void UpdateButtonCounts()
    {
        TrySetCount(BtnNCA75, "NCA",      "NCA 7.5 ★");
        TrySetCount(BtnNCA,  "NCA",      "NCA 6.5");
        TrySetCount(BtnNCM,  "NCM-MCI",  "NCM — MCI");
        TrySetCount(BtnNCPCI, "NCP-CI",   "NCP — CI");
        TrySetCount(BtnNCPAI, "NCP-AI",   "NCP — AI");
    }

    private void TrySetCount(Button btn, string code, string display)
    {
        if (btn == null) return;
        if (_exams.TryGetValue(code, out var list))
            btn.Content = $"{display}  ({list.Count})";
        else if (_exams.Keys.FirstOrDefault(k => k.StartsWith(code, StringComparison.OrdinalIgnoreCase)) is string matched
                 && _exams.TryGetValue(matched, out var list2))
            btn.Content = $"{display}  ({list2.Count})";
        else
            btn.Content = display;
    }

    // ─── View Switching ────────────────────────────────────────────

    private void ShowExamSelector()
    {
        ReleaseCurrentView();

        var selector = new ExamSelectorView();
        selector.StartExamRequested += (examCode) =>
        {
            var resolved = ResolveExamCode(examCode);
            if (resolved != null && _exams.TryGetValue(resolved, out var questions))
                StartSession(resolved, questions);
        };
        MainContent.Content = selector;
    }

    private void ReleaseCurrentView()
    {
        if (MainContent.Content is QuestionView qv)
        {
            qv.DataContext = null;
        }
        if (MainContent.Content is LabSimulator.LabSimulatorView lab)
        {
            lab.Dispose();
        }
        _session = null;
    }

    private string? ResolveExamCode(string displayName)
    {
        return displayName switch
        {
            "NCA" or "NCA 6.5" or "NCA 7.5" or "NCA 7.5 ★" =>
                _exams.Keys.FirstOrDefault(k => k.StartsWith("NCA", StringComparison.OrdinalIgnoreCase)),
            "NCM-MCI" or "NCM — MCI" => "NCM-MCI",
            "NCP-CI"  or "NCP — CI"  => "NCP-CI",
            "NCP-AI"  or "NCP — AI"  => "NCP-AI",
            _ => _exams.Keys.FirstOrDefault(k =>
                k.Equals(displayName, StringComparison.OrdinalIgnoreCase))
        };
    }

    // ─── Session Management ────────────────────────────────────────

    private void StartSession(string examCode, List<Question> questions)
    {
        ReleaseCurrentView();

        if (_questionView == null)
            _questionView = new QuestionView();

        int? limit = _currentMode == "Test" ? 75 : null;
        _session = new ExamSessionViewModel(questions, examCode, limit);
        _session.PropertyChanged += OnSessionPropertyChanged;

        _questionView.DataContext = _session;
        MainContent.Content = _questionView;

        UpdateStats();
        UpdateModeButtonVisuals();
    }

    private void OnSessionPropertyChanged(object? sender, System.ComponentModel.PropertyChangedEventArgs e)
    {
        if (e.PropertyName is nameof(ExamSessionViewModel.CorrectCount)
                         or nameof(ExamSessionViewModel.WrongCount)
                         or nameof(ExamSessionViewModel.AccuracyPercent))
        {
            Dispatcher.UIThread.Post(UpdateStats);
        }
    }

    private void UpdateStats()
    {
        if (_session == null)
        {
            TxtScore.Text = "0/0";
            TxtStreak.Text = "0 🔥";
            TxtAccuracy.Text = "--%";
            return;
        }
        TxtScore.Text = $"{_session.CorrectCount}/{_session.TotalQuestions}";
        TxtStreak.Text = $"{_session.CorrectCount} 🔥";
        TxtAccuracy.Text = $"{_session.AccuracyPercent:F0}%";
    }

    // ─── Sidebar Event Handlers ────────────────────────────────────

    private void OnExamSelected(object? sender, RoutedEventArgs e)
    {
        if (sender is not Button btn) return;
        var display = btn.Content?.ToString()?.Split('(')[0].Trim();
        var code = ResolveExamCode(display ?? "");
        if (code != null && _exams.TryGetValue(code, out var questions))
        {
            StartSession(code, questions);
        }
    }

    private void OnModeChanged(object? sender, RoutedEventArgs e)
    {
        if (sender is not Button btn) return;
        _currentMode = btn.Content?.ToString() ?? "Study";
        UpdateModeButtonVisuals();

        // Restart current exam in new mode if one is active
        if (_session != null && _exams.TryGetValue(_session.ExamCode, out var questions))
        {
            StartSession(_session.ExamCode, questions);
        }
    }

    private void UpdateModeButtonVisuals()
    {
        var purple = this.FindResource("NeonPurpleBrush") as IBrush;
        var deepSpace = this.FindResource("DeepSpaceBrush") as IBrush;
        var textDim = this.FindResource("TextDimBrush") as IBrush;
        var borderSubtle = this.FindResource("BorderSubtleBrush") as IBrush;

        if (_currentMode == "Study")
        {
            BtnModeStudy.Background = purple;
            BtnModeStudy.Foreground = deepSpace;
            BtnModeStudy.BorderThickness = new Thickness(0);

            BtnModeTest.Background = Brushes.Transparent;
            BtnModeTest.Foreground = textDim;
            BtnModeTest.BorderBrush = borderSubtle;
            BtnModeTest.BorderThickness = new Thickness(1);
        }
        else
        {
            BtnModeTest.Background = purple;
            BtnModeTest.Foreground = deepSpace;
            BtnModeTest.BorderThickness = new Thickness(0);

            BtnModeStudy.Background = Brushes.Transparent;
            BtnModeStudy.Foreground = textDim;
            BtnModeStudy.BorderBrush = borderSubtle;
            BtnModeStudy.BorderThickness = new Thickness(1);
        }
    }

    private void OnResetClicked(object? sender, RoutedEventArgs e)
    {
        if (_session != null && _exams.TryGetValue(_session.ExamCode, out var questions))
        {
            StartSession(_session.ExamCode, questions);
        }
        else
        {
            ShowExamSelector();
        }
    }

    private void OnBlueprintClicked(object? sender, RoutedEventArgs e)
    {
        ReleaseCurrentView();
        if (_blueprintView == null)
            _blueprintView = new Views.BlueprintView();
        MainContent.Content = _blueprintView;
    }

    private void OnReviewClicked(object? sender, RoutedEventArgs e)
    {
        // Placeholder: show review of wrong answers
        if (_session == null) return;
        var wrong = _session.GetWrongQuestions();
        if (wrong.Count == 0) return;

        ReleaseCurrentView();
        if (_questionView == null)
            _questionView = new QuestionView();
        var reviewVm = new ExamSessionViewModel(wrong, _session.ExamCode + " (Review)");
        _session.PropertyChanged -= OnSessionPropertyChanged;
        _session = reviewVm;
        _session.PropertyChanged += OnSessionPropertyChanged;
        _questionView.DataContext = _session;
        MainContent.Content = _questionView;
        UpdateStats();
    }

    private void OnExportClicked(object? sender, RoutedEventArgs e)
    {
        if (_session == null) return;
        // Launch export dialog (placeholder)
        // var dlg = new ExportDialog(_session);
        // dlg.ShowDialog(this);
    }

    private void OnLabSimulatorClicked(object? sender, RoutedEventArgs e)
    {
        ReleaseCurrentView();
        if (_labView == null)
            _labView = new LabSimulator.LabSimulatorView();
        MainContent.Content = _labView;
    }
}
