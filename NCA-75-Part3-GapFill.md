# NCA 7.5 Beta Practice Questions – Gap Fill, Sequence & What's New

## Section A: What's New in AOS 7.5 / AHV 11 / PC 7.5

---

### Q1
Which feature became the default for new all-flash deployments in AOS 7.5, replacing the legacy extent store metadata path?
- A) Information Lifecycle Management (ILM)
- B) Autonomous Extent Store (AES)
- C) Unified Cache
- D) Shadow Clones

**Answer: B**
Autonomous Extent Store (AES) is the new default for all new all-flash deployments and is automatically enabled for qualifying hybrid clusters during upgrade to AOS 7.5. AES uses primarily local metadata for more efficient sustained write performance. Do not confuse with AES-256 encryption.

---

### Q2
What new security feature in AOS 7.5 allows VMs to use a virtual Trusted Platform Module backed by an external Key Management Service?
- A) BitLocker integration
- B) vTPM + External KMS
- C) Self-Encrypting Drives (SED)
- D) Prism Central SSL offloading

**Answer: B**
vTPM (virtual Trusted Platform Module) with external KMS integration is new in AOS 7.5. It requires a third-party KMIP-based Key Management Service and enables guest OS features that require a TPM, such as Windows 11 compatibility and BitLocker.

---

### Q3
In AOS 7.5, what is the default SSH access state for CVMs on fresh installations?
- A) SSH enabled with password auth
- B) SSH enabled with key-based auth only
- C) SSH disabled by default
- D) SSH requires Prism Central approval

**Answer: A**
Per GA documentation for AOS 7.5, SSH/Bash shell access remains **enabled by default** on fresh installations. The engineering plan to disable SSH by default was deferred to a subsequent Nutanix Cloud Infrastructure (NCI) feature release after 7.5. Administrators can still restrict CVM SSH access as a hardening measure after deployment.

---

### Q4
Which new AOS 7.5 feature allows administrators to define ordered boot sequences for VMs during HA restart events?
- A) VM Host Affinity
- B) VM Startup Policies
- C) Anti-Affinity Groups
- D) Protection Domain Startup Order

**Answer: B**
VM Startup Policies, new in AOS 7.5, define the order in which VMs start during HA restart events. This is critical for multi-tier applications where components must start in a specific sequence (e.g., database before application server).

---

### Q5
What is Elastic VM Storage in AOS 7.5?
- A) VMs that automatically resize their vDisks based on demand
- B) VMs can consume storage from a different cluster within the same Prism Central domain
- C) Storage containers that expand automatically when full
- D) Dynamic RAM allocation for VM storage caches

**Answer: B**
Elastic VM Storage allows VMs to use storage resources from a different Nutanix cluster within the same Prism Central domain. This provides flexibility for capacity planning and workload distribution across clusters without requiring cross-cluster live migration.

---

### Q6
Which new Prism Central feature in 7.5 provides an upgrade orchestrator for air-gapped / dark site environments?
- A) LCM Offline Sync
- B) LCM DUO (Dark Site Upgrade Orchestrator)
- C) Nutanix Central On-Premises
- D) Prism Central Air-Gap Manager

**Answer: B**
LCM DUO (Dark Site Upgrade Orchestrator) in Prism Central manages the complete upgrade workflow for air-gapped environments, streamlining the process of staging, validating, and applying updates in dark sites using the MCL (Multi-Cluster LCM) framework.

---

### Q7
Starting with AOS 7.5, what architectural change occurred regarding AHV versioning?
- A) AHV is now bundled more tightly with AOS releases
- B) AHV 11 is released independently from AOS with its own lifecycle
- C) AHV is now only available through Prism Central
- D) AHV has been replaced by ESXi as the default hypervisor

**Answer: B**
AHV 11.0 is a significant architectural change — it is released independently from AOS with its own lifecycle and version track. Previously AHV was bundled with AOS releases. This allows independent updates of the hypervisor and storage platform.

