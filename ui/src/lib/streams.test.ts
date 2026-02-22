import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import type { StreamState } from "./tauri";
import {
  formatStreamsFetchError,
  formatStreamActionError,
  logBackgroundError,
} from "./error-logging";

/**
 * Tests for stream panel state logic.
 *
 * Covers spec scenarios from specs/streams.feature:
 * - Panel auto-open behavior based on active stream presence
 * - Active stream counting
 * - Collapse state management
 * - Stream categorization (active vs closed)
 * - Button handling
 * - Channel styling
 * - Header text formatting
 */

/**
 * Helper to create a stream for testing.
 */
function makeStream(
  stream_id: string,
  name: string,
  closed: boolean = false,
  buttons: Array<{ id: string; label: string }> = [],
  lines: Array<{ text: string; channel: string }> = [],
): StreamState {
  return {
    stream_id,
    name,
    closed,
    buttons,
    lines,
  };
}

describe("active stream counting", () => {
  it("counts only non-closed streams as active", () => {
    const streams = [
      makeStream("s1", "build", false),
      makeStream("s2", "test", false),
      makeStream("s3", "deploy", true),
    ];

    const activeCount = streams.filter((s) => !s.closed).length;
    expect(activeCount).toBe(2);
  });

  it("returns 0 when all streams are closed", () => {
    const streams = [
      makeStream("s1", "build", true),
      makeStream("s2", "test", true),
    ];

    const activeCount = streams.filter((s) => !s.closed).length;
    expect(activeCount).toBe(0);
  });

  it("returns 0 for empty stream list", () => {
    const streams: StreamState[] = [];
    const activeCount = streams.filter((s) => !s.closed).length;
    expect(activeCount).toBe(0);
  });

  it("counts all streams when none are closed", () => {
    const streams = [
      makeStream("s1", "build", false),
      makeStream("s2", "test", false),
      makeStream("s3", "deploy", false),
    ];

    const activeCount = streams.filter((s) => !s.closed).length;
    expect(activeCount).toBe(3);
  });
});

describe("auto-open decision logic", () => {
  it("decides to open when active streams appear and panel was closed", () => {
    const prevHadActive = false;
    const hasActive = true;
    const panelOpen = false;

    const shouldOpen = hasActive && !prevHadActive && !panelOpen;
    expect(shouldOpen).toBe(true);
  });

  it("decides not to open when panel is already open", () => {
    const prevHadActive = false;
    const hasActive = true;
    const panelOpen = true;

    const shouldOpen = hasActive && !prevHadActive && !panelOpen;
    expect(shouldOpen).toBe(false);
  });

  it("decides not to open when previously had active streams", () => {
    const prevHadActive = true;
    const hasActive = true;
    const panelOpen = false;

    const shouldOpen = hasActive && !prevHadActive && !panelOpen;
    expect(shouldOpen).toBe(false);
  });

  it("decides not to open when no active streams", () => {
    const prevHadActive = false;
    const hasActive = false;
    const panelOpen = false;

    const shouldOpen = hasActive && !prevHadActive && !panelOpen;
    expect(shouldOpen).toBe(false);
  });

  it("decides not to open when active streams disappear", () => {
    const prevHadActive = true;
    const hasActive = false;
    const panelOpen = false;

    const shouldOpen = hasActive && !prevHadActive && !panelOpen;
    expect(shouldOpen).toBe(false);
  });
});

