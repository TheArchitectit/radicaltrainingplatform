using System.IO;
using Avalonia;
using Avalonia.Controls;
using Avalonia.Interactivity;
using Avalonia.Platform.Storage;
using Avalonia.Layout;
using Avalonia.Media;
using Avalonia.Threading;
using Microsoft.Extensions.DependencyInjection;
using RadicalTrainingPlatform.Core;
using RadicalTrainingPlatform.Core.Abstractions;
using RadicalTrainingPlatform.Core.PdfExport;
using RadicalTrainingPlatform.Core.Models;
using RadicalTrainingPlatform.Core.ViewModels;
using RadicalTrainingPlatform.Avalonia.Views;
using HorizontalAlignment = Avalonia.Layout.HorizontalAlignment;

namespace RadicalTrainingPlatform.Avalonia;

/// <summary>
/// Main window hosting sidebar navigation and dynamic content.
/// Vendor-neutral: discovers all exams from .md files and builds
/// UI dynamically from ExamCatalogItem metadata.
/// </summary>
public partial class MainWindow : Window
{
    private readonly IExamRepository _examRepository;
    private readonly IQuestionParser _questionParser;
    private readonly IBlueprintService _blueprintService;
    private readonly IReferenceService _referenceService;

    private Dictionary<string, List<Question>> _exams = new(StringComparer.OrdinalIgnoreCase);
    private List<ExamCatalogItem> _catalog = new();
    private ExamSessionViewModel? _session;
    private string? _lastExamCode;
    private QuestionView? _questionView;
    private BlueprintView? _blueprintView;
    private StatsView? _statsView;
    private LabSimulator.LabSimulatorView? _labView;
    private string _currentMode = "Study";

    /// <summary>
    /// Non-null while the wrong-answers review is on screen: the study session
    /// to resume when the user leaves review. Doubles as the review-mode flag.
    /// </summary>
    private ExamSessionViewModel? _reviewReturnSession;
    private bool InReviewMode => _reviewReturnSession != null;

    /// <summary>
    /// The session left behind when navigating to Stats / Blueprint / Lab /
    /// the selector. Clicking that exam again resumes it (navigating away used
    /// to discard an in-progress test with no way back). Reset restarts.
    /// </summary>
    private ExamSessionViewModel? _pausedSession;

    public MainWindow() : this(((App)Application.Current!).Services!) { }

    public MainWindow(IServiceProvider services)
    {
        InitializeComponent();
        Loaded += OnLoaded;
        // The lab view is cached across navigations; dispose it only when the
        // app closes (disposing on navigation left a dead cached instance).
        Closed += (_, _) => _labView?.Dispose();

        _examRepository = services.GetRequiredService<IExamRepository>();
        _questionParser = services.GetRequiredService<IQuestionParser>();
        _blueprintService = services.GetRequiredService<IBlueprintService>();
        _referenceService = services.GetRequiredService<IReferenceService>();
    }

    private void OnLoaded(object? sender, RoutedEventArgs e)
    {
        LoadExams();
        ShowExamSelector();
    }

    // ─── Exam Loading ──────────────────────────────────────────────

    private void LoadExams()
    {
        // Build catalog (fast — no full parse) and load all exams
        _catalog = _questionParser.BuildCatalog();
        _exams = _questionParser.LoadAllExams();

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
        selector.StartExamRequested += OpenExam;
        MainContent.Content = selector;
    }

    private void ReleaseCurrentView()
    {
        if (MainContent.Content is QuestionView qv)
            qv.DataContext = null;
        // Pause rather than discard. From review, the study session is the
        // one worth resuming, not the throwaway review VM.
        _pausedSession = (InReviewMode ? _reviewReturnSession : _session) ?? _pausedSession;
        _session = null;
        // Leaving review (via any nav button) ends the review return path.
        if (InReviewMode)
        {
            _reviewReturnSession = null;
            SetReviewButtonLabel(false);
        }
    }

    /// <summary>Resume the paused session for this exam, else start a new one.</summary>
    private void OpenExam(string examCode)
    {
        if (_pausedSession != null
            && string.Equals(_pausedSession.ExamCode, examCode, StringComparison.OrdinalIgnoreCase))
        {
            ResumeSession(_pausedSession);
            return;
        }
        if (_exams.TryGetValue(examCode, out var questions))
            StartSession(examCode, questions);
    }

    private void ResumeSession(ExamSessionViewModel session)
    {
        ReleaseCurrentView();
        _pausedSession = null;
        _questionView ??= new QuestionView();
        _session = session;
        _lastExamCode = session.ExamCode;
        // ShowReviewSession unsubscribes the study session; -= first so a
        // session that kept its handler is not subscribed twice.
        _session.PropertyChanged -= OnSessionPropertyChanged;
        _session.PropertyChanged += OnSessionPropertyChanged;
        _questionView.DataContext = _session;
        MainContent.Content = _questionView;
        UpdateStats();
    }

    // ─── Session Management ────────────────────────────────────────

    private void StartSession(string examCode, List<Question> questions)
    {
        ReleaseCurrentView();
        _pausedSession = null;

        if (_questionView == null)
            _questionView = new QuestionView();

        int? limit = _currentMode == "Test" ? 75 : null;
        // Shuffle: legacy banks key up to 100% of answers to one letter.
        _session = new ExamSessionViewModel(questions, examCode, limit, shuffleOptions: true);
        _lastExamCode = examCode;
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
                         or nameof(ExamSessionViewModel.Streak)
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
        TxtStreak.Text = $"{_session.Streak} 🔥";
        TxtAccuracy.Text = $"{_session.AccuracyPercent:F0}%";
    }

    // ─── Sidebar Event Handlers ────────────────────────────────────

