# CompTIA Network+ (N10-009) Practice Questions - Part 3
# Original study items. Independent material, not official or endorsed by CompTIA.

## DOMAIN 3: Network Operations (study allocation)

---

### Q121
A network change must be reviewed, approved, scheduled, and given a rollback plan before anyone touches the core switches. Which process governs this?
- A) Load balancing
- B) Cable certification
- C) Change management
- D) Asset discovery

**Answer: C**
Change management exists to evaluate risk, schedule work, get approval, and define rollback before modifying production systems. It is the discipline that prevents Saturday-night outages caused by untracked edits.
<!-- {"id":"COMPTIA-NET-009-Q121","objective":"3.1","type":"recall","source":"OBJN9","locator":"Objective 3.1 processes, change management","verified":"2026-10-10"} -->

---

### Q122
An outage postmortem reveals nobody knew which VLANs the finance servers used because the diagram was two years old. Which documentation practice failed?
- A) Keeping network diagrams and records current as changes happen
- B) Storing diagrams in a safe
- C) Using color in diagrams
- D) Printing diagrams annually

**Answer: A**
Documentation only has value if it tracks the live environment. Wiring diagrams, VLAN maps, and IP plans must be updated as part of every change, not as an occasional cleanup project.
<!-- {"id":"COMPTIA-NET-009-Q122","objective":"3.1","type":"diagnosis","source":"OBJN9","locator":"Objective 3.1 documentation currency","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q123
A vendor contract guarantees 99.9 percent uptime and 4-hour response for a WAN link. What is this document?
- A) A statement of work for a project
- B) A service-level agreement
- C) A memorandum of understanding
- D) A non-disclosure agreement

**Answer: B**
An SLA defines measurable service commitments (uptime, response and restore times) and remedies. An MOU records mutual intent between parties without those enforceable service metrics.
<!-- {"id":"COMPTIA-NET-009-Q123","objective":"3.1","type":"recall","source":"OBJN9","locator":"Objective 3.1 SLA","verified":"2026-10-10"} -->

---

### Q124
Two companies connecting their networks for a joint project draft a document describing what each side intends to provide, before contracts are finalized. What is this document?
- A) A change request
- B) A memorandum of understanding
- C) A service-level agreement
- D) An acceptable use policy

**Answer: B**
An MOU captures shared intent and responsibilities between parties ahead of formal agreements. SLAs define measured service levels; AUPs govern user behavior; change requests govern modifications.
<!-- {"id":"COMPTIA-NET-009-Q124","objective":"3.1","type":"recall","source":"OBJN9","locator":"Objective 3.1 MOU","verified":"2026-10-10"} -->

---

### Q125
A company device disposal policy requires drives to be wiped before recycling. Which category of organizational documentation does this belong to?
- A) Policies and procedures covering the equipment lifecycle
- B) Wiring schematics
- C) The routing table
- D) The DHCP lease log

**Answer: A**
Lifecycle policies (procurement through decommissioning, including data destruction at disposal) are organizational process documents. The other items are operational artifacts, not policy.
<!-- {"id":"COMPTIA-NET-009-Q125","objective":"3.1","type":"recall","source":"OBJN9","locator":"Objective 3.1 lifecycle policies","verified":"2026-10-10"} -->

---

### Q126
Before a firewall migration, the team records the exact current config, the planned steps, the test plan, and how to revert. Which document holds this?
- A) The syslog archive
- B) The change request record
- C) The incident ticket
- D) The asset tag list

**Answer: B**
A complete change request captures the current state, implementation steps, validation tests, and rollback procedure, giving approvers what they need and engineers a safe path back if things go wrong.
<!-- {"id":"COMPTIA-NET-009-Q126","objective":"3.1","type":"diagnosis","source":"OBJN9","locator":"Objective 3.1 change request contents","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q127
A new hire asks where to find which circuits the company leases, their providers, and contract end dates. Which record answers this?
- A) The STP topology table
- B) The MAC address table
- C) The circuit inventory in the network documentation
- D) The ARP cache

**Answer: C**
Circuit inventories (provider, circuit ID, bandwidth, contract dates, demarc locations) are standard network documentation. ARP, STP, and MAC tables are runtime state, not contractual records.
<!-- {"id":"COMPTIA-NET-009-Q127","objective":"3.1","type":"recall","source":"OBJN9","locator":"Objective 3.1 circuit inventory documentation","verified":"2026-10-10"} -->

---

### Q128
A junior admin wants to know the approved way to request firewall rule changes. What should exist for this?
- A) A hallway conversation convention
- B) Direct CLI access for everyone
- C) An email to a personal account
- D) A documented procedure within the change-management framework

