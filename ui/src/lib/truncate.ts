// Message body truncation for extremely long messages.
// Prevents rendering failures from oversized DOM payloads.

export const MAX_MESSAGE_LENGTH = 5000;

export interface TruncationResult {
  isTruncated: boolean;
  displayText: string;
  fullText: string;
}

/**
 * Truncate message body if it exceeds the length limit.
 * Truncates at word boundaries when possible to avoid mid-word cuts.
 */
export function truncateMessage(body: string): TruncationResult {
  if (body.length <= MAX_MESSAGE_LENGTH) {
    return {
      isTruncated: false,
      displayText: body,
      fullText: body,
    };
  }

  // Find last space before the limit to truncate at word boundary
  let truncateAt = MAX_MESSAGE_LENGTH;
  const lastSpace = body.lastIndexOf(" ", MAX_MESSAGE_LENGTH);
  if (lastSpace > MAX_MESSAGE_LENGTH * 0.9) {
    // Only use word boundary if it's not too far back (within 10% of limit)
    truncateAt = lastSpace;
  }

  return {
    isTruncated: true,
    displayText: body.slice(0, truncateAt),
    fullText: body,
  };
}
