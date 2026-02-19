<script lang="ts">
  import type { SessionState } from "./lib/stores/session.svelte";

  const HOMESERVER_KEY = "nerve-homeserver";

  let {
    session,
    onLogin,
  }: {
    session: SessionState;
    onLogin: (homeserver: string, username: string, password: string) => void;
  } = $props();

  let homeserver = $state(localStorage.getItem(HOMESERVER_KEY) ?? "");
  let username = $state("");
  let password = $state("");

  let loading = $derived(session.status === "logging_in");

  function handleSubmit(e: Event) {
    e.preventDefault();
    if (!homeserver || !username || !password) return;
    localStorage.setItem(HOMESERVER_KEY, homeserver);
    onLogin(homeserver, username, password);
  }
</script>

<div id="login-view">
  <form id="login-form" onsubmit={handleSubmit}>
    <h1>Nerve</h1>

    <label for="homeserver">Homeserver</label>
    <input
      id="homeserver"
      type="text"
      bind:value={homeserver}
      placeholder="matrix.example.com"
      disabled={loading}
    />

    <label for="username">Username</label>
    <input
      id="username"
      type="text"
      bind:value={username}
      placeholder="alice"
      disabled={loading}
    />

    <label for="password">Password</label>
    <input
      id="password"
      type="password"
      bind:value={password}
      disabled={loading}
    />

    {#if session.status === "error"}
      <p class="error">{session.message}</p>
    {/if}

    <button type="submit" disabled={loading}>
      {loading ? "Logging in..." : "Login"}
    </button>
  </form>
</div>
