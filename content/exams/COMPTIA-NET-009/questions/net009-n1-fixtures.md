# CompTIA Network+ N10-009 — Module N1 fixtures (October 23 cut, N1 scope)

## Domain 1: Networking Concepts (N10-009)

---

### Q6
A workstation is addressed 10.1.20.55/24 with default gateway 10.1.20.1 and DNS server 10.1.20.10. It can ping 10.1.20.1 and 10.1.20.10, but every destination outside 10.1.20.0/24 times out. Which role in the host's IPv4 configuration is the first place to look, and why?
- A) The DNS server role, because external names cannot resolve without a working resolver
- B) The default gateway role, because packets to non-local destinations have no working exit from the segment
- C) The subnet mask role, because the host would ARP for remote hosts instead of sending them to the gateway
- D) The DHCP lease, because the host would not have any address at all if the lease were the problem

**Answer: B**
Local reachability to the gateway's own interface proves addressing and the mask are consistent on the segment. Remote destinations never use the DNS server as a path — they need a router. When only non-local traffic fails, the default gateway is the first role to suspect: a wrong gateway address, a gateway that is up but not routing, or an upstream failure past it. DNS would affect name resolution (and this host fails by IP too), a wrong mask more often produces ARP attempts for remote destinations or local-traffic loss, and a missing DHCP lease produces an APIPA address or nothing at all. *(Cross-track concept: this is the A+ A2 four-settings idea at Network+ path depth — see the cross-exam reuse note in this item's provenance.)*

---

### Q7
A laptop on a corporate VLAN keeps dropping off the network for about thirty seconds every few hours, then recovers on its own. At Network+ lease-lifecycle depth, which stage is the most useful place to start, and what would you look for?
- A) The DORA handshake at first join, because the laptop would never get an address if it failed
- B) The renewal path (T1 renew, T2 rebind, and expiry) — look for renewals that fail and fall through to expiry
- C) The DNS resolution path, because name lookups reset after each drop
- D) The subnet mask, because the laptop cannot tell local from remote during the gap

**Answer: B**
A brief recurring outage with automatic recovery is the signature of a lease that is not renewing cleanly: the client reaches T1, the renew does not complete, it reaches T2 and rebroadcasts, then the lease expires and the interface resets before a new DORA completes. First join (A) is a one-time event and would not explain periodic drops; DNS follows addressing rather than causing address loss; the mask does not change over time. *(Cross-track concept: A+ A2 teaches what a lease hands out; this item assesses the lifecycle that keeps it — deliberately different depth, separate evidence.)*

---

### Q8
Which protocol and transport port pair is correct?
- A) SSH on TCP 22
- B) DNS on TCP 80
- C) HTTPS on TCP 21
- D) DHCP on TCP 443

**Answer: A**
SSH — remote terminal and secure file copy — uses TCP port 22. DNS primarily uses UDP/TCP 53 (not 80), HTTPS uses TCP 443 (21 is FTP control), and DHCP uses UDP 67/68 (443 is HTTPS). Protocol-port pairs are agreed conventions: the number only works because clients and servers both use the same one.

---

### Q9
A technician is reading a layered network diagram and needs to know where IP addressing and routing decisions live. Which OSI layer is that?
- A) Layer 1 — Physical
- B) Layer 2 — Data Link
- C) Layer 3 — Network
- D) Layer 4 — Transport

**Answer: C**
IP addressing, subnetting, and routing belong to Layer 3, the Network layer. Layer 1 is cabling and signals, Layer 2 moves frames on a local link (MAC addresses, switching), and Layer 4 handles end-to-end segments and ports (TCP/UDP). A mailing analogy fits here: Layer 3 is the address on the envelope that decides which town the letter goes to; Layer 2 is the local mail carrier who walks it to the right street.

---

### Q10
An organization has 250 workstations in one flat 10.0.0.0/24 and is seeing heavy broadcast noise and a growing number of address conflicts after a bring-your-own-device push. What problem is subnetting (or VLAN segmentation paired with it) actually solving here?
- A) Subnetting makes each host's IP address longer and therefore harder to conflict
- B) Subnetting splits one large broadcast domain into smaller ones, limiting who hears every broadcast
- C) Subnetting replaces the need for a default gateway on each host
- D) Subnetting encrypts traffic between workstations so conflicts cannot occur

**Answer: B**
The purpose of subnetting is to break one large broadcast domain into smaller, more manageable segments — fewer hosts hear every ARP and broadcast, which cuts noise and limits the blast radius of a misbehaving device. It does not lengthen addresses (A), it does not remove the need for a gateway to leave the segment (C), and it is a topology and addressing tool, not encryption (D). Paired with VLANs, it is the standard first answer to "the flat network got too loud."
