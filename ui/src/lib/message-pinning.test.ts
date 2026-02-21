import { describe, it, expect } from "vitest";

/**
 * Decision function: should the pinned bar be visible?
 */
export function shouldShowPinnedBar(pinnedCount: number): boolean {
  return pinnedCount > 0;
}

/**
 * Decision function: format the pinned count label
 */
export function formatPinnedLabel(count: number): string {
  return `${count} pinned`;
}

/**
 * Decision function: should truncate message body in preview?
 */
export function shouldTruncatePreview(body: string, maxLength: number): boolean {
  return body.length > maxLength;
}

/**
 * Decision function: truncate message body for preview
 */
export function truncatePreviewBody(body: string, maxLength: number): string {
  if (body.length <= maxLength) {
    return body;
  }
  return body.slice(0, maxLength);
}

/**
 * Decision function: is a message pinned?
 */
export function isMessagePinned(eventId: string, pinnedIds: Set<string>): boolean {
  return pinnedIds.has(eventId);
}

/**
 * Decision function: get the pin button title
 */
export function getPinButtonTitle(isPinned: boolean): string {
  return isPinned ? "Unpin" : "Pin";
}

/**
 * Decision function: filter messages to get only pinned ones
 */
export function filterPinnedMessages<T extends { event_id: string }>(
  messages: T[],
  pinnedIds: Set<string>
): T[] {
  return messages.filter((m) => pinnedIds.has(m.event_id));
}

/**
 * Decision function: add event ID to pinned set (returns new set)
 */
export function addPinnedId(pinnedIds: Set<string>, eventId: string): Set<string> {
  const newSet = new Set(pinnedIds);
  newSet.add(eventId);
  return newSet;
}

/**
 * Decision function: remove event ID from pinned set (returns new set)
 */
export function removePinnedId(pinnedIds: Set<string>, eventId: string): Set<string> {
  const newSet = new Set(pinnedIds);
  newSet.delete(eventId);
  return newSet;
}

// --- Tests ---

