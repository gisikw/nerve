import { describe, it, expect } from "vitest";
import { typingLabel } from "./typing-ui";

/**
 * Tests for typing indicator UI formatting.
 *
 * Covers spec scenarios from specs/typing_indicators.feature:
 * - "Typing indicator shows when others are typing" (display logic for user names)
 * - Formatting rules for 1, 2, or 3+ users
 */

describe("typingLabel", () => {
  it("handles empty array", () => {
    const result = typingLabel([]);
    expect(result).toBe("");
  });

  it("formats single user as 'Name is typing...'", () => {
    const result = typingLabel(["@alice:matrix.org"]);
    expect(result).toBe("alice is typing...");
  });

  it("formats two users as 'Name1 and Name2 are typing...'", () => {
    const result = typingLabel(["@alice:matrix.org", "@bob:matrix.org"]);
    expect(result).toBe("alice and bob are typing...");
  });

  it("formats three users with 'and others'", () => {
    const result = typingLabel([
      "@alice:matrix.org",
      "@bob:matrix.org",
      "@charlie:matrix.org",
    ]);
    expect(result).toBe("alice, bob and others are typing...");
  });

  it("formats four users with 'and others' showing only first two", () => {
    const result = typingLabel([
      "@alice:matrix.org",
      "@bob:matrix.org",
      "@charlie:matrix.org",
      "@david:matrix.org",
    ]);
    expect(result).toBe("alice, bob and others are typing...");
  });

  it("preserves formatted names with underscores and dots", () => {
    const result = typingLabel(["@john.doe_123:matrix.org"]);
    expect(result).toBe("john.doe_123 is typing...");
  });

  it("handles users from different server domains", () => {
    const result = typingLabel([
      "@alice:matrix.org",
      "@bob:example.com",
    ]);
    expect(result).toBe("alice and bob are typing...");
  });

  it("handles users with hyphens in usernames", () => {
    const result = typingLabel([
      "@alice-wonderland:matrix.org",
      "@mad-hatter:matrix.org",
    ]);
    expect(result).toBe("alice-wonderland and mad-hatter are typing...");
  });

  it("maintains order of users as provided", () => {
    const result = typingLabel([
      "@zebra:matrix.org",
      "@apple:matrix.org",
      "@banana:matrix.org",
    ]);
    // Should show first two in input order, not alphabetically
    expect(result).toBe("zebra, apple and others are typing...");
  });

  it("handles five users with 'and others'", () => {
    const result = typingLabel([
      "@user1:matrix.org",
      "@user2:matrix.org",
      "@user3:matrix.org",
      "@user4:matrix.org",
      "@user5:matrix.org",
    ]);
    expect(result).toBe("user1, user2 and others are typing...");
  });

  it("handles users with complex server addresses", () => {
    const result = typingLabel([
      "@alice:chat.example.com",
      "@bob:localhost:8008",
    ]);
    expect(result).toBe("alice and bob are typing...");
  });

  it("handles single user with server having port number", () => {
    const result = typingLabel(["@alice:localhost:8008"]);
    expect(result).toBe("alice is typing...");
  });
});
