/**
 * Error logging utilities for background operations
 *
 * Background operations (pinned events fetch, typing notices, etc.) should
 * log errors to console without showing toasts to avoid interrupting the user.
 */

/**
 * Decision function: should an error be logged for a background operation?
 */
export function shouldLogBackgroundError(error: unknown): boolean {
  return error !== null && error !== undefined;
}

/**
 * Decision function: format error message for pinned events fetch failure
 */
export function formatPinnedEventsFetchError(roomId: string): string {
  return `Failed to fetch pinned events for room ${roomId}:`;
}

/**
 * Decision function: format error message for pinned events refresh failure
 */
export function formatPinnedEventsRefreshError(roomId: string): string {
  return `Failed to refresh pinned events for room ${roomId}:`;
}

/**
 * Decision function: format error message for stream fetch failure
 */
export function formatStreamsFetchError(roomId: string): string {
  return `Failed to fetch streams for room ${roomId}:`;
}

/**
 * Decision function: format error message for stream action failure
 */
export function formatStreamActionError(
  roomId: string,
  streamId: string,
  buttonId: string,
): string {
  return `Failed to send stream action (button: ${buttonId}) for stream ${streamId} in room ${roomId}:`;
}

/**
 * Helper: Log an error for a background operation
 * This logs to console.error but does not show a toast
 */
export function logBackgroundError(message: string, error: unknown): void {
  if (shouldLogBackgroundError(error)) {
    console.error(message, error);
  }
}
