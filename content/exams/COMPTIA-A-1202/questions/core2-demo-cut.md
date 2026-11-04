# CompTIA A+ Core 2 — B2/B4 demo cut (October 23 cut, ticketing and security scope)

## Domain 2: Security (220-1202)

---

### Q1
An email tells the recipient their account will be closed in 24 hours unless they click a link and sign in immediately. The sender address is `support@account-verify-helpdesk.example`. Which signal most strongly indicates phishing?
- A) The message mentions a 24-hour deadline
- B) The sender domain does not match the organization's real domain
- C) The message asks the user to sign in
- D) The email arrived during business hours

**Answer: B**
Urgency and a sign-in request are common in phishing, but they also appear in legitimate mail. The strongest single signal is the sender domain: `account-verify-helpdesk.example` is not the organization's domain, so the message is not from who it claims to be. Deadline pressure (A) is a tactic that raises the stakes, not proof; many real services also ask users to sign in (C); timing (D) tells you nothing. When in doubt, inspect the sender and navigate to the site yourself rather than using the link.

---

### Q2
A caller says they are from IT and need the user's password to apply an urgent security patch. What should the user do?
- A) Give the password now so the patch is not delayed
- B) Give only the username, not the password
- C) Decline and verify the request through a known IT channel
- D) Change the password after the call and then share it

**Answer: C**
IT staff do not need a user's password to apply a patch — that request is a social-engineering attempt (vishing), not a support procedure. The correct next action is to hang up and verify through a channel the user already trusts (the published help desk number, the IT portal, the known manager). Giving the password (A) hands over the account; sharing only a username (B) still confirms the user is a live target and helps the attacker; changing the password afterwards (D) does not undo a password that was already shared.

---

### Q3
A user receives an unexpected invoice attachment from a vendor they do recognize, but the message urges them to open it today to avoid a late fee, and the reply-to address differs from the usual vendor contact. Which response is safest?
- A) Open the attachment quickly and verify the amount later
- B) Forward the email to the vendor's known contact and ask whether they sent it
- C) Reply to the message and ask whether it is legitimate
- D) Delete the message without telling anyone

**Answer: B**
The mix of urgency, an unexpected attachment, and a mismatched reply-to is a classic phishing shape. The safe test is out-of-band verification: contact the vendor using a known-good address or phone number you already had, not the one in the suspicious message. Opening the attachment (A) risks malware; replying to the message (C) talks to whoever wrote it, which proves nothing; deleting silently (D) removes evidence and leaves the next target uninformed.

---

## Domain 4: Operational Procedures (220-1202)

---

### Q4
A technician is about to take over a ticket someone else started. Which ticket field is most important for picking up the work without re-diagnosing from zero?
- A) The technician's employee ID
- B) The time the ticket was created
- C) The symptom as reported, plus the tests already performed
- D) The priority level chosen by the help desk software

**Answer: C**
The handoff value of a ticket is the symptom and the trail of tests already run — what was ruled out is as important as what was found. That history is what lets the next technician start at the frontier instead of repeating work. Employee ID (A) is attribution, not diagnosis; creation time (B) helps with SLAs but not with the fix; the priority label (D) routes the work, it does not explain the fault.

---

### Q5
A resolution note says only: "Fixed it." What is missing that the next technician most needs?
- A) The user's phone number
- B) The cause, the change made, and how the fix was verified
- C) A screenshot of the desktop after the fix
- D) The model number of the workstation

**Answer: B**
A resolution note has to carry cause → change → verification. Without those, nobody can tell whether the right problem was solved, whether it will recur, or how to undo the change. Contact details (A) and hardware model (D) are useful metadata but they do not explain the fix; a desktop screenshot (C) rarely proves the user's own workflow works again, which is the verification that matters.

---

### Q6
A workstation could not resolve names. The technician found the DNS server field pointed at a decommissioned address, changed it to the correct server, and confirmed the user can open the intranet site by name again. Which resolution note is most useful?
- A) "Network OK now."
- B) "Changed DNS, user happy."
- C) "Cause: DNS server field set to decommissioned 10.0.0.9. Change: set DNS to 10.0.0.10. Verified: user opened intranet by name; nslookup resolves."
- D) "Ticket closed per user request."

**Answer: C**
Option C names the symptom layer (DNS), the actual cause, the exact change, and a verification the user cares about plus a measurable test. That is the note a stranger can act on. "Network OK now" (A) hides every useful fact; "Changed DNS, user happy" (B) records an action without cause or proof; closing per user request (D) may end the SLA clock but leaves no technical record.

---

### Q7
Before changing the DHCP scope on a production server that three floors of users depend on, what should the technician do first?
- A) Make the change quickly during business hours so users can report problems immediately
- B) Document the planned change, the expected result, the verification step, and the rollback
- C) Reboot the DHCP server to clear any stale leases
- D) Change one setting at a time with no written record, to keep the work fast

**Answer: B**
Change control at this scale is: write down what you will do before you do it. The note should cover the change, what you expect, how you will tell it worked, and how you will put it back if it does not. Changing live without a plan (A/D) turns a controlled edit into an outage with no rollback; rebooting first (C) is an invasive action that is not required to plan a scope change and may itself disrupt service.

---

### Q8
A user keeps their only backup on an external drive that stays plugged into the same desk as the workstation. What is the biggest risk of this setup?
- A) The drive is too slow for large files
- B) A single local copy can be lost to theft, fire, or ransomware along with the workstation
- C) External drives cannot store more than one backup generation
- D) The user has to remember to plug the drive in

**Answer: B**
This is one extra copy, on one medium, at one location — the opposite of the 3-2-1 idea. Ransomware that encrypts the workstation often reaches attached drives; theft or fire takes both copies at once. Speed (A) is a performance concern, not a backup-design failure; drives can hold many generations (C); remembering to plug in (D) is a reliability annoyance, not the structural risk of having no separated copy.
