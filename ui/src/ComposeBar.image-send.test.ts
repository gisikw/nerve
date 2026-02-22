import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import ComposeBar from "./ComposeBar.svelte";
import * as tauri from "./lib/tauri";
import * as roomsStore from "./lib/stores/rooms.svelte";

/**
 * Tests for ComposeBar component image sending (with/without caption).
 *
 * Related spec: specs/message_compose.feature
 * Scenarios: Sending image with caption, sending image without caption
 */

describe("ComposeBar image sending", () => {
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

  describe("with caption", () => {
    it("sends image with caption text", async () => {
      const user = userEvent.setup();
      const sendImageSpy = vi.spyOn(tauri, "sendImage");

      render(ComposeBar);

      const textarea = screen.getByPlaceholderText(
        "Send a message...",
      ) as HTMLTextAreaElement;

      const imageFile = new File(["fake-image"], "test.png", { type: "image/png" });
      const clipboardData = {
        items: [
          {
            type: "image/png",
            getAsFile: () => imageFile,
          },
        ],
      };

      const pasteEvent = new ClipboardEvent("paste", {
        clipboardData: clipboardData as unknown as DataTransfer,
      });

      textarea.dispatchEvent(pasteEvent);

      await waitFor(() => {
        expect(screen.getByAltText("Attachment preview")).toBeTruthy();
      });

      await user.type(textarea, "This is a caption");
      await user.type(textarea, "{Enter}");

      await waitFor(() => {
        expect(sendImageSpy).toHaveBeenCalledWith(
          "!test:example.com",
          "test.png",
          expect.any(String),
          "image/png",
          "This is a caption",
        );
      });
    });

    it("clears attachment preview after sending", async () => {
      const user = userEvent.setup();
      render(ComposeBar);

      const textarea = screen.getByPlaceholderText(
        "Send a message...",
      ) as HTMLTextAreaElement;

      const imageFile = new File(["fake-image"], "test.png", { type: "image/png" });
      const clipboardData = {
        items: [
          {
            type: "image/png",
            getAsFile: () => imageFile,
          },
        ],
      };

      const pasteEvent = new ClipboardEvent("paste", {
        clipboardData: clipboardData as unknown as DataTransfer,
      });

      textarea.dispatchEvent(pasteEvent);

      await waitFor(() => {
        expect(screen.getByAltText("Attachment preview")).toBeTruthy();
      });

      await user.type(textarea, "Caption{Enter}");

      await waitFor(() => {
        expect(screen.queryByAltText("Attachment preview")).toBeNull();
      });
    });

    it("clears caption text after sending", async () => {
      const user = userEvent.setup();
      render(ComposeBar);

      const textarea = screen.getByPlaceholderText(
        "Send a message...",
      ) as HTMLTextAreaElement;

      const imageFile = new File(["fake-image"], "test.png", { type: "image/png" });
      const clipboardData = {
        items: [
          {
            type: "image/png",
            getAsFile: () => imageFile,
          },
        ],
      };

      const pasteEvent = new ClipboardEvent("paste", {
        clipboardData: clipboardData as unknown as DataTransfer,
      });

      textarea.dispatchEvent(pasteEvent);

      await waitFor(() => {
        expect(screen.getByAltText("Attachment preview")).toBeTruthy();
      });

      await user.type(textarea, "Caption{Enter}");

      await waitFor(() => {
        expect(textarea.value).toBe("");
      });
    });
  });

  describe("without caption", () => {
    it("sends image with null caption when input is empty", async () => {
      const user = userEvent.setup();
      const sendImageSpy = vi.spyOn(tauri, "sendImage");

      render(ComposeBar);

      const textarea = screen.getByPlaceholderText(
        "Send a message...",
      ) as HTMLTextAreaElement;

      const imageFile = new File(["fake-image"], "test.png", { type: "image/png" });
      const clipboardData = {
        items: [
          {
            type: "image/png",
            getAsFile: () => imageFile,
          },
        ],
      };

      const pasteEvent = new ClipboardEvent("paste", {
        clipboardData: clipboardData as unknown as DataTransfer,
      });

      textarea.dispatchEvent(pasteEvent);

      await waitFor(() => {
        expect(screen.getByAltText("Attachment preview")).toBeTruthy();
      });

      await user.type(textarea, "{Enter}");

      await waitFor(() => {
        expect(sendImageSpy).toHaveBeenCalledWith(
          "!test:example.com",
          "test.png",
          expect.any(String),
          "image/png",
          null,
        );
      });
    });

    it("clears attachment preview after sending", async () => {
      const user = userEvent.setup();
      render(ComposeBar);

      const textarea = screen.getByPlaceholderText(
        "Send a message...",
      ) as HTMLTextAreaElement;

      const imageFile = new File(["fake-image"], "test.png", { type: "image/png" });
      const clipboardData = {
        items: [
          {
            type: "image/png",
            getAsFile: () => imageFile,
          },
        ],
      };

      const pasteEvent = new ClipboardEvent("paste", {
        clipboardData: clipboardData as unknown as DataTransfer,
      });

      textarea.dispatchEvent(pasteEvent);

      await waitFor(() => {
        expect(screen.getByAltText("Attachment preview")).toBeTruthy();
      });

      await user.type(textarea, "{Enter}");

      await waitFor(() => {
        expect(screen.queryByAltText("Attachment preview")).toBeNull();
      });
    });
  });
});
