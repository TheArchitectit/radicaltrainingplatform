# CompTIA A+ Core 1 — Domain 5 beginner bank (troubleshooting)

## Domain 5: Hardware and Network Troubleshooting (220-1201)

---

### Q72
A desktop powers on, the fans spin, but there is no display and the board emits a repeating pattern of beeps. What should the technician check first?
- A) The network cable
- B) That the memory modules are fully seated
- C) The printer driver
- D) The operating system license

**Answer: B**
A repeating beep code at power-on is the board reporting a self-test failure, and an unseated memory module is the most common cause, so reseating comes first. A network cable (A) does not affect the self test. Printer drivers (C) and licensing (D) are operating-system concerns that cannot run before the self test passes.

---

### Q73
A workstation shuts down abruptly after several minutes of heavy work, and it restarts normally afterwards. Which cause is most likely?
- A) A corrupted user profile
- B) An outdated browser
- C) A failed external drive
- D) An inadequate or overheating power supply

**Answer: D**
A shutdown that follows load and then recovers points to power delivery: the supply cannot sustain the draw or its fan has failed, so protection trips. A profile (A) and a browser (B) produce errors, not power loss. A failed external drive (C) would not stop the machine.

---

### Q74
A desktop loses its date and time whenever it is unplugged, and custom firmware settings revert. Which component should be replaced?
- A) The power supply
- B) The processor
- C) The CMOS battery
- D) The memory modules

**Answer: C**
The small battery on the board keeps the real-time clock and the firmware settings alive while the machine has no power, so losing both is its signature. A power supply (A) fails when the machine is running. A processor (B) and memory (D) do not retain those settings.

---

### Q75
A hard disk begins making a rhythmic clicking sound and files open slowly. What should the technician do first?
- A) Copy the data off the drive
- B) Run a defragmentation
- C) Reinstall the operating system
- D) Increase the memory

**Answer: A**
Mechanical clicking signals a failing head or motor, and the drive may stop working entirely soon, so securing the data is the urgent step. Defragmenting (B) works the failing mechanism harder. Reinstalling the system (C) destroys data and does not repair hardware. More memory (D) is unrelated.

---

### Q76
A server's RAID 1 array reports degraded status, and one drive has failed. What is the correct action?
- A) Rebuild the array by wiping both drives
- B) Convert the array to a stripe
- C) Replace the failed drive and let the array rebuild
- D) Ignore it, because RAID 1 already has redundancy

**Answer: C**
A mirror keeps running on the surviving drive, and replacing the failed member lets the controller copy the data back and return the array to a healthy state. Wiping both drives (A) destroys the data that the mirror is protecting. Converting to a stripe (B) removes redundancy. Ignoring the fault (D) leaves the data with no protection at all.

---

### Q77
A drive's self-monitoring reports reallocated sectors rising week over week. What does this indicate?
- A) The drive needs a larger partition
- B) The drive is failing and should be replaced
- C) The drive is running at the wrong speed
- D) The file system needs defragmenting

**Answer: B**
Growing reallocated-sector counts mean the media is developing defects faster than the spare area can absorb them, so planned replacement protects the data. Partition size (A) is unrelated. Interface speed (C) is negotiated separately. Defragmenting (D) rearranges files and does not repair failing media.

---

### Q78
A projector's image is much dimmer than it was, and the unit has logged many hours of use. What should be done?
- A) Reseat the video cable
- B) Change the input source
- C) Adjust the keystone setting
- D) Replace the lamp or light source

**Answer: D**
Projector light sources dim as they age and reach a rated end of life, which matches a gradual loss of brightness on a high-hour unit. A loose cable (A) causes a lost or flickering signal. Input selection (B) and keystone (C) change which image is shown and its shape, not its brightness.

---

### Q79
An external monitor flickers and occasionally drops the signal, and the case has been moved recently. What should be checked first?
- A) The video cable connections at both ends
- B) The monitor's color profile
- C) The refresh rate setting
- D) The graphics driver version

**Answer: A**
A physically disturbed connection is the likeliest cause of intermittent signal loss, so seating or swapping the cable comes before software settings. A color profile (B) affects color rendition, not signal stability. Refresh rate (C) and driver version (D) can cause artifacts but rarely a signal that drops with movement.

---

### Q80
A projector is placed to one side of the screen, and the image comes out wider at the top than the bottom. Which setting corrects it?
- A) Brightness
- B) Color temperature
- C) Keystone correction
- D) Refresh rate

**Answer: C**
Keystone correction compensates for the angle between projector and screen, which is what produces the trapezoid. Brightness (A) and color temperature (B) control image intensity and tint. Refresh rate (D) governs how often the image is redrawn.

---

### Q81
A phone becomes noticeably warm and loses battery charge quickly, even with the screen off. What should the technician check first?
- A) Which applications are consuming the battery
- B) The phone's ringtone volume
- C) The wallpaper setting
- D) The number of stored text messages

**Answer: A**
The battery-usage view names the applications responsible, and a process that keeps running in the background explains both the heat and the drain. Ringtone volume (B) and wallpaper (C) have no meaningful effect. Stored messages (D) do not consume power in a way that causes this.

---

### Q82
A phone browses the web over Wi-Fi but cannot use cellular data, and the carrier reports no outage. What should be checked first?
- A) The Wi-Fi password
- B) The screen timeout
- C) The Bluetooth pairing list
- D) The mobile data and access point settings

**Answer: D**
Data over the cellular network depends on mobile data being enabled and on the access point name settings being correct, and a failure limited to cellular points there. A Wi-Fi password (A) would break the link that is working. Screen timeout (B) and Bluetooth pairings (C) do not affect cellular data.

---

### Q83
A phone's screen shows a faint, permanent copy of the status bar even after the display changes. What is this condition?
- A) A cracked digitizer
- B) Image persistence on the panel
- C) A blocked proximity sensor
- D) A failing charging port

**Answer: B**
Persistent images occur when panel pixels retain a charge pattern from a static element that is displayed constantly, and it is a panel-level fault. A cracked digitizer (A) affects touch input. A proximity sensor (C) blanks the screen during calls. The charging port (D) is a power path.

---

### Q84
A laser printer prints the same faint mark at the same distance on every page. What is the likely cause?
- A) A low toner level overall
- B) An incorrect paper size setting
- C) A damaged drum or roller in the image path
- D) A network connection problem

**Answer: C**
A defect that repeats at a fixed interval comes from a rotating component, because each revolution places the mark at the same position. Low toner (A) produces general fading. Paper size (B) causes jams and wrong output. Network trouble (D) stops the job from arriving at all.

---

### Q85
A laser printer jams repeatedly with the first sheet, always at the paper tray. Which part should be examined?
- A) The pickup rollers
- B) The fuser
- C) The duplex unit
- D) The toner cartridge

**Answer: A**
The pickup rollers lift the sheet from the tray, and when they glaze or wear smooth they fail to feed it. The fuser (B) is later in the path and would jam near the exit. The duplex unit (C) handles the return path. The toner cartridge (D) affects image quality, not feeding.

---

### Q86
Print jobs stay in the queue, and the local printer shows as offline although it is powered on and connected. Which action should be tried first?
- A) Replace the printer's toner
- B) Reinstall the operating system
- C) Change the printer's paper size
- D) Restart the print spooler service

**Answer: D**
A stopped or wedged spooler leaves jobs queued and the device reported offline, and restarting the service is the standard first step. Toner (A) affects output quality. A system reinstall (B) is far beyond the symptom. Paper size (C) is an output setting that does not block the queue.
