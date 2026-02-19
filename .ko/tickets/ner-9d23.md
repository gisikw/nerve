---
id: ner-9d23
status: open
deps: []
links: []
created: 2026-02-18T05:40:46Z
type: task
priority: 3
---
# Compose-area image attachment (message + image as one send)

## Reframed Goal

NOT inline rich text compose. The actual need: send a message with an image
attachment in a single action, where the **message is primary** and the image
is supplementary. Like iMessage/Signal/Claude mobile — type your message, attach
an image, send both together.

**Protocol constraint:** The result must be a single Matrix `m.image` event
where the `body` field carries the actual message text. exo-bridge already
handles this — it bundles media + body into a single Claude turn. No protocol
work needed, just compose UX.

## Reference UI

See `notes/attachments/2026-02-19_01-05-12_IMG_2365.png` — Claude mobile app.
Pattern: small thumbnail with X button appears above the textarea. Compose text
stays in the textarea. Send dispatches image+text as one message. X removes the
attachment and you're back to a plain text message.

## Current State

Image upload works via drag-and-drop/paste, but it opens a **caption modal**
that interrupts compose flow. The modal has its own text input for an optional
caption. This is backwards — it treats the image as primary and text as
secondary.

## Implementation Plan

### Elm changes

**Model** — add:
```
pendingImage : Maybe { previewUrl : String, file : () }
```
(The actual `File` object lives in JS; Elm just knows there's a preview to render.)

**Ports** — add:
- `onImageAttached : (String -> msg) -> Sub msg` — JS sends a data: preview URL when
  user pastes/drops an image
- `clearImageAttachment : () -> Cmd msg` — Elm tells JS to discard the pending file
- `sendImageMessage : E.Value -> Cmd msg` — Elm tells JS to send image+text (roomId, body)

**Msg** — add:
- `ImageAttached String` — preview URL received from JS
- `ClearAttachment` — user clicked X on thumbnail

**View (compose bar)** — when `pendingImage` is `Just`:
- Render thumbnail (small, ~60px) with X button above the textarea
- Textarea placeholder could change to "Add a message..." but not required
- Send button sends image+text; compose clears both text and attachment

**Update**:
- `SubmitMessage` — if `pendingImage` is present, fire `sendImageMessage` port
  instead of `Commands.sendMessage`. Clear both `composeText` and `pendingImage`.
- `ImageAttached url` — set `pendingImage`
- `ClearAttachment` — clear `pendingImage`, fire `clearImageAttachment` port

### JS changes

**Replace `showCaptionModal()`** — on paste/drop, instead of opening the modal:
1. Stash the `File` object in a module-level variable (`pendingImageFile`)
2. Generate a preview data: URL via `URL.createObjectURL()`
3. Send the preview URL to Elm via `app.ports.onImageAttached.send(previewUrl)`

**`clearImageAttachment` port** — discard `pendingImageFile`, revoke the object URL

**`sendImageMessage` port** — receives `{ roomId, body }`:
1. Read `pendingImageFile` as base64
2. Call `invoke("send_image", { roomId, filename, data, mimeType, caption: body })`
3. Clear `pendingImageFile`
4. Send `{ tag: "sendImage", payload: null }` back to Elm to trigger message refresh

**Keep the modal as fallback?** Probably not. The compose-area flow strictly
supersedes it. Remove `showCaptionModal()` entirely.

### CSS changes

Add to `compose.css`:
```css
#compose-attachment {
  /* thumbnail strip above textarea */
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.85rem;
  /* sits above the compose form content */
}
#compose-attachment img { ... }
#compose-attachment .remove-btn { ... }
```

### No Rust changes needed

`send_image` already accepts a `caption` param that becomes the `body` of the
`m.image` event. The existing command handles this perfectly.

## Notes

**2026-02-18 05:41:38 UTC:** Original description was about rich text inline
image embedding. Reframed after discussion — the actual need is message-with-
attachment, not inline images within paragraphs.

**2026-02-19 00:55:00 UTC:** Discussed with Kevin. Core insight: "the message
isn't a caption, the photo is an addendum to the message." Protocol-compatible
with exo-bridge since m.image body is already bundled into Claude turns.
Reference screenshot captured. Priority bumped to P3 — this is the last item
in the nerve backlog and the UX gap is real.
