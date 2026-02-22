import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

describe("App Icon", () => {
  const iconPath = join(__dirname, "../../../src-tauri/icons/icon.png");
  const svgPath = join(__dirname, "../../../src-tauri/icons/icon.svg");

  it("icon.png exists", () => {
    expect(existsSync(iconPath)).toBe(true);
  });

  it("icon.svg exists", () => {
    expect(existsSync(svgPath)).toBe(true);
  });

  it("icon.png has correct PNG signature", () => {
    const buffer = readFileSync(iconPath);
    // PNG signature: 89 50 4E 47 0D 0A 1A 0A
    expect(buffer[0]).toBe(0x89);
    expect(buffer[1]).toBe(0x50);
    expect(buffer[2]).toBe(0x4e);
    expect(buffer[3]).toBe(0x47);
  });

  it("icon.png is at least 1024x1024", () => {
    const buffer = readFileSync(iconPath);

    // PNG IHDR chunk is at offset 16 (8 bytes signature + 8 bytes for first chunk header)
    // Width is 4 bytes starting at offset 16
    // Height is 4 bytes starting at offset 20
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);

    expect(width).toBeGreaterThanOrEqual(1024);
    expect(height).toBeGreaterThanOrEqual(1024);
  });

  it("icon.svg contains squircle clip path", () => {
    const svgContent = readFileSync(svgPath, "utf-8");
    expect(svgContent).toContain('clipPath id="squircle"');
    expect(svgContent).toContain("continuous corners");
  });

  it("icon.png file size is reasonable for high-quality 1024x1024 PNG", () => {
    const stats = readFileSync(iconPath);
    const sizeKB = stats.length / 1024;

    // Should be between 50KB (too compressed/low quality) and 500KB (too large)
    expect(sizeKB).toBeGreaterThan(50);
    expect(sizeKB).toBeLessThan(500);
  });

  it("squircle path uses cubic bezier curves for smooth corners", () => {
    const svgContent = readFileSync(svgPath, "utf-8");

    // Extract the squircle path from the clipPath definition
    const clipPathMatch = svgContent.match(
      /<clipPath id="squircle">\s*<path d="([^"]+)"/
    );
    expect(clipPathMatch).not.toBeNull();

    const pathData = clipPathMatch![1];

    // Verify the path uses cubic bezier curves (C command)
    // This ensures smooth continuous corners, not faceted/octagonal ones
    expect(pathData).toMatch(/C\s+[\d.,\s]+/);

    // Verify it's not just using simple L (line) commands with basic arcs
    // A proper squircle needs bezier curves for the corners
    const cCommandCount = (pathData.match(/C\s/g) || []).length;
    expect(cCommandCount).toBeGreaterThan(0);
  });

  it("squircle path creates continuous corners (regression test for octagonal corners)", () => {
    const svgContent = readFileSync(svgPath, "utf-8");

    // This is a regression test for the bug where simple border-radius
    // created octagonal/faceted corners instead of smooth continuous curves

    // The squircle clipPath should exist
    expect(svgContent).toContain('clipPath id="squircle"');

    // The path should use the C (cubic bezier) command for smooth curves
    const clipPathMatch = svgContent.match(
      /<clipPath id="squircle">\s*<path d="([^"]+)"/
    );
    const pathData = clipPathMatch![1];

    // Count the types of path commands
    const hasMoveTo = pathData.includes("M ");
    const hasCubicBezier = pathData.includes("C ");
    const hasLineTo = pathData.includes("L ");

    // A proper continuous curve squircle should have:
    // - A starting point (M)
    // - Cubic bezier curves for the corners (C)
    // - Lines for the straight edges (L)
    expect(hasMoveTo).toBe(true);
    expect(hasCubicBezier).toBe(true);
    expect(hasLineTo).toBe(true);

    // Verify we're not using a simple rectangle with rounded corners
    // (which would show as octagonal when zoomed)
    // Instead, we should have multiple bezier control points
    const bezierSegments = pathData.match(/C\s+[\d.,\s]+?(?=[ML]|Z)/g);
    expect(bezierSegments).not.toBeNull();
    expect(bezierSegments!.length).toBeGreaterThan(2);
  });
});
