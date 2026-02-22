import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getToasts,
  showToast,
  dismissToast,
  showError,
  showInfo,
} from "./toasts.svelte";

describe("Toast store", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Clear any existing toasts
    const existing = getToasts();
    existing.forEach((t) => dismissToast(t.id));
    // Clear any pending timers from previous tests
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.restoreAllMocks();
  });

  it("starts with no toasts", () => {
    expect(getToasts()).toEqual([]);
  });

  it("adds a toast with showToast", () => {
    showToast("Test message", "error", 5000);
    const toasts = getToasts();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe("Test message");
    expect(toasts[0].type).toBe("error");
    expect(toasts[0].duration).toBe(5000);
    expect(toasts[0].id).toMatch(/^toast-\d+$/);
  });

  it("generates unique IDs for each toast", () => {
    showToast("First", "error");
    showToast("Second", "error");
    const toasts = getToasts();
    expect(toasts).toHaveLength(2);
    expect(toasts[0].id).not.toBe(toasts[1].id);
  });

  it("defaults to error type and 5000ms duration", () => {
    showToast("Test");
    const toasts = getToasts();
    expect(toasts[0].type).toBe("error");
    expect(toasts[0].duration).toBe(5000);
  });

  it("dismisses a toast by ID", () => {
    showToast("Test message");
    const toasts = getToasts();
    const id = toasts[0].id;
    dismissToast(id);
    expect(getToasts()).toEqual([]);
  });

  it("auto-dismisses toast after duration", () => {
    showToast("Test message", "error", 3000);
    expect(getToasts()).toHaveLength(1);
    vi.advanceTimersByTime(2999);
    expect(getToasts()).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(getToasts()).toEqual([]);
  });

  it("supports multiple toasts simultaneously", () => {
    showToast("First");
    showToast("Second");
    showToast("Third");
    expect(getToasts()).toHaveLength(3);
  });

  it("dismisses only the specified toast", () => {
    showToast("First");
    showToast("Second");
    showToast("Third");
    const toasts = getToasts();
    dismissToast(toasts[1].id);
    const remaining = getToasts();
    expect(remaining).toHaveLength(2);
    expect(remaining[0].message).toBe("First");
    expect(remaining[1].message).toBe("Third");
  });

  it("showError creates an error toast", () => {
    showError("Error message");
    const toasts = getToasts();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe("Error message");
    expect(toasts[0].type).toBe("error");
    expect(toasts[0].duration).toBe(5000);
  });

  it("showInfo creates an info toast", () => {
    showInfo("Info message");
    const toasts = getToasts();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe("Info message");
    expect(toasts[0].type).toBe("info");
    expect(toasts[0].duration).toBe(5000);
  });

  it("does nothing when dismissing non-existent toast", () => {
    showToast("Test");
    dismissToast("nonexistent-id");
    expect(getToasts()).toHaveLength(1);
  });

  it("handles rapid sequential additions", () => {
    for (let i = 0; i < 10; i++) {
      showToast(`Message ${i}`);
    }
    expect(getToasts()).toHaveLength(10);
  });

  it("auto-dismisses each toast independently", () => {
    // Create three toasts with different durations so they expire at different times
    // First: 1000ms duration (expires at t=1000)
    // Second: 2000ms duration (expires at t=2000)
    // Third: 3000ms duration (expires at t=3000)
    showToast("First", "error", 1000);
    showToast("Second", "error", 2000);
    showToast("Third", "error", 3000);

    // All three should be present initially
    expect(getToasts()).toHaveLength(3);

    // First should dismiss at t=1000
    vi.advanceTimersByTime(999);
    expect(getToasts()).toHaveLength(3);
    vi.advanceTimersByTime(1);
    expect(getToasts()).toHaveLength(2);
    expect(getToasts()[0].message).toBe("Second");
    expect(getToasts()[1].message).toBe("Third");

    // Second should dismiss at t=2000 (1000ms from now)
    vi.advanceTimersByTime(999);
    expect(getToasts()).toHaveLength(2);
    vi.advanceTimersByTime(1);
    expect(getToasts()).toHaveLength(1);
    expect(getToasts()[0].message).toBe("Third");

    // Third should dismiss at t=3000 (1000ms from now)
    vi.advanceTimersByTime(999);
    expect(getToasts()).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(getToasts()).toEqual([]);
  });
});
