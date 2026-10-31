# CompTIA A+ Core 1 (220-1201) Practice Questions - Part 3
# Original study items. Independent material, not official or endorsed by CompTIA.

## DOMAIN 4: Virtualization and Cloud Computing (study allocation)

---

### Q121
A QA team must verify their product on a legacy operating system that cannot be installed on any machine they own. Which virtualization use case applies?
- A) Buying a period-correct CRT monitor
- B) Enabling Secure Boot
- C) Switching the PSU to 220 VAC
- D) Running the legacy OS as a guest VM for test development

**Answer: D**
Cross-platform and legacy-OS testing is a core VM use case: the old operating system installs as a guest regardless of the physical hardware, giving the team a repeatable test target. The other options address display, boot trust, and power, none of which hosts an OS.
<!-- {"id":"COMPTIA-A-1201-Q121","objective":"4.1","type":"recall","source":"OBJ1201","locator":"Objective 4.1 legacy software/OS, test development","verified":"2026-10-10"} -->

---

### Q122
An application from 2009 refuses to run on the company's current operating system, but runs perfectly in a window alongside modern apps. What makes this possible?
- A) ECC memory
- B) A modular power supply
- C) Application virtualization or a guest VM providing the legacy environment
- D) A patch panel

**Answer: C**
Virtualization (application-level packaging or a full guest OS) supplies the legacy runtime the old app expects, letting it coexist with the modern desktop. The other options are hardware topics unrelated to software compatibility.
<!-- {"id":"COMPTIA-A-1201-Q122","objective":"4.1","type":"recall","source":"OBJ1201","locator":"Objective 4.1 application virtualization, cross-platform","verified":"2026-10-10"} -->

---

### Q123
Before deploying a VM that will host a customer database, the team reviews what it will need. Which three resources must be deliberately allocated to any VM? (Choose three.)
- A) Virtual CPU capacity
- B) Memory
- C) Storage
- D) A physical monitor
- E) A printer spooler

**Correct Answer: A, B, C**
Every guest needs compute, memory, and storage assigned from host resources, and undersizing any of the three degrades the workload. Network and security configuration matter too, but displays and print spoolers are not VM requirements.
<!-- {"id":"COMPTIA-A-1201-Q123","objective":"4.1","type":"recall","source":"OBJ1201","locator":"Objective 4.1 requirements security, network, storage","verified":"2026-10-10"} -->

---

### Q124
A developer's laptop runs four test VMs and the whole machine crawls when all four are on. Each VM was assigned 8 GB of RAM, and the laptop has 16 GB total. What is the problem?
- A) The assigned guest memory overcommits the host's physical RAM
- B) The VMs need Secure Boot
- C) The laptop needs a docking station
- D) The VMs should use Type 1 networking

**Answer: A**
Guest allocations come out of real host resources. Four guests at 8 GB each demand 32 GB on a 16 GB host, forcing heavy swapping. Right-sizing guests or adding RAM is the fix; this is why resource allocation discipline matters.
<!-- {"id":"COMPTIA-A-1201-Q124","objective":"4.1","type":"diagnosis","source":"OBJ1201","locator":"Objective 4.1 requirements, resource allocation","verified":"2026-10-10"} -->

---

### Q125
A company wants its internal VM environment to feel like a public cloud to its own departments, with self-service provisioning, while keeping all hardware on-premises. Which model describes this?
- A) SaaS
- B) Private cloud
- C) Public cloud
- D) Community cloud

**Answer: B**
A private cloud delivers cloud-style self-service and pooled resources on infrastructure dedicated to one organization, on-premises or hosted. Public cloud shares the provider across all customers, and SaaS is finished software, not infrastructure.
<!-- {"id":"COMPTIA-A-1201-Q125","objective":"4.2","type":"recall","source":"OBJ1201","locator":"Objective 4.2 common cloud models private","verified":"2026-10-10"} -->

---

### Q126
A developer wants to deploy code to a managed runtime without maintaining the underlying virtual machines, patching them, or configuring their OS. Which service model matches?
- A) On-premises virtualization
- B) PaaS
- C) IaaS
- D) SaaS

**Answer: B**
Platform as a service provides the runtime and middleware as a managed platform: the customer deploys code while the provider owns the OS and infrastructure underneath. IaaS leaves the VM and OS to the customer; SaaS is someone else's finished application.
<!-- {"id":"COMPTIA-A-1201-Q126","objective":"4.2","type":"recall","source":"OBJ1201","locator":"Objective 4.2 service models PaaS","verified":"2026-10-10"} -->

---

### Q127
A small business rents virtual servers and storage from a provider and installs its own operating systems and software on them. Which cloud service model is this?
- A) SaaS
- B) PaaS
- C) Community cloud
- D) IaaS

**Answer: D**
Infrastructure as a service rents fundamental compute, storage, and networking while the customer supplies and manages everything from the OS up. That division of responsibility is exactly what the scenario describes.
<!-- {"id":"COMPTIA-A-1201-Q127","objective":"4.2","type":"recall","source":"OBJ1201","locator":"Objective 4.2 service models IaaS","verified":"2026-10-10"} -->

---

### Q128
The finance team notices the cloud bill spiked after a marketing video went viral, mostly from data leaving the provider's network. Which billing concept explains the spike?
- A) Metered utilization charges for egress traffic
- B) Multitenancy discounts
- C) Rapid elasticity refunds
- D) Community pricing

**Answer: A**
Cloud billing is metered, and many providers charge for data transferred out (egress) while inbound data (ingress) is cheap or free. A viral video drives large outbound transfer, which lands directly on the meter.
<!-- {"id":"COMPTIA-A-1201-Q128","objective":"4.2","type":"diagnosis","source":"OBJ1201","locator":"Objective 4.2 metered utilization, ingress/egress","verified":"2026-10-10"} -->

