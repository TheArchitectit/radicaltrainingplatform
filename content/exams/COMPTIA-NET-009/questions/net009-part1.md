# CompTIA Network+ (N10-009) Practice Questions - Part 1
# Original study items. Independent material, not official or endorsed by CompTIA.

## DOMAIN 1: Networking Concepts (study allocation)

---

### Q1
A web page fails to load, and the technician wants to know whether the failure is at the transport of the bits or in the application layer logic. The cable, link light, and IP addressing are all fine. Which OSI layers remain the most productive places to look?
- A) The power layer
- B) Upper layers (session, presentation, application) where the protocol conversation happens
- C) Layer 1, since the cable is always the problem
- D) Layer 2, since MAC addresses route traffic

**Answer: B**
With physical, data-link, and network layers proven (link, addressing), the fault must live in the upper layers where the HTTP conversation, TLS, and application logic operate. The OSI model's diagnostic value is exactly this elimination.
<!-- {"id":"COMPTIA-NET-009-Q001","objective":"1.1","type":"diagnosis","source":"OBJN9","locator":"Objective 1.1 OSI reference model","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q2
At which OSI layer does a switch primarily make its forwarding decisions?
- A) Layer 2 (data link), using MAC addresses
- B) Layer 3 (network), using IP addresses
- C) Layer 4 (transport), using ports
- D) Layer 7 (application)

**Answer: A**
Switches forward frames based on destination MAC addresses, which is Layer 2 behavior. Routers operate at Layer 3 with IP addresses, and port numbers belong to Layer 4.
<!-- {"id":"COMPTIA-NET-009-Q002","objective":"1.1","type":"recall","source":"OBJN9","locator":"Objective 1.1 OSI Layer 2","verified":"2026-10-10"} -->

---

### Q3
A router connects the office LAN to the internet. At which OSI layer does it work when it chooses the path for a packet?
- A) Layer 1 (physical)
- B) Layer 2 (data link)
- C) Layer 5 (session)
- D) Layer 3 (network)

**Answer: D**
Routing is the Layer 3 function: examining destination IP addresses and selecting the next hop toward the destination network. Layer 2 handles local frame delivery; Layer 1 is the medium itself.
<!-- {"id":"COMPTIA-NET-009-Q003","objective":"1.1","type":"recall","source":"OBJN9","locator":"Objective 1.1 OSI Layer 3","verified":"2026-10-10"} -->

---

### Q4
TCP's reliability features (sequencing, acknowledgments, retransmission) belong to which OSI layer?
- A) Layer 4 (transport)
- B) Layer 3 (network)
- C) Layer 2 (data link)
- D) Layer 6 (presentation)

**Answer: A**
The transport layer owns end-to-end delivery services: segmentation, reliable ordered delivery with TCP, or lightweight datagrams with UDP. The network layer below moves packets without delivery guarantees.
<!-- {"id":"COMPTIA-NET-009-Q004","objective":"1.1","type":"recall","source":"OBJN9","locator":"Objective 1.1 OSI Layer 4","verified":"2026-10-10"} -->

---

### Q5
A packet capture shows encryption and format conversion happening just before data is handed to the application. In the OSI model, which layer is associated with data representation and encryption services?
- A) Layer 4 (transport)
- B) Layer 1 (physical)
- C) Layer 6 (presentation)
- D) Layer 2 (data link)

**Answer: C**
The presentation layer handles how data is represented: character encoding, serialization, compression, and encryption formats. It sits between the session layer and the application that consumes the data.
<!-- {"id":"COMPTIA-NET-009-Q005","objective":"1.1","type":"recall","source":"OBJN9","locator":"Objective 1.1 OSI Layer 6","verified":"2026-10-10"} -->

---

### Q6
A firewall and a router sit side by side at the network edge. What is the functional difference between them?
- A) The firewall assigns IP addresses; the router blocks viruses
- B) They are two names for the same device
- C) The router filters spam; the firewall boosts signal
- D) The router selects paths between networks; the firewall permits or denies traffic based on rules

**Answer: D**
Routers move packets between networks by destination; firewalls enforce policy on which traffic may pass. Many edge devices combine both, but the functions are distinct and worth separating mentally during troubleshooting.
<!-- {"id":"COMPTIA-NET-009-Q006","objective":"1.2","type":"recall","source":"OBJN9","locator":"Objective 1.2 networking appliances and functions","verified":"2026-10-10"} -->

---

### Q7
A company wants alerts when suspicious traffic crosses its network, but without blocking anything yet while they tune the rules. Which deployment fits?
- A) A load balancer
- B) A proxy server
- C) An intrusion detection system (passive monitoring)
- D) An intrusion prevention system in line

**Answer: C**
An IDS watches traffic and raises alerts without sitting in the traffic path, so it cannot block or break flows while being tuned. An IPS sits inline and can actively drop traffic, which is the follow-on step once rules are trusted.
<!-- {"id":"COMPTIA-NET-009-Q007","objective":"1.2","type":"diagnosis","source":"OBJN9","locator":"Objective 1.2 IDS vs IPS","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q8
A video-streaming service wants its content delivered from servers geographically close to each viewer to cut buffering. Which application architecture provides this?
- A) A syslog cluster
- B) A content delivery network
- C) A storage area network
- D) A network-attached storage box

