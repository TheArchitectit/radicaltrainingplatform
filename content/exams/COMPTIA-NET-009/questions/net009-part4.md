# CompTIA Network+ (N10-009) Practice Questions - Part 4
# Original study items. Independent material, not official or endorsed by CompTIA.

## DOMAIN 4: Network Security (study allocation)

---

### Q181
A policy states that payroll data must not be readable by anyone outside the payroll team. Which security goal does this express?
- A) Non-repudiation
- B) Redundancy
- C) Confidentiality
- D) Availability

**Answer: C**
Confidentiality restricts information to authorized parties. Availability keeps services reachable; integrity keeps data unaltered; non-repudiation ties actions to actors. Together these form the classic security triad and its extensions.
<!-- {"id":"COMPTIA-NET-009-Q181","objective":"4.1","type":"recall","source":"OBJN9","locator":"Objective 4.1 security concepts CIA","verified":"2026-10-10"} -->

---

### Q182
A file's hash changes between transfer and receipt, indicating tampering in transit. Which security property was violated?
- A) Integrity
- B) Confidentiality
- C) Availability
- D) Elasticity

**Answer: A**
Integrity guarantees data is unaltered. Hash comparisons detect modification; encryption protects confidentiality; redundancy protects availability.
<!-- {"id":"COMPTIA-NET-009-Q182","objective":"4.1","type":"recall","source":"OBJN9","locator":"Objective 4.1 integrity","verified":"2026-10-10"} -->

---

### Q183
A login system asks for a password, then a code from an authenticator app. Which two factor categories are combined?
- A) Two biometric factors
- B) Something you know and something you have
- C) Something you are and somewhere you are
- D) Two things you know

**Answer: B**
A password is knowledge; the phone generating codes is a possession factor. Combining different categories is what makes authentication multifactor rather than merely two-step.
<!-- {"id":"COMPTIA-NET-009-Q183","objective":"4.1","type":"recall","source":"OBJN9","locator":"Objective 4.1 authentication factors","verified":"2026-10-10"} -->

---

### Q184
An intern receives access to exactly the shared folders their job requires and nothing more. Which principle is applied?
- A) Role-based DNS
- B) Least privilege
- C) Implicit deny of the internet
- D) Separation of the racks

**Answer: B**
Least privilege grants the minimum access needed for the role, limiting damage from mistakes and compromise. It pairs with need-to-know reviews as duties change.
<!-- {"id":"COMPTIA-NET-009-Q184","objective":"4.1","type":"recall","source":"OBJN9","locator":"Objective 4.1 least privilege","verified":"2026-10-10"} -->

---

### Q185
A security model treats every access attempt as untrusted, verifying user, device, and context each time even inside the office network. What is this model?
- A) Zero trust
- B) Perimeter security
- C) Port security
- D) A flat network

**Answer: A**
Zero trust abandons "inside means trusted": every request is authenticated and authorized regardless of network location. It replaces the hard-shell/soft-center perimeter model.
<!-- {"id":"COMPTIA-NET-009-Q185","objective":"4.1","type":"recall","source":"OBJN9","locator":"Objective 4.1 zero trust","verified":"2026-10-10"} -->

---

### Q186
After one server is compromised, the attacker reaches every other server on the same flat network within minutes. Which design would have limited the blast radius?
- A) Bigger monitors in the NOC
- B) Segmentation into zones with enforced boundaries
- C) A faster switch
- D) Longer passwords

**Answer: B**
Segmentation divides the network into security zones so compromise of one segment does not grant free movement to the rest. Boundaries (firewalls, ACLs, microsegmentation) enforce the separation.
<!-- {"id":"COMPTIA-NET-009-Q186","objective":"4.1","type":"diagnosis","source":"OBJN9","locator":"Objective 4.1 segmentation","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q187
A decoy server with no legitimate users sits on the network logging every connection attempt, purely to detect intruders. What is it?
- A) A jump box
- B) A load balancer
- C) A honeypot
- D) A proxy

**Answer: C**
A honeypot is bait: any interaction with it is suspicious by definition, making it a high-signal intrusion detector. A honeynet extends the concept to a decoy network.
<!-- {"id":"COMPTIA-NET-009-Q187","objective":"4.1","type":"recall","source":"OBJN9","locator":"Objective 4.1 honeypots","verified":"2026-10-10"} -->

---

### Q188
A company defines who may approve firewall changes, how guests get wireless access, and how incidents are escalated, all in signed documents. What class of security artifacts are these?
- A) Protocols and ports
- B) Baselines and benchmarks
- C) Patches and firmware
- D) Policies and procedures

**Answer: D**
Policies state what must be true; procedures describe how. Technical controls enforce them, but the documents themselves are the governance layer of a security program.
<!-- {"id":"COMPTIA-NET-009-Q188","objective":"4.1","type":"recall","source":"OBJN9","locator":"Objective 4.1 policies and procedures","verified":"2026-10-10"} -->

---

