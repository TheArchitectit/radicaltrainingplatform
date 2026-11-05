# NCA 7.5 Beta Practice Questions – Domains 1 & 2

## Domain 1: Describe Lifecycle Management (~20%)

---

### Q1
Which tool is used to discover and manage firmware and software updates on a Nutanix cluster?
- A) Stargate
- B) Nutanix Cluster Check (NCC)
- C) Life Cycle Manager (LCM)
- D) Pulse

**Answer: C**
Life Cycle Manager (LCM) is the Nutanix tool for discovering, staging, and applying firmware and software updates across AOS, AHV/hypervisor, and hardware components. NCC checks health, Pulse sends telemetry, and Stargate handles I/O.

---

### Q2
What is the correct order of operations when performing an LCM update on a Nutanix cluster?
- A) Run pre-checks → Take inventory → Apply updates → Notify users
- B) Notify users → Run pre-checks → Take inventory → Apply updates
- C) Notify users → Take inventory → Run pre-checks → Apply updates
- D) Take inventory → Run pre-checks → Notify users → Apply updates

**Answer: D**
The standard LCM workflow is: 1) Inventory — discover available updates; 2) Pre-checks — validate cluster health and readiness; 3) Notifications — alert users of pending maintenance; 4) Apply updates in recommended order.

---

### Q3
An administrator needs to upgrade a 5-node cluster. Which upgrade order is recommended by Nutanix best practices?
- A) Hypervisor → Firmware → AOS
- B) AOS → Hypervisor → Firmware
- C) Firmware → Hypervisor → AOS
- D) Firmware → AOS → Hypervisor

**Answer: B**
The recommended Nutanix best-practice upgrade order is: 1) AOS first — CVMs must have updated storage management APIs to orchestrate host maintenance modes; 2) Hypervisor second — guest VMs can then be safely live-migrated during rolling host reboots; 3) Firmware (BIOS, BMC, drive firmware) last to minimize bare-metal reset conflicts on a stabilized stack.

---

### Q4
Which LCM platform supports orchestrating updates across multiple Prism Central registered clusters simultaneously?
- A) Prism Element LCM
- B) Prism Central LCM
- C) Nutanix Support Portal
- D) aCLI

**Answer: B**
Prism Central LCM provides multi-cluster orchestration, allowing administrators to manage upgrades across all registered clusters from a single pane. Prism Element LCM is cluster-local only.

---

### Q5
Before placing nodes into maintenance mode for an LCM upgrade, what should an administrator verify first?
- A) That the cluster is licensed for Pro or Ultimate
- B) That all VMs are powered off
- C) That VM-to-host affinity rules are in place
- D) That there are sufficient cluster resources for HA to restart VMs on remaining nodes

**Answer: D**
Placing a node in maintenance mode causes HA to restart its VMs on other cluster nodes. The administrator must ensure the remaining nodes have sufficient CPU, memory, and storage resources to absorb these VMs. VMs do not need to be powered off manually.

---

### Q6
Which statement is true regarding LCM dark site mode for air-gapped environments?
- A) Dark site mode automatically syncs packages via satellite link
- B) Dark site mode is not supported for firmware updates
- C) Dark site mode requires an HTTPS proxy to Nutanix support
- D) Dark site mode uses a local HTTP server to host update packages for offline clusters

**Answer: D**
LCM dark site mode enables offline/air-gapped clusters to receive updates by hosting packages on a local web server within the environment. The cluster points to this local repository instead of the Nutanix public update catalog.

---

### Q7 (Select TWO)
Which two hypervisors are fully supported for VM management on Nutanix AOS 7.5?
- A) AHV
- B) Hyper-V
- C) ESXi
- D) KVM upstream

**Answer: A, C**
Nutanix AOS 7.5 fully supports AHV (the native hypervisor) and ESXi for VM management. Hyper-V support was discontinued for VM management as of AOS 6.x (read-only operations remain). Raw upstream KVM is not a supported Nutanix hypervisor option.

