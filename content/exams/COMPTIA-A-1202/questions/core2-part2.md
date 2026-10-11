# CompTIA A+ Core 2 (220-1202) Practice Questions - Part 2
# Original study items. Independent material, not official or endorsed by CompTIA.

## DOMAIN 1: Operating Systems (study allocation)

---

### Q61
A family shares one Mac, and the parents want purchases from the app store to require their approval while the kids browse freely otherwise. Which macOS account approach fits?
- A) One shared admin account for everyone
- B) A firmware password for the kids
- C) Separate power adapters per child
- D) Standard accounts for the kids under managed/family controls, with the admin account held by the parents

**Answer: D**
Per-person standard accounts with parental/family management keep purchases gated behind the administrator while leaving everyday use open. A shared admin account gives the kids full control, and firmware locks or chargers do not gate purchases.
<!-- {"id":"COMPTIA-A-1202-Q061","objective":"1.8","type":"diagnosis","source":"OBJ1202","locator":"Objective 1.8 macOS features and tools, accounts","verified":"2026-10-10"} -->

---

## DOMAIN 2: Security (study allocation)

---

### Q62
A user wants to require their face plus a PIN to unlock Windows. Which Windows feature provides biometric sign-in options?
- A) The printer properties dialog
- B) The taskbar alignment setting
- C) The sign-in options in account settings (Windows Hello)
- D) The device encryption page only

**Answer: C**
Windows Hello sign-in options enroll face, fingerprint, and PIN as unlock methods, layered as the user describes. Encryption protects data at rest but does not authenticate sign-in, and the other settings are unrelated.
<!-- {"id":"COMPTIA-A-1202-Q062","objective":"2.2","type":"recall","source":"OBJ1202","locator":"Objective 2.2 Windows security settings, biometrics","verified":"2026-10-10"} -->

---

### Q63
A home user sets up a new wireless router. Which wireless security mode should they choose, and which should they explicitly avoid?
- A) WEP for maximum compatibility
- B) Open with a hidden SSID
- C) WPA3-enterprise only, no personal mode
- D) WPA2 or WPA3 personal; avoid WEP and open networks

**Answer: D**
Current personal-mode choices are WPA2 and preferably WPA3, which use strong modern encryption. WEP is broken and trivially cracked, and an open network with a hidden SSID protects nothing, since the SSID is trivially discovered and traffic is unencrypted.
<!-- {"id":"COMPTIA-A-1202-Q063","objective":"2.3","type":"recall","source":"OBJ1202","locator":"Objective 2.3 wireless security protocols","verified":"2026-10-10"} -->

---

### Q64
A small business wants every employee to authenticate individually to the Wi-Fi with their own credentials instead of one shared passphrase. Which wireless security configuration provides this?
- A) Disabling the SSID broadcast
- B) Enterprise mode with 802.1X against a central authentication server
- C) Personal mode with a longer shared passphrase
- D) MAC address filtering alone

**Answer: B**
Enterprise mode (802.1X) authenticates each user against a central directory, giving per-person credentials, revocation, and accountability. Shared passphrases leak and cannot be revoked per person; MAC filtering and hidden SSIDs are not authentication.
<!-- {"id":"COMPTIA-A-1202-Q064","objective":"2.3","type":"diagnosis","source":"OBJ1202","locator":"Objective 2.3 wireless security protocols and authentication methods","verified":"2026-10-10"} -->

---

### Q65
A user downloads a "free invoice template" that turns out to encrypt their Documents folder and demand payment. What category of malware is this?
- A) Spyware
- B) A rootkit
- C) Ransomware
- D) Adware

**Answer: C**
Encrypting user files and demanding payment for the key is the defining behavior of ransomware. The immediate response is isolation from the network, not payment, followed by reporting and restoration from backups.
<!-- {"id":"COMPTIA-A-1202-Q065","objective":"2.4","type":"recall","source":"OBJ1202","locator":"Objective 2.4 types of malware","verified":"2026-10-10"} -->

---

### Q66
A user's passwords keep showing up in logins from other countries, and their PC shows a program they never installed that "improves typing." What malware class most likely captured their credentials?
- A) A firmware update
- B) A keylogger (spyware)
- C) A boot-sector virus from 1995
- D) A macro in the printer driver

**Answer: B**
Credential theft with an unwanted "helpful" utility present points to spyware logging keystrokes. Removing it, changing passwords from a clean device, and enabling MFA are the response steps.
<!-- {"id":"COMPTIA-A-1202-Q066","objective":"2.4","type":"diagnosis","source":"OBJ1202","locator":"Objective 2.4 malware types, detection","verified":"2026-10-10"} -->

---

### Q67
A PC is slow and the technician finds hidden processes that do not appear in Task Manager but show up in a boot-time scan. What malware class hides itself from the OS like this?
- A) Rootkit
- B) Adware
- C) Ransomware
- D) Spyware

**Answer: A**
Rootkits burrow below or into the operating system to conceal processes, files, and activity from normal tools, which is why they surface mainly in offline or boot-time scans. Removal often requires dedicated tools or a rebuild.
<!-- {"id":"COMPTIA-A-1202-Q067","objective":"2.4","type":"recall","source":"OBJ1202","locator":"Objective 2.4 types of malware rootkit","verified":"2026-10-10"} -->

---

### Q68
A user's browser homepage and search engine keep changing on their own, and extra toolbars appear after each "free" software install. What are they dealing with?
- A) A DNS outage
- B) Adware/potentially unwanted programs bundled with installers
- C) A failing hard drive
- D) A BIOS misconfiguration

