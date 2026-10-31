# Nutanix Certified Associate (NCA) 7.5 Practice Questions - New Bank Part 2
# Original study items. Independent material, not official or endorsed by Nutanix.

## DOMAIN 3: Cluster Configuration and Maintenance (study allocation)

---

### Q61
A new cluster's alerts never reach the operations inbox even though test alerts fire. Which cluster setting should be verified first?
- A) The VM template list
- B) The rack elevation diagram
- C) The SMTP server configuration for outbound alert email
- D) The cluster's wallpaper

**Answer: C**
Alert email depends on a correct SMTP relay configuration (server, port, sender, authentication). Verifying it, and the test message, is the standard cluster commissioning step.
<!-- {"id":"NUTANIX-NCA-75-Q161","objective":"3.1","type":"diagnosis","source":"NCAEBG","locator":"Objective 3.1 SMTP configuration","verified":"2026-10-10"} -->

---

### Q62
During commissioning, name resolution for cluster services fails intermittently. Which configuration is suspect?
- A) The DNS (name server) entries for the cluster
- B) The deduplication setting
- C) The replication factor
- D) The license tier

**Answer: A**
Cluster services, Prism, and support functions depend on reliable DNS. Wrong or unreachable name servers cause exactly these intermittent resolution failures; commissioning checklists verify DNS alongside NTP.
<!-- {"id":"NUTANIX-NCA-75-Q162","objective":"3.1","type":"diagnosis","source":"NCAEBG","locator":"Objective 3.1 DNS configuration","verified":"2026-10-10"} -->

---

### Q63
Log timestamps disagree between nodes, confusing a support investigation. Which cluster configuration causes this when wrong?
- A) Category values
- B) NTP settings
- C) SNMP community names
- D) Container names

**Answer: B**
Time synchronization via NTP keeps node and cluster logs aligned; drift or missing NTP configuration makes cross-node correlation painful. Commissioning verifies NTP with DNS and SMTP.
<!-- {"id":"NUTANIX-NCA-75-Q163","objective":"3.1","type":"diagnosis","source":"NCAEBG","locator":"Objective 3.1 NTP configuration","verified":"2026-10-10"} -->

---

### Q64
A monitoring platform should receive hardware and cluster health traps from the Nutanix cluster. What must be configured on the cluster side?
- A) More VM snapshots
- B) SNMP settings pointing at the monitoring destination
- C) A second Witness
- D) A bigger vSwitch

**Answer: B**
SNMP configuration lets the cluster emit traps and answer polls for health and hardware status, integrating it with enterprise monitoring like any other infrastructure device.
<!-- {"id":"NUTANIX-NCA-75-Q164","objective":"3.1","type":"recall","source":"NCAEBG","locator":"Objective 3.1 SNMP configuration","verified":"2026-10-10"} -->

---

### Q65
A four-node RF2 cluster loses one node. What is the expected behavior?
- A) Cluster keeps running and serving data, then rebuilds redundancy on surviving nodes if capacity allows
- B) Total cluster outage
- C) All VMs power off immediately
- D) Data is erased

**Answer: A**
RF2 tolerates one failure domain: VMs keep running (HA restarts any that were on the failed node), and the fabric re-protects data using free capacity. This is the baseline fault tolerance of the design.
<!-- {"id":"NUTANIX-NCA-75-Q165","objective":"3.1","type":"diagnosis","source":"NCAEBG","locator":"Objective 3.1 fault tolerance levels","verified":"2026-10-10"} -->

---

### Q66
A compliance-driven design must survive two simultaneous node failures. Which configuration achieves this?
- A) Disabling HA
- B) Replication factor 3 (with sufficient nodes and capacity)
- C) Replication factor 1
- D) A single larger node

**Answer: B**
RF3 maintains three data copies across nodes, tolerating two concurrent failures. It demands more nodes and capacity than RF2, which is the tradeoff the design must budget for.
<!-- {"id":"NUTANIX-NCA-75-Q166","objective":"3.1","type":"recall","source":"NCAEBG","locator":"Objective 3.1 fault tolerance, RF3","verified":"2026-10-10"} -->

---

### Q67
An admin registers a new cluster with Prism Central. What does registration change operationally?
- A) All VMs are deleted
- B) Licensing becomes unnecessary
- C) The cluster becomes manageable and visible through the central multi-cluster console
- D) The cluster's RF changes automatically

**Answer: C**
Prism Central aggregates registered clusters into one management plane for monitoring, policy, and operations. Registration is the enrollment step; it changes nothing about data protection settings.
<!-- {"id":"NUTANIX-NCA-75-Q167","objective":"3.1","type":"recall","source":"NCAEBG","locator":"Objective 3.1 Prism Central settings","verified":"2026-10-10"} -->

---

### Q68
A security review of the cluster asks about options for controlling administrative access and encrypting data. Which areas should the review cover? (Choose two.)
- A) Role-based access and authentication configuration for management
- B) Data-at-rest encryption options for the storage layer
- C) The color theme of Prism
- D) The number of VM snapshots
- E) The SMTP sender name

