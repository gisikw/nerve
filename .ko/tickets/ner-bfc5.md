---
id: ner-bfc5
status: blocked
deps: []
created: 2026-02-27T12:33:06Z
type: task
priority: 2
plan-questions:
  - id: q1
    question: "Should the unread badge and archive button circles be 20px or 22px in diameter?"
    context: "The plan needs to choose between 20px (3px padding per side around the 14px icon) or 22px (4px padding per side). This affects the specific CSS values in tasks 1 and 2."
    options:
      - label: "20px (Recommended)"
        value: 20px
        description: "Provides 3px padding per side, meeting minimum spacing requirements; can be increased later if needed"
      - label: "22px"
        value: 22px
        description: "Provides 4px padding per side for more generous spacing with better visual breathing room"
---
# In channel sidebar, unread count and archive button are too big relative to their surrounding circles - probably expand the circles by a few px radius
