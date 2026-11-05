using RadicalTrainingPlatform.Core.Models;

namespace RadicalTrainingPlatform.Core.Services;

/// <summary>
/// REQ-MAN-08: which banks of an exam may enter a session pool.
///
/// Before this existed, every question-loading path walked
/// content/exams/&lt;examId&gt;/questions/*.md and took whatever it found. The
/// web build had a release list (generate-study-content.py's RELEASED_BANKS),
/// so the PWA shipped 419 items while the desktop, walking the same folder,
/// offered all 1,199 — including 780 draft items no person had read. Two
/// surfaces, two corpora, and nothing said which one was intended.
///
/// The manifest now answers it. `releasedBanks` in exam.json is the list the
/// desktop reads and the generator is written from, so the two cannot drift:
/// there is one answer, in content, and a gate checks it.
///
/// The one subtlety is a missing list. A manifest without `releasedBanks`
/// predates the field, and treating it as "nothing released" would empty
/// every exam written before this change. It means "no decision recorded",
/// and the caller falls back to the old behaviour — every bank — which is
/// what every such manifest already did. An explicit empty list is a
/// decision, and it releases nothing.
/// </summary>
public static class BankReleasePolicy
{
    /// <summary>
    /// True when <paramref name="bankFile"/> may enter a session pool for
    /// <paramref name="manifest"/>.
    /// </summary>
    public static bool IsReleased(ExamManifest manifest, string bankFile)
    {
        ArgumentNullException.ThrowIfNull(manifest);
        if (manifest.ReleasedBanks is null)
            return true;
        var name = Path.GetFileName(bankFile);
        return manifest.ReleasedBanks.Any(b =>
            string.Equals(Path.GetFileName(b), name, StringComparison.OrdinalIgnoreCase));
    }

    /// <summary>
    /// True when the manifest recorded a release decision at all. Callers use
    /// this to tell "nothing is released" from "nobody has decided".
    /// </summary>
    public static bool HasDecision(ExamManifest manifest) =>
        manifest.ReleasedBanks is not null;

    /// <summary>
    /// Banks the manifest lists that do not exist under <paramref name="bankFiles"/>.
    /// A release list naming a typo would silently release nothing; the
    /// catalog and the gates both report it rather than treating it as empty.
    /// </summary>
    public static IReadOnlyList<string> MissingListedBanks(
        ExamManifest manifest, IEnumerable<string> bankFiles)
    {
        ArgumentNullException.ThrowIfNull(manifest);
        if (manifest.ReleasedBanks is null)
            return Array.Empty<string>();
        var present = bankFiles
            .Select(Path.GetFileName)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);
        return manifest.ReleasedBanks
            .Where(b => !present.Contains(Path.GetFileName(b)))
            .ToList();
    }
}