describe("Message Pinning", () => {
  describe("shouldShowPinnedBar", () => {
    it("returns false when there are no pinned messages", () => {
      expect(shouldShowPinnedBar(0)).toBe(false);
    });

    it("returns true when there is one pinned message", () => {
      expect(shouldShowPinnedBar(1)).toBe(true);
    });

    it("returns true when there are multiple pinned messages", () => {
      expect(shouldShowPinnedBar(5)).toBe(true);
    });
  });

  describe("formatPinnedLabel", () => {
    it("formats label for single pinned message", () => {
      expect(formatPinnedLabel(1)).toBe("1 pinned");
    });

    it("formats label for multiple pinned messages", () => {
      expect(formatPinnedLabel(5)).toBe("5 pinned");
    });

    it("formats label for zero pinned messages", () => {
      expect(formatPinnedLabel(0)).toBe("0 pinned");
    });
  });

  describe("shouldTruncatePreview", () => {
    it("returns false when body is shorter than max length", () => {
      expect(shouldTruncatePreview("short", 120)).toBe(false);
    });

    it("returns false when body equals max length", () => {
      const body = "a".repeat(120);
      expect(shouldTruncatePreview(body, 120)).toBe(false);
    });

    it("returns true when body exceeds max length", () => {
      const body = "a".repeat(121);
      expect(shouldTruncatePreview(body, 120)).toBe(true);
    });
  });

  describe("truncatePreviewBody", () => {
    it("returns full body when shorter than max length", () => {
      const body = "Short message";
      expect(truncatePreviewBody(body, 120)).toBe(body);
    });

    it("returns full body when equal to max length", () => {
      const body = "a".repeat(120);
      expect(truncatePreviewBody(body, 120)).toBe(body);
    });

    it("truncates body when longer than max length", () => {
      const body = "a".repeat(150);
      const result = truncatePreviewBody(body, 120);
      expect(result).toBe("a".repeat(120));
      expect(result.length).toBe(120);
    });

    it("truncates long message to exactly 120 characters", () => {
      const body = "This is a very long message that exceeds one hundred and twenty characters and should be truncated to fit the preview area without breaking";
      const result = truncatePreviewBody(body, 120);
      expect(result.length).toBe(120);
      expect(result).toBe(body.slice(0, 120));
    });
  });

  describe("isMessagePinned", () => {
    it("returns false when event ID is not in pinned set", () => {
      const pinnedIds = new Set(["$evt1", "$evt2"]);
      expect(isMessagePinned("$evt3", pinnedIds)).toBe(false);
    });

    it("returns true when event ID is in pinned set", () => {
      const pinnedIds = new Set(["$evt1", "$evt2"]);
      expect(isMessagePinned("$evt1", pinnedIds)).toBe(true);
    });

    it("returns false when pinned set is empty", () => {
      const pinnedIds = new Set<string>();
      expect(isMessagePinned("$evt1", pinnedIds)).toBe(false);
    });
  });

  describe("getPinButtonTitle", () => {
    it("returns 'Pin' when message is not pinned", () => {
      expect(getPinButtonTitle(false)).toBe("Pin");
    });

    it("returns 'Unpin' when message is pinned", () => {
      expect(getPinButtonTitle(true)).toBe("Unpin");
    });
  });

  describe("filterPinnedMessages", () => {
    it("returns empty array when no messages are pinned", () => {
      const messages = [
        { event_id: "$evt1", body: "msg1" },
        { event_id: "$evt2", body: "msg2" },
      ];
      const pinnedIds = new Set<string>();
      expect(filterPinnedMessages(messages, pinnedIds)).toEqual([]);
    });

    it("returns only pinned messages", () => {
      const messages = [
        { event_id: "$evt1", body: "msg1" },
        { event_id: "$evt2", body: "msg2" },
        { event_id: "$evt3", body: "msg3" },
      ];
      const pinnedIds = new Set(["$evt1", "$evt3"]);
      const result = filterPinnedMessages(messages, pinnedIds);
      expect(result).toHaveLength(2);
      expect(result[0].event_id).toBe("$evt1");
      expect(result[1].event_id).toBe("$evt3");
    });

    it("returns all messages when all are pinned", () => {
      const messages = [
        { event_id: "$evt1", body: "msg1" },
        { event_id: "$evt2", body: "msg2" },
      ];
      const pinnedIds = new Set(["$evt1", "$evt2"]);
      expect(filterPinnedMessages(messages, pinnedIds)).toEqual(messages);
    });

    it("preserves message order from original array", () => {
      const messages = [
        { event_id: "$evt1", body: "msg1" },
        { event_id: "$evt2", body: "msg2" },
        { event_id: "$evt3", body: "msg3" },
      ];
      const pinnedIds = new Set(["$evt3", "$evt1"]); // Set in different order
      const result = filterPinnedMessages(messages, pinnedIds);
      // Should maintain original array order, not set order
      expect(result[0].event_id).toBe("$evt1");
      expect(result[1].event_id).toBe("$evt3");
    });
  });

  describe("addPinnedId", () => {
    it("adds event ID to empty set", () => {
      const pinnedIds = new Set<string>();
      const result = addPinnedId(pinnedIds, "$evt1");
      expect(result.has("$evt1")).toBe(true);
      expect(result.size).toBe(1);
    });

    it("adds event ID to existing set", () => {
      const pinnedIds = new Set(["$evt1"]);
      const result = addPinnedId(pinnedIds, "$evt2");
      expect(result.has("$evt1")).toBe(true);
      expect(result.has("$evt2")).toBe(true);
      expect(result.size).toBe(2);
    });

    it("is idempotent when adding existing ID", () => {
      const pinnedIds = new Set(["$evt1"]);
      const result = addPinnedId(pinnedIds, "$evt1");
      expect(result.has("$evt1")).toBe(true);
      expect(result.size).toBe(1);
    });

    it("does not mutate the original set", () => {
      const pinnedIds = new Set(["$evt1"]);
      const result = addPinnedId(pinnedIds, "$evt2");
      expect(pinnedIds.size).toBe(1);
      expect(pinnedIds.has("$evt2")).toBe(false);
      expect(result.size).toBe(2);
    });
  });

  describe("removePinnedId", () => {
    it("removes event ID from set", () => {
      const pinnedIds = new Set(["$evt1", "$evt2"]);
      const result = removePinnedId(pinnedIds, "$evt1");
      expect(result.has("$evt1")).toBe(false);
      expect(result.has("$evt2")).toBe(true);
      expect(result.size).toBe(1);
    });

    it("is a no-op when removing non-existent ID", () => {
      const pinnedIds = new Set(["$evt1"]);
      const result = removePinnedId(pinnedIds, "$evt2");
      expect(result.has("$evt1")).toBe(true);
      expect(result.size).toBe(1);
    });

    it("handles removing from empty set", () => {
      const pinnedIds = new Set<string>();
      const result = removePinnedId(pinnedIds, "$evt1");
      expect(result.size).toBe(0);
    });

    it("does not mutate the original set", () => {
      const pinnedIds = new Set(["$evt1", "$evt2"]);
      const result = removePinnedId(pinnedIds, "$evt1");
      expect(pinnedIds.size).toBe(2);
      expect(pinnedIds.has("$evt1")).toBe(true);
      expect(result.size).toBe(1);
    });
  });
});
