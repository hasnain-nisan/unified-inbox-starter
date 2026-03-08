import {
  initialInboxState,
  inboxReducer,
  applyRealtimeEvent,
  InboxState,
} from "../store";
import type { Agent, Conversation, Message, RealtimeEvent } from "../types";

// --- Test helpers ---

function makeConversation(overrides: Partial<Conversation> = {}): Conversation {
  return {
    id: "c1",
    channel: "whatsapp",
    customerName: "Test User",
    unreadCount: 0,
    assignedAgentId: null,
    status: "open",
    lastMessageId: "m0",
    updatedAt: 1000,
    ...overrides,
  };
}

function makeMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: "m1",
    conversationId: "c1",
    from: "customer",
    text: "Hello",
    createdAt: 2000,
    ...overrides,
  };
}

function makeState(overrides: Partial<InboxState> = {}): InboxState {
  const conv1 = makeConversation({ id: "c1", updatedAt: 2000 });
  const conv2 = makeConversation({
    id: "c2",
    updatedAt: 1000,
    customerName: "User 2",
  });
  return {
    ...initialInboxState(),
    isLoading: false,
    agentsById: {},
    conversationsById: { c1: conv1, c2: conv2 },
    conversationOrder: ["c1", "c2"],
    messagesByConversationId: { c1: [] },
    activeConversationId: null,
    ...overrides,
  };
}

// --- initialInboxState ---

describe("initialInboxState", () => {
  it("returns initial state with isLoading true and empty data", () => {
    const state = initialInboxState();
    expect(state.isLoading).toBe(true);
    expect(state.conversationsById).toEqual({});
    expect(state.conversationOrder).toEqual([]);
    expect(state.activeConversationId).toBe(null);
    expect(state.messagesByConversationId).toEqual({});
  });
});

// --- inboxReducer ---

describe("inboxReducer", () => {
  it("init: hydrates state and sets first conversation as active", () => {
    const agents: Agent[] = [{ id: "a1", name: "Agent 1" }];
    const conversations: Conversation[] = [
      makeConversation({ id: "c1" }),
      makeConversation({ id: "c2", updatedAt: 500 }),
    ];
    const messages: Message[] = [makeMessage({ id: "m1", conversationId: "c1" })];
    const state = initialInboxState();
    const next = inboxReducer(state, {
      type: "init",
      payload: { agents, conversations, messages },
    });
    expect(next.isLoading).toBe(false);
    expect(Object.keys(next.conversationsById)).toEqual(["c1", "c2"]);
    expect(next.conversationOrder).toEqual(["c1", "c2"]); // c1 newer (2000 > 500)
    expect(next.activeConversationId).toBe("c1");
    expect(next.messagesByConversationId["c1"]).toHaveLength(1);
  });

  it("select: updates activeConversationId", () => {
    const state = makeState({ activeConversationId: "c1" });
    const next = inboxReducer(state, {
      type: "select",
      payload: { conversationId: "c2" },
    });
    expect(next.activeConversationId).toBe("c2");
  });

  it("realtime: delegates to applyRealtimeEvent", () => {
    const state = makeState();
    const event: RealtimeEvent = {
      type: "conversation:read",
      payload: { conversationId: "c1" },
    };
    const next = inboxReducer(state, { type: "realtime", payload: event });
    expect(next.conversationsById["c1"].unreadCount).toBe(0);
  });

  it("unknown action returns same state", () => {
    const state = makeState();
    const next = inboxReducer(state, { type: "unknown" as any, payload: {} });
    expect(next).toBe(state);
  });
});

// --- applyRealtimeEvent: message:new ---

describe("applyRealtimeEvent - message:new", () => {
  it("appends message and updates conversation (unread +1 when not active)", () => {
    const state = makeState({
      activeConversationId: "c2",
      messagesByConversationId: { c1: [makeMessage({ id: "m0", text: "Hi" })] },
    });
    const msg = makeMessage({ id: "m1", text: "New msg", createdAt: 3000 });
    const event: RealtimeEvent = { type: "message:new", payload: msg };
    const next = applyRealtimeEvent(state, event);

    expect(next.messagesByConversationId["c1"]).toHaveLength(2);
    expect(next.messagesByConversationId["c1"][1].text).toBe("New msg");
    expect(next.conversationsById["c1"].lastMessageId).toBe("m1");
    expect(next.conversationsById["c1"].updatedAt).toBe(3000);
    expect(next.conversationsById["c1"].unreadCount).toBe(1);
    expect(next.conversationOrder[0]).toBe("c1");
  });

  it("does not increment unread when conversation is active", () => {
    const state = makeState({
      activeConversationId: "c1",
      conversationsById: {
        c1: makeConversation({ id: "c1", unreadCount: 0 }),
        c2: makeConversation({ id: "c2" }),
      },
      messagesByConversationId: { c1: [] },
    });
    const msg = makeMessage({ id: "m1", conversationId: "c1" });
    const event: RealtimeEvent = { type: "message:new", payload: msg };
    const next = applyRealtimeEvent(state, event);

    expect(next.conversationsById["c1"].unreadCount).toBe(0);
  });

  it("ignores message for unknown conversation", () => {
    const state = makeState();
    const msg = makeMessage({ conversationId: "c99" });
    const event: RealtimeEvent = { type: "message:new", payload: msg };
    const next = applyRealtimeEvent(state, event);
    expect(next).toBe(state);
  });

  it("ignores duplicate message (same id)", () => {
    const existing = makeMessage({ id: "m1", text: "Existing" });
    const state = makeState({
      messagesByConversationId: { c1: [existing] },
    });
    const event: RealtimeEvent = {
      type: "message:new",
      payload: makeMessage({ id: "m1", text: "Duplicate" }),
    };
    const next = applyRealtimeEvent(state, event);
    expect(next).toBe(state);
    expect(next.messagesByConversationId["c1"]).toHaveLength(1);
  });

  it("reorders conversations by updatedAt descending", () => {
    const state = makeState({
      conversationOrder: ["c1", "c2"],
      conversationsById: {
        c1: makeConversation({ id: "c1", updatedAt: 2000 }),
        c2: makeConversation({ id: "c2", updatedAt: 1000 }),
      },
    });
    const msg = makeMessage({ id: "m1", conversationId: "c2", createdAt: 5000 });
    const next = applyRealtimeEvent(state, {
      type: "message:new",
      payload: msg,
    });
    expect(next.conversationOrder).toEqual(["c2", "c1"]);
  });
});

