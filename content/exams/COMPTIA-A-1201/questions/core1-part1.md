# CompTIA A+ Core 1 (220-1201) Practice Questions - Part 1
# Original study items. Independent material, not official or endorsed by CompTIA.

## DOMAIN 1: Mobile Devices (study allocation)

---

### Q1
A field technician receives a laptop that shuts down after ten minutes on battery but runs all day on the charger. The battery is glued in place on this model. What is the safest next step before attempting any repair?
- A) Pry the battery out with a metal spudger to inspect it
- B) Check the manufacturer's service documentation for the correct replacement procedure
- C) Run the laptop without a battery until a replacement arrives
- D) Drain the battery fully by leaving the laptop on overnight

**Answer: B**
Manufacturer service documentation gives the safe removal and replacement procedure for integrated batteries, which can be punctured by improper prying. Metal tools near a lithium battery risk a thermal event, and running without a battery does nothing to fix the failing part.
<!-- {"id":"COMPTIA-A-1201-Q001","objective":"1.1","type":"diagnosis","source":"OBJ1201","locator":"Objective 1.1 battery replacement techniques","verified":"2026-10-10"} -->

---

### Q2
A user wants to upgrade the memory in a compact laptop. Which form factor should the technician order?
- A) SODIMM
- B) SIMM
- C) MicroDIMM riser
- D) DIMM

**Answer: A**
Laptops use Small Outline Dual In-line Memory Modules (SODIMMs), which are physically shorter than the full-size DIMMs used in desktop towers. Ordering a desktop DIMM is the most common wrong-part mistake in laptop RAM upgrades.
<!-- {"id":"COMPTIA-A-1201-Q002","objective":"1.1","type":"recall","source":"OBJ1201","locator":"Objective 1.1 RAM replacement","verified":"2026-10-10"} -->

---

### Q3
An older laptop takes four minutes to boot and apps open slowly, but the CPU and RAM test fine. Which single hardware change most improves everyday responsiveness?
- A) Install a higher-wattage power adapter
- B) Add a second battery
- C) Replace the Wi-Fi card with a newer model
- D) Replace the 2.5-inch hard drive with a solid-state drive

**Answer: D**
Slow boot and slow application launches with healthy CPU and RAM point to storage as the bottleneck. Replacing a mechanical 2.5-inch HDD with a 2.5-inch SATA SSD is the standard upgrade and transforms boot and load times.
<!-- {"id":"COMPTIA-A-1201-Q003","objective":"1.1","type":"diagnosis","source":"OBJ1201","locator":"Objective 1.1 HDD/SSD replacement","verified":"2026-10-10"} -->

---

### Q4
After a technician replaces a laptop's failed wireless card, the laptop connects to Wi-Fi but the signal is far weaker than before, even next to the access point. What did the technician most likely forget?
- A) Reconnecting the antenna leads to the new card
- B) Enabling the wireless radio in the OS
- C) Seating the card in the correct slot
- D) Updating the card's firmware

**Answer: A**
Laptop wireless cards rely on small snap-on antenna leads routed through the chassis and display. A card that works but with poor signal at close range is the classic symptom of antenna leads left disconnected or swapped. A card in the wrong slot would not function at all.
<!-- {"id":"COMPTIA-A-1201-Q004","objective":"1.1","type":"diagnosis","source":"OBJ1201","locator":"Objective 1.1 wireless cards, Wi-Fi antenna connector/placement","verified":"2026-10-10"} -->

---

### Q5
Several keys on a laptop keyboard register twice when pressed once, and the problem follows the keyboard in the manufacturer's diagnostic boot environment. What is the appropriate repair?
- A) Reflash the system BIOS
- B) Reinstall the keyboard driver
- C) Replace the keyboard assembly
- D) Disable key repeat in the OS settings

**Answer: C**
Key chatter that reproduces outside the operating system is a hardware fault in the keyboard itself, so the fix is replacing the keyboard assembly. Drivers and OS repeat settings cannot cause a fault that appears in a pre-boot diagnostic.
<!-- {"id":"COMPTIA-A-1201-Q005","objective":"1.1","type":"diagnosis","source":"OBJ1201","locator":"Objective 1.1 keyboard/keys replacement","verified":"2026-10-10"} -->

---

### Q6
A company issues laptops that must unlock only for their assigned user without a password at the lid-open screen, and must also support tap-to-pay at the cafeteria registers. Which two built-in components cover these requirements? (Choose two.)
- A) Fingerprint reader
- B) Near-field scanner
- C) Trusted Platform Module
- D) Smart card slot
- E) Camera privacy shutter

**Correct Answer: A, B**
A fingerprint reader provides biometric sign-in tied to the assigned user, and near-field scanner features (NFC) provide tap-to-pay style proximity transactions. A TPM protects keys and disk encryption but does not identify a user at sign-in, and a privacy shutter blocks the camera rather than authenticating anyone.
<!-- {"id":"COMPTIA-A-1201-Q006","objective":"1.1","type":"recall","source":"OBJ1201","locator":"Objective 1.1 biometrics, near-field scanner features","verified":"2026-10-10"} -->

---

### Q7
A technician upgrades a laptop's wireless card to a newer model and reattaches both antenna leads. Signal strength is excellent, but Bluetooth devices now stutter and drop. Which placement issue is the best lead?
- A) The battery is sitting closer to the card than before
- B) The antenna leads are routed away from the display hinges
- C) The antenna leads are pinched or sharply kinked where the chassis closes
- D) The card's Bluetooth function shares the same antennas and the leads are on the wrong posts

