# CompTIA A+ Core 1 — Domain 2 beginner bank (networking)

## Domain 2: Networking (220-1201)

---

### Q26
A video call breaks up slightly but stays usable, while a file transfer over the same link either completes or fails cleanly. Which protocol behavior explains the difference?
- A) The call uses UDP, which favors timely delivery over retransmission
- B) The call uses TCP, which guarantees every packet arrives
- C) The file transfer uses UDP and retries at the application layer
- D) The file transfer uses a protocol with no error detection

**Answer: A**
UDP sends datagrams without retransmission, so a lossy link produces small glitches rather than stalls, which suits real-time media. Claiming the call uses TCP (B) inverts the behavior. A file transfer over UDP (C) is not the usual file-transfer design. A protocol without error detection (D) still would not explain the clean completion pattern.

---

### Q27
A user needs coverage across a large warehouse with many steel racks, and the access points are far apart. Which band choice is the better starting point?
- A) 6 GHz, because it has the widest channels
- B) 5 GHz, because it has the longest range
- C) 2.4 GHz, because it penetrates obstacles better
- D) 60 GHz, because it avoids all interference

**Answer: C**
Lower frequencies attenuate less through walls and metal, so 2.4 GHz reaches farther and bends around obstacles better than the higher bands. 6 GHz (A) offers clean wide channels at the shortest range. 5 GHz (B) is faster than 2.4 GHz but does not have the longest range. 60 GHz (D) has very short range and is blocked easily.

---

### Q28
A classroom has 40 devices connecting to one access point at the same time, and the current standard struggles under the load. Which standard is designed for dense client environments and works on both 2.4 and 5 GHz?
- A) 802.11a
- B) 802.11ax
- C) 802.11ac
- D) 802.11g

**Answer: B**
802.11ax, marketed as Wi-Fi 6, is built for many simultaneous clients and operates on both bands. 802.11a (A) is 5 GHz only and long superseded. 802.11ac (C) is 5 GHz only. 802.11g (D) is 2.4 GHz only and far too old for this density.

---

### Q29
Three access points in one office are all set to channel 6 in the 2.4 GHz band, and clients report intermittent slowness. Which change reduces the interference?
- A) Set all three to channel 1
- B) Set all three to channel 11
- C) Leave them at channel 6 and increase transmit power
- D) Set them to channels 1, 6 and 11 respectively

**Answer: D**
In 2.4 GHz, only channels 1, 6 and 11 do not overlap, so one access point on each gives three non-interfering cells. Moving all three to one channel (A, B) keeps them contending with each other. Raising power on a shared channel (C) makes the contention worse, not better.

---

### Q30
A device forwards traffic between two different networks and chooses a path for each packet. What is it?
- A) A router
- B) A switch
- C) A hub
- D) A patch panel

**Answer: A**
Routers connect networks and make forwarding decisions based on destination addressing. A switch (B) forwards within a network by hardware address. A hub (C) repeats every frame to every port. A patch panel (D) is passive cabling termination.

---

### Q31
Every device on a small network sees every frame, and performance collapses as traffic rises. Which device is in use?
- A) A layer-3 switch
- B) A wireless access point
- C) A hub
- D) A firewall

**Answer: C**
A hub repeats incoming frames out of every other port, so all devices share one collision domain and see each other's traffic. A layer-3 switch (A) forwards selectively and routes between networks. An access point (B) bridges wireless clients onto a segment. A firewall (D) filters traffic between zones.

---

### Q32
A technician must terminate the horizontal cabling from wall jacks in a wiring closet. Which component provides a central termination point for those cables?
- A) A modem
- B) A patch panel
- C) A wireless controller
- D) A media converter

**Answer: B**
A patch panel holds the permanent cabling terminations and provides ports for short patch cords to the switch. A modem (A) converts the provider's signal. A wireless controller (C) manages access points. A media converter (D) changes between media types such as fiber and copper.

---

### Q33
A small office has one public address from its provider, but every workstation has a private address and can reach the internet. Which function makes this work?
- A) DHCP reservation
- B) DNS forwarding
- C) MAC filtering
- D) Network address translation

