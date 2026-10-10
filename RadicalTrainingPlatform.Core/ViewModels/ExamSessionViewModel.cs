using System.ComponentModel;
using RadicalTrainingPlatform.Core.Models;

namespace RadicalTrainingPlatform.Core.ViewModels;

/// <summary>
/// Reactive view model for an exam study session.
/// Platform-agnostic — used by WinForms, Avalonia, and Web frontends.
/// </summary>
public class ExamSessionViewModel : INotifyPropertyChanged
{
    private readonly List<Question> _allQuestions;
    private readonly List<Question> _sessionQuestions;
    private readonly Dictionary<Question, int> _displayIndex = new();
    private int _currentIndex;
    private readonly HashSet<string> _selectedAnswers = new();
    // Ordered-response picks in click order (R-03: a HashSet loses sequence,
    // which is exactly what ordering grading must check).
    private readonly List<string> _orderedSelection = new();
    private bool _submitted;
    private readonly HashSet<string> _wrongKeys = new();
    private readonly HashSet<string> _correctKeys = new();
    // R-14/D9: first attempt is immutable — its winners never change on retry.
    // _firstAttemptKeys records every item attempted at least once (so a later
    // retry can never register a "first" outcome); _firstAttemptCorrectKeys
    // freezes the items whose FIRST outcome was correct.
    private readonly HashSet<string> _firstAttemptKeys = new();
    private readonly HashSet<string> _firstAttemptCorrectKeys = new();
    private int _streak;
    private int _bestStreak;

    public event PropertyChangedEventHandler? PropertyChanged;

    public ExamSessionViewModel(List<Question> questions, string examCode, int? limit = null,
        bool includeQuarantined = false)
    {
        _allQuestions = questions ?? throw new ArgumentNullException(nameof(questions));
        ExamCode = examCode;

        // R-03: quarantined items (ordering prompts until sequence scoring is
        // wired on every surface) never enter a scored session by default.
        var eligible = includeQuarantined ? questions : questions.Where(q => !q.Quarantined).ToList();

        // If limit specified, take a random subset for test mode
        if (limit.HasValue && limit.Value < eligible.Count)
        {
            var rng = new Random();
            _sessionQuestions = eligible.OrderBy(_ => rng.Next()).Take(limit.Value).ToList();
        }
        else
        {
            _sessionQuestions = eligible.ToList();
        }

        // Build display index mapping without mutating shared model objects
        for (int i = 0; i < _sessionQuestions.Count; i++)
            _displayIndex[_sessionQuestions[i]] = i + 1;

        _currentIndex = 0;
    }

    public string ExamCode { get; }
    public int TotalQuestions => _sessionQuestions.Count;
    public int CurrentIndex => _currentIndex;
    public int CurrentNumber => GetDisplayNumber(CurrentQuestion);

    /// <summary>
    /// Returns the 1-based display ordinal for a question within this session,
    /// without relying on or mutating the original Question.Id.
    /// </summary>
    public int GetDisplayNumber(Question q) => _displayIndex.TryGetValue(q, out var idx) ? idx : q.Id;

    public Question CurrentQuestion => _sessionQuestions[_currentIndex];

    public IReadOnlySet<string> SelectedAnswers => _selectedAnswers;
    /// <summary>Ordered-response picks in submission order (R-03).</summary>
    public IReadOnlyList<string> OrderedSelection => _orderedSelection;
    public bool IsSubmitted => _submitted;
    public bool IsCorrect => _submitted && Grade(CurrentQuestion, CurrentSelection()) is { isCorrect: true };

    public bool HasPrevious => _currentIndex > 0;
    public bool HasNext => _currentIndex < _sessionQuestions.Count - 1;

    public int CorrectCount => _correctKeys.Count;
    public int WrongCount => _wrongKeys.Count;
    /// <summary>Items correct on their FIRST attempt (R-14/D9 — immutable
    /// across retries; retries never inflate or deflate this).</summary>
    public int FirstAttemptCorrectCount => _firstAttemptCorrectKeys.Count;
    /// <summary>Consecutive correct answers since the last miss.</summary>
    public int Streak => _streak;
    /// <summary>Longest consecutive-correct run this session.</summary>
    public int BestStreak => _bestStreak;
    public double AccuracyPercent => TotalQuestions > 0 ? (CorrectCount * 100.0 / TotalQuestions) : 0;
    public bool IsComplete => _sessionQuestions.All(IsAnswered);

    // ─── Actions ──────────────────────────────────────────────────

    public void SelectAnswer(string letter)
    {
        if (_submitted) return;

        if (CurrentQuestion.IsOrdered)
        {
            // Toggle in sequence: first click appends, clicking a picked step
            // removes it (and everything after it shifts up), clicking an
            // unpicked step when full replaces the last pick.
            if (_orderedSelection.Remove(letter))
            {
                // removed
            }
            else if (_orderedSelection.Count < CurrentQuestion.Options.Count)
            {
                _orderedSelection.Add(letter);
            }
            else
            {
                _orderedSelection[^1] = letter;
            }
            Notify(nameof(OrderedSelection));
        }
        else if (CurrentQuestion.IsMultiSelect)
        {
            if (_selectedAnswers.Contains(letter))
                _selectedAnswers.Remove(letter);
            else
                _selectedAnswers.Add(letter);
            Notify(nameof(SelectedAnswers));
        }
        else
        {
            _selectedAnswers.Clear();
            _selectedAnswers.Add(letter);
            Notify(nameof(SelectedAnswers));
        }
    }

