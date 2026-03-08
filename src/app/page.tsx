'use client';
import { useEffect, useReducer, useState } from "react";
import ConversationList from "../components/ConversationList";
import Thread from "../components/Thread";
import { agents, conversations, messages } from "../lib/mockData";
import { ConversationStatus, initialInboxState, inboxReducer } from "../lib/store";
import { subscribeMockRealtime } from "../lib/mockRealtime";

export default function Page() {
  const [state, dispatch] = useReducer(inboxReducer, undefined, initialInboxState);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  async function callActionAPI(
    conversationId: string,
    actionType: string,
    body: any
  ) {
    setPendingAction(`${conversationId}:${actionType}`);
    setError(null);

    try {
      const response = await fetch(`/api/conversations/${conversationId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "API request failed");
      }

      const data = await response.json();
      
      // Apply the returned event via reducer
      if (data.event) {
        dispatch({ type: "realtime", payload: data.event });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      console.error("Action API error:", err);
    } finally {
      setPendingAction(null);
    }
  }

  const threadActions = {
    onMarkRead: (conversationId: string) => {
      callActionAPI(conversationId, "read", { type: "read" });
    },
    onChangeStatus: (conversationId: string, status: ConversationStatus) => {
      callActionAPI(conversationId, "status", { type: "status", status });
    },
    onAssign: (conversationId: string, agentId: string | null) => {
      callActionAPI(conversationId, "assign", { type: "assign", agentId });
    },
  };

  return (
    <div className="h-screen bg-neutral-100">
      <main className="h-full p-5">
        <div className="h-full overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          {error && (
            <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              Error: {error}
            </div>
          )}
          {pendingAction && (
            <div className="border-b border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
              Processing action...
            </div>
          )}
          <div className="grid h-full grid-cols-1 md:grid-cols-12">
            <section className="border-neutral-200 md:col-span-5 md:border-r">
              <ConversationList 
                state={state} 
                onSelect={(id) => dispatch({ type: "select", payload: { conversationId: id } })} 
              />
            </section>
            <section className="md:col-span-7">
              <Thread state={state} actions={threadActions} />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
