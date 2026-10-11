# CompTIA A+ Core 2 (220-1202) Practice Questions - Part 3
# Original study items. Independent material, not official or endorsed by CompTIA.

## DOMAIN 2: Security (study allocation)

---

### Q121
A user insists their 8-character dictionary-word password is "fine because it has a number at the end." What is the accurate guidance?
- A) Passwords should be the username for consistency
- B) Eight characters is the legal maximum
- C) Length and unpredictability matter most; a passphrase of several random words beats a short word plus a digit
- D) One number makes any word uncrackable

**Answer: C**
Attackers crack short dictionary-based passwords with rule-based guessing (word plus digit is the first rule tried). Long passphrases of unrelated words resist both guessing and brute force while staying memorable, ideally unique per site in a manager.
<!-- {"id":"COMPTIA-A-1202-Q121","objective":"2.1","type":"recall","source":"OBJ1202","locator":"Objective 2.1 security measures, password practices","verified":"2026-10-10"} -->

---

### Q122
An office wants visitors to have internet access without touching the internal network or sharing the staff Wi-Fi passphrase. What should the technician configure on the wireless router?
- A) A guest network with client isolation
- B) The staff passphrase written at the front desk
- C) WEP for guests
- D) Remote management open to all

**Answer: A**
A guest SSID with client isolation gives visitors internet-only access, keeping them off internal resources and unable to reach each other or staff devices. Sharing the staff passphrase hands every visitor the keys to the internal network.
<!-- {"id":"COMPTIA-A-1202-Q122","objective":"2.10","type":"diagnosis","source":"OBJ1202","locator":"Objective 2.10 SOHO wireless security settings, guest network","verified":"2026-10-10"} -->

---

### Q123
A user installs a browser extension that asks to "read and change all your data on all websites." The extension's stated purpose is to change the cursor color. What should the user do?
- A) Uninstall the browser instead
- B) Decline; the permission vastly exceeds the stated function, a classic red flag
- C) Accept; extensions are always safe
- D) Accept, but only on banking sites

**Answer: B**
Permission scope should match function. A cursor theme needing full read/write on every site can skim anything, including credentials. Reviewing requested permissions before installing is a core browser-security habit.
<!-- {"id":"COMPTIA-A-1202-Q123","objective":"2.11","type":"diagnosis","source":"OBJ1202","locator":"Objective 2.11 browser security settings, extensions","verified":"2026-10-10"} -->

---

### Q124
A company requires that ex-employees' old files remain accessible to their managers, but the accounts must be unusable. What is the correct account handling?
- A) Give the password to the whole team
- B) Disable the account and transfer/re-share file ownership to the manager
- C) Delete the account and all files immediately
- D) Leave the account active with the same password

**Answer: B**
Disabling preserves the account's data while ending its usability; ownership transfer keeps business access. Deletion destroys needed records, and leaving it active or sharing its password keeps a live, unaudited door open.
<!-- {"id":"COMPTIA-A-1202-Q124","objective":"2.2","type":"diagnosis","source":"OBJ1202","locator":"Objective 2.2 Windows security settings, account management","verified":"2026-10-10"} -->

---

### Q125
A user wants to check whether a login page is genuine before typing credentials. What are the two best checks? (Choose two.)
- A) The exact domain name in the address bar, letter by letter
- B) That the connection uses HTTPS with a valid certificate for that domain
- C) That the page has the company logo
- D) That the page loads quickly
- E) That the page was emailed as a link

**Correct Answer: A, B**
Phishers clone logos and layouts, but they cannot fake the real domain or a valid certificate for it. Reading the domain carefully (watching for lookalike spellings) and checking the certificate catches the vast majority of credential traps.
<!-- {"id":"COMPTIA-A-1202-Q125","objective":"2.11","type":"diagnosis","source":"OBJ1202","locator":"Objective 2.11 browser security, phishing indicators","verified":"2026-10-10"} -->

---

### Q126
A small office wants its NAS backups protected from ransomware that encrypts mapped drives. Which backup property defeats this?
- A) Backups that are offline, offsite, or immutable (not writable from the client machines)
- B) Backups saved as a mapped drive on the same PCs
- C) Backups emailed to the same account being protected
- D) Screenshots of the files

**Answer: A**
Ransomware encrypts everything the infected machine can write, including mapped backup drives. Backups that are offline, offsite, or write-protected/immutable stay out of reach, which is the entire logic of the 3-2-1 rule's offline copy.
<!-- {"id":"COMPTIA-A-1202-Q126","objective":"2.4","type":"diagnosis","source":"OBJ1202","locator":"Objective 2.4 malware prevention, backup protection","verified":"2026-10-10"} -->

---

### Q127
A user's smart doorbell camera ships with a well-known default password printed in its quick-start card. What is the security task at setup?
- A) Change the default credentials before connecting it to the network
- B) Keep them; defaults are safer
- C) Share them with the neighborhood for convenience
- D) Disable the doorbell's encryption to match

**Answer: A**
Default credentials are published knowledge and the first thing automated scanners try, especially on internet-exposed IoT. Changing them at setup is as fundamental as locking a new door.
<!-- {"id":"COMPTIA-A-1202-Q127","objective":"2.7","type":"recall","source":"OBJ1202","locator":"Objective 2.7 hardening, default credentials","verified":"2026-10-10"} -->

---

### Q128
A parent wants their child's tablet to allow only age-appropriate apps and set a bedtime shutdown. What built-in category of settings provides this?
- A) The developer options menu
- B) The hotspot settings
- C) The keyboard dictionary
- D) Parental/family controls (screen time and content restrictions)

