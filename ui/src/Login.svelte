<script lang="ts">
  import type { SessionState } from "./lib/stores/session.svelte";

  let {
    session,
    onLogin,
  }: {
    session: SessionState;
    onLogin: (homeserver: string, username: string, password: string) => void;
  } = $props();

  let homeserver = $state("");
  let username = $state("");
  let password = $state("");

  function handleSubmit(e: Event) {
    e.preventDefault();
    if (!homeserver || !username || !password) return;
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
    />

    <label for="username">Username</label>
    <input
      id="username"
      type="text"
      bind:value={username}
      placeholder="alice"
    />

    <label for="password">Password</label>
    <input
      id="password"
      type="password"
      bind:value={password}
    />

    {#if session.status === "error"}
      <p class="error">{session.message}</p>
    {/if}

    <button type="submit" disabled={session.status === "logging_in"}>
      {session.status === "logging_in" ? "Logging in..." : "Login"}
    </button>
  </form>
</div>
