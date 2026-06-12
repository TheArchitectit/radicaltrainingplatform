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
    private bool _submitted;
    private readonly HashSet<string> _wrongKeys = new();
    private readonly HashSet<string> _correctKeys = new();

    public event PropertyChangedEventHandler? PropertyChanged;

    public ExamSessionViewModel(List<Question> questions, string examCode, int? limit = null)
    {
        _allQuestions = questions ?? throw new ArgumentNullException(nameof(questions));
        ExamCode = examCode;

        // If limit specified, take a random subset for test mode
        if (limit.HasValue && limit.Value < questions.Count)
        {
            var rng = new Random();
            _sessionQuestions = questions.OrderBy(_ => rng.Next()).Take(limit.Value).ToList();
        }
        else
        {
            _sessionQuestions = questions.ToList();
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
    public bool IsSubmitted => _submitted;
    public bool IsCorrect => _submitted &&
        CurrentQuestion.CorrectAnswers.OrderBy(a => a).SequenceEqual(_selectedAnswers.OrderBy(a => a));

    public bool HasPrevious => _currentIndex > 0;
    public bool HasNext => _currentIndex < _sessionQuestions.Count - 1;

    public int CorrectCount => _correctKeys.Count;
    public int WrongCount => _wrongKeys.Count;
    public double AccuracyPercent => TotalQuestions > 0 ? (CorrectCount * 100.0 / TotalQuestions) : 0;
    public bool IsComplete => _sessionQuestions.All(IsAnswered);

    // ─── Actions ──────────────────────────────────────────────────

    public void SelectAnswer(string letter)
    {
        if (_submitted) return;

        if (CurrentQuestion.IsMultiSelect)
        {
            if (_selectedAnswers.Contains(letter))
                _selectedAnswers.Remove(letter);
            else
                _selectedAnswers.Add(letter);
        }
        else
        {
            _selectedAnswers.Clear();
            _selectedAnswers.Add(letter);
        }
        Notify(nameof(SelectedAnswers));
    }

    public bool Submit()
    {
        if (_submitted || _selectedAnswers.Count == 0) return false;

        _submitted = true;
        var correct = CurrentQuestion.CorrectAnswers.OrderBy(a => a).SequenceEqual(_selectedAnswers.OrderBy(a => a));
        var key = MakeKey(CurrentQuestion);
        if (correct)
            _correctKeys.Add(key);
        else
            _wrongKeys.Add(key);

        Notify(nameof(IsSubmitted));
        Notify(nameof(IsCorrect));
        Notify(nameof(CorrectCount));
        Notify(nameof(WrongCount));
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
        _wrongKeys.Add(MakeKey(CurrentQuestion));
        Next();
    }

    public List<Question> GetWrongQuestions() =>
        _sessionQuestions.Where(q => _wrongKeys.Contains(MakeKey(q))).ToList();

    // ─── Helpers ──────────────────────────────────────────────────

    private void ResetState()
    {
        _selectedAnswers.Clear();
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
