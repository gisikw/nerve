Perfect! Now I have a complete understanding of the codebase. Let me analyze the ticket requirements:

## Analysis

The ticket is **actionable** after investigating the codebase. Here's what I found:

**Current State:**
- `MessageList.svelte` (255 lines) handles message display with scroll tracking
- The component already tracks scroll position for auto-scrolling behavior (lines 54-101)
- It knows when the user is "near bottom" (within 100px) vs scrolled up into history
- The `#messages` div (line 228) is the scroll container with `overflow-y: auto`
- CSS tokens are available in `ui/styles/base.css` for consistent styling

**What needs to be done:**
1. Add state to track whether user has scrolled up (not at bottom)
2. Add a floating button element that shows conditionally when scrolled up
3. Position the button in bottom-right of the `#messages` scroll container
4. On click, scroll to bottom and hide the button
5. Update the scroll handler to show/hide the button based on position
6. Add spec scenario to `specs/message_display.feature` for this behavior
7. Style the button using existing CSS tokens

**Files to modify:**
- `ui/src/MessageList.svelte` - add button element, scroll-to-bottom logic, and show/hide state
- `ui/styles/messages.css` - add styles for the floating button
- `specs/message_display.feature` - add spec scenario for scroll-to-bottom button behavior

**Assumptions:**
- "Bottom-right" means positioned absolutely within the `#messages` container
- Button should appear when scrolled up >100px from bottom (matching existing "nearBottom" threshold)
- Button uses existing design tokens (--accent, --bg-surface, etc.) for consistency
- Standard icon (down arrow or similar) for the button
- Test will be added alongside the implementation per INVARIANTS.md

**Constraints respected:**
- MessageList.svelte is currently 255 lines, well under 500-line limit
- Adding this feature won't push it over the limit
- Uses Svelte 5 runes ($state, $derived, $effect)
- No direct window.__TAURI__ calls needed
- Semantic HTML with CSS styling (not canvas/framework abstractions)

This is a straightforward UI enhancement with clear scope - a single conditional button with scroll-to-bottom behavior.

```json
{"disposition": "continue"}
```
