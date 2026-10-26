# Gap analysis — local self-study product, 2026-10-20

**Measured head:** `68db091` on `feature/rtp-beginner-tracks`.
**Freeze chain:** 64/64 at `da77118` (the three docs-only commits after it do not
change gate results).
**Scope:** the full product against the owner's definition below — not the Oct 10
demo-deadline scope, which this supersedes.

This page records what the repository does today, where it falls short of the product
the owner described, and what content to add, in what order, with a target per
blueprint objective.

**Evidence tags.** `[V]` verified in this session by reading or running the command
named; `[A]` taken from an in-tree audit or evidence page and not re-run; `[P]`
proposal, not yet built.

**Severity.** S1 blocks a student from using the product as defined; S2 materially
degrades it or misstates it to a reader; S3 debt, fix when next touched; S4 record
only.

---

## 1. Product definition used

Stated by the owner on 2026-10-20, and the yardstick for every row below:

- **Local-first.** A client on the student's own device. No server, no accounts, no
  sync, no telemetry, no hosting.
- **Linux and Windows.** macOS is out of scope unless the owner says otherwise.
- **Distribution.** A git checkout is the supported path. An npm package is an option
  to evaluate (§4), not a commitment.
- **Surfaces.** The study loop (tracks, lessons, practice, flashcards, search), the
  simulation modes, and the tutor with its recorded-example fallback.
- **Out of scope.** Teacher, class and cohort features; LMS/SCORM/LTI; accounts;
  cloud; public distribution of content.

The code already enforces most of this rather than merely intending it: `fetch`,
`XMLHttpRequest`, `WebSocket`, `EventSource`, `sendBeacon` and remote dynamic imports
are statically banned from `RadicalTrainingPlatform.Web/js/` and a runtime network spy
asserts zero outbound calls during a full scenario walkthrough
(`tests/gates/web/demo-independence.mjs:41-129`) `[V]`. The same gate asserts no
identity-collecting form field exists anywhere (`:131-153`) `[V]`.

---

## 2. Current state

### 2.1 What a student does today

Two documented paths, both "build it yourself", both truthful about there being no
download (`README.md:74-75`, `docs/SELF-HOST.md:151-154`) `[V]`:

| Path | Command | Prerequisite stated |
|---|---|---|
| Desktop app | `dotnet build RadicalTrainingPlatform.sln` then `dotnet run --project RadicalTrainingPlatform.Desktop` (`README.md:81-84`) | .NET 10 SDK (`:77`) |
| PWA | `python3 -m http.server -d RadicalTrainingPlatform.Web 8080` (`README.md:89-91`, `SELF-HOST.md:40,49,178`) | none stated |

- **The desktop command fails on Linux as written.** `dotnet restore
  RadicalTrainingPlatform.sln` exits with `error NETSDK1100: To build a project
  targeting Windows on this operating system` — `Legacy.WinForms` is in the solution
  `[V]`. The README's comment on that line ("Core + Desktop + Desktop.Tests") is also
  wrong: the solution has five projects. CI does not hit this because the Linux leg
  builds the three Linux-legitimate projects individually
  (`.github/workflows/build.yml:250-256`) `[V]`.
- **Windows has no packaging at all.** `packaging/` holds Linux (AppImage, Flatpak) and
  macOS scripts; Windows has no script, no installer, no `.exe` publish recipe, and no
  Windows-specific line in either guide `[V]`. The PWA path works on Windows but
  assumes Python 3, which neither guide lists as a prerequisite `[V]`.
- **Nothing has ever been released.** Zero tags, zero GitHub releases, zero packaged
  artifacts `[V]`. `scripts/check-release-links.py` enforces that no document claims
  otherwise, and it passes `[V]`.

### 2.2 Surfaces and platform parity

The PWA is the complete product. The Avalonia desktop app is a different, smaller
product wearing the same name.

| Capability | PWA | Avalonia desktop |
|---|---|---|
| Track picker, lesson reader, practice, flashcards, search, tutor | yes (8 views) | **absent** |
| Scenario catalogue | 50 scenarios, 89 objectives | **embedded legacy copy: 44 scenarios, 78 objectives** |
| Ticket lab / NCA lab | yes | **absent** |
| Progress store, export/import | yes | **absent** |
| Quiz, blueprint, stats, study-guide PDF | — | yes |
| Lab simulator | in-app routes | CefGlue browser over the embedded copy |

