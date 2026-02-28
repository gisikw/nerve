// Typed wrapper around Tauri IPC and event subscriptions.
// Falls back to the fake backend when running in a browser (no __TAURI__).

import { fakeInvoke } from "../../fake";

// --- Types matching Rust serde output (snake_case) ---

export interface SessionStatus {
  logged_in: boolean;
  user_id: string | null;
}

export interface LoginResult {
  user_id: string;
}

export interface RoomInfo {
  id: string;
  name: string;
  is_direct: boolean;
  notification_count: number;
  highlight_count: number;
  typing_users: string[];
  topic?: string;
  last_activity: number;
  is_low_priority: boolean;
}

export interface Reaction {
  emoji: string;
  count: number;
  include_self: boolean;
}

export interface Message {
  event_id: string;
  sender: string;
  body: string;
  timestamp: number;
  msg_type: string;
  media_url?: string;
  reactions: Reaction[];
}

export interface MessagesResponse {
  messages: Message[];
  end_token: string | null;
}

export interface TypingStatus {
  users: string[];
}

export interface StreamLine {
  text: string;
  channel: string;
}

export interface StreamState {
  stream_id: string;
  name: string;
  buttons: StreamButton[];
  lines: StreamLine[];
  closed: boolean;
}

export interface StreamButton {
  id: string;
  label: string;
}

// --- Invoke ---

const tauriInvoke = window.__TAURI__?.core?.invoke as
  | ((cmd: string, args?: Record<string, unknown>) => Promise<unknown>)
  | undefined;

export const invoke = tauriInvoke ?? fakeInvoke;

// --- Typed commands ---

export function checkSession(): Promise<SessionStatus> {
  return invoke("check_session") as Promise<SessionStatus>;
}

export function login(
  homeserver: string,
  username: string,
  password: string,
): Promise<LoginResult> {
  return invoke("login", { homeserver, username, password }) as Promise<LoginResult>;
}

export function logout(): Promise<void> {
  return invoke("logout") as Promise<void>;
}

export function listRooms(): Promise<RoomInfo[]> {
  return invoke("list_rooms") as Promise<RoomInfo[]>;
}

export function getMessages(
  roomId: string,
  from?: string | null,
): Promise<MessagesResponse> {
  return invoke("get_messages", { roomId, from }) as Promise<MessagesResponse>;
}

export function markRead(roomId: string, eventId: string): Promise<void> {
  return invoke("mark_read", { roomId, eventId }) as Promise<void>;
}

export function sendMessage(roomId: string, body: string): Promise<void> {
  return invoke("send_message", { roomId, body }) as Promise<void>;
}

export function sendReaction(
  roomId: string,
  eventId: string,
  emoji: string,
): Promise<void> {
  return invoke("send_reaction", { roomId, eventId, emoji }) as Promise<void>;
}

export function sendImage(
  roomId: string,
  filename: string,
  data: string,
  mimeType: string,
  caption?: string | null,
): Promise<void> {
  return invoke("send_image", {
    roomId,
    filename,
    data,
    mimeType,
    caption,
  }) as Promise<void>;
}

export function sendVoiceMessage(
  roomId: string,
  filename: string,
  data: string,
  mimeType: string,
  durationMs?: number,
): Promise<void> {
  return invoke("send_voice_message", {
    roomId,
    filename,
    data,
    mimeType,
    durationMs,
  }) as Promise<void>;
}

export function getMedia(mxcUri: string): Promise<string> {
  return invoke("get_media", { mxcUri }) as Promise<string>;
}

export function getTyping(roomId: string): Promise<TypingStatus> {
  return invoke("get_typing", { roomId }) as Promise<TypingStatus>;
}

export function sendTypingNotice(
  roomId: string,
  isTyping: boolean,
): Promise<void> {
  return invoke("send_typing_notice", { roomId, isTyping }) as Promise<void>;
}

export function createRoom(name: string): Promise<{ room_id: string }> {
  return invoke("create_room", { name }) as Promise<{ room_id: string }>;
}

export function getPinnedEvents(roomId: string): Promise<string[]> {
  return invoke("get_pinned_events", { roomId }) as Promise<string[]>;
}

export function pinMessage(roomId: string, eventId: string): Promise<void> {
  return invoke("pin_message", { roomId, eventId }) as Promise<void>;
}

export function unpinMessage(roomId: string, eventId: string): Promise<void> {
  return invoke("unpin_message", { roomId, eventId }) as Promise<void>;
}

export function getStreams(roomId: string): Promise<StreamState[]> {
  return invoke("get_streams", { roomId }) as Promise<StreamState[]>;
}

export function sendStreamAction(
  roomId: string,
  streamId: string,
  buttonId: string,
): Promise<void> {
  return invoke("send_stream_action", {
    roomId,
    streamId,
    buttonId,
  }) as Promise<void>;
}

export function speakText(text: string): Promise<string> {
  return invoke("speak_text", { text }) as Promise<string>;
}

export function setRoomLowPriority(roomId: string, isLowPriority: boolean): Promise<void> {
  return invoke("set_room_low_priority", { roomId, isLowPriority }) as Promise<void>;
}

// --- Event subscriptions ---

type UnlistenFn = () => void;

const tauriListen = window.__TAURI__?.event?.listen as
  | ((
      event: string,
      handler: (e: { payload: unknown }) => void,
    ) => Promise<UnlistenFn>)
  | undefined;

export interface RoomsUpdatedEvent {
  // Signal only — no payload
}

export interface MessagesUpdatedEvent {
  room_id: string;
}

export interface TypingUpdatedEvent {
  room_id: string;
  users: string[];
}

export interface StreamsUpdatedEvent {
  room_id: string;
  streams: StreamState[];
}

export function onRoomsUpdated(
  handler: () => void,
): Promise<UnlistenFn> | undefined {
  return tauriListen?.("rooms-updated", () => handler());
}

export function onMessagesUpdated(
  handler: (payload: MessagesUpdatedEvent) => void,
): Promise<UnlistenFn> | undefined {
  return tauriListen?.("messages-updated", (e) =>
    handler(e.payload as MessagesUpdatedEvent),
  );
}

export function onTypingUpdated(
  handler: (payload: TypingUpdatedEvent) => void,
): Promise<UnlistenFn> | undefined {
  return tauriListen?.("typing-updated", (e) =>
    handler(e.payload as TypingUpdatedEvent),
  );
}

export function onStreamsUpdated(
  handler: (payload: StreamsUpdatedEvent) => void,
): Promise<UnlistenFn> | undefined {
  return tauriListen?.("streams-updated", (e) =>
    handler(e.payload as StreamsUpdatedEvent),
  );
}
