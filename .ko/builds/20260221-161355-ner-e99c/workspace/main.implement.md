Perfect! Now let me provide a summary:

## Summary

I've successfully fixed both issues in the channel switcher (Cmd+K):

### Changes Made

#### 1. Fixed "Create new" option appearing bold (ChannelSwitcher.svelte:158)
- **Before**: `+ Create <strong>#{query.trim()}</strong>`
- **After**: `+ Create #{query.trim()}`
- Removed the `<strong>` tag that was making the room name appear bold/selected when it wasn't actually the selected item

#### 2. Disabled spellcheck on input field (ChannelSwitcher.svelte:123)
- **Before**: Input had no spellcheck attribute (browser default enabled)
- **After**: Added `spellcheck="false"` attribute
- Prevents red squiggle underlines on room names that the browser thinks are misspelled

### Specs Added (specs/channel_switcher.feature)
Added two new scenarios documenting the expected behavior:
1. **"Create new option is not visually bold"** - Specifies that the room name text should be rendered with normal font weight
2. **"Input field has spellcheck disabled"** - Specifies that the browser should not display spellcheck indicators and the input element should have spellcheck set to false

### Tests Added (ui/src/ChannelSwitcher.test.ts)
Created a new test file with markup regression tests that verify:
1. The switcher input has `spellcheck="false"` to prevent false spelling errors
2. The create option does not wrap the room name in `<strong>` tags
3. The create option uses plain text interpolation (the correct pattern)

These are regression tests that check the component source code directly, which is appropriate for static markup bugs like these. The tests will fail if someone accidentally reintroduces the `<strong>` tag or removes the `spellcheck="false"` attribute.

All changes are minimal and focused on fixing exactly what was reported in the ticket. No refactoring, no additional improvements - just the two bug fixes with their corresponding specs and tests.
