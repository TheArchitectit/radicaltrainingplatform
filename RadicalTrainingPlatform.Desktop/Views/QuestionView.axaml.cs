using Avalonia;
using Avalonia.Controls;
using Avalonia.Input;
using Avalonia.Interactivity;
using Avalonia.Threading;
using Avalonia.VisualTree;
using RadicalTrainingPlatform.Core.ViewModels;

namespace RadicalTrainingPlatform.Avalonia.Views;

/// <summary>
/// Main question view for the Avalonia study app.
/// Displays question stem, option cards, submit button, explanation panel.
/// Keyboard shortcuts: 1-5 select, Enter submit, E toggle explain.
/// </summary>
public partial class QuestionView : UserControl
{
    private ExamSessionViewModel? _viewModel;
    private readonly Dictionary<string, OptionCard> _optionCards = new();
    private bool _explanationVisible;

    public QuestionView()
    {
        InitializeComponent();

        DataContextChanged += OnDataContextChanged;
        Unloaded += OnUnloaded;
    }

    private void OnUnloaded(object? sender, RoutedEventArgs e)
    {
        UnsubscribeCards();
        if (_viewModel != null)
        {
            _viewModel.PropertyChanged -= OnViewModelPropertyChanged;
            _viewModel = null;
        }
    }

    private void UnsubscribeCards()
    {
        foreach (var (_, card) in _optionCards)
        {
            card.Click -= OnOptionCardClick;
        }
        _optionCards.Clear();
    }

    protected override void OnLoaded(RoutedEventArgs e)
    {
        base.OnLoaded(e);
        Focus(); // Capture keyboard input
    }

    private void OnDataContextChanged(object? sender, EventArgs e)
    {
        if (DataContext is not ExamSessionViewModel vm)
            return;

        // Unsubscribe any previous VM's PropertyChanged to avoid
        // double-firing on DataContext swaps / recycled controls.
        if (_viewModel is not null)
        {
            _viewModel.PropertyChanged -= OnViewModelPropertyChanged;
        }

        _viewModel = vm;
        _viewModel.PropertyChanged += OnViewModelPropertyChanged;

        RefreshUI();
        // Defer wiring until ItemsControl has rendered its children.
        // Calling synchronously here misses the cards because the visual
        // tree is built on the next layout pass.
        Dispatcher.UIThread.Post(WireOptionCards, DispatcherPriority.Render);
    }

    private void OnViewModelPropertyChanged(object? sender, System.ComponentModel.PropertyChangedEventArgs e)
    {
        switch (e.PropertyName)
        {
            case nameof(ExamSessionViewModel.CurrentQuestion):
            case nameof(ExamSessionViewModel.CurrentNumber):
                _explanationVisible = false;
                _optionCards.Clear();
                RefreshUI();
                // Re-wire after ItemsControl renders
                Dispatcher.UIThread.Post(WireOptionCards, DispatcherPriority.Render);
                break;

            case nameof(ExamSessionViewModel.SelectedAnswers):
                UpdateOptionCardStates();
                break;

            case nameof(ExamSessionViewModel.IsSubmitted):
                UpdatePostSubmitState();
                break;

            case nameof(ExamSessionViewModel.HasPrevious):
            case nameof(ExamSessionViewModel.HasNext):
                // Navigation button visibility handled by bindings
                break;
        }
    }

    private void RefreshUI()
    {
        if (_viewModel == null)
            return;

        // Update question counter text manually (binding handles most)
        QuestionCounter.Text = $"Question {_viewModel.CurrentNumber} / {_viewModel.TotalQuestions}";

        // Update progress bar (custom SynthwaveProgressBar uses .Progress)
        double progressPercent = _viewModel.TotalQuestions > 0
            ? ((_viewModel.CurrentIndex + 1) * 100.0 / _viewModel.TotalQuestions)
            : 0;
        ProgressBar.Progress = progressPercent;

        // Multi-select hint
        MultiSelectHint.IsVisible = _viewModel.CurrentQuestion?.IsMultiSelect ?? false;

        // Reset explanation
        _explanationVisible = false;
        ExplanationPanel.IsVisible = false;

        // Reset submit/nav visibility
        if (_viewModel.IsSubmitted)
        {
            SubmitButton.IsVisible = false;
            NavButtons.IsVisible = true;
            ShowResultIndicator();
        }
        else
        {
            SubmitButton.IsVisible = true;
            SubmitButton.IsEnabled = _viewModel.SelectedAnswers.Count > 0;
            NavButtons.IsVisible = false;
            ResultIndicator.IsVisible = false;
        }

        UpdateOptionCardStates();
    }

    private void WireOptionCards()
    {
        foreach (var (_, card) in _optionCards)
        {
            card.Click -= OnOptionCardClick;
        }
        _optionCards.Clear();

        foreach (var descendant in OptionsList.GetVisualDescendants())
        {
            if (descendant is OptionCard card)
            {
                _optionCards[card.Letter] = card;
                card.Click += OnOptionCardClick;
            }
        }

        UpdateOptionCardStates();
    }

    private void OnOptionCardClick(object? sender, EventArgs e)
    {
        if (sender is not OptionCard card)
            return;

        _viewModel?.SelectAnswer(card.Letter);
    }

