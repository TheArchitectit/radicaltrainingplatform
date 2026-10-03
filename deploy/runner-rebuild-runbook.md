# Fleet Runner Rebuild Runbook — devgate-runner-rtp (ucs03)

Companion to `devgate-runner-rtp.container` (the deployed-unit RECORD). Fleet-wide
truth lives in the infra-info repo (`runner-install-runbook.md`); this entry covers
**rebuilding this repo's runner from scratch** — the scenario the 2026-10-02 audit
digest found undocumented.

## When to use
- ucs03 host rebuild/migration, or a corrupted runner volume.
- Pinned evaluator image changed upstream and the local cache is poisoned.
- Registration is dead and re-registration is cheaper than debugging (digest
  `add-runner-image-cycling` Sprint 7 evidence tasks expect this path).

## 1. Verify state before destroying anything
```
ssh ucs03
systemctl --user status devgate-runner-rtp
podman ps -a --filter name=devgate-runner
gh api repos/TheArchitectit/radicaltrainingplatform/actions/runners \
  --jq '.runners[] | {name, status, labels: .labels[].name}'
```

## 2. Rebuild (on ucs03, as the unit's user)
1. Stop: `systemctl --user stop devgate-runner-rtp`
2. Mint a fresh registration token **from another box** (never on the runner):
   `gh api -X POST repos/TheArchitectit/radicaltrainingplatform/actions/runners/registration-token --jq .token`
3. Drop the token in `~/.config/containers/systemd/devgate-runner-rtp.container.d/10-token.conf`
   (mode 600, one line `RUNNER_TOKEN=...`).
4. Daemon reload: `systemctl --user daemon-reload`
5. Start: `systemctl --user start devgate-runner-rtp`
   The unit pulls the pinned image by digest (see `Image=` in the quadlet —
   never re-pin casually; advancing the pin is a deliberate `add-runner-image-cycling` act).
6. First-register consumes the token; the durable registration means later
   restarts need none.

## 3. Verify
- `podman logs devgate-runner-rtp | grep -i "connected\|listening"`
- Runner shows `status: online` in the gh API call above, labels include `devgate-rtp`.
- Push a trivial commit or re-run the last workflow; **both legs** must execute
  (build-linux lands on ucs03-rtp; build-winforms is hosted — if only the Linux
  leg queues, the runner is down, not the workflow).

## 4. If rebuilding from zero (volume destroyed)
`podman volume rm devgate-runner-rtp-work` after step 1, then steps 2–6. The work
volume is cache only — no persistent state lives there; exams/sessions are
application-side.

## Do NOT
- Fork `dg-entrypoint.sh` — all runners on ucs03 share the bind-mounted one
  (see `.devgate/templates/runner/add-a-runner.md`).
- Apply the quadlet from this repo; the host is the source of truth, this
  record must be re-pulled after any host-side change.
