# CompTIA A+ Core 2 — Domain 4 beginner bank (operational procedures)

## Domain 4: Operational Procedures (220-1202)

---

### Q84
A production switch is replaced at 02:00 without prior review because the office is offline. Which follow-up is required by change management?
- A) Nothing, because the change was necessary
- B) A new change request for the next switch replacement
- C) A post-change review to document what was done and why
- D) A rollback of the replacement to restore the original switch

**Answer: C**
An emergency change skips the advance review but not the record; the post-change review is what keeps the exception from becoming the normal process. Doing nothing (A) is exactly how emergency changes turn into unmanaged ones. A future request (B) does not document this event. Rolling back a working replacement (D) would recreate the outage.

---

### Q85
A technician plans to apply a configuration change to a file server on Friday evening. What should the plan include before the change is made?
- A) A rollback step and a verification step
- B) A list of every user who might notice
- C) A new server purchased as a spare
- D) A promise to complete the work before Monday

**Answer: A**
A change plan names how to undo the change if it fails and how to prove it worked, which is what makes the change recoverable and verifiable. A list of affected users (B) is useful context but not a recovery plan. A spare server (C) is not required for a configuration change. A deadline (D) is an intention, not a procedure.

---

### Q86
A small business keeps its only backup on an external drive that sits next to the server. Which change best follows the 3-2-1 principle?
- A) Buy a larger external drive
- B) Copy the backup to a second folder on the same drive
- C) Compress the backup to save space
- D) Keep a second copy off site, on different media

**Answer: D**
The 3-2-1 principle asks for several copies, on different media, with at least one somewhere else, so a fire, theft or ransomware event cannot take them all. A larger drive (A) and a second folder on the same drive (B) share the same failure. Compression (C) reduces size without changing location.

---

### Q87
A backup schedule runs a full backup on Sunday and differential backups each other day. A drive fails on Friday. How many backup sets are needed to restore?
- A) Friday's differential only
- B) Sunday's full plus Friday's differential
- C) Sunday's full plus every daily backup through Friday
- D) Every differential from Monday through Friday

**Answer: B**
A differential contains everything changed since the last full backup, so the full plus the most recent differential restores the system. Friday's differential alone (A) lacks the base. A full plus every daily file (C) describes an incremental chain, not a differential set. All differentials (D) would still lack the base full backup.

---

### Q88
A technician is about to install memory in a desktop on a carpeted floor. Which precaution most directly protects the components?
- A) Wear an anti-static wrist strap connected to the chassis
- B) Work with the power supply switched on
- C) Hold the modules by their gold contacts
- D) Place the modules on the carpet while working

**Answer: A**
An anti-static strap equalizes charge between the technician and the chassis, which is the control for electrostatic discharge. Leaving power on (B) adds an electrical hazard. Touching the contacts (C) deposits oils and can damage the connection. Placing modules on carpet (D) is the exact exposure the strap prevents.

---

### Q89
A phone's back cover is lifting and the device is warm even when idle. What should the technician do?
- A) Press the cover back down and continue using it
- B) Charge it fully to check whether the battery recovers
- C) Stop using it and replace the battery through a proper repair
- D) Place it in a freezer to cool it down

**Answer: C**
A swollen battery is a physical safety hazard: the cell has expanded and can rupture or ignite, so the device is taken out of service and the battery replaced by a qualified repair. Pressing the cover down (A) hides the problem. Charging (B) adds risk. Freezing (D) does not reverse the swelling and adds condensation damage.

---

### Q90
A laser printer jams repeatedly and the paper is warm and curled when removed. Which component should be checked?
- A) The network adapter
- B) The fuser assembly
- C) The paper tray size setting
- D) The print spooler service

**Answer: B**
The fuser melts toner with heat and pressure, so warm, curled paper at the jam point points at the fuser or its temperature control. The network adapter (A) affects connectivity, not paper. A tray size setting (C) can cause jams but does not explain the heat. The spooler (D) manages print jobs in software.

---

### Q91
A technician must dispose of an old laptop battery. Which action is correct?
- A) Place it in the office trash
- B) Store it in a desk drawer indefinitely
- C) Discharge it completely and throw it away
- D) Take it to a designated battery recycling point

**Answer: D**
Lithium-ion cells are hazardous waste and are collected through designated recycling or hazardous-waste channels. General trash (A) is prohibited and a fire risk in collection vehicles. Indefinite storage (B) leaves a hazard in place. Full discharge (C) does not make the cell safe for disposal.

---

