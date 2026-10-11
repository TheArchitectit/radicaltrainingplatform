# CompTIA A+ Core 1 — A2/A5 demo cut fixtures (October 23 cut)

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
- A) Routing packets between different networks
- B) Encrypting web traffic between client and server
- C) Translating names like www.example.com into IP addresses
- D) Assigning IP addresses to devices automatically

**Answer: C**
DNS is the network's name-resolution service: it turns names people can remember into the IP addresses networks actually route. Automatic address assignment is DHCP's job, routing between networks is the router/gateway's job, and web encryption is HTTPS (port 443), not DNS.

---

### Q3
A user reports that no websites load by name on a workstation, but pinging the company file server's IP address works. Which two settings are most worth verifying first?
- A) The subnet mask and the IP address
- B) The Wi-Fi passphrase and the SSID
- C) The NIC driver version and the switch port speed
- D) The DNS server setting and the DNS service itself

**Answer: D**
Local reachability by IP proves the host's IP, mask, and local network path are functioning. The failure is specific to name resolution, so the DNS server configured on the host (and whether the DNS service itself is reachable) is the first thing to verify. Checking mask/IP would re-test something already proven, and passphrase or driver issues would not leave IP connectivity intact.

---

### Q4
Which port number is used for standard HTTPS web traffic?
- A) 443
- B) 21
- C) 53
- D) 80

**Answer: A**
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
- A) The DHCP server did not deliver a lease
- B) The DNS server is down
- C) The default gateway is misconfigured with the wrong subnet
- D) The wireless radio is disabled

**Answer: A**
An APIPA (169.254.x.x) address is the operating system's fallback when no DHCP lease arrives: the device can talk to its local segment but has no gateway or DNS, so nothing beyond the segment works. A down DNS server would not cause the 169.254 address, a radio-disabled laptop would have no address at all, and a wrong gateway on a manually configured host would not produce an APIPA address.

---

### Q7
A user can reach the local printer and other workstations on their subnet, but cannot open any website. Which setting is the most likely culprit?
- A) The subnet mask
- B) The host's IP address
- C) The default gateway
- D) The wireless SSID

**Answer: C**
Local devices are reachable, so the IP address and mask are correct — the host can tell local from remote just fine. Everything *remote* (the internet) depends on the default gateway, so a wrong or unreachable gateway produces exactly this split: local works, nothing outside does. The SSID is irrelevant when the device is connected.

---

### Q8
What role does the default gateway play on a host's network configuration?
- A) It is the address the host uses for all local subnet traffic
- B) It is the server that assigns the host its IP address
- C) It is the service that resolves hostnames to IP addresses
- D) It is the router address where the host sends traffic destined for other networks

**Answer: D**
The gateway is the router's address on the local network; any destination the host determines is *not* on the local subnet (per the mask) is sent there. Local traffic never touches the gateway, address assignment is DHCP, and name resolution is DNS. Choosing the gateway as the answer for local traffic is the classic confusion this item tests.

---

### Q9
A technician replaces a workstation's failing NIC. After boot, the machine shows an APIPA address and no internet access. Which action should the technician take first?
- A) Reinstall the operating system
- B) Verify DHCP is reachable and renew the lease
- C) Replace the default gateway router
- D) Change the DNS server to 8.8.8.8

**Answer: B**
The symptom — APIPA address — says no DHCP lease arrived, most plausibly because the NIC swap disrupted connectivity to the DHCP server. The safe, non-invasive first step is verifying DHCP reachability and renewing the lease before anything invasive. Reinstalling the OS and replacing the router are drastic and unsupported by the symptom; changing DNS would not fix an addressing failure.

---

### Q10
A workstation cannot reach anything by name or by IP address. The link light is on. Which field in the IPv4 configuration is the most likely single cause?
- A) The DNS server points to the wrong host
- B) The IP address is a duplicate of another device's address
- C) The gateway address points at a nonexistent device
- D) The subnet mask is set to the wrong network

