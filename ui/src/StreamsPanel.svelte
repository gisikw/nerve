<script lang="ts">
  import type { StreamState } from "./lib/tauri";
  import { getStreams as fetchStreams, sendStreamAction } from "./lib/tauri";
  import { getStreams } from "./lib/stores/streams.svelte";
  import { getSelectedRoomId } from "./lib/stores/rooms.svelte";
  import {
    logBackgroundError,
    formatStreamsFetchError,
    formatStreamActionError,
  } from "./lib/error-logging";

  // --- Panel state ---
  let panelOpen = $state(false);
  let collapsed = $state<Set<string>>(new Set());

  let selectedRoomId = $derived(getSelectedRoomId());

  let streams = $derived(
    selectedRoomId ? getStreams(selectedRoomId) : [],
  );

  let activeCount = $derived(
    streams.filter((s) => !s.closed).length,
  );

  // Auto-open when active streams appear
  let prevHadActive = $state(false);

  $effect(() => {
    const hasActive = activeCount > 0;
    if (hasActive && !prevHadActive && !panelOpen) {
      panelOpen = true;
    }
    prevHadActive = hasActive;
  });

  // Reset collapsed set on room switch
  $effect(() => {
    const _roomId = selectedRoomId;
    collapsed = new Set();
  });

  // Fetch streams on room switch
  $effect(() => {
    const roomId = selectedRoomId;
    if (!roomId) return;
    fetchStreams(roomId).catch((err) => {
      logBackgroundError(formatStreamsFetchError(roomId), err);
    });
  });

  function toggleCollapsed(streamId: string) {
    const next = new Set(collapsed);
    if (next.has(streamId)) {
      next.delete(streamId);
    } else {
      next.add(streamId);
    }
    collapsed = next;
  }

  function handleAction(streamId: string, buttonId: string) {
    const roomId = selectedRoomId;
    if (roomId) {
      sendStreamAction(roomId, streamId, buttonId).catch((err) => {
        logBackgroundError(
          formatStreamActionError(roomId, streamId, buttonId),
          err,
        );
      });
    }
  }

  export function toggle() {
    panelOpen = !panelOpen;
  }

  export function isOpen() {
    return panelOpen;
  }
</script>

{#if panelOpen}
  <div id="streams-panel">
    <div class="streams-panel-header">
      <span class="streams-panel-title">
        Streams{activeCount > 0 ? ` (${activeCount})` : ""}
      </span>
      <button
        class="streams-panel-close"
        title="Close streams panel"
        onclick={() => { panelOpen = false; }}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>

    {#if streams.length > 0}
      <div class="streams-list">
        {#each streams as stream (stream.stream_id)}
          {@const isCollapsed = collapsed.has(stream.stream_id)}
          <div
            class="stream-accordion"
            class:stream-closed={stream.closed}
            class:stream-active={!stream.closed}
          >
            <div class="stream-header">
              <button
                class="stream-header-toggle"
                onclick={() => toggleCollapsed(stream.stream_id)}
              >
                <svg class="stream-chevron" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  {#if isCollapsed}
                    <polyline points="9 18 15 12 9 6" />
                  {:else}
                    <polyline points="6 9 12 15 18 9" />
                  {/if}
                </svg>
                <span class="stream-name">{stream.name}</span>
                {#if stream.closed}
                  <span class="stream-status">done</span>
                {/if}
              </button>
              {#if stream.buttons.length > 0}
                <span class="stream-buttons">
                  {#each stream.buttons as btn}
                    <button
                      class="stream-action-btn"
                      onclick={() => handleAction(stream.stream_id, btn.id)}
                    >{btn.label}</button>
                  {/each}
                </span>
              {/if}
            </div>

            {#if !isCollapsed}
              <pre class="stream-output">{#each stream.lines as line}<span
                  class="stream-line"
                  class:stderr={line.channel === "stderr"}
                >{line.text}
</span>{/each}</pre>
            {/if}
          </div>
        {/each}
      </div>
    {:else}
      <p class="streams-empty">No active streams.</p>
    {/if}
  </div>
{/if}
