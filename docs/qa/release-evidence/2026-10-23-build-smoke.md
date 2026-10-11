# October 23 build — predeploy smoke log

Archived evidence for CI-03 / T-22 (Sprint 47). This is the smoke run of the
artifact cut for the **October 23 demo**, captured by
`tests/e2e/smoke-web.mjs` — the same step `pwa-deploy.yml` now runs before it
uploads the Pages artifact.

generated: 2026-10-11T17:42:19-05:00
head: 41ae052719169fe2bbae57e9ef5715ec295f2043
branch: feature/rtp-beginner-tracks
browser: /usr/bin/google-chrome-stable (headless=new, CDP)

The head above is the commit the log was captured from. It is a pre-freeze
draft head, not the frozen demo head; the deploy job re-runs this smoke on the
artifact it actually publishes, and that run's log is uploaded with the run as
the `web-smoke-log` artifact.

## What this smoke asserts

Against the served `RadicalTrainingPlatform.Web/` directory — the exact tree
the deploy job hands to `actions/upload-pages-artifact`, not a rebuild:

1. the router renders a view at the known route `#/pe/dashboard`;
2. that view has text content;
3. one meaningful interaction completes: enter demo mode → the demo-mode label
   appears → reset the station → the reseed verification report renders and
   states both a count and an outcome → leave demo mode → the label clears;
4. zero console errors, uncaught exceptions, or failed requests.

Step 1 is the R-01 shape. Before T-22, a bad relative import in
`pe-reports.js` broke the module graph, the PWA booted to a blank shell, and
nothing in the pipeline could tell; the smoke fails on that symptom, and
`tests/gates/run_smoke_fixtures.sh` reintroduces exactly that import to prove
it.

## Log

```
browser: /usr/bin/google-chrome-stable
serving /mnt/data/git/radicaltrainingplatform/RadicalTrainingPlatform.Web at http://127.0.0.1:39409
  PASS boots to /pe/dashboard with a rendered view
  PASS the rendered view has content
  PASS entering demo mode shows the demo-mode label
  PASS station reset renders its reseed verification outcome
  PASS leaving demo mode clears the label
  PASS zero console errors, uncaught exceptions, or failed requests

WEB SMOKE: PASS — the built artifact boots, renders, and completes a demo interaction with a clean console
```

## Not covered by this log

- **The GitHub runner's browser.** This capture used the workstation's
  `google-chrome-stable`. `ubuntu-latest` ships Chrome and the smoke searches
  `CHROME_BIN` then the usual paths, but no run on the fleet runner has been
  observed from here. The step fails closed if no browser is found, so a
  browser-less runner is a red deploy, never a silently skipped check.
- **The deploy job itself.** Only the three steps it invokes were run locally,
  against the repository tree; the workflow file's wiring is not executed
  locally. See the "Not verified" notes in `docs/sprints/SPRINT-47.md`.
- **Other routes and flows.** The smoke drives one known route and the demo
  flow. The full scenario catalog is covered by
  `tests/gates/web/scenario-sweep.mjs` and the TM-45 report
  (`2026-10-11-demo-sweep.md`), not here.
- **Deployed Pages behaviour.** This is a loopback static server, not
  `github.io`: service-worker scope, caching and the Pages base path are not
  exercised.
