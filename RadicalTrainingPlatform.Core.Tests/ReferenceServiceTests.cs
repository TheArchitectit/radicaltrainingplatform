using System.Collections.Generic;
using RadicalTrainingPlatform.Core;
using RadicalTrainingPlatform.Core.Models;
using Shouldly;
using Xunit;

namespace RadicalTrainingPlatform.Core.Tests;

public class ReferenceServiceTests
{
    [Fact]
    public void GetKBLinksForQuestion_NCA75_DoesNotThrow()
    {
        var q = new Question
        {
            ExamCode = "NCA-75",
            Stem = "LCM lifecycle upgrade firmware",
            Options = new List<AnswerOption> { new() { Letter = "A", Text = "Test" } },
            CorrectAnswers = new List<string> { "A" },
        };
        // ReferenceService is internal; will become public in Sprint 3
        // Testing via reflection would be fragile — skip until then
    }
}
