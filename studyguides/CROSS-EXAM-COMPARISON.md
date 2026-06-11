# Cross-Exam Comparison Reference Chart

> **Purpose:** Side-by-side comparison tables for topics that span multiple Nutanix exams.
> These are the areas most likely to cause confusion on exam day.
>
> **Covers:** NCP-MCI (6.5) · NCS (6.5) · NCP-DB · NCP-AI

---

## 1. NC2 on AWS vs NC2 on Azure

| Feature | AWS | Azure |
|---|---|---|
| **Instance type** | i3.metal / i3en.metal | BareMetal Infrastructure |
| **Storage** | Local NVMe (**NOT** EBS) | Local NVMe |
| **Min subnet** | /25 | /24 (delegated) |
| **Metadata backup** | S3 | Blob Storage Hot tier |
| **Flow Gateway** | **NOT** required | **REQUIRED** (overlay-to-underlay) |
| **Outbound internet** | NAT Gateway (**NOT** NLB) | Azure routing |
| **Connectivity** | Direct Connect (BGP, LAG) | ExpressRoute (FastPath, Global Reach) |
| **Route propagation** | VPC route tables | Azure Route Server + BGP |
| **Overlay modes** | N/A | noNAT, NAT, L2 stretch |
| **Provisioning** | NC2 Console (my.nutanix.com) | NC2 Console (my.nutanix.com) |
| **Foundation** | **NOT** used | **NOT** used |

> **Exam trap:** NC2 uses local NVMe on *both* clouds — never EBS, never managed disks.
> Flow Gateway is Azure-only.

---

## 2. Files vs Objects vs Volumes

| Feature | Files | Objects | Volumes |
|---|---|---|---|
| **Protocol** | SMB / NFS | S3 (REST) | iSCSI |
| **Min instances** | 3 FSVMs | 3 worker nodes | N/A (Volume Groups) |
| **Management** | Prism Element | Prism Central **only** | Prism Element |
| **Max instances** | 16 FSVMs | Scales via MSP | N/A |
| **Resources per** | 4 vCPU / 12 GB RAM | MSP Kubernetes | N/A |
| **WORM support** | Yes (legal hold) | Yes (24 hr grace) | No |
| **Key log** | minerva_nvm.log | N/A | N/A |
| **Port** | 2049 (NFS), 445 (SMB) | 443 (HTTPS) | 3260 (iSCSI) |
| **Use case** | File shares, home dirs | Backup target, archival | Database, shared disk |

> **Exam trap:** Objects is managed from Prism Central only — never PE.
> Files WORM has legal hold; Objects WORM has a 24-hour grace period.

---

## 3. Replication Types Comparison

| Feature | Async | NearSync | Metro (Sync) |
|---|---|---|---|
| **RPO** | Snapshot interval (1 hr+) | 1–15 minutes | Zero |
| **Latency req** | None specific | < 5 ms | < 5 ms |
| **Technology** | Snapshot-based | Lightweight snapshots (vStore) | Synchronous writes |
| **Failover** | Manual (`ncli pd activate`) | Manual | Automatic possible |
| **License** | Standard | Standard | Metro Availability |
| **Witness** | Not required | Not required | **Required** |
| **Use case** | DR, compliance | Near-real-time DR | Mission-critical apps |

> **Exam trap:** NearSync and Metro both need < 5 ms latency.
> Metro requires a witness VM; Async/NearSync do not.
> NearSync uses lightweight snapshots, not traditional snapshots.

---

## 4. GPU Card Comparison (NCP-AI)

| GPU | VRAM | MIG | NVLink | Best For |
|---|---|---|---|---|
| **T4** | 16 GB | No | No | Inference, small models |
| **L40S** | 48 GB | No | No | Inference, medium models |
| **A100** | 40/80 GB | Yes (7 instances) | Yes | Training + inference |
| **H100** | 80 GB | Yes | Yes (4.0, 900 GB/s) | Large-scale training, FP8 |

> **Exam trap:** Only A100 and H100 support MIG (multi-instance GPU).
> T4 and L40S are inference-focused — no MIG, no NVLink.

---

## 5. Model Format Comparison (NCP-AI)

| Format | Supported by NAI | Notes |
|---|---|---|
| SafeTensors | ✅ Yes | Default, safe serialization |
| GPTQ | ✅ Yes | Post-training quantization |
| AWQ | ✅ Yes | Activation-aware quantization |
| GGUF | ❌ No (for exam) | vLLM has experimental support only |

> **Exam trap:** GGUF is **not** considered supported for exam purposes.
> SafeTensors is the default/preferred format.

---

## 6. Quantization Memory Requirements

| Method | Bytes/Param | 7B Model | 13B Model | 70B Model |
|---|---|---|---|---|
| **INT4** | 0.5 | 3.5 GB | 6.5 GB | 35 GB |
| **INT8** | 1.0 | 7 GB | 13 GB | 70 GB |
| **FP16 / BF16** | 2.0 | 14 GB | 26 GB | 140 GB |
| **FP32** | 4.0 | 28 GB | 52 GB | 280 GB |

> **Quick formula:** `VRAM needed = Parameters × Bytes/Param`
>
> **Exam scenario:** "Can a T4 (16 GB) run a 7B FP16 model?" → 7B × 2 = 14 GB → Yes, barely.
> "Can a T4 run a 13B FP16 model?" → 13B × 2 = 26 GB → No, need L40S (48 GB).

---

## 7. CVM Service Reference

