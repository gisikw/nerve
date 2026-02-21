import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  getArchivedRoomIds,
  toggleArchive,
  getShowArchived,
  toggleShowArchived,
  getShowChannels,
  toggleShowChannels,
} from "./rooms.svelte";

/**
 * Tests for room archiving logic in the rooms store.
 *
 * The rooms store manages archive state via localStorage, allowing users to
 * hide rooms from the active Channels section without leaving them. Archived
 * rooms appear in a separate collapsible Archived section and can be unarchived
 * to restore them to the active list.
 */

describe("room archiving", () => {
  const ARCHIVE_KEY = "nerve-archived-rooms";

  // Save and restore localStorage state across tests
  let savedStorage: string | null;

  beforeEach(() => {
    savedStorage = localStorage.getItem(ARCHIVE_KEY);
    localStorage.removeItem(ARCHIVE_KEY);

    // Clear any existing archived rooms from the store state
    const currentArchived = getArchivedRoomIds();
    currentArchived.forEach(id => toggleArchive(id));
  });

  afterEach(() => {
    if (savedStorage !== null) {
      localStorage.setItem(ARCHIVE_KEY, savedStorage);
    } else {
      localStorage.removeItem(ARCHIVE_KEY);
    }
  });

  describe("getArchivedRoomIds", () => {
    it("returns empty set when no rooms are archived", () => {
      const archived = getArchivedRoomIds();
      expect(archived.size).toBe(0);
    });

    it("reflects archived state after toggle operations", () => {
      // Since the store state is initialized on module load and doesn't reload from
      // localStorage on every access, we verify that the store correctly maintains
      // archived state through toggle operations
      const room1 = "!room1:matrix.org";
      const room2 = "!room2:matrix.org";

      toggleArchive(room1);
      toggleArchive(room2);

      const archived = getArchivedRoomIds();
      expect(archived.has(room1)).toBe(true);
      expect(archived.has(room2)).toBe(true);
      expect(archived.size).toBe(2);
    });

    it("handles corrupted localStorage data gracefully", () => {
      localStorage.setItem(ARCHIVE_KEY, "invalid json{");

      // The store should handle this gracefully and return empty set
      // We test this by verifying toggle works without errors
      expect(() => toggleArchive("!test:matrix.org")).not.toThrow();

      const archived = getArchivedRoomIds();
      expect(archived.has("!test:matrix.org")).toBe(true);
    });
  });

  describe("toggleArchive", () => {
    it("archives a room when not already archived", () => {
      const roomId = "!test:matrix.org";

      toggleArchive(roomId);

      const archived = getArchivedRoomIds();
      expect(archived.has(roomId)).toBe(true);
    });

    it("unarchives a room when already archived", () => {
      const roomId = "!test:matrix.org";

      toggleArchive(roomId); // Archive
      expect(getArchivedRoomIds().has(roomId)).toBe(true);

      toggleArchive(roomId); // Unarchive
      expect(getArchivedRoomIds().has(roomId)).toBe(false);
    });

    it("persists archive state to localStorage", () => {
      const roomId = "!persistent:matrix.org";

      toggleArchive(roomId);

      const stored = localStorage.getItem(ARCHIVE_KEY);
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed).toContain(roomId);
    });

    it("persists unarchive state to localStorage", () => {
      const roomId = "!unarchive-test:matrix.org";

      toggleArchive(roomId); // Archive
      toggleArchive(roomId); // Unarchive

      const stored = localStorage.getItem(ARCHIVE_KEY);
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed).not.toContain(roomId);
    });

    it("handles multiple archived rooms", () => {
      const room1 = "!room1:matrix.org";
      const room2 = "!room2:matrix.org";
      const room3 = "!room3:matrix.org";

      toggleArchive(room1);
      toggleArchive(room2);
      toggleArchive(room3);

      const archived = getArchivedRoomIds();
      expect(archived.size).toBe(3);
      expect(archived.has(room1)).toBe(true);
      expect(archived.has(room2)).toBe(true);
      expect(archived.has(room3)).toBe(true);
    });

    it("handles archiving and unarchiving different rooms", () => {
      const room1 = "!room1:matrix.org";
      const room2 = "!room2:matrix.org";

      toggleArchive(room1);
      toggleArchive(room2);
      toggleArchive(room1); // Unarchive room1

      const archived = getArchivedRoomIds();
      expect(archived.size).toBe(1);
      expect(archived.has(room1)).toBe(false);
      expect(archived.has(room2)).toBe(true);
    });

    it("is idempotent for multiple toggle operations", () => {
      const roomId = "!idempotent:matrix.org";

      // Archive, unarchive, archive again
      toggleArchive(roomId);
      toggleArchive(roomId);
      toggleArchive(roomId);

      const archived = getArchivedRoomIds();
      expect(archived.has(roomId)).toBe(true);

      // One more toggle to unarchive
      toggleArchive(roomId);
      expect(getArchivedRoomIds().has(roomId)).toBe(false);
    });
  });

  describe("localStorage persistence", () => {
    it("stores archived room IDs as JSON array", () => {
      const room1 = "!room1:matrix.org";
      const room2 = "!room2:matrix.org";

      toggleArchive(room1);
      toggleArchive(room2);

      const stored = localStorage.getItem(ARCHIVE_KEY);
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(2);
      expect(parsed).toContain(room1);
      expect(parsed).toContain(room2);
    });

    it("maintains archive state across multiple operations", () => {
      const rooms = ["!a:matrix.org", "!b:matrix.org", "!c:matrix.org"];

      // Archive all
      rooms.forEach(room => toggleArchive(room));

      // Unarchive middle one
      toggleArchive(rooms[1]);

      const stored = localStorage.getItem(ARCHIVE_KEY);
      const parsed = JSON.parse(stored!);

      expect(parsed).toContain(rooms[0]);
      expect(parsed).not.toContain(rooms[1]);
      expect(parsed).toContain(rooms[2]);
    });

    it("stores empty array when all rooms are unarchived", () => {
      const roomId = "!last:matrix.org";

      toggleArchive(roomId);
      toggleArchive(roomId); // Unarchive

      const stored = localStorage.getItem(ARCHIVE_KEY);
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed).toEqual([]);
    });
  });
});