---

### Q8
What is the minimum number of nodes required for a production Nutanix cluster?
- A) 1
- B) 2
- C) 3
- D) 4

**Answer: C**
A production Nutanix cluster requires a minimum of 3 nodes. This provides the minimum for RF2 data redundancy and a ZooKeeper quorum. Single-node clusters exist for ROBO/lab use but have significant feature limitations.

---

### Q9
An LCM pre-check fails with a warning about VM anti-affinity rules. What does this indicate?
- A) The node will not enter maintenance mode
- B) VMs will automatically be migrated to balance load
- C) VMs that must remain separated are at risk of landing on the same node during upgrade
- D) The cluster has too many VMs and cannot perform the upgrade

**Answer: C**
During LCM, nodes enter maintenance mode sequentially, causing VM HA restarts. If anti-affinity rules separate critical VMs (e.g., domain controllers), the pre-check warns that these VMs could potentially be placed on the same surviving node. Manual verification or temporary affinity adjustments may be needed.

---

### Q10
Which component handles the rolling restart of CVMs during an AOS upgrade?
- A) Curator
- B) LCM orchestration framework
- C) Stargate
- D) Genesis

**Answer: B**
LCM orchestrates the entire upgrade process, including the rolling restart of CVMs one at a time, with automatic health checks between each restart. Genesis starts services, Stargate handles I/O, and Curator manages background tasks — but LCM drives the upgrade workflow.

---

## Domain 2: Describe Nutanix Basic Administration (~30%)

---

### Q11
What differentiates Prism Element from Prism Central?
- A) Prism Element manages a single cluster; Prism Central manages multiple clusters
- B) Prism Element requires a separate VM; Prism Central is built-in
- C) Prism Element is REST-API only; Prism Central has a GUI
- D) Prism Element is cloud-based; Prism Central is on-premises

**Answer: A**
Prism Element (PE) is built into every AOS cluster and manages that single cluster. Prism Central (PC) is a multi-cluster management appliance (or SaaS) that provides centralized management, policies, Flow, Calm, and RBAC across multiple clusters.

---

### Q12
Which authentication method is ONLY available in Prism Central and NOT in Prism Element?
- A) Active Directory
- B) LDAP
- C) SAML / SSO
- D) Local user accounts

**Answer: C**
SAML-based authentication and Single Sign-On (SSO) are only available in Prism Central. Both PE and PC support local accounts, Active Directory, and LDAP. SAML enables integration with identity providers like Okta and ADFS for MFA/2FA.

---

### Q13
Which built-in role in Prism Central has full access to all features and settings?
- A) Super Admin
- B) Cluster Admin
- C) Operator
- D) Viewer

**Answer: A**
Super Admin is the built-in Prism Central role with unrestricted access to all features and settings. Cluster Admin manages cluster-level operations, Operator handles day-to-day tasks, and Viewer has read-only access.

---

### Q14
An administrator needs to assign multiple VMs to a protection policy based on a shared attribute. Which Prism Central feature should be used?
- A) Roles
- B) Virtual Private Clouds
- C) Projects
- D) Categories

**Answer: D**
Categories are key-value pairs (e.g., `AppType:Web`, `Environment:Production`) applied to entities like VMs. They enable policy-based management — protection policies, security policies, and governance rules can target VMs by category rather than by individual selection.

---

### Q15
What is the primary purpose of a Project in Prism Central?
- A) To scope user access to specific resources for multi-tenancy
- B) To create network subnets
- C) To schedule LCM upgrades
- D) To define VM hardware templates

**Answer: A**
Projects in Prism Central scope user access to specific resources, enabling multi-tenancy. Users are assigned to projects with specific roles. The project defines *where* (scope) a user can act, while the role defines *what* they can do.

---

### Q16
Which Nutanix CLI tool runs only on AHV CVMs and is not supported on ESXi clusters?
- A) nCLI
- B) aCLI
- C) PowerShell cmdlets
- D) nuclei

