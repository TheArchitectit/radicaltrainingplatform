# CompTIA A+ Core 1 — Domain 3 beginner bank (hardware)

## Domain 3: Hardware (220-1201)

---

### Q42
A designer needs a display whose pixels switch off completely so black areas are truly black, with no backlight glow behind them. Which display type provides this?
- A) A display that emits light per pixel, such as OLED
- B) A twisted-nematic liquid crystal panel
- C) A panel lit by an edge-mounted white backlight
- D) A projector using a color wheel

**Answer: A**
An emissive panel turns each pixel off rather than blocking a backlight, so dark areas carry no glow. A twisted-nematic panel (B) and an edge-lit panel (C) both use a backlight that stays on behind dark pixels. A color-wheel projector (D) is a projection technology and suffers the same washing-out in dark scenes.

---

### Q43
A user sets a laptop's resolution above the panel's native value to fit more on screen. What happens to the image?
- A) More detail is rendered at the higher setting
- B) The image is scaled, so text and edges look softer
- C) The refresh rate rises to match
- D) The panel brightness increases

**Answer: B**
A panel has a fixed number of physical pixels, so anything above it is scaled up and interpolated, which softens fine detail. Rendering more detail (A) is what a higher-resolution panel does, not a higher setting. Refresh rate (C) and brightness (D) are separate attributes that the resolution setting does not change.

---

### Q44
A laptop's screen specification lists a brightness of 400. Which unit is being quoted?
- A) Hertz
- B) Pixels per inch
- C) Nits
- D) Lumens

**Answer: C**
Display brightness is quoted in nits, which describe luminous intensity per unit area at the screen surface. Hertz (A) measures refresh rate. Pixels per inch (B) measures pixel density. Lumens (D) measure total light output, which suits a projector's rating rather than a panel's.

---

### Q45
A technician must terminate a run of coaxial cable used for a small office's cable service. Which connector fits?
- A) RJ45
- B) LC
- C) USB-C
- D) F-type

**Answer: D**
The F-type connector is the threaded connector used on coaxial cable for cable television and cable modem service. RJ45 (A) is for twisted-pair data cabling. An LC connector (B) is a fiber-optic connector. USB-C (C) is a general-purpose peripheral connector.

---

### Q46
A technician installs a 2.5-inch SATA solid-state drive. Which cable carries data between the drive and the motherboard?
- A) A seven-pin SATA data cable
- B) A fifteen-pin SATA power connector
- C) A twenty-four-pin ATX connector
- D) A four-pin Molex connector

**Answer: A**
The narrow seven-pin SATA cable carries data to the host controller, while power arrives on its own connector. The fifteen-pin connector (B) and the Molex connector (D) supply power, not data. The 24-pin ATX connector (C) powers the main board.

---

### Q47
Cable must run through the return-air space above a suspended ceiling. Which cable rating is designed for that space?
- A) Riser
- B) Plenum
- C) Standard PVC jacket
- D) Shielded twisted pair

**Answer: B**
Plenum-rated cable uses a jacket that produces limited smoke and does not spread fire in an air-handling space, which is exactly where it is required. Riser rating (A) suits vertical shafts, not air returns. A standard jacket (C) is not permitted there. Shielding (D) addresses interference, not fire safety.

---

### Q48
A notebook needs a memory upgrade. Which module form factor fits?
- A) A full-height DIMM
- B) A registered DIMM
- C) A small-outline DIMM
- D) A graphics card

**Answer: C**
Notebooks use the small-outline DIMM, which is shorter than a desktop module and slides into a socket lying flat. A full-height DIMM (A) is desktop-sized. A registered DIMM (B) is for servers with a memory controller that expects registers. A graphics card (D) is an add-on card, not memory.

---

### Q49
A server's log reports corrected single-bit memory errors. Which memory feature produces that report?
- A) Buffered output
- B) Low voltage operation
- C) Higher clock speed
- D) Error-correcting code

