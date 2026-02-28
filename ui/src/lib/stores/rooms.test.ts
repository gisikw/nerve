import { describe, it, expect } from "vitest";
import {
  getShowChannels,
  toggleShowChannels,
} from "./rooms.svelte";

describe("channels section visibility", () => {
  describe("getShowChannels", () => {
    it("returns true by default", () => {
      // Channels section should be expanded by default
      expect(getShowChannels()).toBe(true);
    });

    it("returns current visibility state", () => {
      const initial = getShowChannels();
      toggleShowChannels();
      const toggled = getShowChannels();

      expect(toggled).toBe(!initial);
    });
  });

  describe("toggleShowChannels", () => {
    it("toggles from true to false", () => {
      // Ensure we start from true
      const initial = getShowChannels();
      if (!initial) {
        toggleShowChannels(); // Get to true first
      }

      toggleShowChannels();
      expect(getShowChannels()).toBe(false);
    });

    it("toggles from false to true", () => {
      // Ensure we start from false
      const initial = getShowChannels();
      if (initial) {
        toggleShowChannels(); // Get to false first
      }

      toggleShowChannels();
      expect(getShowChannels()).toBe(true);
    });

    it("is idempotent across multiple calls", () => {
      const start = getShowChannels();

      toggleShowChannels();
      toggleShowChannels();

      expect(getShowChannels()).toBe(start);
    });
  });
});
