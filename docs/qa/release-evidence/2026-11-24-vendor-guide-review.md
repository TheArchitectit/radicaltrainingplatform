# Vendor guide review — AHV 11.2 / AOS 7.6 / Enterprise AI 2.8 (2026-11-24)

**Purpose:** the NCA cheat sheet's status note has said since 2026-11-06 that most
of its storage-fabric and AHV-side claims were unverified because the AHV 11
admin guide was not obtainable. Three vendor guides were supplied by the owner
in `~/Downloads` on 2026-11-24 and this record is the claim-by-claim pass against
them.

## Documents

| Document | Version | Pages | sha256 | Source |
|---|---|---|---|---|
| AHV Administration Guide | 11.2 (PDF 2026-11-02) | 320 | `97b725ea8367…` | owner-supplied download |
| vSphere Administration Guide for AOS | AOS 7.6 (PDF 2026-10-13) | 77 | `228921995a93…` | owner-supplied download |
| Nutanix Enterprise AI Guide | 2.8 (PDF 2026-11-15) | 331 | `748a0abcf6b9…` | owner-supplied download |

**These are not in the repository and were not added to it.** SPEC-15's
vendor-document disposition is unchanged; `docs/SOURCE-INVENTORY.md` keeps
enumerating *tracked* PDFs, and none of these three is one. Rights review was not
performed — a vendor-published guide being readable is not a redistribution
right.

**Method:** `pdftotext -layout` to a scratch tree, targeted searches, and page
numbers from the documents' own footers. Every verdict below cites the page it
came from. Absence is recorded as *not stated* — not as a contradiction.

## Verdict matrix — cheat-sheet claims

| Claim | Verdict | Evidence |
|---|---|---|
| AHV default bond mode = active-backup | **Confirmed** | AHV 11.2 p.77: "The default virtual switch is configured with the Active-Backup uplink bond type"; Table 9 p.78 |
| AHV recommended bond mode = balance-slb | **Contradicted** | Table 9 p.78 labels Active-Backup "Recommended. Default configuration"; balance-slb (= Active-Active with MAC pinning) "works with caveats for multicast traffic … Do not use this bond type with link aggregation protocols such as LACP". **Corrected inline.** |
| AHV default vNIC = VirtIO | Not stated | The guide shows "Nutanix VirtIO Ethernet Adapter" as a selectable adapter (p.161); no default is declared |
| iSCSI redirector runs on each AHV host | **Confirmed** | p.7: "Each AHV host runs an iSCSI redirector … performs an iSCSI login redirect to a healthy Stargate" |
| iSCSI ports 3260 / 3261 / 3205 | **Confirmed** (as the iSCSI service port set) | p.63: source ports 3260,3261,3205 on CVM; destination ports on AHV |
| iSCSI redirector port = 3261 | Not stated | 3261 appears only inside the port set above; the guide does not attribute it to the redirector |
| ESXi path is NFS | **Confirmed** | vSphere for AOS 7.6 p.4: "AOS Storage presents usable storage to the vSphere environment as an NFS datastore" |
| AHV path is the native/redirector path | Partially confirmed | p.7 describes QEMU → iSCSI redirector for volume groups; no general statement for all vDisk I/O |
| NGT VSS = application-consistent snapshots | **Confirmed** | vSphere guide p.61 (NGT section): VSS and application-consistent snapshots after enabling NGT |
| vTPM support | **Confirmed, threshold differs** | AHV 11.2 p.150: vTPM supported since AOS 6.5.1 / AHV 20220304.242 — so "AOS 7.5+" is understated, not wrong |
| VM Startup Policies | **Confirmed** (existence) | AHV 11.2 TOC + section "VM Startup Policy" |
| NearSync RPO ~15 sec – 15 min | **Contradicted (low bound)** | p.157: "NearSync replication with frequency intervals of as less as 20 seconds up to 15 minutes". **Corrected to 20 s – 15 min.** |
| Metro Availability RPO 0 (synchronous) | **Confirmed** (capability) | p.40/p.71: synchronous replication schedules; Metro Availability on synchronous schedules |
| NGT Master port 2073 | Not stated | 2073 appears only in a firewall example (`modify_firewall … -p 2030,2036,2073,2090`, p.63-area) for inter-cluster traffic |
| Ports 80 / 9440, Prism Element API v2.0, Pulse destination, SAML/MFA | Not stated | absent from both AHV and vSphere guides |
| CVM service roles/leaders (Stargate, Medusa, Zeus, Curator, Prism, Acropolis, Genesis, Chronos, Cerebro, Pithos) | Not stated | the names appear only in `zeus_status`-style service listings (AHV 11.2 p.39), never with roles or leader counts |
| RF copy counts, extent/extent-group sizes, EC-X savings, AES default, 185 TB/node, Unified Cache formula, ILM 75%, 25,000-VM PC scale, 28+ nodes, 2,048-NGT limit | Not stated | absent; the vSphere guide's "2,048 VMs" (p.5) is vSphere's per-datastore maximum, a different claim |
| S3 vendors (Wasabi, Backblaze, OVHcloud) | Not stated | neither guide names backup vendors |

