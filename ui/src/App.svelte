<script lang="ts">
  import { onMount } from "svelte";
  import {
    getSession,
    initSession,
    login,
    logout,
  } from "./lib/stores/session.svelte";
  import {
    getSelectedRoomId,
    getSelectedRoom,
    refreshRooms,
    subscribeToEvents as subscribeRoomEvents,
  } from "./lib/stores/rooms.svelte";
  import { subscribeToEvents as subscribeMessageEvents } from "./lib/stores/messages.svelte";
  import { subscribeToEvents as subscribeTypingEvents } from "./lib/stores/typing.svelte";
  import { subscribeToEvents as subscribeStreamEvents } from "./lib/stores/streams.svelte";
  import Login from "./Login.svelte";
  import Sidebar from "./Sidebar.svelte";

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
  <div id="main-view">
    <div id="layout">
      <Sidebar />
      <div id="chat">
        {#if getSelectedRoomId()}
          {@const room = getSelectedRoom()}
          <div id="room-header">
            <div id="room-info">
              <h2>{room?.is_direct ? room.name : `# ${room?.name}`}</h2>
              {#if room?.topic}
                <span id="room-topic">{room.topic}</span>
              {/if}
            </div>
            <div id="room-header-actions">
              <button id="logout-btn" onclick={() => logout()}>Logout</button>
            </div>
          </div>
          <div id="room-content">
            <p class="status">Message rendering will be ported in ner-f968.</p>
          </div>
        {:else}
          <div id="no-room-selected">
            <p>Select a room to start chatting.</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .status {
    color: var(--text-muted);
    font-size: 0.8rem;
  }
</style>