### Q189
A remote worker's laptop is checked for updated antivirus and patches before it may join the internal network over VPN. What is this check called?
- A) Band steering
- B) Load balancing
- C) Posture assessment
- D) Port mirroring

**Answer: C**
Posture assessment evaluates a device's health and compliance before or during access, a core NAC function. Noncompliant devices get quarantined or remediated instead of trusted.
<!-- {"id":"COMPTIA-NET-009-Q189","objective":"4.1","type":"recall","source":"OBJN9","locator":"Objective 4.1 posture assessment","verified":"2026-10-10"} -->

---

### Q190
An attack floods a company's web server with traffic from thousands of compromised machines worldwide until legitimate users cannot connect. What type of attack is this?
- A) VLAN hopping
- B) MAC flooding
- C) Distributed denial of service
- D) ARP poisoning

**Answer: C**
DDoS overwhelms a target with volume from many sources. Mitigations include upstream scrubbing, rate limiting, and CDN absorption, since the target's own link saturates regardless of local defenses.
<!-- {"id":"COMPTIA-NET-009-Q190","objective":"4.2","type":"recall","source":"OBJN9","locator":"Objective 4.2 DDoS","verified":"2026-10-10"} -->

---

### Q191
A switch's CAM table fills with bogus entries until it starts flooding all traffic to every port, letting an attacker sniff other users. Which attack is this?
- A) A smurf attack
- B) MAC flooding
- C) DNS poisoning
- D) Phishing

**Answer: B**
MAC flooding exhausts the switch's address table, forcing fail-open flooding that exposes traffic. Port security limiting MACs per port is the standard countermeasure.
<!-- {"id":"COMPTIA-NET-009-Q191","objective":"4.2","type":"diagnosis","source":"OBJN9","locator":"Objective 4.2 MAC flooding","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q192
Hosts on a LAN suddenly send their internet-bound traffic to an attacker's laptop because it answers "who has the gateway's IP" faster than the real gateway. Which attack is underway?
- A) DHCP starvation
- B) A brute-force login
- C) ARP poisoning (ARP spoofing)
- D) DNS amplification

**Answer: C**
Forged ARP replies bind the gateway's IP to the attacker's MAC, redirecting traffic through them: a local man-in-the-middle. Dynamic ARP inspection on switches blocks the forged replies.
<!-- {"id":"COMPTIA-NET-009-Q192","objective":"4.2","type":"diagnosis","source":"OBJN9","locator":"Objective 4.2 ARP poisoning","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q193
An attacker exhausts a DHCP scope by requesting thousands of leases with random MAC addresses, then runs their own rogue server handing out poisoned settings. What is the first attack called?
- A) DHCP starvation
- B) VLAN hopping
- C) DNS tunneling
- D) Credential stuffing

**Answer: A**
Starving the legitimate server of leases sets up the rogue-DHCP phase, which then delivers malicious gateways and DNS to victims. DHCP snooping and port security counter both phases.
<!-- {"id":"COMPTIA-NET-009-Q193","objective":"4.2","type":"diagnosis","source":"OBJN9","locator":"Objective 4.2 DHCP starvation/rogue DHCP","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q194
A visitor plugs a small device into an empty conference-room jack, giving them a persistent remote foothold on the corporate LAN. What class of threat is this?
- A) An evil twin
- B) A watering-hole attack
- C) A zero-day exploit
- D) A rogue device on the network

**Answer: D**
Unauthorized hardware attached to the network is a rogue device. Defenses: port security, 802.1X, NAC, and disabling unused jacks. An evil twin is the wireless analog: a fake access point.
<!-- {"id":"COMPTIA-NET-009-Q194","objective":"4.2","type":"recall","source":"OBJN9","locator":"Objective 4.2 rogue devices","verified":"2026-10-10"} -->

---

### Q195
In a coffee shop, laptops auto-connect to "Airport_Free_WiFi" run by an attacker imitating the real network, who then intercepts traffic. What is this called?
- A) An evil twin attack
- B) A deauthentication flood only
- C) A bluesnarfing attack
- D) A reflection attack

**Answer: A**
An evil twin is a malicious AP cloning a trusted SSID to harvest associations and intercept traffic. Deauth attacks often accompany it to force clients onto the twin.
<!-- {"id":"COMPTIA-NET-009-Q195","objective":"4.2","type":"recall","source":"OBJN9","locator":"Objective 4.2 evil twin","verified":"2026-10-10"} -->

---

### Q196
Employees receive email mimicking the CEO asking for gift-card purchases. Several comply. What attack vector succeeded, and what most reduces it?
- A) Social engineering (phishing/spear phishing); user training plus verification procedures
- B) A buffer overflow; patching
- C) A DDoS; rate limiting
- D) MAC flooding; port security

