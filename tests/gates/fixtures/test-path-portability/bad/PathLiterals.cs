// Fixture: a hardcoded POSIX path literal joined with '/'. The gate MUST fail here.
namespace RadicalTrainingPlatform.Core.Tests;

public class BadFixture
{
    private const string BuiltInRoot = "/repo";

    public string Expectation() => $"{BuiltInRoot}/content";
}