The desktop project compiles the legacy simulator tree as content:
`<Content Include="..\Legacy.WinForms\LabSimulator\Web\**\*" LinkBase="LabSimulator\Web">`
(`RadicalTrainingPlatform.Desktop.csproj:42`), and `LabSimulatorView.axaml.cs:238`
loads it from `AppContext.BaseDirectory` `[V]`. `diff -rq` between the two web trees
reports 80 differing or missing paths `[V]`; the legacy copy is missing
`study-content.js`, `ProgressStore.js`, `practice.js`, `flashcards.js`,
`lesson-reader.js`, `track-picker.js`, `ticket-lab.js`, `nca-lab.js` and the rest of
the study loop `[V]`.

Both surfaces do run on Linux and Windows in the sense of "the binaries build and
launch": desktop builds are in the freeze chain, the Windows CI leg builds the whole
solution, and a headless Avalonia smoke suite runs (`run_freeze_chain.sh` gates 50-54)
`[V]`. What is not equal is the content each surface shows.

### 2.3 Content

Every count below is reproducible with the commands in §7.

**Exams, tracks, released items** — `python3 scripts/check-readme-counts.py`:

| Exam | Objectives | Released items | Sections | Released lessons |
|---|---:|---:|---:|---:|
| AWS-SAA | 14 | 50 | 4 | 14 |
| AZ-104 | 15 | 50 | 5 | 15 |
| NCA-75 | 14 | 40 | 4 | 14 |
| COMPTIA-A-1201 | 27 | 16 | 5 | 1 of 5 modules |
| COMPTIA-A-1202 | 36 | 8 | 4 | 1 of 4 modules |
| COMPTIA-NET-009 | 25 | 25 | 5 | 2 of 5 modules |
| **Total** | **131** | **189** | 27 | 47 of 57 slots |

There are 5 tracks. The compiled bundle reports coverage of **55/131 objectives
(42%)**: `track-aws` 100%, `track-azure` 100%, `track-nca` 100%, `track-netplus` 24%
(6/25), `track-aplus` **10%** (6/63) `[V]`.

Coverage means *an objective has at least one released lesson and at least one
released scored item* (`scripts/generate-study-content.py:149-169`, REQ-MAN-07). It is
computed and displayed in the track overview; **no gate enforces it** `[V]`.

- **64 of 131 objectives (49%) have no released item**, and **68 (52%) have no
  released lesson** — concentrated in the CompTIA exams: A+ Core 2 has 8 items for 36
  objectives, A+ Core 1 has 16 for 27, Network+ has 25 items of which 9 objectives get
  none.
- **13 manifest `lessonIds` point at lesson files that do not exist** (A+ Core 2
  `2.5`→`b2`; Network+ `2.1`–`2.4`→`n2`, `3.1`–`3.5`→`n3`, `4.1`–`4.3`→`n4`), and **55
  objectives declare an empty `lessonIds` array** `[V]`.
- **1,598 legacy items in 22 root-level banks are not shipped.** They are parsed by
  the Desktop and legacy apps only (`README.md:34-36`). They are also where the
  answer-key concentration and 2 errata live `[A]`.
- **Every shipped item is `status: draft` with an empty `reviewDate`**, and all 329
  review logs record `verdict: return` with `modelStage: blocked`
  (`scripts/redeye-config.json`) `[V]`. `releaseState` is `draft-preview` and every UI
  surface labels the pack accordingly.

**Scenarios** (one registry, `RadicalTrainingPlatform.Web/js/views/scenarios.js:255`):
50 scenarios with 89 objectives and 89 implemented validators — the old
`validate: () => true` defect is gone, and `scripts/scan-scenario-validators.py`
hard-fails on a constant-true predicate `[V]`. All 50 have a recorded walkthrough
(`tests/gates/web/lib/scenario-walkthroughs.mjs`), and each fails on a fresh seed
before the walkthrough passes it `[V]`.

