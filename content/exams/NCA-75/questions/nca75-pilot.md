# NCA 7.5 — Beginner pilot (40 items)

Authored against the June 15, 2026 NCA guide: four sections, 14 objectives, ten
items per section. These are new original items written for this pilot; the
legacy bank items stay in their own files, in review. Pilot scope — see the
coverage labelling in the study view.

## Domain 1: Recognize Nutanix Solutions and Tools

---

### Q1
Which statement best describes what "hyperconverged" means for a Nutanix cluster?
- A) The same physical nodes provide compute, storage, and the software that coordinates them
- B) Storage is kept on a dedicated array and shared with the servers over the network
- C) All virtual machines run on a single large host that the others merely back up
- D) Compute and storage are separated so each can be scaled independently

**Answer: A**
Hyperconverged means the same nodes contribute CPU and memory for workloads, local disks to a shared storage pool, and the software that ties the cluster together. Option B describes the traditional three-tier arrangement with a separate array, and option D describes the separation hyperconvergence removes rather than what it does.

---

### Q2
In a Nutanix cluster, what is the role of AOS?
- A) It is the management interface used to view health and run tasks
- B) It is the hypervisor that runs the virtual machines
- C) It is the distributed software layer that pools storage across the nodes
- D) It is the tool that images a new node before it joins the cluster

**Answer: C**
AOS is the Acropolis Operating System: the distributed layer that turns a group of servers into one storage system, deciding where data lives and keeping copies for protection. The management interface is Prism, the hypervisor is AHV, and imaging a new node is Foundation's job.

---

### Q3
A 40-person accounting firm has two ageing servers and a nearly full storage array, and no dedicated IT staff. Which part of the Nutanix story is the strongest fit for them?
- A) Raw performance per node
- B) Elastic provisioning for a development team
- C) Fewer things to operate, grown by adding a node
- D) Per-site resilience across many branch offices

**Answer: C**
The firm's problem is operational: too many separate things to run and no one to run them. The fit is simplicity — one cluster, one management interface, growth by adding a node. Raw performance is not their constraint, elastic provisioning is a software-team need, and per-site resilience describes a multi-branch scenario.

---

### Q4
Which Nutanix component is the hypervisor?
- A) AOS
- B) Prism Central
- C) AHV
- D) Life Cycle Manager

**Answer: C**
AHV (Acropolis Hypervisor) is the layer that runs virtual machines. AOS is the distributed storage software, Prism Central is a management interface spanning clusters, and Life Cycle Manager updates software and firmware.

---

### Q5
A team needs a shared folder that several servers mount at once over SMB. Which storage shape is that?
- A) Block storage
- B) Object storage
- C) File storage
- D) Erasure-coded storage

**Answer: C**
File storage presents shared folders that many machines mount simultaneously over SMB or NFS. Block storage presents a raw volume to one machine as a disk, object storage addresses items by key over an S3-compatible interface, and erasure coding is a data-protection technique rather than a storage shape.

---

### Q6
Which interface is characteristic of object storage?
- A) SMB
- B) iSCSI
- C) NFS
- D) S3-compatible

**Answer: D**
Object storage addresses data by key over an S3-compatible interface, which suits large numbers of unstructured items. SMB and NFS are file-sharing protocols, and iSCSI presents block storage as a disk.

---

### Q7
Testers need a fresh copy of the production database every Friday. Which product family addresses that recurring chore?
- A) Cloud management
- B) End-user computing
- C) Container orchestration
- D) Database lifecycle management

**Answer: D**
The chore is repeatedly cloning and refreshing a database, which is exactly what a database lifecycle product automates — provisioning, cloning, patching, and teardown. Cloud management covers cost and policy, end-user computing delivers desktops, and container orchestration schedules containers.

---

### Q8
An administrator is leaving a different hypervisor and wants the existing virtual machines running on Nutanix. Which tool is intended for this?
- A) Foundation
- B) Collector
- C) Move
- D) X-Ray

