using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using RadicalTrainingPlatform.Core;
using Shouldly;
using Xunit;

namespace RadicalTrainingPlatform.Core.Tests;

/// <summary>
/// PKG-01: the app must load its content from what its bundle declares, in a
/// directory with no repository above it, and must say so loudly when that
/// content is not there. Before this, discovery walked up to six parent
/// directories, so a checkout always found content by accident and an installed
/// bundle that had lost its content started anyway — empty, and silent.
/// </summary>
public class ContentBundleTests : IDisposable
{
    private readonly List<string> _tempDirs = new();

    public void Dispose()
    {
        foreach (var dir in _tempDirs)
        {
            try { Directory.Delete(dir, recursive: true); } catch (IOException) { }
        }
    }

    /// <summary>Walk up from the test binary to the checkout that holds the manifest.</summary>
    private static string RepoRoot()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir != null)
        {
            if (File.Exists(Path.Combine(dir.FullName, ContentBundle.ManifestFileName)))
                return dir.FullName;
            dir = dir.Parent;
        }
        throw new InvalidOperationException(
            $"no {ContentBundle.ManifestFileName} above {AppContext.BaseDirectory}");
    }

    /// <summary>
    /// A bundle the way an installed one is laid out: exactly the files the
    /// manifest declares, copied to a temp directory that has no repository
    /// above it. Copying from the manifest rather than the tree means a
    /// manifest that omits a file fails here, not in front of a learner.
    /// </summary>
    private string CreateCleanBundle()
    {
        var repo = RepoRoot();
        var manifestPath = Path.Combine(repo, ContentBundle.ManifestFileName);
        var target = Path.Combine(Path.GetTempPath(), "rtp-bundle-" + Guid.NewGuid().ToString("N"));
        _tempDirs.Add(target);

        using var doc = JsonDocument.Parse(File.ReadAllText(manifestPath));
        foreach (var file in doc.RootElement.GetProperty("files").EnumerateArray())
        {
            var rel = file.GetProperty("path").GetString()!;
            var src = Path.Combine(repo, rel.Replace('/', Path.DirectorySeparatorChar));
            var dst = Path.Combine(target, rel.Replace('/', Path.DirectorySeparatorChar));
            Directory.CreateDirectory(Path.GetDirectoryName(dst)!);
            File.Copy(src, dst);
        }
        File.Copy(manifestPath, Path.Combine(target, ContentBundle.ManifestFileName));
        return target;
    }

    private static (IContentBundle Bundle, IFileProvider Files) Open(string? bundleRoot)
    {
        IFileProvider files = new DefaultFileProvider();
        return (new ContentBundle(files, null, bundleRoot), files);
    }

    // ── the clean-directory test ───────────────────────────────────────

    [Fact]
    public void CleanDirectory_LoadsKnownExamCountQuestionErrataAndLesson()
    {
        var root = CreateCleanBundle();
        var (bundle, files) = Open(root);

        bundle.IsAvailable.ShouldBeTrue(bundle.UnavailableReason ?? "bundle should be available");
        bundle.Verify().ShouldBeEmpty();

        var repository = new MarkdownExamRepository(files, bundle);
        var errata = new JsonErrataStore(files, bundle);
        var parser = new QuestionParser(repository, errata);

        // A known exam, and the count the bundle actually carries.
        var catalog = parser.BuildCatalog();
        var nca = catalog.SingleOrDefault(c => c.ExamCode == "NCA-75");
        nca.ShouldNotBeNull("the NCA-75 banks ship in the bundle");
        nca!.QuestionCount.ShouldBe(140); // 40 + 40 + 60 across the three parts

        // A specific question, with the errata correction applied — the bundle
        // declares errata.json, so a bundle without it would fail here.
        var questions = parser.ParseFile(Path.Combine(root, "NCA-75-Part1.md"));
        questions.Count.ShouldBe(40);
        var q35 = questions.Single(q => q.Id == 35);
        q35.CorrectAnswers.ShouldBe(["D"], "errata.json corrects this key from B to D");

        // A lesson, read through the manifest rather than discovered.
        var lessons = new BundleLessonCatalog(bundle, files);
        var lesson = lessons.GetLesson("COMPTIA-A-1201", "a2");
        lesson.ShouldNotBeNull();
        lesson!.Title.ShouldBe("Networking Basics (A2)");
        lesson.Body.ShouldContain("DHCP");
        lessons.ListLessons("COMPTIA-A-1201").ShouldContain("a2");

        // The disclaimer the artifact must carry, verbatim (SPEC-16).
        bundle.Manifest!.Disclaimer.ShouldBe(
            "This is independent study material. It is not official training and is not "
            + "endorsed or approved by CompTIA, Nutanix, or any other certification body.");
    }

    [Fact]
    public void CleanDirectory_RepositorySearchesTheBundleRootAndNothingElse()
    {
        var root = CreateCleanBundle();
        var (bundle, files) = Open(root);

        var repository = new MarkdownExamRepository(files, bundle);

        // The old auto paths (cwd, assembly dir, app data, six parent walks) are
        // exactly the ones that made a missing bundle look like an empty one.
        repository.SearchPaths.ShouldBe([root]);
    }

    [Fact]
    public void RegisteredSearchPath_StillWins_ForHostsThatRegisterTheirOwn()
    {
        var root = CreateCleanBundle();
        var (bundle, files) = Open(root);
        var repository = new MarkdownExamRepository(files, bundle);
        var registered = Path.Combine(root, "content");

        repository.RegisterSearchPath(registered);

        // An explicit registration is a host saying "the content is here", so it
        // takes priority and the bundle root is not silently added behind it.
        repository.SearchPaths.First().ShouldBe(registered);
        repository.SearchPaths.ShouldNotContain(root);
    }

    // ── honest failures ───────────────────────────────────────────────

    [Fact]
    public void NoManifest_IsAnHonestError()
    {
        var empty = Path.Combine(Path.GetTempPath(), "rtp-empty-" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(empty);
        _tempDirs.Add(empty);
        var (bundle, _) = Open(empty);

        bundle.IsAvailable.ShouldBeFalse();

        var ex = Should.Throw<ContentBundleUnavailableException>(() => bundle.EnsureAvailable());
        ex.Message.ShouldContain(ContentBundle.ManifestFileName);
        ex.Message.ShouldContain(ContentBundle.BundleRootEnvironmentVariable);
        ex.SearchedLocations.ShouldNotBeEmpty();
    }

    [Fact]
    public void MissingContentDirectory_IsAnHonestError()
    {
        var root = CreateCleanBundle();
        Directory.Delete(Path.Combine(root, "content"), recursive: true);
        var (bundle, _) = Open(root);

        bundle.Manifest.ShouldNotBeNull("the manifest is still there — that is the point");
        bundle.IsAvailable.ShouldBeFalse();

        var ex = Should.Throw<ContentBundleUnavailableException>(() => bundle.EnsureAvailable());
        ex.Message.ShouldContain("content root");
        ex.Message.ShouldContain("incomplete");
    }

    [Fact]
    public void MissingDeclaredFile_IsReportedByVerify()
    {
        var root = CreateCleanBundle();
        File.Delete(Path.Combine(root, "NCA-75-Part1.md"));
        var (bundle, _) = Open(root);

        bundle.Verify().ShouldContain(p => p.StartsWith("missing: NCA-75-Part1.md"));
    }

    [Fact]
    public void ChangedFile_IsReportedAsAHashMismatch()
    {
        var root = CreateCleanBundle();
        File.AppendAllText(Path.Combine(root, "NCA-75-Part1.md"), "\n<!-- edited after packing -->\n");
        var (bundle, _) = Open(root);

        bundle.Verify().ShouldContain(p => p.StartsWith("hash mismatch: NCA-75-Part1.md"));
    }

    [Fact]
    public void MalformedManifest_IsAnHonestError()
    {
        var root = CreateCleanBundle();
        File.WriteAllText(Path.Combine(root, ContentBundle.ManifestFileName), "{ not json");
        var (bundle, _) = Open(root);

        bundle.IsAvailable.ShouldBeFalse();
        bundle.UnavailableReason.ShouldNotBeNull().ShouldContain("malformed");

        var ex = Should.Throw<ContentBundleUnavailableException>(() => bundle.EnsureAvailable());
        ex.Message.ShouldContain("malformed");
    }

    // ── where a bundle is looked for ──────────────────────────────────

    [Fact]
    public void SearchedLocations_AreTheKnownBundleLayouts_AndABoundedClimb()
    {
        // No override: exercise the real location list.
        var (bundle, _) = Open(null);

        var searched = bundle.SearchedLocations.Select(p => p.Replace('\\', '/')).ToList();

        // The installed layouts, by name.
        searched.ShouldContain(p => p.EndsWith("/share/radicaltrainingplatform/" + ContentBundle.ManifestFileName));
        searched.ShouldContain(p => p.EndsWith("/Resources/" + ContentBundle.ManifestFileName));
        searched.ShouldContain(p => p.EndsWith("/" + ContentBundle.ManifestFileName));

        // Every candidate is a manifest path, and the list is bounded: four
        // named layouts plus a climb of at most six. An unbounded walk is how
        // a build tree used to stand in for content that was never installed.
        searched.ShouldAllBe(p => p.EndsWith("/" + ContentBundle.ManifestFileName));
        searched.Count.ShouldBeLessThanOrEqualTo(10);
        searched.ShouldBeUnique();
    }

    // ── lessons ───────────────────────────────────────────────────────

    [Fact]
    public void LessonCatalog_UnknownLessonIsNull_NotAThrow()
    {
        var root = CreateCleanBundle();
        var (bundle, files) = Open(root);
        var lessons = new BundleLessonCatalog(bundle, files);

        lessons.GetLesson("COMPTIA-A-1201", "nope").ShouldBeNull();
        lessons.GetLesson("NO-SUCH-EXAM", "a2").ShouldBeNull();
        lessons.ListLessons("NO-SUCH-EXAM").ShouldBeEmpty();
    }

    [Fact]
    public void LessonCatalog_WithoutABundle_IsEmpty_NotAThrow()
    {
        var (bundle, files) = Open(Path.Combine(Path.GetTempPath(), "rtp-none-" + Guid.NewGuid().ToString("N")));
        var lessons = new BundleLessonCatalog(bundle, files);

        lessons.ListLessons("COMPTIA-A-1201").ShouldBeEmpty();
        lessons.GetLesson("COMPTIA-A-1201", "a2").ShouldBeNull();
    }
}