Enterprise AI 2.8 was read only far enough to confirm the product identity and
version; it carries no claim from this cheat sheet.

## Corrections made to `studyguides/CHEATSHEET-NCA-75.md`

1. **AHV recommended bond mode** — `balance-slb` → active-backup, citing AHV 11.2
   Table 9. The old value was the opposite of what the guide recommends; the
   default row was already correct.
2. **NearSync RPO** — `~15 sec - 15 min` → `20 sec - 15 min`, citing p.157.
3. The status note's "contested but left as written" paragraph is replaced by
   the adjudication above; the unverified list now names what is still outside
   the reviewed documents.

Both corrections are wording changes on claims that were individually
re-verified, which is what REQ-NCA-04 permits. No other wording changed.

## Source-stage pilot run (2026-11-24)

> **Correction, same day: the 13-item figure below is withdrawn.** Those passes
> were produced by a page selection that did not exclude tables of contents.
> Five of them cited AHV 11.2 page 4 — rendered and read: it is the table of
> contents — and the model "quoted" support that is not on it. The stage now
> excludes TOC pages, unions a term-count and a phrase selection, and requires
> the model to quote the page verbatim with the quote verified against the page
> text (60% trigram overlap); a citation that cannot be found is a failure. The
> table below is kept as the record of the flawed pass, not as evidence of
> verification, and the corrected re-run supersedes it.

The lane's new opt-in source stage was run over the whole 44-item pilot with
these two guides pinned in `scripts/redeye-source.local.json`:

```
python3 scripts/redeye-lane.py --exam NCA-75 --config scripts/redeye-config.local.json \
  --source-config scripts/redeye-source.local.json \
  content/exams/NCA-75/questions/nca75-pilot.md
python3 scripts/redeye-gate.py NCA-75 --config scripts/redeye-config.local.json \
  --source-config scripts/redeye-source.local.json
```

| Outcome | Items | Meaning |
|---|---|---|
| `source-support: pass` | **13** | The rendered pages support exactly the keyed answer; the model cited pages and reasons |
| `source-support: fail` — pages do not settle it | **31** | The selected pages did not answer the item; every one of the 31 says so |
| `source-support: fail` — contradictory | **0** | No item had a key the pages contradicted |
| `blocked` | 0 | No timeout, pin or tooling failure in the full run |

**Zero contradictions is the important number.** In 44 items whose keys the
model stage had already agreed with, the documents never supported a different
answer. The source stage's value is the 13 it can cite: Q1 (AHV p.4), Q2 (p.4),
Q4 (p.7), Q5 (p.4), Q9 (pp.61/134), Q12 (pp.156–157), Q14, Q17, Q18 (p.4),
Q22 (p.4, p.73), Q23 (p.39), Q27, Q33 (p.28) — each with the page or page
content named and the claim it supports.

**Why 31 do not settle.** Their subjects are outside these two documents:
licensing models and core counting, alert correlation/root-cause ordering,
Pulse telemetry, disk-latency and backup-window analysis, managed-vs-unmanaged
network definitions, and NCA tooling (Move/Foundation/Collector/X-Ray). Those
live in the Prism Central, licensing and operational guides, which were not
supplied. The stage refuses rather than guessing — that is the fail-closed
behaviour it was built for, and it is reported as a gap, not smoothed.

**Ship-gate with the source pin:** 304 items gated, **13 ok**, **171 return**
(140 legacy provenance/mapping + 31 pilot items the documents do not settle),
**120 no log** (unreleased pack banks), exit 1.

## What this record does not establish

- That the unread claims are correct — they remain carried from the beta sheet.
- Rights to redistribute any of the three documents; none was copied into the
  repository, and none should be.
- That the AHV guide's guidance matches the *current* published exam objectives;
  the NCA blueprint guide remains the objective source.
- That any cheat-sheet claim is source-verified for the exam pilot items — this
  is a document review, not an item review.
