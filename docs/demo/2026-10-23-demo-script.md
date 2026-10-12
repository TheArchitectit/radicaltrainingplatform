# October 23 demo script — 90 seconds, four beats

**For:** the presenter at the podium. **Total:** 90 seconds for the loop, plus
the closing sentence. **Frozen head:** `0d1f565` (S47-13).

This is written against the artifact as it actually behaves at the frozen head —
not against the intended behaviour. Where the product has a known gap, the script
routes around it and says so in a footnote, so nobody discovers it live.

---

## Before doors (30 minutes)

1. Build from the frozen head `0d1f565`. Install the PWA on the demo host.
2. Run the demo sweep once on the actual machine.
3. Unplug the network. Confirm the app boots and the loop runs. **The tutor
   segment is the recorded example, so nothing in this script needs a network
   connection.** Leave the cable out.
4. Enter demo mode. Confirm the seed state on the DNS ticket (DNS server reads
   `10.42.100.99`).
5. Tape the reset location to the podium card — `/demo`, the **Reset station**
   button.

---

## The loop

### 0:00–0:15 — Learn

Open `/tracks`. Three tracks, each carrying the disclaimer.

> "Three certification tracks. This is a beginner preview — the coverage is
> labelled that way on screen, and I'll come back to what that means."

Open the A+ track, then the lesson **A2 — Networking basics**. Scroll to the DNS
section.

> "A user can reach the intranet by IP address but not by name. What would you
> check first?"

Take one answer from the room. Don't confirm it yet.

### 0:15–0:35 — Try

From the lesson, **Practice this exam ›**. A scored set draws only from the
reviewed items and says so on screen.

Let a student pick the answer and submit. Read the verdict and the rationale
aloud.

> "It tells you what you got and why — that's the whole loop: question, answer,
> reasoning."

### 0:35–0:55 — Ask

From the lesson, open the tutor. **Point at the mode label and read it out.**

> "This says **recorded example**. That means the answers were reviewed in
> advance and the station is not calling any AI service — you can see the line
> at the bottom of the panel."

Ask the demo prompt:

> "The website works by IP address but not by name. Give me one hint, not the
> answer."

The panel returns a hint that cites the lesson — a hint, not the answer, and not
a simulation action.

### 0:55–1:20 — Verify

Open **Guided Scenarios** and start the ticket **HR-2214: Site loads by IP, not
by name**.¹

The workstation shows DNS pointing at `10.42.100.99`. Have the room call the fix.
Set the DNS server to `10.42.100.10`, run **ping a known IP address** and
**nslookup example.com**, type a one-line resolution note, and submit.

The evidence panel shows requested vs actual configuration and the action trace,
and the checker awards completion.

> "It shows what you asked for, what was actually there, and every action taken —
> and it checks the work rather than trusting it."

### 1:20–1:30 — Reset

Open `/demo` and press **Reset station** once.

> "One click, and the next group starts clean. That's the loop."

---

## The three sentences to say plainly

Say these out loud, at least once, in your own time — they are the ones that
matter if anyone is listening to only part of this.

1. **This trains support and network skills on simulated systems. No patient or
   business system is involved.**
2. **Coverage is a beginner preview, not exam readiness.** Nothing here predicts
   a score or a pass.
3. The disclaimer, read from the screen. It is printed on every screen of the
   app and reads, exactly:

> This is independent study material. It is not official training and is not endorsed or approved by CompTIA, Nutanix, or any other certification body.

---

## If someone asks

**"Is this CompTIA training?"**
No — and the answer is on the screen. Point at the disclaimer and read it. Then:
the questions are original, written for this platform, which is exactly why the
disclaimer is there.

**"Can it tell me if I'll pass?"**
No. It tracks coverage and it grades practice. It does not predict a score, and
no screen will offer one.

**"Is the tutor a real AI?"**
Today it is the recorded example — reviewed in advance, labelled, no service
connected. A live version is evaluated but not switched on.

**"Does it touch real systems?"**
No. The scenarios are a local simulation. Every action mutates a local fixture
and nothing else.

**"Why is the scenario called a ticket?"**
Because support work is ticket work. The point is the diagnosis and the written
resolution, not clicking.

---

## If something breaks

- **Projector at an unexpected resolution** — the layout holds; if it does not,
  resize the window rather than the projector, and keep going.
- **The tutor segment fails** — say so and move on. The lesson and the ticket are
  the demo; the tutor is a bonus, and it is the recorded example anyway.
- **A student finishes the ticket early** — reset the station (one click) and
  start the next group.
- **Someone asks whether this is vendor-endorsed** — read the disclaimer. Do not
  improvise a softer version of it; the exact wording is the point.

---

## Do not say

- That a vendor endorsed it, signed off on it, or issued it.
- That it predicts a pass, a score, or readiness.
- That coverage is complete, or that a track is finished.
- That the tutor is a live model while the panel says **recorded example**.

---

## Footnotes

¹ **Reach it with the mouse.** The scenario nav item is not in the keyboard tab
order at the frozen head (REQ-DEMO-05, recorded in S47-10). The ticket itself is
fully keyboard-operable once open. If you are presenting keyboard-only, navigate
to `#/pc/scenarios` directly.

² **The purple DEMO MODE banner is always visible**, in learner mode too
(REQ-DEMO-02, recorded in S47-10). Do not use it to tell the audience which mode
they are watching; say it out loud instead.
