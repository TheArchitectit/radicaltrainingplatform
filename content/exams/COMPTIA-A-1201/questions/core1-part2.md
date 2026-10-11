# CompTIA A+ Core 1 (220-1201) Practice Questions - Part 2
# Original study items. Independent material, not official or endorsed by CompTIA.

## DOMAIN 2: Networking (study allocation)

---

### Q61
A legacy device in the shop can only transfer files using an old client that offers no encryption and no passive mode. Which protocol and port pair will the technician have to allow, and what is the security trade-off?
- A) SFTP on TCP 22; everything is encrypted end to end
- B) SSH on TCP 22; only commands are allowed
- C) Telnet on TCP 23; only text is exposed
- D) FTP on TCP 20-21; credentials and data cross the network unencrypted

**Answer: D**
Classic FTP uses TCP 20 for data and 21 for control and sends credentials and file contents in cleartext, which is the trade-off of supporting the legacy client. The safe pattern is to confine it to an isolated segment. SFTP and SSH ride port 22 with encryption; Telnet is a remote terminal protocol, not file transfer.
<!-- {"id":"COMPTIA-A-1201-Q061","objective":"2.1","type":"diagnosis","source":"OBJ1201","locator":"Objective 2.1 FTP 20-21","verified":"2026-10-10"} -->

---

### Q62
During an audit, a scanner flags a network printer that accepts remote terminal connections on TCP 23. Why does the auditor want that service disabled?
- A) Telnet only supports wireless clients
- B) The printer should use port 110 instead
- C) Telnet sends the session, including credentials, without encryption
- D) Port 23 is reserved for DNS and causes name conflicts

**Answer: C**
Telnet on port 23 is plaintext: anyone able to sniff the path can read the login and session. The encrypted replacement for remote terminal access is SSH on port 22. Port 110 is POP3 mail retrieval and unrelated.
<!-- {"id":"COMPTIA-A-1201-Q062","objective":"2.1","type":"diagnosis","source":"OBJ1201","locator":"Objective 2.1 Telnet 23 vs SSH","verified":"2026-10-10"} -->

---

### Q63
An office upgrades to access points that support wider channel widths for higher throughput. What is the trade-off of choosing the widest channel width in a crowded building?
- A) Wider channels consume more spectrum, so fewer non-overlapping channels remain and interference between neighbors rises
- B) Wider channels reduce the transmit power to zero
- C) Wider channels only work with Bluetooth clients
- D) Wider channels disable the 5GHz band

**Answer: A**
Channel width trades capacity for spectrum: a wider channel bonds several smaller channels, which raises throughput on a clean network but leaves fewer distinct channels for neighbors and increases contention in crowded airspace. The right width depends on how congested the band is.
<!-- {"id":"COMPTIA-A-1201-Q063","objective":"2.2","type":"diagnosis","source":"OBJ1201","locator":"Objective 2.2 channels, widths","verified":"2026-10-10"} -->

---

### Q64
A technician plans a DHCP scope of 192.168.4.100 through 192.168.4.199 but must keep three addresses in that span free for devices that already have them hard-coded. What should they configure?
- A) Shorter DNS cache times
- B) Exclusions for the three hard-coded addresses
- C) Reservations for the three hard-coded addresses
- D) A second scope on a different subnet

**Answer: B**
Exclusions tell the DHCP server to never hand out specific addresses inside the scope, which is the right tool when devices already hold those addresses statically. Reservations tie an address to a MAC for DHCP delivery; the devices here are not asking for DHCP at all, so exclusion is the correct mechanism.
<!-- {"id":"COMPTIA-A-1201-Q064","objective":"2.4","type":"diagnosis","source":"OBJ1201","locator":"Objective 2.4 DHCP exclusions vs reservations","verified":"2026-10-10"} -->

---

### Q65
A new application server only has an IPv6 address. Which DNS record type maps its hostname for clients?
- A) MX
- B) AAAA
- C) A
- D) CNAME

**Answer: B**
AAAA records map a hostname to an IPv6 address; A records map to IPv4. CNAME aliases one name to another, and MX records direct mail delivery.
<!-- {"id":"COMPTIA-A-1201-Q065","objective":"2.4","type":"recall","source":"OBJ1201","locator":"Objective 2.4 DNS record types AAAA","verified":"2026-10-10"} -->

---

### Q66
A kiosk PC must never change its address because the point-of-sale server allowlists it. The office prefers centralized management over hand-configuring each machine. What is the best approach?
- A) Let the kiosk use APIPA
- B) Set the lease time to zero
- C) Configure the kiosk with a static address outside the scope
- D) Create a DHCP reservation for the kiosk's MAC address

**Answer: D**
A reservation keeps the address fixed while leaving configuration centralized in DHCP, so the kiosk still receives gateway and DNS settings automatically. A manual static address works but scatters configuration onto endpoints, and APIPA is a failure fallback, not a plan.
<!-- {"id":"COMPTIA-A-1201-Q066","objective":"2.6","type":"diagnosis","source":"OBJ1201","locator":"Objective 2.6 static vs dynamic addressing","verified":"2026-10-10"} -->

---

## DOMAIN 3: Hardware (study allocation)

---

### Q67
A desktop motherboard has four memory slots in two color-coded pairs, and the owner bought two matching RAM sticks. To get the benefit of dual-channel operation, how should the sticks be installed?
- A) In the two slots of the same color, per the manual's channel guidance
- B) In the two slots closest to the CPU
- C) In any two slots; channels are assigned automatically
- D) One stick only; two sticks disable dual channel

