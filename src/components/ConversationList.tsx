'use client';
import { InboxState } from "../lib/store";
export default function ConversationList({ state, onSelect }: { state: InboxState; onSelect: (id: string) => void; }) {
  if (state.isLoading) return <div className="p-4">Loading…</div>;
  return (
    <div>
      {state.conversationOrder.map((id) => (
        <button key={id} onClick={() => onSelect(id)} className="block w-full p-3 border-b text-left">
          {state.conversationsById[id].customerName}
        </button>
      ))}
    </div>
  );
}
