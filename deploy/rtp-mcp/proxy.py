#!/usr/bin/env python3
"""Loopback proxy that adds a fresh GitHub App installation token per request.

Why this exists: the GitHub MCP endpoint accepts an App installation token as
its bearer (verified 2026-11-23), but installation tokens expire after an hour
and an MCP server config holds one static header. This proxy mints a token on
AI02 — where the App private key lives and nowhere else — caches it in memory
for 50 minutes, and injects it into every proxied request. No PAT exists on
this host at any point.

Listens on 127.0.0.1 only.

Deliberately does NOT send X-GitHub-Api-Version: the MCP endpoint answers
"invalid apiVersion" to the REST API version header (measured).
"""
import http.server
import pathlib
import socketserver
import subprocess
import threading
import time
import urllib.error
import urllib.request

UPSTREAM = "https://api.githubcopilot.com/mcp/"
LISTEN = ("127.0.0.1", 8791)
MINT = pathlib.Path.home() / ".config/rtp-mcp/mint.py"
REFRESH_AFTER = 50 * 60  # installation tokens live 60 minutes

_lock = threading.Lock()
_token = {"value": None, "minted": 0.0}


def token():
    with _lock:
        if _token["value"] and time.time() - _token["minted"] < REFRESH_AFTER:
            return _token["value"]
        proc = subprocess.run(
            ["ssh", "-o", "BatchMode=yes", "-o", "ConnectTimeout=10",
             "user001@ai02", "sudo -n python3 -"],
            input=MINT.read_bytes(), capture_output=True, check=True, timeout=60)
        value = proc.stdout.decode().strip()
        if not value:
            raise RuntimeError("token mint returned nothing")
        _token.update(value=value, minted=time.time())
        return value


class Handler(http.server.BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, *_args):
        pass  # no request logging: bodies carry tool payloads

    def _proxy(self):
        length = int(self.headers.get("Content-Length") or 0)
        body = self.rfile.read(length) if length else None
        headers = {}
        for key, value in self.headers.items():
            if key.lower() in ("host", "authorization", "content-length",
                               "connection"):
                continue
            headers[key] = value
        try:
            headers["Authorization"] = f"Bearer {token()}"
        except Exception as exc:  # noqa: BLE001 — fail closed, name the reason
            self.send_error(502, f"token mint failed: {exc}")
            return
        req = urllib.request.Request(UPSTREAM, data=body, headers=headers,
                                     method=self.command)
        try:
            resp = urllib.request.urlopen(req, timeout=300)
        except urllib.error.HTTPError as err:
            resp = err
        except Exception as exc:  # noqa: BLE001
            self.send_error(502, f"upstream failed: {exc}")
            return
        self.send_response(resp.status if hasattr(resp, "status") else resp.code)
        for key, value in resp.headers.items():
            if key.lower() in ("transfer-encoding", "connection",
                               "content-length", "content-encoding"):
                continue
            self.send_header(key, value)
        self.send_header("Transfer-Encoding", "chunked")
        self.end_headers()
        try:
            while True:
                chunk = resp.read1(8192) if hasattr(resp, "read1") else resp.read(8192)
                if not chunk:
                    break
                self.wfile.write(b"%X\r\n%s\r\n" % (len(chunk), chunk))
                self.wfile.flush()
            self.wfile.write(b"0\r\n\r\n")
        except (BrokenPipeError, ConnectionResetError):
            pass
        finally:
            resp.close()

    do_POST = _proxy
    do_GET = _proxy
    do_DELETE = _proxy


class Server(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


if __name__ == "__main__":
    Server(LISTEN, Handler).serve_forever()
