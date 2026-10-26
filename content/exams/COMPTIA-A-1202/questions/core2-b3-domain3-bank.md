# CompTIA A+ Core 2 — Domain 3 beginner bank (software troubleshooting)

## Domain 3: Software Troubleshooting (220-1202)

---

### Q72
A workstation starts blue-screening immediately after a new graphics driver was installed. Which action is most likely to restore the machine?
- A) Reinstall every application on the machine
- B) Replace the power supply
- C) Reformat the system drive
- D) Boot into safe mode and roll back the driver

**Answer: D**
The fault began with the driver, so booting with a minimal driver set and reverting that change addresses the cause with the least disruption. Reinstalling applications (A) touches nothing related to the driver. A power supply (B) is a hardware theory that arrived with no evidence. Reformatting (C) discards the user's data to fix a single component.

---

### Q73
A Windows machine fails to start, and the technician has booted into the recovery environment. Which tool should be tried first for a startup failure with no other symptoms?
- A) Disk Cleanup
- B) Startup Repair
- C) System Restore
- D) A factory reset

**Answer: B**
Startup Repair is designed for exactly this condition and attempts to fix boot configuration and startup files automatically before any destructive step. Disk Cleanup (A) removes files and does not repair booting. System Restore (C) is a reasonable second step when a change is suspected, but it is broader than the first check. A factory reset (D) is the last resort, after repair options fail.

---

### Q74
A user signs in and finds an empty desktop with none of their documents, and Windows reports a temporary profile. Where is the user's data most likely to be?
- A) Deleted permanently by the logon
- B) Moved to the recycle bin
- C) Still in the original profile folder on the disk
- D) On the domain controller only

**Answer: C**
A temporary profile is created when the real profile cannot be loaded, and the original profile folder and its files are normally still on the disk. The logon does not delete data (A). Nothing is sent to the recycle bin by this event (B). A domain controller holds directory objects, not the user's local documents (D).

---

### Q75
A mobile application closes immediately after launch following an operating system update. Which action should be tried first?
- A) Update or reinstall the application from its store
- B) Replace the phone's battery
- C) Reset the device to factory settings
- D) Change the phone's wallpaper

**Answer: A**
An application that worked before an OS update and fails now is most likely incompatible with the new version, so the first step is the vendor's updated build or a clean reinstall of the app. A battery (B) does not explain a launch crash. A factory reset (C) discards data and is far beyond the first step. Wallpaper (D) has no effect.

---

### Q76
A user cannot install an application from the store, and the device reports that there is not enough space. Which action is appropriate?
- A) Restart the device and try again
- B) Disable the device's security software
- C) Free storage by removing unnecessary files and applications
- D) Install the application while the device is charging

**Answer: C**
The store's own message names the condition: installations need free space for the package and its data. A restart (A) does not create space. Disabling security software (B) is a dangerous non-answer. Charging (D) has no bearing on storage.

---

### Q77
A phone application stops responding and the screen will not update, though the phone itself is working. Which action should come first?
- A) Factory reset the phone
- B) Remove the phone's case
- C) Reinstall the operating system
- D) Force stop the application and reopen it

**Answer: D**
Force stopping ends the hung process and reopening starts it clean, which resolves the common case without touching data. A factory reset (A) is disproportionate as a first step. A case (B) relates to heat, not an unresponsive application. Reinstalling the OS (C) is the last resort.

---

### Q78
A phone's battery drains from full to empty in a few hours, and the device is warm even when sitting idle. What is the most likely cause?
- A) The screen brightness is set too low
- B) A runaway application is using the processor in the background
- C) The device is connected to a wireless network
- D) The phone's storage is nearly empty

**Answer: B**
Heat plus drain while idle points to something consuming the processor continuously, which is the signature of a runaway or misbehaving application. Low brightness (A) reduces consumption. Being on Wi-Fi (C) is normal and does not produce idle heat. Empty storage (D) does not cause drain.

---

### Q79
A phone repeatedly fails to install an operating system update. Which combination should be checked first?
- A) Free storage and a stable network connection
- B) The device's wallpaper and ringtone settings
- C) The number of contacts stored on the device
- D) The phone's screen brightness setting

**Answer: A**
Updates need space to stage the package and a connection to download it, and both are the usual causes of a repeating failure. Wallpaper and ringtone (B), contact count (C) and brightness (D) are unrelated to update installation.

---

### Q80
A managed phone is locked out after repeated failed passcode attempts, and company data is on it. What should the technician do?
- A) Keep guessing likely passcodes
- B) Remove the phone's SIM card and try again
- C) Use the management system or vendor recovery path to regain access
- D) Wait for the device to unlock itself after a week

**Answer: C**
A managed device can be recovered through its management service, and the vendor provides a documented recovery path; that is the supported route and it preserves the ability to wipe if the device is lost. Guessing (A) risks erasing the device under a wipe-after-failures policy. Removing the SIM (B) does not clear a device lock. Waiting indefinitely (D) is not a plan and may not unlock at all.

---

### Q81
A user's browser opens with an unfamiliar toolbar, and searches are redirected to an advertising site. What is the most likely explanation?
- A) The keyboard layout was changed
- B) The monitor's color profile is wrong
- C) The DNS server is offline
- D) The browser was hijacked by an extension or add-on

**Answer: D**
A new toolbar plus redirects is the classic browser hijack: an extension or bundled program changed the home page, search provider and settings. Keyboard layout (A) affects typing. A color profile (B) affects appearance. An offline DNS server (C) would break resolution for everything rather than redirect searches to one site.

---

### Q82
A pop-up window claims the computer is infected and tells the user to call a support number. Which response is correct?
- A) Close it, do not call, and scan with the installed security software
- B) Call the number and follow the instructions
- C) Enter payment details to unlock the cleaning tool
- D) Disable the browser's pop-up blocker permanently

**Answer: A**
The message is itself the attack: it uses fear and a phone number to get the user to hand over access or payment. Calling (B) contacts the attacker, and paying (C) completes the fraud. Disabling the pop-up blocker (D) removes a protection and adds exposure.

---

### Q83
A user's account is locked, but the user insists they never mistyped their password. What is the most appropriate interpretation?
- A) The account lockout policy is broken and should be disabled
- B) Credentials are being tried against the account, so treat it as an attack
- C) The keyboard must be faulty
- D) The user is mistaken and the lockout can be ignored

**Answer: B**
A lockout with no failed attempts by the user means another source is trying credentials, which is the signature of password guessing; the account should be unlocked through the proper process and the attempts investigated. Disabling lockout (A) removes the control that limited the attack. A keyboard (C) does not explain repeated attempts. Dismissing it (D) leaves the attempts running.