**Answer: C**
Move handles migration onto a Nutanix cluster from another platform, including from a different hypervisor, and can keep the source running until cutover. Foundation images bare nodes, Collector gathers inventory, and X-Ray tests a planned configuration.

---

### Q9
A user needs to restore last Tuesday's version of a single spreadsheet without opening a ticket. Which capability is that?
- A) Self-Service Restore
- B) Life Cycle Manager
- C) Witness
- D) Foundation

**Answer: A**
Self-Service Restore lets a user restore individual files from an existing snapshot from inside the guest, and it depends on Nutanix Guest Tools being installed. The other options cover updates, arbitration, and imaging respectively.

---

### Q10
A two-node cluster at a single site must survive the loss of either node. Which component supplies the deciding vote when the nodes cannot agree?
- A) Witness
- B) Prism Central
- C) Collector
- D) AOS

**Answer: A**
Two nodes have no majority, so an outside party must break the tie; that is Witness, typically run at a third location. Prism Central is a management interface, Collector gathers inventory, and AOS is the storage software.

## Domain 2: Describe Nutanix Platform Administration

---

### Q11
Why would you use a virtual machine's console rather than a remote session?
- A) Because the console is faster than a remote session
- B) Because the console is the only way to change memory settings
- C) Because the console encrypts the session
- D) Because the console works when the guest's networking does not

**Answer: D**
The console delivers the machine's screen and keyboard over the network independently of the guest's own networking, so it still works during installation, after a network misconfiguration, or when the guest is too unwell to accept a remote session. It is not faster, and it is not how memory is changed.

---

### Q12
An administrator takes a snapshot of a virtual machine before a risky change. What does that snapshot protect against?
- A) The loss of the entire cluster
- B) A disk failure on another node
- C) The loss of the cluster's other data
- D) A mistake made during the change, for as long as the snapshot is kept

**Answer: D**
A snapshot records the machine's disk state on the same cluster, so it protects against a mistake and is intended for short-term use. It is not a backup: because the machine and its snapshots live on the same cluster, a cluster-wide loss takes the snapshots with it, and disk-level protection is provided by replication rather than snapshots.

---

### Q13
What does live migration of a virtual machine require?
- A) That the machine be powered off first
- B) That the cluster be at RF3
- C) That both the source and destination nodes can reach the machine's storage
- D) That the guest operating system have Nutanix Guest Tools installed

**Answer: C**
Live migration copies the running machine's memory to another node and switches over at the end, which requires both nodes to reach the same storage — which is why shared storage underpins it. The machine stays powered on, RF3 is unrelated, and guest tools are needed for consistent snapshots rather than migration.

---

### Q14
What is the purpose of a VLAN?
- A) To encrypt traffic between virtual machines
- B) To assign IP addresses automatically
- C) To increase the bandwidth of a network link
- D) To carry several logically separate networks over one physical network

**Answer: D**
A VLAN uses an identifier so that switches keep the traffic of one logical network apart from another on the same physical infrastructure. Encryption is not its job, address assignment is DHCP's, and it does not change link bandwidth.

---

### Q15
A virtual machine is running, the cluster reports no faults, and nobody can reach the machine on the network. The administrator recently created its virtual network. What is the most likely cause?
- A) The machine needs more memory
- B) The cluster is at RF2 rather than RF3
- C) Nutanix Guest Tools are not installed
- D) The virtual network was given the wrong VLAN identifier

**Answer: D**
A machine attached to the wrong VLAN is up and running but sits on the wrong segment, so it is unreachable by the people who expect to reach it — the classic symptom of a VLAN mismatch. Memory, replication factor, and guest tools would not produce a machine that is healthy on the cluster and unreachable on the network.

---

### Q16
What is the practical difference between a managed and an unmanaged virtual network?
- A) Managed networks are faster than unmanaged ones
- B) Unmanaged networks cannot carry VLAN tags
- C) Managed networks cannot be used by virtual machines
- D) A managed network is defined on the cluster; an unmanaged one is defined on the physical network and repeated on the cluster

