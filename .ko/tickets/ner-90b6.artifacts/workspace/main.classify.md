Looking at this ticket:

**Title**: "Channel sidebar is showing number badge for unreads - should bold for unreads, show numbers only for mentions"

**Analysis**:
- The ticket describes the current state (number badges for unreads)
- It specifies the desired behavior with clear requirements (bold for unreads, show numbers only for mentions)
- The expected output is a code change to the channel sidebar display logic
- There's no ambiguity about what needs to be fixed or whether it's the right approach

This is clearly describing **what to build** with a specific, well-defined requirement. The fix is straightforward: change the sidebar to use bold styling for unreads instead of number badges, and reserve number badges only for mentions.

```json
{"disposition": "route", "workflow": "task"}
```
