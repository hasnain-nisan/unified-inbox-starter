import { RealtimeEvent, Message } from "./types";
type Handler = (e: RealtimeEvent) => void;
const rand = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
export function subscribeMockRealtime(args: { conversationIds: string[]; agentIds: string[]; onEvent: Handler; }) {
  const texts = ["Hello?", "Any update?", "Thanks!"];
  const duplicateChance = 0.28;
  const delayedChance = 0.2;
  const duplicateTimeouts = new Set<ReturnType<typeof setTimeout>>();
  const timer = setInterval(() => {
    const conversationId = rand(args.conversationIds);
    const now = Date.now();
    const delayed = Math.random() < delayedChance;
    const msg: Message = {
      id: "m_" + Math.random().toString(16).slice(2),
      conversationId,
      from: "customer",
      text: rand(texts),
      createdAt: delayed ? now - (30000 + Math.floor(Math.random() * 90000)) : now
    };
    args.onEvent({ type: "message:new", payload: msg });

    if (Math.random() < duplicateChance) {
      const timeout = setTimeout(() => {
        duplicateTimeouts.delete(timeout);
        args.onEvent({ type: "message:new", payload: msg });
      }, 200 + Math.floor(Math.random() * 800));
      duplicateTimeouts.add(timeout);
    }
  }, 3500);
  return () => {
    clearInterval(timer);
    for (const timeout of duplicateTimeouts) clearTimeout(timeout);
    duplicateTimeouts.clear();
  };
}
