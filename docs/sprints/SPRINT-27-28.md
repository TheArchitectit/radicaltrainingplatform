# Sprints 27-28: Multi-Vendor Plugin Architecture

**Phase:** Enterprise  
**Duration:** Weeks 53-56 (4 weeks)  
**Goal:** Enable multiple certification vendors beyond Nutanix via a plugin architecture.

**Status:** 🟢 Landed — plugin layer shipped and proven by two vendor packs.
Freeze chain **55/55**. See "Execution record" below for what is and is not true.

---

## Summary

Transform hardcoded Nutanix-specific data into a plugin system where exam vendors, blueprints, and reference materials are loaded from JSON manifests at runtime.

## Key Deliverables

| ID | Deliverable | Points | Status |
|---|---|---|---|
| S27-01 | Design IExamMetadataProvider interface | 2 | ✅ |
| S27-02 | Design IBlueprintProvider interface | 2 | ✅ |
| S27-03 | Design IReferenceProvider interface | 2 | ✅ |
| S27-04 | Implement JSON manifest loader | 3 | ✅ (pre-existing — `ManifestLoader`) |
| S27-05 | Migrate Nutanix data to JSON manifests | 3 | ✅ (pre-existing — 4 exams / 3 tracks) |
| S27-06 | Add AWS-SAA exam track manifest and content | 5 | ✅ |
| S27-07 | Add AZ-104 exam track manifest and content | 5 | ✅ |
| S27-08 | Plugin discovery (load from directory) | 3 | ✅ |
| S27-09 | Plugin validation (schema + checksum) | 2 | ✅ |

**Total:** ~27 points over 2 sprints

S27-01 through S27-05 were **already satisfied** when this pair was picked up —
Sprint 45-06 had shipped `IManifestLoader`, `ExamManifest`/`TrackManifest`,
`ManifestExamCatalog`, `ManifestBlueprintService` and the four `exam.json` +
three `track.json` files. This pair generalised that into a plugin layer rather
than building a parallel one.

## Key Decisions

- **Manifest format:** JSON with schema version, vendor metadata, blueprint file references, question directory references
- **Plugin directory:** `~/.config/RadicalTrainingPlatform/plugins/` or portable directory
- **Provider registration:** Auto-discovered at startup; validated; loaded into DI container
- **AWS-SAA and AZ-104:** Full exam tracks with blueprints and initial question sets (50+ each)
- **Backward compatibility:** Nutanix built-in plugins ensure existing users unaffected

## Dependencies

- S3-03, S3-04 (IBlueprintService, IReferenceService interfaces)
- S23 (content versioning for plugin content updates)
- Phase 3 stable (v1.0)

## Risks

| Risk | Mitigation |
|---|---|
| JSON manifest schema requires versioning | Schema version field; migration path documented |
| Third-party plugin security | Validation + sandbox; signed manifests in future |
| Content authoring for new vendors is slow | Start with 50 questions each; expand in later sprints |

---

## Execution record (added 2026-10-12)

### The two vendor plans disagreed; the owner decided

This document names **AWS-SAA and AZ-104**. The later
`RTP-Platform-Plan-v2-Multi-vendor-and-AI.md` (ingested Oct 10) recommended
foundations-level packs, one slice at a time, after objective research, with an
exit criterion of "no vendor-specific core changes". SPEC-15 recorded the
second-vendor roadmap as "an owner decision; this package takes none of them."

**Owner decision (2026-10-12): both architecture-level exams, sequenced —
Azure first, AWS second, each with its own version and rights review.**

### Sequencing

Azure (AZ-104) landed first, then AWS (AWS-SAA), one pack per commit, each with
its own rights record. The plugin layer was proven by a second vendor actually
shipping through it — that was the point of the exercise, and it is the exit
criterion Plan v2 asked for.

### Counts

| | Before | After Azure | After AWS |
|---|---|---|---|
| Exam manifests | 4 | 5 | **6** |
| Tracks | 3 | 4 | **5** |
| Released items | 89 | 139 | **189** |

### Rights and review posture — read this before trusting a field

**No source was reviewed for either pack.** `sourceReviewDate` in both
`exam.json` files holds the **authoring date**, not a review date. The
validator's rule was deliberately left strict and unchanged per the owner
decision (match the existing four packs; no gate change, no new fixture pair).

The truth lives in the per-pack rights records, not the manifests:

- [VENDOR-PACK-RIGHTS-AZ-104.md](../VENDOR-PACK-RIGHTS-AZ-104.md)
- [VENDOR-PACK-RIGHTS-AWS-SAA.md](../VENDOR-PACK-RIGHTS-AWS-SAA.md)

Both packs' objective maps were derived from the vendor's public study guide by
a **tool fetch** — better than authoring from memory, worse than the review the
field implies. The guide's own text was paraphrased into objective titles.

**No item passes RedEye.** The lane writes `verdict: "return"` and
`modelStage: "blocked"` for every item because the key-vs-source stage is
model-backed and unconfigured; the ship gate rejects any log whose `modelStage`
is not `verified`. 50/50 AWS items and 50/50 AZ-104 items are in that state.
Items reach learners at `draft-preview` under the `beginner preview` label,
which is the repo's existing beta mechanism.

**Deviation from this document's own plan:** the plan said to commit per-item
RedEye logs. `content/review-logs/` is gitignored (`.gitignore:46`), so the logs
are regenerable (`python3 scripts/redeye-lane.py --exam <id>`) but **cannot be
committed**. The verdict distributions are recorded in the rights records
instead. This is a deviation, reported rather than papered over.

### Known gap

`AWS-SAA/exam.json` carries `objectivesDocVersion: "SAA-C03"` rather than a
date: the AWS exam guide as fetched carries no dated revision marker, and
writing one would be invention. An undated blueprint cannot be checked against a
later revision — this is a real limitation, recorded in the AWS rights record.

### Verification

Freeze chain **55/55** (the plugin gate and its fixture runner grew the chain
53 → 55; stated as growth, not regression). Every content gate passes over both
packs: `lint-content`, `check-item-types` (diagnosis share 73% globally),
`check-brand`, `validate-manifests`, `check-item-identity`,
`check-plugin-manifests`, `generate-study-content --check`,
`generate-bundle-manifest --check`, `check-content-bundle`,
`check-readme-counts`.

**Observed flake:** `run_nca_lab_fixtures.sh` failed once with
"unmodified artifact failed the lab gate (no browser, or the artifact is
broken)" and passed on immediate re-run and on the full chain re-run. Not
attributed to this work, but recorded because a gate that fails
intermittently is a real finding.
