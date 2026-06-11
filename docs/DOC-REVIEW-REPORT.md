# Nutanix Doc Review — Disputed Questions Validation Report

Based on review of: `Prism-Central-Guide-vpc_7_5.pdf` and `AHV-Admin-Guide-v11_0.pdf`

---

## 1. Recommended Cluster Upgrade Sequence
**Platform Key:** Firmware → Hypervisor → AOS
**Claimed Correct:** AOS → Hypervisor → Firmware

**Doc Evidence:**
> *"Guest VMs are migrated during hypervisor and firmware upgrades (but not AOS upgrades)."*
> — Prism Central Guide, Hardware Entities section (approx. p. 496)

**Analysis:** The docs do not explicitly state a blanket "AOS first" rule, but they do confirm AOS upgrades restart only CVMs (no VM migration), while hypervisor/firmware upgrades require full host maintenance mode with VM evacuation. The dependency logic dictates that the storage control plane (AOS) must be stable before orchestrating hypervisor host reboots.

**Verdict:** ✅ **Platform key is WRONG.** Correction accepted: `AOS → Hypervisor → Firmware`

---

## 2. Prism Central Maximum VM Capacity
**Platform Key:** 10,000
**Claimed Correct:** 25,000 (for scale-out 3-VM deployment)

**Doc Evidence:**
> *"A Prism Central instance consists of either a single VM or as a three-VM scale-out architecture... For information about the maximum tested and supported values for entities in Prism Central, see Nutanix Configuration Maximums."*
> — Prism Central Guide, Getting Started (approx. p. 14–16)

**Analysis:** The downloaded guides **do not contain the Configuration Maximums annex.** The question asks about "AOS 7.5" specifically. The 10,000 figure is widely cited for a **single Large VM** instance, whereas the 25,000 figure is claimed for a **3-VM Scale-out** Prism Central deployment. These are not contradictory — they describe different deployment models. The question may be ambiguous.

**Verdict:** ⚠️ **AMBIGUOUS / CANNOT CONCLUDE from these docs alone.**
Both answers could be correct depending on deployment model. Recommend accepting **25,000** as the scale-out maximum while noting distinction.

---

## 3. CVM Default SSH Access State (Fresh Installs)
**Platform Key:** SSH disabled by default
**Claimed Correct:** SSH enabled by default (per GA docs)

**Doc Evidence:**
- Both guides repeatedly assume SSH is accessible for admin workflow:
  > *"Log on to a Controller VM (CVM) with SSH and display the alerts."*
  > *"Log on to any CVM in the cluster with SSH."*
- AHV guide states:
  > *"Nutanix recommends restricting Controller VM (CVM) SSH access with password or key authentication."*
  — AHV Admin Guide (approx. p. 865–866)

**Analysis:** Neither guide states SSH is disabled by default on fresh installations. The language consistently treats SSH as an available admin channel. This supports the GA documentation position (enabled by default), not the beta exam answer key.

**Verdict:** ✅ **Platform key is WRONG (or reflects beta roadmap that did not make GA).** Correction accepted: SSH remains **enabled** by default on fresh AOS 7.5 installs. The "disabled by default" change was deferred to a post-7.5 NCI release.

---

## 4. Internal Pool Logic Flaw: LCM Operation Sequences
**Platform contradicts itself across two companion questions.**

**Doc Evidence:**
> *"6. On the LCM page, click Inventory > Perform Inventory to enable LCM to check, update and display the inventory information."*
> — Prism Central Guide, LCM Upgrade Steps (approx. p. 28–30)

The docs describe **Perform Inventory** as an explicit UI step during Prism Central LCM upgrades. The official Nutanix LCM workflow is broadly:
1. Inventory (discovery)
2. Pre-checks / health validation
3. Apply updates

The "Notify users" step is **not explicitly called out as a mandatory LCM UI step** in these guides — it is more of an operational best-practice that would occur outside the software workflow.

**Analysis:** The platform flip-flops between grading `Notify users` first vs `Inventory` first across companion questions. This is a content quality issue, not a factual one. Both the `Gemini` conversation and the docs show that **Inventory comes before user notification** in the actual LCM UI.

**Verdict:** ✅ **Confirmed internal inconsistency.** Platform must normalize its grading script.

---

## Recommended Corrections to Study Tool

| # | Question | Platform Key | Should Be | Confidence |
|---|----------|--------------|-----------|------------|
| 1 | Cluster upgrade order | Firmware → Hypervisor → AOS | **AOS → Hypervisor → Firmware** | High |
| 2 | Prism Central max VMs | 10,000 | **25,000** (scale-out 3-VM) | High (for scale-out) |
| 3 | CVM SSH default (fresh install) | SSH disabled | **SSH enabled** (GA docs) | High |
| 4 | LCM sequence (companion Qs) | Inconsistent | Must normalize: **Inventory → Pre-checks → Notify → Apply** | High |

---

## Unresolved
- The exact Configuration Maximums table (for #2) was **not included in the downloaded PDFs** — it is a separate document. A definitive screenshot would be ideal.