**Answer: D**
Combo wireless cards share antenna posts between Wi-Fi and Bluetooth, and the leads are labeled main and auxiliary. Swapped leads commonly leave one radio strong and the other degraded, which matches excellent Wi-Fi with stuttering Bluetooth.
<!-- {"id":"COMPTIA-A-1201-Q007","objective":"1.1","type":"diagnosis","source":"OBJ1201","locator":"Objective 1.1 wireless cards, antenna placement","verified":"2026-10-10"} -->

---

### Q8
During a video call, a user reports that others can see them but cannot hear them. The headset works on another laptop. What should the technician check first on the user's laptop?
- A) Whether the speakers are set to full volume
- B) Whether the Wi-Fi signal is strong enough for video
- C) Whether the built-in microphone is muted or disabled in privacy settings
- D) Whether the webcam driver needs an update

**Answer: C**
Video works, so the camera and connection are fine; the failure is isolated to audio input. Modern operating systems gate microphone access behind privacy permissions and hardware mute keys, which are the most common and fastest things to check before drivers or hardware.
<!-- {"id":"COMPTIA-A-1201-Q008","objective":"1.1","type":"diagnosis","source":"OBJ1201","locator":"Objective 1.1 camera/webcam, microphone","verified":"2026-10-10"} -->

---

### Q9
A user buys a cable advertised as USB-C on both ends, but it only charges their phone and will not connect it to their computer for file transfers. What is the most likely explanation?
- A) USB-C connectors cannot carry data
- B) The cable is a charge-only cable with no data lines wired
- C) The phone's USB port is damaged
- D) The computer requires a Lightning adapter

**Answer: B**
USB-C describes the connector shape, not the wiring inside. Low-cost charge-only cables omit the data conductors, so they deliver power but cannot sync. Swapping in a known data-capable cable is the fast confirmation.
<!-- {"id":"COMPTIA-A-1201-Q009","objective":"1.2","type":"diagnosis","source":"OBJ1201","locator":"Objective 1.2 connection methods USB/USB-C","verified":"2026-10-10"} -->

---

### Q10
Which connection method is designed for very short-range exchanges such as tapping a phone to a payment terminal or pairing an accessory by touch?
- A) Lightning
- B) Bluetooth
- C) Near-field communication
- D) Tethering

**Answer: C**
NFC operates at a few centimeters and is the technology behind tap-to-pay and tap-to-pair. Bluetooth reaches meters, tethering shares a cellular data connection, and Lightning is a wired connector family.
<!-- {"id":"COMPTIA-A-1201-Q010","objective":"1.2","type":"recall","source":"OBJ1201","locator":"Objective 1.2 NFC","verified":"2026-10-10"} -->

---

### Q11
A traveling worker wants to give their laptop internet access through their phone's cellular connection for one afternoon. What is the simplest built-in option?
- A) Connect the phone to the laptop with an HDMI cable
- B) Install a second SIM card in the laptop
- C) Enable the phone's hotspot feature and join it from the laptop
- D) Pair the laptop to the phone over NFC

**Answer: C**
Tethering through the phone's hotspot shares its cellular data connection over Wi-Fi (or USB/Bluetooth) with no extra hardware. NFC cannot carry an internet session, and most laptops have no SIM slot at all.
<!-- {"id":"COMPTIA-A-1201-Q011","objective":"1.2","type":"recall","source":"OBJ1201","locator":"Objective 1.2 tethering/hotspot","verified":"2026-10-10"} -->

---

### Q12
An office worker plugs one cable into their laptop at their desk and instantly gets two monitors, Ethernet, a keyboard, a mouse, and charging. When a colleague tries the same setup with a simple USB-C hub, only some devices work. What explains the difference?
- A) The first setup uses a docking station, which provides power delivery and full display and data bandwidth
- B) The first setup uses a port replicator, which only duplicates USB ports
- C) The hub needs its firmware flashed
- D) The colleague's laptop has a broken USB port

**Answer: A**
A docking station negotiates power delivery and display bandwidth over USB-C/Thunderbolt to run monitors, wired network, and peripherals from one cable. Simple hubs and port replicates split USB data only, so displays and charging fall off. Matching the accessory to the workload is the point.
<!-- {"id":"COMPTIA-A-1201-Q012","objective":"1.2","type":"diagnosis","source":"OBJ1201","locator":"Objective 1.2 docking station vs port replicator","verified":"2026-10-10"} -->

---

### Q13
A graphic designer needs precise pen input with pressure sensitivity directly on the screen of a tablet for illustration work. Which accessory fits the requirement?
- A) Stylus
- B) Trackball
- C) External webcam
- D) Trackpoint

**Answer: A**
A stylus gives pressure-sensitive pen input for drawing and handwriting on a compatible digitizer screen. A trackpoint is a small pointing stick in a keyboard, and a trackball is a pointing device, neither of which draws on a screen.
<!-- {"id":"COMPTIA-A-1201-Q013","objective":"1.2","type":"recall","source":"OBJ1201","locator":"Objective 1.2 accessories stylus, drawing pad","verified":"2026-10-10"} -->

---

### Q14
A user's wireless earbuds will not enter pairing mode with a new laptop, though they paired fine with a phone yesterday. What should the technician try first?
- A) Update the laptop's Bluetooth driver to a beta version
- B) Move the laptop closer to the wireless access point
- C) Replace the earbuds' battery
- D) Forget the phone pairing and put the earbuds back into pairing mode

**Answer: D**
Many Bluetooth accessories hold a limited pairing table and stay bonded to the last device. Clearing the old pairing and forcing pairing mode again resolves most refusals before any driver or hardware work. Wi-Fi proximity is irrelevant to Bluetooth pairing.
<!-- {"id":"COMPTIA-A-1201-Q014","objective":"1.2","type":"diagnosis","source":"OBJ1201","locator":"Objective 1.2 Bluetooth accessories headsets","verified":"2026-10-10"} -->

