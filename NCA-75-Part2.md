# NCA 7.5 Beta Practice Questions – Domains 3 & 4

## Domain 3: Maintain Environmental Health (~25%)

---

### Q1
Which Nutanix tool performs comprehensive health checks across all cluster services and components?
- A) Pulse
- B) NCC (Nutanix Cluster Check)
- C) Logbay
- D) Stargate Monitor

**Answer: B**
NCC (Nutanix Cluster Check) runs comprehensive health checks across all cluster services, hardware, configuration, and software components. It can be run on-demand or scheduled and produces detailed reports with severity levels. Pulse sends telemetry, Logbay collects logs, and Stargate Monitor shows I/O metrics.

---

### Q2
An administrator runs `ncc health_checks run_all` and sees a warning about metadata ring consistency. Which service should be investigated?
- A) Stargate
- B) Medusa / Cassandra
- C) Zeus
- D) Genesis

**Answer: B**
Medusa is the access layer for Apache Cassandra, the distributed key-value store that holds the cluster's global metadata in a ring-based architecture. Metadata ring consistency issues indicate potential problems in the Cassandra ring that need diagnosis with tools like `nodetool`.

---

### Q3
What is the purpose of Pulse in a Nutanix cluster?
- A) To provide real-time VM performance metrics
- B) To send cluster health and diagnostics telemetry to Nutanix support
- C) To replicate data between sites for DR
- D) To manage user authentication

**Answer: B**
Pulse sends cluster health diagnostics, configuration data, and performance metrics to Nutanix support (insights.nutanix.com:443 via HTTPS). This enables proactive support, automatic case creation for critical alerts, and capacity/trending analysis. Pulse is enabled by default but can be opted out.

---

### Q4
Which Pulse feature automatically creates a Nutanix support case when critical alerts are detected?
- A) Pulse Basic
- B) Pulse HD
- C) Pulse Premium
- D) Pulse Watch

**Answer: B**
Pulse HD (formerly Pulse Advanced) automatically creates support cases for critical alerts, sends richer diagnostic telemetry, and provides enhanced proactive support capabilities. It requires internet connectivity to insights.nutanix.com.

---

### Q5
An administrator sees an alert with severity "Critical" in Prism. What does this severity level indicate?
- A) Informational only; no action required
- B) Minor issue that can be addressed during maintenance windows
- C) A serious problem requiring immediate attention
- D) A configuration suggestion for optimization

**Answer: C**
Critical severity indicates a serious problem that requires immediate attention and may impact cluster availability or data integrity. Alert severities are: Info, Warning, Critical. Critical alerts may trigger automatic support case creation with Pulse HD.

---

### Q6
What should an administrator check first when investigating a cluster health alert about high controller latency?
- A) Network switch port errors
- B) Per-VM IOPS and latency in the VM dashboard to identify the offending workload
- C) DNS resolution on the CVMs
- D) The hypervisor version

**Answer: B**
Controller latency alerts indicate storage subsystem stress. The first step is to identify which VM(s) are driving the I/O using Prism's VM dashboard — sort by controller IOPS or latency. This isolates the workload causing the stress before investigating further.

---

### Q7
Which log collection tool is the primary method for gathering diagnostic data for Nutanix support cases?
- A) Pulse
- B) Logbay
- C) syslog
- D) CloudWatch

**Answer: B**
Logbay is the primary tool for collecting comprehensive diagnostic logs from CVMs and other cluster components for support cases. The command `logbay collect` gathers logs into a bundle that can be uploaded to Nutanix support. Pulse sends telemetry; syslog is for external forwarding.

---

### Q8
What does the cluster "Resiliency Status" indicate in Prism?
- A) The percentage of cluster CPU currently utilized
- B) Whether the cluster can tolerate failures while maintaining data availability
- C) The number of VMs currently powered on
- D) The status of the Prism Leader election

**Answer: B**
Resiliency Status shows whether the cluster has sufficient redundancy to tolerate failures (node, disk, block) while maintaining data availability. For example, RF2 requires that metadata and data replicas are healthy across enough nodes to survive the configured failure tolerance.