### Q92
A workstation loses power for a second during a storm and reboots, losing unsaved work. Which device most directly prevents this?
- A) A UPS with battery backup
- B) A surge protector
- C) A larger power supply
- D) A second monitor

**Answer: A**
A UPS carries the machine through a brief outage on battery, so work continues and the machine shuts down cleanly if the outage lasts. A surge protector (B) clamps voltage spikes and provides no ride-through. A larger power supply (C) changes capacity, not continuity. A monitor (D) is unrelated.

---

### Q93
A server closet is warm, and the equipment's intake vents are blocked by stacked boxes. Which category of condition should be corrected?
- A) The server's clock drift and the cable labels
- B) The keyboard layout and the screen resolution
- C) Airflow and ambient temperature
- D) The printer driver and the scan settings

**Answer: C**
Blocked intake vents and a warm room are airflow and ambient-temperature problems, and both are corrected by clearing the vents and cooling the space. Clock drift and labels (A) are documentation and time issues. Keyboard and display settings (B) are user preferences. Printer and scanner settings (D) belong to the printer.

---

### Q94
A user pastes a customer's full name, address and account number into a ticket description. What is the main concern?
- A) The ticket will be too long to read
- B) Personal data is stored where it may not be protected
- C) The customer's name will slow the search function
- D) The ticket system cannot store names

**Answer: B**
Tickets are records that many people may read, and personal data placed there must be minimized and protected under privacy rules, so the description should identify the customer without exposing unnecessary personal detail. Length (A) is a readability issue. Search performance (C) is irrelevant. Tickets can store names (D), which is precisely why the exposure matters.

---

### Q95
A user asks the technician to install a consumer application that the company has not licensed. What is the correct response?
- A) Install it and add a note to the ticket
- B) Install a trial version and let it expire
- C) Install it only on one machine
- D) Decline and explain the licensing requirement

**Answer: D**
Unlicensed software is a legal and security exposure for the organization, so the request is declined and the licensing route explained. Installing it with a note (A) records the violation rather than preventing it. A trial copy used for production work (B) violates the trial terms. Limiting it to one machine (C) does not create a license.

---

### Q96
A technician sees a colleague sharing a customer's spreadsheet in a public chat channel. What should the technician do?
- A) Report it through the organization's incident or policy channel
- B) Post a warning in the same public channel
- C) Ignore it because the colleague is senior
- D) Copy the file to a personal drive for safekeeping

**Answer: A**
Exposing customer data is a policy incident, and the correct path is the organization's reporting process, which can remove the file and assess the exposure. Replying in the same channel (B) propagates the problem. Ignoring it (C) leaves the data exposed. Copying it elsewhere (D) creates another unauthorized copy.

---

### Q97
A user is angry and speaking loudly about a recurring fault. Which response best follows professional communication practice?
- A) Match the user's tone so they know the technician is serious
- B) Explain that the fault is the user's own fault
- C) Let the user finish, acknowledge the impact, and state the next step
- D) Transfer the call without explanation

**Answer: C**
Letting the user finish, acknowledging the effect and stating what happens next de-escalates the conversation and keeps it focused on the fix. Matching the tone (A) escalates. Blaming the user (B) ends cooperation. An unexplained transfer (D) restarts the frustration somewhere else.

---

### Q98
A technician explains a fix to a non-technical user using terms such as subnet mask, DHCP lease and ARP cache. What should change?
- A) Use plain language and confirm the user understands the outcome
- B) Speak more slowly while keeping the same terms
- C) Send the explanation as a technical document
- D) Ask the user to look the terms up later

**Answer: A**
The purpose is for the user to understand what was wrong and what to do next, which requires plain language and a check that the message landed. Slower delivery (B) does not make jargon clearer. A technical document (C) repeats the problem in another form. Sending the user to research (D) shifts the work to them.

---

### Q99
A technician is on a support call with a customer and takes a personal call on another phone at the same time. Which professional practice is being violated?
- A) Avoiding jargon
- B) Setting expectations
- C) Documenting the ticket
- D) Giving the customer full attention

**Answer: D**
Support calls require the technician's attention, and splitting it between two conversations signals that the customer is not a priority. Jargon (A) concerns word choice, expectation setting (B) concerns timelines, and documentation (C) concerns the record; none describes divided attention.

---

### Q100
A technician wants to automate a repeated sequence of Windows commands that will run by double-clicking a file. Which file type fits?
- A) A .ps1 file double-clicked with the default association
- B) A .bat or .cmd batch file
- C) A .py file double-clicked with no interpreter installed
- D) A .vbs file renamed to .txt