---

### Q15
A warehouse tablet must charge from a single ruggedized connector that also carries scanner data, and the connector must survive thousands of insertions. The devices all have modern reversible ports. Which connector family should the standard build use?
- A) microUSB
- B) miniUSB
- C) USB-C
- D) DB9

**Answer: C**
USB-C is the modern reversible connector that carries power delivery and data on one ruggedized port and is rated for high insertion cycles. microUSB and miniUSB are legacy, non-reversible, and lower-powered; DB9 is a serial connector.
<!-- {"id":"COMPTIA-A-1201-Q015","objective":"1.2","type":"recall","source":"OBJ1201","locator":"Objective 1.2 USB/USB-C/microUSB/miniUSB","verified":"2026-10-10"} -->

---

### Q16
A user with an older iPhone and a newer Android-based work tablet wants one cable kit that can charge both from the same wall charger. What does the kit need?
- A) An NFC charging pad only
- B) One USB-C cable and one Lightning cable (or a USB-C to Lightning cable) sharing the charger
- C) Two microUSB cables
- D) One Lightning to Lightning cable

**Answer: B**
Apple devices of that generation use the Lightning connector while modern Android devices use USB-C, so charging both from one charger means one cable per connector family sharing the same power adapter.
<!-- {"id":"COMPTIA-A-1201-Q016","objective":"1.2","type":"recall","source":"OBJ1201","locator":"Objective 1.2 Lightning connection method","verified":"2026-10-10"} -->

---

### Q17
A sales rep lands at a client site and their phone shows full signal bars but no data connection. Wi-Fi calling still works on the client guest network. What is the first setting to verify on the phone?
- A) That the device is in airplane mode
- B) That cellular data is enabled
- C) That Bluetooth is enabled
- D) That location services are off

**Answer: B**
Full signal bars reflect voice service; data can be independently disabled. Cellular data being switched off (or a data limit reached) produces exactly this symptom, and it is the fastest setting to check. Airplane mode would kill the cellular signal entirely, and Bluetooth is unrelated.
<!-- {"id":"COMPTIA-A-1201-Q017","objective":"1.3","type":"diagnosis","source":"OBJ1201","locator":"Objective 1.3 wireless/cellular data network enable/disable","verified":"2026-10-10"} -->

---

### Q18
A traveler wants to add a local data plan for a two-week trip without opening the phone or visiting a store for a plastic card. What technology makes that possible?
- A) eSIM
- B) microSD
- C) NFC
- D) Port replicator

**Answer: A**
An eSIM is a programmable, soldered subscriber identity module that can download a carrier plan profile remotely, so a traveler can add local service with no physical SIM swap. The other options have no role in carrier provisioning.
<!-- {"id":"COMPTIA-A-1201-Q018","objective":"1.3","type":"recall","source":"OBJ1201","locator":"Objective 1.3 SIM/eSIM","verified":"2026-10-10"} -->

---

### Q19
A user pairs a new Bluetooth keyboard with a tablet. The tablet finds the keyboard, but the pairing fails every time at the confirmation step. What is the most likely fix?
- A) Move the keyboard within one centimeter of the screen
- B) Enter the PIN code the tablet displays using the new keyboard, then press Enter
- C) Disable the tablet's Wi-Fi radio during pairing
- D) Factory reset the tablet

**Answer: B**
The standard Bluetooth pairing flow for keyboards is: enable pairing, find the device, then type the displayed PIN on the keyboard to prove possession. Skipping or mistyping that code fails pairing exactly as described. Wi-Fi state and NFC-range distances do not apply.
<!-- {"id":"COMPTIA-A-1201-Q019","objective":"1.3","type":"diagnosis","source":"OBJ1201","locator":"Objective 1.3 Bluetooth pairing, enter the appropriate PIN code","verified":"2026-10-10"} -->

---

### Q20
A delivery app's map cannot center on the driver's position, but the phone's navigation app works fine. What is the best first check?
- A) Whether location services permission is granted to the delivery app
- B) Whether the phone has a cellular signal
- C) Whether the battery saver is charging
- D) Whether Bluetooth beacons are nearby

**Answer: A**
When one app's location works and another's does not, the per-app location permission is the fault line. GPS and cellular location services are clearly functional for the device as a whole, so the delivery app's own permission or location mode is the fast check.
<!-- {"id":"COMPTIA-A-1201-Q020","objective":"1.3","type":"diagnosis","source":"OBJ1201","locator":"Objective 1.3 location services, GPS services","verified":"2026-10-10"} -->

---

### Q21
A company lets staff use personal phones for work email but must be able to enforce a device passcode and wipe only the work profile if a phone is lost. Which approach fits?
- A) A shared corporate Apple ID on every phone
- B) Full device imaging each Monday
- C) Disabling location services on all devices
- D) Mobile device management with a BYOD policy

**Answer: D**
Mobile device management with a bring-your-own-device policy separates the work container from personal data, so policy enforcement (passcodes, app rules) and selective wipe apply only to the corporate side. Shared accounts and full wipes trample personal data and are not defensible.
<!-- {"id":"COMPTIA-A-1201-Q021","objective":"1.3","type":"diagnosis","source":"OBJ1201","locator":"Objective 1.3 MDM, corporate vs BYOD, policy enforcement","verified":"2026-10-10"} -->

---

### Q22
A user syncs photos to cloud storage over cellular and burns through their monthly data cap in a week. What is the right configuration change?
- A) Move the photos to a microSD card
- B) Turn off contact synchronization
- C) Restrict the sync app's background data to Wi-Fi only
- D) Disable the phone's Wi-Fi radio