**Correct Answer: A, B**
Cluster security options include management-plane access controls (RBAC, directory integration) and data-plane protections like encryption at rest. Cosmetic and alerting settings do not bear on the review.
<!-- {"id":"NUTANIX-NCA-75-Q168","objective":"3.1","type":"recall","source":"NCAEBG","locator":"Objective 3.1 security options","verified":"2026-10-10"} -->

---

### Q69
An admin must verify Prism Central's version and health before planning upgrades. Where is this validated?
- A) On a VM's desktop
- B) In the Witness VM's browser
- C) On the physical invoice
- D) In the Prism Central console's settings/about and health views

**Answer: D**
Prism Central exposes its own version, services, and health in its console, and compatibility with registered clusters matters when sequencing upgrades. It is a commissioning and pre-upgrade check.
<!-- {"id":"NUTANIX-NCA-75-Q169","objective":"3.1","type":"recall","source":"NCAEBG","locator":"Objective 3.1 validate Prism Central","verified":"2026-10-10"} -->

---

### Q70
A cluster's fault-tolerance dashboard shows "rebuild in progress" after a node failure, and the admin wants to know when full redundancy returns. What determines this?
- A) The number of categories
- B) The SMTP port
- C) Rebuild completion, bounded by available capacity and data volume
- D) The phase of the moon

**Answer: C**
Redundancy restores when the re-protection rebuild finishes writing replacement replicas. Its duration depends on how much data must be copied and the spare capacity and bandwidth available.
<!-- {"id":"NUTANIX-NCA-75-Q170","objective":"3.1","type":"diagnosis","source":"NCAEBG","locator":"Objective 3.1 rebuild/fault tolerance","verified":"2026-10-10"} -->

---

### Q71
A node needs its drives replaced and firmware updated without impacting running VMs. What is the first step?
- A) Delete the node from the cluster first
- B) Shut down every VM manually
- C) Place the node into maintenance mode so workloads migrate off
- D) Pull the power cables

**Answer: C**
Maintenance mode evacuates workloads and takes the node out of service gracefully, making hardware work safe. Power-pulling without it risks data availability and VM disruption.
<!-- {"id":"NUTANIX-NCA-75-Q171","objective":"3.2","type":"recall","source":"NCAEBG","locator":"Objective 3.2 maintenance mode","verified":"2026-10-10"} -->

---

### Q72
While a node is in maintenance mode, what happens to its guest VMs?
- A) They move to the Witness
- B) They are migrated or restarted on other nodes per HA, staying available
- C) They are deleted
- D) They pause forever

**Answer: B**
The platform relocates workloads from a maintenance-mode node so service continues. The node can then be serviced and returned to rotation, after which it rejoins normal operation.
<!-- {"id":"NUTANIX-NCA-75-Q172","objective":"3.2","type":"recall","source":"NCAEBG","locator":"Objective 3.2 maintenance mode guest status","verified":"2026-10-10"} -->

---

### Q73
A cluster needs more storage capacity but has plenty of compute headroom. Which expansion node type fits?
- A) A Witness VM
- B) A laptop
- C) A storage-only node
- D) A compute-only node

**Answer: C**
Storage-only nodes add capacity (and storage performance) without adding compute licensing or CPU, matching storage-bound growth. Compute-only nodes solve the opposite imbalance.
<!-- {"id":"NUTANIX-NCA-75-Q173","objective":"3.2","type":"recall","source":"NCAEBG","locator":"Objective 3.2 node expansion types","verified":"2026-10-10"} -->

---

### Q74
A virtual-desktop rollout needs more CPU and memory in the cluster but storage is fine. Which expansion choice applies?
- A) A compute-only node
- B) A storage-only node
- C) Another Witness
- D) A second Prism Central

**Answer: A**
Compute-only nodes grow processing capacity for workloads like VDI without adding storage the cluster does not need. Expansion can target whichever resource is constrained.
<!-- {"id":"NUTANIX-NCA-75-Q174","objective":"3.2","type":"recall","source":"NCAEBG","locator":"Objective 3.2 compute-only nodes","verified":"2026-10-10"} -->

---

### Q75
An admin wants to check failed drive status and locate the physical disk in the chassis. Which Prism view helps?
- A) The VM console
- B) The licensing page
- C) The network visualizer
- D) The hardware diagram view showing disks and components

**Answer: D**
The hardware view visualizes node and disk layout with health status, guiding physical replacement to the right slot. Data-drive failure and replacement procedures build on it.
<!-- {"id":"NUTANIX-NCA-75-Q175","objective":"3.2","type":"recall","source":"NCAEBG","locator":"Objective 3.2 hardware diagram view","verified":"2026-10-10"} -->

---