**Answer: B**
A CDN caches content at distributed edge locations so viewers pull from a nearby node, reducing latency and origin load. SAN and NAS are storage technologies; syslog centralizes logs.
<!-- {"id":"COMPTIA-NET-009-Q008","objective":"1.2","type":"recall","source":"OBJN9","locator":"Objective 1.2 applications CDN","verified":"2026-10-10"} -->

---

### Q9
A branch office's traffic to the data center must be guaranteed a minimum share of the link so voice calls stay clear even during big file transfers. Which function enforces this?
- A) Network address translation
- B) Spanning tree
- C) Quality of service
- D) Time to live

**Answer: C**
QoS marks and prioritizes traffic classes so latency-sensitive voice gets preferential treatment over bulk transfers on congested links. TTL limits packet lifetime, NAT rewrites addresses, and spanning tree prevents loops.
<!-- {"id":"COMPTIA-NET-009-Q009","objective":"1.2","type":"diagnosis","source":"OBJN9","locator":"Objective 1.2 functions QoS","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q10
A misconfigured router sends packets into a loop between two routers, and the traffic would circulate forever except for one field in each packet. Which field saves the network?
- A) The source port, which expires
- B) The MAC address, which routes home
- C) Time to live, decremented at each hop until the packet is discarded
- D) The checksum, which deletes loops

**Answer: C**
TTL (hop limit in IPv6) exists precisely to kill looping packets: each router decrements it, and at zero the packet is dropped with an error back to the sender. Without it, routing loops would saturate links indefinitely.
<!-- {"id":"COMPTIA-NET-009-Q010","objective":"1.2","type":"diagnosis","source":"OBJN9","locator":"Objective 1.2 functions TTL","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q11
A company migrates email to a provider's hosted service while keeping its file servers on-premises. The provider's service is consumed through a browser with no local servers. Which cloud service model is the email?
- A) SaaS
- B) IaaS
- C) PaaS
- D) NFV

**Answer: A**
A complete application delivered by the provider and consumed through a browser is software as a service. IaaS would rent virtual machines to run their own mail software; PaaS provides a build platform.
<!-- {"id":"COMPTIA-NET-009-Q011","objective":"1.3","type":"recall","source":"OBJN9","locator":"Objective 1.3 cloud service models","verified":"2026-10-10"} -->

---

### Q12
A cloud team carves its own isolated virtual network inside the provider's shared infrastructure, with its own subnets, route tables, and gateways. What is this construct called?
- A) A virtual private cloud
- B) A patch panel
- C) A demarcation point
- D) A wireless controller

**Answer: A**
A VPC gives one customer a logically isolated network within a public cloud: private address space, subnets, routing, and gateways under their control, isolated from other tenants.
<!-- {"id":"COMPTIA-NET-009-Q012","objective":"1.3","type":"recall","source":"OBJN9","locator":"Objective 1.3 VPC","verified":"2026-10-10"} -->

---

### Q13
Instances in a cloud VPC need outbound internet access for updates but must remain unreachable from the internet inbound. Which gateway provides this?
- A) An internet gateway attached directly to each instance
- B) A VPN concentrator
- C) A load balancer
- D) A NAT gateway

**Answer: D**
A NAT gateway lets private instances initiate outbound connections (replies return) without accepting unsolicited inbound connections. An internet gateway with public addresses would expose them inbound as well.
<!-- {"id":"COMPTIA-NET-009-Q013","objective":"1.3","type":"diagnosis","source":"OBJN9","locator":"Objective 1.3 cloud gateways NAT gateway","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q14
A retailer wants its on-premises network and its cloud VPC to behave like one routed network with consistent low latency, avoiding the public internet. Which connectivity option fits best?
- A) Port forwarding on the home router
- B) A Wi-Fi bridge
- C) A direct/private interconnect service
- D) A consumer cable modem

**Answer: C**
Direct-connection services provide private, dedicated links between premises and the cloud provider, with predictable latency and no public-internet exposure. Site-to-site VPN is the encrypted-over-internet alternative when cost or availability rules out a private circuit.
<!-- {"id":"COMPTIA-NET-009-Q014","objective":"1.3","type":"diagnosis","source":"OBJN9","locator":"Objective 1.3 cloud connectivity options Direct Connect vs VPN","verified":"2026-10-10"} -->

---

### Q15
A cloud firewall object evaluates traffic using rules applied to a whole subnet rather than individual virtual machines. In common cloud vocabulary, what is this called?
- A) A DHCP reservation
- B) A network security list (subnet-level rules)
- C) A network security group (instance-level rules)
- D) A route table

**Answer: B**
Cloud providers distinguish instance-attached rule sets (security groups) from subnet-attached ones (security lists/network ACLs). The scenario describes subnet-level evaluation, which is the security list/ACL construct.
<!-- {"id":"COMPTIA-NET-009-Q015","objective":"1.3","type":"recall","source":"OBJN9","locator":"Objective 1.3 network security groups and lists","verified":"2026-10-10"} -->

---

