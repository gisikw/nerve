Perfect! I've created the implementation plan at `/home/dev/Projects/nerve/.ko/tickets/ner-bfc5.artifacts/plan.md`.

## Summary

The plan addresses the visual sizing issue for unread count badges and archive buttons in the channel sidebar. Key points:

1. **Unread badge**: Increase from 16px to 20px circles (height, line-height, border-radius adjustment)
2. **Archive button**: Add explicit 20px circular background with flexbox centering for the 14px SVG icon
3. **Verification**: Manual testing in dev mode with various notification counts and hover states

The only open question is whether to use 20px or 22px circles—I recommended starting with 20px as it provides adequate spacing (3px per side around the icon) while being more conservative. This can be bumped to 22px if it still feels cramped during implementation.
