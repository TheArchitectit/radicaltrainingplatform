# CompTIA A+ Core 2 (220-1202) Practice Questions - Part 1
# Original study items. Independent material, not official or endorsed by CompTIA.

## DOMAIN 1: Operating Systems (study allocation)

---

### Q1
A kiosk in a museum lobby runs one interactive exhibit all day, boots straight into it, and needs no desktop for visitors. Which OS type best fits this role?
- A) A server OS with mail roles
- B) A mobile phone OS with a stylus
- C) A kiosk/embedded-style single-purpose build
- D) A full desktop workstation edition

**Answer: C**
Single-purpose appliances are best served by locked-down kiosk or embedded-style builds that boot to one application and expose nothing else. A full desktop invites tampering, and server or mobile roles solve different problems.
<!-- {"id":"COMPTIA-A-1202-Q001","objective":"1.1","type":"diagnosis","source":"OBJ1202","locator":"Objective 1.1 common OS types and purposes","verified":"2026-10-10"} -->

---

### Q2
A small business runs a file-and-print server that fifty staff connect to at once, with centralized accounts and scheduled backups. Which OS category belongs on that machine?
- A) A server operating system
- B) A mobile operating system
- C) A gaming-focused desktop build
- D) An embedded kiosk build

**Answer: A**
Server operating systems are built for many simultaneous client connections, centralized account management, and service roles like file, print, and backup. Desktop, mobile, and kiosk builds target single users or single purposes.
<!-- {"id":"COMPTIA-A-1202-Q002","objective":"1.1","type":"recall","source":"OBJ1202","locator":"Objective 1.1 OS types server vs workstation","verified":"2026-10-10"} -->

---

### Q3
A user asks why their phone and their laptop cannot simply run each other's programs even though both are "computers." What is the core reason?
- A) Programs are architecture-independent by design
- B) Applications are built for a specific operating system and CPU architecture
- C) Phones have no storage
- D) Laptops lack touchscreens by law

**Answer: B**
Software targets a particular OS platform and processor architecture; a desktop build and a mobile build differ on both axes, so their apps are not interchangeable without the vendor shipping versions for each platform.
<!-- {"id":"COMPTIA-A-1202-Q003","objective":"1.1","type":"recall","source":"OBJ1202","locator":"Objective 1.1 OS types and purposes","verified":"2026-10-10"} -->

---

### Q4
A school wants its thirty lab PCs to reset to a clean state every morning with no technician involved, while still allowing software updates once a month. Which OS deployment approach fits?
- A) Daily full disk encryption and decryption
- B) A managed image with scheduled re-imaging or restore-on-reboot
- C) Hand-built installs on each PC, never touched again
- D) Asking students to be careful

**Answer: B**
Labs standardize on a maintained image combined with automated restoration (re-image or reboot-restore), which guarantees a clean baseline daily while allowing monthly update windows. Manual per-PC builds drift and consume technician time.
<!-- {"id":"COMPTIA-A-1202-Q004","objective":"1.2","type":"diagnosis","source":"OBJ1202","locator":"Objective 1.2 OS installations and upgrades in diverse environments","verified":"2026-10-10"} -->

---

### Q5
Before upgrading a user's PC to a new Windows version, what should the technician verify first to avoid a failed or unbootable upgrade?
- A) Hardware compatibility and a verified backup of the user's data
- B) That the monitor supports 4K
- C) That the printer has paper
- D) That the keyboard is wireless

**Answer: A**
Upgrades fail on incompatible hardware and ruin days when data is unprotected. Checking the new version's hardware requirements and securing a tested backup are the two gates before starting. Peripherals unrelated to the install carry no upgrade risk.
<!-- {"id":"COMPTIA-A-1202-Q005","objective":"1.2","type":"diagnosis","source":"OBJ1202","locator":"Objective 1.2 perform OS installations and upgrades","verified":"2026-10-10"} -->

---

### Q6
A technician must install Windows on twenty identical new PCs by Friday. Which installation method saves the most labor?
- A) Deploy one prepared image to all machines over the network or from media
- B) Run the interactive installer by hand on each PC
- C) Install a different OS on each to compare
- D) Mail the PCs to the vendor

**Answer: A**
Image-based deployment captures one configured installation and applies it identically to many machines, turning twenty manual installs into one build plus automated rollout. Unattended answer files similarly strip out interactive steps.
<!-- {"id":"COMPTIA-A-1202-Q006","objective":"1.2","type":"diagnosis","source":"OBJ1202","locator":"Objective 1.2 OS installations in a diverse environment","verified":"2026-10-10"} -->

---

### Q7
A user wants their PC completely clean of a malware-riddled install, keeping nothing, with the drive fully reformatted. Which installation type matches?
- A) In-place upgrade
- B) Repair install
- C) Migration
- D) Clean install

**Answer: D**
A clean install wipes the target volume and installs fresh, leaving no trace of the compromised system. In-place upgrades and repair installs preserve (and can carry over) existing files, settings, and problems.
<!-- {"id":"COMPTIA-A-1202-Q007","objective":"1.2","type":"recall","source":"OBJ1202","locator":"Objective 1.2 installation types","verified":"2026-10-10"} -->

---

