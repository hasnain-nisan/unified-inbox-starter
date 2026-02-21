'use client';
import { InboxState } from "../lib/store";
import { selectActiveConversation, selectMessages } from "../lib/selectors";
export default function Thread({ state }: { state: InboxState }) {
  const active = selectActiveConversation(state);
  if (!active) return <div className="p-4">Select a conversation</div>;
  const msgs = selectMessages(state, active.id);
  console.log("msgs",msgs, active);
  
  if (msgs.length<1) {
    return (
      <div className="text-center">No message found</div>
    )
  }
  return (
    <div className="p-4">
      <h2 className="font-bold">{active.customerName}</h2>
      <div className="flex flex-col justify-start items-start"></div>
      {msgs.map((m) => <div className={`px-3 py-1 rounded-full ${m.from=="agent"?"justify-self-end bg-blue-300 ":"justify-self-start bg-gray-300"}`} key={m.id}>{m.text}</div>)}
    </div>
  );
}
