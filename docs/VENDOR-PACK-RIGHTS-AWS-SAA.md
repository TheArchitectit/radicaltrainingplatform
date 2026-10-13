# Vendor pack rights record — AWS-SAA (AWS Certified Solutions Architect - Associate)

**Pack:** `content/exams/AWS-SAA/` · **Track:** `content/tracks/track-aws/`
**Sprint home:** Sprints 27-28 · **Status:** draft-preview (beginner preview)

This is the record the Sprints 27-28 plan promised: the place where the truth
about this pack's provenance lives, because the machine-readable fields cannot
carry it. Read this before reading `sourceReviewDate`.

---

## 1. No human source review has been performed

`content/exams/AWS-SAA/exam.json` carries `"sourceReviewDate": "2026-10-12"`.
**That date is the authoring date, not a review date.** No human has opened the
SAA-C03 exam guide and checked this pack's objective structure against it.

The field's meaning, per the standing rule, is "a human opened the source
document and verified the blueprint against it". That did not happen here. The
field is populated to match the four existing packs, whose values are the same
kind of ingest/authoring date — a known defect the S48 freeze record already
names. The validator's rule is deliberately unchanged: it stays strict, and this
record, not the manifest, is where the truth is written down.

**A reader who trusts `sourceReviewDate` alone will be misled about this pack.**

## 2. The objective map was derived from a public source, by a tool

The section and objective structure in `exam.json` was derived from the public
SAA-C03 exam guide — specifically its four domain pages, which list the task
statements and the skills under each:

- Source root: `https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03.html`
- Domain pages: `…-domain1.html` through `…-domain4.html`
- Retrieved by the authoring tool on **2026-10-12**

The four domains and their published weights are as the guide states them:
Design Secure Architectures (30%), Design Resilient Architectures (26%), Design
High-Performing Architectures (24%), Design Cost-Optimized Architectures (20%).
The 14 objectives in `exam.json` are the guide's 14 task statements.

Three limits on that:

- **A tool fetch is not a source review.** No human read it. It is better than
  authoring from memory and worse than the review the field implies.
- **The guide's task-statement and bullet text was paraphrased, not copied.**
  Objective titles are this pack's own wording. Where the guide's phrasing is
  short and functional (for example "Design secure access to AWS resources"),
  the objective title is necessarily close to it — that is nominative
  description of a public outline, not reproduction of protected text.
- **`objectivesDocVersion` holds the exam code, not a date.** The AZ-104 pack
  could record "Skills measured as of April 17, 2026" because the Microsoft
  guide states a revision date. The AWS guide as fetched carries no dated
  revision marker the tool could confirm, so writing a date here would be
  invention. The field records `SAA-C03` instead. This is a real gap: an
  undated blueprint cannot be checked against a later revision.

The `studyAllocationLabel` in `exam.json` records the same thing about the
per-section item counts: the published weights are percentages (30 / 26 / 24 /
20), and the item counts (15 / 13 / 12 / 10) are this pack's study choice that
tracks them.

## 3. Rights basis for the items

Every scored item in `content/exams/AWS-SAA/questions/aws-saa-beginner.md` is
**original work written for this pack**. Each item's provenance record states
`"rightsBasis": "original work; no vendor text lifted"`.

- No exam question, answer key, or exam dump was used, and none is reproduced.
- No AWS documentation text is reproduced. Lessons explain concepts in this
  project's own words.
- Product and service names (AWS, Amazon S3, IAM, VPC, Lambda, and so on) are
  used nominatively — to name the thing being taught. This pack claims no
  affiliation with Amazon Web Services and carries no AWS marks.
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
same fail-closed state the NCA pilot and the AZ-104 pack ship in today.

That is why this pack ships at `draft-preview` under the `beginner preview`
label. "Reviewed with RedEye" means the deterministic checks ran and a log
exists; it does not mean cleared.

The lane writes its logs under `content/review-logs/`, which is gitignored
(`.gitignore:46`). **The per-item logs are therefore regenerable but not
tracked** — `python3 scripts/redeye-lane.py --exam AWS-SAA` reproduces them. The
sprint record carries the verdict distribution instead of a committed log set.

## 5. What would close this record

This pack moves out of `draft-preview` when all four of these are true, and not
before:

1. A human opens the SAA-C03 exam guide and checks the objective map against it,
   then writes a real `sourceReviewDate`.
2. The guide's revision date is established, so `objectivesDocVersion` can carry
   a date rather than the exam code (see §2).
3. The radredeye model stage is integrated with a configured provider, so
   key-vs-source verification actually runs.
4. A human validates the items themselves against an authoritative source.

None of the four is a gate change. Each is work that has not been done.
