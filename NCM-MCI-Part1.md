# NCM-MCI 6.10 Practice Questions – Domains 1 & 2

## Domain 1: Storage Performance (Q1–Q40)

---

### Q1
An administrator needs to optimize storage performance for a VDI environment experiencing boot storms. Which Nutanix feature should be enabled?
- A) Shadow Clones to cache read-only boot disk data locally on each node
- B) Erasure Coding to reduce storage overhead on boot disks
- C) Post-process compression to reduce boot disk I/O
- D) Increase OpLog size to buffer more write operations

**Answer: A**
Shadow Clones automatically create read-only local copies of heavily-read vDisks across nodes, eliminating cross-node reads during VDI boot storms. This is specifically designed for VDI use cases.

---

### Q2
An administrator observes high write latency on a storage container handling random write workloads. Which DSF component is primarily responsible for absorbing random writes before destaging to the Extent Store?
- A) Unified Cache (Content Cache)
- B) OpLog
- C) Curator
- D) Medusa (metadata store)

**Answer: B**
The OpLog is a write coalescing buffer on SSD that absorbs random writes, coalescing them before sequentially destaging to the Extent Store. Each Stargate instance has approximately 6 GB of OpLog space.

---

### Q3
An administrator runs `ncli container ls` and notices a container with both compression and Erasure Coding enabled. The container hosts a transactional database with heavy random writes. What should the administrator change first to improve write performance?
- A) Disable Erasure Coding, as EC-X encoding adds CPU overhead and write amplification on heavy write workloads
- B) Disable compression, since inline compression is incompatible with Erasure Coding
- C) Enable deduplication to offset the Erasure Coding overhead
- D) Increase the Replication Factor from RF2 to RF3 to distribute the write load

**Answer: A**
Erasure Coding (EC-X) is designed for space efficiency on cold or read-heavy data. On heavy random write workloads, EC adds significant CPU overhead and write amplification due to re-encoding, making it unsuitable for transactional databases.

---

### Q4
While troubleshooting storage performance, an administrator needs to view detailed Stargate I/O metrics for a specific CVM. Which URL provides direct access to the Stargate service page?
- A) `http://<CVM_IP>:2009`
- B) `http://<CVM_IP>:2020`
- C) `http://<CVM_IP>:9440`
- D) `http://<CVM_IP>:2010`

**Answer: A**
The Stargate service page is accessible on port 2009 of any CVM IP. It provides detailed per-vDisk I/O statistics, OpLog utilization, and extent store metrics for troubleshooting.

---

### Q5
An administrator needs to identify which VM is generating an I/O storm on a cluster. Which Prism Element metric combination is most effective for isolating the offending VM?
- A) Controller IOPS and controller latency per VM in the VM dashboard
- B) Cluster-wide throughput and CPU usage in the Hardware dashboard
- C) Storage container replication status in the Data Resiliency dashboard
- D) CVM memory utilization and hypervisor CPU in the Host dashboard

**Answer: A**
The Prism Element VM dashboard shows per-VM controller IOPS, throughput, and latency. Sorting by IOPS or latency quickly identifies which VM is driving an I/O storm on the cluster.

---

### Q6
An administrator runs `ncc health_checks run_all` and receives a warning about high Extent Store fragmentation on several nodes. Which background service is responsible for addressing this through garbage collection and data compaction?
- A) Curator
- B) Stargate
- C) Cerebro
- D) Prism

**Answer: A**
Curator performs background maintenance tasks including garbage collection, data compaction, extent store defragmentation, and triggering deduplication/compression scans. It coordinates these activities across the cluster.

---

### Q7
A Nutanix cluster has both SSD and HDD tiers. An administrator wants to ensure that frequently accessed data remains on SSDs while infrequently accessed data moves to HDDs automatically. Which mechanism handles this?
- A) Information Lifecycle Management (ILM) auto-tiering
- B) Manual vDisk migration via `ncli vdisk edit`
- C) OpLog pinning to SSD tier
- D) Curator-triggered Erasure Coding

**Answer: A**
ILM (Information Lifecycle Management) automatically monitors data access patterns and moves hot data to the SSD tier while migrating cold data to the HDD tier, optimizing cost and performance without manual intervention.

---

### Q8
An administrator is configuring a storage container for a workload consisting of linked-clone VDI desktops. Which combination of features is most appropriate?
- A) Fingerprint-based deduplication and Shadow Clones enabled
- B) Erasure Coding with RF3 replication
- C) Inline compression with post-process deduplication disabled
- D) RF2 replication with all data efficiency features disabled

**Answer: A**
Linked-clone VDI desktops share common base images, making fingerprint-based deduplication highly effective. Shadow Clones further optimize read performance during boot storms by caching read-only data locally on each node.

---

### Q9
While reviewing a container's configuration, an administrator runs `ncli container ls` and sees `Compression Enabled: true` with `Compression Delay in Seconds: 0`. What does a compression delay of 0 indicate?
- A) Inline compression is active — data is compressed at write time using LZ4
- B) Compression is disabled and waiting for manual trigger
- C) Post-process compression runs immediately after the write completes
- D) Compression delay is set to the system default of 60 minutes

**Answer: A**
A compression delay of 0 means inline compression (LZ4) is enabled, compressing data during the initial write. This is suitable for sequential workloads. Post-process compression uses a delay greater than 0 (commonly 60 minutes).

---

### Q10
An administrator needs to check the total usable storage capacity and current utilization of all storage pools. Which command provides this information?
- A) `ncli storage-pool ls`
- B) `ncli container ls`
- C) `acli storage.list`
- D) `ncli disk ls`

**Answer: A**
`ncli storage-pool ls` lists all storage pools with their total capacity, used space, and available space. Storage pools aggregate physical disks and are the underlying layer for storage containers.

---

### Q11
An administrator notices that a container with post-process deduplication shows high CPU usage on all CVMs during off-peak hours. What is causing this behavior?
- A) Curator is running deduplication fingerprinting and dedup scans across the cluster
- B) Stargate is re-encoding Erasure Coded data during maintenance windows
- C) The OpLog is being flushed to the Extent Store in bulk
- D) Cerebro is performing remote replication to a DR site

**Answer: A**
Post-process deduplication runs as a Curator background task, computing fingerprints and identifying duplicate extents. This is CPU-intensive and typically runs during periods of lower I/O activity, which explains the off-peak CPU spike.

