import { describe, it, expect } from "vitest";
import { shouldShowScrollButton, isNearBottom } from "./scroll";

describe("shouldShowScrollButton", () => {
  it("returns false when at the bottom", () => {
    const scrollTop = 500;
    const clientHeight = 300;
    const scrollHeight = 800; // scrollTop (500) + clientHeight (300) = 800 (at bottom)

    const result = shouldShowScrollButton(scrollTop, clientHeight, scrollHeight);
    expect(result).toBe(false);
  });

  it("returns false when near the bottom (within 200px threshold)", () => {
    const scrollTop = 450;
    const clientHeight = 300;
    const scrollHeight = 950; // scrollTop (450) + clientHeight (300) = 750, distance from bottom = 200

    const result = shouldShowScrollButton(scrollTop, clientHeight, scrollHeight);
    expect(result).toBe(false);
  });

  it("returns true when scrolled up more than 200px from bottom", () => {
    const scrollTop = 100;
    const clientHeight = 300;
    const scrollHeight = 800; // scrollTop (100) + clientHeight (300) = 400, distance from bottom = 400

    const result = shouldShowScrollButton(scrollTop, clientHeight, scrollHeight);
    expect(result).toBe(true);
  });

  it("returns false when content is shorter than viewport", () => {
    const scrollTop = 0;
    const clientHeight = 500;
    const scrollHeight = 400; // Content is shorter than viewport

    const result = shouldShowScrollButton(scrollTop, clientHeight, scrollHeight);
    expect(result).toBe(false);
  });

  it("returns false at scrollTop = 0 for short content", () => {
    const scrollTop = 0;
    const clientHeight = 300;
    const scrollHeight = 300; // Exactly fits viewport

    const result = shouldShowScrollButton(scrollTop, clientHeight, scrollHeight);
    expect(result).toBe(false);
  });

  it("handles edge case at exact threshold boundary (201px)", () => {
    const scrollTop = 449;
    const clientHeight = 300;
    const scrollHeight = 950; // scrollTop (449) + clientHeight (300) = 749, distance from bottom = 201

    const result = shouldShowScrollButton(scrollTop, clientHeight, scrollHeight);
    expect(result).toBe(true);
  });

  it("handles large scroll containers", () => {
    const scrollTop = 0;
    const clientHeight = 800;
    const scrollHeight = 10000; // Very long chat history

    const result = shouldShowScrollButton(scrollTop, clientHeight, scrollHeight);
    expect(result).toBe(true);
  });
});

describe("isNearBottom", () => {
  it("returns true when at the bottom", () => {
    const scrollTop = 500;
    const clientHeight = 300;
    const scrollHeight = 800; // scrollTop (500) + clientHeight (300) = 800 (at bottom)

    const result = isNearBottom(scrollTop, clientHeight, scrollHeight);
    expect(result).toBe(true);
  });

  it("returns true when within 200px of the bottom", () => {
    const scrollTop = 450;
    const clientHeight = 300;
    const scrollHeight = 950; // scrollTop (450) + clientHeight (300) = 750, distance from bottom = 200

    const result = isNearBottom(scrollTop, clientHeight, scrollHeight);
    expect(result).toBe(true);
  });

  it("returns true when within 100px of the bottom", () => {
    const scrollTop = 500;
    const clientHeight = 300;
    const scrollHeight = 900; // scrollTop (500) + clientHeight (300) = 800, distance from bottom = 100

    const result = isNearBottom(scrollTop, clientHeight, scrollHeight);
    expect(result).toBe(true);
  });

  it("returns false when scrolled up more than 200px from bottom", () => {
    const scrollTop = 100;
    const clientHeight = 300;
    const scrollHeight = 800; // scrollTop (100) + clientHeight (300) = 400, distance from bottom = 400

    const result = isNearBottom(scrollTop, clientHeight, scrollHeight);
    expect(result).toBe(false);
  });

  it("returns true when content is shorter than viewport", () => {
    const scrollTop = 0;
    const clientHeight = 500;
    const scrollHeight = 400; // Content is shorter than viewport

    const result = isNearBottom(scrollTop, clientHeight, scrollHeight);
    expect(result).toBe(true);
  });

  it("handles edge case at exact threshold boundary (200px)", () => {
    const scrollTop = 450;
    const clientHeight = 300;
    const scrollHeight = 950; // scrollTop (450) + clientHeight (300) = 750, distance from bottom = 200

    const result = isNearBottom(scrollTop, clientHeight, scrollHeight);
    expect(result).toBe(true);
  });

  it("returns false at exact threshold boundary + 1px (201px)", () => {
    const scrollTop = 449;
    const clientHeight = 300;
    const scrollHeight = 950; // scrollTop (449) + clientHeight (300) = 749, distance from bottom = 201

    const result = isNearBottom(scrollTop, clientHeight, scrollHeight);
    expect(result).toBe(false);
  });

  it("handles large scroll containers scrolled to top", () => {
    const scrollTop = 0;
    const clientHeight = 800;
    const scrollHeight = 10000; // Very long chat history, at top

    const result = isNearBottom(scrollTop, clientHeight, scrollHeight);
    expect(result).toBe(false);
  });

  it("handles large scroll containers near bottom", () => {
    const scrollTop = 9100;
    const clientHeight = 800;
    const scrollHeight = 10000; // scrollTop (9100) + clientHeight (800) = 9900, distance = 100

    const result = isNearBottom(scrollTop, clientHeight, scrollHeight);
    expect(result).toBe(true);
  });
});
