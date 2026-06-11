using Avalonia.Controls;
using Avalonia.Interactivity;
using Avalonia.Markup.Xaml;

namespace CertForge.Avalonia.Views;

/// <summary>
/// Blueprint coverage visualization. Wraps <see cref="BlueprintCanvas"/>.
/// </summary>
public partial class BlueprintView : UserControl
{
    public BlueprintView()
    {
        InitializeComponent();
    }
}