---

### Q12
An administrator wants to determine the replication factor configured on a specific storage container named "SQL-Data." Which command shows this?
- A) `ncli container ls name=SQL-Data`
- B) `acli container.get SQL-Data`
- C) `ncli vdisk ls container=SQL-Data`
- D) `ncli storage-pool get SQL-Data`

**Answer: A**
`ncli container ls name=SQL-Data` displays the container configuration including the replication factor (RF2 or RF3), compression settings, deduplication settings, and Erasure Coding status.

---

### Q13
An administrator is evaluating whether to enable Erasure Coding on a container hosting archived log files that are rarely read or modified. Which statement correctly describes the trade-off?
- A) EC-X reduces storage overhead compared to RF2 but increases CPU during encoding and is best for cold data
- B) EC-X provides better write performance than RF2 for all workload types
- C) EC-X eliminates the need for replication factor entirely
- D) EC-X can only be used on containers with deduplication disabled

**Answer: A**
Erasure Coding (EC-X) trades CPU overhead for storage efficiency by using parity strips instead of full data copies. It is ideal for cold, infrequently modified data like archived logs where the CPU overhead of encoding is acceptable.

---

### Q14
During a storage performance investigation, an administrator accesses the Stargate 2009 page and observes that the OpLog is consistently at 90%+ utilization. What does this indicate?
- A) Write ingestion rate exceeds the OpLog destage rate to the Extent Store, potentially causing write latency
- B) The Unified Cache is full and spilling over into the OpLog
- C) Deduplication fingerprints are consuming OpLog space
- D) The Extent Store is full and the OpLog is acting as overflow storage

**Answer: A**
High OpLog utilization means writes are arriving faster than they can be destaged (flushed) to the Extent Store. This can lead to increased write latency as the OpLog becomes a bottleneck, often indicating undersized SSD capacity or excessive write load.

---

### Q15
An administrator is configuring QoS (Quality of Service) for VMs on a Nutanix cluster. At which level can IOPS throttling be applied?
- A) Per-VM level through Prism
- B) Per storage container level through `ncli`
- C) Per storage pool level through Prism
- D) Per physical disk through CVM configuration

**Answer: A**
Nutanix QoS allows IOPS throttling at the per-VM level, enabling administrators to limit the I/O impact of noisy-neighbor VMs. This is configured through Prism and applies to all vDisks associated with the VM.

---

### Q16
An administrator needs to isolate a high-IOPS analytics workload from a latency-sensitive OLTP database. What is the recommended approach on a Nutanix cluster?
- A) Place each workload in a separate storage container with appropriate data services (compression, dedup) configured per workload
- B) Create separate storage pools for each workload on the same nodes
- C) Configure VLAN tagging on storage traffic to isolate I/O paths
- D) Use Erasure Coding on the analytics container and RF3 on the OLTP container

**Answer: A**
Separate storage containers allow independent configuration of replication factor, compression, deduplication, and Erasure Coding tailored to each workload's profile. Combined with per-VM QoS, this provides effective workload isolation.

---

### Q17
An administrator runs an NCC check and receives a FAIL for `stargate_disk_io_latency_check`. Which next step is most appropriate?
- A) Access the Stargate 2009 page on the affected CVM to identify which vDisks and physical disks are experiencing high latency
- B) Restart the Stargate service on all CVMs with `genesis restart stargate`
- C) Immediately enable Erasure Coding on all containers to reduce disk I/O
- D) Run `ncli storage-pool ls` to check if the storage pool is full

**Answer: A**
The Stargate 2009 page (`http://<CVM_IP>:2009`) provides granular I/O latency metrics per vDisk and per physical disk, allowing the administrator to pinpoint whether the issue is a failing disk, a hot vDisk, or an overloaded node.

---

### Q18
An administrator wants to verify that the Unified Cache (Content Cache) is effectively serving read requests. Where should they look?
- A) Stargate 2009 page — Content Cache hit rate and eviction statistics
- B) `ncli container ls` — cache utilization per container
- C) Prism Element Hardware dashboard — SSD read/write ratio
- D) `ncc health_checks run_all` — cache health check output

**Answer: A**
The Stargate 2009 page provides detailed Content Cache statistics including hit rate, miss rate, evictions, and fingerprint lookups. A low hit rate may indicate the working set exceeds cache size or deduplication is not effective.

---

### Q19
An administrator creates a new storage container and wants to enable deduplication. Which statement about Nutanix deduplication is correct?
- A) Deduplication is fingerprint-based and runs as a post-process by default, most effective for VDI and clone workloads
- B) Deduplication is always inline and cannot be configured for post-process operation
- C) Deduplication operates at the file system level and requires NTFS or ext4
- D) Deduplication must be enabled at the storage pool level before it can be used on containers

**Answer: A**
Nutanix deduplication uses SHA-1 fingerprinting and runs post-process by default. It is most effective for workloads with high data similarity, such as VDI environments with linked clones sharing common base images.

---

### Q20
An administrator runs `ncli container edit name=DB-Prod compression-enabled=true compression-delay=3600`. What is the effect of this configuration?
- A) Post-process compression is enabled with a 1-hour delay — data written within the last hour remains uncompressed
- B) Inline compression is enabled with a 1-hour timeout before writes are rejected
- C) Compression is scheduled to activate 1 hour after the container is created
- D) The container will compress data using LZ4 only after reaching 3600 IOPS

**Answer: A**
A compression delay of 3600 seconds (1 hour) enables post-process compression. Data remains uncompressed for the first hour after being written, then Curator compresses it. This is ideal for random write workloads where data may be overwritten shortly after initial write.

---

### Q21
An administrator is investigating slow VM performance. Using Prism Element, they see the VM's controller latency exceeds 20ms. Which I/O path component should the administrator investigate first?
- A) Stargate service on the local CVM hosting the VM — check OpLog and Extent Store latency
- B) Cerebro replication lag to the remote DR cluster
- C) Prism Central communication latency to the management plane
- D) Zookeeper metadata store response time

**Answer: A**
In the DSF I/O path (VM → vDisk → Stargate → Extent Store → Disk), the Stargate service on the local CVM is the primary handler. High controller latency typically points to OpLog congestion, Extent Store disk latency, or an overwhelmed local CVM.