---

### Q8
Which new backup destination is supported by Prism Central backup in AOS 7.5?
- A) Amazon EFS
- B) S3-compatible object stores (Wasabi, Backblaze, OVHcloud)
- C) Azure Blob Storage only
- D) NFSv3 shares only

**Answer: B**
Prism Central backup in AOS 7.5 supports S3-compatible object stores including Wasabi, Backblaze, and OVHcloud. This integrates with KMS for encrypted backup and provides a single recovery point for PC restoration.

---

### Q9
Which network protocol support was added to AHV 11?
- A) Fibre Channel
- B) IPv6 dual-stack
- C) InfiniBand
- D) Token Ring

**Answer: B**
AHV 11 adds IPv6 dual-stack support for AHV hosts, enabling both IPv4 and IPv6 addressing simultaneously. This is important for environments transitioning to IPv6 or requiring IPv6 compliance.

---

### Q10
How many fault domains are supported for multisite DR in PC 7.5?
- A) 2
- B) 3
- C) 4
- D) 5

**Answer: C**
PC 7.5 supports up to 4 fault domains for multisite DR, enabling 1→2, 1→3, and more complex topologies. This extends beyond the traditional 1→1 or 1→2 configurations available in earlier versions.

---

### Q11
Which new authentication feature in AOS 7.5 uses SHA algorithms for NTP time synchronization, important for regulated industries?
- A) NTPsec
- B) Authenticated NTP
- C) Kerberos NTP
- D) TLS-NTP

**Answer: B**
Authenticated NTP in AOS 7.5 supports SHA algorithms for cryptographically verified time synchronization. This is critical for regulated industries (finance, healthcare) where accurate and verifiable timestamps are required for compliance.

---

### Q12
What is the NIM (Nutanix Infrastructure Manager) introduced in AOS 7.5?
- A) A replacement for Prism Central
- B) A new orchestrator for NVD-conformant provisioning
- C) A hypervisor management tool
- D) A network inspection module

**Answer: B**
NIM (Nutanix Infrastructure Manager) is a new orchestrator for NVD (Nutanix Validated Design) conformant provisioning, introduced in AOS 7.5. It helps standardize and automate infrastructure deployments according to validated design patterns.

---

### Q13
What is Nutanix Central On-Premises?
- A) A renamed version of Prism Element
- B) A Prism Central deployment managing up to 25 Prism domains, available via Marketplace
- C) A cloud-only management SaaS
- D) A hypervisor for edge deployments

**Answer: B**
Nutanix Central On-Premises is a deployment option that can manage up to 25 Prism domains, available through the Nutanix Marketplace. It provides centralized management capabilities similar to the cloud-based Nutanix Central but deployed on-premises.

---

### Q14
In PC 7.5 IAM, what is the difference between deactivating and deleting a user?
- A) There is no difference
- B) Deactivation preserves the user record and audit trail while revoking access; deletion removes the user entirely
- C) Deactivation is temporary; deletion is for external users only
- D) Deactivation requires Prism Element; deletion requires Prism Central

**Answer: B**
User deactivation in PC 7.5 IAM preserves the user's record and full audit trail while revoking all access permissions. Deletion removes the user entirely and may impact audit reporting. Deactivation is preferred for employees who leave the organization.

---

### Q15
Which guest customization improvement was introduced with NGT 4.5 in AOS 7.5?
- A) Automatic OS licensing
- B) Reusable guest customization profiles and auto-NGT on clone
- C) Built-in antivirus scanning
- D) Automatic domain joining without credentials

**Answer: B**
NGT 4.5 introduces reusable guest customization profiles that can be applied across multiple VMs, and automatic NGT installation when cloning VMs that already have NGT. This simplifies template management and VM provisioning workflows.

---

## Section B: Sequence & Ordering Questions

---

