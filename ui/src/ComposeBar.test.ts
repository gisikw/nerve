import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import ComposeBar from "./ComposeBar.svelte";
import * as tauri from "./lib/tauri";
import * as roomsStore from "./lib/stores/rooms.svelte";

/**
 * Tests for ComposeBar component core functionality.
 *
 * Related spec: specs/message_compose.feature
 *
 * Note: Image attachment tests are in ComposeBar.image-attachment.test.ts
 */

describe("ComposeBar component", () => {
  beforeEach(() => {
    vi.spyOn(tauri, "sendMessage").mockResolvedValue(undefined);
    vi.spyOn(tauri, "sendImage").mockResolvedValue(undefined);
    vi.spyOn(tauri, "sendTypingNotice").mockResolvedValue(undefined);
    vi.spyOn(roomsStore, "getSelectedRoomId").mockReturnValue("!test:example.com");
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe("textarea height management", () => {
    it("resets textarea height to auto after sending a message", async () => {
      const user = userEvent.setup();
      render(ComposeBar);

      const textarea = screen.getByPlaceholderText(
        "Send a message...",
      ) as HTMLTextAreaElement;

      // jsdom doesn't compute layout, so scrollHeight is always 0.
      // Mock it to simulate real browser behavior where multi-line content
      // increases scrollHeight.
      Object.defineProperty(textarea, "scrollHeight", {
        get: () => (textarea.value.includes("\n") ? 72 : 36),
        configurable: true,
      });

      // Type a multi-line message to make the textarea grow
      await user.type(textarea, "Line 1\nLine 2\nLine 3");

      // Wait for textarea to expand
      await waitFor(() => {
        const height = textarea.style.height;
        // Height should be set to a pixel value when there's content
        expect(height).toMatch(/^\d+px$/);
        // Parse the height value - it should be greater than the default
        const heightValue = parseInt(height, 10);
        expect(heightValue).toBeGreaterThan(30); // Reasonable minimum for multi-line
      });

      // Submit the message (this should reset the height)
      await user.type(textarea, "{Enter}");

      // Wait for textarea to collapse back to single-line height
      await waitFor(
        () => {
          const height = textarea.style.height;
          // The height should reset to "auto"
          expect(height).toBe("auto");
        },
        { timeout: 1000 },
      );
    });
  });
});
