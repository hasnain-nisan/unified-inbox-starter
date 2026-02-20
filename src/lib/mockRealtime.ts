import { RealtimeEvent, Message } from "./types";
type Handler = (e: RealtimeEvent) => void;
const rand = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
export function subscribeMockRealtime(args: { conversationIds: string[]; agentIds: string[]; onEvent: Handler; }) {
  const texts = ["Hello?", "Any update?", "Thanks!"];
  const timer = setInterval(() => {
    const conversationId = rand(args.conversationIds);
    const msg: Message = {
      id: "m_" + Math.random().toString(16).slice(2),
      conversationId, from: "customer", text: rand(texts), createdAt: Date.now()
    };
    args.onEvent({ type: "message:new", payload: msg });
  }, 3500);
  return () => clearInterval(timer);
}