**Answer: D**
Family/parental control features manage content ratings, purchase approval, app access, and schedules per child account. Developer options and radios have no content governance.
<!-- {"id":"COMPTIA-A-1202-Q128","objective":"2.8","type":"recall","source":"OBJ1202","locator":"Objective 2.8 securing mobile devices, controls","verified":"2026-10-10"} -->

---

### Q129
A user's laptop bag with the laptop inside was stolen, and the disk was encrypted with the user's sign-in. A week later, the user's online accounts show no suspicious logins. What protected the data, and what residual step is still wise?
- A) The thief could not guess the wallpaper
- B) Nothing; encryption is irrelevant to theft
- C) Full-disk encryption kept the data unreadable; still rotate key passwords as a precaution
- D) The laptop's weight deterred the thief

**Answer: C**
Encryption is exactly the control that turns a stolen machine into stolen hardware only. Prudent follow-through is changing important passwords and watching account activity, since theft motives and methods vary.
<!-- {"id":"COMPTIA-A-1202-Q129","objective":"2.2","type":"diagnosis","source":"OBJ1202","locator":"Objective 2.2 Windows security, encryption outcomes","verified":"2026-10-10"} -->

---

## DOMAIN 3: Software Troubleshooting (study allocation)

---

### Q130
A user's PC displays a "limited" network connection after they typed a static address by hand. They used 192.168.1.55 with a mask of 255.255.0.0 while every other device uses 255.255.255.0. Why might this break things?
- A) Static addresses never work
- B) The PC needs a new network card
- C) The wrong mask changes which addresses the PC considers local, breaking gateway and peer communication
- D) The mask only affects wireless networks

**Answer: C**
The subnet mask defines the local network boundary; a wider mask makes the PC try to reach the gateway and remote-looking addresses directly on the wire, which fails. Matching the network's documented mask (or reverting to DHCP) fixes it.
<!-- {"id":"COMPTIA-A-1202-Q130","objective":"3.1","type":"diagnosis","source":"OBJ1202","locator":"Objective 3.1 Windows OS issues, network configuration","verified":"2026-10-10"} -->

---

### Q131
A Windows laptop cannot print to the office printer though others can, and its queue shows "offline." The printer pings fine from the laptop. What is the fastest fix attempt?
- A) Reinstall Windows
- B) Remove and re-add the printer (or restart the local spooler) to rebuild the corrupted queue binding
- C) Replace the printer
- D) Reflash the router

**Answer: B**
A stuck "offline" queue with a reachable printer is a local binding problem. Re-adding the printer or restarting the spooler rebuilds it in minutes; hardware and OS replacement are wildly out of proportion.
<!-- {"id":"COMPTIA-A-1202-Q131","objective":"3.1","type":"diagnosis","source":"OBJ1202","locator":"Objective 3.1 Windows OS issues, printing","verified":"2026-10-10"} -->

---

### Q132
A user reports the screen "turned sideways" after their cat walked across the keyboard. What likely happened and how is it fixed?
- A) The monitor needs degaussing
- B) The cat deleted the driver
- C) A display-rotation hotkey was pressed; set orientation back to landscape in display settings
- D) The GPU is dying; replace it

**Answer: C**
Keyboard rotation shortcuts flip the display instantly and match the trigger perfectly. Restoring orientation in display settings (or the same hotkey) undoes it in seconds. No hardware fault produces a sudden, perfectly rotated image.
<!-- {"id":"COMPTIA-A-1202-Q132","objective":"3.1","type":"diagnosis","source":"OBJ1202","locator":"Objective 3.1 Windows OS issues, display settings","verified":"2026-10-10"} -->

---

### Q133
After installing a second antivirus "for extra safety," a PC became drastically slower with frequent freezes. What is the problem?
- A) The second antivirus is always a virus
- B) Two real-time antivirus engines conflict, scanning each other's activity
- C) The PC has too much RAM
- D) The monitor cable is loose

**Answer: B**
Concurrent real-time scanners fight over file access, multiplying CPU and disk load. The fix is keeping one reputable real-time engine and using the other only as an on-demand second opinion (or removing it).
<!-- {"id":"COMPTIA-A-1202-Q133","objective":"3.4","type":"diagnosis","source":"OBJ1202","locator":"Objective 3.4 PC security issues, software conflicts","verified":"2026-10-10"} -->

---

### Q134
A phone restarts by itself several times a day after a drop, and the battery percentage jumps erratically. Apps were ruled out in safe mode. What is the most likely cause?
- A) A bad ringtone
- B) The carrier's 5G is too fast
- C) Hardware damage from the drop, likely a loose battery connector or failing battery
- D) Too many photos

**Answer: C**
Random reboots with erratic battery readings, correlated with physical trauma and clean in safe mode, point at power hardware. A reseat or battery replacement by a service shop is the remedy.
<!-- {"id":"COMPTIA-A-1202-Q134","objective":"3.2","type":"diagnosis","source":"OBJ1202","locator":"Objective 3.2 mobile OS issues, reboots","verified":"2026-10-10"} -->

---

### Q135
A Windows PC's sound stopped after an update, and Device Manager shows the audio device with a warning icon. What is the first fix attempt?
- A) Replace the sound card immediately
- B) Update or roll back the audio driver from Device Manager
- C) Buy new speakers
- D) Mute and unmute repeatedly

