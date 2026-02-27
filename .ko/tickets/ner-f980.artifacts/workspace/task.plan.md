Perfect! I've written the implementation plan to `/home/dev/Projects/nerve/.ko/tickets/ner-f980.artifacts/plan.md`. 

The plan outlines a straightforward approach:
1. Add an `unread` class binding to the switcher items in ChannelSwitcher.svelte based on notification_count or highlight_count
2. Add CSS styling with `font-weight: 600` to match the existing sidebar pattern
3. Document the behavior in the feature spec

This follows the existing pattern in the codebase where the sidebar already bolds unread rooms using the same approach.