### Q76
A data-center technician must service a node's power supply without logging into the cluster from a laptop in the hot aisle. Which capability provides lights-out access?
- A) Out-of-band management (BMC/IPMI-class interface) on the node
- B) The guest VM console
- C) The SMB share
- D) The Witness service

**Answer: A**
OOB management interfaces give remote console, power control, and hardware health independent of the cluster software, essential for physical and low-level work. Configuring its credentials securely is part of commissioning.
<!-- {"id":"NUTANIX-NCA-75-Q176","objective":"3.2","type":"recall","source":"NCAEBG","locator":"Objective 3.2 OOB management","verified":"2026-10-10"} -->

---

### Q77
A failed data drive must be replaced on a running cluster. What is the safe sequence?
- A) Use the documented disk removal procedure (verify data is protected elsewhere, remove the disk logically, then physically replace)
- B) Yank the drive during business hours with no checks
- C) Format the whole node
- D) Power off the cluster first always

**Answer: A**
Disk replacement follows procedure: confirm redundancy tolerates the removal, detach the disk through the management interface, replace physically, and let the cluster absorb the new drive. Shortcuts risk data loss.
<!-- {"id":"NUTANIX-NCA-75-Q177","objective":"3.2","type":"diagnosis","source":"NCAEBG","locator":"Objective 3.2 disk replacement","verified":"2026-10-10"} -->

---

### Q78
Before expanding a cluster from four to six nodes, what must be verified?
- A) Nothing; racking is enough
- B) That all VMs are off
- C) Expansion prerequisites: compatibility, network readiness, imaging, and licensing/capacity
- D) That the nodes share a birthday

**Answer: C**
Cluster expansion has documented prerequisites: hardware/software compatibility, network configuration, Foundation imaging of new nodes, and license capacity. Checking them first avoids failed expansions mid-window.
<!-- {"id":"NUTANIX-NCA-75-Q178","objective":"3.2","type":"diagnosis","source":"NCAEBG","locator":"Objective 3.2 expansion prerequisites","verified":"2026-10-10"} -->

---

### Q79
A decommissioned node must be re-imaged to a newer AOS before joining a different cluster. Which tool performs bare-metal imaging?
- A) Pulse
- B) NGT
- C) X-Ray
- D) Foundation

**Answer: D**
Foundation images bare-metal nodes with the target AOS/hypervisor versions, preparing them for cluster creation or expansion. The other tools serve telemetry, guest integration, and testing roles.
<!-- {"id":"NUTANIX-NCA-75-Q179","objective":"3.2","type":"recall","source":"NCAEBG","locator":"Objective 3.2 bare-metal imaging","verified":"2026-10-10"} -->

---

### Q80
Facilities wants per-node power consumption visible for capacity planning. What supports this?
- A) The snapshot schedule
- B) Power monitoring via the nodes' management interfaces/OOB telemetry
- C) The VM category page
- D) The SMTP settings

**Answer: B**
Node power telemetry comes from the hardware management layer (OOB/BMC), which can feed monitoring for power and cooling planning. It is hardware telemetry, not a cluster software setting.
<!-- {"id":"NUTANIX-NCA-75-Q180","objective":"3.2","type":"recall","source":"NCAEBG","locator":"Objective 3.2 power monitoring","verified":"2026-10-10"} -->

---

### Q81
An admin must bring the cluster's firmware and software up to date. What is the first LCM step?
- A) Click update blindly on everything
- B) Reboot all nodes at once
- C) Delete old logs
- D) Perform an LCM inventory to discover current versions and available updates

**Answer: D**
LCM starts with inventory: it detects installed component versions and applicable updates, then plans the rolling sequence. Skipping inventory means guessing at versions and compatibility.
<!-- {"id":"NUTANIX-NCA-75-Q181","objective":"3.3","type":"recall","source":"NCAEBG","locator":"Objective 3.3 LCM inventory","verified":"2026-10-10"} -->

---

### Q82
LCM pre-checks fail before an upgrade, citing insufficient cluster resources. Why do pre-checks exist?
- A) They sell licenses
- B) They test the internet speed
- C) They validate that an upgrade can proceed safely (health, capacity, compatibility) before anything changes
- D) They slow down admins for fun

**Answer: C**
Pre-checks are the safety gate: they catch conditions (unhealthy cluster, low space, unsupported paths) that would turn an upgrade into an outage. Passing them is a prerequisite, not a formality.
<!-- {"id":"NUTANIX-NCA-75-Q182","objective":"3.3","type":"diagnosis","source":"NCAEBG","locator":"Objective 3.3 LCM pre-checks","verified":"2026-10-10"} -->

---

### Q83
A disconnected military site must update cluster software. Which method applies?
- A) Never update
- B) Update via consumer USB recovery
- C) Dark site: download the LCM bundle on a connected machine and apply it offline in the documented order
- D) Connect the site to the public internet temporarily with no controls

