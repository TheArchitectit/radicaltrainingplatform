using System.Net;
using System.Net.Sockets;

namespace RadicalTrainingPlatform.Avalonia.LabSimulator;

/// <summary>
/// Minimal loopback HTTP server for the Lab Simulator web app. Serves
/// the LabSimulator/Web folder over a real http:// origin so:
///  - ES module imports ("type=module") work without file:// CORS
///    restrictions.
///  - The service worker can register.
///  - BridgeClient sees a real origin and doesn't fall into
///    standalone mode.
///
/// The server injects nothing; <see cref="BridgeClient.js"/> relies
/// on the adapter's native <c>window.chrome.webview</c> transport.
/// </summary>
internal sealed class SimulatorHttpServer : IDisposable
{
    private readonly HttpListener _listener;
    private readonly string _rootPath;
    private readonly CancellationTokenSource _cts = new();
    private readonly Task _serveTask;
    private bool _disposed;

    public int Port { get; private set; }
    public string BaseUrl => $"http://127.0.0.1:{Port}/";

    public SimulatorHttpServer(string rootPath)
    {
        _rootPath = Path.GetFullPath(rootPath);
        if (!Directory.Exists(_rootPath))
            throw new DirectoryNotFoundException(_rootPath);

        // Reserve a free port with TcpListener first (HttpListener.LocalEndpoint
        // is not available on every .NET runtime), then hand it to HttpListener.
        Port = ReserveFreePort();
        _listener = new HttpListener();
        _listener.Prefixes.Add($"http://127.0.0.1:{Port}/");
        _serveTask = Task.Run(ServeLoop);
    }

    private static int ReserveFreePort()
    {
        using var probe = new TcpListener(IPAddress.Loopback, 0);
        probe.Start();
        var port = ((IPEndPoint)probe.LocalEndpoint).Port;
        probe.Stop();
        return port;
    }

    private async Task ServeLoop()
    {
        try
        {
            _listener.Start();
            while (!_cts.Token.IsCancellationRequested)
            {
                var ctx = await _listener.GetContextAsync().WaitAsync(_cts.Token);
                if (_cts.Token.IsCancellationRequested) break;
                _ = ProcessRequestAsync(ctx); // fire-and-forget per request
            }
        }
        catch (OperationCanceledException) { /* graceful shutdown */ }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"[SimulatorHttpServer] {ex.Message}");
        }
    }

    private async Task ProcessRequestAsync(HttpListenerContext ctx)
    {
        try
        {
            var rawPath = ctx.Request.Url?.AbsolutePath ?? "/";
            // Path-traversal defense
            if (rawPath.Contains(".."))
            {
                ctx.Response.StatusCode = 403;
                ctx.Response.OutputStream.Close();
                return;
            }

            var filePath = Path.Combine(_rootPath, rawPath.TrimStart('/'));
            if (Directory.Exists(filePath))
            {
                // SPA fallback: serve index.html for directory requests
                filePath = Path.Combine(filePath, "index.html");
            }

            if (!File.Exists(filePath))
            {
                // Client-side routing: serve index.html for unknown paths
                // so the PWA router can handle them.
                filePath = Path.Combine(_rootPath, "index.html");
            }

            // Only serve files that are actually under the root.
            var canonicalFile = Path.GetFullPath(filePath);
            var canonicalRoot = Path.GetFullPath(_rootPath);
            if (!canonicalFile.StartsWith(canonicalRoot + Path.DirectorySeparatorChar)
                && canonicalFile != canonicalRoot)
            {
                ctx.Response.StatusCode = 403;
                ctx.Response.OutputStream.Close();
                return;
            }

            var mime = GetMimeType(Path.GetExtension(filePath).ToLowerInvariant());
            ctx.Response.ContentType = mime;

            await using var fs = File.OpenRead(filePath);
            await fs.CopyToAsync(ctx.Response.OutputStream, 81920, _cts.Token);
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"[SimulatorHttpServer] {ex.Message}");
            try { ctx.Response.StatusCode = 500; } catch { }
        }
        finally
        {
            try { ctx.Response.OutputStream.Close(); } catch { }
        }
    }

    private static string GetMimeType(string ext) => ext switch
    {
        ".html" => "text/html",
        ".htm" => "text/html",
        ".css" => "text/css",
        ".js" => "text/javascript",
        ".mjs" => "text/javascript",
        ".json" => "application/json",
        ".png" => "image/png",
        ".jpg" => "image/jpeg",
        ".jpeg" => "image/jpeg",
        ".svg" => "image/svg+xml",
        ".ico" => "image/x-icon",
        ".woff" => "font/woff",
        ".woff2" => "font/woff2",
        ".ttf" => "font/ttf",
        ".eot" => "application/vnd.ms-fontobject",
        ".manifest" => "text/cache-manifest",
        ".txt" => "text/plain",
        _ => "application/octet-stream",
    };

    public void Dispose()
    {
        if (_disposed) return;
        _disposed = true;
        _cts.Cancel();
        try { _listener.Stop(); } catch { }
        try { _serveTask.Wait(TimeSpan.FromSeconds(2)); } catch { }
        _cts.Dispose();
        _listener.Close();
    }
}
