Excellent! The icon now has beautifully smooth, continuous rounded corners - no more octagonal faceting. The squircle path from the SVG has been properly preserved in the PNG rasterization.

## Summary

I've successfully fixed the app icon's octagonal corner issue. Here's what was changed:

### Root Cause
The original `icon.png` was either generated at insufficient resolution or had a simple border-radius applied after rasterization, causing the rounded corners to appear faceted/octagonal instead of smooth. The SVG source already contained the correct squircle (superellipse) path with continuous corners, but this wasn't being preserved in the PNG conversion.

### Changes Made

1. **Updated flake.nix** (`/home/dev/Projects/nerve/flake.nix`):
   - Added `inkscape` to dev dependencies for future icon generation needs

2. **Regenerated icon.png** (`/home/dev/Projects/nerve/src-tauri/icons/icon.png`):
   - Used `rsvg-convert` (from librsvg already in the dev environment) to regenerate the PNG at 1024x1024 resolution
   - The new PNG properly preserves the smooth squircle corners from the SVG source
   - Applied proper anti-aliasing during conversion to maintain edge quality

3. **Created spec** (`/home/dev/Projects/nerve/specs/app_icon.feature`):
   - Documents the requirement for smooth, continuous rounded corners (squircle path)
   - Specifies that corners must not appear faceted or octagonal
   - Requires quality preservation at high zoom levels
   - Mandates proper resolution (1024x1024 minimum) and anti-aliasing

4. **Created test** (`/home/dev/Projects/nerve/ui/src/lib/icon.test.ts`):
   - Verifies icon.png exists and has valid PNG signature
   - Checks dimensions are at least 1024x1024 by parsing PNG IHDR chunk
   - Validates icon.svg contains the squircle clip path definition
   - Ensures file size is reasonable for high-quality PNG (50-500KB)
   - All 6 tests pass ✓

5. **Created regeneration script** (`/home/dev/Projects/nerve/scripts/regenerate-icon.sh`):
   - Automated script for future icon regeneration
   - Finds `rsvg-convert` from nix store
   - Documents the regeneration process
   - Executable and tested successfully

### Test Results
- All 65 frontend tests pass (including 6 new icon tests)
- Icon now displays with smooth, continuous rounded corners matching macOS/iOS design language
- No visual faceting or octagonal appearance when zoomed

The icon is now production-ready with proper visual quality.
