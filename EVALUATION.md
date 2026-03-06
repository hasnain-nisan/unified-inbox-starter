# Unified Inbox Test Evaluation (90 Minutes)

## 1) Evaluation Goal

Evaluate whether a candidate can independently deliver a practical feature slice in limited time, with correct state logic and reasonable product judgment.

Primary signals:
- Functional correctness
- End-to-end execution ability
- Prioritization and ownership
- Code quality under time pressure

## 2) Scoring Model

- Base score: 100
- Optional bonus: +10
- Recommended pass band for strong consideration: 70+
- Strong hire band: 80+

## 3) Base Rubric (100)

1. Functional correctness (35)
- Conversation selection works (row click updates active thread).
- Realtime reducer behavior is correct for required event types.
- Conversation order remains correct (`updatedAt` descending).
- Thread actions produce expected state changes.

2. Code quality and maintainability (20)
- Clear naming and readable control flow.
- Immutable updates are implemented correctly.
- Low duplication and no brittle shortcuts.
- Changes are reasonably scoped.

3. UI/UX execution (10)
- Active state, unread badge, status chip, channel label are implemented clearly.
- Loading/empty/no-selection states are understandable.
- Pending/error feedback is visible when actions run.

4. Full-stack/API integration (15)
- `POST /api/conversations/[id]/action` exists and handles required request shapes.
- Response event shape is compatible with `RealtimeEvent`.
- UI consumes API response and updates state through reducer flow.

5. Ownership and problem-solving (20)
- Candidate chooses sensible implementation order.
- Delivers at least one complete flow end-to-end.
- Clearly documents done vs skipped work in `NOTES.md`.
- Can explain tradeoffs and risk areas in walkthrough.

## 4) Partial Credit Rules (Important)

Thread action/API scope is intentionally time-boxed.

Scoring guidance:
- Full credit in API integration category:
  - API route implemented, and at least one action is complete end-to-end (`UI + API + reducer`), with clear pending/error handling.
- Partial credit:
  - Actions implemented locally/mock only, with limited or no API connection.
- Low credit:
  - UI buttons exist but behavior is incomplete or inconsistent.

## 5) Optional Bonus (+10)

Award up to +10 for sorting/filtering:
- Search by contact name (and email if candidate added it).
- Filter by status and channel.
- Combined logic is correct.
- Empty-result state handled.
- Implemented locally or through mock API.

Bonus should not override critical failures in core requirements.

## 6) Decision Bands

- 80 to 100 (+bonus if any): Strong hire
- 65 to 79: Hire / hold (depends on role level and team composition)
- Below 65: No hire for ownership-heavy roles

## 7) Red Flags

- Realtime reducer remains largely incorrect or unimplemented.
- State mutation patterns that break reliability.
- No end-to-end completion for any action flow.
- Excessive focus on visual polish while core logic is incomplete.
- Cannot explain implementation decisions or tradeoffs.

## 8) Walkthrough Prompts (5-10 min)

1. What order did you choose and why?
2. Which part was highest risk?
3. What is fully complete vs partially complete?
4. What would you do next with 2 more hours?
5. How would you productionize this beyond mock state/API?

## 9) Interviewer Summary Template

- Core coverage:
- Realtime reducer quality:
- End-to-end action coverage:
- API integration depth:
- UI completeness:
- Bonus (sorting/filtering): none / partial / complete
- Ownership signal: low / medium / high
- Key risks:
- Final recommendation: strong hire / hire / hold / no hire
