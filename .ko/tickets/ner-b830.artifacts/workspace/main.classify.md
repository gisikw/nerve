Looking at this ticket:

**Title:** "Use Matrix lowpriority status for determining that a channel is archived, not a local UI setting"

This is a clear request for a **code change**. The ticket specifies:
- What should change: the source of truth for determining if a channel is archived
- What it should use: Matrix lowpriority status (instead of a local UI setting)
- The expected output: modified code that uses the new determination method

This describes *what to build*, not *what's broken*. The test failures in the notes are setup issues from previous runs, not the core issue being addressed.

```json
{"disposition": "route", "workflow": "task"}
```
