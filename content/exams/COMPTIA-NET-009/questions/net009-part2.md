# CompTIA Network+ (N10-009) Practice Questions - Part 2
# Original study items. Independent material, not official or endorsed by CompTIA.

## DOMAIN 2: Network Implementation (study allocation)

---

### Q61
A branch router needs a fixed path to the data center that never changes and is simple to audit. Which routing approach fits?
- A) BGP with full tables
- B) RIP with poison reverse
- C) Static routes configured by the administrator
- D) OSPF with a single area

**Answer: C**
Static routes are hand-configured, deterministic paths: ideal for small, stable topologies like a branch with one uplink. Dynamic protocols add adaptability that this scenario does not need.
<!-- {"id":"COMPTIA-NET-009-Q061","objective":"2.1","type":"recall","source":"OBJN9","locator":"Objective 2.1 routing technologies, static","verified":"2026-10-10"} -->

---

### Q62
Two routing protocols offer a path to the same destination: one learned via OSPF, one via RIP. The router installs the OSPF route. Why?
- A) OSPF has a lower administrative distance than RIP by default
- B) OSPF routes are always faster
- C) RIP routes expire immediately
- D) The router prefers alphabetical order

**Answer: A**
Administrative distance ranks the trustworthiness of route sources; OSPF's default (110) beats RIP's (120), so the OSPF path wins the routing table even if both reach the destination.
<!-- {"id":"COMPTIA-NET-009-Q062","objective":"2.1","type":"recall","source":"OBJN9","locator":"Objective 2.1 administrative distance","verified":"2026-10-10"} -->

---

### Q63
A company peers with two internet providers and must control which provider carries outbound traffic and advertise its own address block. Which protocol is required?
- A) EIGRP only
- B) BGP
- C) OSPF
- D) RIP

**Answer: B**
BGP is the exterior gateway protocol for inter-provider peering, path policy, and prefix advertisement. OSPF and EIGRP are interior protocols for within one organization's network.
<!-- {"id":"COMPTIA-NET-009-Q063","objective":"2.1","type":"recall","source":"OBJN9","locator":"Objective 2.1 BGP","verified":"2026-10-10"} -->

---

### Q64
A growing enterprise wants a link-state interior protocol that converges quickly and scales through hierarchical areas. Which choice fits?
- A) BGP inside the LAN
- B) OSPF
- C) RIPv2
- D) Static routing everywhere

**Answer: B**
OSPF is the standards-based link-state IGP built for fast convergence and area-based hierarchy. RIP's hop-count design and slow convergence make it a poor fit for large networks.
<!-- {"id":"COMPTIA-NET-009-Q064","objective":"2.1","type":"recall","source":"OBJN9","locator":"Objective 2.1 OSPF characteristics","verified":"2026-10-10"} -->

---

### Q65
Hosts on the LAN browse the internet through one public address, with the router rewriting source addresses and tracking sessions. Which function is operating?
- A) Port address translation (PAT, a form of NAT overload)
- B) Static NAT one-to-one
- C) 6to4 tunneling
- D) DHCP snooping

**Answer: A**
PAT multiplexes many inside hosts behind one public address using port numbers to track sessions: the standard home and office internet-sharing design. Static NAT maps single addresses one-to-one.
<!-- {"id":"COMPTIA-NET-009-Q065","objective":"2.1","type":"recall","source":"OBJN9","locator":"Objective 2.1 NAT/PAT","verified":"2026-10-10"} -->

---

### Q66
An internal web server must be reachable from the internet at a fixed public address that always maps to it. Which NAT form applies?
- A) NAT64
- B) Static NAT
- C) PAT overload
- D) Dynamic NAT from a pool

**Answer: B**
Static NAT provides a permanent one-to-one mapping between a public and a private address, the right tool for publishing a server. Dynamic and overload forms do not guarantee an inbound mapping.
<!-- {"id":"COMPTIA-NET-009-Q066","objective":"2.1","type":"recall","source":"OBJN9","locator":"Objective 2.1 static NAT","verified":"2026-10-10"} -->

---

### Q67
After a link failure, routers exchange updates and settle on new paths within a few seconds. What is this settling process called?
- A) Fragmentation
- B) Serialization
- C) Convergence
- D) Encapsulation

**Answer: C**
Convergence is the process of all routers agreeing on the new topology after a change. Faster convergence means less downtime during failures, and it is a key differentiator between routing protocols.
<!-- {"id":"COMPTIA-NET-009-Q067","objective":"2.1","type":"recall","source":"OBJN9","locator":"Objective 2.1 convergence","verified":"2026-10-10"} -->

---

### Q68
A small lab still runs a distance-vector protocol limited to 15 hops that sends full table updates every 30 seconds. Which protocol is it?
- A) OSPF
- B) BGP
- C) IS-IS
- D) RIP

**Answer: D**
RIP is the classic distance-vector protocol: hop count metric, 15-hop ceiling, periodic full updates. Its simplicity suits tiny networks; its limits exclude it from larger designs.
<!-- {"id":"COMPTIA-NET-009-Q068","objective":"2.1","type":"recall","source":"OBJN9","locator":"Objective 2.1 RIP characteristics","verified":"2026-10-10"} -->

