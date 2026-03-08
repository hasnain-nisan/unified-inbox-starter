'use client';
import { selectLastPreview } from "../lib/selectors";
import { InboxState } from "../lib/store";

function formatTime(epochMs: number) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(epochMs));
}

function ChannelIcon({ channel }: { channel: "whatsapp" | "messenger" | "email" }) {
  if (channel === "whatsapp") {
    return (
      <svg className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/>
      </svg>
    );
  }
  if (channel === "messenger") {
    return (
      <svg className="h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.44 3.14 7.19.14.13.23.33.23.53l.07 1.71c.02.49.48.85.95.66l2.06-.83c.2-.08.43-.06.62.04.92.48 1.94.74 3.01.74 5.64 0 9.95-4.13 9.95-9.7S17.64 2 12 2zm5.8 7.44c-.06.2-.2.37-.38.48l-2.69 1.58c-.17.1-.37.15-.57.15-.22 0-.43-.06-.62-.17l-2.08-1.22c-.23-.13-.51-.11-.72.06L8.2 12.57c-.15.12-.34.18-.53.18-.16 0-.32-.04-.46-.11-.33-.17-.51-.54-.44-.9l.89-4.43c.05-.25.23-.45.47-.53l3.03-1.03c.22-.07.46-.04.66.08l1.85 1.12c.21.13.48.12.68-.03l1.92-1.42c.2-.15.47-.17.69-.05.33.18.5.56.42.93l-1.38 5.08z"/>
      </svg>
    );
  }
  return (
    <svg className="h-4 w-4 text-neutral-600" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
    </svg>
  );
}

function StatusChip({ status }: { status: "open" | "pending" | "resolved" }) {
  const styles = {
    open: "bg-green-100 text-green-700",
    pending: "bg-amber-100 text-amber-700",
    resolved: "bg-neutral-100 text-neutral-600",
  };
  const labels = {
    open: "Open",
    pending: "Pending",
    resolved: "Resolved",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function UnreadBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-medium text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

interface ConversationListProps {
  state: InboxState;
  onSelect: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: "all" | "open" | "pending" | "resolved";
  onStatusFilterChange: (status: "all" | "open" | "pending" | "resolved") => void;
  channelFilter: "all" | "whatsapp" | "messenger" | "email";
  onChannelFilterChange: (channel: "all" | "whatsapp" | "messenger" | "email") => void;
  unreadOnly: boolean;
  onUnreadOnlyChange: (unreadOnly: boolean) => void;
}

export default function ConversationList({
  state,
  onSelect,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  channelFilter,
  onChannelFilterChange,
  unreadOnly,
  onUnreadOnlyChange,
}: ConversationListProps) {
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

  const filteredIds = state.conversationOrder.filter((id) => {
    const conv = state.conversationsById[id];
    if (!conv) return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const nameMatch = conv.customerName.toLowerCase().includes(query);
      if (!nameMatch) return false;
    }

    if (statusFilter !== "all" && conv.status !== statusFilter) return false;
    if (channelFilter !== "all" && conv.channel !== channelFilter) return false;
    if (unreadOnly && conv.unreadCount === 0) return false;

    return true;
  });

  const hasActiveFilters = searchQuery || statusFilter !== "all" || channelFilter !== "all" || unreadOnly;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-neutral-200 px-4 py-3">
        <h2 className="text-sm font-semibold tracking-wide text-neutral-900">Conversations</h2>
        <p className="text-xs text-neutral-500">{filteredIds.length} total</p>
      </div>

      <div className="border-b border-neutral-200 p-3 space-y-2">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name..."
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 pl-9 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <svg className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as "all" | "open" | "pending" | "resolved")}
            className="flex-1 rounded-lg border border-neutral-300 bg-white px-2 py-2 text-xs font-medium text-neutral-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={channelFilter}
            onChange={(e) => onChannelFilterChange(e.target.value as "all" | "whatsapp" | "messenger" | "email")}
            className="flex-1 rounded-lg border border-neutral-300 bg-white px-2 py-2 text-xs font-medium text-neutral-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Channels</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="messenger">Messenger</option>
            <option value="email">Email</option>
          </select>
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => onUnreadOnlyChange(e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-xs text-neutral-600">Unread only</span>
        </label>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {filteredIds.length === 0 ? (
          <div className="grid h-full place-items-center text-center">
            <div>
              {hasActiveFilters ? (
                <>
                  <svg className="mx-auto h-10 w-10 text-neutral-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 21l-4.35-4.35M11 18a7 7 0 110-14 7 7 0 010 14z" />
                  </svg>
                  <h3 className="mt-3 text-sm font-medium text-neutral-900">No matches found</h3>
                  <p className="mt-1 text-sm text-neutral-500">Try adjusting your search or filters.</p>
                </>
              ) : (
                <>
                  <svg className="mx-auto h-10 w-10 text-neutral-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <h3 className="mt-3 text-sm font-medium text-neutral-900">No conversations</h3>
                  <p className="mt-1 text-sm text-neutral-500">New conversations will appear here.</p>
                </>
              )}
            </div>
          </div>
        ) : (
          filteredIds.map((id) => {
            const conv = state.conversationsById[id];
            const isActive = state.activeConversationId === id;
            return (
              <button
                key={id}
                onClick={() => onSelect(id)}
                className={`mb-2 block w-full rounded-xl border px-3 py-3 text-left transition ${
                  isActive
                    ? "border-blue-200 bg-blue-50"
                    : "border-transparent bg-neutral-50 hover:border-neutral-200 hover:bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <ChannelIcon channel={conv.channel} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-neutral-900">{conv.customerName}</p>
                        <StatusChip status={conv.status} />
                      </div>
                      <p className="mt-1 truncate text-xs text-neutral-500">{selectLastPreview(state, id) || "No messages yet"}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-xs text-neutral-400">{formatTime(conv.updatedAt)}</span>
                    <UnreadBadge count={conv.unreadCount} />
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