**Answer: A**
Dual-channel mode requires the modules to sit in the correct paired slots, which manufacturers color-code and document. Two matching sticks in the right slots let the memory controller interleave access across channels for extra bandwidth.
<!-- {"id":"COMPTIA-A-1201-Q067","objective":"3.1","type":"diagnosis","source":"OBJ1201","locator":"Objective 3.1 channel configurations","verified":"2026-10-10"} -->

---

### Q68
A small database server must keep running correctly even if a memory bit flips, and the budget allows server-grade parts. Which RAM characteristic should the build specify?
- A) ECC memory
- B) Non-ECC memory
- C) SODIMM form factor
- D) The highest RGB-rated kit

**Answer: A**
Error-correcting code memory detects and corrects single-bit errors, protecting workloads where silent corruption is unacceptable, such as databases and file servers. ECC requires motherboard and CPU support, which server platforms provide.
<!-- {"id":"COMPTIA-A-1201-Q068","objective":"3.1","type":"recall","source":"OBJ1201","locator":"Objective 3.1 ECC vs non-ECC","verified":"2026-10-10"} -->

---

### Q69
A user tries to install DDR5 modules into a three-year-old desktop that shipped with DDR4, but the modules will not seat. What is the correct explanation?
- A) The motherboard needs a BIOS setting to accept DDR5
- B) DDR5 only works in laptops
- C) DDR generations have different notch positions and electrical designs, so they are not interchangeable
- D) The modules are counterfeit

**Answer: C**
Each DDR iteration changes the physical keying and signaling, so a DDR5 module cannot fit or run in a DDR4 slot. No setting bridges the difference; memory must match the generation the motherboard supports.
<!-- {"id":"COMPTIA-A-1201-Q069","objective":"3.1","type":"diagnosis","source":"OBJ1201","locator":"Objective 3.1 DDR iterations","verified":"2026-10-10"} -->

---

### Q70
After a RAM upgrade, a PC shows only 8 GB of the 16 GB installed. Both sticks are the same model and each works alone in the first slot. What is the best next check?
- A) Whether the monitor cable is loose
- B) Whether the second stick is fully seated in its slot
- C) Whether the power supply has enough wattage
- D) Whether the hard drive is failing

**Answer: B**
Each stick works alone, so the modules are good; half the capacity missing points at one module not making contact. Reseating the second stick (and trying it alone in the second slot to rule out a dead slot) is the direct next step. Power, storage, and display faults do not hide RAM capacity.
<!-- {"id":"COMPTIA-A-1201-Q070","objective":"3.1","type":"diagnosis","source":"OBJ1201","locator":"Objective 3.1 RAM installation","verified":"2026-10-10"} -->

---

### Q71
A gaming PC is upgraded with two RAM sticks rated faster than the previous pair, but benchmarking shows them running at the old, slower speed. What is the most likely cause?
- A) The power supply is limiting the memory voltage permanently
- B) Faster RAM always runs slower for stability
- C) The motherboard firmware is still using the default profile instead of the memory's rated profile
- D) The CPU is incompatible with fast RAM

**Answer: C**
Modules advertise their rated speed through a profile that firmware must be told to use; out of the box most boards run a conservative default speed. Enabling the rated profile in BIOS/UEFI (after confirming board support) unlocks the advertised speed.
<!-- {"id":"COMPTIA-A-1201-Q071","objective":"3.1","type":"diagnosis","source":"OBJ1201","locator":"Objective 3.1 DDR iterations, channel configurations","verified":"2026-10-10"} -->

---

### Q72
An office desktop from 2016 needs more memory, and the technician finds the slots accept full-length modules only. Which form factor should be ordered?
- A) mSATA
- B) DIMM
- C) SODIMM
- D) M.2

**Answer: B**
Desktop towers use full-size DIMM modules; SODIMMs are the shorter laptop form factor. M.2 and mSATA are storage form factors, not memory.
<!-- {"id":"COMPTIA-A-1201-Q072","objective":"3.1","type":"recall","source":"OBJ1201","locator":"Objective 3.1 form factors DIMM","verified":"2026-10-10"} -->

---

### Q73
A video-editing workstation must move huge files as fast as possible, and its motherboard has an M.2 slot wired for the fastest storage interface. Which drive choice delivers the most throughput?
- A) A 3.5-inch 7,200 rpm hard drive
- B) A USB flash drive
- C) An NVMe M.2 solid-state drive
- D) A 2.5-inch SATA solid-state drive

**Answer: C**
NVMe drives communicate over PCIe lanes rather than the older SATA link, giving them several times the sequential throughput of any SATA device and far more than spinning disks or USB flash. When the slot supports NVMe, it is the performance pick.
<!-- {"id":"COMPTIA-A-1201-Q073","objective":"3.2","type":"diagnosis","source":"OBJ1201","locator":"Objective 3.2 SSD communications interfaces NVMe vs SATA","verified":"2026-10-10"} -->

---

### Q74
A user buys an M.2 drive that fits the slot physically but the system never detects it. The slot's documentation says it supports only NVMe drives. What is the likely problem?
- A) The drive is an M.2 SATA model, and M.2 slots are not all wired for both protocols
- B) The drive needs a 3.5-inch adapter
- C) M.2 drives require an external power cable
- D) The BIOS battery is dead

**Answer: A**
M.2 is a form factor, not a protocol: slots may be wired for SATA, for NVMe (PCIe), or both, and a drive using the unsupported protocol will not be detected despite fitting. Checking the slot's supported protocols against the drive's interface is the fix.
<!-- {"id":"COMPTIA-A-1201-Q074","objective":"3.2","type":"diagnosis","source":"OBJ1201","locator":"Objective 3.2 form factors M.2, interfaces","verified":"2026-10-10"} -->