**Answer: D**
Error-correcting code adds check bits so the controller can detect and repair single-bit errors and log the correction, which is why it is standard on servers. Buffering (A) improves signal integrity at capacity. Low voltage (B) reduces power. Clock speed (C) affects throughput, not error handling.

---

### Q50
A technician tries to seat a DDR4 module in a DDR5 slot. What is the result?
- A) It does not seat: the notch and pin layout differ
- B) The module seats and runs at the lower speed
- C) The module seats and runs at full speed
- D) The module seats only with an adapter

**Answer: A**
Each memory generation has its own keying and pin count, so a module from the wrong generation physically will not fit, which protects the board from an incompatible voltage and signalling scheme. Seating at a reduced speed (B, C) and seating with an adapter (D) all assume a fit that the keying prevents.

---

### Q51
Which drive type attaches directly to the PCIe bus and avoids the older storage controller?
- A) A 2.5-inch SATA solid-state drive
- B) An NVMe drive in an M.2 slot
- C) A 7200 rpm hard disk
- D) A USB flash drive

**Answer: B**
An NVMe drive carries its commands over PCIe lanes, which removes the controller bottleneck and allows far higher queue depth. A SATA solid-state drive (A) still runs through the SATA controller. A hard disk (C) adds mechanical latency. A USB flash drive (D) runs through the USB bus and is the slowest of the four.

---

### Q52
Two 2 TB drives are configured as RAID 1. What capacity and protection does the array provide?
- A) 4 TB usable with no redundancy
- B) 4 TB usable with one drive of redundancy
- C) 2 TB usable and survives one drive failure
- D) 2 TB usable and survives two drive failures

**Answer: C**
A mirror writes identical data to both drives, so usable capacity equals one drive and one failure can be sustained. Adding the capacities (A, B) describes striping without or with parity. Surviving two failures (D) would need a mirror of three or more copies.

---

### Q53
Which characteristic is a reason to choose a hard disk over a solid-state drive for a large archive?
- A) No moving parts
- B) Silent operation
- C) Faster random access
- D) Lower cost per terabyte

**Answer: D**
Magnetic disks remain cheaper per terabyte in high capacities, which matters when the archive needs bulk space and speed is secondary. No moving parts (A), silence (B) and fast random access (C) are all solid-state advantages, so they argue against the hard disk rather than for it.

---

### Q54
Which step belongs in a correct processor and cooler installation?
- A) Apply a thin, even layer of thermal paste
- B) Fill the socket with paste before seating the processor
- C) Seat the cooler dry, then leave it without paste
- D) Apply paste to the socket pins

**Answer: A**
A thin layer of paste fills microscopic gaps between the two metal surfaces so heat crosses efficiently. Paste in the socket (B) and on the pins (D) contaminates the contacts and can prevent the system from starting. Leaving the joint dry (C) traps air, which is a poor conductor and leads to overheating.

---

### Q55
A workstation must run a discrete graphics card. Which slot is designed for it?
- A) An M.2 socket
- B) A PCIe x16 slot
- C) A SATA port
- D) A memory slot

**Answer: B**
The PCIe x16 slot provides the width and power delivery a graphics card needs. An M.2 socket (A) is for storage, a SATA port (C) is for drives, and a memory slot (D) holds RAM, so none of them accepts an add-in card.

---

### Q56
A PCIe storage controller is installed and the drives attached to it are invisible to the operating system. What should be done?
- A) Reinstall the operating system
- B) Replace the motherboard
- C) Install the controller's driver
- D) Clear the CMOS

**Answer: C**
The operating system needs the controller's driver to see the hardware, and a card that is seated but unsupported appears exactly as described. Reinstalling the system (A) destroys data without addressing the missing driver. Replacing the board (B) is unnecessary. Clearing the CMOS (D) resets firmware settings but does not add driver support.

---

### Q57
A system needs about 250 W, and a 1000 W supply is installed. What is the outcome?
- A) Components receive 1000 W and fail
- B) The system refuses to start
- C) The supply runs continuously at full load
- D) The system draws only what it needs

