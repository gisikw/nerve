import { describe, it, expect } from "vitest";
import { computeTextareaHeight } from "./compose";

/**
 * Tests for compose textarea resize logic.
 *
 * The computeTextareaHeight function is used by ComposeBar.svelte to determine
 * the appropriate height and overflow for the compose textarea based on its content.
 */

describe("compose textarea resize logic", () => {
  it("resets to auto height when text is empty", () => {
    const result = computeTextareaHeight(100, 40, "");
    expect(result.height).toBe("auto");
  });

  it("resets to auto height when text is only whitespace", () => {
    const result = computeTextareaHeight(100, 40, "   \n  ");
    expect(result.height).toBe("auto");
  });

  it("expands to scrollHeight when text is present", () => {
    const result = computeTextareaHeight(80, 40, "Hello, world!");
    expect(result.height).toBe("80px");
  });

  it("expands to scrollHeight for multi-line text", () => {
    const result = computeTextareaHeight(120, 40, "Line 1\nLine 2\nLine 3");
    expect(result.height).toBe("120px");
  });

  it("sets overflow to hidden when content fits", () => {
    const result = computeTextareaHeight(80, 100, "Short text");
    expect(result.overflowY).toBe("hidden");
  });

  it("sets overflow to auto when content exceeds offsetHeight", () => {
    const result = computeTextareaHeight(200, 100, "Very long text...");
    expect(result.overflowY).toBe("auto");
  });
});
