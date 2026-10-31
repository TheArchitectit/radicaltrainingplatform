# Nutanix Certified Associate (NCA) 7.5 Practice Questions - New Bank Part 1
# Original study items. Independent material, not official or endorsed by Nutanix.

## DOMAIN 1: Recognize Nutanix Solutions and Tools (study allocation)

---

### Q1
An architect lists the components a Nutanix Cloud Infrastructure cluster provides out of the box. Which grouping is correct?
- A) A single monolithic storage controller pair
- B) A hypervisor option (AHV or supported third party), the Controller VM on each node, and a distributed storage fabric pooling local disks
- C) A separate SAN array, external RAID controllers, and a backup appliance
- D) Only a hypervisor with no management layer

**Answer: B**
NCI nodes each run a Controller VM that forms a distributed storage fabric across the cluster's local drives, under a supported hypervisor. The design eliminates external SANs and single-controller bottlenecks.
<!-- {"id":"NUTANIX-NCA-75-Q101","objective":"1.1","type":"recall","source":"NCAEBG","locator":"Objective 1.1 NCI core components","verified":"2026-10-10"} -->

---

### Q2
A customer wants to run Nutanix software but keep their existing VMware licensing and skills. Is this supported?
- A) Yes; NCI supports multiple hypervisors including ESXi alongside the built-in AHV
- B) No; only AHV exists
- C) Only on laptops
- D) Only in the public cloud

**Answer: A**
NCI supports a choice of hypervisors, with AHV included at no extra cost and ESXi among the supported alternatives. Hypervisor choice is a deployment decision driven by skills, licensing, and workload needs.
<!-- {"id":"NUTANIX-NCA-75-Q102","objective":"1.1","type":"recall","source":"NCAEBG","locator":"Objective 1.1 supported hypervisors","verified":"2026-10-10"} -->

---

### Q3
A two-site company wants VM-level resilience: if any single node fails, VMs restart on surviving nodes with their data intact. Which design properties deliver this?
- A) One very large node with no peers
- B) Local RAID only, no cluster
- C) A nightly tape backup
- D) Data written with a replication factor across nodes plus VM high availability

**Answer: D**
The storage fabric replicates data across nodes (replication factor), so a node loss never means data loss, and HA restarts affected VMs elsewhere. Single-node or backup-only designs cannot restart VMs promptly.
<!-- {"id":"NUTANIX-NCA-75-Q103","objective":"1.1","type":"diagnosis","source":"NCAEBG","locator":"Objective 1.1 replication factor, HA","verified":"2026-10-10"} -->

---

### Q4
A small branch has room for only two cluster nodes but still needs automated failover decisions without a third full node. Which Nutanix construct supports this?
- A) A two-node cluster with an external Witness service/VM
- B) A four-node minimum, no exceptions
- C) A single node with RAID
- D) Two clusters that never talk

**Answer: A**
Two-node clusters pair with a Witness, a lightweight tiebreaker that arbitrates failover so a site of two nodes behaves safely during failures. It exists precisely for small remote/branch deployments.
<!-- {"id":"NUTANIX-NCA-75-Q104","objective":"1.1","type":"recall","source":"NCAEBG","locator":"Objective 1.1 two-node clusters, Witness","verified":"2026-10-10"} -->

---

### Q5
A platform team must update firmware and software across the cluster without shutting down workloads. Which Nutanix tool orchestrates this?
- A) The VM snapshot button
- B) A spreadsheet macro
- C) Life Cycle Manager (LCM), performing rolling one-click style updates
- D) Manual ISO boots on every node

**Answer: C**
LCM inventories and updates firmware and software components in a rolling fashion, migrating workloads as needed so updates happen without downtime. It is the supported, automated alternative to manual per-node work.
<!-- {"id":"NUTANIX-NCA-75-Q105","objective":"1.1","type":"recall","source":"NCAEBG","locator":"Objective 1.1 LCM","verified":"2026-10-10"} -->

---

### Q6
An air-gapped defense site cannot reach the internet for updates. How does LCM handle this?
- A) The site can never be updated
- B) Updates require disabling security
- C) Satellite phone only
- D) Dark site method: download update bundles elsewhere and apply them offline

**Answer: D**
LCM's dark site workflow moves update bundles to disconnected environments on media, so isolated clusters stay current without internet access. The recommended upgrade order still applies.
<!-- {"id":"NUTANIX-NCA-75-Q106","objective":"1.1","type":"diagnosis","source":"NCAEBG","locator":"Objective 1.1 LCM dark site","verified":"2026-10-10"} -->

---

### Q7
A retail chain wants to run its Nutanix environment in the public cloud for seasonal burst capacity, keeping the same management stack. Which offering fits?
- A) A USB drive
- B) X-Ray
- C) Nutanix Cloud Clusters (NC2)
- D) Nutanix Move

**Answer: C**
NC2 runs the Nutanix stack on bare-metal instances in public clouds, giving one operating model across on-premises and cloud. Move migrates workloads; X-Ray tests performance; neither runs clusters in a cloud.
<!-- {"id":"NUTANIX-NCA-75-Q107","objective":"1.1","type":"recall","source":"NCAEBG","locator":"Objective 1.1 NC2","verified":"2026-10-10"} -->

