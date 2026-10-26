using System;
using System.Collections.Generic;
using System.Linq;
using NSubstitute;
using RadicalTrainingPlatform.Core;
using RadicalTrainingPlatform.Core.Models;
using RadicalTrainingPlatform.Core.ViewModels;
using Shouldly;
using Xunit;

namespace RadicalTrainingPlatform.Core.Tests;

/// <summary>
/// Regressions for the 2026-10-26 audit findings in Core: catalog colors,
/// blueprint routing/coverage, accuracy, Test-mode reveal, session ids and
/// exam-file discovery.
/// </summary>
public class AuditRemediationTests
{
    private static IExamRepository Repo(params (string Path, string Content)[] files)
    {
        var repo = Substitute.For<IExamRepository>();
        repo.FindExamFiles().Returns(files.Select(f => f.Path).ToArray());
        foreach (var (path, content) in files)
            repo.ReadExamFile(path).Returns(content);
        return repo;
    }

    private const string OneQuestion = "### Q1\nQ?\n- A) a\n- B) b\n**Answer: A**\n---\n";

    // ─── Catalog ───────────────────────────────────────────────────

    [Fact]
    public void CatalogColor_IsAFixedFunctionOfTheCode()
    {
        // string.GetHashCode() is randomized per process, so colors changed on
        // every launch. Pin a value: a per-process hash cannot satisfy this.
        var parser = new QuestionParser(Repo(("/x/NCA-75-Part1.md", OneQuestion)));
        parser.BuildCatalog().Single().Color.ShouldBe(FnvColor("NCA-75"));
    }

    private static string FnvColor(string code)
    {
        string[] palette = { "#00F0FF", "#FF2D95", "#BD00FF", "#39FF14", "#FFFF00",
                             "#FF6600", "#00FF88", "#FF3366", "#66FFFF", "#CC00FF" };
        uint hash = 2166136261;
        foreach (var c in code.ToUpperInvariant()) hash = (hash ^ c) * 16777619;
        return palette[hash % (uint)palette.Length];
    }

    [Fact]
    public void Catalog_CkadIsAssociate_NotShadowedByCka()
    {
        var parser = new QuestionParser(Repo(("/x/CKAD-Part1.md", OneQuestion)));
        parser.BuildCatalog().Single().Level.ShouldBe("Associate");
    }

    // ─── Blueprint routing & coverage ──────────────────────────────

    [Theory]
    [InlineData("NCA-75", "NCA-75")]
    [InlineData("nca75", "NCA-75")]
    [InlineData("NCP-AI (Review)", "NCP-AI")]
    [InlineData("NCM-MCI", "NCM-MCI")]
    public void Blueprint_RoutesByPrefix(string code, string expected) =>
        new HardcodedBlueprintService().GetBlueprint(code)!.ExamCode.ShouldBe(expected);

    [Theory]
    [InlineData("COMPTIA-A-1201")]
    [InlineData("AWS-SAA")]
    [InlineData("CYSA-PLUS")]        // contains "US": old substring routing → NCP-US
    [InlineData("GCP-MAIN")]         // contains "AI": old substring routing → NCP-AI
    [InlineData("CKAD")]
    public void Blueprint_UnrelatedCodes_HaveNone(string code) =>
        new HardcodedBlueprintService().GetBlueprint(code).ShouldBeNull();

    [Fact]
    public void BibleSections_NcmMci_NotRoutedToNcpCi()
    {
        // GetBibleSections checked "CI" before "MCI" — NCM-MCI got NCP-CI's list.
        var svc = new HardcodedBlueprintService();
        svc.GetBibleSections("NCM-MCI").ShouldNotBe(svc.GetBibleSections("NCP-CI"));
        svc.GetBibleSections("NCM-MCI").ShouldNotBeEmpty();
    }

    [Theory]
    [InlineData("Configure DR replication", "DR", true)]
    [InlineData("Set the IP address", "DR", false)]      // "adDRess"
    [InlineData("Use the REST API", "API", true)]
    [InlineData("Rapid capital growth", "API", false)]
    [InlineData("Lifecycle management", "lifecycle", true)]
    [InlineData("Take snapshots nightly", "snapshot", true)] // long keywords keep substring
    public void Coverage_ShortKeywordsMatchWholeWordsOnly(string text, string keyword, bool expected) =>
        HardcodedBlueprintService.MatchesKeyword(text, keyword).ShouldBe(expected);

    // ─── Session scoring / Test mode ───────────────────────────────

    private static List<Question> Questions(int n) =>
        Enumerable.Range(1, n).Select(i => new Question
        {
            Id = i, ExamCode = "T", SourceFile = "t.md", Stem = $"Q{i}",
            Options = { new AnswerOption { Letter = "A", Text = "x" }, new AnswerOption { Letter = "B", Text = "y" } },
            CorrectAnswers = { "A" },
        }).ToList();

    [Fact]
    public void Accuracy_IsOverAnswered_ScoreIsOverTotal()
    {
        var vm = new ExamSessionViewModel(Questions(4), "T");
        vm.SelectAnswer("A"); vm.Submit();
        vm.AccuracyPercent.ShouldBe(100);   // was 25: one right "out of 4"
        vm.ScorePercent.ShouldBe(25);
        vm.AnsweredCount.ShouldBe(1);
    }