| Exam | Scenarios | Objectives | Notes |
|---|---:|---:|---|
| NCM-MCI | 21 | — | not shipped as a track |
| NCP-US | 9 | — | not shipped as a track |
| NCP-CI | 7 | — | not shipped as a track |
| NCP-AI | 7 | — | not shipped as a track |
| NCA-75 | 4 | — | 1 per section |
| COMPTIA-A-1201 | 1 | — | 1 of 5 sections |
| COMPTIA-NET-009 | 1 | — | 1 of 5 sections |
| AZ-104 | **0** | — | 100% lesson coverage, no scenario |
| AWS-SAA | **0** | — | 100% lesson coverage, no scenario |
| COMPTIA-A-1202 | **0** | — | no scenario, no lesson for most objectives |

### 2.4 Verification state

The freeze chain runs 64 gates in the same order as CI `[V]`. It covers content
linting, manifests, item identity and types, provenance, remap, cheatsheet, README
counts, traceability, packaging fixtures, import graph, brand/disclaimer, option
shuffle, validator scan, RedEye fixtures, bundle, tutor eval, artifact secrets,
self-host truth, security baseline, item hygiene, the .NET build/test/coverage pair,
the vulnerability gate, and 4 browser suites `[V]`.

What that does **not** cover is listed as V-01..V-06 in §3.

---

## 3. Gap register

### Distribution and install

| ID | Gap | Evidence | Sev | Fix |
|---|---|---|---|---|
| D-01 | The documented Linux build command fails; its comment misdescribes the solution | `README.md:82`, reproduced `NETSDK1100` | **S1** | Either build projects individually in the README (as CI does) or set `EnableWindowsTargeting` for the solution on non-Windows; fix the comment either way |
| D-02 | Windows has no packaging, no installer, and no stated Python prerequisite for the PWA path | `packaging/` listing; `README.md:89-91` | S2 | Add a Windows section (self-contained `dotnet publish -r win-x64` + `python -m http.server` as the zero-install path) |
| D-03 | Two install stories, neither one command for a student | `README.md:72-103`, `SELF-HOST.md:175-183` | S2 | One "student quickstart" at the top of the README: clone, one command per OS, open |
| D-04 | No release artifact, no tag | `git tag -l` empty | S3 | Truthful today and gated; cut a tag only when a reviewed bundle exists |

### Platform parity

| ID | Gap | Evidence | Sev | Fix |
|---|---|---|---|---|
| P-01 | Desktop ships the legacy simulator copy: 44 scenarios / 78 objectives, no study loop, no progress store | `Desktop.csproj:42`; `diff -rq` = 80 paths | **S1** | Decide the student surface (§6). If desktop stays, embed `RadicalTrainingPlatform.Web` instead of the legacy tree and delete the divergent copy |
| P-02 | Desktop's `Simulators/Nutanix/manifest.json` lists 10 routes whose view files do not exist | directory holds only `manifest.json` | S3 | Remove the stub or add the views |
| P-03 | Windows runtime behaviour of the WinForms bridge and lab simulator is unverified (builds, never launched) | `docs/sprints/SPRINT-47-EVIDENCE.md:469-471` `[A]` | S2 | One Windows smoke run of the published desktop build; record it |
| P-04 | No macOS CI or host; packaging scripts for macOS have never run | `SPRINT-47-EVIDENCE.md:289-292` `[A]` | S4 | Out of scope per the product definition; keep the scripts honest |

### Content

| ID | Gap | Evidence | Sev | Fix |
|---|---|---|---|---|
| C-01 | 64/131 objectives have no released item; A+ track is 10% covered | §2.3 | **S1** | Author to the R2 target in §5 |
| C-02 | 68/131 objectives have no released lesson; 13 `lessonIds` point at missing files; 55 declare none | §2.3 | **S1** | R1 in §5 |
| C-03 | No shipped item has passed human review; all are `draft` with empty `reviewDate`, review verdicts are `return` | §2.3 | **S1** | Owner decision on the review standard (§6); until then the `draft-preview` label is the honest state |
| C-04 | 3 of 6 exams have zero scenarios; the two CompTIA exams have 1 each; AZ-104 and AWS-SAA have none despite full lesson coverage | §2.3 | S2 | R3 in §5 |
| C-05 | 41/189 shipped items carry a longest-option-is-correct cue; the legacy banks exceed the answer-position threshold (one NET+ bank is 100% 'B') | `check-item-hygiene.py` advisory `[V]` | S3 | Fold into item authoring; promote the cue check to blocking once the shipped set is clean |
| C-06 | NCA remap: objective 3.2 has zero mapped legacy items; 60/140 rows are section-granular | `check-nca-remap.py` `[A]` | S3 | Resolve with the current guide read (blocked, S48-02) |
| C-07 | Lesson "read" progress is declared in the format registry but no view ever writes it | no `recordContent('lesson', …)` call `[V]` | S3 | Write it from `lesson-reader.js`, or remove the declared format |

