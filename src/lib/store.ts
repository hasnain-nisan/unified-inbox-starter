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
  switch (event.type) {
    case "message:new": {
      const msg = event.payload;
      const conv = state.conversationsById[msg.conversationId];
      
      // If conversation does not exist, return current state
      if (!conv) return state;
      
      const existingMessages = state.messagesByConversationId[msg.conversationId] || [];
      
      if (existingMessages.some((m) => m.id === msg.id)) return state;
      
      const newMessagesByConversationId = {
        ...state.messagesByConversationId,
        [msg.conversationId]: [...existingMessages, msg]
      };
      
      // Update conversation: lastMessageId, updatedAt, and unreadCount
      const shouldIncrementUnread = state.activeConversationId !== msg.conversationId;
      const updatedConv = {
        ...conv,
        lastMessageId: msg.id,
        updatedAt: msg.createdAt,
        unreadCount: shouldIncrementUnread ? conv.unreadCount + 1 : conv.unreadCount
      };
      
      const newConversationsById = {
        ...state.conversationsById,
        [msg.conversationId]: updatedConv
      };
      
      // Reorder conversation order by updatedAt descending
      const newOrder = sortOrder(newConversationsById);
      
      return {
        ...state,
        conversationsById: newConversationsById,
        messagesByConversationId: newMessagesByConversationId,
        conversationOrder: newOrder
      };
    }
    case "conversation:read": {
      const { conversationId } = event.payload;
      const conv = state.conversationsById[conversationId];
      
      // If conversation does not exist, return current state
      if (!conv) return state;
      
      // Update conversation: set unreadCount to 0 and updatedAt
      const updatedConv = {
        ...conv,
        unreadCount: 0,
        updatedAt: Date.now()
      };
      
      const newConversationsById = {
        ...state.conversationsById,
        [conversationId]: updatedConv
      };
      
      // Reorder conversation order
      const newOrder = sortOrder(newConversationsById);
      
      return {
        ...state,
        conversationsById: newConversationsById,
        conversationOrder: newOrder
      };
    }
    
    case "conversation:status": {
      const { conversationId, status } = event.payload;
      const conv = state.conversationsById[conversationId];
      
      // If conversation does not exist, return current state
      if (!conv) return state;
      
      // Update conversation status and updatedAt
      const updatedConv = {
        ...conv,
        status,
        updatedAt: Date.now()
      };
      
      const newConversationsById = {
        ...state.conversationsById,
        [conversationId]: updatedConv
      };
      
      // Reorder conversation order
      const newOrder = sortOrder(newConversationsById);
      
      return {
        ...state,
        conversationsById: newConversationsById,
        conversationOrder: newOrder
      };
    }
    
    case "conversation:assign": {
      const { conversationId, agentId } = event.payload;
      const conv = state.conversationsById[conversationId];
      
      // If conversation does not exist, return current state
      if (!conv) return state;
      
      // Update conversation assignedAgentId and updatedAt
      const updatedConv = {
        ...conv,
        assignedAgentId: agentId,
        updatedAt: Date.now()
      };
      
      const newConversationsById = {
        ...state.conversationsById,
        [conversationId]: updatedConv
      };
      
      // Reorder conversation order
      const newOrder = sortOrder(newConversationsById);
      
      return {
        ...state,
        conversationsById: newConversationsById,
        conversationOrder: newOrder
      };
    }
    
    default:
      // Unknown event type — ignore safely
      return state;
  }
}