### Q16
An e-commerce site doubles its web tier automatically during a flash sale and shrinks back afterward. Which two cloud properties work together here? (Choose two.)
- A) Scalability
- B) Elasticity
- C) Multitenancy
- D) NFV
- E) Jitter

**Correct Answer: A, B**
Scalability is the capacity to grow; elasticity is growing and shrinking automatically with demand, which is what the flash-sale pattern shows. Multitenancy describes shared infrastructure, and the others are unrelated.
<!-- {"id":"COMPTIA-NET-009-Q016","objective":"1.3","type":"diagnosis","source":"OBJN9","locator":"Objective 1.3 scalability and elasticity","verified":"2026-10-10"} -->

---

### Q17
A mail administrator needs the TCP port assignments for sending mail between servers versus a client reading mail over an encrypted connection. Which pair is correct?
- A) DNS 53 for both
- B) SMTP 25 for server-to-server; IMAPS 993 for encrypted retrieval
- C) SMTP 587 for client submission only and POP3 995 for sending
- D) HTTP 80 for both

**Answer: B**
SMTP on 25 carries server-to-server mail transfer, while clients read mail over IMAPS (993) or POP3S (995). Port 587 is the client submission port. Knowing which direction each service flows matters for firewall rules.
<!-- {"id":"COMPTIA-NET-009-Q017","objective":"1.4","type":"recall","source":"OBJN9","locator":"Objective 1.4 ports, protocols, services","verified":"2026-10-10"} -->

---

### Q18
A voice system needs call signaling over a reliable channel but the audio stream itself over the fastest possible path, tolerating minor loss. Which transport split matches this?
- A) TCP for signaling, UDP for the media stream
- B) UDP for both
- C) TCP for both
- D) ICMP for the media

**Answer: A**
Real-time voice uses UDP for media because late retransmitted audio is worthless, while call setup benefits from TCP's reliability. This is the standard pattern behind VoIP protocol design.
<!-- {"id":"COMPTIA-NET-009-Q018","objective":"1.4","type":"diagnosis","source":"OBJN9","locator":"Objective 1.4 protocols and traffic types","verified":"2026-10-10"} -->

---

### Q19
A technician must allow secure remote file transfers through the firewall for an admin who currently uses FTP over 21. Which change improves security with minimal workflow disruption?
- A) Use TFTP on 69 over the internet
- B) Move to SFTP over TCP 22
- C) Keep FTP but hide the port at 2121
- D) Switch to Telnet on 23

**Answer: B**
SFTP runs file transfer inside SSH on port 22 with encryption for credentials and data. Moving FTP to an odd port is security by obscurity with plaintext intact; Telnet and TFTP are also cleartext.
<!-- {"id":"COMPTIA-NET-009-Q019","objective":"1.4","type":"diagnosis","source":"OBJN9","locator":"Objective 1.4 FTP 20/21, SFTP 22","verified":"2026-10-10"} -->

---

### Q20
A network scan shows a server answering on ports 161 and 443. What services should the technician expect to find? (Choose two.)
- A) SNMP monitoring/management
- B) HTTPS web service
- C) SMTP mail transfer
- D) RDP remote desktop
- E) DHCP leasing

**Correct Answer: A, B**
Port 161 is SNMP (network device monitoring and management), and 443 is HTTPS. SMTP is 25, RDP is 3389, and DHCP uses 67/68.
<!-- {"id":"COMPTIA-NET-009-Q020","objective":"1.4","type":"recall","source":"OBJN9","locator":"Objective 1.4 common ports SNMP 161, HTTPS 443","verified":"2026-10-10"} -->

---

### Q21
A desktop cannot get an address, and the tech watches the traffic: the client broadcasts a discover, the server offers, the client requests, the server acknowledges. Which protocol and ports carry this exchange?
- A) DHCP, UDP 67 (server) and 68 (client)
- B) DNS, UDP 53
- C) LDAP, TCP 389
- D) NTP, UDP 123

**Answer: A**
The four-step DORA exchange (discover, offer, request, acknowledge) is DHCP, using UDP 67 on the server side and 68 on the client side. The other services resolve names, query directories, and sync clocks.
<!-- {"id":"COMPTIA-NET-009-Q021","objective":"1.4","type":"recall","source":"OBJN9","locator":"Objective 1.4 DHCP 67/68","verified":"2026-10-10"} -->

---

### Q22
A security review finds the directory service accepting simple binds on TCP 389 with credentials readable on the wire. What should the team move to?
- A) LDAP on UDP 53
- B) NetBIOS on 137
- C) SMB on 445 for all directory traffic
- D) LDAPS on TCP 636 (LDAP over TLS)

**Answer: D**
LDAP over TLS on port 636 encrypts directory authentication and queries. Plain LDAP on 389 exposes bind credentials; the other protocols serve naming/legacy and file-sharing roles, not directory security.
<!-- {"id":"COMPTIA-NET-009-Q022","objective":"1.4","type":"diagnosis","source":"OBJN9","locator":"Objective 1.4 LDAP 389 vs LDAPS 636","verified":"2026-10-10"} -->

---