### Framing

| ID | Gap | Evidence | Sev | Fix |
|---|---|---|---|---|
| F-01 | Student-facing docs are correct: "No accounts and no sync… A teacher cannot see student progress through this app" | `docs/SELF-HOST.md:163-171` | — | none |
| F-02 | The sprint record is framed around a teacher and titled "Local Classroom Kit", contradicting the product definition | `docs/sprints/SPRINT-39-40.md:1,6` | S4 | Retitle to learner framing; no behaviour change |
| F-03 | Three code comments say "classroom kit" / "teacher" | `track-picker.js:12`, `ProgressStore.js:191`, `track-overview.js:21` | S4 | Reword when next touched |
| F-04 | README's feature list claims "1,458 practice questions — comprehensive coverage across all blueprint domains" and "100% validated", with no hint that the number counts the *legacy* banks or that the validation passes have no in-tree evidence | `README.md:57,68,184-189` | **S2** | Scope the claims to the legacy banks and cite the 189-item draft-preview numbers. **F-04a correction (2026-10-20, after the first draft of this page):** the number 1,458 is *not* stale — it is exactly `NCP-US 400 + NCP-CI 363 + NCP-AI 335 + NCM-MCI 360`, the four exams the README's own table names. The tree holds 1,600 only because it adds the 140 NCA-75 items that table omits. The defect is attribution and the unverifiable validation claims, not arithmetic. Also found while correcting it: the section pointed at a `validation/` directory that **has never been committed to git** (`git log --all -- validation` empty), while the real in-tree evidence is `docs/DOC-REVIEW-REPORT.md` (86 lines, disputed-question review of the Nutanix guides) and `errata.json` (2 corrections). Both corrected in the README at the commit that follows this page. |
| F-05 | README's self-host paragraph names "classroom machines, a school file server" | `README.md:95` | S4 | Not a feature mismatch — a deployment example; leave, or reword to "shared machines" |

### Verification

| ID | Gap | Evidence | Sev | Fix |
|---|---|---|---|---|
| V-01 | No gate enforces per-objective content floors; coverage is displayed but never fails a build | §2.3 | **S2** | Ratchet gate (§5.3) |
| V-02 | No Windows runtime test; no desktop surface parity test | `SPRINT-47-EVIDENCE.md` `[A]` | S2 | P-01/P-03 |
| V-03 | Ticket scenarios have no browser e2e of their own (`aplus-dns-01` only, in a rehearsal that is deliberately not in CI); `nca-vm-01` is not browser-driven | `tests/e2e/rehearsal-web.mjs`, `nca-lab-web.mjs:81-113` `[A]` | S3 | Add `netplus-gw-01` and `nca-vm-01` to the browser suite |
| V-04 | PWA offline behaviour has never been exercised with the network unplugged | `docs/qa/release-evidence/2026-10-23-demo-shots.md:133-150` `[A]` | S2 | One manual offline run, recorded |
| V-05 | Packaging fixtures prove branches, not artifacts — no AppImage, dmg or Flatpak was ever produced | `SPRINT-47-EVIDENCE.md:282-298` `[A]` | S3 | Only matters if a binary is ever published |
| V-06 | 35 web gate fixtures exist, but flashcards and search have no browser e2e | route list only in `a11y-web.mjs:84-110` `[A]` | S4 | Cover in the a11y or smoke suite when touched |

---

## 4. npm vs git checkout

Today there is **no `package.json` anywhere in the product repository** and no npm
path `[V]`. That is deliberate: several evidence pages state zero npm dependencies as
a design property, and `scripts/generate-sbom.py:104` writes "no package.json" into the
SBOM `[V]`. No gate hard-asserts its absence, so adding one would not break the chain,
but it would falsify a recorded SBOM property until that generator is updated.