---

### Q129
A cloud provider hosts dozens of customers' virtual machines on the same physical servers while keeping each customer's data isolated. What is this architecture called?
- A) Multitenancy
- B) A hybrid deployment
- C) Dedicated resources
- D) A port replicator

**Answer: A**
Multitenancy means one shared pool of infrastructure securely serving many separate customers, which is how public cloud economics work. Dedicated resources assign hardware to one customer at a correspondingly higher price.
<!-- {"id":"COMPTIA-A-1201-Q129","objective":"4.2","type":"recall","source":"OBJ1201","locator":"Objective 4.2 shared vs dedicated resources, multitenancy","verified":"2026-10-10"} -->

---

### Q130
An executive wants files edited on any of their devices to appear on all the others automatically, including their phone and laptop. Which cloud characteristic provides this?
- A) High availability
- B) Metered billing
- C) File synchronization
- D) Elasticity

**Answer: C**
Cloud file synchronization keeps a folder's contents consistent across every linked device, so an edit made on the phone appears on the laptop. Elasticity, availability, and metering are infrastructure and billing properties, not user-file features.
<!-- {"id":"COMPTIA-A-1201-Q130","objective":"4.2","type":"recall","source":"OBJ1201","locator":"Objective 4.2 cloud characteristics file synchronization","verified":"2026-10-10"} -->

---

### Q131
A retailer runs its storefront in two separate cloud regions so that a regional outage does not take the store down. Which cloud characteristic are they buying?
- A) Multitenancy
- B) Availability
- C) Elasticity
- D) Egress pricing

**Answer: B**
High availability is the design goal of keeping service running through failures, here by spanning regions so one region's outage leaves the other serving. Elasticity is about scaling with demand, not surviving failure.
<!-- {"id":"COMPTIA-A-1201-Q131","objective":"4.2","type":"diagnosis","source":"OBJ1201","locator":"Objective 4.2 cloud characteristics availability","verified":"2026-10-10"} -->

---

### Q132
A lab instructor wants each student to have an identical, isolated Windows environment that resets after class, without touching the forty physical PCs' main installs. What is the simplest virtualization answer?
- A) Install a second power supply in each PC
- B) Move the class to pen and paper
- C) Give each student a VM snapshot that reverts to a clean state
- D) Reimage every PC after each class

**Answer: C**
VMs with snapshots give every student an isolated environment that can roll back to a known-good state in seconds, which is precisely the reset-between-groups requirement. Reimaging physical machines does the same job in hours instead of seconds.
<!-- {"id":"COMPTIA-A-1201-Q132","objective":"4.1","type":"diagnosis","source":"OBJ1201","locator":"Objective 4.1 purpose of virtual machines test development","verified":"2026-10-10"} -->

---

## DOMAIN 5: Hardware and Network Troubleshooting (study allocation)

---

### Q133
A desktop emits a repeating pattern of beeps when powered on and shows nothing on screen. The manual decodes the pattern as a memory fault. What should the technician do first?
- A) Replace the monitor
- B) Reseat the RAM modules and retry
- C) Replace the power supply immediately
- D) Reflash the BIOS

**Answer: B**
POST beep codes are the motherboard's built-in diagnostics, and a memory code with a blank screen makes RAM the prime suspect. Reseating is the fastest safe test before replacing parts; the other options treat unproven suspects.
<!-- {"id":"COMPTIA-A-1201-Q133","objective":"5.1","type":"diagnosis","source":"OBJ1201","locator":"Objective 5.1 common symptoms POST beeps","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q134
A PC shuts down randomly after an hour of use, more often in the afternoon, and restarts fine once cooled. What is the best lead?
- A) An incorrect DNS entry
- B) A worn printer ribbon
- C) A loose Ethernet cable
- D) Overheating from dust-clogged cooling or a failing fan

**Answer: D**
Time- and heat-correlated shutdowns that recover after cooling are the classic overheating signature. Cleaning dust, verifying fan operation, and checking heat sink contact come before any part replacement. Network and printer faults do not power a machine off.
<!-- {"id":"COMPTIA-A-1201-Q134","objective":"5.1","type":"diagnosis","source":"OBJ1201","locator":"Objective 5.1 common symptoms overheating, random shutdown","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q135
Pressing the power button on a desktop does nothing at all: no fans, no lights, no beeps. The outlet works with another device. What is the next safe test?
- A) Verify the power cable and the PSU's input selector and rocker switch
- B) Replace the motherboard
- C) Replace the CPU
- D) Reflash the BIOS

**Answer: A**
A totally dead machine with a known-good outlet moves the suspicion to the power path: cable, the PSU's own switch and voltage selector, then the supply itself. Swapping boards or CPUs before confirming incoming power wastes parts and time.
<!-- {"id":"COMPTIA-A-1201-Q135","objective":"5.1","type":"diagnosis","source":"OBJ1201","locator":"Objective 5.1 common symptoms no power","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q136
A user reports a burning smell from their PC and shuts it off. Opening the case, the technician spots several domed, leaking components on the motherboard. What are they looking at?
- A) Swollen capacitors, which indicate board-level failure
- B) Normal heat sinks
- C) SODIMM modules
- D) Thermal pads doing their job