---

### Q22
An administrator needs to find all vDisks associated with a specific VM named "Oracle-Prod" for I/O analysis. Which approach is most direct?
- A) View the VM in Prism Element, navigate to the Virtual Disks tab, and note the vDisk UUIDs for correlation with Stargate metrics
- B) Run `ncli storage-pool ls` and filter by VM name
- C) Run `acli net.list` and search for the VM's network attachment
- D) Check the Curator 2010 page for VM-to-vDisk mappings

**Answer: A**
Prism Element's VM detail page shows all attached virtual disks with their vDisk identifiers, container association, size, and I/O statistics. These UUIDs can be cross-referenced on the Stargate 2009 page for deeper analysis.

---

### Q23
An administrator is planning to migrate a workload from RF2 to RF3 on an existing container. What impact should they expect?
- A) Increased write amplification — each write produces three copies instead of two, requiring more SSD/HDD capacity and increased network bandwidth
- B) Decreased read latency because RF3 distributes reads across three replicas
- C) No impact on capacity because RF3 uses parity instead of full copies
- D) The container must be emptied and recreated since RF cannot be changed in-place

**Answer: A**
RF3 stores three full copies of each extent, increasing write amplification (every write must be committed to three nodes), consuming ~50% more raw capacity than RF2, and generating additional network traffic between CVMs.

---

### Q24
An administrator notices that a 4-node cluster with all-SSD storage has no HDD tier. How does ILM (Information Lifecycle Management) behave in this scenario?
- A) ILM has no tiering effect since all storage is on a single tier — data remains on SSD
- B) ILM automatically creates a virtual HDD tier using reserved SSD capacity
- C) ILM moves cold data to the OpLog for long-term storage
- D) ILM is disabled and must be manually re-enabled when HDDs are added

**Answer: A**
ILM auto-tiering moves data between SSD and HDD tiers based on access patterns. On an all-SSD (all-flash) cluster, there is no HDD tier to migrate cold data to, so ILM tiering has no operational effect.

---

### Q25
An administrator is troubleshooting why Shadow Clones are not activating for a VDI container. Which condition must be met for Shadow Clones to trigger?
- A) The vDisk must be read from multiple nodes and the read-to-write ratio must be heavily read-dominant
- B) Deduplication must be disabled on the container
- C) The VM must be powered off before Shadow Clone creation
- D) Shadow Clones require Erasure Coding to be enabled on the container

**Answer: A**
Shadow Clones trigger automatically when a vDisk is heavily read from multiple nodes with minimal writes. The feature creates read-only local copies on requesting nodes, reducing cross-node I/O. Any write to the vDisk invalidates existing Shadow Clones.

---

### Q26
An administrator wants to check the current Erasure Coding savings on a container named "Archive-Data." Which command shows EC strip savings?
- A) `ncli container ls name=Archive-Data` and review the Erasure Coding status and savings fields
- B) `acli ec.status container=Archive-Data`
- C) `ncc health_checks ec_savings_check`
- D) `ncli storage-pool get name=Archive-Data`

**Answer: A**
The `ncli container ls name=<name>` output includes Erasure Coding configuration status and savings metrics, showing how much space EC has saved compared to full replication on that specific container.

---

### Q27
An administrator is analyzing the DSF I/O path and wants to understand where a write operation is persisted first. What is the correct order for a write in the Nutanix I/O path?
- A) VM → Stargate → OpLog (local SSD) → acknowledge to VM → destage to Extent Store
- B) VM → Stargate → Extent Store (HDD) → acknowledge to VM → copy to OpLog
- C) VM → Unified Cache → OpLog → Extent Store → acknowledge to VM
- D) VM → Curator → Stargate → OpLog → acknowledge to VM

**Answer: A**
Nutanix uses the OpLog as a write-ahead log. Writes are first persisted to the OpLog on local SSD (and replicated OpLog on a remote CVM for RF2/RF3), then acknowledged to the VM. Destaging to the Extent Store happens asynchronously.

---

### Q28
An administrator sees high read latency on a container with deduplication enabled. The Stargate 2009 page shows a low Content Cache hit rate. What is the most likely cause?
- A) The working set exceeds the Unified Cache (Content Cache) size, causing frequent cache evictions and reads from disk
- B) Deduplication is consuming too much OpLog space
- C) Erasure Coding is interfering with the deduplication fingerprints
- D) The Curator scan is holding a lock on the Content Cache

**Answer: A**
The Unified Cache (Content Cache) stores deduplicated fingerprinted data for read acceleration. If the working set is larger than the available SSD cache, evictions increase and reads must be served from the Extent Store on disk, raising latency.

---

### Q29
An administrator runs `ncc health_checks run_all` and receives a warning about CVM memory pressure on one node. How does this affect storage performance?
- A) Stargate performance degrades because it relies on CVM memory for caching, metadata, and I/O processing
- B) Only Prism web console performance is affected; storage I/O is unaffected
- C) CVM memory pressure only impacts Curator background tasks
- D) The CVM automatically live-migrates its workload to another CVM

**Answer: A**
The CVM runs Stargate (and other storage services) which depend heavily on memory for the Unified Cache, OpLog management, and metadata lookups. Memory pressure on the CVM directly degrades storage I/O performance for all VMs on that host.

---

### Q30
An administrator wants to enable inline compression on a new container. Which compression algorithm does Nutanix use for inline compression?
- A) LZ4 — a fast, low-CPU-overhead compression algorithm suitable for inline operation
- B) GZIP — providing maximum compression ratio at higher CPU cost
- C) Snappy — used exclusively for post-process compression
- D) ZSTD — the default inline algorithm since AOS 6.0

**Answer: A**
Nutanix uses LZ4 for inline compression due to its low latency and minimal CPU overhead, making it suitable for compressing data in the write path without significantly impacting I/O performance.

---

### Q31
An administrator is troubleshooting a specific vDisk that shows consistently high latency. They need to find the vDisk's NFS file path for advanced debugging. Which location on the CVM filesystem reflects the vDisk namespace?
- A) `/home/nutanix/data/stargate-storage/disks/` — the NFS datastore path where vDisks are presented
- B) `/etc/nutanix/stargate/vdisks/`
- C) `/var/log/stargate/vdisk_map/`
- D) `/home/nutanix/config/vdisk_list.json`

