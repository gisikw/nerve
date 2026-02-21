/**
 * Compute the appropriate height and overflow for a textarea based on its content.
 *
 * @param scrollHeight - The scrollHeight of the textarea element
 * @param offsetHeight - The offsetHeight of the textarea element
 * @param text - The current text content
 * @returns Object with height and overflowY CSS values
 */
export function computeTextareaHeight(
  scrollHeight: number,
  offsetHeight: number,
  text: string,
): { height: string; overflowY: string } {
  // If empty, use auto height (single-line); otherwise expand to fit content
  const height = text.trim() ? `${scrollHeight}px` : "auto";

  // Determine overflow
  const overflowY = scrollHeight > offsetHeight ? "auto" : "hidden";

  return { height, overflowY };
}
