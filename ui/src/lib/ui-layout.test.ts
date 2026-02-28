import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * Tests for UI layout CSS rules.
 *
 * These tests verify that the CSS for the room header buttons is correctly
 * defined to ensure proper alignment and icon visibility.
 */

describe("room header button styling", () => {
  const layoutCss = readFileSync(
    join(__dirname, "../../styles/layout.css"),
    "utf-8"
  );

  describe("button alignment", () => {
    it("room-header-actions container uses flexbox with center alignment", () => {
      expect(layoutCss).toContain("#room-header-actions");
      expect(layoutCss).toMatch(
        /#room-header-actions\s*\{[^}]*display:\s*flex/
      );
      expect(layoutCss).toMatch(
        /#room-header-actions\s*\{[^}]*align-items:\s*center/
      );
    });

    it("streams-toggle button has fixed height", () => {
      expect(layoutCss).toContain("#streams-toggle");
      expect(layoutCss).toMatch(
        /#streams-toggle\s*\{[^}]*height:\s*1\.75rem/
      );
    });

    it("logout button has matching fixed height", () => {
      expect(layoutCss).toContain("#logout-btn");
      expect(layoutCss).toMatch(
        /#room-header\s+#logout-btn\s*\{[^}]*height:\s*1\.75rem/
      );
    });

    it("streams-toggle has explicit padding reset", () => {
      // Regression test: the button needs explicit padding: 0 to prevent
      // browser default padding from affecting alignment
      expect(layoutCss).toMatch(
        /#streams-toggle\s*\{[^}]*padding:\s*0[^}]*\}/
      );
    });

    it("logout button uses flexbox for icon centering", () => {
      // Regression test: the button needs flexbox centering to vertically
      // align icon content within the fixed height
      expect(layoutCss).toMatch(
        /#room-header\s+#logout-btn\s*\{[^}]*display:\s*flex/
      );
      expect(layoutCss).toMatch(
        /#room-header\s+#logout-btn\s*\{[^}]*align-items:\s*center/
      );
      expect(layoutCss).toMatch(
        /#room-header\s+#logout-btn\s*\{[^}]*justify-content:\s*center/
      );
    });

    it("logout button has matching fixed width", () => {
      expect(layoutCss).toMatch(
        /#room-header\s+#logout-btn\s*\{[^}]*width:\s*1\.75rem/
      );
    });

    it("logout button SVG has display block", () => {
      expect(layoutCss).toContain("#room-header #logout-btn svg");
      expect(layoutCss).toMatch(
        /#room-header\s+#logout-btn\s+svg\s*\{[^}]*display:\s*block/
      );
    });
  });

  describe("streams icon visibility", () => {
    it("streams-toggle uses flexbox for icon centering", () => {
      expect(layoutCss).toMatch(
        /#streams-toggle\s*\{[^}]*display:\s*flex/
      );
      expect(layoutCss).toMatch(
        /#streams-toggle\s*\{[^}]*align-items:\s*center/
      );
      expect(layoutCss).toMatch(
        /#streams-toggle\s*\{[^}]*justify-content:\s*center/
      );
    });

    it("streams-toggle has color property for SVG inheritance", () => {
      // The SVG uses stroke="currentColor" which inherits from this
      expect(layoutCss).toMatch(
        /#streams-toggle\s*\{[^}]*color:\s*var\(--text-muted\)/
      );
    });

    it("streams-toggle SVG has display block to prevent inline spacing issues", () => {
      // Regression test: SVG elements have inline display by default which
      // can cause extra spacing and make the icon appear misaligned
      expect(layoutCss).toContain("#streams-toggle svg");
      expect(layoutCss).toMatch(
        /#streams-toggle svg\s*\{[^}]*display:\s*block/
      );
    });

    it("streams-toggle active state uses accent color", () => {
      expect(layoutCss).toContain("#streams-toggle.active");
      expect(layoutCss).toMatch(
        /#streams-toggle\.active\s*\{[^}]*color:\s*var\(--accent\)/
      );
      expect(layoutCss).toMatch(
        /#streams-toggle\.active\s*\{[^}]*background:\s*var\(--accent-dim\)/
      );
    });

    it("streams-toggle hover state changes color", () => {
      expect(layoutCss).toContain("#streams-toggle:hover");
      expect(layoutCss).toMatch(
        /#streams-toggle:hover\s*\{[^}]*color:\s*var\(--text\)/
      );
    });
  });

  describe("design token usage", () => {
    it("logout button uses design token colors", () => {
      expect(layoutCss).toMatch(
        /#room-header\s+#logout-btn\s*\{[^}]*color:\s*var\(--text-muted\)/
      );
      expect(layoutCss).toMatch(
        /#room-header\s+#logout-btn\s*\{[^}]*border:\s*1px solid var\(--border\)/
      );
    });

    it("logout button hover uses accent color", () => {
      expect(layoutCss).toContain("#room-header #logout-btn:hover");
      expect(layoutCss).toMatch(
        /#room-header\s+#logout-btn:hover\s*\{[^}]*color:\s*var\(--text\)/
      );
      expect(layoutCss).toMatch(
        /#room-header\s+#logout-btn:hover\s*\{[^}]*border-color:\s*var\(--accent\)/
      );
    });

    it("streams-toggle uses design token colors", () => {
      expect(layoutCss).toMatch(
        /#streams-toggle\s*\{[^}]*border:\s*1px solid var\(--border\)/
      );
      expect(layoutCss).toMatch(
        /#streams-toggle\s*\{[^}]*color:\s*var\(--text-muted\)/
      );
    });

    it("streams-toggle uses design token border-radius", () => {
      expect(layoutCss).toMatch(
        /#streams-toggle\s*\{[^}]*border-radius:\s*var\(--radius\)/
      );
    });
  });
});
