# OpenSpec SPEC-04 — CompTIA A+ Track (track-aplus)

**Source:** [OpenSpec package rtp-beginner-tracks-2026-10](../../drive-ingest-2026-10-10/RTP-Beginner-Tracks-Openspec-Change-Package-A-Network-NCA75-v2.md), SPEC-04
**Executed in:** [SPRINT-45](../SPRINT-45.md) (T-08 fixtures) + [SPRINT-47](../SPRINT-47.md) (T-19 cut) · **Gates:** TM-30 series · **Depends on:** SPEC-02 (manifests), SPEC-08A (RedEye lane)

## Alignment and frame

Official alignment: A+ V15, Core 1 (220-1201) and Core 2 (220-1202), objectives documents version 3.0 (fetched October 10, 2026). A+ requires BOTH cores — a Core-1-only demo is not “the A+ certification” and the UI never implies otherwise. The track is labeled **beginner preview** with visible objective coverage (REQ-MAN-07). All scored items are original; AI may draft under the SPEC-00 00.3 constraints; every scored item passes the RedEye lane with a written per-item log before release (SPEC-08A). Non-endorsement: REQ-BRAND-01/02 on every surface.

## Modules

### Core 1 (COMPTIA-A-1201)

| # | Module | Official domain | Weight |
|---|---|---|---|
| A1 | Mobile devices and accessories: laptop parts, docks, wireless, sync | Domain 1 | 13% |
| A2 | Networking basics: IP, gateway, DNS, DHCP, ports, Wi-Fi, SOHO | Domain 2 | 23% |
| A3 | Hardware and peripherals: CPU/RAM/storage, power, connectors, printers | Domain 3 | 25% |
| A4 | Virtualization and cloud: host vs guest, VM resources, service models | Domain 4 | 11% |
| A5 | Hardware/network troubleshooting: symptoms, safe tests, isolate, verify, document | Domain 5 | 28% |

### Core 2 (COMPTIA-A-1202)

| # | Module | Official domain | Weight |
|---|---|---|---|
| B1 | Operating systems: install, files, accounts, Windows tools, Linux/macOS intro | Domain 1 | 28% |
| B2 | Security: auth, permissions, phishing, malware response, safe disposal | Domain 2 | 28% |
| B3 | Software troubleshooting: OS/app failures, malware symptoms, mobile faults | Domain 3 | 23% |
| B4 | Operational procedures: tickets, backups, change control, safety, privacy, communication | Domain 4 | 21% |

Each module ships one 5-10 minute lesson, one short practice set, and one task or worked example.

## Requirements (normative)

| ID | SHALL | Scenario |
|---|---|---|
| REQ-AP-01 | Starter bank: 120 reviewed original items, 60 per core. Core 1 allocation 8/14/15/7/16 across A1-A5; Core 2 allocation 17/17/14/12 across B1-B4 — study allocations approximating official weights, stored in exam.json as study allocation, never presented as an official test model. | Validator: per-domain released counts equal the allocations; every item carries a complete provenance record. |
| REQ-AP-02 | October 23 cut: 24 reviewed items — 16 Core 1 networking/troubleshooting (A2/A5), 8 Core 2 ticketing/security (B2/B4) — plus one complete lesson per core (A2; B4). Other modules display as planned outlines. | Demo build: exactly the cut scope released, rest labeled planned, practice sets draw only from the 24 reviewed items. |
| REQ-AP-03 | Practice sets are separate from any later holdout assessment; no screen, export or tutor string claims pass prediction from this bank. | UI fixture sweep: no score screen contains a pass-probability or exam-readiness claim (snapshot-tested). |
| REQ-AP-04 | Virtualization illustrated by the existing PE VM-creation simulator, labeled in-line: “Nutanix example of a general concept.” Never presented as an A+ OS or hardware lab. | Lesson A4: label string present on the simulator link. |
| REQ-AP-05 | Hardware/printer/OS-tools objectives without simulation support ship as labeled worked examples, never fake interactive completions (Plan v2 L-08). | Modules A3/B1: no unsupported interactive claims; worked examples carry the label. |
| REQ-AP-06 | ≥50% of scored items are next-action/diagnosis items. CI counts `type: diagnosis` vs `type: recall` in front matter and fails below 50%. | 30/30 split passes; 29 diagnosis fails naming the deficit. |
| REQ-AP-07 | Simulator tie-in: the DNS help-desk ticket scenario (SPEC-07 `aplus-dns-01`). The demo tutor prompt — “The website works by IP address but not by name. Give me one hint, not the answer.” — is in the rehearsed tutor set and resolves to the reviewed DNS lesson. | Tutor evaluation set includes the prompt; citation lands on the A2 lesson. |

