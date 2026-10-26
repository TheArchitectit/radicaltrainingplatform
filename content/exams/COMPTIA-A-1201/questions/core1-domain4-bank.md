# CompTIA A+ Core 1 — Domain 4 beginner bank (virtualization and cloud)

## Domain 4: Virtualization and Cloud Computing (220-1201)

---

### Q66
A hypervisor runs directly on the server hardware, with no general-purpose operating system beneath it, and hosts several guest systems. Which type is it?
- A) Type 2, hosted on a desktop operating system
- B) A container runtime sharing one kernel
- C) Type 1, bare metal
- D) An emulator translating a different instruction set

**Answer: C**
A bare-metal hypervisor is itself the platform and gives guests direct access to hardware with low overhead. A Type 2 hypervisor (A) needs a host operating system. A container runtime (B) shares the host kernel and does not provide a full guest system. An emulator (D) is a different mechanism entirely.

---

### Q67
A technician must apply a major update to a production virtual machine and needs a fast rollback if the change misbehaves. Which action provides that?
- A) Take a snapshot before the update
- B) Add virtual processors to the machine
- C) Move the machine permanently to another host
- D) Convert the machine to physical hardware

**Answer: A**
A snapshot captures the machine's disk and memory state at that moment, so reverting restores the prior state in minutes. Adding processors (B) changes resources but not the software state. A permanent move (C) relocates the machine without preserving a prior state. Converting to physical hardware (D) is a migration, not a rollback.

---

### Q68
Two virtual machines share one host, and the second was given more memory than the host had free. Both now perform badly. What is the cause?
- A) The virtual network adapters are misconfigured
- B) The host is overcommitted on memory
- C) The guest systems have no swap space
- D) The hypervisor is running in a container

**Answer: B**
When the assigned memory across guests exceeds what the host can supply, the host reclaims pages and guests stall, which shows up as general slowness on both machines. Network adapters (A) would break connectivity rather than slow execution. Swap space (C) is a guest-side setting and cannot recover memory the host does not have. Containers (D) describe a different runtime model.

---

### Q69
A company shuts down its own mail server and moves staff to a hosted mail service that they reach with a browser or a mail client. Which service model is this?
- A) Infrastructure as a service
- B) Platform as a service
- C) Desktop as a service
- D) Software as a service

**Answer: D**
The provider runs the application itself, and the customer only uses it, which is the software-as-a-service model. Infrastructure (A) supplies servers and storage the customer administers. A platform (B) supplies a runtime for the customer's own code. Desktop as a service (C) delivers a hosted desktop, not a mail application.

---

### Q70
An online retailer gains capacity automatically during a seasonal peak and gives it back when the peak ends, without buying hardware. Which cloud characteristic is this?
- A) High availability
- B) Multitenancy
- C) Elasticity
- D) Geo-replication

**Answer: C**
Elasticity is the ability to grow resources on demand and release them afterwards, which is what the retailer is using. High availability (A) keeps a service running through failures. Multitenancy (B) describes several customers sharing infrastructure. Geo-replication (D) copies data across regions.

---

### Q71
Which statement about public and private cloud deployment is correct?
- A) A private cloud is provisioned for one organization's exclusive use
- B) Public cloud means any customer may read other customers' stored data
- C) A private cloud removes the need for security controls
- D) Public cloud is always less expensive than private cloud

**Answer: A**
A private cloud is dedicated to a single organization, whether it runs on premises or on dedicated provider infrastructure. Public cloud tenants are isolated from one another, so shared access to data (B) is wrong. Every cloud still needs controls (C). Cost (D) depends on the workload, which is why the claim is too strong.
