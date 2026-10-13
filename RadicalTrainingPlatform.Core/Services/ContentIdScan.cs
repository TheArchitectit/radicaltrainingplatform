using System.Text.Json;

namespace RadicalTrainingPlatform.Core.Services;

/// <summary>
/// Reads the identity field out of every manifest under a content
/// subdirectory. Used by plugin validation (to detect a pack claiming an ID
/// another pack already owns) and by discovery (to accumulate the IDs each
/// accepted pack claims).
///
/// Deliberately tolerant of malformed JSON: a manifest that cannot be parsed
/// claims nothing, and the manifest loader reports the parse failure with its
/// own path when it reads the tree. Reporting it here too would name the same
/// defect twice under two different messages.
/// </summary>
internal static class ContentIdScan
{
    public static List<string> ReadIds(IFileProvider files, string directory, string fileName, string idField)
    {
        var ids = new List<string>();
        if (!files.Exists(directory)) return ids;

        foreach (var dir in files.GetDirectories(directory))
        {
            var manifestPath = files.CombinePath(dir, fileName);
            if (!files.Exists(manifestPath)) continue;
            try
            {
                using var doc = JsonDocument.Parse(files.ReadAllText(manifestPath));
                if (doc.RootElement.TryGetProperty(idField, out var id) &&
                    id.ValueKind == JsonValueKind.String)
                {
                    var value = id.GetString();
                    if (!string.IsNullOrWhiteSpace(value)) ids.Add(value!);
                }
            }
            catch (JsonException)
            {
                // Reported by the manifest loader.
            }
        }
        return ids;
    }
}