## Shared foundations lesson

One shared lesson, “How to diagnose without guessing,” opens both cores: identify symptoms → form a hypothesis → pick a safe test → isolate the cause → verify the fix → document the result. Every later lesson and both scenario tasks cite this loop. (REQ-AP-06: at least half of all scored A+ items ask for a next action or diagnosis rather than a definition.)

## October 23 cut outline (24 items)

- **Core 1 (16, A2/A5):** DNS purpose and symptom recognition (4); DHCP lease behavior (2); gateway role (2); port recognition (2); safe-test selection from a symptom (4); isolate-and-verify sequencing as single-choice next-step items (2).
- **Core 2 (8, B2/B4):** phishing signal recognition (3); ticket field purpose and resolution-note quality (3); change-control and backup basics (2).

Every cut item names its lesson, objective ID, reviewer and provenance record; the practice set draws only from these 24 and says so on screen.

## Lesson synopses (authoring targets)

- **A1 Mobile devices:** field-serviceable laptop parts; dock vs port replicator; USB-C/Thunderbolt display+power negotiation; pairing/sync (what actually syncs). Hook: docked laptop charges, no external display — check what first? Worked example: reading a laptop spec sheet.
- **A2 Networking basics (Oct 23 lesson):** the four things every host needs (IP, mask, gateway, DNS); DHCP and its failure modes; DNS and the “works by IP, not by name” symptom; ports as service doors (80/443/53); SOHO Wi-Fi (SSID, passphrase, 2.4 vs 5 GHz). Hook: read a workstation config panel, name the wrong field. **Citation target for the demo tutor prompt and aplus-dns-01.**
- **A3 Hardware:** CPU/RAM/storage bottleneck-by-symptom; PSU wattage/connector basics; display/USB connector families; printer concepts. Hook: symptom→subsystem matching. Worked example: build-parts compatibility check.
- **A4 Virtualization/cloud:** host vs guest; hypervisor in one paragraph; why resource allocation matters (vCPU, RAM, disk); IaaS/PaaS/SaaS with everyday analogies. PE simulator illustrates, labeled per REQ-AP-04.
- **A5 Troubleshooting:** the shared diagnosis loop on concrete cases; safe tests before invasive; isolate-by-halves; verify with the user’s own workflow; document. Hook: order-free “next step” items (ordering items stay quarantined per R-03).
- **B1 Operating systems:** what an OS install stages; files/paths/permissions at beginner level; accounts and least privilege; Windows toolbox (Task Manager, Settings vs Control Panel, File Explorer); Linux/macOS mapped to the same ideas.
- **B2 Security (Oct 23 partial):** authentication factors; permissions vs authentication; phishing anatomy (urgency, sender mismatch, link inspection); malware first response (isolate, report, no heroics); safe disposal (deleting ≠ erasing). Hook: sort real warning signs from noise in a synthetic message.
- **B3 Software troubleshooting:** OS won’t boot vs app won’t start vs everything is slow; malware symptoms masquerading as hardware faults; mobile app faults (cache, permissions, OS version).
- **B4 Operational procedures (Oct 23 lesson):** what a ticket is for (communication + history); backup basics (3-2-1 at concept level); change control as “write down what you will do before you do it”; safety/privacy habits; talking to a frustrated user. **Powers the ticketing half of the demo cut and the resolution-note step of aplus-dns-01.**

## Files

`content/exams/COMPTIA-A-1201/lessons/{a1..a5}.md`, `questions/core1-part1.md` (60 items); `content/exams/COMPTIA-A-1202/lessons/{b1..b4}.md`, `questions/core2-part1.md` (60 items); provenance JSON per item under `content/provenance/`. Multi-select uses `Correct Answer: B, D` form only (the “B and D” form is repaired globally in R-07 and forbidden in new content by lint).