**Answer: D**
Procedures operationalize policy: who can request changes, how they are reviewed, approved, implemented, and verified. Undocumented conventions collapse when people are out or roles change.
<!-- {"id":"COMPTIA-NET-009-Q128","objective":"3.1","type":"recall","source":"OBJN9","locator":"Objective 3.1 procedures","verified":"2026-10-10"} -->

---

### Q129
A monitoring dashboard shows interface utilization, error rates, and device CPU for every switch, polled every five minutes. Which protocol most likely collects this?
- A) SIP
- B) BGP
- C) SNMP
- D) SMTP

**Answer: C**
SNMP polls management information bases for interface counters, CPU, memory, and environmental data, the backbone of network monitoring. SMTP moves mail, SIP signals calls, BGP routes between networks.
<!-- {"id":"COMPTIA-NET-009-Q129","objective":"3.2","type":"recall","source":"OBJN9","locator":"Objective 3.2 monitoring, SNMP","verified":"2026-10-10"} -->

---

### Q130
A security team wants a time-ordered record of every login and config change on network devices, surviving device reboots. Where should those messages go?
- A) The DHCP log
- B) Printed console output
- C) A central syslog server (or SIEM) receiving device logs
- D) Each device's volatile memory only

**Answer: C**
Centralized syslog preserves logs off the device, enabling correlation and forensics even if a device is rebooted, wiped, or compromised. Local-only logs vanish when you need them most.
<!-- {"id":"COMPTIA-NET-009-Q130","objective":"3.2","type":"diagnosis","source":"OBJN9","locator":"Objective 3.2 syslog centralization","demoCandidate":true,"verified":"2026-10-10"} -->

---

### Q131
A capacity planner needs to know which applications and endpoints consume the WAN link, broken down by flow. Which technology reports this?
- A) DNS zone transfers
- B) NetFlow (or IPFIX) flow export from the routers
- C) Ping sweeps
- D) LLDP advertisements

**Answer: B**
Flow export records who talked to whom, on which ports, with what volume: exactly the traffic composition view capacity and security teams need. Ping, LLDP, and DNS serve discovery and naming, not flow analytics.
<!-- {"id":"COMPTIA-NET-009-Q131","objective":"3.2","type":"recall","source":"OBJN9","locator":"Objective 3.2 NetFlow/IPFIX","verified":"2026-10-10"} -->

---

### Q132
An alert fires because latency to a SaaS app doubled versus last month. The alert was only meaningful because the team had recorded normal values beforehand. What are those recorded normals called?
- A) Backups
- B) Bitmasks
- C) Baselines
- D) Broadcasts

**Answer: C**
Baselines are the measured norms for performance and behavior. Without them, no one can say whether a metric is abnormal, making them a prerequisite for meaningful alerting and capacity planning.
<!-- {"id":"COMPTIA-NET-009-Q132","objective":"3.2","type":"recall","source":"OBJN9","locator":"Objective 3.2 baselines","verified":"2026-10-10"} -->

---

### Q133
A technician must see exactly which TLS version a failing client proposes at the moment of failure. Which tool captures this?
- A) A packet capture (protocol analyzer) on the relevant segment
- B) A cable certifier
- C) A tone probe
- D) An environmental monitor

**Answer: A**
Packet captures record the actual bytes and protocol negotiation on the wire, the ground truth for protocol-level diagnosis. Certifiers, toners, and environmental sensors answer physical questions instead.
<!-- {"id":"COMPTIA-NET-009-Q133","objective":"3.2","type":"recall","source":"OBJN9","locator":"Objective 3.2 packet capture","verified":"2026-10-10"} -->

---

### Q134
A monitoring system pages the on-call engineer at 3 AM weekly for a server that briefly spikes CPU during backups. The alert is noise. What is the right fix?
- A) Disable all monitoring
- B) Ignore pages permanently
- C) Reboot the server nightly
- D) Tune alert thresholds or suppression windows to match expected behavior

**Answer: D**
Alert fatigue comes from alerts that fire on normal events. Tuning thresholds and maintenance windows keeps alerts actionable. Disabling monitoring or ignoring pages eventually hides a real outage.
<!-- {"id":"COMPTIA-NET-009-Q134","objective":"3.2","type":"diagnosis","source":"OBJN9","locator":"Objective 3.2 alert tuning","verified":"2026-10-10"} -->

---

### Q135
A dashboard must show whether each site is up, its latency, and interface health, updated continuously. What combination gathers this?
- A) ICMP polling plus SNMP interface statistics
- B) Monthly manual checks
- C) Reading the DNS cache
- D) Watching the DHCP scope

**Answer: A**
Availability monitoring typically combines ping/ICMP checks for reachability and latency with SNMP polls for interface and device health, feeding dashboards and alerts in near real time.
<!-- {"id":"COMPTIA-NET-009-Q135","objective":"3.2","type":"recall","source":"OBJN9","locator":"Objective 3.2 availability monitoring","verified":"2026-10-10"} -->

