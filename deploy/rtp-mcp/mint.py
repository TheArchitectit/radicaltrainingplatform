#!/usr/bin/env python3
"""Mint a short-lived GitHub App installation token on AI02.

The private key never leaves AI02: this script is piped over ssh and run with
sudo there. Only the token is printed, and the caller keeps it in memory.
"""
import base64
import json
import subprocess
import time
import urllib.request

ENV = "/etc/mc2/mc2.env"
API = "https://api.github.com"


def b64(data):
    return base64.urlsafe_b64encode(data).rstrip(b"=")


def main():
    cfg = {}
    for line in open(ENV, encoding="utf-8"):
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            cfg[k.strip()] = v.strip().strip('"').strip("'")

    now = int(time.time())
    head = b64(b'{"alg":"RS256","typ":"JWT"}')
    pay = b64(json.dumps({"iat": now - 60, "exp": now + 540,
                          "iss": cfg["GITHUB_APP_ID"]},
                         separators=(",", ":")).encode())
    signature = subprocess.run(
        ["openssl", "dgst", "-sha256", "-sign", cfg["GITHUB_APP_PRIVATE_KEY_PATH"]],
        input=head + b"." + pay, capture_output=True, check=True).stdout
    jwt = (head + b"." + pay + b"." + b64(signature)).decode()

    def get(url, method="GET"):
        req = urllib.request.Request(url, method=method, headers={
            "Authorization": f"Bearer {jwt}",
            "Accept": "application/vnd.github+json",
        })
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read())

    installations = get(f"{API}/app/installations")
    installation = next(i["id"] for i in installations
                        if i.get("account", {}).get("login") == "TheArchitectit")
    token = get(f"{API}/app/installations/{installation}/access_tokens",
                method="POST")["token"]
    print(token)


if __name__ == "__main__":
    main()
