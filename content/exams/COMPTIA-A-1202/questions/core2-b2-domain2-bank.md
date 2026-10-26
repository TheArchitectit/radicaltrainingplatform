# CompTIA A+ Core 2 — Domain 2 beginner bank (security)

## Domain 2: Security (220-1202)

---

### Q42
A technician's daily account is a standard user account, and administrator rights are used only when a task requires them. Which security principle does this follow?
- A) Defense in depth
- B) Implicit deny
- C) Separation of duties
- D) Least privilege

**Answer: D**
Least privilege means an account holds only the rights its work needs at the moment, so routine browsing and mail run without administrator power. Defense in depth (A) is about layering controls. Implicit deny (B) is a default-deny rule for access decisions. Separation of duties (C) splits a sensitive process between different people so no single person can complete it alone.

---

### Q43
A server room is protected by a card reader, the racks are locked, and entry is recorded. Which category of control is this?
- A) Administrative
- B) Logical
- C) Physical
- D) Corrective

**Answer: C**
Card readers, locked racks and entry logs control access to the space and the equipment, which makes them physical controls. Administrative controls (A) are policy, training and process. Logical controls (B) are implemented in software, such as permissions and firewalls. Corrective controls (D) describe what restores service after an event, not what prevents entry.

---

### Q44
A service requires a password and then a six-digit code from an authenticator application on the user's phone. Which control is in use?
- A) Single sign-on
- B) Password complexity
- C) Multifactor authentication
- D) Account lockout

**Answer: C**
The password is something the user knows and the phone code is something the user has, so two different factor types are required. Single sign-on (A) is one login for several services. Password complexity (B) strengthens one factor. Account lockout (D) limits repeated failures.

---

### Q45
A shared folder grants the Everyone group Read at the share and Modify at the file system. A user opens a file and can read it but cannot save changes. What is the effective permission?
- A) Modify, because the file system permission is more permissive
- B) Read, because the more restrictive permission applies
- C) Full control, because Everyone is a member of both
- D) No access, because the two permission sets conflict

**Answer: B**
When share and file system permissions both apply, the effective access is the more restrictive of the two, so Read wins over Modify. Asking for the more permissive result (A) inverts the rule. Full control (C) is not granted by either layer. A conflict does not produce a denial (D); it produces the narrower right.

---

### Q46
A user tries to install a driver and a prompt appears asking for administrator approval, even though the user is signed in with an administrator account. What does this prompt enforce?
- A) The firewall profile
- B) The network access protection level
- C) User Account Control elevation
- D) BitLocker pre-boot authentication

**Answer: C**
User Account Control holds administrator rights back until a task needs them and asks for confirmation at that moment, which is why even an administrator sees the prompt. The firewall profile (A) governs network traffic. Network access protection (B) decides what a connecting device may reach. BitLocker (D) unlocks an encrypted volume at boot.

---

### Q47
A security policy locks an account for 15 minutes after five failed sign-in attempts. Which attack does this setting most directly limit?
- A) A phishing message that asks for a password
- B) A malicious USB device plugged into a workstation
- C) An unencrypted laptop being stolen
- D) Repeated password guessing against one account

**Answer: D**
A lockout threshold slows repeated guesses against a single account by making the attacker wait after each small burst. Phishing (A) captures a password without guessing it. A malicious USB device (B) is a physical attack. A stolen laptop (C) is addressed by encryption, not by lockout.

---

### Q48
A small business still runs a wireless network with WEP because an old scanner only supports that standard. What should the technician recommend?
- A) Keep WEP, because the scanner requires it
- B) Add a longer WEP key and continue
- C) Isolate the legacy device and move the main network to WPA2 or WPA3
- D) Hide the network name so the weakness cannot be found

**Answer: C**
WEP encryption is broken and a longer key does not repair it; isolating the device that cannot be upgraded limits the exposure while the main network moves to current encryption. Keeping WEP (A) and lengthening the key (B) leave the same exploitable protocol in place. Hiding the network name (D) is not a security control, because the name is still discoverable.

---

### Q49
An organization wants each wireless user authenticated individually against a central server rather than by a shared passphrase. Which combination provides this?
- A) A pre-shared key with a long passphrase
- B) MAC address filtering
- C) 802.1X with a RADIUS server
- D) A hidden SSID with WPS enabled

