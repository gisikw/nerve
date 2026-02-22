<script lang="ts">
  import { onMount, tick } from "svelte";
  import type { Message } from "./lib/tauri";
  import { getPinnedEvents, unpinMessage } from "./lib/tauri";
  import {
    getMessageList,
    isLoading,
    loadMessages,
    loadOlderMessages,
    clearMessages,
  } from "./lib/stores/messages.svelte";
  import { getSelectedRoomId } from "./lib/stores/rooms.svelte";
  import { getTypingUsers } from "./lib/stores/typing.svelte";
  import MessageItem from "./MessageItem.svelte";
  import { shouldShowScrollButton, isNearBottom } from "./lib/scroll";
  import { isGroupStart, formatSender } from "./lib/message-grouping";
  import { typingLabel } from "./lib/typing-ui";
  import { logBackgroundError, formatPinnedEventsFetchError, formatPinnedEventsRefreshError } from "./lib/error-logging";

  // --- Pinned state ---
  let pinnedIds = $state<Set<string>>(new Set());
  let showPinned = $state(false);

  // --- Pagination ---
  let loadingOlder = $state(false);

  // --- Scroll container ref ---
  let messagesEl: HTMLDivElement | undefined = $state();

  // --- Scroll-to-bottom button ---
  let showScrollButton = $state(false);

  // --- Derived ---
  let messages = $derived(getMessageList());
  let loading = $derived(isLoading());
  let selectedRoomId = $derived(getSelectedRoomId());

  let typingUsers = $derived(selectedRoomId ? getTypingUsers(selectedRoomId) : []);

  let pinnedMessages = $derived(
    messages.filter((m) => pinnedIds.has(m.event_id)),
  );

  // --- Room switch: load messages + pinned events ---
  $effect(() => {
    const roomId = selectedRoomId;
    if (!roomId) return;

    // Reset state for new room
    pinnedIds = new Set();
    showPinned = false;
    loadingOlder = false;
    showScrollButton = false;
    clearMessages();

    loadMessages(roomId);
    getPinnedEvents(roomId)
      .then((ids) => { pinnedIds = new Set(ids); })
      .catch((err) => {
        logBackgroundError(formatPinnedEventsFetchError(roomId), err);
      });
  });

  // --- Autoscroll on new messages ---
  let prevLastId = $state<string | null>(null);
  let prevRoomId = $state<string | null>(null);
  let initialLoad = $state(true);

  $effect(() => {
    const roomId = selectedRoomId;
    const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
    const lastId = lastMsg?.event_id ?? null;

    if (roomId !== prevRoomId) {
      // Room switch: mark as initial load, scroll when messages arrive
      prevRoomId = roomId;
      prevLastId = null;
      initialLoad = true;
      return;
    }

    if (lastId && lastId !== prevLastId && messagesEl) {
      if (initialLoad) {
        // First batch of messages for this room: always scroll to bottom
        // Double-RAF after tick ensures layout is fully resolved
        initialLoad = false;
        tick().then(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (messagesEl) {
                messagesEl.scrollTop = messagesEl.scrollHeight;
              }
            });
          });
        });
      } else {
        // Subsequent messages: scroll only if near bottom
        const el = messagesEl;
        if (isNearBottom(el.scrollTop, el.clientHeight, el.scrollHeight)) {
          tick().then(() => {
            if (messagesEl) {
              messagesEl.scrollTop = messagesEl.scrollHeight;
            }
          });
        }
      }
    }
    prevLastId = lastId;
  });

  // --- Autoscroll on typing indicator changes ---
  let prevTypingCount = $state(0);

  $effect(() => {
    const currentTypingCount = typingUsers.length;

    // Only auto-scroll if typing state changed and user is near bottom
    if (currentTypingCount !== prevTypingCount && messagesEl && !initialLoad) {
      if (isNearBottom(messagesEl.scrollTop, messagesEl.clientHeight, messagesEl.scrollHeight)) {
        tick().then(() => {
          if (messagesEl) {
            messagesEl.scrollTop = messagesEl.scrollHeight;
          }
        });
      }
    }

    prevTypingCount = currentTypingCount;
  });

  // --- Scroll handler for pagination and scroll button visibility ---
  function handleScroll() {
    if (!messagesEl || !selectedRoomId) return;

    // Update scroll-to-bottom button visibility
    showScrollButton = shouldShowScrollButton(
      messagesEl.scrollTop,
      messagesEl.clientHeight,
      messagesEl.scrollHeight
    );

    // Load older messages when scrolled near top
    if (messagesEl.scrollTop < 50 && !loadingOlder && !loading) {
      loadOlder();
    }
  }

  async function loadOlder() {
    const roomId = selectedRoomId;
    if (!roomId) return;
    loadingOlder = true;
    const prevHeight = messagesEl?.scrollHeight ?? 0;
    await loadOlderMessages(roomId);
    loadingOlder = false;
    // Restore scroll position after prepending
    await tick();
    if (messagesEl) {
      messagesEl.scrollTop = messagesEl.scrollHeight - prevHeight;
    }
  }

  // --- Pinned bar ---
  function togglePinned() {
    showPinned = !showPinned;
  }

  function refreshPins() {
    const roomId = selectedRoomId;
    if (!roomId) return;
    getPinnedEvents(roomId)
      .then((ids) => { pinnedIds = new Set(ids); })
      .catch((err) => {
        logBackgroundError(formatPinnedEventsRefreshError(roomId), err);
      });
  }

  function handleUnpin(eventId: string) {
    const roomId = selectedRoomId;
    if (!roomId) return;
    unpinMessage(roomId, eventId).then(() => refreshPins());
  }

  // --- Typing indicator ---
  // (typingLabel function is imported from ./lib/typing-ui)

  // --- Scroll to bottom handler ---
  function scrollToBottom() {
    if (!messagesEl) return;
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // --- Keep scroll pinned to bottom when container resizes (e.g. input expands) ---
  onMount(() => {
    let prevHeight = 0;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const el = entry.target as HTMLDivElement;
        const newHeight = entry.contentRect.height;
        if (prevHeight > 0 && newHeight < prevHeight) {
          // Container shrank (compose bar grew) — stay at bottom if near bottom
          if (isNearBottom(el.scrollTop, el.clientHeight, el.scrollHeight)) {
            el.scrollTop = el.scrollHeight;
          }
        }
        prevHeight = newHeight;
      }
    });
    // Observe once messagesEl is available
    $effect(() => {
      if (messagesEl) {
        ro.observe(messagesEl);
        return () => ro.unobserve(messagesEl!);
      }
    });
    return () => ro.disconnect();
  });
