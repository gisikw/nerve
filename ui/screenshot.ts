#!/usr/bin/env npx tsx
// Screenshot pipeline for Nerve UI.
//
// Captures the UI running against the fake backend. Starts a Vite dev
// server, optionally drives the fake backend into a specific state, then
// takes a screenshot with headless Chromium.
//
// Usage:
//   npx tsx screenshot.ts [options]
//
// Options:
//   --output, -o <path>   Output file path (required)
//   --width <px>          Viewport width (default: 1280)
//   --height <px>         Viewport height (default: 800)
//   --room <name>         Select a room by sidebar text (e.g. "nerve", "Exo")
//   --scene <name>        Load a predefined scene (see SCENES below)
//   --delay <ms>          Extra delay before capture (default: 500)
//   --vite-url <url>      Connect to existing Vite server instead of starting one

import { execSync, spawn, type ChildProcess } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer-core";

// --- Config ---

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CHROMIUM_PATH = execSync(
  "find /nix/store -maxdepth 3 -path '*/bin/chromium' -type f 2>/dev/null | head -1"
).toString().trim();
const VITE_PORT = 3000;
const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 800;
const DEFAULT_DELAY = 500;

// --- Args ---

function parseArgs(): Record<string, string> {
  const args: Record<string, string> = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--output" || arg === "-o") args.output = argv[++i];
    else if (arg === "--width") args.width = argv[++i];
    else if (arg === "--height") args.height = argv[++i];
    else if (arg === "--room") args.room = argv[++i];
    else if (arg === "--scene") args.scene = argv[++i];
    else if (arg === "--delay") args.delay = argv[++i];
    else if (arg === "--vite-url") args.viteUrl = argv[++i];
  }
  return args;
}

// --- Scenes ---

interface DriverAction {
  action: string;
  [key: string]: unknown;
}

const SCENES: Record<string, DriverAction[]> = {
  // Default: seed data, select nerve room
  default: [],

  // Empty state: reset and show login page
  login: [
    { action: "reset" },
    { action: "set_session", loggedIn: false, userId: null },
  ],

  // Busy: lots of notifications
  busy: [
    { action: "set_notification_count", roomId: "!nerve:example.chat", count: 12 },
    { action: "set_notification_count", roomId: "!ops:example.chat", count: 5 },
    { action: "set_notification_count", roomId: "!exo-dm:example.chat", count: 3 },
  ],

  // Fresh: reset to clean seed data
  fresh: [
    { action: "reset" },
  ],
};

// --- Driver ---

async function driveAction(baseUrl: string, action: DriverAction): Promise<void> {
  const res = await fetch(`${baseUrl}/fake/driver`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(action),
  });
  const result = await res.json();
  if (!result.ok && result.error) {
    console.error(`Driver action failed: ${result.error}`);
  }
}

// --- Vite server management ---

function startVite(): ChildProcess {
  const child = spawn("npx", ["vite", "--port", String(VITE_PORT)], {
    cwd: __dirname,
    stdio: ["ignore", "pipe", "pipe"],
  });
  return child;
}

async function waitForVite(url: string, timeoutMs = 15000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await fetch(url);
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  throw new Error(`Vite server not ready after ${timeoutMs}ms`);
}

// --- Main ---

async function main() {
  const args = parseArgs();
  const width = parseInt(args.width ?? String(DEFAULT_WIDTH));
  const height = parseInt(args.height ?? String(DEFAULT_HEIGHT));
  const delay = parseInt(args.delay ?? String(DEFAULT_DELAY));
  const baseUrl = args.viteUrl ?? `http://localhost:${VITE_PORT}`;

  // Start Vite if not connecting to existing
  let viteProcess: ChildProcess | null = null;
  if (!args.viteUrl) {
    console.log("[screenshot] Starting Vite dev server...");
    viteProcess = startVite();
    await waitForVite(baseUrl);
    console.log("[screenshot] Vite ready.");
  }

  try {
    // Apply scene
    const sceneName = args.scene ?? "default";
    const scene = SCENES[sceneName];
    if (!scene) {
      console.error(`Unknown scene: ${sceneName}. Available: ${Object.keys(SCENES).join(", ")}`);
      process.exit(1);
    }
    if (scene.length > 0) {
      console.log(`[screenshot] Applying scene: ${sceneName}`);
      for (const action of scene) {
        await driveAction(baseUrl, action);
      }
    }

    // Launch browser
    console.log("[screenshot] Launching headless Chromium...");
    const browser = await puppeteer.launch({
      executablePath: CHROMIUM_PATH,
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-gpu",
        "--disable-dev-shm-usage",
        `--window-size=${width},${height}`,
      ],
    });

    const page = await browser.newPage();
    await page.setViewport({ width, height });
    await page.goto(baseUrl, { waitUntil: "networkidle0" });

    // Wait for the app to process the checkSession response and render.
    // The fetch completes during networkidle0 but the app needs a frame
    // to process the response and re-render.
    await new Promise((r) => setTimeout(r, 1000));

    // Select room if requested (match by visible sidebar text)
    if (args.room) {
      await page.waitForSelector("#room-list li", { timeout: 5000 });
      await page.evaluate((name: string) => {
        const items = document.querySelectorAll("#room-list li");
        for (const item of items) {
          if (item.textContent?.includes(name)) {
            (item as HTMLElement).click();
            return;
          }
        }
      }, args.room);
      // Wait for messages to load
      await new Promise((r) => setTimeout(r, 1000));
    }

    // Extra delay for rendering
    await new Promise((r) => setTimeout(r, delay));

    if (!args.output) {
      console.error("Error: --output (-o) is required");
      process.exit(1);
    }
    const outputPath = args.output;

    await page.screenshot({ path: outputPath, fullPage: false });
    console.log(`[screenshot] Saved: ${outputPath}`);

    await browser.close();
  } finally {
    if (viteProcess) {
      viteProcess.kill();
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
