# Unified Inbox Practical Test — Interview & Evaluation Guide (90 Minutes)

## 1) Purpose

This document defines how to **run and evaluate the Unified Inbox practical interview test**.

The goal is to assess whether a candidate can **deliver a practical feature slice under time constraints**, demonstrating real-world engineering ability.

Evaluation focuses on:

* Practical engineering ability
* Decision quality under time pressure
* End-to-end feature ownership
* Code clarity and maintainability

Not the focus:

* Algorithm puzzles
* Trivia-style framework questions
* Memorized knowledge

---

# 2) Interview Setup

Before starting the test:

1. Share the **repository** and `README.md` with the candidate.
2. Confirm the following rules:

   * Internet and documentation are allowed.
   * AI coding agents are **not allowed**.
3. Explain the **time limit (90 minutes)**.
4. Ask the candidate to **verbalize tradeoffs when possible**.
5. Reserve the **last 5–10 minutes for a walkthrough discussion**.

---

# 3) What Interviewers Should Observe

### A. Planning

Look for whether the candidate:

* Breaks the problem into milestones
* Identifies the core requirements first
* Prioritizes functionality over polish

### B. Execution

Observe whether the candidate:

* Keeps code changes localized and readable
* Tests behavior before declaring completion
* Avoids unnecessary rewrites

### C. Ownership

Strong candidates often:

* Handle edge cases without prompting
* Make reasonable assumptions and state them
* Leave notes on completed vs skipped work

### D. Communication

Look for ability to:

* Explain tradeoffs clearly
* Defend implementation decisions
* Identify risks in their approach

---

# 4) Evaluation Goal

Evaluate whether the candidate can independently deliver a **practical feature slice** in limited time.

Primary signals:

* Functional correctness
* End-to-end execution ability
* Prioritization and ownership
* Code quality under time pressure

---

# 5) Scoring Model

* Base score: **100**
* Optional bonus: **+10**
* Recommended pass band: **70+**
* Strong hire band: **80+**

---

# 6) Base Rubric (100 Points)

## 1. Functional Correctness (35)

Evaluate whether:

* Conversation selection works correctly
* Clicking a row updates the active thread
* Realtime reducer behavior works for required event types
* Conversation ordering stays correct (`updatedAt` descending)
* Thread actions trigger expected state changes

---

## 2. Code Quality and Maintainability (20)

Look for:

* Clear naming and readable control flow
* Correct immutable state updates
* Minimal duplication
* Avoidance of brittle shortcuts

---

## 3. UI / UX Execution (10)

Check whether the UI includes:

* Active state indication
* Unread badges
* Status chips
* Channel labels

Also verify:

* Loading states
* Empty states
* No-selection state
* Pending / error feedback for actions

---

## 4. Full-Stack / API Integration (15)

Evaluate whether:

* `POST /api/conversations/[id]/action` exists
* Request shape is handled correctly
* Response event shape matches `RealtimeEvent`
* UI consumes API response correctly
* State updates flow through the reducer

---

## 5. Ownership and Problem-Solving (20)

Strong signals include:

* Sensible implementation order
* At least one **complete end-to-end flow**
* Clear documentation of skipped work in `NOTES.md`
* Ability to explain tradeoffs

---

# 7) Partial Credit Rules

Thread action and API scope are intentionally time-boxed.

### Full Credit

* API route implemented
* At least one action fully working:

```
UI → API → reducer → state update
```

* Proper pending/error handling

### Partial Credit

* Actions implemented locally or mocked
* Limited API integration

### Low Credit

* UI buttons exist but functionality is incomplete

---

# 8) Optional Bonus (+10)

Award bonus points for **sorting or filtering features**.

Possible implementations:

* Search by contact name
* Search by email (if candidate adds it)
* Filter by conversation status
* Filter by channel
* Correct combined filtering logic
* Proper empty-result state

Bonus points **must not override major failures in core functionality**.

---

# 9) Decision Bands

| Score           | Recommendation |
| --------------- | -------------- |
| 80–100 (+bonus) | Strong Hire    |
| 65–79           | Hire / Hold    |
| Below 65        | No Hire        |

Decision may depend on role seniority and team needs.

---

# 10) Red Flags

Watch for:

* Reducer logic missing or incorrect
* State mutation breaking reliability
* No complete end-to-end action flow
* Excessive UI polish while logic is incomplete
* Inability to explain implementation choices

---

# 11) Walkthrough Discussion (5–10 Minutes)

Ask the candidate:

1. What implementation order did you choose and why?
2. Which part of the problem was highest risk?
3. What is fully complete vs partially complete?
4. What would you build next with **2 more hours**?
5. How would you productionize this system?

---

# 11.5) Internal Reliability Note (Interviewer Only)

Do not disclose this note to candidates before or during the test.

The mock realtime stream intentionally includes:

* Occasional duplicate `message:new` deliveries with the same `message.id`
* Occasional delayed/out-of-order `message:new` deliveries with older `createdAt`

Use this to evaluate deeper engineering quality:

* Idempotency handling in reducer logic
* Recency/order stability when late events arrive
* Correctness of unread counters and preview behavior under noisy delivery
* Ability to explain root cause and justify a robust fix

---

# 12) Interviewer Summary Template

After the interview, summarize:

* Core feature coverage:
* Realtime reducer quality:
* End-to-end action coverage:
* API integration depth:
* UI completeness:
* Bonus (sorting/filtering): none / partial / complete
* Ownership signal: low / medium / high
* Key risks:
* Final recommendation: **strong hire / hire / hold / no hire**

---
