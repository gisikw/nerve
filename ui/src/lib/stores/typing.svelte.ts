// Typing indicator state. Delivered directly via push events.

import { onTypingUpdated } from "../tauri";

// Map of room_id -> list of typing user display names
let typingByRoom = $state<Record<string, string[]>>({});

export function getTypingUsers(roomId: string): string[] {
  return typingByRoom[roomId] ?? [];
}

export function subscribeToEvents(): void {
  onTypingUpdated?.((payload) => {
    typingByRoom[payload.room_id] = payload.users;
  });
}
