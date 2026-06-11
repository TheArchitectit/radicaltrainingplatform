# NCM-MCI 6.10 Practice Questions - Part 3
## Comprehensive Study Guide for Nutanix Certified Master – Multicloud Infrastructure

---

## SECTION 1: STANDARD MCQ (60 Questions)

### Q1
You notice a VM on your Nutanix cluster has CPU ready time of 15%. What does this indicate, and what should you do first?
- A) Memory pressure; increase VM RAM immediately
- B) CPU contention; check CPU overcommit ratio and consider vMotion or vCPU reduction
- C) Network latency; verify physical NIC status
- D) Storage I/O bottleneck; analyze latency per vDisk

**Answer: B**
CPU ready time >10% indicates the vCPU was ready to run but waiting for physical CPU time. This is contention. First, verify CPU overcommit ratio via Prism > Dashboard > Host CPU utilization, then use vMotion or reduce vCPU allocation for overcommitted VMs.

---

### Q2
A customer wants to deploy a VM with a NUMA-aware configuration on a 2-socket Nutanix host. Which vCPU configuration would optimize locality?
- A) 4 vCPU (2 vCPU per socket)
- B) 8 vCPU (4 vCPU per socket)
- C) 12 vCPU (6 vCPU per socket)
- D) 16 vCPU (8 vCPU per socket)

**Answer: A**
NUMA locality is optimized when vCPU allocation is balanced across socket boundaries. A 4 vCPU VM pinned with 2 vCPU per socket on a 2-socket host keeps memory traffic local and reduces remote NUMA access latency. The host must have sufficient physical cores to support this vCPU allocation (e.g., ≥2 physical cores per socket minimum). Verify NUMA pinning via `numactl --hardware` on guest OS and check Prism > VM > Properties > vCPU placement. Oversized vCPU configurations (options C/D) exceed socket capacity, forcing cross-socket memory access and increasing latency.

---

### Q3
During NGT VSS snapshot operations on a Windows VM, which component must be running for application-consistent snapshots?
- A) Nutanix Volume Shadow Copy Service (VSS) provider
- B) Guest Customization Service
- C) Nutanix Insights daemon
- D) Prism Analytics Engine

**Answer: A**
NGT installs the Nutanix VSS provider on Windows VMs. This enables VSS-based application-consistent snapshots. Verify installation: Programs & Features > Nutanix Guest Tools > VSS provider listed. Without it, only crash-consistent snapshots are possible.

---

### Q4
You're analyzing storage latency in Prism and see a single vDisk with >20ms latency while cluster average is 2ms. What's the most likely cause, and where should you investigate?
- A) Network congestion; run `nstat -rtnap | grep TCP_LISTEN` from CVM
- B) Hot vDisk with high IOPS; analyze via Prism > Storage > Volume Group > Per-Disk analysis
- C) Insufficient host RAM; check memory pressure and balloon driver stats
- D) CPU saturation; increase vCPU count

**Answer: B**
Per-vDisk latency analysis in Prism shows which specific disks are hot. >20ms indicates I/O bottleneck on that vDisk, not a cluster-wide issue. Check Prism > Dashboards > Storage > Volume Groups, then drill into the specific vDisk's IOPS/latency metrics. May need to migrate vDisk to faster tier or increase replica count.

---

### Q5
A VM has memory overcommit enabled with ballooning active. You notice guest OS memory pressure is high. What does this indicate?
- A) Ballooning is working correctly; no action needed
- B) Hypervisor memory overhead is consuming more than expected
- C) The VM is reclaiming pages at host level; performance may degrade further
- D) Storage latency is causing memory swaps

**Answer: C**
When ballooning is active and memory pressure rises, the hypervisor is reclaiming memory from the guest. This moves memory to host swap, causing VM performance degradation. Solution: add physical host RAM, reduce VM memory overcommit ratio via Prism settings, or migrate VMs off host. Monitor via `acpi_memory_hotplug` statistics.

---

### Q6
You need to configure a hard VM affinity rule to keep VMs on the same host. Which Prism interface would you use?
- A) Prism > VM > Policies > Scheduling
- B) Prism > Cluster > Affinity Rules
- C) Prism > VM > VM Affinity > Create Affinity Policy
- D) Prism > Infrastructure > Host Grouping

**Answer: C**
Hard affinity rules prevent VMs from being separated across hosts or force them to stay together. Access via Prism > VM > VM Affinity > Create Affinity Policy. Select "Hard Affinity" to enforce the rule. Soft affinity is preferred, applied via anti-affinity or host labels.

---

### Q7
Your Nutanix cluster has 4 hosts with 20 cores each. You're planning VM workloads and want to maintain <70% CPU utilization. Based on Prism capacity analysis, what's your safe vCPU allocation ceiling?
- A) 160 vCPU (80 cores × 2x overcommit)
- B) 112 vCPU (80 cores × 1.4x overcommit at 70%)
- C) 80 vCPU (1:1 ratio)
- D) 224 vCPU (80 cores × 2.8x overcommit)

**Answer: B**
Safe allocation = Physical cores × Target utilization ÷ Overcommit ratio. At 70% target: 80 physical cores × 0.70 = 56 effective cores. With typical 2:1 overcommit = 112 vCPU ceiling. Verify via Prism > Analysis > Capacity > CPU Runway reports and VM-level CPU ready time metrics.

---

### Q8
For BCDR planning, you need <1-hour RPO with synchronous replication between two data centers. Which Metro Avail feature should you deploy?
- A) Async replication with 1-hour snapshot schedule
- B) NearSync (1-15 minute RPO)
- C) Sync metro cluster (zero RPO, <5ms latency required)
- D) Multi-site disaster recovery with Leap

**Answer: C**
Sync metro deployment with Metro Avail provides zero RPO for truly continuous protection. Requires <5ms network latency between sites. If latency is higher, use NearSync (1-15min RPO) instead. Async replication has 1hr+ RPO depending on snapshot schedule. Configure via Prism > Availability > Metro Avail Settings.

---

### Q9
You're deploying Leap for planned failover testing. Which step must occur BEFORE initiating test failover?
- A) Disable production VMs on source site
- B) Create recovery plan with boot order, network mapping, and pre/post scripts
- C) Delete snapshots from source site
- D) Increase CVM RAM on DR site to match production

**Answer: B**
Leap recovery plans are prerequisites for any failover operation. Define boot order (critical VMs first), network mapping (IP/VLAN changes), and runbooks (pre-scripts for dependencies, post-scripts for validation). Test failover runs against the plan without affecting production. Configure via Prism > Disaster Recovery > Recovery Plans.

---

### Q10
Your Windows VM needs self-service restore capability. Which combination of tools is required?
- A) Prism API + custom scripts
- B) NGT installed + VSS snapshots + SMB Previous Versions enabled
- C) Backup software + Leap recovery plans
- D) Standalone snapshot schedules + manual restore scripts

**Answer: B**
NGT enables VSS snapshots (app-consistent). Previous Versions (SMB shadow copies) makes snapshots accessible to users via "Previous Versions" tab on shared folders. Users can self-restore files without IT intervention. Enable via: 1) NGT VSS provider, 2) SMB Previous Versions registry key, 3) Snapshot schedule, 4) User access to backup share.

---

### Q11
During CVM maintenance mode entry, what is the minimum recommended RAM for the CVM on a 4-socket production host?
- A) 8 GB
- B) 16 GB
- C) 20-32 GB (depends on node size)
- D) 64 GB