**Answer: A**
Capacitor swelling (domed tops, leakage) is a visible failure mode of aging or heat-stressed boards and a burning smell's common source. The board needs replacement or professional rework; the machine should stay off until then.
<!-- {"id":"COMPTIA-A-1201-Q136","objective":"5.1","type":"diagnosis","source":"OBJ1201","locator":"Objective 5.1 common symptoms capacitor swelling, burning smell","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q137
Every few weeks a PC's clock resets to a date years in the past, and BIOS settings revert to defaults. The machine otherwise runs perfectly. What is the most likely cause?
- A) A fragmented page file
- B) An overheating GPU
- C) A dying CMOS battery
- D) A failing hard drive

**Answer: C**
The small CMOS battery keeps firmware settings and the real-time clock alive while the machine is unplugged. Time resets plus settings loss are its signature failure, and the battery is a cheap, quick replacement.
<!-- {"id":"COMPTIA-A-1201-Q137","objective":"5.1","type":"diagnosis","source":"OBJ1201","locator":"Objective 5.1 common symptoms inaccurate system date/time","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q138
A workstation has grown sluggish over months: the disk light stays on, apps take ages to open, and memory usage sits at 95 percent. Task Manager shows one sync client consuming most of the RAM. What is the fastest effective next step?
- A) Buy a faster monitor
- B) Disable the network card
- C) Restart or limit the offending sync client and evaluate adding RAM
- D) Replace the power supply

**Answer: C**
Sluggish performance with memory exhausted by one identified process is a software-resource problem, so containing that process is the direct remedy; chronic pressure afterward justifies a RAM upgrade. Hardware swaps aimed at power or display miss the measured cause.
<!-- {"id":"COMPTIA-A-1201-Q138","objective":"5.1","type":"diagnosis","source":"OBJ1201","locator":"Objective 5.1 common symptoms sluggish performance","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q139
Applications on a PC crash at random with different error codes each time, and the crashes move around between programs. Memtest-style diagnostics report thousands of errors on one stick. What is the fix?
- A) Replace the failing RAM module
- B) Reinstall every application
- C) Update the printer driver
- D) Replace the CPU cooler with a larger one

**Answer: A**
Random, migrating application crashes are a textbook bad-memory symptom, and a diagnostic attributing errors to one module confirms it. Software reinstalls cannot survive defective RAM underneath them.
<!-- {"id":"COMPTIA-A-1201-Q139","objective":"5.1","type":"diagnosis","source":"OBJ1201","locator":"Objective 5.1 troubleshoot motherboards, RAM, CPUs","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q140
A server room reports a PC that emits a high-pitched whine and an intermittent grinding sound. The grinding seems to come from the only mechanical component left in the build besides the fans. What should the technician do first?
- A) Defragment the registry
- B) Ignore it until the drive fails
- C) Back up the drive immediately, then diagnose it for replacement
- D) Turn up the case fans to mask the noise

**Answer: C**
Grinding from a mechanical hard drive signals imminent failure. Data preservation comes before any further stress on the disk, then diagnostics and replacement. Masking noise or waiting risks total data loss.
<!-- {"id":"COMPTIA-A-1201-Q140","objective":"5.1","type":"diagnosis","source":"OBJ1201","locator":"Objective 5.1 unusual noise; 5.2 grinding sounds","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q141
After a RAM upgrade, a PC powers on but the screen stays blank with no beeps. The new sticks are confirmed compatible. What is the fastest thing to retry?
- A) Change the monitor cable to HDMI
- B) Reseat the modules until the retaining clips click on both ends
- C) Replace the motherboard
- D) Update the graphics driver

**Answer: B**
A machine that worked before the upgrade and shows a blank screen after it most often has a module not fully seated. The clips must latch on both ends. Driver and display changes cannot help a machine that never reaches the OS.
<!-- {"id":"COMPTIA-A-1201-Q141","objective":"5.1","type":"diagnosis","source":"OBJ1201","locator":"Objective 5.1 blank screen, RAM troubleshooting","verified":"2026-10-10"} -->

---

### Q142
A RAID 5 array's management page shows one drive with a red LED and status "degraded," but all data is still accessible. What should the technician do?
- A) Delete the array and restore from backup
- B) Replace the failed drive promptly so the array can rebuild before a second failure
- C) Do nothing; RAID 5 tolerates all failures forever
- D) Convert the array to RAID 0 for speed

**Answer: B**
RAID 5 survives exactly one drive failure by computing from parity; running degraded means the next failure loses everything. Prompt replacement starts the rebuild and restores redundancy. Status LEDs and alerts exist precisely to trigger this response.
<!-- {"id":"COMPTIA-A-1201-Q142","objective":"5.2","type":"diagnosis","source":"OBJ1201","locator":"Objective 5.2 LED status indicators, RAID failure","verified":"2026-10-10"} -->

---

### Q143
A user's PC suddenly reports "bootable device not found" on startup. In BIOS, the drive no longer appears at all. What is the best next step?
- A) Check the drive's data and power connections, then test the drive in another system or enclosure
- B) Reinstall the operating system immediately
- C) Replace the RAM
- D) Run a printhead cleaning

**Answer: A**
A drive that vanishes from firmware has a connection, power, or hardware fault; an OS reinstall cannot touch a drive the BIOS cannot see. Reseating cables and testing the drive elsewhere isolates drive from motherboard before declaring it dead.
<!-- {"id":"COMPTIA-A-1201-Q143","objective":"5.2","type":"diagnosis","source":"OBJ1201","locator":"Objective 5.2 bootable device not found","verified":"2026-10-10"} -->

---

### Q144
An SSD utility emails an alert that the drive's S.M.A.R.T. data shows rapidly growing reallocated sectors and the wear indicator near its limit. The drive still works. How should the technician treat this?
- A) As a reason to defragment the SSD nightly
- B) As a sign to add more page file
- C) As an early failure warning: back up and plan replacement before it dies
- D) As a false alarm; S.M.A.R.T. is marketing

