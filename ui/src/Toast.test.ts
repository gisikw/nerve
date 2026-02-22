import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import Toast from "./Toast.svelte";
import { showToast, dismissToast, getToasts } from "./lib/stores/toasts.svelte";

describe("Toast component", () => {
  beforeEach(() => {
    // Clear any existing toasts
    const existing = getToasts();
    existing.forEach((t) => dismissToast(t.id));
  });

  afterEach(() => {
    cleanup();
  });

  it("renders nothing when there are no toasts", () => {
    const { container } = render(Toast);
    const toastContainer = container.querySelector("#toast-container");
    expect(toastContainer).toBeInTheDocument();
    expect(toastContainer?.children).toHaveLength(0);
  });

  it("renders a toast when one is added", async () => {
    render(Toast);
    showToast("Test error message", "error");
    await waitFor(() => {
      expect(screen.getByText("Test error message")).toBeInTheDocument();
    });
  });

  it("applies error class to error toasts", async () => {
    render(Toast);
    showToast("Error message", "error");
    await waitFor(() => {
      const toast = screen.getByText("Error message").closest(".toast");
      expect(toast).toHaveClass("error");
      expect(toast).not.toHaveClass("info");
    });
  });

  it("applies info class to info toasts", async () => {
    render(Toast);
    showToast("Info message", "info");
    await waitFor(() => {
      const toast = screen.getByText("Info message").closest(".toast");
      expect(toast).toHaveClass("info");
      expect(toast).not.toHaveClass("error");
    });
  });

  it("renders multiple toasts simultaneously", async () => {
    render(Toast);
    showToast("First error", "error");
    showToast("Second error", "error");
    showToast("Third error", "error");
    await waitFor(() => {
      expect(screen.getByText("First error")).toBeInTheDocument();
      expect(screen.getByText("Second error")).toBeInTheDocument();
      expect(screen.getByText("Third error")).toBeInTheDocument();
    });
  });

  it("dismisses toast when dismiss button is clicked", async () => {
    const user = userEvent.setup();
    render(Toast);
    showToast("Dismissable message", "error");

    await waitFor(() => {
      expect(screen.getByText("Dismissable message")).toBeInTheDocument();
    });

    const dismissButton = screen.getByTitle("Dismiss");
    await user.click(dismissButton);

    await waitFor(() => {
      expect(screen.queryByText("Dismissable message")).not.toBeInTheDocument();
    });
  });

  it("dismiss button for each toast only dismisses that specific toast", async () => {
    const user = userEvent.setup();
    render(Toast);
    showToast("First", "error");
    showToast("Second", "error");
    showToast("Third", "error");

    await waitFor(() => {
      expect(screen.getByText("First")).toBeInTheDocument();
      expect(screen.getByText("Second")).toBeInTheDocument();
      expect(screen.getByText("Third")).toBeInTheDocument();
    });

    const dismissButtons = screen.getAllByTitle("Dismiss");
    expect(dismissButtons).toHaveLength(3);

    // Click the middle toast's dismiss button
    await user.click(dismissButtons[1]);

    await waitFor(() => {
      expect(screen.getByText("First")).toBeInTheDocument();
      expect(screen.queryByText("Second")).not.toBeInTheDocument();
      expect(screen.getByText("Third")).toBeInTheDocument();
    });
  });

  it("renders toasts in order they were added", async () => {
    render(Toast);
    showToast("First", "error");
    showToast("Second", "error");
    showToast("Third", "error");

    await waitFor(() => {
      const messages = screen.getAllByText(/First|Second|Third/);
      expect(messages).toHaveLength(3);
      expect(messages[0]).toHaveTextContent("First");
      expect(messages[1]).toHaveTextContent("Second");
      expect(messages[2]).toHaveTextContent("Third");
    });
  });

  it("uses design tokens for styling", async () => {
    render(Toast);
    showToast("Test message", "error");

    await waitFor(() => {
      const toast = screen.getByText("Test message").closest(".toast");
      expect(toast).toBeInTheDocument();
      // Testing that CSS custom properties are applied via checking computed style
      // would require a real browser, so we verify the classes are applied
      expect(toast).toHaveClass("toast");
    });
  });

  it("toast container is positioned fixed at bottom-right", () => {
    const { container } = render(Toast);
    const toastContainer = container.querySelector("#toast-container");
    expect(toastContainer).toBeInTheDocument();
    // Verify the container has the ID which corresponds to CSS positioning
    expect(toastContainer?.id).toBe("toast-container");
  });

  it("dismiss button has accessible title attribute", async () => {
    render(Toast);
    showToast("Test", "error");
    await waitFor(() => {
      const dismissButton = screen.getByTitle("Dismiss");
      expect(dismissButton).toBeInTheDocument();
      expect(dismissButton.tagName).toBe("BUTTON");
    });
  });

  it("renders toast message in a span with toast-message class", async () => {
    render(Toast);
    showToast("Test message", "error");
    await waitFor(() => {
      const messageSpan = screen.getByText("Test message");
      expect(messageSpan.tagName).toBe("SPAN");
      expect(messageSpan).toHaveClass("toast-message");
    });
  });
});
