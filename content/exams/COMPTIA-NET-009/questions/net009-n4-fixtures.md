# CompTIA Network+ N10-009 — Module N4 fixtures (October 23 cut, N4 scope)

## Domain 4: Network Security (N10-009)

---

### Q21
A hospital places medical devices, staff workstations, and guest Wi-Fi on separate network segments with controlled paths between them. What security purpose does this segmentation primarily serve?
- A) It encrypts all traffic between the segments
- B) It limits lateral movement so a compromise in one segment cannot freely reach the others
- C) It increases raw bandwidth on every segment
- D) It replaces the need for user authentication

**Answer: B**
Segmentation is damage control: if a guest device or a flat IoT gadget is compromised, a segmented design means the attacker does not automatically land on clinical workstations. Inter-segment traffic can be inspected and limited. Encryption is a separate control (A), segmentation is not a bandwidth tool (C), and identity checks still matter inside every segment (D).

---

### Q22
After a workstation on the user VLAN is infected with malware, the security team finds the malware only reached other user workstations and never touched the server VLAN. Which design choice produced that outcome?
- A) A longer subnet mask on the server VLAN
- B) Segmentation with an explicit deny-by-default path from user VLANs to the server VLAN
- C) A larger DHCP scope on the user VLAN
- D) Disabling ICMP on the server VLAN

**Answer: B**
The observed containment is the expected result of segmentation plus a restrictive path between zones — the malware's lateral movement stopped at the boundary. Mask length (A) and DHCP scope size (C) do not enforce trust boundaries, and blocking ICMP (D) only silences one diagnostic protocol; it does not stop server-directed traffic the malware could still attempt.

---

### Q23
Which of the following is a multi-factor authentication pairing?
- A) A password and a PIN, both of which the user knows
- B) A password and a fingerprint, which are two different factor categories
- C) Two different passwords from the same password manager
- D) A security question and a password, both from memory

**Answer: B**
Multi-factor authentication requires factors from different categories: something you know, something you have, something you are. A password plus a fingerprint uses knowledge plus biometrics. Password + PIN (A), two passwords (C), and a security question plus a password (D) are all single-factor (knowledge) combinations, however long they feel.

---

### Q24
Users report that a familiar-looking login page is asking for their corporate credentials after they clicked a link in an email. Which threat is this?
- A) DDoS
- B) Phishing (credential harvesting via a deceptive page)
- C) VLAN hopping
- D) A routing loop

**Answer: B**
An email-borne lure to a fake login page is phishing — a social-engineering attack that steals credentials or drops malware. DDoS floods availability (A), VLAN hopping is a Layer 2 segmentation attack (C), and a routing loop causes repeated forwarding and congestion rather than a credential prompt (D).

---

### Q25
A new firewall policy is being reviewed. Which change is the better hardening judgment?
- A) Leave every unused port open so future applications do not need a change request
- B) Disable unused services and ports, and allow only what the business path requires
- C) Turn off logging to reduce noise and save disk
- D) Share one administrator account among the on-call team so nobody gets locked out

**Answer: B**
Hardening is removing what you do not need: unused services and open ports are standing attack surface. Allow-what-you-need with documented changes is the default-deny habit. Leaving everything open (A) maximizes exposure, turning off logging (C) removes detection and evidence, and a shared admin account (D) destroys attribution and breaks accountability during an incident.
