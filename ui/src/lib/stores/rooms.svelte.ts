// Room list state. Refreshed on push events and explicit commands.

import type { RoomInfo } from "../tauri";
import { listRooms, onRoomsUpdated, onMessagesUpdated, setRoomLowPriority } from "../tauri";

let rooms = $state<RoomInfo[]>([]);
let selectedRoomId = $state<string | null>(null);

let showChannels = $state(true);

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

export function resetRooms(): void {
  rooms = [];
  selectedRoomId = null;
}

export async function toggleArchive(roomId: string): Promise<void> {
  const room = rooms.find((r) => r.id === roomId);
  if (!room) return;
  try {
    await setRoomLowPriority(roomId, !room.is_low_priority);
    await refreshRooms();
  } catch (err) {
    console.error("Failed to toggle archive for room", roomId, err);
  }
}

export function getShowChannels(): boolean {
  return showChannels;
}

export function toggleShowChannels(): void {
  showChannels = !showChannels;
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
