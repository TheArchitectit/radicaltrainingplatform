# NCM-MCI 6.10 — Master Multicloud Infrastructure Cheat Sheet

> ⚠️ **THIS IS A LIVE LAB EXAM** — 16–20 hands-on scenarios, 180 minutes, real Prism + CLI
> You MUST be able to type these commands from memory. No reference docs in the exam.

---

## CVM Services (MUST MEMORIZE)

| Service | Port | Role |
|---|---|---|
| **Genesis** | — | **Watchdog** — starts/monitors all other services, first to start |
| **Zeus** | 2181 (ZK) | **Config DB** — Zookeeper-backed, Paxos consensus, cluster config |
| **Medusa** | — | **Metadata** — interface to Cassandra (distributed metadata store) |
| **Cassandra** | — | Distributed key-value store backing Medusa |
| **Stargate** | **2009** | **I/O Manager** — all VM disk I/O, NFS/iSCSI/SMB serving |
| **Curator** | **2010** | **Background tasks** — garbage collection, ILM, scrubbing, EC |
| **Cerebro** | **2020** | **Replication** — DR, snapshots, protection domains |
| **Uhura** | — | **vCenter integration** — proxy for ESXi management tasks |
| **Chronos** | **2011** | **Scheduler** — job scheduling for background tasks |
| **Prism** | **9440** | Web UI — management console (Element + Central) |
| **Zookeeper** | **2181** | Consensus service — Paxos, leader election |

---

## CLI Commands — CVM Utilities

### Cluster & Service Management

```bash
# Cluster status
cluster status                    # Overall cluster health
cluster start / stop / restart    # Cluster operations

# Genesis (watchdog)
genesis restart                   # Restart all services via Genesis
genesis status                    # Show Genesis service status

# Zeus configuration
zeus_config_printer               # Dump entire cluster config (JSON)

# vDisk config
vdisk_config_printer              # Print vDisk configurations

# Curator
curator_cli display_data          # Show Curator scan results and data

# Cassandra / Medusa
nodetool -h 0 ring               # Show Cassandra ring (node membership)
nodetool -h 0 status             # Show Cassandra node status

# Log collection
logbay collect                    # Collect all logs into a bundle (support)
```

---

## acli Commands (AHV CLI — VM Management)

```bash
# VM operations
acli vm.create <name> num_vcpus=<n> memory=<MB>
acli vm.update <name> num_vcpus=<n> memory=<MB>
acli vm.list                      # List all VMs
acli vm.delete <name>
acli vm.power_on <name>
acli vm.power_off <name>

# VM disks
acli vm.disk_create <vm> create_size=<GB>G container=<container>
acli vm.disk_create <vm> clone_from_image=<image_name>
acli vm.disk_create <vm> cdrom=true clone_from_image=<iso>

# VM networking
acli vm.nic_create <vm> network=<net_name> [ip=<ip>]

# Snapshots
acli vm.snapshot_create <vm> snapshot_name=<name>
acli vm.snapshot_list <vm>

# Networking
acli net.create <name> vlan=<id> ip_config=<cidr>
acli net.list
acli net.update <name> ip_config=<cidr>
```

---

## ncli Commands (Nutanix CLI — Cluster/Storage)

```bash
# Cluster
ncli cluster info                 # Cluster name, ID, version
ncli cluster status               # Node status, services
ncli cluster get-params           # Cluster parameters

# Containers
ncli container create name=<name> rf=<2|3>
ncli container ls                 # List all containers
ncli container edit name=<name> compression-enabled=true

# Disks
ncli disk ls                      # List all disks (SSD/HDD)

# Protection Domains
ncli pd create name=<name>
ncli pd add-vms name=<pd> vm-names=<vm1>,<vm2>
ncli pd migrate name=<pd>         # Migrate PD to remote
ncli pd activate name=<pd>        # Activate PD at DR site

# Remote sites
ncli remote-site create name=<name> address-list=<ip>

# Security
ncli cluster edit-params enable-ssh-lockdown=true
ncli cluster add-public-key name=<keyname> file-path=<path>

# Alerts & health
ncli alert ls
ncli health-check run
```

