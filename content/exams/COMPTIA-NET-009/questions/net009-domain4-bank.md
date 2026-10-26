# CompTIA Network+ N10-009 — Domain 4 beginner bank (network security)

## Domain 4: Network Security (N10-009)

---

### Q62
A hospital requires that patient records stay unreadable to staff who have no need for them. Which security goal does that requirement express?
- A) Availability
- B) Non-repudiation
- C) Integrity
- D) Confidentiality

**Answer: D**
Confidentiality is the goal that only authorized parties can read the data, which is what the requirement states. Availability (A) is about access when needed. Non-repudiation (B) is about proving an action happened. Integrity (C) is about data being unaltered.

---

### Q63
Thousands of compromised hosts across many networks send requests to one web service until it stops responding. Which attack is this?
- A) ARP poisoning
- B) A distributed denial of service
- C) VLAN hopping
- D) An evil twin access point

**Answer: B**
Traffic from many compromised hosts in many places is what makes the attack distributed, and overwhelming the service so it stops serving is the denial of service. ARP poisoning (A) corrupts address mappings on a local segment. VLAN hopping (C) crosses VLAN boundaries. An evil twin (D) impersonates a wireless network.

---

### Q64
An attacker places a device between a user and a website, relays the traffic and alters pages in transit. Which attack is this?
- A) An on-path attack
- B) A brute-force login attack
- C) A MAC flooding attack
- D) A smurf attack

**Answer: A**
Sitting in the traffic path to read and change it is the definition of an on-path attack. Brute force (B) guesses credentials. MAC flooding (C) overflows a switch's forwarding table. A smurf attack (D) reflects traffic through broadcast addresses.

---

### Q65
A public web server must be reachable from the internet but must not reach the internal database network. Where should it be placed?
- A) On the internal server VLAN
- B) On the management VLAN
- C) In a screened subnet
- D) On a separate network with no firewall rule

**Answer: C**
A screened subnet, often called a DMZ, is reachable from outside and isolated from the internal network by rules, which is exactly the requirement. The internal server VLAN (A) exposes the inside to a public host. The management VLAN (B) holds administration interfaces. A separate network with no rule (D) removes the control rather than applying one.
