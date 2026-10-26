# CompTIA A+ Core 2 — Domain 1 beginner bank (operating systems)

## Domain 1: Operating Systems (220-1202)

---

### Q9
A point-of-sale terminal runs a single fixed application on dedicated hardware and offers no general desktop. Which operating system category does this describe?
- A) A workstation operating system
- B) A server operating system
- C) An embedded operating system
- D) A virtual desktop operating system

**Answer: C**
An embedded operating system ships inside a device whose job is not general computing: kiosks, point-of-sale terminals, network appliances. A workstation OS (A) is built for an interactive user running whatever applications they choose; a server OS (B) is tuned for many concurrent service connections; a virtual desktop (D) is a workstation desktop hosted on shared infrastructure, which this device clearly is not.

---

### Q10
A user reports that a new laptop shows only 3.5 GB of usable memory even though 8 GB is installed. Which condition explains the shortfall?
- A) A 32-bit operating system is installed
- B) The memory modules are running in single-channel mode
- C) The BIOS has disabled half of the memory
- D) One of the two memory modules has failed

**Answer: A**
A 32-bit operating system can address about 4 GB in total, and some of that space is reserved for hardware, so it reports roughly 3.5 GB regardless of how much is installed. Memory channel mode (B) affects bandwidth, not the reported total; a firmware setting that hides half the memory (C) is unusual and would be visible in the firmware screen; a failed module (D) would typically leave the machine unbootable or reporting the other half only, and would be the thing to check after the architecture is ruled out.

---

### Q11
A technician must add a second physical disk of 4 TB to an existing Windows machine that boots through UEFI. Which partition style is required?
- A) MBR
- B) GPT
- C) NTFS
- D) exFAT

**Answer: B**
GPT is the partition scheme that supports disks larger than 2 TB and is the one UEFI systems use. MBR (A) caps a disk at 2 TB, which is exactly the limit this disk exceeds. NTFS (C) and exFAT (D) are file systems that live inside a partition; they do not decide how the partition table is laid out.

---

### Q12
A department must move 20 Windows machines to a newer release of the same operating system while keeping installed applications and user files. Which approach preserves both with the least reconfiguration?
- A) A clean install with data migration from a backup
- B) A repair install of the existing release
- C) An in-place upgrade
- D) Reimaging from a standard corporate image

**Answer: C**
An in-place upgrade replaces the operating system while preserving applications, settings and user data, which is the stated requirement. A clean install (A) erases applications and requires every one to be reinstalled; a repair install (B) repairs the current release rather than moving to a new one; reimaging (D) is a clean install with a standard build and discards what the users had installed.

---

### Q13
After a clean installation, a new desktop has no network connectivity at all: the adapter does not appear under Network adapters in Device Manager, and the machine cannot ping its own gateway. Which installation step was most likely missed?
- A) Activating Windows
- B) Formatting the system partition with NTFS
- C) Installing the network adapter driver from the vendor
- D) Creating a recovery partition

**Answer: C**
A missing network driver is why a fresh install has no connectivity at all: the hardware is present, but nothing binds to it, and the fix is to install the vendor driver rather than relying on what Setup provided. Activation (A) is a licensing step and installs no drivers; the file system (B) is already in use because the system boots and runs; a recovery partition (D) is a repair convenience with no bearing on connectivity.

---

### Q14
An office needs full-disk encryption, the ability to join the company domain, and the Remote Desktop host feature on its workstations. Which Windows edition satisfies all three with no add-on software?
- A) Home
- B) Education
- C) Standard
- D) Pro

**Answer: D**
Windows Pro includes BitLocker, domain join, Remote Desktop host and Hyper-V; Home lacks all of them. Home (A) is the edition the requirement rules out first. Education (B) tracks Enterprise for schools and does include these features, but it is licensed for educational institutions rather than a general office. Standard (C) is not a current Windows client edition name.

---

### Q15
A workstation is taking several minutes to reach a usable desktop, and the user has not changed anything. Which tool best shows which programs are delaying sign-in?
- A) Device Manager
- B) Disk Management
- C) The Startup tab in Task Manager
- D) The Services console

**Answer: C**
The Startup tab lists every program set to run at sign-in and reports each one's impact, which is exactly the ranking needed to find the delay. Device Manager (A) shows hardware and driver state, not sign-in load; Disk Management (B) shows partitions and volumes; the Services console (D) lists background services but does not rank their effect on the user's logon time.

---

### Q16
A user says an application closes itself a few seconds after launch. Which tool should the technician check first for the recorded error?
- A) Event Viewer
- B) Resource Monitor
- C) System Configuration
- D) Windows Update history

