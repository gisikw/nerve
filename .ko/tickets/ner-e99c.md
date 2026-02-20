---
id: ner-e99c
status: open
deps: []
links: []
created: 2026-02-20T18:53:55Z
type: task
priority: 2
---
# Channel switcher: 'Create new' appears bold/selected and input has spellcheck enabled

Two issues in the channel switcher (Cmd+K):

1. The "Create new" option at the bottom renders in bold, making it look like it's currently selected/highlighted. Should be normal weight.
2. The search/filter input field has browser spellcheck enabled — red squiggle underlines on room names. Should have `spellcheck="false"`.

**Screenshot:** `notes/attachments/2026-02-20_18-53-45_Screenshot 2026-02-20 at 12.53.02 PM.png`
**Location:** `ChannelSwitcher.svelte`