**Answer: C**
Synchronization settings let each app sync only on unmetered connections. Restricting photo sync to Wi-Fi preserves the backup habit without consuming the cellular data cap. The other options either break connectivity or do not address which network the sync uses.
<!-- {"id":"COMPTIA-A-1201-Q022","objective":"1.3","type":"diagnosis","source":"OBJ1201","locator":"Objective 1.3 synchronization, recognizing data caps","verified":"2026-10-10"} -->

---

### Q23
After a company mail server migration, a user's phone shows current calendar entries and contacts but no new email. What does this pattern indicate?
- A) The mail app needs a newer SIM card
- B) The entire sync profile is broken
- C) Only the mail sync configuration (server or credentials) is wrong; other sync types still authenticate
- D) The phone's storage is full

**Answer: C**
Calendar, contacts, and mail are separate sync services that can fail independently. Working contacts and calendar prove the account authenticates, so the fault is specific to the mail service settings, such as the new server name or mail-specific toggle.
<!-- {"id":"COMPTIA-A-1201-Q023","objective":"1.3","type":"diagnosis","source":"OBJ1201","locator":"Objective 1.3 synchronization mail, calendar, contacts","verified":"2026-10-10"} -->

---

### Q24
A kiosk tablet in a lobby keeps losing its Wi-Fi connection every night at closing time and reconnecting each morning. The access point serves other devices overnight without issue. What is the best lead?
- A) The tablet needs a new battery
- B) The DHCP server runs out of addresses at night
- C) The tablet's Wi-Fi radio is disabled by a scheduled power-saving policy
- D) The access point changes channels at night

**Answer: C**
A clock-aligned failure on one device points at a local schedule, and managed tablets commonly carry power-saving policies that disable radios outside business hours. Other devices staying online rules out the access point and DHCP server, and a battery fault would not keep office hours.
<!-- {"id":"COMPTIA-A-1201-Q024","objective":"1.3","type":"diagnosis","source":"OBJ1201","locator":"Objective 1.3 wireless network connectivity, MDM device configurations","verified":"2026-10-10"} -->

---

## DOMAIN 2: Networking (study allocation)

---

### Q25
A technician needs to remotely administer a Linux server over an encrypted command-line session. Which port should be open on the server's firewall?
- A) 22
- B) 3389
- C) 443
- D) 23

**Answer: A**
Secure Shell (SSH) provides encrypted remote command-line administration on TCP port 22. Telnet on 23 is the unencrypted predecessor and should not be exposed, 3389 is Remote Desktop Protocol, and 443 is HTTPS web traffic.
<!-- {"id":"COMPTIA-A-1201-Q025","objective":"2.1","type":"recall","source":"OBJ1201","locator":"Objective 2.1 ports and protocols SSH 22","verified":"2026-10-10"} -->

---

### Q26
Users report that every website fails to load by name, but a test site loads when the technician types its IP address. Which service should the technician investigate first, and on which port does it listen?
- A) DHCP on port 67
- B) DNS on port 53
- C) HTTP on port 80
- D) SMTP on port 25

**Answer: B**
"Works by IP, fails by name" is the signature of a Domain Name System failure: name resolution is broken while connectivity is fine. DNS listens on port 53. DHCP would prevent the machine from having a usable address at all, and HTTP is the web traffic itself, which works.
<!-- {"id":"COMPTIA-A-1201-Q026","objective":"2.1","type":"diagnosis","source":"OBJ1201","locator":"Objective 2.1 DNS 53","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q27
A security policy requires that all web traffic to a banking site be encrypted in transit. Which port and protocol pairing satisfies the requirement?
- A) TCP 443, HTTPS
- B) UDP 53, DNS
- C) TCP 110, POP3
- D) TCP 80, HTTP

**Answer: A**
HTTPS on TCP port 443 is HTTP carried over TLS, which encrypts web traffic in transit. Plain HTTP on port 80 sends content readable on the wire, DNS resolves names rather than carrying web sessions, and POP3 is a mail retrieval protocol.
<!-- {"id":"COMPTIA-A-1201-Q027","objective":"2.1","type":"recall","source":"OBJ1201","locator":"Objective 2.1 HTTPS 443","verified":"2026-10-10"} -->

---

### Q28
A help desk technician wants to view and control a Windows user's desktop across the network to walk them through a fix. Which protocol and port does the built-in Windows feature for this use?
- A) SSH on TCP 22
- B) SMB on TCP 445
- C) LDAP on TCP 389
- D) RDP on TCP 3389

**Answer: D**
Remote Desktop Protocol provides graphical remote control of a Windows desktop on TCP port 3389. SSH is command-line oriented, SMB is file sharing, and LDAP is directory lookup, none of which shows the user's screen.
<!-- {"id":"COMPTIA-A-1201-Q028","objective":"2.1","type":"recall","source":"OBJ1201","locator":"Objective 2.1 RDP 3389","verified":"2026-10-10"} -->

---

### Q29
A file copy between two office PCs is slow, and the technician suspects the traffic is being routed off the local switch unnecessarily. Both machines map each other's shared folders by name. Which protocol and port carries that Windows file-sharing traffic?
- A) SMTP on TCP 25
- B) IMAP on TCP 143
- C) FTP on TCP 20-21
- D) SMB on TCP 445

**Answer: D**
Windows shared-folder traffic runs over Server Message Block on TCP port 445 (also associated with CIFS). FTP is a separate explicit file-transfer service, and SMTP/IMAP are mail protocols.
<!-- {"id":"COMPTIA-A-1201-Q029","objective":"2.1","type":"recall","source":"OBJ1201","locator":"Objective 2.1 SMB/CIFS 445","verified":"2026-10-10"} -->