---

### Q75
A two-drive NAS is configured so that every file is written to both drives identically, trading half the total capacity for protection against one drive dying. Which RAID level is this?
- A) RAID 5
- B) RAID 10
- C) RAID 0
- D) RAID 1

**Answer: D**
RAID 1 mirrors data across two drives, so either drive can fail with no loss, at the cost of half the raw capacity. RAID 0 stripes for speed with no redundancy, RAID 5 stripes with parity across three or more drives, and RAID 10 needs four drives.
<!-- {"id":"COMPTIA-A-1201-Q075","objective":"3.2","type":"recall","source":"OBJ1201","locator":"Objective 3.2 RAID 0,1,5,6,10","verified":"2026-10-10"} -->

---

### Q76
A small business wants storage that survives any single drive failure but has only budget for three drives and needs as much usable space as possible. Which RAID level fits?
- A) RAID 0
- B) RAID 1
- C) RAID 5
- D) RAID 6

**Answer: C**
RAID 5 stripes data with distributed parity across a minimum of three drives, losing only one drive's worth of capacity while tolerating one failure. RAID 0 has no redundancy, RAID 1 with three drives wastes a drive without adding capacity, and RAID 6 requires four.
<!-- {"id":"COMPTIA-A-1201-Q076","objective":"3.2","type":"diagnosis","source":"OBJ1201","locator":"Objective 3.2 RAID levels minimum drives","verified":"2026-10-10"} -->

---

### Q77
A user asks why their old 5,400 rpm laptop drive feels slower than the 7,200 rpm drive in another machine, given both are the same capacity. What is the honest answer?
- A) The slower drive has more cache
- B) Capacity determines mechanical drive speed
- C) Higher spindle speed generally means lower latency and faster transfers on mechanical drives
- D) Spindle speed only affects noise, not speed

**Answer: C**
On spinning hard drives, a faster spindle rotation brings data under the heads sooner (lower rotational latency) and streams it faster, which is why 7,200 rpm models outperform 5,400 rpm models of similar design. Capacity and cache are secondary to rotation speed here.
<!-- {"id":"COMPTIA-A-1201-Q077","objective":"3.2","type":"recall","source":"OBJ1201","locator":"Objective 3.2 hard drives spindle speeds","verified":"2026-10-10"} -->

---

### Q78
A photographer needs to hand a client 200 GB of raw images in person, and neither side can use cloud transfer. What is the most practical removable-storage option?
- A) A high-capacity USB flash drive or portable SSD
- B) A stack of writable DVDs
- C) A memory card from the camera, left with the client
- D) An internal SATA drive with no enclosure

**Answer: A**
A large flash drive or portable SSD carries 200 GB in one pocketable device with broad compatibility. DVDs would take dozens of discs and slow burns, the camera card is needed for shoots, and a bare internal drive has no interface the client can use directly.
<!-- {"id":"COMPTIA-A-1201-Q078","objective":"3.2","type":"diagnosis","source":"OBJ1201","locator":"Objective 3.2 removable storage flash drives, memory cards","verified":"2026-10-10"} -->

---

### Q79
A home server motherboard only fits cases accepting boards up to 9.6 inches square with reduced expansion slots. Which form factor is it?
- A) E-ATX
- B) ATX
- C) microATX
- D) ITX

**Answer: C**
microATX keeps the ATX mounting pattern in a smaller 9.6-inch-square board with fewer expansion slots, fitting compact cases that full ATX cannot. ITX is smaller still, and E-ATX is larger than standard ATX.
<!-- {"id":"COMPTIA-A-1201-Q079","objective":"3.3","type":"recall","source":"OBJ1201","locator":"Objective 3.3 motherboard form factors","verified":"2026-10-10"} -->

---

### Q80
A customer buys a new CPU to drop into their existing motherboard, but it will not seat in the socket. The motherboard is three years old and the CPU is a current-generation part from the other major vendor. What is the issue?
- A) The CPU needs a firmware update before installation
- B) The thermal paste is too thick
- C) The motherboard only accepts SODIMM chips
- D) CPU sockets are vendor- and generation-specific; AMD and Intel sockets are not cross-compatible

**Answer: D**
Processors physically and electrically match specific socket families, and AMD and Intel use entirely different sockets. A CPU upgrade must match the socket the motherboard provides, which often means a new CPU generation requires a new board.
<!-- {"id":"COMPTIA-A-1201-Q080","objective":"3.3","type":"diagnosis","source":"OBJ1201","locator":"Objective 3.3 CPU socket types AMD/Intel","verified":"2026-10-10"} -->

---

### Q81
A technician needs a PC to boot from a USB recovery drive, but it keeps starting from the internal disk. Where is this changed?
- A) The printer spooler settings
- B) The boot options/boot order setting in BIOS/UEFI
- C) The network adapter properties
- D) The monitor's on-screen menu

**Answer: B**
Boot device priority is a firmware setting: entering BIOS/UEFI setup and moving the USB device above the internal drive in the boot order makes the machine start from the recovery media.
<!-- {"id":"COMPTIA-A-1201-Q081","objective":"3.3","type":"recall","source":"OBJ1201","locator":"Objective 3.3 BIOS/UEFI settings boot options","verified":"2026-10-10"} -->

---

### Q82
A company requires that stolen laptops' drives be unreadable without the owner's sign-in, using hardware-backed key protection already built into the machines. Which component enables this?
- A) Trusted Platform Module
- B) Network interface card
- C) Capture card
- D) Sound card