**Answer: A**
Nutanix DSF presents vDisks via NFS to the hypervisor. The Stargate storage directory on the CVM contains the mounted datastore paths that map to vDisks, enabling advanced troubleshooting and direct vDisk-level analysis.

---

### Q32
An administrator receives an alert in Prism that a container is approaching 90% utilization. Which proactive measure should they take to avoid performance degradation?
- A) Enable or review data efficiency features (compression, dedup, EC) and consider expanding the cluster or removing stale snapshots
- B) Disable Replication Factor to immediately reclaim 50% of capacity
- C) Move all VMs to a different cluster and delete the container
- D) Increase the OpLog size to accommodate more data before destaging

**Answer: A**
Approaching capacity limits degrades performance due to reduced free space for OpLog, Curator operations, and new writes. Enabling compression/dedup or EC can reclaim space, while removing stale snapshots and planning cluster expansion address root capacity.

---

### Q33
An administrator wants to measure the actual data reduction ratio achieved by deduplication and compression on a container. Where is this metric displayed?
- A) Prism Element Storage dashboard — container details showing pre-reduction vs. post-reduction usage and savings ratio
- B) `ncc health_checks data_reduction_check`
- C) `acli container.dedup_stats`
- D) The Curator 2010 page — global dedup ratio only

**Answer: A**
Prism Element's Storage dashboard shows per-container data reduction metrics including the overall savings ratio from combined deduplication and compression, as well as individual contributions of each feature.

---

### Q34
An administrator has a mixed workload cluster with both VDI desktops and a SQL database. The SQL database requires consistent low-latency I/O. Which approach best protects the database from VDI I/O variability?
- A) Apply per-VM QoS IOPS limits on VDI desktop VMs and place the SQL database in a dedicated storage container
- B) Enable Erasure Coding on the VDI container to reduce VDI IOPS
- C) Disable the OpLog on the SQL database container to bypass the write buffer
- D) Configure Shadow Clones on the SQL database for read optimization

**Answer: A**
Per-VM QoS throttles VDI VMs to a maximum IOPS, preventing them from consuming all storage bandwidth. A dedicated container for SQL ensures independent data services tuning, and combined these isolate the latency-sensitive workload.

---

### Q35
An administrator runs `ncli container ls` and notices that a container has both deduplication and Erasure Coding enabled. Is this a supported configuration?
- A) Yes — deduplication and Erasure Coding can coexist on the same container; dedup runs first, then EC encodes the deduplicated extents
- B) No — enabling both features simultaneously causes data corruption
- C) No — the system automatically disables dedup when EC is enabled
- D) Yes, but only on all-SSD clusters with RF3

**Answer: A**
Nutanix supports enabling both deduplication and Erasure Coding on the same container. Deduplication reduces unique data first, then Erasure Coding provides space-efficient protection for the remaining unique extents, maximizing overall savings.

---

### Q36
An administrator is investigating why write performance dropped after enabling inline compression on a container with random write workloads. What should they change?
- A) Switch from inline compression (delay=0) to post-process compression (delay>0) to avoid compressing data that may be overwritten quickly
- B) Enable Erasure Coding to offset the compression overhead
- C) Increase the CVM CPU allocation from 4 to 8 vCPUs
- D) Disable the Unified Cache to free SSD resources for the OpLog

**Answer: A**
Inline compression processes every write through LZ4, adding latency to the write path. For random workloads where data is frequently overwritten, post-process compression is more efficient because it only compresses data that persists beyond the configured delay.

---

### Q37
An administrator needs to check disk-level health and identify any failed or degrading disks in the cluster. Which command provides per-disk status?
- A) `ncli disk ls` — shows all disks with their status, tier (SSD/HDD), and health information
- B) `acli disk.list` — shows disk I/O statistics
- C) `ncc health_checks disk_usage_check` — shows only capacity usage
- D) `ncli storage-pool ls` — shows per-disk health within pools

**Answer: A**
`ncli disk ls` displays a comprehensive list of all physical disks in the cluster including their online/offline status, tier assignment (SSD or HDD), serial numbers, and CVM association, essential for hardware troubleshooting.

---

### Q38
An administrator is reviewing Prism analytics and notices that one CVM consistently has higher IOPS than others. All hosts have similar VM counts. What should the administrator investigate?
- A) Whether data locality is maintained — VMs may be running on hosts whose data resides on remote CVMs, causing cross-node I/O to load that CVM
- B) Whether the CVM has a larger OpLog allocation
- C) Whether Prism Central is directing more API calls to that CVM
- D) Whether the CVM has additional physical NICs

**Answer: A**
Nutanix DSF prefers local reads/writes (data locality). If VMs were migrated without their data following, I/O is served remotely by the CVM that owns the data. This creates uneven CVM load and should be investigated via data locality metrics.

---

### Q39
An administrator wants to run a comprehensive NCC health check focusing only on storage-related checks. Which approach is most targeted?
- A) `ncc health_checks run_all` and filter the results for storage-related check categories
- B) `ncli cluster health-check run type=storage`
- C) `acli storage.health_check run_all`
- D) Run `ncc --help` and execute individual storage check plugins one at a time

**Answer: A**
NCC (Nutanix Cluster Check) runs all health checks with `ncc health_checks run_all`. While there is no single storage-only flag, results are categorized and can be filtered. Individual storage checks like `disk_io_latency_check` can also be run separately.

---

### Q40
An administrator needs to understand how many extent groups are stored on each disk for capacity planning. Which background service maintains this metadata and manages extent group placement?
- A) Stargate — manages extent groups on local disks and coordinates with Medusa for metadata tracking
- B) Curator — exclusively manages extent group placement and rebalancing
- C) Cerebro — handles extent group replication across sites
- D) Prism — provides extent group placement through the REST API

**Answer: A**
Stargate is the primary I/O manager that creates and manages extent groups (typically 1 MB extents) on local disks. Medusa (the distributed metadata store) tracks extent group locations, while Curator handles background optimization tasks.

---

## Domain 2: Network Performance (Q41–Q80)

---

### Q41
An administrator needs to list all virtual networks configured on an AHV cluster. Which command should they use?
- A) `acli net.list`
- B) `ncli network list`
- C) `ovs-vsctl list-nets`
- D) `acli vm.net_list`