**Answer: C**
Dark-site updates transfer bundles to the isolated environment and follow the recommended offline upgrade order. It keeps air-gapped systems patch-current without breaking isolation.
<!-- {"id":"NUTANIX-NCA-75-Q183","objective":"3.3","type":"recall","source":"NCAEBG","locator":"Objective 3.3 dark site updates","verified":"2026-10-10"} -->

---

### Q84
An upgrade plan lists AOS, hypervisor, firmware, and Prism Central. What determines a safe sequence?
- A) The software compatibility matrix and documented upgrade order
- B) Alphabetical order
- C) Whatever finishes fastest
- D) Random selection

**Answer: A**
Component versions must remain mutually supported, so the compatibility matrix and recommended order (Prism Central before clusters, and so on) define the safe path. Deviating risks unsupported mixed states.
<!-- {"id":"NUTANIX-NCA-75-Q184","objective":"3.3","type":"recall","source":"NCAEBG","locator":"Objective 3.3 compatibility matrix","verified":"2026-10-10"} -->

---

### Q85
VMs keep running during a rolling AOS upgrade. How?
- A) Upgrades only happen in emergencies
- B) Nodes upgrade one at a time while workloads migrate between them
- C) The cluster pauses time
- D) VMs are powered off silently

**Answer: B**
Rolling upgrades service one node at a time, live-migrating workloads off and back, so the cluster stays available throughout. This is the design point of the one-click upgrade experience.
<!-- {"id":"NUTANIX-NCA-75-Q185","objective":"3.3","type":"recall","source":"NCAEBG","locator":"Objective 3.3 rolling upgrades","verified":"2026-10-10"} -->

---

### Q86
Guest tools are outdated on 300 VMs. What is the efficient maintenance path?
- A) Bulk NGT upgrade across the VMs from the management interface
- B) Logging into 300 consoles manually
- C) Rebuilding the VMs
- D) Ignoring NGT versions forever

**Answer: A**
NGT supports bulk upgrade operations across many VMs, turning an afternoon of manual work into a managed task. Current NGT keeps guest-aware features (snapshots, SSR, IP reporting) working correctly.
<!-- {"id":"NUTANIX-NCA-75-Q186","objective":"3.3","type":"recall","source":"NCAEBG","locator":"Objective 3.3 NGT bulk upgrade","verified":"2026-10-10"} -->

---

### Q87
A newly imaged node fails to join the cluster, citing a version mismatch. What should the admin check?
- A) The node's hostname font
- B) The rack's serial number
- C) The SMTP banner
- D) That the node's AOS version meets the cluster's compatibility requirements, re-imaging with Foundation if needed

**Answer: D**
Joining nodes must run compatible software versions; mismatches block expansion by design. Foundation re-images the node to the matching version, after which the join proceeds.
<!-- {"id":"NUTANIX-NCA-75-Q187","objective":"3.3","type":"diagnosis","source":"NCAEBG","locator":"Objective 3.3 version compatibility","verified":"2026-10-10"} -->

---

### Q88
Prism Central must be upgraded before the clusters it manages. Why?
- A) It is alphabetical
- B) It uses less power
- C) No reason; order never matters
- D) The documented upgrade order keeps the management plane compatible with everything it manages

**Answer: D**
The management layer is upgraded first so it can manage both old and new cluster versions during the rollout. Reversing the order can leave Prism Central unable to manage upgraded clusters.
<!-- {"id":"NUTANIX-NCA-75-Q188","objective":"3.3","type":"recall","source":"NCAEBG","locator":"Objective 3.3 upgrade order","verified":"2026-10-10"} -->

---

### Q89
Routine software maintenance windows keep getting skipped because updates look risky. What practice makes them routine?
- A) Disabling all updates permanently
- B) One-click/LCM-driven updates with pre-checks, scheduled regularly and validated by the platform
- C) Waiting for an outage to force the issue
- D) Updating only leap years

**Answer: B**
The platform's automated, pre-checked, rolling update path exists to make maintenance low-risk and habitual. Deferring updates accumulates security and stability debt until it forces a crisis.
<!-- {"id":"NUTANIX-NCA-75-Q189","objective":"3.3","type":"diagnosis","source":"NCAEBG","locator":"Objective 3.3 maintenance practices","verified":"2026-10-10"} -->

---

### Q90
An AHV upgrade shows as available in LCM alongside AOS. What should the admin confirm first?
- A) The supported combination/order of AOS and hypervisor versions for that cluster
- B) The number of VMs with odd names
- C) The Witness's lunch schedule
- D) The default gateway's MAC

**Answer: A**
Hypervisor and AOS versions are validated as pairs; LCM and the compatibility matrix show the supported combinations and sequence. Confirming before starting keeps every intermediate state supported.
<!-- {"id":"NUTANIX-NCA-75-Q190","objective":"3.3","type":"recall","source":"NCAEBG","locator":"Objective 3.3 AHV upgrade specs","verified":"2026-10-10"} -->

---

## DOMAIN 4: Platform Health and Monitoring (study allocation)

---

