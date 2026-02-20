# Unified Inbox Frontend Exercise (40 Minutes, Offline)

## Candidate Brief

You are working on a SaaS unified inbox/chat product.

This starter app already includes:
- A conversation list (left)
- An active thread view (right)
- Mock data for agents, conversations, and messages
- A mock realtime event source

Your task is to implement realtime state updates correctly in the reducer layer.

## Timebox

- Total: 40 minutes
- Offline: do not use external resources

## Main Task

Implement realtime behavior in:
- `src/lib/store.ts`
- Function: `applyRealtimeEvent(state, event)`

Supported event types:
- `message:new`
- `conversation:read`
- `conversation:status`
- `conversation:assign`

## Expected Behavior

### 1) `message:new`
When event is `{ type: "message:new", payload: message }`:
1. If conversation does not exist, return current state.
2. Append message to that conversation's messages.
3. Update conversation:
- `lastMessageId = message.id`
- `updatedAt = message.createdAt`
- `unreadCount += 1` only when `conversationId !== activeConversationId`
4. Reorder `conversationOrder` by `updatedAt` (desc).

### 2) `conversation:read`
When event is `{ type: "conversation:read", payload: { conversationId } }`:
1. If conversation does not exist, return current state.
2. Set `unreadCount = 0`
3. Set `updatedAt = Date.now()`
4. Reorder `conversationOrder`.

### 3) `conversation:status`
When event is `{ type: "conversation:status", payload: { conversationId, status } }`:
1. If conversation does not exist, return current state.
2. Set `status = payload.status`
3. Set `updatedAt = Date.now()`
4. Reorder `conversationOrder`.

### 4) `conversation:assign`
When event is `{ type: "conversation:assign", payload: { conversationId, agentId } }`:
1. If conversation does not exist, return current state.
2. Set `assignedAgentId = payload.agentId`
3. Set `updatedAt = Date.now()`
4. Reorder `conversationOrder`.

## Constraints

- Keep updates immutable.
- Do not mutate existing state objects/arrays.
- Keep logic inside reducer/store layer.
- Keep implementation simple and readable.
- Ignore unknown conversation IDs safely.

## UI Checklist

Ensure these states work in the existing UI:
- Loading state
- No active conversation selected
- Active thread updates when new message arrives

No design/styling work is required.

## Optional (Bonus)

Add minimal reducer tests for:
- `message:new`
- One of `conversation:read` or `conversation:status`

## Run

```bash
npm install
npm run dev
```

## Candidate Submission Checklist

- [ ] Implemented `applyRealtimeEvent` for all four event types
- [ ] Kept state updates immutable
- [ ] Handled unknown conversation IDs without crash
- [ ] Maintained correct conversation ordering
- [ ] Verified UI behavior manually
- [ ] (Optional) Added minimal tests