---

### Q9
An administrator notices the cluster resiliency status shows "Degraded." What is the most likely cause?
- A) A single VM is consuming high CPU
- B) The cluster has lost a disk or node, and data rebuild is in progress
- C) The Prism Leader has failed over
- D) Network latency between CVMs is high

**Answer: B**
"Degraded" resiliency typically means the cluster has experienced a component failure (disk, node, or block) and is rebuilding data/redistributing metadata to restore full redundancy. The cluster remains operational but cannot tolerate additional failures of the same type until rebuild completes.

---

### Q10
Which CLI command checks the cluster's ability to tolerate node failures?
- A) `ncli cluster status`
- B) `ncli cluster get-domain-fault-tolerance-status type=node`
- C) `acli host.list`
- D) `ncc health_checks run_all`

**Answer: B**
`ncli cluster get-domain-fault-tolerance-status type=node` checks whether the cluster can tolerate node failures based on current data placement and metadata distribution. There is also a `type=rackable_unit` variant for block-level fault tolerance.

---

### Q11
What is the recommended way to create a custom alert policy in Prism Central?
- A) Edit the cluster configuration XML directly
- B) Use Prism Central Alerts & Monitoring → Alert Policies → Create Alert Policy
- C) Run `ncli alert policy create`
- D) Configure via REST API v2.0 only

**Answer: B**
Prism Central provides a GUI workflow for creating custom alert policies under Alerts & Monitoring. Administrators define conditions (e.g., VM CPU > 90% for 5 minutes), severity, and notification targets. This enables proactive, workload-specific alerting beyond built-in defaults.

---

### Q12
An administrator needs to forward Nutanix alerts to an external SIEM system. Which feature enables this?
- A) Pulse HD
- B) SNMP traps and Syslog forwarding
- C) Logbay streaming
- D) Calm orchestration

**Answer: B**
SNMP traps and Syslog forwarding allow Nutanix alerts and events to be sent to external monitoring systems and SIEM platforms. This is configured in Prism under alert settings. Pulse sends data to Nutanix, not to customer SIEMs.

---

### Q13
Which statement is true regarding NCC pre-upgrade health checks?
- A) They are optional and rarely needed
- B) They must pass successfully before LCM will allow an upgrade to proceed
- C) They only check hypervisor compatibility
- D) They require Prism Central to be deployed

**Answer: B**
NCC pre-upgrade health checks are a mandatory gating step in LCM. If critical checks fail, the upgrade cannot proceed until the issues are resolved. These checks validate cluster health, data resiliency, configuration compatibility, and sufficient resources.

---

### Q14
What information is typically required when opening a Nutanix support case?
- A) Only the cluster name
- B) Cluster serial number, AOS version, description of the issue, and Logbay output
- C) The number of VMs in the cluster
- D) The IP address of the Prism Leader only

**Answer: B**
A complete support case includes: cluster serial number (or license ID), current AOS version, detailed description of the issue, any error messages, and Logbay diagnostic output. This enables support engineers to efficiently diagnose and resolve issues.

---

### Q15
Which service is responsible for automatically rebuilding data when a disk fails in a Nutanix cluster?
- A) Curator
- B) Stargate
- C) Genesis
- D) Cerebro

**Answer: A**
Curator is the map-reduce framework that handles background maintenance tasks including garbage collection, disk balancing, and initiating data rebuilds when disk or node failures occur. Stargate handles I/O but Curator coordinates the rebuild and rebalancing processes.

---

### Q16
What is the primary difference between Metric Charts and Entity Charts in Prism?
- A) Metric Charts are for VMs; Entity Charts are for hosts
- B) Metric Charts show performance data over time; Entity Charts show the relationship and state of objects
- C) Metric Charts are real-time only; Entity Charts are historical only
- D) There is no difference