---

### Q8
A security team wants microsegmentation: VM-to-VM traffic policies enforced inside the cluster, blocking lateral movement between app tiers. Which Nutanix feature provides this?
- A) Prism dashboards
- B) Nutanix Flow network security
- C) Replication factor 3
- D) Deduplication

**Answer: B**
Flow applies policy-based microsegmentation to VM traffic within the platform, controlling east-west flows that perimeter firewalls never see. Replication factor and deduplication are storage properties.
<!-- {"id":"NUTANIX-NCA-75-Q108","objective":"1.1","type":"recall","source":"NCAEBG","locator":"Objective 1.1 Nutanix Flow","verified":"2026-10-10"} -->

---

### Q9
An operations team manages dozens of clusters and wants one control plane to register, update, and govern them all. Which component fits?
- A) Telnet scripts
- B) A shared clipboard
- C) Nutanix Central for federation across Prism Central instances and clusters
- D) One Prism Element per cluster, bookmarked

**Answer: C**
Nutanix Central provides fleet-level visibility and operations above Prism Central, which itself aggregates clusters. Managing dozens of clusters one Element console at a time does not scale.
<!-- {"id":"NUTANIX-NCA-75-Q109","objective":"1.1","type":"recall","source":"NCAEBG","locator":"Objective 1.1 Nutanix Central","verified":"2026-10-10"} -->

---

### Q10
A company replicates snapshots of critical VMs to a second site and can power them on there after a disaster. Which capability is in use?
- A) RAID within one node
- B) Screenshot archives
- C) Nutanix Disaster Recovery with snapshot replication and recovery plans
- D) Manual file copies monthly

**Answer: C**
Nutanix DR replicates VM snapshots between sites or clusters and orchestrates failover with recovery plans, giving measurable RPO/RTO. RAID protects disks, not sites; copies without orchestration are not DR.
<!-- {"id":"NUTANIX-NCA-75-Q110","objective":"1.1","type":"recall","source":"NCAEBG","locator":"Objective 1.1 Nutanix Disaster Recovery","verified":"2026-10-10"} -->

---

### Q11
A cluster stores VM data with replication factor 2. What does that mean practically?
- A) Two copies of data exist on different nodes, tolerating one node/disk failure
- B) Data is split in half
- C) Every VM gets two IP addresses
- D) Backups run twice

**Answer: A**
RF2 keeps two replicas on separate nodes, surviving a single failure domain loss. RF3 keeps three copies for higher resilience at more storage overhead. It is data protection, unrelated to networking or backups.
<!-- {"id":"NUTANIX-NCA-75-Q111","objective":"1.1","type":"recall","source":"NCAEBG","locator":"Objective 1.1 replication factor","verified":"2026-10-10"} -->

---

### Q12
A three-node cluster debates tolerating a full node loss with no warning while keeping writes flowing. Which fault-tolerance consideration applies?
- A) RF3 plus enough capacity headroom, since RF2 clusters cannot absorb a failure and keep writing new protected data
- B) RF1 is fine everywhere
- C) Fault tolerance is automatic regardless of design
- D) Remove one node to test

**Answer: A**
Small clusters need deliberate RF and capacity planning: with RF2, a surviving pair can serve reads but cannot re-protect writes until repair. Three-node deployments carry special considerations documented for exactly this reason.
<!-- {"id":"NUTANIX-NCA-75-Q112","objective":"1.1","type":"diagnosis","source":"NCAEBG","locator":"Objective 1.1 three-node considerations, fault tolerance","verified":"2026-10-10"} -->

---

### Q13
A company wants its on-prem cluster to fail over directly into a cloud region during a site disaster, using replicated snapshots. Which feature name matches?
- A) Local RAID 10
- B) Print-to-PDF archiving
- C) VLAN trunking
- D) Multicloud snapshot-based disaster recovery (MST)

**Answer: D**
Multicloud snapshot technology extends snapshot replication to cloud targets so workloads can recover into the cloud, complementing site-to-site DR. It is a DR topology, not a local redundancy scheme.
<!-- {"id":"NUTANIX-NCA-75-Q113","objective":"1.1","type":"recall","source":"NCAEBG","locator":"Objective 1.1 MST disaster recovery","verified":"2026-10-10"} -->

---

### Q14
A new cluster arrives at a remote office. Which tool images the nodes and builds the cluster initially?
- A) Pulse
- B) NGT
- C) Foundation (or Foundation Central for centralized imaging)
- D) X-Ray

**Answer: C**
Foundation performs node imaging and cluster creation at deployment time; Foundation Central centralizes that workflow for multiple sites. X-Ray benchmarks, Pulse reports telemetry, and NGT lives inside guest VMs.
<!-- {"id":"NUTANIX-NCA-75-Q114","objective":"1.3","type":"recall","source":"NCAEBG","locator":"Objective 1.3 Foundation","verified":"2026-10-10"} -->

