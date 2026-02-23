import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import ComposeBar from "./ComposeBar.svelte";
import * as tauri from "./lib/tauri";
import * as roomsStore from "./lib/stores/rooms.svelte";

/**
 * Tests for ComposeBar component MIME type handling for image attachments.
 *
 * Related spec: specs/message_compose.feature
 * Scenarios: MIME type detection, unknown formats
 */

describe("ComposeBar image MIME types", () => {
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

  it("uses file.type when present", async () => {
    const user = userEvent.setup();
    const sendImageSpy = vi.spyOn(tauri, "sendImage");

    render(ComposeBar);

    const textarea = screen.getByPlaceholderText(
      "Send a message...",
    ) as HTMLTextAreaElement;

    const imageFile = new File(["fake-image"], "test.jpg", { type: "image/jpeg" });

    const clipboardData = {
      items: [
        {
          type: "image/jpeg",
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
        "test.jpg",
        expect.any(String),
        "image/jpeg",
        null,
      );
    });
  });

  it("infers MIME type from extension when file.type is empty", async () => {
    const user = userEvent.setup();
    const sendImageSpy = vi.spyOn(tauri, "sendImage");

    render(ComposeBar);

    const textarea = screen.getByPlaceholderText(
      "Send a message...",
    ) as HTMLTextAreaElement;

    // File with empty type but recognizable extension
    const imageFile = new File(["fake-image"], "test.png", { type: "" });

    const clipboardData = {
      items: [
        {
          type: "image/png", // Clipboard item type (for paste handler)
          getAsFile: () => imageFile, // But file itself has no type
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

    // Should send with MIME type inferred from .png extension
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

  it("sends file with unknown extension but valid MIME type", async () => {
    const user = userEvent.setup();
    const sendImageSpy = vi.spyOn(tauri, "sendImage");

    render(ComposeBar);

    const textarea = screen.getByPlaceholderText(
      "Send a message...",
    ) as HTMLTextAreaElement;

    const imageFile = new File(["fake-image"], "test.xyz", { type: "image/unknown" });

    const clipboardData = {
      items: [
        {
          type: "image/unknown",
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
        "test.xyz",
        expect.any(String),
        "image/unknown",
        null,
      );
    });

    await waitFor(() => {
      expect(screen.queryByAltText("Attachment preview")).toBeNull();
    });
  });

  it("rejects file with unknown extension and no MIME type", async () => {
    const user = userEvent.setup();
    const sendImageSpy = vi.spyOn(tauri, "sendImage");

    render(ComposeBar);

    const textarea = screen.getByPlaceholderText(
      "Send a message...",
    ) as HTMLTextAreaElement;

    // File with unknown extension and empty MIME type
    const imageFile = new File(["fake-image"], "test.xyz", { type: "" });

    const clipboardData = {
      items: [
        {
          type: "image/png", // Clipboard reports image
          getAsFile: () => imageFile,
        },
      ],
    };

    const pasteEvent = new ClipboardEvent("paste", {
      clipboardData: clipboardData as unknown as DataTransfer,
    });

    textarea.dispatchEvent(pasteEvent);

    // Preview should appear initially
    await waitFor(() => {
      expect(screen.getByAltText("Attachment preview")).toBeTruthy();
    });

    // Try to send
    await user.type(textarea, "{Enter}");

    // Image should NOT be sent
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(sendImageSpy).not.toHaveBeenCalled();

    // Attachment should be cleared
    await waitFor(() => {
      expect(screen.queryByAltText("Attachment preview")).toBeNull();
    });
  });
});
