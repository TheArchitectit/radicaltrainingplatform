# CompTIA Network+ (N10-009) Practice Questions - Part 5
# Original study items. Independent material, not official or endorsed by CompTIA.

## DOMAIN 5: Network Troubleshooting (study allocation)

---

### Q241
A technician fixes a user's connectivity problem and then documents the fix and updates the knowledge base. Which methodology step is this?
- A) Implement the solution
- B) Document findings, actions, and outcomes, the final step
- C) Identify the problem
- D) Establish a theory

**Answer: B**
Documentation closes the loop: the fix becomes findable for the next occurrence, and change records stay accurate. Skipping it guarantees re-diagnosing the same issue later.
<!-- {"id":"COMPTIA-NET-009-Q241","objective":"5.1","type":"recall","source":"OBJN9","locator":"Objective 5.1 troubleshooting methodology","verified":"2026-10-10"} -->

---

### Q242
Before changing anything, a tech asks the user what changed recently, when it started, and whether others are affected. Which methodology step is this?
- A) Gathering information to identify the problem
- B) Escalating immediately
- C) Reinstalling the OS
- D) Testing the theory

**Answer: A**
Structured questioning (scope, timing, recent changes, who else is affected) builds the problem definition that every later step depends on. Guessing before gathering wastes time and risks damage.
<!-- {"id":"COMPTIA-NET-009-Q242","objective":"5.1","type":"recall","source":"OBJN9","locator":"Objective 5.1 identify the problem","verified":"2026-10-10"} -->

---

### Q243
A tech's first theory (bad cable) is disproven when a known-good cable shows the same fault. What comes next?
- A) Give up and close the ticket
- B) Replace the whole PC
- C) Blame the user
- D) Establish a new theory or escalate, per the methodology

**Answer: D**
The methodology is iterative: a disproven theory means forming the next most probable one, testing it, and escalating when the problem exceeds your scope or authority. Persistence within structure, not improvisation.
<!-- {"id":"COMPTIA-NET-009-Q243","objective":"5.1","type":"diagnosis","source":"OBJN9","locator":"Objective 5.1 test theory, re-establish","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q244
A proposed fix requires rebooting a production switch during business hours. What should the technician do before acting?
- A) Ignore the fix
- B) Unplug a random cable instead
- C) Consider corporate impact, get approval through change processes, and plan rollback
- D) Reboot immediately and apologize later

**Answer: C**
Fixes that affect others require impact assessment and authorization. The methodology's implementation step includes verifying the plan with stakeholders and having a way back, not cowboy changes on production.
<!-- {"id":"COMPTIA-NET-009-Q244","objective":"5.1","type":"diagnosis","source":"OBJN9","locator":"Objective 5.1 plan of action, approvals","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q245
After applying a fix, the tech confirms the user's app works and checks that nothing else broke. Which step is this?
- A) Verify full system functionality and implement preventive measures
- B) Establish a theory of probable cause
- C) Identify the problem
- D) Duplicate the problem

**Answer: A**
Verification proves the fix worked and caused no collateral damage; prevention keeps it from recurring. Closing without verification is how "fixed" tickets reopen.
<!-- {"id":"COMPTIA-NET-009-Q245","objective":"5.1","type":"recall","source":"OBJN9","locator":"Objective 5.1 verify functionality","verified":"2026-10-10"} -->

---

### Q246
Ten users on one switch report the same outage while other floors are fine. What does this scope information tell the tech first?
- A) Look at shared infrastructure (that switch/uplink) rather than individual PCs
- B) Reimage all ten PCs
- C) Replace ten cables one at a time
- D) Check one user's browser settings

**Answer: A**
Scope divides individual from systemic faults. Multiple simultaneous victims on shared gear point at the common element first: the switch, its uplink, or its power.
<!-- {"id":"COMPTIA-NET-009-Q246","objective":"5.1","type":"diagnosis","source":"OBJN9","locator":"Objective 5.1 scope analysis","verified":"2026-10-10"} -->

---

### Q247
A user says "the internet is down." The tech discovers only one HTTPS site fails while others load. What did this narrowing accomplish?
- A) It showed the cable was bad
- B) It redefined the problem from connectivity to a specific application/service path
- C) Nothing; the internet was down
- D) It proved DNS was fine

**Answer: B**
User reports are symptoms, not diagnoses. Testing the general claim (other sites work) narrows the real fault domain, focusing effort on the one failing service or its path.
<!-- {"id":"COMPTIA-NET-009-Q247","objective":"5.1","type":"diagnosis","source":"OBJN9","locator":"Objective 5.1 problem narrowing","verified":"2026-10-10"} -->

---

### Q248
A problem exceeds the tech's access level: the fault is on the ISP side of the demarc. What is the correct methodology move?
- A) Factory reset the router
- B) Escalate to the appropriate party with the evidence gathered
- C) Keep guessing for days
- D) Close the ticket as fixed

