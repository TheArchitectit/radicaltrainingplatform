# NCA 7.5 — Quick Reference Cheat Sheet

> **Status note — revised 2026-11-06.** This sheet was originally written against the
> NCA 7.5 beta blueprint. A claim-by-claim re-verification pass was run on
> 2026-11-06 against the **Prism Central Infrastructure Guide, pc.7.5** (Nutanix
> revision dated 2026-11-02). Per REQ-NCA-04, wording changes only where a claim
> was individually re-verified — and the pass found **nothing to change**.
> Sixteen PC-side claims held: PC API v4 as current, port 9440 and the
> HTTP-to-9440 redirect, NGT proxy 2074, the 2,048-VM per-cluster NGT limit,
> iSCSI 3260, PC as a separate appliance with 3-VM scale-out, RBAC, Projects,
> Categories and Flow/Calm/NKP as PC-side, authenticated NTP with SHA
> algorithms, Guest Customization Profiles at NGT 4.5, dark-site LCM in PC,
> multi-site DR as a PC capability, the Starter/Pro/Ultimate tier names, and
> S3-compatible PC backup targets.
>
> Two claims are **contested but left as written.** The bond-mode rows name
> `active-backup` as default and `balance-slb` as recommended; the PC guide's
> bond table labels Active-Backup "Recommended. Default" and gives balance-slb
> the multicast and LACP caveats. That table documents Prism Central
> multicluster/VPC uplinks, **not** the AHV host bonds the sheet describes, and
> the document that does adjudicate those — the AHV 11 admin guide — is the
> second pointer-only PDF in [SOURCE-INVENTORY.md](../docs/SOURCE-INVENTORY.md)
> and is not obtainable. Absence in the wrong document is not a contradiction.
> The three named S3 vendors (Wasabi, Backblaze, OVHcloud) are simply not named
> in the PC guide, which is an omission rather than a refutation.
>
> Everything storage-fabric-side — replication-factor copy counts, extent and
> extent-group sizes, EC-X savings, the write path, the CVM service table, AES,
> per-node capacity, the Unified Cache formula, ILM thresholds, node minimums,
> the vNIC type, the Prism Element API version, ports 80, 2073 and 3261, the
> Pulse destination, and SAML/MFA — is **outside the pc.7.5 guide entirely** and
> stays as carried from the beta sheet. They need the AOS / Prism Element / AHV
> 11 guide. Verified against one guide is not verified against the product.
>
> One corrected claim remains marked inline: the CVM SSH default (errata
> **NCA-75-Part3-GapFill-Q3**). The beta window this sheet was first written for
> closed on 2026-06-14 (SPEC-18).

## Must-Know Numbers
| Metric | Value |
|--------|-------|
| Min cluster nodes | 3 |
| Max cluster nodes | N/A (tested to 28+) |
| RF2 copies | 2 data + 3 metadata |
| RF3 copies | 3 data + 5 metadata |
| RF2 node failure tolerance | 1 |
| RF3 node failure tolerance | 2 |
| Extent size (SSD) | 4KB |
| Extent size (HDD) | 1MB |
| Extent group size | 1-4MB |
| EC-X savings (RF2) | ~33-37% |
| EC-X savings (RF3) | ~50% |
| AHV default bond mode | active-backup |
| AHV recommended bond mode | balance-slb |
| AHV default vNIC | VirtIO |
| NGT VSS | Application-consistent snapshots |
| CVM default RAM | ~32 GB (varies by feature load) |
| Prism API v4 | PC current/recommended |
| Prism API v2.0 | PE |
| Max PC scale (AOS 7.5) | 25,000 VMs (scale-out 3-VM) |
| Max NGT VMs per cluster | 2,048 |
| vTPM support | AOS 7.5+ with KMS |
| AES default | AOS 7.5+ (all-flash new; hybrid upgrade) |
| Max storage per node (7.5) | 185 TB |
| ILM down-migration threshold | 75% |
| Unified Cache formula | ((CVM RAM − 12 GB) × 0.45) |
| NearSync activation | ≤ 15 min snapshot frequency |
| Metro Availability RPO | 0 (synchronous) |
| Async DR RPO | 1-24 hours |
| NearSync RPO | ~15 sec - 15 min |
| LCM upgrade order | AOS → Hypervisor → Firmware |
| Prism ports | 80 (HTTP redirect), 9440 (HTTPS) |
| NGT Master port | 2073 |
| NGT Proxy port | 2074 |
| iSCSI port (Volume Groups) | 3260 |
| iSCSI redirector port (AHV) | 3261 |
| Pulse destination | insights.nutanix.com:443 |

