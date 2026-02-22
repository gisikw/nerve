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

      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

      // Type a multi-line message
      await user.type(textarea, "Line 1\nLine 2\nLine 3");

      // After typing, the scrollHeight should increase (multi-line content)
      // and the resizeTextarea function sets height based on scrollHeight.
      // Wait for the height to be set to a pixel value
      await waitFor(() => {
        const height = textarea.style.height;
        // Height should be set to a pixel value when there's content
        expect(height).toMatch(/^\d+px$/);
        // Parse the height value - it should be greater than the default single-line height
        const heightValue = parseInt(height, 10);
        expect(heightValue).toBeGreaterThan(30); // Reasonable minimum for multi-line
      });

      const expandedHeight = textarea.style.height;

      // Submit the form (Enter key without Shift)
      await user.keyboard("{Enter}");

      // After submission, the textarea value should be empty and height should reset to "auto"
      // (computeTextareaHeight returns "auto" when text.trim() is empty)
      await waitFor(() => {
        expect(textarea.value).toBe("");
        expect(textarea.style.height).toBe("auto");
      });

      // Verify the height changed from the expanded state
      expect(expandedHeight).not.toBe("auto");

      // Verify sendMessage was called with the correct content
      expect(tauri.sendMessage).toHaveBeenCalledWith(
        "!test:example.com",
        "Line 1\nLine 2\nLine 3",
      );
    });
  });
});
