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

## Failure modes this catches

- **Variable unset** — the mint step errors naming `DEVGATE_SWEEP_APP_ID`.
- **Secret stale or revoked** — the mint step fails; the smoke never reaches the
  read.
- **App loses repo access** — the read returns non-200 and the log names the
  repository and status.
- **A token that resolves to the wrong repo** (installation misconfiguration) —
  the assertion compares `full_name` rather than trusting a 200.
