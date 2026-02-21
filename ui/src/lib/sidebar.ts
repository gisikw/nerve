// Sidebar filtering logic for collapsible channels section.

import type { RoomInfo } from "./tauri";

/**
 * Determines which rooms should be visible when the channels section is collapsed.
 * When collapsed, only rooms with activity (unreads or mentions) are shown.
 * When expanded, all rooms are shown.
 */
/**
 * Determines if a room has activity that warrants showing it when collapsed.
 */
export function hasActivity(room: RoomInfo): boolean {
  return room.notification_count > 0;
}

export function filterVisibleRooms(
  rooms: RoomInfo[],
  isExpanded: boolean,
): RoomInfo[] {
  if (isExpanded) {
    return rooms;
  }
  // When collapsed, show only rooms with activity
  return rooms.filter(hasActivity);
}

/**
 * Format notification count for display in a badge.
 * Caps the count at 99, displaying "99+" for higher values.
 *
 * @param count - The notification count to format
 * @returns The formatted badge text
 */
export function formatNotificationBadge(count: number): string {
  if (count > 99) {
    return "99+";
  }
  return count.toString();
}
