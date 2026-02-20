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
  import MessageList from "./MessageList.svelte";
  import ComposeBar from "./ComposeBar.svelte";
  import StreamsPanel from "./StreamsPanel.svelte";

  let streamsPanelRef: StreamsPanel | undefined = $state();
  let streamsOpen = $state(false);

  function toggleStreams() {
    streamsPanelRef?.toggle();
    streamsOpen = streamsPanelRef?.isOpen() ?? false;
  }

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
              <button
                id="streams-toggle"
                class:active={streamsOpen}
                title="Toggle streams panel"
                onclick={toggleStreams}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="4 17 10 11 4 5" />
                  <line x1="12" y1="19" x2="20" y2="19" />
                  <line x1="12" y1="12" x2="20" y2="12" />
                  <line x1="12" y1="5" x2="20" y2="5" />
                </svg>
              </button>
              <button id="logout-btn" onclick={() => logout()}>Logout</button>
            </div>
          </div>
          <div id="room-content">
            <MessageList />
            <ComposeBar />
          </div>
        {:else}
          <div id="no-room-selected">
            <p>Select a room to start chatting.</p>
          </div>
        {/if}
      </div>
      <StreamsPanel bind:this={streamsPanelRef} />
    </div>
  </div>
{/if}

<style>
  .status {
    color: var(--text-muted);
    font-size: 0.8rem;
  }
</style>