### Q91
Support asks for logs from a cluster after an incident. What is the standard collection route?
- A) Copying /var/log from random VMs
- B) Asking users what they saw
- C) Log collection through Prism (or Logbay via command line) bundling the relevant node/cluster logs
- D) Screenshots of the console

**Answer: C**
The platform provides structured log collection that bundles the right component logs for support analysis, via the console or Logbay tooling. Ad-hoc grabs miss the components that matter.
<!-- {"id":"NUTANIX-NCA-75-Q191","objective":"4.1","type":"recall","source":"NCAEBG","locator":"Objective 4.1 log collection","verified":"2026-10-10"} -->

---

### Q92
An admin runs NCC against the cluster weekly. What is NCC?
- A) Nutanix Cluster Check: a battery of health checks validating configuration and state against best practices
- B) A benchmarking game
- C) A licensing audit
- D) A cable tester

**Answer: A**
NCC runs automated checks across cluster components and reports pass/fail with guidance, catching misconfigurations and emerging issues before they become outages. Frequency is configurable.
<!-- {"id":"NUTANIX-NCA-75-Q192","objective":"4.1","type":"recall","source":"NCAEBG","locator":"Objective 4.1 NCC","verified":"2026-10-10"} -->

---

### Q93
An NCC run flags a failed check for time drift on one node. What is the appropriate response?
- A) Delete the check
- B) Ignore single-node failures always
- C) Reboot the cluster
- D) Investigate and remediate the node's NTP configuration, then re-run the check

**Answer: D**
NCC failures are actionable findings: fix the underlying condition (here, NTP drift), then verify with a re-run. Suppressing checks without remediation defeats the purpose of health monitoring.
<!-- {"id":"NUTANIX-NCA-75-Q193","objective":"4.1","type":"diagnosis","source":"NCAEBG","locator":"Objective 4.1 NCC remediation","verified":"2026-10-10"} -->

---

### Q94
Where does an admin determine overall cluster status at a glance, including whether redundancy is currently degraded?
- A) The Prism dashboard/cluster health view
- B) The VM template list
- C) The license page
- D) The SMTP log

**Answer: A**
The Prism dashboard aggregates cluster health, capacity, and resilience state, showing immediately if the cluster is running degraded (for example, during a rebuild). It is the first stop of any health review.
<!-- {"id":"NUTANIX-NCA-75-Q194","objective":"4.1","type":"recall","source":"NCAEBG","locator":"Objective 4.1 cluster status","verified":"2026-10-10"} -->

---

### Q95
An analyst builds a chart tracking one VM's CPU over time, then another chart aggregating IOPS across all VMs on a container. What distinguishes these two chart types?
- A) They are identical
- B) One is only for licenses
- C) Charts cannot show storage
- D) Entity charts track a single entity's metrics; metric charts can aggregate/compute metrics across entities

**Answer: D**
Entity charts focus on one object (a VM, host, disk); metric charts work across metrics and entities for comparisons and aggregates. Choosing the right one is part of the health-check workflow on the exam.
<!-- {"id":"NUTANIX-NCA-75-Q195","objective":"4.1","type":"recall","source":"NCAEBG","locator":"Objective 4.1 metric vs entity charts","verified":"2026-10-10"} -->

---

### Q96
A weekly health routine reviews cluster status, NCC results, capacity trends, and open alerts. What is the value of doing this on a schedule?
- A) It replaces backups
- B) It speeds up CPUs
- C) Drift and emerging faults are caught early, while they are still cheap to fix
- D) It fills calendars

**Answer: C**
Routine health checks turn monitoring from reactive to preventive: trends (capacity, rebuilds, recurring alerts) get addressed before users notice. The platform's tooling is built to make the routine quick.
<!-- {"id":"NUTANIX-NCA-75-Q196","objective":"4.1","type":"diagnosis","source":"NCAEBG","locator":"Objective 4.1 health check routine","verified":"2026-10-10"} -->

---

### Q97
The health dashboard shows degraded resilience while a rebuild runs after a disk replacement. What does the admin conclude?
- A) All data is lost
- B) The cluster must be shut down
- C) Licensing expired
- D) The cluster is serving data but has reduced failure tolerance until the rebuild completes

**Answer: D**
Degraded states are informational: service continues with less redundancy while the system re-protects data. The correct response is monitoring rebuild progress and capacity, not panic.
<!-- {"id":"NUTANIX-NCA-75-Q197","objective":"4.1","type":"diagnosis","source":"NCAEBG","locator":"Objective 4.1 degraded states","verified":"2026-10-10"} -->

---

### Q98
An operations team wants health-check data forwarded to its central syslog for long-term retention. Is this supported?
- A) Only through social media
- B) Yes; logs can be sent to a remote syslog server
- C) No; logs never leave the cluster
- D) Only via fax

**Answer: B**
Remote syslog integration ships cluster logs to centralized collectors, aligning the platform with enterprise log retention and correlation practices.
<!-- {"id":"NUTANIX-NCA-75-Q198","objective":"4.2","type":"recall","source":"NCAEBG","locator":"Objective 4.2 remote syslog","verified":"2026-10-10"} -->