**Answer: B**
Browser hijacks, injected ads, and mystery toolbars following free installs are the signature of bundled adware/PUPs. Prevention is careful install screens and reputable sources; cleanup is uninstall plus browser reset and a scan.
<!-- {"id":"COMPTIA-A-1202-Q068","objective":"2.4","type":"diagnosis","source":"OBJ1202","locator":"Objective 2.4 malware types, prevention","verified":"2026-10-10"} -->

---

### Q69
An email claims to be from the company CEO, urgent, demanding gift cards purchased within the hour "for a client." The sender's address is one letter off the real one. What is this, and what should the recipient do?
- A) Spam; just delete with no report
- B) A newsletter; unsubscribe
- C) Spear phishing/CEO fraud; verify through a known channel and report, never comply
- D) A legitimate executive request; act fast

**Answer: C**
Urgency, authority pressure, a lookalike sender, and an unusual payment demand are the anatomy of CEO fraud (a targeted phishing attack). Verification via a known phone number or in person defeats it; reporting protects everyone else.
<!-- {"id":"COMPTIA-A-1202-Q069","objective":"2.5","type":"diagnosis","source":"OBJ1202","locator":"Objective 2.5 social engineering attacks","verified":"2026-10-10"} -->

---

### Q70
A caller claiming to be "IT support" asks an employee to read back the MFA code just texted to them so IT can "verify the account." What is happening?
- A) A password expiration notice
- B) A hardware diagnostic
- C) Vishing combined with MFA interception; never share one-time codes
- D) Standard IT procedure

**Answer: C**
Voice phishing (vishing) harvests one-time codes in real time to defeat MFA. Legitimate support never asks for codes. The code is the second factor; reading it out hands over the account.
<!-- {"id":"COMPTIA-A-1202-Q070","objective":"2.5","type":"diagnosis","source":"OBJ1202","locator":"Objective 2.5 social engineering vishing","verified":"2026-10-10"} -->

---

### Q71
A stranger in a branded polo follows an employee through the badge door, carrying a ladder and saying they are "here to fix the projector." What is this attack called and the right response?
- A) A DDoS attack; reboot the router
- B) A zero-day; patch immediately
- C) Tailgating (a physical social engineering attack); politely direct them to reception for verification
- D) Phishing; delete their email

**Answer: C**
Tailgating exploits politeness to bypass physical access controls. The correct habit is to require every visitor to badge in or be verified by reception, without confrontation. No network or software control addresses a person walking in.
<!-- {"id":"COMPTIA-A-1202-Q071","objective":"2.5","type":"diagnosis","source":"OBJ1202","locator":"Objective 2.5 social engineering, physical","verified":"2026-10-10"} -->

---

### Q72
A text message warns that a package is held and asks the recipient to tap a link and "confirm" card details. What is this called?
- A) War driving
- B) A firmware update
- C) Smishing (SMS phishing)
- D) Bluejacking

**Answer: C**
Phishing delivered by text message is smishing; delivery-fee and package-hold lures are its most common baits. The safe path is to check the shipment through the carrier's official app or site, never through the link.
<!-- {"id":"COMPTIA-A-1202-Q072","objective":"2.5","type":"recall","source":"OBJ1202","locator":"Objective 2.5 social engineering smishing","verified":"2026-10-10"} -->

---

### Q73
An employee plugs in a USB drive found in the parking lot, curious whose it is. Why is this dangerous, and what should happen instead?
- A) Found media can carry malware or lure files; hand it to IT/security for controlled handling
- B) USB drives are always safe if they look new
- C) It is only dangerous on Macs
- D) The drive should be shared with the whole team to find the owner

**Answer: A**
"USB drop" attacks count on curiosity: the device can emulate a keyboard or autorun payloads. Policy is to give found media to security for examination on an isolated system, never to mount it on a work machine.
<!-- {"id":"COMPTIA-A-1202-Q073","objective":"2.5","type":"diagnosis","source":"OBJ1202","locator":"Objective 2.5 threats and vulnerabilities, removable media","verified":"2026-10-10"} -->

---

### Q74
A user gets an email with a spreadsheet attachment named "Q3_bonus_calc.xlsm" from an unknown sender. What is the safest handling?
- A) Forward it to the team for a second opinion
- B) Enable macros but close it quickly
- C) Do not enable macros or open unexpected attachments; verify with the sender or report it
- D) Open it read-only so it is safe

**Answer: C**
Macro-enabled office files from unknown senders are a top malware delivery vehicle; "read-only" still executes macros when enabled, and forwarding spreads the bait. Verify legitimacy out of band or report to security.
<!-- {"id":"COMPTIA-A-1202-Q074","objective":"2.5","type":"diagnosis","source":"OBJ1202","locator":"Objective 2.5 social engineering, attachments","verified":"2026-10-10"} -->

---

### Q75
A home user discovers pop-ups and a fake "your PC is infected" warning with a phone number to call. What is the correct immediate action?
- A) Disable the antivirus so it stops conflicting
- B) Close the warning without calling, then run a reputable malware scan
- C) Call the number for help
- D) Pay the unlock fee quickly

**Answer: B**
Scareware fakes infection alerts to sell fake support or steal payment details. Closing the page (force-quit if needed), then scanning with a reputable tool, is the right sequence; engaging with the scammer makes it worse.
<!-- {"id":"COMPTIA-A-1202-Q075","objective":"2.6","type":"diagnosis","source":"OBJ1202","locator":"Objective 2.6 SOHO malware removal","verified":"2026-10-10"} -->

