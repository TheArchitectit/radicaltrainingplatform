# NCM-MCI 6.10 — Live Lab Walkthrough Guide

> **Exam format:** 16–20 hands-on lab scenarios · 180 minutes · Real Prism interface  
> **Golden rule:** Read the scenario twice → identify the deliverable → execute → verify before clicking "Next"  
> **CLI access:** SSH to any CVM (port 22, user `nutanix`) — all `acli`/`ncli`/`ncc` commands run from there

---

## Table of Contents

1. [VM Lifecycle Management](#1-vm-lifecycle-management)
2. [Network Configuration](#2-network-configuration)
3. [Storage Container Management](#3-storage-container-management)
4. [Protection Domain & Replication](#4-protection-domain--replication)
5. [Cluster Health & Troubleshooting](#5-cluster-health--troubleshooting)
6. [Security Hardening](#6-security-hardening)
7. [Performance Analysis](#7-performance-analysis)
8. [REST API Operations](#8-rest-api-operations)
9. [Log File Quick Reference](#9-log-file-quick-reference)
10. [Port Reference](#10-port-reference)
11. [Exam-Day Cheat Sheet](#11-exam-day-cheat-sheet)

---

## 1. VM Lifecycle Management

### 1A — Create a VM (Prism Element UI)

| Step | Path / Action |
|------|---------------|
| 1 | **Prism Element → ☰ Menu → VM** |
| 2 | Click **+ Create VM** |
| 3 | **Name:** enter the name given in the scenario |
| 4 | **vCPUs:** set number of sockets + cores per socket |
| 5 | **Memory:** enter value in GiB |
| 6 | Under **Disks**, click **+ Add New Disk** |
| 7 | **Operation:** Clone from Image Service → select the image |
| 8 | **Bus Type:** SCSI (default, best perf) or IDE (if legacy boot needed) |
| 9 | Under **Network Adapters**, click **+ Add New NIC** |
| 10 | Select the VLAN / subnet from dropdown |
| 11 | (Optional) Set a static IP if IPAM is configured |
| 12 | Click **Save** → VM appears in table (powered off) |
| 13 | Select VM → **Actions → Power On** |

### 1B — Create a VM (CLI)

```bash
# Full VM creation pipeline — run from any CVM
acli vm.create MyVM num_vcpus=4 num_cores_per_vcpu=1 memory=8G

# Attach boot disk — clone from an existing image
acli vm.disk_create MyVM clone_from_image=CentOS-8-Cloud bus=scsi

# Add a blank data disk (thin-provisioned)
acli vm.disk_create MyVM create_size=100G container=SelfServiceContainer bus=scsi

# Attach NIC
acli vm.nic_create MyVM network=VLAN-100

# Power on
acli vm.on MyVM
```

### 1C — Snapshot & Clone

```bash
# Create a snapshot
acli vm.snapshot_create MyVM snapshot_name_list=snap-before-patch

# List snapshots
acli vm.snapshot_list MyVM

# Clone from snapshot
acli vm.clone MyVM-Clone donor_vm=MyVM snapshot_uuid=<uuid>
```

**Prism UI path:** VM → select VM → **Actions → Take Snapshot** → name it → Save  
**Clone:** VM → select VM → **Actions → Clone** → adjust name/resources → Save

### 1D — Power Operations

| Action | Prism Path | CLI |
|--------|-----------|-----|
| Power On | VM → Actions → Power On | **`acli vm.on <vm>`** |
| Power Off (guest) | VM → Actions → Guest Shutdown | **`acli vm.shutdown <vm>`** |
| Power Off (force) | VM → Actions → Power Off | **`acli vm.off <vm>`** |
| Reset | VM → Actions → Reset | **`acli vm.reset <vm>`** |
| Pause | VM → Actions → Pause | **`acli vm.pause <vm>`** |
| Resume | — | **`acli vm.resume <vm>`** |

### 1E — Update VM Configuration

```bash
# Hot-add vCPU (if enabled)
acli vm.update MyVM num_vcpus=8

# Hot-add memory (if enabled)
acli vm.update MyVM memory=16G

# Remove a NIC (get MAC first)
acli vm.nic_list MyVM
acli vm.nic_delete MyVM <mac_address>

# Delete a VM (must be powered off)
acli vm.off MyVM
acli vm.delete MyVM
```

### 1F — VM List & Lookup

```bash
# List all VMs
acli vm.list

# Get detailed info on one VM
acli vm.get MyVM

# Find a VM by IP
acli vm.list ip=10.10.10.50

# Show disk details
acli vm.disk_list MyVM
```

> **Lab trap:** If asked to create a VM "with 2 sockets and 2 cores each," that's `num_vcpus=4 num_cores_per_vcpu=2` (total logical = sockets × cores). Don't confuse sockets with total vCPUs.

---

## 2. Network Configuration

### 2A — Create a VLAN Network (Prism UI)

| Step | Path / Action |
|------|---------------|
| 1 | **Prism Element → ☰ → Network Configuration** |
| 2 | Click **+ Create Network** |
| 3 | **Name:** e.g., `Prod-VLAN-200` |
| 4 | **VLAN ID:** enter the number (e.g., 200) |
| 5 | ☑ **Enable IP Address Management** (if scenario requires IPAM) |
| 6 | **Network IP / Prefix:** e.g., `10.10.200.0/24` |
| 7 | **Gateway:** e.g., `10.10.200.1` |
| 8 | **Domain:** (optional) |
| 9 | Under **IP Address Pools**, click **+ Create Pool** |
| 10 | **Start:** `10.10.200.100` → **End:** `10.10.200.200` |
| 11 | (Optional) Set DNS servers |
| 12 | Click **Save** |

### 2B — Create Network (CLI)

```bash
# Network with IPAM (CIDR, pool start, pool end, gateway)
acli net.create Prod-VLAN-200 vlan=200 \
  ip_config=10.10.200.0/24,10.10.200.100,10.10.200.200,10.10.200.1

# Network without IPAM (just VLAN tagging)
acli net.create DMZ-VLAN-300 vlan=300

# List networks
acli net.list

# Get details
acli net.get Prod-VLAN-200

# Delete a network (no VMs may be attached)
acli net.delete Prod-VLAN-200
```

### 2C — OVS Verification & Bond Status

```bash
# Show OVS bridge layout — bridges, ports, interfaces
ovs-vsctl show

# Dump flow rules (useful for troubleshooting traffic)
ovs-ofctl dump-flows br0

# Bond health — shows active-backup or balance-slb
ovs-appctl bond/show br0-up

# List bridges
ovs-vsctl list-br

# Show interface stats
ovs-vsctl list interface eth0
```

### 2D — MTU / Jumbo Frames

```bash
# Change MTU on OVS bridge (all uplinks)
manage_ovs --mtu 9000 --bridge_name br0 update_uplinks

# Verify MTU applied
ifconfig br0 | grep MTU

# Test jumbo frame end-to-end (8972 + 28 header = 9000)
ping -s 8972 -M do 10.10.200.1

# If ping fails → MTU mismatch somewhere in path
```

> **Lab trap:** Jumbo frames must be enabled on EVERY hop — physical switch ports, CVM, hypervisor, and guest NIC. If the scenario mentions "verify jumbo frames," check `ifconfig` output on the CVM AND test with `ping -s 8972 -M do`.

### 2E — Network Troubleshooting Quick Commands

```bash
# ARP table
arp -a

# Check CVM networking
ip addr show
ip route show

# Test connectivity between CVMs
allssh "ping -c 3 10.10.10.1"

# DNS lookup
nslookup prism.nutanix.local
```

---

## 3. Storage Container Management

### 3A — Create a Container (Prism UI)

| Step | Path / Action |
|------|---------------|
| 1 | **Prism Element → ☰ → Storage** |
| 2 | Click **+ Storage Container** |
| 3 | **Name:** e.g., `Gold-Container` |
| 4 | **Max Capacity:** (leave blank for no limit, or set quota) |
| 5 | **Advertised Capacity:** (for thin provisioning visibility) |
| 6 | Under **Advanced Settings:** |
| 7 | ☑ Compression → **Inline** or **Post-process** |
| 8 | ☑ Deduplication → **Post-process** (not inline for random I/O) |
| 9 | ☑ Erasure Coding → enable if ≥ 4 nodes and cold data |
| 10 | **Replication Factor:** RF2 or RF3 |
| 11 | Click **Save** |

### 3B — Container CLI Operations

```bash
# Create container with compression on default storage pool
ncli container create name=Gold-Container \
  sp-name=default-storage-pool-1 \
  compression-enabled=true \
  compression-delay-in-secs=0

# Create container with dedup
ncli container create name=VDI-Container \
  sp-name=default-storage-pool-1 \
  finger-print-on-write=on

# List containers
ncli container ls

# Get details
ncli container get name=Gold-Container

# Edit container (enable erasure coding)
ncli container edit name=Gold-Container erasure-code=on

# Remove a container (must be empty!)
ncli container remove name=Gold-Container

# Storage pool info
ncli storagepool ls
```

### 3C — Disk Operations

```bash
# List all disks
ncli disk ls

# Get details on a specific disk
ncli disk get id=<disk_id>

# Disk status summary
ncli disk list-summary

# Mark disk for removal (starts data migration)
ncli disk mark-for-removal id=<disk_id>

# Check migration progress
ncli disk get id=<disk_id> | grep -i "migration"
```

### 3D — Data Reduction Verification

```bash
# Curator data reduction report
curator_cli display_data_reduction_report

# Container stats (Prism path)
# Prism → Storage → select container → "Usage Summary"
# Look at: Savings, Compression ratio, Dedup ratio

# CLI container stats
ncli container stats name=Gold-Container
```

> **Lab trap:** Erasure coding only works with **RF2**, requires **≥ 4 nodes**, and applies to **cold data** (data not in OpLog/SSD tier). If the scenario says "maximize space savings on cold data" → enable EC.

---

## 4. Protection Domain & Replication

### 4A — Create a Protection Domain

```bash
# Create async DR protection domain
ncli pd create name=DR-PD type=async

# Create metro availability PD (synchronous)
ncli pd create name=Metro-PD type=metro
```

**Prism UI:** Data Protection → + Protection Domain → Async DR → Name → Add VMs → Create Schedule

### 4B — Add VMs to a Protection Domain

```bash
# Add individual VMs
ncli pd add-vms name=DR-PD vm-names=WebServer1,WebServer2,DBServer1

# Verify
ncli pd get name=DR-PD
```

### 4C — Add Replication Schedules

```bash
# Hourly schedule — replicate every 1 hour, keep 24 local, 12 remote
ncli pd add-hourly-schedule name=DR-PD \
  every-nth-hour=1 \
  local-retention=24 \
  remote-retention=12

# Daily schedule — every day, keep 7 local, 7 remote
ncli pd add-daily-schedule name=DR-PD \
  every-nth-day=1 \
  local-retention=7 \
  remote-retention=7

# Minute-level (for low RPO)
ncli pd add-minute-schedule name=DR-PD \
  every-nth-minute=15 \
  local-retention=8 \
  remote-retention=4
```

### 4D — Remote Site Configuration

```bash
# Create remote site — point to the remote cluster VIP
ncli remote-site create name=DR-Site \
  address-list=10.20.0.100

# List remote sites
ncli remote-site ls

# Test connectivity
ncli remote-site test name=DR-Site
```

**Prism UI:** Data Protection → Remote Site → + Remote Site → enter Cluster VIP → Connect

### 4E — Failover Operations

| Scenario | Command | Where to Run |
|----------|---------|-------------|
| **Planned migration** (graceful) | **`ncli pd migrate name=DR-PD remote-site=DR-Site`** | Source site |
| **Unplanned failover** (disaster) | **`ncli pd activate name=DR-PD`** | DR site |
| **Re-protect** after failover | **`ncli pd migrate name=DR-PD remote-site=Primary-Site`** | DR site |

```bash
# List PD snapshots available on the remote site
ncli pd list-snapshots name=DR-PD

# Restore a specific snapshot
ncli pd restore name=DR-PD snapshot-id=<id>

# Deactivate a PD (release VMs, clean up)
ncli pd deactivate name=DR-PD
```

### 4F — Protection Domain Verification

```bash
# Full PD status
ncli pd get name=DR-PD

# Check replication status
ncli pd get-replication-status name=DR-PD

# List all PDs
ncli pd ls
```

> **Lab trap:** For **planned failover** (`migrate`), run on the **source** site — it gracefully shuts down VMs, replicates final delta, then brings VMs up on remote. For **unplanned failover** (`activate`), run on the **DR** site — it forcibly powers on VMs from the last available snapshot. Always verify which site you're SSH'd into!

---

## 5. Cluster Health & Troubleshooting

### 5A — Cluster Status

```bash
# Cluster information (name, version, nodes, VIP)
ncli cluster info

# Cluster service status
ncli cluster status

# Individual host info
ncli host ls

# CVM status across all nodes
cluster status | grep -i "up\|down"
```

### 5B — Service Health

```bash
# Genesis — master service manager (shows all running services)
genesis status

# Specific service restart
genesis restart <service_name>
# Common services: stargate, curator, prism, cerebro, chronos, cassandra

# All-node service check
allssh "genesis status" | grep -i "down\|crash"
```

### 5C — NCC Health Checks

```bash
# Run ALL health checks (takes 15-30 min)
ncc health_checks run_all

# Run a specific check plugin
ncc health_checks network_checks run_all
ncc health_checks hardware_checks run_all
ncc health_checks system_checks run_all
ncc health_checks storage_checks run_all

# View NCC results
ncc health_checks show_checks

# Check NCC version
ncc --version

# Generate NCC report
ncc health_checks run_all --output_type=json
```

### 5D — Log Collection

```bash
# Logbay — collect logs for support upload
logbay collect

# Collect with time range (last 4 hours)
logbay collect --duration_in_hours=4

# Collect for specific service
logbay collect --items=stargate

# Logbay status
logbay status

# Log locations on CVM
ls /home/nutanix/data/logs/
```

### 5E — Prism, Zookeeper, Cassandra

```bash
# Who is the Prism leader?
curl -s http://localhost:9080/PrismGateway/services/rest/v1/cluster/prism_leader

# Zookeeper health (expect: "imok")
echo ruok | nc localhost 2181

# Zookeeper leader election status
echo stat | nc localhost 2181

# Cassandra ring status
nodetool -h 0 ring

# Cassandra node status
nodetool -h 0 status

# Zeus configuration (source of truth for cluster config)
zeus_config_printer

# Edit Zeus (CAUTION — rarely needed in labs)
edit-zeus --editor=vi
```

### 5F — Curator & Stargate

```bash
# Trigger a full Curator scan
curator_cli start_scan type=full

# Trigger a partial scan
curator_cli start_scan type=partial

# Check Curator job history
curator_cli get_job_history

# Data reduction report
curator_cli display_data_reduction_report

# Stargate page (open in browser from CVM IP)
# http://<cvm_ip>:2009 → shows vDisk, OpLog, egroup stats
```

### 5G — Quick Diagnostic Cheat Sheet

| Symptom | First Command | What to Look For |
|---------|---------------|-----------------|
| CVM unreachable | **`ping <cvm_ip>`** then SSH and run **`genesis status`** | Services not started |
| VM won't power on | **`acli vm.get <vm>`** | Check host placement, disk errors |
| Slow storage | **`ncli container stats name=X`** | Latency > 5 ms, IOPS spike |
| Cluster degraded | **`ncli cluster status`** + **`ncc health_checks run_all`** | Node down, metadata ring broken |
| Replication failing | **`ncli pd get-replication-status name=X`** | Bandwidth, remote site unreachable |
| Network issue | **`ovs-vsctl show`** + **`ovs-appctl bond/show br0-up`** | Bond degraded, missing uplink |
| Disk failure | **`ncli disk ls`** → look for `offline` or `to-remove` | Data migration percentage |
| Prism not loading | **`curl -s http://localhost:9080/...prism_leader`** | Leader CVM, then check **`genesis status`** on that CVM |

---

## 6. Security Hardening

### 6A — SSH Lockdown (Cluster Lockdown)

> **Order matters!** Add your SSH public key BEFORE enabling lockdown, or you will be locked out.

```bash
# Step 1: Add SSH public key
ncli cluster add-public-key name=mykey file-path=/home/nutanix/mykey.pub

# Step 2: Enable cluster lockdown
ncli cluster edit-params enable-ssh-lockdown=true

# Verify lockdown status
ncli cluster get-params | grep -i lockdown

# Disable lockdown (if needed)
ncli cluster edit-params enable-ssh-lockdown=false

# Remove SSH key
ncli cluster remove-public-key name=mykey
```

**Prism UI:** ⚙ Settings → Cluster Lockdown → Enable → Upload SSH Key → Save

### 6B — Password & Authentication

```bash
# Change admin password
ncli user edit-password --username=admin --password=NewP@ssw0rd!

# Enable high-strength password policy
ncli cluster edit-cvm-security-params enable-high-strength-password=yes

# List users
ncli user list
```

**Prism UI:** ⚙ Settings → Local User Management → select user → Change Password

### 6C — AIDE (Advanced Intrusion Detection Environment)

```bash
# Enable AIDE on all CVMs
ncli cluster edit-cvm-security-params enable-aide=yes

# Disable AIDE
ncli cluster edit-cvm-security-params enable-aide=no
```

### 6D — SCMA Security Check

```bash
# Run Security Configuration Management Automation
ncc health_checks security_checks scma_check

# View SCMA results
ncc health_checks security_checks scma_check --show_results
```

### 6E — SSL Certificate

**Prism UI path:**

| Step | Action |
|------|--------|
| 1 | **⚙ Settings → SSL Certificate** |
| 2 | Click **Replace Certificate** |
| 3 | Choose: Import Key and Certificate (PEM files) |
| 4 | Upload **Private Key** (.key) |
| 5 | Upload **Certificate** (.crt or .pem) |
| 6 | Upload **CA Certificate / Chain** (if applicable) |
| 7 | Click **Import Files** |
| 8 | Prism restarts — wait 2–3 minutes |

```bash
# CLI approach (apply signed cert)
ncli cluster set-external-ip-address-config \
  external-ip-address-ssl-certificate-path=/path/to/cert.pem \
  external-ip-address-ssl-private-key-path=/path/to/key.pem
```

### 6F — Data-at-Rest Encryption

**Prism UI:** ⚙ Settings → Data at Rest Encryption → Enable → Select KMS type (Local or External) → Configure → Save

```bash
# Check encryption status
ncli cluster get-params | grep -i encrypt
```

### 6G — Data-in-Transit Encryption

```bash
# Enable data-in-transit encryption (cluster-wide)
ncli cluster edit-cvm-security-params enable-data-transit-encryption=yes

# Verify
ncli cluster get-cvm-security-params
```

### 6H — Syslog Forwarding

```bash
# Create syslog server entry (TLS)
ncli cluster create-syslog-server \
  --server-address=10.10.10.50 \
  --port=6514 \
  --protocol=tcp-tls

# Create syslog server (UDP — less secure)
ncli cluster create-syslog-server \
  --server-address=10.10.10.50 \
  --port=514 \
  --protocol=udp

# List configured syslog servers
ncli cluster list-syslog-server

# Delete syslog server
ncli cluster delete-syslog-server id=<id>
```

**Prism UI:** ⚙ Settings → Syslog Server → + Configure Syslog Server → fill in → Save

### 6I — Security Hardening Checklist (Likely Lab Scenarios)

| Task | Status Check |
|------|-------------|
| Enable cluster lockdown | `ncli cluster get-params \| grep lockdown` |
| Set strong password policy | `ncli cluster get-cvm-security-params` |
| Enable AIDE | `ncli cluster get-cvm-security-params \| grep aide` |
| Replace SSL cert | Prism → Settings → SSL Certificate |
| Enable DARE | Prism → Settings → Data at Rest Encryption |
| Enable data-in-transit | `ncli cluster get-cvm-security-params` |
| Configure syslog | `ncli cluster list-syslog-server` |
| Run SCMA | `ncc health_checks security_checks scma_check` |

> **Lab trap:** The question may say "secure the cluster" generically. Follow the principle: SSH key → lockdown → strong passwords → AIDE → syslog → encryption. Always **verify each step** with the corresponding get/list command.

---

## 7. Performance Analysis

### 7A — CPU Performance

**Prism UI:** VM → select VM → **Monitor tab** → **CPU**

| Metric | Healthy | Problem | Action |
|--------|---------|---------|--------|
| CPU Usage | < 80% sustained | > 90% sustained | Add vCPUs or migrate VM |
| CPU Ready Time | < 5% | > 10% | VM contention — spread VMs across hosts |
| CPU Steal Time | ~0% | > 5% | Noisy neighbor — affinity rules |

```bash
# CLI — top-like view for AHV host
top -b -n 1 | head -20

# VM-level CPU from acli
acli vm.get <vm> | grep -i cpu
```

### 7B — Memory Performance

**Prism UI:** VM → select VM → **Monitor tab** → **Memory**

| Metric | Meaning |
|--------|---------|
| **Granted** | Memory allocated to VM by hypervisor |
| **Active** | Memory actively being used |
| **Swapped** | Memory swapped to disk (BAD if high) |
| **Balloon** | Memory reclaimed by balloon driver |

- **Healthy:** Active < Granted, Swapped ≈ 0
- **Problem:** Swapped > 0 and growing → VM needs more memory

### 7C — Storage Performance

**Prism UI:** Storage → select container → **Performance tab**

| Metric | Healthy | Problem |
|--------|---------|---------|
| Read Latency | < 1 ms (SSD) / < 5 ms (HDD) | > 10 ms |
| Write Latency | < 1 ms (SSD) / < 5 ms (HDD) | > 10 ms |
| IOPS | Baseline known | Sudden drop or spike |
| Throughput | Baseline known | Saturated bandwidth |
| Controller IOPS | < 80% max capacity | Near max → add nodes |

```bash
# Stargate 2009 page — per-vDisk I/O (browser)
# http://<cvm_ip>:2009

# Quick storage check
ncli container stats name=Gold-Container
```

### 7D — OpLog Monitoring

The **OpLog** is the write coalescing tier (like a write-back cache on SSD).

```bash
# Check OpLog usage via Stargate page
# http://<cvm_ip>:2009 → "OpLog" section

# If OpLog is full → writes bypass to extent store (higher latency)
# Solution: add SSD capacity or reduce write-heavy VMs on node
```

### 7E — Capacity Planning (Prism Central)

| Step | Path |
|------|------|
| 1 | **Prism Central → Planning → Scenarios** |
| 2 | Click **+ New Scenario** |
| 3 | Select scope (cluster) |
| 4 | **What-If:** Add Workloads → define VM profiles (vCPU, mem, disk, IOPS) |
| 5 | Adjust headroom (recommend 20–30%) |
| 6 | Review runway chart → identifies when resources exhaust |
| 7 | **Recommendation:** add nodes before runway hits 0 |

### 7F — Right-Sizing

```bash
# Prism Central → VMs → select VM → "VM Efficiency" widget
# Shows: Overprovisioned / Underprovisioned / Inactive

# Best practice:
# - Collect ≥ 30 days of utilization data
# - Peak usage × 1.2 (20% headroom) = right-sized value
# - Never shrink below peak observed usage
```

> **Lab trap:** If asked "identify the performance bottleneck," check CPU Ready first (contention), then storage latency (I/O), then memory swap. Report the metric + threshold + recommendation.

---

## 8. REST API Operations

### 8A — Authentication

All Nutanix v3 API calls use **Basic Authentication**:

```bash
# Base64 encode credentials
echo -n "admin:Password123" | base64
# Result: YWRtaW46UGFzc3dvcmQxMjM=

# Use in header
curl -k -H "Authorization: Basic YWRtaW46UGFzc3dvcmQxMjM=" \
  https://<prism_ip>:9440/api/nutanix/v3/vms/list \
  -X POST -d '{"kind":"vm","length":50}'
```

### 8B — List VMs

```bash
curl -k -u admin:Password123 \
  https://<prism_ip>:9440/api/nutanix/v3/vms/list \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "kind": "vm",
    "length": 50,
    "offset": 0
  }'
```

### 8C — Create a VM

```bash
curl -k -u admin:Password123 \
  https://<prism_ip>:9440/api/nutanix/v3/vms \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "spec": {
      "name": "API-VM-01",
      "resources": {
        "num_sockets": 2,
        "num_vcpus_per_socket": 2,
        "memory_size_mib": 4096,
        "disk_list": [{
          "device_properties": {
            "device_type": "DISK",
            "disk_address": { "adapter_type": "SCSI", "device_index": 0 }
          },
          "data_source_reference": {
            "kind": "image",
            "uuid": "<image_uuid>"
          }
        }],
        "nic_list": [{
          "subnet_reference": {
            "kind": "subnet",
            "uuid": "<subnet_uuid>"
          }
        }]
      },
      "cluster_reference": {
        "kind": "cluster",
        "uuid": "<cluster_uuid>"
      }
    },
    "metadata": {
      "kind": "vm"
    }
  }'
```

### 8D — Update (Modify) a VM

> **Critical:** You must GET the VM first, modify the spec, then PUT it back with the **same `spec_version`**.

```bash
# Step 1: GET current VM spec
curl -k -u admin:Password123 \
  https://<prism_ip>:9440/api/nutanix/v3/vms/<vm_uuid> \
  -X GET

# Step 2: Note the "spec_version" from metadata (e.g., 3)
# Step 3: Modify the spec as needed (e.g., change memory)
# Step 4: PUT the modified body back — spec_version MUST match!
curl -k -u admin:Password123 \
  https://<prism_ip>:9440/api/nutanix/v3/vms/<vm_uuid> \
  -X PUT \
  -H "Content-Type: application/json" \
  -d '{ <modified_body_with_matching_spec_version> }'
```

### 8E — Power On a VM via API

```bash
# GET the VM → modify spec.resources.power_state to "ON" → PUT back
# The power_state field in spec.resources controls VM power

# Alternative: Use v2 API for simple power operations
curl -k -u admin:Password123 \
  https://<prism_ip>:9440/api/nutanix/v2.0/vms/<vm_uuid>/set_power_state \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"transition": "ON"}'
```

### 8F — Categories & Filtering

```bash
# Create/assign a category value
curl -k -u admin:Password123 \
  https://<prism_ip>:9440/api/nutanix/v3/categories/Environment/Production \
  -X PUT \
  -H "Content-Type: application/json" \
  -d '{
    "value": "Production",
    "description": "Production environment"
  }'

# List VMs filtered by category
curl -k -u admin:Password123 \
  https://<prism_ip>:9440/api/nutanix/v3/vms/list \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "kind": "vm",
    "filter": "categories.Environment==Production"
  }'
```

### 8G — Image Upload

```bash
# Upload image from URL (note: source_uri NOT source_url!)
curl -k -u admin:Password123 \
  https://<prism_ip>:9440/api/nutanix/v3/images \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "spec": {
      "name": "CentOS-8-Cloud",
      "resources": {
        "image_type": "DISK_IMAGE",
        "source_uri": "https://cloud.centos.org/centos/8/x86_64/images/CentOS-8-GenericCloud-8.4.2105-20210603.0.x86_64.qcow2"
      }
    },
    "metadata": {
      "kind": "image"
    }
  }'
```

### 8H — Task Status & Delete VM

```bash
# Check task status (every API call returns a task_uuid)
curl -k -u admin:Password123 \
  https://<prism_ip>:9440/api/nutanix/v3/tasks/<task_uuid>

# Delete a VM
curl -k -u admin:Password123 \
  https://<prism_ip>:9440/api/nutanix/v3/vms/<vm_uuid> \
  -X DELETE
```

### 8I — API Quick Reference

| Operation | Method | Endpoint | Key Notes |
|-----------|--------|----------|-----------|
| List VMs | POST | `/api/nutanix/v3/vms/list` | Body: `{"kind":"vm"}` |
| Get VM | GET | `/api/nutanix/v3/vms/{uuid}` | Returns full spec |
| Create VM | POST | `/api/nutanix/v3/vms` | Include spec + metadata |
| Update VM | PUT | `/api/nutanix/v3/vms/{uuid}` | **spec_version must match!** |
| Delete VM | DELETE | `/api/nutanix/v3/vms/{uuid}` | VM must be powered off |
| Power On | PUT | `/api/nutanix/v3/vms/{uuid}` | Change `power_state` to `ON` |
| List Images | POST | `/api/nutanix/v3/images/list` | Body: `{"kind":"image"}` |
| Upload Image | POST | `/api/nutanix/v3/images` | Use `source_uri` (not url!) |
| Categories | PUT | `/api/nutanix/v3/categories/{name}/{value}` | Creates or updates |
| Filter VMs | POST | `/api/nutanix/v3/vms/list` | `"filter": "categories.X==Y"` |
| Task Status | GET | `/api/nutanix/v3/tasks/{uuid}` | Check completion/errors |

> **Lab trap:** The v3 API uses `source_uri` — NOT `source_url`. Using the wrong field name is a silent failure. Also, `spec_version` mismatches on PUT will return 409 Conflict.

---

## 9. Log File Quick Reference

| Service | Log Path | What It Shows |
|---------|----------|---------------|
| **Stargate** | `/home/nutanix/data/logs/stargate.INFO` | Storage I/O, vDisk operations, extent store |
| **Curator** | `/home/nutanix/data/logs/curator.INFO` | Background storage tasks, garbage collection, data reduction |
| **Prism** | `/home/nutanix/data/logs/prism_gateway.log` | UI/API requests, authentication, task management |
| **Genesis** | `/home/nutanix/data/logs/genesis.out` | Service startup/shutdown, CVM boot, cluster init |
| **Cerebro** | `/home/nutanix/data/logs/cerebro.INFO` | Replication, protection domains, DR operations |
| **Acropolis** | `/home/nutanix/data/logs/acropolis.out` | VM lifecycle, AHV management, host operations |
| **Cassandra** | `/home/nutanix/data/logs/cassandra/system.log` | Metadata store, ring status, compaction |
| **Zookeeper** | `/home/nutanix/data/logs/zookeeper/zookeeper.log` | Cluster config, leader election, locks |
| **Arithmos** | `/home/nutanix/data/logs/arithmos.INFO` | Stats collection, performance metrics |
| **Chronos** | `/home/nutanix/data/logs/chronos.INFO` | Scheduled tasks, cron-like operations |
| **Ergon** | `/home/nutanix/data/logs/ergon.INFO` | Task framework, async task execution |
| **Hera** | `/home/nutanix/data/logs/hera.INFO` | SSL certificate management |
| **Lazan** | `/home/nutanix/data/logs/lazan.INFO` | Category, policy sync (PC → PE) |
| **Mantle** | `/home/nutanix/data/logs/mantle.INFO` | Network controller |
| **Minerva** | `/home/nutanix/data/logs/minerva_cvm.log` | Files (AFS) service |
| **Pithos** | `/home/nutanix/data/logs/pithos.INFO` | vDisk config management |
| **AHV Host** | `/var/log/libvirt/qemu/<vm_name>.log` | Per-VM hypervisor log (SSH to host) |
| **NCC** | `/home/nutanix/data/logs/ncc-output-latest.log` | Health check results |
| **Logbay** | `/home/nutanix/data/logbay/` | Collected log bundles |

### Quick Log Search Commands

```bash
# Search for errors in a specific log
grep -i "error\|fatal\|exception" /home/nutanix/data/logs/stargate.INFO | tail -20

# Follow a log in real-time
tail -f /home/nutanix/data/logs/prism_gateway.log

# Search across ALL logs
allssh "grep -rl 'ERROR' /home/nutanix/data/logs/*.INFO" 2>/dev/null

# Find recent log entries (last hour)
find /home/nutanix/data/logs/ -name "*.INFO" -mmin -60

# Count errors per service
for log in /home/nutanix/data/logs/*.INFO; do
  echo "$(grep -c ERROR "$log") $log"
done | sort -rn | head -10
```

---

## 10. Port Reference

### CVM Services

| Port | Service | Protocol | Purpose |
|------|---------|----------|---------|
| **22** | SSH | TCP | CVM remote access |
| **80** | HTTP redirect | TCP | Redirects to Prism (443) |
| **443** | Prism Element | TCP | Web UI & API (HTTPS) |
| **2009** | Stargate | TCP | Storage I/O service (admin page) |
| **2010** | Stargate | TCP | Storage I/O data path |
| **2020** | Curator | TCP | Background storage maintenance |
| **2027** | Chronos | TCP | Task scheduling |
| **2036** | Ergon | TCP | Task management framework |
| **2100** | Cerebro | TCP | Replication / DR |
| **3000** | Arithmos | TCP | Stats & analytics |
| **3001** | Catalog | TCP | Image catalog service |
| **5051** | Acropolis | TCP | VM management |
| **7777** | Dynamic Port Alloc | TCP | Dynamic service allocation |
| **9080** | Prism Gateway (int) | TCP | Internal Prism proxy |
| **9090** | Prism (Multicluster) | TCP | Prism Central communication |
| **9161** | Hera | TCP | SSL/certificate management |
| **9440** | Prism (external) | TCP | External API endpoint |

### Infrastructure Ports

| Port | Service | Protocol | Purpose |
|------|---------|----------|---------|
| **2181** | Zookeeper | TCP | Cluster configuration store |
| **2888** | Zookeeper (peer) | TCP | ZK peer communication |
| **3888** | Zookeeper (election) | TCP | ZK leader election |
| **7000** | Cassandra (inter-node) | TCP | Metadata replication |
| **9042** | Cassandra (CQL) | TCP | Metadata client queries |
| **9160** | Cassandra (Thrift) | TCP | Legacy metadata interface |

### External / Network Ports

| Port | Service | Protocol | Purpose |
|------|---------|----------|---------|
| **25** | SMTP | TCP | Alert email delivery |
| **53** | DNS | UDP/TCP | Name resolution |
| **123** | NTP | UDP | Time synchronization |
| **162** | SNMP Trap | UDP | SNMP trap receiver |
| **443** | LDAP/S | TCP | Directory authentication |
| **514** | Syslog (UDP) | UDP | Log forwarding |
| **636** | LDAPS | TCP | Secure LDAP |
| **6514** | Syslog (TLS) | TCP | Secure log forwarding |
| **8443** | iLO / IPMI | TCP | Hardware management |

### Quick Port Test Commands

```bash
# Test if a port is listening locally
netstat -tlnp | grep <port>

# Test remote port connectivity
nc -zv <remote_ip> <port>

# Check all Nutanix service ports
netstat -tlnp | grep -E "2009|2020|2100|5051|9440|2181"
```

---

## 11. Exam-Day Cheat Sheet

### First 5 Minutes — Orientation

1. Open Prism Element → note Cluster Name, VIP, node count
2. SSH to CVM: `ssh nutanix@<cvm_ip>`
3. Run: **`ncli cluster info`** → confirm AOS version, RF, node count
4. Run: **`ncli cluster status`** → all nodes should show as healthy
5. Run: **`genesis status`** → all services should be running

### Critical "Verify Your Work" Commands

After **every** lab task, verify before moving to the next scenario:

| After Creating… | Verify With |
|-----------------|-------------|
| VM | `acli vm.list` + check in Prism VM page |
| Network | `acli net.list` + Prism Network page |
| Container | `ncli container ls` |
| Protection Domain | `ncli pd ls` + `ncli pd get name=X` |
| Syslog server | `ncli cluster list-syslog-server` |
| Lockdown | `ncli cluster get-params \| grep lockdown` |
| Replication schedule | `ncli pd get name=X` → schedules section |
| Remote site | `ncli remote-site ls` |

### Time Management

| Labs | Minutes Each | Strategy |
|------|-------------|----------|
| 16–20 tasks | ~9–11 min each | Don't spend > 12 min on any single task |
| Easy tasks (VM create, network) | ~5 min | Do these first, bank time |
| Medium tasks (PD, security) | ~10 min | Systematic, follow checklist |
| Hard tasks (API, troubleshoot) | ~15 min | Use banked time from easy tasks |

### Common Mistakes to Avoid

| Mistake | Prevention |
|---------|-----------|
| Wrong cluster/site for failover | Always check: `ncli cluster info` |
| Lockdown without SSH key | **Add key FIRST, then enable lockdown** |
| API spec_version mismatch | Always GET before PUT, use returned version |
| VM won't start — no disk | Verify disk attached: `acli vm.disk_list <vm>` |
| Network not in IPAM | Enable IP Address Management when creating |
| `source_url` instead of `source_uri` | It's always **`source_uri`** in v3 API |
| Forgot to power off before delete | `acli vm.off <vm>` then `acli vm.delete <vm>` |
| Container not empty on delete | Migrate VMs/vDisks first |

### AOS CLI Tool Summary

| Tool | Purpose | Example |
|------|---------|---------|
| **`acli`** | Acropolis CLI — VMs, networks, images | `acli vm.list` |
| **`ncli`** | Nutanix CLI — cluster, containers, PDs, users | `ncli cluster info` |
| **`ncc`** | Nutanix Cluster Check — health checks | `ncc health_checks run_all` |
| **`allssh`** | Run command on all CVMs | `allssh "genesis status"` |
| **`logbay`** | Log collection | `logbay collect` |
| **`curator_cli`** | Curator operations | `curator_cli display_data_reduction_report` |
| **`zeus_config_printer`** | Zeus config dump | `zeus_config_printer` |
| **`nodetool`** | Cassandra operations | `nodetool -h 0 ring` |
| **`manage_ovs`** | OVS management | `manage_ovs --mtu 9000 ... update_uplinks` |

---

*Generated for NCM-MCI 6.10 exam preparation. Verify all commands against your specific AOS version in the lab environment. Command syntax may vary slightly between AOS releases.*