---

### Q69
A design requires the same destination reachable over two equal-cost links with traffic shared across both. Which router capability provides this?
- A) Administrative distance tuning
- B) Hold-down timers
- C) Equal-cost multi-path routing
- D) Route poisoning

**Answer: C**
ECMP lets a router install multiple equal-cost paths to a destination and distribute flows across them, using spare links for capacity and resilience. The other mechanisms prevent loops or alter route preference.
<!-- {"id":"COMPTIA-NET-009-Q069","objective":"2.1","type":"recall","source":"OBJN9","locator":"Objective 2.1 ECMP","verified":"2026-10-10"} -->

---

### Q70
A router advertises a failed network with an infinite metric to stop neighbors from routing to it through this router. What is this loop-prevention technique?
- A) Summarization
- B) Redistribution
- C) Route poisoning
- D) Split horizon only

**Answer: C**
Route poisoning marks a dead route with an unreachable metric so neighbors remove it quickly, limiting routing loops in distance-vector protocols. Split horizon suppresses advertising a route back out the interface it arrived on.
<!-- {"id":"COMPTIA-NET-009-Q070","objective":"2.1","type":"recall","source":"OBJN9","locator":"Objective 2.1 distance-vector loop prevention","verified":"2026-10-10"} -->

---

### Q71
An engineer wants voice VLAN traffic tagged separately from data on the same switch ports to phones and PCs. Which standard carries multiple VLANs over one link?
- A) 802.1X port authentication
- B) 802.1Q tagging on trunk ports
- C) 802.11 channel bonding
- D) 802.3af power negotiation

**Answer: B**
802.1Q inserts a VLAN tag into frames on trunk links so one physical port carries many VLANs: the basis of voice/data separation on shared cabling. The other standards cover wireless, PoE, and authentication.
<!-- {"id":"COMPTIA-NET-009-Q071","objective":"2.2","type":"recall","source":"OBJN9","locator":"Objective 2.2 switching, 802.1Q","verified":"2026-10-10"} -->

---

### Q72
A port carries untagged PC traffic plus tagged phone traffic. What determines which VLAN the untagged frames land in?
- A) The management VLAN always
- B) VLAN 4095
- C) The port's native (untagged) VLAN
- D) The highest VLAN ID

**Answer: C**
On an 802.1Q trunk, frames without a tag are assigned to the native VLAN configured on that port. Mismatched native VLANs between switch neighbors cause traffic to leak between VLANs.
<!-- {"id":"COMPTIA-NET-009-Q072","objective":"2.2","type":"diagnosis","source":"OBJN9","locator":"Objective 2.2 native VLAN","verified":"2026-10-10"} -->

---

### Q73
Two uplinked switches start flooding traffic endlessly right after a redundant link is connected, and CPU spikes to 100%. What feature was missing?
- A) Spanning tree to block the redundant path
- B) Larger MTU
- C) Jumbo frames
- D) Flow control

**Answer: A**
A Layer 2 loop with no spanning tree creates a broadcast storm: frames circulate and multiply until the network collapses. STP detects the loop and blocks one path, unblocking it on failure.
<!-- {"id":"COMPTIA-NET-009-Q073","objective":"2.2","type":"diagnosis","source":"OBJN9","locator":"Objective 2.2 STP purpose","verified":"2026-10-10"} -->

---

### Q74
A wiring closet switch should elect itself as the spanning tree root for the VLANs it serves. What is adjusted?
- A) The MAC aging timer
- B) The duplex setting
- C) The native VLAN
- D) The bridge priority (lower wins)

**Answer: D**
STP elects the root bridge by lowest bridge ID, which combines priority and MAC address. Setting a deliberate low priority on the designed root prevents a random edge switch from winning the election.
<!-- {"id":"COMPTIA-NET-009-Q074","objective":"2.2","type":"recall","source":"OBJN9","locator":"Objective 2.2 STP root election","verified":"2026-10-10"} -->

---

### Q75
Users complain of 30-second network freezes when a port first connects, though the link eventually works. Which STP behavior is this, and what speeds it up on edge ports?
- A) The listening/learning delay; enable a portfast-style edge-port feature
- B) The root election; disable STP entirely
- C) MAC aging; raise the timer
- D) Trunk negotiation; force all ports to access

**Answer: A**
Classic STP holds a new port in listening/learning states before forwarding, about 30 seconds. Portfast-type features skip this on ports where only end devices connect, never on switch-to-switch links.
<!-- {"id":"COMPTIA-NET-009-Q075","objective":"2.2","type":"diagnosis","source":"OBJN9","locator":"Objective 2.2 STP port states, portfast","verified":"2026-10-10"} -->

---

### Q76
A switch must learn which MAC addresses live on which ports. How does it build this table?
- A) By recording the source MAC of frames as they arrive on each port
- B) By querying DNS
- C) By ARP requests to the router
- D) From the DHCP server