### Q16 (Ordering)
Place the following steps of the Nutanix write I/O path in the correct order:
- A) Data is synchronously replicated to remote CVM OpLogs
- B) Guest VM issues a write
- C) Hypervisor forwards write to local CVM Stargate
- D) Write Characterizer determines random (→ OpLog) or sequential (→ Extent Store) path
- E) ACK returned to guest VM

**Answer: B, C, D, A, E**
The correct write path is: 1) Guest VM issues write; 2) Hypervisor forwards to local CVM; 3) Stargate Write Characterizer determines path; 4) Data written to local OpLog/Extent Store AND synchronously replicated to remote CVM(s); 5) ACK returned to VM once durable on all replicas.

---

### Q17 (Ordering)
Place the LCM upgrade operations in the correct sequence:
- A) Apply updates in recommended order
- B) Notify users of pending maintenance
- C) Run pre-upgrade health checks (NCC)
- D) Discover available updates (Inventory)

**Answer: D, C, B, A**
The standard LCM workflow sequence is: 1) Inventory — discover available updates; 2) Pre-checks — run NCC and validate readiness; 3) Notifications — alert users; 4) Apply — execute updates in recommended order (firmware → hypervisor → AOS).

---

### Q18 (Ordering)
Place these storage hierarchy components from largest to smallest:
- A) vBlock (1 MB chunk)
- B) Extent Group (1–4 MB physical)
- C) Storage Pool (cluster-wide)
- D) vDisk (>512 KB virtual disk)
- E) Container (logical segmentation)
- F) Extent (logically contiguous data)

**Answer: C, E, D, A, F, B**
The storage hierarchy from largest to smallest is: Storage Pool → Container → vDisk → vBlock → Extent → Extent Group. Note: extents are logical 1MB units; extent groups are physical 1-4MB units stored as files on disk.

---

### Q19 (Ordering)
Arrange these VM snapshot consistency types from least to most application-aware:
- A) Application-consistent (Windows VSS)
- B) Application-consistent (Linux quiesce scripts)
- C) Crash-consistent

**Answer: C, B, A**
Crash-consistent captures disk state without guest coordination. Linux application-consistent uses pre/post scripts to quiesce applications. Windows application-consistent uses VSS for deepest coordination with applications like SQL Server and Exchange.

---

### Q20 (Select TWO, then order)
Which two features must be enabled in this order for maximum space efficiency on a deduplication-compatible workload?
- A) Compression first, then deduplication
- B) Deduplication first, then compression
- C) Erasure Coding, then deduplication
- D) Compression should always be enabled before deduplication

**Answer: A, D**
The correct order is enable compression first, then deduplication. This is because compression reduces data size, making deduplication fingerprinting more efficient. Deduplication first would fingerprint larger, uncompressed blocks.

---

## Section C: Gap Fill Questions

---

### Q21
Which service on each CVM handles ALL storage I/O including reads, writes, caching, and replication?
- A) Curator
- B) Stargate
- C) Medusa
- D) Zeus

**Answer: B**
Stargate is the data I/O engine on every CVM. It receives I/O from the hypervisor, writes to the OpLog or Extent Store, manages the Unified Cache, and replicates data to remote CVMs for redundancy. Curator handles background analytics, Medusa is the Cassandra layer, and Zeus handles ZooKeeper configuration.

---

### Q22
Which service is the access layer for Apache Cassandra, which stores the cluster's global metadata in a distributed ring?
- A) Stargate
- B) Curator
- C) Medusa
- D) Zeus

**Answer: C**
Medusa provides the access/abstraction layer for Cassandra, the distributed key-value store that holds vDisk block maps, extent-to-node mappings, time-series stats, and configuration metadata. Stargate handles I/O, Curator runs analytics, and Zeus is the ZooKeeper layer.

---