**Answer: A**
This is targeted social engineering exploiting trust and urgency. Technical filters help, but trained users and out-of-band verification of unusual requests are the durable defense.
<!-- {"id":"COMPTIA-NET-009-Q196","objective":"4.2","type":"diagnosis","source":"OBJN9","locator":"Objective 4.2 social engineering","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q197
An attacker on the guest VLAN crafts double-tagged frames that get delivered onto the voice VLAN. Which attack is this?
- A) DNS cache poisoning
- B) An on-path TLS attack
- C) VLAN hopping via double tagging
- D) ARP poisoning

**Answer: C**
Double tagging exploits native-VLAN handling to smuggle frames into another VLAN. Mitigations: set unused native VLANs, avoid putting user ports on the native VLAN, and disable negotiation on access ports.
<!-- {"id":"COMPTIA-NET-009-Q197","objective":"4.2","type":"diagnosis","source":"OBJN9","locator":"Objective 4.2 VLAN hopping","verified":"2026-10-10"} -->

---

### Q198
A resolver's cache is poisoned so bank.com resolves to a lookalike site harvesting credentials. Which attack and which defense pair correctly?
- A) ARP spoofing; DHCP snooping
- B) MAC flooding; storm control
- C) Phishing; SPF
- D) DNS cache poisoning; DNSSEC validation

**Answer: D**
Cache poisoning inserts false records into resolvers. DNSSEC signs zone data so validating resolvers reject forged answers, addressing the integrity gap in plain DNS.
<!-- {"id":"COMPTIA-NET-009-Q198","objective":"4.2","type":"recall","source":"OBJN9","locator":"Objective 4.2 DNS poisoning, DNSSEC","verified":"2026-10-10"} -->

---

### Q199
Attackers bounce small queries with a spoofed source off open DNS resolvers, which send large answers to the victim, magnifying traffic 50x. What is this technique?
- A) Round-robin DNS
- B) DNS amplification/reflection
- C) DNS tunneling
- D) Zone transfer

**Answer: B**
Amplification attacks exploit UDP services whose responses dwarf the requests, reflecting volume at a spoofed victim. Filtering spoofed sources (BCP 38) and rate limiting resolvers mitigate it.
<!-- {"id":"COMPTIA-NET-009-Q199","objective":"4.2","type":"recall","source":"OBJN9","locator":"Objective 4.2 amplification attacks","verified":"2026-10-10"} -->

---

### Q200
Malware exfiltrates data by encoding it inside a stream of ordinary-looking name queries to an attacker-controlled domain. What is this channel?
- A) ARP poisoning
- B) VLAN hopping
- C) MAC spoofing
- D) DNS tunneling

**Answer: D**
DNS tunneling smuggles data in queries and responses, abusing the fact that DNS is rarely blocked. Detection relies on inspecting query patterns, volumes, and entropy at resolvers.
<!-- {"id":"COMPTIA-NET-009-Q200","objective":"4.2","type":"recall","source":"OBJN9","locator":"Objective 4.2 DNS tunneling","verified":"2026-10-10"} -->

---

### Q201
A wired port must allow only the one known device plugged into it and shut down if anything else connects. Which feature enforces this?
- A) Port mirroring
- B) LACP
- C) Port security with a maximum of one learned/static MAC
- D) Storm control

**Answer: C**
Port security binds a port to permitted MAC addresses and can err-disable on violation, stopping rogue devices at the jack. Storm control limits broadcast rates; it does not identify devices.
<!-- {"id":"COMPTIA-NET-009-Q201","objective":"4.3","type":"recall","source":"OBJN9","locator":"Objective 4.3 port security","verified":"2026-10-10"} -->

---

### Q202
A company requires every wired and wireless user to authenticate with credentials or certificates before their port passes traffic. Which standard provides this?
- A) 802.3af PoE
- B) 802.11ac Wi-Fi
- C) 802.1X port-based network access control
- D) 802.1Q trunking

**Answer: C**
802.1X keeps a port closed until the supplicant authenticates via the RADIUS-backed authenticator. It is the foundation of enterprise NAC on both wired and wireless networks.
<!-- {"id":"COMPTIA-NET-009-Q202","objective":"4.3","type":"recall","source":"OBJN9","locator":"Objective 4.3 802.1X","verified":"2026-10-10"} -->

---

### Q203
In an 802.1X deployment, which role does the switch play?
- A) The authenticator, relaying credentials between supplicant and authentication server
- B) The supplicant requesting access
- C) The RADIUS database itself
- D) The certificate authority

**Answer: A**
The three 802.1X roles: supplicant (client), authenticator (switch/AP enforcing the port), authentication server (RADIUS validating credentials). Knowing the roles speeds up troubleshooting failed authentications.
<!-- {"id":"COMPTIA-NET-009-Q203","objective":"4.3","type":"recall","source":"OBJN9","locator":"Objective 4.3 802.1X roles","verified":"2026-10-10"} -->

---

### Q204
A firewall rulebase lists: permit tcp 443 to the web server, permit tcp 25 to the mail server, then a final silent rule dropping everything else. What is the final rule called?
- A) A QoS rule
- B) An implicit (or explicit) deny-all at the end of the list
- C) A permit-any rule
- D) A NAT rule