**Answer: A**
Switches learn MAC locations from source addresses of inbound frames and age entries out over time. Unknown destinations are flooded until learned. ARP maps IP to MAC, a different table on hosts.
<!-- {"id":"COMPTIA-NET-009-Q076","objective":"2.2","type":"recall","source":"OBJN9","locator":"Objective 2.2 MAC learning","verified":"2026-10-10"} -->

---

### Q77
A frame arrives for a MAC address the switch has never seen. What does the switch do?
- A) Sends it to the router
- B) Returns it to the sender
- C) Floods it out all ports in that VLAN except the one it arrived on
- D) Drops it immediately

**Answer: C**
Unknown unicast flooding is the fallback: without a learned location, the switch sends the frame everywhere in the VLAN so the destination can answer, after which its location is learned.
<!-- {"id":"COMPTIA-NET-009-Q077","objective":"2.2","type":"recall","source":"OBJN9","locator":"Objective 2.2 unknown unicast flooding","verified":"2026-10-10"} -->

---

### Q78
A design groups the three floors of accounting users into one VLAN even though they attach to three different switches. What makes this work?
- A) One giant subnet mask
- B) Disabling STP
- C) A separate router per floor
- D) VLAN trunking between the switches carrying that VLAN's tagged traffic

**Answer: D**
VLANs are logical: the same VLAN can span many switches when trunks carry its tagged frames between them. That is the point of VLANs over purely physical segmentation.
<!-- {"id":"COMPTIA-NET-009-Q078","objective":"2.2","type":"recall","source":"OBJN9","locator":"Objective 2.2 VLANs across switches","verified":"2026-10-10"} -->

---

### Q79
A new switch should block unauthorized switches from claiming the spanning-tree root role on user-facing ports. Which feature applies?
- A) Port mirroring
- B) Root guard
- C) DHCP snooping
- D) Storm control

**Answer: B**
Root guard on a port refuses superior BPDUs, so an unauthorized device cannot hijack the root role from an access port. BPDU guard is the stricter variant that shuts the port on any BPDU.
<!-- {"id":"COMPTIA-NET-009-Q079","objective":"2.2","type":"recall","source":"OBJN9","locator":"Objective 2.2 STP protections","verified":"2026-10-10"} -->

---

### Q80
Four 1 Gbps switch-to-switch links are bundled with LACP, but one member was misconfigured with a different speed and stays out of the bundle. What does LACP require of members?
- A) Different VLANs per member
- B) Half duplex on at least one member
- C) Members on different switches only
- D) Matching speed, duplex, and VLAN configuration on every member link

**Answer: D**
Aggregation groups only form when member links share compatible settings; a mismatched member is excluded. Checking every member's speed, duplex, and VLAN config is the fix.
<!-- {"id":"COMPTIA-NET-009-Q080","objective":"2.2","type":"diagnosis","source":"OBJN9","locator":"Objective 2.2 LACP requirements","verified":"2026-10-10"} -->

---

### Q81
A site surveys shows an elevator shaft between two areas killing the 5 GHz signal, while 2.4 GHz still reaches. Why does 2.4 GHz penetrate better?
- A) 5 GHz is illegal indoors
- B) 2.4 GHz uses fiber
- C) Lower frequencies propagate through obstacles more effectively, trading off capacity
- D) 2.4 GHz has more non-overlapping channels

**Answer: C**
Higher frequencies carry more data but attenuate faster through walls and obstacles. The design tradeoff: 2.4 GHz for reach, 5/6 GHz for capacity and cleaner spectrum.
<!-- {"id":"COMPTIA-NET-009-Q081","objective":"2.3","type":"recall","source":"OBJN9","locator":"Objective 2.3 frequency options","verified":"2026-10-10"} -->

---

### Q82
An office wants the newest Wi-Fi generation's extra spectrum to escape congestion entirely. Which band does Wi-Fi 6E add?
- A) 60 GHz
- B) 2.4 GHz
- C) 6 GHz
- D) 900 MHz

**Answer: C**
Wi-Fi 6E extends 802.11ax into the 6 GHz band, adding wide, clean channels free of legacy-device congestion, at the cost of shorter range through walls.
<!-- {"id":"COMPTIA-NET-009-Q082","objective":"2.3","type":"recall","source":"OBJN9","locator":"Objective 2.3 802.11 standards, 6GHz","verified":"2026-10-10"} -->

---

### Q83
A legacy barcode scanner only supports 802.11g. Which band and maximum PHY rate should the network team expect from it?
- A) 2.4 GHz, 54 Mbps
- B) 5 GHz, 600 Mbps
- C) 6 GHz, 9.6 Gbps
- D) 2.4 GHz, 11 Mbps

**Answer: A**
802.11g runs in 2.4 GHz at up to 54 Mbps. 11 Mbps is 802.11b, and the higher rates belong to 802.11n/ac/ax generations the scanner does not support.
<!-- {"id":"COMPTIA-NET-009-Q083","objective":"2.3","type":"recall","source":"OBJN9","locator":"Objective 2.3 802.11 standards","verified":"2026-10-10"} -->

---