| | git checkout | npm package |
|---|---|---|
| What the student runs | `git clone` + one of the two commands above | `npx <name>` or `npm i -g <name>` then `<name>` |
| Prerequisites | git, plus .NET SDK or Python 3 | Node 18+ only |
| Payload | the whole repo (content, docs, tests, simulators) | `RadicalTrainingPlatform.Web/` only, ~a few MB |
| Build step | none for the PWA | none, if the compiled JS is shipped |
| Maintenance | none | version bump per content change; the web bundle is generated, so a published package must be rebuilt and republished to carry new content |
| Threat surface | none beyond the clone | supply chain: name squatting, typosquatting, a mutable tag, a compromised publisher account |
| Fits "no hosting" | yes | yes — a static server on `127.0.0.1` |
| Tripwire | none | **SPEC-15 #2: publishing content is public distribution.** Publishing is an owner decision, not an engineering one |

**Effort if chosen `[P]`:** one `package.json` with a `bin` entry and a ~80-line
zero-dependency static server over `RadicalTrainingPlatform.Web/` that opens
`http://127.0.0.1:<port>`; a publish workflow with provenance; an update to
`generate-sbom.py`; and a gate that fails when the packaged bundle drifts from the
generated one. Roughly one sprint. The package would need to ship the compiled
`study-content.js`, because a student cannot be asked to run the generator.

**Recommendation:** keep git checkout as the supported path. Treat npm as a
distribution convenience to consider **after** the content targets in §5 are met and
the owner has decided the review standard — publishing a package whose every item is
`draft` with no review date is a public distribution of unreviewed study material,
which is exactly what the current labelling exists to prevent. The cost of waiting is
near zero: nobody is blocked today by the absence of a package.

---

## 5. Content roadmap

### 5.1 Targets

Chosen so that every objective can be drilled on its own and every exam has at least
one hands-on scenario. Deliberately per-objective rather than per-exam totals, because
per-exam totals are what allowed a 16-item pack to claim 27 objectives.

| Ref | Target | Why this number |
|---|---|---|
| **R1** | Every objective resolves to **1 released lesson** (131/131) | A practice item without a lesson teaches nothing; 47/131 today |
| **R2** | Every objective has **≥3 released items** (≥393 total) | Three is the smallest set that can show a pattern rather than one coin flip; it is also the practice-set size |
| **R3** | **≥1 scenario per section** for A+, A+ Core 2, Network+ and NCA 75 (5+4+5+4 = 18), and **≥1 per exam** for AZ-104 and AWS-SAA (2) — 20 scenarios minimum | The three Nutanix tracks already meet the spirit; the vendor tracks have none |
| **R4** | Every shipped item carries a **non-empty `reviewDate` and a non-`return` verdict** | Today 0/189; without this the product is a draft by its own definition |
| **R5** | No target is met by duplicating an item — identity and hygiene gates already fail on duplicate IDs and constant-true validators | Keeps R2 from being satisfied by padding |

### 5.2 Per-exam gap to target

"Items now" counts released items; "items target" is R2's floor.

| Exam | Objectives | Items now | Items target | Δ items | Lessons now | Lessons target | Δ lessons | Scenarios now | Scenarios target | Δ scenarios |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| COMPTIA-A-1202 | 36 | 8 | 108 | **+100** | 1 | 4 | +3 | 0 | 4 | +4 |
| COMPTIA-A-1201 | 27 | 16 | 81 | **+65** | 1 | 5 | +4 | 1 | 5 | +4 |
| COMPTIA-NET-009 | 25 | 25 | 75 | **+50** | 2 | 5 | +3 | 1 | 5 | +4 |
| NCA-75 | 14 | 40 | 42 | +2 | 14 | 14 | 0 | 4 | 4 | 0 |
| AZ-104 | 15 | 50 | 45 | 0 (top up objectives below 3) | 15 | 15 | 0 | 0 | 1 | +1 |
| AWS-SAA | 14 | 50 | 42 | 0 (top up objectives below 3) | 14 | 14 | 0 | 0 | 1 | +1 |
| **Total** | **131** | **189** | **393** | **+204** | **47** | **57 files** | **+10** | **50** | **66** | **+16** |