**Answer: B**
Metric Charts display performance metrics (IOPS, latency, CPU, memory) over time for selected entities. Entity Charts show the relationships, topology, and state of objects (e.g., which VMs are on which hosts, network connections, protection domain membership).

---

### Q17
An administrator wants to monitor the health of individual SSDs in the cluster. Where is this information found?
- A) VM Dashboard
- B) Hardware page in Prism → Disks tab
- C) Network Configuration page
- D) Protection Domain status

**Answer: B**
The Hardware page in Prism provides disk-level health information including individual SSD/HDD status, serial numbers, firmware versions, capacity utilization, and ONFi/drive health metrics. This is the correct location for physical disk monitoring.

---

### Q18
Which alarm severity in Prism indicates a condition that should be investigated but does not immediately impact operations?
- A) Info
- B) Warning
- C) Critical
- D) Emergency

**Answer: B**
Warning indicates a condition that should be investigated and addressed but does not immediately impact cluster operations or data availability. Info is informational only. Critical requires immediate attention. There is no "Emergency" severity in standard Prism alerting.

---

### Q19
What is the purpose of the "Two-Level Alert Grouping" feature introduced in newer Prism Central versions?
- A) It reduces the number of alerts sent to syslog
- B) It groups related alerts by entity and alert type to reduce noise
- C) It disables duplicate alerts from appearing in Prism Element
- D) It escalates all warnings to critical after 10 minutes

**Answer: B**
Two-Level Alert Grouping organizes alerts first by entity (e.g., a specific VM or host) and then by alert type, reducing alert noise and making it easier to identify root causes when multiple related alerts fire. This improves operability in large environments.

---

### Q20
An administrator notices high CPU ready time on a VM. What does this indicate?
- A) The VM has more vCPUs than needed
- B) The VM is waiting for physical CPU cycles due to host CPU contention
- C) The VM's guest OS has a runaway process
- D) The hypervisor is misconfigured

**Answer: B**
CPU ready time measures the percentage of time a VM is ready to run but is waiting for the hypervisor to schedule it on physical CPU cores. High ready time indicates CPU resource contention on the host — either too many VMs or insufficient physical cores.

---

## Domain 4: Describe Cluster Configuration (~25%)

---

### Q21
What is the difference between Redundancy Factor (RF) and Replication Factor?
- A) They are the same thing with different names
- B) Redundancy Factor is cluster-level; Replication Factor is container-level
- C) Redundancy Factor applies to networking; Replication Factor applies to storage
- D) Redundancy Factor is for metadata only; Replication Factor is for data only

**Answer: B**
Redundancy Factor is a cluster-level setting that defines overall fault tolerance (FT1 = tolerate 1 failure, FT2 = tolerate 2). Replication Factor is set per storage container and defines how many copies of data are maintained. Cluster RF must be ≥ container RF.

---

### Q22
A cluster has Redundancy Factor 2. Which container Replication Factors can be created?
- A) RF1 and RF2 only
- B) RF2 and RF3 only
- C) RF1, RF2, and RF3
- D) RF2 only

**Answer: A**
With cluster Redundancy Factor 2 (FT1), only RF1 and RF2 containers can be created. RF3 requires cluster Redundancy Factor 3 (FT2), which needs a minimum of 5 nodes and 32 GB CVM RAM. The cluster RF must be greater than or equal to the container RF.

---

### Q23
How many copies of metadata are maintained in an RF2 cluster?
- A) 1
- B) 2
- C) 3
- D) 5

**Answer: C**
In an RF2 cluster, metadata (managed by Cassandra) is stored in 3 copies, while data is stored in 2 copies. In an RF3 cluster, metadata has 5 copies and data has 3 copies. Metadata always has more replicas than data for safety.

---

### Q24
Which storage optimization feature is applied by Curator as a background post-process task?
- A) Inline compression
- B) OpLog write coalescing
- C) Erasure Coding (EC-X)
- D) VirtIO driver optimization