**Answer: B**
Escalation is a methodology step, not a failure. Handing off with a clear problem statement and test results makes the next tier effective immediately.
<!-- {"id":"COMPTIA-NET-009-Q248","objective":"5.1","type":"recall","source":"OBJN9","locator":"Objective 5.1 escalation","verified":"2026-10-10"} -->

---

### Q249
A link light is dark on a new drop. The cable tests good, and the switch port is enabled. What is the next physical-layer check?
- A) Renew the DHCP lease
- B) Flush DNS
- C) Verify the patch panel-to-switch patching and try a known-good switch port
- D) Replace the NIC driver

**Answer: C**
No link light is a Layer 1 problem, so the hunt stays physical: panel patching, the outlet, the switch port itself. Software and addressing fixes cannot light a dead link.
<!-- {"id":"COMPTIA-NET-009-Q249","objective":"5.2","type":"diagnosis","source":"OBJN9","locator":"Objective 5.2 physical troubleshooting","verified":"2026-10-10"} -->

---

### Q250
A cable tester shows pairs 1-2 swapped with 3-6 on one end only. What kind of fault is this, and what is the fix?
- A) A NEXT fault; untwist more
- B) An open fault; replace the switch
- C) A wiremap fault at one termination; re-terminate the bad end to the correct standard
- D) An attenuation fault; shorten the run

**Answer: C**
Wiremap tests reveal mis-pinned conductors. A swap at one end means that termination was punched wrong; re-terminating to the matching standard fixes it. Attenuation and NEXT are signal-quality, not pinout, faults.
<!-- {"id":"COMPTIA-NET-009-Q250","objective":"5.2","type":"diagnosis","source":"OBJN9","locator":"Objective 5.2 wiremap faults","verified":"2026-10-10"} -->

---

### Q251
A fiber link shows high loss on the light meter. The connectors look fine from outside. What is the most likely next step?
- A) Reboot the server
- B) Inspect and clean the fiber end-faces with proper tools, then retest
- C) Replace the switch
- D) Change the VLAN

**Answer: B**
Contaminated end-faces are the most common fiber fault; microscopic dust causes real loss. Inspection microscopes and one-click cleaners resolve most cases before any hardware replacement.
<!-- {"id":"COMPTIA-NET-009-Q251","objective":"5.2","type":"diagnosis","source":"OBJN9","locator":"Objective 5.2 fiber cleaning","verified":"2026-10-10"} -->

---

### Q252
A transceiver shows RX power far below the receiver sensitivity spec, though the link is up intermittently. What does this predict?
- A) An unstable link heading for failure: investigate loss (dirty connectors, bends, wrong optics for distance)
- B) Nothing; light levels are cosmetic
- C) A DNS issue
- D) A duplex mismatch

**Answer: A**
Optical receive levels below sensitivity produce errors and flapping. Digital optical monitoring values give early warning; the causes are physical: contamination, macro-bends, or optics mismatched to the span.
<!-- {"id":"COMPTIA-NET-009-Q252","objective":"5.2","type":"diagnosis","source":"OBJN9","locator":"Objective 5.2 optical power levels","verified":"2026-10-10"} -->

---

### Q253
A workstation's Ethernet negotiates at 100 Mbps instead of 1 Gbps, and one pair shows open on the tester. Why does it still work at all?
- A) The switch is being polite
- B) The OS compensates
- C) 100BASE-TX needs only two pairs; the fault disables gigabit, which needs all four
- D) Gigabit uses one pair

**Answer: C**
Two-pair operation explains degraded-but-working links perfectly. A single open pair forces the fallback to 100 Mbps, making speed downgrade a diagnostic clue for pair faults.
<!-- {"id":"COMPTIA-NET-009-Q253","objective":"5.2","type":"diagnosis","source":"OBJN9","locator":"Objective 5.2 pair faults and speed","verified":"2026-10-10"} -->

---

### Q254
A PoE camera is dead. The switch port shows "PoE denied" in the logs. What are the two most likely causes? (Choose two.)
- A) The switch's PoE power budget is exhausted
- B) The device requests a class the port does not deliver
- C) The camera's DNS is wrong
- D) The VLAN is missing
- E) The SSID is hidden

**Correct Answer: A, B**
PoE denial is a power negotiation problem: either no budget remains or the requested class exceeds the port standard (af/at/bt). Network settings are irrelevant when the device never powers on.
<!-- {"id":"COMPTIA-NET-009-Q254","objective":"5.2","type":"diagnosis","source":"OBJN9","locator":"Objective 5.2 PoE troubleshooting","verified":"2026-10-10"} -->

---

### Q255
Users on one AP report weak signal after furniture moved a metal cabinet next to it. Which tool confirms the RF impact?
- A) A Wi-Fi analyzer/site survey showing signal strength and noise
- B) A packet capture
- C) A tone generator
- D) A cable certifier

**Answer: A**
RF problems need RF measurement: signal, noise, and interference mapping. Metal obstructions create shadows and multipath; the analyzer quantifies it and guides AP repositioning.
<!-- {"id":"COMPTIA-NET-009-Q255","objective":"5.2","type":"diagnosis","source":"OBJN9","locator":"Objective 5.2 wireless survey tools","verified":"2026-10-10"} -->