---

## v3 API Reference (REST)

### Key Rules

| Rule | Detail |
|---|---|
| **List/Create** | **POST** (yes, POST for listing too!) |
| **Update** | **PUT** — ⚠️ **requires `spec_version`** from GET |
| **Auth** | **Basic Auth** (base64 user:pass) |
| **Base URL** | `https://<PC_IP>:9440/api/nutanix/v3/` |
| **List endpoint** | `/api/nutanix/v3/vms/list` (POST with filter body) |
| **Image source** | **`source_uri`** ⚠️ NOT `source_url` |
| **Category filter** | `categories.Key==Value` |

### Common API Calls

```bash
# List VMs
POST /api/nutanix/v3/vms/list
Body: {"kind": "vm", "length": 50}

# Get VM
GET /api/nutanix/v3/vms/{uuid}

# Create VM
POST /api/nutanix/v3/vms
Body: {"spec": {...}, "metadata": {"kind": "vm"}}

# Update VM (MUST include spec_version!)
PUT /api/nutanix/v3/vms/{uuid}
Body: {"spec": {...}, "metadata": {"kind": "vm", "spec_version": 2}}

# List images
POST /api/nutanix/v3/images/list
Body: {"kind": "image"}

# Create image (note: source_uri NOT source_url)
POST /api/nutanix/v3/images
Body: {"spec": {"resources": {"source_uri": "http://..."}}}
```

> ⚠️ **Three API traps:** (1) POST for list, (2) PUT needs spec_version, (3) source_**uri** not source_**url**

---

## Log File Locations

| Log | Path | Service |
|---|---|---|
| **Stargate** | `/home/nutanix/data/logs/stargate.INFO` | I/O operations |
| **Genesis** | `/home/nutanix/data/logs/genesis.out` | Service startup/watchdog |
| **Prism** | `/home/nutanix/data/logs/prism_gateway.log` | Web UI / API |
| **Cerebro** | `/home/nutanix/data/logs/cerebro.INFO` | Replication/DR |
| **Curator** | `/home/nutanix/data/logs/curator.INFO` | Background tasks |
| **Libvirt/QEMU** | `/var/log/libvirt/qemu/` | VM hypervisor logs (AHV) |
| **System** | `/var/log/messages` | OS-level syslog |
| **NCC** | `ncc-output-latest.log` | Health check results |
| **LCM** | `lcm/lcm_ops.log` | Life Cycle Manager operations |

---

## OVS Networking Commands

```bash
# View OVS configuration
ovs-vsctl show                    # Show bridges, ports, interfaces
ovs-ofctl dump-flows br0          # Show flow rules on br0

# Bridge & bond status
manage_ovs --bridge_status        # Show bridge status
ovs-appctl bond/show              # Show bond member status

# MTU / Jumbo frames
manage_ovs --mtu 9000             # Set MTU to 9000 (jumbo)
ping -s 8972 -M do <target_ip>    # Test jumbo frames (8972 + 28 header = 9000)
```

> **Jumbo frame test:** `ping -s 8972 -M do` — the `-M do` flag = **don't fragment**, proves 9000 MTU end-to-end.

---

## Bond Modes

| Mode | Switch Config | Notes |
|---|---|---|
| **active-backup** | None needed | ✅ **Default**, simple failover |
| **balance-slb** | None needed | Source-MAC load balancing, switch-independent |
| **LACP (802.3ad)** | ⚠️ **Requires switch config** | Best throughput, requires switch LACP support |

---

## Flow Microsegmentation

### Policy Priority (Highest → Lowest)

