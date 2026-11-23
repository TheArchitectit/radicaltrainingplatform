using System.IO;

namespace RadicalTrainingPlatform.Core.Tests;

/// <summary>
/// Path construction for tests that build an in-memory content tree (SPEC-22 CI-02).
///
/// The tests used to hardcode POSIX roots ("/repo", "/plugins") and interpolate
/// them with a forward slash, producing keys like "/repo/content". Production
/// code builds every path through <c>IFileProvider.CombinePath</c>, which is
/// <see cref="Path.Combine"/>, so on Windows it asks for "\repo\content" and the
/// lookup never matches. The result was 19 plugin tests passing on the Linux leg
/// and failing on the Windows leg — a defect invisible on the platform most of CI
/// runs on.
///
/// Every test path now goes through these helpers, so the tree the test builds and
/// the values it asserts are produced by the same call the code under test makes.
/// This is deliberately not a "normalize then compare" shim: the expectations are
/// stricter, because they assert the exact string the production path builder is
/// required to return.
/// </summary>
internal static class TestPaths
{
    /// <summary>
    /// Root a test tree at a relative segment and make it absolute.
    ///
    /// Relative because a leading '/' is what made the literals platform-specific;
    /// absolute because the provider and discovery treat these as rooted paths.
    /// </summary>
    public static string Root(params string[] segments) =>
        Path.GetFullPath(Path.Combine(segments));

    /// <summary>The same call <c>IFileProvider.CombinePath</c> delegates to.</summary>
    public static string Combine(params string[] segments) =>
        Path.Combine(segments);
}