### Q84
A stadium AP serves hundreds of clients simultaneously by talking to multiple devices at once rather than one at a time. Which technology enables this?
- A) WEP
- B) MU-MIMO
- C) Band steering
- D) WPS

**Answer: B**
Multi-user MIMO lets an access point transmit to several clients concurrently using spatial streams, a capacity win in dense environments. Band steering nudges clients between bands; WEP is obsolete encryption.
<!-- {"id":"COMPTIA-NET-009-Q084","objective":"2.3","type":"recall","source":"OBJN9","locator":"Objective 2.3 MU-MIMO","verified":"2026-10-10"} -->

---

### Q85
A point-to-point wireless bridge links two buildings one kilometer apart. Which antenna type belongs on each end?
- A) Directional antennas aimed at each other
- B) Omnidirectional antennas
- C) Rubber-duck dipoles pointed at the ground
- D) No antennas needed

**Answer: A**
Point-to-point links concentrate energy with directional antennas (dish, panel, Yagi) for range and signal quality. Omnidirectional patterns waste energy in every direction, which suits coverage areas, not links.
<!-- {"id":"COMPTIA-NET-009-Q085","objective":"2.3","type":"recall","source":"OBJN9","locator":"Objective 2.3 antenna types","verified":"2026-10-10"} -->

---

### Q86
Clients cluster on the crowded 2.4 GHz radio even though a healthy 5 GHz signal exists. Which AP feature nudges capable clients to 5 GHz?
- A) Airtime fairness disabled
- B) WPS push-button
- C) SSID cloaking
- D) Band steering

**Answer: D**
Band steering encourages dual-band clients onto the less congested 5 GHz band, improving overall capacity. It changes association behavior, not security or hiding.
<!-- {"id":"COMPTIA-NET-009-Q086","objective":"2.3","type":"recall","source":"OBJN9","locator":"Objective 2.3 band steering","verified":"2026-10-10"} -->

---

### Q87
An outdoor deployment needs wireless coverage radiating in all directions from a pole in a courtyard. Which antenna fits?
- A) Yagi
- B) Parabolic dish
- C) Patch panel antenna aimed at one wall
- D) Omnidirectional

**Answer: D**
Omnidirectional antennas radiate in a 360-degree horizontal pattern, ideal for covering an area around the mounting point. Directional types concentrate energy for links or targeted coverage.
<!-- {"id":"COMPTIA-NET-009-Q087","objective":"2.3","type":"recall","source":"OBJN9","locator":"Objective 2.3 omnidirectional antennas","verified":"2026-10-10"} -->

---

### Q88
A controller-managed WLAN must comply with regulations that require radios to detect radar and move off certain 5 GHz channels automatically. Which mechanism does this?
- A) Channel bonding to 160 MHz
- B) Dynamic frequency selection under 802.11h rules
- C) WEP rotation
- D) MAC filtering

**Answer: B**
DFS requirements (from 802.11h regulation) make access points vacate shared 5 GHz channels when radar is detected. It explains occasional channel changes in enterprise WLANs and is a regulatory, not performance, feature.
<!-- {"id":"COMPTIA-NET-009-Q088","objective":"2.3","type":"recall","source":"OBJN9","locator":"Objective 2.3 regulatory impacts 802.11h","verified":"2026-10-10"} -->

---

### Q89
Doubling channel width from 20 to 40 MHz in 2.4 GHz caused worse performance in a crowded apartment building. Why?
- A) Wider channels overlap more neighbors, increasing interference in a band with little spectrum
- B) 40 MHz is illegal
- C) Wider channels lower the data rate
- D) The antennas shrank

**Answer: A**
Wider channels raise peak throughput but consume more spectrum. In crowded 2.4 GHz, 40 MHz channels collide with neighboring networks; narrow channels with careful reuse perform better.
<!-- {"id":"COMPTIA-NET-009-Q089","objective":"2.3","type":"diagnosis","source":"OBJN9","locator":"Objective 2.3 channel width","verified":"2026-10-10"} -->

---

### Q90
A hospital wants staff devices to prefer the strongest AP as they roam hallways without sticky associations. What should be tuned?
- A) The subnet mask
- B) The DNS suffix
- C) Roaming aggressiveness on clients plus cell overlap in the design
- D) The DHCP lease time

**Answer: C**
Sticky clients cling to distant APs; client roaming thresholds and proper AP placement/overlap determine handoff quality. Addressing settings do not influence radio attachment.
<!-- {"id":"COMPTIA-NET-009-Q090","objective":"2.3","type":"diagnosis","source":"OBJN9","locator":"Objective 2.3 roaming design","verified":"2026-10-10"} -->

---

### Q91
A new IDF (intermediate distribution frame) is being planned for the third floor. What is its role in the cabling hierarchy?
- A) It aggregates the floor's horizontal cabling and uplinks to the main distribution frame
- B) It is the building's internet demarcation point
- C) It stores backup tapes
- D) It is a wireless-only closet

