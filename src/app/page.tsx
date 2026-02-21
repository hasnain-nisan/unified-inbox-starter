'use client';
import { useEffect, useReducer } from "react";
import ConversationList from "../components/ConversationList";
import Thread from "../components/Thread";
import { agents, conversations, messages } from "../lib/mockData";
import { initialInboxState, inboxReducer } from "../lib/store";
import { subscribeMockRealtime } from "../lib/mockRealtime";

export default function Page() {
  const [state, dispatch] = useReducer(inboxReducer, undefined, initialInboxState);

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
console.log("state",state);

  return (
    <div className="h-screen p-4">
      <div className="h-full rounded-lg border bg-white overflow-hidden">
        <div className="h-full grid grid-cols-12">
          <div className="col-span-5 border-r">
            <ConversationList state={state} onSelect={(id) => dispatch({ type: "select", payload: { conversationId: id } })} />
          </div>
          <div className="col-span-7">
            <Thread state={state} />
          </div>
        </div>
      </div>
    </div>
  );
}