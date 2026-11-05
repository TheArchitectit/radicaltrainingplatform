# CompTIA Network+ N10-009 — Module N3 demo cut (October 23 cut, N3 scope)

## Domain 3: Network Operations (N10-009)

---

### Q16
A monitoring dashboard shows round-trip latency to a core server at 40–60 ms for three months, then 300–400 ms starting Tuesday at 14:00. How should this reading be classified first?
- A) A name-resolution problem, because a slowly resolving dashboard hostname would add DNS delay to every probe
- B) A baseline change that marks an incident — the long-running band is "normal," the shift is the anomaly
- C) A normal cosmetic drift in the graph, because monitoring charts commonly rescale older measurements by hundreds of milliseconds
- D) A hard-down condition, because any latency above the historical baseline means the server has stopped answering probes

**Answer: B**
A baseline is a measured range of normal, not a feeling. When the measurement leaves that band at a known time, you have an incident to investigate (what changed at 14:00?), not a mystery. The server still answers (so not down), graph cosmetics do not produce a clean step-change (B), and DNS failure would typically break the measurement source or the name, not raise latency cleanly (D).

---

### Q17
An operator is handed a latency chart with no baseline and asked whether "this is bad." What is the correct first response?
- A) Establish what normal looked like for that service and interval before judging the current trace
- B) Restart the monitoring tool so the chart resets
- C) Declare an incident immediately, because latency above zero is always an outage
- D) Restore from backup to clear the symptom

**Answer: A**
Without a baseline there is no defensible "normal," so the first step is to recover history (peer devices, prior captures, vendor SLAs, a quiet-time sample) and then compare. Declaring an incident on unexamined numbers (A) and rebooting the tool (D) both destroy or ignore the evidence; a restore (B) is an invasive action aimed at an unknown cause.

---

### Q18
What is the operational purpose of keeping current network diagrams and an inventory of devices, circuits, and credentials?
- A) They are the map you need before and during an emergency, and the basis for change planning
- B) They eliminate the need for monitoring baselines because a complete inventory predicts normal performance
- C) They are archival records used only after decommissioning, when the hardware can no longer be inspected
- D) They exist solely to satisfy audit visitors and should be updated only when an assessment is scheduled

**Answer: A**
Diagrams and inventory are how anyone — not just the person who built the network — understands what exists and how it connects. They speed incident response, make change plans reviewable, and support capacity and lifecycle work. They are operational tools, not paperwork theater (A), and they complement rather than replace measurements (C).

---

### Q19
A change request to replace a core switch has been signed off and scheduled. Which sequence is the correct next-step discipline?
- A) Execute immediately during business hours, before the approval expires, and use the scheduled window only for verification
- B) Record the plan and rollback steps, take a backup, implement in the window, verify services, then document the outcome
- C) Skip post-change service verification when the console login works and no new alarms appear on the replaced switch
- D) Delete every saved copy of the old configuration before starting so operators cannot accidentally restore obsolete settings

**Answer: B**
Change management is a sequence: plan → backup → implement in the scheduled window → verify against known tests → document. Rollback must be defined before you touch anything. Daytime execution (A) ignores the scheduled window and blast radius, console-normal without service checks (C) is not verification, and deleting the old config first (D) throws away the rollback path.

---

### Q20
In disaster recovery terms, what does RPO describe?
- A) The number of backup copies that must be retained offsite before recovery can begin
- B) The maximum elapsed time allowed for restoring the service to normal operation after a disaster
- C) How much data the organization accepts losing, expressed as time since the last good copy
- D) The mandatory order in which servers and dependencies must be rebuilt during a recovery exercise

**Answer: C**
Recovery Point Objective is the maximum tolerable data loss measured in time — if backups run nightly and RPO is 24 hours, you accept up to a day of work lost. Recovery Time Objective (A) is how fast service must return, restoration order (C) is a runbook choice informed by RTO/RPO, and offsite copy count (D) is a retention design detail, not the objective itself.