---

### Q30
An application developer asks whether their telemetry sensor should send its tiny one-way readings using TCP or UDP. Delivery of every individual packet matters less than keeping latency low, and lost readings are replaced by the next one a second later. Which is the better fit and why?
- A) TCP, because it guarantees delivery of every packet
- B) UDP, because it skips connection setup and retransmission overhead
- C) TCP, because it is always faster
- D) UDP, because it encrypts the stream

**Answer: B**
UDP is connectionless with no handshake, ordering, or retransmission, which keeps latency minimal for loss-tolerant streams such as repeating sensor readings. TCP's guaranteed delivery costs exactly the overhead this workload wants to avoid, and neither protocol provides encryption by itself.
<!-- {"id":"COMPTIA-A-1201-Q030","objective":"2.1","type":"diagnosis","source":"OBJ1201","locator":"Objective 2.1 TCP vs UDP","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q31
An office's Wi-Fi crawls every day at lunch when the break room microwave runs, but wired desktops are unaffected. Which wireless characteristic explains this?
- A) The 2.4GHz band is crowded and susceptible to interference from common appliances
- B) The 6GHz band cannot penetrate walls
- C) Ethernet cables absorb radio noise
- D) The access point's DHCP scope is too small

**Answer: A**
The 2.4GHz band is shared with many household devices, including microwave ovens, and interference shows up as degraded Wi-Fi while wired connections stay normal. Moving clients to the 5GHz or 6GHz band, or changing channels, is the standard fix.
<!-- {"id":"COMPTIA-A-1201-Q031","objective":"2.2","type":"diagnosis","source":"OBJ1201","locator":"Objective 2.2 frequencies 2.4GHz/5GHz/6GHz","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q32
A small office wants the best mix of range through several walls for laptops that roam the whole floor. Which band generally gives the widest usable coverage?
- A) 2.4GHz
- B) 60GHz
- C) 6GHz
- D) 5GHz

**Answer: A**
Lower frequencies propagate farther and penetrate walls better, so 2.4GHz offers the widest coverage at the cost of speed and congestion. The 5GHz and 6GHz bands deliver higher throughput over shorter range.
<!-- {"id":"COMPTIA-A-1201-Q032","objective":"2.2","type":"recall","source":"OBJ1201","locator":"Objective 2.2 frequencies","verified":"2026-10-10"} -->

---

### Q33
Two neighboring offices on the same floor both run 2.4GHz Wi-Fi and each sees the other's network. Performance on both degrades during the day. What configuration change helps both offices most?
- A) Move both networks to the same channel so they coordinate
- B) Disable SSID broadcast on both networks
- C) Manually set each access point to a different non-overlapping channel
- D) Raise the transmit power on both access points

**Answer: C**
In 2.4GHz, only a few channels are non-overlapping, and neighbors on the same or overlapping channels must share airtime. Assigning distinct non-overlapping channels (and following local regulations) removes the contention. Raising power worsens interference, and hiding the SSID does nothing for airtime.
<!-- {"id":"COMPTIA-A-1201-Q033","objective":"2.2","type":"diagnosis","source":"OBJ1201","locator":"Objective 2.2 channels, regulations, channel selection","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q34
Which wireless technology is most appropriate for inventory tags that a handheld reader scans from a few feet away without any battery in the tag?
- A) 802.11 Wi-Fi
- B) NFC tap-to-pay
- C) Bluetooth
- D) Radio-frequency identification

**Answer: D**
RFID tags can be passive (powered by the reader's field) and readable at short range, which suits inventory scanning. Bluetooth requires a powered radio, Wi-Fi is for networked hosts, and NFC works at centimeters, not feet.
<!-- {"id":"COMPTIA-A-1201-Q034","objective":"2.2","type":"recall","source":"OBJ1201","locator":"Objective 2.2 RFID","verified":"2026-10-10"} -->

---

### Q35
A user reports their phone keeps preferring a slow legacy Wi-Fi network over the office's newer, faster one. Both use the same password. What explains the behavior and the fix?
- A) The phone prefers the stronger 2.4GHz signal; give the 5GHz/6GHz network its own SSID and join that
- B) The phone's Bluetooth is interfering; disable it
- C) The newer network uses a wider channel and is unsafe; avoid it
- D) The legacy network has a newer 802.11 standard; keep using it

**Answer: A**
Clients often latch onto the stronger signal, and 2.4GHz typically reads stronger at a distance even though it is slower. Separating SSIDs per band lets the user deliberately join the faster band; band steering or a distinct SSID is the standard remedy.
<!-- {"id":"COMPTIA-A-1201-Q035","objective":"2.2","type":"diagnosis","source":"OBJ1201","locator":"Objective 2.2 802.11 standards, bands","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q36
Employees must reach internal file shares from home as if they were on the office network, with traffic encrypted across the internet. Which service provides this?
- A) Virtual LAN
- B) DNS forwarding
- C) APIPA addressing
- D) Virtual private network

**Answer: D**
A VPN builds an encrypted tunnel from the remote device into the office network so remote workers reach internal resources securely. A VLAN segments local traffic, DNS resolves names, and APIPA is a fallback self-addressing scheme, none of which connects remote users.
<!-- {"id":"COMPTIA-A-1201-Q036","objective":"2.4","type":"recall","source":"OBJ1201","locator":"Objective 2.4 VPN","verified":"2026-10-10"} -->

---

### Q37
A technician adds a new printer and wants it to always receive the same address from the network's automatic addressing service, without configuring the printer manually. What should they create?
- A) A new VLAN for printers
- B) An APIPA address on the printer
- C) A DHCP reservation tied to the printer's MAC address
- D) A DNS A record for the printer

