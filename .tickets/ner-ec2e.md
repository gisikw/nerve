---
id: ner-ec2e
status: open
deps: []
links: []
created: 2026-02-18T05:40:46Z
type: task
priority: 3
---
# Fix 404 on media download URL construction

## Notes

**2026-02-18 05:41:38 UTC:** Console 404 on /_matrix/media/v3/download/matrix.gisi.network/... — the mxc_to_http function in messages.rs constructs this URL. Might be an expired or purged media ID, or could be a URL construction bug. Check if the media endpoint is correct for the homeserver version.
