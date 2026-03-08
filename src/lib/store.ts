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
  return {
    agentsById: {},
    conversationsById: {},
    conversationOrder: [],
    messagesByConversationId: {},
    activeConversationId: null,
    isLoading: true,
    error: null,
  };
}

function sortOrder(conversationsById: Record<string, Conversation>) {
  return Object.values(conversationsById)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map((c) => c.id);
}

export function inboxReducer(state: InboxState, action: any): InboxState {
  switch (action.type) {
    case "init": {
      const agentsById: Record<string, Agent> = {};
      for (const a of action.payload.agents) agentsById[a.id] = a;
      const conversationsById: Record<string, Conversation> = {};
      for (const c of action.payload.conversations) conversationsById[c.id] = c;
      const messagesByConversationId: Record<string, Message[]> = {};
      for (const m of action.payload.messages)
        (messagesByConversationId[m.conversationId] ||= []).push(m);
      const order = sortOrder(conversationsById);
      return {
        ...state,
        agentsById,
        conversationsById,
        conversationOrder: order,
        messagesByConversationId,
        activeConversationId: order[0] ?? null,
        isLoading: false,
      };
    }
    case "select":
      const conversation =
        state.conversationsById[action.payload.conversationId];
      conversation.unreadCount = 0;
      return {
        ...state,
        activeConversationId: action.payload.conversationId,
        conversationsById: {
          ...state.conversationsById,
          [conversation.id]: conversation,
        },
      };
    case "realtime":
      return applyRealtimeEvent(state, action.payload);
    default:
      return state;
  }
}

// Candidate TODO
export function applyRealtimeEvent(
  state: InboxState,
  event: RealtimeEvent,
): InboxState {
  switch (event.type) {
    case "conversation:status": {
      const { conversationId, status } = event.payload;
      const conversationsById = { ...state.conversationsById };
      const conv = conversationsById[conversationId];
      if (conv) {
        conversationsById[conversationId] = { ...conv, status };
      }
      return { ...state, conversationsById };
    }
    case "conversation:assign": {
      const { conversationId, agentId } = event.payload;
      const conversationsById = { ...state.conversationsById };
      const conv = conversationsById[conversationId];
      if (conv) {
        conversationsById[conversationId] = {
          ...conv,
          assignedAgentId: agentId,
        };
      }
      return { ...state, conversationsById };
    }
    case "conversation:read": {
      const { conversationId } = event.payload;
      const conversationsById = { ...state.conversationsById };
      const conv = conversationsById[conversationId];
      if (conv) {
        conversationsById[conversationId] = { ...conv, unreadCount: 0 };
      }
      return { ...state, conversationsById };
    }
    case "message:new": {
      const msg = event.payload;
      const allMsgs = [
        ...(state.messagesByConversationId[msg.conversationId] ?? []),
        msg,
      ];
      const conversationsById = { ...state.conversationsById };
      const conv = conversationsById[msg.conversationId];
      if (conv) {
        conversationsById[msg.conversationId] = {
          ...conv,
          lastMessageId: msg.id,
          updatedAt: msg.createdAt,
          unreadCount: conv.unreadCount + (msg.from === "customer" ? 1 : 0),
        };
      }
      return {
        ...state,
        messagesByConversationId: {
          ...state.messagesByConversationId,
          [msg.conversationId]: allMsgs,
        },
        conversationsById,
        conversationOrder: sortOrder(conversationsById),
      };
    }
    default:
      return state;
  }
}
