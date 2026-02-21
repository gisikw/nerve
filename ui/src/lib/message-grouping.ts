import type { Message } from "./tauri";

/**
 * Time threshold for message grouping in milliseconds.
 * Messages from the same sender within this time window are grouped together.
 */
const GROUP_TIME_THRESHOLD = 300_000; // 5 minutes

/**
 * Determines if a message should start a new visual group.
 * A message starts a new group if:
 * - It's the first message
 * - It's from a different sender than the previous message
 * - It's more than 5 minutes after the previous message
 *
 * @param messages - Array of messages in chronological order
 * @param index - Index of the current message
 * @returns true if the message should display sender name and timestamp
 */
export function isGroupStart(messages: Message[], index: number): boolean {
  if (index === 0) return true;
  const prev = messages[index - 1];
  const curr = messages[index];
  return (
    prev.sender !== curr.sender ||
    curr.timestamp - prev.timestamp >= GROUP_TIME_THRESHOLD
  );
}

/**
 * Formats a Matrix user ID for display by removing the server suffix.
 * Converts "@alice:matrix.org" to "alice".
 *
 * @param userId - Full Matrix user ID (e.g., "@alice:matrix.org")
 * @returns Display name without @ prefix and server suffix
 */
export function formatSender(userId: string): string {
  // Matrix IDs are in format @localpart:server
  // Split on colon and remove @ from the localpart
  const parts = userId.split(":");
  const localpart = parts[0];

  if (!localpart) return userId;

  // Remove @ prefix if present
  if (localpart.startsWith("@")) {
    return localpart.slice(1);
  }

  // No @ prefix - return as-is (edge case for malformed IDs)
  return localpart;
}