**Answer: A**
A TPM is a dedicated security chip that stores and protects cryptographic keys, enabling features like measured boot and hardware-backed full-disk encryption so a removed drive is unreadable elsewhere. The other cards handle networking, video capture, and audio.
<!-- {"id":"COMPTIA-A-1201-Q082","objective":"3.3","type":"recall","source":"OBJ1201","locator":"Objective 3.3 TPM security features, encryption","verified":"2026-10-10"} -->

---

### Q83
An IT policy says only the factory-signed operating system may boot on company laptops, blocking bootable USB tools from unknown sources. Which UEFI feature enforces this?
- A) Wake on LAN
- B) Fast charging
- C) Secure Boot
- D) Fan control

**Answer: C**
Secure Boot verifies the digital signature of boot loaders against trusted keys in firmware and refuses untrusted code at startup, which is exactly the control described. Fan control, wake features, and charging settings are unrelated to boot-chain trust.
<!-- {"id":"COMPTIA-A-1201-Q083","objective":"3.3","type":"recall","source":"OBJ1201","locator":"Objective 3.3 Secure Boot","verified":"2026-10-10"} -->

---

### Q84
A developer cannot enable the virtual machine feature in their hypervisor software; the installer says hardware virtualization is unavailable, though the CPU supports it. What should they check first?
- A) Whether the printer driver is current
- B) Whether the RAM is ECC
- C) Whether virtualization support is enabled in BIOS/UEFI
- D) Whether the monitor supports 4K

**Answer: C**
CPU virtualization extensions ship disabled in firmware on many systems. Toggling the virtualization setting in BIOS/UEFI exposes the feature to the hypervisor; display, printing, and memory type have no bearing.
<!-- {"id":"COMPTIA-A-1201-Q084","objective":"3.3","type":"diagnosis","source":"OBJ1201","locator":"Objective 3.3 virtualization support","verified":"2026-10-10"} -->

---

### Q85
A freshly built PC shuts down under load after a few minutes, and monitoring shows CPU temperature climbing past its limit right before each shutdown. The cooler is mounted. What is the best first suspicion?
- A) Missing, dried, or poorly spread thermal paste (or an unseated heat sink) between CPU and cooler
- B) The power supply's wattage rating
- C) A loose SATA data cable
- D) An outdated printer driver

**Answer: A**
Rapid temperature climb under load with a mounted cooler points at broken heat transfer: no thermal interface material, an unseated heat sink, or a fan not spinning. The PSU and storage cables do not cause a thermal-ramp pattern like this.
<!-- {"id":"COMPTIA-A-1201-Q085","objective":"3.3","type":"diagnosis","source":"OBJ1201","locator":"Objective 3.3 cooling, heat sink, thermal paste/pads","verified":"2026-10-10"} -->

---

### Q86
A desktop needs a second wired network connection for a dedicated lab segment, and its onboard Ethernet is already in use. What should the technician install?
- A) A capture card
- B) A sound card
- C) A second power supply
- D) A network interface expansion card in a free PCIe slot

**Answer: D**
A PCIe network interface card adds an independent Ethernet port for the second network. Capture cards record video, sound cards handle audio, and power supplies provide no connectivity.
<!-- {"id":"COMPTIA-A-1201-Q086","objective":"3.3","type":"recall","source":"OBJ1201","locator":"Objective 3.3 expansion cards network interface card","verified":"2026-10-10"} -->

---

### Q87
A lightweight laptop maker advertises better battery life using a processor built on the architecture common in phones and tablets rather than the traditional desktop architecture. Which architecture is that?
- A) ARM
- B) x64
- C) PCI Express
- D) SATA

**Answer: A**
ARM is a reduced-instruction-set architecture dominant in mobile devices for its power efficiency, and recent laptops use it for long battery life. x86/x64 is the traditional desktop architecture; PCIe and SATA are buses, not CPU architectures.
<!-- {"id":"COMPTIA-A-1201-Q087","objective":"3.3","type":"recall","source":"OBJ1201","locator":"Objective 3.3 CPU architecture x86/x64 vs ARM","verified":"2026-10-10"} -->

---

### Q88
A user's upgraded graphics card will not fit in the case's only available slot, which is an older, shorter connector from the early 2000s. What connector family mismatch is this?
- A) The card needs SATA and the slot is M.2
- B) The card needs USB-C and the slot is USB-A
- C) The card needs Molex and the slot is a header
- D) The card needs PCI Express and the slot is legacy PCI

**Answer: D**
Modern graphics and expansion cards use PCI Express slots; legacy PCI slots are electrically and physically different, so a PCIe card cannot install in one. Checking slot type against card interface is a basic build-compatibility step.
<!-- {"id":"COMPTIA-A-1201-Q088","objective":"3.3","type":"diagnosis","source":"OBJ1201","locator":"Objective 3.3 motherboard connector types PCI vs PCIe","verified":"2026-10-10"} -->

---

### Q89
A builder is sizing a power supply for a PC with a power-hungry graphics card and many drives. What is the right way to choose the wattage rating?
- A) Match the wattage exactly to the CPU's rating alone
- B) Always buy the highest wattage sold, regardless of build
- C) Wattage does not matter if the connectors fit
- D) Add up the components' power requirements and choose a supply with comfortable headroom above the total

**Answer: D**
A PSU must cover the combined draw of CPU, GPU, drives, and peripherals with margin for spikes and efficiency, so builds total the load and add headroom. Undersizing causes shutdowns under load; wild oversizing wastes money and can run inefficiently.
<!-- {"id":"COMPTIA-A-1201-Q089","objective":"3.4","type":"diagnosis","source":"OBJ1201","locator":"Objective 3.4 wattage rating","verified":"2026-10-10"} -->