**Answer: C**
20-32GB is the recommended minimum for production CVMs. Sizing depends on cluster size and workload. Enter maintenance mode: Prism > Infrastructure > Hosts > Select Host > Actions > Enter Maintenance Mode. During this, CVM continues managing data, so sufficient RAM is critical. Under-sized CVMs cause performance degradation.

---

### Q12
You notice TX/RX throughput drops on a VM despite sufficient network capacity. Which optimization should you apply?
- A) Increase vCPU count
- B) Enable virtio-net driver in guest OS
- C) Reduce MTU size to 1400 bytes
- D) Add more vNICs to the VM

**Answer: B**
Virtio-net is the high-performance paravirtual NIC driver. Legacy e1000 emulation is slower. Install virtio-net via: Linux: `ethtool -K eth0 sg on tso on`, Windows: Nutanix Guest Tools. Monitor via Prism > VM > Network stats. Virtio-net provides 2-3x higher throughput.

---

### Q13
A protection domain replicates VMs every 1 hour via async replication. A host fails at 11:30 AM; last snapshot was at 11:00 AM. What is the RPO for this scenario?
- A) Zero RPO (continuous protection)
- B) 30 minutes (data from 11:00-11:30 is lost)
- C) 1 hour RPO (design spec)
- D) Depends on failover method

**Answer: B**
RPO = time between last successful replication and failure. With 1-hour schedule and failure at 11:30, RPO = 30 minutes (data from 11:00-11:30 is lost). Configure via Prism > Protection Domain > Replication Settings. NearSync achieves 1-15 min RPO; Sync metro achieves zero RPO.

---

### Q14
When adding VMs to a protection domain, which operation must complete before remote replication begins?
- A) Create policy tag on all VMs
- B) Initial snapshot created and seeded to remote site
- C) Disable snapshots on source site
- D) Increase protection domain bandwidth limit

**Answer: B**
Initial seeding (baseline copy of snapshots) to remote site must complete first. Configure protection domain: Prism > Protection Domain > Create > Select VMs > Set replication schedule > Seeding begins automatically. Verify seeding status via Prism > Replication Jobs. Only incremental snapshots are sent afterward.

---

### Q15
You're planning DR site capacity for 50 production VMs (avg 4 vCPU, 8 GB RAM each). What minimum capacity should the DR site have?
- A) 50 VMs worth (same as production: 200 vCPU, 400 GB RAM)
- B) 25-30 VMs worth (50% of production)
- C) 75-100% of production capacity
- D) 10-20% of production (just for critical tier)

**Answer: C**
DR site should have 75-100% of production capacity to handle failover. Many failures are unpredictable; assume worst-case all production VMs fail simultaneously. If cost-prohibitive, implement tiered failover: critical (100%), important (75%), non-critical (50%). Configure via capacity analysis reports and Leap recovery plan priorities.

---

### Q16
What is the primary purpose of the reverse replication feature in async replication?
- A) Restore production from DR backup
- B) Mirror data from DR back to production for failback
- C) Increase RPO by 50%
- D) Reduce snapshot frequency

**Answer: B**
Reverse replication enables failback: after DR failover, sync changes made on DR site back to production for recovery. Configure via Prism > Protection Domain > Replication Settings > Enable Reverse Replication. This avoids data loss during failback by syncing DR changes back to healed production site.

---

### Q17
Your snapshot retention policy specifies: daily for 7 days, weekly for 4 weeks, monthly for 12 months. Where do you configure this in Nutanix?
- A) Prism > VM > Snapshot Settings
- B) Prism > Protection Domain > Replication Settings > Retention Policy
- C) Prism > Capacity > Retention Rules
- D) Prism > Storage > Volume Groups > Retention Schedule

**Answer: B**
Retention policies are configured per protection domain to control snapshot lifecycle. Access via Prism > Protection Domain > Select PD > Replication Settings > Retention tab. Define daily/weekly/monthly retention counts. This prevents storage bloat and ensures compliance with data retention requirements.

---

### Q18
You're implementing planned failover for maintenance. What is the critical difference from unplanned failover?
- A) Planned failover requires more bandwidth
- B) Planned failover is bi-directional; unplanned is one-way
- C) Planned failover allows graceful VM shutdown and minimal data loss; unplanned triggers immediate failover
- D) Planned failover only works with sync replication

**Answer: C**
Planned failover: shut down source VMs gracefully, ensure all data is replicated, then activate at DR. Unplanned: source site is unavailable; DR site activates immediately with potential data loss (up to RPO). Both use Leap recovery plans; planned has additional pre-shutdown validation steps. Configure via Prism > Disaster Recovery > Execute Failover > Planned vs Unplanned.

---

### Q19
During a test failover using Leap, what is protected from being affected?
- A) Production snapshots on source site
- B) Live production VMs on source site  
- C) Replication schedule
- D) All of the above

**Answer: D**
Test failover is non-destructive. Production VMs remain untouched, snapshots on source stay intact, replication continues. DR site spins up isolated copies to test recovery plan. After validation, discard test VMs. This enables safe DR drills without impacting production. Run via Prism > Disaster Recovery > Test Failover.

---

### Q20
You need to analyze per-core CPU utilization across all nodes. Which Prism interface provides this visibility?
- A) Prism > Dashboard > CPU Summary
- B) Prism > Analysis > CPU > Per-Core Breakdown
- C) Prism > Infrastructure > Hosts > Select Host > CPU Performance Graph
- D) SSH to CVM and run `mpstat -P ALL`

**Answer: C**
Per-host CPU analysis: Prism > Infrastructure > Hosts > Select Host > Performance tab > CPU graph (shows per-core and aggregate). Per-socket/per-core breakdown helps identify NUMA imbalance, hot cores, or cache contention. `mpstat` on CVM is also valid for detailed kernel-level analysis.

---

### Q21
A host consistently shows high CPU overhead in Prism compared to other hosts. Which component is likely consuming the overhead?
- A) Guest OS processes
- B) CVM services (metadata, replication, snapshot)
- C) Network drivers
- D) Physical hardware management controller

**Answer: B**
CVM CPU overhead varies by role: storage/replication intensive CVMs consume more CPU. Compare via Prism > Infrastructure > Hosts > CPU metrics. If one CVM is hot, check replication jobs, snapshot operations, or storage I/O on `ps aux` on that CVM. May need to balance workload or increase CVM vCPU.

---

### Q22
Your VM requires SCSI disks instead of virtio. What is the primary tradeoff of this choice?
- A) Better performance due to native support
- B) More realistic simulation of physical hardware; slight performance penalty vs. virtio
- C) Required for Windows Server Failover Clustering
- D) No tradeoff; use SCSI for all VMs

**Answer: B**
SCSI emulation is more realistic but has ~5-10% performance overhead vs. virtio-blk (paravirtual). Use SCSI for compatibility with legacy applications, WSFC, or 3rd-party tools that require true SCSI support. Use virtio for performance-critical VMs. Configure via Prism > VM > Edit > Disk Controller Type.

---

### Q23
You're sizing VMs for a database with 50,000 IOPS requirement. Prism analysis shows average vDisk utilization is 35%. What should you do?
- A) Use SSDs only; vDisk utilization is already high
- B) Analyze hot vDisks to identify bottlenecks; 35% avg may hide peaks
- C) Reduce vCPU to lower I/O contention
- D) Increase vDisk count to distribute load

