# Vendor pack rights record — AZ-104 (Microsoft Azure Administrator)

**Pack:** `content/exams/AZ-104/` · **Track:** `content/tracks/track-azure/`
**Sprint home:** Sprints 27-28 · **Status:** draft-preview (beginner preview)

This is the record the Sprints 27-28 plan promised: the place where the truth
about this pack's provenance lives, because the machine-readable fields cannot
carry it. Read this before reading `sourceReviewDate`.

---

## 1. No human source review has been performed

`content/exams/AZ-104/exam.json` carries `"sourceReviewDate": "2026-10-12"`.
**That date is the authoring date, not a review date.** No human has opened the
Microsoft study guide and checked this pack's objective structure against it.

The field's meaning, per the standing rule, is "a human opened the source
document and verified the blueprint against it". That did not happen here. The
field is populated to match the four existing packs, whose values are the same
kind of ingest/authoring date — a known defect the S48 freeze record already
names. The validator's rule is deliberately unchanged: it stays strict, and this
record, not the manifest, is where the truth is written down.

**A reader who trusts `sourceReviewDate` alone will be misled about this pack.**

## 2. The objective map was derived from a public source, by a tool

Unlike a from-memory invention, the section and objective structure in
`exam.json` was derived from the public AZ-104 study guide:

- Source: `https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-104`
- Retrieved by the authoring tool on **2026-10-12**
- The guide states "Skills measured as of April 17, 2026", which is what
  `officialVersion` and `objectivesDocVersion` record

Two limits on that:

- **A tool fetch is not a source review.** No human read it. It is better than
  authoring from memory and worse than the review the field implies.
- **The guide's bullet text was paraphrased, not copied.** Objective titles are
  this pack's own wording. Where the guide's phrasing is short and functional
  (for example "Manage Microsoft Entra users and groups"), the objective title
  is necessarily close to it — that is nominative description of a public
  outline, not reproduction of protected text.

The `studyAllocationLabel` in `exam.json` records the same thing about the
per-section item counts: the published weights are ranges (20-25 / 15-20 /
20-25 / 15-20 / 10-15), and the item counts (12 / 10 / 12 / 10 / 6) are this
pack's study choice inside those ranges.

## 3. Rights basis for the items

Every scored item in `content/exams/AZ-104/questions/az104-beginner.md` is
**original work written for this pack**. Each item's provenance record states
`"rightsBasis": "original work; no vendor text lifted"`.

- No exam question, answer key, or exam dump was used, and none is reproduced.
- No Microsoft documentation text is reproduced. Lessons explain concepts in
  this project's own words.
- Product and service names (Azure, Microsoft Entra ID, Blob Storage, and so on)
  are used nominatively — to name the thing being taught. This pack claims no
  affiliation with Microsoft and carries no Microsoft marks.
- The disclaimer on the track and at the foot of every lesson is the project's
  exact REQ-BRAND-02 string, unchanged, including its reference to CompTIA and
  Nutanix. That string is shared verbatim across all tracks because a build gate
  asserts it is identical everywhere; it is not a claim about this pack's vendor.

## 4. Review posture — no item is cleared

The RedEye lane's deterministic checks were run over this bank (objective
mapping, position bias, originality proximity, provenance completeness,
injection screen). **Every item's verdict is `return`**, because the
key-vs-source stage is model-backed and no provider is configured
(`modelStage: "not-integrated"`). The ship gate rejects any log whose
`modelStage` is not `verified`, so **nothing in this pack passes review** — the
same fail-closed state the NCA pilot ships in today.

That is why this pack ships at `draft-preview` under the `beginner preview`
label. "Reviewed with RedEye" means the deterministic checks ran and a log
exists; it does not mean cleared.

The lane writes its logs under `content/review-logs/`, which is gitignored
(`.gitignore:46`). **The per-item logs are therefore regenerable but not
tracked** — `python3 scripts/redeye-lane.py --exam AZ-104` reproduces them. The
sprint record carries the verdict distribution instead of a committed log set.

## 5. What would close this record

This pack moves out of `draft-preview` when all three of these are true, and not
before:

1. A human opens the AZ-104 study guide and checks the objective map against it,
   then writes a real `sourceReviewDate`.
2. The radredeye model stage is integrated with a configured provider, so
   key-vs-source verification actually runs.
3. A human validates the items themselves against an authoritative source.

None of the three is a gate change. Each is work that has not been done.
