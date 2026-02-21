Perfect! No TypeScript errors in my modified files. Let me now create a summary document showing what was changed:

## Summary

I've successfully implemented auto-scroll to bottom when the user is near the bottom of the chat. The implementation addresses the issue where the typing indicator was visible but the chat didn't scroll fully to the bottom.

### Changes Made

#### 1. **`ui/src/lib/scroll.ts`** - Added consistent threshold logic
   - Introduced `NEAR_BOTTOM_THRESHOLD` constant (200px) for consistent behavior
   - Added new `isNearBottom()` function to determine if user is within 200px of bottom
   - Refactored `shouldShowScrollButton()` to use `isNearBottom()` for consistency
   - This ensures the same threshold is used for auto-scroll and button visibility

#### 2. **`ui/src/MessageList.svelte`** - Updated scroll behavior
   - Line 15: Imported `isNearBottom` alongside `shouldShowScrollButton`
   - Line 94: Changed auto-scroll logic for new messages from hardcoded 100px check to use `isNearBottom()` (200px threshold)
   - Line 106-123: Added new effect to auto-scroll when typing indicators appear/disappear if user is near bottom
   - Line 197: Updated ResizeObserver to use `isNearBottom()` instead of hardcoded 100px check
   
   This ensures consistent 200px threshold across all scenarios:
   - New messages arriving
   - Typing indicators changing
   - Container resizing (when compose bar grows/shrinks)

#### 3. **`specs/message_display.feature`** - Updated specifications
   - Lines 39-47: Updated existing scenarios to specify "within 200 pixels" instead of vague "at the bottom"
   - Lines 44-47: Made scroll preservation specify "more than 200 pixels from the bottom"
   - Lines 49-56: Added new scenarios for typing indicator auto-scroll behavior

#### 4. **`ui/src/lib/scroll.test.ts`** - Added comprehensive tests
   - Added 9 new test cases for `isNearBottom()` function
   - Tests cover: at bottom, within threshold, beyond threshold, edge cases, short content, and large containers
   - All 16 tests pass (7 original for `shouldShowScrollButton`, 9 new for `isNearBottom`)

### Behavior Changes

**Before:**
- Auto-scroll triggered only when within 100px of bottom
- Typing indicators appearing didn't trigger scroll
- Inconsistent thresholds (100px for scroll, 200px for button)

**After:**
- Auto-scroll triggers when within 200px of bottom (consistent threshold)
- Typing indicators appearing/disappearing trigger scroll if near bottom
- User must scroll up more than 200px to "break" auto-scroll behavior
- All scroll-related logic uses the same threshold

### Specs and Tests

✅ **Specs added/updated:** `specs/message_display.feature` now includes 4 scenarios covering auto-scroll behavior (2 updated, 2 new)
✅ **Tests added:** 9 new unit tests in `ui/src/lib/scroll.test.ts` for the `isNearBottom` function
✅ **All tests pass:** 86/86 tests passing in the UI test suite

The implementation follows all INVARIANTS.md requirements:
- Uses Svelte 5 runes (`$state`, `$effect`, `$derived`)
- Pure decision logic extracted into testable functions
- No new dependencies
- Minimal changes focused on the ticket requirements
- Comprehensive specs and tests provided
