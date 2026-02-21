Perfect! I now have all the context I need. The ticket is clear and actionable:

## Analysis

**What needs to be done:**
The browser window currently allows macOS elastic/rubber-band overscroll behavior. Since Nerve is a fixed-layout chat client (not a scrolling document), the root HTML/body should not scroll at all. This requires adding `overscroll-behavior: none` and ensuring `overflow: hidden` on the top-level elements.

**Files to modify:**
- `/home/dev/Projects/nerve/ui/styles/base.css` — This is where the global html/body styles are already defined (lines 30-39). I'll add the overscroll prevention properties here.

**Current state:**
The `base.css` already has a rule for `html, body, #app` that sets height, background, color, and font properties. I need to add:
- `overflow: hidden` — prevents scrolling
- `overscroll-behavior: none` — prevents elastic/bouncy scroll on supporting browsers

**Assumptions:**
- This is a global CSS change, which aligns with the invariant that "Global styles stay in `styles/*.css`"
- The change is semantic and straightforward — adding two CSS properties to prevent unwanted scroll behavior
- No spec/test needed since this is a visual/UX fix, not behavioral logic (the invariants specify behavioral specs live in `specs/*.feature`, but this is purely presentational CSS)
- The fix applies to the document root level, not individual scrollable regions within the app (those should continue to scroll normally)

**No blockers identified:**
- The ticket is self-contained
- The location is clear and already exists
- No architectural decisions needed
- No dependencies on other work

```json
{"disposition": "continue"}
```
