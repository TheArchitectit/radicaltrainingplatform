using Avalonia;
using Avalonia.Controls;
using Avalonia.Input;
using Avalonia.Interactivity;

namespace RadicalTrainingPlatform.Avalonia.Views;

/// <summary>
/// Reusable option card control for quiz answers.
/// Visual states: Normal, Hover, Selected, Correct, Wrong.
/// </summary>
public partial class OptionCard : UserControl
{
    public static readonly StyledProperty<bool> IsSelectedProperty =
        AvaloniaProperty.Register<OptionCard, bool>(nameof(IsSelected));

    public static readonly StyledProperty<bool> IsCorrectProperty =
        AvaloniaProperty.Register<OptionCard, bool>(nameof(IsCorrect));

    public static readonly StyledProperty<bool> IsWrongProperty =
        AvaloniaProperty.Register<OptionCard, bool>(nameof(IsWrong));

    public static readonly StyledProperty<string> LetterProperty =
        AvaloniaProperty.Register<OptionCard, string>(nameof(Letter), defaultValue: "");

    public static readonly StyledProperty<string> TextProperty =
        AvaloniaProperty.Register<OptionCard, string>(nameof(Text), defaultValue: "");

    /// <summary>
    /// 1-based position in the learner's pick order, for sequence questions
    /// (0 when not picked / not a sequence question). Displayed in place of the
    /// letter circle's plain letter so the order they clicked is visible.
    /// </summary>
    public static readonly StyledProperty<int> SelectionIndexProperty =
        AvaloniaProperty.Register<OptionCard, int>(nameof(SelectionIndex), defaultValue: 0);

    public event EventHandler? Click;

    public bool IsSelected
    {
        get => GetValue(IsSelectedProperty);
        set => SetValue(IsSelectedProperty, value);
    }

    public bool IsCorrect
    {
        get => GetValue(IsCorrectProperty);
        set => SetValue(IsCorrectProperty, value);
    }

    public bool IsWrong
    {
        get => GetValue(IsWrongProperty);
        set => SetValue(IsWrongProperty, value);
    }

    public string Letter
    {
        get => GetValue(LetterProperty);
        set => SetValue(LetterProperty, value);
    }

    public string Text
    {
        get => GetValue(TextProperty);
        set => SetValue(TextProperty, value);
    }

    public int SelectionIndex
    {
        get => GetValue(SelectionIndexProperty);
        set => SetValue(SelectionIndexProperty, value);
    }

    /// <summary>
    /// What the letter circle shows: the pick position once the learner has
    /// clicked a sequence option (so they can read their order back), otherwise
    /// the plain letter. Kept as a styled property rather than a computed getter
    /// so the TextBlock binding updates when the index changes.
    /// </summary>
    public static readonly StyledProperty<string> LetterDisplayProperty =
        AvaloniaProperty.Register<OptionCard, string>(nameof(LetterDisplay), defaultValue: "");

    public string LetterDisplay
    {
        get => GetValue(LetterDisplayProperty);
        set => SetValue(LetterDisplayProperty, value);
    }

    public OptionCard()
    {
        InitializeComponent();

        // Watch for state changes to update CSS-like classes
        IsSelectedProperty.Changed.AddClassHandler<OptionCard>((s, e) => s.UpdateVisualState());
        IsCorrectProperty.Changed.AddClassHandler<OptionCard>((s, e) => s.UpdateVisualState());
        IsWrongProperty.Changed.AddClassHandler<OptionCard>((s, e) => s.UpdateVisualState());
        SelectionIndexProperty.Changed.AddClassHandler<OptionCard>((s, _) => s.UpdateVisualState());
        LetterProperty.Changed.AddClassHandler<OptionCard>((s, _) => s.UpdateVisualState());
    }

    protected override void OnInitialized()
    {
        base.OnInitialized();
        UpdateVisualState();
    }

    private void OnPointerPressed(object? sender, PointerPressedEventArgs e)
    {
        if (!IsCorrect && !IsWrong)
        {
            Click?.Invoke(this, EventArgs.Empty);
        }
    }

    private void UpdateVisualState()
    {
        // Letter circle shows the pick position for sequence questions.
        LetterDisplay = SelectionIndex > 0 ? SelectionIndex.ToString() : Letter;

        // Clear all state classes
        var states = new[] { "selected", "correct", "wrong" };
        foreach (var state in states)
        {
            if (CardBorder.Classes.Contains(state))
                CardBorder.Classes.Remove(state);
            if (LetterCircle.Classes.Contains(state))
                LetterCircle.Classes.Remove(state);
            if (LetterTextBlock.Classes.Contains(state))
                LetterTextBlock.Classes.Remove(state);
            if (OptionTextBlock.Classes.Contains(state))
                OptionTextBlock.Classes.Remove(state);
            if (CheckmarkText.Classes.Contains(state))
                CheckmarkText.Classes.Remove(state);
        }

        // Apply active state class (priority: correct > wrong > selected)
        string? activeClass = null;
        if (IsCorrect)
            activeClass = "correct";
        else if (IsWrong)
            activeClass = "wrong";
        else if (IsSelected)
            activeClass = "selected";

        if (activeClass != null)
        {
            CardBorder.Classes.Add(activeClass);
            LetterCircle.Classes.Add(activeClass);
            LetterTextBlock.Classes.Add(activeClass);
            OptionTextBlock.Classes.Add(activeClass);
            CheckmarkText.Classes.Add(activeClass);
        }
    }
}
