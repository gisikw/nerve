/**
 * The threshold in pixels for determining "near bottom" behavior.
 * Used for both auto-scroll and scroll-to-bottom button visibility.
 */
const NEAR_BOTTOM_THRESHOLD = 200;

/**
 * Determines whether the scroll position is near the bottom of a container.
 *
 * @param scrollTop - Current scroll position from the top
 * @param clientHeight - Visible height of the scroll container
 * @param scrollHeight - Total scrollable height
 * @returns true if the user is within 200px of the bottom
 */
export function isNearBottom(
  scrollTop: number,
  clientHeight: number,
  scrollHeight: number
): boolean {
  const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
  return distanceFromBottom <= NEAR_BOTTOM_THRESHOLD;
}

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
  return !isNearBottom(scrollTop, clientHeight, scrollHeight);
}
