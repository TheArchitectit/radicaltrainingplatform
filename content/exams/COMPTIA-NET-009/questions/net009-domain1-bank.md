# CompTIA Network+ N10-009 — Domain 1 beginner bank (networking concepts)

## Domain 1: Networking Concepts (N10-009)

---

### Q26
A device connects two IP subnets and chooses a path for each packet by destination address. At which OSI layer does it operate?
- A) Layer 3, the network layer
- B) Layer 1, the physical layer
- C) Layer 2, the data link layer
- D) Layer 4, the transport layer

**Answer: A**
Path selection by logical address is network-layer work, which is what a router does. Layer 1 (B) moves bits on a medium. Layer 2 (C) forwards frames by hardware address inside one network. Layer 4 (D) handles end-to-end delivery between processes.

---

### Q27
A workstation reports that its network cable is unplugged, and no link light appears at either end. Which layer should be checked first?
- A) The application layer
- B) The transport layer
- C) The physical layer
- D) The session layer

**Answer: C**
A missing link light and an unplugged indication are about the medium and the port, which is physical-layer territory: cable, connector, jack, or port. The application (A) and session (D) layers depend on a working link beneath them. The transport layer (B) has nothing to carry if no signal exists.

---

### Q28
Three web servers share one published address, and requests are spread across them by current connection count. Which appliance performs this?
- A) A content filter
- B) A load balancer
- C) A modem
- D) A wireless controller

**Answer: B**
A load balancer presents one address and distributes sessions across a pool by a chosen method. A content filter (A) classifies and blocks destinations. A modem (C) converts the provider's signal. A wireless controller (D) manages access points.

---

### Q29
A security appliance receives a copy of the traffic, raises alerts on suspicious patterns, and never blocks a packet. What is it?
- A) An intrusion prevention system
- B) A load balancer
- C) A proxy server
- D) An intrusion detection system

**Answer: D**
An intrusion detection system observes and alerts, which is what a passive monitor does. An intrusion prevention system (A) sits in the path and can drop traffic, which this appliance demonstrably does not. A load balancer (B) distributes sessions. A proxy (C) terminates and forwards requests.

---

### Q30
Branch users repeatedly download the same large files from a distant site, and a local appliance keeps copies so the WAN link is not used twice. Which appliance is in place?
- A) A caching proxy
- B) A DHCP relay
- C) A media converter
- D) A KVM switch

**Answer: A**
A caching proxy stores frequently requested content close to the users and serves repeats locally. A DHCP relay (B) forwards address requests across subnets. A media converter (C) changes between fiber and copper. A KVM switch (D) shares a keyboard, display and mouse.

---

### Q31
A company rents virtual machines and storage from a provider and installs, patches and secures the operating systems itself. Which service model is this?
- A) Software as a service
- B) Platform as a service
- C) Infrastructure as a service
- D) Desktop as a service

**Answer: C**
Infrastructure as a service supplies compute, storage and networking while the customer owns everything above the hypervisor, including the operating system. Software as a service (A) delivers a finished application. A platform (B) supplies a managed runtime. A hosted desktop (D) delivers a remote desktop session.

---

### Q32
A bank requires a dedicated circuit between its data centre and a cloud provider, with no internet transport in the path. Which option meets this?
- A) A site-to-site VPN over broadband
- B) Carrier-grade NAT
- C) A public content delivery network
- D) A private leased circuit

**Answer: D**
A private circuit is provisioned for the customer alone and does not traverse the public internet, which is what the requirement demands. A site-to-site VPN (A) is encrypted but still crosses the internet. Carrier-grade NAT (B) shares public addresses. A content delivery network (C) caches content near users.

---

### Q33
A branch office must reach cloud resources over its existing broadband service but with the traffic encrypted end to end between sites. Which option fits?
- A) A private leased circuit
- B) A site-to-site VPN
- C) A public peering exchange
- D) A metered cellular link

**Answer: B**
A site-to-site VPN builds an encrypted tunnel across an existing internet connection, which matches both constraints. A private circuit (A) is not internet transport. A peering exchange (C) is where networks interconnect. A cellular link (D) is a different access medium, not an encryption method.

---

### Q34
Which port does HTTPS use by default?
- A) 443
- B) 80
- C) 25
- D) 3389

**Answer: A**
HTTPS is HTTP carried inside TLS on port 443. Port 80 (B) is plain HTTP. Port 25 (C) is SMTP. Port 3389 (D) is remote desktop.

---

### Q35
A monitoring platform polls switches for interface counters and receives unsolicited alerts from them. Which protocol and port carry this?
- A) SMTP on port 25
- B) SNMP on UDP port 161
- C) SSH on port 22
- D) RDP on port 3389

