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
    case "markRead": {
      const conv = state.conversationsById[action.payload.conversationId];
      if (!conv || conv.unreadCount === 0) return state;
      const updatedConv: Conversation = { ...conv, unreadCount: 0 };
      const updatedConversations = { ...state.conversationsById, [action.payload.conversationId]: updatedConv };
      return { ...state, conversationsById: updatedConversations };
    }
    case "setStatus": {
      const conv = state.conversationsById[action.payload.conversationId];
      if (!conv) return state;
      const updatedConv: Conversation = { ...conv, status: action.payload.status };
      const updatedConversations = { ...state.conversationsById, [action.payload.conversationId]: updatedConv };
      return { ...state, conversationsById: updatedConversations };
    }
    case "assignAgent": {
      const conv = state.conversationsById[action.payload.conversationId];
      if (!conv) return state;
      const updatedConv: Conversation = { ...conv, assignedAgentId: action.payload.agentId };
      const updatedConversations = { ...state.conversationsById, [action.payload.conversationId]: updatedConv };
      return { ...state, conversationsById: updatedConversations };
    }
    case "realtime":
      return applyRealtimeEvent(state, action.payload);
    default:
      return state;
  }
}

function updateConversationOrder(state: InboxState): string[] {
  return Object.values(state.conversationsById)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map((c) => c.id);
}

export function applyRealtimeEvent(state: InboxState, event: RealtimeEvent): InboxState {
  switch (event.type) {
    case "message:new": {
      const msg = event.payload;
      const conv = state.conversationsById[msg.conversationId];
      if (!conv) return state;

      const isInActiveConversation = msg.conversationId === state.activeConversationId;
      const updatedConv: Conversation = {
        ...conv,
        lastMessageId: msg.id,
        updatedAt: msg.createdAt,
        unreadCount: msg.from === "customer" && !isInActiveConversation ? conv.unreadCount + 1 : conv.unreadCount,
      };

      const updatedMessages = {
        ...state.messagesByConversationId,
        [msg.conversationId]: [...(state.messagesByConversationId[msg.conversationId] || []), msg],
      };

      const updatedConversations = {
        ...state.conversationsById,
        [msg.conversationId]: updatedConv,
      };

      return {
        ...state,
        conversationsById: updatedConversations,
        messagesByConversationId: updatedMessages,
        conversationOrder: updateConversationOrder({ ...state, conversationsById: updatedConversations }),
      };
    }

    case "conversation:read": {
      const conv = state.conversationsById[event.payload.conversationId];
      if (!conv || conv.unreadCount === 0) return state;

      const updatedConv: Conversation = { ...conv, unreadCount: 0, updatedAt: Date.now() };
      const updatedConversations = {
        ...state.conversationsById,
        [event.payload.conversationId]: updatedConv,
      };

      return {
        ...state,
        conversationsById: updatedConversations,
        conversationOrder: updateConversationOrder({ ...state, conversationsById: updatedConversations }),
      };
    }

    case "conversation:status": {
      const conv = state.conversationsById[event.payload.conversationId];
      if (!conv) return state;

      const updatedConv: Conversation = { ...conv, status: event.payload.status, updatedAt: Date.now() };
      const updatedConversations = {
        ...state.conversationsById,
        [event.payload.conversationId]: updatedConv,
      };

      return {
        ...state,
        conversationsById: updatedConversations,
        conversationOrder: updateConversationOrder({ ...state, conversationsById: updatedConversations }),
      };
    }

    case "conversation:assign": {
      const conv = state.conversationsById[event.payload.conversationId];
      if (!conv) return state;

      const updatedConv: Conversation = { ...conv, assignedAgentId: event.payload.agentId, updatedAt: Date.now() };
      const updatedConversations = {
        ...state.conversationsById,
        [event.payload.conversationId]: updatedConv,
      };

      return {
        ...state,
        conversationsById: updatedConversations,
        conversationOrder: updateConversationOrder({ ...state, conversationsById: updatedConversations }),
      };
    }

    default:
      return state;
  }
}