---

### Q76
A small office PC is confirmed infected with a trojan. Put the response in the right order: what comes FIRST?
- A) Defragment the drive
- B) Disconnect/isolate the machine from the network to stop spread and data theft
- C) Reinstall Windows immediately
- D) Email the team from that PC to warn them

**Answer: B**
Isolation comes before eradication: an infected, connected machine can spread and exfiltrate while you work. After isolation comes identification, removal/quarantine, and only then rebuild decisions and reconnection.
<!-- {"id":"COMPTIA-A-1202-Q076","objective":"2.6","type":"diagnosis","source":"OBJ1202","locator":"Objective 2.6 malware removal procedures","verified":"2026-10-10"} -->

---

### Q77
After removing malware from a family PC and updating the system, what should the user do about their passwords?
- A) Change important passwords from a known-clean device, starting with email and banking
- B) Nothing; removal covers credentials
- C) Post the old passwords in a group chat to warn friends
- D) Change only the Wi-Fi password

**Answer: A**
Malware may have harvested credentials before removal, so remediation includes changing exposed passwords from a clean machine, prioritizing email (the password-reset hub) and financial accounts. Removal alone cannot un-steal credentials.
<!-- {"id":"COMPTIA-A-1202-Q077","objective":"2.6","type":"diagnosis","source":"OBJ1202","locator":"Objective 2.6 malware removal, remediation","verified":"2026-10-10"} -->

---

### Q78
A user asks how to keep their home PC from getting infected again after a cleanup. Which habits give the most protection? (Choose three.)
- A) Keep the OS and apps updated
- B) Run reputable anti-malware with real-time protection
- C) Be skeptical of unexpected attachments, links, and downloads
- D) Disable the firewall for speed
- E) Use one admin account for daily browsing

**Correct Answer: A, B, C**
Patching closes known holes, real-time protection catches what slips through, and user skepticism stops the most common delivery vector. Disabling the firewall and daily admin use both widen the attack surface instead.
<!-- {"id":"COMPTIA-A-1202-Q078","objective":"2.6","type":"recall","source":"OBJ1202","locator":"Objective 2.6 detection, removal, and prevention methods","verified":"2026-10-10"} -->

---

### Q79
A company wants departing employees' accounts disabled the same day and a quarterly review of who still needs admin rights. Which hardening practice is this?
- A) Bigger case fans
- B) Static IP addresses for all
- C) Account hygiene: timely deprovisioning and least-privilege review
- D) Longer password aging only

**Answer: C**
Dormant accounts and accumulated privileges are classic attack paths. Timely deprovisioning and periodic privilege reviews shrink them; password aging, cooling, and addressing do not govern who holds access.
<!-- {"id":"COMPTIA-A-1202-Q079","objective":"2.7","type":"recall","source":"OBJ1202","locator":"Objective 2.7 workstation security options and hardening","verified":"2026-10-10"} -->

---

### Q80
A technician hardens a fleet of workstations. Which actions belong in the build? (Choose three.)
- A) Remove or disable unneeded software and services
- B) Turn on the host firewall with default-deny inbound
- C) Rename or disable default accounts like Guest
- D) Enable autorun for USB drives
- E) Give every user local admin for convenience

**Correct Answer: A, B, C**
Hardening is reducing attack surface: fewer services, a default-deny firewall, and no usable default accounts. Autorun and universal admin both add exposure, the opposite of hardening.
<!-- {"id":"COMPTIA-A-1202-Q080","objective":"2.7","type":"recall","source":"OBJ1202","locator":"Objective 2.7 hardening techniques","verified":"2026-10-10"} -->

---

### Q81
A laptop used in cafes needs protection against someone walking up while the owner is away for a minute. Which settings address this directly? (Choose two.)
- A) A short automatic lock timeout
- B) A strong sign-in requirement on wake
- C) A louder fan
- D) A bigger hard drive
- E) A brighter keyboard backlight

**Correct Answer: A, B**
Physical brief-absence risk is countered by fast locking plus authentication on wake, so a passerby faces a locked screen. The other options are comfort or capacity features with no security effect.
<!-- {"id":"COMPTIA-A-1202-Q081","objective":"2.7","type":"diagnosis","source":"OBJ1202","locator":"Objective 2.7 workstation security options","verified":"2026-10-10"} -->

---

### Q82
A user's phone holds work email. Which mobile security settings should the company require at minimum? (Choose three.)
- A) A device passcode/biometric lock
- B) Remote locate-and-wipe capability enrolled
- C) OS updates applied promptly
- D) Sideloading apps from any website allowed
- E) Bluetooth discoverable mode always on

**Correct Answer: A, B, C**
Locking the device, being able to find and wipe it if lost, and current patches are the mobile baseline. Sideloading and permanent discoverability both expand the attack surface on a device holding company data.
<!-- {"id":"COMPTIA-A-1202-Q082","objective":"2.8","type":"recall","source":"OBJ1202","locator":"Objective 2.8 securing mobile devices","verified":"2026-10-10"} -->

---

### Q83
A user sells their old phone online. What must they do before handing it over?
- A) Sign out of accounts and perform a full factory reset/erase so personal data is gone
- B) Just delete the photos folder
- C) Remove the SIM only
- D) Change the wallpaper