**Answer: D**
Network address translation rewrites private source addresses to the single public address and tracks the return traffic, which is how many hosts share one address. A DHCP reservation (A) pins a lease to a device. DNS forwarding (B) resolves names. MAC filtering (C) restricts which hardware may join.

---

### Q34
A small business runs an internal camera server and wants it reachable from outside on one port without exposing the rest of the network. Which SOHO router feature does this?
- A) Port forwarding
- B) A guest network
- C) A DHCP exclusion
- D) A content filter

**Answer: A**
Port forwarding maps one external port to one internal address and port, so only that service is reachable. A guest network (B) provides isolated internet access for visitors. A DHCP exclusion (C) keeps addresses out of the lease pool. A content filter (D) blocks categories of destinations.

---

### Q35
Which configuration secures a new SOHO wireless network while still letting the owner's devices connect with a password?
- A) Open authentication with a hidden network name
- B) WEP with a long key
- C) WPA2 or WPA3 with a strong pre-shared key
- D) MAC filtering with no encryption

**Answer: C**
Current encryption with a strong passphrase protects the traffic and requires a credential to join. Open authentication (A) encrypts nothing, and hiding the name is not a control. WEP (B) is broken. MAC filtering alone (D) can be spoofed and leaves traffic readable.

---

### Q36
Two buildings 2 kilometers apart must be connected, and the link runs beside heavy electrical equipment. Which medium fits best?
- A) Cat 6 twisted pair
- B) Fiber
- C) Coaxial cable
- D) Cat 5e with a repeater

**Answer: B**
Fiber carries data for kilometers and is immune to electrical interference, which is exactly the combination described. Twisted pair (A, D) is limited to about 100 meters and picks up interference. Coax (C) is also distance-limited for this purpose and is not immune.

---

### Q37
A rural site uses a satellite link. Users report that pages eventually load but every interaction feels delayed. Which characteristic explains this?
- A) Low bandwidth
- B) Packet loss
- C) Duplicate addressing
- D) High latency

**Answer: D**
The signal travels to orbit and back, so each round trip adds a large fixed delay even when bandwidth is adequate. Low bandwidth (A) would make large transfers slow rather than every interaction feel delayed. Packet loss (B) would show as retries and failures. Duplicate addressing (C) causes conflicts, not uniform delay.

---

### Q38
A user's wireless headset connects to a phone, the office network connects its computers, and the company's branch offices are joined across the country. Which set of network types is described, in that order?
- A) PAN, LAN, WAN
- B) LAN, PAN, MAN
- C) WAN, LAN, PAN
- D) PAN, WAN, LAN

**Answer: A**
A headset pairing is a personal area network, an office network is a local area network, and links between distant sites form a wide area network. The other orderings (B, C, D) assign the office or the branch link to the wrong scope.

---

### Q39
A technician must attach RJ45 plugs to the ends of bulk twisted-pair cable. Which tool is used?
- A) A punchdown tool
- B) A cable tester
- C) A crimper
- D) A toner probe

**Answer: C**
A crimper presses the plug's contacts onto the conductors and secures the connector body. A punchdown tool (A) terminates cable on a patch panel or keystone jack. A cable tester (B) verifies a finished cable. A toner probe (D) locates a cable among many.

---

### Q40
A technician must find which of 30 unlabeled cables in a closet runs to a specific wall jack. Which tool is designed for this?
- A) A multimeter
- B) A toner probe
- C) A loopback plug
- D) A crimper

**Answer: B**
A toner injects a signal on one end and the probe finds the matching cable at the other, which is exactly the tracing task. A multimeter (A) measures electrical values at a point. A loopback plug (C) tests a port by echoing its own signal. A crimper (D) attaches connectors.

---

### Q41
Users in one area complain that wireless is slow at certain times of day, though the signal is strong. Which tool best identifies the cause?
- A) A cable tester
- B) A multimeter
- C) A punchdown tool
- D) A wireless analyzer

**Answer: D**
A wireless analyzer shows channel utilization, interference and nearby networks, which is what a strong-signal-but-slow complaint points at. A cable tester (A) checks copper runs. A multimeter (B) measures electrical values. A punchdown tool (C) terminates cabling.
