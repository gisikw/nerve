import { describe, it, expect } from "vitest";
import { computeDefaultSelection, sortRooms, getRoomGroup, RoomGroup } from "./channel-switcher";
import type { RoomInfo } from "./tauri";

/**
 * Tests for channel switcher selection logic.
 *
 * The computeDefaultSelection function determines which item should be selected
 * by default when the filtered room list changes. It ensures that matching rooms
 * are preferred over the "Create new" option.
 */

describe("channel switcher default selection", () => {
  it("selects first room when there are matching results", () => {
    const result = computeDefaultSelection(3, 0, 4);
    expect(result).toBe(0);
  });

  it("resets to first room when matches appear after no matches", () => {
    // User typed something with no matches, selectedIndex was at create option (index 1)
    // Then user continues typing and now there are matches
    const result = computeDefaultSelection(2, 1, 3);
    expect(result).toBe(0);
  });

  it("resets to first room even when current selection is valid but not first", () => {
    // User was at index 2, but we prefer first match when filtered list changes
    const result = computeDefaultSelection(5, 2, 6);
    expect(result).toBe(0);
  });

  it("clamps to last item when current index exceeds total items", () => {
    // User was at index 5, but now there are only 2 items total
    const result = computeDefaultSelection(0, 5, 2);
    expect(result).toBe(1);
  });

  it("selects create option when it is the only item", () => {
    // No matches, only the "Create new" option (1 total item)
    const result = computeDefaultSelection(0, 0, 1);
    expect(result).toBe(0);
  });

  it("handles empty list by returning 0", () => {
    const result = computeDefaultSelection(0, 0, 0);
    expect(result).toBe(0);
  });

  it("prefers first match over create option when both exist", () => {
    // 2 matching rooms + 1 create option = 3 total
    // Should select index 0 (first room), not index 2 (create option)
    const result = computeDefaultSelection(2, 2, 3);
    expect(result).toBe(0);
  });
});

/**
 * Helper to create a room with specified properties for testing.
 */
function makeRoom(
  id: string,
  name: string,
  notification_count: number = 0,
  highlight_count: number = 0,
  last_activity: number = 0,
  is_low_priority: boolean = false,
): RoomInfo {
  return {
    id,
    name,
    is_direct: false,
    notification_count,
    highlight_count,
    typing_users: [],
    last_activity,
    is_low_priority,
  };
}

describe("room grouping", () => {
  it("categorizes room with highlights as Mentioned", () => {
    const room = makeRoom("!test", "test", 0, 1, 100);
    expect(getRoomGroup(room)).toBe(RoomGroup.Mentioned);
  });

  it("categorizes room with notifications but no highlights as Unread", () => {
    const room = makeRoom("!test", "test", 5, 0, 100);
    expect(getRoomGroup(room)).toBe(RoomGroup.Unread);
  });

  it("categorizes room with no notifications as Read", () => {
    const room = makeRoom("!test", "test", 0, 0, 100);
    expect(getRoomGroup(room)).toBe(RoomGroup.Read);
  });

  it("categorizes archived room as Archived regardless of notifications", () => {
    const room = makeRoom("!test", "test", 10, 5, 100, true);
    expect(getRoomGroup(room)).toBe(RoomGroup.Archived);
  });

  it("prefers highlights over notifications for grouping", () => {
    const room = makeRoom("!test", "test", 3, 2, 100);
    expect(getRoomGroup(room)).toBe(RoomGroup.Mentioned);
  });
});

describe("room sorting", () => {
  it("sorts rooms by group: mentioned, unread, read, archived", () => {
    const mentioned = makeRoom("!mention", "mention", 0, 1, 100);
    const unread = makeRoom("!unread", "unread", 5, 0, 200);
    const read = makeRoom("!read", "read", 0, 0, 300);
    const archived = makeRoom("!archive", "archive", 10, 5, 400, true);

    const rooms = [read, archived, mentioned, unread];
    const sorted = sortRooms(rooms);

    expect(sorted[0].id).toBe("!mention");
    expect(sorted[1].id).toBe("!unread");
    expect(sorted[2].id).toBe("!read");
    expect(sorted[3].id).toBe("!archive");
  });

  it("sorts rooms within the same group by last activity descending", () => {
    const oldest = makeRoom("!old", "old", 0, 0, 100);
    const newest = makeRoom("!new", "new", 0, 0, 300);
    const middle = makeRoom("!mid", "mid", 0, 0, 200);

    const rooms = [oldest, newest, middle];
    const sorted = sortRooms(rooms);

    expect(sorted[0].id).toBe("!new"); // 300
    expect(sorted[1].id).toBe("!mid"); // 200
    expect(sorted[2].id).toBe("!old"); // 100
  });

  it("prioritizes mentions over unreads even with older activity", () => {
    const oldMention = makeRoom("!mention", "mention", 0, 1, 100);
    const newUnread = makeRoom("!unread", "unread", 5, 0, 500);

    const rooms = [newUnread, oldMention];
    const sorted = sortRooms(rooms);

    expect(sorted[0].id).toBe("!mention");
    expect(sorted[1].id).toBe("!unread");
  });

  it("places archived rooms last even with notifications and recent activity", () => {
    const archivedBusy = makeRoom("!archived", "archived", 10, 5, 500, true);
    const activeRead = makeRoom("!active", "active", 0, 0, 100);

    const rooms = [archivedBusy, activeRead];
    const sorted = sortRooms(rooms);

    expect(sorted[0].id).toBe("!active");
    expect(sorted[1].id).toBe("!archived");
  });

  it("sorts multiple rooms in the same group by last activity", () => {
    const unread1 = makeRoom("!u1", "u1", 3, 0, 150);
    const unread2 = makeRoom("!u2", "u2", 1, 0, 300);
    const unread3 = makeRoom("!u3", "u3", 5, 0, 200);

    const rooms = [unread1, unread2, unread3];
    const sorted = sortRooms(rooms);

    expect(sorted[0].id).toBe("!u2"); // 300
    expect(sorted[1].id).toBe("!u3"); // 200
    expect(sorted[2].id).toBe("!u1"); // 150
  });

  it("does not mutate the original array", () => {
    const room1 = makeRoom("!1", "1", 0, 0, 100);
    const room2 = makeRoom("!2", "2", 0, 0, 200);
    const rooms = [room1, room2];

    const sorted = sortRooms(rooms);

    expect(rooms[0].id).toBe("!1");
    expect(rooms[1].id).toBe("!2");
    expect(sorted[0].id).toBe("!2");
    expect(sorted[1].id).toBe("!1");
  });

  it("handles empty room list", () => {
    const sorted = sortRooms([]);
    expect(sorted).toEqual([]);
  });

  it("handles single room", () => {
    const room = makeRoom("!test", "test", 0, 0, 100);
    const sorted = sortRooms([room]);
    expect(sorted.length).toBe(1);
    expect(sorted[0].id).toBe("!test");
  });
});