**Answer: A**
Phones concentrate accounts and data; only signing out and performing the full erase/factory reset (which also destroys the encryption keys on modern devices) makes recovery infeasible. Deleting folders leaves everything else behind.
<!-- {"id":"COMPTIA-A-1202-Q083","objective":"2.8","type":"diagnosis","source":"OBJ1202","locator":"Objective 2.8 securing mobile devices, disposal","verified":"2026-10-10"} -->

---

### Q84
A law office must retire ten PCs with client files. Which disposal method gives the strongest assurance the data is unrecoverable?
- A) Deleting files and emptying the Recycle Bin
- B) Formatting with the quick option
- C) Donating them immediately with drives intact
- D) Physical destruction of the drives (shredding) after inventory, with certificates of destruction

**Answer: D**
Physical destruction is the terminal state for sensitive media, and certificates document the chain for a regulated office. Quick formats and deletions leave data recoverable; donation with intact drives breaches client confidentiality.
<!-- {"id":"COMPTIA-A-1202-Q084","objective":"2.9","type":"diagnosis","source":"OBJ1202","locator":"Objective 2.9 data destruction and disposal methods","verified":"2026-10-10"} -->

---

### Q85
A school wants to reuse old SSDs internally in lower-sensitivity roles. Which sanitization approach fits reuse?
- A) Manufacturer secure-erase or cryptographic erase, verified before redeployment
- B) A magnet waved near the drive
- C) Deleting the partitions only
- D) Drilling the outer case but not the media

**Answer: A**
SSDs sanitize via secure-erase commands or by destroying the encryption key (cryptographic erase), both preserving the drive for reuse. Magnets are unreliable on flash, partition deletion is trivially reversible, and cosmetic damage does not sanitize.
<!-- {"id":"COMPTIA-A-1202-Q085","objective":"2.9","type":"recall","source":"OBJ1202","locator":"Objective 2.9 data destruction methods, sanitization","verified":"2026-10-10"} -->

---

### Q86
A home office router still uses its factory admin password and has remote management open to the internet. What should the technician change first? (Choose two.)
- A) Set a strong unique admin password
- B) Disable remote (WAN-side) management
- C) Rename the SSID to something cute
- D) Move the router to a higher shelf
- E) Disable the firewall for speed

**Correct Answer: A, B**
Default credentials with internet-facing management is an open invitation; replacing the password and shutting off WAN management close it. SSID names, shelf placement, and firewall removal do not secure the admin interface.
<!-- {"id":"COMPTIA-A-1202-Q086","objective":"2.10","type":"diagnosis","source":"OBJ1202","locator":"Objective 2.10 SOHO wired network security settings","verified":"2026-10-10"} -->

---

### Q87
A family wants their smart-TV and camera gadgets isolated from the laptops that hold banking. What SOHO network change accomplishes this?
- A) Give the IoT devices the admin password
- B) Disable Wi-Fi encryption so all devices share
- C) Plug everything into the same unmanaged switch
- D) Put IoT devices on a separate guest network/VLAN

**Answer: D**
A guest network or VLAN segments low-trust gadgets from high-trust computers, so a compromised camera cannot reach the banking laptop. Sharing everything or removing encryption increases the risk the segmentation addresses.
<!-- {"id":"COMPTIA-A-1202-Q087","objective":"2.10","type":"diagnosis","source":"OBJ1202","locator":"Objective 2.10 SOHO wireless security settings, segmentation","verified":"2026-10-10"} -->

---

### Q88
A user notices their home router's manufacturer released a firmware update fixing a remote exploit. What should they do, and why does it matter?
- A) Ignore it; routers do not get viruses
- B) Reset the router to factory defaults instead
- C) Turn the router off at night only
- D) Apply the firmware update; routers are internet-facing and unpatched flaws are remotely exploitable

**Answer: D**
The router is the home network's front door; vendor firmware updates patch exactly the remote vulnerabilities attackers scan for. Factory resets revert to old firmware, and scheduled downtime does not patch anything.
<!-- {"id":"COMPTIA-A-1202-Q088","objective":"2.10","type":"diagnosis","source":"OBJ1202","locator":"Objective 2.10 SOHO network security, firmware","verified":"2026-10-10"} -->

---

### Q89
A user complains their browser keeps opening pop-up casino tabs on its own. Which browser security setting, combined with a reputable blocker, most directly suppresses this?
- A) Pop-up blocking (plus reviewing installed extensions for the culprit)
- B) Increasing the font size
- C) Clearing the browsing history only
- D) Switching the theme to dark mode

**Answer: A**
Rogue pop-ups come from malicious pages or hijacking extensions. Pop-up blocking plus auditing/removing suspicious extensions addresses both causes; cosmetic and history settings do not affect behavior injections.
<!-- {"id":"COMPTIA-A-1202-Q089","objective":"2.11","type":"diagnosis","source":"OBJ1202","locator":"Objective 2.11 browser security settings","verified":"2026-10-10"} -->

---

### Q90
A banking site warns a user that their connection is not private and the certificate is invalid. What should the user do?
- A) Refresh until it works
- B) Email the bank their password to verify
- C) Stop and not enter credentials; the warning can indicate interception or a spoofed site
- D) Click through anyway; certificates are decoration

**Answer: C**
Certificate warnings mean the browser cannot verify the site's identity or the connection's integrity, which is exactly what an interception or spoof looks like. Entering credentials through the warning hands them to whoever is in the middle.
<!-- {"id":"COMPTIA-A-1202-Q090","objective":"2.11","type":"diagnosis","source":"OBJ1202","locator":"Objective 2.11 browser security, certificates","verified":"2026-10-10"} -->