---

### Q256
A tone generator and probe are used during a closet cleanup. What task are they for?
- A) Measuring optical loss
- B) Testing PoE voltage
- C) Certifying Cat6
- D) Tracing and identifying individual cables among bundles

**Answer: D**
Toning puts a signal on one conductor so the probe can find its other end among hundreds: the standard tool for identifying unlabeled runs. It cannot certify performance or measure light.
<!-- {"id":"COMPTIA-NET-009-Q256","objective":"5.2","type":"recall","source":"OBJN9","locator":"Objective 5.2 tone generator use","verified":"2026-10-10"} -->

---

### Q257
A switch port shows thousands of late collisions and the attached device is hard-coded full duplex. What is the mismatch and fix?
- A) The cable is fiber; replace with copper
- B) The switch autonegotiated to half duplex while the device is fixed full; set both to autonegotiate or both to matching fixed values
- C) The MTU is wrong; raise it
- D) The VLAN is wrong; rename it

**Answer: B**
Hard-coding one side disables negotiation, so the other side falls back to half duplex: the classic mismatch signature (late collisions on the full-duplex side). Consistent settings on both ends resolve it.
<!-- {"id":"COMPTIA-NET-009-Q257","objective":"5.2","type":"diagnosis","source":"OBJN9","locator":"Objective 5.2 duplex mismatch diagnosis","verified":"2026-10-10"} -->

---

### Q258
A user cannot reach internal sites by name but can by IP, while coworkers have no issue. What is the fastest targeted check on their machine?
- A) Their monitor cable
- B) The switch's spanning tree
- C) The printer driver
- D) Their configured DNS server and a test query with nslookup

**Answer: D**
Name resolution failing for one machine points at its DNS client configuration. nslookup against the configured and a known-good server isolates whether the setting or the server is at fault.
<!-- {"id":"COMPTIA-NET-009-Q258","objective":"5.3","type":"diagnosis","source":"OBJN9","locator":"Objective 5.3 DNS troubleshooting","verified":"2026-10-10"} -->

---

### Q259
After a DNS migration, some offices resolve old addresses for hours. TTL is 86400 on the records. What should have been done before the migration?
- A) Nothing; caches do not exist
- B) Lower the TTL well ahead of the cutover so caches expire quickly
- C) Raise the TTL to a week
- D) Disable caching everywhere permanently

**Answer: B**
Migration prep includes shrinking record TTLs days ahead so resolvers refresh fast at cutover, then restoring normal values after. A one-day TTL guarantees a long tail of stale answers.
<!-- {"id":"COMPTIA-NET-009-Q259","objective":"5.3","type":"diagnosis","source":"OBJN9","locator":"Objective 5.3 DNS TTL planning","verified":"2026-10-10"} -->

---

### Q260
Every client in one VLAN has an APIPA address after a power event. Clients in other VLANs are fine. What is the most likely fault?
- A) The DNS server crashed
- B) The subnet mask changed itself
- C) The DHCP relay/helper on that VLAN's router interface failed or lost configuration
- D) Every NIC failed simultaneously

**Answer: C**
APIPA across exactly one VLAN localizes the fault to what serves that VLAN: its relay path to DHCP. Other VLANs working proves the server is fine, focusing the hunt on the relay configuration and reachability.
<!-- {"id":"COMPTIA-NET-009-Q260","objective":"5.3","type":"diagnosis","source":"OBJN9","locator":"Objective 5.3 DHCP relay failure","verified":"2026-10-10"} -->

---

### Q261
A server was assigned a static IP, but now another device answers ping at that address and the server flaps. What happened?
- A) A duplex mismatch
- B) A TTL expiry
- C) An IP conflict, likely the static address also inside a DHCP pool without exclusion
- D) A DNS loop

**Answer: C**
Duplicate addresses make ARP answers race and connectivity flap. Static assignments must be excluded from DHCP scopes or made reservations; the conflict symptom points straight at address management.
<!-- {"id":"COMPTIA-NET-009-Q261","objective":"5.3","type":"diagnosis","source":"OBJN9","locator":"Objective 5.3 IP conflicts","verified":"2026-10-10"} -->

---

### Q262
A firewall change broke an application. The app team says "the network is down," but pings pass. What isolates the failing flow?
- A) Replacing the app
- B) Pinging more hosts
- C) Comparing required ports against the rulebase change and testing the specific port with a tool
- D) Rebooting the firewall blindly

**Answer: C**
Reachability is not application delivery. The fault is a blocked flow; the fix is identifying which ports the app needs and what the rule change removed. Diff the change against the requirement.
<!-- {"id":"COMPTIA-NET-009-Q262","objective":"5.3","type":"diagnosis","source":"OBJN9","locator":"Objective 5.3 blocked ports","verified":"2026-10-10"} -->

---

### Q263
VoIP calls work but audio is choppy and robotic at lunch hour. Which measurements pinpoint the problem? (Choose two.)
- A) Jitter and latency on the call path
- B) Packet loss percentage during the window
- C) The DNS TTL
- D) The subnet mask
- E) The SSID list

