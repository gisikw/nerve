/**
 * Determines whether the scroll-to-bottom button should be shown.
 *
 * @param scrollTop - Current scroll position from the top
 * @param clientHeight - Visible height of the scroll container
 * @param scrollHeight - Total scrollable height
 * @returns true if the user is scrolled up more than 200px from the bottom
 */
export function shouldShowScrollButton(
  scrollTop: number,
  clientHeight: number,
  scrollHeight: number
): boolean {
  const THRESHOLD = 200;
  const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
  return distanceFromBottom > THRESHOLD;
}