---

### Q90
A technician moves a desktop from a US office to a European site. Before plugging it in, what must they verify about the power supply?
- A) That the RAM is seated
- B) That the input selector (or auto-ranging design) matches the local 220-240 VAC mains
- C) That the case has enough fans
- D) That the monitor is HDMI

**Answer: B**
Power supplies expect a specific mains input range; a unit switched to 110-120 VAC and plugged into 220-240 VAC can be destroyed instantly. Verifying the selector switch or confirming an auto-ranging supply is the mandatory first step before energizing.
<!-- {"id":"COMPTIA-A-1201-Q090","objective":"3.4","type":"diagnosis","source":"OBJ1201","locator":"Objective 3.4 input 110-120 VAC vs 220-240 VAC","verified":"2026-10-10"} -->

---

### Q91
A PC keeps rebooting during gaming but is stable at the desktop. A log shows no thermal problems, and the graphics card manufacturer recommends at least a 650 W supply. The installed unit is 450 W. What is the most likely fault?
- A) The power supply cannot deliver the card's peak draw, so the system shuts down under load
- B) The graphics card driver is unsigned
- C) The case fans are too quiet
- D) The monitor's refresh rate is too high

**Answer: A**
Load-dependent shutdowns with healthy temperatures and an undersized supply point straight at power delivery: transient GPU draw exceeds what 450 W can provide and the PSU protection cuts power. Matching the vendor's recommended wattage resolves it.
<!-- {"id":"COMPTIA-A-1201-Q091","objective":"3.4","type":"diagnosis","source":"OBJ1201","locator":"Objective 3.4 wattage rating, energy efficiency","verified":"2026-10-10"} -->

---

### Q92
A builder wants a cleaner case with better airflow and only three of the power supply's eight cables actually in use. Which PSU feature solves the cable clutter?
- A) A 20+4 pin adapter
- B) Modular power supply with detachable cables
- C) Redundant power supply
- D) Higher wattage rating

**Answer: B**
A modular supply lets the builder attach only the cables the build needs, removing unused bundles from the airflow path. Redundancy adds a duplicate supply for uptime, and wattage or adapters do not address cable clutter.
<!-- {"id":"COMPTIA-A-1201-Q092","objective":"3.4","type":"recall","source":"OBJ1201","locator":"Objective 3.4 modular power supply","verified":"2026-10-10"} -->

---

### Q93
A file server must keep running even if one of its power supplies dies during the workday. What hardware feature provides this?
- A) A 3.3V rail
- B) An uninterruptible mouse
- C) Redundant power supplies
- D) A modular cable set

**Answer: C**
Redundant supplies run in parallel so the server stays up on the surviving unit while the failed one is swapped. Modularity is about cable management, and a rail voltage or peripherals have no role in supply failover.
<!-- {"id":"COMPTIA-A-1201-Q093","objective":"3.4","type":"recall","source":"OBJ1201","locator":"Objective 3.4 redundant power supply","verified":"2026-10-10"} -->

---

### Q94
Which connector on a modern power supply feeds the motherboard its main power?
- A) The 4-pin Molex connector
- B) The SATA data connector
- C) The RJ45 connector
- D) The 20+4 pin motherboard connector

**Answer: D**
Motherboards draw their primary power through the 20+4 pin main connector (with a separate CPU power lead near the socket). Molex powers legacy peripherals, SATA data links storage to the board, and RJ45 is networking.
<!-- {"id":"COMPTIA-A-1201-Q094","objective":"3.4","type":"recall","source":"OBJ1201","locator":"Objective 3.4 20+4 pin motherboard connector","verified":"2026-10-10"} -->

---

### Q95
An office buys a printer whose driver list offers both PCL and PostScript versions. The design team prints complex graphics with embedded fonts from professional layout software. Which driver should they install?
- A) PostScript
- B) PCL
- C) Generic text-only
- D) The scanner driver

**Answer: A**
PostScript drivers render complex vector graphics and embedded fonts faithfully, which is why design and prepress workflows standardize on it. PCL is the general-office default that is usually faster for simple documents but weaker on advanced graphics.
<!-- {"id":"COMPTIA-A-1201-Q095","objective":"3.5","type":"diagnosis","source":"OBJ1201","locator":"Objective 3.5 drivers PCL vs PostScript","verified":"2026-10-10"} -->

---

### Q96
A shared office printer connects directly to the network with its own address rather than through one person's computer. Which connectivity option is in use, and what is the main benefit?
- A) Bluetooth pairing; it is the most secure
- B) Serial connection; it is the most modern
- C) Ethernet or wireless network connection; printing does not depend on any one PC being on
- D) USB connection; it is faster for everyone

**Answer: C**
A printer with its own network connection (Ethernet or Wi-Fi) is a standalone network node anyone can print to without relying on a host PC staying powered and logged in. USB-attached printers shared from a PC create exactly that dependency.
<!-- {"id":"COMPTIA-A-1201-Q096","objective":"3.5","type":"recall","source":"OBJ1201","locator":"Objective 3.5 device connectivity USB/Ethernet/wireless","verified":"2026-10-10"} -->

---

### Q97
Legal department staff print sensitive case documents to the shared hallway printer, and pages have gone missing from the output tray. Which printer security feature directly addresses this?
- A) Higher print quality setting
- B) Secured prints held until the sender authenticates at the device
- C) Automatic document feeder
- D) Duplex printing