**Correct Answer: A, B**
Choppy real-time audio is the signature of jitter and loss under congestion. Measuring both at the bad hour, plus QoS marking checks, directs the fix. Naming and addressing settings do not cause time-varying audio quality.
<!-- {"id":"COMPTIA-NET-009-Q263","objective":"5.4","type":"diagnosis","source":"OBJN9","locator":"Objective 5.4 voice quality troubleshooting","verified":"2026-10-10"} -->

---

### Q264
A file transfer that should take seconds crawls across a site-to-site VPN but flies inside the LAN. Internet speed tests from both sites look fine. What else should be measured?
- A) Throughput, latency, and loss along the actual tunnel path (e.g., iperf and path analysis)
- B) The monitor brightness
- C) The DNS search order
- D) The cable colors

**Answer: A**
Speed tests to nearby servers miss the real path. Measuring the actual tunnel reveals MTU/fragmentation issues, ISP peering congestion, or tunnel overhead that generic tests hide.
<!-- {"id":"COMPTIA-NET-009-Q264","objective":"5.4","type":"diagnosis","source":"OBJN9","locator":"Objective 5.4 path performance testing","verified":"2026-10-10"} -->

---

### Q265
Large transfers stall while small requests succeed through a VPN tunnel, and ping with large packets fails unless fragmentation is allowed. What is the issue?
- A) A DNS failure
- B) A duplex mismatch
- C) A bad cable
- D) An MTU/MSS mismatch along the path causing fragmentation or drops

**Answer: D**
The pattern (small OK, large fails, fragmentation behavior) is the MTU fingerprint. Tunnels add headers that shrink effective MTU; clamping MSS or fixing path MTU discovery resolves it.
<!-- {"id":"COMPTIA-NET-009-Q265","objective":"5.4","type":"diagnosis","source":"OBJN9","locator":"Objective 5.4 MTU issues","verified":"2026-10-10"} -->

---

### Q266
Users report the network "feels slow" each evening. What objective evidence should be gathered first?
- A) Baseline-versus-current utilization, latency, and loss during the window
- B) Opinions from more users
- C) New cables for everyone
- D) A bigger firewall

**Answer: A**
"Feels slow" becomes actionable only as data: compare the bad window against baselines to find where the path saturates or degrades. Buying hardware before measuring guesses at the bottleneck.
<!-- {"id":"COMPTIA-NET-009-Q266","objective":"5.4","type":"diagnosis","source":"OBJN9","locator":"Objective 5.4 performance baselining","verified":"2026-10-10"} -->

---

### Q267
An iperf test between two wired PCs on the same switch shows 940 Mbps, but over the WAN it shows 12 Mbps. What does this isolate?
- A) The switch is broken
- B) Both PCs are broken
- C) DNS is slow
- D) The constraint is the WAN path, not the LAN or endpoints

**Answer: D**
Controlled throughput tests at each segment bisect the problem. Good LAN numbers with bad WAN numbers aim every next step at the circuit, provider, or tunnel rather than local gear.
<!-- {"id":"COMPTIA-NET-009-Q267","objective":"5.4","type":"diagnosis","source":"OBJN9","locator":"Objective 5.4 iperf bisection","verified":"2026-10-10"} -->

---

### Q268
Video calls drop for exactly one user on Wi-Fi; a wired test from the same desk is perfect. What is the troubleshooting conclusion?
- A) The internet is down
- B) The WAN is saturated
- C) DNS is broken
- D) The problem is specific to that user's wireless connection (signal, driver, or band), not the network core

**Answer: D**
A clean wired test from the same location exonerates the shared path and focuses on the wireless link itself: signal strength, interference, adapter, or band behavior for that one client.
<!-- {"id":"COMPTIA-NET-009-Q268","objective":"5.4","type":"diagnosis","source":"OBJN9","locator":"Objective 5.4 wireless vs wired isolation","verified":"2026-10-10"} -->

---

### Q269
Ping to the gateway succeeds, ping to an internet IP succeeds, but name resolution fails. Which tool tests the failing function directly?
- A) arp
- B) nslookup or dig against the configured DNS server
- C) tracert
- D) ipconfig

**Answer: B**
With connectivity proven, the failing layer is resolution. Querying the DNS server directly confirms whether it answers, and comparing against a public resolver splits client config from server fault.
<!-- {"id":"COMPTIA-NET-009-Q269","objective":"5.5","type":"recall","source":"OBJN9","locator":"Objective 5.5 nslookup/dig","verified":"2026-10-10"} -->

---

### Q270
A tech runs tracert to a web server and watches latency jump at the fifth hop and stay high through the destination. What does this indicate?
- A) Latency is introduced around hop 5's link, and every later hop inherits it
- B) Hop 5 is broken and should be replaced
- C) The destination is down
- D) DNS failed

