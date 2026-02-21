<script lang="ts">
  import { onMount, tick } from "svelte";
  import {
    sendMessage,
    sendImage,
    sendVoiceMessage,
    sendTypingNotice,
  } from "./lib/tauri";
  import { getSelectedRoomId } from "./lib/stores/rooms.svelte";
  import { replaceShortcodes } from "./lib/emoji";
  import { computeTextareaHeight } from "./lib/compose";
  import { guessMime, readFileAsBase64 } from "./lib/image-attachment";
  import {
    selectVoiceMimeType,
    getVoiceFileExtension,
    getBaseMimeType,
    blobToBase64,
  } from "./lib/voice-recording";

  // --- Compose state ---
  let composeText = $state("");
  let textareaEl: HTMLTextAreaElement | undefined = $state();

  // --- Drafts (in-memory, keyed by room ID) ---
  let drafts: Record<string, string> = {};
  let prevRoomId = $state<string | null>(null);

  // --- Image attachment ---
  let pendingFile = $state<File | null>(null);
  let pendingPreview = $state<string | null>(null);

  // --- Voice recording ---
  let recording = $state(false);
  let mediaRecorder: MediaRecorder | null = null;
  let recordingChunks: Blob[] = [];
  let recordingStartTime = 0;

  let selectedRoomId = $derived(getSelectedRoomId());

  // --- Draft save/restore on room switch ---
  $effect(() => {
    const roomId = selectedRoomId;
    if (roomId === prevRoomId) return;

    // Save draft for previous room
    if (prevRoomId) {
      const trimmed = composeText.trim();
      if (trimmed) {
        drafts[prevRoomId] = composeText;
      } else {
        delete drafts[prevRoomId];
      }
    }

    // Restore draft for new room
    composeText = roomId ? (drafts[roomId] ?? "") : "";
    clearAttachment();
    prevRoomId = roomId;

    // Focus and resize after switch
    tick().then(() => {
      textareaEl?.focus();
      resizeTextarea();
    });
  });

  // --- Textarea auto-resize ---
  function resizeTextarea() {
    if (!textareaEl) return;
    // Reset to auto first to get accurate scrollHeight
    textareaEl.style.height = "auto";
    // Compute new height and overflow based on content
    const { height, overflowY } = computeTextareaHeight(
      textareaEl.scrollHeight,
      textareaEl.offsetHeight,
      composeText,
    );
    textareaEl.style.height = height;
    textareaEl.style.overflowY = overflowY;
  }

  function handleInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    composeText = replaceShortcodes(target.value);
    resizeTextarea();

    // Typing notice
    const roomId = selectedRoomId;
    if (roomId) {
      sendTypingNotice(roomId, composeText.length > 0).catch(() => {});
    }
  }

  // --- Submit ---
  function handleSubmit(e?: Event) {
    e?.preventDefault();
    const roomId = selectedRoomId;
    if (!roomId) return;

    if (pendingFile) {
      // Image send
      sendImageAttachment(roomId);
    } else {
      // Text send
      const text = composeText.trim();
      if (!text) return;
      composeText = "";
      sendMessage(roomId, text).catch(() => {});
    }

    sendTypingNotice(roomId, false).catch(() => {});
    tick().then(resizeTextarea);
  }

  async function sendImageAttachment(roomId: string) {
    const file = pendingFile;
    if (!file) return;

    const mimeType = file.type || guessMime(file.name);
    if (!mimeType) {
      clearAttachment();
      return;
    }

    const base64 = await readFileAsBase64(file);
    const caption = composeText.trim() || null;

    composeText = "";
    clearAttachment();

    await sendImage(roomId, file.name, base64, mimeType, caption).catch(
      () => {},
    );
  }


  // --- Keyboard: Enter sends, Shift+Enter inserts newline ---
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  // --- Image attachment ---
  function attachImage(file: File) {
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    pendingFile = file;
    pendingPreview = URL.createObjectURL(file);
  }

  function clearAttachment() {
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    pendingFile = null;
    pendingPreview = null;
  }

  function handleImageFiles(files: FileList) {
    for (const file of Array.from(files)) {
      if (file.type.startsWith("image/")) {
        attachImage(file);
        return;
      }
    }
  }

  // --- Paste handler ---
  function handlePaste(e: ClipboardEvent) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) attachImage(file);
        return;
      }
    }
  }

  // --- Drag and drop ---
  let dragCounter = 0;
  let showDropOverlay = $state(false);

  function handleDragEnter(e: DragEvent) {
    if (!e.dataTransfer?.types.includes("Files")) return;
    e.preventDefault();
    dragCounter++;
    showDropOverlay = true;
  }

  function handleDragOver(e: DragEvent) {
    if (!showDropOverlay) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
  }

  function handleDragLeave(e: DragEvent) {
    if (!showDropOverlay) return;
    e.preventDefault();
    if (--dragCounter <= 0) {
      dragCounter = 0;
      showDropOverlay = false;
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    dragCounter = 0;
    showDropOverlay = false;
    if (!selectedRoomId || !e.dataTransfer?.files.length) return;
    handleImageFiles(e.dataTransfer.files);
  }

  // --- Voice recording ---
  async function toggleRecording() {
    if (recording) {
      stopRecording();
    } else {
      await startRecording();
    }
  }

  async function startRecording() {
    if (!selectedRoomId) {
      console.warn("Cannot start recording: no room selected");
      return;
    }
    try {
      console.log("Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = selectVoiceMimeType();
      console.log(`Starting voice recording with MIME type: ${mimeType}`);
      mediaRecorder = new MediaRecorder(stream, { mimeType });
      recordingChunks = [];
      recordingStartTime = Date.now();

      mediaRecorder.addEventListener("dataavailable", (e) => {
        if (e.data.size > 0) {
          recordingChunks.push(e.data);
          console.log(`Received audio chunk: ${e.data.size} bytes`);
        }
      });

      mediaRecorder.addEventListener("stop", async () => {
        const durationMs = Date.now() - recordingStartTime;
        stream.getTracks().forEach((t) => t.stop());
        if (recordingChunks.length === 0) {
          console.warn("Voice recording stopped with no audio data");
          return;
        }

        const blob = new Blob(recordingChunks, { type: mimeType });
        const roomId = selectedRoomId;
        if (!roomId) {
          console.error("Voice recording completed but no room selected");
          return;
        }

        const base64 = await blobToBase64(blob);
        const ext = getVoiceFileExtension(mimeType);

        console.log(`Sending voice message: ${blob.size} bytes, ${durationMs}ms, ${mimeType}`);
        await sendVoiceMessage(
          roomId,
          `voice-message.${ext}`,
          base64,
          getBaseMimeType(mimeType),
          Math.round(durationMs),
        ).catch((err) => {
          console.error("Failed to send voice message:", err);
        });
      });

      mediaRecorder.start();
      recording = true;
      console.log("Voice recording started");
    } catch (err) {
      console.error("Failed to start voice recording:", err);
      recording = false;
    }
  }

  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      console.log("Stopping voice recording...");
      mediaRecorder.stop();
      mediaRecorder = null;
    }
    recording = false;
  }

  // --- Document-level drag/drop listeners ---
  onMount(() => {
    document.addEventListener("dragenter", handleDragEnter);
    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("dragleave", handleDragLeave);
    document.addEventListener("drop", handleDrop);

    return () => {
      document.removeEventListener("dragenter", handleDragEnter);
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("dragleave", handleDragLeave);
      document.removeEventListener("drop", handleDrop);
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      }
    };
  });