---

### Q15
A consultant must benchmark a cluster's storage performance against standardized workload profiles before go-live. Which tool applies?
- A) Witness
- B) X-Ray
- C) Move
- D) Collector

**Answer: B**
X-Ray runs automated performance test scenarios against infrastructure, producing comparable results for sizing and validation. Move migrates VMs; Collector gathers inventory data; Witness arbitrates two-node clusters.
<!-- {"id":"NUTANIX-NCA-75-Q115","objective":"1.3","type":"recall","source":"NCAEBG","locator":"Objective 1.3 X-Ray","verified":"2026-10-10"} -->

---

### Q16
A virtualization admin wants VM snapshots and power operations in the hypervisor console to coordinate properly with the guest OS, plus clean IP reporting. What should be installed in each VM?
- A) Nothing; VMs need no tools
- B) Nutanix Guest Tools (NGT)
- C) A second antivirus
- D) A proxy server

**Answer: B**
NGT is the in-guest agent enabling guest-aware operations: quiesced snapshots, IP address visibility, and self-service restore support. Without it, the platform manages VMs from the outside only.
<!-- {"id":"NUTANIX-NCA-75-Q116","objective":"1.3","type":"recall","source":"NCAEBG","locator":"Objective 1.3 NGT","verified":"2026-10-10"} -->

---

### Q17
A company is leaving a legacy hypervisor and wants an automated, minimally disruptive way to move hundreds of VMs onto AHV. Which tool is built for this?
- A) Nutanix Move
- B) Manual export/import one by one
- C) Foundation
- D) Pulse

**Answer: A**
Move automates bulk VM migration from supported source platforms to Nutanix with orchestrated cutover. Foundation images physical nodes; it does not migrate running estates.
<!-- {"id":"NUTANIX-NCA-75-Q117","objective":"1.3","type":"recall","source":"NCAEBG","locator":"Objective 1.3 Move","verified":"2026-10-10"} -->

---

### Q18
End users must recover their own accidentally deleted files from VM snapshots without filing tickets. Which capability enables this?
- A) Email attachments
- B) Self-Service Restore (SSR), with NGT in the guest
- C) Full cluster restore nightly
- D) Asking the storage team to clone the cluster

**Answer: B**
SSR lets authorized users browse and restore their files from snapshots through the guest agent (NGT), removing help-desk cycles for routine file recovery. It is granular and self-service by design.
<!-- {"id":"NUTANIX-NCA-75-Q118","objective":"1.3","type":"recall","source":"NCAEBG","locator":"Objective 1.3 Self-Service Restore","verified":"2026-10-10"} -->

---

### Q19
A sales engineer needs to gather configuration and inventory data from a prospect's environment for sizing, without installing anything permanent. Which tool collects this?
- A) Collector
- B) X-Ray
- C) Witness
- D) LCM

**Answer: A**
Collector gathers environment inventory and utilization data used for analysis and sizing recommendations. X-Ray then validates performance characteristics with controlled tests.
<!-- {"id":"NUTANIX-NCA-75-Q119","objective":"1.3","type":"recall","source":"NCAEBG","locator":"Objective 1.3 Collector","verified":"2026-10-10"} -->

---

### Q20
In a two-node branch cluster, what exactly does the Witness do during a node failure?
- A) Stores a third copy of all data
- B) Routes all VM traffic
- C) Replaces the failed node's disks
- D) Acts as the tiebreaker so the surviving node can safely assume cluster leadership

**Answer: D**
The Witness provides quorum arbitration: a lightweight VM or service that breaks ties so a survivor knows it may take over safely. It holds no VM data and carries no workloads.
<!-- {"id":"NUTANIX-NCA-75-Q120","objective":"1.3","type":"diagnosis","source":"NCAEBG","locator":"Objective 1.3 Witness function","verified":"2026-10-10"} -->

---

### Q21
A department wants file shares for home directories served from the same Nutanix platform running their VMs. Which product provides this?
- A) X-Ray
- B) Flow
- C) Nutanix Unified Storage (Files for SMB/NFS shares)
- D) A separate physical NAS only

**Answer: C**
Nutanix Unified Storage includes Files for SMB/NFS file services (plus Objects for S3-compatible storage) on the same platform, consolidating storage silos. Flow is network security, not file serving.
<!-- {"id":"NUTANIX-NCA-75-Q121","objective":"1.2","type":"recall","source":"NCAEBG","locator":"Objective 1.2 Unified Storage/Files","verified":"2026-10-10"} -->

---

### Q22
A backup team wants S3-compatible object storage on the cluster for long-term retention targets. Which Nutanix capability applies?
- A) NGT
- B) Foundation
- C) Objects (part of Nutanix Unified Storage)
- D) Prism dashboards

**Answer: C**
Objects delivers S3-compatible object storage on the platform, a common backup and archive target. It complements Files (file protocols) and block storage under the unified storage umbrella.
<!-- {"id":"NUTANIX-NCA-75-Q122","objective":"1.2","type":"recall","source":"NCAEBG","locator":"Objective 1.2 Objects","verified":"2026-10-10"} -->

