"use client";
import { useEffect, useReducer, useState } from "react";
import ConversationList from "../components/ConversationList";
import Thread from "../components/Thread";
import { agents, conversations, messages } from "../lib/mockData";
import { initialInboxState, inboxReducer } from "../lib/store";
import { subscribeMockRealtime } from "../lib/mockRealtime";

export default function Page() {
  const [state, dispatch] = useReducer(
    inboxReducer,
    undefined,
    initialInboxState,
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "pending" | "resolved">("all");
  const [channelFilter, setChannelFilter] = useState<"all" | "whatsapp" | "messenger" | "email">("all");
  const [unreadOnly, setUnreadOnly] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      dispatch({ type: "init", payload: { agents, conversations, messages } });
    }, 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (state.isLoading || state.conversationOrder.length === 0) return;
    const unsub = subscribeMockRealtime({
      conversationIds: state.conversationOrder,
      agentIds: Object.keys(state.agentsById),
      onEvent: (e) => dispatch({ type: "realtime", payload: e }),
    });
    return () => unsub();
  }, [state.isLoading, state.conversationOrder, state.agentsById]);

  return (
    <div className="h-screen bg-neutral-100">
      <main className="h-full p-5">
        <div className="h-full overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          <div className="grid h-full grid-cols-1 md:grid-cols-12">
            <section className="border-neutral-200 md:col-span-5 md:border-r">
              <ConversationList
                state={state}
                onSelect={(id) =>
                  dispatch({ type: "select", payload: { conversationId: id } })
                }
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                channelFilter={channelFilter}
                onChannelFilterChange={setChannelFilter}
                unreadOnly={unreadOnly}
                onUnreadOnlyChange={setUnreadOnly}
              />
            </section>
            <section className="md:col-span-7">
              <Thread
                state={state}
                onMarkRead={(id) => dispatch({ type: "markRead", payload: { conversationId: id } })}
                onSetStatus={(id, status) => dispatch({ type: "setStatus", payload: { conversationId: id, status } })}
                onAssignAgent={(id, agentId) => dispatch({ type: "assignAgent", payload: { conversationId: id, agentId } })}
              />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
