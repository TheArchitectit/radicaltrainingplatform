using System;
using System.IO;

namespace RadicalTrainingPlatform.Avalonia.LabSimulator;

/// <summary>
/// Navigation allowlist for the embedded CEF browser (R-21 / CEF-01 / TM-89).
///
/// The lab simulator is a local bundle. The browser has NoSandbox=true, so
/// any navigation that leaves that bundle is a hardening risk, not a feature.
/// Out-of-app destinations (GitHub releases, docs) open in the OS browser via
/// the shell, never inside CEF.
///
/// Pure decision surface so the policy is fixture-testable without a CEF
/// runtime (same pattern as ExportText for PDF identity).
/// </summary>
public static class NavigationPolicy
{
    /// <summary>Why a target was allowed or blocked.</summary>
    public readonly record struct Decision(bool Allowed, string Reason);

    /// <summary>
    /// Evaluate one navigation target against the bundle root
    /// (the directory that holds the bundled index.html and its assets).
    /// </summary>
    public static Decision Evaluate(string? targetUrl, string? bundleRootPath)
    {
        if (string.IsNullOrWhiteSpace(targetUrl))
            return new Decision(false, "empty target");

        var url = targetUrl.Trim();

        // CEF internals. about:blank is the pre-load document; about:srcdoc
        // is an in-frame document. Neither leaves the process.
        if (url.Equals("about:blank", StringComparison.OrdinalIgnoreCase)
            || url.Equals("about:srcdoc", StringComparison.OrdinalIgnoreCase))
            return new Decision(true, "cef-internal");

        if (!Uri.TryCreate(url, UriKind.Absolute, out var uri))
            return new Decision(false, "not an absolute URI");

        // Only file:// may reach content, and only inside the bundle tree.
        // http(s) is deliberately denied in-process: release/download links
        // go through the OS shell (OnDownloadClicked), not this browser.
        if (!uri.IsFile)
            return new Decision(false, $"scheme '{uri.Scheme}' is not allowed in-process");

        if (string.IsNullOrWhiteSpace(bundleRootPath))
            return new Decision(false, "bundle root unknown — denying file navigation");

        string candidate;
        try
        {
            candidate = Path.GetFullPath(Uri.UnescapeDataString(uri.LocalPath));
        }
        catch (Exception)
        {
            return new Decision(false, "unparseable file path");
        }

        string root;
        try
        {
            root = Path.GetFullPath(bundleRootPath);
        }
        catch (Exception)
        {
            return new Decision(false, "bundle root unparseable — denying file navigation");
        }

        // Trailing separator so /bundle-evil does not match root /bundle.
        if (!root.EndsWith(Path.DirectorySeparatorChar))
            root += Path.DirectorySeparatorChar;

        if (!candidate.StartsWith(root, StringComparison.OrdinalIgnoreCase)
            && !string.Equals(
                Path.GetFullPath(bundleRootPath),
                candidate,
                StringComparison.OrdinalIgnoreCase))
        {
            return new Decision(false, "file URI is outside the lab bundle");
        }

        return new Decision(true, "inside lab bundle");
    }

    public static bool IsAllowed(string? targetUrl, string? bundleRootPath)
        => Evaluate(targetUrl, bundleRootPath).Allowed;

    /// <summary>
    /// Enforcement helper: null when the navigation may proceed, otherwise
    /// the URL to bounce back to (the bundle bootstrap).
    /// </summary>
    public static string? BlockedRedirect(string? targetUrl, string? bundleRootPath, string bootstrapUrl)
        => IsAllowed(targetUrl, bundleRootPath) ? null : bootstrapUrl;
}
