Looking at this ticket:

**"Channel sidebar is showing number badge for unreads - should bold for unreads, show numbers only for mentions"**

This describes a specific behavior change to implement:
- Current: number badges for unreads
- Desired: bold text for unreads, numeric badges only for mentions

This is clearly describing **what to build** (a UI behavior change) rather than diagnosing a problem or investigating feasibility. The fix is straightforward: update the sidebar styling/logic to display unread channels in bold and reserve number badges for mentions only.

```json
{"disposition": "route", "workflow": "task"}
```