**Answer: A**
Traceroute shows where delay accumulates along the path. A jump that persists to the end localizes the slow segment; later hops merely ride through it. One high-latency hop that recovers afterward is usually just deprioritized ICMP at that hop.
<!-- {"id":"COMPTIA-NET-009-Q270","objective":"5.5","type":"diagnosis","source":"OBJN9","locator":"Objective 5.5 traceroute analysis","verified":"2026-10-10"} -->

---

### Q271
A tech needs the PC's IP address, mask, gateway, and lease status on a Windows machine. Which command shows all of it?
- A) netstat -r
- B) nslookup
- C) ipconfig /all
- D) ping

**Answer: C**
ipconfig /all displays addressing, gateway, DNS servers, MAC, and DHCP lease details on Windows. Its Linux/macOS counterparts are ip addr and ifconfig.
<!-- {"id":"COMPTIA-NET-009-Q271","objective":"5.5","type":"recall","source":"OBJN9","locator":"Objective 5.5 ipconfig","verified":"2026-10-10"} -->

---

### Q272
A server is not listening on the port the app expects, and the tech wants to see which ports have listeners on the machine. Which command helps?
- A) netstat (with listening-port flags)
- B) tracert
- C) dig
- D) arp -a

**Answer: A**
netstat shows local sockets: which ports are listening and which connections exist. If the service's port is absent, the service is down or misbound, which redirects the fix to the application, not the network.
<!-- {"id":"COMPTIA-NET-009-Q272","objective":"5.5","type":"recall","source":"OBJN9","locator":"Objective 5.5 netstat","verified":"2026-10-10"} -->

---

### Q273
Traffic to one host on the LAN keeps going to the wrong MAC after an IP conflict. Which host command inspects the stale local mapping?
- A) nslookup
- B) route print only
- C) hostname
- D) arp -a (view or clear the ARP cache)

**Answer: D**
The ARP cache binds IPs to MACs locally; a stale or poisoned entry misdirects frames. Viewing and clearing it is a standard step after IP conflicts or gateway hardware swaps.
<!-- {"id":"COMPTIA-NET-009-Q273","objective":"5.5","type":"recall","source":"OBJN9","locator":"Objective 5.5 arp command","verified":"2026-10-10"} -->

---

### Q274
A capture on a span port shows the client sending SYNs to the server with no reply, while the server team swears the service is up. What does the capture prove?
- A) Requests leave the client and arrive at this point, but nothing returns: the loss is at or beyond this capture point
- B) The client is broken
- C) DNS failed
- D) The cable is bad

**Answer: A**
Captures are ground truth about what crosses a point. SYNs seen with no replies bisect the fault downstream: server's service, its firewall, or an intervening filter.
<!-- {"id":"COMPTIA-NET-009-Q274","objective":"5.5","type":"diagnosis","source":"OBJN9","locator":"Objective 5.5 packet capture analysis","verified":"2026-10-10"} -->

---

### Q275
A scan from an authorized test box reports 22/tcp filtered, 80/tcp open, 443/tcp open on a web server. Which tool produced this?
- A) ipconfig
- B) netstat on the client
- C) nmap port scan
- D) ping sweep

**Answer: C**
Port scanners probe target ports and classify them open/filtered/closed. The result validates firewall rules: the filtered SSH port confirms policy, while open web ports confirm service exposure.
<!-- {"id":"COMPTIA-NET-009-Q275","objective":"5.5","type":"recall","source":"OBJN9","locator":"Objective 5.5 nmap","verified":"2026-10-10"} -->

---

### Q276
A Linux tech must see which path packets take and which interface source address is chosen for a destination. Which command shows the routing decision?
- A) cat /etc/hosts
- B) df -h
- C) ip route get <destination>
- D) ls

**Answer: C**
Querying the route table for a destination reveals the selected route, source address, and interface: exactly what asymmetric-routing and policy-routing mysteries need. The other commands touch files and disks.
<!-- {"id":"COMPTIA-NET-009-Q276","objective":"5.5","type":"recall","source":"OBJN9","locator":"Objective 5.5 route inspection","verified":"2026-10-10"} -->

---

### Q277
A tech tests whether TCP 443 answers on a remote server without a browser. Which tool does this?
- A) ping
- B) arp
- C) traceroute
- D) telnet or a netcat-style connection to the port (or curl for HTTPS semantics)

**Answer: D**
Connecting to a specific TCP port tests transport reachability, which ping (ICMP) cannot prove. A successful handshake means the port is open and answering; a refusal or timeout splits closed from filtered.
<!-- {"id":"COMPTIA-NET-009-Q277","objective":"5.5","type":"recall","source":"OBJN9","locator":"Objective 5.5 port testing tools","verified":"2026-10-10"} -->

---

### Q278
A WAN provider asks for "loopback testing toward the CO" on a T1 smart jack. What does the loopback accomplish?
- A) It assigns new IPs
- B) It reflects the signal back at a chosen point, proving the segment up to that point
- C) It speeds up the line
- D) It encrypts the circuit