---

### Q136
A syslog server receives thousands of events, and the team wants authentication failures across all devices flagged automatically. What capability does this?
- A) Log correlation and alerting rules (SIEM functions)
- B) Longer log retention only
- C) Bigger log files
- D) Disabling debug logging

**Answer: A**
SIEM-style correlation matches patterns across sources and raises alerts on defined conditions, turning raw log volume into signals. Retention alone stores noise; correlation finds meaning.
<!-- {"id":"COMPTIA-NET-009-Q136","objective":"3.2","type":"recall","source":"OBJN9","locator":"Objective 3.2 SIEM correlation","verified":"2026-10-10"} -->

---

### Q137
A port-security alert shows an unknown MAC repeatedly appearing on a finance VLAN port. What monitoring evidence should be reviewed to locate the device?
- A) The UPS runtime
- B) The printer queue
- C) MAC address tables, switch logs, and possibly packet captures
- D) The HVAC logs

**Answer: C**
Tracking a rogue device means following its MAC through switch tables to a physical port, corroborated by logs and captures. Facility telemetry cannot identify a network endpoint.
<!-- {"id":"COMPTIA-NET-009-Q137","objective":"3.2","type":"diagnosis","source":"OBJN9","locator":"Objective 3.2 device tracking","verified":"2026-10-10"} -->

---

### Q138
An organization mandates that backups must allow restoring the data center to within 15 minutes of data loss, and systems must be back online within 2 hours. Which terms define these two targets?
- A) MTTR of 15 minutes and MTBF of 2 hours
- B) SLA of 15 minutes and MOU of 2 hours
- C) TTL of 15 minutes and TTF of 2 hours
- D) RPO of 15 minutes and RTO of 2 hours

**Answer: D**
Recovery point objective bounds acceptable data loss; recovery time objective bounds acceptable downtime. They drive backup frequency and recovery design respectively.
<!-- {"id":"COMPTIA-NET-009-Q138","objective":"3.3","type":"recall","source":"OBJN9","locator":"Objective 3.3 RPO/RTO","verified":"2026-10-10"} -->

---

### Q139
A company keeps a fully equipped duplicate data center with live replication, able to take over in minutes. What kind of DR site is this?
- A) Dark site
- B) Hot site
- C) Cold site
- D) Warm site

**Answer: B**
A hot site runs equipped and synchronized for near-immediate takeover. Warm sites have equipment but need data/config restoration; cold sites are empty space requiring full build-out.
<!-- {"id":"COMPTIA-NET-009-Q139","objective":"3.3","type":"recall","source":"OBJN9","locator":"Objective 3.3 DR site types","verified":"2026-10-10"} -->

---

### Q140
After a regional outage, the DR plan worked technically, but staff did not know who was authorized to declare the disaster. What should the plan add?
- A) More backup tapes
- B) A faster SAN
- C) Additional VLANs
- D) Defined roles, escalation, and declaration authority, tested in exercises

**Answer: D**
DR plans fail on people and process as often as technology. Clear authority, contact trees, and rehearsed procedures are what make technical recovery usable under stress.
<!-- {"id":"COMPTIA-NET-009-Q140","objective":"3.3","type":"diagnosis","source":"OBJN9","locator":"Objective 3.3 DR plan governance","verified":"2026-10-10"} -->

---

### Q141
A backup strategy keeps full backups weekly and only changed files nightly. Which backup type runs nightly?
- A) Bare-metal images nightly
- B) Snapshots of nothing
- C) Incremental or differential backups
- D) Full backups

**Answer: C**
Incremental backups capture changes since the last backup of any kind; differential captures changes since the last full. Both exist to avoid nightly full-backup cost while meeting recovery objectives.
<!-- {"id":"COMPTIA-NET-009-Q141","objective":"3.3","type":"recall","source":"OBJN9","locator":"Objective 3.3 backup types","verified":"2026-10-10"} -->

---

### Q142
A quarterly exercise restores random backups to prove they work. Why is this necessary even though backup jobs report success?
- A) It speeds up the network
- B) It reduces storage costs
- C) Backup success does not prove restorability; only test restores validate media, data, and procedure
- D) Auditors require printed logs

**Answer: C**
A backup that cannot be restored is worthless. Regular restore tests catch corrupted media, missing dependencies, and broken procedures before a real emergency does.
<!-- {"id":"COMPTIA-NET-009-Q142","objective":"3.3","type":"diagnosis","source":"OBJN9","locator":"Objective 3.3 backup testing","verified":"2026-10-10"} -->

---

### Q143
Two firewalls are deployed so one takes over instantly if the other fails, sharing session state. What is this design called?
- A) Active-passive (or active-active) high availability clustering
- B) Load balancing of web traffic
- C) Port aggregation
- D) Content filtering

