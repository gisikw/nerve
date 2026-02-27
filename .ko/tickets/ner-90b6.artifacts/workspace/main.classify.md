Looking at this ticket, I need to classify what kind of work it represents.

## Analysis

**Ticket Summary:**
- "Channel sidebar is showing number badge for unreads - should bold for unreads, show numbers only for mentions"
- Notes show a test failure with `npx: command not found`

**Classification:**

The main ticket description is prescriptive: it's describing *what to build* — change the UI behavior from showing number badges for unreads to instead bolding unreads and only showing numbers for mentions. This is a clear feature/UI change request.

The failure note appears to be a separate infrastructure issue (missing npx in the test environment) and doesn't change the nature of the core request.

This is a **task** — it asks for specific code changes to implement a feature (updating the channel sidebar badge display logic).

```json
{"disposition": "route", "workflow": "task"}
```
