using System.ComponentModel;
using System.Text.RegularExpressions;
using RadicalTrainingPlatform.Core.Models;

namespace RadicalTrainingPlatform.Core.ViewModels;

/// <summary>
/// Reactive view model for an exam study session.
/// Platform-agnostic — used by WinForms, Avalonia, and Web frontends.
/// </summary>
public class ExamSessionViewModel : INotifyPropertyChanged
{
    private readonly List<Question> _sessionQuestions;
    private readonly Dictionary<Question, int> _displayIndex = new();
    private int _currentIndex;
    private readonly HashSet<string> _selectedAnswers = new();
    private bool _submitted;
    private readonly HashSet<string> _wrongKeys = new();
    private readonly HashSet<string> _correctKeys = new();
    private int _streak;
    private int _bestStreak;

    public event PropertyChangedEventHandler? PropertyChanged;

    /// <param name="shuffleOptions">
    /// Present each question's options in random order (relabelled A, B, C…).
    /// Several legacy banks key almost every answer to the same letter, so
    /// without this "always pick A" scores far above chance. Questions whose
    /// text refers to options by letter are left in their authored order.
    /// </param>
    /// <param name="random">Seedable source for tests; defaults to a new Random.</param>
    public ExamSessionViewModel(List<Question> questions, string examCode, int? limit = null,
                                bool shuffleOptions = false, Random? random = null)
    {
        ArgumentNullException.ThrowIfNull(questions);
        if (questions.Count == 0)
            throw new ArgumentException("A session needs at least one question.", nameof(questions));
        if (limit is <= 0)
            throw new ArgumentOutOfRangeException(nameof(limit), limit, "Limit must be positive.");
        ExamCode = examCode;
        var rng = random ?? new Random();

        // If limit specified, take a random subset for test mode
        if (limit.HasValue && limit.Value < questions.Count)
        {
            _sessionQuestions = questions.OrderBy(_ => rng.Next()).Take(limit.Value).ToList();
        }
        else
        {
            _sessionQuestions = questions.ToList();
        }

        // Shuffled copies — the parsed Question objects are shared with the
        // PDF exporter and other sessions, so they are never mutated.
        if (shuffleOptions)
            _sessionQuestions = _sessionQuestions.Select(q => ShuffleOptions(q, rng)).ToList();

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
        // Latest attempt wins: re-answering after Previous used to leave the
        // key in BOTH sets, counting one question as correct and wrong.
        _correctKeys.Remove(key);
        _wrongKeys.Remove(key);
        if (correct)
        {
            _correctKeys.Add(key);
            _streak++;
            if (_streak > _bestStreak) _bestStreak = _streak;
        }
        else
        {
            _wrongKeys.Add(key);
            _streak = 0;
        }

        Notify(nameof(IsSubmitted));
        Notify(nameof(IsCorrect));
        Notify(nameof(CorrectCount));
        Notify(nameof(WrongCount));
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
        // Skipping a question already answered keeps that answer's result.
        if (!IsAnswered(CurrentQuestion))
        {
            _wrongKeys.Add(MakeKey(CurrentQuestion));
            Notify(nameof(WrongCount));
            Notify(nameof(AccuracyPercent));
            Notify(nameof(IsComplete));
        }
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

    // Option text or explanation that names options by letter ("All of the
    // above", "Both A and C", "option B is wrong…") would be wrong after a
    // shuffle, so those questions keep their authored order.
    private static readonly Regex LetterReferenceRx = new(
        @"\b(?:all|none) of the above\b|\b(?:both|either|neither) [A-F] (?:and|or|nor) [A-F]\b|\b(?:options?|answers?|choices?) \(?[A-F]\)?(?![\w'])|\([A-F]\)",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    private static bool RefersToOptionLetters(Question q) =>
        LetterReferenceRx.IsMatch(q.Explanation)
        || LetterReferenceRx.IsMatch(q.Stem)
        || q.Options.Any(o => LetterReferenceRx.IsMatch(o.Text));

    private static Question ShuffleOptions(Question q, Random rng)
    {
        if (q.Options.Count < 2 || RefersToOptionLetters(q)) return q;

        var shuffled = q.Options.OrderBy(_ => rng.Next()).ToList();
        var newLetter = new Dictionary<string, string>();
        var options = new List<AnswerOption>();
        for (int i = 0; i < shuffled.Count; i++)
        {
            var letter = ((char)('A' + i)).ToString();
            newLetter[shuffled[i].Letter] = letter;
            options.Add(new AnswerOption { Letter = letter, Text = shuffled[i].Text });
        }

        return new Question
        {
            Id = q.Id,
            ExamCode = q.ExamCode,
            Domain = q.Domain,
            Stem = q.Stem,
            Options = options,
            CorrectAnswers = q.CorrectAnswers
                .Select(a => newLetter.GetValueOrDefault(a, a))
                .OrderBy(a => a)
                .ToList(),
            Explanation = q.Explanation,
            SourceFile = q.SourceFile,
        };
    }

    private static string MakeKey(Question q) => $"{q.ExamCode}:{q.SourceFile}:{q.Id}";

    private bool IsAnswered(Question q)
    {
        var key = MakeKey(q);
        return _wrongKeys.Contains(key) || _correctKeys.Contains(key);
    }

    private void Notify(string prop) => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(prop));
}