### Q23
A clock-sensitive phone system and the camera network disagree on the time by four minutes, breaking call-log correlation. Which protocol and port synchronize them?
- A) SIP on TCP 5060
- B) TFTP on UDP 69
- C) NTP on UDP 123
- D) SNMP on UDP 161

**Answer: C**
NTP on UDP 123 distributes accurate time so logs and recordings align. SNMP monitors devices, SIP signals calls, and TFTP moves small files without time functions.
<!-- {"id":"COMPTIA-NET-009-Q023","objective":"1.4","type":"diagnosis","source":"OBJN9","locator":"Objective 1.4 NTP 123","verified":"2026-10-10"} -->

---

### Q24
A remote admin needs to check a switch's CPU load and interface counters from the monitoring station. Which protocol supports this, and what should be secured about it?
- A) FTP; anonymous read access
- B) DHCP; longer leases
- C) SNMP; use v3 with authentication/encryption rather than v1/v2 community strings
- D) Telnet; open it to the internet

**Answer: C**
SNMP is the standard device-telemetry protocol. Versions 1 and 2c authenticate with cleartext community strings, so v3's authenticated, encrypted model is the security baseline for management traffic.
<!-- {"id":"COMPTIA-NET-009-Q024","objective":"1.4","type":"diagnosis","source":"OBJN9","locator":"Objective 1.4 SNMP versions","verified":"2026-10-10"} -->

---

### Q25
A hospital's new wing runs a single cable plant serving voice, data, and building sensors. Which architecture decision most affects future flexibility at the desks?
- A) Using only wireless for everything
- B) Sharing one cable between two PCs with a splitter
- C) Terminating horizontal runs on patch panels in the closet so any drop can be patched to any switch port/service
- D) Hard-wiring each drop directly into one switch forever

**Answer: C**
Structured cabling with patch panels decouples the permanent wiring from the active equipment, letting any outlet be reassigned in seconds. Direct hard-wiring freezes the layout and splitter hacks break cabling standards.
<!-- {"id":"COMPTIA-NET-009-Q025","objective":"1.5","type":"diagnosis","source":"OBJN9","locator":"Objective 1.5 transmission media, structured cabling","verified":"2026-10-10"} -->

---

### Q26
A link must span 400 meters between two buildings at 10 Gbps. Which media choice fits?
- A) Multimode fiber (within its distance rating) or single-mode for longer spans
- B) Cat5e copper
- C) Coaxial RG-59
- D) Cat6a at full speed regardless of length

**Answer: A**
Copper Ethernet is limited to 100 meters per segment, so 400 meters rules out twisted pair regardless of category. Multimode fiber covers several hundred meters at 10G; single-mode covers kilometers.
<!-- {"id":"COMPTIA-NET-009-Q026","objective":"1.5","type":"diagnosis","source":"OBJN9","locator":"Objective 1.5 media types, distance limits","verified":"2026-10-10"} -->

---

### Q27
A factory floor's new cable run passes alongside large motors and welders, and the existing UTP links there suffer errors. Which cabling decision best addresses the interference?
- A) Higher-gauge bell wire
- B) Fiber optic cable, which is immune to electromagnetic interference
- C) Longer unshielded twisted pair
- D) Coaxial without shielding

**Answer: B**
Fiber carries light, not electricity, so electromagnetic interference cannot corrupt it. In electrically hostile environments, fiber (or shielded copper where fiber is impractical) is the standard answer.
<!-- {"id":"COMPTIA-NET-009-Q027","objective":"1.5","type":"diagnosis","source":"OBJN9","locator":"Objective 1.5 media comparison, EMI","verified":"2026-10-10"} -->

---

### Q28
A data center links two switches in the same rack at 25 Gbps over three meters. Cost matters and both switches have SFP28 cages. What is the most practical connection?
- A) A direct-attach copper (DAC) twinax cable
- B) Single-mode fiber with long-range optics
- C) Cat5e patch cords
- D) A wireless point-to-point link

**Answer: A**
For short in-rack runs between SFP cages, DAC twinax cables are the cheap, low-power, purpose-built option. Long-reach optics and fibers are wasted at three meters, and copper patch cords do not fit SFP cages.
<!-- {"id":"COMPTIA-NET-009-Q028","objective":"1.5","type":"recall","source":"OBJN9","locator":"Objective 1.5 transceivers, DAC","verified":"2026-10-10"} -->

---

### Q29
An uplink module slot in a switch is empty, and the fiber run to the next building uses LC connectors over single-mode fiber. What does the technician install?
- A) An RJ45 copper transceiver
- B) A multimode ST transceiver
- C) A console cable
- D) A single-mode SFP transceiver with LC interface matched to the link's speed and wavelength

**Answer: D**
Pluggable transceivers (SFP family) must match the fiber type (single-mode), the connector (LC), the speed, and the optical wavelength of the far end. Mismatched optics or connectors simply will not link.
<!-- {"id":"COMPTIA-NET-009-Q029","objective":"1.5","type":"diagnosis","source":"OBJN9","locator":"Objective 1.5 transceivers, SFP matching","verified":"2026-10-10"} -->

---

### Q30
A small office has one printer, eight PCs, and a single switch with cables radiating out to each device. Which topology is this?
- A) Bus
- B) Ring
- C) Mesh
- D) Star

