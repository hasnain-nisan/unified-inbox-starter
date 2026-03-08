import type { Channel, ConversationStatus } from "./types";
import { InboxState } from "./store";

export const selectActiveConversation = (s: InboxState) => s.activeConversationId ? s.conversationsById[s.activeConversationId] : null;
export const selectMessages = (s: InboxState, id: string) => s.messagesByConversationId[id] ?? [];
export const selectLastPreview = (s: InboxState, id: string) => {
  const msgs = s.messagesByConversationId[id];
  return msgs && msgs.length ? msgs[msgs.length - 1].text : "";
};

export type FilterState = {
  search: string;
  status: ConversationStatus | "";
  channel: Channel | "";
  unreadOnly: boolean;
};

export function selectFilteredConversationIds(
  state: InboxState,
  filters: FilterState
): string[] {
  const { search, status, channel, unreadOnly } = filters;
  const searchLower = search.trim().toLowerCase();
  const hasSearch = searchLower.length > 0;
  const hasStatusFilter = status !== "";
  const hasChannelFilter = channel !== "";

  return state.conversationOrder.filter((id) => {
    const conv = state.conversationsById[id];
    if (!conv) return false;

    if (unreadOnly && conv.unreadCount === 0) return false;
    if (hasStatusFilter && conv.status !== status) return false;
    if (hasChannelFilter && conv.channel !== channel) return false;

    if (hasSearch) {
      const nameMatch = conv.customerName.toLowerCase().includes(searchLower);
      const emailMatch = conv.email?.toLowerCase().includes(searchLower);
      if (!nameMatch && !emailMatch) return false;
    }

    return true;
  });
}
