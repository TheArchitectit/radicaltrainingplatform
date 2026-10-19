# Sprints 41-42: Local Security Baseline (rescoped from "Security & Compliance")

**Phase:** Enterprise  
**Duration:** Weeks 81-84 (4 weeks)  
**Goal (as written in June 2026):** Harden security posture with SBOM, SAST, pen-test,
and SOC 2 groundwork.  
**Goal (as executed):** Make the local client enforce the security properties it can
actually enforce — a restrictive policy in the browser, no inline script, loopback-only
network, a bill of materials that matches the tree, and no path that publishes it.

**Status:** 🟢 Landed at `1b4495d` — CSP + inline-script removal, CycloneDX SBOM,
security-baseline gate with fixtures, CodeQL, and the Pages deploy replaced by a
gate-only browser workflow. Freeze chain **61/61** (grew 59 → 61).

> **This sprint was rescoped by the owner on 2026-10-18.** The instruction was
> *"Rescope all three"*. The constraints stated the same day were: *"this is supposed to
> run as a local client on your device not need a hosting solution"* and *"the idea of this
> is they can just check the project out from github."*
>
> Most of the June plan assumes an enterprise buyer and an organisation operating a
> service: a pen-test of an API, SOC 2 policies, encryption of a database at rest. None of
> those objects exists here. What does exist is a browser-enforced policy, a dependency
> graph, a public repository, and — until this pair — a workflow that would have published
> the app to the world.

---

## Why the security work changes shape without a server

A hosted product gets its security posture from its host: headers from the web server,
accounts and audit logs from the API, encryption from the database. This product has none
of those layers. It is a static tree an individual checks out and serves to themselves.

That removes half the June deliverables outright and leaves four things that are real for
a local client:

| Concern | What it means here | June deliverable |
|---|---|---|
| What can run in the page? | The CSP in `index.html` is the only policy enforced. No host sets headers. | S41-06 |
| What does the build pull in? | The `PackageReference` graph, published as an SBOM. | S41-01 |
| Is the source analysed? | CodeQL, on a public repository where it is free. | S41-02 |
| Does this repo publish anything? | It must not. Delivery is a clone. | — (new; replaces the deploy path) |

The table is the whole sprint. Everything below records what was cut, what was built,
and what remains unproven.

---

## Cut register

Per SPEC-11 11.1, scope is cut **visibly**.

| ID | As written | Disposition |
|---|---|---|
| S41-01 | Add SBOM generation (CycloneDX) to CI | **Kept and executed** — deterministic generator + committed SBOM, held by a gate |
| S41-02 | Integrate CodeQL SAST in CI | **Kept and executed** — `.github/workflows/codeql.yml`, csharp + javascript-typescript |
| S41-03 | Add OWASP dependency check | **Cut** — no package manifest to scan in the web runtime (no `package.json`); the vuln gate already audits the NuGet graph on every build |
| S41-04 | Conduct internal pen-test (OWASP Top 10) | **Cut — not performed.** Nothing here is a pen-test, and calling one of these checks a pen-test would be a false claim |
| S41-05 | Remediate pen-test findings | **Cut** — depends on S41-04, which did not happen |
| S41-06 | Add security headers and CSP | **Kept, rescoped** — a meta CSP, because a local static tree has no server to set headers |
| S41-07 | Implement audit logging (user actions API) | **Cut** — there is no API and there are no users; a local client logs to its own console |
| S41-08 | Write SOC 2 Type I policies and procedures | **Cut — owner-deferred.** SOC 2 attests that an organisation operates controls. The delivery model is an individual cloning a repository |
| S41-09 | Add data encryption at rest (API database) | **Cut** — there is no database. Progress lives in the browser's own storage, under the browser's own protection |

Deferred is not rejected. If the owner later operates a hosted service, S41-07 through
S41-09 become real work again, and this document is the record of why they did not happen
now.

---

## What was actually built

### 1. A policy the browser enforces, with no escape hatches

`index.html` now carries:

```
default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
img-src 'self' data:; font-src 'self';
connect-src 'self' http://127.0.0.1:* http://localhost:*;
worker-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'
```

Decisions worth stating:

