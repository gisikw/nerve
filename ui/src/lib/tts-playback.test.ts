import { describe, it, expect } from "vitest";
import {
  ttsQueueOps,
  shouldStartPlayback,
  truncateForTTS,
  type TTSPlaybackState,
} from "./tts-playback";

/**
 * Tests for TTS playback queue logic.
 *
 * The queue manages audio clips that are played sequentially.
 * Audio is enqueued when speak button is clicked, dequeued when playback
 * starts, and can be cleared with stopAll.
 */

describe("TTS queue operations", () => {
  it("enqueue adds audio to empty queue", () => {
    const state: TTSPlaybackState = { queue: [], isPlaying: false };
    const result = ttsQueueOps.enqueue("audio1", state);
    expect(result.queue).toEqual(["audio1"]);
    expect(result.isPlaying).toBe(false);
  });

  it("enqueue appends to existing queue", () => {
    const state: TTSPlaybackState = { queue: ["audio1"], isPlaying: true };
    const result = ttsQueueOps.enqueue("audio2", state);
    expect(result.queue).toEqual(["audio1", "audio2"]);
    expect(result.isPlaying).toBe(true);
  });

  it("dequeue returns first item and removes it from queue", () => {
    const state: TTSPlaybackState = { queue: ["audio1", "audio2"], isPlaying: false };
    const result = ttsQueueOps.dequeue(state);
    expect(result.item).toBe("audio1");
    expect(result.state.queue).toEqual(["audio2"]);
  });

  it("dequeue returns null when queue is empty", () => {
    const state: TTSPlaybackState = { queue: [], isPlaying: false };
    const result = ttsQueueOps.dequeue(state);
    expect(result.item).toBeNull();
    expect(result.state.queue).toEqual([]);
  });

  it("stopAll clears queue and sets isPlaying to false", () => {
    const state: TTSPlaybackState = { queue: ["audio1", "audio2"], isPlaying: true };
    const result = ttsQueueOps.stopAll(state);
    expect(result.queue).toEqual([]);
    expect(result.isPlaying).toBe(false);
  });

  it("stopAll on empty queue is idempotent", () => {
    const state: TTSPlaybackState = { queue: [], isPlaying: false };
    const result = ttsQueueOps.stopAll(state);
    expect(result.queue).toEqual([]);
    expect(result.isPlaying).toBe(false);
  });
});

describe("shouldStartPlayback", () => {
  it("returns true when queue has items and not playing", () => {
    const state: TTSPlaybackState = { queue: ["audio1"], isPlaying: false };
    expect(shouldStartPlayback(state)).toBe(true);
  });

  it("returns false when queue is empty", () => {
    const state: TTSPlaybackState = { queue: [], isPlaying: false };
    expect(shouldStartPlayback(state)).toBe(false);
  });

  it("returns false when already playing", () => {
    const state: TTSPlaybackState = { queue: ["audio1"], isPlaying: true };
    expect(shouldStartPlayback(state)).toBe(false);
  });

  it("returns false when queue is empty and playing", () => {
    const state: TTSPlaybackState = { queue: [], isPlaying: true };
    expect(shouldStartPlayback(state)).toBe(false);
  });
});

describe("truncateForTTS", () => {
  it("returns text unchanged when under limit", () => {
    const text = "Hello, world!";
    expect(truncateForTTS(text)).toBe("Hello, world!");
  });

  it("returns text unchanged when exactly at limit", () => {
    const text = "a".repeat(500);
    expect(truncateForTTS(text)).toBe(text);
  });

  it("truncates text when over limit", () => {
    const text = "a".repeat(600);
    const result = truncateForTTS(text);
    expect(result.length).toBe(500);
    expect(result).toBe("a".repeat(500));
  });

  it("respects custom max length", () => {
    const text = "Hello, world!";
    const result = truncateForTTS(text, 5);
    expect(result).toBe("Hello");
  });

  it("handles empty string", () => {
    expect(truncateForTTS("")).toBe("");
  });
});
