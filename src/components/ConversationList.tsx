'use client';
import { selectLastPreview } from "../lib/selectors";
import { InboxState } from "../lib/store";

function formatTime(epochMs: number) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(epochMs));
}

export default function ConversationList({
  state,
  onSelect,
}: {
  state: InboxState;
  onSelect: (id: string) => void;
}) {
  if (state.isLoading) {
    return (
      <div className="h-full p-4">
        <div className="mb-4 h-5 w-40 animate-pulse rounded bg-neutral-200" />
        <div className="space-y-3">
          {[1, 2, 3].map((k) => (
            <div key={k} className="h-16 animate-pulse rounded-xl bg-neutral-100" />
          ))}
        </div>
      </div>
    );
  }

  if (state.conversationOrder.length === 0) {
    return (
      <div className="grid h-full place-items-center p-6 text-center">
        <div>
          <h3 className="text-sm font-medium text-neutral-900">No conversations</h3>
          <p className="mt-1 text-sm text-neutral-500">New conversations will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-neutral-200 px-4 py-3">
        <h2 className="text-sm font-semibold tracking-wide text-neutral-900">Conversations</h2>
        <p className="text-xs text-neutral-500">{state.conversationOrder.length} total</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {state.conversationOrder.map((id) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className="mb-2 block w-full rounded-xl border border-transparent bg-neutral-50 px-3 py-3 text-left transition hover:border-neutral-200 hover:bg-white"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-neutral-900">{state.conversationsById[id].customerName}</p>
                <p className="mt-1 truncate text-xs text-neutral-500">{selectLastPreview(state, id) || "No messages yet"}</p>
              </div>
              <span className="shrink-0 text-xs text-neutral-400">{formatTime(state.conversationsById[id].updatedAt)}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