### Q23
What is the formula for calculating Unified Cache size?
- A) (CVM RAM − 4 GB) × 0.25
- B) (Total RAM × 0.50)
- C) ((CVM RAM − 12 GB) × 0.45)
- D) (CVM RAM − 8 GB) × 0.30

**Answer: C**
Unified Cache uses CVM memory above the 12 GB baseline. The formula is ((CVM RAM − 12 GB) × 0.45). For example, a CVM with 32 GB RAM has ((32 − 12) × 0.45) = 9 GB of Unified Cache.

---

### Q24
The cluster-level fault tolerance setting that must be greater than or equal to the container-level Replication Factor is called the:
- A) Redundancy Factor
- B) Quorum Factor
- C) Availability Factor
- D) Consistency Factor

**Answer: A**
Redundancy Factor is the cluster-level setting (FT1 or FT2) that defines how many failures the cluster can tolerate. Container Replication Factor (RF1, RF2, RF3) cannot exceed the cluster's Redundancy Factor.

---

### Q25 (Select TWO)
In AHV networking, which two statements about bond modes are correct?
- A) The default factory bond mode for host uplinks is active-backup
- B) The default factory bond mode is balance-slb
- C) The recommended production mode is balance-slb
- D) The recommended production mode is active-backup

**Answer: A, C**
Factory default is active-backup (one link active, others standby). The recommended production mode is balance-slb (source MAC hash-based load balancing across all active links without requiring switch configuration). LACP (balance-tcp) requires upstream switch support.

---

### Q26
Which Nutanix service runs map-reduce jobs for analytics, ILM tiering, disk balancing, erasure coding, and garbage collection?
- A) Stargate
- B) Curator
- C) Medusa
- D) Genesis

**Answer: B**
Curator is the map-reduce framework running on every CVM with an elected Curator Master. It coordinates background tasks that optimize and maintain the storage fabric, including tiering, compression, deduplication, EC-X, and cleanup. Stargate handles I/O, Medusa is the Cassandra layer, and Genesis starts services.

---

### Q27
Which component is the authoritative source for cluster configuration and leader election, running on 3 or 5 nodes with quorum-based writes?
- A) Medusa (Cassandra)
- B) Curator
- C) Stargate
- D) Zeus (ZooKeeper)

**Answer: D**
ZooKeeper, accessed through the Zeus abstraction layer, is the authoritative configuration store and leader election service. It runs on 3 or 5 CVMs and uses Paxos-based consensus. A majority of nodes must be available for writes.

---

### Q28
Application-consistent snapshots on Windows require NGT plus which agent to coordinate with application writers before taking the snapshot?
- A) VHD
- B) VSS (Volume Shadow Copy Service)
- C) VHDX
- D) Hyper-V Replica

**Answer: B**
VSS is required for application-consistent snapshots on Windows. The NGT VSS agent and hardware provider coordinate with VSS writers in applications (SQL Server, Exchange, etc.) to quiesce I/O before the snapshot is taken. Without VSS, only crash-consistent snapshots are possible.

---

### Q29
The write coalescing buffer on SSD that absorbs random writes before asynchronously draining to the Extent Store is called the:
- A) Unified Cache
- B) Extent Store
- C) OpLog
- D) Curator Buffer

**Answer: C**
The OpLog is a persistent write buffer on SSD (approximately 6 GB per Stargate) that absorbs bursty random writes. Writes are synchronously replicated to remote OpLogs before ACK. Curator drains OpLog data to the Extent Store asynchronously.

---

### Q30
At what tier utilization threshold does ILM trigger down-migration of cold data from SSD to HDD?
- A) 50%
- B) 60%
- C) 75%
- D) 90%

**Answer: C**
ILM down-migration triggers when overall tier utilization exceeds 75% (configurable). The system attempts to free at least 15% of data or bring utilization to the threshold, whichever is greater. Up-migration occurs based on access patterns.

---