**Answer: A**
`acli net.list` displays all virtual networks (both VLAN-backed and overlay) configured on the AHV cluster, including their UUIDs, VLAN IDs, and associated virtual switch information.

---

### Q42
An administrator needs to view detailed configuration of a network named "Production-VLAN100" including its VLAN ID and IP pool settings. Which command provides this?
- A) `acli net.get Production-VLAN100`
- B) `ncli network get name=Production-VLAN100`
- C) `ovs-vsctl show Production-VLAN100`
- D) `acli vm.net_get Production-VLAN100`

**Answer: A**
`acli net.get <network_name>` displays detailed network configuration including the VLAN ID, virtual switch assignment, IPAM settings (IP pool, gateway, DNS), and associated subnet information.

---

### Q43
An administrator is configuring an AHV host and needs to verify the current Open vSwitch bridge configuration, including attached ports and interfaces. Which command should they run on the AHV host?
- A) `ovs-vsctl show`
- B) `acli net.list`
- C) `manage_ovs --show_bridges`
- D) `ncli host ls`

**Answer: A**
`ovs-vsctl show` displays the complete OVS configuration on the AHV host, including bridges (e.g., br0), bond interfaces, uplink ports, and their VLAN configurations. It is the primary OVS diagnostic command.

---

### Q44
An administrator wants to check the bond status of network interfaces on an AHV host to verify uplink redundancy. Which command provides bond member status and active link information?
- A) `manage_ovs --bridge_status` or `ovs-appctl bond/show`
- B) `acli host.nic_status`
- C) `ncli host list-nics`
- D) `ovs-vsctl list-bonds`

**Answer: A**
`manage_ovs --bridge_status` provides a summary of bond configuration and link status. For detailed bond information including individual slave states, `ovs-appctl bond/show <bond_name>` shows active/backup status and hash distribution.

---

### Q45
An administrator is setting up a new AHV cluster and needs to choose a bond mode for a workload requiring maximum throughput using switch-independent bonding. Which bond mode should they select?
- A) balance-slb — hash-based load balancing that does not require switch configuration
- B) active-backup — only one NIC active at a time, no load balancing
- C) LACP (802.3ad) — requires switch-side LACP configuration
- D) balance-tcp — requires physical switch support for port channel

**Answer: A**
balance-slb (Source Load Balancing) distributes traffic across multiple uplinks based on MAC address hashing without requiring any physical switch configuration, making it ideal when maximum throughput is needed with switch-independent operation.

---

### Q46
An administrator configures LACP (802.3ad) bond mode on an AHV host. What additional configuration is required?
- A) The physical switch ports connected to the AHV host must also be configured with LACP in an appropriate port channel or LAG
- B) Each VM must be configured with a dedicated physical NIC
- C) Jumbo frames must be enabled cluster-wide before LACP can be activated
- D) Prism Central must be deployed to manage LACP bonds

**Answer: A**
LACP (Link Aggregation Control Protocol / 802.3ad) requires both ends to participate. The physical switch ports must be configured in an LACP LAG (Link Aggregation Group) that matches the AHV host's bond configuration.

---

### Q47
An administrator wants to enable jumbo frames for storage traffic between CVMs. What MTU value should be configured and where?
- A) Set MTU to 9000 on the AHV host virtual switch uplinks, the physical switch ports, and CVM network interfaces
- B) Set MTU to 9000 only on the CVM network interfaces
- C) Set MTU to 1500 on the virtual switch and 9000 on the physical switch
- D) Configure MTU 9000 only in Prism Central's network settings

**Answer: A**
Jumbo frames (MTU 9000) must be configured end-to-end: AHV host vSwitch uplinks, all intermediate physical switch ports, and CVM network interfaces. A mismatch at any point causes fragmentation or dropped frames.

---

### Q48
An administrator needs to verify that VLAN tagging is correctly configured for VM traffic on VLAN 200. The VMs can reach each other but not the default gateway. What should they check first?
- A) Verify the physical switch trunk port allows VLAN 200 and that the gateway interface is configured on VLAN 200
- B) Run `acli vm.list` to check if VMs are powered on
- C) Restart the OVS service on all AHV hosts with `systemctl restart openvswitch`
- D) Check if Erasure Coding is impacting network throughput

**Answer: A**
When VMs on the same VLAN communicate but cannot reach the gateway, the issue is typically at the physical network layer — either the switch trunk port does not include the VLAN or the Layer 3 gateway is not configured for that VLAN.

---

### Q49
An administrator is deploying Flow Virtual Networking and needs to create an isolated network segment using Geneve encapsulation. Which construct should they create?
- A) A VPC (Virtual Private Cloud) with overlay subnets in Prism Central
- B) A VLAN-backed network with `acli net.create` on each AHV host
- C) An OVS bridge with `ovs-vsctl add-br` on the AHV host
- D) A storage container network with `ncli container create`

**Answer: A**
VPCs (Virtual Private Clouds) in Flow Virtual Networking create isolated network segments using Geneve overlay encapsulation. VPCs are configured in Prism Central and support overlay subnets, routing, and network isolation.

---

### Q50
An administrator configures a VPC in Prism Central and creates an overlay subnet. VMs on this subnet need external internet access. Which Flow Virtual Networking feature enables this?
- A) Floating IPs — providing NAT-based external access for VMs within the VPC
- B) Shadow Clones — enabling local network caching on each node
- C) OVS port mirroring — forwarding traffic to an external firewall
- D) LACP bonds — aggregating links for external connectivity

**Answer: A**
Floating IPs provide NAT-based external access for VMs in a VPC. A floating IP is associated with a VM's private overlay IP and translated at the VPC's external gateway, enabling outbound and inbound connectivity.

---

### Q51
An administrator needs to connect a VPC to an on-premises data center network. Which Flow Virtual Networking component facilitates this connectivity?
- A) VPN gateway — establishing a tunnel between the VPC and the external network
- B) VLAN trunk — extending the physical VLAN into the VPC
- C) OVS bond — bridging the VPC overlay to a physical NIC
- D) Floating IP — routing all VPC traffic through a single NAT address

**Answer: A**
VPN gateways in Flow Virtual Networking establish secure tunnels between VPCs and external networks, enabling connectivity to on-premises data centers or other cloud environments while maintaining VPC isolation.

---