**Answer: D**
For a managed network the cluster is the source of truth, so you change it on the cluster. For an unmanaged network the physical infrastructure is the source of truth and the cluster only repeats what it was told, so fixing it on the cluster accomplishes nothing. The distinction is about where the definition lives, not about speed or capability.

---

### Q17
What does a replication factor of 2 mean?
- A) Two copies of the data, kept on two different nodes
- B) Two nodes in the cluster
- C) Two virtual machines sharing a disk
- D) Data compressed to half its size

**Answer: A**
Replication factor is how many copies of the data the cluster keeps, placed on different nodes so that losing one node does not lose the data. It says nothing about node count, disk sharing, or compression.

---

### Q18
A cluster has 12 TB of raw disk capacity and is running at RF2. Roughly how much of that can hold virtual machine data, before other overheads?
- A) 12 TB
- B) 9 TB
- C) 6 TB
- D) 4 TB

**Answer: C**
RF2 keeps two copies of every piece of data, so roughly half the raw capacity is consumed by protection alone — about 6 TB before cluster software, reserved headroom, and other overheads are accounted for. Expecting 12 TB ignores replication, and 4 TB would correspond to RF3.

---

### Q19
A cluster was expanded from four nodes to six last quarter. This week several management features stopped working. What is the most useful first thing to check?
- A) Whether the two new nodes are covered by the licence, and whether the current tier includes those features
- B) Whether the new nodes have failed
- C) Whether the virtual machines need more memory
- D) Whether the cluster should be rebuilt at RF3

**Answer: A**
The change was to capacity and the symptom is about capability, so both halves need checking: the licence must cover the added hardware, and the tier must include the features that stopped working. Licensing is managed in Prism, which is where both answers live.

---

### Q20
Where is licensing managed and monitored in a Nutanix environment?
- A) From Prism, the management interface
- B) From the console of each virtual machine
- C) From Life Cycle Manager
- D) From the guest operating system of the cluster's controller machines

**Answer: A**
Licensing is visible and managed from Prism, which is also where a capacity or compliance notice appears. That is why a licensing problem is seen by the administrator in the management plane rather than by a user on their own machine.

## Domain 3: Describe Cluster Configuration and Maintenance

---

### Q21
A three-node cluster is proposed with RF3. Why is this not a valid design?
- A) RF3 requires a Witness
- B) RF3 is only supported on stretched clusters
- C) Three nodes is below the minimum cluster size for any replication factor
- D) Three nodes cannot hold three copies on different nodes and still have somewhere to rebuild

**Answer: D**
RF3 keeps three copies on three different nodes. With only three nodes, losing two leaves a single surviving copy and no remaining node to rebuild onto, so the design cannot deliver the protection RF3 promises. Three nodes is a normal minimum for RF2, and RF3 is not restricted to stretched clusters.

---

### Q22
Which failure does a cluster running at RF2 survive?
- A) The loss of one node
- B) The loss of two nodes at once
- C) The loss of a whole block
- D) The loss of the cluster's management interface

**Answer: A**
RF2 keeps two copies on two different nodes, so losing one node leaves a complete copy. Surviving two simultaneous node losses is what RF3 provides, and block-level failure requires block awareness rather than replication factor alone.

---

### Q23
What does block awareness add to node awareness?
- A) It places copies on nodes in different chassis, so a whole block can be lost
- B) It places copies on different disks within one node
- C) It increases the replication factor automatically
- D) It removes the need for a Witness in a two-node cluster

**Answer: A**
Node awareness spreads copies across nodes; block awareness spreads them across chassis as well, so the failure of an entire block — power loss or removal for service — is survivable. It does not change replication factor or provide arbitration.

---

### Q24
What makes a two-node cluster a valid design?
- A) Running it at RF3
- B) Adding a third node later
- C) Pairing it with a Witness to break ties
- D) Enabling deduplication

**Answer: C**
Two nodes cannot form a majority, so an outside party must decide which side survives a failure; Witness provides that vote and is what makes the arrangement valid. RF3 on two nodes is not a valid combination, and the other options do not address arbitration.