---

### Q91
A user wants their browser to stop remembering passwords because the laptop is sometimes shared. What is a better alternative than the browser's built-in store?
- A) A dedicated password manager with its own master authentication
- B) A text file on the desktop named passwords.txt
- C) Writing them on a sticky note on the screen
- D) Reusing one easy password everywhere

**Answer: A**
A password manager encrypts credentials behind its own authentication and fills them per site, removing both the shared-browser risk and the reuse habit. Plaintext files and sticky notes expose everything to anyone near the machine.
<!-- {"id":"COMPTIA-A-1202-Q091","objective":"2.11","type":"diagnosis","source":"OBJ1202","locator":"Objective 2.11 browser security settings, password handling","verified":"2026-10-10"} -->

---

### Q92
A user asks what "private browsing" mode actually protects. What is the accurate answer?
- A) It makes the user anonymous to websites and the ISP
- B) It blocks all malware
- C) It encrypts all traffic end to end
- D) It keeps local history, cookies, and form data off the device after the session; it does not hide activity from the network or sites

**Answer: D**
Private modes only avoid saving local traces; the network operator, employer, and visited sites still see the traffic. Overstating its protection leads users into exactly the mistakes attackers count on.
<!-- {"id":"COMPTIA-A-1202-Q092","objective":"2.11","type":"recall","source":"OBJ1202","locator":"Objective 2.11 browser security settings, private mode","verified":"2026-10-10"} -->

---

### Q93
A company's browser policy blocks all third-party cookies and prompts before sites can use location or the camera. What class of risk does this reduce?
- A) Tracking and unwanted sensor access by websites
- B) Hard drive failure
- C) Power surges
- D) Printer jams

**Answer: A**
Third-party cookies enable cross-site tracking, and camera/location prompts gate sensor access behind consent. These settings address privacy exposure in the browser, not hardware reliability.
<!-- {"id":"COMPTIA-A-1202-Q093","objective":"2.11","type":"recall","source":"OBJ1202","locator":"Objective 2.11 browser security settings, cookies and permissions","verified":"2026-10-10"} -->

---

## DOMAIN 3: Software Troubleshooting (study allocation)

---

### Q94
A Windows PC boots to a black screen with a blinking cursor after a power outage. What is the best first repair attempt?
- A) Boot into recovery and run startup repair
- B) Reinstall Windows from scratch
- C) Replace the motherboard
- D) Update the graphics driver from within the broken install

**Answer: A**
A boot that fails before the OS loads points at boot configuration or system files damaged by the outage; the recovery environment's startup repair targets exactly that. Reinstall and hardware swaps come only after repair attempts fail.
<!-- {"id":"COMPTIA-A-1202-Q094","objective":"3.1","type":"diagnosis","source":"OBJ1202","locator":"Objective 3.1 troubleshoot Windows OS issues, boot","verified":"2026-10-10"} -->

---

### Q95
After a driver update, a PC blue-screens on every boot. It boots fine into Safe Mode. What is the fastest path back to stability?
- A) Disable the antivirus
- B) Reflash the BIOS
- C) Roll back the driver or use System Restore from Safe Mode
- D) Buy a new graphics card

**Answer: C**
A crash that begins with a specific change and vanishes in Safe Mode convicts that change. Safe Mode loads minimal drivers, giving a stable place to roll back the driver or restore the system to before the update.
<!-- {"id":"COMPTIA-A-1202-Q095","objective":"3.1","type":"diagnosis","source":"OBJ1202","locator":"Objective 3.1 Windows OS issues, Safe Mode, System Restore","verified":"2026-10-10"} -->

---

### Q96
A user's PC keeps restarting itself overnight and they lose open work. The culprit is an automatic update setting. What is the balanced fix?
- A) Never save documents
- B) Set active hours (or restart notifications) so updates install without surprise reboots during use
- C) Disable updates permanently
- D) Unplug the PC every night

**Answer: B**
Active hours and restart scheduling keep security updates flowing while preventing mid-work reboots. Disabling updates trades a nuisance for unpatched vulnerabilities, and the other options are workarounds that change nothing.
<!-- {"id":"COMPTIA-A-1202-Q096","objective":"3.1","type":"diagnosis","source":"OBJ1202","locator":"Objective 3.1 Windows OS issues, updates","verified":"2026-10-10"} -->

---

### Q97
An application freezes daily at random times, but the rest of the OS stays responsive. What is the structured first move?
- A) Replace the RAM immediately
- B) Disable the page file
- C) Force-end the app, then check for its updates and its crash logs in the event viewer
- D) Reinstall Windows

**Answer: C**
A single misbehaving application with a healthy OS is an app-level fault. Ending it, updating it, and reading its crash entries localizes the cause before any system-level or hardware intervention.
<!-- {"id":"COMPTIA-A-1202-Q097","objective":"3.1","type":"diagnosis","source":"OBJ1202","locator":"Objective 3.1 Windows OS issues, application failures","verified":"2026-10-10"} -->

---

### Q98
A PC is suddenly much slower, and the technician notices a process named like a system file but running from a temp folder, using 80 percent CPU. What should they suspect first?
- A) A failing monitor
- B) A dusty keyboard
- C) A low toner warning
- D) Malware masquerading as a system process

**Answer: D**
Legitimate system processes live in system directories; a lookalike name running from a temp path with heavy CPU is a classic masquerade. The response is a malware scan and investigation, not hardware or peripheral work.
<!-- {"id":"COMPTIA-A-1202-Q098","objective":"3.1","type":"diagnosis","source":"OBJ1202","locator":"Objective 3.1 Windows issues, malware symptoms","verified":"2026-10-10"} -->