**Answer: C**
802.1X authenticates each supplicant against a RADIUS server, so every user has their own credential and revoking one does not change the network key. A pre-shared key (A) is one secret shared by everyone. MAC filtering (B) is a list of hardware addresses that can be spoofed and does not authenticate a person. A hidden SSID with WPS (D) hides nothing useful and adds a weak pairing method.

---

### Q50
Why should WPS be disabled on a small-office wireless router?
- A) It prevents the router from broadcasting its name
- B) Its PIN or push-button pairing is a weak path into the network
- C) It disables WPA2 encryption
- D) It prevents guests from connecting

**Answer: B**
WPS exists to make pairing easy, and the PIN method in particular has been shown to be guessable, so it offers an easier route in than the passphrase it bypasses. It does not control the broadcast name (A), it does not turn off WPA2 when unused (C), and guest access (D) is a separate feature.

---

### Q51
A workstation's files have been replaced by extension-renamed copies with a payment note, and the machine is still on the network. Which action should come first?
- A) Pay the demand and restore the files afterwards
- B) Disconnect the machine from the network, then restore from an offline backup
- C) Run a disk cleanup and reinstall the affected applications
- D) Rename the files back and keep working

**Answer: B**
Ransomware is still spreading while the host is connected, so isolation comes before recovery, and an offline copy is the one an attacker cannot encrypt. Paying (A) funds the attack and does not guarantee recovery. Disk cleanup and reinstalling applications (C) do not touch encrypted data. Renaming files (D) does not reverse block encryption and leaves the host infected.

---

### Q52
During malware removal, a technician disables System Restore before cleaning the machine. Why?
- A) To free disk space for the cleaning tools
- B) To stop Windows updates during the repair
- C) To remove the user's personal files
- D) So the infection cannot return from a restore point

**Answer: D**
An infected restore point can bring the malware back after a successful clean, so restore points are disabled for the duration and re-enabled afterwards with a fresh clean point. Freeing space (A) is not the reason. Updates (B) are unaffected. Personal files (C) are not removed by this step.

---

### Q53
A scan reports a rootkit, and the operating system no longer behaves as it should. Which remediation is most reliable?
- A) Run the same scan again until it reports clean
- B) Delete the files the scan named
- C) Reimage the machine from a known-good build
- D) Change the user's password and continue

**Answer: C**
A rootkit hides inside the operating system itself, so tools running under that operating system cannot be trusted to report accurately; rebuilding from a known-good image is the reliable path. Repeating the scan (A) assumes the scanner sees the truth. Deleting named files (B) may miss the hidden components. Changing a password (D) addresses an account, not the infected system.

---

### Q54
A small office wants visitors to use wireless internet without reaching the file server or the printers. Which configuration achieves this?
- A) Put visitors on a separate guest network isolated from the internal network
- B) Give visitors the internal wireless password and ask them not to browse shares
- C) Hide the internal network name from visitors
- D) Reduce the wireless transmit power so the signal does not leave the room

**Answer: A**
A guest network is a separate segment with its own access rules, so visitors get internet access and nothing else. Sharing the internal password (B) relies on good behavior and gives full access. Hiding the name (C) is not access control. Reducing transmit power (D) limits range but not what a connected visitor can reach.

---

### Q55
A small business wants to block categories of websites for staff during work hours and allow them outside those hours. Which control does this?
- A) A content filter on the firewall or gateway
- B) A stronger wireless passphrase
- C) An antivirus scan schedule
- D) A screen-lock timeout

**Answer: A**
A content filter classifies traffic by site category and applies rules, including schedules, at the firewall or gateway. A passphrase (B) controls who joins the network, not what they visit. Antivirus schedules (C) scan files locally. Screen locking (D) protects an unattended session.

---

### Q56
A remote worker must reach internal file shares over a public network as though on site. Which technology fits?
- A) A remote desktop session to a personal home computer
- B) A guest wireless network at the office
- C) A VPN connection to the office gateway
- D) A mapped drive over the open internet

**Answer: C**
A VPN builds an encrypted tunnel from the remote device to the office gateway, so internal resources are reachable with the same access controls as on site. A remote desktop to a home machine (A) creates a different path with its own exposure and does not place the device on the internal network. A guest network (B) is for visitors on site. A mapped drive across the open internet (D) sends file traffic unencrypted and cannot cross the firewall as described.