**Answer: B**
Loopbacks bisect a circuit: if the provider sees their test return from the smart jack, the line to the demarc is good and the fault lies on the customer side. It is the classic telco fault-isolation move.
<!-- {"id":"COMPTIA-NET-009-Q278","objective":"5.5","type":"recall","source":"OBJN9","locator":"Objective 5.5 loopback testing","verified":"2026-10-10"} -->

---

### Q279
A cable certifier reports a FAIL on return loss for a new Cat6A run. What does return loss measure?
- A) The switch's CPU
- B) The VLAN count
- C) Signal reflected back toward the source by impedance irregularities (bad terminations, kinks)
- D) The cable's length

**Answer: C**
Return loss gauges reflections from impedance discontinuities, usually workmanship at terminations or cable damage. Failing it degrades high-speed links even when continuity is perfect.
<!-- {"id":"COMPTIA-NET-009-Q279","objective":"5.5","type":"recall","source":"OBJN9","locator":"Objective 5.5 certifier metrics","verified":"2026-10-10"} -->

---

### Q280
A Wi-Fi analyzer shows the AP's channel overlapped by three neighbor networks with strong signal. What is the fix?
- A) Hide the SSID
- B) Disable encryption
- C) Move the AP to a cleaner channel (or band) based on the measured spectrum
- D) Raise power to shout over them

**Answer: C**
Measured interference drives channel selection; the analyzer shows which channels are clear. Adding power worsens the interference party for everyone, and hiding or weakening security does nothing for RF congestion.
<!-- {"id":"COMPTIA-NET-009-Q280","objective":"5.5","type":"diagnosis","source":"OBJN9","locator":"Objective 5.5 spectrum analysis","verified":"2026-10-10"} -->

---

### Q281
A suspect switch is flooding traffic and the team wants to see its logs and counters immediately. Which two sources give the fastest picture? (Choose two.)
- A) The switch's interface counters and error statistics
- B) Its syslog messages around the event window
- C) The DNS zone file
- D) The DHCP lease history only
- E) The printer spooler

**Correct Answer: A, B**
Interface counters show errors, discards, and rates as they happen; syslog records what the device reported doing. Together they usually identify a flooding source or loop within minutes.
<!-- {"id":"COMPTIA-NET-009-Q281","objective":"5.5","type":"diagnosis","source":"OBJN9","locator":"Objective 5.5 device telemetry","verified":"2026-10-10"} -->

---

### Q282
After a config change, a remote site is unreachable and the engineer cannot fix it remotely. What practice would have prevented the lockout?
- A) Testing changes with automatic rollback (scheduled reload/confirmed commit) on remote devices
- B) Making changes faster
- C) Disabling all logging
- D) Longer passwords

**Answer: A**
Confirmed-commit or scheduled-reload patterns revert a change automatically unless the engineer confirms reachability, turning a site visit into a brief outage. It is the standard safety net for remote edits.
<!-- {"id":"COMPTIA-NET-009-Q282","objective":"5.5","type":"diagnosis","source":"OBJN9","locator":"Objective 5.5 change safety practices","verified":"2026-10-10"} -->

---

### Q283
A user's connection works after a cable swap, but the tech keeps the old cable for testing. What good practice does this support?
- A) Avoiding documentation
- B) Delaying closure
- C) Confirming the root cause by testing the failed component rather than assuming
- D) Hoarding supplies

**Answer: C**
Verifying the failed part (testing the old cable) confirms the diagnosis was causal, not coincidental, and keeps a marginal cable from silently returning to service.
<!-- {"id":"COMPTIA-NET-009-Q283","objective":"5.1","type":"recall","source":"OBJN9","locator":"Objective 5.1 root cause confirmation","verified":"2026-10-10"} -->

---

### Q284
A critical app's symptoms match a known issue in the team knowledge base. What is the efficient methodology move?
- A) Reinvent the diagnosis from scratch every time
- B) Escalate immediately without reading
- C) Close as user error
- D) Apply the documented resolution steps from the KB, then verify

**Answer: D**
Knowledge bases exist so solved problems stay solved. Using documented resolutions shortens outages and standardizes fixes, followed by the same verification any fix requires.
<!-- {"id":"COMPTIA-NET-009-Q284","objective":"5.1","type":"recall","source":"OBJN9","locator":"Objective 5.1 knowledge base use","verified":"2026-10-10"} -->

---

### Q285
A switch crashes every time a specific monitoring query runs. The vendor's advisory calls it a known bug fixed in a newer firmware. What is the resolution path?
- A) Plan a tested firmware upgrade through change management, with rollback
- B) Ignore the crashes
- C) Replace the switch blindly
- D) Disable all monitoring forever

**Answer: A**
Known-defect fixes are still changes: test, schedule, rollback plan, then deploy. Living with crashes or abandoning monitoring trades one risk for a worse one.
<!-- {"id":"COMPTIA-NET-009-Q285","objective":"5.1","type":"diagnosis","source":"OBJN9","locator":"Objective 5.1 firmware upgrade process","verified":"2026-10-10"} -->

---

### Q286
A remote hands technician is asked to "check the blue cable in port 24." Which documentation makes this instruction unambiguous?
- A) Current port maps, labels, and rack diagrams
- B) Verbal tradition
- C) The org chart
- D) The cafeteria menu

