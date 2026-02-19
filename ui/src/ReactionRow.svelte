<script lang="ts">
  import type { Reaction } from "./lib/tauri";
  import { sendReaction } from "./lib/tauri";
  import { getSelectedRoomId } from "./lib/stores/rooms.svelte";

  let { eventId, reactions }: { eventId: string; reactions: Reaction[] } =
    $props();
</script>

<div class="reactions">
  {#each reactions as reaction}
    <button
      class="reaction-pill"
      class:self={reaction.include_self}
      title="{reaction.emoji} {reaction.count}"
      onclick={() => {
        const roomId = getSelectedRoomId();
        if (roomId) sendReaction(roomId, eventId, reaction.emoji);
      }}
    >
      <span class="reaction-emoji">{reaction.emoji}</span>
      <span class="reaction-count">{reaction.count}</span>
    </button>
  {/each}
</div>