### Q8
A home user needs Remote Desktop hosting and BitLocker drive encryption on their new PC. Which Windows edition tier should they purchase?
- A) The education trial
- B) Any edition; features are identical
- C) The Pro (professional) tier or above
- D) The Home edition

**Answer: C**
Features such as hosting Remote Desktop sessions and BitLocker encryption sit in the professional tier of Windows editions; the Home tier lacks them. Edition selection is a real purchasing decision driven by feature requirements.
<!-- {"id":"COMPTIA-A-1202-Q008","objective":"1.3","type":"diagnosis","source":"OBJ1202","locator":"Objective 1.3 Microsoft Windows editions features","verified":"2026-10-10"} -->

---

### Q9
A company laptop must join the office's central directory domain so policies and accounts are managed centrally. Which Windows edition requirement applies?
- A) Only server editions can join domains as clients
- B) Domain join requires a Mac
- C) Domain join requires a business-tier edition (Pro/Enterprise), not Home
- D) Any Home edition joins domains natively

**Answer: C**
Joining an Active Directory domain is a business-edition feature; Home editions are limited to workgroup and consumer account models. Fleet-standardized companies buy the tier that supports their management model.
<!-- {"id":"COMPTIA-A-1202-Q009","objective":"1.3","type":"recall","source":"OBJ1202","locator":"Objective 1.3 Windows editions domain features","verified":"2026-10-10"} -->

---

### Q10
A user's PC is slow to start, and they ask which built-in tool shows which programs launch at sign-in so the technician can trim the list. Where do you look?
- A) The certificate store
- B) The Startup tab in Task Manager
- C) The display adapter properties
- D) The printer queue

**Answer: B**
Task Manager's Startup tab lists auto-starting applications with their measured startup impact and lets you disable them, which is the standard first pass on slow-boot complaints.
<!-- {"id":"COMPTIA-A-1202-Q010","objective":"1.4","type":"recall","source":"OBJ1202","locator":"Objective 1.4 Windows features and tools Task Manager","verified":"2026-10-10"} -->

---

### Q11
A technician suspects a failing drive is causing intermittent freezes and wants Windows to check the disk's file system for errors. Which built-in approach fits?
- A) Increase the screen timeout
- B) Clear the browser history
- C) Run the disk error-checking (chkdsk) tool on the volume
- D) Change the desktop wallpaper

**Answer: C**
The disk checking tool (chkdsk / the drive's error-checking button) scans and repairs file-system errors and can surface bad sectors, matching the symptom pattern. Cosmetic settings and browser data have no relation to storage faults.
<!-- {"id":"COMPTIA-A-1202-Q011","objective":"1.4","type":"diagnosis","source":"OBJ1202","locator":"Objective 1.4 Windows tools disk management","verified":"2026-10-10"} -->

---

### Q12
A user cannot find the setting to uninstall a desktop program and keeps deleting its desktop shortcut instead. What should the technician explain?
- A) The Recycle Bin uninstalls apps automatically
- B) Shortcuts are just pointers; programs are removed through the installed-apps settings or Control Panel
- C) Deleting shortcuts uninstalls the program after a reboot
- D) Programs can only be removed by the manufacturer

**Answer: B**
Removing a shortcut only deletes the pointer. Actual uninstall happens through the app's entry in the installed-apps list (Settings or Control Panel), which runs the application's removal routine and cleans its files and registrations.
<!-- {"id":"COMPTIA-A-1202-Q012","objective":"1.4","type":"diagnosis","source":"OBJ1202","locator":"Objective 1.4 Windows features, Settings vs Control Panel","verified":"2026-10-10"} -->

---

### Q13
A technician needs to see every process' live CPU, memory, disk, and network usage on a sluggish PC to find the resource hog. Which tool gives that per-process view?
- A) Device enrollment
- B) Font settings
- C) Task Manager (Processes/Performance tabs) or Resource Monitor for detail
- D) File Explorer

**Answer: C**
Task Manager shows live per-process resource consumption and overall graphs, and Resource Monitor breaks down disk, network, and memory usage in depth. Together they are the standard first look at a sluggish system.
<!-- {"id":"COMPTIA-A-1202-Q013","objective":"1.4","type":"diagnosis","source":"OBJ1202","locator":"Objective 1.4 Windows features and tools","verified":"2026-10-10"} -->

---

### Q14
A hardware device misbehaves after an update, and the technician wants to check its driver status and roll the driver back. Which console provides this?
- A) The clock control panel
- B) Device Manager
- C) Disk Cleanup
- D) Narrator settings

**Answer: B**
Device Manager enumerates hardware, surfaces driver errors (warning icons), and offers driver update, rollback, and disable actions. It is the canonical first stop for device-level faults.
<!-- {"id":"COMPTIA-A-1202-Q014","objective":"1.4","type":"recall","source":"OBJ1202","locator":"Objective 1.4 Device Manager","verified":"2026-10-10"} -->

---

### Q15
A technician must find a workstation's IP address, subnet mask, and default gateway quickly from the command line. Which command provides it?
- A) sfc
- B) format
- C) ipconfig
- D) chkdsk

**Answer: C**
ipconfig displays the machine's network configuration (address, mask, gateway, and with /all the DNS servers and MAC address). chkdsk checks disks, sfc verifies system files, and format erases volumes.
<!-- {"id":"COMPTIA-A-1202-Q015","objective":"1.5","type":"recall","source":"OBJ1202","locator":"Objective 1.5 Microsoft command-line tools ipconfig","verified":"2026-10-10"} -->

