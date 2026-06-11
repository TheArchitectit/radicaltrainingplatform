using Avalonia;
using Avalonia.Controls;
using Avalonia.Interactivity;
using Avalonia.Layout;
using Avalonia.Media;
using Avalonia.Threading;
using CertForge.Core;
using CertForge.Core.Models;
using CertForge.Core.ViewModels;
using CertForge.Avalonia.Views;
using HorizontalAlignment = Avalonia.Layout.HorizontalAlignment;

namespace CertForge.Avalonia;

/// <summary>
/// Main window hosting sidebar navigation and dynamic content.
/// Vendor-neutral: discovers all exams from .md files and builds
/// UI dynamically from ExamCatalogItem metadata.
/// </summary>
public partial class MainWindow : Window
{
    private Dictionary<string, List<Question>> _exams = new(StringComparer.OrdinalIgnoreCase);
    private List<ExamCatalogItem> _catalog = new();
    private ExamSessionViewModel? _session;
    private QuestionView? _questionView;
    private BlueprintView? _blueprintView;
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

        // Build catalog (fast — no full parse) and load all exams
        _catalog = parser.BuildCatalog();
        _exams = parser.LoadAllExams();

        // Populate sidebar quick-launch buttons dynamically
        PopulateSidebarButtons();
    }

    private void PopulateSidebarButtons()
    {
        var panel = SidebarExamButtons;
        if (panel == null) return;

        var buttons = new List<Button>();

        foreach (var exam in _catalog)
        {
            var btn = new Button
            {
                Content = $"{exam.DisplayName}  ({exam.QuestionCount})",
                HorizontalAlignment = HorizontalAlignment.Stretch,
                Background = Brushes.Transparent,
                BorderBrush = new SolidColorBrush(Color.Parse(exam.Color)),
                BorderThickness = new Thickness(1),
                Foreground = new SolidColorBrush(Color.Parse(exam.Color)),
                CornerRadius = new CornerRadius(6),
                Tag = exam.ExamCode,
            };
            btn.Click += OnSidebarExamClicked;
            buttons.Add(btn);
        }

        panel.ItemsSource = buttons;
    }

    // ─── View Switching ────────────────────────────────────────────

    private void ShowExamSelector()
    {
        ReleaseCurrentView();

        var selector = new ExamSelectorView();
        selector.SetExams(_catalog);
        selector.StartExamRequested += (examCode) =>
        {
            if (_exams.TryGetValue(examCode, out var questions))
                StartSession(examCode, questions);
        };
        MainContent.Content = selector;
    }

    private void ReleaseCurrentView()
    {
        if (MainContent.Content is QuestionView qv)
            qv.DataContext = null;
        if (MainContent.Content is LabSimulator.LabSimulatorView lab)
            lab.Dispose();
        _session = null;
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

    private void OnSidebarExamClicked(object? sender, RoutedEventArgs e)
    {
        if (sender is not Button btn) return;
        var code = btn.Tag?.ToString();
        if (code != null && _exams.TryGetValue(code, out var questions))
            StartSession(code, questions);
    }

    private void OnModeChanged(object? sender, RoutedEventArgs e)
    {
        if (sender is not Button btn) return;
        _currentMode = btn.Content?.ToString() ?? "Study";
        UpdateModeButtonVisuals();

        if (_session != null && _exams.TryGetValue(_session.ExamCode, out var questions))
            StartSession(_session.ExamCode, questions);
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
            StartSession(_session.ExamCode, questions);
        else
            ShowExamSelector();
    }

    private void OnBlueprintClicked(object? sender, RoutedEventArgs e)
    {
        ReleaseCurrentView();
        _blueprintView ??= new BlueprintView();
        MainContent.Content = _blueprintView;
    }

    private void OnReviewClicked(object? sender, RoutedEventArgs e)
    {
        if (_session == null) return;
        var wrong = _session.GetWrongQuestions();
        if (wrong.Count == 0) return;

        ReleaseCurrentView();
        _questionView ??= new QuestionView();
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
        // TODO: Export dialog
    }

    private void OnLabSimulatorClicked(object? sender, RoutedEventArgs e)
    {
        ReleaseCurrentView();
        _labView ??= new LabSimulator.LabSimulatorView();
        MainContent.Content = _labView;
    }
}