- **`script-src 'self'` carries no `'unsafe-inline'`.** That only works because the
  inline service-worker registration moved to `js/boot-sw.js`, and because the four
  inline handlers in the lab views were replaced:
  - `pc-alerts.js` (×2) and `pc-settings.js` (×1) now declare
    `data-simulated-alert="…"` and wire a click listener after render;
  - `ci-networking.js` used `onclick="location.hash='#/pc/nc2-deploy'"`; it is now a
    real `<a href="#/pc/nc2-deploy">`, which is also the correct element for a
    navigation.
- **`style-src` keeps `'unsafe-inline'`.** The views ship `style=` attributes
  throughout. Removing that allowance would be a much larger refactor; the policy
  states the trade-off rather than hiding it.
- **`connect-src` admits loopback only.** The tutor gateway binds `127.0.0.1`. A
  policy that admitted a remote host would turn the local client into a client of
  something else.
- **`frame-ancestors` is omitted** because browsers ignore it in a `meta` policy. It is
  not silently missing; it cannot be expressed here.

`sw.js` precaches `js/boot-sw.js` and the cache name is bumped to `labsim-v6`, so an
installed copy picks both up rather than serving the old shell.

### 2. A bill of materials that matches the tree

`scripts/generate-sbom.py` walks every `*.csproj`, emits a CycloneDX 1.5 document with
one component per project and per package, deduplicates packages that several projects
reference, and marks test-only packages `excluded`. It carries no timestamp, so its
output is byte-stable. `docs/security/sbom.cdx.json` is committed.

The web runtime contributes no third-party components: there is no `package.json` and
the modules import only the repository's own tree. The SBOM records that as a property
rather than leaving the absence unstated.

### 3. The gate, and its fixtures

`scripts/check-security-baseline.py` checks:

1. the shell has a CSP meta tag;
2. `default-src 'self'`, `object-src 'none'`, `base-uri 'none'`;
3. `script-src` admits neither `'unsafe-inline'` nor `'unsafe-eval'` (nor `*`, `data:`
   or a bare scheme);
4. `connect-src` is `'self'` plus loopback origins only;
5. no inline event handler in any Web `.html` or `.js` file;
6. no inline `<script>` block;
7. the committed SBOM is exactly the component graph the csproj files describe
   (including scope), with unique `bom-ref`s;
8. no workflow uploads or deploys a Pages artifact;
9. a CodeQL workflow exists and analyses both shipping languages.

`tests/gates/run_security_baseline_fixtures.sh` proves each direction: the real tree and
a clean sandbox pass; ten seeded defects each fail and name the defect. The checker's own
`--self-test` additionally mutates a miniature tree 14 ways, including the clean and
shipped cases. Per SPEC-16, a gate with no failing fixture would itself be the defect.

### 4. CodeQL

`.github/workflows/codeql.yml` analyses `csharp` and `javascript-typescript` with
`build-mode: none`. The `none` mode is deliberate: the solution contains
`RadicalTrainingPlatform.Legacy.WinForms`, a `net10.0-windows` project that cannot build
on `ubuntu-latest`, so C# autobuild would fail on every run for a reason unrelated to the
change under test. The repository is public, so hosting is free.

### 5. The publish path is gone

`pwa-deploy.yml` uploaded `RadicalTrainingPlatform.Web/` as a Pages artifact and deployed
it on every push that touched the web tree. GitHub Pages is **not enabled** on this
repository (the API returns 404 for `/pages`) and the workflow's only recorded run failed
10 seconds in, on 2026-06-11 — so nothing was ever published. It was nevertheless a live
public-distribution path.

It is replaced by `.github/workflows/web-browser.yml`, which keeps what was earning its
keep — import graph, browser smoke, NCA lab run, accessibility audit and fixtures,
content bundle, secret scan, archived logs — and drops the upload, the deploy, and the
`pages: write` / `id-token: write` permissions. The failure modes those legs catch are
unchanged; only the publication is gone.

---

## Execution record

### Verification

- `python3 scripts/check-security-baseline.py` — PASS.
- `python3 scripts/check-security-baseline.py --self-test` — PASS, 14 seeded defects.
- `bash tests/gates/run_security_baseline_fixtures.sh` — PASS, 10 seeded defects plus
  the real tree and a clean copy.
- `node tests/e2e/smoke-web.mjs` — PASS with the CSP active: the shell boots, a demo
  interaction completes, and the console is clean (zero errors, failed requests or
  uncaught exceptions).
