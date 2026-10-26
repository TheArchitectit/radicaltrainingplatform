# CompTIA Network+ N10-009 — Domain 3 beginner bank (network operations)

## Domain 3: Network Operations (N10-009)

---

### Q52
A network change must be requested, reviewed, scheduled in a window and recorded before anyone implements it. Which process is this?
- A) Change management
- B) Incident response
- C) Capacity planning
- D) Asset disposal

**Answer: A**
Change management is the process that reviews, approves, schedules and records changes so their impact is known in advance and can be reversed. Incident response (B) handles events that are already happening. Capacity planning (C) forecasts demand. Asset disposal (D) retires equipment.

---

### Q53
A contract states that a service must be restored within four hours of an outage, with credits if it is not. Which document is this?
- A) An acceptable use policy
- B) A network topology diagram
- C) A service level agreement
- D) A change request

**Answer: C**
A service level agreement sets measurable commitments such as restoration time, along with the consequences of missing them. An acceptable use policy (A) governs how people may use systems. A topology diagram (B) documents the network. A change request (D) proposes a modification.

---

### Q54
An outage may lose no more than 15 minutes of data. Which metric expresses that limit?
- A) Recovery time objective
- B) Recovery point objective
- C) Mean time between failures
- D) Mean time to repair

**Answer: B**
The recovery point objective measures how much data may be lost, expressed as a time before the failure, which is what backup frequency is designed against. The recovery time objective (A) measures how long restoration may take. MTBF (C) measures reliability. MTTR (D) measures repair duration.

---

### Q55
A recovery site has power, cooling and network connectivity arranged, but no servers are installed there until an event occurs, so restoration takes days. Which site type is this?
- A) Hot site
- B) Mirrored site
- C) Warm site
- D) Cold site

**Answer: D**
A cold site provides only the facility and infrastructure, so equipment must be delivered and installed after the event. A hot site (A) and a mirrored site (B) keep systems running and ready. A warm site (C) has hardware in place but needs data and configuration work.

---

### Q56
Clients on one subnet must obtain addresses from a DHCP server on a different subnet, and the router must not forward broadcasts. Which feature makes this work?
- A) A DHCP relay
- B) A DNS forwarder
- C) An NTP server
- D) A NAT pool

**Answer: A**
A DHCP relay receives the broadcast locally and forwards it as a unicast message to the server, so no broadcast has to cross the router. A DNS forwarder (B) resolves names. An NTP server (C) provides time. A NAT pool (D) supplies public addresses.

---

### Q57
Which DNS record type holds a host's IPv6 address?
- A) A
- B) MX
- C) AAAA
- D) PTR

**Answer: C**
The AAAA record maps a name to an IPv6 address. An A record (A) maps to an IPv4 address. An MX record (B) names a mail server. A PTR record (D) maps an address back to a name.

---

### Q58
Which statement about IPv6 is correct?
- A) IPv6 resolves addresses with ARP
- B) IPv6 uses neighbor discovery and has no broadcast address
- C) IPv6 requires network address translation for internet access
- D) IPv6 addresses are 32 bits long

**Answer: B**
IPv6 replaces ARP with neighbor discovery and uses multicast instead of broadcast, which is why the broadcast address does not exist there. ARP (A) is an IPv4 mechanism. IPv6 (C) was designed for end-to-end addressing without NAT. Its addresses (D) are 128 bits.

---

### Q59
A server's management interface is unreachable over the production network, but an administrator can still log in through a console connection. Which access method allowed that?
- A) In-band management over the production network
- B) A VPN into the data VLAN
- C) A jump host in the user VLAN
- D) Out-of-band management through a console server

**Answer: D**
Out-of-band management uses a path that does not depend on the production network, which is why it still worked when that network did not. In-band management (A) is exactly what failed. A VPN (B) and a jump host (C) both depend on network connectivity to reach the device.

---

### Q60
Which protocol supports separate authentication, authorization and accounting for network device administration, and runs over TCP?
- A) TACACS+
- B) RADIUS
- C) Kerberos
- D) LDAP

**Answer: A**
TACACS+ separates the three functions and runs over TCP, which is why it is used for device administration. RADIUS (B) combines authentication and authorization and runs over UDP. Kerberos (C) is a ticket-based authentication protocol. LDAP (D) is a directory access protocol.

---

### Q61
Remote device administration must be encrypted instead of sending credentials in clear text. Which protocol should be used?
- A) Telnet
- B) TFTP
- C) SSH
- D) SNMPv1

**Answer: C**
SSH encrypts the session, including the login exchange, so credentials are not readable on the wire. Telnet (A) sends everything in clear text. TFTP (B) transfers files with no authentication. SNMPv1 (D) has no encryption.
