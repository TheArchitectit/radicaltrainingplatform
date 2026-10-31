# Drive ingest 2026-10-11 — question-bank expansion (content)

Source: Google Drive folder
`https://drive.google.com/drive/folders/17Qer8jOmLqyj8GBZ7JzbuWV6YLYr0B5G`
(shared, public link). Fetched and SHA-verified 2026-10-11.

## What landed

780 original practice questions across four exams, authored by the Instinct
task agent (AI authoring + AI review with cited sources). Placement follows
SPEC-01 **D4** ("new content lives under `content/`, not repo root") and the
track/exam IDs fixed in SPEC-02.

| Exam ID | Files | Items | Destination |
|---|---|---|---|
| COMPTIA-A-1201 | core1-part1..3.md | 180 | `content/exams/COMPTIA-A-1201/questions/` |
| COMPTIA-A-1202 | core2-part1..3.md | 180 | `content/exams/COMPTIA-A-1202/questions/` |
| COMPTIA-NET-009 | net009-part1..5.md | 300 | `content/exams/COMPTIA-NET-009/questions/` |
| NCA-75 (NUTANIX-NCA-75) | nca75-new-part1..2.md | 120 | `content/exams/NCA-75/questions/` |
| **Total** | **13 files** | **780** | |

Per-item provenance (objective, type, source, locator, verified date) is under
`content/provenance/<EXAM>-provenance.json`.

## Why `content/exams/`, not repo root

Root placement is forbidden by SPEC-01 D4 and **breaks exam identity**:
`QuestionParser.DeriveExamCode` keeps at most the first two hyphen segments, so
a root file named `COMPTIA-A-1201-Part1.md` derives `COMPTIA-A` and collides
Core 1 with Core 2. The manifest system (SPEC-02) resolves these IDs instead.

## Lint coverage (SPEC-10)

`scripts/lint-content.py` was extended to also lint `content/exams/**/*.md`
(root legacy Nutanix banks are unchanged). New content additionally enforces
SPEC-09 R-07: the prose answer separator ("**Answer: B and D**") is rejected;
multi-select must be "**Correct Answer: B, D**". Verified: the gate fails on an
injected bad separator and passes clean otherwise.

## Honesty label

Validation is AI review with cited sources — **not** RedEye-certified (RedEye
human review is future work, SPEC-08A) and **not** endorsed by CompTIA or
Nutanix. See `VALIDATION-REPORT.md` for the full method and known limitations.

## Provenance of the raw drop

- `VALIDATION-REPORT.md`, `stats.json`, `demo-cut.txt` — the authoring agent's
  own validation artifacts.
- `rtp-question-banks-2026-10-10.zip` — the as-shipped question pack (13 files).
- `rtp-provenance-2026-10-10.zip` — provenance JSON + the three artifacts above.
- `DELL-DEPLOY.txt` — the authoring agent's copy-paste deploy note (retained
  for provenance; the layout it named differs from current main and was not
  executed as written).