**Answer: B**
A driver warning icon appearing right after an update localizes the fault to the driver. Rolling back to the prior driver (or installing the corrected one) restores sound; hardware swaps come only if driver work fails.
<!-- {"id":"COMPTIA-A-1202-Q135","objective":"3.1","type":"diagnosis","source":"OBJ1202","locator":"Objective 3.1 Windows OS issues, drivers","verified":"2026-10-10"} -->

---

### Q136
A user reports the cursor moves on its own and windows open by themselves, but only during their weekly remote-support session with the company's IT desk. Is this malware?
- A) The mouse is dirty
- B) The keyboard is possessed
- C) No - it is the technician's remote-control session; verify the session is with known IT before allowing it
- D) Yes, always - wipe the PC immediately

**Answer: C**
Remote-control sessions legitimately move the cursor and open windows; the security habit is verifying the session is expected and with the real support desk before granting control. Unsolicited "support" calls requesting control are the scam version.
<!-- {"id":"COMPTIA-A-1202-Q136","objective":"3.4","type":"diagnosis","source":"OBJ1202","locator":"Objective 3.4 PC security issues, remote access awareness","verified":"2026-10-10"} -->

---

### Q137
A Windows laptop's Wi-Fi toggle is missing entirely, and Device Manager shows no wireless adapter at all after a drop. What is the likely fault?
- A) The Wi-Fi password expired
- B) The router is too far away
- C) The OS forgot the SSID
- D) The wireless card was unseated or damaged by the impact

**Answer: D**
A device that vanishes from Device Manager after physical shock is a hardware-level problem: the OS cannot see the card at all. Reseating or replacing the card is the fix; software and RF explanations all presuppose a visible adapter.
<!-- {"id":"COMPTIA-A-1202-Q137","objective":"3.1","type":"diagnosis","source":"OBJ1202","locator":"Objective 3.1 Windows OS issues, hardware detection","verified":"2026-10-10"} -->

---

### Q138
A PC displays a "reboot and select proper boot device" message after the user installed a second drive. What is the most likely cause?
- A) Windows was deleted by the new drive
- B) The monitor is incompatible
- C) The RAM is incompatible with two drives
- D) The boot order changed or the system drive's cable was disturbed during the install

**Answer: D**
Adding a drive often reorders boot priority or loosens the original drive's connections. Checking the boot order and reseating the system drive's cables restores the boot in almost every case.
<!-- {"id":"COMPTIA-A-1202-Q138","objective":"3.1","type":"diagnosis","source":"OBJ1202","locator":"Objective 3.1 Windows OS issues, boot errors","verified":"2026-10-10"} -->

---

### Q139
A tablet's rotation stopped working for all apps after a recent fall, though the orientation lock is off. What hardware does this implicate?
- A) The charging coil
- B) The front camera
- C) The accelerometer/gyroscope sensors
- D) The Wi-Fi antenna

**Answer: C**
Screen rotation is driven by the motion sensors; a system-wide loss after an impact, with software toggles ruled out, points at damaged or disconnected sensors. Diagnosis and repair are a service-center task.
<!-- {"id":"COMPTIA-A-1202-Q139","objective":"3.2","type":"diagnosis","source":"OBJ1202","locator":"Objective 3.2 mobile OS issues, sensors","verified":"2026-10-10"} -->

---

### Q140
A PC repeatedly freezes for thirty seconds, then recovers, with disk activity pegged during the stalls. S.M.A.R.T. shows the system SSD is healthy, but the secondary hard drive shows pending sectors. What explains the stalls?
- A) The failing secondary drive is stalling I/O as it retries bad sectors
- B) The SSD needs replacement
- C) The page file is too large
- D) The monitor is flickering

**Answer: A**
Freezes aligned with disk saturation and a drive reporting pending sectors fit a drive struggling through retries. Backing up and replacing that drive ends the stalls; the healthy SSD and display are uninvolved.
<!-- {"id":"COMPTIA-A-1202-Q140","objective":"3.1","type":"diagnosis","source":"OBJ1202","locator":"Objective 3.1 Windows OS issues, storage symptoms","verified":"2026-10-10"} -->

---

### Q141
A user reports the PC "gets slower the longer it runs," recovering after every reboot. One app's memory usage climbs steadily all day without releasing any. What is this called?
- A) A fragmented registry
- B) An overheating NIC
- C) A memory leak in that application
- D) Normal disk caching

**Answer: C**
Steadily growing, never-released memory consumption in one process is a memory leak; reboots reset it, which matches the pattern. Updating or replacing the app is the durable fix; more RAM only delays the symptom.
<!-- {"id":"COMPTIA-A-1202-Q141","objective":"3.1","type":"diagnosis","source":"OBJ1202","locator":"Objective 3.1 Windows OS issues, performance","verified":"2026-10-10"} -->

---

### Q142
A user gets "this app can't run on your PC" installing a program downloaded for the wrong platform. What should they verify before trying again?
- A) The application's OS and architecture requirements (32 vs 64-bit, Windows vs macOS)
- B) The monitor's color depth
- C) The keyboard language
- D) The printer's driver

**Answer: A**
That error means the binary does not match the operating system or CPU architecture. Downloading the correct build for the actual platform fixes it; display and input settings are unrelated.
<!-- {"id":"COMPTIA-A-1202-Q142","objective":"3.1","type":"diagnosis","source":"OBJ1202","locator":"Objective 3.1 Windows OS issues, compatibility","verified":"2026-10-10"} -->

---