**Answer: C**
Self-Monitoring and Reporting Technology attributes track a drive's internal health, and rising reallocated sectors with high wear is the standard pre-failure picture. Acting while the drive still works is the entire point of the warning.
<!-- {"id":"COMPTIA-A-1201-Q144","objective":"5.2","type":"diagnosis","source":"OBJ1201","locator":"Objective 5.2 S.M.A.R.T. failure","verified":"2026-10-10"} -->

---

### Q145
Files on a user's external drive increasingly come back corrupted, and copies that used to take seconds now take minutes with frequent retries. What do the extended read/write times plus corruption suggest?
- A) The drive needs a new drive letter
- B) The files are simply too large
- C) The drive is developing bad areas and should be replaced after backup
- D) The USB cable is too short

**Answer: C**
Growing corruption plus slowing transfers with retries is the signature of a drive struggling with failing sectors. The response is back up, verify the backup, and replace the drive; cables and letters do not corrupt data progressively.
<!-- {"id":"COMPTIA-A-1201-Q145","objective":"5.2","type":"diagnosis","source":"OBJ1201","locator":"Objective 5.2 data loss/corruption, extended read/write times","verified":"2026-10-10"} -->

---

### Q146
A video editor complains their RAID 0 scratch array shows only one of its two drives in the OS, and the array is gone from the storage utility. Both drives show activity lights. What happened?
- A) One drive dropped from the array, and because RAID 0 has no redundancy, the array is broken
- B) The array converted itself to RAID 1
- C) The drives need new drive letters
- D) The editor exceeded the printer quota

**Answer: A**
RAID 0 stripes data across all members, so losing one member destroys the whole array; a missing member in the OS with the array absent matches that. This is the risk the editor accepted for speed, and recovery points to backups.
<!-- {"id":"COMPTIA-A-1201-Q146","objective":"5.2","type":"diagnosis","source":"OBJ1201","locator":"Objective 5.2 missing drives in OS, array missing","verified":"2026-10-10"} -->

---

### Q147
A file server's storage has become slow for everyone at once, with read/write operations per second far below the array's baseline. A quick check shows a scheduled backup job hammering the same disks every afternoon. What is the right conclusion?
- A) All drives must be replaced
- B) The array needs conversion to RAID 0
- C) The network printer is at fault
- D) The low IOPS is contention from the backup workload, not a hardware failure; reschedule it

**Answer: D**
A uniform slowdown aligned with a known heavy job is a workload contention issue, and the diagnostic value of a baseline is exactly this comparison. Hardware replacement without evidence of failure wastes money and solves nothing.
<!-- {"id":"COMPTIA-A-1201-Q147","objective":"5.2","type":"diagnosis","source":"OBJ1201","locator":"Objective 5.2 low performance IOPS","verified":"2026-10-10"} -->

---

### Q148
A laptop's SSD was upgraded and cloned by a shop, but the machine now takes longer to boot than before and the SSD utility reports the drive running on an older, slower link mode. What is the likely cause?
- A) The drive or slot negotiated a slower interface mode than the drive supports
- B) SSDs always slow down after cloning
- C) The battery is too small
- D) The clone added fragmentation to the SSD

**Answer: A**
A fast drive reporting a reduced link mode means it is operating below its design speed, typically from a slot, adapter, or firmware limitation. Confirming the slot's supported interface and firmware settings addresses the gap; cloning itself does not degrade link rates.
<!-- {"id":"COMPTIA-A-1201-Q148","objective":"5.2","type":"diagnosis","source":"OBJ1201","locator":"Objective 5.2 low performance, drive troubleshooting","verified":"2026-10-10"} -->

---

### Q149
During a presentation, the projector shows the speaker's laptop as a blue screen with "no signal," though the cable is firmly connected at both ends. What should the speaker check first?
- A) Whether the laptop needs more RAM
- B) Whether the projector bulb is burnt out
- C) Whether the HDMI cable supports audio
- D) Whether the projector's input source matches the port in use

**Answer: D**
"Connected but no signal" is most often an input-source mismatch: the projector is listening on HDMI 2 while the cable is in HDMI 1. A burnt-out bulb gives no light at all rather than a clean no-signal message, and memory or audio support is irrelevant.
<!-- {"id":"COMPTIA-A-1201-Q149","objective":"5.3","type":"diagnosis","source":"OBJ1201","locator":"Objective 5.3 incorrect input source","verified":"2026-10-10"} -->

---

### Q150
A user reports their monitor image looks fuzzy and text is slightly smeared after a docking station swap. The monitor is connected with an old VGA cable the previous setup did not use. What is the best fix?
- A) Lower the refresh rate to 30 Hz
- B) Replace the monitor inverter
- C) Clean the screen with solvent
- D) Switch to a digital connection (HDMI or DisplayPort) at the panel's native resolution

**Answer: D**
VGA is analog and softens image detail, especially off native resolution; a fuzzy, smeared picture that appeared with the analog cable points right at it. A digital link at native resolution restores sharpness. Inverters affect backlight, not focus.
<!-- {"id":"COMPTIA-A-1201-Q150","objective":"5.3","type":"diagnosis","source":"OBJ1201","locator":"Objective 5.3 fuzzy image, physical cabling issues","verified":"2026-10-10"} -->

---

### Q151
A desktop monitor shows a persistent ghost of the taskbar even when a full-screen video plays. The panel is an older LCD that displayed the same static desktop for years. What is this called and what helps?
- A) A burnt-out bulb; replace it
- B) Image burn-in; varied content, screen savers, and sleep timers help prevent it worsening
- C) Dead pixels; they spread if not cleaned
- D) Incorrect input source; reseat the cable

