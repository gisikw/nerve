---
id: ner-736a
status: open
deps: [ner-46cb]
links: []
created: 2026-02-18T05:40:46Z
type: task
priority: 1
---
# Paginated message loading with scroll-back anticipation

## Notes

**2026-02-18 05:41:38 UTC:** This is the big one. Rooms can have thousands of messages. Need backward pagination with MessagesOptions, a scroll sentinel near the top, and render windowing so the DOM doesn't choke. Well-worn pattern: virtual scroll / intersection observer + pagination token. Related to ner-46cb (load chat history).