**Answer: A**
Remote-hands work succeeds on documentation: labeled ports/cables and accurate diagrams let someone onsite execute precisely without guessing which blue cable is meant.
<!-- {"id":"COMPTIA-NET-009-Q286","objective":"5.1","type":"recall","source":"OBJN9","locator":"Objective 5.1 documentation for remote hands","verified":"2026-10-10"} -->

---

### Q287
A router's CPU spikes to 99 percent during traffic bursts and starts dropping OSPF hellos, destabilizing routes. What evidence connects these symptoms?
- A) The cable color code
- B) The rack position
- C) Device CPU/memory telemetry alongside protocol logs showing hello timeouts during the spikes
- D) The DNS TTL values

**Answer: C**
Correlating resource telemetry with protocol events shows cause: control-plane starvation dropping hellos, which tears down adjacencies. The fix targets the load or the device capacity, not the protocol.
<!-- {"id":"COMPTIA-NET-009-Q287","objective":"5.3","type":"diagnosis","source":"OBJN9","locator":"Objective 5.3 control-plane resource exhaustion","verified":"2026-10-10"} -->

---

### Q288
Hosts get correct IP settings, the gateway pings, but nothing beyond the gateway works, and a traceroute dies at the first hop's far side. Where is the fault domain?
- A) Every PC at once
- B) DNS only
- C) The patch cables
- D) The gateway router's upstream path (WAN, NAT, or routing), not the LAN

**Answer: D**
Reaching the gateway but nothing past it bisects the problem at the router's far side: its WAN link, NAT configuration, or routes. LAN-side causes were eliminated by the successful gateway ping.
<!-- {"id":"COMPTIA-NET-009-Q288","objective":"5.3","type":"diagnosis","source":"OBJN9","locator":"Objective 5.3 fault bisection at gateway","verified":"2026-10-10"} -->

---

### Q289
A duplicate DHCP server on the LAN hands out wrong gateways to some clients. Which two steps resolve it? (Choose two.)
- A) Find and disable the rogue server
- B) Enable DHCP snooping so only trusted ports can serve DHCP
- C) Shorten all leases to one minute
- D) Move DNS to port 53
- E) Assign everyone static IPs permanently

**Correct Answer: A, B**
Removing the rogue server fixes the immediate problem; snooping prevents recurrence by trusting server responses only on designated ports. Lease games and static-everything are workarounds, not cures.
<!-- {"id":"COMPTIA-NET-009-Q289","objective":"5.3","type":"diagnosis","source":"OBJN9","locator":"Objective 5.3 rogue DHCP remediation","verified":"2026-10-10"} -->

---

### Q290
A packet capture of a slow app shows many retransmissions and duplicate ACKs between two sites. What does this pattern indicate?
- A) DNS caching
- B) Normal behavior
- C) Too much bandwidth
- D) Packet loss on the path, causing TCP retransmission and reduced throughput

**Answer: D**
Duplicate ACKs and retransmits are TCP reacting to lost segments. Quantifying loss along the path (and checking error counters on the way) localizes the dropping point.
<!-- {"id":"COMPTIA-NET-009-Q290","objective":"5.4","type":"diagnosis","source":"OBJN9","locator":"Objective 5.4 retransmission analysis","verified":"2026-10-10"} -->

---

### Q291
A new gigabit switch delivers 100 Mbps to every port. Every connected device shows 100/full. What single cause explains a uniform downgrade?
- A) The firewall is tired
- B) The uplink or all runs use four-wire (two-pair) cabling or a miswired panel limiting negotiation
- C) The internet is slow
- D) DNS is throttling

**Answer: B**
A uniform speed ceiling across all ports points to a shared physical cause: two-pair cabling or systematic termination faults cap negotiation at 100 Mbps. Per-device issues would not be uniform.
<!-- {"id":"COMPTIA-NET-009-Q291","objective":"5.4","type":"diagnosis","source":"OBJN9","locator":"Objective 5.4 systematic speed limits","verified":"2026-10-10"} -->

---

### Q292
A streaming backup job saturates the WAN every night and now also runs into business hours, degrading voice. Which mechanism restores voice quality without canceling backups?
- A) Disabling QoS entirely
- B) QoS prioritization of voice over bulk traffic, and scheduling/rate-limiting the backup
- C) A longer Ethernet cable
- D) A new DNS record

**Answer: B**
Contention between bulk and real-time traffic is exactly what QoS solves: voice gets priority and bandwidth guarantees while scavenger-class backup fills what remains, with scheduling as the complementary fix.
<!-- {"id":"COMPTIA-NET-009-Q292","objective":"5.4","type":"diagnosis","source":"OBJN9","locator":"Objective 5.4 congestion management","verified":"2026-10-10"} -->

---

### Q293
A tech must verify a fiber run end to end before handoff but lacks an OTDR. What basic validation pair still provides confidence?
- A) A punch tool
- B) A light source and power meter measuring end-to-end loss against the link budget
- C) A toner and probe
- D) A Wi-Fi analyzer

