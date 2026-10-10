namespace RadicalTrainingPlatform.Core.Models;

public enum QuestionType
{
    /// <summary>One or more correct options, graded by set equality.</summary>
    SingleChoice,
    /// <summary>Explicit multi-select, graded by set equality.</summary>
    MultiSelect,
    /// <summary>Steps in a required order, graded by exact sequence equality
    /// (R-03: the sorted-set comparison previously graded every permutation
    /// as correct). CorrectAnswers is the expected sequence in order.</summary>
    Ordered,
}