**Answer: B**
Average utilization hides hot spots. Analyze via Prism > Storage > Volume Group > Select VG > Per-Disk breakdown. Some vDisks may be at 80%+ while others idle. Distribute load: split database files across vDisks, or move hot vDisk to faster tier. Peak analysis is critical for right-sizing.

---

### Q24
Your Leap recovery plan has a boot order: Web Tier → App Tier → Database. What does this prevent?
- A) Network latency between tiers
- B) App Tier connecting to non-existent Database
- C) Memory contention during simultaneous boot
- D) Excessive network traffic

**Answer: B**
Boot order ensures dependencies are satisfied. App Tier boots only after Database is ready, preventing connection failures. Configure via Leap > Recovery Plan > Define Groups > Boot Sequence Priority. Validates pre-scripts: DB readiness check runs before app startup.

---

### Q25
You enable SMB Previous Versions on a file server VM. Where are point-in-time copies accessible to users?
- A) Prism > Snapshots > Share with Users menu
- B) Right-click file > Properties > Previous Versions tab
- C) Command line: `vssadmin list shadows`
- D) Backup software restore interface

**Answer: B**
After enabling SMB Previous Versions (Windows feature) and NGT VSS snapshots, users see "Previous Versions" tab in file properties. No IT intervention needed for self-service restore. Requires: registry key `HKLM\System\CurrentControlSet\Services\LanmanServer\Parameters\EnableFileCache=1`, plus snapshot schedule (e.g., hourly).

---

### Q26
A VM fails with high page fault rate. Which memory diagnostic should you run first?
- A) Increase vCPU to reduce memory pressure
- B) Check balloon driver stats in Prism > VM > Memory metrics
- C) Add 50% more RAM to VM
- D) Enable memory compression

**Answer: B**
Page faults indicate memory pressure. Check Prism > VM > Select VM > Monitor > Memory tab for: active/granted/swapped memory. If swapped > 10%, ballooning is active and VM is using disk swap. Solution: reduce overcommit, add host RAM, or migrate VM. Adding vCPU doesn't help memory pressure.

---

### Q27
You need to implement a multi-site DR topology: Site A → Site B (primary) and Site A → Site C (secondary). How many protection domains are required?
- A) 1 (A → B/C both in same PD)
- B) 2 (separate PDs for B and C)
- C) 3 (one for each pair)
- D) Depends on RPO requirement

**Answer: B**
One protection domain can replicate to one remote site only. For A → B and A → C, create 2 PDs: PD1 (A → B), PD2 (A → C). Configure via Prism > Protection Domain > Create > Set remote site. Allows different retention/RPO policies per remote site.

---

### Q28
Your protection domain replication is failing. You check Prism > Replication Jobs and see "Replication Capacity Reached." What is the immediate solution?
- A) Increase snapshot frequency
- B) Increase replication bandwidth limit via Prism > Network > QoS
- C) Delete old snapshots to free capacity
- D) Disable and recreate protection domain

**Answer: B**
Replication bandwidth limit is a QoS setting. Increase via Prism > Network > Quality of Service > Edit Replication Policies > Bandwidth Limit. Default is conservative to protect production traffic. Increase gradually and monitor impact on cluster performance.

---

### Q29
Leap runbook contains a pre-failover script that validates database consistency. When does this script execute?
- A) Only on recovery plan creation
- B) Before failover is initiated; if script fails, failover is blocked
- C) After failover completes; before services start
- D) Only during test failover

**Answer: B**
Pre-scripts run before failover; failures block the operation. Post-scripts run after VMs boot on DR. Validation scripts should check: network connectivity, shared storage accessibility, critical service status. Configure via Leap > Recovery Plan > Pre/Post Scripts section.

---

### Q30
You observe dropped packets on a VM vNIC in Prism metrics. What is the most likely cause on Nutanix?
- A) Physical NIC is full; bandwidth throttling is dropping frames
- B) Virtio-net ring buffer overflow; upgrade to virtio-net v1.1
- C) CVM network I/O processing bottleneck on over-committed host
- D) Guest OS network driver issue; update via NGT

**Answer: C**
Dropped packets typically indicate: CVM network processing is saturated from many VM traffic flows, or vhost-net kernel thread is CPU-bound. Check via `ethtool -S vmX` (drop counters) and CVM `top` for vhost processes. Solution: vMotion one or more VMs off host, or optimize CVM network performance via NIC tuning (RX/TX ring size).

---

### Q31
A VM is configured with hot vCPU add support. During operation, you add 4 vCPUs via Prism > VM > Edit. What happens inside the guest?
- A) New vCPUs are immediately available to kernel; no reboot needed
- B) ACPI hotplug event is triggered; guest OS must enable CPUs manually
- C) VM must be powered off; vCPU change takes effect on reboot
- D) Hypervisor waits for guest acknowledgment before assigning vCPUs

**Answer: B**
Hot vCPU addition triggers ACPI hotplug events. Guest OS must register new vCPUs. Linux: `echo 1 > /sys/devices/system/cpu/cpuX/online`. Windows: Device Manager detects "Unknown Device" (new vCPU), drivers are auto-loaded. To verify: `lscpu` (Linux) or Device Manager (Windows). Some workloads require restart for kernel thread affinity.

---

### Q32
Your cluster has a skewed VM distribution: Node A (50 VMs), Node B (10 VMs), Node C (8 VMs). How does this impact cluster performance?
- A) No impact; Nutanix load-balances automatically at hypervisor level
- B) Node A is hot; its CVM is handling excess I/O; vMotion other VMs off
- C) Node B/C are underutilized but stable; rebalancing causes no benefit
- D) Network performance degrades due to traffic asymmetry

**Answer: B**
Skewed distribution causes one CVM to handle disproportionate metadata/replication load. Check via Prism > Infrastructure > Hosts > Compare CPU/Memory across CVMs. Rebalance: vMotion VMs to under-utilized nodes. Aim for even VM count distribution to balance CVM load. Use `nstat` on CVMs to verify traffic patterns.

---

### Q33
You're configuring a snapshot schedule for a protection domain: every 2 hours with 4-day retention. How many snapshots can exist simultaneously?
- A) 12 (24 hours ÷ 2 hours per snapshot)
- B) 24 (4 days × 6 snapshots per day)
- C) 48 (4 days × 24 hours ÷ 2 hours)
- D) Depends on available storage capacity

**Answer: C**
4-day retention with 2-hour interval = (4 × 24 hours) ÷ 2 hours = 48 snapshots max. Each snapshot consumes space; verify via Prism > Storage > Usage to ensure adequate capacity. Older snapshots are deleted per retention policy.

---

### Q34
A VM experiences CPU ready time of 8%. Is this acceptable?
- A) Yes; <10% is the recommended threshold
- B) No; any CPU ready time indicates contention
- C) Depends on workload; 8% is borderline
- D) Yes; only >20% is problematic

**Answer: A**
<10% CPU ready time is acceptable. >10% indicates contention. 8% is healthy. Monitor via Prism > VM > Monitor > CPU tab or vSphere Performance Charts (if using ESXi). For non-latency-sensitive workloads, up to 15% may be tolerable. Critical apps should maintain <5%.

---