---

### Q57
A workstation is left unattended in a shared office. Which setting most directly prevents a passer-by from using the signed-in session?
- A) A screen saver with no password
- B) A longer user password
- C) A BIOS boot password
- D) A screen lock with a short idle timeout

**Answer: D**
Locking the session after a short idle period means the signed-in desktop requires the password again before use. A screen saver without a password (A) hides the screen but leaves the session open. A longer password (B) helps against guessing but does not close an open session. A boot password (C) is asked before the operating system loads and does nothing for a session already running.

---

### Q58
A user regularly plugs in USB drives found in the office parking lot. Which control most directly addresses this risk?
- A) Disabling autorun and blocking unauthorized media
- B) Increasing the antivirus scan frequency
- C) Enabling BitLocker on the system drive
- D) Adding a stronger password policy

**Answer: A**
Unknown media carrying malware is the risk, so preventing automatic execution and blocking unauthorized devices stops the attack at the point of insertion. More frequent scans (B) may not run before the payload acts. Full-disk encryption (C) protects data at rest if the machine is lost. Password policy (D) does not affect removable media.

---

### Q59
Which combination is the baseline hardening for a workstation that handles company data?
- A) Endpoint protection, automatic updates, host firewall and full-disk encryption
- B) A local administrator account for every user and no updates during the week
- C) A shared password that everyone knows and a printed copy on the desk
- D) Disabling the firewall to avoid application prompts

**Answer: A**
Endpoint protection, current patches, a host firewall and encryption are the core set that covers malware, vulnerabilities, network exposure and a lost device. Administrator rights for every user (B) removes least privilege, and skipping updates leaves known holes. A shared password (C) destroys individual accountability. Disabling the firewall (D) removes a layer rather than managing it.

---

### Q60
A personal phone holds both company mail and personal photos, and the company must be able to remove the work data if the phone is lost. Which arrangement meets this?
- A) A full device wipe of everything on the phone
- B) A managed container that can be selectively wiped
- C) Backing up the phone weekly
- D) Asking the user to delete the mail application

**Answer: B**
Containerization separates company data into a managed, encrypted area that can be removed while personal data remains, which is the standard design for a personal device. A full wipe (A) would destroy personal photos. Backups (C) preserve data but do not remove access. Manual deletion (D) cannot be enforced and may not happen.

---

### Q61
A user's phone has been rooted so they can install applications from outside the store. Which statement is correct from a security standpoint?
- A) Rooting is harmless because it only affects the user's own device
- B) Rooting improves security by giving the user more control
- C) Rooting only affects battery life
- D) Rooting removes platform protections, so treat the device as non-compliant

**Answer: D**
Rooting or jailbreaking removes the operating system's own restrictions, which are the protections that sandbox applications and enforce policy, so a managed device with company data should be treated as non-compliant. Device-only impact (A) ignores shared data on that device. Increased control (B) is privilege, not protection. Battery life (C) is beside the point.

---

### Q62
A simple flashlight application requests access to contacts, location and the microphone. What is the appropriate response?
- A) Grant everything, because the application will not run otherwise
- B) Deny the permissions the application does not need for its function
- C) Grant access only while charging
- D) Uninstall the operating system

**Answer: B**
Application permissions should match what the app actually does, and a flashlight has no reason to need contacts or a microphone, so those requests are refused (and the app is reconsidered). Granting everything (A) hands over data the function never required. A charging-only restriction (C) is not a permission model. Reinstalling the OS (D) is wildly disproportionate.

---

### Q63
A technician must dispose of failed solid-state drives. Why is degaussing the wrong method?
- A) It damages the drive's connectors
- B) It requires the drive to be powered on
- C) Flash memory stores no magnetic field for a degausser to erase
- D) It makes the drive unreadable but leaves the data recoverable

**Answer: C**
Degaussing erases magnetic media such as hard disk platters; flash memory stores charge, not magnetism, so a degausser leaves the data in place. Connector damage (A) is not the issue. A degausser does not need the drive powered (B). Leaving data recoverable (D) describes the result of not erasing, which is the outcome rather than the reason the method is unsuitable.

---

