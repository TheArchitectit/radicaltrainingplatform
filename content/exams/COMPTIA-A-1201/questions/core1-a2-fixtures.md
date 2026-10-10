# CompTIA A+ Core 1 — Module A2 fixtures (October 23 cut, A2 scope)

## Domain 2: Networking (220-1201)

---

### Q1
A coworker says a website "works by IP address but not by name." Which service should you check first?
- A) DHCP
- B) DNS
- C) The default gateway
- D) The subnet mask

**Answer: B**
If the site loads by IP address, the network path and the server both work — packets flow and answers come back. Only the name-to-address translation is failing, which points at DNS: a wrong DNS server setting, a DNS outage, or a name that does not resolve. DHCP hands out addressing, the gateway carries remote traffic, and the mask decides local vs. remote — none of those would let an IP address work while the name fails.

---

### Q2
Which of the following is the primary purpose of DNS?
- A) Assigning IP addresses to devices automatically
- B) Translating names like www.example.com into IP addresses
- C) Routing packets between different networks
- D) Encrypting web traffic between client and server

**Answer: B**
DNS is the network's name-resolution service: it turns names people can remember into the IP addresses networks actually route. Automatic address assignment is DHCP's job, routing between networks is the router/gateway's job, and web encryption is HTTPS (port 443), not DNS.

---

### Q3
A user reports that no websites load by name on a workstation, but pinging the company file server's IP address works. Which two settings are most worth verifying first?
- A) The subnet mask and the IP address
- B) The DNS server setting and the DNS service itself
- C) The Wi-Fi passphrase and the SSID
- D) The NIC driver version and the switch port speed

**Answer: B**
Local reachability by IP proves the host's IP, mask, and local network path are functioning. The failure is specific to name resolution, so the DNS server configured on the host (and whether the DNS service itself is reachable) is the first thing to verify. Checking mask/IP would re-test something already proven, and passphrase or driver issues would not leave IP connectivity intact.

---

### Q4
Which port number is used for standard HTTPS web traffic?
- A) 21
- B) 53
- C) 80
- D) 443

**Answer: D**
HTTPS — the encrypted web traffic behind the browser padlock — uses TCP port 443. Port 80 is unencrypted HTTP, port 53 is DNS, and port 21 is FTP control. Recognizing these three everyday ports (80, 443, 53) is the working set for A+ scope.

---

### Q5
Which of the following correctly describes what a DHCP lease provides to a joining device?
- A) An IP address, subnet mask, default gateway, and DNS server address
- B) Only an IP address; the rest must be configured manually
- C) A permanent, never-expiring IP assignment
- D) An encrypted tunnel for all the device's traffic

**Answer: A**
A DHCP lease hands out the complete IPv4 configuration set — IP address, subnet mask, default gateway, and DNS server — for a limited time, after which the client renews. The lease is temporary, not permanent, it is not a tunnel, and the point of DHCP is precisely that the device does not configure the rest by hand.

---

### Q6
A laptop joined to a small office network shows an address in the 169.254.x.x range and cannot reach anything beyond its own segment. What is the most likely cause?
- A) The DNS server is down
- B) The DHCP server did not deliver a lease
- C) The default gateway is misconfigured with the wrong subnet
- D) The wireless radio is disabled

**Answer: B**
An APIPA (169.254.x.x) address is the operating system's fallback when no DHCP lease arrives: the device can talk to its local segment but has no gateway or DNS, so nothing beyond the segment works. A down DNS server would not cause the 169.254 address, a radio-disabled laptop would have no address at all, and a wrong gateway on a manually configured host would not produce an APIPA address.

---

### Q7
A user can reach the local printer and other workstations on their subnet, but cannot open any website. Which setting is the most likely culprit?
- A) The default gateway
- B) The subnet mask
- C) The host's IP address
- D) The wireless SSID

**Answer: A**
Local devices are reachable, so the IP address and mask are correct — the host can tell local from remote just fine. Everything *remote* (the internet) depends on the default gateway, so a wrong or unreachable gateway produces exactly this split: local works, nothing outside does. The SSID is irrelevant when the device is connected.

---

### Q8
What role does the default gateway play on a host's network configuration?
- A) It is the address the host uses for all local subnet traffic
- B) It is the router address where the host sends traffic destined for other networks
- C) It is the server that assigns the host its IP address
- D) It is the service that resolves hostnames to IP addresses

**Answer: B**
The gateway is the router's address on the local network; any destination the host determines is *not* on the local subnet (per the mask) is sent there. Local traffic never touches the gateway, address assignment is DHCP, and name resolution is DNS. Choosing the gateway as the answer for local traffic is the classic confusion this item tests.

---

### Q9
A technician replaces a workstation's failing NIC. After boot, the machine shows an APIPA address and no internet access. Which action should the technician take first?
- A) Reinstall the operating system
- B) Replace the default gateway router
- C) Verify DHCP is reachable and renew the lease
- D) Change the DNS server to 8.8.8.8

**Answer: C**
The symptom — APIPA address — says no DHCP lease arrived, most plausibly because the NIC swap disrupted connectivity to the DHCP server. The safe, non-invasive first step is verifying DHCP reachability and renewing the lease before anything invasive. Reinstalling the OS and replacing the router are drastic and unsupported by the symptom; changing DNS would not fix an addressing failure.

---

### Q10
A workstation cannot reach anything by name or by IP address. The link light is on. Which field in the IPv4 configuration is the most likely single cause?
- A) The subnet mask is set to the wrong network
- B) The DNS server points to the wrong host
- C) The IP address is a duplicate of another device's address
- D) The gateway address points at a nonexistent device

**Answer: A**
Both name resolution *and* raw IP connectivity are broken, so the fault is below DNS — in the addressing itself. A wrong mask makes the host misjudge which destinations are local versus remote, breaking delivery for both named and direct-IP traffic. A bad DNS server would leave IP-address access working; a duplicate or bad gateway would not break local traffic the way a mask error does.