### Q35
You need to verify CVM maintenance mode completed successfully. Which command on the CVM confirms its status?
- A) `cvm_status.sh`
- B) `manage_cvm.sh --status`
- C) SSH to cluster and run `cluster status` at Prism UI
- D) Check Prism > Infrastructure > Hosts > Host status field

**Answer: D**
Prism > Infrastructure > Hosts shows host status: Normal, Maintenance Mode (if in progress), or alerts. During maintenance mode, the host is removed from cluster operations. The CVM still runs cluster services. Verify completion: Host status returns to Normal, and cluster state is stable. Also check `cluster status` via SSH: `nutanix@cvm$ cluster status` (shows all nodes).

---

### Q36
A user reports VM snapshots are not appearing in Previous Versions. You've already confirmed NGT is installed. What is the next diagnostic step?
- A) Check snapshot schedule exists and last run was recent
- B) Restart CVM to refresh VSS provider
- C) Delete and recreate VM snapshots
- D) Verify SMB Previous Versions registry setting is enabled

**Answer: A**
Snapshots must exist before Previous Versions can show them. Check Prism > VM > Snapshots tab for recent snapshots. If none exist, create manual snapshot. Then verify: 1) SMB Previous Versions enabled (Windows feature), 2) Snapshot schedule configured, 3) NGT VSS service running. If schedule exists but no snapshots, check Prism > Protection Domain > Replication Jobs for errors.

---

### Q37
Your cluster is running with 5 nodes, each with 20TB raw capacity. You want 2x replication. What is usable capacity?
- A) 100TB (5 × 20TB)
- B) 50TB (5 × 20TB ÷ 2)
- C) 75TB (5 × 20TB × 0.75)
- D) 40TB (2 × 20TB)

**Answer: B**
With 2x replication: usable capacity = (Total raw capacity) ÷ (Replication factor). 100TB raw ÷ 2 = 50TB usable. This assumes full redundancy. With 3x replication: 100TB ÷ 3 = 33TB. Calculate via Prism > Capacity > Effective Usable Capacity or Prism > Storage > Capacity Summary.

---

### Q38
You want to prevent a critical database VM from migrating off its current host. Which VM affinity configuration should you use?
- A) Soft affinity with preferred host label
- B) Hard affinity to current host with override disabled
- C) Host policy restriction via cluster settings
- D) vNUMA pinning to physical NUMA nodes

**Answer: B**
Hard affinity with override disabled prevents any vMotion of that VM. Configure via Prism > VM > VM Affinity > Hard Affinity > Select Target Host > Disable Override. Note: This can impact load balancing and HA recovery if host fails. Consider soft affinity instead: create label "critical_db" and assign preferred hosts, allowing flexibility during maintenance.

---

### Q39
A Leap recovery plan for a 3-tier app shows: Tier 1 boot time 2 minutes, Tier 2 boot time 5 minutes, Tier 3 boot time 3 minutes. What is the minimum failover RTO if booted sequentially?
- A) 5 minutes (longest tier)
- B) 10 minutes (Tier 1 + Tier 2)
- C) 10 minutes (2 + 5 + 3, sequential)
- D) 3 minutes (parallel boot of all tiers)

**Answer: C**
Sequential boot with dependencies: Tier 1 boots (2 min), then Tier 2 (5 min), then Tier 3 (3 min) = 10 minutes total RTO. If tiers are independent and boot in parallel, RTO = 5 minutes (longest tier). Configure boot groups in Leap > Recovery Plan > Tier Groups. Parallel boot reduces RTO significantly.

---

### Q40
You're analyzing a VM's CPU performance and notice CPU%SYS is very high (50%) while CPU%USER is low (10%). What does this indicate?
- A) Application is compute-bound
- B) Kernel is spending excessive time in system calls (likely I/O or lock contention)
- C) vCPU count is too low
- D) CVM is consuming host resources

**Answer: B**
High %SYS indicates heavy system call load: likely storage I/O, network I/O, or inter-process locks. Analyze via: Linux `vmstat 1` (sys column), Windows Performance Monitor > Processor > % Privileged Time. Check `iostat` for disk I/O and `tcpdump` for network. Solution: reduce I/O operations, optimize lock usage, or increase vCPU to reduce context switches.

---

### Q41
A protection domain snapshot schedule is set to every 6 hours with 2-day retention. An RPO audit requires <3-hour max data loss. What is the problem?
- A) Snapshot frequency is too low; change to every 2 hours
- B) Retention is insufficient; extend to 5 days
- C) Replication is asynchronous; must use synchronous Metro Avail
- D) No problem; 2-day retention exceeds audit requirement

**Answer: A**
RPO = time between failures and last good backup. 6-hour schedule = worst-case 6-hour data loss. Audit requires <3 hours, so change schedule to every 2 hours (or adjust as needed). Retention doesn't affect RPO; it affects recovery window. Configure via Prism > Protection Domain > Replication Settings > Snapshot Schedule.

---

### Q42
You're troubleshooting a VM's high memory usage. Prism shows: Active=6GB, Granted=8GB, Swapped=2GB. What does this reveal?
- A) VM has true memory leak; restart required
- B) Hypervisor is ballooning; memory pressure is real; VM needs more RAM or host capacity
- C) VM is caching aggressively; normal behavior
- D) Network memory transfer is active; wait for completion

**Answer: B**
Breakdown: Active (6GB) = actually used by guest; Granted (8GB) = allocated; Swapped (2GB) = ballooned out to host swap. Total needed: 8GB, but only 6GB active. This indicates memory pressure: either over-committed VM or under-provisioned host. Solution: migrate VM to less-loaded host or reduce overcommit ratio.

---

### Q43
Leap executes a recovery plan on DR site, and a VM fails to boot. The recovery plan includes a post-boot validation script. What happens?
- A) Recovery plan marks VM as "Failed"; stops remaining boot sequence
- B) VM continues running; post-script reports error but doesn't block
- C) Depends on script error handling: if script exit code ≠ 0, failover can be rolled back
- D) Post-script only runs if boot succeeds; VM failure prevents script execution

**Answer: D**
Post-boot scripts only execute if VM boots successfully. Pre-boot scripts run before boot and can block failover. If VM fails to boot, post-script doesn't run. Configure via Leap > Recovery Plan > Edit VM > Post-Boot Scripts. Ensure boot order and pre-scripts satisfy VM dependencies so boot doesn't fail.

---

### Q44
You implement a multi-site DR: 3 protection domains (PD1, PD2, PD3) all replicating from Site A to Site B. How do you prevent Site B from becoming oversubscribed?
- A) Configure PD replication schedules to stagger: PD1 every 2h, PD2 every 2h+30m, PD3 every 2h+60m
- B) Set QoS bandwidth limits per PD to balance replication traffic
- C) Capacity plan: ensure Site B has ≥ capacity of Site A for all PDs combined
- D) All of the above

**Answer: D**
All three strategies apply: 1) Stagger schedules to avoid simultaneous replication spikes, 2) QoS limits prevent network congestion, 3) Capacity planning ensures Site B can accommodate all VMs if failover occurs. Configure via: Prism > Network > QoS > Set Per-PD Bandwidth Limits, and Prism > Protection Domain > Schedule > Stagger times.

---

### Q45
A cluster node fails and a VM on that host is protected by a protection domain. Will Leap DR automatically failover the VM?
- A) Yes; Leap triggers automatic failover if node fails
- B) No; Leap requires manual failover initiation
- C) Depends on protection domain "Auto Failover" setting
- D) Only if VM is configured with HA affinity rules