### Q31
Which Nutanix tool collects comprehensive diagnostic logs for support cases using the command `logbay collect`?
- A) Pulse
- B) NCC
- C) Logbay
- D) Genesis

**Answer: C**
Logbay collects logs from CVMs, hypervisors, and other cluster components into a support bundle. It is the primary diagnostic collection tool for Nutanix support cases, supplementing the telemetry data sent by Pulse. NCC runs health checks, and Genesis starts services.

---

### Q32
What is the maximum all-flash storage capacity per node supported in AOS 7.5?
- A) 100 TB
- B) 140 TB
- C) 185 TB
- D) 256 TB

**Answer: C**
AOS 7.5 supports up to 185 TB of raw all-flash storage capacity per node. This is a 2× increase over previous limits and is a key number for the NCA 7.5 exam.

---

### Q33
Which Nutanix management service runs on every CVM and provides the UI, REST API, and CLI?
- A) Acropolis
- B) Prism
- C) Curator
- D) Genesis

**Answer: B**
Prism is the management service running on every CVM. One CVM is elected Prism Leader and handles all HTTP requests. If the leader fails, a new one is elected and assumes the cluster VIP via gratuitous ARP. Acropolis manages the hypervisor, Curator runs analytics, and Genesis starts services.

---

### Q34
Which Nutanix feature automatically creates read-only local copies of heavily-read vDisks across nodes for VDI boot storm optimization?
- A) Erasure Coding (EC-X)
- B) Shadow Clones
- C) NearSync
- D) Compression

**Answer: B**
Shadow Clones automatically cache read-only data locally on each node for heavily-read vDisks. This is specifically designed for VDI environments where many VMs read the same base image during boot storms. EC-X provides space efficiency, NearSync provides low-RPO DR, and Compression reduces data size.

---

### Q35
In NGT architecture, which ports are used by the NGT Master and NGT Proxy respectively?
- A) Port 9440 and Port 80
- B) Port 2073 and Port 2074
- C) Port 443 and Port 8080
- D) Port 2074 and Port 2073

**Answer: B**
NGT Master runs on the Prism Leader CVM and listens on port 2073. NGT Proxy runs on every CVM and listens on port 2074. The guest agent communicates with the proxy on port 2074 via SSL/TCP or through the IP-less serial port method.

---

## Section D: Advanced Scenario Questions

---

### Q36
An administrator is designing storage for a 500-seat VDI deployment using linked clones from a common Windows 11 template. Which combination of features provides the best performance and capacity efficiency?
- A) RF3 + dedup + compression + Shadow Clones
- B) RF2 + dedup + compression + Shadow Clones
- C) RF2 + compression only + EC-X on all data
- D) RF1 + dedup + compression + SSD pinning

**Answer: B**
For linked-clone VDI: RF2 provides adequate protection for non-critical desktops; dedup + compression maximizes space efficiency (high duplicate data from shared template); Shadow Clones optimizes read performance during boot storms. RF3 is overkill for most VDI. EC-X on active data adds latency.

---

### Q37
An administrator observes that a storage container with EC-X enabled is experiencing high write latency on a workload with heavy random writes. What is the most likely cause and appropriate action?
- A) The OpLog is full; increase Stargate memory
- B) EC-X adds CPU overhead and write amplification on random write workloads; move the workload to a non-EC container
- C) The SSD tier is at 100%; add more SSDs
- D) Shadow Clones are interfering; disable Shadow Clones

**Answer: B**
EC-X is designed for cold, read-heavy data. On heavy random write workloads, EC-X adds significant CPU overhead and write amplification due to re-encoding. Transactional and write-heavy workloads should use a container without EC-X, with compression only.

---

### Q38
After migrating a VM from Node A to Node B via live migration, how does AOS handle I/O for that VM's existing data?
- A) All data is immediately copied to Node B
- B) Reads of existing data are forwarded from Node B to Node A; writes go local to Node B; data migrates in background after access thresholds
- C) The VM's vDisks are moved to Node B during migration
- D) Data locality is disabled until the next Curator scan

