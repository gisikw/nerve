Perfect. Now I have a complete picture. Let me analyze the changes:

## Review Summary

### Changes Made

1. **ComposeBar.svelte** - Added textarea height reset logic in two places:
   - In the text message submit path (lines 94-97)
   - In the image attachment send path (lines 118-121)
   - Removed the `tick().then(resizeTextarea)` call

2. **Spec file** - Added a new scenario to `specs/message_compose.feature` (lines 35-39)

3. **No test file created** - There is no corresponding test file for this behavior

### Issues Found

**CRITICAL: Missing Test - This is a BLOCKER**

According to INVARIANTS.md:
- "Every behavior has a spec" ✅ (spec was added)
- "Every spec has a test" ❌ **VIOLATION** (no test file exists)
- "A spec without a corresponding test is an unverified claim"

The spec was added to `specs/message_compose.feature` but there is NO corresponding test. This violates the invariant requirement that "Every spec has a test."

Expected: A test file (e.g., `ui/src/ComposeBar.test.ts` or similar) that:
- Sets up a textarea with expanded height
- Simulates sending a message
- Asserts that the textarea height is reset to "auto" immediately

### Code Quality Analysis

**Implementation (assuming tests existed):**

1. **Correctness** ✅ - The implementation correctly resets `textareaEl.style.height = "auto"` after clearing the compose text, which should collapse the textarea
2. **Completeness** ✅ - Both code paths (text send and image send) are handled
3. **Safety** ✅ - No security issues, properly checks for textareaEl existence
4. **Scope** ✅ - Changes are focused on the ticket's requirement
5. **Invariants** - Let me verify:
   - Uses Svelte 5 runes ✅ (uses `$state` for textareaEl)
   - No hardcoded colors ✅
   - File size under 500 lines ✅ (389 lines)
6. **Fake backend** - N/A (this is UI-only behavior, no backend state changes)

**However**, the removal of `tick().then(resizeTextarea)` is concerning. The original code called `resizeTextarea()` after `tick()`, which would have ensured the DOM updated before resizing. The new code sets height to "auto" immediately after clearing the text. This *should* work, but without a test, we can't verify it actually does.

### The Test Coverage Problem

This is a **hard blocker**. The instructions are explicit:

> "Missing coverage is a blocker, not a nice-to-have."
> "If either is missing, this is a `fail`."

The implementation added a spec scenario but failed to add the required test. Per the invariants and review instructions, this must fail.

```json
{"disposition": "fail", "reason": "Missing test for new spec scenario. INVARIANTS.md requires 'Every spec has a test' - spec added to message_compose.feature (lines 35-39) but no corresponding test file created. Expected: ui/src/ComposeBar.test.ts or similar test that verifies textarea height resets to 'auto' after message submission."}
```
