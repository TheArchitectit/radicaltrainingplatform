namespace RadicalTrainingPlatform.Core;

/// <summary>
/// Abstraction for file system access so the core library
/// is not tied to any specific platform's file APIs.
/// </summary>
public interface IFileProvider
{
    string CombinePath(params string[] paths);
    bool Exists(string path);
    string[] GetFiles(string directory, string searchPattern);
    string[] GetDirectories(string directory);
    string ReadAllText(string path);
    /// <summary>
    /// Raw bytes. Integrity checks hash these, not the decoded text — a BOM or
    /// a CRLF ending must change the hash the way it changes the file.
    /// </summary>
    byte[] ReadAllBytes(string path);
    void WriteAllText(string path, string content);
    /// <summary>Atomically replace <paramref name="dest"/> with <paramref name="source"/> (same volume).</summary>
    void MoveFile(string source, string dest);
    void DeleteFile(string path);
    void CreateDirectory(string path);
    string GetCurrentDirectory();
    string GetExecutingAssemblyDirectory();
    string GetApplicationDataDirectory(string appName);
    string? GetParentDirectory(string path);
}

/// <summary>
/// Default implementation using standard .NET file APIs.
/// Works on all platforms with a standard file system.
/// </summary>
public class DefaultFileProvider : IFileProvider
{
    public string CombinePath(params string[] paths) => Path.Combine(paths);
    public bool Exists(string path) => File.Exists(path) || Directory.Exists(path);
    public string[] GetFiles(string directory, string searchPattern) => Directory.GetFiles(directory, searchPattern);
    public string[] GetDirectories(string directory) => Directory.GetDirectories(directory);
    public string ReadAllText(string path) => File.ReadAllText(path);
    public byte[] ReadAllBytes(string path) => File.ReadAllBytes(path);
    public void WriteAllText(string path, string content) => File.WriteAllText(path, content);
    public void MoveFile(string source, string dest) => File.Move(source, dest, overwrite: true);
    public void DeleteFile(string path) => File.Delete(path);
    public void CreateDirectory(string path) => Directory.CreateDirectory(path);
    public string GetCurrentDirectory() => Directory.GetCurrentDirectory();
    public string GetExecutingAssemblyDirectory() => AppContext.BaseDirectory;
    public string GetApplicationDataDirectory(string appName)
    {
        var baseDir = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
        var appDir = Path.Combine(baseDir, appName);
        Directory.CreateDirectory(appDir);
        return appDir;
    }
    public string? GetParentDirectory(string path) => Directory.GetParent(path)?.FullName;
}
