# CI authentication — fleet GitHub App

**Status:** wired 2026-11-23. Credentials provisioned 2026-11-18; the consumer
workflow (`.github/workflows/app-auth-smoke.yml`) landed 2026-11-23.
**Fleet truth:** `TheArchitectit/infra-info` → `ci-fleet/github-app-api-access.md`
and `ci-fleet/secret-fleet-sweep-setup.md`. This page is the repo-side record;
where the two disagree, infra-info wins.

## What is set up

| Piece | Value | Where |
|---|---|---|
| App | Mission Control's CI/CD App, **app id `2550930`** (installation `101651861`, `TheArchitectit`, all repositories) | GitHub App settings |
| Repo variable | `DEVGATE_SWEEP_APP_ID` = `2550930` | repo Actions → Variables |
| Repo secret | `DEVGATE_SWEEP_APP_PRIVATE_KEY` (PEM) | repo Actions → Secrets |
| Consumer | `app-auth-smoke.yml` — daily 05:23 UTC + dispatch | `.github/workflows/` |

The values are identifiers and a sealed secret, never committed here. The private
key itself lives only on hosts that already held it: AI02's root-owned
`/etc/mc2/mc2.env` (`GITHUB_APP_PRIVATE_KEY_PATH`) and UCS03's rootless-user
control-plane file. It is never copied to a workstation.

## Why a smoke and not a build step

The build jobs make no GitHub API call. Minting an installation token in
`build.yml` would be ceremony, and ceremony in CI is how a step that proves
nothing becomes a step everyone assumes proves something. The smoke exists for
the one thing that cannot be seen otherwise: a secret that is **present but
stale** behaves exactly like a working one until something uses it.

Run it manually after any key rotation. The readback is `token_mode=app` in the
log, plus `repo=TheArchitectit/radicaltrainingplatform` from the API response.

## Rotation

1. New PEM on the App page; download it **on AI02**, never to a workstation.
2. Re-set the repo secret from that host, streaming the file (never `cat`,
   never paste): `gh secret set DEVGATE_SWEEP_APP_PRIVATE_KEY -R <repo> < <pem>`,
   or the sealed-box API path in infra-info.
3. Dispatch `app-auth-smoke.yml`; require `token_mode=app`.
4. Revoke the old key on the App page.

## Verified live

Dispatched 2026-11-23 through the App itself (from AI02, so the dispatch also
proves `actions: write`):

| | |
|---|---|
| Run | `45196437244` (`app-auth-smoke.yml`, `workflow_dispatch`, `main`) |
| Runner | `ucs03-rtp-spare1` |
| Result | **success** |
| Steps | “Mint an installation token from the fleet App” → success; “Prove the token reads this repository” → success |

That is the readback the fleet runbook asks for: the variable, the PEM in repo
secrets, and the App's repository access are all working together.

## The Claude Code MCP server uses the same App — there is no PAT

The `plugin:github:github` server ships one static header,
`Authorization: Bearer ${GITHUB_PERSONAL_ACCESS_TOKEN}`. That variable has
never been set here, and setting it would mean creating exactly the long-lived
PAT this repo is moving away from. A PAT is also the exhausted 5,000/hour
account budget; the App has its own.

An App installation token is accepted by the MCP endpoint as a bearer — but it
expires after an hour, so it cannot live in a static header.

**Solution: a loopback proxy that mints per request.** `deploy/rtp-mcp/proxy.py`
listens on `127.0.0.1:8791`, and for every request:

1. mints an installation token by piping `deploy/rtp-mcp/mint.py` over SSH to
   AI02 and running it under `sudo -n` there (the key never leaves the host),
2. caches it in memory for 50 minutes,
3. injects `Authorization: Bearer <token>` and streams the response back.

No PAT exists on this workstation at any point, and no key does either.

**Wiring.** `claude mcp add --transport http --scope user github
http://127.0.0.1:8791/mcp`, and the plugin's server is disabled (its header can
never resolve without a PAT). The canonical scripts and the unit live in
`deploy/rtp-mcp/`; `~/.config/rtp-mcp/{mint,proxy}.py` are symlinks to them so
there is one copy.

**Deliberate omission:** the proxy does not send `X-GitHub-Api-Version`. The
MCP endpoint rejects the REST API version header with `invalid apiVersion`.

**Verified 2026-11-23:** `initialize` returns 200 through the proxy with an
installation token, and `claude mcp list` reports
`github: http://127.0.0.1:8791/mcp (HTTP) - ✔ Connected`.

**Failure modes:** a 502 `token mint failed` means AI02 is unreachable or
`sudo -n` was denied. A connection that works and then starts failing tools
after roughly an hour means the proxy stopped refreshing — check
`systemctl --user status rtp-mcp-proxy` and restart it. The proxy does not log
request bodies; that is deliberate, they carry tool payloads.

## Failure modes this catches

- **Variable unset** — the mint step errors naming `DEVGATE_SWEEP_APP_ID`.
- **Secret stale or revoked** — the mint step fails; the smoke never reaches the
  read.
- **App loses repo access** — the read returns non-200 and the log names the
  repository and status.
- **A token that resolves to the wrong repo** (installation misconfiguration) —
  the assertion compares `full_name` rather than trusting a 200.