**Answer: B**
SNMP agents answer polls on UDP 161 and send traps to a manager, which covers both directions described. SMTP (A) carries mail. SSH (C) is a remote shell. RDP (D) is a remote desktop protocol.

---

### Q36
A link must span 10 kilometers between two buildings without any repeater. Which fiber type is designed for that distance?
- A) Multimode fiber
- B) Cat 6a twisted pair
- C) Single-mode fiber
- D) Coaxial cable

**Answer: C**
Single-mode fiber carries a narrow light path with very low loss, which is what long spans require. Multimode (A) is limited to shorter runs because the light disperses. Twisted pair (B) is limited to about 100 meters. Coax (D) is not used for spans of that length in modern networks.

---

### Q37
A switch SFP+ cage must connect to an existing copper RJ45 run. Which transceiver fits the requirement?
- A) A 1000BASE-SX optical module
- B) An LC single-mode optical module
- C) A QSFP28 optical module
- D) A copper SFP module

**Answer: D**
A copper SFP module presents an RJ45 port inside the cage, so a twisted-pair run can terminate there. The optical modules (A, B) expect fiber, not copper. A QSFP28 module (C) is a different, larger form factor that does not fit an SFP+ cage.

---

### Q38
Which cable category supports 10 GbE to 100 meters in a new office installation?
- A) Cat 6a
- B) Cat 3
- C) Cat 5
- D) RG-6

**Answer: A**
Cat 6a is specified for 10 GbE at 100 meters, which is why it is the usual choice for new 10G copper runs. Cat 3 (B) and Cat 5 (C) are far below that rate at any length. RG-6 (D) is coaxial cable for video and cable services.

---

### Q39
Every workstation connects to one central switch, and a failure of that switch takes the whole floor offline. Which topology is described?
- A) Mesh
- B) Ring
- C) Star
- D) Point-to-point

**Answer: C**
A star places every endpoint on a central device, which makes that device a single point of failure. A mesh (A) provides multiple paths. A ring (B) passes traffic around a loop. A point-to-point link (D) joins exactly two endpoints.

---

### Q40
A design requires every site to hold a direct path to every other site, so a single failed link cannot isolate a site. Which topology meets this?
- A) Star
- B) Full mesh
- C) Bus
- D) Hub-and-spoke

**Answer: B**
A full mesh connects every pair of sites, so no single link failure cuts a site off. A star (A) and hub-and-spoke (D) both depend on a central node. A bus (C) is a shared medium that a single break can divide.

---

### Q41
A campus design uses a high-speed backbone, a distribution layer per floor, and access switching at the desk. Which architecture is this?
- A) A flat layer-2 network
- B) A hub-and-spoke WAN
- C) A peer-to-peer mesh
- D) A three-tier campus model

**Answer: D**
Core, distribution and access is the three-tier campus model, with each tier doing its own job. A flat layer-2 design (A) has no distribution tier. A hub-and-spoke WAN (B) describes site connectivity. A peer-to-peer mesh (C) describes many-to-many links.

---

### Q42
A retailer wants branch traffic to take whichever path is best at that moment — broadband, cellular or a private circuit — chosen per application by policy. Which technology provides this?
- A) SD-WAN
- B) A VLAN trunk
- C) Port mirroring
- D) A spanning-tree domain

**Answer: A**
Software-defined WAN steers traffic across multiple transports by application policy, which is exactly the described behavior. A VLAN trunk (B) carries several VLANs on one link. Port mirroring (C) copies traffic for analysis. A spanning-tree domain (D) prevents layer-2 loops.

---

### Q43
Remote staff must be inspected and have policy enforced wherever they work, with the security service delivered from the cloud. Which model fits?
- A) A flat internal VLAN
- B) Secure access service edge
- C) A single perimeter firewall
- D) Static NAT

**Answer: B**
Secure access service edge converges network and security functions in a cloud-delivered service that follows the user, which matches "wherever they work." A flat VLAN (A) is an internal segment. A single perimeter firewall (C) protects one location, which is the problem being solved. Static NAT (D) maps addresses.

---

### Q44
Building sensors and cameras must reach their controller but must never reach office workstations. Which control achieves this?
- A) A longer DHCP lease
- B) A larger MTU
- C) Port mirroring
- D) A separate VLAN with access rules

**Answer: D**
Placing the devices on their own VLAN and filtering traffic between VLANs limits them to their controller by policy. Lease length (A) and MTU (B) are addressing and framing settings. Port mirroring (C) copies traffic and filters nothing.
