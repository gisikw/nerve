import { describe, it, expect } from "vitest";
import { guessMime } from "./image-attachment";

/**
 * Tests for image attachment logic.
 *
 * These functions support the compose bar's image attachment feature,
 * handling MIME type detection and file encoding.
 */

describe("guessMime", () => {
  it("detects PNG files", () => {
    expect(guessMime("photo.png")).toBe("image/png");
  });

  it("detects JPG files", () => {
    expect(guessMime("photo.jpg")).toBe("image/jpeg");
  });

  it("detects JPEG files", () => {
    expect(guessMime("photo.jpeg")).toBe("image/jpeg");
  });

  it("detects GIF files", () => {
    expect(guessMime("animation.gif")).toBe("image/gif");
  });

  it("detects WebP files", () => {
    expect(guessMime("modern.webp")).toBe("image/webp");
  });

  it("handles uppercase extensions", () => {
    expect(guessMime("PHOTO.PNG")).toBe("image/png");
  });

  it("handles mixed case extensions", () => {
    expect(guessMime("photo.JpG")).toBe("image/jpeg");
  });

  it("returns empty string for unknown extensions", () => {
    expect(guessMime("document.pdf")).toBe("");
  });

  it("returns empty string for files without extensions", () => {
    expect(guessMime("photo")).toBe("");
  });

  it("uses the last extension for multiple dots", () => {
    expect(guessMime("my.photo.backup.png")).toBe("image/png");
  });

  it("returns empty string for empty filename", () => {
    expect(guessMime("")).toBe("");
  });
});

describe("readFileAsBase64", () => {
  it("reads file and strips data URI prefix", async () => {
    const { readFileAsBase64 } = await import("./image-attachment");

    // Mock File object
    const mockFile = new File(["test content"], "test.png", { type: "image/png" });

    // Mock FileReader
    const originalFileReader = globalThis.FileReader;

    class MockFileReader {
      result: string | null = null;
      onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null = null;
      onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null = null;

      readAsDataURL(_file: Blob) {
        // Simulate successful read with a data URI
        this.result = "data:image/png;base64,dGVzdCBjb250ZW50";
        setTimeout(() => {
          if (this.onload) {
            this.onload.call(this as unknown as FileReader, {} as ProgressEvent<FileReader>);
          }
        }, 0);
      }
    }

    globalThis.FileReader = MockFileReader as unknown as typeof FileReader;

    const result = await readFileAsBase64(mockFile);
    expect(result).toBe("dGVzdCBjb250ZW50");

    // Restore original FileReader
    globalThis.FileReader = originalFileReader;
  });

  it("rejects when FileReader encounters an error", async () => {
    const { readFileAsBase64 } = await import("./image-attachment");

    const mockFile = new File(["test content"], "test.png", { type: "image/png" });

    const originalFileReader = globalThis.FileReader;

    class MockFileReader {
      result: string | null = null;
      onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null = null;
      onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null = null;

      readAsDataURL(_file: Blob) {
        setTimeout(() => {
          if (this.onerror) {
            this.onerror.call(this as unknown as FileReader, new ProgressEvent("error"));
          }
        }, 0);
      }
    }

    globalThis.FileReader = MockFileReader as unknown as typeof FileReader;

    await expect(readFileAsBase64(mockFile)).rejects.toBeInstanceOf(ProgressEvent);

    globalThis.FileReader = originalFileReader;
  });

  it("handles empty base64 data gracefully", async () => {
    const { readFileAsBase64 } = await import("./image-attachment");

    const mockFile = new File([""], "empty.png", { type: "image/png" });

    const originalFileReader = globalThis.FileReader;

    class MockFileReader {
      result: string | null = null;
      onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null = null;
      onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null = null;

      readAsDataURL(_file: Blob) {
        // Empty file results in minimal data URI
        this.result = "data:image/png;base64,";
        setTimeout(() => {
          if (this.onload) {
            this.onload.call(this as unknown as FileReader, {} as ProgressEvent<FileReader>);
          }
        }, 0);
      }
    }

    globalThis.FileReader = MockFileReader as unknown as typeof FileReader;

    const result = await readFileAsBase64(mockFile);
    expect(result).toBe("");

    globalThis.FileReader = originalFileReader;
  });
});
