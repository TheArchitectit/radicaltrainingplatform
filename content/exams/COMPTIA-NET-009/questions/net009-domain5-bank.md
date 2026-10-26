# CompTIA Network+ N10-009 — Domain 5 beginner bank (troubleshooting)

## Domain 5: Network Troubleshooting (N10-009)

---

### Q66
A technician replaced a failed switch and confirmed that traffic now flows normally. Which step of the troubleshooting methodology comes next?
- A) Establish a theory of probable cause
- B) Document the findings, actions and outcomes
- C) Identify the problem
- D) Test the theory to determine the cause

**Answer: B**
Once the fix is verified, the methodology closes the case by recording what was found and done, so the next person inherits the history. Establishing a theory (A), identifying the problem (C) and testing a theory (D) all happen before the repair.

---

### Q67
A copper run still passes traffic, but its CRC error counter climbs steadily. What is a likely cause?
- A) Interference or a damaged cable
- B) A wrong default gateway
- C) An expired DNS record
- D) A duplicated IP address

**Answer: A**
CRC errors mean frames are arriving corrupted, which points at the medium: interference, a crushed or kinked cable, or a bad connector. A gateway error (B) misdirects traffic but does not corrupt it. DNS (C) affects name resolution. A duplicate address (D) causes conflicts and intermittent loss of connectivity, not frame corruption.

---

### Q68
A link delivers very low throughput and shows late collisions, and one end is hard-set to full duplex while the other auto-negotiates. What is the fault?
- A) An MTU mismatch
- B) A spanning-tree loop
- C) A duplex mismatch
- D) An expired DHCP lease

**Answer: C**
One side sending full duplex while the other expects half duplex produces collisions and retransmissions that crush throughput, which is the classic signature. MTU mismatch (A) breaks large packets. A loop (B) floods broadcasts and saturates the segment. An expired lease (D) is an addressing problem.

---

### Q69
A new workstation run measures 120 meters and trains at a lower speed than expected. What is the cause?
- A) The switch port is administratively disabled
- B) The network adapter driver is outdated
- C) The VLAN is not configured on the port
- D) The run exceeds the distance limit for the cable

**Answer: D**
Twisted-pair Ethernet is rated to about 100 meters, and beyond that the signal degrades, which shows up as a lower negotiated rate or link instability. A disabled port (A) gives no link at all. A driver (B) and a missing VLAN (C) do not depend on cable length.

---

### Q70
Users can reach websites by IP address but cannot reach them by name. Which service should be checked first?
- A) DHCP
- B) DNS
- C) NTP
- D) SNMP

**Answer: B**
Working by address but failing by name isolates the fault to name resolution. DHCP (A) supplies addresses, and those are working. NTP (C) provides time. SNMP (D) is for monitoring.

---

### Q71
New laptops on the office network receive addresses beginning with 169.254. What is the most likely cause?
- A) The DHCP service is unreachable or out of addresses
- B) The DNS server is offline
- C) The default gateway is misconfigured
- D) The NTP server is unreachable

**Answer: A**
That range is the link-local address a host assigns itself when no DHCP offer arrives, so the server, the relay or the pool is the problem. DNS (B) does not assign addresses. A gateway error (C) would leave clients addressed but unable to route. NTP (D) is time.

---

### Q72
Users are refused by a service with certificate errors, and the server's clock is two days behind. What should be corrected?
- A) The firewall rule set
- B) The DNS zone
- C) Time synchronization
- D) The MAC address table

**Answer: C**
Certificates are validated against the current time, so a clock that is days off makes valid certificates appear expired or not yet valid. A firewall rule (A) would block the connection rather than produce a certificate error. DNS (B) affects name resolution. The MAC table (D) is a switch forwarding detail.

---

### Q73
Voice calls become robotic and break up only while large file transfers run to the same site. What is the cause?
- A) DNS resolution latency
- B) A duplex mismatch
- C) An expired certificate
- D) Congestion with no priority for voice

**Answer: D**
The transfer is consuming the link, and without a priority mechanism the voice packets queue behind it, which produces exactly this pattern. DNS latency (A) would delay call setup, not the audio. A duplex mismatch (B) degrades every flow. A certificate (C) would block or warn, not distort audio.

---

### Q74
Users report slow responses from an application hosted in another city, and a ping returns 180 ms round trip. Which characteristic is being measured?
- A) Jitter
- B) Latency
- C) Packet loss
- D) Available bandwidth

**Answer: B**
Round-trip time is latency, the delay a message takes to travel and return. Jitter (A) is variation in that delay. Packet loss (C) is the percentage of messages that never arrive. Bandwidth (D) is capacity, not delay.

---

### Q75
A technician must see every router along the path to a remote host, with the delay at each hop. Which tool fits?
- A) Traceroute
- B) A name lookup
- C) A cable tester
- D) A local connection listing

**Answer: A**
Traceroute increases the hop limit step by step and reports each responding router with its round-trip time, which is exactly the requirement. A name lookup (B) resolves names. A cable tester (C) checks a physical run. A local connection listing (D) shows sockets on one host.