---

### Q25
A node needs planned servicing. Which sequence is safe?
- A) Power off the node, service it, then evacuate its data
- B) Take the node out of service, then evacuate it
- C) Service the node while it remains in the cluster
- D) Evacuate the node, confirm it is empty, then take it out of service

**Answer: D**
Planned maintenance evacuates first so the node's data and workloads move elsewhere, then confirms the evacuation completed — starting is not the same as finishing — and only then removes the node. Powering off or servicing first removes a copy the cluster still needs.

---

### Q26
A disk in the cluster fails. What is the administrator's first action?
- A) Immediately power off the node to protect the remaining disks
- B) Manually copy the data off the failed disk
- C) Rebuild the cluster from a backup
- D) Confirm the failure is genuine, since the data has already been rebuilt from its other copies

**Answer: D**
The cluster detects the failure and rebuilds the affected data onto the remaining disks without intervention, so the first job is confirming the disk is genuinely gone rather than responding to a transient report. Powering off the node, copying from the failed disk, and restoring a backup are all unnecessary and in the first case harmful.

---

### Q27
Why must a node be evacuated before it is taken out of service?
- A) Because evacuation speeds up the physical work
- B) Because the cluster must not be left holding only one copy of any data
- C) Because evacuation is required to update firmware
- D) Because the node cannot be powered off while it holds data

**Answer: B**
Evacuation moves the node's data and workloads elsewhere so that no data exists only on the node being removed. Without it, removing the node would take away a copy the cluster is depending on. It is a safety step, not a speed or firmware requirement.

---

### Q28
Which LCM step should come before applying any update?
- A) Applying the update to one node to see what happens
- B) Checking compatibility with this specific environment and running pre-checks
- C) Notifying users that the cluster will be unavailable
- D) Taking a snapshot of every virtual machine

**Answer: B**
LCM's value is in inventory, compatibility checking, and pre-checks before the one-click apply. Updating one node speculatively risks an unsupported combination, and a rolling update does not require cluster-wide unavailability.

---

### Q29
An LCM pre-check fails before a planned upgrade. What is the correct response?
- A) Override the pre-check and proceed
- B) Address the condition the pre-check identified, then return to the upgrade
- C) Skip that node and upgrade the rest
- D) Reboot the cluster and try again

**Answer: B**
A failed pre-check is the tool reporting that the environment is not in a fit state to be updated — the same discipline as confirming cluster health before hardware maintenance. Overriding it, skipping nodes, or rebooting does not fix the underlying condition.

---

### Q30
A cluster at a secure site with no internet access needs a software update. What must be arranged?
- A) The update media must be brought in through a controlled channel before the maintenance window
- B) Nothing — LCM downloads updates automatically in all environments
- C) The cluster must be moved to a site with internet access
- D) Pulse must be enabled first

**Answer: A**
A dark site cannot fetch updates directly, so the media has to be transferred in through whatever controlled channel exists — and that is planned ahead of the window rather than discovered during it. Enabling Pulse is telemetry, not update delivery.

## Domain 4: Demonstrate and Understand of Platform Health and Monitoring

---

### Q31
What is Nutanix Cluster Check?
- A) A single test that returns a pass or fail verdict for the cluster
- B) A collection of individual checks, each examining one aspect of cluster state
- C) A tool that applies software updates
- D) A service that sends telemetry to the vendor

**Answer: B**
NCC runs many small checks and produces a report of findings rather than one verdict, which is why its output is a list. Applying updates is Life Cycle Manager's job and sending telemetry is Pulse's.

---

### Q32
A health check on a working cluster reports that a component is degraded. The cluster is performing normally. What does this mean?
- A) The report is a false positive and can be ignored
- B) Something has failed and the cluster is compensating for it, so there is no margin
- C) The cluster must be shut down immediately
- D) The virtual machines on that component have stopped

**Answer: B**
A degraded finding means a component has failed and the cluster is carrying on without it — the highest-value finding precisely because performance looks normal while the margin for a further failure is gone. It is not a false positive, it does not require an immediate shutdown, and the workloads are still running.

