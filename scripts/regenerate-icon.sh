#!/usr/bin/env bash
# Regenerate app icon from SVG source
#
# This script regenerates src-tauri/icons/icon.png from icon.svg at proper
# resolution with anti-aliasing to ensure smooth rounded corners (squircle).
#
# The SVG contains a squircle clip path for macOS-style continuous corners.
# Regenerating at 1024x1024 with rsvg-convert preserves the smooth curves.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SVG_PATH="$PROJECT_ROOT/src-tauri/icons/icon.svg"
PNG_PATH="$PROJECT_ROOT/src-tauri/icons/icon.png"

# Find rsvg-convert in nix store
RSVG_CONVERT=$(find /nix/store -name "rsvg-convert" -type f 2>/dev/null | head -1)

if [ -z "$RSVG_CONVERT" ]; then
  echo "Error: rsvg-convert not found in nix store"
  echo "Make sure librsvg is in your nix shell (it should be via flake.nix)"
  exit 1
fi

if [ ! -f "$SVG_PATH" ]; then
  echo "Error: SVG source not found at $SVG_PATH"
  exit 1
fi

echo "Regenerating icon from SVG..."
echo "  Source: $SVG_PATH"
echo "  Output: $PNG_PATH"
echo "  Tool: $RSVG_CONVERT"

# Render at 1024x1024 with high-quality anti-aliasing
# rsvg-convert automatically applies proper anti-aliasing to bezier curves
"$RSVG_CONVERT" \
  --width=1024 \
  --height=1024 \
  --format=png \
  --output="$PNG_PATH" \
  "$SVG_PATH"

echo "✓ Icon regenerated successfully"
echo ""
echo "Run tests to verify:"
echo "  cd ui && npm test icon.test.ts"
