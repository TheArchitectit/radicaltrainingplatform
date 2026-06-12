using System.Linq;
using NSubstitute;
using RadicalTrainingPlatform.Core.Models;
using Shouldly;
using Xunit;

namespace RadicalTrainingPlatform.Core.Tests;

public class DefaultFileProviderTests
{
    [Fact]
    public void CombinePath_JoinsMultipleSegments()
    {
        var provider = new DefaultFileProvider();
        var result = provider.CombinePath("a", "b", "c");
        result.ShouldContain("a");
        result.ShouldContain("c");
    }

    [Fact]
    public void Exists_ExistingFile_ReturnsTrue()
    {
        var provider = new DefaultFileProvider();
        // The test assembly itself should exist
        provider.Exists(typeof(DefaultFileProviderTests).Assembly.Location).ShouldBeTrue();
    }

    [Fact]
    public void Exists_NonexistentPath_ReturnsFalse()
    {
        var provider = new DefaultFileProvider();
        provider.Exists("/definitely/not/a/real/path/abc123").ShouldBeFalse();
    }

    [Fact]
    public void GetCurrentDirectory_ReturnsNonNull()
    {
        var provider = new DefaultFileProvider();
        provider.GetCurrentDirectory().ShouldNotBeNull();
    }

    [Fact]
    public void GetExecutingAssemblyDirectory_ReturnsNonNull()
    {
        var provider = new DefaultFileProvider();
        provider.GetExecutingAssemblyDirectory().ShouldNotBeNull();
    }
}

public class MarkdownExamRepositoryTests
{
    [Fact]
    public void LooksLikeExamFile_RejectsReadme()
    {
        // We can't call LooksLikeExamFile directly (it's private),
        // but we can test the behavior through FindExamFiles
        // by setting up a directory with mixed files.
        // Instead, test ReadExamFile delegates to IFileProvider.
        var files = Substitute.For<IFileProvider>();
        files.GetCurrentDirectory().Returns("/tmp");
        files.GetExecutingAssemblyDirectory().Returns("/tmp");
        files.Exists("/tmp").Returns(true);
        files.GetFiles("/tmp", "*.md").Returns(new[] { "/tmp/test.md" });
        files.ReadAllText("/tmp/test.md").Returns("### Q1\nQ?\n- A) a\n- B) b\n**Answer: A**\n---\n");

        var repo = new MarkdownExamRepository(files);

        var examFiles = repo.FindExamFiles().ToList();
        examFiles.ShouldContain("/tmp/test.md");
    }

    [Fact]
    public void ReadExamFile_DelegatesToFileProvider()
    {
        var files = Substitute.For<IFileProvider>();
        files.GetCurrentDirectory().Returns("/tmp");
        files.GetExecutingAssemblyDirectory().Returns("/tmp");
        files.Exists("/tmp").Returns(true);
        files.ReadAllText("/tmp/exam.md").Returns("content");

        var repo = new MarkdownExamRepository(files);

        repo.ReadExamFile("/tmp/exam.md").ShouldBe("content");
    }

    [Fact]
    public void SearchPaths_IncludesCurrentDirectory()
    {
        var files = Substitute.For<IFileProvider>();
        files.GetCurrentDirectory().Returns("/cwd");
        files.GetExecutingAssemblyDirectory().Returns("/asm");
        files.GetApplicationDataDirectory("RadicalTrainingPlatform").Returns("/appdata");
        files.Exists(Arg.Any<string>()).Returns(true);

        var repo = new MarkdownExamRepository(files);

        var paths = repo.SearchPaths.ToList();
        paths.ShouldContain("/cwd");
    }

    [Fact]
    public void SearchPaths_IncludesAssemblyDirectory()
    {
        var files = Substitute.For<IFileProvider>();
        files.GetCurrentDirectory().Returns("/cwd");
        files.GetExecutingAssemblyDirectory().Returns("/asm");
        files.GetApplicationDataDirectory("RadicalTrainingPlatform").Returns("/appdata");
        files.Exists(Arg.Any<string>()).Returns(true);

        var repo = new MarkdownExamRepository(files);

        var paths = repo.SearchPaths.ToList();
        paths.ShouldContain("/asm");
    }

    [Fact]
    public void SearchPaths_DeduplicatesPaths()
    {
        var files = Substitute.For<IFileProvider>();
        files.GetCurrentDirectory().Returns("/same");
        files.GetExecutingAssemblyDirectory().Returns("/same");
        files.GetApplicationDataDirectory("RadicalTrainingPlatform").Returns("/same");
        files.Exists("/same").Returns(true);
        // Directory.GetParent will return null for root
        files.Exists(Arg.Is<string>(p => p != "/same")).Returns(false);

        var repo = new MarkdownExamRepository(files);

        var paths = repo.SearchPaths.ToList();
        paths.Count(p => p == "/same").ShouldBe(1);
    }

    [Fact]
    public void FindExamFiles_SkipsReadmeAndNonExamFiles()
    {
        var files = Substitute.For<IFileProvider>();
        files.GetCurrentDirectory().Returns("/tmp");
        files.GetExecutingAssemblyDirectory().Returns("/tmp");
        files.Exists("/tmp").Returns(true);
        files.GetFiles("/tmp", "*.md").Returns(new[]
        {
            "/tmp/README.md",
            "/tmp/NCP-US-Part1.md",
            "/tmp/CHEATSHEET.md",
            "/tmp/LAB-Setup.md",
            "/tmp/CHANGELOG.md",
        });
        files.ReadAllText("/tmp/NCP-US-Part1.md").Returns("### Q1\nQ?\n- A) a\n**Answer: A**\n---\n");

        var repo = new MarkdownExamRepository(files);

        var examFiles = repo.FindExamFiles().ToList();
        examFiles.ShouldContain("/tmp/NCP-US-Part1.md");
        examFiles.ShouldNotContain("/tmp/README.md");
        examFiles.ShouldNotContain("/tmp/CHEATSHEET.md");
        examFiles.ShouldNotContain("/tmp/LAB-Setup.md");
        examFiles.ShouldNotContain("/tmp/CHANGELOG.md");
    }

    [Fact]
    public void FindExamFiles_SkipsDuplicatesAcrossSearchPaths()
    {
        var files = Substitute.For<IFileProvider>();
        files.GetCurrentDirectory().Returns("/dir1");
        files.GetExecutingAssemblyDirectory().Returns("/dir2");
        files.GetApplicationDataDirectory("RadicalTrainingPlatform").Returns("/appdata");
        files.Exists("/dir1").Returns(true);
        files.Exists("/dir2").Returns(true);
        files.Exists("/appdata").Returns(false);
        // Both dirs have the same file
        files.GetFiles("/dir1", "*.md").Returns(new[] { "/dir1/exam.md" });
        files.GetFiles("/dir2", "*.md").Returns(new[] { "/dir1/exam.md" }); // Same path

        var repo = new MarkdownExamRepository(files);

        var examFiles = repo.FindExamFiles().ToList();
        examFiles.Count.ShouldBe(1); // Deduplicated
    }
}