**Answer: A**
HA pairs eliminate the single point of failure at the firewall: state synchronization lets the standby assume the active role with minimal disruption. This is redundancy at the device level, distinct from traffic distribution.
<!-- {"id":"COMPTIA-NET-009-Q143","objective":"3.3","type":"recall","source":"OBJN9","locator":"Objective 3.3 HA/redundancy","verified":"2026-10-10"} -->

---

### Q144
A risk review notes the server room has one air conditioner, one power feed, and one WAN circuit. What design principle is being violated?
- A) Zero trust segmentation
- B) Eliminating single points of failure through redundancy
- C) The principle of least privilege
- D) Defense by obscurity

**Answer: B**
Each single component whose failure takes down the service is a single point of failure. Resilient design identifies and duplicates them: dual power, cooling, and circuits.
<!-- {"id":"COMPTIA-NET-009-Q144","objective":"3.3","type":"diagnosis","source":"OBJN9","locator":"Objective 3.3 single points of failure","verified":"2026-10-10"} -->

---

### Q145
A file server cluster fails over during maintenance with no user impact. Which metric improves because of this design?
- A) Availability (uptime)
- B) Latency
- C) MTU
- D) Hop count

**Answer: A**
Clustering and failover exist to keep services available through component failures and maintenance. Availability is the metric; the others describe path characteristics, not resilience.
<!-- {"id":"COMPTIA-NET-009-Q145","objective":"3.3","type":"recall","source":"OBJN9","locator":"Objective 3.3 availability design","verified":"2026-10-10"} -->

---

### Q146
A DHCP scope for the guest VLAN is exhausting by noon daily. Which two changes could fix this? (Choose two.)
- A) Shorten the lease time for guest devices
- B) Enlarge the scope's address pool
- C) Disable DNS
- D) Lower the MTU
- E) Enable STP

**Correct Answer: A, B**
Scope exhaustion means more devices than addresses held by leases. Shortening leases recycles addresses faster; expanding the pool adds capacity. DNS, MTU, and STP do not affect address supply.
<!-- {"id":"COMPTIA-NET-009-Q146","objective":"3.4","type":"diagnosis","source":"OBJN9","locator":"Objective 3.4 DHCP scope exhaustion","verified":"2026-10-10"} -->

---

### Q147
A remote site's PCs cannot get DHCP addresses after the local relay router is replaced. The DHCP server is at headquarters. What was forgotten on the new router?
- A) The NTP setting
- B) The hostname
- C) The banner message
- D) The DHCP relay (helper) configuration forwarding broadcasts to the server

**Answer: D**
DHCP discover messages are broadcasts that routers do not forward. A relay/agent (IP helper) converts them to unicast toward the server. Replacing the router without it strands remote clients.
<!-- {"id":"COMPTIA-NET-009-Q147","objective":"3.4","type":"diagnosis","source":"OBJN9","locator":"Objective 3.4 DHCP relay","verified":"2026-10-10"} -->

---

### Q148
A laptop shows a 169.254.x.x address and cannot reach anything. What does that address signify?
- A) A static assignment by the admin
- B) A public routable address
- C) An IPv6 transition address
- D) APIPA self-assignment: the client failed to reach a DHCP server

**Answer: D**
169.254.0.0/16 is link-local autoconfiguration, assigned when DHCP fails. It proves the client is alive but cannot get a lease; the hunt shifts to the DHCP path (relay, scope, connectivity).
<!-- {"id":"COMPTIA-NET-009-Q148","objective":"3.4","type":"diagnosis","source":"OBJN9","locator":"Objective 3.4 APIPA","verified":"2026-10-10"} -->

---

### Q149
A DNS record must point mail for the domain to the correct server. Which record type is used?
- A) PTR
- B) MX
- C) A
- D) CNAME

**Answer: B**
MX records name the mail exchangers for a domain with priorities. A records map names to IPv4 addresses, CNAMEs alias names, and PTR records reverse-map addresses to names.
<!-- {"id":"COMPTIA-NET-009-Q149","objective":"3.4","type":"recall","source":"OBJN9","locator":"Objective 3.4 DNS record types MX","verified":"2026-10-10"} -->

---

### Q150
A support rep needs the hostname behind a suspect IP address in the logs. Which DNS record provides the reverse mapping?
- A) PTR
- B) MX
- C) AAAA
- D) TXT

**Answer: A**
PTR records live in reverse-lookup zones and map addresses to names. AAAA maps names to IPv6 addresses, MX identifies mail servers, and TXT holds arbitrary text like verification strings.
<!-- {"id":"COMPTIA-NET-009-Q150","objective":"3.4","type":"recall","source":"OBJN9","locator":"Objective 3.4 DNS PTR","verified":"2026-10-10"} -->

---