Two extra corrections ride with this work and are not in the Δ columns: the 55
objectives with empty `lessonIds` need a manifest mapping, and the 13 dangling
`lessonIds` need either the file or the reference removed.

### 5.3 Order of authoring

1. **Repair the lesson graph** (smallest, unblocks everything): write the 10 planned
   module lessons (`A1,A3,A4,A5`; `B1,B2,B3`; `N2,N3,N4`), map the 55 empty
   `lessonIds`, fix the 13 dangling references. After this R1 is satisfiable and the
   track overview stops listing objectives as uncovered for the wrong reason.
2. **A+ Core 2 items** — the worst ratio in the product (8 items, 36 objectives).
   Author to R2 before Core 1: it is the exam a beginner takes second and the one with
   the least to practice on.
3. **A+ Core 1 items**, then **Network+ items**.
4. **Top-ups** for NCA, AZ-104, AWS-SAA where an objective has fewer than 3.
5. **Scenarios**: 4 for Core 2, 4 for Core 1, 4 for Network+, 1 each for AZ-104 and
   AWS-SAA, using the existing ticket-lab renderer for the CompTIA ones and the
   store-based checklist for the vendor ones.
   *Measured 2026-10-26 above plan, and the plan does not fit the renderers.* The
   ticket renderer's only knobs are `ip` / `gateway` / `dns` against a fixed five-test
   set, so it can express network-addressing faults and nothing else — not the OS,
   security and procedures objectives that make up most of Core 2, and not four
   distinct Core 1 or Network+ tickets without producing near-clones of the two that
   already exist. No Azure or AWS route exists in the router and no store collection
   backs either exam, so the two vendor scenarios have no surface to run on. **Landed:
   one new ticket** (`aplus-ipconf-01`, address conflict) that is a genuinely different
   failure mode — link up, gateway and resolver correct, host still drops — plus the
   conflict-aware simulation behind it. The remaining 13 are blocked on renderer and
   route work, not on content, and are recorded as such rather than cloned.
6. **Human review sweep** (R4) over whatever is shipped at that point.

Every authoring step ships with provenance records (the generator refuses an untracked
scored item), hygiene checks, and the content gates already in the chain.

### 5.4 The gate that proves each target `[P]`

| Target | Gate | Failing fixture | Passing fixture |
|---|---|---|---|
| R1, R2, R3 | new `scripts/check-content-targets.py` | an objective with 0 lessons or 2 items; an exam section with no scenario | a tree meeting all three floors |
| R4 | extend `scripts/check-item-hygiene.py` to fail on `status: draft` or an empty `reviewDate` for any released item | one released item left as draft | a reviewed item |
| R5 | existing `check-item-identity.py`, `check-item-hygiene.py`, `scan-scenario-validators.py` | already covered | already covered |

**The new gate cannot ship enforcing the full targets, because the tree fails them
today.** It ships as a **ratchet**: a committed baseline of per-objective counts; the
gate fails when any objective's item or lesson count *decreases*, and it prints the
remaining gap to the target. It flips to hard enforcement when the baseline reaches
the targets. Both fixtures are still required, and the gate is wired into
`tests/gates/run_freeze_chain.sh` and `.github/workflows/build.yml` in the same change
that adds it, as `check-traceability.py` requires.

### 5.5 Progress log