---

### Q99
A Windows update fails every time at 60 percent with an error code. What are the first two troubleshooting steps? (Choose two.)
- A) Retry after a reboot and check free disk space
- B) Run the built-in Windows Update troubleshooter
- C) Delete the user profile
- D) Replace the power supply
- E) Format the drive

**Correct Answer: A, B**
Update failures commonly trace to transient state or insufficient space, and the dedicated troubleshooter resets update components. Profile deletion, power supplies, and formatting are disproportionate first moves.
<!-- {"id":"COMPTIA-A-1202-Q099","objective":"3.1","type":"diagnosis","source":"OBJ1202","locator":"Objective 3.1 troubleshoot Windows OS issues, update failures","verified":"2026-10-10"} -->

---

### Q100
A user reports "the internet is broken" but email syncs fine and only their browser fails on every site. What is the efficient next check?
- A) The Ethernet cable
- B) The browser itself: extensions, proxy setting, or a reset of the browser profile
- C) The router firmware
- D) The DNS server appliance

**Answer: B**
Other network apps working isolates the fault to the browser: a bad proxy setting (often set by adware) or a broken extension/profile. Browser reset after checking the proxy is the fast fix; infrastructure is proven healthy by the mail client.
<!-- {"id":"COMPTIA-A-1202-Q100","objective":"3.1","type":"diagnosis","source":"OBJ1202","locator":"Objective 3.1 Windows OS issues, browser/app faults","verified":"2026-10-10"} -->

---

### Q101
A phone's apps all crash within seconds of opening, right after a major OS update, and storage shows 99 percent full. What is the most likely fix?
- A) Remove the SIM card permanently
- B) Turn off Wi-Fi
- C) Free up storage space; full storage destabilizes apps and the OS
- D) Replace the screen

**Answer: C**
Operating systems need working space for caches and updates; a nearly full device produces widespread app instability exactly like this. Clearing space (then letting apps rebuild caches) resolves it without any hardware action.
<!-- {"id":"COMPTIA-A-1202-Q101","objective":"3.2","type":"diagnosis","source":"OBJ1202","locator":"Objective 3.2 mobile OS and application issues","verified":"2026-10-10"} -->

---

### Q102
A user's phone battery started draining rapidly after they installed a "battery saver" app from an ad. What should the technician advise?
- A) Uninstall the app; many "saver" apps are adware that run constantly and drain more than they save
- B) Install a second saver app
- C) Keep the phone in the freezer
- D) Disable the screen entirely

**Answer: A**
Ad-driven utility apps commonly run persistent background activity and ads, worsening drain. Removing it and reviewing background-permission settings is the direct fix; built-in battery settings already provide legitimate saving.
<!-- {"id":"COMPTIA-A-1202-Q102","objective":"3.2","type":"diagnosis","source":"OBJ1202","locator":"Objective 3.2 mobile application issues, battery drain","verified":"2026-10-10"} -->

---

### Q103
A tablet will not install any app updates, reporting "insufficient storage" though the user swears they deleted videos last week. What should be checked?
- A) Whether Bluetooth is on
- B) Whether the case is too tight
- C) Whether the deleted items still sit in a trash/recently-deleted area counting against storage
- D) Whether the stylus is charged

**Answer: C**
Mobile platforms often hold deleted files in a recently-deleted state for a recovery window, so space is not actually freed until that is emptied. Verifying real free space (and clearing the trash) unblocks the updates.
<!-- {"id":"COMPTIA-A-1202-Q103","objective":"3.2","type":"diagnosis","source":"OBJ1202","locator":"Objective 3.2 mobile OS issues, storage","verified":"2026-10-10"} -->

---

### Q104
A phone's touchscreen becomes unresponsive only while charging with a gas-station cable. On the original charger it is fine. What explains this?
- A) The phone needs a factory reset
- B) The cable updates the OS
- C) Charging always disables touch by design
- D) The cheap charger introduces electrical noise that interferes with the touch digitizer

**Answer: D**
Poorly made chargers leak noise onto the power line that capacitive digitizers read as phantom input or block out. Swapping to a quality charger is the fix; the phone itself is proven healthy on the original equipment.
<!-- {"id":"COMPTIA-A-1202-Q104","objective":"3.2","type":"diagnosis","source":"OBJ1202","locator":"Objective 3.2 mobile OS and application issues, touchscreen","verified":"2026-10-10"} -->

---

### Q105
A user's authenticator app shows codes, but the work VPN rejects them all. The phone's clock was manually set and is three minutes off. What is the fix?
- A) Set the phone to automatic network time; time-based codes depend on synchronized clocks
- B) Buy a new phone
- C) Reinstall the VPN client daily
- D) Type the code faster

**Answer: A**
Time-based one-time codes are computed from the current time; a clock skewed by minutes generates codes the server no longer accepts. Restoring automatic time synchronization fixes every account at once.
<!-- {"id":"COMPTIA-A-1202-Q105","objective":"3.3","type":"diagnosis","source":"OBJ1202","locator":"Objective 3.3 mobile OS and application security issues","verified":"2026-10-10"} -->

---

### Q106
A user sideloaded a game from a website, and now the phone shows ads over other apps and asks for accessibility access. What is the correct action?
- A) Revoke the permissions, uninstall the app, and restrict installs to the official store
- B) Grant accessibility so the ads stop
- C) Pay the app to remove ads
- D) Disable the touchscreen