---

### Q99
Pulse is enabled on a cluster. What does Pulse do?
- A) Replaces all monitoring
- B) Blocks SNMP
- C) Sends health telemetry to Nutanix, enabling proactive support and faster diagnosis
- D) Mines cryptocurrency

**Answer: C**
Pulse streams diagnostic telemetry to Nutanix so support can detect issues and engage proactively, often before the customer notices. It complements, rather than replaces, local monitoring.
<!-- {"id":"NUTANIX-NCA-75-Q199","objective":"4.2","type":"recall","source":"NCAEBG","locator":"Objective 4.2 Pulse","verified":"2026-10-10"} -->

---

### Q100
An admin wants an alert only when a specific VM's memory ballooning exceeds a threshold for ten minutes, not for every alert type. What should be created?
- A) A new cluster
- B) A DNS entry
- C) A custom alert policy with that entity, metric, threshold, and duration
- D) A global page for every event

**Answer: C**
Custom alert policies target specific entities, metrics, thresholds, and durations, cutting noise by paging only for conditions the team actually acts on. Default policies cover the common cases.
<!-- {"id":"NUTANIX-NCA-75-Q200","objective":"4.2","type":"recall","source":"NCAEBG","locator":"Objective 4.2 custom alert policies","verified":"2026-10-10"} -->

---

### Q101
The alert console mixes critical, warning, and informational entries. How should on-call response differ?
- A) Severity drives triage: critical alerts page immediately, warnings queue for business hours, informational feeds reports
- B) Everything pages everyone always
- C) Severity is decorative
- D) Only informational alerts matter

**Answer: A**
Alert severity exists to route attention: impact and urgency determine response. Treating all alerts equally produces fatigue and missed criticals, the failure mode severity tiers prevent.
<!-- {"id":"NUTANIX-NCA-75-Q201","objective":"4.2","type":"diagnosis","source":"NCAEBG","locator":"Objective 4.2 alert severity","verified":"2026-10-10"} -->

---

### Q102
An alert reports high CPU ready time on a production VM. What does this metric indicate, and what is a first resolution step?
- A) The network cable is loose; reseat it
- B) The VM needs a new name
- C) The VM waits for physical CPU access (contention); check host load and the VM's sizing/oversubscription
- D) The disk is full; add storage

**Answer: C**
CPU ready measures how long a VM that wants to run waits for physical CPU: a contention signal. Resolutions include rightsizing the VM, reducing host oversubscription, or migrating workloads.
<!-- {"id":"NUTANIX-NCA-75-Q202","objective":"4.2","type":"diagnosis","source":"NCAEBG","locator":"Objective 4.2 CPU ready","verified":"2026-10-10"} -->

---

### Q103
A disk-failure alert fires and automatically attaches recent logs to the support case. Which capability is this?
- A) Manual screenshots
- B) Pulse being disabled
- C) SNMP being deleted
- D) Alert-triggered log collection

**Answer: D**
The platform can gather relevant logs automatically when specific alerts fire, so a support case starts with diagnostics attached. It shortens time-to-resolution by removing the data-collection round trip.
<!-- {"id":"NUTANIX-NCA-75-Q203","objective":"4.2","type":"recall","source":"NCAEBG","locator":"Objective 4.2 alert-triggered log collection","verified":"2026-10-10"} -->

---

### Q104
An alert storm follows every monthly patch window, burying real issues. What is the right operational fix?
- A) Maintenance-aware alert handling (schedules/suppression windows) plus policy tuning, not disabling alerting
- B) Turning off all alerts permanently
- C) Paging more people
- D) Deleting Prism

**Answer: A**
Expected-change windows should silence expected noise through scheduling or suppression while keeping protection for the unexpected. Permanent deafness to alerts trades calm for blindness.
<!-- {"id":"NUTANIX-NCA-75-Q204","objective":"4.2","type":"diagnosis","source":"NCAEBG","locator":"Objective 4.2 alert noise management","verified":"2026-10-10"} -->

---

### Q105
Given an alert "storage container 85% full," what does a good resolution plan look like?
- A) Assess growth rate and reclaim/expand capacity or enable efficiency features, then set a threshold alert below critical
- B) Delete random VMs
- C) Wait for 100%
- D) Reboot the container

**Answer: A**
Impact assessment (what fills, how fast) drives the fix: cleanup, efficiency features, expansion, or workload moves, plus earlier-warning thresholds. Capacity alerts are planning signals, not just emergencies.
<!-- {"id":"NUTANIX-NCA-75-Q205","objective":"4.2","type":"diagnosis","source":"NCAEBG","locator":"Objective 4.2 alert impact and resolution","verified":"2026-10-10"} -->

---

### Q106
A manager wants a monthly health summary for leadership without building it manually each time. What feature helps?
- A) Verbal updates
- B) The printer's log
- C) Custom report configurations scheduled from Prism
- D) Screenshots pasted into slides monthly