**Answer: B**
Firewalls evaluate rules top-down and end with deny-all, explicit or implicit. Everything not expressly permitted is blocked: the default-deny posture that least-privilege networking is built on.
<!-- {"id":"COMPTIA-NET-009-Q204","objective":"4.3","type":"recall","source":"OBJN9","locator":"Objective 4.3 firewall rules, implicit deny","verified":"2026-10-10"} -->

---

### Q205
A rule permits "any source to the database server on 1433" from the entire network including guests. How should it be rewritten under least privilege?
- A) Permit only the application servers' addresses to the database port
- B) Keep any-any but log it
- C) Move the rule to the bottom
- D) Change the port to 1434

**Answer: A**
Scoping sources to only the systems that legitimately need the service removes every other path, guest networks included. Logging a bad rule does not narrow exposure; rule order does not fix breadth.
<!-- {"id":"COMPTIA-NET-009-Q205","objective":"4.3","type":"diagnosis","source":"OBJN9","locator":"Objective 4.3 ACL least privilege","verified":"2026-10-10"} -->

---

### Q206
A guest network's captive portal must not let unauthenticated devices reach anything but the portal itself. Which NAC behavior applies?
- A) Full VLAN access first, checks later
- B) Disabling the firewall for guests
- C) Static routes to internal servers
- D) A pre-admission (quarantine/remediation) role with minimal access until posture/identity checks pass

**Answer: D**
NAC places unknown devices in a restricted pre-admission state: enough access to authenticate or remediate, nothing more. Full access comes only after the checks pass.
<!-- {"id":"COMPTIA-NET-009-Q206","objective":"4.3","type":"recall","source":"OBJN9","locator":"Objective 4.3 NAC quarantine","verified":"2026-10-10"} -->

---

### Q207
A wireless upgrade replaces WPA2 with the newest standard that protects against offline dictionary attacks on the passphrase. Which standard and feature deliver this?
- A) WEP with longer keys
- B) WPA with TKIP
- C) Open authentication with a captive portal
- D) WPA3 with SAE (Simultaneous Authentication of Equals)

**Answer: D**
WPA3-Personal replaces the PSK handshake with SAE, so captured handshakes cannot be cracked offline, and adds forward secrecy. WEP and TKIP are broken or obsolete.
<!-- {"id":"COMPTIA-NET-009-Q207","objective":"4.3","type":"recall","source":"OBJN9","locator":"Objective 4.3 WPA3 SAE","verified":"2026-10-10"} -->

---

### Q208
An enterprise WLAN wants per-user credentials instead of one shared passphrase, with revoked employees losing access instantly. Which mode fits?
- A) MAC filtering only
- B) WPA-Enterprise (802.1X/EAP against RADIUS)
- C) WPA-Personal (shared PSK)
- D) WEP shared-key

**Answer: B**
Enterprise mode authenticates each user via 802.1X/EAP to RADIUS: individual credentials, instant revocation, and accountability. A shared PSK stays valid for everyone who ever knew it.
<!-- {"id":"COMPTIA-NET-009-Q208","objective":"4.3","type":"recall","source":"OBJN9","locator":"Objective 4.3 WPA-Enterprise","verified":"2026-10-10"} -->

---

### Q209
A filter permits outbound connections and their replies but blocks unsolicited inbound connections by tracking session state. What kind of firewall behavior is this?
- A) Stateful inspection
- B) Stateless packet filtering
- C) Static NAT
- D) MAC filtering

**Answer: A**
Stateful firewalls track flows and allow return traffic automatically while blocking new unsolicited connections. Stateless filters evaluate each packet alone and need paired rules for replies.
<!-- {"id":"COMPTIA-NET-009-Q209","objective":"4.3","type":"recall","source":"OBJN9","locator":"Objective 4.3 stateful vs stateless","verified":"2026-10-10"} -->

---

### Q210
A next-generation firewall blocks file-sharing applications regardless of which port they use, and decrypts TLS for inspection under policy. Which capabilities distinguish it from a classic firewall? (Choose two.)
- A) Application-layer (Layer 7) identification and control
- B) TLS inspection under policy
- C) MAC address learning
- D) Spanning-tree participation
- E) DHCP relay

**Correct Answer: A, B**
NGFWs classify applications independent of port and can inspect encrypted streams per policy, extending control beyond address/port tuples. MAC learning and STP are switch functions.
<!-- {"id":"COMPTIA-NET-009-Q210","objective":"4.3","type":"recall","source":"OBJN9","locator":"Objective 4.3 NGFW capabilities","verified":"2026-10-10"} -->

---

### Q211
A switch feature validates ARP replies against the DHCP binding table before forwarding them, blocking forged gateway replies. What is it?
- A) Port mirroring
- B) BPDU guard
- C) Dynamic ARP inspection
- D) Storm control

