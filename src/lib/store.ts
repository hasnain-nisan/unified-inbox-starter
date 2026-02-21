import { Agent, Conversation, Message, RealtimeEvent } from "./types";

export type InboxState = {
  agentsById: Record<string, Agent>;
  conversationsById: Record<string, Conversation>;
  conversationOrder: string[];
  messagesByConversationId: Record<string, Message[]>;
  activeConversationId: string | null;
  isLoading: boolean;
  error: string | null;
};

export function initialInboxState(): InboxState {
  return { agentsById: {}, conversationsById: {}, conversationOrder: [], messagesByConversationId: {}, activeConversationId: null, isLoading: true, error: null };
}

function sortOrder(conversationsById: Record<string, Conversation>) {
  return Object.values(conversationsById).sort((a, b) => b.updatedAt - a.updatedAt).map((c) => c.id);
}

export function inboxReducer(state: InboxState, action: any): InboxState {
  switch (action.type) {
    case "init": {
      const agentsById: Record<string, Agent> = {};
      for (const a of action.payload.agents) agentsById[a.id] = a;
      const conversationsById: Record<string, Conversation> = {};
      for (const c of action.payload.conversations) conversationsById[c.id] = c;
      const messagesByConversationId: Record<string, Message[]> = {};
      for (const m of action.payload.messages) (messagesByConversationId[m.conversationId] ||= []).push(m);
      const order = sortOrder(conversationsById);
      return { ...state, agentsById, conversationsById, conversationOrder: order, messagesByConversationId, activeConversationId: order[0] ?? null, isLoading: false };
    }
    case "select":
      return { ...state, activeConversationId: action.payload.conversationId };
    case "realtime":
      return applyRealtimeEvent(state, action.payload);
    default:
      return state;
  }
}

// Candidate TODO
export function applyRealtimeEvent(state: InboxState, event: RealtimeEvent): InboxState {
  const conversationsById: Record<string, Conversation> = { ...state.conversationsById };
  const messagesByConversationId: Record<string, Message[]> = { ...state.messagesByConversationId };

  switch(event.type) {
      case "message:new": {
        const msg = event.payload;
        const conversation = conversationsById[msg.conversationId];
        if (!conversation) return state;
        const msgs = messagesByConversationId[msg.conversationId] ?? [];
        messagesByConversationId[msg.conversationId] = [...msgs, msg];
        const unreadIncrementer = msg.conversationId !== state.activeConversationId ? 1 : 0;
        conversationsById[msg.conversationId] = {
          ...conversation,
          lastMessageId: msg.id,
          updatedAt: msg.createdAt,
          unreadCount: conversation.unreadCount + unreadIncrementer
        };
      break;
    }
    case "conversation:status": {
      const { conversationId, status } = event.payload;
      const conversation = conversationsById[conversationId];
      if (!conversation) return state;
      conversationsById[conversationId] = { ...conversation, status, updatedAt: Date.now() };
      break;
    }

    case "conversation:assign": {
      const { conversationId, agentId } = event.payload;
      const conversation = conversationsById[conversationId];
      if (!conversation) return state;
      conversationsById[conversationId] = { ...conversation, assignedAgentId: agentId, updatedAt: Date.now() };
      break;
    }

    case "conversation:read": {
      const { conversationId } = event.payload;
      const conversation = conversationsById[conversationId];
      if (!conversation) return state;
      conversationsById[conversationId] = { ...conversation, unreadCount: 0, updatedAt: Date.now() };
      break;
    }
    default:
      return state;
  }
   const conversationOrder = sortOrder(conversationsById);
  return { ...state, conversationsById, messagesByConversationId, conversationOrder };
}
