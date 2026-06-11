# NCP-CI 6.10 — Cloud Integration (NC2) Cheat Sheet

> **Last-night review** · NC2 on AWS vs Azure · Networking · DR · Cost optimization

---

## NC2 Core Facts (MUST KNOW)

| Parameter | Value |
|---|---|
| **Minimum nodes** | **3** (always) |
| **AZ requirement** | **Same AZ** — nodes cannot span AZs |
| **Cluster type** | **Homogeneous only** — same instance type per cluster |
| **Provisioning tool** | **NC2 Console** (my.nutanix.com) — ⚠️ NOT Foundation |
| **Hypervisor** | **AHV only** (no ESXi in cloud) |
| **Upgrade sequence** | **AOS first → then AHV** (rolling, non-disruptive) |

> ⚠️ **Exam trap:** Foundation is **NOT** used for NC2. Provisioning is done via **NC2 Console (my.nutanix.com)**.

---

## NC2 on AWS

### Instance Types & Storage

| Instance | Storage | Notes |
|---|---|---|
| **i3.metal** | Local NVMe SSDs | ⚠️ **NOT EBS** — local storage only |
| **i3en.metal** | Larger local NVMe | Higher storage density |

> ⚠️ **Exam trap:** NC2 on AWS uses **local NVMe**, NOT EBS. Data is on local instance storage.

### AWS Networking

| Parameter | Value |
|---|---|
| **Subnet minimum** | **/25** (128 IPs) |
| **VPC** | Dedicated VPC recommended |
| **Same AZ** | Required — all nodes in one AZ |

### AWS Internet & Connectivity

| Component | Use |
|---|---|
| **NAT Gateway** | Outbound internet access ⚠️ **NOT NLB** |
| **Direct Connect** | Private dedicated connection to on-prem |
| **Direct Connect + BGP** | Dynamic routing between on-prem and AWS |
| **LAG** | Link Aggregation Group — bundle multiple Direct Connect links |
| **VPN** | IPsec tunnel over public internet (backup/lower cost) |

> ⚠️ **Exam trap:** Outbound internet = **NAT Gateway**, NOT Network Load Balancer (NLB).

### AWS Metadata Backup
- **S3 bucket** — automatic Prism Central + CVM metadata backup to S3

### AWS Security Groups — Key Ports

| Port | Protocol | Purpose |
|---|---|---|
| **9440** | HTTPS | Prism access |
| **2049** | TCP | NFS (Files) |
| **3260** | TCP | iSCSI (Volumes) |

---

## NC2 on Azure

### Infrastructure

| Parameter | Value |
|---|---|
| **Host type** | **BareMetal Infrastructure** (dedicated physical hosts) |
| **Subnet minimum** | **/24** (256 IPs) — ⚠️ larger than AWS /25 |
| **Subnet type** | **Delegated subnet** (dedicated to NC2) |

### Azure Networking (CRITICAL)

| Component | Role |
|---|---|
| **Flow Gateway** | **Overlay-to-underlay bridging** — routes traffic between Nutanix overlay and Azure VNet |
| **ECMP** | Equal-Cost Multi-Path — **max 4 paths** through Flow Gateway |
| **Azure Route Server** | Enables **BGP peering** between Flow Gateway and Azure network |

> ⚠️ **Flow Gateway is required for Azure, NOT needed for AWS.** This is a key differentiator.

### Azure Connectivity

| Component | Use |
|---|---|
| **ExpressRoute** | Private connection to on-prem (like Direct Connect) |
| **ExpressRoute FastPath** | **Bypasses VNet gateway** — lower latency, direct to VMs |
| **ExpressRoute Global Reach** | **Inter-region connectivity** — connect two ExpressRoute circuits |
| **VPN Gateway** | IPsec over internet (backup) |

### Azure Metadata Backup
- **Blob Storage — Hot tier** — automatic metadata backup

---

## AWS vs Azure Comparison Table (EXAM FAVORITE)