</script>

<!-- Pinned bar -->
{#if pinnedIds.size > 0}
  <div id="pinned-bar" class:expanded={showPinned}>
    <button class="pinned-bar-header" onclick={togglePinned}>
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="17" x2="12" y2="22" />
        <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
      </svg>
      <span class="pinned-bar-label">{pinnedIds.size} pinned</span>
      <span class="pinned-bar-toggle">{showPinned ? "Hide" : "Show"}</span>
    </button>

    {#if showPinned}
      <div class="pinned-bar-messages">
        {#each pinnedMessages as msg (msg.event_id)}
          <div class="pinned-message-preview">
            <span class="pinned-preview-sender">{formatSender(msg.sender)}</span>
            <span class="pinned-preview-body">{msg.body.slice(0, 120)}</span>
            <button
              class="pinned-preview-unpin"
              title="Unpin"
              onclick={() => handleUnpin(msg.event_id)}
            >Unpin</button>
          </div>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<!-- Messages area -->
<div id="messages" bind:this={messagesEl} onscroll={handleScroll}>
  {#if loading && messages.length === 0}
    <p class="placeholder">Loading...</p>
  {:else if messages.length === 0}
    <p class="placeholder">No messages yet.</p>
  {:else}
    {#if loadingOlder}
      <p class="loading-older">Loading older messages...</p>
    {/if}
    {#each messages as msg, i (msg.event_id)}
      <MessageItem
        message={msg}
        isGroupStart={isGroupStart(messages, i)}
        isPinned={pinnedIds.has(msg.event_id)}
        onPinToggle={refreshPins}
      />
    {/each}
  {/if}

  {#if showScrollButton}
    <button
      class="scroll-to-bottom"
      onclick={scrollToBottom}
      title="Scroll to bottom"
      aria-label="Scroll to latest messages"
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>
  {/if}
</div>

<!-- Typing indicator -->
{#if typingUsers.length > 0}
  <div id="typing-indicator">
    <span class="typing-dots">...</span>
    <span class="typing-text">{typingLabel(typingUsers)}</span>
  </div>
{/if}