**Answer: A**
Event Viewer records application errors with a faulting module and an error code, which turns "it just closes" into a specific cause. Resource Monitor (B) shows current CPU, memory and disk activity but keeps no history of the crash. System Configuration (C) controls startup and boot options; it does not record application faults. Update history (D) matters only if the fault began with an update, and it does not explain the crash on its own.

---

### Q17
A second internal drive has been installed and is visible in the firmware, but it does not appear in File Explorer. Which tool is used to initialize it, partition it and assign a drive letter?
- A) Device Manager
- B) Storage Spaces
- C) The Disk Cleanup utility
- D) Disk Management

**Answer: D**
Disk Management initializes a new disk, creates a volume on it, formats that volume and assigns the drive letter that makes it visible. Device Manager (A) would show the disk as present and working, which is exactly the state described. Storage Spaces (B) pools disks into a new virtual volume, which is a different design. Disk Cleanup (C) removes files from existing volumes.

---

### Q18
A laptop has an address in the correct subnet but cannot reach anything outside it, and the technician suspects the lease is stale. Which command requests a new address from the DHCP server?
- A) ipconfig /flushdns
- B) ipconfig /release followed by ipconfig /renew
- C) netstat -an
- D) nslookup

**Answer: B**
`ipconfig /release` gives up the current lease and `ipconfig /renew` requests a new one, which is the pair for a stale or wrong DHCP lease. `/flushdns` (A) clears the local name cache and does not touch addressing. `netstat -an` (C) lists current connections and listening ports. `nslookup` (D) queries DNS records and cannot change an address.

---

### Q19
A machine runs but reports that critical system files are damaged. Which command scans and repairs protected Windows system files?
- A) chkdsk /f
- B) diskpart
- C) sfc /scannow
- D) format

**Answer: C**
`sfc /scannow` verifies protected system files and replaces damaged copies from the component store. `chkdsk /f` (A) repairs file system structures and bad sectors, which is a different layer. `diskpart` (B) manages partitions and volumes. `format` (D) erases a volume and would destroy the data the user needs.

---

### Q20
A technician must copy a large directory tree to a network share, preserve permissions and timestamps, and be able to resume after an interruption. Which command is appropriate?
- A) copy
- B) xcopy
- C) robocopy
- D) move

**Answer: C**
`robocopy` is built for exactly this job: it copies trees, can preserve security and timestamps, retries failed files, and can resume without recopying what is already there. `copy` (A) handles single files with no tree support. `xcopy` (B) copies trees but is the older tool with weaker retry and resume behavior. `move` (D) relocates the source rather than copying it.

---

### Q21
A desktop is set to enter sleep after 15 minutes and the user wants it to stay awake while a long download runs. Which settings area controls sleep and power plan behavior?
- A) Privacy
- B) System, then Power and sleep
- C) Personalization
- D) Apps and features

**Answer: B**
Power and sleep settings hold the sleep timeout, screen-off timeout and the power plan, which is where the change belongs. Privacy (A) governs permissions and telemetry. Personalization (C) covers appearance. Apps and features (D) installs and removes software.

---

### Q22
Text on a new 4K monitor is unreadably small even though the resolution is correct. Which setting should the technician adjust?
- A) The refresh rate
- B) The color profile
- C) Display scaling
- D) The screen orientation

**Answer: C**
Display scaling enlarges text and interface elements without lowering the resolution, which is the purpose of the setting. Refresh rate (A) changes how often the screen redraws and does not change element size. The color profile (B) changes color reproduction. Orientation (D) rotates the image.

---

### Q23
A workstation's clock is 40 minutes slow, and the user has not changed the time zone. Which action addresses the cause rather than the symptom?
- A) Manually set the clock forward each morning
- B) Enable automatic time synchronization against a time server
- C) Change the time zone to a neighboring one
- D) Disable daylight saving time

**Answer: B**
A clock that drifts is a synchronization problem; pointing the machine at a reliable time source keeps it correct and also fixes the certificate and logon failures that a wrong clock causes. Setting the clock by hand (A) leaves the drift in place. Changing the time zone (C) makes the displayed time wrong in a different way. Disabling daylight saving (D) does not stop drift.

---

### Q24
A user on a public network cannot see the shared folder on a colleague's workstation, though both are on the same switch and can ping each other. The colleague's machine shows its network as Public. What is the most likely cause?
- A) The folder's share permissions are set to Read
- B) The two machines use different workgroup names
- C) The switch port is configured for the wrong VLAN
- D) The network profile is Public, so file sharing is blocked

**Answer: D**
On a Public network profile Windows disables network discovery and file sharing, so the share is invisible even though the hosts can reach each other. Read share permissions (A) would still let the folder be discovered. A different workgroup name (B) affects browsing but does not block a share reached by name. A wrong VLAN (C) would break the ping that is reported to be working.