**Answer: D**
Devices each connecting to a central switch form a star topology, the dominant LAN pattern: easy to troubleshoot, and one failed drop affects only that device. Bus and ring are legacy patterns; full mesh is impractical for LANs.
<!-- {"id":"COMPTIA-NET-009-Q030","objective":"1.6","type":"recall","source":"OBJN9","locator":"Objective 1.6 network topologies","verified":"2026-10-10"} -->

---

### Q31
Two data centers replicate storage between themselves and each also connects to a disaster-recovery site, with every site linked to every other site. Which WAN topology is in place?
- A) Bus
- B) Full mesh
- C) Hub and spoke
- D) Point-to-point only

**Answer: B**
When every site has a direct link to every other site, the topology is a full mesh: maximum redundancy at maximum link cost. Hub-and-spoke concentrates links at a central site, and point-to-point connects exactly two.
<!-- {"id":"COMPTIA-NET-009-Q031","objective":"1.6","type":"recall","source":"OBJN9","locator":"Objective 1.6 WAN topologies full mesh","verified":"2026-10-10"} -->

---

### Q32
A chain of branch offices routes all internet traffic through headquarters, where the firewall and DLP systems live. Branch-to-branch calls hairpin through HQ as well. Which topology is this?
- A) Hub and spoke
- B) Full mesh
- C) Ring
- D) Ad hoc wireless

**Answer: A**
Spoke sites connecting only to a central hub, with all traffic transiting it, is hub and spoke. It simplifies policy enforcement at the hub at the cost of latency for spoke-to-spoke traffic.
<!-- {"id":"COMPTIA-NET-009-Q032","objective":"1.6","type":"diagnosis","source":"OBJN9","locator":"Objective 1.6 hub and spoke","verified":"2026-10-10"} -->

---

### Q33
An engineer must summarize 192.168.0.0/24 through 192.168.3.0/24 in one routing entry. Which summary covers exactly those four networks?
- A) 192.168.0.0/22
- B) 192.168.0.0/21
- C) 192.168.0.0/24
- D) 192.168.4.0/22

**Answer: A**
Four contiguous /24s align into a /22 (2 bits of host space borrowed into the network summary). A /21 would cover eight /24s including four others; a /24 covers only one.
<!-- {"id":"COMPTIA-NET-009-Q033","objective":"1.7","type":"recall","source":"OBJN9","locator":"Objective 1.7 IPv4 summarization","verified":"2026-10-10"} -->

---

### Q34
A subnet must support 50 hosts. Which mask provides enough addresses with the least waste?
- A) /25 (126 usable)
- B) /28 (14 usable)
- C) /26 (62 usable host addresses)
- D) /27 (30 usable)

**Answer: C**
A /26 yields 64 addresses, 62 usable after network and broadcast, the smallest block that fits 50. The /27 is too small; the /25 works but wastes space the question asks to avoid.
<!-- {"id":"COMPTIA-NET-009-Q034","objective":"1.7","type":"recall","source":"OBJN9","locator":"Objective 1.7 IPv4 subnet sizing","verified":"2026-10-10"} -->

---

### Q35
A host is configured 10.1.5.37/27. What is its network address?
- A) 10.1.5.0
- B) 10.1.5.36
- C) 10.1.5.64
- D) 10.1.5.32

**Answer: D**
A /27 carves the last octet in blocks of 32: 0-31, 32-63, 64-95. Address 37 sits in the block starting at 32, so the network is 10.1.5.32 with broadcast 10.1.5.63.
<!-- {"id":"COMPTIA-NET-009-Q035","objective":"1.7","type":"recall","source":"OBJN9","locator":"Objective 1.7 IPv4 network calculation","verified":"2026-10-10"} -->

---

### Q36
A technician assigns 192.168.10.0 as a host address in the 192.168.10.0/25 network and it works, but 192.168.10.128 fails. Why?
- A) 128 is the network address of the second half (/25 split), not a usable host there
- B) Addresses above 100 are illegal
- C) The switch blocks high octets
- D) Even numbers are reserved

**Answer: A**
Splitting 192.168.10.0/24 into two /25s makes .0 the first network's address (valid as a network ID, not a host) and .128 the second network's ID, so .128 cannot be a host address in that scheme.
<!-- {"id":"COMPTIA-NET-009-Q036","objective":"1.7","type":"diagnosis","source":"OBJN9","locator":"Objective 1.7 network vs host addresses","verified":"2026-10-10"} -->

---

### Q37
An IPv6 address is written 2001:db8:0:0:0:0:0:1. What is the correct compressed form?
- A) 2001:db8:::1
- B) 2001:db8:0::1::0
- C) 21:db8::1
- D) 2001:db8::1

**Answer: D**
The longest run of all-zero groups collapses to a double colon once per address. Triple colons are invalid, and the double-colon can appear only once.
<!-- {"id":"COMPTIA-NET-009-Q037","objective":"1.7","type":"recall","source":"OBJN9","locator":"Objective 1.7 IPv6 compression","verified":"2026-10-10"} -->

---

