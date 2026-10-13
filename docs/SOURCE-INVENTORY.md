# Source-document inventory — hash and rights record

**Finding:** C-09 (content/source licensing unresolved) · **Task:** T-31a (PDF
inventory with hash/license record) · **Sprint home:** [S48-07](sprints/SPRINT-48.md)
**Gate:** `python3 scripts/check-source-inventory.py` · **Fixtures:**
`bash tests/gates/run_source_inventory_fixtures.sh`

This is the record C-09 asks for: every PDF tracked in this repository, its
sha256, its size, what it is, whether the document is actually here, and where
its rights stand. It is generated against the tree rather than written from
memory, and `scripts/check-source-inventory.py` fails if the two disagree — a
new PDF with no row, a row with no file, a replaced file keeping a stale hash,
a blank rights cell, or a row that claims a document is present when the bytes
say otherwise.

```
python3 scripts/check-source-inventory.py
# SOURCE INVENTORY: PASS — 8 source document(s) recorded, hash/size/rights/presence all match the tree
```

The `Presence` column is recorded, not inferred, precisely so the gate can
contradict it. `pointer-only` is a truthful status; **claiming `in-repo` for a
file that is pointer text is the defect this column exists to catch.**

---

## The inventory

| File | sha256 | bytes | Class | Presence | Rights status |
|---|---|---|---|---|---|
| `docs/AHV-Admin-Guide-v11_0.pdf` | `af56f087e1567a465f4af9d38b770591d6d9b3adb9335795c0ebe426b97c568c` | 132 | vendor-manual | pointer-only | proprietary Nutanix documentation — no redistribution right held; not licensed to this project |
| `docs/Prism-Central-Guide-vpc_7_5.pdf` | `10a73129dae00c69a317cb35f972533b1bcb99f7a7b4f5bdac3d6e5cf160d530` | 133 | vendor-manual | pointer-only | proprietary Nutanix documentation — no redistribution right held; not licensed to this project |
| `docs/drive-ingest-2026-10-10/RTP-Architecture-Audit.pdf` | `177eeff713c8fb1f4db9a39d501c680abb57cfe3c3f1207974aab28f95130a9b` | 55250 | ingest-source | in-repo | project audit output from the 2026-10-10 ingest — rights review not performed |
| `docs/drive-ingest-2026-10-10/RTP-Full-Audit-2026-10-10.pdf` | `4ddb2cfb3560eb52605dcea53faa53ca667790991f8b236108eb77cddd282813` | 729144 | ingest-source | in-repo | project audit output from the 2026-10-10 ingest — rights review not performed |
| `docs/drive-ingest-2026-10-10/RTP-Gap-Analysis-RedEye-2026-10-10.pdf` | `41accc8269092d7f3e2d4228072d6d31fd31a35d5d33187c694a68216c449216` | 860812 | ingest-source | in-repo | project analysis output from the 2026-10-10 ingest — rights review not performed |
| `docs/drive-ingest-2026-10-10/RTP-OpenSpec-RedEye-2026-10-10.pdf` | `41b1d61bef405d86e8d1c84d405fd160ec1ab0258575d7966439a6cdc4bcd56b` | 928961 | ingest-source | in-repo | project analysis output from the 2026-10-10 ingest — rights review not performed |
| `docs/drive-ingest-2026-10-10/RTP-Platform-Plan-Spec.pdf` | `9149cf5306a135fb09dd507c85bf2db6626cbf16f55895f98d2ca0b2d406c22b` | 44019 | ingest-source | in-repo | project plan output from the 2026-10-10 ingest — rights review not performed |
| `docs/drive-ingest-2026-10-10/RTP-Platform-Plan-v2-Multi-Vendor-AI.pdf` | `24dbf297c1cb64b893a2bb395e10cdc11d9665041927142768c6198e4e986848` | 135646 | ingest-source | in-repo | project plan output from the 2026-10-10 ingest — rights review not performed |

Two classes appear, and they are not the same question:

- **`vendor-manual`** — third-party documentation. A code license cannot cover
  it and this project holds no redistribution right. See
  [LICENSE-DECISION.md](LICENSE-DECISION.md) § 3.
- **`ingest-source`** — this project's own audit and plan documents, downloaded
  from the October 10 Google Drive ingest ([README](drive-ingest-2026-10-10/README.md)
  records the folder, the ID parse and the `%PDF` signature check). They are the
  project's output, but **no rights review has been performed on them**, and
  the record says that rather than assuming the license that is not yet in
  effect.

---

## Findings this record carries

**1. The two vendor manuals are not in the repository.** Both files are 132 and
133 bytes of Git large-object pointer text. Their declared objects are
4,323,527 bytes (`oid sha256:e694840175da0737fbd36d5a5d3181e116a6c54c2d449e5d046bc15440cfa8dd`)
and 19,424,163 bytes (`oid sha256:ef837281846cd14dfcffba9327d1968d58b45a95f4270e0101b70aa765366bab`).
The repository has **no `.gitattributes`**, so no filter is configured
(`git check-attr filter` reports `unspecified` for both) and nothing is
retrieved on checkout: a clone gets the pointer text. The manuals are absent
from the repository and are not retrievable from it.

**2. A review report cites documents that are not here.**
[DOC-REVIEW-REPORT.md](DOC-REVIEW-REPORT.md) opens "Based on review of:
`Prism-Central-Guide-vpc_7_5.pdf` and `AHV-Admin-Guide-v11_0.pdf`" and quotes
them by section and approximate page. Whatever review was performed, the
repository cannot show its source. Recorded here so the claim and the inventory
are read together.

**3. The package's own description of this is wrong.** The ingested change
package and gap analysis describe the manuals as being "in the public
repository through Git LFS". They are not — with no `.gitattributes` there is no
LFS filter, and the objects are not fetchable from this repository. The finding
those documents raise (public exposure) is not supported by the tree; the
finding that *is* supported is absence.

**4. `LICENSE` is proposed, not in effect.** C-09's passing condition has three
clauses. Two are now satisfied — this inventory, and the tutor-corpus
transmission-rights gate (`services/ai-gateway/corpus.mjs`,
`tests/gates/tutor-eval.mjs`). The third, "LICENSE present", is deliberately
open: [LICENSE-DECISION.md](LICENSE-DECISION.md) holds prepared BSD-3-Clause
text waiting on one owner confirmation, because a license names a legal
instrument. That clause is not this record's to close.

---

## What this record does not establish

Stated plainly, per SPEC-16's evidence rule:

- **Not verified: that any rights review has been performed** for the ingested
  documents. The rights column says "not performed"; this record cannot make it
  performed.
- **Not verified: that the pointer objects exist on any remote.** The gate reads
  bytes in the tree; it does not contact a remote, and no remote is configured
  in this repository.
- **Not verified: the contents of the two manuals.** They have not been opened
  from this host because they are not here.
- **Not verified: that this list is exhaustive of the *project's* source
  material.** It enumerates tracked PDFs. Other ingested formats in the same
  directory (`.md`, `.txt`, `.zip`) are not PDFs and are out of this record's
  scope by its own definition.

The gate enforces consistency between this file and the tree. It does not, and
cannot, enforce that the rights statements are correct — a human decides those.