### Q52
An administrator is configuring Flow Network Security (microsegmentation) and needs to group VMs by application tier. What mechanism does Nutanix use for VM grouping?
- A) Categories — key-value tags assigned to VMs (e.g., AppTier:Web, AppTier:DB)
- B) OVS port groups — assigning VMs to specific switch ports
- C) Storage containers — grouping VMs by their storage assignment
- D) VLAN IDs — placing VMs on the same VLAN for group membership

**Answer: A**
Nutanix Flow uses Categories (key-value pairs) to group VMs logically. Categories like AppTier:Web, AppTier:App, AppTier:DB allow security policies to reference groups of VMs regardless of their network or host placement.

---

### Q53
An administrator creates a security policy in Flow Network Security for a three-tier application. They want to allow web tier VMs to communicate with app tier VMs on port 8080, but block direct web-to-database traffic. Which policy type should they use?
- A) Application security policy — defining specific allowed flows between category-based tiers
- B) Isolation policy — blocking all traffic between the web and database categories
- C) Quarantine policy — isolating the database VMs from all traffic
- D) VPC default policy — blocking all inter-VPC traffic

**Answer: A**
Application security policies allow granular definition of permitted traffic flows between VM categories. The administrator can specify that AppTier:Web may communicate with AppTier:App on port 8080, while all other flows (including web-to-DB) are denied.

---

### Q54
An administrator wants to block all communication between VMs in the "Development" category and VMs in the "Production" category. Which Flow policy type is designed for this?
- A) Isolation policy — blocking traffic between two specified categories
- B) Application policy — defining allowed ports between categories
- C) Quarantine policy — isolating compromised VMs
- D) Default gateway policy — filtering inter-VLAN traffic

**Answer: A**
Isolation policies are specifically designed to block all traffic between two categories. By creating an isolation policy between Environment:Development and Environment:Production, all cross-environment traffic is denied.

---

### Q55
A security team has identified a compromised VM and needs to immediately restrict its network access while allowing forensic analysis tools to connect. Which Flow policy should be applied?
- A) Quarantine policy — placing the VM in strict or forensic quarantine mode
- B) Isolation policy — isolating the VM from all categories
- C) Application policy — removing the VM from all allowed flows
- D) Delete the VM's virtual NIC to disconnect it from the network

**Answer: A**
The Quarantine policy in Flow provides two modes: Strict (blocks all traffic) and Forensic (blocks general traffic but allows specific forensic tool access). Quarantine policies have the highest priority and override all other security policies.

---

### Q56
An administrator creates a new application security policy in Flow and wants to observe the traffic patterns before enforcing the rules. Which mode should the policy be set to initially?
- A) Monitor mode — logs traffic that would be affected without actually enforcing the rules
- B) Apply mode — enforces rules immediately with logging
- C) Simulation mode — creates a virtual network copy for testing
- D) Audit mode — sends all policy decisions to a SIEM

**Answer: A**
Monitor mode allows administrators to observe which traffic flows would be allowed or denied by the policy without actually enforcing the rules. This enables validation that the policy will not break legitimate application traffic before switching to Apply mode.

---

### Q57
An administrator has four Flow security policies affecting the same VM: a quarantine policy, an isolation policy, an application policy, and the default policy. In what order are these policies evaluated?
- A) Quarantine → Isolation → Application → Default
- B) Application → Isolation → Quarantine → Default
- C) Default → Application → Isolation → Quarantine
- D) All policies are evaluated simultaneously with no priority

**Answer: A**
Flow security policy priority order is: Quarantine (highest) → Isolation → Application → Default (lowest). If a VM is quarantined, the quarantine policy takes precedence over all others, ensuring compromised VM containment.

---

### Q58
An administrator wants to visualize the actual network traffic flows between VMs in Prism Central before creating security policies. Which Flow feature provides this capability?
- A) Flow visualization in Prism Central — showing discovered traffic flows between categories and VMs
- B) `ovs-ofctl dump-flows` on each AHV host
- C) `acli net.traffic_stats` on the cluster
- D) NCC network flow analysis check

**Answer: A**
Prism Central's Flow visualization discovers and displays actual network traffic between VMs and categories, helping administrators understand existing communication patterns before designing and implementing security policies.

---

### Q59
An administrator needs to troubleshoot OVS flow rules on an AHV host to determine why traffic between two VMs is being dropped. Which command displays the active OpenFlow rules?
- A) `ovs-ofctl dump-flows br0`
- B) `acli net.flow_rules`
- C) `manage_ovs --list_flows`
- D) `ncli network flow-rules list`

**Answer: A**
`ovs-ofctl dump-flows br0` shows all active OpenFlow rules on the br0 bridge, including match criteria and actions. This is essential for diagnosing traffic forwarding decisions, VLAN tagging, and microsegmentation enforcement at the OVS level.

---

### Q60
An administrator needs to test network connectivity from a CVM to another CVM on a different host to validate storage inter-node communication. Which approach is most appropriate?
- A) SSH to the CVM and use `ping` with the target CVM's backplane IP address to verify Layer 3 connectivity
- B) Run `acli vm.ping` from Prism Element to test inter-CVM connectivity
- C) Use `ncli cluster ping` to test all node-to-node communication
- D) Check the Cerebro 2020 page for inter-node latency metrics

**Answer: A**
Direct connectivity tests from a CVM using standard tools (ping, iperf, netcat) against other CVMs' backplane IPs validate the storage network path. This tests the same network path that Stargate uses for cross-node I/O.

---

### Q61
An administrator is configuring the default virtual switch (vs0) on an AHV cluster and needs to assign two physical NICs to the uplink. Which tool should they use?
- A) `manage_ovs` — the Nutanix utility for modifying virtual switch and bond configuration on AHV hosts
- B) `ovs-vsctl add-port` — directly adding ports to the OVS bridge
- C) `acli vs.update` — modifying virtual switch via the AHV CLI
- D) Prism Element → Network Configuration → Physical NIC assignment

**Answer: A**
The `manage_ovs` utility is the supported Nutanix tool for configuring virtual switch uplinks, bond modes, and MTU on AHV hosts. Direct OVS commands (`ovs-vsctl`) should not be used as they may be overwritten by the Nutanix management layer.

---