### Q151
A web service answers at both www.example.com and example.com, with the bare domain as the canonical name and www as an alias. Which record creates the alias?
- A) SOA
- B) SRV
- C) CNAME
- D) PTR

**Answer: C**
A CNAME maps one name to another name, which then resolves via its own A/AAAA record. SOA starts the zone's authority data; SRV locates specific services; PTR reverses addresses.
<!-- {"id":"COMPTIA-NET-009-Q151","objective":"3.4","type":"recall","source":"OBJN9","locator":"Objective 3.4 DNS CNAME","verified":"2026-10-10"} -->

---

### Q152
A company moves its website to a new host, but some users still reach the old address hours after the DNS change. Why?
- A) Cached records persist until their TTL expires at resolvers
- B) DNS changes take exactly 24 hours by law
- C) The old server hacked the new one
- D) Browsers cannot use DNS

**Answer: A**
Resolvers cache answers for the record's time-to-live. Until caches expire, some users get stale answers. Lowering TTL before planned changes shortens this window.
<!-- {"id":"COMPTIA-NET-009-Q152","objective":"3.4","type":"diagnosis","source":"OBJN9","locator":"Objective 3.4 DNS TTL caching","verified":"2026-10-10"} -->

---

### Q153
A VoIP system, cameras, and log servers must agree on time within milliseconds for call records to correlate. What does the NTP design need?
- A) Manual clock setting annually
- B) Each device using its own random time
- C) Time synced by email
- D) All devices pointed at reliable NTP sources, ideally an internal stratum synced to trusted external clocks

**Answer: D**
Consistent time requires every device synchronized to a common, trustworthy NTP hierarchy. Correlation of logs, certificates, and call detail records all depend on it.
<!-- {"id":"COMPTIA-NET-009-Q153","objective":"3.4","type":"diagnosis","source":"OBJN9","locator":"Objective 3.4 NTP design","verified":"2026-10-10"} -->

---

### Q154
Certificates on internal sites show as expired on some PCs but not others, though they were renewed. What is the most likely cause?
- A) Client clocks skewed beyond certificate validity windows due to failed time sync
- B) The CA shut down
- C) DNS is case-sensitive
- D) The sites moved to IPv6

**Answer: A**
Certificate validation depends on correct client time. Devices that lost NTP sync drift outside validity windows and flag valid certificates as expired or not yet valid.
<!-- {"id":"COMPTIA-NET-009-Q154","objective":"3.4","type":"diagnosis","source":"OBJN9","locator":"Objective 3.4 NTP and certificates","verified":"2026-10-10"} -->

---

### Q155
A new printer must never change its address because firewall rules reference it. Which DHCP feature applies?
- A) A shorter lease
- B) A wider subnet mask
- C) Exclusion of the server addresses
- D) A reservation tying its MAC address to a fixed IP

**Answer: D**
Reservations deliver a consistent address via DHCP, keeping centralized management while guaranteeing stability. Exclusions keep addresses out of the pool but do not bind them to a device.
<!-- {"id":"COMPTIA-NET-009-Q155","objective":"3.4","type":"recall","source":"OBJN9","locator":"Objective 3.4 DHCP reservation","verified":"2026-10-10"} -->

---

### Q156
An IPv6 rollout must hand out addresses and DNS information with central logging of who got what. Which service replaces SLAAC here?
- A) Teredo
- B) Link-local addressing
- C) Stateful DHCPv6
- D) NAT64

**Answer: C**
Stateful DHCPv6 assigns and tracks leases like IPv4 DHCP, providing the audit trail SLAAC lacks. NAT64 and Teredo are transition mechanisms, not address management.
<!-- {"id":"COMPTIA-NET-009-Q156","objective":"3.4","type":"recall","source":"OBJN9","locator":"Objective 3.4 DHCPv6","verified":"2026-10-10"} -->

---

### Q157
A technician must manage a switch whose network stack is misconfigured and unreachable over IP. Which access method still works?
- A) SSH to its management IP
- B) HTTPS to its web GUI
- C) SNMP queries
- D) Out-of-band console access (serial/USB console, possibly via a console server)

**Answer: D**
The console port bypasses the network entirely, which is exactly why out-of-band paths exist: when in-band management is broken or the device is mid-boot, console still reaches it.
<!-- {"id":"COMPTIA-NET-009-Q157","objective":"3.5","type":"diagnosis","source":"OBJN9","locator":"Objective 3.5 console access","verified":"2026-10-10"} -->

---

### Q158
A security policy requires administrators to reach network devices only through a hardened intermediate host with session recording. What is that host called?
- A) A syslog relay
- B) A jump box (bastion host)
- C) A proxy cache
- D) A load balancer

**Answer: B**
Jump boxes concentrate administrative access at one hardened, monitored point: all sessions to managed devices pass through it, simplifying access control, auditing, and recording.
<!-- {"id":"COMPTIA-NET-009-Q158","objective":"3.5","type":"recall","source":"OBJN9","locator":"Objective 3.5 jump box","verified":"2026-10-10"} -->