**Answer: B**
Long-term static content can leave a retained ghost image on a display, known as burn-in (or persistent image retention). Prevention is varying content and letting the screen sleep; severe cases are permanent. Dead pixels are isolated dots, not a taskbar-shaped ghost.
<!-- {"id":"COMPTIA-A-1201-Q151","objective":"5.3","type":"recall","source":"OBJ1201","locator":"Objective 5.3 display burn-in","verified":"2026-10-10"} -->

---

### Q152
A user says three small black dots on their laptop screen never change color no matter what is displayed. What are these, and what is the honest guidance?
- A) Dead pixels; a few are often within manufacturing tolerance and not repairable by software
- B) Dust inside the screen; shaking the laptop clears it
- C) Burn-in; it fades in an hour
- D) A loose antenna lead

**Answer: A**
Pixels stuck dark regardless of content are dead (or stuck) pixels, a hardware defect of the panel. Small counts are typically within vendor tolerance; software and cleaning cannot fix them, and replacement is the only full remedy.
<!-- {"id":"COMPTIA-A-1201-Q152","objective":"5.3","type":"recall","source":"OBJ1201","locator":"Objective 5.3 dead pixels","verified":"2026-10-10"} -->

---

### Q153
A conference-room projector dims itself and shuts off after twenty minutes of use, then works again after cooling down. What is the most likely cause?
- A) The HDMI cable is too short
- B) Overheating from a clogged air filter or blocked vents triggering thermal protection
- C) The wrong input source
- D) Dead pixels accumulating

**Answer: B**
Time-dependent shutdown that recovers after cooling is thermal protection doing its job, and projectors pack hot lamps behind small filtered vents. Cleaning the filter and ensuring clearance resolves most intermittent projector shutdowns.
<!-- {"id":"COMPTIA-A-1201-Q153","objective":"5.3","type":"diagnosis","source":"OBJ1201","locator":"Objective 5.3 intermittent projector shutdown, dim image","verified":"2026-10-10"} -->

---

### Q154
A monitor's colors are wildly wrong (everything tinted green) on one PC but normal on another using the same cable. What is the best next test on the affected PC?
- A) Replace the power supply
- B) Reflash the monitor's firmware
- C) Check for a partially seated connector or bent pin on that PC's port, then its color settings
- D) Replace the monitor

**Answer: C**
The monitor and cable are proven good by the second PC, isolating the fault to the first PC's output path. A loose connector or bent pin dropping one color channel causes exactly a uniform tint, and it costs nothing to check before settings or parts.
<!-- {"id":"COMPTIA-A-1201-Q154","objective":"5.3","type":"diagnosis","source":"OBJ1201","locator":"Objective 5.3 incorrect color display, physical cabling issues","verified":"2026-10-10"} -->

---

### Q155
A laptop's built-in display flickers when the lid angle changes, but an external monitor is steady at any angle. Where is the fault most likely?
- A) The GPU is failing
- B) The inverter needs cleaning
- C) The operating system's color profile is corrupt
- D) The display cable running through the hinge is fatigued or loose

**Answer: D**
Angle-dependent flicker isolates the fault to something that moves with the lid: the display cable through the hinge. A GPU fault would corrupt the external output too, and software causes would not care about lid position.
<!-- {"id":"COMPTIA-A-1201-Q155","objective":"5.3","type":"diagnosis","source":"OBJ1201","locator":"Objective 5.3 flashing screen, physical cabling issues","verified":"2026-10-10"} -->

---

### Q156
A video projector's image is distorted into a trapezoid because the projector sits far below screen level. Which built-in correction addresses the shape, and what is its trade-off?
- A) Keystone correction; it squares the image digitally at some cost to sharpness
- B) Dead pixel mapping; it removes dark spots
- C) Input source cycling; it changes connectors
- D) Refresh-rate sync; it stops flicker

**Answer: A**
Keystone correction compensates for off-axis projection geometry, squaring the trapezoid by scaling the image, which slightly reduces effective resolution. Physical repositioning is optically better when the room allows it.
<!-- {"id":"COMPTIA-A-1201-Q156","objective":"5.3","type":"recall","source":"OBJ1201","locator":"Objective 5.3 sizing issues, distorted image","verified":"2026-10-10"} -->

---

### Q157
A user dropped their phone; the glass is intact but the touchscreen now registers touches an inch away from where they tap. What is the fault and the fix path?
- A) Malware; run a cleaner app
- B) A dead battery; replace it
- C) A swollen case; press it flat
- D) Digitizer damage or miscalibration; try calibration, then digitizer/display replacement

**Answer: D**
Systematic touch offset after physical shock points at the digitizer layer (the touch sensor) being damaged or knocked out of calibration. Calibration is the free first test; persistent offset means the digitizer, often part of the display assembly, needs replacement.
<!-- {"id":"COMPTIA-A-1201-Q157","objective":"5.4","type":"diagnosis","source":"OBJ1201","locator":"Objective 5.4 digitizer issues, touch calibration","verified":"2026-10-10"} -->

---

### Q158
A two-year-old phone that once lasted all day now dies by lunch with identical usage, and the battery-health screen shows 72 percent of original capacity. What is the correct conclusion?
- A) The charger is too powerful
- B) The screen is too bright
- C) Normal battery wear; replacing the battery restores runtime
- D) Malware infection; wipe the phone

