# CompTIA Network+ N10-009 — Module N3 fixtures (October 23 cut, N3 scope)

## Domain 3: Network Operations (N10-009)

---

### Q16
A monitoring dashboard shows round-trip latency to a core server at 40–60 ms for three months, then 300–400 ms starting Tuesday at 14:00. How should this reading be classified first?
- A) A baseline change that marks an incident — the long-running band is "normal," the shift is the anomaly
- B) A cosmetic graph issue, because latency graphs drift
- C) A hard down condition, because the server is not answering
- D) A DNS problem, because the graph name may not resolve

**Answer: A**
A baseline is a measured range of normal, not a feeling. When the measurement leaves that band at a known time, you have an incident to investigate (what changed at 14:00?), not a mystery. The server still answers (so not down), graph cosmetics do not produce a clean step-change (B), and DNS failure would typically break the measurement source or the name, not raise latency cleanly (D).

---

### Q17
An operator is handed a latency chart with no baseline and asked whether "this is bad." What is the correct first response?
- A) Declare an incident immediately, because latency above zero is always an outage
- B) Restore from backup to clear the symptom
- C) Establish what normal looked like for that service and interval before judging the current trace
- D) Restart the monitoring tool so the chart resets

**Answer: C**
Without a baseline there is no defensible "normal," so the first step is to recover history (peer devices, prior captures, vendor SLAs, a quiet-time sample) and then compare. Declaring an incident on unexamined numbers (A) and rebooting the tool (D) both destroy or ignore the evidence; a restore (B) is an invasive action aimed at an unknown cause.

---

### Q18
What is the operational purpose of keeping current network diagrams and an inventory of devices, circuits, and credentials?
- A) They are required decorations for audit visitors only
- B) They are the map you need before and during an emergency, and the basis for change planning
- C) They replace the need for monitoring baselines
- D) They are only useful after the network is decommissioned

**Answer: B**
Diagrams and inventory are how anyone — not just the person who built the network — understands what exists and how it connects. They speed incident response, make change plans reviewable, and support capacity and lifecycle work. They are operational tools, not paperwork theater (A), and they complement rather than replace measurements (C).

---

### Q19
A change request to replace a core switch has been signed off and scheduled. Which sequence is the correct next-step discipline?
- A) Execute immediately during business hours to shorten the window
- B) Record the plan and rollback steps, take a backup, implement in the window, verify services, then document the outcome
- C) Skip verification if the console looks normal
- D) Delete the old configuration first to avoid confusion

**Answer: B**
Change management is a sequence: plan → backup → implement in the scheduled window → verify against known tests → document. Rollback must be defined before you touch anything. Daytime execution (A) ignores the scheduled window and blast radius, console-normal without service checks (C) is not verification, and deleting the old config first (D) throws away the rollback path.

---

### Q20
In disaster recovery terms, what does RPO describe?
- A) How long a restore is allowed to take
- B) How much data the organization accepts losing, expressed as time since the last good copy
- C) The order in which servers are rebuilt
- D) The number of backup copies to keep offsite

**Answer: B**
Recovery Point Objective is the maximum tolerable data loss measured in time — if backups run nightly and RPO is 24 hours, you accept up to a day of work lost. Recovery Time Objective (A) is how fast service must return, restoration order (C) is a runbook choice informed by RTO/RPO, and offsite copy count (D) is a retention design detail, not the objective itself.