### Q143
A phone's Bluetooth keeps disconnecting from the car, but only since a big OS update. Other phones pair with the car fine. What is the best first fix?
- A) Factory reset the car
- B) Disable Wi-Fi calling
- C) Forget the car pairing and re-pair from scratch; update the car's firmware if available
- D) Replace the phone's screen

**Answer: C**
Pairing state can go stale across OS updates while the hardware on both sides remains proven good. Rebuilding the pairing is the cheap fix; deeper resets come only if re-pairing fails.
<!-- {"id":"COMPTIA-A-1202-Q143","objective":"3.2","type":"diagnosis","source":"OBJ1202","locator":"Objective 3.2 mobile OS issues, Bluetooth","verified":"2026-10-10"} -->

---

### Q144
A user reports their laptop "dies instantly" when unplugged, showing 60 percent battery seconds before. What does this indicate?
- A) A failing battery whose reported charge is unreliable; calibrate or replace it
- B) A broken power button
- C) A full hard drive
- D) A slow Wi-Fi card

**Answer: A**
Instant shutdown at a reported mid-charge is the classic sign of a worn battery (or a broken gauge): the cells cannot deliver load and the estimate is fiction. Calibration may fix the gauge; replacement fixes the cells.
<!-- {"id":"COMPTIA-A-1202-Q144","objective":"3.2","type":"diagnosis","source":"OBJ1202","locator":"Objective 3.2 mobile OS issues, battery","verified":"2026-10-10"} -->

---

## DOMAIN 4: Operational Procedures (study allocation)

---

### Q145
A technician fixes a user's printer and is about to leave. What two things close out the visit properly? (Choose two.)
- A) Verify the fix with the user doing their own normal task
- B) Document what was done in the ticket
- C) Delete the ticket so the queue looks clean
- D) Leave without mentioning the cause
- E) Install a personal screensaver as a signature

**Correct Answer: A, B**
Verification with the user proves the real workflow works, and documentation lets the next tech (and the metrics) build on the visit. Deleting records or skipping the explanation recreates the same call next week.
<!-- {"id":"COMPTIA-A-1202-Q145","objective":"4.1","type":"diagnosis","source":"OBJ1202","locator":"Objective 4.1 documentation and support systems","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q146
A network admin wants to replace the office firewall Saturday night. Which change-management elements belong in the plan? (Choose three.)
- A) A documented backout/rollback plan
- B) Approval through the change process before the work
- C) Scheduled timing with affected users notified
- D) Keeping the plan secret from management
- E) Skipping any testing to save time

**Correct Answer: A, B, C**
Change control exists to prevent surprise outages: documented plan, approval, scheduled window, communication, and a way back if it fails. Secrecy and skipped testing are the exact behaviors change management forbids.
<!-- {"id":"COMPTIA-A-1202-Q146","objective":"4.2","type":"recall","source":"OBJ1202","locator":"Objective 4.2 change management procedures","verified":"2026-10-10"} -->

---

### Q147
A junior tech asks why they cannot just "fix the server now" during lunch instead of filing a change request for tonight. What is the correct reason?
- A) Forms make the work more fun
- B) Change boards exist to slow down good techs
- C) Lunch breaks are mandatory by law
- D) Uncontrolled changes cause untracked outages and conflicts; the process protects users and the tech

**Answer: D**
Change management coordinates who is affected, when, and how to reverse course. Midday unapproved changes have no backout coordination, no notice, and no record, which is how small fixes become company-wide outages.
<!-- {"id":"COMPTIA-A-1202-Q147","objective":"4.2","type":"diagnosis","source":"OBJ1202","locator":"Objective 4.2 apply change management","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q148
A small business has one external USB drive holding its only backup, plugged into the server 24/7. Ransomware encrypts the server and the attached drive. Which rule was broken?
- A) Never test restores
- B) Store backups next to the server for convenience
- C) Backups are unnecessary with antivirus
- D) Keep at least one backup copy offline/offsite and out of reach of the production machine

**Answer: D**
A permanently attached backup shares the fate of whatever infects the host. The 3-2-1 concept (three copies, two media, one offsite/offline) exists precisely so one incident cannot take production and backup together.
<!-- {"id":"COMPTIA-A-1202-Q148","objective":"4.3","type":"diagnosis","source":"OBJ1202","locator":"Objective 4.3 workstation backup and recovery methods","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q149
A user accidentally deletes a folder of family photos. Their PC has file-history backups enabled to an external drive. What is the correct first action?
- A) Reinstall the photo app
- B) Restore the folder from the backup history immediately
- C) Run disk defragmenter first
- D) Empty the Recycle Bin to be thorough

**Answer: B**
The whole point of continuous file-history backup is point-in-time recovery of deleted items. Restoring promptly (before doing anything write-heavy to the disk) recovers the photos through the supported path.
<!-- {"id":"COMPTIA-A-1202-Q149","objective":"4.3","type":"diagnosis","source":"OBJ1202","locator":"Objective 4.3 backup and recovery methods","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q150
A company backup schedule "completes successfully" every night, but during an incident the team discovers the backups cannot actually be restored. What practice would have caught this?
- A) Periodic test restores to prove the backups are usable
- B) Trusting the green checkmark
- C) Backing up more often
- D) Larger backup drives

**Answer: A**
A backup is only proven by a successful restore. Scheduled test restores validate media, permissions, and process; untested backups are a hope, not a control. Frequency and capacity do nothing for restorability.
<!-- {"id":"COMPTIA-A-1202-Q150","objective":"4.3","type":"diagnosis","source":"OBJ1202","locator":"Objective 4.3 backup and recovery, testing","verified":"2026-10-10"} -->