**Answer: C**
Lithium batteries lose capacity with charge cycles, and a health reading of 72 percent explains the shortened day exactly. Battery replacement is the standard remedy; the other options do not match a measured capacity loss.
<!-- {"id":"COMPTIA-A-1201-Q158","objective":"5.4","type":"diagnosis","source":"OBJ1201","locator":"Objective 5.4 poor battery health","verified":"2026-10-10"} -->

---

### Q159
A technician notices a phone's back cover bulging and the screen lifting at one edge. The phone still works. What must the technician do?
- A) Squeeze the case back together
- B) Puncture the battery to release pressure
- C) Ignore it until the next service window
- D) Power it off, stop charging it, and replace the swollen battery promptly using safe handling

**Answer: D**
A swollen battery is a genuine fire and rupture hazard: the device should be powered down, kept away from heat, and the battery replaced with proper precautions. Puncturing or compressing it can trigger a thermal event, and waiting raises the risk daily.
<!-- {"id":"COMPTIA-A-1201-Q159","objective":"5.4","type":"diagnosis","source":"OBJ1201","locator":"Objective 5.4 swollen battery","verified":"2026-10-10"} -->

---

### Q160
A phone charges only when the cable is held at a certain angle, and lint is visible packed into the port. What is the first, safest fix attempt?
- A) Soak the port in cleaning alcohol overnight
- B) Power off and gently clear the compacted lint from the port with a non-conductive tool
- C) Replace the charging port immediately
- D) Bend the cable's connector to fit tighter

**Answer: B**
Angle-dependent charging with visible debris is almost always compacted pocket lint preventing full connector seating. Careful removal with a non-metallic tool restores contact in most cases; port replacement comes only after cleaning fails.
<!-- {"id":"COMPTIA-A-1201-Q160","objective":"5.4","type":"diagnosis","source":"OBJ1201","locator":"Objective 5.4 improper charging, physically damaged ports","verified":"2026-10-10"} -->

---

### Q161
A tablet was briefly splashed with water and now the speakers crackle and charging is intermittent. What is the correct immediate sequence?
- A) Charge it fully to stabilize the battery
- B) Bake it at low heat to dry it faster
- C) Power off, do not charge, dry the exterior, and let it dry completely before testing or service
- D) Keep using it to evaporate the water

**Answer: C**
Liquid damage management is about preventing short circuits while moisture remains: power off, no charging, gentle drying, and time (or professional cleaning) before re-energizing. Heat and continued use drive corrosion and shorts.
<!-- {"id":"COMPTIA-A-1201-Q161","objective":"5.4","type":"diagnosis","source":"OBJ1201","locator":"Objective 5.4 liquid damage","verified":"2026-10-10"} -->

---

### Q162
A user's phone runs hot, drains fast, and shows a flashlight app they never installed using significant background data. What should the technician suspect and do?
- A) A swollen battery; puncture it
- B) A dead pixel; replace the screen
- C) Malware; remove the rogue app, run a reputable scan, and review app permissions
- D) Normal aging; do nothing

**Answer: C**
An unknown app consuming data with heat and drain is a classic mobile malware presentation. Removal, a reputable scanner pass, and a permission audit address it; if symptoms persist, a factory reset with clean restore is the escalation.
<!-- {"id":"COMPTIA-A-1201-Q162","objective":"5.4","type":"diagnosis","source":"OBJ1201","locator":"Objective 5.4 malware, degraded performance, overheating","verified":"2026-10-10"} -->

---

### Q163
After an OS update, a user's favorite app crashes on launch while every other app works. What is the fastest first remedy?
- A) Clear the app's cache (and check for an app update built for the new OS)
- B) Factory reset the phone
- C) Replace the storage chip
- D) Disable all location services

**Answer: A**
A single app breaking right after a platform update usually means stale cached data or an app version incompatible with the new OS. Clearing cache and updating the app are the cheap first steps; a factory reset is the last resort, not the first.
<!-- {"id":"COMPTIA-A-1201-Q163","objective":"5.4","type":"diagnosis","source":"OBJ1201","locator":"Objective 5.4 unable to install new applications, degraded performance","verified":"2026-10-10"} -->

---

### Q164
A field worker's stylus suddenly stops registering on their rugged tablet, though finger touch works fine. The stylus has a replaceable battery. What is the first check?
- A) The tablet's cellular antenna
- B) The screen's pixel density setting
- C) The stylus battery and its pairing state
- D) The tablet's display cable

**Answer: C**
Finger touch working isolates the problem to the stylus itself rather than the digitizer. An active stylus with a dead battery or dropped pairing produces exactly this; those checks take seconds before any tablet hardware suspicion.
<!-- {"id":"COMPTIA-A-1201-Q164","objective":"5.4","type":"diagnosis","source":"OBJ1201","locator":"Objective 5.4 stylus does not work","verified":"2026-10-10"} -->

---

### Q165
Several users on one floor report Wi-Fi that drops for a few seconds many times an hour, while wired PCs are stable and other floors are fine. What is the best lead?
- A) Every laptop needs a new battery
- B) The DHCP scope is too large
- C) The printer queue is stuck
- D) External interference or a failing access point on that floor

**Answer: D**
Localized wireless instability with healthy wired service isolates the problem to that area's RF environment or its access point: neighboring networks, microwave/gear interference, or failing AP hardware. A Wi-Fi analyzer survey is the next step.
<!-- {"id":"COMPTIA-A-1201-Q165","objective":"5.5","type":"diagnosis","source":"OBJ1201","locator":"Objective 5.5 intermittent wireless connectivity, external interference","verified":"2026-10-10"} -->

---

### Q166
A user complains the internet is "slow" on video calls: audio arrives in bursts and words clip. A speed test shows plenty of bandwidth but latency swinging from 20 ms to 400 ms. What is the name of the symptom actually hurting the call?
- A) Jitter
- B) Low bandwidth
- C) Port flapping
- D) APIPA addressing

