'use client';
import { selectActiveConversation, selectMessages } from "../lib/selectors";
import { InboxState } from "../lib/store";
import { ConversationStatus } from "../lib/types";

function formatDateTime(epochMs: number) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(epochMs));
}

type ThreadActions = {
  onMarkRead: (conversationId: string) => void;
  onChangeStatus: (conversationId: string, status: ConversationStatus) => void;
  onAssign: (conversationId: string, agentId: string | null) => void;
};

export default function Thread({ 
  state, 
  actions,
  isPending = false 
}: { 
  state: InboxState;
  actions?: ThreadActions;
  isPending?: boolean;
}) {
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
  
  const agents = Object.values(state.agentsById);
  const assignedAgent = active.assignedAgentId ? state.agentsById[active.assignedAgentId] : null;

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-neutral-200 px-4 py-3">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">{active.customerName}</h2>
            <p className="text-xs text-neutral-500">
              {active.channel} · {active.status}
              {assignedAgent && ` · Assigned to ${assignedAgent.name}`}
            </p>
          </div>
        </div>
        
        {actions && (
          <div className="mt-3 flex flex-wrap gap-2">
            {active.unreadCount > 0 && (
              <button
                onClick={() => actions.onMarkRead(active.id)}
                disabled={isPending}
                className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Mark as Read
              </button>
            )}
            
            <select
              value={active.status}
              onChange={(e) => actions.onChangeStatus(active.id, e.target.value as ConversationStatus)}
              disabled={isPending}
              className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="open">Open</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
            </select>
            
            <select
              value={active.assignedAgentId || ""}
              onChange={(e) => actions.onAssign(active.id, e.target.value || null)}
              disabled={isPending}
              className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">Unassigned</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>
        )}
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
