import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import ComposeBar from "./ComposeBar.svelte";
import * as tauri from "./lib/tauri";
import * as roomsStore from "./lib/stores/rooms.svelte";

/**
 * Tests for ComposeBar component voice recording.
 *
 * Related spec: specs/message_compose.feature
 * Scenarios: Voice recording (lines 98-194)
 */

describe("ComposeBar component voice recording", () => {
  let mockMediaRecorder: MediaRecorder;
  let mockStream: MediaStream;
  let getUserMediaSpy: ReturnType<typeof vi.fn>;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Mock Tauri commands
    vi.spyOn(tauri, "sendMessage").mockResolvedValue(undefined);
    vi.spyOn(tauri, "sendTypingNotice").mockResolvedValue(undefined);
    vi.spyOn(tauri, "sendVoiceMessage").mockResolvedValue(undefined);

    // Mock room store to return a selected room
    vi.spyOn(roomsStore, "getSelectedRoomId").mockReturnValue("!test:example.com");

    // Mock console methods
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    // Create mock MediaStream
    mockStream = {
      getTracks: vi.fn(() => [
        { stop: vi.fn() } as unknown as MediaStreamTrack,
      ]),
    } as unknown as MediaStream;

    // Create mock MediaRecorder
    const dataListeners: Array<(e: BlobEvent) => void> = [];
    const stopListeners: Array<(e: Event) => void> = [];

    mockMediaRecorder = {
      state: "inactive",
      start: vi.fn(),
      stop: vi.fn(),
      addEventListener: vi.fn(),
      ondataavailable: null,
      onstop: null,
    } as unknown as MediaRecorder;

    // Mock getUserMedia
    getUserMediaSpy = vi.fn(() => Promise.resolve(mockStream));
    Object.defineProperty(navigator, "mediaDevices", {
      value: {
        getUserMedia: getUserMediaSpy,
      },
      configurable: true,
      writable: true,
    });

    // Mock MediaRecorder constructor
    global.MediaRecorder = vi.fn((stream, options) => {
      dataListeners.length = 0;
      stopListeners.length = 0;

      mockMediaRecorder = {
        state: "inactive",
        start: vi.fn(function (this: MediaRecorder) {
          this.state = "recording";
        }),
        stop: vi.fn(function (this: MediaRecorder) {
          this.state = "inactive";
          // Trigger stop event
          setTimeout(() => {
            stopListeners.forEach(listener => listener(new Event("stop")));
          }, 0);
        }),
        addEventListener: vi.fn((event, handler) => {
          if (event === "dataavailable") {
            dataListeners.push(handler);
          } else if (event === "stop") {
            stopListeners.push(handler);
          }
        }),
        ondataavailable: null,
        onstop: null,
        triggerDataAvailable: (blob: Blob) => {
          const event = { data: blob } as BlobEvent;
          dataListeners.forEach(listener => listener(event));
        },
      } as unknown as MediaRecorder & { triggerDataAvailable: (blob: Blob) => void };
      return mockMediaRecorder;
    }) as any;

    // Mock MediaRecorder.isTypeSupported
    MediaRecorder.isTypeSupported = vi.fn((type: string) => {
      return type === "audio/webm;codecs=opus" || type === "audio/webm";
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("starts voice recording when microphone button is clicked", async () => {
    const user = userEvent.setup();
    render(ComposeBar);

    const voiceBtn = screen.getByTitle("Record voice message");
    await user.click(voiceBtn);

    // Verify microphone access was requested
    expect(getUserMediaSpy).toHaveBeenCalledWith({ audio: true });

    // Verify MediaRecorder was created and started
    expect(mockMediaRecorder.start).toHaveBeenCalled();

    // Button should change to stop icon
    await waitFor(() => {
      expect(screen.getByTitle("Stop recording")).toBeInTheDocument();
    });
  });

  it("stops voice recording and sends when stop button is clicked", async () => {
    const user = userEvent.setup();
    render(ComposeBar);

    // Track MediaStream.getTracks() call
    const mockTrack = { stop: vi.fn() };
    const getTracksSpy = vi.fn(() => [mockTrack]);
    mockStream.getTracks = getTracksSpy as any;

    // Start recording
    const voiceBtn = screen.getByTitle("Record voice message");
    await user.click(voiceBtn);

    // Wait for recording to start
    await waitFor(() => {
      expect(screen.getByTitle("Stop recording")).toBeInTheDocument();
    });

    // Simulate audio data
    const audioBlob = new Blob(["audio data"], { type: "audio/webm;codecs=opus" });
    (mockMediaRecorder as any).triggerDataAvailable(audioBlob);

    // Stop recording
    const stopBtn = screen.getByTitle("Stop recording");
    await user.click(stopBtn);

    // Verify voice message was sent
    await waitFor(() => {
      expect(tauri.sendVoiceMessage).toHaveBeenCalled();
    }, { timeout: 2000 });

    // Verify stream tracks were stopped
    await waitFor(() => {
      expect(mockTrack.stop).toHaveBeenCalled();
    });

    // Button should revert to microphone icon
    await waitFor(() => {
      expect(screen.getByTitle("Record voice message")).toBeInTheDocument();
    });
  });

  it("does not start recording when no room is selected", async () => {
    vi.spyOn(roomsStore, "getSelectedRoomId").mockReturnValue(null);

    const user = userEvent.setup();
    render(ComposeBar);

    const voiceBtn = screen.getByTitle("Record voice message");
    await user.click(voiceBtn);

    // Verify microphone access was NOT requested
    expect(getUserMediaSpy).not.toHaveBeenCalled();

    // Verify warning was logged
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "Cannot start recording: no room selected",
    );
  });

  it("uses opus codec when supported", async () => {
    const user = userEvent.setup();
    render(ComposeBar);

    const voiceBtn = screen.getByTitle("Record voice message");
    await user.click(voiceBtn);

    // Verify MediaRecorder was created with opus codec
    await waitFor(() => {
      expect(global.MediaRecorder).toHaveBeenCalledWith(
        mockStream,
        { mimeType: "audio/webm;codecs=opus" },
      );
    });
  });

  it("falls back to audio/webm when opus is not supported", async () => {
    // Mock isTypeSupported to return false for opus
    MediaRecorder.isTypeSupported = vi.fn((type: string) => {
      return type === "audio/webm";
    });

    const user = userEvent.setup();
    render(ComposeBar);

    const voiceBtn = screen.getByTitle("Record voice message");
    await user.click(voiceBtn);

    // Verify MediaRecorder was created with fallback codec
    await waitFor(() => {
      expect(global.MediaRecorder).toHaveBeenCalledWith(
        mockStream,
        { mimeType: "audio/webm" },
      );
    });
  });

  it("tracks recording duration", async () => {
    // Mock Date.now BEFORE rendering to control the timing
    let currentTime = 1000;
    vi.spyOn(Date, 'now').mockImplementation(() => currentTime);

    const user = userEvent.setup();
    render(ComposeBar);

    // Start recording (this will capture currentTime = 1000 as recordingStartTime)
    const voiceBtn = screen.getByTitle("Record voice message");
    await user.click(voiceBtn);

    await waitFor(() => {
      expect(screen.getByTitle("Stop recording")).toBeInTheDocument();
    });

    // Advance time by 5 seconds
    currentTime = 6000;

    // Simulate audio data
    const audioBlob = new Blob(["audio data"], { type: "audio/webm;codecs=opus" });
    (mockMediaRecorder as any).triggerDataAvailable(audioBlob);

    // Stop recording (this will calculate duration as 6000 - 1000 = 5000)
    const stopBtn = screen.getByTitle("Stop recording");
    await user.click(stopBtn);

    // Verify voice message was sent with correct duration (5000ms)
    await waitFor(() => {
      const calls = (tauri.sendVoiceMessage as any).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const lastCall = calls[calls.length - 1];
      expect(lastCall[4]).toBe(5000); // duration argument
    }, { timeout: 2000 });
  });

  it("logs error when microphone permission is denied", async () => {
    // Mock getUserMedia to reject
    getUserMediaSpy = vi.fn(() => Promise.reject(new Error("Permission denied")));
    Object.defineProperty(navigator, "mediaDevices", {
      value: { getUserMedia: getUserMediaSpy },
      configurable: true,
      writable: true,
    });

    const user = userEvent.setup();
    render(ComposeBar);

    const voiceBtn = screen.getByTitle("Record voice message");
    await user.click(voiceBtn);

    // Verify error was logged
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to start voice recording:",
        expect.any(Error),
      );
    });

    // Recording should not start
    expect(mockMediaRecorder.start).not.toHaveBeenCalled();
  });

  it("does not send voice message when no audio data is recorded", async () => {
    const user = userEvent.setup();
    render(ComposeBar);

    // Start recording
    const voiceBtn = screen.getByTitle("Record voice message");
    await user.click(voiceBtn);

    await waitFor(() => {
      expect(screen.getByTitle("Stop recording")).toBeInTheDocument();
    });

    // Stop recording without adding audio data
    const stopBtn = screen.getByTitle("Stop recording");
    await user.click(stopBtn);

    // Verify warning was logged
    await waitFor(() => {
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Voice recording stopped with no audio data",
      );
    });

    // Verify voice message was NOT sent
    expect(tauri.sendVoiceMessage).not.toHaveBeenCalled();
  });

  it("cleans up media stream tracks when recording stops", async () => {
    const user = userEvent.setup();

    // Track MediaStream.getTracks() call
    const mockTrack = { stop: vi.fn() };
    const getTracksSpy = vi.fn(() => [mockTrack]);
    mockStream.getTracks = getTracksSpy as any;

    render(ComposeBar);

    // Start recording
    const voiceBtn = screen.getByTitle("Record voice message");
    await user.click(voiceBtn);

    await waitFor(() => {
      expect(screen.getByTitle("Stop recording")).toBeInTheDocument();
    });

    // Simulate audio data
    const audioBlob = new Blob(["audio data"], { type: "audio/webm;codecs=opus" });
    (mockMediaRecorder as any).triggerDataAvailable(audioBlob);

    // Stop recording
    const stopBtn = screen.getByTitle("Stop recording");
    await user.click(stopBtn);

    // Verify all stream tracks were stopped
    await waitFor(() => {
      expect(mockTrack.stop).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it("stops recording on component unmount", async () => {
    const user = userEvent.setup();
    const { unmount } = render(ComposeBar);

    // Start recording
    const voiceBtn = screen.getByTitle("Record voice message");
    await user.click(voiceBtn);

    await waitFor(() => {
      expect(screen.getByTitle("Stop recording")).toBeInTheDocument();
    });

    // Set recorder state to recording
    mockMediaRecorder.state = "recording";

    // Unmount component
    unmount();

    // Verify recording was stopped
    expect(mockMediaRecorder.stop).toHaveBeenCalled();
  });

  it("logs microphone access request", async () => {
    const user = userEvent.setup();
    render(ComposeBar);

    const voiceBtn = screen.getByTitle("Record voice message");
    await user.click(voiceBtn);

    // Verify log message
    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "Requesting microphone access...",
      );
    });
  });

  it("logs MIME type selection", async () => {
    const user = userEvent.setup();
    render(ComposeBar);

    const voiceBtn = screen.getByTitle("Record voice message");
    await user.click(voiceBtn);

    // Verify MIME type was logged
    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Starting voice recording with MIME type:"),
      );
    });
  });

  it("logs audio chunk reception", async () => {
    const user = userEvent.setup();
    render(ComposeBar);

    // Start recording
    const voiceBtn = screen.getByTitle("Record voice message");
    await user.click(voiceBtn);

    await waitFor(() => {
      expect(screen.getByTitle("Stop recording")).toBeInTheDocument();
    });

    // Simulate audio data
    const audioBlob = new Blob(["audio data"], { type: "audio/webm;codecs=opus" });
    (mockMediaRecorder as any).triggerDataAvailable(audioBlob);

    // Verify chunk was logged
    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Received audio chunk:"),
      );
    });
  });

  it("logs voice message send details", async () => {
    const user = userEvent.setup();
    render(ComposeBar);

    // Start recording
    const voiceBtn = screen.getByTitle("Record voice message");
    await user.click(voiceBtn);

    await waitFor(() => {
      expect(screen.getByTitle("Stop recording")).toBeInTheDocument();
    });

    // Simulate audio data
    const audioBlob = new Blob(["audio data"], { type: "audio/webm;codecs=opus" });
    (mockMediaRecorder as any).triggerDataAvailable(audioBlob);

    // Stop recording
    const stopBtn = screen.getByTitle("Stop recording");
    await user.click(stopBtn);

    // Verify send details were logged
    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Sending voice message:"),
      );
    });
  });

  it("logs error when voice message send fails", async () => {
    // Mock sendVoiceMessage to fail
    vi.spyOn(tauri, "sendVoiceMessage").mockRejectedValue(
      new Error("Send failed"),
    );

    const user = userEvent.setup();
    render(ComposeBar);

    // Start recording
    const voiceBtn = screen.getByTitle("Record voice message");
    await user.click(voiceBtn);

    await waitFor(() => {
      expect(screen.getByTitle("Stop recording")).toBeInTheDocument();
    });

    // Simulate audio data
    const audioBlob = new Blob(["audio data"], { type: "audio/webm;codecs=opus" });
    (mockMediaRecorder as any).triggerDataAvailable(audioBlob);

    // Stop recording
    const stopBtn = screen.getByTitle("Stop recording");
    await user.click(stopBtn);

    // Verify error was logged
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to send voice message:",
        expect.any(Error),
      );
    });
  });

  it("logs recording start", async () => {
    const user = userEvent.setup();
    render(ComposeBar);

    const voiceBtn = screen.getByTitle("Record voice message");
    await user.click(voiceBtn);

    // Verify start was logged
    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith("Voice recording started");
    });
  });

  it("logs recording stop", async () => {
    const user = userEvent.setup();
    render(ComposeBar);

    // Start recording
    const voiceBtn = screen.getByTitle("Record voice message");
    await user.click(voiceBtn);

    await waitFor(() => {
      expect(screen.getByTitle("Stop recording")).toBeInTheDocument();
    });

    // Simulate audio data
    const audioBlob = new Blob(["audio data"], { type: "audio/webm;codecs=opus" });
    (mockMediaRecorder as any).triggerDataAvailable(audioBlob);

    // Stop recording
    const stopBtn = screen.getByTitle("Stop recording");
    await user.click(stopBtn);

    // Verify stop was logged
    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith("Stopping voice recording...");
    });
  });
});