---

### Q25
A small office of six computers has no central directory service, and each machine keeps its own local accounts. Which arrangement is this?
- A) A domain
- B) A workgroup
- C) A forest
- D) A trust relationship

**Answer: B**
A workgroup is peer to peer: each computer maintains its own accounts and there is no central authority. A domain (A) requires a directory service that holds the accounts. A forest (C) is a collection of domains in a directory service. A trust relationship (D) describes how domains allow access across their boundaries.

---

### Q26
A user's mapped network drive shows a red cross and asks for credentials every morning, though it works after the user signs in again. Which cause should be checked first?
- A) The share was deleted
- B) The drive letter conflicts with a local volume
- C) The network cable is faulty
- D) The user's password expired and the stored credential is stale

**Answer: D**
A mapped drive that reconnects only after the user signs in again is the classic symptom of a stored credential that no longer matches the account, most often after a password change. A deleted share (A) would not reconnect at all. A drive letter conflict (B) fails immediately and consistently. A faulty cable (C) would affect all network access, not one mapped drive.

---

### Q27
A macOS user wants a backup that runs automatically and can restore an individual file from last week. Which built-in feature provides this?
- A) iCloud Drive
- B) Disk Utility
- C) Time Machine
- D) Keychain Access

**Answer: C**
Time Machine takes automatic versioned backups and lets the user browse and restore a single file from an earlier date. iCloud Drive (A) syncs current documents and keeps no historical versions for restore. Disk Utility (B) repairs and manages disks. Keychain Access (D) stores credentials.

---

### Q28
A macOS user downloads an application from a developer website and macOS refuses to open it, saying the developer cannot be verified. Which feature is enforcing this?
- A) FileVault
- B) Gatekeeper
- C) The Keychain
- D) System Integrity Protection

**Answer: B**
Gatekeeper checks the signature and notarization of downloaded applications and blocks those it cannot verify. FileVault (A) encrypts the startup disk. The Keychain (C) stores passwords and certificates for the user. System Integrity Protection (D) protects system files from modification at run time, not application launch.

---

### Q29
A Mac's startup disk shows a file system that supports snapshots, strong encryption and space sharing. Which file system is it?
- A) HFS+
- B) NTFS
- C) ext4
- D) APFS

**Answer: D**
APFS is the modern Apple file system, with snapshots, native encryption and space sharing across volumes in a container. HFS+ (A) is the predecessor without those features. NTFS (B) is Microsoft's file system. ext4 (C) is the common Linux file system.

---

### Q30
A Linux workstation must install a package, and the distribution uses the apt tool. Which command installs it with the required privileges?
- A) apt install <package> as the logged-in user
- B) sudo apt install <package>
- C) systemctl install <package>
- D) chmod +x <package>

**Answer: B**
Installing software changes system directories, so it needs elevation, which `sudo` provides on the standard Linux model. Running apt as an ordinary user (A) fails on permissions. `systemctl` (C) manages services, not packages. `chmod +x` (D) changes a file's execute bit and installs nothing.

---

### Q31
A Linux service that worked when started by hand does not start after a reboot. Which command makes it start automatically at boot?
- A) systemctl start <service>
- B) systemctl status <service>
- C) systemctl enable <service>
- D) systemctl restart <service>

**Answer: C**
`enable` creates the links that start the unit at boot; `start` alone only runs it in the current session, which is exactly the behavior described. `start` (A) is what the technician already did. `status` (B) reports state without changing it. `restart` (D) stops and starts the service now, with the same limitation as `start`.

---

### Q32
A user needs a 32-bit application to run on a 64-bit Windows machine. What is the expected result?
- A) It runs, because 64-bit Windows supports 32-bit applications
- B) It fails, because 64-bit Windows cannot run 32-bit software
- C) It runs only in safe mode
- D) It runs only if the machine is joined to a domain

**Answer: A**
64-bit Windows includes a compatibility layer that runs 32-bit applications normally; the reverse, a 64-bit application on a 32-bit OS, is the combination that fails. Option B states the inverse of the truth. Safe mode (C) is a diagnostic environment, not a compatibility requirement. Domain membership (D) has no bearing on application architecture.

---

### Q33
An application installs correctly but exits immediately with an error naming a runtime component that is not present. What is the correct next step?
- A) Reinstall Windows
- B) Install the required runtime or dependency
- C) Run the application as an administrator
- D) Move the application to a different drive

**Answer: B**
The error names a missing dependency, so the fix is to install that runtime or library at the version the application requires. Reinstalling the OS (A) is far beyond the fault. Running as administrator (C) changes privileges, not the presence of a library. Moving the application (D) changes no dependency.