**Answer: B**
Leap is a manual failover tool; it doesn't auto-trigger on node failure. Nutanix native HA will restart VM on another node if possible. Leap is for planned/unplanned DR failover to remote site. If VM is in a protection domain and you decide to failover to remote site due to node failure, you manually execute Leap failover. Configure via Prism > Disaster Recovery > Execute Failover.

---

### Q46
You're configuring a vNIC for optimal performance on a Linux VM. Which settings should you enable?
- A) Virtio-net driver, GSO (Generic Segmentation Offload), checksum offload
- B) E1000 emulation, TSO disabled, checksum in-kernel
- C) SRIOV passthrough, disable CVM monitoring
- D) Jumbo frames 9000 MTU, disable virtio

**Answer: A**
Virtio-net with GSO/TSO/checksum offload provides optimal performance: reduces CPU overhead by offloading segmentation/checksums. Verify on Linux: `ethtool -k eth0` (check gso, tso on) and `ethtool -c eth0` (rx/tx descriptors). Jumbo frames help but aren't critical if default MTU 1500 works. SRIOV bypasses CVM, reducing visibility and live migration capability.

---

### Q47
A VM's vDisk performance shows 10ms latency during peak hours, but 2ms during off-peak. Which analysis should you perform?
- A) Ignore; normal variation is expected
- B) Check vDisk IOPS and queue length to identify peak load characteristics
- C) Increase vCPU to handle peaks
- D) Migrate vDisk to SSD tier

**Answer: B**
Latency increases with queue depth (load). Analyze via Prism > Storage > Volume Group > Per-Disk breakdown > Peak IOPS. If peak IOPS are acceptable but latency is high, it's queue depth/congestion. Solutions: distribute load across vDisks, optimize query/workload to reduce IOPS, or migrate to faster tier. SSD is option only if all tiers are saturated.

---

### Q48
Your snapshot schedule creates snapshots but replication isn't happening. Where should you check first?
- A) Prism > Protection Domain > Remote site configuration
- B) Prism > Replication Jobs > Check for errors
- C) CVM → run `afs -afs showrepl`
- D) SSH to remote site and verify cluster is reachable

**Answer: B**
Prism > Replication Jobs shows real-time replication status with specific error indicators. Common errors include: "Authentication Failed — invalid credentials on remote cluster", "Network Unreachable — cannot reach remote Prism IP on port 9440", "Insufficient Capacity on Remote — not enough free storage", "Remote Cluster Offline — no response from remote site CVMs", or "PD Not Configured on Remote — protection domain does not exist at destination". If replication jobs are missing entirely, the protection domain may not have a remote site configured (check A). Check Replication Job details for exact error message and remediation steps. `afs showrepl` on CVM is valid for deep debugging but Prism Replication Jobs is the authoritative first diagnostic point.

---

### Q49
You want to monitor CVM network I/O to identify if CVM network processing is the bottleneck. Which CVM command shows per-interface statistics?
- A) `ethtool -S eth0` (detailed stats)
- B) `iftop` (live bandwidth per flow)
- C) `nstat -rtnap | grep TCP` (TCP connection stats)
- D) All can be useful; use `ethtool` first

**Answer: D**
Different tools serve different purposes: `ethtool -S` shows detailed NIC stats (RX/TX drops, errors), `iftop` shows real-time bandwidth per connection, `nstat` shows protocol stats. For CVM bottleneck analysis, start with `top` (CVM CPU), then `ethtool -S` (check for drops), then `iftop` (identify heavy flows). Combine for full picture.

---

### Q50
A VM requires NGT installation but the host kernel version is 4.x. Will NGT install successfully?
- A) Yes; NGT supports all Linux kernels
- B) No; NGT requires kernel 5.x or later
- C) Yes; but with reduced functionality (no VSS snapshots on 4.x kernels)
- D) Depends on specific kernel patch level

**Answer: A**
NGT supports kernel 4.x and later. VSS snapshots are Windows-specific (use VSS provider). Linux VMs use crash-consistent snapshots or app-consistent snapshots via custom pre/post scripts. Installation: Linux → download NGT ISO, mount, run installer. Verify: `rpm -q nutanix-guest-tools` or `dpkg -l | grep nutanix`.

---

### Q51
You're analyzing a VM's NUMA performance. The VM has 8 vCPU (4 cores per socket on 2-socket host), 16GB RAM. Memory access times are slow. What should you check?
- A) Run `numactl --hardware` on guest to verify NUMA configuration
- B) Check guest OS process affinity is aligned with NUMA nodes
- C) Verify vCPU placement in Prism > VM > Properties > NUMA Pinning
- D) All of the above

**Answer: D**
NUMA optimization requires: 1) numactl to understand host/guest topology, 2) process affinity via taskset/numactl to bind processes to specific nodes, 3) Prism to verify vCPU placement. Slow memory access indicates remote access (memory on opposite socket). Solution: pin vCPU to socket, allocate memory on same socket, or use interleave if app requires cross-socket access.

---

### Q52
A protection domain is configured to replicate to a remote site but "Seeding" status has been "In Progress" for 24 hours. What is the likely issue?
- A) Network bandwidth between sites is insufficient
- B) Remote site cluster has insufficient disk space
- C) Seeding is blocked by cluster lock acquisition
- D) A or B

**Answer: D**
Slow seeding typically indicates: insufficient bandwidth (increase QoS limit for initial seeding), insufficient remote capacity (check via Prism on remote site), or network connectivity issues. Check Prism > Replication Jobs > Seeding Job > Monitor > bandwidth utilization. If bandwidth shows zero, network path is broken. Verify: `ping remote_cluster_vip`, `nstat` on CVM.

---

### Q53
You're planning snapshot retention for compliance: data must be recoverable for 90 days. What retention policy should you set?
- A) 90 days of daily snapshots (90 snapshots)
- B) Daily for 30 days, weekly for 12 weeks, monthly for 6 months
- C) Minimum daily snapshots for 90 days; configure via protection domain retention policy
- D) Keep all snapshots indefinitely; delete manually

**Answer: C**
Retention policy defines how long snapshots are kept. Set via Prism > Protection Domain > Replication Settings > Retention Policy. For 90-day compliance, minimum is daily snapshots for 90 days = 90 snapshots. Option B (30 daily + 12 weekly + 6 monthly) covers 90+ days with fewer total snapshots (better storage efficiency). Configure whichever meets compliance requirements and storage budget.

---

### Q54
A VM with high I/O workload is on a host with high CVM CPU. Should you immediately vMotion the VM?
- A) Yes; the CVM is overloaded and can't handle the I/O
- B) No; move the VM only if its own CPU/memory is high
- C) First investigate: CVM CPU may be handling replication for other VMs, not necessarily this one
- D) Move only if accompanied by CVM RAM increase

**Answer: C**
CVM CPU usage includes: metadata, replication, snapshots, and deduplication for all VMs on host. High CVM CPU doesn't necessarily mean the high-I/O VM is the cause. Investigate: check CVM network/disk I/O per VM, identify actual source. Then vMotion only the hot VM if it's the cause. Blind vMotion risks moving the wrong VM.

---

### Q55
Your Prism shows a VM with "CPU.EffectiveReadyTime" metric of 50ms. Does this indicate contention?
- A) Yes; any >0 ready time is contention
- B) No; 50ms is negligible for non-real-time workloads
- C) Depends on measurement interval; 50ms effective over 1 second = 5% ready time (acceptable)
- D) 50ms always indicates critical contention

