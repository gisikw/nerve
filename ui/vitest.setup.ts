import "@testing-library/jest-dom/vitest";

// Polyfill ClipboardEvent for jsdom
if (typeof globalThis.ClipboardEvent === "undefined") {
  globalThis.ClipboardEvent = class ClipboardEvent extends Event {
    clipboardData: DataTransfer | null;
    constructor(type: string, init?: ClipboardEventInit) {
      super(type, init);
      this.clipboardData = (init as any)?.clipboardData || null;
    }
  } as any;
}

// Polyfill DragEvent for jsdom
if (typeof globalThis.DragEvent === "undefined") {
  globalThis.DragEvent = class DragEvent extends MouseEvent {
    dataTransfer: DataTransfer | null;
    constructor(type: string, init?: DragEventInit) {
      super(type, init);
      this.dataTransfer = (init as any)?.dataTransfer || null;
    }
  } as any;
}

// Mock URL.createObjectURL and URL.revokeObjectURL for jsdom
if (typeof URL.createObjectURL === "undefined") {
  URL.createObjectURL = (blob: Blob | MediaSource) => {
    return `blob:mock-url-${Math.random().toString(36).slice(2)}`;
  };
}

if (typeof URL.revokeObjectURL === "undefined") {
  URL.revokeObjectURL = (_url: string) => {
    // No-op in test environment
  };
}