**Answer: C**
A DHCP reservation binds a specific IP address to a device's MAC address inside the scope, so the printer always gets the same lease while remaining DHCP-configured. A DNS record only maps a name to whatever address the printer happens to hold.
<!-- {"id":"COMPTIA-A-1201-Q037","objective":"2.4","type":"diagnosis","source":"OBJ1201","locator":"Objective 2.4 DHCP leases, reservations","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q38
The office runs out of assignable addresses every Friday when contractors arrive. The network uses automatic addressing with a small pool. Which two changes directly address the exhaustion? (Choose two.)
- A) Expand the DHCP scope's address range
- B) Shorten the DHCP lease time
- C) Add a second DNS server
- D) Enable VLAN tagging
- E) Replace the router with a switch

**Correct Answer: A, B**
Scope exhaustion is fixed by giving the pool more addresses or by reclaiming idle leases faster. A larger range adds capacity, and a shorter lease returns addresses from departed devices sooner. DNS redundancy, VLANs, and swapping routing for switching do not add leases.
<!-- {"id":"COMPTIA-A-1201-Q038","objective":"2.4","type":"diagnosis","source":"OBJ1201","locator":"Objective 2.4 DHCP scope, leases","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q39
A web admin wants www.example.com to point at the server whose hostname is web01.example.com, so that if the server's address changes only one record needs editing. Which DNS record type creates that alias?
- A) MX
- B) A
- C) AAAA
- D) CNAME

**Answer: D**
A CNAME record aliases one name to another hostname, so www can follow web01's own A record through later address changes. An A record maps a name directly to an IPv4 address, AAAA to IPv6, and MX directs mail.
<!-- {"id":"COMPTIA-A-1201-Q039","objective":"2.4","type":"recall","source":"OBJ1201","locator":"Objective 2.4 DNS record types CNAME","verified":"2026-10-10"} -->

---

### Q40
After a phishing wave, the security team wants receiving mail servers to be able to verify which systems may legitimately send mail for the company domain. Which DNS text-based mechanism should be published first?
- A) DHCP reservation
- B) SPF
- C) CNAME
- D) AAAA

**Answer: B**
A Sender Policy Framework record (published as a TXT record) lists the servers authorized to send mail for the domain, letting receivers reject forgeries. DKIM adds cryptographic signatures and DMARC sets enforcement policy, but the first building block asked for here is the sender list, which is SPF.
<!-- {"id":"COMPTIA-A-1201-Q040","objective":"2.4","type":"diagnosis","source":"OBJ1201","locator":"Objective 2.4 DNS TXT, SPF/DKIM/DMARC spam management","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q41
The accounting department and guest Wi-Fi share the same switch hardware, but policy says guest traffic must never reach accounting PCs. What should the technician configure?
- A) Static IP addresses on the guest devices
- B) A VPN concentrator for the accounting PCs
- C) VLANs to segment the two groups logically
- D) A second physical switch for guests

**Answer: C**
Virtual LANs create logically separate networks on shared switching hardware, so guest and accounting traffic stay isolated without buying duplicate equipment. A second switch works but wastes money when VLAN-capable gear is already present.
<!-- {"id":"COMPTIA-A-1201-Q041","objective":"2.4","type":"diagnosis","source":"OBJ1201","locator":"Objective 2.4 VLAN","verified":"2026-10-10"} -->

---

### Q42
A small office's network printer disappeared from everyone's list after a power outage. The printer gets its address automatically, and the outage let it pick up a different one. What is the durable fix?
- A) Move the printer to the guest VLAN
- B) Shorten the DNS cache time on all PCs
- C) Create a DHCP reservation (or exclusion plus static address) so the printer's address never changes, and update the port configuration once
- D) Reinstall the printer driver on every PC after each outage

**Answer: C**
Printer ports on the PCs point at an address; when DHCP hands the printer a new one, every queue breaks. Pinning the address with a reservation (or a static address outside the scope via an exclusion) makes the configuration survive reboots and outages.
<!-- {"id":"COMPTIA-A-1201-Q042","objective":"2.4","type":"diagnosis","source":"OBJ1201","locator":"Objective 2.4 DHCP reservations, exclusions","verified":"2026-10-10"} -->

---

### Q43
A remote monitoring vendor asks which network service will keep the office's device logs in one place for their dashboard. Which server role should the office run?
- A) Syslog server
- B) Print server
- C) DHCP server
- D) Mail server

**Answer: A**
A syslog server centralizes log messages from routers, switches, servers, and appliances so they can be searched and alerted on from one place. The other roles share printers, hand out addresses, and move email respectively.
<!-- {"id":"COMPTIA-A-1201-Q043","objective":"2.3","type":"recall","source":"OBJ1201","locator":"Objective 2.3 server roles syslog","verified":"2026-10-10"} -->

---

### Q44
Staff report that the office clock drift causes timestamp mismatches between the security camera system and the access-log server, complicating an incident review. Which service keeps every device's clock aligned?
- A) DHCP
- B) AAA
- C) NTP
- D) DNS

**Answer: C**
Network Time Protocol synchronizes clocks across devices so logs and recordings line up during investigations. DNS resolves names, DHCP assigns addresses, and AAA handles authentication and accounting, none of which set the time.
<!-- {"id":"COMPTIA-A-1201-Q044","objective":"2.3","type":"diagnosis","source":"OBJ1201","locator":"Objective 2.3 server roles NTP","verified":"2026-10-10"} -->

---

### Q45
A growing website must spread incoming requests across three identical web servers so no single one overloads. Which internet appliance does this?
- A) Spam gateway
- B) Patch panel
- C) Proxy server
- D) Load balancer