**Answer: B**
After live migration: writes go immediately local to Node B; reads of existing (old) data are forwarded through the local CVM on Node B to Node A where the data resides. AOS performs background extent group migration to Node B after read access thresholds are met (3 random or 10 sequential touches within 10 minutes).

---

### Q39
A cluster has 6 nodes with Redundancy Factor 2. An administrator needs maximum space efficiency for an archive workload that is written once and rarely read. Which EC-X strip size is most appropriate?
- A) 2+1
- B) 3+1
- C) 4+1
- D) 4+2

**Answer: C**
On a 6-node RF2 cluster, a 4+1 strip provides ~37.5% space savings with reasonable rebuild characteristics. The strip size + 1 node should be available for safe rebuild (4+1 = 5 nodes needed; 6 available = safe). A 2+1 strip provides less savings. 4+2 is for RF3.

---

### Q40
An administrator needs to ensure a database VM always starts before its application server VMs during an HA event. Which AOS 7.5 feature should be used?
- A) VM Anti-Affinity rules
- B) VM Startup Policies
- C) Protection Domain ordering
- D) Host affinity pinning

**Answer: B**
VM Startup Policies, new in AOS 7.5, define ordered boot sequences for VMs during HA restart events. The database VM can be placed in an earlier startup tier than the application servers, ensuring correct dependency order during recovery.

---

### Q41
Which three requirements must be met for application-consistent snapshots using NGT on Windows? (Select THREE)
- A) NGT installed and enabled in the guest OS
- B) VSS enabled in NGT
- C) CVM VIP reachable from the VM on port 2074
- D) Prism Central registered
- E) Volume Groups attached

**Answer: A, B, C**
Application-consistent snapshots require: 1) NGT installed and enabled; 2) VSS enabled in NGT for Windows guests; 3) Network path from VM to CVM VIP on port 2074 (or IP-less serial port method). Prism Central registration and Volume Groups are not required.

---

### Q42
An administrator configures a subnet with VLAN ID 0 in AHV. What type of network traffic is sent on the physical wire?
- A) Tagged traffic with VLAN 0
- B) Untagged traffic on the native VLAN
- C) Double-tagged QinQ traffic
- D) VXLAN encapsulated traffic

**Answer: B**
VLAN ID 0 in AHV represents the native VLAN, and traffic is sent untagged on the wire. The physical switch port must have its native/access VLAN configured to match. VLAN IDs 1-4094 send tagged traffic.

---

### Q43
What is the primary difference between a Nutanix Template and a Nutanix Calm Blueprint?
- A) Templates are for networks; Blueprints are for VMs
- B) Templates standardize single VM deployment; Blueprints define multi-VM application stacks with automation
- C) Templates require Prism Central; Blueprints run on Prism Element
- D) Templates are free; Blueprints require a license

**Answer: B**
Templates standardize single VM deployments with hardware config and guest customization. Blueprints in Calm define complete multi-VM application stacks with pre/post scripts, lifecycle management, and multi-cloud deployment. Both are managed in Prism Central.

---

### Q44
An administrator wants to restrict iSCSI Volume Group access to specific initiators. Which security feature should be configured?
- A) CHAP authentication only
- B) CHAP authentication AND initiator IQN whitelist
- C) VLAN tagging only
- D) IPsec tunnel

**Answer: B**
Volume Group security uses both CHAP (Challenge-Handshake Authentication Protocol) for credential verification and an initiator IQN whitelist to restrict which specific iSCSI initiators can connect. Both layers should be configured for defense in depth.

---

### Q45
Which statement about Nutanix Files FSVMs is correct?
- A) A single FSVM is recommended for production HA
- B) Minimum 3 FSVMs for production; maximum 16 per file server
- C) FSVMs run on ESXi only
- D) Files does not require DNS configuration

