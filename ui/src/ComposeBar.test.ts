import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import ComposeBar from "./ComposeBar.svelte";
import * as tauri from "./lib/tauri";
import * as roomsStore from "./lib/stores/rooms.svelte";

/**
 * Tests for ComposeBar component textarea height management.
 *
 * Related spec: specs/message_compose.feature
 * Scenario: "Textarea height resets after sending"
 */

describe("ComposeBar component", () => {
  beforeEach(() => {
    // Mock Tauri commands
    vi.spyOn(tauri, "sendMessage").mockResolvedValue(undefined);
    vi.spyOn(tauri, "sendTypingNotice").mockResolvedValue(undefined);

    // Mock room store to return a selected room
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

      // Type a multi-line message to make the textarea grow
      await user.type(textarea, "Line 1\nLine 2\nLine 3");

      // Wait for textarea to expand
      await waitFor(() => {
        const height = textarea.style.height;
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