    private void OnSidebarExamClicked(object? sender, RoutedEventArgs e)
    {
        if (sender is not Button btn) return;
        var code = btn.Tag?.ToString();
        if (code != null)
            OpenExam(code);
    }

    private void OnModeChanged(object? sender, RoutedEventArgs e)
    {
        if (sender is not Button btn) return;
        _currentMode = btn.Content?.ToString() ?? "Study";
        // A paused session belongs to the old mode; don't resume it.
        _pausedSession = null;
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
        // Reset restarts whatever is active or paused (review → its study exam).
        var code = (InReviewMode ? _reviewReturnSession : _session ?? _pausedSession)?.ExamCode;
        if (code != null && _exams.TryGetValue(code, out var questions))
            StartSession(code, questions);
        else
            ShowExamSelector();
    }

    private void OnBlueprintClicked(object? sender, RoutedEventArgs e)
    {
        // Exam scope: current session, else the last one studied.
        var code = _session?.ExamCode ?? _lastExamCode;
        if (string.IsNullOrEmpty(code))
        {
            // No exam studied yet — show selector rather than an empty canvas.
            ShowExamSelector();
            return;
        }

        ReleaseCurrentView();
        _blueprintView ??= new BlueprintView();
        MainContent.Content = _blueprintView;

        // Real data pipeline (was: injected _blueprintService never used,
        // LoadBlueprint never called — the canvas rendered empty).
        var blueprint = _blueprintService.GetBlueprint(code);
        if (blueprint == null)
        {
            _blueprintView.ShowNoBlueprint(code);
            return;
        }
        var questions = _exams.GetValueOrDefault(code) ?? new();
        var qTexts = questions
            .Select(q => q.Stem + " " + string.Join(" ", q.Options.Select(o => o.Text)))
            .ToList();
        var coverage = _blueprintService.CalculateCoverage(code, qTexts);
        _blueprintView.LoadBlueprintData(blueprint, coverage);
    }

    private void OnStatsClicked(object? sender, RoutedEventArgs e)
    {
        // Snapshot the session: ReleaseCurrentView nulls _session, so the
        // stats view gets whatever was active when Stats was clicked.
        var snapshot = (InReviewMode ? _reviewReturnSession : _session) ?? _pausedSession;
        ReleaseCurrentView();
        _statsView ??= new StatsView();
        _statsView.LoadStats(snapshot);
        MainContent.Content = _statsView;
    }

    private void OnReviewClicked(object? sender, RoutedEventArgs e)
    {
        // Already reviewing → return to the study session we paused on.
        if (InReviewMode)
        {
            var resume = _reviewReturnSession;
            _reviewReturnSession = null;
            SetReviewButtonLabel(false);
            ShowReviewSession(resume!);
            return;
        }

        if (_session == null) return;
        var wrong = _session.GetWrongQuestions();
        if (wrong.Count == 0) return;

        // Capture BEFORE ReleaseCurrentView(): that call nulls _session (the
        // old code dereferenced _session.ExamCode afterwards → guaranteed NRE).
        var studySession = _session;
        var reviewVm = new ExamSessionViewModel(wrong, studySession.ExamCode + " (Review)");
        _reviewReturnSession = studySession;
        SetReviewButtonLabel(true);
        ShowReviewSession(reviewVm);
    }

    /// <summary>
    /// Swap the question view onto <paramref name="vm"/>, rewiring the stats
    /// subscription. ReleaseCurrentView is deliberately NOT used: it disposes
    /// the review session we must keep for Back-to-Study.
    /// </summary>
    private void ShowReviewSession(ExamSessionViewModel vm)
    {
        if (_session != null)
            _session.PropertyChanged -= OnSessionPropertyChanged;

        _questionView ??= new QuestionView();
        _session = vm;
        _session.PropertyChanged += OnSessionPropertyChanged;
        _questionView.DataContext = _session;
        MainContent.Content = _questionView;
        UpdateStats();
    }

    private void SetReviewButtonLabel(bool inReview)
    {
        if (BtnReview != null)
            BtnReview.Content = inReview ? "← Back to Study" : "Review";
    }

    private void OnExportClicked(object? sender, RoutedEventArgs e)
        => ExportStudyGuide();

    /// <summary>
    /// Renders the current (or last-studied) exam's study guide to PDF bytes,
    /// or null when no exam has been loaded. Split from the save dialog so the
    /// QuestPDF generation is testable without OS file-picker interaction.
    /// </summary>
    public byte[]? GenerateStudyGuidePdf()
    {
        var code = _session?.ExamCode ?? _lastExamCode;
        if (string.IsNullOrEmpty(code)) return null;
        if (!_exams.TryGetValue(code, out var questions) || questions.Count == 0) return null;
        var title = _catalog.FirstOrDefault(c => string.Equals(c.ExamCode, code, StringComparison.OrdinalIgnoreCase))?.DisplayName ?? code;
        return ExamPdfExporter.GenerateExamPdf(questions, title, code);
    }

    private async void ExportStudyGuide()
    {
        var code = _session?.ExamCode ?? _lastExamCode;
        if (string.IsNullOrEmpty(code)) { ShowExamSelector(); return; }

        var file = await StorageProvider.SaveFilePickerAsync(new FilePickerSaveOptions
        {
            SuggestedFileName = $"{code}-study-guide.pdf",
            DefaultExtension = ".pdf",
        });
        if (file == null) return; // user cancelled

        var bytes = GenerateStudyGuidePdf();
        if (bytes is { Length: > 0 })
            await File.WriteAllBytesAsync(file.Path.LocalPath, bytes);
    }

    private void OnLabSimulatorClicked(object? sender, RoutedEventArgs e)
    {
        ReleaseCurrentView();
        _labView ??= new LabSimulator.LabSimulatorView();
        MainContent.Content = _labView;
    }
}
