// Stream panel state. Delivered directly via push events.

import type { StreamState } from "../tauri";
import { onStreamsUpdated } from "../tauri";

// Map of room_id -> streams
let streamsByRoom = $state<Record<string, StreamState[]>>({});

export function getStreams(roomId: string): StreamState[] {
  return streamsByRoom[roomId] ?? [];
}

export function subscribeToEvents(): void {
  onStreamsUpdated?.((payload) => {
    streamsByRoom[payload.room_id] = payload.streams;
  });
}
