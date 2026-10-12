# LICENSE decision record — R-10 / S47-15

**Status: PROPOSED. The `LICENSE` file has not been dropped.**

Dropping it is **HG-01**, the package's sole standing owner gate, because the
file names a legal instrument. This record and the README pointer are prepared
in advance so that confirmation is one line and the drop is mechanical
(SPEC-09 R-10; package § 16.8).

| | |
|---|---|
| Finding | R-10 (medium) — README claims BSD-3-Clause and links a root `LICENSE` that does not exist (404 at head) |
| Default resolution | ASM-10 — add the BSD-3-Clause `LICENSE` matching the README's claim |
| Gate | **HG-01** — owner confirmation of the text, because it names a legal instrument |
| Owner must supply | the **copyright holder line** (see below) |
| File drop | on confirmation only; not done here |

---

## The finding

Three surfaces in `README.md` assert a license the repository cannot produce:

- line 6 — the shields.io badge `License-BSD 3-Clause-green`
- line 96 — the project tree, `├── LICENSE  # BSD 3-Clause`
- lines 166–168 — `## 📄 License` / `BSD 3-Clause License — see [LICENSE](LICENSE) for details.`

`LICENSE` is absent from the repository root, so the link 404s and the badge
asserts a fact. This is the same class of defect as the dead download links
S47-08 repaired: **a claim the repository cannot keep is worse than no claim**,
because a reader who checks it stops trusting the ones they did not check.

## Proposed text — ready to drop

The file below is the SPDX BSD 3-Clause text, unmodified, with two fields the
owner must fill. On confirmation it is written verbatim to `LICENSE` at the
repository root.

```text
BSD 3-Clause License

Copyright (c) <YEAR>, <COPYRIGHT HOLDER>
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```

**`<YEAR>` and `<COPYRIGHT HOLDER>` are deliberately left blank.** The holder is
a legal person or entity, and this record will not invent one — guessing it would
be the same defect as inventing a `sourceReviewDate`. The owner supplies both;
the year is the year of first publication, which the owner also knows and the
repository's git history does not settle (the project was renamed from a fork —
`2e4f008 rename: CertForge fork from CertStudy` — so the earliest commit here is
not the earliest authorship).

## What the license does and does not cover

This is the C-08/C-09 distinction, and it is the part most likely to be
misread. **A code license is not a content license and is not a rights
clearance.**

### 1. Code — the proposed BSD-3-Clause covers this

The C# projects, the Web PWA, the scripts, the tests, the packaging. This is
what the `LICENSE` file is for.

### 2. Original content — authored here, and the proposal is that the same
license covers it

The lessons, practice items, scenario definitions and validators written for
this platform. They are original work (the package's REQ-AP-06/REQ-NP-02 cut
lines, and the originality screen in the RedEye lane, both assert this). The
proposal is that BSD-3-Clause covers them too, since they are the project's own
output.

**The owner should confirm this explicitly.** "Code is BSD-3-Clause" and
"original content is BSD-3-Clause" are the same license applied to two different
kinds of work, and a reader who wants to reuse the *questions* is asking a
different question from one who wants to reuse the *router*.

### 3. Third-party material — **not covered, and this file cannot cover it**

Two files under `docs/` are named as Nutanix vendor manuals:

| File | Size on disk |
|---|---|
| `docs/AHV-Admin-Guide-v11_0.pdf` | 132 bytes |
| `docs/Prism-Central-Guide-vpc_7_5.pdf` | 133 bytes |

**They are not the manuals.** Both are large-object pointer text — a hash and a
declared object size (4,323,527 and 19,424,163 bytes) — and the repository has
**no `.gitattributes`**, so no filter is configured and nothing is actually
tracked that way (`git check-attr filter` reports `unspecified` for both). A
clone therefore gets 132 bytes of pointer text where a manual is claimed, and
the manuals themselves are not in the repository and are not retrievable from
it. This was found by the release-truth gate (`scripts/check-release-links.py`,
S47-08) rejecting the first draft of this very section — the gate exists to
catch claims the repository cannot keep, and it caught one here.

**That is an open finding in its own right, recorded rather than fixed.** It is
not a licensing question: it is that two documented artifacts are absent. It
bears on the rights review (C-03) because there is currently nothing in the
repository to review.

Either way, they are Plan v2 rights-review items (C-03) and are **unchanged by
this decision**. Their disposition is a separate owner decision, and per the
package's tripwires it is not taken here.

**Adding a code license does not license them.** C-09 is explicit: a LICENSE
file does not grant rights to vendor manuals or question banks. Nothing in this
decision changes their status, and no redistribution right is created by it.

## What the owner confirms (HG-01)

One line is enough:

> Confirm BSD-3-Clause as proposed, with copyright holder `<name>` and year `<year>`.

Or a correction — a different license, or a different holder line — in which case
this record is revised before the file is dropped.

## What happens on confirmation

1. Write `LICENSE` at the repository root with the confirmed text.
2. Replace the README's pending note (below) with the resolved link.
3. Add the copyright line to the packaging metadata, which currently carries a
   placeholder — a follow-on, not part of this drop.

## What was changed here, pending that confirmation

`README.md`'s `## 📄 License` section no longer asserts a license the repository
cannot produce. It now states that the license is proposed, links this record,
and says the `LICENSE` file lands on owner confirmation. The badge and the tree
line are left as they are and are listed below — they are the same claim in two
more places, and they should move with the file drop rather than ahead of it.

## Adjacent observations — recorded, not acted on

- **The badge (line 6) and the tree line (line 96) still assert BSD-3-Clause.**
  They are claims without a file until the drop. Named here so the confirmation
  step sweeps all three surfaces, not just the section.
- **`README.md` is stale well beyond its license claim** — it describes a
  WinForms tool on .NET 8 with 1,458 questions, while the repository is a
  .NET 10 cross-platform solution whose Web PWA is the demo artifact. That is a
  known open finding (carried in the S47-13 freeze record) and is not this row's
  scope.
- **The README's own disclaimer is a paraphrase** — *"not affiliated with or
  endorsed by Nutanix, Inc."* — not the exact REQ-BRAND-02 string. It is ungated:
  `scripts/check-brand.py` scans `RadicalTrainingPlatform.Web/`, `content/`, and
  the demo script glob, not the repository root. Worth closing when the README is
  rewritten; recorded here so it is not lost.
