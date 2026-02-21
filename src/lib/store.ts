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

export function applyRealtimeEvent(state: InboxState, event: RealtimeEvent): InboxState {
  switch (event.type) {
    case "message:new": {
      const message = event.payload;
      const conversationId = message.conversationId;
      const conversation = state.conversationsById[conversationId];
      
      if (!conversation) return state;
      
      const updatedConversation: Conversation = {
        ...conversation,
        lastMessageId: message.id,
        updatedAt: message.createdAt,
      };
      
      return {
        ...state,
        conversationsById: { ...state.conversationsById, [conversationId]: updatedConversation },
        messagesByConversationId: {
          ...state.messagesByConversationId,
          [conversationId]: [...(state.messagesByConversationId[conversationId] ?? []), message],
        },
        conversationOrder: sortOrder({ ...state.conversationsById, [conversationId]: updatedConversation }),
      };
    }
    
    case "conversation:read": {
      const { conversationId } = event.payload;
      const conversation = state.conversationsById[conversationId];
      
      if (!conversation) return state;
      
      const updatedConversation: Conversation = {
        ...conversation,
        unreadCount: 0,
        updatedAt: Date.now(),
      };
      
      return {
        ...state,
        conversationsById: { ...state.conversationsById, [conversationId]: updatedConversation },
        conversationOrder: sortOrder({ ...state.conversationsById, [conversationId]: updatedConversation }),
      };
    }
    
    case "conversation:status": {
      const { conversationId, status } = event.payload;
      const conversation = state.conversationsById[conversationId];
      
      if (!conversation) return state;
      
      const updatedConversation: Conversation = {
        ...conversation,
        status,
        updatedAt: Date.now(),
      };
      
      return {
        ...state,
        conversationsById: { ...state.conversationsById, [conversationId]: updatedConversation },
        conversationOrder: sortOrder({ ...state.conversationsById, [conversationId]: updatedConversation }),
      };
    }
    
    case "conversation:assign": {
      const { conversationId, agentId } = event.payload;
      const conversation = state.conversationsById[conversationId];
      
      if (!conversation) return state;
      
      const updatedConversation: Conversation = {
        ...conversation,
        assignedAgentId: agentId,
        updatedAt: Date.now(),
      };
      
      return {
        ...state,
        conversationsById: { ...state.conversationsById, [conversationId]: updatedConversation },
        conversationOrder: sortOrder({ ...state.conversationsById, [conversationId]: updatedConversation }),
      };
    }
    
    default:
      return state;
  }
}
