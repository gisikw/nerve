import { describe, it, expect } from "vitest";
import { truncateMessage, MAX_MESSAGE_LENGTH } from "./truncate";

describe("truncateMessage", () => {
  it("does not truncate short messages", () => {
    const short = "Hello, world!";
    const result = truncateMessage(short);
    expect(result.isTruncated).toBe(false);
    expect(result.displayText).toBe(short);
    expect(result.fullText).toBe(short);
  });

  it("does not truncate messages exactly at the limit", () => {
    const exact = "a".repeat(MAX_MESSAGE_LENGTH);
    const result = truncateMessage(exact);
    expect(result.isTruncated).toBe(false);
    expect(result.displayText).toBe(exact);
  });

  it("truncates messages exceeding the limit", () => {
    const long = "a".repeat(MAX_MESSAGE_LENGTH + 100);
    const result = truncateMessage(long);
    expect(result.isTruncated).toBe(true);
    expect(result.displayText.length).toBeLessThanOrEqual(MAX_MESSAGE_LENGTH);
    expect(result.fullText).toBe(long);
  });

  it("truncates at word boundaries when possible", () => {
    const words = "word ".repeat(2000); // Creates a long message with spaces
    const result = truncateMessage(words);
    expect(result.isTruncated).toBe(true);
    // Should not end mid-word (shouldn't end with partial "word")
    expect(result.displayText.endsWith(" ") || result.displayText.endsWith("word")).toBe(true);
    expect(result.displayText.length).toBeLessThanOrEqual(MAX_MESSAGE_LENGTH);
  });

  it("truncates at exact limit if no word boundary is nearby", () => {
    // Long string with no spaces in the truncation zone
    const noSpaces = "a".repeat(MAX_MESSAGE_LENGTH + 1000);
    const result = truncateMessage(noSpaces);
    expect(result.isTruncated).toBe(true);
    expect(result.displayText.length).toBe(MAX_MESSAGE_LENGTH);
  });

  it("preserves full text for later expansion", () => {
    const long = "x".repeat(10000);
    const result = truncateMessage(long);
    expect(result.fullText).toBe(long);
    expect(result.fullText.length).toBe(10000);
  });

  it("handles messages with only spaces at the boundary", () => {
    const text = "a".repeat(MAX_MESSAGE_LENGTH - 10) + " ".repeat(20) + "end";
    const result = truncateMessage(text);
    expect(result.isTruncated).toBe(true);
    expect(result.displayText.length).toBeLessThanOrEqual(MAX_MESSAGE_LENGTH);
  });
});
