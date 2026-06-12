using NSubstitute;
using RadicalTrainingPlatform.Core.Models;
using Shouldly;
using Xunit;

namespace RadicalTrainingPlatform.Core.Tests;

public class QuestionParserTests
{
    private static IExamRepository CreateRepo(string content)
    {
        var repo = Substitute.For<IExamRepository>();
        repo.ReadExamFile(Arg.Any<string>()).Returns(content);
        repo.FindExamFiles().Returns(new[] { "test-exam.md" });
        return repo;
    }

    private static string MakeQuestion(int id, string stem, string[] options, string answer, string explanation = "")
    {
        var sb = new System.Text.StringBuilder();
        sb.AppendLine($"### Q{id} {stem}");
        foreach (var opt in options)
            sb.AppendLine(opt);
        sb.AppendLine($"**Answer: {answer}**");
        if (!string.IsNullOrEmpty(explanation))
            sb.AppendLine(explanation);
        sb.AppendLine("---");
        return sb.ToString();
    }

    // ─── Standard Format Tests ───────────────────────────────────

    [Fact]
    public void ParseFile_SingleQuestion_StandardFormat_ReturnsOneQuestion()
    {
        var content = MakeQuestion(1, "What is 2+2?", ["- A) 3", "- B) 4"], "B", "Two plus two is four.");
        var repo = CreateRepo(content);
        var parser = new QuestionParser(repo);

        var questions = parser.ParseFile("test-exam.md");

        questions.ShouldHaveSingleItem();
        questions[0].Id.ShouldBe(1);
        questions[0].Stem.ShouldContain("What is 2+2?");
        questions[0].CorrectAnswers.ShouldContain("B");
        questions[0].Options.Count.ShouldBe(2);
        questions[0].Explanation.ShouldContain("Two plus two is four.");
    }

    [Fact]
    public void ParseFile_MultipleQuestions_ReturnsAll()
    {
        var content = MakeQuestion(1, "Q1", ["- A) A1", "- B) B1"], "A")
                    + MakeQuestion(2, "Q2", ["- A) A2", "- B) B2"], "B");
        var repo = CreateRepo(content);
        var parser = new QuestionParser(repo);

        var questions = parser.ParseFile("test-exam.md");

        questions.Count.ShouldBe(2);
    }

    [Fact]
    public void ParseFile_CorrectAnswerVariant_ReturnsQuestion()
    {
        var content = """
            ### Q1
            What is 2+2?
            - A) 3
            - B) 4
            **Correct Answer: B**
            Because 2+2=4.
            ---
            """;
        var repo = CreateRepo(content);
        var parser = new QuestionParser(repo);

        var questions = parser.ParseFile("test-exam.md");

        questions.ShouldHaveSingleItem();
        questions[0].CorrectAnswers.ShouldContain("B");
    }

    [Fact]
    public void ParseFile_MultiSelectAnswer_ReturnsMultipleCorrectAnswers()
    {
        var content = """
            ### Q1
            Which are prime?
            - A) 2
            - B) 4
            - C) 3
            - D) 9
            **Answer: A, C**
            Both 2 and 3 are prime.
            ---
            """;
        var repo = CreateRepo(content);
        var parser = new QuestionParser(repo);

        var questions = parser.ParseFile("test-exam.md");

        questions.ShouldHaveSingleItem();
        questions[0].CorrectAnswers.ShouldContain("A");
        questions[0].CorrectAnswers.ShouldContain("C");
        questions[0].IsMultiSelect.ShouldBeTrue();
    }

    [Fact]
    public void ParseFile_QuestionWithDomainHasDomainSet()
    {
        var content = """
            ## Domain 1: Networking
            ### Q1
            What is DNS?
            - A) Dynamic Name Service
            - B) Domain Name System
            **Answer: B**
            DNS stands for Domain Name System.
            ---
            """;
        var repo = CreateRepo(content);
        var parser = new QuestionParser(repo);

        var questions = parser.ParseFile("test-exam.md");

        questions.ShouldHaveSingleItem();
        questions[0].Domain.ShouldContain("Domain 1");
    }

    [Fact]
    public void ParseFile_QuestionWithInlineStem_ParsedCorrectly()
    {
        var content = """
            ### Q1 What is the capital of France?
            - A) London
            - B) Paris
            **Answer: B**
            Paris is the capital.
            ---
            """;
        var repo = CreateRepo(content);
        var parser = new QuestionParser(repo);

        var questions = parser.ParseFile("test-exam.md");

        questions.ShouldHaveSingleItem();
        questions[0].Stem.ShouldContain("What is the capital of France?");
    }

    [Fact]
    public void ParseFile_QuestionWithMultiLineStem_ParsedCorrectly()
    {
        var content = """
            ### Q1
            Which of the following statements
            are true about Nutanix?
            - A) It uses hyperconvergence
            - B) It requires SAN storage
            **Answer: A**
            Nutanix uses hyperconverged infrastructure.
            ---
            """;
        var repo = CreateRepo(content);
        var parser = new QuestionParser(repo);

        var questions = parser.ParseFile("test-exam.md");

        questions.ShouldHaveSingleItem();
        questions[0].Stem.ShouldContain("Which of the following statements");
        questions[0].Stem.ShouldContain("are true about Nutanix");
    }

    // ─── Edge Case Tests ─────────────────────────────────────────

