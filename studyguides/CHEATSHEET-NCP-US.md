# NCP-US 6.10 — Unified Storage Cheat Sheet

> **Last-night review** · Files/Objects/Volumes · DSF I/O path · Ports · Replication · Data services

---

## Nutanix Files (AFS)

| Parameter | Value |
|---|---|
| **Min FSVMs** | **3** (high availability) |
| **Max FSVMs** | **16** (scale-out) |
| **vCPU per FSVM** | **4** |
| **RAM per FSVM** | **12 GB** |
| **Protocols** | **SMB** (Windows/AD), **NFS** (Linux/POSIX) |
| **Key log file** | **minerva_nvm.log** |
| **Analytics** | File Analytics — audit trail, anomaly detection, ransomware protection |
| **Deployment** | From Prism Element or Prism Central |

### Files Architecture
- FSVMs run **Minerva** service — distributed file serving
- **Volume Groups** back FSVM storage on DSF
- **Share types:** General Purpose (home dirs), Distributed (app data)
- **SSR (Self-Service Restore):** Users restore own snapshots via Previous Versions (SMB) or .snapshot (NFS)
- **Tiering:** Cold data can tier to Nutanix Objects (S3)

---

## Nutanix Objects (S3-Compatible)

| Parameter | Value |
|---|---|
| **Min workers** | **3** |
| **Platform** | **MSP** (Microservices Platform — Kubernetes-based) |
| **API** | **S3-compatible** (AWS SDK works) |
| **Management** | **Prism Central ONLY** (not PE) |
| **WORM** | **24-hour grace period** before lock is permanent |
| **Buckets** | Up to 1000 per object store |
| **Max object size** | 5 TB (multipart upload) |

### Objects Key Concepts
- **WORM (Write Once Read Many):** Compliance + Governance modes
  - **Compliance:** Nobody can delete (not even admin) after grace period
  - **Governance:** Admin can override
  - **24-hour grace period** = can delete within 24 hrs of upload
- **Lifecycle policies:** Transition/expiration rules (like AWS S3)
- **Versioning:** Bucket-level, preserves all versions
- **Access keys:** Per-user, generate in Prism Central → Objects

---

## Nutanix Volumes (iSCSI)

| Parameter | Value |
|---|---|
| **Protocol** | **iSCSI** |
| **Port** | **3260** ⚠️ (NOT 3261!) |
| **Purpose** | Block storage for external (bare-metal, non-AHV) clients |
| **Construct** | **Volume Groups (VGs)** — group of vDisks presented as iSCSI LUNs |
| **External attachment** | Bare-metal servers, Exchange, Oracle RAC |
| **CHAP auth** | Mutual CHAP supported for iSCSI security |

> ⚠️ **Exam trap:** iSCSI port is **3260**, not 3261. This is a frequently tested distractor.

---

## Critical Port Numbers (MUST MEMORIZE)

| Port | Service | What It Does |
|---|---|---|
| **2009** | **Stargate** | I/O manager — all VM I/O goes through here |
| **2010** | **Curator** | Background jobs — garbage collection, ILM, scrubbing |
| **2011** | **Chronos** | Job/task scheduler |
| **2020** | **Cerebro** | Replication, DR, snapshots |
| **2181** | **Zookeeper** | Cluster config consensus (Paxos) |
| **9080** | **Prism HTTP** | Redirect to HTTPS |
| **9440** | **Prism HTTPS** | Web management console |
| **3260** | **iSCSI** | Volumes target port |
| **2049** | **NFS** | Files NFS protocol |
| **445** | **SMB** | Files SMB protocol |

> **Memory trick:** "**Stargate=2009**, then count up: Curator=2010, Chronos=2011, Cerebro=2020, ZK=2181"

---

## Storage Containers & Data Services

### Replication Factor

| RF | Copies | Node Failures Tolerated | Min Nodes |
|---|---|---|---|
| **RF2** | 2 copies | 1 node | 3 nodes |
| **RF3** | 3 copies | 2 nodes | 5 nodes |

### Data Reduction