    public bool Submit()
    {
        if (_submitted || CurrentSelection().Count == 0) return false;

        _submitted = true;
        var (isCorrect, _) = Grade(CurrentQuestion, CurrentSelection());
        var correct = isCorrect;
        var key = MakeKey(CurrentQuestion);

        // R-14/D9: the first outcome is immutable; the displayed outcome is
        // the latest attempt — a retry moves the key between the sets and
        // never leaves the item in both (the old code added without removing,
        // so one question could be Correct AND Wrong after a retry).
        if (_firstAttemptKeys.Add(key) && correct)
            _firstAttemptCorrectKeys.Add(key); // frozen at the FIRST outcome
        if (correct)
        {
            _correctKeys.Add(key);
            _wrongKeys.Remove(key);
            _streak++;
            if (_streak > _bestStreak) _bestStreak = _streak;
        }
        else
        {
            _wrongKeys.Add(key);
            _correctKeys.Remove(key);
            _streak = 0;
        }

        Notify(nameof(IsSubmitted));
        Notify(nameof(IsCorrect));
        Notify(nameof(CorrectCount));
        Notify(nameof(WrongCount));
        Notify(nameof(FirstAttemptCorrectCount));
        Notify(nameof(Streak));
        Notify(nameof(BestStreak));
        Notify(nameof(AccuracyPercent));
        Notify(nameof(IsComplete));
        return correct;
    }

    public void Next()
    {
        if (!HasNext) return;
        _currentIndex++;
        ResetState();
    }

    public void Previous()
    {
        if (!HasPrevious) return;
        _currentIndex--;
        ResetState();
    }

    public void JumpTo(int index)
    {
        if (index < 0 || index >= _sessionQuestions.Count) return;
        _currentIndex = index;
        ResetState();
    }

    public void Skip()
    {
        // A skip counts as a miss: it breaks the streak, same as a wrong answer.
        var key = MakeKey(CurrentQuestion);
        _firstAttemptKeys.Add(key); // a skip is the item's first attempt if it had none — never a win
        _wrongKeys.Add(key);
        _correctKeys.Remove(key);
        _streak = 0;
        Notify(nameof(Streak));
        Next();
    }

    /// <summary>
    /// Per-domain accuracy for the session: domain → (correct, answered, total).
    /// Drives the StatsView domain breakdown; unit-testable without UI.
    /// </summary>
    public List<(string Domain, int Correct, int Answered, int Total)> GetDomainStats()
    {
        return _sessionQuestions
            .GroupBy(q => string.IsNullOrWhiteSpace(q.Domain) ? "General" : q.Domain)
            .Select(g =>
            {
                int answeredCorrect = g.Count(q => _correctKeys.Contains(MakeKey(q)));
                int answered = g.Count(q => _correctKeys.Contains(MakeKey(q)) || _wrongKeys.Contains(MakeKey(q)));
                return (g.Key, answeredCorrect, answered, g.Count());
            })
            .OrderBy(d => d.Key, StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    public List<Question> GetWrongQuestions() =>
        _sessionQuestions.Where(q => _wrongKeys.Contains(MakeKey(q))).ToList();

    // ─── Helpers ──────────────────────────────────────────────────

    private IReadOnlyCollection<string> CurrentSelection() =>
        CurrentQuestion.IsOrdered ? _orderedSelection : _selectedAnswers;

    /// <summary>
    /// Grades a response against a question. Set equality for choice items;
    /// exact sequence equality for ordered items (R-03 — the sorted-set
    /// comparison previously accepted every permutation of the key).
    /// </summary>
    internal static (bool isCorrect, string reason) Grade(Question q, IReadOnlyCollection<string> response)
    {
        if (q.IsOrdered)
        {
            if (response.Count != q.CorrectAnswers.Count)
                return (false, response.Count < q.CorrectAnswers.Count ? "missing-step" : "extra-token");
            if (response.Distinct().Count() != response.Count)
                return (false, "duplicate-step");
            return (response.SequenceEqual(q.CorrectAnswers), "sequence-mismatch");
        }
        var correct = response.Count == q.CorrectAnswers.Count
            && q.CorrectAnswers.OrderBy(a => a).SequenceEqual(response.OrderBy(a => a));
        return (correct, correct ? "" : "set-mismatch");
    }

    private void ResetState()
    {
        _selectedAnswers.Clear();
        _orderedSelection.Clear();
        _submitted = false;
        Notify(nameof(CurrentQuestion));
        Notify(nameof(CurrentIndex));
        Notify(nameof(CurrentNumber));
        Notify(nameof(HasPrevious));
        Notify(nameof(HasNext));
        Notify(nameof(SelectedAnswers));
        Notify(nameof(IsSubmitted));
        Notify(nameof(IsCorrect));
    }

    private static string MakeKey(Question q) => $"{q.ExamCode}:{q.SourceFile}:{q.Id}";

    private bool IsAnswered(Question q)
    {
        var key = MakeKey(q);
        return _wrongKeys.Contains(key) || _correctKeys.Contains(key);
    }

    private void Notify(string prop) => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(prop));
}