---

### Q159
An automation script pushes standardized VLAN configurations to fifty switches nightly via structured requests. Which management interface is it using?
- A) Telnet menus
- B) SNMP gets only
- C) The devices' API (e.g., REST-based programmatic interfaces)
- D) Manual CLI typing

**Answer: C**
APIs let software configure and query devices programmatically and consistently at scale, the foundation of network automation. SNMP traditionally reads state; CLI does not scale to scripted fleets.
<!-- {"id":"COMPTIA-NET-009-Q159","objective":"3.5","type":"recall","source":"OBJN9","locator":"Objective 3.5 API management","verified":"2026-10-10"} -->

---

### Q160
A managed switch offers both in-band management on the production VLANs and a dedicated management port. Why prefer the dedicated port?
- A) It eliminates cabling
- B) It removes the need for credentials
- C) It isolates management from production failures and reduces attack surface
- D) It is faster for file transfers

**Answer: C**
A dedicated management interface keeps device administration reachable and separated from user traffic and its outages or attacks. It does not change authentication requirements.
<!-- {"id":"COMPTIA-NET-009-Q160","objective":"3.5","type":"diagnosis","source":"OBJN9","locator":"Objective 3.5 in-band vs OOB management","verified":"2026-10-10"} -->

---

### Q161
A legacy router only supports Telnet for remote CLI. The security team wants it off the network. What is the core issue?
- A) Telnet sends credentials and session data in cleartext
- B) Telnet is too fast
- C) Telnet uses too much memory
- D) Telnet requires fiber

**Answer: A**
Telnet's cleartext credentials and sessions are sniffable by anyone on the path. SSH is the encrypted replacement; the recommendation is to disable Telnet and use SSH or isolate the device.
<!-- {"id":"COMPTIA-NET-009-Q161","objective":"3.5","type":"recall","source":"OBJN9","locator":"Objective 3.5 Telnet vs SSH","verified":"2026-10-10"} -->

---

### Q162
A screen-scraping script breaks every time a switch's firmware changes its CLI menu layout. Which management approach avoids this fragility?
- A) Faster typing
- B) Longer banners
- C) A versioned programmatic API
- D) More fragile scripts

**Answer: C**
APIs provide stable, structured interfaces designed for automation, unlike CLI text designed for humans. Screen scraping inherits every cosmetic change the vendor makes.
<!-- {"id":"COMPTIA-NET-009-Q162","objective":"3.5","type":"diagnosis","source":"OBJN9","locator":"Objective 3.5 API vs screen scraping","verified":"2026-10-10"} -->

---

### Q163
A NOC must reach site routers when the site's WAN link is down. What infrastructure supports this?
- A) A second SSID
- B) A larger subnet
- C) Static ARP entries
- D) An out-of-band management network (console servers over cellular or POTS)

**Answer: D**
OOB networks use a separate path (LTE, modem, dedicated circuit) to reach console servers when the production network is down. Any in-band method dies with the link it rides on.
<!-- {"id":"COMPTIA-NET-009-Q163","objective":"3.5","type":"recall","source":"OBJN9","locator":"Objective 3.5 OOB network","verified":"2026-10-10"} -->

---

### Q164
A company audits who ran which commands on its switches. Which combination provides per-user accountability?
- A) Individual accounts with TACACS+/RADIUS authentication and command accounting
- B) One shared admin password
- C) Read-only SNMP for everyone
- D) Local databases cleared monthly

**Answer: A**
Centralized AAA with per-user credentials ties every command to a person and records it. Shared passwords destroy accountability, and SNMP read access is monitoring, not configuration control.
<!-- {"id":"COMPTIA-NET-009-Q164","objective":"3.5","type":"recall","source":"OBJN9","locator":"Objective 3.5 AAA TACACS+/RADIUS","verified":"2026-10-10"} -->

---

### Q165
A switch config was damaged by a bad edit and the last known-good configuration was archived centrally. What is the fastest safe recovery?
- A) Restore the archived configuration and verify services
- B) Rebuild from memory
- C) Factory reset with no backup
- D) Wait for the next scheduled archive

**Answer: A**
Configuration archives exist for exactly this: rapid, reliable rollback to a known-good state. Memory rebuilds are slow and error-prone; factory resets without backups turn an incident into an outage.
<!-- {"id":"COMPTIA-NET-009-Q165","objective":"3.5","type":"diagnosis","source":"OBJN9","locator":"Objective 3.5 config backup and restore","verified":"2026-10-10"} -->

---

### Q166
An org requires configuration files to be encrypted when transferred off devices for backup. Which protocol choices comply? (Choose two.)
- A) SCP or SFTP
- B) HTTPS-based API export
- C) TFTP
- D) FTP
- E) Telnet copy

