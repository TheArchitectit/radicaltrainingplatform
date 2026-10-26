# CompTIA Network+ N10-009 — Domain 2 beginner bank (network implementation)

## Domain 2: Network Implementation (N10-009)

---

### Q45
A small office has one uplink to its provider, and the administrator configures a single route that is used whenever no more specific match exists. What is this route called?
- A) A default route
- B) A host route
- C) A summary route
- D) A floating static route

**Answer: A**
A default route matches everything that no other entry handles, which is why a single-uplink site needs only one. A host route (B) matches a single address. A summary route (C) aggregates a range of networks. A floating static route (D) is a backup that appears only when a preferred route fails.

---

### Q46
Two routers exchange reachability information and recalculate their paths after a link fails, with no administrator action. Which characteristic is this?
- A) Static routing
- B) Policy-based routing
- C) Dynamic routing
- D) Network address translation

**Answer: C**
Dynamic routing protocols learn neighbours and recompute paths when the topology changes, which is why no manual edit is needed. Static routing (A) requires the administrator to change the table. Policy-based routing (B) chooses a path by rule, not by learned topology. NAT (D) rewrites addresses.

---

### Q47
Two switches must carry three VLANs across one inter-switch link, with each frame identified by its VLAN as it crosses. Which configuration provides this?
- A) Spanning Tree Protocol
- B) An 802.1Q trunk
- C) Link aggregation without tagging
- D) Port mirroring

**Answer: B**
802.1Q adds a tag to each frame so the receiving switch knows which VLAN it belongs to, which is what a trunk does. Spanning Tree (A) blocks loops. Untagged aggregation (C) combines links but does not identify VLANs. Port mirroring (D) copies traffic for analysis.

---

### Q48
Wireless users must authenticate individually against a central server rather than with a shared key. Which configuration delivers this?
- A) A longer pre-shared key
- B) A hidden network name
- C) Wi-Fi Protected Setup enabled
- D) WPA2 or WPA3-Enterprise with 802.1X

**Answer: D**
Enterprise mode uses 802.1X so each user is authenticated against a RADIUS server with their own credential. A longer shared key (A) is still one secret for everyone. Hiding the name (B) is not authentication. WPS (C) is a weak pairing convenience.

---

### Q49
An access point is mounted on a ceiling with no electrical outlet nearby, and a single cable must carry both data and power. Which technology provides this?
- A) A media converter
- B) Power over Ethernet
- C) A wireless repeater
- D) A VLAN trunk

**Answer: B**
Power over Ethernet delivers power on the same twisted-pair cable that carries data, which suits exactly this mounting. A media converter (A) changes media types. A repeater (C) extends wireless coverage. A trunk (D) carries multiple VLANs.

---

### Q50
A copper run measures 140 meters, and the link must still work at 1 GbE. What is the correct fix?
- A) Fiber, or an intermediate switch within copper limits
- B) Use a higher cable category at the same length
- C) Raise the MTU on both ends
- D) Force the link to half duplex

**Answer: A**
Twisted-pair Ethernet is limited to about 100 meters, so the run must be split or converted to a medium that covers the distance. A higher category (B) raises bandwidth, not distance. MTU (C) is a packet size setting. Half duplex (D) slows the link and does not extend it.

---

### Q51
In a campus building, the provider's cabling enters at one point and is cross-connected to the internal backbone. What is that space called?
- A) An intermediate distribution frame on an upper floor
- B) A hot aisle
- C) The entrance facility or main distribution frame
- D) A server rack in an office

**Answer: C**
The entrance facility, often holding the main distribution frame, is where external cabling meets the building's own cabling. An intermediate distribution frame (A) serves a floor or area downstream of it. A hot aisle (B) is a cooling arrangement. An office rack (D) is not a demarcation point.