**Answer: C**
Dynamic ARP inspection checks ARP traffic against the DHCP-snooping binding table and drops forgeries, directly countering ARP-poisoning attacks. It depends on DHCP snooping being enabled.
<!-- {"id":"COMPTIA-NET-009-Q211","objective":"4.3","type":"recall","source":"OBJN9","locator":"Objective 4.3 dynamic ARP inspection","verified":"2026-10-10"} -->

---

### Q212
DHCP snooping is enabled on access switches. What two things does it do?
- A) Blocks DHCP server responses from untrusted ports and builds the IP-MAC-port binding table
- B) Assigns addresses itself and routes them
- C) Encrypts DHCP traffic end to end
- D) Replaces the DHCP server entirely

**Answer: A**
Snooping trusts server responses only on designated uplinks, stopping rogue DHCP, and its binding table feeds dynamic ARP inspection and IP source guard. It changes no encryption and no server logic.
<!-- {"id":"COMPTIA-NET-009-Q212","objective":"4.3","type":"recall","source":"OBJN9","locator":"Objective 4.3 DHCP snooping","verified":"2026-10-10"} -->

---

### Q213
A remote admin needs full network access as if on-site, over an encrypted tunnel through the internet. Which technology provides this?
- A) Port forwarding of Telnet
- B) An open proxy
- C) A second ISP
- D) A remote-access VPN (IPsec or TLS based)

**Answer: D**
Remote-access VPNs authenticate the user and encrypt their traffic to a concentrator, extending the internal network to them safely. Exposing management protocols directly is the insecure alternative this replaces.
<!-- {"id":"COMPTIA-NET-009-Q213","objective":"4.3","type":"recall","source":"OBJN9","locator":"Objective 4.3 remote-access VPN","verified":"2026-10-10"} -->

---

### Q214
Two offices exchange private traffic over the internet through a persistent encrypted tunnel between their firewalls. What is this called?
- A) A site-to-site VPN
- B) A remote-access VPN
- C) An SSL portal for bookmarks
- D) A VLAN

**Answer: A**
Site-to-site VPNs link networks via gateway-to-gateway tunnels, transparent to hosts. Remote-access VPNs serve individual users; portals proxy specific web apps.
<!-- {"id":"COMPTIA-NET-009-Q214","objective":"4.3","type":"recall","source":"OBJN9","locator":"Objective 4.3 site-to-site VPN","verified":"2026-10-10"} -->

---

### Q215
A security policy restricts a payroll app's network access to devices physically inside the country, enforced at the VPN gateway. What is this control?
- A) MAC filtering
- B) DHCP snooping
- C) Port aggregation
- D) Geofencing/geolocation policy

**Answer: D**
Geolocation policies permit or deny access based on where the connection originates, reducing exposure to foreign attack infrastructure. It complements, but never replaces, authentication.
<!-- {"id":"COMPTIA-NET-009-Q215","objective":"4.3","type":"recall","source":"OBJN9","locator":"Objective 4.3 geofencing","verified":"2026-10-10"} -->

---

### Q216
A small shop secures its Wi-Fi by listing allowed device MAC addresses on the AP. Why is this only a weak control?
- A) It breaks DHCP
- B) It halves throughput
- C) MAC addresses are trivially observed and spoofed
- D) MAC addresses expire hourly

**Answer: C**
MAC filtering blocks only casual connections; attackers sniff permitted MACs and clone them. It is a speed bump, not a substitute for WPA2/WPA3 encryption and 802.1X.
<!-- {"id":"COMPTIA-NET-009-Q216","objective":"4.3","type":"recall","source":"OBJN9","locator":"Objective 4.3 MAC filtering limits","verified":"2026-10-10"} -->

---

### Q217
An IDS alerts on a pattern matching a known exploit's byte sequence in web requests. What detection method fired?
- A) Anomaly-based detection
- B) Honeypot capture
- C) Manual log review
- D) Signature-based detection

**Answer: D**
Signature detection matches traffic against known-attack patterns: precise and low-false-positive for known threats, blind to novel ones. Anomaly detection flags deviations from baselines instead.
<!-- {"id":"COMPTIA-NET-009-Q217","objective":"4.3","type":"recall","source":"OBJN9","locator":"Objective 4.3 IDS signature detection","verified":"2026-10-10"} -->

---

### Q218
After moving from IDS to inline IPS, a false positive starts blocking a legitimate payroll application. What is the tradeoff the team accepted?
- A) IPS only works on wireless
- B) Inline prevention can impact production traffic, so rules need tuning and staged rollout
- C) IPS devices cannot log
- D) IPS removes the need for firewalls

**Answer: B**
Prevention sits in the traffic path: its mistakes become outages. Staged deployment, tuned signatures, and exception processes balance protection against availability, which is why many teams start in detect-only mode.
<!-- {"id":"COMPTIA-NET-009-Q218","objective":"4.3","type":"diagnosis","source":"OBJN9","locator":"Objective 4.3 IPS tuning tradeoffs","verified":"2026-10-10"} -->

---

