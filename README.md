# Unified Inbox Practical Coding Test (90 Minutes)

## 1) Goal

Build a small end-to-end feature slice for an omnichannel inbox MVP.

This starter project already has:
- Conversation list (left panel)
- Active thread view (right panel)
- Mock agents, conversations, and messages
- Mock realtime event source

You must decide implementation order and priorities.

## 2) Time and Rules

- Time limit: 90 minutes
- Internet/docs are allowed
- AI coding agents are not allowed (for example: Codex, Claude Code, Cursor agent mode)
- Keep changes focused on this repository

## 3) Core Requirements

### A. UI updates

- Improve conversation list row UI with:
  - Active state
  - Unread badge
  - Status (`open`, `pending`, `resolved`)
  - Channel label (`whatsapp`, `messenger`, `email`)

- Ensure clear UI states:
  - Loading
  - No conversation selected
  - Empty conversation list

### B. Realtime reducer

- Implement `applyRealtimeEvent(state, event)` in `src/lib/store.ts`
- Support all event types:
  - `message:new`
  - `conversation:read`
  - `conversation:status`
  - `conversation:assign`

- Keep `conversationOrder` sorted by `updatedAt` (descending)

### C. Thread actions

- Add actions in thread UI:
  - Mark as read
  - Change status
  - Assign/unassign agent

### D. API integration (minor full-stack)

- Implement `POST /api/conversations/[id]/action`
- Request body formats:
  - `{ "type": "read" }`
  - `{ "type": "status", "status": "open|pending|resolved" }`
  - `{ "type": "assign", "agentId": "a1" }`
  - `{ "type": "assign", "agentId": null }`
- Response:
  - Return a normalized realtime event matching existing `RealtimeEvent` types

- Connect thread actions to API:
  - Call API from action controls
  - Apply returned event through reducer flow
  - Show basic pending/error state in UI

Notes:
- In-memory/mock behavior is acceptable
- No auth or database persistence required

## 4) Realtime Event Rules

### `message:new`

Event shape: `{ type: "message:new", payload: message }`

1. If conversation does not exist, return current state
2. Append message to that conversation's messages
3. Update conversation:
  - `lastMessageId = message.id`
  - `updatedAt = message.createdAt`
  - `unreadCount += 1` only when `conversationId !== activeConversationId`
4. Reorder `conversationOrder` by `updatedAt` descending

### `conversation:read`

Event shape: `{ type: "conversation:read", payload: { conversationId } }`

1. If conversation does not exist, return current state
2. Set `unreadCount = 0`
3. Set `updatedAt = Date.now()`
4. Reorder `conversationOrder`

### `conversation:status`

Event shape: `{ type: "conversation:status", payload: { conversationId, status } }`

1. If conversation does not exist, return current state
2. Set `status = payload.status`
3. Set `updatedAt = Date.now()`
4. Reorder `conversationOrder`

### `conversation:assign`

Event shape: `{ type: "conversation:assign", payload: { conversationId, agentId } }`

1. If conversation does not exist, return current state
2. Set `assignedAgentId = payload.agentId`
3. Set `updatedAt = Date.now()`
4. Reorder `conversationOrder`

## 5) Constraints

- Keep updates immutable
- Do not mutate existing objects/arrays
- Keep business logic in store/reducer layer
- Ignore unknown conversation IDs safely
- Keep code readable and production-lean

## 6) Bonus (Optional)

### Bonus A: Sorting and filtering

- Add conversation search/filtering:
  - Search by contact name (and email if added in your implementation)
  - Filter by status and channel
  - Optional unread-only toggle
  - Support combined search + filters
  - Show empty state when no records match

- Implementation can be:
  - Frontend local (state/selectors), or
  - Mock API-assisted

### Bonus B: Minimal reducer tests

- Add tests for:
  - `message:new`
  - One of: `conversation:read` or `conversation:status`

## 7) Run

```bash
npm install
npm run dev
```

## 8) Submission Checklist

- [ ] Core requirements completed
- [ ] `applyRealtimeEvent` implemented for all required events
- [ ] Thread action controls added
- [ ] API route implemented and integrated
- [ ] Loading/error handling for action requests
- [ ] Unknown IDs handled safely
- [ ] Conversation ordering remains correct
- [ ] (Optional) Sorting/filtering bonus done (local or mock API-backed)
- [ ] `NOTES.md` added
- [ ] `NOTES.md` includes:
  - [ ] What you completed
  - [ ] What you skipped
  - [ ] What you would do next with 2 more hours