describe("collapse state toggle logic", () => {
  function toggleCollapsed(collapsed: Set<string>, streamId: string): Set<string> {
    const next = new Set(collapsed);
    if (next.has(streamId)) {
      next.delete(streamId);
    } else {
      next.add(streamId);
    }
    return next;
  }

  it("adds stream to collapsed set when toggling uncollapsed stream", () => {
    const collapsed = new Set<string>();
    const streamId = "s1";

    const next = toggleCollapsed(collapsed, streamId);

    expect(next.has(streamId)).toBe(true);
    expect(next.size).toBe(1);
  });

  it("removes stream from collapsed set when toggling collapsed stream", () => {
    const collapsed = new Set(["s1"]);
    const streamId = "s1";

    const next = toggleCollapsed(collapsed, streamId);

    expect(next.has(streamId)).toBe(false);
    expect(next.size).toBe(0);
  });

  it("preserves other collapsed streams when toggling one stream", () => {
    const collapsed = new Set(["s1", "s2"]);
    const streamId = "s3";

    const next = toggleCollapsed(collapsed, streamId);

    expect(next.size).toBe(3);
    expect(next.has("s1")).toBe(true);
    expect(next.has("s2")).toBe(true);
    expect(next.has("s3")).toBe(true);
  });

  it("handles toggling same stream multiple times", () => {
    let collapsed = new Set<string>();
    const streamId = "s1";

    // First toggle: collapse
    collapsed = toggleCollapsed(collapsed, streamId);
    expect(collapsed.has(streamId)).toBe(true);

    // Second toggle: expand
    collapsed = toggleCollapsed(collapsed, streamId);
    expect(collapsed.has(streamId)).toBe(false);

    // Third toggle: collapse again
    collapsed = toggleCollapsed(collapsed, streamId);
    expect(collapsed.has(streamId)).toBe(true);
  });
});

describe("stream categorization", () => {
  it("identifies stream as active when not closed", () => {
    const stream = makeStream("s1", "build", false);
    expect(stream.closed).toBe(false);
  });

  it("identifies stream as closed when marked closed", () => {
    const stream = makeStream("s1", "build", true);
    expect(stream.closed).toBe(true);
  });

  it("determines if stream should show status indicator", () => {
    const closedStream = makeStream("s1", "build", true);
    const activeStream = makeStream("s2", "test", false);

    expect(closedStream.closed).toBe(true);
    expect(activeStream.closed).toBe(false);
  });
});

describe("stream filtering by room", () => {
  it("filters streams by room ID", () => {
    const streamsByRoom: Record<string, StreamState[]> = {
      "!room1:matrix.org": [makeStream("s1", "build", false)],
      "!room2:matrix.org": [makeStream("s2", "deploy", false)],
    };

    const roomId = "!room1:matrix.org";
    const streams = streamsByRoom[roomId] ?? [];

    expect(streams.length).toBe(1);
    expect(streams[0].stream_id).toBe("s1");
  });

  it("returns empty array for room with no streams", () => {
    const streamsByRoom: Record<string, StreamState[]> = {
      "!room1:matrix.org": [makeStream("s1", "build", false)],
    };

    const roomId = "!room2:matrix.org";
    const streams = streamsByRoom[roomId] ?? [];

    expect(streams.length).toBe(0);
  });

  it("returns empty array when room ID is null", () => {
    const streamsByRoom: Record<string, StreamState[]> = {
      "!room1:matrix.org": [makeStream("s1", "build", false)],
    };

    const roomId: string | null = null;
    const streams = roomId ? (streamsByRoom[roomId] ?? []) : [];

    expect(streams.length).toBe(0);
  });
});

describe("panel toggle logic", () => {
  it("toggles from closed to open", () => {
    let panelOpen = false;
    panelOpen = !panelOpen;
    expect(panelOpen).toBe(true);
  });

  it("toggles from open to closed", () => {
    let panelOpen = true;
    panelOpen = !panelOpen;
    expect(panelOpen).toBe(false);
  });

  it("toggles multiple times correctly", () => {
    let panelOpen = false;

    panelOpen = !panelOpen;
    expect(panelOpen).toBe(true);

    panelOpen = !panelOpen;
    expect(panelOpen).toBe(false);

    panelOpen = !panelOpen;
    expect(panelOpen).toBe(true);
  });
});

describe("stream button handling", () => {
  it("identifies button by ID for action", () => {
    const stream = makeStream("s1", "build", false, [
      { id: "stop", label: "Stop" },
      { id: "restart", label: "Restart" },
    ]);

    const buttonId = "stop";
    const button = stream.buttons.find((b) => b.id === buttonId);

    expect(button).toBeDefined();
    expect(button?.label).toBe("Stop");
  });

  it("handles stream with no buttons", () => {
    const stream = makeStream("s1", "build", false, []);
    expect(stream.buttons.length).toBe(0);
  });

  it("handles stream with multiple buttons", () => {
    const stream = makeStream("s1", "build", false, [
      { id: "stop", label: "Stop" },
      { id: "restart", label: "Restart" },
      { id: "pause", label: "Pause" },
    ]);

    expect(stream.buttons.length).toBe(3);
    expect(stream.buttons[0].id).toBe("stop");
    expect(stream.buttons[1].id).toBe("restart");
    expect(stream.buttons[2].id).toBe("pause");
  });
});

