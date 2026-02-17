// Vite plugin: fake backend server.
//
// In dev mode, this plugin:
// 1. Adds HTTP middleware for Elm commands (POST /fake/command)
// 2. Opens a WebSocket on port 3001 for external drivers (tests, Exo,
//    screenshot pipeline) to puppet the fake state.
//
// The state lives server-side in fake-state.ts. The browser's fake.ts
// calls fetch("/fake/command") instead of resolving locally.

import type { Plugin } from "vite";
import { WebSocketServer } from "ws";
import { handleCommand, handleDriverAction } from "./fake-state";

const DRIVER_PORT = 3001;

export default function fakeBackendPlugin(): Plugin {
  let wss: WebSocketServer | null = null;

  return {
    name: "nerve-fake-backend",
    apply: "serve",

    configureServer(server) {
      // --- HTTP middleware for Elm commands ---
      server.middlewares.use("/fake/command", (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end("Method not allowed");
          return;
        }

        let body = "";
        req.on("data", (chunk: Buffer) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          try {
            const { command, args } = JSON.parse(body);
            const result = handleCommand(command, args ?? {});
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(result));
          } catch (err) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: String(err) }));
          }
        });
      });

      // --- HTTP middleware for driver actions (alternative to WebSocket) ---
      server.middlewares.use("/fake/driver", (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end("Method not allowed");
          return;
        }

        let body = "";
        req.on("data", (chunk: Buffer) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          try {
            const action = JSON.parse(body);
            const result = handleDriverAction(action);
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(result));
          } catch (err) {
            res.statusCode = 400;
            res.end(JSON.stringify({ ok: false, error: String(err) }));
          }
        });
      });

      // --- WebSocket server for driver connections ---
      wss = new WebSocketServer({ port: DRIVER_PORT });

      wss.on("listening", () => {
        console.log(`[fake] Driver WebSocket listening on ws://localhost:${DRIVER_PORT}`);
      });

      wss.on("error", (err: NodeJS.ErrnoException) => {
        if (err.code === "EADDRINUSE") {
          console.warn(`[fake] Driver WebSocket port ${DRIVER_PORT} in use — WebSocket driver disabled. HTTP driver (/fake/driver) still works.`);
          wss = null;
        } else {
          throw err;
        }
      });

      wss.on("connection", (ws) => {
        ws.on("message", (data) => {
          try {
            const action = JSON.parse(data.toString());
            const result = handleDriverAction(action);
            ws.send(JSON.stringify(result));
          } catch (err) {
            ws.send(JSON.stringify({ ok: false, error: String(err) }));
          }
        });
      });
    },

    closeBundle() {
      wss?.close();
    },
  };
}