| Service | Port | Function | Log File |
|---|---|---|---|
| **Stargate** | 2009 | Storage I/O | stargate.INFO |
| **Curator** | 2010 | Background optimization | curator.INFO |
| **Chronos** | 2011 | Job scheduling | chronos.INFO |
| **Cerebro** | 2020 | Replication | cerebro.INFO |
| **Zookeeper** | 2181 | Config coordination | zookeeper.out |
| **Prism** | 9080 / 9440 | Web UI / API | prism_gateway.log |
| **Genesis** | N/A | Service watchdog | genesis.out |

> **Memory aid:** Ports are sequential — Stargate 2009, Curator 2010, Chronos 2011 — then Cerebro jumps to 2020.
> Genesis has no port — it's the watchdog that starts everything else.

---

## 8. Bond Modes

| Mode | Switch Config | Load Balancing | Failover |
|---|---|---|---|
| **active-backup** | None (default) | No | Yes |
| **balance-slb** | None | Yes (switch-independent) | Yes |
| **LACP (802.3ad)** | **Required** | Yes | Yes |

> **Exam trap:** active-backup is the Nutanix default. balance-slb gives load balancing without switch configuration. LACP is the only mode that requires switch-side configuration.

---

## 9. Flow Security Policy Priority

| Priority | Policy Type | Scope |
|---|---|---|
| 1 (highest) | **Quarantine** | Compromised VMs |
| 2 | **Isolation** | Ring-fencing environments |
| 3 | **Application** | Micro-segmentation tiers |
| 4 (lowest) | **Default** | Catch-all baseline |

| Mode | Behavior |
|---|---|
| **Monitor** | Logs traffic only — no enforcement |
| **Apply** | Active enforcement — blocks violations |

> **Exam trap:** Quarantine always wins. A quarantined VM is blocked even if an Application policy would allow the traffic. Always start with Monitor mode before switching to Apply.

---

## 10. Compression Modes

| Setting | Type | Engine | Best For |
|---|---|---|---|
| **delay=0** | Inline | LZ4 | Sequential writes |
| **delay>0** | Post-process | Curator-driven | Random writes |

> **Exam trap:** Inline (delay=0) compresses at write time using LZ4.
> Post-process (delay>0) lets Curator compress later — better for random I/O workloads.
> Deduplication is always post-process, never inline.

---

## 11. Key CLI Tool Reference

Quick lookup: **task → exact command**

### Cluster & Node Operations

| Task | Command |
|---|---|
| Check cluster health | `ncc health_checks run_all` |
| Check cluster status | `cluster status` |
| Start cluster | `cluster start` |
| Stop cluster (graceful) | `cluster stop` |
| Destroy cluster | `cluster destroy` |
| Check CVM services | `genesis status` |
| Restart a CVM service | `genesis restart <service>` |
| List hosts | `ncli host ls` |
| Check hypervisor | `ncli host get-hypervisor-info` |

### Storage

| Task | Command |
|---|---|
| List storage containers | `ncli ctr ls` |
| Create storage container | `ncli ctr create name=<name> sp-name=<pool>` |
| List storage pools | `ncli sp ls` |
| Check disk status | `ncli disk ls` |
| Mark disk for removal | `ncli disk mark-for-removal id=<id>` |

### VM & Snapshot

| Task | Command |
|---|---|
| List VMs | `acli vm.list` |
| Get VM info | `acli vm.get <vm-name>` |
| Power on VM | `acli vm.on <vm-name>` |
| Create snapshot | `acli snapshot.create <vm-name> snapshot_name_list=<name>` |
| List protection domains | `ncli pd ls` |
| Activate protection domain | `ncli pd activate name=<pd-name>` |

### Networking

| Task | Command |
|---|---|
| List virtual switches | `acli net.list` |
| Get network info | `acli net.get <network-name>` |
| List Flow policies | Via Prism Central (no CLI) |

### Files & Objects

| Task | Command |
|---|---|
| Files share list | `afs share.list` |
| Files FSVM status | `afs info.fsvm_status` |
| Objects (all operations) | Prism Central UI or API |

### NDB (NCP-DB)

| Task | Command |
|---|---|
| Register DB server | NDB UI → Database Server VMs → Register |
| Provision database | NDB UI → Databases → Provision |
| Create SLA | NDB UI → SLAs → Create |
| Time machine operations | NDB UI → Time Machines |

### Prism Central

| Task | Command |
|---|---|
| PC CLI interface | `nuclei` |
| List categories | `nuclei category.list` |
| List VMs from PC | `nuclei vm.list` |

---

## Quick-Reference: "Which Exam?" Decision Matrix

| Topic | NCP-MCI 6.5 | NCS 6.5 | NCP-DB | NCP-AI |
|---|---|---|---|---|
| AOS / AHV core | ✅ Deep | ✅ Deep | ✅ Basic | ✅ Basic |
| NC2 (AWS + Azure) | ✅ | ✅ | ❌ | ❌ |
| Files / Objects / Volumes | ✅ | ✅ | ❌ | ❌ |
| Flow / Microsegmentation | ✅ | ✅ | ❌ | ❌ |
| Replication / DR | ✅ | ✅ | ✅ (NDB SLAs) | ❌ |
| NDB (Era) | ❌ | ❌ | ✅ Deep | ❌ |
| GPU passthrough / vGPU | ✅ Basic | ❌ | ❌ | ✅ Deep |
| NAI / LLM serving | ❌ | ❌ | ❌ | ✅ Deep |
| Kubernetes (NKE) | ✅ Basic | ❌ | ❌ | ✅ (GPT-in-a-Box) |
| Prism Central / Calm | ✅ | ✅ | ❌ | ❌ |
| Security hardening | ✅ | ✅ Deep | ❌ | ❌ |
| Networking (AHV) | ✅ | ✅ Deep | ✅ Basic | ✅ Basic |

---

*Last updated: 2025 · Covers NCP-MCI 6.5 · NCS 6.5 · NCP-DB · NCP-AI*