**Answer: B**
Nutanix Files requires a minimum of 3 FSVMs for production HA. Single-FSVM deployments are for small/test only. Maximum is 16 FSVMs per file server. DNS and AD must be configured before deployment. Files runs on AHV or ESXi.

---

### Q46
In a NearSync protection domain, what happens when the snapshot frequency is set to 10 minutes?
- A) NearSync is not applicable; Async DR is used instead
- B) NearSync automatically activates and uses Light-Weight Snapshots
- C) The system falls back to Metro Availability
- D) A witness VM is required

**Answer: B**
NearSync automatically activates when snapshot frequency is ≤ 15 minutes. It uses Light-Weight Snapshots (LWS) to achieve RPO of ~15-30 seconds. No witness VM is required. Metro Availability uses synchronous replication and requires a witness, but is a separate configuration.

---

### Q47
What is the relationship between Protection Domains, Consistency Groups, and VMs?
- A) VMs contain Consistency Groups which contain Protection Domains
- B) Protection Domains contain Consistency Groups which contain VMs
- C) Consistency Groups contain Protection Domains which contain VMs
- D) Protection Domains and Consistency Groups are the same thing

**Answer: B**
The hierarchy is: Protection Domain (top-level DR container) → Consistency Groups (group VMs snapped together at the same point in time) → VMs. CGs ensure multi-VM applications are consistent across snapshots.

---

### Q48
An administrator sees a "Critical" alert in Prism and receives an email that a support case was automatically created. Which Pulse feature is active?
- A) Pulse Basic
- B) Pulse HD
- C) Pulse Premium
- D) Pulse Enterprise

**Answer: B**
Pulse HD automatically creates support cases for critical alerts and sends enhanced telemetry to Nutanix support. Pulse Basic sends only standard health data without automatic case creation.

---

### Q49
Which product name change is correct for the Nutanix Kubernetes offering?
- A) NKE → Kubernetes Engine → NKP
- B) Karbon → NKE → NKP (Nutanix Kubernetes Platform)
- C) Karbon → OpenShift → NKP
- D) NKE → Nutanix Kubernetes Enterprise → NKP

**Answer: B**
The evolution is: Karbon (original name) → NKE (Nutanix Kubernetes Engine) → NKP (Nutanix Kubernetes Platform). This is a common exam trap question.

---

### Q50
What is the correct product name for what was previously called "Xi Leap"?
- A) Xi Backup
- B) Xi DR
- C) Nutanix DRaaS
- D) Leap Standard

**Answer: B**
Xi Leap has been rebranded as Xi DR. Product name changes are common exam traps: Prism Pro → NCM; Karbon/NKE → NKP; NDB/Era → Nutanix Database Service; AFS → Nutanix Files; Flow Security → Flow Network Security.

---

### Q51 (Select TWO)
Which two Nutanix licensing tiers support cloud deployments (NC2)?
- A) Starter
- B) Pro
- C) Ultimate
- D) Evaluation

**Answer: B, C**
NCI Starter is on-premises only with a 12-node maximum and RF2 only. Pro and Ultimate tiers support cloud deployments including NC2 on AWS and Azure. NC2 requires Pro or Ultimate licensing.

---

### Q52
What is the maximum number of VMs that can have NGT installed per cluster?
- A) 1,024
- B) 2,048
- C) 5,000
- D) 10,000

**Answer: B**
The maximum number of VMs with NGT installed per cluster is 2,048. This is a specific limit that may appear on the NCA 7.5 exam. Prism Central can manage up to 10,000 VMs total, but NGT has a per-cluster limit of 2,048.

---

### Q53
Which NCA 7.5 feature provides behavioral ransomware detection through cloud-based analysis of file activity?
- A) File Analytics
- B) Data Lens
- C) Flow Network Security
- D) NCC Ransomware Check