| Feature | AWS | Azure |
|---|---|---|
| **Instance type** | i3.metal / i3en.metal | BareMetal Infrastructure |
| **Storage** | Local NVMe (NOT EBS) | Local NVMe |
| **Min subnet** | **/25** | **/24** (larger) |
| **Flow Gateway** | ❌ Not needed | ✅ **Required** |
| **Route exchange** | Direct Connect + BGP | Azure Route Server + BGP |
| **Metadata backup** | S3 | Blob Storage (Hot tier) |
| **Outbound internet** | NAT Gateway | Azure NAT Gateway / Public IP |
| **Private link** | Direct Connect | ExpressRoute |
| **Provisioning** | NC2 Console | NC2 Console |
| **Foundation** | ❌ Not used | ❌ Not used |

---

## Overlay Networking Modes

| Mode | Description | Use Case |
|---|---|---|
| **noNAT** | Direct routing, no address translation | ✅ **Recommended default** |
| **NAT** | Network Address Translation | When IP conflicts exist between on-prem and cloud |
| **L2 Stretch** | VXLAN-based Layer 2 extension | **Live migration** between on-prem ↔ cloud, same broadcast domain |

### Key Overlay Details
- **noNAT:** Simplest, requires no overlapping IPs, full end-to-end visibility
- **NAT:** Solves IP conflicts but adds complexity, breaks some protocols
- **L2 Stretch:** Enables **live VM migration** cloud ↔ on-prem, highest complexity

---

## Direct Connect (AWS) Deep Dive

| Feature | Details |
|---|---|
| **Protocol** | **BGP** for dynamic route exchange |
| **LAG** | Link Aggregation Group — bundle links for more bandwidth |
| **Speeds** | 1 Gbps, 10 Gbps dedicated; 50 Mbps–10 Gbps hosted |
| **Redundancy** | Dual connections recommended (different devices) |
| **VIF types** | Private VIF (VPC), Public VIF (AWS services), Transit VIF (TGW) |

## ExpressRoute (Azure) Deep Dive

| Feature | Details |
|---|---|
| **FastPath** | **Bypasses VNet gateway** — traffic goes direct to VMs, lower latency |
| **Global Reach** | Connect **two ExpressRoute circuits** across regions |
| **Peering** | Private (VNet), Microsoft (M365, Azure PaaS) |
| **Redundancy** | Active-active BGP sessions, zone-redundant gateways |

---

## Node Hibernation

- **Purpose:** **Cost savings** for dev/test environments
- **How:** Shut down NC2 cluster nodes — stop billing for compute
- **Data:** Preserved on local NVMe (nodes not terminated, just stopped)
- **Use case:** Non-production clusters used only during business hours
- **Restart:** Nodes resume, cluster reforms automatically

---

## NC2 Upgrade Sequence

```
Step 1: Upgrade AOS first (rolling — one CVM at a time)
Step 2: Upgrade AHV second (rolling — one host at a time)
```

> **Always AOS before AHV.** Never reverse this order.

---

## Key Security Groups / Firewall Rules

| Port | Direction | Purpose |
|---|---|---|
| **9440** | Inbound | Prism Web Console |
| **2049** | Inbound | NFS (Nutanix Files) |
| **3260** | Inbound | iSCSI (Nutanix Volumes) |
| **443** | Outbound | HTTPS to Nutanix services, updates |
| **80** | Outbound | HTTP redirect |

---

## Quick Recall Mnemonics

- **AWS subnet:** "/25" — **25** IPs per node × ~5 = manageable
- **Azure subnet:** "/24" — needs **more** IPs (delegated, BareMetal)
- **Flow Gateway:** "**F**low for a**Z**ure" — both have Z... well, just remember Azure needs it
- **NAT Gateway not NLB:** "**NAT** = **N**utanix **A**WS ou**T**bound"
- **Upgrade:** "**A**OS then **A**HV" — alphabetical order!
- **Foundation:** "**F**oundation = **F**orbidden in NC2"