**Answer: A**
Overlay ads plus accessibility-permission demands are hallmarks of hostile sideloaded apps. Removing it and confining installs to the curated store closes the hole; granting the requested access would deepen the compromise.
<!-- {"id":"COMPTIA-A-1202-Q106","objective":"3.3","type":"diagnosis","source":"OBJ1202","locator":"Objective 3.3 mobile application security issues","verified":"2026-10-10"} -->

---

### Q107
A company phone prompts that its OS is years out of date and "no longer receiving security updates." What is the security guidance?
- A) Ignore it; phones are immune
- B) Turn off the screen more often
- C) Only use it on Tuesdays
- D) Replace or upgrade the device; unpatched phones accumulate known, exploitable holes

**Answer: D**
End-of-support devices stop receiving fixes for publicly known vulnerabilities, making them progressively unsafe, especially for work data. The responsible options are upgrading the OS where possible or replacing the device.
<!-- {"id":"COMPTIA-A-1202-Q107","objective":"3.3","type":"diagnosis","source":"OBJ1202","locator":"Objective 3.3 mobile OS security issues, updates","verified":"2026-10-10"} -->

---

### Q108
A user finds their phone sending texts they never wrote to their contacts with a shopping link. What should they do first?
- A) Change the ringtone
- B) Buy the products quickly
- C) Disable the screen lock
- D) Check recently installed apps and remove the culprit, then warn contacts not to tap the link

**Answer: D**
Self-sent messages are the classic sign of a compromised app or account. Identifying and removing the offending app (and checking account sessions), plus warning contacts, stops the spread; the other options do nothing about the cause.
<!-- {"id":"COMPTIA-A-1202-Q108","objective":"3.3","type":"diagnosis","source":"OBJ1202","locator":"Objective 3.3 mobile application security issues","verified":"2026-10-10"} -->

---

### Q109
A PC's browser redirects every search to an unfamiliar engine, and unknown "security" pop-ups appear even on the desktop. The antivirus reports nothing. What is the best next step?
- A) Accept the pop-ups' advice
- B) Replace the keyboard
- C) Increase the screen resolution
- D) Run a second-opinion/on-demand scanner and inspect installed programs and browser extensions

**Answer: D**
Search hijacks and desktop scare pop-ups with a clean primary scan call for a second-opinion scanner and a manual audit of programs and extensions. Trusting the pop-ups themselves is how the infection deepens.
<!-- {"id":"COMPTIA-A-1202-Q109","objective":"3.4","type":"diagnosis","source":"OBJ1202","locator":"Objective 3.4 troubleshoot PC security issues, browser hijack","verified":"2026-10-10"} -->

---

### Q110
A user cannot log into Windows because "the password was changed" and they did not change it. What is the security-correct response sequence?
- A) Delete the user folder
- B) Secure the account (reset via official recovery from a clean device), then investigate the machine for compromise
- C) Keep trying the old password for a month
- D) Post about it on social media with the old password

**Answer: B**
An unexplained password change is a possible account takeover: regain control through official recovery, enable MFA, then examine the machine and sign-in history for how it happened. Treating it as a glitch invites a repeat.
<!-- {"id":"COMPTIA-A-1202-Q110","objective":"3.4","type":"diagnosis","source":"OBJ1202","locator":"Objective 3.4 PC security issues, account compromise","verified":"2026-10-10"} -->

---

### Q111
A workstation shows a full-screen message claiming to be from law enforcement demanding a "fine" to unlock the PC. What is this and the correct response?
- A) A screen saver; wiggle the mouse
- B) Ransom/scam lock screen; do not pay, boot to safe/offline scanning and clean or rebuild
- C) A genuine police action; pay promptly
- D) A Windows feature; enter a credit card

**Answer: B**
Fake authority lock screens are extortion malware. Real agencies do not lock PCs for payment. Offline cleaning or rebuild from backup is the remedy; paying funds the campaign and does not guarantee release.
<!-- {"id":"COMPTIA-A-1202-Q111","objective":"3.4","type":"diagnosis","source":"OBJ1202","locator":"Objective 3.4 PC security issues, ransom scams","verified":"2026-10-10"} -->

---

### Q112
A user's fan suddenly roars whenever the browser opens a certain "news" tab, and the laptop gets hot. Task Manager shows the browser consuming 90 percent CPU on that tab. What is the likely cause?
- A) The Wi-Fi is too fast
- B) The page is running hidden cryptomining scripts
- C) The CPU is too old
- D) The screen is too bright

**Answer: B**
A single tab pegging the CPU with heat and fan noise is the signature of in-browser cryptomining scripts. Closing the tab, blocking scripts/ads, and avoiding the site resolves it; hardware is innocent.
<!-- {"id":"COMPTIA-A-1202-Q112","objective":"3.4","type":"diagnosis","source":"OBJ1202","locator":"Objective 3.4 PC security issues, cryptomining symptoms","verified":"2026-10-10"} -->

---

### Q113
After a phishing incident, IT wants to check whether the user's PC made outbound connections to the attacker's server. Which local evidence helps most?
- A) The printer's page count
- B) Network connection history/logs and DNS cache on the machine, plus firewall logs
- C) The screen saver settings
- D) The keyboard repeat rate

