import { describe, it, expect } from "vitest";
import { isGroupStart, formatSender } from "./message-grouping";
import type { Message } from "./tauri";

/**
 * Helper to create a test message with minimal required fields.
 */
function createMessage(
  sender: string,
  timestamp: number,
  eventId: string = `event-${timestamp}`
): Message {
  return {
    event_id: eventId,
    sender,
    timestamp,
    body: "test message",
    msg_type: "text",
    media_url: null,
    reactions: [],
  };
}

describe("isGroupStart", () => {
  it("returns true for the first message (index 0)", () => {
    const messages = [createMessage("@alice:matrix.org", 1000)];
    const result = isGroupStart(messages, 0);
    expect(result).toBe(true);
  });

  it("returns false for consecutive messages from same sender within 5 minutes", () => {
    const messages = [
      createMessage("@alice:matrix.org", 1000),
      createMessage("@alice:matrix.org", 2000), // 1 second later
    ];
    const result = isGroupStart(messages, 1);
    expect(result).toBe(false);
  });

  it("returns false for messages from same sender at the 5 minute boundary (299 seconds)", () => {
    const baseTime = 1000;
    const messages = [
      createMessage("@alice:matrix.org", baseTime),
      createMessage("@alice:matrix.org", baseTime + 299_000), // 299 seconds = 4:59
    ];
    const result = isGroupStart(messages, 1);
    expect(result).toBe(false);
  });

  it("returns true for messages from same sender at exactly 5 minutes (300 seconds)", () => {
    const baseTime = 1000;
    const messages = [
      createMessage("@alice:matrix.org", baseTime),
      createMessage("@alice:matrix.org", baseTime + 300_000), // Exactly 5 minutes
    ];
    const result = isGroupStart(messages, 1);
    expect(result).toBe(true);
  });

  it("returns true for messages from same sender more than 5 minutes apart", () => {
    const baseTime = 1000;
    const messages = [
      createMessage("@alice:matrix.org", baseTime),
      createMessage("@alice:matrix.org", baseTime + 600_000), // 10 minutes
    ];
    const result = isGroupStart(messages, 1);
    expect(result).toBe(true);
  });

  it("returns true for consecutive messages from different senders", () => {
    const messages = [
      createMessage("@alice:matrix.org", 1000),
      createMessage("@bob:matrix.org", 2000),
    ];
    const result = isGroupStart(messages, 1);
    expect(result).toBe(true);
  });

  it("returns true for different senders even if timestamps are identical", () => {
    const timestamp = 1000;
    const messages = [
      createMessage("@alice:matrix.org", timestamp),
      createMessage("@bob:matrix.org", timestamp),
    ];
    const result = isGroupStart(messages, 1);
    expect(result).toBe(true);
  });

  it("handles three consecutive messages from same sender within 5 minutes", () => {
    const messages = [
      createMessage("@alice:matrix.org", 1000),
      createMessage("@alice:matrix.org", 2000), // 1 second later
      createMessage("@alice:matrix.org", 3000), // 2 seconds from first
    ];
    expect(isGroupStart(messages, 0)).toBe(true);  // First message
    expect(isGroupStart(messages, 1)).toBe(false); // Grouped with first
    expect(isGroupStart(messages, 2)).toBe(false); // Grouped with second
  });

  it("handles sender change in the middle of a conversation", () => {
    const messages = [
      createMessage("@alice:matrix.org", 1000),
      createMessage("@alice:matrix.org", 2000),
      createMessage("@bob:matrix.org", 3000),   // Different sender
      createMessage("@bob:matrix.org", 4000),
    ];
    expect(isGroupStart(messages, 0)).toBe(true);  // First message
    expect(isGroupStart(messages, 1)).toBe(false); // Same sender as prev
    expect(isGroupStart(messages, 2)).toBe(true);  // Different sender
    expect(isGroupStart(messages, 3)).toBe(false); // Same sender as prev
  });

  it("handles time gap breaking a group, then same sender continues", () => {
    const baseTime = 1000;
    const messages = [
      createMessage("@alice:matrix.org", baseTime),
      createMessage("@alice:matrix.org", baseTime + 100_000), // 1:40 - grouped
      createMessage("@alice:matrix.org", baseTime + 450_000), // 7:30 - new group (5:50 from prev)
      createMessage("@alice:matrix.org", baseTime + 500_000), // 8:20 - grouped with third
    ];
    expect(isGroupStart(messages, 0)).toBe(true);  // First
    expect(isGroupStart(messages, 1)).toBe(false); // Grouped
    expect(isGroupStart(messages, 2)).toBe(true);  // Time gap (350s from prev)
    expect(isGroupStart(messages, 3)).toBe(false); // Grouped
  });

  it("handles multiple senders interleaved", () => {
    const messages = [
      createMessage("@alice:matrix.org", 1000),
      createMessage("@bob:matrix.org", 2000),
      createMessage("@alice:matrix.org", 3000),
      createMessage("@bob:matrix.org", 4000),
    ];
    // Every message should start a new group because senders alternate
    expect(isGroupStart(messages, 0)).toBe(true);
    expect(isGroupStart(messages, 1)).toBe(true);
    expect(isGroupStart(messages, 2)).toBe(true);
    expect(isGroupStart(messages, 3)).toBe(true);
  });

  it("handles messages from same sender with different server domains", () => {
    const messages = [
      createMessage("@alice:matrix.org", 1000),
      createMessage("@alice:example.com", 2000),
    ];
    // Different full user IDs = different senders
    const result = isGroupStart(messages, 1);
    expect(result).toBe(true);
  });

  it("handles messages with very large timestamp gaps", () => {
    const messages = [
      createMessage("@alice:matrix.org", 1000),
      createMessage("@alice:matrix.org", 86400000), // 24 hours later
    ];
    const result = isGroupStart(messages, 1);
    expect(result).toBe(true);
  });
});

