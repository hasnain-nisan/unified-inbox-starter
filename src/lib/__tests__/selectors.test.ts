import {
  selectActiveConversation,
  selectMessages,
  selectLastPreview,
  selectFilteredConversationIds,
  type FilterState,
} from "../selectors";
import { initialInboxState, InboxState } from "../store";
import type { Conversation, Message } from "../types";

function makeConversation(overrides: Partial<Conversation> = {}): Conversation {
  return {
    id: "c1",
    channel: "whatsapp",
    customerName: "Test",
    unreadCount: 0,
    assignedAgentId: null,
    status: "open",
    lastMessageId: "m1",
    updatedAt: 1000,
    ...overrides,
  };
}

const emptyFilters: FilterState = {
  search: "",
  status: "",
  channel: "",
  unreadOnly: false,
};

function makeMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: "m1",
    conversationId: "c1",
    from: "customer",
    text: "Hi",
    createdAt: 1000,
    ...overrides,
  };
}

describe("selectActiveConversation", () => {
  it("returns null when activeConversationId is null", () => {
    const state: InboxState = {
      ...initialInboxState(),
      activeConversationId: null,
      conversationsById: { c1: makeConversation() },
    };
    expect(selectActiveConversation(state)).toBe(null);
  });

  it("returns the active conversation when set", () => {
    const conv = makeConversation({ customerName: "Alice" });
    const state: InboxState = {
      ...initialInboxState(),
      activeConversationId: "c1",
      conversationsById: { c1: conv },
    };
    expect(selectActiveConversation(state)).toBe(conv);
    expect(selectActiveConversation(state)?.customerName).toBe("Alice");
  });

  it("returns null when activeConversationId points to missing conversation", () => {
    const state: InboxState = {
      ...initialInboxState(),
      activeConversationId: "c99",
      conversationsById: { c1: makeConversation() },
    };
    expect(selectActiveConversation(state)).toBeUndefined();
  });
});

describe("selectMessages", () => {
  it("returns empty array for unknown conversation", () => {
    const state: InboxState = {
      ...initialInboxState(),
      messagesByConversationId: { c1: [] },
    };
    expect(selectMessages(state, "c99")).toEqual([]);
  });

  it("returns messages for conversation", () => {
    const msgs = [
      makeMessage({ id: "m1", text: "First" }),
      makeMessage({ id: "m2", text: "Second" }),
    ];
    const state: InboxState = {
      ...initialInboxState(),
      messagesByConversationId: { c1: msgs },
    };
    expect(selectMessages(state, "c1")).toEqual(msgs);
    expect(selectMessages(state, "c1")).toHaveLength(2);
  });
});

describe("selectLastPreview", () => {
  it("returns empty string when no messages", () => {
    const state: InboxState = {
      ...initialInboxState(),
      messagesByConversationId: { c1: [] },
    };
    expect(selectLastPreview(state, "c1")).toBe("");
  });

  it("returns empty string for unknown conversation", () => {
    const state: InboxState = {
      ...initialInboxState(),
      messagesByConversationId: { c1: [makeMessage()] },
    };
    expect(selectLastPreview(state, "c99")).toBe("");
  });

  it("returns text of last message", () => {
    const state: InboxState = {
      ...initialInboxState(),
      messagesByConversationId: {
        c1: [
          makeMessage({ id: "m1", text: "First" }),
          makeMessage({ id: "m2", text: "Last message" }),
        ],
      },
    };
    expect(selectLastPreview(state, "c1")).toBe("Last message");
  });
});

describe("selectFilteredConversationIds", () => {
  const baseState: InboxState = {
    ...initialInboxState(),
    isLoading: false,
    conversationOrder: ["c1", "c2", "c3"],
    conversationsById: {
      c1: makeConversation({ id: "c1", customerName: "Alice", email: "alice@test.com", status: "open", channel: "whatsapp", unreadCount: 1 }),
      c2: makeConversation({ id: "c2", customerName: "Bob", status: "pending", channel: "messenger", unreadCount: 0 }),
      c3: makeConversation({ id: "c3", customerName: "Carol", status: "resolved", channel: "email", unreadCount: 2 }),
    },
  };

  it("returns all ids when no filters", () => {
    expect(selectFilteredConversationIds(baseState, emptyFilters)).toEqual(["c1", "c2", "c3"]);
  });

  it("filters by search (customerName)", () => {
    expect(selectFilteredConversationIds(baseState, { ...emptyFilters, search: "alice" })).toEqual(["c1"]);
    expect(selectFilteredConversationIds(baseState, { ...emptyFilters, search: "bob" })).toEqual(["c2"]);
  });

  it("filters by search (email)", () => {
    expect(selectFilteredConversationIds(baseState, { ...emptyFilters, search: "alice@test" })).toEqual(["c1"]);
  });

  it("filters by status", () => {
    expect(selectFilteredConversationIds(baseState, { ...emptyFilters, status: "open" })).toEqual(["c1"]);
    expect(selectFilteredConversationIds(baseState, { ...emptyFilters, status: "resolved" })).toEqual(["c3"]);
  });

  it("filters by channel", () => {
    expect(selectFilteredConversationIds(baseState, { ...emptyFilters, channel: "whatsapp" })).toEqual(["c1"]);
  });

  it("filters by unreadOnly", () => {
    expect(selectFilteredConversationIds(baseState, { ...emptyFilters, unreadOnly: true })).toEqual(["c1", "c3"]);
  });

  it("combines search + status + channel + unreadOnly", () => {
    const filtered = selectFilteredConversationIds(baseState, {
      search: "a",
      status: "open",
      channel: "whatsapp",
      unreadOnly: true,
    });
    expect(filtered).toEqual(["c1"]);
  });

  it("returns empty array when no match", () => {
    expect(selectFilteredConversationIds(baseState, { ...emptyFilters, search: "xyz" })).toEqual([]);
  });
});
