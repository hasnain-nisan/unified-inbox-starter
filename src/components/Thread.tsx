'use client';
import { selectActiveConversation, selectMessages } from "../lib/selectors";
import { InboxState } from "../lib/store";

function formatDateTime(epochMs: number) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(epochMs));
}

interface ThreadProps {
  state: InboxState;
  onMarkRead: (conversationId: string) => void;
  onSetStatus: (conversationId: string, status: "open" | "pending" | "resolved") => void;
  onAssignAgent: (conversationId: string, agentId: string | null) => void;
}

export default function Thread({ state, onMarkRead, onSetStatus, onAssignAgent }: ThreadProps) {
  const active = selectActiveConversation(state);

  if (state.isLoading) {
    return (
      <div className="h-full p-4">
        <div className="mb-4 h-6 w-48 animate-pulse rounded bg-neutral-200" />
        <div className="space-y-3">
          {[1, 2, 3].map((k) => (
            <div key={k} className="h-10 w-full animate-pulse rounded-lg bg-neutral-100" />
          ))}
        </div>
      </div>
    );
  }

  if (!active) {
    return (
      <div className="grid h-full place-items-center p-6 text-center">
        <div>
          <h3 className="text-base font-medium text-neutral-900">No conversation selected</h3>
          <p className="mt-1 text-sm text-neutral-500">Choose a conversation from the left panel.</p>
        </div>
      </div>
    );
  }

  const msgs = selectMessages(state, active.id);
  const assignedAgent = active.assignedAgentId ? state.agentsById[active.assignedAgentId] : null;

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900">{active.customerName}</h2>
          <p className="text-xs text-neutral-500">Conversation ID: {active.id}</p>
        </div>
        <div className="flex items-center gap-2">
          {active.unreadCount > 0 && (
            <button
              onClick={() => onMarkRead(active.id)}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
            >
              Mark as read
            </button>
          )}
          <select
            value={active.status}
            onChange={(e) => onSetStatus(active.id, e.target.value as "open" | "pending" | "resolved")}
            className="rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-xs font-medium text-neutral-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
          </select>
          <select
            value={active.assignedAgentId || ""}
            onChange={(e) => onAssignAgent(active.id, e.target.value || null)}
            className="rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-xs font-medium text-neutral-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Unassigned</option>
            {Object.values(state.agentsById).map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto bg-neutral-50 p-4">
        {msgs.length === 0 ? (
          <div className="grid h-full place-items-center text-center">
            <p className="text-sm text-neutral-500">No messages yet.</p>
          </div>
        ) : (
          msgs.map((m) => (
            <div key={m.id} className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${m.from === "agent" ? "ml-auto bg-blue-600 text-white" : "bg-white text-neutral-900 border border-neutral-200"}`}>
              <p>{m.text}</p>
              <p className={`mt-1 text-[11px] ${m.from === "agent" ? "text-blue-100" : "text-neutral-400"}`}>{formatDateTime(m.createdAt)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