**Answer: B**
Data Lens is the cloud-based SaaS analytics service that scans Files data for PII/PHI/PCI patterns and provides behavioral ransomware detection. File Analytics is the on-prem VM-based counterpart without cloud-based classification.

---

### Q54
An administrator needs to verify the network configuration of an AHV host from the CVM. Which command shows the current uplinks?
- A) `ovs-vsctl show`
- B) `manage_ovs show_uplinks`
- C) `acli net.list`
- D) `ncli host list`

**Answer: B**
`manage_ovs show_uplinks` shows the current physical NIC uplinks for the OVS bridge on the local AHV host. `ovs-vsctl show` shows OVS configuration but is lower-level. `acli net.list` lists networks (VM subnets). `ncli host list` shows node inventory.

---

### Q55
What is the recommended first step when troubleshooting a VM that cannot mount an NFS export from Nutanix Files?
- A) Restart the entire file server
- B) Verify forward and reverse DNS resolution for FSVM IPs and check client allowlists
- C) Reinstall NGT on the client VM
- D) Upgrade the cluster firmware

**Answer: B**
The first troubleshooting steps for Files NFS access issues are: 1) Verify DNS (forward and reverse) resolves correctly for FSVM IPs; 2) Check the client allowlist on the export to ensure the VM's IP/subnet is permitted; 3) Verify network connectivity. Mass restarts and upgrades should be last resorts.

---

### Q56
Which Nutanix service runs on every CVM with no leader — each instance handles only its local node's I/O?
- A) Prism
- B) Stargate
- C) Acropolis
- D) Chronos

**Answer: B**
Stargate has no leader — every CVM runs Stargate and handles only its local node's storage I/O. Prism, Acropolis, Curator, Chronos, and Cerebro all have elected leaders that coordinate cluster-wide operations.

---

### Q57
What is the purpose of the `ncli cluster get-domain-fault-tolerance-status type=rackable_unit` command?
- A) Check if nodes can tolerate rack-level failures
- B) Check network fault tolerance
- C) Check power domain redundancy
- D) Check CVM memory utilization

**Answer: A**
This command checks whether the cluster can tolerate failures at the block/rackable unit level. Nutanix nodes are arranged in blocks of up to 4 nodes; this verifies data and metadata are distributed such that the loss of an entire block (e.g., power failure) does not cause unavailability.

---

### Q58
In the Nutanix write path, sequential sustained writes greater than 1.5 MB outstanding bypass which component?
- A) Unified Cache
- B) OpLog
- C) Extent Store
- D) Medusa

**Answer: B**
The Write Characterizer in Stargate examines I/O patterns. Bursty random writes go to the OpLog for coalescing. Sustained sequential writes (>1.5 MB outstanding to a vDisk) bypass the OpLog and go directly to the Extent Store, avoiding unnecessary write amplification.

---

### Q59
Which Nutanix feature allows a file server to share data across both SMB and NFS protocols from the same server?
- A) Multiprotocol Shares
- B) Distributed Shares
- C) Native Protocol Selection
- D) Dual-Protocol FSVMs

**Answer: A**
Nutanix Files supports multiprotocol access where a single file server can serve the same data via SMB and NFS. However, you must choose a native protocol for ACL management, and concurrent writes from both protocols to the same file are blocked (concurrent reads are OK).

---

### Q60
An administrator is configuring a new Prism Central instance. Which authentication method enables Multi-Factor Authentication (MFA) for administrator logins?
- A) Active Directory
- B) LDAP
- C) SAML with an Identity Provider
- D) Local accounts with complex passwords

**Answer: C**
SAML authentication in Prism Central integrates with external Identity Providers (IdP) such as Okta, ADFS, and Azure AD. This enables MFA/2FA capabilities that are not available with AD, LDAP, or local authentication alone. SAML is PC-only (not available in PE).

---

*End of NCA-75-Part3 — Gap Fill, Sequence & What's New (60 questions)*
