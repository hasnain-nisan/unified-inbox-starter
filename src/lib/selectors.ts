import { InboxState } from "./store";
export const selectActiveConversation = (s: InboxState) => s.activeConversationId ? s.conversationsById[s.activeConversationId] : null;
export const selectMessages = (s: InboxState, id: string) => s.messagesByConversationId[id] ?? [];
export const selectLastPreview = (s: InboxState, id: string) => {
  const msgs = s.messagesByConversationId[id];
  return msgs && msgs.length ? msgs[msgs.length - 1].text : "";
};