**Answer: B**
aCLI (Acropolis CLI) is AHV-only and runs on CVMs. It manages VMs, networks, and hosts in AHV environments. nCLI can run locally or on CVMs and works with both PE and PC. nuclei is a PC-only support tool.

---

### Q17
Which REST API version is the current GA and recommended version for Prism Central?
- A) v4
- B) v1
- C) v2.0
- D) v3

**Answer: A**
API v4 is the current GA and recommended API for Prism Central. It uses namespace-based URLs, supports IAM API keys, and requires the `Ntnx-Request-Id` header. v1 is deprecated, v2.0 is for Prism Element, and v3 is legacy PC.

---

### Q18
An administrator takes a snapshot of a running VM without NGT installed. What type of snapshot is created?
- A) VSS snapshot
- B) Self-service restore snapshot
- C) Application-consistent snapshot
- D) Crash-consistent snapshot

**Answer: D**
Without NGT, snapshots are crash-consistent — they capture the state of vDisks at a point in time, equivalent to pulling the power cord. Application-consistent snapshots require NGT with VSS (Windows) or quiesce scripts (Linux) to coordinate with the guest OS and applications.

---

### Q19 (Select TWO)
Which two components are required for application-consistent snapshots of a Windows VM?
- A) NGT installed in the guest OS
- B) VSS enabled in NGT
- C) Prism Central registration
- D) Volume Groups attached

**Answer: A, B**
Application-consistent snapshots on Windows require: 1) Nutanix Guest Tools (NGT) installed inside the VM; and 2) VSS (Volume Shadow Copy Service) enabled in NGT. VSS coordinates with application writers to quiesce I/O before the snapshot is taken.

---

### Q20
Which Nutanix service runs on every CVM and handles all storage I/O requests?
- A) Medusa
- B) Zeus
- C) Stargate
- D) Curator

**Answer: C**
Stargate is the data I/O engine running on every CVM. It handles all reads, writes, caching (Unified Cache), replication, and write path characterization (OpLog vs Extent Store). Medusa manages Cassandra metadata, Zeus handles ZooKeeper config, and Curator runs map-reduce analytics.

---

### Q21
What happens when a VM is live-migrated to a different host in an AHV cluster?
- A) A snapshot is taken before migration
- B) The VM is powered off and restarted on the new host
- C) The VM memory state is transferred while the VM continues running
- D) Only the vDisks are moved to the new host

**Answer: C**
Live migration (AHV) transfers the VM's memory state from the source to the destination host while the VM continues running, with minimal downtime. The VM is not powered off, and vDisks remain in the distributed storage fabric (they do not move with the VM).

---

### Q22
Which vNIC type is the default and recommended option for best network performance on AHV?
- A) VirtIO
- B) vmxnet3
- C) e1000
- D) RTL8139

**Answer: A**
VirtIO is the default and recommended vNIC type on AHV, providing paravirtualized drivers for best performance. e1000 is a legacy emulated Intel NIC for compatibility, RTL8139 is a low-performance Realtek option, and vmxnet3 is a VMware-only adapter.

---

### Q23
An administrator needs to create a VM from the command line on an AHV cluster. Which tool should be used?
- A) `acli vm.create`
- B) `nutanixctl vm create`
- C) `prism-cli vm create`
- D) `ncli vm.create`

**Answer: A**
`acli vm.create` creates a VM from the Acropolis CLI on an AHV CVM. nCLI does not have a direct `vm.create` command for VM provisioning — aCLI is the AHV-specific CLI for VM management.

---

### Q24
What is the purpose of Nutanix Guest Tools (NGT) Self-Service Restore (SSR)?
- A) Allow guests to migrate VMs between clusters
- B) Allow guest administrators to restore individual files from snapshots without Nutanix admin involvement
- C) Automatically back up VMs to cloud storage
- D) Enable live migration between hypervisors

