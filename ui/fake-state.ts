// Fake backend state and logic. Runs server-side in Vite's Node process.
// Both Elm commands (via HTTP) and driver actions (via WebSocket) operate
// on this shared state.
//
// Shapes match the Rust serde output that Elm decoders expect
// (snake_case fields, see src/Decode.elm).

// --- Types ---

interface FakeRoom {
  id: string;
  name: string;
  is_direct: boolean;
  notification_count: number;
}

interface FakeReaction {
  emoji: string;
  count: number;
  include_self: boolean;
}

interface FakeMessage {
  event_id: string;
  sender: string;
  body: string;
  timestamp: number;
  msg_type: string;
  media_url?: string;
  reactions: FakeReaction[];
}

// --- State ---

let nextEventId = 100;

function makeMessage(
  sender: string,
  body: string,
  timestamp: number,
  msgType = "text",
  mediaUrl?: string,
): FakeMessage {
  const msg: FakeMessage = {
    event_id: `$fake-${nextEventId++}`,
    sender,
    body,
    timestamp,
    msg_type: msgType,
    reactions: [],
  };
  if (mediaUrl) {
    msg.media_url = mediaUrl;
  }
  return msg;
}

const BASE_TIME = 1708200000000; // 2024-02-17T16:00:00Z

const initialRooms: FakeRoom[] = [
  { id: "!nerve:example.chat", name: "nerve", is_direct: false, notification_count: 0 },
  { id: "!ops:example.chat", name: "ops", is_direct: false, notification_count: 2 },
  { id: "!exo-dm:example.chat", name: "Exo", is_direct: true, notification_count: 0 },
  { id: "!project-nerve:example.chat", name: "project-nerve", is_direct: false, notification_count: 0 },
];

function initialMessages(): Record<string, FakeMessage[]> {
  return {
    "!nerve:example.chat": [
      makeMessage("@kevin:example.chat", "alright, Elm ports are wired up", BASE_TIME),
      makeMessage("@exo:example.chat", "Nice. The decoder tests all pass — want me to start on sidebar styling?", BASE_TIME + 30000),
      makeMessage("@kevin:example.chat", "yeah go for it. I'm going to look at the compose input next", BASE_TIME + 45000),
      makeMessage("@exo:example.chat", "On it. I'll keep the CSS in the existing stylesheet rather than splitting.", BASE_TIME + 60000),
      makeMessage("@kevin:example.chat", "good call", BASE_TIME + 75000),
    ],
    "!ops:example.chat": [
      makeMessage("@exo:example.chat", "Bridge restarted. Drain took 0.3s.", BASE_TIME + 10000, "notice"),
      makeMessage("@exo:example.chat", "All rooms reconnected.", BASE_TIME + 12000, "notice"),
    ],
    "!exo-dm:example.chat": [
      makeMessage("@kevin:example.chat", "hey, quick thought on the screenshot pipeline", BASE_TIME + 100000),
      makeMessage("@exo:example.chat", "Shoot.", BASE_TIME + 100500),
      makeMessage("@kevin:example.chat", "what if we use the fake backend to set up specific states, then capture?", BASE_TIME + 101000),
      makeMessage("@exo:example.chat", "That's exactly the stage 3 play. Deterministic visual regression. I like it.", BASE_TIME + 102000),
    ],
    "!project-nerve:example.chat": [],
  };
}

export const state = {
  loggedIn: true,
  userId: "@kevin:example.chat" as string | null,
  rooms: [...initialRooms],
  messages: initialMessages(),
};

// --- Elm command handlers ---

export function handleCommand(
  command: string,
  args: Record<string, unknown>,
): unknown {
  switch (command) {
    case "check_session":
      return { logged_in: state.loggedIn, user_id: state.userId };

    case "login": {
      state.loggedIn = true;
      state.userId = `@${args.username}:${args.homeserver || "example.chat"}`;
      return { user_id: state.userId };
    }

    case "logout":
      state.loggedIn = false;
      state.userId = null;
      return null;

    case "list_rooms":
      return state.rooms;

    case "get_messages":
      return state.messages[args.roomId as string] ?? [];

    case "send_message": {
      const roomId = args.roomId as string;
      const body = args.body as string;
      if (!state.messages[roomId]) {
        state.messages[roomId] = [];
      }
      state.messages[roomId].push(
        makeMessage(state.userId ?? "@unknown:local", body, Date.now()),
      );
      return null;
    }

    case "send_reaction": {
      const roomId = args.roomId as string;
      const eventId = args.eventId as string;
      const emoji = args.emoji as string;
      const msgs = state.messages[roomId];
      if (msgs) {
        const msg = msgs.find((m) => m.event_id === eventId);
        if (msg) {
          const existing = msg.reactions.find((r) => r.emoji === emoji);
          if (existing) {
            existing.count++;
            existing.include_self = true;
          } else {
            msg.reactions.push({ emoji, count: 1, include_self: true });
          }
        }
      }
      return null;
    }

    default:
      throw new Error(`Unknown command: ${command}`);
  }
}

// --- Driver actions (from WebSocket or HTTP) ---

export function handleDriverAction(
  action: Record<string, unknown>,
): Record<string, unknown> {
  switch (action.action) {
    case "inject_message": {
      const roomId = action.roomId as string;
      if (!state.messages[roomId]) {
        state.messages[roomId] = [];
      }
      state.messages[roomId].push(
        makeMessage(
          action.sender as string,
          action.body as string,
          (action.timestamp as number) ?? Date.now(),
          (action.msgType as string) ?? "text",
          action.mediaUrl as string | undefined,
        ),
      );
      return { ok: true };
    }

    case "add_room": {
      state.rooms.push({
        id: action.id as string,
        name: action.name as string,
        is_direct: (action.is_direct as boolean) ?? false,
        notification_count: (action.notification_count as number) ?? 0,
      });
      if (!state.messages[action.id as string]) {
        state.messages[action.id as string] = [];
      }
      return { ok: true };
    }

    case "set_notification_count": {
      const room = state.rooms.find((r) => r.id === action.roomId);
      if (room) {
        room.notification_count = action.count as number;
        return { ok: true };
      }
      return { ok: false, error: `Room not found: ${action.roomId}` };
    }

    case "remove_room": {
      const idx = state.rooms.findIndex((r) => r.id === action.roomId);
      if (idx >= 0) {
        state.rooms.splice(idx, 1);
        delete state.messages[action.roomId as string];
        return { ok: true };
      }
      return { ok: false, error: `Room not found: ${action.roomId}` };
    }

    case "clear_messages": {
      const roomId = action.roomId as string;
      if (state.messages[roomId]) {
        state.messages[roomId] = [];
      }
      return { ok: true };
    }

    case "set_session": {
      state.loggedIn = (action.loggedIn as boolean) ?? false;
      state.userId = (action.userId as string) ?? null;
      return { ok: true };
    }

    case "get_state":
      return {
        ok: true,
        state: {
          loggedIn: state.loggedIn,
          userId: state.userId,
          rooms: state.rooms,
          messages: state.messages,
        },
      };

    case "reset":
      state.loggedIn = true;
      state.userId = "@kevin:example.chat";
      state.rooms.splice(0, state.rooms.length, ...initialRooms);
      for (const key of Object.keys(state.messages)) {
        delete state.messages[key];
      }
      Object.assign(state.messages, initialMessages());
      return { ok: true };

    default:
      return { ok: false, error: `Unknown action: ${action.action}` };
  }
}