---

### Q16
Windows system files are suspected corrupt after an improper shutdown, causing odd crashes. Which command-line tool verifies and repairs protected system files?
- A) dir /s
- B) sfc /scannow
- C) ipconfig /all
- D) ping localhost

**Answer: B**
System File Checker (sfc /scannow) scans protected Windows system files and replaces corrupted copies from its cache. It is the standard first repair pass before deeper servicing or reinstallation.
<!-- {"id":"COMPTIA-A-1202-Q016","objective":"1.5","type":"diagnosis","source":"OBJ1202","locator":"Objective 1.5 command-line tools sfc","verified":"2026-10-10"} -->

---

### Q17
A user's mapped drive to the file server vanished after a reboot. Which command re-establishes a persistent drive mapping from the command line?
- A) ipconfig /renew
- B) tracert Z:
- C) shutdown /r
- D) net use Z: \\server\share /persistent:yes

**Answer: D**
The net use command creates and manages drive mappings to network shares, and the persistent flag restores them at each sign-in. ipconfig manages address leases, tracert traces routes, and shutdown reboots the machine.
<!-- {"id":"COMPTIA-A-1202-Q017","objective":"1.5","type":"diagnosis","source":"OBJ1202","locator":"Objective 1.5 command-line tools net use","verified":"2026-10-10"} -->

---

### Q18
A technician's DNS lookups return stale results for a server that was just readdressed. Which command clears the local resolver cache so fresh answers are fetched?
- A) sfc /purgecache
- B) netstat -r
- C) ipconfig /flushdns
- D) ipconfig /release

**Answer: C**
The resolver caches answers, and a readdressed server leaves stale entries; ipconfig /flushdns empties that cache. Releasing the lease or checking routes does not touch cached name answers.
<!-- {"id":"COMPTIA-A-1202-Q018","objective":"1.5","type":"diagnosis","source":"OBJ1202","locator":"Objective 1.5 ipconfig options","verified":"2026-10-10"} -->

---

### Q19
A technician wants to confirm a remote server is reachable and measure round-trip time. Which command-line tool is the first choice?
- A) ping
- B) defrag
- C) diskpart
- D) robocopy

**Answer: A**
ping sends echo requests and reports replies and round-trip times, the fastest reachability check. tracert extends it hop by hop when ping succeeds at one point but fails farther out.
<!-- {"id":"COMPTIA-A-1202-Q019","objective":"1.5","type":"recall","source":"OBJ1202","locator":"Objective 1.5 command-line tools ping","verified":"2026-10-10"} -->

---

### Q20
Name resolution works for internal servers but not internet sites on one PC. The technician wants to see which DNS server the PC actually queries and test lookups against it directly. Which tool does that?
- A) sfc
- B) msconfig
- C) nslookup
- D) chkdsk

**Answer: C**
nslookup queries DNS directly, showing which server answers and what it returns, and can test alternate servers explicitly. That isolates client configuration from server-side problems quickly.
<!-- {"id":"COMPTIA-A-1202-Q020","objective":"1.5","type":"diagnosis","source":"OBJ1202","locator":"Objective 1.5 command-line tools nslookup","verified":"2026-10-10"} -->

---

### Q21
A user reports their laptop never sleeps on battery and dies overnight in their bag. Where does the technician adjust power behavior for battery versus plugged-in?
- A) Power settings (Power Options) in Settings/Control Panel
- B) The font control panel
- C) The network sharing center only
- D) Device Manager's battery tab

**Answer: A**
Power Options govern sleep, display-off timers, and behavior on battery versus AC. A laptop that never sleeps usually has its plan misconfigured or overridden, and this is where that is corrected.
<!-- {"id":"COMPTIA-A-1202-Q021","objective":"1.6","type":"diagnosis","source":"OBJ1202","locator":"Objective 1.6 configure Microsoft Windows settings","verified":"2026-10-10"} -->

---

### Q22
A shared family PC needs separate desktops, files, and settings for each family member, with the kids restricted from installing software. What should the technician set up?
- A) One shared administrator account for everyone
- B) Guest access with full rights
- C) Separate power plans only
- D) Individual user accounts with standard (non-administrator) privileges for the kids

**Answer: D**
Per-user accounts isolate files and settings, and standard accounts prevent software installation and system changes without an admin approving. One shared admin account removes both privacy and protection.
<!-- {"id":"COMPTIA-A-1202-Q022","objective":"1.6","type":"diagnosis","source":"OBJ1202","locator":"Objective 1.6 user accounts and settings","verified":"2026-10-10"} -->

---

### Q23
An employee moving between office and home wants the laptop to remember each location's Wi-Fi and connect automatically, but never to random open hotspots. What should the technician configure?
- A) Saved known networks with auto-connect, and no automatic joining of unknown open networks
- B) A static IP for all locations
- C) Airplane mode schedules
- D) MAC address randomization off everywhere

