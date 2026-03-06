# Unified Inbox Practical Coding Test (90 Minutes)

## 1) Goal

Build a small end-to-end feature slice for an omnichannel inbox MVP.

You can choose your own implementation order and priorities.

## 2) Rules

- Time limit: 90 minutes
- Internet/docs are allowed
- AI coding agents are not allowed (for example: Codex, Claude Code, Cursor agent mode)
- Keep changes focused on this repository

## 3) Starter Baseline (Already Provided)

The starter already includes:
- Full-screen two-panel layout (conversation list + thread)
- Basic conversation rows with preview and timestamp
- Basic thread message rendering
- Loading and empty states for list/thread
- Mock data and mock realtime event source

Do not rebuild these from scratch unless needed for your solution.

## 4) Required Candidate Tasks

### A) Conversation List UI

Add/complete row UI features:
- Conversation selection wiring (click row -> active conversation changes)
- Active conversation state
- Unread badge
- Status chip (`open`, `pending`, `resolved`)
- Channel label (`whatsapp`, `messenger`, `email`)

### B) Realtime Reducer

Implement `applyRealtimeEvent(state, event)` in `src/lib/store.ts` for:
- `message:new`
- `conversation:read`
- `conversation:status`
- `conversation:assign`

Keep conversation order sorted by `updatedAt` descending.

### C) Thread Actions + API Integration

Add thread-level actions:
- Mark as read
- Change status
- Assign/unassign agent

Implementation approach (recommended):
- You may first implement actions locally in frontend state/reducer flow.
- Then connect those actions to API if time allows.

Implement API route:
- `POST /api/conversations/[id]/action`

Request body formats:
- `{ "type": "read" }`
- `{ "type": "status", "status": "open|pending|resolved" }`
- `{ "type": "assign", "agentId": "a1" }`
- `{ "type": "assign", "agentId": null }`

Response:
- Return a normalized realtime event matching existing `RealtimeEvent` types

Connect UI actions to API:
- Call API from thread controls
- Apply returned event via reducer flow
- Show pending/error state in the UI

Delivery expectation:
- At least one action should be completed end-to-end (UI + API + reducer flow).
- Remaining actions can be local/mock if time is limited.
- Clearly document what is local-only vs API-connected in `NOTES.md`.

Notes:
- In-memory/mock behavior is acceptable
- No auth or DB persistence required

## 5) Realtime Behavior Rules

### `message:new`

Event: `{ type: "message:new", payload: message }`

1. If conversation does not exist, return current state
2. Append message to conversation messages
3. Update conversation:
- `lastMessageId = message.id`
- `updatedAt = message.createdAt`
- `unreadCount += 1` only when `conversationId !== activeConversationId`
4. Reorder `conversationOrder` by `updatedAt` descending

### `conversation:read`

Event: `{ type: "conversation:read", payload: { conversationId } }`

1. If conversation does not exist, return current state
2. Set `unreadCount = 0`
3. Set `updatedAt = Date.now()`
4. Reorder `conversationOrder`

### `conversation:status`

Event: `{ type: "conversation:status", payload: { conversationId, status } }`

1. If conversation does not exist, return current state
2. Set `status = payload.status`
3. Set `updatedAt = Date.now()`
4. Reorder `conversationOrder`

### `conversation:assign`

Event: `{ type: "conversation:assign", payload: { conversationId, agentId } }`

1. If conversation does not exist, return current state
2. Set `assignedAgentId = payload.agentId`
3. Set `updatedAt = Date.now()`
4. Reorder `conversationOrder`

## 6) Constraints

- Keep updates immutable
- Do not mutate existing objects/arrays
- Keep business logic in store/reducer layer
- Ignore unknown conversation IDs safely
- Keep code readable

## 7) Bonus (Optional)

### Bonus A) Sorting and Filtering

Add conversation search/filtering:
- Search by contact name (and email if added by you)
- Filter by status and channel
- Optional unread-only toggle
- Support combined search + filters
- Show empty state when no records match

Implementation can be:
- Local frontend state/selectors
- Mock API-assisted

### Bonus B) Minimal Reducer Tests

Add tests for:
- `message:new`
- One of `conversation:read` or `conversation:status`

## 8) Run

```bash
npm install
npm run dev
```

## 9) Submission

Submit code and include `NOTES.md` with:
- What you completed
- What you skipped
- What you would do next with 2 more hours

Checklist:
- [ ] Conversation selection wired (clicking row updates active thread)
- [ ] Realtime reducer implemented for all required event types
- [ ] Thread actions added
- [ ] At least one thread action fully integrated with API
- [ ] Pending/error handling added
- [ ] Unknown IDs handled safely
- [ ] Conversation ordering remains correct
- [ ] (Optional) Sorting/filtering bonus completed