**Answer: B**
Secured (or PIN/pull) printing queues the job until the sender walks up and authenticates, so sensitive pages are never left sitting in a public tray. Feeders, duplexing, and quality settings change handling and output, not release control.
<!-- {"id":"COMPTIA-A-1201-Q097","objective":"3.5","type":"diagnosis","source":"OBJ1201","locator":"Objective 3.5 security user authentication, secured prints","verified":"2026-10-10"} -->

---

### Q98
The office wants to cut paper costs in half on long reports without buying new printers. Which configuration setting delivers that?
- A) Higher DPI quality
- B) Portrait orientation
- C) A larger paper tray
- D) Duplex (two-sided) printing as the default

**Answer: D**
Duplexing prints on both sides of each sheet, roughly halving paper consumption for multi-page documents. Quality, orientation, and tray capacity do not reduce the number of sheets used.
<!-- {"id":"COMPTIA-A-1201-Q098","objective":"3.5","type":"recall","source":"OBJ1201","locator":"Objective 3.5 configuration settings duplex","verified":"2026-10-10"} -->

---

### Q99
After a power surge, a network printer boots but ignores all print jobs and shows odd characters on its panel. A firmware recovery option exists on the vendor's site. What is the most promising first repair?
- A) Reinstall the driver on one PC
- B) Reflash the printer's firmware with the vendor's recovery image
- C) Replace the toner cartridge
- D) Clean the printheads

**Answer: B**
Corrupted behavior on the device itself (odd panel characters, ignoring all jobs from every source) localizes the fault to the printer's own software. A vendor firmware recovery reflashes it. Consumables and one PC's driver cannot produce device-wide symptoms.
<!-- {"id":"COMPTIA-A-1201-Q099","objective":"3.5","type":"diagnosis","source":"OBJ1201","locator":"Objective 3.5 firmware","verified":"2026-10-10"} -->

---

### Q100
A clinic wants scanned patient forms to land directly in a shared folder on the file server from the multifunction device. Which network scan service should be configured?
- A) Print server queue
- B) Bluetooth beacon
- C) Scan to SMB share
- D) Scan to USB

**Answer: C**
Multifunction devices can deliver scans over the network to an SMB file-share destination, which matches a shared folder on the server. Scan to email and cloud are the other common network scan services; USB is local media, not network delivery.
<!-- {"id":"COMPTIA-A-1201-Q100","objective":"3.5","type":"recall","source":"OBJ1201","locator":"Objective 3.5 network scan services SMB","verified":"2026-10-10"} -->

---

### Q101
A receptionist must scan a 40-page double-sided contract. Which device feature saves them from placing each page on the glass by hand?
- A) Duplex printing
- B) Collating output tray
- C) Automatic document feeder
- D) Flatbed scanner glass

**Answer: C**
An ADF pulls a stack of pages through the scanner automatically, and a duplexing ADF captures both sides, turning a 40-page job into one button press. The flatbed is single-page manual placement, and duplex printing refers to output, not scanning.
<!-- {"id":"COMPTIA-A-1201-Q101","objective":"3.5","type":"recall","source":"OBJ1201","locator":"Objective 3.5 ADF/flatbed scanner","verified":"2026-10-10"} -->

---

### Q102
A small office with one USB printer wants all five staff to print without moving the cable or buying a network printer. What is the simplest setup?
- A) Share the printer from the attached PC as a printer share
- B) Buy five USB cables and swap as needed
- C) Email documents to one person to print
- D) Configure the printer as a DHCP server

**Answer: A**
A printer share on the host PC lets the other machines print over the network to the USB-attached device. The trade-off is that the host PC must stay on; when that becomes painful, a print server or network-capable printer is the upgrade path.
<!-- {"id":"COMPTIA-A-1201-Q102","objective":"3.5","type":"diagnosis","source":"OBJ1201","locator":"Objective 3.5 public/shared devices printer share vs print server","verified":"2026-10-10"} -->

---

### Q103
A newly unboxed multifunction device is installed on a high shelf above the supply cabinet, and staff complain the scanner lid hits the shelf and pages curl in the humid storeroom air. What setup principle was missed?
- A) The tray settings were wrong
- B) Proper unboxing and set-up location: clearance, ventilation, and environment matter
- C) The device needed a PCL driver instead
- D) The toner was not shaken first

**Answer: B**
Physical placement is part of deployment: a multifunction device needs lid clearance, ventilation space, and a clean, climate-appropriate location. Cramped, humid spots cause exactly these handling and print-quality problems.
<!-- {"id":"COMPTIA-A-1201-Q103","objective":"3.5","type":"diagnosis","source":"OBJ1201","locator":"Objective 3.5 properly unbox device and consider set-up location","verified":"2026-10-10"} -->

---

### Q104
A laser printer's pages come out faded even though the toner gauge shows half full. What is the fastest first thing to try before ordering parts?
- A) Replace the heating element
- B) Clean the inkjet printheads
- C) Replace the ribbon
- D) Remove the toner cartridge and gently rock it to redistribute the remaining toner

**Answer: D**
Toner settles unevenly, and redistributing it often restores density temporarily, confirming the cartridge is simply near end of life. Heating elements are thermal-printer parts, printheads are inkjet parts, and ribbons belong to impact printers.
<!-- {"id":"COMPTIA-A-1201-Q104","objective":"3.6","type":"diagnosis","source":"OBJ1201","locator":"Objective 3.6 laser maintenance replace toner","verified":"2026-10-10"} -->

---

### Q105
An inkjet that sat unused for months prints with missing bands of color across every page. Which maintenance step targets this symptom?
- A) Run the printhead cleaning cycle
- B) Replace the toner cartridge
- C) Apply a laser maintenance kit
- D) Replace the feed assembly belt

