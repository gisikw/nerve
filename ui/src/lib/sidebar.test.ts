import { describe, it, expect } from "vitest";
import { filterVisibleRooms, hasActivity } from "./sidebar";
import type { RoomInfo } from "./tauri";

/**
 * Tests for sidebar channel filtering logic.
 *
 * The filterVisibleRooms function determines which channels should be visible
 * based on whether the channels section is expanded or collapsed. When collapsed,
 * only channels with activity (unreads/mentions) are shown.
 */

describe("sidebar channel filtering", () => {
  const mockRooms: RoomInfo[] = [
    {
      id: "!room1:matrix.org",
      name: "General",
      is_direct: false,
      notification_count: 5,
    },
    {
      id: "!room2:matrix.org",
      name: "Random",
      is_direct: false,
      notification_count: 0,
    },
    {
      id: "!room3:matrix.org",
      name: "Alice",
      is_direct: true,
      notification_count: 2,
    },
    {
      id: "!room4:matrix.org",
      name: "Bob",
      is_direct: true,
      notification_count: 0,
    },
  ];

  describe("filterVisibleRooms", () => {
    it("shows all rooms when expanded", () => {
      const result = filterVisibleRooms(mockRooms, true);
      expect(result).toHaveLength(4);
      expect(result).toEqual(mockRooms);
    });

    it("shows only rooms with notifications when collapsed", () => {
      const result = filterVisibleRooms(mockRooms, false);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("!room1:matrix.org");
      expect(result[1].id).toBe("!room3:matrix.org");
    });

    it("shows no rooms when collapsed and none have activity", () => {
      const quietRooms: RoomInfo[] = [
        {
          id: "!quiet1:matrix.org",
          name: "Quiet Room",
          is_direct: false,
          notification_count: 0,
        },
        {
          id: "!quiet2:matrix.org",
          name: "Silent Room",
          is_direct: false,
          notification_count: 0,
        },
      ];
      const result = filterVisibleRooms(quietRooms, false);
      expect(result).toHaveLength(0);
    });

    it("returns empty array for empty input", () => {
      const result = filterVisibleRooms([], true);
      expect(result).toHaveLength(0);
    });

    it("handles collapsed state with empty input", () => {
      const result = filterVisibleRooms([], false);
      expect(result).toHaveLength(0);
    });
  });

  describe("hasActivity", () => {
    it("returns true for room with notifications", () => {
      const room: RoomInfo = {
        id: "!test:matrix.org",
        name: "Test",
        is_direct: false,
        notification_count: 1,
      };
      expect(hasActivity(room)).toBe(true);
    });

    it("returns false for room without notifications", () => {
      const room: RoomInfo = {
        id: "!test:matrix.org",
        name: "Test",
        is_direct: false,
        notification_count: 0,
      };
      expect(hasActivity(room)).toBe(false);
    });

    it("returns true for room with high notification count", () => {
      const room: RoomInfo = {
        id: "!test:matrix.org",
        name: "Test",
        is_direct: false,
        notification_count: 999,
      };
      expect(hasActivity(room)).toBe(true);
    });
  });
});