</script>

{#if showDropOverlay}
  <div id="drop-overlay">
    <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
    <p>Drop image to upload</p>
  </div>
{/if}

<form
  id="compose"
  data-room-id={selectedRoomId}
  onsubmit={handleSubmit}
>
  {#if pendingPreview}
    <div id="compose-attachment">
      <img src={pendingPreview} alt="Attachment preview" />
      <button
        type="button"
        class="remove-btn"
        title="Remove attachment"
        onclick={clearAttachment}
      >&times;</button>
    </div>
  {/if}

  <textarea
    id="compose-input"
    rows="1"
    placeholder={pendingFile ? "Add a message..." : "Send a message..."}
    bind:value={composeText}
    bind:this={textareaEl}
    oninput={handleInput}
    onkeydown={handleKeydown}
    onpaste={handlePaste}
  ></textarea>

  <button
    type="button"
    class="voice-btn"
    class:recording
    title={recording ? "Stop recording" : "Record voice message"}
    onclick={toggleRecording}
  >
    {#if recording}
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" stroke="none">
        <rect x="6" y="6" width="12" height="12" rx="2" />
      </svg>
    {:else}
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="22" />
      </svg>
    {/if}
  </button>

  <button type="submit" class="send-btn" title="Send message">
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  </button>
</form>
