# CompTIA Network+ N10-009 — Module N2 fixtures (October 23 cut, N2 scope)

## Domain 2: Network Implementation (N10-009)

---

### Q11
A small office wants guest Wi-Fi users blocked from reaching the file server and printers, while keeping both on the same physical switch. What is the clearest implementation choice?
- A) Put guests and staff in different VLANs and control routing between them
- B) Give every guest a static IP in a different subnet and leave routing open
- C) Turn off DHCP for guests so they cannot get an address
- D) Change the file server's workgroup name so guests cannot see it

**Answer: A**
VLANs separate traffic into distinct broadcast domains on shared hardware. With guests on their own VLAN and an explicit rule between VLANs, the file server is simply not reachable unless a rule allows it. Static IPs without segmentation (B) still share the same broadcast domain and path, disabling DHCP (C) keeps guests off the network entirely rather than limiting them, and a workgroup name (D) is a naming convenience, not a security boundary.

---

### Q12
Two VLANs share one access switch. Hosts in VLAN 10 can reach each other, and hosts in VLAN 20 can reach each other, but a VLAN 10 host cannot reach a VLAN 20 host. What does this result tell you about what a VLAN is doing?
- A) The switch is broken and needs a reboot
- B) The VLAN boundary is acting as a separate Layer 2 segment; inter-VLAN traffic must be routed and explicitly allowed
- C) VLAN tags are encryption, so the two groups cannot communicate
- D) The hosts need a longer subnet mask to talk across VLANs

**Answer: B**
Reaching inside a VLAN and failing across VLANs is exactly how VLAN separation is supposed to behave. Each VLAN is its own broadcast domain; a packet from VLAN 10 to VLAN 20 must be routed (typically by a Layer 3 switch or router) and any firewall or ACL between them must permit it. The switch is not broken (A), VLANs segment rather than encrypt (C), and a mask change on the hosts (D) does not create a path across an unrouted boundary.

---

### Q13
A packet's destination is on a different IP subnet from the sending host, and the host has a default gateway configured. Which device makes the forwarding decision to get that packet off the local segment?
- A) The access switch, because it forwards all frames to every port
- B) The router (default gateway), because the destination is outside the host's local subnet
- C) The DHCP server, because it knows every address
- D) The DNS server, because the destination was named

**Answer: B**
Switching moves frames inside one broadcast domain based on MAC addresses. Routing moves packets between subnets based on IP addresses. When the mask says "this destination is remote," the host sends the frame to the default gateway's MAC — the router — which makes the next forwarding decision. Flood-everything behavior (A) is a failure mode, not a design; DHCP and DNS do not forward data packets.

---

### Q14
Which wireless security mode is the minimum acceptable choice for a small-business WLAN that carries company data?
- A) Open network with a captive portal
- B) WEP
- C) WPA2 (or WPA3) with a strong passphrase or Enterprise authentication
- D) WPS push-button only

**Answer: C**
WPA2 (or WPA3 where available) is the baseline. WEP is broken and must not be used, an open network offers no link encryption even with a portal, and WPS is a setup convenience with known weaknesses — not a security mode to leave enabled as the primary control.

---

### Q15
During a wiring-closet install, a technician is terminating copper cables near fluorescent light fixtures and a power conduit. What is the most important physical-installation judgment here?
- A) Keep data cabling separated from power and lighting runs to avoid EMI and near-end crosstalk
- B) Bundle data and power cables together for a tidier rack
- C) Use the cheapest cable available to finish the closet quickly
- D) Leave the patch panel unlabeled so later technicians can trace by tone

**Answer: A**
Copper data cable is susceptible to electromagnetic interference from power and lighting. Maintain separation (and crossing at right angles when they must cross), follow bend-radius and strain-relief rules, and label every run. Bundling with power (B) invites noise problems, bargain cable (C) risks failing category specs and certification, and unlabeled panels (D) turn every future outage into a tracing exercise.
