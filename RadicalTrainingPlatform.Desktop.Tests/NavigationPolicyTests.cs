using System;
using System.IO;
using RadicalTrainingPlatform.Avalonia.LabSimulator;
using Shouldly;
using Xunit;

namespace RadicalTrainingPlatform.Desktop.Tests;

/// <summary>
/// TM-89 / R-21 / CEF-01 — navigation allowlist fixtures.
///
/// Failing side (the pre-review state): the embedded browser navigated
/// anywhere the page pointed it — including https:// — with NoSandbox=true
/// and no policy. Passing side: NavigationPolicy denies every scheme that
/// leaves the local lab bundle and every file URI outside it.
/// No exploit is asserted; this pins the decision surface.
/// </summary>
public class NavigationPolicyTests
{
    private static readonly string BundleRoot = Path.Combine(
        Path.GetTempPath(), "rtp-lab-bundle", "Web");

    private static string InBundle(string file)
        => new Uri(Path.Combine(BundleRoot, file)).AbsoluteUri;

    [Fact]
    public void BootstrapIndex_IsAllowed()
    {
        NavigationPolicy.IsAllowed(InBundle("index.html"), BundleRoot).ShouldBeTrue();
    }

    [Fact]
    public void BundleAssets_AreAllowed()
    {
        NavigationPolicy.IsAllowed(InBundle("js/app.js"), BundleRoot).ShouldBeTrue();
        NavigationPolicy.IsAllowed(InBundle("css/study.css"), BundleRoot).ShouldBeTrue();
    }

    [Fact]
    public void AboutBlankAndSrcdoc_AreAllowed_CefInternals()
    {
        NavigationPolicy.IsAllowed("about:blank", BundleRoot).ShouldBeTrue();
        NavigationPolicy.IsAllowed("about:srcdoc", BundleRoot).ShouldBeTrue();
    }

    // ─── Denied: anything that leaves the bundle ─────────────────────

    [Theory]
    [InlineData("https://github.com/TheArchitectit/radicaltrainingplatform/releases")]
    [InlineData("http://example.com/")]
    [InlineData("https://evil.example/phish")]
    public void HttpAndHttps_AreDenied_InProcess(string url)
    {
        // Out-of-app destinations open in the OS shell (OnDownloadClicked),
        // never inside the NoSandbox embedded browser.
        var d = NavigationPolicy.Evaluate(url, BundleRoot);
        d.Allowed.ShouldBeFalse();
        d.Reason.ShouldContain("scheme");
    }

    [Theory]
    [InlineData("javascript:alert(1)")]
    [InlineData("data:text/html,<h1>x</h1>")]
    [InlineData("blob:https://evil.example/uuid")]
    [InlineData("chrome://settings")]
    [InlineData("chrome-extension://abcdef/popup.html")]
    [InlineData("devtools://devtools/bundled/inspector.html")]
    [InlineData("view-source:https://evil.example")]
    public void DangerousSchemes_AreDenied(string url)
        => NavigationPolicy.IsAllowed(url, BundleRoot).ShouldBeFalse();

    [Fact]
    public void FileUri_OutsideBundle_IsDenied()
    {
        var outside = new Uri(Path.Combine(Path.GetTempPath(), "rtp-secret", "notes.txt")).AbsoluteUri;
        var d = NavigationPolicy.Evaluate(outside, BundleRoot);
        d.Allowed.ShouldBeFalse();
        d.Reason.ShouldContain("outside");
    }

    [Fact]
    public void SiblingDirectoryPrefix_IsNotConfusedWithBundleRoot()
    {
        // /tmp/rtp-lab-bundle-evil must not match root /tmp/rtp-lab-bundle/Web
        // via a naive prefix check; and a sibling of Web must not match either.
        var evil = new Uri(Path.Combine(Path.GetTempPath(), "rtp-lab-bundle-evil", "x.html")).AbsoluteUri;
        NavigationPolicy.IsAllowed(evil, BundleRoot).ShouldBeFalse();

        var sibling = new Uri(Path.Combine(Path.GetTempPath(), "rtp-lab-bundle", "Other", "x.html")).AbsoluteUri;
        NavigationPolicy.IsAllowed(sibling, BundleRoot).ShouldBeFalse();
    }

    [Fact]
    public void EmptyOrRelativeTarget_IsDenied()
    {
        NavigationPolicy.IsAllowed(null, BundleRoot).ShouldBeFalse();
        NavigationPolicy.IsAllowed("", BundleRoot).ShouldBeFalse();
        NavigationPolicy.IsAllowed("   ", BundleRoot).ShouldBeFalse();
        NavigationPolicy.IsAllowed("index.html", BundleRoot).ShouldBeFalse();
    }

    [Fact]
    public void UnknownBundleRoot_DeniesFileNavigation()
    {
        // Fail closed: if we cannot name the bundle, no file URI is allowed.
        NavigationPolicy.IsAllowed(InBundle("index.html"), null).ShouldBeFalse();
        NavigationPolicy.IsAllowed(InBundle("index.html"), "").ShouldBeFalse();
    }

    // ─── Enforcement helper (what LabSimulatorView bounces back to) ──

    [Fact]
    public void BlockedRedirect_ReturnsBootstrap_ForForeignTargets()
    {
        var bootstrap = InBundle("index.html");
        NavigationPolicy.BlockedRedirect("https://evil.example", BundleRoot, bootstrap)
            .ShouldBe(bootstrap);
        NavigationPolicy.BlockedRedirect(
                new Uri(Path.Combine(Path.GetTempPath(), "other", "x.html")).AbsoluteUri,
                BundleRoot, bootstrap)
            .ShouldBe(bootstrap);
    }

    [Fact]
    public void BlockedRedirect_IsNull_WhenNavigationAllowed()
    {
        var bootstrap = InBundle("index.html");
        NavigationPolicy.BlockedRedirect(bootstrap, BundleRoot, bootstrap).ShouldBeNull();
        NavigationPolicy.BlockedRedirect("about:blank", BundleRoot, bootstrap).ShouldBeNull();
    }

    // ─── Regression pin: the pre-review open-navigation failure ──────

    /// <summary>
    /// Archived CEF-01 failure (reproduced then fixed): with no policy the
    /// embedded NoSandbox browser followed any URL. This pin fails if the
    /// allowlist ever reopens http(s) or foreign file URIs in-process.
    /// </summary>
    [Fact]
    public void OldFailure_OpenNavigation_IsPinnedOut()
    {
        NavigationPolicy.IsAllowed("https://anywhere.example", BundleRoot).ShouldBeFalse();
        NavigationPolicy.IsAllowed("http://anywhere.example", BundleRoot).ShouldBeFalse();
        var outside = new Uri(Path.Combine(Path.GetTempPath(), "anywhere.html")).AbsoluteUri;
        NavigationPolicy.IsAllowed(outside, BundleRoot).ShouldBeFalse();
    }
}