    [Fact]
    public void ParseFile_EmptyContent_ReturnsEmptyList()
    {
        var repo = CreateRepo("");
        var parser = new QuestionParser(repo);

        var questions = parser.ParseFile("test-exam.md");

        questions.ShouldBeEmpty();
    }

    [Fact]
    public void ParseFile_QuestionWithoutOptions_Skipped()
    {
        var content = """
            ### Q1
            What is this?
            **Answer: A**
            No options provided.
            ---
            """;
        var repo = CreateRepo(content);
        var parser = new QuestionParser(repo);

        var questions = parser.ParseFile("test-exam.md");

        questions.ShouldBeEmpty(); // No options → skipped
    }

    [Fact]
    public void ParseFile_QuestionWithoutAnswer_Skipped()
    {
        var content = """
            ### Q1
            What is this?
            - A) Something
            - B) Nothing
            No answer line here.
            ---
            """;
        var repo = CreateRepo(content);
        var parser = new QuestionParser(repo);

        var questions = parser.ParseFile("test-exam.md");

        questions.ShouldBeEmpty(); // No answer → skipped
    }

    [Fact]
    public void ParseFile_QuestionWithOptionsUpToF_ReturnsAllOptions()
    {
        var content = """
            ### Q1
            Pick the best answer.
            - A) Option A
            - B) Option B
            - C) Option C
            - D) Option D
            - E) Option E
            - F) Option F
            **Answer: D**
            D is best.
            ---
            """;
        var repo = CreateRepo(content);
        var parser = new QuestionParser(repo);

        var questions = parser.ParseFile("test-exam.md");

        questions.ShouldHaveSingleItem();
        questions[0].Options.Count.ShouldBe(6);
    }

    [Fact]
    public void ParseFile_MixedValidAndInvalidQuestions_ReturnsOnlyValid()
    {
        var content = """
            ### Q1
            Valid question
            - A) Yes
            - B) No
            **Answer: A**
            This one is fine.
            ---
            ### Q2
            No options here
            **Answer: A**
            This should be skipped.
            ---
            ### Q3
            Another valid one
            - A) Alpha
            - B) Beta
            **Answer: B**
            Also fine.
            ---
            """;
        var repo = CreateRepo(content);
        var parser = new QuestionParser(repo);

        var questions = parser.ParseFile("test-exam.md");

        questions.Count.ShouldBe(2);
        questions[0].Id.ShouldBe(1);
        questions[1].Id.ShouldBe(3);
    }

    [Fact]
    public void ParseFile_SetsSourceFile()
    {
        var content = MakeQuestion(1, "Q1", ["- A) A1", "- B) B1"], "A");
        var repo = CreateRepo(content);
        var parser = new QuestionParser(repo);

        var questions = parser.ParseFile("my-exam.md");

        questions.ShouldHaveSingleItem();
        questions[0].SourceFile.ShouldBe("my-exam.md");
    }

    [Fact]
    public void ParseFile_SetsExamCode()
    {
        var content = MakeQuestion(1, "Q1", ["- A) A1", "- B) B1"], "A");
        var repo = CreateRepo(content);
        var parser = new QuestionParser(repo);

        var questions = parser.ParseFile("NCP-US-Part1.md");

        questions.ShouldHaveSingleItem();
        questions[0].ExamCode.ShouldBe("NCP-US");
    }

    // ─── BuildCatalog Tests ──────────────────────────────────────

    [Fact]
    public void BuildCatalog_ReturnsCatalogItems()
    {
        var content = MakeQuestion(1, "Q1", ["- A) A1", "- B) B1"], "A");
        var repo = CreateRepo(content);
        var parser = new QuestionParser(repo);

        var catalog = parser.BuildCatalog();

        catalog.ShouldNotBeEmpty();
        catalog[0].QuestionCount.ShouldBe(1);
        catalog[0].SourceFiles.ShouldContain("test-exam.md");
    }

    [Fact]
    public void BuildCatalog_MultipleFilesSameExam_MergesCounts()
    {
        var content1 = MakeQuestion(1, "Q1", ["- A) A1", "- B) B1"], "A");
        var content2 = MakeQuestion(2, "Q2", ["- A) A2", "- B) B2"], "B");
        var repo = Substitute.For<IExamRepository>();
        repo.FindExamFiles().Returns(new[] { "NCP-US-Part1.md", "NCP-US-Part2.md" });
        repo.ReadExamFile("NCP-US-Part1.md").Returns(content1);
        repo.ReadExamFile("NCP-US-Part2.md").Returns(content2);
        var parser = new QuestionParser(repo);

        var catalog = parser.BuildCatalog();

        catalog.Count.ShouldBe(1);
        catalog[0].ExamCode.ShouldBe("NCP-US");
        catalog[0].QuestionCount.ShouldBe(2);
    }

    // ─── LoadAllExams Tests ───────────────────────────────────────

    [Fact]
    public void LoadAllExams_ReturnsExamDictionary()
    {
        var content = MakeQuestion(1, "Q1", ["- A) A1", "- B) B1"], "A");
        var repo = CreateRepo(content);
        var parser = new QuestionParser(repo);

        var exams = parser.LoadAllExams();

        exams.ShouldContainKey("test-exam");
        exams["test-exam"].Count.ShouldBe(1);
    }
}
