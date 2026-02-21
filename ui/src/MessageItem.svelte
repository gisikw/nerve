<script lang="ts">
  import type { Message } from "./lib/tauri";
  import { pinMessage, unpinMessage, speakText } from "./lib/tauri";
  import { getSelectedRoomId } from "./lib/stores/rooms.svelte";
  import { ttsEnqueue, ttsUnlockContext } from "../main";
  import MessageBody from "./MessageBody.svelte";
  import ReactionRow from "./ReactionRow.svelte";
  import { formatSender } from "./lib/message-grouping";

  let {
    message,
    isGroupStart,
    isPinned,
    onPinToggle,
  }: {
    message: Message;
    isGroupStart: boolean;
    isPinned: boolean;
    onPinToggle?: () => void;
  } = $props();

  function formatTime(tsMillis: number): string {
    const d = new Date(tsMillis);
    let h = d.getHours();
    const m = d.getMinutes();
    const ampm = h < 12 ? "am" : "pm";
    h = h % 12 || 12;
    return `${h}:${m.toString().padStart(2, "0")} ${ampm}`;
  }

  function handlePin() {
    const roomId = getSelectedRoomId();
    if (!roomId) return;
    const action = isPinned
      ? unpinMessage(roomId, message.event_id)
      : pinMessage(roomId, message.event_id);
    action.then(() => onPinToggle?.());
  }

  function handleSpeak() {
    ttsUnlockContext(); // Must happen synchronously during user gesture
    speakText(message.body).then((audio) => {
      if (audio) {
        ttsEnqueue(audio);
      } else {
        console.error("TTS synthesis returned empty audio for message:", message.event_id);
      }
    }).catch((err) => {
      console.error("TTS synthesis failed:", err);
    });
  }
</script>

<div
  class="message"
  class:group-start={isGroupStart}
  class:notice={message.msg_type === "notice"}
  class:emote={message.msg_type === "emote"}
  class:pinned={isPinned}
>
  {#if isGroupStart}
    <div class="message-header">
      <span class="sender">{formatSender(message.sender)}</span>
      <span class="timestamp">{formatTime(message.timestamp)}</span>
    </div>
  {/if}

  <MessageBody {message} />

  {#if message.reactions.length > 0}
    <ReactionRow eventId={message.event_id} reactions={message.reactions} />
  {/if}

  <div class="message-actions">
    <button
      class="message-action-btn"
      title="Speak"
      onclick={handleSpeak}
    >
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      </svg>
    </button>
    <button
      class="message-action-btn"
      title={isPinned ? "Unpin" : "Pin"}
      onclick={handlePin}
    >
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="17" x2="12" y2="22" />
        <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
      </svg>
    </button>
  </div>
</div>