```
1. Quarantine     (highest priority — isolate compromised VMs)
2. Isolation      (separate environments)
3. Application    (app-tier rules)
4. Default        (lowest — catch-all)
```

### Flow Key Facts

| Fact | Detail |
|---|---|
| **Encapsulation** | **Geneve** — ~50–54 bytes overhead |
| **Modes** | **Monitor** (log only) vs **Apply** (enforce) |
| **Categories** | Tag VMs with key:value pairs, policies reference categories |
| **Quarantine** | Strict (no traffic) or Forensic (limited access for investigation) |
| **Stateful** | Return traffic auto-allowed for permitted flows |

> **Always test in Monitor mode first, then switch to Apply.**

---

## Security Features

| Feature | Details |
|---|---|
| **SCMA** | Security Configuration Management Automation — automated hardening |
| **KMIP** | Key Management Interoperability Protocol — external key management |
| **Cluster Lockdown** | Disable password SSH, key-only access: `ncli cluster edit-params enable-ssh-lockdown=true` |
| **AIDE** | Advanced Intrusion Detection Environment — file integrity monitoring |
| **Data-at-Rest Encryption** | **AES-256**, software or SED (Self-Encrypting Drives) |
| **Data-in-Transit Encryption** | TLS for inter-CVM, inter-cluster communication |

---

## Storage Performance Tuning

### Compression

| Setting | Type | When |
|---|---|---|
| `delay=0` | **Inline (LZ4)** | Write-time compression, low overhead, recommended default |
| `delay>0` | **Post-process** | Compress later, better ratios, heavier CPU |

### QoS
- **Per-VM IOPS throttling** — set max IOPS per virtual disk
- Configured in VM disk settings (Prism or acli)

### CPU Ready Time
| Value | Meaning |
|---|---|
| **< 10%** | ✅ Acceptable — VM getting CPU time |
| **> 10%** | ⚠️ **Contention** — VM waiting for CPU, add capacity or reduce VMs |

### Memory Metrics
| Metric | Meaning |
|---|---|
| **Active** | Memory currently in use by guest OS |
| **Granted** | Memory allocated by hypervisor to VM |
| **Swapped** | Memory moved to disk — ⚠️ **performance problem** |
| **Balloon driver** | Reclaims idle memory from VMs for hypervisor reallocation |

---

## Quick Lab Survival Guide

### First 5 Minutes of Exam
1. Open **Prism Central** — bookmark it
2. SSH to a CVM — verify connectivity
3. Run `cluster status` — confirm all services UP
4. Run `ncli cluster info` — note cluster name, version

### Common Lab Tasks Checklist
- [ ] Create VM with specific vCPU/RAM/disk
- [ ] Attach VM to network, configure IP
- [ ] Create storage container with compression
- [ ] Configure protection domain + remote site
- [ ] Set up async replication schedule
- [ ] Create/modify Flow security policy
- [ ] Enable cluster lockdown
- [ ] Use API to list/create resources
- [ ] Troubleshoot network with OVS commands
- [ ] Collect logs with logbay

### Time Management
- **180 min ÷ 18 scenarios ≈ 10 min each**
- Skip stuck scenarios — come back later
- Read the ENTIRE question before typing
- **Double-check before submitting** — no undo

---

## Mnemonics

- **CVM boot order:** "**G**od **Z**eus **M**ade **S**tars **C**lose **C**lose **U**p **C**hronos" = Genesis → Zeus/ZK → Medusa/Cassandra → Stargate → Curator → Cerebro → Uhura → Chronos
- **Flow priority:** "**QIAD**" = Quarantine → Isolation → Application → Default
- **Bond modes:** "**ABC**" = Active-backup, Balance-slb, LACP (switch complexity increases left to right)
- **API traps:** "**POST-list, PUT-specver, URI-not-URL**"
- **Jumbo test:** "**8972 don't fragment**" = `ping -s 8972 -M do`
- **CPU ready:** "**10% = the line**" — below good, above bad