**Answer: B**
A batch file runs its commands in the Windows command interpreter by default when opened, which is the simplest way to make a double-clickable sequence. A PowerShell script (A) commonly does not run on double-click without an interpreter and policy allowance. A Python file (C) needs an installed interpreter. Renaming a script to .txt (D) turns it into text.

---

### Q101
A script must process every file in a folder and rename each one. Which programming construct repeats the same set of steps for each file?
- A) A comment
- B) A variable
- C) An exit code
- D) A loop

**Answer: D**
A loop runs a block of steps repeatedly, once per item in the folder, which is exactly the requirement. A comment (A) documents code without executing it. A variable (B) stores a value. An exit code (C) reports a result to the caller.

---

### Q102
Before running a script downloaded from an unknown source, what should a technician do?
- A) Read it and confirm what it does, or do not run it
- B) Run it as administrator to avoid permission errors
- C) Disable the antivirus so it completes faster
- D) Rename it to .txt and run it

**Answer: A**
An unknown script is executable code from an untrusted source, so it is read and understood first, and if that is not possible it is not run. Elevating it (B) increases the damage if it is malicious. Disabling protection (C) removes the control that might catch it. Renaming a file (D) changes nothing about what executes.

---

### Q103
A technician must reach a Windows desktop in another office over the network. Which protocol and default port are involved?
- A) SSH on port 22
- B) VNC on port 5900
- C) RDP on port 3389
- D) HTTP on port 80

**Answer: C**
Remote Desktop Protocol is the Windows remote desktop service and listens on 3389 by default. SSH (A) is a secure command-line protocol, not the Windows desktop service. VNC (B) is a different remote framebuffer product. HTTP (D) serves web content.

---

### Q104
An administrator needs to reach an internal server from home. Which sequence uses the existing security controls correctly?
- A) Publish the server's remote desktop port directly to the internet
- B) Connect to the company VPN, then use the internal remote access tool
- C) Use a public file-sharing site to exchange the session
- D) Disable the firewall on the server for the duration

**Answer: B**
The VPN puts the remote device on the internal network with the organization's authentication and access rules, and the remote tool is then used as it is on site. Exposing the port (A) creates an internet-facing service. A file-sharing site (C) cannot carry a remote session and exposes data. Disabling the firewall (D) removes protection from the server.

---

### Q105
A third-party support vendor asks to connect to a user's machine using a remote-control tool. Which practice is correct?
- A) Give the vendor the local administrator password for the machine
- B) Let the vendor connect at any time without notice
- C) Verify the request through a known contact and supervise the session
- D) Disable logging so the session is faster

**Answer: C**
Verification through a channel already trusted plus an attended, supervised session limits what the vendor can do and keeps a record. Handing over an administrator password (A) grants standing access. Unattended access (B) leaves the machine open. Disabling logging (D) removes the evidence.

---

### Q106
A technician asks an AI assistant to explain a configuration error. The answer sounds confident but cites a setting that does not exist in the product. What should the technician do?
- A) Apply the setting anyway and observe the result on a production system
- B) Assume the product documentation is out of date
- C) Ask the same assistant again and accept a repeat answer
- D) Verify the answer against the vendor documentation before acting

**Answer: D**
Generated explanations can be plausible and wrong, so a claim about a specific setting is checked against the source that governs it before anything is changed. Trying it on production (A) risks an outage. Blaming the documentation (B) inverts the burden of proof. Repeating the question (C) does not make the answer correct.

---

### Q107
A technician wants help drafting a troubleshooting note and pastes a customer's account details into an AI tool. What is the problem?
- A) The AI tool will respond more slowly
- B) Confidential data has left the organization's control
- C) The note will be too detailed
- D) The AI tool cannot read account numbers

**Answer: B**
Sending data to an external service discloses it outside the organization's systems, which is a privacy and policy issue regardless of the tool's convenience. Response speed (A) is irrelevant. Detail (C) is a writing choice. The tool can read such data (D), which is exactly the exposure.

---

### Q108
Which use of an AI assistant is appropriate during a hardware repair?
- A) Letting it decide which component to replace without testing
- B) Sending it the customer's data so it can recommend a vendor
- C) Using it to draft a checklist that the technician then verifies
- D) Accepting its output as the final resolution note without review

**Answer: C**
Drafting a checklist is a good use: the assistant produces a starting point and the technician, who can see the machine, verifies it. Letting it choose parts untested (A) replaces diagnosis with a guess. Sending customer data (B) discloses confidential information to an external service. Unreviewed output as the permanent record (D) puts an unverified claim into the ticket.