**Answer: A**
Windows remembers known networks and can auto-join them while leaving auto-join of arbitrary open networks off, which is exactly the convenience-plus-safety combination requested. A single static IP would break one location or the other.
<!-- {"id":"COMPTIA-A-1202-Q023","objective":"1.7","type":"diagnosis","source":"OBJ1202","locator":"Objective 1.7 Windows networking features","verified":"2026-10-10"} -->

---

### Q24
A user on a work laptop cannot browse network shares at home after the IT team set the network profile to "Public." What does the Public profile do, and is it right for home use?
- A) It makes the PC discoverable to everyone
- B) It disables Wi-Fi entirely
- C) It speeds up the connection
- D) It hides the PC from other devices and tightens sharing; appropriate on untrusted networks

**Answer: D**
The Public network profile treats the network as untrusted: network discovery and sharing are suppressed so strangers cannot see the machine. At home with trusted devices the Private profile restores discovery and sharing.
<!-- {"id":"COMPTIA-A-1202-Q024","objective":"1.7","type":"diagnosis","source":"OBJ1202","locator":"Objective 1.7 Windows networking profiles","verified":"2026-10-10"} -->

---

### Q25
A technician must give a home-office user access to their office PC's shared folder over the LAN. What two things must align on the office PC? (Choose two.)
- A) File/printer sharing enabled with the share configured
- B) A user account and NTFS/share permissions granting that person access
- C) The Public network profile
- D) Airplane mode off on the client
- E) A second monitor

**Correct Answer: A, B**
Sharing requires the service and share to exist, and access requires the person's account to be authorized at both the share and file-system level. The Public profile would actually block discovery, and display hardware is irrelevant.
<!-- {"id":"COMPTIA-A-1202-Q025","objective":"1.7","type":"diagnosis","source":"OBJ1202","locator":"Objective 1.7 Windows networking features sharing","verified":"2026-10-10"} -->

---

### Q26
A Mac user asks where to adjust trackpad gestures, display settings, and default apps in one place. What is the macOS equivalent of Windows Settings?
- A) Finder's trash
- B) The App Store reviews page
- C) Mission Control
- D) System Settings (System Preferences on older versions)

**Answer: D**
macOS centralizes configuration in System Settings (formerly System Preferences): input devices, displays, networks, and defaults all live there. Finder manages files and Mission Control manages windows, not system configuration.
<!-- {"id":"COMPTIA-A-1202-Q026","objective":"1.8","type":"recall","source":"OBJ1202","locator":"Objective 1.8 macOS features and tools","verified":"2026-10-10"} -->

---

### Q27
A Mac runs slowly and the user suspects a runaway process. Which built-in macOS utility shows per-process CPU and memory usage like Task Manager does on Windows?
- A) Keychain Access
- B) Activity Monitor
- C) Time Machine
- D) Spotlight

**Answer: B**
Activity Monitor lists processes with live CPU, memory, energy, disk, and network usage and allows forcing quit. Time Machine handles backups, Spotlight searches, and Keychain stores credentials.
<!-- {"id":"COMPTIA-A-1202-Q027","objective":"1.8","type":"recall","source":"OBJ1202","locator":"Objective 1.8 macOS tools Activity Monitor","verified":"2026-10-10"} -->

---

### Q28
A Mac user needs a bootable full-disk backup that runs automatically to an external drive. Which built-in feature provides it?
- A) Time Machine
- B) Mission Control
- C) Gatekeeper
- D) Handoff

**Answer: A**
Time Machine is macOS's built-in backup: point it at an external disk and it keeps automatic versioned backups of the whole system. Gatekeeper vets apps, and Handoff passes tasks between devices.
<!-- {"id":"COMPTIA-A-1202-Q028","objective":"1.8","type":"recall","source":"OBJ1202","locator":"Objective 1.8 macOS Time Machine","verified":"2026-10-10"} -->

---

### Q29
A Windows technician sitting at a Linux desktop for the first time needs to install a packaged application. What is the standard way on mainstream distributions?
- A) Editing the registry
- B) Running Windows Update
- C) The distribution's package manager (or its software store front end)
- D) Downloading .exe installers from any website

**Answer: C**
Linux software is installed from curated repositories through a package manager (apt, dnf, and friends) or a graphical store built on it. Windows executables and the registry do not exist in this world, which is also a security strength.
<!-- {"id":"COMPTIA-A-1202-Q029","objective":"1.9","type":"recall","source":"OBJ1202","locator":"Objective 1.9 Linux client features package management","verified":"2026-10-10"} -->

---

### Q30
On a Linux machine, a technician needs to list files, change directories, and check disk free space from the terminal. Which command family covers these tasks?
- A) ls, cd, and df
- B) ipconfig, sfc, and chkdsk
- C) net use, ping, and format
- D) copy, rename, and delete

**Answer: A**
The everyday Linux shell toolkit uses ls to list, cd to change directory, and df to report filesystem free space (with du for directory usage). The other options are Windows command-line tools.
<!-- {"id":"COMPTIA-A-1202-Q030","objective":"1.9","type":"recall","source":"OBJ1202","locator":"Objective 1.9 Linux features and tools","verified":"2026-10-10"} -->

---

### Q31
A Linux user reports "permission denied" running a script they just downloaded. The file exists and the path is right. What is the most likely cause?
- A) The hard drive is full
- B) The screen resolution is too low
- C) The script needs a Windows registry key
- D) The file lacks the execute permission bit for their account