---

### Q151
A technician must open a PC power supply to "check a fuse." What is the correct safety response?
- A) Open it only while it is plugged in
- B) Wear wool gloves and proceed
- C) Do not open it; power supplies hold dangerous stored charge even unplugged - replace the unit instead
- D) Open it carefully with a metal screwdriver

**Answer: C**
Power supply capacitors retain lethal charge after disconnection, and there are no user-serviceable parts inside. The safe practice is unit replacement. Opening one is a standing electrical-safety violation.
<!-- {"id":"COMPTIA-A-1202-Q151","objective":"4.4","type":"recall","source":"OBJ1202","locator":"Objective 4.4 common safety procedures, electrical","verified":"2026-10-10"} -->

---

### Q152
A technician is about to install a motherboard. What simple habit protects components from invisible electrostatic damage?
- A) Use an anti-static wrist strap (or regularly ground yourself on the chassis) and handle boards by the edges
- B) Work on a carpet in socks for comfort
- C) Rub the board with a cloth first
- D) Wear rubber boots only

**Answer: A**
Electrostatic discharge far below what a person can feel can wound electronics. A wrist strap (or disciplined chassis grounding) plus edge handling keeps you and the board at the same potential. Carpet and socks generate static.
<!-- {"id":"COMPTIA-A-1202-Q152","objective":"4.4","type":"recall","source":"OBJ1202","locator":"Objective 4.4 safety procedures, ESD","verified":"2026-10-10"} -->

---

### Q153
A tech needs to move a rack-mounted UPS and server down a flight of stairs. What is the safe approach?
- A) Carry both at once to save trips
- B) Drag them by their power cords
- C) Roll them down the stairs slowly
- D) Use proper lifting technique and get help or equipment for heavy loads

**Answer: D**
Servers and UPS units are heavy and awkward; the injury risk is real. Team lifts, carts, and lifting with the legs (not the back) are the standard. Cords are not handles, and stairs are not ramps.
<!-- {"id":"COMPTIA-A-1202-Q153","objective":"4.4","type":"recall","source":"OBJ1202","locator":"Objective 4.4 safety procedures, lifting","verified":"2026-10-10"} -->

---

### Q154
Toner spills inside a laser printer while a tech replaces the cartridge. What is the proper cleanup approach?
- A) Use a toner-rated vacuum/cold water methods per the safety sheet; never a hot household vacuum
- B) Blow it out with compressed air into the room
- C) Wipe it with a wet household sponge
- D) Leave it; toner is harmless dust

**Answer: A**
Toner is a fine particulate requiring specific handling: anti-static, toner-rated vacuums and cold water (heat sets toner). Household vacuums can aerosolize or even ignite fine dust, and blowing it around contaminates the workspace.
<!-- {"id":"COMPTIA-A-1202-Q154","objective":"4.4","type":"recall","source":"OBJ1202","locator":"Objective 4.4 safety procedures, toner handling","verified":"2026-10-10"} -->

---

### Q155
A server room's temperature climbs to 95 F every afternoon because the single vent is blocked by stacked boxes. What is the environmental control issue and fix?
- A) Humidity is too low; add a fountain
- B) The room needs dimmer lights only
- C) Paint the racks black to radiate heat
- D) Blocked cooling/airflow; clear the vent and manage the room's HVAC so equipment stays in its rated range

**Answer: D**
Sustained heat shortens component life and causes throttling and shutdowns. Environmental control means unobstructed airflow and adequate cooling capacity; the boxes are the immediate, fixable problem.
<!-- {"id":"COMPTIA-A-1202-Q155","objective":"4.5","type":"diagnosis","source":"OBJ1202","locator":"Objective 4.5 environmental impacts and controls","verified":"2026-10-10"} -->

---

### Q156
A dusty workshop's PCs keep overheating despite working fans. What environmental practice helps most?
- A) Turning the monitors off at lunch
- B) Adding more software fans in the OS
- C) Regular cleaning plus filtered positive-pressure airflow to keep dust out of cases
- D) Opening the case panels permanently

**Answer: C**
Dust is the enemy: it insulates heat sinks and chokes fans. Scheduled cleaning and filtered intake reduce ingestion; open panels invite more dust, and software cannot remove physical blockage.
<!-- {"id":"COMPTIA-A-1202-Q156","objective":"4.5","type":"diagnosis","source":"OBJ1202","locator":"Objective 4.5 environmental impacts, dust controls","verified":"2026-10-10"} -->

---

### Q157
An office wants to dispose of old batteries and a stack of dead monitors responsibly. What is the right channel?
- A) The regular dumpster out back
- B) Burying them behind the office
- C) Shipping them to a random address
- D) Certified e-waste recycling per local regulations, never general trash

**Answer: D**
Batteries and displays contain hazardous materials regulated in most jurisdictions. Certified e-waste handlers process them legally and safely; trash and burial contaminate soil and violate disposal laws in many places.
<!-- {"id":"COMPTIA-A-1202-Q157","objective":"4.5","type":"recall","source":"OBJ1202","locator":"Objective 4.5 environmental impacts, disposal","verified":"2026-10-10"} -->

---

### Q158
A user asks to install unlicensed "cracked" design software on a company laptop because buying it is slow. What is the correct response and why?
- A) Install it but rename the folder
- B) Refuse; unlicensed software violates law and policy and often carries malware - escalate the purchase request instead
- C) Allow it until procurement catches up
- D) Allow it on personal lunch hours only