---

### Q23
A database team wants automated provisioning, cloning, patching, and refresh of their database fleet with point-in-time copies for developers. Which Nutanix service fits?
- A) X-Ray
- B) Witness
- C) Nutanix Database Service (NDB), the database automation offering
- D) Manual installs per request

**Answer: C**
NDB (formerly Era) automates database lifecycle operations: provisioning, cloning with efficient copies, patching, and refresh. It targets the toil of database administration, not performance testing.
<!-- {"id":"NUTANIX-NCA-75-Q123","objective":"1.2","type":"recall","source":"NCAEBG","locator":"Objective 1.2 Nutanix Database Service","verified":"2026-10-10"} -->

---

### Q24
Leadership wants visibility into cloud spending across on-prem and public cloud with rightsizing recommendations. Which NCM capability covers this?
- A) Cost Management (governance) within Nutanix Cloud Manager
- B) A calculator and hope
- C) NGT
- D) Foundation

**Answer: A**
NCM's cost management provides multicloud spend visibility, budgeting, and optimization recommendations. It is part of the broader NCM suite alongside intelligent operations and self-service.
<!-- {"id":"NUTANIX-NCA-75-Q124","objective":"1.2","type":"recall","source":"NCAEBG","locator":"Objective 1.2 NCM cost management","verified":"2026-10-10"} -->

---

### Q25
A dev team must self-provision approved application stacks from a catalog without waiting on infrastructure tickets. Which NCM feature provides this?
- A) X-Ray
- B) NCM Self-Service (blueprints and marketplace)
- C) Root passwords for everyone
- D) A suggestion box

**Answer: B**
Self-Service lets teams publish blueprinted applications to a marketplace where users deploy within policy. It shifts routine provisioning from tickets to governed automation.
<!-- {"id":"NUTANIX-NCA-75-Q125","objective":"1.2","type":"recall","source":"NCAEBG","locator":"Objective 1.2 NCM Self-Service","verified":"2026-10-10"} -->

---

### Q26
An enterprise is standardizing container platforms across teams and wants a supported Kubernetes offering on its Nutanix estate. Which product applies?
- A) Nutanix Kubernetes Platform
- B) Files
- C) Move
- D) Pulse

**Answer: A**
The Nutanix Kubernetes Platform provides managed Kubernetes deployment and lifecycle on the infrastructure, with data services for persistent workloads. Files and Move serve storage and migration roles.
<!-- {"id":"NUTANIX-NCA-75-Q126","objective":"1.2","type":"recall","source":"NCAEBG","locator":"Objective 1.2 Nutanix Kubernetes Platform","verified":"2026-10-10"} -->

---

### Q27
A company wants to serve virtual desktops to 500 remote workers from its Nutanix clusters. Which use-case family is this?
- A) Dark-site LCM
- B) Two-node clustering
- C) Storage deduplication
- D) End-User Computing (VDI) on Nutanix

**Answer: D**
EUC/VDI is a first-class Nutanix use case: hosting brokered virtual desktops at scale, benefiting from the platform's predictable performance. It is a workload category, not a maintenance feature.
<!-- {"id":"NUTANIX-NCA-75-Q127","objective":"1.2","type":"recall","source":"NCAEBG","locator":"Objective 1.2 EUC/VDI","verified":"2026-10-10"} -->

---

### Q28
A security operations center wants centralized security monitoring, compliance posture, and anomaly alerts for the Nutanix environment. Which offering fits?
- A) X-Ray
- B) Collector
- C) Foundation
- D) NCM Security Central

**Answer: D**
Security Central aggregates security posture and monitoring for the environment within the NCM suite, complementing Flow's traffic enforcement. X-Ray and Collector serve testing and inventory roles.
<!-- {"id":"NUTANIX-NCA-75-Q128","objective":"1.2","type":"recall","source":"NCAEBG","locator":"Objective 1.2 NCM Security Central","verified":"2026-10-10"} -->

---

### Q29
An ops team wants the platform to detect unusual VM resource behavior automatically and surface it before users complain. Which NCM capability is this?
- A) Witness arbitration
- B) Intelligent Operations with behavioral anomaly detection
- C) Manual spreadsheet reviews
- D) Foundation imaging

**Answer: B**
NCM Intelligent Operations applies machine learning to performance data, flagging anomalies and forecasting capacity, reducing time spent staring at dashboards.
<!-- {"id":"NUTANIX-NCA-75-Q129","objective":"1.2","type":"recall","source":"NCAEBG","locator":"Objective 1.2 NCM Intelligent Operations","verified":"2026-10-10"} -->

---

### Q30
A research group wants to run private AI model serving on its existing Nutanix infrastructure with GPU support. Which product family targets this?
- A) Nutanix Enterprise AI
- B) Nutanix Files
- C) Move
- D) Pulse

