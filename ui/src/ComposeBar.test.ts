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

  describe("basic message sending", () => {
    it("clears the input after sending a message", async () => {
      const user = userEvent.setup();
      render(ComposeBar);

      const textarea = screen.getByPlaceholderText(
        "Send a message...",
      ) as HTMLTextAreaElement;

      await user.type(textarea, "Hello, world!");
      expect(textarea.value).toBe("Hello, world!");

      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(textarea.value).toBe("");
      });
    });

    it("submits the message when Enter is pressed without Shift", async () => {
      const user = userEvent.setup();
      render(ComposeBar);

      const textarea = screen.getByPlaceholderText(
        "Send a message...",
      ) as HTMLTextAreaElement;

      await user.type(textarea, "Test message");
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(tauri.sendMessage).toHaveBeenCalledWith(
          "!test:example.com",
          "Test message",
        );
      });
    });

    it("inserts a newline when Shift+Enter is pressed", async () => {
      const user = userEvent.setup();
      render(ComposeBar);

      const textarea = screen.getByPlaceholderText(
        "Send a message...",
      ) as HTMLTextAreaElement;

      await user.type(textarea, "Line 1");
      await user.keyboard("{Shift>}{Enter}{/Shift}");
      await user.type(textarea, "Line 2");

      expect(textarea.value).toContain("Line 1\nLine 2");
      expect(tauri.sendMessage).not.toHaveBeenCalled();
    });

    it("does not send empty messages", async () => {
      const user = userEvent.setup();
      render(ComposeBar);

      const textarea = screen.getByPlaceholderText(
        "Send a message...",
      ) as HTMLTextAreaElement;

      await user.click(textarea);
      await user.keyboard("{Enter}");

      expect(tauri.sendMessage).not.toHaveBeenCalled();
      expect(textarea.value).toBe("");
    });

    it("does not send whitespace-only messages", async () => {
      const user = userEvent.setup();
      render(ComposeBar);

      const textarea = screen.getByPlaceholderText(
        "Send a message...",
      ) as HTMLTextAreaElement;

      await user.type(textarea, "   \n  \t  ");
      await user.keyboard("{Enter}");

      expect(tauri.sendMessage).not.toHaveBeenCalled();
      // Input should not be cleared when message is not sent
      expect(textarea.value).toBe("   \n  \t  ");
    });

    it("does not send messages when no room is selected", async () => {
      vi.spyOn(roomsStore, "getSelectedRoomId").mockReturnValue(null);

      const user = userEvent.setup();
      render(ComposeBar);

      const textarea = screen.getByPlaceholderText(
        "Send a message...",
      ) as HTMLTextAreaElement;

      await user.type(textarea, "Test message");
      await user.keyboard("{Enter}");

      expect(tauri.sendMessage).not.toHaveBeenCalled();
      expect(textarea.value).toBe("Test message");
    });

    it("sends message which triggers backend to refresh room", async () => {
      const user = userEvent.setup();
      render(ComposeBar);

      const textarea = screen.getByPlaceholderText(
        "Send a message...",
      ) as HTMLTextAreaElement;

      await user.type(textarea, "Test message");

      // Clear the mock to ensure we're only counting the send call
      vi.mocked(tauri.sendMessage).mockClear();

      await user.keyboard("{Enter}");

      // Verify message was sent to backend
      // (Backend will emit events that trigger room refresh - not tested here)
      await waitFor(() => {
        expect(tauri.sendMessage).toHaveBeenCalledWith(
          "!test:example.com",
          "Test message",
        );
      });
    });
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