**Answer: C**
Scheduled custom reports assemble chosen metrics and health data automatically, turning repetitive status packaging into a set-once deliverable.
<!-- {"id":"NUTANIX-NCA-75-Q206","objective":"4.2","type":"recall","source":"NCAEBG","locator":"Objective 4.2 custom reports","verified":"2026-10-10"} -->

---

### Q107
An admin opens a support case for a recurring cluster alert. What information makes the case productive from the first touch?
- A) Only "it is broken"
- B) A photo of the rack
- C) The admin's resume
- D) Cluster details, recent logs (log collection), alert IDs, timeline, and business impact

**Answer: D**
Support cases move fastest with complete context: what happened, when, which entities, and the diagnostic bundle. Priority definitions and response times then apply to a well-formed case.
<!-- {"id":"NUTANIX-NCA-75-Q207","objective":"4.3","type":"recall","source":"NCAEBG","locator":"Objective 4.3 support case documentation","verified":"2026-10-10"} -->

---

### Q108
How are support case priorities generally determined?
- A) By impact and urgency (production down versus minor question), mapping to defined response times
- B) By who yells loudest
- C) Alphabetically
- D) Randomly

**Answer: A**
Support priority definitions tie severity (system down, degraded, minor, question) to response targets. Setting the right priority, with evidence, gets the right response clock started.
<!-- {"id":"NUTANIX-NCA-75-Q208","objective":"4.3","type":"recall","source":"NCAEBG","locator":"Objective 4.3 support priorities","verified":"2026-10-10"} -->

---

### Q109
A cluster with Pulse enabled shows a proactive notification that a disk is predicted to fail, before any failure occurs. Which capability produced this?
- A) A manual inspection
- B) Insights/predictive health analyzing telemetry for failure patterns
- C) Fortune telling
- D) The DNS cache

**Answer: B**
Insights applies analytics to fleet telemetry, surfacing predictive failures and recommended actions ahead of impact: the automation layer on top of Pulse's data pipeline.
<!-- {"id":"NUTANIX-NCA-75-Q209","objective":"4.3","type":"recall","source":"NCAEBG","locator":"Objective 4.3 Insights predictive health","verified":"2026-10-10"} -->

---

### Q110
A predictive alert recommends a firmware update to avoid a known issue. What is the sensible handling?
- A) Disable Pulse
- B) Review the recommendation, then schedule the update through normal change/LCM processes
- C) Ignore predictions by policy
- D) Apply it mid-peak without review

**Answer: B**
Predictive recommendations feed the same change discipline as any maintenance: review, schedule, pre-check, execute. Their value is foresight, not exemption from process.
<!-- {"id":"NUTANIX-NCA-75-Q210","objective":"4.3","type":"diagnosis","source":"NCAEBG","locator":"Objective 4.3 acting on Insights","verified":"2026-10-10"} -->

---

### Q111
An admin cannot open a support case because Pulse and portal access were never set up after install. What does this illustrate?
- A) Portals configure themselves retroactively
- B) Support functions (portal accounts, Pulse, contact details) belong in commissioning, before they are needed
- C) Cases open themselves
- D) Support is optional for everyone

**Answer: B**
The time to wire support access is deployment day: portal accounts, Pulse enablement, and alert routing verified while everything is healthy. Incident time is the wrong moment to discover the gap.
<!-- {"id":"NUTANIX-NCA-75-Q211","objective":"4.3","type":"diagnosis","source":"NCAEBG","locator":"Objective 4.3 support readiness","verified":"2026-10-10"} -->

---

### Q112
A VM owner reports sluggish performance. Which two metrics first distinguish CPU contention from storage latency? (Choose two.)
- A) CPU ready time
- B) Storage I/O latency for the VM's disks
- C) The VM's icon
- D) The cluster's license tier
- E) The number of categories

**Correct Answer: A, B**
CPU ready exposes compute contention; disk latency exposes storage-path delay. Together they split the two most common performance causes before any changes are made.
<!-- {"id":"NUTANIX-NCA-75-Q212","objective":"4.4","type":"diagnosis","source":"NCAEBG","locator":"Objective 4.4 CPU ready vs I/O latency","verified":"2026-10-10"} -->

---

### Q113
A host's VMs all feel slow, and every VM shows elevated CPU ready. What does the pattern indicate?
- A) A DNS outage
- B) Host-level CPU oversubscription/contention; reduce load, add capacity, or rebalance VMs
- C) One bad vNIC
- D) A licensing fault

**Answer: B**
When all VMs on a host wait for CPU, the host is oversubscribed. Remedies are load reduction, rebalancing across the cluster, or more compute, rather than per-VM tweaks.
<!-- {"id":"NUTANIX-NCA-75-Q213","objective":"4.4","type":"diagnosis","source":"NCAEBG","locator":"Objective 4.4 CPU contention","verified":"2026-10-10"} -->

