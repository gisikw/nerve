Vitest will discover `.test.ts` files automatically. The only tests are the two I found: `markdown.test.ts` and `compose.test.ts`. Neither should be affected by sidebar element ordering.

## Summary

This ticket is **fully actionable**. Here's what I found:

**Current implementation** (`Sidebar.svelte` lines 51-61 and 93-103):
- Room name text (flex: 1)
- Typing badge (`...`) if active
- Archive button (📥/📤)

**Required change:**
Swap the order of the typing badge and archive button so the layout becomes:
- Room name text (flex: 1)
- Archive button (📥/📤)  
- Typing badge (`...`) if active - **now rightmost**

**Files to modify:**
- `/home/dev/Projects/nerve/ui/src/Sidebar.svelte` - lines 54-61 (active rooms) and 96-103 (archived rooms)

**No CSS changes required:**
- Both elements have `flex-shrink: 0` and are positioned via flexbox order
- The `gap: 0.25rem` will maintain spacing regardless of order
- Archive button has hover-based opacity transitions that won't be affected

**No test updates required:**
- Specs check for presence of typing badge, not positioning
- No existing tests validate element order in the sidebar
- Change is purely visual/UX

**Assumptions:**
- This is a pure DOM reordering - no logic changes needed
- Both active and archived room lists should get the same treatment (they currently have identical structure)
- The visual hierarchy goal is to make activity (typing) more prominent than actions (archive)

```json
{"disposition": "continue"}
```