### Q62
An administrator sets up a VLAN-backed network with `acli net.create VLAN200 vlan=200 vswitch_name=vs0 ip_config=10.10.200.0/24`. What does the `ip_config` parameter configure?
- A) IPAM-managed subnet — enabling AHV-managed DHCP with the specified subnet for VMs on this network
- B) A static IP assigned to the virtual switch itself
- C) The CVM's IP address on VLAN 200
- D) The default gateway for the physical switch's VLAN 200 interface

**Answer: A**
The `ip_config` parameter enables Nutanix-managed IPAM (IP Address Management) for the network, providing DHCP services to VMs. The administrator can further define IP pools within this subnet for automatic VM IP assignment.

---

### Q63
An administrator discovers that VMs on the same AHV host and same VLAN can communicate, but VMs on different hosts on the same VLAN cannot. What is the most likely cause?
- A) The physical switch trunk ports are not configured to allow the VLAN between hosts
- B) Flow microsegmentation is blocking inter-host traffic
- C) The OVS bridge is misconfigured on one host
- D) Shadow Clones are consuming the network bandwidth

**Answer: A**
Intra-host traffic stays within the local OVS bridge, but inter-host traffic traverses the physical network. If physical switch trunk ports do not carry the VLAN, frames are dropped between hosts while local switching continues to work.

---

### Q64
An administrator is comparing overlay subnets and VLAN-backed subnets in Flow Virtual Networking. Which statement is correct?
- A) Overlay subnets use Geneve encapsulation and do not require VLAN provisioning on the physical switch; VLAN-backed subnets require physical switch configuration
- B) VLAN-backed subnets use Geneve encapsulation for better isolation
- C) Overlay subnets require dedicated physical NICs separate from VLAN-backed networks
- D) Both subnet types require identical physical switch configuration

**Answer: A**
Overlay subnets encapsulate traffic using Geneve protocol over the existing physical network, eliminating the need for VLAN provisioning on physical switches. VLAN-backed subnets directly map to physical VLANs and require switch-side trunk configuration.

---

### Q65
An administrator needs to verify the current bond mode configured on an AHV host's virtual switch. Which sequence of commands provides the most complete information?
- A) `manage_ovs --bridge_status` to see the configured bond mode, then `ovs-appctl bond/show <bond_name>` for detailed slave status
- B) `acli host.bond_mode` to check the current mode
- C) `ncli host ls` and check the NIC bonding column
- D) `cat /etc/sysconfig/network-scripts/ifcfg-bond0` for the bond configuration file

**Answer: A**
`manage_ovs --bridge_status` shows the high-level bond configuration including the current mode (active-backup, balance-slb, or LACP). `ovs-appctl bond/show` provides detailed per-slave status, hash distribution, and failover information.

---

### Q66
An administrator wants to change the bond mode from active-backup to balance-slb on a 4-node AHV cluster. What is the impact during the change?
- A) Brief network disruption on the host being reconfigured as the bond is recreated; other hosts are unaffected if changed one at a time
- B) Cluster-wide network outage requiring all VMs to be powered off
- C) No impact — bond mode changes are applied hot with zero disruption
- D) The host must be removed from the cluster before the bond mode can be changed

**Answer: A**
Bond mode changes using `manage_ovs` cause a brief disruption on the individual host as the OVS bond is reconfigured. Performing the change one host at a time minimizes cluster impact, and VMs may experience momentary connectivity loss.

---

### Q67
An administrator creates a VPC and configures two overlay subnets: Subnet-A (10.1.1.0/24) and Subnet-B (10.1.2.0/24). Can VMs on these subnets communicate with each other?
- A) Yes — subnets within the same VPC can route to each other through the VPC's internal router
- B) No — overlay subnets are always isolated from each other
- C) Only if a floating IP is assigned to each VM
- D) Only if a VPN gateway is configured between the subnets

**Answer: A**
VPCs include an internal virtual router that handles routing between subnets within the same VPC. VMs on different overlay subnets in the same VPC can communicate without additional configuration, similar to inter-VLAN routing.

---

### Q68
An administrator is troubleshooting a Flow security policy that appears to be blocking legitimate traffic. The policy is in Apply mode. What is the safest first step?
- A) Switch the policy from Apply mode to Monitor mode to stop enforcement while continuing to log traffic decisions
- B) Delete the security policy to immediately restore connectivity
- C) Remove all VMs from their categories to bypass the policy
- D) Restart the Flow service on all CVMs

**Answer: A**
Switching from Apply to Monitor mode immediately stops enforcement while continuing to log what would be blocked or allowed. This restores connectivity for troubleshooting without losing the policy configuration.

---

### Q69
An administrator needs to configure a security policy that allows SSH (port 22) access only from the "Admin-Tools" category to all VMs in the "Production" category. Which Flow policy element accomplishes this?
- A) An inbound rule in the application security policy for the Production category, specifying Admin-Tools as the source and TCP port 22 as the allowed service
- B) An isolation policy between Admin-Tools and Production with SSH as an exception
- C) A quarantine policy with SSH port 22 exemption
- D) A VLAN ACL on the physical switch for the Production VLAN

**Answer: A**
Application security policies define granular inbound/outbound rules. By adding an inbound rule to the Production policy with Admin-Tools as the source category and TCP/22 as the service, only SSH from Admin-Tools VMs is permitted.

---

### Q70
An administrator configures Flow Network Security and wants to understand what happens to traffic not explicitly matched by any security policy. What is the default behavior?
- A) The default policy determines the behavior — it can be configured to allow all, deny all, or allow certain traffic categories
- B) All unmatched traffic is silently dropped
- C) All unmatched traffic is allowed without logging
- D) Unmatched traffic triggers an automatic quarantine of the source VM

**Answer: A**
The default policy in Flow acts as the fallback for unmatched traffic. Administrators can configure it to allow all traffic (permissive) or deny all (restrictive), with the ability to add specific exceptions within the default policy.

---

### Q71
An administrator needs to verify that VMs tagged with the category "AppTier:Web" are correctly assigned. Which Prism Central section shows all VMs with a specific category assignment?
- A) Prism Central → Categories → select the category value → view associated entities
- B) `acli vm.list category=AppTier:Web`
- C) `ncli category ls name=AppTier:Web`
- D) Prism Element → VM dashboard → filter by VLAN tag