**Answer: A**
Enterprise AI addresses deploying and operating AI/LLM workloads on the platform with the required compute (including GPUs) and tooling. Files provides shares; Move migrates; Pulse reports health telemetry.
<!-- {"id":"NUTANIX-NCA-75-Q130","objective":"1.2","type":"recall","source":"NCAEBG","locator":"Objective 1.2 Enterprise AI","verified":"2026-10-10"} -->

---

### Q31
An admin must deploy a new Windows VM on AHV with proper paravirtual storage and network drivers. What should be used during creation?
- A) VirtIO drivers mounted for the Windows installer on AHV
- B) IDE emulation for everything
- C) No drivers at all
- D) A physical DVD

**Answer: A**
AHV uses VirtIO paravirtual devices for performance; Windows installs need the VirtIO driver media attached so the installer can see the disk and network. NGT installs afterward inside the guest.
<!-- {"id":"NUTANIX-NCA-75-Q131","objective":"2.1","type":"recall","source":"NCAEBG","locator":"Objective 2.1 VM deployment, VirtIO","verified":"2026-10-10"} -->

---

### Q32
A team deploys twenty identical web servers monthly. What platform feature removes repetitive manual builds?
- A) Screenshots of the old server
- B) A shared password list
- C) VM templates cloned for each new deployment
- D) Reinstalling from ISO twenty times

**Answer: C**
Templates capture a gold image (OS, config, agents) so new VMs deploy consistently in minutes. Template management is a standard Prism VM workflow.
<!-- {"id":"NUTANIX-NCA-75-Q132","objective":"2.1","type":"recall","source":"NCAEBG","locator":"Objective 2.1 VM templates","verified":"2026-10-10"} -->

---

### Q33
A database VM needs more RAM, but the admin wants to avoid a maintenance window. What determines whether memory can be added live?
- A) The rack's height
- B) The number of snapshots
- C) The VM's name
- D) Memory hot-plug support and configuration for that VM/guest

**Answer: D**
CPU and memory hot-plug allow resource additions to running VMs when enabled and supported by the guest OS. Without hot-plug configured, changes require power-off, which is why it is planned in advance.
<!-- {"id":"NUTANIX-NCA-75-Q133","objective":"2.1","type":"diagnosis","source":"NCAEBG","locator":"Objective 2.1 CPU/memory hot-plug","verified":"2026-10-10"} -->

---

### Q34
An application owner asks for a point-in-time copy of a VM before a risky patch, kept for a week. What feature provides this?
- A) A VM snapshot
- B) A VLAN
- C) A license key
- D) A new container

**Answer: A**
Snapshots capture a VM's state at a point in time for quick rollback or recovery, stored efficiently on the platform. They complement, but do not replace, backups for longer retention.
<!-- {"id":"NUTANIX-NCA-75-Q134","objective":"2.1","type":"recall","source":"NCAEBG","locator":"Objective 2.1 snapshots","verified":"2026-10-10"} -->

---

### Q35
A storage admin wants a VM's virtual disk moved to a different storage container with performance-tier policies. What operation applies?
- A) Delete and recreate the VM
- B) Rename the VM
- C) Reboot the cluster
- D) Change the vDisk placement to the target container

**Answer: D**
vDisk placement changes migrate a VM's virtual disks between containers (with their different policies) without recreating the VM. It is a routine storage administration task in Prism.
<!-- {"id":"NUTANIX-NCA-75-Q135","objective":"2.1","type":"recall","source":"NCAEBG","locator":"Objective 2.1 vDisk placement","verified":"2026-10-10"} -->

---

### Q36
Ops wants to group VMs as "production", "finance", or "web-tier" so policies and reports apply by group instead of per-VM. What mechanism does this?
- A) Separate clusters per app
- B) Colored cables
- C) Categories (key-value tags assigned to VMs and other entities)
- D) Renaming VMs with prefixes

**Answer: C**
Categories tag entities with key-value pairs used by policies (protection, security, reporting) across the environment. They are the platform's grouping fabric, far more robust than naming conventions.
<!-- {"id":"NUTANIX-NCA-75-Q136","objective":"2.1","type":"recall","source":"NCAEBG","locator":"Objective 2.1 categories","verified":"2026-10-10"} -->

---

### Q37
A VM must be reachable on the corporate VLAN 220 with a specific IP plan. What does the admin configure on the VM?
- A) Assign it to a storage container
- B) Increase its snapshot count
- C) Change its category color
- D) Attach its virtual NIC to the VLAN 220 subnet/network and set addressing per policy

**Answer: D**
VM network attributes are set on its virtual NICs: which virtual network/subnet it joins (mapping to a VLAN) and IP configuration (direct or via IPAM). Storage containers hold disks, not connectivity.
<!-- {"id":"NUTANIX-NCA-75-Q137","objective":"2.1","type":"diagnosis","source":"NCAEBG","locator":"Objective 2.1 VM network attributes","verified":"2026-10-10"} -->

---

### Q38
A VM's disk is filling. What are the two common platform-side remedies? (Choose two.)
- A) Expand the existing vDisk (with guest partition/extension afterward)
- B) Add a new vDisk to the VM
- C) Delete snapshots blindly
- D) Add more vNICs
- E) Change the VM's category

