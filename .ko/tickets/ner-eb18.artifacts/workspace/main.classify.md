Looking at this ticket:

**What it describes:** The auto-scroll behavior in the chat pane is broken for multi-line inputs. It works correctly when the input is single-line, but when the input spans multiple lines, the scrolling positioning is wrong and obscures recent messages.

**Key indicators:**
- Asserts a problem exists ("it obscured the most recent content")
- Describes broken behavior in a specific scenario
- Not asking a question or requesting investigation
- Not describing a feature to build or code to refactor

This is clearly unexpected/broken behavior that needs diagnosis. The fix likely involves adjusting the scroll calculation to account for the input's actual height (including multi-line wrapping), but the ticket doesn't prescribe the solution—it reports the problem.

```json
{"disposition": "route", "workflow": "bug"}
```
