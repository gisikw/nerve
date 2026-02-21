<script lang="ts">
  import { onMount } from "svelte";
  import type { Message } from "./lib/tauri";
  import { getMedia } from "./lib/tauri";
  import { renderMarkdown } from "./lib/markdown";
  import { truncateMessage } from "./lib/truncate";

  let { message }: { message: Message } = $props();

  // --- Message truncation for extremely long messages ---
  let isExpanded = $state(false);

  // --- Image resolution ---
  let imgSrc = $state<string | null>(null);
  let imgLoading = $state(false);

  // --- Audio playback ---
  let audioState = $state<"idle" | "loading" | "playing">("idle");
  let audioEl: HTMLAudioElement | null = null;

  // Shared media cache (module-level, survives component lifecycle)
  const mediaCache: Map<string, string> = getMediaCache();

  function getMediaCache(): Map<string, string> {
    // Use a global cache so resolved media persists across re-renders
    const w = window as unknown as { __nerveMediaCache?: Map<string, string> };
    if (!w.__nerveMediaCache) w.__nerveMediaCache = new Map();
    return w.__nerveMediaCache;
  }

  async function resolveMedia(mxcUri: string): Promise<string> {
    const cached = mediaCache.get(mxcUri);
    if (cached) return cached;
    const dataUri = await getMedia(mxcUri);
    mediaCache.set(mxcUri, dataUri);
    return dataUri;
  }

  onMount(() => {
    if (message.msg_type === "image" && message.media_url) {
      imgLoading = true;
      resolveMedia(message.media_url)
        .then((uri) => { imgSrc = uri; })
        .catch(() => { imgSrc = null; })
        .finally(() => { imgLoading = false; });
    }

    return () => {
      // Cleanup audio on unmount
      if (audioEl) {
        audioEl.pause();
        audioEl = null;
      }
    };
  });

  async function toggleAudio() {
    if (!message.media_url) return;

    if (audioState === "playing" && audioEl) {
      audioEl.pause();
      audioEl = null;
      audioState = "idle";
      return;
    }

    audioState = "loading";
    try {
      const dataUri = await resolveMedia(message.media_url);
      audioEl = new Audio(dataUri);
      audioEl.addEventListener("ended", () => { audioState = "idle"; audioEl = null; });
      audioEl.addEventListener("error", () => { audioState = "idle"; audioEl = null; });
      await audioEl.play();
      audioState = "playing";
    } catch {
      audioState = "idle";
      audioEl = null;
    }
  }

  function renderMessageBody(body: string): string {
    const truncation = truncateMessage(body);
    const textToRender = isExpanded ? truncation.fullText : truncation.displayText;
    return renderMarkdown(textToRender);
  }

  function shouldShowExpandButton(body: string): boolean {
    return truncateMessage(body).isTruncated;
  }

  function toggleExpand() {
    isExpanded = !isExpanded;
  }
</script>

{#if message.msg_type === "image"}
  {#if imgLoading}
    <div class="image-container">
      <span class="image-loading">Loading image...</span>
    </div>
  {:else if imgSrc}
    <div class="image-container">
      <img src={imgSrc} alt={message.body} />
      {#if message.body}
        <div class="message-body image-caption">
          {@html renderMessageBody(message.body)}
          {#if shouldShowExpandButton(message.body)}
            <button class="expand-btn" onclick={toggleExpand}>
              {isExpanded ? "Show less" : "Show more"}
            </button>
          {/if}
        </div>
      {/if}
    </div>
  {:else}
    <div class="message-body">{message.body}</div>
  {/if}
{:else if message.msg_type === "audio"}
  {#if message.media_url}
    <div class="audio-container">
      <button
        class="audio-play-btn"
        class:playing={audioState === "playing"}
        class:loading={audioState === "loading"}
        title={audioState === "playing" ? "Stop" : "Play voice message"}
        onclick={toggleAudio}
      >
        {#if audioState === "playing"}
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" stroke="none">
            <rect x="6" y="4" width="12" height="16" rx="2" />
          </svg>
        {:else}
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" stroke="none">
            <polygon points="6 3 20 12 6 21 6 3" />
          </svg>
        {/if}
        <span>Voice message</span>
      </button>
    </div>
  {:else}
    <div class="message-body">[audio]</div>
  {/if}
{:else}
  <div class="message-body">
    {@html renderMessageBody(message.body)}
    {#if shouldShowExpandButton(message.body)}
      <button class="expand-btn" onclick={toggleExpand}>
        {isExpanded ? "Show less" : "Show more"}
      </button>
    {/if}
  </div>
{/if}

<style>
  .expand-btn {
    display: inline-block;
    margin-top: 0.5rem;
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
    color: var(--accent);
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 4px;
    cursor: pointer;
  }

  .expand-btn:hover {
    background: var(--bg-hover);
  }
</style>