| Date | Roadmap step | What landed | Measured effect |
|---|---|---|---|
| 2026-10-26 | 5.3 step 1 — repair the lesson graph | Ten module lessons written (`a1,a3,a4,a5`, `b1,b2,b3`, `n2,n3,n4`); all ten added to `RELEASED_LESSONS`; the 55 empty `lessonIds` in the A-1201, A-1202 and NET-009 manifests mapped to their domain's lesson; `content-links.mjs` now pins the "no covering lesson" refusal with a synthetic item, because the shipped corpus no longer contains one | Lesson coverage **63/131 → 131/131 objectives**; REQ-MAN-07 coverage **55 (42%) → 67 (51%)**; dangling lesson references **13 → 0**. Every remaining uncovered objective is now missing *items*, not lessons. Freeze chain 64/64. |
| 2026-10-26 | 5.3 step 2 — A+ Core 2 items | Four new banks (`core2-b1-domain1-bank.md`, `core2-b2-domain2-bank.md`, `core2-b3-domain3-bank.md`, `core2-b4-domain4-bank.md`) carrying 100 items and their provenance records; each of the 36 objectives now has at least three released items | A+ Core 2 items **8 → 108**; REQ-MAN-07 coverage **67 (51%) → 99 (76%)**; diagnosis share 72% of 289 released items; longest-option cue **41/189 → 42/289** (22% → 15%). Freeze chain 64/64. |
| 2026-10-26 | 5.3 step 3a — A+ Core 1 items | Five new banks (`core1-domain1-bank.md` … `core1-domain5-bank.md`, Q17–Q86) carrying 70 items and their provenance records; all 27 objectives now have at least three released items | A+ Core 1 items **16 → 86**; released items **289 → 359**; REQ-MAN-07 coverage **99 (76%) → 122 (93%)**; diagnosis share 72% of 359; longest-option cue **42/289 → 43/359** (15% → 12%). Freeze chain 64/64. |
| 2026-10-26 | 5.3 step 3b — Network+ items | Five new banks (`net009-domain1-bank.md` … `net009-domain5-bank.md`, Q26–Q75) carrying 50 items and their provenance records; all 25 objectives now have at least three released items | Network+ items **25 → 75**; released items **359 → 409**; REQ-MAN-07 coverage **122 (93%) → 131 (100%)** — every objective in all six exams now has a released lesson and at least three released items; diagnosis share 72% of 409; longest-option cue **43/359 → 43/409** (12% → 11%). Freeze chain 64/64. |
| 2026-10-26 | 5.3 step 4 — top-ups (NCA-75, AZ-104, AWS-SAA) | Ten items appended to the three single-file banks (`nca75-pilot.md` Q41–Q44, `az104-beginner.md` Q51, `aws-saa-beginner.md` Q51–Q55) for the ten objectives that were below the floor; keys stay balanced per bank (NCA 11/11/11/11, AZ ≤30%, AWS 13/13/14/14) | NCA 7.5 items **40 → 44**, AZ-104 **50 → 51**, AWS SAA-C03 **50 → 55**; released items **409 → 419**; **every one of the 131 objectives now has at least three released items**; diagnosis share 73% of 419; longest-option cue 43/419 (10%). Freeze chain 64/64. |
| 2026-10-26 | 5.3 step 5 — scenarios | One new ticket, `aplus-ipconf-01` (address conflict): new seeded workstation `ws-ipconf-01`, a conflict-aware `#runTest` in `ticket-lab.js` (partial-loss `ping-ip`, "Duplicate address detected" in `ipconfig`, `ip` row in the evidence panel), `validateAplusIpconf01` registered in `TICKET_VALIDATORS`, and gate coverage — fresh-seed negativity, wrong-but-in-subnet negativity, trace-honoring positivity, reset reseed, and a registry check that now iterates `TICKET_VALIDATORS` **and** back-checks every `renderer: 'ticket'` scenario for a validator. `demo-sweep-report.mjs` pins **51**, and `docs/qa/release-evidence/2026-10-26-demo-sweep.md` records the 51/51 run. | Scenarios **50 → 51**; all 51 boot incomplete and complete via their walkthrough. **The other 13 planned scenarios are not built and are not clones**: the ticket renderer expresses only `ip`/`gateway`/`dns` over a fixed 5-test set (so no Core 2 OS/security/procedure tickets), and AZ-104/AWS-SAA have no route and no store collection to run on. Freeze chain 64/64. |

Notes for the authoring steps that follow. First, the lesson renderer is still an
escape-first subset (headings, lists, bold, inline code) — no tables and no
single-asterisk italics — so lesson authoring must stay inside it, or the renderer must
grow first. Second, `content-links.mjs` had asserted that some shipped item lacked a
covering lesson; when coverage became complete those two preconditions failed. They now
assert full coverage explicitly and test the refusal with a synthetic item, so the gate
still fails if the resolver ever links an item to a lesson that does not list its
objective. Third, a question bank must not end with a disclaimer paragraph: the bank
parser folds everything after the final `---` into the last item's stem, so the text
ships inside the question. The REQ-BRAND-02 disclaimer belongs in lessons and the PWA
shell, not in `questions/*.md`.