**Answer: D**
A load balancer distributes incoming connections across a pool of servers for capacity and resilience. A proxy intermediates requests for caching or policy, a spam gateway filters email, and a patch panel is passive cabling hardware.
<!-- {"id":"COMPTIA-A-1201-Q045","objective":"2.3","type":"recall","source":"OBJ1201","locator":"Objective 2.3 internet appliances load balancers","verified":"2026-10-10"} -->

---

### Q46
Management wants one appliance at the network edge that combines firewalling, malware scanning, and content filtering instead of three separate boxes. What are they describing?
- A) Unified threat management appliance
- B) Network interface card
- C) Optical network terminal
- D) Access point controller

**Answer: A**
A UTM appliance bundles multiple security functions (firewall, anti-malware, content filtering, often VPN and intrusion prevention) into a single edge device, trading best-of-breed depth for simplicity. The other options are a host adapter, a fiber terminator, and wireless infrastructure.
<!-- {"id":"COMPTIA-A-1201-Q046","objective":"2.3","type":"recall","source":"OBJ1201","locator":"Objective 2.3 internet appliances UTM","verified":"2026-10-10"} -->

---

### Q47
The office wants outbound web browsing to pass through a single intermediary that caches frequent downloads and enforces acceptable-use policy. Which device role fits?
- A) Proxy server
- B) Fileshare server
- C) Authentication server
- D) Database server

**Answer: A**
A proxy server sits between clients and the internet, forwarding requests, caching content, and applying browsing policy. File, authentication, and database servers serve storage, identity, and data respectively, not outbound web intermediation.
<!-- {"id":"COMPTIA-A-1201-Q047","objective":"2.3","type":"recall","source":"OBJ1201","locator":"Objective 2.3 internet appliances proxy servers","verified":"2026-10-10"} -->

---

### Q48
A factory floor controller from 2005 still runs the line and cannot be patched, but it must exchange data with the business network. How should the network team treat it?
- A) As a DHCP server for the floor
- B) As a load balancer for the SCADA traffic
- C) As a legacy/embedded system that needs isolation and controlled access rather than direct exposure
- D) As a normal workstation joined to the domain

**Answer: C**
SCADA and other legacy/embedded systems often cannot be patched or upgraded, so the standard practice is segmentation and tightly controlled access to limit the blast radius of their known weaknesses. Treating one as a normal domain workstation exposes it far beyond its tolerance.
<!-- {"id":"COMPTIA-A-1201-Q048","objective":"2.3","type":"diagnosis","source":"OBJ1201","locator":"Objective 2.3 legacy/embedded systems SCADA","verified":"2026-10-10"} -->

---

### Q49
A technician wants to manage a switch's VLANs and port settings through its web interface, but the new switch out of the box has no configuration options at all. What kind of switch did they buy?
- A) PoE injector
- B) Patch panel
- C) Managed
- D) Unmanaged

**Answer: D**
An unmanaged switch forwards traffic with no configuration interface; VLANs, port control, and monitoring require a managed switch. A PoE injector only adds power to a cable run, and a patch panel is passive termination hardware.
<!-- {"id":"COMPTIA-A-1201-Q049","objective":"2.5","type":"recall","source":"OBJ1201","locator":"Objective 2.5 switches managed vs unmanaged","verified":"2026-10-10"} -->

---

### Q50
The office installs ceiling wireless access points far from any power outlet, and running new electrical circuits is too expensive. What powers the access points over the network cabling already in place?
- A) A cable modem
- B) Power over Ethernet from the switch or an injector
- C) A DSL modem
- D) A loopback plug

**Answer: B**
Power over Ethernet delivers DC power alongside data on standard network cabling, either from a PoE-capable switch or a mid-span injector, which is exactly how ceiling access points are commonly deployed. Modems and loopback plugs provide no device power.
<!-- {"id":"COMPTIA-A-1201-Q050","objective":"2.5","type":"diagnosis","source":"OBJ1201","locator":"Objective 2.5 PoE injectors, switch, standards","verified":"2026-10-10"} -->

---

### Q51
A home office's internet enters over the same coaxial line as the TV service. Which device terminates that connection for the home network?
- A) Patch panel
- B) Cable modem
- C) Optical network terminal
- D) DSL modem

**Answer: B**
Cable internet service arrives over coaxial cable and is terminated by a cable modem. An ONT terminates fiber, a DSL modem terminates phone-line service, and a patch panel organizes cabling runs.
<!-- {"id":"COMPTIA-A-1201-Q051","objective":"2.5","type":"recall","source":"OBJ1201","locator":"Objective 2.5 cable modem, DSL, ONT","verified":"2026-10-10"} -->

---

### Q52
A firewall rule must allow traffic from exactly one administrator PC. Which address burned into the PC's network adapter uniquely identifies it on the local network for that rule?
- A) Hostname
- B) MAC address
- C) IP address
- D) SSID

**Answer: B**
The network interface card carries a physical media access control address assigned by its manufacturer, which identifies the adapter itself. IP addresses change with networks and DHCP, hostnames are labels, and an SSID names a wireless network.
<!-- {"id":"COMPTIA-A-1201-Q052","objective":"2.5","type":"recall","source":"OBJ1201","locator":"Objective 2.5 NIC, physical MAC address","verified":"2026-10-10"} -->

---

### Q53
A new wing needs forty desk drops punched down and labeled in a central closet so the switches can be rearranged later without touching wall cabling. What hardware terminates those runs?
- A) PoE injector
- B) Patch panel
- C) Cable modem
- D) Firewall