**Correct Answer: A, B**
Capacity grows by expanding a disk or attaching another; both are Prism VM operations, with guest-side steps to use the space. Network adapters and categories do not add storage.
<!-- {"id":"NUTANIX-NCA-75-Q138","objective":"2.1","type":"diagnosis","source":"NCAEBG","locator":"Objective 2.1 VM storage configuration","verified":"2026-10-10"} -->

---

### Q39
An admin clones a VM, but the clone boots with the same computer name and IP, conflicting with the original. What should have been used?
- A) A longer VM name
- B) Guest customization (sysprep/customization script) during cloning
- C) Nothing; clones are always unique
- D) A different rack

**Answer: B**
Cloning copies identity as well as data. Guest customization generalizes the clone (new SID, hostname, and network identity), preventing duplicate-identity conflicts on the network.
<!-- {"id":"NUTANIX-NCA-75-Q139","objective":"2.1","type":"diagnosis","source":"NCAEBG","locator":"Objective 2.1 cloning and customization","verified":"2026-10-10"} -->

---

### Q40
A test VM must not be included in the nightly replication to the DR site. Where is this exclusion typically controlled?
- A) In the DNS suffix
- B) In the rack PDU
- C) In the protection/replication policy or category assignment that defines what replicates
- D) In the VM's wallpaper

**Answer: C**
Replication scope is defined by protection domains/policies and category membership. Keeping test VMs out of the protected categories excludes them without touching production settings.
<!-- {"id":"NUTANIX-NCA-75-Q140","objective":"2.1","type":"diagnosis","source":"NCAEBG","locator":"Objective 2.1 snapshot/protection scoping","verified":"2026-10-10"} -->

---

### Q41
A new VLAN-backed subnet must be created for guest VMs on AHV. Where does the admin create it?
- A) In the BIOS of one VM
- B) In the backup software
- C) In Prism, defining a virtual network mapped to the VLAN (optionally with IPAM)
- D) On the SAN

**Answer: C**
Guest networks are created as virtual networks/subnets in Prism bound to a VLAN ID, optionally with managed IP address management. VMs then attach their vNICs to that network.
<!-- {"id":"NUTANIX-NCA-75-Q141","objective":"2.2","type":"recall","source":"NCAEBG","locator":"Objective 2.2 create subnet","verified":"2026-10-10"} -->

---

### Q42
An engineer wants DHCP and consistent address assignment for a VM subnet managed by the platform itself. Which feature provides it?
- A) IP Address Management (IPAM) on the virtual network
- B) Static spreadsheets
- C) APIPA
- D) MAC filtering

**Answer: A**
With IPAM enabled on a virtual network, the platform manages address assignment for attached VMs, reducing spreadsheet drift and conflicts. Without it, addressing is the guest's or an external DHCP server's job.
<!-- {"id":"NUTANIX-NCA-75-Q142","objective":"2.2","type":"recall","source":"NCAEBG","locator":"Objective 2.2 IPAM","verified":"2026-10-10"} -->

---

### Q43
Which statement correctly distinguishes the AHV virtual switch types an admin configures?
- A) AHV has no virtual networking
- B) vSwitches only exist in the public cloud
- C) Bridges bind VM traffic to physical uplinks (optionally bonded), and virtual switches can span hosts for consistent networking
- D) Each VM gets its own physical NIC always

**Answer: C**
AHV networking builds on Open vSwitch: bridges/bridge chains map VM networks onto physical or bonded ports, and multicluster virtual switches keep configuration consistent across hosts and clusters.
<!-- {"id":"NUTANIX-NCA-75-Q143","objective":"2.2","type":"recall","source":"NCAEBG","locator":"Objective 2.2 AHV bridges/vSwitches","verified":"2026-10-10"} -->

---

### Q44
Two 10 GbE ports per host should act as one resilient path for VM traffic, surviving a single link or switch failure. What is configured?
- A) Two separate unrelated bridges
- B) Disabling one port permanently
- C) A longer cable
- D) A bond across the uplinks with the appropriate mode

**Answer: D**
Bonded ports aggregate and fail over host uplinks, providing throughput and resilience for VM networking. Bond type selection (active-backup, balance) depends on the upstream switch configuration.
<!-- {"id":"NUTANIX-NCA-75-Q144","objective":"2.2","type":"recall","source":"NCAEBG","locator":"Objective 2.2 bond types","verified":"2026-10-10"} -->

---

### Q45
A network team wants to see how VMs, virtual switches, and physical uplinks connect across the environment in one topology view. Which Prism capability provides this?
- A) The network visualizer
- B) The licensing page
- C) The snapshot list
- D) The SMTP settings

**Answer: A**
The network visualizer renders the environment's logical and physical network topology, making it far easier to trace a VM's path to the wire than clicking through individual entities.
<!-- {"id":"NUTANIX-NCA-75-Q145","objective":"2.2","type":"recall","source":"NCAEBG","locator":"Objective 2.2 network visualizer","verified":"2026-10-10"} -->