describe("archived section visibility", () => {
  describe("getShowArchived", () => {
    it("returns false by default", () => {
      expect(getShowArchived()).toBe(false);
    });

    it("returns current visibility state", () => {
      const initial = getShowArchived();
      toggleShowArchived();
      const toggled = getShowArchived();

      expect(toggled).toBe(!initial);
    });
  });

  describe("toggleShowArchived", () => {
    it("toggles from false to true", () => {
      const initial = getShowArchived();
      toggleShowArchived();

      expect(getShowArchived()).toBe(!initial);
    });

    it("toggles from true to false", () => {
      toggleShowArchived(); // Set to true (or false, depending on initial)
      const intermediate = getShowArchived();
      toggleShowArchived(); // Toggle back

      expect(getShowArchived()).toBe(!intermediate);
    });

    it("is idempotent across multiple calls", () => {
      const start = getShowArchived();

      toggleShowArchived();
      toggleShowArchived();

      expect(getShowArchived()).toBe(start);
    });
  });
});

describe("channels section visibility", () => {
  describe("getShowChannels", () => {
    it("returns true by default", () => {
      // Channels section should be expanded by default
      expect(getShowChannels()).toBe(true);
    });

    it("returns current visibility state", () => {
      const initial = getShowChannels();
      toggleShowChannels();
      const toggled = getShowChannels();

      expect(toggled).toBe(!initial);
    });
  });

  describe("toggleShowChannels", () => {
    it("toggles from true to false", () => {
      // Ensure we start from true
      const initial = getShowChannels();
      if (!initial) {
        toggleShowChannels(); // Get to true first
      }

      toggleShowChannels();
      expect(getShowChannels()).toBe(false);
    });

    it("toggles from false to true", () => {
      // Ensure we start from false
      const initial = getShowChannels();
      if (initial) {
        toggleShowChannels(); // Get to false first
      }

      toggleShowChannels();
      expect(getShowChannels()).toBe(true);
    });

    it("is idempotent across multiple calls", () => {
      const start = getShowChannels();

      toggleShowChannels();
      toggleShowChannels();

      expect(getShowChannels()).toBe(start);
    });
  });
});