**Answer: D**
Linux enforces execute permission as a file attribute; downloaded scripts commonly lack it. Granting execute permission (after reviewing the script's contents for safety) resolves the denial. Permissions are the first check on any "permission denied."
<!-- {"id":"COMPTIA-A-1202-Q031","objective":"1.9","type":"diagnosis","source":"OBJ1202","locator":"Objective 1.9 Linux features permissions","verified":"2026-10-10"} -->

---

### Q32
A marketing team standardized on a browser-based office suite. A new hire asks why there is nothing to install for it. Which application model are they using?
- A) Cloud-based productivity tools accessed through a browser
- B) Locally installed licensed suites
- C) Batch scripts
- D) Firmware utilities

**Answer: A**
Cloud productivity suites run in the provider's data center and are consumed in a browser, so there is no local installer; documents live in the provider's storage with sharing built in. Local suites require installation and local licensing.
<!-- {"id":"COMPTIA-A-1202-Q032","objective":"1.11","type":"recall","source":"OBJ1202","locator":"Objective 1.11 cloud-based productivity tools","verified":"2026-10-10"} -->

---

### Q33
A company adopts a cloud office suite. A manager asks what operational changes come with it compared to the old installed suite. Which two are real differences? (Choose two.)
- A) Files live in cloud storage with sharing and co-editing by default
- B) Feature updates arrive continuously from the provider without local patching
- C) No internet connection is ever needed
- D) Every user needs a local DVD install
- E) Documents can only be edited by one person ever

**Correct Answer: A, B**
Cloud suites center on shared online documents with real-time collaboration, and the provider rolls out features continuously. The trade-off is connectivity dependence; installation media and single-editor limits describe the old model.
<!-- {"id":"COMPTIA-A-1202-Q033","objective":"1.11","type":"diagnosis","source":"OBJ1202","locator":"Objective 1.11 install and configure cloud-based productivity tools","verified":"2026-10-10"} -->

---

### Q34
A user must install a line-of-business app that requires a specific older version of a runtime library, while another app needs the newer version of the same library. What should the technician check before proceeding?
- A) Whether the two versions can coexist (side-by-side) or whether one app must be isolated, e.g. in a VM
- B) Whether the monitor is calibrated
- C) Whether the keyboard layout matches
- D) Whether the printer is shared

**Answer: A**
Application requirements can conflict on shared libraries. The install plan starts by checking vendor documentation for coexistence; where versions collide, isolation (a VM or container, or separate machines) keeps both apps working without compromise.
<!-- {"id":"COMPTIA-A-1202-Q034","objective":"1.10","type":"diagnosis","source":"OBJ1202","locator":"Objective 1.10 install applications according to requirements","verified":"2026-10-10"} -->

---

### Q35
Before rolling a new application to the whole office, what two requirement checks belong in the install plan? (Choose two.)
- A) OS version and hardware requirements of the app against the fleet
- B) Licensing model and permitted seat count
- C) The color scheme of the installer
- D) The building's Wi-Fi channel plan
- E) The office printer's duplex setting

**Correct Answer: A, B**
Deployment planning checks that target machines meet the application's OS and hardware requirements and that the license permits the intended number of installs. Aesthetics and unrelated infrastructure are not gating requirements.
<!-- {"id":"COMPTIA-A-1202-Q035","objective":"1.10","type":"recall","source":"OBJ1202","locator":"Objective 1.10 install applications according to requirements","verified":"2026-10-10"} -->

---

### Q36
A technician needs to give a user elevated rights for one afternoon to install a specialized tool, without making them a permanent administrator. What is the safest approach on Windows?
- A) Disable User Account Control forever
- B) Share the administrator password by email
- C) Use a one-time elevation with an admin credential at install time, keeping the daily account standard
- D) Make the user a permanent local admin

**Answer: C**
Least privilege means granting elevation only for the task and moment that needs it: an admin approves the UAC prompt (or uses a scheduled elevated install) while the user's daily account stays standard. Permanent admin and disabled prompts erase the protection entirely.
<!-- {"id":"COMPTIA-A-1202-Q036","objective":"1.6","type":"diagnosis","source":"OBJ1202","locator":"Objective 1.6 Windows settings, account types","verified":"2026-10-10"} -->

---

### Q37
A user wants to move their files, settings, and apps from an old PC to a new one with minimal manual re-setup. What approach does Windows provide for this?
- A) Copying the Program Files folder to a USB stick
- B) Swapping the monitors between PCs
- C) Reinstalling every app from memory
- D) A migration/transfer tool or built-in backup-and-restore of the user profile to the new machine

**Answer: D**
User-state migration tools carry profiles, files, and settings to a new machine in a supported way; simply copying program folders breaks apps that rely on registration and licensing. Migration beats manual rebuild in both time and completeness.
<!-- {"id":"COMPTIA-A-1202-Q037","objective":"1.2","type":"diagnosis","source":"OBJ1202","locator":"Objective 1.2 installations and upgrades, migration","verified":"2026-10-10"} -->

---

### Q38
A PC fails its new-OS compatibility check because of an older CPU and missing TPM 2.0. The user asks if there is any legitimate path forward. What is the honest answer?
- A) Delete system files to make room
- B) The hardware does not meet the requirements; stay on the supported OS or replace/upgrade hardware
- C) Edit the registry to skip all hardware checks permanently
- D) TPM is a printer feature and irrelevant

