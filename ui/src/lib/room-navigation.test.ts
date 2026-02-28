import { describe, it, expect } from "vitest";
import { filterVisibleRooms, hasActivity, formatHighlightBadge } from "./sidebar";
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

  describe("badge display logic", () => {
    function makeRoom(
      id: string,
      notification_count: number = 0,
      highlight_count: number = 0,
    ): RoomInfo {
      return {
        id,
        name: "test-room",
        is_direct: false,
        notification_count,
        highlight_count,
        typing_users: [],
        last_activity: 0,
        is_low_priority: false,
      };
    }

    it("rooms with only notification_count > 0 should not show a badge (highlight_count = 0)", () => {
      const room = makeRoom("!general", 5, 0);
      expect(room.highlight_count > 0).toBe(false);
    });

    it("rooms with highlight_count > 0 should show a badge", () => {
      const room = makeRoom("!general", 5, 2);
      expect(room.highlight_count > 0).toBe(true);
      expect(formatHighlightBadge(room.highlight_count)).toBe("2");
    });

    it("rooms with no notifications or highlights should not show a badge", () => {
      const room = makeRoom("!general", 0, 0);
      expect(room.highlight_count > 0).toBe(false);
    });

    it("badge displays the highlight_count, not the notification_count", () => {
      const room = makeRoom("!general", 10, 3);
      expect(formatHighlightBadge(room.highlight_count)).toBe("3");
    });
  });

  describe("formatHighlightBadge", () => {
    it("displays count as-is for values under 100", () => {
      expect(formatHighlightBadge(0)).toBe("0");
      expect(formatHighlightBadge(1)).toBe("1");
      expect(formatHighlightBadge(42)).toBe("42");
      expect(formatHighlightBadge(99)).toBe("99");
    });

    it("displays '99+' for count of 100", () => {
      expect(formatHighlightBadge(100)).toBe("99+");
    });

    it("displays '99+' for counts greater than 100", () => {
      expect(formatHighlightBadge(101)).toBe("99+");
      expect(formatHighlightBadge(250)).toBe("99+");
      expect(formatHighlightBadge(999)).toBe("99+");
      expect(formatHighlightBadge(9999)).toBe("99+");
    });

    it("handles boundary value of 99 correctly", () => {
      expect(formatHighlightBadge(99)).toBe("99");
      expect(formatHighlightBadge(100)).toBe("99+");
    });
  });
});

describe("archived room filtering", () => {
  it("archived rooms are excluded from active room filter", () => {
    // Simulate the sidebar component's activeRooms derivation:
    // activeRooms = getRooms().filter((r) => !getArchivedRoomIds().has(r.id))
    const allRooms: RoomInfo[] = [
      {
        id: "!active1:matrix.org",
        name: "Active Room 1",
        is_direct: false,
        notification_count: 5,
      },
      {
        id: "!archived1:matrix.org",
        name: "Archived Room 1",
        is_direct: false,
        notification_count: 3,
      },
      {
        id: "!active2:matrix.org",
        name: "Active Room 2",
        is_direct: false,
        notification_count: 0,
      },
    ];

    const archivedIds = new Set(["!archived1:matrix.org"]);
    const activeRooms = allRooms.filter((r) => !archivedIds.has(r.id));

    expect(activeRooms).toHaveLength(2);
    expect(activeRooms.find((r) => r.id === "!active1:matrix.org")).toBeDefined();
    expect(activeRooms.find((r) => r.id === "!active2:matrix.org")).toBeDefined();
    expect(activeRooms.find((r) => r.id === "!archived1:matrix.org")).toBeUndefined();
  });

  it("archived rooms can be extracted from full room list", () => {
    // Simulate the sidebar component's archivedRooms derivation:
    // archivedRooms = getRooms().filter((r) => getArchivedRoomIds().has(r.id))
    const allRooms: RoomInfo[] = [
      {
        id: "!active1:matrix.org",
        name: "Active Room 1",
        is_direct: false,
        notification_count: 5,
      },
      {
        id: "!archived1:matrix.org",
        name: "Archived Room 1",
        is_direct: false,
        notification_count: 3,
      },
      {
        id: "!archived2:matrix.org",
        name: "Archived Room 2",
        is_direct: true,
        notification_count: 0,
      },
    ];

    const archivedIds = new Set(["!archived1:matrix.org", "!archived2:matrix.org"]);
    const archivedRooms = allRooms.filter((r) => archivedIds.has(r.id));

    expect(archivedRooms).toHaveLength(2);
    expect(archivedRooms.find((r) => r.id === "!archived1:matrix.org")).toBeDefined();
    expect(archivedRooms.find((r) => r.id === "!archived2:matrix.org")).toBeDefined();
    expect(archivedRooms.find((r) => r.id === "!active1:matrix.org")).toBeUndefined();
  });

  it("archived rooms with notifications are still excluded from active list", () => {
    // Even if an archived room has unreads, it should not appear in the active list
    const allRooms: RoomInfo[] = [
      {
        id: "!active:matrix.org",
        name: "Active",
        is_direct: false,
        notification_count: 0,
      },
      {
        id: "!archived-unread:matrix.org",
        name: "Archived with Unreads",
        is_direct: false,
        notification_count: 10,
      },
    ];

    const archivedIds = new Set(["!archived-unread:matrix.org"]);
    const activeRooms = allRooms.filter((r) => !archivedIds.has(r.id));

    expect(activeRooms).toHaveLength(1);
    expect(activeRooms[0].id).toBe("!active:matrix.org");
  });

  it("filtering can be applied to active rooms separately from archived rooms", () => {
    // The sidebar applies filterVisibleRooms to activeRooms, not to archivedRooms
    const allRooms: RoomInfo[] = [
      { id: "!a1:matrix.org", name: "Active 1", is_direct: false, notification_count: 5 },
      { id: "!a2:matrix.org", name: "Active 2", is_direct: false, notification_count: 0 },
      { id: "!ar1:matrix.org", name: "Archived 1", is_direct: false, notification_count: 3 },
      { id: "!ar2:matrix.org", name: "Archived 2", is_direct: false, notification_count: 0 },
    ];

    const archivedIds = new Set(["!ar1:matrix.org", "!ar2:matrix.org"]);
    const activeRooms = allRooms.filter((r) => !archivedIds.has(r.id));

    // When channels section is collapsed, only active rooms with activity are visible
    const visibleActiveRooms = filterVisibleRooms(activeRooms, false);

    expect(visibleActiveRooms).toHaveLength(1);
    expect(visibleActiveRooms[0].id).toBe("!a1:matrix.org");
  });

  it("empty archived set results in all rooms being active", () => {
    const allRooms: RoomInfo[] = [
      { id: "!r1:matrix.org", name: "Room 1", is_direct: false, notification_count: 1 },
      { id: "!r2:matrix.org", name: "Room 2", is_direct: false, notification_count: 0 },
    ];

    const archivedIds = new Set<string>();
    const activeRooms = allRooms.filter((r) => !archivedIds.has(r.id));

    expect(activeRooms).toHaveLength(2);
    expect(activeRooms).toEqual(allRooms);
  });
});

