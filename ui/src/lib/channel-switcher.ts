/**
 * Channel switcher selection and sorting logic.
 *
 * Determines which item should be selected by default when the filtered
 * room list changes, and how rooms should be sorted and grouped.
 */

import type { RoomInfo } from "./tauri";

/**
 * Compute the default selected index for the channel switcher.
 *
 * When there are matching rooms, the first room should be selected.
 * The "Create new" option should only be selected when there are no matches.
 *
 * @param filteredCount - Number of rooms matching the current query
 * @param currentIndex - Current selected index
 * @param totalItems - Total number of selectable items (rooms + optional create)
 * @returns The index that should be selected
 */
export function computeDefaultSelection(
  filteredCount: number,
  currentIndex: number,
  totalItems: number,
): number {
  if (filteredCount > 0) {
    // When there are matching rooms, default to the first match
    return 0;
  } else if (currentIndex >= totalItems) {
    // Clamp when no matches but ensure index is valid
    return Math.max(0, totalItems - 1);
  }
  // Keep current selection if it's valid
  return currentIndex;
}

/**
 * Group identifier for room categorization.
 */
export enum RoomGroup {
  Mentioned = 0,
  Unread = 1,
  Read = 2,
  Archived = 3,
}

/**
 * Determine which group a room belongs to.
 *
 * @param room - The room to categorize
 * @returns The group identifier
 */
export function getRoomGroup(room: RoomInfo): RoomGroup {
  if (room.is_low_priority) {
    return RoomGroup.Archived;
  }
  if (room.highlight_count > 0) {
    return RoomGroup.Mentioned;
  }
  if (room.notification_count > 0) {
    return RoomGroup.Unread;
  }
  return RoomGroup.Read;
}

/**
 * Sort rooms by group (mentioned, unread, read, archived) and then by last
 * activity within each group.
 *
 * @param rooms - The list of rooms to sort
 * @returns A new sorted array of rooms
 */
export function sortRooms(rooms: RoomInfo[]): RoomInfo[] {
  return [...rooms].sort((a, b) => {
    const groupA = getRoomGroup(a);
    const groupB = getRoomGroup(b);

    // First sort by group priority
    if (groupA !== groupB) {
      return groupA - groupB;
    }

    // Within the same group, sort by last activity (most recent first)
    return b.last_activity - a.last_activity;
  });
}