**Answer: A**
The MDF anchors the building's backbone; IDFs on each floor terminate horizontal runs and connect back to the MDF. This hierarchy keeps horizontal runs under 90 meters and organizes uplinks.
<!-- {"id":"COMPTIA-NET-009-Q091","objective":"2.4","type":"recall","source":"OBJN9","locator":"Objective 2.4 MDF/IDF","verified":"2026-10-10"} -->

---

### Q92
A horizontal cabling run from the closet patch panel to a desk outlet measures 88 meters. Is this within standards, and why the limit?
- A) No; the limit is 50 meters
- B) Yes; copper has no distance limit
- C) No; only fiber is allowed
- D) Yes; the 90-meter permanent-link allowance (100 meters total channel) exists to keep Ethernet signal integrity

**Answer: D**
Structured cabling standards allow 90 meters for the permanent horizontal link plus patch cords up to a 100-meter channel, the distance Ethernet over twisted pair is engineered to support.
<!-- {"id":"COMPTIA-NET-009-Q092","objective":"2.4","type":"recall","source":"OBJN9","locator":"Objective 2.4 cabling distance standards","verified":"2026-10-10"} -->

---

### Q93
Cables above a drop ceiling that serves as an air-handling space must meet a fire-safety requirement. Which cable rating applies?
- A) Plenum-rated cable
- B) Standard PVC riser cable
- C) Unrated patch cords
- D) Coaxial only

**Answer: A**
Plenum spaces (air circulation for HVAC) require plenum-rated cable with fire-retardant, low-smoke jackets. Using ordinary PVC there violates fire code because burning PVC emits toxic smoke through the air system.
<!-- {"id":"COMPTIA-NET-009-Q093","objective":"2.4","type":"recall","source":"OBJN9","locator":"Objective 2.4 plenum vs non-plenum","verified":"2026-10-10"} -->

---

### Q94
A rack installation teams asks where the hottest air collects and how equipment should be arranged. Which layout principle applies?
- A) All vents facing each other
- B) Exhaust fans pointed at intakes
- C) Random orientation
- D) Hot aisle/cold aisle containment with proper airflow front-to-back

**Answer: D**
Alternating hot and cold aisles with equipment drawing cold air from the front and exhausting hot air behind keeps cooling efficient and prevents hot spots, a foundational data-center design practice.
<!-- {"id":"COMPTIA-NET-009-Q094","objective":"2.4","type":"recall","source":"OBJN9","locator":"Objective 2.4 environmental factors, airflow","verified":"2026-10-10"} -->

---

### Q95
A wall-mount rack in a retail back office has no UPS, and brief power sags reboot the switch weekly. What is the right fix?
- A) A surge strip only
- B) Move the rack outdoors
- C) Install a UPS sized for the load with enough runtime for sags and graceful handling
- D) A longer power cord

**Answer: C**
A UPS bridges sags and outages, conditions power, and protects equipment. A surge strip only clamps spikes and does nothing for the voltage drops causing these reboots.
<!-- {"id":"COMPTIA-NET-009-Q095","objective":"2.4","type":"diagnosis","source":"OBJN9","locator":"Objective 2.4 power, UPS","verified":"2026-10-10"} -->

---

### Q96
A tech finishes a switch installation in a two-post rack. Which cabling practice most reduces future troubleshooting time?
- A) Zip ties pulled as tight as possible
- B) No labels to save time
- C) Cables draped across the floor
- D) Velcro-dressed cable bundles with labels on both ends

**Answer: D**
Labeled, loosely dressed cables with slack make moves and diagnosis fast and avoid damaging conductors. Over-tight zip ties deform cable geometry and hurt performance; unlabeled spaghetti guarantees future pain.
<!-- {"id":"COMPTIA-NET-009-Q096","objective":"2.4","type":"recall","source":"OBJN9","locator":"Objective 2.4 cable management","verified":"2026-10-10"} -->

---

### Q97
A camera installer wants to mount an AP outdoors on a pole. Which installation factors matter most? (Choose two.)
- A) Weatherproof enclosures and proper grounding/lightning protection
- B) Line-of-sight and mounting height for the intended coverage
- C) Painting the AP black to absorb heat
- D) Using indoor-rated cable
- E) Disabling all LEDs

**Correct Answer: A, B**
Outdoor APs need environmental protection (sealed enclosures, outdoor-rated cable, grounding against surges/lightning) and RF planning (height, line of sight, antenna pattern). Indoor cable degrades outdoors, and paint traps heat.
<!-- {"id":"COMPTIA-NET-009-Q097","objective":"2.4","type":"diagnosis","source":"OBJN9","locator":"Objective 2.4 outdoor installation factors","verified":"2026-10-10"} -->

---

### Q98
A rack full of servers trips the circuit repeatedly when everything powers on together after an outage. What is the cause and fix?
- A) The network cables draw too much power
- B) Inrush current exceeds the circuit; stagger power-on or redistribute loads across circuits
- C) Servers need smaller power supplies
- D) The rack is the wrong color

**Answer: B**
Simultaneous startup draws surge current beyond the breaker rating. Staggered boot, load balancing across circuits, and right-sized electrical service address it. It is an electrical planning issue, not a network one.
<!-- {"id":"COMPTIA-NET-009-Q098","objective":"2.4","type":"diagnosis","source":"OBJN9","locator":"Objective 2.4 power planning","verified":"2026-10-10"} -->