    [Fact]
    public void TestMode_HoldsBackAnswersUntilComplete()
    {
        var vm = new ExamSessionViewModel(Questions(2), "T", revealAnswersAfterSubmit: false);
        var changed = new List<string?>();
        vm.PropertyChanged += (_, e) => changed.Add(e.PropertyName);

        vm.SelectAnswer("B"); vm.Submit();
        vm.RevealAnswers.ShouldBeFalse();
        vm.Next();
        vm.SelectAnswer("A"); vm.Submit();
        vm.IsComplete.ShouldBeTrue();
        vm.RevealAnswers.ShouldBeTrue();
        changed.ShouldContain(nameof(ExamSessionViewModel.RevealAnswers));
    }

    [Fact]
    public void StudyMode_RevealsImmediately() =>
        new ExamSessionViewModel(Questions(2), "T").RevealAnswers.ShouldBeTrue();

    // ─── Session store ids ─────────────────────────────────────────

    [Theory]
    [InlineData("a<b")]
    [InlineData("pipe|d")]
    [InlineData("q?")]
    [InlineData("CON")]
    [InlineData("nul")]
    [InlineData("has space")]
    public void SessionStore_RejectsWindowsUnsafeIds(string id)
    {
        var files = Substitute.For<IFileProvider>();
        files.GetApplicationDataDirectory(Arg.Any<string>()).Returns("/appdata");
        files.CombinePath(Arg.Any<string[]>()).Returns(ci => string.Join("/", ci.Arg<string[]>()));
        Should.Throw<ArgumentException>(() => new JsonSessionStore(files).Save(id, "{}"));
    }

    [Fact]
    public void SessionStore_AcceptsBridgeRecordIds()
    {
        var files = Substitute.For<IFileProvider>();
        files.GetApplicationDataDirectory(Arg.Any<string>()).Returns("/appdata");
        files.CombinePath(Arg.Any<string[]>()).Returns(ci => string.Join("/", ci.Arg<string[]>()));
        Should.NotThrow(() => new JsonSessionStore(files).Save("bridge-answers_1", "{}"));
    }

    // ─── Exam discovery ────────────────────────────────────────────

    [Fact]
    public void SearchPaths_DoNotWalkUpParentDirectories()
    {
        // Used to add up to six ancestors (e.g. a user's home) and scan them.
        var files = Substitute.For<IFileProvider>();
        files.GetCurrentDirectory().Returns("/cwd");
        files.GetExecutingAssemblyDirectory().Returns("/home/u/app/bin");
        files.GetApplicationDataDirectory(Arg.Any<string>()).Returns("/appdata");
        files.GetParentDirectory(Arg.Any<string>()).Returns(ci => System.IO.Path.GetDirectoryName(ci.Arg<string>()));
        files.CombinePath(Arg.Any<string[]>()).Returns(ci => string.Join("/", ci.Arg<string[]>()));
        files.Exists(Arg.Any<string>()).Returns(ci => !ci.Arg<string>().Contains("content"));

        var paths = new MarkdownExamRepository(files).SearchPaths.ToList();
        paths.ShouldBe(new[] { "/cwd", "/home/u/app/bin", "/appdata" });
    }

    [Fact]
    public void FindExamFiles_SameBankInTwoLocations_FirstWins()
    {
        // cwd (repo checkout) and the copy next to the binary hold the same
        // bank; both used to load, doubling every question.
        var files = Substitute.For<IFileProvider>();
        files.GetCurrentDirectory().Returns("/repo");
        files.GetExecutingAssemblyDirectory().Returns("/repo/bin");
        files.GetApplicationDataDirectory(Arg.Any<string>()).Returns("/appdata");
        files.CombinePath(Arg.Any<string[]>()).Returns(ci => string.Join("/", ci.Arg<string[]>()));
        files.Exists(Arg.Any<string>()).Returns(ci => ci.Arg<string>() is "/repo" or "/repo/bin");
        files.GetFiles("/repo", "*.md").Returns(new[] { "/repo/NCA-75-Part1.md" });
        files.GetFiles("/repo/bin", "*.md").Returns(new[] { "/repo/bin/NCA-75-Part1.md" });
        files.ReadAllText(Arg.Any<string>()).Returns(OneQuestion);

        new MarkdownExamRepository(files).FindExamFiles().ShouldBe(new[] { "/repo/NCA-75-Part1.md" });
    }

    [Fact]
    public void ReadExamFile_ReusesContentReadDuringDiscovery()
    {
        var files = Substitute.For<IFileProvider>();
        files.GetCurrentDirectory().Returns("/repo");
        files.GetExecutingAssemblyDirectory().Returns("/repo");
        files.GetApplicationDataDirectory(Arg.Any<string>()).Returns("/repo");
        files.CombinePath(Arg.Any<string[]>()).Returns(ci => string.Join("/", ci.Arg<string[]>()));
        files.Exists(Arg.Any<string>()).Returns(ci => ci.Arg<string>() == "/repo");
        files.GetFiles("/repo", "*.md").Returns(new[] { "/repo/NCA-75-Part1.md" });
        files.ReadAllText("/repo/NCA-75-Part1.md").Returns(OneQuestion);

        var repo = new MarkdownExamRepository(files);
        new QuestionParser(repo).LoadAllExams();
        new QuestionParser(repo).BuildCatalog();

        files.Received(1).ReadAllText("/repo/NCA-75-Part1.md"); // was 4 reads
    }
}
