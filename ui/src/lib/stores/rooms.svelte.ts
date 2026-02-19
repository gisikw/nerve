// Room list state. Refreshed on push events and explicit commands.

import type { RoomInfo } from "../tauri";
import { listRooms, onRoomsUpdated, onMessagesUpdated } from "../tauri";

let rooms = $state<RoomInfo[]>([]);
let selectedRoomId = $state<string | null>(null);

export function getRooms(): RoomInfo[] {
  return rooms;
}

export function getSelectedRoomId(): string | null {
  return selectedRoomId;
}

export function getSelectedRoom(): RoomInfo | undefined {
  return rooms.find((r) => r.id === selectedRoomId);
}

export function selectRoom(roomId: string | null): void {
  selectedRoomId = roomId;
}

export async function refreshRooms(): Promise<void> {
  try {
    rooms = await listRooms();
  } catch (err) {
    console.error("Failed to list rooms:", err);
  }
}

// Subscribe to push events from the Rust sync loop.
export function subscribeToEvents(): void {
  onRoomsUpdated?.(() => {
    refreshRooms();
  });

  onMessagesUpdated?.((payload) => {
    // If the message is for a non-active room, refresh rooms to update
    // unread counts. If it's the active room, the messages store handles it.
    if (payload.room_id !== selectedRoomId) {
      refreshRooms();
    }
  });
}