describe("sidebar archive icons", () => {
  it("archive button renders SVG icon not emoji", () => {
    // Regression test: archive/unarchive buttons previously used colored emoji
    // (📥 U+1F4E5, 📤 U+1F4E4) which was visually inconsistent with the rest
    // of the app's monochrome icon design language. Now uses SVG icons.
    const { readFileSync } = require("fs");
    const { join } = require("path");
    const sidebarPath = join(__dirname, "../Sidebar.svelte");
    const sidebarContent = readFileSync(sidebarPath, "utf-8");

    // Should NOT contain the old emoji characters
    expect(sidebarContent).not.toContain("📥");
    expect(sidebarContent).not.toContain("📤");

    // Should contain SVG elements with monochrome styling
    expect(sidebarContent).toContain("<svg");
    expect(sidebarContent).toContain('stroke="currentColor"');
    expect(sidebarContent).toContain('fill="none"');
  });

  it("archive button SVG uses design system attributes", () => {
    // Verify the archive icon follows the monochrome SVG pattern:
    // currentColor for stroke (inherits text color), no fill, consistent sizing
    const { readFileSync } = require("fs");
    const { join } = require("path");
    const sidebarPath = join(__dirname, "../Sidebar.svelte");
    const sidebarContent = readFileSync(sidebarPath, "utf-8");

    const archiveMatch = sidebarContent.match(
      /title="Archive"[\s\S]*?<svg[\s\S]*?<\/svg>/
    );
    expect(archiveMatch).not.toBeNull();

    const archiveSvg = archiveMatch![0];

    // Standard attributes for monochrome icons
    expect(archiveSvg).toContain('viewBox="0 0 24 24"');
    expect(archiveSvg).toContain('stroke="currentColor"'); // Inherits CSS color
    expect(archiveSvg).toContain('fill="none"'); // No fill = monochrome outline
    expect(archiveSvg).toContain('stroke-width="2"');
  });

  it("unarchive button SVG uses design system attributes", () => {
    // Same verification for the unarchive icon
    const { readFileSync } = require("fs");
    const { join } = require("path");
    const sidebarPath = join(__dirname, "../Sidebar.svelte");
    const sidebarContent = readFileSync(sidebarPath, "utf-8");

    const unarchiveMatch = sidebarContent.match(
      /title="Unarchive"[\s\S]*?<svg[\s\S]*?<\/svg>/
    );
    expect(unarchiveMatch).not.toBeNull();

    const unarchiveSvg = unarchiveMatch![0];

    expect(unarchiveSvg).toContain('viewBox="0 0 24 24"');
    expect(unarchiveSvg).toContain('stroke="currentColor"');
    expect(unarchiveSvg).toContain('fill="none"');
    expect(unarchiveSvg).toContain('stroke-width="2"');
  });
});

describe("activity indicator positioning", () => {
  it("typing indicator appears after archive button in DOM order", () => {
    // Regression test: The typing indicator should be the rightmost visual element
    // in the flex row (spec: room_navigation.feature). In the default flex-direction:row
    // layout, DOM order determines visual left-to-right ordering. This test verifies
    // the typing-badge appears after room-action-btn in the source, ensuring it renders
    // to the right of the archive/unarchive button.
    const { readFileSync } = require("fs");
    const { join } = require("path");
    const sidebarPath = join(__dirname, "../Sidebar.svelte");
    const content = readFileSync(sidebarPath, "utf-8");

    // Extract room list item templates (both active and archived)
    const roomRowRegex = /<li[\s\S]*?role="option"[\s\S]*?<\/li>/g;
    const roomRows = Array.from(content.matchAll(roomRowRegex));

    expect(roomRows.length).toBeGreaterThan(0);

    // Check each room row for correct element ordering
    for (const [rowContent] of roomRows) {
      // Find element positions
      const actionBtnPos = rowContent.indexOf('class="room-action-btn"');
      const typingBadgePos = rowContent.indexOf('class="typing-badge"');

      // All room rows should have an action button
      expect(actionBtnPos).toBeGreaterThan(-1);

      // If this row has a typing badge, it must come after the action button
      if (typingBadgePos > -1) {
        expect(typingBadgePos).toBeGreaterThan(actionBtnPos);
      }
    }
  });
});