**Answer: D**
A supply's rating is the maximum it can deliver, and the components draw their own demand, so a larger unit simply has headroom. Delivering the full rating (A) and running at full load (C) both treat the rating as a fixed output. A refusal to start (B) is not how a supply behaves.

---

### Q58
Which connector supplies a desktop main board's primary power?
- A) The 24-pin ATX connector
- B) A 15-pin SATA power connector
- C) A 6-pin PCIe connector
- D) A 4-pin Molex connector

**Answer: A**
The 24-pin ATX connector carries the main rails to the board. The SATA power connector (B) feeds drives, the 6-pin PCIe connector (C) feeds a graphics card, and the Molex connector (D) feeds older peripherals.

---

### Q59
Why choose a modular power supply for a custom build?
- A) It delivers more wattage from the wall
- B) Unused cables can be left off, which improves airflow
- C) It removes the need for a 24-pin connector
- D) It allows the supply to run without a fan

**Answer: B**
Cables attach only as needed, so the case is not filled with unused bundles that block airflow and trap heat. Wattage (A) is set by the model's rating, not by modularity. The 24-pin connector (C) is still required. Fanless operation (D) is a separate design choice.

---

### Q60
A network printer must be reachable by name from client computers day after day. Which configuration supports that?
- A) The printer's display brightness
- B) The printer's default duplex setting
- C) A fixed address or a DHCP reservation
- D) A larger paper tray

**Answer: C**
A stable address keeps the name-to-address mapping valid, so clients keep finding the device after restarts and lease renewals. Display brightness (A), duplex defaults (B) and tray size (D) are settings for output, not for reachability.

---

### Q61
Scanning to a folder works, but scan-to-email fails on the same multifunction device. Which setting should be checked?
- A) The scanner glass
- B) The paper type
- C) The duplex unit
- D) SMTP server settings

**Answer: D**
Scan-to-email hands the message to a mail server, so the SMTP host, port and credentials must be valid, and a failure confined to that function points there. The glass (A) would affect every scan. Paper type (B) and the duplex unit (C) affect printing, not the mail handoff.

---

### Q62
Confidential pages must not sit in the output tray for anyone to pick up. Which feature delivers this?
- A) Secure print with a release code
- B) Duplex printing
- C) Collation of multiple copies
- D) A larger input tray

**Answer: A**
Secure printing holds the job until the sender enters a code at the device, so the pages are only printed when someone is standing there. Duplex (B), collation (C) and tray capacity (D) change how pages are produced, not who may collect them.

---

### Q63
A laser printer has reached its maintenance interval. What does the maintenance kit typically contain?
- A) A toner cartridge and nothing else
- B) The fuser and paper-feed rollers
- C) The print head
- D) The duplex unit

**Answer: B**
Maintenance kits carry the wear items that the page count consumes, chiefly the fuser and the pickup and separation rollers. Toner (A) is a consumable replaced on its own schedule. Lasers have no print head (C) in the sense an inkjet does. The duplex unit (D) is a module, not a scheduled wear part.

---

### Q64
A dot-matrix printer produces faint, uneven characters across the page. What should be replaced?
- A) The fuser
- B) The printhead cleaner
- C) The ribbon cartridge
- D) The transfer belt

**Answer: C**
An impact printer forms characters by striking a ribbon against the paper, so a dried or worn ribbon gives faint and patchy output. A fuser (A) and a transfer belt (D) belong to laser printers. A cleaner (B) addresses a printhead condition on inkjets.

---

### Q65
An inkjet printer that sat unused for weeks prints with gaps and banding. Which action comes first?
- A) Replace the fuser
- B) Reseat the memory
- C) Replace the pickup rollers
- D) Run the built-in printhead cleaning routine

**Answer: D**
Dried ink in the nozzles is the usual cause of gaps after idle time, and the cleaning routine clears the nozzles before any other step. A fuser (A) is laser-printer hardware. Memory (B) and pickup rollers (C) affect data handling and paper feed, not missing ink.