### Q38
A host autoconfigures the address fe80::20c:29ff:fe12:3456. What kind of address is it and what is it for?
- A) Multicast to all routers
- B) A loopback address
- C) Link-local, used only on the local segment
- D) Global unicast, routable on the internet

**Answer: C**
Addresses beginning fe80::/10 are link-local: automatically present on every interface, used for local-segment functions like neighbor discovery, and never routed.
<!-- {"id":"COMPTIA-NET-009-Q038","objective":"1.7","type":"recall","source":"OBJN9","locator":"Objective 1.7 IPv6 link-local","verified":"2026-10-10"} -->

---

### Q39
A network uses addresses from fc00::/7 for internal routing that must never reach the internet. Which IPv6 concept is this?
- A) Link-local addressing
- B) Anycast
- C) Teredo tunneling
- D) Unique local addressing (the private-address analogue)

**Answer: D**
Unique local addresses (fc00::/7) are IPv6's equivalent of RFC 1918 space: routable within an organization, filtered at the boundary. Link-local is fe80::/10 and only for single segments.
<!-- {"id":"COMPTIA-NET-009-Q039","objective":"1.7","type":"recall","source":"OBJN9","locator":"Objective 1.7 IPv6 unique local","verified":"2026-10-10"} -->

---

### Q40
A DHCP server hands a laptop an IPv4 address, mask, gateway, and DNS server, and the laptop also self-generates an IPv6 address after hearing router advertisements without any DHCPv6 server. What is the IPv6 process called?
- A) 6to4 tunneling
- B) SLAAC (stateless address autoconfiguration)
- C) NAT64
- D) Dual-stack relay

**Answer: B**
SLAAC lets hosts build their own IPv6 addresses from router-advertised prefixes plus their interface identifier, no server required. The other options are transition/translation mechanisms between the two protocol versions.
<!-- {"id":"COMPTIA-NET-009-Q040","objective":"1.7","type":"recall","source":"OBJN9","locator":"Objective 1.7 SLAAC","verified":"2026-10-10"} -->

---

### Q41
Users in the sales VLAN can no longer reach the file server after a router change. The router's interface for that VLAN is up, and other VLANs work. What should the technician check first on the router?
- A) The NTP configuration
- B) The console cable
- C) The subinterface or SVI for the sales VLAN: encapsulation/VLAN ID and IP address
- D) The power supply

**Answer: C**
Inter-VLAN routing depends on each VLAN's routed interface being correctly configured: matching VLAN tag and an address in the right subnet. When one VLAN loses connectivity while others work, its routed interface config is the prime suspect.
<!-- {"id":"COMPTIA-NET-009-Q041","objective":"2.2","type":"diagnosis","source":"OBJN9","locator":"Objective 2.2 inter-VLAN routing","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q42
A building's wireless design must avoid three access points on overlapping channels interfering with each other in the 2.4 GHz band. Which channel plan is correct?
- A) Channels 1, 5, and 9
- B) Any adjacent channels
- C) Channels 1, 6, and 11
- D) Channels 1, 2, and 3

**Answer: C**
In 2.4 GHz, channels overlap heavily; 1, 6, and 11 are the non-overlapping set in North America. Adjacent-channel deployments cause co-channel and adjacent-channel interference that wrecks throughput.
<!-- {"id":"COMPTIA-NET-009-Q042","objective":"2.3","type":"recall","source":"OBJN9","locator":"Objective 2.3 wireless channels","verified":"2026-10-10"} -->

---

### Q43
A warehouse scanner keeps dropping its session as workers move between access points. The SSID and security match everywhere. What most improves roaming?
- A) Tune cell overlap and power so coverage hands off cleanly, ideally with controller-managed APs
- B) Give every AP a different SSID
- C) Disable encryption to speed handoff
- D) Raise every AP to maximum power

**Answer: A**
Roaming quality depends on proper cell design: enough overlap for seamless handoff without excessive co-channel interference, best managed by a controller. Different SSIDs force manual reconnects, and max power worsens interference.
<!-- {"id":"COMPTIA-NET-009-Q043","objective":"2.3","type":"diagnosis","source":"OBJN9","locator":"Objective 2.3 roaming/cell design","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q44
An office needs guest Wi-Fi that reaches the internet but cannot touch internal servers. Which combination achieves this?
- A) An open AP on the corporate VLAN
- B) WEP on the corporate SSID
- C) A separate guest SSID mapped to its own VLAN with ACLs blocking internal networks
- D) The corporate SSID with a shared password for guests

**Answer: C**
Guest access is isolated by separating the traffic at Layer 2 (its own SSID and VLAN) and enforcing policy (ACLs/firewall rules) that permits internet but denies internal destinations. Sharing the corporate SSID breaks that boundary.
<!-- {"id":"COMPTIA-NET-009-Q044","objective":"2.3","type":"diagnosis","source":"OBJN9","locator":"Objective 2.3 guest network segmentation","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q45
A coffee shop's captive portal lets customers accept terms before browsing. Which technology intercepts and redirects their first web request?
- A) DHCP snooping
- B) Spanning tree
- C) Port mirroring
- D) A captive portal on the wireless controller or gateway