---

### Q99
A closet hits 95 degrees Fahrenheit every afternoon and switches randomly reboot. Beyond a band-aid fan, what should be assessed?
- A) The subnet scheme
- B) The rack screws
- C) HVAC capacity and ventilation for the space's heat load
- D) The brand of patch cables

**Answer: C**
Heat-related reboots mean the closet's cooling cannot handle the equipment's thermal output. Proper assessment covers airflow, venting, and cooling capacity; network configuration cannot fix a thermal problem.
<!-- {"id":"COMPTIA-NET-009-Q099","objective":"2.4","type":"diagnosis","source":"OBJN9","locator":"Objective 2.4 environmental, HVAC","verified":"2026-10-10"} -->

---

### Q100
A punch-down tool is used at a patch panel to terminate a Cat6 run. What is the key termination rule to preserve performance?
- A) Mix T568A and T568B on the same link randomly
- B) Use only four of the eight wires
- C) Keep twists maintained as close to the termination as possible and follow the T568 standard consistently
- D) Untwist each pair two inches for easier punching

**Answer: C**
Untwisting pairs beyond about half an inch destroys crosstalk immunity and fails certification. Consistent T568A or T568B pinning end-to-end keeps the link standard-compliant.
<!-- {"id":"COMPTIA-NET-009-Q100","objective":"2.4","type":"recall","source":"OBJN9","locator":"Objective 2.4 termination standards T568","verified":"2026-10-10"} -->

---

### Q101
A straight-through cable connects a PC to a switch, but a switch-to-switch link on old gear without auto-MDIX needs a different cable. Which one?
- A) A crossover cable (transmit and receive pairs swapped)
- B) A rollover console cable
- C) A coax patch
- D) A fiber patch

**Answer: A**
Crossover cables swap transmit and receive pairs so like devices (switch-switch, PC-PC) can link. Modern ports with auto-MDIX detect and adapt, making crossovers mostly a legacy concern.
<!-- {"id":"COMPTIA-NET-009-Q101","objective":"2.4","type":"recall","source":"OBJN9","locator":"Objective 2.4 cable types, crossover/auto-MDIX","verified":"2026-10-10"} -->

---

### Q102
A data-center row needs humidity control because the air is too dry. What risk does low humidity create for equipment?
- A) Corrosion of contacts
- B) Mold growth
- C) Electrostatic discharge damaging components
- D) Condensation shorting boards

**Answer: C**
Dry air promotes static buildup and ESD events that damage electronics. High humidity is the opposite problem, causing condensation and corrosion, which is why data centers hold humidity in a controlled band.
<!-- {"id":"COMPTIA-NET-009-Q102","objective":"2.4","type":"recall","source":"OBJN9","locator":"Objective 2.4 environmental, humidity","verified":"2026-10-10"} -->

---

### Q103
An engineer documents which switch port feeds which desk outlet. Where is this information kept for the team?
- A) In the engineer's memory only
- B) On a whiteboard photographed once
- C) Nowhere; discovery each time is fine
- D) In the site's network documentation and labeling scheme, updated at every change

**Answer: D**
Living documentation (port maps, labels, diagrams updated on change) is what turns hours of tracing into seconds of lookup. Memory and stale snapshots fail the first time someone else troubleshoots.
<!-- {"id":"COMPTIA-NET-009-Q103","objective":"2.4","type":"recall","source":"OBJN9","locator":"Objective 2.4 installation documentation","verified":"2026-10-10"} -->

---

### Q104
A fiber backbone between the MDF and an IDF will carry 10 Gbps over 300 meters. Which fiber type is appropriate?
- A) Multimode fiber (OM3/OM4 class) with matching optics
- B) Cat5e
- C) Coax RG-6
- D) Single-pair telephone wire

**Answer: A**
OM3/OM4 multimode fiber supports 10 Gbps at 300+ meters and costs less in optics than single-mode at this distance. Copper cannot span 300 meters at any Ethernet speed.
<!-- {"id":"COMPTIA-NET-009-Q104","objective":"2.4","type":"diagnosis","source":"OBJN9","locator":"Objective 2.4 fiber selection","verified":"2026-10-10"} -->

---

### Q105
A newly installed run fails its certification test with a NEXT (near-end crosstalk) failure. What is the likely workmanship issue?
- A) Pairs untwisted too far at terminations or a kinked/crushed cable
- B) The cable is too short
- C) The labels are wrong
- D) The rack is ungrounded

**Answer: A**
NEXT failures come from geometry problems at the ends: excessive untwist, bad punch-downs, or damaged cable. Certification testers pinpoint the pair and distance to the fault.
<!-- {"id":"COMPTIA-NET-009-Q105","objective":"2.4","type":"diagnosis","source":"OBJN9","locator":"Objective 2.4 cable certification, NEXT","verified":"2026-10-10"} -->

---