### Q219
A company wants all outbound web traffic filtered by category with malware scanning, without touching endpoint settings at each site. Which solution fits?
- A) Longer DHCP leases
- B) Static ARP entries
- C) A secure web gateway (cloud or on-premises proxy)
- D) A bigger firewall NAT table

**Answer: C**
Secure web gateways centralize URL filtering, malware inspection, and policy for web traffic, often delivered as a cloud service that branch traffic tunnels to: one policy point for all sites.
<!-- {"id":"COMPTIA-NET-009-Q219","objective":"4.3","type":"recall","source":"OBJN9","locator":"Objective 4.3 secure web gateway","verified":"2026-10-10"} -->

---

### Q220
A bank requires admins to authenticate to network devices with hardware tokens validated centrally, with full command logging. Which protocol family supports this device administration model?
- A) NetFlow
- B) LLDP
- C) TACACS+ (AAA for device administration)
- D) SNMPv2

**Answer: C**
TACACS+ centralizes authentication, authorization, and accounting for device administration, including per-command authorization and logging. RADIUS is the alternative more common for network-access authentication.
<!-- {"id":"COMPTIA-NET-009-Q220","objective":"4.3","type":"recall","source":"OBJN9","locator":"Objective 4.3 TACACS+ vs RADIUS","verified":"2026-10-10"} -->

---

### Q221
A certificate warning appears for an internal site because the cert was issued by an authority the PCs do not trust. What is the fix for company-managed machines?
- A) Deploy the internal CA's root certificate to the managed devices' trust stores
- B) Tell users to click through warnings
- C) Disable TLS on the site
- D) Change the site's IP

**Answer: A**
Internal PKI works when endpoints trust the internal root. Training users to bypass warnings defeats the entire purpose of certificate validation and invites real man-in-the-middle attacks.
<!-- {"id":"COMPTIA-NET-009-Q221","objective":"4.3","type":"diagnosis","source":"OBJN9","locator":"Objective 4.3 PKI trust stores","verified":"2026-10-10"} -->

---

### Q222
A decommissioned wireless controller's config contained the WPA passphrase for the old SSID. Before resale, what must happen?
- A) Change the SSID on the new controller
- B) Nothing; resold gear wipes itself
- C) Secure wiping/factory reset per policy so credentials and configs leave with it
- D) Delete the DHCP scope only

**Answer: C**
Device disposal is a security process: configurations hold credentials, keys, and topology that aid attackers. Policy-driven wiping or destruction prevents data leaving with the hardware.
<!-- {"id":"COMPTIA-NET-009-Q222","objective":"4.3","type":"recall","source":"OBJN9","locator":"Objective 4.3 secure disposal","verified":"2026-10-10"} -->

---

### Q223
An attacker walks behind an employee through a badge-controlled door without presenting credentials. What is this technique?
- A) Phishing
- B) Shoulder surfing
- C) Wardriving
- D) Tailgating

**Answer: D**
Tailgating exploits courtesy and physical trust to bypass badge controls. It pairs with policy (challenge unknown followers) and physical controls (turnstiles, mantraps) as defenses.
<!-- {"id":"COMPTIA-NET-009-Q223","objective":"4.2","type":"recall","source":"OBJN9","locator":"Objective 4.2 physical social engineering","verified":"2026-10-10"} -->

---

### Q224
An external scan of the company finds RDP (3389) open to the internet on several servers. What is the appropriate response?
- A) Close internet exposure; require VPN or a brokered gateway for remote administration
- B) Move RDP to port 3390 and call it done
- C) Disable the firewall entirely
- D) Change the admin username

**Answer: A**
Internet-exposed remote administration is a top breach vector for brute force and exploits. Restricting it behind VPN or a dedicated gateway removes the exposure; port shuffling is cosmetic.
<!-- {"id":"COMPTIA-NET-009-Q224","objective":"4.3","type":"diagnosis","source":"OBJN9","locator":"Objective 4.3 exposure reduction","verified":"2026-10-10"} -->

---

### Q225
A server team asks why the network ACL blocks their new app's health checks from the load balancer. What information resolves this fastest?
- A) The exact source addresses and ports the health checks use, added as a scoped rule
- B) The app's logo
- C) The rack elevation
- D) The printer's IP

**Answer: A**
Health checks are traffic like any other: they need permitted flows from the balancer's addresses to the service port. Scoping the rule to exactly that flow keeps the ACL tight while restoring function.
<!-- {"id":"COMPTIA-NET-009-Q225","objective":"4.3","type":"diagnosis","source":"OBJN9","locator":"Objective 4.3 ACL scoping health checks","verified":"2026-10-10"} -->

---

### Q226
A password spray attack tries one common password against thousands of accounts to avoid lockouts. Which two controls most directly blunt it? (Choose two.)
- A) Multifactor authentication
- B) Smart lockout/rate limiting and detection of distributed attempts
- C) Shorter usernames
- D) Annual password changes only
- E) A larger DHCP scope

