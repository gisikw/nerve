// Fake backend client — browser side.
//
// When Tauri is absent, fakeInvoke routes Elm commands to the Vite dev
// server's fake backend (POST /fake/command). The server holds state and
// also exposes a WebSocket + HTTP driver for external test scripts.
//
// This keeps the browser stateless — all truth lives in the Vite process,
// accessible to both the browser and the driver.

export async function fakeInvoke(
  command: string,
  args: Record<string, unknown> = {},
): Promise<unknown> {
  const res = await fetch("/fake/command", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command, args }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Fake backend error: ${err}`);
  }

  return res.json();
}
