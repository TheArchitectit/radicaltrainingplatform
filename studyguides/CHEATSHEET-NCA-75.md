# NCA 7.5 Beta Exam — Quick Reference Cheat Sheet

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
| Max PC scale (AOS 7.5) | 10,000 VMs |
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
| LCM upgrade order | Firmware → Hypervisor → AOS |
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
- **CVM SSH disabled by default** on fresh installs (security hardening)
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

## Beta Exam Tips
- More questions than live exam (used for scoring calibration)
- Answer everything — no penalty for wrong answers
- Mark-and-skip uncertain ones, come back later
- Results take 1-2 months
- Waiver code: **NCA75BETANEW**
- Beta period through **June 14, 2026**
