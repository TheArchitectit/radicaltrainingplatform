# CompTIA Network+ N10-009 — Module N5 fixtures (October 23 cut, N5 scope)

## Domain 5: Network Troubleshooting (N10-009)

---

### Q1
A technician follows the standard troubleshooting methodology. After forming a theory of probable cause, what should the technician do next?
- A) Immediately implement the first fix that comes to mind
- B) Test the theory to determine whether it is confirmed
- C) Document the findings and close the ticket
- D) Replace the most recently changed component

**Answer: B**
The method's order is: identify the problem, establish a theory of probable cause, **test the theory** to determine the next step (resolve if confirmed, establish a new theory or escalate if not), then plan, implement, verify, and document. Implementing before testing risks acting on an unconfirmed guess, and documenting happens at the end, after outcomes are known.

---

### Q2
During troubleshooting, a technician wants to determine whether the fault is in the cabling or further up the stack. Which step of the troubleshooting methodology does testing this belong to?
- A) Establish a plan of action
- B) Verify full system functionality
- C) Test the theory to determine the cause
- D) Document findings, actions, and outcomes

**Answer: C**
Gathering evidence to confirm or refute a suspected cause — like checking the physical layer before higher layers — is exactly the "test the theory" step. Planning a fix (A) and verifying functionality (B) both come *after* a cause is established, and documenting (D) closes the process.

---

### Q3
A user cannot reach a server across the network. The technician pings the server and gets no reply, then pings the local switch gateway and gets a reply. Which tool-family and result pattern is this?
- A) A name-resolution failure, because ping uses DNS
- B) A physical or path fault beyond the local gateway, isolated by halving the path
- C) A performance symptom, because replies are slow
- D) A duplicate IP conflict, because the server does not answer

**Answer: B**
Pinging the nearby gateway works and pinging the far server fails — that result splits the path in half and localizes the fault beyond the gateway, before any cable is touched. This is isolate-by-halves with a safe test, exactly the method the lesson teaches. Ping does not depend on DNS when an IP is used (A), nothing here indicates degradation rather than absence (C), and a single silent server has many causes of which conflict is only one (D).

---

### Q4
Which tool is the right first choice to verify whether a hostname is resolving, and to what address?
- A) ping
- B) traceroute
- C) nslookup
- D) ipconfig

**Answer: C**
nslookup queries DNS directly and shows both whether resolution happens and which address a name resolves to — precisely the two facts needed. ping tests reachability (and can mask a resolution failure if given an IP), traceroute maps the path hop by hop, and ipconfig reads the local host's own configuration. Each tool answers one question; the name-resolution question belongs to nslookup.

---

### Q5
Users on a subnet report that a file transfer that used to take seconds now takes minutes, while web browsing is normal. The link lights are up and no configuration changed. How should this symptom be classified first?
- A) A hard failure — the transfer is broken and should be fixed
- B) A physical fault — replace the cables immediately
- C) A performance symptom — measure latency, loss, and throughput before acting
- D) A DNS problem — the server is resolving to the wrong address

**Answer: C**
The transfer still completes — it is degraded, not absent, which makes this a performance symptom. The correct first response is measurement (latency, loss, throughput/bandwidth) rather than invasive action, since "slow" without numbers cannot be tested against a cause. A hard failure would mean no transfer at all, cable replacement is invasive before any evidence, and DNS would affect browsing by name too.