**Answer: B**
A patch panel terminates permanent horizontal cabling runs in the closet so short patch cords can connect any drop to any switch port, keeping the fixed wiring untouched during rearrangements.
<!-- {"id":"COMPTIA-A-1201-Q053","objective":"2.5","type":"diagnosis","source":"OBJ1201","locator":"Objective 2.5 patch panel","verified":"2026-10-10"} -->

---

### Q54
A laptop shows an address of 169.254.10.42 and cannot reach anything, while every other machine on the same network works. What does that address tell the technician?
- A) The laptop is on the wrong VLAN only
- B) The laptop failed to get a DHCP lease and self-assigned an APIPA address
- C) The laptop has a static public address
- D) The DNS server is down

**Answer: B**
Addresses in 169.254.0.0/16 are Automatic Private IP Addressing fallbacks a host assigns itself when DHCP does not answer. The next checks are the cable/Wi-Fi link and the DHCP service, not DNS, which would not produce this address.
<!-- {"id":"COMPTIA-A-1201-Q054","objective":"2.6","type":"diagnosis","source":"OBJ1201","locator":"Objective 2.6 IPv4 addressing, APIPA","verified":"2026-10-10"} -->

---

### Q55
A technician sets up a SOHO network with addresses of 192.168.1.10/255.255.255.0, gateway 192.168.1.1, and DNS 192.168.1.1. The PC can ping the router but nothing on the internet by name or address. Which field is the best lead?
- A) Subnet mask - it should be 255.0.0.0
- B) DNS - change it to 8.8.8.8
- C) The address should be 172.16.0.1
- D) Gateway - verify the router itself has working internet service

**Answer: D**
The PC reaches its gateway, so local addressing (IP, mask) is correct; name and address failures beyond the gateway point past it. Since the router is both gateway and DNS forwarder here, its own upstream connection is the common point of failure. The mask given is correct for this network, and changing DNS would not fix pings by address.
<!-- {"id":"COMPTIA-A-1201-Q055","objective":"2.6","type":"diagnosis","source":"OBJ1201","locator":"Objective 2.6 IP addressing, gateway, SOHO configuration","verified":"2026-10-10"} -->

---

### Q56
Which address range may a technician safely assign inside a private office network, knowing it will never be routed on the public internet?
- A) 192.168.0.0/16
- B) 8.8.8.0/24
- C) 169.254.0.0/16
- D) 1.1.1.0/24

**Answer: A**
The 192.168.0.0/16 range (along with 10.0.0.0/8 and 172.16.0.0/12) is reserved for private addressing. 8.8.8.8 and 1.1.1.1 are public resolver addresses, and 169.254.0.0/16 is the APIPA link-local range, not a assignable private scheme.
<!-- {"id":"COMPTIA-A-1201-Q056","objective":"2.6","type":"recall","source":"OBJ1201","locator":"Objective 2.6 private vs public addresses","verified":"2026-10-10"} -->

---

### Q57
A rural site cannot get cable, DSL, or fiber, but has a clear view of the southern sky and needs broadband. Which internet connection type fits?
- A) DSL
- B) Fiber
- C) Cable
- D) Satellite

**Answer: D**
Satellite service reaches locations with no wired infrastructure as long as the dish has sky visibility, trading higher latency for coverage. DSL, cable, and fiber all require physical plant to the building, which the site lacks.
<!-- {"id":"COMPTIA-A-1201-Q057","objective":"2.7","type":"recall","source":"OBJ1201","locator":"Objective 2.7 internet connection types satellite","verified":"2026-10-10"} -->

---

### Q58
A campus with buildings two blocks apart wants one connected network at high speed between the buildings. Which network type describes linking those buildings, and what medium usually backs it?
- A) PAN, typically Bluetooth
- B) SAN, typically coaxial storage links
- C) WLAN, typically 2.4GHz access points
- D) MAN, typically fiber between sites

**Answer: D**
Connecting nearby buildings across a small city area is a metropolitan area network, most often built on fiber runs. A PAN covers one person's devices, a SAN connects storage, and a WLAN is local wireless coverage.
<!-- {"id":"COMPTIA-A-1201-Q058","objective":"2.7","type":"recall","source":"OBJ1201","locator":"Objective 2.7 network types LAN/WAN/PAN/MAN/SAN/WLAN","verified":"2026-10-10"} -->

---

### Q59
A desktop shows no link light after a furniture move. The cable looks fine at both ends. Which tool confirms whether the cable run itself is intact before the technician crawls under the desk again?
- A) Toner probe
- B) Cable tester
- C) Crimper
- D) Punchdown tool

**Answer: B**
A cable tester verifies continuity and correct pairing end to end, telling you whether the run is good before touching anything else. A crimper makes ends, a punchdown tool terminates jacks, and a toner probe traces a cable's path rather than certifying its integrity.
<!-- {"id":"COMPTIA-A-1201-Q059","objective":"2.8","type":"diagnosis","source":"OBJ1201","locator":"Objective 2.8 networking tools cable tester","verified":"2026-10-10"} -->

---

### Q60
A technician must find which of thirty identical gray cables in a ceiling bundle runs to a particular wall jack. Which tool pair makes that trace quick?
- A) Network tap and patch panel
- B) Toner probe and tone generator
- C) Wi-Fi analyzer and loopback plug
- D) Crimper and cable stripper

**Answer: B**
A tone generator puts a signal on the target cable at the jack, and the inductive probe sings when it is held near the matching cable in the bundle. Wi-Fi analyzers survey wireless, crimpers and strippers terminate cable, and taps copy traffic.
<!-- {"id":"COMPTIA-A-1201-Q060","objective":"2.8","type":"recall","source":"OBJ1201","locator":"Objective 2.8 networking tools toner probe","verified":"2026-10-10"} -->

---