describe("formatSender", () => {
  it("removes @ prefix and server suffix from standard Matrix ID", () => {
    const result = formatSender("@alice:matrix.org");
    expect(result).toBe("alice");
  });

  it("handles Matrix ID with different server domain", () => {
    const result = formatSender("@bob:example.com");
    expect(result).toBe("bob");
  });

  it("handles Matrix ID with subdomain server", () => {
    const result = formatSender("@charlie:chat.example.com");
    expect(result).toBe("charlie");
  });

  it("handles Matrix ID with port number in server", () => {
    const result = formatSender("@david:localhost:8008");
    expect(result).toBe("david");
  });

  it("handles Matrix ID with underscores and dots in username", () => {
    const result = formatSender("@john.doe_123:matrix.org");
    expect(result).toBe("john.doe_123");
  });

  it("handles Matrix ID with hyphens in username", () => {
    const result = formatSender("@alice-wonderland:matrix.org");
    expect(result).toBe("alice-wonderland");
  });

  it("returns original string if no colon separator found", () => {
    // Malformed ID without server part
    const result = formatSender("@alice");
    expect(result).toBe("alice");
  });

  it("returns original string if input has no @ prefix or colon", () => {
    // Edge case: not a valid Matrix ID
    const result = formatSender("alice");
    expect(result).toBe("alice");
  });

  it("handles empty string gracefully", () => {
    const result = formatSender("");
    expect(result).toBe("");
  });

  it("handles Matrix ID with only @ prefix", () => {
    const result = formatSender("@:matrix.org");
    expect(result).toBe("");
  });

  it("handles multiple colons in server part (IPv6 or complex domain)", () => {
    // In reality, Matrix IDs split on first colon for user:server
    const result = formatSender("@alice:2001:db8::1");
    expect(result).toBe("alice");
  });

  it("preserves username exactly as specified without normalization", () => {
    // Matrix usernames are case-sensitive
    const result = formatSender("@Alice:matrix.org");
    expect(result).toBe("Alice");
  });
});