**Answer: B**
Pirated software exposes the company to legal liability and is a top malware vector. The professional path is to expedite the legitimate license, not to launder the install. Policy concepts around licensing exist for exactly this moment.
<!-- {"id":"COMPTIA-A-1202-Q158","objective":"4.6","type":"diagnosis","source":"OBJ1202","locator":"Objective 4.6 prohibited content/activity, licensing","verified":"2026-10-10"} -->

---

### Q159
A technician repairing a payroll clerk's PC notices a spreadsheet of employee salaries open on screen. What should they do with that information?
- A) Mention the interesting figures to coworkers
- B) Email it to themselves for safekeeping
- C) Nothing beyond the repair; treat it as confidential and never copy or discuss it
- D) Photograph it for reference

**Answer: C**
Technicians routinely encounter private data incidentally; the rule is strict confidentiality. Access is for the task only, and copying or gossiping about personal data is a privacy and policy breach regardless of intent.
<!-- {"id":"COMPTIA-A-1202-Q159","objective":"4.6","type":"diagnosis","source":"OBJ1202","locator":"Objective 4.6 privacy concepts","verified":"2026-10-10"} -->

---

### Q160
A manager asks a tech to quietly read a suspected employee's email "off the record." What governs the answer?
- A) Company policy and law: access to another's data requires proper authorization through official channels
- B) Curiosity level
- C) The tech's personal judgment of the employee
- D) Whether the manager seems nice

**Answer: A**
Reading someone's mailbox is a privacy invasion that requires documented authorization (HR/legal/management process), not verbal favors. Technicians who act without it expose themselves and the company legally.
<!-- {"id":"COMPTIA-A-1202-Q160","objective":"4.6","type":"diagnosis","source":"OBJ1202","locator":"Objective 4.6 privacy and policy concepts","verified":"2026-10-10"} -->

---

### Q161
A furious user calls: their deadline file vanished and they blame IT. What is the professional opening move?
- A) Explain it was probably their fault
- B) Put them on hold indefinitely
- C) Stay calm, listen fully, acknowledge the frustration, and restate the problem before troubleshooting
- D) Correct their tone first

**Answer: C**
De-escalation precedes diagnosis: an angry user cannot give good information until they feel heard. Acknowledging and restating the issue confirms understanding and moves the call into problem-solving.
<!-- {"id":"COMPTIA-A-1202-Q161","objective":"4.7","type":"diagnosis","source":"OBJ1202","locator":"Objective 4.7 communication techniques and professionalism","verified":"2026-10-10"} -->

---

### Q162
A technician explains a fix to a user: "Your DHCP lease collided with an APIPA fallback so the NIC flapped." The user looks lost. What should the tech have done?
- A) Spoken louder with the same terms
- B) Handed them a networking textbook
- C) Refused to explain anything
- D) Used plain language: "your PC picked the wrong address; we set it to fetch one automatically again"

**Answer: D**
Matching language to the audience is a core professionalism skill. The user needs the outcome and the one action they can recognize, not the protocol stack. Jargon-proofing prevents repeat calls and builds trust.
<!-- {"id":"COMPTIA-A-1202-Q162","objective":"4.7","type":"diagnosis","source":"OBJ1202","locator":"Objective 4.7 communication techniques","verified":"2026-10-10"} -->

---

### Q163
Mid-repair, a tech realizes the fix will take two more hours and the user is waiting. What is the professional move?
- A) Tell the user the new timeline and offer options, rather than vanishing into the work
- B) Say nothing until done
- C) Pretend it is almost fixed
- D) Close the ticket to hit metrics

**Answer: A**
Expectation management is part of the service: users plan around honest timelines. Silence and false optimism both destroy trust, and closing an unfinished ticket corrupts both the record and the follow-up.
<!-- {"id":"COMPTIA-A-1202-Q163","objective":"4.7","type":"diagnosis","source":"OBJ1202","locator":"Objective 4.7 professionalism, expectation setting","verified":"2026-10-10"} -->

---

### Q164
A help-desk tech takes a call while eating lunch at their desk, chewing audibly, and keeps interrupting the caller. Which professionalism rules are being broken? (Choose two.)
- A) Give the caller full attention without distractions
- B) Let the caller finish describing the issue before diagnosing
- C) Always eat during calls to save time
- D) Interrupt often to show expertise
- E) Use hold music as long as possible

**Correct Answer: A, B**
Undivided attention and uninterrupted listening are basic call professionalism: the caller's description carries the diagnostic facts. Eating, interrupting, and marinating callers on hold all signal disrespect and slow resolution.
<!-- {"id":"COMPTIA-A-1202-Q164","objective":"4.7","type":"recall","source":"OBJ1202","locator":"Objective 4.7 communication techniques and professionalism","verified":"2026-10-10"} -->

---

### Q165
A school wants twenty lab PCs to install updates, run a cleanup, and reboot every Sunday at 2 AM without anyone touching them. What should the technician build?
- A) A scheduled script (task scheduler plus a script file) that performs the maintenance weekly
- B) A sticky note reminder
- C) A volunteer rota
- D) A macro in a spreadsheet that someone must open

**Answer: A**
Scripting plus scheduling is exactly how repetitive maintenance is automated reliably: the script encodes the steps, the scheduler fires it on time, and logging records the outcome. Reminders and rotas depend on human memory.
<!-- {"id":"COMPTIA-A-1202-Q165","objective":"4.8","type":"diagnosis","source":"OBJ1202","locator":"Objective 4.8 basics of scripting, automation","verified":"2026-10-10"} -->

---