## Key Acronyms
| Acronym | Meaning |
|---------|---------|
| AOS | Acropolis Operating System |
| AHV | Acropolis Hypervisor |
| CVM | Controller Virtual Machine |
| DSF | Distributed Storage Fabric |
| LCM | Life Cycle Manager |
| PD | Protection Domain |
| RF | Replication Factor |
| EC-X | Erasure Coding |
| NGT | Nutanix Guest Tools |
| VG | Volume Group |
| IPAM | IP Address Management |
| NCC | Nutanix Cluster Check |
| VSS | Volume Shadow Copy Service |
| NCLI | Nutanix CLI |
| OVS | Open vSwitch |
| VPC | Virtual Private Cloud |
| NC2 | Nutanix Cloud Clusters |
| AES | Autonomous Extent Store |
| ILM | Intelligent Lifecycle Management |
| SSR | Self-Service Restore |
| FSVM | File Server VM |
| LWS | Light-Weight Snapshot |
| FT | Fault Tolerance |

## Write Path (Memorize This)
1. VM issues write → Hypervisor
2. Hypervisor forwards to CVM (local Stargate) via native path (AHV) or NFS (ESXi)
3. Stargate Write Characterizer determines: random → OpLog, sequential (>1.5MB) → Extent Store
4. Write persisted to local OpLog/Extent Store AND sync replicated to 1 (RF2) or 2 (RF3) remote CVMs
5. ACK to VM once durable on all replicas
6. Curator drains OpLog → Extent Store asynchronously
7. ILM moves data between tiers based on access patterns

## CVM Service Summary
| Service | Tech | Role | Runs On | Leader? |
|---------|------|------|---------|---------|
| Stargate | Custom | Data I/O (read/write/cache/replicate) | Every CVM | No leader |
| Medusa | Cassandra | Global metadata store | Every CVM (ring) | Consistent hashing |
| Zeus | ZooKeeper | Cluster config, leader election | 3 or 5 CVMs | 1 leader |
| Curator | Map-Reduce | Analytics, ILM, disk balancing, EC-X | Every CVM | Curator Master |
| Prism | Custom | Management UI/API/CLI | Every CVM | Prism Leader |
| Acropolis | Custom | Compute scheduling, HA, IPAM | Every CVM | Acropolis Leader |
| Genesis | Custom | Service manager | Every CVM | No leader |
| Chronos | Custom | Job/task scheduler | Every CVM | Elected master |
| Cerebro | Custom | Replication / DR manager | Every CVM | Elected master |
| Pithos | Custom | vDisk configuration | Every CVM | No leader |

## AOS 7.5 Key Changes (Exam Focus)
- **AES default** — Autonomous Extent Store default for new all-flash + qualifying hybrid upgrades
- **vTPM + KMS** — Key Management Service integration
- **CVM SSH enabled by default** on fresh installs — the plan to disable it was deferred (corrected per errata **NCA-75-Part3-GapFill-Q3**; the earlier "disabled by default" claim was wrong)
- **185 TB/node** max all-flash storage
- **VM Startup Policies** — Ordered boot sequences during HA
- **LCM DUO** — Dark site upgrade orchestrator in Prism Central
- **AHV 11 separated from AOS** — Independent lifecycle
- **PC backup to S3-compatible stores** — Wasabi, Backblaze, OVHcloud
- **Authenticated NTP** — SHA algorithms for regulated industries
- **IPv6 dual-stack** in AHV 11
- **Multisite DR 1→3** (up to 4 fault domains) in PC 7.5
- **Guest Customization Profiles** — Reusable in NGT 4.5

## Product Name Changes (Exam Traps)
| Old Name | Current Name |
|----------|-------------|
| Prism Pro | NCM (Nutanix Cloud Manager) |
| Karbon / NKE | NKP (Nutanix Kubernetes Platform) |
| NDB / Era | Nutanix Database Service |
| Xi Leap | Xi DR |
| AFS | Nutanix Files |
| Flow Security | Flow Network Security |

## Licensing Tiers
| Tier | Key Limits |
|------|-----------|
| Starter | On-prem only, RF2, 12 nodes max, no add-ons |
| Pro | Cloud (NC2), advanced features, add-on products available |
| Ultimate | All-inclusive (encryption, Flow, Metro DR, advanced orchestration) |

## PE vs PC Comparison
| Attribute | Prism Element (PE) | Prism Central (PC) |
|-----------|-------------------|--------------------|
| Scope | Single cluster | Multiple clusters |
| Built-in | Yes | Separate VM appliance |
| SAML/MFA | No | Yes |
| Flow/Calm/NKP | No | Yes |
| API | v2.0 | v3 (legacy), v4 (current) |
| RBAC + Projects | No | Yes |
| Categories | No | Yes |

## Closed sitting — dated 2026-10-11

> Kept as a historical record only: the beta window below closed on **June 14, 2026**,
> so the waiver code issued for it is no longer valid and these tips describe an exam
> sitting that is over. They are dated, not deleted, because no current-guide equivalent
> was verified at the time of writing. The code itself is not
> reproduced (SPEC-18): it has no value as history and only a risk as a live string.

- More questions than live exam (used for scoring calibration)
- Answer everything — no penalty for wrong answers
- Mark-and-skip uncertain ones, come back later
- Results take 1-2 months
- Waiver code: **expired — the window closed 2026-06-14; do not attempt to use**
- Beta period through **June 14, 2026** (closed)
