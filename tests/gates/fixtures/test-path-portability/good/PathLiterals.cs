// Fixture: paths built through the helper. The gate MUST pass here.
namespace RadicalTrainingPlatform.Core.Tests;

public class GoodFixture
{
    private static readonly string BuiltInRoot = TestPaths.Root("repo");

    public string Expectation() => TestPaths.Combine(BuiltInRoot, "content");
}