**Answer: A**
Idle inkjets clog: dried ink blocks nozzles and prints show banding or missing colors. The built-in printhead cleaning routine flushes the nozzles; severe cases need manual cleaning or a cartridge with an integrated head. Toner and maintenance kits are laser-printer items.
<!-- {"id":"COMPTIA-A-1201-Q105","objective":"3.6","type":"diagnosis","source":"OBJ1201","locator":"Objective 3.6 inkjet maintenance clean printheads","verified":"2026-10-10"} -->

---

### Q106
A receipt printer at the register produces blank receipts even though a fresh roll is loaded. The paper is genuine thermal stock. What should the technician check first?
- A) Whether the thermal paper is loaded with the heat-sensitive side facing the print head
- B) Whether the ink cartridge is empty
- C) Whether the ribbon is worn out
- D) Whether the Ethernet cable is plugged in

**Answer: A**
Thermal printers image only the coated side of special thermal paper; loading the roll backwards yields blank output with a good roll installed. Thermal printers use no ink or ribbon, and connectivity would stop the job from arriving, not blank it.
<!-- {"id":"COMPTIA-A-1201-Q106","objective":"3.6","type":"diagnosis","source":"OBJ1201","locator":"Objective 3.6 thermal special paper, heating element","verified":"2026-10-10"} -->

---

### Q107
A warehouse dot-matrix printer's shipping labels print lighter every week, and the text is now barely readable. What consumable is due?
- A) The ink cartridge
- B) The thermal paper roll
- C) The ribbon
- D) The toner cartridge

**Answer: C**
Impact printers strike an inked ribbon against the page; a fading ribbon produces progressively lighter print exactly as described. Toner, ink cartridges, and thermal paper belong to other printer families.
<!-- {"id":"COMPTIA-A-1201-Q107","objective":"3.6","type":"recall","source":"OBJ1201","locator":"Objective 3.6 impact maintenance replace ribbon","verified":"2026-10-10"} -->

---

### Q108
A laser printer is due for its 100,000-page service. Besides a fresh toner cartridge, what does the vendor's maintenance kit typically refresh?
- A) The ink nozzles
- B) The print ribbon
- C) The wireless antenna
- D) Wear items such as the fuser, rollers, and transfer components, plus calibration and cleaning

**Answer: D**
Laser maintenance kits replace the parts that wear with page count (fuser, pickup and feed rollers, transfer roller or belt) and are paired with calibration and cleaning to restore print quality and feeding reliability at the rated interval.
<!-- {"id":"COMPTIA-A-1201-Q108","objective":"3.6","type":"recall","source":"OBJ1201","locator":"Objective 3.6 laser maintenance kit, calibrate, clean","verified":"2026-10-10"} -->

---

### Q109
A laser printer jams on every third page, and the jammed sheets are always half-fed from the same tray. What is the best first fix attempt?
- A) Replace the toner cartridge
- B) Switch the driver from PCL to PostScript
- C) Enable duplex printing
- D) Remove, fan, and correctly reload the paper, then check the tray's pickup and feed rollers for wear

**Answer: D**
Repeatable feeding jams from one tray point at the paper path: stuck-together or misloaded sheets and worn pickup rollers are the usual causes. Consumables, drivers, and duplex settings do not produce position-consistent jams.
<!-- {"id":"COMPTIA-A-1201-Q109","objective":"3.6","type":"diagnosis","source":"OBJ1201","locator":"Objective 3.6 clear jams, maintenance","verified":"2026-10-10"} -->

---

### Q110
A small studio mixes several RAM sticks from old builds to upgrade one desktop, and the machine boots but crashes under memory-heavy work. Each stick passes a memory test alone. What is the prudent fix?
- A) Disable dual-channel mode in the OS
- B) Run matched modules of the same specification instead of mixed sticks
- C) Add a second power supply
- D) Replace the hard drive with a larger one

**Answer: B**
Mixed modules that pass individually can still fail together due to timing and voltage differences between kits. Matched modules eliminate the compatibility variable. There is no OS dual-channel toggle; channel configuration is a firmware/hardware matter.
<!-- {"id":"COMPTIA-A-1201-Q110","objective":"3.1","type":"diagnosis","source":"OBJ1201","locator":"Objective 3.1 channel configurations, DDR iterations","verified":"2026-10-10"} -->

---

### Q111
A user wants the fastest possible scratch disk for 4K video editing and cares nothing about data safety because the files are re-created daily. Which RAID level fits the requirement?
- A) RAID 6
- B) RAID 0
- C) RAID 1
- D) RAID 5

**Answer: B**
RAID 0 stripes data across drives for maximum throughput with no redundancy overhead, which suits disposable scratch data. Any mirrored or parity level trades exactly the speed and capacity this user wants for protection they explicitly do not need.
<!-- {"id":"COMPTIA-A-1201-Q111","objective":"3.2","type":"diagnosis","source":"OBJ1201","locator":"Objective 3.2 RAID 0 striping","verified":"2026-10-10"} -->

---

## DOMAIN 4: Virtualization and Cloud Computing (study allocation)

---

### Q112
A security researcher must open suspicious email attachments safely without risking their real workstation. Which virtualization approach fits best?
- A) Forward them to a personal account
- B) Open them inside a virtual machine used as a sandbox
- C) Open them after hours when the network is quiet
- D) Disable the antivirus first so it does not interfere

**Answer: B**
A VM sandbox isolates the hostile content from the host system: anything the attachment does stays inside the disposable guest, which can be reverted or deleted afterward. Timing, disabling protection, and forwarding all expose real systems.
<!-- {"id":"COMPTIA-A-1201-Q112","objective":"4.1","type":"diagnosis","source":"OBJ1201","locator":"Objective 4.1 purpose of virtual machines sandbox","verified":"2026-10-10"} -->