### Q106
A company wants device configurations backed up centrally and pushed consistently to all switches. Which approach supports this?
- A) DHCP reservations
- B) A shared spreadsheet of passwords
- C) Centralized configuration management (templates/version-controlled configs)
- D) Manual console edits per switch

**Answer: C**
Centralized config management stores versioned configurations, enforces consistency, and enables rapid restore after failure. Manual per-device edits drift and resist audit.
<!-- {"id":"COMPTIA-NET-009-Q106","objective":"2.4","type":"recall","source":"OBJN9","locator":"Objective 2.4 configuration management","verified":"2026-10-10"} -->

---

### Q107
A switch stack of three units must act as one logical device with one management address. Which technology provides this?
- A) Separate SSH sessions per unit
- B) VLAN 1 on every port
- C) Port mirroring
- D) Switch stacking with a stack interconnect

**Answer: D**
Stacking cables/modules join physical switches into one logical chassis: single management, shared forwarding, simplified design. It differs from simple uplinking, where each switch stays independently managed.
<!-- {"id":"COMPTIA-NET-009-Q107","objective":"2.2","type":"recall","source":"OBJN9","locator":"Objective 2.2 switch stacking","verified":"2026-10-10"} -->

---

### Q108
An uplink between buildings must survive one fiber strand being cut. What design element provides this?
- A) Redundant diverse-path links with a failover protocol
- B) A single longer cable
- C) Higher-wattage optics
- D) A bigger patch panel

**Answer: A**
Physical redundancy along diverse paths, plus rapid failover (STP, aggregation across paths, or routed failover), survives a single cut. Any single-path design is one backhoe away from an outage.
<!-- {"id":"COMPTIA-NET-009-Q108","objective":"2.4","type":"diagnosis","source":"OBJN9","locator":"Objective 2.4 redundancy, path diversity","verified":"2026-10-10"} -->

---

### Q109
A VoIP phone boots but lands in the data VLAN instead of the voice VLAN, so QoS and DHCP options are wrong. What configures the phone's VLAN on a switch port?
- A) A crossover adapter
- B) The voice VLAN (auxiliary VLAN) setting advertised to the phone via CDP/LLDP
- C) A second cable
- D) A static ARP entry

**Answer: B**
Switch ports advertise the voice VLAN to phones via discovery protocols; the phone tags its traffic while the PC stays untagged on the data VLAN. This is the standard one-drop phone-plus-PC design.
<!-- {"id":"COMPTIA-NET-009-Q109","objective":"2.2","type":"diagnosis","source":"OBJN9","locator":"Objective 2.2 voice VLAN","verified":"2026-10-10"} -->

---

### Q110
A guest VLAN must reach only the internet. Which switch/routing control enforces the boundary?
- A) Jumbo frames
- B) ACLs or firewall rules denying RFC 1918 destinations from the guest VLAN
- C) A longer SSID name
- D) Disabling STP on the guest VLAN

**Answer: B**
Segmentation is enforced where the VLAN is routed: ACLs or firewall policies permitting internet-bound traffic and denying internal ranges. Naming and frame-size settings have no security effect.
<!-- {"id":"COMPTIA-NET-009-Q110","objective":"2.2","type":"diagnosis","source":"OBJN9","locator":"Objective 2.2 VLAN segmentation ACLs","verified":"2026-10-10"} -->

---

### Q111
A fiber link is down after construction in the ceiling. The light meter shows a very weak signal at the far end. Which tool localizes the break?
- A) A loopback plug
- B) An OTDR (optical time-domain reflectometer)
- C) A tone generator
- D) A Wi-Fi analyzer

**Answer: B**
An OTDR sends pulses down the fiber and maps reflections to distance, pinpointing breaks, bends, and bad splices. Toning finds copper pairs; Wi-Fi analyzers and loopbacks do not touch fiber faults.
<!-- {"id":"COMPTIA-NET-009-Q111","objective":"2.4","type":"recall","source":"OBJN9","locator":"Objective 2.4 fiber tools OTDR","verified":"2026-10-10"} -->

---

### Q112
A new 10GBASE-T link keeps dropping. The run is Cat5e at 70 meters. What is the most probable fix?
- A) Lower the MTU
- B) Recable with Cat6a, the category rated for 10GBASE-T at full distance
- C) Add repeaters every meter
- D) Switch to coax

**Answer: B**
10GBASE-T over Cat5e is unreliable beyond short distances; Cat6a is the specified medium for 10G copper to 100 meters. The fix is the cable plant, not protocol tuning.
<!-- {"id":"COMPTIA-NET-009-Q112","objective":"2.4","type":"diagnosis","source":"OBJN9","locator":"Objective 2.4 copper categories 10GBASE-T","verified":"2026-10-10"} -->

---

### Q113
A rack's patch panel uses T568A while the wall jacks were punched T568B. Some links fail certification. Why?
- A) A and B differ only in color, so the panel is fine
- B) Certification testers cannot read Cat6
- C) The links are too short
- D) Mixed pinning standards on the same link swap pairs and break the pinout

