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
    // R-15: study continuation across Stats/Blueprint. Pausing keeps the
    // live view-model (position, current item, in-progress answers) so
    // returning to the exam restores exactly where the learner left off.
    private ExamSessionViewModel? _pausedSession;
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

    public MainWindow() : this(((App)Application.Current!).Services!) { }

    public MainWindow(IServiceProvider services)
    {
        InitializeComponent();
        Loaded += OnLoaded;
        // R-16: the lab view is kept alive across navigation and disposed
        // exactly once here (NET-07: the old code disposed on navigate and
        // left a dead instance cached for reuse).
        Closed += OnWindowClosed;

        _examRepository = services.GetRequiredService<IExamRepository>();
        _questionParser = services.GetRequiredService<IQuestionParser>();
        _blueprintService = services.GetRequiredService<IBlueprintService>();
        _referenceService = services.GetRequiredService<IReferenceService>();
    }

    private void OnWindowClosed(object? sender, EventArgs e)
    {
        _labView?.Dispose();
        _labView = null;
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
        // R-16 / NET-07 ownership policy: the lab view is KEPT ALIVE across
        // navigation (LabSimulatorView's own lifetime note forbids disposing
        // on detach). It is disposed exactly once, on window close, below.
        // The old code disposed here and left _labView cached — the next
        // Lab Simulator click reused a dead host.
        _session = null;
        // Leaving review (via any nav button) ends the review return path.
        if (InReviewMode)
        {
            _reviewReturnSession = null;
            SetReviewButtonLabel(false);
        }
    }

    // ─── Session Management ────────────────────────────────────────

    private void StartSession(string examCode, List<Question> questions)
    {
        _pausedSession = null; // a fresh session supersedes any pause
        ReleaseCurrentView();

        if (_questionView == null)
            _questionView = new QuestionView();

        int? limit = _currentMode == "Test" ? 75 : null;
        _session = new ExamSessionViewModel(questions, examCode, limit);
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
                         or nameof(ExamSessionViewModel.BestStreak)
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
        // R-17: streak is the consecutive-correct run, NOT CorrectCount
        // (the old binding showed the score as a flame and inflated on retries).
        TxtStreak.Text = $"{_session.Streak} 🔥";
        TxtAccuracy.Text = $"{_session.AccuracyPercent:F0}%";
    }

    // ─── Sidebar Event Handlers ────────────────────────────────────

    private void OnSidebarExamClicked(object? sender, RoutedEventArgs e)
    {
        if (sender is not Button btn) return;
        var code = btn.Tag?.ToString();
        if (code == null || !_exams.TryGetValue(code, out var questions)) return;

        // R-15: re-selecting the paused exam resumes the live session
        // (same position, current item, in-progress answers) instead of
        // discarding it and starting over.
        if (_pausedSession != null && _pausedSession.ExamCode == code)
        {
            var paused = _pausedSession;
            _pausedSession = null;
            ShowStudySession(paused);
            return;
        }
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
        // Exam scope: current session, else the last one studied.
        var code = _session?.ExamCode ?? _lastExamCode;
        if (string.IsNullOrEmpty(code))
        {
            // No exam studied yet — show selector rather than an empty canvas.
            ShowExamSelector();
            return;
        }

        // R-15: pause the study session so returning restores it intact.
        if (_session != null && !InReviewMode)
            _pausedSession = _session;

        ReleaseCurrentView();
        _blueprintView ??= new BlueprintView();
        MainContent.Content = _blueprintView;

        // Real data pipeline (was: injected _blueprintService never used,
        // LoadBlueprint never called — the canvas rendered empty).
        var blueprint = _blueprintService.GetBlueprint(code);
        if (blueprint == null) return;
        var questions = _exams.GetValueOrDefault(code) ?? new();
        var qTexts = questions
            .Select(q => q.Stem + " " + string.Join(" ", q.Options.Select(o => o.Text)))
            .ToList();
        var coverage = _blueprintService.CalculateCoverage(code, qTexts);
        _blueprintView.LoadBlueprintData(blueprint, coverage);
    }

    private void OnStatsClicked(object? sender, RoutedEventArgs e)
    {
        // R-15: pause the study session so returning restores it intact.
        // Snapshot for the stats view: ReleaseCurrentView nulls _session.
        if (_session != null && !InReviewMode)
            _pausedSession = _session;
        var snapshot = _session;
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
    /// the review/paused session we must keep for return.
    /// </summary>
    private void ShowReviewSession(ExamSessionViewModel vm)
    {
        ShowStudySession(vm);
    }

    /// <summary>Rebind the question view to a live session (review return or R-15 resume).</summary>
    private void ShowStudySession(ExamSessionViewModel vm)
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
        // R-16: never hand a disposed instance back to the visual tree.
        // Keep-alive policy means the cache is live until window close; if
        // anything disposed it out from under us, drop it and build a new
        // one rather than reusing a dead host.
        if (_labView is { IsDisposed: true })
            _labView = null;
        _labView ??= new LabSimulator.LabSimulatorView();
        MainContent.Content = _labView;
    }
}
