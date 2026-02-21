import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  selectVoiceMimeType,
  getVoiceFileExtension,
  getBaseMimeType,
  blobToBase64,
} from "./voice-recording";

describe("voice recording MIME type selection", () => {
  beforeEach(() => {
    // Reset MediaRecorder mock between tests
    vi.unstubAllGlobals();
  });

  it("prefers opus codec when supported", () => {
    const mockMediaRecorder = {
      isTypeSupported: (type: string) => type === "audio/webm;codecs=opus",
    };
    vi.stubGlobal("MediaRecorder", mockMediaRecorder);

    const result = selectVoiceMimeType();
    expect(result).toBe("audio/webm;codecs=opus");
  });

  it("falls back to plain webm when opus not supported", () => {
    const mockMediaRecorder = {
      isTypeSupported: (type: string) => false,
    };
    vi.stubGlobal("MediaRecorder", mockMediaRecorder);

    const result = selectVoiceMimeType();
    expect(result).toBe("audio/webm");
  });

  it("falls back to plain webm when MediaRecorder is undefined", () => {
    vi.stubGlobal("MediaRecorder", undefined);

    const result = selectVoiceMimeType();
    expect(result).toBe("audio/webm");
  });
});

describe("voice file extension determination", () => {
  it("returns webm for audio/webm MIME type", () => {
    const result = getVoiceFileExtension("audio/webm");
    expect(result).toBe("webm");
  });

  it("returns webm for audio/webm with codec parameter", () => {
    const result = getVoiceFileExtension("audio/webm;codecs=opus");
    expect(result).toBe("webm");
  });

  it("returns ogg for audio/ogg MIME type", () => {
    const result = getVoiceFileExtension("audio/ogg");
    expect(result).toBe("ogg");
  });

  it("returns ogg for audio/ogg with codec parameter", () => {
    const result = getVoiceFileExtension("audio/ogg;codecs=vorbis");
    expect(result).toBe("ogg");
  });

  it("defaults to ogg for unknown MIME types", () => {
    const result = getVoiceFileExtension("audio/mp3");
    expect(result).toBe("ogg");
  });
});

describe("base MIME type extraction", () => {
  it("extracts base type from MIME with codec", () => {
    const result = getBaseMimeType("audio/webm;codecs=opus");
    expect(result).toBe("audio/webm");
  });

  it("returns unchanged MIME when no parameters", () => {
    const result = getBaseMimeType("audio/webm");
    expect(result).toBe("audio/webm");
  });

  it("handles multiple parameters", () => {
    const result = getBaseMimeType("audio/webm;codecs=opus;profile=high");
    expect(result).toBe("audio/webm");
  });

  it("handles empty string", () => {
    const result = getBaseMimeType("");
    expect(result).toBe("");
  });
});

describe("blob to base64 conversion", () => {
  it("converts blob to base64 string", async () => {
    const testData = "Hello, world!";
    const blob = new Blob([testData], { type: "text/plain" });

    // Mock FileReader
    const originalFileReader = globalThis.FileReader;
    class MockFileReader {
      result: string | null = null;
      onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null = null;
      onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null = null;

      readAsDataURL(_file: Blob) {
        // Simulate successful read with a data URI
        this.result = `data:text/plain;base64,${btoa(testData)}`;
        setTimeout(() => {
          if (this.onload) {
            this.onload.call(this as unknown as FileReader, {} as ProgressEvent<FileReader>);
          }
        }, 0);
      }
    }
    globalThis.FileReader = MockFileReader as unknown as typeof FileReader;

    const result = await blobToBase64(blob);

    // Result should be base64 encoded string without data URI prefix
    expect(result).toBeTruthy();
    expect(result).toMatch(/^[A-Za-z0-9+/=]+$/);

    // Verify by decoding
    const decoded = atob(result);
    expect(decoded).toBe(testData);

    // Restore original FileReader
    globalThis.FileReader = originalFileReader;
  });

  it("converts audio blob to base64", async () => {
    const audioData = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
    const blob = new Blob([audioData], { type: "audio/webm" });

    // Mock FileReader
    const originalFileReader = globalThis.FileReader;
    class MockFileReader {
      result: string | null = null;
      onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null = null;
      onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null = null;

      readAsDataURL(_file: Blob) {
        // Simulate successful read with a data URI for audio
        this.result = "data:audio/webm;base64,/9j/4A==";
        setTimeout(() => {
          if (this.onload) {
            this.onload.call(this as unknown as FileReader, {} as ProgressEvent<FileReader>);
          }
        }, 0);
      }
    }
    globalThis.FileReader = MockFileReader as unknown as typeof FileReader;

    const result = await blobToBase64(blob);

    expect(result).toBeTruthy();
    expect(result).toMatch(/^[A-Za-z0-9+/=]+$/);

    // Restore original FileReader
    globalThis.FileReader = originalFileReader;
  });

  it("handles empty blob", async () => {
    const blob = new Blob([], { type: "audio/webm" });

    // Mock FileReader
    const originalFileReader = globalThis.FileReader;
    class MockFileReader {
      result: string | null = null;
      onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null = null;
      onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null = null;

      readAsDataURL(_file: Blob) {
        // Empty file results in minimal data URI
        this.result = "data:audio/webm;base64,";
        setTimeout(() => {
          if (this.onload) {
            this.onload.call(this as unknown as FileReader, {} as ProgressEvent<FileReader>);
          }
        }, 0);
      }
    }
    globalThis.FileReader = MockFileReader as unknown as typeof FileReader;

    const result = await blobToBase64(blob);

    expect(result).toBe("");

    // Restore original FileReader
    globalThis.FileReader = originalFileReader;
  });

  it("rejects on FileReader error", async () => {
    const blob = new Blob(["test"], { type: "text/plain" });

    // Mock FileReader to simulate error
    const originalFileReader = globalThis.FileReader;
    globalThis.FileReader = class MockFileReader {
      readAsDataURL() {
        setTimeout(() => {
          if (this.onerror) this.onerror(new Error("Read failed"));
        }, 0);
      }
      onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null = null;
      onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null = null;
      result: string | ArrayBuffer | null = null;
    } as unknown as typeof FileReader;

    await expect(blobToBase64(blob)).rejects.toThrow();

    // Restore original FileReader
    globalThis.FileReader = originalFileReader;
  });
});