**Answer: C**
CPU ready time is a percentage, not an absolute value. 50ms ready time within a 1-second interval = 50/1000 = 5% ready time (acceptable). The metric interpretation depends on sampling interval. Check Prism metric definitions: typically reports as percentage. If metric shows raw milliseconds, divide by sampling interval to get percentage.

---

### Q56
You want to create a recovery plan that boots VMs in parallel (not sequential). How do you configure this in Leap?
- A) Add all VMs to the same boot group
- B) Set boot group priority to 0 for all VMs
- C) Create separate boot groups with same numeric sequence number
- D) Cannot be configured; Leap always boots sequentially

**Answer: A**
Leap recovery plans use boot groups. All VMs in the same group boot in parallel; groups boot sequentially. To parallelize all VMs, add them all to Group 1. To sequence dependencies, create Group 1 (database), Group 2 (app), Group 3 (web). Configure via Leap > Recovery Plan > VM Groups > Assign VMs > Set Groups.

---

### Q57
A Windows VM has NGT installed and VSS snapshots enabled. However, SMB Previous Versions doesn't show up in file properties. What should you verify?
- A) SMB Previous Versions feature is enabled in Windows Features
- B) Registry setting `EnableSnapshots` is set to 1
- C) Network share has "Restore Previous Versions" permission
- D) All of the above

**Answer: D**
All three are required: 1) Windows Feature (Server Roles > File Services > File Server > VSS Agent), 2) Registry `HKLM\System\CurrentControlSet\Services\LanmanServer\Parameters` (EnableFileCache=1, EnableSnapshots=1), 3) Share permissions allow restoration. Verify each via: Windows Features UI, Registry Editor, and Share Permissions dialog.

---

### Q58
A cluster has two hosts, each with 4 NIC uplinks to the same L2 network. One uplink on Host A fails. What happens to VM network traffic from Host A VMs?
- A) VMs lose connectivity; manual intervention needed
- B) Traffic fails over to remaining 3 uplinks on Host A automatically
- C) Prism alerts but doesn't auto-recover
- D) Depends on NIC teaming/bonding configuration

**Answer: D**
Failover depends on NIC bonding mode: Active-Backup = traffic immediately shifts to standby NIC (transparent), Balance-ALB = traffic rebalances across active NICs, LACP = depends on switch config. Nutanix doesn't mandate a specific bonding mode; cluster inherits host OS config. Verify via: Linux `cat /proc/net/bonding/bond0` or Windows `Get-NetLbfoTeam`. Prism alerts on NIC failure regardless.

---

### Q59
You're right-sizing a VM after analyzing 30 days of performance data. Current: 8 vCPU, avg CPU utilization 25%, peak 45%. Recommendation?
- A) Keep 8 vCPU; add RAM instead
- B) Reduce to 4 vCPU; 25% utilization on 8 cores = 2 core equivalent
- C) Increase to 16 vCPU; include 50% headroom above peak
- D) Reduce to 6 vCPU; maintain some headroom for bursts

**Answer: D**
Right-sizing formula: (Peak utilization ÷ 100) × Current vCPU + headroom. Peak 45% on 8 vCPU = 3.6 cores needed. Add 30-50% headroom for growth/bursts: 3.6 + (1-2 cores) = 5-6 cores target. Reducing to 4 vCPU is risky (no headroom). Verify change by setting new config, monitoring for 7 days, ensuring CPU ready time <10%.

---

### Q60
A VM's storage latency is consistently >20ms. You've ruled out IOPS saturation. What should you investigate next?
- A) Network latency between cluster and remote storage
- B) CVM disk I/O processing time via `iostat` on CVM
- C) Hypervisor cache effectiveness: check hit rates in Prism
- D) Physical hardware: SSD wear, SATA speed limitations

**Answer: B**
If IOPS are acceptable but latency is high, investigate CVM I/O path: CVM disk processing, extent group calculations, replication overhead. Run on CVM: `iostat -xmt 1 10` to see avg I/O time per disk. If CVM I/O time is high, issue is in CVM processing. If CVM latency is low but guest sees high latency, bottleneck is network/replication. Check Prism > Storage > Latency Breakdown to identify source.

---

## SECTION 2: SELECT TWO QUESTIONS (10 Questions)

### Q61 (Select TWO)
Which two steps are required to enable self-service file restore on a Windows file server VM? (Select 2)
- A) Install Nutanix Guest Tools with VSS provider enabled
- B) Enable SMB Previous Versions in Windows Features
- C) Configure Leap recovery plan for the file server
- D) Set snapshot schedule in protection domain
- E) Create snapshots and ensure snapshot schedule is active

**Answer: A, B**
Self-service restore requires: 1) NGT VSS provider (captures application-consistent snapshots), 2) SMB Previous Versions enabled (makes snapshots accessible in file properties). C is for DR failover (not needed for self-service). D and E are supportive but optional if manual snapshots are created. VSS + Previous Versions = complete self-service solution.

---

### Q62 (Select TWO)
Which two configurations ensure optimal NUMA performance for a memory-intensive VM on a 2-socket host? (Select 2)
- A) vCPU count equal to one physical socket core count
- B) Pin vCPU to specific socket via NUMA affinity
- C) Allocate all VM RAM to single NUMA node
- D) Set memory overcommit to 2x to leverage both sockets
- E) Disable vNUMA to prevent remote memory access

**Answer: A, B**
NUMA optimization: 1) Match vCPU count to socket topology (e.g., 4 vCPU per socket on 2-socket host), 2) Pin vCPU to socket to enforce locality. C is incorrect (memory interleave is sometimes better than single node). D increases remote access (bad). E disables NUMA benefits. vNUMA pinning is correct; disable NUMA entirely is wrong.

---

### Q63 (Select TWO)
Which two of these are valid RPO targets for different replication scenarios? (Select 2)
- A) Async replication with 6-hour schedule: 6-hour RPO
- B) NearSync replication: 1-15 minute RPO
- C) Sync Metro Avail: 500ms RPO
- D) Snapshot-based recovery: zero RPO
- E) Manual daily backups: 24-hour RPO

**Answer: A, B**
Valid RPO options: A) Async = snapshot interval = RPO (6hr schedule = 6hr worst-case loss), B) NearSync = 1-15min RPO (designed for medium-distance replication). C is wrong (Metro = zero RPO, not 500ms). D is wrong (snapshots have RPO equal to snapshot interval). E is correct RPO but question asks "which two valid scenarios" and A+B are most common/correct.

---

### Q64 (Select TWO)
Which two settings prevent a database VM from migrating during a critical operation? (Select 2)
- A) Hard VM affinity to current host with override disabled
- B) CVM anti-affinity rules preventing migrations
- C) Host maintenance mode to block incoming vMotion
- D) Set storage affinity to prevent volume migration
- E) Soft affinity with high priority weight

**Answer: A, C**
Hard affinity (A) explicitly prevents vMotion. Maintenance mode (C) blocks VM placement but allows existing VMs to stay. B is invalid (CVMs don't use anti-affinity for user VMs). D doesn't prevent VM migration (storage affinity doesn't exist in standard Nutanix). E (soft affinity) doesn't prevent migration, only discourages it. A+C are enforcement mechanisms.

---

### Q65 (Select TWO)
Which two protection domain settings directly impact RPO and recovery capability? (Select 2)
- A) Snapshot schedule frequency and retention period
- B) Replication bandwidth QoS limit
- C) Remote site IP/address and replication protocol
- D) VM backup software integration
- E) Protection domain description name