**Answer: B**
Hardware floor requirements exist for security and supportability; the legitimate options are remaining on a supported OS (within its servicing window) or upgrading the machine. Bypass hacks leave the user on an unsupported configuration that can break at any update.
<!-- {"id":"COMPTIA-A-1202-Q038","objective":"1.2","type":"diagnosis","source":"OBJ1202","locator":"Objective 1.2 OS upgrades, requirements","verified":"2026-10-10"} -->

---

### Q39
A technician wants a Windows PC to boot into a minimal environment with third-party services and startup items disabled, to see if one of them causes random crashes. Which tool configures that selective startup?
- A) Disk Cleanup
- B) Snipping Tool
- C) System Configuration (msconfig) clean-boot options
- D) Device Manager

**Answer: C**
A clean boot via System Configuration disables non-Microsoft services and startup items, letting the technician test whether the crashes vanish, then re-enable halves to isolate the culprit. It is the controlled way to separate OS faults from add-on faults.
<!-- {"id":"COMPTIA-A-1202-Q039","objective":"1.4","type":"diagnosis","source":"OBJ1202","locator":"Objective 1.4 Windows tools System Configuration","verified":"2026-10-10"} -->

---

### Q40
A user's Windows search cannot find files that clearly exist, and searches have been slow since a disk cleanup. What built-in component should the technician check or rebuild?
- A) The display color profile
- B) The mouse pointer scheme
- C) The search indexing options/index
- D) The printer spooler

**Answer: C**
Windows search relies on an index of file locations and contents; a corrupted or reset index produces exactly these symptoms. Rebuilding the index from Indexing Options is the standard fix.
<!-- {"id":"COMPTIA-A-1202-Q040","objective":"1.4","type":"diagnosis","source":"OBJ1202","locator":"Objective 1.4 Windows features search and indexing","verified":"2026-10-10"} -->

---

### Q41
A command the technician needs keeps failing with "Access is denied" even though the syntax is right and the account is an administrator. What is the likely issue?
- A) The command prompt was not launched elevated (Run as administrator)
- B) The keyboard is in the wrong layout
- C) The screen brightness is too low
- D) The command only works on macOS

**Answer: A**
Membership in Administrators does not elevate every process; administrative commands require an elevated prompt. Launching the shell with "Run as administrator" is the routine fix for access-denied on valid admin commands.
<!-- {"id":"COMPTIA-A-1202-Q041","objective":"1.5","type":"diagnosis","source":"OBJ1202","locator":"Objective 1.5 command-line tools, elevation","verified":"2026-10-10"} -->

---

### Q42
A technician must copy a folder tree of 40,000 project files to a new drive, preserving structure, with the ability to resume if interrupted. Which built-in command-line tool is built for this?
- A) netstat
- B) diskpart
- C) robocopy
- D) ipconfig

**Answer: C**
Robocopy (Robust Copy) mirrors directory trees, preserves attributes, retries failures, and resumes, making it the standard tool for bulk file migrations. The other tools handle network config, socket stats, and disk partitioning.
<!-- {"id":"COMPTIA-A-1202-Q042","objective":"1.5","type":"recall","source":"OBJ1202","locator":"Objective 1.5 command-line tools robocopy","verified":"2026-10-10"} -->

---

### Q43
A user suspects a program is secretly holding a network connection open and wants to see all active TCP/UDP connections and listening ports on their PC. Which command shows this?
- A) ipconfig
- B) sfc
- C) chkdsk
- D) netstat

**Answer: D**
netstat lists active connections, their states, and listening ports (with flags to show owning processes), which is the right lens for spotting unexpected network activity. ipconfig shows interface configuration, not live connections.
<!-- {"id":"COMPTIA-A-1202-Q043","objective":"1.5","type":"diagnosis","source":"OBJ1202","locator":"Objective 1.5 command-line tools netstat","verified":"2026-10-10"} -->

---

### Q44
A Linux laptop will not connect to the office projector over HDMI. A colleague suggests checking the display server settings first. On most modern desktops, where would a technician start?
- A) The desktop environment's display settings to detect and configure the external output
- B) The printer queue
- C) The package manager's history
- D) The kernel's firewall table

**Answer: A**
External display detection and layout are handled by the desktop environment's display settings (or its display tooling), which is the GUI-level first check, before driver or cable suspicion. The other options manage printing, software history, and packet filtering.
<!-- {"id":"COMPTIA-A-1202-Q044","objective":"1.9","type":"diagnosis","source":"OBJ1202","locator":"Objective 1.9 Linux client/desktop features","verified":"2026-10-10"} -->

---

### Q45
A small nonprofit wants desktop PCs with no operating-system license cost and is comfortable with community support. Which OS choice meets the constraint?
- A) A mainstream Linux distribution
- B) A retail Windows Pro license per seat
- C) macOS on non-Apple hardware
- D) A server edition trial

**Answer: A**
Mainstream Linux distributions are free to deploy with community support, fitting a zero-license budget. Windows Pro carries per-seat cost, macOS is licensed for Apple hardware only, and trials expire.
<!-- {"id":"COMPTIA-A-1202-Q045","objective":"1.1","type":"diagnosis","source":"OBJ1202","locator":"Objective 1.1 OS types and purposes, licensing","verified":"2026-10-10"} -->