**Answer: A**
In Prism Central, navigating to the Categories section and selecting a specific category value displays all associated entities (VMs, subnets, etc.), providing a clear view of category membership for policy validation.

---

### Q72
An administrator is deploying a multi-tier application and needs to create categories for Web, App, and DB tiers. Where are categories created and managed?
- A) Prism Central — categories are a Prism Central feature used for entity grouping across clusters
- B) Prism Element — categories are per-cluster and managed locally
- C) AHV CLI — `acli category.create` on each host
- D) CVM CLI — `ncli category create` on the cluster

**Answer: A**
Categories are created and managed in Prism Central, which provides a centralized view across all registered clusters. This enables consistent policy application across multiple clusters from a single management point.

---

### Q73
An administrator is comparing the default bond mode (active-backup) with LACP for a latency-sensitive application. Which characteristic is true of active-backup?
- A) Only one NIC is active at a time — no load balancing, but failover is automatic and requires no switch configuration
- B) Active-backup distributes traffic across all NICs using round-robin
- C) Active-backup requires LACP negotiation with the physical switch
- D) Active-backup provides higher throughput than balance-slb

**Answer: A**
Active-backup mode uses a single active NIC while the backup NIC(s) remain standby. Failover is automatic when the active link fails. It provides simplicity and reliability with no switch-side requirements, but no load balancing.

---

### Q74
An administrator needs to verify that a specific VM is correctly connected to the VLAN 300 network. Which Prism Element section shows the VM's NIC configuration including VLAN assignment?
- A) Prism Element → VM details → NICs tab — showing network attachment, VLAN, MAC address, and IP
- B) `ncli vm ls` — showing VLAN assignment in the output
- C) `ovs-vsctl show` — listing VM port-to-VLAN mappings
- D) Prism Element → Network Configuration → VLAN Members

**Answer: A**
The VM details page in Prism Element shows each vNIC's connected network (which includes VLAN assignment), MAC address, and discovered IP address. This is the quickest way to verify a VM's network configuration.

---

### Q75
An administrator sets up Flow Virtual Networking and creates a VPC with an external subnet for floating IPs. VMs with floating IPs still cannot reach the internet. What should they verify?
- A) The external subnet has correct gateway configuration and the physical network can route traffic from the external subnet to the internet
- B) The VPC's internal router has a default route to the internet
- C) Each VM has LACP bonding enabled for external connectivity
- D) The CVM has a floating IP assigned for NAT translation

**Answer: A**
Floating IPs translate VM overlay IPs to addresses on the external subnet. If VMs cannot reach the internet, the external subnet's gateway must be correctly configured and the physical upstream network must have routes for that subnet.

---

### Q76
An administrator runs `ovs-ofctl dump-flows br0` on an AHV host and sees a large number of flow entries with microsegmentation-related actions. What generates these flow entries?
- A) Flow Network Security (microsegmentation) policies — Prism Central pushes OpenFlow rules to the OVS on each AHV host
- B) LACP bond negotiation messages
- C) CVM storage traffic replication rules
- D) Prism Element VM migration flow entries

**Answer: A**
When Flow Network Security policies are applied, Prism Central translates the category-based rules into OpenFlow entries and pushes them to the OVS bridge on each AHV host. These entries enforce microsegmentation at the virtual switch level.

---

### Q77
An administrator is troubleshooting intermittent packet drops between two VMs on different AHV hosts. Both VMs are on the same VLAN with no Flow policies applied. Which diagnostic sequence is most appropriate?
- A) Check `ovs-vsctl show` for bridge/VLAN config, verify bond status with `manage_ovs --bridge_status`, then check physical switch port errors
- B) Run `ncc health_checks run_all` and wait for storage-related checks
- C) Enable Erasure Coding to reduce network overhead
- D) Restart Stargate on both CVMs to reset network buffers

**Answer: A**
Intermittent drops between hosts suggest a physical layer or OVS configuration issue. Verifying the OVS bridge config, bond health, and physical switch port error counters systematically isolates whether the problem is virtual or physical.

---

### Q78
An administrator needs to verify that Geneve encapsulation overhead is not causing MTU-related issues for VMs on overlay subnets. What is the typical overhead added by Geneve encapsulation?
- A) Approximately 50–54 bytes — the outer Ethernet, IP, UDP, and Geneve headers reduce the effective VM MTU
- B) Exactly 4 bytes — only the VLAN tag overhead
- C) Zero bytes — Geneve uses header compression
- D) 1500 bytes — Geneve doubles the frame size

**Answer: A**
Geneve encapsulation adds approximately 50–54 bytes of overhead (outer Ethernet 14 + outer IP 20 + UDP 8 + Geneve 8+ bytes). If the physical MTU is 1500, VMs on overlay subnets have an effective MTU of approximately 1446–1450 unless jumbo frames are configured.

---

### Q79
An administrator wants to implement a zero-trust security model for a multi-tier application in Prism Central. What is the recommended approach using Flow?
- A) Create an application security policy in Monitor mode with explicit allow rules between required tiers, verify traffic in monitoring, then switch to Apply mode
- B) Create isolation policies between every pair of categories immediately
- C) Deploy a quarantine policy for all VMs and whitelist traffic as needed
- D) Configure VLAN ACLs on the physical switch and mirror rules in Flow

**Answer: A**
The recommended approach is to create an application policy defining only the explicitly required flows between tiers. Starting in Monitor mode validates that the policy permits all legitimate traffic before enforcing with Apply mode, preventing accidental outages.

---

### Q80
An administrator notices that after enabling Flow Network Security, CVM-to-CVM communication for storage replication has been disrupted. What is the most likely cause and resolution?
- A) The security policy is inadvertently matching CVM traffic — CVM traffic should be excluded from microsegmentation policies by ensuring CVMs are not assigned to affected categories
- B) Flow automatically blocks all CVM traffic when enabled
- C) The quarantine policy has been applied to all CVMs by default
- D) OVS flow rules for CVM traffic must be manually created with `ovs-ofctl add-flow`

**Answer: A**
CVM traffic is critical for cluster operations (storage replication, metadata, etc.) and should never be subject to microsegmentation policies. If CVMs are inadvertently categorized, Flow rules can block essential inter-CVM communication. Ensure CVMs are excluded from all category assignments.

---

*End of NCM-MCI 6.10 Practice Questions – Domains 1 & 2 (80 Questions)*