**Answer: B**
Light-source/power-meter loss testing validates the run against its calculated budget: the essential fiber acceptance test. Toning works on copper; Wi-Fi tools measure RF.
<!-- {"id":"COMPTIA-NET-009-Q293","objective":"5.5","type":"recall","source":"OBJN9","locator":"Objective 5.5 fiber loss testing","verified":"2026-10-10"} -->

---

### Q294
An engineer suspects asymmetric routing: requests enter via one ISP, replies leave via another, and the stateful firewall drops them. What evidence confirms it?
- A) The DNS cache
- B) Captures or flow logs on both paths showing request and reply traversing different firewalls
- C) A successful ping
- D) The ARP table

**Answer: B**
Asymmetry is proven by observing the two directions on different paths. Stateful devices in only one direction then drop traffic they never saw start. The fix aligns paths or relaxes state checks for those flows.
<!-- {"id":"COMPTIA-NET-009-Q294","objective":"5.5","type":"diagnosis","source":"OBJN9","locator":"Objective 5.5 asymmetric routing","verified":"2026-10-10"} -->

---

### Q295
A help-desk script walks callers through link lights, cable seating, and reboots before escalation. What methodology value does the script provide?
- A) Longer hold music
- B) Fewer tickets closed
- C) Random guessing with charm
- D) Consistent Layer 1 elimination and evidence collection before costly escalation

**Answer: D**
Structured first-line scripts clear the common physical causes uniformly and gather the facts tier two needs, shrinking both resolution time and escalations.
<!-- {"id":"COMPTIA-NET-009-Q295","objective":"5.1","type":"recall","source":"OBJN9","locator":"Objective 5.1 structured triage","verified":"2026-10-10"} -->

---

### Q296
A network change worked in the lab but fails in production. What is the most productive comparison?
- A) Differences between lab and production: versions, scale, existing config, and load
- B) The phase of the moon
- C) The cable brands' colors
- D) The admin's lunch

**Answer: A**
Lab-to-production gaps live in environmental differences. Diffing configurations, versions, and load conditions between the two finds the variable the lab did not reproduce.
<!-- {"id":"COMPTIA-NET-009-Q296","objective":"5.1","type":"diagnosis","source":"OBJN9","locator":"Objective 5.1 environment comparison","verified":"2026-10-10"} -->

---

### Q297
Multiple VLANs lose internet at once but keep working locally. The distribution switch's uplink shows a high discard rate. What is the likely shared fault?
- A) Every VLAN misconfigured identically
- B) A DNS outage
- C) An NTP skew
- D) A congested or failing uplink shared by those VLANs

**Answer: D**
Simultaneous impact across VLANs implicates their common path. Discards on the uplink show congestion or errors there, so the investigation moves to that link's capacity and health.
<!-- {"id":"COMPTIA-NET-009-Q297","objective":"5.4","type":"diagnosis","source":"OBJN9","locator":"Objective 5.4 uplink congestion","verified":"2026-10-10"} -->

---

### Q298
A certificate error hits every client at a site after a firewall swap, but only for TLS-inspected sites. What is the probable cause?
- A) All certificates expired at once
- B) DNS poisoning
- C) The sites moved
- D) The new firewall performs TLS inspection and its CA cert is not deployed to clients

**Answer: D**
TLS inspection re-signs sites with the firewall's own CA; clients without that root see every inspected site as untrusted. Deploying the CA certificate to managed endpoints restores validation.
<!-- {"id":"COMPTIA-NET-009-Q298","objective":"5.3","type":"diagnosis","source":"OBJN9","locator":"Objective 5.3 TLS inspection trust","verified":"2026-10-10"} -->

---

### Q299
A syslog flood shows repeated "MAC move" notifications between two ports. What physical cause should be suspected?
- A) A weak Wi-Fi signal
- B) A loop between those ports (or the same device patched into both), making the address flap
- C) A DNS loop
- D) A full hard drive

**Answer: B**
MAC moves mean the same address appears on alternating ports: the classic signature of a switching loop or dual-connected device. STP state, cabling between the ports, and loop-prevention features are the next checks.
<!-- {"id":"COMPTIA-NET-009-Q299","objective":"5.2","type":"diagnosis","source":"OBJN9","locator":"Objective 5.2 MAC flapping/loops","verified":"2026-10-10"} -->

---

### Q300
A final validation after repairs asks: does the original symptom recur under the same conditions, and do adjacent services still work? Which methodology principle is this?
- A) Close tickets at midnight
- B) Verify full system functionality and confirm resolution of the original problem
- C) Escalate without testing
- D) Document nothing

**Answer: B**
Resolution is proven by reproducing the original conditions and confirming normal behavior, plus regression-checking what the fix touched. That discipline closes the methodology loop started at problem identification.
<!-- {"id":"COMPTIA-NET-009-Q300","objective":"5.1","type":"recall","source":"OBJN9","locator":"Objective 5.1 verification","verified":"2026-10-10"} -->

---
