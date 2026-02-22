import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import ComposeBar from "./ComposeBar.svelte";
import * as tauri from "./lib/tauri";
import * as roomsStore from "./lib/stores/rooms.svelte";

/**
 * Tests for ComposeBar component image attachment functionality.
 *
 * Related spec: specs/message_compose.feature
 * Scenarios: Image attachment (paste, drop, remove, filtering)
 *
 * Note: MIME type tests are in ComposeBar.image-mime.test.ts
 * Note: Sending tests are in ComposeBar.image-send.test.ts
 */

describe("ComposeBar image attachments", () => {
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

  describe("paste", () => {
    it("displays image preview when pasting an image", async () => {
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
        const preview = screen.getByAltText("Attachment preview");
        expect(preview).toBeTruthy();
      });
    });

    it("changes placeholder to 'Add a message...' when image is attached", async () => {
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
        expect(textarea.placeholder).toBe("Add a message...");
      });
    });

    it("ignores non-image content", async () => {
      render(ComposeBar);

      const textarea = screen.getByPlaceholderText(
        "Send a message...",
      ) as HTMLTextAreaElement;

      const clipboardData = {
        items: [
          {
            type: "text/plain",
            getAsFile: () => null,
          },
        ],
      };

      const pasteEvent = new ClipboardEvent("paste", {
        clipboardData: clipboardData as unknown as DataTransfer,
      });

      textarea.dispatchEvent(pasteEvent);

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(screen.queryByAltText("Attachment preview")).toBeNull();
    });
  });

  describe("drag and drop", () => {
    it("displays drop overlay when dragging an image file", async () => {
      render(ComposeBar);

      const dragEnterEvent = new DragEvent("dragenter", {
        dataTransfer: {
          types: ["Files"],
        } as unknown as DataTransfer,
      });

      document.dispatchEvent(dragEnterEvent);

      await waitFor(() => {
        const overlay = screen.getByText("Drop image to upload");
        expect(overlay).toBeTruthy();
      });
    });

    it("displays image preview when dropping an image file", async () => {
      render(ComposeBar);

      const imageFile = new File(["fake-image"], "test.png", { type: "image/png" });

      const dropEvent = new DragEvent("drop", {
        dataTransfer: {
          files: [imageFile] as unknown as FileList,
        } as unknown as DataTransfer,
      });

      Object.defineProperty(dropEvent.dataTransfer, "files", {
        value: [imageFile],
        writable: false,
      });

      document.dispatchEvent(dropEvent);

      await waitFor(() => {
        const preview = screen.getByAltText("Attachment preview");
        expect(preview).toBeTruthy();
      });
    });

    it("hides drop overlay after dropping a file", async () => {
      render(ComposeBar);

      const dragEnterEvent = new DragEvent("dragenter", {
        dataTransfer: {
          types: ["Files"],
        } as unknown as DataTransfer,
      });

      document.dispatchEvent(dragEnterEvent);

      await waitFor(() => {
        expect(screen.getByText("Drop image to upload")).toBeTruthy();
      });

      const imageFile = new File(["fake-image"], "test.png", { type: "image/png" });
      const dropEvent = new DragEvent("drop", {
        dataTransfer: {
          files: [imageFile] as unknown as FileList,
        } as unknown as DataTransfer,
      });

      Object.defineProperty(dropEvent.dataTransfer, "files", {
        value: [imageFile],
        writable: false,
      });

      document.dispatchEvent(dropEvent);

      await waitFor(() => {
        expect(screen.queryByText("Drop image to upload")).toBeNull();
      });
    });

    it("ignores non-image files", async () => {
      render(ComposeBar);

      const textFile = new File(["text content"], "test.txt", { type: "text/plain" });

      const dropEvent = new DragEvent("drop", {
        dataTransfer: {
          files: [textFile] as unknown as FileList,
        } as unknown as DataTransfer,
      });

      Object.defineProperty(dropEvent.dataTransfer, "files", {
        value: [textFile],
        writable: false,
      });

      document.dispatchEvent(dropEvent);

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(screen.queryByAltText("Attachment preview")).toBeNull();
    });
  });

  describe("removing attachment", () => {
    it("clears attachment when remove button is clicked", async () => {
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

      const removeButton = screen.getByTitle("Remove attachment");
      await user.click(removeButton);

      await waitFor(() => {
        expect(screen.queryByAltText("Attachment preview")).toBeNull();
      });
    });

    it("reverts placeholder to 'Send a message...' after removing attachment", async () => {
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
        expect(textarea.placeholder).toBe("Add a message...");
      });

      const removeButton = screen.getByTitle("Remove attachment");
      await user.click(removeButton);

      await waitFor(() => {
        expect(textarea.placeholder).toBe("Send a message...");
      });
    });
  });

  describe("single attachment", () => {
    it("replaces first image when second image is attached", async () => {
      render(ComposeBar);

      const textarea = screen.getByPlaceholderText(
        "Send a message...",
      ) as HTMLTextAreaElement;

      const firstImage = new File(["fake-image-1"], "first.png", { type: "image/png" });
      const clipboardData1 = {
        items: [
          {
            type: "image/png",
            getAsFile: () => firstImage,
          },
        ],
      };

      const pasteEvent1 = new ClipboardEvent("paste", {
        clipboardData: clipboardData1 as unknown as DataTransfer,
      });

      textarea.dispatchEvent(pasteEvent1);

      await waitFor(() => {
        const preview = screen.getByAltText("Attachment preview") as HTMLImageElement;
        expect(preview).toBeTruthy();
        expect(preview.src).toBeTruthy();
      });

      const secondImage = new File(["fake-image-2"], "second.png", { type: "image/png" });
      const clipboardData2 = {
        items: [
          {
            type: "image/png",
            getAsFile: () => secondImage,
          },
        ],
      };

      const pasteEvent2 = new ClipboardEvent("paste", {
        clipboardData: clipboardData2 as unknown as DataTransfer,
      });

      textarea.dispatchEvent(pasteEvent2);

      await waitFor(() => {
        const previews = screen.queryAllByAltText("Attachment preview");
        expect(previews).toHaveLength(1);
      });
    });
  });

});