---

### Q46
A security review requires isolating backup traffic from production VM traffic on the hosts. Which networking approach applies?
- A) Separate VLAN-backed networks/bridges for backup traffic segmentation
- B) One flat network for everything
- C) Disable all networking nightly
- D) Longer hostnames

**Answer: A**
Segmentation on the platform is done with distinct networks/VLANs per traffic type, keeping backup flows off production segments. It simplifies policy, QoS, and troubleshooting.
<!-- {"id":"NUTANIX-NCA-75-Q146","objective":"2.2","type":"diagnosis","source":"NCAEBG","locator":"Objective 2.2 network segmentation","verified":"2026-10-10"} -->

---

### Q47
A network engineer wants traffic mirrored from selected VMs to an analysis VM for deep inspection. Which AHV capability supports this?
- A) Deleting the vSwitch
- B) Disabling NGT
- C) Traffic mirroring on AHV hosts
- D) Increasing MTU

**Answer: C**
AHV supports mirroring traffic to a designated target for monitoring and analysis, the virtual equivalent of switch SPAN ports, useful for IDS and troubleshooting.
<!-- {"id":"NUTANIX-NCA-75-Q147","objective":"2.2","type":"recall","source":"NCAEBG","locator":"Objective 2.2 traffic mirroring","verified":"2026-10-10"} -->

---

### Q48
An admin needs to verify the physical switch ports and VLANs the hosts' uplinks connect to after a cabling change. What is the pragmatic check?
- A) Reboot every VM
- B) Change the cluster name
- C) Disable IPAM
- D) Review host network configuration and monitor the physical switches' port/VLAN state for consistency with the design

**Answer: D**
Virtual networking only works if the physical side matches: correct VLANs trunked to host uplinks and healthy port state. Verifying both sides after cabling work prevents silent segmentation faults.
<!-- {"id":"NUTANIX-NCA-75-Q148","objective":"2.2","type":"diagnosis","source":"NCAEBG","locator":"Objective 2.2 physical switch monitoring","verified":"2026-10-10"} -->

---

### Q49
A storage-heavy VM cluster is running low on capacity. Which two data-efficiency features can reclaim space, workload permitting? (Choose two.)
- A) Deduplication
- B) Compression
- C) Replication factor increase
- D) Adding vNICs
- E) Enabling Flow policies

**Correct Answer: A, B**
Deduplication removes redundant blocks and compression shrinks data, both trading some overhead for capacity. Raising replication factor consumes more space, not less.
<!-- {"id":"NUTANIX-NCA-75-Q149","objective":"2.3","type":"recall","source":"NCAEBG","locator":"Objective 2.3 deduplication/compression","verified":"2026-10-10"} -->

---

### Q50
An archive workload with cold data must store more terabytes per node while keeping failure tolerance. Which space-efficiency technique fits, and what does it do?
- A) Adding more snapshots
- B) Erasure coding, which stripes data with parity for better capacity efficiency than full replicas on suitable data
- C) Disabling all redundancy
- D) ZIP files by hand

**Answer: B**
Erasure coding encodes data into fragments with parity so protection costs far less capacity than replica copies, best suited to cold/write-once data. It complements, not replaces, replication factor choices.
<!-- {"id":"NUTANIX-NCA-75-Q150","objective":"2.3","type":"recall","source":"NCAEBG","locator":"Objective 2.3 erasure coding","verified":"2026-10-10"} -->

---

### Q51
An app needs block storage presented directly to a bare-metal database server outside the cluster. Which Nutanix storage type serves this?
- A) A VM template
- B) Volumes (block storage via volume groups over iSCSI)
- C) Files (SMB shares)
- D) Objects (S3)

**Answer: B**
Volume groups expose block devices over iSCSI to external hosts or clustered apps. Files serves NAS protocols; Objects serves S3; the three storage types exist for distinct consumers.
<!-- {"id":"NUTANIX-NCA-75-Q151","objective":"2.3","type":"recall","source":"NCAEBG","locator":"Objective 2.3 storage types, volume groups","verified":"2026-10-10"} -->

---

### Q52
A cluster at RF2 hosts a mission-critical VM whose loss is unacceptable even during dual failures. What change raises its data resilience?
- A) Rename its container
- B) Move its data to an RF3 container/policies, accepting the extra capacity cost
- C) Delete its snapshots
- D) Disable compression

**Answer: B**
Replication factor is set per container: RF3 keeps three copies, tolerating two simultaneous failures. The tradeoff is capacity, which is why RF3 is reserved for the workloads that justify it.
<!-- {"id":"NUTANIX-NCA-75-Q152","objective":"2.3","type":"diagnosis","source":"NCAEBG","locator":"Objective 2.3 RF configuration","verified":"2026-10-10"} -->

---

### Q53
After a disk failure, the cluster rebuilds data onto remaining drives. Why do designs reserve rebuild capacity?
- A) To slow down rebuilds
- B) So re-protection can complete after failures without filling the cluster to 100%
- C) To store vacation photos
- D) Because disks need exercise

