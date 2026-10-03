using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using NSubstitute;
using RadicalTrainingPlatform.Core;
using RadicalTrainingPlatform.Core.Models;
using Shouldly;
using Xunit;

namespace RadicalTrainingPlatform.Core.Tests;

public class ErrataTests
{
    private sealed class FakeErrata : IErrataProvider
    {
        private readonly Dictionary<(string, int), List<string>> _map = new();
        public void Add(string file, int id, params string[] answers)
            => _map[(file.ToUpperInvariant(), id)] = answers.ToList();

        public bool TryGetCorrection(string sourceFileName, int questionId, out IReadOnlyList<string> correctAnswers)
        {
            if (_map.TryGetValue((sourceFileName.ToUpperInvariant(), questionId), out var a))
            {
                correctAnswers = a;
                return true;
            }
            correctAnswers = Array.Empty<string>();
            return false;
        }
    }

    private const string QuestionMd =
        "### Q35\nWhat is the max?\n- A) 5000\n- B) 10000\n- C) 15000\n- D) 25000\n\n**Answer: B**\n\n---\n";

    private static IExamRepository Repo(string fileName, string content)
    {
        var repo = NSubstitute.Substitute.For<IExamRepository>();
        repo.ReadExamFile(Arg.Any<string>()).Returns(content);
        repo.FindExamFiles().Returns(new[] { fileName });
        return repo;
    }

    [Fact]
    public void Parser_WithErrata_OverridesAnswerKey()
    {
        var errata = new FakeErrata();
        errata.Add("NCA-75-Part1.md", 35, "D");
        var parser = new QuestionParser(Repo("NCA-75-Part1.md", QuestionMd), errata);

        var q = parser.ParseFile("NCA-75-Part1.md").Single();
        q.CorrectAnswers.ShouldBe(["D"]);
    }

    [Fact]
    public void Parser_WithoutErrata_KeepsParsedKey()
    {
        var parser = new QuestionParser(Repo("NCA-75-Part1.md", QuestionMd), new FakeErrata());
        var q = parser.ParseFile("NCA-75-Part1.md").Single();
        q.CorrectAnswers.ShouldBe(["B"]);
    }

    [Fact]
    public void Parser_NullErrata_KeepsParsedKey()
    {
        // Legacy 2-arg ctor path (used across the existing suite).
        var parser = new QuestionParser(Repo("NCA-75-Part1.md", QuestionMd));
        var q = parser.ParseFile("NCA-75-Part1.md").Single();
        q.CorrectAnswers.ShouldBe(["B"]);
    }

    [Fact]
    public void Errata_QuestionIdOnlyMatch_FileMustMatchToo()
    {
        // Ids repeat across files — an errata for Part1.md must not touch Part2.md.
        var errata = new FakeErrata();
        errata.Add("NCA-75-Part1.md", 35, "D");
        var parser = new QuestionParser(Repo("NCA-75-Part2.md", QuestionMd), errata);
        var q = parser.ParseFile("NCA-75-Part2.md").Single();
        q.CorrectAnswers.ShouldBe(["B"]);
    }

    // ── JsonErrataStore ────────────────────────────────────────────────

    private sealed class FakeFiles : IFileProvider
    {
        // Normalize separators to '/' so tests are platform-independent — the
        // store builds keys with Path.Combine, which emits '\' on Windows.
        public readonly Dictionary<string, string> Files = new();
        public readonly HashSet<string> Dirs = new();
        private static string N(string p) => p.Replace('\\', '/');
        public string CombinePath(params string[] paths) => N(Path.Combine(paths));
        public bool Exists(string path) => Files.ContainsKey(N(path)) || Dirs.Contains(N(path));
        public string[] GetFiles(string d, string p) => Array.Empty<string>();
        public string[] GetDirectories(string d) => Array.Empty<string>();
        public string ReadAllText(string path) => Files[N(path)];
        public void WriteAllText(string path, string c) => Files[N(path)] = c;
        public void DeleteFile(string path) => Files.Remove(N(path));
        public void CreateDirectory(string path) => Dirs.Add(N(path));
        public string GetCurrentDirectory() => "/app";
        public string GetExecutingAssemblyDirectory() => "/app/bin";
        public string GetApplicationDataDirectory(string appName) => "/appdata/" + appName;
        public string? GetParentDirectory(string path) => N(Path.GetDirectoryName(path) ?? "");
    }

    private const string SampleJson = """
        { "version": 1, "errata": [
          { "id": "e1", "file": "NCA-75-Part1.md", "questionId": 35,
            "correctionType": "answerKey", "correctAnswer": ["D"],
            "rationale": "r", "dateAdded": "2026-06-12" }
        ] }
        """;

    [Fact]
    public void Store_FindsErrataByFileAndQuestionId()
    {
        var files = new FakeFiles();
        files.Files["/app/errata.json"] = SampleJson;   // walking up from /app/bin finds /app
        var store = new JsonErrataStore(files);

        store.TryGetCorrection("nca-75-part1.md", 35, out var answers).ShouldBeTrue();
        answers.ShouldBe(["D"]);
        store.TryGetCorrection("NCA-75-Part1.md", 34, out _).ShouldBeFalse();
    }

    [Fact]
    public void Store_MissingFile_NoCorrectionsNoThrow()
    {
        var store = new JsonErrataStore(new FakeFiles());
        Should.NotThrow(() => store.TryGetCorrection("any.md", 1, out var a).ShouldBeFalse());
    }

    [Fact]
    public void Store_MalformedJson_FailsSoft()
    {
        var files = new FakeFiles();
        files.Files["/app/errata.json"] = "{ not json";
        var store = new JsonErrataStore(files);
        store.TryGetCorrection("NCA-75-Part1.md", 35, out _).ShouldBeFalse();
    }

    [Fact]
    public void Store_UnsupportedCorrectionType_Skipped()
    {
        var files = new FakeFiles();
        files.Files["/app/errata.json"] = SampleJson
            .Replace("\"answerKey\"", "\"stemRewrite\"");
        var store = new JsonErrataStore(files);
        store.TryGetCorrection("NCA-75-Part1.md", 35, out _).ShouldBeFalse();
    }
}