// --- applyRealtimeEvent: conversation:read ---

describe("applyRealtimeEvent - conversation:read", () => {
  it("sets unreadCount to 0 and updates updatedAt", () => {
    const state = makeState({
      conversationsById: {
        c1: makeConversation({ id: "c1", unreadCount: 5, updatedAt: 1000 }),
        c2: makeConversation({ id: "c2" }),
      },
    });
    const beforeNow = Date.now();
    const next = applyRealtimeEvent(state, {
      type: "conversation:read",
      payload: { conversationId: "c1" },
    });
    const afterNow = Date.now();

    expect(next.conversationsById["c1"].unreadCount).toBe(0);
    expect(next.conversationsById["c1"].updatedAt).toBeGreaterThanOrEqual(
      beforeNow
    );
    expect(next.conversationsById["c1"].updatedAt).toBeLessThanOrEqual(
      afterNow
    );
  });

  it("reorders conversation list after read", () => {
    const state = makeState({
      conversationsById: {
        c1: makeConversation({ id: "c1", updatedAt: 1000 }),
        c2: makeConversation({ id: "c2", updatedAt: 2000 }),
      },
      conversationOrder: ["c2", "c1"],
    });
    const next = applyRealtimeEvent(state, {
      type: "conversation:read",
      payload: { conversationId: "c1" },
    });
    expect(next.conversationOrder[0]).toBe("c1");
  });

  it("ignores unknown conversationId", () => {
    const state = makeState();
    const next = applyRealtimeEvent(state, {
      type: "conversation:read",
      payload: { conversationId: "c99" },
    });
    expect(next).toBe(state);
  });
});

// --- applyRealtimeEvent: conversation:status ---

describe("applyRealtimeEvent - conversation:status", () => {
  it("updates status and updatedAt", () => {
    const state = makeState({
      conversationsById: {
        c1: makeConversation({ id: "c1", status: "open", updatedAt: 1000 }),
        c2: makeConversation({ id: "c2" }),
      },
    });
    const next = applyRealtimeEvent(state, {
      type: "conversation:status",
      payload: { conversationId: "c1", status: "resolved" },
    });
    expect(next.conversationsById["c1"].status).toBe("resolved");
    expect(next.conversationsById["c1"].updatedAt).toBeGreaterThanOrEqual(
      Date.now() - 100
    );
  });

  it("ignores unknown conversationId", () => {
    const state = makeState();
    const next = applyRealtimeEvent(state, {
      type: "conversation:status",
      payload: { conversationId: "c99", status: "pending" },
    });
    expect(next).toBe(state);
  });
});

// --- applyRealtimeEvent: conversation:assign ---

describe("applyRealtimeEvent - conversation:assign", () => {
  it("sets assignedAgentId and updatedAt", () => {
    const state = makeState({
      conversationsById: {
        c1: makeConversation({
          id: "c1",
          assignedAgentId: null,
          updatedAt: 1000,
        }),
        c2: makeConversation({ id: "c2" }),
      },
    });
    const next = applyRealtimeEvent(state, {
      type: "conversation:assign",
      payload: { conversationId: "c1", agentId: "a1" },
    });
    expect(next.conversationsById["c1"].assignedAgentId).toBe("a1");
    expect(next.conversationsById["c1"].updatedAt).toBeGreaterThanOrEqual(
      Date.now() - 100
    );
  });

  it("allows unassign (agentId null)", () => {
    const state = makeState({
      conversationsById: {
        c1: makeConversation({ id: "c1", assignedAgentId: "a1" }),
        c2: makeConversation({ id: "c2" }),
      },
    });
    const next = applyRealtimeEvent(state, {
      type: "conversation:assign",
      payload: { conversationId: "c1", agentId: null },
    });
    expect(next.conversationsById["c1"].assignedAgentId).toBe(null);
  });

  it("ignores unknown conversationId", () => {
    const state = makeState();
    const next = applyRealtimeEvent(state, {
      type: "conversation:assign",
      payload: { conversationId: "c99", agentId: "a1" },
    });
    expect(next).toBe(state);
  });
});

// --- immutability ---

describe("applyRealtimeEvent - immutability", () => {
  it("does not mutate input state", () => {
    const state = makeState();
    const convRef = state.conversationsById["c1"];
    const messagesRef = state.messagesByConversationId["c1"];
    applyRealtimeEvent(state, {
      type: "conversation:read",
      payload: { conversationId: "c1" },
    });
    expect(state.conversationsById["c1"]).toBe(convRef);
    expect(state.messagesByConversationId["c1"]).toBe(messagesRef);
  });
});