**Answer: C**
Erasure Coding (EC-X) is applied post-process by Curator to cold data after a configurable delay (default ~1 hour). Inline compression occurs at write time. OpLog is part of the write path in Stargate. VirtIO is a paravirtual driver, not a storage optimization.

---

### Q25
A workload consists of cold archive data that is rarely accessed. Which storage feature provides the best capacity efficiency?
- A) RF3 replication
- B) Erasure Coding with a 4+1 strip
- C) Inline compression only
- D) Deduplication only

**Answer: B**
Erasure Coding provides the best capacity efficiency for cold, rarely accessed data. A 4+1 strip on RF2 delivers approximately 37.5% space savings compared to full replication. EC-X is not suitable for hot/active data due to rebuild overhead. For cold archives, EC-X is ideal.

---

### Q26
Which compression algorithm does Nutanix use for inline and post-process compression?
- A) Gzip
- B) LZ4
- C) Zstd
- D) Brotli

**Answer: B**
Nutanix uses the LZ4 compression algorithm for both inline compression (during write, for sequential I/O >64KB) and post-process compression (by Curator). LZ4 is chosen for its excellent compression speed with reasonable compression ratios, minimizing CPU overhead.

---

### Q27
What is the approximate space savings of EC-X on an RF2 cluster compared to standard RF2 replication?
- A) ~10%
- B) ~25%
- C) ~33-37%
- D) ~50%

**Answer: C**
EC-X on RF2 provides approximately 33-37% space savings depending on the strip size. For example, a 4+1 strip has 25% overhead vs. 100% for RF2 replication, yielding 37.5% savings. A 3+1 strip yields ~33% savings. RF3 with EC-X can achieve ~50% savings.

---

### Q28
Which statement about Nutanix deduplication is correct?
- A) Deduplication must be enabled before compression
- B) Capacity deduplication requires cache deduplication to be enabled first
- C) Deduplication is enabled by default on all new containers
- D) Deduplication is performed inline for all I/O

**Answer: B**
Capacity deduplication (post-process, space-saving) requires that cache deduplication (inline, performance-oriented) be enabled first. Enabling both provides maximum space efficiency on workloads with duplicate data blocks. Neither is enabled by default.

---

### Q29
When should an administrator enable compression without deduplication?
- A) For VDI environments with identical base images
- B) For database workloads with mostly unique data
- C) For archive workloads that are write-once
- D) For all workloads by default

**Answer: B**
Databases and workloads with mostly unique data benefit from compression alone because deduplication adds CPU overhead without significant space savings. VDI with linked clones benefits from both dedup and compression. Archive workloads may also benefit from EC-X.

---

### Q30
What is the default ILM (Intelligent Lifecycle Management) tier down-migration threshold?
- A) 50%
- B) 65%
- C) 75%
- D) 90%

**Answer: C**
ILM triggers tier down-migration (moving colder data from SSD to HDD) when overall tier utilization exceeds 75%. This is configurable. The system attempts to free at least 15% of data from the tier or bring utilization to the threshold, whichever is greater.

---

### Q31
Which statement about Nutanix Cloud Clusters (NC2) is correct?
- A) NC2 runs on virtualized EC2 instances using EBS storage
- B) NC2 uses EC2 bare-metal instances with local NVMe SSDs and the full Nutanix stack
- C) NC2 requires on-premises Prism Central for all management
- D) NC2 only supports AHV and not ESXi

**Answer: B**
NC2 deploys on EC2 bare-metal instances (i3.metal, i3en.metal) with local NVMe SSDs managed by the Nutanix Distributed Storage Fabric. It runs the full Nutanix stack (AHV, CVM, Prism Element) just like on-premises. Cloud VMs and EBS are not used for the Nutanix data plane.

---

### Q32
Which Nutanix licensing tier includes all features including encryption, Flow, Metro DR, and advanced orchestration?
- A) Starter
- B) Pro
- C) Ultimate
- D) Enterprise