**Answer: B**
Connection and DNS records reveal which hosts the machine contacted and when, letting IT match the phish timeline to outbound traffic. Cosmetic and peripheral data carry no network evidence.
<!-- {"id":"COMPTIA-A-1202-Q113","objective":"3.4","type":"diagnosis","source":"OBJ1202","locator":"Objective 3.4 troubleshoot PC security issues, investigation","verified":"2026-10-10"} -->

---

### Q114
A family PC shared by teens keeps ending up with toolbars and "free game" launchers. What two changes most reduce recurrence? (Choose two.)
- A) Standard (non-admin) accounts for the teens
- B) A rule to install apps only from the official store or with an adult
- C) A bigger monitor
- D) A guest account with admin rights
- E) Disabling the antivirus so installs stop being blocked

**Correct Answer: A, B**
Most junkware needs install rights; standard accounts plus a store-only rule remove both the ability and the supply. Admin access for everyone or a disabled guard makes recurrence certain.
<!-- {"id":"COMPTIA-A-1202-Q114","objective":"3.4","type":"diagnosis","source":"OBJ1202","locator":"Objective 3.4 PC security issues, prevention","verified":"2026-10-10"} -->

---

### Q115
A Windows PC shows "Your organization manages some settings" on a personal home computer, and unfamiliar settings are locked. The user never joined a company. What should the technician investigate?
- A) Whether the monitor is compatible
- B) Whether the mouse needs charging
- C) Whether the speakers are too loud
- D) Whether a work/school account was added or a policy/management profile was installed (possibly by unwanted software)

**Answer: D**
That message means management policies are applied to the machine. On a personal PC it can come from an added work account, a leftover management profile, or unwanted software setting policies. Reviewing accounts and profiles identifies the source.
<!-- {"id":"COMPTIA-A-1202-Q115","objective":"3.1","type":"diagnosis","source":"OBJ1202","locator":"Objective 3.1 Windows OS issues, policies","verified":"2026-10-10"} -->

---

### Q116
A user's laptop takes five minutes to reach a usable desktop, and Task Manager shows disk at 100 percent long after sign-in. The machine has a mechanical hard drive and twenty startup items. What are the two highest-value fixes? (Choose two.)
- A) Trim unnecessary startup items
- B) Upgrade to a solid-state drive
- C) Add more desktop icons
- D) Replace the screen
- E) Change the desktop theme daily

**Correct Answer: A, B**
Slow boot with saturated disk is startup load on slow storage. Cutting startup items reduces the work, and an SSD removes the bottleneck outright. Display and theme changes touch neither cause.
<!-- {"id":"COMPTIA-A-1202-Q116","objective":"3.1","type":"diagnosis","source":"OBJ1202","locator":"Objective 3.1 Windows OS issues, slow boot","verified":"2026-10-10"} -->

---

### Q117
An app worked yesterday but today errors with "missing DLL" after a cleanup tool ran. What is the most efficient repair?
- A) Reinstall or repair the affected application to restore its files
- B) Download random DLLs from the internet
- C) Replace the hard drive
- D) Run the cleanup tool again

**Answer: A**
Cleanup tools sometimes remove files applications still need; the app's own repair/reinstall restores exactly those files. Downloading loose DLLs from random sites is a security risk and version gamble.
<!-- {"id":"COMPTIA-A-1202-Q117","objective":"3.1","type":"diagnosis","source":"OBJ1202","locator":"Objective 3.1 Windows OS issues, application faults","verified":"2026-10-10"} -->

---

### Q118
A phone gets warm and slow only when maps run, then recovers when maps close. What is the sensible interpretation?
- A) The phone is haunted
- B) The battery must be punctured
- C) The screen is defective
- D) Maps is resource-intensive (GPS, data, rendering); if it persists, update the app or check for a stuck download

**Answer: D**
Sustained GPS, data, and 3D rendering legitimately tax a phone; warmth under that load is normal, and recovery afterward rules out a fault. Persistent misbehavior points to a stale app version or a stuck background download.
<!-- {"id":"COMPTIA-A-1202-Q118","objective":"3.2","type":"diagnosis","source":"OBJ1202","locator":"Objective 3.2 mobile application issues, performance","verified":"2026-10-10"} -->

---

### Q119
A user's email app on their phone stopped syncing two days ago; everything else has connectivity. The mail provider announced a required app-password change for third-party clients. What is the fix?
- A) Delete all email older than a week
- B) Update the account credentials in the app per the provider's new requirement
- C) Reset the phone to factory settings
- D) Replace the SIM card

**Answer: B**
A provider-side authentication change breaks only the affected service while the rest of the phone stays online, matching the symptom exactly. Updating credentials restores sync; wipes and SIM swaps do not address provider policy.
<!-- {"id":"COMPTIA-A-1202-Q119","objective":"3.2","type":"diagnosis","source":"OBJ1202","locator":"Objective 3.2 mobile application issues, sync","verified":"2026-10-10"} -->

---

### Q120
A PC's clock loses minutes every week and scheduled tasks fire late. The machine is otherwise healthy and always on. What should the technician check first?
- A) The printer's clock
- B) Internet time synchronization settings against a reliable time server
- C) The monitor's refresh rate
- D) The keyboard's battery

**Answer: B**
A drifting clock on a healthy running machine is a time-sync configuration issue: pointing the OS at a working time server keeps it disciplined. On a machine that also loses time while off, the CMOS battery would be the suspect.
<!-- {"id":"COMPTIA-A-1202-Q120","objective":"3.1","type":"diagnosis","source":"OBJ1202","locator":"Objective 3.1 Windows OS issues, time/settings","verified":"2026-10-10"} -->

---