**Correct Answer: A, B**
MFA neutralizes a guessed password by requiring a second factor; lockout and detection logic tuned for distributed, low-and-slow attempts catches the pattern. Password rotation alone does not stop a correct guess.
<!-- {"id":"COMPTIA-NET-009-Q226","objective":"4.2","type":"diagnosis","source":"OBJN9","locator":"Objective 4.2 password attacks, defenses","verified":"2026-10-10"} -->

---

### Q227
Logs show one internal host scanning every address in the subnet on port 445 in seconds. What does this pattern indicate?
- A) A backup job
- B) A print job
- C) Likely worm propagation or lateral movement from a compromised host
- D) Normal DHCP behavior

**Answer: C**
Rapid sequential connection attempts across many hosts on a file-sharing port is classic worm/lateral-movement behavior. The host should be isolated and investigated under the incident process.
<!-- {"id":"COMPTIA-NET-009-Q227","objective":"4.2","type":"diagnosis","source":"OBJN9","locator":"Objective 4.2 lateral movement indicators","verified":"2026-10-10"} -->

---

### Q228
A security audit recommends disabling unused switch ports and placing them in a dead-end VLAN. What attack does this blunt?
- A) DNS amplification
- B) Certificate expiry
- C) DDoS from the internet
- D) Unauthorized device attachment through open jacks

**Answer: D**
Disabled or dead-ended ports turn open jacks into nothing: a rogue device gets no network. Combined with port security and 802.1X, it closes the walk-up attack path.
<!-- {"id":"COMPTIA-NET-009-Q228","objective":"4.3","type":"recall","source":"OBJN9","locator":"Objective 4.3 unused port hardening","verified":"2026-10-10"} -->

---

### Q229
A cloud security group blocks a new microservice's calls to the database even though the network ACL allows them. What layering principle explains the failure?
- A) Both instance-level and subnet-level controls must permit the flow; the most restrictive layer wins
- B) Security groups replace ACLs entirely
- C) ACLs only apply on Tuesdays
- D) Databases ignore security groups

**Answer: A**
Cloud networking stacks controls: security lists/ACLs at subnets, security groups at instances. A flow needs permission at every applicable layer, so debugging checks each one, not just the first.
<!-- {"id":"COMPTIA-NET-009-Q229","objective":"4.3","type":"diagnosis","source":"OBJN9","locator":"Objective 4.3 layered cloud controls","verified":"2026-10-10"} -->

---

### Q230
A company wants contractors' devices to reach only a specific VDI environment, never the internal LAN, even when on-site. Which design achieves this?
- A) MAC randomization
- B) A dedicated contractor VLAN/SSID with ACLs permitting only the VDI gateways
- C) The corporate SSID with a polite request
- D) A shared admin password

**Answer: B**
Role-appropriate access comes from segmentation: contractor traffic lands in its own zone whose policy permits exactly the sanctioned destination. Trust-based requests are not enforceable controls.
<!-- {"id":"COMPTIA-NET-009-Q230","objective":"4.3","type":"diagnosis","source":"OBJN9","locator":"Objective 4.3 role-based segmentation","verified":"2026-10-10"} -->

---

### Q231
A wireless intrusion system flags an AP broadcasting the corporate SSID from the parking lot, not connected to the wired network. What two responses apply? (Choose two.)
- A) Locate it via signal tracing and remove it
- B) Confirm whether it is an evil twin harvesting credentials and force re-authentication
- C) Rename the corporate SSID to hide
- D) Disable all corporate APs
- E) Lower all AP power to zero

**Correct Answer: A, B**
A rogue AP off the wired plant is physically located and removed; if it imitated the corporate SSID, credential theft is possible, so treat it as an evil twin incident. Renaming or killing the real WLAN punishes users, not the attacker.
<!-- {"id":"COMPTIA-NET-009-Q231","objective":"4.2","type":"diagnosis","source":"OBJN9","locator":"Objective 4.2 rogue AP response","verified":"2026-10-10"} -->

---

### Q232
A vulnerability scanner flags switches running SSHv1. What is the required change?
- A) Move SSH to port 23
- B) Enforce SSHv2 only and regenerate keys if needed
- C) Switch to Telnet
- D) Disable SSH entirely

**Answer: B**
SSHv1 has known cryptographic weaknesses; SSHv2 is the supported secure version. Disabling remote management or reverting to Telnet trades one weakness for a worse one.
<!-- {"id":"COMPTIA-NET-009-Q232","objective":"4.3","type":"recall","source":"OBJN9","locator":"Objective 4.3 SSH version hardening","verified":"2026-10-10"} -->

---

### Q233
A risk assessment lists the probability and impact of a fiber cut, a ransomware event, and a flood, with mitigations for each. Which process produced this?
- A) A bake-off
- B) Risk assessment/management
- C) Cable certification
- D) Penetration pricing

