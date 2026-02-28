<script lang="ts">
  import {
    getRooms,
    getSelectedRoomId,
    selectRoom,
    toggleArchive,
    getShowChannels,
    toggleShowChannels,
  } from "./lib/stores/rooms.svelte";
  import { getTypingUsers } from "./lib/stores/typing.svelte";
  import { filterVisibleRooms, formatHighlightBadge } from "./lib/sidebar";

  interface Props {
    onOpenSwitcher?: () => void;
  }

  let { onOpenSwitcher }: Props = $props();

  let showArchived = $state(false);

  function toggleShowArchived(): void {
    showArchived = !showArchived;
  }

  let activeRooms = $derived(
    getRooms().filter((r) => !r.is_low_priority),
  );
  let visibleActiveRooms = $derived(
    filterVisibleRooms(activeRooms, getShowChannels()),
  );
  let archivedRooms = $derived(
    getRooms().filter((r) => r.is_low_priority),
  );

  function handleKeydown(e: KeyboardEvent, action: () => void): void {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
    }
  }
</script>

<aside id="sidebar">
  <button
    class="sidebar-section-header"
    onclick={() => toggleShowChannels()}
  >
    <span class="section-toggle">
      {getShowChannels() ? "▼" : "▶"}
    </span>
    <span>Channels</span>
  </button>
  <ul id="room-list" role="listbox">
    {#each visibleActiveRooms as room (room.id)}
      {@const isSelected = getSelectedRoomId() === room.id}
      {@const typing = getTypingUsers(room.id)}
      {@const hasTyping = typing.length > 0}
      <li
        role="option"
        aria-selected={isSelected}
        class:selected={isSelected}
        class:unread={room.notification_count > 0}
        class:typing={hasTyping}
        onclick={() => selectRoom(room.id)}
        onkeydown={(e) => handleKeydown(e, () => selectRoom(room.id))}
        tabindex="0"
      >
        <span class="room-name-text">
          {room.is_direct ? room.name : `# ${room.name}`}
        </span>
        {#if room.highlight_count > 0}
          <span class="unread-badge">{formatHighlightBadge(room.highlight_count)}</span>
        {/if}
        <button
          class="room-action-btn"
          title="Archive"
          onclick={(e: MouseEvent) => { e.stopPropagation(); toggleArchive(room.id); }}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="21 8 21 21 3 21 3 8" />
            <rect x="1" y="3" width="22" height="5" />
            <line x1="10" y1="12" x2="14" y2="12" />
          </svg>
        </button>
        {#if hasTyping}
          <span class="typing-badge">...</span>
        {/if}
      </li>
    {/each}
  </ul>

  {#if archivedRooms.length > 0}
    <button
      class="sidebar-section-header"
      onclick={() => toggleShowArchived()}
    >
      <span class="section-toggle">
        {showArchived ? "▼" : "▶"}
      </span>
      <span>Archived ({archivedRooms.length})</span>
    </button>

    {#if showArchived}
      <ul class="room-list archived-rooms" role="listbox">
        {#each archivedRooms as room (room.id)}
          {@const isSelected = getSelectedRoomId() === room.id}
          {@const typing = getTypingUsers(room.id)}
          {@const hasTyping = typing.length > 0}
          <li
            role="option"
            aria-selected={isSelected}
            class:selected={isSelected}
            class:unread={room.notification_count > 0}
            class:typing={hasTyping}
            onclick={() => selectRoom(room.id)}
            onkeydown={(e) => handleKeydown(e, () => selectRoom(room.id))}
            tabindex="0"
          >
            <span class="room-name-text">
              {room.is_direct ? room.name : `# ${room.name}`}
            </span>
            {#if room.highlight_count > 0}
              <span class="unread-badge">{formatHighlightBadge(room.highlight_count)}</span>
            {/if}
            <button
              class="room-action-btn"
              title="Unarchive"
              onclick={(e: MouseEvent) => { e.stopPropagation(); toggleArchive(room.id); }}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="17" x2="12" y2="7" />
                <polyline points="8 11 12 7 16 11" />
                <path d="M3 21h18M3 10h18" />
              </svg>
            </button>
            {#if hasTyping}
              <span class="typing-badge">...</span>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
  {/if}

  <div id="sidebar-actions">
    <button
      class="sidebar-action-btn"
      title="Join or create a room (Cmd+K)"
      onclick={() => onOpenSwitcher?.()}
    >+</button>
  </div>
</aside>