**Answer: D**
Captive portals redirect unauthenticated clients to a terms/login page before granting internet access, a standard guest-network feature on controllers and gateways. The other options are switch security or diagnostic features.
<!-- {"id":"COMPTIA-NET-009-Q045","objective":"2.3","type":"recall","source":"OBJN9","locator":"Objective 2.3 captive portal","verified":"2026-10-10"} -->

---

### Q46
A tech measures one-way delay variance on a voice call and finds arrival times fluctuating between 5 and 90 milliseconds. What is this fluctuation called?
- A) Jitter
- B) Latency
- C) Attenuation
- D) Crosstalk

**Answer: A**
Jitter is the variation in packet arrival times. Voice and video tolerate some latency but degrade badly with jitter, which is why QoS and jitter buffers exist. Attenuation and crosstalk are physical-layer signal problems.
<!-- {"id":"COMPTIA-NET-009-Q046","objective":"5.4","type":"recall","source":"OBJN9","locator":"Objective 5.4 performance concepts jitter","verified":"2026-10-10"} -->

---

### Q47
A gigabit link transfers a large file at only 300 Mbps. A speed test to a nearby server hits full rate, but a test across the WAN does not. Which performance factor explains the difference?
- A) Bandwidth-delay behavior across the WAN (latency limiting effective throughput)
- B) Electromagnetic interference on fiber
- C) Duplex mismatch on the server NIC
- D) The file being too large for TCP

**Answer: A**
High-latency paths limit how much unacknowledged data can be in flight, so WAN transfers underperform versus local ones. A duplex mismatch would hurt the local test too, and EMI does not affect fiber.
<!-- {"id":"COMPTIA-NET-009-Q047","objective":"5.4","type":"diagnosis","source":"OBJN9","locator":"Objective 5.4 performance factors","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q48
A switch uplink shows a climbing count of CRC errors while the interface stays up. What is the most likely physical cause to inspect first?
- A) A duplicate VLAN name
- B) An expired certificate
- C) A damaged cable or connector on that run
- D) A DNS misconfiguration

**Answer: C**
CRC/FCS errors point at frames corrupted in transit: bad cables, connectors, interference, or a failing port. Logical-layer issues like DNS or certificates do not generate physical-layer error counters.
<!-- {"id":"COMPTIA-NET-009-Q048","objective":"5.2","type":"diagnosis","source":"OBJN9","locator":"Objective 5.2 physical issues CRC errors","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q49
A workstation negotiates 100 Mbps half-duplex on a gigabit switch port, and large transfers crawl with late collisions logged. What is the fault?
- A) The MTU being too small
- B) A missing default gateway
- C) A DNS loop
- D) A duplex mismatch, usually from one side hard-coded and the other autonegotiating

**Answer: D**
When one end is forced to full duplex and the other autonegotiates, the autonegotiating side falls back to half duplex: classic mismatch, with collisions and terrible throughput. Fix by setting both sides to autonegotiate.
<!-- {"id":"COMPTIA-NET-009-Q049","objective":"5.2","type":"diagnosis","source":"OBJN9","locator":"Objective 5.2 duplex mismatch","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q50
A new server must have the same IP every boot for firewall rules, but the team wants centralized address management rather than manual config. Which approach fits?
- A) A link-local address
- B) A DHCP reservation binding the server's MAC to a fixed address
- C) APIPA addressing
- D) A random address each boot

**Answer: B**
Reservations keep the address stable and centrally managed through DHCP. APIPA and link-local are fallback self-addressing that cannot route, and random addresses break firewall rules.
<!-- {"id":"COMPTIA-NET-009-Q050","objective":"3.4","type":"diagnosis","source":"OBJN9","locator":"Objective 3.4 DHCP reservation vs static","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q51
A user reports "the internet is down" but can ping 8.8.8.8. Web browsing fails for every site. What is the most likely fault?
- A) The NIC is disabled
- B) DNS resolution is broken or misconfigured
- C) The cable is bad
- D) The default gateway is missing

**Answer: B**
Reaching an IP directly but failing by name is the signature of a DNS problem: connectivity works, name resolution does not. A bad cable, gateway, or NIC would block the ping too.
<!-- {"id":"COMPTIA-NET-009-Q051","objective":"3.4","type":"diagnosis","source":"OBJN9","locator":"Objective 3.4 DNS vs connectivity","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q52
A company wants its own hostname records resolvable inside the office without depending on an ISP's resolver. Which infrastructure should it run internally?
- A) An outbound proxy
- B) Internal DNS servers hosting the corporate zones
- C) A second DHCP scope
- D) A WINS replacement using HOSTS files everywhere

**Answer: B**
Internal DNS servers hold the organization's zones and resolve names locally, with forwarding to public resolvers for external names. DHCP scopes hand out addresses; HOSTS files do not scale.
<!-- {"id":"COMPTIA-NET-009-Q052","objective":"3.4","type":"recall","source":"OBJN9","locator":"Objective 3.4 DNS infrastructure","verified":"2026-10-10"} -->

---

### Q53
An engineer documents that east-coast users reach a PoP in New York and west-coast users reach one in Los Angeles, using the same IP address announced from multiple locations. Which routing approach is this?
- A) Multicast
- B) Anycast
- C) Unicast
- D) Broadcast