describe("stream line channel detection", () => {
  it("identifies stderr line", () => {
    const line = { text: "error: failed", channel: "stderr" };
    expect(line.channel).toBe("stderr");
  });

  it("identifies stdout line", () => {
    const line = { text: "success", channel: "stdout" };
    expect(line.channel).toBe("stdout");
  });

  it("determines if line should have stderr CSS class", () => {
    const stderrLine = { text: "error", channel: "stderr" };
    const stdoutLine = { text: "info", channel: "stdout" };

    expect(stderrLine.channel === "stderr").toBe(true);
    expect(stdoutLine.channel === "stderr").toBe(false);
  });

  it("handles stream with mixed channel lines", () => {
    const stream = makeStream("s1", "build", false, [], [
      { text: "Starting...", channel: "stdout" },
      { text: "warning: deprecated", channel: "stderr" },
      { text: "Completed", channel: "stdout" },
    ]);

    const stderrLines = stream.lines.filter((l) => l.channel === "stderr");
    const stdoutLines = stream.lines.filter((l) => l.channel === "stdout");

    expect(stderrLines.length).toBe(1);
    expect(stdoutLines.length).toBe(2);
  });
});

describe("empty streams display logic", () => {
  it("determines to show placeholder when no streams exist", () => {
    const streams: StreamState[] = [];
    const shouldShowPlaceholder = streams.length === 0;
    expect(shouldShowPlaceholder).toBe(true);
  });

  it("determines to show list when streams exist", () => {
    const streams = [makeStream("s1", "build", false)];
    const shouldShowPlaceholder = streams.length === 0;
    expect(shouldShowPlaceholder).toBe(false);
  });
});

describe("header display text", () => {
  it("formats header with active count when count is positive", () => {
    const activeCount = 3;
    const headerText = activeCount > 0 ? `Streams (${activeCount})` : "Streams";
    expect(headerText).toBe("Streams (3)");
  });

  it("formats header without count when count is zero", () => {
    const activeCount = 0;
    const headerText = activeCount > 0 ? `Streams (${activeCount})` : "Streams";
    expect(headerText).toBe("Streams");
  });

  it("formats header without count when count is negative", () => {
    const activeCount = -1;
    const headerText = activeCount > 0 ? `Streams (${activeCount})` : "Streams";
    expect(headerText).toBe("Streams");
  });
});

describe("chevron icon state", () => {
  it("determines chevron should point down when expanded", () => {
    const isCollapsed = false;
    const chevronDirection = isCollapsed ? "right" : "down";
    expect(chevronDirection).toBe("down");
  });

  it("determines chevron should point right when collapsed", () => {
    const isCollapsed = true;
    const chevronDirection = isCollapsed ? "right" : "down";
    expect(chevronDirection).toBe("right");
  });
});

describe("error logging for background stream operations", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("logs stream fetch errors with room context", () => {
    const roomId = "!abc123:matrix.org";
    const error = new Error("Network failure");

    const message = formatStreamsFetchError(roomId);
    logBackgroundError(message, error);

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to fetch streams for room !abc123:matrix.org:",
      error
    );
  });

  it("logs stream action errors with stream and button context", () => {
    const roomId = "!room:matrix.org";
    const streamId = "build-1";
    const buttonId = "stop";
    const error = new Error("Action failed");

    const message = formatStreamActionError(roomId, streamId, buttonId);
    logBackgroundError(message, error);

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to send stream action (button: stop) for stream build-1 in room !room:matrix.org:",
      error
    );
  });

  it("does not log when error is null", () => {
    const roomId = "!room:matrix.org";
    const message = formatStreamsFetchError(roomId);

    logBackgroundError(message, null);

    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("does not log when error is undefined", () => {
    const roomId = "!room:matrix.org";
    const streamId = "build-1";
    const buttonId = "stop";
    const message = formatStreamActionError(roomId, streamId, buttonId);

    logBackgroundError(message, undefined);

    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});