### Q64
A user is returning a leased laptop and has deleted all files and emptied the recycle bin. Why is this insufficient?
- A) Deleted files stay recoverable until the space is overwritten
- B) The recycle bin must be emptied twice
- C) The laptop must be defragmented first
- D) Deleting files changes their extension only

**Answer: A**
Deleting removes the directory entry, not the data, so recovery tools can still read the content; a secure erase or overwrite pass is required. Emptying the bin twice (B) does not change the underlying behavior. Defragmenting (C) rearranges files and does not erase them. An extension change (D) describes renaming, not deleting.

---

### Q65
An organization must prove to an auditor that retired drives were destroyed. Which documentation most directly provides that proof?
- A) A ticket saying the drives were removed from service
- B) An inventory list of the drive serial numbers
- C) A photograph of the storage room
- D) A certificate of destruction from the disposal vendor

**Answer: D**
A certificate of destruction records the method, date and media identifiers and is the evidence an auditor can act on. A service ticket (A) shows intent but not destruction. A serial-number list (B) shows what existed. A photograph (C) proves nothing about the drives' fate.

---

### Q66
A new small-office router is still using the administrator password printed on its label. What is the first change to make?
- A) Set a unique administrator password
- B) Change the wireless channel
- C) Rename the printer
- D) Increase the DHCP lease time

**Answer: A**
The factory administrator password is widely known and often published, so it must be replaced before anything else on the device is configured. The channel (B) and lease time (D) are performance settings. Renaming a printer (C) is unrelated to the router.

---

### Q67
A small office router has remote administration and universal plug-and-play enabled so devices can open ports as needed. Why is this a concern?
- A) It slows down wireless throughput and increases latency
- B) It exposes administration and opens ports without review
- C) It prevents guests from connecting
- D) It encrypts local traffic twice

**Answer: B**
Remote administration widens the attack surface to the internet, and automatic port mapping lets software create inbound rules nobody reviewed. Throughput (A) is not the security issue. Guest access (C) is unrelated. Double encryption (D) does not describe either feature.

---

### Q68
Which set of changes best secures a small-office wireless network?
- A) WPA3 or WPA2 encryption, WPS disabled, firmware current and a strong unique passphrase
- B) The network name hidden, MAC filtering enabled and WEP as a fallback
- C) A long passphrase with WPS enabled for convenience
- D) Open authentication with a captive portal only

**Answer: A**
Current encryption with a strong unique passphrase, WPS off and updated firmware closes the known weak points. Hiding the name with MAC filtering and a WEP fallback (B) pairs two weak measures with one broken protocol. WPS (C) reintroduces the weak pairing path. Open authentication (D) offers no encryption at all.

---

### Q69
A browser shows a certificate warning for a site a user visits every day. What should the user do?
- A) Continue to the site, because it worked yesterday
- B) Stop, and report it so the certificate or connection can be checked
- C) Disable certificate checking in the browser settings
- D) Switch to a different browser and continue

**Answer: B**
A warning on a site that normally works can indicate an expired, misissued or intercepted certificate, so the safe response is to stop and have it checked. Continuing (A) assumes the change is benign. Disabling the check (C) removes the protection permanently. Another browser (D) applies the same check or may be less strict, and does not address the cause.

---

### Q70
A user in private browsing mode believes the session is invisible. What should the technician explain?
- A) Private browsing hides activity from the network administrator and the service provider
- B) Private browsing encrypts all traffic end to end
- C) Private browsing prevents malware infection
- D) Private browsing limits local history; the network and sites still see traffic

**Answer: D**
Private browsing avoids saving local history, cookies and form data on that device; it does not hide traffic from the network it crosses or from the sites visited. Claiming it hides activity from administrators (A) overstates it. End-to-end encryption (B) is a property of the connection, not of the mode. Malware protection (C) is unrelated.

---

### Q71
A user on a shared computer wants to keep a signed-in account from carrying over to the next person. Which action addresses this?
- A) Sign out of the account and clear cache and cookies
- B) Increase the browser zoom level
- C) Enable the pop-up blocker
- D) Change the home page to a search engine

**Answer: A**
Signing out ends the session and clearing cache and cookies removes the stored session data that would otherwise restore access. Zoom (B), the pop-up blocker (C) and the home page (D) are preference changes that leave the account and its stored data in place.