**Answer: B**
SSR allows a guest administrator inside the VM to browse and restore individual files from VM snapshots. The Nutanix admin enables SSR on the VM, but the restore operation is performed by the guest admin using the SSR CLI tool inside the VM.

---

### Q25
Which is the correct hierarchy of Nutanix storage organization from largest to smallest?
- A) Container → Storage Pool → vDisk → Extent
- B) vDisk → Container → Storage Pool
- C) Storage Pool → Container → vDisk → Extent Group
- D) Storage Pool → Container → vDisk → vBlock → Extent → Extent Group

**Answer: D**
The correct hierarchy is: Storage Pool (all physical disks in the cluster) → Container (logical segmentation, policy boundaries) → vDisk (virtual disk >512KB) → vBlock (1MB chunk of vDisk) → Extent (logically contiguous data) → Extent Group (physically contiguous on disk).

---

### Q26
What is the Nutanix default bond mode for AHV host uplinks?
- A) balance-tcp (LACP)
- B) balance-rr
- C) active-backup
- D) balance-slb

**Answer: C**
Factory default is `active-backup` — one link active, others on standby for failover. `balance-slb` (source MAC hash-based load balancing) is the recommended production mode. `balance-tcp` (LACP) requires upstream switch configuration.

---

### Q27
Which Prism Central feature provides a visual map of network traffic flows between VMs?
- A) Flow Visualization
- B) VM Dashboard
- C) Calm
- D) Network Topology

**Answer: A**
Flow Visualization in Prism Central (under Network & Security → Flow) shows a visual map of which VMs communicate with which, helping administrators understand traffic patterns and build security policies. Network Topology in Prism Element is simpler and does not include flow-level analysis.

---

### Q28
An administrator needs to bulk-install NGT across 50 Windows VMs. What is the most efficient method?
- A) Mount NGT ISO manually on each VM
- B) Use Prism Central automated NGT installation via WinRM
- C) Use aCLI to attach NGT ISO to all VMs
- D) Install NGT via SSH on each VM

**Answer: B**
Prism Central supports automated bulk NGT installation across multiple VMs using WinRM (Windows) or SSH (Linux) credentials. This is the most efficient method for large-scale deployments compared to manual ISO mounting.

---

### Q29
Which API version is specific to Prism Element (single cluster) operations?
- A) v4
- B) v1
- C) v2.0
- D) v3

**Answer: C**
API v2.0 is designed for Prism Element and handles cluster-local operations like storage containers, hosts, storage pools, and VM management. v3 and v4 are Prism Central APIs. v1 is deprecated.

---

### Q30
What is the default port for Prism web UI access?
- A) 9440
- B) 8080
- C) 80
- D) 443

**Answer: A**
Prism uses port 9440 for HTTPS web UI and API access. Port 80 is available for HTTP but redirects to HTTPS. Port 443 is not used by Prism by default. Port 8080 is not a standard Prism port.

---

### Q31
What must be configured before deploying Nutanix Files for SMB access?
- A) Active Directory and DNS
- B) Volume Group mapping
- C) Flow security policies
- D) iSCSI target configuration

**Answer: A**
Before deploying Nutanix Files, Active Directory and DNS must be configured. The file server joins the AD domain, and DNS A records for FSVM IPs are required. Without AD, SMB authentication will not function.

---

### Q32
Which statement about Volume Groups is correct?
- A) Volume Groups connect via NFS and are managed by the hypervisor
- B) Volume Groups use iSCSI and support shared block storage between multiple VMs
- C) Volume Groups are only accessible from the local CVM
- D) Volume Groups replace standard vDisks for all VM storage

**Answer: B**
Volume Groups present block storage via iSCSI and enable shared block storage between VMs using SCSI-3 Persistent Reservations, which is required for guest clustering scenarios like Windows Failover Clustering. They complement standard vDisks, not replace them.

---

