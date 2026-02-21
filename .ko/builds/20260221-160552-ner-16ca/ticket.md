---
id: ner-16ca
status: open
deps: []
links: []
created: 2026-02-20T18:55:50Z
type: task
priority: 2
---
# App icon border-radius creates octagonal shape instead of smooth rounded corners

When zoomed in, the Nerve app icon's rounded corners are visibly faceted/octagonal rather than smooth curves. Compared to the Safari-generated single-page-app icon next to it (which has proper smooth rounding), the Nerve icon corners look like they have insufficient resolution or the border-radius is being applied to a low-res mask.

Likely needs the source icon to be regenerated at higher resolution or with a proper superellipse/squircle mask rather than a simple border-radius.

**Screenshot:** `notes/attachments/2026-02-20_18-55-39_Screenshot 2026-02-20 at 12.54.42 PM.png`
**Location:** App icon assets (Tauri icon config / `src-tauri/icons/`)

## Notes

**2026-02-21 14:53:21 UTC:** ko: reset to open (agent stopped)