**Correct Answer: A, B**
SCP/SFTP and HTTPS encrypt management-plane file transfers. TFTP, FTP, and Telnet move configs, including credentials, in cleartext and violate the policy.
<!-- {"id":"COMPTIA-NET-009-Q166","objective":"3.5","type":"recall","source":"OBJN9","locator":"Objective 3.5 secure file transfer","verified":"2026-10-10"} -->

---

### Q167
A branch device's clock keeps drifting minutes per week, confusing its logs. It cannot reach the internet. What is the fix?
- A) Disable logging
- B) Change its hostname
- C) Point it at an internal NTP server reachable from its management network
- D) Replace the device

**Answer: C**
Devices without internet access still need time sync; an internal NTP source on a reachable network solves it. The drift is a sync-source problem, not a hardware defect.
<!-- {"id":"COMPTIA-NET-009-Q167","objective":"3.4","type":"diagnosis","source":"OBJN9","locator":"Objective 3.4 NTP internal source","verified":"2026-10-10"} -->

---

### Q168
A DNS server answers internal names but not external ones after a firewall change. What did the change most likely block?
- A) ICMP echo
- B) SNMP traps
- C) NTP requests
- D) Outbound DNS queries/forwarding (UDP/TCP 53) to its upstream resolvers

**Answer: D**
Internal zones resolve locally, but external names need the server to forward queries upstream. Blocking port 53 outbound breaks recursion while leaving local answers intact.
<!-- {"id":"COMPTIA-NET-009-Q168","objective":"3.4","type":"diagnosis","source":"OBJN9","locator":"Objective 3.4 DNS forwarding","verified":"2026-10-10"} -->

---

### Q169
A team wants every network device's logs timestamped in the same timezone with millisecond precision for forensics. Which two configurations accomplish this? (Choose two.)
- A) A common NTP source on all devices
- B) A uniform timezone and timestamp format policy
- C) A longer syslog message size
- D) Local clocks set manually per device
- E) Disabling timestamps for brevity

**Correct Answer: A, B**
Forensically useful logs need both synchronized clocks (NTP) and uniform timestamp conventions so events line up across devices. Manual setting drifts; dropping timestamps destroys the evidence.
<!-- {"id":"COMPTIA-NET-009-Q169","objective":"3.2","type":"diagnosis","source":"OBJN9","locator":"Objective 3.2 log timestamp policy","verified":"2026-10-10"} -->

---

### Q170
A monitoring platform discovers devices automatically by reading neighbor information from each switch. Which protocol supplies this topology data?
- A) LLDP (or CDP) neighbor advertisements
- B) SMTP
- C) BGP communities
- D) DHCP options

**Answer: A**
Link-layer discovery protocols advertise each device's identity, port, and capabilities to neighbors, letting monitoring tools map topology automatically. BGP, SMTP, and DHCP serve unrelated roles.
<!-- {"id":"COMPTIA-NET-009-Q170","objective":"3.2","type":"recall","source":"OBJN9","locator":"Objective 3.2 LLDP/CDP discovery","verified":"2026-10-10"} -->

---

### Q171
A UPS monitoring card alerts that battery runtime fell below the threshold after a self-test. Where does this alert surface operationally?
- A) The wireless controller
- B) The monitoring/alerting system via SNMP or syslog from the UPS
- C) The DNS resolver
- D) The DHCP scope

**Answer: B**
Facility devices with network cards report through the same SNMP/syslog monitoring fabric as IT gear, so power events page the on-call like any other alert.
<!-- {"id":"COMPTIA-NET-009-Q171","objective":"3.2","type":"recall","source":"OBJN9","locator":"Objective 3.2 environmental monitoring","verified":"2026-10-10"} -->

---

### Q172
A planned core upgrade requires the network to tolerate one switch being offline. Which design property, verified before the change, guarantees this?
- A) Larger logging buffers
- B) Redundant paths and devices with tested failover
- C) A single high-capacity switch
- D) A longer maintenance window

**Answer: B**
Maintenance tolerance comes from redundancy: dual paths and devices let one element leave service without an outage. Verifying failover before the window is what makes the plan safe.
<!-- {"id":"COMPTIA-NET-009-Q172","objective":"3.3","type":"diagnosis","source":"OBJN9","locator":"Objective 3.3 redundancy for maintenance","verified":"2026-10-10"} -->

---

### Q173
A company must prove to an auditor that only approved changes reached the firewalls last quarter. Which records demonstrate this?
- A) The asset purchase orders
- B) Change tickets matched against device configuration archives and AAA logs
- C) The cafeteria menu archive
- D) The wireless heat map

