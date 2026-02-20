'use client';
import { InboxState } from "../lib/store";
import { selectActiveConversation, selectMessages } from "../lib/selectors";
export default function Thread({ state }: { state: InboxState }) {
  const active = selectActiveConversation(state);
  if (!active) return <div className="p-4">Select a conversation</div>;
  const msgs = selectMessages(state, active.id);
  return (
    <div className="p-4">
      <h2 className="font-bold">{active.customerName}</h2>
      {msgs.map((m) => <div key={m.id}>{m.text}</div>)}
    </div>
  );
}
