<script lang="ts">
  import {
    getRooms,
    getSelectedRoomId,
    selectRoom,
    getArchivedRoomIds,
    toggleArchive,
    getShowArchived,
    toggleShowArchived,
  } from "./lib/stores/rooms.svelte";
  import { getTypingUsers } from "./lib/stores/typing.svelte";

  interface Props {
    onOpenSwitcher?: () => void;
  }

  let { onOpenSwitcher }: Props = $props();

  let activeRooms = $derived(
    getRooms().filter((r) => !getArchivedRoomIds().has(r.id)),
  );
  let archivedRooms = $derived(
    getRooms().filter((r) => getArchivedRoomIds().has(r.id)),
  );

  function handleKeydown(e: KeyboardEvent, action: () => void): void {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
    }
  }
</script>

<aside id="sidebar">
  <div class="sidebar-section-label">Channels</div>
  <ul id="room-list" role="listbox">
    {#each activeRooms as room (room.id)}
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
        {#if hasTyping}
          <span class="typing-badge">...</span>
        {/if}
        <button
          class="room-action-btn"
          title="Archive"
          onclick={(e: MouseEvent) => { e.stopPropagation(); toggleArchive(room.id); }}
        >📥</button>
      </li>
    {/each}
  </ul>

  {#if archivedRooms.length > 0}
    <button
      class="sidebar-section-header"
      onclick={() => toggleShowArchived()}
    >
      <span class="section-toggle">
        {getShowArchived() ? "▼" : "▶"}
      </span>
      <span>Archived ({archivedRooms.length})</span>
    </button>

    {#if getShowArchived()}
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
            {#if hasTyping}
              <span class="typing-badge">...</span>
            {/if}
            <button
              class="room-action-btn"
              title="Unarchive"
              onclick={(e: MouseEvent) => { e.stopPropagation(); toggleArchive(room.id); }}
            >📤</button>
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
