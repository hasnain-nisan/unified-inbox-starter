"use client";
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

export default function Thread({ state }: { state: InboxState }) {
  const active = selectActiveConversation(state);
  console.log("Active conversation", active);

  const statusStyles = {
    open: "text-green-500 inset-ring-green-400/20",
    closed: "text-red-500   inset-ring-red-400/20",
    pending: "text-blue-500  inset-ring-blue-400/20",
    resolved: "text-yellow-500 inset-ring-yellow-400/20",
  };

  const channelStyles = {
    whatsapp: "text-green-500  inset-ring-green-400/20",
    messenger: "text-blue-500   inset-ring-blue-400/20",
    email: "text-purple-500 inset-ring-purple-400/20",
  };

  if (state.isLoading) {
    return (
      <div className="h-full p-4">
        <div className="mb-4 h-6 w-48 animate-pulse rounded bg-neutral-200" />
        <div className="space-y-3">
          {[1, 2, 3].map((k) => (
            <div
              key={k}
              className="h-10 w-full animate-pulse rounded-lg bg-neutral-100"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!active) {
    return (
      <div className="grid h-full place-items-center p-6 text-center">
        <div>
          <h3 className="text-base font-medium text-neutral-900">
            No conversation selected
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            Choose a conversation from the left panel.
          </p>
        </div>
      </div>
    );
  }

  const msgs = selectMessages(state, active.id);

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-neutral-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-neutral-900">
          {active.customerName}
          <span
            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium inset-ring ${statusStyles[active.status]}`}
          >
            {active.status}
          </span>
        </h2>

        <p className="text-xs text-neutral-500">Conversation ID: {active.id}</p>
        <p className="text-xs font-medium">
          Channel :{" "}
          <span className={channelStyles[active.channel]}>
            {active.channel}
          </span>
        </p>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto bg-neutral-50 p-4">
        {msgs.length === 0 ? (
          <div className="grid h-full place-items-center text-center">
            <p className="text-sm text-neutral-500">No messages yet.</p>
          </div>
        ) : (
          msgs.map((m) => (
            <div
              key={m.id}
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${m.from === "agent" ? "ml-auto bg-blue-600 text-white" : "bg-white text-neutral-900 border border-neutral-200"}`}
            >
              <p>{m.text}</p>
              <p
                className={`mt-1 text-[11px] ${m.from === "agent" ? "text-blue-100" : "text-neutral-400"}`}
              >
                {formatDateTime(m.createdAt)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