---

### Q114
A database VM's charts show high memory utilization with swapping/ballooning. What is the constraint and the fix?
- A) Too many snapshots: delete them all
- B) A bad VLAN: recreate it
- C) Too few categories: add more
- D) Memory pressure: rightsize the VM's memory or reduce host memory overcommit

**Answer: D**
Memory constraints show as high utilization, ballooning, or swapping inside and around the guest. The fix is memory: allocate more to the VM or relieve host-level overcommit.
<!-- {"id":"NUTANIX-NCA-75-Q214","objective":"4.4","type":"diagnosis","source":"NCAEBG","locator":"Objective 4.4 memory constraints","verified":"2026-10-10"} -->

---

### Q115
An application team's latency complaints trace to storage: VM disk latency spikes during a nightly batch job on the same container. What are two valid mitigations? (Choose two.)
- A) Move the batch workload or its data to a different container/time window
- B) Review workload placement and I/O patterns to reduce contention on shared storage
- C) Rename the container
- D) Disable all monitoring during the job
- E) Lower the license tier

**Correct Answer: A, B**
Shared-storage contention resolves by separating or rescheduling the competing workloads and by placement decisions informed by the observed I/O patterns. Cosmetics and blindness change nothing.
<!-- {"id":"NUTANIX-NCA-75-Q215","objective":"4.4","type":"diagnosis","source":"NCAEBG","locator":"Objective 4.4 I/O latency contention","verified":"2026-10-10"} -->

---

### Q116
A performance review shows one VM consuming most of a host's IOPS, starving neighbors. What is the first interpretation step?
- A) Identify whether the VM's demand is legitimate (workload) or runaway (loop/misconfig), using its metric history
- B) Delete the VM immediately
- C) Blame the newest employee
- D) Reboot the host hourly

**Answer: A**
"Noisy neighbor" analysis starts with intent: legitimate heavy workloads get placement/sizing answers; runaway processes get fixed. Metric history distinguishes the two before any disruptive action.
<!-- {"id":"NUTANIX-NCA-75-Q216","objective":"4.4","type":"diagnosis","source":"NCAEBG","locator":"Objective 4.4 workload interpretation","verified":"2026-10-10"} -->

---

### Q117
An analyst compares last month's and this month's latency charts for the same VM and sees a slow upward drift. What is the value of this comparison?
- A) None; only live data matters
- B) It fixes the latency automatically
- C) It licenses the cluster
- D) Trend analysis catches gradual degradation (growth, wear, creeping contention) before it breaches thresholds

**Answer: D**
Threshold alerts catch events; trends catch trajectories. Comparing periods reveals slow-burn capacity and performance problems while there is still time to plan the fix.
<!-- {"id":"NUTANIX-NCA-75-Q217","objective":"4.4","type":"diagnosis","source":"NCAEBG","locator":"Objective 4.4 performance trending","verified":"2026-10-10"} -->

---

### Q118
A VM was recently moved and now shows higher disk latency than peers on its new host. What should be checked?
- A) The VM's font settings
- B) The cluster's SNMP community
- C) The Witness's IP
- D) Data locality and whether its data has finished relocating/destaging to follow the VM

**Answer: D**
After moves, data may temporarily sit remote from the compute, adding latency until locality re-establishes. Checking placement and letting locality settle explains transient post-move latency.
<!-- {"id":"NUTANIX-NCA-75-Q218","objective":"4.4","type":"diagnosis","source":"NCAEBG","locator":"Objective 4.4 data locality","verified":"2026-10-10"} -->

---

### Q119
A dashboard shows VM CPU usage high inside the guest but the host shows the VM's vCPUs mostly idle. What is a likely explanation?
- A) The VM is on fire
- B) The guest's view includes its own scheduler behavior; compare both views to find limits like vCPU count versus demand
- C) The host is lying
- D) Metrics are impossible

**Answer: B**
Guest-internal and host-level CPU metrics answer different questions. Reconciling them is part of performance interpretation: an undersized vCPU allocation shows busy guest, quiet host.
<!-- {"id":"NUTANIX-NCA-75-Q219","objective":"4.4","type":"diagnosis","source":"NCAEBG","locator":"Objective 4.4 metric interpretation","verified":"2026-10-10"} -->

---

### Q120
Before a big payroll run, ops reviews CPU ready, memory, and I/O latency baselines for the payroll VM and its host. Why?
- A) It replaces the run itself
- B) Knowing normal values lets them spot and prove abnormal behavior quickly during the critical window
- C) It is superstition
- D) Baselines slow the run

**Answer: B**
Baselines turn "is this slow?" into a measurable question during high-stakes windows. Any deviation then stands out against recorded normal behavior, shortening diagnosis when minutes matter.
<!-- {"id":"NUTANIX-NCA-75-Q220","objective":"4.4","type":"diagnosis","source":"NCAEBG","locator":"Objective 4.4 performance baselines","verified":"2026-10-10"} -->

---
