import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import Login from "./Login.svelte";
import type { SessionState } from "./lib/stores/session.svelte";

describe("Login component", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Clean up rendered components after each test
    cleanup();
  });

  describe("rendering with props", () => {
    it("renders the login form with all input fields", () => {
      const session: SessionState = { status: "logged_out" };
      const onLogin = vi.fn();

      render(Login, { props: { session, onLogin } });

      expect(screen.getByLabelText("Homeserver")).toBeInTheDocument();
      expect(screen.getByLabelText("Username")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
    });

    it("displays error message when session status is error", () => {
      const session: SessionState = {
        status: "error",
        message: "Invalid credentials",
      };
      const onLogin = vi.fn();

      render(Login, { props: { session, onLogin } });

      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
      expect(screen.getByText("Invalid credentials")).toHaveClass("error");
    });

    it("shows loading state when logging in", async () => {
      const session: SessionState = { status: "logging_in" };
      const onLogin = vi.fn();

      render(Login, { props: { session, onLogin } });

      // Svelte 5 reactivity is synchronous, but wait for DOM updates to complete
      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Logging in..." })).toBeDisabled();
      });

      expect(screen.getByLabelText("Homeserver")).toBeDisabled();
      expect(screen.getByLabelText("Username")).toBeDisabled();
      expect(screen.getByLabelText("Password")).toBeDisabled();
    });
  });

  describe("user interaction", () => {
    it("calls onLogin with form values when submitted", async () => {
      const user = userEvent.setup();
      const session: SessionState = { status: "logged_out" };
      const onLogin = vi.fn();

      render(Login, { props: { session, onLogin } });

      await user.type(screen.getByLabelText("Homeserver"), "matrix.example.com");
      await user.type(screen.getByLabelText("Username"), "alice");
      await user.type(screen.getByLabelText("Password"), "secret123");
      await user.click(screen.getByRole("button", { name: "Login" }));

      expect(onLogin).toHaveBeenCalledWith(
        "matrix.example.com",
        "alice",
        "secret123",
      );
      expect(onLogin).toHaveBeenCalledTimes(1);
    });

    it("does not call onLogin when form is incomplete", async () => {
      const user = userEvent.setup();
      const session: SessionState = { status: "logged_out" };
      const onLogin = vi.fn();

      render(Login, { props: { session, onLogin } });

      await user.type(screen.getByLabelText("Homeserver"), "matrix.example.com");
      // Username and password are empty
      await user.click(screen.getByRole("button", { name: "Login" }));

      expect(onLogin).not.toHaveBeenCalled();
    });

    it("persists homeserver to localStorage on submit", async () => {
      const user = userEvent.setup();
      const session: SessionState = { status: "logged_out" };
      const onLogin = vi.fn();

      render(Login, { props: { session, onLogin } });

      await user.type(screen.getByLabelText("Homeserver"), "matrix.example.com");
      await user.type(screen.getByLabelText("Username"), "alice");
      await user.type(screen.getByLabelText("Password"), "secret123");
      await user.click(screen.getByRole("button", { name: "Login" }));

      expect(localStorage.getItem("nerve-homeserver")).toBe("matrix.example.com");
    });

    it("loads homeserver from localStorage on mount", () => {
      localStorage.setItem("nerve-homeserver", "matrix.saved.com");

      const session: SessionState = { status: "logged_out" };
      const onLogin = vi.fn();

      render(Login, { props: { session, onLogin } });

      const homeserverInput = screen.getByLabelText("Homeserver") as HTMLInputElement;
      expect(homeserverInput.value).toBe("matrix.saved.com");
    });
  });

  describe("accessibility", () => {
    it("uses semantic form elements", () => {
      const session: SessionState = { status: "logged_out" };
      const onLogin = vi.fn();

      const { container } = render(Login, { props: { session, onLogin } });

      expect(container.querySelector("form")).toBeInTheDocument();
      expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
    });

    it("associates labels with inputs correctly", () => {
      const session: SessionState = { status: "logged_out" };
      const onLogin = vi.fn();

      render(Login, { props: { session, onLogin } });

      const homeserverInput = screen.getByLabelText("Homeserver");
      const usernameInput = screen.getByLabelText("Username");
      const passwordInput = screen.getByLabelText("Password");

      expect(homeserverInput).toHaveAttribute("id", "homeserver");
      expect(usernameInput).toHaveAttribute("id", "username");
      expect(passwordInput).toHaveAttribute("id", "password");
    });

    it("uses appropriate input types", () => {
      const session: SessionState = { status: "logged_out" };
      const onLogin = vi.fn();

      render(Login, { props: { session, onLogin } });

      expect(screen.getByLabelText("Homeserver")).toHaveAttribute("type", "text");
      expect(screen.getByLabelText("Username")).toHaveAttribute("type", "text");
      expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
    });
  });
});