| Feature | Details |
|---|---|
| **Inline Compression** | **LZ4** — compress on write, low CPU, always-on recommended |
| **Post-process Compression** | Compress after write (delay > 0), higher ratios, more CPU |
| **Deduplication** | Fingerprinting, best for VDI/clone workloads, capacity tier mainly |
| **Erasure Coding (EC-X)** | Converts RF2/RF3 to parity-based — saves space, **cold data only** |

> **Compression rule:** `delay=0` = inline (LZ4) · `delay>0` = post-process

### Erasure Coding (EC-X)
- **EC-X strip size:** configurable, applied to **cold** (capacity tier) data
- Reduces storage overhead from 2× (RF2) to ~1.33× (3/2 encoding)
- **NOT for performance-critical data** — adds rebuild overhead
- Curator moves eligible data to EC in background

---

## DSF I/O Path (CRITICAL)

```
VM Write Request
    ↓
Stargate (local CVM, port 2009)
    ↓
OpLog (SSD-backed write buffer, ~6 GB per Stargate)
    ↓
ACK to VM  ← write acknowledged HERE (fast!)
    ↓ (background)
Replicate to RF peer Stargate(s)
    ↓ (background)
Destage to Extent Store (persistent storage)
```

### Key I/O Concepts

| Concept | Details |
|---|---|
| **OpLog** | **~6 GB per Stargate**, SSD-backed, write coalescing, sequential writes |
| **Extent Store** | Persistent data storage on SSD + HDD tiers |
| **Data locality** | Stargate tries to keep VM data on local node |
| **ILM** | **Auto-tiering:** hot data → SSD, cold data → HDD (automatic, transparent) |
| **Shadow Clones** | Read-heavy VDI — clones "popular" vDisks to local nodes, reduces network I/O |

### ILM (Information Lifecycle Management)
- **Automatic** — no admin config needed
- Moves data between **SSD (performance) ↔ HDD (capacity)** tiers
- Based on I/O frequency — hot data promoted to SSD, cold demoted to HDD
- **Curator** manages the ILM decisions in background scans

---

## Snapshots & Replication

### Snapshot Types

| Type | RPO | Mechanism | Notes |
|---|---|---|---|
| **Async Replication** | **≥ 1 hour** | Schedule-based, crash-consistent | Standard DR |
| **NearSync** | **1–15 min** | Application-consistent, log-based | Low RPO DR |
| **Metro Availability** | **Zero RPO** | Synchronous replication | **Requires <5 ms latency** between sites |

### Metro Availability Key Facts
- **Synchronous writes** — both sites acknowledge before VM gets ACK
- **<5 ms RTT latency** requirement (typically same metro area)
- **Witness VM** required (third site or cloud-hosted) for split-brain
- **Automatic failover** supported

### Protection Domains (PD)
- **Container:** VMs, files, volume groups grouped for protection
- **Async PD:** Schedule-based snapshots + replication to remote site
- **NearSync PD:** Upgraded from async, requires compatible setup
- **Consistency Groups:** Group VMs that must snapshot together (e.g., app + DB)

### Leap (Disaster Recovery)
- **Prism Central managed** — centralized DR orchestration
- **Recovery Plans:** Ordered steps to power on VMs at DR site
- **Network mappings:** Map source networks to target networks
- **Test failover:** Non-disruptive DR testing
- **Categories:** Tag VMs for bulk protection policies

---

## Quick Reference — Troubleshooting

| Symptom | Check |
|---|---|
| Files share not mounting | FSVM status, DNS, AD join, firewall (445/2049) |
| Objects bucket access denied | Access keys, bucket policy, IAM, WORM state |
| High I/O latency | OpLog full? Stargate status? Disk health? ILM thrashing? |
| Replication lag | Cerebro status, bandwidth, schedule config |
| Snapshot failure | Protection domain config, space availability |

---

## Mnemonics

- **Ports:** "**S**omething **C**ool **C**omes **C**lose **Z**ero" = Stargate-Curator-Chronos-Cerebro-Zookeeper = 2009-2010-2011-2020-2181
- **FSVM:** "**3** minimum, **16** max, **4/12** (vCPU/RAM)"
- **Objects:** "**3** workers, **MSP**, **PC only**, **WORM 24hr**"
- **iSCSI:** "thirty-two **sixty**" = **3260** (NOT 3261!)
- **Metro:** "**Zero RPO, <5 ms**"