- `bash tests/gates/run_web_fixtures.sh` — PASS, all fixtures.
- `python3 scripts/check-selfhost.py` and its fixtures — PASS; `boot-sw.js` is
  precached, so the offline graph is complete.
- `python3 scripts/check-traceability.py`, `check-imports.py`, `check-content-bundle.py`,
  `check-artifact-secrets.py`, `check-brand.py` — PASS.
- Freeze chain **61/61** at `1b4495d`, `--expect-sha` matching. The chain grew 59 → 61
  for the gate and its fixture runner.

### What was not touched

No content file, manifest, provenance record, lesson or item. No exam or track. The
desktop and WinForms projects are unchanged. The RedEye posture and `draft-preview`
labels are unchanged.

Two live documents were corrected to name the current workflow rather than the deleted
one: `docs/ACCESSIBILITY.md` and `docs/sprints/SPRINT-35-36.md`. Dated audit and QA
records still describe `pwa-deploy.yml`, because that is what was true on the date they
record; they were not rewritten.

### What this work did NOT establish

- **No pen-test.** S41-04 and S41-05 were not performed. The gate checks policy text and
  source patterns; it does not attempt an attack, and this pair does not claim it did.
- **No SOC 2, no audit log, no encryption feature.** There is nothing to encrypt at rest
  on a server that does not exist.
- **`style-src 'unsafe-inline'` remains.** A style-injection risk is still accepted;
  only script injection is closed.
- **The CSP is meta, not a header.** A host that can set headers would be stronger. The
  delivery model has no host.
- **CodeQL has not run.** The workflow is committed and the gate checks it exists and
  names both languages; no CodeQL analysis has been observed from this host, and no
  results have been reviewed.
- **The browser smoke exercises one route and one interaction.** The CSP's effect on
  routes it does not visit — the tutor panel, the lab views whose handlers changed — is
  proven by source inspection and the source gates, not by a browser here.
- **SBOM completeness is csproj completeness.** The generator reads `PackageReference`
  entries; transitive NuGet resolution and native components are not modelled.
- **No public distribution occurred, and none can now.** Pages was never enabled; the
  workflow that could have published has been removed. The repository itself remains
  public, which is the delivery model.

---

## Original June 2026 plan (preserved verbatim, not executed)

### Summary

Enterprise readiness requires demonstrable security. This sprint adds all security
artifacts and processes needed for enterprise sales and SOC 2 preparation.

### Key Deliverables

| ID | Deliverable | Points |
|---|---|---|
| S41-01 | Add SBOM generation (CycloneDX) to CI | 2 |
| S41-02 | Integrate CodeQL SAST in CI | 2 |
| S41-03 | Add OWASP dependency check | 2 |
| S41-04 | Conduct internal pen-test (OWASP Top 10) | 3 |
| S41-05 | Remediate pen-test findings | 3 |
| S41-06 | Add security headers and CSP | 2 |
| S41-07 | Implement audit logging (user actions API) | 3 |
| S41-08 | Write SOC 2 Type I policies and procedures | 3 |
| S41-09 | Add data encryption at rest (API database) | 2 |

**Total:** ~22 points over 2 sprints

### Key Decisions

- **SBOM:** CycloneDX JSON format; attached to every release
- **SAST:** GitHub CodeQL for C#; manual review for high-severity findings
- **Pen-test:** Internal red team or hired firm; scope includes API and desktop app
- **SOC 2:** Type I assessment (policies and procedures); Type II (continuous monitoring)
  in Year 2
- **Encryption:** AES-256 for database at rest; TLS 1.3 for transit

### Dependencies

- S5-01, S5-02 (Dependabot and vulnerability scanning from Phase 1)
- S29-01 through S29-10 (API backend to secure)
- S31-01 through S31-09 (auth system to pen-test)

### Risks

| Risk | Mitigation |
|---|---|
| Pen-test reveals architectural security flaws | Engage pen-test early in window; timebox remediation |
| SOC 2 compliance is expensive and time-consuming | Use vetted tools (Vanta, Drata); focus on Type I first |
| SBOM generation is noisy with false positives | Manual review of high-severity items; automate low-severity |

**Note on the dependencies:** both named systems — the API backend (Sprints 29-30) and
the authentication system (Sprints 31-32) — were cut by owner decision before this pair
began. The June plan's scope is downstream of two things that do not exist.
