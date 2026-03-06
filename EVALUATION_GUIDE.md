# Interviewer Guide: Unified Inbox Practical Test

## 1) Purpose

Use this guide to evaluate production readiness, ownership, and practical full-stack delivery in a 90-minute in-office test.

Evaluation focus:
- Practical engineering ability
- Decision quality under time pressure
- End-to-end feature ownership

Not the focus:
- Algorithm puzzle performance
- Trivia-style framework recall

## 2) Interview Setup

1. Share repository and `README.md`.
2. Confirm rules:
  - Internet/docs allowed.
  - AI coding agents not allowed.
3. Ask candidate to verbalize tradeoffs while coding.
4. Reserve last 5 to 10 minutes for walkthrough.

## 3) What to Observe Live

### A. Planning

- Breaks problem into clear milestones
- Prioritizes core functionality before polish

### B. Execution

- Keeps changes localized and readable
- Avoids unnecessary rewrites
- Verifies behavior before declaring done

### C. Ownership

- Handles edge cases without prompting
- Makes reasonable assumptions and states them
- Leaves clear notes on done vs skipped work

### D. Communication

- Explains tradeoffs clearly
- Can defend key implementation decisions

## 4) Scoring Rubric

Base score: 100 points

1. Functional correctness (35)
  - Reducer logic for required event types is correct.
  - Conversation ordering remains correct.
  - UI actions trigger expected behavior.

2. Code quality and maintainability (20)
  - Clear naming and simple flow.
  - Immutable updates handled correctly.
  - No obvious brittle logic or unnecessary complexity.

3. UI/UX quality (10)
  - Clear visual hierarchy in list/thread.
  - Proper loading/empty/selected states.
  - Basic pending/error feedback is visible.

4. Full-stack integration quality (15)
  - API route behavior and input handling are sound.
  - Frontend integration is stable.
  - Returned event shape is correctly applied through reducer flow.

5. Ownership and problem-solving (20)
  - Prioritization is effective under time constraints.
  - Candidate adapts when blocked.
  - Solution is usable end-to-end, not fragmented.

### Optional bonus (+10 max)

Award additional points for sorting/filtering bonus:
- Search by contact name (and email if candidate added it)
- Filter by status and channel
- Correct combined logic
- Empty result state handled
- Implemented locally or via mock backend/API

## 5) Decision Bands

- 80 to 100: Strong hire
- 65 to 79: Hire or hold (depends on role level and team needs)
- Below 65: No hire for ownership-heavy roles

## 6) Strong Hire Signals

- Delivers core requirements with clean tradeoffs
- Reducer + API integration works with minimal defects
- Proactively handles edge cases
- Uses `NOTES.md` clearly and honestly
- Explains own code without confusion

## 7) Red Flags

- Spends excessive time polishing UI while core logic is incomplete
- Mutates state or introduces inconsistent state shape
- Handles only happy path, ignores errors/failures
- Needs repeated prompting to prioritize work
- Cannot explain why key implementation choices were made

## 8) Walkthrough Questions (5 to 10 Minutes)

1. What execution strategy did you choose, and why?
2. Which area was highest risk during implementation?
3. How did you keep state updates safe and predictable?
4. How would you evolve this toward real persistence and scale?
5. What would you improve next with one more day?

## 9) Recommendation Template

Use this summary per candidate:

- Core requirements coverage:
- Bonus coverage (sorting/filtering): none / partial / complete
- Quality: low / medium / high
- Ownership: low / medium / high
- Key risks:
- Final recommendation: strong hire / hire / hold / no hire
