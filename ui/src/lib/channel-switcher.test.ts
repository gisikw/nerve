import { describe, it, expect } from "vitest";
import { computeDefaultSelection } from "./channel-switcher";

/**
 * Tests for channel switcher selection logic.
 *
 * The computeDefaultSelection function determines which item should be selected
 * by default when the filtered room list changes. It ensures that matching rooms
 * are preferred over the "Create new" option.
 */

describe("channel switcher default selection", () => {
  it("selects first room when there are matching results", () => {
    const result = computeDefaultSelection(3, 0, 4);
    expect(result).toBe(0);
  });

  it("resets to first room when matches appear after no matches", () => {
    // User typed something with no matches, selectedIndex was at create option (index 1)
    // Then user continues typing and now there are matches
    const result = computeDefaultSelection(2, 1, 3);
    expect(result).toBe(0);
  });

  it("resets to first room even when current selection is valid but not first", () => {
    // User was at index 2, but we prefer first match when filtered list changes
    const result = computeDefaultSelection(5, 2, 6);
    expect(result).toBe(0);
  });

  it("clamps to last item when current index exceeds total items", () => {
    // User was at index 5, but now there are only 2 items total
    const result = computeDefaultSelection(0, 5, 2);
    expect(result).toBe(1);
  });

  it("selects create option when it is the only item", () => {
    // No matches, only the "Create new" option (1 total item)
    const result = computeDefaultSelection(0, 0, 1);
    expect(result).toBe(0);
  });

  it("handles empty list by returning 0", () => {
    const result = computeDefaultSelection(0, 0, 0);
    expect(result).toBe(0);
  });

  it("prefers first match over create option when both exist", () => {
    // 2 matching rooms + 1 create option = 3 total
    // Should select index 0 (first room), not index 2 (create option)
    const result = computeDefaultSelection(2, 2, 3);
    expect(result).toBe(0);
  });
});
