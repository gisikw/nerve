// Message state for the currently selected room.

import type { Message } from "../tauri";
import { getMessages, onMessagesUpdated } from "../tauri";
import { getSelectedRoomId } from "./rooms.svelte";

let messages = $state<Message[]>([]);
let endToken = $state<string | null>(null);
let loading = $state(false);

export function getMessageList(): Message[] {
  return messages;
}

export function getEndToken(): string | null {
  return endToken;
}

export function isLoading(): boolean {
  return loading;
}

export async function loadMessages(roomId: string): Promise<void> {
  loading = true;
  try {
    const result = await getMessages(roomId);
    messages = result.messages;
    endToken = result.end_token;
  } catch (err) {
    console.error("Failed to load messages:", err);
  } finally {
    loading = false;
  }
}

export async function loadOlderMessages(roomId: string): Promise<void> {
  if (!endToken || loading) return;
  loading = true;
  try {
    const result = await getMessages(roomId, endToken);
    messages = [...result.messages, ...messages];
    endToken = result.end_token;
  } catch (err) {
    console.error("Failed to load older messages:", err);
  } finally {
    loading = false;
  }
}

export function clearMessages(): void {
  messages = [];
  endToken = null;
}

export function subscribeToEvents(): void {
  onMessagesUpdated?.((payload) => {
    const selectedId = getSelectedRoomId();
    if (payload.room_id === selectedId) {
      loadMessages(selectedId);
    }
  });
}