**Answer: A**
Jitter is variation in packet arrival time, and real-time audio/video suffers from it even with ample bandwidth, producing bursts and clipping. Quality-of-service or a steadier connection path is the remedy; raw speed is not the issue.
<!-- {"id":"COMPTIA-A-1201-Q166","objective":"5.5","type":"diagnosis","source":"OBJ1201","locator":"Objective 5.5 jitter, poor VoIP quality","verified":"2026-10-10"} -->

---

### Q167
A switch port's link light cycles up and down every few seconds, and the connected PC's network drops with it. The cable and PC are verified good on another port. What is this symptom called, and what does the evidence point to?
- A) Port flapping; the switch port itself is suspect
- B) Jitter; the PC needs QoS
- C) High latency; the ISP is at fault
- D) APIPA; DHCP is down

**Answer: A**
A link that repeatedly goes up and down is port flapping. Swapping the known-good cable and PC to another port and seeing the problem stay behind isolates the switch port (or its configuration) as the failing element.
<!-- {"id":"COMPTIA-A-1201-Q167","objective":"5.5","type":"diagnosis","source":"OBJ1201","locator":"Objective 5.5 port flapping","verified":"2026-10-10"} -->

---

### Q168
A remote worker's VPN connects, but every website loads far slower than their home speed test suggests it should. A traceroute shows all traffic hairpinning through the office across the country. What explains the slowdown?
- A) A failing SSD
- B) The wrong print driver
- C) High latency added by routing all traffic through the distant VPN gateway
- D) A malware infection

**Answer: C**
Full-tunnel VPN sends even ordinary web browsing on a long detour through the office gateway, adding latency and office-uplink congestion. Split tunneling (where policy allows) or local breakout restores direct-path speed for general traffic.
<!-- {"id":"COMPTIA-A-1201-Q168","objective":"5.5","type":"diagnosis","source":"OBJ1201","locator":"Objective 5.5 high latency, slow network speeds","verified":"2026-10-10"} -->

---

### Q169
A user's laptop shows "connected, no internet" on the office Wi-Fi while colleagues are fine on the same network. An IP check shows a valid office address, gateway, and DNS. What is the most efficient next test?
- A) Replace the wireless card
- B) Reinstall the operating system
- C) Reset the office router
- D) Ping the gateway, then a public IP, then a hostname to find where the chain breaks

**Answer: D**
With addressing valid, the structured approach is testing connectivity hop by hop: gateway proves the local link, a public IP proves routing, and a hostname proves DNS. The first failure localizes the fault without touching hardware or other users' equipment.
<!-- {"id":"COMPTIA-A-1201-Q169","objective":"5.5","type":"diagnosis","source":"OBJ1201","locator":"Objective 5.5 limited connectivity, intermittent internet connectivity","verified":"2026-10-10"} -->

---

### Q170
A user cannot log into the company Wi-Fi though their password is correct on the portal. Other users connect fine, and the user's account shows three failed attempts then a lockout message in the wireless controller's log. What is the actual fault?
- A) A faulty access point
- B) An exhausted DHCP scope
- C) Authentication failure from an account lockout, not the wireless network itself
- D) Channel interference from a microwave

**Answer: C**
Correct-password failures with lockout entries in the controller log make this an account-side authentication problem. The fix is unlocking or resetting the account (and checking for a stale saved password on an old device causing the lockouts), not touching RF or addressing.
<!-- {"id":"COMPTIA-A-1201-Q170","objective":"5.5","type":"diagnosis","source":"OBJ1201","locator":"Objective 5.5 authentication failures","verified":"2026-10-10"} -->

---

### Q171
A home user says their internet "dies every night at 2 AM for ten minutes" and always recovers by itself. Neighbors on the same provider see the same thing. What is the most reasonable conclusion?
- A) The PC's CMOS battery is dead
- B) Provider-side maintenance or an upstream fault; document times and contact the ISP
- C) The user's PC has malware
- D) The router needs a new antenna

**Answer: B**
A clock-precise outage shared by multiple customers of one provider points upstream of every home: scheduled maintenance or a recurring line fault. Documenting exact times gives the ISP what it needs to investigate; local hardware cannot coordinate across households.
<!-- {"id":"COMPTIA-A-1201-Q171","objective":"5.5","type":"diagnosis","source":"OBJ1201","locator":"Objective 5.5 intermittent internet connectivity","verified":"2026-10-10"} -->

---

### Q172
A small office replaces its router, and afterward every device shows "limited connectivity." A check reveals all the PCs have addresses in 169.254.x.x. What is wrong with the new router?
- A) Its firewall blocks printers
- B) Its DHCP server is not handing out leases
- C) Its antennas are too short
- D) It only supports IPv6

**Answer: B**
APIPA (169.254.x.x) addresses across every device at once mean the network's DHCP service is absent, and the change that introduced it is the router swap. Enabling or fixing DHCP on the new router restores addressing for the whole office at once.
<!-- {"id":"COMPTIA-A-1201-Q172","objective":"5.5","type":"diagnosis","source":"OBJ1201","locator":"Objective 5.5 limited connectivity; 2.6 APIPA","verified":"2026-10-10"} -->

---

### Q173
A warehouse barcode scanner keeps losing its wireless connection near a new bank of industrial freezers, but works everywhere else. What is the most likely culprit?
- A) The toner being low
- B) External interference from the freezer motors disrupting the wireless band
- C) The scanner's screen resolution
- D) The DHCP lease time being too long

