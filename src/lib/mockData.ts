import { Agent, Conversation, Message } from "./types";
export const agents: Agent[] = [
  { id: "a1", name: "Nisan" },
  { id: "a2", name: "Ashik" },
  { id: "a3", name: "Rafi" }
];
export const conversations: Conversation[] = [
  { id: "c1", channel: "whatsapp", customerName: "Tanvir Hasan", unreadCount: 2, assignedAgentId: "a1", status: "open", lastMessageId: "m3", updatedAt: 1708362000000 },
  { id: "c2", channel: "messenger", customerName: "Jannat Ara", unreadCount: 0, assignedAgentId: null, status: "pending", lastMessageId: "m5", updatedAt: 1708361400000 },
  { id: "c3", channel: "email", customerName: "Fahim Chowdhury", unreadCount: 1, assignedAgentId: "a2", status: "resolved", lastMessageId: "m7", updatedAt: 1708361100000 }
];
export const messages: Message[] = [
  { id: "m1", conversationId: "c1", from: "customer", text: "Hi, I need help with pricing.", createdAt: 1708361600000 },
  { id: "m2", conversationId: "c1", from: "agent", text: "Sure — which plan are you considering?", createdAt: 1708361700000 },
  { id: "m3", conversationId: "c1", from: "customer", text: "Do you have a plan for small teams?", createdAt: 1708362000000 },
  { id: "m4", conversationId: "c2", from: "customer", text: "When will my order ship?", createdAt: 1708361200000 },
  { id: "m5", conversationId: "c2", from: "agent", text: "Checking — I'll get back to you shortly.", createdAt: 1708361400000 },
  { id: "m6", conversationId: "c3", from: "customer", text: "The issue is resolved, thanks!", createdAt: 1708361000000 },
  { id: "m7", conversationId: "c3", from: "agent", text: "Glad we could help. Have a great day!", createdAt: 1708361100000 }
];
