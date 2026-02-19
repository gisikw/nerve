<script lang="ts">
  import { onMount } from "svelte";
  import type { Message } from "./lib/tauri";
  import { getMedia } from "./lib/tauri";
  import { renderMarkdown } from "./lib/markdown";

  let { message }: { message: Message } = $props();

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
</script>

{#if message.msg_type === "image"}
  {#if imgLoading}
    <div class="image-container">
      <span class="image-loading">Loading image...</span>
    </div>
  {:else if imgSrc}
    <div class="image-container">
      <img src={imgSrc} alt={message.body} />
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
        title="Play voice message"
        onclick={toggleAudio}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" stroke="none">
          <polygon points="6 3 20 12 6 21 6 3" />
        </svg>
        <span>Voice message</span>
      </button>
    </div>
  {:else}
    <div class="message-body">[audio]</div>
  {/if}
{:else}
  <div class="message-body">{@html renderMarkdown(message.body)}</div>
{/if}