---

### Q46
An accountant's PC shows a full C: drive. Which built-in Windows tool safely removes temporary files, old update leftovers, and Recycle Bin contents?
- A) Device Manager
- B) Task Manager's Startup tab
- C) msconfig
- D) Disk Cleanup (or Storage settings/Storage Sense)

**Answer: D**
Disk Cleanup and the Storage settings identify and remove reclaimable system and temporary files safely. Task Manager trims startup programs, Device Manager manages drivers, and msconfig configures boot, none of which free disk space.
<!-- {"id":"COMPTIA-A-1202-Q046","objective":"1.4","type":"recall","source":"OBJ1202","locator":"Objective 1.4 Windows tools Disk Cleanup","verified":"2026-10-10"} -->

---

### Q47
A user wants certain file types (like .pdf) to always open in a different application than the current default. Where is this changed in Windows?
- A) The mouse control panel
- B) The date and time settings
- C) Device Manager
- D) Default apps settings, by file type

**Answer: D**
File-type associations live in Default apps settings, where each extension can be mapped to the preferred application. This is per-user and reversible, unrelated to hardware or clock settings.
<!-- {"id":"COMPTIA-A-1202-Q047","objective":"1.6","type":"recall","source":"OBJ1202","locator":"Objective 1.6 configure Windows settings default apps","verified":"2026-10-10"} -->

---

### Q48
A help desk ticket says a user's mapped network drives work on Ethernet but vanish on Wi-Fi. The Wi-Fi network profile is set to Public. What is the most likely cause?
- A) The drives only map at 5GHz
- B) The user needs a new keyboard
- C) The Public profile blocks network discovery and file-sharing traffic
- D) Wi-Fi cannot carry files

**Answer: C**
Network profiles change firewall behavior: Public locks down discovery and sharing, so mapped drives depending on those protocols fail. Setting the trusted office Wi-Fi profile to Private (or adjusting rules) restores access.
<!-- {"id":"COMPTIA-A-1202-Q048","objective":"1.7","type":"diagnosis","source":"OBJ1202","locator":"Objective 1.7 Windows networking features profiles","verified":"2026-10-10"} -->

---

### Q49
A Mac user must run one Windows-only application occasionally. Which approaches are legitimate options? (Choose two.)
- A) A virtual machine running Windows on the Mac
- B) A remote session to a Windows machine that has the app
- C) Double-clicking the .exe and hoping
- D) Installing macOS on the Windows app
- E) Formatting the Mac's drive

**Correct Answer: A, B**
Windows software needs a Windows environment: a local VM provides one on the Mac, and remote access uses an existing Windows host. Executables do not run natively on macOS, and the remaining options are nonsense or destructive.
<!-- {"id":"COMPTIA-A-1202-Q049","objective":"1.8","type":"diagnosis","source":"OBJ1202","locator":"Objective 1.8 macOS features, cross-platform needs","verified":"2026-10-10"} -->

---

### Q50
A Mac will not shut down because one app is "not responding." What is the macOS equivalent of End Task to force-quit that app?
- A) Removing the battery
- B) Force Quit from the Apple menu (or Activity Monitor)
- C) Time Machine restore
- D) Safe boot only

**Answer: B**
Force Quit terminates a hung application without restarting the system, reachable from the Apple menu or Activity Monitor. Time Machine restores backups, and removing power risks data loss.
<!-- {"id":"COMPTIA-A-1202-Q050","objective":"1.8","type":"recall","source":"OBJ1202","locator":"Objective 1.8 macOS tools Force Quit","verified":"2026-10-10"} -->

---

## DOMAIN 2: Security (study allocation)

---

### Q51
A company wants building access that requires both a badge tap and a fingerprint scan. What security principle does combining these implement?
- A) Load balancing
- B) Multifactor authentication across two factor types (possession and inherence)
- C) Single sign-on
- D) Least privilege

**Answer: B**
Something you have (badge) plus something you are (fingerprint) are two distinct factor categories, so compromising one does not defeat the control. That is the definition of multifactor authentication.
<!-- {"id":"COMPTIA-A-1202-Q051","objective":"2.1","type":"recall","source":"OBJ1202","locator":"Objective 2.1 security measures, authentication factors","verified":"2026-10-10"} -->

---

### Q52
A shared reception PC should let staff read the schedule but never edit it, while the office manager edits it. What security measure enforces this?
- A) A stronger screen lock wallpaper
- B) Permissions set to least privilege: read for staff, modify for the manager
- C) Full control for everyone to keep it simple
- D) Hiding the file extension

**Answer: B**
Permissions grant each role only what it needs. Read-only for general staff and modify for the manager is least privilege in action; full control for all would let anyone change or delete the schedule.
<!-- {"id":"COMPTIA-A-1202-Q052","objective":"2.1","type":"diagnosis","source":"OBJ1202","locator":"Objective 2.1 security measures, permissions","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q53
A laptop storing customer data is stolen from a car. Which pre-installed protection makes the data useless to the thief?
- A) Renaming the folders to something boring
- B) Full-disk encryption tied to the sign-in (e.g. TPM-backed)
- C) A screensaver with a lock message
- D) A strong desktop wallpaper