**Answer: A, C**
A) Snapshot frequency = RPO (every 1 hour = 1hr RPO), retention = recovery window (7-day retention = can recover snapshots up to 7 days old). C) Remote site config = which site receives replicas (affects RTO/RPO if remote site is down). B impacts speed but not RPO/RTO. D is backup, not protection domain. E is metadata only.

---

### Q66 (Select TWO)
During planned failover using Leap, which two steps ensure minimal data loss? (Select 2)
- A) Gracefully shut down all source site VMs before failover
- B) Verify all pending snapshots are replicated to remote site
- C) Delete old snapshots before initiating failover
- D) Trigger an immediate snapshot of all VMs before failover
- E) Disable replication jobs after failover completes

**Answer: A, B**
Planned failover best practices: A) Graceful shutdown prevents dirty data loss, B) Confirm replication is current (no pending snapshots). C is risky (loses recovery points). D is good but not required if schedule just ran. E disables failback capability. A+B provide safety: shutdown + confirmation = zero data loss.

---

### Q67 (Select TWO)
Which two metrics indicate that memory ballooning is actively reclaiming VM memory? (Select 2)
- A) Granted memory equals active memory
- B) Swapped memory >0 GB (VM is using host swap)
- C) Balloon driver stats show pages reclaimed/released
- D) VM page fault rate is zero
- E) CVM memory utilization is high

**Answer: B, C**
B) Swapped >0 = hypervisor is actively ballooning (moving memory to swap). C) Balloon driver statistics directly show reclaim activity. A is wrong (granted > active indicates headroom, not ballooning). D is not related (page faults are guest-level). E (CVM memory) doesn't indicate guest ballooning. B+C are direct indicators.

---

### Q68 (Select TWO)
Which two configurations ensure optimal per-vDisk performance for high-IOPS workloads? (Select 2)
- A) Increase vCPU count of VM to handle more I/O operations
- B) Distribute database files across multiple vDisks to reduce per-disk queue depth
- C) Increase snapshot frequency to clear I/O cache
- D) Place vDisk on SSDs or faster storage tier
- E) Enable iSCSI instead of virtio-blk disk protocol

**Answer: B, D**
B) Multiple vDisks reduce queue depth per disk, improving latency under load. D) Faster storage (SSD) reduces I/O service time. A is wrong (vCPU doesn't affect disk I/O directly). C increases overhead (bad). E) iSCSI requires storage target; virtio-blk is better for local Nutanix. B+D are direct optimizations for per-vDisk performance.

---

### Q69 (Select TWO)
Which two components must be configured to enable reverse replication for failback after async DR? (Select 2)
- A) Enable "Reverse Replication" in protection domain settings
- B) Create separate protection domain from remote site back to production
- C) Verify remote site cluster has sufficient replication capacity
- D) Set failback snapshot schedule to mirror production schedule
- E) Configure pre-failover scripts on remote site

**Answer: A, C**
A) Reverse replication toggle enables bidirectional replication (required for failback). C) Remote site capacity ensures failback is feasible. B is wrong (not a separate PD; same PD reverses direction). D (snapshot schedule) is inherited, not separate. E (pre-scripts) is optional. A+C are core requirements.

---

### Q70 (Select TWO)
Which two network configurations optimize VM-to-CVM communication for storage I/O? (Select 2)
- A) Enable virtio-net driver on VM vNICs
- B) Configure separate physical NICs for storage traffic (if available)
- C) Set vNIC MTU to 1500 bytes (standard)
- D) Enable TCP offload (TSO/GSO) for checksum and segmentation
- E) Disable CVM network monitoring to reduce overhead

**Answer: A, D**
A) Virtio-net provides paravirtual performance (lower overhead than e1000 emulation). D) TCP offload (TSO/GSO) reduces CPU overhead by offloading segmentation. B is not always available/necessary (storage uses same NICs in most Nutanix configs). C (1500 MTU) is standard, not an optimization. E disables visibility (bad). A+D are actual performance optimizations.

---

## SECTION 3: ORDERING/SEQUENCE QUESTIONS (10 Questions)

### Q71
Arrange the steps for entering host maintenance mode and verifying readiness:
1. vMotion all VMs off the host to other cluster nodes
2. Initiate "Enter Maintenance Mode" via Prism > Infrastructure > Hosts > Actions
3. Verify cluster state is "OK" and no alerts are pending
4. Verify the host status changes to "Maintenance Mode" in Prism
5. Monitor replication/rebuild completion on remaining nodes

- A) 1 → 2 → 3 → 4 → 5
- B) 3 → 1 → 2 → 4 → 5
- C) 2 → 1 → 3 → 5 → 4
- D) 1 → 3 → 2 → 5 → 4

**Answer: B**
Rationale: Step 3 (verify cluster health first) ensures cluster can handle the evacuation. Step 1 (vMotion) evacuates VMs. Step 2 initiates maintenance mode. Step 4 verifies mode is active. Step 5 monitors rebuild. Doing anything out of order risks data loss or incomplete evacuation.

---

### Q72
Arrange the order of operations for planned failover using Leap:
1. Shut down all source site VMs gracefully
2. Monitor replication jobs to confirm all snapshots are replicated
3. Create and validate Leap recovery plan with boot order and scripts
4. Activate recovery plan on DR site
5. Verify all VMs boot successfully and services are healthy
6. Configure reverse replication for failback

- A) 1 → 2 → 3 → 4 → 5 → 6
- B) 3 → 1 → 2 → 4 → 5 → 6
- C) 3 → 2 → 1 → 4 → 5 → 6
- D) 2 → 3 → 1 → 5 → 4 → 6

**Answer: C**
Rationale: Step 3 (plan) is prerequisite. Step 2 (confirm replication is current) ensures no data loss. Step 1 (graceful shutdown) ensures clean failover. Step 4 (activate) brings up DR VMs. Step 5 (verify) validates recovery. Step 6 (reverse replication) enables future failback.

---

### Q73
Arrange the steps for configuring a protection domain and initial seeding:
1. Define snapshot retention policy (daily/weekly/monthly counts)
2. Select source VMs to protect
3. Configure remote site IP/credentials
4. Set replication schedule (frequency and interval)
5. Monitor initial seeding progress to completion
6. Create protection domain object in Prism

- A) 6 → 2 → 3 → 1 → 4 → 5
- B) 2 → 6 → 3 → 4 → 1 → 5
- C) 6 → 3 → 2 → 4 → 1 → 5
- D) 2 → 3 → 6 → 1 → 4 → 5

**Answer: A**
Rationale: Step 6 (create PD) first. Step 2 (add VMs) specifies what to protect. Step 3 (remote site) specifies where. Step 1 (retention) defines lifecycle. Step 4 (schedule) triggers replication. Step 5 (monitor) tracks seeding.

---

### Q74
Arrange the diagnostic steps for troubleshooting low VM IOPS performance:
1. Check CPU ready time to rule out CPU contention
2. Analyze per-vDisk I/O latency and queue depth via Prism
3. Verify CVM disk I/O processing time using `iostat` on CVM
4. Check if iSCSI/NFS network latency is the bottleneck
5. Compare peak IOPS against disk/storage tier limits