### Q166
A junior admin writes a script that deletes temp files and asks how to test it safely. What is the right practice?
- A) Run it on the CEO's laptop first
- B) Run it on all servers at once to save time
- C) Skip testing; scripts know what to do
- D) Run it first on a test machine/folder with harmless dummy files, verifying it targets only the intended paths

**Answer: D**
Scripts execute literally and at machine speed, so destructive logic must be proven on sacrificial targets first. Verifying the exact paths and dry-run output before production use is the discipline that prevents self-inflicted outages.
<!-- {"id":"COMPTIA-A-1202-Q166","objective":"4.8","type":"diagnosis","source":"OBJ1202","locator":"Objective 4.8 basics of scripting, safe practice","verified":"2026-10-10"} -->

---

### Q167
A script meant to rename files works in the office but fails on a home PC with paths containing spaces. What scripting basic was missed?
- A) Using a bigger monitor
- B) Running it faster
- C) Renaming the script to .exe
- D) Quoting/escaping paths and variables so spaces are handled

**Answer: D**
Unquoted variables split on whitespace, so paths with spaces break commands. Proper quoting and handling of special characters is scripting 101, and testing across environments catches exactly this class of bug.
<!-- {"id":"COMPTIA-A-1202-Q167","objective":"4.8","type":"diagnosis","source":"OBJ1202","locator":"Objective 4.8 basics of scripting, variables","verified":"2026-10-10"} -->

---

### Q168
A technician must help a user sixty miles away install a printer, watching their screen and taking control with permission. Which built-in category of tool fits?
- A) Remote assistance/remote desktop tools with the user's consent
- B) A long HDMI cable
- C) Screen-sharing by smartphone photo
- D) The printer's own display

**Answer: A**
Remote access technologies let a technician view and operate a distant machine with the user's approval, which is the daily reality of distributed support. Consent and session logging keep it professional and auditable.
<!-- {"id":"COMPTIA-A-1202-Q168","objective":"4.9","type":"recall","source":"OBJ1202","locator":"Objective 4.9 remote access technologies","verified":"2026-10-10"} -->

---

### Q169
A company needs its on-call admin to reach a server at 3 AM without driving in. Which two safeguards should accompany that remote access? (Choose two.)
- A) VPN or an equivalent encrypted, authenticated path into the network
- B) MFA on the remote access account
- C) The admin password posted in the team chat
- D) RDP exposed directly to the internet for simplicity
- E) Shared credentials among all admins

**Correct Answer: A, B**
Remote administration must ride an encrypted, authenticated channel (VPN or gateway), and the privileged account needs MFA. Exposed RDP and shared posted credentials are exactly what internet-wide scanners exploit within hours.
<!-- {"id":"COMPTIA-A-1202-Q169","objective":"4.9","type":"diagnosis","source":"OBJ1202","locator":"Objective 4.9 remote access technologies, security","verified":"2026-10-10"} -->

---

### Q170
A user asks an AI chatbot to "write an essay" and pastes in the company's confidential client list "for context." Why is this a problem?
- A) AI only accepts images
- B) Confidential data pasted into external AI tools can leave company control; sensitive data must never be shared without approval
- C) AI tools make everything confidential automatically
- D) The essay will be too long

**Answer: B**
Prompts to external AI services are data leaving the organization's control, subject to the provider's retention and policies. Confidential, client, or personal data requires explicit approval and appropriate tools, a standing workplace AI rule.
<!-- {"id":"COMPTIA-A-1202-Q170","objective":"4.10","type":"diagnosis","source":"OBJ1202","locator":"Objective 4.10 basic AI concepts, data handling","verified":"2026-10-10"} -->

---

### Q171
A colleague says an AI tool "must be right because it answered so confidently" and wants to paste its output into a client report unchecked. What is the sound guidance?
- A) AI output is always legally approved
- B) AI output can be fluent and wrong (hallucination); verify facts against reliable sources before use
- C) Confidence equals accuracy in AI
- D) Never check anything twice

**Answer: B**
Generative AI produces plausible text regardless of truth, and confident errors (hallucinations) are a known failure mode. Human verification against authoritative sources is the required step before anything reaches a client.
<!-- {"id":"COMPTIA-A-1202-Q171","objective":"4.10","type":"diagnosis","source":"OBJ1202","locator":"Objective 4.10 AI concepts, limitations","verified":"2026-10-10"} -->

---

### Q172
A small business considers using an AI assistant to draft customer emails. What two practices belong in the rollout? (Choose two.)
- A) A human reviews every outgoing message before it sends
- B) A policy on what data may be entered into the tool
- C) Auto-send everything to maximize efficiency
- D) Feed it all customer passwords so it personalizes
- E) Hide AI use from all customers and staff

**Correct Answer: A, B**
Human review catches errors and tone problems before customers see them, and a data policy prevents leaking customer information into external tools. Auto-send and indiscriminate data feeding are precisely the failure modes policy exists to prevent.
<!-- {"id":"COMPTIA-A-1202-Q172","objective":"4.10","type":"diagnosis","source":"OBJ1202","locator":"Objective 4.10 AI concepts, workplace use","verified":"2026-10-10"} -->

---

### Q173
A technician wants an AI assistant to summarize a fifty-page public installation guide into a checklist. Is this an appropriate use, and why?
- A) Yes, but only if it also installs the product unattended
- B) Yes - summarizing public, non-confidential material is a low-risk use, with a spot-check of the output
- C) No - AI may never touch documents
- D) Only if the checklist is never read