**Answer: B**
Change tickets show what was approved; config archives show what actually ran; AAA logs show who did it. Together they prove changes were authorized, a core audit pattern.
<!-- {"id":"COMPTIA-NET-009-Q173","objective":"3.1","type":"diagnosis","source":"OBJN9","locator":"Objective 3.1 audit evidence","verified":"2026-10-10"} -->

---

### Q174
A new service's traffic must be classified so voice gets priority end-to-end. Which marking is applied to packets, and where is it honored?
- A) MAC addresses
- B) QoS markings (e.g., DSCP) applied at trust boundaries and honored by queues on each hop
- C) VLAN names
- D) DNS TTLs

**Answer: B**
QoS works by marking traffic classes and enforcing queuing/scheduling per class across the path. Markings are trusted or rewritten at boundaries; every hop must participate for end-to-end effect.
<!-- {"id":"COMPTIA-NET-009-Q174","objective":"3.2","type":"recall","source":"OBJN9","locator":"Objective 3.2 QoS marking DSCP","verified":"2026-10-10"} -->

---

### Q175
A switch port's utilization graph shows a flat 95 percent for weeks, and users report slowness at peak. Which monitoring-driven process addresses this?
- A) Disabling the graphs
- B) Rebooting weekly
- C) Lowering the polling interval
- D) Capacity planning using trend data to schedule an upgrade before saturation

**Answer: D**
Trend data exists so upgrades happen on evidence before saturation hurts users. Capacity planning converts monitoring history into procurement and project timelines.
<!-- {"id":"COMPTIA-NET-009-Q175","objective":"3.2","type":"diagnosis","source":"OBJN9","locator":"Objective 3.2 capacity planning","verified":"2026-10-10"} -->

---

### Q176
A recovery exercise must restore the authentication service first because everything else depends on it. Where is this ordering defined?
- A) In the DR plan's recovery priorities, derived from dependency analysis
- B) In the DNS zone file
- C) In the DHCP scope
- D) In the cabling standard

**Answer: A**
DR plans sequence recovery by dependencies: identity, network, and storage foundations before the applications that consume them. The exercise validates both the sequence and the timing.
<!-- {"id":"COMPTIA-NET-009-Q176","objective":"3.3","type":"recall","source":"OBJN9","locator":"Objective 3.3 recovery sequencing","verified":"2026-10-10"} -->

---

### Q177
An engineer standardizes device configs: banners, NTP, syslog, AAA, and disabled unused services applied identically everywhere. What is this artifact called?
- A) A packet capture
- B) A heat map
- C) A warranty
- D) A configuration baseline (hardened standard config)

**Answer: D**
Config baselines define the approved standard state. Applied consistently and audited for drift, they make fleets predictable, secure, and easy to troubleshoot.
<!-- {"id":"COMPTIA-NET-009-Q177","objective":"3.1","type":"recall","source":"OBJN9","locator":"Objective 3.1 config baselines","verified":"2026-10-10"} -->

---

### Q178
A monitoring system lost visibility of one switch after a credentials rotation. Polling now times out. What broke?
- A) The switch lost its MAC address
- B) The VLAN numbers changed
- C) The fiber became copper
- D) The SNMP credentials/community configured on the monitor no longer match the device

**Answer: D**
Authentication mismatch after a rotation is the classic monitoring blackout: the device is fine but rejects the poller's credentials. Updating the stored credentials on both sides restores visibility.
<!-- {"id":"COMPTIA-NET-009-Q178","objective":"3.2","type":"diagnosis","source":"OBJN9","locator":"Objective 3.2 SNMP credential mismatch","verified":"2026-10-10"} -->

---

### Q179
A network team wants a single dashboard correlating WAN latency, firewall denies, and authentication failures during an incident window. What provides this?
- A) The cable certification report
- B) A SIEM/log platform ingesting all three sources with normalized timestamps
- C) Three separate spreadsheets by email
- D) The printer's web page

**Answer: B**
Correlation across sources needs one platform ingesting everything with synchronized time. Spreadsheets by email cannot align live event streams during an incident.
<!-- {"id":"COMPTIA-NET-009-Q179","objective":"3.2","type":"recall","source":"OBJN9","locator":"Objective 3.2 SIEM dashboards","verified":"2026-10-10"} -->

---

### Q180
A device's web management interface is reachable from every user PC, and the security review flags it. What is the correct remediation?
- A) Reboot the device
- B) Restrict management access to the management VLAN/hosts with ACLs and move the interface off user networks
- C) Change the web page theme
- D) Disable HTTPS so only CLI works

**Answer: B**
Management interfaces belong on isolated networks reachable only from admin stations, enforced by ACLs. Exposure to all users multiplies attack surface for credential guessing and exploitation.
<!-- {"id":"COMPTIA-NET-009-Q180","objective":"3.5","type":"diagnosis","source":"OBJN9","locator":"Objective 3.5 management access restriction","verified":"2026-10-10"} -->

---
