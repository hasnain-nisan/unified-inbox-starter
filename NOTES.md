# Submission Notes

## What I Completed

### Core Features

- **Conversation selection wiring** - Clicking a row in the conversation list updates the active thread view via `select` action
- **Active conversation state** - Active row is highlighted with blue background and border
- **Unread badge** - Shows count for conversations with unread messages (hides when 0)
- **Status chip** - Displays conversation status (Open/Pending/Resolved) with color-coded badges
- **Channel label** - Shows WhatsApp/Messenger/Email icons for each conversation

### Realtime Reducer (`applyRealtimeEvent`)

Implemented handlers for all required event types:

- **message:new** - Appends message, updates conversation metadata, increments unread count only for non-active conversations, reorders by `updatedAt`
- **conversation:read** - Sets `unreadCount = 0`, updates `updatedAt = Date.now()`, reorders conversations
- **conversation:status** - Updates status, sets `updatedAt = Date.now()`, reorders conversations
- **conversation:assign** - Updates assigned agent, sets `updatedAt = Date.now()`, reorders conversations

### Thread-Level Actions

- **Mark as read** - Button appears when unread count > 0, dispatches `markRead` action
- **Change status** - Dropdown selector (Open/Pending/Resolved) dispatches `setStatus` action
- **Assign/unassign agent** - Dropdown with agent list + "Unassigned" option dispatches `assignAgent` action

### Sorting & Filtering

- **Search by customer name** - Case-insensitive text search
- **Filter by status** - All/Open/Pending/Resolved
- **Filter by channel** - All/WhatsApp/Messenger/Email
- **Unread only toggle** - Checkbox to show only conversations with unread messages
- **Combined filters** - All filters work together
- **Empty states** - Different messages for "no matches" vs "no conversations"

---

## Checklist

- [x] Conversation selection wired - (clicking row updates active thread)
- [x] Realtime reducer implemented for all required event types
- [x] Thread actions added
- [ ] At least one thread action fully integrated with API
- [ ] Pending/error handling added
- [x] Unknown IDs handled safely
- [x] Conversation ordering remains correct
- [x] (Optional) Sorting/filtering bonus completed

---

## What I Would Do Next with 2 More Hours

#### 1. API Integration for Thread Actions

#### 2. Pending & Error Handling

#### 3. Enhanced Realtime Features