**Answer: B**
Location-bound wireless failure near heavy motor equipment is textbook RF interference. The remedies are surveying the spectrum, moving or shielding the source, changing channels/bands, or adding coverage away from the equipment.
<!-- {"id":"COMPTIA-A-1201-Q173","objective":"5.5","type":"diagnosis","source":"OBJ1201","locator":"Objective 5.5 external interference, intermittent wireless connectivity","verified":"2026-10-10"} -->

---

### Q174
A laser printer puts a thin vertical line down every page, in the same spot, whatever program prints. What is the most likely cause?
- A) Low disk space on the print server
- B) Debris or a scratch on the drum or a contaminant in the toner path
- C) The wrong paper size setting
- D) A failing network card

**Answer: B**
A repeating mark at a fixed position on every page, from every source, is inside the printer's imaging path: a scratched drum, debris on the cartridge, or contaminated optics. Cleaning (and if needed, cartridge replacement) is the fix; settings and network faults cannot draw lines.
<!-- {"id":"COMPTIA-A-1201-Q174","objective":"5.6","type":"diagnosis","source":"OBJ1201","locator":"Objective 5.6 lines down the printed pages","verified":"2026-10-10"} -->

---

### Q175
A printer outputs garbled symbols and random characters instead of the document, from several different PCs. A test page from the printer's own menu prints perfectly. What is the best lead?
- A) The drum is scratched
- B) The toner is low
- C) The paper is damp
- D) The shared driver or print processor is wrong or corrupted; the hardware is fine

**Answer: D**
A clean self-test page proves the engine and consumables; garbage from every PC points at the shared software layer: a wrong/corrupt driver or mismatched page-description language (such as sending PostScript to a PCL-only queue).
<!-- {"id":"COMPTIA-A-1201-Q175","objective":"5.6","type":"diagnosis","source":"OBJ1201","locator":"Objective 5.6 garbled print","verified":"2026-10-10"} -->

---

### Q176
The office printer shows twenty jobs stacked "pending" and nothing prints, though the printer itself is idle and online. What should the technician do first?
- A) Restart the print spooler service and clear the stuck queue
- B) Replace the toner
- C) Reinstall the printer's firmware
- D) Buy a print server

**Answer: A**
Jobs piling up while the device sits ready is the print spooler (or a corrupt job blocking the queue), not the hardware. Restarting the spooler and purging the jammed job restores flow; consumables and firmware are irrelevant to queue state.
<!-- {"id":"COMPTIA-A-1201-Q176","objective":"5.6","type":"diagnosis","source":"OBJ1201","locator":"Objective 5.6 multiple prints pending in queue","verified":"2026-10-10"} -->

---

### Q177
Every page from a laser printer has a faint duplicate of the content offset an inch down the page. What is this defect called, and what usually causes it?
- A) Banding; clogged ink nozzles
- B) Speckling; damp paper
- C) Misfeed; curled paper
- D) Ghosting (double/echo images); typically a worn drum or fuser not fully clearing

**Answer: D**
A repeated faint offset image is ghosting, caused when the drum or fuser fails to fully clear or fuse the previous image. It points at worn imaging components approaching their service interval. Banding and speckling have different appearances and causes.
<!-- {"id":"COMPTIA-A-1201-Q177","objective":"5.6","type":"recall","source":"OBJ1201","locator":"Objective 5.6 double/echo images on the print","verified":"2026-10-10"} -->

---

### Q178
A multifunction printer's stapler finisher leaves staple jams on every job, while printing itself is perfect. What is the correct approach?
- A) Replace the imaging drum
- B) Update the print driver on all PCs
- C) Disable duplex printing
- D) Clear the finisher's staple path and verify the correct staple cartridge is seated

**Answer: D**
Finishing faults live in the finisher accessory: staple jams come from misfed staples, a wrong or poorly seated cartridge, or debris in the staple path. The print engine, drivers, and duplex unit are separate from finishing.
<!-- {"id":"COMPTIA-A-1201-Q178","objective":"5.6","type":"diagnosis","source":"OBJ1201","locator":"Objective 5.6 finishing issues staple jams","verified":"2026-10-10"} -->

---

### Q179
A user reports their printed photos have random speckles and dots scattered across the page. The printer is a laser model used in a dusty back room. What is the likely cause and fix?
- A) The network is dropping packets
- B) Speckling from dust/debris inside the printer; clean the interior per the maintenance guide
- C) Wrong color profile on the PC
- D) The paper tray is too full

**Answer: B**
Random specks across prints in a dusty environment come from contamination on the imaging path (drum, rollers, optics). Cleaning the interior and relocating the printer away from dust resolves it; profiles and trays do not scatter dots randomly.
<!-- {"id":"COMPTIA-A-1201-Q179","objective":"5.6","type":"diagnosis","source":"OBJ1201","locator":"Objective 5.6 speckling on printed pages","verified":"2026-10-10"} -->

---

### Q180
A printer insists its second tray is empty and will not pull from it, though the tray is loaded and seated. Swapping trays between slots moves the error to the other slot. What does this tell the technician?
- A) The driver needs updating
- B) The tray itself is defective (sensor flag or guide), not the printer's slot
- C) The printer's firmware is corrupt
- D) The network cable is bad

**Answer: B**
Swapping components to see whether the fault follows the part or stays with the slot is isolate-by-halves in action. The error moving with the tray convicts the tray's sensor flag or guides; had it stayed, the printer's slot sensor would be suspect.
<!-- {"id":"COMPTIA-A-1201-Q180","objective":"5.6","type":"diagnosis","source":"OBJ1201","locator":"Objective 5.6 tray not recognized","verified":"2026-10-10"} -->

---
