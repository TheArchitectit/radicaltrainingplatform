# OpenSpec SPEC-05 — CompTIA Network+ Track (track-netplus)

**Source:** [OpenSpec package rtp-beginner-tracks-2026-10](../../drive-ingest-2026-10-10/RTP-Beginner-Tracks-Openspec-Change-Package-A-Network-NCA75-v2.md), SPEC-05
**Executed in:** [SPRINT-45](../SPRINT-45.md) (T-08 fixtures) + [SPRINT-47](../SPRINT-47.md) (T-20 cut) · **Gates:** TM-30 series · **Depends on:** SPEC-02 (manifests), SPEC-08A (RedEye lane)

## Alignment and frame

Official alignment: Network+ N10-009, objectives document version 4.0 (fetched October 10, 2026). CompTIA recommends A+-level knowledge and 9-12 months hands-on experience; the track is a learning entry point and the UI says so — without claiming the exam is designed for zero experience. Same originality, RedEye-lane review, nominative-naming and disclaimer constraints as SPEC-04.

## Modules (COMPTIA-NET-009)

| # | Module | Official domain | Weight |
|---|---|---|---|
| N1 | Networking concepts: OSI/TCP-IP, protocols and ports, addressing, subnet basics, media, cloud | Domain 1 | 23% |
| N2 | Network implementation: routing, switching, VLANs, wireless deployment, physical install | Domain 2 | 20% |
| N3 | Network operations: diagrams, inventory, monitoring, lifecycle/change, availability, recovery, services | Domain 3 | 19% |
| N4 | Network security: identity/access, segmentation, common threats, hardening | Domain 4 | 14% |
| N5 | Network troubleshooting: repeatable method, physical faults, service/config faults, performance, tools | Domain 5 | 24% |

Each module pairs one concept lesson with one scenario lesson. Required pairs: N1 DNS/DHCP + failed client; N2 VLANs + separated guest network; N3 monitoring + latency chart; N4 segmentation + deny/allow rule; N5 troubleshooting + misconfigured gateway.

## Requirements (normative)

| ID | SHALL | Scenario |
|---|---|---|
| REQ-NP-01 | Starter bank: 100 reviewed original items allocated 23/20/19/14/24 across N1-N5, stored as study allocations in exam.json. | Validator: released counts per domain equal the allocation; provenance complete. |
| REQ-NP-02 | October 23 cut: 25 reviewed items, five per domain, labeled “exploratory coverage” — explicitly not an exam-weighted test. Two complete lessons ship: N5 troubleshooting and N1 networking concepts; the N5 misconfigured-gateway scenario lesson ships with `netplus-gw-01` (SPEC-07). Remaining modules show as planned outlines. | Demo build: exactly two lessons and 25 items released, five per domain, exploratory-coverage label visible. |
| REQ-NP-03 | Cross-track concept reuse is explicit: the A+ DNS/DHCP explanation may be reused with a new objective mapping and different assessment depth; the same question is never counted as independent evidence in both tracks. | Provenance validator: reused item names both exam IDs and the reuse; duplicate item IDs across exams fail CI (REQ-MAN-05). |
| REQ-NP-04 | Routing protocols, subnetting drills, wireless design and packet analysis are declared gaps in exam.json (gap list), filled by labeled worked examples until interactive exercises exist; no fake interactivity. | Gap list topics render as worked examples with labels. |
| REQ-NP-05 | Existing PE/PC network screens may power a later “VLAN and VM NIC” lab only after the executor documents exactly which mutations those screens support; until documented, the lab is out of October 23 scope. The Nutanix UI is labeled as an illustration, not general network-vendor coverage. | T-NP-05 complete + supported-mutation list attached → lab schedulable; otherwise stays out. |
| REQ-NP-06 | Demo tutor prompt — “I can reach another device on my subnet, but nothing outside it. What should I check first, and why?” — is in the rehearsed set and resolves to the gateway lesson without operating the simulation. | Tutor evaluation set includes the prompt; citation lands on the N5 gateway lesson. |

## October 23 cut outline (25 items, five per domain)

- **N1:** address/mask/gateway/DNS roles (2); protocol-port pairing (1); OSI layer identification (1); subnet purpose (1).
- **N2:** VLAN purpose (2); switching vs routing decision (1); wireless security mode recognition (1); physical installation judgment (1).
- **N3:** baseline vs incident reading (2); diagram/inventory purpose (1); change-management sequencing as next-step items (1); recovery concept (1).
- **N4:** segmentation purpose (2); authentication factor recognition (1); threat recognition (1); hardening judgment (1).
- **N5:** method step selection (2); tool-to-symptom matching (2); performance vs fault discrimination (1).

All items original, reviewed, provenance-complete, labeled exploratory coverage — five-per-domain is a demonstration spread, not an exam-weighted test, and the screen says exactly that.

## Lesson synopses (authoring targets)

- **N1 concepts (Oct 23 lesson):** OSI/TCP-IP as a mailing analogy with exactly the layers a beginner needs; protocols and ports as agreed conventions; IPv4 addressing and why subnetting exists; DNS/DHCP revisited at Network+ depth (resolution path, lease lifecycle) — shared concept with A+ A2 at explicitly different depth (REQ-NP-03); media types; cloud/modern environments at concept level. Scenario lesson N1s: failed client — walk the resolution path from symptom to layer.
- **N2 implementation:** switching vs routing jobs; VLANs as separated neighborhoods on shared hardware; wireless deployment basics (placement, channels, security modes); physical installation hygiene. N2s: separated guest network — why the guest VLAN cannot reach the printer.
- **N3 operations:** diagrams and inventory as the map you need before the emergency; monitoring and baselines (“normal” is a measurement, not a feeling); lifecycle/change management; availability and recovery concepts. N3s: read a latency chart — say what changed and when.
- **N4 security:** identity/access basics; segmentation as damage control; common threats at recognition level; hardening as removing what you do not need. N4s: a deny/allow rule set — predict what passes.
- **N5 troubleshooting (Oct 23 lesson):** the repeatable method (identify, theorize, test, plan, verify, document) mapped to the A+ shared loop; physical vs service vs configuration faults; performance symptoms vs hard failures; the diagnostic toolkit (ping, traceroute, nslookup, ipconfig/ifconfig at concept level). N5s ships with `netplus-gw-01`: the misconfigured gateway — the demo prompt’s home.

## Files

`content/exams/COMPTIA-NET-009/lessons/{n1..n5}.md` plus scenario lessons `n1s..n5s`; `questions/net009-part1.md` (100 items); provenance per item; `exam.json` carrying the v4.0 source URL, review date and gap list.