### Q33
An administrator needs to ensure two domain controller VMs never run on the same host. Which VM policy should be configured?
- A) VM-to-VM Affinity
- B) VM-Host Affinity
- C) VM Anti-Affinity
- D) Host Affinity Only

**Answer: C**
VM Anti-Affinity ensures specified VMs are kept on separate hosts, preventing single points of failure for critical paired services. If cluster constraints force a violation, availability overrides the rule. VM-Host Affinity pins a VM to specific host(s).

---

### Q34
Which Nutanix service is responsible for leader election across cluster services like Prism, Acropolis, and Curator?
- A) Zeus (ZooKeeper)
- B) Stargate
- C) Medusa
- D) Genesis

**Answer: A**
Zeus is the access layer for Apache ZooKeeper, which is the authoritative source for cluster configuration and leader election. Every service that needs a leader (Prism, Acropolis, Curator, Chronos, Cerebro) coordinates its election through Zeus/ZooKeeper.

---

### Q35
What is the maximum number of VMs that Prism Central can manage in AOS 7.5?
- A) 10,000
- B) 15,000
- C) 25,000
- D) 5,000

**Answer: C**
Prism Central in AOS 7.5 can manage up to 25,000 VMs in a scale-out 3-VM deployment. A single large VM instance supports up to 10,000 VMs; the 3-VM scale-out architecture extends this to 25,000.

---

### Q36
Which Nutanix CLI tool is used exclusively on Prism Central and is typically used by support engineers?
- A) aCLI
- B) nCLI
- C) nuclei
- D) manage_ovs

**Answer: C**
`nuclei` is a Prism Central-only CLI tool typically used by Nutanix support engineers (SREs) for advanced troubleshooting and configuration. aCLI is AHV-only, nCLI works with both PE and PC, and manage_ovs configures OVS uplinks.

---

### Q37
An administrator wants to assign a static IP to a VM vNIC that persists across reboots and live migrations without configuring the guest OS manually. Which feature enables this?
- A) DHCP Relay
- B) External DHCP server
- C) IP Address Management (IPAM)
- D) DNS A record

**Answer: C**
IPAM on an AHV subnet provides lifelong static IP assignments to VM vNICs. AHV intercepts DHCP requests and injects an IP from the configured pool. The assignment persists across reboots and live migrations — it is not a traditional expiring DHCP lease.

---

### Q38
What is the default vDisk controller type recommended for Windows VMs on AHV?
- A) VirtIO-SCSI
- B) NVMe
- C) IDE
- D) SCSI

**Answer: A**
VirtIO-SCSI is the default and recommended disk controller for Windows VMs on AHV, providing the best I/O performance. SCSI is also supported. IDE is the slowest option (legacy compatibility). NVMe is a different class of device interface.

---

### Q39
Which statement about Nutanix Image Management in Prism Central is correct?
- A) Disk images and ISOs are stored in the Acropolis Tuple Store (ATS) and can be distributed to multiple clusters
- B) Images must be deleted manually from each cluster after use
- C) Images cannot be used by multiple VMs simultaneously
- D) Images can only be stored on a single designated cluster

**Answer: A**
Prism Central Image Management stores disk images and ISOs in ATS and supports distribution to multiple clusters. Images can be shared by multiple VMs (linked clones for efficiency). "Discard" removes a local copy without deleting the central image.

---

### Q40
What is the correct authentication flow for a SAML-enabled Prism Central login?
- A) User enters credentials in Prism → Prism verifies against local database → access granted
- B) User enters credentials in Prism → redirected to IdP for authentication → returned to Prism with token → RBAC determines access
- C) User connects via SSH → Kerberos ticket generated → web session created
- D) User provides API key → direct bearer token access

**Answer: B**
SAML flow: user accesses Prism Central → redirected to the Identity Provider (IdP) like Okta/ADFS → authenticates at IdP → returned to Prism with SAML assertion → Prism grants access based on RBAC policies mapped to the user's identity.

---

*End of NCA-75-Part1 — Domains 1 & 2 (40 questions)*