- A) 2 → 1 → 3 → 5 → 4
- B) 1 → 2 → 5 → 3 → 4
- C) 1 → 3 → 2 → 4 → 5
- D) 2 → 5 → 1 → 3 → 4

**Answer: B**
Rationale: Step 1 (CPU) rules out CPU contention masking I/O issue. Step 2 (per-disk) identifies which disk is hot. Step 5 (compare to limits) determines if it's a capacity issue. Step 3 (CVM processing) checks data path latency. Step 4 (network) checks if it's remote storage issue. Logical progression from VM → storage → infrastructure.

---

### Q75
Arrange the steps for right-sizing a VM based on 30-day performance analysis:
1. Collect 30 days of CPU/memory/disk utilization data from Prism
2. Calculate peak utilization and average utilization
3. Determine current vs. needed vCPU/RAM/disk based on peaks + headroom
4. Apply new VM sizing configuration (reduce/increase resources)
5. Monitor for 7 days post-change to validate CPU ready time and performance
6. Adjust again if CPU ready time >10% or new bottlenecks appear

- A) 1 → 2 → 3 → 4 → 5 → 6
- B) 2 → 1 → 3 → 5 → 4 → 6
- C) 1 → 3 → 2 → 4 → 6 → 5
- D) 3 → 1 → 2 → 5 → 4 → 6

**Answer: A**
Rationale: Logical progression from collection → analysis → calculation → implementation → validation → iteration. Each step depends on prior step's output.

---

### Q76
Arrange the steps for enabling self-service file restore on a Windows file server VM:
1. Create snapshot schedule in protection domain
2. Install Nutanix Guest Tools (NGT) with VSS provider
3. Enable SMB Previous Versions feature in Windows
4. Configure registry settings for snapshot accessibility
5. Create a test file and verify it appears in Previous Versions within 30 seconds

- A) 1 → 2 → 3 → 4 → 5
- B) 3 → 2 → 4 → 1 → 5
- C) 2 → 3 → 4 → 1 → 5
- D) 2 → 4 → 3 → 1 → 5

**Answer: C**
Rationale: Step 2 (NGT) installs VSS capability. Step 3 (Previous Versions) enables UI. Step 4 (registry) configures enablement. Step 1 (schedule) starts creating snapshots. Step 5 (test) validates end-to-end. Can't test until infrastructure is ready.

---

### Q77
Arrange the steps for analyzing and optimizing NUMA memory performance on a VM:
1. Run `numactl --hardware` on guest to see NUMA topology
2. Use `numactl --preferred=node1` to check if process affinity improves latency
3. Configure vCPU pinning in Prism to match NUMA socket allocation
4. Allocate VM RAM to match socket topology
5. Monitor memory latency metrics before and after optimization

- A) 1 → 3 → 4 → 2 → 5
- B) 1 → 2 → 3 → 4 → 5
- C) 3 → 1 → 4 → 2 → 5
- D) 1 → 4 → 3 → 2 → 5

**Answer: A**
Rationale: Step 1 (discover topology). Step 3 (pin vCPU) in hypervisor. Step 4 (allocate RAM) on same socket. Step 2 (test affinity) with `numactl`. Step 5 (measure improvement). Must understand topology first, then configure hypervisor, then validate in guest.

---

### Q78
Arrange the steps for multi-site DR setup (A→B and A→C):
1. Create first protection domain (A→B) with snapshot schedule
2. Create second protection domain (A→C) with staggered schedule
3. Verify seeding is complete on both remote sites
4. Create two separate Leap recovery plans (one for B, one for C)
5. Test failover to B, verify recovery plan validates successfully
6. Test failover to C, verify recovery plan validates successfully

- A) 1 → 2 → 3 → 4 → 5 → 6
- B) 1 → 3 → 2 → 4 → 6 → 5
- C) 4 → 1 → 2 → 3 → 5 → 6
- D) 1 → 2 → 4 → 3 → 5 → 6

**Answer: A**
Rationale: Steps 1-2 (create PDs with different schedules to avoid congestion). Step 3 (verify replication is ready). Steps 4-6 (create and test recovery plans independently). Testing must follow seeding completion.

---

### Q79
Arrange the troubleshooting steps for a VM with CPU ready time = 15%:
1. Check Prism > Dashboard > CPU utilization per host
2. Confirm this VM's ready time is truly 15% (not measurement artifact)
3. Identify which host is CPU-constrained
4. Check CPU overcommit ratio on that host
5. vMotion this VM off the host or reduce vCPU
6. Monitor CPU ready time post-vMotion to validate improvement

- A) 1 → 2 → 3 → 4 → 5 → 6
- B) 2 → 1 → 3 → 4 → 5 → 6
- C) 1 → 3 → 2 → 4 → 5 → 6
- D) 2 → 3 → 1 → 5 → 4 → 6

**Answer: B**
Rationale: Step 2 (confirm metric is real, not a spike). Step 1 (check cluster CPU health). Step 3 (identify hot host). Step 4 (confirm overcommit is the issue). Step 5 (remediate). Step 6 (verify fix). Must confirm problem before diagnosis.

---

### Q80
Arrange the steps for implementing boot group priority in a Leap recovery plan:
1. Identify VM dependencies (DB → App → Web)
2. Create boot group 1: database VMs
3. Create boot group 2: application VMs (depends on Group 1)
4. Create boot group 3: web tier VMs (depends on Group 2)
5. Add pre-boot scripts to Group 2 to validate database connectivity
6. Add post-boot scripts to Group 3 to validate end-to-end service health
7. Test failover and verify boot sequence respects group ordering

- A) 2 → 3 → 4 → 1 → 5 → 6 → 7
- B) 1 → 2 → 3 → 4 → 5 → 6 → 7
- C) 1 → 2 → 5 → 3 → 6 → 4 → 7
- D) 2 → 1 → 3 → 4 → 6 → 5 → 7

**Answer: B**
Rationale: Step 1 (identify dependencies). Steps 2-4 (build boot groups in dependency order). Steps 5-6 (add validation scripts between groups). Step 7 (test to confirm). Linear progression from planning → configuration → validation.

---

## END OF NCM-MCI PRACTICE QUESTIONS

**Summary:**
- 60 Standard MCQ (Q1-Q60)
- 10 Select TWO (Q61-Q70)
- 10 Ordering/Sequence (Q71-Q80)
- **Total: 80 Questions**

**Topics Covered:**
✓ VM Performance & Optimization (vCPU, NUMA, CPU ready time, memory ballooning, disk I/O, network)
✓ BCDR & Disaster Recovery (async/NearSync/Sync replication, Leap, RPO/RTO, reverse replication)
✓ CVM Management & Sizing
✓ Storage & Network Metrics
✓ Protection Domains & Snapshots
✓ Self-Service Restore (NGT, VSS, SMB Previous Versions)
✓ DR Testing & Multi-Site Configurations
✓ Node-Level Analysis & Troubleshooting

**Study Tips:**
- Review each answer explanation to understand the rationale
- Focus on practical Nutanix command usage (Prism navigation, CVM diagnostics)
- Practice identifying when to use which replication method (Async vs. NearSync vs. Metro)
- Master the dependency chains (e.g., boot order in Leap, protection domain configuration order)
- For hands-on labs, test per-disk IOPS analysis, NUMA pinning, and failover scenarios
