import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

/**
 * Regression tests for ChannelSwitcher markup bugs (ner-e99c).
 *
 * These tests verify DOM attribute correctness by checking the component source.
 * This approach is used because:
 * 1. The bugs are purely presentational (spellcheck attribute, bold styling)
 * 2. No DOM testing environment (JSDOM, Testing Library) is configured
 * 3. The alternative (full browser automation) is disproportionate for these fixes
 *
 * Regression context:
 * - Input field had browser spellcheck enabled, causing red squiggles on room names
 * - "Create new" option used <strong> tags, making it appear selected when it wasn't
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const componentPath = join(__dirname, "ChannelSwitcher.svelte");
const componentSource = readFileSync(componentPath, "utf-8");

describe("ChannelSwitcher markup regression tests", () => {
  it("disables spellcheck on the filter input", () => {
    // Bug: Browser spellcheck created red underlines on room names
    // Fix: Added spellcheck="false" attribute to input#switcher-input
    const inputPattern = /<input[^>]*id="switcher-input"[^>]*>/;
    const inputTag = componentSource.match(inputPattern)?.[0];

    expect(inputTag).toBeDefined();
    expect(inputTag).toContain('spellcheck="false"');
  });

  it("does not use strong tags in create option", () => {
    // Bug: <strong> tags made the room name appear bold/selected
    // Fix: Removed <strong> wrapper, use plain text interpolation

    // Verify the buggy pattern is absent
    expect(componentSource).not.toContain('<strong>#{query.trim()}</strong>');

    // Verify the correct pattern exists: plain text with interpolation
    expect(componentSource).toContain('+ Create #{query.trim()}');
  });

  it("applies unread class to rooms with notification_count or highlight_count", () => {
    // Spec: channel_switcher.feature "Channels with unreads appear bold in the switcher"
    // Verify the class binding exists for both notification_count and highlight_count
    expect(componentSource).toContain(
      "class:unread={room.notification_count > 0 || room.highlight_count > 0}"
    );
  });

  it("create option template is in the showCreate conditional block", () => {
    // Structural verification: ensure the "Create" text is only shown
    // when showCreate is true, to prevent it appearing unconditionally
    const createBlock = componentSource.match(
      /{#if showCreate}[\s\S]*?\+ Create #\{query\.trim\(\)\}[\s\S]*?{\/if}/
    );

    expect(createBlock).toBeTruthy();
  });
});