**Answer: B**
Anycast announces one address from many locations; routing delivers each user to the nearest instance. It is how large DNS and CDN services steer users to close endpoints transparently.
<!-- {"id":"COMPTIA-NET-009-Q053","objective":"1.7","type":"recall","source":"OBJN9","locator":"Objective 1.7 anycast addressing","verified":"2026-10-10"} -->

---

### Q54
A monitoring system must receive copies of all frames crossing a trunk link for analysis. Which switch feature provides this?
- A) BPDU guard
- B) Port mirroring (SPAN)
- C) Port aggregation
- D) Storm control

**Answer: B**
Mirroring (SPAN and equivalents) copies traffic from source ports or VLANs to a monitor port for a sniffer or IDS. Aggregation bonds links for bandwidth; storm control limits floods; BPDU guard protects the topology.
<!-- {"id":"COMPTIA-NET-009-Q054","objective":"3.2","type":"recall","source":"OBJN9","locator":"Objective 3.2 port mirroring/SPAN","verified":"2026-10-10"} -->

---

### Q55
Two switches are connected with four parallel links to raise uplink bandwidth, and the links act as one logical pipe. What is configured?
- A) Spanning tree with all links forwarding
- B) VLAN stacking
- C) Port security
- D) Link aggregation (LACP or static bundle)

**Answer: D**
Aggregation protocols bundle parallel links into one logical channel for bandwidth and redundancy, keeping spanning tree from blocking the extras. LACP is the standards-based negotiation for this.
<!-- {"id":"COMPTIA-NET-009-Q055","objective":"2.2","type":"recall","source":"OBJN9","locator":"Objective 2.2 link aggregation LACP","verified":"2026-10-10"} -->

---

### Q56
A small site has two routers to the internet and wants hosts to fail over automatically if one router dies, without reconfiguring hosts. Which protocol family solves this?
- A) First-hop redundancy protocols such as HSRP or VRRP
- B) OSPF on the hosts
- C) NAT on the hosts
- D) DHCP failover on the hosts

**Answer: A**
FHRPs present a virtual gateway address shared by multiple routers; hosts keep one default gateway and the active router role moves on failure. Hosts never run routing protocols.
<!-- {"id":"COMPTIA-NET-009-Q056","objective":"2.1","type":"recall","source":"OBJN9","locator":"Objective 2.1 FHRP HSRP/VRRP","verified":"2026-10-10"} -->

---

### Q57
After a power blip, half the phones in one office are dead while PCs on the same switch work. The phones draw power over their network cables. What should be checked first?
- A) The DNS suffix
- B) The NTP stratum
- C) The subnet mask on the phones
- D) PoE budget and PoE status on that switch

**Answer: D**
Power over Ethernet comes from the switch; a switch that lost part of its PoE capacity or exceeded its budget after the blip will drop powered devices while data keeps flowing. Check PoE status and budget first.
<!-- {"id":"COMPTIA-NET-009-Q057","objective":"2.4","type":"diagnosis","source":"OBJN9","locator":"Objective 2.4 PoE troubleshooting","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q58
A camera at 280 meters from the nearest closet needs both network and power over one cable. Standard Ethernet will not reach. Which option fits?
- A) A longer Cat5e run with extra twists
- B) Two couplers joining three 100-meter runs
- C) USB over Ethernet adapters
- D) A PoE extender or midspan point partway, or fiber to a local PoE switch

**Answer: D**
Ethernet's 100-meter limit is a hard physical bound; couplers do not extend it. Extenders regenerate signal and power, and fiber to a small local PoE switch is the clean long-distance answer.
<!-- {"id":"COMPTIA-NET-009-Q058","objective":"2.4","type":"diagnosis","source":"OBJN9","locator":"Objective 2.4 PoE distance limits","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q59
A branch router's WAN link fails over to an LTE modem when the fiber drops. The fiber returns, but traffic stays on LTE until someone intervenes. What behavior should be adjusted?
- A) The console baud rate
- B) The failback/preemption settings and route metrics or tracking
- C) The SSID broadcast
- D) The VLAN names

**Answer: B**
Failover that does not return to the primary path is a failback configuration issue: tracking objects, metrics, and preemption determine when and whether the preferred path resumes. The other settings are unrelated to path selection.
<!-- {"id":"COMPTIA-NET-009-Q059","objective":"2.1","type":"diagnosis","source":"OBJN9","locator":"Objective 2.1 WAN failover failback","verified":"2026-10-10"} -->

---

### Q60
A design document calls for separating out-of-band device management traffic onto its own interfaces and VLAN, unreachable from user networks. What is the main benefit?
- A) It makes DHCP unnecessary
- B) Device management stays reachable and isolated even when the production network is impaired or hostile
- C) It doubles user bandwidth
- D) It eliminates the need for passwords

**Answer: B**
Out-of-band management keeps switch and server administration available during production outages and shields management planes from user-network attacks. It changes nothing about bandwidth or authentication requirements.
<!-- {"id":"COMPTIA-NET-009-Q060","objective":"3.5","type":"recall","source":"OBJN9","locator":"Objective 3.5 out-of-band management","verified":"2026-10-10"} -->

---
