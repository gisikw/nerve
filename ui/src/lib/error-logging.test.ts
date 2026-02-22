import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  shouldLogBackgroundError,
  formatPinnedEventsFetchError,
  formatPinnedEventsRefreshError,
  logBackgroundError,
} from "./error-logging";

/**
 * Tests for error logging utilities
 *
 * Spec: specs/message_pinning.feature:128-133
 * "Pinned events fetch failure is logged but not shown to user"
 *
 * These utilities replace the banned .catch(() => {}) pattern with proper
 * error logging for background operations.
 */

describe("Error Logging", () => {
  describe("shouldLogBackgroundError", () => {
    it("returns true for Error object", () => {
      const error = new Error("Something went wrong");
      expect(shouldLogBackgroundError(error)).toBe(true);
    });

    it("returns true for string error", () => {
      expect(shouldLogBackgroundError("Error message")).toBe(true);
    });

    it("returns true for error-like object", () => {
      const error = { message: "Error", code: 500 };
      expect(shouldLogBackgroundError(error)).toBe(true);
    });

    it("returns false for null", () => {
      expect(shouldLogBackgroundError(null)).toBe(false);
    });

    it("returns false for undefined", () => {
      expect(shouldLogBackgroundError(undefined)).toBe(false);
    });
  });

  describe("formatPinnedEventsFetchError", () => {
    it("formats error message with room ID", () => {
      const roomId = "!abc123:matrix.org";
      const result = formatPinnedEventsFetchError(roomId);
      expect(result).toBe("Failed to fetch pinned events for room !abc123:matrix.org:");
    });

    it("includes room ID in message for easy debugging", () => {
      const roomId = "!room:server.com";
      const result = formatPinnedEventsFetchError(roomId);
      expect(result).toContain(roomId);
      expect(result).toContain("pinned events");
    });
  });

  describe("formatPinnedEventsRefreshError", () => {
    it("formats error message with room ID", () => {
      const roomId = "!abc123:matrix.org";
      const result = formatPinnedEventsRefreshError(roomId);
      expect(result).toBe("Failed to refresh pinned events for room !abc123:matrix.org:");
    });

    it("includes room ID in message for easy debugging", () => {
      const roomId = "!room:server.com";
      const result = formatPinnedEventsRefreshError(roomId);
      expect(result).toContain(roomId);
      expect(result).toContain("refresh");
      expect(result).toContain("pinned events");
    });
  });

  describe("logBackgroundError", () => {
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it("logs error to console with proper context", () => {
      const message = "Failed to fetch data:";
      const error = new Error("Network failure");

      logBackgroundError(message, error);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(message, error);
    });

    it("includes error object in console.error call", () => {
      const message = "Failed to refresh:";
      const error = new Error("API timeout");

      logBackgroundError(message, error);

      expect(consoleErrorSpy).toHaveBeenCalledWith(message, error);
    });

    it("does not log when error is null", () => {
      const message = "Failed to fetch:";

      logBackgroundError(message, null);

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it("does not log when error is undefined", () => {
      const message = "Failed to fetch:";

      logBackgroundError(message, undefined);

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it("logs with formatted message from helper functions", () => {
      const roomId = "!room:matrix.org";
      const error = new Error("Network error");
      const message = formatPinnedEventsFetchError(roomId);

      logBackgroundError(message, error);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to fetch pinned events for room !room:matrix.org:",
        error
      );
    });
  });
});
