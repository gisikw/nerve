import { describe, it, expect } from "vitest";
import { filterVisibleRooms, hasActivity, formatNotificationBadge } from "./sidebar";
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

  describe("formatNotificationBadge", () => {
    it("displays count as-is for values under 100", () => {
      expect(formatNotificationBadge(0)).toBe("0");
      expect(formatNotificationBadge(1)).toBe("1");
      expect(formatNotificationBadge(42)).toBe("42");
      expect(formatNotificationBadge(99)).toBe("99");
    });

    it("displays '99+' for count of 100", () => {
      expect(formatNotificationBadge(100)).toBe("99+");
    });

    it("displays '99+' for counts greater than 100", () => {
      expect(formatNotificationBadge(101)).toBe("99+");
      expect(formatNotificationBadge(250)).toBe("99+");
      expect(formatNotificationBadge(999)).toBe("99+");
      expect(formatNotificationBadge(9999)).toBe("99+");
    });

    it("handles boundary value of 99 correctly", () => {
      expect(formatNotificationBadge(99)).toBe("99");
      expect(formatNotificationBadge(100)).toBe("99+");
    });
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
