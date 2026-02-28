# Diagnosis: Chat scroll position drifts upward on each keypress when compose bar is multi-line

## Symptoms

When the user has typed enough text to make the compose bar span multiple lines, each subsequent keypress causes the chat message list to scroll slightly upward, gradually hiding the most recent messages. The scroll target would be correct if the input were a single line — the bug scales with the number of extra lines in the compose bar.

## Root Cause

The bug is a scroll-position corruption caused by an intermediate DOM mutation in `resizeTextarea()` in `ComposeBar.svelte`.

`resizeTextarea()` uses the standard "reset-then-measure" pattern to get the textarea's natural content height:

```js
textareaEl.style.height = "auto";           // step 1: collapse to single-line
const scrollH = textareaEl.scrollHeight;    // step 2: read natural content height (forces layout)
textareaEl.style.height = `${scrollH}px`;  // step 3: set final height
```

**Step 1 temporarily collapses a multi-line textarea back to one row.** Because `#messages` and `#compose` are siblings in a `flex-column` container (`#room-content`), when the compose bar shrinks, the browser redistributes the freed space to `#messages`, causing it to grow temporarily.

**The browser auto-clamps `scrollTop` when a scroll container grows.** The invariant `scrollTop ≤ scrollHeight − clientHeight` must hold. If the user was pinned at the bottom (`scrollTop = scrollHeight − clientHeight_old`), and `clientHeight` grows during the intermediate state, the browser reduces `scrollTop` to satisfy the new constraint:

```
new_max_scrollTop = scrollHeight − clientHeight_enlarged
                  = (scrollHeight − clientHeight_old) − delta
                  = old_scrollTop − delta
```

where `delta` = height of compose bar's extra lines beyond one row (≈20 px per extra line).

**Step 3 restores the compose bar to its final height.** `#messages` shrinks back. `scrollTop` is not adjusted upward by the browser on shrink (no constraint violation), so it stays at the clamped-down value.

**The `ResizeObserver` in `MessageList.svelte` does not fire.** When the textarea height does not change across the keystroke (the user typed a character that did not cause a new line wrap), the net change to `#messages.clientHeight` is zero. The ResizeObserver is not triggered for zero-delta observations, so the corrupted `scrollTop` is never corrected.

The result: the user drifts upward by ~`delta` pixels per keystroke. With a 2-line compose bar, this is ≈20 px per key; with 3 lines, ≈40 px, etc. Single-line compose bars are unaffected because `height = "auto"` on a single-row textarea is already the minimum — no intermediate shrink occurs, no scroll clamp, no drift.

## Affected Code

| File | Location | Role |
|------|----------|------|
| `ui/src/ComposeBar.svelte` | `resizeTextarea()`, lines 69–81 | Sets `height = "auto"` as the intermediate step that triggers the layout cascade |
| `ui/src/lib/compose.ts` | `computeTextareaHeight()`, lines 9–21 | Reads `scrollHeight` after the "auto" reset — the forced layout reflow that fixes the intermediate state into the DOM |
| `ui/src/MessageList.svelte` | `onMount` ResizeObserver, lines 193–216 | Corrects scroll on compose-bar growth, but does not fire when there is no net height change |

The browser scroll-clamp is standard spec behaviour and is not a bug in itself.

## Recommended Fix

**Option A — preferred: eliminate the intermediate layout in `resizeTextarea()`.**

The `height = "auto"` step is needed so that `scrollHeight` reflects the natural content height rather than the current explicitly set height. The side-effect can be avoided by doing the measurement on a hidden off-screen clone of the textarea rather than the live element, or by using a non-reflow measurement (e.g. counting rendered line boxes via `getClientRects` on a range, or mirroring the textarea content in a hidden `<div>`).

A simpler workaround within the same function: track the `scrollTop` of `#messages` before and after the resize and restore it if the user was at (or near) the bottom. This requires `ComposeBar` to either receive the messages element as a prop/context, or emit a custom event that `MessageList` listens to.

**Option B — fix in `MessageList.svelte`'s ResizeObserver.**

When the container *grows* (compose bar collapsed to single-line), record whether the user was near the bottom. When the container subsequently *shrinks* (or when the net result is no change), scroll to bottom if the flag was set.

```js
let prevHeight = 0;
let wasNearBottom = false;

const ro = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const el = entry.target as HTMLDivElement;
    const newHeight = entry.contentRect.height;
    if (prevHeight > 0) {
      if (newHeight > prevHeight) {
        // Intermediate grow (compose bar collapsed to "auto")
        wasNearBottom = isNearBottom(el.scrollTop, el.clientHeight, el.scrollHeight);
      } else if (newHeight < prevHeight) {
        if (wasNearBottom || isNearBottom(el.scrollTop, el.clientHeight, el.scrollHeight)) {
          el.scrollTop = el.scrollHeight;
        }
        wasNearBottom = false;
      }
    }
    prevHeight = newHeight;
  }
});
```

Note: this only corrects the scroll when the ResizeObserver fires at all (i.e. when there *is* a net height change). For the pure "no line wrap" case where the net change is zero and the observer does not fire, a complementary fix in `ComposeBar` is still required (Option A).

The most complete fix combines both: remove the intermediate layout in `resizeTextarea()` (Option A) so the ResizeObserver is never tricked, and keep the grow/shrink tracking in the observer as a belt-and-suspenders guard.

## Risk Assessment

- **Option A (clone/non-reflow measurement):** Moderate risk. Requires replacing well-understood "reset to auto" idiom. Must verify that the clone faithfully replicates textarea computed styles (font, padding, line-height, max-width). Edge cases: attachment preview row above the textarea affects form height.
- **Option A (pass messagesEl or emit event):** Low-moderate risk. Adds a small cross-component coupling. Must be careful not to scroll the user when they have intentionally scrolled away from the bottom.
- **Option B (ResizeObserver grow tracking):** Low risk in isolation, but only partially effective. Does not help when there is no net height change and the observer does not fire.
- **Combined fix:** Best overall correctness. The ResizeObserver change is self-contained and defensive; the `resizeTextarea` change eliminates the root cause.

## Summary

`resizeTextarea()` in `ComposeBar.svelte` temporarily sets the textarea's height to `"auto"` to measure its natural content height. This transiently collapses a multi-line compose bar to a single row, causing `#messages` (its flex sibling) to grow. The browser clamps the messages scroll position downward to maintain scroll bounds. When the compose bar is restored to its real multi-line height, `#messages` shrinks back, but `scrollTop` is left at the clamped-low value. Because there is no net change to `#messages` height (on non-wrapping keypresses), the `ResizeObserver` does not fire to correct the position. Each keypress in a multi-line compose bar drifts the scroll upward by roughly one line height per extra compose row, progressively hiding the most recent messages.
