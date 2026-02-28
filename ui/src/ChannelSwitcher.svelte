<script lang="ts">
  import { onMount, tick } from "svelte";
  import {
    getRooms,
    selectRoom,
    getArchivedRoomIds,
    refreshRooms,
  } from "./lib/stores/rooms.svelte";
  import { createRoom } from "./lib/tauri";
  import { computeDefaultSelection, sortRooms } from "./lib/channel-switcher";

  interface Props {
    onClose: () => void;
  }

  let { onClose }: Props = $props();

  let query = $state("");
  let selectedIndex = $state(0);
  let inputEl: HTMLInputElement | undefined = $state();
  let creating = $state(false);

  // All rooms (including archived), sorted by group and activity, filtered by query
  let filtered = $derived.by(() => {
    const q = query.trim().toLowerCase();
    const all = getRooms();
    const sorted = sortRooms(all, getArchivedRoomIds());
    if (!q) return sorted;
    return sorted.filter((r) => r.name.toLowerCase().includes(q));
  });

  // Show "Create #name" option when query doesn't exactly match any room
  let showCreate = $derived.by(() => {
    const q = query.trim();
    if (!q) return false;
    return !getRooms().some(
      (r) => r.name.toLowerCase() === q.toLowerCase(),
    );
  });

  // Total selectable items: filtered rooms + optional create action
  let totalItems = $derived(filtered.length + (showCreate ? 1 : 0));

  // Reset selection to first item when filtered results change
  // Prefer matching rooms over "create new" option
  $effect(() => {
    selectedIndex = computeDefaultSelection(
      filtered.length,
      selectedIndex,
      totalItems,
    );
  });

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % totalItems;
      scrollSelectedIntoView();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      selectedIndex = (selectedIndex - 1 + totalItems) % totalItems;
      scrollSelectedIntoView();
    } else if (e.key === "Enter") {
      e.preventDefault();
      selectItem(selectedIndex);
    }
  }

  function scrollSelectedIntoView() {
    tick().then(() => {
      const el = document.querySelector(".switcher-item.selected");
      el?.scrollIntoView({ block: "nearest" });
    });
  }

  function selectItem(index: number) {
    if (index < filtered.length) {
      // Select existing room
      selectRoom(filtered[index].id);
      onClose();
    } else if (showCreate) {
      // Create new room
      handleCreate();
    }
  }

  async function handleCreate() {
    const name = query.trim();
    if (!name || creating) return;
    creating = true;
    try {
      const result = await createRoom(name);
      await refreshRooms();
      selectRoom(result.room_id);
      onClose();
    } catch (err) {
      console.error("Failed to create room:", err);
      creating = false;
    }
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  onMount(() => {
    inputEl?.focus();
  });
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div id="switcher-backdrop" onclick={handleBackdropClick} onkeydown={handleKeydown}>
  <div id="switcher-modal">
    <input
      id="switcher-input"
      type="text"
      placeholder="Switch to channel..."
      spellcheck="false"
      bind:value={query}
      bind:this={inputEl}
    />
    <ul id="switcher-results" role="listbox">
      {#each filtered as room, i (room.id)}
        {@const archived = getArchivedRoomIds().has(room.id)}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <li
          role="option"
          aria-selected={selectedIndex === i}
          class="switcher-item"
          class:selected={selectedIndex === i}
          class:unread={room.notification_count > 0 || room.highlight_count > 0}
          onclick={() => selectItem(i)}
          onmouseenter={() => (selectedIndex = i)}
        >
          {room.is_direct ? room.name : `# ${room.name}`}
          {#if archived}
            <span class="switcher-archived">(archived)</span>
          {/if}
        </li>
      {/each}
      {#if showCreate}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <li
          role="option"
          aria-selected={selectedIndex === filtered.length}
          class="switcher-item switcher-create"
          class:selected={selectedIndex === filtered.length}
          onclick={() => handleCreate()}
          onmouseenter={() => (selectedIndex = filtered.length)}
        >
          {#if creating}
            Creating...
          {:else}
            + Create #{query.trim()}
          {/if}
        </li>
      {/if}
      {#if totalItems === 0}
        <li class="switcher-hint">No rooms found</li>
      {/if}
    </ul>
  </div>
</div>