**Answer: B**
Rebuilding replicas needs free space; a cluster running near capacity cannot re-protect data after a failure, leaving it exposed. Reserved rebuild capacity is a standard sizing rule for exactly this reason.
<!-- {"id":"NUTANIX-NCA-75-Q153","objective":"2.3","type":"diagnosis","source":"NCAEBG","locator":"Objective 2.3 rebuild capacity reservation","verified":"2026-10-10"} -->

---

### Q54
An admin compares storage containers for two workloads: one latency-sensitive database, one archive share. What differs between their containers?
- A) Only the VLAN
- B) Policies such as replication factor, dedup/compression, and erasure coding tuned per workload
- C) The container names must rhyme
- D) Containers cannot differ

**Answer: B**
Containers carry the storage policies: redundancy and efficiency features are chosen per container to match workload needs. That per-workload tuning is the point of multiple containers.
<!-- {"id":"NUTANIX-NCA-75-Q154","objective":"2.3","type":"recall","source":"NCAEBG","locator":"Objective 2.3 storage container policies","verified":"2026-10-10"} -->

---

### Q55
An admin must confirm a cluster's license state before adding nodes. Where is this checked?
- A) The VM console
- B) The physical invoice drawer only
- C) The DNS zone
- D) The licensing view in Prism (current state, type, and expiration)

**Answer: D**
Prism's license manager shows applied licenses, capacity, and expiry, and supports assigning, reclaiming, and unassigning. Verifying before expansion avoids feature or capacity shortfalls.
<!-- {"id":"NUTANIX-NCA-75-Q155","objective":"2.4","type":"recall","source":"NCAEBG","locator":"Objective 2.4 license state","verified":"2026-10-10"} -->

---

### Q56
A cluster is being decommissioned and its licenses are needed on a newer cluster. What is the correct sequence?
- A) Reclaim the licenses from the old cluster (including when destroying it), then assign them to the new one
- B) Buy duplicates and discard the old
- C) Licenses cannot move
- D) Email the licenses around

**Answer: A**
Licenses are portable assets: reclaiming frees them for reassignment, and the destroy-cluster workflow includes reclamation. This protects the investment during hardware refreshes.
<!-- {"id":"NUTANIX-NCA-75-Q156","objective":"2.4","type":"recall","source":"NCAEBG","locator":"Objective 2.4 reclaim/assign licenses","verified":"2026-10-10"} -->

---

### Q57
A fully disconnected site must license its cluster without internet connectivity. Which method applies?
- A) Seamless licensing only
- B) Licenses are unnecessary
- C) Carrier pigeon
- D) Manual (offline) license management, exchanging files with the licensing portal

**Answer: D**
Disconnected environments use the manual workflow: generating and applying license files through the portal rather than automatic online (seamless) licensing. Both end at the same licensed state.
<!-- {"id":"NUTANIX-NCA-75-Q157","objective":"2.4","type":"diagnosis","source":"NCAEBG","locator":"Objective 2.4 manual vs seamless licensing","verified":"2026-10-10"} -->

---

### Q58
An audit asks which license tier fits a cluster that only needs core infrastructure services, versus one needing advanced features. What determines the choice?
- A) The cluster's color
- B) The number of cables
- C) Alphabetical order
- D) The use case and required features, mapped to the appropriate license tier

**Answer: D**
License tiers bundle capabilities; selecting one starts from required features and workload, then matches the tier and any add-ons. Buying for features you never enable wastes budget; under-licensing blocks required functions.
<!-- {"id":"NUTANIX-NCA-75-Q158","objective":"2.4","type":"recall","source":"NCAEBG","locator":"Objective 2.4 license by use case","verified":"2026-10-10"} -->

---

### Q59
A license expiration warning appears for a cluster in 30 days. What is the right action?
- A) Disable all VMs
- B) Plan renewal/reassignment before expiry and verify the applied licenses and their dates in the licensing view
- C) Ignore it; warnings clear themselves
- D) Destroy the cluster now

**Answer: B**
Expiration warnings exist to trigger action while there is time: verify what expires, renew or reassign, and confirm the new state. Letting licenses lapse risks feature and capacity restrictions.
<!-- {"id":"NUTANIX-NCA-75-Q159","objective":"2.4","type":"diagnosis","source":"NCAEBG","locator":"Objective 2.4 license expiration","verified":"2026-10-10"} -->

---

### Q60
An operator wants to see all available (unassigned) licenses owned by the organization across registered clusters. Where can this be inspected?
- A) The SMTP test dialog
- B) The licensing inventory in Prism Central/Nutanix Central license management
- C) The VM snapshot page
- D) The network visualizer

**Answer: B**
Centralized license management exposes the pool of available versus assigned licenses across the estate, enabling reassignment without purchase when headroom exists.
<!-- {"id":"NUTANIX-NCA-75-Q160","objective":"2.4","type":"recall","source":"NCAEBG","locator":"Objective 2.4 license inventory","verified":"2026-10-10"} -->

---