---

### Q113
A company wants to run twenty virtual servers on one physical box with no host operating system in between, for maximum efficiency. Which hypervisor type does this?
- A) Emulator plug-in
- B) Type 1 (bare-metal) hypervisor
- C) Type 2 (hosted) hypervisor
- D) Application container

**Answer: B**
Type 1 hypervisors install directly on the hardware and schedule guests without a host OS layer, which is the standard for production server consolidation. Type 2 runs as an application on a host OS, better suited to desktops and testing.
<!-- {"id":"COMPTIA-A-1201-Q113","objective":"4.1","type":"recall","source":"OBJ1201","locator":"Objective 4.1 hypervisors Type 1 vs Type 2","verified":"2026-10-10"} -->

---

### Q114
A developer tests an app on three operating systems using a hypervisor installed as a program on their Windows workstation. Which type are they using, and what is the trade-off?
- A) Type 1; maximum efficiency
- B) VDI; centralized desktops
- C) Containers; shared kernel isolation
- D) Type 2; convenient but adds host-OS overhead

**Answer: D**
A hosted (Type 2) hypervisor runs as an application on the workstation's OS, which is exactly the convenient desktop testing setup described, at the cost of the host OS consuming resources under every guest.
<!-- {"id":"COMPTIA-A-1201-Q114","objective":"4.1","type":"recall","source":"OBJ1201","locator":"Objective 4.1 hypervisor Type 2","verified":"2026-10-10"} -->

---

### Q115
A call center wants 200 identical employee desktops maintained as one golden image in the data center, with staff logging in from cheap terminals. Which technology delivers this?
- A) Local application virtualization
- B) A Type 2 hypervisor on each terminal
- C) Direct-burial fiber
- D) Virtual Desktop Infrastructure

**Answer: D**
VDI hosts desktop VMs centrally and streams the session to lightweight endpoints, so one maintained image serves many users and the terminals need almost no local management.
<!-- {"id":"COMPTIA-A-1201-Q115","objective":"4.1","type":"recall","source":"OBJ1201","locator":"Objective 4.1 desktop virtualization VDI","verified":"2026-10-10"} -->

---

### Q116
A team packages an application with its dependencies so it runs identically on any server sharing the host's kernel, starting in seconds without a full guest OS per instance. What are they using?
- A) Containers
- B) Type 1 hypervisors
- C) Multisocket motherboards
- D) HSM modules

**Answer: A**
Containers virtualize at the operating-system level: each carries the app and its libraries but shares the host kernel, making them far lighter and faster to start than full VMs. Hypervisor-based VMs each boot a complete guest OS.
<!-- {"id":"COMPTIA-A-1201-Q116","objective":"4.1","type":"recall","source":"OBJ1201","locator":"Objective 4.1 containers","verified":"2026-10-10"} -->

---

### Q117
A startup uses a web-based email and office suite that the provider runs entirely, with no servers to manage. Which cloud service model is this?
- A) IaaS
- B) PaaS
- C) Private cloud
- D) SaaS

**Answer: D**
Software as a service delivers finished applications over the internet with the provider managing everything down the stack. IaaS rents raw compute and storage, and PaaS provides a platform to build on, both of which leave far more to the customer.
<!-- {"id":"COMPTIA-A-1201-Q117","objective":"4.2","type":"recall","source":"OBJ1201","locator":"Objective 4.2 cloud service models IaaS/PaaS/SaaS","verified":"2026-10-10"} -->

---

### Q118
An online shop's traffic triples every December and is quiet the rest of the year. Which cloud characteristic lets them add capacity only for the rush and release it afterward?
- A) File synchronization
- B) Community cloud
- C) Elasticity
- D) Multitenancy

**Answer: C**
Elasticity is the ability to scale resources up and down with demand automatically or quickly, so the shop pays for peak capacity only during the peak. Metered utilization makes the billing follow that usage; multitenancy and synchronization are unrelated properties.
<!-- {"id":"COMPTIA-A-1201-Q118","objective":"4.2","type":"diagnosis","source":"OBJ1201","locator":"Objective 4.2 cloud characteristics elasticity, metered utilization","verified":"2026-10-10"} -->

---

### Q119
A hospital group wants cloud infrastructure shared only by several affiliated hospitals with common compliance needs, not the general public. Which cloud model fits?
- A) Community cloud
- B) Public cloud
- C) Hybrid cloud
- D) SaaS

**Answer: A**
A community cloud is provisioned for a specific group of organizations with shared requirements, such as compliance obligations. Public cloud is open to all tenants, hybrid mixes private and public, and SaaS is a service model rather than a deployment model.
<!-- {"id":"COMPTIA-A-1201-Q119","objective":"4.2","type":"recall","source":"OBJ1201","locator":"Objective 4.2 common cloud models community","verified":"2026-10-10"} -->

---

### Q120
A finance firm keeps its ledgers on its own cloud infrastructure but bursts end-of-month reporting into a public provider, moving workloads between the two. Which deployment model is this?
- A) Multitenancy
- B) Hybrid cloud
- C) Private cloud only
- D) Community cloud

**Answer: B**
Combining private infrastructure with public cloud and moving workloads between them is the definition of hybrid cloud. Private alone would not include the public burst, community involves peer organizations, and multitenancy describes shared-resource architecture rather than this deployment pattern.
<!-- {"id":"COMPTIA-A-1201-Q120","objective":"4.2","type":"recall","source":"OBJ1201","locator":"Objective 4.2 common cloud models hybrid","verified":"2026-10-10"} -->

---
