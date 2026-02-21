import { formatSender } from "./message-grouping";

/**
 * Formats a list of typing user IDs into a human-readable label.
 *
 * Display rules:
 * - 1 user: "Alice is typing..."
 * - 2 users: "Alice and Bob are typing..."
 * - 3+ users: "Alice, Bob and others are typing..."
 *
 * @param userIds - Array of Matrix user IDs (e.g., ["@alice:matrix.org"])
 * @returns Formatted typing indicator text
 */
export function typingLabel(userIds: string[]): string {
  if (userIds.length === 0) {
    return "";
  }

  const names = userIds.map(formatSender);

  if (names.length === 1) {
    return `${names[0]} is typing...`;
  }

  if (names.length === 2) {
    return `${names[0]} and ${names[1]} are typing...`;
  }

  // 3 or more users
  return `${names.slice(0, 2).join(", ")} and others are typing...`;
}
