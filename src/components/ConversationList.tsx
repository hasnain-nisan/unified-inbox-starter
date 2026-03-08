'use client';
import { selectLastPreview, selectFilteredConversationIds, type FilterState } from "../lib/selectors";
import { InboxState } from "../lib/store";

function formatTime(epochMs: number) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(epochMs));
}

const CHANNEL_OPTIONS = [
  { value: "", label: "All channels" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "messenger", label: "Messenger" },
  { value: "email", label: "Email" },
] as const;

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "open", label: "Open" },
  { value: "pending", label: "Pending" },
  { value: "resolved", label: "Resolved" },
] as const;

export default function ConversationList({
  state,
  filters,
  onSelect,
  onFilterChange,
}: {
  state: InboxState;
  filters: FilterState;
  onSelect: (id: string) => void;
  onFilterChange: (filters: FilterState) => void;
}) {
  const filteredIds = selectFilteredConversationIds(state, filters);
  const hasActiveFilters = filters.search.trim() !== "" || filters.status !== "" || filters.channel !== "" || filters.unreadOnly;

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
        <p className="text-xs text-neutral-500">
          {filteredIds.length === state.conversationOrder.length
            ? `${state.conversationOrder.length} total`
            : `${filteredIds.length} of ${state.conversationOrder.length}`}
        </p>

        {/* Search */}
        <input
          type="search"
          placeholder="Search by name or email..."
          value={filters.search}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          className="mt-3 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />

        {/* Filters row */}
        <div className="mt-2 flex flex-wrap gap-2">
          <select
            value={filters.channel}
            onChange={(e) => onFilterChange({ ...filters, channel: e.target.value as FilterState["channel"] })}
            className="rounded-lg border border-neutral-200 px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
          >
            {CHANNEL_OPTIONS.map((o) => (
              <option key={o.value || "all"} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value as FilterState["status"] })}
            className="rounded-lg border border-neutral-200 px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value || "all"} value={o.value}>{o.label}</option>
            ))}
          </select>
          <label className="flex cursor-pointer items-center gap-1.5 text-xs">
            <input
              type="checkbox"
              checked={filters.unreadOnly}
              onChange={(e) => onFilterChange({ ...filters, unreadOnly: e.target.checked })}
              className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Unread only</span>
          </label>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {filteredIds.length === 0 ? (
          <div className="grid place-items-center py-12 text-center">
            <h3 className="text-sm font-medium text-neutral-900">No matching conversations</h3>
            <p className="mt-1 max-w-[200px] text-xs text-neutral-500">
              {hasActiveFilters
                ? "Try adjusting your search or filters."
                : "No conversations yet."}
            </p>
          </div>
        ) : (
          filteredIds.map((id) => {
            const conv = state.conversationsById[id];
            const isActive = state.activeConversationId === id;

            const channelColors = {
              whatsapp: "bg-green-100 text-green-700",
              messenger: "bg-blue-100 text-blue-700",
              email: "bg-purple-100 text-purple-700",
            };

            const statusColors = {
              open: "bg-yellow-100 text-yellow-700",
              pending: "bg-orange-100 text-orange-700",
              resolved: "bg-emerald-100 text-emerald-700",
            };

            return (
              <button
                key={id}
                onClick={() => onSelect(id)}
                className={`mb-2 block w-full rounded-xl border px-3 py-3 text-left transition ${
                  isActive
                    ? "border-blue-500 bg-blue-50 shadow-sm"
                    : "border-transparent bg-neutral-50 hover:border-neutral-200 hover:bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-neutral-900">{conv.customerName}</p>
                      {conv.unreadCount > 0 && (
                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1.5 text-[11px] font-semibold text-white">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 truncate text-xs text-neutral-500">{selectLastPreview(state, id) || "No messages yet"}</p>
                    <div className="mt-2 flex gap-1.5">
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase ${channelColors[conv.channel]}`}>
                        {conv.channel}
                      </span>
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase ${statusColors[conv.status]}`}>
                        {conv.status}
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-neutral-400">{formatTime(conv.updatedAt)}</span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
