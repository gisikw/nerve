/**
 * Channel switcher selection logic.
 *
 * Determines which item should be selected by default when the filtered
 * room list changes.
 */

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