**Answer: D**
Both name resolution *and* raw IP connectivity are broken, so the fault is below DNS — in the addressing itself. A wrong mask makes the host misjudge which destinations are local versus remote, breaking delivery for both named and direct-IP traffic. A bad DNS server would leave IP-address access working; a duplicate or bad gateway would not break local traffic the way a mask error does.

---

### Q11
Internal server names stopped resolving on several workstations, but public websites still load normally. What does this split most suggest?
- A) The default gateway is down for the whole building
- B) Every workstation lost its IP address
- C) The internal DNS zone or internal DNS service is the problem
- D) The internet service provider is blocking web traffic

**Answer: C**
Public names working means the clients can still reach *some* DNS and the internet path is up — only the internal names fail. That isolates the fault to the internal zone or the internal DNS service those names live in, not to the gateway (A) or to addressing (B), which would break public traffic too. An ISP block on web traffic (D) would not leave public sites loading.

---

### Q12
A firewall rule must be opened so clients can send DNS name lookups to the campus DNS server. Which port should the rule allow?
- A) 80
- B) 443
- C) 53
- D) 21

**Answer: C**
DNS name lookups use port 53 (UDP for ordinary queries, TCP for larger responses). Port 80 is unencrypted HTTP, 443 is HTTPS, and 21 is FTP control — none of those carry name resolution. Opening 80 or 443 because "that is web" is the classic confusion: web *uses* DNS, but DNS itself is not web traffic.

---

### Q13
One user cannot reach the company intranet by name. Colleagues on the same switch can. What is the safest first test on that user's workstation?
- A) Reinstall the operating system
- B) Replace the network switch
- C) Record the current IP configuration and try a name lookup (nslookup) to see what fails
- D) Change the DNS server to a public resolver and leave it that way

**Answer: C**
When one host is affected and its neighbors are fine, start with a safe, reversible test: capture the configuration as it is, then measure name resolution directly. That tells you whether the client is asking, what it is asking, and what answer it gets — without changing anything you cannot undo. Reinstalling (A) and replacing the switch (B) are invasive and unsupported by the symptom; pointing DNS at a public resolver (D) may mask an internal-zone problem and leaks internal names.

---

### Q14
After a desk move, a laptop gets no DHCP address and shows a 169.254.x.x APIPA address. Link light is on. What should the technician verify first, before replacing any hardware?
- A) That the wall port / switch port actually reaches a DHCP-enabled network (correct VLAN or uplink)
- B) That the laptop battery is fully charged
- C) That the printer driver is up to date
- D) That the monitor cable is seated

**Answer: A**
APIPA with a link light means the NIC is up but no lease arrived — the usual cause after a move is that the new port is on the wrong VLAN, unpatched, or otherwise not delivering DHCP. Verifying the port path is the safe, non-invasive first check. Battery, printer driver, and monitor cable are unrelated to address delivery and would not produce APIPA.

---

### Q15
A user reports that file transfers to one server are slow, while other servers feel normal. What is the safest first measurement?
- A) Increase the NIC speed/duplex settings immediately
- B) Replace the workstation's network cable
- C) Compare a ping or path test to the slow server against the same test to a known-good server
- D) Defragment the workstation's hard drive

**Answer: C**
Before changing anything, measure. Comparing the slow path against a known-good one tells you whether the delay is on the network path to that server, on the server itself, or unique to the client — and it gives you a baseline to prove any later fix. Changing speed/duplex (A) and swapping cable (B) are guesses that can make things worse; defragmenting (D) does not test a network path at all.

---

### Q16
A technician confirmed the workstation has a valid IP address and can ping its default gateway. Name resolution still fails. What is the next step in isolating the cause?
- A) Replace the workstation's NIC
- B) Reinstall the operating system
- C) Test DNS specifically — try a lookup (nslookup) and verify the configured DNS server answers
- D) Change the subnet mask and reboot

**Answer: C**
Local delivery is already proven (valid IP, gateway ping works). The remaining suspect is the name-resolution path, so the next step is to test that layer directly: does a lookup run, and does the configured DNS server reply? Replacing hardware (A) and reinstalling (B) are invasive actions with no evidence pointing at them; changing the mask (D) would disturb a working local path and does not test DNS.