**Answer: B**
Risk management identifies threats, scores likelihood and impact, and chooses mitigations. It is the planning discipline that decides where security and redundancy budget goes.
<!-- {"id":"COMPTIA-NET-009-Q233","objective":"4.1","type":"recall","source":"OBJN9","locator":"Objective 4.1 risk assessment","verified":"2026-10-10"} -->

---

### Q234
After a breach, the team follows a documented sequence: detect, contain, eradicate, recover, and learn. What framework are they executing?
- A) Asset discovery
- B) Incident response process
- C) Change management
- D) Capacity planning

**Answer: B**
Incident response is the disciplined handling of security events from detection through lessons learned. Having it documented and rehearsed is what separates a bad day from a catastrophe.
<!-- {"id":"COMPTIA-NET-009-Q234","objective":"4.1","type":"recall","source":"OBJN9","locator":"Objective 4.1 incident response","verified":"2026-10-10"} -->

---

### Q235
A forensic analyst needs the network's role in preserving evidence: device logs and captures retained unaltered for the investigation. What practice applies?
- A) Log rotation every hour
- B) Rebooting affected devices first
- C) Editing timestamps for clarity
- D) Chain of custody and log preservation under the incident plan

**Answer: D**
Evidence value depends on integrity: preserved logs, documented handling, and no contamination. Rebooting or rotating logs destroys the volatile evidence investigations depend on.
<!-- {"id":"COMPTIA-NET-009-Q235","objective":"4.1","type":"recall","source":"OBJN9","locator":"Objective 4.1 forensics, chain of custody","verified":"2026-10-10"} -->

---

### Q236
A DDoS mitigation service absorbs attack traffic in the cloud before it reaches the company's link. Why is upstream scrubbing necessary rather than a bigger local firewall?
- A) Once attack traffic fills the access link, no on-premises device can help; mitigation must happen before the bottleneck
- B) Local firewalls cannot block UDP
- C) Cloud services are always free
- D) The firewall needs a rest

**Answer: A**
DDoS defense is about where the traffic is stopped. If the circuit is saturated, the battle is already lost locally; scrubbing centers and CDNs absorb volume upstream of the constraint.
<!-- {"id":"COMPTIA-NET-009-Q236","objective":"4.3","type":"diagnosis","source":"OBJN9","locator":"Objective 4.3 DDoS mitigation placement","verified":"2026-10-10"} -->

---

### Q237
A network uses ACLs on switches to stop user VLANs from initiating connections to server management ports, while allowing established return traffic. What type of ACL feature handles the return traffic?
- A) A longer ACL name
- B) A lower sequence number
- C) MAC learning
- D) Stateful/reflexive behavior or "established" matching in the ACL

**Answer: D**
Permitting only established sessions back lets outbound flows work while blocking inbound initiation. Stateless ACLs otherwise need careful paired rules, which is error-prone at scale.
<!-- {"id":"COMPTIA-NET-009-Q237","objective":"4.3","type":"recall","source":"OBJN9","locator":"Objective 4.3 ACL established traffic","verified":"2026-10-10"} -->

---

### Q238
A security team deploys client certificates on laptops so the network can verify device identity at 802.1X time. What advantage does certificate-based EAP add over password-based methods?
- A) Longer passwords
- B) Faster roaming by 50%
- C) No need for RADIUS
- D) Mutual authentication and resistance to credential phishing/replay

**Answer: D**
Certificate EAP methods authenticate both ends and leave no reusable password to phish or replay. They still ride on the same 802.1X/RADIUS framework, with stronger credentials.
<!-- {"id":"COMPTIA-NET-009-Q238","objective":"4.3","type":"recall","source":"OBJN9","locator":"Objective 4.3 EAP certificate methods","verified":"2026-10-10"} -->

---

### Q239
An auditor asks how the company knows its firewall rules still match business needs. What process answers this?
- A) Adding rules on request without review
- B) Periodic rulebase reviews that recertify, tighten, or remove rules
- C) Never changing the rules
- D) Deleting old logs

**Answer: B**
Rulebases accrete: temporary rules become permanent and exceptions pile up. Scheduled recertification with business owners keeps the enforced policy aligned with actual need and shrinks exposure over time.
<!-- {"id":"COMPTIA-NET-009-Q239","objective":"4.1","type":"recall","source":"OBJN9","locator":"Objective 4.1 firewall rule review","verified":"2026-10-10"} -->

---

### Q240
A zero-day exploit hits before signatures exist, but the IDS still flags the affected server for talking to an unfamiliar external host at 3 AM with unusual volume. Which detection approach caught it?
- A) Static NAT
- B) Anomaly/behavior-based detection against the baseline
- C) Signature matching
- D) MAC filtering

**Answer: B**
Behavioral detection compares activity to learned norms and flags deviation, which is how novel attacks surface without signatures. It complements signature detection, which only sees the known.
<!-- {"id":"COMPTIA-NET-009-Q240","objective":"4.3","type":"diagnosis","source":"OBJN9","locator":"Objective 4.3 anomaly detection","verified":"2026-10-10"} -->

---