**Answer: B**
Full-disk encryption renders the drive's contents unreadable without the credential/key, so physical theft yields hardware, not data. Cosmetic and naming measures provide no cryptographic protection.
<!-- {"id":"COMPTIA-A-1202-Q053","objective":"2.1","type":"diagnosis","source":"OBJ1202","locator":"Objective 2.1 security measures, encryption","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q54
A user reuses one password everywhere and asks why the office mandates unique passwords plus a code from an app. What is the correct explanation?
- A) It slows attackers by making them type more
- B) It is required to use the printer
- C) Codes make passwords unnecessary to remember at all
- D) One breached site would expose every account with the shared password; the second factor blocks logins even with the password known

**Answer: D**
Credential reuse turns any single site's breach into total account takeover, and MFA containing a possession factor stops logins even when the password leaks. This is the core rationale behind both policies.
<!-- {"id":"COMPTIA-A-1202-Q054","objective":"2.1","type":"diagnosis","source":"OBJ1202","locator":"Objective 2.1 security measures, MFA rationale","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q55
The office firewall permits outbound web browsing but blocks inbound connection attempts from the internet to staff PCs. Which security measure category is the firewall providing?
- A) Network traffic filtering based on rules
- B) File encryption at rest
- C) Physical cable locks
- D) Password complexity

**Answer: A**
A firewall enforces rules about which network traffic may pass in which direction, here allowing initiated outbound sessions while denying unsolicited inbound ones. The other controls protect data, hardware, and accounts respectively.
<!-- {"id":"COMPTIA-A-1202-Q055","objective":"2.1","type":"recall","source":"OBJ1202","locator":"Objective 2.1 security measures, firewall","verified":"2026-10-10"} -->

---

### Q56
A company decommissions old workstations. Which step protects the data on their drives before the machines are recycled?
- A) Deleting the desktop icons
- B) Emptying the Recycle Bin once
- C) Unplugging the machines
- D) Secure wiping or physical destruction of the drives per policy

**Answer: D**
Deletion and emptied bins leave data recoverable with common tools; disposal requires cryptographic erasure, secure overwrite, or destruction so recovery is infeasible. This is the core of safe disposal practice.
<!-- {"id":"COMPTIA-A-1202-Q056","objective":"2.1","type":"recall","source":"OBJ1202","locator":"Objective 2.1 security measures, data destruction","verified":"2026-10-10"} -->

---

### Q57
An antivirus product that watches program behavior for ransomware-like patterns, rather than only matching known signatures, is using which detection approach?
- A) Signature-only detection
- B) MAC filtering
- C) DHCP snooping
- D) Behavioral/heuristic detection

**Answer: D**
Behavioral (heuristic) engines flag malicious activity patterns, catching new variants that have no signature yet. Signature-only tools miss anything not yet cataloged; MAC filtering and DHCP snooping are network controls.
<!-- {"id":"COMPTIA-A-1202-Q057","objective":"2.1","type":"recall","source":"OBJ1202","locator":"Objective 2.1 security measures, anti-malware detection","verified":"2026-10-10"} -->

---

### Q58
A user wants to protect files on a shared family PC from a curious housemate who sometimes uses their logged-in session. What Windows feature protects a folder's contents even when the account is unlocked?
- A) Renaming the folder
- B) File/folder-level encryption (EFS) or storing sensitive files in an encrypted container
- C) Hidden file attribute alone
- D) A screen saver timeout

**Answer: B**
Per-file encryption ties decryption to the user's credentials, so another person in the session cannot read protected files. The hidden attribute and renames are cosmetic, and the session being already unlocked defeats lock timers.
<!-- {"id":"COMPTIA-A-1202-Q058","objective":"2.2","type":"diagnosis","source":"OBJ1202","locator":"Objective 2.2 Windows OS security settings","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q59
A technician is configuring a new Windows laptop for a salesperson. Which set of settings belongs in a security baseline? (Choose three.)
- A) Automatic OS updates enabled
- B) Full-disk encryption on
- C) Screen lock with a short timeout and password
- D) Guest account enabled with admin rights
- E) File extensions hidden

**Correct Answer: A, B, C**
Patching, disk encryption, and prompt locking are baseline defenses. A guest admin account is an open door, and hiding extensions is cosmetic at best (it can even aid malware disguises).
<!-- {"id":"COMPTIA-A-1202-Q059","objective":"2.2","type":"recall","source":"OBJ1202","locator":"Objective 2.2 configure Windows OS security settings","verified":"2026-10-10"} -->

---

### Q60
A home user asks why their bank logs them out after a few idle minutes even though their PC stays unlocked. Which security concept is the bank applying?
- A) Screen resolution policy
- B) Session timeout to limit exposure of an unattended authenticated session
- C) RAID redundancy
- D) DHCP lease renewal

**Answer: B**
Expiring idle sessions shrinks the window in which someone else can use an authenticated session. It is a compensating control for exactly the "unlocked and unattended" risk, unrelated to storage, addressing, or display settings.
<!-- {"id":"COMPTIA-A-1202-Q060","objective":"2.2","type":"diagnosis","source":"OBJ1202","locator":"Objective 2.2 Windows security settings, lock/timeout","verified":"2026-10-10"} -->

---