---

### Q34
An administrator must deploy the same application to 40 workstations without visiting each one. Which method fits?
- A) Copy the installer to a USB drive and walk the office
- B) Publish the installer on a network share and use a scripted silent install
- C) Ask each user to download and run the installer
- D) Install it once and copy the program folder to each machine

**Answer: B**
A network share plus a scripted silent install reaches every machine without a visit and runs without user interaction. Carrying a USB drive around (A) is the manual process being replaced. Asking users to install it themselves (C) produces 40 differently configured machines. Copying a program folder (D) skips registration and dependencies and is not an installation.

---

### Q35
A user opens a cloud document on a plane with no connection, edits it, and finds the edits present once the network returns. Which capability made this possible?
- A) The document was downloaded and edits were synchronized later
- B) The cloud provider edited the document from its own copy
- C) The application stored the edits only on the local disk forever
- D) The edits were e-mailed to the provider automatically

**Answer: A**
Cloud productivity suites keep a local copy with a sync client, so editing offline works and the changes upload when connectivity returns. The provider cannot edit on the user's behalf (B). Local-only storage (C) would mean the edits never reached the cloud. Automatic e-mail (D) is not how synchronization works.

---

### Q36
A company uses a browser-based spreadsheet service and no longer installs an office suite locally. Which service model is this?
- A) IaaS
- B) PaaS
- C) SaaS
- D) On-premises

**Answer: C**
Software as a service delivers a finished application over the network; the customer manages users and data, not the platform. IaaS (A) supplies virtual machines and storage. PaaS (B) supplies a runtime for the customer's own application. On-premises (D) is the model being replaced.

---

### Q37
A phone keeps every application inside its own sandbox, so one application cannot read another's files, and management is delivered through a remote enrollment service rather than a local administrator account. Which operating system category behaves this way?
- A) A mobile operating system
- B) A workstation operating system
- C) A server operating system
- D) An embedded operating system

**Answer: A**
Mobile operating systems sandbox each application, restrict background activity for power reasons, and are managed through a device management service instead of local administrator rights. A workstation OS (B) allows applications to share user profile areas and is administered locally. A server OS (C) serves many clients and is managed remotely, but its applications are not sandboxed per app. An embedded OS (D) runs a fixed function and is not managed per user.

---

### Q38
A small business finds that a needed security feature is missing from its Windows Home workstations. Which feature is available in Windows Pro but not in Home?
- A) Joining an Active Directory domain
- B) Connecting to a wireless network
- C) Using a local user account
- D) Running 32-bit applications

**Answer: A**
Domain join is a Pro feature, along with BitLocker, Remote Desktop host, Hyper-V and Group Policy. Wireless networking (B), local accounts (C) and 32-bit application support (D) are present in every current client edition, so none of them distinguishes Home from Pro.

---

### Q39
A company with several thousand PCs needs a Windows edition licensed for organizational deployment with the full management and security feature set for large enterprises. Which edition fits?
- A) Home
- B) Pro
- C) Enterprise
- D) Education

**Answer: C**
Enterprise is the edition intended for large organizations, with volume-license deployment and the fullest management feature set. Home (A) lacks domain join and BitLocker entirely. Pro (B) carries the core business features but not the broader enterprise tooling. Education (D) tracks Enterprise for schools and is licensed for educational institutions, not a general company.

---

### Q40
A Linux user creates a file named Report.txt, and a colleague creates report.txt in the same directory. Both files exist side by side. Which characteristic of the file system explains this?
- A) The file system is journaling
- B) Filenames are case-sensitive
- C) The files have different owners
- D) The directory uses symbolic links

**Answer: B**
Linux file systems treat upper and lower case as different characters, so the two names are distinct files. Journaling (A) describes crash recovery for metadata, not name comparison. Ownership (C) does not allow two identical names to coexist. Symbolic links (D) are separate directory entries pointing at other paths and are not what is described.

---

### Q41
Two people open the same cloud document at once, and each sees the other's edits appear within moments without anyone saving a file or mailing a copy. Which capability explains this?
- A) Each person keeps a private local copy that is merged the next day
- B) The document is locked so only one person can edit at a time
- C) The service holds one shared copy and synchronizes edits as they happen
- D) The edits are sent to the other person as e-mail attachments

**Answer: C**
Cloud productivity tools keep a single authoritative copy in the service and push changes to every open client as they occur, which is why both users see the same content live. A nightly merge (A) would not show edits within moments. A single-editor lock (B) would prevent the second person from editing at all. E-mail attachments (D) are a manual exchange, not synchronization.
