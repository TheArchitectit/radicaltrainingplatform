using Avalonia;
using Avalonia.Headless;

[assembly: AvaloniaTestApplication(typeof(RadicalTrainingPlatform.Desktop.Tests.TestAppBuilder))]

namespace RadicalTrainingPlatform.Desktop.Tests;

/// <summary>
/// Boots the REAL Desktop App (App.axaml + SimpleTheme + composition root) on
/// Avalonia's headless backend — no display required, so this runs on the
/// fleet runner. Catches what compile checks cannot: XAML load errors,
/// theme/resource resolution (the Avalonia 11/12 package skew), and DI
/// resolution at app startup.
/// </summary>
public class TestAppBuilder
{
    public static AppBuilder BuildAvaloniaApp() =>
        AppBuilder.Configure<RadicalTrainingPlatform.Avalonia.App>()
                  .UseHeadless(new AvaloniaHeadlessPlatformOptions());
}