    private void OnOptionClicked(object? sender, RoutedEventArgs e)
    {
        // Routed event handler from XAML - find the OptionCard
        if (e.Source is OptionCard card)
        {
            _viewModel?.SelectAnswer(card.Letter);
        }
    }

    private void UpdateOptionCardStates()
    {
        if (_viewModel == null)
            return;

        foreach (var (letter, card) in _optionCards)
        {
            bool isSelected = _viewModel.SelectedAnswers.Contains(letter);
            bool isCorrectAnswer = _viewModel.CurrentQuestion?.CorrectAnswers.Contains(letter) ?? false;
            bool isSubmitted = _viewModel.IsSubmitted;

            card.IsSelected = isSelected;
            card.IsCorrect = isSubmitted && isCorrectAnswer;
            card.IsWrong = isSubmitted && isSelected && !isCorrectAnswer;

            // Dim unselected cards after submit
            if (isSubmitted)
            {
                card.Opacity = isCorrectAnswer || isSelected ? 1.0 : 0.5;
            }
            else
            {
                card.Opacity = 1.0;
            }
        }

        // Update submit button enabled state
        if (!_viewModel.IsSubmitted)
        {
            SubmitButton.IsEnabled = _viewModel.SelectedAnswers.Count > 0;
        }
    }

    private void UpdatePostSubmitState()
    {
        if (_viewModel == null)
            return;

        if (_viewModel.IsSubmitted)
        {
            SubmitButton.IsVisible = false;
            NavButtons.IsVisible = true;
            ShowResultIndicator();
            UpdateOptionCardStates();

            // Auto-show explanation after submit
            _explanationVisible = true;
            ExplanationPanel.IsVisible = true;
        }
        else
        {
            SubmitButton.IsVisible = true;
            NavButtons.IsVisible = false;
            ResultIndicator.IsVisible = false;
            ExplanationPanel.IsVisible = false;
        }
    }

    private void ShowResultIndicator()
    {
        if (_viewModel == null)
            return;

        ResultIndicator.IsVisible = true;

        if (_viewModel.IsCorrect)
        {
            ResultIndicator.Text = "✓ CORRECT";
            ResultIndicator.Classes.Remove("wrong");
            if (!ResultIndicator.Classes.Contains("correct"))
                ResultIndicator.Classes.Add("correct");
        }
        else
        {
            ResultIndicator.Text = "✗ INCORRECT";
            ResultIndicator.Classes.Remove("correct");
            if (!ResultIndicator.Classes.Contains("wrong"))
                ResultIndicator.Classes.Add("wrong");
        }
    }

    // ---- Button handlers ----

    private void OnSubmitClicked(object? sender, RoutedEventArgs e)
    {
        if (_viewModel?.Submit() ?? false)
        {
            // Correct answer handling if needed
        }
    }

    private void OnNextClicked(object? sender, RoutedEventArgs e)
    {
        _viewModel?.Next();
    }

    private void OnPreviousClicked(object? sender, RoutedEventArgs e)
    {
        _viewModel?.Previous();
    }

    private void OnToggleExplanation(object? sender, RoutedEventArgs e)
    {
        ToggleExplanation();
    }

    private void ToggleExplanation()
    {
        _explanationVisible = !_explanationVisible;
        ExplanationPanel.IsVisible = _explanationVisible;
    }

    // ---- Keyboard shortcuts ----

    private void OnKeyDown(object? sender, KeyEventArgs e)
    {
        // Only swallow keys we actually handle. Otherwise let TextBoxes,
        // TextBoxes-with-input-methods, etc. receive them.
        switch (e.Key)
        {
            case Key.D1:
            case Key.D2:
            case Key.D3:
            case Key.D4:
            case Key.D5:
            case Key.NumPad1:
            case Key.NumPad2:
            case Key.NumPad3:
            case Key.NumPad4:
            case Key.NumPad5:
                HandleNumberKey(e.Key);
                e.Handled = true;
                return;

            case Key.Enter:
                if (!(_viewModel?.IsSubmitted ?? false))
                {
                    OnSubmitClicked(sender, e);
                }
                e.Handled = true;
                return;

            case Key.E:
                if (_viewModel?.IsSubmitted ?? false)
                {
                    ToggleExplanation();
                }
                e.Handled = true;
                return;

            case Key.Left:
                if ((_viewModel?.IsSubmitted ?? false) && (_viewModel?.HasPrevious ?? false))
                {
                    OnPreviousClicked(sender, e);
                }
                e.Handled = true;
                return;

            case Key.Right:
                if ((_viewModel?.IsSubmitted ?? false) && (_viewModel?.HasNext ?? false))
                {
                    OnNextClicked(sender, e);
                }
                e.Handled = true;
                return;
        }
    }

    private void HandleNumberKey(Key key)
    {
        if (_viewModel?.IsSubmitted ?? true)
            return;

        int index = key switch
        {
            Key.D1 or Key.NumPad1 => 0,
            Key.D2 or Key.NumPad2 => 1,
            Key.D3 or Key.NumPad3 => 2,
            Key.D4 or Key.NumPad4 => 3,
            Key.D5 or Key.NumPad5 => 4,
            _ => -1
        };

        if (index < 0)
            return;

        var options = _viewModel.CurrentQuestion?.Options;
        if (options == null || index >= options.Count)
            return;

        _viewModel.SelectAnswer(options[index].Letter);
    }
}
