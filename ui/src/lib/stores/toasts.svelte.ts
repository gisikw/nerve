// Toast notification state management.
// Manages a queue of transient error/info messages displayed to the user.

export interface Toast {
  id: string;
  message: string;
  type: "error" | "info";
  duration: number;
}

// --- State ---

let toasts = $state<Toast[]>([]);
let nextId = 1;

// --- Public API ---

export function getToasts(): Toast[] {
  return toasts;
}

export function showToast(
  message: string,
  type: "error" | "info" = "error",
  duration = 5000,
): void {
  const id = `toast-${nextId++}`;
  const toast: Toast = { id, message, type, duration };
  toasts = [...toasts, toast];

  // Auto-dismiss after duration
  setTimeout(() => {
    dismissToast(id);
  }, duration);
}

export function dismissToast(id: string): void {
  toasts = toasts.filter((t) => t.id !== id);
}

export function showError(message: string): void {
  showToast(message, "error");
}

export function showInfo(message: string): void {
  showToast(message, "info");
}