**Answer: B**
Low-stakes transformation of public content is a legitimate AI use case; the residual risk is summarization error, handled by spot-checking against the source. The data-sensitivity bar, not the technology, is what gates AI uses.
<!-- {"id":"COMPTIA-A-1202-Q173","objective":"4.10","type":"recall","source":"OBJ1202","locator":"Objective 4.10 AI concepts, appropriate use","verified":"2026-10-10"} -->

---

### Q174
A help desk logs show the same "Wi-Fi drops on 3rd floor" ticket four times in a month, each closed as "fixed." What documentation improvement prevents the fifth recurrence?
- A) Longer hold music
- B) A knowledge-base/root-cause entry linking the tickets so the underlying fault is found, plus searchable fix history
- C) Closing tickets faster
- D) Deleting duplicate tickets

**Answer: B**
Recurring identical tickets signal an unfixed root cause. Good documentation practice aggregates them, preserves what was tried, and drives a root-cause fix instead of repeated symptom-swabbing. Deleting history hides the pattern.
<!-- {"id":"COMPTIA-A-1202-Q174","objective":"4.1","type":"diagnosis","source":"OBJ1202","locator":"Objective 4.1 documentation, knowledge management","verified":"2026-10-10"} -->

---

### Q175
A new technician's first ticket asks them to replace a CEO's laptop "immediately, no questions," requested by an email from a free webmail address. What procedure protects the company here?
- A) Act fast; executives hate waiting
- B) Reply to the webmail address for confirmation
- C) Post about it in a public forum
- D) Verify the request through official channels before acting; support tickets are an attack vector too

**Answer: D**
Help desks are prime social-engineering targets. Verification through known channels (the ticket system, a directory phone number) before handing out equipment or access is standard procedure; replying to the suspicious address verifies nothing.
<!-- {"id":"COMPTIA-A-1202-Q175","objective":"4.1","type":"diagnosis","source":"OBJ1202","locator":"Objective 4.1 support systems, verification procedures","verified":"2026-10-10"} -->

---

### Q176
A weekend power outage is forecast, and the office's single server must shut down safely if power fails. What should be configured in advance?
- A) A UPS with graceful-shutdown software that powers the server down cleanly on extended outage
- B) A bigger surge protector with no battery
- C) An email reminder to unplug things
- D) A policy to never save files

**Answer: A**
A UPS bridges short outages and, paired with shutdown software, triggers a clean OS shutdown before its battery empties, preventing file-system corruption. Surge strips without batteries offer no runtime for a graceful stop.
<!-- {"id":"COMPTIA-A-1202-Q176","objective":"4.5","type":"diagnosis","source":"OBJ1202","locator":"Objective 4.5 environmental controls, power protection","verified":"2026-10-10"} -->

---

### Q177
A ticket arrives with only "computer broken, fix ASAP" from a user who is now in meetings all day. What should the tech do first?
- A) Guess and replace the motherboard
- B) Close it as unresolvable
- C) Wait outside the meeting room
- D) Update the ticket with what is known and request specifics through the ticket system for a documented reply

**Answer: D**
Tickets are the system of record: documenting the state and asking structured questions (what, when, error messages, what changed) keeps the work moving asynchronously. Guessing at hardware wastes parts; closing destroys the request.
<!-- {"id":"COMPTIA-A-1202-Q177","objective":"4.1","type":"diagnosis","source":"OBJ1202","locator":"Objective 4.1 documentation and support systems information management","verified":"2026-10-10"} -->

---

### Q178
A technician finishes a complex fix that took three days. What belongs in the final ticket entry? (Choose three.)
- A) The root cause as determined
- B) The steps that fixed it
- C) Verification that the user confirmed the fix
- D) The tech's lunch order
- E) Complaints about the user's competence

**Correct Answer: A, B, C**
A useful resolution record captures cause, fix, and verification so the next occurrence takes minutes instead of days. Personal commentary and mockery have no place in a professional record the user may later read.
<!-- {"id":"COMPTIA-A-1202-Q178","objective":"4.1","type":"recall","source":"OBJ1202","locator":"Objective 4.1 documentation best practices","verified":"2026-10-10"} -->

---

### Q179
A department wants to roll out a new accounting app to 200 PCs next month. Which change-management artifact tells everyone the rollout sequence and how to reverse it?
- A) The app's marketing brochure
- B) The change plan with scope, schedule, and rollback procedure
- C) A hallway conversation
- D) A surprise email on rollout day

**Answer: B**
Large rollouts succeed on written plans: what changes, in what order, during which windows, who is affected, and exactly how to back out. Informal or late communication turns a managed rollout into an outage lottery.
<!-- {"id":"COMPTIA-A-1202-Q179","objective":"4.2","type":"recall","source":"OBJ1202","locator":"Objective 4.2 change management documentation","verified":"2026-10-10"} -->

---

### Q180
A tech must explain to a non-technical manager why last night's maintenance ran forty minutes over its window. What is the professional framing?
- A) Silence; managers hate details
- B) A brief, plain-language summary of what happened, the impact, and the prevention step - no jargon, no blame
- C) A forty-page packet trace
- D) "It was the vendor's fault" with no details

**Answer: B**
Post-incident communication to leadership is concise and outcome-focused: what happened, who felt it, and what changes so it does not recur. Jargon dumps and blame-shifting both erode confidence in the team.
<!-- {"id":"COMPTIA-A-1202-Q180","objective":"4.7","type":"diagnosis","source":"OBJ1202","locator":"Objective 4.7 communication techniques and professionalism","verified":"2026-10-10"} -->

---