---

### Q33
Why run a health check before performing maintenance?
- A) To confirm the cluster is in a fit state to be maintained
- B) Because the check performs the maintenance
- C) To satisfy a licensing requirement
- D) To reduce the time the maintenance takes

**Answer: A**
Running maintenance on an already-degraded cluster leaves no margin for anything to go wrong, so the pre-check confirms fitness first. This is the same discipline as the pre-checks in a software upgrade.

---

### Q34
What is the difference between an event and an alert?
- A) An event is more serious than an alert
- B) Alerts are stored and events are not
- C) An event records that something happened; an alert is a raised condition needing attention
- D) Events only come from hardware and alerts only from software

**Answer: C**
Events are the cluster's history of what happened, most of them routine; alerts are generated from events and represent a condition that needs attention, with a severity. Alerts are not inherently more serious, and both are recorded.

---

### Q35
An administrator acknowledges an alert. What has been accomplished?
- A) The underlying condition has been resolved
- B) The alert has been recorded as seen by a person, and the condition may still be active
- C) The alert has been deleted
- D) The cluster has been told to ignore that condition in future

**Answer: B**
Acknowledging is a statement about attention, not about state: it records that someone is aware. If the condition is still true the alert remains true, which is why acknowledged-but-unresolved alerts are worth reviewing.

---

### Q36
A cluster reports that several virtual machines are unreachable, plus a storage alert and a network warning, all within a few minutes. What is the best first step?
- A) Fix the virtual machine alerts first, then the storage alert
- B) Look for a common cause and check which alert appeared first
- C) Acknowledge all the alerts and wait for them to clear
- D) Reboot the node with the most alerts

**Answer: B**
A cluster of alerts appearing together is usually one root cause with several symptoms, so correlating them — and identifying which appeared first — is faster and safer than treating each in isolation. Acknowledging to wait, or rebooting, risks acting on symptoms.

---

### Q37
A problem began at 14:00 yesterday. Which log collection is most useful for a support case?
- A) The full cluster collection for the last hour
- B) A collection covering the component implicated, over a window that includes 14:00 yesterday
- C) A collection of every component over the last month
- D) No collection — the description alone is enough

**Answer: B**
The window must include when the problem started, and scoping to the implicated component produces something the vendor can work through. A one-hour window misses the start, a month-wide collection is slow and unfocused, and a description without evidence leaves the case guessing.

---

### Q38
What is Pulse?
- A) A tool an administrator runs to collect logs for a support case
- B) A continuous telemetry service that periodically sends diagnostic and health information to the vendor
- C) The alerting engine inside Prism
- D) A health-check command

**Answer: B**
Pulse is automatic and continuous outbound telemetry, which is why it supports proactive support. Collecting logs for a case is Collector's job, alerting happens in Prism, and health checks are run by Nutanix Cluster Check.

---

### Q39
One virtual machine is slow while everything else on the cluster is normal. The cluster's overall utilisation is unremarkable. What is the most likely cause?
- A) A capacity ceiling on the cluster
- B) A failed disk
- C) Contention from another workload — a noisy neighbour
- D) The wrong VLAN on the affected machine

**Answer: C**
A single affected workload alongside normal aggregate utilisation points at contention rather than a ceiling: the resource is not full, it is unevenly shared. A capacity ceiling would affect everything on that resource, and a disk failure or VLAN problem would not present as variable slowness.

---

### Q40
Storage is reported at 70% full. Why is the trend more useful than the number alone?
- A) Because 70% is always a critical threshold
- B) Because a level that is climbing tells you when the limit will be reached, which the number alone does not
- C) Because the percentage is calculated incorrectly
- D) Because the trend determines the replication factor

**Answer: B**
The level says where you are; the trend says how long you have. Storage at 70% and stable is comfortable, while storage at 70% and climbing 2% a week is a plan with a deadline — the same number, two different situations. The percentage is not miscalculated, and it does not set the replication factor.