**Answer: D**
T568A and T568B swap the orange and green pairs. Consistency end-to-end is mandatory; mixing them on one link miswires pairs. Either standard works, but only one per link.
<!-- {"id":"COMPTIA-NET-009-Q113","objective":"2.4","type":"diagnosis","source":"OBJN9","locator":"Objective 2.4 T568A/B consistency","verified":"2026-10-10"} -->

---

### Q114
A company policy requires all device management traffic to travel encrypted, authenticated tunnels from a dedicated workstation VLAN. Which protocol choices comply? (Choose two.)
- A) SSH
- B) HTTPS to device GUIs
- C) Telnet
- D) HTTP
- E) SNMPv1

**Correct Answer: A, B**
SSH and HTTPS encrypt management sessions and authenticate endpoints. Telnet, HTTP, and SNMPv1/v2c transmit credentials or community strings in cleartext and fail the policy.
<!-- {"id":"COMPTIA-NET-009-Q114","objective":"2.4","type":"recall","source":"OBJN9","locator":"Objective 2.4 secure management protocols","verified":"2026-10-10"} -->

---

### Q115
A branch needs its WAN router to keep working if the primary power feed fails for hours. Which facility planning items apply? (Choose two.)
- A) A UPS for ride-through and graceful behavior
- B) A generator contract or transfer switch for extended outages
- C) A second router with no power
- D) Darker paint on the rack
- E) More patch cables

**Correct Answer: A, B**
Short events are a UPS's job; multi-hour continuity needs generation. Redundant hardware without power continuity does not help when the whole room goes dark.
<!-- {"id":"COMPTIA-NET-009-Q115","objective":"2.4","type":"diagnosis","source":"OBJN9","locator":"Objective 2.4 power continuity planning","verified":"2026-10-10"} -->

---

### Q116
A wall jack tests fine with a basic continuity tester but gigabit negotiates down to 100 Mbps. What should the tech suspect?
- A) One or more pairs marginal or miswired: continuity passes but the four-pair quality gigabit needs is absent
- B) The NIC is too new
- C) The switch is too fast
- D) The jack color is wrong

**Answer: A**
100 Mbps uses two pairs; gigabit needs all four healthy. A cheap continuity tester cannot measure pair quality, so a wiremap/certification test is the next step to find the bad pair or termination.
<!-- {"id":"COMPTIA-NET-009-Q116","objective":"2.4","type":"diagnosis","source":"OBJN9","locator":"Objective 2.4 pair faults, gigabit downgrade","verified":"2026-10-10"} -->

---

### Q117
A small branch router connects to the ISP via a serial handoff at the demarc. What is the demarcation point's significance?
- A) It is where DNS lives
- B) It is the wireless edge
- C) It is always the server room
- D) It marks where provider responsibility ends and customer premises equipment begins

**Answer: D**
The demarc is the responsibility boundary: provider-side faults are the carrier's problem, premises-side faults are yours. Knowing it shapes every WAN troubleshooting call.
<!-- {"id":"COMPTIA-NET-009-Q117","objective":"2.4","type":"recall","source":"OBJN9","locator":"Objective 2.4 demarcation point","verified":"2026-10-10"} -->

---

### Q118
A smart jack at the demarc allows the carrier to test the line remotely. What feature makes it useful to both sides?
- A) Built-in Wi-Fi
- B) DHCP serving
- C) Packet capture storage
- D) Loopback capability for remote line testing

**Answer: D**
Smart jacks (network interface devices with intelligence) let the provider loop the circuit back and test up to the demarc without a site visit, cleanly splitting provider versus customer fault domains.
<!-- {"id":"COMPTIA-NET-009-Q118","objective":"2.4","type":"recall","source":"OBJN9","locator":"Objective 2.4 smart jack","verified":"2026-10-10"} -->

---

### Q119
A campus backbone upgrade from 1G to 10G reuses existing single-mode fiber between buildings. Which optics change is required?
- A) None; fiber speed is automatic
- B) Swap the transceivers on both ends to 10G single-mode types matched to the fiber and distance
- C) Replace single-mode with multimode
- D) Change connectors from LC to RJ45

**Answer: B**
Fiber plants often outlive several speed generations; the transceivers determine the rate. Both ends need matching 10G optics of the correct wavelength and reach for single-mode fiber.
<!-- {"id":"COMPTIA-NET-009-Q119","objective":"2.4","type":"diagnosis","source":"OBJN9","locator":"Objective 2.4 optics upgrade","verified":"2026-10-10"} -->

---

### Q120
A new office's cable plant passed certification, but six months later several runs fail. The ceiling installers strapped data cables to fluorescent light fixtures. What principle was violated?
- A) Color-coding conventions
- B) Separation of data cabling from EMI sources and proper pathway support
- C) The 90-meter rule
- D) The 5-4-3 rule

**Answer: B**
Power fixtures and motors radiate interference that degrades twisted-pair runs over time, and improper support stresses cable. Pathway standards exist to keep low-voltage cabling away from electrical noise and physical stress.
<!-- {"id":"COMPTIA-NET-009-Q120","objective":"2.4","type":"diagnosis","source":"OBJN9","locator":"Objective 2.4 EMI separation, pathways","verified":"2026-10-10"} -->

---