---

## 6. Decisions needed from the owner

1. **Which surface is the student product?** The PWA is complete; the desktop app is
   not. If desktop is promoted, P-01 is an S1 build task. If the PWA is the product,
   P-01 becomes S3 (keep the desktop as a quiz companion, and say so in the README).
2. **What counts as a reviewed item?** R4 needs a standard the repository can enforce.
   Today's standard is a RedEye key-versus-source model pass that has no provider. The
   alternatives are human review with a recorded reviewer and date, or an explicit
   owner decision that `draft-preview` items may be used by students — which would
   mean changing the label rather than the content.
3. **npm, later, and with which approval?** §4 recommends waiting. Publishing is a
   SPEC-15 tripwire, so it is a decision for the owner, not a task.

---

## 7. What this analysis did not verify

- It did not run the desktop app, the WinForms app, or any published binary. The
  parity table in §2.2 comes from the project file, the `diff -rq`, and the view
  inventory — not from a launch.
- It did not open the current vendor study guides. Every objective count comes from
  the manifests in `content/`, not from CompTIA, Microsoft, AWS or Nutanix
  documentation. If a manifest is out of date, the targets in §5 inherit that.
- It did not evaluate item quality, difficulty or answer-key correctness. It counted
  items and read hygiene advisories; it did not solve them.
- It did not test offline behaviour, accessibility, or performance on any platform
  beyond what the existing browser gates already assert.
- It did not verify the 1,598 legacy items or the 22 legacy banks, beyond the counts
  and the audit notes quoted.
- The coverage figures were produced by the read-only script in §8 at `68db091`; they
  are not a gate result, and nothing fails if they change.

---

## 8. Reproducing the counts

```bash
# Shipped exams, tracks, items, release state
python3 scripts/check-readme-counts.py

# Per-objective coverage (read-only; loads the project's own bank parser)
python3 - <<'PY'
import importlib.util, json
from pathlib import Path
spec = importlib.util.spec_from_file_location('gsc', 'scripts/generate-study-content.py')
gsc = importlib.util.module_from_spec(spec); spec.loader.exec_module(gsc)
C, exams = Path('content'), gsc.load_exams()
item_obj = {e: set() for e in exams}
for e, banks in gsc.RELEASED_BANKS.items():
    for b in banks:
        for it in gsc.parse_bank(C / 'exams' / e / 'questions' / b):
            item_obj[e].add(json.loads((C / 'provenance' / e / f"{it['number']}.json")
                                       .read_text(encoding='utf-8'))['objectiveId'])
T = I = L = V = 0
for e, m in exams.items():
    rel = {p.stem for p in (C / 'exams' / e / 'lessons').glob('*.md')}
    objs = [o for s in m['sections'] for o in s['objectives']]
    wi = sum(o['id'] in item_obj[e] for o in objs)
    wl = sum(any(l in rel for l in o.get('lessonIds', [])) for o in objs)
    cv = sum(o['id'] in item_obj[e] and any(l in rel for l in o.get('lessonIds', []))
             for o in objs)
    print(f'{e:18} objectives={len(objs):3} with_item={wi:3} with_lesson={wl:3} covered={cv:3}')
    T += len(objs); I += wi; L += wl; V += cv
print(f'TOTAL objectives={T} with_item={I} with_lesson={L} covered={V} ({round(100*V/T)}%)')
PY

# Scenario and validator counts
python3 - <<'PY'
import re, collections
s = open('RadicalTrainingPlatform.Web/js/views/scenarios.js', encoding='utf-8').read()
b = s[s.index('export const SCENARIOS'):]
sc = re.findall(r"\n    \{\s*\n\s*id: '([^']+)', exam: '([^']+)'", b)
print('scenarios:', len(sc), dict(collections.Counter(e for _, e in sc)))
print('objectives:', len(re.findall(r"id: 'obj-\d+'", b)),
      'constant-true:', len(re.findall(r'validate:\s*\([^)]*\)\s*=>\s*true', b)))
PY

# Install and release reality
git tag -l | wc -l && find . -name package.json -not -path './.devgate/*'
dotnet restore RadicalTrainingPlatform.sln   # fails on Linux: NETSDK1100
```