**Answer: C**
Nutanix Cloud Infrastructure (NCI) Ultimate is the all-inclusive tier that includes encryption at rest, Flow network security, Metro Availability DR, advanced scheduling/orchestration, and add-on products. Starter is limited to on-prem, RF2, 12 nodes max. Pro adds cloud support and many advanced features but some require add-ons.

---

### Q33
What is the minimum cluster size required for RF3 (Redundancy Factor 3)?
- A) 3 nodes
- B) 4 nodes
- C) 5 nodes
- D) 6 nodes

**Answer: C**
RF3 requires a minimum of 5 nodes and 32 GB of CVM RAM. RF2 requires a minimum of 3 nodes. This is because RF3 must distribute 3 data copies and 5 metadata copies across enough nodes to survive 2 simultaneous failures.

---

### Q34
Which type of network in AHV is configured with IPAM enabled so that Nutanix manages IP assignments?
- A) Unmanaged network
- B) Managed network
- C) Overlay network
- D) Trunk network

**Answer: B**
A Managed Network has IPAM enabled, meaning Nutanix manages IP assignments via an integrated DHCP server that intercepts guest DHCP requests and provides static, lifelong assignments. Unmanaged networks rely on external DHCP or manual configuration.

---

### Q35
What is the maximum supported all-flash storage capacity per node in AOS 7.5?
- A) 64 TB
- B) 100 TB
- C) 185 TB
- D) 250 TB

**Answer: C**
AOS 7.5 supports up to 185 TB of raw all-flash storage capacity per node. This is a significant increase from previous versions and is an important number to remember for the NCA 7.5 exam.

---

### Q36
Which Nutanix feature keeps frequently accessed data on the local node's SSD tier to minimize read latency?
- A) ILM down-migration
- B) Data locality
- C) Shadow Clones
- D) RF2 replication

**Answer: B**
Data locality ensures that VM data is kept on or moved to the node where the VM is running, minimizing cross-node reads. After a live migration, writes go local immediately, and AOS migrates extent groups to the local node in the background after access thresholds are met.

---

### Q37
An administrator needs to configure a network for VMs that uses an external DHCP server. Which network type should be selected?
- A) Managed network with IPAM enabled
- B) Unmanaged network
- C) Overlay VPC network
- D) IPAM network with override DHCP server

**Answer: B**
An Unmanaged Network does not use Nutanix IPAM and allows an external DHCP server or manual static IP assignment in the guest OS. This is appropriate when an existing DHCP/IPAM infrastructure is already in place.

---

### Q38
Which Nutanix product provides file storage services (SMB and NFS) on the Nutanix platform?
- A) Nutanix Objects
- B) Nutanix Files
- C) Nutanix Volumes
- D) Nutanix Data Lens

**Answer: B**
Nutanix Files provides distributed file server capabilities with SMB and NFS protocol support using File Server VMs (FSVMs). Objects provides S3-compatible object storage. Volumes provides iSCSI block storage. Data Lens is a cloud-based analytics service for Files.

---

### Q39
What is the purpose of the Witness VM in Metro Availability configurations?
- A) To replicate data between sites
- B) To serve as a third-site tiebreaker to prevent split-brain scenarios
- C) To monitor network latency between sites
- D) To host the Prism Central appliance

**Answer: B**
The Witness VM acts as a third-site tiebreaker in Metro Availability (synchronous replication) setups. It helps prevent split-brain scenarios by providing quorum when network connectivity between the two production sites is lost. It does not replicate data or host PC.

---

### Q40
An administrator is configuring a new container for a transactional database. Which settings are most appropriate?
- A) RF3, deduplication + compression enabled, EC-X enabled
- B) RF3, compression only, no EC-X, pin to SSD tier
- C) RF2, deduplication + compression, EC-X enabled
- D) RF1, compression only, no EC-X

**Answer: B**
For a mission-critical transactional database: RF3 provides maximum availability; compression only avoids dedup overhead on unique data; no EC-X avoids write amplification and latency; SSD pinning ensures hot data stays on the fastest tier.

---

*End of NCA-75-Part2 — Domains 3 & 4 (40 questions)*
