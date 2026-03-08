export type Channel = "whatsapp" | "messenger" | "email";
export type ConversationStatus = "open" | "pending" | "resolved";
export type Agent = { id: string; name: string };
export type Conversation = {
  id: string; channel: Channel; customerName: string; email?: string; unreadCount: number;
  assignedAgentId: string | null; status: ConversationStatus;
  lastMessageId: string; updatedAt: number;
};
export type Message = {
  id: string; conversationId: string; from: "customer" | "agent";
  text: string; createdAt: number;
};
export type RealtimeEvent =
  | { type: "message:new"; payload: Message }
  | { type: "conversation:status"; payload: { conversationId: string; status: ConversationStatus } }
  | { type: "conversation:assign"; payload: { conversationId: string; agentId: string | null } }
  | { type: "conversation:read"; payload: { conversationId: string } };
