<script lang="ts">
  import { onMount } from "svelte";
  import {
    getSession,
    initSession,
    login,
    logout,
  } from "./lib/stores/session.svelte";
  import {
    getRooms,
    getSelectedRoomId,
    selectRoom,
    refreshRooms,
    subscribeToEvents as subscribeRoomEvents,
  } from "./lib/stores/rooms.svelte";
  import { subscribeToEvents as subscribeMessageEvents } from "./lib/stores/messages.svelte";
  import { subscribeToEvents as subscribeTypingEvents } from "./lib/stores/typing.svelte";
  import { subscribeToEvents as subscribeStreamEvents } from "./lib/stores/streams.svelte";
  import Login from "./Login.svelte";

  onMount(() => {
    initSession();
    subscribeRoomEvents();
    subscribeMessageEvents();
    subscribeTypingEvents();
    subscribeStreamEvents();
  });

  // When session becomes logged_in, fetch rooms
  $effect(() => {
    const s = getSession();
    if (s.status === "logged_in") {
      refreshRooms();
    }
  });
</script>

{#if getSession().status === "checking"}
  <div id="login-view">
    <p class="status">Checking session...</p>
  </div>
{:else if getSession().status === "logged_out" || getSession().status === "error" || getSession().status === "logging_in"}
  <Login
    session={getSession()}
    onLogin={(homeserver, username, password) => login(homeserver, username, password)}
  />
{:else}
  <!-- Logged in — placeholder main view until ner-0f04 / ner-3f09 -->
  <div id="main-view">
    <div id="sidebar">
      <div id="sidebar-header">
        <h2>Nerve</h2>
        <button class="logout-btn" onclick={() => logout()}>Logout</button>
      </div>
      <div id="room-list">
        {#each getRooms() as room (room.id)}
          <button
            class="room-item"
            class:active={getSelectedRoomId() === room.id}
            onclick={() => selectRoom(room.id)}
          >
            <span class="room-name">{room.name}</span>
            {#if room.notification_count > 0}
              <span class="badge">{room.notification_count}</span>
            {/if}
          </button>
        {/each}
      </div>
    </div>
    <div id="chat">
      {#if getSelectedRoomId()}
        <div id="room-content">
          <p class="status">Room selected: {getSelectedRoomId()}</p>
          <p class="status">Message rendering will be ported in ner-f968.</p>
        </div>
      {:else}
        <div id="room-content" class="empty">
          <p class="status">Select a room to start chatting.</p>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  /* Placeholder styles — real layout ported in ner-0f04, ner-f968 */
  #main-view {
    display: flex;
    height: 100%;
  }

  #sidebar {
    width: 260px;
    background: var(--bg-surface);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
  }

  #sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--border);
  }

  #sidebar-header h2 {
    font-size: 1rem;
    font-weight: 700;
    color: var(--accent);
  }

  .logout-btn {
    font-size: 0.65rem;
    padding: 0.25rem 0.5rem;
    background: transparent;
    color: var(--text-muted);
    border: 1px solid var(--border);
    margin-top: 0;
  }

  .logout-btn:hover {
    background: var(--bg-hover);
    color: var(--text);
  }

  #room-list {
    flex: 1;
    overflow-y: auto;
    padding: 0.25rem 0;
  }

  .room-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0.4rem 1rem;
    background: transparent;
    color: var(--text);
    border: none;
    border-radius: 0;
    font-size: 0.8rem;
    font-weight: 400;
    text-align: left;
    cursor: pointer;
    margin-top: 0;
    transition: background var(--transition);
  }

  .room-item:hover {
    background: var(--bg-hover);
  }

  .room-item.active {
    background: var(--accent-dim);
    font-weight: 600;
  }

  .badge {
    background: var(--accent);
    color: #fff;
    font-size: 0.6rem;
    font-weight: 700;
    padding: 0.1rem 0.35rem;
    border-radius: 10px;
    min-width: 1.2em;
    text-align: center;
  }

  #chat {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  #room-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .status {
    color: var(--text-muted);
    font-size: 0.8rem;
  }
</style>
